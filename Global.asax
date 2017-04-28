<%@ Application Language="C#" %>
<%@ Import Namespace="HttpCommander" %>
<%@ Import Namespace="System.Collections.Generic" %>
<%@ Import Namespace="System.IO" %>
<script RunAt="server">

    protected void Application_Start(object sender, EventArgs e)
    {
        Utils.SetDemoExpired();
        HttpCommander.Application.OnApplicationStart();

        // Try to stop directories monitoring
        //Utils.StopDirectoryMonitor();

        // Set global settings
        /*
        HCSettings.Instance.UI.LogoHeaderHtml.Value = "";
        HCSettings.Instance.UI.WelcomeWindowMessage.Value = "<b>Hello!</b>";
        */

        //---------------------------------------------------------------------------------------
        // Example of users and folders setup programmatically.
        // This is helpfull if you have own database of users or you need programmatically setup access.
        //---------------------------------------------------------------------------------------

        /* For Forms authentication version only. Start */

        // Add 2 users:
        // 1. Name: demo, password: demo,
        // 2. Name: admin, password: admin
        /*
        List<User> userList = new List<User>();
        userList.Add(new User(AccountUtils.GetUserIdentity("demo"), "demo"));
        userList.Add(new User(AccountUtils.GetUserIdentity("admin"), "admin"));

        // Add group "admins" with user "admin"
        List<HttpCommander.Group> groupList = new List<HttpCommander.Group>();
        groupList.Add(new HttpCommander.Group(AccountUtils.GetGroupIdentity("admins")));
        groupList[0].AddMember(AccountUtils.GetUserIdentity("admin"));
        
        // Create some folders
        Folder DemoFolder1 = new Folder("Demo folder 1", @"%APPROOT%\DemoFolder\Folder1"),
               Folder2 = new Folder("Folder 2", @"%APPROOT%\DemoFolder\Folder2"),
               UserFolder = new Folder("user", @"%APPROOT%\Demofolder\%USERNAME%");

        // Add of the additional information for a DemoFolder1
        DemoFolder1.Description = "";
        DemoFolder1.CustomField = "";
        
        // Create full permissions for some users and groups
        UserPermissions DemoUserPermission = new UserPermissions(AccountUtils.GetUserIdentity("demo"));
        GroupPermissions AdminsPermission = new GroupPermissions(AccountUtils.GetGroupIdentity("admins"));
        UserPermissions AdminUserPermission = new UserPermissions(AccountUtils.GetUserIdentity("admin"));

        // Create special permissions for Folder2 for demo user
        UserPermissions DemoUserPermissionFolder2 = new UserPermissions(AccountUtils.GetUserIdentity("demo"));
        DemoUserPermissionFolder2.Create = true;
        DemoUserPermissionFolder2.Delete = true;
        DemoUserPermissionFolder2.Rename = true;
        DemoUserPermissionFolder2.Upload = true;
        DemoUserPermissionFolder2.Download = true;
        DemoUserPermissionFolder2.ZipDownload = true;
        DemoUserPermissionFolder2.Zip = true;
        DemoUserPermissionFolder2.Unzip = true;
        DemoUserPermissionFolder2.Cut = true;
        DemoUserPermissionFolder2.Copy = true;
        DemoUserPermissionFolder2.Modify = true;
        DemoUserPermissionFolder2.ListFiles = true;
        DemoUserPermissionFolder2.ListFolders = true;
        FileTypeRestriction Deny_EXE_BAT_ASPX_PHP = new FileTypeRestriction(RestrictionType.Deny, new string[] { "EXE", "BAT", "ASPX", "PHP" });
        DemoUserPermissionFolder2.ListRestriction = Deny_EXE_BAT_ASPX_PHP;
        DemoUserPermissionFolder2.CreateRestriction = Deny_EXE_BAT_ASPX_PHP;
        DemoUserPermissionFolder2.customField = "";

        //// Assign permissions to the folders:
        // DemoFolder1
        DemoFolder1.UserPermissions.Add(DemoUserPermission);
        DemoFolder1.GroupPermissions.Add(AdminsPermission);
        // Folder2
        Folder2.UserPermissions.Add(DemoUserPermissionFolder2);
        Folder2.GroupPermissions.Add(AdminsPermission);
        // UserFolder
        UserFolder.UserPermissions.Add(AdminUserPermission);

        // Add created folders to the list
        List<Folder> folderList = new List<Folder>();
        folderList.Add(DemoFolder1);
        folderList.Add(Folder2);
        folderList.Add(UserFolder);

        // Set SimpleAccountManager and SimpleFolderManager as work classes
        Utils.ConcreteSimpleAccountManager = new SimpleAccountManager(userList, groupList);
        Utils.ConcreteSimpleFolderManager = new SimpleFolderManager(folderList);
        */

        /* For Windows authentication version only. Start */
        /*
        // Create some folders
        Folder DemoFolder1 = new Folder("Demo folder 1", @"%APPROOT%\DemoFolder\Folder1"),
               Folder2 = new Folder("Folder 2", @"%APPROOT%\DemoFolder\Folder2"),
               HomeDrive = new Folder("Home drive", "%HOME%"),
               AdminTestFolder = new Folder("Admin test folder", @"%APPROOT%\DemoFolder\%USERNAME%"),
               DomainUsersDemoFolder = new Folder("Domain users demo folder", @"%APPROOT%\DemoFolder\%GROUPNAME%");

        // Add of the additional information for a DemoFolder1
        DemoFolder1.Description = "";
        DemoFolder1.CustomField = "";
        
        // Create full permissions for some users and groups
        UserPermissions AdministratorUserPermission = new UserPermissions(AccountUtils.GetUserIdentity("Administrator"));
        GroupPermissions AdministratorsPermission = new GroupPermissions(AccountUtils.GetGroupIdentity("Administrators"));
        GroupPermissions DomainUsersPermission = new GroupPermissions(AccountUtils.GetGroupIdentity("Domain Users"));
        GroupPermissions DomainAdminsPermission = new GroupPermissions(AccountUtils.GetGroupIdentity("Domain Admins"));
        GroupPermissions UsersPermissions = new GroupPermissions(AccountUtils.GetGroupIdentity("Users"));
        
        //// Create special permissions for Folder2:
        // for DomainUsers
        GroupPermissions DomainUsersPermissionFolder2 = new GroupPermissions(AccountUtils.GetGroupIdentity("Domain Users"));
        DomainUsersPermissionFolder2.Create = true;
        DomainUsersPermissionFolder2.Delete = true;
        DomainUsersPermissionFolder2.Rename = true;
        DomainUsersPermissionFolder2.Upload = true;
        DomainUsersPermissionFolder2.Download = true;
        DomainUsersPermissionFolder2.ZipDownload = true;
        DomainUsersPermissionFolder2.Zip = true;
        DomainUsersPermissionFolder2.Unzip = true;
        DomainUsersPermissionFolder2.Cut = true;
        DomainUsersPermissionFolder2.Copy = true;
        DomainUsersPermissionFolder2.Modify = true;
        DomainUsersPermissionFolder2.ListFiles = true;
        DomainUsersPermissionFolder2.ListFolders = true;
        FileTypeRestriction Deny_EXE_BAT_ASPX = new FileTypeRestriction(RestrictionType.Deny, new string[] { "EXE", "BAT", "ASPX" });
        DomainUsersPermissionFolder2.ListRestriction = Deny_EXE_BAT_ASPX;
        DomainUsersPermissionFolder2.CreateRestriction = Deny_EXE_BAT_ASPX;
        DomainUsersPermissionFolder2.customField = "";
        // for Users
        GroupPermissions UsersPermissionFolder2 = new GroupPermissions(AccountUtils.GetGroupIdentity("Users"));
        UsersPermissionFolder2.ListRestriction = UsersPermissionFolder2.CreateRestriction = Deny_EXE_BAT_ASPX;

        //// Assign permissions to the folders:
        // DemoFolder1
        DemoFolder1.UserPermissions.Add(AdministratorUserPermission);
        DemoFolder1.GroupPermissions.Add(DomainUsersPermission);
        DemoFolder1.GroupPermissions.Add(DomainAdminsPermission);
        DemoFolder1.GroupPermissions.Add(UsersPermissions);
        DemoFolder1.GroupPermissions.Add(AdministratorsPermission);
        // Folder2
        Folder2.UserPermissions.Add(AdministratorUserPermission);
        Folder2.GroupPermissions.Add(DomainUsersPermissionFolder2);
        Folder2.GroupPermissions.Add(DomainAdminsPermission);
        Folder2.GroupPermissions.Add(UsersPermissionFolder2);
        Folder2.GroupPermissions.Add(AdministratorsPermission);
        // HomeDrive
        HomeDrive.UserPermissions.Add(AdministratorUserPermission);
        HomeDrive.GroupPermissions.Add(DomainUsersPermission);
        // AdminTestFolder
        AdminTestFolder.UserPermissions.Add(AdministratorUserPermission);
        // DomainUsersDemoFolder
        DomainUsersDemoFolder.GroupPermissions.Add(DomainUsersPermission);

        // Add created folders to the list
        List<Folder> folderList = new List<Folder>();
        folderList.Add(DemoFolder1);
        folderList.Add(Folder2);
        folderList.Add(HomeDrive);
        folderList.Add(AdminTestFolder);
        folderList.Add(DomainUsersDemoFolder);

        // Set SimpleAccountManager and SimpleFolderManager as work classes
        Utils.ConcreteSimpleAccountManager = new SimpleAccountManager();
        Utils.ConcreteSimpleFolderManager = new SimpleFolderManager(folderList);
        */
    }

    protected void Session_Start(object sender, EventArgs e)
    {
        //---------------------------------------------------------
        // Store something is the session state store.
        // If the store is empty, we get Session_Start event on each request.
        //---------------------------------------------------------

        Session["keep-session"] = true;

        //---------------------------------------------------------
        // Ensure SessionID in order to prevent the folloing exception
        // when the Application Pool Recycles
        // [HttpException]: Session state has created a session id,
        // but cannot save it because the response was already flushed by the application.
        //---------------------------------------------------------

        string sessionId = Session.SessionID;
    }

    protected void Application_BeginRequest(object sender, EventArgs e)
    {
        if (!HttpCommander.Application.OnBeginRequest())
            return;

        //---------------------------------------------------------
        // Redirect to new location if used localhost.
        //---------------------------------------------------------
        /*
        if (string.Compare("localhost", Request.Url.Host, true) == 0)
        {
            // Create uri builder for set new host name
            UriBuilder uriBuilder = new UriBuilder(Request.Url);
            uriBuilder.Host = "www.yoursite.com";

            // Use 301 HTTP status code
            Response.StatusCode = 301;
            Response.Status = "301 Moved Permanently";
            Response.AppendHeader("Location", uriBuilder.Uri.AbsoluteUri);
            Response.End();

            // Use 302 HTTP staus code
            //Response.Redirect(uriBuilder.Uri.AbsoluteUri);

            return;
        }
        */

        //---------------------------------------------------------
        // Restoring ASP.NET authentication and session cookies.
        // It is necessary only for correct work of Flash uploader.
        //---------------------------------------------------------

        if (HttpContext.Current.Request.RawUrl.IndexOf("FlashUpload.ashx", StringComparison.OrdinalIgnoreCase) != -1)
        {
            Utils.CheckFlashCookie();
            return;
        }

        if (HttpContext.Current.Request.RawUrl.IndexOf("Download.ashx", StringComparison.OrdinalIgnoreCase) != -1
            && !String.IsNullOrEmpty(HttpContext.Current.Request.QueryString["checkCookie"])
            && !String.IsNullOrEmpty(HttpContext.Current.Request.UserAgent)
            && HttpContext.Current.Request.UserAgent.IndexOf("Android", StringComparison.OrdinalIgnoreCase) >=0)
        {
            Utils.CheckAndroidCookie();
            return;
        }

        //--------------------------------------------------------------------------------------------
        // Detection whether current request size exceeds admissible request size for the application. 
        // It is necessary only for correct handle of this situation in the standard uploader.
        //--------------------------------------------------------------------------------------------

        if (HttpContext.Current.Request.RawUrl.IndexOf("Upload.ashx", StringComparison.OrdinalIgnoreCase) != -1)
        {
            Utils.CheckRequestSize();
        }

        AndroidBasicAuth.OnAuthenticateRequest(this);
    }

    protected void Application_EndRequest(Object sender, EventArgs e)
    {
        //-----------------------------------------------------------------------------
        // Removal of HttpOnly attribute of ASP.NET authentication and session cookies. 
        // It is necessary only for correct work of Flash and Java uploaders.
        //-----------------------------------------------------------------------------

        HttpCommander.Application.OnRequestEnd(Response);
    }

    protected void Application_AuthenticateRequest(object sender, EventArgs e)
    {
        HttpCommander.Application.OnRequestAuth(Context);
    }

    protected void Application_AuthorizeRequest(object sender, EventArgs e)
    {
        AndroidBasicAuth.OnPostAuthorizeUser(this);
    }

    protected void Application_PreRequestHandlerExecute(object sender, EventArgs e)
    {
        AnonymousDownload.OnPreRequestHandlerExecute(Context);
    }

    protected void Application_Error(object sender, EventArgs e)
    {
        //----------------------------------------------------------
        // Logging of all unhandled for any reason aplication errors
        //----------------------------------------------------------

        Exception objErr = Server.GetLastError();
        if (objErr == null)
            return;
        ErrorLog.Add(objErr);
        try
        {
            bool isKnownError = false;
            string solutionLink = "";
            Type type = objErr.GetType();
            if (type == typeof(System.Security.SecurityException))
            {
                isKnownError = true;
                solutionLink = HttpUtility.HtmlEncode(Utils.AppRootUrl + "Manual/faq.html#unblock");
            }
            string url = "";
            try { url = Request.Url.ToString(); }
            catch { }
            string typeStr = HttpUtility.HtmlEncode(type.ToString());
            string err = "<h1 style='font-family:\"Verdana\";font-weight:normal;font-size:18pt;color:red'>Error occured in application<hr width=100% size=1 color=silver></h1> "
                + "<h2 style='font-family:\"Verdana\";font-weight:normal;font-size:14pt;color:maroon;font-style:italic;' >"
                + typeStr + ": " + HttpUtility.HtmlEncode(objErr.Message ?? "") + "<br/>"
                + (isKnownError ? ("<b>This problem is known! See resolving: </b><a href='" + solutionLink + "'>" + solutionLink + "</a>") : "Contact with Element-IT for resolving.") + "</h2>";
            err += "<b>Error in: </b>" + HttpUtility.HtmlEncode(url);
            err += "<br/><b>Source Message: </b>" + HttpUtility.HtmlEncode(objErr.Source ?? "");
            err += "<br/><b>Stack Trace: </b>" + HttpUtility.HtmlEncode(objErr.StackTrace ?? "").Replace(Environment.NewLine, "<br/>").Replace("\n", "<br/>");
            err += "<h2 style='font-family:\"Verdana\";font-weight:normal;font-size:14pt;color:maroon;font-style:italic;'>Click here to get immediate help and send this error to Element-IT support team <a href=\"mailto:support@element-it.com?subject="
                + HttpUtility.UrlEncode(typeStr) + "&body=Put whole error description with Stack Trace here!\">via email</a>.</h2>";
            err += "Element-IT is software developing company. If you are not Administrator of this site then contact with administrator first!";
            // To disable this custom error handler comment lines below
            if (isKnownError)
            {
                Response.StatusCode = 500;
                Response.Write(err);
                Server.ClearError();
            }
        }
        catch
        { }
    }

    protected void Session_End(object sender, EventArgs e)
    {
        HttpCommander.Application.OnSessionEnd(Session);
    }

    protected void Application_End(object sender, EventArgs e)
    {

    }

</script>
