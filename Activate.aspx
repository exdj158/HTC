<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Activate.aspx.cs" Inherits="HttpCommander.Activate" %>
<%@ Import Namespace="HttpCommander" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" class="login-bg">
<head runat="server">
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta content="NOINDEX, NOFOLLOW" name="ROBOTS" />
    <meta http-equiv="x-ua-compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0" />
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    <script type="text/javascript" src="Scripts/error-handler<%=Utils.BuildModeJs%>.js?v=<%=Utils.AssemblyVersion%>"></script>
    <link runat="server" id="CssHeadInclude" href="Styles.css" type="text/css" rel="stylesheet" />
</head>
<body class="standard-ui-body">
    <div class="login-container" id="formContainer" runat="server" align="center">
        <div
            <% if (!Utils.DetectMobileBrowser(this))
               {%>
            class="login-form-content ">
            <% }
               else
               {%>
                class="login-form-content login-form-content-mobile">
            <% }%>
            <table class="login-form-table">
                <tr>
                    <td class="first-column"></td>
                    <td class="second-column"></td>
                    <td class="third-column"></td>
                </tr>
                <tr>
                    <td colspan="3" class="login-form-table-caption-cell">
                        <asp:Label ID="lblLoginTitle" runat="server" lass="login-form-table-caption" Text="Activate result"></asp:Label>
                    </td>
                </tr>
                <tr>
                    <td colspan="3" align="center">
                        <%= ActivationResult %>
                    </td>
                </tr>
                <tr>
                    <td colspan="3" align="center">
                        <a href="Default.aspx"><%: Utils.LocalizationsManager.GetString("ActivateAccountReturnToLogin") %></a>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>
