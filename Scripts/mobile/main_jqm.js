var scriptSource=(function(b){b=b||document.getElementsByTagName("script");
var d,a=b.length,g,f,c;
for(var e=0;
e<a;
e++){d=b[e];
g=(typeof d.getAttribute.length!="undefined")?d.src:d.getAttribute("src",4);
if((g||"").toLowerCase().indexOf("scripts/error-handler.js")<0&&(g||"").toLowerCase().indexOf("scripts/error-handler-debug.js")<0){continue
}if(g.match(/^https?:\/\//i)){return g
}}f=document.location.href;
c=f.lastIndexOf("/");
g=f.substr(0,c+1)+g;
return g
})();
HttpCommander.Main={inited:false,handleErrors:true,defaultPath:"root",asControl:false,hidden:false,uid:"",googleDocSupportedtypes:";pdf;doc;docx;ppt;pptx;tif;tiff;xls;xlsx;pages;ai;psd;svg;eps;ps;xps;ttf;zip;rar;dxf;txt;css;html;htm;php;c;cpp;h;hpp;js;",events:{},fm:{},htmlEncode:function(a){return !a?a:String(a).replace(/&/g,"&amp;").replace(/>/g,"&gt;").replace(/</g,"&lt;").replace(/"/g,"&quot;")
},appRootUrl:(function(){var a=scriptSource.replace(/\/Scripts\/error-handler.*$/i,"/");
return a
})(),InitFileManager:function(a){if(!HttpCommander.Main.inited){HttpCommander.Main.inited=true;
a=a||{};
HttpCommander.Main.handleErrors=(a.handleErrors===true);
HttpCommander.Main.defaultPath=a.defaultPath?a.defaultPath:"root";
HttpCommander.Main.asControl=(a.control!==false);
HttpCommander.Main.hidden=(a.showOnLoad===false);
HttpCommander.Main.uid=String(a.id||"");
if(!HttpCommander.Main.uid||typeof HttpCommander.Main.uid!=="string"||HttpCommander.Main.uid==""||HttpCommander.Main.uid.trim()==""){HttpCommander.Main.uid=(new Date()).getTime().toString()
}else{HttpCommander.Main.uid=HttpCommander.Main.uid.trim().replace(/[^a-zA-Z0-9-_]+/g,"_");
if(HttpCommander.Main.uid==="_"){HttpCommander.Main.uid=(new Date()).getTime().toString()
}}var c=function(){try{$("#"+HttpCommander.Main.uid+"_loadingTouch").remove()
}catch(i){}try{$("#"+HttpCommander.Main.uid+"_loading").remove()
}catch(i){}try{$("#"+HttpCommander.Main.uid+"_loading-mask").remove()
}catch(i){}HttpCommander.Main.fm.onPreRender();
HttpCommander.Main.init();
HttpCommander.Main.fm.onRender();
HttpCommander.Main.fm.onShow();
if(HttpCommander.Main.asControl&&!HttpCommander.Main.events.LogOut){$("#jqm-settings-logout").hide()
}var h=htcConfig.enableWebFoldersLinks&&htcConfig.hcAuthMode!="shibboleth"?("?webdav="+encodeURIComponent((htcConfig.domainNameUrl!=""?htcConfig.domainNameUrl:HttpCommander.Main.appRootUrl)+htcConfig.identifierWebDav)):"";
if(document.getElementById("jqm-mobile-help")){document.getElementById("jqm-mobile-help").href=htcConfig.mobileHelpRelUrl+h
}};
try{$(document).ready(function(){c()
})
}catch(f){throw f
}var g=["PreRender","Render","Show","Hide","LogOut","Destroy"];
var b=function(i,h){if(HttpCommander.Main.fm&&typeof i==="string"&&typeof HttpCommander.Main.events[i]==="function"){var k=[];
if(!!h&&Object.prototype.toString.apply(h)!=="[object Array]"){k.push(h)
}else{if(!!h){k=h
}}k.push(HttpCommander.Main.fm);
try{return HttpCommander.Main.events[i].apply(HttpCommander.Main.fm,k)
}catch(j){ProcessScriptError(j)
}}};
HttpCommander.Main.fm.onPreRender=function(){b("PreRender")
};
HttpCommander.Main.fm.onRender=function(){b("Render")
};
HttpCommander.Main.fm.onShow=function(){b("Show")
};
HttpCommander.Main.fm.onHide=function(){b("Hide")
};
HttpCommander.Main.fm.onLogOut=function(e,h){b("LogOut",e,h)
};
HttpCommander.Main.fm.onDestroy=function(){b("Destroy");
try{if(HttpCommander.Main.fm){delete HttpCommander.Main.fm;
HttpCommander.Main.fm=undefined
}}catch(h){ProcessScriptError(h)
}};
var d=function(e,h){if(typeof e=="string"&&g.indexOf(e)!=-1&&typeof h=="function"){HttpCommander.Main.events[e]=h;
if(e==="LogOut"&&$("#jqm-settings-logout")){$("#jqm-settings-logout").show()
}}};
HttpCommander.Main.fm.SetEvent=d;
HttpCommander.Main.fm.Show=function(){};
HttpCommander.Main.fm.Hide=function(){};
return HttpCommander.Main.fm
}},colModelMetaDataGrid:[{header:htcConfig.locData.FileDetailsGridTitleColumn,name:"title",type:"string"},{header:htcConfig.locData.CommonFieldLabelValue,name:"value",type:"string"},{header:htcConfig.locData.FileDetailsGridAuthorColumn,name:"userlastmodified",type:"string"},{header:htcConfig.locData.CommonFieldLabelDateModified,name:"datemodified",type:"date",dateFormat:"timestamp"}],configureEventHandlers:function(){$('a[id^="listItem"]').live("click",this.listItemClick);
$('a[id^="jqm-fileInfo-header-btn"]').bind("click",this.fileInfoHeaderHandler);
$('a[id^="jqm-uploadFromUrl-header-btn"]').bind("click",this.fileInfoHeaderHandler);
$('a[id^="jqm-uploadHeader-btn"]').bind("click",this.fileInfoHeaderHandler);
$('a[id^="jqm-main-header-btn"]').bind("click",this.fileListHeaderHandler);
$('a[id^="jqm-main-footer-btn"]').bind("click",this.fileListHeaderHandler);
$('a[id^="jqm-settings-home"]').bind("click",this.fileListHeaderHandler);
$("#jqm-settings-logout").bind("click",this.fileListHeaderHandler);
$('a[id^="jqm-uploadMenu"]').bind("click",this.fileListHeaderHandler);
$('input[id^="jqm-uploadFromUrl-content-submit-btn"]').bind("click",this.fileListHeaderHandler);
$('a[id^="jqm-optionsMenu-header-btn"]').bind("click",this.fileInfoHeaderHandler);
$("a[data-role='button']").live("click",function(){HttpCommander.Main.resetButton($(this))
});
$('a[id^="listItem"]').live("click",function(){HttpCommander.Main.resetButton($('li[class*="ui-btn-active"]'))
})
},resetButton:function(a){setTimeout(function(){try{$(a).removeClass("ui-btn-active")
}catch(b){}},500)
},init:function(){try{$.each(htcConfig.metaDataFields,function(d,f){var b=true;
for(var c=0;
c<HttpCommander.Main.colModelMetaDataGrid.length;
c++){if(HttpCommander.Main.colModelMetaDataGrid[c].name==f.name){b=false;
break
}}if(b){var e={header:f.name.substring(0,1).toUpperCase()+f.name.substring(1),name:f.name,type:f.type,dateFormat:f.type=="date"?"timestamp":""};
HttpCommander.Main.colModelMetaDataGrid.push(e)
}});
this.configureEventHandlers();
this.extDirect={url:"",tid:1,directAction:"Common",directMethod:"GetInfo",responseIsArray:true,cbs:new Array(),callMethod:function(b,c,f,d,e){this.url=b;
this.cbs[this.tid]=e;
this.directAction=c;
this.directMethod=f;
this.params=d;
this.load()
},load:function(){var b={type:"rpc",action:this.directAction,method:this.directMethod,tid:this.tid,data:this.params};
$.mobile.showPageLoadingMsg();
var c=jQuery.extend(true,{},this);
$.ajax({url:this.url,global:false,processData:false,type:"POST",data:$.toJSON(b),dataType:"json",async:true,success:function(e,f,d){c.complete(e,f,d,c)
},error:function(d,f,e){alert(e)
}});
this.tid++
},complete:function(d,e,c,b){$.mobile.hidePageLoadingMsg();
if(b.responseIsArray){d=d[0]
}if(d.tid&&d.type=="rpc"){b.cbs[d.tid].call(b,d,e,c);
b.cbs=$.grep(b.cbs,function(f){return f!=b.cbs[d.tid]
})
}else{if(d.type=="exception"){if(d.action=="Grid"&&d.method=="FastLoad"){HttpCommander.Main.currentDirectory=HttpCommander.Main.pathUp(HttpCommander.Main.getCurrentFolder())
}alert(d.message||d.msg||d.error)
}}return false
}}
}catch(a){this.ProcessScriptError(a)
}try{this.openGridFolder(HttpCommander.Main.defaultPath!=null?HttpCommander.Main.defaultPath:"root")
}catch(a){this.ProcessScriptError(a)
}},showFileInfoPanel:function(c,d,b,a){if(c&&c.result&&(c.result.status=="success"||c.result.success)){HttpCommander.Main.fileInfo=c.result;
$.mobile.changePage($("#jqm-fileInfo"),"none",false,true);
HttpCommander.Main.configureFileInfoPanel()
}else{if(c&&c.result){alert(c.result.message)
}}return false
},getListItemIndexByElement:function(a){var c=a.id;
try{return c.indexOf("listItem")>=0?c.substring(c.indexOf("listItem")+"listItem".length):-1
}catch(b){}return -1
},listItemClick:function(){var a=HttpCommander.Main.getListItemIndexByElement(this);
if(a>=0){var c=HttpCommander.Main.currentListData[a],b;
if(c.rowtype=="folder"||c.rowtype=="rootfolder"){b=HttpCommander.Main.pathAppendFolder(HttpCommander.Main.getCurrentFolder(),c.name);
HttpCommander.Main.openGridFolder(b)
}else{if(c.rowtype=="uplink"){HttpCommander.Main.itemToSelect=HttpCommander.Main.getCurrentFolderName();
b=HttpCommander.Main.pathUp(HttpCommander.Main.getCurrentFolder());
HttpCommander.Main.openGridFolder(b)
}else{if(c.rowtype=="file"){HttpCommander.Main.loadFileInfo(c)
}}}}return false
},folderChanged:function(){var b=HttpCommander.Main.getCurrentFolderName();
$("#jqm-main-header-caption").html(b=="root"?htcConfig.locData.CommonMainTitle:HttpCommander.Main.htmlEncode(b));
if(b=="root"){$("#jqm-main-header-btnBack").hide()
}else{$("#jqm-main-header-btnBack").show()
}var a=!this.isiPhone()&&htcConfig.currentPerms&&htcConfig.currentPerms.upload;
if($("#jqm-main-footer-btnUpload")){a?$("#jqm-main-footer-btnUpload").show():$("#jqm-main-footer-btnUpload").hide()
}},configureFileInfoPanel:function(){$("#jqm-fileInfo-content-fileName").text(this.fileInfo.props.name);
$("#jqm-fileInfo-content-fileType").val(this.fileInfo.props.type);
$("#jqm-fileInfo-content-fileSize").val(HttpCommander.Main.sizeRenderer(this.fileInfo.props.size));
$("#jqm-fileInfo-content-fileCreationDate").val(HttpCommander.Main.dateRenderer(this.fileInfo.props.created));
$("#jqm-fileInfo-content-fileModificationDate").val(HttpCommander.Main.dateRenderer(this.fileInfo.props.modified));
$("#jqm-fileInfo-content-fileAccessedDate").val(HttpCommander.Main.dateRenderer(this.fileInfo.props.accessed));
var k=htcConfig.currentPerms&&htcConfig.currentPerms.download;
var a=this.fileInfo.props.name;
var i="file";
var e=htcConfig.currentPerms&&i=="file"&&htcConfig.currentPerms.download;
if(e){var l=HttpCommander.Main.file_get_ext(a.toLowerCase());
e=htcConfig.mimeTypes.indexOf(l)!=-1
}var g=i!="empty";
var f=htcConfig.currentPerms&&htcConfig.currentPerms.download&&htcConfig.enableGoogleDocumentsViewer;
var d=f&&HttpCommander.Main.googleDocSupportedtypes.indexOf(";"+HttpCommander.Main.file_get_ext(a.toLowerCase())+";")!=-1;
var h;
if($("#jqm-fileInfo-footer-btnDownload")){if(k){h="Handlers/Download.ashx?action=download&file="+encodeURIComponent(HttpCommander.Main.getCurrentFolder())+"/"+encodeURIComponent(this.fileInfo.props.name);
$("#jqm-fileInfo-footer-btnDownload").attr("href",h);
$("#jqm-fileInfo-footer-btnDownload").attr("target","blank");
$("#jqm-fileInfo-footer-btnDownload").show()
}else{$("#jqm-fileInfo-footer-btnDownload").hide()
}}if($("#jqm-fileInfo-footer-btnView")){if(e&&g){h="Handlers/Download.ashx?action=view&file="+encodeURIComponent(HttpCommander.Main.getCurrentFolder())+"/"+encodeURIComponent(this.fileInfo.props.name);
$("#jqm-fileInfo-footer-btnView").attr("href",h);
$("#jqm-fileInfo-footer-btnView").attr("target","blank");
$("#jqm-fileInfo-footer-btnView").show()
}else{$("#jqm-fileInfo-footer-btnView").hide()
}}if($("#jqm-fileInfo-footer-btn-google-view")){if(d){$("#jqm-fileInfo-footer-btn-google-view").attr("href","");
$("#jqm-fileInfo-footer-btn-google-view").attr("target","blank");
$("#jqm-fileInfo-footer-btn-google-view").show()
}else{$("#jqm-fileInfo-footer-btn-google-view").hide()
}}if(d){$("#jqm-fileInfo-footer-viewControl").show();
HttpCommander.Main.loadAnonymLink(d?"GoogleView":"ZohoView")
}else{$("#jqm-fileInfo-footer-viewControl").hide()
}if(this.fileInfo.modifications&&this.fileInfo.modifications.length>0){$("#jqm-fileInfo-modifications").show();
var b=$("#jqm-fileInfo-modifications-list");
b.empty();
$.each(this.fileInfo.modifications,function(m,n){b.append('<li data-icon="false"><table style="border-collapse:separate; border-spacing: 10px 0px;"><tr><td><div class="sencha-table-label" >'+htcConfig.locData.CommonFieldLabelType+"</div></td><td> "+HttpCommander.Main.htmlEncode(n.type)+'</td></tr><tr><td><div class="sencha-table-label" >'+htcConfig.locData.CommonFieldLabelUser+"</div></td><td>"+HttpCommander.Main.htmlEncode(n.user)+'</td></tr><tr><td><div class="sencha-table-label" >'+htcConfig.locData.CommonFieldLabelSize+"</div></td><td>"+HttpCommander.Main.sizeRenderer(n.size)+'</td></tr><tr><td><div class="sencha-table-label" >'+htcConfig.locData.CommonFieldLabelDate+"</div></td><td>"+HttpCommander.Main.dateRenderer(n.date)+'</td></tr><tr><td><div class="sencha-table-label" >'+htcConfig.locData.CommonFieldLabelPath+"</div></td><td>"+HttpCommander.Main.htmlEncode(n.path)+"</td></tr></table></li>")
});
b.listview("refresh")
}else{$("#jqm-fileInfo-modifications").hide()
}if(this.fileInfo.metadata&&this.fileInfo.metadata.length>0){$("#jqm-fileInfo-metadata").show();
var c=$("#jqm-fileInfo-metadata-list");
c.empty();
var j="";
$.each(this.fileInfo.metadata,function(m,n){j='<li data-icon="false"><table style="border-collapse:separate; border-spacing: 10px 0px;">';
$.each(HttpCommander.Main.colModelMetaDataGrid,function(o,p){j+='<tr><td><div class="sencha-table-label" >'+HttpCommander.Main.htmlEncode(p.header)+"</div></td><td>";
switch(p.type){case"size":j+=HttpCommander.Main.sizeRenderer(n[p.name]);
break;
case"date":j+=HttpCommander.Main.dateRenderer(n[p.name]);
break;
default:j+=HttpCommander.Main.htmlEncode(n[p.name])
}j+="</td></tr>"
});
j+="</table></li>";
c.append(j)
});
c.listview("refresh")
}else{$("#jqm-fileInfo-metadata").hide()
}},anonymLinkReceived:function(f,h,e,d){if(f&&f.result&&(f.result.status=="success"||f.result.success)){var b=f.result.url;
if(b==""){return
}var a=HttpCommander.Main.fileInfo.props.name;
if($("#jqm-fileInfo-footer-btn-google-view")){var g=b.split("?");
b=g[0]+"/"+a;
for(var c=1;
c<g.length;
c++){b+="?"+g[c]
}$("#jqm-fileInfo-footer-btn-google-view").attr("href","https://drive.google.com/viewerng/viewer?embedded=false&url="+escape(b))
}}else{if(f&&f.result){alert(f.result.message)
}}return false
},fileInfoHeaderHandler:function(){switch(this.id){case"jqm-fileInfo-header-btnBack":case"jqm-optionsMenu-header-btnBack":case"jqm-uploadFromUrl-header-btnBack":case"jqm-uploadHeader-btnBack":$.mobile.changePage($("#jqm-main-list"),"none",true,true);
break
}return false
},fileInfoFooterHandler:function(){switch(this.id){case"jqm-fileInfo-footer-btnDownload":case"jqm-fileInfo-footer-btn-google-view":return true
}return false
},fileListHeaderHandler:function(){switch(this.id){case"jqm-main-header-btnBack":HttpCommander.Main.itemToSelect=HttpCommander.Main.getCurrentFolderName();
var b=HttpCommander.Main.pathUp(HttpCommander.Main.getCurrentFolder());
HttpCommander.Main.openGridFolder(b);
break;
case"jqm-settings-logout":if(HttpCommander.Main.asControl){HttpCommander.Main.fm.onLogOut(htcConfig.currentUser,typeof htcConfig.currentUserDomain!="undefined"&&htcConfig.currentUserDomain!=""?htcConfig.currentUserDomain:undefined);
return false
}else{location.href="Logout.aspx"
}break;
case"jqm-settings-home":HttpCommander.Main.openGridFolder("root");
break;
case"jqm-main-header-btnSettings":case"jqm-main-footer-btnSettings":$.mobile.changePage($("#jqm-optionsMenu"),"none",false,true);
if(HttpCommander.Main.asControl&&!HttpCommander.Main.events.LogOut){$("#jqm-settings-logout").hide()
}break;
case"jqm-main-footer-btnUpload":$.mobile.changePage($("#jqm-uploadMenu"),"none",false,true);
break;
case"jqm-uploadMenu-upload":var a="Handlers/UploadJQuery.aspx?";
a+="path="+encodeURIComponent(HttpCommander.Main.getCurrentFolder())+"&Mobile=jquery";
$.mobile.changePage(a,"slide",false,true);
break;
case"jqm-uploadMenu-uploadFromUrl":$("#jqm-uploadFromUrl-content-field").val("");
$("#jqm-uploadFromUrl-content-file-name").val("");
$("#jqm-uploadFromUrl-content-file-status").val("");
$.mobile.changePage($("#jqm-uploadFromUrl"),"none",false,true);
break;
case"jqm-uploadFromUrl-content-submit-btn":HttpCommander.Main.uploadFromUrl();
break
}return false
},downloadFile:function(c,d,b){if(htcConfig.currentPerms&&htcConfig.currentPerms.download){var a="Handlers/Download.ashx?action=download&file="+encodeURIComponent(d)+"/"+encodeURIComponent(c);
if(!window.open(a)){location.href=a
}}},openGridFolder:function(getPath,doNotLoadList){HttpCommander.Main.currentDirectory=getPath;
HttpCommander.Main.extDirect.callMethod(HttpCommander.Remote.GridHandler.url,"Grid","FastLoad",["name","ASC",getPath],function(data,textStatus,jqXHR,that){if(data&&data.result&&data.result.success){HttpCommander.Main.currentListData=data.result.data;
htcConfig.currentPerms=eval("("+data.result.permissions+")");
var fileList=$("#jqm-main-filesList");
fileList.empty();
$.each(data.result.data,function(key,value){var itemUrl="Default.aspx?";
if(window.location.search){itemUrl+=encodeURIComponent(window.location.search.substring(1))+"&"
}if(value.rowtype=="folder"||value.rowtype=="rootfolder"){itemUrl+="path="+encodeURIComponent(HttpCommander.Main.pathAppendFolder(HttpCommander.Main.getCurrentFolder(),value.name))
}else{if(value.rowtype=="uplink"){itemUrl+="path="+encodeURIComponent(HttpCommander.Main.pathUp(HttpCommander.Main.getCurrentFolder()))
}else{if(value.rowtype=="file"){itemUrl+="path="+encodeURIComponent(HttpCommander.Main.getCurrentFolder())
}else{return
}}}var modIcons="";
if(value.isnew){modIcons+="&nbsp;<img src='"+htcConfig.relativePath+"Images/isnew.png' class='no_class' />"
}if(value.ismod){modIcons+="&nbsp;<img src='"+htcConfig.relativePath+"Images/ismod.png' class='no_class' />"
}fileList.append('<li class="ui-li-has-icon" data-icon="false">                        <img class="ui-li-icon" src="'+htcConfig.relativePath+value.icon+'">                        <a style="white-space:normal" id="listItem'+key+'" href="'+itemUrl+'" >'+HttpCommander.Main.htmlEncode(value.name)+modIcons+"</a></li>")
});
fileList.listview("refresh");
$(".no_class").each(function(index){$(this).removeClass("ui-li-thumb ui-corner-tl")
});
if(!doNotLoadList){$.mobile.changePage($("#jqm-main-list"),"none",false,false)
}}else{HttpCommander.Main.currentDirectory=HttpCommander.Main.pathUp(HttpCommander.Main.getCurrentFolder());
if(data&&data.result){alert(data.result.msg)
}}HttpCommander.Main.folderChanged();
return false
})
},loadFileInfo:function(a){var b={type:a.rowtype,name:a.name,path:this.getCurrentFolder(),isMobile:true};
HttpCommander.Main.extDirect.callMethod(HttpCommander.Remote.MetadataHandler.url,"Metadata","Load",[b],HttpCommander.Main.showFileInfoPanel)
},loadAnonymLink:function(a){var b={path:this.getCurrentFolder(),name:this.fileInfo.props.name,service:a};
HttpCommander.Main.extDirect.callMethod(HttpCommander.Remote.CommonHandler.url,"Common","AnonymLink",[b],HttpCommander.Main.anonymLinkReceived)
},uploadFromUrl:function(){$("#jqm-uploadFromUrl-content-file-status").val(htcConfig.locData.UploadInProgress+"...");
var a={path:this.getCurrentFolder(),name:$("#jqm-uploadFromUrl-content-file-name").val(),url:$("#jqm-uploadFromUrl-content-field").val()};
HttpCommander.Main.extDirect.callMethod(HttpCommander.Remote.UploadFromURLHandler.url,"UploadFromURL","Upload",[a],function(d,e,c,b){if(typeof d=="undefined"||typeof d.result=="undefined"){return
}if(!d.result.success){alert(d.result.message);
$("#jqm-uploadFromUrl-content-file-status").val(d.result.message);
return
}$("#jqm-uploadFromUrl-content-file-status").val(HttpCommander.Main.format(htcConfig.locData.UploadFromUrlSuccessMsg,d.result.file,a.url));
HttpCommander.Main.openGridFolder(a.path,true)
})
},pathAppendFolder:function(b,a){if(b.toLowerCase()=="root"){return a
}if(b.length>0&&b[b.length-1]!="/"){b+="/"
}return b+a
},pathUp:function(b){var a=b.lastIndexOf("/");
if(a<0){return"root"
}else{return b.substr(0,a)
}},getCurrentFolderName:function(){var b=HttpCommander.Main.getCurrentFolder();
var a=b.lastIndexOf("/");
if(a<0){return b
}else{return b.substr(a+1)
}},getCurrentFolder:function(){return HttpCommander.Main.currentDirectory
},ProcessScriptError:function(a){if(HttpCommander.Main.handleErrors){var b="Script error occured. ";
if(a!=undefined&&a.message!=undefined&&a.name!=undefined){b+="Message:"+a.message+" Name: "+a.name
}window.alert(b)
}else{throw a
}},sizeRenderer:function(a){if(a==""){return""
}else{if(a<1024){return a+" bytes"
}else{if(a<1048576){return(Math.round(((a*10)/1024))/10)+" KB"
}else{if(a<1073741824){return(Math.round(((a*10)/1048576))/10)+" MB"
}else{return(Math.round(((a*10)/1073741824))/10)+" GB"
}}}}},dateRenderer:function(a){return new Date(a*1000).toLocaleString()
},isiPhone:function(){return((navigator.platform.indexOf("iPhone")!=-1)||(navigator.platform.indexOf("iPad")!=-1)||(navigator.platform.indexOf("iPod")!=-1))
},file_get_ext:function(a){return typeof a!="undefined"?a.substring(a.lastIndexOf(".")+1,a.length).toLowerCase():false
},format:function(b,a){a=typeof a==="object"?a:Array.prototype.slice.call(arguments,1);
return b.replace(/\{\{|\}\}|\{(\w+)\}/g,function(c,d){if(c=="{{"){return"{"
}if(c=="}}"){return"}"
}return a[d]
})
}};
$.urlParam=function(a){var b=new RegExp("[\\?&]"+a+"=([^&#]*)").exec(window.location.href);
if(!b){return 0
}return decodeURIComponent(b[1].replace(/\+/g," "))||0
};
$("div").live("pagebeforecreate.onetime",function(){var a=$('div[data-role="footer"], div[data-role="header"]');
a.addClass("ui-footer-fixed");
a.addClass("ui-fixed-overlay");
a.addClass("fade");
a.attr("data-position","fixed");
$("div").die("pagebeforecreate.onetime")
});
if(!Array.prototype.indexOf){Array.prototype.indexOf=function(c,d){for(var b=(d||0),a=this.length;
b<a;
b++){if(this[b]===c){return b
}}return -1
}
};