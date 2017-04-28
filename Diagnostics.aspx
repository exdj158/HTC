<%@ Page EnableViewState="false" Language="C#" AutoEventWireup="true" CodeBehind="Diagnostics.aspx.cs" Inherits="HttpCommander.Diagnostics" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>HTTP Commander Diagnostics</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta http-equiv="x-ua-compatible" content="IE=edge" />
    <meta content="NOINDEX, NOFOLLOW" name="ROBOTS" />
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    <script type="text/javascript" src="Scripts/diagnostics.js"></script>
    <script type="text/javascript">
        getXhrInstance = (function(){
            var options = [
                function() { return new XMLHttpRequest(); },
                function() { return new ActiveXObject('MSXML2.XMLHTTP.7.0'); },
                function() { return new ActiveXObject('MSXML2.XMLHTTP.6.0'); },
                function() { return new ActiveXObject('MSXML2.XMLHTTP.5.0'); },
                function() { return new ActiveXObject('MSXML2.XMLHTTP.4.0'); },
                function() { return new ActiveXObject('MSXML2.XMLHTTP.3.0'); },
                function() { return new ActiveXObject('MSXML2.XMLHTTP'); },
                function() { return new ActiveXObject('Microsoft.XMLHTTP'); }
            ], i = 0, len = options.length, xhr;
            for(; i < len; ++i) {
                try {
                    xhr = options[i];
                    xhr();
                    break;
                } catch(e) { }
            }
            return xhr;
        })();
        function xhrRequest(url, callback, ctx) {
            url = url || location.href;
            var x = getXhrInstance;
            var xhr = getXhrInstance();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    callback.call(ctx || window, xhr.responseText, xhr);
                }
            };
            xhr.send(null);
            return xhr;
        }
    </script>
    <% if (this.AllowSubmitForm)
       { %>
    <script type="text/javascript">
        var parseQueryString = function (paramName) {
            paramName = String(paramName || '');
            if (paramName == '')
                return '';
            paramName = paramName.toLowerCase();
            var qStr = window.location.search.substr(1).split('&');
            for (var i = 0; i < qStr.length; i++) {
                var keyVal = qStr[i].split('=');
                if (keyVal.length > 1 && decodeURIComponent(keyVal[0]).toLowerCase() == paramName)
                    return decodeURIComponent(keyVal[1]);
            }
            return '';
        };
        function onLoadBody() {
            try { checkScriptsAccess(); } catch (e) { }
            try {
                if (typeof postDiagHtml == 'function' && parseQueryString('senddiag') == '1')
                    return postDiagHtml(true);
            } catch (e) {
            }
        }
    </script>
    <% }
       else
       { %>
    <script type="text/javascript">
        function onLoadBody() {
            try { checkScriptsAccess(); } catch (e) { }
        }
    </script>
    <% } %>
    <style type="text/css">
        table th
        {
            background-color: #1C1C1C;
            color: #ffffff;
            height: 20px;
            border-style: solid;
            border-width: 1px;
            padding: 3px 5px 3px 5px;
        }
        table td
        {
            border-style: solid;
            border-width: 1px;
            padding: 5px 7px 5px 7px;
        }
        table
        {
            border-style: solid;
            border-width: 1px;
            border-collapse: collapse;
            margin-left: 15px;
            margin-right: 15px;
            border-color: #f5f5f5;
        }
    </style>
</head>
<body style="font-family: Tahoma; font-size: 13px;background-color:#ffffff;	color:#000000;" onload="onLoadBody()">
    <!--{EMAIL}-->
    <img alt="" src="Images/webdavtest.png" width="0" height="0" />
    <b>If you have some errors (<font style="color:<%=HttpCommander.ColorLabels.ToHtml(HttpCommander.ColorLabels.Error) %>"><%=HttpCommander.ColorLabels.Error.Name %> text</font>) 
    or warnings (<font style="color:<%=HttpCommander.ColorLabels.ToHtml(HttpCommander.ColorLabels.Warning) %>"><%=HttpCommander.ColorLabels.Warning.Name %> text</font>) 
    then send this page (Click <b>&quot;Download diagnostics file&quot;</b> below and attach file to email) 
    to Element-IT support team <a href="mailto:support@element-it.com?subject=diagnostics output&body=Put whole diagnostics output here!">
    via email</a> or <a target='_blank' href='Manual/onlinesupport.html'>via instant messenger 
    and remote access</a> to get immediate help!
    </b><br/>
    <% if (HttpCommander.Utils.UserSettings.Main.EnableLiveSupport.Value) { %>
    <div>
        <br />				
		<!-- LiveZilla Chat Button Link Code (ALWAYS PLACE IN BODY ELEMENT) -->
		<div>
		    <% if (!this.ShowSendDiagLink)
               { %>
	        Click button below to start chat<br />
	        <b>Note!</b> Your diagnostics was saved to our server:
	        <br />
	        <a target="_blank" href="https://demo.element-it.com/examples/hcdiagnostics/<%=this.DiagFileName%>">https://demo.element-it.com/examples/hcdiagnostics/<%=HttpUtility.HtmlEncode(this.DiagFileName)%></a>
	        <br />
            and will be provided to support operator automatically after your logon. 
            <br />
            If the operator is not availble then copy this link and write email to <a href="mailto:support@element-it.com">support@element-it.com</a>
            <br />
            <% } %>
		    <a style="text-decoration:none;" href="javascript:void(window.open('//demo.element-it.com/onlinesupport/chat.php?fromhc=true<%=this.DiagFileNameQueryString%><%=HttpCommander.Utils.HCLicenseAndVersionQueryString%>','','width=590,height=610,left=0,top=0,resizable=yes,menubar=no,location=no,status=yes,scrollbars=yes'))">
			<img style="outline:0;border-width:0px;" alt="Live Support" src="//demo.element-it.com/onlinesupport/image.php?id=01&type=inlay" />
			</a><br />
            <% if (this.ShowSendDiagLink)
               { %>
            <script type="text/javascript">
                function postDiagHtml(submit) {
                    try {
                        var h = document.documentElement;
                        var f = document.getElementById("sendDiagForm");
                        var hf = document.getElementById("contentDiag");
                        if (h && f && hf) {
                            var imageAccessEl = document.getElementById("tdReadImageAccess"); //("tdImageAccess");
                            var oldImageAccessHtml = "",
                                oldSVGImageHtml = "",
                                oldScriptAccessHtml = "",
                                oldJsCheckScriptsAccessHtml = "",
                                oldJsCheckHandlersHtml = "",
                                oldTdCheckDotInPath = "";
                            if (imageAccessEl) {
                                oldImageAccessHtml = imageAccessEl.innerHTML;
                                imageAccessEl.innerHTML = "&nbsp;";
                            }
                            var svgImageEl = document.getElementById("tdSVGImages");
                            if (svgImageEl) {
                                oldSVGImageHtml = svgImageEl.innerHTML;
                                svgImageEl.innerHTML = "&nbsp;";
                            }
                            var scriptAccessEl = document.getElementById("LabelScriptsAccessAnonymous");
                            if (scriptAccessEl) {
                                oldScriptAccessHtml = scriptAccessEl.innerHTML;
                                scriptAccessEl.innerHTML = "&nbsp;";
                            }
                            var jsCheckScriptsAccessEl = document.getElementById("jsCheckScriptsAccess");
                            if (jsCheckScriptsAccessEl) {
                                oldJsCheckScriptsAccessHtml = jsCheckScriptsAccessEl.innerHTML;
                                jsCheckScriptsAccessEl.innerHTML = "&nbsp;";
                            }
                            var jsCheckHandlersCntEl = document.getElementById("jsCheckHandlersCnt");
                            if (jsCheckHandlersCntEl) {
                                oldJsCheckHandlersHtml = jsCheckHandlersCntEl.innerHTML;
                                jsCheckHandlersCntEl.innerHTML = "&nbsp;";
                            }
                            var tdCheckDotInPath = document.getElementById("tdCheckDotInPath");
                            if (tdCheckDotInPath) {
                                oldTdCheckDotInPath = tdCheckDotInPath.innerHTML;
                                if (tdCheckDotInPath.innerText == "Yes")
                                    tdCheckDotInPath.innerHTML = "Yes";
                                else
                                    tdCheckDotInPath.innerHTML = "&nbsp;";
                            }
                            var htmlContent = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\r\n'; 
                            if (h.outerHTML) htmlContent += h.outerHTML;
                            else htmlContent += '<html xmlns="http://www.w3.org/1999/xhtml">\r\n' + h.innerHTML + '\r\n</html>';
                            if (scriptAccessEl) scriptAccessEl.innerHTML = oldScriptAccessHtml;
                            if (imageAccessEl) imageAccessEl.innerHTML = oldImageAccessHtml;
                            if (svgImageEl) svgImageEl.innerHTML = oldSVGImageHtml;
                            if (jsCheckScriptsAccessEl) jsCheckScriptsAccessEl.innerHTML = oldJsCheckScriptsAccessHtml;
                            if (jsCheckHandlersCntEl) jsCheckHandlersCntEl.innerHTML = oldJsCheckHandlersHtml;
                            if (tdCheckDotInPath) tdCheckDotInPath.innerHTML = oldTdCheckDotInPath;
                            hf.value = String(htmlContent).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
                            if (submit === true)
                                f.submit();
                            return true;
                        }
                    } catch (e) {
                        alert(e);
                    }
                    return false;
                }
            </script>
            <form id="sendDiagForm" name="sendDiagForm" method="post" enctype="multipart/form-data">
                <input type="hidden" id="contentDiag" name="contentDiag" />
                <input type="text" id="sendDiagEmail" name="sendDiagEmail" placeholder="Enter your email here" />
                <input type="submit" value="Send my diagnostics to LiveSupport" onclick="return postDiagHtml();" />
			</form>
			<%      if (this.SaveDiagError != null) { %>
            <span style="color:<%=HttpCommander.ColorLabels.ToHtml(HttpCommander.ColorLabels.Error)%>;">Error of saving diagnostics file: <font style="font-weight:bold;"><%=HttpUtility.HtmlEncode(this.SaveDiagError.Message)%></font></span>
	        <%      }
               }%>
		</div>
		<!-- http://www.LiveZilla.net Chat Button Link Code -->
	</div>
	<% } %>
	<br />
	Admin panel: <a target="_blank" style="font-weight:bold;" href="<%=HttpUtility.UrlPathEncode(this.AdminPanelUrl)%>"><%=HttpUtility.HtmlEncode(this.AdminPanelUrl)%></a><br />
	<% if (!this.IsControl)
       { %>
	Main user interface: <a target="_blank" style="font-weight:bold;" href="<%=HttpUtility.UrlPathEncode(this.MainUserInterfaceUrl)%>"><%=HttpUtility.HtmlEncode(this.MainUserInterfaceUrl)%></a><br />
	<% } %>
	<br/>
    <% if (HttpCommander.Utils.UserSettings.Runtime.AuthMode == System.Web.Configuration.AuthenticationMode.Windows) { %>
    <b>Note! Run this Diagnostics twice: first time under administrator and then under main user to be sure that everything works correct for users with less permissions. 
    </b><br/><% } %>
    <form id="form1" runat="server">
    <br />
    <div><asp:Button ID="btn1" Text="Download diagnostics file" runat="server" OnClick="btnDownloadDiagnostics_Click" />
        &nbsp;&lt;--Click this button to send Diagnostics text as email attachment.</div>
    <br />
    <div id="LabelAuthModeChanged" style="border-width:thin; border-color:Green; border-style: solid; text-align: left" visible="false" runat="server"></div>
    <br />
    <div>
        <table>
            <tr>
                <th colspan="3">
                    Permissions for application files
                </th>
            </tr>
            <tr>
                <td width="200" valign="top"></td>
                <td align="center"><b>Read</b></td>
                <td align="center"><b>Write</b></td>
            </tr>
            <tr>
                <td width="200" valign="top">Web.config</td>
                <td align="center" valign="top">
                    <asp:Label ID="lblReadWebConfigFile" runat="server"></asp:Label>
                </td>
                <td align="center" valign="top">
                    <asp:Label ID="lblWriteWebConfigFile" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td width="200" valign="top">HttpCommanderSettings.config</td>
                <td align="center" valign="top">
                    <asp:Label ID="lblReadConfigFile" runat="server"></asp:Label>
                </td>
                <td align="center" valign="top">
                    <asp:Label ID="lblWriteConfigFile" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td width="200" valign="top">
                    <i>Data&nbsp;folder</i><br />
                    <asp:Label ID="lblDataFolderRealPath" runat="server"></asp:Label>
                </td>
                <td align="center" valign="top">
                    <asp:Label ID="lblReadDataFolder" runat="server"></asp:Label>
                </td>
                <td align="center" valign="top">
                    <asp:Label ID="lblWriteDataFolder" runat="server"></asp:Label>
                </td>
            </tr>
            <% if (TrashIsEnabled)
               { %>
            <tr>
                <td width="200" valign="top" runat="server" id="tdTrashFolder">&nbsp;</td>
                <td align="center" valign="top">
                    <asp:Label ID="lblReadTrashFolder" runat="server"></asp:Label>
                </td>
                <td align="center" valign="top">
                    <asp:Label ID="lblWriteTrashFolder" runat="server"></asp:Label>
                </td>
            </tr>
            <tr runat="server" id="trTrashUserError" visible="false">
                <td width="200" valign="top">&nbsp;</td>
                <td align="center" valign="top" colspan="2">
                    <asp:Label ID="lblTrashUserError" runat="server"></asp:Label>
                </td>
            </tr>
            <tr runat="server" id="trTrashFolderAnon" visible="false">
                <td width="200" valign="top" runat="server" id="tdTrashFolderAnon">&nbsp;</td>
                <td align="center" valign="top">
                    <asp:Label ID="lblReadTrashFolderAnon" runat="server"></asp:Label>
                </td>
                <td align="center" valign="top">
                    <asp:Label ID="lblWriteTrashFolderAnon" runat="server"></asp:Label>
                </td>
            </tr>
            <tr runat="server" id="trTrashPoolError" visible="false">
                <td width="200" valign="top">&nbsp;</td>
                <td align="center" valign="top" colspan="2">
                    <asp:Label ID="lblTrashPoolError" runat="server"></asp:Label>
                </td>
            </tr>
            <% } %>
            <% if (!IsControl && HttpCommander.HCSettings.Instance.Runtime.HCAuth == HttpCommander.HCAuthenticationMode.Forms)
               { %>
            <tr>
                <td width="200" valign="top"><i>&lt;Data&nbsp;folder&gt;</i>\Accounts.xml</td>
                <td align="center" valign="top">
                    <asp:Label ID="lblReadAccountsFile" runat="server"></asp:Label>
                </td>
                <td align="center" valign="top">
                    <asp:Label ID="lblWriteAccountsFile" runat="server"></asp:Label>
                </td>
            </tr>
            <% } %>
            <tr>
                <td width="200" valign="top"><i>&lt;Data&nbsp;folder&gt;</i>\Errors.xml</td>
                <td align="center" valign="top">
                    <asp:Label ID="lblReadErrorsFile" runat="server"></asp:Label>
                </td>
                <td align="center" valign="top">
                    <asp:Label ID="lblWriteErrorsFile" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td width="200" valign="top"><i>&lt;Data&nbsp;folder&gt;</i>\Folders.xml</td>
                <td align="center" valign="top">
                    <asp:Label ID="lblReadFoldersFile" runat="server"></asp:Label>
                </td>
                <td align="center" valign="top">
                    <asp:Label ID="lblWriteFoldersFile" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td width="200" valign="top"><i>&lt;Data&nbsp;folder&gt;</i>\data.db</td>
                <td align="center" valign="top">
                    <asp:Label ID="lblReadDataDbFile" runat="server"></asp:Label>
                </td>
                <td align="center" valign="top">
                    <asp:Label ID="lblWriteDataDbFile" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td width="200" valign="top">FileTypes.xml</td>
                <td align="center" valign="top">
                    <asp:Label ID="lblReadFileTypes" runat="server"></asp:Label>
                </td>
                <td align="center" valign="top">
                    <asp:Label ID="lblWriteFileTypes" runat="server"></asp:Label>
                </td>
            </tr>
            <tr runat="server" id="trADAccountsFile" visible="false">
                <td width="200" valign="top">Active Directory accounts file (<span runat="server" id="spanADAccountsFile"></span>)</td>
                <td align="center" valign="top">
                    <asp:Label ID="lblReadADAccountsFile" runat="server"></asp:Label>
                </td>
                <td align="center" valign="top">
                    <asp:Label ID="lblWriteADAccountsFile" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td width="200" valign="top" runat="server" id="tdTempFolder">&nbsp;</td>
                <td align="center" valign="top">
                    <asp:Label ID="lblReadTempFolder" runat="server"></asp:Label>
                </td>
                <td align="center" valign="top">
                    <asp:Label ID="lblWriteTempFolder" runat="server"></asp:Label>
                </td>
            </tr>
            <tr runat="server" id="trTempFolderAnon" visible="false">
                <td width="200" valign="top" runat="server" id="tdTempFolderAnon">&nbsp;</td>
                <td align="center" valign="top">
                    <asp:Label ID="lblReadTempFolderAnon" runat="server"></asp:Label>
                </td>
                <td align="center" valign="top">
                    <asp:Label ID="lblWriteTempFolderAnon" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td width="200" valign="top">Images\</td>
                <td align="center" valign="top" id="tdReadImageAccess" runat="server">
                    <img alt="" onload="try{document.getElementById('successReadImageAccess').style.display=''}catch(e){}"
                        onerror="try{document.getElementById('errorReadImageAccess').style.display=''}catch(e){}"
                        src="Images/OK.png" width="20" height="11" />
                    <span id="successReadImageAccess" style="display:none;" runat="server">
                    </span>
                    <span id="errorReadImageAccess" style="display:none;" runat="server">
                    </span>
                    <noscript id="readImageNoScript" runat="server">
                    </noscript>
                </td>
                <td align="center" valign="top">
                    &nbsp;
                </td>
            </tr>
            <tr runat="server" id="trReadImages" visible="false">
                <td width="200" valign="top">Images\</td>
                <td align="center" valign="top">
                    <asp:Label ID="lblReadImages" runat="server"></asp:Label>
                </td>
                <td align="center" valign="top">
                    &nbsp;
                </td>
            </tr>
            <tr>
                <td width="200" valign="top"><i>Root&nbsp;folder</i><br /><%=HttpUtility.HtmlEncode(HttpCommander.Utils.PhysicalASPPath ?? "<null>")%></td>
                <td align="center" valign="top">OK</td>
                <td align="center" valign="top">&nbsp;</td>
            </tr>
            <tr>
                <td width="200" valign="top"><%=ASPTempFolder%></td>
                <td align="center" valign="top">OK</td>
                <td align="center" valign="top">OK</td>
            </tr>
            <tr>
                <td colspan="3">
                    <% if (HttpCommander.HCSettings.Instance.Runtime.HCAuth == HttpCommander.HCAuthenticationMode.Forms)
                       { %>
                    <b>Info:&nbsp;</b>Access rights are shown for the user <b><%=System.Security.Principal.WindowsIdentity.GetCurrent().Name %></b>.<br />
                    <% } %>
                    If you see &quot;<span style="color:<%=HttpCommander.ColorLabels.ToHtml(HttpCommander.ColorLabels.Error) %>"><%=HttpCommander.ColorLabels.Error.Name %> 
                    text</span>&quot; - it is necessary to grant to the specified user the right to 
                    reading for appropriate files.<br />
                    If you see &quot;<span style="color:<%=HttpCommander.ColorLabels.ToHtml(HttpCommander.ColorLabels.Warning) %>"><%=HttpCommander.ColorLabels.Warning.Name %> 
                    text</span>&quot; and plan to change appropriate files in &quot;AdminPanel&quot; - it is 
                    necessary to grant the right to write.
                </td>
            </tr>
        </table>
    </div>
    <br />
    <div>
        <table>
            <tr>
                <th colspan="2">
                    Common diagnostics and information
                </th>
            </tr>
            <tr>
                <td width="200" valign="top">
                    License information
                </td>
                <td>
                    <asp:Label ID="lblLicInfo" runat="server"></asp:Label>
                </td>
            </tr>
            <%--<tr>
                <td width="200" valign="top">
                    Access to Images\</td>
                <td id="tdImageAccess" runat="server">
                    <img alt="" onerror="try{document.getElementById('errorImageAccess').style.display=''}catch(e){}"
                        src="Scripts/imagesdiagnostics.png" width="531" height="35" />
                    <span id="errorImageAccess" style="display:none;color:red;">
                        <br /><b>Note!</b> Images can be loaded. 
                        In most cases this mean that you need to set NTFS read permissions for anonymous user 
                        (IUSR or IUSR_MACHINENAME: See &quot;Anonymous user&quot; info below) to HTCOMNET folder. 
                    </span>
                    <noscript>
                        <br /><b>Note!</b> If you don&#39;t see image then set NTFS read permissions for anonymous 
                        user (IUSR or IUSR_MACHINENAME: See &quot;Anonymous user&quot; info below) to HTCOMNET folder.    
                    </noscript>
                </td>
            </tr>--%>
            <tr>
                <td width="200" valign="top">
                    Access to Scripts\ for application identity</td>
                <td>
                    <asp:Label ID="LabelScriptsAccess" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td width="200" valign="top">
                    Access to Scripts\ for anonymous user</td>
                <td>
                    <span id="LabelScriptsAccessAnonymous" runat="server"></span>
                </td>
            </tr>
            <tr>
                <td width="200" valign="top">
                    Displaying SVG images:
                </td>
                <td id="tdSVGImages" runat="server">
                    <img alt="" oninvalid="try{document.getElementById('errorViewSVGImage').style.display=''}catch(e){}"
                        onerror="try{document.getElementById('errorViewSVGImage').style.display=''}catch(e){}"
                        src="Images/svg/OK.svg" width="20" height="11" />
                    <span id="errorViewSVGImage" style="display:none;color:red;" runat="server">
                    </span>
                </td>
            </tr>
            <tr>
                <td width="200" valign="top">
                    Browser info
                </td>
                <td>
                    <asp:Label ID="lblBrowserInfo" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td width="200" valign="top">
                    Access to Localization\ for application identity</td>
                <td>
                    <asp:Label ID="LabelLocalization" runat="server"></asp:Label>
                </td>
            </tr>
            <%--<tr>
                <td valign="top">
                    Access to temporary folder:
                </td>
                <td>
                    <asp:Label ID="lblTempFolderAccess" runat="server"></asp:Label>
                </td>
            </tr>--%>
            <tr>
                <td width="200" valign="top">
                    Product name
                </td>
                <td width="400">
                    <asp:Label ID="lblProductName" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Product version
                </td>
                <td>
                    <asp:Label ID="lblProductVersion" runat="server"></asp:Label>
                    <div id="newVersionLink" style="display:none;color:Red;font-weight:bold"></div>
                </td>
            </tr>
            <tr id="trUniqueUsersCount" runat="server" visible="false">
                <td valign="top">
                    Logged-on unique users
                </td>
                <td>
                    <asp:Label ID="lblUniqueUsersCount" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    CLR version:
                </td>
                <td>
                    <asp:Label ID="lblCLRVersion" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Installed frameworks:
                </td>
                <td>
                    <asp:Label ID="lblFrameworks" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Windows version:
                </td>
                <td>
                    <asp:Label ID="lblWindowsVersion" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    IIS version:
                </td>
                <td>
                    <asp:Label ID="lblIISVersion" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Application starts under identity:
                </td>
                <td>
                    <asp:Label ID="lblAppPoopIdentity" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Application works under identity:
                </td>
                <td>
                    <asp:Label ID="lblAspNetAccount" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Anonymous user:
                </td>
                <td>
                    <asp:Label ID="lblAnonymUser" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Authentication mode:
                </td>
                <td>
                    <asp:Label ID="lblAuthMode" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Authentication type:
                </td>
                <td>
                    <asp:Label ID="lblAuthType" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Authentication at IIS:
                </td>
                <td>
                    <asp:Label ID="lblAuthIISMode" runat="server"></asp:Label>
                </td>
            </tr>
            <tr id="trAuthIISModeForAnonymDownload" runat="server">
                <td valign="top">
                    Authentication at IIS for <%=HttpCommander.AnonymousDownload.AnonymHandlerPathWithoutSlash%>:
                </td>
                <td>
                    <asp:Label ID="lblAuthIISModeForAnonymDownload" runat="server"></asp:Label>
                    <br /><br />
                    <a target="_blank" href="//demo.element-it.com/examples/AnonymousTest.aspx?url=<%=HttpUtility.UrlEncode(HttpCommander.Utils.AnonymousDownloadUrl) %>">Click to get <b>identity which used to process anonymous requests</b> (public links feature and other) and to check if <%=HttpCommander.AnonymousDownload.AnonymHandlerName%> available from Internet...</a>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    ASPX impersonation:
                </td>
                <td>
                    <asp:Label ID="lblImpersonation" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Application pool name:
                </td>
                <td>
                    <asp:Label ID="lblAppPoolName" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Application pool mode:
                </td>
                <td>
                    <asp:Label ID="lblAppPoolMode" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Maximum worker processes in application pool:
                </td>
                <td>
                    <asp:Label ID="lblAppPoolProcess" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Mail settings:
                </td>
                <td>
                    <asp:Label ID="lblMailSettings" runat="server"></asp:Label>
                    <asp:TextBox ID="txtSendTestEmail" runat="server"></asp:TextBox>
                    <asp:Button ID="btnSendEmail" runat="server" onclick="btnSendEmail_Click" 
                        Text="Send test email" /><br/>
                    <asp:Label ID="lblSendTestMail" runat="server"></asp:Label>   
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Test read access to folder:
                </td>
                <td>
                    Type any folder path to check that it is exists and current application identity 
                    have anought NTFS permissions to read it:<br/>
                    <asp:TextBox Width="300" ID="txtTestNTFS" runat="server"></asp:TextBox>
                   
                    <asp:Button  ID="btnCheckNTFS" runat="server" onclick="btnTestNTFS_Click" 
                        Text="Check if exists" /><br/>
                    <asp:Label ID="lblTestNTFS" runat="server"></asp:Label>   
                </td>
            </tr>
            <!--
            <tr>
                <td valign="top">
                    Current session count:</td>
                <td>
                    <asp:Label ID="lblCurrentSessionCount" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Shared folders:
                </td>
                <td>
                    <asp:Label ID="lblADSharedFolders" runat="server"></asp:Label>
                </td>
            </tr>
            -->
            <tr>
                <td valign="top">
                    Availability of a file crossdomain.xml from a site root:
                </td>
                <td>
                    <asp:Label ID="lblExistsCrossdomainXML" runat="server"></asp:Label><br />
                    <div visible="false" id="txbExistsCrossdomainXML" runat="server" style="padding:3px;height:128px;border:solid 1px black;overflow:scroll;white-space:nowrap;font-family:Courier New;">
&lt;?xml version=&quot;1.0&quot;?&gt;<br />
&lt;!DOCTYPE cross-domain-policy SYSTEM &quot;http://www.adobe.com/xml/dtds/cross-domain-policy.dtd&quot;&gt;<br />
&lt;cross-domain-policy&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&lt;allow-access-from domain=&quot;*&quot;/&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&lt;site-control permitted-cross-domain-policies=&quot;master-only&quot;/&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&lt;allow-http-request-headers-from domain=&quot;*&quot; headers=&quot;*&quot; secure=&quot;false&quot;/&gt;<br />
&lt;/cross-domain-policy&gt;
                    </div>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Gzip or deflate compression of *.js files:
                </td>
                <td>
                    <asp:Label ID="lblCompressionJSFiles" runat="server"></asp:Label>
                </td>
            </tr>
            <tr runat="server" id="tdConvertVideo" visible="false">
                <td valign="top">
                    Availability of files for video playback and video converting feature in <b>bin</b> folder:
                </td>
                <td>
                    <asp:Label ID="lblConvertVideo" runat="server"></asp:Label>
                </td>
            </tr>
            <tr runat="server" id="trJavaPowUpload" visible="false">
                <td valign="top">
                    Access to Uploaders/JavaPowUpload.jar:
                </td>
                <td>
                    <asp:Label ID="lblAccessJavaPowUpload" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Server side handler (AJAX) execution:
                </td>
                <td id="tdCheckHandlers">
                    <noscript><span style="color:rgb(255,165,0);">Not detected because Javascript disabled at your browser (this is not an error!)</span></noscript>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Folders with dots in names are allowed?
                </td>
                <td id="tdCheckDotInPath" runat="server">
                    <link rel="Stylesheet" type="text/css" href="Images/resources_1.5/test.css" />
                    <span class="test-dot-in-path-hidden" style="color:red;">
                        Probably not.<br />
                        Please will follow the link <a target="_blank" href="Images/resources_1.5/test.css">Images/resources_1.5/test.css</a>
                        and if you see an error 403.18 read FAQs:<br />
                        <a href="Manual/faq.html#urlscanerror">I got the Error HTTP 403.18 - Forbidden...</a><br />
                        and<br />
                        <a href="Manual/faq.html#csserrors">The Default.aspx page is incorrectly displayed</a>
                    </span>
                    <span style="display:none;" class="test-dot-in-path-visible">Yes</span>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Secure connection (SSL):
                </td>
                <td >
                    <asp:Label ID="lblCheckSSL" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Google URL Shortener service access<br />
                    (used for shortening public links):
                </td>
                <td>
                    <asp:Button  ID="btnCheckGoogleUrlShortener" runat="server" onclick="btnCheckGoogleUrlShortener_Click" 
                        Text="Try to shorten url" />&nbsp;For waiting and reading the response from the server timeout <%=ShortenerServiceTimeout%> second(s) is used.<br/><br />
                    <asp:Label ID="lblCheckGoogleUrlShortener" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Versions of the modules from <b><i>&lt;Data&nbsp;folder&gt;</i>\data.db</b>
                </td>
                <td>
                    <asp:Label ID="lblDbModuleVersions" runat="server"></asp:Label>
                </td>
            </tr>
        </table>
        <div id="jsCheckHandlersCnt" runat="server"><script type="text/javascript">
            var tdCheckHandlers = document.getElementById('tdCheckHandlers');
            if (tdCheckHandlers) {
                var notDetectedMessage = '<span style="color:rgb(255,165,0);">Not detected (this is not an error!)</span>';
                var errorMessage = '<span style="color:red;">Error occured while server side handler execution.<br />To look error open <a target="_blank" href="Handlers/Config.ashx">this link</a> in browser and send both error and diagnostics output to Element-IT support team.</span>';
                try {
                    xhrRequest('Handlers/Config.ashx', function(response, xhr) {
                        if (!xhr.status || xhr.status == 401 || xhr.status == 302) {
                            tdCheckHandlers.innerHTML = notDetectedMessage;
                        } else {
                            var error = false;
                            if (xhr.status == 200) {
                                var contentType = xhr.getResponseHeader('Content-Type');
                                if (contentType && String(contentType).indexOf('javascript') >= 0) {
                                    try {
                                        eval(response);
                                        if (typeof htcConfig != 'undefined') {
                                            tdCheckHandlers.innerHTML = 'OK';
                                        } else {
                                            error = true;
                                        }
                                    } catch (ee) {
                                        error = true;
                                    }
                                } else {
                                    tdCheckHandlers.innerHTML = notDetectedMessage;
                                }
                            } else {
                                error = true;
                            }
                            if (error) {
                                tdCheckHandlers.innerHTML = errorMessage;
                            }
                        }
                        xhr.abort();
                    });
                } catch (e) {
                    tdCheckHandlers.innerHTML = notDetectedMessage;
                }
            }
        </script></div>
    </div>
    <br />
    <div id="webDAVDisabledContainer" runat="server" visible="false">
        <table>
            <tr>
                <th colspan="2">
                    WebDAV module
                </th>
            </tr>
            <tr>
                <td colspan="2">
                    WebDAV feature is disabled.<br />
                    If you want to use WebDAV capabilities include one (or more) of the parameters:
                    <ul>
                        <li><a href="Manual/webconfigsetup.html#EnableMSOfficeEdit" target="_blank">Office/EnableMSOfficeEdit</a>,</li>
                        <li><a href="Manual/webconfigsetup.html#EnableOpenOfficeEdit" target="_blank">Office/EnableOpenOfficeEdit</a>,</li>
                        <li><a href="Manual/webconfigsetup.html#EnableWebFoldersLinks" target="_blank">WebFolders/EnableWebFoldersLinks</a>,</li>
                    </ul>
                    and follow the instructions to configure WebDAV:<br />
                    <a href="Manual/WebFolders.html" target="_blank">Web folders mapping</a>,<br />
                    <a href="Manual/webconfigsetup.html#editinoffice" target="_blank">Using MS Office and OpenOffice to work with documents</a>.
                </td>
            </tr>
        </table>
        <br />
    </div>
    <div id="webDAVSupportContainer" runat="server">
        <table>
            <tr>
                <th colspan="2">
                    WebDAV module
                </th>
            </tr>
            <tr>
                <td valign="top">
                    WebDAV url:
                </td>
                <td>
                    <b><%=this.WebDAVDisplayUrl%></b>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    WebDAV module (for office and web links):
                </td>
                <td>
                    <asp:Label ID="lblWebDavModule" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Built-in WebDAV server:
                </td>
                <td>
                    <asp:Label ID="lblBuiltInWebDav" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Long URL's and special symbols support for WebDAV
                </td>
                <td>
                    <asp:Label ID="lblLongUrlSupport" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Symbol support &quot;+&quot; for WebDAV
                </td>
                <td>
                    <asp:Label ID="lblPlusSupport" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Symbols support &quot;&amp;&quot;, &quot;%&quot; for WebDAV
                </td>
                <td>
                    <asp:Label ID="lblAmpPercentSupport" runat="server"></asp:Label>
                </td>
            </tr>
            <tr>
                <td valign="top">
                    Check WebDAV URLs identifier<br />
                    <b>&quot;<%=HttpUtility.HtmlEncode(HttpCommander.Utils.UserSettings.Main.IdentifierWebDav.Value ?? "") %>&quot;</b>
                </td>
                <td>
                    <asp:Label ID="lblIndentifierWebDav" runat="server"></asp:Label>
                </td>
            </tr>
            <tr runat="server" id="trConfigureWebDavUtility">
                <td valign="top">
                    Configure WebDAV
                </td>
                <td>
                    If you are logged in as the local administrator, then you can press the button below, for configure WebDAV module.
                    <br />
                    What will be done:
                    <ul>
                        <li>the folder <b>&quot;<%=HttpUtility.HtmlEncode(HttpCommander.Utils.UserSettings.Main.IdentifierWebDav.Value ?? "") %>&quot;</b> in an application root will be deleted (if exists);</li>
                        <li>disables the built-in WebDAV server in IIS;</li>
                        <% if (HttpCommander.HCSettings.Instance.Runtime.HCAuth == HttpCommander.HCAuthenticationMode.Windows || HttpCommander.HCSettings.Instance.Runtime.HCAuth == HttpCommander.HCAuthenticationMode.FormsWithWindowsUsers)
                           { %>
                        <li>configure IIS Anonymous Authentication for virtual <b>&quot;<%=HttpUtility.HtmlEncode(HttpCommander.Utils.UserSettings.Main.IdentifierWebDav.Value ?? "") %>&quot;</b> subfolder;</li>
                        <% } %>
                        <li>and if you are using IIS6, then added to HTTP Commander site ASP.NET ISAPI Dll in list of wildcard application maps.</li>
                    </ul>
                    <b>Note!</b>&nbsp;If results of diagnostics of the WebDAV successful (in cells above), then setup of the module isn't required.<br />
                    <br /><asp:Button ID="btnConfigureWebDAV" runat="server" Text="Configure WebDAV" OnClick="btnConfigureWebDAV_Click" /><br /><br />
                    <asp:Label ID="lblConfigureWebDAVResult" runat="server" Visible="false"></asp:Label>
                </td>
            </tr>
        </table>
        <br />
    </div>
    <div>
        <table>
            <tr>
                <th colspan="2">
                    User information and extra
                </th>
            </tr>
            <tr>
                <td width="200">
                    Current user:
                </td>
                <td>
                    <asp:Label ID="lblCurrentUser" runat="server"></asp:Label>
                </td>
            </tr>
            <tr runat="server" id="GroupsFromTR">
                <td width="200">
                    Read user info from:
                </td>
                <td>
                    <asp:Label ID="lblReadGroupsFrom" runat="server"></asp:Label>
                </td>
            </tr>
            <tr runat="server" id="groupsMethodTR">
                <td width="200">
                    Read groups method:
                </td>
                <td>
                    <asp:Label ID="lblReadGroupsMethod" runat="server"></asp:Label>
                </td>
            </tr>
            <tr runat="server" id="userGroupsTR">
                <td width="200" valign="top">
                    User groups:
                </td>
                <td>
                    <asp:Label ID="lblUserGroups" runat="server"></asp:Label>
                    <div id="divUtilityListGroups" visible="false" runat="server">
                    <fieldset>
                        <p>This form helps to test different values
                        <b>"LDAPContainer"</b> and <b>"UseUniversalWayToReadGroups"</b> parameters
                        that define how HTTP Commander obtains list of user's groups.</p>
                        <p>Fill the form below with information describing domain of the current user (for domain account)
                        or host of the current user (for local account).</p>
                        Domain controller IP address:&nbsp;<asp:TextBox MaxLength="15" Width="110px" ID="ipDomain" runat="server"></asp:TextBox><br />
                        Domain name:&nbsp;<asp:TextBox Width="180px" ID="nameDomain" runat="server"></asp:TextBox>
                        <br />
                        <b>or</b>
                        <br />
                        LDAP Container:&nbsp;<asp:TextBox Width="230px" ID="ldapContainerField" runat="server"></asp:TextBox>
                        <br /><br />
                        <asp:Button ID="btnSearchGroups" runat="server" Text="Search groups" 
                            onclick="btnSearchGroups_Click" /><br /><br />
                        <asp:Label ID="lblUtilityListGroupsResult" runat="server" Visible="false"></asp:Label>
                        <p>See <a href="Manual/webconfigsetup.html#ADRecommendations">Recommendations on configuring Active Directory parameters</a> in the manual.</p>
                    </fieldset>
                    </div>
                </td>
            </tr>
            <tr>
                <td width="200" valign="top">
                    User folders:</td>
                <td>
                    <asp:Label ID="lblUserFolders" runat="server"></asp:Label>
                </td>
            </tr>
        </table>
        <br />
        <table>
            <tr>
                <th>
                    Application settings in HttpCommanderSettings.config.
                </th>
            </tr>
            <tr>
                <td><asp:Label ID="lblHtcSettings" runat="server"></asp:Label></td>
            </tr>
        </table>
        <br />
        <table>
            <tr>
                <th>
                    Application settings in web.config.
                </th>
            </tr>
            <tr>
                <td>
                    <asp:Label ID="lblWebConfigDiffNote" runat="server">
                        <div style="font-weight: bold; border: solid 1px;">
                            In section below you can find contents of your current web.config file compared to the default one (default.web.config file in application root folder ).<br />
                            Removed text is <del style="background:#ffe6e6;">heighlighted with red color .</del> <br />
                            Inserted text is <ins style="background:#e6ffe6;">heighlighted with green color</ins> <br />
                        </div>
                        <br />
                    </asp:Label>
                    <asp:Label ID="lblWebConfig" runat="server"></asp:Label>

                </td>
            </tr>
        </table>
        <br />
        <table>
            <tr>
                <th>
                    Error log in Errors.xml. Note, it is quite normal to have some records in the 
                    error log in correctly functioning application. Not every record means a problem 
                    with application!</th>
            </tr>
            <tr>
                <td><asp:Label ID="lblErrors" runat="server"></asp:Label></td>
            </tr>
        </table>
    </div>
    <br />
    </form>
    <b>If you have 
    <font style="color:<%=HttpCommander.ColorLabels.ToHtml(HttpCommander.ColorLabels.Error) %>">errors</font>
    or <font style="color:<%=HttpCommander.ColorLabels.ToHtml(HttpCommander.ColorLabels.Warning) %>">warnings</font>,
    send this page to Element-IT support team <a href="mailto:support@element-it.com?subject=diagnostics output&body=Put whole diagnostics output here!">
    via email</a>
     or <a target='_blank' href='Manual/onlinesupport.html'>via instant messenger 
    and remote access</a> to get immediate help!</b>
    <div id="jsCheckScriptsAccess" runat="server" style="visibility:hidden;display:none;">
    <script type="text/javascript"> 
    function checkScriptsAccess()
    {
        try
        {
            if(diagnosticsScriptisloaded==true)
            {
                document.getElementById('LabelScriptsAccessAnonymous').innerHTML="Scripts are available";
            }
            else
            {
                document.getElementById('LabelScriptsAccessAnonymous').innerHTML="<font color='red'><b>Note!</b> JavaScript files (Main.js and other) at Scripts\\ folder are missing or anonymous user havn't NTFS read permissions or not installed Static Content role service for Web Server (IIS7) role (see <a target='_blank' href='manual/faq.html#staticcontentrole'>FAQ: How to add Static Content role</a>. Check read permissions for IUSR or IUSR_MACHINANAME user to HTCOMNET folder</font>";
            }
        }
        catch (e){
            document.getElementById('LabelScriptsAccessAnonymous').innerHTML="<font color='red'><b>Note!</b> JavaScript files (Main.js and other) at Scripts\\ folder are missing or anonymous user havn't NTFS read permissions or not installed Static Content role service for Web Server (IIS7) role (see <a target='_blank' href='manual/faq.html#staticcontentrole'>FAQ: How to add Static Content role</a>. Check read permissions for IUSR or IUSR_MACHINANAME user to HTCOMNET folder</font>";
        };
    }
    </script>
    </div>
    <script type="text/javascript" src="//demo.element-it.com/hclatestversion.js?rid=<%=DateTime.UtcNow.Ticks.ToString()%>"></script>
    <%=GetJSWithCurrentVerion()%>
    <script type="text/javascript">
        try {
            var hcNewVersion = null;
            if (window.hccurrentversion && toString.apply(window.hccurrentversion) === '[object Array]'
                && window.hclatestversion && toString.apply(window.hclatestversion) === '[object Array]'
                && window.hccurrentversion.length > 0 && window.hclatestversion.length > 0) {
                var len = window.hclatestversion.length;
                if (window.hccurrentversion.length < len) {
                    len = window.hccurrentversion.length;
                }
                for (var i = 0; i < len; i++) {
                    if (window.hclatestversion[i] > window.hccurrentversion[i]) {
                        hcNewVersion = window.hclatestversion.join('.');
                        break;
                    } else if (window.hclatestversion[i] < window.hccurrentversion[i]) {
                        break;
                    }
                }
            }
            if (hcNewVersion && hcNewVersion.length > 0) {
                var lnk = document.getElementById('newVersionLink');
                if (lnk) {
                    lnk.innerHTML = 'New version <a href="//www.element-it.com/downloads.aspx" target="_blank">' + hcNewVersion + '</a> is available!';
                    lnk.style.display = '';
                }
            }
        } catch (e) { }
    </script>
</body>
</html>
