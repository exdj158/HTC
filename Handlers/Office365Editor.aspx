<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Office365Editor.aspx.cs" Inherits="HttpCommander.Office365Editor" %>

<%@ Import Namespace="HttpCommander" %>
<%@ Import Namespace="Newtonsoft.Json" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta content="NOINDEX, NOFOLLOW" name="ROBOTS" />
    <meta http-equiv="x-ua-compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0" />
    <script src="../Scripts/error-handler<%=Utils.BuildModeJs%>.js"></script>
    <link rel="shortcut icon" href="../favicon.ico" type="image/x-icon" />
    <script type="text/javascript">
        function ProcessScriptError (e) {
            try {
                if (typeof (e) == 'undefined') {
                    return;
                }
                if (typeof HttpCommanderLog != 'undefined') {
                    if (typeof HttpCommanderLog.SetLastError == 'function') {
                        HttpCommanderLog.SetLastError(e);
                    }
                    if (typeof window.onerror == 'function' && typeof e.message != 'undefined') {
                        window.onerror(e.message, window.location.href);
                    }
                }
                invokeEventFromOpener(e.toString());
                var debug = <%=JsonConvert.SerializeObject(Utils.DebugModeJs)%>;
                if (debug) {
                    window.alert(e);
                }
            } catch (fe) {
                alert(fe);
            }
        }

        function invokeEventFromOpener(arg, event) {
            var fn, isError = false;
            switch (event) {
                case 'send':
                    fn = 'handle365EditorSend';
                    break;
                case 'auth':
                    fn = 'handle365EditorAuth';
                    break;
                default:
                    fn = 'handle365EditorError';
                    isError = true;
                    break;
            }
            if (window.opener) {
                try {
                    window.opener[fn](arg, <%=JsonConvert.SerializeObject(WaitMessageId)%>);
                } catch (e) {
                    alert(e);
                }
            } else if (isError && arg) {
                alert(arg);
            }
            if (isError) {
                window.close();
            }
        }

        try {
            var locHash = window.location.hash;
            if (locHash == 'noback' || locHash == '#noback') {
                window.close();
            } else {
                window.location.hash = 'noback';
            }
        } catch (e) {
            ProcessScriptError(e, true);
        }

        function getPopupProps(width, height) {
            if (!Ext.isNumber(width) || width <= 0) {
                width = 900;
            }
            if (!Ext.isNumber(height) || height <= 0) {
                height = 600;
            }
            var left = ((screen.width / 2) - (width / 2)),
                top = (screen.height - height) / 4;
            return 'scrollbars=yes,menubar=no,toolbar=no,location=no,status=no,resizable=yes,directories=no'
                + ',width=' + width + ',height=' + height + ',top=' + top + ',left=' + left;
        }
    </script>
    <% if (!string.IsNullOrWhiteSpace(ErrorMessage))
       { %>
    <script type="text/javascript">
        invokeEventFromOpener(<%=JsonConvert.SerializeObject(ErrorMessage)%>);
    </script>
    <% } %>
    <link rel="stylesheet" type="text/css" href="../Styles-min.css" />
    <% if (AllowEditing)
       { %>
    <%=ExternalCMSIntegration.WriteJsWithDemoAccountsForClouds()%>
    <link href="../Images/resources_1.5/css/ext-all-notheme.css" type="text/css" rel="stylesheet" />
    <script type="text/javascript">
        var msAuthResult = null,
            waitPopupAuthTimer = null,
            responded = false,
            popupAuth = null;

        function clearPopupAuthTimer() {
            if (waitPopupAuthTimer) {
                try {
                    clearTimeout(waitPopupAuthTimer);
                } catch (e) { }
            }
            waitPopupAuthTimer = null;
        }

        function checkAuth(userClick) {
            toggleLoading(true);
            var spanError;
            try {
                spanError = document.getElementById('msAuthError');
                if (spanError) {
                    spanError.style.display = 'none';
                }
                if (popupAuth) {
                    popupAuth.close();
                }
                popupAuth = null;
                clearPopupAuthTimer();
                var lastInteractive = (userClick === true);
                responded = false;

                var tokenInfo = window.opener.getOffice365Auth();
                if (tokenInfo) {
                    handleAuthBusinessResult(tokenInfo, null, '');
                    return;
                } else if (!lastInteractive) {
                    var authorizeDiv = document.getElementById('msEditorAuthorize');
                    if (authorizeDiv) {
                        toggleLoading(false);
                        if (authorizeDiv) {
                            authorizeDiv.style.display = 'block';
                        }
                    } else {
                        window.close();
                    }
                    return;
                }

                var isDemo = <%=JsonConvert.SerializeObject(Utils.UserSettings.Main.IsDemoMode.Value)%>;
                if (isDemo) {
                    toggleLoading(false);
                }

                var curUrl = window.location.href.toLowerCase();
                var hndlrPos = curUrl.indexOf('/handlers/');
                if (hndlrPos > 0) {
                    curUrl = curUrl.substr(0, hndlrPos);
                }
                var redirUrl = curUrl + '/Handlers/OneDriveForBusinessOAuthHandler.ashx';
                var authUrl = String.format(<%=JsonConvert.SerializeObject(Utils.GetAuthUrlForOneDriveForBusiness())%>,
                    encodeURIComponent(redirUrl) + '&edit=true',
                    encodeURIComponent('httpCommander=' + redirUrl + '/edit')
                );

                popupAuth = window.open(authUrl, 'onedriveforbusinessoauthauthorize',
                    getPopupProps(400, 500));
                if (popupAuth) {
                    try { popupAuth.focus(); }
                    catch (e) { }
                } else {
                    toggleLoading(false);
                    if (authorizeDiv) {
                        authorizeDiv.style.display = 'block';
                    }
                    if (spanError) {
                        var businessRoot = <%=JsonConvert.SerializeObject(Utils.UserSettings.Office.OneDriveForBusinessRootUrl.Value)%>;
                        spanError.innerHTML = <%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("CloudAuthNotCompleteMsg"))%>
                            + '<br /><span style="font-weight:normal;color:black;">'
                            + <%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("CloudTrustedSitesMsg"))%>
                            + '<span style="font-weight:bold;">https://login.microsoftonline.com'
                            + (Ext.isEmpty(businessRoot) ? '' : ('<br />' + Ext.util.Format.htmlEncode(businessRoot)))
                            + '<br />https://accounts.google.com<br />https://docs.google.com'
                            + '<br />https://login.live.com<br />https://onedrive.live.com</span><br /><br />'
                            + '(' + <%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("TrustedSitesForMicrosoftEdge"))%> + ')</span>';
                        spanError.style.display = 'inline-block';
                    }
                    return;
                }

                waitPopupAuthTimer = setTimeout(function () {
                    if (waitPopupAuthTimer) {
                        clearPopupAuthTimer();
                        if (/*!lastInteractive && */!responded) {
                            var authorizeDiv = document.getElementById('msEditorAuthorize');
                            if (authorizeDiv) {
                                toggleLoading(false);
                                authorizeDiv.style.display = 'block';
                            }
                        }
                    } else {
                        clearPopupAuthTimer();
                    }
                }, 15000); // 15 seconds
            } catch (e) {
                ProcessScriptError(e);
            }
        }

        function handleAuthBusinessResult(token, error, webdav) {
            msAuthResult = null;
            try {
                responded = true;
                var _token = token && Ext.isObject(token) ? Ext.apply({}, token) : null;
                if (_token && token.UserInfo)
                    _token.UserInfo = Ext.apply({}, token.UserInfo);
                var _error = error ? (Ext.isObject(error) ? Ext.apply({}, error) : {
                    error: null,
                    error_description: String(error)
                }) : null;
                if (_error) {
                    invokeEventFromOpener(_error);
                    return;
                }
                var tm = setTimeout(function () {
                    try {
                        clearTimeout(tm);
                        clearPopupAuthTimer();
                        if (popupAuth && !popupAuth.closed) {
                            popupAuth.close();
                        }
                        popupAuth = null;
                        if (_token && webdav != '')
                            _token.WebDAVRoot = webdav;
                        msAuthResult = _token;
                        invokeEventFromOpener(_token, 'auth');
                    } catch (e) {
                        ProcessScriptError(e);
                        return;
                    }
                    sendToDrive();
                }, 100);
            } catch (e) {
                ProcessScriptError(e);
            }
        }

        function getAndHtmlEncodeMessage (obj, defaultMsg, encode) {
            var msg = null;
            if (obj) {
                msg = obj.message;
                if (!msg || msg == '')
                    msg = obj.msg;
                if (!msg || msg == '')
                    msg = obj.error;
                if (!msg || msg == '')
                    msg = obj.errors;
                if (!msg || msg == '')
                    msg = defaultMsg;
            }
            if (!msg) {
                msg = defaultMsg;
            }
            return (encode === true ? Ext.util.Format.htmlEncode(String(msg)) : String(msg));
        }

        function checkDirectHandlerResult (data, trans) {
            if (typeof data == 'undefined' || !data) {
                return getAndHtmlEncodeMessage(trans,
                    <%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("UploadFromUrlUnknownResponse"))%>, true);
            }
            if ((typeof data.success != 'undefined' && !data.success) ||
                (typeof data.status != 'undefined' && data.status != 'success')) {
                if (!data.connect) {
                    toggleLoading(false);
                    var authorizeDiv = document.getElementById('msEditorAuthorize');
                    if (authorizeDiv) {
                        authorizeDiv.style.display = 'block';
                    }
                    if (!Ext.isEmpty(data.message)) {
                        var spanError = document.getElementById('msAuthError');
                        if (spanError) {
                            spanError.innerHTML = data.message;
                            spanError.style.display = 'inline-block';
                        }
                    }
                } else {
                    return getAndHtmlEncodeMessage(data,
                        <%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("UploadFromUrlUnknownResponse"))%>);
                }
            }
            return null;
        }

        function sendToDrive() {
            try {
                var loadingText = document.getElementById('loading-text');
                if (loadingText) {
<% if (CreateNew)
   { %>
                    loadingText.innerHTML = <%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("ProgressCreating"))%>;
<% }
   else
   { %>
                    loadingText.innerHTML = <%=JsonConvert.SerializeObject(string.Format(Utils.LocalizationsManager.GetString("CloudDownloadingMessage"), "Office 365"))%>;
<% } %>
                }
                toggleLoading(true);
                var authorizeDiv = document.getElementById('msEditorAuthorize');
                if (authorizeDiv) {
                    authorizeDiv.style.display = 'none';
                }

                var upInfo = {
                    edit: true,
                    folderId: null,
                    create: <%=JsonConvert.SerializeObject(CreateNew)%>,
                    selections: {
                        'path': <%=JsonConvert.SerializeObject(CurrentFolder)%>,
                        'files': [<%=JsonConvert.SerializeObject(CurrentDocName)%>],
                        'folders': [],
                        'filesCount': 1,
                        'foldersCount': 0
                    },
                    wat: msAuthResult
                };

                Ext.Ajax.timeout = 4320000; // 3 hours
                HttpCommander.OneDriveForBusiness.Download(upInfo, function (data, trans) {
                    var error = checkDirectHandlerResult(data, trans);

                    if (Ext.isEmpty(error) && data && !data.connect) {
                        invokeEventFromOpener(null, 'auth');
                        return;
                    }

                    if (!Ext.isEmpty(error)) {
                        invokeEventFromOpener(error);
                        return;
                    }

                    var docEditInfo = data.docEditInfo;

                    if (!Ext.isObject(docEditInfo)
                        || Ext.isEmpty(docEditInfo.eTag)
                        || Ext.isEmpty(docEditInfo.id)
                        || Ext.isEmpty(docEditInfo.webLink)) {
                        invokeEventFromOpener(<%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("EditInOffice365LinkError"))%>);
                        return;
                    }

                    invokeEventFromOpener(docEditInfo, 'send');

                    var eTag = docEditInfo.eTag;
                    var b1 = eTag.indexOf('{');
                    var b2 = eTag.indexOf('}');
                    if (b2 >= 0) {
                        eTag = eTag.substring(0, b2 + 1);
                    }
                    if (b1 >= 0) {
                        eTag = eTag.substring(b1);
                    }
                    var editLink = docEditInfo.webLink;
                    var docsPos = editLink.toLowerCase().indexOf('/documents/');
                    if (docsPos >= 0) {
                        editLink = editLink.substring(0, docsPos)
                            + '/_layouts/15/WopiFrame.aspx?action=edit&sourcedoc='
                            + eTag;
                    }
                    setTimeout(function() {
                        if (loadingText) {
                            var loadingImg = document.getElementById('loading-image');
                            if (loadingImg) {
                                loadingImg.style.display = 'none';
                            }
                            loadingText.innerHTML = '<a href="' + Ext.util.Format.htmlEncode(editLink) + '" target="_self"><%=HttpUtility.HtmlEncode(Utils.LocalizationsManager.GetString("EditInServiceLink"))%></a>';
                        }
                        try {
                            if (!!window.addEventListener) {
                                window.addEventListener('popstate', function () {
                                    try {
                                        var locHash = window.location.hash;
                                        if (locHash == '#noback' || locHash == 'noback') {
                                            window.close();
                                        }
                                    } catch (err) {
                                        ProcessScriptError(err, true);
                                    }
                                });
                            } else if (!!window.attachEvent) { // fix for IE8
                                window.attachEvent('onpopstate', function () {
                                    try {
                                        var locHash = window.location.hash;
                                        if (locHash == '#noback' || locHash == 'noback') {
                                            window.close();
                                        }
                                    } catch (err) {
                                        ProcessScriptError(err, true);
                                    }
                                });
                            }
                        } catch (err) {
                            ProcessScriptError(err, true);
                        }
                        window.location.href = editLink;
                    }, 50);
                });
            } catch (e) {
                ProcessScriptError(e);
            }
        }

        function toggleLoading(show) {
            var loadingMask = document.getElementById('loading-mask');
            if (loadingMask) {
                loadingMask.style.display = show ? 'block' : 'none';
            }
        }
    </script>
    <% } %>
</head>
<body>
    <form runat="server">
        <div id="loading-mask">
            <div id="loading">
                <table id="loading-message">
                    <tr>
                        <td>
                            <img id="loading-image" width="32" height="32" alt="" src="../Images/loading.gif" />
                        </td>
                        <td>
                            <span id="loading-text"><%=Utils.LocalizationsManager.GetString("ProgressLoading") %></span>...
                        </td>
                    </tr>
                </table>
            </div>
            <% if (AllowEditing)
               { %>
            <script type="text/javascript" src="../Scripts/ext-base<%=Utils.BuildModeJs%>.js"></script>
            <script type="text/javascript" src="../Scripts/ext-all<%=Utils.BuildModeJs%>.js"></script>
            <%=JavaScriptIncludes.Instance.IncludeExtJSLocale("../")%>
            <script type="text/javascript" src="OneDriveForBusinessHandler.ashx"></script>
            <script type="text/javascript">
                Ext.onReady(function () {
                    try {
                        var url = HttpCommander.Remote.OneDriveForBusinessHandler.url;
                        if (url.toLowerCase().indexOf('handlers/') == 0) {
                            HttpCommander.Remote.OneDriveForBusinessHandler.url = url.substring(9);
                        }
                        Ext.Direct.addProvider(HttpCommander.Remote.OneDriveForBusinessHandler);
                        checkAuth(false);
                    } catch (e) {
                        ProcessScriptError(e);
                    }
                });
            </script>
            <% } %>
        </div>
        <% if (AllowEditing)
           { %>
        <div id="msEditorAuthorize" style="display: none; text-align: center; vertical-align: middle; margin: auto; min-width: 100%;">
            <br />
            <span style="padding: 10px;">
                <%=string.Format(Utils.LocalizationsManager.GetString("CloudAuthenticateMessage"),
                    "Office 365",
                    string.Format(Utils.LocalizationsManager.GetString("CloudAuthenticateLink"), "Office 365"),
                    "<a href='../Localization/Help/UsersHelp-en.html#onedrive' target='_blank'>", "</a>")%>
            </span>
            <br />
            <br />
            <br />
            <div style="text-align: center; width: 100%;">
                <img width='16' height='16' src="../Images/office365.png" style="vertical-align: middle;" />&nbsp;
                <a href='#' target="_self" onclick="checkAuth(true);return false;"><%=string.Format(Utils.LocalizationsManager.GetString("CloudAuthenticateLink"), "Office 365")%></a>
                <% if (Utils.UserSettings.Main.IsDemoMode.Value)
                   {  %>
                <br /><br /><span id="demo-account" class="demo-account-field">Demo&nbsp;account:&nbsp;
                    <input id="demo-name" readonly onclick="this.select();" type="text" value="" />&nbsp;
                    <input id="demo-pass" readonly onclick="this.select();" type="text" value="" /></span>
                <script type="text/javascript">
                    var demoAccountSpan = document.getElementById('demo-account');
                    if (demoAccountSpan) {
                        try {
                            if (!window.OneDriveForBusinessDemoName || String(window.OneDriveForBusinessDemoName).trim().length == 0
                            || !window.OneDriveForBusinessDemoPass || String(window.OneDriveForBusinessDemoPass).trim().length == 0) {
                                demoAccountSpan.style.display = 'none';
                            } else {
                                var demoNameInput = document.getElementById('demo-name');
                                if (demoNameInput) {
                                    demoNameInput.value = window.OneDriveForBusinessDemoName;
                                    var demoPassInput = document.getElementById('demo-pass');
                                    if (demoPassInput) {
                                        demoPassInput.value = window.OneDriveForBusinessDemoPass;
                                    } else {
                                        demoAccountSpan.style.display = 'none';
                                    }
                                } else {
                                    demoAccountSpan.style.display = 'none';
                                }
                            }
                        } catch (e) {
                            demoAccountSpan.style.display = 'none';
                        }
                    }
                </script>
                <% } %>
            </div>
            <br /><br />
            <span id="msAuthError" style="display:none;font-weight:bold;color:red;"></span>
        </div>
        <% } %>
    </form>
    <% if (AllowEditing && !CreateNew)
       { %>
    <script type="text/javascript">
        if (window.opener) { try { window.opener['refreshRecentFromEditor'](); } catch (e) { } }
    </script>
    <% } %>
</body>
</html>
