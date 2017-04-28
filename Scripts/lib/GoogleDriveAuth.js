Ext.ns('HttpCommander.Lib');

/**
 *  config:
 *  htcConfig, Msg, globalLoadMask, isDemoMode()
 *  see:
 *      https://developers.google.com/drive/v3/web/quickstart/js
 *      https://developers.google.com/api-client-library/javascript/start/start-js
 */
HttpCommander.Lib.GoogleDriveAuth = function (config) {
    // vars
    var cn = HttpCommander.Lib.Consts.CloudNames.google,
        clientId = config.htcConfig.googleClientId,
        scope = ['https://www.googleapis.com/auth/drive'], // see https://developers.google.com/drive/v3/web/about-auth#what_scope_or_scopes_does_my_app_need
        authInfo = null,
        aboutInfo = null,
        callbackForDown,
        callbackForUp,
        callbackForEdit,
        self, bris = HttpCommander.Lib.Utils.browserIs,
        googleAPILibLoaded = false,
        folderMimeType = 'application/vnd.google-apps.folder',
        queryFolders = "mimeType = '" + folderMimeType + "'",
        waitPopupAuthTimer = null,
        gCLNotLoadedMsg = String.format(config.htcConfig.locData.CloudLibraryNotLoadedMsg, cn),
        authFailedMsg = config.htcConfig.locData.CloudAuthNotCompleteMsg,
        trustedSitesMsg = (bris.ie || bris.edge) ? (config.htcConfig.locData.CloudTrustedSitesMsg
            + 'https://*.google.com<br />'
            + 'https://oauth.googleusercontent.com<br />'
            + 'https://*.gstatic.com<br />'
            + 'https://*.googleapis.com<br />'
            + (bris.edge ? ('<br />(' + config.htcConfig.locData.TrustedSitesForMicrosoftEdge + ')') : '')) : '';

    if (Ext.isEmpty(trustedSitesMsg)) {
        var brPos = authFailedMsg.toLowerCase().lastIndexOf('<br />');
        if (brPos > 0) {
            authFailedMsg = authFailedMsg.substring(0, brPos);
        }
    }

    // functions
    var getFileListImpl = function (callback, onlyFolders, folderId) {
        var params = {}, q = null;
        if (onlyFolders) {
            q = queryFolders;
        }
        if (folderId) {
            if (q && q.length > 0)
                q += " and ";
            else
                q = "";
            q += "'" + folderId + "' in parents";
        }
        if (q) {
            params['q'] = q;
        }
        // order by first folder and title
        // ATTENTION!
        // Please note that there is a current limitation for users with approximately
        // one million files in which the requested sort order is ignored.
        // see https://developers.google.com/drive/v2/reference/files/list#orderBy
        params['orderBy'] = 'folder,title';
        var retrievePageOfFiles = function (request, result) {
            request.execute(function (resp) {
                result = result.concat(resp.items);
                var nextPageToken = resp.nextPageToken;
                if (nextPageToken) {
                    params['pageToken'] = nextPageToken;
                    request = gapi.client.drive.files.list(params);
                    retrievePageOfFiles(request, result);
                } else {
                    config.globalLoadMask.hide();
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                    if (result.length == 1 && typeof result[0] == 'undefined') {
                        result = [];
                    }
                    if (typeof callback == 'function') {
                        callback(result);
                    }
                }
            });
        };
        config.globalLoadMask.show();
        var initialRequest = gapi.client.drive.files.list(params);
        retrievePageOfFiles(initialRequest, []);
    };
    var driveAPILoadedHandler = function (callback, onlyFolders, folderId, edit) {
        if (edit === true) {
            if (aboutInfo) {
                callback(authInfo);
            } else {
                var aboutRequest = gapi.client.drive.about.get();
                config.globalLoadMask.show();
                aboutRequest.execute(function (aboutResp) {
                    aboutInfo = aboutResp;
                    config.globalLoadMask.hide();
                    if (typeof callback == 'function') {
                        callback(authInfo);
                    }
                });
            }
        } else {
            if (folderId || (aboutInfo && (folderId = aboutInfo.rootFolderId))) {
                getFileListImpl(callback, onlyFolders, folderId);
            } else {
                var aboutRequest = gapi.client.drive.about.get();
                config.globalLoadMask.show();
                aboutRequest.execute(function (aboutResp) {
                    aboutInfo = aboutResp;
                    config.globalLoadMask.hide();
                    if (typeof callback == 'function') {
                        callback([{ 'id': aboutInfo.rootFolderId }]);
                    }
                });
            }
        }
    };
    var getFileList = function (callback, onlyFolders, folderId, edit) {
        if (!gapi.client.drive || !gapi.client.drive.files) {
            config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudLoadMsg, cn) + "...";
            config.globalLoadMask.show();
            gapi.client.load('drive', 'v2', function () {
                config.globalLoadMask.hide();
                driveAPILoadedHandler(callback, onlyFolders, folderId, edit);
            });
        } else {
            driveAPILoadedHandler(callback, onlyFolders, folderId, edit);
        }
    };

    var handleAuthResult = function (authResult, uploadOrDownload) {
        var forEdit = !Ext.isBoolean(uploadOrDownload);
        clearPopupAuthTimer();
        config.globalLoadMask.hide();
        config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
        var cb = forEdit ? callbackForEdit : (uploadOrDownload ? callbackForUp : callbackForDown);
        if (authResult && !authResult.error) {
            authInfo = authResult;
            if (forEdit) {
                getFileList(cb, 1, null, true);
            } else {
                getFileList(cb, !uploadOrDownload);
            }
        } else {
            authInfo = null;
            var error;
            if (authResult && authResult.error) {
                error = Ext.util.Format.htmlEncode(authResult.error);
            }
            if (cb) {
                cb(null, error);
            }
        }
    };
    var handleAuthResultForDown = function (authResult) {
        handleAuthResult(authResult, false);
    };
    var handleAuthResultForUp = function (authResult) {
        handleAuthResult(authResult, true);
    };
    var handleAuthResultForEdit = function (authResult) {
        handleAuthResult(authResult, 1);
    }

    var clearPopupAuthTimer = function () {
        if (waitPopupAuthTimer) {
            try {
                clearTimeout(waitPopupAuthTimer);
            } catch (e) { }
        }
        waitPopupAuthTimer = null;
    };
    var showError = function (msg) {
        config.Msg.show({
            title: config.htcConfig.locData.CommonErrorCaption,
            msg: msg,
            icon: config.Msg.ERROR,
            buttons: config.Msg.OK
        });
    };

    /**
    *  Check Google authentication.
    *  immedite: check hidden or with show popup dialog for enter login/pass
    *  uploadOrDownload: for 'Download to Google' (false or undefined) or 'Upload from Google' (true)
    *  callback: callback function for handle results
    */
    var checkAuth = function (immediate, uploadOrDownload, callback) {
        var forEdit = !Ext.isBoolean(uploadOrDownload);
        if (typeof gapi != 'undefined' && googleAPILibLoaded && ((!forEdit && config.htcConfig.isAllowedGoogleDrive) || (forEdit && config.htcConfig.enableGoogleEdit))) {
            //gapi.client.setApiKey(apiKey);
            if (forEdit) {
                callbackForEdit = callback;
            } else {
                if (uploadOrDownload) {
                    callbackForUp = callback;
                } else {
                    callbackForDown = callback;
                }
            }

            if (config.htcConfig.isHostedMode) {
                if (!!window.addEventListener) {
                    window.addEventListener('message', function (event) {
                        if (~event.origin.indexOf('https://ownwebdrive.com') && event.data.google) {
                            var authResult = event.data.google;
                            gapi.auth.setToken(authResult);
                            self.handleAuthResult(gapi.auth.getToken(), uploadOrDownload);
                        }
                    });
                } else if (!!window.attachEvent) {
                    window.attachEvent('onmessage', function (event) {
                        if (~event.origin.indexOf('https://ownwebdrive.com') && event.data.google) {
                            var authResult = event.data.google;
                            gapi.auth.setToken(authResult);
                            self.handleAuthResult(gapi.auth.getToken(), uploadOrDownload);
                        }
                    });
                }
                if (!gapi.auth.getToken()) {
                    var popupGE = window.open('https://' + window.location.hostname.substring(window.location.hostname.indexOf('.') + 1, window.location.hostname.length).toLowerCase() + '/googledrive-callback.html?domain=' + encodeURIComponent(window.location.href) + "&uploaddownload=true",
                        'googleeditpopup' + (new Date()).getTime(),
                        HttpCommander.Lib.Utils.getPopupProps());
                    if (popupGE) {
                        try { popupGE.focus(); }
                        catch (e) { }
                    }
                }
            }

            var lastImmediateValue = (immediate === true);
            // See note: https://developers.google.com/api-client-library/javascript/features/authentication#popup
            config.globalLoadMask.hide();
            clearPopupAuthTimer();
            config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudCheckAuthMsg, cn) + "...";
            if (!config.isDemoMode() || (immediate === true)) {
                config.globalLoadMask.show();
            }
            if (lastImmediateValue) {
                handleAuthResult(gapi.auth.getToken(), uploadOrDownload);
            } else {
                gapi.auth.authorize({
                    'client_id': clientId,
                    'scope': scope,
                    'immediate': lastImmediateValue
                }, forEdit ? handleAuthResultForEdit : (uploadOrDownload ? handleAuthResultForUp : handleAuthResultForDown));
                waitPopupAuthTimer = setTimeout(function () {
                    config.globalLoadMask.hide();
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                    if (waitPopupAuthTimer) {
                        clearPopupAuthTimer();
                        if (lastImmediateValue) {//!authInfo || Ext.isEmpty(authInfo.access_token)) {
                            var error = authFailedMsg + trustedSitesMsg;
                            if (callback) {
                                callback(null, error, true);
                            } else {
                                showError(error);
                            }
                        }
                    } else {
                        clearPopupAuthTimer();
                    }
                }, 15000); // 15 seconds
            }
        } else if (config.htcConfig.isAllowedGoogleDrive && (
                (forEdit && config.htcConfig.enableGoogleEdit)
                ||
                (!forEdit && uploadOrDownload && config.htcConfig.enableUploadFromGoogle)
                ||
                (!forEdit && !uploadOrDownload && config.htcConfig.enableDownloadToGoogle)
            )) {
            config.globalLoadMask.hide();
            clearPopupAuthTimer();
            if (googleAPILibLoaded) {
                showError(gCLNotLoadedMsg + trustedSitesMsg);
                return;
            }
            config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudCheckAuthMsg, cn) + "...";
            config.globalLoadMask.show();
            if (typeof window.googleHandleAPILoaded == 'undefined') {
                window.googleHandleAPILoaded = function () {
                    googleAPILibLoaded = true;
                    self.checkAuth(immediate, uploadOrDownload, callback);
                };
            }
            var waitIncludeGoogleJS = null;
            HttpCommander.Lib.Utils.includeJsFile({
                url: 'https://apis.google.com/js/client.js?onload=googleHandleAPILoaded',
                callback: function () {
                    window.clearTimeout(waitIncludeGoogleJS);
                    if (googleAPILibLoaded) {
                        return;
                    }
                    config.globalLoadMask.hide();
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                    if (typeof gapi == 'undefined') {
                        showError(gCLNotLoadedMsg + trustedSitesMsg);
                    }
                }
            });
            waitIncludeGoogleJS = window.setTimeout(function () {
                window.clearTimeout(waitIncludeGoogleJS);
                if (googleAPILibLoaded) {
                    return;
                }
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                if (typeof gapi == 'undefined') {
                    showError(gCLNotLoadedMsg + trustedSitesMsg);
                } else {
                    window.googleHandleAPILoaded();
                }
            }, 15000); // 15 seconds
        }
    };

    return (self = {
        'checkAuth': checkAuth,
        'getAuthInfo': function () { return authInfo; },
        'getAboutInfo': function () { return aboutInfo; },
        'getFileList': getFileList,
        'handleAuthResult': handleAuthResult,
        'setAuthAboutInfos': function (aai) {
            if (Ext.isObject(aai)) {
                if (Ext.isObject(aai.auth)) {
                    var ai = Ext.apply({}, aai.auth);
                    if (Ext.isObject(window.gapi) && gapi.auth && Ext.isFunction(gapi.auth.setToken)) {
                        try {
                            gapi.auth.setToken(ai);
                        } catch (e) {
                            // ignore
                        }
                    }
                    authInfo = Ext.apply({}, ai);
                }
                if (Ext.isObject(aai.about)) {
                    aboutInfo = Ext.apply({}, aai.about);
                }
            }
            
        },
        'clearAuth': function () {
            authInfo = null;
            aboutInfo = null;
        },
        // See:
        //  https://developers.google.com/api-client-library/javascript/help/faq#is-it-possible-to-use-the-javascript-client-library-in-an--------installed-application
        //  https://groups.google.com/forum/?fromgroups=#!topic/google-api-javascript-client/PCs8xXV4wxk
        'signOut': function (callback) {
            if (gapi && gapi.auth) {
                if (typeof gapi.auth.signOut == 'function')
                    gapi.auth.signOut();
                if (typeof gapi.auth.setToken == 'function')
                    gapi.auth.setToken(null);
            }
            self.clearAuth();
            //<iframe id="Ext.id()" src="https://accounts.google.com/logout" style="display: none"></iframe>
            var frameId = Ext.id(),
                doc = document,
                frame = doc.createElement('iframe'),
                onLoadFrame = function () {
                    if (!frame) {
                        frame = doc.getElementById(frameId);
                    }
                    if (frame) {
                        doc.body.removeChild(frame);
                    }
                    if (typeof callback == 'function') {
                        callback();
                    }
                };
            if (frame.attachEvent) {
                frame.attachEvent('onload', onLoadFrame);
            } else {
                frame.onload = onLoadFrame;
            }
            Ext.fly(frame).set({
                id: frameId,
                name: frameId,
                cls: 'x-hidden',
                src: 'https://accounts.google.com/logout'
            });
            doc.body.appendChild(frame);
            if (Ext.isIE) try {
                document.frames[frameId].name = frameId;
            } catch (e) { }
        }
    });
};
