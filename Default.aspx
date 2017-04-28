<%@ Page Language="C#" %>
<%@ Import Namespace="System.Net" %>
<%@ Import Namespace="System.IO" %>
<%@ Import Namespace="System.Drawing" %>
<%@ Import Namespace="HttpCommander" %>
<%@ Import Namespace="System.Web.Configuration" %>
<%@ Import Namespace="System.Security.Principal" %>
<%@ Import Namespace="System.Collections.Generic" %>

<%-- Uncomment for using checking of users in AD 
<%@ Assembly Name="System.DirectoryServices, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a" %>
<%@ Import Namespace="System.DirectoryServices" %>
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html id="htmlPage" runat="server" xmlns="http://www.w3.org/1999/xhtml" class="login-bg">
<head runat="server">
<script language="c#" runat="server">
    bool isMobileBrowser = false;
    string pageBodyStyle = "standard-ui-body";
    protected void Page_Load(object sender, EventArgs e)
    {
        Utils.AddScript("Scripts/error-handler" + Utils.BuildModeJs + ".js?v=" + Utils.AssemblyVersion, false, this.Page);
        if (HCSettings.Instance.Main.IsDemoMode.Value)
            Utils.AddCorsHeaders(Context);
        try
        {
            if (formContainer != null && Utils.DetectMobileBrowser(this) && formContainer.Controls != null)
                foreach (var ctrl in formContainer.Controls)
                    if (ctrl is HtmlContainerControl)
                    {
                        (ctrl as HtmlControl).Style["width"] = "85% !important";
                        break;
                    }
        }
        catch { }

        // fix for open folder specified in query stirng if authentication requierd
        if (!Page.IsPostBack)
            btnLogin.PostBackUrl = "Default.aspx" + Request.Url.Query;

        Response.Expires = -1;
        Response.CacheControl = "No-cache";
        Response.AppendHeader("X-HttpCommander-Status", "0");
        isMobileBrowser = isMobileBrowser || (Request.QueryString["Mobile"] != null);
        /* validateUserResult is assigned a value when we validate user credentials.
         * We pass the value of validateUserResult to RenderLoginForm function.
         * If validateUserResult is defined and not successfull, it is displayed
         * in the status label, otherwise the label is not shown.
         * If login form is not rendered, we do not display the validateUserResult.
         */
        ValidateUserResult? validateUserResult = null;
        /* user name to set in login form */
        string defaultUserName = null;
        string lang = null;

        if (Utils.UserSettings.Runtime.AuthMode == AuthenticationMode.Windows && (Session == null || (Session != null && Session.IsCookieless)))
            checkCookieEnabledHolder.InnerHtml = "";

        if (!Page.IsPostBack)
        {
            Utils.RunShortDiagnostics();
            try
            {
                lang = CheckLanguage();
                if (lang != null && string.Compare(lang, Utils.CurrentLanguage, true) != 0 && Utils.AvailableLocalizations.Contains(lang))
                {
                    Utils.LocalizationsManager = null;
                    Utils.CurrentLanguage = lang;
                    Utils.SetLanguageCookie(lang);
                }
            }
            catch
            { }
        }

        // Example using automatic logon with specified user credentials
        if (!AuthenticateViaQueryString(ref defaultUserName, ref validateUserResult))
            AuthenticateViaPostRequest(ref defaultUserName, ref validateUserResult);

        /*
        // automatic logon from CMS. See open source code at App_Code\ExternalCMSIntegration.cs
        if (Request.QueryString["username"] != null && Request.QueryString["passwordhash"] != null)
        {
            string userName = Request.QueryString["username"].ToString().Trim();
            string passwordHash = Request.QueryString["passwordhash"].ToString();
            //if (ExternalCMSIntegration.ValidateUserPasswordHashDrupal(userName, passwordHash))
            //if (ExternalCMSIntegration.ValidateUserPasswordHashJoomla(userName, passwordHash))
            //if (ExternalCMSIntegration.ValidateUserPasswordHashWordPress(userName, passwordHash))
            {
                FormsAuthentication.SetAuthCookie(userName, false);
                IUserIdentity userIdentity = AccountUtils.GetUserIdentity(userName);
                RenderMainBody(userIdentity);
                Log.OnLogin(userIdentity.Name);
                if (Request.QueryString["ReturnUrl"] != null)
                {
                    string ReturnUrl = Request.QueryString["ReturnUrl"];
                    Response.Redirect(ReturnUrl);
                }
                return;
            }
        }
        */

        if (HCSettings.Instance.Runtime.HCAuth == HCAuthenticationMode.Shibboleth && User.Identity.IsAuthenticated)
        {
            FormsAuthentication.SetAuthCookie(User.Identity.Name, false);
            RenderMainBody();
            Log.OnLogin(User.Identity.Name);
            if (Request.QueryString["ReturnUrl"] != null)
            {
                string ReturnUrl = Request.QueryString["ReturnUrl"];
                Response.Redirect(ReturnUrl);
            }
        }
        /* if the request was initially authenticated or if we authenticated via query string. */
        else if (User.Identity.IsAuthenticated || validateUserResult == ValidateUserResult.Success)
        {
            if (Utils.UserSettings.Runtime.AuthMode == AuthenticationMode.Windows)
            {
                /*
                // Check of the user on accessory of OU/Container/Groups
                bool success = false;
                string ldapContainer = "LDAP://YOUR_SERVER_NAME_OR_IP/";
                // for filtering by OU:
                string ldapContainer1 = ldapContainer + "OU=ouName1,DC=domainName,DC=domainSuffix";
                // for filtering by CN(s):
                //string ldapContainer1 = "CN=cnName1,DC=domainName,DC=domainSuffix";
                try
                {
                    using (DirectoryEntry ldap = new DirectoryEntry(ldapContainer1))
                    //using (DirectoryEntry ldap = new DirectoryEntry(ldapContainer1, "user_name_for_connect", "password"))
                    {
                        string filter = "(&(sAMAccountName=" + AccountUtils.CurrentUserName + ")(objectCategory=person)(objectClass=user)";
                        //// for filtering by group(s), where groupDN - full distinguished group name, for example:
                        ////  CN=group1,DC=domainName,DC=domainSuffix or
                        ////  CN=group2,OU=orgUnit,DC=domainName,DC=domainName (if group2 is included in orgUnit OU)
                        //// (also see http://tools.ietf.org/html/rfc4510 and related RFC)
                        //filter += "(memberOf=groupDN>)"; // single group
                        //filter += "(|(memberOf=groupDN1)(memberOf=groupDN2)...(memberOf=groupDNX))"; // some groups
                        filter += ")";
                        using (DirectorySearcher searcher = new DirectorySearcher(ldap, filter))
                        {
                            success = searcher.FindOne() != null;
                        }
                    }
                }
                catch (Exception ex)
                {
                    // handling exception
                    ErrorLog.Add(ex);
                }
                // checking for second OU/CN, if not success for first OU/CN
                if (!success)
                {
                    // for second OU:
                    string ldapContainer2 = ldapContainer + "OU=ouName2,DC=domainName,DC=domainSuffix";
                    // or second CN:
                    //string ldapContainer2 = ldapContainer + "CN=cnName2,DC=domainName,DC=domainSuffix";
                    try
                    {
                        using (DirectoryEntry ldap = new DirectoryEntry(ldapContainer2))
                        //using (DirectoryEntry ldap = new DirectoryEntry(ldapContainer2, "user_name_for_connect", "password"))
                        {
                            string filter = "(&(sAMAccountName=" + AccountUtils.CurrentUserName + ")(objectCategory=person)(objectClass=user))";
                            using (DirectorySearcher searcher = new DirectorySearcher(ldap, filter))
                            {
                                success = searcher.FindOne() != null;
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        // handling exception
                        ErrorLog.Add(ex);
                    }
                }
                // etc. for other OU/CN
                // ...
                if (!success)
                {
                    // current logged-in user doesn't enter into the given OU/Container/Groups
                    Response.Redirect("Logout.aspx");
                    return;
                }
                */

                // OnLogin event with Windows authentication
                Log.OnLogin();
            }
            TwoFactorAuthManager.CheckAuthResult(Request);
            if (TwoFactorAuthManager.IsAuthPassed())
                RenderMainBody();
            else
                RenderTwoFactorAuthBlock();
        }
        /* unauthenticated request */
        else
        {
            /*Add styles.css even for login page. It contain css styles for login page.*/
            /**
             * Add meta tag for mobile browsers each time when page rendered expect postback
             * When login form submited user may want to load standard interface instead of mobile
             */
            if (!Page.IsPostBack || Request.QueryString["RecoverPassword"] != null || Request.QueryString["RecoverUserName"] != null || Request.QueryString["Register"] != null || Request.QueryString["ChangeEmail"] != null)
            {
                Utils.AddCss("Styles" + Utils.BuildModeCss + ".css?v=" + Utils.AssemblyVersion, this.Page);
                Utils.AddMeta("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0", this.Page);
            }

            if (Request.QueryString["RecoverPassword"] != null && Utils.UserSettings.Main.EnablePasswordRecovery.Value && !Utils.UserSettings.Main.WindowsUsersWithFormAuth.Value)
                RenderRecoverPasswordForm();
            else if (Request.QueryString["RecoverUserName"] != null && Utils.UserSettings.Main.EnableUserNameRecovery.Value && !Utils.UserSettings.Main.WindowsUsersWithFormAuth.Value)
                RenderRecoverUserNameForm();
            else if (Request.QueryString["Register"] != null && Utils.UserSettings.Main.EnableAnonymRegister.Value && !Utils.UserSettings.Main.WindowsUsersWithFormAuth.Value)
                RenderRegisterForm();
            else if (Request.QueryString["ChangeEmail"] != null && Utils.UserSettings.Main.EnableChangeEmail.Value && !Utils.UserSettings.Main.WindowsUsersWithFormAuth.Value)
                RenderChangeEmailForm();
            else
                RenderLoginForm(validateUserResult, defaultUserName);
        }        
    }

    // If query string contains user credentials, try to authenticate with these credentials.
    // What if User.Identity.IsAuthenticated is true?
    private bool AuthenticateViaQueryString(ref string defaultUserName, ref ValidateUserResult? validateUserResult)
    {
        bool result = false;
        bool isAuthenticatedPrevSameUser = false;
        if (HCSettings.Instance.Runtime.HCAuth != HCAuthenticationMode.Shibboleth
            && HCSettings.Instance.Runtime.HCAuth != HCAuthenticationMode.Windows
            && Request.QueryString["username"] != null)
        {
            IUserIdentity identity = AccountUtils.GetUserIdentity(Request.QueryString["username"].ToString());
            defaultUserName = identity.Name;
            if (User.Identity.IsAuthenticated)
            {
                if (!string.Equals(identity.Name, User.Identity.Name, StringComparison.OrdinalIgnoreCase))
                {
                    FormsAuthentication.SignOut();
                    Session.Abandon();
                    // Remove from userCache in GlobalCache current logouted user
                    GlobalCache.Instance.OnCurrentUserLogout();
                    Response.Redirect(Request.RawUrl, true);
                }
                else
                    isAuthenticatedPrevSameUser = true;
            }
            if (Request.QueryString["password"] != null)
            {
                string password = Request.QueryString["password"].ToString();
                validateUserResult = Utils.AccountsManager.ValidateUser(identity, password);
                if (validateUserResult == ValidateUserResult.Success)
                {
                    FormsAuthentication.SetAuthCookie(identity.Name, false);
                    Log.OnLogin(identity.Name);
                    result = true;
                }
            }
            else if (Request.QueryString["passwordhash"] != null)
            {
                string passwordHash = Request.QueryString["passwordhash"].ToString();
                // uncomment the line below to allow login with passwordhash in URL. Check that Data\accounts.xml not available for users.
                // validateUserResult = Utils.AccountsManager.ValidateUserHash(identity, passwordHash);
                if (validateUserResult == ValidateUserResult.Success)
                {
                    FormsAuthentication.SetAuthCookie(identity.Name, false);
                    Log.OnLogin(identity.Name);
                    result = true;
                }
            }
            /* At this point we may be either authenticated or not,
             * validateUserResult may contain authentication results or remain uninitialized.
             * In any case the function continues. */
        }
        if (!result && isAuthenticatedPrevSameUser)
        {
            FormsAuthentication.SignOut();
            Session.Abandon();
            // Remove from userCache in GlobalCache current logouted user
            GlobalCache.Instance.OnCurrentUserLogout();
            Response.Redirect(Request.RawUrl, true);
        }
        return result;
    }

    // If query is POST and post fiels contains user credentials, try to authenticate with these credentials.
    // What if User.Identity.IsAuthenticated is true?
    private bool AuthenticateViaPostRequest(ref string defaultUserName, ref ValidateUserResult? validateUserResult)
    {
        bool result = false;
        bool isAuthenticatedPrevSameUser = false;
        if (HCSettings.Instance.Runtime.HCAuth != HCAuthenticationMode.Shibboleth
            && HCSettings.Instance.Runtime.HCAuth != HCAuthenticationMode.Windows
            && Request.HttpMethod.ToLower() == "post"
            && Request.Form != null
            && Request.Form["username"] != null)
        {
            IUserIdentity identity = AccountUtils.GetUserIdentity(Request.Form["username"].ToString());
            defaultUserName = identity.Name;
            if (User.Identity.IsAuthenticated)
            {
                if (!string.Equals(identity.Name, User.Identity.Name, StringComparison.OrdinalIgnoreCase))
                {
                    FormsAuthentication.SignOut();
                    Session.Abandon();
                    // Remove from userCache in GlobalCache current logouted user
                    GlobalCache.Instance.OnCurrentUserLogout();
                    Response.Redirect(Request.RawUrl, true);
                }
                else
                    isAuthenticatedPrevSameUser = true;
            }
            if (Request.Form["password"] != null)
            {
                string password = Request.Form["password"].ToString();
                validateUserResult = Utils.AccountsManager.ValidateUser(identity, password);
                if (validateUserResult == ValidateUserResult.Success)
                {
                    FormsAuthentication.SetAuthCookie(identity.Name, false);
                    Log.OnLogin(identity.Name);
                    result = true;
                }
            }
            else if (Request.Form["passwordhash"] != null)
            {
                string passwordHash = Request.Form["passwordhash"].ToString();
                // uncomment the line below to allow login with passwordhash in URL. Check that Data\accounts.xml not available for users.
                // validateUserResult = Utils.AccountsManager.ValidateUserHash(identity, passwordHash);
                if (validateUserResult == ValidateUserResult.Success)
                {
                    FormsAuthentication.SetAuthCookie(identity.Name, false);
                    Log.OnLogin(identity.Name);
                    result = true;
                }
            }
            /* At this point we may be either authenticated or not,
             * validateUserResult may contain authentication results or remain uninitialized.
             * In any case the function continues. */
            if (result && Request.Form["language"] != null)
            {
                string lang = Request.Form["language"];
                Utils.LocalizationsManager = null;
                Utils.CurrentLanguage = lang;
                Utils.SetLanguageCookie(lang);
            }
        }
        if (!result && isAuthenticatedPrevSameUser)
        {
            FormsAuthentication.SignOut();
            Session.Abandon();
            // Remove from userCache in GlobalCache current logouted user
            GlobalCache.Instance.OnCurrentUserLogout();
            Response.Redirect(Request.RawUrl, true);
        }
        return result;
    }

    protected string CheckLanguage()
    {
        //Read if default language passed at URL like HTCOMNET/Default.aspx?Language=Spanish
        //Language parameter is case sensitive!
        if (Request.QueryString["Language"] != null && Request.QueryString["Language"].Length>0)
        {
            string firstLetter = Request.QueryString["Language"].Substring(0, 1);
            string correctedLang = firstLetter.ToUpper() + Request.QueryString["Language"].Remove(0, 1);
            return correctedLang;
        }

        if (Request.Cookies != null && Request.Cookies["htclang"] != null)
        {
            string langCookie = Utils.DecodeFrom64(Request.Cookies["htclang"].Value);
            return langCookie;
        }

        return null;
    }

    protected override void OnInit(EventArgs e)
    {
        base.OnInit(e);
        isMobileBrowser = Utils.DetectMobileBrowser(this.Page);
    }

    protected void btnLogin_Click(object sender, EventArgs e)
    {
        IUserIdentity identity = AccountUtils.GetUserIdentity(txtUserName.Text);
        ValidateUserResult validateUserResult = ValidateUserResult.Failure;
        validateUserResult = Utils.AccountsManager.ValidateUser(identity, txtPassword.Text);
        // automatic logon from CMS. See open source code at App_Code\ExternalCMSIntegration.cs
        //ValidateUserResult validateUserResult = ExternalCMSIntegration.ValidateUserPasswordDrupal(userName, txtPassword.Text) ? ValidateUserResult.Success : ValidateUserResult.Failure;
        //ValidateUserResult validateUserResult = ExternalCMSIntegration.ValidateUserPasswordJoomla(userName, txtPassword.Text) ? ValidateUserResult.Success : ValidateUserResult.Failure;
        //ValidateUserResult validateUserResult = ExternalCMSIntegration.ValidateUserPasswordWordPress(userName, txtPassword.Text) ? ValidateUserResult.Success : ValidateUserResult.Failure;
        if (validateUserResult == ValidateUserResult.Success)
        {
            Utils.LocalizationsManager = null;
            Utils.CurrentLanguage = ddlLanguages.Text;
            Utils.SetLanguageCookie(ddlLanguages.Text);
            FormsAuthentication.SetAuthCookie(identity.Name, cbRemember.Checked);
            TwoFactorAuthManager.CheckAuthResult(Request);
            if (!TwoFactorAuthManager.IsAuthPassed())
                RenderTwoFactorAuthBlock(identity.Name);
            else
            {
                //FormsAuthentication
                RenderMainBody(identity);
                // OnLogin event with Forms authentication
                Log.OnLogin(identity.Name);
                if (Request.QueryString["ReturnUrl"] != null)
                {
                    string ReturnUrl = Request.QueryString["ReturnUrl"];
                    //Add special query string to load standard ui even for redirected page 
                    if (isMobileBrowser && Page.IsPostBack)
                    {
                        string concat = ReturnUrl.IndexOf("?") >= 0 ? "&" : "?";
                        string mode = !ui_touch.Checked ? "standard" : "";

                        if (ReturnUrl.IndexOf("Mobile=") < 0)
                            ReturnUrl = ReturnUrl + concat + "Mobile=" + mode;
                        else
                            ReturnUrl = Regex.Replace(ReturnUrl, "Mobile=([^&#]*)", "Mobile=" + mode);
                    }
                    Response.Redirect(ReturnUrl);
                }
            }
        }
        else
        {
            /* If login attempt failed, add meta tag for mobile browser,
             * otherwise tag will be added in RenderMainBody depending on interface selected by user
             */
            if(isMobileBrowser)
                Utils.AddMeta("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0", this.Page);

            Utils.AddCss("Styles" + Utils.BuildModeCss + ".css?v=" + Utils.AssemblyVersion, this.Page);
            LoginErrorMessage(validateUserResult, identity);
        }
    }

    protected void btnEmailPass_Click(object sender, EventArgs e)
    {
        if (!Utils.UserSettings.Main.EnablePasswordRecovery.Value || HCSettings.Instance.Runtime.HCAuth != HCAuthenticationMode.Forms)
        {
            lblRecoverPassStatus.Text = Utils.LocalizationsManager.GetString("ServerPermissionDenied");
            lblRecoverPassStatus.CssClass = "login-form-table-error-text";
            lblRecoverPassStatus.Visible = true;
            return;
        }
        if (Utils.UserSettings.Main.IsDemoMode.Value && Utils.IsDemoUser(txtRecoverPassUserName.Text))
        {
            lblRecoverPassStatus.Text = Utils.LocalizationsManager.GetString("ServerDemoMode");
            lblRecoverPassStatus.CssClass = "login-form-table-error-text";
            lblRecoverPassStatus.Visible = true;
            return;
        }
        IUserIdentity identity = null;
        User user = null;
        try
        {
            identity = AccountUtils.GetUserIdentity(txtRecoverPassUserName.Text);
            user = Utils.AccountsManager.GetUser(new GenericIdentity(txtRecoverPassUserName.Text));
        }
        catch (Exception ex)
        {
            lblRecoverPassStatus.Text = HttpUtility.HtmlEncode(ex.Message);
            lblRecoverPassStatus.CssClass = "login-form-table-error-text";
            lblRecoverPassStatus.Visible = true;
            ErrorLog.Add(ex);
            return;
        }
        if (!Utils.AccountsManager.ExistsUser(identity))
        {
            lblRecoverPassStatus.Text = Utils.LocalizationsManager.GetString("RecoverPasswordErrorInvalidUserName");
            lblRecoverPassStatus.CssClass = "login-form-table-error-text";
            lblRecoverPassStatus.Visible = true;
            return;
        }
        if (user == null || string.IsNullOrEmpty(user.Email))
        {
            lblRecoverPassStatus.Text = Utils.LocalizationsManager.GetString("RecoverPasswordErrorNoEmail");
            lblRecoverPassStatus.CssClass = "login-form-table-error-text";
            lblRecoverPassStatus.Visible = true;
            return;
        }
        if (!Utils.AccountsManager.EmailUserPassword(identity))
        {
            lblRecoverPassStatus.Text = Utils.LocalizationsManager.GetString("RecoverPasswordErrorSendEmail");
            lblRecoverPassStatus.CssClass = "login-form-table-error-text";
            lblRecoverPassStatus.Visible = true;
            return;
        }
        lblRecoverPassStatus.Text = Utils.LocalizationsManager.GetString("RecoverPasswordSuccess");
        lblRecoverPassStatus.CssClass = "login-form-table-success-text";
        lblRecoverPassStatus.Visible = true;
    }

    protected void btnEmailName_Click(object sender, EventArgs e)
    {
        if (!Utils.UserSettings.Main.EnableUserNameRecovery.Value || HCSettings.Instance.Runtime.HCAuth != HCAuthenticationMode.Forms)
        {
            lblRecoverNameStatus.Text = Utils.LocalizationsManager.GetString("ServerPermissionDenied");
            lblRecoverNameStatus.CssClass = "login-form-table-error-text";
            lblRecoverNameStatus.Visible = true;
            return;
        }
        if (string.IsNullOrWhiteSpace(txtRecoverNameEmail.Text))
        {
            lblRecoverNameStatus.Text = Utils.LocalizationsManager.GetString("RecoverUserNameErrorInvalidEmail");
            lblRecoverNameStatus.CssClass = "login-form-table-error-text";
            lblRecoverNameStatus.Visible = true;
            return;
        }
        User[] users = null;
        try
        {
            users = Utils.AccountsManager.GetUsers().Where(u => u != null && u.Identity != null &&
                !string.IsNullOrWhiteSpace(u.Identity.Name) && !string.IsNullOrWhiteSpace(u.Email) &&
                string.Equals(txtRecoverNameEmail.Text.Trim(), u.Email.Trim(), StringComparison.OrdinalIgnoreCase)).ToArray();
        }
        catch (Exception ex)
        {
            lblRecoverNameStatus.Text = HttpUtility.HtmlEncode(ex.Message);
            lblRecoverNameStatus.CssClass = "login-form-table-error-text";
            lblRecoverNameStatus.Visible = true;
            ErrorLog.Add(ex);
            return;
        }
        if (users == null || users.Length == 0)
        {
            lblRecoverNameStatus.Text = Utils.LocalizationsManager.GetString("RecoverUserNameErrorNoEmail");
            lblRecoverNameStatus.CssClass = "login-form-table-error-text";
            lblRecoverNameStatus.Visible = true;
            return;
        }
        if (Utils.UserSettings.Main.IsDemoMode.Value && users.Any(u => Utils.IsDemoUser(u.Identity.Name)))
        {
            lblRecoverNameStatus.Text = Utils.LocalizationsManager.GetString("ServerDemoMode");
            lblRecoverNameStatus.CssClass = "login-form-table-error-text";
            lblRecoverNameStatus.Visible = true;
            return;
        }
        if (!Utils.EmailUserName(users))
        {
            lblRecoverNameStatus.Text = Utils.LocalizationsManager.GetString("RecoverPasswordErrorSendEmail");
            lblRecoverNameStatus.CssClass = "login-form-table-error-text";
            lblRecoverNameStatus.Visible = true;
            return;
        }
        lblRecoverNameStatus.Text = Utils.LocalizationsManager.GetString("RecoverUserNameSuccess");
        lblRecoverNameStatus.CssClass = "login-form-table-success-text";
        lblRecoverNameStatus.Visible = true;
    }

    protected void btnChangeEmailSubmit_Click(object sender, EventArgs e)
    {
        if (Utils.UserSettings.Main.IsDemoMode.Value)// && Utils.IsDemoUser(txtChangeEmailUserName.Text))
        {
            lblChangeEmailStatus.Text = Utils.LocalizationsManager.GetString("ServerDemoMode");
            lblChangeEmailStatus.CssClass = "login-form-table-error-text";
            lblChangeEmailStatus.Visible = true;
            return;
        }
        if (!Utils.UserSettings.Main.EnableChangeEmail.Value || HCSettings.Instance.Runtime.HCAuth != HCAuthenticationMode.Forms)
        {
            lblChangeEmailStatus.Text = Utils.LocalizationsManager.GetString("ServerPermissionDenied");
            lblChangeEmailStatus.CssClass = "login-form-table-error-text";
            lblChangeEmailStatus.Visible = true;
            return;
        }
        ValidateUserResult validateUserResult = ValidateUserResult.Failure;
        try
        {
            validateUserResult = Utils.AccountsManager.ValidateUser(AccountUtils.GetUserIdentity(txtChangeEmailUserName.Text), txtChangeEmailUserPassword.Text);
        }
        catch (Exception ex)
        {
            lblChangeEmailStatus.Text = HttpUtility.HtmlEncode(ex.Message);
            lblChangeEmailStatus.CssClass = "login-form-table-error-text";
            lblChangeEmailStatus.Visible = true;
            ErrorLog.Add(ex);
            return;
        }
        if (validateUserResult == ValidateUserResult.Blocked)
        {
            lblChangeEmailStatus.Text = string.Format(Utils.LocalizationsManager.GetString("LoginBlocked"), LoginAttempts.BlockTimeoutMinutes);
            lblChangeEmailStatus.CssClass = "login-form-table-error-text";
            lblChangeEmailStatus.Visible = true;
            return;
        }
        else if (validateUserResult == ValidateUserResult.Failure)
        {
            lblChangeEmailStatus.Text = Utils.LocalizationsManager.GetString("LoginFailure");
            lblChangeEmailStatus.CssClass = "login-form-table-error-text";
            lblChangeEmailStatus.Visible = true;
            return;
        }
        User user = null;
        try
        {
            user = Utils.AccountsManager.GetUser(new GenericIdentity(txtChangeEmailUserName.Text));
        }
        catch (Exception ex)
        {
            user = null;
            ErrorLog.Add(ex);
        }
        if (user == null)
        {
            lblChangeEmailStatus.Text = Utils.LocalizationsManager.GetString("LoginFailure");
            lblChangeEmailStatus.CssClass = "login-form-table-error-text";
            lblChangeEmailStatus.Visible = true;
            return;
        }
        try
        {
            var xmlAccMan = Utils.AccountsManager as XmlAccountManager;
            if (xmlAccMan == null)
            {
                lblChangeEmailStatus.Text = Utils.LocalizationsManager.GetString("ServerPermissionDenied");
                lblChangeEmailStatus.CssClass = "login-form-table-error-text";
                lblChangeEmailStatus.Visible = true;
                return;
            }
            var email = txtChangeEmailEmail.Text;
            if (!string.IsNullOrWhiteSpace(email) && xmlAccMan.GetUsers().Exists(u => u != null && !u.Equals(user) && !string.IsNullOrWhiteSpace(u.Email) &&
                    string.Equals(email, u.Email, StringComparison.Ordinal)))
            {
                lblChangeEmailStatus.Text = Utils.LocalizationsManager.GetString("AdminUsersEmailAlreadyExists");
                lblChangeEmailStatus.CssClass = "login-form-table-error-text";
                lblChangeEmailStatus.Visible = true;
                return;
            }
            user.Email = (email ?? string.Empty).Trim();
            xmlAccMan.SaveToXml();
        }
        catch (Exception ex)
        {
            lblChangeEmailStatus.Text = HttpUtility.HtmlEncode(ex.Message);
            lblChangeEmailStatus.CssClass = "login-form-table-error-text";
            lblChangeEmailStatus.Visible = true;
            ErrorLog.Add(ex);
            return;
        }
        lblChangeEmailStatus.Text = Utils.LocalizationsManager.GetString("ChangeEmailStatusSuccess");
        lblChangeEmailStatus.CssClass = "login-form-table-success-text";
        lblChangeEmailStatus.Visible = true;
    }

    protected void btnRegisterSubmit_Click(object sender, EventArgs e)
    {
        if (!Utils.UserSettings.Main.EnableAnonymRegister.Value || HCSettings.Instance.Runtime.HCAuth != HCAuthenticationMode.Forms)
        {
            lblRegisterStatus.Text = Utils.LocalizationsManager.GetString("ServerPermissionDenied");
            lblRegisterStatus.CssClass = "login-form-table-error-text";
            tblRegisterStatus.Visible = true;
            txtRegisterCaptcha.Text = "";
            return;
        }
        if (txtRegisterPassword.Text != txtRegisterPassword2.Text)
        {
            lblRegisterStatus.Text = Utils.LocalizationsManager.GetString("RegisterErrorPasswordNotMatch");
            lblRegisterStatus.CssClass = "login-form-table-error-text";
            tblRegisterStatus.Visible = true;
            txtRegisterCaptcha.Text = "";
            return;
        }
        string sessionCaptcha = null;
        try { sessionCaptcha = this.Session["CaptchaImageTextPrev"].ToString(); }
        catch { }
        if (sessionCaptcha == null || sessionCaptcha != txtRegisterCaptcha.Text)
        {
            lblRegisterStatus.Text = Utils.LocalizationsManager.GetString("RegisterErrorCaptchaInvalid");
            lblRegisterStatus.CssClass = "login-form-table-error-text";
            tblRegisterStatus.Visible = true;
            txtRegisterCaptcha.Text = "";
            return;
        }
        if (Utils.AccountsManager.ExistsUser(AccountUtils.GetUserIdentity(txtRegisterUserName.Text), txtRegisterEmail.Text))
        {
            lblRegisterStatus.Text = Utils.LocalizationsManager.GetString("RegisterErrorUserExists");
            lblRegisterStatus.CssClass = "login-form-table-error-text";
            tblRegisterStatus.Visible = true;
            txtRegisterCaptcha.Text = "";
            return;
        }
        User user = null;
        try
        {
            user = new HttpCommander.User(
                HttpCommander.AccountUtils.GetUserIdentity(txtRegisterUserName.Text),
                txtRegisterPassword.Text,
                txtRegisterEmail.Text);
        }
        catch (Exception ex)
        {
            lblRegisterStatus.Text = HttpUtility.HtmlEncode(ex.Message);
            lblRegisterStatus.CssClass = "login-form-table-error-text";
            tblRegisterStatus.Visible = true;
            txtRegisterCaptcha.Text = "";
            ErrorLog.Add(ex);
            return;
        }
        if (Utils.UserSettings.Main.EnableAccountActivation.Value)
        {
            user.Activated = false;
            user.ActivationCode = Utils.GenerateRandomString(64);
        }

        /* Uncomment condition below to automatically create and assgn groups based on a user email domain.
        if (!String.IsNullOrEmpty(user.Email) && user.Email.Split('@').Length > 1)
        {
            var emailDomain = user.Email.Split('@')[1];
            //Create group if needed and add user into it automatically
            HttpCommander.Group grp = ((XmlAccountManager)Utils.AccountsManager).GetGroup(new GenericGroupIdentity(emailDomain));
            if (grp == null)
            {
                grp = new HttpCommander.Group(new GenericGroupIdentity(emailDomain));
                Utils.AccountsManager.AddGroup(grp);
            }
            grp.AddMember(user.Identity);
        }
        */

        user.CustomField = txtRegisterExtraInfo.Text;
        Utils.AccountsManager.AddUserWithDefaultGroups(user);
        Utils.SendEmailUserRegistered(user, user.Email);
        lblRegisterStatus.CssClass = "login-form-table-success-text";
        lblRegisterStatus.Text = Utils.LocalizationsManager.GetString("RegisterSuccess");
        if (Utils.UserSettings.Main.EnableAccountActivation.Value)
            lblRegisterStatus.Text +="<br/>"+ Utils.LocalizationsManager.GetString("RegisterActivationSent") + " " + Utils.LocalizationsManager.GetString("RegisterActivationCheckEmail");
        tblRegisterStatus.Visible = true;
        tblRegisterFields.Visible = false;
        tblRegisterStatus.Height = "150px";
    }

    protected void btnTwoFactorCancel_Click(object sender, EventArgs e)
    {
        string ReturnUrl = string.Empty;
        if (Request.QueryString["ReturnUrl"] != null)
             ReturnUrl = Request.QueryString["ReturnUrl"];
        Response.Redirect("logout.aspx" + (String.IsNullOrEmpty(ReturnUrl) ? "" : "?ReturnUrl=" + ReturnUrl));
    }

    private void RenderLinksBlock()
    {
        linksBlock.Visible = true;
        lnkLogin.Text = "|&nbsp;" + Utils.LocalizationsManager.GetString("LoginLinkText") + "&nbsp;|";
        lnkRecoverPassword.Text = "|&nbsp;" + Utils.LocalizationsManager.GetString("RecoverPasswordLinkText") + "&nbsp;|";
        lnkRecoverPassword.Visible = Utils.UserSettings.Main.EnablePasswordRecovery.Value;
        lnkRecoverUserName.Text = "|&nbsp;" + Utils.LocalizationsManager.GetString("RecoverUserNameLinkText") + "&nbsp;|";
        lnkRecoverUserName.Visible = Utils.UserSettings.Main.EnableUserNameRecovery.Value;
        lnkRegister.Text = "|&nbsp;" + Utils.LocalizationsManager.GetString("RegisterLinkText") + "&nbsp;|";
        lnkRegister.Visible = Utils.UserSettings.Main.EnableAnonymRegister.Value;
        lnkChangeEmail.Text = "|&nbsp;" + Utils.LocalizationsManager.GetString("ChangeEmail") + "&nbsp;|";
        lnkMobileVersion.Visible = !isMobileBrowser && !lnkLogin.Visible;
        lnkMobileVersion.Text = Utils.LocalizationsManager.GetString("LoginMobileVersionLinkText");
    }

    private void DisableAllForms()
    {
        formContainer.Visible = false;
        formLogin.Visible = false;
        formRecoverPass.Visible = false;
        formRecoverName.Visible = false;
        formChangeEmail.Visible = false;
        formRegister.Visible = false;
        mainBody.Visible = false;
        senchaTouch2Body.Visible = false;
        jqmBody.Visible = false;
        twofactor.Visible = false;
    }

    private void RenderRecoverPasswordForm()
    {
        RenderLinksBlock();
        lnkRecoverPassword.Visible = false;
        DisableAllForms();
        formContainer.Visible = true;
        formRecoverPass.Visible = true;
        lblRecoverPassTitle.Text = Utils.LocalizationsManager.GetString("RecoverPasswordTitle");
        lblRecoverPassUserNameCaption.Text = Utils.LocalizationsManager.GetString("CommonFieldLabelUserName") + ":";
        btnEmailPass.Text = Utils.LocalizationsManager.GetString("RecoverPasswordEmailPassword");
    }

    private void RenderRecoverUserNameForm()
    {
        RenderLinksBlock();
        lnkRecoverUserName.Visible = false;
        DisableAllForms();
        formContainer.Visible = true;
        formRecoverName.Visible = true;
        lblRecoverNameTitle.Text = Utils.LocalizationsManager.GetString("RecoverUserNameTitle");
        lblRecoverNameEmailCaption.Text = Utils.LocalizationsManager.GetString("RegisterEmail") + ":";
        btnEmailName.Text = Utils.LocalizationsManager.GetString("RecoverUserEmailName");
    }

    private void RenderChangeEmailForm()
    {
        RenderLinksBlock();
        lnkChangeEmail.Visible = false;
        DisableAllForms();
        formContainer.Visible = true;
        formChangeEmail.Visible = true;
        lblChangeEmailTitle.Text = Utils.LocalizationsManager.GetString("ChangeEmailTitle");
        lblChangeEmailUserNameCaption.Text = Utils.LocalizationsManager.GetString("CommonFieldLabelUserName") + ":";
        lblChangeEmailUserPasswordCaption.Text = Utils.LocalizationsManager.GetString("CommonFieldLabelPassword") + ":";
        lblChangeEmailEmailCaption.Text = Utils.LocalizationsManager.GetString("ChangeEmailEmail") + ":";
        btnChangeEmailSubmit.Text = Utils.LocalizationsManager.GetString("ChangeEmailSubmit");
    }

    private void RenderRegisterForm()
    {
        RenderLinksBlock();
        lnkRegister.Visible = false;
        DisableAllForms();
        formContainer.Visible = true;
        formRegister.Visible = true;
        lblRegisterTitle.Text = Utils.LocalizationsManager.GetString("RegisterTitle");
        lblRegisterUserNameCaption.Text = Utils.LocalizationsManager.GetString("CommonFieldLabelUserName") + ":";
        lblRegisterPasswordCaption.Text = Utils.LocalizationsManager.GetString("CommonFieldLabelPassword") + ":";
        lblRegisterPasswordCaption2.Text = Utils.LocalizationsManager.GetString("CommonFieldLabelRepeatPassword") + ":";
        lblRegisterEmailCaption.Text = Utils.LocalizationsManager.GetString("RegisterEmail") + ":";
        lblRegisterExtraInfoCaption.Text = Utils.LocalizationsManager.GetString("RegisterExtraInfo") + ":";
        lblRegisterCaptchaCaption.Text = Utils.LocalizationsManager.GetString("RegisterCaptcha") + ":";
        btnRegisterSubmit.Text = Utils.LocalizationsManager.GetString("RegisterSubmit");
        tblRegisterFields.Visible = true;
        tblRegisterStatus.Visible = false;
        tblRegisterStatus.Height = "auto";
        this.Session["CaptchaImageTextPrev"] = this.Session["CaptchaImageText"];
        this.Session["CaptchaImageText"] = GenerateRandomCode();
    }

    /// <summary>
    /// Render Logon form
    /// </summary>
    /// <param name="validateUserResult">result of validating user credentials</param>
    /// <remarks>
    /// If validateUserResult == null, do not display the status label.
    /// </remarks>
    private void RenderLoginForm(ValidateUserResult? validateUserResult, string defaultUserName)
    {
        lnkLogin.Visible = false;
        RenderLinksBlock();

        DisableAllForms();
        formContainer.Visible = true;
        formLogin.Visible = true;
        // Utils.AddCss("Styles" + Utils.BuildModeCss + ".css?v=" + Utils.AssemblyVersion, this.Page);
        if (!Page.IsPostBack)
        {
            List<string> langs = Utils.AvailableLocalizations;
            ddlLanguages.DataSource = langs;
            if (langs.Count > 0)
            {
                string lang = Utils.CurrentLanguage;
                if (!langs.Contains(lang, StringComparer.OrdinalIgnoreCase) &&
                    !langs.Contains((lang = Utils.UserSettings.UI.DefaultLanguage.Value), StringComparer.OrdinalIgnoreCase) &&
                    !langs.Contains((lang = "English"), StringComparer.OrdinalIgnoreCase))
                    lang = langs[0];
                ddlLanguages.SelectedValue = lang;
            }
            ddlLanguages.DataBind();
        }
        if (isMobileBrowser)
        {
            uiVersionLabel.Text = Utils.LocalizationsManager.GetString("LoginUISelect");
            ui_standardLabel.Text = Utils.LocalizationsManager.GetString("LoginUIStandard");
            ui_touchLabel.Text = Utils.LocalizationsManager.GetString("LoginUITouch");
        }
        lblLoginTitle.Text = Utils.LocalizationsManager.GetString("LoginTitle");
        lblUserNameCaption.Text = Utils.LocalizationsManager.GetString("CommonFieldLabelUserName") + ":";
        lblPasswordCaption.Text = Utils.LocalizationsManager.GetString("CommonFieldLabelPassword") + ":";
        cbRemember.Text = Utils.LocalizationsManager.GetString("LoginRemember");
        cbRemember.Visible = (HCSettings.Instance.Runtime.HCAuth != HCAuthenticationMode.FormsWithWindowsUsers);
        lblLanguageCaption.Text = Utils.LocalizationsManager.GetString("LoginLanguage");
        // disable the status label by default, it will be shown when there is a message to display
        lblStatus.Visible = false;
        if (validateUserResult != null)
            LoginErrorMessage((ValidateUserResult)validateUserResult);
        if (!string.IsNullOrEmpty(defaultUserName))
            txtUserName.Text = defaultUserName;
        btnLogin.Text = Utils.LocalizationsManager.GetString("LoginLogin");
    }

    private void SetPersonalConfiguration(string userName)
    {
        IUserIdentity userIdentity = AccountUtils.GetUserIdentity(userName);
        IUserIdentity adminUser = AccountUtils.GetUserIdentity("admin");
        IUserIdentity demoUser = AccountUtils.GetUserIdentity("demo");
        //// Set personal settings

        /* For Forms authentication version only */

        // Enable personal settings

        Utils.UsePersonalConfiguration = true;
        if (AccountUtils.Equals(userIdentity, adminUser)) // for user "admin"
        {
            Utils.UserSettings.UI.EnableDownloadsCounting.Value = false;
            Utils.UserSettings.UI.WelcomeWindowMessage.Value = "";
            Utils.UserSettings.UI.HideTree.Value = false;
        }
        else if (AccountUtils.Equals(userIdentity, demoUser)) // for user "demo"
        {
            Utils.UserSettings.UI.LogoHeaderHtml.Value = "";
            Utils.UserSettings.UI.EnableSendEmail.Value = SendEmailMode.Disable;
        }

        /* For Windows authentication version only */
        /*
        // Enable personal settings
        Utils.UsePersonalConfiguration = true;
        if (AccountUtils.Equals(userIdentity, AccountUtils.GetUserIdentity("john"))) // for windows user "john"
        {
            Utils.UserSettings.UI.LogoHeaderHtml.Value = "Hello!";
            Utils.UserSettings.UI.EnableSendEmail.Value = SendEmailMode.AttachmentsOnly;
        }
        else if (Utils.AccountsManager.GetUserGroupIdentities(AccountUtils.CurrentUserIdentity)
            .Contains(AccountUtils.GetGroupIdentity("Administrators"))) // for windows group "Administrators"
        {
            Utils.UserSettings.UI.HideTree.Value = true;
            Utils.UserSettings.UI.WelcomeWindowMessage.Value = "<h1>Hello!!!</h1>";
        }
        */

        //// Set personal assigned folders (if use SimpleFolderManager)
        // For use this feature:
        // 1) in Global.asax define users and/or groups and create 
        //    Utils.ConcreteSimpleAccountManager, Utils.ConcreteSimpleFolderManager (see example in Global.asax)
        // 2) you also can define in Global.asax some assigned folders, having set the permissions for the created users, groups
        // 3) here further you can set assigned folders under for specific users
        //    (don't forget to specify the permission).
        //    If identical folders (with an identical name and a path) for different users merge of their permission will be fulfilled are set

        // Get programatical folder manager
        if (Utils.ConcreteSimpleFolderManager == null)
            Utils.ConcreteSimpleFolderManager = new SimpleFolderManager();
        SimpleFolderManager folderManager = (Utils.ConcreteSimpleFolderManager as SimpleFolderManager);

        if (AccountUtils.Equals(userIdentity, adminUser)) // for user "admin"
        {
            // Create folders
            Folder  DemoFolder1 = new Folder("Demo folder 1", @"%APPROOT%\DemoFolder\Folder1"),
                    Folder2 = new Folder("Folder 2", @"%APPROOT%\DemoFolder\Folder2"),
                    UserFolder = new Folder("user", @"%APPROOT%\Demofolder\%USERNAME%");

            // Add of the additional information for a DemoFolder1
            DemoFolder1.Description = "";
            DemoFolder1.CustomField = "";

            // Create full permissions for some users and groups
            GroupPermissions AdminsPermission = new GroupPermissions(AccountUtils.GetGroupIdentity("admins"));
            UserPermissions AdminUserPermission = new UserPermissions(adminUser);

            //// Assign permissions to the folders:
            // DemoFolder1
            DemoFolder1.GroupPermissions.Add(AdminsPermission);
            // Folder2
            Folder2.GroupPermissions.Add(AdminsPermission);
            // UserFolder
            UserFolder.UserPermissions.Add(AdminUserPermission);

            // Add to folder manager
            folderManager.AddFolder(DemoFolder1);
            folderManager.AddFolder(Folder2);
            folderManager.AddFolder(UserFolder);

            // Example for delete folder
            //folderManager.DeleteFolder(Folder2);
            //if(folderManager.ExistsFolder("Demo folder 1")) folderManager.DeleteFolder("Demo folder 1");

            // Example for update folder
            UserFolder.Description = "This is example for update folder";
            // or
            folderManager.GetFolder("user", @"%APPROOT%\Demofolder\%USERNAME%").CustomField = "new custom value";
        }
        else if (AccountUtils.Equals(userIdentity, demoUser)) // for user "demo"
        {
            Folder DemoFolder = new Folder("Demo folder 1", @"%APPROOT%\DemoFolder\Folder1");
            DemoFolder.UserPermissions.Add(new UserPermissions(demoUser));
            folderManager.AddFolder(DemoFolder);
        }
    }

    private void RenderTwoFactorAuthBlock(string username = null)
    {
        if (!TwoFactorAuthManager.IsAuthPassed())
        {
            DisableAllForms();
            //render two factor auth screen
            formContainer.Visible = true;
            twofactor.Visible = true;
            //hide links block
            linksBlock.Visible = false;
            //set caption text and button text
            lblTwoFactorAuthCaption.Text = Utils.LocalizationsManager.GetString("LoginTwoFactorTitle");
            btnTwoFactorCancel.Text = Utils.LocalizationsManager.GetString("CommonButtonCaptionCancel");
            if(Utils.DetectMobileBrowser(this))
                twoFactorContents.Style["width"] = "100% !important";
            
            twoFactorContents.InnerHtml = TwoFactorAuthManager.GetAuthBlock(username, Request.RawUrl);
            Utils.AddCss("Styles" + Utils.BuildModeCss + ".css?v=" + Utils.AssemblyVersion, this.Page);
            Utils.AddMeta("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0", this.Page);
        }
    }
    
    private void RenderMainBody()
    {
        RenderMainBody(AccountUtils.CurrentHCUserIdentity);
        if(Utils.UserSettings.Runtime.AuthMode == AuthenticationMode.Windows && !String.IsNullOrEmpty(Request.QueryString["ReturnUrl"]))
        {
            string ReturnUrl = Request.QueryString["ReturnUrl"];
            Response.Redirect(ReturnUrl);
        }
    }

    private void RenderMainBody(IUserIdentity userIdentity)
    {
        // Set personal settings and/or assigned folders if use simple folders/accounts managers.
        //SetPersonalConfiguration(userIdentity.Name);
        htmlPage.Attributes["Class"] = "";
        if (this.Session != null)
            this.Session["DefaultQueryString"] = Request.Url.Query;

        linksBlock.Visible = false;
        DisableAllForms();

        bool isSenchaSupported = Utils.IsSenchaSupported(this.Page) && !Utils.isBBWithoutTouch(this.Page);
        bool loadSencha = (isMobileBrowser && ui_touch.Checked && isSenchaSupported) || (Request.QueryString["Mobile"] != null && Request.QueryString["Mobile"].IndexOf("sencha", 0, StringComparison.OrdinalIgnoreCase) >= 0);
        bool loadJqm = (isMobileBrowser && ui_touch.Checked && !isSenchaSupported) || (Request.QueryString["Mobile"] != null && Request.QueryString["Mobile"].IndexOf("jqm", 0, StringComparison.OrdinalIgnoreCase) >= 0);
        bool loadStandard = (!isMobileBrowser || (isMobileBrowser && !ui_touch.Checked) || (Request.QueryString["Mobile"] != null && Request.QueryString["Mobile"].IndexOf("standard", 0, StringComparison.OrdinalIgnoreCase) >= 0) || Request.QueryString["Standard"] != null)
            //Added condition to add priority of user choise in login form
            && (!Page.IsPostBack || (Page.IsPostBack && !ui_touch.Checked));

        //Show mobile view for Forms authenticstion if MobileBrowser and Touch screen is checked
        //or for Windows authentication if Mobile= at the URL exists
        if (!loadStandard)
        {
            pageBodyStyle = "mobile-ui-body";
            if (loadJqm)
            {
                jqmBody.Visible = true;
                Utils.AddCss("Images/resources_1.5/mobile/jquery/jquery.mobile" + Utils.BuildModeCss + ".css", this.Page);

                Utils.AddScript("Scripts/mobile/jquery/jquery.js", false, this.Page);
                Utils.AddScript(@" try{
                                  //Simple cap
                                    Ext = { ns: function(nspace) { } };
                                    HttpCommander = { Remote: {} };
                                 $.extend( $.mobile , {
                                      //extend gradeA qualifier to include IE7+
                                        gradeA: function(){
                                         //IE version check by James Padolsey, modified by jdalton - from http://gist.github.com/527683
                                           var ie = (function(){

                                                var undef,
                                                    v = 3,
                                                    div = document.createElement('div'),
                                                    all = div.getElementsByTagName('i');
                                                
                                                while (
                                                    div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
                                                    all[0]
                                                );
                                                
                                                return v > 4 ? v : undef;
                                                
                                            }());
                                        
                                         //must either support media queries or be IE7+
                                         alert(ie);
                                         return $.support.mediaquery || (ie && ie >= 7);
                                        }
                                      }); 
                                } catch(e){alert(e);}
                                try{
                                    $(document).bind(""mobileinit"", function() {
                                        $.mobile.ajaxEnabled = false;
                                        $.mobile.ajaxFormsEnabled = false;
                                        $.mobile.loadingMessage = """ + HttpCommander.Utils.LocalizationsManager.GetString("ProgressLoading")+@""";
                                        }); } catch(e){}", true, this.Page);
                Utils.AddScript("Scripts/mobile/jquery/jquery.mobile.js", false, this.Page);
                Utils.AddScript("Scripts/mobile/jquery/jquery.json.js", false, this.Page);

            }
            else if (loadSencha)
            {
                senchaTouch2Body.Visible = true;
                Utils.AddCss("Scripts/" + Utils.MobileFolder + "st2/resources/css/initialloading.css", this.Page);
            }

            Utils.AddMeta("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0", this.Page);
        }
        else
        {
            mainBody.Visible = true;
            Utils.AddExtCss(this.Page);
        }
        //For Sencha touch 2 interface this css is not required
        if (loadStandard)
            Utils.AddCss("Styles" + Utils.BuildModeCss + ".css?v=" + Utils.AssemblyVersion, this.Page);
        Utils.AddGoogleAnalytics(this.Page, userIdentity.Name);
    }

    private string GenerateRandomCode()
    {
        Random random = new Random();
        string s = string.Empty;
        for (int i = 0; i < 6; i++)
            s = String.Concat(s, random.Next(10).ToString());
        return s;
    }

    /// <summary>
    /// Render login error message into the status label.
    /// </summary>
    /// <param name="validateUserResult"></param>
    private void LoginErrorMessage(ValidateUserResult validateUserResult, IUserIdentity identity = null)
    {
        if (validateUserResult == ValidateUserResult.Blocked)
        {
            lblStatus.Text = string.Format(Utils.LocalizationsManager.GetString("LoginBlocked"), LoginAttempts.BlockTimeoutMinutes);
            lblStatus.Visible = true;
        }
        else if (validateUserResult == ValidateUserResult.Failure)
        {
            lblStatus.Text = Utils.LocalizationsManager.GetString("LoginFailure");
            lblStatus.Visible = true;
        }
        else if (validateUserResult == ValidateUserResult.NotActivated)
        {
            lblStatus.Text = Utils.LocalizationsManager.GetString("LoginNotActivated");
            if(identity != null)
            {
                var resendLink = "<a href='Activate.aspx?action=resend&username=" + identity.Name + "'>" + Utils.LocalizationsManager.GetString("LoginResendActivationLink") + "</a>";
                lblStatus.Text += "<br/>" + string.Format(Utils.LocalizationsManager.GetString("LoginResendActivation"), resendLink);
            }
            lblStatus.Visible = true;
        }
    }

    protected void ddlLanguages_SelectedIndexChanged(object sender, EventArgs e)
    {
        if (string.Compare(ddlLanguages.Text, Utils.CurrentLanguage, true) != 0)
        {
            Utils.LocalizationsManager = null;
            Utils.CurrentLanguage = ddlLanguages.Text;
            Utils.SetLanguageCookie(ddlLanguages.Text);
            Utils.AddCss("Styles" + Utils.BuildModeCss + ".css?v=" + Utils.AssemblyVersion, this.Page);
            RenderLoginForm(ValidateUserResult.Failure, null);
        }
    }
</script>
    <title><%= Utils.LocalizationsManager.GetString("CommonMainTitle")%></title><!-- If you got error "Could not load file or assembly 'System.Xml.Linq" at this line then 
you should install .NET Framework 4.x !-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta content="NOINDEX, NOFOLLOW" name="ROBOTS" />
    <meta http-equiv="x-ua-compatible" content="IE=edge" />
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
</head>
<body id="pageBody" class="<%= pageBodyStyle %>" onload="<%= Utils.GetSetTimeOutScript() %>">
<div style="display:none;" id="httpcommander_version"><%=Utils.AssemblyVersion %></div>
<div runat="server" id="checkCookieEnabledHolder">
<script type="text/javascript">try{if(navigator.cookieEnabled==false)window.location='Logout.aspx?NoCookies=';}catch(e){}</script>
</div>
    <div class="login-container" id="formContainer" runat="server" align="center">
        <div id="loginFormContent" class="login-form-content" runat="server">
            <noscript><font color="#CC0000"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommonNoScript")%></font><br/></noscript>
            <form id="formLogin" runat="server">
                <br /><%=Utils.WriteHCLogo()%>
                <table class="login-form-table">
                    <tr><td class="first-column"></td>
                        <td class="second-column"></td>
                        <td class="third-column"></td>
                    </tr>
                    <tr>
                        <td colspan="3" class="login-form-table-caption-cell">
                            <!-- find login-form-logo class in styles.css and set correct height and visibility attributes -->
                            <div class="login-form-logo"></div>
                            <asp:Label ID="lblLoginTitle" runat="server" class="login-form-table-caption" Text="HTTP Commander Login"></asp:Label>
                        </td>
                    </tr>
                    <tr>
                        <td align="right">
                            <asp:Label ID="lblUserNameCaption" runat="server" CssClass="login-form-label" Text="User name:"></asp:Label>
                        </td>
                        <td align="left">
                            <asp:TextBox ID="txtUserName" runat="server" CssClass="login-form-control" ></asp:TextBox>
                        </td>
                        <td align="left">
                        <asp:RequiredFieldValidator ID="rfvUserName" runat="server" ControlToValidate="txtUserName"
                                ErrorMessage="*"></asp:RequiredFieldValidator>
                        </td>
                    </tr>
                    <tr>
                        <td align="right">
                            <asp:Label ID="lblPasswordCaption" runat="server" CssClass="login-form-label" Text="Password:"></asp:Label>
                        </td>
                        <td  align="left">
                            <asp:TextBox ID="txtPassword" runat="server" CssClass="login-form-control" TextMode="Password"></asp:TextBox>
                        </td>
                         <td  align="left">
                            <asp:RequiredFieldValidator ID="rfvPassword" runat="server" ControlToValidate="txtPassword"
                                ErrorMessage="*"></asp:RequiredFieldValidator>
                        </td>
                    </tr>

                    <% //Do not render table row with interface selection for unsupported browsers
                       if (isMobileBrowser)
                       { %>
                    <tr>
                        <td align="right">
                            <asp:Label ID="uiVersionLabel" runat="server" Text="Interface:"></asp:Label>
                        </td>
                        <td align="left" colspan="2">
                            <asp:RadioButton ID="ui_standard" runat="server" GroupName="uiVersion" value="standard"/>
                              <asp:Label ID="ui_standardLabel" runat="server" Text="Standard"></asp:Label>
                            <asp:RadioButton ID="ui_touch" runat="server" GroupName="uiVersion" Checked="true" value="touch"/>
                            <asp:Label ID="ui_touchLabel" runat="server" Text="Touch"></asp:Label>
                        </td>
                    </tr>
                    <% } %>
                    <tr>
                        <td colspan="3" align="center">
                            <asp:CheckBox ID="cbRemember" runat="server" Text="Remember me next time" />
                        </td>
                    </tr>
                    <tr>
                        <td align="center" colspan="3">
                            <asp:Button ID="btnLogin" runat="server" Text="Login" CssClass="login-form-btn"
                                OnClick="btnLogin_Click"/>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" colspan="3">
                            <asp:Label ID="lblStatus" runat="server" class="login-form-table-error-text" Text="* Your login attempt was not successful."
                                Visible="False"></asp:Label>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" colspan="3">
                            <table class="login-form-language">
                                <tr>
                                    <td align="right">
                                        <asp:Label ID="lblLanguageCaption" runat="server" Text="Language:"></asp:Label>
                                    </td>
                                    <td width="20">
                                        <img src="<%=Utils.GetPathToIcon("language")%>" align="absmiddle" width="16" height="16" alt="" />
                                    </td>
                                    <td>
                                        <asp:DropDownList ID="ddlLanguages" runat="server" Width="100px" 
                                                    onselectedindexchanged="ddlLanguages_SelectedIndexChanged" 
                                                    AutoPostBack="True">
                                        </asp:DropDownList>
                                   </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </form>

            <form id="formRecoverPass" runat="server">
                <br /><%=Utils.WriteHCLogo()%>
                <table class="login-form-table">
                    <tr>
                        <td colspan="3" class="login-form-table-caption-cell">
                            <asp:Label ID="lblRecoverPassTitle" runat="server" class="login-form-table-caption" Text="Recover password"></asp:Label>
                        </td>
                    </tr>
                    <tr>
                        <td align="right">
                            <asp:Label ID="lblRecoverPassUserNameCaption" CssClass="login-form-label" runat="server" Text="User name:"></asp:Label>
                        </td>
                        <td align="left">
                            <asp:TextBox ID="txtRecoverPassUserName" CssClass="login-form-control" runat="server" ></asp:TextBox>
                        </td>
                        <td align="left">
                            <asp:RequiredFieldValidator ID="RequiredFieldValidator1" runat="server" ControlToValidate="txtRecoverPassUserName"
                                ErrorMessage="*"></asp:RequiredFieldValidator>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" colspan="3">
                        <asp:Button ID="btnEmailPass" runat="server" Text="Email password" CssClass="login-form-btn"
                                OnClick="btnEmailPass_Click" />
                        </td>
                    </tr>
                    <tr>
                        <td align="center" colspan="3">
                            <asp:Label ID="lblRecoverPassStatus" runat="server" class="login-form-table-error-text" Text="Invalid user name."
                                Visible="False"></asp:Label>
                        </td>
                    </tr>
                </table>
            </form>

            <form id="formRecoverName" runat="server">
                <br /><%=Utils.WriteHCLogo()%>
                <table class="login-form-table">
                    <tr>
                        <td colspan="3" class="login-form-table-caption-cell">
                            <asp:Label ID="lblRecoverNameTitle" runat="server" class="login-form-table-caption" Text="Recover name"></asp:Label>
                        </td>
                    </tr>
                    <tr>
                        <td align="right">
                            <asp:Label ID="lblRecoverNameEmailCaption" CssClass="login-form-label" runat="server" Text="Email:"></asp:Label>
                        </td>
                        <td align="left">
                            <asp:TextBox ID="txtRecoverNameEmail" CssClass="login-form-control" runat="server"></asp:TextBox>

                        </td>
                        <td align="left">
                            <asp:RequiredFieldValidator ID="RequiredFieldValidator9" runat="server" ControlToValidate="txtRecoverNameEmail"
                                ErrorMessage="*"></asp:RequiredFieldValidator>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" colspan="3">
                            <asp:Button ID="btnEmailName" runat="server" Text="Email name" CssClass="login-form-btn"
                                OnClick="btnEmailName_Click" />
                        </td>
                    </tr>
                    <tr>
                        <td align="center" colspan="3">
                            <asp:Label ID="lblRecoverNameStatus" runat="server" class="login-form-table-error-text" Text="Invalid email."
                                Visible="False"></asp:Label>
                        </td>
                    </tr>
                </table>
            </form>

            <form id="formChangeEmail" runat="server">
                <br /><%=Utils.WriteHCLogo()%>
                <table class="login-form-table">
                    <tr>
                        <td colspan="3" class="login-form-table-caption-cell">
                            <asp:Label ID="lblChangeEmailTitle" runat="server" Text="Change email"></asp:Label>
                        </td>
                    </tr>
                    <tr>
                        <td align="right">
                            <asp:Label ID="lblChangeEmailUserNameCaption" CssClass="login-form-label" runat="server" Text="User name:"></asp:Label>
                        </td>
                        <td align="left">
                            <asp:TextBox ID="txtChangeEmailUserName" CssClass="login-form-control" runat="server" ></asp:TextBox>
                        </td>
                        <td align="left">
                            <asp:RequiredFieldValidator ID="RequiredFieldValidator6" runat="server" ControlToValidate="txtChangeEmailUserName"
                                ErrorMessage="*"></asp:RequiredFieldValidator>
                        </td>
                    </tr>
                    <tr>
                        <td align="right">
                            <asp:Label ID="lblChangeEmailUserPasswordCaption" CssClass="login-form-label" runat="server" Text="User password:"></asp:Label>
                        </td>
                        <td align="left">
                            <asp:TextBox ID="txtChangeEmailUserPassword" CssClass="login-form-control" runat="server" TextMode="Password"></asp:TextBox>
                        </td>
                        <td align="left">
                            <asp:RequiredFieldValidator ID="RequiredFieldValidator7" runat="server" ControlToValidate="txtChangeEmailUserPassword"
                                ErrorMessage="*"></asp:RequiredFieldValidator>
                        </td>
                    </tr>
                    <tr>
                        <td align="right">
                            <asp:Label ID="lblChangeEmailEmailCaption" CssClass="login-form-label" runat="server" Text="Email:"></asp:Label>
                        </td>
                        <td align="left">
                            <asp:TextBox ID="txtChangeEmailEmail" CssClass="login-form-control" runat="server" ></asp:TextBox>
                        </td>
                        <td align="left">
                            <asp:RequiredFieldValidator ID="RequiredFieldValidator8" runat="server" ControlToValidate="txtChangeEmailEmail"
                                ErrorMessage="*"></asp:RequiredFieldValidator>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" colspan="3">
                        <asp:Button ID="btnChangeEmailSubmit" runat="server" Text="Change email" CssClass="login-form-btn"
                                OnClick="btnChangeEmailSubmit_Click" />
                        </td>
                    </tr>
                    <tr>
                        <td align="center" colspan="3">
                            <asp:Label ID="lblChangeEmailStatus" runat="server" class="login-form-table-error-text" Text="Invalid user name."
                                Visible="False"></asp:Label>
                        </td>
                    </tr>
                </table>
            </form>

            <form id="formRegister" runat="server">
                <br /><%=Utils.WriteHCLogo()%>
                <table class="login-form-table" runat="server" id="tblRegisterFields" visible="true">
                    <tr>
                        <td colspan="3" class="login-form-table-caption-cell">
                            <asp:Label ID="lblRegisterTitle" runat="server" Text="Register"></asp:Label>
                        </td>
                    </tr>
                    <tr>
                        <td align="right">
                            <asp:Label ID="lblRegisterUserNameCaption" CssClass="login-form-label" runat="server" Text="User name:"></asp:Label>
                        </td>
                        <td align="left">
                            <asp:TextBox ID="txtRegisterUserName" CssClass="login-form-control" runat="server"></asp:TextBox>
                        </td>
                        <td align="left">
                            <asp:RequiredFieldValidator ID="RequiredFieldValidator2" runat="server" ControlToValidate="txtRegisterUserName"
                                ErrorMessage="*"></asp:RequiredFieldValidator>
                        </td>
                    </tr>
                    <tr>
                        <td align="right">
                            <asp:Label ID="lblRegisterPasswordCaption" CssClass="login-form-label" runat="server" Text="Password:"></asp:Label>
                        </td>
                        <td align="left">
                            <asp:TextBox ID="txtRegisterPassword" CssClass="login-form-control" runat="server" TextMode="Password"></asp:TextBox>
                        </td>
                        <td align="left">
                            <asp:RequiredFieldValidator ID="RequiredFieldValidator3" runat="server" ControlToValidate="txtRegisterPassword"
                                ErrorMessage="*"></asp:RequiredFieldValidator>
                        </td>
                    </tr>
                    <tr>
                        <td align="right">
                            <asp:Label ID="lblRegisterPasswordCaption2" CssClass="login-form-label" runat="server" Text="Repeat password:"></asp:Label>
                        </td>
                        <td align="left">
                            <asp:TextBox ID="txtRegisterPassword2" CssClass="login-form-control" runat="server"  TextMode="Password"></asp:TextBox>
                        </td>
                        <td align="left">
                            <asp:RequiredFieldValidator ID="RequiredFieldValidator4" runat="server" ControlToValidate="txtRegisterPassword2"
                                ErrorMessage="*"></asp:RequiredFieldValidator>
                        </td>
                    </tr>
                    <tr>
                        <td align="right">
                            <asp:Label ID="lblRegisterEmailCaption" CssClass="login-form-label" runat="server" Text="Email:"></asp:Label>
                        </td>
                        <td align="left">
                            <asp:TextBox ID="txtRegisterEmail" CssClass="login-form-control" runat="server" ></asp:TextBox>
                        </td>
                        <td align="left">
                            <asp:RequiredFieldValidator  ID="RequiredFieldValidator5" runat="server" ControlToValidate="txtRegisterEmail"
                                ErrorMessage="*"></asp:RequiredFieldValidator>
                        </td>
                    </tr>
                    <tr>
                        <td align="right">
                            <asp:Label ID="lblRegisterExtraInfoCaption" CssClass="login-form-label" runat="server" Text="Extra info:"></asp:Label>
                        </td>
                        <td colspan="2" align="left">
                            <asp:TextBox ID="txtRegisterExtraInfo" CssClass="login-form-control" runat="server" TextMode="multiline"></asp:TextBox>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" colspan="3">
                            <asp:Label ID="lblRegisterCaptchaCaption" CssClass="login-form-label" runat="server" Text="Enter the text you see in the below image:"></asp:Label>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3" align="center">
                            <asp:TextBox ID="txtRegisterCaptcha" CssClass="login-form-control" runat="server" ></asp:TextBox>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" colspan="3">
                            <asp:Image ID="Image1" ImageUrl="~/Handlers/Captcha.aspx" AlternateText="Image Verification" runat="server"/>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" colspan="3">
                        <asp:Button ID="btnRegisterSubmit" runat="server" Text="Submit" CssClass="login-form-btn" OnClick="btnRegisterSubmit_Click" />
                        </td>
                    </tr>
                </table>
                <table  class="login-form-table" runat="server" id="tblRegisterStatus" visible="false">
                    <tr>
                        <td align="center" colspan="3">
                            <asp:Label ID="lblRegisterStatus" runat="server" class="login-form-table-error-text" Text="Error"></asp:Label>
                        </td>
                    </tr>
                </table>
            </form>

            <form id="twofactor" runat="server">
                <br /><%=Utils.WriteHCLogo()%>
                <table class="login-form-table">
                    <tr>
                        <td align="center" class="login-form-table-caption-cell">
                            <asp:Label ID="lblTwoFactorAuthCaption" runat="server" class="login-form-table-caption" Text="Second step"></asp:Label>
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <div id="twoFactorContents" class="two-factor-contents" runat="server">
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <asp:Button ID="btnTwoFactorCancel" runat="server" Text="Cancel" CssClass="login-form-btn"
                                OnClick="btnTwoFactorCancel_Click" />
                        </td>
                    </tr>
                </table>
                <!--This comment is required for correct work of 2-step authentication on IOS application.
                   Application search for special string in response to find path to handlers and if not found it decides that wrong page is loaded.
                   So we will simply include comment with that string as a workaround 
                   <script type="text/javascript" src="Handlers/Config.ashx"></script>
                -->
            </form>

            <div id="linksBlock" class="login-form-links-block" runat="server">
                <asp:HyperLink ID="lnkLogin" NavigateUrl="~/Default.aspx" runat="server">Login</asp:HyperLink>
                <% if (Utils.UserSettings.Main.EnablePasswordRecovery.Value && HCSettings.Instance.Runtime.HCAuth == HCAuthenticationMode.Forms) { %><asp:HyperLink ID="lnkRecoverPassword" NavigateUrl="~/Default.aspx?RecoverPassword=" runat="server">Forgot password?</asp:HyperLink><% } %>
                <% if (Utils.UserSettings.Main.EnableUserNameRecovery.Value && HCSettings.Instance.Runtime.HCAuth == HCAuthenticationMode.Forms) { %><asp:HyperLink ID="lnkRecoverUserName" NavigateUrl="~/Default.aspx?RecoverUserName=" runat="server">Forgot name?</asp:HyperLink><% } %>
                <% if (Utils.UserSettings.Main.EnableChangeEmail.Value && HCSettings.Instance.Runtime.HCAuth == HCAuthenticationMode.Forms) { %><asp:HyperLink ID="lnkChangeEmail" NavigateUrl="~/Default.aspx?ChangeEmail=" runat="server">Change Email</asp:HyperLink><% } %>
                <% if (Utils.UserSettings.Main.EnableAnonymRegister.Value && HCSettings.Instance.Runtime.HCAuth == HCAuthenticationMode.Forms) { %><asp:HyperLink ID="lnkRegister" NavigateUrl="~/Default.aspx?Register=" runat="server">Register</asp:HyperLink><% } %>
                <br />
                <br />
                <asp:HyperLink ID="lnkMobileVersion" NavigateUrl="~/Default.aspx?Mobile=" runat="server">Mobile version</asp:HyperLink>
            </div>
        </div>
    </div>

    <div id="mainBody" runat="server">
        <% if (Utils.NeedInsideInDiv)
           { %>
        <!-- Opening embedded tag DIV -->
        <div id="httpCommander" style="position:relative !important;width:800px;height:600px;left:50px;top:50px;">
        <% } %>
        <div id="<%=Utils.VarNameMainInstance %>_loading-mask" class="loading-mask">
            <div id="<%=Utils.VarNameMainInstance %>_loading" class="loading">
                <noscript>
                    <font color="#CC0000">
                        <%=Utils.LocalizationsManager.GetString("CommonNoScript") %>
                    </font><br />
                </noscript>
                <table id="<%=Utils.VarNameMainInstance %>_loading-message">
                    <tr>
                        <td nowrap="nowrap">
                            <img width="32" height="32" alt="" src="Images/loading.gif" />
                        </td>
                        <td nowrap="nowrap">
                            <%=Utils.LocalizationsManager.GetString("CommonApplicationLoading") %>...<%=Utils.GetReloginLoadMaskHref() %>
                        </td>
                    </tr>
                </table>
            </div>

<%=Utils.WriteLoadedImages() %>
<img alt="" src="Images/webdavtest.png" width="0" height="0" /> <!-- Non existing file. To test webDav module for Diagnostics -->
<script type="text/javascript" src="Scripts/ext-base<%=Utils.BuildModeJs%>.js"></script>
<script type="text/javascript" src="Scripts/ext-all<%=Utils.BuildModeJs%>.js"></script>
<script type="text/javascript" src="Scripts/ext-mod<%=Utils.BuildModeJs%>.js?v=<%=Utils.AssemblyVersion%>"></script>
<%=JavaScriptIncludes.Instance.IncludeExtJSLocale()%>
<script type="text/javascript" src="Handlers/TreeHandler.ashx"></script>
<script type="text/javascript" src="Handlers/GridHandler.ashx"></script>
<script type="text/javascript" src="Handlers/CommonHandler.ashx"></script>
<script type="text/javascript" src="Handlers/Config.ashx"></script>
<script type="text/javascript" src="Handlers/AdminHandler.ashx"></script>
<script type="text/javascript" src="Handlers/MetadataHandler.ashx"></script>
<script type="text/javascript" src="Handlers/GoogleDriveHandler.ashx"></script>
<script type="text/javascript" src="Handlers/UploadFromURLHandler.ashx"></script>
<script type="text/javascript" src="Handlers/DropboxHandler.ashx"></script>
<script type="text/javascript" src="Handlers/SkyDriveHandler.ashx"></script>
<script type="text/javascript" src="Handlers/OneDriveForBusinessHandler.ashx"></script>
<script type="text/javascript" src="Handlers/BoxHandler.ashx"></script>
<script type="text/javascript" src="Handlers/VideoHandler.ashx"></script>
<script type="text/javascript" src="Scripts/qrcode.js"></script>
<input type="password" value="password" id="fakepassword" name="fakepassword" style="display:none !important;" />
<%=ExternalCMSIntegration.WriteJsWithDemoAccountsForClouds()%>
<%=JavaScriptIncludes.Instance.IncludeMainJsScript(Utils.DebugModeJs)%>

<%=Utils.GetInitScript() %>
        </div>
        <% if (Utils.NeedInsideInDiv)
           { %>
        <!-- Closing embedded tag DIV -->
        </div>
        <% } %>
    </div>

    <div id="senchaTouch2Body" runat="server">
        <div id="appLoadingIndicator">
            <div></div>
            <div></div>
            <div></div>
            <br />
             <%=Utils.LocalizationsManager.GetString("CommonApplicationLoading")%>...
        </div>
        <script type="text/javascript">
            var mobileScriptsPath = 'Scripts/<%=Utils.MobileFolder%>st2/';
            var debugMode = <%=(Utils.DebugModeJs ? "true" : "false")%>;
        </script>

        <script type="text/javascript" src="Handlers/Config.ashx"></script>
        <script type="text/javascript" src="<%=JavaScriptIncludes.Instance.IncludeST2Script(Utils.DebugModeJs)%>"></script>
        <!--<%=Utils.GetInitMobileScript(Request.QueryString["path"])%> -->
    </div>

    <div id="jqmBody" runat="server">
        <!--<div id="middleTouch">
        <div id="loadingTouch">
            <noscript><font color="#CC0000"><%= HttpCommander.Utils.LocalizationsManager.GetString("CommonNoScript")%></font><br/></noscript>
            <table id="loadingTouch-message">
                <tr>
                    <td nowrap="nowrap">
                        <img width="32" height="32" alt="" src="Images/loading.gif" />
                    </td>
                    <td nowrap="nowrap">
                        <%= HttpCommander.Utils.LocalizationsManager.GetString("CommonApplicationLoading") %>...
                    </td>
                </tr>
            </table>
        </div>
        </div>-->
        <div id="<%=Utils.VarNameMainInstance %>_loading-mask" class="loading-mask">
            <div id="<%=Utils.VarNameMainInstance %>_loading" class="loading">
                <noscript>
                    <font color="#CC0000">
                        <%=Utils.LocalizationsManager.GetString("CommonNoScript")%>
                    </font><br />
                </noscript>
                <table id="<%=Utils.VarNameMainInstance %>_loading-message">
                    <tr>
                        <td nowrap="nowrap">
                            <img width="32" height="32" alt="" src="Images/loading.gif" />
                        </td>
                        <td nowrap="nowrap">
                            <%=Utils.LocalizationsManager.GetString("CommonApplicationLoading")%>...<%=Utils.GetReloginLoadMaskHref() %>
                        </td>
                    </tr>
                </table>
            </div>   
        <style type="text/css">
            .ui-icon-google-view { background: url("<%=Utils.VirtualClientPath%>Images/resources_1.5/mobile/jquery/images/googledoc.png") no-repeat rgba(0, 0, 0, 0.4) !important;
            }
            .ui-icon-zoho-view {
                background: url("<%=Utils.VirtualClientPath%>Images/resources_1.5/mobile/jquery/images/zoho.png") no-repeat rgba(0, 0, 0, 0.4) !important;
            }
        </style>

        <script type="text/javascript" src="Handlers/GridHandler.ashx"></script>
        <script type="text/javascript" src="Handlers/CommonHandler.ashx"></script>
        <script type="text/javascript" src="Handlers/MetadataHandler.ashx"></script>
        <script type="text/javascript" src="Handlers/UploadFromURLHandler.ashx"></script>
        <script type="text/javascript" src="Handlers/Config.ashx"></script>
        <script type="text/javascript" src="Scripts/mobile/main_jqm<%=Utils.BuildModeJs%>.js"></script>
        <%=Utils.GetInitMobileScript(Request.QueryString["path"])%>
        </div>
        <div data-role="page" id="jqm-main-list">
            <div data-role="header" id="jqm-main-header" data-backbtn="false">
                <a href="#jqm-main-list" data-direction="reverse" data-icon="back" id="jqm-main-header-btnBack" visible="false"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommandBack")%></a>
                <h1 id="jqm-main-header-caption"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommonMainTitle")%></h1>
                <a id="jqm-main-header-btnSettings" href="#jqm-optionsMenu" data-rel="dialog" data-transition="pop" data-icon="gear" class="ui-btn-right" data-theme="a" ><%=HttpCommander.Utils.LocalizationsManager.GetString("CommonActions")%></a>
            </div><!-- /header -->

            <div data-role="content" id="jqm-main-content">	
                <ul data-role="listview"  id="jqm-main-filesList">

                </ul>
            </div><!-- /content -->
            
            <div data-role="footer" id="jqm-main-footer" >
                <!--<a id="jqm-main-footer-btnSettings" href="#jqm-optionsMenu"  data-rel="dialog" data-transition="pop" data-icon="gear" data-theme="a" ><%= HttpCommander.Utils.LocalizationsManager.GetString("CommandSettings")%></a>-->
                <a id="jqm-main-footer-btnUpload" href="#jqm-upload" data-icon="arrow-u" data-theme="a" style="float:right; margin-right: 1px; "><%=HttpCommander.Utils.LocalizationsManager.GetString("CommandUpload")%></a>
            </div><!-- /header -->
        </div>

        <!-- Settings popup page-->
        <div data-role="page" id="jqm-optionsMenu">
            <div data-role="header" id="jqm-optionsMenu-header" data-backbtn="false">
                <a href="#jqm-main-list" data-direction="reverse" data-icon="back" id="jqm-optionsMenu-header-btnBack"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommandBack")%></a>
                <h1><%=HttpCommander.Utils.LocalizationsManager.GetString("CommonActions")%></h1>
            </div>
            <div data-role="content" id="jqm-optionsMenu-content">	
                <a href="Default.aspx" id="jqm-settings-home" data-role="button"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommandHome")%></a>
                <a href="Default.aspx?Mobile=standard" id="jqm-settings-ui" data-role="button"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommandStandardView")%></a>
                <a href="<%=Utils.GetRelativeLocalizedMobileHelpUrl()%>" id="jqm-mobile-help" target="_blank" data-role="button"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommandHelp")%></a>
                <a id="jqm-settings-logout" data-role="button"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommandLogout")%></a>
            </div>
        </div>

        <!-- Upload popup page-->
        <div data-role="page" id="jqm-uploadMenu">
            <div data-role="header" id="jqm-uploadHeader" data-backbtn="false">
                <a href="#jqm-main-list" data-direction="reverse" data-icon="back" id="jqm-uploadHeader-btnBack"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommandBack")%></a>
                <h1><%=HttpCommander.Utils.LocalizationsManager.GetString("CommandUpload")%></h1>
            </div>
            <div data-role="content" id="jqm-uploadMenu-content">	
                <a id="jqm-uploadMenu-uploadFromUrl" href="#jqm-uploadFromUrl" data-role="button"><%=HttpCommander.Utils.LocalizationsManager.GetString("UploadFromUrlTab")%></a>
                <a id="jqm-uploadMenu-upload" href="#jqm-upload"  data-role="button"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommandUpload")%></a>
            </div>
        </div>

        <!-- UploadFromUrl page -->
        <div data-role="page" id="jqm-uploadFromUrl">
            <div data-role="header" id="jqm-uploadFromUrl-header" data-backbtn="false">
                <a href="#jqm-main-list" data-direction="reverse" data-icon="back" id="jqm-uploadFromUrl-header-btnBack"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommandBack")%></a>
                <h1 id="H1">&nbsp;</h1>
            </div><!-- /header -->

            <div data-role="content" id="jqm-uploadFromUrl-form">	
                <div data-role="fieldcontain" id="jqm-uploadFromUrl-fieldContainer">
                    <label for="jqm-uploadFromUrl-content-field">
                    <%=string.Format(HttpCommander.Utils.LocalizationsManager.GetString("UploadFromUrlLabelText"), "<span><img align='absmiddle' width='16' height='16' src='Images/dropbox.png'>&nbsp;<b>Dropbox</b></span>", "&nbsp;<img align='absmiddle' width='16' height='16' src='Images/picasa.png'>&nbsp;<b>Picasa</b>", "&nbsp;<img align='absmiddle' width='16' height='16' src='Images/flickr.png'>&nbsp;<b>Flickr</b>", "&nbsp;<img align='absmiddle' width='16' height='16' src='Images/photobucket.png'>&nbsp;<b>PhotoBucket</b>", "&nbsp;<img align='absmiddle' width='16' height='16' src='Images/facebook.png'>&nbsp;<b>Facebook</b>") + "<br />" + HttpCommander.Utils.LocalizationsManager.GetString("UploadFromUrlFieldLabel")%>
                    </label>
                    <textarea cols="40" rows="8" name="jqm-uploadFromUrl-content-field" id="jqm-uploadFromUrl-content-field"></textarea>

                    <label for="jqm-uploadFromUrl-content-file-name"><%=HttpCommander.Utils.LocalizationsManager.GetString("UploadFromUrlFileName")%></label>
                    <input type="text" name="jqm-uploadFromUrl-content-file-name" id="jqm-uploadFromUrl-content-file-name" value=""  />

                    <label for="jqm-uploadFromUrl-content-file-status"><%=HttpCommander.Utils.LocalizationsManager.GetString("UploadMobileResult")%></label>
                    <input type="text" name="jqm-uploadFromUrl-content-file-status" id="jqm-uploadFromUrl-content-file-status" value="" />

                    <input name="jqm-uploadFromUrl-content-submit-btn" id="jqm-uploadFromUrl-content-submit-btn" type="button" value="<%=HttpCommander.Utils.LocalizationsManager.GetString("UploadSimpleUpload")%>"/>

                </div>
            </div><!-- /content -->
        </div> 

        <!-- FileInfo page -->
        <div data-role="page" id="jqm-fileInfo">
            <div data-role="header" id="jqm-fileInfo-header" data-backbtn="false">
                <a href="#jqm-main-list" data-direction="reverse" data-icon="back" id="jqm-fileInfo-header-btnBack"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommandBack")%></a>
                <h1 id="jqm-fileInfo-header-caption"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommandDetails")%></h1>
            </div><!-- /header -->

            <div data-role="content" id="jqm-fileInfo-content">	
                <div data-role="collapsible" id="jqm-fileInfo-details">
                    <h3><%=HttpCommander.Utils.LocalizationsManager.GetString("CommandDetails")%></h3>
                    <div data-role="fieldcontain">
                        <label for="jqm-fileInfo-content-fileName"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommonFieldLabelName")%></label>
                        <textarea cols="40" rows="8" name="jqm-fileInfo-content-fileName" id="jqm-fileInfo-content-fileName"></textarea>

                        <label for="jqm-fileInfo-content-fileType"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommonFieldLabelType")%></label>
                        <input type="text" name="jqm-fileInfo-content-fileType" id="jqm-fileInfo-content-fileType" value=""  />

                        <label for="jqm-fileInfo-content-fileSize"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommonFieldLabelSize")%></label>
                        <input type="text" name="jqm-fileInfo-content-fileSize" id="jqm-fileInfo-content-fileSize" value=""  />

                        <label for="jqm-fileInfo-content-fileCreationDate"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommonFieldLabelDateCreated")%></label>
                        <input type="text" name="jqm-fileInfo-content-fileCreationDate" id="jqm-fileInfo-content-fileCreationDate" value=""  />

                        <label for="jqm-fileInfo-content-fileModificationDate"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommonFieldLabelDateModified")%></label>
                        <input type="text" name="jqm-fileInfo-content-fileModificationDate" id="jqm-fileInfo-content-fileModificationDate" value="" />

                        <label for="jqm-fileInfo-content-fileAccessedDate"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommonFieldLabelDateAccessed")%></label>
                        <input type="text" name="jqm-fileInfo-content-fileAccessedDate" id="jqm-fileInfo-content-fileAccessedDate" value=""  />

                    </div>
               </div>
                <div data-role="collapsible" data-collapsed="true" id="jqm-fileInfo-modifications">
                    <h3><%=HttpCommander.Utils.LocalizationsManager.GetString("FileModificationsHistory")%></h3>
                    <ul data-role="listview"  id="jqm-fileInfo-modifications-list">

                    </ul>
                </div>
                <div data-role="collapsible" data-collapsed="true" id="jqm-fileInfo-metadata">
                    <h3><%=HttpCommander.Utils.LocalizationsManager.GetString("FileMetaDataCaptionMobile")%></h3>
                    <ul data-role="listview" id="jqm-fileInfo-metadata-list">

                    </ul>
                </div>
            </div><!-- /content -->

            <div data-role="footer" id="jqm-fileInfo-footer" >
                <a href="#jqm-main-list" data-icon="arrow-d" data-role="button" id="jqm-fileInfo-footer-btnDownload"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommandDownload")%></a>
                <a href="#jqm-main-list" data-icon="arrow-d" data-role="button" id="jqm-fileInfo-footer-btnView"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommandView")%></a>
                <div data-role="controlgroup" id="jqm-fileInfo-footer-viewControl"  data-type="horizontal" >
                    <a href="#jqm-main-list" rel="external" data-icon="google-view" data-role="button" id="jqm-fileInfo-footer-btn-google-view"><%=HttpCommander.Utils.LocalizationsManager.GetString("CommandViewWithGoogleDoc")%></a>
                </div>
            </div><!-- /header -->
        </div>
    </div>
</body>
</html>
