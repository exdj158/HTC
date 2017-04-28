<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="AdminStart.aspx.cs" Inherits="HttpCommander.AdminStart" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="adminStartHead" runat="server">
    <title>Admin start</title>
    <meta name="ROBOTS" content="NOINDEX, NOFOLLOW" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta http-equiv="x-ua-compatible" content="IE=edge" />
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    <style type="text/css">
        table th {
            background-color: #fc9;
            color: black;
            height: 20px;
            border-style: solid;
            border-width: 1px;
            padding: 3px 5px 3px 5px;
        }

        table td {
            border-style: solid;
            border-width: 1px;
            padding: 5px 7px 5px 7px;
        }

        table {
            border-style: solid;
            border-width: 1px;
            border-collapse: collapse;
            margin-left: 15px;
            margin-right: 15px;
            border-color: #ccc;
        }
    </style>
</head>
<body style="font-family: Tahoma; background-color: #ffffff; color: #000000;">
    <form id="adminStartForm" runat="server">
        <center>
            <div>
                <table style="text-align: left;">
                    <tr>
                        <th>Link</th>
                        <th>Description</th>
                    </tr>
                    <tr>
                        <td>
                            <asp:HyperLink ID="manualLink" runat="server" Target="_blank" NavigateUrl="Manual.html">Manaul (Installation and setup)</asp:HyperLink>
                            (/Manual.html)
                        </td>
                        <td>
                            <strong>Admin manual</strong>. Read how to install application and configure it.
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <asp:HyperLink ID="usersmanualLink" runat="server" Target="_blank" NavigateUrl="Localization/Help/UsersHelp.html">End users manaul (How to work with files)</asp:HyperLink>
                            (Localization/Help/UsersHelp.html)
                        </td>
                        <td>
                            <strong>End users manual</strong>. Read how to work with files. You can edit this file and add any info for end users.
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <asp:HyperLink ID="diagnosticsLink" runat="server" Target="_blank" NavigateUrl="Diagnostics.aspx">Diagnostics</asp:HyperLink>
                            (/Diagnostics.aspx)
                        </td>
                        <td>
                            <strong>Diagnostics page</strong>.
                            It makes diagnostics of application. Run this page first after applicatioin installation or modifying any application settings. Run this page under non-admin user to be sure that application works for any user (with minimum permissions). You can send this page output to Element-IT Support team if you have any problems.By default any user can run Diagnostics but you can allow access only for admins by <b>"ShowDiagnosticsASPXOnlyForAdmins"</b> parameter at file <b>HttpCommanderSettings.config</b> (Set value to the "true").
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <asp:HyperLink ID="adminPanelLink" runat="server" Target="_blank" NavigateUrl="AdminPanel.aspx">Admin Panel</asp:HyperLink>
                            (/AdminPanel.aspx)
                        </td>
                        <td>
                            <strong>Administration panel</strong>. Here you can change application settings, setup folders and view logs. To be able to logon to Admin Panel check that parameter <b>"Administrators"</b> at file <b>HttpCommanderSettings.config</b> includes logon user name (Add your administrator user to this parameter's value).
                            <asp:Label runat="server" ID="adminPanelExtra"></asp:Label>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <asp:HyperLink ID="defaultLink" runat="server" Target="_blank" NavigateUrl="Default.aspx">Main user interface</asp:HyperLink>
                            (/Default.aspx)
                        </td>
                        <td>Run Http Commander main user interface.
                            <asp:Label runat="server" ID="defaultLinkExtra"></asp:Label>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <asp:HyperLink ID="HyperLink1" runat="server" Target="_blank" NavigateUrl="Default.aspx?Mobile=auto">Mobile version</asp:HyperLink>
                            (/Default.aspx?Mobile=auto)
                        </td>
                        <td>
                            Run Http Commander main user interface (Mobile version). This is mobile version. it automatically detect browser type or device and shows Sencha or JQuery mobile vesion of interface.
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <asp:HyperLink ID="mobileLink1" runat="server" Target="_blank" NavigateUrl="Default.aspx?Mobile=sencha">Mobile version (Sencha based)</asp:HyperLink>
                            (/Default.aspx?Mobile=sencha)
                        </td>
                        <td>
                            Run Http Commander main user interface (Sencha based mobile version). This is mobile version for most advanced devices like iPhone, Android v.2.2+, BlackBerry v.6.0+, Bada. You can use desktop PC with Chrome 
                            or Safari browser to test it.
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <asp:HyperLink ID="mobileLink2" runat="server" Target="_blank" NavigateUrl="Default.aspx?Mobile=jqm">Mobile version (JQuery based)</asp:HyperLink>
                            (/Default.aspx?Mobile=jqm)
                        </td>
                        <td>
                            Run Http Commander main user interface (JQuery mobile based version). This is mobile version for old devices (Symbian, Windows mobile, etc.). You can use desktop PC with  Firefox, Chrome 
                            or IE browsers to test it.
                        </td>
                    </tr>
                </table>
            </div>
        </center>
    </form>
</body>
</html>
