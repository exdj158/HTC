<%@ Page Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="HttpCommander" %>
<%@ Import Namespace="System.Web" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title><%=Utils.LocalizationsManager.GetString("AdminTitle")%></title>
    <meta name="ROBOTS" content="NOINDEX, NOFOLLOW" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta http-equiv="x-ua-compatible" content="IE=edge" />
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    <script language="c#" runat="server">
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!TwoFactorAuthManager.IsAuthPassed())
                Response.Redirect(Utils.AppRootUrl + "Default.aspx?ReturnUrl=" + HttpUtility.UrlEncode(Utils.AppRootUrl + "AdminPanel.aspx"));
            else
            {
                if (!AccountUtils.AllowAdministration)
                {
                    notAdminMessage.Visible = true;
                    mainView.Visible = false;
                }
                else
                {
                    notAdminMessage.Visible = false;
                    mainView.Visible = true;
                }
                Response.Expires = -1;
                Response.CacheControl = "No-cache";
                if (mainView.Visible)
                {
                    Utils.AddScript("Scripts/error-handler" + Utils.BuildModeJs + ".js?v=" + Utils.AssemblyVersion, false, this.Page);
                    Response.AppendHeader("X-HttpCommander-Status", "0");
                    Utils.AddExtCss(this.Page);
                    Utils.AddCss("Styles" + Utils.BuildModeCss + ".css?v=" + Utils.AssemblyVersion, this.Page);
                }
            }
        }
    </script>
</head>
<body class="standard-ui-body">
    <div id="notAdminMessage" runat="server" visible="true">
        User '<%=HttpUtility.HtmlEncode(AccountUtils.CurrentUserName)%>' is not admin therefor can't login to Admin panel.
        To make user admin add his name to 'Administrators' parameter at HttpCommanderSettings.config file
        (ex.: &lt;Administrators value=\"admin,jdoe,mike\" /&gt;) and restart application.
        Also master admin can create administrators who are able to login to admin panel but with limited permissions.
        Open 'Admin permissions' tab at admin panel to create such users.
    </div>
    <div id="mainView" runat="server" visible="false">
        <div id="loading-mask">
            <div id="loading">
                <noscript><font color="#CC0000"><%=Utils.LocalizationsManager.GetString("CommonNoScript")%></font><br /></noscript>
                <table id="loading-message">
                    <tr>
                        <td nowrap="nowrap">
                            <img width="32" height="32" alt="" src="Images/loading.gif" />
                        </td>
                        <td nowrap="nowrap">
                            <%=Utils.LocalizationsManager.GetString("AdminApplicationLoading")%>...
                        </td>
                    </tr>
                </table>
            </div>
            <script type="text/javascript" src="Scripts/ext-base<%=Utils.BuildModeJs%>.js"></script>
            <script type="text/javascript" src="Scripts/ext-all<%=Utils.BuildModeJs%>.js"></script>
            <script type="text/javascript" src="Scripts/ext-mod<%=Utils.BuildModeJs%>.js?v=<%=Utils.AssemblyVersion%>"></script>
            <%=JavaScriptIncludes.Instance.IncludeExtJSLocale()%>
            <script type="text/javascript" src="Handlers/AdminHandler.ashx?referrer=<%=HttpUtility.UrlEncode(Request.AppRelativeCurrentExecutionFilePath) %>"></script>
            <script type="text/javascript" src="Handlers/Config.ashx?relPath=<%=HttpUtility.UrlEncode(Utils.VirtualClientPath)%>"></script>
            <script type="text/javascript" src="Handlers/CommonHandler.ashx?referrer=<%=HttpUtility.UrlEncode(Request.AppRelativeCurrentExecutionFilePath) %>"></script>
            <%=JavaScriptIncludes.Instance.IncludeAdminJsScript(Utils.DebugModeJs, "")%>
        </div>
    </div>
</body>
</html>