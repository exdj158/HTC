<%@ Page Language="C#" %>
<%@ Import Namespace="HttpCommander" %>
<%@ Import Namespace="System.Web.Configuration" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title><%= Utils.LocalizationsManager.GetString("LogoutTitle")%></title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta content="NOINDEX, NOFOLLOW" name="ROBOTS" />
    <meta http-equiv="x-ua-compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0" />
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    <script language="c#" runat="server">
        protected void Page_Load(object sender, EventArgs e)
        {
            string defaultPage = "Default.aspx";
            string urlReferrer = defaultPage;
            if (this.Request.UrlReferrer != null)
                urlReferrer = this.Request.UrlReferrer.AbsoluteUri;

            bool isCookieDisabled = Request.QueryString["NoCookies"] != null;

            string queryString = string.Empty;
            if (this.Session != null && this.Session["DefaultQueryString"] != null)
                queryString = (string)this.Session["DefaultQueryString"];

            /* remove ReturnUrl parameter from query string
             * 
             * FormsAuthenticationModule does not redirect requests to login page
             * (Default.aspx in Http Commander case) when users try to access a protected resource
             * if the query string includes ReturnUrl parameter.
             * For example, query string = "?ReturnUrl=%2fHttpCommander%2fAdminPanel.aspx",
             * url refererrer = "http://localhost/HttpCommander/AdminPanel.aspx".
             * If we do not change the query string, this method redirect the browser to
             * http://localhost/HttpCommander/AdminPanel.aspx?ReturnUrl=%2fHttpCommander%2fAdminPanel.aspx
             * AdminPanel.aspx is a protected resource, hence Forms module should redirect the request
             * to Default.aspx page. However, since ReturnUrl parameter is present,
             * redirection does not occur, the server respondes with 401 Unauthorized error code.
             * 
             * We may preserve ReturnUrl parameter if the requested resource 
             * (specified in urlReferrer variable) is not protected, for example, Default.aspx, 
             * Diagnostics.aspx. For all pages but Default.aspx the ReturnUrl parameter is meaningless,
             * it is safe to remove it.
             * We should only preserve the parameter for Default.aspx page.
             */
            bool isRedirectToDefaultPage = string.Compare(queryString, defaultPage, true) == 0
                || queryString.EndsWith("/" + defaultPage, StringComparison.OrdinalIgnoreCase);
            if (!isRedirectToDefaultPage)
                queryString = Utils.RemoveQueryParameter(queryString, "ReturnUrl");
            string redirectUrl = urlReferrer + (urlReferrer.IndexOf('?') >= 0 ? "" : queryString);
            hlEnterAgain.NavigateUrl = HttpUtility.HtmlEncode(redirectUrl);

            if (HCSettings.Instance.Runtime.HCAuth == HCAuthenticationMode.Windows)
                body.Attributes.Add("onLoad", "javascript:logout();");

            /* Do not invoke Session.Clear(), Session.RemoveAll() here.
             We need session variables in the Session_End event handler
             in global.asax. */
            if (Utils.UserSettings.Runtime.AuthMode == AuthenticationMode.Forms)
            {
                FormsAuthentication.SignOut();
                Session.Abandon();
                lblEndSessionMessage.Text = Utils.LocalizationsManager.GetString("LogoutSessionEnded");
                if (HCSettings.Instance.Runtime.HCAuth == HCAuthenticationMode.Shibboleth)
                {
                    Response.Expires = -1;
                    Response.CacheControl = "No-cache";
                    Response.AppendHeader("X-HttpCommander-Status", "0");
                    Request.Cookies.Clear();
                    Response.Cookies.Clear();
                }
                else if (!isCookieDisabled && !Utils.UserSettings.UI.IsEmbeddedtoIFRAME.Value)
                {
                    // Remove from userCache in GlobalCache current logouted user
                    GlobalCache.Instance.OnCurrentUserLogout();
                    Response.Redirect(redirectUrl);
                }
            }
            else
            {
                Response.Cache.SetCacheability(HttpCacheability.NoCache);
                if (string.Compare(Request.Browser.Browser, "IE", true) != 0 &&
                    !Utils.DetectIE11Browser(Request.UserAgent))
                {
                    //For non IE browsers say to user that browser should be closed
                    lblClosingRequired.Text = "";// Utils.LocalizationsManager.GetString("LogoutClosingBrowserRequired");
                    lblEndSessionMessage.Text = "";
                    if (!isCookieDisabled && HttpCommander.Utils.UserSettings.Main.Send401AtNonIEWinAuthLogout.Value)
                        Context.Response.StatusCode = 401;
                }
                else
                    lblEndSessionMessage.Text = Utils.LocalizationsManager.GetString("LogoutSessionEnded");
                Response.Expires = -1;
                Response.CacheControl = "No-cache";
                Session.Abandon();
                //Uncomment line below for correct work of logout with ADFS and replace {DNS_name_of_RP_STS} with correct domain name of your RP STS server
                //Response.Redirect("https://{DNS_name_of_RP_STS}/adfs/ls/?wa=wsignout1.0&wreply="+redirectUrl); 
            }

            hlEnterAgain.Text = Utils.LocalizationsManager.GetString("LogoutEnterAgain");
            if (Utils.UserSettings.UI.IsEmbeddedtoIFRAME.Value)
                hlCloseWindow.Visible = false;

            lblCookieDisabledMessage.Visible = isCookieDisabled;
            endSessionHolder.Visible = !isCookieDisabled;

            // Remove from userCache in GlobalCache current logouted user
            GlobalCache.Instance.OnCurrentUserLogout();
        }
    </script>
    <script type="text/javascript">
        /* Invoke this function when page loads to force the browser to forget user credentials,
        so that the user has to enter user name and password if he/she again wants to use
        the application. By default browsers preserve credentials that is Logout function
        does not actually logs out the user. 
        
        Note. This function is applicable to Basic authentication only. */
        function logout() {
            if (navigator.userAgent.toLowerCase().indexOf("msie") !== -1 || navigator.userAgent.toLowerCase().indexOf("edge") !== -1 || 
                    (document.documentMode && document.documentMode >= 11)) {
                document.execCommand('ClearAuthenticationCache', false);
            }
            else {
                /* This works in Firefox, Opera, Chrome, does not work in Safari.
                
                Firefox and Opera do not care about the real parameter. They clear authentication
                date cache even when the realm of the ForceLogout.aspx page does not match the realm
                used by IIS.
                
                Chrome needs a proper realm to be specified, otherwise
                it remembers both the original credentials the user used to log into application
                as well as the fake credentials supplied to ForceLogout.aspx page.
                When user clicks login again link or press Back button in the browser,
                Chrome first tries the fake credentials, since they were accepted in the last request, 
                then it proceeds with credentials specified by user in last logon.
                As result browser successfully authenticates with old credentials. 
                
                Safari (on Windows) does not send a request to ForceLogout.aspx,
                although JavaScript code executes without exceptions. */
                var url = "ForceLogout.aspx";
                var id = encodeURIComponent("thaCuxeq*NA_A#4bA3rupAfRu#@QA2Ud");
                var user = id;
                var pass = id;
                var xhr = new XMLHttpRequest();
                xhr.open('POST', url, false, user, pass);
                var fd = new FormData();
                fd.append("id", id);
                xhr.send(fd);
            }
        }
    </script>
</head>
<body id="body" runat="server" style="font-family:Tahoma;font-size:13px;background-color:#ffffff;color:#000000;">
    <form id="formLogout" runat="server">
    <div runat="server" id="endSessionHolder">
        <asp:Label ID="lblEndSessionMessage" runat="server" Text="Current session is ended."></asp:Label>&nbsp;
      <!--  <asp:HyperLink ID="hlCloseWindow"  runat="server" NavigateUrl="javascript:self.close();">Close the window</asp:HyperLink> -->
        &nbsp;
        <asp:HyperLink ID="hlEnterAgain" runat="server">Enter again</asp:HyperLink>
            <br/><br/>
        <asp:Label ForeColor="#990000" ID="lblClosingRequired" runat="server" Text=""></asp:Label>
    </div>
    <div>
        <asp:Label ID="lblCookieDisabledMessage" ForeColor="Red" runat="server" Text="" Visible="false"><%=HttpCommander.Utils.LocalizationsManager.GetString("CookiesDisabledMessage")%></asp:Label>
    </div>
    </form>
</body>
</html>