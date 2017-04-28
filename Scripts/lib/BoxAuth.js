Ext.ns('HttpCommander.Lib');

/**
 *  config:
 *  htcConfig, Msg, globalLoadMask, getUid(), getFileManagerInstance(), isDemoMode()
 */
HttpCommander.Lib.BoxAuth = function (config) {
    var self, bris = HttpCommander.Lib.Utils.browserIs,
        cn = HttpCommander.Lib.Consts.CloudNames.box,
        clientId = config.htcConfig.boxClientId,
        authBaseUrl = 'https://www.box.com/api/oauth2/authorize',
        authInfo = null,
        userInfo = null,
        popupAuth = null,
        needRefreshToken = false,
        responded = false,
        lastCallback = null,
        waitPopupAuthTimer = null,
        boxLocalStorageKey = 'HttpCommanderBoxAccessTokenInfo',
        authFailedMsg = config.htcConfig.locData.CloudAuthNotCompleteMsg,
        trustedSitesMsg = (bris.ie || bris.edge) ? (config.htcConfig.locData.CloudTrustedSitesMsg
            + 'https://*.box.com'
            + (bris.edge ? ('<br />(' + config.htcConfig.locData.TrustedSitesForMicrosoftEdge + ')') : '')) : '';

    if (Ext.isEmpty(trustedSitesMsg)) {
        var brPos = authFailedMsg.toLowerCase().lastIndexOf('<br />');
        if (brPos > 0) {
            authFailedMsg = authFailedMsg.substring(0, brPos);
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

    var param = function (data) {
        var result = '';
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (result) {
                    result += '&';
                }
                result += key + '=' + encodeURIComponent(data[key]);
            }
        }
        return result;
    };

    var isAuthInfoDefined = function (tokenInfo) {
        return (tokenInfo && tokenInfo.access_token && tokenInfo.refresh_token) ? true : false;
    };

    var getAuthInfo = function () {
        needRefreshToken = false;
        authInfo = authInfo || getTokenFromStore();
        if (!isAuthInfoDefined(authInfo)) {
            authInfo = null;
            putTokenToStore(null);
        }
        if (authInfo && authInfo.date && authInfo.expires_in) {
            try {
                needRefreshToken = (authInfo.date + authInfo.expires_in * 1000) <= (new Date()).getTime();
            } catch (e) {
                needRefreshToken = false;
            }
        }
        return authInfo;
    };

    var setAuthInfo = function (tokenInfo) {
        var oldAuthInfo = getAuthInfo();
        if (!isAuthInfoDefined(tokenInfo)) {
            authInfo = null;
        } else if (!isAuthInfoDefined(oldAuthInfo)
                   || tokenInfo.access_token != oldAuthInfo.access_token
                   || tokenInfo.refresh_token != oldAuthInfo.refresh_token) {
            authInfo = tokenInfo;
            authInfo.restricted_to = null;
            authInfo.date = (new Date()).getTime();
        }
        putTokenToStore(authInfo);
    };

    var getTokenFromStore = function () {
        var token = null;
        if (ls) try {
            token = ls.getItem(boxLocalStorageKey);
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
            try { ls.removeItem(boxLocalStorageKey); }
            catch (e) { }
            if (tokenInfo) {
                try { ls.setItem(boxLocalStorageKey, JSON.stringify(tokenInfo)); }
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

    var handleAccessTokenResult = function (token, error, callback) {
        responded = true;
        var _token = token && Ext.isObject(token) ? Ext.apply({}, token) : null;
        if (_token != null) {
            _token.restricted_to = null;
        }
        var _error = error ? (Ext.isObject(error) ? Ext.apply({}, error) : {
            error: null,
            error_description: String(error)
        }) : null;
        var _callback = (typeof callback == 'function' ? callback : null) || lastCallback;
        var tm = setTimeout(function () {
            clearTimeout(tm);
            clearPopupAuthTimer();
            try {
                if (popupAuth && !popupAuth.closed) {
                    popupAuth.close();
                }
            } catch (e) { }
            popupAuth = null;
            setAuthInfo(_token);
            config.globalLoadMask.hide();
            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
            if (typeof _callback == 'function') {
                _callback(isAuthInfoDefined(authInfo), _error);
            }
        }, 100);
    };

    var checkAuth = function (callback, interactive) {
        clearPopupAuthTimer();

        if (!config.htcConfig.isAllowedBox) {
            if (typeof callback == 'function') {
                callback(null, 'This operation is rejected because of limited permissions');
            }
            return;
        }

        config.globalLoadMask.hide();
        config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudCheckAuthMsg, cn) + '...';
        if (!config.isDemoMode() || !interactive) {
            config.globalLoadMask.show();
        }

        interactive = (interactive === true);

        var tokenInfo = getAuthInfo();
        if (tokenInfo || !interactive) {
            if (needRefreshToken) {
                self.refreshToken(callback, interactive);
            } else {
                handleAccessTokenResult(tokenInfo, null, callback);
            }
            return;
        }

        responded = false;
        var ruri = scriptSource;
        var ruriArr = ruri.split('/');
        ruriArr[ruriArr.length - 2] = 'Handlers';
        ruriArr[ruriArr.length - 1] = 'BoxOAuth2Handler.ashx?hcuid=' + encodeURIComponent(config.getUid());
        ruri = ruriArr.join('/');
        var authUrl = authBaseUrl + '?' + param({
            response_type: 'code',
            client_id: clientId,
            redirect_uri: ruri
        });
        var fm = config.getFileManagerInstance();
        if (fm && typeof fm.onBoxAccessToken != 'function') {
            fm.onBoxAccessToken = handleAccessTokenResult;
        }
        lastCallback = callback;
        popupAuth = window.open(authUrl, 'boxoauthauthorize',
            HttpCommander.Lib.Utils.getPopupProps());
        if (popupAuth) {
            try { popupAuth.focus(); }
            catch (e) { }
        }

        var timer = setInterval(function () {
            if (popupAuth) {
                var popupClosed = false;
                try {
                    popupClosed = popupAuth.closed;
                } catch (e) {
                    popupClosed = true;
                }
                if (popupClosed) {
                    if (timer) {
                        clearInterval(timer);
                    }
                    popupAuth = null;
                    if (!responded) {
                        handleAccessTokenResult(null, {
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
                if (!interactive) {
                    var error = authFailedMsg + trustedSitesMsg;
                    if (callback) {
                        callback(false); //, error);
                    } else {
                        showError(error);
                    }
                }
            } else {
                clearPopupAuthTimer();
            }
        }, 15000); // 15 seconds
    };

    return (self = {
        'checkAuth': checkAuth,
        'setAuthInfo': setAuthInfo,
        'getAuthInfo': getAuthInfo,
        'getUserInfo': function () { return userInfo; },
        'clearAuth': function () { setAuthInfo(null); },
        'refreshToken': function (callback, interactive) {
            var tokenInfo = getAuthInfo();
            if (isAuthInfoDefined(tokenInfo)) {
                config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudRefreshTokenMsg, cn) + '...';
                config.globalLoadMask.show();
                HttpCommander.Box.RefreshToken({ tokenInfo: tokenInfo }, function (data, trans) {
                    config.globalLoadMask.hide();
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                    if (typeof data == 'undefined') {
                        showError(Ext.util.Format.htmlEncode(trans.message));
                    } else {
                        handleAccessTokenResult(data.tokenInfo, data.message, callback);
                    }
                });
            } else {
                self.checkAuth(callback, interactive);
            }
        },
        'signOut': function (callback) {
            if (!isAuthInfoDefined(authInfo)) {
                self.clearAuth();
                if (typeof callback == 'function')
                    callback(null);
                return;
            }
            config.globalLoadMask.msg = config.htcConfig.locData.CloudRevokeTokenMsg + '...';
            config.globalLoadMask.show();
            HttpCommander.Box.RevokeToken({ tokenInfo: authInfo }, function (data, trans) {
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                if (typeof data == 'undefined') {
                    showError(Ext.util.Format.htmlEncode(trans.message));
                    return;
                }
                if (data.success) {
                    self.clearAuth();
                }
                if (typeof callback == 'function') {
                    callback(data.success ? null : data.message);
                } else if (!data.success) {
                    showError(data.message);
                }
            });
        }
    });
};
