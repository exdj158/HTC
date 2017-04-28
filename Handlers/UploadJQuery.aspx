<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="UploadJQuery.aspx.cs" Inherits="HttpCommander.UploadJQuery" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" >
<head runat="server">
    <link title="default" href="../Images/resources_1.5/mobile/jquery/jquery.mobile-min.css" type="text/css" rel="stylesheet" />
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta content="NOINDEX, NOFOLLOW" name="ROBOTS" />
    <meta http-equiv="x-ua-compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0" />
    <link rel="shortcut icon" href="../favicon.ico" type="image/x-icon" />
</head>
<body>
    <div id="touchBody" runat="server">         
        <script type="text/javascript" src="../Scripts/mobile/jquery/jquery.js"></script> 
        <script type="text/javascript">
            //Simple cap
            Ext = { ns: function(nspace) { } };
            HttpCommander = { Remote: {} };
            $(document).bind("mobileinit", function() {
                $.mobile.ajaxEnabled = false;
                $.mobile.ajaxFormsEnabled = false;
                $.mobile.loadingMessage = "<%= HttpCommander.Utils.LocalizationsManager.GetString("ProgressLoading")%>";
            });
            
            $('#uploadForm').live("submit", function(){$.mobile.pageLoading();});

        </script>      
        
             
        <script type="text/javascript" src="../Scripts/mobile/jquery/jquery.mobile.js"></script>             
        <script type="text/javascript" src="../Scripts/mobile/jquery/jquery.json.js"></script>                             
        <script type="text/javascript" src="../Handlers/Config.ashx"></script>        
        <!--<script type="text/javascript" src="../Scripts/mobile/main_jqm.js"></script>-->
        
        <div data-role="page" id="jqm-upload">
            <div data-role="header" id="jqm-upload-header" data-backbtn="false">
                <a href="../Default.aspx?<%=CurrentQueryString %>" data-direction="reverse" data-icon="back" id="jqm-upload-header-btnBack"><%=HttpUtility.HtmlEncode(HttpCommander.Utils.LocalizationsManager.GetString("CommandBack"))%></a>
		        <h1 id="jqm-upload-header-caption"><%=HttpUtility.HtmlEncode(HttpCommander.Utils.LocalizationsManager.GetString("UploadSimpleUpload"))%></h1>
	            
	        </div><!-- /header -->

	        <div data-role="content" id="jqm-upload-content">	
		        <form id="uploadForm" data-ajax="false" action="<%=CurrentUrl %>" method="post" enctype="multipart/form-data"> 
		            <input type="file" name="file" id="file" />
		            <input type="submit" data-theme="b" data-role="button" value="<%=HttpUtility.HtmlEncode(HttpCommander.Utils.LocalizationsManager.GetString("UploadSimpleUpload"))%>"/>
		        </form> 
		        <% if (ShowCollapsableBlock)
                   { %>
		            <div data-role="collapsible">
	                <h3><%=CollapsableHeader%></h3>
	                <p><%=CollapsableResultText%></p>
	                </div>
	            <% } %>
	        </div><!-- /content -->	        
	    </div>    
	   
    </div>
</body>
</html>
