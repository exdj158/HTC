Ext.ns('HttpCommander.Lib');

/**
 *  config:
 *  htcConfig, Msg, globalLoadMask, getDebugMode(),
 *  getFileManagerInstance(), getUid(), isDemoMode()
 */
HttpCommander.Lib.SkyDriveAuth = function (config) {
    // vars 
    var self, bris = HttpCommander.Lib.Utils.browserIs,
        cn = HttpCommander.Lib.Consts.CloudNames.onedrive,
        businessUsed = null,
        clientId = config.htcConfig.liveConnectID,
        scope = ['wl.signin', 'wl.skydrive', 'wl.skydrive_update'], // see https://msdn.microsoft.com/en-us/library/dn631845.aspx#extended
        isInited = false,
        authInfo = null,
        aboutInfo = null,
        responded = false,
        lastCallback = null,
        popupAuth = null,
        needRefreshToken = false,
        waitPopupAuthTimer = null,
        oneDriveLocalStorageKey = 'HttpCommanderOneDriveForBusinessAccessTokenInfo',
        wlCLNotLoadedMsg = String.format(config.htcConfig.locData.CloudLibraryNotLoadedMsg, cn),
        authFailedMsg = config.htcConfig.locData.CloudAuthNotCompleteMsg,
        trustedSitesMsg = (bris.ie || bris.edge) ? (config.htcConfig.locData.CloudTrustedSitesMsg
            + 'http' + (Ext.isSecure ? 's' : '') + '://js.live.net<br />'
            + 'https://login.live.com<br />'
            + 'https://apis.live.net<br />'
            + 'https://auth.gfx.ms<br />'
            + 'https://onedrive.live.com<br />'
            + (bris.edge ? ('<br />(' + config.htcConfig.locData.TrustedSitesForMicrosoftEdge + ')') : '')) : '',
        trustedSitesBusinessMsg = (bris.ie || bris.edge) ? (config.htcConfig.locData.CloudTrustedSitesMsg
            + 'https://login.microsoftonline.com<br />'
            + 'https://login.windows.net<br />'
            + (bris.edge ? ('<br />(' + config.htcConfig.locData.TrustedSitesForMicrosoftEdge + ')') : '')) : '';

    if (Ext.isEmpty(trustedSitesMsg) || Ext.isEmpty(trustedSitesBusinessMsg)) {
        var brPos = authFailedMsg.toLowerCase().lastIndexOf('<br />');
        if (brPos > 0) {
            authFailedMsg = authFailedMsg.substring(0, brPos);
        }
    }

    var personalOneDrive = typeof (config.htcConfig.liveConnectID) != 'undefined'
        && config.htcConfig.liveConnectID != null && String(config.htcConfig.liveConnectID).length > 0;
    var businessOneDrive = typeof (config.htcConfig.oneDriveForBusinessAuthUrl) != 'undefined'
        && config.htcConfig.oneDriveForBusinessAuthUrl != null && String(config.htcConfig.oneDriveForBusinessAuthUrl).length > 0;

    // functions

    /* work with token info from store for business account */
    var isAuthInfoDefined = function (tokenInfo) {
        return (tokenInfo && tokenInfo.AccessToken && tokenInfo.RefreshToken) ? true : false;
    };

    var getAuthInfo = function () {
        needRefreshToken = false;
        authInfo = authInfo || getTokenFromStore();
        if (!isAuthInfoDefined(authInfo)) {
            authInfo = null;
            aboutInfo = null;
            putTokenToStore(null);
        }
        if (authInfo && authInfo.ExpiresOn) {
            try {
                var expires = Date.parseDate(authInfo.ExpiresOn, 'c');
                needRefreshToken = (new Date()) >= expires;
            } catch (e) {
                needRefreshToken = false;
            }
        }
        return authInfo;
    };

    var setAuthInfo = function (tokenInfo) {
        var uInfo = tokenInfo ? tokenInfo.UserInfo : null;
        var oldAuthInfo = getAuthInfo();
        if (!isAuthInfoDefined(tokenInfo)) {
            authInfo = null;
            aboutInfo = null;
        } else if (!isAuthInfoDefined(oldAuthInfo)
                   || tokenInfo.AccessToken != oldAuthInfo.AccessToken
                   || tokenInfo.RefreshToken != oldAuthInfo.RefreshToken) {
            authInfo = Ext.apply({}, tokenInfo);
            authInfo.UserInfo = Ext.apply({}, uInfo);
        }
        putTokenToStore(authInfo);
    };

    var getTokenFromStore = function () {
        var token = null;
        if (ls) try {
            token = ls.getItem(oneDriveLocalStorageKey);
            if (token) {
                token = JSON.parse(token);
            } else {
                token = null
            }
        } catch (e) {
            token = null;
        }
        return token;
    };

    var putTokenToStore = function (tokenInfo) {
        if (ls) {
            try { ls.removeItem(oneDriveLocalStorageKey); }
            catch (e) { }
            if (tokenInfo) {
                try { ls.setItem(oneDriveLocalStorageKey, JSON.stringify(tokenInfo)); }
                catch (e) { }
            }
        }
    };

    var ls = null;
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

    /* END */

    var init = function () {
        if (typeof WL != 'undefined' && config.htcConfig.isAllowedSkyDrive) {
            try {
                WL.init({
                    'client_id': clientId,
                    'redirect_uri': config.htcConfig.isHostedMode
                        ? ('https://' + window.location.hostname.substring(window.location.hostname.indexOf('.') + 1, window.location.hostname.length).toLowerCase() + '/onedrive-callback.html')
                        : scriptSource.substring(0, scriptSource.lastIndexOf('/')) + '/clouds/onedrive-callback.html',
                    'scope': scope
                });
                isInited = true;
            } catch (e) {
                isInited = false;
            }
        }
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

    var handleAuthBusinessResult = function (token, error, webdav, callback) {
        responded = true;
        var _token = token && Ext.isObject(token) ? Ext.apply({}, token) : null;
        if (_token && token.UserInfo)
            _token.UserInfo = Ext.apply({}, token.UserInfo);
        var _error = error ? (Ext.isObject(error) ? Ext.apply({}, error) : {
            error: null,
            error_description: String(error)
        }) : null;
        var _callback = (typeof callback == 'function' ? callback : null) || lastCallback;
        var tm = setTimeout(function () {
            clearTimeout(tm);
            clearPopupAuthTimer();
            if (popupAuth && !popupAuth.closed) {
                popupAuth.close();
            }
            popupAuth = null;
            if (_token && webdav != '')
                _token.WebDAVRoot = webdav;
            setAuthInfo(_token);
            config.globalLoadMask.hide();
            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
            if (typeof _callback == 'function') {
                _callback(isAuthInfoDefined(authInfo), _error);
            }
        }, 100);
    };

    var handleAuthResult = function (authResponse, uploadOrDownload, callback) {
        var forEdit = !Ext.isBoolean(uploadOrDownload);
        clearPopupAuthTimer();
        config.globalLoadMask.hide();
        config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
        var session;
        if (authResponse && !authResponse.error && (session = WL.getSession())) {
            authInfo = session;
            if (forEdit) {
                callback(authInfo);
            } else {
                getFileList(callback, !uploadOrDownload);
            }
        } else {
            authInfo = null;
            var error = null;
            if (authResponse && authResponse.error && Ext.isObject(authResponse.error))
                error = authResponse.error.message || authResponse.error.code;
            if (!error && authResponse && (authResponse.error || authResponse.error_description)) {
                error = Ext.util.Format.htmlEncode(authResponse.error_description || authResponse.error);
            } else if (error) {
                error = Ext.util.Format.htmlEncode(error);
            }
            if (error && (error.toLowerCase().indexOf('popup is closed') >= 0
                || error.toLowerCase().indexOf("'focus'") >= 0
                || error.toLowerCase().indexOf("'onerror'") >= 0) &&
                !Ext.isEmpty(trustedSitesMsg)) {
                error += '<br /><br />' + config.htcConfig.locData.SkyDriveAuthAlsoString + trustedSitesMsg;
            }
            if (Ext.isFunction(callback)) {
                callback(null, error);
            }
        }
    };

    var fillAboutInfo = function () {
        // see: https://msdn.microsoft.com/EN-US/library/office/dn659736.aspx#Requesting_info
        WL.api({ 'path': 'me', 'method': 'GET' }).then(
            function (meResponse) {
                aboutInfo = meResponse;
                // see: https://msdn.microsoft.com/en-us/library/office/dn659731.aspx#get_a_user_s_total_and_remaining_onedrive_storage_quota
                WL.api({ 'path': 'me/skydrive/quota', 'method': 'GET' }).then(
                    function (quotaResoponse) {
                        if (aboutInfo && quotaResoponse && quotaResoponse.available)
                            aboutInfo.freeSpace = quotaResoponse.available;
                    },
                    function (quotaResponseFailed) {
                        if (aboutInfo)
                            aboutInfo.freeSpace = -1;
                    }
                );
            },
            function (meResponseFailed) {
                aboutInfo = null;
            }
        );
    };

    var checkAuthBusiness = function (uploadOrDownload, callback, interactive) {
        var forEdit = !Ext.isBoolean(uploadOrDownload);

        config.globalLoadMask.hide();
        clearPopupAuthTimer();
        config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudCheckAuthMsg, cn) + '...';
        if (!config.isDemoMode() || !interactive) {
            config.globalLoadMask.show();
        }
        var lastInteractive = (interactive === true);

        var tokenInfo = getAuthInfo();
        if (tokenInfo || !interactive) {
            if (needRefreshToken) {
                self.refreshToken(callback, interactive);
            } else {
                handleAuthBusinessResult(tokenInfo, null, '', callback);
            }
            return;
        }

        responded = false;
        var ruri = scriptSource;
        var ruriArr = ruri.split('/');
        ruriArr[ruriArr.length - 2] = 'Handlers';
        ruriArr[ruriArr.length - 1] = 'OneDriveForBusinessOAuthHandler.ashx';
        var redirUrl = ruriArr.join('/');
        var authUrl = String.format(config.htcConfig.oneDriveForBusinessAuthUrl,
            encodeURIComponent(redirUrl),
            encodeURIComponent(config.getUid() + '=' + redirUrl)
        );

        var fm = config.getFileManagerInstance();
        if (fm && typeof fm.onOneDriveForBusinessAccessToken != 'function') {
            fm.onOneDriveForBusinessAccessToken = handleAuthBusinessResult;
        }
        lastCallback = callback;
        popupAuth = window.open(authUrl, 'onedriveforbusinessoauthauthorize',
            HttpCommander.Lib.Utils.getPopupProps(400, 500));
        if (popupAuth) {
            try { popupAuth.focus(); }
            catch (e) { }
        } else {
            var error = authFailedMsg + trustedSitesBusinessMsg;
            if (Ext.isFunction(callback)) {
                callback(null, error);
            } else {
                showError(error);
            }
            return;
        }

        var timer = setInterval(function () {
            if (popupAuth) {
                if (popupAuth.closed) {
                    if (timer) {
                        clearInterval(timer);
                    }
                    popupAuth = null;
                    if (!responded) {
                        handleAuthBusinessResult(null, {
                            error: 'cancelled',
                            error_description: 'Login has been cancelled'
                        });
                    }
                }
            } else {
                if (timer) {
                    clearInterval(timer);
                }
            }
        }, 100);

        waitPopupAuthTimer = setTimeout(function () {
            config.globalLoadMask.hide();
            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
            if (waitPopupAuthTimer) {
                clearPopupAuthTimer();
                if (!lastInteractive) {
                    var error = authFailedMsg + trustedSitesBusinessMsg;
                    if (Ext.isFunction(callback)) {
                        callback(null); //, error);
                    } else {
                        showError(error);
                    }
                }
            } else {
                clearPopupAuthTimer();
            }
        }, 15000); // 15 seconds
    };

    var checkAuth = function (uploadOrDownload, callback, interactive, business) {
        var forEdit = !Ext.isBoolean(uploadOrDownload);
        if (Ext.isBoolean(business)) {
            businessUsed = (business === true);
        } else if (!Ext.isBoolean(businessUsed)) {
            if (businessOneDrive && !personalOneDrive)
                businessUsed = true;
            else if (!businessOneDrive && personalOneDrive)
                businessUsed = false;
            else {
                var tokenInfo = getAuthInfo();
                if (tokenInfo) {
                    businessUsed = true;
                } /* else {
                    callback(null);
                    return;
                }*/
            }
        }
        if (businessUsed) {
            checkAuthBusiness(uploadOrDownload, callback, interactive);
            return;
        }
        if (typeof WL != 'undefined' && isInited && (config.htcConfig.isAllowedSkyDrive && (
                (forEdit && config.htcConfig.enableMSOOEdit)
                ||
                (!forEdit && uploadOrDownload && config.htcConfig.enableUploadFromSkyDrive)
                ||
                (!forEdit && !uploadOrDownload && config.htcConfig.enableDownloadToSkyDrive)
            ))) {
            config.globalLoadMask.hide();
            clearPopupAuthTimer();
            config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudCheckAuthMsg, cn) + '...';
            if (!config.isDemoMode() || !interactive) {
                config.globalLoadMask.show();
            }
            var lastInteractive = (interactive === true);
            if (lastInteractive) {
                WL.login({ 'scope': scope }).then(
                    function (responseOk) {
                        if (responseOk && responseOk.session) {
                            fillAboutInfo();
                        }
                        handleAuthResult(responseOk, uploadOrDownload, callback);
                    },
                    function (responseFailed) {
                        handleAuthResult(responseFailed, uploadOrDownload, callback);
                    }
                );
            } else {
                WL.getLoginStatus().then(
                    function (responseOk) {
                        if (responseOk && responseOk.session) {
                            fillAboutInfo();
                        }
                        handleAuthResult(responseOk, uploadOrDownload, callback);
                    },
                    function (responseFailed) {
                        handleAuthResult(responseFailed, uploadOrDownload, callback);
                    }
                );
            }
            waitPopupAuthTimer = setTimeout(function () {
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                if (waitPopupAuthTimer) {
                    clearPopupAuthTimer();
                    if (!lastInteractive) {
                        var error = authFailedMsg + trustedSitesMsg;
                        if (Ext.isFunction(callback)) {
                            callback(null); //, error);
                        } else {
                            showError(error);
                        }
                    }
                } else {
                    clearPopupAuthTimer();
                }
            }, 15000); // 15 seconds
        } else if (config.htcConfig.isAllowedSkyDrive && (
                (forEdit && config.htcConfig.enableMSOOEdit)
                ||
                (!forEdit && uploadOrDownload && config.htcConfig.enableUploadFromSkyDrive)
                ||
                (!forEdit && !uploadOrDownload && config.htcConfig.enableDownloadToSkyDrive)
            )) {
            if (typeof WL != 'undefined' && !isInited) {
                init();
                checkAuth(uploadOrDownload, callback, interactive);
            } else {
                config.globalLoadMask.hide();
                clearPopupAuthTimer();
                config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudCheckAuthMsg, cn) + '...';
                config.globalLoadMask.show();
                var waitIncludeWlJs = null;
                var includeWlInvoked = false;
                HttpCommander.Lib.Utils.includeJsFile({
                    url: '//js.live.net/v5.0/wl' + (config.getDebugMode() ? '.debug' : '') + '.js',
                    callback: function () {
                        window.clearTimeout(waitIncludeWlJs);
                        if (!includeWlInvoked) {
                            includeWlInvoked = true;
                        } else {
                            return;
                        }
                        config.globalLoadMask.hide();
                        config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                        if (typeof WL == 'undefined') {
                            showError(wlCLNotLoadedMsg + trustedSitesMsg);
                        } else {
                            init();
                            checkAuth(uploadOrDownload, callback, interactive);
                        }
                    }
                });
                waitIncludeWlJs = window.setTimeout(function () {
                    window.clearTimeout(waitIncludeWlJs);
                    if (!includeWlInvoked) {
                        includeWlInvoked = true;
                    } else {
                        return;
                    }
                    config.globalLoadMask.hide();
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                    if (typeof WL == 'undefined') {
                        showError(wlCLNotLoadedMsg + trustedSitesMsg);
                    } else {
                        init();
                        checkAuth(uploadOrDownload, callback, interactive);
                    }
                }, 15000); // 15 seconds
            }
        }
    };
    var fileListHandler = function (success, response, callback, onlyFolders, folderId) {
        config.globalLoadMask.hide();
        config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
        var connect = response && response.connect;
        if (typeof callback == 'function') callback(
            success ? (response.data ? response.data : [response]) : null, // items array
            success ? null : response.message || Ext.util.Format.htmlEncode(response.error.message), // error message
            connect // connected flag
        );
    };
    var getFileList = function (callback, onlyFolders, folderId, folderUrl) {
        var path = folderId,
            isRoot = path === 'root';
        if (!businessUsed) {
            if (!path || isRoot) {
                path = '/me/skydrive';
                if (isRoot)
                    path += '/files';
                isRoot = true;
            } else {
                path += '/files';
            }
        }
        if (isRoot) {
            config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudLoadMsg, cn) + '...';
            config.globalLoadMask.show();
        }
        if (!businessUsed) {
            WL.api({ 'path': path, 'method': 'GET' }).then(
                function (response) {
                    fileListHandler(true, response, callback, onlyFolders, folderId);
                },
                function (responseFailed) {
                    fileListHandler(false, responseFailed, callback, onlyFolders, folderId);
                }
            );
        } else {
            HttpCommander.OneDriveForBusiness.GetItems({
                tokenInfo: authInfo,
                onlyFolders: onlyFolders,
                id: isRoot ? null : folderId,
                url: folderUrl
            }, function (data, trans) {
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                if (typeof data == 'undefined') {
                    showError(HttpCommander.Lib.Utils.getAndHtmlEncodeMessage(trans,
                        config.htcConfig.locData.UploadFromUrlUnknownResponse, 2));
                    return;
                }
                fileListHandler(data && data.success, data, callback, onlyFolders, folderId);
            });
        }
    };

    var businessSignOut = function (callback) {
        var ruri = scriptSource;
        var ruriArr = ruri.split('/');
        ruriArr[ruriArr.length - 2] = 'Handlers';
        ruriArr[ruriArr.length - 1] = 'OneDriveForBusinessOAuthHandler.ashx?logout=&hcuid=' + encodeURIComponent(config.getUid());
        var url = config.htcConfig.oneDriveForBusinessAuthUrl.split(/\/oauth2\//)[0]
            + '/oauth2/logout?post_logout_redirect_uri='
            + encodeURIComponent(ruriArr.join('/'));
        config.getFileManagerInstance().onOneDriveForBusinessSignOut = callback;
        var logoutPopup = window.open(url, 'onedriveforbusinesslogout',
            HttpCommander.Lib.Utils.getPopupProps(400, 500));
        if (logoutPopup) {
            try { logoutPopup.focus(); }
            catch (e) { }
        }
        if (typeof callback == 'function')
            callback();
    };

    return (self = {
        'init': init,
        'checkAuth': checkAuth,
        'getAuthInfo': function (forBusiness) {
            return (forBusiness === true) ? getAuthInfo() : authInfo;
        },
        'setAuthInfo': function (tokenInfo) {
            if (isAuthInfoDefined(tokenInfo)) {
                setAuthInfo(tokenInfo);
                businessUsed = true;
            }
        },
        'isAuthInfoDefined': isAuthInfoDefined,
        'getAboutInfo': function () { return aboutInfo; },
        'getFileList': getFileList,
        'setAuthAboutInfos': function (aai) {
            if (Ext.isObject(aai)) {
                if (Ext.isObject(aai.auth)) {
                    authInfo = HttpCommander.Lib.Utils.cloneMsOAuthInfo(aai.auth);
                }
                if (Ext.isObject(aai.about)) {
                    aboutInfo = Ext.apply({}, aai.about);
                }
            }
        },
        'clearAuth': function () {
            setAuthInfo(null);
            authInfo = null;
            aboutInfo = null;
        },
        'getWebDAVRootUrl': function () {
            var url = '';
            if (businessUsed && authInfo && authInfo.WebDAVRoot)
                url = authInfo.WebDAVRoot;
            else if (config.htcConfig.skyDriveWebDavBaseUrl && aboutInfo && aboutInfo.id)
                url = String.format("{0}{1}/", config.htcConfig.skyDriveWebDavBaseUrl, aboutInfo.id);
            return url;
        },
        'isBusinessAccount': function () { return businessUsed === true; },
        'refreshToken': function (callback, interactive) {
            var tokenInfo = getAuthInfo();
            if (isAuthInfoDefined(tokenInfo)) {
                config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudRefreshTokenMsg, cn) + '...';
                config.globalLoadMask.show();
                HttpCommander.OneDriveForBusiness.RefreshToken({ tokenInfo: tokenInfo }, function (data, trans) {
                    config.globalLoadMask.hide();
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                    if (typeof data == 'undefined') {
                        showError(HttpCommander.Lib.Utils.getAndHtmlEncodeMessage(trans,
                            config.htcConfig.locData.UploadFromUrlUnknownResponse, 2));
                    } else {
                        if (data.tokenInfo) {
                            if (tokenInfo.UserInfo && tokenInfo.UserInfo.UserId) {
                                data.tokenInfo.UserInfo = data.tokenInfo.UserInfo || {};
                                data.tokenInfo.UserInfo = tokenInfo.UserInfo;
                            }
                            if (tokenInfo.TenantId && !data.tokenInfo.TenantId)
                                data.tokenInfo.TenantId = tokenInfo.TenantId;
                            if (tokenInfo.WebDAVRoot)
                                data.tokenInfo.WebDAVRoot = tokenInfo.WebDAVRoot;
                        }
                        handleAuthBusinessResult(data.tokenInfo, data.message, '', callback);
                    }
                });
            } else {
                self.checkAuth(callback, interactive);
            }
        },
        'signOut': function (callback) {
            self.clearAuth();
            if (!businessUsed && typeof WL != 'undefined') {
                WL.logout();
            } else if (businessUsed && config.htcConfig.oneDriveForBusinessAuthUrl) {
                businessSignOut(callback);
            }
            if (typeof callback == 'function')
                callback();
        }
    });
};
