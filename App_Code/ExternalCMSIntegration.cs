using HttpCommander;
using Newtonsoft.Json;
using System.IO;
using System.Net;
using System.Web;

public static class ExternalCMSIntegration
{
    public const string DrupalURL = "http://win2003-mws/drupal/account-check.php";
    public const string JoomlaURL = "http://win2003-mws/joomla/account-check.php";
    public const string WordPressURL = "http://win2003-mws/wordpress/account-check.php";

    public static bool ValidateUserPasswordDrupal(string name, string password)
    {
        return ValidateUserPasswordHashDrupal(name, password.AsHash());
    }
    public static bool ValidateUserPasswordHashDrupal(string name, string passwordHash)
    {
        string sURL = DrupalURL + "?"
            + "username=" + HttpUtility.UrlEncode(name)
            + "&passwordhash=" + HttpUtility.UrlEncode(passwordHash);

        WebRequest request = WebRequest.Create(sURL);
        Stream dataStream = request.GetResponse().GetResponseStream();
        StreamReader reader = new StreamReader(dataStream);
        string responseFromServer = reader.ReadToEnd();
        return responseFromServer == "yes";
    }
    public static bool ValidateUserPasswordJoomla(string name, string password)
    {
        string sURL = JoomlaURL + "?"
            + "username=" + HttpUtility.UrlEncode(name)
            + "&password=" + HttpUtility.UrlEncode(password);

        WebRequest request = WebRequest.Create(sURL);
        Stream dataStream = request.GetResponse().GetResponseStream();
        StreamReader reader = new StreamReader(dataStream);
        string responseFromServer = reader.ReadToEnd();
        return responseFromServer == "yes";
    }
    public static bool ValidateUserPasswordHashJoomla(string name, string passwordHash)
    {
        string sURL = JoomlaURL + "?"
            + "username=" + HttpUtility.UrlEncode(name)
            + "&passwordhash=" + HttpUtility.UrlEncode(passwordHash);

        WebRequest request = WebRequest.Create(sURL);
        Stream dataStream = request.GetResponse().GetResponseStream();
        StreamReader reader = new StreamReader(dataStream);
        string responseFromServer = reader.ReadToEnd();
        return responseFromServer == "yes";
    }
    public static bool ValidateUserPasswordWordPress(string name, string password)
    {
        string sURL = WordPressURL + "?"
            + "username=" + HttpUtility.UrlEncode(name)
            + "&password=" + HttpUtility.UrlEncode(password);

        WebRequest request = WebRequest.Create(sURL);
        Stream dataStream = request.GetResponse().GetResponseStream();
        StreamReader reader = new StreamReader(dataStream);
        string responseFromServer = reader.ReadToEnd();
        return responseFromServer == "yes";
    }
    public static bool ValidateUserPasswordHashWordPress(string name, string passwordHash)
    {
        string sURL = WordPressURL + "?"
            + "username=" + HttpUtility.UrlEncode(name)
            + "&passwordhash=" + HttpUtility.UrlEncode(passwordHash);

        WebRequest request = WebRequest.Create(sURL);
        Stream dataStream = request.GetResponse().GetResponseStream();
        StreamReader reader = new StreamReader(dataStream);
        string responseFromServer = reader.ReadToEnd();
        return responseFromServer == "yes";
    }

    public static string WriteJsWithDemoAccountsForClouds()
    {
        try
        {
            if (!Utils.UserSettings.Main.IsDemoMode.Value)
                return string.Empty;

            // account names
            string commonDemoName =                  JsonConvert.SerializeObject("demo.htcomnet@gmail.com");
            string googleDemoName =                  JsonConvert.SerializeObject("demo.httpcommander@gmail.com");
            string dropboxDemoName =                 commonDemoName;
            string boxDemoName =                     commonDemoName;
            string oneDriveDemoName =                commonDemoName;
            string oneDriveForBusinessDemoName =     JsonConvert.SerializeObject("hcdemo@httpcommander.onmicrosoft.com");
            // account passwords
            string demoPassword =                    JsonConvert.SerializeObject("Vfrtgb56*");
            string googleDemoPassword =              demoPassword;
            string dropboxDemoPassword =             demoPassword;
            string boxDemoPassword =                 demoPassword;
            string oneDriveDemoPassword =            JsonConvert.SerializeObject("Vfrtgb56**");
            string oneDriveForBusinessDemoPassword = demoPassword;

            return @"
<script type=""text/javascript"">
    window.GoogleDemoName = " + googleDemoName + @";
    window.GoogleDemoPass = " + googleDemoPassword + @";
    window.DropboxDemoName = " + dropboxDemoName + @";
    window.DropboxDemoPass = " + dropboxDemoPassword + @";
    window.BoxDemoName = " + boxDemoName + @";
    window.BoxDemoPass = " + boxDemoPassword + @";
    window.OneDriveDemoName = " + oneDriveDemoName + @";
    window.OneDriveDemoPass = " + oneDriveDemoPassword + @";
    window.OneDriveForBusinessDemoName = " + oneDriveForBusinessDemoName + @";
    window.OneDriveForBusinessDemoPass = " + oneDriveForBusinessDemoPassword + @";
</script>
";
        }
        catch { }
        return string.Empty;
    }
}