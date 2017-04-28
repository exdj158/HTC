<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="MSOOEditor.aspx.cs" Inherits="HttpCommander.MSOOEditor" %>

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
                    fn = 'handleMSOOEditorSend';
                    break;
                case 'auth':
                    fn = 'handleMSOOEditorAuth';
                    break;
                default:
                    fn = 'handleMSOOEditorError';
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
        var msAuthResult = null,
            msAboutInfo = null,
            isInited = false,
            isHostedMode =<%=JsonConvert.SerializeObject(Utils.UserSettings.Main.IsHostedMode.Value)%>,
            // extended scopes: ['wl.signin', 'wl.offline_access', 'wl.skydrive', 'wl.skydrive_update', 'office.onenote_create', 'onedrive.readwrite', 'onedrive.appfolder']; // see https://dev.onedrive.com/auth/msa_oauth.htm 
            scope = ['wl.signin', 'wl.skydrive', 'wl.skydrive_update' ]; // see https://msdn.microsoft.com/en-us/library/dn631845.aspx#extended

        function checkAuth(userClick) {
            toggleLoading(true);
            if (!isInited) {
                var curUrl = window.location.href.toLowerCase();
                var hndlrPos = curUrl.indexOf('/handlers/');
                if (hndlrPos > 0) {
                    curUrl = curUrl.substr(0, hndlrPos);
                }
                try {
                    WL.init({
                        'client_id': <%=JsonConvert.SerializeObject(Utils.UserSettings.Office.LiveConnectAppClientID.Value)%>,
                        'redirect_uri': isHostedMode ? 'https://' + window.location.hostname.substring(window.location.hostname.indexOf('.') + 1, window.location.hostname.length).toLowerCase() + '/onedrive-callback.html': 
                                        curUrl + '/scripts/clouds/onedrive-callback.html',
                        'scope': scope
                    });
                    isInited = true;
                } catch (e) {
                    isInited = false;
                    ProcessScriptError(e);
                    return;
                }
            }
            try {
                if (userClick) {
                    var isDemo = <%=JsonConvert.SerializeObject(Utils.UserSettings.Main.IsDemoMode.Value)%>;
                    if (isDemo) {
                        toggleLoading(false);
                    }
                    WL.login({ 'scope': scope }).then(
                        function (responseOk) {
                            if (responseOk && responseOk.session) {
                                fillAboutInfo();
                            }
                            handleAuthResult(responseOk);
                        },
                        function (responseFailed) {
                            handleAuthResult(responseFailed);
                        }
                    );
                } else {
                    WL.getLoginStatus().then(
                        function (responseOk) {
                            if (responseOk && responseOk.session) {
                                fillAboutInfo();
                            }
                            handleAuthResult(responseOk);
                        },
                        function (responseFailed) {
                            handleAuthResult(responseFailed);
                        }
                    );
                }
            } catch (e) {
                ProcessScriptError(e);
            }
        }

        function fillAboutInfo () {
            msAboutInfo = null;
            // see: https://msdn.microsoft.com/EN-US/library/office/dn659736.aspx#Requesting_info
            try {
                WL.api({ 'path': 'me', 'method': 'GET' }).then(
                    function (meResponse) {
                        msAboutInfo = meResponse;
                        // see: https://msdn.microsoft.com/en-us/library/office/dn659731.aspx#get_a_user_s_total_and_remaining_onedrive_storage_quota
                        WL.api({ 'path': 'me/skydrive/quota', 'method': 'GET' }).then(
                            function (quotaResoponse) {
                                if (msAboutInfo && quotaResoponse && quotaResoponse.available)
                                    msAboutInfo.freeSpace = quotaResoponse.available;
                            },
                            function (quotaResponseFailed) {
                                if (msAboutInfo)
                                    msAboutInfo.freeSpace = -1;
                            }
                        );
                    },
                    function (meResponseFailed) {
                        msAboutInfo = null;
                    }
                );
            } catch (e) {
                // ignore
            }
        }

        function handleAuthResult (authResponse) {
            msAuthResult = null;
            var session, nextStep = false, spanError;
            try {
                spanError = document.getElementById('msAuthError');
                if (spanError) {
                    spanError.style.display = 'none';
                }
                var authorizeDiv = document.getElementById('msEditorAuthorize');
                if (authResponse && !authResponse.error && (session = WL.getSession())) {
                    msAuthResult = session;
                    invokeEventFromOpener({
                        auth: msAuthResult,
                        about: msAboutInfo
                    }, 'auth');
                    if (authorizeDiv) {
                        authorizeDiv.style.display = 'none';
                    }
                    nextStep = true;
                } else {
                    msAuthResult = null;
                    toggleLoading(false);
                    if (authorizeDiv) {
                        authorizeDiv.style.display = 'block';
                    }
                    if (spanError) {
                        var error = null;
                        if (authResponse && authResponse.error && Ext.isObject(authResponse.error))
                            error = String(authResponse.error.message || authResponse.error.code).replace(/\+/g, ' ');
                        if (!error && authResponse && (authResponse.error || authResponse.error_description)) {
                            error = Ext.util.Format.htmlEncode(String(authResponse.error_description || authResponse.error).replace(/\+/g, ' '));
                        } else if (error) {
                            error = Ext.util.Format.htmlEncode(String(error).replace(/\+/g, ' '));
                        }
                        if (error) {
                            if (error.toLowerCase().indexOf("'focus'") >= 0 || error.toLowerCase().indexOf("'onerror'") >= 0) {
                                var businessRoot = <%=JsonConvert.SerializeObject(Utils.UserSettings.Office.OneDriveForBusinessRootUrl.Value)%>;
                                error += '<br /><br /><span style="font-weight:normal;color:black;">' + <%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("SkyDriveAuthAlsoString"))%>
                                    + <%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("CloudTrustedSitesMsg"))%>
                                    + '<span style="font-weight:bold;">https://login.live.com<br />https://onedrive.live.com'
                                    + '<br />https://accounts.google.com<br />https://docs.google.com'
                                    + '<br />https://login.microsoftonline.com'
                                    + (Ext.isEmpty(businessRoot) ? '' : ('<br />' + Ext.util.Format.htmlEncode(businessRoot)))
                                    + '</span><br /><br />'
                                    + '(' + <%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("TrustedSitesForMicrosoftEdge"))%> + ')</span>';
                            }
                            spanError.innerHTML = error;
                            spanError.style.display = 'inline-block';
                        }
                    }
                }
            } catch (e) {
                ProcessScriptError(e);
            }
            if (nextStep) {
                sendToDrive();
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
                    loadingText.innerHTML = <%=JsonConvert.SerializeObject(string.Format(Utils.LocalizationsManager.GetString("CloudDownloadingMessage"), "OneDrive"))%>;
<% } %>
                }
                toggleLoading(true);
                var upInfo = {
                    edit: true,
                    folderId: null,
                    create: <%=JsonConvert.SerializeObject(CreateNew)%>,
                    folderUrl: 'https://apis.live.net/v5.0/me/skydrive/files/',
                    selections: {
                        'path': <%=JsonConvert.SerializeObject(CurrentFolder)%>,
                        'files': [<%=JsonConvert.SerializeObject(CurrentDocName)%>],
                        'folders': [],
                        'filesCount': 1,
                        'foldersCount': 0
                    },
                    wat: msAuthResult
                };
                if (msAboutInfo) {
                    upInfo['freeSpace'] = msAboutInfo.freeSpace;
                }

                Ext.Ajax.timeout = 4320000; // 3 hours
                HttpCommander.SkyDrive.Download(upInfo, function (data, trans) {
                    var error = checkDirectHandlerResult(data, trans);

                    if (Ext.isEmpty(error) && data && !data.connect) {
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
                        return;
                    }

                    if (!Ext.isEmpty(error)) {
                        invokeEventFromOpener(error);
                        return;
                    }

                    var docEditInfo = data.docEditInfo;

                    if (!Ext.isObject(docEditInfo) || Ext.isEmpty(docEditInfo.link) ||
                         Ext.isEmpty(docEditInfo.id) || Ext.isEmpty(docEditInfo.source)) {
                        invokeEventFromOpener(<%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("EditInMSOOLinkError"))%>);
                        return;
                    }

                    invokeEventFromOpener(docEditInfo, 'send');
                    var newUrl = docEditInfo.link.toLowerCase().replace('/redir.aspx?', '/edit.aspx?');
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
            <script type="text/javascript" src="SkyDriveHandler.ashx"></script>
            <script src="//js.live.net/v5.0/wl<%=Utils.DebugModeJs?".debug":""%>.js"></script>
            <script type="text/javascript">
                Ext.onReady(function () {
                    try {
                        var url = HttpCommander.Remote.SkyDriveHandler.url;
                        if (url.toLowerCase().indexOf('handlers/') == 0) {
                            HttpCommander.Remote.SkyDriveHandler.url = url.substring(9);
                        }
                        Ext.Direct.addProvider(HttpCommander.Remote.SkyDriveHandler);
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
                    "OneDrive",
                    string.Format(Utils.LocalizationsManager.GetString("CloudAuthenticateLink"), "OneDrive"),
                    "<a href='../Localization/Help/UsersHelp-en.html#onedrive' target='_blank'>", "</a>")%>
            </span>
            <br />
            <br />
            <br />
            <div style="text-align: center; width: 100%;">
                <img width='16' height='16' src="../Images/skydrive.png" style="vertical-align: middle;" />&nbsp;
                <a href='#' target="_self" onclick="checkAuth(true);return false;"><%=string.Format(Utils.LocalizationsManager.GetString("CloudAuthenticateLink"), "OneDrive")%></a>
                <% if (Utils.UserSettings.Main.IsDemoMode.Value)
                   {  %>
                <br /><br /><span id="demo-account" class="demo-account-field">Demo&nbsp;account:&nbsp;
                    <input id="demo-name" readonly onclick="this.select();" type="text" value="" />&nbsp;
                    <input id="demo-pass" readonly onclick="this.select();" type="text" value="" /></span>
                <script type="text/javascript">
                    var demoAccountSpan = document.getElementById('demo-account');
                    if (demoAccountSpan) {
                        try {
                            if (!window.OneDriveDemoName || String(window.OneDriveDemoName).trim().length == 0
                                || !window.OneDriveDemoPass || String(window.OneDriveDemoPass).trim().length == 0) {
                                demoAccountSpan.style.display = 'none';
                            } else {
                                var demoNameInput = document.getElementById('demo-name');
                                if (demoNameInput) {
                                    demoNameInput.value = window.OneDriveDemoName;
                                    var demoPassInput = document.getElementById('demo-pass');
                                    if (demoPassInput) {
                                        demoPassInput.value = window.OneDriveDemoPass;
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
                <span id="msAuthError" style="display:none;font-weight:bold;color:red;"></span>
            </div>
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
