<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Viewer.aspx.cs" Inherits="HttpCommander.Viewer" %>

<%@ Import Namespace="HttpCommander" %>
<%@ Import Namespace="Newtonsoft.Json" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta content="NOINDEX, NOFOLLOW" name="ROBOTS" />
    <meta http-equiv="x-ua-compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0" />
    <script src="../Scripts/error-handler<%=Utils.BuildModeJs%>.js"></script>
    <link rel="shortcut icon" href="../favicon.ico" type="image/x-icon" />
    <script type="text/javascript">
        function htmlEnc(value) {
            return !value ? value : String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
        }

        function ProcessScriptError (e, withoutOpener) {
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
                if (!(withoutOpener === true)) {
                    invokeEventFromOpener(htmlEnc(e.message));
                }
                var debug = <%=JsonConvert.SerializeObject(Utils.DebugModeJs)%>;
                if (debug) {
                    if (!!window.console && !!window.console.log) {
                        window.console.log(e);
                    }
                    window.alert(e.message);
                }
            } catch (fe) {
                if (!!window.console && !!window.console.log) {
                    window.console.log(fe);
                }
                window.alert(fe.message);
            }
        }

        function invokeEventFromOpener(arg) {
            if (!!arg) {
                if (window.opener) {
                    try {
                        window.opener['handleViewerError'](arg);
                    } catch (e) {
                        if (!!window.console && !!window.console.log) {
                            window.console.log(e);
                        }
                        window.alert(e.message);
                    }
                } else {
                    if (!!window.console && !!window.console.log) {
                        window.console.log(arg);
                    }
                    window.alert(arg);
                }
            }
            window.close();
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
    <% if (AdobeImageUrl != null)
       { %>
    <style type="text/css">
        body { border: 0px; margin: 0px; padding: 0px; overflow: hidden; }
    </style>
    <% if (Request.IsSecureConnection)
       { %>
    <script type="text/javascript" src="https://dme0ih8comzn4.cloudfront.net/imaging/v3/editor.js"></script>
    <% }
       else
       { %>
    <script type="text/javascript" src="http://feather.aviary.com/imaging/v3/editor.js"></script>
    <% } %>
    <script type='text/javascript'>
        var srcUrl = <%=JsonConvert.SerializeObject(AdobeImageUrl)%>;
        var featherEditor = new Aviary.Feather({
            apiKey: <%=JsonConvert.SerializeObject(Utils.UserSettings.Office.AdobeClientId.Value)%>,
            displayImageSize: true,
            tools: 'all',
            noCloseButton: true,
            language: <%=JsonConvert.SerializeObject(Utils.CurrentTwoLetterLanguageName)%>,
            fileFormat: <%=JsonConvert.SerializeObject(AdobeSaveFormat)%>,
            appendTo: 'adobe_image_editor',
            onLoad: function() {
                launchEditor('image_for_edit', srcUrl);
            },
            onSave: function(imageID, newURL) {
                try {
                    var img = document.getElementById(imageID),
                        me = window,
                        saveUrl = srcUrl + '&adobesave=' + encodeURIComponent(newURL);
                    if (img) {
                        img.src = newURL;
                    }
                    if (me.opener) {
                        with (me.opener) {
                            Ext.Ajax.request({
                                url: saveUrl,
                                callback: function (opts, success, response) {
                                    var errorMessage = null;
                                    if (!!response && !Ext.isEmpty(response.responseText)) {
                                        try {
                                            var jsn = JSON.parse(response.responseText);
                                            if (!!jsn) {
                                                errorMessage = jsn.message;
                                            }
                                            if (Ext.isEmpty(errorMessage) && !success) {
                                                errorMessage = response.responseText || 'Unknown error';
                                            }
                                        } catch (e) {
                                            if (!success) {
                                                errorMessage = response.responseText || 'Unknown error';
                                            }
                                        }
                                    }
                                    if (Ext.isEmpty(errorMessage)) {
                                        adobeImageSaved(<%=JsonConvert.SerializeObject(AdobeWaitId)%>);
                                    } else {
                                        me.invokeEventFromOpener.call(me, Ext.util.Format.htmlEncode(errorMessage));
                                    }
                                }
                            });
                        }
                    }
                } catch (e) {
                    ProcessScriptError(e);
                }
            },
            onError: function(e) {
                ProcessScriptError(e);
            }
        });
        function launchEditor(id, src) {
            try {
                featherEditor.launch({
                    image: id,
                    url: src
                });
            } catch (e) {
                ProcessScriptError(e);
            }
            return false;
        }
        </script>
    <% }
       else
       { %>
    <link rel="stylesheet" type="text/css" href="../Styles-min.css" />
    <% if (AllowViewing)
       { %>
    <script type="text/javascript">
        function getAndHtmlEncodeMessage (obj, defaultMsg) {
            var msg = null;
            if (obj) {
                msg = obj.message;
                if (Ext.isEmpty(msg))
                    msg = obj.msg;
                if (Ext.isEmpty(msg))
                    msg = obj.error;
                if (Ext.isEmpty(msg))
                    msg = obj.errors;
            }
            if (Ext.isEmpty(msg)) {
                msg = defaultMsg;
            }
            return String(msg);
        }

        function checkDirectHandlerResult (data, trans) {
            if (typeof data == 'undefined' || !data) {
                return getAndHtmlEncodeMessage(trans,
                    <%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("UploadFromUrlUnknownResponse"))%>);
            }
            if ((typeof data.success != 'undefined' && !data.success) ||
                (typeof data.status != 'undefined' && data.status != 'success')) {
                return getAndHtmlEncodeMessage(data,
                    <%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("UploadFromUrlUnknownResponse"))%>);
            }
            return null;
        }

        function getPixlrUrl(url, fileName) {
            var referrer = <%=JsonConvert.SerializeObject(Utils.LocalizationsManager.GetString("CommonMainTitle"))%>;
            <% if (Utils.UserSettings.Office.UseGETMethodWhenSavingPixlrImages.Value)
               { %>
            var method = 'GET';
            <% }
               else
               { %>
            var method = 'POST';
            <% } %>
            var proto = 'http';
            <% if (Utils.IsSSLConnection())
               { %>
            proto += 's';
            <% } %>
            var editUrl = proto + '://pixlr.com/editor/?s=c'
                + '&referrer=' + encodeURIComponent(referrer)
                + '&title=' + encodeURIComponent(fileName)
                + '&method=' + encodeURIComponent(method)
                + '&target=' + encodeURIComponent(url + '&pixlr=save');
            <% if (!CreateInPixlr)
               { %>
            editUrl += '&image=' + encodeURIComponent(url + '&pixlr=edit');
            <% } %>
            return editUrl;
        }

        function getLink() {
            var loadingText = document.getElementById('loading-text');
            if (loadingText) {
                loadingText.innerHTML = <%=JsonConvert.SerializeObject(ProgressMessage)%>;
            }
            var path = <%=JsonConvert.SerializeObject(ViewerType == AvailableViewers.Shortcut ? CurrentFolder : VirtualPath)%>;
            var svc = <%=JsonConvert.SerializeObject(ServiceName)%>;
            var fileName = <%=JsonConvert.SerializeObject(CurrentDocName)%>;
            var fileInfo = {
                path: path
            };
            if (!Ext.isEmpty(svc)) {
                fileInfo.service = svc;
            }
            <% if (CreateInPixlr)
               { %>
            fileInfo.createFileName = true;
            <% }
               else if (ViewerType == AvailableViewers.Shortcut)
               { %>
            fileInfo.name = fileName;
            <% } %>
            Ext.Ajax.timeout = 1800000;
            var directMethod = <%=JsonConvert.SerializeObject(DirectMethod)%>;
            HttpCommander.Common[directMethod](fileInfo, function (data, trans) {
                try {
                    var error = checkDirectHandlerResult(data, trans);
                    if (!Ext.isEmpty(error)) {
                        invokeEventFromOpener(error);
                        return;
                    }
                    var url = data.url;
                    if (Ext.isEmpty(url)) {
                        invokeEventFromOpener('no url');
                        return;
                    }
                <% if (ViewerType == AvailableViewers.Adobe)
                   { %>
                    var viewUrl = '?adobe=' + encodeURIComponent(url) + '&format=' + <%=JsonConvert.SerializeObject(AdobeSaveFormat)%>
                        + '&filename=' + encodeURIComponent(<%=JsonConvert.SerializeObject(CurrentDocName)%>)
                        + '&adbid=' + encodeURIComponent(<%=JsonConvert.SerializeObject(AdobeWaitId)%>);
                <% }
                   else if (ViewerType == AvailableViewers.Box || ViewerType == AvailableViewers.Shortcut || ViewerType == AvailableViewers.Adobe)
                   { %>
                    var viewUrl = url;
                <% }
                   else if (ViewerType == AvailableViewers.Zoho)
                   { %>
                    var viewUrl = url + '&zoho=post';
                <% }
                   else if (ViewerType == AvailableViewers.Pixlr)
                   { %>
                    var viewUrl = getPixlrUrl(url, fileName);
                <% }
                   else
                   { %>
                    var viewUrl = <%=JsonConvert.SerializeObject(ViewerUrl)%>;
                    <% if (ViewerType == AvailableViewers.Google)
                       { %>
                    var url_parts = url.split('?');
                    url = url_parts[0] + '/' + fileName.replace(/%/g, "%25").replace(/#/g, "%23");
                    for (var i = 1; i < url_parts.length; i++) {
                        url += '?' + url_parts[i];
                    }
                    <% }
                       else if (ViewerType == AvailableViewers.ShareCad)
                       { %>
                    url += '&filename=/' + fileName;
                    <% } %>
                    viewUrl += encodeURIComponent(url);
                <% } %>
                    setTimeout(function() {
                        if (loadingText) {
                            var loadingImg = document.getElementById('loading-image');
                            if (loadingImg) {
                                loadingImg.style.display = 'none';
                            }
                            loadingText.innerHTML = '<a href="' + Ext.util.Format.htmlEncode(viewUrl) + '" target="_self"><%=HttpUtility.HtmlEncode(Utils.LocalizationsManager.GetString("ViewInServiceLink"))%></a>';
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
                        window.location.href = viewUrl;
                    }, 50);
                } catch (e) {
                    ProcessScriptError(e);
                }
            });
        }
    </script>
    <link href="../Images/resources_1.5/css/ext-all-notheme.css" type="text/css" rel="stylesheet" />
    <% } %>
    <% } %>
</head>
<body>
    <% if (AdobeImageUrl != null)
       { %>
    <div id="adobe_image_editor"></div>
    <table style="width:100%;height:100%" width="100%" height="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td style="text-align:center;vertical-align:middle" align="center" valign="middle">
                <img id="image_for_edit" style="display:none;" src="<%=HttpUtility.HtmlEncode(AdobeImageUrl)%>" />
            </td>
        </tr>
    </table>
    <% }
       else
       { %>
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
            <% if (AllowViewing)
               { %>
            <script type="text/javascript" src="../Scripts/ext-base<%=Utils.BuildModeJs%>.js"></script>
            <script type="text/javascript" src="../Scripts/ext-all<%=Utils.BuildModeJs%>.js"></script>
            <%=JavaScriptIncludes.Instance.IncludeExtJSLocale("../")%>
            <script type="text/javascript" src="CommonHandler.ashx"></script>
            <script type="text/javascript">
                Ext.onReady(function () {
                    try {
                        var url = HttpCommander.Remote.CommonHandler.url;
                        if (url.toLowerCase().indexOf('handlers/') == 0) {
                            HttpCommander.Remote.CommonHandler.url = url.substring(9);
                        }
                        Ext.Direct.addProvider(HttpCommander.Remote.CommonHandler);
                        getLink();
                    } catch (e) {
                        ProcessScriptError(e);
                    }
                });
            </script>
            <% } %>
        </div>
    </form>
    <% } %>
</body>
</html>
