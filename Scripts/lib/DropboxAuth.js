Ext.ns('HttpCommander.Lib');

/**
 *  config:
 *  htcConfig, Msg, globalLoadMask, isDemoMode()
 */
HttpCommander.Lib.DropboxAuth = function (config) {
    var self, bris = HttpCommander.Lib.Utils.browserIs,
        cn = HttpCommander.Lib.Consts.CloudNames.dropbox,
        dropboxClient,
        appKey = config.htcConfig.dropboxAppKey,
        authInfo = null,
        waitPopupAuthTimer = null,
        dropboxLocalStorageKey = 'HttpCommanderDropboxAccessTokenInfo',
        dCLNotLoadedMsg = String.format(config.htcConfig.locData.CloudLibraryNotLoadedMsg, cn),
        authFailedMsg = config.htcConfig.locData.CloudAuthNotCompleteMsg,
        trustedSitesMsg = (bris.ie || bris.edge) ? (config.htcConfig.locData.CloudTrustedSitesMsg
            + 'https://unpkg.com<br />'
            + 'https://www.dropbox.com<br />'
            + 'https://*.dropboxapi.com<br />'
            + 'https://*.dropboxstatic.com<br />'
            + (bris.edge ? ('<br />(' + config.htcConfig.locData.TrustedSitesForMicrosoftEdge + ')') : '')) : '',
        ls = null;

    if (Ext.isEmpty(trustedSitesMsg)) {
        var brPos = authFailedMsg.toLowerCase().lastIndexOf('<br />');
        if (brPos > 0) {
            authFailedMsg = authFailedMsg.substring(0, brPos);
        }
    }

    try {
        ls = (function (localStorage) {
            var a = [localStorage, window.sessionStorage],
                i = 0;
            localStorage = a[i++];
            while (localStorage) {
                try {
                    localStorage.setItem(i, i);
                    localStorage.removeItem(i);
                    break;
                } catch (e) {
                    localStorage = a[i++];
                }
            }
            if (!localStorage) {
                return null;
            } else {
                return localStorage;
            }
        })(window.localStorage);
    } catch (e) {
        /* ignore */ // bug with local/sessionStorage in Microsoft Edge https://connect.microsoft.com/IE/Feedback/Details/1798743
    }

    var getTokenFromStore = function () {
        var token = null;
        if (ls) try {
            token = ls.getItem(dropboxLocalStorageKey);
            if (Ext.isEmpty(token)) {
                token = null
            }
        } catch (e) {
            token = null;
        }
        return token;
    };

    var putTokenToStore = function (token) {
        if (ls) {
            try { ls.removeItem(dropboxLocalStorageKey); }
            catch (e) { }
            if (!Ext.isEmpty(token)) {
                try { ls.setItem(dropboxLocalStorageKey, token); }
                catch (e) { }
            }
        }
    };

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
            buttons: config.Msg.CANCEL
        });
    };

    var handleError = function (err, callback) {
        var error = null, e401 = false;
        if (Ext.isObject(err)) {
            if (err.status == 401 || !!err.response && err.response.statusCode == 401) {
                e401 = true;
            }
            error = err.error;
            if (!Ext.isObject(error)) {
                try {
                    error = JSON.parse(error);
                } catch (e) { }
            }
            if (Ext.isObject(error)) {
                if (Ext.isObject(error.user_message)) {
                    error = error.user_message.text;
                } else {
                    error = error.error_summary;
                }
            }
            if (Ext.isEmpty(error) && Ext.isObject(err.response)) {
                error = err.response.text || err.response.statusText;
            }
        }        if (Ext.isEmpty(error) && !!err) {
            error = String(err);
        }
        self.clearAuth();
        if (Ext.isFunction(callback)) {
            error = Ext.util.Format.htmlEncode(Ext.isEmpty(error) ? config.htcConfig.locData.UploadFromUrlUnknownResponse : error);
            callback(null, e401 ? { msg: error, unauth: true} : error);
        }
    };

    var checkAuth = function (uploadOrDownload, callback, interactive) {
        if (Ext.isDefined(window.Dropbox)) {
            if (!dropboxClient) {
                dropboxClient = new Dropbox({ 'clientId': appKey });
            }
            if (Ext.isEmpty(dropboxClient.getAccessToken())) {
                if (!authInfo || Ext.isEmpty(authInfo.token)) {
                    authInfo = { token: getTokenFromStore() };
                }
                if (!Ext.isEmpty(authInfo.token)) {
                    dropboxClient.setAccessToken(authInfo.token);
                    putTokenToStore(authInfo.token);
                } else {
                    self.clearAuth();
                }
            }
            if (!Ext.isEmpty(dropboxClient.getAccessToken())) {
                clearPopupAuthTimer();
                authInfo = { token: dropboxClient.getAccessToken() };
                putTokenToStore(authInfo.token);
                getFileList(callback, !uploadOrDownload);
            } else {
                if (config.htcConfig.isHostedMode) {
                    if (!!window.addEventListener) {
                        window.addEventListener('message', function (event) {
                            if (~event.origin.indexOf('https://ownwebdrive.com') && event.data.dropbox) {
                                var authResult = event.data.dropbox;
                                authInfo = { token: authResult.access_token };
                                if (dropboxClient) {
                                    dropboxClient.setAccessToken(authInfo.token);
                                }
                                getFileList(callback, !uploadOrDownload);
                            }
                        });
                    } else if (!!window.attachEvent) {
                        window.attachEvent('onmessage', function (event) {
                            if (~event.origin.indexOf('https://ownwebdrive.com') && event.data.dropbox) {
                                var authResult = event.data.dropbox;
                                authInfo = { token: authResult.access_token };
                                if (dropboxClient) {
                                    dropboxClient.setAccessToken(authInfo.token);
                                }
                                getFileList(callback, !uploadOrDownload);
                            }
                        });
                    }
                }
                config.globalLoadMask.hide();
                clearPopupAuthTimer();
                if (interactive === true) {
                    config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudCheckAuthMsg, cn) + '...';
                    if (!config.isDemoMode()) {
                        config.globalLoadMask.show();
                    }
                    var redirUrl = (scriptSource.substring(0, scriptSource.lastIndexOf('/')) + '/clouds/dropbox-callback.html').toLowerCase();
                    var authUrl = config.htcConfig.isHostedMode
                        ? 'https://' + window.location.hostname.substring(window.location.hostname.indexOf('.') + 1, window.location.hostname.length).toLowerCase() + '/dropbox-callback.html'
                        : dropboxClient.getAuthenticationUrl(redirUrl);
                    if (!Ext.isFunction(window.onDropboxAccessTokenCallback)) {
                        window.onDropboxAccessTokenCallback = function (access_token, error) {
                            if (!Ext.isEmpty(access_token)) {
                                if (dropboxClient) {
                                    dropboxClient.setAccessToken(access_token);
                                }
                                authInfo = { token: access_token };
                                putTokenToStore(authInfo.token);
                                getFileList(callback, !uploadOrDownload);
                            } else if (Ext.isFunction(callback)) {
                                callback(null, error);
                            }
                        };
                    }
                    var popupDB = window.open(authUrl, 'dropboxpopup' + (new Date()).getTime(),
                        HttpCommander.Lib.Utils.getPopupProps());
                    if (popupDB) {
                        try { popupDB.focus(); }
                        catch (e) { }
                    }
                    if (!config.htcConfig.isHostedMode) {
                        waitPopupAuthTimer = window.setInterval(function () {
                            try {
                                if (!popupDB || popupDB.closed) {
                                    config.globalLoadMask.hide();
                                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                                    clearPopupAuthTimer();
                                    if (!dropboxClient || Ext.isEmpty(dropboxClient.getAccessToken())) {
                                        showError(authFailedMsg + trustedSitesMsg);
                                    }
                                }
                            } catch (e) {
                                config.globalLoadMask.hide();
                                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                                clearPopupAuthTimer();
                            }
                        }, 1000);
                    }
                } else {
                    callback(null);
                }
            }
        } else if ((uploadOrDownload && config.htcConfig.enableUploadFromDropbox) ||
                  (!uploadOrDownload && config.htcConfig.enableDownloadToDropbox)) {
            config.globalLoadMask.hide();
            clearPopupAuthTimer();
            config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudCheckAuthMsg, cn) + '...';
            config.globalLoadMask.show();
            var checkAuthInvoked = false;
            var waitIncludeDropboxJS = null;
            HttpCommander.Lib.Utils.includeJsFile({
                url: 'https://unpkg.com/dropbox/dist/Dropbox-sdk.min.js',
                callback: function () {
                    window.clearTimeout(waitIncludeDropboxJS);
                    if (!checkAuthInvoked) {
                        checkAuthInvoked = true;
                    } else {
                        return;
                    }
                    config.globalLoadMask.hide();
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                    if (!Ext.isDefined(window.Dropbox)) {
                        showError(dCLNotLoadedMsg + trustedSitesMsg);
                    } else {
                        checkAuth(uploadOrDownload, callback);
                    }
                }
            });
            waitIncludeDropboxJS = window.setTimeout(function () {
                window.clearTimeout(waitIncludeDropboxJS);
                if (!checkAuthInvoked) {
                    checkAuthInvoked = true;
                } else {
                    return;
                }
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                if (!Ext.isDefined(window.Dropbox)) {
                    showError(dCLNotLoadedMsg + trustedSitesMsg);
                } else {
                    checkAuth(uploadOrDownload, callback);
                }
            }, 15000); // 15 seconds
        }
    };

    var getFileList = function (callback, onlyFolders, folderId) {
        if (!Ext.isDefined(folderId)) {
            callback([{}]);
            return;
        }
        var args = {
            path: folderId || '',
            recursive: false,
            include_media_info: false,
            include_deleted: false
        };
        var parseCursorResults = function (response, result) {
            var arr = response && Ext.isArray(response.entries) ? response.entries : [];
            if (arr.length > 0) {
                if (onlyFolders) {
                    Ext.each(arr, function (item) {
                        if (item['.tag'] == 'folder') {
                            result.push(item);
                        }
                    });
                } else {
                    result = result.concat(arr);
                }
            }
            if (response && response.has_more && !Ext.isEmpty(response.cursor)) {
                nextCursor(response.cursor, result);
            } else if (Ext.isFunction(callback)) {
                try {
                    result.sort(function (a, b) {
                        var lhs, rhs;
                        if (!a || !b) return (!a && b) ? -1 : ((a && !b) ? 1 : 0);
                        var af = (a['.tag'] == 'folder');
                        var bf = (b['.tag'] == 'folder');
                        if (af && !bf) return -1;
                        else if (!af && bf) return 1;
                        else {
                            lhs = String(a.name).toLowerCase();
                            rhs = String(b.name).toLowerCase();
                            return (lhs < rhs) ? -1 : ((lhs > rhs) ? 1 : 0);
                        }
                    });
                } catch (e) {
                    if (!!window.console && !!window.console.log) {
                        window.console.log('Dropbox sort fail');
                    }
                }
                callback(result);
            }
        };
        var nextCursor = function (cursor, result) {
            dropboxClient.filesListFolderContinue(cursor).then(function (response) {
                parseCursorResults(response, result);
            }, function (error) {
                handleError(error,  callback);
            });
        };
        dropboxClient.filesListFolder(args).then(function (response) {
            parseCursorResults(response, []);
        }, function (error) {
            handleError(error, callback);
        });
    };

    return (self = {
        'checkAuth': checkAuth,
        'getAuthInfo': function () { return authInfo; },
        'getFileList': getFileList,
        'clearAuth': function (skipClearDropboxToken) {
            clearPopupAuthTimer();
            putTokenToStore(null);
            authInfo = null;
            if (!(skipClearDropboxToken === true) && !!dropboxClient) {
                try {
                    dropboxClient.setAccessToken(null);
                } catch (e) {
                    if (!!window.console && !!window.console.log) {
                        window.console.log(e);
                    }
                }
            }
        },
        'signOut': function (callback) {
            self.clearAuth(true);
            if (!!dropboxClient) {
                dropboxClient.authTokenRevoke().then(function (response) {
                    dropboxClient.setAccessToken(null);
                    if (Ext.isFunction(callback)) {
                        callback();
                    }
                }, function (error) {
                    if (!!window.console && !!window.console.log) {
                        window.console.log(error || '');
                    }
                    dropboxClient.setAccessToken(null);
                    if (Ext.isFunction(callback)) {
                        callback();
                    }
                });
            } else if (Ext.isFunction(callback)) {
                callback();
            }
        }
    });
};
