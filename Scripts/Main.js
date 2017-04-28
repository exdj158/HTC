Function.prototype.debounce=function(b,a){var c=this,d;
return function(){var e=arguments,f=this;
clearTimeout(d);
d=setTimeout(function(){c.apply(a||f,e)
},b)
}
};
Ext.override(Ext.direct.RemotingProvider,{constructor:function(a){Ext.direct.RemotingProvider.superclass.constructor.call(this,a);
this.addEvents("beforecall","call","requestcreated");
this.namespace=(Ext.isString(this.namespace))?Ext.ns(this.namespace):this.namespace||window;
this.transactions={};
this.callBuffer=[]
},doSend:function(e){var g={url:this.url,callback:this.onData,scope:this,ts:e,timeout:this.timeout},b;
if(Ext.isArray(e)){b=[];
for(var c=0,a=e.length;
c<a;
c++){b.push(this.getCallData(e[c]))
}}else{b=this.getCallData(e)
}if(this.enableUrlEncode){var f={};
f[Ext.isString(this.enableUrlEncode)?this.enableUrlEncode:"data"]=Ext.encode(b);
g.params=f
}else{g.jsonData=b
}var d=Ext.Ajax.request(g);
this.fireEvent("requestcreated",this,g,d)
}});
Ext.override(Ext.grid.GridView,{holdPosition:false,onLoad:function(){try{if(!this.holdPosition){this.scrollToTop()
}this.holdPosition=false
}catch(a){if(!!window.console&&!!window.console.log){window.console.log(a)
}}},getCell:function(c,a){var b=this.getRow(c);
return !!b?b.getElementsByTagName("td")[a]:null
},skipSyncFocusRow:false,getResolvedXY:function(b){if(!b){return null
}var a=b.cell,c=b.row;
if(a){return Ext.fly(a).getXY()
}else{return[this.el.getX(),Ext.fly(c).getY()]
}},syncFocusElImpl:function(d,a,c){var b=d;
if(!Ext.isArray(b)){d=Math.min(d,Math.max(0,this.getRows().length-1));
if(isNaN(d)){return
}b=this.getResolvedXY(this.resolveCell(d,a,c))
}this.focusEl.setXY(b||this.scroller.getXY())
},syncFocusEl:function(d,a,c){var b=this;
if(b.skipSyncFocusRow===true){window.setTimeout(function(){b.syncFocusElImpl.call(b,d,a,c)
},1)
}else{b.syncFocusElImpl(d,a,c)
}},focusCell:function(c,a,b){this.syncFocusElImpl(this.ensureVisible(c,a,b));
if(Ext.isGecko){this.focusEl.focus()
}else{this.focusEl.focus.defer(1,this.focusEl)
}},skipLayoutOnUpdateColumnHidden:false,updateColumnHidden:function(a,e){var d=this.getTotalWidth();
this.innerHd.firstChild.style.width=this.getOffsetWidth();
this.innerHd.firstChild.firstChild.style.width=d;
this.mainBody.dom.style.width=d;
var g=e?"none":"";
var c=this.getHeaderCell(a);
c.style.display=g;
var h=this.getRows(),k;
for(var b=0,f=h.length;
b<f;
b++){k=h[b];
k.style.width=d;
if(k.firstChild){k.firstChild.style.width=d;
k.firstChild.rows[0].childNodes[a].style.display=g
}}this.onColumnHiddenUpdated(a,e,d);
delete this.lastViewWidth;
if(!(this.skipLayoutOnUpdateColumnHidden===true)){this.layout()
}}});
Ext.override(Ext.grid.GridPanel,{processEvent:function(c,f){this.fireEvent(c,f);
var d=f.getTarget();
var b=this.view;
var h=b.findHeaderIndex(d);
if(h!==false){this.fireEvent("header"+c,this,h,f)
}else{var g=b.findRowIndex(d);
var a=b.findCellIndex(d);
if(g!==false){this.fireEvent("row"+c,this,g,f);
if(a!==false){this.fireEvent("cell"+c,this,g,a,f)
}}else{this.fireEvent("container"+c,this,f);
this.fireEvent(c,f)
}}}});
Ext.override(Ext.form.ComboBox,{doQuery:function(c,b){c=Ext.isEmpty(c)?"":c;
var a={query:c,forceAll:b,combo:this,cancel:false};
if(this.fireEvent("beforequery",a)===false||a.cancel){return false
}c=a.query;
b=a.forceAll;
if(b===true||(c.length>=this.minChars)){if(this.lastQuery!==c){this.lastQuery=c;
if(this.mode=="local"){this.selectedIndex=-1;
if(b){this.store.clearFilter()
}else{this.store.filter(this.displayField,c,true,false)
}this.onLoad()
}else{this.store.baseParams[this.queryParam]=c;
this.store.load({params:this.getParams(c)});
this.expand()
}}else{this.selectedIndex=-1;
this.onLoad()
}}}});
Ext.override(Ext.direct.RemotingProvider,{maxRetries:0});
Ext.override(Ext.grid.ColumnModel,{setHidden:function(b,d,a){var e=this.config[b];
if(e.hidden!==d){e.hidden=d;
this.totalWidth=null;
if(!(a===true)){this.fireEvent("hiddenchange",this,b,d)
}}}});
Ext.override(Ext.grid.RowSelectionModel,{selectRow:function(b,d,a){if(this.isLocked()||(b<0||b>=this.grid.store.getCount())||(d&&this.isSelected(b))){return
}var c=this.grid.store.getAt(b);
if(c&&this.fireEvent("beforerowselect",this,b,d,c)!==false){if(!d||this.singleSelect){this.clearSelections()
}this.selections.add(c);
this.last=this.lastActive=b;
if(!a){this.grid.getView().onRowSelect(b)
}if(!this.silent){this.fireEvent("rowselect",this,b,c);
this.fireEvent("selectionchange",this)
}}},deselectRow:function(b,a){if(this.isLocked()){return
}if(this.last==b){this.last=false
}if(this.lastActive==b){this.lastActive=false
}var c=this.grid.store.getAt(b);
if(c){this.selections.remove(c);
if(!a){this.grid.getView().onRowDeselect(b)
}if(!this.silent){this.fireEvent("rowdeselect",this,b,c);
this.fireEvent("selectionchange",this)
}}},clearSelections:function(a){if(this.isLocked()){return
}if(a!==true){var d=this.grid.store;
var b=this.selections;
var c,e;
this.silent=true;
b.each(function(f){e=d.indexOfId(f.id);
this.deselectRow(e);
c=f
},this);
this.silent=false;
b.clear();
this.last=false;
if(!!c){this.fireEvent("rowdeselect",this,e,c);
this.fireEvent("selectionchange",this)
}}else{this.selections.clear();
this.last=false
}}});
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.MessageBox=function(e){e=e||{};
var v,b,r,u,h,m,t,a,o,q,k,g,s,w,p,i="",d="",n=["ok","yes","no","cancel"];
var c=function(y){s[y].blur();
if(v.isVisible()){v.hide();
x();
Ext.callback(b.fn,b.scope||window,[y,w.dom.value,b],1)
}};
var x=function(){if(b&&b.cls){v.el.removeClass(b.cls)
}o.reset()
};
var f=function(A,y,z){if(b&&b.closable!==false){v.hide();
x()
}if(z){z.stopEvent()
}};
var l=function(y){var A=0,z;
if(!y){Ext.each(n,function(B){s[B].hide()
});
return A
}v.footer.dom.style.display="";
Ext.iterate(s,function(B,C){z=y[B];
if(z){C.show();
C.setText(Ext.isString(z)?z:Ext.MessageBox.buttonText[B]);
A+=C.getEl().getWidth()+15
}else{C.hide()
}});
return A
};
return{getDialog:function(z){if(!v){var B=[];
s={};
Ext.each(n,function(D){B.push(s[D]=new Ext.Button({text:this.buttonText[D],handler:c.createCallback(D),hideMode:"offsets"}))
},this);
var y=(Ext.get(e.container)||Ext.getBody()).dom;
var C=y.tagName.toLowerCase()!="body"?Ext.Window.extend({renderTo:y,beforeShow:function(){delete this.el.lastXY;
delete this.el.lastLT;
if(this.x===undefined||this.y===undefined){var D=this.el.getAlignToXY(this.container,"c-c");
var E=this.el.translatePoints(D[0],D[1]);
this.x=this.x===undefined?E.left:this.x;
this.y=this.y===undefined?E.top:this.y
}this.el.setLeftTop(this.x,this.y);
if(this.expandOnShow){this.expand(false)
}if(this.modal){if(this.container){this.container.addClass("x-body-masked")
}else{Ext.getBody().addClass("x-body-masked");
this.mask.setSize(Ext.lib.Dom.getViewWidth(true),Ext.lib.Dom.getViewHeight(true))
}this.mask.show()
}}}):Ext.Window;
v=new C({renderTo:y,autoCreate:true,title:z,resizable:false,constrain:true,constrainHeader:true,minimizable:false,maximizable:false,stateful:false,modal:true,shim:true,buttonAlign:"center",width:400,height:100,minHeight:80,plain:true,footer:true,closable:true,close:function(){if(b&&b.buttons&&b.buttons.no&&!b.buttons.cancel){c("no")
}else{c("cancel")
}},fbar:new Ext.Toolbar({items:B,enableOverflow:false})});
v.render(y);
v.getEl().addClass("x-window-dlg");
r=v.mask;
h=v.body.createChild({html:'<div class="ext-mb-icon"></div><div class="ext-mb-content"><span class="ext-mb-text"></span><br /><div class="ext-mb-fix-cursor"><input type="text" class="ext-mb-input" /><textarea class="ext-mb-textarea"></textarea></div></div>'});
k=Ext.get(h.dom.firstChild);
var A=h.dom.childNodes[1];
m=Ext.get(A.firstChild);
t=Ext.get(A.childNodes[2].firstChild);
t.enableDisplayMode();
t.addKeyListener([10,13],function(){if(v.isVisible()&&b&&b.buttons){if(b.buttons.ok){c("ok")
}else{if(b.buttons.yes){c("yes")
}}}});
a=Ext.get(A.childNodes[2].childNodes[1]);
a.enableDisplayMode();
o=new Ext.ProgressBar({renderTo:h});
h.createChild({cls:"x-clear"})
}return v
},updateText:function(B){if(!v.isVisible()&&!b.width){v.setSize(this.maxWidth,100)
}m.update(B?B+" ":"&#160;");
var z=d!=""?(k.getWidth()+k.getMargins("lr")):0,D=m.getWidth()+m.getMargins("lr"),A=v.getFrameWidth("lr"),C=v.body.getFrameWidth("lr"),y;
y=Math.max(Math.min(b.width||z+D+A+C,b.maxWidth||this.maxWidth),Math.max(b.minWidth||this.minWidth,p||0));
if(b.prompt===true){w.setWidth(y-z-A-C)
}if(b.progress===true||b.wait===true){o.setSize(y-z-A-C)
}if(Ext.isIE&&y==p){y+=4
}m.update(B||"&#160;");
v.setSize(y,"auto").center();
return this
},updateProgress:function(z,y,A){o.updateProgress(z,y);
if(A){this.updateText(A)
}return this
},isVisible:function(){return v&&v.isVisible()
},hide:function(){var y=v?v.activeGhost:null;
if(this.isVisible()||y){v.hide();
x();
if(y){v.unghost(false,false)
}}return this
},show:function(B){if(this.isVisible()){this.hide()
}b=B;
var C=this.getDialog(b.title||"&#160;");
C.setTitle(b.title||"&#160;");
var y=(b.closable!==false&&b.progress!==true&&b.wait!==true);
C.tools.close.setDisplayed(y);
w=t;
b.prompt=b.prompt||(b.multiline?true:false);
if(b.prompt){if(b.multiline){t.hide();
a.show();
if(a.dom){a.dom.style.display=""
}a.setHeight(Ext.isNumber(b.multiline)?b.multiline:this.defaultTextHeight);
w=a
}else{t.show();
if(t.dom){t.dom.style.display=""
}a.hide()
}}else{t.hide();
a.hide()
}w.dom.value=b.value||"";
if(b.prompt){C.focusEl=w
}else{var A=b.buttons;
var z=null;
if(A&&A.ok){z=s.ok
}else{if(A&&A.yes){z=s.yes
}}if(z){C.focusEl=z
}}if(Ext.isDefined(b.iconCls)){C.setIconClass(b.iconCls)
}this.setIcon(Ext.isDefined(b.icon)?b.icon:i);
p=l(b.buttons);
o.setVisible(b.progress===true||b.wait===true);
this.updateProgress(0,b.progressText);
this.updateText(b.msg);
if(b.cls){C.el.addClass(b.cls)
}C.proxyDrag=b.proxyDrag===true;
C.modal=b.modal!==false;
C.mask=b.modal!==false?r:false;
if(!C.isVisible()){if(v.container){v.container.dom.appendChild(v.el.dom)
}else{document.body.appendChild(v.el.dom)
}C.setAnimateTarget(b.animEl);
C.on("show",function(){if(y===true){C.keyMap.enable()
}else{C.keyMap.disable()
}},this,{single:true});
C.show(b.animEl)
}if(b.wait===true){o.wait(b.waitConfig)
}return this
},setIcon:function(y){if(!v){i=y;
return
}i=undefined;
if(y&&y!=""){k.removeClass("x-hidden");
k.replaceClass(d,y);
h.addClass("x-dlg-icon");
d=y
}else{k.replaceClass(d,"x-hidden");
h.removeClass("x-dlg-icon");
d=""
}return this
},progress:function(A,z,y){this.show({title:A,msg:z,buttons:false,progress:true,closable:false,minWidth:this.minProgressWidth,progressText:y});
return this
},wait:function(A,z,y){this.show({title:z,msg:A,buttons:false,closable:false,wait:true,modal:true,minWidth:this.minProgressWidth,waitConfig:y});
return this
},alert:function(B,A,z,y){this.show({title:B,msg:A,buttons:this.OK,fn:z,scope:y,minWidth:this.minWidth});
return this
},confirm:function(B,A,z,y){this.show({title:B,msg:A,buttons:this.YESNO,fn:z,scope:y,icon:this.QUESTION,minWidth:this.minWidth});
return this
},prompt:function(D,C,A,z,y,B){this.show({title:D,msg:C,buttons:this.OKCANCEL,fn:A,minWidth:this.minPromptWidth,scope:z,prompt:true,multiline:y,value:B});
return this
},OK:{ok:true},CANCEL:{cancel:true},OKCANCEL:{ok:true,cancel:true},YESNO:{yes:true,no:true},YESNOCANCEL:{yes:true,no:true,cancel:true},INFO:"ext-mb-info",WARNING:"ext-mb-warning",QUESTION:"ext-mb-question",ERROR:"ext-mb-error",defaultTextHeight:75,maxWidth:e.maxWidth||600,minWidth:100,minProgressWidth:250,minPromptWidth:250,buttonText:{ok:"OK",cancel:"Cancel",yes:"Yes",no:"No"}}
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.Window=function(a){return Ext.Window.extend({renderTo:a,constrain:true,beforeShow:function(){delete this.el.lastXY;
delete this.el.lastLT;
if(this.x===undefined||this.y===undefined){var b=this.el.getAlignToXY(this.container,"c-c");
var c=this.el.translatePoints(b[0],b[1]);
this.x=this.x===undefined?c.left:this.x;
this.y=this.y===undefined?c.top:this.y
}this.el.setLeftTop(this.x,this.y);
if(this.expandOnShow){this.expand(false)
}if(this.modal){if(this.container){this.container.addClass("x-body-masked")
}else{Ext.getBody().addClass("x-body-masked");
this.mask.setSize(Ext.lib.Dom.getViewWidth(true),Ext.lib.Dom.getViewHeight(true))
}this.mask.show()
}}})
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.Consts={pixlrSupportedTypes:";jpg;jpeg;png;gif;bmp;psd;pxd;",adobeImageSupportedTypes:";jpg;jpeg;jpe;jfif;png;bmp;dib;gif;svg;",imagesFileTypes:";jpg;jpeg;jpe;jfif;bmp;dib;gif;png;tif;tiff;ico;svg;",googleEditFormatsForConvert:";doc;docm;xls;xlsm;ppt;pps;pptm;ppsm;ppsx;",msooEditFormatsForConvert:";doc;xls;ppt;pps;",googleDocSupportedtypes:";doc;docx;docm;ppt;pps;pptx;ppsx;pptm;ppsm;xls;xlsx;xlsm;xlsb;rtf;txt;css;pdf;php;js;c;cs;cpp;h;hpp;mml;svg;tif;tiff;eps;ps;pages;",boxViewSupportedtypes:";pdf;doc;docx;ppt;pptx;xls;xlsx;txt;py;js;xml;css;md;pl;c;m;json;",owaSupportedtypes:";doc;docx;docm;dotm;dotx;xls;xlsx;xlsb;xlsm;pptx;ppsx;ppt;pps;pptm;potm;ppam;potx;ppsm;",msoTypesOnlyForSharePointLauncher:"pub",msoExcelTypes:"csv,dbf,dif,ods,prn,slk,xla,xlam,xls,xlsb,xlsm,xlsx,xlt,xltm,xltx,xlw,xml,xps",msoOutlookTypes:"obi,oft,ost,prf,pst,msg,oab,iaf",msoPowerTypes:"emf,odp,pot,potm,potx,ppa,ppam,pps,ppsm,ppsx,ppt,pptm,pptx,rtf,thmx,tif,tiff,wmf,xml,xps",msoWordTypes:"doc,docm,docx,dot,dotm,dotx,htm,html,mht,mhtml,odt,rtf,txt,wps,xml,xps",msoFrontPageTypes:"btr,dwt,elm,fwp,htx,mso",msoTypesForViewInBrowser:";txt;xml;tif;tiff;docx;xlsx;pptx;docm;xlsm;pptm;ppsx;ppsm;",msoInfoPathTypes:"xsn,xsf",msoPubTypes:"pub",msoVisioTypes:"vstx,vstm,vst,vssx,vssm,vss,vsl,vsdx,vsdm,vsd,vdw",msoProjectTypes:"mpp,mpt",forbiddenTypesForViewInBrowser:";htm;html;mht;mhtml;js;vbs;zip;exe;com;bat;cmd;",oooSupportedtypes:";sxd;sxm;sxi;sxc;sxw;odb;odf;odt;ott;oth;and;odm;stw;sxg;doc;dot;xml;docx;docm;dotx;dotm;wpd;wps;rtf;txt;csv;sdw;sgl;vor;uot;uof;jtd;jtt;hwp;602;pdb;psw;ods;ots;stc;xls;xlw;xlt;xlsx;xlsm;xltx;xltm;xlsb;wk1;wks;123;dif;csv;sdc;dbf;slk;uos;pxl;wb2;odp;odg;std;otp;otg;sti;ppt;pps;pot;pptx;pptm;potx;potm;ppsx;sda;sdd;sdp;uop;cgm;bmp;jpeg;jpg;pcx;psd;svg;wmf;dxf;met;pgm;ras;svm;xbm;emf;pbm;plt;tga;xpm;eps;pcd;png;tif;tiff;gif;pct;ppm;sgf;mml;",flowplayerFileTypes:";flv;mp4;f4v;",shareCadOrgSupportedTypes:";dwg;dxf;dwf;hpgl;plt;cgm;pdf;svg;emf;wmf;step;stp;iges;igs;brep;stl;sat;png;bmp;jpg;gif;tiff;tga;cal;",videoConvertFileTypes:";4xm;iff;iss;mtv;roq;aac;ac3;act;adf;aea;aiff;alaw;amr;anm;apc;ape;applehttp;asf;ass;au;avi;avs;bethsoftvid;bfi;bin;bink;bit;c93;caf;cavsvideo;cdg;daud;dfa;dirac;dnxhd;dshow;dsicin;dts;dv;dxa;ea;ea_cdata;eac3;f32be;f32le;f64be;f64le;ffm;ffmetadata;film_cpk;filmstrip;flac;flic;flv;g722;gsm;gxf;h261;h263;h264;idcin;idf;image2;image2pipe;ingenient;ipmovie;iv8;ivf;jv;latm;lavfi;lmlm4;loas;lxf;m4v;matroska;webm;microdvd;mjpeg;mlp;mm;mmf;mov;mp4;m2v;m4a;3gp;3g2;mj2;mpc;mpc8;mpg;mpeg;mpegts;mpegtsraw;mpegvideo;msnwctcp;mulaw;mvi;mxf;mxg;nc;nsv;nut;nuv;ogg;ogv;oma;pmp;psxstr;pva;qcp;r3d;rawvideo;rl2;rm;rpl;rso;rtp;rtsp;s16be;s16le;s24be;s24le;s32be;s32le;s8;sap;sdp;shn;siff;smk;sol;sox;spdif;srt;swf;thp;tiertexseq;tmv;truehd;tta;tty;txd;u16be;u16le;u24be;u24le;u32be;u32le;u8;vc1;vc1test;vfwcap;vmd;voc;vqf;w64;wc3movie;wsaud;wsvqa;wtv;wv;xa;xbin;xmv;xwma;yop;yuv4mpegpipe;wmv;",html5AudioFileTypes:";3gp;aac;act;aif;aiff;alac;amr;ape;atrac;au;awb;dct;dss;dvf;iklax;ivs;flac;gsm;m4p;mid;midi;mmf;mp3;mpc;mpw;msv;mxp4;ogg;ra;ram;raw;tta;vox;wav;wma;",ajaxRequestTimeout:7200000,gridRequestTimeout:240000,zipRequestTimeout:3600000,uploadSilverlightText:"<div id='{0}_ultimateUploaderRemarkSize' style='margin-top:4px;margin-left:4px;'>{1}</div><object id='{0}_ultimateUploader' data='data:application/x-silverlight-2,' type='application/x-silverlight-2' width='384' height='233'><param name='source' value='{2}Uploaders/UltimateUploader.xap' /><param name='background' value='#FFFFFF' /><param name='minRuntimeVersion' value='4.0.50826.0' /><param name='autoUpgrade' value='true' /><param name='windowless' value='false' /><param name='onLoad' value='{0}_onSilverlightLoaded' /><param name='initParams' value='UploadHandler={3}Handlers/SilverlightUpload.ashx,AvailableView=Grid,ShowHelpButton=false,AllowFileComments=false,BackColor=#FFFFFF,LicenseKey=007171288621221222547282313621191371610182' /><a href='http://go.microsoft.com/fwlink/?LinkID=149156&v=4.0.50826.0' style='text-decoration: none'><img src='http://go.microsoft.com/fwlink/?LinkId=161376' alt='Get Microsoft Silverlight' style='border-style: none' /></a></object>",uploadFlashText:"<div id='{0}_flashUploaderRemarkSize' style='margin-top:4px;margin-left:4px;'>{1}</div><OBJECT id='{0}_MultiPowUpload' codeBase='http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0' width='384' height='233' classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' VIEWASTEXT><PARAM NAME='FlashVars' VALUE='uploadUrl={2}Handlers/FlashUpload.ashx&backgroundColor=#DFE8F6&useExternalInterface=true&serialNumber=00817212818713928592547173282214927171810200&language.source={2}Localization/Uploaders/Flash/Language_{3}.xml&javaScriptEventsPrefix=HttpCommander.Main.FileManagers[\"{0}\"].MultiPowUpload'> <PARAM NAME='BGColor' VALUE='#FFFFFF'><PARAM NAME='Movie' VALUE='{2}Uploaders/ElementITMultiPowUpload.swf'><PARAM NAME='Src' VALUE='{2}Uploaders/ElementITMultiPowUpload.swf'><PARAM NAME='WMode' VALUE='window'><embed wmode='transparent' bgcolor='#FFFFFF' id='{0}_MultiPowUpload' name='{0}_MultiPowUpload' src='{2}Uploaders/ElementITMultiPowUpload.swf' quality='high' pluginspage='http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash' type='application/x-shockwave-flash' width='384' height='233' flashvars='uploadUrl={2}Handlers/FlashUpload.ashx&backgroundColor=#DFE8F6&useExternalInterface=true&serialNumber=00817212818713928592547173282214927171810200&language.source={2}Localization/Uploaders/Flash/Language_{3}.xml&javaScriptEventsPrefix=HttpCommander.Main.FileManagers[\"{0}\"].MultiPowUpload'></embed></OBJECT>",uploadAppletText:"<applet codebase='{0}' code='com.elementit.JavaPowUpload.Manager' archive='Uploaders/JavaPowUpload.jar, Uploaders/commons-logging-1.1.jar, Uploaders/commons-httpclient-3.1-rc1.jar, Uploaders/commons-codec-1.3.jar' width='376' height='207' name='{1}_javaPowUpload' id='{1}_javaPowUpload' mayscript='true' alt='JavaPowUpload by www.element-it.com' VIEWASTEXT><param name='Common.SerialNumber' value='007244225132616185231718418015911722510183'><param name='Common.UseLiveConnect' value='true'><param name='Common.DetailsArea.Visible' value='true'><param name='Common.InternationalFile' value='Localization/Uploaders/Java/Language_{2}.xml'><param name='Upload.HttpUpload.FieldName.FilePath' value='SelectedPath_#COUNTER#'><param name='Upload.HttpUpload.MaxFilesCountPerRequest' value='50'><param name='Upload.HttpUpload.ExpectContinueHeader' value='false'><param name='Upload.HttpUpload.SendTestRequest' value='true'><param name='Common.UploadMode' value='true'><param name='progressbar' value='true'><param name='Common.ListArea.BackgroundImageUrl' value='/icons/drop.png'><param name='boxmessage' value='Loading JavaPowUpload Applet ...'><param name='Upload.UploadUrl' value='Handlers/JavaUpload.ashx'><param name='Common.JavaScriptEventsPrefix' value='JavaPowUpload_'><param name='Common.JavaScriptEventsContext' value='HttpCommander.Main.FileManagers[\"{1}\"]'><span style='border:1px solid #FF0000;display:block;padding:5px;margin-top:10px;margin-bottom:10px;text-align:left; background: #FDF2F2;color:#000;'>You should <b>enable applets</b> running at browser and to have the <b>Java</b> (JRE) version &gt;= 1.5.<br />If applet is not displaying properly, please check <a target='_blank' href='http://java.com/en/download/help/testvm.xml' title='Check Java applets'>additional configurations</a></span></applet>",uploadAppletTextEx:"<applet codebase='{0}' code='com.elementit.JavaPowUpload.Manager' archive='Uploaders/JavaPowUpload.jar, Uploaders/commons-logging-1.1.jar, Uploaders/commons-httpclient-3.1-rc1.jar, Uploaders/commons-codec-1.3.jar' width='376' height='207' name='{1}_javaPowUpload' id='{1}_javaPowUpload' mayscript='true' alt='JavaPowUpload by www.element-it.com' VIEWASTEXT><param name='Common.SerialNumber' value='007244225132616185231718418015911722510183'><param name='Common.UseLiveConnect' value='true'><param name='Common.DetailsArea.Visible' value='true'><param name='Common.InternationalFile' value='Localization/Uploaders/Java/Language_{2}.xml'><param name='Upload.HttpUpload.FieldName.FilePath' value='SelectedPath_#COUNTER#'><param name='Upload.HttpUpload.MaxFilesCountPerRequest' value='-1'><param name='Upload.HttpUpload.ExpectContinueHeader' value='false'><param name='Upload.HttpUpload.SendTestRequest' value='true'><param name='Common.UploadMode' value='true'><param name='progressbar' value='true'><param name='boxmessage' value='Loading JavaPowUpload Applet ...'><param name='Common.ListArea.BackgroundImageUrl' value='/icons/drop.png'><param name='Upload.UploadUrl' value='Handlers/JavaUploadEx.ashx'><param name='Common.JavaScriptEventsPrefix' value='JavaPowUpload_'><param name='Common.JavaScriptEventsContext' value='HttpCommander.Main.FileManagers[\"{1}\"]'><param name='Upload.HttpUpload.ChunkedUpload.Enabled' value='true'><param name='Upload.HttpUpload.ChunkedUpload.ChunkSize' value='-1'><param name='Upload.HttpUpload.ChunkedUpload.MaxChunkSize' value='2097152'><param name='Common.RetryWhenConnectionLost' value='true'> <param name='Common.RetryWhenConnectionLost.CheckInterval' value='1'><param name='Common.RetryWhenConnectionLost.CheckTimeout' value='600'><span style='border:1px solid #FF0000;display:block;padding:5px;margin-top:10px;margin-bottom:10px;text-align:left; background: #FDF2F2;color:#000;'>You should <b>enable applets</b> running at browser and to have the <b>Java</b> (JRE) version &gt;= 1.5.<br />If applet is not displaying properly, please check <a target='_blank' href='http://java.com/en/download/help/testvm.xml' title='Check Java applets'>additional configurations</a></span></applet>",downloadAppletText:"<applet codebase='{0}' code='com.elementit.JavaPowUpload.Manager' archive='Uploaders/JavaPowUpload.jar, Uploaders/commons-logging-1.1.jar, Uploaders/commons-httpclient-3.1-rc1.jar, Uploaders/commons-codec-1.3.jar' width='344' height='206' name='{1}_javaPowDownload' id='{1}_javaPowDownload' mayscript='true' alt='JavaPowUpload by www.element-it.com' VIEWASTEXT><param name='Common.SerialNumber' value='007244225132616185231718418015911722510183'><param name='Common.UseLiveConnect' value='true'><param name='Common.DownloadMode' value='true'><param name='Common.InternationalFile' value='Localization/Uploaders/Java/Language_{2}.xml'><param name='progressbar' value='true'><param name='boxmessage' value='Loading JavaPowUpload Applet ...'><param name='Download.DataURL' value='Handlers/Download.ashx'><param name='Download.UseHeadMethodToGetFileLength' value='true'><param name='Common.JavaScriptEventsPrefix' value='JavaPowDownload_'><param name='Common.JavaScriptEventsContext' value='HttpCommander.Main.FileManagers[\"{1}\"]'><span style='border:1px solid #FF0000;display:block;padding:5px;margin-top:10px;margin-bottom:10px;text-align:left; background: #FDF2F2;color:#000;'>You should <b>enable applets</b> running at browser and to have the <b>Java</b> (JRE) version &gt;= 1.5.<br />If applet is not displaying properly, please check <a target='_blank' href='http://java.com/en/download/help/testvm.xml' title='Check Java applets'>additional configurations</a></span></applet>",browserContextMenuTypes:["textarea","text"],needInstallAdobeFlashPlayerMessage:"<table width='100%' cellpadding='0' cellspacing='0' border='0' align='center'><tr><td><span style='border:1px solid #FF0000;display:block;padding:5px;background:#FDF2F2;color:#000;'>You should install and-or enable in browser a <a target='_blank' href='http://www.adobe.com/go/getflashplayer'><b>Adobe Flash Player</b></a> of the last version.</span></td></tr></table>"};
HttpCommander.Lib.Consts.msoSupportedtypes=";"+(HttpCommander.Lib.Consts.msoTypesOnlyForSharePointLauncher+";"+HttpCommander.Lib.Consts.msoExcelTypes+";"+HttpCommander.Lib.Consts.msoOutlookTypes+";"+HttpCommander.Lib.Consts.msoPowerTypes+";"+HttpCommander.Lib.Consts.msoWordTypes+";"+HttpCommander.Lib.Consts.msoFrontPageTypes+";"+HttpCommander.Lib.Consts.msoInfoPathTypes+";"+HttpCommander.Lib.Consts.msoPubTypes+";"+HttpCommander.Lib.Consts.msoVisioTypes+";"+HttpCommander.Lib.Consts.msoProjectTypes).replace(/,/g,";")+";";
HttpCommander.Lib.Consts.html5VideoFileTypes=HttpCommander.Lib.Consts.videoConvertFileTypes;
HttpCommander.Lib.Consts.ActiveXMSOfficeApplications={Word:{app:"Word.Application",obj:"Documents"},Excel:{app:"Excel.Application",obj:"Workbooks"},PowerPoint:{app:"PowerPoint.Application",obj:"Presentations"}};
HttpCommander.Lib.Consts.CloudNames={google:"Google Drive",dropbox:"Dropbox",onedrive:"OneDrive",box:"Box",onedriveforbusiness:"OneDrive for Business",office365:"Office 365"};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.Utils={getXhrInstance:(function(){var b=[function(){return new XMLHttpRequest()
},function(){return new ActiveXObject("MSXML2.XMLHTTP.7.0")
},function(){return new ActiveXObject("MSXML2.XMLHTTP.6.0")
},function(){return new ActiveXObject("MSXML2.XMLHTTP.5.0")
},function(){return new ActiveXObject("MSXML2.XMLHTTP.4.0")
},function(){return new ActiveXObject("MSXML2.XMLHTTP.3.0")
},function(){return new ActiveXObject("MSXML2.XMLHTTP")
},function(){return new ActiveXObject("Microsoft.XMLHTTP")
}],c=0,a=b.length,f;
for(;
c<a;
++c){try{f=b[c];
f();
break
}catch(d){}}return f
})(),getPopupProps:function(b,a){if(!Ext.isNumber(b)||b<=0){b=900
}if(!Ext.isNumber(a)||a<=0){a=600
}var d=((screen.width/2)-(b/2)),c=(screen.height-a)/4;
return"scrollbars=yes,menubar=no,toolbar=no,location=no,status=no,resizable=yes,directories=no,width="+b+",height="+a+",top="+c+",left="+d
},getChar:function(a){if(!a){return null
}if(Ext.isEmpty(a.which)){if(a.charCode!=0){if(a.charCode<32){return null
}return String.fromCharCode(a.charCode)
}if(a.keyCode<32){return null
}return String.fromCharCode(a.keyCode)
}if(a.which!=0&&a.charCode!=0){if(a.which<32){return null
}return String.fromCharCode(a.which)
}return null
},checkBracketsAndHtmlEncode:function(a){return/(>|<|'|")/g.test(a)?Ext.util.Format.htmlEncode(a):a
},getAndHtmlEncodeMessage:function(c,e,b){var a=b===2?HttpCommander.Lib.Utils.checkBracketsAndHtmlEncode:b===1?Ext.util.Format.htmlEncode:function(f){return f
};
var d=null;
if(c){d=c.message;
if(!d||d==""){d=c.msg
}if(!d||d==""){d=c.error
}if(!d||d==""){d=c.errors
}if(!d||d==""){d=e
}}if(!d){d=e
}return a(String(d))
},checkDirectHandlerResult:function(e,d,f,b,c,a){f.hide();
if(typeof e=="undefined"||!e){f.show({title:b.locData.CommonErrorCaption,msg:HttpCommander.Lib.Utils.getAndHtmlEncodeMessage(d,b.locData.UploadFromUrlUnknownResponse),closable:true,modal:true,buttons:f.CANCEL,icon:f.ERROR});
return false
}if((typeof e.success!="undefined"&&!e.success)||(typeof e.status!="undefined"&&e.status!="success")){if(typeof a=="function"){a()
}f.show({title:b.locData.CommonErrorCaption,msg:HttpCommander.Lib.Utils.getAndHtmlEncodeMessage(e,b.locData.UploadFromUrlUnknownResponse,c),closable:true,modal:true,buttons:f.CANCEL,icon:f.ERROR});
return false
}return true
},getIconPath:function(c,b){var a=c.htcConfig||c.htcCfg||(Ext.isFunction(c.getHtcConfig)?c.getHtcConfig():c);
return a.relativePath+a.iconSet.path+b+(b&&b.indexOf(".gif")<0?a.iconSet.ext:"")
},getScriptSource:function(b){b=b||document.getElementsByTagName("script");
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
},flashPlayerIsSupported:function(){if(typeof navigator.plugins!="undefined"&&typeof navigator.plugins["Shockwave Flash"]=="object"){if(typeof navigator.mimeTypes!="undefined"&&navigator.mimeTypes["application/x-shockwave-flash"]&&navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin){return true
}}else{if(typeof window.ActiveXObject!="undefined"||HttpCommander.Lib.Utils.browserIs.ie11up){try{if(new ActiveXObject("ShockwaveFlash.ShockwaveFlash")){return true
}}catch(a){}}}return false
},webglAvailable:function(){try{var a=document.createElement("canvas");
return !!window.WebGLRenderingContext&&(a.getContext("webgl")||a.getContext("experimental-webgl"))
}catch(b){return false
}},offsetPosition:function(a){var b=offsetTop=0;
try{do{b+=a.offsetLeft;
offsetTop+=a.offsetTop
}while(a=a.offsetParent)
}catch(c){}return[b,offsetTop]
},removeElementFromDOM:function(a){var b=document.getElementById(a);
if(b){try{b.parentNode.removeChild(b);
return true
}catch(c){}}return false
},addHandler:function(a,c,b){if(!!a.addEventListener){a.addEventListener(c.toLowerCase(),b,false)
}else{if(!!a.attachEvent){a.attachEvent("on"+c.toLowerCase(),b)
}else{a["on"+c.toLowerCase()]=b
}}},preventSelection:function(b,a){HttpCommander.Lib.Utils.addHandler(b,"selectstart",function(d){d=d||window.event;
var c=d.target||d.srcElement;
try{if(c&&c.tagName&&c.tagName.match(/INPUT|TEXTAREA/i)){return
}if(d.preventDefault){d.preventDefault()
}if(d.stopPropagation){d.stopPropagation()
}if(d.returnValue){window.event.returnValue=false
}if(d.stopEvent){d.stopEvent()
}if(window.getSelection){try{window.getSelection().removeAllRanges()
}catch(f){}}else{if(document.selection&&document.selection.clear){document.selection.clear()
}}return false
}catch(f){if(typeof a=="function"){a(f)
}else{throw f
}}})
},queryString:function(d){d=String(d||"");
if(d==""){return""
}d=d.toLowerCase();
var c=window.location.search.substr(1).split("&");
for(var b=0;
b<c.length;
b++){var a=c[b].split("=");
if(a.length>1&&decodeURIComponent(a[0]).toLowerCase()==d){return decodeURIComponent(a[1])
}}return""
},checkAndGetNewExtensionConvertedFromGoogle:function(c){var b="";
if(Ext.isEmpty(c)){return b
}var a=c.toLowerCase();
if(HttpCommander.Lib.Consts.googleEditFormatsForConvert.indexOf(";"+a+";")>=0){if(a.indexOf("pp")==0){b="pptx"
}else{if(a.length==3){b=a+"x"
}else{b=a.replace("m","x")
}}}return b
},checkAndGetNewExtensionConvertedFromMSOO:function(c){var b="";
if(Ext.isEmpty(c)){return b
}var a=c.toLowerCase();
if(HttpCommander.Lib.Consts.msooEditFormatsForConvert.indexOf(";"+a+";")>=0){b=a+"x";
if(b=="ppsx"){b="pptx"
}}return b
},getFileExtension:function(a){var b="";
if(typeof a=="undefined"||!a){return b
}var c=a.lastIndexOf(".");
if(c>=0){b=a.substring(c+1,a.length).toLowerCase()
}return b
},getFileName:function(b){if(b==""){return""
}var a=b.lastIndexOf("/");
if(a<0){return b
}else{return b.substr(a+1)
}},getTodayDate:function(){var a=new Date();
a.setHours(0);
a.setMinutes(0);
a.setSeconds(0);
a.setMilliseconds(0);
return a
},getNextYearDate:function(){var a=new Date();
a.setFullYear(a.getFullYear()+1);
a.setHours(0);
a.setMinutes(0);
a.setSeconds(0);
a.setMilliseconds(0);
return a
},getXTypeColumn:function(a){switch(a){case"int":case"float":return"numbercolumn";
case"date":return"datecolumn";
case"bool":case"boolean":if(Ext.grid.Column.types.checkcolumn){return"checkcolumn"
}else{return"booleancolumn"
}default:return"gridcolumn"
}},getAlignColumn:function(a){switch(a){case"int":case"float":return"right";
case"bool":case"boolean":return"center";
default:return"left"
}},browserIs:new (function(){try{this.copyToClipboard=false;
try{var p=!!document.queryCommandSupported;
this.copyToClipboard=p&&!!document.queryCommandSupported("copy")
}catch(f){}this.firefox36up=false;
this.firefox35up=false;
var g=navigator.userAgent.toLowerCase();
this.osver=1;
if(g){var o=g.substring(g.indexOf("windows ")+11);
this.osver=parseFloat(o)
}this.major=parseInt(navigator.appVersion);
this.nav=((g.indexOf("mozilla")!=-1)&&((g.indexOf("spoofer")==-1)&&(g.indexOf("compatible")==-1)));
this.nav6=this.nav&&(this.major==5);
this.nav6up=this.nav&&(this.major>=5);
this.nav7up=false;
var v;
if(this.nav6up){v=g.indexOf("netscape/");
if(v>=0){this.nav7up=parseInt(g.substring(v+9))>=7
}}this.ie=(g.indexOf("msie")!=-1);
this.aol=this.ie&&g.indexOf(" aol ")!=-1;
if(this.ie){var q=g.substring(g.indexOf("msie ")+5);
this.iever=parseInt(q);
this.verIEFull=parseFloat(q)
}else{this.iever=0
}this.ie4up=this.ie&&(this.major>=4);
this.ie5up=this.ie&&(this.iever>=5);
this.ie55up=this.ie&&(this.verIEFull>=5.5);
this.ie6up=this.ie&&(this.iever>=6);
this.ie7down=this.ie&&(this.iever<=7);
this.ie7up=this.ie&&(this.iever>=7);
this.ie8standard=this.ie&&document.documentMode&&(document.documentMode==8);
this.ie9up=this.ie&&(this.iever>=9);
this.ie9standard=this.ie&&document.documentMode&&(document.documentMode==9);
this.ie10up=this.ie&&(this.iever>=10);
this.ie10standard=this.ie&&document.documentMode&&(document.documentMode==10);
this.ie11up=document.documentMode&&(document.documentMode>=11);
if(!this.ie&&this.ie11up){this.ie=true;
this.iever=document.documentMode
}var l=g.indexOf("edge/");
this.edge=l>=0;
this.edgeVer=0;
this.edge10586up=false;
if(this.edge){this.edgeVer=parseFloat(g.substring(l+5));
this.edge10586up=(this.edgeVer>=13.10586)
}this.winnt=((g.indexOf("winnt")!=-1)||(g.indexOf("windows nt")!=-1));
this.win32=((this.major>=4)&&(navigator.platform=="Win32"))||(g.indexOf("win32")!=-1)||(g.indexOf("32bit")!=-1);
this.win64bit=(g.indexOf("win64")!=-1)||(g.indexOf("wow64")!=-1);
this.win=this.winnt||this.win32||this.win64bit;
this.mac=(g.indexOf("mac")!=-1);
this.ipad=(g.indexOf("ipad")!=-1);
this.iphone=(g.indexOf("iphone")!=-1);
this.ipod=(g.indexOf("ipod")!=-1);
this.ios=this.ipad||this.iphone||this.ipod;
this.ios6up=false;
if(this.ios){var y=0;
var h=/os\s+(\d+)(_\d+)*\s+like\s+mac\s+os\s+x/i;
var t=h.exec(g);
if(t&&t.length>0&&t[1]){y=parseInt(t[1])
}this.ios6up=y>=6
}this.ubuntu=(g.indexOf("ubuntu")!=-1);
this.w3c=this.nav6up;
this.safari=(g.indexOf("webkit")!=-1);
this.safari125up=false;
this.safari3up=false;
this.safari5up=false;
this.safari7up=false;
this.safari8up=false;
if(this.safari&&this.major>=5){v=g.indexOf("webkit/");
if(v>=0){this.safari125up=parseInt(g.substring(v+7))>=125
}var r=g.indexOf("version/");
if(r>=0){var x=parseInt(g.substring(r+8));
this.safari3up=(x>=3);
this.safari5up=(x>=5);
this.safari7up=(x>=7);
this.safari8up=(x>=8)
}}this.firefox=this.nav&&(g.indexOf("firefox")!=-1);
this.firefox3up=false;
this.firefox35up=false;
this.firefox36up=false;
this.firefox4up=false;
this.firefox450up=false;
if(this.firefox&&this.major>=5){var n=g.indexOf("firefox/");
if(n>=0){var u=g.substring(n+8);
var c=parseInt(u);
this.firefox3up=c>=3;
this.firefox4up=c>=4;
var d=parseFloat(u);
this.firefox35up=d>=3.5;
this.firefox36up=d>=3.6;
this.firefox450up=c>=45
}}this.chrome=this.nav&&(g.indexOf("chrome")!=-1);
this.chrome2up=false;
this.chrome3up=false;
this.chrome6up=false;
this.chrome11up=false;
this.chrome12up=false;
this.chrome18up=false;
this.chrome42up=false;
if(this.chrome){var i=g.indexOf("chrome/");
if(i>=0){var s=g.substring(i+7);
var b=parseInt(s);
this.chrome2up=b>=2;
this.chrome3up=b>=3;
this.chrome6up=b>=6;
this.chrome11up=b>=11;
this.chrome12up=b>=12;
this.chrome18up=b>=18;
this.chrome42up=b>=42
}}this.dndFolders=this.firefox450up||(this.chrome11up&&!this.edge);
this.opera=g.indexOf("opera")!=-1;
this.opera11up=false;
this.opera15up=false;
if(this.opera){var k=g.indexOf("version/");
if(k>=0){var m=g.substring(k+8);
this.opera11up=parseFloat(m)>=11;
this.opera15up=parseFloat(m)>=15
}}this.yandex=this.nav&&(g.indexOf("yabrowser")!=-1);
this.chunkedUpload=false;
try{var a=new FileReader();
if(a.readAsBinaryString){this.chunkedUpload=true
}}catch(f){}if(!this.chunkedUpload){try{if(window.File.slice){this.chunkedUpload=true
}}catch(f){}}if(!this.chunkedUpload){try{if(window.File.webkitSlice){this.chunkedUpload=true
}}catch(f){}}if(!this.chunkedUpload){try{if(window.File.mozSlice){this.chunkedUpload=true
}}catch(f){}}if(!this.chunkedUpload){try{if(window.Blob&&window.Blob().slice){this.chunkedUpload=true
}}catch(f){}}}catch(w){}})(),isChunkedUploadSupported:function(){var b=true,a=null,d=null;
try{a=HttpCommander.Lib.Utils.getXhrInstance();
b=(a.sendAsBinary||a.upload||a.send)?true:false;
try{d=new window.FormData()
}catch(c){b=false
}}catch(e){b=false
}finally{if(!!d){delete d
}if(!!a){delete a
}}if(b){b=HttpCommander.Lib.Utils.browserIs.chunkedUpload
}return b
},Base64:(function(){var b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var a=function(e){e=e.replace(/\r\n/g,"\n");
var d="";
for(var g=0;
g<e.length;
g++){var f=e.charCodeAt(g);
if(f<128){d+=String.fromCharCode(f)
}else{if((f>127)&&(f<2048)){d+=String.fromCharCode((f>>6)|192);
d+=String.fromCharCode((f&63)|128)
}else{d+=String.fromCharCode((f>>12)|224);
d+=String.fromCharCode(((f>>6)&63)|128);
d+=String.fromCharCode((f&63)|128)
}}}return d
};
var c=function(d){var e="";
var f=0;
var g=c1=c2=0;
while(f<d.length){g=d.charCodeAt(f);
if(g<128){e+=String.fromCharCode(g);
f++
}else{if((g>191)&&(g<224)){c2=d.charCodeAt(f+1);
e+=String.fromCharCode(((g&31)<<6)|(c2&63));
f+=2
}else{c2=d.charCodeAt(f+1);
c3=d.charCodeAt(f+2);
e+=String.fromCharCode(((g&15)<<12)|((c2&63)<<6)|(c3&63));
f+=3
}}}return e
};
return{encode:function(f){var d="";
var o,m,k,n,l,h,g;
var e=0;
f=a(f);
while(e<f.length){o=f.charCodeAt(e++);
m=f.charCodeAt(e++);
k=f.charCodeAt(e++);
n=o>>2;
l=((o&3)<<4)|(m>>4);
h=((m&15)<<2)|(k>>6);
g=k&63;
if(isNaN(m)){h=g=64
}else{if(isNaN(k)){g=64
}}d=d+b.charAt(n)+b.charAt(l)+b.charAt(h)+b.charAt(g)
}return d
},decode:function(f){if(f==null){return""
}var d="";
var o,m,k;
var n,l,h,g;
var e=0;
f=f.replace(/[^A-Za-z0-9\+\/\=]/g,"");
while(e<f.length){n=b.indexOf(f.charAt(e++));
l=b.indexOf(f.charAt(e++));
h=b.indexOf(f.charAt(e++));
g=b.indexOf(f.charAt(e++));
o=(n<<2)|(l>>4);
m=((l&15)<<4)|(h>>2);
k=((h&3)<<6)|g;
d=d+String.fromCharCode(o);
if(h!=64){d=d+String.fromCharCode(m)
}if(g!=64){d=d+String.fromCharCode(k)
}}d=c(d);
return d
}}
})(),getCookie:function(a,c){var d=document.cookie.match(new RegExp("(?:^|; )"+a.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g,"\\$1")+"=([^;]*)"));
var b=d?decodeURIComponent(d[1]):undefined;
if(typeof b=="undefined"){return undefined
}if(c){return b
}try{return HttpCommander.Lib.Utils.Base64.decode(b)
}catch(f){return b
}},setCookie:function(a,i,h){h=h||{};
var e=h.expires;
var g=new Date();
if(typeof e=="number"&&e){g.setTime(g.getTime()+e*1000);
e=h.expires=g
}else{e=h.expires=new Date(g.getFullYear()+10,g.getMonth(),g.getDate())
}if(e&&e.toUTCString){h.expires=e.toUTCString()
}if(typeof i=="string"){i=HttpCommander.Lib.Utils.Base64.encode(i)
}var b=a+"="+i;
var k=true;
for(var f in h){if(h.hasOwnProperty(f)){if(String(f).toLowerCase()=="path"){b+="; path=/";
k=false
}else{b+="; "+f;
var c=h[f];
if(c!==true){b+="="+c
}}}}if(k){b+="; path=/"
}if(b.length>=4096){return false
}document.cookie=b;
return true
},deleteCookie:function(a){HttpCommander.Lib.Utils.setCookie(a,null,{expires:-1})
},createSharePointPlugin:function(){var l=HttpCommander.Lib.Utils.browserIs;
var h=function(){return l.mac&&(l.firefox3up||l.safari3up)
};
var n=function(e){return navigator.mimeTypes&&navigator.mimeTypes[e]&&navigator.mimeTypes[e].enabledPlugin
};
var b=function(){var e=n("application/x-sharepoint-webkit");
var i=n("application/x-sharepoint");
if(l.safari3up&&e){return true
}return i
};
var a=function(){var i=null;
if(h()){i=document.getElementById("macSharePointPlugin");
if(i==null&&b()){var e=null;
if(l.safari3up&&n("application/x-sharepoint-webkit")){e="application/x-sharepoint-webkit"
}else{e="application/x-sharepoint"
}var p=document.createElement("object");
p.id="macSharePointPlugin";
p.type=e;
p.width=0;
p.height=0;
p.style.setProperty("visibility","hidden","");
document.body.appendChild(p);
i=document.getElementById("macSharePointPlugin")
}}return i
};
var g=function(){return(l.winnt||l.win32||l.win64bit)&&l.firefox3up
};
var f=function(){var i=null;
if(g()){try{i=document.getElementById("winFirefoxPlugin");
if(!i&&n("application/x-sharepoint")){var q=document.createElement("object");
q.id="winFirefoxPlugin";
q.type="application/x-sharepoint";
q.width=0;
q.height=0;
q.style.setProperty("visibility","hidden","");
document.body.appendChild(q);
i=document.getElementById("winFirefoxPlugin")
}}catch(p){i=null
}}return i
};
var o=null;
if(window.ActiveXObject||l.ie11up){var c=[function(){return new ActiveXObject("SharePoint.OpenDocuments.5")
},function(){return new ActiveXObject("SharePoint.OpenDocuments.4")
},function(){return new ActiveXObject("SharePoint.OpenDocuments.3")
},function(){return new ActiveXObject("SharePoint.OpenDocuments.2")
},function(){return new ActiveXObject("SharePoint.OpenDocuments.1")
}],d=0,k=c.length;
for(;
d<k;
++d){try{o=(c[d])();
break
}catch(m){}}}else{if(l){try{if(h()){o=a()
}else{if(g()){o=f()
}}}catch(m){}}}return o
},encrypt:function(b){var c="";
for(var a=0;
a<b.length;
++a){c+=String.fromCharCode(3^b.charCodeAt(a))
}return c
},generateUniqueString:function(){return(new Date()).getTime().toString()
},dateDiff:function(b,f,c,g,m,a){var h=((Ext.isDate(f)?f:new Date())-(Ext.isDate(b)?b:new Date()))/1000,d=h<0?"-":"",l,i,e,k;
if(h<0){h=-h
}l=Math.floor(h/86400);
h-=l*86400;
i=Math.floor(h/3600);
e=Math.floor((h-(i*3600))/60);
k=h-(i*3600)-(e*60);
if(l>0){d+=l+(c||"d")+"&thinsp;"
}if(k>=30){e++
}if(i>0||(i<=0&&l>0&&e>0)){d+=i+(g||"h")+"&thinsp;"
}if(e>0){d+=e+(m||"m")+"&thinsp;"
}else{if(d.length<2){d+="0"+(m||"m")+"&thinsp;"
}}return a?d:'<span style="font-weight:bold;">'+d+"</span>"
},urlEncode:function(b){b=String(b||"");
var a=b.length;
if(a>0){var e=b.indexOf("/",8);
if(e>=0&&e<a-1){var d=b.substring(e+1,a).split("/");
for(var c=0;
c<d.length;
c++){d[c]=encodeURIComponent(d[c])
}d.unshift(b.substring(0,e));
return d.join("/")
}}return b
},getFolderFilter:function(){var b={};
var e=window.location.search.substr(1).split("&");
for(var c=0;
c<e.length;
c++){var a=e[c].split("=");
if(a.length>1){var d=decodeURIComponent(a[0]).toLowerCase();
switch(d){case"folderfilterallow":if(b.folderFilterAllow){b.folderFilterAllow+=","+decodeURIComponent(a[1])
}else{b.folderFilterAllow=decodeURIComponent(a[1])
}break;
case"folderfilterignore":if(b.folderFilterIgnore){b.folderFilterIgnore+=","+decodeURIComponent(a[1])
}else{b.folderFilterIgnore=decodeURIComponent(a[1])
}break;
case"folderfilterallowregexp":if(b.folderFilterAllowRegexp){b.folderFilterAllowRegexp+=","+decodeURIComponent(a[1])
}else{b.folderFilterAllowRegexp=decodeURIComponent(a[1])
}break;
case"folderfilterignoreregexp":if(b.folderFilterIgnoreRegexp){b.folderFilterIgnoreRegexp+=","+decodeURIComponent(a[1])
}else{b.folderFilterIgnoreRegexp=decodeURIComponent(a[1])
}break
}}}return b
},getHelpLinkOpenTag:function(b,a){return"<a href='#' target='_self' onclick='HttpCommander.Main.FileManagers[\""+b+'"].showHelp("'+a+"\");'>"
},getAssociatedMSApp:function(b){var a=HttpCommander.Lib.Utils,e=HttpCommander.Lib.Consts,d=a.getFileExtension(b.toLowerCase());
if(e.msoWordTypes.split(",").indexOf(d)>=0){return 0
}if(e.msoExcelTypes.split(",").indexOf(d)>=0){return 1
}if(e.msoOutlookTypes.split(",").indexOf(d)>=0){return 2
}if(e.msoPowerTypes.split(",").indexOf(d)>=0){return 3
}if(e.msoFrontPageTypes.split(",").indexOf(d)>=0){return 5
}return -1
},setFileExtension:function(c,a){var b=c.lastIndexOf(".");
if(b==-1){return c+"."+a
}else{return c.substr(0,b+1)+a
}},getCurrentStyle:function(a){return window.getComputedStyle?getComputedStyle(a,null):a.currentStyle
},getHexRGBColor:function(a){a=a.replace(/\s/g,"");
var c=a.match(/^rgb\((\d{1,3}[%]?),(\d{1,3}[%]?),(\d{1,3}[%]?)\)$/i);
if(c){a="";
for(var b=1;
b<=3;
b++){a+=Math.round((c[b][c[b].length-1]=="%"?2.55:1)*parseInt(c[b])).toString(16).replace(/^(.)$/,"0$1")
}}else{a=a.replace(/^#?([\da-f])([\da-f])([\da-f])$/i,"$1$1$2$2$3$3")
}return"#"+a
},getBackgroundColor:function(a){return HttpCommander.Lib.Utils.getHexRGBColor(HttpCommander.Lib.Utils.getCurrentStyle(a).backgroundColor)
},recursiveCheckTreeChildNodes:function(b,a){if(!b.isExpanded()&&b.isExpandable()){b.expand()
}if(b.hasChildNodes()){Ext.each(b.childNodes,function(c){c.getUI().toggleCheck(a);
c.attributes.checked=a;
HttpCommander.Lib.Utils.recursiveCheckTreeChildNodes(c,a)
})
}},recursiveCheckTreeChildNodesWithoutExpand:function(b,a){if(b){var c=b.getUI();
b.attributes.checked=a;
if(c&&c.checkbox&&c.checkbox.checked!=a){c.checkbox.checked=a===true
}if(b.childrenRendered&&b.childNodes&&b.childNodes.length>0){Ext.each(b.childNodes,function(d){d.attributes.checked=a;
HttpCommander.Lib.Utils.recursiveCheckTreeChildNodesWithoutExpand(d,a)
})
}}},recursiveCheckTreeParentNodes:function(e,d){if(e.parentNode&&(typeof e.isRoot=="undefined"||!e.isRoot)){var c=e.parentNode;
var a=true;
for(var b=0;
b<c.childNodes.length;
b++){if(c.childNodes[b].getUI().isChecked()!=d){a=false;
break
}}if(a&&c.getUI().isChecked()!=d){c.getUI().toggleCheck(d);
HttpCommander.Lib.Utils.recursiveCheckTreeParentNodes(c,d)
}}},cloneMsOAuthInfo:function(b){var d=null,a;
if(Ext.isObject(b)){d=Ext.apply({},b);
if(!!d.scope){delete d.scope
}if(!!b.scope){try{a=[];
for(var f in b.scope){if(b.scope.hasOwnProperty(f)&&!!b.scope[f]){a.push(b.scope[f])
}}if(a.length>0){d.scope=a
}}catch(c){}}}return d
},getElementsByClass:function(c){if(document.querySelectorAll){return document.querySelectorAll("."+c)
}else{if(document.getElementsByClassName){return document.getElementsByClassName(c)
}else{var e=document.getElementsByTagName("*"),d=e.length,b=c.split(/\s+/),a=[];
while(d--){if(e[d].className.search("\\b"+b+"\\b")!=-1){a.push(e[d])
}}return a
}}},getDateUTCString:function(b){if(!b){return null
}try{var f=function(d){return String(d<10?("0"+d):d)
},l=String(b.getUTCFullYear()),a=f(b.getUTCMonth()+1),k=f(b.getUTCDate()),c=f(b.getUTCHours()),g=f(b.getUTCMinutes()),m=f(b.getUTCSeconds());
return""+l+a+k+c+g+m
}catch(i){return null
}},isAllowedForViewingInBrowser:function(c,g){if(!c||!g){return false
}var b=false,f=c.split("/"),e=f[f.length-1],d=HttpCommander.Lib.Utils.getFileExtension(e),a=";"+d+";";
b=HttpCommander.Lib.Consts.forbiddenTypesForViewInBrowser.indexOf(a)<0&&g.mimeTypes.indexOf(d)>=0;
if(b){b=HttpCommander.Lib.Consts.msoSupportedtypes.indexOf(a)<0||HttpCommander.Lib.Consts.msoTypesForViewInBrowser.indexOf(a)!=-1
}return b
},includeCssFile:function(b){var a=Ext.isObject(b)?b:{},f=a.id||Ext.id(),d,e,c=document.getElementById(f);
if(!c){d=document.getElementsByTagName("head")[0];
e=document.createElement("link");
e.id=f;
e.rel="stylesheet";
e.type="text/css";
e.href=a.url||"";
e.media="all";
d.appendChild(e)
}},includeJsFile:function(c){var b,a=Ext.isObject(c)?c:{},d=document.getElementsByTagName("head")[0],e=function(){if(Ext.isFunction(a.callback)){a.callback.call()
}};
b=document.createElement("script");
b.type="text/javascript";
b.async=true;
if(Ext.isFunction(a.callback)){b.onload=b.onerror=function(){var f=this;
if(!f.executed){f.executed=true;
e()
}};
b.onreadystatechange=function(){var f=this;
if(f.readyState=="complete"||f.readyState=="loaded"){setTimeout(function(){f.onload()
},0)
}}
}b.src=c.url||"";
d.appendChild(b)
},registerCssClasses:function(a){HttpCommander.Lib.Utils.createCSSClass(".x-tree-node-expanded .x-tree-node-icon{background-image: url("+HttpCommander.Lib.Utils.getIconPath(a,"folder-open")+");}");
HttpCommander.Lib.Utils.createCSSClass(".x-tree-node-collapsed .x-tree-node-icon{background-image: url("+HttpCommander.Lib.Utils.getIconPath(a,"folder")+");}");
HttpCommander.Lib.Utils.createCSSClass(".x-remove-from-favorites{background-image: url("+HttpCommander.Lib.Utils.getIconPath(a,"delete")+") !important;}");
HttpCommander.Lib.Utils.createCSSClass(".icon-google{background-image: url("+HttpCommander.Lib.Utils.getIconPath(a,"googledocs")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=googledocs":"")+") !important;}");
HttpCommander.Lib.Utils.createCSSClass(".icon-skydrive{background-image: url("+HttpCommander.Lib.Utils.getIconPath(a,"skydrive")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=skydrive":"")+") !important;}");
HttpCommander.Lib.Utils.createCSSClass(".icon-dropbox{background-image: url("+HttpCommander.Lib.Utils.getIconPath(a,"dropbox")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=dropbox":"")+") !important;}");
HttpCommander.Lib.Utils.createCSSClass(".icon-box{background-image: url("+HttpCommander.Lib.Utils.getIconPath(a,"box")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=box":"")+") !important;}");
HttpCommander.Lib.Utils.createCSSClass(".icon-comment{background-image: url("+HttpCommander.Lib.Utils.getIconPath(a,"comment")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=comment":"")+") !important; }");
HttpCommander.Lib.Utils.createCSSClass(".icon-details{background-image: url("+HttpCommander.Lib.Utils.getIconPath(a,"details")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=details":"")+") !important; }");
HttpCommander.Lib.Utils.createCSSClass(".icon-history{background-image: url("+HttpCommander.Lib.Utils.getIconPath(a,"versioning")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=versioning":"")+") !important; }");
HttpCommander.Lib.Utils.createCSSClass(".ext-el-mask { z-index: 35001; }");
HttpCommander.Lib.Utils.createCSSClass(".ext-el-mask-msg { z-index: 35002; }")
},createCSSClass:function(b){try{var a=document.createElement("style");
a.type="text/css";
a.innerHTML=b;
document.getElementsByTagName("head")[0].appendChild(a)
}catch(c){}},openCustomUriTimeout:function(c,g,b){var f=false;
var e=function(){f=true;
clearTimeout(d);
Ext.EventManager.removeListener(window,"blur",e,this,null);
if(g){g(true)
}};
var d=setTimeout(function(){Ext.EventManager.removeListener(window,"blur",e,this,null);
if((b&&!document.hasFocus()||!b)&&!f&&g){g(false)
}},1000);
Ext.EventManager.on(window,"blur",e,this,null);
if(!b){window.location=c
}else{var a=HttpCommander.Lib.Utils.getCustomUriFrame();
a.contentWindow.location.href=c
}},openCustomUriFirefox:function(b,f){var d=false;
var a=HttpCommander.Lib.Utils.getCustomUriFrame();
try{a.contentWindow.location.href=b;
d=true
}catch(c){if(c.name=="NS_ERROR_UNKNOWN_PROTOCOL"){d=false
}}a.remove();
if(f){f(d)
}},getCustomUriFrame:function(){var a=document.getElementById("cusomUriOpenerIframe");
if(!a){a=document.createElement("iframe");
a.src="about:blank";
a.id="cusomUriOpenerIframe";
a.style.display="none";
Ext.getBody().appendChild(a)
}return a
},openCustomUriInNewWindow:function(a,c){var b=window.open("","","width=0,height=0");
b.document.write("<iframe src='"+a+"'></iframe>");
setTimeout(function(){try{b.location.href;
b.setTimeout("window.close()",1000);
c(true)
}catch(d){b.close();
c(false)
}},1000)
},openCustomUriInHiddenFrame:function(a,b){HttpCommander.Lib.Utils.openCustomUriTimeout(a,b,true)
},openCustomUriIE:function(b,d){if(navigator.msLaunchUri){navigator.msLaunchUri(b,function(){d(true)
},function(){d(false)
})
}else{var a=navigator.userAgent.toLowerCase();
var c=/windows nt 6.2/.test(a)||/windows nt 6.3/.test(a);
if(c){window.location.href=b
}else{if(HttpCommander.Lib.Utils.browserIs.iever===9||(HttpCommander.Lib.Utils.browserIs.iever===11&&!/windows nt 6.1/.test(a)&&!/windows nt 6.0/.test(a))){HttpCommander.Lib.Utils.openCustomUriInHiddenFrame(b,d)
}else{HttpCommander.Lib.Utils.openCustomUriInNewWindow(b,d)
}}}},launchCustomProtocol:function(a,b){if(HttpCommander.Lib.Utils.browserIs.firefox){HttpCommander.Lib.Utils.openCustomUriFirefox(a,b)
}else{if(HttpCommander.Lib.Utils.browserIs.ie){HttpCommander.Lib.Utils.openCustomUriIE(a,b)
}else{if(HttpCommander.Lib.Utils.browserIs.chrome){HttpCommander.Lib.Utils.openCustomUriTimeout(a,b)
}else{if(HttpCommander.Lib.Utils.browserIs.safari){HttpCommander.Lib.Utils.openCustomUriInHiddenFrame(a,b)
}else{if(HttpCommander.Lib.Utils.browserIs.edge){HttpCommander.Lib.Utils.openCustomUriEdge(a,b)
}else{HttpCommander.Lib.Utils.openCustomUriTimeout(a,b)
}}}}}},getMSOfficeUriScheme:function(b){var c=HttpCommander.Lib.Utils.getFileExtension(b);
var a=","+c+",";
if((","+HttpCommander.Lib.Consts.msoWordTypes+",").indexOf(a)>=0){return"ms-word"
}else{if((","+HttpCommander.Lib.Consts.msoExcelTypes+",").indexOf(a)>=0){return"ms-excel"
}else{if((","+HttpCommander.Lib.Consts.msoPowerTypes+",").indexOf(a)>=0){return"ms-powerpoint"
}else{if((","+HttpCommander.Lib.Consts.msoInfoPathTypes+",").indexOf(a)>=0){return"ms-infopath"
}else{if((","+HttpCommander.Lib.Consts.msoPubTypes+",").indexOf(a)>=0){return"ms-publisher"
}else{if((","+HttpCommander.Lib.Consts.msoVisioTypes+",").indexOf(a)>=0){return"ms-visio"
}else{if((","+HttpCommander.Lib.Consts.msoProjectTypes+",").indexOf(a)>=0){return"ms-project"
}else{return null
}}}}}}}},getMSOfficeCommand:function(b){var c=HttpCommander.Lib.Utils.getFileExtension(b);
var a=","+c+",";
if((","+HttpCommander.Lib.Consts.msoWordTypes+",").indexOf(a)>=0){return"WINWORD"
}else{if((","+HttpCommander.Lib.Consts.msoExcelTypes+",").indexOf(a)>=0){return"EXCEL"
}else{if((","+HttpCommander.Lib.Consts.msoPowerTypes+",").indexOf(a)>=0){return"POWERPNT"
}else{if((","+HttpCommander.Lib.Consts.msoInfoPathTypes+",").indexOf(a)>=0){return"INFOPATH"
}else{if((","+HttpCommander.Lib.Consts.msoPubTypes+",").indexOf(a)>=0){return"MSPUB"
}else{if((","+HttpCommander.Lib.Consts.msoVisioTypes+",").indexOf(a)>=0){return"VISIO"
}else{if((","+HttpCommander.Lib.Consts.msoProjectTypes+",").indexOf(a)>=0){return"WINPROJ"
}else{return null
}}}}}}}},getAbbr:function(e,f){if(Ext.isEmpty(e)||e.trim().length==0){return" "
}if(!Ext.isNumber(f)||f<=0){f=2
}var d="",c,b,g=HttpCommander.Lib.Utils.parseUserName(e).trim().split(/[\s_]+/gi),a=g.length;
for(c=0;
c<a;
c++){if(d.length>=f){break
}b=g[c];
if(b.length>0){d+=b[0]
}}return d.length>0?d.toUpperCase():" "
},getHashCode:function(f){var e=0,b,d,a=f.length;
if(a==0){return e
}var c=f.toLowerCase();
for(b=0;
b<a;
b++){d=c.charCodeAt(b);
e=((e<<5)-e)+d;
e|=0
}return e
},getAvatarHtml:function(g,b,e,f){if(!Ext.isArray(b)||b.length==0){return""
}var i=HttpCommander.Lib.Utils.getAbbr(g,e),c,h,d,a;
if(Ext.isEmpty(g)||g.trim().length==0){d="black";
a="white"
}else{c=HttpCommander.Lib.Utils.getHashCode(g);
h=Math.abs(c%b.length);
d=b[h].bg;
a=b[h].fg
}return String.format('{3}<div class="c-avatar--no-img c-avatar--circle c-avatar c-avatar--m" style="background-color:{0};color:{1};{5}">{2}</div>{4}',d,a,Ext.util.Format.htmlEncode(i),f?"":'<div class="commenter-photo">',f?"":"</div>",f?"margin-right:8px;margin-top:3px;":"")
},parseUserName:function(a){var c,b;
if(!Ext.isEmpty(a)){c=(b=String(a)).indexOf("\\");
if(c<0){c=b.indexOf("/")
}if(c>=0&&b.length>(c+1)){return b.substring(c+1)
}}return a
},copyTextToClipboard:function(d){var c=false,b;
if(Ext.isEmpty(d)){return c
}try{b=document.createElement("textarea");
b.style.position="fixed";
b.style.top=0;
b.style.left=0;
b.style.width="2em";
b.style.height="2em";
b.style.padding=0;
b.style.border="none";
b.style.outline="none";
b.style.boxShadow="none";
b.style.background="transparent";
b.value=String(d);
document.body.appendChild(b);
b.select();
c=document.execCommand("copy")
}catch(a){if(!!window.console&&!!window.console.log){window.console.log("Error on copy to clipboard: "+a)
}c=a
}if(!!b){try{document.body.removeChild(b)
}catch(a){if(!!window.console&&!!window.console.log){window.console.log("Error remove textarea after copy to clipboard: "+a)
}}}return c
}};
HttpCommander.Lib.Utils.EMails=(function(){var h=[],d=(function(){try{return"localStorage" in window&&window.localStorage!==null
}catch(i){return false
}})(),b=function(e){return(Object.prototype.toString.apply(e)==="[object Array]")
},c=function(){var e=!!htcConfig?htcConfig.friendlyUserName:null;
return !!e?e:null
};
if(d){try{var a=localStorage.getItem(c());
if(a){h=JSON.parse(a)
}if(!b(h)){h=[]
}}catch(f){h=[];
if(!!window.console&&!!window.console.log){window.console.log("Check local storage for current user error: ");
window.console.log(f)
}}}var g=function(l){l=String(l||"").trim();
if(l.length==0){return
}for(var m=0,k=h.length;
m<k;
m++){if(h[m].toLowerCase()==l.toLowerCase()){return
}}h.push(l);
if(d){try{localStorage.setItem(c(),JSON.stringify(h))
}catch(n){if(!!window.console&&!!window.console.log){window.console.log("Set local storage for current user error: ");
window.console.log(n)
}}}};
return{put:g,get:function(e){if(arguments.length==0||typeof e=="undefined"){return h
}if(e>=0&&e<h.length){return h[e]
}},getDataStore:function(){var l=[];
for(var k=0,e=h.length;
k<e;
k++){l.push([h[k],false])
}return l
},clear:function(){h=[];
if(d){try{localStorage.removeItem(c())
}catch(i){if(!!window.console&&!!window.console.log){window.console.log("Error on clear local storage for current user: ");
window.console.log(i)
}}}}}
})();
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.PlayVideoFlashWindow=function(a){return new a.Window({title:"",layout:"fit",resizable:true,closeAction:"hide",minimizable:false,maximizable:true,border:false,plain:true,width:300,height:200,player:null,items:{xtype:"box",itemId:"video-box",autoEl:{tag:"div",html:'<div id="'+a.$("video-player")+'" style="width: 100%; height: 100%"></div>'}},listeners:{hide:function(b){b.restoreVideoPlayer();
b.player.stop();
b.player.close()
},close:function(b){b.restoreVideoPlayer();
b.player.stop();
b.player.close()
},afterrender:function(b){b.installVideoPlayer()
}},installVideoPlayer:function(){var b=this;
b.player=flowplayer(a.$("video-player"),{id:a.$("video-player-api"),src:a.htcConfig.relativePath+"Scripts/flowplayer.unlimited-3.2.7.swf"},{clip:{url:"",autoPlay:false,scaling:"fit",provider:"IIS_pseudostreaming",onStart:function(i){var f=b.getComponent("video-box");
var d=b.getWidth()-f.getWidth();
var e=b.getHeight()-f.getHeight();
var c=parseInt(i.metaData.width,10);
var g=parseInt(i.metaData.height,10);
if(c==null||!isFinite(c)||c<=0||Math.abs(c)>2000){c=400
}if(g==null||!isFinite(g)||g<=0||Math.abs(g)>2000){g=400
}b.setSize(c+d,g+e)
}},plugins:{IIS_pseudostreaming:{url:a.htcConfig.relativePath+"Scripts/flowplayer.pseudostreaming-3.2.7.swf",queryString:escape("flvstart=${start}")}},key:a.htcConfig.flowplayerKey})
},playVideoFile:function(b,e){var d=this;
d.restoreVideoPlayer();
if(d.player!=null){d.player.stop();
d.player.close()
}var c=a.appRootUrl+"Handlers/Download.ashx?action=download&file="+e+"/"+b.data.name;
d.restore();
if(d.isVisible()){d.setVideoFile(c,b.data.name)
}else{d.show(null,function(){d.setVideoFile(c,b.data.name)
})
}setTimeout(a.openTreeRecent,1000)
},restoreVideoPlayer:function(){var c=this;
var b=document.getElementById(a.$("video-player-api"));
if(b!=null){if(b.fp_close==null){c.installVideoPlayer()
}}},setVideoFile:function(b,f){var d=this;
var c=d.player.getClip(0);
var e=HttpCommander.Lib.Utils.getFileExtension(f)=="flv"?"IIS_pseudostreaming":"http";
if(c.url==""){c.update({url:escape(b),provider:e})
}else{c.update({url:b,provider:e})
}d.setTitle(Ext.util.Format.htmlEncode(f))
}})
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.PlayVideoHtml5Window=function(a){var b=new a.Window({title:"",layout:"fit",resizable:true,closeAction:"hide",minimizable:false,maximizable:true,border:false,plain:true,width:300,height:200,monitorMetadataTask:null,items:[],listeners:{hide:function(c){c.videoPause(c)
},close:function(c){c.videoPause(c)
}},videoPause:function(e){var d=e||this;
var c=d.getVideoObj();
if(c&&c.pause){c.onerror=null;
c.pause()
}d.stopMonitorMetadataTask()
},playVideoFile:function(c,g){var f=this;
f.stopMonitorMetadataTask();
f.removeAll(true);
f.add({xtype:"box",autoEl:{tag:"div",html:""}});
f.restore();
if(f.isVisible()){f.doLayout()
}else{f.show()
}var d=c.data.name;
f.setTitle(Ext.util.Format.htmlEncode(d));
var e={inputFile:g+"/"+d};
a.globalLoadMask.msg=a.htcConfig.locData.VideoConvertWindowExtractDetailsProgressMsg+"...";
a.globalLoadMask.show();
HttpCommander.Video.VideoInfo(e,function(m,k){a.globalLoadMask.hide();
if(!HttpCommander.Lib.Utils.checkDirectHandlerResult(m,k,a.Msg,a.htcConfig,2)){f.hide();
return
}f.removeAll(true);
var i=a.htcConfig.relativePath+"Handlers/Download.ashx?action=download&file="+encodeURIComponent(g+"/"+d);
f.add({xtype:"box",itemId:"video-box",autoEl:{tag:"div",html:""}});
f.doLayout();
var l=f.getComponent("video-box").el.dom;
var h=document.createElement("video");
h.controls=true;
h.preload="metadata";
if(h.style.setProperty){h.style.setProperty("width","100%","");
h.style.setProperty("height","100%","")
}else{h.style.width="100%";
h.style.height="100%"
}h.onerror=function(p){a.Msg.alert(a.htcConfig.locData.CommonErrorCaption,a.htcConfig.locData.PlayHtml5VideoPlayFailed);
f.stopMonitorMetadataTask()
};
var o=document.createElement("source");
o.onerror=function(p){a.Msg.alert(a.htcConfig.locData.CommonErrorCaption,a.htcConfig.locData.PlayHtml5VideoPlayFailed);
f.stopMonitorMetadataTask()
};
o.type=m.IMediaType;
o.src=i;
h.appendChild(o);
var n=document.createElement("p");
n.appendChild(document.createTextNode(a.htcConfig.locData.PlayHtml5VideoNotSupported));
h.appendChild(n);
l.appendChild(h);
f.monitorMetadataTask=Ext.TaskMgr.start({run:f.checkMetadataLoaded,interval:1000,scope:f});
setTimeout(a.openTreeRecent,1000)
})
},getVideoObj:function(){var c=this.getComponent("video-box");
if(c==null||c.el==null||c.el.dom==null){return null
}return c.el.dom.firstChild
},checkMetadataLoaded:function(){var d=this;
var c=d.getVideoObj();
if(c==null){return
}var e=Number(c.readyState);
if(isNaN(e)){d.stopMonitorMetadataTask();
return
}if(e>=1){d.stopMonitorMetadataTask();
d.autoResize()
}if(c.tagName.toLowerCase()!="video"){d.stopMonitorMetadataTask()
}},stopMonitorMetadataTask:function(){var c=this;
if(c.monitorMetadataTask!=null){Ext.TaskMgr.stop(c.monitorMetadataTask);
c.monitorMetadataTask=null
}},autoResize:function(){var i=this;
var g=i.getComponent("video-box");
var d=i.getVideoObj();
var c,f;
c=d.width;
f=d.height;
if(!c||!f){c=d.videoWidth;
f=d.videoHeight
}if(c&&f){var e=i.getWidth()-g.el.dom.clientWidth;
var k=i.getHeight()-g.el.dom.clientHeight;
i.setSize(c+e,f+k);
i.doLayout()
}}});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.PlayVideoJSWindow=function(a){var b=new a.Window({title:"",layout:"fit",resizable:true,closeAction:"hide",minimizable:false,maximizable:true,border:false,plain:true,width:480,height:320,isAudio:false,volume:1,mimeTypes:{flv:"video/x-flv",mp4:"video/mp4",m3u8:"application/x-mpegURL","3gp":"video/3gpp",mov:"video/quicktime",avi:"video/avi",wmv:"video/x-ms-wmv",ogv:"video/ogg",webm:"video/webm",mpg:"video/mpeg",mp3:"audio/mpeg",wav:"audio/wav",ogg:"audio/ogg",aac:"audio/aac"},items:[],listeners:{hide:function(c){c.videoPause(c);
c.disposePlayer(c)
},close:function(c){c.videoPause(c);
c.disposePlayer(c)
}},disposePlayer:function(g){try{var c=videojs.getPlayers()["htcomnet_video"];
if(c){c.dispose()
}if(document.getElementById("htcomnet_video")&&b.getComponent("video-box")){var d=b.getComponent("video-box").el.dom;
if(d){d.removeChild(document.getElementById("htcomnet_video"))
}}}catch(f){}},videoPause:function(f){try{var c=videojs.getPlayers()["htcomnet_video"];
if(document.getElementById("htcomnet_video")&&c&&!c.paused()){c.pause()
}}catch(d){}},isAudioFile:function(d){var c=HttpCommander.Lib.Utils.getFileExtension(d);
return"wav mp3 ogg".indexOf(c)>=0
},playVideoFile:function(c,e){var d=this;
if(typeof videojs=="undefined"){a.globalLoadMask.msg=a.htcConfig.locData.ProgressLoading+"...";
a.globalLoadMask.show();
if(HttpCommander.Lib.Utils.browserIs.ie&&HttpCommander.Lib.Utils.browserIs.iever<9){HttpCommander.Lib.Utils.includeJsFile({url:scriptSource.substring(0,scriptSource.lastIndexOf("/"))+"/plugins/video-js/videojs-ie8.min.js",callback:function(){d.loadVideoJSFiles.call(d,c,e)
}})
}else{d.loadVideoJSFiles.call(d,c,e)
}}else{d.playVideoFileInternal.call(d,c,e)
}},loadVideoJSFiles:function(c,e){var d=this;
HttpCommander.Lib.Utils.includeJsFile({url:scriptSource.substring(0,scriptSource.lastIndexOf("/"))+"/plugins/video-js/video.min.js",callback:function(){a.globalLoadMask.hide();
a.globalLoadMask.msg=a.htcConfig.locData.ProgressLoading+"...";
if(typeof videojs=="undefined"){a.Msg.alert(a.htcConfig.locData.CommonErrorCaption,a.htcConfig.locData.VideoJsNotLoadedMessage);
return
}HttpCommander.Lib.Utils.includeCssFile({url:scriptSource.substring(0,scriptSource.lastIndexOf("/"))+"/plugins/video-js/video-js.css"});
HttpCommander.Lib.Utils.includeJsFile({url:scriptSource.substring(0,scriptSource.lastIndexOf("/"))+"/plugins/video-js/lang/"+a.htcConfig.twoLetterLangName+".js",callback:function(){d.playVideoFileInternal.call(d,c,e)
}})
}})
},playVideoFileInternal:function(c,g){videojs.options.flash.swf="Scripts/plugins/video-js/video-js.swf";
var f=this;
f.videoPause();
f.disposePlayer(f);
f.removeAll(true);
f.add({xtype:"box",itemId:"video-box",autoEl:{tag:"div",html:""}});
f.restore();
if(f.isVisible()){f.doLayout()
}else{f.show()
}var d=c.data.name;
var e={inputFile:g+"/"+d};
if(!f.isAudioFile(c.data.name)){a.globalLoadMask.msg=a.htcConfig.locData.VideoConvertWindowExtractDetailsProgressMsg+"...";
a.globalLoadMask.show();
HttpCommander.Video.VideoInfo(e,function(i,h){a.globalLoadMask.hide();
f.playFile(f,c,g,i,h)
})
}else{f.playFile(f,c,g)
}},playFile:function(i,h,n,f,o){var k=h.data.name;
i.setTitle(Ext.util.Format.htmlEncode(k));
i.isAudio=i.isAudioFile(k);
var c=a.htcConfig.relativePath+"Handlers/Download.ashx/"+encodeURIComponent(k)+"?action=download&file="+encodeURIComponent(n+"/"+k);
var g=i.getComponent("video-box").el?i.getComponent("video-box").el.dom:i.el.dom;
var e=i.isAudio?document.createElement("audio"):document.createElement("video");
e.id="htcomnet_video";
if(e.style.setProperty){e.style.setProperty("width","100%","");
e.style.setProperty("height","100%","")
}else{e.style.width="100%";
e.style.height="100%"
}var m=HttpCommander.Lib.Utils.getFileExtension(k);
var l=document.createElement("source");
l.src=c;
if(!i.isAudio&&HttpCommander.Lib.Utils.checkDirectHandlerResult(f,o,a.Msg,a.htcConfig,2)){l.type=f.IMediaType
}else{if(i.mimeTypes[m]){l.type=i.mimeTypes[m]
}}e.appendChild(l);
var d=document.createElement("p");
d.appendChild(document.createTextNode(a.htcConfig.locData.PlayHtml5VideoNotSupported));
e.appendChild(d);
g.appendChild(e);
videojs(document.getElementById("htcomnet_video"),{controls:true,autoplay:true,preload:"metadata",language:a.htcConfig.twoLetterLangName},function(){try{this.on("error",function(q){q.stopImmediatePropagation()
});
this.el_.className=this.el_.className+" video-js vjs-default-skin";
this.on("loadedmetadata",i.autoResize);
this.on("volumechange",function(){i.volume=this.volume()
});
this.volume(i.volume)
}catch(p){}});
setTimeout(a.openTreeRecent,1000)
},autoResize:function(){var c,e;
var f=b.getComponent("video-box");
e=b.isAudio?70:this.videoHeight();
c=b.isAudio?b.getWidth():this.videoWidth();
if(c&&e){c=c>640?640:c;
e=e>640?480:e;
var d=b.getWidth()-f.el.dom.clientWidth;
var g=b.getHeight()-f.el.dom.clientHeight;
b.setSize(c+d,e+g);
b.doLayout()
}}});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.PlayAudioHtml5Window=function(a){var b=new a.Window({title:"",layout:"fit",resizable:true,closeAction:"hide",minimizable:false,maximizable:false,border:false,plain:true,width:300,autoHeight:true,items:[],listeners:{hide:function(d){var c=b.getAudioObj();
if(c&&c.pause){c.pause()
}},close:function(d){var c=b.getAudioObj();
if(c&&c.pause){c.pause()
}}},playFile:function(h,l){var i=this;
i.removeAll(true);
i.add({xtype:"box",itemId:"audio-box",autoEl:{tag:"div",html:""}});
i.restore();
if(i.isVisible()){i.doLayout()
}else{i.show()
}var f=h.data.name;
i.setTitle(Ext.util.Format.htmlEncode(f));
var c=a.htcConfig.relativePath+"Handlers/Download.ashx?action=download&file="+encodeURIComponent(l+"/"+f);
var g=i.getComponent("audio-box").el.dom;
var e=document.createElement("audio");
e.controls=true;
e.preload="metadata";
if(e.style.setProperty){e.style.setProperty("width","100%","")
}else{e.style.width="100%"
}e.onerror=function(m){a.Msg.alert(a.htcConfig.locData.CommonErrorCaption,a.htcConfig.locData.PlayHtml5AudioPlayFailed)
};
var k=document.createElement("source");
k.onerror=function(m){a.Msg.alert(a.htcConfig.locData.CommonErrorCaption,a.htcConfig.locData.PlayHtml5AudioPlayFailed)
};
k.src=c;
e.appendChild(k);
var d=document.createElement("p");
d.appendChild(document.createTextNode(a.htcConfig.locData.PlayHtml5AudioNotSupported));
e.appendChild(d);
g.appendChild(e);
setTimeout(a.openTreeRecent,1000)
},getAudioObj:function(){var c=this.getComponent("audio-box");
if(c==null||c.el==null||c.el.dom==null){return null
}return c.el.dom.firstChild
}});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.VideoConvertProgressWindow=function(a){var b=new a.Window({title:a.htcConfig.locData.VideoConvertProgressWindowTitle,bodyStyle:"padding:5px",modal:false,width:300,plain:true,autoHeight:true,layout:"fit",closeAction:"hide",updateTask:null,jobkey:null,progressBarAutoupdateMode:false,items:[new Ext.FormPanel({baseCls:"x-plain",frame:false,autoHeight:true,itemId:"form",defaults:{anchor:"100%"},items:[{fieldLabel:a.htcConfig.locData.VideoConvertProgressWindowInputFile,itemId:"input-file",xtype:"displayfield"},{fieldLabel:a.htcConfig.locData.VideoConvertProgressWindowOutputFile,itemId:"output-file",xtype:"displayfield"},{fieldLabel:a.htcConfig.locData.VideoConvertProgressWindowStatus,xtype:"displayfield",itemId:"status"},{xtype:"progress",hideLabel:true,cls:"x-form-item",itemId:"step-progress"},{xtype:"textarea",hideLabel:true,itemId:"status-message"}]})],buttons:[{text:a.htcConfig.locData.CommonButtonCaptionCancel,itemId:"cancel-btn",handler:function(){var c={jobkey:b.jobkey};
HttpCommander.Video.Terminate(c,function(f,d){var e=b.getComponent("form");
if(f==undefined){e.getComponent("status").setValue(a.htcConfig.locData.CommonErrorCaption);
e.getComponent("status-message").show();
e.getComponent("status-message").setValue(Ext.util.Format.htmlEncode(d.message));
b.stopProgressUpdater();
b.onConvertStop();
return
}if(f.status!="success"){e.getComponent("status").setValue(a.htcConfig.locData.CommonErrorCaption);
e.getComponent("status-message").show();
e.getComponent("status-message").setValue(HttpCommander.Lib.Utils.checkBracketsAndHtmlEncode(f.message));
b.stopProgressUpdater();
b.onConvertStop();
return
}if(f.jobstatus!="Done"&&f.jobstatus!="Error"){e.getComponent("status").setValue(a.htcConfig.locData.VideoConvertProgressWindowStatusTerminating)
}})
}},{text:a.htcConfig.locData.CommonButtonCaptionClose,handler:function(){b.hide()
}}],listeners:{hide:function(){b.stopProgressUpdater()
}},prepare:function(g,e,f,c){this.stopProgressUpdater();
this.jobkey=f;
this.outputFileName=e;
this.folderPath=c;
var d=this.getComponent("form");
d.getComponent("input-file").setValue(Ext.util.Format.htmlEncode(g));
d.getComponent("output-file").setValue(Ext.util.Format.htmlEncode(e));
d.getComponent("status").setValue(a.htcConfig.locData.VideoConvertProgressWindowStatusPreparing);
d.getComponent("step-progress").reset();
d.getComponent("status-message").setValue("");
d.getComponent("status-message").hide();
this.fbar.getComponent("cancel-btn").enable();
this.startProgressUpdater()
},updateProgress:function(){var d=this;
var c={jobkey:d.jobkey};
HttpCommander.Video.ProgressInfo(c,function(h,f){var g=d.getComponent("form");
if(h==undefined){g.getComponent("status").setValue(a.htcConfig.locData.CommonErrorCaption);
g.getComponent("status-message").show();
g.getComponent("status-message").setValue(Ext.util.Format.htmlEncode(f.message));
d.stopProgressUpdater();
d.stopProgressBarAutoupdater();
d.onConvertStop();
return
}if(h.status!="success"){g.getComponent("status").setValue(a.htcConfig.locData.CommonErrorCaption);
g.getComponent("status-message").show();
g.getComponent("status-message").setValue(HttpCommander.Lib.Utils.checkBracketsAndHtmlEncode(h.message));
d.stopProgressUpdater();
d.stopProgressBarAutoupdater();
d.onConvertStop();
return
}switch(h.jobstate){case"Initial":g.getComponent("status").setValue(a.htcConfig.locData.VideoConvertProgressWindowStatusPreparing);
g.getComponent("step-progress").reset();
break;
case"Running":var i=String.format(a.htcConfig.locData.VideoConvertProgressWindowStatusProgress,h.stepnum,h.stepcnt);
g.getComponent("status").setValue(i);
if(h.stepprog>=0){d.stopProgressBarAutoupdater();
var e=String.format("{0}%",h.stepprog);
g.getComponent("step-progress").updateProgress(h.stepprog/100,e)
}else{d.startProgressBarAutoupdater()
}break;
case"Done":d.stopProgressUpdater();
d.stopProgressBarAutoupdater();
g.getComponent("status").setValue(a.htcConfig.locData.VideoConvertProgressWindowStatusDone);
g.getComponent("step-progress").updateProgress(1);
g.getComponent("step-progress").updateText("");
g.getComponent("status-message").hide();
d.fbar.getComponent("cancel-btn").disable();
d.onConvertStop();
break;
case"Error":d.stopProgressUpdater();
d.stopProgressBarAutoupdater();
g.getComponent("status").setValue(a.htcConfig.locData.CommonErrorCaption);
g.getComponent("status-message").show();
g.getComponent("status-message").setValue(HttpCommander.Lib.Utils.checkBracketsAndHtmlEncode(h.jobmessage));
d.fbar.getComponent("cancel-btn").disable();
d.onConvertStop();
break
}})
},startProgressUpdater:function(){var c=this;
c.stopProgressUpdater();
c.updateTask=Ext.TaskMgr.start({run:c.updateProgress,interval:1000,scope:c})
},stopProgressUpdater:function(){var c=this;
if(c.updateTask!=null){Ext.TaskMgr.stop(c.updateTask);
c.updateTask=null;
c.stopProgressBarAutoupdater()
}},startProgressBarAutoupdater:function(){var d=this;
if(!d.progressBarAutoupdateMode){d.progressBarAutoupdateMode=true;
var c=d.getComponent("form");
c.getComponent("step-progress").wait({interval:500,increment:10})
}},stopProgressBarAutoupdater:function(){var d=this;
if(d.progressBarAutoupdateMode){d.progressBarAutoupdateMode=false;
var c=d.getComponent("form");
c.getComponent("step-progress").reset()
}},onConvertStop:function(){var c=this;
if(c&&!Ext.isEmpty(c.outputFileName)&&!Ext.isEmpty(c.folderPath)){a.setSelectPath({name:c.outputFileName,path:c.folderPath})
}a.refreshCurrentFolder(c?c.folderPath:null)
}});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.VideoConvertWindow=function(c){var b=new Ext.data.ArrayStore({fields:["index","label","width","height"],data:[[0,"Custom",0,0],[1,"iPod Classic",320,240],[2,"iPhone/iPhone 3G(S)/iPod Touch/iPad",480,320],[3,"iPhone 4/iPod Touch 4/iPad",960,640],[4,"iPad",1024,768]]});
function a(e){if(e>0){return true
}return c.htcConfig.locData.VideoConvertWindowValidatorPositiveInt
}var d=new c.Window({title:c.htcConfig.locData.VideoConvertWindowTitle,bodyStyle:"padding:5px",modal:true,width:400,plain:true,autoHeight:true,layout:"fit",closeAction:"hide",folderPath:null,videoInfo:{width:0,height:0,PAR:0,DAR:0},resizeEnabled:false,initialized:false,items:[new Ext.FormPanel({baseCls:"x-plain",frame:false,defaults:{anchor:"100%"},itemId:"form",autoHeight:true,items:[{fieldLabel:c.htcConfig.locData.VideoConvertWindowInputFile,itemId:"input-file",xtype:"displayfield"},{fieldLabel:c.htcConfig.locData.VideoConvertWindowOutputFile,itemId:"output-file",xtype:"textfield"},{fieldLabel:c.htcConfig.locData.VideoConvertWindowOutputFormat,xtype:"radiogroup",itemId:"output-format-rg",name:"output-format-radiogroup",items:[{checked:true,boxLabel:"flv",name:"output-format",inputValue:"flv",xtype:"radio"},{boxLabel:"mp4",name:"output-format",inputValue:"mp4",xtype:"radio"}],listeners:{change:function(h,e){var f=d.getComponent("form");
var g=f.getComponent("output-file").getValue();
g=HttpCommander.Lib.Utils.setFileExtension(g,e.getGroupValue());
f.getComponent("output-file").setValue(g)
}}},{fieldLabel:c.htcConfig.locData.VideoConvertWindowBitrate,itemId:"bitrate",xtype:"textfield",maskRe:/\d/,allowBlank:false,validator:a},{fieldLabel:c.htcConfig.locData.VideoConvertWindowFrameResolution,itemId:"resolution",xtype:"displayfield"},{fieldLabel:c.htcConfig.locData.VideoConvertWindowDAR,itemId:"display-aspect-ratio",xtype:"displayfield"},{fieldLabel:c.htcConfig.locData.VideoConvertWindowPAR,itemId:"pixel-aspect-ratio",xtype:"displayfield"},{xtype:"fieldset",checkboxToggle:true,title:c.htcConfig.locData.VideoConvertWindowResize,autoHeight:true,defaults:{anchor:"100%"},defaultType:"textfield",collapsed:true,itemId:"resize-set",items:[{xtype:"combo",fieldLabel:c.htcConfig.locData.VideoConvertWindowProfile,itemId:"profile",store:b,mode:"local",displayField:"label",tpl:'<tpl for="."><div class="x-combo-list-item">{label:htmlEncode}</div></tpl>',valueField:"index",lazyInit:false,editable:false,autoSelect:false,triggerAction:"all",allowBlank:false,listeners:{select:function(){d.loadResizeDimentions()
}}},{fieldLabel:c.htcConfig.locData.VideoConvertWindowWidth,itemId:"new-width",xtype:"textfield",maskRe:/\d/,allowBlank:false,validator:a,listeners:{change:function(){d.onUserChangedVideoWidth()
}}},{fieldLabel:c.htcConfig.locData.VideoConvertWindowHeight,itemId:"new-height",xtype:"textfield",maskRe:/\d/,allowBlank:false,validator:a,listeners:{change:function(){d.onUserChangedVideoHeight()
}}}],listeners:{expand:function(f){var e=f.ownerCt.ownerCt;
e.resizeEnabled=true;
if(e.initialized){e.updateBitrateField()
}},collapse:function(f){var e=f.ownerCt.ownerCt;
e.resizeEnabled=false;
if(e.initialized){e.updateBitrateField()
}}}}]})],buttons:[{text:c.htcConfig.locData.CommonButtonCaptionOK,handler:function(){if(!d.isFormValid()){return
}if(d.isOutputFileExist()){d.confirmOverwriteOutputFile(function(){d.doConversion()
})
}else{d.doConversion()
}}},{text:c.htcConfig.locData.CommonButtonCaptionCancel,handler:function(){d.hide()
}}],prepare:function(f,m){var k=this;
k.initialized=false;
var i=k.getComponent("form");
var g=f.data.name;
k.inputFile=g;
i.getComponent("input-file").setValue(Ext.util.Format.htmlEncode(g));
var l=HttpCommander.Lib.Utils.setFileExtension(g,"flv");
i.getComponent("output-file").setValue(l);
i.getComponent("output-format-rg").setValue("flv");
i.getComponent("resolution").setValue("?");
i.getComponent("display-aspect-ratio").setValue("?");
i.getComponent("bitrate").setValue("500");
var e=i.getComponent("resize-set");
e.getComponent("profile").setValue(0);
k.folderPath=m;
var h={inputFile:k.folderPath+"/"+g};
c.globalLoadMask.msg=c.htcConfig.locData.VideoConvertWindowExtractDetailsProgressMsg+"...";
c.globalLoadMask.show();
HttpCommander.Video.VideoInfo(h,function(o,n){c.globalLoadMask.hide();
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(o,n,c.Msg,c.htcConfig,2)){k.videoInfo.width=o.width;
k.videoInfo.height=o.height;
k.videoInfo.PAR=o.PARNum/o.PARDen;
k.videoInfo.DAR=o.DARNum/o.DARDen;
i.getComponent("resolution").setValue(k.videoInfo.width+" x "+k.videoInfo.height);
i.getComponent("display-aspect-ratio").setValue(k.videoInfo.DAR);
i.getComponent("pixel-aspect-ratio").setValue(k.videoInfo.PAR);
k.loadResizeDimentions();
k.updateBitrateField();
k.initialized=true
}})
},isOutputFileExist:function(){var e=this.getComponent("form");
var f=e.getComponent("output-file").getValue();
return c.isFileExists(f)
},confirmOverwriteOutputFile:function(e){c.Msg.show({title:c.htcConfig.locData.VideoConvertWindowOutputFileExistsTitle,msg:c.htcConfig.locData.VideoConvertWindowOutputFileExistsMsg,buttons:c.Msg.OKCANCEL,icon:c.Msg.WARNING,fn:function(f){if(f=="ok"){e()
}}})
},newFrameSize:function(){var h=this;
var g=h.getComponent("form");
var e=g.getComponent("resize-set");
var f={};
if(h.resizeEnabled){f.width=e.getComponent("new-width").getValue();
f.height=e.getComponent("new-height").getValue()
}else{f.height=h.videoInfo.height;
f.width=Math.round(f.height*h.videoInfo.DAR)
}f.width=Number(f.width);
f.height=Number(f.height);
return f
},doConversion:function(){var h=this;
h.hide();
var g=h.getComponent("form");
var f={folderPath:h.folderPath,inputFileName:h.inputFile,outputFileName:g.getComponent("output-file").getValue(),outputFormat:g.getComponent("output-format-rg").getValue().getGroupValue(),bitrate:Number(g.getComponent("bitrate").getValue())};
var e=h.newFrameSize();
f.width=e.width;
f.height=e.height;
c.globalLoadMask.msg=c.htcConfig.locData.VideoConvertWindowPrepareToConvert+"...";
c.globalLoadMask.show();
HttpCommander.Video.Convert(f,function(k,i){c.globalLoadMask.hide();
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(k,i,c.Msg,c.htcConfig,2)){h.openProgressWindow(f.inputFileName,f.outputFileName,k.jobkey,f.folderPath)
}})
},openProgressWindow:function(i,g,h,f){var e=HttpCommander.Lib.VideoConvertProgressWindow({htcConfig:c.htcConfig,Msg:c.Msg,Window:c.Window,refreshCurrentFolder:c.refreshCurrentFolder,setSelectPath:c.setSelectPath});
e.prepare(i,g,h,f);
e.show()
},isFormValid:function(){var g=this;
var f=g.getComponent("form");
var i=g.inputFile;
var h=f.getComponent("output-file").getValue();
if(i.toLowerCase()==h.toLowerCase()){f.getComponent("output-file").markInvalid(c.htcConfig.locData.VideoConvertWindowOutputFileMatchInputFile);
f.getComponent("output-file").focus(true);
return false
}if(!f.getComponent("bitrate").validate()){f.getComponent("bitrate").focus(true);
return false
}var e=f.getComponent("resize-set");
if(g.resizeEnabled){if(!e.getComponent("new-width").validate()){e.getComponent("new-width").focus(true);
return false
}if(!e.getComponent("new-height").validate()){e.getComponent("new-height").focus(true);
return false
}}return true
},recommendedBitrate:function(){var e=[[76800,400],[129600,700],[589824,1500],[921600,2500],[2073600,4000]];
var h=this;
var f=h.newFrameSize();
var k=f.width*f.height;
for(var g=0;
g<e.length;
g+=1){if(k<e[g][0]){break
}}if(g==0){return h.solveBitrateEquation(e[0],e[1],k)
}if(g==e.length){return h.solveBitrateEquation(e[e.length-2],e[e.length-1],k)
}else{return h.solveBitrateEquation(e[g-1],e[g],k)
}},solveBitrateEquation:function(f,i,h){var g=(f[1]-i[1])/(f[0]-i[0]);
var e=f[1]-g*f[0];
return Math.round(g*h+e)
},updateBitrateField:function(){var f=this;
var e=f.getComponent("form");
e.getComponent("bitrate").setValue(f.recommendedBitrate())
},loadResizeDimentions:function(){var n=this;
var m=n.getComponent("form");
var g=m.getComponent("resize-set");
var k=g.getComponent("profile").getValue();
var f=b.getAt(k);
var e,i;
if(f.data.width&&f.data.height){var l=f.data.width/f.data.height;
if(l<=n.videoInfo.DAR){e=f.data.width;
i=Math.round(e/n.videoInfo.DAR)
}else{i=f.data.height;
e=Math.round(i*n.videoInfo.DAR)
}g.getComponent("new-width").setValue(e);
g.getComponent("new-height").setValue(i)
}else{e=Math.round(n.videoInfo.width*n.videoInfo.PAR);
i=n.videoInfo.height;
g.getComponent("new-width").setValue(e);
g.getComponent("new-height").setValue(i)
}n.updateBitrateField()
},onUserChangedVideoWidth:function(){var k=this;
var i=k.getComponent("form");
var f=i.getComponent("resize-set");
f.getComponent("profile").setValue(0);
var e=f.getComponent("new-width").getValue();
var g=Math.round(e/k.videoInfo.DAR);
f.getComponent("new-height").setValue(g);
k.updateBitrateField()
},onUserChangedVideoHeight:function(){var k=this;
var i=k.getComponent("form");
var f=i.getComponent("resize-set");
f.getComponent("profile").setValue(0);
var g=f.getComponent("new-height").getValue();
var e=Math.round(g*k.videoInfo.DAR);
f.getComponent("new-width").setValue(e);
k.updateBitrateField()
}});
return d
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.ShortcutWindow=function(a){var b=new a.Window({title:a.htcConfig.locData.CommandCreateShortcut,bodyStyle:"padding:5px",modal:true,width:300,autoHeight:true,closeAction:"hide",itemName:"",itemPath:"",plain:true,layout:"form",labelAlign:"top",defaults:{anchor:"100%",xtype:"label"},items:[{text:a.htcConfig.locData.ShortcutNameHint+":"},{itemId:"shortcut-name",xtype:"textfield"},{text:a.htcConfig.locData.ShortcutTargetPathHint+":"},{itemId:"shortcut-target",xtype:"textarea",flex:1}],buttons:[{text:a.htcConfig.locData.CreateShortcutButtonTitle,handler:function(){var c={lnkName:b.getComponent("shortcut-name").getValue(),lnkPath:a.getCurrentFolder(),itemName:b.itemName,itemPath:b.getComponent("shortcut-target").getValue()};
a.globalLoadMask.msg=a.htcConfig.locData.CreatingShortcutProgress+"...";
a.globalLoadMask.show();
HttpCommander.Common.CreateShortcut(c,function(e,d){a.globalLoadMask.hide();
a.globalLoadMask.msg=a.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(e,d,a.Msg,a.htcConfig)){a.Msg.show({title:a.htcConfig.locData.CommandCreateShortcut,msg:String.format(a.htcConfig.locData.CreateShortcutSuccessMessage,Ext.util.Format.htmlEncode(e.lnkName),Ext.util.Format.htmlEncode(e.target)),buttons:a.Msg.OK,icon:a.Msg.INFO,fn:function(f){b.hide();
if(!Ext.isEmpty(e.lnkName)&&!Ext.isEmpty(e.lnkPath)){a.setSelectPath({name:e.lnkName,path:e.lnkPath})
}a.openGridFolder(Ext.isEmpty(e.lnkPath)?a.getCurrentFolder():e.lnkPath)
}})
}})
}},{text:a.htcConfig.locData.CommonButtonCaptionCancel,handler:function(){b.hide()
}}],listeners:{hide:function(c){c.itemName="";
c.itemPath="";
c.getComponent("shortcut-name").setValue("");
c.getComponent("shortcut-target").setValue("")
},show:function(d){var e=String(d.itemName);
if(e.length>0){var c=e.split(".");
if(c.length>1){c.pop();
e=c.join(".")
}}d.getComponent("shortcut-name").setValue(e);
d.getComponent("shortcut-target").setValue(d.itemPath+(d.itemPath.length>0?"/":"")+d.itemName)
}}});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.LinkToFileFolderWindow=function(d){var f,a,c,h;
var b=d.htcConfig.relativePath+"Images/ctc.png",g=d.htcConfig.locData.CommandCopyToClipboard;
var e=new d.Window({title:d.htcConfig.locData.LinkToFileTitle,bodyStyle:"padding:5px",resizable:true,plain:true,closeAction:"hide",layout:{type:"vbox",align:"stretch"},width:350,height:250,minHeight:190,minWidth:300,virtPath:"",isFolder:false,defaults:{anchor:"100%"},items:[f=new Ext.form.Label({hideLabel:true,autoHeight:true,cls:"x-form-item",text:"&nbsp;"}),a=new Ext.ux.AreaCopyToClipboard({autoScroll:true,hideLabel:true,flex:1,selectOnFocus:true,readOnly:true,ctcIcon:b,ctcHint:g,onSuccessCopied:function(){d.showBalloon(d.htcConfig.locData.BalloonCopiedToClipboard)
},onTriggerClickError:function(i){d.Msg.show({title:d.htcConfig.locData.BalloonCopyToClipboardFailed,msg:Ext.util.Format.htmlEncode(!!i?i.toString():d.htcConfig.locData.BalloonCopyToClipboardFailed),icon:d.Msg.ERROR,buttons:d.Msg.OK})
}}),c=new Ext.form.Label({hideLabel:true,autoHeight:true,hidden:true,cls:"x-form-item",text:d.htcConfig.locData.LinkToFileOpenFileLink}),h=new Ext.ux.AreaCopyToClipboard({autoScroll:true,hideLabel:true,flex:1,selectOnFocus:true,readOnly:true,hidden:true,ctcIcon:b,ctcHint:g,onSuccessCopied:function(){d.showBalloon(d.htcConfig.locData.BalloonCopiedToClipboard)
},onTriggerClickError:function(i){d.Msg.show({title:d.htcConfig.locData.BalloonCopyToClipboardFailed,msg:Ext.util.Format.htmlEncode(!!i?i.toString():d.htcConfig.locData.BalloonCopyToClipboardFailed),icon:d.Msg.ERROR,buttons:d.Msg.OK})
}})],buttons:[{text:d.htcConfig.locData.CommonButtonCaptionClose,handler:function(){e.hide()
}}],listeners:{beforeshow:function(i){if(f){f.setText(String.format((i.isFolder?d.htcConfig.locData.LinkToFileOpenFolderLink:d.htcConfig.locData.LinkToFileDownloadFileLink),"<b>"+Ext.util.Format.htmlEncode(i.virtPath)+"</b>",d.htcConfig.appName),false)
}if(a){a.setValue(i.isFolder?d.linkToOpenFolderByVirtPath(i.virtPath):d.linkToFileByVirtPath(i.virtPath))
}if(h){if(!i.isFolder){h.setValue(d.linkToSelectFileByVirtPath(i.virtPath));
h.flex=1;
i.setHeight(250);
c.show();
h.show()
}else{h.flex=0;
h.hide();
c.hide();
i.setHeight(190)
}}},show:function(i){i.center();
i.doLayout();
i.syncSize();
if(a){a.focus(true)
}}}});
return e
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.ViewLinksWindow=function(b){var a;
var c=new b.Window({title:b.htcConfig.locData.AnonymousViewLinksWindowTitle,autoDestroy:true,border:false,boxMinHeight:250,boxMinWidth:b.getIsEmbeddedtoIFRAME()?300:450,layout:{type:"vbox",align:"stretch",padding:0},modal:true,resizable:true,plain:true,closeAction:"hide",maximizable:!b.getEmbedded(),width:b.getIsEmbeddedtoIFRAME()?350:500,height:250,oldLinkPath:null,listeners:{beforeshow:function(f){var d=f.items.items[0].getTopToolbar();
if(d){var e=d.getComponent("toggle-all");
if(e){e.setVisible(c.oldLinkPath!=null);
var g=c.linkPath==null;
e.toggle(g,true);
e.setText(b.htcConfig.locData[g?"PublicLinksShowForSelected":"PublicLinksShowForAllItems"])
}}}},items:[a=new Ext.grid.GridPanel({openEditPublicLink:function(f){f=f||a;
var k=f.getSelectionModel().getSelected().data;
var e=k.isfolder;
var i=k.acl;
var g=k.perms;
var d={download:{checked:i&&(i&2)!=0&&(!e||(i&1)!=0)},upload:{checked:e&&i&&(i&4)!=0},view:{checked:e&&i&&(i&1)!=0},zip:{checked:e&&i&&(i&8)!=0}};
var h=d.zip.checked&&!d.upload.checked&&!d.view.checked;
d.download.disabled=!e||h||!(g&&g.download&&g.anonymDownload);
d.upload.disabled=!e||h||!(g&&g.upload&&g.anonymUpload);
d.view.disabled=!e||h||!(g&&(g.listFiles||g.listFolders)&&g.anonymViewContent);
d.zip.disabled=!e||!(g&&g.zipDownload&&g.anonymDownload);
d.modify=g&&g.modify;
if(d.download.disabled){d.download.checked=false
}if(d.upload.disabled){d.upload.checked=false
}if(d.view.disabled){d.view.checked=false
}if(d.zip.disabled){d.zip.checked=false
}b.prepareAndShowMakePublicLinkWindow(k.virt_path,e,d,k)
},header:false,loadMask:{msg:b.htcConfig.locData.ProgressGettingAnonymLinks+"..."},selModel:new Ext.grid.RowSelectionModel({singleSelect:true,listeners:{selectionchange:function(d){var f=d.grid.getTopToolbar().items.items;
var e=d.getCount()<1;
f[1].setDisabled(e);
f[2].setDisabled(e)
}}}),autoExpandMin:70,autoExpandColumn:"view-links-virtpath",tbar:new Ext.Toolbar({enableOverflow:true,items:[{icon:HttpCommander.Lib.Utils.getIconPath(b,"refresh")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=linkswindow":""),text:b.htcConfig.locData.CommandRefresh,handler:function(d){d.ownerCt.ownerCt.getStore().load()
}},{icon:HttpCommander.Lib.Utils.getIconPath(b,"edit")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=linkswindow":""),text:b.htcConfig.locData.CommandMenuEdit,disabled:true,handler:function(e){var d=e.ownerCt.ownerCt;
d.openEditPublicLink(d)
}},{text:b.htcConfig.locData.CommandDelete,icon:HttpCommander.Lib.Utils.getIconPath(b,"delete")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=linkswindow":""),disabled:true,handler:function(d){b.Msg.confirm(b.htcConfig.locData.PublicLinksDeleteWindowTitle,b.htcConfig.locData.PublicLinksDeleteConfirmMsg,function(e){if(e=="yes"){var f=d.ownerCt.ownerCt;
var g=f.getSelectionModel().getSelected();
b.globalLoadMask.msg=b.htcConfig.locData.ProgressDeletingAnonymousLink+"...";
b.globalLoadMask.show();
HttpCommander.Common.RemoveAnonymLinks({ids:[g.data.id]},function(i,h){b.globalLoadMask.hide();
b.globalLoadMask.msg=b.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(i,h,b.Msg,b.htcConfig)){if(i&&i.needrefresh){b.openGridFolder(b.getCurrentFolder())
}f.getStore().load()
}})
}b.Msg.hide()
})
}},"->",{itemId:"toggle-all",text:b.htcConfig.locData.PublicLinksShowForAllItems,hidden:true,enableToggle:true,toggleHandler:function(d,e){if(c.oldLinkPath!=null){c.linkPath=e?null:c.oldLinkPath;
d.setText(b.htcConfig.locData[e?"PublicLinksShowForSelected":"PublicLinksShowForAllItems"]);
c.items.items[0].getStore().reload()
}}}]}),store:new Ext.data.DirectStore({remoteSort:false,directFn:HttpCommander.Common.GetAnonymLinks,baseParams:{linkPath:null},paramOrder:["linkPath"],idProperty:"id",totalProperty:"total",successProperty:"success",root:"data",fields:[{name:"id",type:"int"},{name:"key",type:"string"},{name:"date",type:"date",dateFormat:"timestamp"},{name:"expires",type:"date",dateFormat:"timestamp"},{name:"withpasswd",type:"boolean"},{name:"password",type:"string"},{name:"virt_path",type:"string"},{name:"acl",type:"int"},{name:"downloads",type:"string"},{name:"notes",type:"string"},{name:"emails",type:"string"},{name:"upload_overwrite",type:"boolean"},{name:"isfolder",type:"boolean"},{name:"perms",mapping:"perms"},{name:"show_comments",type:"boolean"},{name:"access_users",type:"string"},{name:"url",type:"string"},{name:"url2",type:"string"},{name:"shortUrl",type:"string"},{name:"shortUrl2",type:"string"}],listeners:{beforeload:function(d,e){d.baseParams.linkPath=c.linkPath
}}}),plugins:[new Ext.ux.grid.GridFilters({menuFilterText:b.htcConfig.locData.MenuFilterText,encode:false,local:true,filters:[{dataIndex:"virt_path",type:"string",emptyText:b.htcConfig.locData.EmptyTextFilter},{dataIndex:"isfolder",type:"boolean",yesText:b.htcConfig.locData.CommonValueTypeFolder,noText:b.htcConfig.locData.CommandFile},{dataIndex:"date",type:"date",afterText:b.htcConfig.locData.AfterDateFilterText,beforeText:b.htcConfig.locData.BeforeDateFilterText,onText:b.htcConfig.locData.OnDateFilterText},{dataIndex:"expires",type:"date",afterText:b.htcConfig.locData.AfterDateFilterText,beforeText:b.htcConfig.locData.BeforeDateFilterText,onText:b.htcConfig.locData.OnDateFilterText},{dataIndex:"withpasswd",type:"boolean",yesText:b.htcConfig.locData.ExtMsgButtonTextYES,noText:b.htcConfig.locData.ExtMsgButtonTextNO},{dataIndex:"downloads",type:"numeric",menuItemCfgs:{emptyText:b.htcConfig.locData.EmptyTextFilter}},{dataIndex:"show_comments",type:"boolean",yesText:b.htcConfig.locData.ExtMsgButtonTextYES,noText:b.htcConfig.locData.ExtMsgButtonTextNO}]})],colModel:new Ext.grid.ColumnModel({defaults:{sortable:true},columns:[{id:"view-links-virtpath",header:b.htcConfig.locData.CommonFieldLabelPath,dataIndex:"virt_path",renderer:b.renderers.wordWrapRenderer},{id:"view-links-type",header:b.htcConfig.locData.CommonFieldLabelType,dataIndex:"isfolder",width:70,renderer:function(i,d,h,g,f,e){return b.htcConfig.locData[(i?"CommonValueTypeFolder":"CommandFile")]
}},{id:"view-links-datecreated",header:b.htcConfig.locData.AnonymousViewLinksDateCreatedColumn,dataIndex:"date",renderer:b.renderers.dateRendererWithQTip,width:125,hidden:true},{id:"view-links-dateexpired",header:b.htcConfig.locData.AnonymousViewLinksDateExpiredColumn,dataIndex:"expires",renderer:b.renderers.dateRendererWithQTip,width:125},{id:"view-links-with-passwd",header:b.htcConfig.locData.CommonFieldLabelPassword,dataIndex:"withpasswd",renderer:b.renderers.booleanRenderer,width:70,align:"center"},{id:"view-links-permission",header:b.htcConfig.locData.AnonymousViewLinksPermissionColumn,dataIndex:"acl",renderer:function(k,d,i,h,f,e){var g="";
if((k&1)!=0){g+=b.htcConfig.locData.PublicFolderAnonymViewContent
}if((k&2)!=0){g+=(g==""?"":", ")+b.htcConfig.locData.PublicFolderAnonymDownload
}if((k&4)!=0){g+=(g==""?"":", ")+b.htcConfig.locData.PublicFolderAnonymUpload
}if((k&8)!=0){g+=(g==""?"":", ")+b.htcConfig.locData.PublicFolderAnonymZipDownload
}return String.format("<span style='white-space: normal;'>{0}</span>",g)
}},{id:"view-links-showcomments",header:b.htcConfig.locData.AnonymousLinkShowCommentsShort,dataIndex:"show_comments",renderer:b.renderers.booleanRenderer,width:70,align:"center",hidden:true},{id:"view-links-downloaded",header:b.htcConfig.locData.AnonymousViewLinksDownloadedColumn,dataIndex:"downloads",hidden:true}]}),flex:1,stripeRows:true,keys:{key:[Ext.EventObject.ENTER],fn:function(d){if(d==Ext.EventObject.ENTER){a.openEditPublicLink(a)
}},scope:a},listeners:{rowdblclick:function(d,f,g){d.openEditPublicLink(d)
}}})]});
return c
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.DataRenderers=function(c){var g="&#8205;<img ext:qtip='{0}' src='{1}' class='filetypeimage' />",a="&#8205;<img style='cursor:pointer;' ext:qtip='{0}' src='{1}' class='filetypeimage' onclick='HttpCommander.Main.FileManagers[\""+c.getUid()+"\"].{2}({3})' />";
var f="&#8205;<span class='comment-txt icon-comment' ext:qtip='{0}' onclick='HttpCommander.Main.FileManagers[\""+c.getUid()+"\"].{1}({2},true)'>{3}</span>&nbsp;";
var e=function(p,i,o,n,l,k){if(p==null){return null
}var q;
try{if(!!k&&k.isUSA){q=(p.getMonth()+1)+"/"+p.getDate()+"/"
}else{q=p.getDate()+"/"+(p.getMonth()+1)+"/"
}q+=p.getFullYear()+" "+p.toLocaleTimeString()
}catch(m){q=p.toLocaleString()
}return q
};
var b=function(l,i){if(typeof l=="undefined"||l==null||String(l)==""){return""
}var k=parseFloat(l);
if(isNaN(k)||!isFinite(k)){return""
}if(i&&k<0){return""
}else{if(k<1024){return k+" bytes"
}else{if(k<1048576){return(Math.round(((k*10)/1024))/10)+" KB"
}else{if(k<1073741824){return(Math.round(((k*10)/1048576))/10)+" MB"
}else{return(Math.round(((k*10)/1073741824))/10)+" GB"
}}}}};
var h=function(i){return b(i,false)
};
var d=function(o,k,p){if(!Ext.isObject(o)){return""
}var i=Ext.isNumber(p)&&Ext.isObject(o.data);
var m=i?o.data:o;
if(!Ext.isObject(m)||Ext.isEmpty(m.label)||Ext.isEmpty(m.label_color)){return""
}var n=c.getHtcConfig();
var l="";
if(!Ext.isEmpty(m.label_user)&&Ext.isDefined(m.label_date)){l=String.format(n.locData.LabelsLabelInfoTip,m.label,e(i?o.get("label_date"):(Ext.isDate(m.label_date)?m.label_date:new Date(m.label_date*1000)),null,o,null,null,k),HttpCommander.Lib.Utils.parseUserName(m.label_user))
}else{l=m.label
}return'&#8205;<span class="file-folder-label" ext:qtip="'+Ext.util.Format.htmlEncode(Ext.util.Format.htmlEncode(l))+'" style="background-color:'+Ext.util.Format.htmlEncode(m.label_color)+(n.enabledLabels&&i?";cursor:pointer":";cursor:default")+';"'+(n.enabledLabels&&i?" onclick='HttpCommander.Main.FileManagers[\""+c.getUid()+'"].showLabelsMenu('+p+",this);'":"")+">"+Ext.util.Format.htmlEncode(m.label)+"</span>"
};
return{dateRendererWithQTip:function(q,k,p,o,m,l){if(q==null){return null
}var i;
try{if(!!l&&!!l.reader&&!!l.reader.jsonData&&l.reader.jsonData.isUSA){i=(q.getMonth()+1)+"/"+q.getDate()+"/"
}else{i=q.getDate()+"/"+(q.getMonth()+1)+"/"
}i+=q.getFullYear()+" "+q.toLocaleTimeString()
}catch(n){i=q.toLocaleString()
}return i
},sizeRenderer:h,sizeNegRenderer:function(i){return b(i,true)
},namePublicRenderer:function(p,l,i,o,s,q){var t="";
var k=i.data.url2;
if(Ext.isEmpty(k)||k.trim().length==0){k=i.data.url
}var m=String.format(" ext:qtip='{0}' ",Ext.util.Format.htmlEncode(c.getHtcConfig().locData.GridRowPublicHint));
var n=(!Ext.isEmpty(k)&&k.trim().length>0);
if(i.data.rowtype=="uplink"){t+="<span class='x-tree-node'><a href='' class='fileNameLink' onclick='HttpCommander.Main.FileManagers[\""+c.getUid()+'"].shared'+(q.sharedForYou?"FY":"")+"GridRowAction("+o+", null); return false;'><img src='"+c.getHtcConfig().relativePath+i.data.icon+"' class='filetypeimage' />"+Ext.util.Format.htmlEncode(p)+"</a></span>"
}else{if(q.sharedForYou&&!n){t+="<span class='x-tree-node' style='white-space: normal;'><img src='"+c.getHtcConfig().relativePath+i.data.icon+"' class='filetypeimage' /><a "+m+'class="fileNameLink" href="'+c.getHtcConfig().relativePath+"Handlers/Viewer.aspx?path="+Ext.util.Format.htmlEncode(encodeURIComponent(p))+"&key="+encodeURIComponent(i.data.key||"")+'&svc=sharedforyou" target="_blank">'+Ext.util.Format.htmlEncode(p)+"</a></span>"
}else{t+="<span class='x-tree-node' style='white-space: normal;'><img src='"+c.getHtcConfig().relativePath+i.data.icon+"' class='filetypeimage' />"+(n?("<a "+m+'class="fileNameLink" href="'+Ext.util.Format.htmlEncode(k)+'" target="_blank">'):"")+Ext.util.Format.htmlEncode(p)+(n?"</a>":"")+"</span>"
}}return t
},nameRenderer:function(B,D,z,s,A,p){var t="";
var y="";
var q=(z.data.srowtype=="recent");
var n=(z.data.srowtype=="trash");
var o=(z.data.srowtype=="alert");
var G="";
var k=(c.getHtcConfig().watchForModifs===true)?z.data.watchForModifs:null;
if(!o&&!Ext.isEmpty(z.data.datemodified)){y+='<span style="font-weight:bold;">'+(c.getHtcConfig().locData[n?"TrashLabelDateDeleted":"CommonFieldLabelDateModified"]).replace(/\s/gi,"&nbsp;")+"</span>:&nbsp;"+(e(z.data.datemodified,D,z,s,A,p)).replace(/\s/gi,"&nbsp;")
}if(!n&&!Ext.isEmpty(z.data.datecreated)){if(y.length>0){y+="<br />"
}y+='<span style="font-weight:bold;">'+(c.getHtcConfig().locData.CommonFieldLabelDateCreated).replace(/\s/gi,"&nbsp;")+"</span>:&nbsp;"+(e(z.data.datecreated,D,z,s,A,p)).replace(/\s/gi,"&nbsp;")
}if(!o&&!n&&!Ext.isEmpty(z.data.dateaccessed)){if(y.length>0){y+="<br />"
}y+='<span style="font-weight:bold;">'+(c.getHtcConfig().locData.CommonFieldLabelDateAccessed).replace(/\s/gi,"&nbsp;")+"</span>:&nbsp;"+(e(z.data.dateaccessed,D,z,s,A,p)).replace(/\s/gi,"&nbsp;")
}if(!Ext.isEmpty(z.data.type)){if(y.length>0){y+="<br />"
}y+='<span style="font-weight:bold;">'+(c.getHtcConfig().locData.CommonFieldLabelType).replace(/\s/gi,"&nbsp;")+"</span>:&nbsp;"+(Ext.util.Format.htmlEncode(z.data.type)).replace(/\s/gi,"&nbsp;")
}if((q||n)&&!Ext.isEmpty(z.data.qtip)){if(y.length>0){y+="<br />"
}y+='<span style="font-weight:bold;">'+(c.getHtcConfig().locData.CommonValueTypeFolder).replace(/\s/gi,"&nbsp;")+"</span>:&nbsp;"+z.data.qtip.replace(/\s/gi,"&nbsp;")
}if(z.data.rowtype=="file"){var x=h(z.data.size);
if(!Ext.isEmpty(x)){if(y.length>0){y+="<br />"
}y+='<span style="font-weight:bold;">'+(c.getHtcConfig().locData.CommonFieldLabelSize)+"</span>:&nbsp;"+x.replace(/\s/gi,"&nbsp;")
}var m=HttpCommander.Lib.Utils.getFileExtension(z.data.name);
var u=(m=="lnk"||m=="url");
var C=c.getHtcConfig().googleDriveFileTypes&&c.getHtcConfig().googleDriveFileTypes.indexOf(";"+m+";")>=0;
if(!n&&(o||q||u||C)){G=(o||q)?String.format(" ext:qtip='{0}' ",c.getHtcConfig().locData[o?"GridRowAlertHint":"GridRowRecentHint"]):"";
t+="<span class='x-tree-node'><a "+G+"href='' class='fileNameLink' onclick='HttpCommander.Main.FileManagers[\""+c.getUid()+'"].gridRowAction('+s+", null); return false;'>"
}t+="<img src='"+c.getHtcConfig().relativePath+z.data.icon+"' class='filetypeimage' "+(y.length>0?String.format("ext:qtip='{0}'",Ext.util.Format.htmlEncode(y)):"")+" />";
var i=z.data.size||z.data.size_hidden,w=0;
if(!Ext.isEmpty(i)&&String(i).trim().length>0){w=parseFloat(i);
if(isNaN(w)||!isFinite(w)){w=0
}}var v=HttpCommander.Lib.Utils.getFileExtension(z.data.name);
if(!q&&!n&&c.getHtcConfig().currentPerms&&c.getHtcConfig().currentPerms.download&&c.getHtcConfig().showImagesThumbnail&&HttpCommander.Lib.Consts.imagesFileTypes.indexOf(";"+v+";")!=-1&&w>0){var F="";
var E=(v=="svg");
if(Ext.isDate(z.data.datemodified)){F="date="+z.data.datemodified.getTime()+"&"
}else{if(E){F="date="+((new Date()).getTime())+"&"
}}t+='<span ext:qclass="x-thumbnail" ext:qtip="'+Ext.util.Format.htmlEncode("<span class='img-shadow'><img align='absmiddle' class='filetypeimage' alt='' src='"+c.getHtcConfig().relativePath+(E?"Handlers/Download.ashx?action=download&":"Handlers/ThumbnailHandler.ashx?")+F+"file="+encodeURIComponent(c.getCurrentFolder()+"/"+z.data.name).replace(/'/gi,"%27").replace(/"/gi,"%22")+"' "+(E?('style="max-width:160px !important;max-height:120px !important;" '):"")+"/></span>")+'" >'+Ext.util.Format.htmlEncode(B)+"</span>"
}else{t+=Ext.util.Format.htmlEncode(B)
}if(!n&&(o||q||u||C)){t+="</a></span>"
}if(c.labelsIsHided()){t+="&nbsp;";
if(z.data.isnew){t+=String.format(g,Ext.util.Format.htmlEncode(String.format(c.getHtcConfig().locData.FileWasCreatedHint,HttpCommander.Lib.Utils.dateDiff(z.data.datecreated,new Date(),c.getHtcConfig().locData.DaysShort,c.getHtcConfig().locData.HoursShort,c.getHtcConfig().locData.MinutesShort))),HttpCommander.Lib.Utils.getIconPath(c,"isnew"))
}if(z.data.ismod){t+=String.format(g,Ext.util.Format.htmlEncode(String.format(c.getHtcConfig().locData.FileWasModifiedHint,HttpCommander.Lib.Utils.dateDiff(z.data.datemodified,new Date(),c.getHtcConfig().locData.DaysShort,c.getHtcConfig().locData.HoursShort,c.getHtcConfig().locData.MinutesShort))),HttpCommander.Lib.Utils.getIconPath(c,"ismod"))
}if(Ext.isObject(k)){t+=String.format(a,Ext.util.Format.htmlEncode(c.getHtcConfig().locData.WatchForModifsIconHint),HttpCommander.Lib.Utils.getIconPath(c,"watch"),"viewWatch",s)
}if(Ext.isNumber(z.data.comments)&&z.data.comments>0){t+=String.format(f,Ext.util.Format.htmlEncode(String.format(c.getHtcConfig().locData.CommentsCountInfoTip,z.data.comments)),"viewChangeDetails",s,z.data.comments)
}else{if(z.data.isdet){t+=String.format(a,Ext.util.Format.htmlEncode(c.getHtcConfig().locData.FileContainsMetaDataHint),HttpCommander.Lib.Utils.getIconPath(c,"details"),"viewChangeDetails",s)
}}if((c.getHtcConfig().enableMSOfficeEdit||c.getHtcConfig().enableOpenOfficeEdit||c.getHtcConfig().enableWebFoldersLinks)&&z.data.locked){t+=String.format(g,Ext.util.Format.htmlEncode(c.getHtcConfig().locData.IsLockedHint),HttpCommander.Lib.Utils.getIconPath(c,"lock"))
}if(c.getHtcConfig().enableVersionControl&&z.data.vstate){if(z.data.vstate&1){t+=String.format(g,Ext.util.Format.htmlEncode(c.getHtcConfig().locData.IsCheckedOutHint),HttpCommander.Lib.Utils.getIconPath(c,"checkout"))
}if(z.data.vstate&4){t+=String.format(a,Ext.util.Format.htmlEncode(c.getHtcConfig().locData.ExistsOldVersionsHint),HttpCommander.Lib.Utils.getIconPath(c,"verhist"),"versionHistory",s)
}}try{if(z.data.publiclinks>0){t+=String.format(a,Ext.util.Format.htmlEncode(c.getHtcConfig().locData.ExistsPublicLinksFileHint),HttpCommander.Lib.Utils.getIconPath(c,"sharefolder"),"editOrViewPublicLinks",s)
}}catch(l){}t+=d(z,p,s)
}return"<span>"+t+"</span>"
}else{G=(o||q)?String.format(" ext:qtip='{0}' ",c.getHtcConfig().locData[o?"GridRowAlertHint":"GridRowRecentHint"]):"";
t="<span class='x-tree-node'>"+(n?"":("<a "+G+"href='' class='fileNameLink fakeFolderNameForDnD' onclick='HttpCommander.Main.FileManagers[\""+c.getUid()+'"].gridRowAction('+s+", null); return false;'>"))+"<img src='"+c.getHtcConfig().relativePath+z.data.icon+"' class='filetypeimage' "+(y.length>0?String.format("ext:qtip='{0}'",Ext.util.Format.htmlEncode(y)):"")+" />"+Ext.util.Format.htmlEncode(B)+(n?"":"</a>")+"</span>";
if(c.labelsIsHided()){t+="&nbsp;";
if(z.data.isnew){t+=String.format(g,Ext.util.Format.htmlEncode(String.format(c.getHtcConfig().locData.FileWasCreatedHint,HttpCommander.Lib.Utils.dateDiff(z.data.datecreated,new Date(),c.getHtcConfig().locData.DaysShort,c.getHtcConfig().locData.HoursShort,c.getHtcConfig().locData.MinutesShort))),HttpCommander.Lib.Utils.getIconPath(c,"isnew"))
}if(z.data.ismod){t+=String.format(g,Ext.util.Format.htmlEncode(String.format(c.getHtcConfig().locData.FileWasModifiedHint,HttpCommander.Lib.Utils.dateDiff(z.data.datemodified,new Date(),c.getHtcConfig().locData.DaysShort,c.getHtcConfig().locData.HoursShort,c.getHtcConfig().locData.MinutesShort))),HttpCommander.Lib.Utils.getIconPath(c,"ismod"))
}if(Ext.isObject(k)){t+=String.format(a,Ext.util.Format.htmlEncode(c.getHtcConfig().locData.WatchForModifsIconHint),HttpCommander.Lib.Utils.getIconPath(c,"watch"),"viewWatch",s)
}if(Ext.isNumber(z.data.comments)&&z.data.comments>0){t+=String.format(f,Ext.util.Format.htmlEncode(String.format(c.getHtcConfig().locData.CommentsCountInfoTip,z.data.comments)),"viewChangeDetails",s,z.data.comments)
}else{if(z.data.isdet){t+=String.format(a,Ext.util.Format.htmlEncode(c.getHtcConfig().locData.FileContainsMetaDataHint),HttpCommander.Lib.Utils.getIconPath(c,"details"),"viewChangeDetails",s)
}}try{if(z.data.publiclinks>0){t+=String.format(a,Ext.util.Format.htmlEncode(c.getHtcConfig().locData.ExistsPublicLinksFolderHint),HttpCommander.Lib.Utils.getIconPath(c,"sharefolder"),"editOrViewPublicLinks",s)
}}catch(l){}t+=d(z,p,s)
}return t
}},labelRenderer:function(p,k,i,n,s,q){var t="";
var m=(c.getHtcConfig().watchForModifs===true)?i.data.watchForModifs:null;
if(i.data.isnew){t+=String.format(g,Ext.util.Format.htmlEncode(String.format(c.getHtcConfig().locData.FileWasCreatedHint,HttpCommander.Lib.Utils.dateDiff(i.data.datecreated,new Date(),c.getHtcConfig().locData.DaysShort,c.getHtcConfig().locData.HoursShort,c.getHtcConfig().locData.MinutesShort))),HttpCommander.Lib.Utils.getIconPath(c,"isnew"))
}if(i.data.ismod){t+=String.format(g,Ext.util.Format.htmlEncode(String.format(c.getHtcConfig().locData.FileWasModifiedHint,HttpCommander.Lib.Utils.dateDiff(i.data.datemodified,new Date(),c.getHtcConfig().locData.DaysShort,c.getHtcConfig().locData.HoursShort,c.getHtcConfig().locData.MinutesShort))),HttpCommander.Lib.Utils.getIconPath(c,"ismod"))
}if(Ext.isObject(m)){t+=String.format(a,Ext.util.Format.htmlEncode(c.getHtcConfig().locData.WatchForModifsIconHint),HttpCommander.Lib.Utils.getIconPath(c,"watch"),"viewWatch",n)
}if(Ext.isNumber(i.data.comments)&&i.data.comments>0){t+=String.format(f,Ext.util.Format.htmlEncode(String.format(c.getHtcConfig().locData.CommentsCountInfoTip,i.data.comments)),"viewChangeDetails",n,i.data.comments)
}else{if(i.data.isdet){t+=String.format(a,Ext.util.Format.htmlEncode(c.getHtcConfig().locData.FileContainsMetaDataHint),HttpCommander.Lib.Utils.getIconPath(c,"details"),"viewChangeDetails",n)
}}if(i.data.rowtype=="file"){if((c.getHtcConfig().enableMSOfficeEdit||c.getHtcConfig().enableOpenOfficeEdit||c.getHtcConfig().enableWebFoldersLinks)&&i.data.locked){t+=String.format(g,Ext.util.Format.htmlEncode(c.getHtcConfig().locData.IsLockedHint),HttpCommander.Lib.Utils.getIconPath(c,"lock"))
}if(c.getHtcConfig().enableVersionControl&&i.data.vstate){if(i.data.vstate&1){t+=String.format(g,Ext.util.Format.htmlEncode(c.getHtcConfig().locData.IsCheckedOutHint),HttpCommander.Lib.Utils.getIconPath(c,"checkout"))
}if(i.data.vstate&4){t+=String.format(a,Ext.util.Format.htmlEncode(c.getHtcConfig().locData.ExistsOldVersionsHint),HttpCommander.Lib.Utils.getIconPath(c,"verhist"),"versionHistory",n)
}}}try{if(i.data.publiclinks>0){t+=String.format(a,Ext.util.Format.htmlEncode(c.getHtcConfig().locData.ExistsPublicLinksFileHint),HttpCommander.Lib.Utils.getIconPath(c,"sharefolder"),"editOrViewPublicLinks",n)
}}catch(l){}if(!Ext.isEmpty(i.data.label)&&!Ext.isEmpty(i.data.label_color)){var o="";
if(!Ext.isEmpty(i.data.label_user)&&Ext.isDefined(i.data.label_date)){o=String.format(c.getHtcConfig().locData.LabelsLabelInfoTip,i.data.label,e(i.get("label_date"),k,i,n,s,q),HttpCommander.Lib.Utils.parseUserName(i.data.label_user))
}else{o=i.data.label
}t+='&#8205;<span class="file-folder-label" ext:qtip="'+Ext.util.Format.htmlEncode(Ext.util.Format.htmlEncode(o))+'" style="background-color:'+Ext.util.Format.htmlEncode(i.data.label_color)+(htcConfig.enabledLabels?";cursor:pointer":"")+';"'+(htcConfig.enabledLabels?" onclick='HttpCommander.Main.FileManagers[\""+c.getUid()+'"].showLabelsMenu('+n+",this);'":"")+">"+Ext.util.Format.htmlEncode(i.data.label)+"</span>"
}return t
},qtipCellRenderer:function(l,i,k){i.attr="";
if(l&&l!=""){i.attr='ext:qtip="'+Ext.util.Format.htmlEncode(Ext.util.Format.htmlEncode(l)).replace(/\r\n|\n\r/gi,"<br />").replace(/\n|\r|\u21B5/gi,"<br />")+'" ext:qchilds="true"'
}return Ext.util.Format.htmlEncode(l||"")
},htmlEncodedRenderer:function(n,k,i,o,m,l){return Ext.util.Format.htmlEncode(n||"")
},searchNameRenderer:function(n,i,m,o,l,k){return"<img src='"+c.getHtcConfig().relativePath+m.data.icon+"' class='filetypeimage'> <span class='x-tree-node'><a href='' class='fileNameLink' onclick='HttpCommander.Main.FileManagers[\""+c.getUid()+'"].searchGridRowAction(null, '+o+", null); return false;'>"+Ext.util.Format.htmlEncode(n)+"</a></span>"
},wordWrapRenderer:function(l,i,k){return String.format("<span style='white-space: normal;'>{0}</span>",Ext.util.Format.htmlEncode(l||""))
},wordWrapRendererWithoutEncoding:function(l,i,k){return String.format("<span style='white-space: normal;'>{0}</span>",l||"")
},dateRendererLocal:e,booleanRenderer:function(o,i,n,m,l,k){i.css+=" x-grid3-check-col-td";
if(n.get("rowtype")=="uplink"){return"&nbsp;"
}return String.format('<div class="x-grid3-check-col{0}">&#160;</div>',o?"-on":"")
},labelItemRenderer:d}
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.DetailsPane=function(config){var me,hdr,pps,tmb,hst,cmt,drp,wps,eps,lmk,htcConfig=config.htcConfig,debugmode=config.getDebugMode(),mdp=config.getMetadataProvider(),renderers=config.getRenderers(),cmtBlockTpl='<div class="comment-card-w-hint"><div class="comment-card"><div class="threaded-comment-list"><div><div class="comment-activity"><div class="comment">{0}<div class="comment-body"><div class="comment-top-bar"><div class="commenter-name">{1}</div><div class="comment-when"><div class="activity-time-ago">{2}</div></div></div><span><div class="comment-text">{3}</div></span></div></div></div></div></div></div></div>';
Ext.util.Format.htmlEncodeWrap=function(value){return !value?value:Ext.util.Format.htmlEncode(value).replace(/\r\n|\n\r/gi,"<br />").replace(/\n|\r|\u21B5/gi,"<br />")
};
window.onSaveDesc=function(img){if(!config.htcConfig.allowedDescription||!img||!img.parentNode){return false
}var ta=img.parentNode.firstChild;
if(!ta){return false
}config.globalLoadMask.msg=config.htcConfig.locData.DetailsSavingMsg+"...";
config.globalLoadMask.show();
HttpCommander.Metadata.SaveDesc({path:me.itemPath,name:me.itemName,desc:ta.value},function(data,trans){config.globalLoadMask.hide();
config.globalLoadMask.msg=config.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(data,trans,config.Msg,config.htcConfig)){config.openGridFolder(config.getCurrentFolder())
}});
return false
};
var calcWpsHeight=function(){var th=50,i=0,len,view,row;
if(!!wps&&wps.rendered){len=wps.getStore().getTotalCount();
view=wps.getView();
for(;
i<len;
i++){try{row=view.getRow(i);
th+=Ext.fly(row).getHeight()
}catch(e){th+=26
}}if(th<180){th=180
}wps.setHeight(th);
wps.syncSize();
wps.doLayout();
view.refresh()
}return th
};
var getMetadata=function(name,path,skipreadme,callback){if(!me||!mdp||!name||!path||me.itemPath!=path||me.itemName!=name){if(!!lmk){lmk.hide()
}return
}if(!!lmk){lmk.show()
}HttpCommander.Metadata.Load({path:path,name:name,forDetailsPane:true,skipreadme:skipreadme},function(data,trans){if(Ext.isObject(data)&&data.success&&!!me&&!!(me.itemPath)&&!!(me.itemName)&&me.itemPath==data.path&&me.itemName==data.name){if(Ext.isFunction(callback)){callback.call(me,skipreadme,data)
}else{if(!!lmk){lmk.hide()
}}}else{if(!!lmk){lmk.hide()
}}})
};
var updateBaseProps=function(row,isRow){var props={datecreated:"",dateaccessed:"",datemodified:"",type:"",size:"",attributes:"",downloads:"",labelDisplay:"none",labelHtml:"&nbsp;"};
if(isRow){if(row.rowtype=="folder"||row.rowtype=="file"){props.type=row.type||"";
props.attributes=row.attributes||"";
if(row.rowtype=="folder"){props.size="<span id='"+config.$("linkCalculateDirSize1")+"'><a href='#'>"+htcConfig.locData.FolderCalculateSize+"...</a></span>";
props.contains='<tr><td class="prop-name">'+htcConfig.locData.FolderContainsField+':</td><td class="prop-value"><span id=\''+config.$("linkCalculateDirCounts1")+"'><a href='#'>"+htcConfig.locData.FolderCalculateSize+"...</a></span></td></tr>"
}else{if(row.size&&String(row.size)!=""){var sizeInBytes=row.size;
props.size=renderers.sizeRenderer(row.size);
if(props.size.toLowerCase().indexOf("byte")==-1){props.size+=" ("+sizeInBytes+"&nbsp;bytes)"
}}}if(row.rowtype=="file"&&htcConfig.allowSetReadOnly){var attr=[];
if(!!row.attributes){attr=row.attributes.split(/\s*,\s*/)
}var detectReadOnly=false;
var attrHtml="";
for(var i=0;
i<attr.length;
i++){if(attr[i]=="ReadOnly"){detectReadOnly=true
}else{attrHtml+=attr[i]+", "
}}props.attributes=Ext.util.Format.htmlEncode(attrHtml)+'<input style="vertical-align:middle;" type="checkbox" '+(detectReadOnly?'checked="checked" ':"")+" id='"+config.$("linkReadOnlyAttribute1")+"' /> ReadOnly"
}}if(row.rowtype=="file"){var isEnableDownloadings=false;
if(Ext.isNumber(row.downloads)&&row.downloads>=0){props.downloads='<tr><td class="prop-name">'+htcConfig.locData.AmountOfDownloadingsFile+':</td><td class="prop-value">'+Ext.util.Format.htmlEncode(row.downloads)+"</td></tr>";
isEnableDownloadings=true
}if(!isEnableDownloadings){props.downloads=""
}}var grdStore=config.getGrid();
if(!!grdStore){grdStore=grdStore.getStore()
}else{grdStore=null
}if(row.datecreated){props.datecreated=renderers.dateRendererLocal(row.datecreated,null,null,null,null,grdStore)
}if(row.datemodified){props.datemodified=renderers.dateRendererLocal(row.datemodified,null,null,null,null,grdStore)
}if(row.dateaccessed){props.dateaccessed=renderers.dateRendererLocal(row.dateaccessed,null,null,null,null,grdStore)
}if(config.htcConfig.enabledLabels&&!Ext.isEmpty(row.label)&&!Ext.isEmpty(row.label_color)){props.labelHtml=renderers.labelItemRenderer(row,grdStore);
props.labelDisplay=""
}}else{if(Ext.isObject(row)){props.type=row.type||"";
props.attributes=row.attributes||"";
if(row.isDir){props.size="<span id='"+config.$("linkCalculateDirSize1")+"'><a href='#'>"+config.htcConfig.locData.FolderCalculateSize+"...</a></span>";
props.contains='<tr><td class="prop-name">'+config.htcConfig.locData.FolderContainsField+':</td><td class="prop-value"><span id=\''+config.$("linkCalculateDirCounts1")+"'><a href='#'>"+config.htcConfig.locData.FolderCalculateSize+"...</a></span></td></tr>"
}else{if(row.size&&String(row.size)!=""){var sizeInBytes=row.size;
props.size=config.getRenderers().sizeRenderer(row.size);
if(props.size.toLowerCase().indexOf("byte")==-1){props.size+=" ("+sizeInBytes+"&nbsp;bytes)"
}}if(config.htcConfig.allowSetReadOnly){var attr=[];
if(row.attributes){attr=row.attributes.split(/\s*,\s*/)
}var detectReadOnly=false;
var attrHtml="";
for(var i=0;
i<attr.length;
i++){if(attr[i]=="ReadOnly"){detectReadOnly=true
}else{attrHtml+=attr[i]+", "
}}props.attributes=Ext.util.Format.htmlEncode(attrHtml)+'<input style="vertical-align:middle;" type="checkbox" '+(detectReadOnly?'checked="checked" ':"")+" id='"+config.$("linkReadOnlyAttribute1")+"' /> ReadOnly"
}var isEnableDownloadings=false;
if(typeof row.downloadings!="undefined"&&row.downloadings>=0){props.downloads='<tr><td class="prop-name">'+config.htcConfig.locData.AmountOfDownloadingsFile+':</td><td class="prop-value">'+Ext.util.Format.htmlEncode(row.downloadings)+"</td></tr>";
isEnableDownloadings=true
}if(!isEnableDownloadings){props.downloads=""
}}var grdStore=config.getGrid();
if(!!grdStore){grdStore=grdStore.getStore()
}else{grdStore=null
}if(row.created){props.datecreated=renderers.dateRendererLocal(row.created,null,null,null,null,grdStore)
}if(row.modified){props.datemodified=renderers.dateRendererLocal(row.modified,null,null,null,null,grdStore)
}if(row.accessed){props.dateaccessed=renderers.dateRendererLocal(row.accessed,null,null,null,null,grdStore)
}if(config.htcConfig.enabledLabels&&!Ext.isEmpty(row.label)&&!Ext.isEmpty(row.label_color)){props.labelHtml=renderers.labelItemRenderer(row,grdStore);
props.labelDisplay=""
}if(!!pps){if(pps.rendered){pps.update(props);
setTimeout(function(){bindLinkHandlers.call(me)
},100)
}else{pps.data=props
}}}}return props
};
var prepareFileProperties=function(row,path){if(!!cmt){cmt.stopEditing(true)
}drp.hide();
var skipreadme=false,props={datecreated:"",dateaccessed:"",datemodified:"",type:"",size:"",attributes:"",downloads:""},isArgsGood=Ext.isObject(row)&&!Ext.isEmpty(row.name)&&!Ext.isEmpty(path),name=isArgsGood?row.name:null;
if(!isArgsGood||row.isParent){if(!!drp){if(!Ext.isEmpty(path)){skipreadme=true;
var descReadme={desc:config.htcConfig.folderDescription||"",readme:config.htcConfig.readmeContent||"&nbsp;",isfile:false,edit:!!config.htcConfig.currentPerms&&config.htcConfig.currentPerms.modify};
if(drp.rendered){drp.update(descReadme)
}else{drp.data=descReadme
}drp.show()
}}}if(!isArgsGood){path=null
}if(me.itemPath==path&&me.itemName==name&&!me.forceRefresh){if(!!lmk){lmk.hide()
}if(!!name||!!path){drp.show()
}return
}me.forceRefresh=false;
me.itemPath=isArgsGood?path:null;
me.itemName=isArgsGood?row.name:null;
if(!!wps){wps.getStore().loadData([]);
wps.getStore().commitChanges()
}if(!!hst){hst.getStore().loadData([]);
hst.getStore().commitChanges();
hst.ownerCt.setTitle("&nbsp;")
}if(!!cmt){var cmtStore=cmt.getStore();
if(!!cmtStore){cmtStore.loadData([]);
cmtStore.commitChanges();
changeAvailableFields.call(me,cmtStore)
}cmt.buttons[0].setValue("");
cmt.buttons[2].setDisabled(true);
cmt.ownerCt.setTitle("&nbsp;")
}if(isArgsGood){if(!!mdp&&!me.collapsed){if(!mdp.hasListener("requestcreated")){mdp.on("requestcreated",function(prov,opt,req){var ts=Ext.isObject(opt)?opt.ts:null,prevReq=!!me?me.prevReq:null;
if(!!ts&&ts.method=="Load"&&!!(ts.args)&&!!(ts.args[0])&&ts.args[0].forDetailsPane){if(Ext.isObject(prevReq)){Ext.lib.Ajax.abort(prevReq)
}me.prevReq=req
}},mdp)
}(getMetadata.debounce(100,me))(row.name,path,skipreadme,function(skrdm,mdata){if(!!pps){updateBaseProps.call(me,mdata.props,false)
}if(!!drp&&!skrdm){var descReadme=null;
if(Ext.isObject(mdata.descme)){descReadme={desc:mdata.descme.desc||"",readme:mdata.descme.readme||"&nbsp;",isfile:mdata.descme.isfile||false,edit:mdata.descme.edit||false}
}else{if(!!mdata.props&&mdata.props.isDir){descReadme={desc:"",readme:"&nbsp;",isfile:false,edit:false}
}}if(!!descReadme){if(drp.rendered){drp.update(descReadme)
}else{drp.data=descReadme
}drp.show()
}}if(!!wps){var wpsData=mdata.wprops||[];
var wpsStore=wps.getStore();
if(wpsStore){wpsStore.isUSA=mdata.isUSA;
wpsStore.loadData(wpsData);
wpsStore.commitChanges()
}wps.setVisible(wpsData.length>0);
if(wps.rendered){wps.syncSize()
}wps.doLayout();
wps.setWidth("100%");
wps.body.setWidth("100%");
wps.getView().refresh();
if(wps.isVisible()){setTimeout(calcWpsHeight,50)
}}if(!!eps){var epsData=mdata.propsex||[];
if(eps.rendered){eps.update(epsData)
}else{eps.data=(epsData)
}eps.setVisible(epsData.length>0);
if(eps.rendered){eps.syncSize()
}eps.doLayout();
eps.setWidth("100%");
eps.body.setWidth("100%")
}if(!!hst){var hstStore=hst.getStore();
var hstTc=0;
if(hstStore){hstStore.isUSA=mdata.isUSA;
hstStore.loadData(mdata.modifications||[]);
hstStore.sort("date","DESC");
hstStore.commitChanges();
hstTc=hstStore.getTotalCount()
}hst.ownerCt.setTitle(hstTc<=0?"&nbsp;":hstTc);
if(hst.rendered){hst.syncSize()
}hst.doLayout()
}if(!!cmt){var cmtStore=cmt.getStore();
var cmtsTc=0;
if(!!cmtStore){cmtStore.isUSA=mdata.isUSA;
cmtStore.loadData(config.htcConfig.isAllowedComments<=0?[]:(mdata.metadata||[]));
cmtStore.filter("title","comment",false,false,true);
cmtsTc=cmtStore.data.length;
cmtStore.sort("datemodified","DESC");
cmtStore.commitChanges()
}cmt.ownerCt.setTitle(cmtsTc<=0?"&nbsp;":cmtsTc);
changeAvailableFields.call(me,cmtStore);
cmt.buttons[0].setValue("");
cmt.buttons[2].setDisabled(true);
var allowEditCmt=config.htcConfig.currentPerms&&config.htcConfig.currentPerms.modify;
cmt.fbar.setDisabled(!allowEditCmt);
if(cmt.rendered){cmt.syncSize()
}cmt.doLayout()
}if(!!lmk){lmk.hide()
}var mw=config.getMetadataWindow();
if(!!mw&&mw.isVisible()){setTimeout(function(){mw.initialize.call(mw,{path:me.itemPath,name:me.itemName},mdata);
mw.syncSizeWrap.call(mw)
},50)
}})
}props=updateBaseProps.call(me,row,true)
}else{if(!!lmk){lmk.hide()
}}if(!!pps){if(pps.rendered){pps.update(props);
setTimeout(function(){bindLinkHandlers.call(me)
},100)
}else{pps.data=props
}pps.setVisible(isArgsGood)
}if(!!wps){wps.setVisible(false)
}if(!!eps){eps.setVisible(false)
}};
var calculateDirSize=function(){var folderInfo={path:me.itemPath,name:me.itemName};
if(!folderInfo.path||!folderInfo.name||Ext.isEmpty(folderInfo.path)||Ext.isEmpty(folderInfo.name)){return
}var holder=document.getElementById(config.$("linkCalculateDirSize1"));
var hodler1=document.getElementById(config.$("linkCalculateDirCounts1"));
if(!holder||!hodler1){return
}if(holder.getElementsByTagName("a").length<1||hodler1.getElementsByTagName("a").length<1){return
}var oldContent=holder.innerHTML,oldContent1=hodler1.innerHTML;
holder.innerHTML='<img align="absmiddle" alt="'+htcConfig.locData.Calculating+'..." src="'+HttpCommander.Lib.Utils.getIconPath(htcConfig,"loadingsmall.gif")+'" />';
hodler1.innerHTML='<img align="absmiddle" alt="'+htcConfig.locData.Calculating+'..." src="'+HttpCommander.Lib.Utils.getIconPath(htcConfig,"loadingsmall.gif")+'" />';
HttpCommander.Common.CalculateSizeDir(folderInfo,function(data,trans){holder.innerHTML=oldContent;
hodler1.innerHTML=oldContent1;
if(typeof data=="undefined"){config.Msg.alert(htcConfig.locData.CommonErrorCaption,Ext.util.Format.htmlEncode(trans.message));
return
}if(!data.success){config.Msg.alert(htcConfig.locData.CommonErrorCaption,data.message)
}var sizeInBytes=data.size;
var recalcHtml=" <a href='#' >"+htcConfig.locData.FolderRecalculateSize+"...</a>";
var html=renderers.sizeRenderer(data.size);
if(html.toLowerCase().indexOf("byte")==-1){html+=" ("+sizeInBytes+"&nbsp;bytes)"
}html+=recalcHtml;
holder.innerHTML=html;
hodler1.innerHTML=String.format(htcConfig.locData.FolderContainsFilesFolders,data.files,data.folders)+recalcHtml;
bindLinkHandlers.call(me)
})
};
var readOnlyStateChange=function(){var checkBox=document.getElementById(config.$("linkReadOnlyAttribute1"));
if(htcConfig.allowSetReadOnly&&!Ext.isEmpty(me.itemPath)&&!Ext.isEmpty(me.itemName)){if(checkBox&&typeof checkBox.checked=="boolean"){var setReadOnlyInfo={readonly:checkBox.checked,path:me.itemPath,name:me.itemName};
config.globalLoadMask.msg=htcConfig.locData.ChangingReadOnlyProgressMessage+"...";
config.globalLoadMask.show();
HttpCommander.Common.ChangeReadOnly(setReadOnlyInfo,function(data,trans){config.globalLoadMask.hide();
config.globalLoadMask.msg=htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(data,trans,config.Msg,htcConfig)){checkBox.checked=setReadOnlyInfo.readonly
}else{checkBox.checked=!setReadOnlyInfo.readonly
}})
}}};
var bindLinkHandlers=function(){if(!me||!me.rendered){return
}var holder=document.getElementById(config.$("linkCalculateDirSize1"));
if(holder){holder.children[0].onclick=function(){calculateDirSize.call(me);
return false
}
}holder=document.getElementById(config.$("linkCalculateDirCounts1"));
if(holder){holder.children[0].onclick=function(){calculateDirSize.call(me);
return false
}
}holder=document.getElementById(config.$("linkReadOnlyAttribute1"));
if(holder){holder.onclick=function(){readOnlyStateChange.call(me);
return false
}
}};
var prepareData=function(sel,curFolder,fromExpand){if(me.expandCall&&!fromExpand){return
}if(!!lmk){lmk.show()
}var spec=config.isSpecialTreeFolderOrSubFolder(curFolder),row=(!spec&&!!sel&&!!(sel.data))?sel.data:null;
if(Ext.isEmpty(curFolder)){row=null;
curFolder=null
}if(!!row&&!spec&&(spec=config.isSpecialTreeFolderOrSubFolder(row.path))){row=null
}if(!row&&!Ext.isEmpty(curFolder)){if(curFolder=="root"||curFolder==":root"){curFolder=null
}else{if(!spec){var grid=config.getGrid();
if(!!grid&&grid.isVisible()){var upLink=grid.getStore().getAt(0);
if(!!upLink&&upLink.get("name")==".."){var fName=curFolder.trim().split("/");
var newCurFolder="",len=fName.length-1;
for(var i=0;
i<len;
i++){if(newCurFolder.length>0){newCurFolder+="/"
}newCurFolder+=fName[i]
}fName=fName[len].trim();
if(Ext.isEmpty(fName)){curFolder=null
}else{if(Ext.isEmpty(newCurFolder)){curFolder=":root"
}else{curFolder=newCurFolder
}row={dateaccessed:upLink.data.dateaccessed,datecreated:upLink.data.datecreated,datemodified:upLink.data.datemodified,icon:HttpCommander.Lib.Utils.getIconPath(config.htcConfig,"folder"),name:fName,rowtype:"folder",type:config.htcConfig.locData.CommonValueTypeFolder,isParent:true}
}}}}}}curFolder=spec?null:curFolder;
prepareFileProperties.call(me,row,curFolder);
var name=!!row?Ext.util.Format.htmlEncode(row.name||""):"";
var icon=!!row?row.icon:null;
if(Ext.isEmpty(name)&&!Ext.isEmpty(curFolder)){name=curFolder.trim().split("/");
name=name[name.length-1].trim();
if(Ext.isEmpty(name)){name=""
}else{if(!icon){icon=HttpCommander.Lib.Utils.getIconPath(config.htcConfig,"folder")
}}}setTitleIcon.call(me,name,icon);
setThumb.call(me,row,curFolder)
};
var setThumb=function(row,curFolder){var imgTag=null;
curFolder=curFolder?curFolder.replace(/\/+$/g,""):null;
if(!Ext.isEmpty(curFolder)&&curFolder.trim().length>0){curFolder+="/"
}var ext=row?HttpCommander.Lib.Utils.getFileExtension(row.name):"";
var fdsz=row?row.size||row.size_hidden:null,fileSZ=0;
if(!Ext.isEmpty(fdsz)&&String(fdsz).trim().length>0){fileSZ=parseFloat(fdsz);
if(isNaN(fileSZ)||!isFinite(fileSZ)){fileSZ=0
}}if(row&&htcConfig.currentPerms&&htcConfig.currentPerms.download&&htcConfig.showImagesThumbnail&&HttpCommander.Lib.Consts.imagesFileTypes.indexOf(";"+ext+";")!=-1&&fileSZ>0){var fileDate="";
var isSvg=(ext=="svg");
if(Ext.isDate(row.datemodified)){fileDate="date="+row.datemodified.getTime()+"&"
}else{if(isSvg){fileDate="date="+((new Date()).getTime())+"&"
}}imgTag="<img align='absmiddle' alt='' style='vertical-align:bottom;max-width:160px !important;max-height:120px !important;' src='"+htcConfig.relativePath+(isSvg?"Handlers/Download.ashx?action=download&":"Handlers/ThumbnailHandler.ashx?")+fileDate+"file="+encodeURIComponent(curFolder+row.name).replace(/'/gi,"%27").replace(/"/gi,"%22")+"' />"
}else{if(row&&htcConfig.currentPerms&&htcConfig.currentPerms.download&&htcConfig.enableThumbnailViewImagesLoading&&HttpCommander.Lib.Consts.imagesFileTypes&&HttpCommander.Lib.Consts.imagesFileTypes.indexOf(";"+ext+";")!=-1&&fileSZ>0){var fileDate="";
var isSvg=(ext=="svg");
if(Ext.isDate(row.datemodified)){fileDate="date="+row.datemodified.getTime()+"&"
}else{if(isSvg){fileDate="date="+((new Date()).getTime())+"&"
}}var sizeQuery=isSvg?"":("size="+maxWidthThumb+"x"+maxHeightThumb+"&");
imgTag='<img align="absmiddle" alt="" style="vertical-align:bottom;max-width:'+maxWidthThumb+"px !important;max-height:"+maxHeightThumb+'px !important;" src="'+htcConfig.relativePath+(isSvg?"Handlers/Download.ashx?action=download&":"Handlers/ThumbsGridViewHandler.ashx?")+fileDate+sizeQuery+"file="+encodeURIComponent(curFolder+row.name).replace(/'/gi,"%27").replace(/"/gi,"%22")+'" />'
}}if(Ext.isEmpty(imgTag)){imgTag="&nbsp;"
}else{imgTag+="<hr />"
}if(tmb.rendered){tmb.update(imgTag)
}else{tmb.html=imgTag
}};
var setTitleIcon=function(title,icon){var html="";
if(!!icon){html+='<img alt="" src="'+htcConfig.relativePath+icon+'" class="filetypeimage" />'
}if(!Ext.isEmpty(title)){html+='<span style="cursor:default;" ext:qtip="'+Ext.util.Format.htmlEncode(title)+'">'+title+"</span>"
}if(html.length>0){html+="<br />"
}if(hdr.rendered){hdr.update(html)
}else{hdr.html=html
}};
var getJSONMetadataArray=function(mds){var mdArray=new Array();
var data=(mds.snapshot||mds.data);
if(data.items!=undefined&&data.items!=null){Ext.each(data.items,function(item){mdArray.push(item.data)
})
}Ext.each(config.htcConfig.metaDataFields,function(f){if(f.type=="date"){Ext.each(mdArray,function(mdi){eval("if (mdi."+f.name+") try { mdi."+f.name+" = mdi."+f.name+".toUTCString(); } catch (e) { }")
})
}});
return mdArray
};
var allCommentsUsed=function(rows){if((config.htcConfig.isAllowedComments<=0)||!Ext.isArray(rows)){return true
}return(config.htcConfig.isAllowedComments>1)?false:(rows.length>0)
};
var changeAvailableFields=function(store){if(store&&cmt){var range=store.getRange();
var cArea=cmt.buttons[0];
var cBtn=cmt.buttons[2];
var allCUsed=allCommentsUsed(range);
if(cArea){cArea.setDisabled(allCUsed)
}if(cBtn){cBtn.setDisabled(allCUsed||Ext.isEmpty(cArea.getValue()))
}}};
var saveMetadata=function(dataBefore,record){var cmtStore=!!cmt?cmt.getStore():null;
var reject=function(){if(!!record){record.reject()
}else{if(!!cmtStore&&Ext.isArray(dataBefore)){cmtStore.loadData(dataBefore);
cmtStore.filter("title","comment",false,false,true);
cmtsTc=cmtStore.data.length;
cmtStore.sort("datemodified","DESC");
cmtStore.commitChanges();
cmt.ownerCt.setTitle(cmtsTc<=0?"&nbsp;":cmtsTc)
}}};
if(!cmtStore||Ext.isEmpty(me.itemPath)||Ext.isEmpty(me.itemName)){reject();
return
}var mdInfo={path:me.itemPath,name:me.itemName,metadata:getJSONMetadataArray.call(me,cmtStore),forDetailsPane:true};
config.globalLoadMask.msg=config.htcConfig.locData.DetailsSavingMsg+"...";
config.globalLoadMask.show();
HttpCommander.Metadata.Save(mdInfo,function(mdata,strans){config.globalLoadMask.hide();
config.globalLoadMask.msg=config.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(mdata,strans,config.Msg,config.htcConfig,2)){cmtStore.commitChanges();
var folder=mdInfo.path;
if(config.isRootFolder(folder)){if(!Ext.isEmpty(mdInfo.name)){me.forceRefresh=true;
config.openGridFolder(mdInfo.name)
}}else{if(!Ext.isEmpty(folder)){if(!Ext.isEmpty(mdInfo.name)){config.setSelectPath({name:mdInfo.name,path:folder})
}me.forceRefresh=true;
config.openGridFolder(folder)
}}}else{reject()
}})
};
return(me=new Ext.TabPanel({title:"&nbsp;",region:"east",header:false,bodyBorder:true,collapsible:true,collapsed:config.getHideDetailsPaneValue(),minSize:120,maxSize:420,size:270,autoScroll:"false",tabPosition:"bottom",activeTab:0,cls:"detailed-tap-panel",frame:false,collapseMode:"mini",width:config.getIsEmbeddedtoIFRAME()?170:270,autoScroll:false,split:true,itemPath:null,itemName:null,listeners:{render:function(tbp){lmk=new Ext.LoadMask(tbp.getEl());
if(config.htcConfig.isAllowedComments<=0){me.hideTabStripItem("cmt-tab")
}},expand:function(pane){pane.syncShadow();
me.forceRefresh=true;
me.expandCall=true;
setTimeout(function(){me.expandCall=false
},1000);
me.prepareData.call(me,config.getSelectedRow(),config.getCurrentFolder(),true);
var mw=config.getMetadataWindow();
if(!!mw&&mw.isVisible()){mw.onDetailsPaneToggled.call(mw,false)
}HttpCommander.Lib.Utils.setCookie(config.$("detailsexpanded"),"true")
},collapse:function(pane){var mw=config.getMetadataWindow();
if(!!mw&&mw.isVisible()){mw.onDetailsPaneToggled.call(mw,true)
}HttpCommander.Lib.Utils.setCookie(config.$("detailsexpanded"),"false")
},tabchange:function(pane,tab){if(!!tab&&tab.itemId=="first-tab"&&!!wps){if(wps.rendered){wps.syncSize()
}wps.doLayout();
wps.setWidth("100%");
wps.body.setWidth("100%");
setTimeout(calcWpsHeight,50)
}}},items:[{itemId:"first-tab",title:"&nbsp;",iconCls:"icon-details",padding:5,xtype:"panel",header:false,border:false,frame:false,bodyStyle:{overflowY:"auto"},listeners:{resize:function(){if(!!wps&&wps.rendered&&wps.isVisible()){wps.syncSize();
wps.doLayout();
wps.setWidth("100%");
wps.body.setWidth("100%");
setTimeout(calcWpsHeight,50)
}}},tabTip:config.htcConfig.locData.CommandDetails,items:[hdr=new Ext.BoxComponent({style:{fontWeight:"bold",fontSize:"1.2em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},html:"&nbsp;"}),pps=new Ext.Panel({header:false,flex:1,anchor:"100%",frame:false,cls:"detailed-props",autoHeight:true,baseCls:"x-plain",tpl:new Ext.Template('<table style="width:100%;"><tr><td class="prop-name">'+htcConfig.locData.CommonFieldLabelType+':</td><td class="prop-value">{type:htmlEncode}</td></tr><tr><td class="prop-name">'+htcConfig.locData.CommonFieldLabelSize+':</td><td class="prop-value">{size}</td></tr>{contains}<tr><td class="prop-name">'+htcConfig.locData.FileAttributesField+':</td><td class="prop-value">{attributes}</td></tr>{downloads}<tr><td class="prop-name">'+htcConfig.locData.CommonFieldLabelDateCreated+':</td><td class="prop-value">{datecreated:htmlEncode}</td></tr><tr><td class="prop-name">'+htcConfig.locData.CommonFieldLabelDateModified+':</td><td class="prop-value">{datemodified:htmlEncode}</td></tr><tr><td class="prop-name">'+htcConfig.locData.CommonFieldLabelDateAccessed+':</td><td class="prop-value">{dateaccessed:htmlEncode}</td></tr><tr style="display:{labelDisplay};"><td class="prop-name">'+htcConfig.locData.LabelsTitle+':</td><td class="prop-value">{labelHtml}</td></tr></table><hr />')}),tmb=new Ext.Container({style:{textAlign:"center"},html:"&nbsp;"}),drp=new Ext.Panel({header:false,flex:1,anchor:"100%",frame:false,cls:"detailed-props",autoHeight:true,baseCls:"x-plain",tpl:new Ext.XTemplate('<table style="width:100%;">','<tpl if="'+config.htcConfig.allowedDescription+'">','<tr><td style="font-weight:bold;','<tpl if="edit == false">',"border-bottom:solid 1px;","</tpl>",'padding-top:5px;">',Ext.util.Format.htmlEncode(config.htcConfig.locData.CommonFieldLabelDescription),"</td></tr>",'<tr><td style="white-space:normal;padding-right:6px;position:relative;">','<tpl if="edit == true">','<textarea style="white-space:normal;width:100%;height:44px;" placeholder="'+Ext.util.Format.htmlEncode(config.htcConfig.locData.EmptyDescriptionText)+'" autocomplete="off" class=" x-form-textarea x-form-field">{desc:htmlEncode}</textarea>','<img alt="" src="'+HttpCommander.Lib.Utils.getIconPath(config,"save")+'" title="'+Ext.util.Format.htmlEncode(config.htcConfig.locData.CommandSave)+'" class="save-desc-icon" onclick="window.onSaveDesc(this);" />',"</tpl>",'<tpl if="edit == false">',"{desc:htmlEncodeWrap}","</tpl>","<br />","</td></tr>","</tpl>",'<tpl if="isfile == false">','<tr><td style="font-weight:bold;border-bottom:solid 1px;"><br />',Ext.util.Format.htmlEncode(config.htcConfig.locData.CommonFieldLabelReadMeTxt),"</td></tr>",'<tr><td style="white-space:normal;">{readme}</td></tr>',"</tpl>","</table>",'<tpl if="'+config.htcConfig.allowedDescription+'||(isfile == false)">',"<hr />","</tpl>")}),wps=new Ext.grid.EditorGridPanel({clicksToEdit:1,header:false,loadMask:false,autoScroll:false,getTotalHeight:function(){return"auto"
},style:{minHeight:"175px"},minHeight:175,hidden:true,border:false,frame:false,cls:"writeable-props",forceLayout:true,enableHdMenu:false,enableColumnHide:false,enableColumnMove:false,enableColumnResize:false,hideHeaders:true,trackMouseOver:false,disableSelection:true,height:200,width:"100%",stripeRows:false,viewConfig:{autoFill:true,headersDisabled:true,hideSortIcons:true},selModel:new Ext.grid.RowSelectionModel({singleSelect:true,moveEditorOnEnter:true}),store:new Ext.data.JsonStore({autoSave:false,remoteSort:false,pruneModifiedRecords:false,autoLoad:true,autoDestroy:true,data:[],fields:[{name:"k",type:"string"},{name:"n",type:"string"},{name:"v",type:"string"},{name:"visd",type:"boolean"},{name:"e",type:"string"}]}),autoExpandColumn:"value-column",columns:[{id:"name-column",minWidth:75,width:85,sortable:false,dataIndex:"n",renderer:function(val){return String.format("<span style='white-space:normal;color:#6E6E6E;'>{0}:</span>",Ext.util.Format.htmlEncode(val||""))
}},{id:"value-column",sortable:false,dataIndex:"v",flex:1,renderer:function(val,cell,rec,rowIndex,colIndex,store){if(!Ext.isEmpty(val)){if(rec.get("d")){var d=new Date(parseInt(val,10));
return String.format("<span style='white-space:normal !important;line-height:1em;'>{0}</span>",renderers.dateRendererLocal(d,cell,rec,rowIndex,colIndex,store))
}else{return String.format("<span style='white-space:normal !important;line-height:1em;'>{0}</span>",Ext.util.Format.htmlEncode(val).replace(/\r\n|\n\r/gi,"<br />").replace(/\n|\r|\u21B5/gi,"<br />"))
}}else{if(!Ext.isEmpty(rec.get("e"))){return String.format("<span style='color:gray;white-space:normal !important;line-height:1em;'>{0}</span>",Ext.util.Format.htmlEncode(rec.get("e")))
}else{return"&nbsp;"
}}},editor:new Ext.form.TextArea({allowBlank:true,selectOnFocus:true,style:{zIndex:"5"}})}],buttons:[{text:config.htcConfig.locData.CommandSave,handler:function(){var values=[];
if(!wps||!wps.isVisible()){return
}Ext.each(wps.getStore().getModifiedRecords(),function(rec){if(!!rec){values.push({k:rec.get("k"),v:rec.get("v")})
}});
if(values.length==0){return
}config.globalLoadMask.msg=config.htcConfig.locData.DetailsSavingMsg+"...";
config.globalLoadMask.show();
HttpCommander.Metadata.SaveProps({path:me.itemPath,name:me.itemName,values:values},function(data,trans){config.globalLoadMask.hide();
config.globalLoadMask.msg=config.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(data,trans,config.Msg,config.htcConfig)){me.forceRefresh=true;
me.prepareData.call(me,config.getSelectedRow(),config.getCurrentFolder())
}else{wps.getStore().rejectChanges()
}})
}}]}),eps=new Ext.Panel({header:false,flex:1,anchor:"100%",frame:false,cls:"detailed-props",autoHeight:true,baseCls:"x-plain",tpl:new Ext.XTemplate('<table style="width:100%;">','<tpl for=".">','<tpl if="g == 1">','<tr><td colspan="2" style="font-weight:bold;border-bottom:solid 1px;"><br />{n:htmlEncode}</td></tr>','<tpl for="v">','<tr><td class="prop-name">{n:htmlEncode}:</td><td class="prop-value">','<tpl if="d == 1">',"{[this.toDateStr(values.v)]}","</tpl>",'<tpl if="d == 0">',"{v:htmlEncode}","</tpl>","</td></tr>","</tpl>","</tpl>",'<tpl if="g == 0">','<tr><td class="prop-name">{n:htmlEncode}:</td><td class="prop-value">','<tpl if="d == 1">',"{[this.toDateStr(values.v)]}","</tpl>",'<tpl if="d == 0">',"{v:htmlEncode}","</tpl>","</td></tr>","</tpl>","</tpl>","</table>",{toDateStr:function(v){var dt=new Date(parseInt(v,10));
return String.format("<span style='white-space:normal !important;line-height:1em;'>{0}</span>",renderers.dateRendererLocal(dt,null,null,null,null,!!wps?wps.getStore():null))
}})})]},{title:"&nbsp;",layout:"fit",frame:false,border:false,padding:0,margin:0,iconCls:"icon-history",tabTip:config.htcConfig.locData.FileModificationsHistory,items:[hst=new Ext.grid.GridPanel({title:config.htcConfig.locData.FileModificationsHistory,loadMask:false,layout:"fit",border:false,frame:false,flex:1,forceLayout:true,enableHdMenu:false,enableColumnHide:false,enableColumnMove:false,enableColumnResize:false,hideHeaders:true,trackMouseOver:false,disableSelection:true,stripeRows:true,store:new Ext.data.JsonStore({autoSave:false,remoteSort:false,pruneModifiedRecords:false,autoLoad:true,autoDestroy:true,data:[],isUSA:true,fields:[{name:"type",type:"string"},{name:"user",type:"string"},{name:"date",type:"date"},{name:"size",type:"string"},{name:"path",type:"string"}]}),columns:[{sortable:false,dataIndex:"user",flex:1,renderer:function(val,cell,rec,row,col,store){var avatar=config.getAvatarHtml(val||" ",true);
var user=HttpCommander.Lib.Utils.parseUserName(val)||"";
var t=String(rec.get("type")||"").toLowerCase();
switch(t){case"created":t=htcConfig.locData.FileModificationsTypeCreated;
break;
case"modified":t=htcConfig.locData.FileModificationsTypeModified;
break;
case"renamed":t=config.htcConfig.locData.FileModificationsTypeRenamed;
break;
case"restored":t=config.htcConfig.locData.FileModificationsTypeRestored;
break;
case"deleted":t=config.htcConfig.locData.FileModificationsTypeDeleted;
break;
default:t=null;
break
}return avatar+'<span style="font-weight:bold;">'+Ext.util.Format.htmlEncode(user)+"</span>"+(Ext.isEmpty(t)?"":("<br />"+t))
}},{minWidth:140,width:140,sortable:false,dataIndex:"date",align:"right",flex:1,renderer:function(val,cell,rec,row,col,store){return renderers.dateRendererLocal(val,cell,rec,row,col,store)+"<br />"+renderers.sizeRenderer(rec.get("size"))
}}],bodyCssClass:"detailed-pane-history-row",viewConfig:{autoFill:true,forceFit:true,headersDisabled:true,hideSortIcons:true,deferEmptyText:false,emptyText:'<span style="font-size:1.1em;">'+config.htcConfig.locData.NoHistoryYetHint+"</span>"}})]},{title:"&nbsp;",iconCls:"icon-comment",tabTip:config.htcConfig.locData.CommonFieldLabelComments,layout:"fit",frame:false,border:false,padding:0,margin:0,itemId:"cmt-tab",hidden:config.htcConfig.isAllowedComments<=0,items:[cmt=new Ext.grid.EditorGridPanel({title:config.htcConfig.locData.CommonFieldLabelComments,loadMask:false,layout:"fit",border:false,frame:false,flex:1,cls:"detailed-grid-comments",hidden:config.htcConfig.isAllowedComments<=0,forceLayout:true,enableHdMenu:false,enableColumnHide:false,enableColumnMove:false,enableColumnResize:false,hideHeaders:true,clicksToEdit:2,forceValidation:true,trackMouseOver:true,selModel:new Ext.grid.RowSelectionModel({singleSelect:true,moveEditorOnEnter:true}),stripeRows:true,store:new Ext.data.JsonStore({autoSave:false,remoteSort:false,pruneModifiedRecords:false,autoLoad:true,autoDestroy:true,data:[],isUSA:true,totalProperty:"total",writer:new Ext.data.JsonWriter({encode:true,writeAllFields:true}),fields:config.htcConfig.metaDataFields}),columns:[{sortable:false,dataIndex:"value",flex:1,editable:true,editor:new Ext.form.TextArea({allowBlank:false,selectOnFocus:true,style:{marginLeft:"40px",marginTop:"30px"}}),renderer:function(val,cell,rec,row,col,store){var user=String(rec.get("userlastmodified")||"");
var avatar=config.getAvatarHtml(user);
var rawDate=rec.get("datemodified");
var date=renderers.dateRendererLocal(rawDate,cell,rec,row,col,store);
if(Ext.isDate(rawDate)){var now=new Date();
if((now.getTime()-rawDate.getTime())>=604800000){date=date
}else{date=String.format(htcConfig.locData.CommonChangedAgo,HttpCommander.Lib.Utils.dateDiff(rawDate,now,htcConfig.locData.DaysShort,htcConfig.locData.HoursShort,htcConfig.locData.MinutesShort,true))
}}var cmtVal=Ext.util.Format.htmlEncode(val||"").replace(/\r\n|\n\r/gi,"<br />").replace(/\n|\r|\u21B5/gi,"<br />");
var result=String.format(cmtBlockTpl,avatar,Ext.util.Format.htmlEncode(HttpCommander.Lib.Utils.parseUserName(user)),date||" ",cmtVal);
user=user.toLowerCase().trim();
var cu=config.htcConfig.friendlyUserName.toLowerCase().trim();
if(config.htcConfig.currentPerms&&config.htcConfig.currentPerms.modify&&(config.htcConfig.isFullAdmin||config.htcConfig.isAllowedComments<=1||user==cu)){result+='<img alt="" src="'+HttpCommander.Lib.Utils.getIconPath(config,"delete")+'" title="'+Ext.util.Format.htmlEncode(config.htcConfig.locData.CommandDelete)+'" class="delete-comment-icon" />'
}return result
}}],bodyCssClass:"detailed-pane-comments-row",viewConfig:{autoFill:true,forceFit:true,headersDisabled:true,hideSortIcons:true,rowSelectorDepth:20,cellSelectorDepth:15,deferEmptyText:false,emptyText:'<span style="font-size:1.1em;">'+config.htcConfig.locData.NoCommentsYetHint+"</span>"},listeners:{cellclick:function(grid,rowIndex,columnIndex,e){e=e||window.event;
var sender=e.target||e.srcElement;
if(sender&&sender.tagName&&sender.tagName.toUpperCase()=="IMG"){if(e.preventDefault){e.preventDefault()
}if(e.stopPropagation){e.stopPropagation()
}if(window.event&&window.event.returnValue){window.event.returnValue=false
}if(e.stopEvent){e.stopEvent()
}cmt.stopEditing();
var store=cmt.getStore();
var dataBefore=getJSONMetadataArray.call(me,store);
var s=cmt.getSelectionModel().getSelections();
var cu=config.htcConfig.friendlyUserName.toLowerCase().trim();
for(var i=0,r;
typeof(r=s[i])!="undefined";
i++){var user=r.get("userlastmodified").toLowerCase().trim();
if(config.htcConfig.isFullAdmin||config.htcConfig.isAllowedComments<=1||user==cu){store.remove(r)
}}changeAvailableFields.call(me,store);
saveMetadata.call(me,dataBefore);
return false
}},beforeedit:function(e){var cu=config.htcConfig.friendlyUserName.toLowerCase().trim();
var user=e.record.get("userlastmodified").toLowerCase().trim();
if(!config.htcConfig.currentPerms||!config.htcConfig.currentPerms.modify||(!config.htcConfig.isFullAdmin&&config.htcConfig.isAllowedComments>1&&user!=cu)){e.cancel=true;
e.grid.stopEditing(true);
return false
}},afteredit:function(e){var store=cmt.getStore();
if(String(e.value).toLowerCase().trim()!=String(e.originalValue).toLowerCase().trim()){e.record.set("userlastmodified",config.htcConfig.friendlyUserName);
e.record.set("datemodified",null);
saveMetadata.call(me,null,e.record)
}changeAvailableFields.call(me,store)
}},buttonAlign:"left",buttons:[{xtype:"textarea",flex:1,anchor:"100%",visible:config.htcConfig.isAllowedComments>0,width:"100%",height:50,style:{whiteSpace:"normal"},enableKeyEvents:true,emptyText:String.format(config.htcConfig.locData.CommentsWriteCommentHint,config.htcConfig.locData.CommonButtonCaptionAddComment),listeners:{change:function(fld,newVal,oldVal){cmt.buttons[2].setDisabled(Ext.isEmpty(me.itemPath)||Ext.isEmpty(me.itemName)||Ext.isEmpty(newVal))
},keypress:function(fld,evt){cmt.buttons[2].setDisabled(Ext.isEmpty(me.itemPath)||Ext.isEmpty(me.itemName)||Ext.isEmpty(cmt.buttons[0].getValue()))
},specialkey:function(field,e){if(e.getKey()==e.ENTER){var btn=cmt.buttons[2];
btn.handler.call(btn,btn,e)
}}}},"->",{text:config.htcConfig.locData.CommonButtonCaptionAddComment,disabled:true,autoHeight:true,visible:config.htcConfig.isAllowedComments>0,handler:function(btn,evt){var cmtVal=cmt.buttons[0].getValue();
if(Ext.isEmpty(cmtVal)){btn.setDisabled(true);
return
}var cmtStore=cmt.getStore();
var dataBefore=getJSONMetadataArray.call(me,cmtStore);
var metaDataRecord=cmtStore.recordType;
var mdr=new metaDataRecord({title:"Comment",value:cmtVal,userlastmodified:config.htcConfig.friendlyUserName,datemodified:null});
cmtStore.insert(0,mdr);
changeAvailableFields.call(me,cmtStore);
saveMetadata.call(me,dataBefore)
}}]})]}],prepareData:prepareData}))
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.ThumbView=Ext.extend(Ext.grid.GridView,{htcCfg:{},htcUid:"httpCommander",maxWidthThumb:100,maxHeightThumb:100,iconSizeSet:1,styleName:"thmbIconMedium",curFolder:null,tpl:null,initTemplates:function(){HttpCommander.Lib.ThumbView.superclass.initTemplates.call(this);
if(!this.templatedNode){this.templatedNode=new Ext.Template('<div class="thumbnailedItem x-unselectable">{content}</div>')
}this.templatedNode.compile();
var a=Math.min(this.maxWidthThumb,this.maxHeightThumb);
if(a<=70){this.iconSizeSet=0
}else{if(a>=100&&a<120){this.iconSizeSet=2
}else{if(a>=120){this.iconSizeSet=3
}}}this.styleName="thmbIconMedium";
if(this.iconSizeSet==0){this.styleName="thmbIconSmall"
}else{if(this.iconSizeSet==2){this.styleName="thmbIconBig"
}else{if(this.iconSizeSet==3){this.styleName="thmbIconLarge"
}}}},onRowSelect:function(a){if(this.tpl===null){this.addRowClass(a,"x-grid3-row-selected")
}else{this.addRowClass(a,"x-grid3-cell-selected");
this.addRowClass(a,"thumbnailedItemSelected")
}},onRowDeselect:function(a){if(this.tpl===null){this.removeRowClass(a,"x-grid3-row-selected")
}else{this.removeRowClass(a,"thumbnailedItemSelected");
this.removeRowClass(a,"x-grid3-cell-selected")
}},prepareData:function(f){f.thumbnail=this.getThumbnail(f);
var b=(f.srowtype=="recent");
var h=(f.srowtype=="trash");
var a=(f.srowtype=="alert");
var e=(a||b)?String.format(" ext:qtip='{0}' ",this.htcCfg.locData[a?"GridRowAlertHint":"GridRowRecentHint"]):"";
if(f.rowtype=="file"){var d=HttpCommander.Lib.Utils.getFileExtension(f.name);
var g=(d=="lnk"||d=="url");
var c=this.htcCfg.googleDriveFileTypes&&this.htcCfg.googleDriveFileTypes.indexOf(";"+d+";")>=0;
if(!h&&(a||b||g||c)){f.viewname="<span class='x-tree-node'><a "+e+"href='' class='fileNameLinkThumb' onclick='HttpCommander.Main.FileManagers[\""+this.htcUid+'"].gridRowAction('+f.row+", null); return false;'>"+Ext.util.Format.htmlEncode(f.name)+"</a></span>"
}else{f.viewname=Ext.util.Format.htmlEncode(f.name)
}}else{f.viewname="<span class='x-tree-node'>"+(h?"":("<a "+e+"href='' class='fileNameLinkThumb' onclick='HttpCommander.Main.FileManagers[\""+this.htcUid+'"].gridRowAction('+f.row+", null); return false;'>"))+Ext.util.Format.htmlEncode(f.name)+(h?"":"</a>")+"</span>"
}return f
},getThumbnail:function(B){var i=function(F,D){if(F==null){return null
}var G;
try{if(D){G=(F.getMonth()+1)+"/"+F.getDate()+"/"
}else{G=F.getDate()+"/"+(F.getMonth()+1)+"/"
}G+=F.getFullYear()+" "+F.toLocaleTimeString()
}catch(E){G=F.toLocaleString()
}return G
};
var a=function(E){if(typeof E=="undefined"||E==null||String(E)==""){return""
}var D=parseFloat(E);
if(isNaN(D)||!isFinite(D)){return""
}if(D<1024){return D+" bytes"
}else{if(D<1048576){return(Math.round(((D*10)/1024))/10)+" KB"
}else{if(D<1073741824){return(Math.round(((D*10)/1048576))/10)+" MB"
}else{return(Math.round(((D*10)/1073741824))/10)+" GB"
}}}};
var A=false;
var C="";
var k="";
var u="";
var q="";
var y="";
var g=(B.srowtype=="trash");
var m=(B.srowtype=="recent");
var h=(B.srowtype=="alert");
var d=(this.htcCfg.watchForModifs===true)?B.watchForModifs:null;
if(!h&&!Ext.isEmpty(B.datemodified)){q+='<span style="font-weight:bold;">'+(this.htcCfg.locData[g?"TrashLabelDateDeleted":"CommonFieldLabelDateModified"]).replace(/\s/gi,"&nbsp;")+"</span>:&nbsp;"+(i(B.datemodified,B.isUSA)).replace(/\s/gi,"&nbsp;")
}if(!g&&!Ext.isEmpty(B.datecreated)){if(q.length>0){q+="<br />"
}q+='<span style="font-weight:bold;">'+(this.htcCfg.locData.CommonFieldLabelDateCreated).replace(/\s/gi,"&nbsp;")+"</span>:&nbsp;"+(i(B.datecreated,B.isUSA)).replace(/\s/gi,"&nbsp;")
}if(!h&&!g&&!Ext.isEmpty(B.dateaccessed)){if(q.length>0){q+="<br />"
}q+='<span style="font-weight:bold;">'+(this.htcCfg.locData.CommonFieldLabelDateAccessed).replace(/\s/gi,"&nbsp;")+"</span>:&nbsp;"+(i(B.dateaccessed,B.isUSA)).replace(/\s/gi,"&nbsp;")
}if(!Ext.isEmpty(B.type)){if(q.length>0){q+="<br />"
}q+='<span style="font-weight:bold;">'+(this.htcCfg.locData.CommonFieldLabelType).replace(/\s/gi,"&nbsp;")+"</span>:&nbsp;"+(Ext.util.Format.htmlEncode(B.type)).replace(/\s/gi,"&nbsp;")
}if((m||g)&&!Ext.isEmpty(B.qtip)){if(q.length>0){q+="<br />"
}q+='<span style="font-weight:bold;">'+(this.htcCfg.locData.CommonValueTypeFolder).replace(/\s/gi,"&nbsp;")+"</span>:&nbsp;"+B.qtip.replace(/\s/gi,"&nbsp;")
}if(B.rowtype=="file"){var o=a(B.size);
if(!Ext.isEmpty(o)){if(q.length>0){q+="<br />"
}q+='<span style="font-weight:bold;">'+(this.htcCfg.locData.CommonFieldLabelSize)+"</span>:&nbsp;"+o.replace(/\s/gi,"&nbsp;")
}var f=HttpCommander.Lib.Utils.getFileExtension(B.name);
var c=B.size||B.size_hidden,p=0;
if(!Ext.isEmpty(c)&&String(c).trim().length>0){p=parseFloat(c);
if(isNaN(p)||!isFinite(p)){p=0
}}if(!m&&!g&&this.htcCfg&&this.htcCfg.currentPerms&&this.htcCfg.currentPerms.download&&this.htcCfg.enableThumbnailViewImagesLoading&&HttpCommander.Lib.Consts.imagesFileTypes&&HttpCommander.Lib.Consts.imagesFileTypes.indexOf(";"+f+";")!=-1&&p>0){var x="";
var w=(f=="svg");
if(Ext.isDate(B.datemodified)){x="date="+B.datemodified.getTime()+"&"
}else{if(w){x="date="+((new Date()).getTime())+"&"
}}var e="size="+this.maxWidthThumb+"x"+this.maxHeightThumb+"&";
var l=encodeURIComponent(this.curFolder+B.name).replace(/'/gi,"%27").replace(/"/gi,"%22");
var v=this.htcCfg.relativePath+"Handlers/ThumbsGridViewHandler.ashx?"+x+e+"file="+l;
if(w){v=this.htcCfg.relativePath+"Handlers/Download.ashx?action=download&"+x+"file="+l
}u='<img align="absmiddle" '+(q.length>0?String.format("ext:qtip='{0}'",Ext.util.Format.htmlEncode(q)):"")+' alt="" style="max-width:'+this.maxWidthThumb+"px !important;max-height:"+this.maxHeightThumb+'px !important;" src="'+v+'" />';
A=true
}else{var n=(f=="lnk"||f=="url");
var t=this.htcCfg.googleDriveFileTypes&&this.htcCfg.googleDriveFileTypes.indexOf(";"+f+";")>=0;
if(!g&&(m||n||t)){y=(h||m)?String.format(" ext:qtip='{0}' ",this.htcCfg.locData[h?"GridRowAlertHint":"GridRowRecentHint"]):"";
u+="<a "+y+'href="" class="fileNameLink" onclick="HttpCommander.Main.FileManagers[\''+this.htcUid+"'].gridRowAction("+B.row+', null); return false;">'
}var s=B.icon_big?B.icon_big:B.icon_normal?B.icon_normal:B.icon;
if(this.iconSizeSet==0){s=B.icon_normal?B.icon_normal:B.icon
}else{if(this.iconSizeSet>=2&&B.icon_large){s=B.icon_large?B.icon_large:B.icon
}}u+="<img "+(s.indexOf(".svg")>0?'class="'+this.styleName+'"':"")+' alt="" '+(q.length>0?String.format("ext:qtip='{0}'",Ext.util.Format.htmlEncode(q)):"")+' align="absmiddle" src="'+this.htcCfg.relativePath+s+'" />';
if(!g&&(m||n||t)){u+="</a>"
}}if(B.isnew){C+="<img ext:qtip='"+Ext.util.Format.htmlEncode(String.format(this.htcCfg.locData.FileWasCreatedHint,HttpCommander.Lib.Utils.dateDiff(B.datecreated,new Date(),this.htcCfg.locData.DaysShort,this.htcCfg.locData.HoursShort,this.htcCfg.locData.MinutesShort)))+"' src='"+HttpCommander.Lib.Utils.getIconPath(this,"isnew")+"' class='filetypeimage' />"
}if(B.ismod){C+="<img ext:qtip='"+Ext.util.Format.htmlEncode(String.format(this.htcCfg.locData.FileWasModifiedHint,HttpCommander.Lib.Utils.dateDiff(B.datemodified,new Date(),this.htcCfg.locData.DaysShort,this.htcCfg.locData.HoursShort,this.htcCfg.locData.MinutesShort)))+"' src='"+HttpCommander.Lib.Utils.getIconPath(this,"ismod")+"' class='filetypeimage' />"
}if(this.htcCfg.enableMSOfficeEdit||this.htcCfg.enableOpenOfficeEdit||this.htcCfg.enableWebFoldersLinks){if(B.locked){C+="<img ext:qtip='"+Ext.util.Format.htmlEncode(this.htcCfg.locData.IsLockedHint)+"' src='"+HttpCommander.Lib.Utils.getIconPath(this,"lock")+"' class='filetypeimage' />"
}}if(this.htcCfg.enableVersionControl&&B.vstate){if(B.vstate&1){C+="<img ext:qtip='"+Ext.util.Format.htmlEncode(this.htcCfg.locData.IsCheckedOutHint)+"' src='"+HttpCommander.Lib.Utils.getIconPath(this,"checkout")+"' class='filetypeimage' />"
}if(B.vstate&4){C+="<img style='cursor:pointer' ext:qtip='"+Ext.util.Format.htmlEncode(this.htcCfg.locData.ExistsOldVersionsHint)+"' src='"+HttpCommander.Lib.Utils.getIconPath(this,"verhist")+"' class='filetypeimage' onclick='HttpCommander.Main.FileManagers[\""+this.htcUid+'"].versionHistory('+B.row+")' />"
}}}else{var b=this.htcCfg.relativePath+"Images/48/"+(B.rowtype=="folder"?(B.isshortcut===true?"folder-shortcut.png":"folder.png"):(B.rowtype=="rootfolder"?"folderftp.png":(B.rowtype=="recentroot"?"recent.png":(B.rowtype=="trashroot"?"trash.png":(B.rowtype=="sharedroot"?"sharefolder.png":(B.rowtype=="sharedforyouroot"?"sharedforyou.png":(B.rowtype=="alertsroot"?"alerts.png":"up.png")))))));
var z="thmbIconMedium";
if(this.htcCfg.iconSet.ext&&this.htcCfg.iconSet.ext.indexOf("svg")>=0){z=this.styleName;
b=HttpCommander.Lib.Utils.getIconPath(this,B.rowtype=="folder"?(B.isshortcut===true?"folder-shortcut":"folder"):(B.rowtype=="rootfolder"?"folderftp":(B.rowtype=="recentroot"?"recent":(B.rowtype=="trashroot"?"trash":(B.rowtype=="sharedroot"?"sharefolder":(B.rowtype=="sharedforyouroot"?"sharedforyou":(B.rowtype=="alertsroot"?"alerts":"up")))))));
if(HttpCommander.Lib.Utils.browserIs.ie9standard){b+="?q=thumbview"
}}y=(h||m)?String.format(" ext:qtip='{0}' ",this.htcCfg.locData[h?"GridRowAlertHint":"GridRowRecentHint"]):"";
u=(g?"":("<a "+y+'href="" class="fileNameLink" onclick="HttpCommander.Main.FileManagers[\''+this.htcUid+"'].gridRowAction("+B.row+', null); return false;">'))+'<img class="'+z+'" alt="" '+(q.length>0?String.format("ext:qtip='{0}'",Ext.util.Format.htmlEncode(q)):"")+' align="absmiddle" src="'+b+'" />'+(g?"":"</a>");
if(B.isnew){C+="<img ext:qtip='"+Ext.util.Format.htmlEncode(String.format(this.htcCfg.locData.FileWasCreatedHint,HttpCommander.Lib.Utils.dateDiff(B.datecreated,new Date(),this.htcCfg.locData.DaysShort,this.htcCfg.locData.HoursShort,this.htcCfg.locData.MinutesShort)))+"' src='"+HttpCommander.Lib.Utils.getIconPath(this,"isnew")+"' class='filetypeimage' />"
}if(B.ismod){C+="<img ext:qtip='"+Ext.util.Format.htmlEncode(String.format(this.htcCfg.locData.FileWasModifiedHint,HttpCommander.Lib.Utils.dateDiff(B.datemodified,new Date(),this.htcCfg.locData.DaysShort,this.htcCfg.locData.HoursShort,this.htcCfg.locData.MinutesShort)))+"' src='"+HttpCommander.Lib.Utils.getIconPath(this,"ismod")+"' class='filetypeimage' />"
}}if(Ext.isObject(d)){C+="<img style='cursor:pointer' ext:qtip='"+Ext.util.Format.htmlEncode(this.htcCfg.locData.WatchForModifsIconHint)+"' src='"+HttpCommander.Lib.Utils.getIconPath(this,"watch")+"' class='filetypeimage' onclick='HttpCommander.Main.FileManagers[\""+this.htcUid+'"].viewWatch('+B.row+")' />"
}if(Ext.isNumber(B.comments)&&B.comments>0){C+="<span class='comment-txt icon-comment' style='background-position-y:0px !important;' ext:qtip='"+Ext.util.Format.htmlEncode(String.format(this.htcCfg.locData.CommentsCountInfoTip,B.comments))+"' onclick='HttpCommander.Main.FileManagers[\""+this.htcUid+'"].viewChangeDetails('+B.row+",true)'>"+B.comments+"</span>&nbsp;"
}else{if(B.isdet){C+="<img style='cursor:pointer' ext:qtip='"+Ext.util.Format.htmlEncode(this.htcCfg.locData.FileContainsMetaDataHint)+"' src='"+HttpCommander.Lib.Utils.getIconPath(this,"details")+"' class='filetypeimage' onclick='HttpCommander.Main.FileManagers[\""+this.htcUid+'"].viewChangeDetails('+B.row+")' />"
}}if(B.publiclinks>0){C+="<img style='cursor:pointer' ext:qtip='"+Ext.util.Format.htmlEncode(this.htcCfg.locData[B.rowtype=="file"?"ExistsPublicLinksFileHint":"ExistsPublicLinksFolderHint"])+"' src='"+HttpCommander.Lib.Utils.getIconPath(this,"sharefolder")+"' class='filetypeimage' onclick='HttpCommander.Main.FileManagers[\""+this.htcUid+'"].editOrViewPublicLinks('+B.row+")' />"
}if(C!==""){C='<div style="position:relative;height:0px;"><div style="text-align:left;position:absolute;bottom:-'+(this.maxHeightThumb-1)+'px;left:1px;height:16px;float:left;">'+C+"</div></div>"
}if(!Ext.isEmpty(B.label)&&!Ext.isEmpty(B.label_color)){var r="";
if(!Ext.isEmpty(B.label_user)&&Ext.isDefined(B.label_date)){r=String.format(this.htcCfg.locData.LabelsLabelInfoTip,B.label,i(B.label_date,B.isUSA),HttpCommander.Lib.Utils.parseUserName(B.label_user))
}else{r=B.label
}k='<div style="position:relative;height:0px;"><div style="text-align:left;position:absolute;top:2px;left:0px;height:18px;float:left;max-width:'+this.maxWidthThumb+'px;"><span class="file-folder-label"  ext:qtip="'+Ext.util.Format.htmlEncode(Ext.util.Format.htmlEncode(r))+'" style="display:block;background-color:'+Ext.util.Format.htmlEncode(B.label_color)+(this.htcCfg.enabledLabels?";cursor:pointer":"")+';"'+(this.htcCfg.enabledLabels?" onclick='HttpCommander.Main.FileManagers[\""+this.htcUid+'"].showLabelsMenu('+B.row+",this);'":"")+">"+Ext.util.Format.htmlEncode(B.label)+"</span></div></div>"
}return k+C+'<table border="0" cellpadding="0" cellspacing="0"><tr><td'+(A?' class="lthumb"':"")+">"+u+"</td></tr></table>"
},doRender:function(h,d,c,k,i,l){if(window.htcConfig){this.htcCfg.currentPerms=window.htcConfig.currentPerms
}this.curFolder=c?String(c.baseParams.path).replace(/\/+$/g,""):null;
if(this.curFolder!=null&&this.curFolder.length>0){this.curFolder+="/"
}if(this.tpl===null){return HttpCommander.Lib.ThumbView.superclass.doRender.apply(this,arguments)
}var b=[],f={},a;
for(var e=0,g=d.length;
e<g;
e++){a=d[e];
a.data.row=a.store.indexOf(a);
a.data=this.prepareData(a.data);
a.data.isUSA=a.store.isUSA;
f.content=this.tpl.apply(a.data);
b[b.length]=this.templatedNode.apply(f)
}return b.join("")+'<div style="clear:both"></div>'
},refresh:function(a){this.rowSelector=this.tpl==null?"div.x-grid3-row":"div.thumbnailedItem";
return HttpCommander.Lib.ThumbView.superclass.refresh.apply(this,arguments)
},updateAllColumnWidths:function(){if(this.tpl===null){return HttpCommander.Lib.ThumbView.superclass.updateAllColumnWidths.apply(this)
}var c=this.getTotalWidth();
var a=this.cm.getColumnCount();
var b=[];
var d;
for(d=0;
d<a;
d++){b[d]=this.getColumnWidth(d)
}this.innerHd.firstChild.firstChild.style.width=c;
for(d=0;
d<a;
d++){var e=this.getHeaderCell(d);
e.style.width=b[d]
}this.onAllColumnWidthsUpdated(b,c)
},updateColumnWidth:function(c,d){if(this.tpl===null){return HttpCommander.Lib.ThumbView.superclass.updateColumnWidth.apply(this,arguments)
}var a=this.getColumnWidth(c);
var b=this.getTotalWidth();
this.innerHd.firstChild.firstChild.style.width=b;
var e=this.getHeaderCell(c);
e.style.width=a;
this.onColumnWidthUpdated(c,a,b)
},updateColumnHidden:function(b,c){if(this.tpl===null){return HttpCommander.Lib.ThumbView.superclass.updateColumnHidden.apply(this,arguments)
}var a=this.getTotalWidth();
this.innerHd.firstChild.firstChild.style.width=a;
var e=c?"none":"";
var d=this.getHeaderCell(b);
d.style.display=e;
this.onColumnHiddenUpdated(b,c,a);
delete this.lastViewWidth;
this.layout()
}});
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.CreatePublicLinkWindow=function(e){var q,a,d,f,n,g,h,p,b,l,c,o=function(){return(e.htcConfig.enableSendEmail!="any"&&e.htcConfig.enableSendEmail!="linksonly")||!e.htcConfig.allowSendPublicLinksProp
},k=function(){return !e.htcConfig.allowSendPublicLinksProp
};
function m(u){var s=Ext.isNumber(u)&&u>0?u:e.htcConfig.publicLinkDefaultValidPeriod;
var r=(new Date()).getTime();
r+=s*24*60*60*1000;
var t=new Date(r);
t.setHours(0);
t.setMinutes(0);
t.setSeconds(0);
t.setMilliseconds(0);
return t
}function i(u,t){if(!q||Ext.isEmpty(u)||k()||((t=="gmail"||t=="outlook")&&o())){return false
}var w=(t=="facebook");
var r="";
var y=w?q.lnk:q.shortLnk;
var s=w?q.shortLnk:q.lnk;
if(s==y){s=null
}if(y&&y.length>0){r+=y
}if((t=="gmail"||t=="outlook"||r.length==0)&&s&&s.length>0){if(r.length>0){r+="\n\n"
}r+=s
}if(r.length==0){return false
}var v=window.open(u+encodeURIComponent(r),"publiclinksend"+(t||"unknown"),HttpCommander.Lib.Utils.getPopupProps(600,500));
if(v){try{v.focus()
}catch(x){}}return true
}q=new e.Window({lnk:null,shortLnk:null,title:e.htcConfig.locData.CommandMakePublicFolder,bodyStyle:"padding:5px",resizable:true,closeAction:"hide",autoHeight:true,minWidth:300,width:400,layout:"fit",virtPath:"",plain:true,shortShowed:false,isFolder:true,anonPerm:{download:{checked:true,disabled:false},upload:{checked:true,disabled:false},view:{checked:true,disabled:false},zip:{checked:true,disabled:false},modify:true},items:[d=new Ext.form.FormPanel({baseCls:"x-plain",defaults:{xtype:"textfield",anchor:"100%"},autoHeight:true,labelWidth:100,items:[c=new Ext.form.FieldSet({checkboxToggle:true,defaults:{xtype:"textfield",anchor:"100%"},autoHeight:true,labelWidth:100,collapsed:true,cls:"anon-field-set",style:{paddingBottom:"0px"},title:'<a href="#">'+Ext.util.Format.htmlEncode(e.htcConfig.locData.AnonymousLinkAdvOptTitle)+"</a>",collapsible:true,hideMode:"offsets",listeners:{afterrender:function(s){var r=s.header.child("span").child("a");
s.mon(r,"click",function(){if(c.collapsed){c.expand.call(c)
}else{c.collapse.call(c)
}},s)
},collapse:function(r){if(q.needFixAutofillPasswords){r.items.items[1].setReadOnly(true);
r.items.items[2].setReadOnly(true)
}q.syncShadow()
},expand:function(r){q.syncShadow();
a.collapse()
}},items:[{fieldLabel:e.htcConfig.locData.LinkToFileExpireDate,name:"expireDate-public-link",xtype:"datefield",format:e.htcConfig.USADateFormat?"m/d/Y":"d/m/Y",minValue:HttpCommander.Lib.Utils.getTodayDate(),maxValue:e.htcConfig.publicLinkMaxValidPeriod<=0?null:m(e.htcConfig.publicLinkMaxValidPeriod),value:m()},{fieldLabel:e.htcConfig.locData.CommonFieldLabelPassword,name:"password-public-link",xtype:"pwdfield",allowBlank:!e.htcConfig.requirePasswordOnCreatePublicLink,id:e.$("makePublicLinkWindowPassword-public-link")},{fieldLabel:e.htcConfig.locData.CommonFieldLabelRepeatPassword,name:"password2-public-link",xtype:"pwdfield",vtype:"password",initialPassField:e.$("makePublicLinkWindowPassword-public-link")},{fieldLabel:e.htcConfig.locData.LinkToFileDownloadCnt,name:"downloadCnt-public-link",xtype:"numberfield",minValue:0,value:0},{boxLabel:e.htcConfig.locData.AnonymousLinkShowCommentsLabel,name:"showComments-public-link",xtype:"checkbox",hideLabel:true,hidden:!e.htcConfig.enabledLabels&&e.htcConfig.isAllowedComments!="1"&&e.htcConfig.isAllowedComments!="2"&&!e.htcConfig.allowedDescription,checked:e.htcConfig.enabledLabels||e.htcConfig.isAllowedComments=="1"||e.htcConfig.isAllowedComments=="2"||e.htcConfig.allowedDescription,listeners:{check:function(r,s){if(!q.isFolder){if(s){l.setVisible(true)
}else{if(!l.allowedExcludeLCD){l.setVisible(false)
}}}}}},f=new Ext.form.FieldSet({title:e.htcConfig.locData.PublicFolderAnonymAccessControl,layout:"column",style:{paddingBottom:"0px"},cls:"acl-field-set",defaults:{border:false,baseCls:"x-plain",columnWidth:0.5,anchor:"100%"},items:[{defaults:{ctCls:"checkbox-auto-height"},items:[n=new Ext.form.Checkbox({boxLabel:e.htcConfig.locData.PublicFolderAnonymDownload}),p=new Ext.form.Checkbox({boxLabel:e.htcConfig.locData.PublicFolderAnonymZipDownload,listeners:{check:function(r,s){q.changeViewMakePublicLinkWindow(s&&!h.getValue()&&!g.getValue())
}}}),h=new Ext.form.Checkbox({boxLabel:e.htcConfig.locData.PublicFolderAnonymViewContent,listeners:{check:function(r,s){q.changeViewMakePublicLinkWindow(!s&&p.getValue()&&!g.getValue());
if(!q.anonPerm.download.disabled){n.setDisabled(!s);
n.setValue(s)
}}}})]},{items:[g=new Ext.form.Checkbox({boxLabel:e.htcConfig.locData.PublicFolderAnonymUpload+".",anchor:"100%",checked:false,listeners:{check:function(r,s){q.changeViewMakePublicLinkWindow(!s&&p.getValue()&&!h.getValue());
if(b.isAllowed===true){b.setDisabled(!s)
}}}}),{xtype:"container",layout:"form",anchor:"100%",defaults:{anchor:"100%"},items:[{xtype:"label",text:e.htcConfig.locData.PublicFolderLinkOverwriteWhileUpload+":"},b=new Ext.form.RadioGroup({hideLabel:true,defaults:{ctCls:"checkbox-auto-height"},items:[{boxLabel:e.htcConfig.locData.AdminFoldersRestrictionAllow,inputValue:0,name:"overwrite-existing",checked:false},{boxLabel:e.htcConfig.locData.AdminFoldersRestrictionDeny,name:"overwrite-existing",inputValue:1,checked:true}]})]}]}]}),{fieldLabel:e.htcConfig.locData.PublicFolderNoteForUsers,name:"noteForUsers-public-link",xtype:"textarea",height:40},{fieldLabel:e.htcConfig.locData.PublicFolderLinkSendEmails,name:"emails-public-link",xtype:"textarea",height:40},l=new Ext.form.RadioGroup({hidden:true,allowed:false,fieldLabel:e.htcConfig.locData.LinkToFileDownloadType,anchor:"100%",items:[{boxLabel:e.htcConfig.locData.CommandDownload,inputValue:0,name:"download-view-link-type",checked:true},{boxLabel:e.htcConfig.locData.CommandDownloadOrView,name:"download-view-link-type",inputValue:1}],listeners:{afterrender:function(s){var v=s.el.dom.getElementsByTagName("input");
var r=0;
if(v&&(r=v.length)>0){for(var t=0;
t<r;
t++){var u=v[t];
if(u&&u.type=="radio"){u.onclick=function(){q.changeLinkType(l.getValue().getValue())
}
}}}}}})]}),a=new Ext.form.FieldSet({checkboxToggle:true,defaults:{anchor:"100%"},cls:"anon-field-set",hidden:!e.htcConfig.anonymLimitAccessForUsers,autoHeight:true,collapsed:true,title:'<a href="#">'+Ext.util.Format.htmlEncode(e.htcConfig.locData.AnonymousLinkLimitedAccessTitle)+"</a>",collapsible:true,labelAlign:"top",listeners:{afterrender:function(s){var r=s.header.child("span").child("a");
s.mon(r,"click",function(){if(a.collapsed){a.expand.call(a)
}else{a.collapse.call(a)
}},s)
},collapse:function(r){q.syncSize();
q.syncShadow()
},expand:function(r){q.syncSize();
q.syncShadow();
c.collapse()
}},items:[{itemId:"au-checkbox",name:"au-checkbox",xtype:"checkbox",hideLabel:true,ctCls:"checkbox-auto-height",boxLabel:e.htcConfig.locData.AnonymousLinkLimitAccessCheckBox,checked:false,listeners:{check:function(s,t){var r=s.ownerCt,w=r.getComponent("au-users"),u=r.getComponent("au-send-checkbox"),v=r.getComponent("au-pers-msg");
w.setDisabled(!t);
u.setDisabled(!t);
v.setDisabled(!t||!u.getValue())
}}},{itemId:"au-users",name:"au-users",xtype:"textarea",fieldLabel:e.htcConfig.locData.AnonymousLinkLimitAccessTextArea,height:40,disabled:true},{itemId:"au-send-checkbox",name:"au-send-checkbox",xtype:"checkbox",hideLabel:true,boxLabel:e.htcConfig.locData.AnonymousLinkLimitAccessSendCheckBox,checked:true,disabled:true,ctCls:"checkbox-auto-height",listeners:{check:function(s,t){var r=s.ownerCt,u=r.getComponent("au-pers-msg");
u.setDisabled(!t)
}}},{itemId:"au-pers-msg",name:"au-pers-msg",xtype:"textarea",emptyText:e.htcConfig.locData.AnonymousLinkLimitAccessPersMsgLabel,hideLabel:true,height:40,disabled:true}]}),{xtype:"container",anchor:"100%",defaults:{xtype:"button",style:{marginLeft:"6px",marginBottom:"6px"}},layout:"column",items:[{id:e.$("public-link-create-btn"),text:e.htcConfig.locData.LinkToFileGenerate,handler:function(r){q.publicLinkMainHandler(r.isEditMode)
}},{id:e.$("public-link-view-btn"),icon:HttpCommander.Lib.Utils.getIconPath(e,"sharefolder")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=sharefolder":""),text:e.htcConfig.locData.AnonymousViewLinksButton,handler:function(){e.initAndShowViewLinksWindow()
}}]},{xtype:"label",hideLabel:true,autoHeight:true,id:e.$("hint-public-link"),cls:"x-form-item",text:""},{xtype:"areactc",ctcIcon:e.htcConfig.relativePath+"Images/ctc.png",ctcHint:e.htcConfig.locData.CommandCopyToClipboard,autoScroll:true,hideLabel:true,id:e.$("url-public-link"),height:50,selectOnFocus:true,readOnly:true,onSuccessCopied:function(){e.showBalloon(e.htcConfig.locData.BalloonCopiedToClipboard)
},onTriggerClickError:function(r){e.Msg.show({title:e.htcConfig.locData.BalloonCopyToClipboardFailed,msg:Ext.util.Format.htmlEncode(!!r?r.toString():e.htcConfig.locData.BalloonCopyToClipboardFailed),icon:e.Msg.ERROR,buttons:e.Msg.OK})
}},{xtype:"areactc",ctcIcon:e.htcConfig.relativePath+"Images/ctc.png",ctcHint:e.htcConfig.locData.CommandCopyToClipboard,autoScroll:true,hideLabel:true,emptyText:e.htcConfig.locData.AnonymousLinkShortUrlLabel,id:e.$("url-short-public-link"),hidden:(e.htcConfig.publicLinksViewType==1),height:50,width:"100%",selectOnFocus:true,readOnly:true,onSuccessCopied:function(){e.showBalloon(e.htcConfig.locData.BalloonCopiedToClipboard)
},onTriggerClickError:function(r){e.Msg.show({title:e.htcConfig.locData.BalloonCopyToClipboardFailed,msg:Ext.util.Format.htmlEncode(!!r?r.toString():e.htcConfig.locData.BalloonCopyToClipboardFailed),icon:e.Msg.ERROR,buttons:e.Msg.OK})
},refreshIcon:HttpCommander.Lib.Utils.getIconPath(e,"refresh")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=refresh":""),refreshHint:e.htcConfig.locData.AnonymousLinkShortUrlUpdate,refreshHandler:function(u){var r=q.findById(e.$("url-public-link")).getValue();
if(Ext.isEmpty(r)){return
}var t=!q.isFolder&&l.allowed;
var s=t&&l.items.items[1].getValue();
e.globalLoadMask.msg=e.htcConfig.locData.ProgressLoading+"...";
e.globalLoadMask.show();
HttpCommander.Common.ShortenAnonymLink({url:r,view:t},function(x,w){e.globalLoadMask.hide();
e.globalLoadMask.msg=e.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(x,w,e.Msg,e.htcConfig)){q.shortLnk=x.shortUrl;
q.shortLnk2=x.shortUrl2;
var v=q.findById(e.$("url-short-public-link"));
if(v){v.setValue(s&&q.shortLnk2?q.shortLnk2:q.shortLnk);
v.focus(true,100)
}}})
}}]})],buttonAlign:"left",buttons:[{icon:HttpCommander.Lib.Utils.getIconPath(e,"help")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=help":""),text:"",handler:function(r){e.showHelpWindow("publiclink")
}},{text:e.htcConfig.locData.PublicLinksDeleteLinkButton,handler:function(r){var s=Ext.isObject(q.linkForEdit)&&Ext.isNumber(q.linkForEdit.id)?q.linkForEdit.id:null;
if(!s||s<0){s=Ext.isNumber(q.link_id)&&q.link_id>0?q.link_id:null;
if(!s){r.setVisible(false);
return
}}e.Msg.confirm(e.htcConfig.locData.PublicLinksDeleteWindowTitle,e.htcConfig.locData.PublicLinksDeleteSingleConfirmMsg,function(t){if(t=="yes"){e.globalLoadMask.msg=e.htcConfig.locData.ProgressDeletingAnonymousLink+"...";
e.globalLoadMask.show();
HttpCommander.Common.RemoveAnonymLinks({ids:[s]},function(v,u){e.globalLoadMask.hide();
e.globalLoadMask.msg=e.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(v,u,e.Msg,e.htcConfig)){q.hide();
if(v&&v.needrefresh){e.openGridFolder(e.getCurrentFolder())
}}})
}e.Msg.hide()
})
},hidden:true},"->",{icon:HttpCommander.Lib.Utils.getIconPath(e,"sendemail")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=sendemail":""),text:e.htcConfig.locData.AnonymousLinkSendViaButton,menu:[{icon:HttpCommander.Lib.Utils.getIconPath(e,"sendemail")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=sendemail":""),text:e.htcConfig.locData.AnonymousLinkSendViaEmailItem,hidden:o(),handler:function(t){if(!o()){var s=e.initSendEmail();
if(s){var u={};
var v=q.lnk;
var r=q.shortLnk;
if(v&&v.length>0){u.url=v
}if(r&&r.length>0){u.sUrl=r
}s.initialize(u);
s.show()
}}}},{icon:HttpCommander.Lib.Utils.getIconPath(e,"gmail"),text:"Gmail",hidden:o(),handler:function(r){i("https://mail.google.com/mail/?view=cm&fs=1&ui=2&su="+encodeURIComponent(e.htcConfig.locData.AnonymousLinkSendSubject)+"&body=","gmail")
}},{icon:HttpCommander.Lib.Utils.getIconPath(e,"outlook"),text:"Outlook",hidden:o(),handler:function(r){i("https://outlook.live.com/?path=/mail/action/compose&subject="+encodeURIComponent(e.htcConfig.locData.AnonymousLinkSendSubject)+"&body=","outlook")
}},{icon:HttpCommander.Lib.Utils.getIconPath(e,"gplus"),text:"Google+",hidden:k(),handler:function(r){i("https://plus.google.com/share?url=","gplus")
}},{icon:HttpCommander.Lib.Utils.getIconPath(e,"twitter"),text:"Twitter",hidden:k(),handler:function(r){i("https://twitter.com/intent/tweet?url=","twitter")
}},{icon:HttpCommander.Lib.Utils.getIconPath(e,"facebook"),text:"Facebook",hidden:k(),handler:function(r){i("https://www.facebook.com/sharer/sharer.php?title="+encodeURIComponent(e.htcConfig.locData.AnonymousLinkSendSubject)+"&u=","facebook")
}},{icon:HttpCommander.Lib.Utils.getIconPath(e,"linkedin"),text:"LinkedIn",hidden:k(),handler:function(r){i("https://www.linkedin.com/shareArticle?mini=true&title="+encodeURIComponent(e.htcConfig.locData.AnonymousLinkSendSubject)+"&url=","linkedin")
}},{text:e.htcConfig.locData.QRCodeButton,icon:HttpCommander.Lib.Utils.getIconPath(e,"qrcode"),hidden:k()||!QRCode,handler:function(s){var r=q.shortLnk2;
if(Ext.isEmpty(r)){r=q.shortLnk
}if(Ext.isEmpty(r)){r=q.lnk2
}if(Ext.isEmpty(r)){r=q.lnk
}if(!Ext.isEmpty(r)){(new e.Window({title:e.htcConfig.locData.QRCodeButton,width:300,height:350,layout:"fit",resizable:false,modal:true,onEsc:function(){this.close()
},bodyCssClass:"qrcode",listeners:{afterrender:function(t){new QRCode(t.body.dom,r);
setTimeout(function(){t.focus()
},50)
}},buttonAlign:"center",buttons:[{text:e.htcConfig.locData.CommonButtonCaptionClose,handler:function(t){t.ownerCt.ownerCt.close()
}}]})).show()
}}}],hidden:k(),disabled:true}],listeners:{resize:function(t,r,s){t.syncShadow()
},beforeshow:function(v){q.lnk=null;
q.lnk2=null;
q.shortLnk=null;
q.shortLnk2=null;
q.shortShowed=false;
q.link_id=null;
q.link_key=null;
var M=Ext.isObject(q.linkForEdit)&&Ext.isNumber(q.linkForEdit.id);
if(M){e.hideViewLinksWindow()
}if(M){q.link_id=q.linkForEdit.id;
q.link_key=q.linkForEdit.key;
q.lnk=q.linkForEdit.url;
q.lnk2=q.linkForEdit.url2;
q.shortLnk=q.linkForEdit.shortUrl;
q.shortLnk2=q.linkForEdit.shortUrl2
}var s=d.getForm();
s.findField("expireDate-public-link").setValue(M?q.linkForEdit.expires:m());
if(M){s.initPass=q.linkForEdit.password
}else{s.initPass=undefined
}s.findField("password-public-link").setValue(M?q.linkForEdit.password:"");
s.findField("password2-public-link").setValue(M?q.linkForEdit.password:"");
var z=e.htcConfig.enabledLabels||e.htcConfig.isAllowedComments=="1"||e.htcConfig.isAllowedComments=="2"||e.htcConfig.allowedDescription;
s.findField("showComments-public-link").setValue(z&&(M?q.linkForEdit.show_comments:true));
n.setValue(q.anonPerm.download.checked);
n.setDisabled(q.anonPerm.download.disabled);
g.setValue(q.anonPerm.upload.checked);
g.setDisabled(q.anonPerm.upload.disabled);
h.setValue(q.anonPerm.view.checked);
h.setDisabled(q.anonPerm.view.disabled);
p.setValue(q.anonPerm.zip.checked);
p.setDisabled(q.anonPerm.zip.disabled);
f.setVisible(q.isFolder);
if(f.rendered){f.el.dom.style.display=q.isFolder?"":"none"
}else{f.hidden=!q.isFolder
}f.setDisabled(!q.isFolder);
if(q.anonPerm.modify===true){b.isAllowed=true;
b.setDisabled(!g.getValue())
}else{b.items.items[1].setValue(true);
b.setDisabled(true)
}var x=s.findField("downloadCnt-public-link");
var H=!q.isFolder||(q.anonPerm.zip.checked&&!q.anonPerm.upload.checked&&!q.anonPerm.view.checked);
x.setValue(M?(String(q.linkForEdit.downloads).trim()===""?0:q.linkForEdit.downloads):0);
x.label.dom.style.display=H?"":"none";
x.setVisible(H);
if(x.rendered){x.el.dom.style.display=H?"":"none"
}else{x.hidden=!H
}var w=";"+String(!q.Folder?HttpCommander.Lib.Utils.getFileExtension(q.virtPath):"")+";";
var F=e.htcConfig.showPublicLinksForView||0;
var J=!q.isFolder&&(((F&1)!=0&&HttpCommander.Lib.Utils.isAllowedForViewingInBrowser(q.virtPath,e.htcConfig))||((F&2)!=0&&e.htcConfig.enableGoogleDocumentsViewer===true&&HttpCommander.Lib.Consts.googleDocSupportedtypes.indexOf(w)>=0)||((F&4)!=0&&e.htcConfig.enableOWADocumentsViewer===true&&HttpCommander.Lib.Consts.owaSupportedtypes.indexOf(w)>=0));
l.allowedExcludeLCD=J;
if(!q.isFolder&&!J){J=z
}l.setDisabled(false);
l.setVisible(J);
l.allowed=J;
l.el.dom.style.display=J?"":"none";
l.items.items[J?1:0].setValue(true);
l.label.dom.style.display=J?"":"none";
var I=s.findField("noteForUsers-public-link");
I.setValue(M?q.linkForEdit.notes:"");
I.label.dom.style.display=H?"none":"";
I.setVisible(!H);
if(I.rendered){I.el.dom.style.display=!H?"":"none"
}else{I.hidden=H
}var D=s.findField("emails-public-link");
D.setValue(M?q.linkForEdit.emails:"");
D.label.dom.style.display=H?"none":"";
D.setVisible(!H);
if(D.rendered){D.el.dom.style.display=!H?"":"none"
}else{D.hidden=H
}var y=q.findById(e.$("hint-public-link"));
y.setVisible(e.htcConfig.publicLinksViewType!=2);
if(e.htcConfig.publicLinksViewType!=2){if(q.isFolder){y.setText(String.format(q.anonPerm.upload.checked||q.anonPerm.view.checked?e.htcConfig.locData.PublicFolderLinkHint:e.htcConfig.locData.PublicFolderLinkDownloadZipHint,('<b><a href="#" class="a-p-l">'+Ext.util.Format.htmlEncode(q.virtPath)+"</a></b>")),false)
}else{y.setText(String.format(e.htcConfig.locData.LinkToFileAnonymDownloadLinkHint,('<b><a href="#" class="a-p-l">'+Ext.util.Format.htmlEncode(q.virtPath)+"</a></b>")),false)
}}q.setTitle(M?Ext.util.Format.htmlEncode(String.format(e.htcConfig.locData.AnonymousEditLinkWindowTitle,q.linkForEdit.virt_path)):e.htcConfig.locData.CommandMakePublicFolder);
var A=s.findField("au-checkbox"),G=s.findField("au-users"),B=s.findField("au-send-checkbox"),r=s.findField("au-pers-msg");
A.setValue(false);
G.setValue(null);
G.setDisabled(true);
B.setValue(true);
B.setDisabled(true);
r.setDisabled(true);
if(M){var N=q.linkForEdit.access_users;
if(!Ext.isEmpty(N)&&N.trim().length>0){A.setValue(true);
G.setValue(N);
G.setDisabled(false);
B.setDisabled(false);
aUsersMsg=q.linkForEdit.pesonalmessage;
if(!Ext.isEmpty(aUsersMsg)&&aUsersMsg.trim().length>0){B.setValue(true);
r.setValue(aUsersMsg);
r.setDisabled(false)
}}}q.buttons[1].setVisible(M);
q.buttons[3].setDisabled(!M);
var u=q.findById(e.$("public-link-create-btn")),C=q.findById(e.$("public-link-view-btn"));
var L=C.ownerCt;
C.setVisible(!M);
var E=(q.isFolder&&!e.htcConfig.enablePublicLinkToFolder)||(!q.isFolder&&!e.htcConfig.enablePublicLinkToFile);
if(u){u.setText(M?e.htcConfig.locData.CommandSave:e.htcConfig.locData.LinkToFileGenerate);
u.isEditMode=M;
u.setDisabled(E)
}if(M||e.htcConfig.requirePasswordOnCreatePublicLink||e.htcConfig.expandSettingsWhenOpenCreatePublicLinkWindow){c.expand()
}else{c.collapse()
}a.collapse();
q.doLayout();
q.syncShadow();
q.syncSize();
var K=q.findById(e.$("url-public-link"));
var t=q.findById(e.$("url-short-public-link"));
if(K){K.setDisabled(!M)
}if(t){t.setDisabled(!M)
}q.changeLinkType(!J||l.getValue().getValue());
return true
},hide:function(r){r.buttons[1].setVisible(false);
if(typeof r.linkForEdit!="undefined"&&r.linkForEdit!=null&&(typeof r.fromGrid=="undefined"||!r.fromGrid)){e.initAndShowViewLinksWindow(true,true)
}},show:function(t){var s=t.findById(e.$("hint-public-link"));
if(s){var r=s.el.query(".a-p-l",true);
if(r&&(r=r[0])){r.onclick=function(){if(t&&!Ext.isEmpty(t.virtPath)){var w=t.virtPath;
if(!t.isFolder){var v=w.lastIndexOf("/");
if(v>=0){var u=w.substring(v+1);
w=w.substring(0,v);
e.setSelectPath({path:w,name:u})
}}e.openGridFolder(w)
}return false
}
}}}},changeLinkType:function(v){var w=!q.isFolder&&l.allowed&&l.items.items[1].getValue();
var t=!v&&w&&q.lnk2?q.lnk2:q.lnk;
var u=!v&&w&&q.shortLnk2?q.shortLnk2:q.shortLnk;
var s=q.findById(e.$("url-public-link"));
var r=q.findById(e.$("url-short-public-link"));
if(s){s.setValue(t);
s.focus(true,100)
}if(r){r.setValue(u)
}},publicLinkMainHandler:function(J){var F=q.validatePublicLinkData();
if(F){e.Msg.show({title:e.htcConfig.locData.CommonErrorCaption,msg:F,icon:e.Msg.WARNING,buttons:e.Msg.OK});
return
}J=(J===true);
var G=q.isFolder&&(g.getValue()||h.getValue());
var r=q.virtPath;
var x={path:r,service:(G?"PublicFolder":"Share"),isFolder:q.isFolder};
if(Ext.isNumber(q.link_id)){x.link_id=q.link_id;
x.link_key=q.link_key
}var t=d.getForm();
var I=t.findField("expireDate-public-link").getValue();
var D=new Date(I.getFullYear(),I.getMonth(),I.getDate());
var C=new Date(D.getTime()+24*60*60*1000);
x.expireDate=HttpCommander.Lib.Utils.getDateUTCString(C);
if(G){x.downloadCnt=0
}else{var y=String(t.findField("downloadCnt-public-link").getValue());
if(y.trim()==""){x.downloadCnt=0
}else{try{x.downloadCnt=parseInt(y)
}catch(H){x.downloadCnt=0
}}}x.password=t.findField("password-public-link").getValue();
if(J){x.pass_changed=Ext.isDefined(t.initPass)&&((x.password==null&&t.initPass==null)||(x.password===t.initPass))
}else{x.pass_changed=false
}x.noteForUsers=G?t.findField("noteForUsers-public-link").getValue():null;
if(G){x.acl={down:n.getValue(),up:g.getValue(),view:h.getValue(),zip:p.getValue()};
if(g.getValue()){x.acl["overwrite"]=b.isAllowed===true&&b.items.items[0].getValue()
}x.emails=t.findField("emails-public-link").getValue()
}x.linktypeview=!q.isFolder&&HttpCommander.Lib.Utils.isAllowedForViewingInBrowser(q.virtPath,e.htcConfig);
var u=!q.isFolder&&l.allowed&&l.items.items[1].getValue();
x.show_comments=t.findField("showComments-public-link").getValue();
var z=t.findField("au-checkbox"),E=t.findField("au-users"),A=t.findField("au-send-checkbox"),s=t.findField("au-pers-msg");
var K=null,B=false,v=null;
if(e.htcConfig.anonymLimitAccessForUsers&&z.getValue()){K=E.getValue();
if(!Ext.isEmpty(K)&&(K=K.trim()).length>0){if(!Ext.isEmpty(x.password)){e.Msg.show({title:e.htcConfig.locData.CommonErrorCaption,msg:e.htcConfig.locData.AnonymousLinkLimitAccessPassAndUsersMsg,icon:e.Msg.WARNING,buttons:e.Msg.OK});
return
}B=A.getValue();
if(B){v=s.getValue();
if(Ext.isEmpty(v)||(v=v.trim()).length==0){v=null
}}}else{K=null
}}x.accessusers=K;
x.pesonalmessage=v;
x.ausend=B;
e.globalLoadMask.msg=e.htcConfig.locData[(J?"ProgressSavingAnonymousLink":"ProgressGettingAnonymLink")]+"...";
var w=Ext.Ajax.timeout;
Ext.Ajax.timeout=90000;
e.globalLoadMask.show();
HttpCommander.Common[(J?"SaveAnonymLink":"AnonymLink")](x,function(R,aa){Ext.Ajax.timeout=w;
e.globalLoadMask.hide();
e.globalLoadMask.msg=e.htcConfig.locData.ProgressLoading+"...";
if(!HttpCommander.Lib.Utils.checkDirectHandlerResult(R,aa,e.Msg,e.htcConfig)){return
}q.link_id=R.link_id;
q.link_key=R.link_key;
var V=q.findById(e.$("url-public-link"));
var L=q.findById(e.$("url-short-public-link"));
var O="";
var N="";
var M=function(ad){if(!Ext.isEmpty(ad)){var ab=HttpCommander.Lib.Utils.getFileName(x.path);
var ac=HttpCommander.Lib.Utils.getFileExtension(ab);
if(ac==="swf"&&e.htcConfig.openSWFonDownload&&HttpCommander.Lib.Utils.browserIs.ie){var ae=ad.split(e.htcConfig.anonymHandlerPath);
if(ae.length==2){return ae[0]+e.htcConfig.anonymHandlerPath+"/"+encodeURIComponent(ab)+ae[1]
}}}return ad
};
if(R.url){N=M(R.url);
if(e.htcConfig.publicLinksViewType!=2){O=N
}}q.lnk=O.length>0?O:null;
q.shortLnk=e.htcConfig.publicLinksViewType!=1&&R["short"]?R["short"]:(e.htcConfig.publicLinksViewType!=1&&N.length>0?N:null);
q.lnk2=e.htcConfig.publicLinksViewType!=2?R.url2:null;
q.shortLnk2=e.htcConfig.publicLinksViewType!=1&&R.short2?R.short2:(e.htcConfig.publicLinksViewType!=1&&R.url2?R.url2:null);
var P=q.lnk2||q.shortLnk2;
var Z=(q.shortLnk||q.shortLnk2)&&!q.lnk&&!q.lnk2;
V.setValue(u&&P&&q.lnk2?q.lnk2:q.lnk);
L.setValue(u&&P&&q.shortLnk2?q.shortLnk2:q.shortLnk);
V.setDisabled(false);
L.setDisabled(false);
q.buttons[1].setVisible(true);
q.buttons[3].setDisabled(false);
J=true;
var W=q.findById(e.$("public-link-create-btn")),X=q.findById(e.$("public-link-view-btn"));
var T=X.ownerCt;
X.setVisible(!J);
var S=(q.isFolder&&!e.htcConfig.enablePublicLinkToFolder)||(!q.isFolder&&!e.htcConfig.enablePublicLinkToFile);
if(W){W.setText(J?e.htcConfig.locData.CommandSave:e.htcConfig.locData.LinkToFileGenerate);
W.isEditMode=J;
W.setDisabled(S)
}V.focus(true,50);
var Y=r;
var Q=null;
var U=Y.lastIndexOf("/");
if(U>=0){if(U<Y.length-1){Q=Y.substring(U+1,Y.length)
}Y=Y.substring(0,U)
}if(Y&&Y.length>0){if(!Ext.isEmpty(Q)){e.setSelectPath({name:Q,path:Y})
}if(!(q.fromSharedGrid===true)||!e.openSharedByLink()){setTimeout(function(){e.openGridFolder(Y)
},300)
}}})
},validatePublicLinkData:function(){if(d){var t=d.getForm();
if(!t.isValid()){return e.htcConfig.locData.LinkToFileInvalidForm
}var s=t.findField("password-public-link").getValue();
if(e.htcConfig.requirePasswordOnCreatePublicLink&&(typeof s=="undefined"||String(s).length==0)){return e.htcConfig.locData.LinkToFilePasswordRequired
}var r=t.findField("password2-public-link").getValue();
if(s!=r){return e.htcConfig.locData.LinkToFilePasswordNotMatch
}if(!f.hidden&&!n.getValue()&&!g.getValue()&&!h.getValue()&&!p.getValue()){return e.htcConfig.locData.PublicFolderACLNotSet
}}return null
},changeViewMakePublicLinkWindow:function(u){u=(u===true);
var t=d.getForm();
var s=t.findField("downloadCnt-public-link");
s.label.dom.style.display=u?"":"none";
s.setVisible(u);
if(s.rendered){s.el.dom.style.display=u?"":"none"
}else{s.hidden=!u
}if(u){n.setValue(false)
}var v=t.findField("emails-public-link");
if(v){v.label.dom.style.display=u?"none":"";
v.setVisible(!u)
}var r=t.findField("noteForUsers-public-link");
r.label.dom.style.display=u?"none":"";
r.setVisible(!u);
q.findById(e.$("hint-public-link")).setText(String.format(u?e.htcConfig.locData.PublicFolderLinkDownloadZipHint:e.htcConfig.locData.PublicFolderLinkHint,("<b>"+Ext.util.Format.htmlEncode(q.virtPath)+"</b>")),false);
q.syncShadow()
}});
return q
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.LinksToWebFoldersWindow=function(a){var b=new a.Window({title:a.htcConfig.locData.CommandWebFoldersLinks,bodyStyle:"padding:5px",layout:"form",modal:true,resizable:false,closeAction:"hide",width:430,plain:true,height:a.getIsEmbeddedtoIFRAME()?250:300,autoHeight:true,labelAlign:"top",items:[{xtype:"label",html:""},{xtype:"label",html:String.format(a.htcConfig.locData.LinksToWebFoldersWindowText,"<span><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(a,"webfolders")+"'>&nbsp;"+HttpCommander.Lib.Utils.getHelpLinkOpenTag(a.getUid(),"webfolders")+"Web Folders</a></span>")+"<hr />"},{xtype:"htmleditor",fieldLabel:a.htcConfig.locData.WebFolderLinksFieldLabel,autoScroll:true,height:130,readOnly:true,anchor:"100%",enableColors:false,enableAlignments:false,enableColors:false,enableFont:false,enableFontSize:false,enableFormat:false,enableLinks:false,enableLists:false,enableSourceEdit:false}],listeners:{afterrender:function(c){c.items.items[2].getToolbar().hide()
}},buttons:[{text:a.htcConfig.locData.CommonButtonCaptionClose,handler:function(){b.hide()
}}],initialize:function(e,h,k){var i=this;
e=e||"";
if(e==""){return
}var g=i.items.items[0];
var f=i.items.items[2];
f.setValue("");
if(g.rendered){g.el.dom.innerHTML=""
}else{g.html=""
}var c="";
var d=false;
if(HttpCommander.Lib.Utils.browserIs.win){c+="<p>"+String.format(a.htcConfig.locData.WebFolderLinksForWindows64Note,"<b>","</b>","<b>"+(typeof a.htcConfig.currentUserDomain!="undefined"&&a.htcConfig.currentUserDomain.trim().length>0?(Ext.util.Format.htmlEncode(a.htcConfig.currentUserDomain)+"\\"+Ext.util.Format.htmlEncode(a.htcConfig.currentUser)):Ext.util.Format.htmlEncode(a.htcConfig.currentUser))+"</b>")+"</p>";
d=true;
e='net use "*" "<span style="font-weight:bold;">'+Ext.util.Format.htmlEncode(e)
}else{if(HttpCommander.Lib.Utils.browserIs.mac&&!HttpCommander.Lib.Utils.browserIs.ios){c="<p>"+String.format(a.htcConfig.locData.WebFolderLinksForMacOSNote,"<b>","</b>")+"</p>"
}else{if(HttpCommander.Lib.Utils.browserIs.ubuntu){c="<p>"+String.format(a.htcConfig.locData.WebFolderLinksForUbuntuNote,"<b>","</b>")+"</p>";
if(e.toLowerCase().indexOf("https://")==0){e="davs://"+e.substring(8)
}else{if(e.toLowerCase().indexOf("http://")==0){e="dav://"+e.substring(7)
}}}}}if(g.rendered){g.el.dom.innerHTML=c
}else{g.html=c
}if(h&&h!=""){h=e+Ext.util.Format.htmlEncode(h);
if(k&&k!=""){k=h+"/"+Ext.util.Format.htmlEncode(k)+"/";
if(d){k+='</span>" /savecred /persistent:yes'
}}h+="/";
if(d){h+='</span>" /savecred /persistent:yes'
}}if(d){e+='</span>" /savecred /persistent:yes'
}f.setValue(e+((h&&h!="")?("<br />"+h+(k&&k!=""?("<br />"+k):"")):""))
}});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.MailingGroupsWindow=function(a){var b;
var c=new a.Window({title:a.htcConfig.locData.SendEmailBulkMailingListWindowTitle,height:250,width:300,autoScroll:true,plain:true,bodyStyle:"padding:2px",header:false,modal:true,layout:"fit",closeAction:"hide",items:[{itemId:"mailing-list-empty-label",xtype:"label",text:""},b=new Ext.tree.TreePanel({useArrows:true,border:false,header:false,rootVisible:false,lines:false,frame:false,baseCls:"x-plain",loader:new Ext.tree.TreeLoader(),root:{itemId:"root-mailing-list"},listeners:{load:function(d){Ext.each(d.childNodes,function(f){var e=(d.ui&&d.ui.getEl)?d.ui.getEl():undefined;
if(e){Ext.fly(e).addClass("x-bg-free-tree-node")
}});
if(a.htcConfig.relativePath!=""){Ext.each(d.childNodes,function(e){if(typeof e.attributes.icon!=="undefined"){e.attributes.icon=a.htcConfig.relativePath+e.attributes.icon
}})
}}}})],listeners:{afterrender:function(d){b.on("checkchange",d.onCheckChangeMailingList,d)
}},buttons:[{text:a.htcConfig.locData.CommonButtonCaptionOK,handler:function(){var e=[];
var d=";";
Ext.each(b.getRootNode().childNodes,function(f){if(f.getUI().isChecked()){e.push("group:"+f.attributes.name)
}else{Ext.each(f.childNodes,function(g){if(g.getUI().isChecked()&&d.indexOf(";"+g.attributes.name.toLowerCase()+";")<0){e.push("user:"+g.attributes.name);
d+=g.attributes.name.toLowerCase()+";"
}})
}});
a.setEmails(e.join(","));
c.hide()
}},{text:a.htcConfig.locData.CommonButtonCaptionCancel,handler:function(){c.hide()
}}],onCheckChangeMailingList:function(g,f){var e=this;
b.un("checkchange",e.onCheckChangeMailingList,e);
if(!g.isExpanded()&&g.isExpandable()){g.expand()
}if(g.hasChildNodes()){Ext.each(g.childNodes,function(i){i.getUI().toggleCheck(f)
})
}else{if(g.parentNode&&g.parentNode.id!=b.getComponent("root-mailing-list")){var h=true;
for(var d=0;
d<g.parentNode.childNodes.length;
d++){if(g.parentNode.childNodes[d].getUI().isChecked()!=f){h=false;
break
}}if(h){g.parentNode.getUI().toggleCheck(f)
}else{g.parentNode.getUI().toggleCheck(false)
}}}b.on("checkchange",e.onCheckChangeMailingList,e)
},setNoteText:function(d){this.getComponent("mailing-list-empty-label").setText(d)
},setGroups:function(d){var f=this;
var e=new Ext.tree.AsyncTreeNode({itemId:"root-mailing-list",expanded:true,children:d});
b.setRootNode(e)
}});
return c
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.SendEmailWindow=function(d){var f=HttpCommander.Lib.MailingGroupsWindow({htcConfig:d.htcConfig,Msg:d.Msg,Window:d.Window,getEmails:function(){return b.getEmails()
},setEmails:function(g){b.setEmails(g)
}});
var a,e,c=new Ext.data.SimpleStore({fields:[{name:"name",type:"string"},{name:"flag",type:"boolean"}],data:HttpCommander.Lib.Utils.EMails.getDataStore(),sortInfo:{field:"name",direction:"ASC"}});
e=new Ext.ux.form.SuperBoxSelect({itemId:"send-to",hideLabel:true,columnWidth:1,allowBlank:false,autoHeight:true,xtype:"superboxselect",resizable:true,forceFormValue:false,allowAddNewData:true,addNewDataOnBlur:true,store:c,triggerAction:"all",lazyInit:false,mode:"local",displayField:"name",displayFieldTpl:"{name:htmlEncode}",tpl:'<tpl for="."><div class="x-combo-list-item">{name:htmlEncode}</div></tpl>',valueField:"name",forceSelection:true,allowQueryAll:true,listeners:{newitem:function(g,i,l){if(Ext.isEmpty(i)||i.trim().length==0){return
}var h=g.usedRecords,k=i.split(/,|;|\|/gi);
Ext.each(k,function(p,m){var n;
if(!Ext.isEmpty(p)&&((n=p.trim()).length>0)&&!h.containsKey(n.toLowerCase())){var o=new Ext.data.Record({name:n,flag:true});
g.getStore().add(o);
g.getStore().commitChanges();
g.addRecord(o)
}})
},render:function(g){g.syncSize();
g.firstHeight=g.getHeight();
g.initHeight=g.getHeight()
},autosize:function(l,h){var i=a.getComponent("send-body");
if(typeof l.initHeight!="undefined"){var g=b.getHeight();
var m=l.getHeight()-l.initHeight;
var k=g+m;
l.initHeight=l.getHeight();
if(g!=k){b.setHeight(k);
b.syncShadow();
b.fireEvent("resize",b,b.getWidth(),k);
if(i&&i.rendered){i.syncSize()
}}}}}});
var b=new d.Window({title:d.htcConfig.locData.CommandSendEmail,plain:true,bodyStyle:"padding:5px",modal:true,collapsible:false,maximizable:!d.getEmbedded(),width:400,height:d.getIsEmbeddedtoIFRAME()?275:325,minWidth:400,minHeight:d.getIsEmbeddedtoIFRAME()?275:325,layout:"fit",closeAction:"hide",sendType:1,withFiles:true,withFolders:false,urls:[],urlsBT:[],fUrls:[],fUrlsBT:[],items:[a=new Ext.form.FormPanel({baseCls:"x-plain",labelWidth:75,defaults:{xtype:"textfield",anchor:"100%"},items:[{xtype:"container",layout:"column",anchor:"100%",itemId:"send-to-cont",autoHeight:true,fieldLabel:d.htcConfig.locData.SendEmailTo,items:[e,{itemId:"mailing-groups-button",style:{paddingLeft:"5px"},xtype:"button",icon:HttpCommander.Lib.Utils.getIconPath(d,"mailgroups"),tooltip:d.htcConfig.locData.SendEmailBulkMailingListHint,handler:function(){f.setNoteText("");
f.hide();
var g=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
d.globalLoadMask.msg=d.htcConfig.locData.GettingMailingListProgressMessage+"...";
d.globalLoadMask.show();
var h={path:d.getCurrentFolder(),emails:b.getSendToField().getValueArray()};
HttpCommander.Common.GetMailingList(h,function(k,i){Ext.Ajax.timeout=g;
d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(typeof k=="undefined"){d.Msg.alert(d.htcConfig.locData.CommonErrorCaption,Ext.util.Format.htmlEncode(i.message))
}else{if(!k.success){d.Msg.alert(d.htcConfig.locData.CommonErrorCaption,k.message)
}else{f.setGroups(k.groups)
}}if(k.groups.length==0){f.setNoteText(d.htcConfig.locData.SendEmailEmptyMailingListMessage)
}f.show()
})
}}]},{itemId:"send-sender-email",fieldLabel:d.htcConfig.locData.SendEmailSenderEmail,anchor:"100%",vtype:"email",allowBlank:true,value:d.htcConfig.currentEMail},{itemId:"send-subject",fieldLabel:d.htcConfig.locData.SendEmailSubject,anchor:"100%",allowBlank:false},{itemId:"send-files",xtype:"radiogroup",anchor:"100%",vertical:true,columns:1,hideLabel:true,disabled:true,items:[{boxLabel:d.htcConfig.locData.SendEmailFilesAsLinksTo,name:"rb-auto",inputValue:"links-to",checked:false,listeners:{check:function(k,n){var m=a.getComponent("send-body");
var g=m.getValue();
var h,l;
for(l=0;
l<b.urls.length;
l++){h=b.urls[l];
if(typeof h=="string"&&h!=""){while(g.indexOf(h)>=0){g=g.replace(h,"")
}}}for(l=0;
l<b.urlsBT.length;
l++){h=b.urlsBT[l];
if(typeof h=="string"&&h!=""){while(g.indexOf(h)>=0){g=g.replace(h,"")
}}}if(n&&b.urls.length>0){g+=b.urls.join("")
}m.setValue(g);
m.syncValue()
}}},{boxLabel:d.htcConfig.locData.SendEmailFilesAsAttachements,name:"rb-auto",inputValue:"attach",checked:false}]},{itemId:"send-body",xtype:"htmleditor",hideLabel:true,flex:1,width:"100%",anchor:"100%",listeners:{afterrender:function(g){g.lastHeight=g.getHeight()
}}}]})],buttonAlign:"left",buttons:[{icon:HttpCommander.Lib.Utils.getIconPath(d,"sendemail")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=sendemail":""),text:d.htcConfig.locData.AnonymousLinkSendViaButton,menu:[{icon:HttpCommander.Lib.Utils.getIconPath(d,"gmail"),text:"Gmail",handler:function(g){b.sendViaService("https://mail.google.com/mail/?view=cm&fs=1&ui=2&to={0}&su={1}&body={2}","gmail")
}},{icon:HttpCommander.Lib.Utils.getIconPath(d,"outlook"),text:"Outlook",handler:function(g){b.sendViaService("https://outlook.live.com/?path=/mail/action/compose&subject={1}&body={2}&to={0}","outlook")
}}]},"->",{text:d.htcConfig.locData.SendEmailSend,handler:function(){if(a.getForm().isValid()){var l=b.getSendToField();
var o={to:l.getValueArray(),subject:a.getComponent("send-subject").getValue(),body:a.getComponent("send-body").getValue(),files:[],path:d.getCurrentFolder(),withFiles:b.withFiles,withFolders:b.withFolders,sender:a.getComponent("send-sender-email").getValue()};
var n=l.usedRecords,p=n.getRange(),g;
for(var h=0,m=p.length;
h<m;
h++){g=p[h];
if(g.get("flag")===true){HttpCommander.Lib.Utils.EMails.put(g.get("name"));
g.set("flag",false);
g.commit()
}}var r=a.getComponent("send-files").getValue();
var k=r&&r.getGroupValue()=="attach";
if(o.withFiles&&((k&&b.sendType==3)||b.sendType==2)){o.files=b.createSelectedFilesSet().files
}o.withFiles=o.files&&o.files.length>0;
var q=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
d.globalLoadMask.msg=d.htcConfig.locData.SendEmailProgressMessage+"...";
d.globalLoadMask.show();
HttpCommander.Common.SendEmail(o,function(s,i){Ext.Ajax.timeout=q;
d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(s,i,d.Msg,d.htcConfig)){d.Msg.show({title:d.htcConfig.locData.CommandSendEmail,msg:d.htcConfig.locData.SendEmailSuccessMessage+"<br />"+String.format(d.htcConfig.locData.SendEmailResultsMessage,s.sended,s.failed,s.message||""),closable:true,modal:true,buttons:d.Msg.OK,fn:function(t){b.hide()
},icon:d.Msg.INFO})
}})
}}},{text:d.htcConfig.locData.CommonButtonCaptionClose,handler:function(){b.hide();
a.getForm().reset()
}}],listeners:{afterrender:function(h){h.lastHeight=h.getHeight();
var g=a.getComponent("send-files");
if(!g){return
}switch(h.sendType){case 0:g.items.items[0].el.dom.checked=g.items.items[1].el.dom.checked=false;
g.setDisabled(true);
break;
case 1:g.items.items[0].el.dom.checked=true;
g.items.items[1].el.dom.checked=false;
g.setDisabled(true);
break;
case 2:g.items.items[0].el.dom.checked=false;
g.items.items[1].el.dom.checked=true;
g.setDisabled(true);
break;
case 3:g.items.items[0].el.dom.checked=true;
g.items.items[1].el.dom.checked=false;
break
}},hide:function(g){b.urls=[];
b.urlsBT=[];
b.fUrls=[];
b.fUrlsBT=[]
},resize:function(m,g,k){if(m&&a&&typeof e.firstHeight!="undefined"){var i=a.getComponent("send-body");
if(typeof m.lastHeight!="undefined"&&i&&typeof i.lastHeight!="undefined"){var l=k-m.lastHeight;
i.setHeight(i.lastHeight+l);
i.lastHeight=i.getHeight();
m.lastHeight=m.getHeight();
i.setHeight(i.getHeight()-73-(e.getHeight()-e.firstHeight))
}}}},sendViaService:function(k,m){if(!k){return
}var p=b.getSendToField().getValueArray(),o=a.getComponent("send-subject").getValue(),l=(b.allRawUrls||[]).join("\n\n").replace(/&action=download/gi,"");
if(Ext.isEmpty(l)){l=a.getComponent("send-body").getValue()
}var i=(m=="gmail"?8192:2048),g=String.format(k,encodeURIComponent(p||""),encodeURIComponent(o||""),encodeURIComponent(l||""));
if(g.length>=i){g=g.substring(0,i)
}var h=window.open(g,"linkssend"+(m||"gmail"),HttpCommander.Lib.Utils.getPopupProps(600,500));
if(h){try{h.focus()
}catch(n){}}},createSelectedFilesSet:function(){return d.getSelectedFiles()
},cleanup:function(){b.urls=[];
b.urlsBT=[];
b.fUrls=[];
b.fUrlsBT=[];
b.allRawUrls=[];
a.getComponent("send-sender-email").setValue("");
a.getComponent("send-subject").setValue("");
a.getForm().reset();
a.getComponent("send-body").setValue("");
a.getComponent("send-body").syncValue()
},setSendFiles:function(g){var h=a.getComponent("send-files");
if(h){h.setDisabled(!g);
if(b.sendType>0){h.setValue(b.sendType==2?"attach":"links-to")
}}},setUrls:function(m,l,g,n,k){var i=this;
var h="";
if(m||m.length>0){h+=m.join("")
}if(g&&g.length>0){h+=g.join("")
}a.getComponent("send-body").setValue(h);
a.getComponent("send-body").syncValue();
b.urls=m||[];
b.urlsBT=l||[];
b.fUrls=g||[];
b.fUrlsBT=n||[];
b.allRawUrls=k||[]
},setVisibleMailingGroupsButton:function(h){var g=a.getComponent("send-to-cont").getComponent("mailing-groups-button");
if(g){g.setVisible(h)
}},getSendToField:function(){return e||a.getComponent("send-to-cont").getComponent("send-to")
},getEmails:function(){var h=this;
var g=h.getSendToField();
if(g){return g.getValue()
}else{return null
}},setEmails:function(o){var l=this;
var k=l.getSendToField();
if(k){var h=[],m;
if(typeof o!="undefined"&&o.length>0){h=o.split(",");
for(var n=0,g=h.length;
n<g;
n++){m=h[n];
if(m&&m.length>0){k.fireEvent("newitem",k,m,"")
}}}}},initialize:function(o){b.cleanup();
a.getComponent("send-sender-email").setValue(d.htcConfig.currentEMail);
var u=typeof o!="undefined"&&o!=null;
var h=u?[]:d.getSelectedFiles().files;
var i=h.length;
var p=d.getSelectedFiles().folders;
var n=p.length;
var m=[];
var r=[];
var l=[];
var k=[];
var t=[];
if(u){a.getComponent("send-subject").setValue(d.htcConfig.locData.AnonymousLinkSendSubject);
var s;
if(typeof o.url!="undefined"){m.push(o.url);
s=Ext.util.Format.htmlEncode(o.url);
r.push('<br><a href="'+s+'">'+s+"</a>");
l.push('<BR><A href="'+s+'">'+s+"</A>")
}if(typeof o.sUrl!="undefined"){m.push(o.sUrl);
s=Ext.util.Format.htmlEncode(o.sUrl);
r.push('<br><a href="'+s+'">'+s+"</a>");
l.push('<BR><A href="'+s+'">'+s+"</A>")
}}else{if(a.getComponent("send-subject").getValue()==d.htcConfig.locData.AnonymousLinkSendSubject){a.getComponent("send-subject").setValue("")
}if((d.htcConfig.currentPerms&&d.htcConfig.currentPerms.download&&i>0)||n>0){var v=d.getCurrentFolder();
if(d.htcConfig.currentPerms&&d.htcConfig.currentPerms.download&&i>0){Ext.each(h,function(x){var w=d.linkToFileByName(x,v);
m.push(w);
r.push('<br><a href="'+Ext.util.Format.htmlEncode(w)+'">'+Ext.util.Format.htmlEncode(w)+"</a>");
l.push('<BR><A href="'+Ext.util.Format.htmlEncode(w)+'">'+Ext.util.Format.htmlEncode(w)+"</A>")
})
}if(n>0){Ext.each(p,function(x){var w=d.linkToFolderByName(x,v);
m.push(w);
k.push('<br><a href="'+Ext.util.Format.htmlEncode(w)+'">'+Ext.util.Format.htmlEncode(w)+"</a>");
t.push('<BR><A href="'+Ext.util.Format.htmlEncode(w)+'">'+Ext.util.Format.htmlEncode(w)+"</A>")
})
}}}var q=(((i>0&&d.htcConfig.enableLinkToFile==true)||(u&&r.length>0))||(n>0&&d.htcConfig.enableLinkToFolder==true))&&(d.htcConfig.enableSendEmail=="any"||d.htcConfig.enableSendEmail=="linksonly");
var g=r.length>0&&(u||d.htcConfig.currentPerms.download)&&(d.htcConfig.enableSendEmail=="any"||d.htcConfig.enableSendEmail=="attachmentsonly");
b.sendType=((i==0&&n==0)?0:(q&&!g?1:(!q&&g?2:3)));
b.setSendFiles(i>0&&d.htcConfig.enableSendEmail=="any"&&q&&g);
b.withFiles=i>0;
b.withFolders=n>0;
if(q){b.setUrls(r,l,k,t,m)
}b.setVisibleMailingGroupsButton(d.htcConfig.bulkMailSendSettings&&d.htcConfig.bulkMailSendSettings!="disabled"&&d.htcConfig.currentPerms&&d.htcConfig.currentPerms.bulkMailing);
c.loadData(HttpCommander.Lib.Utils.EMails.getDataStore());
e.focus()
}});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.CheckInWindow=function(a){var b=new a.Window({title:"",plain:true,bodyStyle:"padding:5px",modal:true,width:a.getIsEmbeddedtoIFRAME()?250:300,autoHeight:true,layout:"fit",closeAction:"hide",fileInfo:{},items:[new Ext.FormPanel({itemId:"check-in-form-panel",baseCls:"x-plain",frame:false,fileUpload:true,autoHeight:true,defaults:{anchor:"100%"},labelAlign:"top",items:[{itemId:"check-in-label",xtype:"label",html:a.htcConfig.locData.FileUploadCheckInLabel+"<hr />"},{itemId:"check-in-notes",name:"check-in-notes",xtype:"textarea",height:45,fieldLabel:a.htcConfig.locData.VersionHistoryGridNotesColumn},{itemId:"check-in-upload-field",name:"check-in-upload-field",hideLabel:true,xtype:"fileuploadfield"}]})],listeners:{show:function(c){c.getComponent("check-in-form-panel").getForm().reset()
}},buttons:[{text:a.htcConfig.locData.CommandCheckIn,handler:function(){var c=b.fileInfo;
c.notes=b.getComponent("check-in-form-panel").getComponent("check-in-notes").getValue();
var e=b.items.items[0].getForm();
var f=b.getComponent("check-in-form-panel").getComponent("check-in-upload-field").value;
if(f!=""){var d=f.lastIndexOf("\\");
if(d!=-1){f=f.substring(d+1)
}if(f.toLowerCase()!=c.name.toLowerCase()){a.Msg.alert(a.htcConfig.locData.CommonErrorCaption,a.htcConfig.locData.FileUploadCheckInInvalidFileName);
return
}a.globalLoadMask.msg=a.htcConfig.locData.CheckingInMessage+"...";
a.globalLoadMask.show();
e.submit({url:a.htcConfig.relativePath+"Handlers/Upload.ashx?checkin="+encodeURIComponent(c.name)+"&path="+encodeURIComponent(c.path),success:function(g,h){a.globalLoadMask.hide();
a.globalLoadMask.msg=a.htcConfig.locData.ProgressLoading+"...";
b.hide();
a.showBalloon(String.format(a.htcConfig.locData.SuccessfullyCheckedInMessage,Ext.util.Format.htmlEncode(c.name),Ext.util.Format.htmlEncode(a.htcConfig.currentUser)));
a.openGridFolder(c.path)
},failure:function(g,h){a.globalLoadMask.hide();
a.globalLoadMask.msg=a.htcConfig.locData.ProgressLoading+"...";
switch(h.failureType){case Ext.form.Action.CLIENT_INVALID:a.Msg.alert(a.htcConfig.locData.CommonErrorCaption,a.htcConfig.locData.UploadInvalidFormFields);
break;
case Ext.form.Action.CONNECT_FAILURE:a.Msg.alert(a.htcConfig.locData.CommonErrorCaption,a.htcConfig.locData.UploadAjaxFailed);
break;
case Ext.form.Action.SERVER_INVALID:a.Msg.alert(a.htcConfig.locData.CommonErrorCaption,h.result.msg||h.result.message);
break
}a.openGridFolder(c.path)
}})
}else{a.globalLoadMask.msg=a.htcConfig.locData.CheckingInMessage+"...";
a.globalLoadMask.show();
HttpCommander.Common.CheckIn(c,function(h,g){a.globalLoadMask.hide();
a.globalLoadMask.msg=a.htcConfig.locData.ProgressLoading+"...";
if(!HttpCommander.Lib.Utils.checkDirectHandlerResult(h,g,a.Msg,a.htcConfig)){if(typeof h!="undefined"){a.openGridFolder(c.path)
}}else{b.hide();
a.showBalloon(String.format(a.htcConfig.locData.SuccessfullyCheckedInMessage,Ext.util.Format.htmlEncode(c.name),Ext.util.Format.htmlEncode(a.htcConfig.currentUser)));
a.openGridFolder(c.path)
}})
}}},{text:a.htcConfig.locData.UploadSimpleReset,handler:function(){b.items.items[0].getForm().reset()
}},{text:a.htcConfig.locData.CommonButtonCaptionCancel,handler:function(){b.hide()
}}]});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.VersionHistoryWindow=function(c){var b;
var a=new c.Window({title:"",autoDestroy:true,plain:true,border:false,boxMinHeight:250,boxMinWidth:c.getIsEmbeddedtoIFRAME()?350:500,layout:{type:"vbox",align:"stretch",padding:0},fileInfo:{},resizable:true,closeAction:"hide",maximizable:!c.getEmbedded(),width:c.getIsEmbeddedtoIFRAME()?450:650,height:250,items:[{itemId:"file-path-vhist",xtype:"hidden"},{itemId:"file-name-vhist",xtype:"hidden"},b=new Ext.grid.GridPanel({header:false,loadMask:false,selModel:new Ext.grid.RowSelectionModel({singleSelect:true,listeners:{selectionchange:function(e){if(b){var d=b.getTopToolbar();
if(d){d.setDisabled(e.getCount()<1)
}}}}}),store:new Ext.data.JsonStore({autoSave:false,storeId:"vhistStore",remoteSort:false,pruneModifiedRecords:false,autoLoad:true,autoDestroy:true,data:[],idProperty:"id",fields:[{name:"id",type:"int"},{name:"size",type:"int"},{name:"date",type:"string"},{name:"user",type:"string"},{name:"notes",type:"string"}]}),tbar:new Ext.Toolbar({items:[{itemId:"download-vhist",disabled:true,text:c.htcConfig.locData.CommandDownload,icon:HttpCommander.Lib.Utils.getIconPath(c,"download")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=download":""),handler:function(){var e;
if(b){e=b.getSelectionModel().getSelected()
}if(e&&a){var d={};
d.path=a.getComponent("file-path-vhist").getValue();
d.name=a.getComponent("file-name-vhist").getValue();
d.date=e.data.date;
d.user=e.data.user;
window.location.href=c.htcConfig.relativePath+"Handlers/Download.ashx?action=download&file="+encodeURIComponent(d.path+"/"+d.name)+"&version="+encodeURIComponent(d.date)+"_"+encodeURIComponent(d.user)
}}},{itemId:"restore-vhist",disabled:true,text:c.htcConfig.locData.CommandRestoreVersion,icon:HttpCommander.Lib.Utils.getIconPath(c,"restore")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=restore":""),handler:function(){var e;
if(b){e=b.getSelectionModel().getSelected()
}if(e&&a){var d={};
d.path=a.getComponent("file-path-vhist").getValue();
d.name=a.getComponent("file-name-vhist").getValue();
d.date=e.data.date;
d.user=e.data.user;
d.newName=d.name;
a.verInfo=d;
c.Msg.prompt(c.htcConfig.locData.FileVersionRestoreConfirmTitle,String.format(c.htcConfig.locData.FileVersionRestoreConfirmMessage,"<br />","<br />"),a.confirmRestoreHandler,a,false,d.newName)
}}},{itemId:"delete-vhist",disabled:true,text:c.htcConfig.locData.CommandDelete,icon:HttpCommander.Lib.Utils.getIconPath(c,"delete")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=delete":""),handler:function(){var e;
if(b){e=b.getSelectionModel().getSelected()
}if(e&&a){var d={};
d.path=a.getComponent("file-path-vhist").getValue();
d.name=a.getComponent("file-name-vhist").getValue();
d.date=e.data.date;
d.user=e.data.user;
a.verInfo=d;
c.Msg.confirm(c.htcConfig.locData.FileVersionDeleteConfirmTitle,c.htcConfig.locData.FileVersionDeleteConfirmMessage,a.confirmDeleteHandler,a)
}}}]}),columns:[{id:"number-vhist",sortable:true,header:c.htcConfig.locData.VersionHistoryGridNumberColumn,dataIndex:"id",width:35,align:"center",renderer:function(i,d,h,g,f,e){if(h.data.latest){i=i||"";
return"<b>"+Ext.util.Format.htmlEncode(i)+"</b>"
}return Ext.util.Format.htmlEncode(i||"")
}},{id:"size-vhist",sortable:true,header:c.htcConfig.locData.CommonFieldLabelSize,dataIndex:"size",width:70,align:"right",renderer:function(k,d,i,h,f,e){var g=c.getRenderers().sizeRenderer(k);
if(i.data.latest){return"<b>"+g+"</b>"
}return g
}},{id:"date-vhist",sortable:true,header:c.htcConfig.locData.CommonFieldLabelDateCreated,dataIndex:"date",width:125,renderer:function(f,m,h,n,g,l){if(f==null){return null
}var d=new Date(f.substring(0,4),f.substring(4,6)-1,f.substring(6,8),f.substring(8,10),f.substring(10,12),f.substring(12,14));
var k;
try{if(l.isUSA){k=(d.getMonth()+1)+"/"+d.getDate()+"/"
}else{k=d.getDate()+"/"+(d.getMonth()+1)+"/"
}k+=d.getFullYear()+" "+d.toLocaleTimeString()
}catch(i){k=d.toLocaleString()
}if(h.data.latest){k="<b>"+Ext.util.Format.htmlEncode(k)+"</b>"
}return Ext.util.Format.htmlEncode(k)
}},{id:"user-vhist",sortable:true,header:c.htcConfig.locData.CommonFieldLabelUser,dataIndex:"user",width:90,renderer:function(k,d,i,h,g,f){var e=HttpCommander.Lib.Utils.parseUserName(k)||"";
if(i.data.latest){return'<span style="font-weight:bold;">'+Ext.util.Format.htmlEncode(e)+"</span>"
}return Ext.util.Format.htmlEncode(e)
}},{id:"notes-vhist",sortable:true,header:c.htcConfig.locData.VersionHistoryGridNotesColumn,dataIndex:"notes",renderer:function(i,d,h,g,f,e){if(h.data.latest){i=i||"";
return"<b>"+Ext.util.Format.htmlEncode(i)+"</b>"
}return String.format("<span style='white-space: normal;'>{0}</span>",Ext.util.Format.htmlEncode(i||""))
}}],autoExpandColumn:"notes-vhist",flex:1,stripeRows:true,listeners:{render:function(e){var d=e.getTopToolbar().getComponent("download-vhist");
if(d){d.setVisible(c.htcConfig.currentPerms&&c.htcConfig.currentPerms.download)
}}}})],buttons:[{text:c.htcConfig.locData.CommonButtonCaptionClose,handler:function(){a.hide()
}}],listeners:{hide:function(d){if(b){b.getStore().loadData([]);
b.getStore().commitChanges()
}d.setTitle("");
d.getComponent("file-path-vhist").setValue("");
d.getComponent("file-name-vhist").setValue("")
}},confirmRestoreHandler:function(e,f){var d=a.verInfo;
if(e=="ok"){if(f!=""){d.newName=f
}c.globalLoadMask.msg=c.htcConfig.locData.ProgressRestoringVersion+"...";
c.globalLoadMask.show();
HttpCommander.Common.RestoreVersion(d,function(i,h){c.globalLoadMask.hide();
c.globalLoadMask.msg=c.htcConfig.locData.ProgressLoading+"...";
if(!HttpCommander.Lib.Utils.checkDirectHandlerResult(i,h,c.Msg,c.htcConfig)){if(typeof i!="undefined"){c.openGridFolder(d.path)
}}else{if(!i.vhist||i.vhist.length<1){c.Msg.alert(c.htcConfig.locData.CommonWarningCaption,c.htcConfig.locData.NoVersionHistoryMessage);
if(a){a.hide()
}c.openGridFolder(d.path);
return
}if(a&&b){a.setTitle(String.format(c.htcConfig.locData.VersionHistoryTitle,Ext.util.Format.htmlEncode(d.name)));
var g=b.getStore();
g.isUSA=i.isUSA;
g.loadData(i.vhist);
g.commitChanges();
a.getComponent("file-path-vhist").setValue(d.path);
a.getComponent("file-name-vhist").setValue(d.name);
a.show();
c.openGridFolder(d.path)
}}})
}},confirmDeleteHandler:function(e){var d=a.verInfo;
if(e=="yes"){c.globalLoadMask.msg=c.htcConfig.locData.ProgressDeletingVersion+"...";
c.globalLoadMask.show();
HttpCommander.Common.DeleteVersion(d,function(h,g){c.globalLoadMask.hide();
c.globalLoadMask.msg=c.htcConfig.locData.ProgressLoading+"...";
if(!HttpCommander.Lib.Utils.checkDirectHandlerResult(h,g,c.Msg,c.htcConfig)){if(typeof h!="undefined"){c.openGridFolder(d.path)
}}else{if(!h.vhist||h.vhist.length<1){c.Msg.alert(c.htcConfig.locData.CommonWarningCaption,c.htcConfig.locData.NoVersionHistoryMessage);
if(a){a.hide()
}c.openGridFolder(d.path);
return
}if(a&&b){a.setTitle(String.format(c.htcConfig.locData.VersionHistoryTitle,Ext.util.Format.htmlEncode(d.name)));
var f=b.getStore();
f.isUSA=h.isUSA;
f.loadData(h.vhist);
f.commitChanges();
a.getComponent("file-path-vhist").setValue(d.path);
a.getComponent("file-name-vhist").setValue(d.name);
a.show();
c.openGridFolder(d.path)
}}})
}},initialize:function(i,e,d,h,g){var f=b.getStore();
a.setTitle(i);
f.isUSA=e;
f.loadData(d);
f.commitChanges();
a.getComponent("file-path-vhist").setValue(h);
a.getComponent("file-name-vhist").setValue(g)
}});
return a
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.ZipPromptWindow=function(b){var a=new b.Window({title:"",closeAction:"hide",autoHeight:true,width:300,buttonAlign:"center",defaultButton:0,modal:true,plain:true,layout:"form",bodyStyle:"padding:5px",labelAlign:"top",defaults:{anchor:"100%",xtype:"textfield"},items:[{xtype:"label",text:b.htcConfig.locData.CommonZipFileNamePrompt+":"},{xtype:"pwdfield",inputType:"text",hideLabel:true},{xtype:"label",text:b.htcConfig.locData.ZipPasswordProtectHint+":"},{xtype:"pwdfield",hideLabel:true}],buttons:[{text:b.htcConfig.locData.CommonButtonCaptionOK,handler:function(){if(!a.zipInfo.zipDownload){a.zipInfo.name=a.items.items[1].getValue()
}if(b.htcConfig.allowSetPasswordForZipArchives){var c=a.items.items[3].getValue();
if(String(c).length>0){a.zipInfo.password=c
}}a.hide();
var d=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.zipRequestTimeout;
b.globalLoadMask.msg=b.htcConfig.locData.ProgressZipping+"...";
b.globalLoadMask.show();
HttpCommander.Common.Zip(a.zipInfo,function(h,f){Ext.Ajax.timeout=d;
b.globalLoadMask.hide();
b.globalLoadMask.msg=b.htcConfig.locData.ProgressLoading+"...";
if(typeof h=="undefined"){b.Msg.alert(b.htcConfig.locData.CommonErrorCaption,Ext.util.Format.htmlEncode(f.message));
return
}var g=a.zipInfo.path;
if(a.zipInfo.zipDownload){if(!h.success){b.Msg.alert(b.htcConfig.locData.CommonErrorCaption,h.msg)
}else{var e=b.htcConfig.relativePath+"Handlers/Download.ashx?action=download&delete=true&file="+encodeURIComponent(g+"/"+h.filename);
a.zipDownload(e,h.filename)
}}else{a.zipCompleted(h,g)
}})
}},{text:b.htcConfig.locData.CommonButtonCaptionCancel,handler:function(){a.hide()
}}],listeners:{hide:function(c){c.items.items[1].setValue("");
c.items.items[3].setValue("");
if(window.needFixAutofillPasswords){c.items.items[1].setReadOnly(true);
c.items.items[3].setReadOnly(true)
}}},zipDownload:function(f,e){var d=this;
if(!Ext.isIE){window.location.href=f
}else{var h='HttpCommander.Main.FileManagers["'+b.getUid()+'"].downloadDialog';
var c=String.format("<a href='{0}' onclick='if("+h+"){"+h+".hide();delete "+h+";}'>{1}</a>",f,b.htcConfig.locData.DownloadIEClickHere);
var g=String.format(b.htcConfig.locData.DownloadIEArchiveReady,Ext.util.Format.htmlEncode(d.zipInfo.name));
g+=". "+c;
b.getFileManager().downloadDialog=b.Msg.show({title:b.htcConfig.locData.DownloadIECaption,msg:g,fn:function(i){var k={};
k.path=d.zipInfo.path;
k.name=e;
HttpCommander.Common.Cleanup(k,function(m,l){})
}})
}},zipCompleted:function(f,d){var e="";
if(typeof f.filesZipped=="undefined"){f.filesZipped=0
}if(typeof f.foldersZipped=="undefined"){f.foldersZipped=0
}if(f.filesZipped>0){e+=String.format(b.htcConfig.locData.BalloonFilesZipped,f.filesZipped)
}if(f.foldersZipped>0){if(e!=""){e+="<br />"
}e+=String.format(b.htcConfig.locData.BalloonFoldersZipped,f.foldersZipped)
}var g=a.zipInfo.filesCount-f.filesZipped;
if(g>0){if(e!=""){e+="<br />"
}e+=String.format(b.htcConfig.locData.BalloonFilesFailed,g)
}var c=a.zipInfo.foldersCount-f.foldersZipped;
if(c>0){if(e!=""){e+="<br />"
}e+=String.format(b.htcConfig.locData.BalloonFoldersFailed,c)
}b.showBalloon(e);
if(!f.success){b.Msg.alert(b.htcConfig.locData.CommonErrorCaption,f.msg)
}if(!Ext.isEmpty(f.filename)&&!Ext.isEmpty(f.filepath)){b.setSelectPath({name:f.filename,path:f.filepath})
}if(f.success){b.openTreeRecent()
}b.openGridFolder(Ext.isEmpty(f.filepath)?d:f.filepath)
},initialize:function(d){var c=this;
c.zipInfo=d;
zipDownload=d.zipDownload;
c.setTitle(b.htcConfig.locData[zipDownload?"ZipPasswordProtectWindowTitle":"CommonZipFileNameCaption"]);
c.items.items[0].setVisible(!zipDownload);
c.items.items[1].setValue("");
c.items.items[1].setVisible(!zipDownload);
c.items.items[2].setVisible(b.htcConfig.allowSetPasswordForZipArchives);
c.items.items[3].setValue("");
c.items.items[3].setVisible(b.htcConfig.allowSetPasswordForZipArchives)
}});
return a
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.UnzipPromptWindow=function(b){var a=new b.Window({closeAction:"hide",autoHeight:true,width:300,buttonAlign:"center",defaultButton:0,modal:true,plain:true,layout:"form",bodyStyle:"padding:5px",labelAlign:"top",defaults:{anchor:"100%",xtype:"textfield"},flags:0,unzipInfo:null,items:[{xtype:"label",text:""},{xtype:"pwdfield",inputType:"text",hideLabel:true},{xtype:"checkbox",boxLabel:b.htcConfig.locData.OpenFolderAfterUnzipCheckBox,checked:true},{xtype:"label",text:""},{xtype:"pwdfield",hideLabel:true}],buttons:[{text:b.htcConfig.locData.CommonButtonCaptionOK,handler:function(){if(!!a.node&&!!a.dlg){a.unzipInfo.extractPath=a.items.items[1].getValue()
}else{if(a.flags!=1){a.unzipInfo.newName=a.items.items[1].getValue()
}}var c=a.items.items[4].getValue();
if(a.unzipInfo.crypted&&String(c||"").length>0){a.unzipInfo.password=c
}var e=a.dlg;
a.hide();
var d=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.zipRequestTimeout;
b.globalLoadMask.msg=b.htcConfig.locData.ProgressUnzipping+"...";
b.globalLoadMask.show();
HttpCommander.Common.Unzip(a.unzipInfo,function(i,g){Ext.Ajax.timeout=d;
b.globalLoadMask.hide();
b.globalLoadMask.msg=b.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(i,g,b.Msg,b.htcConfig)){if(i.filesRejected>0){b.showBalloon(String.format(b.htcConfig.locData.BalloonNotUnzipped,i.filesRejected)+".<br />"+i.msg)
}else{b.showBalloon(b.htcConfig.locData.BalloonUnzippedSuccessfully)
}var f=a.unzipInfo.extractPath||a.unzipInfo.path;
var h=f;
if(a.flags!=1&&a.items.items[2].getValue()&&a.unzipInfo.newName&&a.unzipInfo.newName.length>0){h+="/"+a.unzipInfo.newName
}if(!!e){e.hide()
}b.openGridFolder(h,f!=h?f:true,true)
}})
}},{text:b.htcConfig.locData.CommonButtonCaptionCancel,handler:function(){a.hide()
}}],listeners:{hide:function(c){c.dlg=null;
c.node=null;
c.items.items[1].setValue("");
c.items.items[4].setValue("");
if(window.needFixAutofillPasswords){c.items.items[1].setDisabled(false);
c.items.items[1].setReadOnly(true);
c.items.items[4].setReadOnly(true)
}}},initialize:function(c,d,e,i){var n=this;
n.dlg=null;
n.node=null;
n.flags=d;
n.unzipInfo=c;
var m=c.name,k=m.lastIndexOf(".");
if(k>0){m=m.substring(0,k)
}var l=b.htcConfig.locData[d==0?(c.all===true?"CommandUnzipAll":"CommandUnzipSelected"):(d==2?"CommonFolderNameCaption":"CommandUnzip")];
if(d==3){l+=" "+b.htcConfig.locData.CommandUnzipTo+' "'+Ext.util.Format.htmlEncode(m)+'"'
}var h=(c.crypted===true);
n.setTitle(l);
n.items.items[4].setValue("");
n.items.items[4].setVisible(h);
if(n.items.items[4].el&&n.items.items[3].el.dom){n.items.items[4].el.dom.style.display=h?"":"none"
}n.items.items[3].setVisible(h);
if(n.items.items[3].el&&n.items.items[2].el.dom){n.items.items[3].el.dom.style.display=h?"":"none"
}n.items.items[1].setValue(d==3?m:"");
n.items.items[0].setText((d==0?(b.htcConfig.locData.MessageUnzipToFolder+".<br />"):"")+b.htcConfig.locData.CommonFolderNamePrompt+":",false);
var g=(d!=1&&d!=3);
n.items.items[0].setVisible(g);
if(n.items.items[0].el&&n.items.items[0].el.dom){n.items.items[0].el.dom.style.display=g?"":"none"
}n.items.items[1].setVisible(g);
n.items.items[1].setDisabled(false);
if(n.items.items[1].el&&n.items.items[1].el.dom){n.items.items[1].el.dom.style.display=g?"":"none"
}n.items.items[3].setText(b.htcConfig.locData[d==0?"MessageUnzipNeedPassword":"MessageUnzipPasswordHint"]+":",false);
var f=d!=1;
n.items.items[2].setVisible(f);
if(n.items.items[2].el&&n.items.items[2].el.dom){n.items.items[2].el.dom.style.display=f?"":"none"
}if(!!e&&!!i){n.items.items[1].setValue(e.attributes.path);
n.items.items[1].setDisabled(true);
n.node=e;
n.dlg=i
}}});
return a
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.ZipContentWindow=function(config){var zipFileInfo,zipContentTree;
var self=new config.Window({title:"",plain:true,buttonAlign:"center",autoDestroy:true,boxMinHeight:250,boxMinWidth:config.getIsEmbeddedtoIFRAME()?350:400,layout:"fit",border:false,resizable:true,closeAction:"hide",maximizable:!config.getEmbedded(),width:config.getIsEmbeddedtoIFRAME()?450:500,height:config.getIsEmbeddedtoIFRAME()?250:300,items:[zipFileInfo=new Ext.form.Hidden({hidden:true}),zipContentTree=new Ext.tree.TreePanel({useArrows:true,totalNodes:0,autoScroll:true,header:false,rootVisible:false,lines:false,forceLayout:true,existsCryptedNodes:false,loader:new Ext.tree.TreeLoader(),root:{itemId:"root-zip-content"},tbar:new Ext.Toolbar({items:[{xtype:"checkbox",itemId:"unzip-contnet-ignore-paths",boxLabel:config.htcConfig.locData.UploadJavaIgnorePaths}]}),bbar:new Ext.Toolbar({items:[{xtype:"label",itemId:"unzip-contnet-files-info",html:String.format(config.htcConfig.locData.UnzipContentTotalFiles,"0","0 bytes")}]}),listeners:{load:function(node){zipContentTree.existsCryptedNodes=false;
Ext.each(node.childNodes,function(el){if(typeof el.attributes.size!=="undefined"){el.text=el.attributes.text+" ("+config.getRenderers().sizeRenderer(el.attributes.size)+")"
}if(el.attributes.crypted===true){el.text+='&nbsp;<img alt="" src="'+HttpCommander.Lib.Utils.getIconPath(config,"lock")+'" class="filetypeimage" />';
zipContentTree.existsCryptedNodes=true
}if(config.htcConfig.relativePath!=""&&typeof el.attributes.icon!=="undefined"){el.attributes.icon=config.htcConfig.relativePath+el.attributes.icon
}})
}}})],buttons:[{itemId:"unzip-sel-button",text:config.htcConfig.locData.CommandUnzipSelected,disabled:true,handler:function(btn,evt){self.unzipContents(zipFileInfo.value)
}},{itemId:"unzip-all-button",disabled:true,text:config.htcConfig.locData.CommandUnzipAll,handler:function(btn,evt){self.unzipContents(zipFileInfo.value,true)
}},{text:config.htcConfig.locData.CommonButtonCaptionClose,handler:function(){self.hide()
}}],listeners:{afterrender:function(selfWin){if(zipContentTree){zipContentTree.on("checkchange",selfWin.checkChangeZipContentList,selfWin)
}},hide:function(win){zipFileInfo.setValue("");
zipContentTree.totalNodes=0;
zipContentTree.setRootNode(new Ext.tree.AsyncTreeNode({itemId:"root-zip-content",expanded:false,children:[]}));
win.setTitle("")
},beforeshow:function(win){var btn=self.buttons[1];
if(btn){btn.setDisabled(true);
if(config.htcConfig&&config.htcConfig.currentPerms&&config.htcConfig.currentPerms.unzip&&zipContentTree.totalNodes>0){btn.setDisabled(false)
}}},bodyresize:function(p,w,h){zipContentTree.setHeight(h);
zipContentTree.setWidth(w)
}},checkChangeZipContentList:function(node,checked){zipContentTree.un("checkchange",self.checkChangeZipContentList,self);
HttpCommander.Lib.Utils.recursiveCheckTreeChildNodes(node,checked);
HttpCommander.Lib.Utils.recursiveCheckTreeParentNodes(node,checked);
zipContentTree.on("checkchange",self.checkChangeZipContentList,self);
self.changeZipContentInfoFiles();
self.buttons[0].setDisabled(zipContentTree.getChecked().length==0)
},unzipContents:function(unzipInfo,unzipAll){unzipAll=unzipAll||false;
var curFolder=config.getCurrentFolder();
unzipInfo.extractPath=curFolder;
var ignorePaths=zipContentTree.getTopToolbar().getComponent("unzip-contnet-ignore-paths");
if(ignorePaths){unzipInfo.ignorePaths=ignorePaths.getValue()
}var crypted=zipContentTree.existsCryptedNodes;
var checkedNodes=zipContentTree.getChecked();
if(!unzipAll){unzipAll=checkedNodes.length==zipContentTree.totalNodes
}unzipInfo.all=unzipAll;
if(!unzipAll){var entryArray=[];
crypted=false;
Ext.each(checkedNodes,function(node){if(node.attributes.file===true){entryArray.push(node.attributes.path)
}if(!crypted&&node.attributes.crypted===true){crypted=true
}});
unzipInfo.entries=eval(Ext.util.JSON.encode(entryArray))
}unzipInfo.crypted=crypted;
unzipInfo.password=null;
config.initAndShowUnzipPromptWindow(unzipInfo)
},changeZipContentInfoFiles:function(){var lblInfo=zipContentTree.getBottomToolbar().getComponent("unzip-contnet-files-info");
if(lblInfo){var count=0,size=0;
var checkedNodes=zipContentTree.getChecked();
Ext.each(checkedNodes,function(node){if(node.attributes.file){count++;
size+=parseInt(node.attributes.size)
}});
lblInfo.setText(String.format(config.htcConfig.locData.UnzipContentTotalFiles,count,config.getRenderers().sizeRenderer(String(size))),true)
}},setZipFileInfo:function(info){zipFileInfo.setValue(info)
},setContentTree:function(totalNodes,nodes){zipContentTree.totalNodes=totalNodes;
zipContentTree.setRootNode(new Ext.tree.AsyncTreeNode({itemId:"root-zip-content",expanded:true,children:nodes}))
}});
return self
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.DownloadWindow=function(c){var g=[],a,e=document,d=[],f=function(h,i){setTimeout(function(){var k=Ext.id(),m=e.createElement("iframe");
Ext.fly(m).set({id:k,name:k,cls:"x-hidden",src:h});
e.body.appendChild(m);
d.push(k);
if(Ext.isIE){try{document.frames[k].name=k
}catch(l){}}},i)
};
g.push({title:c.htcConfig.locData.DownloadSimpleTab,layout:"fit",items:[a=new Ext.grid.GridPanel({store:new Ext.data.JsonStore({url:c.htcConfig.relativePath+"Handlers/Download.ashx?list=true",fields:["name","path","icon","url","mime"]}),tbar:[{text:c.htcConfig.locData.CommonDownloadAll,icon:HttpCommander.Lib.Utils.getIconPath(c,"download"),handler:function(){var i=300,h=a.getStore().getRange();
Ext.each(h,function(l,k){f(l.get("url"),k*i)
})
}},{itemId:"zip-download",text:c.htcConfig.locData.CommandZipDownload,icon:HttpCommander.Lib.Utils.getIconPath(c,"zipdownload"),handler:function(){c.getMenuActions().zipDownload()
}},"->",{xtype:"displayfield",value:c.htcConfig.locData.DownloadListDragFile,hidden:!HttpCommander.Lib.Utils.browserIs.chrome6up||HttpCommander.Lib.Utils.browserIs.edge}],multiSelect:false,enableHdMenu:false,autoExpandColumn:"path",width:486,height:242,columns:[{id:"name",sortable:true,header:c.htcConfig.locData.CommonFieldLabelName,width:120,dataIndex:"name",renderer:function(k,l,i){var h=Ext.util.Format.htmlEncode(i.get("mime")+":"+k+":"+c.appRootUrl+i.get("url")).replace(/'/g,"&#39;");
return"<img src='"+c.htcConfig.relativePath+i.data.icon+"' class='filetypeimage'><a draggable='true' ondragstart='arguments[0].dataTransfer.setData(\"DownloadURL\", \""+h+"\");' href='"+c.htcConfig.relativePath+i.data.url+"'>"+Ext.util.Format.htmlEncode(k)+"</a>"
}},{id:"path",sortable:true,header:c.htcConfig.locData.CommonFieldLabelPath,renderer:function(i,k,h){return Ext.util.Format.htmlEncode(i||"")
},dataIndex:"path"}],listeners:{afterrender:function(h){h.body.dom.setAttribute("dragenter",false)
}}})]});
if(c.htcConfig.javaDownload&&!HttpCommander.Lib.Utils.browserIs.edge&&!HttpCommander.Lib.Utils.browserIs.chrome42up){g.push({title:c.htcConfig.locData.DownloadJavaTab,itemId:"java-download",style:"margin: 4px",html:""});
c.getFileManager().JavaPowDownload_onAppletInit=c.onJavaPowDownloadInit
}var b=new c.Window({title:c.htcConfig.locData.DownloadTitle,layout:"fit",width:500,height:300,modal:true,plain:true,closeAction:"hide",collapsible:false,animCollapse:false,closable:true,items:new Ext.TabPanel({autoTabs:true,activeTab:0,deferredRender:true,border:false,items:g}),listeners:{beforeshow:function(n){a.store.load();
var i=c.htcConfig.currentPerms&&c.htcConfig.currentPerms.zipDownload;
n.modal=i;
var k=a.getTopToolbar();
var l;
if(k){l=k.getComponent("zip-download");
if(l){l.setVisible(i)
}}var m=n.items.items[0].getComponent("java-download");
if(m){if(!m.rendered){m.html='<div id="'+c.$("contentForJavaDownloader")+'">'+String.format(HttpCommander.Lib.Consts.downloadAppletText,Ext.util.Format.htmlEncode(c.appRootUrl),c.getUid(),c.htcConfig.twoLetterLangName)+"</div>"
}else{var h=document.getElementById(c.$("contentForJavaDownloader"));
if(h){h.innerHTML=String.format(HttpCommander.Lib.Consts.downloadAppletText,Ext.util.Format.htmlEncode(c.appRootUrl),c.getUid(),c.htcConfig.twoLetterLangName)
}}}},bodyresize:function(k,i,h){var l=document.getElementById(c.$("javaPowDownload"));
if(l){l.width=(i-10);
l.height=(h-32)
}},hide:function(o){var n=o.items.items[0].getComponent("java-download"),l=0,k=0,m;
if(n){HttpCommander.Lib.Utils.removeElementFromDOM(c.$("javaPowDownload"));
var h=document.getElementById(c.$("contentForJavaDownloader"));
if(h){h.innerHTML=""
}}if(Ext.isArray(d)){k=d.length;
if(k>0){l=k-1;
for(;
l>=0;
l--){m=e.getElementById(d[l]);
if(m){e.body.removeChild(m)
}d.pop()
}}}}}});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.FileModificationsWindow=function(b){var a=new b.Window({title:Ext.util.Format.htmlEncode(String.format(b.htcConfig.locData.FileModificationsWindowTitle,b.name)),autoDestroy:true,border:false,plain:true,boxMinHeight:250,boxMinWidth:b.getIsEmbeddedtoIFRAME()?300:450,layout:{type:"vbox",align:"stretch",padding:0},modal:true,resizable:true,closeAction:"close",maximizable:!b.getEmbedded(),width:b.getIsEmbeddedtoIFRAME()?350:500,height:250,items:[new Ext.grid.GridPanel({header:false,loadMask:false,store:new Ext.data.JsonStore({autoSave:false,remoteSort:false,pruneModifiedRecords:false,autoLoad:true,autoDestroy:true,data:b.store,isUSA:b.getIsUSA(),fields:[{name:"type",type:"string"},{name:"user",type:"string"},{name:"date",type:"date"},{name:"size",type:"string"},{name:"path",type:"string"}]}),columns:[{id:"type-modifications",sortable:true,header:b.htcConfig.locData.CommonFieldLabelType,dataIndex:"type",width:60,renderer:function(d){var c=(d||"").toString().toLowerCase();
switch(c){case"created":return b.htcConfig.locData.FileModificationsTypeCreated;
case"modified":return b.htcConfig.locData.FileModificationsTypeModified;
case"renamed":return b.htcConfig.locData.FileModificationsTypeRenamed;
case"restored":return b.htcConfig.locData.FileModificationsTypeRestored;
case"deleted":return b.htcConfig.locData.FileModificationsTypeDeleted;
default:return""
}}},{id:"user-modifications",sortable:true,header:b.htcConfig.locData.CommonFieldLabelUser,dataIndex:"user",renderer:function(d){var c=HttpCommander.Lib.Utils.parseUserName(d);
return b.getRenderers().htmlEncodedRenderer(c)
},width:70},{id:"date-modifications",sortable:true,header:b.htcConfig.locData.CommonFieldLabelDate,dataIndex:"date",width:125,renderer:b.getRenderers().dateRendererLocal},{id:"size-modifications",sortable:true,header:b.htcConfig.locData.CommonFieldLabelSize,dataIndex:"size",width:80,renderer:b.getRenderers().sizeRenderer},{id:"path-modifications",sortable:true,header:b.htcConfig.locData.CommonFieldLabelPath,dataIndex:"path",width:80,renderer:b.getRenderers().wordWrapRenderer}],autoExpandColumn:"path-modifications",flex:1,stripeRows:true})],buttons:[{text:b.htcConfig.locData.CommonButtonCaptionClose,handler:function(){a.close()
}}]});
return a
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.MetadataWindow=function(config){var helper=HttpCommander.Lib.MetadataWindowParts({htcConfig:config.htcConfig,getRenderers:config.getRenderers});
var configPrivate={availabelMDTitlesWoComments:[],availableMDTitles:[],existsMultiValueMDTitle:false,isCustomMultiValue:false,commentsAllowed:false,commentsIsMultiValue:false};
Ext.each(config.htcConfig.fileListColumns,function(col){if(col.state&8){var mdc={id:col.name,name:col.header};
if(col.state&32){configPrivate.existsMultiValueMDTitle=mdc.name.toLowerCase()!="comment";
mdc.multi=true;
if(col.state&16){configPrivate.isCustomMultiValue=true
}}else{mdc.multi=false
}configPrivate.availableMDTitles.push(mdc);
if(mdc.name.toLowerCase()!="comment"){configPrivate.availabelMDTitlesWoComments.push(Ext.apply({},mdc))
}}});
if(!configPrivate.isCustomMultiValue){configPrivate.isCustomMultiValue=config.htcConfig.isCustomMultiValue
}if(Ext.isNumber(config.htcConfig.isAllowedComments)){configPrivate.commentsAllowed=(config.htcConfig.isAllowedComments>0);
configPrivate.commentsIsMultiValue=(config.htcConfig.isAllowedComments>1)
}var fileNameMetaData,metadataPanel;
var self=new config.Window({title:"",autoDestroy:true,minWidth:config.getIsEmbeddedtoIFRAME()?350:550,minHeight:config.getIsEmbeddedtoIFRAME()?250:360,boxMinHeight:250,boxMinWidth:config.getIsEmbeddedtoIFRAME()?350:500,layout:{type:"vbox",align:"stretch",padding:"-1px"},plain:true,resizable:true,closeAction:"hide",maximizable:!config.getEmbedded(),modificationHistory:{},width:config.getIsEmbeddedtoIFRAME()?450:650,height:config.getIsEmbeddedtoIFRAME()?250:400,items:[fileNameMetaData=new Ext.form.Hidden({hidden:true}),{itemId:"file-details-info",xtype:"panel",autoHeight:true,baseCls:"x-plain",tpl:new Ext.Template('<table style="width:100%;"><tr><td style="width:50%;"><table><tr><td>'+config.htcConfig.locData.CommonFieldLabelType+":</td><td>{type:htmlEncode}</td></tr><tr><td>"+config.htcConfig.locData.CommonFieldLabelSize+":</td><td>{size}</td></tr>{contains}<tr><td>"+config.htcConfig.locData.FileAttributesField+':</td><td>{attributes}</td></tr>{downloadings}</table></td><td style="width:50%;"><table><tr><td>'+config.htcConfig.locData.CommonFieldLabelDateCreated+":</td><td>{created:htmlEncode}</td></tr><tr><td>"+config.htcConfig.locData.CommonFieldLabelDateModified+":</td><td>{modified:htmlEncode}</td></tr><tr><td>"+config.htcConfig.locData.CommonFieldLabelDateAccessed+":</td><td>{accessed:htmlEncode}</td></tr>{modifications}</table></td></tr></table>")},metadataPanel=new Ext.grid.EditorGridPanel({clicksToEdit:1,forceValidation:true,header:false,enableColumnMove:false,loadMask:false,selModel:new Ext.grid.RowSelectionModel({singleSelect:true,moveEditorOnEnter:true,listeners:{selectionchange:function(sm){var deleteButton=metadataPanel.getTopToolbar().getComponent("delete-md-button");
if(deleteButton){deleteButton.setDisabled(true);
if(sm.getCount()>0&&config.htcConfig.currentPerms.modify&&(configPrivate.availableMDTitles.length>0||config.htcConfig.isEditingMetadataTitles)){deleteButton.setDisabled(false);
var r=sm.getSelected();
var ttl=r.get("title").toLowerCase().trim();
var user=r.get("userlastmodified").toLowerCase().trim();
var isMulti=false;
var isCustom=true;
for(var j=0,t;
typeof(t=configPrivate.availableMDTitles[j])!="undefined";
j++){if(t.name.toLowerCase().trim()==ttl){isCustom=false;
if(t.multi){isMulti=true
}break
}}if(isCustom&&configPrivate.isCustomMultiValue){isMulti=true
}if(!config.htcConfig.isFullAdmin&&isMulti&&user!=config.htcConfig.friendlyUserName.toLowerCase().trim()){deleteButton.setDisabled(true)
}}}}}}),store:new Ext.data.JsonStore({autoSave:false,storeId:"mdStore",remoteSort:false,totalProperty:"total",pruneModifiedRecords:false,autoLoad:true,autoDestroy:true,data:[],writer:new Ext.data.JsonWriter({encode:true,writeAllFields:true}),fields:config.htcConfig.metaDataFields,listeners:{add:function(store,records,index){self.changeAvailableFields(store);
self.isChanged=true
},remove:function(store,record,index){self.changeAvailableFields(store);
self.isChanged=true
}}}),tbar:new Ext.Toolbar({items:[{itemId:"add-md-button",icon:HttpCommander.Lib.Utils.getIconPath(config,"add"),text:config.htcConfig.locData.CommonButtonCaptionAddDetail,handler:function(b,ev){var mdStore=metadataPanel.getStore();
var rows=mdStore.getRange();
var countRows=rows.length;
var titlesList=self.generateCBArrayStoreTitles(rows);
if(titlesList.length==0&&!config.htcConfig.isEditingMetadataTitles){self.changeAvailableFields(mdStore);
b.setDisabled(true);
return
}var newTitle="",metaDataRecord,mdr;
if(configPrivate.existsMultiValueMDTitle){var tli=0;
do{newTitle=titlesList[tli][0];
tli++
}while(tli<titlesList.length&&newTitle.toLowerCase()=="comment");
metaDataRecord=mdStore.recordType;
mdr=new metaDataRecord({title:newTitle,value:config.htcConfig.locData.NewDetailsValue,userlastmodified:config.htcConfig.friendlyUserName,datemodified:null});
metadataPanel.stopEditing();
mdStore.insert(0,mdr);
metadataPanel.startEditing(0,0);
return
}newTitle="";
var flag=true;
for(var i=0;
i<titlesList.length;
i++){newTitle=titlesList[i][0];
flag=true;
if(newTitle.toLowerCase()=="comment"){newTitle="";
continue
}for(var j=0;
j<countRows;
j++){if(rows[j].get("title").toLowerCase().trim()==newTitle.toLowerCase().trim()){flag=false;
break
}}if(flag){break
}}if((!flag||newTitle=="")&&config.htcConfig.isEditingMetadataTitles){var numTitle=1;
flag=true;
while(flag){flag=false;
newTitle=config.htcConfig.locData.NewDetailsTitle+numTitle;
for(var k=0;
k<mdStore.getCount();
k++){if(rows[k].get("title").toLowerCase().trim()==newTitle.toLowerCase().trim()){numTitle++;
flag=true;
break
}}}flag=true
}metadataPanel.stopEditing();
if(flag&&newTitle.length>0){metaDataRecord=mdStore.recordType;
mdr=new metaDataRecord({title:newTitle,value:config.htcConfig.locData.NewDetailsValue,userlastmodified:config.htcConfig.friendlyUserName,datemodified:null});
mdStore.insert(0,mdr);
metadataPanel.startEditing(0,0)
}else{if(!config.htcConfig.isEditingMetadataTitles){self.changeAvailableFields(mdStore);
b.setDisabled(true)
}}}},"-",{itemId:"delete-md-button",icon:HttpCommander.Lib.Utils.getIconPath(config,"remove"),text:config.htcConfig.locData.CommandDelete,disabled:true,handler:function(){metadataPanel.stopEditing();
var store=metadataPanel.getStore();
var s=metadataPanel.getSelectionModel().getSelections();
var cu=config.htcConfig.friendlyUserName.toLowerCase().trim();
for(var i=0,r;
typeof(r=s[i])!="undefined";
i++){var isCustom=true;
var ttl=r.get("title").toLowerCase().trim();
var user=r.get("userlastmodified").toLowerCase().trim();
for(var j=0,t;
typeof(t=configPrivate.availableMDTitles[j])!="undefined";
j++){if(ttl==t.name.toLowerCase().trim()){isCustom=false;
if(config.htcConfig.isFullAdmin||!t.multi||user==cu){store.remove(r)
}break
}}if(isCustom&&(config.htcConfig.isFullAdmin||!configPrivate.isCustomMultiValue||user==cu)){store.remove(r)
}}self.changeAvailableFields(store)
}}]}),multiSelect:false,colModel:helper.colModelMetaDataGrid,autoExpandColumn:"value-md",flex:1,stripeRows:true,listeners:{render:function(grd){if(grd){self.changeAvailableFields(grd.getStore())
}},cellclick:function(grid,row,col,e){var rec=grid.getStore().getAt(row);
var cm=grid.getColumnModel();
var fieldName=cm.getDataIndex(col);
var cl=cm.getColumnAt(col);
if(cl.editable&&(cl.xtype==="checkcolumn"||cl.xtype==="booleancolumn")){if(typeof(rec.get(fieldName))!="undefined"){rec.set(fieldName,!rec.get(fieldName))
}else{eval("rec.data."+fieldName+" = true;");
rec.commit()
}self.isChanged=true
}},beforeedit:function(e){var ttl=e.record.get("title").toLowerCase().trim();
var cu=config.htcConfig.friendlyUserName.toLowerCase().trim();
var user=e.record.get("userlastmodified").toLowerCase().trim();
var isCustom=true;
for(var j=0,t;
typeof(t=configPrivate.availableMDTitles[j])!="undefined";
j++){if(ttl==t.name.toLowerCase().trim()){isCustom=false;
if(!config.htcConfig.isFullAdmin&&t.multi&&user!=cu){e.cancel=true;
e.grid.stopEditing(true);
return false
}break
}}if(isCustom&&configPrivate.isCustomMultiValue&&user!=cu){e.cancel=true;
e.grid.stopEditing(true);
return false
}if(e.field=="title"){var titles=self.generateCBArrayStoreTitles(e.grid.getStore().getRange());
helper.cbAvailableTitlesEditor.getStore().loadData(titles);
helper.cbAvailableTitlesEditor.getStore().commitChanges();
if(titles.length==0&&!config.htcConfig.isEditingMetadataTitles){e.cancel=true;
e.grid.stopEditing(true);
return false
}}},afteredit:function(e){if(e.field=="title"){var val=e.value.toLowerCase().trim();
var isMulti=false;
var isCustom=true;
var storeMD=e.grid.getStore();
var rows=storeMD.getRange();
var i,t;
for(i=0;
typeof(t=configPrivate.availableMDTitles[i])!="undefined";
i++){if(val==t.name.toLowerCase().trim()){isCustom=false;
if(t.multi){isMulti=true
}break
}}if(isCustom&&configPrivate.isCustomMultiValue){isMulti=true
}if(!isMulti){for(i=0;
i<storeMD.getCount();
i++){if(i!=e.row&&rows[i].get("title").toLowerCase().trim()==val){e.record.set("title",e.originalValue);
e.grid.stopEditing(true);
return
}}}e.record.set("userlastmodified",config.htcConfig.friendlyUserName);
e.record.set("datemodified",null);
self.isChanged=true
}else{if(e.value.toString().toLowerCase().trim()!=e.originalValue.toString().toLowerCase().trim()){e.record.set("userlastmodified",config.htcConfig.friendlyUserName);
e.record.set("datemodified",null);
self.isChanged=true
}}self.changeAvailableFields(storeMD)
}}})],buttonAlign:"left",buttons:[{xtype:"textarea",minWidth:config.getIsEmbeddedtoIFRAME()?100:250,visible:configPrivate.commentsAllowed,width:config.getIsEmbeddedtoIFRAME()?100:250,height:60,style:{whiteSpace:"normal"},enableKeyEvents:true,emptyText:String.format(config.htcConfig.locData.CommentsWriteCommentHint,config.htcConfig.locData.CommonButtonCaptionAddComment),listeners:{change:function(fld,newVal,oldVal){self.buttons[1].setDisabled(Ext.isEmpty(newVal))
},keypress:function(fld,evt){self.buttons[1].setDisabled(Ext.isEmpty(self.buttons[0].getValue()))
},specialkey:function(fld,e){if(e.getKey()==e.ENTER){var btn=self.buttons[1];
btn.handler.call(btn,btn,e)
}}}},{text:config.htcConfig.locData.CommonButtonCaptionAddComment,disabled:true,visible:configPrivate.commentsAllowed,handler:function(btn,evt){var cmt=self.buttons[0].getValue();
if(Ext.isEmpty(cmt)){btn.setDisabled(true);
return
}var mdStore=metadataPanel.getStore();
var rows=mdStore.getRange();
var countRows=rows.length;
var titlesList=self.generateCBArrayStoreTitles(rows);
if(titlesList.length==0&&!config.htcConfig.isEditingMetadataTitles){self.changeAvailableFields(mdStore);
btn.setDisabled(true);
return
}var metaDataRecord,mdr;
metadataPanel.stopEditing();
metaDataRecord=mdStore.recordType;
mdr=new metaDataRecord({title:"Comment",value:cmt,userlastmodified:config.htcConfig.friendlyUserName,datemodified:null});
mdStore.insert(0,mdr);
self.changeAvailableFields(mdStore);
self.saveMetadata(fileNameMetaData.value)
}},"->",{text:config.htcConfig.locData.FileDetailsSave,handler:function(btn,evt){self.saveMetadata(fileNameMetaData.value)
}},{text:config.htcConfig.locData.CommonButtonCaptionClose,handler:function(){self.hide()
}},{text:config.htcConfig.locData.CommandDetailsPane,hidden:!config.htcConfig.enableDetailsPane||!config.getDetailsPane()||!config.getDetailsPane().collapsed,handler:function(btn){var dp=config.getDetailsPane();
if(!dp||!config.htcConfig.enableDetailsPane){btn.hide();
return
}if(dp.collapsed){dp.expand()
}btn.hide()
}}],listeners:{afterrender:function(selfWin){selfWin.bindLinkHandlers()
},beforehide:function(win){if(win.ignoreChanges){win.ignoreChanges=false;
return true
}if(win.isChanged){config.Msg.show({title:config.htcConfig.locData.FileDetailsCloseConfirmTitle,msg:config.htcConfig.locData.FileDetailsCloseConfirmMsg,icon:config.Msg.QUESTION,buttons:{yes:config.htcConfig.locData.FileDetailsSave,no:config.htcConfig.locData.FileDetailsIgnoreChanges,cancel:config.htcConfig.locData.CommonButtonCaptionCancel},fn:function(btn){if(btn=="yes"){if(win.ignoreChanges){win.ignoreChange=false
}self.saveMetadata(fileNameMetaData.value,win);
return true
}else{if(btn=="no"){win.ignoreChanges=true;
win.hide();
return true
}else{if(win.ignoreChanges){win.ignoreChange=false
}return false
}}}});
return false
}return true
},hide:function(win){var self=win;
self.modificationHistory={};
fileNameMetaData.setValue("");
metadataPanel.stopEditing();
metadataPanel.getStore().loadData([]);
metadataPanel.getStore().commitChanges();
self.buttons[0].setValue("");
self.buttons[1].setDisabled(true);
self.isChanged=false
}},onDetailsPaneToggled:function(visible){if(!!self&&self.isVisible()){self.buttons[5].setVisible(visible)
}},onSelectingChanged:function(sel,curFolder){if(typeof sel=="undefined"){return
}if(!!self&&self.isVisible()){var needHide=true;
var curResInfo=!!fileNameMetaData?fileNameMetaData.value:null;
if(Ext.isObject(curResInfo)&&Ext.isObject(sel)&&Ext.isObject(sel.data)&&curResInfo.path==curFolder&&curResInfo.name==sel.data.name){needHide=false
}if(needHide){self.hide()
}}},saveMetadata:function(fileInfo,mdWin){var mdStore=metadataPanel.getStore();
var mdInfo={path:fileInfo.path,name:fileInfo.name,metadata:self.getJSONMetadataArray(mdStore)};
config.globalLoadMask.msg=config.htcConfig.locData.DetailsSavingMsg+"...";
config.globalLoadMask.show();
HttpCommander.Metadata.Save(mdInfo,function(mdata,strans){config.globalLoadMask.hide();
config.globalLoadMask.msg=config.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(mdata,strans,config.Msg,config.htcConfig,2)){mdStore.loadData(mdata.metadata);
mdStore.commitChanges();
self.isChanged=false;
self.changeAvailableFields(mdStore);
self.buttons[0].setValue("");
self.buttons[1].setDisabled(true);
self.prepareFileProperties(mdata);
if(config.getShowMetaDataInList()){var folder=mdInfo.path;
if(!Ext.isEmpty(folder)){if(!Ext.isEmpty(mdInfo.name)){config.setSelectPath({name:mdInfo.name,path:folder})
}config.openGridFolder(folder)
}}if(mdWin){mdWin.hide()
}}})
},getJSONMetadataArray:function(mdStore){var mdArray=new Array();
if(mdStore.data.items!=undefined&&mdStore.data.items!=null){Ext.each(mdStore.data.items,function(item){mdArray.push(item.data)
})
}Ext.each(config.htcConfig.metaDataFields,function(f){if(f.type=="date"){Ext.each(mdArray,function(mdi){eval("if (mdi."+f.name+") try { mdi."+f.name+" = mdi."+f.name+".toUTCString(); } catch (e) { }")
})
}});
return mdArray
},generateCBArrayStoreTitles:function(rows){var result=[];
var titlesRecord=helper.cbAvailableTitlesStore.recordType;
var i,j,t,r,arr;
for(j=0;
typeof(t=configPrivate.availableMDTitles[j])!="undefined";
j++){if(t.multi){arr=[];
arr.push(t.name);
result.push(arr)
}}for(j=0;
typeof(t=configPrivate.availableMDTitles[j])!="undefined";
j++){if(!t.multi){var tnExists=true;
for(i=0;
typeof(r=rows[i])!="undefined";
i++){if(r.get("title").toLowerCase().trim()==t.name.toLowerCase().trim()){tnExists=false;
break
}}if(tnExists){arr=[];
arr.push(t.name);
result.push(arr)
}}}return eval(Ext.util.JSON.encode(result))
},readOnlyStateChange:function(){var checkBox=document.getElementById(config.$("linkReadOnlyAttribute"));
if(config.htcConfig.allowSetReadOnly&&fileNameMetaData){if(checkBox&&typeof checkBox.checked=="boolean"){var setReadOnlyInfo={readonly:checkBox.checked,path:fileNameMetaData.value.path,name:fileNameMetaData.value.name};
config.globalLoadMask.msg=config.htcConfig.locData.ChangingReadOnlyProgressMessage+"...";
config.globalLoadMask.show();
HttpCommander.Common.ChangeReadOnly(setReadOnlyInfo,function(data,trans){config.globalLoadMask.hide();
config.globalLoadMask.msg=config.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(data,trans,config.Msg,config.htcConfig)){checkBox.checked=setReadOnlyInfo.readonly
}else{checkBox.checked=!setReadOnlyInfo.readonly
}})
}}},showFileModifications:function(){if(self.modificationHistory){var path=self.modificationHistory.path||"";
var name=self.modificationHistory.name||"";
var store=self.modificationHistory.changes||[];
if(path!=""&&name!=""&&store.length>0){var winModifs=HttpCommander.Lib.FileModificationsWindow({htcConfig:config.htcConfig,Msg:config.Msg,Window:config.Window,name:name,store:store,getIsEmbeddedtoIFRAME:config.getIsEmbeddedtoIFRAME,getEmbedded:config.getEmbedded,getIsUSA:function(){return metadataPanel.getStore().isUSA
},getRenderers:config.getRenderers});
winModifs.show()
}}},calculateDirSize:function(){var folderInfo=self.modificationHistory;
if(!folderInfo||!folderInfo.path||!folderInfo.name){return
}if(folderInfo.path==""||folderInfo.name==""){return
}var holder=document.getElementById(config.$("linkCalculateDirSize"));
var hodler1=document.getElementById(config.$("linkCalculateDirCounts"));
if(!holder||!hodler1){return
}if(holder.getElementsByTagName("a").length<1||hodler1.getElementsByTagName("a").length<1){return
}var oldContent=holder.innerHTML,oldContent1=hodler1.innerHTML;
holder.innerHTML='<img align="absmiddle" alt="'+config.htcConfig.locData.Calculating+'..." src="'+HttpCommander.Lib.Utils.getIconPath(config,"loadingsmall.gif")+'" />';
hodler1.innerHTML='<img align="absmiddle" alt="'+config.htcConfig.locData.Calculating+'..." src="'+HttpCommander.Lib.Utils.getIconPath(config,"loadingsmall.gif")+'" />';
self.syncSizeWrap();
HttpCommander.Common.CalculateSizeDir(folderInfo,function(data,trans){holder.innerHTML=oldContent;
hodler1.innerHTML=oldContent1;
self.syncSizeWrap();
if(typeof data=="undefined"){config.Msg.alert(config.htcConfig.locData.CommonErrorCaption,Ext.util.Format.htmlEncode(trans.message));
return
}if(!data.success){config.Msg.alert(config.htcConfig.locData.CommonErrorCaption,data.message)
}var sizeInBytes=data.size;
var recalcHtml=" <a href='#' >"+config.htcConfig.locData.FolderRecalculateSize+"...</a>";
var html=config.getRenderers().sizeRenderer(data.size);
if(html.toLowerCase().indexOf("byte")==-1){html+=" ("+sizeInBytes+"&nbsp;bytes)"
}html+=recalcHtml;
holder.innerHTML=html;
hodler1.innerHTML=String.format(config.htcConfig.locData.FolderContainsFilesFolders,data.files,data.folders)+recalcHtml;
self.bindLinkHandlers();
self.syncSizeWrap()
})
},syncSizeWrap:function(){if(self.rendered&&!self.hidden&&self.syncSize){self.syncSize()
}},prepareFileProperties:function(mdata){var empty="<tr><td>&nbsp;</td><td>&nbsp;</td></tr>";
var store=metadataPanel.getStore();
mdata=mdata||{};
var props=mdata.props||{};
props.path=props.path||"";
props.name=props.name||"";
self.modificationHistory={path:props.path,name:props.name,changes:[]};
if(typeof mdata.modifications!="undefined"){self.modificationHistory.changes=mdata.modifications
}if(props.isDir){props.size="<span id='"+config.$("linkCalculateDirSize")+"'><a href='#'>"+config.htcConfig.locData.FolderCalculateSize+"...</a></span>";
props.contains="<tr><td>"+config.htcConfig.locData.FolderContainsField+":</td><td><span id='"+config.$("linkCalculateDirCounts")+"'><a href='#'>"+config.htcConfig.locData.FolderCalculateSize+"...</a></span></td></tr>";
props.modifications=empty
}else{if(props.size&&String(props.size)!=""){var sizeInBytes=props.size;
props.size=config.getRenderers().sizeRenderer(props.size);
if(props.size.toLowerCase().indexOf("byte")==-1){props.size+=" ("+sizeInBytes+"&nbsp;bytes)"
}}if(config.htcConfig.allowSetReadOnly){var attr=[];
if(props.attributes){attr=props.attributes.split(/\s*,\s*/)
}var detectReadOnly=false;
var attrHtml="";
for(var i=0;
i<attr.length;
i++){if(attr[i]=="ReadOnly"){detectReadOnly=true
}else{attrHtml+=attr[i]+", "
}}props.attributes=Ext.util.Format.htmlEncode(attrHtml)+'<input style="vertical-align:middle;" type="checkbox" '+(detectReadOnly?'checked="checked" ':"")+" id='"+config.$("linkReadOnlyAttribute")+"' /> ReadOnly"
}var isEnableDownloadings=false,isEnabledModifications=false;
if(typeof props.downloadings!="undefined"&&props.downloadings>=0){props.downloadings="<tr><td>"+config.htcConfig.locData.AmountOfDownloadingsFile+":</td><td>"+Ext.util.Format.htmlEncode(props.downloadings)+"</td></tr>";
isEnableDownloadings=true
}if(typeof mdata.author!="undefined"&&typeof mdata.modifications!="undefined"){props.modifications="<tr><td>"+config.htcConfig.locData.FileModificationsAuthor+":</td><td>"+Ext.util.Format.htmlEncode(HttpCommander.Lib.Utils.parseUserName(mdata.author)||"")+'&nbsp;<a href="#" id=\''+config.$("linkFileModificationHistory")+"' >"+config.htcConfig.locData.FileModificationsHistory+"</a></td></tr>";
isEnabledModifications=true
}if(isEnableDownloadings&&!isEnabledModifications){props.modifications=empty
}else{if(!isEnableDownloadings&&isEnabledModifications){props.downloadings=empty
}}}if(props.created){props.created=config.getRenderers().dateRendererLocal(props.created,null,null,null,null,store)
}if(props.modified){props.modified=config.getRenderers().dateRendererLocal(props.modified,null,null,null,null,store)
}if(props.accessed){props.accessed=config.getRenderers().dateRendererLocal(props.accessed,null,null,null,null,store)
}var propInfo=self.getComponent("file-details-info");
if(propInfo){if(self.rendered){propInfo.update(props);
self.bindLinkHandlers()
}else{propInfo.data=props
}}},bindLinkHandlers:function(){var slf=self||this;
if(!slf.rendered){return
}var holder=document.getElementById(config.$("linkCalculateDirSize"));
if(holder){holder.children[0].onclick=function(){slf.calculateDirSize();
return false
}
}holder=document.getElementById(config.$("linkCalculateDirCounts"));
if(holder){holder.children[0].onclick=function(){slf.calculateDirSize();
return false
}
}holder=document.getElementById(config.$("linkReadOnlyAttribute"));
if(holder){holder.onclick=function(){slf.readOnlyStateChange();
return false
}
}holder=document.getElementById(config.$("linkFileModificationHistory"));
if(holder){holder.onclick=function(){slf.showFileModifications();
return false
}
}},initialize:function(resInfo,mdata){var notNtfs=(mdata.notntfs===true);
self.setTitle(String.format(config.htcConfig.locData.DetailsWindowTitle,Ext.util.Format.htmlEncode(resInfo.name)));
fileNameMetaData.setValue(resInfo);
var mdStore=metadataPanel.getStore();
mdStore.isUSA=mdata.isUSA;
mdStore.loadData(mdata.metadata);
mdStore.sort("datemodified","DESC");
mdStore.commitChanges();
self.isChanged=false;
var modify=!notNtfs&&config.isModifyAllowed()&&(configPrivate.availableMDTitles.length>0||config.htcConfig.isEditingMetadataTitles);
Ext.each(helper.colModelMetaDataGrid.config,function(col){col.editable=modify
});
self.changeAvailableFields(mdStore,modify);
var enableAddComment=modify&&configPrivate.commentsAllowed&&!self.allCommentsUsed(mdStore.getRange());
metadataPanel.toolbars[0].setVisible(modify);
self.buttons[0].setValue("");
self.buttons[0].setVisible(modify&&configPrivate.commentsAllowed);
self.buttons[1].setVisible(modify&&configPrivate.commentsAllowed);
self.buttons[0].setDisabled(!enableAddComment);
self.buttons[1].setDisabled(true);
self.buttons[3].setVisible(modify);
self.buttons[5].setVisible(false);
var dp=config.getDetailsPane();
if(!!dp&&config.htcConfig.enableDetailsPane&&dp.collapsed){self.buttons[5].setVisible(true)
}self.prepareFileProperties(mdata)
},allCommentsUsed:function(rows){if(!configPrivate.commentsAllowed||!Ext.isArray(rows)){return true
}var k=0;
for(var j=0,t;
typeof(t=rows[j])!="undefined";
j++){var u=t.data.title.toLowerCase().trim();
if("comment"==u){k++;
if(k>1){break
}}}return configPrivate.commentsIsMultiValue?false:(k>0)
},changeAvailableFields:function(store){if(store){var addButton=metadataPanel.getTopToolbar().getComponent("add-md-button");
var range=store.getRange();
if(!config.htcConfig.isEditingMetadataTitles&&!configPrivate.existsMultiValueMDTitle){if(addButton){addButton.setDisabled(self.allAccessibleTitlesAlreadyUsed(range))
}}else{if(addButton&&config.isModifyAllowed()&&(configPrivate.availableMDTitles.length>0||config.htcConfig.isEditingMetadataTitles)){addButton.setDisabled(false)
}}var cArea=self.buttons[0];
var cBtn=self.buttons[1];
var allCUsed=self.allCommentsUsed(range);
if(cArea){cArea.setDisabled(allCUsed)
}if(cBtn){cBtn.setDisabled(allCUsed||Ext.isEmpty(cArea.getValue()))
}}},allAccessibleTitlesAlreadyUsed:function(rows){if(!Ext.isArray(rows)){return true
}var k=0,p=0;
for(var i=0,a;
typeof(a=configPrivate.availableMDTitles[i])!="undefined";
i++){if(a.name.toLowerCase()=="comment"){continue
}p++;
for(var j=0,t;
typeof(t=rows[j])!="undefined";
j++){var b=a.name.toLowerCase().trim();
var u=t.data.title.toLowerCase().trim();
if(b==u){k++;
break
}}}return k>=p
}});
return self
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.MetadataWindowParts=function(b){var d=new Ext.data.ArrayStore({id:0,autoDestroy:true,fields:["avlTitle"],data:[]});
var a=new Ext.form.ComboBox({autoSelect:true,allowBlank:false,editable:b.htcConfig.isEditingMetadataTitles,forceSelection:false,mode:"local",store:d,valueField:"avlTitle",displayField:"avlTitle",typeAhead:true,tpl:new Ext.XTemplate('<tpl for=".">','<tpl if="this.isComment(avlTitle)">','<div class="x-combo-list-item" style="text-align:center;">','<span class="comment-cb-icon icon-comment">&nbsp;</span>',"</tpl>",'<tpl if="this.isComment(avlTitle) == false">','<div class="x-combo-list-item">',"{avlTitle:htmlEncode}","</tpl>","</div>","</tpl>",{isComment:function(e){return !Ext.isEmpty(e)&&e.toLowerCase()==="comment"
}}),triggerAction:"all",lazyRender:false,lazyInit:false,listClass:"x-combo-list-small"});
var c=new Ext.grid.ColumnModel([{id:"title-md",sortable:true,header:b.htcConfig.locData.FileDetailsGridTitleColumn,dataIndex:"title",width:85,renderer:function(i,f,e,k,h,g){if(!Ext.isEmpty(i)&&i.toLowerCase()==="comment"){if(f){f.css="comment-cb-centered"
}return'<span class="comment-cb-icon icon-comment">&nbsp;</span>'
}else{return Ext.util.Format.htmlEncode(i||"")
}},editor:a},{id:"value-md",sortable:true,header:b.htcConfig.locData.CommonFieldLabelValue,dataIndex:"value",renderer:function(g,e,f){return String.format("<span style='white-space:normal !important;line-height:1em;'>{0}</span>",Ext.util.Format.htmlEncode(g||"").replace(/\r\n|\n\r/gi,"<br />").replace(/\n|\r|\u21B5/gi,"<br />"))
},editor:new Ext.form.TextArea({allowBlank:false,selectOnFocus:true})},{id:"userlastmodified-md",sortable:true,header:b.htcConfig.locData.FileDetailsGridAuthorColumn,dataIndex:"userlastmodified",renderer:function(f){var e=HttpCommander.Lib.Utils.parseUserName(f);
return b.getRenderers().htmlEncodedRenderer(e)
},editable:false},{id:"datemodified-md",sortable:true,header:b.htcConfig.locData.CommonFieldLabelDateModified,dataIndex:"datemodified",width:110,renderer:b.getRenderers().dateRendererLocal,editable:false}]);
Ext.each(b.htcConfig.metaDataFields,function(h){var e=true;
for(var f=0;
f<c.config.length;
f++){if(c.config[f].dataIndex==h.name.replace(/\s/gi,"_")){e=false;
break
}}if(e){var g=new Ext.grid.Column({id:h.name.replace(/\s/gi,"_")+"-md",sortable:true,header:Ext.util.Format.htmlEncode(h.name.substring(0,1).toUpperCase()+h.name.substring(1)),dataIndex:h.name,resizable:true,editable:true,width:h.type=="boolean"?55:110,align:HttpCommander.Lib.Utils.getAlignColumn(h.type),xtype:HttpCommander.Lib.Utils.getXTypeColumn(h.type)});
switch(h.type){case"int":case"float":g.setEditor(new Ext.form.NumberField());
break;
case"boolean":g.renderer=b.getRenderers().booleanRenderer;
break;
case"date":g.setEditor(new Ext.form.DateField({format:"Y-m-d H:i:s",minValue:"01/01/1970"}));
g.renderer=b.getRenderers().dateRendererLocal;
break;
default:g.setEditor(new Ext.form.TextArea({selectOnFocus:true}));
g.renderer=b.getRenderers().wordWrapRenderer;
break
}c.config.push(g)
}});
return{colModelMetaDataGrid:c,cbAvailableTitlesEditor:a,cbAvailableTitlesStore:d}
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.EditTextFileWindow=function(b){var c=null;
var a=new b.Window({title:"",layout:"fit",resizable:true,closeAction:"hide",minimizable:false,maximizable:true,border:false,plain:true,width:b.getIsEmbeddedtoIFRAME()?450:600,height:b.getIsEmbeddedtoIFRAME()?250:300,fileInfo:{path:"",name:"",encoding:""},defaults:{anchor:"100%"},items:[{xtype:"panel",border:false,width:"100%",height:"100%",flex:1,anchor:"100%"}],buttonAlign:"left",buttons:[{itemId:"word-wrap",xtype:"checkbox",boxLabel:b.htcConfig.locData.CommonWordWrap,checked:true,listeners:{check:function(d,e){if(c){c.setOption("wrap",e?"free":"off")
}}}},"->",{text:b.htcConfig.locData.CommandSave,handler:function(){a.saveTextFile()
}},{text:b.htcConfig.locData.CommonButtonCaptionCancel,handler:function(){a.hide();
if(c){c.getSession().setValue("")
}}}],listeners:{resize:function(e,g,d){if(c){var f=setTimeout(function(){clearTimeout(f);
if(c){c.resize(true)
}},200)
}}},saveTextFile:function(){if(!c){return
}var e=c.getSession().getValue();
if(e.indexOf("\r\n")<0){e=e.replace(/\n/g,"\r\n")
}var d={path:a.fileInfo.path,name:a.fileInfo.name,encoding:a.fileInfo.encoding,content:e};
b.globalLoadMask.msg=b.htcConfig.locData.ProgressSavingEdit+"...";
b.globalLoadMask.show();
HttpCommander.Common.Save(d,function(h,f){b.globalLoadMask.hide();
b.globalLoadMask.msg=b.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(h,f,b.Msg,b.htcConfig)){b.showBalloon(b.htcConfig.locData.BalloonSavedSuccessfully);
var g=d.path;
if(!Ext.isEmpty(g)&&!Ext.isEmpty(d.name)){b.setSelectPath({name:d.name,path:g})
}b.openTreeRecent();
b.openGridFolder(g)
}})
},loadTextFileImpl:function(d,e){HttpCommander.Common.Open(d,function(h,f){b.globalLoadMask.hide();
b.globalLoadMask.msg=b.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(h,f,b.Msg,b.htcConfig)){var g=h.content;
a.setTitle(Ext.util.Format.htmlEncode(d.name));
a.fileInfo.path=d.path;
a.fileInfo.name=d.name;
a.fileInfo.encoding=h.encoding;
if(typeof window.ace!="undefined"){a.buttons[2].setVisible(!(e===true));
a.show();
if(!c){c=ace.edit(a.items.items[0].body.id);
c.$blockScrolling=Infinity;
c.setShowInvisibles(true);
c.setOption("wrap","free");
c.setHighlightSelectedWord(true)
}modelist=ace.require("ace/ext/modelist");
mode=modelist.getModeForPath(a.fileInfo.name).mode;
c.getSession().setMode(mode);
c.getSession().setValue(g);
c.setReadOnly((e===true));
b.openTreeRecent();
setTimeout(function(){if(c){try{c.focus()
}catch(i){}}},100)
}}})
},loadTextFile:function(d,g,i){a.hide();
var e={path:"",name:""},f,h;
e.path=g;
e.name=d.data.name;
if(e.path==""||e.name==""){return
}b.globalLoadMask.msg=b.htcConfig.locData.ProgressLoadingEdit+"...";
b.globalLoadMask.show();
if(typeof window.ace=="undefined"){HttpCommander.Lib.Utils.includeJsFile({url:scriptSource.substring(0,scriptSource.lastIndexOf("/"))+"/ace/ace.js",callback:function(){if(typeof window.ace=="undefined"){b.globalLoadMask.hide();
b.globalLoadMask.msg=b.htcConfig.locData.ProgressLoading+"...";
b.Msg.alert(b.htcConfig.locData.CommonErrorCaption,b.htcConfig.locData.AceNotLoadedMessage);
return
}HttpCommander.Lib.Utils.includeJsFile({url:scriptSource.substring(0,scriptSource.lastIndexOf("/"))+"/ace/ext-modelist.js",callback:function(){a.loadTextFileImpl.call(a,e,i)
}})
}})
}else{a.loadTextFileImpl.call(a,e,i)
}}});
return a
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.UserHelpWindow=function(b){var a=new b.Window({title:b.htcConfig.locData.UserHelpTitle,closable:true,closeAction:"hide",minimizable:false,maximizable:true,width:b.getIsEmbeddedtoIFRAME()?350:600,height:b.getIsEmbeddedtoIFRAME()?250:350,plain:true,html:'<iframe style="background-color: #FFFFFF;" scrolling="yes" width="100%" height="100%" border="0" src="'+b.generateUrlHelp(null,true)+'"></iframe>',generateIFrameHelp:function(c){return'<iframe style="background-color: #FFFFFF;" scrolling="yes" width="100%" height="100%" border="0" src="'+b.generateUrlHelp(c)+'"></iframe>'
},initialize:function(d){a.hide();
var c=a.generateIFrameHelp(d);
a.html=c;
a.show();
a.update(c)
}});
return a
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.SyncWebFoldersHelpWindow=function(b){var a=new b.Window({title:b.htcConfig.locData.CommandSyncWebFolders,closable:true,closeAction:"hide",minimizable:false,maximizable:true,width:b.getIsEmbeddedtoIFRAME()?350:600,height:b.getIsEmbeddedtoIFRAME()?250:350,plain:true,html:"",initialize:function(c){var d='<iframe style="background-color: #FFFFFF;" scrolling="yes" width="100%" height="100%" border="0" src="'+c+'"></iframe>';
a.hide();
a.html=d;
a.show();
a.update(d)
}});
return a
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.TreeLoader=function(c){var a=function(){return Ext.isFunction(c.globalLoadMask)?c.globalLoadMask():c.globalLoadMask
};
var b=new Ext.tree.TreeLoader({directFn:HttpCommander.Tree.Load,baseParams:{path:c.getRootName(),fAllow:null,fIgnore:null,fARegexp:null,fIRegexp:null,onlyFolders:(c.onlyFolders===true)},paramOrder:["path","fAllow","fIgnore","fARegexp","fIRegexp","onlyFolders"],firstTreeLoad:true,preloadChildren:true,listeners:{beforeload:function(f,e){if(f.firstTreeLoad){f.prevAjaxTimeout=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
a().show()
}if(Ext.isEmpty(e.attributes.path)&&e.parentNode){if(!Ext.isEmpty(e.attributes.error)){c.Msg.show({title:c.htcConfig.locData.CommonErrorCaption,msg:e.attributes.error,icon:c.Msg.ERROR,buttons:c.Msg.CANCEL})
}return false
}this.baseParams.path=!Ext.isEmpty(e.attributes.path)?e.attributes.path:c.getRootName();
this.baseParams.fAllow=null;
this.baseParams.fIgnore=null;
this.baseParams.fARegexp=null;
this.baseParams.fIRegexp=null;
if(this.baseParams.path.toLowerCase()==c.getRootName().toLowerCase()){var d=HttpCommander.Lib.Utils.getFolderFilter();
if(d.folderFilterAllow){this.baseParams.fAllow=d.folderFilterAllow
}if(d.folderFilterIgnore){this.baseParams.fIgnore=d.folderFilterIgnore
}if(d.folderFilterAllowRegexp){this.baseParams.fARegexp=d.folderFilterAllowRegexp
}if(d.folderFilterIgnoreRegexp){this.baseParams.fIRegexp=d.folderFilterIgnoreRegexp
}}},load:function(f,e,d){if(f.firstTreeLoad){f.firstTreeLoad=false;
if(f.prevAjaxTimeout){Ext.Ajax.timeout=f.prevAjaxTimeout
}a().hide()
}if(!!d&&!!d.responseData&&d.responseData.length==1&&!!d.responseData[0].error){c.Msg.show({title:c.htcConfig.locData.CommonErrorCaption,msg:d.responseData[0].neem===true?String.format(d.responseData[0].error,c.htcConfig.relativePath||""):HttpCommander.Lib.Utils.checkBracketsAndHtmlEncode(d.responseData[0].error),icon:c.Msg.ERROR,buttons:c.Msg.CANCEL});
while(e.firstChild&&(Ext.isEmpty(e.firstChild.attributes)||Ext.isEmpty(e.firstChild.attributes.path))){e.removeChild(e.firstChild)
}}},loadexception:function(f,e,d){if(f.firstTreeLoad){f.firstTreeLoad=false;
if(f.prevAjaxTimeout){Ext.Ajax.timeout=f.prevAjaxTimeout
}a().hide()
}c.Msg.show({title:c.htcConfig.locData.CommonErrorCaption,msg:c.htcConfig.locData.CommonLoadError,icon:c.Msg.ERROR,buttons:c.Msg.CANCEL})
}}});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.TreePanel=function(config){var treeLoader=HttpCommander.Lib.TreeLoader({htcConfig:config.htcConfig,Msg:config.Msg,globalLoadMask:config.globalLoadMask,getRootName:config.getRootName,onlyFolders:false});
var self=new Ext.tree.TreePanel({region:"west",header:false,collapsible:true,collapsed:config.getHideTreeValue(),collapseMode:"mini",width:config.getIsEmbeddedtoIFRAME()?150:250,autoScroll:true,split:true,rootVisible:false,loader:treeLoader,enableDD:true,ddGroup:config.$("GridDD"),ddAppendOnly:true,hlDrop:false,openTreeData:{path:[],index:-1,reloadLastNode:false},root:{id:config.getRootName(),text:config.getRootName(),expaded:false},listeners:{load:function(n){if(n.parentNode==null){n.on("expand",function(rootNode){Ext.each(rootNode.childNodes,function(el){self.appendNodeDescription(el)
})
},n,{single:true})
}else{self.appendNodeDescription(n)
}if(config.htcConfig.relativePath!=""){Ext.each(n.childNodes,function(el){if(typeof el.attributes.icon!=="undefined"){el.attributes.icon=config.htcConfig.relativePath+el.attributes.icon
}})
}if(config.htcConfig.enableTrash&&config.isTrashFolder(n.attributes.path)){var usedTrashSize=null,percent=null,qtip="",rndrs=config.getRenderers();
if(n.firstChild&&n.firstChild.attributes&&Ext.isNumber(n.firstChild.attributes.usedbytes)){usedTrashSize=n.firstChild.attributes.usedbytes
}else{if(n.isLoaded()||n.isExpanded()){usedTrashSize=0
}}if(Ext.isNumber(config.htcConfig.trashSize)&&config.htcConfig.trashSize>0&&usedTrashSize!=null){percent="0%";
if(usedTrashSize>0){percent=""+Math.round((usedTrashSize*100)/config.htcConfig.trashSize)+"%"
}n.setText(Ext.util.Format.htmlEncode(config.htcConfig.locData.TrashRootTitle)+"&nbsp;("+Ext.util.Format.htmlEncode(String.format(config.htcConfig.locData.TrashUsedSpaceHint,percent))+")")
}else{if(Ext.isNumber(usedTrashSize)){n.setText(Ext.util.Format.htmlEncode(config.htcConfig.locData.TrashRootTitle)+"&nbsp;("+Ext.util.Format.htmlEncode(String.format(config.htcConfig.locData.TrashUsedSpaceHint,rndrs.sizeRenderer(""+(usedTrashSize<0?0:usedTrashSize))))+")")
}}if(!Ext.isEmpty(percent)){qtip+=Ext.util.Format.htmlEncode(String.format(config.htcConfig.locData.TrashLimitSizeHint,rndrs.sizeRenderer(""+(usedTrashSize<0?0:usedTrashSize)),rndrs.sizeRenderer(""+config.htcConfig.trashSize),percent))+"<br />"
}else{if(Ext.isNumber(usedTrashSize)){qtip+=Ext.util.Format.htmlEncode(String.format(config.htcConfig.locData.TrashUsedSpaceHint,rndrs.sizeRenderer(""+(usedTrashSize<0?0:usedTrashSize))))+"<br />"
}}if(Ext.isNumber(config.htcConfig.trashLargeItemSize)&&config.htcConfig.trashLargeItemSize>0){qtip+=Ext.util.Format.htmlEncode(String.format(config.htcConfig.locData.TrashLargeItemsShelfTimeHint,rndrs.sizeRenderer(""+config.htcConfig.trashLargeItemSize),config.htcConfig.trashLargeItemShelfDays));
qtip+="<br />"+Ext.util.Format.htmlEncode(String.format(config.htcConfig.locData.TrashSmallItemsShelfTimeHint,config.htcConfig.trashSmallItemShelfDays))
}else{qtip+=Ext.util.Format.htmlEncode(String.format(config.htcConfig.locData.TrashItemsShelfTimeHint,config.htcConfig.trashSmallItemShelfDays))
}n.attributes.qtip=qtip;
if(n.rendered&&n.ui&&n.ui.textNode){var tn=n.ui.textNode;
if(tn.setAttributeNS){tn.setAttributeNS("ext","qtip",qtip)
}else{tn.setAttribute("ext:qtip",qtip)
}}}},click:function(n){if(Ext.isEmpty(n.attributes.path)&&Ext.isEmpty(n.attributes.name)&&!(n.attributes.stype=="recent")){if(!Ext.isEmpty(n.attributes.error)){config.Msg.alert(config.htcConfig.locData.CommonErrorCaption,n.attributes.error)
}return false
}if(n.attributes.stype=="alert"){var pInfo={path:n.attributes.path,is_folder:n.attributes.folder===true,id:n.attributes.alertid};
if(!Ext.isEmpty(pInfo.path)&&!Ext.isEmpty(n.attributes.name)){pInfo.path=pInfo.path+"/"+n.attributes.name
}if(Ext.isEmpty(pInfo.path)){pInfo.path=n.attributes.name
}config.openAlertsFolder();
config.initAndShowChangesWatchWindow(pInfo);
return
}else{if(n.attributes.stype=="trash"&&!Ext.isEmpty(n.attributes.path)&&!Ext.isEmpty(n.attributes.name)){config.setSelectPath({path:":trash",name:n.attributes.name});
config.openTrash(true);
return
}}if(n.attributes.path==":recent"){config.openGridFolder(n.attributes.path+"/-1",true,true);
return
}if(config.isRecentFolder(n.attributes.path)||config.isTrashFolder(n.attributes.path)||config.isAlertsFolder(n.attributes.path)){config.openGridFolder(n.attributes.path,true,true);
return
}else{if(n.attributes.stype=="recent"&&!Ext.isEmpty(n.attributes.path)&&!Ext.isEmpty(n.attributes.name)&&!n.attributes.folder){config.setSelectPath({path:n.attributes.path,name:n.attributes.name,recent:true})
}}var isRcnt=(n.attributes.stype=="recent");
var path=Ext.isEmpty(n.attributes.path)?n.attributes.name:(isRcnt&&n.attributes.folder&&!Ext.isEmpty(n.attributes.name))?(n.attributes.path+"/"+n.attributes.name).replace(/\/\//gi,"/"):n.attributes.path;
if(isRcnt||n.attributes.style=="recentgroup"){config.openGridFolder(path,true,true)
}else{config.openGridFolder(path)
}},collapse:function(panel){if(config.toptbarButtons.Folders){Ext.each(config.toptbarButtons.Folders,function(item){item.toggle(false,true)
})
}},expand:function(panel){if(config.toptbarButtons.Folders){Ext.each(config.toptbarButtons.Folders,function(item){item.toggle(true,true)
})
}},render:function(tr){Ext.dd.ScrollManager.register(tr.getTreeEl())
},beforedestroy:function(tr){Ext.dd.ScrollManager.unregister(tr.getTreeEl())
},beforenodedrop:function(dropEvent){config.clipboard.clear();
dropEvent.cancel=true;
var source=dropEvent.data.node;
var ddAllow=config.dragDropPermission(source,dropEvent.target);
var srcPath=config.getCurrentFolder();
var perms;
var target=dropEvent.target;
var tgtPath=target.attributes.path;
if(Ext.isEmpty(target.attributes.path)){return
}if(source){if(Ext.isEmpty(source.attributes.name)){return
}if(Ext.isEmpty(source.parentNode.attributes.path)){if(!config.isSharedTreeFolder(target.attributes.path)){return
}}try{perms=eval("("+source.attributes.permissions+")")
}catch(e){}srcPath=source.parentNode.attributes.path;
var temp=[];
temp.push({data:{name:source.attributes.name,rowtype:"folder"}});
source=temp
}else{perms=config.htcConfig.currentPerms;
source=dropEvent.data.selections
}var moveToTrash=config.isTrashFolder(target.attributes.path);
if(moveToTrash){if(!config.htcConfig.enableTrash||!ddAllow.del){return
}}var createShare=config.isSharedTreeFolder(target.attributes.path);
if(createShare){if(!config.htcConfig.sharedInTree||!ddAllow.share){return
}}try{if(!createShare&&!moveToTrash){config.clipboard.setItems(config.createDraggedSet(source,srcPath));
config.clipboard.srcPath=srcPath
}var draggedFiles="",draggedFolders="";
Ext.each(source,function(rec){if(rec.data.rowtype=="file"){draggedFiles+=", "+Ext.util.Format.htmlEncode(rec.data.name)
}else{if(rec.data.rowtype=="folder"){draggedFolders+=", "+Ext.util.Format.htmlEncode(rec.data.name)
}}});
var draggedItemsText="";
if(draggedFiles!=""){draggedItemsText=String.format(config.htcConfig.locData.GridDDDraggedFileNames,draggedFiles.substring(1))
}if(draggedFolders!=""){if(draggedItemsText!=""){draggedItemsText+=".<br />"
}draggedItemsText+=String.format(config.htcConfig.locData.GridDDDraggedFolderNames,draggedFolders.substring(1))
}if(moveToTrash){config.dropDraggedToTrash(target,config.createDraggedSet(source,srcPath,true));
return
}else{if(createShare){config.dropDraggedForShare(source[0],srcPath,perms);
return
}else{if(ddAllow.onlyMoveOrCopy){config.clipboard.isCut=ddAllow.move;
self.confirmMoveOrCopy(target,ddAllow,draggedItemsText);
return
}}}}catch(err){config.clipboard.clear();
config.Msg.alert(config.htcConfig.locData.CommonErrorCaption,err)
}self.askCopyOrMove(target,srcPath,tgtPath,draggedItemsText)
},nodedragover:function(dragOverEvent){if(!dragOverEvent.target){return false
}var tNode=dragOverEvent.target;
if(!tNode.parentNode||tNode.isRoot){return false
}var ddAllow=config.dragDropPermission(dragOverEvent.data.node,tNode);
if(!ddAllow.allow){return false
}var sNode=dragOverEvent.data.node||dragOverEvent.data.selections;
if(!sNode){return false
}if(Ext.isArray(sNode)){var curFolder=config.getCurrentFolder().toLowerCase().trim();
if(curFolder===config.getRootName().toLowerCase()){return false
}if(sNode.length<1){return false
}if(Ext.isEmpty(tNode.attributes.path)){return false
}if(sNode.length>1&&config.isSharedTreeFolder(tNode.attributes.path)){return false
}var nodeFolder=tNode.attributes.path.toLowerCase().trim();
if(nodeFolder.indexOf(curFolder)==0){for(var i=0;
i<sNode.length;
i++){if(sNode[i].data.rowtype=="folder"){var fName=curFolder+"/"+sNode[i].data.name.toLowerCase().trim();
if(nodeFolder.indexOf(fName)==0){return false
}}}}}else{if(sNode.isRoot||!sNode.parentNode){return false
}if(sNode.parentNode.isRoot){if(!config.isSharedTreeFolder(tNode.attributes.path)){return false
}}if(sNode.parentNode==tNode){return false
}}return true
}},checkAndShowQtipError:function(node){if(!!node&&!!node.attributes&&!Ext.isEmpty(node.attributes.error)){var qtipError=node.attributes.error;
if(node.rendered&&node.ui&&node.ui.textNode){var tn=node.ui.textNode;
if(tn.setAttributeNS){tn.setAttributeNS("ext","qtip",qtipError)
}else{tn.setAttribute("ext:qtip",qtipError)
}}else{node.attributes.qtip=qtipError
}}},appendNodeDescription:function(node){var nodeEl;
if(node&&node.parentNode&&(node.parentNode.id.toLowerCase()===config.getRootName().toLowerCase()||!node.parentNode.parentNode)){nodeEl=(node.ui&&node.ui.getEl)?node.ui.getEl():undefined;
if(nodeEl&&nodeEl.firstChild){Ext.fly(nodeEl.firstChild).addClass("x-root-tree-node")
}if(node.attributes&&(typeof node.attributes.qtip!="undefined")&&!config.isTrashFolder(node.attributes.path)&&nodeEl&&nodeEl.firstChild){if(node.descInserted===true){nodeEl.removeChild(nodeEl.firstChild);
node.descInserted=false;
if(!nodeEl.firstChild){self.checkAndShowQtipError(node);
return
}}var descDiv=document.createElement("div");
descDiv.style.whiteSpace="normal";
descDiv.style.lineHeight="14px";
descDiv.style.cursor="default";
descDiv.style.font="11px arial,tahoma,helvetica,sans-serif;";
descDiv.style.margin="0";
descDiv.style.paddingLeft="4px";
descDiv.style.paddingTop="2px";
var innerHtml='<span class="x-tree-node-indent">';
innerHtml+='</span><span class="x-grid3-cell-text x-panel-header" style="line-height:14px;vertical-align:middle !important;text-align:left;padding:1px 3px 1px 0px;font-weight:bold;">'+String(node.attributes.qtip)+"</span>";
descDiv.innerHTML=innerHtml;
nodeEl.insertBefore(descDiv,nodeEl.firstChild);
node.descInserted=true
}}self.checkAndShowQtipError(node)
},confirmMoveOrCopy:function(target,ddAllow,draggedItemsText){config.Msg.confirm(Ext.util.Format.htmlEncode(String.format(config.htcConfig.locData.GridDDConfirmCopyMoveTitle,target.text)),(ddAllow.move?String.format(config.htcConfig.locData.GridDDConfirmTargetFolderOnlyMoveMsg,"<br />"+draggedItemsText):String.format(config.htcConfig.locData.GridDDConfirmTargetFolderOnlyCopyMsg,"<br />"+draggedItemsText)),function(btn){if(btn=="yes"){config.dropDraggedSet(target);
return true
}else{config.clipboard.clear();
return false
}})
},askCopyOrMove:function(target,srcPath,tgtPath,draggedItemsText){config.Msg.show({title:Ext.util.Format.htmlEncode(String.format(config.htcConfig.locData.GridDDConfirmCopyMoveTitle,target.text)),msg:String.format(config.htcConfig.locData.GridDDConfirmCopyMoveMsg,Ext.util.Format.htmlEncode(srcPath),Ext.util.Format.htmlEncode(tgtPath),"<br />"+draggedItemsText,"&nbsp;"),buttons:{yes:config.htcConfig.locData.CommandMove,no:config.htcConfig.locData.CommandCopy,cancel:config.htcConfig.locData.CommonButtonCaptionCancel},fn:function(btn){if(btn=="yes"||btn=="no"){config.clipboard.isCut=(btn=="yes");
config.dropDraggedSet(target)
}else{config.clipboard.clear();
config.Msg.hide()
}}})
},openTreeNode:function(path,reloadLastNode,forceHighlightCurrentFolderNode){forceHighlightCurrentFolderNode=(forceHighlightCurrentFolderNode===true);
if(config.getTreeViewValue()!="enabled"&&!reloadLastNode){if(forceHighlightCurrentFolderNode){self.highlightCurrentFolderNode()
}return
}if(reloadLastNode==null){reloadLastNode=false
}self.openTreeData.path=path.split("/");
if(path.toLowerCase()!=config.getRootName().toLowerCase()){self.openTreeData.path.unshift(config.getRootName())
}self.openTreeData.index=-1;
self.openTreeData.reloadLastNode=reloadLastNode;
self.openTreeNodeImpl(forceHighlightCurrentFolderNode)
},openTreeNodeClear:function(){self.openTreeData.path=[];
self.openTreeData.index=-1
},findTreeNodeChild:function(node,name,deep){return node.findChildBy(function(n){return !Ext.isEmpty(n.attributes.name)&&n.attributes.name.toLowerCase()==name.toLowerCase()
},node,deep)
},highlightCurrentFolderNode:function(){var path=config.getCurrentFolder(),node=self.getRootNode();
if(!Ext.isEmpty(path)&&path.toLowerCase()!=config.getRoo){node=node.findChild("path",path,true)
}if(node){try{node.select()
}catch(e){if(!!window.console&&!!window.console.log){window.console.log(e)
}}}},openTreeNodeWithHighlightCurrentImpl:function(){self.openTreeNodeImpl(true)
},openTreeNodeImpl:function(forceHighlightCurrentFolderNode){forceHighlightCurrentFolderNode=(forceHighlightCurrentFolderNode===true);
if(self.openTreeData.path.length==0){if(forceHighlightCurrentFolderNode){self.highlightCurrentFolderNode()
}return
}if(self.openTreeData.path[0].toLowerCase()!=config.getRootName().toLowerCase()){self.openTreeNodeClear();
if(forceHighlightCurrentFolderNode){self.highlightCurrentFolderNode()
}return
}var index=0;
var node=self.getRootNode();
while(node.isExpanded()&&index+1<self.openTreeData.path.length){var childNode=self.findTreeNodeChild(node,self.openTreeData.path[index+1],false);
if(childNode==null){self.openTreeNodeClear();
if(forceHighlightCurrentFolderNode){self.highlightCurrentFolderNode()
}return
}node=childNode;
index++
}if(node.isExpanded()){if(self.openTreeData.reloadLastNode&&node.firstExpand!==true){if(Ext.isFunction(node.reload)){node.reload()
}self.openTreeData.index=index
}else{self.openTreeNodeClear()
}node.firstExpand=null;
if(forceHighlightCurrentFolderNode){self.highlightCurrentFolderNode()
}else{node.select()
}return
}if(self.openTreeData.index==index){if(forceHighlightCurrentFolderNode){self.highlightCurrentFolderNode()
}return
}if(self.openTreeData.index>index){self.openTreeNodeClear();
if(forceHighlightCurrentFolderNode){self.highlightCurrentFolderNode()
}return
}self.openTreeData.index=index;
if(!node.expanded&&!node.loaded){node.firstExpand=true
}node.expand(false,true,forceHighlightCurrentFolderNode?self.openTreeNodeWithHighlightCurrentImpl:self.openTreeNodeImpl,self);
if(forceHighlightCurrentFolderNode){self.highlightCurrentFolderNode()
}else{node.select()
}},reloadTreeNodeIfOpened:function(pathStr){var path=pathStr.split("/");
if(pathStr.toLowerCase()!=config.getRootName().toLowerCase()){path.unshift(config.getRootName())
}var index=0;
var node=self.getRootNode();
while(node.isExpanded()&&index+1<path.length){var childNode=self.findTreeNodeChild(node,path[index+1],false);
if(childNode==null){return
}node=childNode;
index++
}if(node.isExpanded()&&Ext.isFunction(node.reload)){node.reload()
}}});
return self
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.FolderSelectionDialog=function(config){var maskLoader,self,tree,treeLoader,folderForSelect,mainHandler=function(node){var move=(self.action==="move"),perms=null,unzip=(self.action==="unzip"),btn=self.buttons[0];
if(!node){btn.setDisabled(true);
return
}try{perms=eval("("+node.attributes.permissions+")")
}catch(e){}var allow=perms&&((unzip&&perms.unzip)||(!unzip&&perms.create&&(perms.cut||perms.copy)));
if(!allow){btn.setDisabled(true);
return
}if(unzip){if(Ext.isEmpty(self.zipPath)||Ext.isEmpty(self.zipName)){btn.setDisabled(true);
return
}var unzipInfo={path:self.zipPath,name:self.zipName,crypted:true};
config.initAndShowUnzipPromptWindow(unzipInfo,2,node,self)
}else{config.getMenuActions().pasteTo(move,node,self)
}},reloadTree=function(){treeLoader.firstTreeLoad=true;
tree.getRootNode().reload()
};
treeLoader=HttpCommander.Lib.TreeLoader({htcConfig:config.htcConfig,Msg:config.Msg,globalLoadMask:function(){return maskLoader
},getRootName:config.getRootName,onlyFolders:true});
tree=new Ext.tree.TreePanel({header:false,collapsible:false,anchor:"100%",autoScroll:true,rootVisible:false,loader:treeLoader,enableDD:false,selModel:new Ext.tree.DefaultSelectionModel({listeners:{selectionchange:function(model,node){if(!treeLoader.firstTreeLoad){tree.lastFolder=!node?null:node.attributes.path
}var move=(self.action==="move"),perms=null,unzip=(self.action==="unzip"),btn=self.buttons[0];
if(!node){btn.setDisabled(true)
}else{try{perms=eval("("+node.attributes.permissions+")")
}catch(e){}var allow=perms&&((unzip&&perms.unzip)||(!unzip&&perms.create&&(perms.cut||perms.copy)));
btn.setDisabled(!allow)
}var newFolder=self.getTopToolbar().items.items[0];
newFolder.setDisabled(!perms||!perms.listFolders||!perms.create)
}}}),openTreeData:{path:[],index:-1,reloadLastNode:false},lastFolder:config.getRootName(),root:{id:config.getRootName(),text:config.getRootName(),expaded:false},listeners:{load:function(n){if(config.htcConfig.relativePath!=""){Ext.each(n.childNodes,function(el){if(!Ext.isEmpty(el.attributes.icon)){el.attributes.icon=config.htcConfig.relativePath+el.attributes.icon
}})
}if(!!n&&!n.parentNode){if(!Ext.isEmpty(tree.lastFolder)){tree.openTreeNode(tree.lastFolder,true)
}}},dblclick:mainHandler},openTreeNode:function(path,reloadLastNode){if(reloadLastNode==null){reloadLastNode=false
}tree.openTreeData.path=path.split("/");
if(path.toLowerCase()!=config.getRootName().toLowerCase()){tree.openTreeData.path.unshift(config.getRootName())
}tree.openTreeData.index=-1;
tree.openTreeData.reloadLastNode=reloadLastNode;
tree.openTreeNodeImpl()
},openTreeNodeClear:function(){tree.openTreeData.path=[];
tree.openTreeData.index=-1
},findTreeNodeChild:function(node,name,deep){return node.findChildBy(function(n){return !Ext.isEmpty(n.attributes.name)&&n.attributes.name.toLowerCase()==name.toLowerCase()
},node,deep)
},openTreeNodeImpl:function(){if(tree.openTreeData.path[0].toLowerCase()!=config.getRootName().toLowerCase()){tree.openTreeNodeClear();
return
}var index=0;
var node=tree.getRootNode();
while(node.isExpanded()&&index+1<tree.openTreeData.path.length){var childNode=tree.findTreeNodeChild(node,tree.openTreeData.path[index+1],false);
if(childNode==null){tree.openTreeNodeClear();
return
}node=childNode;
index++
}if(node.isExpanded()){if(tree.openTreeData.reloadLastNode&&node.firstExpand!==true){if(Ext.isFunction(node.reload)){node.reload()
}tree.openTreeData.index=index
}else{tree.openTreeNodeClear()
}node.firstExpand=null;
node.select();
return
}if(tree.openTreeData.index==index){return
}if(tree.openTreeData.index>index){tree.openTreeNodeClear();
return
}tree.openTreeData.index=index;
if(!node.expanded&&!node.loaded){node.firstExpand=true
}node.expand(false,true,tree.openTreeNodeImpl,self);
node.select()
},reloadTreeNodeIfOpened:function(pathStr){var path=pathStr.split("/");
if(pathStr.toLowerCase()!=config.getRootName().toLowerCase()){path.unshift(getRootName())
}var index=0;
var node=tree.getRootNode();
while(node.isExpanded()&&index+1<path.length){var childNode=tree.findTreeNodeChild(node,path[index+1],false);
if(childNode==null){return
}node=childNode;
index++
}if(node.isExpanded()&&Ext.isFunction(node.reload)){node.reload()
}}});
self=new config.Window({title:config.htcConfig.locData.UploadSimpleUploadFolderButtonText,closeAction:"hide",modal:true,layout:"fit",resizable:true,maximizable:true,minWidth:200,minHeight:300,width:300,height:350,plain:true,frame:false,tbar:[{text:config.htcConfig.locData.CommandNewFolder,icon:HttpCommander.Lib.Utils.getIconPath(config,"folder"),disabled:true,handler:function(btn){var node=tree.getSelectionModel().getSelectedNode();
if(!node){btn.setDisabled(true);
return
}config.getMenuActions().createNewItem("folder",node.attributes.path,self)
}},"->",{text:config.htcConfig.locData.CommandRefresh,icon:HttpCommander.Lib.Utils.getIconPath(config,"refresh"),handler:function(){reloadTree()
}}],items:tree,listeners:{render:function(wnd){maskLoader=new Ext.LoadMask(wnd.getEl(),{msg:config.htcConfig.locData.ProgressLoading+"..."})
},hide:function(wnd){if(!!config.clipboard){config.clipboard.clear()
}}},buttonAlign:"center",buttons:[{text:config.htcConfig.locData.CommonButtonCaptionOK,disabled:true,handler:function(btn){mainHandler(tree.getSelectionModel().getSelectedNode())
}},{text:config.htcConfig.locData.CommonButtonCaptionCancel,handler:function(btn){self.hide()
}}],openTreeNode:function(folder){if(!Ext.isEmpty(folder)){tree.lastFolder=folder
}if(tree.getRootNode().loaded){reloadTree()
}}});
return self
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.Clipboard=function(){this.enabled=false
};
Ext.apply(HttpCommander.Lib.Clipboard.prototype,{setBadgeText:function(d,g,e){if(!d){return
}var c=d,b=c.badgeText,a=c.el,f=a&&a.dom;
if(a&&f){if(e||b!==g){a.addClass("x-badge");
c.badgeText=g;
a.set({"data-hc-badge":c.badgeText||""});
if(Ext.isEmpty(c.badgeText)){a.addClass("hide-badge")
}else{a.removeClass("hide-badge")
}}}},updateBadge:function(){var b=this,a=0,c=Ext.query(".x-badge-container");
if(Ext.isArray(c)&&c.length>0){if(b.enabled){a=(Ext.isNumber(this.filesCount)?this.filesCount:0)+(Ext.isNumber(this.foldersCount)?this.foldersCount:0)
}a=a>0?(""+a):"";
Ext.each(c,function(d){var e=Ext.getCmp(d.id);
b.setBadgeText(e,a,true)
})
}},clear:function(b){for(var a in this){if(this.hasOwnProperty(a)){delete this[a]
}}this.enabled=false;
if(!(b===true)){this.updateBadge()
}},setItems:function(a){this.clear(true);
this.enabled=true;
this.path=a.path;
this.files=a.files;
this.folders=a.folders;
this.filesCount=a.filesCount;
this.foldersCount=a.foldersCount;
this.updateBadge()
}});
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.MenuActions=function(d){var a=function(g){d.Msg.show({title:d.htcConfig.locData.CommonErrorCaption,msg:g||"Unknown error",icon:d.Msg.ERROR,buttons:d.Msg.CANCEL})
};
var f=function(g){g=g||{};
var h=new d.Window({title:g.title||"",autoDestroy:true,modal:true,closable:true,minizable:false,maximizable:false,width:260,layout:"form",padding:5,resizable:false,autoHeight:true,labelAlign:"top",items:[{fieldLabel:Ext.isEmpty(g.prompt)?d.htcConfig.locData.CommonFileNamePrompt:g.prompt,itemId:"new-value",allowBlank:false,xtype:"textfield",anchor:"100%",value:g.newName||"",enableKeyEvents:true,listeners:{keyup:function(i,k){if(k&&k.keyCode==13){var l=i.getValue();
if(!Ext.isEmpty(l)&&l.trim().length>0&&Ext.isFunction(g.callback)){g.callback(l,h)
}}}}}],buttonAlign:"center",buttons:[{text:d.htcConfig.locData.CommonButtonCaptionOK,handler:function(i){var k=h.getComponent("new-value").getValue();
if(!Ext.isEmpty(k)&&Ext.isFunction(g.callback)){g.callback(k,h)
}}},{text:d.htcConfig.locData.CommonButtonCaptionCancel,handler:function(i){h.hide()
}}],listeners:{show:function(k){var i=k.getComponent("new-value");
if(i&&i.rendered){var l=i.getValue();
if(!Ext.isEmpty(l)){var m=l.lastIndexOf(".");
if(m<0){m=l.length
}setTimeout(function(){try{i.selectText(0,m)
}catch(n){}try{i.focus()
}catch(n){}},50);
return
}i.focus(true,50)
}}}});
h.show();
return h
};
var c=function(g){var l=(g||{}).newExt||"";
var k=(g||{}).callback;
var h=(g||{}).args||[];
if(!Ext.isArray(h)){h=[h]
}if(!Ext.isEmpty(l)&&Ext.isFunction(k)){var i=new d.Window({title:d.htcConfig.locData.CommonConfirmCaption,autoDestroy:true,defaultButton:0,modal:true,closable:true,minizable:false,maximizable:false,width:260,minWidth:200,layout:"form",padding:5,resizable:false,autoHeight:true,items:[{xtype:"label",anchor:"100%",html:String.format(d.htcConfig.locData.EditInGoogleConvertMessage,l,'<span style="font-weight:bold;">',"</span>")}],buttonAlign:"center",buttons:[{text:d.htcConfig.locData.CommonButtonCaptionContinue,handler:function(m){i.hide();
k.apply(b,h)
}},{text:d.htcConfig.locData.CommonButtonCaptionCancel,handler:function(m){i.hide()
}}]});
i.show();
return
}};
var e=function(g){g=g||{};
var h=new d.Window({id:g.id||Ext.id(),title:g.title||d.htcConfig.locData.CommonProgressPleaseWait,autoDestroy:true,modal:true,closable:false,minizable:false,maximizable:false,width:400,layout:"form",padding:5,resizable:false,autoHeight:true,items:[{xtype:"label",html:"<img src='"+HttpCommander.Lib.Utils.getIconPath(d,"ajax-loader.gif")+"' class='filetypeimage'>&nbsp;"+(g.message1||d.htcConfig.locData.CommonProgressPleaseWait)+"...<br />"},{xtype:"label",html:String.format(g.message2||d.htcConfig.locData.EditDocumentCancelHint,"&quot;"+d.htcConfig.locData.HideButton+"&quot;","&quot;"+d.htcConfig.locData.CancelEditButton+"&quot;")},{itemId:"save-hint",xtype:"label",html:String.format("<br />"+(g.message3||d.htcConfig.locData.EditDocumentSaveHint),"&quot;"+d.htcConfig.locData.CommandSave+"&quot;"),hidden:true}],listeners:{hide:function(){setTimeout(d.openTreeRecent,500)
}},buttonAlign:"center",buttons:[{text:d.htcConfig.locData.HideButton,handler:function(i){h.hide()
}},{text:d.htcConfig.locData.CancelEditButton,handler:function(i){if(Ext.isFunction(g.cancelFn)){g.cancelFn.apply(b)
}h.hide()
}},{text:d.htcConfig.locData.CommandSave,hidden:true,handler:function(i){if(Ext.isFunction(g.saveFn)){g.saveFn.apply(b)
}}}],showSave:function(){if(h){try{h.getComponent("save-hint").show();
h.buttons[2].show()
}catch(i){if(!!window.console&&!!window.console.log){window.console.log(i)
}}}}});
if(!Ext.isFunction(window.refreshRecentFromEditor)){window.refreshRecentFromEditor=function(){setTimeout(d.openTreeRecent,1000)
}
}h.show();
return h
};
var b={setLabel:function(i,h,m){var l=d.createSelectedSet(d.getGrid(),d.getCurrentFolder());
var k=d.getCurrentFolder();
var g=false;
if(!Ext.isObject(l)||(l.filesCount==0&&l.foldersCount==0)){return
}if(Ext.isEmpty(i)||Ext.isEmpty(h)){g=true
}else{l.label=i;
l.color=h
}d.globalLoadMask.msg=d.htcConfig.locData[g?"LabelsRemovingLabelMessage":"LabelsLabellingMessage"]+"...";
d.globalLoadMask.show();
var n=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
HttpCommander.Metadata.Label(l,function(s,q){Ext.Ajax.timeout=n;
d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(s,q,d.Msg,d.htcConfig)){var r="";
var p=s.labelled;
var o=s.notLabelled;
if(p>0){r+=String.format(d.htcConfig.locData[g?"LabelsRemovedMessage":"LabelsFileLabelledMessage"],p);
if(o>0){r+=",<br />"+String.format(d.htcConfig.locData[g?"LabelsNotRemovedMessages":"LabelsNotLabelledMessage"],o);
if(!Ext.isEmpty(s.message)){r+="<br />"+s.message
}}}else{if(!Ext.isEmpty(s.message)){a(s.message)
}}if(!Ext.isEmpty(r)){d.showBalloon(r)
}if(m&&m.isVisible()){m.hide()
}var t=l.filesCount>0?l.files[0]:l.foldersCount>0?l.folders[0]:null;
if(!Ext.isEmpty(k)&&!Ext.isEmpty(t)){d.setSelectPath({name:t,path:k})
}d.openGridFolder(k)
}})
},createNewItemImpl:function(h,g){d.globalLoadMask.msg=d.htcConfig.locData.ProgressCreating+"...";
d.globalLoadMask.show();
HttpCommander.Common.Create(h,function(k,i){d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(typeof k=="undefined"){a(Ext.util.Format.htmlEncode(i.message));
return
}if(k.success){d.showBalloon(d.htcConfig.locData.BalloonCreatedSuccessfully);
var l=h.path;
if(!Ext.isEmpty(l)&&!Ext.isEmpty(h.newName)){d.setSelectPath({name:h.newName,path:l});
l+="/"+h.newName
}d.openTreeRecent();
if(!!g&&g.isVisible()){d.openTreeNode(h.path,true);
g.openTreeNode(l)
}else{d.openGridFolder(h.path,true,h.type=="folder")
}}else{if(k.newname){d.Msg.confirm(d.htcConfig.locData.CommonConfirmCaption,k.message,function(m){if(m=="yes"){h.newName=k.newname;
b.createNewItemImpl(h,g)
}},b)
}else{a(k.message)
}}})
},createNewItem:function(q,n,g){var t=q=="file"?d.htcConfig.locData.CommonFileNameCaption:d.htcConfig.locData.CommonFolderNameCaption;
var k=q=="file"?d.htcConfig.locData.CommonFileNamePrompt+":":d.htcConfig.locData.CommonFolderNamePrompt+":";
var s=d.Msg.prompt(t,k,function(u,w){if(u=="ok"){var v=!Ext.isEmpty(n)?n:d.getCurrentFolder();
if(q==="file"&&!d.isExtensionAllowed(w)){a(d.getRestrictionMessage());
return
}var x={};
x.path=v;
x.type=q;
x.newName=w;
b.createNewItemImpl(x,g)
}},b,false,d.htcConfig.locData[q=="file"?"CommonFileNewNameValue":"CommonFolderNewNameValue"]);
if(s){var p=s.getDialog(),i,h;
if(p&&(i=p.el.dom.getElementsByTagName("input"))){if(i.length>0&&(h=i[0])&&h.value){var r=q=="file",l=String(h.value),m=r?l.lastIndexOf("."):l.length;
if(m<0){m=l.length
}if(h.createTextRange){var o=h.createTextRange();
o.collapse(true);
o.moveStart("character",0);
o.moveEnd("character",m);
o.select();
h.focus()
}else{if(h.setSelectionRange){h.focus();
h.setSelectionRange(0,m)
}else{if(typeof h.selectionStart!="undefined"){h.selectionStart=0;
h.selectionEnd=m;
h.focus()
}}}}}}},createNewMSOO:function(i,h){if(Ext.isEmpty(i)||!d.isExtensionAllowed(i)||!d.getSkyDriveAuth()){return
}var g=h;
if(!Ext.isEmpty(g)){g+="."+i
}else{return
}f({title:d.htcConfig.locData.CommandNewMSOODocument,newName:g,callback:function(m,k){var l=HttpCommander.Lib.Utils.getFileExtension(m);
if(l!=i){m+="."+i
}if(Ext.isObject(k)&&Ext.isFunction(k.hide)){k.hide()
}b.msooEdit(m)
}})
},createNew365:function(i,h){if(Ext.isEmpty(i)||!d.isExtensionAllowed(i)||!d.getSkyDriveAuth()){return
}var g=h;
if(!Ext.isEmpty(g)){g+="."+i
}else{return
}f({title:d.htcConfig.locData.CommandNewOffice365Document,newName:g,callback:function(m,k){var l=HttpCommander.Lib.Utils.getFileExtension(m);
if(l!=i){m+="."+i
}if(Ext.isObject(k)&&Ext.isFunction(k.hide)){k.hide()
}b.office365Edit(m)
}})
},createNewGoogle:function(k,i,h){if(Ext.isEmpty(k)||Ext.isEmpty(i)||!d.isExtensionAllowed(i)||!d.getGoogleDriveAuth()){return
}var g=h;
if(!Ext.isEmpty(g)){g+="."+i
}else{return
}f({title:d.htcConfig.locData.CommandNewGoogleDocument,newName:g,callback:function(n,l){var m=HttpCommander.Lib.Utils.getFileExtension(n);
if(m!=i){n+="."+i
}if(Ext.isObject(l)&&Ext.isFunction(l.hide)){l.hide()
}b.googleEdit(n,k)
}})
},msooEditImpl:function(n,k,l){var p=null,h=null,g=null,o=Ext.id();
if(!Ext.isFunction(window.handleMSOOEditorError)){window.handleMSOOEditorError=function(q,r){if(!Ext.isEmpty(q)){b.showedMSOOError=true;
b.hideEditWaitWindowById(r);
d.Msg.hide();
a(q)
}}
}if(!Ext.isFunction(window.handleMSOOEditorAuth)){window.handleMSOOEditorAuth=function(s,r){var q=d&&Ext.isFunction(d.getSkyDriveAuth)?d.getSkyDriveAuth():null;
if(q&&Ext.isFunction(q.setAuthAboutInfos)){q.setAuthAboutInfos(s)
}}
}if(!Ext.isFunction(window.handleMSOOEditorSend)){window.handleMSOOEditorSend=function(q,r){if(Ext.isObject(q)){if(!Ext.isEmpty(r)){if(!Ext.isArray(window.lastEditedMSOODoc)){window.lastEditedMSOODoc=[]
}window.lastEditedMSOODoc.push({id:r,doc:Ext.apply({},q)});
b.showSaveEditWaitWindowById(r)
}else{window.lastEditedGoogleDoc=[{id:null,doc:Ext.apply({},q)}]
}}}
}b.showedMSOOError=false;
g=e({id:o,message1:d.htcConfig.locData.EditInMSOOWaiting,saveFn:function(){var q=b.getDocInfoByWaitId("lastEditedMSOODoc",o);
if(Ext.isObject(q)){d.editInMSOO(o,q,n,k,l,true)
}},cancelFn:function(){try{window.clearInterval(p)
}catch(r){}try{if(h&&!h.closed){h.close()
}}catch(r){}var q=b.getDocInfoByWaitId("lastEditedMSOODoc",o);
if(Ext.isObject(q)&&!Ext.isEmpty(q.id)){d.deleteInMSOO(q)
}}});
var i=encodeURIComponent(n+"/"+k);
h=window.open(d.htcConfig.relativePath+"Handlers/MSOOEditor.aspx?doc="+i+(l?"&new=true":"")+("&wmid="+encodeURIComponent(o)),"msooeditpopup"+(new Date()).getTime(),HttpCommander.Lib.Utils.getPopupProps());
if(h){try{h.focus()
}catch(m){}}p=window.setInterval(function(){try{if(h==null||h.closed){window.clearInterval(p);
b.hideEditWaitWindowById(o);
var r=b.getDocInfoByWaitId("lastEditedMSOODoc",o);
if(Ext.isObject(r)){d.editInMSOO(o,r,n,k,l)
}else{if(!b.showedMSOOError){d.Msg.hide();
b.showedMSOOError=false
}}}}catch(q){window.clearInterval(p)
}},1000)
},msooEdit:function(m){var n=!Ext.isEmpty(m);
var p=d.getCurrentFolder();
var o=n?null:d.getGrid().getSelectionModel();
var i,l=d.getSkyDriveAuth();
var k=n?m:null;
if(!n&&o.getCount()==1){i=d.getGrid().getSelectionModel().getSelected();
k=i.data.name
}if((!n&&!i)||!l){return
}var h=HttpCommander.Lib.Utils.getFileExtension(k);
var g=HttpCommander.Lib.Utils.checkAndGetNewExtensionConvertedFromMSOO(h);
if(!Ext.isEmpty(g)){c({newExt:g,callback:b.msooEditImpl,args:[p,k,n]});
return
}b.msooEditImpl(p,k,n)
},office365EditImpl:function(o,k,l){var m=null,g=null,h=null,p=Ext.id();
if(!Ext.isFunction(window.getOffice365Auth)){window.getOffice365Auth=function(){var q=d&&Ext.isFunction(d.getSkyDriveAuth)?d.getSkyDriveAuth():null;
return q&&Ext.isFunction(q.getAuthInfo)?q.getAuthInfo(true):null
}
}if(!Ext.isFunction(window.handle365EditorError)){window.handle365EditorError=function(q,r){var s=Ext.isObject(q)?q.error_description:q;
if(!Ext.isEmpty(s)){b.showed365Error=true;
b.hideEditWaitWindowById(r);
d.Msg.hide();
a(s)
}}
}if(!Ext.isFunction(window.handle365EditorAuth)){window.handle365EditorAuth=function(s,r){var q=d&&Ext.isFunction(d.getSkyDriveAuth)?d.getSkyDriveAuth():null;
if(s){if(q&&Ext.isFunction(q.setAuthInfo)){q.setAuthInfo(s)
}}else{if(q&&Ext.isFunction(q.clearAuth)){q.clearAuth()
}}}
}if(!Ext.isFunction(window.handle365EditorSend)){window.handle365EditorSend=function(q,r){if(Ext.isObject(q)){if(!Ext.isEmpty(r)){if(!Ext.isArray(window.lastEdited365Doc)){window.lastEdited365Doc=[]
}window.lastEdited365Doc.push({id:r,doc:Ext.apply({},q)});
b.showSaveEditWaitWindowById(r)
}else{window.lastEdited365Doc=[{id:null,doc:Ext.apply({},q)}]
}}}
}b.showed365Error=false;
h=e({id:p,message1:d.htcConfig.locData.EditInOffice365Waiting,saveFn:function(){var q=b.getDocInfoByWaitId("lastEdited365Doc",p);
if(Ext.isObject(q)){d.editInOffice365(p,q,o,k,l,true)
}},cancelFn:function(){try{window.clearInterval(m)
}catch(r){}try{if(g&&!g.closed){g.close()
}}catch(r){}var q=b.getDocInfoByWaitId("lastEdited365Doc",p);
if(Ext.isObject(q)&&!Ext.isEmpty(q.id)){d.deleteInOffice365(q)
}}});
var i=encodeURIComponent(o+"/"+k);
g=window.open(d.htcConfig.relativePath+"Handlers/Office365Editor.aspx?doc="+i+(l?"&new=true":"")+("&wmid="+encodeURIComponent(p)),"o365editpopup"+(new Date()).getTime(),HttpCommander.Lib.Utils.getPopupProps());
if(g){try{g.focus()
}catch(n){}}m=window.setInterval(function(){try{if(g==null||g.closed){window.clearInterval(m);
b.hideEditWaitWindowById(p);
var r=b.getDocInfoByWaitId("lastEdited365Doc",p);
if(Ext.isObject(r)){d.editInOffice365(p,r,o,k,l)
}else{if(!b.showed365Error){d.Msg.hide();
b.showed365Error=false
}}}}catch(q){window.clearInterval(m)
}},1000)
},office365Edit:function(m){var k=!Ext.isEmpty(m);
var l=d.getCurrentFolder();
var i=k?null:d.getGrid().getSelectionModel();
var h,n=d.getSkyDriveAuth();
var o=k?m:null;
var g;
if(!k&&i.getCount()==1){h=d.getGrid().getSelectionModel().getSelected();
o=h.data.name
}if((!k&&!h)||!n){return
}b.office365EditImpl(l,o,k)
},googleEditImpl:function(p,l,g,m){var o=null,h=null,i=null,q=Ext.id();
if(!Ext.isFunction(window.handleGoogleEditorError)){window.handleGoogleEditorError=function(r,s){if(!Ext.isEmpty(r)){b.showedGoogleError=true;
b.hideEditWaitWindowById(s);
d.Msg.hide();
a(r)
}}
}if(!Ext.isFunction(window.handleGoogleEditorAuth)){window.handleGoogleEditorAuth=function(t,s){var r=d&&Ext.isFunction(d.getGoogleDriveAuth)?d.getGoogleDriveAuth():null;
if(r&&Ext.isFunction(r.setAuthAboutInfos)){r.setAuthAboutInfos(t)
}}
}if(!Ext.isFunction(window.handleGoogleEditorSend)){window.handleGoogleEditorSend=function(r,t){if(Ext.isObject(r)){var s=Ext.apply({},r);
if(Ext.isObject(r.exportLinks)){s.exportLinks=Ext.apply({},r.exportLinks)
}if(!Ext.isEmpty(t)){if(!Ext.isArray(window.lastEditedGoogleDoc)){window.lastEditedGoogleDoc=[]
}window.lastEditedGoogleDoc.push({id:t,doc:s});
b.showSaveEditWaitWindowById(t)
}else{window.lastEditedGoogleDoc=[{id:null,doc:s}]
}}}
}b.showedGoogleError=false;
i=e({id:q,message1:d.htcConfig.locData.EditInGoogleWaiting,getInterval:function(){return o
},saveFn:function(){var r=b.getDocInfoByWaitId("lastEditedGoogleDoc",q);
if(Ext.isObject(r)){d.editInGoogle(q,r,p,l,m,true)
}},cancelFn:function(){try{window.clearInterval(o)
}catch(s){}try{if(h&&!h.closed){h.close()
}}catch(s){}var r=b.getDocInfoByWaitId("lastEditedGoogleDoc",q);
if(Ext.isObject(r)&&!Ext.isEmpty(r.id)){d.deleteInGoogle(r)
}}});
var k=encodeURIComponent(p+"/"+l);
h=window.open(d.htcConfig.relativePath+"Handlers/GoogleEditor.aspx?doc="+k+(m?("&mime="+encodeURIComponent(g)):"")+("&wmid="+encodeURIComponent(q)),"googleeditpopup"+(new Date()).getTime(),HttpCommander.Lib.Utils.getPopupProps());
if(h){try{h.focus()
}catch(n){}}o=window.setInterval(function(){try{if(h==null||h.closed){window.clearInterval(o);
b.hideEditWaitWindowById(q);
var s=b.getDocInfoByWaitId("lastEditedGoogleDoc",q);
if(Ext.isObject(s)){d.editInGoogle(q,s,p,l,m)
}else{if(!b.showedGoogleError){d.Msg.hide();
b.showedGoogleError=false
}}}}catch(r){window.clearInterval(o)
}},1000)
},googleEdit:function(n,g){var o=!Ext.isEmpty(n)&&!Ext.isEmpty(g);
var q=d.getCurrentFolder();
var p=o?null:d.getGrid().getSelectionModel();
var k,m=d.getGoogleDriveAuth();
var l=o?n:null;
if(!o&&p.getCount()==1){k=d.getGrid().getSelectionModel().getSelected();
l=k.data.name
}if((!o&&!k)||!m){return
}var i=HttpCommander.Lib.Utils.getFileExtension(l);
var h=HttpCommander.Lib.Utils.checkAndGetNewExtensionConvertedFromGoogle(i);
if(!Ext.isEmpty(h)){c({newExt:h,callback:b.googleEditImpl,args:[q,l,g,o]});
return
}b.googleEditImpl(q,l,g,o)
},showSaveEditWaitWindowById:function(g){if(!Ext.isEmpty(g)){var h=Ext.getCmp(g);
if(h&&Ext.isFunction(h.showSave)){h.showSave.apply(h)
}}},hideEditWaitWindowById:function(g){if(!Ext.isEmpty(g)){var h=Ext.getCmp(g);
if(h&&Ext.isFunction(h.hide)){h.hide()
}}},getDocInfoByWaitId:function(m,h){var n=null,g,k,l;
if(Ext.isEmpty(m)||Ext.isEmpty(h)){return n
}if(Ext.isArray(window[m])){g=window[m].length;
for(k=0;
k<g;
k++){l=window[m][k]||{};
if(l.id===h){n=l.doc;
if(Ext.isObject(n)){return n
}}}}return n
},getOutputFormats:function(){var i={path:"",name:""};
var k=d.getCurrentFolder();
var h=d.getGrid().getSelectionModel();
var g;
if(h.getCount()==1){g=d.getGrid().getSelectionModel().getSelected();
if(g){i.path=k;
i.name=g.data.name
}}if(!g||i.path==""||i.name==""){return
}d.globalLoadMask.msg=d.htcConfig.locData.ProgressGetCloudConvertOutputFormats+"...";
d.globalLoadMask.show();
HttpCommander.Common.CloudConvertOutputFormats(i,function(m,l){d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(m,l,d.Msg,d.htcConfig,2)){d.initAndShowCloudConvertWindow(g,k,m.ofs)
}})
},renameImpl:function(g){d.globalLoadMask.msg=d.htcConfig.locData.ProgressRenaming+"...";
d.globalLoadMask.show();
HttpCommander.Common.Rename(g,function(i,h){d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(typeof i=="undefined"){a(Ext.util.Format.htmlEncode(h.message));
return
}if(i.success){d.showBalloon(d.htcConfig.locData.BalloonRenamedSuccessfully);
if(i.warning!==true){if(!Ext.isEmpty(i.resultName)){d.setSelectPath({name:i.resultName,path:g.path})
}if(g.type=="folder"){d.openGridFolder(g.path,true,true)
}else{d.openGridFolder(g.path)
}}}else{if(i.newname){d.Msg.confirm(d.htcConfig.locData.CommandRename,i.message,function(k){if(k=="yes"){if(g.type=="file"){g.newName=i.newname
}else{g.merge=true
}b.renameImpl(g)
}},b)
}else{a(i.message)
}return
}if(i.warning===true){d.showRefreshWarning()
}})
},renameSelectedItem:function(){var l=d.getGrid().getSelectionModel().getSelected();
if(!l){return
}var o=d.getGrid().getStore().indexOf(l);
if(d.getCurrentGridView()==="thumbnails"){var q=d.Msg.prompt(d.htcConfig.locData.CommandRename,"",function(s,t){if(s=="ok"){if(l.data.rowtype==="file"&&!d.isExtensionAllowed(t,false)){a(d.getRestrictionMessage(false));
return
}var r={};
r.path=d.getCurrentFolder();
r.name=l.data.name;
r.type=l.data.rowtype;
r.newName=t;
if(d.getAsControl()){r.control=true
}b.renameImpl(r)
}},b,false,l.data.name);
if(q){var n=q.getDialog(),h,g;
if(n&&(h=n.el.dom.getElementsByTagName("input"))){if(h.length>0&&(g=h[0])&&g.value){var p=l.data.rowtype==="file",i=String(g.value),k=p?i.lastIndexOf("."):i.length;
if(k<0){k=i.length
}if(g.createTextRange){var m=g.createTextRange();
m.collapse(true);
m.moveStart("character",0);
m.moveEnd("character",k);
m.select();
g.focus()
}else{if(g.setSelectionRange){g.focus();
g.setSelectionRange(0,k)
}else{if(typeof g.selectionStart!="undefined"){g.selectionStart=0;
g.selectionEnd=k;
g.focus()
}}}}}}}else{d.setAllowEdit(true);
d.getGrid().startEditing(o,0);
d.setAllowEdit(false)
}},addWatch:function(){var g=b.getSelectedSingleFileOrFolder();
if(!g.is_folder){d.initAndShowWatchModifsWindow(g)
}else{d.Msg.show({title:d.htcConfig.locData.CommonConfirmCaption,msg:Ext.util.Format.htmlEncode(d.htcConfig.locData.WatchForModifsNestedItemsWarning),buttons:d.Msg.OKCANCEL,icon:d.Msg.WARNING,fn:function(h){if(h=="ok"){d.initAndShowWatchModifsWindow(g)
}}})
}},editWatch:function(g,h){if(!Ext.isObject(g)){g=b.getSelectedSingleFileOrFolder()
}if(Ext.isObject(g)&&!Ext.isEmpty(g.path)&&Ext.isNumber(g.id)){d.initAndShowWatchModifsWindow(g,h);
return
}},stopWatch:function(i,g){var h=Ext.isObject(i)?i:b.getSelectedSingleFileOrFolder();
if(!h||Ext.isEmpty(h.path)){return
}d.globalLoadMask.msg=d.htcConfig.locData.WatchForModifsStopProgressLoading+"...";
d.globalLoadMask.show();
HttpCommander.Common.StopWatch(h,function(l,k){d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(l,k,d.Msg,d.htcConfig)){d.openTreeAlerts();
d.openGridFolder(d.getCurrentFolder());
d.showBalloon(Ext.util.Format.htmlEncode(String.format(d.htcConfig.locData.WatchForModifsStopSuccessMessage,h.path)));
if(g&&Ext.isFunction(g.hide)){g.hide()
}}})
},viewWatch:function(h){var g=b.getSelectedSingleFileOrFolder(h);
if(!g||Ext.isEmpty(g.path)){return
}d.initAndShowChangesWatchWindow(g)
},restoreTrashedItemsImpl:function(g){var h=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
d.globalLoadMask.msg=d.htcConfig.locData.TrashProgressRestoring+"...";
d.globalLoadMask.show();
HttpCommander.Common.RestoreFromTrash(g,function(k,i){Ext.Ajax.timeout=h;
d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
HttpCommander.Lib.Utils.checkDirectHandlerResult(k,i,d.Msg,d.htcConfig);
if(k&&k.restored>0){d.showBalloon(String.format(d.htcConfig.locData.TrashBalloonRestored,k.restored,k.total>=k.restored?k.total:k.restored))
}d.openTrash()
})
},restoreTrashedItems:function(h){var g=d.getCurrentFolder();
if(!d.htcConfig.enableTrash||!d.isTrashFolder(g)){return
}var i={names:[]};
if(h===true){i.names=null;
d.Msg.show({title:d.htcConfig.locData.CommonConfirmCaption,msg:d.htcConfig.locData.TrashRestoreAllPrompt,buttons:d.Msg.YESNO,icon:d.Msg.QUESTION,fn:function(l){if(l=="yes"){b.restoreTrashedItemsImpl(i)
}}})
}else{var k=d.getGrid().getSelectionModel().getSelections();
Ext.each(k,function(l){var m=l.data.trashname;
if(!Ext.isEmpty(m)){i.names.push(m)
}});
b.restoreTrashedItemsImpl(i)
}},deleteSelectedAnonymLinks:function(h){if(!h){return
}var i=h.getSelectionModel().getSelections(),g=[];
Ext.each(i,function(k){var l=k.data.id;
if(Ext.isNumber(l)&&l>0){g.push(l)
}});
if(g.length==0){return
}d.Msg.confirm(d.htcConfig.locData.PublicLinksDeleteWindowTitle,d.htcConfig.locData.PublicLinksDeleteConfirmMsg,function(k){if(k=="yes"){d.globalLoadMask.msg=d.htcConfig.locData.ProgressDeletingAnonymousLink+"...";
d.globalLoadMask.show();
HttpCommander.Common.RemoveAnonymLinks({ids:g},function(m,l){d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(m,l,d.Msg,d.htcConfig)){d.openSharedByLink()
}})
}d.Msg.hide()
})
},deleteSelectedItems:function(h,l){var p=d.getCurrentFolder();
var o=false;
if(Ext.isObject(l)){if(!d.htcConfig.enableTrash){return
}else{o=true;
p=l.path;
h=false
}}var k=Ext.isObject(l)?l:d.createSelectedSet(d.getGrid(),p,h);
if(k.filesCount==0&&k.foldersCount==0){return
}var n=!o&&d.isRecentFolder(p);
var i=!o&&d.isTrashFolder(p);
var r,q;
if(k.filesCount==0&&k.foldersCount==1){q=k.folders[0]
}if(k.foldersCount==0&&k.filesCount==1){q=k.files[0]
}if(!Ext.isEmpty(q)&&(n||i)){var g=q.split("/");
q=g[g.length-1]
}if(h){r=d.htcConfig.locData.TrashEmptyTrashPrompt
}else{if(!Ext.isEmpty(q)){if(i){q=d.getGrid().getSelectionModel().getSelected().get("name")
}r=String.format(d.htcConfig.locData[n?"RecentDeleteOnePrompt":i?"TrashDeleteOnePrompt":"CommonDeleteOnePrompt"],Ext.util.Format.htmlEncode(q))
}else{r=String.format(d.htcConfig.locData[n?"RecentDeleteManyPrompt":i?"TrashDeleteManyPrompt":"CommonDeleteManyPrompt"],k.filesCount+k.foldersCount)
}}var m=null;
if(!n&&!i&&d.htcConfig.enableTrash&&Ext.isNumber(d.htcConfig.deleteDirectly)&&d.htcConfig.deleteDirectly<2){r+='<br/><br/><input type="checkbox" autocomplete="off" id="'+(m=Ext.id())+'" name="'+m+'" class=" x-form-checkbox x-form-field" style="vertical-align:middle;"'+(d.htcConfig.deleteDirectly===1?(' checked="checked"'):"")+" />&nbsp;"+d.htcConfig.locData.TrashDeleteDirectlyLabel
}if(d.getAsControl()){k.control=true
}d.Msg.show({title:d.htcConfig.locData.CommonConfirmCaption,msg:r,buttons:d.Msg.YESNO,icon:d.Msg.QUESTION,fn:function(t){if(t=="yes"){if(m){var s=Ext.get(m);
if(s&&s.dom){k.dd=(s.dom.checked===true)
}}var u=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
d.globalLoadMask.msg=d.htcConfig.locData.ProgressDeleting+"...";
d.globalLoadMask.show();
HttpCommander.Common.Delete(k,function(y,w){Ext.Ajax.timeout=u;
d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(typeof y=="undefined"){a(Ext.util.Format.htmlEncode(w.message));
return
}var x="";
if(y.filesDeleted>0){x+=String.format(d.htcConfig.locData.BalloonFilesDeleted,y.filesDeleted)
}if(y.foldersDeleted>0){if(x!=""){x+="<br />"
}x+=String.format(d.htcConfig.locData.BalloonFoldersDeleted,y.foldersDeleted)
}var z=k.filesCount-y.filesDeleted;
if(z>0){if(x!=""){x+="<br />"
}x+=String.format(d.htcConfig.locData.BalloonFilesFailed,z)
}var v=k.foldersCount-y.foldersDeleted;
if(v>0){if(x!=""){x+="<br />"
}x+=String.format(d.htcConfig.locData.BalloonFoldersFailed,v)
}if(y.status!="success"){a(y.message)
}if(!Ext.isEmpty(x)){d.showBalloon(x)
}if(y.warning===true){d.showRefreshWarning()
}else{if(y.foldersDeleted>0||n||i||h){if(h){if(y.foldersDeleted>0){d.reloadTreeNodeIfOpened(p)
}d.openTrash()
}else{d.openGridFolder(p,true,true,false,true)
}}else{d.openGridFolder(p,false,false,false,true)
}}})
}}})
},viewChangeDetails:function(r,m,l){var q=d.getDetailsPane();
var o=(l===true)&&!!q;
if(o){if(q.collapsed){q.expand()
}q.setActiveTab("cmt-tab");
return
}var h={path:"",name:""};
var p=d.getCurrentFolder();
var k=d.getGrid().getSelectionModel();
if(typeof m!="undefined"){try{var i=d.getGrid().getStore().getAt(m);
if(i){h.path=p;
h.name=g.data.name
}}catch(n){}}if((h.path==""||h.name=="")&&k.getCount()==1){var g=d.getGrid().getSelectionModel().getSelected();
if(g){h.path=p;
h.name=g.data.name
}}if(h.path==""||h.name==""){return
}d.globalLoadMask.msg=d.htcConfig.locData.LoadingDetailsMask+"...";
d.globalLoadMask.show();
HttpCommander.Metadata.Load(h,function(s,t){d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(s,t,d.Msg,d.htcConfig,2)){var u=r();
if(u){u.initialize(h,s);
u.show();
u.syncSizeWrap()
}if(!Ext.isEmpty(s.metaerror)){a(s.metaerror)
}}})
},downloadSelectedItems:function(){var i=d.getCurrentFolder();
var h=d.getGrid().getSelectionModel();
if(!h||h.getCount()==0){return
}if(h.getCount()==1&&h.getSelected().data.rowtype=="file"){var g=d.getGrid().getSelectionModel().getSelected();
d.downloadFile(g,i)
}else{if(d.initDownload()){d.getDownloadWindow().hide();
var k=d.createSelectedSet(d.getGrid(),d.getCurrentFolder());
d.globalLoadMask.msg=d.htcConfig.locData.ProgressPrepareDownload+"...";
d.globalLoadMask.show();
HttpCommander.Common.Download(k,function(m,l){d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(m,l,d.Msg,d.htcConfig)){d.getDownloadWindow().show()
}})
}}},viewInService:function(m,l){var t=this,p=Ext.isEmpty(m)?"":String(m).toLowerCase(),s=d.getCurrentFolder(),u=encodeURIComponent((p=="pixlr"&&l)?s:t.getSelectedFilePath()),h=(p=="pixlr"&&l)?null:t.getSelectedFileName(),k=null,g=Ext.id();
if(Ext.isEmpty(u)||Ext.isEmpty(s)){return
}if(!Ext.isFunction(window.handleViewerError)){window.handleViewerError=function(v){if(!Ext.isEmpty(v)){t.showViewerError=true;
d.Msg.hide();
d.Msg.show({title:d.htcConfig.locData.CommonErrorCaption,msg:v,icon:d.Msg.ERROR,buttons:d.Msg.CANCEL})
}}
}if(p=="adobe"){var o=HttpCommander.Lib.Utils.getFileExtension(h);
if(";jpg;jpeg;jpe;jfif;png;".indexOf(";"+o.toLowerCase()+";")<0){if(o.length>0){h=h.substring(0,h.length-o.length)+"png"
}else{h+=".png"
}k='<span style="font-weight:bold;">PNG</span>'
}if(!Ext.isArray(window.adobeEditedImages)){window.adobeEditedImages=[]
}window.adobeEditedImages.push({id:g,filename:h,path:s,newAdobeExt:k});
if(!Ext.isFunction(window.adobeImageSaved)){window.adobeImageSaved=function(w){d.Msg.hide();
t.showViewerError=false;
var A=null,v=null,y=null;
if(!Ext.isEmpty(w)&&Ext.isArray(window.adobeEditedImages)){var x=0,z=window.adobeEditedImages.length;
for(;
x<z;
x++){var B=window.adobeEditedImages[x];
if(B&&!Ext.isEmpty(B.id)&&B.id===w){A=B.filename;
v=B.path;
y=B.newAdobeExt;
break
}}}if(!Ext.isEmpty(A)&&!Ext.isEmpty(v)){d.setSelectPath({name:A,path:v})
}if(!Ext.isEmpty(v)){d.openGridFolder(v)
}if(!Ext.isEmpty(y)){setTimeout(function(){d.Msg.show({title:d.htcConfig.locData.CommandEditInAdobe,msg:String.format(Ext.util.Format.htmlEncode(d.htcConfig.locData.AdobeImageEditorSavedAsNewTypeMessage),y),icon:d.Msg.INFO,buttons:d.Msg.OK})
},200)
}}
}}t.showViewerError=false;
var i=window.open(d.htcConfig.relativePath+"Handlers/Viewer.aspx?path="+u+"&svc="+encodeURIComponent(p)+(p=="pixlr"&&l?("&new="):(p=="adobe"?("&adbid="+encodeURIComponent(g)):"")),"viewerpopup"+(new Date()).getTime(),HttpCommander.Lib.Utils.getPopupProps());
if(i){try{i.focus()
}catch(n){}}var q=!(p=="pixlr"&&l);
var r=window.setInterval(function(){try{if(q){q=false;
d.openTreeRecent()
}if(i==null||i.closed){window.clearInterval(r);
if((p=="zoho"||p=="pixlr"||p=="adobe")&&!t.showViewerError){if(p=="adobe"){if(!Ext.isEmpty(g)&&Ext.isArray(window.adobeEditedImages)){var w=0,x=window.adobeEditedImages.length,v=-1;
for(;
w<x;
w++){var z=window.adobeEditedImages[w];
if(z&&!Ext.isEmpty(z.id)&&z.id===g){v=w;
break
}}}if(v>=0){window.adobeEditedImages.splice(v,1)
}}d.Msg.hide();
t.showViewerError=false;
if(!Ext.isEmpty(h)&&!Ext.isEmpty(s)){d.setSelectPath({name:h,path:s})
}d.openGridFolder(s)
}}}catch(y){window.clearInterval(r);
t.showViewerError=false
}},1000)
},viewInAutodeskImpl:function(g){var h=Ext.Ajax.timeout;
Ext.Ajax.timeout=10*180*1000;
HttpCommander.Common.AutodeskViewInfo(g,function(o,m){Ext.Ajax.timeout=h;
d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(!HttpCommander.Lib.Utils.checkDirectHandlerResult(o,m,d.Msg,d.htcConfig)){return
}if(!Ext.isObject(o.view)||!Ext.isObject(o.token)){return
}d.openTreeRecent();
var k=o.view.URN;
var l=o.token.access_token;
var p=HttpCommander.Lib.Utils.getFileName(g.path);
var n;
var i=function(r,q,t){if(!!n){n.hide()
}var s="";
if(!Ext.isEmpty(q)){s=Ext.util.Format.htmlEncode(q)
}if(!Ext.isEmpty(r)){if(s.length>0){s+=" (error code: "+r+")"
}else{s+="Error code: "+r
}}if(Ext.isArray(t)){Ext.each(t,function(u){if(Ext.isObject(u)){var v=""+Ext.util.Format.htmlEncode(u.code||"");
if(!Ext.isEmpty(u.message)){if(v.length>0){v+="<br />"
}v+=Ext.util.Format.htmlEncode(u.message)
}if(!Ext.isEmpty(v)){if(s.length>0){s+="<br /><br />"
}s+=v
}}})
}if(Ext.isEmpty(s)){s="Unknown error"
}a(s)
};
n=new d.Window({title:Ext.util.Format.htmlEncode(p),closeAction:"close",height:480,width:640,modal:true,plain:true,padding:0,maximizable:true,closable:true,resizable:true,minimizable:false,listeners:{show:function(q){if(d.getView()){q.setSize(Math.floor(d.getView().getWidth()*0.85),Math.floor(d.getView().getHeight()*0.8))
}q.center()
},resize:function(s,q,r){if(Ext.isObject(s.viewer)&&Ext.isFunction(s.viewer.resize)){try{s.viewer.resize()
}catch(t){}}},beforehide:function(q){if(!q.beforeHideInvoked){if(Ext.isObject(q.viewer)&&Ext.isFunction(q.viewer.uninitialize)){d.globalLoadMask.msg=d.htcConfig.locData.ProgressUninitializeAutodeskViewer+"...";
d.globalLoadMask.show();
q.beforeHideInvoked=true;
setTimeout(function(){try{q.viewer.uninitialize()
}catch(r){}d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
q.beforeHideInvoked=true;
q.hide()
},10);
return false
}}},afterrender:function(r){var t=r.body.dom;
var q={document:"urn:"+k,env:"AutodeskProduction",getAccessToken:function(){return l
},refreshToken:function(){return l
}};
var s=new Autodesk.Viewing.Private.GuiViewer3D(t,{});
Autodesk.Viewing.Initializer(q,function(){s.initialize();
r.viewer=s;
Autodesk.Viewing.Document.load(q.document,function(w){var u=w.getRootItem();
var v=[];
v=Autodesk.Viewing.Document.getSubItemsWithProperties(u,{type:"geometry",role:"3d"},true);
if(v.length==0){v=Autodesk.Viewing.Document.getSubItemsWithProperties(u,{type:"geometry",role:"2d"},true)
}if(v.length>0){s.load(w.getViewablePath(v[0]),null,function(){},function(x){i(code,message,errors)
})
}},function(v,u,w){i(v,u,w)
})
})
}}});
n.show()
})
},viewInAutodesk:function(){var g=this;
var h={path:this.getSelectedFilePath()};
if(h.path==""){return
}var i=HttpCommander.Lib.Utils.getFileExtension(h.path);
if(!d.htcConfig.enableAutodeskViewer||HttpCommander.Lib.Consts.autodeskViewerFileTypes.indexOf(";"+i+";")==-1){return
}d.globalLoadMask.msg=d.htcConfig.locData.ProgressGettingAutodeskViewLink+"...";
d.globalLoadMask.show();
if(!Ext.isObject(window.Autodesk)){try{var k=d.htcConfig.autodeskServiceUrl+"viewingservice/v1/viewers/";
HttpCommander.Lib.Utils.includeCssFile({id:"autodeskCss",url:k+"style.css"});
HttpCommander.Lib.Utils.includeJsFile({url:k+"three.min.js",callback:function(){HttpCommander.Lib.Utils.includeJsFile({url:k+"viewer3D.min.js",callback:function(){if(!Ext.isObject(window.Autodesk)){d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
a(Ext.util.Format.htmlEncode(d.htcConfig.locData.AutodeskScriptNotIncludedMessage))
}else{g.viewInAutodeskImpl(h)
}}})
}})
}catch(l){a(l&&!Ext.isEmpty(l.message)?Ext.util.Format.htmlEncode(l.message):Ext.util.Format.htmlEncode(d.htcConfig.locData.AutodeskScriptNotIncludedMessage))
}}else{g.viewInAutodeskImpl(h)
}},getSelectedSingleFileOrFolder:function(m){var h=d.getCurrentFolder(),g=d.getGrid().getSelectionModel(),k,l,i=null;
if(Ext.isNumber(m)){k=d.getGrid().getStore().getAt(m);
if(k){k=k.data
}}else{if(g.getCount()==1){k=g.getSelected().data
}}if(k&&(k.rowtype=="file"||k.rowtype=="folder"||k.rowtype=="rootfolder"||k.rowtype=="uplink")){if(Ext.isEmpty(k.srowtype)){if(Ext.isEmpty(h)||h.toLowerCase()=="root"){l=k.name
}else{if(k.rowtype=="uplink"){l=h
}else{l=h+"/"+k.name
}}}else{if(k.srowtype=="alert"){l=k.name
}}if(Ext.isEmpty(l)){return null
}i={path:l,is_folder:(k.rowtype!="file")};
if(Ext.isObject(k.watchForModifs)&&Ext.isNumber(k.watchForModifs.id)){i.id=k.watchForModifs.id;
i.emails=k.watchForModifs.emails;
i.iown=(k.watchForModifs.iown===true);
i.users=k.watchForModifs.users;
i.actions=k.watchForModifs.actions
}else{if(Ext.isNumber(k.watchForModifs)&&k.watchForModifs>0){i.parentId=k.watchForModifs
}}}return i
},getSelectedFilePath:function(){var k=d.getCurrentFolder();
if(k==""){return""
}var h=d.getGrid().getSelectionModel();
if(h.getCount()==1&&h.getSelected().data.rowtype=="file"){var g=h.getSelected();
var i=g.data.name;
if(i==""){return""
}return k+"/"+i
}return""
},getSelectedFileName:function(){var h=d.getGrid().getSelectionModel();
if(h&&h.getCount()==1&&h.getSelected().data.rowtype=="file"){var g=h.getSelected();
var i=g.data.name;
if(!Ext.isEmpty(i)){return i
}}return null
},editInMsoOoo:function(g,q){var p=this.getSelectedFilePath();
if(p==""){return
}var k=(d.htcConfig.domainNameUrl!=""?d.htcConfig.domainNameUrl:d.getAppRootUrl())+d.htcConfig.identifierWebDav;
var o=g?2:3;
if(o==2&&d.htcConfig.useSSLForMSOffice&&k.match(/^http:/i)){k="https:"+k.substr(5)
}if(!d.htcConfig.anonymousEditingOffice){HttpCommander.Common.AddToRecent({path:p,action:"Edit"},function(r,i){if(!Ext.isEmpty(r)&&r.success){d.openTreeRecent()
}});
q(k+"/"+(d.htcConfig.anonymousEditingOffice?(d.htcConfig.webDavDefaultSuffix+"/"):"")+p,o);
return
}d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoadingEditInOffice+"...";
d.globalLoadMask.show();
var l=p.indexOf("/");
if(l<0){d.globalLoadMask.hide();
return
}var h=p.substr(0,l);
var m=p.substr(l+1);
var n={fullVirtualPath:p,path:h,service:g?"MSOEdit":"OOOEdit",acl:{down:true,up:true,view:true,zip:false,overwrite:true}};
HttpCommander.Common.AnonymLink(n,function(s,r){d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(!HttpCommander.Lib.Utils.checkDirectHandlerResult(s,r,d.Msg,d.htcConfig)){return
}var i=s.link_key;
if(!Ext.isEmpty(i)){d.openTreeRecent();
q(k+"/"+d.htcConfig.webDavAnonymousSuffix+"/"+i+"/"+m,o)
}else{a(d.htcConfig.locData.OfficeAnonymousEditPublicLinkError);
return
}})
},shareFolder:function(l,m){var g=d.getGrid().getSelectionModel().getSelected();
var k=l(g,d.getCurrentFolder());
var i=g?g.data.rowtype=="folder":true;
var h={download:{},upload:{checked:i&&(d.htcConfig.currentPerms&&d.htcConfig.currentPerms.upload&&d.htcConfig.currentPerms.anonymUpload)},view:{checked:i&&(d.htcConfig.currentPerms&&(d.htcConfig.currentPerms.listFiles||d.htcConfig.currentPerms.listFolders)&&d.htcConfig.currentPerms.anonymViewContent)},zip:{checked:i?(d.htcConfig.currentPerms&&d.htcConfig.currentPerms.zipDownload&&d.htcConfig.currentPerms.anonymDownload):false}};
h.download.checked=i?(h.view.checked&&d.htcConfig.currentPerms&&d.htcConfig.currentPerms.download&&d.htcConfig.currentPerms.anonymDownload):true;
h.download.disabled=!i||!h.download.checked;
h.upload.disabled=!i||!h.upload.checked;
h.view.disabled=!i||!h.view.checked;
h.zip.disabled=!i||!h.zip.checked;
h.modify=d.htcConfig.currentPerms&&d.htcConfig.currentPerms.modify;
h.upload.checked=false;
m(k,i,h)
},webFolders:function(h){var k=d.getCurrentFolder();
var g=d.getGrid().getSelectionModel().getSelected();
var l=(d.htcConfig.domainNameUrl!=""?d.htcConfig.domainNameUrl:d.getAppRootUrl())+d.htcConfig.identifierWebDav+"/"+(d.htcConfig.anonymousEditingOffice?(d.htcConfig.webDavDefaultSuffix+"/"):"");
var m=k.toLowerCase()==="root"?((g&&g.data.rowtype=="rootfolder")?g.data.name:""):k;
var i="";
if(g&&g.data.rowtype=="folder"){i=g.data.name
}h(l,m,i)
},syncWebFolders:function(l){var i=d.getCurrentFolder();
var g=d.getGrid().getSelectionModel().getSelected();
var k=(d.htcConfig.domainNameUrl!=""?d.htcConfig.domainNameUrl:d.getAppRootUrl())+d.htcConfig.identifierWebDav+"/"+(d.htcConfig.anonymousEditingOffice?(d.htcConfig.webDavDefaultSuffix+"/"):"");
var m=i.toLowerCase()==="root"?((g&&g.data.rowtype=="rootfolder")?g.data.name:""):i;
var h="";
if(g&&g.data.rowtype=="folder"){h=g.data.name
}l(k,m,h)
},newItemFromTemplate:function(i){if(i.itemId&&i.itemId!=""&&i.itemFileName&&i.text){var h=i.itemId.substring(4);
var g=String.format(d.htcConfig.locData.CommonFileTypeNameCaption,i.text);
f({title:g,prompt:g,newName:i.itemFileName,callback:function(m,k){var l=d.getCurrentFolder();
if(!d.isExtensionAllowed(m)){a(d.getRestrictionMessage());
return
}var n={};
n.path=l;
n.type=h;
n.newName=m;
n.tmpName=i.itemFileName;
if(k&&Ext.isFunction(k.hide)){k.hide()
}b.createNewItemImpl(n)
}})
}},versionHistory:function(h,g){if(!g){return
}g.hide();
d.globalLoadMask.msg=d.htcConfig.locData.VersionHistoryObtainingMessage+"...";
d.globalLoadMask.show();
HttpCommander.Common.GetVersionHistory(h,function(k,i){d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(k,i,d.Msg,d.htcConfig)){if(!k.vhist||k.vhist.length<1){a(d.htcConfig.locData.NoVersionHistoryMessage);
return
}g.initialize(String.format(d.htcConfig.locData.VersionHistoryTitle,Ext.util.Format.htmlEncode(h.name)),k.isUSA,k.vhist,h.path,h.name);
g.show()
}})
},checkOut:function(g){d.globalLoadMask.msg=d.htcConfig.locData.CheckingOutMessage+"...";
d.globalLoadMask.show();
HttpCommander.Common.CheckOut(g,function(i,h){d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(!HttpCommander.Lib.Utils.checkDirectHandlerResult(i,h,d.Msg,d.htcConfig)){if(typeof i!="undefined"){d.openGridFolder(g.path)
}}else{d.showBalloon(String.format(d.htcConfig.locData.SuccessfullyCheckedOutMessage,Ext.util.Format.htmlEncode(g.name),Ext.util.Format.htmlEncode(d.htcConfig.currentUser)));
d.openGridFolder(g.path)
}})
},undoCheckOut:function(g){d.Msg.confirm(d.htcConfig.locData.CommandUndoCheckOut,d.htcConfig.locData.FileUndoCheckOutConfirmMessage,function(h){if(h=="yes"){d.globalLoadMask.msg=d.htcConfig.locData.UndoCheckingOutMessage+"...";
d.globalLoadMask.show();
HttpCommander.Common.UnCheckOut(g,function(k,i){d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(!HttpCommander.Lib.Utils.checkDirectHandlerResult(k,i,d.Msg,d.htcConfig)){if(typeof k!="undefined"){d.openGridFolder(g.path)
}}else{d.showBalloon(String.format(d.htcConfig.locData.SuccessfullyUndoCheckedOutMessage,Ext.util.Format.htmlEncode(g.name)));
d.openGridFolder(g.path)
}})
}})
},selectAll:function(g){var k,i,h;
g=g||d.getGrid();
if(!g||!Ext.isFunction(g.getSelectionModel)){return
}k=g.getSelectionModel();
if(!k){return
}k.silent=true;
k.selectAll();
k.silent=false;
if(k.isLocked()){return
}i=k.lastActive;
h=g.getStore().getAt(i);
if(h&&k.fireEvent("beforerowselect",k,i,true,h)!==false){k.fireEvent("rowselect",k,i,h);
k.fireEvent("selectionchange",k)
}},invertSelection:function(m){m=m||d.getGrid();
var p,k,g,l,n=-1,h=-1,o;
if(!m||!Ext.isFunction(m.getSelectionModel)){return
}p=m.getSelectionModel();
if(!p){return
}k=m.getStore();
g=k.getCount();
p.silent=true;
for(l=0;
l<g;
l++){if(p.isSelected(l)){p.deselectRow(l);
n=l
}else{p.selectRow(l,true);
if(p.isSelected(l)){h=l
}}}p.silent=false;
if(h>=0){o=k.getAt(h);
if(!!o&&p.fireEvent("beforerowselect",p,h,true,o)!==false){p.fireEvent("rowselect",p,h,o);
p.fireEvent("selectionchange",p)
}}else{if(n>=0){o=k.getAt(n);
if(!!o){p.fireEvent("rowdeselect",p,n,o);
p.fireEvent("selectionchange",p)
}}}},zipContent:function(l){var h=d.getGrid().getSelectionModel().getSelected();
var k=d.getCurrentFolder();
var i={path:k,name:h.data.name};
var g=l();
if(g){g.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressZipContents+"...";
d.globalLoadMask.show();
HttpCommander.Common.ZipContents(i,function(n,m){d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(n,m,d.Msg,d.htcConfig)){g.setTitle(String.format(d.htcConfig.locData.ArchiveContentsTitle,Ext.util.Format.htmlEncode(i.name)));
g.setZipFileInfo(i);
g.setContentTree(n.totalNodes,n.nodes);
g.show()
}})
}},zip:function(){var g=d.createSelectedSet(d.getGrid(),d.getCurrentFolder());
g.zipDownload=false;
d.initAndShowZipPromptWindow(g)
},zipDownload:function(){var h=d.getCurrentFolder();
var i=d.createSelectedSet(d.getGrid(),h);
var g=new Date();
i.name="selected_files_"+g.getFullYear()+(g.getMonth()+1)+g.getDate()+"_"+g.getHours()+g.getMinutes()+g.getSeconds()+".zip";
i.zipDownload=true;
i.noCompress=true;
var k=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.zipRequestTimeout;
d.globalLoadMask.msg=d.htcConfig.locData.ProgressZipping+"...";
d.globalLoadMask.show();
HttpCommander.Common.Zip(i,function(p,n){Ext.Ajax.timeout=k;
d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(p,n,d.Msg,d.htcConfig)){var m=d.htcConfig.relativePath+"Handlers/Download.ashx?action=download&delete=true&file="+encodeURIComponent(h+"/"+p.filename);
if(!Ext.isIE){window.location.href=m
}else{var q='HttpCommander.Main.FileManagers["'+d.getUid()+'"].downloadDialog';
var l=String.format("<a href='{0}' onclick='if("+q+"){"+q+".hide();delete "+q+";}'>{1}</a>",m,d.htcConfig.locData.DownloadIEClickHere);
var o=String.format(d.htcConfig.locData.DownloadIEArchiveReady,Ext.util.Format.htmlEncode(i.name));
o+=". "+l;
d.getFileManager().downloadDialog=d.Msg.show({title:d.htcConfig.locData.DownloadIECaption,msg:o,fn:function(r){var s={};
s.path=i.path;
s.name=p.filename;
HttpCommander.Common.Cleanup(s,function(u,t){})
}})
}}})
},pasteTo:function(g,h,i){b.paste(null,d.clipboard,h.attributes.path,i)
},paste:function(n,i,k,m){var p=!Ext.isEmpty(k)&&!!m;
var o=p?k:d.getCurrentFolder();
var g=o;
if(n){var h=d.getGrid().getSelectionModel().getSelected();
if(typeof h!="undefined"&&h.data.rowtype=="folder"){g+="/"+h.data.name
}}i.newPath=g;
if(d.getAsControl()){i.control=true
}d.globalLoadMask.msg=i.isCut?d.htcConfig.locData.ProgressMoving+"...":d.htcConfig.locData.ProgressCopying+"...";
d.globalLoadMask.show();
var l=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
HttpCommander.Common.Paste(i,function(t,r){Ext.Ajax.timeout=l;
d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(typeof t=="undefined"){a(Ext.util.Format.htmlEncode(r.message));
return
}var s="";
if(t.filesProcessed>0){s+=String.format(i.isCut?d.htcConfig.locData.BalloonFilesMoved:d.htcConfig.locData.BalloonFilesCopied,t.filesProcessed)
}if(t.foldersProcessed>0){if(s!=""){s+="<br />"
}s+=String.format(i.isCut?d.htcConfig.locData.BalloonFoldersMoved:d.htcConfig.locData.BalloonFoldersCopied,t.foldersProcessed)
}var v=i.filesCount-t.filesProcessed;
if(v>0){if(s!=""){s+="<br />"
}s+=String.format(d.htcConfig.locData.BalloonFilesFailed,v)
}var q=i.foldersCount-t.foldersProcessed;
if(q>0){if(s!=""){s+="<br />"
}s+=String.format(d.htcConfig.locData.BalloonFoldersFailed,q)
}if(!t.success){a(t.message)
}else{var u=i.srcPath;
if(t.foldersProcessed>0&&u&&i.isCut&&t.warning!==true){d.reloadTreeNodeIfOpened(u)
}}d.showBalloon(s);
if(t.warning===true){d.showRefreshWarning()
}else{if(!Ext.isEmpty(t.firstname)&&!Ext.isEmpty(t.pathto)){d.setSelectPath({name:t.firstname,path:t.pathto})
}if(t.foldersProcessed>0){d.openGridFolder(Ext.isEmpty(t.pathto)?g:t.pathto,true,true)
}else{d.openGridFolder(Ext.isEmpty(t.pathto)?g:t.pathto)
}if(p&&!!m){m.hide()
}}if(i.isCut||p){i.clear()
}})
},runShortcut:function(){var g=d.getGrid().getSelectionModel().getSelected();
d.initAndShowShortcutWindow(g,d.getCurrentFolder())
},viewFile:function(){var g=d.getGrid().getSelectionModel().getSelected();
d.viewFile(g,d.getCurrentFolder())
},imagesPreview:function(){var g=d.getGrid().getSelectionModel().getSelected();
var h=d.initImagesViewer();
if(h){h.showImageViewer(g,d.getCurrentFolder(),d.getGrid().getStore())
}},flashPreview:function(){var g=d.getGrid().getSelectionModel().getSelected();
var h=d.initFlashViewer();
if(h){h.getFlashSize(d.getCurrentFolder(),g.data.name)
}},editFile:function(){var g=d.getGrid().getSelectionModel().getSelected();
var h=d.initEditTextFileWindow();
var i=false;
if(h){if(d.htcConfig.currentPerms&&(!d.htcConfig.currentPerms.modify||((d.htcConfig.enableMSOfficeEdit||d.htcConfig.enableOpenOfficeEdit||d.htcConfig.enableWebFoldersLinks)&&g.data.locked))){i=true
}h.loadTextFile(g,d.getCurrentFolder(),i)
}},linkToFileFolder:function(){var g=d.getGrid().getSelectionModel().getSelected();
var h=d.virtualFilePath(g,d.getCurrentFolder());
d.prepareAndShowLinkToFileFolderWindow(h,g?g.data.rowtype=="folder":true)
},sendEmail:function(){if(!Ext.isDefined(d.htcConfig.enableSendEmail)||d.htcConfig.enableSendEmail=="disable"){return
}var g=d.initSendEmail();
if(g){g.initialize();
g.show()
}},sendEmailWithService:function(B){if(!Ext.isDefined(d.htcConfig.enableSendEmail)||d.htcConfig.enableSendEmail=="disable"){return
}B=B||"gmail";
var A=d.getSelectedFiles(),s=A.files,r=s.length,q=A.folders,o=q.length,y=(d.htcConfig.currentPerms&&d.htcConfig.currentPerms.download&&r>0&&d.htcConfig.enableLinkToFile==true),k=(o>0&&d.htcConfig.enableLinkToFolder==true),l,w="",h=2048,p=encodeURIComponent("\n\n"),t,v,u,g;
var m=(y||k)&&((d.htcConfig.enableSendEmail=="any")||(d.htcConfig.enableSendEmail=="linksonly"));
switch(B){case"outlook":l="https://outlook.live.com/?path=/mail/action/compose&body=";
break;
default:l="https://mail.google.com/mail/?view=cm&fs=1&ui=2&body=";
h=8192;
break
}if(m){var z=d.getCurrentFolder();
if(y){v=s.length;
for(t=0;
t<v;
t++){u=s[t];
g=(t==0?"":p)+encodeURIComponent(d.linkToFileByName(u,z).replace(/&action=download/gi,""));
if((l+g).length>=h){break
}l+=g
}}if(k&&l.length<h){v=q.length;
for(t=0;
t<v;
t++){u=q[t];
g=(t==0?"":p)+encodeURIComponent(d.linkToFolderByName(u,z).replace(/&action=download/gi,""));
if((l+g).length>=h){break
}l+=g
}}}var n=window.open(l,"linkssend"+B,HttpCommander.Lib.Utils.getPopupProps(600,500));
if(n){try{n.focus()
}catch(x){}}},videoConvert:function(){var g=d.getGrid().getSelectionModel().getSelected();
var h=d.createVideoConvertWindow();
if(h){h.prepare(g,d.getCurrentFolder());
h.show()
}},playVideoFlash:function(){var g=d.getGrid().getSelectionModel().getSelected();
var h=d.createPlayVideoFlashWindow();
if(h){h.playVideoFile(g,d.getCurrentFolder())
}},playVideoJS:function(){var g=d.getGrid().getSelectionModel().getSelected();
var h=d.createPlayVideoJSWindow();
if(h){h.playVideoFile(g,d.getCurrentFolder())
}},playVideoHTML5:function(){var h=d.getGrid().getSelectionModel().getSelected();
var g=d.createPlayVideoHtml5Window();
if(g){g.playVideoFile(h,d.getCurrentFolder())
}},playAudioHTML5:function(){var g=d.getGrid().getSelectionModel().getSelected();
var h=d.createPlayAudioHtml5Window();
if(h){h.playFile(g,d.getCurrentFolder())
}}};
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.GoogleDriveAuth=function(y){var i=HttpCommander.Lib.Consts.CloudNames.google,x=y.htcConfig.googleClientId,c=["https://www.googleapis.com/auth/drive"],m=null,z=null,A,h,e,o,B=HttpCommander.Lib.Utils.browserIs,t=false,q="application/vnd.google-apps.folder",g="mimeType = '"+q+"'",b=null,p=String.format(y.htcConfig.locData.CloudLibraryNotLoadedMsg,i),k=y.htcConfig.locData.CloudAuthNotCompleteMsg,D=(B.ie||B.edge)?(y.htcConfig.locData.CloudTrustedSitesMsg+"https://*.google.com<br />https://oauth.googleusercontent.com<br />https://*.gstatic.com<br />https://*.googleapis.com<br />"+(B.edge?("<br />("+y.htcConfig.locData.TrustedSitesForMicrosoftEdge+")"):"")):"";
if(Ext.isEmpty(D)){var a=k.toLowerCase().lastIndexOf("<br />");
if(a>0){k=k.substring(0,a)
}}var v=function(K,E,F){var J={},I=null;
if(E){I=g
}if(F){if(I&&I.length>0){I+=" and "
}else{I=""
}I+="'"+F+"' in parents"
}if(I){J.q=I
}J.orderBy="folder,title";
var G=function(M,L){M.execute(function(O){L=L.concat(O.items);
var N=O.nextPageToken;
if(N){J.pageToken=N;
M=gapi.client.drive.files.list(J);
G(M,L)
}else{y.globalLoadMask.hide();
y.globalLoadMask.msg=y.htcConfig.locData.ProgressLoading+"...";
if(L.length==1&&typeof L[0]=="undefined"){L=[]
}if(typeof K=="function"){K(L)
}}})
};
y.globalLoadMask.show();
var H=gapi.client.drive.files.list(J);
G(H,[])
};
var n=function(I,E,F,H){if(H===true){if(z){I(m)
}else{var G=gapi.client.drive.about.get();
y.globalLoadMask.show();
G.execute(function(J){z=J;
y.globalLoadMask.hide();
if(typeof I=="function"){I(m)
}})
}}else{if(F||(z&&(F=z.rootFolderId))){v(I,E,F)
}else{var G=gapi.client.drive.about.get();
y.globalLoadMask.show();
G.execute(function(J){z=J;
y.globalLoadMask.hide();
if(typeof I=="function"){I([{id:z.rootFolderId}])
}})
}}};
var r=function(H,E,F,G){if(!gapi.client.drive||!gapi.client.drive.files){y.globalLoadMask.msg=String.format(y.htcConfig.locData.CloudLoadMsg,i)+"...";
y.globalLoadMask.show();
gapi.client.load("drive","v2",function(){y.globalLoadMask.hide();
n(H,E,F,G)
})
}else{n(H,E,F,G)
}};
var l=function(H,G){var I=!Ext.isBoolean(G);
d();
y.globalLoadMask.hide();
y.globalLoadMask.msg=y.htcConfig.locData.ProgressLoading+"...";
var E=I?e:(G?h:A);
if(H&&!H.error){m=H;
if(I){r(E,1,null,true)
}else{r(E,!G)
}}else{m=null;
var F;
if(H&&H.error){F=Ext.util.Format.htmlEncode(H.error)
}if(E){E(null,F)
}}};
var u=function(E){l(E,false)
};
var w=function(E){l(E,true)
};
var C=function(E){l(E,1)
};
var d=function(){if(b){try{clearTimeout(b)
}catch(E){}}b=null
};
var f=function(E){y.Msg.show({title:y.htcConfig.locData.CommonErrorCaption,msg:E,icon:y.Msg.ERROR,buttons:y.Msg.OK})
};
var s=function(E,G,L){var J=!Ext.isBoolean(G);
if(typeof gapi!="undefined"&&t&&((!J&&y.htcConfig.isAllowedGoogleDrive)||(J&&y.htcConfig.enableGoogleEdit))){if(J){e=L
}else{if(G){h=L
}else{A=L
}}if(y.htcConfig.isHostedMode){if(!!window.addEventListener){window.addEventListener("message",function(N){if(~N.origin.indexOf("https://ownwebdrive.com")&&N.data.google){var M=N.data.google;
gapi.auth.setToken(M);
o.handleAuthResult(gapi.auth.getToken(),G)
}})
}else{if(!!window.attachEvent){window.attachEvent("onmessage",function(N){if(~N.origin.indexOf("https://ownwebdrive.com")&&N.data.google){var M=N.data.google;
gapi.auth.setToken(M);
o.handleAuthResult(gapi.auth.getToken(),G)
}})
}}if(!gapi.auth.getToken()){var K=window.open("https://"+window.location.hostname.substring(window.location.hostname.indexOf(".")+1,window.location.hostname.length).toLowerCase()+"/googledrive-callback.html?domain="+encodeURIComponent(window.location.href)+"&uploaddownload=true","googleeditpopup"+(new Date()).getTime(),HttpCommander.Lib.Utils.getPopupProps());
if(K){try{K.focus()
}catch(I){}}}}var F=(E===true);
y.globalLoadMask.hide();
d();
y.globalLoadMask.msg=String.format(y.htcConfig.locData.CloudCheckAuthMsg,i)+"...";
if(!y.isDemoMode()||(E===true)){y.globalLoadMask.show()
}if(F){l(gapi.auth.getToken(),G)
}else{gapi.auth.authorize({client_id:x,scope:c,immediate:F},J?C:(G?w:u));
b=setTimeout(function(){y.globalLoadMask.hide();
y.globalLoadMask.msg=y.htcConfig.locData.ProgressLoading+"...";
if(b){d();
if(F){var M=k+D;
if(L){L(null,M,true)
}else{f(M)
}}}else{d()
}},15000)
}}else{if(y.htcConfig.isAllowedGoogleDrive&&((J&&y.htcConfig.enableGoogleEdit)||(!J&&G&&y.htcConfig.enableUploadFromGoogle)||(!J&&!G&&y.htcConfig.enableDownloadToGoogle))){y.globalLoadMask.hide();
d();
if(t){f(p+D);
return
}y.globalLoadMask.msg=String.format(y.htcConfig.locData.CloudCheckAuthMsg,i)+"...";
y.globalLoadMask.show();
if(typeof window.googleHandleAPILoaded=="undefined"){window.googleHandleAPILoaded=function(){t=true;
o.checkAuth(E,G,L)
}
}var H=null;
HttpCommander.Lib.Utils.includeJsFile({url:"https://apis.google.com/js/client.js?onload=googleHandleAPILoaded",callback:function(){window.clearTimeout(H);
if(t){return
}y.globalLoadMask.hide();
y.globalLoadMask.msg=y.htcConfig.locData.ProgressLoading+"...";
if(typeof gapi=="undefined"){f(p+D)
}}});
H=window.setTimeout(function(){window.clearTimeout(H);
if(t){return
}y.globalLoadMask.hide();
y.globalLoadMask.msg=y.htcConfig.locData.ProgressLoading+"...";
if(typeof gapi=="undefined"){f(p+D)
}else{window.googleHandleAPILoaded()
}},15000)
}}};
return(o={checkAuth:s,getAuthInfo:function(){return m
},getAboutInfo:function(){return z
},getFileList:r,handleAuthResult:l,setAuthAboutInfos:function(G){if(Ext.isObject(G)){if(Ext.isObject(G.auth)){var E=Ext.apply({},G.auth);
if(Ext.isObject(window.gapi)&&gapi.auth&&Ext.isFunction(gapi.auth.setToken)){try{gapi.auth.setToken(E)
}catch(F){}}m=Ext.apply({},E)
}if(Ext.isObject(G.about)){z=Ext.apply({},G.about)
}}},clearAuth:function(){m=null;
z=null
},signOut:function(J){if(gapi&&gapi.auth){if(typeof gapi.auth.signOut=="function"){gapi.auth.signOut()
}if(typeof gapi.auth.setToken=="function"){gapi.auth.setToken(null)
}}o.clearAuth();
var F=Ext.id(),H=document,I=H.createElement("iframe"),E=function(){if(!I){I=H.getElementById(F)
}if(I){H.body.removeChild(I)
}if(typeof J=="function"){J()
}};
if(I.attachEvent){I.attachEvent("onload",E)
}else{I.onload=E
}Ext.fly(I).set({id:F,name:F,cls:"x-hidden",src:"https://accounts.google.com/logout"});
H.body.appendChild(I);
if(Ext.isIE){try{document.frames[F].name=F
}catch(G){}}}})
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.GoogleTreeLoader=Ext.extend(Ext.tree.TreeLoader,{onlyFolders:false,api:null,load:function(b,c,a){if(this.clearOnLoad){while(b.firstChild){b.removeChild(b.firstChild)
}}if(this.doPreload(b)){this.runCallback(c,a||b,[b])
}else{if(this.api||this.directFn||this.dataUrl||this.url){this.requestData(b,c,a||b)
}}},googleTypes:["application/vnd.google-apps.folder","application/vnd.google-apps.document","application/vnd.google-apps.spreadsheet","application/vnd.google-apps.presentation","application/pdf","application/vnd.google-apps.drawing","application/vnd.google-apps.form"],requestData:function(d,f,b){if(this.fireEvent("beforeload",this,d,f)!==false){if(this.api){var e=this,c={callback:f,node:d,scope:b},a=this.googleTypes;
e.api.getFileList(function(k,h,g){if(k&&Ext.isArray(k)){var i=[];
Ext.each(k,function(n,l,m){if(n&&n.mimeType!=a[6]&&(!n.labels||!n.labels.trashed)){d={text:n.title,leaf:n.mimeType!=a[0],checked:false};
if(d.leaf){d.file=true;
d.type=a.indexOf(n.mimeType);
if(d.type<1){d.type=0;
if(n.iconLink){d.icon=n.iconLink
}}else{d.icon=e.htcConfig.relativePath+"Images/gtype"+d.type+".png"
}d.iconCls="google-tree-node-icon"
}d=Ext.copyTo(d,n,"id downloadUrl title exportLinks mimeType");
i.push(d)
}});
e.handleResponse.apply(e,[{responseData:i,argument:c}])
}else{e.handleFailure.apply(e,[{error:h,argument:c}])
}},e.onlyFolders,d&&d.parentNode?d.id:(d.googleId?d.googleId:undefined))
}}else{this.runCallback(f,b||d,[])
}}});
HttpCommander.Lib.EditorGoogleWindow=function(c){var d=HttpCommander.Lib.Consts.CloudNames.google,b,a=["ppt","pps","ppsx","ppsm","pptm"];
b=new c.Window({title:c.htcConfig.locData.CommandEditInGoogle,bodyStyle:"padding: 5px",layout:"fit",width:400,plain:true,minWidth:320,minHeight:200,height:200,buttonAlign:"center",closeAction:"hide",collapsible:false,minimizable:false,closable:true,resizable:false,maximizable:false,modal:true,items:[{xtype:"label",hideLabel:true,autoHeight:true,margins:"0 0 5 0",html:String.format(c.htcConfig.locData.CloudAuthenticateMessage,d,String.format(c.htcConfig.locData.CloudAuthenticateLink,d),"<br /><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(c,"googledocs")+"'/>&nbsp;"+HttpCommander.Lib.Utils.getHelpLinkOpenTag(c.getUid(),"googledrive"),"</a>")+"<br /><br /><br /><div style='text-align:center;width:100%;'><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(c,"googledocs")+"'>&nbsp;<a id='"+c.getUid()+"_authGoogleEdit_link' href='#' target='_self'>"+String.format(c.htcConfig.locData.CloudAuthenticateLink,d)+"</a>"+(c.isDemoMode()&&!Ext.isEmpty(window.GoogleDemoName)&&!Ext.isEmpty(window.GoogleDemoPass)?('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.GoogleDemoName+'" />&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.GoogleDemoPass+'" /></span>'):"")+"</div>"}],buttons:[{text:c.htcConfig.locData.CommonButtonCaptionCancel,handler:function(){b.hide()
}}],listeners:{afterrender:function(e){var f=document.getElementById(c.getUid()+"_authGoogleEdit_link");
if(f){f.onclick=function(){c.getGoogleDriveAuth().checkAuth(false,1,function(g,h){if(g&&!h){b.hide();
if(b.deleteDoc===true){b.deleteDocFromGoogle((b.docInfo||{}).id,(b.docInfo||{}).title)
}else{b.getEditedDocFromGoogle(b.waitId,b.docInfo,b.curFolder,b.fileName,b.create)
}}else{b.show();
if(h){c.Msg.show({title:c.htcConfig.locData.CommonErrorCaption,msg:h,icon:c.Msg.ERROR,buttons:c.Msg.OK})
}}});
return false
}
}}},deleteDocFromGoogle:function(e,f){c.Msg.hide();
b.hide();
b.deleteDoc=true;
b.docInfo=null;
b.curFolder=null;
b.fileName=null;
b.create=null;
if(!c.htcConfig.enableGoogleEdit||Ext.isEmpty(e)){return
}b.docInfo={id:e,title:f};
var g=c.getGoogleDriveAuth();
if(!Ext.isObject(g)){b.show();
return
}g.checkAuth(true,1,function(h,i){if(h&&!i){b.hide();
try{var k=gapi.client.drive.files["delete"]({fileId:e});
k.execute(function(m){if(Ext.isObject(m)&&Ext.isObject(m.error)){if(b.deleteDoc===true&&Ext.isObject(b.docInfo)){if(reps.error.code==401){b.show()
}if(m.error.code!=403&&reps.error.code!=401&&!Ext.isEmpty(m.error.message)){c.Msg.show({title:c.htcConfig.locData.CommonErrorCaption,msg:Ext.util.Format.htmlEncode(m.error.message),icon:c.Msg.ERROR,buttons:c.Msg.OK})
}}}})
}catch(l){if(l&&!Ext.isEmpty(l.message)){c.Msg.show({title:c.htcConfig.locData.CommonErrorCaption,msg:Ext.util.Format.htmlEncode(l.message),icon:c.Msg.ERROR,buttons:c.Msg.OK})
}}}else{b.show();
if(i){c.Msg.show({title:c.htcConfig.locData.CommonErrorCaption,msg:i,icon:c.Msg.ERROR,buttons:c.Msg.OK})
}}})
},getEditedDocFromGoogle:function(f,t,w,x,o,h){b.waitId=null;
b.docInfo=null;
b.curFolder=null;
b.fileName=null;
b.create=null;
b.deleteDoc=null;
c.Msg.hide();
b.hide();
if(!c.htcConfig.enableGoogleEdit||!Ext.isObject(t)||Ext.isEmpty(t.id)){return
}b.docInfo=Ext.apply({},t);
b.curFolder=w;
b.fileName=x;
b.create=o;
b.waitId=f;
var y=c.getGoogleDriveAuth();
if(!Ext.isObject(y)){b.show();
return
}var n=y.getAuthInfo();
if(!n||!n.access_token){b.show();
return
}var u=y.getAboutInfo();
var i={token:n.access_token,path:w,edit:true,create:o,gdocs:[{name:x,id:t.id,newName:!Ext.isEmpty(t.newName)?t.newName:null,link:t.downloadUrl,ext:""}],folders:[],rename:o,notdel:(h===true)};
var m=HttpCommander.Lib.Utils.getFileExtension(x);
var g=HttpCommander.Lib.Utils.checkAndGetNewExtensionConvertedFromGoogle(m);
var s=null;
if(Ext.isObject(t.exportLinks)){if(Ext.isEmpty(t.downloadUrl)){for(var r in t.exportLinks){if(t.exportLinks.hasOwnProperty(r)){if(Ext.isEmpty(s)){s=r
}var q=t.exportLinks[r];
var e=null;
if(!Ext.isEmpty(q)){var l=q.lastIndexOf("=");
if(l>=0&&l+1<q.length){e=q.substring(l+1).toLowerCase();
if((m==e)||(g==e)){i.gdocs[0].link=q;
break
}}}}}}if(Ext.isEmpty(i.gdocs[0].link)&&!Ext.isEmpty(s)){var q=t.exportLinks[s];
if(!Ext.isEmpty(q)){var l=q.lastIndexOf("=");
if(l>=0&&l+1<q.length){q=q.substring(0,l+1)+m;
i.gdocs[0].ext=q.substring(l+1).toLowerCase()
}i.gdocs[0].link=q
}}}var k=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
c.globalLoadMask.msg=String.format(c.htcConfig.locData.CloudUploadProgressMessage,d)+"...";
c.globalLoadMask.show();
HttpCommander.GoogleDrive.UploadDocs(i,function(D,A){Ext.Ajax.timeout=k;
c.globalLoadMask.hide();
c.globalLoadMask.msg=c.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(D,A,c.Msg,c.htcConfig,0,function(){if(D.needAuth===true){b.show()
}})){var z=D.editNewName;
if(!Ext.isEmpty(z)&&!Ext.isEmpty(f)){if(Ext.isArray(window.lastEditedGoogleDoc)){var v,B,p=window.lastEditedGoogleDoc.length;
for(v=0;
v<p;
v++){B=window.lastEditedGoogleDoc[v]||{};
if(B.id===f&&Ext.isObject(B.doc)){B.doc.newName=z;
window.lastEditedGoogleDoc[v]=B;
break
}}}}if(!Ext.isEmpty(D.editNewName)){c.setSelectPath({name:D.editNewName,path:w})
}c.openTreeRecent();
c.openGridFolder(w);
var C=String.format(c.htcConfig.locData.BalloonFilesUploaded,D.filesSaved);
if(D.filesRejected>0){C+="<br />"+String.format(c.htcConfig.locData.BalloonFilesNotUploaded,D.filesRejected)
}if(D.errors&&D.errors!=""){C+="<br />"+D.errors
}c.showBalloon(C)
}})
}});
return b
};
HttpCommander.Lib.DownloadToGoogleWindow=function(c){var h=HttpCommander.Lib.Consts.CloudNames.google,b,a,f,g,d,e;
b=new c.Window({title:c.htcConfig.locData.CommandDownloadToGoogleDocs,bodyStyle:"padding: 5px",layout:"fit",width:400,plain:true,minWidth:320,minHeight:200,height:300,buttonAlign:"center",closeAction:"hide",collapsible:false,minimizable:false,closable:true,resizable:true,maximizable:true,modal:true,items:[{xtype:"label",hideLabel:true,autoHeight:true,margins:"0 0 5 0",html:String.format(c.htcConfig.locData.CloudAuthenticateMessage,h,String.format(c.htcConfig.locData.CloudAuthenticateLink,h),"<br /><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(c,"googledocs")+"'/>&nbsp;"+HttpCommander.Lib.Utils.getHelpLinkOpenTag(c.getUid(),"googledrive"),"</a>")+"<br /><br /><br /><div style='text-align:center;width:100%;'><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(c,"googledocs")+"'>&nbsp;<a id='"+c.getUid()+"_authGoogleDown_link' href='#' target='_self'>"+String.format(c.htcConfig.locData.CloudAuthenticateLink,h)+"</a>"+(c.isDemoMode()&&!Ext.isEmpty(window.GoogleDemoName)&&!Ext.isEmpty(window.GoogleDemoPass)?('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.GoogleDemoName+'" />&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.GoogleDemoPass+'" /></span>'):"")+"</div>"},a=new Ext.form.Label({html:String.format(c.htcConfig.locData.CloudSelectFolderMessage,h),hidden:true}),f=new Ext.form.Checkbox({hidden:true,checked:true,boxLabel:String.format(c.htcConfig.locData.GoogleDriveConvertMsg,'<a href="https://support.google.com/drive/answer/49008" target="_blank">',"</a>")}),g=new Ext.Panel({layout:"fit",height:230,hidden:true,anchor:"100%",tbar:new Ext.Toolbar({enableOverflow:true,items:[{icon:HttpCommander.Lib.Utils.getIconPath(c,"gdrefresh"),text:c.htcConfig.locData.CommandRefresh,handler:function(){c.getGoogleDriveAuth().clearAuth();
b.prepare(true)
}},"-",{icon:HttpCommander.Lib.Utils.getIconPath(c,"googledocs"),text:h,tooltip:'<b><img align="absmiddle" width="16" height="16" src="'+HttpCommander.Lib.Utils.getIconPath(c,"googledocs")+'">&nbsp;'+String.format(c.htcConfig.locData.CloudLinkText,h)+"</b><br/>"+String.format(c.htcConfig.locData.CloudLinkDescription,h),scope:this,handler:function(){window.open("https://drive.google.com/")
}},"->",{text:String.format(c.htcConfig.locData.CloudSignInAsDifferentUserText,h),handler:function(){c.getGoogleDriveAuth().signOut(function(){b.switchView(false)
})
}}]}),items:[e=new Ext.tree.TreePanel({root:{text:String.format(c.htcConfig.locData.CloudRootFolderName,h),expaded:false,checked:false},hidden:true,useArrows:true,autoScroll:true,header:false,flex:1,anchor:"100%",lines:false,loader:d=new HttpCommander.Lib.GoogleTreeLoader({htcConfig:c.htcConfig,onlyFolders:true,api:c.getGoogleDriveAuth(),listeners:{beforeload:function(k,i){},load:function(l,k,i){c.globalLoadMask.hide();
c.globalLoadMask.msg=c.htcConfig.locData.ProgressLoading+"..."
},loadexception:function(l,k,i){c.globalLoadMask.hide();
c.globalLoadMask.msg=c.htcConfig.locData.ProgressLoading+"...";
c.Msg.show({title:c.htcConfig.locData.CommonErrorCaption,msg:i&&i.error?Ext.util.Format.htmlEncode(i.error):c.htcConfig.locData.CommonLoadError,icon:c.Msg.ERROR,buttons:c.Msg.OK})
}}}),listeners:{load:function(i){if(i&&(i.isRoot||!i.parentNode)){var k=i.getUI?i.getUI():null;
if(k&&k.toggleCheck){k.toggleCheck(true)
}else{i.checked=true
}}if(i&&i.childNodes){Ext.each(i.childNodes,function(l){l.setText(Ext.util.Format.htmlEncode(l.attributes.title))
})
}},click:function(k){var i=k.getUI();
if(i){i.toggleCheck()
}},render:function(i){i.on("checkchange",b.checkChangeGoogleFolders)
}}})]})],buttons:[{text:c.htcConfig.locData.CommonButtonCaptionContinue,hidden:true,disabled:true,handler:function(){if(!c.htcConfig.enableDownloadToGoogle){return
}var n;
if(e){var i=e.getChecked();
if(i&&i.length>0&&i[0]){n=i[0]
}}if(!n){b.buttons[0].setDisabled(true);
return
}var m=c.getGoogleDriveAuth().getAuthInfo();
if(!m||!m.access_token){b.switchView(false);
return
}var l=c.getGoogleDriveAuth().getAboutInfo();
var o=c.getCurrentSelectedSet();
var q=n.attributes.text;
var k={importFormats:l.importFormats,maxUploadSizes:l.maxUploadSizes,quotaBytesTotal:l.quotaBytesTotal,quotaBytesUsed:l.quotaBytesUsed,folderId:n.id,token:m.access_token,selections:o,convert:f&&f.getValue()};
var p=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
c.globalLoadMask.msg=String.format(c.htcConfig.locData.CloudDownloadingMessage,h)+"...";
c.globalLoadMask.show();
HttpCommander.GoogleDrive.DownloadDocs(k,function(w,s){Ext.Ajax.timeout=p;
c.globalLoadMask.hide();
c.globalLoadMask.msg=c.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(w,s,c.Msg,c.htcConfig,0,function(){if(w.needAuth===true){b.switchView(false)
}})){var r=w.downloaded;
var v=r.files>0&&r.folders<1?String.format(c.htcConfig.locData.CloudDownloadFilesSuccessMessage,r.files,q,h):r.folders>1&&r.files<0?String.format(c.htcConfig.locData.CloudFoldersCreatedSuccessMessage,r.folders,q,h):String.format(c.htcConfig.locData.CloudFilesFoldersSuccessMessage,r.files,r.folders,q,h);
var u=w.notDownloaded;
if(u.files>0||u.folders>0){v+="<br />"+(u.files>0&&u.folders<1?String.format(c.htcConfig.locData.CloudNotDownloadedFilesMessage,u.files):u.folders>0&&u.files<1?String.format(c.htcConfig.locData.CloudNotFoldersCreatedMessage,u.folders):String.format(c.htcConfig.locData.CloudNotFilesFoldersDownloadedMessage,u.files,u.folders))
}var t=true;
if(w.errors&&w.errors!=""){v+='<div style="width:100%;min-width:200px !important;overflow:auto;height:auto;max-height:75px;display:inline-block;">'+w.errors+"</div>";
t=false
}c.Msg.show({title:c.htcConfig.locData.CloudDownloadEndMessageTitle,msg:v+"<br />"+(t?"<br />":"")+c.htcConfig.locData.GoogleDocsDownloadEndWarningMessage+'<br /><br /><img align="absmiddle" alt="Google Drive" width="16" height="16" src="'+HttpCommander.Lib.Utils.getIconPath(c,"googledocs")+'">&nbsp;<a href="https://drive.google.com/" target="_blank">'+String.format(c.htcConfig.locData.CloudLinkText,h)+"</a>",closable:false,modal:true,buttons:c.Msg.OK,icon:c.Msg.INFO,fn:function(x){if(x=="ok"&&r.folders>0&&n){n.expanded=false;
n.loaded=false;
n.expand(false,true)
}}})
}})
}},{text:c.htcConfig.locData.CommonButtonCaptionCancel,handler:function(){b.hide()
}}],listeners:{afterrender:function(i){var k=document.getElementById(c.getUid()+"_authGoogleDown_link");
if(k){k.onclick=function(){b.prepare();
return false
}
}},resize:function(m,k,i){if(g&&g.rendered&&!g.hidden&&g.getTopToolbar){var l=g.getTopToolbar();
if(l.rendered&&!l.hidden){g.setWidth(k-24)
}g.setHeight(m.body.getHeight()-a.getHeight()-f.getHeight()-10)
}}},checkChangeGoogleFolders:function(k,i){if(e){e.un("checkchange",b.checkChangeGoogleFolders);
if(i){Ext.each(e.getChecked(),function(l){if(l&&l!=k&&l.id!=k.id&&l.attributes.checked){l.getUI().toggleCheck(false);
l.attributes.checked=false
}})
}e.on("checkchange",b.checkChangeGoogleFolders);
b.buttons[0].setDisabled(e.getChecked().length==0)
}},prepare:function(i){c.getGoogleDriveAuth().checkAuth(i===true,false,function(k,l){if(k&&Ext.isArray(k)){b.switchView(true);
b.getRootFolders()
}else{b.switchView(false);
if(l){c.Msg.show({title:c.htcConfig.locData.CommonErrorCaption,msg:l,icon:c.Msg.ERROR,buttons:c.Msg.OK})
}}})
},switchView:function(i){if(a){a.setVisible(i)
}if(f){f.setVisible(i)
}if(e){e.setVisible(i)
}if(g){g.setVisible(i)
}b.items.items[0].setVisible(!i);
b.buttons[0].setVisible(i);
if(!i){c.getGoogleDriveAuth().clearAuth();
b.clearRootNode()
}b.show();
b.syncSize()
},clearRootNode:function(){if(e){var i=e.getRootNode();
if(i){b.buttons[0].setDisabled(true);
i.removeAll();
i.checked=false;
var k=i.getUI();
if(k&&k.toggleCheck){k.toggleCheck(false)
}i.loaded=false
}}},getRootFolders:function(k){if(e){var i=e.getRootNode();
if(i){b.clearRootNode();
c.globalLoadMask.msg=String.format(c.htcConfig.locData.CloudLoadMsg,h)+"...";
c.globalLoadMask.show();
i.expanded=false;
i.id=(k||{}).id;
i.expand(false,true);
return
}}}});
return b
};
HttpCommander.Lib.UploadFromGoogle=function(a){var e=new Ext.form.ComboBox({autoSelect:true,allowBlank:true,editable:false,forceSelection:false,mode:"local",store:new Ext.data.ArrayStore({idIndex:0,autoDestroy:true,fields:["format"],data:[]}),valueField:"format",displayField:"format",tpl:'<tpl for="."><div class="x-combo-list-item">{format:htmlEncode}</div></tpl>',typeAhead:true,triggerAction:"all",lazyRender:false,lazyInit:false,listClass:"x-combo-list-small"});
var g=HttpCommander.Lib.Consts.CloudNames.google,i,f,c,h,b;
var d=function(l,k){a.Msg.show({title:a.htcConfig.locData.CommonErrorCaption,msg:k?Ext.util.Format.htmlEncode(l):l,icon:a.Msg.ERROR,buttons:a.Msg.CANCEL})
};
i=new Ext.FormPanel({frame:false,bodyStyle:"padding: 5px 5px 0 5px;",border:false,bodyBorder:false,header:false,buttonAlign:"center",layout:"fit",items:[{xtype:"label",html:String.format(a.htcConfig.locData.CloudAuthenticateMessage,g,String.format(a.htcConfig.locData.CloudAuthenticateLink,g),"<img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(a,"googledocs")+"'/>&nbsp;"+HttpCommander.Lib.Utils.getHelpLinkOpenTag(a.getUid(),"googledrive"),"</a>")+"<br /><br /><br /><div style='text-align:center;width:100%;'><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(a,"googledocs")+"'/>&nbsp;<a id='"+a.getUid()+"_authGoogleUp_link' href='#' target='_self'>"+String.format(a.htcConfig.locData.CloudAuthenticateLink,g)+"</a>"+(a.isDemoMode()&&!Ext.isEmpty(window.GoogleDemoName)&&!Ext.isEmpty(window.GoogleDemoPass)?('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.GoogleDemoName+'" />&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.GoogleDemoPass+'" /></span>'):"")+"</div>",listeners:{afterrender:function(k){i.bindAuthOnLink()
}}},{xtype:"label",hidden:true,html:String.format(a.htcConfig.locData.CloudUploadSelectItemsMessage,g)},c=new Ext.form.Checkbox({hidden:true,boxLabel:a.htcConfig.locData.UploadJavaIgnorePaths,listeners:{check:function(l,m){if(!!h){var k=h.getChecked();
i.buttons[0].setDisabled(k.length==0)
}}}}),h=new Ext.tree.TreePanel({root:{text:String.format(a.htcConfig.locData.CloudRootFolderName,g),expaded:false,checked:false},hidden:true,useArrows:true,autoScroll:true,header:false,lines:false,loader:b=new HttpCommander.Lib.GoogleTreeLoader({htcConfig:a.htcConfig,onlyFolders:false,api:a.getGoogleDriveAuth(),listeners:{beforeload:function(l,k){},load:function(m,l,k){a.globalLoadMask.hide();
a.globalLoadMask.msg=a.htcConfig.locData.ProgressLoading+"..."
},loadexception:function(m,l,k){a.globalLoadMask.hide();
a.globalLoadMask.msg=a.htcConfig.locData.ProgressLoading+"...";
a.Msg.show({title:a.htcConfig.locData.CommonErrorCaption,msg:k&&k.error?Ext.util.Format.htmlEncode(k.error):a.htcConfig.locData.CommonLoadError,icon:a.Msg.ERROR,buttons:a.Msg.OK})
}}}),tbar:new Ext.Toolbar({enableOverflow:true,items:[{icon:HttpCommander.Lib.Utils.getIconPath(a,"gdrefresh"),text:a.htcConfig.locData.CommandRefresh,handler:function(){a.getGoogleDriveAuth().clearAuth();
i.prepare()
}},"-",{icon:HttpCommander.Lib.Utils.getIconPath(a,"googledocs"),text:g,tooltip:'<b><img align="absmiddle" width="16" height="16" src="'+HttpCommander.Lib.Utils.getIconPath(a,"googledocs")+'">&nbsp;'+String.format(a.htcConfig.locData.CloudLinkText,g)+"</b><br/>"+String.format(a.htcConfig.locData.CloudLinkDescription,g),scope:i,handler:function(){window.open("https://drive.google.com/")
}},"->",{text:String.format(a.htcConfig.locData.CloudSignInAsDifferentUserText,g),handler:function(){a.getGoogleDriveAuth().signOut(function(){i.switchView(false)
})
}}]}),listeners:{load:function(k){Ext.each(k.childNodes,function(l){if(l.attributes.leaf&&l.attributes.type>0&&l.attributes.type!=4&&l.attributes.exportLinks){if(a.getFileManagerInstance&&!a.getFileManagerInstance().showSelectExportFormats){a.getFileManagerInstance().showSelectExportFormats=i.showSelectExportFormats
}l.attributes.exports=i.googleExportDefaultFormats[l.attributes.type];
var m=i.googleExportFormats[l.attributes.exports].title;
l.setText(Ext.util.Format.htmlEncode(l.attributes.title)+" ("+a.htcConfig.locData.GoogleDocsSaveAs+' <a href="#" style="text-decoration:underline;" onclick="HttpCommander.Main.FileManagers[\''+a.getUid()+"'].showSelectExportFormats("+l.attributes.type+",'"+l.id+"','"+l.attributes.exports+"','"+Ext.util.Format.htmlEncode(l.attributes.title)+"')\">"+m+"</a>)")
}else{l.setText(Ext.util.Format.htmlEncode(l.attributes.title))
}if(l.attributes.leaf&&l.attributes.type>0&&l.attributes.icon&&a.htcConfig.relativePath!=""){l.attributes.icon=a.htcConfig.relativePath+l.attributes.icon
}})
},render:function(k){k.on("checkchange",i.checkChangeGoogleDocsUploadList)
}}})],listeners:{afterrender:function(k){k.bindAuthOnLink()
}},buttons:[{hidden:true,text:a.htcConfig.locData.UploadSimpleUpload,handler:function(){var o=a.getCurrentFolder();
if(!o){a.Msg.alert(a.htcConfig.locData.UploadFolderNotSelectedTitle,a.htcConfig.locData.UploadFolderNotSelected);
return
}if(!a.htcConfig.currentPerms||!a.htcConfig.currentPerms.upload){a.Msg.alert(a.htcConfig.locData.UploadNotAllowedTitle,a.htcConfig.locData.UploadNotAllowedPrompt);
return
}var l=h.getChecked();
if(l.length==0){i.buttons[0].setDisabled(true);
d(String.format(a.htcConfig.locData.CloudUploadSelectItemsMessage,""),true);
return
}var p=a.getGoogleDriveAuth().getAuthInfo();
if(!p||!p.access_token){i.switchView(false);
return
}var n=c.getValue();
var q={token:p.access_token,path:o,gdocs:[],folders:[],rename:true};
var k=[];
var r=[];
Ext.each(l,function(v){if(v.attributes.file){var x={name:v.attributes.title,id:v.attributes.id,link:v.attributes.downloadUrl,ext:""};
if(!n){var t=v.parentNode;
var z="";
while(!!t&&(!t.isRoot||typeof t.isRoot=="undefined")){if(z.length>0){z="/"+z
}z=t.attributes.title+z;
t=t.parentNode
}x.path=z
}var s=v.attributes;
if(s.exports&&s.exports.length>0&&s.exportLinks&&s.exportLinks.hasOwnProperty(s.exports)){x.link=s.exportLinks[s.exports];
if(i.googleExportFormats.hasOwnProperty(s.exports)){x.ext=i.googleExportFormats[s.exports].ext
}}if(Ext.isEmpty(x.ext)||x.ext.trim().length==0){if(!Ext.isEmpty(s.mimeType)&&i.googleExportFormats.hasOwnProperty(s.mimeType)){x.ext=i.googleExportFormats[s.mimeType].ext
}}q.gdocs.push(x);
if(!q.ignorePaths&&!Ext.isEmpty(x.path)){k.push((x.path+(x.path.length>0?"/":"")+x.name).toLowerCase())
}}else{if(!n){var u=v.parentNode;
var w="";
while(!!u&&(!u.isRoot||typeof u.isRoot=="undefined")){if(w.length>0){w="/"+w
}w=u.attributes.title+w;
u=u.parentNode
}var y=w+(w.length>0?"/":"")+v.attributes.title;
r.push(y);
k.push(y.toLowerCase())
}}});
var m=k.length;
if(m>0){Ext.each(r,function(t){for(var s=0;
s<m;
s++){if(k[s].length>t.length&&k[s].indexOf(t.toLowerCase())==0){return
}}q.folders.push(t)
})
}if(q.gdocs.length>0||q.folders.length>0){i.uploadGoogleDocs(q)
}else{i.buttons[0].setDisabled(true);
d(String.format(a.htcConfig.locData.CloudUploadSelectItemsMessage,""),true)
}}}],bindAuthOnLink:function(){var k=document.getElementById(a.getUid()+"_authGoogleUp_link");
if(k){k.onclick=function(){i.prepare();
return false
}
}},getRootFolders:function(l){if(h){var k=h.getRootNode();
if(k){i.clearRootNode();
a.globalLoadMask.msg=String.format(a.htcConfig.locData.CloudLoadMsg,g)+"...";
a.globalLoadMask.show();
k.expanded=false;
k.id=(l||{}).id;
k.expand(false,true);
return
}}},prepare:function(k){a.getGoogleDriveAuth().checkAuth(k===true,true,function(l,m){if(l&&Ext.isArray(l)){i.switchView(true);
i.getRootFolders()
}else{i.switchView(false);
if(m){a.Msg.show({title:a.htcConfig.locData.CommonErrorCaption,msg:m,icon:a.Msg.ERROR,buttons:a.Msg.OK})
}}})
},clearRootNode:function(){if(h){var k=h.getRootNode();
if(k){i.buttons[0].setDisabled(true);
k.removeAll();
k.checked=false;
var l=k.getUI();
if(l&&l.toggleCheck){l.toggleCheck(false)
}k.loaded=false;
a.getUploadWindow().syncSize()
}}},googleExportDefaultFormats:["","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.openxmlformats-officedocument.presentationml.presentation","","image/jpeg"],googleExportFormats:{"text/html":{title:"HTML",ext:"html"},"text/plain":{title:"Plain text",ext:"txt"},"application/rtf":{title:"Rich text",ext:"rtf"},"application/vnd.oasis.opendocument.text":{title:"Open Office document",ext:"odt"},"application/pdf":{title:"PDF",ext:"pdf"},"application/vnd.openxmlformats-officedocument.wordprocessingml.document":{title:"MS Word document",ext:"docx"},"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":{title:"MS Excel",ext:"xlsx"},"application/x-vnd.oasis.opendocument.spreadsheet":{title:"Open Office sheet",ext:"ods"},"image/jpeg":{title:"JPEG",ext:"jpeg"},"image/png":{title:"PNG",ext:"png"},"image/svg+xml":{title:"SVG",ext:"svg"},"application/vnd.openxmlformats-officedocument.presentationml.presentation":{title:"MS PowerPoint",ext:"pptx"}},showSelectExportFormats:function(r,o,n,s){if(r<1||!n||r==4){return
}var k,p,m=[],l;
if(h){p=h.getNodeById(o)
}if(!p){return
}l=p.attributes.exportLinks;
for(format in l){if(l.hasOwnProperty(format)&&i.googleExportFormats.hasOwnProperty(format)){m.push({checked:n==format,name:"rb-formats",inputValue:format,boxLabel:i.googleExportFormats[format].title})
}}if(m.length==0){return
}var q=new Ext.Window({modal:true,plain:true,layout:"fit",gtype:r,nodeId:o,autoHeight:true,buttonAlign:"center",resizable:false,width:200,title:String.format(a.htcConfig.locData.GoogleDocsSaveAsTitle,Ext.util.Format.htmlEncode(s)),items:[k=new Ext.form.RadioGroup({columns:1,items:m,style:{marginLeft:"7px"}})],buttons:[{text:a.htcConfig.locData.CommonButtonCaptionOK,handler:function(){if(h){var w=h.getNodeById(o);
if(w){w.attributes.exports=k.getValue().inputValue;
var y=i.googleExportFormats[w.attributes.exports].title;
var x='<a href="#" style="text-decoration:underline;" onclick="HttpCommander.Main.FileManagers[\''+a.getUid()+"'].showSelectExportFormats("+r+",'"+w.id+"','"+w.attributes.exports+"','"+Ext.util.Format.htmlEncode(w.attributes.title)+"')\">"+y+"</a>";
w.text=w.attributes.text=Ext.util.Format.htmlEncode(w.attributes.title)+" ("+a.htcConfig.locData.GoogleDocsSaveAs+" "+x+")";
if(w.rendered){var u=w.getUI();
var t=u.elNode.getElementsByTagName("a");
if(t&&t.length>1){var v=t[1];
v.outerHTML=x
}}}}q.close()
}},{text:a.htcConfig.locData.CommonButtonCaptionCancel,handler:function(){q.close()
}}]});
q.show();
q.syncSize()
},switchView:function(k){i.items.items[0].setVisible(!k);
if(!k){i.bindAuthOnLink()
}i.items.items[1].setVisible(k);
i.items.items[2].setVisible(k);
i.items.items[3].setVisible(k);
i.buttons[0].setVisible(k);
if(!k){a.getGoogleDriveAuth().clearAuth();
i.clearRootNode()
}},uploadGoogleDocs:function(l){var k=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
a.globalLoadMask.msg=String.format(a.htcConfig.locData.CloudUploadProgressMessage,g)+"...";
a.globalLoadMask.show();
HttpCommander.GoogleDrive.UploadDocs(l,function(o,m){Ext.Ajax.timeout=k;
a.globalLoadMask.hide();
a.globalLoadMask.msg=a.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(o,m,a.Msg,a.htcConfig,0,function(){if(o.needAuth===true){i.switchView(false)
}})){if(h&&h.getRootNode()){HttpCommander.Lib.Utils.recursiveCheckTreeChildNodesWithoutExpand(h.getRootNode(),false);
i.buttons[0].setDisabled(true)
}a.openTreeRecent();
a.openGridFolder(l.path,true,true);
var n=String.format(a.htcConfig.locData.BalloonFilesUploaded,o.filesSaved);
if(o.filesRejected>0){n+="<br />"+String.format(a.htcConfig.locData.BalloonFilesNotUploaded,o.filesRejected)
}if(o.errors&&o.errors!=""){n+="<br />"+o.errors
}a.showBalloon(n)
}})
},checkChangeGoogleDocsUploadList:function(l,k){if(h){h.un("checkchange",i.checkChangeGoogleDocsUploadList);
HttpCommander.Lib.Utils.recursiveCheckTreeChildNodes(l,k);
HttpCommander.Lib.Utils.recursiveCheckTreeParentNodes(l,k);
h.on("checkchange",i.checkChangeGoogleDocsUploadList);
i.buttons[0].setDisabled(h.getChecked().length==0)
}},getGoogleDocsTree:function(){return h
}});
this.googleExportFormats=i.googleExportFormats;
return i
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.SkyDriveAuth=function(G){var k,y=HttpCommander.Lib.Utils.browserIs,w=HttpCommander.Lib.Consts.CloudNames.onedrive,J=null,r=G.htcConfig.liveConnectID,E=["wl.signin","wl.skydrive","wl.skydrive_update"],H=false,c=null,D=null,I=false,d=null,B=null,m=false,s=null,h="HttpCommanderOneDriveForBusinessAccessTokenInfo",N=String.format(G.htcConfig.locData.CloudLibraryNotLoadedMsg,w),z=G.htcConfig.locData.CloudAuthNotCompleteMsg,P=(y.ie||y.edge)?(G.htcConfig.locData.CloudTrustedSitesMsg+"http"+(Ext.isSecure?"s":"")+"://js.live.net<br />https://login.live.com<br />https://apis.live.net<br />https://auth.gfx.ms<br />https://onedrive.live.com<br />"+(y.edge?("<br />("+G.htcConfig.locData.TrustedSitesForMicrosoftEdge+")"):"")):"",i=(y.ie||y.edge)?(G.htcConfig.locData.CloudTrustedSitesMsg+"https://login.microsoftonline.com<br />https://login.windows.net<br />"+(y.edge?("<br />("+G.htcConfig.locData.TrustedSitesForMicrosoftEdge+")"):"")):"";
if(Ext.isEmpty(P)||Ext.isEmpty(i)){var p=z.toLowerCase().lastIndexOf("<br />");
if(p>0){z=z.substring(0,p)
}}var l=typeof(G.htcConfig.liveConnectID)!="undefined"&&G.htcConfig.liveConnectID!=null&&String(G.htcConfig.liveConnectID).length>0;
var v=typeof(G.htcConfig.oneDriveForBusinessAuthUrl)!="undefined"&&G.htcConfig.oneDriveForBusinessAuthUrl!=null&&String(G.htcConfig.oneDriveForBusinessAuthUrl).length>0;
var q=function(e){return(e&&e.AccessToken&&e.RefreshToken)?true:false
};
var M=function(){m=false;
c=c||O();
if(!q(c)){c=null;
D=null;
b(null)
}if(c&&c.ExpiresOn){try{var R=Date.parseDate(c.ExpiresOn,"c");
m=(new Date())>=R
}catch(S){m=false
}}return c
};
var g=function(R){var S=R?R.UserInfo:null;
var e=M();
if(!q(R)){c=null;
D=null
}else{if(!q(e)||R.AccessToken!=e.AccessToken||R.RefreshToken!=e.RefreshToken){c=Ext.apply({},R);
c.UserInfo=Ext.apply({},S)
}}b(c)
};
var O=function(){var R=null;
if(x){try{R=x.getItem(h);
if(R){R=JSON.parse(R)
}else{R=null
}}catch(S){R=null
}}return R
};
var b=function(R){if(x){try{x.removeItem(h)
}catch(S){}if(R){try{x.setItem(h,JSON.stringify(R))
}catch(S){}}}};
var x=null;
try{x=(function(S){var R=[S,window.sessionStorage],T=0;
S=R[T++];
while(S){try{S.setItem(T,T);
S.removeItem(T);
break
}catch(U){S=R[T++]
}}if(!S){return null
}else{return S
}})(window.localStorage)
}catch(L){}var K=function(){if(typeof WL!="undefined"&&G.htcConfig.isAllowedSkyDrive){try{WL.init({client_id:r,redirect_uri:G.htcConfig.isHostedMode?("https://"+window.location.hostname.substring(window.location.hostname.indexOf(".")+1,window.location.hostname.length).toLowerCase()+"/onedrive-callback.html"):scriptSource.substring(0,scriptSource.lastIndexOf("/"))+"/clouds/onedrive-callback.html",scope:E});
H=true
}catch(R){H=false
}}};
var Q=function(){if(s){try{clearTimeout(s)
}catch(R){}}s=null
};
var f=function(e){G.Msg.show({title:G.htcConfig.locData.CommonErrorCaption,msg:e,icon:G.Msg.ERROR,buttons:G.Msg.OK})
};
var a=function(U,T,S,X){I=true;
var W=U&&Ext.isObject(U)?Ext.apply({},U):null;
if(W&&U.UserInfo){W.UserInfo=Ext.apply({},U.UserInfo)
}var V=T?(Ext.isObject(T)?Ext.apply({},T):{error:null,error_description:String(T)}):null;
var e=(typeof X=="function"?X:null)||d;
var R=setTimeout(function(){clearTimeout(R);
Q();
if(B&&!B.closed){B.close()
}B=null;
if(W&&S!=""){W.WebDAVRoot=S
}g(W);
G.globalLoadMask.hide();
G.globalLoadMask.msg=G.htcConfig.locData.ProgressLoading+"...";
if(typeof e=="function"){e(q(c),V)
}},100)
};
var t=function(e,S,V){var U=!Ext.isBoolean(S);
Q();
G.globalLoadMask.hide();
G.globalLoadMask.msg=G.htcConfig.locData.ProgressLoading+"...";
var T;
if(e&&!e.error&&(T=WL.getSession())){c=T;
if(U){V(c)
}else{u(V,!S)
}}else{c=null;
var R=null;
if(e&&e.error&&Ext.isObject(e.error)){R=e.error.message||e.error.code
}if(!R&&e&&(e.error||e.error_description)){R=Ext.util.Format.htmlEncode(e.error_description||e.error)
}else{if(R){R=Ext.util.Format.htmlEncode(R)
}}if(R&&(R.toLowerCase().indexOf("popup is closed")>=0||R.toLowerCase().indexOf("'focus'")>=0||R.toLowerCase().indexOf("'onerror'")>=0)&&!Ext.isEmpty(P)){R+="<br /><br />"+G.htcConfig.locData.SkyDriveAuthAlsoString+P
}if(Ext.isFunction(V)){V(null,R)
}}};
var F=function(){WL.api({path:"me",method:"GET"}).then(function(e){D=e;
WL.api({path:"me/skydrive/quota",method:"GET"}).then(function(R){if(D&&R&&R.available){D.freeSpace=R.available
}},function(R){if(D){D.freeSpace=-1
}})
},function(e){D=null
})
};
var n=function(T,ad,ac){var Z=!Ext.isBoolean(T);
G.globalLoadMask.hide();
Q();
G.globalLoadMask.msg=String.format(G.htcConfig.locData.CloudCheckAuthMsg,w)+"...";
if(!G.isDemoMode()||!ac){G.globalLoadMask.show()
}var U=(ac===true);
var W=M();
if(W||!ac){if(m){k.refreshToken(ad,ac)
}else{a(W,null,"",ad)
}return
}I=false;
var X=scriptSource;
var ae=X.split("/");
ae[ae.length-2]="Handlers";
ae[ae.length-1]="OneDriveForBusinessOAuthHandler.ashx";
var S=ae.join("/");
var V=String.format(G.htcConfig.oneDriveForBusinessAuthUrl,encodeURIComponent(S),encodeURIComponent(G.getUid()+"="+S));
var ab=G.getFileManagerInstance();
if(ab&&typeof ab.onOneDriveForBusinessAccessToken!="function"){ab.onOneDriveForBusinessAccessToken=a
}d=ad;
B=window.open(V,"onedriveforbusinessoauthauthorize",HttpCommander.Lib.Utils.getPopupProps(400,500));
if(B){try{B.focus()
}catch(Y){}}else{var aa=z+i;
if(Ext.isFunction(ad)){ad(null,aa)
}else{f(aa)
}return
}var R=setInterval(function(){if(B){if(B.closed){if(R){clearInterval(R)
}B=null;
if(!I){a(null,{error:"cancelled",error_description:"Login has been cancelled"})
}}}else{if(R){clearInterval(R)
}}},100);
s=setTimeout(function(){G.globalLoadMask.hide();
G.globalLoadMask.msg=G.htcConfig.locData.ProgressLoading+"...";
if(s){Q();
if(!U){var e=z+i;
if(Ext.isFunction(ad)){ad(null)
}else{f(e)
}}}else{Q()
}},15000)
};
var A=function(e,Y,X,S){var U=!Ext.isBoolean(e);
if(Ext.isBoolean(S)){J=(S===true)
}else{if(!Ext.isBoolean(J)){if(v&&!l){J=true
}else{if(!v&&l){J=false
}else{var T=M();
if(T){J=true
}}}}}if(J){n(e,Y,X);
return
}if(typeof WL!="undefined"&&H&&(G.htcConfig.isAllowedSkyDrive&&((U&&G.htcConfig.enableMSOOEdit)||(!U&&e&&G.htcConfig.enableUploadFromSkyDrive)||(!U&&!e&&G.htcConfig.enableDownloadToSkyDrive)))){G.globalLoadMask.hide();
Q();
G.globalLoadMask.msg=String.format(G.htcConfig.locData.CloudCheckAuthMsg,w)+"...";
if(!G.isDemoMode()||!X){G.globalLoadMask.show()
}var R=(X===true);
if(R){WL.login({scope:E}).then(function(Z){if(Z&&Z.session){F()
}t(Z,e,Y)
},function(Z){t(Z,e,Y)
})
}else{WL.getLoginStatus().then(function(Z){if(Z&&Z.session){F()
}t(Z,e,Y)
},function(Z){t(Z,e,Y)
})
}s=setTimeout(function(){G.globalLoadMask.hide();
G.globalLoadMask.msg=G.htcConfig.locData.ProgressLoading+"...";
if(s){Q();
if(!R){var Z=z+P;
if(Ext.isFunction(Y)){Y(null)
}else{f(Z)
}}}else{Q()
}},15000)
}else{if(G.htcConfig.isAllowedSkyDrive&&((U&&G.htcConfig.enableMSOOEdit)||(!U&&e&&G.htcConfig.enableUploadFromSkyDrive)||(!U&&!e&&G.htcConfig.enableDownloadToSkyDrive))){if(typeof WL!="undefined"&&!H){K();
A(e,Y,X)
}else{G.globalLoadMask.hide();
Q();
G.globalLoadMask.msg=String.format(G.htcConfig.locData.CloudCheckAuthMsg,w)+"...";
G.globalLoadMask.show();
var V=null;
var W=false;
HttpCommander.Lib.Utils.includeJsFile({url:"//js.live.net/v5.0/wl"+(G.getDebugMode()?".debug":"")+".js",callback:function(){window.clearTimeout(V);
if(!W){W=true
}else{return
}G.globalLoadMask.hide();
G.globalLoadMask.msg=G.htcConfig.locData.ProgressLoading+"...";
if(typeof WL=="undefined"){f(N+P)
}else{K();
A(e,Y,X)
}}});
V=window.setTimeout(function(){window.clearTimeout(V);
if(!W){W=true
}else{return
}G.globalLoadMask.hide();
G.globalLoadMask.msg=G.htcConfig.locData.ProgressLoading+"...";
if(typeof WL=="undefined"){f(N+P)
}else{K();
A(e,Y,X)
}},15000)
}}}};
var C=function(U,T,V,e,R){G.globalLoadMask.hide();
G.globalLoadMask.msg=G.htcConfig.locData.ProgressLoading+"...";
var S=T&&T.connect;
if(typeof V=="function"){V(U?(T.data?T.data:[T]):null,U?null:T.message||Ext.util.Format.htmlEncode(T.error.message),S)
}};
var u=function(V,e,R,T){var U=R,S=U==="root";
if(!J){if(!U||S){U="/me/skydrive";
if(S){U+="/files"
}S=true
}else{U+="/files"
}}if(S){G.globalLoadMask.msg=String.format(G.htcConfig.locData.CloudLoadMsg,w)+"...";
G.globalLoadMask.show()
}if(!J){WL.api({path:U,method:"GET"}).then(function(W){C(true,W,V,e,R)
},function(W){C(false,W,V,e,R)
})
}else{HttpCommander.OneDriveForBusiness.GetItems({tokenInfo:c,onlyFolders:e,id:S?null:R,url:T},function(X,W){G.globalLoadMask.hide();
G.globalLoadMask.msg=G.htcConfig.locData.ProgressLoading+"...";
if(typeof X=="undefined"){f(HttpCommander.Lib.Utils.getAndHtmlEncodeMessage(W,G.htcConfig.locData.UploadFromUrlUnknownResponse,2));
return
}C(X&&X.success,X,V,e,R)
})
}};
var o=function(W){var U=scriptSource;
var S=U.split("/");
S[S.length-2]="Handlers";
S[S.length-1]="OneDriveForBusinessOAuthHandler.ashx?logout=&hcuid="+encodeURIComponent(G.getUid());
var T=G.htcConfig.oneDriveForBusinessAuthUrl.split(/\/oauth2\//)[0]+"/oauth2/logout?post_logout_redirect_uri="+encodeURIComponent(S.join("/"));
G.getFileManagerInstance().onOneDriveForBusinessSignOut=W;
var R=window.open(T,"onedriveforbusinesslogout",HttpCommander.Lib.Utils.getPopupProps(400,500));
if(R){try{R.focus()
}catch(V){}}if(typeof W=="function"){W()
}};
return(k={init:K,checkAuth:A,getAuthInfo:function(e){return(e===true)?M():c
},setAuthInfo:function(e){if(q(e)){g(e);
J=true
}},isAuthInfoDefined:q,getAboutInfo:function(){return D
},getFileList:u,setAuthAboutInfos:function(e){if(Ext.isObject(e)){if(Ext.isObject(e.auth)){c=HttpCommander.Lib.Utils.cloneMsOAuthInfo(e.auth)
}if(Ext.isObject(e.about)){D=Ext.apply({},e.about)
}}},clearAuth:function(){g(null);
c=null;
D=null
},getWebDAVRootUrl:function(){var e="";
if(J&&c&&c.WebDAVRoot){e=c.WebDAVRoot
}else{if(G.htcConfig.skyDriveWebDavBaseUrl&&D&&D.id){e=String.format("{0}{1}/",G.htcConfig.skyDriveWebDavBaseUrl,D.id)
}}return e
},isBusinessAccount:function(){return J===true
},refreshToken:function(S,R){var e=M();
if(q(e)){G.globalLoadMask.msg=String.format(G.htcConfig.locData.CloudRefreshTokenMsg,w)+"...";
G.globalLoadMask.show();
HttpCommander.OneDriveForBusiness.RefreshToken({tokenInfo:e},function(U,T){G.globalLoadMask.hide();
G.globalLoadMask.msg=G.htcConfig.locData.ProgressLoading+"...";
if(typeof U=="undefined"){f(HttpCommander.Lib.Utils.getAndHtmlEncodeMessage(T,G.htcConfig.locData.UploadFromUrlUnknownResponse,2))
}else{if(U.tokenInfo){if(e.UserInfo&&e.UserInfo.UserId){U.tokenInfo.UserInfo=U.tokenInfo.UserInfo||{};
U.tokenInfo.UserInfo=e.UserInfo
}if(e.TenantId&&!U.tokenInfo.TenantId){U.tokenInfo.TenantId=e.TenantId
}if(e.WebDAVRoot){U.tokenInfo.WebDAVRoot=e.WebDAVRoot
}}a(U.tokenInfo,U.message,"",S)
}})
}else{k.checkAuth(S,R)
}},signOut:function(e){k.clearAuth();
if(!J&&typeof WL!="undefined"){WL.logout()
}else{if(J&&G.htcConfig.oneDriveForBusinessAuthUrl){o(e)
}}if(typeof e=="function"){e()
}}})
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.SkyDriveTreeLoader=Ext.extend(Ext.tree.TreeLoader,{onlyFolders:false,api:null,load:function(b,c,a){if(this.clearOnLoad){while(b.firstChild){b.removeChild(b.firstChild)
}}if(this.doPreload(b)){this.runCallback(c,a||b,[b])
}else{if(this.api||this.directFn||this.dataUrl||this.url){this.requestData(b,c,a||b)
}}},skyDriveFolderTypes:["folder","album","MS.FileServices.Folder","Folder"],requestData:function(d,f,b){if(this.fireEvent("beforeload",this,d,f)!==false){if(this.api){var e=this,c={callback:f,node:d,scope:b},a=this.skyDriveFolderTypes;
e.api.getFileList(function(l,h,g){if(l&&Ext.isArray(l)){var k=[],i=d&&d.attributes&&d.attributes.checked&&!e.onlyFolders;
Ext.each(l,function(p,m,o){var r=p&&typeof p["@odata.id"]!="undefined";
var n=a.indexOf(p.type)<0;
if(p&&p.type.toLowerCase()!="notebook"&&(!e.onlyFolders||(e.onlyFolders&&!n))){var q=Ext.copyTo({title:p.name,leaf:n,file:n,checked:i&&n},p,"id size type link parent_id count name");
if(r){q.count=p.childCount;
q.businessUrl=p.webUrl;
if(p.parentReference){q.parent_id=p.parentReference.id
}if(!n&&p.childCount===0){q.leaf=true;
q.icon=HttpCommander.Lib.Utils.getIconPath(e.htcConfig,"folder-open")
}}else{q.url=p.upload_location
}k.push(q)
}});
e.handleResponse.apply(e,[{responseData:k,argument:c}])
}else{e.handleFailure.apply(e,[{error:h,connect:g,argument:c}])
}},e.onlyFolders,d.attributes.parent_id||d.parentNode?d.id:"root",d.attributes.businessUrl)
}}else{this.runCallback(f,b||d,[])
}}});
HttpCommander.Lib.Editor365Window=function(b){var c=HttpCommander.Lib.Consts.CloudNames.office365,a;
a=new b.Window({title:b.htcConfig.locData.CommandEditInOffice365,bodyStyle:"padding: 5px",layout:"fit",width:400,plain:true,minWidth:320,minHeight:200,height:200,buttonAlign:"center",closeAction:"hide",collapsible:false,minimizable:false,closable:true,resizable:false,maximizable:false,modal:true,items:[{xtype:"label",hideLabel:true,autoHeight:true,margins:"0 0 5 0",html:String.format(b.htcConfig.locData.CloudAuthenticateMessage,c,String.format(b.htcConfig.locData.CloudAuthenticateLink,c),"<br /><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(b,"office365")+"'/>&nbsp;"+HttpCommander.Lib.Utils.getHelpLinkOpenTag(b.getUid(),"onedrive"),"</a>")+"<br /><br /><br /><div style='text-align:center;width:100%;'><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(b,"office365")+"'>&nbsp;<a id='"+b.getUid()+"_auth365Edit_link' href='#' target='_self'>"+String.format(b.htcConfig.locData.CloudAuthenticateLink,c)+"</a>"+(b.isDemoMode()&&!Ext.isEmpty(window.OneDriveForBusinessDemoName)&&!Ext.isEmpty(window.OneDriveForBusinessDemoPass)?('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.OneDriveForBusinessDemoName+'" />&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.OneDriveForBusinessDemoPass+'" /></span>'):"")+"</div>"}],buttons:[{text:b.htcConfig.locData.CommonButtonCaptionCancel,handler:function(){a.hide()
}}],listeners:{afterrender:function(d){var e=document.getElementById(b.getUid()+"_auth365Edit_link");
if(e){e.onclick=function(){b.getSkyDriveAuth().checkAuth(1,function(f,g){if(f&&!g){a.hide();
if(a.deleteDoc===true){a.deleteDocFrom365(a.docInfo)
}else{a.getEditedDocFromMS(a.waitId,a.docInfo,a.curFolder,a.fileName,a.create)
}}else{a.show();
var h=Ext.isObject(g)?g.error_description:g;
if(!Ext.isEmpty(h)){b.Msg.show({title:b.htcConfig.locData.CommonErrorCaption,msg:h,icon:b.Msg.ERROR,buttons:b.Msg.OK})
}}},true,true);
return false
}
}}},deleteDocFrom365:function(e){a.docInfo=null;
a.curFolder=null;
a.fileName=null;
a.create=null;
a.deleteDoc=true;
b.Msg.hide();
a.hide();
if(!b.htcConfig.enableOffice365Edit||!Ext.isObject(e)||Ext.isEmpty(e.id)){return
}a.docInfo=Ext.apply({},e);
var h=b.getSkyDriveAuth();
if(!Ext.isObject(h)){b.Msg.hide();
a.show();
return
}var f=h.getAuthInfo();
if(!f){b.Msg.hide();
a.show();
return
}var g=HttpCommander.Lib.Utils.cloneMsOAuthInfo(f);
var d=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
HttpCommander.OneDriveForBusiness.Delete({id:e.id,wat:g},function(k,i){Ext.Ajax.timeout=d;
b.globalLoadMask.hide();
if(!HttpCommander.Lib.Utils.checkDirectHandlerResult(k,i,b.Msg,b.htcConfig)){if(typeof k=="undefined"){return
}else{if(!k.connect){h.clearAuth();
b.Msg.hide();
a.show();
return
}}}})
},getEditedDocFrom365:function(d,f,m,g,h,n){a.waitId=null;
a.docInfo=null;
a.curFolder=null;
a.fileName=null;
a.create=null;
a.deleteDoc=null;
b.Msg.hide();
a.hide();
if(!b.htcConfig.enableOffice365Edit||!Ext.isObject(f)||Ext.isEmpty(f.id)||Ext.isEmpty(f.eTag)){return
}a.docInfo=Ext.apply({},f);
a.curFolder=m;
a.fileName=g;
a.create=h;
a.waitId=d;
var i=b.getSkyDriveAuth();
if(!Ext.isObject(i)){b.Msg.hide();
a.show();
return
}var e=i.getAuthInfo();
if(!e){b.Msg.hide();
a.show();
return
}var l={edit:true,create:h,path:m,ignorePaths:true,files:[{name:g,newName:!Ext.isEmpty(f.newName)?f.newName:null,id:f.id,url:f.webLink}],folders:[],wat:HttpCommander.Lib.Utils.cloneMsOAuthInfo(e),notdel:(n===true)};
var k=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
b.globalLoadMask.msg=String.format(b.htcConfig.locData.CloudUploadProgressMessage,c)+"...";
b.globalLoadMask.show();
HttpCommander.OneDriveForBusiness.Upload(l,function(u,r){Ext.Ajax.timeout=k;
b.globalLoadMask.hide();
b.globalLoadMask.msg=b.htcConfig.locData.ProgressLoading+"...";
if(!HttpCommander.Lib.Utils.checkDirectHandlerResult(u,r,b.Msg,b.htcConfig)){if(typeof u=="undefined"){return
}else{if(!u.connect){i.clearAuth();
b.Msg.hide();
a.show();
return
}}}var q=u.editNewName;
if(!Ext.isEmpty(q)&&!Ext.isEmpty(d)){if(Ext.isArray(window.lastEdited365Doc)){var p,s,o=window.lastEdited365Doc.length;
for(p=0;
p<o;
p++){s=window.lastEdited365Doc[p]||{};
if(s.id===d&&Ext.isObject(s.doc)){s.doc.newName=q;
window.lastEdited365Doc[p]=s;
break
}}}}if(!Ext.isEmpty(u.editNewName)){b.setSelectPath({name:u.editNewName,path:l.path})
}b.openTreeRecent();
b.openGridFolder(l.path);
if(u.filesSaved&&u.filesSaved>0){var t=String.format(b.htcConfig.locData.BalloonFilesUploaded,u.filesSaved);
if(u.filesRejected>0){t+="<br />"+String.format(b.htcConfig.locData.BalloonFilesNotUploaded,u.filesRejected)
}if(u.message&&u.message!=""){t+="<br />"+u.message
}b.showBalloon(t)
}})
}});
return a
};
HttpCommander.Lib.EditorMSOOWindow=function(b){var c=HttpCommander.Lib.Consts.CloudNames.onedrive,a;
a=new b.Window({title:b.htcConfig.locData.CommandEditInMSOO,bodyStyle:"padding: 5px",layout:"fit",width:400,plain:true,minWidth:320,minHeight:200,height:200,buttonAlign:"center",closeAction:"hide",collapsible:false,minimizable:false,closable:true,resizable:false,maximizable:false,modal:true,items:[{xtype:"label",hideLabel:true,autoHeight:true,margins:"0 0 5 0",html:String.format(b.htcConfig.locData.CloudAuthenticateMessage,c,String.format(b.htcConfig.locData.CloudAuthenticateLink,c),"<br /><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(b,"skydrive")+"'/>&nbsp;"+HttpCommander.Lib.Utils.getHelpLinkOpenTag(b.getUid(),"onedrive"),"</a>")+"<br /><br /><br /><div style='text-align:center;width:100%;'><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(b,"skydrive")+"'>&nbsp;<a id='"+b.getUid()+"_authMSOOEdit_link' href='#' target='_self'>"+String.format(b.htcConfig.locData.CloudAuthenticateLink,c)+"</a>"+(b.isDemoMode()&&!Ext.isEmpty(window.OneDriveDemoName)&&!Ext.isEmpty(window.OneDriveDemoPass)?('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.OneDriveDemoName+'" />&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.OneDriveDemoPass+'" /></span>'):"")+"</div>"}],buttons:[{text:b.htcConfig.locData.CommonButtonCaptionCancel,handler:function(){a.hide()
}}],listeners:{afterrender:function(d){var e=document.getElementById(b.getUid()+"_authMSOOEdit_link");
if(e){e.onclick=function(){b.getSkyDriveAuth().checkAuth(1,function(f,g){if(f&&!g){a.hide();
if(a.deleteDoc==true){a.deleteDocFromMS(a.docInfo)
}else{a.getEditedDocFromMS(a.waitId,a.docInfo,a.curFolder,a.fileName,a.create)
}}else{a.show();
if(g){b.Msg.show({title:b.htcConfig.locData.CommonErrorCaption,msg:g,icon:b.Msg.ERROR,buttons:b.Msg.OK})
}}},true,false);
return false
}
}}},deleteDocFromMS:function(d){a.docInfo=null;
a.curFolder=null;
a.fileName=null;
a.create=null;
a.deleteDoc=true;
b.Msg.hide();
a.hide();
if(!b.htcConfig.enableMSOOEdit||!Ext.isObject(d)||Ext.isEmpty(d.id)){return
}a.docInfo=Ext.apply({},d);
var e=b.getSkyDriveAuth();
if(!Ext.isObject(e)){a.show();
return
}e.checkAuth(1,function(f,g){if(!a.docInfo||Ext.isEmpty(a.docInfo.id)){a.hide();
return
}if(f&&!g){a.hide();
setTimeout(function(){if(a&&a.docInfo&&!Ext.isEmpty(a.docInfo.id)){try{WL.api({path:a.docInfo.id,method:"DELETE"}).then(function(i){},function(i){var k=((i||{}).error||{}).code,l=((i||{}).error||{}).message;
if(Ext.isEmpty(k)||k=="resource_not_found"){return
}if(k=="request_token_missing"||k=="request_token_expired"){a.show();
return
}if(Ext.isEmpty(l)){l=k
}if(!Ext.isEmpty(l)){b.Msg.show({title:b.htcConfig.locData.CommonErrorCaption,msg:Ext.util.Format.htmlEncode(l),icon:b.Msg.ERROR,buttons:b.Msg.OK})
}})
}catch(h){if(h&&!Ext.isEmpty(h.message)){b.Msg.show({title:b.htcConfig.locData.CommonErrorCaption,msg:Ext.util.Format.htmlEncode(h.message),icon:b.Msg.ERROR,buttons:b.Msg.OK})
}}}},2000)
}else{a.show();
if(g){b.Msg.show({title:b.htcConfig.locData.CommonErrorCaption,msg:g,icon:b.Msg.ERROR,buttons:b.Msg.OK})
}}},false,false)
},getEditedDocFromMS:function(d,f,m,g,h,n){a.waitId=null;
a.docInfo=null;
a.curFolder=null;
a.fileName=null;
a.create=null;
a.deleteDoc=null;
b.Msg.hide();
a.hide();
if(!b.htcConfig.enableMSOOEdit||!Ext.isObject(f)||Ext.isEmpty(f.id)||Ext.isEmpty(f.source)){return
}a.docInfo=Ext.apply({},f);
a.curFolder=m;
a.fileName=g;
a.create=h;
a.waitId=d;
var i=b.getSkyDriveAuth();
if(!Ext.isObject(i)){b.Msg.hide();
a.show();
return
}var e=i.getAuthInfo();
if(!e||!e.access_token){b.Msg.hide();
a.show();
return
}var l={edit:true,create:h,path:m,ignorePaths:true,files:[{name:g,id:f.id,newName:!Ext.isEmpty(f.newName)?f.newName:null,url:f.source}],folders:[],wat:HttpCommander.Lib.Utils.cloneMsOAuthInfo(e),notdel:(n===true)};
var k=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
b.globalLoadMask.msg=String.format(b.htcConfig.locData.CloudUploadProgressMessage,c)+"...";
b.globalLoadMask.show();
HttpCommander.SkyDrive.Upload(l,function(u,r){Ext.Ajax.timeout=k;
b.globalLoadMask.hide();
b.globalLoadMask.msg=b.htcConfig.locData.ProgressLoading+"...";
if(!HttpCommander.Lib.Utils.checkDirectHandlerResult(u,r,b.Msg,b.htcConfig)){if(typeof u=="undefined"){return
}else{if(!u.connect){i.clearAuth();
b.Msg.hide();
a.show();
if(Ext.isBoolean(u.session)&&!u.session){b.Msg.alert(b.htcConfig.locData.CommonErrorCaption,"LiveConnectSession not created")
}return
}}}var q=u.editNewName;
if(!Ext.isEmpty(q)&&!Ext.isEmpty(d)){if(Ext.isArray(window.lastEditedMSOODoc)){var p,s,o=window.lastEditedMSOODoc.length;
for(p=0;
p<o;
p++){s=window.lastEditedMSOODoc[p]||{};
if(s.id===d&&Ext.isObject(s.doc)){s.doc.newName=q;
window.lastEditedMSOODoc[p]=s;
break
}}}}if(!Ext.isEmpty(u.editNewName)){b.setSelectPath({name:u.editNewName,path:l.path})
}b.openTreeRecent();
b.openGridFolder(l.path);
if(u.filesSaved&&u.filesSaved>0){var t=String.format(b.htcConfig.locData.BalloonFilesUploaded,u.filesSaved);
if(u.filesRejected>0){t+="<br />"+String.format(b.htcConfig.locData.BalloonFilesNotUploaded,u.filesRejected)
}if(u.message&&u.message!=""){t+="<br />"+u.message
}b.showBalloon(t)
}})
}});
return a
};
HttpCommander.Lib.DownloadToSkyDriveWindow=function(g){var l=HttpCommander.Lib.Consts.CloudNames.onedrive,e=HttpCommander.Lib.Consts.CloudNames.onedriveforbusiness,h,m,c,n,k,i,o;
var b=typeof(g.htcConfig.liveConnectID)!="undefined"&&g.htcConfig.liveConnectID!=null&&String(g.htcConfig.liveConnectID).length>0;
var d=typeof(g.htcConfig.oneDriveForBusinessAuthUrl)!="undefined"&&g.htcConfig.oneDriveForBusinessAuthUrl!=null&&String(g.htcConfig.oneDriveForBusinessAuthUrl).length>0;
var a="",f="";
if(b){a=String.format(g.htcConfig.locData.CloudAuthenticateLink,l);
f="Microsoft Live"
}if(d){if(a.length>0){a+=String.format('" {0} "',g.htcConfig.locData.CommonWordOr);
f+=String.format(" {0} ",g.htcConfig.locData.CommonWordOr)
}a+=String.format(g.htcConfig.locData.CloudAuthenticateLink,e);
f+=e
}o=new g.Window({title:g.htcConfig.locData.CommandDownloadToSkyDrive,bodyStyle:"padding: 5px",layout:"fit",width:400,plain:true,minWidth:320,minHeight:200,height:300,buttonAlign:"center",closeAction:"hide",collapsible:false,minimizable:false,closable:true,resizable:true,maximizable:true,modal:true,items:[h=new Ext.form.Label({xtype:"label",html:String.format(g.htcConfig.locData.CloudAuthenticateMessage,f,a,"<img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(g,"skydrive")+"'/>&nbsp;"+HttpCommander.Lib.Utils.getHelpLinkOpenTag(g.getUid(),"onedrive"),"</a>")+"<div style='text-align:center;width:100%;'>"+(b?"<br /><br /><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(g,"skydrive")+"'/>&nbsp;<a id='"+g.getUid()+"_authSkyDriveDown_link' href='#' target='_self'>"+String.format(g.htcConfig.locData.CloudAuthenticateLink,l)+"</a>"+(g.isDemoMode()&&!Ext.isEmpty(window.OneDriveDemoName)&&!Ext.isEmpty(window.OneDriveDemoPass)?('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.OneDriveDemoName+'" />&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.OneDriveDemoPass+'" /></span>'):""):"")+(d?"<br /><br /><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(g,"onedriveforbusiness")+"'/>&nbsp;<a id='"+g.getUid()+"_authOneDriveForBusinessDown_link' href='#' target='_self'>"+String.format(g.htcConfig.locData.CloudAuthenticateLink,e)+"</a>"+(g.isDemoMode()&&!Ext.isEmpty(window.OneDriveForBusinessDemoName)&&!Ext.isEmpty(window.OneDriveForBusinessDemoPass)?('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.OneDriveForBusinessDemoName+'" />&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.OneDriveForBusinessDemoPass+'" /></span>'):""):"")+"</div>",listeners:{afterrender:function(p){var q=document.getElementById(g.getUid()+"_authSkyDriveDown_link"),r=document.getElementById(g.getUid()+"_authOneDriveForBusinessDown_link");
if(q){q.onclick=function(){o.main(true,false);
return false
}
}if(r){r.onclick=function(){o.main(true,true);
return false
}
}}}}),m=new Ext.form.Label({html:String.format(g.htcConfig.locData.CloudCheckFolerMessage,l),hidden:true}),c=new Ext.Panel({layout:"fit",height:230,flex:1,hidden:true,anchor:"100%",tbar:new Ext.Toolbar({enableOverflow:true,items:[{icon:HttpCommander.Lib.Utils.getIconPath(g,"gdrefresh"),text:g.htcConfig.locData.CommandRefresh,handler:function(){o.main()
}},"-",{icon:HttpCommander.Lib.Utils.getIconPath(g,"skydrive"),text:l,tooltip:'<b><img align="absmiddle" width="16" height="16" src="'+HttpCommander.Lib.Utils.getIconPath(g,"skydrive")+'">&nbsp;'+String.format(g.htcConfig.locData.CloudLinkText,l)+"</b><br/>"+String.format(g.htcConfig.locData.CloudLinkDescription,l),scope:this,handler:function(){if(g.getSkyDriveAuth()&&g.getSkyDriveAuth().isBusinessAccount()&&g.htcConfig.oneDriveForBusinessRootUrl){window.open(g.htcConfig.oneDriveForBusinessRootUrl)
}else{window.open("https://onedrive.live.com/")
}}},"->",{text:String.format(g.htcConfig.locData.CloudSignInAsDifferentUserText,l),handler:function(){if(g.getSkyDriveAuth()){g.getSkyDriveAuth().signOut(function(){o.switchView(false)
})
}}}]}),items:[n=new Ext.tree.TreePanel({root:{text:String.format(g.htcConfig.locData.CloudRootFolderName,l),expaded:false,checked:false},useArrows:true,autoScroll:true,header:false,flex:1,anchor:"100%",lines:false,loader:k=new HttpCommander.Lib.SkyDriveTreeLoader({htcConfig:g.htcConfig,onlyFolders:true,api:g.getSkyDriveAuth(),listeners:{beforeload:function(q,p){},load:function(r,q,p){g.globalLoadMask.hide();
g.globalLoadMask.msg=g.htcConfig.locData.ProgressLoading+"..."
},loadexception:function(s,r,p){g.globalLoadMask.hide();
g.globalLoadMask.msg=g.htcConfig.locData.ProgressLoading+"...";
var q=g.htcConfig.locData.CommonLoadError;
if(p&&p.error){if(Ext.isObject(p.error)){q=p.error.error_description
}else{q=p.error
}}if(p&&typeof(p.connect)!="undefined"&&!p.connect){o.clearAuthInfo()
}g.Msg.show({title:g.htcConfig.locData.CommonErrorCaption,msg:q,icon:g.Msg.ERROR,buttons:g.Msg.OK})
}}}),listeners:{load:function(p){if(p.isRoot||!p.parentNode){var q=p.getUI?p.getUI():null;
if(q&&q.toggleCheck){q.toggleCheck(true)
}else{p.checked=true
}}Ext.each(p.childNodes,function(r){r.text=r.attributes.text=Ext.util.Format.htmlEncode(r.attributes.title)
})
},click:function(q){var p=q.getUI();
if(p){p.toggleCheck()
}},render:function(p){p.on("checkchange",o.checkChangeSkyDriveFolders)
}}})]}),i=new Ext.form.FormPanel({baseCls:"x-plain",labelAlign:"top",hidden:true,items:[{xtype:"textfield",anchor:"100%",readOnly:true,selectOnFocus:true,fieldLabel:String.format(g.htcConfig.locData.SkyDriveMapRootFolder,HttpCommander.Lib.Utils.getHelpLinkOpenTag(g.getUid(),"webfolders"),"</a>")}]})],buttons:[{text:g.htcConfig.locData.CommonButtonCaptionContinue,hidden:true,disabled:true,handler:function(){if(!g.htcConfig.enableDownloadToSkyDrive){return
}var u=g.getCurrentSelectedSet();
if(u.files==0&&u.folders==0){return
}var t=null,v=null,s;
if(n){var p=n.getChecked();
if(p&&p.length>0&&p[0]){s=p[0];
t=s.attributes;
if(s.isRoot||!s.parentNode){t.id=null
}v=s.text
}}if(!t){o.buttons[0].setDisabled(true);
return
}var q={folderId:t.id,folderUrl:g.getSkyDriveAuth().isBusinessAccount()?t.businessUrl:t.url,selections:u};
if(g.getSkyDriveAuth()){q.wat=HttpCommander.Lib.Utils.cloneMsOAuthInfo(g.getSkyDriveAuth().getAuthInfo());
var r=g.getSkyDriveAuth().getAboutInfo();
if(r){q.freeSpace=r.freeSpace
}}o.downloadFilesFolders(q,v,s)
}},{text:g.htcConfig.locData.CommonButtonCaptionClose,handler:function(){o.hide()
}}],listeners:{hide:function(p){h.show();
p.buttons[0].setVisible(false);
m.hide();
c.hide();
i.hide();
i.items.items[0].setValue("")
},resize:function(s,q,p){if(c.rendered&&!c.hidden&&c.getTopToolbar){var r=c.getTopToolbar();
if(r.rendered&&!r.hidden){c.setWidth(q-25)
}c.setHeight(s.body.getHeight()-m.getHeight()-i.getHeight()-5)
}}},checkChangeSkyDriveFolders:function(q,p){if(n){n.un("checkchange",o.checkChangeSkyDriveFolders);
if(p){Ext.each(n.getChecked(),function(r){if(r&&r!=q&&r.id!=q.id&&r.attributes.checked){r.getUI().toggleCheck(false);
r.attributes.checked=false
}})
}n.on("checkchange",o.checkChangeSkyDriveFolders);
o.buttons[0].setDisabled(n.getChecked().length==0)
}},switchView:function(p){if(h){h.setVisible(!p)
}if(m){m.setVisible(p)
}if(c){c.setVisible(p)
}if(i){i.setVisible(p);
if(!p){i.items.items[0].setValue("")
}}o.items.items[0].setVisible(!p);
o.buttons[0].setVisible(p);
if(!p){if(g.getSkyDriveAuth()){g.getSkyDriveAuth().clearAuth()
}o.clearRootNode()
}o.show();
o.syncSize()
},clearAuthInfo:function(){if(g.getSkyDriveAuth()){g.getSkyDriveAuth().clearAuth()
}o.switchView(false)
},main:function(p,q){var r=g.getSkyDriveAuth();
if(r){if(i){i.items.items[0].setValue("")
}r.checkAuth(false,function(s,t){if(s===true||Ext.isArray(s)){o.switchView(true);
if(i){i.items.items[0].setValue(r.getWebDAVRootUrl());
if(r.isBusinessAccount()&&g.htcConfig.locData.OneDriveForBusinessMapWebFolderInfo){Ext.QuickTips.register({target:i.items.items[0].getEl(),text:g.htcConfig.locData.OneDriveForBusinessMapWebFolderInfo,enabled:true,autoShow:true})
}else{Ext.QuickTips.unregister(i.items.items[0].getEl())
}}o.getRootFolders(s===true||s.length==0||!s[0]?null:s[0])
}else{o.switchView(false);
if(t){g.Msg.show({title:g.htcConfig.locData.CommonErrorCaption,msg:Ext.isObject(t)?t.error_description:t,icon:g.Msg.ERROR,buttons:g.Msg.OK})
}}},p,q)
}},clearRootNode:function(){if(n){var p=n.getRootNode();
if(p){o.buttons[0].setDisabled(true);
p.removeAll();
p.checked=false;
var q=p.getUI();
if(q&&q.toggleCheck){q.toggleCheck(false)
}p.loaded=false
}}},getRootFolders:function(q){if(n){var p=n.getRootNode();
if(p){o.clearRootNode();
g.globalLoadMask.msg=String.format(g.htcConfig.locData.CloudLoadMsg,l)+"...";
g.globalLoadMask.show();
p.expanded=false;
if(q){p.attributes.name=q.name;
p.attributes.url=q.upload_location;
p.attributes.id=q.id;
p.id=q.id
}p.expand(false,true);
return
}}},downloadFilesFolders:function(q,t,s){var p=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
g.globalLoadMask.msg=String.format(g.htcConfig.locData.CloudDownloadingMessage,l)+"...";
g.globalLoadMask.show();
var r=g.getSkyDriveAuth()&&g.getSkyDriveAuth().isBusinessAccount();
HttpCommander[r===true?"OneDriveForBusiness":"SkyDrive"].Download(q,function(x,u){Ext.Ajax.timeout=p;
g.globalLoadMask.hide();
g.globalLoadMask.msg=g.htcConfig.locData.ProgressLoading+"...";
if(!HttpCommander.Lib.Utils.checkDirectHandlerResult(x,u,g.Msg,g.htcConfig)){if(!x.connect){o.clearAuthInfo();
if(Ext.isBoolean(x.session)&&!x.session){g.Msg.alert(g.htcConfig.locData.CommonErrorCaption,"LiveConnectSession not created")
}}return
}if(!x.connect){o.clearAuthInfo();
if(Ext.isBoolean(x.session)&&!x.session){g.Msg.alert(g.htcConfig.locData.CommonErrorCaption,"LiveConnectSession not created")
}}var w=x.downloaded>0&&x.foldersCreated<1?String.format(g.htcConfig.locData.CloudDownloadFilesSuccessMessage,x.downloaded,t,l):x.foldersCreated>1&&x.downloaded<0?String.format(g.htcConfig.locData.CloudFoldersCreatedSuccessMessage,x.foldersCreated,t,l):String.format(g.htcConfig.locData.CloudFilesFoldersSuccessMessage,x.downloaded,x.foldersCreated,t,l);
if(x.rejected>0||x.foldersRejected>0){w+="<br />"+(x.rejected>0&&x.foldersRejected<1?String.format(g.htcConfig.locData.CloudNotDownloadedFilesMessage,x.rejected):x.foldersRejected>0&&x.rejected<1?String.format(g.htcConfig.locData.CloudNotFoldersCreatedMessage,x.foldersRejected):String.format(g.htcConfig.locData.CloudNotFilesFoldersDownloadedMessage,x.rejected,x.foldersRejected))
}var v=true;
if(x.errors&&x.errors!=""){w+='<div style="width:100%;min-width:200px !important;overflow:auto;height:auto;max-height:75px;display:inline-block;">'+x.errors+"</div>";
v=false
}if(typeof x.newTitle!="undefined"&&x.newTitle!=""){w+=(w!=""?"<br />":"")+g.htcConfig.locData.CloudDownloadWithNewNames+'<div style="width:100%;min-width:200px !important;overflow:auto;height:auto;max-height:75px;display:inline-block;">'+x.newTitle+"</div>"
}var y="https://onedrive.live.com/";
if(r&&g.htcConfig.oneDriveForBusinessRootUrl){y=g.htcConfig.oneDriveForBusinessRootUrl
}g.Msg.show({title:g.htcConfig.locData.CommandDownloadToSkyDrive,msg:w+"<br /><br /><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(g,"skydrive")+"'>&nbsp;<a href='"+y+"' target='_blank'>"+String.format(g.htcConfig.locData.CloudLinkText,l)+"</a>",closable:false,modal:true,buttons:g.Msg.OK,icon:g.Msg.INFO,fn:function(z){if(z=="ok"&&x.foldersCreated>0&&s){s.expanded=false;
s.loaded=false;
s.expand(false,true)
}}})
})
}});
return o
};
HttpCommander.Lib.UploadFromSkyDrive=function(g){var m=HttpCommander.Lib.Consts.CloudNames.onedrive,e=HttpCommander.Lib.Consts.CloudNames.onedriveforbusiness,b,h,n,k,l,o;
var i=function(q,p){g.Msg.show({title:g.htcConfig.locData.CommonErrorCaption,msg:p?Ext.util.Format.htmlEncode(q):q,icon:g.Msg.ERROR,buttons:g.Msg.CANCEL})
};
var c=typeof(g.htcConfig.liveConnectID)!="undefined"&&g.htcConfig.liveConnectID!=null&&String(g.htcConfig.liveConnectID).length>0;
var d=typeof(g.htcConfig.oneDriveForBusinessAuthUrl)!="undefined"&&g.htcConfig.oneDriveForBusinessAuthUrl!=null&&String(g.htcConfig.oneDriveForBusinessAuthUrl).length>0;
var a="",f="";
if(c){a=String.format(g.htcConfig.locData.CloudAuthenticateLink,m);
f="Microsoft Live"
}if(d){if(a.length>0){a+=String.format('" {0} "',g.htcConfig.locData.CommonWordOr);
f+=String.format(" {0} ",g.htcConfig.locData.CommonWordOr)
}a+=String.format(g.htcConfig.locData.CloudAuthenticateLink,e);
f+=e
}l=new HttpCommander.Lib.SkyDriveTreeLoader({htcConfig:g.htcConfig,onlyFolders:false,api:g.getSkyDriveAuth(),listeners:{beforeload:function(q,p){},load:function(r,q,p){g.globalLoadMask.hide();
g.globalLoadMask.msg=g.htcConfig.locData.ProgressLoading+"...";
o.changeSkyDriveUploadInfoFiles()
},loadexception:function(s,r,p){g.globalLoadMask.hide();
g.globalLoadMask.msg=g.htcConfig.locData.ProgressLoading+"...";
var q=g.htcConfig.locData.CommonLoadError;
if(p&&p.error){if(Ext.isObject(p.error)){q=p.error.error_description
}else{q=p.error
}}if(p&&typeof(p.connect)!="undefined"&&!p.connect){o.skyDriveClearAuth()
}g.Msg.show({title:g.htcConfig.locData.CommonErrorCaption,msg:q,icon:g.Msg.ERROR,buttons:g.Msg.OK})
}}});
o=new Ext.FormPanel({frame:false,bodyStyle:"padding: 5px 5px 0 5px;",border:false,bodyBorder:false,header:false,buttonAlign:"center",layout:"fit",items:[b=new Ext.form.Label({xtype:"label",html:String.format(g.htcConfig.locData.CloudAuthenticateMessage,f,a,"<img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(g,"skydrive")+"'/>&nbsp;"+HttpCommander.Lib.Utils.getHelpLinkOpenTag(g.getUid(),"onedrive"),"</a>")+"<br /><div style='text-align:center;width:100%;'>"+(c?"<br /><br /><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(g,"skydrive")+"'/>&nbsp;<a id='"+g.getUid()+"_authSkyDriveUp_link' href='#' target='_self'>"+String.format(g.htcConfig.locData.CloudAuthenticateLink,m)+"</a>"+(g.isDemoMode()&&!Ext.isEmpty(window.OneDriveDemoName)&&!Ext.isEmpty(window.OneDriveDemoPass)?('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.OneDriveDemoName+'" />&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.OneDriveDemoPass+'" /></span>'):""):"")+(d?"<br /><br /><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(g,"onedriveforbusiness")+"'/>&nbsp;<a id='"+g.getUid()+"_authOneDriveForBusinessUp_link' href='#' target='_self'>"+String.format(g.htcConfig.locData.CloudAuthenticateLink,e)+"</a>"+(g.isDemoMode()&&!Ext.isEmpty(window.OneDriveForBusinessDemoName)&&!Ext.isEmpty(window.OneDriveForBusinessDemoPass)?('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.OneDriveForBusinessDemoName+'" />&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.OneDriveForBusinessDemoPass+'" /></span>'):""):"")+"</div>",listeners:{afterrender:function(p){o.bindAuthOnLink()
}}}),h=new Ext.Panel({layout:"fit",hidden:true,border:false,items:[{xtype:"label",html:String.format(g.htcConfig.locData.CloudUploadSelectItemsMessage,m)},{xtype:"checkbox",itemId:"upload-from-skydrive-ignore-paths",boxLabel:g.htcConfig.locData.UploadJavaIgnorePaths,listeners:{check:function(q,r){if(!!n){var p=n.getChecked();
o.buttons[0].setDisabled(p.length==0)
}}}},n=new Ext.tree.TreePanel({root:{text:String.format(g.htcConfig.locData.CloudRootFolderName,m),expaded:false,checked:false},useArrows:true,autoScroll:true,header:false,lines:false,loader:l,bbar:new Ext.Toolbar({items:[{xtype:"label",itemId:"upload-from-skydrive-bbar-label",html:String.format(g.htcConfig.locData.CloudUploadTotalFiles,"0","0 bytes")}]}),tbar:new Ext.Toolbar({enableOverflow:true,items:[{icon:HttpCommander.Lib.Utils.getIconPath(g,"gdrefresh"),text:g.htcConfig.locData.CommandRefresh,handler:function(){o.getSkyDriveItems()
}},"-",{icon:HttpCommander.Lib.Utils.getIconPath(g,"skydrive"),text:m,tooltip:'<b><img align="absmiddle" width="16" height="16" src="'+HttpCommander.Lib.Utils.getIconPath(g,"skydrive")+'">&nbsp;'+String.format(g.htcConfig.locData.CloudLinkText,m)+"</b><br/>"+String.format(g.htcConfig.locData.CloudLinkDescription,m),scope:this,handler:function(){if(g.getSkyDriveAuth()&&g.getSkyDriveAuth().isBusinessAccount()&&g.htcConfig.oneDriveForBusinessRootUrl){window.open(g.htcConfig.oneDriveForBusinessRootUrl)
}else{window.open("https://onedrive.live.com/")
}}},"->",{text:String.format(g.htcConfig.locData.CloudSignInAsDifferentUserText,m),handler:function(){if(g.getSkyDriveAuth()){g.getSkyDriveAuth().signOut(function(){o.changeViewSkyDriveFp(true)
})
}}}]}),listeners:{load:function(p){Ext.each(p.childNodes,function(q){if(q.attributes.file&&typeof q.attributes.size!=="undefined"){q.text=q.attributes.text=Ext.util.Format.htmlEncode(q.attributes.title)+" ("+g.getRenderers().sizeRenderer(q.attributes.size)+")"
}else{q.text=q.attributes.text=Ext.util.Format.htmlEncode(q.attributes.title)
}if(q.attributes.file){q.attributes.icon=HttpCommander.Lib.Utils.getIconPath(g,"none")
}})
},render:function(p){p.on("checkchange",o.checkChangeSkyDriveUploadList,o)
}}})]}),k=new Ext.Panel({baseCls:"x-plain",layout:"form",unstyled:true,hidden:true,labelAlign:"top",collapsible:false,autoHeight:true,items:[{itemId:"upload-from-skydrive-map-root-url",xtype:"textfield",anchor:"100%",readOnly:true,selectOnFocus:true,fieldLabel:String.format(g.htcConfig.locData.SkyDriveMapRootFolder,HttpCommander.Lib.Utils.getHelpLinkOpenTag(g.getUid(),"webfolders"),"</a>")}]})],buttons:[{hidden:true,disabled:true,text:g.htcConfig.locData.UploadSimpleUpload,handler:function(){var u=g.getCurrentFolder();
if(!u){g.Msg.alert(g.htcConfig.locData.UploadFolderNotSelectedTitle,g.htcConfig.locData.UploadFolderNotSelected);
return
}if(!g.htcConfig.currentPerms||!g.htcConfig.currentPerms.upload){g.Msg.alert(g.htcConfig.locData.UploadNotAllowedTitle,g.htcConfig.locData.UploadNotAllowedPrompt);
return
}var r=n.getChecked();
if(r.length==0){o.buttons[0].setDisabled(true);
i(String.format(g.htcConfig.locData.CloudUploadSelectItemsMessage,""),true);
return
}var v={path:u,ignorePaths:h.getComponent("upload-from-skydrive-ignore-paths").getValue(),files:[],folders:[]};
var q=[];
var w=[];
Ext.each(r,function(z){if(z&&(typeof(z.isRoot)=="undefined"||!z.isRoot)&&z.parentNode){var y={name:z.attributes.name||z.attributes.title,url:g.getSkyDriveAuth().isBusinessAccount()?z.attributes.businessUrl:z.attributes.url,id:z.attributes.id};
if(!v.ignorePaths){var x="";
var A=z.parentNode;
while(!!A&&(typeof(A.isRoot)=="undefined"||!A.isRoot)){x=A.attributes.name+"\\"+x;
A=A.parentNode
}y.path=x
}if(z.attributes.file){v.files.push(y);
if(!v.ignorePaths){q.push((y.path+y.name).toLowerCase())
}}else{if(!v.ignorePaths){w.push(y);
q.push((y.path+y.name).toLowerCase())
}}}});
var s=q.length;
if(s>0){Ext.each(w,function(z){var x=(z.path+z.name).toLowerCase();
for(var y=0;
y<s;
y++){if(q[y].length>x.length&&q[y].indexOf(x)==0){return
}}v.folders.push(z)
})
}if(v.files.length==0&&v.folders.length==0){o.buttons[0].setDisabled(true);
i(String.format(g.htcConfig.locData.CloudUploadSelectItemsMessage,""),true);
return
}if(g.getSkyDriveAuth()){v.wat=HttpCommander.Lib.Utils.cloneMsOAuthInfo(g.getSkyDriveAuth().getAuthInfo())
}var p=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
g.globalLoadMask.msg=String.format(g.htcConfig.locData.CloudUploadProgressMessage,m)+"...";
g.globalLoadMask.show();
var t=g.getSkyDriveAuth()&&g.getSkyDriveAuth().isBusinessAccount();
HttpCommander[t===true?"OneDriveForBusiness":"SkyDrive"].Upload(v,function(z,x){Ext.Ajax.timeout=p;
g.globalLoadMask.hide();
g.globalLoadMask.msg=g.htcConfig.locData.ProgressLoading+"...";
if(!HttpCommander.Lib.Utils.checkDirectHandlerResult(z,x,g.Msg,g.htcConfig)){if(typeof z=="undefined"){return
}else{if(!z.connect){o.skyDriveClearAuth();
if(Ext.isBoolean(z.session)&&!z.session){g.Msg.alert(g.htcConfig.locData.CommonErrorCaption,"LiveConnectSession not created")
}return
}}}if(n&&n.getRootNode()){HttpCommander.Lib.Utils.recursiveCheckTreeChildNodesWithoutExpand(n.getRootNode(),false);
o.buttons[0].setDisabled(true);
o.changeSkyDriveUploadInfoFiles()
}g.openTreeRecent();
g.openGridFolder(v.path,true,true);
if(z.filesSaved&&z.filesSaved>0){var y=String.format(g.htcConfig.locData.BalloonFilesUploaded,z.filesSaved);
if(z.filesRejected>0){y+="<br />"+String.format(g.htcConfig.locData.BalloonFilesNotUploaded,z.filesRejected)
}if(z.message&&z.message!=""){y+="<br />"+z.message
}g.showBalloon(y)
}})
}}],checkChangeSkyDriveUploadList:function(q,p){n.un("checkchange",o.checkChangeSkyDriveUploadList,o);
HttpCommander.Lib.Utils.recursiveCheckTreeChildNodes(q,p);
HttpCommander.Lib.Utils.recursiveCheckTreeParentNodes(q,p);
n.on("checkchange",o.checkChangeSkyDriveUploadList,o);
o.changeSkyDriveUploadInfoFiles();
o.buttons[0].setDisabled(n.getChecked().length==0)
},changeSkyDriveUploadInfoFiles:function(){var q=n.getBottomToolbar().getComponent("upload-from-skydrive-bbar-label");
if(q){var t=0,r=0;
if(n){var p=n.getChecked();
Ext.each(p,function(u){if(u.attributes.file){t++;
r+=parseInt(u.attributes.size)
}})
}var s=g.getRenderers().sizeRenderer(String(r));
q.setText(String.format(htcConfig.locData.CloudUploadTotalFiles,t,s),true)
}},skyDriveClearAuth:function(){if(g.getSkyDriveAuth()){g.getSkyDriveAuth().clearAuth()
}o.changeViewSkyDriveFp(true)
},getSkyDriveItems:function(p){o.prepare()
},changeViewSkyDriveFp:function(p){if(p){n.hide();
h.hide();
o.buttons[0].hide();
b.show();
k.hide();
k.getComponent("upload-from-skydrive-map-root-url").setValue("")
}else{b.hide();
h.show();
n.show();
n.getBottomToolbar().getComponent("upload-from-skydrive-bbar-label").setText(String.format(g.htcConfig.locData.CloudUploadTotalFiles,"0","0 bytes"));
k.show();
o.buttons[0].show()
}g.getUploadWindow().syncSize()
},bindAuthOnLink:function(){var p=document.getElementById(g.getUid()+"_authSkyDriveUp_link"),q=document.getElementById(g.getUid()+"_authOneDriveForBusinessUp_link");
if(p){p.onclick=function(){o.prepare(true,false);
return false
}
}if(q){q.onclick=function(){o.prepare(true,true);
return false
}
}},prepare:function(p,r){var q=g.getSkyDriveAuth();
if(q){q.checkAuth(true,function(s,t){if(s===true||Ext.isArray(s)){o.changeViewSkyDriveFp(false);
if(k){k.items.items[0].setValue(q.getWebDAVRootUrl());
if(q.isBusinessAccount()&&g.htcConfig.locData.OneDriveForBusinessMapWebFolderInfo){Ext.QuickTips.register({target:k.items.items[0].getEl(),text:g.htcConfig.locData.OneDriveForBusinessMapWebFolderInfo,enabled:true,autoShow:true})
}else{Ext.QuickTips.unregister(k.items.items[0].getEl())
}}o.getRootFolders(s===true||s.length==0||!s[0]?null:s[0])
}else{o.changeViewSkyDriveFp(true);
if(t){g.Msg.show({title:g.htcConfig.locData.CommonErrorCaption,msg:Ext.isObject(t)?t.error_description:t,icon:g.Msg.ERROR,buttons:g.Msg.OK})
}}},p,r)
}},getRootFolders:function(q){if(n){var p=n.getRootNode();
if(p){o.clearRootNode();
g.globalLoadMask.msg=String.format(g.htcConfig.locData.CloudLoadMsg,m)+"...";
g.globalLoadMask.show();
p.expanded=false;
if(q){p.attributes.name=q.name;
p.attributes.url=q.upload_location;
p.attributes.id=q.id;
p.id=q.id
}p.expand(false,true);
return
}}},clearRootNode:function(){if(n){var p=n.getRootNode();
if(p){p.loginInfo=null;
o.buttons[0].setDisabled(true);
p.removeAll();
p.checked=false;
var q=p.getUI();
if(q&&q.toggleCheck){q.toggleCheck(false)
}p.loaded=false;
g.getUploadWindow().syncSize()
}n.getBottomToolbar().getComponent("upload-from-skydrive-bbar-label").setText(String.format(g.htcConfig.locData.CloudUploadTotalFiles,"0","0 bytes"))
}},isLoginFormVisible:function(){return !b.hidden
},isUploadPanelVisible:function(){return !h.hidden
},reResize:function(q,p){if(h&&h.rendered&&!h.hidden){var r=p-72;
if(k&&k.rendered&&!k.hidden){r-=k.getHeight()
}h.setHeight(r);
h.setWidth(q-10);
if(n&&n.rendered&&!n.hidden){n.setHeight(r-n.getPosition()[1]+h.getPosition()[1]-5);
n.setWidth(q-12)
}}}});
return o
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.DropboxAuth=function(u){var o,w=HttpCommander.Lib.Utils.browserIs,i=HttpCommander.Lib.Consts.CloudNames.dropbox,k,t=u.htcConfig.dropboxAppKey,n=null,a=null,h="HttpCommanderDropboxAccessTokenInfo",v=String.format(u.htcConfig.locData.CloudLibraryNotLoadedMsg,i),l=u.htcConfig.locData.CloudAuthNotCompleteMsg,x=(w.ie||w.edge)?(u.htcConfig.locData.CloudTrustedSitesMsg+"https://unpkg.com<br />https://www.dropbox.com<br />https://*.dropboxapi.com<br />https://*.dropboxstatic.com<br />"+(w.edge?("<br />("+u.htcConfig.locData.TrustedSitesForMicrosoftEdge+")"):"")):"",g=null;
if(Ext.isEmpty(x)){var b=l.toLowerCase().lastIndexOf("<br />");
if(b>0){l=l.substring(0,b)
}}try{g=(function(z){var y=[z,window.sessionStorage],A=0;
z=y[A++];
while(z){try{z.setItem(A,A);
z.removeItem(A);
break
}catch(B){z=y[A++]
}}if(!z){return null
}else{return z
}})(window.localStorage)
}catch(s){}var d=function(){var y=null;
if(g){try{y=g.getItem(h);
if(Ext.isEmpty(y)){y=null
}}catch(z){y=null
}}return y
};
var p=function(y){if(g){try{g.removeItem(h)
}catch(z){}if(!Ext.isEmpty(y)){try{g.setItem(h,y)
}catch(z){}}}};
var c=function(){if(a){try{clearTimeout(a)
}catch(y){}}a=null
};
var f=function(e){u.Msg.show({title:u.htcConfig.locData.CommonErrorCaption,msg:e,icon:u.Msg.ERROR,buttons:u.Msg.CANCEL})
};
var m=function(z,C){var y=null,B=false;
if(Ext.isObject(z)){if(z.status==401||!!z.response&&z.response.statusCode==401){B=true
}y=z.error;
if(!Ext.isObject(y)){try{y=JSON.parse(y)
}catch(A){}}if(Ext.isObject(y)){if(Ext.isObject(y.user_message)){y=y.user_message.text
}else{y=y.error_summary
}}if(Ext.isEmpty(y)&&Ext.isObject(z.response)){y=z.response.text||z.response.statusText
}}if(Ext.isEmpty(y)&&!!z){y=String(z)
}o.clearAuth();
if(Ext.isFunction(C)){y=Ext.util.Format.htmlEncode(Ext.isEmpty(y)?u.htcConfig.locData.UploadFromUrlUnknownResponse:y);
C(null,B?{msg:y,unauth:true}:y)
}};
var r=function(y,G,F){if(Ext.isDefined(window.Dropbox)){if(!k){k=new Dropbox({clientId:t})
}if(Ext.isEmpty(k.getAccessToken())){if(!n||Ext.isEmpty(n.token)){n={token:d()}
}if(!Ext.isEmpty(n.token)){k.setAccessToken(n.token);
p(n.token)
}else{o.clearAuth()
}}if(!Ext.isEmpty(k.getAccessToken())){c();
n={token:k.getAccessToken()};
p(n.token);
q(G,!y)
}else{if(u.htcConfig.isHostedMode){if(!!window.addEventListener){window.addEventListener("message",function(H){if(~H.origin.indexOf("https://ownwebdrive.com")&&H.data.dropbox){var e=H.data.dropbox;
n={token:e.access_token};
if(k){k.setAccessToken(n.token)
}q(G,!y)
}})
}else{if(!!window.attachEvent){window.attachEvent("onmessage",function(H){if(~H.origin.indexOf("https://ownwebdrive.com")&&H.data.dropbox){var e=H.data.dropbox;
n={token:e.access_token};
if(k){k.setAccessToken(n.token)
}q(G,!y)
}})
}}}u.globalLoadMask.hide();
c();
if(F===true){u.globalLoadMask.msg=String.format(u.htcConfig.locData.CloudCheckAuthMsg,i)+"...";
if(!u.isDemoMode()){u.globalLoadMask.show()
}var z=(scriptSource.substring(0,scriptSource.lastIndexOf("/"))+"/clouds/dropbox-callback.html").toLowerCase();
var B=u.htcConfig.isHostedMode?"https://"+window.location.hostname.substring(window.location.hostname.indexOf(".")+1,window.location.hostname.length).toLowerCase()+"/dropbox-callback.html":k.getAuthenticationUrl(z);
if(!Ext.isFunction(window.onDropboxAccessTokenCallback)){window.onDropboxAccessTokenCallback=function(H,e){if(!Ext.isEmpty(H)){if(k){k.setAccessToken(H)
}n={token:H};
p(n.token);
q(G,!y)
}else{if(Ext.isFunction(G)){G(null,e)
}}}
}var A=window.open(B,"dropboxpopup"+(new Date()).getTime(),HttpCommander.Lib.Utils.getPopupProps());
if(A){try{A.focus()
}catch(C){}}if(!u.htcConfig.isHostedMode){a=window.setInterval(function(){try{if(!A||A.closed){u.globalLoadMask.hide();
u.globalLoadMask.msg=u.htcConfig.locData.ProgressLoading+"...";
c();
if(!k||Ext.isEmpty(k.getAccessToken())){f(l+x)
}}}catch(H){u.globalLoadMask.hide();
u.globalLoadMask.msg=u.htcConfig.locData.ProgressLoading+"...";
c()
}},1000)
}}else{G(null)
}}}else{if((y&&u.htcConfig.enableUploadFromDropbox)||(!y&&u.htcConfig.enableDownloadToDropbox)){u.globalLoadMask.hide();
c();
u.globalLoadMask.msg=String.format(u.htcConfig.locData.CloudCheckAuthMsg,i)+"...";
u.globalLoadMask.show();
var D=false;
var E=null;
HttpCommander.Lib.Utils.includeJsFile({url:"https://unpkg.com/dropbox/dist/Dropbox-sdk.min.js",callback:function(){window.clearTimeout(E);
if(!D){D=true
}else{return
}u.globalLoadMask.hide();
u.globalLoadMask.msg=u.htcConfig.locData.ProgressLoading+"...";
if(!Ext.isDefined(window.Dropbox)){f(v+x)
}else{r(y,G)
}}});
E=window.setTimeout(function(){window.clearTimeout(E);
if(!D){D=true
}else{return
}u.globalLoadMask.hide();
u.globalLoadMask.msg=u.htcConfig.locData.ProgressLoading+"...";
if(!Ext.isDefined(window.Dropbox)){f(v+x)
}else{r(y,G)
}},15000)
}}};
var q=function(C,e,y){if(!Ext.isDefined(y)){C([{}]);
return
}var A={path:y||"",recursive:false,include_media_info:false,include_deleted:false};
var B=function(F,E){var D=F&&Ext.isArray(F.entries)?F.entries:[];
if(D.length>0){if(e){Ext.each(D,function(H){if(H[".tag"]=="folder"){E.push(H)
}})
}else{E=E.concat(D)
}}if(F&&F.has_more&&!Ext.isEmpty(F.cursor)){z(F.cursor,E)
}else{if(Ext.isFunction(C)){try{E.sort(function(J,H){var I,M;
if(!J||!H){return(!J&&H)?-1:((J&&!H)?1:0)
}var K=(J[".tag"]=="folder");
var L=(H[".tag"]=="folder");
if(K&&!L){return -1
}else{if(!K&&L){return 1
}else{I=String(J.name).toLowerCase();
M=String(H.name).toLowerCase();
return(I<M)?-1:((I>M)?1:0)
}}})
}catch(G){if(!!window.console&&!!window.console.log){window.console.log("Dropbox sort fail")
}}C(E)
}}};
var z=function(E,D){k.filesListFolderContinue(E).then(function(F){B(F,D)
},function(F){m(F,C)
})
};
k.filesListFolder(A).then(function(D){B(D,[])
},function(D){m(D,C)
})
};
return(o={checkAuth:r,getAuthInfo:function(){return n
},getFileList:q,clearAuth:function(z){c();
p(null);
n=null;
if(!(z===true)&&!!k){try{k.setAccessToken(null)
}catch(y){if(!!window.console&&!!window.console.log){window.console.log(y)
}}}},signOut:function(e){o.clearAuth(true);
if(!!k){k.authTokenRevoke().then(function(y){k.setAccessToken(null);
if(Ext.isFunction(e)){e()
}},function(y){if(!!window.console&&!!window.console.log){window.console.log(y||"")
}k.setAccessToken(null);
if(Ext.isFunction(e)){e()
}})
}else{if(Ext.isFunction(e)){e()
}}}})
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.DropboxTreeLoader=Ext.extend(Ext.tree.TreeLoader,{onlyFolders:false,api:null,load:function(b,c,a){if(this.clearOnLoad){while(b.firstChild){b.removeChild(b.firstChild)
}}if(this.doPreload(b)){this.runCallback(c,a||b,[b])
}else{if(this.api||this.directFn||this.dataUrl||this.url){this.requestData(b,c,a||b)
}}},requestData:function(d,f,b){if(this.fireEvent("beforeload",this,d,f)!==false){if(this.api){var e=this,c={callback:f,node:d,scope:b},a=e.onlyFolders;
e.api.getFileList(function(k,h,g){if(k&&Ext.isArray(k)){var i=[];
Ext.each(k,function(n,l,m){if(n&&(!a||(a&&n[".tag"]=="folder"))){i.push(Ext.copyTo({title:n.name,leaf:n[".tag"]!="folder",file:n[".tag"]!="folder",path:n.path_lower,checked:false,entryId:n.id},n,"name size"))
}});
e.handleResponse.apply(e,[{responseData:i,argument:c}])
}else{e.handleFailure.apply(e,[{error:h,argument:c}])
}},e.onlyFolders,d&&d.parentNode?d.attributes.path:"")
}}else{this.runCallback(f,b||d,[])
}}});
HttpCommander.Lib.UploadFromDropbox=function(b){var g=HttpCommander.Lib.Consts.CloudNames.dropbox,h,e,f,d,a;
var c=function(l,k){b.Msg.show({title:b.htcConfig.locData.CommonErrorCaption,msg:k?Ext.util.Format.htmlEncode(l):l,icon:b.Msg.ERROR,buttons:b.Msg.CANCEL})
};
var i=new Ext.FormPanel({frame:false,bodyStyle:"padding: 5px 5px 0px 5px;",border:false,bodyBorder:false,header:false,buttonAlign:"center",layout:"fit",items:[{xtype:"label",autoHeight:true,html:String.format(b.htcConfig.locData.CloudAuthenticateMessage,g,String.format(b.htcConfig.locData.CloudAuthenticateLink,g),'<img alt="" align="absmiddle" width="16" height="16" src="'+HttpCommander.Lib.Utils.getIconPath(b,"dropbox")+'"/>&nbsp;'+HttpCommander.Lib.Utils.getHelpLinkOpenTag(b.getUid(),"dropbox"),"</a>")+'<br /><br /><div style="text-align:center;width:100%;"><img alt="" align="absmiddle" width="16" height="16" src="'+HttpCommander.Lib.Utils.getIconPath(b,"dropbox")+'">&nbsp;<a href="#"'+(" id='"+b.getUid()+"_authDropboxUp_link'")+' target="_blank">'+String.format(b.htcConfig.locData.CloudAuthenticateLink,g)+"</a>"+(b.isDemoMode()&&!Ext.isEmpty(window.DropboxDemoName)&&!Ext.isEmpty(window.DropboxDemoPass)?('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.DropboxDemoName+'" />&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.DropboxDemoPass+'" /></span>'):"")+"</div>",listeners:{afterrender:function(k){i.bindAuthLink()
}}},h=new Ext.Panel({layout:"fit",hidden:true,border:false,items:[{xtype:"label",html:String.format(b.htcConfig.locData.CloudUploadSelectItemsMessage,g)},e=new Ext.form.Checkbox({boxLabel:b.htcConfig.locData.UploadJavaIgnorePaths,listeners:{check:function(l,m){if(!!d){var k=d.getChecked();
i.buttons[0].setDisabled(k==0)
}}}}),d=new Ext.tree.TreePanel({root:{text:String.format(b.htcConfig.locData.CloudRootFolderName,g),expaded:false,checked:false},useArrows:true,autoScroll:true,header:false,lines:false,loader:new HttpCommander.Lib.DropboxTreeLoader({api:b.getDropboxAuth(),onlyFolders:false,listeners:{beforeload:function(l,k){},load:function(m,l,k){b.globalLoadMask.hide();
b.globalLoadMask.msg=b.htcConfig.locData.ProgressLoading+"...";
i.changeDropboxUploadInfoFiles()
},loadexception:function(o,l,k){b.globalLoadMask.hide();
b.globalLoadMask.msg=b.htcConfig.locData.ProgressLoading+"...";
var n=false;
var m=!!k?((n=Ext.isObject(k.error))?k.error.msg:k.error):null;
if(n){i.clearAuthInfo()
}if(Ext.isEmpty(m)&&!n){m=b.htcConfig.locData.CommonLoadError
}if(!Ext.isEmpty(m)){c(m)
}}}}),bbar:new Ext.Toolbar({items:[a=new Ext.form.Label({html:String.format(b.htcConfig.locData.CloudUploadTotalFiles,"0","0 bytes")})]}),tbar:new Ext.Toolbar({enableOverflow:true,items:[{icon:HttpCommander.Lib.Utils.getIconPath(b,"gdrefresh"),text:b.htcConfig.locData.CommandRefresh,handler:function(){i.prepare(false)
}},"-",{icon:HttpCommander.Lib.Utils.getIconPath(b,"dropbox"),text:g,tooltip:'<b><img alt="" align="absmiddle" width="16" height="16" src="'+HttpCommander.Lib.Utils.getIconPath(b,"dropbox")+'">&nbsp;'+String.format(b.htcConfig.locData.CloudLinkText,g)+"</b><br/>"+String.format(b.htcConfig.locData.CloudLinkDescription,g),handler:function(){window.open("https://www.dropbox.com/")
}},"->",{text:String.format(b.htcConfig.locData.CloudSignInAsDifferentUserText,g),handler:function(){b.globalLoadMask.msg=b.htcConfig.locData.CloudRevokeTokenMsg+"...";
b.globalLoadMask.show();
var k=b.getDropboxAuth();
if(k){k.signOut(function(){b.globalLoadMask.hide();
b.globalLoadMask.msg=b.htcConfig.locData.ProgressLoading+"...";
i.changeViewDropboxFp(true)
})
}else{b.globalLoadMask.hide();
b.globalLoadMask.msg=b.htcConfig.locData.ProgressLoading+"...";
i.changeViewDropboxFp(true)
}}}]}),listeners:{load:function(k){Ext.each(k.childNodes,function(l){if(l.attributes.file&&l.attributes.size!="undefined"){l.text=l.attributes.text=Ext.util.Format.htmlEncode(l.attributes.title)+" ("+b.getRenderers().sizeRenderer(l.attributes.size)+")"
}else{l.text=l.attributes.text=Ext.util.Format.htmlEncode(l.attributes.title)
}if(l.attributes.file){l.attributes.icon=HttpCommander.Lib.Utils.getIconPath(b,"none")
}})
},render:function(k){k.on("checkchange",i.checkChangeDropboxUploadList)
}}})]})],buttons:[{hidden:true,disabled:true,text:b.htcConfig.locData.UploadSimpleUpload,handler:function(){var r=b.getCurrentFolder();
if(!r){b.Msg.alert(b.htcConfig.locData.UploadFolderNotSelectedTitle,b.htcConfig.locData.UploadFolderNotSelected);
return
}if(!b.htcConfig.currentPerms||!b.htcConfig.currentPerms.upload){b.Msg.alert(b.htcConfig.locData.UploadNotAllowedTitle,b.htcConfig.locData.UploadNotAllowedPrompt);
return
}var s=d.getChecked();
if(s.length==0){i.buttons[0].setDisabled(true);
c(String.format(b.htcConfig.locData.CloudUploadSelectItemsMessage,""),true);
return
}var q={path:r,ignorePaths:e.getValue(),files:[],folders:[]};
var m=[];
var k=[];
Ext.each(s,function(t){if(t.attributes.file){q.files.push({name:t.attributes.title,url:t.attributes.path});
if(!q.ignorePaths){m.push(t.attributes.path.toLowerCase())
}}else{if(!q.ignorePaths){k.push({name:t.attributes.title,url:t.attributes.path});
m.push(t.attributes.path.toLowerCase())
}}});
var l=m.length;
if(l>0){Ext.each(k,function(u){for(var t=0;
t<l;
t++){if(m[t].length>u.url.length&&m[t].indexOf(u.url.toLowerCase())==0){return
}}q.folders.push(u)
})
}if(q.files.length==0&&q.folders.length==0){i.buttons[0].setDisabled(true);
c(String.format(b.htcConfig.locData.CloudUploadSelectItemsMessage,""),true);
return
}var o=b.getDropboxAuth();
var n=o?o.getAuthInfo():null;
q.token=n?n.token:null;
var p=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
b.globalLoadMask.msg=String.format(b.htcConfig.locData.CloudUploadProgressMessage,g)+"...";
b.globalLoadMask.show();
HttpCommander.Dropbox.Upload(q,function(v,t){Ext.Ajax.timeout=p;
b.globalLoadMask.hide();
b.globalLoadMask.msg=b.htcConfig.locData.ProgressLoading+"...";
if(typeof v=="undefined"){c(Ext.util.Format.htmlEncode(t.message));
return
}if(!v.success){if(!v.connect){i.clearAuthInfo()
}c(v.message);
return
}if(d&&d.getRootNode()){HttpCommander.Lib.Utils.recursiveCheckTreeChildNodesWithoutExpand(d.getRootNode(),false);
i.buttons[0].setDisabled(true);
i.changeDropboxUploadInfoFiles()
}b.openTreeRecent();
b.openGridFolder(q.path,true,true);
if(v.filesSaved&&v.filesSaved>0){var u=String.format(b.htcConfig.locData.BalloonFilesUploaded,v.filesSaved);
if(v.filesRejected>0){u+="<br />"+String.format(b.htcConfig.locData.BalloonFilesNotUploaded,v.filesRejected)
}if(v.message&&v.message!=""){u+="<br />"+v.message
}b.showBalloon(u)
}})
}}],prepare:function(k){var l=b.getDropboxAuth();
if(l){l.checkAuth(true,function(m,n){if(m&&m.length>0&&typeof m[0]!="undefined"){i.changeViewDropboxFp(false);
i.getRootFolders()
}else{i.changeViewDropboxFp(true);
if(n){c(n)
}}},k)
}},bindAuthLink:function(){var k=document.getElementById(b.getUid()+"_authDropboxUp_link");
if(k){k.onclick=function(){i.prepare(true);
return false
}
}},getDropboxUploadPanel:function(){return h
},getDropboxItemsTree:function(){return d
},getRootFolders:function(){if(d){var k=d.getRootNode();
if(k){i.clearRootNode();
b.globalLoadMask.msg=String.format(b.htcConfig.locData.CloudLoadMsg,g)+"...";
b.globalLoadMask.show();
k.expanded=false;
k.attributes.path="";
k.expand(false,true)
}}},clearRootNode:function(){if(d){var k=d.getRootNode();
if(k){i.buttons[0].setDisabled(true);
k.removeAll();
k.checked=false;
var l=k.getUI();
if(l&&l.toggleCheck){l.toggleCheck(false)
}k.loaded=false;
b.getUploadWindow().syncSize()
}i.changeDropboxUploadInfoFiles()
}},changeViewDropboxFp:function(k){i.items.items[0].setVisible(k);
i.items.items[1].setVisible(!k);
i.buttons[0].setVisible(!k);
if(k&&b.getDropboxAuth()){b.getDropboxAuth().clearAuth()
}},changeDropboxUploadInfoFiles:function(){if(a){var m=0,l=0;
if(d){var k=d.getChecked();
Ext.each(k,function(n){if(n.attributes.file){m++;
l+=parseInt(n.attributes.size)
}})
}a.setText(String.format(b.htcConfig.locData.CloudUploadTotalFiles,m,b.getRenderers().sizeRenderer(String(l))),true)
}},checkChangeDropboxUploadList:function(l,k){if(d){d.un("checkchange",i.checkChangeDropboxUploadList);
HttpCommander.Lib.Utils.recursiveCheckTreeChildNodes(l,k);
HttpCommander.Lib.Utils.recursiveCheckTreeParentNodes(l,k);
d.on("checkchange",i.checkChangeDropboxUploadList);
i.changeDropboxUploadInfoFiles();
i.buttons[0].setDisabled(d.getChecked().length==0)
}},clearAuthInfo:function(){if(b.getDropboxAuth()){b.getDropboxAuth().clearAuth()
}i.changeViewDropboxFp(true);
b.getUploadWindow().syncSize()
}});
return i
};
HttpCommander.Lib.DownloadToDropboxWindow=function(d){var c,g=HttpCommander.Lib.Consts.CloudNames.dropbox,b,f,e;
var a=function(i,h){d.Msg.show({title:d.htcConfig.locData.CommonErrorCaption,msg:h?Ext.util.Format.htmlEncode(i):i,icon:d.Msg.ERROR,buttons:d.Msg.CANCEL})
};
c=new d.Window({title:d.htcConfig.locData.CommandDownloadToDropbox,bodyStyle:"padding: 5px",layout:"fit",width:400,plain:true,minWidth:320,minHeight:200,height:300,buttonAlign:"center",closeAction:"hide",collapsible:false,minimizable:false,closable:true,resizable:true,maximizable:true,modal:true,items:[{xtype:"label",hideLabel:true,autoHeight:true,margins:"0 0 5 0",html:String.format(d.htcConfig.locData.CloudAuthenticateMessage,g,String.format(d.htcConfig.locData.CloudAuthenticateLink,g),"<img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(d,"dropbox")+"'/>&nbsp;"+HttpCommander.Lib.Utils.getHelpLinkOpenTag(d.getUid(),"dropbox"),"</a>")+"<br /><br /><br /><div style='text-align:center;width:100%;'><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(d,"dropbox")+"'>&nbsp;<a id='"+d.getUid()+"_authDropboxDown_link' href='#' target='_self'>"+String.format(d.htcConfig.locData.CloudAuthenticateLink,g)+"</a>"+(d.isDemoMode()&&!Ext.isEmpty(window.DropboxDemoName)&&!Ext.isEmpty(window.DropboxDemoPass)?('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.DropboxDemoName+'" />&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.DropboxDemoPass+'" /></span>'):"")+"</div>",listeners:{afterrender:function(h){c.bindAuthLink(c)
}}},b=new Ext.form.Label({html:String.format(d.htcConfig.locData.CloudCheckFolerMessage,g),hidden:true}),f=new Ext.Panel({layout:"fit",height:230,hidden:true,anchor:"100%",tbar:new Ext.Toolbar({enableOverflow:true,items:[{icon:HttpCommander.Lib.Utils.getIconPath(d,"gdrefresh"),text:d.htcConfig.locData.CommandRefresh,handler:function(){if(d.getDropboxAuth()){d.getDropboxAuth().clearAuth()
}c.prepare(true)
}},"-",{icon:HttpCommander.Lib.Utils.getIconPath(d,"dropbox"),text:g,tooltip:'<b><img align="absmiddle" width="16" height="16" src="'+HttpCommander.Lib.Utils.getIconPath(d,"dropbox")+'">&nbsp;'+String.format(d.htcConfig.locData.CloudLinkText,g)+"</b><br/>"+String.format(d.htcConfig.locData.CloudLinkDescription,g),scope:this,handler:function(){window.open("https://www.dropbox.com/")
}},"->",{text:String.format(d.htcConfig.locData.CloudSignInAsDifferentUserText,g),handler:function(){d.globalLoadMask.msg=d.htcConfig.locData.CloudRevokeTokenMsg+"...";
d.globalLoadMask.show();
if(d.getDropboxAuth()){d.getDropboxAuth().signOut(function(){c.switchView(false);
d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"..."
})
}else{c.switchView(false);
d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"..."
}}}]}),items:[e=new Ext.tree.TreePanel({root:{text:String.format(d.htcConfig.locData.CloudRootFolderName,g),expaded:false,checked:false},hidden:true,useArrows:true,autoScroll:true,header:false,flex:1,anchor:"100%",lines:false,loader:new HttpCommander.Lib.DropboxTreeLoader({onlyFolders:true,api:d.getDropboxAuth(),listeners:{beforeload:function(i,h){},load:function(k,i,h){d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"..."
},loadexception:function(m,i,h){d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
var l=false;
var k=!!h?((l=Ext.isObject(h.error))?h.error.msg:h.error):null;
if(l){c.switchView(false)
}if(Ext.isEmpty(k)&&!l){k=d.htcConfig.locData.CommonLoadError
}if(!Ext.isEmpty(k)){a(k)
}}}}),listeners:{load:function(h){if(h.isRoot||!h.parentNode){var i=h.getUI?h.getUI():null;
if(i&&i.toggleCheck){i.toggleCheck(true)
}else{h.checked=true
}}Ext.each(h.childNodes,function(k){k.text=k.attributes.text=Ext.util.Format.htmlEncode(k.attributes.title)
})
},click:function(i){var h=i?i.getUI():null;
if(h){h.toggleCheck()
}},render:function(h){h.on("checkchange",c.checkChangeDropboxFolders)
}}})]})],buttons:[{text:d.htcConfig.locData.CommonButtonCaptionContinue,hidden:true,disabled:true,handler:function(){if(!d.htcConfig.enableDownloadToDropbox){return
}var i;
if(e){var h=e.getChecked();
if(h&&h.length>0&&h[0]){i=h[0]
}}if(!i){c.buttons[0].setDisabled(true);
return
}c.downloadToDropbox(i)
}},{text:d.htcConfig.locData.CommonButtonCaptionClose,handler:function(){c.hide()
}}],listeners:{afterrender:function(h){h.bindAuthLink(h)
},resize:function(l,i,h){if(f&&f.rendered&&!f.hidden&&f.getTopToolbar){var k=f.getTopToolbar();
if(k.rendered&&!k.hidden){f.setWidth(i-24)
}f.setHeight(l.body.getHeight()-b.getHeight()-10)
}}},bindAuthLink:function(h){var i=document.getElementById(d.getUid()+"_authDropboxDown_link");
if(i){i.onclick=function(){c.prepare(true);
return false
}
}},clearRootNode:function(){if(e){var h=e.getRootNode();
if(h){c.buttons[0].setDisabled(true);
h.removeAll();
h.checked=false;
var i=h.getUI();
if(i&&i.toggleCheck){i.toggleCheck(false)
}h.loaded=false
}}},switchView:function(h){if(b){b.setVisible(h)
}if(e){e.setVisible(h)
}if(f){f.setVisible(h)
}c.items.items[0].setVisible(!h);
c.buttons[0].setVisible(h);
if(!h){if(d.getDropboxAuth()){d.getDropboxAuth().clearAuth()
}c.clearRootNode()
}c.show();
c.syncSize()
},prepare:function(h){if(d.getDropboxAuth()){d.getDropboxAuth().checkAuth(false,function(i,k){d.Msg.hide();
d.globalLoadMask.hide();
if(i&&i.length>0&&typeof i[0]!="undefined"){c.switchView(true);
c.getRootFolders()
}else{c.switchView(false);
if(k){a(k)
}}},h)
}},checkChangeDropboxFolders:function(i,h){if(e){e.un("checkchange",c.checkChangeDropboxFolders);
if(h){Ext.each(e.getChecked(),function(k){if(k&&k!=i&&k.id!=i.id&&k.attributes.checked){k.getUI().toggleCheck(false);
k.attributes.checked=false
}})
}e.on("checkchange",c.checkChangeDropboxFolders);
c.buttons[0].setDisabled(e.getChecked().length==0)
}},getRootFolders:function(i){if(e){var h=e.getRootNode();
if(h){c.clearRootNode();
d.globalLoadMask.msg=String.format(d.htcConfig.locData.CloudLoadMsg,g)+"...";
d.globalLoadMask.show();
h.expanded=false;
h.attributes.path="";
h.expand(false,true)
}}},downloadToDropbox:function(l){var k=l&&l.attributes?l.attributes:{text:"",path:""};
var n=d.getDropboxAuth(),i=n&&n.getAuthInfo()?n.getAuthInfo().token:null;
if(Ext.isEmpty(i)){c.switchView(false);
return
}var h={token:i,selections:d.getCurrentSelectedSet(),dropboxFolder:k.path};
if(h.selections.files.length==0&&h.selections.folders.length==0){return
}var m=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
d.globalLoadMask.msg=String.format(d.htcConfig.locData.CloudDownloadingMessage,g)+"...";
d.globalLoadMask.show();
HttpCommander.Dropbox.Download(h,function(s,p){Ext.Ajax.timeout=m;
d.globalLoadMask.hide();
d.globalLoadMask.msg=d.htcConfig.locData.ProgressLoading+"...";
if(typeof s=="undefined"){a(Ext.util.Format.htmlEncode(p?(p.message||d.htcConfig.locData.UploadFromUrlUnknownResponse):d.htcConfig.locData.UploadFromUrlUnknownResponse));
return
}if(!s.connect){if(n){n.clearAuth()
}c.switchView(false);
if(!Ext.isEmpty(s.message)){a(s.message)
}else{if(!Ext.isEmpty(s.errors)){a(s.errors)
}}return
}if(!s.success){a(s.message||s.errors||d.htcConfig.locData.UploadFromUrlUnknownResponse);
return
}var o=k.text;
var r=s.downloaded>0&&s.foldersCreated<1?String.format(d.htcConfig.locData.CloudDownloadFilesSuccessMessage,s.downloaded,o,g):s.foldersCreated>1&&s.downloaded<0?String.format(d.htcConfig.locData.CloudFoldersCreatedSuccessMessage,s.foldersCreated,o,g):String.format(d.htcConfig.locData.CloudFilesFoldersSuccessMessage,s.downloaded,s.foldersCreated,o,g);
if(s.rejected>0||s.foldersRejected>0){r+="<br />"+(s.rejected>0&&s.foldersRejected<1?String.format(d.htcConfig.locData.CloudNotDownloadedFilesMessage,s.rejected):s.foldersRejected>0&&s.rejected<1?String.format(d.htcConfig.locData.CloudNotFoldersCreatedMessage,s.foldersRejected):String.format(d.htcConfig.locData.CloudNotFilesFoldersDownloadedMessage,s.rejected,s.foldersRejected))
}var q=true;
if(s.errors&&s.errors!=""){r+='<div style="width:100%;min-width:200px !important;overflow:auto;height:auto;max-height:75px;display:inline-block;">'+s.errors+"</div>";
q=false
}if(typeof s.newNames!="undefined"&&s.newNames!=""){r+=(r!=""?"<br />":"")+d.htcConfig.locData.CloudDownloadWithNewNames+'<div style="width:100%;min-width:200px !important;overflow:auto;height:auto;max-height:75px;display:inline-block;">'+s.newNames+"</div>"
}d.Msg.show({title:d.htcConfig.locData.CloudDownloadEndMessageTitle,msg:r+"<br /><br /><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(d,"dropbox")+"'>&nbsp;<a href='https://www.dropbox.com/' target='_blank'>"+String.format(d.htcConfig.locData.CloudLinkText,g)+"</a>",closable:false,modal:true,buttons:d.Msg.OK,icon:d.Msg.INFO,fn:function(t){if(t=="ok"&&s.foldersCreated>0&&l){l.expanded=false;
l.loaded=false;
l.expand(false,true)
}}})
})
}});
return c
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.BoxAuth=function(C){var t,D=HttpCommander.Lib.Utils.browserIs,n=HttpCommander.Lib.Consts.CloudNames.box,A=C.htcConfig.boxClientId,B="https://www.box.com/api/oauth2/authorize",p=null,h=null,v=null,c=false,r=false,l=null,a=null,z="HttpCommanderBoxAccessTokenInfo",o=C.htcConfig.locData.CloudAuthNotCompleteMsg,E=(D.ie||D.edge)?(C.htcConfig.locData.CloudTrustedSitesMsg+"https://*.box.com"+(D.edge?("<br />("+C.htcConfig.locData.TrustedSitesForMicrosoftEdge+")"):"")):"";
if(Ext.isEmpty(E)){var b=o.toLowerCase().lastIndexOf("<br />");
if(b>0){o=o.substring(0,b)
}}var d=function(){if(a){try{clearTimeout(a)
}catch(F){}}a=null
};
var g=function(e){C.Msg.show({title:C.htcConfig.locData.CommonErrorCaption,msg:e,icon:C.Msg.ERROR,buttons:C.Msg.OK})
};
var k=function(G){var e="";
for(var F in G){if(G.hasOwnProperty(F)){if(e){e+="&"
}e+=F+"="+encodeURIComponent(G[F])
}}return e
};
var y=function(e){return(e&&e.access_token&&e.refresh_token)?true:false
};
var m=function(){c=false;
p=p||f();
if(!y(p)){p=null;
u(null)
}if(p&&p.date&&p.expires_in){try{c=(p.date+p.expires_in*1000)<=(new Date()).getTime()
}catch(F){c=false
}}return p
};
var s=function(F){var e=m();
if(!y(F)){p=null
}else{if(!y(e)||F.access_token!=e.access_token||F.refresh_token!=e.refresh_token){p=F;
p.restricted_to=null;
p.date=(new Date()).getTime()
}}u(p)
};
var f=function(){var F=null;
if(i){try{F=i.getItem(z);
if(F){F=JSON.parse(F)
}else{F=null
}}catch(G){F=null
}}return F
};
var u=function(F){if(i){try{i.removeItem(z)
}catch(G){}if(F){try{i.setItem(z,JSON.stringify(F))
}catch(G){}}}};
var i=null;
try{i=(function(G){var F=[G,window.sessionStorage],H=0;
G=F[H++];
while(G){try{G.setItem(H,H);
G.removeItem(H);
break
}catch(I){G=F[H++]
}}if(!G){return null
}else{return G
}})(window.localStorage)
}catch(x){}var q=function(H,G,K){r=true;
var J=H&&Ext.isObject(H)?Ext.apply({},H):null;
if(J!=null){J.restricted_to=null
}var I=G?(Ext.isObject(G)?Ext.apply({},G):{error:null,error_description:String(G)}):null;
var e=(typeof K=="function"?K:null)||l;
var F=setTimeout(function(){clearTimeout(F);
d();
try{if(v&&!v.closed){v.close()
}}catch(L){}v=null;
s(J);
C.globalLoadMask.hide();
C.globalLoadMask.msg=C.htcConfig.locData.ProgressLoading+"...";
if(typeof e=="function"){e(y(p),I)
}},100)
};
var w=function(M,L){d();
if(!C.htcConfig.isAllowedBox){if(typeof M=="function"){M(null,"This operation is rejected because of limited permissions")
}return
}C.globalLoadMask.hide();
C.globalLoadMask.msg=String.format(C.htcConfig.locData.CloudCheckAuthMsg,n)+"...";
if(!C.isDemoMode()||!L){C.globalLoadMask.show()
}L=(L===true);
var H=m();
if(H||!L){if(c){t.refreshToken(M,L)
}else{q(H,null,M)
}return
}r=false;
var I=scriptSource;
var N=I.split("/");
N[N.length-2]="Handlers";
N[N.length-1]="BoxOAuth2Handler.ashx?hcuid="+encodeURIComponent(C.getUid());
I=N.join("/");
var G=B+"?"+k({response_type:"code",client_id:A,redirect_uri:I});
var K=C.getFileManagerInstance();
if(K&&typeof K.onBoxAccessToken!="function"){K.onBoxAccessToken=q
}l=M;
v=window.open(G,"boxoauthauthorize",HttpCommander.Lib.Utils.getPopupProps());
if(v){try{v.focus()
}catch(J){}}var F=setInterval(function(){if(v){var O=false;
try{O=v.closed
}catch(P){O=true
}if(O){if(F){clearInterval(F)
}v=null;
if(!r){q(null,{error:"cancelled",error_description:"Login has been cancelled"})
}}}else{if(F){clearInterval(F)
}}},100);
a=setTimeout(function(){C.globalLoadMask.hide();
C.globalLoadMask.msg=C.htcConfig.locData.ProgressLoading+"...";
if(a){d();
if(!L){var e=o+E;
if(M){M(false)
}else{g(e)
}}}else{d()
}},15000)
};
return(t={checkAuth:w,setAuthInfo:s,getAuthInfo:m,getUserInfo:function(){return h
},clearAuth:function(){s(null)
},refreshToken:function(G,F){var e=m();
if(y(e)){C.globalLoadMask.msg=String.format(C.htcConfig.locData.CloudRefreshTokenMsg,n)+"...";
C.globalLoadMask.show();
HttpCommander.Box.RefreshToken({tokenInfo:e},function(I,H){C.globalLoadMask.hide();
C.globalLoadMask.msg=C.htcConfig.locData.ProgressLoading+"...";
if(typeof I=="undefined"){g(Ext.util.Format.htmlEncode(H.message))
}else{q(I.tokenInfo,I.message,G)
}})
}else{t.checkAuth(G,F)
}},signOut:function(e){if(!y(p)){t.clearAuth();
if(typeof e=="function"){e(null)
}return
}C.globalLoadMask.msg=C.htcConfig.locData.CloudRevokeTokenMsg+"...";
C.globalLoadMask.show();
HttpCommander.Box.RevokeToken({tokenInfo:p},function(G,F){C.globalLoadMask.hide();
C.globalLoadMask.msg=C.htcConfig.locData.ProgressLoading+"...";
if(typeof G=="undefined"){g(Ext.util.Format.htmlEncode(F.message));
return
}if(G.success){t.clearAuth()
}if(typeof e=="function"){e(G.success?null:G.message)
}else{if(!G.success){g(G.message)
}}})
}})
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.BoxTreeLoader=Ext.extend(Ext.tree.TreeLoader,{processDirectResponse:function(a,b,c){if(b.status){this.handleResponse({responseData:Ext.isArray(a)?a:(Ext.isArray(a.data)?a.data:null),responseText:a,argument:c})
}else{this.handleFailure({argument:c})
}}});
HttpCommander.Lib.UploadFromBox=function(a){var e=HttpCommander.Lib.Consts.CloudNames.box,f,g,c,b,h;
var d=function(l,k){a.Msg.show({title:a.htcConfig.locData.CommonErrorCaption,msg:k?Ext.util.Format.htmlEncode(l):l,icon:a.Msg.ERROR,buttons:a.Msg.CANCEL})
};
var i=new Ext.FormPanel({frame:false,bodyStyle:"padding: 5px 5px 0px 5px;",border:false,bodyBorder:false,header:false,buttonAlign:"center",layout:"fit",items:[{xtype:"label",autoHeight:true,html:String.format(a.htcConfig.locData.CloudAuthenticateMessage,e,String.format(a.htcConfig.locData.CloudAuthenticateLink,e),'<img alt="" align="absmiddle" width="16" height="16" src="'+HttpCommander.Lib.Utils.getIconPath(a,"box")+'"/>&nbsp;'+HttpCommander.Lib.Utils.getHelpLinkOpenTag(a.getUid(),"box"),"</a>")+'<br /><br /><div style="text-align:center;width:100%;"><img alt="" align="absmiddle" width="16" height="16" src="'+HttpCommander.Lib.Utils.getIconPath(a,"box")+'">&nbsp;<a href="#" '+("id='"+a.getUid()+"_authBoxUp_link'")+' target="_blank">'+String.format(a.htcConfig.locData.CloudAuthenticateLink,e)+"</a>"+(a.isDemoMode()&&!Ext.isEmpty(window.BoxDemoName)&&!Ext.isEmpty(window.BoxDemoPass)?('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.BoxDemoName+'" />&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.BoxDemoPass+'" /></span>'):"")+"</div>",listeners:{afterrender:function(k){i.bindAuthLink()
}}},f=new Ext.Panel({layout:"fit",hidden:true,border:false,items:[{xtype:"label",html:String.format(a.htcConfig.locData.CloudUploadSelectItemsMessage,e)},g=new Ext.form.Checkbox({boxLabel:a.htcConfig.locData.UploadJavaIgnorePaths,listeners:{check:function(l,m){if(!!b){var k=b.getChecked();
i.buttons[0].setDisabled(k.length==0)
}}}}),b=new Ext.tree.TreePanel({root:{text:String.format(a.htcConfig.locData.CloudRootFolderName,e),expaded:false,checked:false},useArrows:true,autoScroll:true,header:false,lines:false,loader:c=new HttpCommander.Lib.BoxTreeLoader({directFn:HttpCommander.Box.GetFoldersInfo,baseParams:{path:"0",onlyFolders:false,accessToken:null,refreshToken:null,expiresIn:0,tokenType:"bearer"},paramOrder:["path","onlyFolders","accessToken","refreshToken","expiresIn","tokenType"],listeners:{beforeload:function(n,m){var l=a.getBoxAuth();
var k=l?l.getAuthInfo():null;
if(!k){i.clearAuthInfo();
a.getUploadWindow().syncSize();
i.changeBoxUploadInfoFiles();
return false
}this.baseParams.path=typeof m.attributes.path!="undefined"?m.attributes.path:"0";
this.baseParams.accessToken=k.access_token;
this.baseParams.refreshToken=k.refresh_token;
this.baseParams.expiresIn=k.expires_in||0;
this.baseParams.tokenType=k.token_type||"bearer";
this.baseParams.onlyFolders=false;
n.prevAjaxTimeout=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout
},load:function(n,l,k){if(n.prevAjaxTimeout){Ext.Ajax.timeout=n.prevAjaxTimeout
}a.globalLoadMask.hide();
a.globalLoadMask.msg=a.htcConfig.locData.ProgressLoading+"...";
var m=null;
if(k&&k.responseText&&(m=k.responseText.message)&&(m!="")){while(l.firstChild){l.removeChild(l.firstChild)
}if(k.responseText.noaccess===true){i.clearAuthInfo();
a.getUploadWindow().syncSize();
i.changeBoxUploadInfoFiles();
return
}else{a.Msg.show({title:a.htcConfig.locData.CommonErrorCaption,msg:m,icon:a.Msg.ERROR,buttons:a.Msg.OK})
}}if(k&&k.responseText&&k.responseText.tokenInfo&&a.getBoxAuth()){a.getBoxAuth().setAuthInfo(k.responseText.tokenInfo)
}i.changeViewBoxFp(false);
a.getUploadWindow().syncSize();
i.changeBoxUploadInfoFiles()
},loadexception:function(n,l,k){if(n.prevAjaxTimeout){Ext.Ajax.timeout=n.prevAjaxTimeout
}a.globalLoadMask.hide();
a.globalLoadMask.msg=a.htcConfig.locData.ProgressLoading+"...";
a.Msg.hide();
var m=k&&k.responseText&&k.responseText.message&&k.responseText.message.length>0?Ext.util.Format.htmlEncode(k.responseText.message):a.htcConfig.locData.CommonLoadError;
a.Msg.show({title:a.htcConfig.locData.CommonErrorCaption,msg:m,icon:a.Msg.ERROR,buttons:a.Msg.OK})
}}}),bbar:new Ext.Toolbar({items:[h=new Ext.form.Label({html:String.format(a.htcConfig.locData.CloudUploadTotalFiles,"0","0 bytes")})]}),tbar:new Ext.Toolbar({enableOverflow:true,items:[{icon:HttpCommander.Lib.Utils.getIconPath(a,"gdrefresh"),text:a.htcConfig.locData.CommandRefresh,handler:function(){i.getBoxItems()
}},"-",{icon:HttpCommander.Lib.Utils.getIconPath(a,"box")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=box":""),text:e,tooltip:'<b><img alt="" align="absmiddle" width="16" height="16" src="'+HttpCommander.Lib.Utils.getIconPath(a,"box")+'">&nbsp;'+String.format(a.htcConfig.locData.CloudLinkText,e)+"</b><br/>"+String.format(a.htcConfig.locData.CloudLinkDescription,e),handler:function(){window.open("https://app.box.com/files/")
}},"->",{text:String.format(a.htcConfig.locData.CloudSignInAsDifferentUserText,e),handler:function(){if(a.getBoxAuth()){a.getBoxAuth().signOut(function(k){if(!k){i.clearAuthInfo();
a.getUploadWindow().syncSize();
i.changeBoxUploadInfoFiles()
}else{a.Msg.alert(a.htcConfig.locData.CommonErrorCaption,k)
}})
}else{i.clearAuthInfo();
a.getUploadWindow().syncSize();
i.changeBoxUploadInfoFiles()
}}}]}),listeners:{load:function(k){Ext.each(k.childNodes,function(l){if(l.attributes.file&&l.attributes.size!="undefined"){l.text=l.attributes.text+" ("+a.getRenderers().sizeRenderer(String(l.attributes.size))+")"
}if(l.attributes.file){l.attributes.icon=HttpCommander.Lib.Utils.getIconPath(a,"none")
}})
},render:function(k){k.on("checkchange",i.checkChangeBoxUploadList)
}}})]})],buttons:[{hidden:true,disabled:true,text:a.htcConfig.locData.UploadSimpleUpload,handler:function(){var o=a.getCurrentFolder();
if(!o){a.Msg.alert(a.htcConfig.locData.UploadFolderNotSelectedTitle,a.htcConfig.locData.UploadFolderNotSelected);
return
}if(!a.htcConfig.currentPerms||!a.htcConfig.currentPerms.upload){a.Msg.alert(a.htcConfig.locData.UploadNotAllowedTitle,a.htcConfig.locData.UploadNotAllowedPrompt);
return
}var m=b.getChecked();
if(m.length==0){i.buttons[0].setDisabled(true);
d(String.format(a.htcConfig.locData.CloudUploadSelectItemsMessage,""),true);
return
}var q={path:o,ignorePaths:g.getValue(),files:[],folders:[]};
var l=[];
var r=[];
Ext.each(m,function(v){if(v.attributes.file){var u="";
if(!q.ignorePaths){var s=v.parentNode;
while(!!s&&(typeof s.isRoot=="undefined"||!s.isRoot)){u=s.attributes.name+(u.length>0?"/":"")+u;
s=s.parentNode
}}q.files.push({name:v.attributes.name,id:v.attributes.path,path:u});
if(!q.ignorePaths){l.push((u+(u.length>0?"/":"")+v.attributes.name).toLowerCase())
}}else{if(!q.ignorePaths){var w="";
var t=v.parentNode;
while(!!t&&(typeof t.isRoot=="undefined"||!t.isRoot)){w=t.attributes.name+(w.length>0?"/":"")+w;
t=t.parentNode
}w=w+(w.length>0?"/":"")+v.attributes.name;
l.push(w.toLowerCase());
r.push(w)
}}});
var n=l.length;
if(n>0){Ext.each(r,function(t){for(var s=0;
s<n;
s++){if(l[s].length>t.length&&l[s].indexOf(t.toLowerCase())==0){return
}}q.folders.push(t)
})
}if(q.files.length==0&&q.folders.length==0){i.buttons[0].setDisabled(true);
d(String.format(a.htcConfig.locData.CloudUploadSelectItemsMessage,""),true);
return
}var p=a.getBoxAuth();
q.tokenInfo=p?p.getAuthInfo():null;
var k=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
a.globalLoadMask.msg=String.format(a.htcConfig.locData.CloudUploadProgressMessage,e)+"...";
a.globalLoadMask.show();
HttpCommander.Box.Upload(q,function(u,s){Ext.Ajax.timeout=k;
a.globalLoadMask.hide();
a.globalLoadMask.msg=a.htcConfig.locData.ProgressLoading+"...";
if(typeof u=="undefined"){d(s.message,true);
return
}if(p){p.setAuthInfo(u.tokenInfo)
}if(!u.success){d(u.message);
if(!u.connect){i.clearAuthInfo()
}return
}if(b&&b.getRootNode()){HttpCommander.Lib.Utils.recursiveCheckTreeChildNodesWithoutExpand(b.getRootNode(),false);
i.buttons[0].setDisabled(true);
i.changeBoxUploadInfoFiles()
}a.openTreeRecent();
a.openGridFolder(q.path,true,true);
if(u.filesSaved&&u.filesSaved>0){var t=String.format(a.htcConfig.locData.BalloonFilesUploaded,u.filesSaved);
if(u.filesRejected>0){t+="<br />"+String.format(a.htcConfig.locData.BalloonFilesNotUploaded,u.filesRejected)
}if(!Ext.isEmpty(u.message)){t+="<br />"+u.message
}a.showBalloon(t)
}})
}}],prepare:function(k){var l=a.getBoxAuth();
if(l){l.checkAuth(function(m,n){if(m===true){i.changeViewBoxFp(false);
i.getRootFolders()
}else{i.changeViewBoxFp(true);
if(n){var o="";
if(Ext.isObject(n)){if(n.error_description){o=n.error_description
}else{o=JSON.stringify(n)
}}else{o=n
}a.Msg.show({title:a.htcConfig.locData.CommonErrorCaption,msg:o,icon:a.Msg.ERROR,buttons:a.Msg.OK})
}}},k)
}},bindAuthLink:function(){var k=document.getElementById(a.getUid()+"_authBoxUp_link");
if(k){k.onclick=function(){i.prepare(true);
return false
}
}},getBoxUploadPanel:function(){return f
},getBoxItemsTree:function(){return b
},getBoxItems:function(){i.prepare(false)
},getRootFolders:function(){if(b){var k=b.getRootNode();
if(k){i.clearRootNode();
a.globalLoadMask.msg=String.format(a.htcConfig.locData.CloudLoadMsg,e)+"...";
a.globalLoadMask.show();
k.expanded=false;
k.attributes.path="0";
k.expand(false,true)
}}},clearRootNode:function(){if(b){var k=b.getRootNode();
if(k){i.buttons[0].setDisabled(true);
k.removeAll();
k.checked=false;
var l=k.getUI();
if(l&&l.toggleCheck){l.toggleCheck(false)
}k.loaded=false;
a.getUploadWindow().syncSize()
}i.changeBoxUploadInfoFiles()
}},changeViewBoxFp:function(k){i.items.items[0].setVisible(k);
i.items.items[1].setVisible(!k);
i.buttons[0].setVisible(!k);
if(k&&a.getBoxAuth()){a.getBoxAuth().clearAuth()
}},changeBoxUploadInfoFiles:function(){if(h){var m=0,l=0;
if(b){var k=b.getChecked();
Ext.each(k,function(n){if(n.attributes.file){m++;
l+=parseInt(n.attributes.size)
}})
}h.setText(String.format(a.htcConfig.locData.CloudUploadTotalFiles,m,a.getRenderers().sizeRenderer(String(l))),true)
}},checkChangeBoxUploadList:function(l,k){if(b){b.un("checkchange",i.checkChangeBoxUploadList);
HttpCommander.Lib.Utils.recursiveCheckTreeChildNodes(l,k);
HttpCommander.Lib.Utils.recursiveCheckTreeParentNodes(l,k);
b.on("checkchange",i.checkChangeBoxUploadList);
i.changeBoxUploadInfoFiles();
i.buttons[0].setDisabled(b.getChecked().length==0)
}},clearAuthInfo:function(){if(a.getBoxAuth()){a.getBoxAuth().clearAuth()
}i.changeViewBoxFp(true);
a.getUploadWindow().syncSize()
}});
return i
};
HttpCommander.Lib.DownloadToBoxWindow=function(c){var b,f=HttpCommander.Lib.Consts.CloudNames.box,e,d,a;
b=new c.Window({title:c.htcConfig.locData.CommandDownloadToBox,bodyStyle:"padding: 5px",layout:"fit",width:400,plain:true,minWidth:320,minHeight:200,height:300,buttonAlign:"center",closeAction:"hide",collapsible:false,minimizable:false,closable:true,resizable:true,maximizable:true,modal:true,items:[{xtype:"label",hideLabel:true,autoHeight:true,margins:"0 0 5 0",html:String.format(c.htcConfig.locData.CloudAuthenticateMessage,f,String.format(c.htcConfig.locData.CloudAuthenticateLink,f),"<img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(c,"box")+"'/>&nbsp;"+HttpCommander.Lib.Utils.getHelpLinkOpenTag(c.getUid(),"box"),"</a>")+"<br /><br /><br /><div style='text-align:center;width:100%;'><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(c,"box")+"'>&nbsp;<a id='"+c.getUid()+"_authBoxDown_link' href='#' target='_self'>"+String.format(c.htcConfig.locData.CloudAuthenticateLink,f)+"</a>"+(c.isDemoMode()&&!Ext.isEmpty(window.BoxDemoName)&&!Ext.isEmpty(window.BoxDemoPass)?('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.BoxDemoName+'" />&nbsp;<input readonly onclick="this.select();" type="text" value="'+window.BoxDemoPass+'" /></span>'):"")+"</div>",listeners:{afterrender:function(g){b.bindAuthLink(b)
}}},e=new Ext.form.Label({html:String.format(c.htcConfig.locData.CloudCheckFolerMessage,f),hidden:true}),d=new Ext.Panel({layout:"fit",height:230,hidden:true,anchor:"100%",tbar:new Ext.Toolbar({enableOverflow:true,items:[{icon:HttpCommander.Lib.Utils.getIconPath(c,"gdrefresh"),text:c.htcConfig.locData.CommandRefresh,handler:function(){b.prepare(false)
}},"-",{icon:HttpCommander.Lib.Utils.getIconPath(c,"box")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=box":""),text:"Box",tooltip:'<b><img align="absmiddle" width="16" height="16" src="'+HttpCommander.Lib.Utils.getIconPath(c,"box")+'">&nbsp;'+String.format(c.htcConfig.locData.CloudLinkText,f)+"</b><br/>"+String.format(c.htcConfig.locData.CloudLinkDescription,f),scope:this,handler:function(){window.open("https://app.box.com/files/")
}},"->",{text:String.format(c.htcConfig.locData.CloudSignInAsDifferentUserText,f),handler:function(){if(c.getBoxAuth()){c.getBoxAuth().signOut(function(g){if(!g){b.switchView(false)
}else{c.Msg.alert(c.htcConfig.locData.CommonErrorCaption,g)
}})
}else{b.switchView(false)
}}}]}),items:[a=new Ext.tree.TreePanel({root:{text:String.format(c.htcConfig.locData.CloudRootFolderName,f),expaded:false,checked:false},hidden:true,useArrows:true,autoScroll:true,header:false,flex:1,anchor:"100%",lines:false,loader:new HttpCommander.Lib.BoxTreeLoader({directFn:HttpCommander.Box.GetFoldersInfo,baseParams:{path:"0",onlyFolders:true,accessToken:null,refreshToken:null,expiresIn:0,tokenType:"bearer"},paramOrder:["path","onlyFolders","accessToken","refreshToken","expiresIn","tokenType"],listeners:{beforeload:function(k,i){var h=c.getBoxAuth();
var g=h?h.getAuthInfo():null;
if(!g){b.switchView(false);
return false
}this.baseParams.path=typeof i.attributes.path!="undefined"?i.attributes.path:"0";
this.baseParams.accessToken=g.access_token;
this.baseParams.refreshToken=g.refresh_token;
this.baseParams.expiresIn=g.expires_in||0;
this.baseParams.tokenType=g.token_type||"bearer";
this.baseParams.onlyFolders=true;
k.prevAjaxTimeout=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout
},load:function(k,h,g){if(k.prevAjaxTimeout){Ext.Ajax.timeout=k.prevAjaxTimeout
}c.globalLoadMask.hide();
c.globalLoadMask.msg=c.htcConfig.locData.ProgressLoading+"...";
var i=null;
if(g&&g.responseText&&(i=g.responseText.message)&&(i!="")){while(h.firstChild){h.removeChild(h.firstChild)
}if(g.responseText.noaccess===true){b.switchView(false);
return
}else{c.Msg.show({title:c.htcConfig.locData.CommonErrorCaption,msg:g.responseText.message,icon:c.Msg.ERROR,buttons:c.Msg.OK})
}}if(g&&g.responseText&&g.responseText.tokenInfo&&c.getBoxAuth()){c.getBoxAuth().setAuthInfo(g.responseText.tokenInfo)
}},loadexception:function(k,h,g){if(k.prevAjaxTimeout){Ext.Ajax.timeout=k.prevAjaxTimeout
}c.globalLoadMask.hide();
c.globalLoadMask.msg=c.htcConfig.locData.ProgressLoading+"...";
c.Msg.hide();
var i=g&&g.responseText&&g.responseText.message&&g.responseText.message.length>0?Ext.util.Format.htmlEncode(g.responseText.message):c.htcConfig.locData.CommonLoadError;
c.Msg.show({title:c.htcConfig.locData.CommonErrorCaption,msg:i,icon:c.Msg.ERROR,buttons:c.Msg.OK})
}}}),listeners:{load:function(g){if(g.isRoot||!g.parentNode){var h=g.getUI?g.getUI():null;
if(h&&h.toggleCheck){h.toggleCheck(true)
}else{g.checked=true
}}},click:function(h){var g=h.getUI();
if(g){g.toggleCheck()
}},render:function(g){g.on("checkchange",b.checkChangeBoxFolders)
}}})]})],buttons:[{text:c.htcConfig.locData.CommonButtonCaptionContinue,hidden:true,disabled:true,handler:function(){if(!c.htcConfig.enableDownloadToBox){return
}var h;
if(a){var g=a.getChecked();
if(g&&g.length>0&&g[0]){h=g[0]
}}if(!h){b.buttons[0].setDisabled(true);
return
}b.downloadToBox(h)
}},{text:c.htcConfig.locData.CommonButtonCaptionClose,handler:function(){b.hide()
}}],listeners:{afterrender:function(g){g.bindAuthLink(g)
},resize:function(k,h,g){if(d&&d.rendered&&!d.hidden&&d.getTopToolbar){var i=d.getTopToolbar();
if(i.rendered&&!i.hidden){d.setWidth(h-24)
}d.setHeight(k.body.getHeight()-e.getHeight()-10)
}}},bindAuthLink:function(g){var h=document.getElementById(c.getUid()+"_authBoxDown_link");
if(h){h.onclick=function(){b.prepare(true);
return false
}
}},clearRootNode:function(){if(a){var g=a.getRootNode();
if(g){b.buttons[0].setDisabled(true);
g.removeAll();
g.checked=false;
var h=g.getUI();
if(h&&h.toggleCheck){h.toggleCheck(false)
}g.loaded=false
}}},switchView:function(g){if(e){e.setVisible(g)
}if(a){a.setVisible(g)
}if(d){d.setVisible(g)
}b.items.items[0].setVisible(!g);
b.buttons[0].setVisible(g);
if(!g){if(c.getBoxAuth()){c.getBoxAuth().clearAuth()
}b.clearRootNode()
}b.show();
b.syncSize()
},prepare:function(g){if(c.getBoxAuth()){c.getBoxAuth().checkAuth(function(k,h){if(k==true){b.switchView(true);
b.getRootFolders()
}else{b.switchView(false);
if(h){var i="";
if(Ext.isObject(h)){if(h.error_description){i=h.error_description
}else{i=JSON.stringify(h)
}}else{i=h
}c.Msg.show({title:c.htcConfig.locData.CommonErrorCaption,msg:i,icon:c.Msg.ERROR,buttons:c.Msg.OK})
}}},g)
}},checkChangeBoxFolders:function(h,g){if(a){a.un("checkchange",b.checkChangeBoxFolders);
if(g){Ext.each(a.getChecked(),function(i){if(i&&i!=h&&i.id!=h.id&&i.attributes.checked){i.getUI().toggleCheck(false);
i.attributes.checked=false
}})
}a.on("checkchange",b.checkChangeBoxFolders);
b.buttons[0].setDisabled(a.getChecked().length==0)
}},getRootFolders:function(h){if(a){var g=a.getRootNode();
if(g){b.clearRootNode();
c.globalLoadMask.msg=String.format(c.htcConfig.locData.CloudLoadMsg,f)+"...";
c.globalLoadMask.show();
g.expanded=false;
g.attributes.path="0";
g.expand(false,true)
}}},downloadToBox:function(i){var k=i&&i.attributes?i.attributes:{name:"",path:""};
var m=c.getBoxAuth(),g=m&&m.getAuthInfo()?m.getAuthInfo():null;
if(!g){b.switchView(false);
return
}var h={tokenInfo:g,selections:c.getCurrentSelectedSet(),boxFolder:k.path};
if(h.selections.files.length==0&&h.selections.folders.length==0){return
}var l=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
c.globalLoadMask.msg=String.format(c.htcConfig.locData.CloudDownloadingMessage,f)+"...";
c.globalLoadMask.show();
HttpCommander.Box.Download(h,function(r,o){Ext.Ajax.timeout=l;
c.globalLoadMask.hide();
c.globalLoadMask.msg=c.htcConfig.locData.ProgressLoading+"...";
if(typeof r=="undefined"){c.Msg.alert(c.htcConfig.locData.CommonErrorCaption,Ext.util.Format.htmlEncode(o.message));
return
}if(m){m.setAuthInfo(r.tokenInfo)
}if(!r.connect){if(m){m.clearAuth()
}b.switchView(false);
if(r.message&&r.message!=""){c.Msg.alert(c.htcConfig.locData.CommonErrorCaption,r.message)
}else{if(r.errors&&r.errors!=""){c.Msg.alert(c.htcConfig.locData.CommonErrorCaption,r.errors)
}}return
}if(!r.success){c.Msg.alert(c.htcConfig.locData.CommonErrorCaption,r.message&&r.message!=""?r.message:r.errors);
return
}var n=k.text;
var q=r.downloaded>0&&r.foldersCreated<1?String.format(c.htcConfig.locData.CloudDownloadFilesSuccessMessage,r.downloaded,n,f):r.foldersCreated>1&&r.downloaded<0?String.format(c.htcConfig.locData.CloudFoldersCreatedSuccessMessage,r.foldersCreated,n,f):String.format(c.htcConfig.locData.CloudFilesFoldersSuccessMessage,r.downloaded,r.foldersCreated,n,f);
if(r.rejected>0||r.foldersRejected>0){q+="<br />"+(r.rejected>0&&r.foldersRejected<1?String.format(c.htcConfig.locData.CloudNotDownloadedFilesMessage,r.rejected):r.foldersRejected>0&&r.rejected<1?String.format(c.htcConfig.locData.CloudNotFoldersCreatedMessage,r.foldersRejected):String.format(c.htcConfig.locData.CloudNotFilesFoldersDownloadedMessage,r.rejected,r.foldersRejected))
}var p=true;
if(r.errors&&r.errors!=""){q+='<div style="width:100%;min-width:200px !important;overflow:auto;height:auto;max-height:75px;display:inline-block;">'+r.errors+"</div>";
p=false
}if(typeof r.newNames!="undefined"&&r.newNames!=""){q+=(q!=""?"<br />":"")+c.htcConfig.locData.BoxDownloadWithNewNames+'<div style="width:100%;min-width:200px !important;overflow:auto;height:auto;max-height:75px;display:inline-block;">'+r.newNames+"</div>"
}c.Msg.show({title:c.htcConfig.locData.CloudDownloadEndMessageTitle,msg:q+"<br /><br /><img align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(c,"box")+"'>&nbsp;<a href='https://app.box.com/files/' target='_blank'>"+String.format(c.htcConfig.locData.CloudLinkText,f)+"</a>",closable:false,modal:true,buttons:c.Msg.OK,icon:c.Msg.INFO,fn:function(s){if(s=="ok"&&r.foldersCreated>0&&i){i.expanded=false;
i.loaded=false;
i.expand(false,true)
}}})
})
}});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.ImageViewerWindow=function(a){var i,b;
var f=27;
var e=a.getMaxHeightThumb()+33+2*f;
var d="100% -"+e;
var h=new Ext.util.DelayedTask(function(){if(b){var n=b.getSelectionModel();
if(n){g.selectNextImageInImageViewer(n);
var k=n.getSelected();
var m=b.getStore();
if(m.indexOf(k)>=m.getCount()-1){var l=i.getBottomToolbar().getComponent("play-stop-images-btn");
l.toggle(false,false)
}return
}}h.cancel()
});
var c={enableOverflow:true,buttonAlign:"center",html:'<div style="position:relative;height:0px;"><div id="'+a.$("image-simple-info")+'" style="text-align:left;top:4px;position:absolute;left:1px;float:left;"></div></div>',items:[{itemId:"first-image-btn",iconCls:"x-tbar-page-first",tooltip:a.htcConfig.locData.ImageViewerFirstImageTip,handler:function(){g.selectFirstImageInImageViewer()
}},{itemId:"prev-image-btn",iconCls:"x-tbar-page-prev",tooltip:a.htcConfig.locData.ImageViewerPreviousImageTip,handler:function(){g.selectPreviousImageInImageViewer()
}},{itemId:"play-stop-images-btn",enableToggle:true,icon:a.htcConfig.relativePath+"Images/play.png",tooltip:a.htcConfig.locData.ImageViewerRunSlideShow,disabled:true,toggleHandler:function(k,l){k.setIcon(a.htcConfig.relativePath+"Images/"+(l?"stop":"play")+".png");
k.setTooltip(l?a.htcConfig.locData.ImageViewerStopSlideShow:a.htcConfig.locData.ImageViewerRunSlideShow);
i.slideShow=l;
if(l){h.delay(4000)
}else{h.cancel()
}}},{itemId:"next-image-btn",iconCls:"x-tbar-page-next",tooltip:a.htcConfig.locData.ImageViewerNextImageTip,handler:function(){g.selectNextImageInImageViewer()
}},{itemId:"last-image-btn",iconCls:"x-tbar-page-last",tooltip:a.htcConfig.locData.ImageViewerLastImageTip,handler:function(){g.selectLastImageInImageViewer()
}}]};
var g=new a.Window({modal:true,maximizable:true,closeAction:"hide",layout:"fit",width:640,height:480,plain:true,items:[new Ext.form.FormPanel({plain:true,layout:"border",border:false,frame:false,baseCls:"x-plain",items:[i=new Ext.Panel({anchor:d,autoScroll:true,baseCls:"x-plain",region:"center",border:false,frame:false,bodyCfg:{tag:"center"},bbar:new Ext.Toolbar(c),tpl:new Ext.Template('<table border="0" cellpadding="0" cellspacing="0" style="border:0px;padding:0px;margin:0px;width:100%;height:100%;vertical-align:middle;text-align:center;"><tr><td>{content}</td></tr></table>'),listeners:{resize:function(k,p,n,m,o){var l=k.body.dom.getElementsByTagName("img")[0];
if(l&&l.complete){g.changeImageSize(l,false,{width:p||k.getWidth(),height:n||k.getHeight()},k.naturalImgSize)
}}}}),b=new Ext.grid.GridPanel({autoScroll:true,height:e,keys:{key:[Ext.EventObject.LEFT,Ext.EventObject.RIGHT,Ext.EventObject.HOME,Ext.EventObject.END],fn:function(k){switch(k){case Ext.EventObject.LEFT:g.selectPreviousImageInImageViewer();
break;
case Ext.EventObject.RIGHT:g.selectNextImageInImageViewer();
break;
case Ext.EventObject.HOME:g.selectFirstImageInImageViewer();
break;
case Ext.EventObject.END:g.selectLastImageInImageViewer();
break
}return true
},scope:this,stopEvent:true},view:new HttpCommander.Lib.ThumbView({htcCfg:a.htcConfig,maxWidthThumb:a.getMaxWidthThumb(),maxHeightThumb:a.getMaxHeightThumb(),tpl:a.getThumbnailTpl(),htcUid:a.getUid(),rowSelector:"div.thumbnailedItem",listeners:{refresh:function(k){var n=b;
var o=n.getStore().getCount();
var m=i.getBottomToolbar();
if(m){m.getComponent("first-image-btn").setDisabled(o<=0);
m.getComponent("prev-image-btn").setDisabled(o<=0);
m.getComponent("next-image-btn").setDisabled(o<=0);
m.getComponent("last-image-btn").setDisabled(o<=0);
m.getComponent("play-stop-images-btn").setDisabled(o<=1)
}var p=k.getRow(0);
if(p){var l=o*(p.offsetWidth+10);
k.mainBody.setWidth(l);
n.getColumnModel().setColumnWidth(0,l)
}}}}),hideHeaders:true,collapsible:true,region:"south",anchor:"100%",autoWidth:true,enableColumnResize:false,bodyCfg:{tag:"center"},trackMouseOver:false,columns:[{dataIndex:"name"}],store:new Ext.data.JsonStore({fields:["name","icon","rowtype","datemodified","size","size_hidden"],data:[]}),selModel:new Ext.grid.RowSelectionModel({singleSelect:true,listeners:{beforerowselect:function(n,m,l,k){if(g.needLoadImage===true){i.el.mask(a.htcConfig.locData.ImageViewerLoadingImageMessage+"...","x-mask-loading")
}return true
},rowselect:function(n,s,o){var l=b.getView();
if(g.needLoadImage===true){var r="";
if(Ext.isDate(o.data.datemodified)){r="date="+o.data.datemodified.getTime()+"&"
}var k=a.htcConfig.relativePath+"Handlers/Download.ashx?"+r+"action=view&file="+encodeURIComponent(a.getCurrentFolder())+"/"+encodeURIComponent(o.data.name);
if(i.slideShow===true){h.cancel()
}i.update({content:"<img onload=\"HttpCommander.Main.FileManagers['"+a.getUid()+"'].changeImageSize(this);\"onclick=\"HttpCommander.Main.FileManagers['"+a.getUid()+"'].showImageRealSize(this);\"onerror=\"HttpCommander.Main.FileManagers['"+a.getUid()+'\'].imageLoadError(this);"style="background-color:Transparent;visibility:hidden;" align="absmiddle" src="'+k+'" />'})
}g.needLoadImage=true;
var p=i.getBottomToolbar();
var u=b.getStore().getCount();
p.getComponent("first-image-btn").setDisabled(s==0);
p.getComponent("prev-image-btn").setDisabled(s==0);
p.getComponent("next-image-btn").setDisabled(s==u-1);
p.getComponent("last-image-btn").setDisabled(s==u-1);
var q=p.getComponent("play-stop-images-btn");
if(q){if(s==u-1){q.toggle(false,false);
q.setDisabled(true)
}else{q.setDisabled(false)
}}var m=l.getRow(s).offsetWidth+10;
var t=(s*m)+m/2;
var v=b.getWidth()/2;
l.scroller.dom.scrollLeft=t>v?Math.floor(t-v):0;
l.focusRow(s)
}}}),multiSelect:false,listeners:{afterrender:function(k){k.getView().refresh(false)
},resize:function(q,n,s,t,p){var l=q.getView();
var o=q.getSelectionModel();
if(l&&o&&o.hasSelection()){var k=o.getSelected();
if(k){var u=q.getStore().indexOf(k);
var m=l.getRow(u).offsetWidth+10;
var v=(u*m)+m/2;
var w=(n||q.getWidth())/2;
var r=l.scroller.dom.scrollWidth-l.scroller.dom.clientWidth;
l.scroller.dom.scrollLeft=v>w?Math.floor(v-w):0;
l.focusRow(u)
}}}}})]})],listeners:{beforehide:function(k){k.restore();
b.expand();
k.doLayout()
},hide:function(l){l.restore();
l.selectedRowNum=-1;
var k=b.getStore();
k.loadData([]);
k.commitChanges();
i.slideShow=false;
h.cancel();
i.getBottomToolbar().getComponent("play-stop-images-btn").toggle(false,false);
i.update({content:"&nbsp;"});
a.openTreeRecent()
},show:function(k){if(a.getView()){k.setSize(Math.floor(a.getView().getWidth()*0.8),Math.floor(a.getView().getHeight()*0.8))
}k.center();
g.selectThumbinalInImageViewer(k)
},render:function(k){a.getFileManager().changeImageSize=function(){g.changeImageSize.apply(g,arguments)
};
a.getFileManager().showImageRealSize=function(){g.showImageRealSize.apply(g,arguments)
};
a.getFileManager().imageLoadError=function(){g.imageLoadError.apply(g,arguments)
}
}},changeImageSize:function(q,s,x,o){if(!q){return
}if(typeof(s)!="boolean"){s=true
}try{var n=x||i.getSize()
}catch(t){return
}if(s&&!i){return
}if(!s&&!x&&!o){return
}var p={width:q.naturalWidth||q.width,height:q.naturalHeight||q.height};
o=s?p:o||p;
i.naturalImgSize=o;
n.width-=2;
n.height-=(2+f);
var v,r;
Ext.QuickTips.unregister(q);
if(o.width>n.width||o.height>n.height){if(o.width>=o.height){v=n.width;
r=o.height*v/o.width;
if(r>n.height){r=n.height;
v=o.width*r/o.height
}}else{r=n.height;
v=o.width*r/o.height;
if(v>n.width){v=n.width;
r=o.height*v/o.width
}}Ext.QuickTips.register({target:q,text:a.htcConfig.locData.ImageViewerShowRealImageSize});
q.realSize=false
}else{v=o.width;
r=o.height;
q.realSize=true
}q.style.width=String(v)+"px";
q.style.height=String(r)+"px";
if(s){i.el.unmask();
q.style.visibility="visible";
var m=document.getElementById(a.$("image-simple-info"));
if(m){var l=b.getStore();
var k=b.getSelectionModel().getSelected();
var u="&nbsp;";
if(l&&k){u="<b>"+String.format(a.htcConfig.locData.ImageViewerImageSimpleInfo,l.indexOf(k)+1,l.getCount(),Ext.util.Format.htmlEncode(k.data.name),String(o.width)+"x"+String(o.height))+"</b>"
}m.innerHTML=u
}if(i.slideShow===true){h.delay(4000)
}}},selectFirstImageInImageViewer:function(k){k=k||b.getSelectionModel();
k.selectFirstRow()
},selectPreviousImageInImageViewer:function(k){k=k||b.getSelectionModel();
k.selectPrevious(false)
},selectNextImageInImageViewer:function(k){k=k||b.getSelectionModel();
return k.selectNext(false)
},selectLastImageInImageViewer:function(k){k=k||b.getSelectionModel();
k.selectLastRow(false)
},selectThumbinalInImageViewer:function(l,k){l=l||g;
k=k||b;
if(l&&k&&typeof l.selectedRowNum=="number"&&l.selectedRowNum>=0){try{k.getSelectionModel().selectRow(l.selectedRowNum)
}catch(m){a.ProcessScriptError(m)
}}},showImageRealSize:function(k){if(k&&k.complete===true){Ext.QuickTips.unregister(k);
if(i&&i.naturalImgSize){if(k.realSize!==true){k.style.width=String(i.naturalImgSize.width)+"px";
k.style.height=String(i.naturalImgSize.height)+"px";
Ext.QuickTips.register({target:k,text:a.htcConfig.locData.ImageViewerShowImageSizeOfWindow});
k.realSize=true
}else{g.changeImageSize(k,false,i.getSize(),i.naturalImgSize)
}}}},imageLoadError:function(l){if(i){i.el.unmask();
i.update({content:"<b>"+a.htcConfig.locData.ImageViewerImageLoadErrorMessage+"</b>"});
var n=document.getElementById(a.$("image-simple-info"));
if(n){var m=b.getStore();
var k=b.getSelectionModel().getSelected();
var o="&nbsp;";
if(m&&k){o="<b>"+String.format(a.htcConfig.locData.ImageViewerImageSimpleInfo,m.indexOf(k)+1,m.getCount(),Ext.util.Format.htmlEncode(k.data.name),"...")+"</b>"
}n.innerHTML=o
}if(i.slideShow===true){h.delay(4000)
}}},showImageViewer:function(l,s,r){g.hide();
var o=[];
var p=-1,n=0;
Ext.each(r.data.items,function(v){var t=v.data.size||v.data.size_hidden,u=0;
if(!Ext.isEmpty(t)&&String(t).trim().length>0){u=parseFloat(t);
if(isNaN(u)||!isFinite(u)){u=0
}}if(v.data.rowtype=="file"&&u>0&&HttpCommander.Lib.Consts.imagesFileTypes.indexOf(";"+HttpCommander.Lib.Utils.getFileExtension(v.data.name)+";")!=-1){o.push({name:v.data.name,icon:v.data.icon,rowtype:"file",datemodified:v.data.datemodified,size:v.data.size,size_hidden:v.data.size_hidden});
if(v===l){p=n
}n++
}});
g.selectedRowNum=p;
if(p>=0){i.el.mask(a.htcConfig.locData.ImageViewerLoadingImageMessage+"...","x-mask-loading");
var m="";
if(Ext.isDate(l.data.datemodified)){m="date="+l.data.datemodified.getTime()+"&"
}var k=a.htcConfig.relativePath+"Handlers/Download.ashx?"+m+"action=view&file="+encodeURIComponent(a.getCurrentFolder())+"/"+encodeURIComponent(l.data.name);
i.update({content:"<img onload=\"HttpCommander.Main.FileManagers['"+a.getUid()+"'].changeImageSize(this);\"onclick=\"HttpCommander.Main.FileManagers['"+a.getUid()+"'].showImageRealSize(this);\"onerror=\"HttpCommander.Main.FileManagers['"+a.getUid()+'\'].imageLoadError(this);"style="background-color:Transparent;visibility:hidden;" align="absmiddle" src="'+k+'" />'});
var q=b.getStore();
q.baseParams.path=a.getCurrentFolder();
q.loadData(o);
q.commitChanges();
g.setTitle(String.format(a.htcConfig.locData.ImageViewerWindowTitle,"\\"+Ext.util.Format.htmlEncode(s).replace(/\//g,"\\")));
g.needLoadImage=false;
g.show();
setTimeout(a.openTreeRecent,1000)
}}});
return g
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.Html5ChunkedUpload=function(e){var f=this;
this.available=true;
this.available=HttpCommander.Lib.Utils.isChunkedUploadSupported();
if(!f.available){return false
}var i={FILE_READY:0,FILE_UPLOADING:1,FILE_COMPLETE:2,FILE_STOPPED:3,FILE_ERROR:4};
var w=function(){return(""+(new Date()).getTime()+""+Math.floor(Math.random()*1000000)).substr(0,18)
};
var l=function(){if(f.options.debug===true&&window.console&&window.console.log){window.console.log(arguments)
}};
var d=function(C,D,E,G){var F=this;
D=D.replace(/\\/g,"/");
if(D.lastIndexOf("/")>0){D=D.substring(D.length,D.lastIndexOf("/")+1)
}this.id=C;
this.cb=null;
this.status=0;
this.relativePath=G;
this.name=D;
this._size=!isNaN(E)&&E>0?E:-1;
this.bytesLoaded=0;
this.serverResponse="";
this.size=this._size;
this.fileSize=this._size
};
var a=null;
var q="FilePath",z="FileName",A="FileId",m="FileSize",o="FilesCount",s="StartByte",n="Complete",g="QuerySize",v="IsMultiPart",y="File",r="Path";
f.currentState=i.FILE_READY;
this.requestTime=-1;
this.options=Ext.apply({},e);
this.sendBlobInForm=true;
this.progressInfo=new (function(){var C=this;
this.totalSize=0;
this.uploadedFiles=0;
this.uploadedSize=0;
this.startTime=new Date();
this.stopTime=new Date();
this.lastProgressTime=new Date();
this.lastBytes=0;
this.bandwidth=0;
this.avgBw=[];
this.lastBwStore=new Date();
this.avBwCurr=0;
this.avBwCount=0;
this.lastError=null;
this.getBandwdth=function(){var F=0,E=0,D=C.avgBw.length;
for(E=0;
E<D;
E++){F+=C.avgBw[E]
}return D>0?F/D:0
};
this.reset=function(D){C.resetStat(D);
C.resetProgress(D)
};
this.resetStat=function(D){var E=f.getFileStat();
C.totalFiles=E[0];
if(D){C.weights.push(C.totalSize)
}else{C.weights=[]
}C.totalSize=(D?C.totalSize:0)+E[1];
C.uploadedFiles=E[2];
C.uploadedSize=D?C.uploadedSize:E[3]
};
this.resetProgress=function(D){if(!D){C.startTime=new Date()
}C.stopTime=new Date();
C.lastProgressTime=new Date();
C.lastBwStore=new Date();
C.lastBytes=0;
C.bandwidth=0;
C.avgBw=[];
C.avBwCurr=0
};
this.onProgress=function(F){var E=new Date();
C.stopTime=E;
var G=E.getTime()-C.lastProgressTime.getTime();
var D=F-C.lastBytes;
if(D>0){C.uploadedSize+=D;
if(G<=0){G=1
}C.bandwidth=(D/(G/1000));
if(E.getTime()-C.lastBwStore.getTime()>500||C.avgBw.length==0){if(C.avBwCurr<C.avBwCount){C.avgBw.push(C.bandwidth)
}else{C.avgBw[C.avBwCur]=C.bandwidth
}C.avBwCurr++;
C.lastBwStore=E
}C.lastProgressTime=E;
C.lastBytes=F
}}
})();
this.setUploadInfo=function(C){f.uploadInfo=Ext.apply({},C)
};
var c=function(C){l("files added");
if(f.currentState!=i.FILE_UPLOADING){f.currentState=i.FILE_READY
}f.files=f.getFiles();
if(f.currentState!=i.FILE_UPLOADING){f.progressInfo.reset()
}else{f.progressInfo.resetStat()
}if(Ext.isFunction(f.options.onAddFiles)){f.options.onFilesAdded(C)
}};
var h=function(){l("on upload start");
f.currentState=i.FILE_UPLOADING;
f.progressInfo.reset();
if(Ext.isFunction(f.options.onUploadStart)){f.options.onUploadStart()
}};
var B=function(C){l("on file upload start");
f.currentState=i.FILE_UPLOADING;
var D=f.getFile(C);
f.progressInfo.lastBytes=0;
if(D){D.status=i.FILE_UPLOADING;
D.bytesLoaded=0;
D.error=""
}if(Ext.isFunction(f.options.onFileUploadStart)){f.options.onFileUploadStart(D)
}};
var u=function(C,D){l("on file upload progress");
if(f.currentState!=i.FILE_STOPPED){f.setCurrentState=i.FILE_UPLOADING
}var E=f.getFile(C);
if(E){E.bytesLoaded=D
}f.progressInfo.onProgress(D);
if(Ext.isFunction(f.options.onFileUploadProgress)){f.options.onFileUploadProgress(E,f.progressInfo)
}};
var x=function(){l("on upload complete");
f.currentState=i.FILE_COMPLETE;
if(Ext.isFunction(f.options.onUploadComplete)){f.options.onUploadComplete(null,{result:{filesSaved:f.progressInfo.uploadedFiles,filesRejected:f.progressInfo.totalFiles-f.progressInfo.uploadedFiles,msg:f.progressInfo.lastError}})
}};
var p=function(C,E){l("on file upload complete");
var D=f.getFile(C);
f.progressInfo.uploadedFiles++;
if(D){D.serverResponse=E;
if(f.currentState!=i.FILE_ERROR){D.status=i.FILE_COMPLETE
}D.bytesLoaded=D.size;
D.error="";
u(C,D.size)
}if(Ext.isFunction(f.options.onFileUploadComplete)){f.options.onFileUploadComplete(D,E)
}};
var b=function(C,F,D){l("on file upload error");
f.currentState=i.FILE_ERROR;
var E=f.getFile(C);
if(E){E.status=i.FILE_ERROR;
E.bytesLoaded=0;
E.error=(F?(""+F+". "):"")+D+"."
}f.progressInfo.lastError=D;
if(Ext.isFunction(f.options.onFileUploadError)){f.options.onFileUploadError(E,F,D)
}};
var t=function(){l("on upload stop");
f.progressInfo.stopTime=new Date();
if(f.currentState!=i.FILE_ERROR){f.currentState=i.FILE_READY
}if(Ext.isFunction(f.options.onUploadStop)){f.options.onUploadStop()
}};
var k=function(C){l("on file upload stop");
var D=f.getFile(C);
if(D){if(f.currentState!=i.FILE_ERROR){D.status=i.FILE_STOPPED
}D.bytesLoaded=0;
D.error=""
}t();
if(Ext.isFunction(f.options.onFileUploadStop)){f.options.onFileUploadStop(D)
}};
this.files=[];
this._files=[];
this.ids=[];
this.currentId=null;
this.chunkSize=!Ext.isNumber(this.options.chunkSize)||this.options.chunkSize<0?262144:this.options.chunkSize;
this.url=this.options.url||"Handlers/ChunkedUpload.ashx";
this.timeout=Ext.isNumber(this.options.timeout)&&this.options.timeout>0?this.options.timeout:4294967295;
this.getFileStat=function(){var E=[f.files.length,0,0,0];
for(var D=0,C=f.files.length;
D<C;
D++){E[1]+=f.files[D].size>0?f.files[D].size:0;
if(f.files[D].status==i.FILE_COMPLETE){E[2]++;
E[3]+=f.files[D].size>0?f.files[D].size:0
}}return E
};
this.addFiles=function(J){f.clearList();
var I=J&&J.target&&J.target.files?J.target.files:J&&J.files?J.files:[],H=[],C=null,K=null,E=null,D=0;
for(var F=0,G=I.length;
F<G;
F++){C=I[F];
if(C.name!=""&&C.name!="."){E=w();
f.files[E]=C;
f.files.push(C);
f.ids.push(E);
K=C.webkitRelativePath||C.relativePath;
C=new d(E,C.name||C.fileName,C.size||C.fileSize,K?K:null);
H.push(C);
D+=C.size
}}for(var F=0;
F<H.length;
F++){f._files[H[F].id]=H[F];
f._files.push(H[F])
}};
this.getFiles=function(){return f._files
};
this.getFilesCount=function(){return f.getFiles().length
};
this.getFile=function(){return f.getFiles()[arguments[1]]
};
this.clearList=function(){for(var C=f._files.length-1;
C>=0;
C--){f.removeFile(f._files[C].id,true)
}f.files=[];
f._files=[];
f.id=[];
f.progressInfo.reset();
f.currentState=i.FILE_READY;
f.currentId=null
};
this.removeFile=function(C){if(f.ids.indexOf(C)>=0){f.ids.splice(f.ids.indexOf(C),1)
}if(f.files[C]){f.files.splice(f.files.indexOf(f.files[C]),1);
f.files[C]=null;
delete f.files[C]
}if(f._files[C]){f._files.splice(f._files.indexOf(f._files[C]),1);
f._files[C]=null;
delete f._files[C]
}};
this.stop=function(){if(f.checkTimer){clearInterval(f.checkTimer)
}if(!f.stopped){f.stopped=true;
if(f.xhr&&f.xhr.readyState!=4){f.xhr.abort()
}}};
this.upload=function(){f.requestTime=-1;
f.stopped=false;
h();
f.uploadQueue=f.ids.slice();
f.uploadNext()
};
this.appendToUploadQueue=function(C){for(var D=C.length-1;
D>=0;
D--){f.uploadQueue.push(C[D].id)
}};
this.resumeUpload=function(){f.progressInfo.uploadedSize-=f._files[f.currentId].bytesLoaded;
f._files[f.currentId].bytesLoaded=0;
f.progressInfo.lastBytes=0;
f.uploadNext()
};
this.uploadNext=function(){f.xhr=null;
f.currentId=f.uploadQueue.shift();
f.chunkSize=!Ext.isNumber(f.options.chunkSize)||f.options.chunkSize<0?262144:f.options.chunkSize;
if(f.currentId&&!f.stopped&&f._files[f.currentId]&&f._files[f.currentId].status!=i.FILE_COMPLETE){f.doChunkedUpload(f.currentId)
}else{if(f.uploadQueue.length>0){f.uploadNext()
}else{x()
}}};
this.getMultipart=function(G){var H="----"+w(),C="--",F="\r\n",D="",E;
G.setRequestHeader("Content-Type","multipart/form-data; boundary="+H);
for(name in f.postFields){if(f.postFields.hasOwnProperty(name)){E=f.postFields[name];
if(name==y){D+=C+H+F+'Content-Disposition: form-data; name="'+name+'"; filename="binarydata"'+F+"Content-Type: application/octet-stream"+F+F+E+F
}else{D+=C+H+F+'Content-Disposition: form-data; name="'+name+'"'+F+F+unescape(encodeURIComponent(E))+F
}}}D+=C+H+C+F;
return D
};
this.sendFileChunks=function(J,H,I){var E=f.files[J];
var C=f._files[J];
var D=navigator.userAgent.toLowerCase();
function G(M,Q){a=a||new FileReader();
var P=M;
var O=P+f.chunkSize<C.size?P+f.chunkSize:C.size;
l("loadNextChunk "+P+" - "+O+" reader "+a);
a.onerror=function(R){var S="An error occurred reading file.";
switch(R.target.error.code){case R.target.error.NOT_FOUND_ERR:S="File Not Found!";
break;
case R.target.error.NOT_READABLE_ERR:S="File is not readable";
break;
default:S="An error occurred reading file."
}b(f.currentId,"",S);
l("upload next: error in read");
f.uploadNext()
};
function K(R){if(a.readyState==FileReader.DONE){if(a.removeEventListener){a.removeEventListener("loadend",K)
}else{a.onload=null
}F(J,P,a.result)
}}l("before set loadend  reader.addEventListener "+a.addEventListener);
if(a.addEventListener){a.addEventListener("loadend",K)
}else{a.onload=K
}l("after set loadend");
try{l("before slice");
var L=window.File.prototype.slice||window.File.prototype.mozSlice||window.File.prototype.webkitSlice;
l("slice "+L);
if(window.FormData){if(f.sendBlobInForm){F(J,P,L.call(E,P,O))
}else{l("before call of readAsBinaryString");
a.readAsBinaryString(L.call(E,P,O))
}}else{l("FormData is not supported "+L);
a.readAsArrayBuffer(L.call(E,P,O))
}}catch(N){l("error on read file: "+N)
}}function F(M,W,R){l("sendFileChunk "+W);
var Y=W?W:0;
var K=262144000;
if(R&&R.length){f.chunkSize=R.length
}if(R&&R.size){f.chunkSize=R.size
}var T=f.chunkSize;
var X=Y+f.chunkSize>=C.size;
l("startByte:"+Y+" chunkSize : "+f.chunkSize+" isLastChunk "+X);
var O=null;
var N=HttpCommander.Lib.Utils.getXhrInstance();
f.xhr=N;
var P=f.url;
try{P+=(P.indexOf("?")<0?"?":"&")+"rand="+w()+"&";
if(!window.FormData||typeof(R)==="string"){l("FormData is not supported ");
P+=z+"="+encodeURIComponent(f._files[M].name)+"&";
P+=s+"="+Y+"&";
P+=n+"="+X+"&";
P+=A+"="+M;
if(f.uploadInfo){for(upInfoKey in f.uploadInfo){if(f.uploadInfo.hasOwnProperty(upInfoKey)){P+="&"+upInfoKey+"="+encodeURIComponent(f.uploadInfo[upInfoKey])
}}}}try{N.open("POST",P,true);
N.timeout=f.timeout;
N.setRequestHeader("If-Modified-Since","Sat, 1 Jan 2005 00:00:00 GMT")
}catch(V){}if(window.FormData){l("FormData supported "+typeof(R));
O=new FormData();
f.postFields=[];
f.postFields[q]=f._files[M].relativePath;
f.postFields[z]=f._files[M].name;
f.postFields[A]=M;
f.postFields[m]=C.size;
f.postFields[o]=f._files.length;
f.postFields[n]=X?"true":"false";
f.postFields[v]="true";
f.postFields[s]=Y;
if(X){Ext.each(f.options.customFormFields,function(Z){f.postFields[Z.name]=Z.value
})
}if(typeof(R)!=="string"){for(key in f.postFields){if(f.postFields.hasOwnProperty(key)){O.append(key,f.postFields[key])
}}if(f.uploadInfo){for(upInfoKey in f.uploadInfo){if(f.uploadInfo.hasOwnProperty(upInfoKey)){O.append(upInfoKey,f.uploadInfo[upInfoKey])
}}}O.append(y,R)
}else{f.postFields[y]=R;
O=f.getMultipart(N)
}}}catch(V){return
}if(N.upload){N.upload.onloadstart=function(Z){f.requestTime=new Date().getTime();
N.upload.removeEventListener("loadstart",arguments.callee)
};
N.upload.onprogress=function(Z){};
N.upload.onerror=function(Z){l("error in xhr");
f.onNetwrokProblem(0,this.statusText?this.statusText:"")
};
N.upload.onabort=function(Z){k(f.currentId)
}
}function L(){l("upload chunk request "+this.readyState);
if(this.readyState==4&&!f.stopped){R=null;
delete R;
O=null;
delete O;
var ac=this.responseText;
if(this.status>=200&&this.status<300){if(this.removeEventListener){this.removeEventListener("loadend",L)
}if(ac&&ac!=""){b(M,null,ac);
l("upload next : last chunk");
setTimeout(function(){f.uploadNext()
},1);
return
}if(!X){l("Server response "+ac);
var aa=(f.requestTime>=0)?(new Date().getTime()-f.requestTime):1;
if(aa<=0){aa=1
}if(f.options.chunkSize<0&&f.requestTime>0){var Z=Math.round(f.chunkSize/aa*1000);
var ab=Math.round(f.progressInfo.getBandwdth());
l("current avarage bandwidth: "+ab);
l("max bandwith with current chunksize: "+Z);
if(Z>ab){if(Z>f.chunkSize){if(Z<K){f.chunkSize=Math.round(Z)
}else{f.chunkSize=Math.round(K)
}l("increase cunksize to : "+f.chunkSize)
}}if(f.options.maxChunkSize&&f.chunkSize>f.options.maxChunkSize){f.chunkSize=f.options.maxChunkSize
}}u(M,Y+f.chunkSize>C.size?C.size:Y+f.chunkSize);
l("Start read from"+(Y+T)+" chunk size is "+f.chunkSize);
N=null;
f._xhr=null;
delete N;
delete f._xhr;
G(Y+T,f.chunkSize)
}else{setTimeout(function(){p(M,ac)
},1);
l("upload next : last chunk");
setTimeout(function(){f.uploadNext()
},1)
}}else{l("upload next : bad response code");
f.onNetwrokProblem(this.status,ac)
}}else{if(f.stopped){R=null;
O=null;
delete R;
delete O;
N=null;
f._xhr=null;
delete N;
delete f._xhr;
k(f.currentId)
}}}N.onreadystatechange=L;
if(!f.stopped){if(typeof R!=="string"){N.send(O?O:R)
}else{if(N.sendAsBinary){N.sendAsBinary(O)
}else{var U=O.length,S=new Uint8Array(U),Q=0;
for(Q=0;
Q<U;
Q++){S[Q]=(O.charCodeAt(Q)&255)
}O=null;
delete O;
N.send(S.buffer);
S.buffer=null;
delete S.buffer;
S=null;
delete S
}}}else{k(f.currentId)
}R=null;
delete R
}G(H,I)
};
this.doChunkedUpload=function(D,J,L,G){var E=f.files[D];
var P=f._files[D];
var O=HttpCommander.Lib.Utils.getXhrInstance();
var H=!J?true:false;
var N=!H?(L?L:0):0;
var C=16384000;
if(!E){l("no file!")
}l("startByte:"+N+" chunkSize : "+f.chunkSize);
var I=f.chunkSize;
var M=!H&&N+f.chunkSize>=P.size;
var F=f.url;
try{F+=(F.indexOf("?")<0?"?":"&")+"rand="+w()+"&";
F+=g+"=true&";
F+=z+"="+encodeURIComponent(f._files[D].name)+"&";
F+=s+"=0&";
F+=n+"=false&";
F+=A+"="+D;
if(f.uploadInfo){for(upInfoKey in f.uploadInfo){if(f.uploadInfo.hasOwnProperty(upInfoKey)){F+="&"+upInfoKey+"="+encodeURIComponent(f.uploadInfo[upInfoKey])
}}}}catch(K){l(K);
b(f.currentId,0,K)
}try{O.open("POST",F,true);
O.timeout=f.timeout
}catch(K){l(K)
}O.addEventListener("error",function(Q){l("xhr error while check file on server");
f.onNetwrokProblem(0,O&&O.statusText?O.statusText:"")
},false);
O.addEventListener("abort",function(Q){k(f.currentId)
},false);
O.onreadystatechange=function(S){l("check request onreadystatechange"+this.readyState);
if(this.readyState==4&&!f.stopped){var R=this.responseText;
if(this.status>=200&&this.status<300){try{B(f.currentId);
N=parseInt(R)||0;
f.progressInfo.uploadedSize+=N;
f._files[D].bytesLoaded=N;
f.progressInfo.lastBytes=N;
setTimeout(function(){f.sendFileChunks(D,N,f.chunkSize)
},10)
}catch(Q){l(Q)
}}else{l("upload next : bad response code");
f.onNetwrokProblem(this.status,this.responseText)
}O.onreadystatechange=null;
O=null;
delete O
}};
if(!f.stopped){O.send()
}else{k(f.currentId)
}};
this.onNetwrokProblem=function(C,D){if(f.options.checkConnectionOnIOError){if(!f.checkTimer&&!f.stopped){f.uploadQueue.unshift(f.currentId);
f.checkStartTime=new Date().getTime();
f.checkTimer=setInterval(f.checkConnection,f.options.checkConnectionInterval?f.options.checkConnectionInterval:2000)
}}else{if(f.currentId){b(f.currentId,C,D)
}setTimeout(function(){f.uploadNext()
},1)
}};
this.checkConnection=function(){var F=(f.options.checkConnectionUntil?f.options.checkConnectionUntil:10)*60;
var E=(new Date().getTime()-f.checkStartTime)/1000;
if(E>F){clearInterval(f.checkTimer);
f.checkTimer=null;
b(f.currentId,0,"");
f.stop()
}else{var G=HttpCommander.Lib.Utils.getXhrInstance();
var D=f.url;
D+=(D.indexOf("?")<0?"?":"&")+"rand="+w();
try{G.open("GET",D,true);
G.timeout=1000
}catch(C){l(C)
}G.addEventListener("error",function(H){if(G){G.onreadystatechange=null;
G=null;
delete G
}},false);
G.onreadystatechange=function(I){if(this.readyState==4){var H=this.responseText;
if(this.status>=200&&this.status<300&&f.checkTimer){clearInterval(f.checkTimer);
f.checkTimer=null;
f.resumeUpload()
}G.onreadystatechange=null;
G=null;
delete G
}};
G.send()
}}
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.SimpleUpload=function(a){var k,g="multiplefileuploadfield",h=a.getAllowSetFileNameAtSimpleUpload()?"fileuploadfield":g,e=new HttpCommander.Lib.Html5ChunkedUpload({url:a.htcConfig.relativePath+"Handlers/ChunkedUpload.ashx",chunkSize:262144});
var f=e&&e.available;
var i=[{itemId:"simple-upload-notes",xtype:"label"},{xtype:h,hideLabel:true,buttonText:a.htcConfig.locData.UploadBrowseLabel},{xtype:h,hideLabel:true,buttonText:a.htcConfig.locData.UploadBrowseLabel},{xtype:h,hideLabel:true,buttonText:a.htcConfig.locData.UploadBrowseLabel}];
if(f){i.push({itemId:"simple-upload-chunked-label",xtype:"label",visible:false},{itemId:"simple-upload-chunked",xtype:g,hideLabel:true,buttonText:a.htcConfig.locData.UploadBrowseLabel,chunkedUpload:true,onchangeForChunked:e.addFiles})
}else{i.push({xtype:h,hideLabel:true,buttonText:a.htcConfig.locData.UploadBrowseLabel})
}if(HttpCommander.Lib.Utils.browserIs.dndFolders){i.push({itemId:"simple-upload-checkboxes",xtype:"container",anchor:"100%",layout:"column",items:[{itemId:"simple-upload-folders-checkbox",xtype:"checkbox",checked:false,hideLabel:true,columnWidth:0.35,boxLabel:'<img alt="" style="vertical-align:middle;" width="16" height="16" src="'+HttpCommander.Lib.Utils.getIconPath(a,"folder")+'"/>&nbsp;'+a.htcConfig.locData.UploadSimpleUploadFolderLabelCollapsed,listeners:{check:function(l,o){var m=k.getComponent("simple-upload-checkboxes");
var n=k.getComponent("simple-upload-folders");
n.el.dom.parentNode.parentNode.parentNode.style.visibility=o?"visible":"hidden";
var p=m.items.items[1];
p.setVisible(o);
p.el.dom.parentNode.style.display=o?"":"none";
if(!o){n.reset();
p.reset()
}}}},{itemId:"simple-upload-ignore-path",xtype:"checkbox",checked:false,columnWidth:0.65,hideLabel:true,boxLabel:a.htcConfig.locData.UploadJavaIgnorePaths,hidden:true}]},{hideLabel:true,buttonText:a.htcConfig.locData.UploadSimpleUploadFolderButtonText+"...",itemId:"simple-upload-folders",xtype:g,anchor:"100%",uploadFolders:true,listeners:{afterrender:function(l){l.el.dom.parentNode.parentNode.parentNode.style.visibility="hidden"
}}})
}var d=0;
if(a.htcConfig.uploadFormFields&&a.htcConfig.uploadFormFields.length>0){var b={text:"textfield",checkbox:"checkbox",multiline:"textarea",select:"combo"};
uploadFormFields=[];
d=20;
Ext.each(a.htcConfig.uploadFormFields,function(m){var l=[];
if(m.type=="select"){Ext.each(m.values,function(n){l.push([n,n])
})
}d+=50;
uploadFormFields.push({itemId:"uploadFormField_"+m.name+"_Label",xtype:"label",text:m.description});
if(m.type=="select"){uploadFormFields.push({itemId:"uploadFormField_"+m.name,name:"uploadFormField_"+m.name,xtype:b[m.type],hideLabel:true,lazyInit:false,lazyRender:false,store:new Ext.data.ArrayStore({id:0,fields:["valueID","displayText"],data:l}),autoShow:true,mode:"local",editable:false,typeAhead:false,autoSelect:true,selectOnFocus:true,triggerAction:"all",valueField:"valueID",displayField:"displayText",validator:m.required?function(n){return n?true:"Value is required"
}:null})
}else{uploadFormFields.push({itemId:"uploadFormField_"+m.name,name:"uploadFormField_"+m.name,xtype:b[m.type],fieldLabel:m.name,hideLabel:true,validator:m.required?function(n){return n?true:"Value is required"
}:null})
}});
i.push({xtype:"fieldset",collapsible:false,autoHeight:true,defaults:{anchor:"90%"},anchor:"100%",defaultType:"textfield",items:uploadFormFields})
}var c=function(l){a.Msg.show({title:a.htcConfig.locData.CommonErrorCaption,msg:l||"Unknown error",icon:a.Msg.ERROR,buttons:a.Msg.CANCEL})
};
k=new Ext.FormPanel({fileUpload:true,frame:false,bodyStyle:"padding: 5px 5px 0 5px;",border:false,bodyBorder:false,header:false,defaults:{anchor:(HttpCommander.Lib.Utils.browserIs.ie&&a.htcConfig.styleName&&a.htcConfig.styleName.indexOf("azzurra")>=0)?"95%":"100%"},labelWidth:40,additionalHeight:d,items:i,resetFields:function(){k.getForm().reset();
var l=k.getComponent("simple-upload-chunked");
if(!!l){l.reset()
}if(f){e.clearList()
}},buttons:[{text:a.htcConfig.locData.UploadSimpleReset,handler:function(){k.resetFields()
}},{text:a.htcConfig.locData.UploadSimpleUpload,handler:function(){if(k.getForm().isValid()){var n=a.getCurrentFolder();
if(!n){a.Msg.alert(a.htcConfig.locData.UploadFolderNotSelectedTitle,a.htcConfig.locData.UploadFolderNotSelected);
return
}if(!a.htcConfig.currentPerms||!a.htcConfig.currentPerms.upload){a.Msg.alert(a.htcConfig.locData.UploadNotAllowedTitle,a.htcConfig.locData.UploadNotAllowedPrompt);
return
}var r=false;
var p=false;
var o=true;
var m=null;
if(m=k.getComponent("simple-upload-checkboxes")){var l=m.items.items[1];
if(l&&l.isVisible()){o=l.getValue()
}}Ext.each(k.getForm().items.items,function(u){if(u.xtype!="checkbox"){var v=u.getFiles?u.getFiles():u.value;
if(v){if(typeof v=="string"){var x;
if(x=u.getValue()||u.value){p=true;
var w=x.lastIndexOf("\\");
if(w<0){w=x.lastIndexOf("/")
}if(w!=-1){x=x.substring(w+1)
}if(a.gridItemExists(x)){r=true
}}}else{for(var t=0;
t<v.length;
t++){if(v[t].name==="."){continue
}p=true;
var y="";
if(!o&&v[t].webkitRelativePath&&v[t].webkitRelativePath!=""){y=v[t].webkitRelativePath.split(/[\/\\]/)[0]
}if(!y||y.length==0){y=v[t].name
}if(a.gridItemExists(y)){r=true
}}}}}});
if(!p){return
}if(r){var s=a.isModifyAllowed();
var q=s&&!HttpCommander.Lib.Utils.browserIs.ios;
a.Msg.show({title:a.htcConfig.locData.UploadFilesAlreadyExists,msg:q?String.format(a.htcConfig.locData.UploadOverwriteOrRenameFiles,a.htcConfig.locData.ExtMsgButtonTextYES,a.htcConfig.locData.ExtMsgButtonTextNO):a.htcConfig.locData.UploadRenamedExistingFiles,buttons:q?a.Msg.YESNOCANCEL:a.Msg.OKCANCEL,icon:q?a.Msg.QUESTION:a.Msg.INFO,fn:function(t){if(t=="ok"||t=="yes"||t=="no"){k.uploadFiles(n,t=="ok"||t=="no")
}}})
}else{k.uploadFiles(n,true)
}}}}],uploadFiles:function(r,s){var x={Path:r};
var n=a.htcConfig.relativePath+"Handlers/Upload.ashx?path="+encodeURIComponent(r);
if(s||HttpCommander.Lib.Utils.browserIs.ios){n+="&rename=true";
x.Rename="true"
}var u=null;
if(u=k.getComponent("simple-upload-checkboxes")){var t=u.items.items[1];
if(t&&t.isVisible()){var p=t.getValue();
n+="&ignorepath="+p;
x.IgnorePath=""+p
}}if(a.getAllowSetFileNameAtSimpleUpload()){var D="";
for(var C=0,w=k.getForm().items.items,B=w.length;
C<B;
C++){var m=w[C];
var o,E;
if((o=m.value)&&(E=m.getValue())){var q=o.lastIndexOf("\\");
if(q<0){q=o.lastIndexOf("/")
}if(q!=-1){o=o.substring(q+1)
}q=E.lastIndexOf("\\");
if(q<0){q=E.lastIndexOf("/")
}if(q!=-1){E=E.substring(q+1)
}if(o.toLowerCase()!==E.toLowerCase()&&E.trim()!=""){D+="&fileName"+String(C)+"="+encodeURIComponent(E)
}}}n+=D
}var A=a.Msg.show({title:a.htcConfig.locData.CommonProgressPleaseWait,msg:"<img src='"+HttpCommander.Lib.Utils.getIconPath(a,"ajax-loader.gif")+"' class='filetypeimage'>&nbsp;"+a.htcConfig.locData.UploadInProgress+"...",closable:false,modal:true,width:220,buttons:{cancel:a.htcConfig.locData.StopUploadingButtonText},fn:k.stopUpload,scope:k});
var v=k.getComponent("simple-upload-chunked");
if(v&&Ext.isFunction(v.setFileInputDisabled)){v.setFileInputDisabled(true)
}var F=null,z=f&&e.getFilesCount()>0;
var y=function(H,J){var K=true;
if(!F){K=false;
F={filesSaved:J&&J.result?(J.result.filesSaved||0):0,filesRejected:J&&J.result?(J.result.filesRejected||0):0,msg:J&&J.result?J.result.msg:null};
if(F.filesSaved<0){F.filesSaved=0
}if(F.filesRejected<0){F.filesRejected=0
}if(z){return
}}if(v&&Ext.isFunction(v.setFileInputDisabled)){v.setFileInputDisabled(false)
}a.Msg.hide();
if(K&&J&&J.result){if(J.result.filesSaved){F.filesSaved+=J.result.filesSaved
}if(J.result.filesRejected>0){F.filesRejected+=J.result.filesRejected
}if(J.result.msg){F.msg=J.result.msg
}}if(J&&J.failureType){switch(J.failureType){case Ext.form.Action.CLIENT_INVALID:F.msg=a.htcConfig.locData.UploadInvalidFormFields;
break;
case Ext.form.Action.CONNECT_FAILURE:F.msg=a.htcConfig.locData.UploadAjaxFailed;
break;
case Ext.form.Action.SERVER_INVALID:case Ext.form.Action.LOAD_FAILURE:if(J.result&&J.result.responseNotParsed&&J.response){if(J.response.url&&(String(J.response.url)).toLowerCase().indexOf(a.getAppRootUrl().toLowerCase()+"default.aspx")==0){window.location.href=J.response.url.split("?")[0];
return
}else{if(J.response&&J.response.responseText){var l=J.response.responseText;
var L="<a href='#' onclick='HttpCommander.Main.FileManagers[\""+a.getUid()+"\"].showPageError();return false;'>";
F.msg=String.format(a.htcConfig.locData.SimpleUploadErrorInfo,L);
if(!HttpCommander.Main.FileManagers[a.getUid()].showPageError){HttpCommander.Main.FileManagers[a.getUid()].showPageError=function(){if(l){var M=window.open("","_blank");
M.document.write(l)
}}
}}}}break
}}if(F.filesSaved>0||!F.msg){a.openTreeRecent();
a.openGridFolder(r);
var I=String.format(a.htcConfig.locData.BalloonFilesUploaded,F.filesSaved);
if(F.filesRejected>0){I+="<br />"+String.format(a.htcConfig.locData.BalloonFilesNotUploaded,F.filesRejected)+(F.msg?("<br />"+F.msg):"")
}a.showBalloon(I)
}else{c(F.msg)
}};
k.getForm().submit({url:n,success:y,failure:y});
var G=function(H,l){var I=Math.round(l.uploadedSize/l.totalSize*100);
A.updateText("<img src='"+HttpCommander.Lib.Utils.getIconPath(a,"ajax-loader.gif")+"' class='filetypeimage'>&nbsp;"+a.htcConfig.locData.UploadInProgress+"... ("+I+"%)")
};
if(z){e.setUploadInfo(x);
e.options.onUploadComplete=y;
e.options.onFileUploadProgress=G;
e.options.customFormFields=[];
Ext.each(k.getForm().items.items,function(l){if(l.getName()&&l.getName().indexOf("uploadFormField_")>=0){e.options.customFormFields.push({name:l.getName(),value:l.getValue()})
}});
e.upload()
}},stopUpload:function(){var n=a.getExtEl().child("iframe.x-hidden:last");
if(n){if(HttpCommander.Lib.Utils.browserIs.ie){window.frames[n.id].window.document.execCommand("Stop")
}else{window.frames[n.id].window.stop()
}}var l=k.getComponent("simple-upload-chunked");
if(l&&Ext.isFunction(l.setFileInputDisabled)){l.setFileInputDisabled(false)
}if(f){e.stop()
}a.Msg.hide();
a.openTreeRecent();
var m=a.getCurrentFolder();
a.openGridFolder(m);
a.showBalloon(htcConfig.locData.BalloonAbortFilesUploaded)
},compileNote:function(){var l=a.htcConfig.maxUploadSize&&a.htcConfig.maxUploadSize!="-1"?a.htcConfig.maxUploadSize:"2147483648";
var m=k.getComponent("simple-upload-notes");
if(m){m.setText("");
var n="";
if(a.getEnableMultipleUploader()){n=a.htcConfig.locData.MultipleFileInputMessage
}if(!HttpCommander.Lib.Utils.browserIs.dndFolders&&!HttpCommander.Lib.Utils.browserIs.ios&&a.htcConfig.currentPerms&&a.htcConfig.currentPerms.unzip){if(n!=""){n+="<br />"
}n+=String.format(a.htcConfig.locData.UploadZipUnzipNote,a.htcConfig.locData.CommandUnzip)
}if(a.getAllowSetFileNameAtSimpleUpload()===true){if(n!=""){n+="<br />"
}n+=a.htcConfig.locData.SimpleUploadSetFileNameNote
}if(l){if(n!=""){n+="<br />"
}n+="&lt; "+a.getRenderers().sizeRenderer(l)+":"
}m.el.dom.innerHTML=n
}var o=k.getComponent("simple-upload-chunked-label");
if(o){o.setVisible(f);
if(f){o.setText("> "+a.getRenderers().sizeRenderer(l)+":")
}}}});
return k
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.DragAndDropUpload=function(config){var uploadDnDGridPanel,blockFilesCount=config.htcConfig.dndCountParallelFiles,bis=HttpCommander.Lib.Utils.browserIs,pasteSreens=(config.htcConfig.enablePasteImages===true)&&(bis.chrome12up||bis.firefox36up||bis.edge10586up),pasteFiles=bis.firefox36up,maxUpSize=parseInt(config.htcConfig.maxUploadSize,10),maxUpSizeStr="-1",chunked=HttpCommander.Lib.Utils.isChunkedUploadSupported(),defChunkSize=262144*4;
if(!Ext.isNumber(blockFilesCount)||blockFilesCount<=0){blockFilesCount=5
}if(maxUpSize<=0){maxUpSize=2147483648
}maxUpSizeStr=String(maxUpSize);
var tbar={itemId:"dnd-upload-ignore-path",xtype:"checkbox",checked:false,hideLabel:true,boxLabel:config.htcConfig.locData.UploadJavaIgnorePaths};
var self=new Ext.FormPanel({fileUpload:true,frame:false,bodyStyle:"padding: 5px 5px 0 5px;",border:false,bodyBorder:false,header:false,layout:"fit",filesInProgress:0,filesNextIndex:0,aborted:false,balloonShowedAfterAbort:false,defaults:{anchor:"100%"},statusIcons:{none:"none",upload:"ajax-loader.gif",uploaderror:"error",uploadabort:"error",uploadend:"apply"},items:[uploadDnDGridPanel=new Ext.grid.GridPanel({header:false,height:156,loadMask:true,enableHdMenu:false,autoExpandColumn:"file-name-dnd-upload",headerAsText:true,header:true,headerCfg:{cls:"x-panel-header dnd-note",html:config.htcConfig.locData[HttpCommander.Lib.Utils.browserIs.dndFolders?"DndFileUploadingAllowDropFoldersMsg":"DndFileUploadingDontDropFoldersMsg"]+(!chunked?"<br />"+String.format(config.htcConfig.locData.UploadOneFileMaxSizeMessage,config.getRenderers().sizeRenderer(maxUpSizeStr)):"")+(pasteSreens?("<br />"+config.htcConfig.locData.ClipboardScreenshotHint+(pasteFiles?(" "+config.htcConfig.locData.ClipboardFileHint):"")):"")},tbar:HttpCommander.Lib.Utils.browserIs.dndFolders?[tbar]:undefined,bbar:[{xtype:"label",text:"",html:"&nbsp;"}],headerCssClass:"custom-header",headerStyle:"background-color:white;color:black;background-image:none;font-weight:normal;",store:new Ext.data.JsonStore({autoSave:false,remoteSort:false,totalProperty:"total",pruneModifiedRecords:false,autoLoad:true,autoDestroy:true,data:[],idProperty:"fileid",fields:[{name:"fileid",type:"string"},{name:"filestatus",type:"string"},{name:"filename",type:"string"},{name:"filesize",type:"int"},{name:"progress",type:"float"},{name:"error",type:"string"},{name:"deletefile",type:"string"}],listeners:{update:function(store,rec,op){if(op==="commit"){var hideError=true;
var complete=store.getCount()>0;
var errorRegEx=/error$|abort$/;
var filesSaved=0;
var filesRejected=0;
Ext.each(store.data.items,function(r){if(hideError&&r.data.error&&r.data.error!=""){hideError=false
}if(r.data.filestatus==="uploadend"){filesSaved++
}else{if(r.data.filestatus.match(errorRegEx)){filesRejected++
}else{complete=false
}}});
if(complete&&(self.filesNextIndex<store.getCount()||self.filesInProgress>0)){complete=false
}if(!complete&&self.aborted){complete=true
}var cm=uploadDnDGridPanel.getColumnModel();
if(cm){cm.setHidden(cm.getIndexById("file-error-message"),hideError)
}var curFolder=self.curFolderForUplaod||config.getCurrentFolder();
if(curFolder&&complete&&!self.balloonShowedAfterAbort){if(self.aborted){self.balloonShowedAfterAbort=true
}self.abortXHRUA();
config.openTreeRecent();
config.openGridFolder(curFolder,true,true);
var balloonText=String.format(config.htcConfig.locData.BalloonFilesUploaded,filesSaved);
if(filesRejected>0){balloonText+=". "+String.format(config.htcConfig.locData.BalloonFilesNotUploaded,filesRejected)+"."
}config.showBalloon(balloonText);
self.changeDnDButtons(false);
config.getDnDZone().dndShare.isNotDnDUploading=true;
cm.setHidden(cm.getIndexById("file-dnd-delete"),false);
var gView=uploadDnDGridPanel.getView();
window.clearInterval(self.updateViewTask);
self.busyViewUpdate=false;
if(!!gView){gView.skipLayoutOnUpdateColumnHidden=false
}}else{if(complete){var gView=uploadDnDGridPanel.getView();
window.clearInterval(self.updateViewTask);
self.busyViewUpdate=false;
if(!!gView){gView.skipLayoutOnUpdateColumnHidden=false
}}}}}}}),listeners:{render:function(dndGrid){if(config.getDnDZone()){config.getDnDZone().addDnDEvents()
}},cellclick:function(g,r,c,e){var store=g.getStore();
var rec=store.getAt(r);
var cm=g.getColumnModel();
if(cm.getDataIndex(c)=="deletefile"&&!cm.isHidden(c)&&rec.get("filestatus")!="upload"){var i=rec.get("fileid");
store.remove(rec);
var foundFileIndex=-1;
var foundFileObj=null;
Ext.each(config.getDnDZone().dndShare.dndFiles,function(fileItem,j){if(i==fileItem.fileid){foundFileObj=fileItem;
foundFileIndex=j
}});
if(foundFileIndex>=0){self.filesTotalSize-=foundFileObj.size;
if(self.filesTotalSize<0){self.filesTotalSize=0
}config.getDnDZone().dndShare.dndFiles.splice(foundFileIndex,1);
self.updateFilesFoldersInfo()
}uploadDnDGridPanel.getView().syncScroll()
}}},selModel:new Ext.grid.RowSelectionModel({}),columns:[{id:"file-name-dnd-upload",sortable:true,header:config.htcConfig.locData.CommonFieldLabelName,dataIndex:"filename",renderer:function(val,cell,rec){cell.attr="";
if(val&&val!=""){cell.attr='ext:qtip="'+Ext.util.Format.htmlEncode(val)+'" ext:qchilds="true"'
}if(rec.get("filestatus")==="none"){return Ext.util.Format.htmlEncode(val||"")
}return"<img src='"+HttpCommander.Lib.Utils.getIconPath(config,self.statusIcons[rec.get("filestatus")]?self.statusIcons[rec.get("filestatus")]:"none")+"' class='filetypeimage'>"+Ext.util.Format.htmlEncode(val||"")
}},{id:"file-size-dnd-upload",sortable:true,header:config.htcConfig.locData.CommonFieldLabelSize,dataIndex:"filesize",renderer:config.getRenderers().sizeNegRenderer,align:"right"},{id:"file-progress-upload",sortable:true,header:config.htcConfig.locData.DnDGridProgressColumn,dataIndex:"progress",align:"center",width:75,renderer:function(val){var str;
if((!val||val==""||val<0)&&val!==0){str=""
}else{if(val>100){str="100%"
}else{str=Ext.util.Format.htmlEncode(val.toString())+"%"
}}return str
}},{id:"file-error-message",sortable:true,header:config.htcConfig.locData.CommonErrorCaption,dataIndex:"error",hidden:true,renderer:config.getRenderers().wordWrapRendererWithoutEncoding},{id:"file-dnd-delete",sortable:false,resizable:false,groupable:false,header:"&nbsp;",dataIndex:"deletefile",align:"center",width:25,renderer:function(val,cell,rec){var show=rec.get("filestatus")!="upload";
if(show){return"<img style='cursor:pointer' src='"+HttpCommander.Lib.Utils.getIconPath(config,"delete")+"' class='filetypeimage' >"
}return"&nbsp;"
}}]})],abortXHRUA:function(){if(config.getDnDZone().dndShare.fileReadersXHRUArray){for(var i=0;
i<config.getDnDZone().dndShare.fileReadersXHRUArray.length;
i++){if(!!config.getDnDZone().dndShare.fileReadersXHRUArray[i].xhru){if(Ext.isFunction(config.getDnDZone().dndShare.fileReadersXHRUArray[i].xhru.stop)){config.getDnDZone().dndShare.fileReadersXHRUArray[i].xhru.stop()
}else{if(config.getDnDZone().dndShare.fileReadersXHRUArray[i].xhru.readyState!=4){config.getDnDZone().dndShare.fileReadersXHRUArray[i].xhru.abort()
}}}}}config.getDnDZone().dndShare.fileReadersXHRUArray=[]
},buttons:[{text:config.htcConfig.locData.StopUploadingButtonText,disabled:true,handler:function(){self.aborted=true;
setTimeout(function(){self.abortXHRUA()
},1);
self.changeDnDButtons(false)
}},{text:config.htcConfig.locData.UploadSimpleReset,handler:function(){config.getDnDZone().dndShare.dndFiles=[];
config.getDnDZone().dndShare.fileReadersXHRUArray=[];
self.getForm().reset();
var dndStore=uploadDnDGridPanel.getStore();
var gView=uploadDnDGridPanel.getView();
if(!!gView){gView.skipSyncFocusRow=true;
gView.skipLayoutOnUpdateColumnHidden=false
}if(!!dndStore){dndStore.loadData([]);
dndStore.commitChanges();
dndStore.fireEvent("update",dndStore,null,"commit")
}self.foldersCount=0;
self.filesTotalSize=0;
self.updateFilesFoldersInfo();
uploadDnDGridPanel.getView().syncScroll()
}},{text:config.htcConfig.locData.UploadSimpleUpload,handler:function(b,e,f){self.curFolderForUplaod=null;
var gView=uploadDnDGridPanel.getView();
if(!!gView){gView.skipSyncFocusRow=true;
gView.skipLayoutOnUpdateColumnHidden=false
}if(self.getForm().isValid()&&config.getDnDZone().dndShare.dndFiles&&config.getDnDZone().dndShare.dndFiles.length>0&&config.getDnDZone()){var curFolder=Ext.isEmpty(f)?config.getCurrentFolder():f;
if(!curFolder){config.Msg.alert(config.htcConfig.locData.UploadFolderNotSelectedTitle,config.htcConfig.locData.UploadFolderNotSelected);
return
}if(!config.htcConfig.currentPerms||!config.htcConfig.currentPerms.upload){config.Msg.alert(config.htcConfig.locData.UploadNotAllowedTitle,config.htcConfig.locData.UploadNotAllowedPrompt);
return
}var showWarning=false;
var notEmpty=false;
var fileItem;
var ignorePath=false;
var toptb=null;
if(toptb=uploadDnDGridPanel.getTopToolbar()){ignorePath=toptb.items.items[0].getValue()
}for(var i=0;
i<config.getDnDZone().dndShare.dndFiles.length;
i++){notEmpty=true;
fileItem=config.getDnDZone().dndShare.dndFiles[i];
var fileOrFolderName="";
if(!ignorePath&&fileItem.relativePath&&fileItem.relativePath.length>1){fileOrFolderName=fileItem.relativePath.substring(1).split(/[\/\\]/)[0]
}if(!fileOrFolderName||fileOrFolderName.length==0){fileOrFolderName=fileItem.name
}if(config.gridItemExists(fileOrFolderName)){showWarning=true
}}if(!notEmpty){return
}if(showWarning){var modify=config.isModifyAllowed();
config.Msg.show({title:config.htcConfig.locData.UploadFilesAlreadyExists,msg:modify?String.format(config.htcConfig.locData.UploadOverwriteOrRenameFiles,config.htcConfig.locData.ExtMsgButtonTextYES,config.htcConfig.locData.ExtMsgButtonTextNO):config.htcConfig.locData.UploadRenamedExistingFiles,buttons:modify?config.Msg.YESNOCANCEL:config.Msg.OKCANCEL,icon:modify?config.Msg.QUESTION:config.Msg.INFO,fn:function(btn){if(btn=="ok"||btn=="yes"||btn=="no"){self.dndFilesReadUpload(uploadDnDGridPanel,curFolder,btn=="ok"||btn=="no",chunked)
}}})
}else{self.dndFilesReadUpload(uploadDnDGridPanel,curFolder,true,chunked)
}}}}],changeDnDButtons:function(disabled){if(self.buttons.length>2){self.buttons[0].setDisabled(!disabled);
self.buttons[1].setDisabled(disabled);
self.buttons[2].setDisabled(disabled)
}},getUploadDnDGridPanel:function(){return uploadDnDGridPanel
},dndFilesReadUpload:function(dndGrid,folderPath,rename,chunks){config.getDnDZone().dndShare.fileReadersXHRUArray=[];
self.changeDnDButtons(true);
self.aborted=false;
self.balloonShowedAfterAbort=false;
window.clearInterval(self.updateViewTask);
window.busyViewUpdate=false;
if(config.getDnDZone().dndShare.dndFiles&&config.getDnDZone().dndShare.dndFiles.length>0){config.getDnDZone().dndShare.isNotDnDUploading=false;
if(dndGrid){var gView=dndGrid.getView();
if(!!gView){gView.skipLayoutOnUpdateColumnHidden=true;
gView.skipSyncFocusRow=true
}var store=dndGrid.getStore();
if(!!store){if(!!gView){self.updateViewTask=window.setInterval(function(){if(window.busyViewUpdate===true){return
}window.busyViewUpdate=true;
if(!!gView){gView.layout()
}window.busyViewUpdate=false
},500)
}var cm=dndGrid.getColumnModel();
if(!!cm){cm.setHidden(cm.getIndexById("file-dnd-delete"),true)
}self.filesInProgress=0;
self.filesNextIndex=0;
self.dndFilesUploadPage(folderPath,rename,chunks)
}}}},dndFilesUploadPage:function(folderPath,rename,chunks){if(self.aborted){return
}self.curFolderForUplaod=folderPath;
var store=uploadDnDGridPanel.getStore(),i=self.filesNextIndex,len=config.getDnDZone().dndShare.dndFiles.length;
var ignorePath=false;
var toptb=null;
if(!!(toptb=uploadDnDGridPanel.getTopToolbar())){ignorePath=toptb.items.items[0].getValue()
}for(;
i<len&&self.filesInProgress<blockFilesCount;
i++){self.filesNextIndex++;
var j=store.findExact("fileid",config.getDnDZone().dndShare.dndFiles[i].fileid);
if(j>-1){self.filesInProgress++;
var rec=store.getAt(j);
rec.set("filestatus","none");
rec.set("progress",0);
rec.set("error","");
rec.commit();
config.getDnDZone().dndShare.fileReadersXHRUArray.push({idx:rec.get("fileid"),xhru:null});
self.dndFileUpload(rec,config.getDnDZone().dndShare.dndFiles[i],folderPath,rename,ignorePath,chunks)
}}},dndFileUpload:function(rec,file,folderPath,rename,ignorePath,chunks){var xhr,chu,useChunks=(chunks&&file.size>maxUpSize);
if(useChunks){chu=new HttpCommander.Lib.Html5ChunkedUpload({url:config.htcConfig.relativePath+"Handlers/ChunkedUpload.ashx",chunkSize:defChunkSize,onUploadStart:function(e){rec.set("filestatus","upload");
rec.set("progress",0);
rec.set("error","");
rec.commit()
},onFileUploadStart:function(e){rec.set("filestatus","upload");
rec.set("progress",0);
rec.set("error","");
rec.commit()
},onFileUploadStop:function(e){rec.set("filestatus","uploadabort");
rec.set("progress",-1);
rec.set("error",config.htcConfig.locData.DnDFileUploadingAbort);
rec.commit()
},onFileUploadComplete:function(e){if(self.filesInProgress>0){self.filesInProgress--
}rec.set("filestatus","uploadend");
rec.set("error","");
rec.set("progress",100);
rec.commit();
if(self.filesInProgress==0&&!self.aborted){self.dndFilesUploadPage(folderPath,rename,chunks)
}},onFileUploadError:function(f,i,e){if(self.filesInProgress>0){self.filesInProgress--
}rec.set("filestatus","uploaderror");
rec.set("progress",-1);
rec.set("error",String.format(config.htcConfig.locData.DnDFileUploadingError,(!!i?(""+i+". "):"")+e+"."));
rec.commit();
if(self.filesInProgress==0&&!self.aborted){self.dndFilesUploadPage(folderPath,rename,chunks)
}},onFileUploadProgress:function(f,p){if(!!p&&p.totalSize>0){var persent=((p.uploadedSize*100)/p.totalSize).toFixed(2);
if(persent>=100){persent=99.99
}rec.set("progress",persent);
rec.commit()
}}})
}if(!!chu){xhr=chu
}else{xhr=new XMLHttpRequest()
}if(config.getDnDZone().dndShare.fileReadersXHRUArray){for(var i=0;
i<config.getDnDZone().dndShare.fileReadersXHRUArray.length;
i++){if(config.getDnDZone().dndShare.fileReadersXHRUArray[i].idx==rec.get("fileid")){config.getDnDZone().dndShare.fileReadersXHRUArray[i].xhru=xhr;
break
}}}if(!!chu){var uploadInfoForChunked={Path:folderPath,IgnorePath:""+ignorePath,DnD:"true"};
if(rename||HttpCommander.Lib.Utils.browserIs.ios){uploadInfoForChunked.Rename="true"
}chu.addFiles({files:[file]});
chu.setUploadInfo(uploadInfoForChunked);
chu.upload();
return
}xhr.upload.addEventListener("loadstart",function(e){rec.set("filestatus","upload");
rec.set("progress",0);
rec.set("error","");
rec.commit()
},false);
xhr.upload.addEventListener("progress",function(e){if(e.lengthComputable&&e.total>0){var persent=((e.loaded*100)/e.total).toFixed(2);
if(persent>=100){persent=99.99
}rec.set("progress",persent);
rec.commit()
}},false);
xhr.upload.addEventListener("error",function(e){rec.set("filestatus","uploaderror");
rec.set("progress",-1);
rec.set("error",String.format(config.htcConfig.locData.DnDFileUploadingError,config.htcConfig.locData.DnDFileUploadingStatusCode+": "+xhr.status.toString()+". "+xhr.statusText+"."));
rec.commit()
},false);
xhr.upload.addEventListener("abort",function(e){rec.set("filestatus","uploadabort");
rec.set("progress",-1);
rec.set("error",config.htcConfig.locData.DnDFileUploadingAbort);
rec.commit()
},false);
var postUrl=config.htcConfig.relativePath+"Handlers/DragNDropUpload.ashx?path="+encodeURIComponent(folderPath)+"&name="+encodeURIComponent((file.relativePath&&file.relativePath.length>1?file.relativePath.substring(1):"")+file.name)+(rename?"&rename=true":"");
if(ignorePath){postUrl+="&ignorepath=true"
}if(file.size<0){postUrl+="&folder=true"
}xhr.open("POST",postUrl,true);
xhr.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
var fd=new FormData();
fd.append("file",file);
xhr.onreadystatechange=function(){if(xhr.readyState==4){if(self.filesInProgress>0){self.filesInProgress--
}var res="";
try{res=eval("("+xhr.responseText+")")
}catch(e){res=xhr.responseText
}if(res.success){rec.set("filestatus","uploadend");
rec.set("error","");
rec.set("progress",100);
rec.commit()
}else{rec.set("progress",-1);
rec.set("filestatus","uploaderror");
if(res.msg){rec.set("error",String.format(config.htcConfig.locData.DnDFileUploadingError,res.msg))
}else{rec.set("error",String.format(config.htcConfig.locData.DnDFileUploadingError,(typeof res=="string"?(Ext.util.Format.htmlEncode(res)+". "):"")+config.htcConfig.locData.DnDFileUploadingStatusCode+": "+Ext.util.Format.htmlEncode(xhr.status.toString())+". "+Ext.util.Format.htmlEncode(xhr.statusText)+"."))
}var hr=xhr.getAllResponseHeaders();
if((res&&res!="")||(hr&&hr!="")){rec.commit()
}}if(self.filesInProgress==0&&!self.aborted){self.dndFilesUploadPage(folderPath,rename,chunks)
}}};
xhr.send(fd)
},foldersCount:0,filesTotalSize:0,updateFilesFoldersInfo:function(){setTimeout(function(){var lbl=uploadDnDGridPanel.getBottomToolbar().items.items[0];
if(lbl){var dndfls=config.getDnDZone().dndShare.dndFiles;
var len=0,emptyFolders=0;
for(var i=0;
i<dndfls.length;
i++){if(dndfls[i].size>=0){len++
}else{emptyFolders++
}}lbl.setText(String.format(config.htcConfig.locData.DndFileUploadingFilesSummaryInfo,"<b>"+len+"</b>","<b>"+config.getRenderers().sizeRenderer(self.filesTotalSize)+(emptyFolders>0?(", "+config.htcConfig.locData.GridTotalFoldersLabel+":&nbsp;"+emptyFolders):"")+"</b>"),false)
}},10)
},_addDndFile:function(file){setTimeout(function(){var dndStore=uploadDnDGridPanel.getStore();
if(!!dndStore&&config.getDnDZone().dndShare.isNotDnDUploading&&file.name!=""&&file.name!="."){if(file.size>maxUpSize&&!chunked){return
}var num=-1;
var fullFilePath=(file.relativePath?file.relativePath.toLowerCase():"")+file.name.toLowerCase();
for(j=0;
j<config.getDnDZone().dndShare.dndFiles.length;
j++){var existsFile=config.getDnDZone().dndShare.dndFiles[j];
var fullPath=(existsFile.relativePath?existsFile.relativePath.toLowerCase():"")+existsFile.name.toLowerCase();
if(fullPath===fullFilePath){num=j;
break
}}file.fileid=Ext.id();
var rec=new Ext.data.Record({fileid:file.fileid,filestatus:"none",filename:(file.relativePath&&file.relativePath.length>1?file.relativePath.substring(1):"")+file.name,filesize:file.size,progress:-1,error:"",deletefile:""});
if(num>-1){self.filesTotalSize-=config.getDnDZone().dndShare.dndFiles[num].size;
if(self.filesTotalSize<0){self.filesTotalSize=0
}config.getDnDZone().dndShare.dndFiles.splice(num,1,file);
dndStore.insert(num,[rec]);
dndStore.removeAt(num+1)
}else{config.getDnDZone().dndShare.dndFiles.push(file);
dndStore.add([rec])
}dndStore.commitChanges();
dndStore.fireEvent("update",dndStore,null,"commit");
if(file.size>=0){self.filesTotalSize+=file.size;
self.updateFilesFoldersInfo()
}}},0)
},toArray:function(list){return Array.prototype.slice.call(list||[],0)
},_traverseFileTree:function(_item,pathItem){var path=pathItem||"";
var item=_item;
setTimeout(function(){if(item&&item.isFile){item.file(function(file){file.webkitRelativePath=path;
file.relativePath=path;
self._addDndFile(file)
})
}else{if(item&&item.isDirectory){var dirReader=item.createReader();
var entries=[];
var listEntries=function(entires){self.foldersCount++;
self.updateFilesFoldersInfo();
if(entries.length>0){for(var i=0;
i<entries.length;
i++){self._traverseFileTree(entries[i],path+item.name+"/")
}}else{self._addDndFile({name:item.name,relativePath:path,webkitRelativePath:path,size:-1,type:"folder"})
}};
var readEntries=function(){dirReader.readEntries(function(results){if(!results.length){listEntries(entries.sort())
}else{entries=entries.concat(self.toArray(results));
readEntries()
}},function(){})
};
readEntries()
}else{if(item){item.webkitRelativePath=path;
item.relativePath=path;
self._addDndFile(item)
}}}},0)
},_addFiles:function(transferFiles,pasted){for(var i=0,lenFiles=transferFiles.length;
i<lenFiles;
i++){var file=transferFiles[i],_file=null,ext;
if(!file||(!Ext.isEmpty(file.kind)&&file.kind!="file")){continue
}if(Ext.isFunction(file.webkitGetAsEntry)||Ext.isFunction(file.getAsFile)){try{if(Ext.isFunction(file.webkitGetAsEntry)){_file=file.webkitGetAsEntry()
}}catch(e){}if(!_file&&Ext.isFunction(file.getAsFile)){_file=file.getAsFile()
}if(!_file){_file=file
}if(Ext.isEmpty(_file.name)){if(config.htcConfig.enablePasteImages===true){_file.name=self._getScreenshotName(_file)
}else{continue
}}self._traverseFileTree(_file,"/")
}else{if(Ext.isEmpty(file.name)){if(config.htcConfig.enablePasteImages===true){file.name=self._getScreenshotName(file)
}else{continue
}}self._addDndFile(file)
}}},_getScreenshotName:function(file){var ext=file.type;
if(!Ext.isEmpty(ext)){ext=file.type.split("/");
ext=ext[ext.length-1]
}return config.htcConfig.locData.ClipboardScreenshotTitlePrefix+"_"+(new Date()).format("Y-m-d_H.i.s")+(!Ext.isEmpty(ext)&&ext.trim().length>0?("."+ext):"")
},addFiles:function(transferFiles,pasted,tog){var dndStore=uploadDnDGridPanel.getStore();
var i,j,fileItem,lenFiles;
var gView=uploadDnDGridPanel.getView();
self.busyViewUpdate=false;
window.clearInterval(self.updateViewTask);
if(!!gView){gView.skipLayoutOnUpdateColumnHidden=true;
gView.skipSyncFocusRow=true;
self.updateViewTask=window.setInterval(function(){if(window.busyViewUpdate===true){return
}window.busyViewUpdate=true;
if(!!gView){gView.layout()
}window.busyViewUpdate=false
},500)
}if(!!dndStore){for(i=config.getDnDZone().dndShare.dndFiles.length-1;
i>=0;
i--){fileItem=config.getDnDZone().dndShare.dndFiles[i];
j=dndStore.findExact("fileid",fileItem.fileid);
if(j>-1){var rec=dndStore.getAt(j);
if(rec.get("filestatus")!="none"){self.filesTotalSize-=fileItem.size;
if(self.filesTotalSize<0){self.filesTotalSize=0
}config.getDnDZone().dndShare.dndFiles.splice(i,1);
dndStore.remove(rec);
self.updateFilesFoldersInfo()
}}}dndStore.commitChanges();
dndStore.fireEvent("update",dndStore,null,"commit")
}self._addFiles(transferFiles,pasted);
if(Ext.isObject(tog)){setTimeout(function(){if(!!tog.node){config.openGridFolder(tog.node.attributes.path,true)
}else{if(!!tog.rec&&tog.rec.data.rowtype=="folder"){config.openGridFolder(tog.rec.virtPath)
}}},200)
}}});
return self
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.DragAndDropZone=function(b){var a=this;
a.config=b;
a.uploadDropZone=null;
a.showDnDTipTimeOut=undefined;
a.dndShare={fileReadersXHRUArray:[],dndFiles:[],isNotDnDUploading:true};
try{a.uploadDnDTip=new Ext.Tip({shadow:false,autoHeight:true,autoWidth:true,renderTo:a.config.getExtEl(),baseCls:"x-tip",bodyStyle:"font-size:16pt;font-weight:600;font-family:verdana;text-align:center;",html:'<img alt="" src="'+a.config.htcConfig.relativePath+'Images/drophere.png"/><br />'+a.config.htcConfig.locData.DropFilesHere,listeners:{hide:function(){if(a.showDnDTipTimeOut){window.clearTimeout(a.showDnDTipTimeOut);
a.showDnDTipTimeOut=undefined
}}}})
}catch(c){a.config.ProcessScriptError(c)
}};
Ext.apply(HttpCommander.Lib.DragAndDropZone.prototype,{addDnDEvents:function(){var l=this;
try{var g=(l.config.getDragAndDropFormPanel()?l.config.getDragAndDropFormPanel().getUploadDnDGridPanel():null);
var a=function(){return l.dragstart.apply(l,arguments)
},f=function(){return l.dragenter.apply(l,arguments)
},c=function(){return l.dragover.apply(l,arguments)
},b=function(){return l.drop.apply(l,arguments)
},k=function(){return l.dragleave.apply(l,arguments)
},h=function(){return l.pasteHandler.apply(l,arguments)
};
var e;
if(l.config.htcConfig.enablePasteImages===true){if(window.addEventListener){window.addEventListener("paste",h,true)
}else{if(window.attachEvent){window.attachEvent("onpaste",h)
}}}if(l.config.getExtEl()&&(e=l.config.getExtEl().dom)){if(e.addEventListener){e.addEventListener("dragstart",a,true);
e.addEventListener("dragenter",f,true);
e.addEventListener("dragover",c,true);
e.addEventListener("drop",b,true);
e.addEventListener("dragleave",k,true)
}else{if(e.attachEvent){e.attachEvent("ondragstart",a);
e.attachEvent("ondragenter",f);
e.attachEvent("ondragover",c);
e.attachEvent("ondrop",b);
e.attachEvent("ondragleave",k,true)
}}e.setAttribute("dragenter",true)
}if(g&&g.el&&(l.uploadDropZone=g.el.dom)){if(l.uploadDropZone.addEventListener){l.uploadDropZone.addEventListener("dragover",c,true);
l.uploadDropZone.addEventListener("drop",b,true);
l.uploadDropZone.addEventListener("dragenter",f,true)
}else{if(l.uploadDropZone.attachEvent){l.uploadDropZone.attachEvent("ondragover",c);
l.uploadDropZone.attachEvent("ondrop",b);
l.uploadDropZone.attachEvent("ondragenter",f,true)
}}l.uploadDropZone.setAttribute("dragenter",true)
}var i=document.getElementById("checkCookieEnabledHolder");
if(i){i.setAttribute("contenteditable",true)
}}catch(d){l.config.ProcessScriptError(d)
}},dataURItoBlob:function(a){try{var f=a.split(";")[0].split(":")[1],h=atob(a.split(",")[1]),d=new ArrayBuffer(h.length),b=new Uint8Array(d);
for(var c=0;
c<h.length;
c++){b[c]=h.charCodeAt(c)
}return new Blob([d],{type:f})
}catch(g){if(!!window.console&&!!window.console.log){window.console.log(g)
}return null
}},pasteHandlerImpl:function(c,g){var b=this;
try{var a=(c?c.length:null);
if(b.uploadDnDTip){b.uploadDnDTip.hide()
}if(g.preventDefault){g.preventDefault()
}if(g.stopPropagation){g.stopPropagation()
}if(window.event){window.event.returnValue=false
}if(g.stopEvent){g.stopEvent()
}g.cancelBubble=true;
var d=(b.config.htcConfig.currentPerms&&b.config.htcConfig.currentPerms.upload);
if(d&&a&&b.dndShare.isNotDnDUploading){try{b.config.showUploadWindow()
}catch(f){b.config.ProcessScriptError(f);
return
}if(b.config.getDragAndDropFormPanel()){b.config.getDragAndDropFormPanel().addFiles(c,true)
}}}catch(f){b.config.ProcessScriptError(f)
}return false
},pasteHandler:function(g){var l=this,a=false,b;
if(!(l.config.htcConfig.enablePasteImages===true)){return
}try{var d=g.target||g.srcElement;
if(d&&d.tagName&&d.tagName.match(/INPUT|TEXTAREA/i)){return
}}catch(g){}try{b=(g.clipboardData||(g.originalEvent?g.originalEvent.clipboardData:null));
items=(b?(b.items||b.files):null);
if((!items||!items.length)&&HttpCommander.Lib.Utils.browserIs.firefox36up){var k=document.getElementById("checkCookieEnabledHolder");
if(k){k.focus();
var h=k.getElementsByTagName("img");
for(var f=0;
f<h.length;
f++){k.removeChild(h[f])
}setTimeout(function(){h=k.getElementsByTagName("img");
if(h.length){h[0].style.display="none";
var e=l.dataURItoBlob(h[0].src);
l.pasteHandlerImpl.apply(l,[[e],g])
}},1);
return true
}}l.pasteHandlerImpl.apply(l,[items,g])
}catch(c){l.config.ProcessScriptError(c)
}return false
},findRowAndNode:function(e,leave){var self=this,rec,row,rowIndex,grid,view,tree,node,nodeId,found,res=null,isThumb=false,ieNoEdge=HttpCommander.Lib.Utils.browserIs.ie&&!HttpCommander.Lib.Utils.browserIs.edge;
try{if(self.config.htcConfig.currentPerms&&self.config.htcConfig.currentPerms.upload){grid=self.config.getGrid();
if(!!grid){view=grid.getView();
if(!!view){row=!!e?(e.target||e.srcElement):null;
found=false;
while(row){isThumb=false;
var rowClass=(" "+(row.className||"")+" ");
if(rowClass.indexOf(" fakeFolderNameForDnD ")>-1||(isThumb=(rowClass.indexOf(" thmbIconMedium ")>-1||rowClass.indexOf(" thmbIconSmall ")>-1||rowClass.indexOf(" thmbIconBig ")>-1||rowClass.indexOf(" thmbIconLarge ")>-1))){found=true;
break
}row=row.parentNode
}if(found){if(isThumb){found=false;
while(row){if((" "+(row.className||"")+" ").indexOf(" thumbnailedItem ")>-1){found=true;
break
}row=row.parentNode
}}else{found=false;
while(row){if((" "+(row.className||"")+" ").indexOf(" x-grid3-row ")>-1){found=true;
break
}row=row.parentNode
}}}else{if(!isThumb&&ieNoEdge&&leave){found=false;
row=!!e?(e.target||e.srcElement):null;
while(row){if((" "+(row.className||"")+" ").indexOf(" x-grid3-row ")>-1){found=true;
break
}row=row.parentNode
}}}if(found){rowIndex=view.findRowIndex(row);
rec=grid.getStore().getAt(rowIndex);
if(!!rec&&rec.get("rowtype")!="folder"){rec=null
}}}}}}catch(err){if(!!window.console&&!!window.console.log){window.console.log(err)
}row=null;
grid=null;
view=null;
rec=null
}try{tree=self.config.getTree();
if(!!tree){node=!!e?(e.target||e.srcElement):null;
found=false;
var nodeEl=ieNoEdge?" x-tree-node-el ":" x-tree-node-anchor ";
while(node){if((" "+(node.className||"")+" ").indexOf(nodeEl)>-1){found=true;
break
}node=node.parentNode
}if(found&&!ieNoEdge){found=false;
while(node){if((" "+(node.className||"")+" ").indexOf(" x-tree-node-el ")>-1){found=true;
break
}node=node.parentNode
}}if(found){nodeId=Ext.fly(node,"_treeEvents").getAttribute("tree-node-id","ext");
if(nodeId){node=tree.getNodeById(nodeId);
if(!!node){try{var nodePerms=eval("("+node.attributes.permissions+")");
if(!nodePerms||!nodePerms.upload){node=null
}}catch(err){}}}else{node=null
}}}}catch(e){if(!!window.console&&!!window.console.log){window.console.log(e)
}tree=null;
node=null
}if(!!rec){rec.virtPath=self.config.getCurrentFolder()+"/"+rec.data.name;
res={grid:grid,view:view,rec:rec,row:row}
}if(!!node){(res||(res={})).node=node
}return res
},dragstart:function(c){var a=this;
try{if(c.target.getAttribute("draggable")){return true
}}catch(c){}try{if(c.preventDefault){c.preventDefault()
}if(c.stopPropagation){c.stopPropagation()
}if(window.event){window.event.returnValue=false
}if(c.stopEvent){c.stopEvent()
}}catch(b){a.config.ProcessScriptError(b)
}return false
},dragenter:function(k){var n=this,d=true,c=0,g=0,l=HttpCommander.Lib.Utils.browserIs.ie&&!HttpCommander.Lib.Utils.browserIs.edge;
var f=n.findRowAndNode.call(n,k);
try{if(n.uploadDnDTip){n.uploadDnDTip.hide()
}if(!k.dataTransfer||k.dataTransfer.mozSourceNode||!((k.dataTransfer.items&&k.dataTransfer.items.length>0)||(k.dataTransfer.files&&(k.dataTransfer.files.length>0||l)))){return
}if(k.dataTransfer.items&&(g=k.dataTransfer.items.length)>0){for(;
c<g;
c++){if(k.dataTransfer.items[c].kind=="file"){d=false;
break
}}if(d){return
}}var a=(!!f&&!!f.node)||(n.config.htcConfig.currentPerms&&n.config.htcConfig.currentPerms.upload);
if(a){if(!!f&&!!f.node){f.node.select()
}if(!!f&&!!f.row){Ext.fly(f.row).addClass("x-drop-target-active")
}if(n.dndShare.isNotDnDUploading&&n.uploadDnDTip&&!n.config.isUploadWindowVisible()){n.uploadDnDTip.setVisible(false);
n.uploadDnDTip.show();
var h=n.config.getView().el.getLeft()+(n.config.getView().el.getWidth()-n.uploadDnDTip.el.getWidth())/2;
var m=n.config.getView().el.getTop()+(n.config.getView().el.getHeight()-n.uploadDnDTip.el.getHeight())/2;
n.uploadDnDTip.showAt([h,m]);
n.uploadDnDTip.setVisible(true);
n.showDnDTipTimeOut=setTimeout(function(){if(n.uploadDnDTip){n.uploadDnDTip.hide()
}},3000)
}}}catch(b){n.config.ProcessScriptError(b)
}},dragover:function(c){var a=this;
try{if(c.preventDefault){c.preventDefault()
}if(c.stopPropagation){c.stopPropagation()
}if(window.event){window.event.returnValue=false
}if(c.stopEvent){c.stopEvent()
}}catch(b){a.config.ProcessScriptError(b)
}return false
},dragleave:function(d){var a=this;
var b=a.findRowAndNode.call(a,d,true);
if(!!b&&!!b.node){b.node.unselect(true)
}if(!!b&&!!b.row){Ext.fly(b.row).removeClass("x-drop-target-active")
}try{if(d.preventDefault){d.preventDefault()
}if(d.stopPropagation){d.stopPropagation()
}if(window.event){window.event.returnValue=false
}if(d.stopEvent){d.stopEvent()
}}catch(c){a.config.ProcessScriptError(c)
}return false
},drop:function(k){var b=this,f,a,d=true;
var c=b.findRowAndNode.call(b,k,true);
if(!!c&&!!c.node){c.node.unselect(true)
}if(!!c&&!!c.row){Ext.fly(c.row).removeClass("x-drop-target-active")
}try{if(b.uploadDnDTip){b.uploadDnDTip.hide()
}if(k.preventDefault){k.preventDefault()
}if(k.stopPropagation){k.stopPropagation()
}if(window.event){window.event.returnValue=false
}if(k.stopEvent){k.stopEvent()
}if(!k.dataTransfer||!((k.dataTransfer.items&&k.dataTransfer.items.length>0)||(k.dataTransfer.files&&k.dataTransfer.files.length>0))){return false
}if(k.dataTransfer.items&&(a=k.dataTransfer.items.length)>0){for(f=0;
f<a;
f++){if(k.dataTransfer.items[f].kind=="file"){d=false;
break
}}if(d){return
}}var g=(!!c&&!!c.node)||(b.config.htcConfig.currentPerms&&b.config.htcConfig.currentPerms.upload);
if(g&&b.dndShare.isNotDnDUploading){try{b.config.showUploadWindow()
}catch(h){b.config.ProcessScriptError(h);
return false
}if(b.config.getDragAndDropFormPanel()){b.config.getDragAndDropFormPanel().addFiles(k.dataTransfer.items&&k.dataTransfer.items.length>0?k.dataTransfer.items:k.dataTransfer.files,false,c)
}}}catch(h){b.config.ProcessScriptError(h)
}return false
}});
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.JavaUpload=function(config){var ignorePathsItem,maxSizeNoteItem;
var self={items:[ignorePathsItem=new Ext.form.Checkbox({boxLabel:config.htcConfig.locData.UploadJavaIgnorePaths,hidden:!config.htcConfig.folderUpload,value:config.htcConfig.folderUpload,style:"padding-left:4px;"}),maxSizeNoteItem=new Ext.form.Label({style:"padding-left:4px;",html:config.htcConfig.chunkedUpload?config.htcConfig.locData.UploadUnlimitedSizeMessage:(config.htcConfig.maxUploadSize&&config.htcConfig.maxUploadSize!="-1"?String.format(config.htcConfig.locData.UploadTotalMaxSizeMessage,config.getRenderers().sizeRenderer(config.htcConfig.maxUploadSize)):"&nbsp;")})],html:'<div style="margin-top:4px;margin-left:4px;" id="'+config.$("contentForJavaUploader")+'">'+String.format((config.htcConfig.chunkedUpload?HttpCommander.Lib.Consts.uploadAppletTextEx:HttpCommander.Lib.Consts.uploadAppletText),Ext.util.Format.htmlEncode(config.getAppRootUrl()),config.getUid(),config.htcConfig.twoLetterLangName)+"</div>",JavaPowUpload_onUploadStart:function(){var javaPowUpload=document.getElementById(config.$("javaPowUpload"));
var curFolder=config.getCurrentFolder();
var ignorePaths=ignorePathsItem.el.dom.checked;
if(!curFolder){window.alert(config.htcConfig.locData.UploadFolderNotSelected);
javaPowUpload.clickStop();
return
}if(!config.htcConfig.currentPerms||!config.htcConfig.currentPerms.upload){window.alert(config.htcConfig.locData.UploadNotAllowedPrompt);
javaPowUpload.clickStop();
return
}javaPowUpload.removePostFields();
javaPowUpload.addPostField("path",curFolder);
if(ignorePaths){javaPowUpload.addPostField("ignorePaths","true")
}ignorePathsItem.el.dom.disabled=true
},JavaPowUpload_onUploadFinish:function(){config.openTreeRecent();
var curFolder=config.getCurrentFolder();
if(curFolder){config.openGridFolder(curFolder,true,true)
}ignorePathsItem.el.dom.disabled=false;
config.setPermWarningShown(false)
},JavaPowUpload_onServerResponse:function(status,response){if(response){var result=window.eval("("+response+")"),balloonText="";
if(!config.htcConfig.chunkedUpload){balloonText=String.format(config.htcConfig.locData.BalloonFilesUploaded,result.filesSaved);
if(!result.success){if(result.filesRejected>0){balloonText+="<br />"+String.format(config.htcConfig.locData.BalloonFilesNotUploaded,result.filesRejected)
}if(typeof result.msg!="undefined"){balloonText+=".<br />"+result.msg
}}config.showBalloon(balloonText)
}else{if(!config.getPermWarningShown()&&result.msg.indexOf("$")!=-1){balloonText=config.htcConfig.locData.BalloonSomeFilesNotUploaded+". "+result.msg.replace("$","");
config.showBalloon(balloonText);
config.setPermWarningShown(true)
}}}},JavaPowUpload_onAppletInit:function(){var uploadWindow=config.getUploadWindow();
uploadWindow.fireEvent("bodyresize",uploadWindow,uploadWindow.getInnerWidth(),uploadWindow.getInnerHeight())
},getMaxSizeNoteCmp:function(){return maxSizeNoteItem
}};
return self
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.FlashUpload=function(config){return{html:HttpCommander.Lib.Utils.flashPlayerIsSupported()?String.format(HttpCommander.Lib.Consts.uploadFlashText,config.getUid(),(config.htcConfig.maxUploadSize&&config.htcConfig.maxUploadSize!="-1"?String.format(config.htcConfig.locData.UploadOneFileMaxSizeMessage,config.getRenderers().sizeRenderer(config.htcConfig.maxUploadSize)):"&nbsp;"),config.htcConfig.relativePath,config.htcConfig.twoLetterLangName):HttpCommander.Lib.Consts.needInstallAdobeFlashPlayerMessage,MultiPowUpload_onStart:function(){var flashUploadObject=window[config.$("MultiPowUpload")];
var curFolder=config.getCurrentFolder();
if(!curFolder){window.alert(config.htcConfig.locData.UploadFolderNotSelected);
flashUploadObject.cancelUpload();
return
}if(!config.htcConfig.currentPerms||!config.htcConfig.currentPerms.upload){window.alert(config.htcConfig.locData.UploadNotAllowedPrompt);
flashUploadObject.cancelUpload();
return
}flashUploadObject.addPostField("path",curFolder)
},MultiPowUpload_onComplete:function(){config.openTreeRecent();
var curFolder=config.getCurrentFolder();
if(curFolder){config.openGridFolder(curFolder)
}config.setPermWarningShown(false)
},MultiPowUpload_onServerResponse:function(file){if(!config.getPermWarningShown()){var result=window.eval("("+file.serverResponse+")");
if(result.filesRejected>0){var balloonText=config.htcConfig.locData.BalloonSomeFilesNotUploaded+".<br />"+result.msg;
config.showBalloon(balloonText);
config.setPermWarningShown(true)
}}},MultiPowUpload_onMovieLoad:function(){var uploadWindow=config.getUploadWindow();
uploadWindow.fireEvent("bodyresize",uploadWindow,uploadWindow.getInnerWidth(),uploadWindow.getInnerHeight());
uploadWindow.focus()
}}
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.SilverlightUpload=function(a){return{html:String.format(HttpCommander.Lib.Consts.uploadSilverlightText,a.getUid(),a.htcConfig.locData.UploadUnlimitedSizeMessage,a.htcConfig.relativePath,Ext.util.Format.htmlEncode(a.getAppRootUrl())),onSilverlightLoaded:function(){var d=a.getUploadWindow();
d.fireEvent("bodyresize",d,d.getInnerWidth(),d.getInnerHeight());
var c=document.getElementById(a.$("ultimateUploader")).Content.JSAPI;
var b=a.getCurrentFolder();
c.Tag=b;
c.UploadStarted=function(){var e=a.getCurrentFolder();
if(!e){a.Msg.alert(htcConfig.locData.CommonErrorCaption,a.htcConfig.locData.UploadFolderNotSelected);
return
}else{c.Tag=e
}if(!a.htcConfig.currentPerms||!a.htcConfig.currentPerms.upload){a.Msg.alert(htcConfig.locData.CommonErrorCaption,a.htcConfig.locData.UploadNotAllowedPrompt);
return
}};
c.UploadFileCompleted=function(f,e){if(!a.getPermWarningShown()&&e.ServerResponse.indexOf("$")!=-1){var g=a.htcConfig.locData.BalloonSomeFilesNotUploaded+". "+e.ServerResponse.replace("$","");
a.showBalloon(g);
a.setPermWarningShown(true)
}};
c.UploadCompleted=function(){a.openTreeRecent();
var e=a.getCurrentFolder();
if(e){a.openGridFolder(e)
}a.setPermWarningShown(false)
};
c.UploadError=function(f,e){if(!a.getPermWarningShown()&&e.ErrorMessage.indexOf("$")!=-1){var g=a.htcConfig.locData.BalloonSomeFilesNotUploaded+". "+e.ErrorMessage.replace("$","");
a.showBalloon(g);
a.setPermWarningShown(true)
}}
}}
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.UploadFromUrl=function(c){var a,d;
var b=new Ext.FormPanel({bodyStyle:"padding: 5px 5px 0px 5px;",border:false,bodyBorder:false,header:false,labelAlign:"top",items:[a=new Ext.form.TextArea({fieldLabel:String.format(c.htcConfig.locData.UploadFromUrlLabelText,"<span><img alt='' align='absmiddle' width='16' height='16' src='"+HttpCommander.Lib.Utils.getIconPath(c,"dropbox")+"'>&nbsp;"+HttpCommander.Lib.Utils.getHelpLinkOpenTag(c.getUid(),"dropbox")+"<b>"+HttpCommander.Lib.Consts.CloudNames.dropbox+"</b></a></span>","&nbsp;<img alt='' align='absmiddle' width='16' height='16' src='"+c.htcConfig.relativePath+"Images/picasa.png'>&nbsp;<b>Picasa</b>","&nbsp;<img alt='' align='absmiddle' width='16' height='16' src='"+c.htcConfig.relativePath+"Images/flickr.png'>&nbsp;<b>Flickr</b>","&nbsp;<img alt='' align='absmiddle' width='16' height='16' src='"+c.htcConfig.relativePath+"Images/photobucket.png'>&nbsp;<b>PhotoBucket</b>","&nbsp;<img alt='' align='absmiddle' width='16' height='16' src='"+c.htcConfig.relativePath+"Images/facebook.png'>&nbsp;<b>Facebook</b>")+"<br />"+c.htcConfig.locData.UploadFromUrlFieldLabel,anchor:"100%",autoScroll:true,height:40}),d=new Ext.form.TextField({fieldLabel:c.htcConfig.locData.UploadFromUrlFileName,width:150})],buttons:[{text:c.htcConfig.locData.UploadSimpleReset,handler:function(){b.getForm().reset()
}},{text:c.htcConfig.locData.UploadSimpleUpload,handler:function(){var e=a.getValue();
if(e&&e!=""&&b.getForm().isValid()){var f=c.getCurrentFolder();
if(!f){c.Msg.alert(c.htcConfig.locData.UploadFolderNotSelectedTitle,c.htcConfig.locData.UploadFolderNotSelected);
return
}if(!c.htcConfig.currentPerms||!c.htcConfig.currentPerms.upload){c.Msg.alert(c.htcConfig.locData.UploadNotAllowedTitle,c.htcConfig.locData.UploadNotAllowedPrompt);
return
}var i={url:e,path:f,name:d.getValue()};
var g=false;
if(i.name&&i.name!=""){if(c.gridItemExists(i.name)){g=true
}}if(g){var h=c.isModifyAllowed();
c.Msg.show({title:c.htcConfig.locData.UploadFilesAlreadyExists,msg:h?String.format(c.htcConfig.locData.UploadOverwriteOrRenameFiles,c.htcConfig.locData.ExtMsgButtonTextYES,c.htcConfig.locData.ExtMsgButtonTextNO):c.htcConfig.locData.UploadRenamedExistingFiles,buttons:h?c.Msg.YESNOCANCEL:c.Msg.OKCANCEL,icon:h?c.Msg.QUESTION:c.Msg.INFO,fn:function(k){if(k=="ok"||k=="yes"||k=="no"){i.rename=k=="ok"||k=="no";
b.uploadFileFromUrl(e,f,i)
}}})
}else{i.rename=true;
b.uploadFileFromUrl(e,f,i)
}}}}],uploadFileFromUrl:function(f,g,e){var h=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
c.Msg.show({title:c.htcConfig.locData.UploadFromUrlProgressTitle,msg:"<img alt='' src='"+HttpCommander.Lib.Utils.getIconPath(c,"ajax-loader.gif")+"' class='filetypeimage'>&nbsp;"+c.htcConfig.locData.UploadFromUrlMsg+"...",closable:false,modal:true,width:220});
HttpCommander.UploadFromURL.Upload(e,function(k,i){Ext.Ajax.timeout=h;
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(k,i,c.Msg,c.htcConfig,2)){c.openTreeRecent();
c.openGridFolder(g);
c.showBalloon(String.format(c.htcConfig.locData.UploadFromUrlSuccessMsg,HttpCommander.Lib.Utils.checkBracketsAndHtmlEncode(k.file),Ext.util.Format.htmlEncode(f)))
}})
},getUploadFromUrlField:function(){return a
}});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.iOSUpload=function(b){var a=new Ext.FormPanel({frame:false,bodyStyle:"padding: 5px 5px 0px 5px;",border:false,bodyBorder:false,header:false,defaults:{anchor:"100%"},items:[{xtype:"label",html:'<br/><a href="http://itunes.apple.com/ru/app/aurigma-up/id432611633?mt=8">'+b.htcConfig.locData.UploadMobileAurigmaLink+"</a><br/>"+b.htcConfig.locData.UploadMobileAurigmaReady+"<br/>"},{xtype:"textfield",value:(typeof b.htcConfig.currentUserDomain!="undefined"&&b.htcConfig.currentUserDomain.trim().length>0?(b.htcConfig.currentUserDomain+"_"):"")+b.htcConfig.currentUser+"_",fieldLabel:b.htcConfig.locData.UploadMobileAurigmaFilePrefix,width:150}],buttons:[{text:b.htcConfig.locData.UploadSimpleUpload,handler:function(){var d="cookies=ASP.NET_SessionId%3D"+encodeURIComponent(HttpCommander.Lib.Utils.getCookie("ASP.NET_SessionId",true));
d+="%3B.ASPXAUTH%3D"+encodeURIComponent(HttpCommander.Lib.Utils.getCookie(".ASPXAUTH",true));
var e=encodeURIComponent(b.getAppRootUrl()+"Default.aspx?Mobile=standard&folder="+encodeURIComponent(b.getCurrentFolder()));
var c="aurup:?licenseKey=79FF0-00040-44BA0-000E5-8EA73-3F6BCF&VideoMode=source&uploadUrl="+b.getAppRootUrl()+"Handlers/Upload.ashx&fields=path%3D"+encodeURIComponent(b.getCurrentFolder())+"%3Bprefix%3D"+encodeURIComponent(a.getForm().items.items[0].getValue())+"&redirectUrl="+e+"&returnUrl="+e+"&"+d;
window.location=c
}}]});
return a
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.UploadWindow=function(B){var a=[],u={},l,y,z,m,o,i,g,b,v,d,c,s=false,A=!HttpCommander.Lib.Utils.browserIs.edge&&!HttpCommander.Lib.Utils.browserIs.chrome42up;
function t(){return n
}function x(){return s
}function h(e){s=e
}if(!HttpCommander.Lib.Utils.browserIs.ios||(HttpCommander.Lib.Utils.browserIs.ios&&HttpCommander.Lib.Utils.browserIs.ios6up)){try{l=HttpCommander.Lib.SimpleUpload({htcConfig:B.htcConfig,Msg:B.Msg,Window:B.Window,getAllowSetFileNameAtSimpleUpload:B.getAllowSetFileNameAtSimpleUpload,getCurrentFolder:B.getCurrentFolder,gridItemExists:B.gridItemExists,isModifyAllowed:B.isModifyAllowed,openGridFolder:B.openGridFolder,showBalloon:B.showBalloon,getExtEl:B.getExtEl,getUid:B.getUid,getEnableMultipleUploader:B.getEnableMultipleUploader,getRenderers:B.getRenderers,getAppRootUrl:B.getAppRootUrl,openTreeRecent:B.openTreeRecent});
u.Simple={itemId:"simple-upload",title:B.htcConfig.locData.UploadSimpleTab,items:l}
}catch(w){B.ProcessScriptError(w)
}}if(B.getEnableDnDUploader()){try{var k=HttpCommander.Lib.Utils.browserIs,q=(B.htcConfig.enablePasteImages===true)&&(k.chrome12up||k.firefox36up||k.edge10586up);
y=HttpCommander.Lib.DragAndDropUpload({htcConfig:B.htcConfig,Msg:B.Msg,Window:B.Window,getRenderers:B.getRenderers,getCurrentFolder:B.getCurrentFolder,openGridFolder:B.openGridFolder,showBalloon:B.showBalloon,gridItemExists:B.gridItemExists,isModifyAllowed:B.isModifyAllowed,globalLoadMask:B.globalLoadMask,getDnDZone:B.getDnDZone,openTreeRecent:B.openTreeRecent});
u.DragNDrop={itemId:"dnd-upload-tab",title:B.htcConfig.locData[q?"UploadDragNDropTabImages":"UploadDragNDropTab"],items:y}
}catch(w){B.ProcessScriptError(w)
}}if(B.htcConfig.uploaders.java&&!HttpCommander.Lib.Utils.browserIs.ios&&A){try{m=HttpCommander.Lib.JavaUpload({htcConfig:B.htcConfig,getRenderers:B.getRenderers,getUploadWindow:t,getCurrentFolder:B.getCurrentFolder,openGridFolder:B.openGridFolder,openTreeNode:B.openTreeNode,"$":B.$,getPermWarningShown:x,setPermWarningShown:h,showBalloon:B.showBalloon,getUid:B.getUid,getAppRootUrl:B.getAppRootUrl,openTreeRecent:B.openTreeRecent});
u.Java={itemId:"java-upload",title:B.htcConfig.locData.UploadJavaTab,items:m.items,html:m.html}
}catch(w){B.ProcessScriptError(w)
}}if(B.htcConfig.uploaders.flash&&!HttpCommander.Lib.Utils.browserIs.ios){o=HttpCommander.Lib.FlashUpload({htcConfig:B.htcConfig,getRenderers:B.getRenderers,getUploadWindow:t,getCurrentFolder:B.getCurrentFolder,openGridFolder:B.openGridFolder,"$":B.$,getPermWarningShown:x,setPermWarningShown:h,showBalloon:B.showBalloon,getUid:B.getUid,openTreeRecent:B.openTreeRecent});
u.Flash={itemId:"flash-upload",title:B.htcConfig.locData.UploadFlashTab,bodyStyle:"background-color:#DFE8F6;",html:o.html}
}if(B.htcConfig.uploaders.silverlight&&!HttpCommander.Lib.Utils.browserIs.ios&&A){i=HttpCommander.Lib.SilverlightUpload({htcConfig:B.htcConfig,getUploadWindow:t,getCurrentFolder:B.getCurrentFolder,openGridFolder:B.openGridFolder,"$":B.$,getPermWarningShown:x,setPermWarningShown:h,showBalloon:B.showBalloon,getUid:B.getUid,getAppRootUrl:B.getAppRootUrl,Msg:B.Msg,openTreeRecent:B.openTreeRecent});
window[B.$("onSilverlightLoaded")]=i.onSilverlightLoaded;
u.Silverlight={itemId:"silverlight-upload",title:B.htcConfig.locData.UploadSilverlightTab,html:i.html}
}if(B.htcConfig.enableUploadFromGoogle&&B.htcConfig.isAllowedGoogleDrive){try{z=HttpCommander.Lib.UploadFromGoogle({htcConfig:B.htcConfig,Msg:B.Msg,Window:B.Window,globalLoadMask:B.globalLoadMask,getUid:B.getUid,getCurrentFolder:B.getCurrentFolder,openGridFolder:B.openGridFolder,showBalloon:B.showBalloon,gridItemExists:B.gridItemExists,isModifyAllowed:B.isModifyAllowed,getUploadWindow:t,getFileManagerInstance:B.getFileManagerInstance,getGoogleDriveAuth:B.getGoogleDriveAuth,isDemoMode:B.isDemoMode,openTreeRecent:B.openTreeRecent});
u.GoogleDocsDrive={itemId:"google-upload",items:z,title:HttpCommander.Lib.Consts.CloudNames.google,iconCls:"icon-google"}
}catch(w){B.ProcessScriptError(w)
}}if(B.htcConfig.enableUploadFromDropbox){try{g=HttpCommander.Lib.UploadFromDropbox({htcConfig:B.htcConfig,getUid:B.getUid,getUploadWindow:t,globalLoadMask:B.globalLoadMask,getRenderers:B.getRenderers,getCurrentFolder:B.getCurrentFolder,Msg:B.Msg,openTreeNode:B.openTreeNode,openGridFolder:B.openGridFolder,showBalloon:B.showBalloon,getDropboxAuth:B.getDropboxAuth,isDemoMode:B.isDemoMode,openTreeRecent:B.openTreeRecent});
u.Dropbox={itemId:"dropbox-upload",items:g,title:HttpCommander.Lib.Consts.CloudNames.dropbox,iconCls:"icon-dropbox"}
}catch(w){B.ProcessScriptError(w)
}}if(B.htcConfig.enableUploadFromSkyDrive&&B.htcConfig.isAllowedSkyDrive){try{b=new HttpCommander.Lib.UploadFromSkyDrive({htcConfig:B.htcConfig,Msg:B.Msg,Window:B.Window,globalLoadMask:B.globalLoadMask,getUid:B.getUid,getUploadWindow:t,getRenderers:B.getRenderers,getCurrentFolder:B.getCurrentFolder,openGridFolder:B.openGridFolder,showBalloon:B.showBalloon,getSkyDriveAuth:B.getSkyDriveAuth,isDemoMode:B.isDemoMode,openTreeRecent:B.openTreeRecent});
u.SkyDrive={itemId:"skydrive-upload",items:b,title:HttpCommander.Lib.Consts.CloudNames.onedrive,iconCls:"icon-skydrive"}
}catch(w){B.ProcessScriptError(w)
}}if(B.htcConfig.enableUploadFromBox&&B.htcConfig.isAllowedBox){try{v=HttpCommander.Lib.UploadFromBox({htcConfig:B.htcConfig,getUid:B.getUid,getUploadWindow:t,globalLoadMask:B.globalLoadMask,getRenderers:B.getRenderers,getCurrentFolder:B.getCurrentFolder,Msg:B.Msg,openTreeNode:B.openTreeNode,openGridFolder:B.openGridFolder,showBalloon:B.showBalloon,getBoxAuth:B.getBoxAuth,isDemoMode:B.isDemoMode,openTreeRecent:B.openTreeRecent});
u.Box={itemId:"box-upload",items:v,title:HttpCommander.Lib.Consts.CloudNames.box,iconCls:"icon-box"}
}catch(w){B.ProcessScriptError(w)
}}if(B.htcConfig.enableFromUrlUploader){try{d=HttpCommander.Lib.UploadFromUrl({htcConfig:B.htcConfig,getUid:B.getUid,getCurrentFolder:B.getCurrentFolder,Msg:B.Msg,gridItemExists:B.gridItemExists,isModifyAllowed:B.isModifyAllowed,openGridFolder:B.openGridFolder,showBalloon:B.showBalloon,openTreeRecent:B.openTreeRecent});
u.FromUrl={itemId:"from-url-upload",items:d,title:B.htcConfig.locData.UploadFromUrlTab,autoScroll:true}
}catch(w){B.ProcessScriptError(w)
}}if(HttpCommander.Lib.Utils.browserIs.ios&&!HttpCommander.Lib.Utils.browserIs.ios6up){try{c=HttpCommander.Lib.iOSUpload({htcConfig:B.htcConfig,getAppRootUrl:B.getAppRootUrl,getCurrentFolder:B.getCurrentFolder,openTreeRecent:openTreeRecent});
u.iOS={itemId:"ios-upload-tab",items:c,title:B.htcConfig.locData.UploadSimpleTab}
}catch(w){B.ProcessScriptError(w)
}}for(var r=0;
r<B.htcConfig.uploadersOrder.length;
++r){if(typeof u[B.htcConfig.uploadersOrder[r]]!="undefined"){a.push(u[B.htcConfig.uploadersOrder[r]])
}}var p=null;
var f=function(e,E,G){p=E;
h(false);
switch(E.itemId){case"google-upload":case"dnd-upload-tab":if((E.itemId=="dnd-upload-tab"&&y)||(E.itemId=="google-upload"&&z)){if(E.itemId=="google-upload"&&z){z.prepare(true)
}n.reResize()
}break;
case"simple-upload":if(l){l.compileNote()
}break;
case"skydrive-upload":if(b){if(b.isLoginFormVisible()||G){var C=!Ext.isEmpty(B.htcConfig.liveConnectID)&&String(B.htcConfig.liveConnectID).length>0;
var F=!Ext.isEmpty(B.htcConfig.oneDriveForBusinessAuthUrl)&&String(B.htcConfig.oneDriveForBusinessAuthUrl).length>0;
var D=F&&!C;
if(!D){D=(C&&!F)?false:undefined
}b.prepare(false,D)
}if(b.isUploadPanelVisible()){n.reResize()
}}break;
case"box-upload":if(v){v.prepare();
n.reResize()
}break;
case"dropbox-upload":if(g){var H=g.getDropboxUploadPanel();
if(!H||H.hidden||G){if(B.htcConfig.enableUploadFromDropbox){g.prepare()
}}if(H&&!H.hidden){n.reResize()
}}break
}};
var n=new B.Window({title:B.htcConfig.locData.UploadTitle,plain:true,layout:"fit",width:400,height:320+(l?l.additionalHeight:0),minWidth:400,minHeight:320,closeAction:"hide",collapsible:false,draggable:!HttpCommander.Lib.Utils.browserIs.ie,animCollapse:false,maximizable:true,closable:true,items:new Ext.TabPanel({itemId:"upload-tab-panel",autoTabs:true,activeTab:0,deferredRender:true,border:false,enableTabScroll:true,items:a,listeners:{tabchange:f}}),listeners:{bodyresize:function(T,Q,O){if(m){var I=document.getElementById(B.$("javaPowUpload"));
if(I){I.width=Q-10;
var e=O-58;
var G=m.getMaxSizeNoteCmp();
if(G&&G.rendered){e-=(G.getHeight()<=0?13:G.getHeight())
}I.height=e
}}if(o){var P=window[B.$("MultiPowUpload")];
if(P){P.width=Q-2;
var M=O-32;
var C=document.getElementById(B.$("flashUploaderRemarkSize"));
if(C){M-=(C.offsetHeight<=0?13:C.offsetHeight)
}P.height=M
}}if(i){var J=document.getElementById(B.$("ultimateUploader"));
if(J){J.width=Q-2;
var D=O-32;
var W=document.getElementById(B.$("ultimateUploaderRemarkSize"));
if(W){D-=(W.offsetHeight<=0?13:W.offsetHeight)
}J.height=D
}}if(y&&y.getUploadDnDGridPanel()){y.getUploadDnDGridPanel().setHeight(O-72)
}if(z){var R=z.getGoogleDocsTree();
if(R&&R.rendered&&!R.hidden){var S=O-72;
R.setHeight(S-R.getPosition()[1]+z.getPosition()[1]);
R.setWidth(Q-10)
}}if(b){b.reResize(Q,O)
}if(g){var N=g.getDropboxUploadPanel();
if(N&&N.rendered&&!N.hidden){var U=O-72;
N.setHeight(U);
N.setWidth(Q-10);
var F=g.getDropboxItemsTree();
if(F&&F.rendered&&!F.hidden){F.setHeight(U-F.getPosition()[1]+N.getPosition()[1]);
F.setWidth(Q-12)
}}}if(v){var V=v.getBoxUploadPanel();
if(V&&V.rendered&&!V.hidden){var E=O-72;
V.setHeight(E);
V.setWidth(Q-10);
var K=v.getBoxItemsTree();
if(K&&K.rendered&&!K.hidden){K.setHeight(E-K.getPosition()[1]+V.getPosition()[1]);
K.setWidth(Q-12)
}}}if(d){var H=d.getUploadFromUrlField();
if(H){var L=H.rendered?(H.label.getHeight()==0?60:H.label.getHeight()):60;
H.setHeight(O-L-150)
}}},beforeshow:function(C){if(m){var e=C.getComponent("java-upload");
if(e){if(e.rendered){var D=document.getElementById(B.$("contentForJavaUploader"));
if(D){D.innerHTML=String.format((B.htcConfig.chunkedUpload?HttpCommander.Lib.Consts.uploadAppletTextEx:HttpCommander.Lib.Consts.uploadAppletText),Ext.util.Format.htmlEncode(B.getAppRootUrl()),B.getUid(),B.htcConfig.twoLetterLangName)
}}else{e.html='<div style="margin-top:4px;margin-left:4px;" id="'+B.$("contentForJavaUploader")+'">'+String.format((B.htcConfig.chunkedUpload?HttpCommander.Lib.Consts.uploadAppletTextEx:HttpCommander.Lib.Consts.uploadAppletText),Ext.util.Format.htmlEncode(B.getAppRootUrl()),B.getUid(),B.htcConfig.twoLetterLangName)+"</div>"
}}}if(p){if(p.itemId=="dropbox-upload"||p.itemId=="skydrive-upload"||p.itemId=="google-upload"||p.itemId=="box-upload"){f(C.getComponent("upload-tab-panel"),p,true)
}}},show:function(e){e.syncSize()
},hide:function(C){if(l){l.resetFields()
}if(m){var e=C.getComponent("java-upload");
if(e){HttpCommander.Lib.Utils.removeElementFromDOM(B.$("javaPowUpload"));
var D=document.getElementById(B.$("contentForJavaUploader"));
if(D){D.innerHTML=""
}}}}},reResize:function(){n.setSize(n.getWidth()+1,n.getHeight()+1);
n.setSize(n.getWidth()-1,n.getHeight()-1)
},registerJavascriptEventsForUploaders:function(e){if(e){if(m){e.JavaPowUpload_onUploadStart=m.JavaPowUpload_onUploadStart;
e.JavaPowUpload_onUploadFinish=m.JavaPowUpload_onUploadFinish;
e.JavaPowUpload_onServerResponse=m.JavaPowUpload_onServerResponse;
e.JavaPowUpload_onAppletInit=m.JavaPowUpload_onAppletInit
}if(o){e.MultiPowUpload_onStart=o.MultiPowUpload_onStart;
e.MultiPowUpload_onComplete=o.MultiPowUpload_onComplete;
e.MultiPowUpload_onServerResponse=o.MultiPowUpload_onServerResponse;
e.MultiPowUpload_onMovieLoad=o.MultiPowUpload_onMovieLoad
}}},setActiveUpload:function(e){n.items.items[0].setActiveTab(e)
},activateiOSTabIfExists:function(){if(c){n.setActiveUpload("ios-upload-tab")
}},getDragAndDropFormPanel:function(){return y
}});
return n
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.LinkEditInOffice=function(c){var b=c.htcConfig.relativePath+"Images/ctc.png";
var a=new c.Window({title:"",plain:true,bodyStyle:"padding:5px",layout:"form",resizable:false,closeAction:"hide",width:400,autoHeigth:true,deferredRender:true,labelAlign:"top",items:[{itemId:"link-edit-office-label",xtype:"label",text:"",anchor:"100%"},{xtype:"areactc",ctcIcon:b,ctcHint:c.htcConfig.locData.CommandCopyToClipboard,autoScroll:true,hideLabel:true,itemId:"link-edit-in-office",readOnly:true,selectOnFocus:true,anchor:"100%",height:40,onSuccessCopied:function(){c.showBalloon(c.htcConfig.locData.BalloonCopiedToClipboard)
},onTriggerClickError:function(d){c.Msg.show({title:c.htcConfig.locData.BalloonCopyToClipboardFailed,msg:Ext.util.Format.htmlEncode(!!d?d.toString():c.htcConfig.locData.BalloonCopyToClipboardFailed),icon:c.Msg.ERROR,buttons:c.Msg.OK})
},flex:1},{itemId:"link-edit-loo-label",xtype:"label",html:String.format(c.htcConfig.locData.OpenLibreOfficeRunCommandNote||"Or press the key combination {0}Win+R{1}, insert the command line below in the {0}Open:{1} field and press {0}OK{1}","<b>","</b>"),anchor:"100%"},{xtype:"areactc",ctcIcon:b,ctcHint:c.htcConfig.locData.CommandCopyToClipboard,autoScroll:true,hideLabel:true,itemId:"link-edit-in-loo",readOnly:true,selectOnFocus:true,anchor:"100%",height:40,onSuccessCopied:function(){c.showBalloon(c.htcConfig.locData.BalloonCopiedToClipboard)
},onTriggerClickError:function(d){c.Msg.show({title:c.htcConfig.locData.BalloonCopyToClipboardFailed,msg:Ext.util.Format.htmlEncode(!!d?d.toString():c.htcConfig.locData.BalloonCopyToClipboardFailed),icon:c.Msg.ERROR,buttons:c.Msg.OK})
},flex:1},{itemId:"office-open-mode",xtype:"hidden",value:2}],buttons:[{text:c.htcConfig.locData.CommonButtonCaptionClose,handler:function(){a.hide()
}}],listeners:{hide:function(f){var g=f.getComponent("link-edit-office-label");
if(g){g.setText("");
g.el.dom.innerHTML=""
}f.setTitle("");
var e=f.getComponent("link-edit-in-office");
if(e){e.setValue("")
}var d=f.getComponent("link-edit-in-loo");
if(d){d.setValue("")
}},show:function(e){e.center();
e.doLayout();
e.syncSize();
var d=e.getComponent("link-edit-in-office");
if(d){d.focus(true)
}}}});
return a
};
HttpCommander.Lib.BasicAuthAlert=function(b){var c;
var a=new b.Window({title:b.htcConfig.locData.FixBasicAuthAlertTitle,bodyStyle:"padding:5px",layout:{type:"vbox",align:"stretch",padding:0},resizable:true,closeAction:"hide",width:300,height:140,plain:true,items:[{xtype:"label",hideLabel:true,autoHeight:true,margins:"0 0 5 0",html:String.format(b.htcConfig.locData.FixBasicAuthAlertMessage,"<span>"+HttpCommander.Lib.Utils.getHelpLinkOpenTag(b.getUid(),"basicSSLfix")+"Microsoft Office</a></span>")},c=new Ext.form.Checkbox({checked:false,boxLabel:b.htcConfig.locData.FixBasicAuthAlertCheckBoxText,listeners:{check:function(d,e){if(e){HttpCommander.Lib.Utils.setCookie(b.$("notshowfixsslalert"),1)
}else{HttpCommander.Lib.Utils.deleteCookie(b.$("notshowfixsslalert"))
}}}})],buttons:[{text:b.htcConfig.locData.CommonButtonCaptionClose,handler:function(){a.hide()
}}],listeners:{show:function(d){var e=HttpCommander.Lib.Utils.getCookie(b.$("notshowfixsslalert"),true);
c.checked=false;
if(typeof e!="undefined"&&e!=null&&e=="1"){c.checked=true
}}}});
return a
};
HttpCommander.Lib.OfficeEditor=function(d){var a,c;
var b={initAndShowFixBasicAuthAlert:function(){try{if(!a){a=HttpCommander.Lib.BasicAuthAlert({htcConfig:d.htcConfig,Window:d.Window,getUid:d.getUid,"$":d.$})
}a.show()
}catch(f){d.ProcessScriptError(f)
}},prepareAndShowLinkToFileEditInOffice:function(f,k){try{if(!c){c=HttpCommander.Lib.LinkEditInOffice({htcConfig:d.htcConfig,Window:d.Window,Msg:d.Msg,"$":d.$,setOfficeTypeDetected:d.setOfficeTypeDetected,getFileManagerInstance:d.getFileManagerInstance,showBalloon:d.showBalloon})
}c.hide();
var r=(k===0||k===2);
var p=d.getOfficeTypeDetected();
var o=((p==1||p==3)&&(k==0||k==2))||((p==2||p==3)&&(k==1||k==3));
c.getComponent("link-edit-in-office").setValue(f);
var h=c.getComponent("link-edit-loo-label");
var g=c.getComponent("link-edit-in-loo");
var q=HttpCommander.Lib.Utils.getMSOfficeCommand(f);
var i=!r||q;
if(i){g.setValue((r?q:"soffice")+' "'+f+'"');
h.setVisible(true);
g.setVisible(true)
}else{h.setVisible(false);
g.setVisible(false)
}c.setTitle(r?d.htcConfig.locData.CommandEditInMSOffice:d.htcConfig.locData.CommandEditInOOo);
var n=HttpCommander.Lib.Utils.getBackgroundColor(document.body);
try{var m=HttpCommander.Lib.Utils.getElementsByClass("x-window-mc");
if(m&&m.length>0){n=HttpCommander.Lib.Utils.getBackgroundColor(m[0])
}}catch(l){}c.getComponent("link-edit-office-label").setText('<table><tr><td style="width:100%;">'+("<p>"+Ext.util.Format.htmlEncode(d.htcConfig.locData.OfficeEditCopyLinkLabel)+"</p>")+"</table>",false);
c.getComponent("office-open-mode").setValue(k);
c.getComponent("link-edit-in-office").setHeight(80);
if(i){c.getComponent("link-edit-in-loo").setHeight(80)
}c.show()
}catch(l){d.ProcessScriptError(l)
}},EditDocumentInMSOffice:function(g){var n=d.htcConfig.isSSLConnection;
if(!n&&d.htcConfig.isBasicAuth){if(d.htcConfig.useSSLForMSOffice){g=String(g).replace(/^http:\/\//i,"https://")
}if(d.htcConfig.showFixBasicAuthAlert){var h=HttpCommander.Lib.Utils.getCookie(d.$("notshowfixsslalert"),true);
if(typeof h=="undefined"||h==null||h!="1"){b.initAndShowFixBasicAuthAlert()
}}}var m=String(g).replace(/%/g,"%25").replace(/&/g,"%26").replace(/#/g,"%23").replace(/\+/g,"%2B");
var l=HttpCommander.Lib.Utils.createSharePointPlugin();
if(!l&&(window.ActiveXObject||HttpCommander.Lib.Utils.browserIs.ie11up)){var o=HttpCommander.Lib.Utils.getFileExtension(g);
if(!o){return false
}o=","+o+",";
var f;
if((","+HttpCommander.Lib.Consts.msoWordTypes+",").indexOf(o)>-1){f=HttpCommander.Lib.Consts.ActiveXMSOfficeApplications.Word
}else{if((","+HttpCommander.Lib.Consts.msoExcelTypes+",").indexOf(o)>-1){f=HttpCommander.Lib.Consts.ActiveXMSOfficeApplications.Excel
}else{if((","+HttpCommander.Lib.Consts.msoPowerTypes+",").indexOf(o)>-1){f=HttpCommander.Lib.Consts.ActiveXMSOfficeApplications.PowerPoint
}}}if(typeof f!="undefined"){try{var k=new ActiveXObject(f.app);
if(typeof k.Visible!="undefined"){k.Visible=true
}else{if(typeof k.ActiveWindow!="undefined"){k.ActiveWindow.Visible=true
}}if(typeof f.obj!="undefined"){k[f.obj].Open(m);
return true
}}catch(i){return false
}}return false
}try{return l.EditDocument(m)
}catch(i){return false
}},EditDocumentInOOo:function(g){if(window.ActiveXObject||HttpCommander.Lib.Utils.browserIs.ie11up){try{var l=new ActiveXObject("com.sun.star.ServiceManager");
if(l){var k=l.createInstance("com.sun.star.frame.Desktop");
if(k){var h=l.Bridge_GetStruct("com.sun.star.beans.PropertyValue");
h.Name="InteractionHandler";
h.Value=l.createInstance("com.sun.star.task.InteractionHandler");
var f=new Array();
f[0]=h;
k.LoadComponentFromURL(g,"_blank",0,f);
return true
}}}catch(i){return false
}}return false
},EditDocumentInOffice:function(e,f){switch(f){case 0:if(!b.EditDocumentInMSOffice(e)){return b.EditDocumentInOOo(e)
}return true;
case 1:if(!b.EditDocumentInOOo(e)){return b.EditDocumentInMSOffice(e)
}return true;
case 2:return b.EditDocumentInMSOffice(e);
case 3:return b.EditDocumentInOOo(e);
default:return false
}},OpenFile:function(e,f){if(!b.EditDocumentInOffice(e,f)){e=HttpCommander.Lib.Utils.urlEncode(e);
b.prepareAndShowLinkToFileEditInOffice(e,f)
}}};
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.NewSubMenu=function(c){var i=[],a=null,d=null,e=null,b=c.htcConfig.officeTemplates,g={docx:false,xlsx:false,pptx:false},h=[];
i.push({itemId:"new-folder",text:c.htcConfig.locData.CommandFolder,icon:HttpCommander.Lib.Utils.getIconPath(c,"folder")});
i.push({itemId:"new-file",text:c.htcConfig.locData.CommandEmptyFile,icon:HttpCommander.Lib.Utils.getIconPath(c,"file")});
if(b&&b.length>0){Ext.each(b,function(k){if(g.hasOwnProperty(k.type)){g[k.type]=true
}});
if(c.htcConfig.enableMSOOEdit){d={itemId:"new-msoo",text:c.htcConfig.locData.CommandNewMSOODocument,icon:HttpCommander.Lib.Utils.getIconPath(c,"skydrive"),menu:{items:[{itemId:"new-msoo-docx",ext:"docx",newName:c.htcConfig.locData.CommonNewDocument,text:c.htcConfig.locData.CommandNewMSOOWord,icon:HttpCommander.Lib.Utils.getIconPath(c,"docx")},{itemId:"new-msoo-xlsx",ext:"xlsx",newName:c.htcConfig.locData.CommonNewSpreadsheet,text:c.htcConfig.locData.CommandNewMSOOExcel,icon:HttpCommander.Lib.Utils.getIconPath(c,"xlsx")},{itemId:"new-msoo-pptx",ext:"pptx",newName:c.htcConfig.locData.CommonNewPresentation,text:c.htcConfig.locData.CommandNewMSOOPowerPoint,icon:HttpCommander.Lib.Utils.getIconPath(c,"pptx")}],listeners:{itemclick:function(k){c.getMenuActions().createNewMSOO(k.ext,k.newName)
},beforeshow:function(k){Ext.each(k.items.items,function(m){var l=!Ext.isEmpty(m.ext)&&c.isExtensionAllowed("a."+m.ext,true)&&HttpCommander.Lib.Consts.msooEditorFileTypes.indexOf(";"+m.ext+";")!=-1&&g[m.ext];
m.setVisible(l)
})
}}}};
i.push(d)
}if(c.htcConfig.enableOffice365Edit){e={itemId:"new-365",text:c.htcConfig.locData.CommandNewOffice365Document,icon:HttpCommander.Lib.Utils.getIconPath(c,"office365"),menu:{items:[{itemId:"new-365-docx",ext:"docx",newName:c.htcConfig.locData.CommonNewDocument,text:c.htcConfig.locData.CommandNewMSOOWord,icon:HttpCommander.Lib.Utils.getIconPath(c,"docx")},{itemId:"new-365-xlsx",ext:"xlsx",newName:c.htcConfig.locData.CommonNewSpreadsheet,text:c.htcConfig.locData.CommandNewMSOOExcel,icon:HttpCommander.Lib.Utils.getIconPath(c,"xlsx")},{itemId:"new-365-pptx",ext:"pptx",newName:c.htcConfig.locData.CommonNewPresentation,text:c.htcConfig.locData.CommandNewMSOOPowerPoint,icon:HttpCommander.Lib.Utils.getIconPath(c,"pptx")}],listeners:{itemclick:function(k){c.getMenuActions().createNew365(k.ext,k.newName)
},beforeshow:function(k){Ext.each(k.items.items,function(m){var l=!Ext.isEmpty(m.ext)&&c.isExtensionAllowed("a."+m.ext,true)&&HttpCommander.Lib.Consts.msooEditorFileTypes.indexOf(";"+m.ext+";")!=-1&&g[m.ext];
m.setVisible(l)
})
}}}};
i.push(e)
}}if(c.htcConfig.enableGoogleEdit){a={itemId:"new-google",text:c.htcConfig.locData.CommandNewGoogleDocument,icon:HttpCommander.Lib.Utils.getIconPath(c,"googledocs"),menu:{items:[{itemId:"new-gdoc",ext:"docx",newName:c.htcConfig.locData.CommonNewDocument,mimeType:"application/vnd.google-apps.document",text:c.htcConfig.locData.CommandNewGoogleDocs,icon:HttpCommander.Lib.Utils.getIconPath(c,"gtype1")},{itemId:"new-gsheet",ext:"xlsx",newName:c.htcConfig.locData.CommonNewSpreadsheet,mimeType:"application/vnd.google-apps.spreadsheet",text:c.htcConfig.locData.CommandNewGoogleSheets,icon:HttpCommander.Lib.Utils.getIconPath(c,"gtype2")},{itemId:"new-gslide",ext:"pptx",newName:c.htcConfig.locData.CommonNewPresentation,mimeType:"application/vnd.google-apps.presentation",text:c.htcConfig.locData.CommandNewGoogleSlides,icon:HttpCommander.Lib.Utils.getIconPath(c,"gtype3")}],listeners:{itemclick:function(k){c.getMenuActions().createNewGoogle(k.mimeType,k.ext,k.newName)
},beforeshow:function(k){Ext.each(k.items.items,function(m){var l=!Ext.isEmpty(m.mimeType)&&!Ext.isEmpty(m.ext)&&c.isExtensionAllowed("a."+m.ext,true)&&HttpCommander.Lib.Consts.googleDriveEditorFileTypes.indexOf(";"+m.ext+";")!=-1;
m.setVisible(l)
})
}}}};
i.push(a)
}if(c.htcConfig.enablePixlrEditor){i.push({itemId:"new-image-with-pixlr",text:c.htcConfig.locData.CommandNewImage,icon:HttpCommander.Lib.Utils.getIconPath(c,"pixlr")})
}if(c.htcConfig.allowCreateShortcuts){i.push({itemId:"shortcut",text:c.htcConfig.locData.CommandCreateShortcut,icon:HttpCommander.Lib.Utils.getIconPath(c,"folder-shortcut")})
}if(c.htcConfig.officeTemplates.length>0){Ext.each(c.htcConfig.officeTemplates,function(k){var l="new-"+(k.type==""?k.name:k.type);
if(k.type.toLowerCase()=="zip"){i.push({itemId:l,text:Ext.util.Format.htmlEncode(k.name),itemFileName:k.name,icon:c.htcConfig.relativePath+k.icon})
}else{h.push({itemId:l,text:Ext.util.Format.htmlEncode(k.name),itemFileName:k.name,icon:c.htcConfig.relativePath+k.icon})
}});
i.push({text:c.htcConfig.locData.CommandNewWithTemplate,handler:function(k,l){return false
},itemId:"new-with-template",menu:{items:h,listeners:{itemclick:function(k){c.getMenuActions().newItemFromTemplate(k)
},beforeshow:function(l){var k=c.getCurrentPerms();
if(c.htcConfig.officeTemplates.length>0&&k){Ext.each(l.items.items,function(m){if(!Ext.isEmpty(m.text)){m.setVisible(c.isExtensionAllowed(m.text))
}})
}}}}})
}var f=new Ext.menu.Menu({items:i,listeners:{itemclick:function(k){switch(k.itemId){case"new-file":case"new-folder":c.getMenuActions().createNewItem(k.itemId=="new-file"?"file":"folder");
break;
case"new-image-with-pixlr":c.getMenuActions().viewInService("pixlr",true);
break;
case"shortcut":c.getMenuActions().runShortcut();
break;
case"new-zip":c.getMenuActions().newItemFromTemplate(k);
break;
case"new-google":case"new-msoo":case"new-365":break
}},beforeshow:function(l){var s=c.getCurrentPerms(),n=false;
if(c.htcConfig.officeTemplates.length>0&&s){Ext.each(h,function(y){if(!Ext.isEmpty(y.itemFileName)){if(!n&&c.isExtensionAllowed(y.itemFileName)){n=true
}}})
}var k=l.getComponent("new-zip");
if(k){k.setVisible(s&&c.isExtensionAllowed("file.zip")&&s.zip)
}l.getComponent("new-with-template").setVisible(n);
if(c.htcConfig.allowCreateShortcuts){var v=l.getComponent("shortcut");
if(v){var t=c.getSelTypeFilesModel(c.getGrid()),o=t?t.selModel:null,r=o?o.getCount():0;
v.setVisible(s&&s.create&&r<2&&c.isExtensionAllowed("file.lnk"))
}}if(a){var x=false;
var m=l.getComponent("new-google");
if(m){Ext.each(m.menu.items.items,function(z){var y=!Ext.isEmpty(z.mimeType)&&!Ext.isEmpty(z.ext)&&c.isExtensionAllowed("a."+z.ext,true);
z.setVisible(y);
if(y&&!x){x=true
}});
m.setVisible(x)
}}if(d){var q=false;
var w=l.getComponent("new-msoo");
if(w){Ext.each(w.menu.items.items,function(z){var y=!Ext.isEmpty(z.ext)&&c.isExtensionAllowed("a."+z.ext,true)&&g[z.ext];
z.setVisible(y);
if(y&&!q){q=true
}});
w.setVisible(q)
}}if(e){var p=false;
var u=l.getComponent("new-365");
if(u){Ext.each(u.menu.items.items,function(z){var y=!Ext.isEmpty(z.ext)&&c.isExtensionAllowed("a."+z.ext,true)&&g[z.ext];
z.setVisible(y);
if(y&&!p){p=true
}});
u.setVisible(p)
}}}}});
return f
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.ViewEditSubMenu=function(b){var a=new Ext.menu.Menu({items:[{itemId:"view",text:b.htcConfig.locData.CommandView,icon:HttpCommander.Lib.Utils.getIconPath(b,"view")},{itemId:"preview",text:b.htcConfig.locData.CommandPreview,icon:HttpCommander.Lib.Utils.getIconPath(b,"preview")},{itemId:"flash-preview",text:b.htcConfig.locData.CommandFlashPreview,icon:HttpCommander.Lib.Utils.getIconPath(b,"flash")},{itemId:"mso-edit",text:b.htcConfig.locData.CommandEditInMSOffice,icon:HttpCommander.Lib.Utils.getIconPath(b,"mso")},{itemId:"msoo-edit",text:b.htcConfig.locData.CommandEditInMSOO,icon:HttpCommander.Lib.Utils.getIconPath(b,"skydrive")},{itemId:"office365-edit",text:b.htcConfig.locData.CommandEditInOffice365,icon:HttpCommander.Lib.Utils.getIconPath(b,"office365")},{itemId:"ooo-edit",text:b.htcConfig.locData.CommandEditInOOo,icon:HttpCommander.Lib.Utils.getIconPath(b,"ooo")},{itemId:"owa-view",text:b.htcConfig.locData.CommandViewWithOWA,icon:HttpCommander.Lib.Utils.getIconPath(b,"owa")},{itemId:"google-edit",text:b.htcConfig.locData.CommandEditInGoogle,icon:HttpCommander.Lib.Utils.getIconPath(b,"googledocs")},{itemId:"google-view",text:b.htcConfig.locData.CommandViewWithGoogleDoc,icon:HttpCommander.Lib.Utils.getIconPath(b,"googledoc")},{itemId:"autodesk-view",text:b.htcConfig.locData.CommandViewWithAutodesk,icon:HttpCommander.Lib.Utils.getIconPath(b,"autodesk")},{itemId:"sharecad-view",text:b.htcConfig.locData.CommandViewWithShareCad,icon:HttpCommander.Lib.Utils.getIconPath(b,"sharecad")},{itemId:"box-view",text:b.htcConfig.locData.CommandViewWithBox,icon:HttpCommander.Lib.Utils.getIconPath(b,"box")},{itemId:"zoho-edit",text:b.htcConfig.locData.CommandEditWithZoho,icon:HttpCommander.Lib.Utils.getIconPath(b,"zohoeditor")},{itemId:"image-edit-in-pixlr",text:b.htcConfig.locData.CommandEditInPixlr,icon:HttpCommander.Lib.Utils.getIconPath(b,"pixlr")},{itemId:"image-edit-in-adobe",text:b.htcConfig.locData.CommandEditInAdobe,icon:HttpCommander.Lib.Utils.getIconPath(b,"adobeimage")},{itemId:"play-video-js",text:b.htcConfig.locData.CommandPlayVideoHtml5,icon:HttpCommander.Lib.Utils.getIconPath(b,"play-video")},{itemId:"play-audio-html5",text:b.htcConfig.locData.CommandPlayAudioHtml5,icon:HttpCommander.Lib.Utils.getIconPath(b,"play-audio")},{itemId:"video-convert",text:b.htcConfig.locData.CommandConvertVideo,icon:HttpCommander.Lib.Utils.getIconPath(b,"process")},{itemId:"cloud-convert",text:b.htcConfig.locData.CommandCloudConvert,icon:HttpCommander.Lib.Utils.getIconPath(b,"cloudconvert")},{itemId:"edit",text:b.htcConfig.locData.CommandEdit,icon:HttpCommander.Lib.Utils.getIconPath(b,"textedit")}],listeners:{beforeshow:function(c){a.onBeforeShowViewEditMenu(c,b.getSelTypeFilesModel(b.getGrid()))
},itemclick:function(f){switch(f.itemId){case"view":b.getMenuActions().viewFile();
break;
case"preview":b.getMenuActions().imagesPreview();
break;
case"flash-preview":b.getMenuActions().flashPreview();
break;
case"edit":b.getMenuActions().editFile();
break;
case"google-view":case"owa-view":case"sharecad-view":case"box-view":case"zoho-edit":case"image-edit-in-pixlr":case"image-edit-in-adobe":var e=f.itemId,d=e.indexOf("-");
if(d>0){if(e=="image-edit-in-pixlr"){e="pixlr"
}else{if(e=="image-edit-in-adobe"){e="adobe"
}else{e=e.substring(0,d)
}}}b.getMenuActions().viewInService(e);
break;
case"autodesk-view":b.getMenuActions().viewInAutodesk();
break;
case"cloud-convert":b.getMenuActions().getOutputFormats();
break;
case"mso-edit":b.getMenuActions().editInMsoOoo(true,b.openInMsoNewWay);
break;
case"ooo-edit":var c=b.initOfficeEditor();
b.getMenuActions().editInMsoOoo(false,c.OpenFile);
break;
case"msoo-edit":b.getMenuActions().msooEdit();
break;
case"office365-edit":b.getMenuActions().office365Edit();
break;
case"google-edit":b.getMenuActions().googleEdit();
break;
case"video-convert":b.getMenuActions().videoConvert();
break;
case"play-video-flash":b.getMenuActions().playVideoFlash();
break;
case"play-video-js":b.getMenuActions().playVideoJS();
break;
case"play-video-html5":b.getMenuActions().playVideoHTML5();
break;
case"play-audio-html5":b.getMenuActions().playVideoJS();
break
}}},onBeforeShowViewEditMenu:function(S,u){var T=b.getCurrentFolder();
if(b.isRecentFolder(T)||b.isTrashFolder(T)){return false
}var M=u.selModel;
var q=M.getSelected();
var N=q?q.data:{};
var H=u.selType;
var o=u.selFiles;
var R=H=="none"?"":HttpCommander.Lib.Utils.getFileExtension(N.name);
var I=";"+R+";";
var s=(N.size||N.size_hidden||0);
var h=b.htcConfig.currentPerms&&H=="file"&&b.htcConfig.currentPerms.download&&b.htcConfig.enableGoogleDocumentsViewer&&HttpCommander.Lib.Consts.googleDocSupportedtypes.indexOf(I)!=-1&&s>0;
var J=b.htcConfig.currentPerms&&H=="file"&&b.htcConfig.currentPerms.download&&b.htcConfig.enableOWADocumentsViewer&&HttpCommander.Lib.Consts.owaSupportedtypes.indexOf(I)!=-1&&s>0&&((I.indexOf(";xls")==0&&s<=5242880)||(I.indexOf(";xls")<0&&s<=10485760));
var e=b.htcConfig.currentPerms&&H=="file"&&b.htcConfig.currentPerms.download&&b.htcConfig.enableBoxDocumentsViewer&&HttpCommander.Lib.Consts.boxViewSupportedtypes.indexOf(I)!=-1&&s>0;
var y=b.htcConfig.currentPerms&&H=="file"&&b.htcConfig.currentPerms.download&&b.htcConfig.enableShareCadViewer&&HttpCommander.Lib.Consts.shareCadOrgSupportedTypes.indexOf(I)!=-1&&s>0;
var P=b.supportsWebGlCanvasForAutodesk();
var x=b.htcConfig.currentPerms&&H=="file"&&b.htcConfig.currentPerms.download&&b.htcConfig.enableAutodeskViewer&&HttpCommander.Lib.Consts.autodeskViewerFileTypes.indexOf(I)!=-1&&s>0&&P;
var g=b.htcConfig.currentPerms&&H=="file"&&b.htcConfig.currentPerms.download&&HttpCommander.Lib.Utils.isAllowedForViewingInBrowser(N.name,b.htcConfig);
if(g&&R=="swf"&&HttpCommander.Lib.Utils.browserIs.ios){g=false
}var L=(H!="empty");
var k=b.htcConfig.currentPerms&&H=="file"&&b.htcConfig.currentPerms.download&&HttpCommander.Lib.Consts.imagesFileTypes.indexOf(I)!=-1&&s>0;
var w=b.htcConfig.currentPerms&&H=="file"&&b.htcConfig.currentPerms.download&&R=="swf"&&!HttpCommander.Lib.Utils.browserIs.ios&&s>0;
var D=(b.htcConfig.enableMSOfficeEdit||b.htcConfig.enableOpenOfficeEdit||b.htcConfig.enableWebFoldersLinks)&&N.locked;
var i=b.htcConfig.enableEditAsTextFile&&b.htcConfig.currentPerms&&H=="file"&&b.htcConfig.currentPerms.download&&b.htcConfig.currentPerms.modify;
var Q=b.htcConfig.enableEditAsTextFile&&b.htcConfig.currentPerms&&H=="file"&&b.htcConfig.currentPerms.download;
var G=(typeof b.htcConfig.maxSizeForEditAsTextFile!="undefined")?(s<=b.htcConfig.maxSizeForEditAsTextFile):false;
if(i){i=G
}if(Q){Q=G
}if(Q&&(!i||D)){S.getComponent("edit").setText(b.htcConfig.locData.CommandEditView)
}else{S.getComponent("edit").setText(b.htcConfig.locData.CommandEdit)
}var O=HttpCommander.Lib.Utils.checkAndGetNewExtensionConvertedFromGoogle(R);
var B=HttpCommander.Lib.Utils.checkAndGetNewExtensionConvertedFromMSOO(R);
var d=b.htcConfig.currentPerms&&b.htcConfig.enableMSOfficeEdit&&H=="file"&&b.htcConfig.currentPerms.download&&HttpCommander.Lib.Consts.msoSupportedtypes.indexOf(I)!=-1&&b.htcConfig.hcAuthMode!="shibboleth";
var f=d&&b.htcConfig.currentPerms.modify;
if(d){d=!b.htcConfig.anonymousEditingOffice
}if(d&&!f){S.getComponent("mso-edit").setText(b.htcConfig.locData.CommandViewInMSOffice)
}else{S.getComponent("mso-edit").setText(b.htcConfig.locData.CommandEditInMSOffice)
}var E=b.htcConfig.currentPerms&&b.htcConfig.enableOpenOfficeEdit&&H=="file"&&b.htcConfig.currentPerms.download&&HttpCommander.Lib.Consts.oooSupportedtypes.indexOf(I)!=-1&&b.htcConfig.hcAuthMode!="shibboleth";
var F=E&&b.htcConfig.currentPerms.modify;
if(E){E=!b.htcConfig.anonymousEditingOffice
}if(E&&!F){S.getComponent("ooo-edit").setText(b.htcConfig.locData.CommandViewInOOo)
}else{S.getComponent("ooo-edit").setText(b.htcConfig.locData.CommandEditInOOo)
}var r=b.htcConfig.currentPerms&&H=="file"&&b.htcConfig.currentPerms.download&&b.htcConfig.currentPerms.modify&&b.htcConfig.enableZohoDocumentsEditor&&b.htcConfig.zohoSupportedEditTypes.indexOf(R)!=-1;
var n=b.htcConfig.currentPerms&&b.htcConfig.enableMSOOEdit&&H=="file"&&b.htcConfig.currentPerms.download&&b.htcConfig.currentPerms.modify&&HttpCommander.Lib.Consts.msooEditorFileTypes.indexOf(I)!=-1&&(Ext.isEmpty(B)||(b.isExtensionAllowed("file."+B)&&b.htcConfig.currentPerms.create));
var A=b.htcConfig.currentPerms&&b.htcConfig.enableOffice365Edit&&H=="file"&&b.htcConfig.currentPerms.download&&b.htcConfig.currentPerms.modify&&HttpCommander.Lib.Consts.msooEditorFileTypes.indexOf(I)!=-1&&R!="txt"&&(HttpCommander.Lib.Consts.msooEditFormatsForConvert.indexOf(I)<0);
var l=b.htcConfig.currentPerms&&b.htcConfig.enableGoogleEdit&&H=="file"&&b.htcConfig.currentPerms.download&&b.htcConfig.currentPerms.modify&&HttpCommander.Lib.Consts.googleDriveEditorFileTypes.indexOf(I)!=-1&&(Ext.isEmpty(O)||(b.isExtensionAllowed("file."+O)&&b.htcConfig.currentPerms.create));
var z=b.htcConfig.currentPerms&&H=="file"&&b.htcConfig.currentPerms.download&&HttpCommander.Lib.Consts.pixlrSupportedTypes.indexOf(I)!=-1&&b.htcConfig.currentPerms.modify&&b.htcConfig.enablePixlrEditor&&s>0;
var m=b.htcConfig.currentPerms&&H=="file"&&b.htcConfig.currentPerms.download&&HttpCommander.Lib.Consts.adobeImageSupportedTypes.indexOf(I)!=-1&&b.htcConfig.currentPerms.modify&&b.htcConfig.enableAdobeImageEditor&&s>0;
var p=b.htcConfig.enableConvertingVideo&&b.htcConfig.currentPerms&&b.htcConfig.currentPerms.create&&b.htcConfig.currentPerms.modify&&H=="file"&&HttpCommander.Lib.Consts.videoConvertFileTypes.indexOf(I)!=-1&&s>0;
var v=b.htcConfig.enablePlayVideo&&b.htcConfig.currentPerms&&b.htcConfig.currentPerms.download&&H=="file"&&HttpCommander.Lib.Consts.flowplayerFileTypes.indexOf(I)!=-1&&!HttpCommander.Lib.Utils.browserIs.ios&&s>0;
var C=b.htcConfig.enablePlayVideo&&b.htcConfig.currentPerms&&b.htcConfig.currentPerms.download&&H=="file"&&HttpCommander.Lib.Consts.html5VideoFileTypes.indexOf(I)!=-1&&s>0;
var t=b.htcConfig.enablePlayAudio&&b.htcConfig.currentPerms&&b.htcConfig.currentPerms.download&&H=="file"&&HttpCommander.Lib.Consts.html5AudioFileTypes.indexOf(I)!=-1&&s>0;
var c=b.htcConfig.enableCloudConvert&&b.htcConfig.currentPerms&&H=="file"&&(b.htcConfig.currentPerms.upload||b.htcConfig.currentPerms.download)&&R&&R.length>0&&s>0;
var K=g||n||A||h||l||y||x||J||e||c||r||f||d||F||E||i||Q||z||m||k||p||v||C||t||w;
S.getComponent("view").setVisible(g&&L);
S.getComponent("view").setDisabled(!g||!L);
S.getComponent("preview").setVisible(k);
S.getComponent("preview").setDisabled(!k);
S.getComponent("flash-preview").setVisible(w);
S.getComponent("flash-preview").setDisabled(!w);
S.getComponent("edit").setVisible(i||Q);
S.getComponent("edit").setDisabled(!i&&!Q);
S.getComponent("owa-view").setVisible(J);
S.getComponent("owa-view").setDisabled(!J);
S.getComponent("google-view").setVisible(h);
S.getComponent("google-view").setDisabled(!h);
S.getComponent("google-edit").setVisible(l);
S.getComponent("google-edit").setDisabled(!l||D);
S.getComponent("msoo-edit").setVisible(n);
S.getComponent("msoo-edit").setDisabled(!n||D);
S.getComponent("office365-edit").setVisible(A);
S.getComponent("office365-edit").setDisabled(!A||D);
S.getComponent("sharecad-view").setVisible(y);
S.getComponent("sharecad-view").setDisabled(!y);
S.getComponent("autodesk-view").setVisible(x);
S.getComponent("autodesk-view").setDisabled(!x);
S.getComponent("box-view").setVisible(e);
S.getComponent("box-view").setDisabled(!e);
S.getComponent("cloud-convert").setVisible(c);
S.getComponent("cloud-convert").setDisabled(!c);
S.getComponent("mso-edit").setVisible(f||d);
S.getComponent("mso-edit").setDisabled(!f&&!d);
S.getComponent("ooo-edit").setVisible(F||E);
S.getComponent("ooo-edit").setDisabled(!F&&!E);
S.getComponent("zoho-edit").setVisible(r);
S.getComponent("zoho-edit").setDisabled(!r||D);
S.getComponent("image-edit-in-pixlr").setVisible(z);
S.getComponent("image-edit-in-pixlr").setDisabled(!z);
S.getComponent("image-edit-in-adobe").setVisible(m);
S.getComponent("image-edit-in-adobe").setDisabled(!m);
S.getComponent("video-convert").setVisible(p);
S.getComponent("video-convert").setDisabled(!p);
S.getComponent("play-video-js").setVisible(C||v);
S.getComponent("play-video-js").setDisabled(!C&&!v);
S.getComponent("play-audio-html5").setVisible(t);
S.getComponent("play-audio-html5").setDisabled(!t);
return K
}});
return a
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.ShareSubMenu=function(b){var a=new Ext.menu.Menu({items:[{itemId:"link",text:b.htcConfig.locData.CommandLinkToFile,icon:HttpCommander.Lib.Utils.getIconPath(b,"linktofile")},{itemId:"share-folder",text:b.htcConfig.locData.CommandMakePublicFolder,icon:HttpCommander.Lib.Utils.getIconPath(b,"sharefolder")},{itemId:"send-email",text:b.htcConfig.locData.CommandSendEmail,icon:HttpCommander.Lib.Utils.getIconPath(b,"sendemail")},{itemId:"send-gmail",text:b.htcConfig.locData.CommandSendWithGmail,icon:HttpCommander.Lib.Utils.getIconPath(b,"gmail")},{itemId:"send-outlook",text:b.htcConfig.locData.CommandSendWithOutlook,icon:HttpCommander.Lib.Utils.getIconPath(b,"outlook")}],listeners:{beforeshow:function(c){a.onBeforeShowShareMenu(c,b.getSelTypeFilesModel(b.getGrid()))
},itemclick:function(c){switch(c.itemId){case"link":b.getMenuActions().linkToFileFolder();
break;
case"share-folder":b.getMenuActions().shareFolder(b.virtualFilePath,b.prepareAndShowMakePublicLinkWindow);
break;
case"send-email":b.getMenuActions().sendEmail();
break;
case"send-gmail":b.getMenuActions().sendEmailWithService("gmail");
break;
case"send-outlook":b.getMenuActions().sendEmailWithService("outlook");
break
}}},onBeforeShowShareMenu:function(g,k){var o=b.getCurrentFolder();
if(b.isRecentFolder(o)||b.isTrashFolder(o)||b.isAlertsFolder(o)){return false
}var l=k.selModel;
var s=l.getSelected();
var i=s?s.data:{};
var p=k.selType;
var d=k.selFiles;
if(p=="trashroot"){return false
}var f=p=="none"?"":HttpCommander.Lib.Utils.getFileExtension(i.name);
var r=";"+f+";";
var h=(i.size||0);
var c=b.htcConfig.currentPerms&&(((p=="folder"||p=="none")&&b.htcConfig.enableLinkToFolder===true)||(b.htcConfig.currentPerms.download&&p=="file"&&b.htcConfig.enableLinkToFile===true));
var q=b.htcConfig.currentPerms&&((p=="file"&&b.htcConfig.enablePublicLinkToFile===true&&b.htcConfig.currentPerms.download&&b.htcConfig.currentPerms.anonymDownload)||((p=="folder"||p=="none")&&b.htcConfig.enablePublicLinkToFolder===true&&(((b.htcConfig.currentPerms.download||b.htcConfig.currentPerms.zipDownload)&&b.htcConfig.currentPerms.anonymDownload)||(b.htcConfig.currentPerms.upload&&b.htcConfig.currentPerms.anonymUpload)||((b.htcConfig.currentPerms.listFiles||b.htcConfig.currentPerms.listFolders)&&b.htcConfig.currentPerms.anonymViewContent))));
var n=b.htcConfig.enableSendEmail!="disable";
var e=n&&(b.htcConfig.enableSendEmail=="any"||b.htcConfig.enableSendEmail=="linksonly");
var m=c||q||n||e;
g.getComponent("link").setVisible(c);
g.getComponent("link").setDisabled(!c);
g.getComponent("share-folder").setVisible(q);
g.getComponent("share-folder").setDisabled(!q);
g.getComponent("send-email").setVisible(n);
g.getComponent("send-email").setDisabled(!n);
g.getComponent("send-gmail").setVisible(e);
g.getComponent("send-gmail").setDisabled(!e);
g.getComponent("send-outlook").setVisible(e);
g.getComponent("send-outlook").setDisabled(!e);
return m
}});
return a
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.CloudConvertWindow=function(a){var b=new a.Window({title:"",plain:true,bodyStyle:"padding:5px",modal:true,width:a.getIsEmbeddedtoIFRAME()?250:300,minWidth:265,autoHeight:true,minHeight:230,layout:"form",closeAction:"hide",itemPath:null,itemName:null,outputFormats:null,buttonAlign:"left",defaults:{anchor:"100%",hideMode:"visibility"},items:[{xtype:"displayfield",hideLabel:true,value:'<img width="24" height="24" src="'+HttpCommander.Lib.Utils.getIconPath(a,"cloudconvert")+'" class="filetypeimage" />&nbsp;Powered by <a href="https://cloudconvert.com/" target="_blank">CloudConvert</a>'},{xtype:"combo",itemId:"output-formats",autoSelect:true,allowBlank:false,editable:false,fieldLabel:a.htcConfig.locData.CloudConvertWindowOutputFormatsLabel,forceSelection:true,mode:"local",store:new Ext.data.ArrayStore({idIndex:0,autoDestroy:true,fields:["format"],data:[]}),valueField:"format",displayField:"format",tpl:'<tpl for="."><div class="x-combo-list-item">{format:htmlEncode}</div></tpl>',typeAhead:true,triggerAction:"all",lazyRender:false,lazyInit:false,listClass:"x-combo-list-small"},{xtype:"displayfield",hideLabel:true,hidden:true,itemId:"download-link",value:a.htcConfig.locData.CloudConvertDownloadLinkLabel},{itemId:"download-link-text",xtype:"textfield",hideLabel:true,selectOnFocus:true,readOnly:true,hidden:true},{xtype:"label",hidden:true,itemId:"save-as-label",text:a.htcConfig.locData.CloudConvertSaveAsLabel},{xtype:"textfield",value:"",hideLabel:true,hidden:true,itemId:"save-as-name",emptyText:a.htcConfig.locData.CloudConvertSaveAsNameBlank},{xtype:"hidden",value:"",itemId:"last-converted-of"}],listeners:{show:function(l){var n=l,f=n.getComponent("output-formats"),e=n.getComponent("last-converted-of"),c=n.getComponent("download-link"),h=n.getComponent("save-as-label"),d=n.getComponent("save-as-name"),m=n.getComponent("download-link-text"),o=[],g=0,k=n.outputFormats.length;
for(;
g<k;
g++){o.push([n.outputFormats[g]])
}f.getStore().loadData(o);
f.setValue(n.outputFormats[0]);
e.setValue("");
c.hide();
m.hide();
h.hide();
d.hide();
n.buttons[0].hide()
}},buttons:[{text:a.htcConfig.locData.CommandSave,hidden:true,handler:function(){var n=b,f=n.getComponent("download-link"),l=n.getComponent("download-link-text"),g=n.getComponent("save-as-name"),k=g.getValue(),m=-1,i=n.getComponent("output-formats"),h=n.getComponent("last-converted-of"),e=h.getValue(),c={path:n.itemPath,url:l.getValue()};
if(!e||e.trim().length==0){return
}if(!k||k.trim().length==0){k=n.itemName
}m=k.lastIndexOf(".");
if(m<0||k.substring(m)!=("."+e)){k+="."+e
}c.name=k;
a.globalLoadMask.msg=a.htcConfig.locData.ProgressCloudConvertUploading+"...";
a.globalLoadMask.show();
var d=Ext.Ajax.timeout;
Ext.Ajax.timeout=10*60*1000;
HttpCommander.Common.CloudConvertSave(c,function(p,o){Ext.Ajax.timeout=d;
a.globalLoadMask.hide();
a.globalLoadMask.msg=a.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(p,o,a.Msg,a.htcConfig,2)){if(!Ext.isEmpty(p.newname||c.name)&&!Ext.isEmpty(c.path)){a.setSelectPath({name:p.newname||c.name,path:c.path})
}a.openTreeRecent();
a.openGridFolder(c.path);
a.showBalloon(String.format(a.htcConfig.locData.UploadFromUrlSuccessMsg,HttpCommander.Lib.Utils.checkBracketsAndHtmlEncode(p.newname||c.name),Ext.util.Format.htmlEncode(c.url)))
}})
}},"->",{text:a.htcConfig.locData.CloudConvertWindowConvertButton,handler:function(){var n=b,d=n.getComponent("download-link"),i=n.getComponent("save-as-label"),e=n.getComponent("save-as-name"),l=n.getComponent("download-link-text"),k=n.itemName,m=-1,g=n.getComponent("output-formats"),f=n.getComponent("last-converted-of"),h={path:n.itemPath,name:n.itemName,of:g.getValue()};
n.buttons[0].hide();
d.hide();
l.hide();
i.hide();
e.hide();
e.setValue("");
f.setValue("");
a.globalLoadMask.msg=a.htcConfig.locData.ProgressCloudConvertConverting+"...";
a.globalLoadMask.show();
var c=Ext.Ajax.timeout;
Ext.Ajax.timeout=10*60*1000;
HttpCommander.Common.CloudConvertConvert(h,function(q,p){Ext.Ajax.timeout=c;
a.globalLoadMask.hide();
a.globalLoadMask.msg=a.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(q,p,a.Msg,a.htcConfig,0)){if(q.url){l.setValue(q.url.indexOf("//")==0?(location.protocol+q.url):q.url);
if(a.htcConfig.currentPerms&&a.htcConfig.currentPerms.download){var o=a.getRenderers().sizeRenderer(q.size);
if(o&&o.length>0){o=" ("+o+")"
}else{o=""
}d.setValue(String.format('<a href="{0}" target="_blank">{1}</a>{2}:',Ext.util.Format.htmlEncode(q.url),a.htcConfig.locData.CloudConvertDownloadLinkLabel,o),false);
d.show();
l.show()
}m=k.lastIndexOf(".");
k=(m>=0?String(k).substring(0,m):k)+"."+g.getValue();
if(a.htcConfig.currentPerms&&a.htcConfig.currentPerms.upload&&a.isExtensionAllowed(k,true)){i.show();
e.setValue(k);
e.show();
n.buttons[0].show();
f.setValue(h.of)
}}}})
}},{text:a.htcConfig.locData.CommonButtonCaptionCancel,handler:function(){b.hide()
}}]});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.CloudStoragesSubMenu=function(b){var g={Google:{name:HttpCommander.Lib.Consts.CloudNames.google,icon:"googledocs",down:b.htcConfig.isAllowedGoogleDrive&&b.htcConfig.enableDownloadToGoogle,up:b.htcConfig.isAllowedGoogleDrive&&b.htcConfig.enableUploadFromGoogle},Dropbox:{name:HttpCommander.Lib.Consts.CloudNames.dropbox,icon:"dropbox",down:b.htcConfig.isAllowedDropbox&&b.htcConfig.enableDownloadToDropbox,up:b.htcConfig.isAllowedDropbox&&b.htcConfig.enableUploadFromDropbox},SkyDrive:{name:HttpCommander.Lib.Consts.CloudNames.onedrive,icon:"skydrive",down:(b.htcConfig.isAllowedSkyDrive&&b.htcConfig.enableDownloadToSkyDrive),up:(b.htcConfig.isAllowedSkyDrive&&b.htcConfig.enableUploadFromSkyDrive)},Box:{name:HttpCommander.Lib.Consts.CloudNames.box,icon:"box",down:b.htcConfig.isAllowedBox&&b.htcConfig.enableDownloadToBox,up:b.htcConfig.isAllowedBox&&b.htcConfig.enableUploadFromBox}};
var f,d,c=true,i=true,h=[],e=[];
for(prop in g){if(g.hasOwnProperty(prop)){var a=String(prop);
h.push({itemId:a,text:g[prop].name,icon:HttpCommander.Lib.Utils.getIconPath(b,g[prop].icon)+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=cloudsmenu":""),hidden:!g[prop].down});
e.push({itemId:a,text:g[prop].name,icon:HttpCommander.Lib.Utils.getIconPath(b,g[prop].icon)+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=cloudsmenu":""),hidden:!g[prop].up});
if(g[prop].down){c=false
}if(g[prop].up){i=false
}}}var k=new Ext.menu.Menu({hidden:c&&i,items:[{itemId:"download",text:b.htcConfig.locData.CommandCloudsDownloadTo,icon:HttpCommander.Lib.Utils.getIconPath(b,"downloadtocloud"),handler:function(l,m){return false
},menu:f=new Ext.menu.Menu({items:h,listeners:{itemclick:function(m){if(m&&m.itemId){var l="downloadTo"+m.itemId;
if(typeof b[l]=="function"){b[l]()
}}}}})},{itemId:"upload",text:b.htcConfig.locData.CommandCloudsUploadFrom,icon:HttpCommander.Lib.Utils.getIconPath(b,"uploadfromcloud"),handler:function(l,m){return false
},menu:d=new Ext.menu.Menu({items:e,listeners:{itemclick:function(l){if(l&&l.itemId){b.showUploadWindow(l.itemId.toLowerCase()+"-upload")
}}}})},"-",{itemId:"about",text:b.htcConfig.locData.CommandCloudsAbout,hidden:false,handler:function(){b.showHelpWindow("clouds")
}}],listeners:{beforeshow:function(l){k.onBeforeShowCloudSubMenu(l,b.getSelTypeFilesModel(b.getGrid()))
}},onBeforeShowCloudSubMenu:function(o,r){var w=b.getCurrentFolder();
if(b.isRecentFolder(w)||b.isTrashFolder(w)||b.isAlertsFolder(w)){return false
}var n=r.selFiles,q=r.selFolders,x=r.selType;
var t=b.htcConfig.currentPerms&&b.htcConfig.currentPerms.download&&(n>0||q>0);
var u=b.htcConfig.currentPerms&&b.htcConfig.currentPerms.upload;
var l=false,p=false;
for(prop in g){if(g.hasOwnProperty(prop)){var v=t&&g[prop].down,s=u&&g[prop].up,m=String(prop);
if(prop=="SkyDrive"&&v){v=(b.htcConfig.isAllowedSkyDrive&&(n>0||q>0))
}else{if(prop=="Dropbox"&&v){v=(b.htcConfig.isAllowedDropbox&&(n>0||q>0))
}}f.getComponent(m).setVisible(v);
f.getComponent(m).setDisabled(!v);
d.getComponent(m).setVisible(s);
d.getComponent(m).setDisabled(!s);
if(v){l=true
}if(s){p=true
}}}o.getComponent("download").setVisible(l);
o.getComponent("download").setDisabled(!l);
o.getComponent("upload").setVisible(p);
o.getComponent("upload").setDisabled(!p);
return true
}});
return k
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.TrashSubMenu=function(a){var b=new Ext.menu.Menu({items:[{itemId:"empty",text:a.htcConfig.locData.TrashEmptyTrashLabel,icon:HttpCommander.Lib.Utils.getIconPath(a,"emptytrash")},{itemId:"delete",text:a.htcConfig.locData.CommandDelete,icon:HttpCommander.Lib.Utils.getIconPath(a,"delete")},"-",{itemId:"restore-all",text:a.htcConfig.locData.TrashRestoreAllLabel,icon:HttpCommander.Lib.Utils.getIconPath(a,"restoreall")},{itemId:"restore",text:a.htcConfig.locData.TrashRestoreSelectedLabel,icon:HttpCommander.Lib.Utils.getIconPath(a,"restore")}],listeners:{beforeshow:function(c){b.onBeforeShowTrashMenu(c,a.getSelTypeFilesModel(a.getGrid()))
},itemclick:function(c){switch(c.itemId){case"empty":a.getMenuActions().deleteSelectedItems(true);
break;
case"delete":a.getMenuActions().deleteSelectedItems();
break;
case"restore-all":a.getMenuActions().restoreTrashedItems(true);
break;
case"restore":a.getMenuActions().restoreTrashedItems();
break
}}},onBeforeShowTrashMenu:function(e,h){var k=a.getCurrentFolder();
if(!a.htcConfig.enableTrash){return false
}var d=a.isTrashFolder(k);
var i=h.selModel;
var m=i.getSelected();
var f=m?m.data:{};
var l=h.selType;
var c=h.selFiles;
var g=(l!="empty"&&l!="none");
e.getComponent("empty").setVisible(true);
e.getComponent("empty").setDisabled(false);
e.getComponent("restore-all").setVisible(true);
e.getComponent("restore-all").setDisabled(!d);
e.getComponent("delete").setVisible(true);
e.getComponent("delete").setDisabled(!d||!g);
e.getComponent("restore").setVisible(true);
e.getComponent("restore").setDisabled(!d||!g);
return true
}});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.VersioningSubMenu=function(a){var b=new Ext.menu.Menu({items:[{itemId:"version-history",text:a.htcConfig.locData.CommandVersionHistory,icon:HttpCommander.Lib.Utils.getIconPath(a,"verhist")},"-",{itemId:"check-out",text:a.htcConfig.locData.CommandCheckOut,icon:HttpCommander.Lib.Utils.getIconPath(a,"checkout")},{itemId:"check-in",text:a.htcConfig.locData.CommandCheckIn,icon:HttpCommander.Lib.Utils.getIconPath(a,"checkin")},{itemId:"undo-check-out",text:a.htcConfig.locData.CommandUndoCheckOut,icon:HttpCommander.Lib.Utils.getIconPath(a,"undocout")}],listeners:{itemclick:function(g){if(a.htcConfig.enableVersionControl){var d=a.getGrid().getSelectionModel().getSelected();
if(d.data.rowtype==="file"){var f={path:a.getCurrentFolder(),name:d.data.name};
switch(g.itemId){case"version-history":var e=a.initVersionHistory(f);
if(e){a.getMenuActions().versionHistory(f,e)
}break;
case"check-out":a.getMenuActions().checkOut(f);
break;
case"check-in":var c=a.initCheckInWindow(f);
if(c){c.setTitle(a.htcConfig.locData.CommandCheckIn+' "'+Ext.util.Format.htmlEncode(f.name)+'"');
c.show()
}break;
case"undo-check-out":a.getMenuActions().undoCheckOut(f);
break
}}}},beforeshow:function(){var k=a.getCurrentFolder();
if(a.isRecentFolder(k)||a.isTrashFolder(k)){return false
}var l=a.getSelTypeFilesModel(a.getGrid());
var h=l.selModel;
var c=false;
var d=a.htcConfig.currentPerms&&a.htcConfig.currentPerms.modify;
var i=false;
var f=false;
var g=h.getSelected().data;
if(g){var e=g.vstate||0;
c=(e&4);
i=d&&!(e&1);
f=d&&!i&&(e&2)
}b.getComponent("check-out").setDisabled(!i);
b.getComponent("check-in").setDisabled(!f);
b.getComponent("undo-check-out").setDisabled(!f)
}}});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.LabelsMenu=function(c){var a=[],d=false;
a.push({itemId:"no-label",text:c.htcConfig.locData.LabelsNoLabel});
a.push("-");
if(Ext.isArray(c.htcConfig.predefinedLabels)){Ext.each(c.htcConfig.predefinedLabels,function(e){if(Ext.isObject(e)&&!Ext.isEmpty(e.name)&&!Ext.isEmpty(e.color)){a.push({text:Ext.util.Format.htmlEncode(e.name),nameLabel:e.name,colorLabel:e.color,style:{fontWeight:"bold",color:e.color}});
if(!d){d=true
}}})
}if(d){a.push("-")
}a.push({itemId:"custom-label",text:c.htcConfig.locData.LabelsCustomLabel+"...",menu:{xtype:"colormenu",forceLayout:true,colors:["CC4125","E06666","F6B26B","FFD966","93C47D","76A5AF","6D9EEB","6FA8DC","8E7CC3","C27BA0","A61C00","CC0000","E69138","F1C232","6AA84F","45818E","3C78D8","3D85C6","674EA7","A64D79","85200C","990000","B45F06","BF9000","38761D","134F5C","1155CC","0B5394","351C75","741B47","5B0F00","660000","783F04","7F6000","274E13","0C343D","1C4587","073763","20124D","4C1130","000000","434343","666666","999999"],listeners:{afterrender:function(e){if(e&&e.palette){e.palette.allowReselect=true
}},select:function(f,i){var g=c.getSelTypeFilesModel(c.getGrid());
var l=null;
if(g&&g.selModel&&(g=g.selModel.getSelected())&&g.data){l=g.data.label
}var n=function(e){return String.format(c.htcConfig.locData.LabelsCustomLabelView,'<span class="file-folder-label" style="margin-bottom:-5px;display:inline-block;max-width:140px;background-color:#'+i+';">',Ext.isEmpty(e)||e.trim().length==0?"&nbsp;":Ext.util.Format.htmlEncode(e),"</span>")
};
if(Ext.isEmpty(l)||l.trim().length==0){l=c.htcConfig.locData.LabelsNewLabel
}var h=String.format(c.htcConfig.locData.LabelsCustomLabelView,'<span class="file-folder-label" style="background-color:#'+i+';">',Ext.util.Format.htmlEncode(l),"</span>");
var o=new c.Window({title:c.htcConfig.locData.LabelsCustomLabel,autoDestroy:true,modal:true,closable:true,minizable:false,maximizable:false,width:260,layout:"form",padding:5,resizable:false,autoHeight:true,labelAlign:"top",items:[{fieldLabel:c.htcConfig.locData.LabelsCustomLabelHint,itemId:"label-value",allowBlank:false,xtype:"textfield",enableKeyEvents:true,anchor:"100%",value:l,listeners:{change:function(p,r,e){var q=o.getComponent("label-view");
q.setText(n(r),false)
},keyup:function(p,e){var s=p.getValue();
if(e&&e.keyCode==13){if(!Ext.isEmpty(s)&&s.trim().length>0){var q=o.getComponent("label-value").getValue();
if(!Ext.isEmpty(q)&&q.trim().length>0){c.getMenuActions().setLabel(q,"#"+i,o)
}}}else{var r=o.getComponent("label-view");
r.setText(n(s),false)
}}}},{itemId:"label-view",xtype:"label",width:240,html:n(l)}],buttonAlign:"center",buttons:[{text:c.htcConfig.locData.CommonButtonCaptionOK,handler:function(e){var p=o.getComponent("label-value").getValue();
if(!Ext.isEmpty(p)&&p.trim().length>0){c.getMenuActions().setLabel(p,"#"+i,o)
}else{o.getComponent("label-value").setValue("")
}}},{text:c.htcConfig.locData.CommonButtonCaptionCancel,handler:function(e){o.hide()
}}],listeners:{show:function(p){var e=p.getComponent("label-value");
if(e&&e.rendered){var q=e.getValue();
if(!Ext.isEmpty(q)&&q.trim().length>0){setTimeout(function(){try{e.selectText()
}catch(r){}try{e.focus()
}catch(r){}},50);
return
}e.focus(true,50)
}}}});
try{var m=f.el.child(".x-color-palette-sel",false);
if(m){m.removeClass("x-color-palette-sel")
}}catch(k){if(!!window.console&&!!window.console.log){window.console.log(k)
}}o.show()
}}}});
var b=new Ext.menu.Menu({items:a,listeners:{itemclick:function(e){switch(e.itemId){case"no-label":c.getMenuActions().setLabel();
break;
case"custom-label":break;
default:if(!Ext.isEmpty(e.nameLabel)&&!Ext.isEmpty(e.colorLabel)){c.getMenuActions().setLabel(e.nameLabel,e.colorLabel)
}break
}}}});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.MoreSubMenu=function(a){var b=new Ext.menu.Menu({items:[{itemId:"web-folders",text:a.htcConfig.locData.CommandWebFoldersLinks,icon:HttpCommander.Lib.Utils.getIconPath(a,"webfolders")},{itemId:"sync-web-folders",text:a.htcConfig.locData.CommandSyncWebFolders,icon:HttpCommander.Lib.Utils.getIconPath(a,"syncwebfolders")},{itemId:"versioning",text:a.htcConfig.locData.CommandVersioning,icon:HttpCommander.Lib.Utils.getIconPath(a,"versioning"),handler:function(c,d){return false
},menu:a.versioningSubMenu}],listeners:{beforeshow:function(c){b.onBeforeShowMoreMenu(c,a.getSelTypeFilesModel(a.getGrid()))
},itemclick:function(c){switch(c.itemId){case"web-folders":a.getMenuActions().webFolders(a.prepareAndShowlinksToWebFoldersWindow);
break;
case"sync-web-folders":a.getMenuActions().syncWebFolders(a.initAndShowSyncWebFoldersHelpWindow);
break
}}},onBeforeShowMoreMenu:function(e,g){var m=a.getCurrentFolder();
if(a.isRecentFolder(m)||a.isTrashFolder(m)||a.isAlertsFolder(m)){return false
}var h=g.selModel;
var o=h.getSelected();
var f=o?o.data:{};
var n=g.selType;
var d=g.selFiles;
if(n=="trashroot"){return false
}var i=a.htcConfig.enableWebFoldersLinks&&a.htcConfig.hcAuthMode!="shibboleth";
var l=i&&a.htcConfig.showSyncWithLocalFolderInfo;
var k=a.htcConfig.enableVersionControl&&n=="file"&&d==1;
var c=i||l||k;
e.getComponent("web-folders").setVisible(i);
e.getComponent("web-folders").setDisabled(!i);
e.getComponent("sync-web-folders").setVisible(l);
e.getComponent("sync-web-folders").setDisabled(!l);
e.getComponent("versioning").setVisible(k);
e.getComponent("versioning").setDisabled(!k);
return c
}});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.FileMenu=function(b){var a=function(d){var e=b.getCurrentFolder();
b.clipboard.setItems(b.createSelectedSet(b.getGrid(),e));
b.clipboard.srcPath=e;
b.clipboard.isCut=d;
b.toggleToolbarButtons()
};
var c=new Ext.menu.Menu({items:[{itemId:"view-and-edit",text:b.htcConfig.locData.CommandSubMenuViewAndEdit,icon:HttpCommander.Lib.Utils.getIconPath(b,"viewwith"),handler:function(d,f){return false
},menu:b.viewEditSubMenu},{itemId:"share",text:b.htcConfig.locData.CommandSubMenuShare,icon:HttpCommander.Lib.Utils.getIconPath(b,"share"),handler:function(d,f){return false
},menu:b.shareSubMenu},{itemId:"cloud-storages",text:b.htcConfig.locData.CommandClouds,icon:HttpCommander.Lib.Utils.getIconPath(b,"clouds"),handler:function(d,f){return false
},menu:b.cloudsSubMenu},{itemId:"download",text:b.htcConfig.locData.CommandDownload,icon:HttpCommander.Lib.Utils.getIconPath(b,"download")},{itemId:"new",text:b.htcConfig.locData.CommandNew,icon:HttpCommander.Lib.Utils.getIconPath(b,"new"),handler:function(d,f){return false
},menu:b.newSubMenu},{itemId:"rename",text:b.htcConfig.locData.CommandRename,icon:HttpCommander.Lib.Utils.getIconPath(b,"rename")},{itemId:"empty",hidden:true,text:b.htcConfig.locData.TrashEmptyTrashLabel,icon:HttpCommander.Lib.Utils.getIconPath(b,"emptytrash")},{itemId:"delete",hidden:true,text:b.htcConfig.locData.CommandDelete,icon:HttpCommander.Lib.Utils.getIconPath(b,"delete")},{itemId:"sep-trash",hidden:true,xtype:"menuseparator"},{itemId:"restore-all",hidden:true,text:b.htcConfig.locData.TrashRestoreAllLabel,icon:HttpCommander.Lib.Utils.getIconPath(b,"restoreall")},{itemId:"restore",hidden:true,text:b.htcConfig.locData.TrashRestoreSelectedLabel,icon:HttpCommander.Lib.Utils.getIconPath(b,"restore")},{itemId:"copy",hidden:b.htcConfig.copyMoveToMode>1,text:b.htcConfig.locData.CommandCopy+(b.htcConfig.copyMoveToMode==1?(" ("+b.htcConfig.locData.CommandCopyCutClipboardSuffix+")"):""),icon:HttpCommander.Lib.Utils.getIconPath(b,"copy")},{itemId:"copy-to",hidden:b.htcConfig.copyMoveToMode!=0&&b.htcConfig.copyMoveToMode!=3,text:b.htcConfig.locData.CommandCopyTo,icon:HttpCommander.Lib.Utils.getIconPath(b,"copy")},{itemId:"copy-menu",hidden:b.htcConfig.copyMoveToMode!=2,text:b.htcConfig.locData.CommandCopy,icon:HttpCommander.Lib.Utils.getIconPath(b,"copy"),handler:function(d,f){a(false);
return false
},menu:b.copyMenu},{itemId:"cut",hidden:b.htcConfig.copyMoveToMode>1,text:b.htcConfig.locData.CommandCut+(b.htcConfig.copyMoveToMode==1?(" ("+b.htcConfig.locData.CommandCopyCutClipboardSuffix+")"):""),icon:HttpCommander.Lib.Utils.getIconPath(b,"cut")},{itemId:"move-to",hidden:b.htcConfig.copyMoveToMode!=1&&b.htcConfig.copyMoveToMode!=3,text:b.htcConfig.locData.CommandMoveTo,icon:HttpCommander.Lib.Utils.getIconPath(b,"cut")},{itemId:"move-menu",hidden:b.htcConfig.copyMoveToMode!=2,text:b.htcConfig.locData.CommandCut,icon:HttpCommander.Lib.Utils.getIconPath(b,"cut"),handler:function(d,f){a(true);
return false
},menu:b.moveMenu},{itemId:"paste",cls:"x-badge-container",text:b.htcConfig.locData.CommandPaste,icon:HttpCommander.Lib.Utils.getIconPath(b,"paste")},{itemId:"paste-into",cls:"x-badge-container",text:b.htcConfig.locData.CommandPasteInto+" ",icon:HttpCommander.Lib.Utils.getIconPath(b,"paste")},{itemId:"zip",text:b.htcConfig.locData.CommandZip,icon:HttpCommander.Lib.Utils.getIconPath(b,"zip")},{itemId:"zip-content",text:b.htcConfig.locData.CommandZipContents,icon:HttpCommander.Lib.Utils.getIconPath(b,"unzip")},{itemId:"unzip",text:b.htcConfig.locData.CommandUnzip,icon:HttpCommander.Lib.Utils.getIconPath(b,"unzip"),handler:function(d,f){return false
},menu:b.unzipSubMenu},{itemId:"zip-download",text:b.htcConfig.locData.CommandZipDownload,icon:HttpCommander.Lib.Utils.getIconPath(b,"zipdownload")},{itemId:"label",text:b.htcConfig.locData.LabelsTitle,icon:HttpCommander.Lib.Utils.getIconPath(b,"label"),handler:function(d,f){return false
},menu:b.labelsMenu},{itemId:"metadata",text:b.htcConfig.locData.CommandDetails,icon:HttpCommander.Lib.Utils.getIconPath(b,"details")},{itemId:"watchForModifs",text:b.htcConfig.locData.WatchForModifsCommand+"...",icon:HttpCommander.Lib.Utils.getIconPath(b,"watch"),handler:function(d,f){return false
},menu:b.watchSubMenu},{itemId:"stop-watch",hidden:true,text:b.htcConfig.locData.WatchForModifsStopCommand,icon:HttpCommander.Lib.Utils.getIconPath(b,"stopwatch")},{itemId:"edit-watch",hidden:true,text:b.htcConfig.locData.WatchForModifsEditCommand,icon:HttpCommander.Lib.Utils.getIconPath(b,"edit")},{itemId:"view-watch",hidden:true,text:b.htcConfig.locData.WatchForModifsViewChangesCommand,icon:HttpCommander.Lib.Utils.getIconPath(b,"view")},{itemId:"more",text:b.htcConfig.locData.CommandSubMenuMore,icon:HttpCommander.Lib.Utils.getIconPath(b,"more"),handler:function(d,f){return false
},menu:b.moreSubMenu},"-",{itemId:"select-all",text:b.htcConfig.locData.CommandSelectAll,icon:HttpCommander.Lib.Utils.getIconPath(b,"selectall")},{itemId:"invert",text:b.htcConfig.locData.CommandInvertSelection,icon:HttpCommander.Lib.Utils.getIconPath(b,"invert")}],listeners:{beforeshow:function(ak){if(b.isSharedForYouTreeFolder()){return false
}var ao=b.getCurrentFolder();
var I=b.isTrashFolder(ao);
var R=b.getSelTypeFilesModel(b.getGrid());
var ad=R.selModel;
var ar=(I?b.getGrid().getStore().getCount():b.getGrid().getStore().getTotalCount())-(b.htcConfig.showUpLink?1:0);
var A=ad.getSelected();
var ae=A?A.data:{};
var T=R.selType;
var s=R.selFiles;
var o=R.selFolders;
var aj=T=="none"?"":HttpCommander.Lib.Utils.getFileExtension(ae.name);
var U=";"+aj+";";
var Y=b.viewEditSubMenu&&b.viewEditSubMenu.onBeforeShowViewEditMenu(b.viewEditSubMenu,R);
var D=b.shareSubMenu&&b.shareSubMenu.onBeforeShowShareMenu(b.shareSubMenu,R);
var t=b.watchSubMenu&&b.watchSubMenu.onBeforeShowWatchMenu(b.watchSubMenu,R);
var F=b.moreSubMenu&&b.moreSubMenu.onBeforeShowMoreMenu(b.moreSubMenu,R);
var l=b.htcConfig.enabledLabels&&b.htcConfig.currentPerms&&b.htcConfig.currentPerms.modify;
var ah=T!="empty"&&T!="none";
var K=b.htcConfig.currentPerms&&b.htcConfig.currentPerms.create;
var x=T!="empty";
var q=b.htcConfig.currentPerms&&b.htcConfig.currentPerms.rename;
var am=T=="file"||T=="folder";
var at=b.isRecentFolder(ao);
var C=at||I||(b.htcConfig.currentPerms&&b.htcConfig.currentPerms.del);
var i=T!="empty"&&T!="none";
var z=b.htcConfig.enableTrash&&I;
var n=z&&T!="empty"&&T!="none";
var O=b.htcConfig.currentPerms&&b.htcConfig.currentPerms.copy;
var X=b.htcConfig.currentPerms&&b.htcConfig.currentPerms.cut;
var m=T!="empty"&&T!="none";
var af=O&&b.htcConfig.copyMoveToMode<2;
var J=m;
var ag=X&&b.htcConfig.copyMoveToMode<2;
var N=m;
var h=O&&(b.htcConfig.copyMoveToMode==1||b.htcConfig.copyMoveToMode==3);
var ac=m;
var L=X&&(b.htcConfig.copyMoveToMode==1||b.htcConfig.copyMoveToMode==3);
var y=m;
var r=O&&b.htcConfig.copyMoveToMode==2;
var an=m;
var Z=X&&b.htcConfig.copyMoveToMode==2;
var E=m;
var W=b.htcConfig.currentPerms&&(b.htcConfig.currentPerms.cut||b.htcConfig.currentPerms.copy)&&T=="folder"&&b.clipboard.enabled&&b.htcConfig.currentPerms.create;
var ap=T=="folder"?b.htcConfig.locData.CommandPasteInto+" '"+ad.getSelected().data.name+"'":b.htcConfig.locData.CommandPasteInto+" ";
var w=b.htcConfig.currentPerms&&(b.htcConfig.currentPerms.cut||b.htcConfig.currentPerms.copy)&&b.htcConfig.currentPerms.create;
var f=T!="empty"&&b.clipboard.enabled;
var p=b.htcConfig.currentPerms&&b.htcConfig.currentPerms.zip&&b.isExtensionAllowed(".ZIP",true);
var al=T!="empty"&&T!="none";
var v=b.htcConfig.currentPerms&&b.htcConfig.currentPerms.unzip&&T=="file"&&ad.getSelected().data.name.toLowerCase().indexOf(".zip")!=-1;
var e=true;
var H=b.htcConfig.currentPerms&&b.htcConfig.currentPerms.download;
var u=T!="empty"&&T!="none";
var V=T=="file"?b.htcConfig.locData.CommandDownload:b.htcConfig.locData.CommandDownload+"...";
var aa=b.htcConfig.currentPerms&&b.htcConfig.currentPerms.zipDownload&&(T=="set"||T=="folder");
var G=T!="empty"&&T!="none";
var ai=b.htcConfig.currentPerms&&b.htcConfig.currentPerms.download&&(s>0||o>0);
var Q=b.htcConfig.currentPerms&&b.htcConfig.currentPerms.upload;
var ab=b.htcConfig.enableDownloadToSkyDrive&&b.htcConfig.isAllowedSkyDrive;
var P=(b.htcConfig.enableDownloadToDropbox&&(s>0||o>0));
var d=b.htcConfig.enableUploadFromSkyDrive&&b.htcConfig.isAllowedSkyDrive;
var aq=b.htcConfig.enableDownloadToBox&&b.htcConfig.isAllowedBox;
var g=b.htcConfig.isAllowedBox&&b.htcConfig.enableUploadFromBox;
var B=((ai&&((b.htcConfig.enableDownloadToGoogle&&b.htcConfig.isAllowedGoogleDrive)||P||ab||aq))||(Q&&((b.htcConfig.enableUploadFromGoogle&&b.htcConfig.isAllowedGoogleDrive)||(b.htcConfig.enableUploadFromDropbox&&b.htcConfig.isAllowedDropbox)||d||g)));
var k=b.htcConfig.currentPerms&&ad.getCount()==1;
var S=b.isAlertsFolder(ao);
var M=S&&(T=="file"||T=="folder");
c.getComponent("view-and-edit").setVisible(Y);
c.getComponent("view-and-edit").setDisabled(!Y);
c.getComponent("share").setVisible(D);
c.getComponent("share").setDisabled(!D);
c.getComponent("more").setVisible(F);
c.getComponent("more").setDisabled(!F);
c.getComponent("new").setVisible(K);
c.getComponent("new").setDisabled(!K||!x);
c.getComponent("cloud-storages").setVisible(B);
c.getComponent("cloud-storages").setDisabled(!B);
c.getComponent("rename").setVisible(q&&am);
c.getComponent("rename").setDisabled(!q||!am);
c.getComponent("delete").setVisible(C&&(I||i));
c.getComponent("delete").setDisabled(!C||!i);
c.getComponent("copy").setVisible(af&&J);
c.getComponent("copy").setDisabled(!af||!J);
c.getComponent("cut").setVisible(ag&&N);
c.getComponent("cut").setDisabled(!ag||!N);
c.getComponent("copy-to").setVisible(h&&ac);
c.getComponent("copy-to").setDisabled(!h||!ac);
c.getComponent("move-to").setVisible(L&&y);
c.getComponent("move-to").setDisabled(!L||!y);
c.getComponent("copy-menu").setVisible(r&&an);
c.getComponent("copy-menu").setDisabled(!r||!an);
c.getComponent("move-menu").setVisible(Z&&E);
c.getComponent("move-menu").setDisabled(!Z||!E);
c.getComponent("paste").setVisible(w&&f);
c.getComponent("paste").setDisabled(!w||!f);
c.getComponent("paste-into").setVisible(W);
c.getComponent("paste-into").setDisabled(!W);
c.getComponent("paste-into").setText(ap,true);
c.getComponent("zip").setVisible(p&&al);
c.getComponent("zip").setDisabled(!p||!al);
c.getComponent("zip-content").setVisible(v&&e);
c.getComponent("zip-content").setDisabled(!v||!e);
c.getComponent("unzip").setVisible(v&&e);
c.getComponent("unzip").setDisabled(!v||!e);
c.getComponent("download").setVisible(H&&u);
c.getComponent("download").setDisabled(!H||!u);
c.getComponent("download").setText(V,true);
c.getComponent("zip-download").setVisible(aa&&G);
c.getComponent("zip-download").setDisabled(!aa||!G);
c.getComponent("label").setVisible(l&&ah);
c.getComponent("label").setDisabled(!l||!ah);
c.getComponent("metadata").setVisible(k);
c.getComponent("metadata").setDisabled(!k);
c.getComponent("watchForModifs").setVisible(t);
c.getComponent("watchForModifs").setDisabled(!t);
c.getComponent("empty").setVisible(z||T=="trashroot");
c.getComponent("empty").setDisabled(!(z||T=="trashroot"));
c.getComponent("restore-all").setVisible(z);
c.getComponent("restore-all").setDisabled(!z||ar<=0);
c.getComponent("restore").setVisible(z);
c.getComponent("restore").setDisabled(!n);
c.getComponent("sep-trash").setVisible(z);
c.getComponent("stop-watch").setVisible(S);
c.getComponent("stop-watch").setDisabled(!M);
c.getComponent("edit-watch").setVisible(S&&b.htcConfig.watchSend);
c.getComponent("edit-watch").setDisabled(!b.htcConfig.watchSend||!M);
c.getComponent("view-watch").setVisible(S);
c.getComponent("view-watch").setDisabled(!M)
},itemclick:function(f){switch(f.itemId){case"select-all":b.getMenuActions().selectAll(b.getGrid());
break;
case"invert":b.getMenuActions().invertSelection(b.getGrid());
break;
case"empty":b.getMenuActions().deleteSelectedItems(true);
break;
case"restore":b.getMenuActions().restoreTrashedItems();
break;
case"restore-all":b.getMenuActions().restoreTrashedItems(true);
break;
case"delete":b.getMenuActions().deleteSelectedItems();
break;
case"zip":b.getMenuActions().zip();
break;
case"zip-content":b.getMenuActions().zipContent(b.initZipContent);
break;
case"zip-download":b.getMenuActions().zipDownload();
break;
case"download":b.getMenuActions().downloadSelectedItems();
break;
case"rename":b.getMenuActions().renameSelectedItem();
break;
case"copy-to":case"move-to":var g=f.itemId.substring(0,4);
var d=(g=="move");
var e=b.getCurrentFolder();
a(d);
b.initAndShowSelectFolder(e,g);
break;
case"copy":case"cut":a(f.itemId=="cut");
break;
case"paste":case"paste-into":b.getMenuActions().paste(f.itemId=="paste-into",b.clipboard);
break;
case"metadata":b.getMenuActions().viewChangeDetails(b.initMetadata);
break;
case"stop-watch":b.getMenuActions().stopWatch();
break;
case"edit-watch":b.getMenuActions().editWatch();
break;
case"view-watch":b.getMenuActions().viewWatch();
break
}}}});
return c
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.AnonymContextMenu=function(a){var b=new Ext.menu.Menu({items:[{itemId:"copy-link",text:a.htcConfig.locData.CommandCopyLinkToClipboard,icon:HttpCommander.Lib.Utils.getIconPath(a,"copy")},{itemId:"edit",hidden:true,text:a.htcConfig.locData.CommandMenuEdit,icon:HttpCommander.Lib.Utils.getIconPath(a,"edit")},{itemId:"delete",hidden:true,text:a.htcConfig.locData.CommandDelete,icon:HttpCommander.Lib.Utils.getIconPath(a,"delete")},"-",{itemId:"select-all",text:a.htcConfig.locData.CommandSelectAll,icon:HttpCommander.Lib.Utils.getIconPath(a,"selectall")},{itemId:"invert",text:a.htcConfig.locData.CommandInvertSelection,icon:HttpCommander.Lib.Utils.getIconPath(a,"invert")}],listeners:{beforeshow:function(c){var t=a.getSharedGrid();
if(!t){return false
}var e=a.getSelTypeFilesModel(t),p=e.selModel,s=t.getStore().getTotalCount(),h=p.getSelected(),i=h?h.data:{},m=e.selType,q=e.selFiles,k=e.selFolders,f=(m=="none"?"":HttpCommander.Lib.Utils.getFileExtension(i.name)),l=";"+f+";",u=(m!="empty"&&m!="none"),n=b.getComponent("edit"),d=b.getComponent("delete"),g=b.getComponent("copy-link"),o=HttpCommander.Lib.Utils.browserIs.copyToClipboard,r=o&&(m=="file"||m=="folder");
if(r){r=!Ext.isEmpty(h.get("shortUrl2")||h.get("shortUrl")||h.get("url2")||h.get("url"))
}n.setVisible(true);
n.setDisabled(!u);
d.setVisible(true);
d.setDisabled(!u);
g.setVisible(o);
g.setDisabled(!r)
},itemclick:function(d){var e=a.getSharedGrid();
if(!e){return
}switch(d.itemId){case"copy-link":var g,f=e.getSelectionModel().getSelected();
if(!!f){g=f.get("shortUrl2")||f.get("shortUrl")||f.get("url2")||f.get("url");
var c=HttpCommander.Lib.Utils.copyTextToClipboard(g);
if(c===true){a.showBalloon(a.htcConfig.locData.BalloonCopiedToClipboard)
}else{a.Msg.show({title:a.htcConfig.locData.BalloonCopyToClipboardFailed,msg:Ext.util.Format.htmlEncode(!Ext.isBoolean(c)&&!!c?c.toString():a.htcConfig.locData.BalloonCopyToClipboardFailed),icon:a.Msg.ERROR,buttons:a.Msg.OK})
}}break;
case"select-all":a.getMenuActions().selectAll(e);
break;
case"invert":a.getMenuActions().invertSelection(e);
break;
case"edit":if(Ext.isFunction(e.openEditPublicLink)){e.openEditPublicLink(e)
}break;
case"delete":a.getMenuActions().deleteSelectedAnonymLinks(e);
break
}}}});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.FlashViewerWindow=function(b){var c="<OBJECT id='{0}_FlashViewer' type='application/x-shockwave-flash' codeBase='http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab' data='{1}Handlers/Download.ashx?action=view&file={2}&rid={3}' width='{4}' height='{5}' classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' VIEWASTEXT><PARAM NAME='BGColor' VALUE='#DFE8F6'><PARAM NAME='Movie' VALUE='{1}Handlers/Download.ashx?action=view&file={2}&rid={3}'><PARAM NAME='Src' VALUE='{1}Handlers/Download.ashx?action=view&file={2}&rid={3}'><PARAM NAME='WMode' VALUE='transparent'><PARAM NAME='Quality' VALUE='high'><embed wmode='transparent' bgcolor='#DFE8F6' id='{0}_FlashViewer' name='{0}_FlashViewer' src='{1}Handlers/Download.ashx?action=view&file={2}&rid={3}' quality='high' pluginspage='http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash' type='application/x-shockwave-flash' width='{4}' height='{5}'></embed></OBJECT>";
var a=new b.Window({modal:true,maximizable:true,closeAction:"hide",layout:"fit",minHeight:50,minWidth:50,plain:true,title:"",listeners:{hide:function(d){d.restore();
HttpCommander.Lib.Utils.removeElementFromDOM(b.$("FlashViewer"));
d.update("")
}},showFlash:function(i,e,d,g){d=d<0?400:d;
g=g<0?200:g;
a.removeListener("resize",a.resizeFlashObject,a);
a.hide();
a.setTitle(Ext.util.Format.htmlEncode(e));
var f=HttpCommander.Lib.Utils.flashPlayerIsSupported()?String.format(c,b.getUid(),b.getAppRootUrl(),encodeURIComponent(i+"/"+e),(new Date()).getTime(),d,g):HttpCommander.Lib.Consts.needInstallAdobeFlashPlayerMessage;
if(a.rendered){a.update(f);
a.setWidth(d+a.getWidth()-a.body.getWidth(true));
a.setHeight(g+a.getHeight()-a.body.getHeight(true))
}else{a.html=f
}a.show();
a.addListener("resize",a.resizeFlashObject,a);
a.center()
},resizeFlashObject:function(){var d=document[b.$("FlashViewer")];
if(!d){d=document.getElementById(b.$("FlashViewer"))
}if(d){d.width=a.body.getWidth(true);
d.height=a.body.getHeight(true)
}},getFlashSize:function(f,d){a.hide();
var e={path:"",name:""};
e.path=String(f);
e.name=String(d);
if(e.path==""||e.name==""){return
}b.globalLoadMask.msg=b.htcConfig.locData.GettingSizeFlashMovie+"...";
b.globalLoadMask.show();
HttpCommander.Common.GetSWFSize(e,function(m,k){b.globalLoadMask.hide();
b.globalLoadMask.msg=b.htcConfig.locData.ProgressLoading+"...";
var g=0,l=0,i=null;
if(typeof m=="undefined"){i=Ext.util.Format.htmlEncode(k.message)
}else{if(!m.success){i=m.message||m.msg
}else{g=m.width;
l=m.height
}}if(l>0&&g>0){a.showFlash(f,d,g,l);
b.openTreeRecent()
}else{i="Wrong SWF size"
}if(i){b.Msg.alert(b.htcConfig.locData.CommonErrorCaption,i)
}})
}});
return a
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.FileSearchWindow=function(f){var o,p,n,e,l=false;
searchBtnPressed=false,curPage=0,lastForward=true;
var a=new Ext.data.DirectStore({autoLoad:false,remoteSort:false,baseParams:{namePattern:"*",detailsPattern:null,contentPattern:null,path:"root",startTopFolder:null,startFilePath:null,searchDirection:"forward",dateFrom:null,dateTo:null,searchType:0,skip:0,fwws:true},directFn:HttpCommander.Grid.Search,paramOrder:["namePattern","detailsPattern","contentPattern","path","startTopFolder","startFilePath","searchDirection","dateFrom","dateTo","searchType","skip","fwws"],totalProperty:"total",firstFilePath:null,lastFilePath:null,firstTopFolder:null,lastTopFolder:null,maxFileNumber:f.htcConfig.maxSearchResults,root:"data",defaultRequestTimeout:Ext.Ajax.timeout,fields:[{name:"name",type:"string"},{name:"path",type:"string"},{name:"icon",type:"string"},{name:"topFolder",type:"string"},{name:"isFolder",type:"boolean"}]});
var i,h="100% -";
switch(f.htcConfig.searchCriterions.total){case 0:h+="95";
break;
case 1:h+=f.htcConfig.searchCriterions.date?"122":"118";
break;
case 2:h+=f.htcConfig.searchCriterions.date?"145":"141";
break;
case 3:h+="168";
break;
default:h="100%"
}function g(r,s,w){try{r=r||i;
var q=r.getStore().getAt(s);
var v=q.data.path;
var t={name:"",path:""};
t.name=q.data.name;
t.path=q.data.path;
f.setSelectPath(t);
f.openGridFolder(v,true);
b.hide()
}catch(u){f.ProcessScriptError(u)
}}var d=new Ext.data.ArrayStore({fields:["index","label"],data:[[0,f.htcConfig.locData.SearchOnlyFiles],[1,f.htcConfig.locData.SearchOnlyFolders],[2,f.htcConfig.locData.SearchBothFilesFolders]]});
var m=function(q,x,v){var t=c.getComponent("fileName").getComponent("name_search_pattern").getValue();
if(Ext.isEmpty(t)||t.trim().length==0){t="*"
}a.setBaseParam("namePattern",t);
a.setBaseParam("detailsPattern",x);
var w=c.getComponent("content_search_pattern");
var r=f.htcConfig.searchCriterions.content&&!w.disabled?w.getValue():null;
a.setBaseParam("contentPattern",r);
var s=null,y=null;
if(f.htcConfig.searchCriterions.date){s=c.getComponent("dateRange").getComponent("column1").getComponent("date_search_pattern_field_from").getValue();
s=HttpCommander.Lib.Utils.getDateUTCString(s);
y=c.getComponent("dateRange").getComponent("column2").getComponent("date_search_pattern_field_to").getValue();
if(Ext.isDate(y)){y=y.clearTime().add(Date.DAY,1).add(Date.SECOND,-1)
}y=HttpCommander.Lib.Utils.getDateUTCString(y)
}a.setBaseParam("dateFrom",s);
a.setBaseParam("dateTo",y);
var u=c.getComponent("searchType").getValue();
a.setBaseParam("searchType",u);
a.setBaseParam("path",v);
a.setBaseParam("startTopFolder",null);
a.setBaseParam("startFilePath",null);
a.setBaseParam("searchDirection","forward");
a.setBaseParam("fwws",true);
a.firstFilePath=null;
a.lastFilePath=null;
a.firstTopFolder=null;
a.lastTopFolder=null;
searchBtnPressed=true;
curPage=0;
lastForward=true;
a.setBaseParam("skip",0);
a.reload()
};
var k=function(){var u=c.getForm();
if(!u.isValid()){return
}var q=f.htcConfig.searchCriterions.details?c.getComponent("details_search_pattern").getValue():null;
var t=c.getComponent("searchScope").getValue();
var s=f.getRootName();
if(t.getGroupValue()!="entire"){var r=f.getCurrentFolder();
if(!Ext.isEmpty(r)&&!f.isRootFolder(r)){if(f.isSpecialTreeFolderOrSubFolder(r)){f.Msg.show({title:f.htcConfig.locData.CommonConfirmCaption,msg:Ext.util.Format.htmlEncode(f.htcConfig.locData.SearchInSpecialFolderWarning),buttons:f.Msg.OKCANCEL,icon:f.Msg.WARNING,fn:function(v){if(v=="ok"){m(u,q,s)
}}});
return
}else{s=r
}}}if(f.htcConfig.bothSearchMethods&&!Ext.isEmpty(q)){f.Msg.show({title:f.htcConfig.locData.CommonConfirmCaption,msg:Ext.util.Format.htmlEncode(f.htcConfig.locData.SearchByDetailsWarning),buttons:f.Msg.OKCANCEL,icon:f.Msg.WARNING,fn:function(v){if(v=="ok"){m(u,q,s)
}}});
return
}m(u,q,s)
};
var c=new Ext.form.FormPanel({baseCls:"x-plain",labelWidth:75,items:[{xtype:"container",layout:"hbox",anchor:"100%",itemId:"fileName",fieldLabel:f.htcConfig.locData.CommonFileNameCaption,items:[{xtype:"textfield",itemId:"name_search_pattern",hideLabel:true,flex:1},{xtype:"button",text:f.htcConfig.locData.SearchSearch,handler:k}]},{xtype:"combo",lazyInit:false,fieldLabel:f.htcConfig.locData.SearchType,anchor:"100%",itemId:"searchType",store:d,mode:"local",displayField:"label",tpl:'<tpl for="."><div class="x-combo-list-item">{label:htmlEncode}</div></tpl>',valueField:"index",editable:false,autoSelect:false,triggerAction:"all",allowBlank:false,value:0,listeners:{select:function(s,q,r){c.getComponent("content_search_pattern").setDisabled(s.getValue()>0)
}}},{xtype:"textfield",fieldLabel:f.htcConfig.locData.SearchFileDetails,itemId:"details_search_pattern",hidden:!f.htcConfig.searchCriterions.details,hideLabel:!f.htcConfig.searchCriterions.details,anchor:"100%"},{xtype:"textfield",fieldLabel:f.htcConfig.locData.SearchFileContent,itemId:"content_search_pattern",hidden:!f.htcConfig.searchCriterions.content,hideLabel:!f.htcConfig.searchCriterions.content,anchor:"100%"},{xtype:"container",layout:"column",anchor:"100%",hidden:!f.htcConfig.searchCriterions.date,hideLabel:!f.htcConfig.searchCriterions.date,fieldLabel:f.htcConfig.locData.CommonFieldLabelDate,itemId:"dateRange",defaults:{xtype:"container",layout:"form",labelWidth:30},items:[{columnWidth:0.52,itemId:"column1",items:[{anchor:"95%",fieldLabel:f.htcConfig.locData.SearchByDateFrom,xtype:"datefield",format:f.htcConfig.USADateFormat?"m/d/Y":"d/m/Y",itemId:"date_search_pattern_field_from"}]},{columnWidth:0.48,itemId:"column2",items:[{anchor:"100%",fieldLabel:f.htcConfig.locData.SearchByDateTo,xtype:"datefield",format:f.htcConfig.USADateFormat?"m/d/Y":"d/m/Y",itemId:"date_search_pattern_field_to"}]}]},{xtype:"radiogroup",itemId:"searchScope",fieldLabel:f.htcConfig.locData.SearchLocation,items:[{dataIndex:"entrie",boxLabel:f.htcConfig.locData.SearchLocationEntire,name:"rb-auto",inputValue:"entire"},{dataIndex:"current",boxLabel:f.htcConfig.locData.SearchLocationCurrent,name:"rb-auto",inputValue:"current",checked:true}]},i=new Ext.grid.GridPanel({showHeader:false,hideLabel:true,flex:1,style:{borderBottomWidth:"1px",borderTopWidth:"1px"},anchor:h,store:a,columns:[{header:f.htcConfig.locData.CommonFieldLabelName,id:"name",width:200,sortable:true,dataIndex:"name",renderer:f.getRenderers().searchNameRenderer},{header:f.htcConfig.locData.CommonFieldLabelPath,id:"path",sortable:true,dataIndex:"path",renderer:f.getRenderers().htmlEncodedRenderer}],stripeRows:true,autoExpandColumn:"path",listeners:{rowdblclick:g}})]});
f.getFileManager().searchGridRowAction=g;
var b=new f.Window({title:String.format(f.htcConfig.locData.SearchTitle,"*, ?"),closeAction:"hide",width:400,height:400,minWidth:300,minHeight:250,maximizable:true,layout:"fit",plain:true,collapsible:true,closable:true,bodyStyle:"padding:5px;",items:c,keys:{key:[Ext.EventObject.ENTER,Ext.EventObject.RETURN,Ext.EventObject.ESC],fn:function(q){if(q==Ext.EventObject.ENTER||q==Ext.EventObject.RETURN){k()
}else{if(q==Ext.EventObject.ESC){b.hide()
}}},scope:this},bbar:new Ext.Toolbar({items:[o=new Ext.Button({tooltip:f.htcConfig.locData.PagingToolbarFirstText,overflowText:f.htcConfig.locData.PagingToolbarFirstText,iconCls:"x-tbar-page-first",disabled:true,handler:function(){a.setBaseParam("startTopFolder",null);
a.setBaseParam("startFilePath",null);
a.setBaseParam("searchDirection","forward");
a.setBaseParam("fwws",true);
curPage=0;
lastForward=true;
a.setBaseParam("skip",curPage*a.maxFileNumber);
a.reload()
}}),p=new Ext.Button({tooltip:f.htcConfig.locData.PagingToolbarPrevText,overflowText:f.htcConfig.locData.PagingToolbarPrevText,iconCls:"x-tbar-page-prev",disabled:true,handler:function(){a.setBaseParam("startTopFolder",a.firstTopFolder);
a.setBaseParam("startFilePath",a.firstFilePath);
a.setBaseParam("searchDirection","backwards");
a.setBaseParam("fwws",lastForward);
if(lastForward){curPage--
}else{curPage++
}if(curPage<0){curPage=0
}a.setBaseParam("skip",curPage*a.maxFileNumber);
a.reload()
}}),n=new Ext.Button({tooltip:f.htcConfig.locData.PagingToolbarNextText,overflowText:f.htcConfig.locData.PagingToolbarNextText,iconCls:"x-tbar-page-next",disabled:true,handler:function(){a.setBaseParam("startTopFolder",a.lastTopFolder);
a.setBaseParam("startFilePath",a.lastFilePath);
a.setBaseParam("searchDirection","forward");
a.setBaseParam("fwws",lastForward);
if(lastForward){curPage++
}else{curPage--
}if(curPage<0){curPage=0
}a.setBaseParam("skip",curPage*a.maxFileNumber);
a.reload()
}}),e=new Ext.Button({tooltip:f.htcConfig.locData.PagingToolbarLastText,overflowText:f.htcConfig.locData.PagingToolbarLastText,iconCls:"x-tbar-page-last",disabled:true,handler:function(){a.setBaseParam("startTopFolder",null);
a.setBaseParam("startFilePath",null);
a.setBaseParam("searchDirection","backwards");
a.setBaseParam("fwws",false);
curPage=0;
lastForward=false;
a.setBaseParam("skip",curPage*a.maxFileNumber);
a.reload()
}})]}),listeners:{show:function(q){var r=c.getComponent("fileName");
if(r){r=r.getComponent("name_search_pattern")
}if(r){r.focus(true,700)
}}},initQuickSearch:function(r,q){if(Ext.isEmpty(r)&&(!f.htcConfig.searchCriterions.content||Ext.isEmpty(q))){return
}if(l){Ext.Ajax.abort()
}setTimeout(function(){if(!c){return
}c.getComponent("fileName").getComponent("name_search_pattern").setValue(Ext.isEmpty(r)?null:r);
c.getComponent("details_search_pattern").reset();
c.getComponent("content_search_pattern").setValue(Ext.isEmpty(q)?null:q);
c.getComponent("dateRange").getComponent("column1").getComponent("date_search_pattern_field_from").reset();
c.getComponent("dateRange").getComponent("column2").getComponent("date_search_pattern_field_to").reset();
var t,s=f.getCurrentFolder();
var u=c.getComponent("searchScope").getValue();
if(s&&s!=null&&s!="root"){c.getComponent("searchScope").setValue("current",true)
}else{c.getComponent("searchScope").setValue("entrie",true)
}c.getComponent("searchType").setValue(Ext.isEmpty(r)?0:2);
setTimeout(k,100)
},300)
},loadstart:function(){Ext.Ajax.timeout=HttpCommander.Lib.Consts.ajaxRequestTimeout;
b.body.mask(f.htcConfig.locData.ProgressSearching+"...");
b.setIconClass("loading-indicator");
b.searchWindowDisableAllButtons();
l=true
},loadfailed:function(t,u,w,r,s,q){l=false;
Ext.Ajax.timeout=a.defaultRequestTimeout;
searchBtnPressed=false;
b.searchWindowDisableAllButtons();
a.firstFilePath=null;
a.lastFilePath=null;
a.firstTopFolder=null;
a.lastTopFolder=null;
b.setIconClass("");
b.body.unmask();
if(u==="remote"&&s){var v="Message: "+Ext.util.Format.htmlEncode(Ext.isEmpty?f.htcConfig.locData.UploadFromUrlUnknownResponse:s.message);
if(s.xhr){v="Status: "+Ext.util.Format.htmlEncode(s.xhr.status)+" "+Ext.util.Format.htmlEncode(s.xhr.statusText)+"<br />"+v
}f.Msg.show({title:htcConfig.locData.SearchErrorCaption,closable:true,modal:true,msg:v,icon:f.Msg.ERROR,buttons:f.Msg.CANCEL})
}},loadsucceed:function(y,u,A){l=false;
Ext.Ajax.timeout=y.defaultRequestTimeout;
b.setIconClass("");
b.body.unmask();
b.searchWindowEnableAllButtons();
if(u.length>0){var t=u.length-1;
a.firstFilePath=u[0].data.path+"/"+u[0].data.name+(u[0].data.isFolder?"/":"");
a.lastFilePath=u[t].data.path+"/"+u[t].data.name+(u[t].data.isFolder?"/":"");
a.firstTopFolder=u[0].data.topFolder;
a.lastTopFolder=u[t].data.topFolder;
if(A.params.startFilePath==null&&A.params.startTopFolder==null){if(A.params.searchDirection=="forward"){p.disable()
}else{n.disable()
}}if(u.length<a.maxFileNumber){if(A.params.searchDirection=="forward"){n.disable()
}else{p.disable()
}}}else{a.firstFilePath=null;
a.lastFilePath=null;
a.firstTopFolder=null;
a.lastTopFolder=null;
p.disable();
n.disable()
}var s,w,r,x,z,v=false;
if(y&&y.reader&&y.reader.jsonData){var s=y.reader.jsonData.message;
w=y.reader.jsonData.warning;
r=y.reader.jsonData.query;
if(!Ext.isEmpty(s)){x=f.Msg.ERROR;
z=f.htcConfig.locData.SearchErrorCaption
}}if(searchBtnPressed&&u.length<=0&&Ext.isEmpty(s)){s=f.htcConfig.locData.SearchNothingFound;
x=f.Msg.WARNING;
z=f.htcConfig.locData.CommandSearch
}if(Ext.isEmpty(s)&&searchBtnPressed&&!Ext.isEmpty(w)){s=w;
x=f.Msg.WARNING;
z=f.htcConfig.locData.CommandSearch;
v=true
}if(!Ext.isEmpty(s)){f.Msg.show({title:z,msg:s+(v||Ext.isEmpty(w)?"":("<br /><br />"+w))+(Ext.isEmpty(r)?"":("<br /><br />"+r)),closable:true,modal:true,buttons:f.Msg.CANCEL,icon:x})
}searchBtnPressed=false
},searchWindowDisableAllButtons:function(){o.disable();
p.disable();
n.disable();
e.disable()
},searchWindowEnableAllButtons:function(){o.enable();
p.enable();
n.enable();
e.enable()
}});
a.on("beforeload",b.loadstart,b);
a.on("exception",b.loadfailed,b);
a.on("load",b.loadsucceed,b);
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.ToolbarActions=function(c){var f=function(h,l){var g=h===true;
var k=c.getClipboard();
if(k){var i=c.getCurrentFolder();
k.setItems(c.createSelectedSet(c.getGrid(),i));
k.srcPath=i;
k.isCut=g;
c.toggleToolbarButtons();
if(l===true){c.initAndShowSelectFolder(i,g?"move":"copy")
}}};
var b=function(i,l,g,k,h){return i&&i.create&&l&&l!="empty"
};
var e=function(i,l,g,k,h){return i&&i.unzip&&l=="file"&&g==";zip;"
};
var d=function(i,l,g,k,h,m,n){return i&&i.download&&(k>0||n>0)
};
var a={Logo:{handler:function(){var g=c.getLogoBtn();
if(g.url&&g.url!=""){if(g.showInNewWindow){window.open(g.url)
}else{window.location.href=g.url
}}},allowForShared:true},Folders:{textKey:"CommandFolders",iconName:"folderftp",iconBigName:"24/folderftp",handler:function(){var g=c.getTree();
if(!g||c.getTreeViewValue()=="disabled"){return
}g[this.pressed?"expand":"collapse"]()
},allowForShared:true},View:{textKey:"CommandGridView",iconName:"viewg",menu:true},Favorites:{textKey:"CommandFavorites",iconName:"favorites",menu:true,access:function(){var g=c.getCurrentFolder();
if(c.isSharedForYouTreeFolder(g)){return false
}return !(Ext.isEmpty(g)||g.toLowerCase()=="root"||c.isRecentFolder())&&!c.isTrashFolder(g)&&!c.isAlertsFolder(g)
}},Search:{textKey:"CommandSearch",iconName:"search",handler:function(){c.initAndShowSearch()
},access:function(){var g=c.getCurrentFolder();
return c.htcConfig.searchEnabled&&(!c.isRecentFolder(g)&&!c.isTrashFolder(g)&&!c.isAlertsFolder(g))
}},FileMenu:{textKey:"CommandFile",iconName:"file",menu:true,access:function(){var g=c.getCurrentFolder();
return !c.isRecentFolder(g)||c.isRecentFolder(g,true)
}},Upload:{textKey:"CommandUpload",iconName:"upload",handler:function(){if(!c.htcConfig.currentPerms){return
}if(c.htcConfig.currentPerms.upload){c.initUploaders(true)
}else{c.Msg.alert(c.htcConfig.locData.UploadNotAllowedTitle,c.htcConfig.locData.UploadNotAllowedPrompt)
}},access:function(i,l,g,k,h){return i&&i.upload
}},Administration:{textKey:"CommandAdministration",iconName:"administration",menu:true,right:true,allowForShared:true},Settings:{textKey:"CommandSettings",iconName:"settings",menu:true,right:true,allowForShared:true},Help:{textKey:"CommandHelp",iconName:"help",right:true,handler:function(){c.showHelpWindow()
},allowForShared:true},Logout:{tooltip:{textKey:"CommandLogoutHint",titleKey:"CommandLogout"},iconName:"logout",right:true,handler:function(){if(c.asControl()){if(typeof c.htcConfig.currentUserDomain!="undefined"&&c.htcConfig.currentUserDomain.trim().length>0){c.onLogOut(c.htcConfig.currentUser,c.htcConfig.currentUserDomain)
}else{c.onLogOut(c.htcConfig.currentUser)
}}else{window.location.href=c.htcConfig.relativePath+"Logout.aspx"
}},allowForShared:true},ViewEdit:{textKey:"CommandSubMenuViewAndEdit",iconName:"viewwith",menu:true,access:function(m,o,p,g,l,h,i,n){var k=c.getViewEditSubMenu();
return k&&k.onBeforeShowViewEditMenu(k,n)
}},Share:{textKey:"CommandSubMenuShare",iconName:"share",menu:true,access:function(m,o,p,g,l,i,k,n){var h=c.getShareSubMenu();
return h&&h.onBeforeShowShareMenu(h,n)
}},ViewPublicLinks:{textKey:"AnonymousViewLinksWindowTitle",iconName:"sharefolder",handler:function(){c.initAndShowViewLinksWindow()
},access:function(i,m,g,l,h,n,o,k){return c&&c.htcConfig&&(c.htcConfig.enablePublicLinkToFile||c.htcConfig.enablePublicLinkToFolder)
}},More:{textKey:"CommandSubMenuMore",iconName:"more",menu:true,access:function(l,n,p,g,k,h,i,m){var o=c.getMoreSubMenu();
return o&&o.onBeforeShowMoreMenu(o,m)
}},Clouds:{textKey:"CommandClouds",iconName:"clouds",menu:true,access:function(){var g=c.getCurrentFolder();
return !(Ext.isEmpty(g)||g.toLowerCase()=="root"||c.isRecentFolder(g))&&!c.isTrashFolder(g)
}},Trash:{textKey:"TrashRootTitle",iconName:"trash",menu:true,access:function(m,o,p,g,l,h,i,n){var k=c.getTrashSubMenu();
return k&&k.onBeforeShowTrashMenu(k,n)
}},Download:{textKey:"CommandDownload",iconName:"download",disabled:true,handler:function(){c.getMenuActions().downloadSelectedItems()
},access:function(i,l,g,k,h){return i&&i.download&&l&&l!="empty"&&l!="none"
}},New:{textKey:"CommandNew",iconName:"new",menu:true,access:b},NewFile:{textKey:"CommandNewFile",iconName:"file",disabled:true,iconBigName:"24/newfile",handler:function(){c.getMenuActions().createNewItem("file")
},access:b},NewFolder:{textKey:"CommandNewFolder",iconName:"folder",disabled:true,iconBigName:"24/newfolder",handler:function(){c.getMenuActions().createNewItem("folder")
},access:b},Rename:{textKey:"CommandRename",iconName:"rename",disabled:true,handler:function(){c.getMenuActions().renameSelectedItem()
},access:function(i,l,g,k,h){return i&&i.rename&&(l=="file"||l=="folder")
}},Delete:{textKey:"CommandDelete",iconName:"delete",disabled:true,handler:function(){var g=c.getCurrentFolder(),h;
if(c.isSharedTreeFolder(g)){h=c.getSharedGrid();
if(h){c.getMenuActions().deleteSelectedAnonymLinks(h)
}}else{c.getMenuActions().deleteSelectedItems()
}},access:function(i,m,g,l,h){var k=c.getCurrentFolder();
return(c.isSharedTreeFolder(k)||c.isTrashFolder(k)||c.isRecentFolder(k,true)||(i&&i.del))&&m&&m!="empty"&&m!="none"
},allowForShared:true},Copy:{textKey:"CommandCopy",iconName:"copy",disabled:true,handler:function(){f(false)
},access:function(i,l,g,k,h){return c.htcConfig.copyMoveToMode<3&&i&&i.copy&&l&&l!="empty"&&l!="none"
}},Cut:{textKey:"CommandCut",iconName:"cut",disabled:true,handler:function(){f(true)
},access:function(i,l,g,k,h){return c.htcConfig.copyMoveToMode<3&&i&&i.cut&&l&&l!="empty"&&l!="none"
}},CopyTo:{textKey:"CommandCopyTo",iconName:"copy",disabled:true,handler:function(){f(false,true)
},access:function(i,l,g,k,h){return(c.htcConfig.copyMoveToMode==1||c.htcConfig.copyMoveToMode==3)&&i&&i.copy&&l&&l!="empty"&&l!="none"
}},MoveTo:{textKey:"CommandMoveTo",iconName:"cut",disabled:true,handler:function(){f(true,true)
},access:function(i,l,g,k,h){return(c.htcConfig.copyMoveToMode==1||c.htcConfig.copyMoveToMode==3)&&i&&i.cut&&l&&l!="empty"&&l!="none"
}},Paste:{cls:"x-badge-container",textKey:"CommandPaste",iconName:"paste",disabled:true,handler:function(){c.getMenuActions().paste(false,c.getClipboard())
},access:function(i,l,g,k,h){return i&&(i.cut||i.copy)&&i.create&&l!="empty"&&c.getClipboard()&&c.getClipboard().enabled
}},PasteInto:{cls:"x-badge-container",textKey:"CommandPasteInto",iconName:"paste",disabled:true,handler:function(){c.getMenuActions().paste(true,c.getClipboard())
},access:function(i,l,g,k,h){return i&&(i.cut||i.copy)&&l=="folder"&&c.getClipboard()&&c.getClipboard().enabled&&i.create
}},Label:{textKey:"LabelsTitle",iconName:"label",menu:true,access:function(m,o,p,g,l,h,i,n){var k=c.getLabelsMenu();
return k&&m&&m.modify&&l>0
}},WatchForModifs:{textKey:"WatchForModifsCommand",iconName:"watch",menu:true,access:function(m,o,p,h,l,i,k,n){var g=c.getWatchSubMenu();
return g&&g.onBeforeShowWatchMenu(g,n,true)
}},Details:{textKey:"CommandDetails",iconName:"details",disabled:true,handler:function(){c.getMenuActions().viewChangeDetails(c.initMetadata)
},access:function(i,l,g,k,h){return i&&h==1
}},Select:{textKey:"CommandSelectAll",iconName:"selectall",handler:function(){var g=c.isSharedTreeFolder()?c.getSharedGrid():c.getGrid();
c.getMenuActions().selectAll(g)
},menu:[{text:c.htcConfig.locData.CommandInvertSelection,icon:HttpCommander.Lib.Utils.getIconPath(c,"invert"),handler:function(){var g=c.isSharedTreeFolder()?c.getSharedGrid():c.getGrid();
c.getMenuActions().invertSelection(g)
}}],allowForShared:true},SelectAll:{textKey:"CommandSelectAll",iconName:"selectall",handler:function(){var g=c.isSharedTreeFolder()?c.getSharedGrid():c.getGrid();
c.getMenuActions().selectAll(g)
},allowForShared:true},InvertSelection:{textKey:"CommandInvertSelection",iconName:"invert",handler:function(){var g=c.isSharedTreeFolder()?c.getSharedGrid():c.getGrid();
c.getMenuActions().invertSelection(g)
},allowForShared:true},Refresh:{textKey:"CommandRefresh",iconName:"refresh",handler:function(){c.openGridFolder(c.getCurrentFolder(),true,true)
},allowForShared:true},ViewItem:{textKey:"CommandView",iconName:"view",disabled:true,handler:function(){c.getMenuActions().viewFile()
},access:function(k,n,g,m,h){var i=k&&n=="file"&&k.download;
if(i){var l=g.replace(/^;+|;+$/g,"");
i=HttpCommander.Lib.Consts.forbiddenTypesForViewInBrowser.indexOf(g)<0&&c.htcConfig.mimeTypes.indexOf(l)>=0;
if(i){i=HttpCommander.Lib.Consts.msoSupportedtypes.indexOf(g)<0||HttpCommander.Lib.Consts.msoTypesForViewInBrowser.indexOf(g)!=-1
}if(i&&l=="swf"&&HttpCommander.Lib.Utils.browserIs.ios){i=false
}}return i
}},ImagesPreview:{textKey:"CommandPreview",iconName:"preview",disabled:true,handler:function(){c.getMenuActions().imagesPreview()
},access:function(k,m,h,l,i,n){var g=(n.size||n.size_hidden||0);
return k&&m=="file"&&k.download&&HttpCommander.Lib.Consts.imagesFileTypes.indexOf(h)!=-1&&g>0
}},FlashPreview:{textKey:"CommandFlashPreview",iconName:"flash",disabled:true,handler:function(){c.getMenuActions().flashPreview()
},access:function(k,m,h,l,i,n){var g=(n.size||n.size_hidden||0);
return k&&m=="file"&&k.download&&h==";swf;"&&!HttpCommander.Lib.Utils.browserIs.ios&&g>0
}},MSOEdit:{textKey:"CommandEditInMSOffice",iconName:"mso",disabled:true,handler:function(){c.getMenuActions().editInMsoOoo(true,c.openInMsoNewWay)
},access:function(k,o,g,l,i){var n=c.getMsoEditButtons();
var h=k&&o=="file"&&k.download&&HttpCommander.Lib.Consts.msoSupportedtypes.indexOf(g)!=-1;
var m=h&&k.modify;
if(h){h=!c.htcConfig.anonymousEditingOffice
}if(Ext.isArray(n)){Ext.each(n,function(q,p){if(q&&Ext.isFunction(q.setText)){q.setText(c.htcConfig.locData[(h&&!m)?"CommandViewInMSOffice":"CommandEditInMSOffice"],true)
}})
}return(h||m)
}},OOOEdit:{textKey:"CommandEditInOOo",iconName:"ooo",disabled:true,handler:function(){var g=c.initOfficeEditor();
c.getMenuActions().editInMsoOoo(false,g.OpenFile)
},access:function(k,o,g,l,i){var n=c.getOooEditButtons();
var h=k&&o=="file"&&k.download&&HttpCommander.Lib.Consts.oooSupportedtypes.indexOf(g)!=-1;
var m=h&&k.modify;
if(h){h=!c.htcConfig.anonymousEditingOffice
}if(Ext.isArray(n)){Ext.each(n,function(q,p){if(q&&Ext.isFunction(q.setText)){q.setText(c.htcConfig.locData[(h&&!m)?"CommandViewInOOo":"CommandEditInOOo"],true)
}})
}return(h||m)
}},GoogleView:{textKey:"CommandViewWithGoogleDoc",iconName:"googledoc",disabled:true,handler:function(){c.getMenuActions().viewInService("google")
},access:function(k,m,h,l,i,n){var g=(n.size||n.size_hidden||0);
return k&&m=="file"&&k.download&&HttpCommander.Lib.Consts.googleDocSupportedtypes.indexOf(h)!=-1&&g>0
}},ShareCadView:{textKey:"CommandViewWithShareCad",iconName:"sharecad",disabled:true,handler:function(){c.getMenuActions().viewInService("sharecad")
},access:function(k,m,h,l,i,n){var g=(n.size||n.size_hidden||0);
return k&&m=="file"&&k.download&&c.htcConfig.enableShareCadViewer&&HttpCommander.Lib.Consts.shareCadOrgSupportedTypes.indexOf(h)!=-1&&g>0
}},AutodeskView:{textKey:"CommandViewWithAutodesk",iconName:"autodesk",disabled:true,hidden:!c.supportsWebGlCanvasForAutodesk(),handler:function(){c.getMenuActions().viewInAutodesk()
},access:function(k,m,h,l,i,n){var g=(n.size||n.size_hidden||0);
return k&&m=="file"&&k.download&&c.htcConfig.enableAutodeskViewer&&HttpCommander.Lib.Consts.autodeskViewerFileTypes.indexOf(h)!=-1&&g>0&&c.supportsWebGlCanvasForAutodesk()
}},MSOfficeOnlineEdit:{textKey:"CommandEditInMSOO",iconName:"skydrive",disabled:true,handler:function(){c.getMenuActions().msooEdit()
},access:function(i,m,g,l,h){var n=HttpCommander.Lib.Utils.checkAndGetNewExtensionConvertedFromMSOO(g.replace(/^;+|;+$/g,""));
var k=Ext.isEmpty(n)||c.isExtensionAllowed("file."+k);
return i&&c.htcConfig.enableMSOOEdit&&m=="file"&&i.download&&i.modify&&HttpCommander.Lib.Consts.msooEditorFileTypes.indexOf(g)!=-1&&k
}},Office365Edit:{textKey:"CommandEditInOffice365",iconName:"office365",disabled:true,handler:function(){c.getMenuActions().office365Edit()
},access:function(i,l,g,k,h){return i&&c.htcConfig.enableOffice365Edit&&l=="file"&&i.download&&i.modify&&HttpCommander.Lib.Consts.msooEditorFileTypes.indexOf(g)!=-1&&g!=";txt;"&&HttpCommander.Lib.Consts.msooEditFormatsForConvert.indexOf(g)<0
}},GoogleEdit:{textKey:"CommandEditInGoogle",iconName:"googledocs",disabled:true,handler:function(){c.getMenuActions().googleEdit()
},access:function(i,m,g,l,h){var n=HttpCommander.Lib.Utils.checkAndGetNewExtensionConvertedFromGoogle(g.replace(/^;+|;+$/g,""));
var k=Ext.isEmpty(n)||c.isExtensionAllowed("file."+k);
return i&&c.htcConfig.enableGoogleEdit&&m=="file"&&i.download&&i.modify&&HttpCommander.Lib.Consts.googleDriveEditorFileTypes.indexOf(g)!=-1&&k
}},BoxView:{textKey:"CommandViewWithBox",iconName:"box",disabled:true,handler:function(){c.getMenuActions().viewInService("box")
},access:function(k,m,h,l,i,n){var g=(n.size||n.size_hidden||0);
return k&&m=="file"&&k.download&&HttpCommander.Lib.Consts.boxViewSupportedtypes.indexOf(h)!=-1&&g>0
}},CloudConvert:{textKey:"CommandCloudConvert",iconName:"cloudconvert",disabled:true,handler:function(){c.getMenuActions().getOutputFormats()
},access:function(i,l,g,k,h,m){return i&&l=="file"&&(i.upload||i.download)&&g&&g.length>2&&(m.size||m.size_hidden||0)>0
}},OfficeWebView:{textKey:"CommandViewWithOWA",iconName:"owa",disabled:true,handler:function(){c.getMenuActions().viewInService("owa")
},access:function(k,m,h,l,i,n){var g=(n.size||n.size_hidden||0);
return k&&m=="file"&&k.download&&HttpCommander.Lib.Consts.owaSupportedtypes.indexOf(h)!=-1&&g>0&&((h.indexOf(";xls")==0&&g<=5242880)||(h.indexOf(";xls")<0&&g<=10485760))
}},DownloadToGoogle:{textKey:"CommandDownloadToGoogleDocs",iconName:"googledocs",disabled:true,handler:function(){c.downloadToGoogle()
},access:d},DownloadToBox:{textKey:"CommandDownloadToBox",iconName:"box",disabled:true,handler:function(){c.downloadToBox()
},access:d},ZohoEdit:{textKey:"CommandEditWithZoho",iconName:"zohoeditor",disabled:true,handler:function(){c.getMenuActions().viewInService("zoho")
},access:function(i,m,g,l,h){var k=g.replace(/^;+|;+$/g,"");
return i&&m=="file"&&i.download&&i.modify&&c.htcConfig.zohoSupportedEditTypes.indexOf(k)!=-1
}},PixlrEdit:{textKey:"CommandEditInPixlr",iconName:"pixlr",disabled:true,handler:function(){c.getMenuActions().viewInService("pixlr")
},access:function(k,m,h,l,i,n){var g=(n.size||n.size_hidden||0);
return k&&k.modify&&m=="file"&&k.download&&HttpCommander.Lib.Consts.pixlrSupportedTypes.indexOf(h)!=-1&&g>0
}},AdobeImageEdit:{textKey:"CommandEditInAdobe",iconName:"adobeimage",disabled:true,handler:function(){c.getMenuActions().viewInService("adobe")
},access:function(k,m,h,l,i,n){var g=(n.size||n.size_hidden||0);
return k&&k.modify&&m=="file"&&k.download&&HttpCommander.Lib.Consts.adobeImageSupportedTypes.indexOf(h)!=-1&&g>0
}},DownloadToDropbox:{textKey:"CommandDownloadToDropbox",iconName:"dropbox",disabled:true,handler:function(){c.downloadToDropbox()
},access:function(i,l,g,k,h,m,n){return i&&i.download&&c.htcConfig.enableDownloadToDropbox&&(k>0||n>0)
}},DownloadToSkyDrive:{textKey:"CommandDownloadToSkyDrive",iconName:"skydrive",disabled:true,handler:function(){c.downloadToSkyDrive()
},access:function(i,l,g,k,h,m,n){return i&&i.download&&c.htcConfig.isAllowedSkyDrive&&(k>0||n>0)
}},Edit:{textKey:"CommandEdit",iconName:"textedit",disabled:true,handler:function(){c.getMenuActions().editFile()
},access:function(o,p,r,h,n,l){var m=o&&p=="file"&&o.download;
var g=(c.htcConfig.enableMSOfficeEdit||c.htcConfig.enableOpenOfficeEdit||c.htcConfig.enableWebFoldersLinks)&&l.locked;
var q=m&&o.modify&&!g;
var i=(typeof c.htcConfig.maxSizeForEditAsTextFile!="undefined")?((l.size||l.size_hidden||0)<=c.htcConfig.maxSizeForEditAsTextFile):false;
if(q){q=i
}if(m){m=i
}var k=c.getEditOpenTxtButtons();
if(Ext.isArray(k)){Ext.each(k,function(t,s){if(m&&!q){t.setText(c.htcConfig.locData.CommandEditView,true)
}else{t.setText(c.htcConfig.locData.CommandEdit,true)
}})
}return(q||m)
}},Link:{textKey:"CommandLinkToFile",iconName:"linktofile",disabled:true,handler:function(){c.getMenuActions().linkToFileFolder()
},access:function(i,l,g,k,h){return i&&(((l=="folder"||l=="none")&&c.htcConfig.enableLinkToFolder===true)||(i.download&&l=="file"&&c.htcConfig.enableLinkToFile===true))
}},ShareFolder:{textKey:"CommandMakePublicFolder",iconName:"sharefolder",disabled:true,handler:function(){c.getMenuActions().shareFolder(c.virtualFilePath,c.prepareAndShowMakePublicLinkWindow)
},access:function(i,l,g,k,h){return i&&((l=="file"&&c.htcConfig.enablePublicLinkToFile===true&&i.download&&i.anonymDownload)||((l=="folder"||l=="none")&&c.htcConfig.enablePublicLinkToFolder===true&&(((i.download||i.zipDownload)&&i.anonymDownload)||(i.upload&&i.anonymUpload)||((i.listFiles||i.listFolders)&&i.anonymViewContent))))
}},Shortcut:{textKey:"CommandCreateShortcut",iconName:"folder-shortcut",disabled:true,handler:function(){c.getMenuActions().runShortcut()
},access:function(i,l,g,k,h){return i&&i.create&&h<2&&c.isExtensionAllowed("file.lnk")
}},WebFolders:{textKey:"CommandWebFoldersLinks",iconName:"webfolders",disabled:true,handler:function(){c.getMenuActions().webFolders(c.prepareAndShowlinksToWebFoldersWindow)
},access:function(){var g=c.getCurrentFolder();
return !c.isRecentFolder(g)&&!c.isTrashFolder(g)
}},SyncWebFolders:{textKey:"CommandSyncWebFolders",iconName:"syncwebfolders",disabled:true,handler:function(){c.getMenuActions().syncWebFolders(c.initAndShowSyncWebFoldersHelpWindow)
},access:function(){var g=c.getCurrentFolder();
return !c.isRecentFolder(g)&&!c.isTrashFolder(g)
}},SendEmail:{textKey:"CommandSendEmail",iconName:"sendemail",disabled:true,handler:function(){c.getMenuActions().sendEmail()
},access:function(){var g=c.getCurrentFolder();
return !c.isRecentFolder(g)&&!c.isTrashFolder(g)
},allowForShared:true},VideoConvert:{textKey:"CommandConvertVideo",iconName:"process",disabled:true,handler:function(){c.getMenuActions().videoConvert()
},access:function(k,m,h,l,i,n){var g=(n.size||n.size_hidden||0);
return k&&k.create&&k.modify&&m&&m=="file"&&HttpCommander.Lib.Consts.videoConvertFileTypes.indexOf(h)!=-1&&g>0
}},PlayVideoFlash:{textKey:"CommandPlayVideoFlash",iconName:"play-video",disabled:true,handler:function(){c.getMenuActions().playVideoFlash()
},access:function(k,m,h,l,i,n){var g=(n.size||n.size_hidden||0);
return k&&k.download&&m&&m=="file"&&HttpCommander.Lib.Consts.flowplayerFileTypes.indexOf(h)!=-1&&!HttpCommander.Lib.Utils.browserIs.ios&&g>0
}},PlayVideoHTML5:{textKey:"CommandPlayVideoHtml5",iconName:"play-video",disabled:true,handler:function(){c.getMenuActions().playVideoHTML5()
},access:function(k,m,h,l,i,n){var g=(n.size||n.size_hidden||0);
return k&&k.download&&m&&m=="file"&&HttpCommander.Lib.Consts.html5VideoFileTypes.indexOf(h)!=-1&&g>0
}},PlayAudioHTML5:{textKey:"CommandPlayAudioHtml5",iconName:"play-audio",disabled:true,handler:function(){c.getMenuActions().playAudioHTML5()
},access:function(k,m,h,l,i,n){var g=(n.size||n.size_hidden||0);
return k&&k.download&&m&&m=="file"&&HttpCommander.Lib.Consts.html5AudioFileTypes.indexOf(h)!=-1&&g>0
}},Versioning:{textKey:"CommandVersioning",iconName:"versioning",disabled:true,menu:true,access:function(i,m,g,l,h){var k=c.getCurrentFolder();
return !c.isRecentFolder(k)&&!c.isTrashFolder(k)&&m&&m=="file"&&l==1
}},Zip:{textKey:"CommandZip",iconName:"zip",disabled:true,handler:function(){c.getMenuActions().zip()
},access:function(i,l,g,k,h){return i&&i.zip&&c.isExtensionAllowed(".ZIP",true)&&l&&l!="empty"&&l!="none"
}},ZipContent:{textKey:"CommandZipContents",iconName:"unzip",disabled:true,handler:function(){c.getMenuActions().zipContent(c.initZipContent)
},access:e},Unzip:{textKey:"CommandUnzip",iconName:"unzip",disabled:true,menu:true,access:e},ZipDownload:{textKey:"CommandZipDownload",iconName:"zipdownload",disabled:true,handler:function(){c.getMenuActions().zipDownload()
},access:function(i,l,g,k,h){return i&&i.zipDownload&&l&&(l=="set"||l=="folder"||(l&&l!="empty"&&l!="none"))
}},access:function(s){var p=false,n=false;
if(!s||!a[s]){return true
}if((n=c.isSharedForYouTreeFolder(c.getCurrentFolder()))){if(Ext.isFunction(a[s].access)||s=="View"||s=="Select"||s=="SelectAll"||s=="InvertSelection"){return false
}}if((p=c.isSharedTreeFolder(c.getCurrentFolder()))&&!a[s].allowForShared){return false
}if(!Ext.isFunction(a[s].access)){return true
}var o=c.getCurrentPerms(),q=c.getSelTypeFilesModel(p?c.getSharedGrid():n?c.getSharedFYGrid():c.getGrid()),l=q?q.selModel:null,u=l?l.getSelected():null,i=u?u.data:{},r=q?q.selType:null,g=q?q.selFiles:0,k=q?q.selFolders:0,m=l?l.getCount():0,h=(!r||r=="none"||!i.name)?"":HttpCommander.Lib.Utils.getFileExtension(i.name),t=";"+h+";";
return a[s].access(o,r,t,g,m,i,k,q)
}};
a.ViewEditSharing=a.ViewEdit;
return a
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.ControlNavFolders=function(b){var k=10,f=b.htcConfig.iconSet.ext.indexOf("png")<0||(b.isUsedSmallIcons()&&b.htcConfig.iconSet.ext.indexOf("png")>=0),h=[],d=-1,m=new Ext.Button({disabled:true,icon:HttpCommander.Lib.Utils.getIconPath(b,f?"back":"24/back"),tooltip:b.htcConfig.locData.CommandBack,scale:b.isUsedSmallIcons()?"small":"medium",handler:function(n,o){if(h.length>0&&d<h.length-1){d++;
l(h[d],null)
}else{n.setDisabled(true)
}}}),i=new Ext.Button({disabled:true,icon:HttpCommander.Lib.Utils.getIconPath(b,f?"forward":"24/forward"),tooltip:b.htcConfig.locData.CommandForward,scale:b.isUsedSmallIcons()?"small":"medium",handler:function(n,o){if(h.length>0&&d>0){d--;
l(h[d],null)
}else{n.setDisabled(true)
}}}),a=new Ext.menu.Menu({items:[],listeners:{mouseover:function(q,p,o){if(o&&typeof o.index!="undefined"&&o.index!=d){var n=o.el.dom.getElementsByTagName("img");
if(n&&n.length>0){n=n[0];
if(n){if(o.index>d){n.src=HttpCommander.Lib.Utils.getIconPath(b,"left")
}else{if(o.index<d){n.src=HttpCommander.Lib.Utils.getIconPath(b,"right")
}}}}}},mouseout:function(q,p,o){if(o&&typeof o.index!="undefined"&&o.index!=d){var n=o.el.dom.getElementsByTagName("img");
if(n&&n.length>0){n=n[0];
if(n){n.src=Ext.BLANK_IMAGE_URL
}}}}}}),e=new Ext.Button({disabled:true,menu:a,tooltip:b.htcConfig.locData.CommandRecentFolders,scale:b.isUsedSmallIcons()?"small":"medium",listeners:{afterrender:function(o){var n=o.el.dom.getElementsByTagName("button");
if(n&&n.length>0){var p=n[0].style;
p.paddingLeft="0px";
p.paddingRight="0px";
p.width="0px"
}}}}),c=function(){m.setDisabled(h.length==0||d<0||d>=h.length-1);
i.setDisabled(h.length==0||d<=0);
e.setDisabled(h.length==0)
},l=function(o,n){if(o&&o.text&&o.path&&typeof o.index!="undefined"&&b&&b.openGridFolder){d=o.index;
if(d<0||d>=h.length){d=0
}c();
b.openGridFolder(o.path,true,false,true);
g()
}},g=function(){var o,p,n=h.length;
a.removeAll();
if((d<0||d>=n)&&n>0){d=0
}else{if(n==0){d=-1
}}for(o=0;
o<n;
o++){p=h[o];
p.index=o;
if(d==o){p.icon=HttpCommander.Lib.Utils.getIconPath(b,"check")
}else{if(p.hasOwnProperty("icon")){delete p.icon
}}p.handler=l;
a.add(p)
}};
this.backBtn=m;
this.forwardBtn=i;
this.historyBtn=e;
this.pushFolder=function(o){if(!o){return
}var n=o,p=o.lastIndexOf("/");
if(p>=0&&p<o.length-1){n=o.substring(p+1)
}if(d<0||d>=h.length){d=0
}else{while(d>0){h.shift();
d--
}}if(h.length==0||o.toLowerCase()!=h[0].path.toLowerCase()){h.unshift({text:b.getFolderTitle(n,o),path:o});
while(h.length>k){h.pop()
}}c();
g()
}
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.FavoritesSubMenu=function(c){var e=[],d,a;
var f=function(h,i){c.globalLoadMask.msg=c.htcConfig.locData.AddingToFavoritesMessage+"...";
c.globalLoadMask.show();
HttpCommander.Common.AddFavorite({fav:h},function(l,k){c.globalLoadMask.hide();
c.globalLoadMask.msg=c.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(l,k,c.Msg,c.htcConfig)){i()
}})
};
var g=function(h,i){c.globalLoadMask.msg=c.htcConfig.locData.RemoveFromFavoritesMessage+"...";
c.globalLoadMask.show();
HttpCommander.Common.RemoveFavorite({fav:h},function(l,k){c.globalLoadMask.hide();
c.globalLoadMask.msg=c.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(l,k,c.Msg,c.htcConfig)){i()
}})
};
var b=function(i,k){k=k||d;
if(k&&!Ext.isEmpty(i)&&i.trim().length>0){try{if(k.items.length==1){k.add({xtype:"menuseparator",colspan:2})
}var l=Ext.id();
k.add({id:l,icon:HttpCommander.Lib.Utils.getIconPath(c,"folder"),xtype:"menuitem",width:"100%",originName:i,text:Ext.util.Format.htmlEncode(i),handler:function(n){var m=c.getGridViewMenu();
if(m){m.hide()
}if(a){a.hide()
}c.openGridFolder(n.originName,true)
}});
k.add({favId:l,width:"auto",tooltip:String.format(c.htcConfig.locData.RemoveFromFavoritesHint,Ext.util.Format.htmlEncode(i)),iconCls:"x-remove-from-favorites",cls:"x-remove-from-favorites-btn",xtype:"button",handler:function(o){var m=Ext.getCmp(o.favId);
if(m){var p=m.originName;
var n=e.indexOf(p);
if(n>-1){g(p,function(){e.splice(n,1);
k.remove(o);
k.remove(m);
if(k.items.length==2){k.remove(k.items.items[1])
}})
}}}});
return true
}catch(h){}}return false
};
a=new Ext.menu.Menu({plain:true,items:[d=new Ext.ButtonGroup({autoWidth:true,columns:2,frame:false,baseCls:"x-menu",defaults:{xtype:"menuitem",width:"100%"},items:[{colspan:2,text:c.htcConfig.locData.CommandAddToFavorites,icon:HttpCommander.Lib.Utils.getIconPath(c,"addtofav"),handler:function(m,o){var l=c.getGridViewMenu();
if(l){l.hide()
}if(a){a.hide()
}e=e||[];
var k=c.getCurrentFolder();
var n=k.toLowerCase().trim();
if(n!="root"){for(var h=0;
h<e.length;
h++){if(n==e[h].toLowerCase().trim()){c.Msg.show({title:c.htcConfig.locData.CommandAddToFavorites,msg:String.format(c.htcConfig.locData.FolderAlreadyAddedInFavorites,Ext.util.Format.htmlEncode(k)),icon:c.Msg.WARNING,buttons:c.Msg.OK});
return
}}f(k,function(){if(b(k)){e.push(k);
c.Msg.show({title:c.htcConfig.locData.CommandAddToFavorites,msg:String.format(c.htcConfig.locData.FolderAddedInFavoritesSuccessfully,Ext.util.Format.htmlEncode(k)),icon:c.Msg.INFO,buttons:c.Msg.OK})
}})
}}}]})],listeners:{afterrender:function(h){if(Ext.isArray(c.htcConfig.favs)){e=c.htcConfig.favs
}else{e=[]
}d.items.items[0].setDisabled(c.getCurrentFolder().toLowerCase()=="root");
if(e.length>0){Ext.each(e,function(i){b(i,d)
})
}}}});
return a
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.ActivityMonitor=function(b){var c=this,a;
this.config=b;
this.killSessionTask=null;
this.killSessionTaskReset=Ext.emptyFn;
if(!Ext.isObject(b)||!Ext.isObject(b.htcConfig)||!b.htcConfig.sessionTimeout||b.htcConfig.sessionTimeout<=0){return
}this.killSessionTask=new Ext.util.DelayedTask(function(){window.location.href=c.config.htcConfig.relativePath+"Logout.aspx"
});
this.killSessionTaskReset=function(){if(c.killSessionTask){c.killSessionTask.delay(c.config.htcConfig.sessionTimeout)
}}
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.WatchSubMenu=function(a){var b=new Ext.menu.Menu({items:[{itemId:"start",text:a.htcConfig.locData.WatchForModifsStartCommand,icon:HttpCommander.Lib.Utils.getIconPath(a,"watch")},{itemId:"stop",text:a.htcConfig.locData.WatchForModifsStopCommand,icon:HttpCommander.Lib.Utils.getIconPath(a,"stopwatch")},{itemId:"edit",text:a.htcConfig.locData.WatchForModifsEditCommand,icon:HttpCommander.Lib.Utils.getIconPath(a,"edit")},{itemId:"view",text:a.htcConfig.locData.WatchForModifsViewChangesCommand,icon:HttpCommander.Lib.Utils.getIconPath(a,"view")}],listeners:{beforeshow:function(c){b.onBeforeShowWatchMenu(c,a.getSelTypeFilesModel(a.getGrid()))
},itemclick:function(c){switch(c.itemId){case"start":a.getMenuActions().addWatch();
break;
case"stop":a.getMenuActions().stopWatch();
break;
case"view":a.getMenuActions().viewWatch();
break;
case"edit":a.getMenuActions().editWatch();
break
}}},onBeforeShowWatchMenu:function(d,h,r){var k=h.selModel,q=k.getSelected(),e=q?q.data:{},p=h.selType,c=h.selFiles,g=e.watchForModifs,f=(!!a.htcConfig.currentPerms&&a.htcConfig.currentPerms.watchForModifs),l=((Ext.isEmpty(e.srowtype)&&f)||(r&&e.srowtype=="alert"))&&(p=="file"||p=="folder"||p=="rootfolder"),o,n,m,i;
o=d.getComponent("start");
n=d.getComponent("stop");
m=d.getComponent("view");
i=d.getComponent("edit");
if(!g){o.setVisible(!r);
o.setDisabled(r);
n.setVisible(false);
n.setDisabled(true);
m.setVisible(false);
m.setDisabled(true);
i.setVisible(false);
i.setDisabled(true)
}else{if(Ext.isObject(g)){o.setVisible(false);
o.setDisabled(true);
n.setVisible(true);
n.setDisabled(false);
m.setVisible(true);
m.setDisabled(false);
i.setVisible(a.htcConfig.watchSend);
i.setDisabled(!a.htcConfig.watchSend)
}else{o.setVisible(false);
o.setDisabled(true);
n.setVisible(false);
n.setDisabled(true);
m.setVisible(true);
m.setDisabled(false);
i.setVisible(false);
i.setDisabled(true)
}}return l
}});
return b
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.WatchModificationsWindow=function(b){var d=[];
if(Ext.isArray(b.htcConfig.watchActions)){Ext.each(b.htcConfig.watchActions,function(e){d.push({name:e,itemId:e,checked:true,boxLabel:e})
})
}var c=null,a=new b.Window({title:b.htcConfig.locData.WatchForModifsCommand,bodyStyle:"padding:5px",resizable:true,closable:true,maximizable:false,closeAction:"hide",minHeight:400,minWidth:450,height:400,modal:true,width:450,layout:"fit",pathInfo:null,viewWindow:null,plain:true,items:new Ext.form.FormPanel({itemId:"form",baseCls:"x-plain",defaults:{hideLabel:true,anchor:"100%"},layout:{type:"vbox",align:"stretch"},items:[{xtype:"label",text:b.htcConfig.locData.CommonFieldLabelPath+":"},{itemId:"path",xtype:"displayfield",style:{fontWeight:"bold"},value:""},{itemId:"nested",xtype:"checkbox",hidden:true,checked:true,hideLabel:false,boxLabel:b.htcConfig.locData.WatchForModifsIncludingNestedLabel},{xtype:"label",html:"&nbsp;"},{itemId:"users-checkbox",xtype:"checkbox",checked:false,hideLabel:false,boxLabel:b.htcConfig.locData.WatchForModifsWatchedUsersCheckBox,listeners:{change:function(e,i,f){var h=a.getComponent("form"),g=h.getComponent("users");
if(g){g.setDisabled(!i)
}},check:function(e,h){var g=a.getComponent("form"),f=g.getComponent("users");
if(f){f.setDisabled(!h)
}}}},{itemId:"users",xtype:"textarea",anchor:"100%",width:"100%",disabled:true,flex:1,value:""},{xtype:"label",html:"&nbsp;"},{itemId:"acts-checkbox",xtype:"checkbox",checked:true,hideLabel:false,boxLabel:b.htcConfig.locData.WatchForModifsActionsCheckBox,listeners:{change:function(e,g,f){if(c){c.setDisabled(g)
}},check:function(e,f){if(c){c.setDisabled(f)
}}}},c=new Ext.form.FieldSet({itemId:"acts",layout:"column",defaults:{columnWidth:".20",border:false},defaultType:"checkbox",border:false,padding:0,margin:0,cls:"watch-actions",disabled:true,hidden:d.length==0,items:d}),{xtype:"label",html:"&nbsp;"},{itemId:"emails-checkbox",xtype:"checkbox",hidden:!(b.htcConfig.watchSend==true),checked:false,hideLabel:false,boxLabel:b.htcConfig.locData.WatchForModifsNotifCheckBox,listeners:{change:function(e,i,f){var g=a.getComponent("form"),k=g.getComponent("emails"),h=g.getComponent("ignore-own");
if(k&&h){k.setDisabled(!i);
h.setDisabled(!i)
}},check:function(e,g){var f=a.getComponent("form"),i=f.getComponent("emails"),h=f.getComponent("ignore-own");
if(i&&h){i.setDisabled(!g);
h.setDisabled(!g)
}}}},{itemId:"emails",xtype:"textarea",anchor:"100%",width:"100%",disabled:true,hidden:!(b.htcConfig.watchSend==true),flex:1,value:""},{itemId:"ignore-own",hidden:!(b.htcConfig.watchSend==true),xtype:"checkbox",checked:false,hideLabel:false,boxLabel:b.htcConfig.locData.WatchForModifsIgnoreOwnerCheckBox,disabled:true}]}),mainHandler:function(){var g,p,s,h,f,o,r,l,m=false,k=false,i=false,n,e,q=[];
if(!a.pathInfo||Ext.isEmpty(a.pathInfo.path)){return
}g=a.getComponent("form");
s=g.getComponent("emails");
h=g.getComponent("emails-checkbox");
f=g.getComponent("ignore-own");
o=g.getComponent("users-checkbox");
r=g.getComponent("users");
l=g.getComponent("acts-checkbox");
m=b.htcConfig.watchSend&&h.getValue()&&!Ext.isEmpty(n=s.getValue())&&(n=n.trim()).length>0;
k=o.getValue()&&!Ext.isEmpty(e=r.getValue())&&(e=e.trim()).length>0;
i=!l.getValue();
if(i){Ext.each(c.items.items,function(t){if(t&&t.getValue()){q.push(t.itemId)
}});
i=(q.length>0&&q.length<d.length)
}p={path:a.pathInfo.path,is_folder:(a.pathInfo.is_folder===true),emails:m?n:null,users:k?e:null,actions:i?q.join(","):null};
p.iown=m?f.getValue():false;
b.globalLoadMask.msg=b.htcConfig.locData.WatchForModifsStartProgressLoading+"...";
b.globalLoadMask.show();
HttpCommander.Common.AddWatch(p,function(v,u){b.globalLoadMask.hide();
b.globalLoadMask.msg=b.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(v,u,b.Msg,b.htcConfig)){var t=Ext.isObject(v.watchForModifs)?v.watchForModifs:null;
if(a.viewWindow&&Ext.isObject(a.viewWindow.pathInfo)){a.viewWindow.pathInfo={path:p.path,is_folder:p.is_folder,id:(Ext.isNumber(t.id)&&t.id>0)?t.id:a.pathInfo.id,iown:p.iown};
if(m){a.viewWindow.pathInfo.emails=t.emails||p.emails
}if(k){a.viewWindow.pathInfo.users=t.users||p.users
}if(i){a.viewWindow.pathInfo.actions=t.actions||p.actions
}a.viewWindow.loadLogs({})
}a.hide();
b.openTreeAlerts();
b.openGridFolder(b.getCurrentFolder());
b.showBalloon(Ext.util.Format.htmlEncode(String.format(b.htcConfig.locData.WatchForModifsSubscriptionSuccessMessage,p.path)))
}})
},buttons:[{text:b.htcConfig.locData.WatchForModifsStartCommand,handler:function(e){a.mainHandler()
}},{text:b.htcConfig.locData.CommonButtonCaptionCancel,handler:function(e){a.hide()
}}],listeners:{beforeshow:function(g){var f,k,n,q,p,e,i,o,m,h=(b.htcConfig.watchSend===true);
if(!g.pathInfo||Ext.isEmpty(g.pathInfo.path)){return false
}var f=g.getComponent("form");
if(!f){return false
}k=f.getComponent("path");
q=f.getComponent("emails-checkbox");
p=f.getComponent("emails");
e=f.getComponent("ignore-own");
o=f.getComponent("users-checkbox");
m=f.getComponent("users");
i=f.getComponent("acts-checkbox");
if(!k||!q||!p||!e||!o||!m||!i||!c){return false
}k.setValue(g.pathInfo.path);
q.setValue(false);
p.setValue(null);
p.setDisabled(true);
e.setValue(false);
e.setDisabled(true);
e.setVisible(h);
p.setVisible(h);
o.setValue(false);
m.setValue(null);
m.setDisabled(true);
i.setValue(true);
c.setDisabled(true);
g.buttons[0].setText(b.htcConfig.locData.WatchForModifsStartCommand);
if(Ext.isNumber(g.pathInfo.id)){if(!Ext.isEmpty(g.pathInfo.emails)&&g.pathInfo.emails.trim().length>0){p.setValue(g.pathInfo.emails);
q.setValue(true);
p.setDisabled(false);
e.setDisabled(false);
e.setValue(g.pathInfo.iown)
}if(!Ext.isEmpty(g.pathInfo.users)&&g.pathInfo.users.trim().length>0){m.setValue(g.pathInfo.users);
o.setValue(true);
m.setDisabled(false);
o.setDisabled(false)
}if(!Ext.isEmpty(g.pathInfo.actions)&&c){var l=g.pathInfo.actions.split(",");
i.setValue(false);
c.setDisabled(false);
Ext.each(c.items.items,function(s){if(s){s.setValue(false)
}});
var r=false;
if(l.length>0){Ext.each(l,function(t){var s=c.getComponent(t);
if(s){s.setValue(true);
if(!r){r=true
}}})
}if(!r){i.setValue(true);
c.setDisabled(true);
Ext.each(c.items.items,function(s){if(s){s.setValue(true)
}})
}}g.buttons[0].setText(b.htcConfig.locData.CommandSave)
}return true
},hide:function(e){e.viewWindow=null;
e.pathInfo=null
}}});
return a
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.ChangesWatchWindow=function(b){var d,c=new Ext.data.DirectStore({remoteSort:true,baseParams:{id:0,start:0,limit:b.getPageLimit(),sort:"date",dir:"DESC",path:null,child:false,begin:null,end:null},paramOrder:["id","start","limit","sort","dir","path","child","begin","end"],directFn:HttpCommander.Common.GetWatchedChanges,idProperty:"id",totalProperty:"total",successProperty:"success",root:"data",sortInfo:{field:"date",direction:"DESC"},defaultRequestTimeout:Ext.Ajax.timeout,listeners:{beforeload:function(e,f){Ext.Ajax.timeout=HttpCommander.Lib.Consts.gridRequestTimeout
},datachanged:function(f){if(d&&b.getPageLimit()){var i=d.getBottomToolbar();
if(i){var h=i.getPageData();
var e=f.getTotalCount();
var k=f.getCount();
if(f.reader&&f.reader.jsonData&&Ext.isNumber(f.reader.jsonData.position)&&f.reader.jsonData.position>-1){i.cursor=f.reader.jsonData.position;
h=i.getPageData();
var g=h.activePage,l=h.pages;
i.afterTextItem.setText(String.format(i.afterPageText,h.pages));
i.inputItem.setValue(g);
i.first.setDisabled(g==1);
i.prev.setDisabled(g==1);
i.next.setDisabled(g==l);
i.last.setDisabled(g==l);
i.refresh.enable();
i.updateInfo()
}i.fireEvent("change",this,h);
if(b.getPageLimit()>=e&&h.activePage>=1&&h.activePage<=h.pages){i.hide()
}else{i.show()
}}}},load:function(f,e,g){Ext.Ajax.timeout=f.defaultRequestTimeout;
if(f.reader&&f.reader.jsonData&&!f.reader.jsonData.success){b.Msg.show({title:b.htcConfig.locData.CommonErrorCaption,msg:f.reader.jsonData.message,icon:b.Msg.ERROR,buttons:b.Msg.OK})
}},exception:function(h,i,l,f,g,e){if(c){Ext.Ajax.timeout=c.defaultRequestTimeout
}if(i==="remote"){var k="Message: "+Ext.util.Format.htmlEncode(g.message);
if(g.xhr){k="Status: "+Ext.util.Format.htmlEncode(g.xhr.status)+" "+Ext.util.Format.htmlEncode(g.xhr.statusText)+"<br />"+k
}b.Msg.show({title:b.htcConfig.locData.CommonErrorCaption,msg:k,icon:b.Msg.ERROR,buttons:b.Msg.OK})
}}},fields:[{name:"id",type:"int"},{name:"user",type:"string"},{name:"date",type:"date",dateFormat:"timestamp"},{name:"action",type:"string"},{name:"path",type:"string"},{name:"phys_path",type:"string"},{name:"more_info",type:"string"},{name:"is_folder",type:"boolean"},{name:"is_public",type:"boolean"},{name:"by_webdav",type:"boolean"}]}),a=new b.Window({title:b.htcConfig.locData.WatchForModifsViewChangesCommand,resizable:true,closable:true,maximizable:true,closeAction:"hide",border:false,minHeight:350,minWidth:b.getIsEmbeddedtoIFRAME()?300:500,modal:true,width:b.getIsEmbeddedtoIFRAME()?500:800,height:500,layout:"fit",pathInfo:null,frame:false,plain:true,items:[d=new Ext.grid.GridPanel({header:false,border:false,frame:false,buttonAlign:"left",minColumnWidth:25,loadMask:{msg:b.htcConfig.locData.ProgressLoading+"..."},autoExpandMin:100,enableHdMenu:true,viewConfig:{forceFit:true},autoExpandColumn:"w-more-info",tbar:[{xtype:"label",html:b.htcConfig.locData.SearchByDateFrom+":&nbsp;"},{hideLabel:true,width:90,xtype:"datefield",name:"startdt",id:"startdt",vtype:"daterange",endDateField:"enddt",value:new Date(),editable:false,listeners:{select:function(){a.loadLogs({start:0,limit:b.getPageLimit()})
}}},{xtype:"label",html:"&nbsp;&nbsp;"+b.htcConfig.locData.SearchByDateTo+":&nbsp;"},{hideLabel:true,width:90,xtype:"datefield",name:"enddt",id:"enddt",vtype:"daterange",startDateField:"startdt",value:new Date(),editable:false,listeners:{select:function(){a.loadLogs({start:0,limit:b.getPageLimit()})
}}}," ",{text:b.htcConfig.locData.CommonForToday,handler:function(){var g=new Date(),f=Ext.getCmp("startdt"),h=Ext.getCmp("enddt");
if(g>=h.getValue()){h.setValue(g);
f.setValue(g)
}else{f.setValue(g);
h.setValue(g)
}a.loadLogs({start:0,limit:b.getPageLimit()})
}},"->",{text:b.htcConfig.locData.CommandRefresh,icon:HttpCommander.Lib.Utils.getIconPath(b,"refresh"),handler:function(){if(c){c.reload()
}}}],bbar:b.getPageLimit()>0?new Ext.PagingToolbar({pageSize:b.getPageLimit(),store:c,displayInfo:true,beforePageText:b.htcConfig.locData.PagingToolbarBeforePageText,afterPageText:b.htcConfig.locData.PagingToolbarAfterPageText,firstText:b.htcConfig.locData.PagingToolbarFirstText,prevText:b.htcConfig.locData.PagingToolbarPrevText,nextText:b.htcConfig.locData.PagingToolbarNextText,lastText:b.htcConfig.locData.PagingToolbarLastText,displayMsg:b.htcConfig.locData.PagingToolbarDisplayMsg,refreshText:b.htcConfig.locData.CommandRefresh,emptyMsg:b.htcConfig.locData.PagingToolbarEmptyMsg}):undefined,store:c,plugins:[new Ext.ux.grid.GridFilters({menuFilterText:b.htcConfig.locData.MenuFilterText,encode:false,local:true,filters:[{type:"numeric",dataIndex:"id",menuItemCfgs:{emptyText:b.htcConfig.locData.EmptyTextFilter}},{dataIndex:"path",type:"string",emptyText:b.htcConfig.locData.EmptyTextFilter},{dataIndex:"action",type:"string",emptyText:b.htcConfig.locData.EmptyTextFilter},{dataIndex:"user",type:"string",emptyText:b.htcConfig.locData.EmptyTextFilter},{dataIndex:"phys_path",type:"string",emptyText:b.htcConfig.locData.EmptyTextFilter},{dataIndex:"more_info",type:"string",emptyText:b.htcConfig.locData.EmptyTextFilter},{dataIndex:"is_folder",type:"boolean",yesText:b.htcConfig.locData.CommonValueTypeFolder,noText:b.htcConfig.locData.CommandFile},{dataIndex:"is_public",type:"boolean",yesText:b.htcConfig.locData.YesBooleanFilterText,noText:b.htcConfig.locData.NoBooleanFilterText},{dataIndex:"by_webdav",type:"boolean",yesText:b.htcConfig.locData.YesBooleanFilterText,noText:b.htcConfig.locData.NoBooleanFilterText},{dataIndex:"date",type:"date",afterText:b.htcConfig.locData.AfterDateFilterText,beforeText:b.htcConfig.locData.BeforeDateFilterText,onText:b.htcConfig.locData.OnDateFilterText}]})],colModel:new Ext.grid.ColumnModel({defaults:{sortable:true},columns:[{id:"w-id",header:"Id",width:30,hidden:true,dataIndex:"id"},{id:"w-user",header:b.htcConfig.locData.CommonFieldLabelUser,dataIndex:"user",width:70,renderer:function(f){var e=HttpCommander.Lib.Utils.parseUserName(f);
return b.renderers.htmlEncodedRenderer(e)
}},{id:"w-date",header:b.htcConfig.locData.CommonFieldLabelDate,dataIndex:"date",renderer:b.renderers.dateRendererWithQTip,width:140},{id:"w-action",header:b.htcConfig.locData.CommonFieldLabelAction,dataIndex:"action",renderer:b.renderers.htmlEncodedRenderer,width:70},{id:"w-path",header:b.htcConfig.locData.CommonFieldLabelPath,dataIndex:"path",renderer:function(e){if(Ext.isEmpty(e)){return"&nbsp;"
}return String.format("<a ext:qtip='{0}' href='' style='white-space: normal;' class='fileNameLink' onclick='return false;'>{1}</a>",Ext.util.Format.htmlEncode(b.htcConfig.locData.GridRowAlertEventHint),Ext.util.Format.htmlEncode(e))
},width:200},{id:"w-more-info",width:250,header:b.htcConfig.locData.LogsGridDetailsTitle,dataIndex:"more_info",renderer:b.renderers.wordWrapRenderer},{id:"w-is-folder",width:25,header:b.htcConfig.locData.LogsGridIsFolderColumn,dataIndex:"is_folder",hidden:true,renderer:b.renderers.booleanRenderer},{id:"w-is-public",width:35,header:b.htcConfig.locData.LogsGridIsPublicColumn,dataIndex:"is_public",renderer:b.renderers.booleanRenderer},{id:"w-by-webdav",width:35,header:b.htcConfig.locData.LogsGridByWebDavColumn,dataIndex:"by_webdav",renderer:b.renderers.booleanRenderer}]}),flex:1,stripeRows:true,listeners:{cellclick:function(f,m,l,k){var i=d.getStore().getAt(m);
var n=d.getColumnModel().getDataIndex(l);
if(n=="path"){var o=i.get(n);
var g=null;
if(Ext.isEmpty(o)){return
}var h=o.lastIndexOf("/");
if(h>0&&h<o.length-1){g=o.substring(h+1);
o=o.substring(0,h)
}if(!Ext.isEmpty(g)){b.setSelectPath({path:o,name:g})
}b.openGridFolder(o)
}}}})],buttonAlign:"left",buttons:[{icon:HttpCommander.Lib.Utils.getIconPath(b,"stopwatch")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=stopwatch":""),text:b.htcConfig.locData.WatchForModifsStopCommand,hidden:true,handler:function(e){b.getMenuActions().stopWatch(a.pathInfo,a)
}},{icon:HttpCommander.Lib.Utils.getIconPath(b,"edit")+(HttpCommander.Lib.Utils.browserIs.ie10standard?"?q=edit":""),text:b.htcConfig.locData.WatchForModifsEditCommand,hidden:true,handler:function(e){b.getMenuActions().editWatch(a.pathInfo,a)
}},"->",{text:b.htcConfig.locData.CommonButtonCaptionClose,handler:function(e){a.hide()
}}],loadLogs:function(f){if(!c){return
}var o=a.pathInfo&&!Ext.isEmpty(a.pathInfo.path)?a.pathInfo.path:null;
var h=false;
var g=a.pathInfo&&Ext.isNumber(a.pathInfo.id)?a.pathInfo.id:(h=Ext.isNumber(a.pathInfo.parentId))?a.pathInfo.parentId:0;
var m=Ext.getCmp("startdt"),l=null,i=Ext.getCmp("enddt"),n=null;
if(m){l=m.getValue();
if(Ext.isDate(l)){l=l.clearTime().getTime()
}else{l=null
}}if(i){n=i.getValue();
if(Ext.isDate(n)){n=n.clearTime().add(Date.DAY,1).add(Date.SECOND,-1).getTime()
}else{n=null
}}var k=Ext.apply({path:o,id:g,child:h,begin:l,end:n},f||{});
c.setBaseParam("path",o);
c.setBaseParam("id",g);
c.setBaseParam("child",h);
c.setBaseParam("begin",l);
c.setBaseParam("end",n);
if(c.baseParams.sort){k.sort=c.baseParams.sort
}if(c.baseParams.dir){k.dir=c.baseParams.dir
}if(!Ext.isDefined(k.start)){k.start=c.baseParams.start||0
}if(!Ext.isDefined(k.limit)){k.limit=c.baseParams.limit||b.getPageLimit()
}c.storeOptions(k);
c.load({params:k})
},listeners:{beforeshow:function(f){if(!f.pathInfo||Ext.isEmpty(f.pathInfo.path)){return false
}var e=Ext.isNumber(f.pathInfo.id)&&f.pathInfo.id>0;
f.buttons[0].setVisible(e);
f.buttons[1].setVisible(e);
f.setTitle(b.htcConfig.locData.WatchForModifsViewChangesCommand+": <strong>"+Ext.util.Format.htmlEncode(f.pathInfo.path)+"</strong>");
return true
},hide:function(e){e.pathInfo=null
},show:function(e){if(c){c.removeAll();
c.setDefaultSort("date","DESC");
a.loadLogs({start:0,limit:b.getPageLimit(),sort:"date",dir:"DESC"})
}e.doLayout();
e.syncSize()
}}});
return a
};
var scriptSource=HttpCommander.Lib.Utils.getScriptSource();
Ext.ns("HttpCommander");
HttpCommander.Main=(function(){var hcMain={};
var vTypesApplied=false,connectionClassObserved=false;
var appRootUrl=(function(){var url=scriptSource.replace(/\/Scripts\/[^\/]+$/i,"/");
return url
})();
/*! Uncomment line below to notify users that they should click logout  at the end) */
;
/*! window.onunload = HttpCommander.Main.onunloadFunc; */
;
hcMain.onunloadFunc=function(){if(Ext.isObject(htcConfig)&&typeof htcConfig.version=="string"&&htcConfig.version.toLowerCase().indexOf("ad")==0){window.alert("You should close your browser or click LogOut button to clear authentication otherwise anybody can login under your account!")
}};
hcMain.FileManagers={};
hcMain.InitFileManager=function(config){config=config||{};
var debugmode=(config.debugmode===true),handleErrors=(config.handleErrors===true),ProcessScriptError=function(e){if(!debugmode&&handleErrors){var msg="Script error occured.";
if(typeof e!="undefined"&&typeof e.message!="undefined"&&typeof e.name!="undefined"){msg+=" Message: "+e.message+" Name: "+e.name
}window.alert(msg)
}if(HttpCommanderLog&&typeof HttpCommanderLog.SetLastError=="function"){HttpCommanderLog.SetLastError(e)
}if(debugmode||typeof window.onerror=="function"){throw e
}};
var htcConfig=config.htcConfig||window.htcConfig;
if(!Ext.isObject(htcConfig)){ProcessScriptError(new Error("HTTP Commander configuration not defined! Please check up presence and correctness Handlers/Config.ashx script."));
return null
}else{if(typeof htcConfig._ERROR_=="string"){ProcessScriptError(new Error(htcConfig._ERROR_));
return null
}}HttpCommander.Lib.Utils.registerCssClasses(htcConfig);
if(htcConfig.msooEditorFileTypes){HttpCommander.Lib.Consts.msooEditorFileTypes=htcConfig.msooEditorFileTypes
}else{HttpCommander.Lib.Consts.msooEditorFileTypes=""
}if(htcConfig.googleDocsViewerFileTypes){HttpCommander.Lib.Consts.googleDocSupportedtypes=htcConfig.googleDocsViewerFileTypes
}if(htcConfig.googleDriveEditorFileTypes){HttpCommander.Lib.Consts.googleDriveEditorFileTypes=htcConfig.googleDriveEditorFileTypes
}else{HttpCommander.Lib.Consts.googleDriveEditorFileTypes=""
}if(htcConfig.owaViewerFileTypes){HttpCommander.Lib.Consts.owaSupportedtypes=htcConfig.owaViewerFileTypes
}if(htcConfig.boxViewerFileTypes){HttpCommander.Lib.Consts.boxViewSupportedtypes=htcConfig.boxViewerFileTypes
}if(htcConfig.shareCadViewerFileTypes){HttpCommander.Lib.Consts.shareCadOrgSupportedTypes=htcConfig.shareCadViewerFileTypes
}else{HttpCommander.Lib.Consts.shareCadOrgSupportedTypes=""
}if(htcConfig.autodeskViewerFileTypes){HttpCommander.Lib.Consts.autodeskViewerFileTypes=htcConfig.autodeskViewerFileTypes
}else{HttpCommander.Lib.Consts.autodeskViewerFileTypes=""
}if(htcConfig.pixlrEditorFileTypes){HttpCommander.Lib.Consts.pixlrSupportedTypes=htcConfig.pixlrEditorFileTypes
}else{HttpCommander.Lib.Consts.pixlrSupportedTypes=""
}if(htcConfig.adobeImageEditorFileTypes){HttpCommander.Lib.Consts.adobeImageSupportedTypes=htcConfig.adobeImageEditorFileTypes
}else{HttpCommander.Lib.Consts.adobeImageSupportedTypes=""
}var isBlackTheme=(";azzurra-black;access;".indexOf(";"+(htcConfig.styleName||"").toLowerCase()+";")>=0);
var isAccessTheme=(htcConfig.styleName||"").toLowerCase()=="access";
var container=null;
try{if(!!config.id){if(typeof config.id=="string"){if(!(container=document.getElementById(config.id))){container=null
}}else{if(!container.tagName){container=null
}}}}catch(e){ProcessScriptError(e);
return null
}var allowSetFileNameAtSimpleUpload=false;
var _OLD_ROOT_="root",_ROOT_=":root",_RECENT_=":recent",_TRASH_=":trash",_SHARED_=":shared",_SHARED_FOR_YOU_=":sharedforyou",_ALERTS_=":alerts",_SPEC_TREE_FOLDER_NAMES_=[_OLD_ROOT_,_ROOT_,_RECENT_,_TRASH_,_SHARED_,_ALERTS_,_SHARED_FOR_YOU_],_SPEC_LANG_TITLE_KEYS_={};
_SPEC_LANG_TITLE_KEYS_[_RECENT_]="RecentRootTitle";
_SPEC_LANG_TITLE_KEYS_[_TRASH_]="TrashRootTitle";
_SPEC_LANG_TITLE_KEYS_[_SHARED_]="SharedByLinkRootTitle";
_SPEC_LANG_TITLE_KEYS_[_SHARED_FOR_YOU_]="SharedForYouRootTitle";
_SPEC_LANG_TITLE_KEYS_[_ALERTS_]="WatchForModifsRootFolder";
_SPEC_LANG_TITLE_KEYS_[_ROOT_]=_SPEC_LANG_TITLE_KEYS_[_OLD_ROOT_]="RootTitle";
var extOnReadyInvoked=false,activityMonitor=null,rendered=false,embedded=!(config.resizeToScreen===true),showMaximizedButton=(htcConfig.showFullScreenOrExitFullScreenButton==true),asControl=!(config.control===false),uid=String(config.id||""),controlId=config.controlId||null,resizable=(config.resizable===true),draggable=(config.draggable===true),showHideIcon=(config.showHideIcon===true),hidden=(config.showOnLoad===false),modal=(config.modal===true),extEl=null,maxWidthThumb=maxHeightThumb=100,thumbnailTpl,globalLoadMask,isEmbeddedtoIFRAME=false,Msg,Window,pagingEnabled=false,logoBtn=config.logoBtn||{url:"",tooltip:"Your logo or link",icon:"Scripts/logo.png",showInNewWindow:false},logoHeader={html:""},welcome={title:"Welcome window",message:""},userHelpWindow,helpInNewPage=false,syncWebFoldersHelpWindow,offset=0,clipboard=new HttpCommander.Lib.Clipboard(),tree,selectFolderTree,styleName=htcConfig.styleName,selectPath=null,searchWindow,sharedSelectPath=null,sharedFYSelectPath=null,grid,gridStore,gridColModel,currentGridView="detailed",allowEdit=false,sharedGrid,sharedGridStore,sharedColModel,sharedGridPagingToolBar,sharedFYGrid,sharedFYGridStore,sharedFYColModel,sharedFYGridPagingToolBar,cardSwitchGrid,fileMenu,newSubMenu,versioningSubMenu,unzipSubMenu,copyMenu,moveMenu,menuActions,sharedFileMenu,toptbarConfig={},toptbar,toptbarButtons={},viewEditSubMenu,cloudsSubMenu,trashSubMenu,shareSubMenu,labelsMenu,watchSubMenu,moreSubMenu,view,detailsPane,editTextFileWindow,imageViewerWindow,flashViewerWindow,enableDnDUploader=false,enableMultipleUploader=false,dndZone,uploadWindow,officeEditor,officeTypeDetected=0,downloadToSkyDriveWindow,linkToFileFolderWindow,makePublicLinkWindow,viewLinksWindow,linksToWebFoldersWindow,sendEmailWindow,checkInWindow,versionHistoryWindow,zipContentWindow,downloadWindow,metadataWindow,showMetaDataInList=false,videoConvertWindow,playVideoFlashWindow,playVideoHtml5Window,playVideoJSWindow,playAudioHtml5Window,zipPromptWindow,unzipPromptWindow,shortcutWindow,cloudConvertWindow,itemDoubleClickEventDefined=false,googleDriveAuth,skyDriveAuth,dropboxAuth,boxAuth,downloadToGoogleWindow,editInGoogleWindow,editInMSOOWindow,editInOffice365Window,downloadToDropboxWindow,downloadToBoxWindow,isDemoMode=false,controlNavFolders=null,editOpenTxtButtons=[],msoEditButtons=[],oooEditButtons=[],charsGrid=[],watchModifsWindow=null,changesWatchWindow=null,initAndShowSearch=Ext.emptyFn,metadataProvider=null,keepColsOnViewRecents={datemodified:true,datecreated:false,dateaccessed:false},keepGridSort={sort:"name",dir:"ASC"};
if(!uid||typeof uid!=="string"||uid==""||uid.trim()==""){uid=HttpCommander.Lib.Utils.generateUniqueString()
}else{uid=uid.trim().replace(/[^a-zA-Z0-9-_]+/g,"_");
if(uid==="_"){uid=HttpCommander.Lib.Utils.generateUniqueString()
}}var fm={isRendered:function(){return rendered
},isEmbedded:function(){return embedded
},isControl:function(){return asControl
},instanceId:function(){return uid
},getElement:function(){return(extEl||{}).dom
},isHidden:function(){return hidden
},extOnReadyInvoked:function(){return extOnReadyInvoked
}};
var eventNames=["PreRender","Render","Show","Hide","LogOut","Destroy","ItemDoubleClick"];
var events={};
var callEventFn=function(nameFn,args){if(Ext.isObject(fm)&&typeof nameFn==="string"&&typeof events[nameFn]==="function"){var argsArray=[];
if(!!args&&Object.prototype.toString.apply(args)!=="[object Array]"){for(var i=1;
i<arguments.length;
i++){argsArray.push(arguments[i])
}}else{if(!!args){argsArray=args
}}argsArray.push(fm);
try{return events[nameFn].apply(fm,argsArray)
}catch(e){ProcessScriptError(e)
}}};
var onPreRender=function(){callEventFn("PreRender")
};
var onRender=function(){callEventFn("Render")
};
var onShow=function(){callEventFn("Show")
};
var onHide=function(){callEventFn("Hide")
};
var onLogOut=function(user,domain){callEventFn("LogOut",user,domain)
};
var onDestroy=function(){callEventFn("Destroy");
try{if(view&&view.destroy){view.destroy()
}if(fm){delete fm;
fm=undefined
}}catch(e){ProcessScriptError(e)
}};
var onItemDoubleClick=function(itemPath){callEventFn("ItemDoubleClick",itemPath)
};
var setEvent=function(eventName,func){if(typeof eventName=="string"&&eventNames.indexOf(eventName)!=-1&&typeof func=="function"){events[eventName]=func;
if(eventName==="LogOut"&&toptbarButtons.Logout){Ext.each(toptbarButtons.Logout,function(item){item.setVisible(true)
})
}if(eventName==="ItemDoubleClick"){itemDoubleClickEventDefined=true
}}};
fm.SetEvent=setEvent;
if(HttpCommander.Lib.Utils.browserIs.ios){helpInNewPage=true
}enableMultipleUploader=HttpCommander.Lib.Utils.browserIs.firefox36up||HttpCommander.Lib.Utils.browserIs.chrome2up||HttpCommander.Lib.Utils.browserIs.safari||HttpCommander.Lib.Utils.browserIs.ie10standard||HttpCommander.Lib.Utils.browserIs.ie11up||HttpCommander.Lib.Utils.browserIs.opera11up||HttpCommander.Lib.Utils.browserIs.yandex||HttpCommander.Lib.Utils.browserIs.edge;
enableDnDUploader=(function(){var testXHR=null,enabled=false;
try{enabled=htcConfig.enableDnDUploader&&(HttpCommander.Lib.Utils.browserIs.firefox4up||HttpCommander.Lib.Utils.browserIs.chrome6up||HttpCommander.Lib.Utils.browserIs.ie10standard||HttpCommander.Lib.Utils.browserIs.ie11up||HttpCommander.Lib.Utils.browserIs.opera11up||HttpCommander.Lib.Utils.browserIs.yandex||HttpCommander.Lib.Utils.browserIs.safari5up||HttpCommander.Lib.Utils.browserIs.edge10586up);
if(enabled){enabled=false;
testXHR=HttpCommander.Lib.Utils.getXhrInstance();
enabled=(typeof testXHR.upload!="undefined")&&(Ext.isFunction(window.FormData)||Ext.isObject(window.FormData))
}}catch(e){enabled=false;
ProcessScriptError(e)
}finally{if(testXHR){testXHR=null;
delete testXHR
}}return enabled
})();
supportsWebGlCanvasForAutodesk=HttpCommander.Lib.Utils.webglAvailable();
var $=function(elementId){return uid+"_"+elementId
};
var initQuickTips=function(){try{Ext.QuickTips.init()
}catch(e){ProcessScriptError(e)
}};
var showRefreshWarning=function(){try{Msg.show({title:htcConfig.locData.CommonWarningCaption,msg:htcConfig.locData.RefreshPageWarningMessage,buttons:Msg.YESNO,icon:Msg.QUESTION,fn:function(btn){if(btn=="yes"){window.location.reload(true)
}}})
}catch(e){ProcessScriptError(e)
}};
var showBalloon=function(text,fixed){if(!view){return null
}var tt=new Ext.Tip({autoHeight:true,width:400,baseCls:"x-tip",bodyCfg:{tag:"center"},renderTo:extEl,html:text});
var vpos=view.el.getTop()+offset,hpos=view.el.getLeft()+((view.el.getWidth()-400)/2);
tt.showAt([hpos,vpos]);
tt.el.disableShadow();
var height=tt.el.getHeight()+5;
if(!fixed){tt.el.animate({opacity:{to:1,from:1}},3,function(el){el.animate({opacity:{to:0,from:1}},3,function(el){el.remove();
offset-=height
},"easeOut","run")
},"easeOut","run");
offset+=height
}else{return tt.el
}};
var pathAppendFolder=function(path,name){if(Ext.isEmpty(path)||path.toLowerCase()=="root"||isRecentFolder(path,true)){return name
}if(path.length>0&&path[path.length-1]!="/"){path+="/"
}return path+name
};
var openUpLink=function(path){if(!Ext.isDefined(path)){path=getCurrentFolder()
}var i=(Ext.isEmpty(path)?-1:path.lastIndexOf("/")),newPath=(i<0?"root":path.substr(0,i)),curName=(i<0?path:path.substr(i+1));
if(!Ext.isEmpty(newPath)&&!Ext.isEmpty(curName)){selectPath={path:newPath,name:curName}
}openGridFolder(newPath,true)
};
var openTreeNode=function(path,reloadLastNode,forceHighlightCurrentFolderNode){if(!tree){return
}tree.openTreeNode(path,reloadLastNode,forceHighlightCurrentFolderNode)
};
var openTreeRecent=function(){if(!tree||!htcConfig.enableRecents){return
}};
var openTreeAlerts=function(){if(!tree||!htcConfig.enableRecents){return
}tree.openTreeNode(_ALERTS_,true)
};
var openAlertsFolder=function(forceReloadIfOpened){if(!(htcConfig.watchForModifs===true)){return
}if(forceReloadIfOpened||getCurrentFolder().toLowerCase()!=_ALERTS_){openGridFolder(_ALERTS_)
}};
var openSharedByLink=function(){if(htcConfig.sharedInTree){openGridFolder(_SHARED_,true,true);
openTreeNode(_SHARED_,true);
return true
}else{return false
}};
var openSharedForYou=function(){if(htcConfig.sharedForYou){openGridFolder(_SHARED_FOR_YOU_,true,true);
openTreeNode(_SHARED_FOR_YOU_,true);
return true
}else{return false
}};
var openTrash=function(onlyGrid){if(htcConfig.enableTrash){if(onlyGrid===true){openGridFolder(_TRASH_)
}else{openGridFolder(_TRASH_,true,true)
}}};
var reloadTreeNodeIfOpened=function(pathStr){if(!tree){return
}tree.reloadTreeNodeIfOpened(pathStr)
};
var getFolderTitle=function(path,curFolder){if(Ext.isEmpty(path)||path.trim().length==0||path.toLowerCase()=="root"){return htcConfig.locData.RootTitle
}if(typeof curFolder!="undefined"){if(isRecentFolder(curFolder)){if(isRecentFolder(path)){return htcConfig.locData.RecentRootTitle
}else{return(htcConfig.recentGroups[path]||path)
}}}else{if(isRecentFolder(path)){return htcConfig.locData.RecentRootTitle
}else{if(isRecentFolder()){return(htcConfig.recentGroups[path]||path)
}}}if(_SPEC_LANG_TITLE_KEYS_.hasOwnProperty(path)){return htcConfig.locData[_SPEC_LANG_TITLE_KEYS_[path]]
}return path
};
var openGridFolder=function(path,reloadTree,reloadLastNode,fromControlNav,keepCurrentPage){var curPage=1,pd;
if(htcConfig.sharedForYou&&isSharedForYouTreeFolder(path)){if(cardSwitchGrid&&sharedFYGrid){if(!!detailsPane){detailsPane.prepareData()
}cardSwitchGrid.getLayout().setActiveItem(sharedGrid?2:1);
view.doLayout();
if(pagingEnabled){curPage=1;
if(keepCurrentPage===true){pd=sharedFYGrid.getBottomToolbar();
if(!!pd){pd=pd.getPageData()
}else{pd=null
}curPage=!pd?1:pd.activePage;
if(curPage<1){curPage=1
}}var pars={start:(curPage-1)*htcConfig.itemsPerPage,limit:htcConfig.itemsPerPage,path:path};
if(sharedFYGridStore.baseParams.sort){pars.sort=sharedFYGridStore.baseParams.sort
}if(sharedFYGridStore.baseParams.dir){pars.dir=sharedFYGridStore.baseParams.dir
}sharedFYGridStore.storeOptions(pars);
sharedFYGridStore.load({params:pars})
}else{sharedFYGridStore.reload()
}}else{Msg.alert(htcConfig.locData.CommonErrorCaption,"Grid for view shared foy you public links is not prepared!");
return
}}else{if(htcConfig.sharedInTree&&isSharedTreeFolder(path)){if(cardSwitchGrid&&sharedGrid){if(!!detailsPane){detailsPane.prepareData()
}cardSwitchGrid.getLayout().setActiveItem(1);
view.doLayout();
sharedGridStore.setBaseParam("linkPath",null);
if(pagingEnabled){curPage=1;
if(keepCurrentPage===true){pd=sharedGrid.getBottomToolbar();
if(!!pd){pd=pd.getPageData()
}else{pd=null
}curPage=!pd?1:pd.activePage;
if(curPage<1){curPage=1
}}var pars={start:(curPage-1)*htcConfig.itemsPerPage,limit:htcConfig.itemsPerPage,path:path};
if(sharedGridStore.baseParams.sort){pars.sort=sharedGridStore.baseParams.sort
}if(sharedGridStore.baseParams.dir){pars.dir=sharedGridStore.baseParams.dir
}sharedGridStore.storeOptions(pars);
sharedGridStore.load({params:pars})
}else{sharedGridStore.reload()
}}else{Msg.alert(htcConfig.locData.CommonErrorCaption,"Grid for view public links is not prepared!");
return
}}else{if(gridStore){if(cardSwitchGrid){cardSwitchGrid.getLayout().setActiveItem(0);
view.doLayout()
}gridStore.reloadTree=null;
if(reloadTree===true){gridStore.reloadTree=function(){openTreeNode(path,reloadLastNode)
}
}else{if(typeof reloadTree=="string"&&reloadTree.length>0){gridStore.reloadTree=function(){openTreeNode(reloadTree,reloadLastNode)
}
}}if(path){while(path[path.length-1]=="/"||path[path.length-1]=="\\"||path[path.length-1]==" "){path=path.substring(0,path.length-1)
}}var newIsRecent=isRecentFolder(path);
grid.toggledRecent=(isRecentFolder()!=newIsRecent);
var oldPath=gridStore.baseParams.path.toLowerCase();
gridStore.setBaseParam("path",path);
if(pagingEnabled){curPage=1;
if(keepCurrentPage===true){pd=grid.getBottomToolbar();
if(!!pd){pd=pd.getPageData()
}else{pd=null
}curPage=!pd?1:pd.activePage;
if(curPage<1){curPage=1
}}var pars={start:(curPage-1)*htcConfig.itemsPerPage,limit:htcConfig.itemsPerPage,path:path};
if(grid.toggledRecent){if(newIsRecent){pars.sort="daterecent";
pars.dir="DESC"
}else{pars.sort=keepGridSort.sort;
pars.dir=keepGridSort.dir
}gridStore.storeOptions(pars);
gridStore.sort(pars.sort,pars.dir)
}else{if(gridStore.baseParams.sort){pars.sort=gridStore.baseParams.sort
}if(gridStore.baseParams.dir){pars.dir=gridStore.baseParams.dir
}gridStore.load({params:pars})
}}else{if(grid.toggledRecent){if(newIsRecent){gridStore.sort("daterecent","DESC")
}else{gridStore.sort(keepGridSort.sort,keepGridSort.dir)
}}else{gridStore.reload()
}}}}}if(!fromControlNav&&controlNavFolders&&typeof controlNavFolders.pushFolder=="function"){controlNavFolders.pushFolder(path)
}};
var getCurrentFolder=function(){var isShared=!!sharedGrid&&sharedGrid.rendered&&!sharedGrid.hidden;
var isSharedForYou=!!sharedFYGrid&&sharedFYGrid.rendered&&!sharedFYGrid.hidden;
return isShared?_SHARED_:isSharedForYou?_SHARED_FOR_YOU_:((!!gridStore&&gridStore.baseParams)?gridStore.baseParams.path:null)
};
var getAvatarHtml=function(userName,hideWrap){return HttpCommander.Lib.Utils.getAvatarHtml(userName,htcConfig.avatarColors,htcConfig.maxAbbrLen,hideWrap)
};
var isSpecialTreeFolderOrSubFolder=function(path){var len=_SPEC_TREE_FOLDER_NAMES_.length,i=0;
if(!Ext.isDefined(path)){path=getCurrentFolder()
}if(Ext.isEmpty(path)){return false
}path=path.toLowerCase();
if(_SPEC_TREE_FOLDER_NAMES_.indexOf(path)>=0){return true
}path="/"+path+"/";
for(;
i<len;
++i){if(path.indexOf("/"+_SPEC_TREE_FOLDER_NAMES_[i]+"/")>=0){return true
}}return false
};
var isAlertsFolder=function(folderPath){if(!htcConfig.watchForModifs){return false
}if(!Ext.isDefined(folderPath)){folderPath=getCurrentFolder()
}if(Ext.isEmpty(folderPath)){return false
}return folderPath.toLowerCase()==_ALERTS_
};
var isSharedTreeFolder=function(folderPath){if(!htcConfig.sharedInTree){return false
}if(!Ext.isDefined(folderPath)){folderPath=getCurrentFolder()
}if(Ext.isEmpty(folderPath)){return false
}return folderPath.toLowerCase()==_SHARED_
};
var isSharedForYouTreeFolder=function(folderPath){if(!htcConfig.sharedForYou){return false
}if(!Ext.isDefined(folderPath)){folderPath=getCurrentFolder()
}return folderPath.toLowerCase()==_SHARED_FOR_YOU_
};
var isRecentFolder=function(folderPath,checkOnlyOnSubfolder){if(!Ext.isDefined(folderPath)){folderPath=getCurrentFolder()
}if(Ext.isEmpty(folderPath)){return false
}var isRcnt=(folderPath.toLowerCase().indexOf(_RECENT_)==0);
if(checkOnlyOnSubfolder===true&&isRcnt){return folderPath.indexOf("/")>0
}return isRcnt
};
var isTrashFolder=function(folderPath){if(!Ext.isDefined(folderPath)){folderPath=getCurrentFolder()
}if(Ext.isEmpty(folderPath)){return false
}return folderPath.toLowerCase()==_TRASH_
};
var isRootFolder=function(folderPath){if(!Ext.isDefined(folderPath)){folderPath=getCurrentFolder()
}if(Ext.isEmpty(folderPath)){return true
}return(folderPath.toLowerCase()==_ROOT_)||(folderPath.toLowerCase()==_OLD_ROOT_)
};
var getParamValue=function(paramName,paramType,defaultValue,forceReturnFromQuery){if(typeof defaultValue=="undefined"){defaultValue=null
}if(typeof paramName=="undefined"||!paramName){return defaultValue
}paramName=String(paramName).trim();
if(paramName.length==0){return defaultValue
}var result;
try{result=HttpCommander.Lib.Utils.queryString(paramName)
}catch(e){}if(typeof result!="undefined"&&result!=null){if(paramType==="boolean"){if((result=result.toLowerCase().trim())==="true"){return true
}else{if(result==="false"){return false
}else{result=forceReturnFromQuery?defaultValue:null
}}}else{if(paramType==="string"){if((result=String(result).trim())==""){result=forceReturnFromQuery===true?defaultValue:null
}}}}return forceReturnFromQuery===true?result:(result||(htcConfig&&htcConfig[paramName]?htcConfig[paramName]:defaultValue))
};
var getParamBooleanValue=function(paramName){return getParamValue(paramName,"boolean",false)
};
var getHideTreeValue=function(){return getParamBooleanValue("hideTree")
};
var getHideDetailsPaneValue=function(){var de=HttpCommander.Lib.Utils.getCookie($("detailsexpanded"));
if(!Ext.isEmpty(de)&&(de=="false"||de=="true")){return(de=="false")
}return getParamBooleanValue("hideDetailsPane")
};
var getTreeViewValue=function(){return getParamValue("TreeView","string","notautoexpandable").toLowerCase()
};
var downloadFile=function(record,path){if(htcConfig.currentPerms&&htcConfig.currentPerms.download){var fileName=encodeURIComponent(record.data.name),filePath=encodeURIComponent(path),ext=HttpCommander.Lib.Utils.getFileExtension(record.data.name);
if(ext==="swf"&&htcConfig.openSWFonDownload){var suffix=HttpCommander.Lib.Utils.browserIs.ie?("/"+fileName):"";
window.open(htcConfig.relativePath+"Handlers/Download.ashx"+suffix+"?action=download&file="+filePath+"/"+fileName,"_blank")
}else{window.location.href=htcConfig.relativePath+"Handlers/Download.ashx?action=download&file="+filePath+"/"+fileName
}if(htcConfig.enableRecents){setTimeout(openTreeRecent,1000)
}}};
var linkToFile=function(record,path){return linkToFileByVirtPath(virtualFilePath(record,path))
};
var linkToFileByName=function(fileName,folderPath){return linkToFileByVirtPath(folderPath+"/"+fileName)
};
var linkToFolderByName=function(folderName,folderPath){return linkToOpenFolderByVirtPath(folderPath+"/"+folderName)
};
var linkToFileByVirtPath=function(virtpath){var suffix="";
if(virtpath){var vpParts=virtpath.split("/");
var fName=vpParts[vpParts.length-1];
var ext=HttpCommander.Lib.Utils.getFileExtension(fName);
if(ext==="swf"&&htcConfig.openSWFonDownload&&HttpCommander.Lib.Utils.browserIs.ie){suffix="/"+encodeURIComponent(fName)
}}return appRootUrl+"Handlers/Download.ashx"+suffix+"?file="+encodeURIComponent(virtpath)+"&action=download"
};
var linkToOpenFolderByVirtPath=function(virtPath){return appRootUrl+"Default.aspx?folder="+encodeURIComponent(virtPath)
};
var linkToSelectFileByVirtPath=function(virtPath){return appRootUrl+"Default.aspx?file="+encodeURIComponent(virtPath)
};
var virtualFilePath=function(record,path){if(record){return path+"/"+record.data.name
}else{return path
}};
var viewFile=function(record,path){var encName=encodeURIComponent(record.data.name),dt=Ext.isDate(record.data.datemodified)?record.data.datemodified.getTime():(new Date()).getTime(),url=htcConfig.relativePath+"Handlers/Download.ashx/"+encName+"?action=view&file="+encodeURIComponent(path)+"/"+encName+"&date="+dt;
var viewWin=window.open(url,"viewinbpopup"+(new Date()).getTime(),HttpCommander.Lib.Utils.getPopupProps());
if(!viewWin){window.alert(htcConfig.locData.ViewPopupBlocked)
}else{try{viewWin.focus()
}catch(e){}if(htcConfig.enableRecents){setTimeout(openTreeRecent,1000)
}}};
var openShortcut=function(path,name,refreshLastFolder){globalLoadMask.msg=htcConfig.locData.OpeningShortcutProgress+"...";
globalLoadMask.show();
HttpCommander.Common.OpenShortcut({path:path,name:name},function(data,trans){globalLoadMask.hide();
globalLoadMask.msg=htcConfig.locData.ProgressLoading+"...";
if(typeof data=="undefined"){Msg.alert(htcConfig.locData.CommonErrorCaption,Ext.util.Format.htmlEncode(trans.message));
if(refreshLastFolder===true){openGridFolder(getCurrentFolder())
}return
}if(!data.success){Msg.alert(htcConfig.locData.CommonErrorCaption,data.message);
if(refreshLastFolder===true){openGridFolder(getCurrentFolder())
}return
}if(!data.folder){selectPath={name:"",path:""};
selectPath.name=data.name;
selectPath.path=data.path
}openGridFolder(data.path,true)
})
};
var editOrViewPublicLinks=function(index){var record=grid.getStore().getAt(index),curFolder=getCurrentFolder(),newPath;
if(record&&(record.data.rowtype=="folder"||record.data.rowtype=="file")){newPath=pathAppendFolder(curFolder,record.data.name);
if(record.data.publiclinks==1){globalLoadMask.msg=htcConfig.locData.ProgressGettingAnonymLinks+"...";
globalLoadMask.show();
HttpCommander.Common.GetAnonymLink({path:newPath},function(data,trans){globalLoadMask.hide();
globalLoadMask.msg=htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(data,trans,Msg,htcConfig)){if(data.link){var row=data.link,isFolder=row.isfolder,p=row.acl,hp=row.perms,anonPerm={download:{checked:p&&(p&2)!=0&&(!isFolder||(p&1)!=0)},upload:{checked:isFolder&&p&&(p&4)!=0},view:{checked:isFolder&&p&&(p&1)!=0},zip:{checked:isFolder&&p&&(p&8)!=0}},onlyZip=anonPerm.zip.checked&&!anonPerm.upload.checked&&!anonPerm.view.checked;
anonPerm.download.disabled=!isFolder||onlyZip||!(hp&&hp.download&&hp.anonymDownload);
anonPerm.upload.disabled=!isFolder||onlyZip||!(hp&&hp.upload&&hp.anonymUpload);
anonPerm.view.disabled=!isFolder||onlyZip||!(hp&&(hp.listFiles||hp.listFolders)&&hp.anonymViewContent);
anonPerm.zip.disabled=!isFolder||!(hp&&hp.zipDownload&&hp.anonymDownload);
anonPerm.modify=hp&&hp.modify;
if(anonPerm.download.disabled){anonPerm.download.checked=false
}if(anonPerm.upload.disabled){anonPerm.upload.checked=false
}if(anonPerm.view.disabled){anonPerm.view.checked=false
}if(anonPerm.zip.disabled){anonPerm.zip.checked=false
}try{row.date=new Date(row.date*1000);
row.expires=new Date(row.expires*1000)
}catch(err){}prepareAndShowMakePublicLinkWindow(newPath,isFolder,anonPerm,row,true)
}}})
}else{if(record.data.publiclinks>1){initAndShowViewLinksWindow(newPath,true)
}}}};
var sharedGridRowAction=function(index,e){if(sharedGrid){var record=sharedGrid.getStore().getAt(index);
if(record&&record.data.rowtype=="uplink"){openGridFolder("root",true)
}}};
var sharedFYGridRowAction=function(index,e){if(sharedFYGrid){var record=sharedFYGrid.getStore().getAt(index);
if(record&&record.data.rowtype=="uplink"){openGridFolder("root",true)
}}};
var gridRowAction=function(index,e){grid.needReloadTree=null;
var record=grid.getStore().getAt(index),curFolder=getCurrentFolder(),newPath,isRcnt=false,isTrh=false,isShr=false,isAlerts=false,isShrFY=false;
if(record.data.srowtype=="alert"){initAndShowChangesWatchWindow({id:record.data.watchForModifs.id,emails:record.data.watchForModifs.emails,path:record.data.name,is_folder:record.data.rowtype!="file",iown:(record.data.watchForModifs.iown===true),users:record.data.watchForModifs.users,actions:record.data.watchForModifs.actions})
}else{if(record.data.rowtype=="folder"||record.data.rowtype=="rootfolder"||(isTrh=(record.data.rowtype=="trashroot"))||(isRcnt=(record.data.rowtype=="recentroot"))||(isShr=(record.data.rowtype=="sharedroot"))||(isShrFY=(record.data.rowtype=="sharedforyouroot"))||(isAlerts=(record.data.rowtype=="alertsroot"))){newPath=(isRcnt||isTrh||isShr||isAlerts||isShrFY)?record.data.path:(record.data.srowtype=="recentgroup")?pathAppendFolder(curFolder,(""+record.data.recentgroup)):pathAppendFolder(curFolder,record.data.name);
if(isRecentFolder(curFolder)){isRcnt=true;
newPath=pathAppendFolder(record.data.path,(record.data.srowtype=="recentgroup")?(""+record.data.recentgroup):record.data.name)
}openGridFolder(newPath,true,isRcnt||isTrh||isAlerts)
}else{if(record.data.rowtype=="uplink"){openUpLink(curFolder)
}else{if(record.data.rowtype=="file"){var ext=HttpCommander.Lib.Utils.getFileExtension(record.data.name),_ext_=";"+ext+";";
if(record.data.srowtype=="recent"){newPath=record.data.path;
selectPath={};
selectPath.name=record.data.name;
selectPath.path=record.data.path;
selectPath.recent=true;
openGridFolder(newPath,true,true)
}else{if(ext=="lnk"){openShortcut(curFolder,record.data.name)
}else{if(ext=="url"||(htcConfig.googleDriveFileTypes&&htcConfig.googleDriveFileTypes.indexOf(_ext_)>=0)){menuActions.viewInService("shortcut")
}else{var dca="showmenu";
if(htcConfig.doubleClickAction){dca=htcConfig.doubleClickAction
}switch(dca){case"download":if(htcConfig.currentPerms&&htcConfig.currentPerms.download){downloadFile(record,curFolder)
}break;
case"showmenu":var selModel=grid.getSelectionModel();
if(!selModel.isSelected(index)){selModel.selectRow(index,false)
}if(fileMenu){if(e.getXY){fileMenu.showAt(e.getXY())
}else{var firstCell=grid.getView().getCell(index,0);
if(firstCell){var pos=HttpCommander.Lib.Utils.offsetPosition(firstCell);
pos[0]+=firstCell.offsetWidth/2;
pos[1]+=firstCell.offsetHeight/2;
fileMenu.showAt(pos)
}}}break;
case"view":var viewAllowed=htcConfig.currentPerms&&htcConfig.currentPerms.download;
if(viewAllowed){viewAllowed=HttpCommander.Lib.Utils.isAllowedForViewingInBrowser(record.data.name,htcConfig);
if(viewAllowed){viewFile(record,curFolder)
}else{downloadFile(record,curFolder)
}}break
}}}}}}}}};
var gridItemExists=function(name){var ind=grid.getStore().findBy(function(rec,id){return rec.get("name").toLowerCase()==name.toLowerCase()
});
return ind!=-1
};
var isExtensionAllowed=function(fileName,forCreate){if(!htcConfig.currentPerms){return false
}if(forCreate==null||forCreate==undefined){forCreate=true
}var cr=forCreate?htcConfig.currentPerms.createRestriction:htcConfig.currentPerms.listRestriction;
var ext=/\.\w+$/i.exec(fileName);
if(!ext){ext=""
}else{ext=ext[0].substring(1).toUpperCase()
}return(cr.type==1&&cr.extensions.indexOf(ext)==-1)||(cr.type==0&&cr.extensions.indexOf(ext)>=0)
};
var getRestrictionMessage=function(forCreate){if(!htcConfig.currentPerms){return""
}if(forCreate==null||forCreate==undefined){forCreate=true
}var cr=forCreate?htcConfig.currentPerms.createRestriction:htcConfig.currentPerms.listRestriction;
var exts="";
Ext.each(cr.extensions,function(ext){if(exts.length>0){exts+=" "
}exts+=ext
});
if(cr.type==0){return String.format(htcConfig.locData.ClientPermissionsAllowTypes,exts)
}else{return String.format(htcConfig.locData.ClientPermissionsDenyTypes,exts)
}};
var isModifyAllowed=function(){if(!htcConfig.currentPerms){return false
}return htcConfig.currentPerms.modify
};
var dragDropPermission=function(nodeFrom,nodeTo){var move=copy=create=zip=del=shareFile=shareFolder=false;
if(nodeFrom){try{var nodeFromPerms=eval("("+nodeFrom.attributes.permissions+")");
if(nodeFromPerms){move=nodeFromPerms.cut;
copy=nodeFromPerms.copy;
del=nodeFromPerms.del&&htcConfig.enableTrash;
shareFolder=(htcConfig.sharedInTree&&htcConfig.enablePublicLinkToFolder&&(((nodeFromPerms.download||nodeFromPerms.zipDownload)&&nodeFromPerms.anonymDownload)||(nodeFromPerms.upload&&nodeFromPerms.anonymUpload)||((nodeFromPerms.listFiles||nodeFromPerms.listFolders)&&nodeFromPerms.anonymViewContent)))
}}catch(e){}}else{if(htcConfig.currentPerms){var cps=htcConfig.currentPerms;
move=cps.cut;
copy=cps.copy;
del=cps.del&&htcConfig.enableTrash;
shareFile=(htcConfig.sharedInTree&&htcConfig.enablePublicLinkToFile&&cps.download&&cps.anonymDownload);
shareFolder=(htcConfig.sharedInTree&&htcConfig.enablePublicLinkToFolder&&(((cps.download||cps.zipDownload)&&cps.anonymDownload)||(cps.upload&&cps.anonymUpload)||((cps.listFiles||cps.listFolders)&&cps.anonymViewContent)))
}}if(nodeTo){if(Ext.isObject(nodeTo.data)){create=htcConfig.currentPerms&&htcConfig.currentPerms.create;
zip=htcConfig.currentPerms&&htcConfig.currentPerms.zip;
if(del){del=isTrashFolder(nodeTo.data.path)
}if(!isSharedTreeFolder(nodeTo.data.path)){shareFile=false;
shareFolder=false
}}else{if(Ext.isObject(nodeTo.attributes)){try{var nodeToPerms=eval("("+nodeTo.attributes.permissions+")");
if(nodeToPerms){create=nodeToPerms.create
}}catch(e){}if(del){del=isTrashFolder(nodeTo.attributes.path)
}if(!isSharedTreeFolder(nodeTo.attributes.path)){shareFile=false;
shareFolder=false
}}}}else{shareFile=false;
shareFolder=false;
if(htcConfig.currentPerms){create=htcConfig.currentPerms.create;
zip=htcConfig.currentPerms.zip
}else{if(del){del=isTrashFolder()
}}}return{allow:(create&&(move||copy))||del||shareFile||shareFolder||zip,create:create,move:move,copy:copy,moveOrCopy:move||copy,onlyMoveOrCopy:(move&&!copy)||(copy&&!move),zip:zip,dnd:create&&(move||copy),del:del,shareFile:shareFile,shareFolder:shareFolder,share:(shareFile||shareFolder)}
};
var getSelectedFiles=function(){var grd=grid;
if(!grd||!grd.rendered||grd.hidden){return{files:[],folders:[]}
}var selectedRecords=grd.getSelectionModel().getSelections();
var fileArray=new Array();
var folderArray=new Array();
Ext.each(selectedRecords,function(el){if(el.data.rowtype=="file"){fileArray.push(el.data.name)
}else{if(el.data.rowtype=="folder"){folderArray.push(el.data.name)
}}});
return{files:fileArray,folders:folderArray}
};
var createSelectedSet=function(grd,curFolder,forceClearTrash){if(forceClearTrash===true){return{path:_TRASH_,files:null,folders:null,filesCount:-1,foldersCount:-1}
}grd=grd||grid;
var selectedRecords=grid.getSelectionModel().getSelections();
var fileArray=new Array();
var folderArray=new Array();
var isRecent=isRecentFolder(curFolder);
var isTrash=isTrashFolder(curFolder);
Ext.each(selectedRecords,function(el){var name=isRecent?el.data.path:isTrash?el.data.trashname:el.data.name;
if(isRecent){if(Ext.isEmpty(name)){name=el.data.name
}else{if(!Ext.isEmpty(el.data.name)){name+="/"+el.data.name
}}}if(el.data.rowtype=="folder"){folderArray.push(name)
}else{if(el.data.rowtype=="file"){fileArray.push(name)
}}});
var selectedSet={};
selectedSet.path=curFolder;
selectedSet.files=eval(Ext.util.JSON.encode(fileArray));
selectedSet.folders=eval(Ext.util.JSON.encode(folderArray));
selectedSet.filesCount=fileArray.length;
selectedSet.foldersCount=folderArray.length;
return selectedSet
};
var createDraggedSet=function(selectedRecords,curFolder,moveToTrash){moveToTrash=htcConfig.enableTrash&&moveToTrash;
var fileArray=new Array();
var folderArray=new Array();
Ext.each(selectedRecords,function(el){if(el.data.rowtype=="folder"){folderArray.push(el.data.name)
}else{if(el.data.rowtype=="file"){fileArray.push(el.data.name)
}}});
var selectedSet={};
selectedSet.path=curFolder;
selectedSet.files=eval(Ext.util.JSON.encode(fileArray));
selectedSet.folders=eval(Ext.util.JSON.encode(folderArray));
selectedSet.filesCount=fileArray.length;
selectedSet.foldersCount=folderArray.length;
return selectedSet
};
var dropDraggedSet=function(dropTargetRow){if(!clipboard.enabled){return
}var isNode=false;
var curFolder;
if(dropTargetRow){if(dropTargetRow.attributes){isNode=true;
curFolder=dropTargetRow.attributes.path;
clipboard.newPath=curFolder
}else{if(!dropTargetRow.data||(dropTargetRow.data.rowtype!="folder"&&dropTargetRow.data.rowtype!="uplink")){return
}else{curFolder=getCurrentFolder();
if(dropTargetRow.data.rowtype=="folder"){clipboard.newPath=curFolder+"/"+dropTargetRow.data.name
}else{if(curFolder.lastIndexOf("/")>-1){clipboard.newPath=curFolder.substring(0,curFolder.lastIndexOf("/"))
}else{return
}}}}}else{curFolder=getCurrentFolder();
clipboard.newPath=curFolder
}if(asControl){clipboard.control=true
}globalLoadMask.msg=clipboard.isCut?htcConfig.locData.ProgressMoving+"...":htcConfig.locData.ProgressCopying+"...";
globalLoadMask.show();
HttpCommander.Common.Paste(clipboard,function(data,trans){globalLoadMask.hide();
globalLoadMask.msg=htcConfig.locData.ProgressLoading+"...";
if(typeof data=="undefined"){clipboard.clear();
Msg.alert(htcConfig.locData.CommonErrorCaption,Ext.util.Format.htmlEncode(trans.message));
return
}var tip="";
if(data.filesProcessed>0){tip+=String.format(clipboard.isCut?htcConfig.locData.BalloonFilesMoved:htcConfig.locData.BalloonFilesCopied,data.filesProcessed)
}if(data.foldersProcessed>0){if(tip!=""){tip+="<br />"
}tip+=String.format(clipboard.isCut?htcConfig.locData.BalloonFoldersMoved:htcConfig.locData.BalloonFoldersCopied,data.foldersProcessed)
}var filesFailed=clipboard.filesCount-data.filesProcessed;
if(filesFailed>0){if(tip!=""){tip+="<br />"
}tip+=String.format(htcConfig.locData.BalloonFilesFailed,filesFailed)
}var foldersFailed=clipboard.foldersCount-data.foldersProcessed;
if(foldersFailed>0){if(tip!=""){tip+="<br />"
}tip+=String.format(htcConfig.locData.BalloonFoldersFailed,foldersFailed)
}var srcPath=clipboard.srcPath;
if(!data.success){Msg.alert(htcConfig.locData.CommonErrorCaption,data.message)
}else{if(data.foldersProcessed>0&&srcPath&&clipboard.isCut&&data.warning!==true){reloadTreeNodeIfOpened(srcPath)
}}showBalloon(tip);
if(data.warning===true){showRefreshWarning()
}else{var folder=getCurrentFolder();
if(clipboard.isCut){for(var i=0;
i<clipboard.folders.length;
i++){if(srcPath&&(srcPath+"/"+clipboard.folders[i])==folder){folder=clipboard.newPath;
break
}}}if(isNode||data.foldersProcessed>0){openGridFolder(folder,curFolder,srcPath&&srcPath.indexOf(curFolder)!=0)
}else{openGridFolder(folder)
}}clipboard.clear()
})
};
var dropDraggedToTrash=function(dropTargetRow,draggedSet){var isNode=false;
var curFolder;
if(dropTargetRow){if(dropTargetRow.attributes){isNode=true;
if(!isTrashFolder(dropTargetRow.attributes.path)){return
}}else{if(!dropTargetRow.data||dropTargetRow.data.rowtype!="trashroot"){return
}}}else{if(!isTrashFolder()){return
}}if(!menuActions){initMenuActions()
}if(!!menuActions){menuActions.deleteSelectedItems(false,draggedSet)
}};
var dropDraggedToZip=function(dropTargetRow){if(!clipboard.enabled){return
}if(!dropTargetRow||!dropTargetRow.data||HttpCommander.Lib.Utils.getFileExtension(dropTargetRow.data.name)!="zip"){return
}var curFolder=getCurrentFolder();
clipboard.newPath=curFolder;
clipboard.zipname=dropTargetRow.data.name;
var oldAT=Ext.Ajax.timeout;
Ext.Ajax.timeout=HttpCommander.Lib.Consts.zipRequestTimeout;
globalLoadMask.msg=htcConfig.locData.ProgressZipping+"...";
globalLoadMask.show();
HttpCommander.Common.AppendToZip(clipboard,function(data,trans){Ext.Ajax.timeout=oldAT;
globalLoadMask.hide();
globalLoadMask.msg=htcConfig.locData.ProgressLoading+"...";
if(typeof data=="undefined"){Msg.alert(htcConfig.locData.CommonErrorCaption,Ext.util.Format.htmlEncode(trans.message));
return
}var tip="";
if(typeof data.filesZipped=="undefined"){data.filesZipped=0
}if(typeof data.foldersZipped=="undefined"){data.foldersZipped=0
}if(data.filesAdded>0){tip+=String.format(htcConfig.locData.BalloonFilesZipped,data.filesAdded)
}if(data.foldersAdded>0){if(tip!=""){tip+="<br />"
}tip+=String.format(htcConfig.locData.BalloonFoldersZipped,data.foldersAdded)
}var filesFailed=clipboard.filesCount-data.filesAdded;
if(filesFailed>0){if(tip!=""){tip+="<br />"
}tip+=String.format(htcConfig.locData.BalloonFilesFailed,filesFailed)
}var foldersFailed=clipboard.foldersCount-data.foldersAdded;
if(foldersFailed>0){if(tip!=""){tip+="<br />"
}tip+=String.format(htcConfig.locData.BalloonFoldersFailed,foldersFailed)
}showBalloon(tip);
if(!data.success){Msg.alert(htcConfig.locData.CommonErrorCaption,data.msg)
}if(!Ext.isEmpty(data.zipname)&&!Ext.isEmpty(data.zippath)){selectPath={};
selectPath.name=data.zipname;
selectPath.path=data.zippath
}clipboard.clear();
openGridFolder(Ext.isEmpty(data.zippath)?curFolder:data.zippath)
})
};
var dropDraggedForShare=function(selectedRecord,srcPath,perms){var virtPath=!Ext.isEmpty(srcPath)?virtualFilePath(selectedRecord,srcPath):selectedRecord.data.name;
var isFolder=selectedRecord.data.rowtype=="folder";
var anonPerm={download:{},upload:{checked:isFolder&&(perms&&perms.upload&&perms.anonymUpload)},view:{checked:isFolder&&(perms&&(perms.listFiles||perms.listFolders)&&perms.anonymViewContent)},zip:{checked:isFolder?(perms&&perms.zipDownload&&perms.anonymDownload):false}};
anonPerm.download.checked=isFolder?(anonPerm.view.checked&&perms&&perms.download&&perms.anonymDownload):true;
anonPerm.download.disabled=!isFolder||!anonPerm.download.checked;
anonPerm.upload.disabled=!isFolder||!anonPerm.upload.checked;
anonPerm.view.disabled=!isFolder||!anonPerm.view.checked;
anonPerm.zip.disabled=!isFolder||!anonPerm.zip.checked;
anonPerm.modify=perms&&perms.modify;
anonPerm.upload.checked=false;
prepareAndShowMakePublicLinkWindow(virtPath,isFolder,anonPerm)
};
var initOfficeEditor=function(){if(!officeEditor){officeEditor=HttpCommander.Lib.OfficeEditor({htcConfig:htcConfig,Window:Window,Msg:Msg,getUid:function(){return uid
},getAppRootUrl:function(){return appRootUrl
},"$":$,ProcessScriptError:ProcessScriptError,getOfficeTypeDetected:function(){return officeTypeDetected
},setOfficeTypeDetected:function(v){officeTypeDetected=v
},getFileManagerInstance:function(){return fm
},showBalloon:showBalloon})
}return officeEditor
};
var openInMsoOldWay=function(){var officeEditor=initOfficeEditor();
menuActions.editInMsoOoo(true,officeEditor.OpenFile)
};
var openInMsoNewWay=function(fileUrl){var row=getSelTypeFilesModel(grid)["selModel"].getSelected(),rowData=row?row.data:{},scheme=HttpCommander.Lib.Utils.getMSOfficeUriScheme(rowData.name),url,editOrViewFlag;
if(scheme){if(HttpCommander.Lib.Utils.browserIs.mac){fileUrl=fileUrl.replace(/%23/g,"%2523");
if(scheme=="ms-word"){fileUrl=fileUrl.replace(/#/g,"%23").replace(/%/g,"%25")
}}else{fileUrl=fileUrl.replace(/%/g,"%25").replace(/#/g,"%23")
}if((!htcConfig.currentPerms||!htcConfig.currentPerms.modify)&&!htcConfig.anonymousEditingOffice){editOrViewFlag="v"
}else{editOrViewFlag="e"
}url=scheme+":of"+editOrViewFlag+encodeURIComponent("|u|")+fileUrl;
if(HttpCommander.Lib.Utils.browserIs.chrome&&HttpCommander.Lib.Utils.browserIs.mac){url=url.split(" ").join("%20")
}HttpCommander.Lib.Utils.launchCustomProtocol(url,function(result){if(!result){openInMsoOldWay()
}})
}else{openInMsoOldWay()
}};
var showUploadWindow=function(tabId){if(!uploadWindow){initUploaders()
}uploadWindow.setActiveUpload(tabId);
uploadWindow.show()
};
var initMainDropZone=function(){if(enableDnDUploader!==true){return
}if(!dndZone){dndZone=new HttpCommander.Lib.DragAndDropZone({htcConfig:htcConfig,getExtEl:function(){return extEl
},getDragAndDropFormPanel:function(){return uploadWindow?uploadWindow.getDragAndDropFormPanel():null
},ProcessScriptError:ProcessScriptError,getView:function(){return view
},isUploadWindowVisible:function(){return !!uploadWindow&&uploadWindow.rendered&&!uploadWindow.hidden
},getGrid:function(){return !!grid&&grid.rendered&&!grid.hidden?grid:null
},getTree:function(){return !!tree&&tree.rendered&&!tree.hidden?tree:null
},openGridFolder:openGridFolder,getCurrentFolder:getCurrentFolder,showUploadWindow:function(){showUploadWindow("dnd-upload-tab")
}});
dndZone.addDnDEvents()
}};
var initUploaders=function(show){show=(show===true);
if(uploadWindow&&show&&uploadWindow.show){uploadWindow.show();
return
}try{uploadWindow=HttpCommander.Lib.UploadWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,getEnableMultipleUploader:function(){return enableMultipleUploader
},getRenderers:function(){return renderers
},getAllowSetFileNameAtSimpleUpload:function(){return allowSetFileNameAtSimpleUpload
},"$":$,getAppRootUrl:function(){return appRootUrl
},getUid:function(){return uid
},getCurrentFolder:getCurrentFolder,gridItemExists:gridItemExists,isModifyAllowed:isModifyAllowed,openGridFolder:openGridFolder,showBalloon:showBalloon,getExtEl:function(){return extEl
},ProcessScriptError:ProcessScriptError,getEnableDnDUploader:function(){return enableDnDUploader
},getDnDZone:function(){return dndZone
},globalLoadMask:globalLoadMask,getCurrentSelectedSet:function(){return createSelectedSet(grid,getCurrentFolder())
},openTreeNode:openTreeNode,getFileManagerInstance:function(){return fm
},getGoogleDriveAuth:function(){return googleDriveAuth
},getSkyDriveAuth:function(){return skyDriveAuth
},getDropboxAuth:function(){return dropboxAuth
},getBoxAuth:function(){return boxAuth
},isDemoMode:function(){return isDemoMode
},openTreeRecent:openTreeRecent});
uploadWindow.registerJavascriptEventsForUploaders(fm);
if(show){uploadWindow.activateiOSTabIfExists();
uploadWindow.show()
}}catch(e){ProcessScriptError(e)
}};
var initImagesViewer=function(){if(imageViewerWindow){return imageViewerWindow
}try{imageViewerWindow=HttpCommander.Lib.ImageViewerWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,getUid:function(){return uid
},"$":$,getMaxWidthThumb:function(){return maxWidthThumb
},getMaxHeightThumb:function(){return maxHeightThumb
},getCurrentFolder:getCurrentFolder,getView:function(){return view
},getFileManager:function(){return fm
},ProcessScriptError:ProcessScriptError,getThumbnailTpl:function(){return thumbnailTpl
},openTreeRecent:openTreeRecent}).render(extEl)
}catch(e){ProcessScriptError(e);
return null
}return imageViewerWindow
};
var initFlashViewer=function(){if(flashViewerWindow){return flashViewerWindow
}try{flashViewerWindow=HttpCommander.Lib.FlashViewerWindow({htcConfig:htcConfig,Window:Window,Msg:Msg,getUid:function(){return uid
},"$":$,getAppRootUrl:function(){return appRootUrl
},getIsEmbeddedtoIFRAME:function(){return isEmbeddedtoIFRAME
},globalLoadMask:globalLoadMask,openTreeRecent:openTreeRecent})
}catch(e){ProcessScriptError(e);
return null
}return flashViewerWindow
};
var downloadToBox=function(){if(!htcConfig.enableDownloadToBox||!htcConfig.isAllowedBox){return
}try{if(!downloadToBoxWindow){downloadToBoxWindow=HttpCommander.Lib.DownloadToBoxWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,getUid:function(){return uid
},getBoxAuth:function(){return boxAuth
},isDemoMode:function(){return isDemoMode
},getCurrentSelectedSet:function(){return createSelectedSet(grid,getCurrentFolder())
}})
}downloadToBoxWindow.prepare()
}catch(e){ProcessScriptError(e)
}};
var editInGoogle=function(waitId,documentInfo,curFolder,fileName,create,suppressDelete){if(!htcConfig.enableGoogleEdit||!Ext.isObject(documentInfo)||Ext.isEmpty(curFolder)||Ext.isEmpty(fileName)){return
}try{if(!editInGoogleWindow){editInGoogleWindow=HttpCommander.Lib.EditorGoogleWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,getUid:function(){return uid
},getGoogleDriveAuth:function(){return googleDriveAuth
},getCurrentSelectedSet:function(){return createSelectedSet(grid,getCurrentFolder())
},getCurrentFolder:getCurrentFolder,openGridFolder:openGridFolder,showBalloon:showBalloon,isDemoMode:function(){return isDemoMode
},setSelectPath:function(v){selectPath=v
},openTreeRecent:openTreeRecent})
}editInGoogleWindow.getEditedDocFromGoogle(waitId,documentInfo,curFolder,fileName,create,suppressDelete)
}catch(e){ProcessScriptError(e)
}};
var deleteInGoogle=function(doc){if(!htcConfig.enableGoogleEdit||!Ext.isObject(doc)||Ext.isEmpty(doc.id)){return
}try{if(!editInGoogleWindow){editInGoogleWindow=HttpCommander.Lib.EditorGoogleWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,getUid:function(){return uid
},getGoogleDriveAuth:function(){return googleDriveAuth
},getCurrentSelectedSet:function(){return createSelectedSet(grid,getCurrentFolder())
},getCurrentFolder:getCurrentFolder,openGridFolder:openGridFolder,showBalloon:showBalloon,isDemoMode:function(){return isDemoMode
},setSelectPath:function(v){selectPath=v
},openTreeRecent:openTreeRecent})
}editInGoogleWindow.deleteDocFromGoogle(doc.id,doc.title)
}catch(e){ProcessScriptError(e)
}};
var editInMSOO=function(waitId,documentInfo,curFolder,fileName,create,suppressDelete){if(!htcConfig.enableMSOOEdit||!Ext.isObject(documentInfo)||Ext.isEmpty(curFolder)||Ext.isEmpty(fileName)){return
}try{if(!editInMSOOWindow){editInMSOOWindow=HttpCommander.Lib.EditorMSOOWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,getUid:function(){return uid
},getSkyDriveAuth:function(){return skyDriveAuth
},getCurrentSelectedSet:function(){return createSelectedSet(grid,getCurrentFolder())
},getCurrentFolder:getCurrentFolder,openGridFolder:openGridFolder,showBalloon:showBalloon,isDemoMode:function(){return isDemoMode
},setSelectPath:function(v){selectPath=v
},openTreeRecent:openTreeRecent})
}editInMSOOWindow.getEditedDocFromMS(waitId,documentInfo,curFolder,fileName,create,suppressDelete)
}catch(e){ProcessScriptError(e)
}};
var deleteInMSOO=function(documentInfo){if(!htcConfig.enableMSOOEdit||!Ext.isObject(documentInfo)||Ext.isEmpty(documentInfo.id)){return
}try{if(!editInMSOOWindow){editInMSOOWindow=HttpCommander.Lib.EditorMSOOWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,getUid:function(){return uid
},getSkyDriveAuth:function(){return skyDriveAuth
},getCurrentSelectedSet:function(){return createSelectedSet(grid,getCurrentFolder())
},getCurrentFolder:getCurrentFolder,openGridFolder:openGridFolder,showBalloon:showBalloon,isDemoMode:function(){return isDemoMode
},setSelectPath:function(v){selectPath=v
},openTreeRecent:openTreeRecent})
}editInMSOOWindow.deleteDocFromMS(documentInfo)
}catch(e){ProcessScriptError(e)
}};
var editInOffice365=function(waitId,documentInfo,curFolder,fileName,create,suppressDelete){if(!htcConfig.enableOffice365Edit||!Ext.isObject(documentInfo)||Ext.isEmpty(curFolder)||Ext.isEmpty(fileName)){return
}try{if(!editInOffice365Window){editInOffice365Window=HttpCommander.Lib.Editor365Window({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,getUid:function(){return uid
},getSkyDriveAuth:function(){return skyDriveAuth
},getCurrentSelectedSet:function(){return createSelectedSet(grid,getCurrentFolder())
},getCurrentFolder:getCurrentFolder,openGridFolder:openGridFolder,showBalloon:showBalloon,isDemoMode:function(){return isDemoMode
},setSelectPath:function(v){selectPath=v
},openTreeRecent:openTreeRecent})
}editInOffice365Window.getEditedDocFrom365(waitId,documentInfo,curFolder,fileName,create,suppressDelete)
}catch(e){ProcessScriptError(e)
}};
var deleteInOffice365=function(documentInfo){if(!htcConfig.enableOffice365Edit||!Ext.isObject(documentInfo)||Ext.isEmpty(documentInfo.id)){return
}try{if(!editInOffice365Window){editInOffice365Window=HttpCommander.Lib.Editor365Window({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,getUid:function(){return uid
},getSkyDriveAuth:function(){return skyDriveAuth
},getCurrentSelectedSet:function(){return createSelectedSet(grid,getCurrentFolder())
},getCurrentFolder:getCurrentFolder,openGridFolder:openGridFolder,showBalloon:showBalloon,isDemoMode:function(){return isDemoMode
},setSelectPath:function(v){selectPath=v
},openTreeRecent:openTreeRecent})
}editInOffice365Window.deleteDocFrom365(documentInfo)
}catch(e){ProcessScriptError(e)
}};
var downloadToGoogle=function(){if(!htcConfig.enableDownloadToGoogle||!htcConfig.isAllowedGoogleDrive){return
}try{if(!downloadToGoogleWindow){downloadToGoogleWindow=HttpCommander.Lib.DownloadToGoogleWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,getUid:function(){return uid
},getGoogleDriveAuth:function(){return googleDriveAuth
},isDemoMode:function(){return isDemoMode
},getCurrentSelectedSet:function(){return createSelectedSet(grid,getCurrentFolder())
}})
}downloadToGoogleWindow.prepare(true)
}catch(e){ProcessScriptError(e)
}};
var downloadToDropbox=function(){if(!htcConfig.enableDownloadToDropbox){return
}try{if(!downloadToDropboxWindow){downloadToDropboxWindow=new HttpCommander.Lib.DownloadToDropboxWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,getUid:function(){return uid
},isDemoMode:function(){return isDemoMode
},getDropboxAuth:function(){return dropboxAuth
},getCurrentSelectedSet:function(){return createSelectedSet(grid,getCurrentFolder())
}})
}downloadToDropboxWindow.prepare()
}catch(e){ProcessScriptError(e)
}};
var downloadToSkyDrive=function(){if(!htcConfig.enableDownloadToSkyDrive&&!htcConfig.isAllowedSkyDrive){return
}try{if(!downloadToSkyDriveWindow){downloadToSkyDriveWindow=HttpCommander.Lib.DownloadToSkyDriveWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,getUid:function(){return uid
},isDemoMode:function(){return isDemoMode
},getCurrentSelectedSet:function(){return createSelectedSet(grid,getCurrentFolder())
},getSkyDriveAuth:function(){return skyDriveAuth
},isDemoMode:function(){return isDemoMode
}})
}var personalOneDrive=typeof(htcConfig.liveConnectID)!="undefined"&&htcConfig.liveConnectID!=null&&String(htcConfig.liveConnectID).length>0;
var businessOneDrive=typeof(htcConfig.oneDriveForBusinessAuthUrl)!="undefined"&&htcConfig.oneDriveForBusinessAuthUrl!=null&&String(htcConfig.oneDriveForBusinessAuthUrl).length>0;
var business=businessOneDrive&&!personalOneDrive;
if(!business){business=personalOneDrive&&!businessOneDrive?false:undefined
}downloadToSkyDriveWindow.main(false,business)
}catch(e){ProcessScriptError(e)
}};
var prepareAndShowLinkToFileFolderWindow=function(virtPath,isFolder){if(!linkToFileFolderWindow){try{linkToFileFolderWindow=HttpCommander.Lib.LinkToFileFolderWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,linkToOpenFolderByVirtPath:linkToOpenFolderByVirtPath,linkToFileByVirtPath:linkToFileByVirtPath,linkToSelectFileByVirtPath:linkToSelectFileByVirtPath,showBalloon:showBalloon})
}catch(e){ProcessScriptError(e);
return
}}linkToFileFolderWindow.hide();
linkToFileFolderWindow.virtPath=virtPath;
linkToFileFolderWindow.isFolder=isFolder;
linkToFileFolderWindow.show()
};
var initAndShowViewLinksWindow=function(linkPath,forceShowModal){if(!(forceShowModal===true)&&htcConfig.sharedInTree&&cardSwitchGrid&&sharedGrid){openSharedByLink();
return
}if(!viewLinksWindow){try{viewLinksWindow=HttpCommander.Lib.ViewLinksWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,getIsEmbeddedtoIFRAME:function(){return isEmbeddedtoIFRAME
},getEmbedded:function(){return embedded
},prepareAndShowMakePublicLinkWindow:prepareAndShowMakePublicLinkWindow,renderers:renderers,openGridFolder:openGridFolder,getCurrentFolder:getCurrentFolder})
}catch(e){ProcessScriptError(e);
return
}}if(!(linkPath===true)){if(typeof linkPath!="undefined"&&(linkPath=String(linkPath)).length>0){viewLinksWindow.linkPath=linkPath;
viewLinksWindow.oldLinkPath=linkPath
}else{viewLinksWindow.linkPath=null;
viewLinksWindow.oldLinkPath=null
}}viewLinksWindow.hide();
viewLinksWindow.show();
viewLinksWindow.items.items[0].getStore().load()
};
var prepareAndShowMakePublicLinkWindow=function(virtPath,isFolder,anonPerm,linkForEdit,fromGrid,fromSharedGrid){if(!makePublicLinkWindow){try{makePublicLinkWindow=HttpCommander.Lib.CreatePublicLinkWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,getUid:function(){return uid
},"$":$,globalLoadMask:globalLoadMask,initAndShowViewLinksWindow:initAndShowViewLinksWindow,hideViewLinksWindow:function(){if(viewLinksWindow){viewLinksWindow.hide()
}},initSendEmail:initSendEmail,openGridFolder:openGridFolder,showHelpWindow:showHelpWindow,setSelectPath:function(v){selectPath=v
},openSharedByLink:openSharedByLink,getCurrentFolder:getCurrentFolder,showBalloon:showBalloon})
}catch(e){ProcessScriptError(e);
return
}}makePublicLinkWindow.hide();
makePublicLinkWindow.virtPath=virtPath;
makePublicLinkWindow.isFolder=isFolder;
makePublicLinkWindow.anonPerm=anonPerm;
makePublicLinkWindow.linkForEdit=Ext.isObject(linkForEdit)&&Ext.isNumber(linkForEdit.id)?linkForEdit:null;
makePublicLinkWindow.fromGrid=fromGrid;
makePublicLinkWindow.fromSharedGrid=fromSharedGrid;
makePublicLinkWindow.show()
};
var initAndShowChangesWatchWindow=function(pathInfo){if(!(htcConfig.watchForModifs===true)||!pathInfo||Ext.isEmpty(pathInfo.path)){return
}if(!changesWatchWindow){try{changesWatchWindow=HttpCommander.Lib.ChangesWatchWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,getUid:function(){return uid
},"$":$,globalLoadMask:globalLoadMask,openGridFolder:openGridFolder,showHelpWindow:showHelpWindow,setSelectPath:function(v){selectPath=v
},getCurrentFolder:getCurrentFolder,openGridFolder:openGridFolder,showBalloon:showBalloon,getMenuActions:function(){return menuActions
},getPageLimit:function(){return(pagingEnabled?htcConfig.itemsPerPage:0)
},renderers:renderers,getIsEmbeddedtoIFRAME:function(){return isEmbeddedtoIFRAME
}})
}catch(e){ProcessScriptError(e);
return
}}changesWatchWindow.hide();
changesWatchWindow.pathInfo=pathInfo;
changesWatchWindow.show()
};
var initAndShowWatchModifsWindow=function(pathInfo,viewWindow){if(!(htcConfig.watchForModifs===true)||!pathInfo||Ext.isEmpty(pathInfo.path)){return
}if(!watchModifsWindow){try{watchModifsWindow=HttpCommander.Lib.WatchModificationsWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,getUid:function(){return uid
},"$":$,globalLoadMask:globalLoadMask,openGridFolder:openGridFolder,showHelpWindow:showHelpWindow,setSelectPath:function(v){selectPath=v
},getCurrentFolder:getCurrentFolder,openGridFolder:openGridFolder,showBalloon:showBalloon,openTreeAlerts:openTreeAlerts})
}catch(e){ProcessScriptError(e);
return
}}watchModifsWindow.hide();
watchModifsWindow.pathInfo=pathInfo;
watchModifsWindow.viewWindow=viewWindow;
watchModifsWindow.show()
};
var prepareAndShowlinksToWebFoldersWindow=function(root,parent,current){if(!linksToWebFoldersWindow){try{linksToWebFoldersWindow=HttpCommander.Lib.LinksToWebFoldersWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,getIsEmbeddedtoIFRAME:function(){return isEmbeddedtoIFRAME
},getUid:function(){return uid
}})
}catch(e){ProcessScriptError(e);
return
}}if(linksToWebFoldersWindow){linksToWebFoldersWindow.initialize(root,parent,current);
linksToWebFoldersWindow.show()
}};
var initSendEmail=function(){if(sendEmailWindow){return sendEmailWindow
}try{sendEmailWindow=HttpCommander.Lib.SendEmailWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,getEmbedded:function(){return embedded
},getIsEmbeddedtoIFRAME:function(){return isEmbeddedtoIFRAME
},getCurrentFolder:getCurrentFolder,getSelectedFiles:getSelectedFiles,linkToFileByName:linkToFileByName,linkToFolderByName:linkToFolderByName})
}catch(e){ProcessScriptError(e);
return null
}return sendEmailWindow
};
var initVersionHistory=function(fileInfo){if(htcConfig.enableVersionControl!==true){return null
}if(!versionHistoryWindow){try{versionHistoryWindow=HttpCommander.Lib.VersionHistoryWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,getIsEmbeddedtoIFRAME:function(){return isEmbeddedtoIFRAME
},getEmbedded:function(){return embedded
},getRenderers:function(){return renderers
},openGridFolder:openGridFolder})
}catch(e){ProcessScriptError(e);
return null
}}versionHistoryWindow.fileInfo=fileInfo;
return versionHistoryWindow
};
var initCheckInWindow=function(fileInfo){if(htcConfig.enableVersionControl!==true){return null
}if(!checkInWindow){try{checkInWindow=HttpCommander.Lib.CheckInWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,getIsEmbeddedtoIFRAME:function(){return isEmbeddedtoIFRAME
},showBalloon:showBalloon,openGridFolder:openGridFolder})
}catch(e){ProcessScriptError(e);
return null
}}checkInWindow.fileInfo=fileInfo;
return checkInWindow
};
var initAndShowZipPromptWindow=function(zipInfo){if(!zipInfo){return
}if(!zipPromptWindow){try{zipPromptWindow=HttpCommander.Lib.ZipPromptWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,getUid:function(){return uid
},getFileManager:function(){return fm
},showBalloon:showBalloon,openGridFolder:openGridFolder,setSelectPath:function(v){selectPath=v
},openTreeRecent:openTreeRecent})
}catch(e){ProcessScriptError(e);
return
}}else{zipPromptWindow.hide()
}zipPromptWindow.initialize(zipInfo);
zipPromptWindow.show();
zipPromptWindow.syncSize();
zipPromptWindow.doLayout()
};
var initAndShowUnzipPromptWindow=function(unzipInfo,flags,node,dlg){if(!unzipInfo){return
}flags=flags||0;
if(!unzipPromptWindow){try{unzipPromptWindow=HttpCommander.Lib.UnzipPromptWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,showBalloon:showBalloon,openTreeNode:openTreeNode,openGridFolder:openGridFolder})
}catch(e){ProcessScriptError(e);
return
}}else{unzipPromptWindow.hide()
}unzipPromptWindow.initialize(unzipInfo,flags,node,dlg);
unzipPromptWindow.show();
unzipPromptWindow.syncSize();
unzipPromptWindow.doLayout();
return
};
var initZipContent=function(){if(zipContentWindow){return zipContentWindow
}try{zipContentWindow=HttpCommander.Lib.ZipContentWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,getIsEmbeddedtoIFRAME:function(){return isEmbeddedtoIFRAME
},getEmbedded:function(){return embedded
},getRenderers:function(){return renderers
},getCurrentFolder:getCurrentFolder,initAndShowUnzipPromptWindow:initAndShowUnzipPromptWindow});
return zipContentWindow
}catch(e){ProcessScriptError(e)
}return null
};
var initDownload=function(){if(downloadWindow){return true
}try{downloadWindow=HttpCommander.Lib.DownloadWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,"$":$,appRootUrl:appRootUrl,getUid:function(){return uid
},getFileManager:function(){return fm
},getMenuActions:function(){return menuActions
},onJavaPowDownloadInit:function(){var javaPowDownload=document.getElementById($("javaPowDownload"));
if(downloadWindow&&javaPowDownload){downloadWindow.fireEvent("bodyresize",downloadWindow,downloadWindow.getInnerWidth(),downloadWindow.getInnerHeight());
javaPowDownload.reloadTree()
}}});
return true
}catch(e){ProcessScriptError(e)
}return false
};
var initMetadata=function(){if(metadataWindow){return metadataWindow
}try{metadataWindow=HttpCommander.Lib.MetadataWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,getIsEmbeddedtoIFRAME:function(){return isEmbeddedtoIFRAME
},getEmbedded:function(){return embedded
},"$":$,getShowMetaDataInList:function(){return showMetaDataInList
},getCurrentFolder:getCurrentFolder,openGridFolder:openGridFolder,getRenderers:function(){return renderers
},isModifyAllowed:isModifyAllowed,setSelectPath:function(v){selectPath=v
},getDetailsPane:function(){return detailsPane
},getHideDetailsPaneValue:getHideDetailsPaneValue});
return metadataWindow
}catch(e){ProcessScriptError(e)
}return null
};
var initEditTextFileWindow=function(){if(!editTextFileWindow){try{editTextFileWindow=HttpCommander.Lib.EditTextFileWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,getIsEmbeddedtoIFRAME:function(){return isEmbeddedtoIFRAME
},globalLoadMask:globalLoadMask,showBalloon:showBalloon,getCurrentFolder:getCurrentFolder,openGridFolder:openGridFolder,setSelectPath:function(v){selectPath=v
},openTreeRecent:openTreeRecent})
}catch(e){ProcessScriptError(e);
return null
}}return editTextFileWindow
};
var renderers=HttpCommander.Lib.DataRenderers({getHtcConfig:function(){return htcConfig
},getUid:function(){return uid
},getCurrentFolder:getCurrentFolder,labelsIsHided:function(){try{var cm=grid.getColumnModel();
var cols=cm.getColumnsBy(function(c){return c&&c.dataIndex=="label"
});
if(Ext.isArray(cols)&&cols.length>0&&cols[0]){return cols[0].hidden
}}catch(e){}return true
}});
var generateUrlHelp=function(anchor,withoutWebDavLink){var webdavUrl="";
if(!(withoutWebDavLink===true)&&htcConfig.enableWebFoldersLinks&&htcConfig.hcAuthMode!="shibboleth"){webdavUrl="?webdav="+encodeURIComponent((htcConfig.domainNameUrl!=""?htcConfig.domainNameUrl:appRootUrl)+htcConfig.identifierWebDav+"/"+(htcConfig.anonymousEditingOffice?(htcConfig.webDavDefaultSuffix+"/"):""))
}return String.format("{0}{1}{2}{3}",htcConfig.relativePath,htcConfig.usersHelpRelUrl,webdavUrl,(anchor&&anchor!=""?("#"+anchor):""))
};
var showHelpWindow=function(anchor){if(helpInNewPage){window.open(generateUrlHelp(anchor))
}else{if(!userHelpWindow){try{userHelpWindow=HttpCommander.Lib.UserHelpWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,getAppRootUrl:function(){return appRootUrl
},getIsEmbeddedtoIFRAME:function(){return isEmbeddedtoIFRAME
},generateUrlHelp:generateUrlHelp})
}catch(e){ProcessScriptError(e);
return
}}userHelpWindow.initialize(anchor)
}};
fm.showHelp=showHelpWindow;
var initAndShowSyncWebFoldersHelpWindow=function(urlRoot,urlParent,urlCurrent){urlRoot=String(urlRoot||"");
urlParent=String(urlParent||"");
urlCurrent=String(urlCurrent||"");
var url=htcConfig.relativePath+"SyncWebFolders.html?root="+encodeURIComponent(urlRoot)+"&parent="+encodeURIComponent(urlParent)+"&current="+encodeURIComponent(urlCurrent);
if(helpInNewPage){window.open(url)
}else{if(!syncWebFoldersHelpWindow){try{syncWebFoldersHelpWindow=HttpCommander.Lib.SyncWebFoldersHelpWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,getIsEmbeddedtoIFRAME:function(){return isEmbeddedtoIFRAME
}})
}catch(e){ProcessScriptError(e);
return
}}syncWebFoldersHelpWindow.initialize(url)
}};
var initAndShowSelectFolder=function(path,action,zipName){if(!selectFolderTree){selectFolderTree=HttpCommander.Lib.FolderSelectionDialog({htcConfig:htcConfig,Msg:Msg,getRootName:function(){return _OLD_ROOT_
},Window:Window,getMenuActions:function(){return menuActions
},clipboard:clipboard,initAndShowUnzipPromptWindow:initAndShowUnzipPromptWindow,getGrid:function(){return grid
},getCurrentFolder:getCurrentFolder})
}var title=htcConfig.locData.UploadSimpleUploadFolderButtonText+" (";
if(action==="unzip"){title+=htcConfig.locData.CommandUnzip+" "+htcConfig.locData.CommandUnzipToNew
}else{if(action==="move"){title+=htcConfig.locData.CommandMoveTo
}else{title+=htcConfig.locData.CommandCopyTo
}}title+=")";
selectFolderTree.setTitle(title);
selectFolderTree.zipPath=null;
selectFolderTree.zipName=null;
selectFolderTree.action=action;
if(!Ext.isEmpty(zipName)&&!Ext.isEmpty(path)){selectFolderTree.zipPath=path;
selectFolderTree.zipName=zipName
}selectFolderTree.show();
selectFolderTree.openTreeNode(path)
};
var initTree=function(){try{if(getTreeViewValue()!="disabled"){tree=HttpCommander.Lib.TreePanel({htcConfig:htcConfig,Msg:Msg,Window:Window,getIsEmbeddedtoIFRAME:function(){return isEmbeddedtoIFRAME
},"$":$,globalLoadMask:globalLoadMask,openGridFolder:openGridFolder,toptbarButtons:toptbarButtons,clipboard:clipboard,dragDropPermission:dragDropPermission,createDraggedSet:createDraggedSet,dropDraggedSet:dropDraggedSet,dropDraggedToTrash:dropDraggedToTrash,getCurrentFolder:getCurrentFolder,getHideTreeValue:getHideTreeValue,getTreeViewValue:getTreeViewValue,setSelectPath:function(v){selectPath=v
},isRecentFolder:isRecentFolder,isTrashFolder:isTrashFolder,getRenderers:function(){return renderers
},getGrid:function(){return grid
},isAlertsFolder:isAlertsFolder,isSharedTreeFolder:isSharedTreeFolder,initAndShowChangesWatchWindow:initAndShowChangesWatchWindow,openAlertsFolder:openAlertsFolder,dropDraggedForShare:dropDraggedForShare,getRootName:function(){return _OLD_ROOT_
},openTrash:openTrash})
}}catch(e){throw e
}};
var createPlayVideoFlashWindow=function(){if(!playVideoFlashWindow){try{playVideoFlashWindow=HttpCommander.Lib.PlayVideoFlashWindow({"$":$,htcConfig:htcConfig,appRootUrl:appRootUrl,Window:Window,openTreeRecent:openTreeRecent})
}catch(e){ProcessScriptError(e);
return null
}}return playVideoFlashWindow
};
var createPlayVideoHtml5Window=function(){if(!playVideoHtml5Window){try{playVideoHtml5Window=HttpCommander.Lib.PlayVideoHtml5Window({htcConfig:htcConfig,globalLoadMask:globalLoadMask,Msg:Msg,Window:Window,openTreeRecent:openTreeRecent})
}catch(e){ProcessScriptError(e);
return null
}}return playVideoHtml5Window
};
var createPlayVideoJSWindow=function(){if(!playVideoJSWindow){try{playVideoJSWindow=HttpCommander.Lib.PlayVideoJSWindow({htcConfig:htcConfig,globalLoadMask:globalLoadMask,Msg:Msg,Window:Window,openTreeRecent:openTreeRecent})
}catch(e){ProcessScriptError(e);
return null
}}return playVideoJSWindow
};
var createPlayAudioHtml5Window=function(){if(!playAudioHtml5Window){try{playAudioHtml5Window=HttpCommander.Lib.PlayAudioHtml5Window({htcConfig:htcConfig,Msg:Msg,Window:Window,openTreeRecent:openTreeRecent})
}catch(e){ProcessScriptError(e);
return null
}}return playAudioHtml5Window
};
var initAndShowShortcutWindow=function(selectedRecord,curFolder){var itemName=selectedRecord?selectedRecord.data.name:"";
if(itemName==""){var pathParts=curFolder.split("/");
itemName=pathParts.pop();
itemPath=pathParts.join("/")
}else{itemPath=curFolder
}if(!shortcutWindow){try{shortcutWindow=HttpCommander.Lib.ShortcutWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,getCurrentFolder:getCurrentFolder,openGridFolder:openGridFolder,setSelectPath:function(v){selectPath=v
}})
}catch(e){ProcessScriptError(e);
return
}}shortcutWindow.hide();
shortcutWindow.itemName=itemName;
shortcutWindow.itemPath=itemPath;
shortcutWindow.show()
};
var initAndShowCloudConvertWindow=function(selectedRecord,curFolder,outputFormats){var itemName=selectedRecord?selectedRecord.data.name:"";
if(itemName==""||!Ext.isArray(outputFormats)||outputFormats.length==0){return
}if(!cloudConvertWindow){try{cloudConvertWindow=HttpCommander.Lib.CloudConvertWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,showBalloon:showBalloon,getRenderers:function(){return renderers
},isExtensionAllowed:isExtensionAllowed,getIsEmbeddedtoIFRAME:function(){return isEmbeddedtoIFRAME
},globalLoadMask:globalLoadMask,getCurrentFolder:getCurrentFolder,openGridFolder:openGridFolder,setSelectPath:function(v){selectPath=v
},openTreeRecent:openTreeRecent})
}catch(e){ProcessScriptError(e);
return
}}cloudConvertWindow.hide();
cloudConvertWindow.itemName=itemName;
cloudConvertWindow.itemPath=curFolder;
cloudConvertWindow.outputFormats=outputFormats;
cloudConvertWindow.setTitle(String.format(htcConfig.locData.CloudConvertWindowTitle,Ext.util.Format.htmlEncode(itemName)));
cloudConvertWindow.show()
};
var createVideoConvertWindow=function(){if(!videoConvertWindow){try{videoConvertWindow=HttpCommander.Lib.VideoConvertWindow({htcConfig:htcConfig,Msg:Msg,Window:Window,globalLoadMask:globalLoadMask,isFileExists:function(fileName){var fIndex=gridStore.findBy(function(rec,id){return rec.get("name").toLowerCase()==fileName.toLowerCase()
});
return fIndex>=0
},refreshCurrentFolder:function(folder){var curFolder=folder||getCurrentFolder();
openGridFolder(curFolder,true,true)
},setSelectPath:function(v){selectPath=v
}})
}catch(e){ProcessScriptError(e);
return null
}}return videoConvertWindow
};
var getSelTypeFilesModel=function(gridPanel){var selModel=gridPanel.getSelectionModel();
var selType="set";
var selFiles=0,selFolders=0;
if(getCurrentFolder()==null){selType="empty"
}else{if(selModel.getCount()==0){selType="none"
}else{if(selModel.getCount()==1){selType=selModel.getSelected().data.rowtype;
if(selType=="file"){selFiles++
}else{if(selType=="folder"){selFolders++
}}}else{Ext.each(selModel.selections.items,function(r){if(r.data.rowtype=="file"){selFiles++
}else{if(r.data.rowtype=="folder"){selFolders++
}}})
}}}return{selType:selType,selFiles:selFiles,selModel:selModel,selFolders:selFolders}
};
var changeAccessibilityButton=function(btnName,enabled){if(toptbarButtons&&toptbarButtons[btnName]){Ext.each(toptbarButtons[btnName],function(btn){btn.setDisabled(!enabled)
})
}};
var toggleToolbarButtons=function(){for(var item in toptbarButtons){if(toptbarButtons.hasOwnProperty(item)){changeAccessibilityButton(item,toptbarConfig.access(item))
}}};
var initMenu=function(){try{newSubMenu=HttpCommander.Lib.NewSubMenu({htcConfig:htcConfig,getMenuActions:function(){return menuActions
},isExtensionAllowed:isExtensionAllowed,initAndShowShortcutWindow:initAndShowShortcutWindow,getSelTypeFilesModel:getSelTypeFilesModel,getGrid:function(){return grid
},getCurrentPerms:function(){return htcConfig&&htcConfig.currentPerms?htcConfig.currentPerms:null
}});
viewEditSubMenu=HttpCommander.Lib.ViewEditSubMenu({htcConfig:htcConfig,getMenuActions:function(){return menuActions
},getSelTypeFilesModel:getSelTypeFilesModel,getGrid:function(){return grid
},getCurrentFolder:getCurrentFolder,viewFile:viewFile,initImagesViewer:initImagesViewer,initOfficeEditor:initOfficeEditor,createVideoConvertWindow:createVideoConvertWindow,createPlayVideoFlashWindow:createPlayVideoFlashWindow,createPlayVideoHtml5Window:createPlayVideoHtml5Window,createPlayVideoJSWindow:createPlayVideoJSWindow,createPlayAudioHtml5Window:createPlayAudioHtml5Window,initFlashViewer:initFlashViewer,isExtensionAllowed:isExtensionAllowed,supportsWebGlCanvasForAutodesk:function(){return supportsWebGlCanvasForAutodesk
},openInMsoNewWay:openInMsoNewWay,isRecentFolder:isRecentFolder,isTrashFolder:isTrashFolder});
shareSubMenu=HttpCommander.Lib.ShareSubMenu({htcConfig:htcConfig,getMenuActions:function(){return menuActions
},getSelTypeFilesModel:getSelTypeFilesModel,getGrid:function(){return grid
},getCurrentFolder:getCurrentFolder,virtualFilePath:virtualFilePath,prepareAndShowLinkToFileFolderWindow:prepareAndShowLinkToFileFolderWindow,prepareAndShowMakePublicLinkWindow:prepareAndShowMakePublicLinkWindow,initSendEmail:initSendEmail,isRecentFolder:isRecentFolder,isTrashFolder:isTrashFolder,isAlertsFolder:isAlertsFolder});
versioningSubMenu=HttpCommander.Lib.VersioningSubMenu({htcConfig:htcConfig,getMenuActions:function(){return menuActions
},getSelTypeFilesModel:getSelTypeFilesModel,getGrid:function(){return grid
},getCurrentFolder:getCurrentFolder,initVersionHistory:initVersionHistory,initCheckInWindow:initCheckInWindow,isRecentFolder:isRecentFolder,isTrashFolder:isTrashFolder});
if(htcConfig.enabledLabels){labelsMenu=HttpCommander.Lib.LabelsMenu({htcConfig:htcConfig,getMenuActions:function(){return menuActions
},getSelTypeFilesModel:getSelTypeFilesModel,getGrid:function(){return grid
},getCurrentFolder:getCurrentFolder,Msg:Msg,Window:Window});
fm.showLabelsMenu=function(index,e){var selModel,allow=htcConfig.enabledLabels&&htcConfig.currentPerms&&htcConfig.currentPerms.modify;
if(allow&&labelsMenu&&grid&&index>=0){selModel=grid.getSelectionModel();
selModel.selectRow(index,false);
labelsMenu.show(e)
}}
}if(htcConfig.watchForModifs===true){watchSubMenu=HttpCommander.Lib.WatchSubMenu({htcConfig:htcConfig,getMenuActions:function(){return menuActions
},getSelTypeFilesModel:getSelTypeFilesModel,getGrid:function(){return grid
},getCurrentFolder:getCurrentFolder,initAndShowWatchModifsWindow:initAndShowWatchModifsWindow,isSpecialTreeFolderOrSubFolder:isSpecialTreeFolderOrSubFolder})
}moreSubMenu=HttpCommander.Lib.MoreSubMenu({htcConfig:htcConfig,getMenuActions:function(){return menuActions
},getSelTypeFilesModel:getSelTypeFilesModel,getGrid:function(){return grid
},getCurrentFolder:getCurrentFolder,prepareAndShowlinksToWebFoldersWindow:prepareAndShowlinksToWebFoldersWindow,initAndShowSyncWebFoldersHelpWindow:initAndShowSyncWebFoldersHelpWindow,versioningSubMenu:versioningSubMenu,isRecentFolder:isRecentFolder,isTrashFolder:isTrashFolder,isAlertsFolder:isAlertsFolder});
cloudsSubMenu=HttpCommander.Lib.CloudStoragesSubMenu({htcConfig:htcConfig,getGrid:function(){return grid
},getSelTypeFilesModel:getSelTypeFilesModel,downloadToGoogle:downloadToGoogle,downloadToDropbox:downloadToDropbox,downloadToSkyDrive:downloadToSkyDrive,downloadToBox:downloadToBox,showHelpWindow:showHelpWindow,showUploadWindow:showUploadWindow,getCurrentFolder:getCurrentFolder,isRecentFolder:isRecentFolder,isTrashFolder:isTrashFolder,isAlertsFolder:isAlertsFolder});
trashSubMenu=htcConfig.enableTrash?HttpCommander.Lib.TrashSubMenu({htcConfig:htcConfig,getGrid:function(){return grid
},getCurrentFolder:getCurrentFolder,getSelTypeFilesModel:getSelTypeFilesModel,isTrashFolder:isTrashFolder,getMenuActions:function(){return menuActions
}}):null;
copyMenu=new Ext.menu.Menu({items:[{itemId:"copy",text:htcConfig.locData.CommandCopy+" ("+htcConfig.locData.CommandCopyCutClipboardSuffix+")",icon:HttpCommander.Lib.Utils.getIconPath(this,"copy")},{itemId:"copy-to",text:htcConfig.locData.CommandCopyTo,icon:HttpCommander.Lib.Utils.getIconPath(this,"copy")}],listeners:{itemclick:function(item){var curFolder=getCurrentFolder();
clipboard.setItems(createSelectedSet(grid,curFolder));
clipboard.srcPath=curFolder;
clipboard.isCut=false;
toggleToolbarButtons();
switch(item.itemId){case"copy-to":initAndShowSelectFolder(curFolder,"copy");
break;
default:break
}},beforeshow:function(menu){var selTFM=getSelTypeFilesModel(grid);
var selModel=selTFM.selModel;
var row=selModel.getSelected();
var rowData=row?row.data:{};
var selType=selTFM.selType;
var visible=htcConfig.currentPerms&&htcConfig.currentPerms.copy;
var enabled=selType!="empty"&&selType!="none";
copyMenu.getComponent("copy").setVisible(visible&&enabled);
copyMenu.getComponent("copy").setDisabled(!visible||!enabled);
copyMenu.getComponent("copy-to").setVisible(visible&&enabled);
copyMenu.getComponent("copy-to").setDisabled(!visible||!enabled);
return true
}}});
moveMenu=new Ext.menu.Menu({items:[{itemId:"cut",text:htcConfig.locData.CommandCut+" ("+htcConfig.locData.CommandCopyCutClipboardSuffix+")",icon:HttpCommander.Lib.Utils.getIconPath(this,"cut")},{itemId:"move-to",text:htcConfig.locData.CommandMoveTo,icon:HttpCommander.Lib.Utils.getIconPath(this,"cut")}],listeners:{itemclick:function(item){var curFolder=getCurrentFolder();
clipboard.setItems(createSelectedSet(grid,curFolder));
clipboard.srcPath=curFolder;
clipboard.isCut=true;
toggleToolbarButtons();
switch(item.itemId){case"move-to":initAndShowSelectFolder(curFolder,"move");
break;
default:break
}},beforeshow:function(menu){var selTFM=getSelTypeFilesModel(grid);
var selModel=selTFM.selModel;
var row=selModel.getSelected();
var rowData=row?row.data:{};
var selType=selTFM.selType;
var visible=htcConfig.currentPerms&&htcConfig.currentPerms.cut;
var enabled=selType!="empty"&&selType!="none";
moveMenu.getComponent("cut").setVisible(visible&&enabled);
moveMenu.getComponent("cut").setDisabled(!visible||!enabled);
moveMenu.getComponent("move-to").setVisible(visible&&enabled);
moveMenu.getComponent("move-to").setDisabled(!visible||!enabled)
}}});
unzipSubMenu=new Ext.menu.Menu({items:[{itemId:"unzip-to-folder-zipname",text:htcConfig.locData.CommandUnzipTo,icon:HttpCommander.Lib.Utils.getIconPath(this,"unzip")},{itemId:"unzip-here",text:htcConfig.locData.CommandUnzipToCurrent,icon:HttpCommander.Lib.Utils.getIconPath(this,"unzip")},{itemId:"unzip-to",text:htcConfig.locData.CommandUnzipToNew+"...",icon:HttpCommander.Lib.Utils.getIconPath(this,"unzip")}],listeners:{itemclick:function(item){var selectedRecord=grid.getSelectionModel().getSelected();
var curFolder=getCurrentFolder();
var unzipInfo={};
var flags=item.itemId=="unzip-here"?1:item.itemId=="unzip-to"?2:3;
if(flags==2){initAndShowSelectFolder(curFolder,"unzip",selectedRecord.data.name)
}else{unzipInfo.path=curFolder;
unzipInfo.name=selectedRecord.data.name;
unzipInfo.crypted=true;
initAndShowUnzipPromptWindow(unzipInfo,flags)
}},beforeshow:function(menu){var selectedRecord=grid.getSelectionModel().getSelected(),toZipNameFolder=menu.getComponent("unzip-to-folder-zipname");
if(toZipNameFolder){if(selectedRecord){var zipNameWithoutExt=selectedRecord.data.name,pos=zipNameWithoutExt.lastIndexOf(".");
if(pos>0){zipNameWithoutExt=zipNameWithoutExt.substring(0,pos)
}toZipNameFolder.setText(String.format('{0} "{1}"',htcConfig.locData.CommandUnzipTo,Ext.util.Format.htmlEncode(zipNameWithoutExt)));
toZipNameFolder.setVisible(true);
toZipNameFolder.setDisabled(false)
}else{toZipNameFolder.setVisible(false);
toZipNameFolder.setDisabled(true)
}}}}});
fileMenu=HttpCommander.Lib.FileMenu({htcConfig:htcConfig,getMenuActions:function(){return menuActions
},getSelTypeFilesModel:getSelTypeFilesModel,getGrid:function(){return grid
},getCurrentFolder:getCurrentFolder,isExtensionAllowed:isExtensionAllowed,createSelectedSet:createSelectedSet,viewEditSubMenu:viewEditSubMenu,shareSubMenu:shareSubMenu,newSubMenu:newSubMenu,unzipSubMenu:unzipSubMenu,clipboard:clipboard,initZipContent:initZipContent,initMetadata:initMetadata,toggleToolbarButtons:toggleToolbarButtons,cloudsSubMenu:cloudsSubMenu,labelsMenu:labelsMenu,watchSubMenu:watchSubMenu,moreSubMenu:moreSubMenu,isRecentFolder:isRecentFolder,isTrashFolder:isTrashFolder,isSharedTreeFolder:isSharedTreeFolder,isSharedForYouTreeFolder:isSharedForYouTreeFolder,isAlertsFolder:isAlertsFolder,isSpecialTreeFolderOrSubFolder:isSpecialTreeFolderOrSubFolder,initAndShowSelectFolder:initAndShowSelectFolder,copyMenu:copyMenu,moveMenu:moveMenu});
if(htcConfig.sharedInTree){sharedFileMenu=HttpCommander.Lib.AnonymContextMenu({htcConfig:htcConfig,getMenuActions:function(){return menuActions
},getSelTypeFilesModel:getSelTypeFilesModel,getSharedGrid:function(){return sharedGrid
},getCurrentFolder:getCurrentFolder,createSelectedSet:createSelectedSet,toggleToolbarButtons:toggleToolbarButtons,Msg:Msg,showBalloon:showBalloon})
}}catch(e){throw e
}};
var initMenuActions=function(){if(menuActions){return
}try{menuActions=HttpCommander.Lib.MenuActions({htcConfig:htcConfig,Msg:Msg,Window:Window,getView:function(){return view
},isExtensionAllowed:isExtensionAllowed,getRestrictionMessage:getRestrictionMessage,gridItemExists:gridItemExists,globalLoadMask:globalLoadMask,getUid:function(){return uid
},getCurrentFolder:getCurrentFolder,showBalloon:showBalloon,openGridFolder:openGridFolder,openTreeNode:openTreeNode,getGrid:function(){return grid
},getCurrentGridView:function(){return currentGridView
},getAsControl:function(){return asControl
},showRefreshWarning:showRefreshWarning,setAllowEdit:function(v){allowEdit=v
},createSelectedSet:createSelectedSet,downloadFile:downloadFile,initDownload:initDownload,getDownloadWindow:function(){return downloadWindow
},getAppRootUrl:function(){return appRootUrl
},getFileManager:function(){return fm
},reloadTreeNodeIfOpened:reloadTreeNodeIfOpened,initAndShowShortcutWindow:initAndShowShortcutWindow,initAndShowCloudConvertWindow:initAndShowCloudConvertWindow,viewFile:viewFile,initImagesViewer:initImagesViewer,initFlashViewer:initFlashViewer,initEditTextFileWindow:initEditTextFileWindow,virtualFilePath:virtualFilePath,prepareAndShowLinkToFileFolderWindow:prepareAndShowLinkToFileFolderWindow,initSendEmail:initSendEmail,createVideoConvertWindow:createVideoConvertWindow,createPlayVideoFlashWindow:createPlayVideoFlashWindow,createPlayVideoHtml5Window:createPlayVideoHtml5Window,createPlayVideoJSWindow:createPlayVideoJSWindow,createPlayAudioHtml5Window:createPlayAudioHtml5Window,initAndShowZipPromptWindow:initAndShowZipPromptWindow,getGoogleDriveAuth:function(){return googleDriveAuth
},editInGoogle:editInGoogle,deleteInGoogle:deleteInGoogle,getSkyDriveAuth:function(){return skyDriveAuth
},editInMSOO:editInMSOO,deleteInMSOO:deleteInMSOO,editInOffice365:editInOffice365,deleteInOffice365:deleteInOffice365,setSelectPath:function(v){selectPath=v
},isRecentFolder:isRecentFolder,openTreeRecent:openTreeRecent,isTrashFolder:isTrashFolder,openSharedByLink:openSharedByLink,initAndShowWatchModifsWindow:initAndShowWatchModifsWindow,openTrash:openTrash,initAndShowChangesWatchWindow:initAndShowChangesWatchWindow,openTreeAlerts:openTreeAlerts,getSelectedFiles:getSelectedFiles,linkToFileByName:linkToFileByName,linkToFolderByName:linkToFolderByName,toggleToolbarButtons:toggleToolbarButtons,clipboard:clipboard,getDetailsPane:function(){return detailsPane
}})
}catch(e){throw e
}};
var initGrid=function(){var gridStoreFields=[],sizeColumnAvailable=false,gridPagingToolBar,gridPagerInfo,sharedGridPagerInfo,gridStdToolBar,gridItemsInfo,trashInfo,gridDropTarget=null,sharedGridDropTarget=null,listFilters=[],gridColumns=[],gridFilters,sRowTypeExist=false,qtipExist=false,recentGroupExist=false,trashNameExist=false,watchExist=false,labelsExist=false;
try{var sizeColumnExist=false;
Ext.each(htcConfig.fileListColumns,function(col){if((col.state&1)||(col.state&2)){var field={name:col.name,type:col.type};
if(col.type==="date"){field.dateFormat=col.dateFormat
}if(col.name==="size"){sizeColumnExist=true;
if(col.state&2){sizeColumnAvailable=true
}}if(col.name==="labels"){field.name="label";
gridStoreFields.push({name:"label_color",type:"string"},{name:"label_user",type:"string"},{name:"label_date",type:"date",dateFormat:"timestamp"});
labelsExist=true
}if(htcConfig.enableRecents){if(col.name==="srowtype"){sRowTypeExist=true;
field.type="string"
}if(col.name==="qtip"){qtipExist=true;
field.type="string"
}if(col.name==="recentgroup"){recentGroupExist=true;
field.type="int"
}}if(htcConfig.enableTrash){if(col.name=="trashname"){trashNameExist=true;
field.type="string"
}}if(htcConfig.watchForModifs){if(col.name=="watchForModifs"){watchExist=true;
field.type="auto"
}}gridStoreFields.push(field)
}if((col.state&8)&&(col.state&2)){showMetaDataInList=true
}});
if(!sizeColumnExist){gridStoreFields.push({name:"size_hidden",type:"int",defaultValue:1})
}if(htcConfig.enableRecents){if(!sRowTypeExist){gridStoreFields.push({name:"srowtype",type:"string"})
}if(!qtipExist){gridStoreFields.push({name:"qtip",type:"string"})
}if(!recentGroupExist){gridStoreFields.push({name:"recentgroup",type:"int"})
}}if(htcConfig.enableTrash&&!trashNameExist){gridStoreFields.push({name:"trashname",type:"string"})
}if(htcConfig.watchForModifs&&!watchExist){gridStoreFields.push({name:"watchForModifs",type:"auto"})
}if(!showMetaDataInList){showMetaDataInList=htcConfig.showFileMarkWhenExistsDetails
}if(!labelsExist){gridStoreFields.push({name:"label",type:"string"},{name:"label_color",type:"string"},{name:"label_user",type:"string"},{name:"label_date",type:"date",dateFormat:"timestamp"})
}if(htcConfig.timeIntervalMarkRecentlyCreatedFiles>0){gridStoreFields.push({name:"isnew",type:"boolean"})
}if(htcConfig.timeIntervalMarkRecentlyModifiedFiles>0){gridStoreFields.push({name:"ismod",type:"boolean"})
}gridStoreFields.push({name:"isdet",type:"boolean"});
gridStoreFields.push({name:"comments",type:"int"});
if(htcConfig.enableMSOfficeEdit||htcConfig.enableOpenOfficeEdit||htcConfig.enableWebFoldersLinks){gridStoreFields.push({name:"locked",type:"boolean"})
}if(htcConfig.enableVersionControl){gridStoreFields.push({name:"vstate",type:"int"})
}gridStoreFields.push({name:"isshortcut",type:"boolean"});
gridStoreFields.push({name:"publiclinks",type:"int"});
gridStoreFields.push({name:"icon_normal",type:"string"});
gridStoreFields.push({name:"icon_big",type:"string"});
gridStoreFields.push({name:"icon_large",type:"string"});
gridStoreFields.push({name:"attributes",type:"string"})
}catch(e){ProcessScriptError(e)
}var getSelectedAndTotalFilesFolders=function(gridPanel){var result={selectedFiles:0,totalFiles:0,selectedFolders:0,totalFolders:0};
if(sizeColumnAvailable){result.selectedSize=0;
result.totalSize=0
}if(gridPanel){var rows=gridPanel.getStore();
var sm=gridPanel.getSelectionModel();
if(sm&&rows&&rows.getRange){rows=rows.getRange();
if(rows&&rows.length>0){try{Ext.each(rows,function(r){if(r.data.rowtype=="file"){result.totalFiles++;
var rSize=0;
if(sizeColumnAvailable&&r.data.size!=null&&String(r.data.size)!=""){try{rSize=parseInt(r.data.size);
result.totalSize+=rSize
}catch(e){}}if(sm.isSelected(r)){result.selectedFiles++;
if(sizeColumnAvailable&&rSize>0){result.selectedSize+=rSize
}}}else{if(r.data.rowtype=="folder"||r.data.rowtype=="rootfolder"){result.totalFolders++;
if(sm.isSelected(r)){result.selectedFolders++
}}}})
}catch(e){}}}}return result
};
var fillInfoAboutSelectedAndTotalFilesFolders=function(gridPanel,usedTrashMsg){if(gridPanel&&gridPanel.getStore){var store=gridPanel.getStore();
if(store){var gfb=gridPanel.fbar;
if(gfb&&gridItemsInfo){if(trashInfo&&isTrashFolder()){gridItemsInfo.hide()
}else{var ffInfo=getSelectedAndTotalFilesFolders(gridPanel);
var html="<b>";
var mainTplInfo=htcConfig.locData.GridBottomFilesFoldersInfo;
if(sizeColumnAvailable){html+=String.format(htcConfig.locData.GridBottomFilesSizeInfo,renderers.sizeRenderer(ffInfo.selectedSize),renderers.sizeRenderer(ffInfo.totalSize))
}else{mainTplInfo=mainTplInfo.substring(0,1).toUpperCase()+mainTplInfo.substring(1)
}html+=String.format(mainTplInfo,ffInfo.selectedFiles,ffInfo.totalFiles,ffInfo.selectedFolders,ffInfo.totalFolders)+"</b>";
gridItemsInfo.el.dom.innerHTML=html;
gridItemsInfo.show()
}}if(gfb&&trashInfo){if(!isTrashFolder()){trashInfo.hide()
}else{if(!Ext.isEmpty(usedTrashMsg)){trashInfo.el.dom.innerHTML='<span style="font-weight:bold;">'+usedTrashMsg+"</span>"
}trashInfo.show()
}}if(pagingEnabled){var gbb=gridPanel.getBottomToolbar();
if(gbb&&gridPagerInfo){var needRefresh=false;
var pageData=gbb.getPageData();
var totalCount=store.getTotalCount();
var count=store.getCount();
var fIndex=store.findBy(function(rec,id){return rec.get("rowtype").toLowerCase()==="uplink"
});
if(fIndex>-1){count--
}if(store.reader.jsonData.position&&store.reader.jsonData.position>-1){gbb.cursor=store.reader.jsonData.position;
pageData=gbb.getPageData();
var ap=pageData.activePage,ps=pageData.pages;
if(ap>ps){needRefresh=true
}gbb.afterTextItem.setText(String.format(gbb.afterPageText,pageData.pages));
gbb.inputItem.setValue(ap);
gbb.first.setDisabled(ap==1);
gbb.prev.setDisabled(ap==1);
gbb.next.setDisabled(ap>=ps);
gbb.last.setDisabled(ap>=ps);
gbb.refresh.enable();
gbb.updateInfo()
}gridPagerInfo.setText(count==0?htcConfig.locData.PagingToolbarEmptyMsg:String.format(htcConfig.locData.PagingToolbarDisplayMsg,gbb.cursor+1,gbb.cursor+count,totalCount));
gbb.fireEvent("change",this,pageData);
var isSpecialFolder=isRecentFolder();
if(isSpecialFolder||(htcConfig.itemsPerPage>=totalCount&&pageData.activePage>=1&&pageData.activePage<=pageData.pages)){gbb.hide()
}else{gbb.show()
}if(needRefresh){gbb.movePrevious()
}}}if(gfb){gfb.doLayout(true,true)
}}}};
var createGridDropTarget=function(grd){if(gridDropTarget){gridDropTarget.destroy()
}gridDropTarget=null;
if(grd.enableDragDrop){try{gridDropTarget=new Ext.dd.DropTarget(grd.getView().scroller.dom,{ddGroup:$("GridDD"),dropOK:false,dtGrid:grd,curTargetRow:null,notifyOver:function(ddSource,e,data){if(this.curTargetRow){Ext.fly(this.curTargetRow).removeClass("x-drop-target-active")
}this.curTargetRow=null;
this.dropOK=false;
var source=ddSource.dragData.node;
var extFile="";
var grdView;
var curFolder=getCurrentFolder().toLowerCase().trim();
var targetRow,target;
try{grdView=this.dtGrid.getView();
var targetEl=e.getTarget(grdView.rowSelector);
targetRow=grdView.findRow(targetEl);
target=this.dtGrid.getStore().getAt(grdView.findRowIndex(targetEl))
}catch(err){return this.dropNotAllowed
}var ddAllow=dragDropPermission(source,target);
if(!ddAllow.allow){return this.dropNotAllowed
}try{if(target){if(target.data.rowtype=="sharedroot"){if(!ddAllow.share){return this.dropNotAllowed
}}else{if(target.data.rowtype=="trashroot"){if(!ddAllow.del){return this.dropNotAllowed
}}else{if(target.data.rowtype=="file"){extFile=HttpCommander.Lib.Utils.getFileExtension(target.data.name)
}if(target.data.rowtype!="folder"&&!(target.data.rowtype=="file"&&extFile=="zip")&&!(target.data.rowtype=="uplink"&&curFolder.indexOf("/")>-1)){return this.dropNotAllowed
}if((target.data.rowtype=="folder"||target.data.rowtype=="uplink")&&!ddAllow.dnd){return this.dropNotAllowed
}if(target.data.rowtype=="file"&&extFile=="zip"&&!ddAllow.zip){return this.dropNotAllowed
}}}}else{if(isTrashFolder()){if(!ddAllow.del){return this.dropNotAllowed
}}else{if(!ddAllow.dnd){return this.dropNotAllowed
}}}}catch(err){return this.dropNotAllowed
}if(source){if(source.isRoot||!source.parentNode){return this.dropNotAllowed
}if(!target||target.data.rowtype!="sharedroot"){if(source.parentNode.isRoot){return this.dropNotAllowed
}var nodeFolder=source.attributes.path.toLowerCase().trim();
if(curFolder.indexOf(nodeFolder)==0){return this.dropNotAllowed
}var parentNodeFolder=source.parentNode.attributes.path.toLowerCase().trim();
if(!target&&curFolder==parentNodeFolder){return this.dropNotAllowed
}if(target){var fName="";
if(target.data.rowtype=="folder"){fName=curFolder+"/"+target.data.name.toLowerCase().trim()
}else{if(target.data.rowtype!="file"){fName=curFolder.substring(0,curFolder.lastIndexOf("/"));
if(fName==parentNodeFolder){return this.dropNotAllowed
}}}if(fName==nodeFolder){return this.dropNotAllowed
}}}}else{source=ddSource.dragData.selections;
if(!source||!target||!Ext.isArray(source)||source.length<1){return this.dropNotAllowed
}if(this.dtGrid.getSelectionModel().isSelected(target)){return this.dropNotAllowed
}}if(targetRow){this.curTargetRow=targetRow;
Ext.fly(this.curTargetRow).addClass("x-drop-target-active")
}this.dropOK=true;
return this.dropAllowed
},notifyOut:function(ddSource,e,data){if(this.curTargetRow){Ext.fly(this.curTargetRow).removeClass("x-drop-target-active")
}},notifyEnter:function(ddSource,e,data){var ddAllow=dragDropPermission(ddSource.dragData.node);
if(!ddAllow.allow){return this.dropNotAllowed
}var recs=ddSource.dragData.selections;
if(recs&&Ext.isArray(recs)&&recs.length>0){var folders=0,files=0;
Ext.each(recs,function(r){if(r.data.rowtype=="file"){files++
}else{if(r.data.rowtype=="folder"){folders++
}}});
var ddHtml="";
if(files>0){ddHtml=String.format(htcConfig.locData.GridDDSelectedFilesText,files)
}if(folders>0){if(ddHtml!=""){ddHtml+="<br />"
}ddHtml+=String.format(htcConfig.locData.GridDDSelectedFoldersText,folders)
}if(ddHtml!=""){data.ddel.innerHTML=ddHtml
}}},notifyDrop:function(ddSource,e,data){if(this.curTargetRow){Ext.fly(this.curTargetRow).removeClass("x-drop-target-active")
}this.curTargetRow=null;
var source=ddSource.dragData.node;
var target;
try{var grdView=this.dtGrid.getView();
target=this.dtGrid.getStore().getAt(grdView.findRowIndex(e.getTarget(grdView.rowSelector)))
}catch(err){Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:err,icon:Msg.ERROR,buttons:Msg.OK});
return false
}var ddAllow=dragDropPermission(source,target);
if(!ddAllow.allow){this.dropOK=false
}clipboard.clear();
if(!this.dropOK){return false
}this.dropOK=false;
var addToZip=false,moveToTrash=false,createShare=false;
if(target){addToZip=(target.data.rowtype=="file");
moveToTrash=(target.data.rowtype=="trashroot");
createShare=(target.data.rowtype=="sharedroot");
if(addToZip&&(HttpCommander.Lib.Utils.getFileExtension(target.data.name)!="zip"||!ddAllow.zip)){return false
}}else{if(isTrashFolder()){moveToTrash=true
}}if(moveToTrash&&!ddAllow.del){return false
}if(createShare&&!ddAllow.share){return false
}var curFolder=getCurrentFolder();
var srcPath,perms;
if(source){try{perms=eval("("+source.attributes.permissions+")")
}catch(e){}srcPath=source.parentNode.attributes.path;
var temp=[];
temp.push({data:{name:source.attributes.name,rowtype:"folder"}});
source=temp
}else{if(!target){return false
}perms=htcConfig.currentPerms;
source=ddSource.dragData.selections;
srcPath=curFolder
}try{if(!createShare&&!moveToTrash){clipboard.setItems(createDraggedSet(source,srcPath));
clipboard.srcPath=curFolder
}var draggedFiles="",draggedFolders="";
Ext.each(source,function(rec){if(rec.data.rowtype=="file"){draggedFiles+=", "+Ext.util.Format.htmlEncode(rec.data.name)
}else{if(rec.data.rowtype=="folder"){draggedFolders+=", "+Ext.util.Format.htmlEncode(rec.data.name)
}}});
var draggedItemsText="";
if(draggedFiles!=""){draggedItemsText=String.format(htcConfig.locData.GridDDDraggedFileNames,draggedFiles.substring(1))
}if(draggedFolders!=""){if(draggedItemsText!=""){draggedItemsText+=".<br />"
}draggedItemsText+=String.format(htcConfig.locData.GridDDDraggedFolderNames,draggedFolders.substring(1))
}if(createShare){dropDraggedForShare(source[0],srcPath,perms);
return
}else{if(moveToTrash){dropDraggedToTrash(target,createDraggedSet(source,srcPath,true));
return true
}else{if(addToZip){if(htcConfig.allowSetPasswordForZipArchives){(new Window({title:String.format(htcConfig.locData.GridDDConfirmAddToZipTitle,Ext.util.Format.htmlEncode(target.data.name)),autoHeight:true,width:300,buttonAlign:"center",defaultButton:0,modal:true,plain:true,layout:"form",bodyStyle:"padding:5px",labelAlign:"top",defaults:{anchor:"100%",xtype:"textfield"},items:[{xtype:"label",html:String.format(htcConfig.locData.GridDDConfirmAddToZipMessage,"<br />"+draggedItemsText)+"<br /><br />"},{xtype:"pwdfield",fieldLabel:htcConfig.locData.AppendToZipPasswordProtectHint}],buttons:[{text:htcConfig.locData.CommonButtonCaptionOK,handler:function(){var pass=this.ownerCt.ownerCt.items.items[1].getValue();
if(String(pass||"").length>0){clipboard.password=pass
}else{clipboard.password=undefined
}dropDraggedToZip(target);
this.ownerCt.ownerCt.close()
}},{text:htcConfig.locData.CommonButtonCaptionCancel,handler:function(){this.ownerCt.ownerCt.close()
}}]})).show();
return true
}else{Msg.confirm(String.format(htcConfig.locData.GridDDConfirmAddToZipTitle,Ext.util.Format.htmlEncode(target.data.name)),String.format(htcConfig.locData.GridDDConfirmAddToZipMessage,"<br />"+draggedItemsText),function(btn){if(btn=="yes"){dropDraggedToZip(target);
return true
}else{clipboard.clear();
return false
}})
}return
}}}if(ddAllow.onlyMoveOrCopy){clipboard.isCut=ddAllow.move;
Msg.confirm(Ext.util.Format.htmlEncode(String.format(htcConfig.locData.GridDDConfirmCopyMoveTitle,target?(target.data.rowtype=="folder"?target.data.name:curFolder.substring(0,curFolder.lastIndexOf("/"))):curFolder)),(ddAllow.move?String.format(htcConfig.locData.GridDDConfirmTargetFolderOnlyMoveMsg,"<br />"+draggedItemsText):String.format(htcConfig.locData.GridDDConfirmTargetFolderOnlyCopyMsg,"<br />"+draggedItemsText)),function(btn){if(btn=="yes"){dropDraggedSet(target);
return true
}else{clipboard.clear();
return false
}});
return
}Msg.show({title:Ext.util.Format.htmlEncode(String.format(htcConfig.locData.GridDDConfirmCopyMoveTitle,target?(target.data.rowtype=="folder"?target.data.name:curFolder.substring(0,curFolder.lastIndexOf("/"))):curFolder)),msg:String.format(htcConfig.locData.GridDDConfirmCopyMoveMsg,Ext.util.Format.htmlEncode(srcPath),Ext.util.Format.htmlEncode(target?(target.data.rowtype=="folder"?(curFolder+"/"+target.data.name):curFolder.substring(0,curFolder.lastIndexOf("/"))):curFolder),"<br />"+draggedItemsText,"&nbsp;"),buttons:{yes:htcConfig.locData.CommandMove,no:htcConfig.locData.CommandCopy,cancel:htcConfig.locData.CommonButtonCaptionCancel},fn:function(btn){if(btn=="yes"||btn=="no"){clipboard.isCut=(btn=="yes");
dropDraggedSet(target)
}else{clipboard.clear();
Msg.hide()
}}})
}catch(err){clipboard.clear();
Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:err,icon:Msg.ERROR,buttons:Msg.CANCEL});
return false
}return true
}})
}catch(e){ProcessScriptError(e)
}}};
var createSharedGridDropTarget=function(grd){if(sharedGridDropTarget){sharedGridDropTarget.destroy()
}sharedGridDropTarget=null;
if(grd.enableDragDrop){try{sharedGridDropTarget=new Ext.dd.DropTarget(grd.getView().scroller.dom,{ddGroup:$("GridDD"),dropOK:false,dtGrid:grd,curTargetRow:null,notifyOver:function(ddSource,e,data){if(this.curTargetRow){Ext.fly(this.curTargetRow).removeClass("x-drop-target-active")
}this.dropOK=false;
var source=ddSource.dragData.node;
var ddAllow=dragDropPermission(source,{data:{path:_SHARED_}});
if(!ddAllow.allow){return this.dropNotAllowed
}this.dropOK=true;
return this.dropAllowed
},notifyOut:function(ddSource,e,data){if(this.curTargetRow){Ext.fly(this.curTargetRow).removeClass("x-drop-target-active")
}},notifyDrop:function(ddSource,e,data){if(this.curTargetRow){Ext.fly(this.curTargetRow).removeClass("x-drop-target-active")
}var source=ddSource.dragData.node;
var ddAllow=dragDropPermission(source,{data:{path:_SHARED_}});
if(!ddAllow.allow){this.dropOK=false
}if(!this.dropOK){return false
}this.dropOK=false;
var srcPath,perms;
try{perms=eval("("+source.attributes.permissions+")")
}catch(e){}srcPath=source.parentNode.attributes.path;
var temp=[];
temp.push({data:{name:source.attributes.name,rowtype:"folder"}});
source=temp;
dropDraggedForShare(source[0],srcPath,perms);
return true
}})
}catch(e){ProcessScriptError(e)
}}};
try{var mainGridSortInfo=HttpCommander.Lib.Utils.getCookie($("sortinfo"));
if(!Ext.isEmpty(mainGridSortInfo)){mainGridSortInfo=mainGridSortInfo.split(":");
var si={field:mainGridSortInfo[0],direction:"ASC"};
if(mainGridSortInfo.length>1){var dirInfo=mainGridSortInfo[1];
if(!Ext.isEmpty(dirInfo)){dirInfo=dirInfo.toUpperCase();
if(dirInfo=="ASC"||dirInfo=="DESC"){si.direction=dirInfo
}}}if(Ext.isEmpty(si.field)||si.field.trim().length==0){si.field="name"
}mainGridSortInfo=si
}else{mainGridSortInfo={field:"name",direction:"ASC"}
}gridStore=new Ext.data.DirectStore({remoteSort:true,baseParams:{start:0,limit:pagingEnabled?htcConfig.itemsPerPage:0,path:"root",fAllow:null,fIgnore:null,fARegexp:null,fIRegexp:null,selectPath:null},directFn:HttpCommander.Grid.FastLoadPage,paramOrder:["start","limit","sort","dir","path","fAllow","fIgnore","fARegexp","fIRegexp","selectPath"],idProperty:"id",totalProperty:"total",successProperty:"success",root:"data",sortInfo:mainGridSortInfo,fields:gridStoreFields,defaultRequestTimeout:Ext.Ajax.timeout,listeners:{beforeload:function(store,opts){Ext.Ajax.timeout=HttpCommander.Lib.Consts.gridRequestTimeout;
this.baseParams.fAllow=null;
this.baseParams.fIgnore=null;
this.baseParams.fARegexp=null;
this.baseParams.fIRegexp=null;
this.baseParams.selectPath=null;
if(this.baseParams.path=="root"){var filter=HttpCommander.Lib.Utils.getFolderFilter();
if(filter.folderFilterAllow){this.baseParams.fAllow=filter.folderFilterAllow
}if(filter.folderFilterIgnore){this.baseParams.fIgnore=filter.folderFilterIgnore
}if(filter.folderFilterAllowRegexp){this.baseParams.fARegexp=filter.folderFilterAllowRegexp
}if(filter.folderFilterIgnoreRegexp){this.baseParams.fIRegexp=filter.folderFilterIgnoreRegexp
}}else{if(selectPath!=null&&selectPath.path==this.baseParams.path&&!selectPath.userSelect){this.baseParams.selectPath=selectPath.name
}}if(!!detailsPane){detailsPane.forceRefresh=true
}},datachanged:function(store){if(grid){var curFolder=getCurrentFolder();
var hNotSet=true;
var limits="";
var needCurFolderEncode=true;
if(typeof store.reader.jsonData.limitations!="undefined"&&store.reader.jsonData.limitations!=""){limits=' <span class="x-grid3-cell-text" style="display: inline;">('+Ext.util.Format.htmlEncode(store.reader.jsonData.limitations)+")</span>"
}var hSpanDom;
var tbg=grid.getTopToolbar();
if(tbg){var qsn=tbg.getComponent($("quick-search-by-name-fld"));
var qsc=tbg.getComponent($("quick-search-by-content-fld"));
var issf=isSpecialTreeFolderOrSubFolder(curFolder);
if(qsn){qsn.setVisible(!issf&&htcConfig.searchEnabled)
}if(qsc){qsc.setVisible(!issf&&htcConfig.searchEnabled&&htcConfig.searchCriterions.content)
}var hEl=tbg.getComponent("path-info");
if(hEl){var hSpan=hEl.el;
if(hSpan){hSpanDom=hSpan.dom
}}}if(curFolder.toLowerCase()=="root"){curFolder="root";
needCurFolderEncode=false
}else{if(String(curFolder)==""){curFolder="&nbsp;";
needCurFolderEncode=false
}else{var isRcnt=isRecentFolder(curFolder);
var pathParts=curFolder.split("/");
var len=pathParts.length;
if(len>0&&hSpanDom){hSpanDom.innerHTML="";
var a=document.createElement("span");
a.className="link-emul"+(isBlackTheme?" white-text-color":"");
a.path="root";
a.style.fontWeight="bold";
a.onclick=function(){if(this&&this.path){openGridFolder(this.path,true)
}return false
};
a.innerHTML="root";
hSpanDom.appendChild(a);
var path="",aEl,pathP;
for(var i=0;
i<len-1;
i++){pathP=pathParts[i];
hSpanDom.appendChild(document.createTextNode("\\"));
path+=(path.length==0?"":"/")+pathP;
aEl=document.createElement("span");
aEl.href="";
aEl.className="link-emul"+(isBlackTheme?" white-text-color":"");
aEl.path=path;
aEl.style.fontWeight="bold";
aEl.onclick=function(){if(this&&this.path){openGridFolder(this.path,true)
}return false
};
aEl.innerHTML=Ext.util.Format.htmlEncode(getFolderTitle(pathP));
hSpanDom.appendChild(aEl)
}pathP=pathParts[len-1];
hSpanDom.appendChild(document.createTextNode("\\"));
hSpanDom.appendChild(document.createTextNode(getFolderTitle(pathP)));
if(limits.length>0){var sl=document.createElement("span");
sl.innerHTML=limits;
hSpanDom.appendChild(sl)
}hNotSet=false
}if(hNotSet){var curFolderInfo="\\"+(needCurFolderEncode?Ext.util.Format.htmlEncode(curFolder.replace(/\//g,"\\")):curFolder.replace(/\//g,"\\"))+limits;
if(hSpanDom){hSpanDom.innerHTML="";
hSpanDom.appendChild(document.createTextNode(curFolderInfo))
}hNotSet=false
}}}if(hNotSet){var curFolderInfo=(needCurFolderEncode?Ext.util.Format.htmlEncode(curFolder):curFolder)+limits;
if(hSpanDom){hSpanDom.innerHTML="";
hSpanDom.appendChild(document.createTextNode(curFolderInfo))
}}toggleToolbarButtons();
var usedTrashMsg=null;
if(htcConfig.enableTrash&&isTrashFolder(curFolder)){var trashNode=null,percent=null,usedTrashSize=null,qtip="",tmp;
if(tree){trashNode=tree.getRootNode().findChild("path",_TRASH_)
}if(store.reader&&store.reader.jsonData&&Ext.isNumber(store.reader.jsonData.usedbytes)){usedTrashSize=store.reader.jsonData.usedbytes
}if(Ext.isNumber(htcConfig.trashSize)&&htcConfig.trashSize>0){percent="0%";
if(store.reader.jsonData.usedbytes>0){percent=""+Math.round((usedTrashSize*100)/htcConfig.trashSize)+"%"
}usedTrashMsg=Ext.util.Format.htmlEncode(String.format(htcConfig.locData.TrashUsedSpaceHint,percent))
}else{if(Ext.isNumber(usedTrashSize)){usedTrashMsg=Ext.util.Format.htmlEncode(String.format(htcConfig.locData.TrashUsedSpaceHint,renderers.sizeRenderer(""+(usedTrashSize<0?0:usedTrashSize))))
}}if(!Ext.isEmpty(usedTrashMsg)&&trashNode){trashNode.setText(Ext.util.Format.htmlEncode(htcConfig.locData.TrashRootTitle)+"&nbsp;("+usedTrashMsg+")")
}if(!Ext.isEmpty(percent)){usedTrashMsg=Ext.util.Format.htmlEncode(String.format(htcConfig.locData.TrashLimitSizeHint,renderers.sizeRenderer(""+(usedTrashSize<0?0:usedTrashSize)),renderers.sizeRenderer(""+htcConfig.trashSize),percent));
qtip+=usedTrashMsg+"<br />"
}else{if(Ext.isNumber(usedTrashSize)){Ext.util.Format.htmlEncode(String.format(htcConfig.locData.TrashUsedSpaceHint,renderers.sizeRenderer(""+(usedTrashSize<0?0:usedTrashSize))));
qtip+=usedTrashMsg+"<br />"
}}if(Ext.isNumber(htcConfig.trashLargeItemSize)&&htcConfig.trashLargeItemSize>0){tmp=Ext.util.Format.htmlEncode(String.format(htcConfig.locData.TrashLargeItemsShelfTimeHint,renderers.sizeRenderer(""+htcConfig.trashLargeItemSize),htcConfig.trashLargeItemShelfDays));
qtip+=tmp;
if(!Ext.isEmpty(usedTrashMsg)){usedTrashMsg+=".&nbsp;"+tmp
}else{usedTrashMsg+=tmp
}tmp=Ext.util.Format.htmlEncode(String.format(htcConfig.locData.TrashSmallItemsShelfTimeHint,htcConfig.trashSmallItemShelfDays));
usedTrashMsg+=".&nbsp;"+tmp;
qtip+="<br />"+tmp
}else{tmp=Ext.util.Format.htmlEncode(String.format(htcConfig.locData.TrashItemsShelfTimeHint,htcConfig.trashSmallItemShelfDays));
qtip+=tmp;
if(!Ext.isEmpty(usedTrashMsg)){usedTrashMsg+=".&nbsp;"+tmp
}else{usedTrashMsg+=tmp
}}if(trashNode){trashNode.attributes.qtip=qtip;
if(trashNode.rendered&&trashNode.ui&&trashNode.ui.textNode){var tn=trashNode.ui.textNode;
if(tn.setAttributeNS){tn.setAttributeNS("ext","qtip",qtip)
}else{tn.setAttribute("ext:qtip",qtip)
}}}}fillInfoAboutSelectedAndTotalFilesFolders(grid,usedTrashMsg);
if(grid.toggledRecent){var colModel=grid.getColumnModel(),isRecent=isRecentFolder(),recentCol=colModel.getColumnById("col-daterecent"),recentIndex=colModel.getIndexById("col-daterecent"),modifCol=colModel.getColumnById("col-datemodified"),modifIndex=colModel.getIndexById("col-datemodified"),createCol=colModel.getColumnById("col-datecreated"),createIndex=colModel.getIndexById("col-datecreated"),accessCol=colModel.getColumnById("col-dateaccessed"),accessIndex=colModel.getIndexById("col-dateaccessed"),setColHidden=function(col,idx,hidden){if(!!col&&idx>=0){col.hideable=!hidden;
colModel.setHidden(idx,hidden?true:keepColsOnViewRecents.hasOwnProperty(col.dataIndex)?!keepColsOnViewRecents[col.dataIndex]:false,true)
}};
setColHidden(recentCol,recentIndex,!isRecent);
setColHidden(modifCol,modifIndex,isRecent);
setColHidden(createCol,createIndex,isRecent);
setColHidden(accessCol,accessIndex,isRecent);
grid.getView().refresh(true)
}}},load:function(store,records,options){charsGrid=[];
Ext.Ajax.timeout=store.defaultRequestTimeout;
var jsonData={};
if(!!store&&!!store.reader&&Ext.isObject(store.reader.jsonData)){jsonData=store.reader.jsonData
}htcConfig.currentPerms=eval("("+jsonData.permissions+")");
htcConfig.folderDescription=!Ext.isEmpty(jsonData.desc)?String(jsonData.desc):"";
htcConfig.readmeContent=!Ext.isEmpty(jsonData.readme)?String(jsonData.readme):"&nbsp;";
if(!jsonData.success){Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:jsonData.tpiid===true?String.format(jsonData.msg||"Unknown error",htcConfig.relativePath||""):(jsonData.msg||"Unknown error"),icon:Msg.ERROR,buttons:Msg.OK})
}var curFolder=getCurrentFolder();
var fIndex=-1;
var rowSelected=false;
try{if(selectPath!=null&&selectPath.path==curFolder){var isTrash=isTrashFolder();
fIndex=gridStore.findBy(function(rec,id){return(isTrash?rec.get("trashname"):rec.get("name")).toLowerCase()==selectPath.name.toLowerCase()
});
if(fIndex>=0){var selModel=grid.getSelectionModel();
if(!selModel.isSelected(fIndex)){selModel.selectRow(fIndex,false)
}var row=grid.getView().getRow(fIndex<=1?0:fIndex);
if(row){row.scrollIntoView();
grid.getView().holdPosition=true
}rowSelected=true
}else{if(selectPath.recent===true){var pathAndName=selectPath.path;
if(!Ext.isEmpty(selectPath.name)){if(Ext.isEmpty(pathAndName)){pathAndName=selectPath.name
}else{pathAndName+="/"+selectPath.name
}}if(!Ext.isEmpty(pathAndName)){Msg.hide();
Msg.alert(htcConfig.locData.CommonErrorCaption,Ext.util.Format.htmlEncode(String.format(htcConfig.locData.RecentPathNotExist,pathAndName)))
}}}selectPath=null
}}catch(e){selectPath=null;
ProcessScriptError(e)
}if(!!grid&&!!detailsPane){var selModel=grid.getSelectionModel();
if(!selModel||!selModel.getSelected()){detailsPane.prepareData(null,curFolder)
}}if(!!grid){var curPerms=htcConfig.currentPerms;
if(!!curPerms){grid.enableDragDrop=(curPerms.zip)||(curPerms.del&&htcConfig.enableTrash)||(curPerms.create&&(curPerms.cut||curPerms.copy))||(htcConfig.sharedInTree&&((htcConfig.enablePublicLinkToFile&&curPerms.download&&curPerms.anonymDownload)||(htcConfig.enablePublicLinkToFolder&&(((curPerms.download||curPerms.zipDownload)&&curPerms.anonymDownload)||(curPerms.upload&&curPerms.anonymUpload)||((curPerms.listFiles||curPerms.listFolders)&&curPerms.anonymViewContent)))))
}else{grid.enableDragDrop=htcConfig.enableTrash
}if(grid.enableDragDrop){createGridDropTarget(grid)
}else{if(gridDropTarget){gridDropTarget.destroy();
gridDropTarget=null
}}}if(Ext.isFunction(store.reloadTree)){store.reloadTree()
}store.reloadTree=null
},exception:function(proxy,type,action,options,res,arg){charsGrid=[];
this.reloadTree=null;
Ext.Ajax.timeout=gridStore.defaultRequestTimeout;
var curFolder=getCurrentFolder();
if(type==="remote"){var message="Message: "+Ext.util.Format.htmlEncode(res.message);
if(res.xhr){message="Status: "+Ext.util.Format.htmlEncode(res.xhr.status)+" "+Ext.util.Format.htmlEncode(res.xhr.statusText)+"<br />"+message
}Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:message,icon:Msg.ERROR,buttons:Msg.OK})
}}}})
}catch(e){ProcessScriptError(e)
}if(htcConfig.sharedInTree){try{sharedGridStore=new Ext.data.DirectStore({remoteSort:true,baseParams:{start:0,limit:pagingEnabled?htcConfig.itemsPerPage:0,linkPath:null,selectId:null},paramOrder:["start","limit","sort","dir","linkPath","selectId"],directFn:HttpCommander.Common.GetPageWithAnonymLinks,idProperty:"id",totalProperty:"total",successProperty:"success",root:"data",sortInfo:{field:"virt_path",direction:"ASC"},defaultRequestTimeout:Ext.Ajax.timeout,fields:[{name:"id",type:"int"},{name:"key",type:"string"},{name:"date",type:"date",dateFormat:"timestamp"},{name:"expires",type:"date",dateFormat:"timestamp"},{name:"withpasswd",type:"boolean"},{name:"password",type:"string"},{name:"virt_path",type:"string"},{name:"acl",type:"int"},{name:"downloads",type:"string"},{name:"notes",type:"string"},{name:"emails",type:"string"},{name:"upload_overwrite",type:"boolean"},{name:"isfolder",type:"boolean"},{name:"access_users",type:"string"},{name:"perms",mapping:"perms"},{name:"show_comments",type:"boolean"},{name:"icon",type:"string"},{name:"rowtype",type:"string"},{name:"icon_large",type:"string"},{name:"icon_normal",type:"string"},{name:"name",type:"string"},{name:"type",type:"string"},{name:"url",type:"string"},{name:"url2",type:"string"},{name:"shortUrl",type:"string"},{name:"shortUrl2",type:"string"}],listeners:{beforeload:function(store,opts){Ext.Ajax.timeout=HttpCommander.Lib.Consts.gridRequestTimeout;
if(Ext.isObject(sharedSelectPath)&&!sharedSelectPath.userSelect){this.baseParams.selectId=sharedSelectPath.id
}},datachanged:function(store){toggleToolbarButtons();
var hEl=(sharedGrid?sharedGrid.header:null),hSpan=(hEl?hEl.child("span"):null),hSpanDom=(hSpan?hSpan.dom:null);
if(hSpanDom){hSpanDom.innerHTML="";
var a=document.createElement("span");
a.className="link-emul";
a.path="root";
a.onclick=function(){if(this&&this.path){openGridFolder(this.path,true)
}return false
};
a.innerHTML="root";
hSpanDom.appendChild(a);
hSpanDom.appendChild(document.createTextNode("\\"));
hSpanDom.appendChild(document.createTextNode(htcConfig.locData.SharedByLinkRootTitle))
}if(pagingEnabled){var gbb=sharedGrid.getBottomToolbar();
if(gbb&&sharedGridPagingToolBar){var pageData=gbb.getPageData();
var totalCount=store.getTotalCount();
var count=store.getCount();
if(store.reader&&store.reader.jsonData&&Ext.isNumber(store.reader.jsonData.position)&&store.reader.jsonData.position>-1){gbb.cursor=store.reader.jsonData.position;
pageData=gbb.getPageData();
var ap=pageData.activePage,ps=pageData.pages;
gbb.afterTextItem.setText(String.format(gbb.afterPageText,pageData.pages));
gbb.inputItem.setValue(ap);
gbb.first.setDisabled(ap==1);
gbb.prev.setDisabled(ap==1);
gbb.next.setDisabled(ap==ps);
gbb.last.setDisabled(ap==ps);
gbb.refresh.enable();
gbb.updateInfo()
}sharedGridPagerInfo.setText(count==0?htcConfig.locData.PagingToolbarEmptyMsg:String.format(htcConfig.locData.PagingToolbarDisplayMsg,gbb.cursor+1,gbb.cursor+count,totalCount));
gbb.fireEvent("change",this,pageData);
if(htcConfig.itemsPerPage>=totalCount&&pageData.activePage>=1&&pageData.activePage<=pageData.pages){gbb.hide()
}else{gbb.show()
}}}},load:function(store,records,options){charsGrid=[];
Ext.Ajax.timeout=store.defaultRequestTimeout;
if(store.reader&&store.reader.jsonData&&!store.reader.jsonData.success){Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:store.reader.jsonData.message,icon:Msg.ERROR,buttons:Msg.OK})
}htcConfig.currentPerms=null;
var fIndex=-1;
try{if(Ext.isObject(sharedSelectPath)&&!Ext.isEmpty(sharedSelectPath.id)){fIndex=store.findBy(function(rec,id){return rec.get("id")==sharedSelectPath.id
});
if(fIndex>=0){var selModel=sharedGrid.getSelectionModel();
if(!selModel.isSelected(fIndex)){selModel.selectRow(fIndex,false)
}sharedGrid.getView().getRow(fIndex).scrollIntoView();
sharedGrid.getView().holdPosition=true
}sharedSelectPath=null
}}catch(e){sharedSelectPath=null;
ProcessScriptError(e)
}if(!!sharedGrid){sharedGrid.enableDragDrop=htcConfig.sharedInTree&&htcConfig.enablePublicLinkToFolder;
if(sharedGrid.enableDragDrop){createSharedGridDropTarget(sharedGrid)
}else{if(sharedGridDropTarget){sharedGridDropTarget.destroy();
sharedGridDropTarget=null
}}}},exception:function(proxy,type,action,options,res,arg){charsGrid=[];
if(sharedGridStore){Ext.Ajax.timeout=sharedGridStore.defaultRequestTimeout
}if(type==="remote"){var message="Message: "+Ext.util.Format.htmlEncode(res.message);
if(res.xhr){message="Status: "+Ext.util.Format.htmlEncode(res.xhr.status)+" "+Ext.util.Format.htmlEncode(res.xhr.statusText)+"<br />"+message
}Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:message,icon:Msg.ERROR,buttons:Msg.OK})
}}}})
}catch(e){ProcessScriptError(e)
}}if(htcConfig.sharedForYou){try{sharedFYGridStore=new Ext.data.DirectStore({remoteSort:true,baseParams:{start:0,limit:pagingEnabled?htcConfig.itemsPerPage:0,selectId:null},paramOrder:["start","limit","sort","dir","selectId"],directFn:HttpCommander.Common.GetSharedForYouAnonymLinks,sharedForYou:true,idProperty:"id",totalProperty:"total",successProperty:"success",root:"data",sortInfo:{field:"virtpath",direction:"ASC"},defaultRequestTimeout:Ext.Ajax.timeout,fields:[{name:"id",type:"int"},{name:"key",type:"string"},{name:"date",type:"date",dateFormat:"timestamp"},{name:"expires",type:"date",dateFormat:"timestamp"},{name:"withpasswd",type:"boolean"},{name:"virt_path",type:"string"},{name:"acl",type:"int"},{name:"notes",type:"string"},{name:"upload_overwrite",type:"boolean"},{name:"isfolder",type:"boolean"},{name:"show_comments",type:"boolean"},{name:"perms",mapping:"perms"},{name:"url",type:"string"},{name:"url2",type:"string"},{name:"shortUrl",type:"string"},{name:"shortUrl2",type:"string"},{name:"icon",type:"string"},{name:"rowtype",type:"string"},{name:"icon_large",type:"string"},{name:"icon_normal",type:"string"},{name:"name",type:"string"},{name:"type",type:"string"}],listeners:{beforeload:function(store,opts){Ext.Ajax.timeout=HttpCommander.Lib.Consts.gridRequestTimeout;
if(Ext.isObject(sharedFYSelectPath)&&!sharedFYSelectPath.userSelect){this.baseParams.selectId=sharedFYSelectPath.id
}},datachanged:function(store){toggleToolbarButtons();
var hEl=(sharedFYGrid?sharedFYGrid.header:null),hSpan=(hEl?hEl.child("span"):null),hSpanDom=(hSpan?hSpan.dom:null);
if(hSpanDom){hSpanDom.innerHTML="";
var a=document.createElement("span");
a.className="link-emul";
a.path="root";
a.onclick=function(){if(this&&this.path){openGridFolder(this.path,true)
}return false
};
a.innerHTML="root";
hSpanDom.appendChild(a);
hSpanDom.appendChild(document.createTextNode("\\"));
hSpanDom.appendChild(document.createTextNode(htcConfig.locData.SharedForYouRootTitle))
}if(pagingEnabled){var gbb=sharedFYGrid.getBottomToolbar();
if(gbb&&sharedFYGridPagingToolBar){var pageData=gbb.getPageData();
var totalCount=store.getTotalCount();
var count=store.getCount();
if(store.reader&&store.reader.jsonData&&Ext.isNumber(store.reader.jsonData.position)&&store.reader.jsonData.position>-1){gbb.cursor=store.reader.jsonData.position;
pageData=gbb.getPageData();
var ap=pageData.activePage,ps=pageData.pages;
gbb.afterTextItem.setText(String.format(gbb.afterPageText,pageData.pages));
gbb.inputItem.setValue(ap);
gbb.first.setDisabled(ap==1);
gbb.prev.setDisabled(ap==1);
gbb.next.setDisabled(ap==ps);
gbb.last.setDisabled(ap==ps);
gbb.refresh.enable();
gbb.updateInfo()
}sharedFYGridPagerInfo.setText(count==0?htcConfig.locData.PagingToolbarEmptyMsg:String.format(htcConfig.locData.PagingToolbarDisplayMsg,gbb.cursor+1,gbb.cursor+count,totalCount));
gbb.fireEvent("change",this,pageData);
if(htcConfig.itemsPerPage>=totalCount&&pageData.activePage>=1&&pageData.activePage<=pageData.pages){gbb.hide()
}else{gbb.show()
}}}},load:function(store,records,options){charsGrid=[];
Ext.Ajax.timeout=store.defaultRequestTimeout;
if(store.reader&&store.reader.jsonData&&!store.reader.jsonData.success){Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:store.reader.jsonData.message,icon:Msg.ERROR,buttons:Msg.OK})
}htcConfig.currentPerms=null;
var fIndex=-1;
try{if(Ext.isObject(sharedFYSelectPath)&&!Ext.isEmpty(sharedFYSelectPath.id)){fIndex=store.findBy(function(rec,id){return rec.get("id")==sharedFYSelectPath.id
});
if(fIndex>=0){var selModel=sharedFYGrid.getSelectionModel();
if(!selModel.isSelected(fIndex)){selModel.selectRow(fIndex,false)
}sharedFYGrid.getView().getRow(fIndex).scrollIntoView();
sharedFYGrid.getView().holdPosition=true
}sharedFYSelectPath=null
}}catch(e){sharedFYSelectPath=null;
ProcessScriptError(e)
}},exception:function(proxy,type,action,options,res,arg){charsGrid=[];
if(sharedFYGridStore){Ext.Ajax.timeout=sharedFYGridStore.defaultRequestTimeout
}if(type==="remote"){var message="Message: "+Ext.util.Format.htmlEncode(res.message);
if(res.xhr){message="Status: "+Ext.util.Format.htmlEncode(res.xhr.status)+" "+Ext.util.Format.htmlEncode(res.xhr.statusText)+"<br />"+message
}Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:message,icon:Msg.ERROR,buttons:Msg.OK})
}}}})
}catch(e){ProcessScriptError(e)
}}try{var uccs=[],uccsLength=0;
try{var ucc=HttpCommander.Lib.Utils.getCookie($("columns"));
if(!Ext.isEmpty(ucc)&&Ext.isString(ucc)){ucc=ucc.split(",");
if(ucc.length>0){Ext.each(ucc,function(uccItem,uccIndex){if(!Ext.isEmpty(uccItem)){var uci=uccItem.split(":");
if(uci.length>0){var uColW=uci.length>1?parseInt(uci[1],10):0;
var uColN=uci[0];
var uColH=((uci.length>2&&uci[2]==="false")||(uColW<=0))?true:false;
if(!Ext.isEmpty(uColN)&&uColN.trim().length>0){var uCol={name:uColN.toLowerCase(),hidden:uColH};
if(uColW>0){uCol.width=uColW
}uccs.push(uCol)
}}}})
}}}catch(e){}uccsLength=uccs.length;
Ext.each(htcConfig.fileListColumns,function(col){if((col.state&2)||(col.name=="daterecent")){var ff={dataIndex:col.name,type:col.type};
var gf={dataIndex:col.name,id:"col-"+col.name};
if(col.width>0){gf.width=col.width
}if(col.type==="date"){ff.afterText=htcConfig.locData.AfterDateFilterText;
ff.beforeText=htcConfig.locData.BeforeDateFilterText;
ff.onText=htcConfig.locData.OnDateFilterText;
gf.width=gf.width||140;
gf.renderer=renderers.dateRendererWithQTip;
switch(col.name){case"datemodified":gf.header=htcConfig.locData.CommonFieldLabelDateModified;
break;
case"datecreated":gf.header=htcConfig.locData.CommonFieldLabelDateCreated;
break;
case"dateaccessed":gf.header=htcConfig.locData.CommonFieldLabelDateAccessed;
break;
case"daterecent":gf.header=htcConfig.locData.CommonFieldLabelDate;
gf.hideable=false;
break
}}else{if(col.name=="size"){ff.type="numeric";
ff.menuItemCfgs={emptyText:htcConfig.locData.EmptyTextFilter};
gf.header=htcConfig.locData.CommonFieldLabelSize;
gf.width=gf.width||70;
gf.renderer=renderers.sizeRenderer
}else{ff.emptyText=htcConfig.locData.EmptyTextFilter;
switch(col.name){case"name":gf.header=htcConfig.locData.CommonFieldLabelName;
gf.width=gf.width||200;
gf.id="name";
gf.renderer=renderers.nameRenderer;
gf.editor=new Ext.form.TextField({width:100,listeners:{show:function(edt){if(!edt||!edt.getValue){return
}var selTFM=getSelTypeFilesModel(grid),isFile=selTFM&&selTFM.selType=="file",val=String(edt.getValue()),dot=isFile?val.lastIndexOf("."):val.length;
edt.selectText(0,dot<0?val.length:dot)
}}});
break;
case"type":gf.header=htcConfig.locData.CommonFieldLabelType;
gf.width=gf.width||140;
gf.renderer=renderers.qtipCellRenderer;
break;
case"labels":gf.dataIndex="label";
gf.header=htcConfig.locData.CommonFieldLabelLabels;
gf.width=gf.width||120;
gf.sortable=false;
gf.renderer=renderers.labelRenderer;
break;
case"downloads":ff.type="numeric";
ff.menuItemCfgs={emptyText:htcConfig.locData.EmptyTextFilter};
gf.header=htcConfig.locData.AmountOfDownloadingsFile;
gf.width=gf.width||70;
gf.renderer=function(d){return(!Ext.isNumber(d)||d<=0)?"":String(d)
};
break;
default:var colHeader=col.header;
if(colHeader.toLowerCase()=="comment"){colHeader=htcConfig.locData.CommonFieldLabelComments
}else{if(colHeader.toLowerCase()=="description"){colHeader=htcConfig.locData.CommonFieldLabelDescription
}}gf.header=Ext.util.Format.htmlEncode(colHeader);
gf.renderer=renderers.qtipCellRenderer;
break
}}}if(col.name!="labels"){listFilters.push(ff)
}if(!(col.state&4)){gf.hidden=true
}if(uccsLength>0){var uColFound=false;
for(var k=0;
k<uccsLength;
k++){if(uccs[k].name==gf.dataIndex.toLowerCase()){gf.hidden=uccs[k].hidden;
if(uccs[k].width>0){gf.width=uccs[k].width
}uColFound=true;
break
}}if(!uColFound){gf.hidden=true
}}if(col.name=="daterecent"){gf.hidden=true
}if(keepColsOnViewRecents.hasOwnProperty(col.name)){keepColsOnViewRecents[col.name]=!gf.hidden
}gridColumns.push(gf)
}});
var allColsHidden=true,nameIndex=-1;
for(var k=0;
k<gridColumns.length;
k++){if(!gridColumns[k].hidden){allColsHidden=false;
break
}else{if(gridColumns[k].dataIndex=="name"){nameIndex=k
}}}if(allColsHidden&&gridColumns.length>0){if(nameIndex<0){nameIndex=0
}gridColumns[nameIndex].hidden=false
}if(uccsLength>0){var sortedGridColumns=[];
for(var k=0;
k<uccsLength;
k++){var gcLength=gridColumns.length;
for(var l=0;
l<gcLength;
l++){if(gridColumns[l].dataIndex.toLowerCase()==uccs[k].name){sortedGridColumns.push(gridColumns[l]);
gridColumns.splice(l,1);
break
}}}for(var k=0;
k<gridColumns.length;
k++){sortedGridColumns.push(gridColumns[k])
}gridColumns=sortedGridColumns
}gridFilters=new Ext.ux.grid.GridFilters({menuFilterText:htcConfig.locData.MenuFilterText,encode:false,local:true,filters:listFilters})
}catch(e){ProcessScriptError(e)
}var setGridView=function(){var gridView=typeof(grid)!="undefined"?grid.getView():null;
if(gridView){var viewStateFromQueryString=getParamValue("defaultGridView","string",null,true);
var viewState=null;
if(viewStateFromQueryString&&(viewStateFromQueryString.toLowerCase()=="thumbnails"||viewStateFromQueryString.toLowerCase()=="detailed")){viewState=viewStateFromQueryString
}else{viewState=(toptbarButtons.View?HttpCommander.Lib.Utils.getCookie($("htcgridview")):undefined)||htcConfig.defaultGridView
}var thumbView=typeof(thumbnailTpl)!="undefined"&&viewState=="thumbnails";
gridView.tpl=thumbView?thumbnailTpl:null;
gridView.refresh(true);
currentGridView=thumbView?"thumbnails":"detailed"
}};
try{gridPagingToolBar=new Ext.PagingToolbar({pageSize:htcConfig.itemsPerPage,store:gridStore,beforePageText:htcConfig.locData.PagingToolbarBeforePageText,afterPageText:htcConfig.locData.PagingToolbarAfterPageText,firstText:htcConfig.locData.PagingToolbarFirstText,prevText:htcConfig.locData.PagingToolbarPrevText,nextText:htcConfig.locData.PagingToolbarNextText,lastText:htcConfig.locData.PagingToolbarLastText,displayMsg:htcConfig.locData.PagingToolbarDisplayMsg,refreshText:htcConfig.locData.CommandRefresh,emptyMsg:htcConfig.locData.PagingToolbarEmptyMsg,cls:"x-grid3-cell-text",items:["->",gridPagerInfo=new Ext.form.Label({text:htcConfig.locData.PagingToolbarEmptyMsg,cls:"x-grid3-cell-text"})]});
if(sharedGridStore){sharedGridPagingToolBar=new Ext.PagingToolbar({pageSize:htcConfig.itemsPerPage,store:sharedGridStore,beforePageText:htcConfig.locData.PagingToolbarBeforePageText,afterPageText:htcConfig.locData.PagingToolbarAfterPageText,firstText:htcConfig.locData.PagingToolbarFirstText,prevText:htcConfig.locData.PagingToolbarPrevText,nextText:htcConfig.locData.PagingToolbarNextText,lastText:htcConfig.locData.PagingToolbarLastText,displayMsg:htcConfig.locData.PagingToolbarDisplayMsg,refreshText:htcConfig.locData.CommandRefresh,emptyMsg:htcConfig.locData.PagingToolbarEmptyMsg,cls:"x-grid3-cell-text",items:["->",sharedGridPagerInfo=new Ext.form.Label({text:htcConfig.locData.PagingToolbarEmptyMsg,cls:"x-grid3-cell-text"})]})
}gridStdToolBar=[gridItemsInfo=new Ext.form.Label({html:"&nbsp;",cls:"x-grid3-cell-text"})];
if(htcConfig.enableTrash){gridStdToolBar.push(trashInfo=new Ext.form.Label({html:"&nbsp;",cls:"x-grid3-cell-text",hidden:true}))
}fm.editOrViewPublicLinks=editOrViewPublicLinks;
fm.gridRowAction=gridRowAction;
fm.sharedGridRowAction=sharedGridRowAction;
fm.sharedFYGridRowAction=sharedFYGridRowAction;
fm.viewChangeDetails=function(index,comments){if(menuActions&&initMetadata){menuActions.viewChangeDetails(initMetadata,index,comments)
}};
fm.viewWatch=function(index){if(menuActions&&htcConfig.watchForModifs===true){menuActions.viewWatch(index)
}};
fm.versionHistory=function(index){if(htcConfig&&htcConfig.enableVersionControl&&grid&&menuActions&&initVersionHistory&&typeof index!="undefined"){try{var rec=grid.getStore().getAt(index);
if(rec.data.rowtype==="file"){var fileInfo={path:getCurrentFolder(),name:rec.data.name};
if(!versionHistoryWindow){versionHistoryWindow=initVersionHistory(fileInfo)
}if(versionHistoryWindow){menuActions.versionHistory(fileInfo,versionHistoryWindow)
}}}catch(e){}}};
var sortChanged=function(sortInfo){var si=null,isRcnt=isRecentFolder(),isDateRecent=false;
if(Ext.isObject(sortInfo)&&!Ext.isEmpty(sortInfo.field)&&Ext.isString(sortInfo.field)&&sortInfo.field.trim().length>0){si=sortInfo.field+":";
if(isRcnt){isDateRecent=(sortInfo.field=="daterecent")
}var dir="";
if(Ext.isString(sortInfo.direction)){dir=sortInfo.direction
}if(Ext.isEmpty(dir)){dir="ASC"
}dir=dir.toUpperCase();
if(dir!="ASC"&&dir!="DESC"){dir="ASC"
}si+=dir;
if(!isDateRecent){keepGridSort={sort:sortInfo.field,dir:dir}
}}if(!Ext.isEmpty(si)){if(!isDateRecent){HttpCommander.Lib.Utils.setCookie($("sortinfo"),si)
}}else{HttpCommander.Lib.Utils.deleteCookie($("sortinfo"))
}};
var columnsChanged=function(cm){var cols=cm?cm.config:null,vCols=[],w,isRcnt=isRecentFolder();
if(Ext.isArray(cols)){Ext.each(cols,function(item,index){if(Ext.isObject(item)&&(w=cm.getColumnWidth(index))>0&&!Ext.isEmpty(item.dataIndex)){var vis=!cm.isHidden(index);
if(isRcnt){if(item.dataIndex=="datarecent"){}if(keepColsOnViewRecents.hasOwnProperty(item.dataIndex)){vis=keepColsOnViewRecents[item.dataIndex]
}}vCols.push(item.dataIndex.toLowerCase()+":"+w+":"+(vis?"true":"false"));
if(keepColsOnViewRecents.hasOwnProperty(item.dataIndex)){keepColsOnViewRecents[item.dataIndex]=vis
}}})
}if(vCols.length>0){HttpCommander.Lib.Utils.setCookie($("columns"),vCols.join(","))
}else{HttpCommander.Lib.Utils.deleteCookie($("columns"))
}};
var handleKeyPress=function(e){var ch=HttpCommander.Lib.Utils.getChar(e),idx,grd=((!!sharedGrid&&sharedGrid.rendered&&!sharedGrid.hidden)?sharedGrid:(!!sharedFYGrid&&sharedFYGrid.rendered&&!sharedFYGrid.hidden)?sharedFYGrid:grid),sm=(grd?grd.getSelectionModel():null),st=(grd?grd.getStore():null),data=(st?st.data:null),view=(grd?grd.getView():null),startIndex=0,len,i,dt,row;
if(Ext.isEmpty(ch)){charsGrid=[]
}else{if(!Ext.isEmpty(ch)&&grd&&sm&&data){ch=ch.toLowerCase();
len=sm.getSelections().length;
if(len>0){startIndex=(st.indexOf(sm.getSelections()[len-1])+1)
}len=charsGrid.length;
if(!len||((charsGrid[len-1]).ch==ch)||(((new Date()).getTime()-(charsGrid[len-1]).date)>=1500)){charsGrid=[]
}charsGrid.push({ch:ch,date:(new Date()).getTime()});
ch="";
Ext.each(charsGrid,function(item){ch+=item.ch
});
idx=st.findBy(function(rec){return rec.get("name").toLowerCase().indexOf(ch)==0&&rec.data.rowtype!="uplink"
},st,startIndex);
if(idx<0&&startIndex>0){idx=st.findBy(function(rec){return rec.data.name.toLowerCase().indexOf(ch)==0&&rec.data.rowtype!="uplink"
})
}if(idx>=0&&!sm.isSelected(idx)){sm.selectRow(idx,false);
view=grd.getView();
view.getRow(idx).scrollIntoView();
view.holdPosition=true
}}}};
var mainGridSelectionChange=function(model){toggleToolbarButtons();
fillInfoAboutSelectedAndTotalFilesFolders(grid);
var sel=model?model.getSelected():null;
var curFolder=getCurrentFolder();
if(sel&&sel.data){selectPath={name:!Ext.isEmpty(sel.data.trashname)?sel.data.trashname:sel.data.name,path:curFolder,userSelect:true}
}if(!!detailsPane){detailsPane.prepareData.call(detailsPane,sel,curFolder)
}if(!!metadataWindow&&metadataWindow.rendered&&!metadataWindow.hidden&&!metadataWindow.modal){metadataWindow.onSelectingChanged.call(metadataWindow,sel,curFolder)
}};
grid=new Ext.grid.EditorGridPanel({view:new HttpCommander.Lib.ThumbView({htcUid:uid,htcCfg:htcConfig,maxWidthThumb:maxWidthThumb,maxHeightThumb:maxHeightThumb}),enableDragDrop:true,ddText:htcConfig.locData.GridDDSelectedRowsText,ddGroup:$("GridDD"),stripeRows:false,region:"center",header:false,tbar:{enableOverflow:false,ctCls:"x-panel",cls:"x-panel-header x-tree-node",items:[" ",{itemId:"path-info",xtype:"container",cls:"x-tree-node"+(isBlackTheme?" white-text-color":""),style:{fontWeight:"bold",overflow:"visible !important",maxWidth:"50px"},html:"&nbsp;"},"->",{id:$("quick-search-by-name-fld"),ctCls:"x-form-quick-search-wrap"+(!htcConfig.searchCriterions.content&&Ext.isGecko?"-ie":""),hidden:!htcConfig.searchEnabled,xtype:htcConfig.searchCriterions.content?"textfield":"searchfield",width:htcConfig.searchCriterions.content?120:137,emptyText:htcConfig.locData.QuerySearchByNameText,searchHandler:function(field,nameValue){initAndShowSearch(nameValue)
},listeners:{specialkey:htcConfig.searchCriterions.content?function(f,e){var cmp2=Ext.getCmp($("quick-search-by-content-fld"));
if(!cmp2){return
}var k=e.getKey();
if(k==e.ENTER){cmp2.onTrigger2Click.call(cmp2)
}else{if(k==e.ESC){cmp2.onTrigger1Click.call(cmp2)
}}}:Ext.emptyFn}},{id:$("quick-search-by-content-fld"),xtype:"searchfield",style:{borderLeftWidth:"0px"},ctCls:"x-form-quick-search-wrap"+(Ext.isGecko?"-ie":""),firstFieldId:$("quick-search-by-name-fld"),hidden:!htcConfig.searchEnabled||!htcConfig.searchCriterions.content,emptyText:htcConfig.locData.QuerySearchByConentText,width:137,searchHandler:function(field,contentValue,nameValue){initAndShowSearch(nameValue,contentValue)
}}," "]},buttonAlign:"left",footer:true,minColumnWidth:70,loadMask:globalLoadMask,plugins:[gridFilters],keys:{key:[Ext.EventObject.ENTER,Ext.EventObject.HOME,Ext.EventObject.END,Ext.EventObject.DELETE,Ext.EventObject.BACKSPACE],fn:function(e,obj){if(obj&&obj.target&&obj.target.id){if(obj.target.id.indexOf("quick-search-by")>=0){return true
}}var sm=grid.getSelectionModel();
if(sm){switch(e){case Ext.EventObject.ENTER:if(sm.getCount()==1){gridRowAction(grid.getStore().indexOf(sm.getSelected()),e)
}break;
case Ext.EventObject.HOME:sm.selectRow(getCurrentFolder()=="root"||!htcConfig.showUpLink?0:1);
break;
case Ext.EventObject.END:sm.selectLastRow();
break;
case Ext.EventObject.DELETE:if(menuActions&&htcConfig.currentPerms&&htcConfig.currentPerms.del){var selTFM=getSelTypeFilesModel(grid);
var selType=selTFM.selType;
if(selType!="empty"&&selType!="none"){menuActions.deleteSelectedItems()
}}break;
case Ext.EventObject.BACKSPACE:var curFolder=getCurrentFolder();
if(curFolder!=="root"){openUpLink(curFolder)
}break
}}}},selModel:new Ext.grid.RowSelectionModel({moveEditorOnEnter:false,listeners:{beforerowselect:function(model,index,keep,record){if(record.data.rowtype=="uplink"){return false
}},selectionchange:function(model){(mainGridSelectionChange.debounce(200))(model)
}}}),fbar:gridStdToolBar,bbar:pagingEnabled?gridPagingToolBar:undefined,store:gridStore,autoExpandColumn:isEmbeddedtoIFRAME?"":"name",autoExpandMin:70,colModel:(gridColModel=new Ext.grid.ColumnModel({defaults:{sortable:true},columns:gridColumns})),renameImpl:function(renameInfo,e){globalLoadMask.msg=htcConfig.locData.ProgressRenaming+"...";
globalLoadMask.show();
HttpCommander.Common.Rename(renameInfo,function(data,trans){globalLoadMask.hide();
globalLoadMask.msg=htcConfig.locData.ProgressLoading+"...";
if(typeof data=="undefined"){e.record.reject();
Msg.alert(htcConfig.locData.CommonErrorCaption,trans.message);
return
}if(data.success){e.record.data.name=renameInfo.newName;
e.record.commit();
showBalloon(htcConfig.locData.BalloonRenamedSuccessfully);
if(e.record.data.rowtype!=="folder"&&typeof data.icon!="undefined"){e.record.data.icon=data.icon;
e.record.data.type=data.type;
e.record.commit()
}if(data.warning!==true){if(!Ext.isEmpty(renameInfo.newName)&&!Ext.isEmpty(renameInfo.path)){selectPath={name:renameInfo.newName,path:renameInfo.path}
}if(e.record.data.rowtype==="folder"){openGridFolder(renameInfo.path,true,true)
}else{openGridFolder(renameInfo.path)
}}}else{e.record.reject();
if(data.newname){Msg.confirm(htcConfig.locData.CommandRename,data.message,function(btnConfirm){if(btnConfirm=="yes"){if(renameInfo.type=="file"){renameInfo.newName=data.newname
}else{renameInfo.merge=true
}grid.renameImpl(renameInfo,e)
}},grid)
}else{Msg.alert(htcConfig.locData.CommonErrorCaption,data.message)
}return
}if(data.warning===true){showRefreshWarning()
}})
},listeners:{resize:function(grd,adjWidth,adjHeight,rawWidth,rawHeight){grd.getView().refresh(true)
},columnmove:function(oldIndex,newIndex){grid.getView().refresh(true);
columnsChanged(grid.getColumnModel())
},columnresize:function(oldIndex,newIndex){grid.getView().refresh(true);
columnsChanged(grid.getColumnModel())
},sortchange:function(grd,sortInfo){sortChanged(sortInfo)
},render:function(grd){grd.getColumnModel().on("hiddenchange",function(cm,columnIndex,hidden){grid.getView().refresh(true);
columnsChanged(cm)
});
setGridView();
Ext.dd.ScrollManager.register(grd.getView().getEditorParent())
},beforedestroy:function(grd){Ext.dd.ScrollManager.unregister(grd.getView().getEditorParent())
},afterrender:function(grd){if(gridDropTarget){gridDropTarget.destroy()
}gridDropTarget=null;
createGridDropTarget(grd);
var gbtb=null;
if(grd.getBottomToolbar&&(gbtb=grd.getBottomToolbar())){gbtb.hide()
}},rowcontextmenu:function(grd,index,e){var curFolder=getCurrentFolder();
if(isRecentFolder(curFolder)&&!isRecentFolder(curFolder,true)){return
}var selModel=grd.getSelectionModel();
if(!selModel.isSelected(index)){selModel.selectRow(index,false)
}fileMenu.showAt(e.getXY())
},containercontextmenu:function(grd,e){if(grd&&grd.editing===true&&e&&e.target&&e.target.tagName&&e.target.tagName.match(/INPUT|TEXTAREA/i)){return false
}var curFolder=getCurrentFolder();
grd.getSelectionModel().clearSelections();
if(isRecentFolder(curFolder)&&!isRecentFolder(curFolder,true)){return
}fileMenu.showAt(e.getXY())
},containerclick:function(grd,e){grd.getSelectionModel().clearSelections()
},containerdblclick:function(grd,e){var curFolder=getCurrentFolder();
grd.getSelectionModel().clearSelections();
if(isRecentFolder(curFolder)&&!isRecentFolder(curFolder,true)){return false
}fileMenu.showAt(e.getXY())
},rowdblclick:function(grd,index,e){var record=grd.getStore().getAt(index);
if(record.data.srowtype=="trash"){return false
}if(itemDoubleClickEventDefined&&(record.data.rowtype=="folder"||record.data.rowtype=="rootfolder"||record.data.rowtype=="file")){var itemPath=record.data.rowtype=="rootfolder"?record.data.name:(getCurrentFolder()+"/"+record.data.name);
onItemDoubleClick(itemPath)
}else{gridRowAction(index,e)
}},beforeedit:function(e){return allowEdit
},afteredit:function(e){if(e.record.data.rowtype==="file"&&!isExtensionAllowed(e.value,false)){e.record.reject();
Msg.alert(htcConfig.locData.CommonErrorCaption,getRestrictionMessage(false));
return
}var renameInfo={};
renameInfo.path=getCurrentFolder();
renameInfo.name=e.originalValue;
renameInfo.type=e.record.data.rowtype;
renameInfo.newName=e.value;
if(asControl){renameInfo.control=true
}grid.renameImpl(renameInfo,e)
},keypress:handleKeyPress}});
if(htcConfig.sharedInTree){sharedColModel=new Ext.grid.ColumnModel({defaults:{sortable:true},columns:[{id:"view-links-virtpath",header:htcConfig.locData.CommonFieldLabelPath,dataIndex:"virt_path",renderer:renderers.namePublicRenderer},{id:"view-links-type",header:htcConfig.locData.CommonFieldLabelType,dataIndex:"type",width:140,renderer:renderers.qtipCellRenderer},{id:"view-links-datecreated",header:htcConfig.locData.AnonymousViewLinksDateCreatedColumn,dataIndex:"date",renderer:renderers.dateRendererWithQTip,width:140,hidden:true},{id:"view-links-dateexpired",header:htcConfig.locData.AnonymousViewLinksDateExpiredColumn,dataIndex:"expires",renderer:renderers.dateRendererWithQTip,width:140},{id:"view-links-with-passwd",header:htcConfig.locData.CommonFieldLabelPassword,dataIndex:"withpasswd",renderer:renderers.booleanRenderer,width:70,align:"center"},{id:"view-links-permission",header:htcConfig.locData.AnonymousViewLinksPermissionColumn,dataIndex:"acl",width:200,renderer:function(val,cell,rec,row,col,store){var res="";
if((val&1)!=0){res+=htcConfig.locData.PublicFolderAnonymViewContent
}if((val&2)!=0){res+=(res==""?"":", ")+htcConfig.locData.PublicFolderAnonymDownload
}if((val&4)!=0){res+=(res==""?"":", ")+htcConfig.locData.PublicFolderAnonymUpload
}if((val&8)!=0){res+=(res==""?"":", ")+htcConfig.locData.PublicFolderAnonymZipDownload
}return String.format("<span style='white-space: normal;'>{0}</span>",res)
}},{id:"view-links-showcomments",header:htcConfig.locData.AnonymousLinkShowCommentsShort,dataIndex:"show_comments",renderer:renderers.booleanRenderer,width:70,align:"center",hidden:true},{id:"view-links-downloaded",header:htcConfig.locData.AnonymousViewLinksDownloadedColumn,dataIndex:"downloads",hidden:true}]});
sharedGrid=new Ext.grid.GridPanel({openEditPublicLink:function(grd){grd=grd||sharedGrid;
if(!grd){return
}var row=grd.getSelectionModel().getSelected().data;
if(!row){return
}var isFolder=row.isfolder;
var p=row.acl;
var hp=row.perms;
var anonPerm={download:{checked:p&&(p&2)!=0&&(!isFolder||(p&1)!=0)},upload:{checked:isFolder&&p&&(p&4)!=0},view:{checked:isFolder&&p&&(p&1)!=0},zip:{checked:isFolder&&p&&(p&8)!=0}};
var onlyZip=anonPerm.zip.checked&&!anonPerm.upload.checked&&!anonPerm.view.checked;
anonPerm.download.disabled=!isFolder||onlyZip||!(hp&&hp.download&&hp.anonymDownload);
anonPerm.upload.disabled=!isFolder||onlyZip||!(hp&&hp.upload&&hp.anonymUpload);
anonPerm.view.disabled=!isFolder||onlyZip||!(hp&&(hp.listFiles||hp.listFolders)&&hp.anonymViewContent);
anonPerm.zip.disabled=!isFolder||!(hp&&hp.zipDownload&&hp.anonymDownload);
anonPerm.modify=hp&&hp.modify;
if(anonPerm.download.disabled){anonPerm.download.checked=false
}if(anonPerm.upload.disabled){anonPerm.upload.checked=false
}if(anonPerm.view.disabled){anonPerm.view.checked=false
}if(anonPerm.zip.disabled){anonPerm.zip.checked=false
}prepareAndShowMakePublicLinkWindow(row.virt_path,isFolder,anonPerm,row,true,true)
},enableDragDrop:true,ddText:htcConfig.locData.GridDDSelectedRowsText,ddGroup:$("GridDD"),region:"center",title:"&nbsp;",header:true,buttonAlign:"left",footer:true,minColumnWidth:70,headerCfg:{cls:"x-panel-header x-tree-node"},loadMask:globalLoadMask,selModel:new Ext.grid.RowSelectionModel({listeners:{beforerowselect:function(model,index,keep,record){if(record.data.rowtype=="uplink"){return false
}},selectionchange:function(model){toggleToolbarButtons();
var sel=model?model.getSelected():null;
if(sel&&sel.data){sharedSelectPath={id:sel.data.id,userSelect:true}
}}}}),autoExpandMin:70,autoExpandColumn:"view-links-virtpath",bbar:pagingEnabled?sharedGridPagingToolBar:undefined,store:sharedGridStore,plugins:[new Ext.ux.grid.GridFilters({menuFilterText:htcConfig.locData.MenuFilterText,encode:false,local:true,filters:[{dataIndex:"virt_path",type:"string",emptyText:htcConfig.locData.EmptyTextFilter},{dataIndex:"type",type:"string",emptyText:htcConfig.locData.EmptyTextFilter},{dataIndex:"isfolder",type:"boolean",yesText:htcConfig.locData.CommonValueTypeFolder,noText:htcConfig.locData.CommandFile},{dataIndex:"date",type:"date",afterText:htcConfig.locData.AfterDateFilterText,beforeText:htcConfig.locData.BeforeDateFilterText,onText:htcConfig.locData.OnDateFilterText},{dataIndex:"expires",type:"date",afterText:htcConfig.locData.AfterDateFilterText,beforeText:htcConfig.locData.BeforeDateFilterText,onText:htcConfig.locData.OnDateFilterText},{dataIndex:"withpasswd",type:"boolean",yesText:htcConfig.locData.ExtMsgButtonTextYES,noText:htcConfig.locData.ExtMsgButtonTextNO},{dataIndex:"downloads",type:"numeric",menuItemCfgs:{emptyText:htcConfig.locData.EmptyTextFilter}},{dataIndex:"show_comments",type:"boolean",yesText:htcConfig.locData.ExtMsgButtonTextYES,noText:htcConfig.locData.ExtMsgButtonTextNO}]})],colModel:sharedColModel,flex:1,stripeRows:true,keys:{key:[Ext.EventObject.ENTER,Ext.EventObject.HOME,Ext.EventObject.END,Ext.EventObject.DELETE,Ext.EventObject.BACKSPACE],fn:function(e){var sm=sharedGrid.getSelectionModel();
switch(e){case Ext.EventObject.HOME:sm.selectRow(!htcConfig.showUpLink?0:1);
break;
case Ext.EventObject.END:sm.selectLastRow();
break;
case Ext.EventObject.DELETE:if(menuActions){var selTFM=getSelTypeFilesModel(sharedGrid);
var selType=selTFM.selType;
if(selType!="empty"&&selType!="none"){menuActions.deleteSelectedItems()
}}break;
case Ext.EventObject.BACKSPACE:openGridFolder("root",true);
break;
case Ext.EventObject.ENTER:if(sm.getCount()==1){sharedGrid.openEditPublicLink(sharedGrid)
}break
}}},listeners:{resize:function(grd,adjWidth,adjHeight,rawWidth,rawHeight){grd.getView().refresh(true)
},columnmove:function(oldIndex,newIndex){if(sharedGrid){sharedGrid.getView().refresh(true)
}},afterrender:function(grd){if(sharedGridDropTarget){sharedGridDropTarget.destroy()
}sharedGridDropTarget=null;
createSharedGridDropTarget(grd);
var gbtb=null;
if(grd.getBottomToolbar&&(gbtb=grd.getBottomToolbar())){gbtb.hide()
}},rowcontextmenu:function(grd,index,e){var selModel=grd.getSelectionModel();
if(!selModel.isSelected(index)){selModel.selectRow(index,false)
}if(sharedFileMenu){sharedFileMenu.showAt(e.getXY())
}},containercontextmenu:function(grd,e){grd.getSelectionModel().clearSelections();
if(sharedFileMenu){sharedFileMenu.showAt(e.getXY())
}},containerclick:function(grd,e){grd.getSelectionModel().clearSelections()
},containerdblclick:function(grd,e){grd.getSelectionModel().clearSelections()
},rowdblclick:function(grd,index,e){grd.openEditPublicLink(grd)
},render:function(grd){Ext.dd.ScrollManager.register(grd.getView().getEditorParent())
},beforedestroy:function(grd){Ext.dd.ScrollManager.unregister(grd.getView().getEditorParent())
},keypress:handleKeyPress}})
}if(htcConfig.sharedForYou){sharedFYColModel=new Ext.grid.ColumnModel({defaults:{sortable:true},columns:[{id:"view-links-virtpath",header:htcConfig.locData.CommonFieldLabelPath,dataIndex:"virt_path",renderer:renderers.namePublicRenderer},{id:"view-links-type",header:htcConfig.locData.CommonFieldLabelType,dataIndex:"type",width:140,renderer:renderers.qtipCellRenderer},{id:"view-links-datecreated",header:htcConfig.locData.AnonymousViewLinksDateCreatedColumn,dataIndex:"date",renderer:renderers.dateRendererWithQTip,width:140,hidden:true},{id:"view-links-dateexpired",header:htcConfig.locData.AnonymousViewLinksDateExpiredColumn,dataIndex:"expires",renderer:renderers.dateRendererWithQTip,width:140},{id:"view-links-with-passwd",header:htcConfig.locData.CommonFieldLabelPassword,dataIndex:"withpasswd",renderer:renderers.booleanRenderer,width:70,align:"center"},{id:"view-links-permission",header:htcConfig.locData.AnonymousViewLinksPermissionColumn,dataIndex:"acl",width:200,renderer:function(val,cell,rec,row,col,store){var res="";
if((val&1)!=0){res+=htcConfig.locData.PublicFolderAnonymViewContent
}if((val&2)!=0){res+=(res==""?"":", ")+htcConfig.locData.PublicFolderAnonymDownload
}if((val&4)!=0){res+=(res==""?"":", ")+htcConfig.locData.PublicFolderAnonymUpload
}if((val&8)!=0){res+=(res==""?"":", ")+htcConfig.locData.PublicFolderAnonymZipDownload
}return String.format("<span style='white-space: normal;'>{0}</span>",res)
}}]});
sharedFYGrid=new Ext.grid.GridPanel({enableDragDrop:false,region:"center",title:"&nbsp;",header:true,buttonAlign:"left",footer:true,minColumnWidth:70,headerCfg:{cls:"x-panel-header x-tree-node"},loadMask:globalLoadMask,selModel:new Ext.grid.RowSelectionModel({listeners:{beforerowselect:function(model,index,keep,record){if(record.data.rowtype=="uplink"){return false
}},selectionchange:function(model){toggleToolbarButtons();
var sel=model?model.getSelected():null;
if(sel&&sel.data){sharedFYSelectPath={id:sel.data.id,userSelect:true}
}}}}),autoExpandMin:70,autoExpandColumn:"view-links-virtpath",bbar:pagingEnabled?sharedFYGridPagingToolBar:undefined,store:sharedFYGridStore,plugins:[new Ext.ux.grid.GridFilters({menuFilterText:htcConfig.locData.MenuFilterText,encode:false,local:true,filters:[{dataIndex:"virt_path",type:"string",emptyText:htcConfig.locData.EmptyTextFilter},{dataIndex:"type",type:"string",emptyText:htcConfig.locData.EmptyTextFilter},{dataIndex:"isfolder",type:"boolean",yesText:htcConfig.locData.CommonValueTypeFolder,noText:htcConfig.locData.CommandFile},{dataIndex:"date",type:"date",afterText:htcConfig.locData.AfterDateFilterText,beforeText:htcConfig.locData.BeforeDateFilterText,onText:htcConfig.locData.OnDateFilterText},{dataIndex:"expires",type:"date",afterText:htcConfig.locData.AfterDateFilterText,beforeText:htcConfig.locData.BeforeDateFilterText,onText:htcConfig.locData.OnDateFilterText},{dataIndex:"withpasswd",type:"boolean",yesText:htcConfig.locData.ExtMsgButtonTextYES,noText:htcConfig.locData.ExtMsgButtonTextNO}]})],colModel:sharedFYColModel,flex:1,stripeRows:true,keys:{key:[Ext.EventObject.ENTER,Ext.EventObject.HOME,Ext.EventObject.END,Ext.EventObject.BACKSPACE],fn:function(e){var sm=sharedFYGrid.getSelectionModel();
switch(e){case Ext.EventObject.HOME:sm.selectRow(!htcConfig.showUpLink?0:1);
break;
case Ext.EventObject.END:sm.selectLastRow();
break;
case Ext.EventObject.BACKSPACE:openGridFolder("root",true);
break;
case Ext.EventObject.ENTER:if(sm.getCount()==1){}break
}}},listeners:{resize:function(grd,adjWidth,adjHeight,rawWidth,rawHeight){grd.getView().refresh(true)
},columnmove:function(oldIndex,newIndex){if(sharedFYGrid){sharedFYGrid.getView().refresh(true)
}},afterrender:function(grd){var gbtb=null;
if(grd.getBottomToolbar&&(gbtb=grd.getBottomToolbar())){gbtb.hide()
}},rowcontextmenu:function(grd,index,e){var selModel=grd.getSelectionModel();
if(!selModel.isSelected(index)){selModel.selectRow(index,false)
}},containercontextmenu:function(grd,e){grd.getSelectionModel().clearSelections()
},containerclick:function(grd,e){grd.getSelectionModel().clearSelections()
},containerdblclick:function(grd,e){grd.getSelectionModel().clearSelections()
},rowdblclick:function(grd,index,e){},keypress:handleKeyPress}})
}}catch(e){throw e
}};
var initToolBar=function(){initAndShowSearch=function(namePattern,contentPattern){try{if(!htcConfig.searchEnabled){return
}if(!searchWindow){searchWindow=HttpCommander.Lib.FileSearchWindow({htcConfig:htcConfig,Window:Window,Msg:Msg,getSelectPath:function(){return selectPath
},setSelectPath:function(v){selectPath=v
},openGridFolder:openGridFolder,ProcessScriptError:ProcessScriptError,getCurrentFolder:getCurrentFolder,getExtEl:function(){return extEl
},getRenderers:function(){return renderers
},getFileManager:function(){return fm
},isRootFolder:isRootFolder,getRootName:function(){return _OLD_ROOT_
},isSpecialTreeFolderOrSubFolder:isSpecialTreeFolderOrSubFolder})
}searchWindow.initQuickSearch(namePattern,contentPattern);
searchWindow.show()
}catch(e){ProcessScriptError(e)
}};
toptbarConfig=HttpCommander.Lib.ToolbarActions({htcConfig:htcConfig,getMenuActions:function(){return menuActions
},getLogoBtn:function(){return logoBtn
},getTree:function(){return tree
},initAndShowSearch:initAndShowSearch,initUploaders:initUploaders,Msg:Msg,showHelpWindow:showHelpWindow,asControl:function(){return asControl
},onLogOut:onLogOut,getClipboard:function(){return clipboard
},toggleToolbarButtons:toggleToolbarButtons,getGrid:function(){return grid
},getCurrentFolder:getCurrentFolder,createSelectedSet:createSelectedSet,initMetadata:initMetadata,openGridFolder:openGridFolder,initOfficeEditor:initOfficeEditor,downloadToGoogle:downloadToGoogle,downloadToDropbox:downloadToDropbox,downloadToSkyDrive:downloadToSkyDrive,downloadToBox:downloadToBox,virtualFilePath:virtualFilePath,prepareAndShowMakePublicLinkWindow:prepareAndShowMakePublicLinkWindow,prepareAndShowlinksToWebFoldersWindow:prepareAndShowlinksToWebFoldersWindow,initAndShowSyncWebFoldersHelpWindow:initAndShowSyncWebFoldersHelpWindow,initZipContent:initZipContent,isExtensionAllowed:isExtensionAllowed,getSelTypeFilesModel:getSelTypeFilesModel,getCurrentPerms:function(){return htcConfig&&htcConfig.currentPerms?htcConfig.currentPerms:null
},getViewEditSubMenu:function(){return viewEditSubMenu
},getLabelsMenu:function(){return labelsMenu
},getShareSubMenu:function(){return shareSubMenu
},getMoreSubMenu:function(){return moreSubMenu
},initAndShowViewLinksWindow:initAndShowViewLinksWindow,getTreeViewValue:getTreeViewValue,supportsWebGlCanvasForAutodesk:function(){return supportsWebGlCanvasForAutodesk
},getEditOpenTxtButtons:function(){return editOpenTxtButtons
},getMsoEditButtons:function(){return msoEditButtons
},getOooEditButtons:function(){return oooEditButtons
},openInMsoNewWay:openInMsoNewWay,isRecentFolder:isRecentFolder,isTrashFolder:isTrashFolder,getTrashSubMenu:function(){return trashSubMenu
},isSharedTreeFolder:isSharedTreeFolder,isSharedForYouTreeFolder:isSharedForYouTreeFolder,getWatchSubMenu:function(){return watchSubMenu
},getSharedGrid:function(){return sharedGrid
},getSharedFYGrid:function(){return sharedFYGrid
},isAlertsFolder:isAlertsFolder,initAndShowSelectFolder:initAndShowSelectFolder});
var favoritesSubMenu,gridViewMenu,adminMenu,settingsMenu;
var buttonExists=function(btnName){var i;
for(i=0;
i<htcConfig.toolbarButtons1.length;
i++){if(htcConfig.toolbarButtons1[i]["name"]===btnName){return true
}}for(i=0;
i<htcConfig.toolbarButtons2.length;
i++){if(htcConfig.toolbarButtons2[i]["name"]===btnName){return true
}}return false
};
var changeGridView=function(viewState){var gridView=typeof(grid)!="undefined"?grid.getView():null;
if(gridView){if(!viewState){viewState="detailed"
}viewState=viewState.toString().toLowerCase();
var thumbView=typeof(thumbnailTpl)!="undefined"&&viewState=="thumbnails";
if(!thumbView){viewState="detailed"
}gridView.tpl=thumbView?thumbnailTpl:null;
gridView.refresh(true);
currentGridView=thumbView?"thumbnails":"detailed";
HttpCommander.Lib.Utils.deleteCookie($("htcgridview"));
HttpCommander.Lib.Utils.setCookie($("htcgridview"),viewState)
}};
try{if(buttonExists("Favorites")||buttonExists("View")){favoritesSubMenu=HttpCommander.Lib.FavoritesSubMenu({htcConfig:htcConfig,Msg:Msg,"$":$,getCurrentFolder:getCurrentFolder,openGridFolder:openGridFolder,globalLoadMask:globalLoadMask,getGridViewMenu:function(){return gridViewMenu
}})
}}catch(e){ProcessScriptError(e)
}try{if(buttonExists("View")){var viewMenuItemsArr=[{itemId:"grid-view-refresh",text:htcConfig.locData.CommandRefresh,icon:HttpCommander.Lib.Utils.getIconPath(this,"refresh")},"-",{itemId:"grid-view-thumbnails",text:htcConfig.locData.CommandThumbnailView,icon:HttpCommander.Lib.Utils.getIconPath(this,"viewt")},{itemId:"grid-view-detailed",text:htcConfig.locData.CommandDetailedView,icon:HttpCommander.Lib.Utils.getIconPath(this,"viewd")}];
if(htcConfig.enableDetailsPane){viewMenuItemsArr.push("-",{xtype:"menucheckitem",itemId:"show-hide-details-pane",text:htcConfig.locData.CommandDetailsPane,checked:!getHideDetailsPaneValue(),listeners:{checkchange:function(shdp,checked){if(!!detailsPane){if(checked&&detailsPane.collapsed){detailsPane.expand()
}else{if(!checked&&!detailsPane.collapsed){detailsPane.collapse()
}}}}}})
}viewMenuItemsArr.push("-",{text:htcConfig.locData.CommandFavorites,icon:HttpCommander.Lib.Utils.getIconPath(this,"favorites"),handler:function(item,e){return false
},menu:favoritesSubMenu});
gridViewMenu=new Ext.menu.Menu({items:viewMenuItemsArr,listeners:{beforeshow:function(cmp){var shdp=cmp.getComponent("show-hide-details-pane");
if(!!shdp){shdp.setChecked(!!detailsPane&&!detailsPane.collapsed,true)
}},itemclick:function(item){switch(item.itemId){case"grid-view-refresh":var curFolder=getCurrentFolder();
openGridFolder(curFolder,true,true);
break;
case"grid-view-thumbnails":changeGridView("thumbnails");
break;
case"grid-view-detailed":changeGridView("detailed");
break
}}}})
}}catch(e){ProcessScriptError(e)
}try{if((htcConfig.isAdmin||htcConfig.viewDiag)&&buttonExists("Administration")){var adminMenuItems=[];
if(htcConfig.isAdmin){adminMenuItems.push({itemId:"admin-panel",text:htcConfig.locData.CommandAdminPanel,icon:HttpCommander.Lib.Utils.getIconPath(this,"adpanel")})
}if(htcConfig.isAdmin&&htcConfig.viewDiag){adminMenuItems.push({itemId:"diagnostics",text:htcConfig.locData.CommandDiagnostics,icon:HttpCommander.Lib.Utils.getIconPath(this,"diagnostics")})
}if(adminMenuItems.length>0){adminMenu=new Ext.menu.Menu({items:adminMenuItems,listeners:{itemclick:function(item){var queryString=(asControl?"?control="+encodeURIComponent(window.location.toString()):"");
switch(item.itemId){case"admin-panel":if(htcConfig.isAdmin){var adminUrl=htcConfig.relativePath+"AdminPanel.aspx"+queryString;
if(embedded||isEmbeddedtoIFRAME){var adminpanelWin=window.open(adminUrl,"_blank");
if(!adminpanelWin){window.alert(htcConfig.locData.ViewPopupBlocked)
}}else{window.location.href=adminUrl
}}break;
case"diagnostics":if(htcConfig.viewDiag){window.open(htcConfig.relativePath+"Diagnostics.aspx"+queryString)
}break
}}}})
}}}catch(e){ProcessScriptError(e)
}try{if(buttonExists("Settings")){var cbLanguage;
var settingsWindow=new Window({title:htcConfig.locData.SettingsTitle,width:250,resizable:false,plain:true,closeAction:"hide",items:new Ext.FormPanel({labelWidth:70,border:false,bodyBorder:false,header:false,frame:true,width:250,items:[cbLanguage=new Ext.form.ComboBox({fieldLabel:htcConfig.locData.SettingsLanguage,editable:false,width:140,triggerAction:"all",mode:"remote",tpl:'<tpl for="."><div class="x-combo-list-item">{name:htmlEncode}</div></tpl>',store:new Ext.data.DirectStore({reader:new Ext.data.JsonReader({idProperty:"name",root:"data",fields:["name","code"]}),autoLoad:false,api:{read:HttpCommander.Common.LocalizationList}}),valueField:"name",displayField:"name",lazyInit:false})]}),buttons:[{text:htcConfig.locData.CommandSave,handler:function(){HttpCommander.Lib.Utils.deleteCookie("htclang");
HttpCommander.Lib.Utils.setCookie("htclang",cbLanguage.getValue());
Msg.alert(htcConfig.locData.CommonWarningCaption,htcConfig.locData.SettingsLogOutRequired);
settingsWindow.hide()
}},{text:htcConfig.locData.CommonButtonCaptionCancel,handler:function(){settingsWindow.hide()
}}],listeners:{show:function(win){var langFromCookie=cbLanguage.setValue(HttpCommander.Lib.Utils.getCookie("htclang"));
if(typeof langFromCookie!="string"||langFromCookie.trim()==""){cbLanguage.setValue(htcConfig.language);
HttpCommander.Lib.Utils.setCookie("htclang",htcConfig.language)
}}}});
var changePasswordWindow,userPasswordInfo,changeEmailWindow,userEmailInfo;
var validateChangePasswordData=function(){var userName=userPasswordInfo.findById($("change-password-user-name")).getValue();
var oldPassword=userPasswordInfo.findById($("user-old-password")).getValue();
var newPassword1=userPasswordInfo.findById($("user-new-password1")).getValue();
var newPassword2=userPasswordInfo.findById($("user-new-password2")).getValue();
if(newPassword1!=newPassword2){return htcConfig.locData.ChangeUserPasswordPasswordsNotMatch
}return null
};
var aggregateChangePasswordData=function(){var data={};
data.name=userPasswordInfo.findById($("change-password-user-name")).getValue();
data["old-password"]=userPasswordInfo.findById($("user-old-password")).getValue();
data["new-password"]=userPasswordInfo.findById($("user-new-password1")).getValue();
return data
};
var prepareChangePasswordWindow=function(){userPasswordInfo.findById($("change-password-user-name")).setValue((typeof htcConfig.currentUserDomain!="undefined"&&htcConfig.currentUserDomain.trim().length>0?(htcConfig.currentUserDomain+"\\"):"")+htcConfig.currentUser);
userPasswordInfo.findById($("user-old-password")).setValue("");
userPasswordInfo.findById($("user-new-password1")).setValue("");
userPasswordInfo.findById($("user-new-password2")).setValue("")
};
var prepareChangeEmailWindow=function(){userEmailInfo.findById($("change-email-user-name")).setValue((typeof htcConfig.currentUserDomain!="undefined"&&htcConfig.currentUserDomain.trim().length>0?(htcConfig.currentUserDomain+"\\"):"")+htcConfig.currentUser);
userEmailInfo.findById($("change-email-user-email")).setValue("");
HttpCommander.Admin.GetCurrentUserInfo(function(data,trans){if(typeof data=="undefined"){Msg.alert(htcConfig.locData.CommonErrorCaption,Ext.util.Format.htmlEncode(trans.message));
return
}if(data.status!="success"){Msg.alert(htcConfig.locData.CommonErrorCaption,data.message);
return
}if(data.data.email!=null){userEmailInfo.findById($("change-email-user-email")).setValue(data.data.email)
}})
};
var aggregateChangeEmailData=function(){var data={};
data.email=userEmailInfo.findById($("change-email-user-email")).getValue();
return data
};
try{changePasswordWindow=new Window({title:htcConfig.locData.ChangeUserPasswordTitle,bodyStyle:"padding:5px",layout:"table",layoutConfig:{columns:2},resizable:false,plain:true,closeAction:"hide",width:345,items:[userPasswordInfo=new Ext.form.FieldSet({title:htcConfig.locData.AdminUsersGeneralInfo,labelWidth:120,defaultType:"textfield",items:[{fieldLabel:htcConfig.locData.CommonFieldLabelUserName,id:$("change-password-user-name"),width:170,disabled:true,readOnly:true},{fieldLabel:htcConfig.locData.ChangeUserPasswordOldPassword,id:$("user-old-password"),inputType:"password",width:170},{fieldLabel:htcConfig.locData.ChangeUserPasswordNewPassword,id:$("user-new-password1"),inputType:"password",width:170},{fieldLabel:htcConfig.locData.ChangeUserPasswordRepeatNewPassword,id:$("user-new-password2"),inputType:"password",width:170}]})],buttons:[{text:htcConfig.locData.CommandSave,handler:function(){var validationResult=validateChangePasswordData();
if(validationResult){Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:validationResult,icon:Msg.WARNING,buttons:Msg.OK})
}else{changePasswordWindow.hide();
var pass_data=aggregateChangePasswordData();
globalLoadMask.msg=htcConfig.locData.ProgressChangePassword+"...";
globalLoadMask.show();
HttpCommander.Admin.ChangePasswordUser(pass_data,function(data,trans){globalLoadMask.hide();
globalLoadMask.msg=htcConfig.locData.ProgressLoading+"...";
if(typeof data=="undefined"){Msg.alert(htcConfig.locData.CommonErrorCaption,Ext.util.Format.htmlEncode(trans.message));
return
}if(data.status!="success"){Msg.alert(htcConfig.locData.CommonErrorCaption,data.message);
return
}Msg.alert("",htcConfig.locData.ChangeUserPasswordSuccessMessage)
})
}}},{text:htcConfig.locData.CommonButtonCaptionCancel,handler:function(){changePasswordWindow.hide()
}}]})
}catch(e){ProcessScriptError(e)
}try{changeEmailWindow=new Window({title:htcConfig.locData.ChangeUserEmailTitle,bodyStyle:"padding:5px",layout:"table",plain:true,layoutConfig:{columns:2},resizable:false,closeAction:"hide",width:345,items:[userEmailInfo=new Ext.form.FieldSet({title:htcConfig.locData.AdminUsersGeneralInfo,labelWidth:120,defaultType:"textfield",items:[{fieldLabel:htcConfig.locData.CommonFieldLabelUserName,id:$("change-email-user-name"),width:170,readOnly:true,disabled:true},{fieldLabel:htcConfig.locData.ChangeUserEmailEmail,id:$("change-email-user-email"),width:170}]})],buttons:[{text:htcConfig.locData.CommandSave,handler:function(){changeEmailWindow.hide();
var email_data=aggregateChangeEmailData();
globalLoadMask.msg=htcConfig.locData.ProgressChangeEmail+"...";
globalLoadMask.show();
HttpCommander.Admin.UpdateCurrentUserInfo(email_data,function(data,trans){globalLoadMask.hide();
globalLoadMask.msg=htcConfig.locData.ProgressLoading+"...";
if(typeof data=="undefined"){Msg.alert(htcConfig.locData.CommonErrorCaption,Ext.util.Format.htmlEncode(trans.message));
return
}if(data.status!="success"){Msg.alert(htcConfig.locData.CommonErrorCaption,data.message);
return
}Msg.alert("",htcConfig.locData.ChangeUserEmailSuccessMessage)
})
}},{text:htcConfig.locData.CommonButtonCaptionCancel,handler:function(){changeEmailWindow.hide()
}}]})
}catch(e){ProcessScriptError(e)
}settingsMenu=new Ext.menu.Menu({items:[{itemId:"language",text:htcConfig.locData.CommandLanguage+(String(htcConfig.language).toLowerCase()==="english"?"":" (Language)"),icon:HttpCommander.Lib.Utils.getIconPath(this,"language")},{itemId:"change-password",text:htcConfig.locData.CommandChangePassword,icon:HttpCommander.Lib.Utils.getIconPath(this,"password"),hidden:asControl,disabled:!htcConfig.changePassword},{itemId:"change-email",text:htcConfig.locData.CommandChangeEmail,icon:HttpCommander.Lib.Utils.getIconPath(this,"changeemail"),hidden:asControl,disabled:!htcConfig.changeEmail},{itemId:"mobile-view",text:htcConfig.locData.CommandMobileView,icon:HttpCommander.Lib.Utils.getIconPath(this,"iphone"),hidden:asControl}],listeners:{itemclick:function(item){switch(item.itemId){case"language":settingsWindow.show();
break;
case"change-password":prepareChangePasswordWindow();
changePasswordWindow.show();
break;
case"change-email":prepareChangeEmailWindow();
changeEmailWindow.show();
break;
case"mobile-view":if(asControl){return
}window.location.href=htcConfig.relativePath+"Default.aspx?Mobile=";
break
}}}})
}}catch(e){ProcessScriptError(e)
}var getToolbarButtons=function(baseArray){if(!Ext.isArray(baseArray)||baseArray.length<1){return[]
}var result=[];
var rr=[];
var needSep=false;
var needFill=true;
var smallIcon=isEmbeddedtoIFRAME||htcConfig.toolbarIconSize==1;
var scale=smallIcon?"small":"medium";
var appendSep=function(){if(needSep){if(result.length>0){result.push("-")
}needSep=false
}};
var pushFill=function(){if(needFill){rr.push("->");
needFill=false
}};
var getMenuObject=function(itemName){switch(itemName){case"View":return gridViewMenu;
case"Favorites":return favoritesSubMenu;
case"FileMenu":return fileMenu;
case"Administration":return adminMenu;
case"Settings":return settingsMenu;
case"ViewEditSharing":case"ViewEdit":return viewEditSubMenu;
case"Share":return shareSubMenu;
case"Label":return labelsMenu;
case"WatchForModifs":return watchSubMenu;
case"More":return moreSubMenu;
case"Clouds":return cloudsSubMenu;
case"Trash":return htcConfig.enableTrash?trashSubMenu:null;
case"New":return newSubMenu;
case"Versioning":return versioningSubMenu;
case"Unzip":return unzipSubMenu;
case"Copy":return(htcConfig.copyMoveToMode==2)?copyMenu:null;
case"Cut":return(htcConfig.copyMoveToMode==2)?moveMenu:null;
default:return null
}};
try{Ext.each(baseArray,function(item,index,allItems){var button=null,rButton=null,sButton=null,srButton=null,allow=true,cfg=null,isRight=false,btnCfg=null,withHandler=false,withMenu=false,copyOrCut=false,itmName=item.name,secondItmName=null,secondBtnCfg=null;
if(item.name==="Separator"){needSep=true
}else{switch(item.name){case"Folders":allow=getTreeViewValue()!="disabled";
break;
case"View":allow=gridViewMenu?true:false;
break;
case"Favorites":allow=favoritesSubMenu?true:false;
break;
case"Administration":allow=adminMenu?true:false;
break;
case"Settings":allow=settingsMenu?true:false;
break;
case"Copy":case"Cut":if(htcConfig.copyMoveToMode==3){itmName=(item.name=="Cut")?"MoveTo":"CopyTo"
}else{if(htcConfig.copyMoveToMode==1){secondItmName=(item.name=="Cut")?"MoveTo":"CopyTo"
}}copyOrCut=true;
break
}}if(allow&&(cfg=toptbarConfig[itmName])){isRight=(cfg.right===true);
if(isRight){pushFill()
}else{appendSep()
}btnCfg={scale:scale};
if(typeof cfg.handler=="function"){btnCfg.handler=cfg.handler;
withHandler=true
}if(cfg.menu===true||copyOrCut){var subMenu=getMenuObject(item.name);
if(subMenu){btnCfg.menu=subMenu;
withMenu=true;
if(copyOrCut){btnCfg.handler=undefined;
withHandler=false
}}}else{if(Ext.isObject(cfg.menu)||Ext.isArray(cfg.menu)){btnCfg.menu=cfg.menu;
withMenu=true
}}if(item.view!=2){if(cfg.textKey){btnCfg.text=htcConfig.locData[cfg.textKey]
}else{if(item.name=="Logout"){btnCfg.text=Ext.util.Format.htmlEncode(htcConfig.currentUser)
}}}if(item.view!=1&&cfg.iconName){btnCfg.icon=HttpCommander.Lib.Utils.getIconPath(this,(smallIcon||htcConfig.iconSet.ext.indexOf("png")<0?cfg.iconName:(cfg.iconBigName?cfg.iconBigName:("24/"+cfg.iconName))));
if(htcConfig.iconSet.ext.indexOf("svg")>=0&&HttpCommander.Lib.Utils.browserIs.ie10standard){btnCfg.icon+="?q=toolbar"
}}if(item.view==2&&(cfg.textKey||cfg.tooltip)){if(cfg.textKey){btnCfg.tooltip={text:htcConfig.locData[cfg.textKey]}
}else{btnCfg.tooltip={text:htcConfig.locData[cfg.tooltip.textKey],title:htcConfig.locData[cfg.tooltip.titleKey]}
}}if(cfg.disabled===true){btnCfg.disabled=true
}if(item.name==="Logo"){btnCfg.tooltip={text:logoBtn.tooltip};
btnCfg.icon=htcConfig.relativePath+logoBtn.icon;
btnCfg.iconCls="x-logo-icon"
}if(item.name==="Folders"){btnCfg.pressed=!getHideTreeValue();
btnCfg.enableToggle=true
}if(item.name=="FileMenu"){btnCfg.weight=3-item.view
}if(item.name=="Logout"){btnCfg.hidden=asControl;
btnCfg.listeners={render:function(btn){if(typeof events.LogOut=="function"){btn.setVisible(true)
}}};
if(cfg.tooltip){btnCfg.tooltip={text:htcConfig.locData[cfg.tooltip.textKey],title:htcConfig.locData[cfg.tooltip.titleKey]}
}}if(!Ext.isEmpty(cfg.cls)){btnCfg.cls=cfg.cls
}}if(!Ext.isEmpty(secondItmName)&&allow&&(cfg=toptbarConfig[secondItmName])){secondBtnCfg={scale:scale,handler:cfg.handler};
if(item.view!=2){secondBtnCfg.text=htcConfig.locData[cfg.textKey]
}if(item.view!=1&&cfg.iconName){secondBtnCfg.icon=HttpCommander.Lib.Utils.getIconPath(this,(smallIcon||htcConfig.iconSet.ext.indexOf("png")<0?cfg.iconName:(cfg.iconBigName?cfg.iconBigName:("24/"+cfg.iconName))));
if(htcConfig.iconSet.ext.indexOf("svg")>=0&&HttpCommander.Lib.Utils.browserIs.ie10standard){secondBtnCfg.icon+="?q=toolbar"
}}if(item.view==2&&(cfg.textKey||cfg.tooltip)){if(cfg.textKey){secondBtnCfg.tooltip={text:htcConfig.locData[cfg.textKey]}
}else{secondBtnCfg.tooltip={text:htcConfig.locData[cfg.tooltip.textKey],title:htcConfig.locData[cfg.tooltip.titleKey]}
}}if(cfg.disabled===true){secondBtnCfg.disabled=true
}if(!Ext.isEmpty(cfg.cls)){secondBtnCfg.cls=cfg.cls
}}if(btnCfg){if(isRight){rButton=(withHandler&&withMenu)?new Ext.SplitButton(btnCfg):new Ext.Button(btnCfg)
}else{button=(withHandler&&withMenu)?new Ext.SplitButton(btnCfg):new Ext.Button(btnCfg)
}}if(secondBtnCfg){if(isRight){rsButton=new Ext.Button(secondBtnCfg)
}else{sButton=new Ext.Button(secondBtnCfg)
}}if(button){result.push(button);
if(item.name=="Edit"){editOpenTxtButtons.push(button)
}else{if(item.name=="MSOEdit"){msoEditButtons.push(button)
}else{if(item.name=="OOOEdit"){oooEditButtons.push(button)
}}}(toptbarButtons[itmName]=toptbarButtons[itmName]||[]).push(button)
}if(sButton){result.push(sButton);
(toptbarButtons[secondItmName]=toptbarButtons[secondItmName]||[]).push(sButton)
}if(rButton){rr.push(rButton);
if(item.name=="Edit"){editOpenTxtButtons.push(rButton)
}else{if(item.name=="MSOEdit"){msoEditButtons.push(rButton)
}else{if(item.name=="OOOEdit"){oooEditButtons.push(rButton)
}}}(toptbarButtons[itmName]=toptbarButtons[itmName]||[]).push(rButton)
}if(srButton){rr.push(srButton);
(toptbarButtons[secondItmName]=toptbarButtons[secondItmName]||[]).push(srButton)
}},this)
}catch(e){ProcessScriptError(e)
}for(var i=0;
i<rr.length;
i++){result.push(rr[i])
}return result
};
try{var ttbb1,ttbb2;
if(htcConfig.toolbarButtons1.length>0){ttbb1=getToolbarButtons(htcConfig.toolbarButtons1)
}if(htcConfig.toolbarButtons2.length>0){ttbb2=getToolbarButtons(htcConfig.toolbarButtons2)
}if(htcConfig.showControlNavigationFolders){try{controlNavFolders=new HttpCommander.Lib.ControlNavFolders({htcConfig:htcConfig,isUsedSmallIcons:function(){return isEmbeddedtoIFRAME||htcConfig.toolbarIconSize==1
},openGridFolder:openGridFolder,getFolderTitle:getFolderTitle})
}catch(e){controlNavFolders=null
}}if(typeof ttbb1!="undefined"&&typeof ttbb2!="undefined"){toptbar=new Ext.Container({xtype:"container",layout:"anchor",defaults:{anchor:"0",cls:"x-panel-header",enableOverflow:true,xtype:"toolbar"},items:[{items:ttbb1},{items:ttbb2}]});
if(controlNavFolders){var toolbar1=toptbar.items.items[0];
if(toolbar1){toolbar1.insert(0,controlNavFolders.historyBtn);
toolbar1.insert(0,controlNavFolders.forwardBtn);
toolbar1.insert(0,controlNavFolders.backBtn)
}}}else{var ttbb=ttbb1||ttbb2;
if(typeof ttbb!="undefined"||controlNavFolders){toptbar=new Ext.Toolbar({cls:"x-panel-header",enableOverflow:true,items:ttbb?ttbb:[]});
if(controlNavFolders){toptbar.insert(0,controlNavFolders.historyBtn);
toptbar.insert(0,controlNavFolders.forwardBtn);
toptbar.insert(0,controlNavFolders.backBtn)
}}}}catch(e){ProcessScriptError(e)
}};
var initView=function(){var showAdditionalHints=function(){if(embedded&&modal){var xy=xy=extEl.getAlignToXY(Ext.getBody(),"c-c");
if(xy[0]<0){xy[0]=0
}if(xy[1]<0){xy[1]=0
}extEl.setLocation(xy[0],xy[1])
}view.doLayout();
try{if(htcConfig.showTrial||htcConfig.showUpgrade){var message=htcConfig.showTrial?HttpCommander.Lib.Utils.encrypt("Vmqfdjpwfqfg#03.gbz#fubovbwjlm#ufqpjlm")+(htcConfig.demoExpired===true?".<br /><b style='color:Red;'>Your evaluation period has expired!</b>":".<br />Days left: "+htcConfig.trialDaysLeft):"";
if(htcConfig.showUpgrade){if(message.length>0){message+=".<br /><br />"
}message+=String.format(htcConfig.locData.LicenseCheckMessage,"//www.element-it.com/checklicense.aspx")
}Msg.show({title:htcConfig.showTrial?HttpCommander.Lib.Utils.encrypt("Wqjbo#ufqpjlm"):"Upgrade info",msg:message,icon:htcConfig.demoExpired?Msg.ERROR:Msg.WARNING,buttons:Msg.OK})
}}catch(e){ProcessScriptError(e)
}try{var symbLink=HttpCommander.Lib.Utils.queryString("symblink");
var symbLinkExists=false;
if(symbLink!=null&&symbLink.length>0){if(HttpCommander.Lib.Utils.getFileExtension(symbLink)=="lnk"){var pathParts=symbLink.split("/");
if(pathParts.length>1){symbLinkExists=true;
var lnkName=pathParts.pop();
openShortcut(pathParts.join("/"),lnkName,true)
}}}if(!symbLinkExists){var selectFileFromUrl=HttpCommander.Lib.Utils.queryString("file"),openFolderFromUrl=HttpCommander.Lib.Utils.queryString("folder"),fileParts=[],folderParts=[];
if(selectFileFromUrl&&selectFileFromUrl!=""){var filePartsTmp=selectFileFromUrl.split("/");
while(filePartsTmp.length>0&&filePartsTmp[filePartsTmp.length-1].trim().length==0){filePartsTmp.pop()
}if(filePartsTmp.length>0){selectFileFromUrl=filePartsTmp.pop();
Ext.each(filePartsTmp,function(part){if(part.trim().length>0){fileParts.push(part)
}})
}else{selectFileFromUrl=null
}}else{selectFileFromUrl=null
}if(openFolderFromUrl&&openFolderFromUrl!=""){var folderPartsTmp=openFolderFromUrl.split("/");
while(folderPartsTmp.length>0&&folderPartsTmp[folderPartsTmp.length-1].trim().length==0){folderPartsTmp.pop()
}Ext.each(folderPartsTmp,function(part){if(part.trim().length>0){folderParts.push(part)
}})
}openFolderFromUrl=folderParts.concat(fileParts).join("/");
if(tree&&getTreeViewValue()!="disabled"){if(openFolderFromUrl==null||openFolderFromUrl.length==0){tree.getRootNode().expand(false,false,function(node){var firstChild=node.childNodes[0];
if(firstChild&&htcConfig.autoOpen){var path=firstChild.attributes.path;
openGridFolder(path,true,true);
openGridFolder(path,true,true)
}else{openGridFolder("root")
}})
}else{if(selectFileFromUrl!=null&&selectFileFromUrl.length>0){selectPath={name:selectFileFromUrl,path:openFolderFromUrl}
}openGridFolder(openFolderFromUrl,true,true)
}}else{if(openFolderFromUrl!=null&&openFolderFromUrl.length>0){if(selectFileFromUrl!=null&&selectFileFromUrl.length>0){selectPath={name:selectFileFromUrl,path:openFolderFromUrl}
}openGridFolder(openFolderFromUrl)
}else{openGridFolder("root")
}}}}catch(e){ProcessScriptError(e)
}try{if(welcome&&!Ext.isEmpty(welcome.message)&&welcome.message.trim().length>0){var showCb=(htcConfig.welcomeWindowAllowHide===true),show=true;
if(showCb){var cce=HttpCommander.Lib.Utils.getCookie($("htcwwm"));
if(!Ext.isEmpty(cce)&&(cce=="yes"||cce=="1"||cce=="true")){show=false
}}if(show){(new Window({title:(welcome.title&&welcome.title!="")?welcome.title:"Welcome window",bodyStyle:"padding: 5px",layout:"fit",width:400,height:200,buttonAlign:"center",closeAction:"close",collapsible:false,minimizable:false,closable:true,resizable:false,maximizable:false,modal:true,plain:true,autoHeight:true,items:[{xtype:"label",hideLabel:true,autoHeight:true,margins:"0 0 5 0",html:welcome.message+(showCb?"<br /><br />":"")},{itemId:"hide-wwm-cb",xtype:"checkbox",boxLabel:htcConfig.locData.WelcomeWindowHideCheckboxLabel,autoHeight:true,hidden:!showCb}],listeners:{hide:function(wnd){HttpCommander.Lib.Utils.deleteCookie($("htcwwm"));
var cb=wnd.getComponent("hide-wwm-cb");
if(cb&&cb.isVisible&&cb.getValue()){HttpCommander.Lib.Utils.setCookie($("htcwwm"),"1")
}}},buttons:[{text:"OK",handler:function(){var wnd=this.ownerCt.ownerCt;
wnd.hide()
}}]})).show()
}}}catch(e){ProcessScriptError(e)
}try{if(typeof htcConfig.remainedDaysPassword!="undefined"&&htcConfig.remainedDaysPassword!=null&&Ext.isNumber(htcConfig.remainedDaysPassword)){var passExpMsg="";
if(htcConfig.remainedDaysPassword<0){passExpMsg=htcConfig.locData.PasswordExpiredMessage
}else{passExpMsg=String.format(htcConfig.locData.PasswordExpiresMessage,htcConfig.remainedDaysPassword)
}if(htcConfig.changePassword){passExpMsg+="<br /><br />"+String.format(htcConfig.locData.PasswordChangeMessage,"<b>",htcConfig.locData.CommandSettings,htcConfig.locData.CommandChangePassword,"</b>")
}Msg.show({title:htcConfig.locData.PasswordExpiresTitle,msg:passExpMsg,closable:true,modal:true,buttons:Msg.CANCEL,icon:Msg.WARNING})
}}catch(e){ProcessScriptError(e)
}};
try{var header=logoHeader&&logoHeader.html&&logoHeader.html!="";
var headerCfg=undefined;
if(header||(embedded&&(showHideIcon||draggable))){headerCfg={cls:"x-panel-header"};
headerCfg.html=header?logoHeader.html:"&nbsp;"
}var mask;
var iframeEl=(function(){try{if(parent!=null){var iframes=parent.document.getElementsByTagName("iframe");
for(var i=0;
i<iframes.length;
i++){if(iframes[i].contentWindow==window){return iframes[i]
}}}}catch(error){}return null
})();
var winResizeFunc=function(){if(view){var b=Ext.getBody();
if(b){view.setSize(b.getViewSize())
}}};
var getStyle=function(element){if(element){return window.getComputedStyle?getComputedStyle(element,""):element.currentStyle
}return null
};
var minimizeHandler=function(event,toolEl,panel,tc){if(iframeEl!=null){if(panel.getTool("restore")){panel.getTool("restore").hide()
}if(panel.getTool("maximize")){panel.getTool("maximize").show()
}if(iframeEl.restoreStyle){for(var prop in iframeEl.restoreStyle){iframeEl.style[prop]=iframeEl.restoreStyle[prop]
}delete iframeEl.restoreStyle
}if(iframeEl.parentPositions&&iframeEl.parentPositions.length>0){var parentEl=iframeEl.parentNode;
var i=0;
do{if(parentEl.style&&iframeEl.parentPositions[i]){parentEl.style.position=iframeEl.parentPositions[i]
}i++
}while((parentEl=parentEl.parentNode)&&(i<iframeEl.parentPositions.length));
delete iframeEl.parentPositions
}if(iframeEl.htmlOverflow){try{parent.document.documentElement.style.overflow=iframeEl.htmlOverflow;
delete iframeEl.htmlOverflow
}catch(e1){}}if(iframeEl.bodyOverflow){try{parent.document.body.style.overflow=iframeEl.bodyOverflow;
delete iframeEl.bodyOverflow
}catch(e2){}}if(iframeEl.oldScrolling){iframeEl.scrolling=iframeEl.oldScrolling;
delete iframeEl.oldScrolling
}panel.maximized=false;
iframeEl.maximized=false;
return
}Ext.EventManager.removeResizeListener(winResizeFunc,panel);
panel.el.removeClass("x-window-maximized");
if(panel.getTool("restore")){panel.getTool("restore").hide()
}if(panel.getTool("maximize")){panel.getTool("maximize").show()
}if(extEl.resizer){extEl.resizer.enabled=true
}var vs=panel.container;
vs.removeClass("x-window-maximized-ct");
if(panel.restoreStyle){vs.setStyle(panel.restoreStyle);
delete panel.restoreStyle
}if(panel.restorePos){panel.setPosition(panel.restorePos[0],panel.restorePos[1]);
delete panel.restorePos
}if(panel.restoreSize){panel.setSize(panel.restoreSize.width,panel.restoreSize.height);
delete panel.restoreSize
}panel.maximized=false;
if(panel.el.enableShadow){panel.el.enableShadow(true)
}if(panel.dd){panel.dd.unlock()
}if(extEl.dd){extEl.dd.unlock()
}if(panel.collapsible&&panel.getTool("toggle")){panel.getTool("toggle").show()
}};
var maximizeHandler=function(event,toolEl,panel,tc){if(iframeEl!=null){try{parent.scrollTo(0,0)
}catch(e1){}if(panel.getTool("restore")){panel.getTool("restore").show()
}if(panel.getTool("maximize")){panel.getTool("maximize").hide()
}var hcStyle=getStyle(iframeEl);
if(hcStyle){iframeEl.restoreStyle={position:hcStyle.position,left:hcStyle.left,top:hcStyle.top,width:hcStyle.width,height:hcStyle.height,zIndex:hcStyle.zIndex,overflow:hcStyle.overflow}
}var parentEl=iframeEl.parentNode;
var cs;
iframeEl.parentPositions=[];
do{if(parentEl.style){cs=getStyle(parentEl);
if(cs){iframeEl.parentPositions.push(cs.position)
}parentEl.style.position="static"
}}while(parentEl=parentEl.parentNode);
try{var csHtml=getStyle(parent.document.documentElement);
if(csHtml){iframeEl.htmlOverflow=csHtml.overflow
}parent.document.documentElement.style.overflow="hidden";
var csBody=getStyle(parent.document.body);
if(csBody){iframeEl.bodyOverflow=csBody.overflow
}parent.document.body.style.overflow="hidden"
}catch(e2){}iframeEl.style.position="absolute";
iframeEl.style.left="0px";
iframeEl.style.top="0px";
iframeEl.style.width="100%";
iframeEl.style.height="100%";
iframeEl.style.overflow="hidden";
iframeEl.oldScrolling=iframeEl.scrolling;
iframeEl.scrolling="no";
panel.maximized=true;
iframeEl.maximized=true;
return
}panel.expand(false);
panel.restoreSize=panel.getSize();
panel.restorePos=panel.getPosition(true);
var vs=panel.container;
panel.restoreStyle={width:vs.getStyle("width"),height:vs.getStyle("height"),position:vs.getStyle("position"),left:vs.getStyle("left"),top:vs.getStyle("top")};
if(panel.getTool("maximize")){panel.getTool("maximize").hide()
}if(panel.getTool("restore")){panel.getTool("restore").show()
}if(panel.el.disableShadow){panel.el.disableShadow()
}if(panel.dd){panel.dd.lock()
}if(extEl.dd){extEl.dd.lock()
}if(panel.collapsible&&panel.getTool("toggle")){panel.getTool("toggle").hide()
}if(extEl.resizer){extEl.resizer.enabled=false
}panel.el.addClass("x-window-maximized");
vs.addClass("x-window-maximized-ct");
vs.setStyle({width:"100%",height:"100%",position:"absolute",left:"0px",top:"0px"});
panel.setPosition(0,0);
var b=Ext.getBody();
panel.setSize(b.getViewSize());
panel.maximized=true;
Ext.EventManager.onWindowResize(winResizeFunc,panel)
};
var viewTools=[];
if(showMaximizedButton){viewTools.push({id:"restore",hidden:(iframeEl!=null&&!iframeEl.maximized)||((htcConfig.insideDiv==true)&&embedded),handler:function(event,toolEl,panel,tc){if(iframeEl==null&&!embedded){Msg.alert("",'You have enabled parameter <b>ShowFullScreenOrExitFullScreenButton=true</b> but DIV with <b>id="httpcommander"</b> not found.<br />See manual at <a target="_black" href="'+htcConfig.relativePath+'Manual/webconfigsetup.html#ShowFullScreenOrExitFullScreenButton">ShowFullScreenOrExitFullScreenButton parameter</a>')
}else{if((iframeEl!=null&&iframeEl.maximized)||panel.maximized){minimizeHandler(event,toolEl,panel,tc)
}}return panel
}});
if(embedded||iframeEl!=null){viewTools.push({id:"maximize",hidden:(iframeEl!=null&&iframeEl.maximized===true)||(iframeEl==null&&(typeof htcConfig.insideDiv=="undefined"||htcConfig.insideDiv===false)),handler:function(event,toolEl,panel,tc){if((iframeEl!=null&&!iframeEl.maximized)||!panel.maximized){maximizeHandler(event,toolEl,panel,tc)
}return panel
}})
}}if(showHideIcon&&embedded){viewTools.push({id:"close",qtip:htcConfig.locData.ControlHideFileManager,handler:function(e,t,p){fm.Hide()
}})
}if(viewTools.length==0){viewTools=undefined
}if(sharedGrid||sharedFYGrid){var cwItems=[grid];
if(sharedGrid){cwItems.push(sharedGrid)
}if(sharedFYGrid){cwItems.push(sharedFYGrid)
}cardSwitchGrid=new Ext.Panel({layout:"card",activeItem:0,header:false,region:"center",border:false,items:cwItems})
}var mainItemsArr=[];
if(htcConfig.enableDetailsPane){try{detailsPane=HttpCommander.Lib.DetailsPane({htcConfig:htcConfig,Msg:Msg,"$":$,globalLoadMask:globalLoadMask,getIsEmbeddedtoIFRAME:function(){return isEmbeddedtoIFRAME
},getRenderers:function(){return renderers
},getMetadataProvider:function(){return metadataProvider
},getDebugMode:function(){return debugmode
},getGrid:function(){return grid
},isSpecialTreeFolderOrSubFolder:isSpecialTreeFolderOrSubFolder,openGridFolder:openGridFolder,getHideDetailsPaneValue:getHideDetailsPaneValue,setSelectPath:function(v){selectPath=v
},getCurrentFolder:getCurrentFolder,getMetadataWindow:function(){return metadataWindow
},getAvatarHtml:getAvatarHtml,getSelectedRow:function(){var sm=null;
sel=null;
if(!!grid&&grid.rendered&&!grid.hidden){sm=grid.getSelectionModel();
if(!!sm){sel=sm.getSelected()
}}return sel
},isRootFolder:isRootFolder})
}catch(e){detailsPane=null;
ProcessScriptError(e)
}}if(embedded){mainItemsArr=[(cardSwitchGrid?cardSwitchGrid:grid)];
if(tree&&getTreeViewValue()!="disabled"){mainItemsArr.unshift(tree)
}if(!!detailsPane){mainItemsArr.unshift(detailsPane)
}view=new Ext.Panel({renderTo:extEl,width:extEl.getWidth(),height:extEl.getHeight(),layout:"border",style:resizable?{padding:"6px"}:undefined,header:header||showHideIcon||draggable,headerCfg:headerCfg,items:mainItemsArr,tbar:toptbar,tools:viewTools,listeners:{afterrender:function(p){if(iframeEl==null&&(typeof htcConfig.insideDiv=="undefined"||htcConfig.insideDiv===false)){if(p.getTool("maximize")){maximizeHandler(null,null,p,null)
}}}}});
if(resizable){extEl.resizer=new Ext.Resizable(extEl,{handles:"all",minWidth:300,minHeight:200,pinned:true,handleCls:"x-window-handle",listeners:{resize:function(r,w,h,e){view.setSize(extEl.getWidth(),extEl.getHeight())
}}})
}if(draggable&&view.header){extEl.dd=new Ext.dd.DD(extEl.id,$("view"),{moveOnly:true,scroll:false});
extEl.dd.setHandleElId(view.header.id)
}if(modal){mask=Ext.getBody().createChild({cls:"ext-el-mask-modal"});
mask.enableDisplayMode("block");
if(hidden){mask.hide();
Ext.getBody().removeClass("x-body-masked")
}else{Ext.getBody().addClass("x-body-masked");
mask.setSize(Ext.lib.Dom.getViewWidth(true),Ext.lib.Dom.getViewHeight(true));
mask.show()
}}}else{var northPanel=new Ext.Panel({tools:viewTools,region:"north",header:header,headerCfg:headerCfg,tbar:toptbar,bodyBorder:false,bodyStyle:{height:"0px"},autoHeight:true,listeners:{resize:function(selfPanel){selfPanel.body.dom.style.height="0px"
}}});
mainItemsArr=[(cardSwitchGrid?cardSwitchGrid:grid)];
if(tree&&getTreeViewValue()!="disabled"){mainItemsArr.unshift(tree)
}if(!!detailsPane){mainItemsArr.unshift(detailsPane)
}mainItemsArr.unshift(northPanel);
view=new Ext.Viewport({layout:"border",items:mainItemsArr,listeners:{afterrender:function(selfView){if(showMaximizedButton&&iframeEl!=null&&!iframeEl.maximized&&(typeof htcConfig.insideDiv=="undefined"||htcConfig.insideDiv===false)){if(northPanel.getTool("restore")){maximizeHandler(null,null,northPanel,null)
}}selfView.syncSize();
selfView.el.dom.parentNode.onresize=function(){selfView.syncSize()
};
window.onresize=function(){selfView.syncSize()
}
}}})
}view.on("show",showAdditionalHints,view,{single:true});
fm.Show=function(){if(embedded){if(modal){Ext.getBody().addClass("x-body-masked");
if(mask){mask.setSize(Ext.lib.Dom.getViewWidth(true),Ext.lib.Dom.getViewHeight(true));
mask.show()
}}extEl.show();
view.setSize(extEl.getWidth(),extEl.getHeight())
}view.show();
hidden=false;
onShow()
};
fm.Hide=function(){if(embedded){if(modal){if(mask){mask.hide()
}Ext.getBody().removeClass("x-body-masked")
}view.hide();
extEl.setVisibilityMode(Ext.Element.DISPLAY);
extEl.hide();
hidden=true;
onHide()
}else{hidden=false
}};
if(hidden&&embedded){fm.Hide()
}else{fm.Show()
}}catch(e){throw e
}};
var setActiveStyleSheet=function(title){Ext.util.CSS.swapStyleSheet("httpcommander-default-theme",String.format("{0}Images/resources_1.5/css/{1}{2}.css",htcConfig.relativePath,styleName=="default"?"ext-all":"xtheme-"+styleName,debugmode?"":"-min"));
if(grid){grid.getView().refresh()
}};
var setThemeFromCookie=function(){var styleCookie=HttpCommander.Lib.Utils.getCookie("htctheme");
styleName=styleCookie?styleCookie:"default";
setActiveStyleSheet(styleName)
};
var initGoogleDriveAuth=function(){if(htcConfig.isAllowedGoogleDrive||htcConfig.enableGoogleEdit){try{googleDriveAuth=HttpCommander.Lib.GoogleDriveAuth({htcConfig:htcConfig,Msg:Msg,globalLoadMask:globalLoadMask,isDemoMode:function(){return isDemoMode
}})
}catch(e){ProcessScriptError(e)
}}};
var initSkyDriveAuth=function(){if(htcConfig.isAllowedSkyDrive||htcConfig.enableMSOOEdit){try{skyDriveAuth=HttpCommander.Lib.SkyDriveAuth({htcConfig:htcConfig,Msg:Msg,globalLoadMask:globalLoadMask,getDebugMode:function(){return debugmode
},getFileManagerInstance:function(){return fm
},getUid:function(){return uid
},isDemoMode:function(){return isDemoMode
}});
if(skyDriveAuth){skyDriveAuth.init()
}}catch(e){ProcessScriptError(e)
}}};
var initBoxAuth=function(){if(htcConfig.isAllowedBox){try{boxAuth=HttpCommander.Lib.BoxAuth({htcConfig:htcConfig,Msg:Msg,globalLoadMask:globalLoadMask,getUid:function(){return uid
},getFileManagerInstance:function(){return fm
},isDemoMode:function(){return isDemoMode
}})
}catch(e){ProcessScriptError(e)
}}};
var initDropboxAuth=function(){if(htcConfig.isAllowedDropbox){try{dropboxAuth=HttpCommander.Lib.DropboxAuth({htcConfig:htcConfig,Msg:Msg,globalLoadMask:globalLoadMask,isDemoMode:function(){return isDemoMode
}})
}catch(e){ProcessScriptError(e)
}}};
var extOnReadyFunction=function(){extOnReadyInvoked=true;
if(rendered){return
}try{if(isAccessTheme){Ext.getBody().addClass("access-theme-font-color")
}}catch(e){}onPreRender();
if(Ext.isIE6||Ext.isIE7||Ext.isAir){Ext.BLANK_IMAGE_URL=htcConfig.relativePath+"Images/resources_1.5/images/default/s.gif"
}try{if(HttpCommander.Lib.Utils.browserIs.edge){var bd=document.body||document.getElementsByTagName("body")[0];
if(!!bd){bd.className+=" ext-edge"
}}}catch(e){if(!!window.console&&!!window.console.log){window.console.log(e)
}}initQuickTips();
try{extEl=embedded?Ext.get(container):Ext.getBody();
if(!extEl||extEl.dom.tagName.toLowerCase()!="div"||(!asControl&&(typeof htcConfig.insideDiv=="undefined"||htcConfig.insideDiv===false)&&(typeof htcConfig.showFullScreenOrExitFullScreenButton=="undefined"||htcConfig.showFullScreenOrExitFullScreenButton===false))){container=null;
embedded=false;
extEl=Ext.getBody()
}else{embedded=true
}HttpCommander.Lib.Utils.preventSelection(extEl.dom,ProcessScriptError)
}catch(e){ProcessScriptError(e)
}Ext.enableFx=true;
try{maxWidthThumb=htcConfig.maxWidthThumb||100;
maxHeightThumb=htcConfig.maxHeightThumb||100;
thumbnailTpl=new Ext.Template('<div class="thumbnailWraper {cls}" style="height:'+(maxHeightThumb+25)+"px;width:"+(maxWidthThumb+20)+'px;"><div class="thumb" style="height:'+maxHeightThumb+"px;width:"+(maxWidthThumb+10)+'px;">{thumbnail}</div><div class="filename"><span ext:qtip="{name}" unselectable="on">{viewname}</span></div></div>')
}catch(e){ProcessScriptError(e)
}try{globalLoadMask=new Ext.LoadMask(extEl,{msg:htcConfig.locData.ProgressLoading+"..."})
}catch(e){ProcessScriptError(e)
}isEmbeddedtoIFRAME=embedded||(htcConfig.isEmbeddedtoIFRAME||isEmbeddedtoIFRAME);
if(getParamBooleanValue("isEmbeddedtoIFRAME")){isEmbeddedtoIFRAME=true
}try{Msg=(isEmbeddedtoIFRAME||embedded)?HttpCommander.Lib.MessageBox({container:extEl,maxWidth:400}):Ext.Msg;
if(htcConfig.locData){Ext.apply(Msg.buttonText,{yes:htcConfig.locData.ExtMsgButtonTextYES||Msg.buttonText.yes,no:htcConfig.locData.ExtMsgButtonTextNO||Msg.buttonText.no,ok:htcConfig.locData.CommonButtonCaptionOK||Msg.buttonText.ok,cancel:htcConfig.locData.CommonButtonCaptionCancel||Msg.buttonText.cancel})
}fm.messageBoxHide=function(){if(Msg){Msg.hide()
}else{if(Ext.Msg){Ext.Msg.hide()
}}}
}catch(e){ProcessScriptError(e)
}try{Window=embedded?HttpCommander.Lib.Window(extEl):Ext.Window
}catch(e){ProcessScriptError(e)
}if(connectionClassObserved!==true){try{Ext.util.Observable.observeClass(Ext.data.Connection);
Ext.data.Connection.on("requestcomplete",function(dataconn,response){try{var status=null;
if(Ext.isFunction(response.getResponseHeader)){status=response.getResponseHeader("X-HttpCommander-Status")
}if(!asControl&&status&&status==0){window.location.href=htcConfig.relativePath+"Logout.aspx";
return
}}catch(e){ProcessScriptError(e)
}if(activityMonitor&&Ext.isFunction(activityMonitor.killSessionTaskReset)){activityMonitor.killSessionTaskReset()
}});
connectionClassObserved=true
}catch(e){ProcessScriptError(e)
}}try{extEl.on("contextmenu",function(event,object){try{if(object&&object.type&&HttpCommander.Lib.Consts.browserContextMenuTypes.indexOf(object.type.toLowerCase())!=-1){if(window.event){window.event.returnValue=true
}return true
}else{event.stopEvent();
return false
}}catch(e){ProcessScriptError(e)
}})
}catch(e){ProcessScriptError(e)
}try{Ext.Direct.addProvider(HttpCommander.Remote.TreeHandler);
Ext.Direct.addProvider(HttpCommander.Remote.GridHandler);
Ext.Direct.addProvider(HttpCommander.Remote.CommonHandler)
}catch(e){ProcessScriptError(e);
return fm
}try{Ext.Direct.addProvider(HttpCommander.Remote.AdminHandler);
metadataProvider=Ext.Direct.addProvider(HttpCommander.Remote.MetadataHandler);
Ext.Direct.addProvider(HttpCommander.Remote.GoogleDriveHandler);
Ext.Direct.addProvider(HttpCommander.Remote.UploadFromURLHandler);
Ext.Direct.addProvider(HttpCommander.Remote.DropboxHandler);
Ext.Direct.addProvider(HttpCommander.Remote.SkyDriveHandler);
Ext.Direct.addProvider(HttpCommander.Remote.OneDriveForBusinessHandler);
Ext.Direct.addProvider(HttpCommander.Remote.BoxHandler);
Ext.Direct.addProvider(HttpCommander.Remote.VideoHandler)
}catch(e){ProcessScriptError(e)
}try{var loading=Ext.get($("loading"));
if(loading){loading.fadeOut({duration:0.2,remove:true});
var loadingMask=Ext.get($("loading-mask"));
loadingMask.setOpacity(0.9);
loadingMask.shift({xy:loading.getXY(),width:loading.getWidth(),height:loading.getHeight(),remove:true,duration:1,opacity:0.1,easing:"bounceOut"})
}}catch(e){ProcessScriptError(e)
}try{if(typeof htcConfig.demoLogoHeader=="string"&&htcConfig.demoLogoHeader.trim()!=""){logoHeader.html=htcConfig.demoLogoHeader.replace(/\{0\}/g,htcConfig.relativePath).replace(/\{1\}/g,uid).replace(/\{2\}/g,embedded||isEmbeddedtoIFRAME?"display:none!important;":"").replace(/\{3\}/g,embedded||isEmbeddedtoIFRAME?"":"padding-top:33px;");
isDemoMode=true
}else{if(typeof htcConfig.logoHeaderHtml=="string"&&htcConfig.logoHeaderHtml.trim()!=""){logoHeader.html=htcConfig.logoHeaderHtml.replace(/\{0\}/g,htcConfig.relativePath).replace(/\{1\}/g,uid)
}}if(!Ext.isEmpty(htcConfig.welcomeWindowMessage)&&htcConfig.welcomeWindowMessage.trim().length>0){welcome.message=htcConfig.welcomeWindowMessage.trim()
}}catch(e){ProcessScriptError(e)
}if(vTypesApplied!==true){try{Ext.apply(Ext.form.VTypes,{password:function(val,field){if(field.initialPassField){var pwd=Ext.getCmp(field.initialPassField);
return(val==pwd.getValue())
}return true
},passwordText:htcConfig.locData.LinkToFilePasswordNotMatch});
vTypesApplied=true
}catch(e){ProcessScriptError(e)
}}if(typeof htcConfig.itemsPerPage=="number"){pagingEnabled=htcConfig.itemsPerPage>0
}initTree();
initGrid();
initMenu();
initMenuActions();
initToolBar();
initView();
initMainDropZone();
initGoogleDriveAuth();
initSkyDriveAuth();
initDropboxAuth();
initBoxAuth();
rendered=true;
if(Ext.isNumber(htcConfig.sessionTimeout)&&htcConfig.sessionTimeout>0){activityMonitor=new HttpCommander.Lib.ActivityMonitor({htcConfig:htcConfig,debug:debugmode})
}onRender()
};
initQuickTips();
try{Ext.onReady(extOnReadyFunction)
}catch(e){throw e
}fm.Render=function(){extOnReadyFunction()
};
hcMain.FileManagers[uid]=fm;
return fm
};
return hcMain
})();