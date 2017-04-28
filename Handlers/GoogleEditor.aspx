<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="GoogleEditor.aspx.cs" Inherits="HttpCommander.GoogleEditor" %>

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
        <% if (Utils.UserSettings.Main.IsHostedMode.Value && String.IsNullOrEmpty(Request.QueryString["token"]))
           { %>
        window.location =  'https://' + window.location.hostname.substring(window.location.hostname.indexOf('.') + 1, window.location.hostname.length).toLowerCase() + '/googledrive-callback.html?domain='+encodeURIComponent(window.location.href);
        <% } %>
        function ProcessScriptError (e) {
            if (window.waitExtJsInterval) {
                clearInterval(window.waitExtJsInterval);
                window.waitExtJsInterval = null;
            }
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
                window.alert(fe);
            }
        }

        function invokeEventFromOpener(arg, event) {
            var fn, isError = false;
            switch (event) {
                case 'send':
                    fn = 'handleGoogleEditorSend';
                    break;
                case 'auth':
                    fn = 'handleGoogleEditorAuth';
                    break;
                default:
                    fn = 'handleGoogleEditorError';
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
        var googleAuthResult = null,
            googleAboutInfo = null,
            extReady = false,
            waitExtJsInterval;

        function getParameterByName(name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        function checkAuth(userClick) {
            var isDemo = <%=JsonConvert.SerializeObject(Utils.UserSettings.Main.IsDemoMode.Value)%>;
            var isHosted =<%=JsonConvert.SerializeObject(Utils.UserSettings.Main.IsHostedMode.Value)%>;

            if (isHosted)
            {
                if(getParameterByName("token") != null && getParameterByName("token") != undefined)
                {
                    setToken();
                    loadDriveApi();
                }
                else
                    window.location =  'https://' + window.location.hostname.substring(window.location.hostname.indexOf('.') + 1, window.location.hostname.length).toLowerCase() + '/googledrive-callback.html?domain='+encodeURIComponent(window.location.href);
            }
            else
            {
                toggleLoading(!isDemo);
                if (!extReady) {
                    if (!waitExtJsInterval) {
                        waitExtJsInterval = setInterval(function () {
                            if (extReady) {
                                clearInterval(waitExtJsInterval);
                                waitExtJsInterval = null;
                                checkAuth(userClick);
                            }
                        }, 300);
                    }
                    return;
                } else if (waitExtJsInterval) {
                    clearInterval(waitExtJsInterval);
                    waitExtJsInterval = null;
                }
                try {
                    gapi.auth.authorize({
                        'client_id': <%=JsonConvert.SerializeObject(Utils.UserSettings.Office.GoogleClientId.Value)%>,
                        'scope': ['https://www.googleapis.com/auth/drive'],
                        'immediate': !userClick
                    }, handleAuthResult);
                    var waitPopupAuthTimer = setTimeout(function () {
                        try {
                            clearTimeout(waitPopupAuthTimer);
                        } catch (e) { }
                        handleAuthResult(null, userClick);
                    }, 10000); // 10 seconds
                } catch (e) {
                    ProcessScriptError(e);
                }
            }
        }

        function setToken()
        {
            gapi.auth.setToken({
                'access_token': getParameterByName("token"),
                'expires_in': getParameterByName("expires_in")
            });
            googleAuthResult = gapi.auth.getToken();
        }

        function handleAuthResult(authResult, userClick) {
            var spanError = document.getElementById('googleAuthError');
            if (spanError) {
                spanError.style.display = 'none';
            }
            var nextStep = false;
            googleAuthResult = null;
            googleAboutInfo = null;
            try {
                var authorizeDiv = document.getElementById('googleEditorAuthorize');
                if (!!authResult && !authResult.error) {
                    googleAuthResult = authResult;
                    if (authorizeDiv) {
                        authorizeDiv.style.display = 'none';
                    }
                    nextStep = true;
                } else {
                    toggleLoading(false);
                    if (authorizeDiv) {
                        authorizeDiv.style.display = 'block';
                        if (spanError && ((!authResult && !!userClick) || (!!authResult && !Ext.isEmpty(authResult.error) &&
                            String(authResult.error).toLowerCase().indexOf('immediate_failed') < 0))) {
                            var authError = null;
                            if (!authResult) {
                                authError = <%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("CloudAuthNotCompleteMsg"))%>;
                                var agt = window.navigator.userAgent.toLowerCase();
                                if (agt.indexOf('msie') >= 0 ||
                                    document.documentMode && (document.documentMode >= 11) ||
                                    agt.indexOf('edge/') >= 0) {
                                    authError += <%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("CloudTrustedSitesMsg"))%>
                                        + '<span style="color:black;">https://*.google.com<br />'
                                        + 'https://oauth.googleusercontent.com<br />'
                                        + 'https://*.gstatic.com<br />'
                                        + 'https://*.googleapis.com</span><br /><br />'
                                        + '(' + <%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("TrustedSitesForMicrosoftEdge"))%> + ')';
                                } else {
                                    var brPos = authError.toLowerCase().lastIndexOf('<br />');
                                    if (brPos > 0) {
                                        authError = authError.substring(0, brPos);
                                    }
                                }
                            } else {
                                authError = Ext.util.Format.htmlEncode(authResult.error);
                            }
                            spanError.innerHTML = authError;
                            spanError.style.display = 'inline-block';
                        }
                    }
                }
            } catch (e) {
                ProcessScriptError(e);
            }
            if (nextStep) {
                loadDriveApi();
            }
        }

        function loadDriveApi() {
            toggleLoading(true);
            try {
                gapi.client.load('drive', 'v2', function () {
                    if (googleAboutInfo) {
                        invokeEventFromOpener({
                            auth: googleAuthResult,
                            about: googleAboutInfo
                        }, 'auth');
                        sendToDrive();
                    } else {
                        gapi.client.drive.about.get().execute(function (aboutResp) {
                            googleAboutInfo = aboutResp;
                            invokeEventFromOpener({
                                auth: googleAuthResult,
                                about: googleAboutInfo
                            }, 'auth');
                            sendToDrive();
                        });
                    }
                });
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
                if (data.needAuth) {
                    toggleLoading(false);
                    var authorizeDiv = document.getElementById('googleEditorAuthorize');
                    if (authorizeDiv) {
                        authorizeDiv.style.display = 'block';
                    }
                    if (!Ext.isEmpty(data.message)) {
                        var spanError = document.getElementById('googleAuthError');
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
<% if (!string.IsNullOrWhiteSpace(GoogleMimeTypeForNew))
   { %>
        function sendToDrive() {
            try {
                var loadingText = document.getElementById('loading-text');
                if (loadingText) {
                    loadingText.innerHTML = <%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("ProgressCreating"))%>;
                }
                toggleLoading(true);
                var request = gapi.client.request({
                    'path': '/drive/v2/files',
                    'method': 'POST',
                    'headers': {
                        'Content-Type': 'application/json'
                    },
                    'body': '{"mimeType":<%=JsonConvert.SerializeObject(GoogleMimeTypeForNew)%>,"title":<%=JsonConvert.SerializeObject(CurrentDocName)%>}'
                });
                request.execute(function (file) {
                    if (!Ext.isObject(file) || Ext.isEmpty(file.id) || Ext.isEmpty(file.alternateLink)) {
                        invokeEventFromOpener(<%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("EditInGoogleLinkError"))%>);
                        return;
                    }

                    invokeEventFromOpener(file, 'send');
                    var newUrl = file.alternateLink;
                    setTimeout(function() {
                        if (loadingText) {
                            var loadingImg = document.getElementById('loading-image');
                            if (loadingImg) {
                                loadingImg.style.display = 'none';
                            }
                            loadingText.innerHTML = '<a href="' + Ext.util.Format.htmlEncode(newUrl) + '" target="_self"><%=HttpUtility.HtmlEncode(Utils.LocalizationsManager.GetString("EditInServiceLink"))%></a>';
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
                        window.location.href = newUrl;
                    }, 50);
                });
            } catch (e) {
                ProcessScriptError(e);
            }
        }
<% }
   else
   { %>
        function sendToDrive() {
            try {
                var loadingText = document.getElementById('loading-text');
                if (loadingText) {
                    loadingText.innerHTML = <%=JsonConvert.SerializeObject(string.Format(Utils.LocalizationsManager.GetString("CloudDownloadingMessage"), "Google Drive"))%>;
                }
                toggleLoading(true);
                var upInfo = {
                    edit: true,
                    importFormats: googleAboutInfo.importFormats,
                    maxUploadSizes: googleAboutInfo.maxUploadSizes,
                    quotaBytesTotal: googleAboutInfo.quotaBytesTotal,
                    quotaBytesUsed: googleAboutInfo.quotaBytesUsed,
                    folderId: null,
                    token: googleAuthResult.access_token,
                    selections: {
                        'path': <%=JsonConvert.SerializeObject(CurrentFolder)%>,
                        'files': [<%=JsonConvert.SerializeObject(CurrentDocName)%>],
                        'folders': [],
                        'filesCount': 1,
                        'foldersCount': 0
                    },
                    convert: true
                };

                Ext.Ajax.timeout = 4320000; // 3 hours
                HttpCommander.GoogleDrive.DownloadDocs(upInfo, function (data, trans) {
                    var error = checkDirectHandlerResult(data, trans);

                    if (Ext.isEmpty(error) && data && data.needAuth) {
                        return;
                    }

                    if (!Ext.isEmpty(error)) {
                        invokeEventFromOpener(error);
                        return;
                    }

                    var docEditInfo = data.docEditInfo;

                    if (!Ext.isObject(docEditInfo) || Ext.isEmpty(docEditInfo.id) || Ext.isEmpty(docEditInfo.alternateLink)) {
                        invokeEventFromOpener(<%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("EditInGoogleLinkError"))%>);
                        return;
                    }

                    invokeEventFromOpener(docEditInfo, 'send');
                    var newUrl = docEditInfo.alternateLink;
                    setTimeout(function() {
                        if (loadingText) {
                            var loadingImg = document.getElementById('loading-image');
                            if (loadingImg) {
                                loadingImg.style.display = 'none';
                            }
                            loadingText.innerHTML = '<a href="' + Ext.util.Format.htmlEncode(newUrl) + '" target="_self"><%=HttpUtility.HtmlEncode(Utils.LocalizationsManager.GetString("EditInServiceLink"))%></a>';
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
                        window.location.href = newUrl;
                    }, 50);
                });
            } catch (e) {
                ProcessScriptError(e);
            }
        }
<% } %>

        function toggleLoading(show) {
            var loadingMask = document.getElementById('loading-mask');
            if (loadingMask) {
                loadingMask.style.display = show ? 'block' : 'none';
            }
        }
    </script>
    <script src="https://apis.google.com/js/client.js?onload=checkAuth" async="async"></script>
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
            <script type="text/javascript" src="GoogleDriveHandler.ashx"></script>
            <script type="text/javascript">
                Ext.onReady(function () {
                    try {
                        var url = HttpCommander.Remote.GoogleDriveHandler.url;
                        if (url.toLowerCase().indexOf('handlers/') == 0) {
                            HttpCommander.Remote.GoogleDriveHandler.url = url.substring(9);
                        }
                        Ext.Direct.addProvider(HttpCommander.Remote.GoogleDriveHandler);
                        extReady = true;
                    } catch (e) {
                        extReady = true;
                        ProcessScriptError(e);
                    }
                });
            </script>
            <% } %>
        </div>
        <% if (AllowEditing)
           { %>
        <div id="googleEditorAuthorize" style="display: none; text-align: center; vertical-align: middle; margin: auto; min-width: 100%;">
            <br />
            <span style="padding: 10px;">
                <%=string.Format(Utils.LocalizationsManager.GetString("CloudAuthenticateMessage"),
                    "Google Drive",
                    string.Format(Utils.LocalizationsManager.GetString("CloudAuthenticateLink"), "Google Drive"),
                    "<a href='../Localization/Help/UsersHelp-en.html#googledrive' target='_blank'>", "</a>")%>
            </span>
            <br />
            <br />
            <br />
            <div style="text-align: center; width: 100%;">
                <img width='16' height='16' src="../Images/googledocs.png" style="vertical-align: middle;" />&nbsp;
                <a href='#' target="_self" onclick="checkAuth(true);return false;"><%=string.Format(Utils.LocalizationsManager.GetString("CloudAuthenticateLink"), "Google Drive")%></a>
            </div>
            <% if (Utils.UserSettings.Main.IsDemoMode.Value)
               {  %>
            <br /><br /><span id="demo-account" class="demo-account-field">Demo&nbsp;account:&nbsp;
                <input id="demo-name" readonly onclick="this.select();" type="text" value="" />&nbsp;
                <input id="demo-pass" readonly onclick="this.select();" type="text" value="" /></span>
            <script type="text/javascript">
                var demoAccountSpan = document.getElementById('demo-account');
                if (demoAccountSpan) {
                    try {
                        if (!window.GoogleDemoName || String(window.GoogleDemoName).trim().length == 0
                        || !window.GoogleDemoPass || String(window.GoogleDemoPass).trim().length == 0) {
                            demoAccountSpan.style.display = 'none';
                        } else {
                            var demoNameInput = document.getElementById('demo-name');
                            if (demoNameInput) {
                                demoNameInput.value = window.GoogleDemoName;
                                var demoPassInput = document.getElementById('demo-pass');
                                if (demoPassInput) {
                                    demoPassInput.value = window.GoogleDemoPass;
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
            <br /><br />
            <span id="googleAuthError" style="display:none;font-weight:bold;color:red;"></span>
        </div>
        <% } %>
    </form>
    <% if (AllowEditing && !CreateNew)
       { %>
    <script type="text/javascript">
        if (window.opener) try { window.opener['refreshRecentFromEditor'](); } catch (e) { }
    </script>
    <% } %>
</body>
</html>
