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
var h=this.getRows(),j;
for(var b=0,f=h.length;
b<f;
b++){j=h[b];
j.style.width=d;
if(j.firstChild){j.firstChild.style.width=d;
j.firstChild.rows[0].childNodes[a].style.display=g
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
try{var o=!!document.queryCommandSupported;
this.copyToClipboard=o&&!!document.queryCommandSupported("copy")
}catch(f){}this.firefox36up=false;
this.firefox35up=false;
var g=navigator.userAgent.toLowerCase();
this.osver=1;
if(g){var n=g.substring(g.indexOf("windows ")+11);
this.osver=parseFloat(n)
}this.major=parseInt(navigator.appVersion);
this.nav=((g.indexOf("mozilla")!=-1)&&((g.indexOf("spoofer")==-1)&&(g.indexOf("compatible")==-1)));
this.nav6=this.nav&&(this.major==5);
this.nav6up=this.nav&&(this.major>=5);
this.nav7up=false;
var u;
if(this.nav6up){u=g.indexOf("netscape/");
if(u>=0){this.nav7up=parseInt(g.substring(u+9))>=7
}}this.ie=(g.indexOf("msie")!=-1);
this.aol=this.ie&&g.indexOf(" aol ")!=-1;
if(this.ie){var p=g.substring(g.indexOf("msie ")+5);
this.iever=parseInt(p);
this.verIEFull=parseFloat(p)
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
}var k=g.indexOf("edge/");
this.edge=k>=0;
this.edgeVer=0;
this.edge10586up=false;
if(this.edge){this.edgeVer=parseFloat(g.substring(k+5));
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
if(this.ios){var x=0;
var h=/os\s+(\d+)(_\d+)*\s+like\s+mac\s+os\s+x/i;
var s=h.exec(g);
if(s&&s.length>0&&s[1]){x=parseInt(s[1])
}this.ios6up=x>=6
}this.ubuntu=(g.indexOf("ubuntu")!=-1);
this.w3c=this.nav6up;
this.safari=(g.indexOf("webkit")!=-1);
this.safari125up=false;
this.safari3up=false;
this.safari5up=false;
this.safari7up=false;
this.safari8up=false;
if(this.safari&&this.major>=5){u=g.indexOf("webkit/");
if(u>=0){this.safari125up=parseInt(g.substring(u+7))>=125
}var q=g.indexOf("version/");
if(q>=0){var w=parseInt(g.substring(q+8));
this.safari3up=(w>=3);
this.safari5up=(w>=5);
this.safari7up=(w>=7);
this.safari8up=(w>=8)
}}this.firefox=this.nav&&(g.indexOf("firefox")!=-1);
this.firefox3up=false;
this.firefox35up=false;
this.firefox36up=false;
this.firefox4up=false;
this.firefox450up=false;
if(this.firefox&&this.major>=5){var m=g.indexOf("firefox/");
if(m>=0){var t=g.substring(m+8);
var c=parseInt(t);
this.firefox3up=c>=3;
this.firefox4up=c>=4;
var d=parseFloat(t);
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
if(i>=0){var r=g.substring(i+7);
var b=parseInt(r);
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
if(this.opera){var j=g.indexOf("version/");
if(j>=0){var l=g.substring(j+8);
this.opera11up=parseFloat(l)>=11;
this.opera15up=parseFloat(l)>=15
}}this.yandex=this.nav&&(g.indexOf("yabrowser")!=-1);
this.chunkedUpload=false;
try{var a=new FileReader();
if(a.readAsBinaryString){this.chunkedUpload=true
}}catch(f){}if(!this.chunkedUpload){try{if(window.File.slice){this.chunkedUpload=true
}}catch(f){}}if(!this.chunkedUpload){try{if(window.File.webkitSlice){this.chunkedUpload=true
}}catch(f){}}if(!this.chunkedUpload){try{if(window.File.mozSlice){this.chunkedUpload=true
}}catch(f){}}if(!this.chunkedUpload){try{if(window.Blob&&window.Blob().slice){this.chunkedUpload=true
}}catch(f){}}}catch(v){}})(),isChunkedUploadSupported:function(){var b=true,a=null,d=null;
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
var n,l,j,m,k,h,g;
var e=0;
f=a(f);
while(e<f.length){n=f.charCodeAt(e++);
l=f.charCodeAt(e++);
j=f.charCodeAt(e++);
m=n>>2;
k=((n&3)<<4)|(l>>4);
h=((l&15)<<2)|(j>>6);
g=j&63;
if(isNaN(l)){h=g=64
}else{if(isNaN(j)){g=64
}}d=d+b.charAt(m)+b.charAt(k)+b.charAt(h)+b.charAt(g)
}return d
},decode:function(f){if(f==null){return""
}var d="";
var n,l,j;
var m,k,h,g;
var e=0;
f=f.replace(/[^A-Za-z0-9\+\/\=]/g,"");
while(e<f.length){m=b.indexOf(f.charAt(e++));
k=b.indexOf(f.charAt(e++));
h=b.indexOf(f.charAt(e++));
g=b.indexOf(f.charAt(e++));
n=(m<<2)|(k>>4);
l=((k&15)<<4)|(h>>2);
j=((h&3)<<6)|g;
d=d+String.fromCharCode(n);
if(h!=64){d=d+String.fromCharCode(l)
}if(g!=64){d=d+String.fromCharCode(j)
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
var j=true;
for(var f in h){if(h.hasOwnProperty(f)){if(String(f).toLowerCase()=="path"){b+="; path=/";
j=false
}else{b+="; "+f;
var c=h[f];
if(c!==true){b+="="+c
}}}}if(j){b+="; path=/"
}if(b.length>=4096){return false
}document.cookie=b;
return true
},deleteCookie:function(a){HttpCommander.Lib.Utils.setCookie(a,null,{expires:-1})
},createSharePointPlugin:function(){var k=HttpCommander.Lib.Utils.browserIs;
var h=function(){return k.mac&&(k.firefox3up||k.safari3up)
};
var m=function(e){return navigator.mimeTypes&&navigator.mimeTypes[e]&&navigator.mimeTypes[e].enabledPlugin
};
var b=function(){var e=m("application/x-sharepoint-webkit");
var i=m("application/x-sharepoint");
if(k.safari3up&&e){return true
}return i
};
var a=function(){var i=null;
if(h()){i=document.getElementById("macSharePointPlugin");
if(i==null&&b()){var e=null;
if(k.safari3up&&m("application/x-sharepoint-webkit")){e="application/x-sharepoint-webkit"
}else{e="application/x-sharepoint"
}var o=document.createElement("object");
o.id="macSharePointPlugin";
o.type=e;
o.width=0;
o.height=0;
o.style.setProperty("visibility","hidden","");
document.body.appendChild(o);
i=document.getElementById("macSharePointPlugin")
}}return i
};
var g=function(){return(k.winnt||k.win32||k.win64bit)&&k.firefox3up
};
var f=function(){var i=null;
if(g()){try{i=document.getElementById("winFirefoxPlugin");
if(!i&&m("application/x-sharepoint")){var p=document.createElement("object");
p.id="winFirefoxPlugin";
p.type="application/x-sharepoint";
p.width=0;
p.height=0;
p.style.setProperty("visibility","hidden","");
document.body.appendChild(p);
i=document.getElementById("winFirefoxPlugin")
}}catch(o){i=null
}}return i
};
var n=null;
if(window.ActiveXObject||k.ie11up){var c=[function(){return new ActiveXObject("SharePoint.OpenDocuments.5")
},function(){return new ActiveXObject("SharePoint.OpenDocuments.4")
},function(){return new ActiveXObject("SharePoint.OpenDocuments.3")
},function(){return new ActiveXObject("SharePoint.OpenDocuments.2")
},function(){return new ActiveXObject("SharePoint.OpenDocuments.1")
}],d=0,j=c.length;
for(;
d<j;
++d){try{n=(c[d])();
break
}catch(l){}}}else{if(k){try{if(h()){n=a()
}else{if(g()){n=f()
}}}catch(l){}}}return n
},encrypt:function(b){var c="";
for(var a=0;
a<b.length;
++a){c+=String.fromCharCode(3^b.charCodeAt(a))
}return c
},generateUniqueString:function(){return(new Date()).getTime().toString()
},dateDiff:function(b,f,c,g,l,a){var h=((Ext.isDate(f)?f:new Date())-(Ext.isDate(b)?b:new Date()))/1000,d=h<0?"-":"",k,i,e,j;
if(h<0){h=-h
}k=Math.floor(h/86400);
h-=k*86400;
i=Math.floor(h/3600);
e=Math.floor((h-(i*3600))/60);
j=h-(i*3600)-(e*60);
if(k>0){d+=k+(c||"d")+"&thinsp;"
}if(j>=30){e++
}if(i>0||(i<=0&&k>0&&e>0)){d+=i+(g||"h")+"&thinsp;"
}if(e>0){d+=e+(l||"m")+"&thinsp;"
}else{if(d.length<2){d+="0"+(l||"m")+"&thinsp;"
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
},k=String(b.getUTCFullYear()),a=f(b.getUTCMonth()+1),j=f(b.getUTCDate()),c=f(b.getUTCHours()),g=f(b.getUTCMinutes()),l=f(b.getUTCSeconds());
return""+k+a+j+c+g+l
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
}}}var g=function(k){k=String(k||"").trim();
if(k.length==0){return
}for(var l=0,j=h.length;
l<j;
l++){if(h[l].toLowerCase()==k.toLowerCase()){return
}}h.push(k);
if(d){try{localStorage.setItem(c(),JSON.stringify(h))
}catch(m){if(!!window.console&&!!window.console.log){window.console.log("Set local storage for current user error: ");
window.console.log(m)
}}}};
return{put:g,get:function(e){if(arguments.length==0||typeof e=="undefined"){return h
}if(e>=0&&e<h.length){return h[e]
}},getDataStore:function(){var k=[];
for(var j=0,e=h.length;
j<e;
j++){k.push([h[j],false])
}return k
},clear:function(){h=[];
if(d){try{localStorage.removeItem(c())
}catch(i){if(!!window.console&&!!window.console.log){window.console.log("Error on clear local storage for current user: ");
window.console.log(i)
}}}}}
})();
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.AdminUserHelpWindow=function(b){var a=new Ext.Window({title:b.htcConfig.locData.AdminCommandHelp,closable:true,closeAction:"hide",collapsible:true,minimizable:false,maximizable:true,width:b.htcConfig.isEmbeddedtoIFRAME?350:700,height:b.htcConfig.isEmbeddedtoIFRAME?250:450,plain:true,html:'<iframe style="background-color: #FFFFFF;" scrolling="yes" width="100%" height="100%" border="0" src="'+b.htcConfig.relativePath+'Manual/adminpanel.html"></iframe>'});
return a
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.AdminEmailNotifications=function(w){var k,p;
function e(){var z=new k.recordType({events:"upload,modify,download",when:"OnSessionEnd",emails:"",users:"",groups:"",paths:[]});
var A=k.getCount();
k.add([z]);
r(A,z,p);
p.doLayout()
}function c(){h();
var A=k.getCount();
var B=new Array(A);
for(var z=0;
z<A;
++z){B[z]=k.getAt(z).data
}w.showSettingsMask();
HttpCommander.Admin.UpdateEmailNotifsSettings({groups:B},function(D,C){w.hideSettingsMask();
if(typeof D=="undefined"||!D){Ext.Msg.alert(w.htcConfig.locData.CommonErrorCaption,Ext.util.Format.htmlEncode(C.message));
return
}if(D.status!="success"){Ext.Msg.alert(w.htcConfig.locData.CommonErrorCaption,D.message);
if(D.igroup!=null&&D.ipath!=null){u(D.igroup,D.ipath,D.message)
}return
}k.reload()
})
}function i(){k.reload()
}function f(){p.removeAll();
for(var z=0;
z<k.getCount();
++z){v(k.getAt(z),p)
}p.doLayout()
}function g(z){z.add({xtype:"panel",layout:{type:"hbox",padding:"5",pack:"end"},border:false,defaults:{margins:"0 5 0 0"},items:[{xtype:"button",text:w.htcConfig.locData.AdminCommandAddGroup,width:75,handler:e},{xtype:"button",text:w.htcConfig.locData.SettingsEmailNotifApplyBtn,width:75,handler:c},{xtype:"button",text:w.htcConfig.locData.SettingsEmailNotifResetBtn,width:75,handler:i}]})
}function r(F,E,z){var A=[],G=k.eventValues.length;
for(var D=0;
D<G;
++D){var B=k.eventValues[D];
A.push({boxLabel:B,name:B,checked:D==0})
}var H=new Ext.form.FormPanel({defaultType:"textfield",labelWidth:100,collapsible:true,title:w.htcConfig.locData.CommonFieldLabelGroup,padding:5,frame:true,items:[{fieldLabel:w.htcConfig.locData.SettingsEmailNotifEventsLabel,name:"events",width:600,xtype:"checkboxgroup",itemCls:"x-check-group-alt",items:A},{fieldLabel:w.htcConfig.locData.SettingsEmailNotifWhenLabel,name:"when",width:150,xtype:"combo",lazyInit:false,editable:false,forceSelection:true,triggerAction:"all",mode:"local",store:k.whenValues,value:k.whenValues[0]},{fieldLabel:w.htcConfig.locData.SettingsEmailNotifEmailsLabel,name:"emails",anchor:"100%"},{fieldLabel:w.htcConfig.locData.CommonFieldLabelUsers,name:"users",anchor:"100%"},{fieldLabel:w.htcConfig.locData.CommonFieldLabelGroups,name:"groups",anchor:"100%"},{xtype:"fieldset",title:w.htcConfig.locData.SettingsEmailNotifPathsLabel,name:"paths",padding:0,collapsible:true,items:[]}],tools:[{id:"close",handler:s}]});
var I=H.items.find(function(J){return J.name=="paths"
});
for(var C=0;
C<E.data.paths.length;
++C){y(E.data.paths[C],I)
}b(I);
z.insert(F,H)
}function v(A,z){var B=z.items.getCount();
r(B,A,z)
}function b(z){z.add({xtype:"panel",layout:{type:"hbox",padding:"5 0 0 0",pack:"end"},border:false,items:[{xtype:"button",text:w.htcConfig.locData.CommonButtonCaptionAdd,width:75,handler:m}]})
}function o(B,z,A){A.insert(B,{layout:{type:"hbox",padding:"5 0 0 0"},labelWidth:50,defaults:{margins:"0 2 0 2"},items:[{xtype:"textfield",name:"path",anchor:"100%",flex:1,listeners:{focus:function(C){if(isWebKit&&C&&typeof C.getValue=="function"){var D=C.getValue();
if(!D||(String(D)).trim().length==0){C.setValue("_");
C.setValue(D)
}}}}},{name:"type",xtype:"combo",width:75,editable:false,lazyInit:false,forceSelection:true,triggerAction:"all",mode:"local",store:["Plain","Regex"]},{xtype:"button",icon:HttpCommander.Lib.Utils.getIconPath(w,"delete"),handler:x}]})
}function y(z,A){var B=A.items.getCount()-1;
o(B,z,A)
}function d(B,A){var C=A.items.find(function(D){return D.name=="path"
});
C.setValue(B.path);
var z=A.items.find(function(D){return D.name=="type"
});
z.setValue(B.type)
}function j(B,A){var C=A.items.find(function(D){return D.name=="path"
});
B.path=C.getValue();
var z=A.items.find(function(D){return D.name=="type"
});
B.type=z.getValue()
}function l(E,B){var D=B.items.find(function(J){return J.name=="events"
});
a(E.data.events,D);
var z=B.items.find(function(J){return J.name=="when"
});
z.setValue(E.data.when);
var G=B.items.find(function(J){return J.name=="emails"
});
G.setValue(E.data.emails);
var C=B.items.find(function(J){return J.name=="users"
});
C.setValue(E.data.users);
var H=B.items.find(function(J){return J.name=="groups"
});
H.setValue(E.data.groups);
var I=this,F=B.items.find(function(J){return J.name=="paths"
});
for(var A=0;
A<E.data.paths.length;
++A){d(E.data.paths[A],F.items.itemAt(A))
}}function a(B,E){var z=k.eventValues.length;
for(var A=0;
A<z;
++A){var D=k.eventValues[A],C=E.items.find(function(F){return F.name==D
});
if(C){C.setValue((B&(1<<A))>0)
}}}function q(E,B){var D=B.items.find(function(J){return J.name=="events"
});
n(E,D);
var z=B.items.find(function(J){return J.name=="when"
});
E.data.when=z.getValue();
var G=B.items.find(function(J){return J.name=="emails"
});
E.data.emails=G.getValue();
var C=B.items.find(function(J){return J.name=="users"
});
E.data.users=C.getValue();
var H=B.items.find(function(J){return J.name=="groups"
});
E.data.groups=H.getValue();
var I=this,F=B.items.find(function(J){return J.name=="paths"
});
for(var A=0;
A<E.data.paths.length;
++A){j(E.data.paths[A],F.items.itemAt(A))
}}function n(A,F){var z=k.eventValues.length,C=0;
for(var B=0;
B<z;
++B){var E=k.eventValues[B],D=F.items.find(function(G){return G.name==E
});
if(D&&D.getValue()){C|=(1<<B)
}}if(C<1){C=1
}A.data.events=C
}function t(){for(var z=0;
z<k.getCount();
++z){l(k.getAt(z),p.items.itemAt(z))
}}function h(){for(var z=0;
z<k.getCount();
++z){q(k.getAt(z),p.items.itemAt(z))
}}function u(C,A,D){if(C<0||C>=k.getCount()){return
}var F=p.items.itemAt(C);
var E=F.items.find(function(G){return G.name=="paths"
});
if(A<0||A>=E.items.getCount()-1){return
}var z=E.items.itemAt(A);
if(D==null){return
}var B=z.items.find(function(G){return G.name=="path"
});
B.markInvalid(D)
}function s(C,B,A,z){var D=p.items.findIndexBy(function(F,E){return F==A
});
p.remove(A);
k.removeAt(D)
}function x(B){var z=B.ownerCt,D=z.ownerCt,E=D.ownerCt,C=p.items.findIndexBy(function(G,F){return G==E
}),A=D.items.findIndexBy(function(G,F){return G==z
});
D.remove(z);
k.getAt(C).data.paths.splice(A,1)
}function m(D){var A=D.ownerCt.ownerCt,F=A.ownerCt,E=p.items.findIndexBy(function(H,G){return H==F
}),B=k.getAt(E),C=B.data.paths.length;
B.data.paths.push({path:"",type:"Plain"});
var z=B.data.paths[C];
o(C,z,A);
d(z,A.items.itemAt(C));
A.doLayout()
}k=new Ext.data.DirectStore({directFn:HttpCommander.Admin.GetEmailNotifsSettings,fields:[{name:"events"},{name:"when"},{name:"emails",type:"string"},{name:"users",type:"string"},{name:"groups",type:"string"},{name:"paths"}],root:"data",eventValues:["Upload","Modify","Download"],whenValues:["OnSessionEnd","Immediate"],listeners:{beforeload:function(z,A){w.showSettingsMask()
},load:function(A,z,B){w.hideSettingsMask();
k.eventValues=A.reader.jsonData.eventValues;
k.whenValues=A.reader.jsonData.whenValues;
f();
t()
},exception:function(z){w.hideSettingsMask()
}}});
p=new Ext.Panel({title:w.htcConfig.locData.SettingsEmailNotifTitle+' <a href="javascript:showHelpWindow(\'Manual/webconfigsetup.html#EmailNotification\');" target="_self" id="moreInfo">'+Ext.util.Format.htmlEncode(w.htcConfig.locData.SettingsGridMoreInfo)+"</a>",border:false,padding:"10",style:{paddingTop:"20px"},id:"emailNotifs",collapsible:true,items:[],tbar:{enableOverflow:true,items:[{text:w.htcConfig.locData.AdminCommandAddGroup,icon:HttpCommander.Lib.Utils.getIconPath(w,"addemailgroup"),handler:e},{text:w.htcConfig.locData.SettingsEmailNotifApplyBtn,icon:HttpCommander.Lib.Utils.getIconPath(w,"savetofile"),handler:c},{text:w.htcConfig.locData.SettingsEmailNotifResetBtn,icon:HttpCommander.Lib.Utils.getIconPath(w,"remove"),handler:i}]},LoadData:function(){k.load()
}});
return p
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.AdminPermissions=function(c){var b,k,i,o,j,l,g,d;
function f(t){b.setTitle(Ext.util.Format.htmlEncode(t.title));
b.typePerms=t.name;
var u=String.format(c.htcConfig.locData.AdminPermissionsPrivilegeHint,t.title);
var s=b.items.items[0];
if(b.rendered){s.setText(u)
}else{s.text=u
}var r=o.getStore();
r.removeAll();
Ext.each(t.users,function(w){var v=new Ext.data.Record({name:w.identityName});
r.add(v)
});
var q=j.getStore();
q.removeAll();
Ext.each(t.groups,function(w){var v=new Ext.data.Record({name:w.identityName});
q.add(v)
})
}function p(){if(i){var q=i.getSelectionModel().getSelected();
if(q){f(q.data);
b.show()
}}}function e(){var q={};
q.name=b.typePerms;
q.users=[];
Ext.each(o.getStore().data.items,function(r){q.users.push({identityName:r.data.name})
});
q.groups=[];
Ext.each(j.getStore().data.items,function(r){q.groups.push({identityName:r.data.name})
});
return q
}function m(s){if(!s){k.isEditing=false;
k.buttons[0].setText(c.htcConfig.locData.CommonButtonCaptionAdd);
k.findById("admin-folder-path").setValue("");
k.findById("admin-folder-path-original").setValue("");
l.getStore().removeAll();
g.getStore().removeAll()
}else{k.isEditing=true;
k.findById("admin-folder-path").setValue(s.path);
k.findById("admin-folder-path-original").setValue(s.path);
k.buttons[0].setText(c.htcConfig.locData.CommandSave);
var r=l.getStore();
r.removeAll();
Ext.each(s.users,function(u){var t=new Ext.data.Record({name:u.identityName});
r.add(t)
});
var q=g.getStore();
q.removeAll();
Ext.each(s.groups,function(u){var t=new Ext.data.Record({name:u.identityName});
q.add(t)
})
}}function h(){if(gridAdminFolders){var q=gridAdminFolders.getSelectionModel().getSelected();
if(q){m(q.data);
k.show()
}}}function n(){var q={};
q.path=k.findById("admin-folder-path").getValue();
q.pathOriginal=k.findById("admin-folder-path-original").getValue();
q.users=[];
Ext.each(l.getStore().data.items,function(r){q.users.push({identityName:r.data.name})
});
q.groups=[];
Ext.each(g.getStore().data.items,function(r){q.groups.push({identityName:r.data.name})
});
return q
}function a(){var q=k.findById("admin-folder-path").getValue();
if(!q){return c.htcConfig.locData.AdminFoldersEmptyPath
}if(l.getStore().getCount()==0&&g.getStore().getCount()==0){return c.htcConfig.locData.AdminPermissionsFolderEmptyAccounts
}return null
}b=new Ext.Window({title:"",width:525,autoHeight:true,plain:true,bodyStyle:"padding:5px",layout:"table",layoutConfig:{columns:2},resizable:false,closeAction:"hide",typePerms:null,items:[{xtype:"label",colspan:2,text:""},o=new Ext.grid.GridPanel({title:c.htcConfig.locData.CommonFieldLabelUsers,store:new Ext.data.ArrayStore({fields:["name"]}),multiSelect:false,height:300,width:250,enableHdMenu:false,selModel:new Ext.grid.RowSelectionModel({singleSelect:true,listeners:{selectionchange:function(q){var r=o.getTopToolbar().findById("remove-amdin-perms-users");
r.setDisabled(q.getCount()==0)
}}}),tbar:{enableOverflow:true,items:[{text:c.htcConfig.locData.AdminCommandAddUser+"...",icon:HttpCommander.Lib.Utils.getIconPath(c,"add"),handler:function(){c.promptUserName(function(r,t){if(r=="ok"){var s=false;
Ext.each(o.getStore().data.items,function(u){if(u.data.name.toLowerCase()==t.toLowerCase()){s=true
}});
if(s){Ext.Msg.show({title:c.htcConfig.locData.CommonErrorCaption,msg:c.htcConfig.locData.AdminFoldersUserAlreadyExists,icon:Ext.MessageBox.WARNING,buttons:Ext.Msg.OK})
}else{var q=new Ext.data.Record({name:t});
o.getStore().add(q)
}}})
}},{text:c.htcConfig.locData.CommandDelete,id:"remove-amdin-perms-users",icon:HttpCommander.Lib.Utils.getIconPath(c,"remove"),disabled:true,handler:function(){var q=o.getSelectionModel().getSelected();
if(q){o.getStore().remove(q)
}}}]},columns:[{header:c.htcConfig.locData.CommonFieldLabelName,width:220,dataIndex:"name",renderer:function(s,t,q){return"<img src='"+HttpCommander.Lib.Utils.getIconPath(c,"user")+"' class='filetypeimage'>"+Ext.util.Format.htmlEncode(s)
}}]}),j=new Ext.grid.GridPanel({title:c.htcConfig.locData.CommonFieldLabelGroups,store:new Ext.data.ArrayStore({fields:["name"]}),multiSelect:false,height:300,width:250,enableHdMenu:false,selModel:new Ext.grid.RowSelectionModel({singleSelect:true,listeners:{selectionchange:function(q){var r=j.getTopToolbar().findById("remove-admin-perms-groups");
r.setDisabled(q.getCount()==0)
}}}),tbar:{enableOverflow:true,items:[{text:c.htcConfig.locData.AdminCommandAddGroup+"...",icon:HttpCommander.Lib.Utils.getIconPath(c,"add"),handler:function(){c.promptGroupName(function(r,s){if(r=="ok"){var t=false;
Ext.each(j.getStore().data.items,function(u){if(u.data.name.toLowerCase()==s.toLowerCase()){t=true
}});
if(t){Ext.Msg.show({title:c.htcConfig.locData.CommonErrorCaption,msg:c.htcConfig.locData.AdminFoldersGroupAlreadyExists,icon:Ext.MessageBox.WARNING,buttons:Ext.Msg.OK})
}else{var q=new Ext.data.Record({name:s});
j.getStore().add(q)
}}})
}},{text:c.htcConfig.locData.CommandDelete,id:"remove-admin-perms-groups",icon:HttpCommander.Lib.Utils.getIconPath(c,"remove"),disabled:true,handler:function(){var q=j.getSelectionModel().getSelected();
if(q){j.getStore().remove(q)
}}}]},columns:[{header:c.htcConfig.locData.CommonFieldLabelName,width:220,dataIndex:"name",renderer:function(s,t,q){return"<img src='"+HttpCommander.Lib.Utils.getIconPath(c,"group")+"' class='filetypeimage'>"+Ext.util.Format.htmlEncode(s)
}}]})],buttonsAlign:"right",buttons:[{text:c.htcConfig.locData.CommandSave,id:"add-edit-admin-priv",handler:function(){var q=e();
b.hide();
i.loadMask.msg=c.htcConfig.locData.ProgressCreating+"...";
i.loadMask.show();
HttpCommander.Admin.UpdateAdminPermissions(q,function(s,r){i.loadMask.msg=c.htcConfig.locData.ProgressLoading+"...";
HttpCommander.Lib.Utils.checkDirectHandlerResult(s,r,Ext.Msg,c.htcConfig);
i.getStore().reload()
})
}},{text:c.htcConfig.locData.CommonButtonCaptionCancel,handler:function(){b.hide()
}}],listeners:{afterrender:function(q){q.syncSize()
}}});
k=new Ext.Window({title:c.htcConfig.locData.AdminPermissionsFolderTitle,autoHeight:true,plain:true,width:525,isEditing:false,bodyStyle:"padding:5px",layout:"table",layoutConfig:{columns:2},resizable:false,closeAction:"hide",items:[new Ext.form.FormPanel({colspan:2,plain:true,unstyled:true,autoHeight:true,items:[{id:"admin-folder-path-original",xtype:"hidden"},c.getShowListForAllowedFolders()?{xtype:"combo",fieldLabel:c.htcConfig.locData.AdminPermissionsFolderFieldTitle,anchor:"100%",id:"admin-folder-path",name:"admin-folder-path",displayField:"path",mode:"remote",resizable:true,tpl:'<tpl for="."><div ext:qtip="{encodedPath}" class="x-combo-list-item" style="margin-left:{level}px;">'+(c.htcConfig.showRelativePathInAFL?'<img alt="" width="16" height="16" style="vertical-align:top;" src="'+HttpCommander.Lib.Utils.getIconPath(c,"folder")+'" />&nbsp;{name:htmlEncode}':"{path:htmlEncode}")+"</div></tpl>",triggerAction:"all",loadingText:c.htcConfig.locData.ProgressLoading+"...",forceSelection:true,editable:false,lazyInit:false,store:new Ext.data.DirectStore({directFn:HttpCommander.Admin.GetAllowedFolders,autoLoad:false,fields:["name","path","encodedPath",{name:"level",type:"int"}]}),listeners:{select:function(s,q,r){Ext.QuickTips.getQuickTip().register({target:this.el,text:q.data.encodedPath});
s.setValue(q.data.path)
}}}:{xtype:"container",layout:"hbox",anchor:"100%",fieldLabel:c.htcConfig.locData.AdminPermissionsFolderFieldTitle,items:[{id:"admin-folder-path",name:"admin-folder-path",xtype:"textfield",hideLabel:true,flex:1,enableKeyEvents:true,listeners:{change:function(s,r,q){Ext.QuickTips.getQuickTip().unregister(s.el);
if(r&&r!=""){Ext.QuickTips.getQuickTip().register({target:s.el,text:Ext.util.Format.htmlEncode(r)})
}}}},{id:"create-admin-folder-button",xtype:"button",icon:HttpCommander.Lib.Utils.getIconPath(c,"createfolder"),tooltip:c.htcConfig.locData.AdminFoldersFolderCreate,handler:function(){var q=Ext.getCmp("admin-folder-path");
var r="";
if(q&&!(new RegExp("^\\s*$","i")).test(r=q.getValue())){gridAdminFolders.loadMask.msg=c.htcConfig.locData.AdminFoldersFolderCreateProcess+"...";
gridAdminFolders.loadMask.show();
HttpCommander.Admin.CreateFolder({path:r},function(t,s){gridAdminFolders.loadMask.hide();
gridAdminFolders.loadMask.msg=c.htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(t,s,Ext.Msg,c.htcConfig)){Ext.Msg.show({title:c.htcConfig.locData.AdminFoldersFolderCreate,msg:String.format(c.htcConfig.locData.AdminFoldersFolderCreateSuccessfully,Ext.util.Format.htmlEncode(t.createdPath)),closable:true,modal:true,buttons:Ext.Msg.OK,icon:Ext.Msg.INFO})
}})
}}}]},{id:"admin-folder-hint",xtype:"label",anchor:"100%",text:c.htcConfig.locData.AdminPermissionsFolderHint}]}),l=new Ext.grid.GridPanel({title:c.htcConfig.locData.CommonFieldLabelUsers,store:new Ext.data.ArrayStore({fields:["name"]}),multiSelect:false,height:300,width:250,enableHdMenu:false,selModel:new Ext.grid.RowSelectionModel({singleSelect:true,listeners:{selectionchange:function(q){var r=l.getTopToolbar().findById("remove-amdin-folders-users");
r.setDisabled(q.getCount()==0)
}}}),tbar:{enableOverflow:true,items:[{text:c.htcConfig.locData.AdminCommandAddUser+"...",icon:HttpCommander.Lib.Utils.getIconPath(c,"add"),handler:function(){c.promptUserName(function(r,t){if(r=="ok"){var s=false;
Ext.each(l.getStore().data.items,function(u){if(u.data.name.toLowerCase()==t.toLowerCase()){s=true
}});
if(s){Ext.Msg.show({title:c.htcConfig.locData.CommonErrorCaption,msg:c.htcConfig.locData.AdminFoldersUserAlreadyExists,icon:Ext.MessageBox.WARNING,buttons:Ext.Msg.OK})
}else{var q=new Ext.data.Record({name:t});
l.getStore().add(q)
}}})
}},{text:c.htcConfig.locData.CommandDelete,id:"remove-amdin-folders-users",icon:HttpCommander.Lib.Utils.getIconPath(c,"remove"),disabled:true,handler:function(){var q=l.getSelectionModel().getSelected();
if(q){l.getStore().remove(q)
}}}]},columns:[{header:c.htcConfig.locData.CommonFieldLabelName,width:220,dataIndex:"name",renderer:function(s,t,q){return"<img src='"+HttpCommander.Lib.Utils.getIconPath(c,"user")+"' class='filetypeimage'>"+Ext.util.Format.htmlEncode(s)
}}]}),g=new Ext.grid.GridPanel({title:c.htcConfig.locData.CommonFieldLabelGroups,store:new Ext.data.ArrayStore({fields:["name"]}),multiSelect:false,height:300,width:250,enableHdMenu:false,selModel:new Ext.grid.RowSelectionModel({singleSelect:true,listeners:{selectionchange:function(q){var r=g.getTopToolbar().findById("remove-admin-folders-groups");
r.setDisabled(q.getCount()==0)
}}}),tbar:{enableOverflow:true,items:[{text:c.htcConfig.locData.AdminCommandAddGroup+"...",icon:HttpCommander.Lib.Utils.getIconPath(c,"add"),handler:function(){c.promptGroupName(function(r,s){if(r=="ok"){var t=false;
Ext.each(g.getStore().data.items,function(u){if(u.data.name.toLowerCase()==s.toLowerCase()){t=true
}});
if(t){Ext.Msg.show({title:c.htcConfig.locData.CommonErrorCaption,msg:c.htcConfig.locData.AdminFoldersGroupAlreadyExists,icon:Ext.MessageBox.WARNING,buttons:Ext.Msg.OK})
}else{var q=new Ext.data.Record({name:s});
g.getStore().add(q)
}}})
}},{text:c.htcConfig.locData.CommandDelete,id:"remove-admin-folders-groups",icon:HttpCommander.Lib.Utils.getIconPath(c,"remove"),disabled:true,handler:function(){var q=g.getSelectionModel().getSelected();
if(q){g.getStore().remove(q)
}}}]},columns:[{header:c.htcConfig.locData.CommonFieldLabelName,width:220,dataIndex:"name",renderer:function(s,t,q){return"<img src='"+HttpCommander.Lib.Utils.getIconPath(c,"group")+"' class='filetypeimage'>"+Ext.util.Format.htmlEncode(s)
}}]})],buttonsAlign:"right",buttons:[{text:c.htcConfig.locData.CommandSave,id:"add-edit-admin-folder",handler:function(){var q=a();
if(q){Ext.Msg.show({title:c.htcConfig.locData.CommonErrorCaption,msg:q,icon:Ext.MessageBox.WARNING,buttons:Ext.Msg.OK})
}else{var r=n();
k.hide();
if(!k.isEditing){gridAdminFolders.loadMask.msg=c.htcConfig.locData.ProgressCreating+"...";
gridAdminFolders.loadMask.show();
HttpCommander.Admin.AddAdminFolder(r,function(t,s){gridFolders.loadMask.msg=c.htcConfig.locData.ProgressLoading+"...";
HttpCommander.Lib.Utils.checkDirectHandlerResult(t,s,Ext.Msg,c.htcConfig);
gridAdminFolders.getStore().reload()
})
}else{gridAdminFolders.loadMask.msg=c.htcConfig.locData.ProgressUpdating+"...";
gridAdminFolders.loadMask.show();
HttpCommander.Admin.UpdateAdminFolder(r,function(t,s){gridAdminFolders.loadMask.msg=c.htcConfig.locData.ProgressLoading+"...";
HttpCommander.Lib.Utils.checkDirectHandlerResult(t,s,Ext.Msg,c.htcConfig);
gridAdminFolders.getStore().reload()
})
}}}},{text:c.htcConfig.locData.CommonButtonCaptionCancel,handler:function(){k.hide()
}}],listeners:{afterrender:function(q){q.syncSize()
}}});
d={title:c.htcConfig.locData.AdminPermissionsTab,id:"admin-permissions-tab",layout:"fit",autoScroll:true,xtype:"panel",items:[i=new Ext.grid.GridPanel({title:c.htcConfig.locData.AdminPermissionsTab,store:new Ext.data.DirectStore({directFn:HttpCommander.Admin.GetAdminPermissions,fields:[{name:"name",type:"string"},{name:"title",type:"string"},{name:"users"},{name:"groups"}]}),keys:{key:[Ext.EventObject.ENTER],fn:function(q){switch(q){case Ext.EventObject.ENTER:p();
break
}},scope:this},multiSelect:false,border:false,loadMask:true,enableHdMenu:false,autoExpandColumn:"title",autoHeight:true,selModel:new Ext.grid.RowSelectionModel({singleSelect:true,listeners:{selectionchange:function(q){var r=i.getTopToolbar().findById("edit-admin-perms");
r.setDisabled(q.getCount()==0)
}}}),tbar:{enableOverflow:true,items:[{text:c.htcConfig.locData.CommandRefresh,icon:HttpCommander.Lib.Utils.getIconPath(c,"refresh"),handler:function(){i.getStore().reload()
}},{text:c.htcConfig.locData.AdminPermissionsEditButton+"...",id:"edit-admin-perms",icon:HttpCommander.Lib.Utils.getIconPath(c,"editpermissions"),disabled:true,handler:p},{text:c.htcConfig.locData.AdminCommandHelp,icon:HttpCommander.Lib.Utils.getIconPath(c,"help"),handler:function(){c.navigateHelpAdminPanelWithFragment("adminpermissions")
}}]},columns:[{id:"title",header:c.htcConfig.locData.AdminPermissionsPrivilege,width:100,dataIndex:"title",renderer:c.htmlEncodeRenderer},{id:"users",width:150,header:c.htcConfig.locData.CommonFieldLabelUsers,dataIndex:"users",renderer:c.identitiesRenderer},{id:"groups",width:150,header:c.htcConfig.locData.CommonFieldLabelGroups,dataIndex:"groups",renderer:c.identitiesRenderer}],listeners:{rowdblclick:function(r,q,s){p()
}}}),gridAdminFolders=new Ext.grid.GridPanel({title:c.htcConfig.locData.AdminPermissionsFoldersTitle,store:new Ext.data.DirectStore({directFn:HttpCommander.Admin.GetAdminFolders,fields:[{name:"path",type:"string"},{name:"users"},{name:"groups"}]}),keys:{key:[Ext.EventObject.ENTER],fn:function(q){switch(q){case Ext.EventObject.ENTER:h();
break
}},scope:this},viewConfig:{forceFit:true,autoFill:true},multiSelect:false,border:false,loadMask:true,enableHdMenu:false,autoExpandColumn:"path",width:"100%",autoHeight:true,selModel:new Ext.grid.RowSelectionModel({singleSelect:true,listeners:{selectionchange:function(q){var r=gridAdminFolders.getTopToolbar().findById("remove-admin-perms-folder");
if(r){r.setDisabled(q.getCount()==0)
}var s=gridAdminFolders.getTopToolbar().findById("edit-admin-perms-folder");
if(s){s.setDisabled(q.getCount()==0)
}}}}),tbar:{enableOverflow:true,items:[{text:c.htcConfig.locData.CommandRefresh,icon:HttpCommander.Lib.Utils.getIconPath(c,"refresh"),handler:function(){gridAdminFolders.getStore().reload()
}},{text:c.htcConfig.locData.AdminFoldersAddFolder+"...",icon:HttpCommander.Lib.Utils.getIconPath(c,"add"),handler:function(){m(null);
k.show()
}},{text:c.htcConfig.locData.AdminFoldersEditFolder+"...",id:"edit-admin-perms-folder",icon:HttpCommander.Lib.Utils.getIconPath(c,"editfolder"),disabled:true,handler:h},{id:"remove-admin-perms-folder",text:c.htcConfig.locData.AdminFoldersRemoveFolder,icon:HttpCommander.Lib.Utils.getIconPath(c,"remove"),disabled:true,handler:function(){var r=gridAdminFolders.getSelectionModel().getSelected();
var s=r.data.path;
var q={path:s};
Ext.Msg.show({title:c.htcConfig.locData.CommonConfirmCaption,msg:String.format(c.htcConfig.locData.AdminFoldersDeleteFolderPrompt,Ext.util.Format.htmlEncode(s)),buttons:Ext.Msg.YESNO,icon:Ext.MessageBox.QUESTION,fn:function(t){if(t=="yes"){gridAdminFolders.loadMask.msg=c.htcConfig.locData.ProgressDeleting+"...";
gridAdminFolders.loadMask.show();
HttpCommander.Admin.DeleteAdminFolder(q,function(v,u){gridFolders.loadMask.msg=c.htcConfig.locData.ProgressLoading+"...";
HttpCommander.Lib.Utils.checkDirectHandlerResult(v,u,Ext.Msg,c.htcConfig);
gridAdminFolders.getStore().reload()
})
}}})
}},{text:c.htcConfig.locData.AdminCommandHelp,icon:HttpCommander.Lib.Utils.getIconPath(c,"help"),handler:function(){c.navigateHelpAdminPanelWithFragment("adminpermissions")
}}]},columns:[{id:"path",header:c.htcConfig.locData.AdminPermissionsFolderPathTitle,width:100,dataIndex:"path",renderer:c.htmlEncodeRenderer},{id:"users",width:150,header:c.htcConfig.locData.CommonFieldLabelUsers,dataIndex:"users",renderer:c.identitiesRenderer},{id:"groups",width:150,header:c.htcConfig.locData.CommonFieldLabelGroups,dataIndex:"groups",renderer:c.identitiesRenderer}],listeners:{rowdblclick:function(r,q,s){h()
}}})],getGridAdminPermissions:function(){return i
},getGridAdminFolders:function(){return gridAdminFolders
}};
return d
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.AdminMisc=function(c){var i=null,e=null,j=null,b=c.htcConfig.gpolFrom,k=c.htcConfig.gpolToPerms,h=5*60*1000,f=null,a=function(){if(f==null){f=new Ext.LoadMask(Ext.getBody(),{msg:c.htcConfig.locData.ProgressLoading+"...",removeMask:false});
f.showCnt=0
}},d=function(){a();
f.showCnt+=1;
if(f.showCnt==1){f.show()
}},g=function(){a();
if(f.showCnt>0){f.showCnt-=1;
if(f.showCnt==0){f.hide()
}}};
return{title:c.htcConfig.locData.AdminMiscTab,id:"misc-tab",padding:5,autoScroll:true,layout:"table",cls:"admin-misc-tab",layoutConfig:{columns:2},items:[i=new Ext.FormPanel({labelWidth:110,title:c.htcConfig.locData.AdminMiscLoadADAccountsTitle,frame:false,padding:5,width:400,defaults:{xtype:"textfield",anchor:"100%"},items:[{xtype:"label",html:String.format(c.htcConfig.locData.AdminMiscLoadADAccountsInfo,"<a href=\"javascript:showHelpWindow('Manual/webconfigsetup.html#ADAccountsFilePath')\">","</a>")},{id:"load-ada-ldap",fieldLabel:c.htcConfig.locData.AdminMiscLoadADAccountsLdap,value:c.htcConfig.ldapContainer},{id:"load-ada-user",fieldLabel:c.htcConfig.locData.CommonFieldLabelUserName},{id:"load-ada-pwd",inputType:"password",fieldLabel:c.htcConfig.locData.CommonFieldLabelPassword},{id:"load-ada-file",fieldLabel:c.htcConfig.locData.AdminMiscLoadADAccountsToFile,allowBlank:false,name:"load-ada-file",value:c.htcConfig.adAccountsFile}],buttons:[{text:c.htcConfig.locData.AdminMiscLoadADAccountsResetButton,handler:function(){i.getForm().reset();
i.findById("load-ada-file").setValue(c.htcConfig.adAccountsFile)
}},{text:c.htcConfig.locData.AdminMiscLoadADAccountsLoadButton,handler:function(){if(i.getForm().isValid()){var l={ldap:i.findById("load-ada-ldap").getValue(),user:i.findById("load-ada-user").getValue(),pwd:i.findById("load-ada-pwd").getValue(),file:i.findById("load-ada-file").getValue()};
var m=Ext.Ajax.timeout;
Ext.Ajax.timeout=c.getAjaxRequestTimeout();
d();
HttpCommander.Admin.LoadADAccounts(l,function(o,n){g();
Ext.Ajax.timeout=m;
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(o,n,Ext.Msg,c.htcConfig)){Ext.Msg.alert("",c.htcConfig.locData.AdminMiscLoadADAccountsSuccessMessage)
}})
}}}]}),e=new Ext.FormPanel({labelWidth:110,title:c.htcConfig.locData.AdminMiscManageQuotasTitle,frame:false,padding:5,width:400,defaults:{xtype:"textfield",anchor:"100%"},items:[{xtype:"label",html:c.htcConfig.locData.AdminMiscManageQuotasInfo+" <a href='javascript:navigateHelpAdminPanelWithFragment(\"quota\")'>"+c.htcConfig.locData.AdminFoldersFolderQuotaMoreInfoLink+"</a>"},{id:"manage-quotas-folder-path",fieldLabel:c.htcConfig.locData.AdminMiscManageQuotasFolderPath},{id:"manage-quotas-quota-limit",fieldLabel:c.htcConfig.locData.AdminMiscManageQuotasQuota}],buttons:[{text:c.htcConfig.locData.AdminMiscManageQuotasGetQuota,handler:function(){var n=e.findById("manage-quotas-folder-path");
if(n.getValue()==""){return
}var m={path:n.getValue()};
d();
var l=Ext.Ajax.timeout;
Ext.Ajax.timeout=h;
HttpCommander.Admin.GetQuotaLimit(m,function(q,p){Ext.Ajax.timeout=l;
g();
var o=e.findById("manage-quotas-quota-limit");
o.setValue("");
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(q,p,Ext.Msg,c.htcConfig)){o.setValue(q.quota)
}})
}},{text:c.htcConfig.locData.AdminMiscManageQuotasSetQuota,handler:function(){var p=e.findById("manage-quotas-folder-path");
if(p.getValue()==""){return
}var l=e.findById("manage-quotas-quota-limit");
var n=l.getValue();
n=parseInt(n);
l.setValue(n);
if(!(n>0)){l.focus();
Ext.Msg.alert(c.htcConfig.locData.CommonErrorCaption,c.htcConfig.locData.FsrmInvalidQuotaValueMsg);
return
}var o={path:p.getValue(),quota:n};
d();
var m=Ext.Ajax.timeout;
Ext.Ajax.timeout=h;
HttpCommander.Admin.SetQuotaLimit(o,function(r,q){Ext.Ajax.timeout=m;
g();
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(r,q,Ext.Msg,c.htcConfig)){Ext.Msg.alert(c.htcConfig.locData.CommonInfoCaption,c.htcConfig.locData.FsrmQuotaSetMsg)
}})
}}]}),j=new Ext.FormPanel({labelWidth:110,title:c.htcConfig.locData.AdminMiscFoldersFromGPOLTitle,frame:false,padding:5,width:400,defaults:{xtype:"textfield",anchor:"100%"},items:[{xtype:"label",html:c.htcConfig.locData.AdminMiscFoldersFromGPOLInfo+" <a href='javascript:navigateHelpAdminPanelWithFragment(\"gpolfolders\")'>"+c.htcConfig.locData.AdminFoldersFolderQuotaMoreInfoLink+"</a>"},{xtype:"radiogroup",id:"fodlers-gpol-dc-or-file",name:"fodlers-gpol-dc-or-file",items:[{boxLabel:c.htcConfig.locData.AdminMiscFoldersFromGPOLFromDC,name:"rb-auto1",inputValue:1,checked:!b,fromDC:true,listeners:{check:function(n,l){var m=Ext.getCmp("folders-gpol-computer-name");
if(m){m.label.update(c.htcConfig.locData[l?"AdminMiscFoldersFromGPOLComputerName":"AdminMiscFoldersFromGPOLFilePath"]+":");
m.setValue("")
}}}},{checked:b,fromDC:false,boxLabel:c.htcConfig.locData.AdminMiscFoldersFromGPOLFromFile,name:"rb-auto1",inputValue:0}]},{id:"folders-gpol-computer-name",fieldLabel:c.htcConfig.locData[b?"AdminMiscFoldersFromGPOLFilePath":"AdminMiscFoldersFromGPOLComputerName"],value:b?b:""},{xtype:"label",text:c.htcConfig.locData.AdminMiscFoldersTargetLabel},{xtype:"radiogroup",id:"fodlers-gpol-target",name:"fodlers-gpol-target",items:[{boxLabel:c.htcConfig.locData.AdminMiscFoldersTargetFilter,name:"rb-auto2",inputValue:1,checked:!k,toPerms:false},{checked:k,toPerms:true,boxLabel:c.htcConfig.locData.AdminMiscFoldersTargetPermission,name:"rb-auto2",inputValue:0}]}],buttons:[{text:c.htcConfig.locData.AdminMiscFoldersFromGPOLResetButton,handler:function(){j.getForm().reset()
}},{text:c.htcConfig.locData.AdminMiscLoadADAccountsLoadButton,handler:function(){var o=j.getForm();
var m=o.findField("fodlers-gpol-dc-or-file").getValue().fromDC;
var p=o.findField("fodlers-gpol-target").getValue().toPerms;
var l={field:j.findById("folders-gpol-computer-name").getValue(),fromDC:m,toPerms:p};
var n=Ext.Ajax.timeout;
Ext.Ajax.timeout=c.getAjaxRequestTimeout();
d();
HttpCommander.Admin.LoadFolderGPOL(l,function(r,q){g();
Ext.Ajax.timeout=n;
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(r,q,Ext.Msg,c.htcConfig)){Ext.Msg.alert("",String.format(c.htcConfig.locData.AdminMiscFoldersFromGPOLSuccessMessage,r.added,r.updated))
}})
}}]})]}
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.AdminUpdate=function(a){var o=new Ext.ux.Spotlight({easing:"easeOut",duration:0.3});
var n={text:a.htcConfig.locData.CommonButtonCaptionCancel,handler:function(s){j.update(String.format(a.htcConfig.locData.AdminUpdateBackupContent,"<strong>"+a.htcConfig.locData.AdminUpdateBackupButton+"</strong>"));
if(!!h&&h.rendered){if(!Ext.isEmpty(h.link)){var u=h.link+"&delete=true";
Ext.Ajax.request({url:u})
}h.link="";
h.update({link:"",name:""})
}var t;
p.auto=false;
p.buttons[2].setText(a.htcConfig.locData.AdminUpdateUploadButton);
var i;
if(!!(t=(i=p.items.items[0]).getForm())){t.reset();
i=i.items;
i.items[0].setVisible(false);
i.items[1].setVisible(false);
i.items[2].setText(a.htcConfig.locData.AdminUpdateFinishContent+"<br />",false);
i.items[3].backupName=null;
i.items[5].setVisible(false)
}q(false)
}};
var b=Ext.extend(Ext.Panel,{frame:true,width:310,height:300,bodyStyle:"padding:5px 10px;",buttonAlign:"left",toggle:function(i){this.setDisabled(!i)
}});
var k=function(){var i=Ext.getBody().child("iframe.x-hidden:last");
if(i){if(HttpCommander.Lib.Utils.browserIs.ie){window.frames[i.id].window.document.execCommand("Stop")
}else{window.frames[i.id].window.stop()
}}Ext.Msg.hide()
};
var l=Ext.Ajax.timeout,e=new Ext.LoadMask(Ext.getBody(),{msg:a.htcConfig.locData.ProgressLoading+"...",removeMask:true}),d=function(){Ext.Msg.hide();
e.hide();
Ext.Ajax.timeout=a.getAjaxRequestTimeout();
e.show()
},f=function(){Ext.Ajax.timeout=l;
Ext.Msg.hide();
e.hide()
};
var r,j,h,p;
var m=[j=new b({id:"admin-update-backup",title:String.format(a.htcConfig.locData.AdminUpdateStepTitle,a.htcConfig.locData.AdminUpdateNumberSymbol,1,a.htcConfig.locData.AdminUpdateBackupButton),html:String.format(a.htcConfig.locData.AdminUpdateBackupContent,"<strong>"+a.htcConfig.locData.AdminUpdateBackupButton+"</strong>"),buttons:[n,"->",{text:a.htcConfig.locData.AdminUpdateBackupButton,handler:function(i){d();
HttpCommander.Admin.BackupRoot({},function(t,s){f();
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(t,s,Ext.Msg,a.htcConfig)){var u=a.htcConfig.relativePath+"Handlers/Download.ashx?backup="+encodeURIComponent(t.filename);
h.link=u;
h.update({link:u,name:t.filename});
if(p.auto){if(!Ext.isFunction(window.showAutoStep23)){window.showAutoStep23=function(v){p.auto=true;
p.buttons[2].setText(a.htcConfig.locData.AdminUpdateUploadAndInstallButton);
var w=p.items.items[0].items;
w.items[0].setVisible(true);
w.items[1].setVisible(true);
w.items[2].setText(a.htcConfig.locData.AdminUpdateFinishContent+a.htcConfig.locData.AdminUpdateRestoreFromBackupEmpty+"<br />",false);
w.items[3].backupName=t.filename;
q("admin-update-finish")
}
}j.update(String.format(a.htcConfig.locData.AdminUpdateBackupContent,"<strong>"+a.htcConfig.locData.AdminUpdateBackupButton+"</strong>")+"<br /><br /><div>"+Ext.util.Format.htmlEncode(a.htcConfig.locData.AdminUpdateDownloadBackupLinkHint)+'</div><a href="'+Ext.util.Format.htmlEncode(u)+'" target="_blank" onclick="showAutoStep23(this);return true;">'+Ext.util.Format.htmlEncode(t.filename)+"</a><br /><br />")
}else{j.update(String.format(a.htcConfig.locData.AdminUpdateBackupContent,"<strong>"+a.htcConfig.locData.AdminUpdateBackupButton+"</strong>"));
q("admin-update-download")
}}})
}}]}),h=new b({id:"admin-update-download",title:String.format(a.htcConfig.locData.AdminUpdateStepTitle,a.htcConfig.locData.AdminUpdateNumberSymbol,2,a.htcConfig.locData.AdminUpdateDownloadNewButton),tpl:new Ext.XTemplate('<tpl if="!Ext.isEmpty(link)">',"<div>"+Ext.util.Format.htmlEncode(a.htcConfig.locData.AdminUpdateDownloadBackupLinkHint)+"</div>",'<a href="{link:htmlEncode}" target="_blank">{name:htmlEncode}</a><br /><br />',"</tpl>","<p>",String.format(a.htcConfig.locData.AdminUpdateDownloadNewContent,'<a href="//www.element-it.com/OnlineHelpHTTPCommander/'+((a.htcConfig.version||"st").toLowerCase()=="ad"?"Windows":"Forms")+'/win2008.html#installationHTTPCOM" target="_blank">',"</a>",'<a href="//www.element-it.com/OnlineHelpHTTPCommander/'+((a.htcConfig.version||"st").toLowerCase()=="ad"?"Windows":"Forms")+'/faq.html#updatewithexistingsettings" target="_blank">',Ext.util.Format.htmlEncode(a.htcConfig.locData.AdminUpdateTab),Ext.util.Format.htmlEncode(a.htcConfig.locData.AdminUpdateFinishButton)),"</p>"),data:{link:"",name:""},buttons:[n,"->",{text:a.htcConfig.locData.AdminUpdateDownloadNewButton,xtype:"box",autoEl:{tag:"a",href:"//www.element-it.com/download.aspx?type="+encodeURIComponent(a.htcConfig.version||"st"),target:"_blank",html:a.htcConfig.locData.AdminUpdateDownloadNewButton}}]}),p=new b({id:"admin-update-finish",title:String.format(a.htcConfig.locData.AdminUpdateStepTitle,a.htcConfig.locData.AdminUpdateNumberSymbol,3,a.htcConfig.locData.AdminUpdateFinishButton),layout:"fit",items:new Ext.FormPanel({layout:"fit",fileUpload:true,plain:true,frame:false,padding:0,items:[{xtype:"label",html:a.htcConfig.locData.AdminUpdateInstallZipPathHint+"<br />",hidden:true},{xtype:"textfield",hideLabel:true,width:277,hidden:true,id:"upgrade-install-zip-field",name:"upgrade-install-zip-field",emptyText:a.htcConfig.locData.AdminUpdateInstallZipPathEmpty},{xtype:"label",html:a.htcConfig.locData.AdminUpdateFinishContent+"<br />"},{xtype:"fileuploadfield",hideLabel:true,width:"100%",id:"backup-upload-field",name:"backup-upload-field",accept:".zip,application/zip,application/x-zip,application/x-zip-compressed",emptyText:a.htcConfig.locData.AdminUpdateUploadEmptyText+"...",buttonText:a.htcConfig.locData.UploadBrowseLabel},{xtype:"checkbox",style:{marginTop:"10px"},boxLabel:a.htcConfig.locData.AdminUpdateRestoreWebConfigCheckBox,checked:true},{xtype:"label",hidden:true,html:"<br />"+a.htcConfig.locData.AdminUpdateFinishMessage+'<br /><a href="//www.element-it.com/OnlineHelpHTTPCommander/'+((a.htcConfig.version||"st").toLowerCase()=="ad"?"Windows":"Forms")+'/faq.html#updatewithexistingsettings" target="_blank">FAQ: How can I update my existing installation</a>'}]}),buttons:[n,"->",{text:a.htcConfig.locData.AdminUpdateUploadButton,handler:function(u){var y=p.items.items[0].items;
var C=y.items[5];
var B=y.items[4].getValue();
C.setVisible(false);
var s=p.items.items[0].getForm();
if(!s.isValid()){return
}var t=s.items.items[0];
var x=t.isVisible()?t.getValue():null;
var A=s.items.items[1];
var i=A.backupName;
if(Ext.isEmpty(A.getValue())&&Ext.isEmpty(i)){Ext.Msg.show({title:a.htcConfig.locData.CommonErrorCaption,msg:Ext.util.Format.htmlEncode(a.htcConfig.locData.AdminUpdateUploadEmptyText),modal:true,buttons:Ext.Msg.CANCEL,icon:Ext.Msg.ERROR});
return
}var z=a.htcConfig.relativePath+"Handlers/Upload.ashx?restore="+(p.auto?"auto":"manual")+("&webconfig="+B)+(!Ext.isEmpty(i)?("&backup="+encodeURIComponent(i)):"")+(!Ext.isEmpty(x)?("&install="+encodeURIComponent(x)):"");
var w=Ext.Msg.show({title:a.htcConfig.locData.CommonProgressPleaseWait,msg:"<img src='"+HttpCommander.Lib.Utils.getIconPath(a,"ajax-loader.gif")+"' class='filetypeimage'>&nbsp;"+a.htcConfig.locData.AdminUpdateProgress+"...",modal:true,closable:false,width:220,buttons:{cancel:a.htcConfig.locData.StopUploadingButtonText},fn:k,scope:s});
var v=function(F,G){var H=null,E=false;
Ext.Msg.hide();
w.hide();
if(!!G&&!!G.result){H=G.result.message;
E=(G.result.needReload===true)
}if(!!G&&!!G.failureType){switch(G.failureType){case Ext.form.Action.CLIENT_INVALID:H=a.htcConfig.locData.UploadInvalidFormFields;
break;
case Ext.form.Action.CONNECT_FAILURE:H=a.htcConfig.locData.UploadAjaxFailed;
break;
case Ext.form.Action.SERVER_INVALID:case Ext.form.Action.LOAD_FAILURE:if(!!G.result&&!!G.result.responseNotParsed&&!!G.response){if(G.response.url&&(String(G.response.url)).toLowerCase().indexOf(a.getAppRootUrl().toLowerCase()+"default.aspx")==0){window.location.href=G.response.url.split("?")[0];
return
}else{if(!!G.response&&!!G.response.responseText){var D=G.response.responseText;
var I="<a href='#' onclick='showPageError();return false;'>";
H=String.format(a.htcConfig.locData.SimpleUploadErrorInfo,I);
if(!Ext.isFunction(window.showPageError)){window.showPageError=function(){if(D){var J=window.open("","_blank");
J.document.write(D)
}}
}}}}break
}}if(Ext.isEmpty(H)){if(E){Ext.Msg.show({title:a.htcConfig.locData.CommonWarningCaption,msg:Ext.util.Format.htmlEncode(String.format(a.htcConfig.locData.AdminUpdateNeedRefreshPageForContinue,a.htcConfig.locData.CommonButtonCaptionOK)),modal:true,buttons:Ext.Msg.OK,icon:Ext.Msg.WARNING,fn:function(J){window.location.reload(true)
}});
return
}F.reset();
C.setVisible(true);
Ext.Msg.show({title:a.htcConfig.locData.AdminUpdateFinishButton,msg:a.htcConfig.locData.AdminUpdateFinishMessage+'<br /><br /><a href="//www.element-it.com/OnlineHelpHTTPCommander/'+((a.htcConfig.version||"st").toLowerCase()=="ad"?"Windows":"Forms")+'/faq.html#updatewithexistingsettings" target="_blank">FAQ: How can I update my existing installation</a><br /><br />'+a.htcConfig.locData.AdminUpdateFinishRefreshPage,modal:true,buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function(){window.location.reload(true)
}})
}else{Ext.Msg.show({title:a.htcConfig.locData.CommonErrorCaption,msg:H+(E?("<br /><br />"+Ext.util.Format.htmlEncode(String.format(a.htcConfig.locData.AdminUpdateNeedRefreshPageForContinue,a.htcConfig.locData.CommonButtonCaptionOK))):""),modal:true,buttons:E?Ext.Msg.OK:Ext.Msg.CANCEL,icon:Ext.Msg.ERROR,fn:function(){if(E){window.location.reload(true)
}}})
}};
s.submit({url:z,success:v,failure:v})
}}]})];
var q=function(i){if(typeof i=="string"){if(!!o.el&&!!o.all){o.destroy()
}o.show(i)
}else{if(!i&&o.active){o.hide()
}}Ext.each(m,function(s){s.toggle.call(s,i==s.id)
})
};
var c=[{xtype:"panel",colspan:3,header:false,frame:false,border:false,plain:true,autoHegith:true,forceLayout:true,height:315,layout:{type:"vbox",align:"center"},listeners:{afterrender:function(w){var v=w.items.items[0];
var t=Ext.isArray(a.htcConfig.hccurrentversion)?a.htcConfig.hccurrentversion.join("."):"&nbsp;";
var i=Ext.isArray(window.hclatestversion)&&window.hclatestversion.length>0?window.hclatestversion.join("."):"&nbsp;";
var s=String.format(htcConfig.locData.AdminNewVersionAvailableInfo,"<b>"+t+"</b>",'<span id="hcLatestVersionSpan" style="font-weight:bold;">'+i+"</span>")+'<br/><a href="//www.element-it.com/httpcommander-changelog.aspx" target="_blank">Changelog page</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="//www.element-it.com/checklicense.aspx'+(!!a.htcConfig.licenseInfo&&!!a.htcConfig.licenseInfo.hash?("?key="+encodeURIComponent(a.htcConfig.licenseInfo.hash)):"")+'" target="_blank">Check license page</a><br />';
var u=a.htcConfig.locData.LicenseTrial;
var x=a.htcConfig.licenseInfo;
if(!a.htcConfig.showTrial&&x){if(x.usersCount<0){x.usersCount="Unlimited"
}u=String.format(a.htcConfig.locData.LicensePrompt,"<br />",x.usersCount,x.purchaseDate+(x.forVersion?("<br />For version: "+x.forVersion):""));
if(!a.htcConfig.showUpgrade){if(x.daysForFreeUpgrade<0){u+="Your license type allow you to perform minor upgrades for free and major version upgrades with 50% discount.<br />"
}else{u+=String.format(a.htcConfig.locData.LicenseFreeUpgradeMessage,x.daysForFreeUpgrade)+"&nbsp;&nbsp;&nbsp;&nbsp;"
}u+="<a href='//www.element-it.com/purchase.aspx?product=httpcommander' target='_blank'>HTTPCommander purchase page</a>"
}}else{u+=a.htcConfig.demoExpired?".<br /><b style='color:Red;'>Your evaluation period has expired!</b>":(".<br />Days left: "+a.htcConfig.trialDaysLeft)
}s+=u;
v.setText(s,false)
}},items:[{xtype:"label",html:"",style:{paddingBottom:"10px"}},{xtype:"panel",width:"100%",anchor:"100%",layout:"column",layoutConfig:{columns:2,tableAttrs:{align:"center"}},header:false,border:false,plain:true,frame:false,colspan:3,defaultType:"panel",forceLayout:true,defaults:{layout:"fit",width:"100%",anchor:"100%",plain:true,flex:1,frame:false,border:true,autoScroll:true,height:175,columnWidth:0.5,buttonAlign:"center"},items:[{title:a.htcConfig.locData.AdminUpdateManual,html:a.htcConfig.locData.AdminUpdateMainInfo,style:{paddingRight:"10px"},buttons:[{xtype:"button",text:a.htcConfig.locData.AdminUpdateStartButton+"&nbsp;("+String.format(a.htcConfig.locData.AdminUpdateStepInfo,a.htcConfig.locData.AdminUpdateNumberSymbol,"1-2)"),handler:function(i){if(!!h&&h.rendered){h.link="";
h.update({link:"",name:""})
}q("admin-update-backup")
}},{xtype:"button",text:a.htcConfig.locData.AdminUpdateFinishButton+"&nbsp;("+String.format(a.htcConfig.locData.AdminUpdateStepInfo,a.htcConfig.locData.AdminUpdateNumberSymbol,"3)"),handler:function(i){j.update(String.format(a.htcConfig.locData.AdminUpdateBackupContent,"<strong>"+a.htcConfig.locData.AdminUpdateBackupButton+"</strong>"));
p.auto=false;
p.buttons[2].setText(a.htcConfig.locData.AdminUpdateUploadButton);
applyItems=p.items.items[0].items;
applyItems.items[0].setVisible(false);
applyItems.items[1].setVisible(false);
applyItems.items[2].setText(a.htcConfig.locData.AdminUpdateFinishContent+"<br />",false);
applyItems.items[3].backupName=null;
q("admin-update-finish")
}}]},{title:a.htcConfig.locData.AdminUpdateAuto,html:a.htcConfig.locData.AdminUpdateAutoInfo,buttons:[{xtype:"button",text:String.format(a.htcConfig.locData.AdminUpdateStepInfo,a.htcConfig.locData.AdminUpdateNumberSymbol,"1"),handler:function(i){j.update(String.format(a.htcConfig.locData.AdminUpdateBackupContent,"<strong>"+a.htcConfig.locData.AdminUpdateBackupButton+"</strong>"));
p.auto=true;
applyItems=p.items.items[0].items;
applyItems.items[0].setVisible(true);
applyItems.items[1].setVisible(true);
if(!!h&&h.rendered){h.link="";
h.update({link:"",name:""})
}q("admin-update-backup")
}},{xtype:"button",text:a.htcConfig.locData.AdminUpdateAutoButton+"&nbsp;"+String.format(a.htcConfig.locData.AdminUpdateStepInfo,a.htcConfig.locData.AdminUpdateNumberSymbol,"2-3"),handler:function(i){p.auto=true;
p.buttons[2].setText(a.htcConfig.locData.AdminUpdateUploadAndInstallButton);
applyItems=p.items.items[0].items;
applyItems.items[0].setVisible(true);
applyItems.items[1].setVisible(true);
q("admin-update-finish")
}}]}]}]}];
for(var g=0;
g<m.length;
g++){c.push(m[g])
}return(r=new Ext.Panel({id:"update-tab",title:a.htcConfig.locData.AdminUpdateTab,padding:5,autoScroll:true,layout:"table",cls:"admin-update-tab",layoutConfig:{columns:3,tableAttrs:{align:"center"}},items:c,prepare:function(){if(!!h&&h.rendered){h.link="";
h.update({link:"",name:""})
}q(false)
}}))
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.AdminUserFoldersWindow=function(b){var c,g,e,f,d;
var a=new Ext.Window({title:b.htcConfig.locData.AdminUserFoldersWindowTitle,closable:true,closeAction:"hide",minimizable:false,maximizable:true,modal:true,bodyStyle:"padding: 5px",layout:{type:"vbox",align:"stretch"},width:b.htcConfig.isEmbeddedtoIFRAME?350:700,height:b.htcConfig.isEmbeddedtoIFRAME?250:450,plain:true,hideLabel:false,defaults:{anchor:"100%",hideLabel:false},items:[d=new Ext.form.FormPanel({hideLabel:false,baseCls:"x-plain",labelWidth:100,defaults:{anchor:"100%",hideLabel:false},items:[c=new Ext.form.ComboBox({fieldLabel:b.htcConfig.locData.AdminFoldersUserNamePrompt,displayField:"name",tpl:'<tpl for="."><div class="x-combo-list-item">{name:htmlEncode}</div></tpl>',mode:"remote",hideLabel:false,triggerAction:"all",disableKeyFilter:true,loadingText:b.htcConfig.locData.ProgressLoading+"...",emptyText:b.htcConfig.locData.AdminFoldersUserNameEmptyText+"...",selectOnFocus:true,editable:true,lazyInit:false,minChars:50,enableKeyEvents:true,typeAhead:true,store:new Ext.data.DirectStore({directFn:HttpCommander.Admin.GetUsers,autoLoad:false,fields:["name","email","icon","customField"],listeners:{load:function(h){if(!!c){c.mode="local";
c.minChars=0;
c.queryDelay=10
}}}}),listeners:{select:function(j,h,i){a.showFolders(j.getValue(),true)
},keyup:function(i,h){if(h.keyCode==Ext.EventObject.ENTER){a.showFolders(i.getValue(),true)
}},expand:function(h){h.syncSize()
}}})]}),g=new Ext.form.Label({text:b.htcConfig.AdminFoldersUserNameEmptyText,hidden:true}),e=new Ext.grid.GridPanel({flex:1,loadMask:true,viewConfig:{forceFit:true},multiSelect:false,border:true,enableHdMenu:true,autoExpandColumn:"permission",store:f=new Ext.data.ArrayStore({autoDestroy:true,idIndex:0,fields:["name","path","finalPath","permission"],data:[]}),columns:[{id:"name",sortable:true,header:b.htcConfig.locData.CommonFolderNameCaption,width:75,dataIndex:"name",renderer:function(i,j,h){return"<img src='"+HttpCommander.Lib.Utils.getIconPath(b,"folderftp")+"' class='filetypeimage'>"+Ext.util.Format.htmlEncode(i)
}},{id:"path",sortable:true,header:b.htcConfig.locData.AdminFoldersLocationPath,width:100,dataIndex:"path",renderer:b.wordWrapRenderer},{id:"finalPath",width:100,sortable:true,header:b.htcConfig.locData.AdminFoldersFolderPath,renderer:b.wordWrapRenderer},{id:"permission",sortable:true,width:200,header:b.htcConfig.locData.AdminFoldersPermissions,renderer:b.wordWrapRenderer}]})],buttons:[{text:b.htcConfig.locData.CommonButtonCaptionClose,handler:function(){a.hide()
}}],prepareAndShow:function(){a.hide();
c.setValue("");
d.setVisible(true);
g.hide();
f.removeAll();
f.commitChanges();
a.show();
a.syncSize()
},showFolders:function(j,k){if(!j){return
}var i={name:j},h=k||!b.getLoadMask()?e.loadMask:b.getLoadMask();
d.setDisabled(true);
g.hide();
h.msg=b.htcConfig.locData.ProgressLoading+"...";
h.show();
HttpCommander.Admin.GetUserFolders(i,function(m,l){c.setDisabled(false);
h.hide();
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(m,l,Ext.Msg,b.htcConfig)){g.setText(String.format(b.htcConfig.locData.AdminUserFoldersLabel,"<b>"+Ext.util.Format.htmlEncode(j)+"</b>"),false);
g.show();
d.setVisible(k);
d.setDisabled(false);
f.loadData(m.folders);
f.commitChanges();
if(!k){a.show()
}a.syncSize()
}})
}});
return a
};
Ext.ns("HttpCommander.Lib");
HttpCommander.Lib.AdminDbMaintenance=function(f){var l,k,h,e,c,b,j=[],d=[],g=new Ext.LoadMask(Ext.getBody(),{msg:f.htcConfig.locData.ProgressLoading+"...",removeMask:false});
if(Ext.isArray(f.htcConfig.dbLogLevels)){var i=f.htcConfig.dbLogEnabled;
var a=function(m,o){var n=m.ownerCt;
if(!o||!n){return
}if(m.enumValue==0){Ext.each(n.items.items,function(p){if(p.enumValue!=0){p.setValue(false)
}})
}else{if(m.enumValue!=0){n.getComponent("dbLogLevelDisabled").setValue(false)
}}};
Ext.each(f.htcConfig.dbLogLevels,function(n){var m=(i==n.value)||(i&n.value)!=0;
j.push({name:n.name,itemId:"dbLogLevel"+n.name,checked:m,value:m,enumValue:n.value,boxLabel:n.name,listeners:{change:a,check:a}})
})
}if(Ext.isArray(f.htcConfig.dbAdvConnParams)){Ext.each(f.htcConfig.dbAdvConnParams,function(n){if(Ext.isObject(n)){var m={afterrender:function(o){var q=Ext.isEmpty(o.vqtip)?o.qtip:o.vqtip;
if(!Ext.isEmpty(q)){var p=o.getEl();
if(!!p){p.dom.qtip=q
}}if(!Ext.isEmpty(o.qtip)&&!!o.label&&!!o.label.dom){o.label.dom.qtip=o.qtip
}}};
if(n.xtype=="combo"&&Ext.isObject(n.qtips)){m.change=m.select=function(o,r,q){var p=o.qtip||"";
var s=o.getValue();
if(Ext.isObject(o.qtips)&&!Ext.isEmpty(o.qtips[s])){p=o.qtips[s]
}if(!!o.el&&!!o.el.dom){o.el.dom.qtip=p
}if(o.el.setAttributeNS){o.el.setAttributeNS("ext","qtip",p)
}else{if(o.el.setAttribute){o.el.setAttribute("ext:qtip",p)
}}}
}n.listeners=m;
d.push(n)
}})
}return(l={title:f.htcConfig.locData.AdminDbMaintenanceTab,id:"mdb-tab",padding:5,autoScroll:true,layout:"table",cls:"admin-misc-tab",layoutConfig:{columns:2},items:[k=new Ext.FormPanel({title:f.htcConfig.locData.AdminDbMaintenanceInfoTitle,labelWidth:70,frame:false,padding:5,width:400,defaults:{xtype:"textfield",anchor:"100%",readOnly:true},items:[{xtype:"textarea",fieldLabel:f.htcConfig.locData.AdminDbMaintenanceInfoPathLabel,value:f.htcConfig.dbPhysicalPath||""},{itemId:"db-file-size",fieldLabel:f.htcConfig.locData.AdminDbMaintenanceInfoSizeLabel,value:f.htcConfig.dbFileSize||""}]}),h=new Ext.FormPanel({title:f.htcConfig.locData.AdminDbMaintenanceCompactTitle,labelWidth:70,frame:false,padding:5,bodyStyle:{textAlign:"center"},width:400,defaults:{anchor:"100%"},items:[{xtype:"label",html:f.htcConfig.locData.AdminDbMaintenanceCompactNote+"<br /><br />"},{xtype:"button",anchor:"",style:{margin:"auto",minWidth:"100px"},text:f.htcConfig.locData.AdminDbMaintenanceCompactButton,handler:function(m){g.show();
HttpCommander.Admin.CompactDb({},function(o,n){g.hide();
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(o,n,Ext.Msg,f.htcConfig)){k.getComponent("db-file-size").setValue(o.newsize);
if(!Ext.isEmpty(o.successmsg)){Ext.Msg.show({title:f.htcConfig.locData.AdminDbMaintenanceCompactTitle,msg:o.successmsg,buttons:Ext.Msg.OK,icon:Ext.Msg.INFO})
}}})
}}]}),e=new Ext.FormPanel({title:f.htcConfig.locData.AdminSettingsTab,labelWidth:300,frame:false,padding:5,width:400,items:[{xtype:"label",text:f.htcConfig.locData.AdminDbMaintenanceEnableLogLabel+":",hidden:j.length==0},b=new Ext.form.FieldSet({labelAlign:"top",hideLabel:true,layout:"column",defaults:{columnWidth:".33",border:false},defaultType:"checkbox",border:false,padding:0,margin:0,hidden:j.length==0,items:j}),{itemId:"db-interval-write",fieldLabel:f.htcConfig.locData.AdminDbMaintenanceInsertIntervalLabel,xtype:"numberfield",allowNegative:false,allowDecimals:false,width:"100%",anchor:"100%",allowBlank:false,minValue:0,value:f.htcConfig.dbIntervalWrite},{itemId:"db-adv-conn-params",xtype:"fieldset",hideLabel:true,labelWidth:120,collapsible:true,collapsed:true,checkboxToggle:true,title:f.htcConfig.locData.AdminDbMaintenanceAdvDbParamsTitle,width:"100%",anchor:"100%",defaults:{width:"100%",anchor:"100%"},defaultType:"textfield",items:d,buttonAlign:"center",buttons:[{text:f.htcConfig.locData.SettingsGridRestoreDefault,handler:function(m){var n=e.getComponent("db-adv-conn-params");
Ext.each(n.items.items,function(o){o.reset();
o.fireEvent("change",o,o.getValue(),o.getValue())
})
}}]},{xtype:"label",html:Ext.util.Format.htmlEncode(f.htcConfig.locData.AdminDbMaintenanceSettingsChangeNote)+"<br /><br />",width:"100%",anchor:"100%",style:{textAlign:"center",paddingTop:"10px",paddingBottom:"10px"}},{xtype:"button",anchor:"",style:{margin:"auto",minWidth:"100px"},text:f.htcConfig.locData.CommandSave,handler:function(n){var q=0;
Ext.each(b.items.items,function(s){if(s.getValue()){q|=s.enumValue
}});
var m=e.getComponent("db-interval-write");
if(m.getValue()<0){return
}var p=e.getComponent("db-adv-conn-params");
var o=null;
if(!p.collapsed){o={};
Ext.each(p.items.items,function(s){o[s.itemId]=s.getValue()
})
}var r={log:q,interval:m.getValue(),caps:o};
g.show();
HttpCommander.Admin.ChangeDbSettings(r,function(t,s){g.hide();
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(t,s,Ext.Msg,f.htcConfig)){f.htcConfig.dbLogEnabled=r.log;
Ext.Msg.show({title:f.htcConfig.locData.AdminSettingsTab,msg:f.htcConfig.locData.AdminDbMaintenanceSettingsSaveSuccess,buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function(){window.location.reload(true)
}})
}else{b.reset();
Ext.each(p.items.items,function(u){u.reset();
u.fireEvent("change",u,u.getValue(),u.getValue())
});
m.setValue(f.htcConfig.dbIntervalWrite)
}})
}}]}),c=new Ext.FormPanel({title:f.htcConfig.locData.AdminDbMaintenanceStatTitle,labelWidth:"100%",labelAlign:"top",frame:false,padding:5,width:400,defaults:{xtype:"textarea",anchor:"100%",readOnly:true,height:45,style:{fontFamily:"monospace",fontSize:"0.98em"}},items:[{itemId:"db-stat-Get",fieldLabel:f.htcConfig.locData.AdminDbMaintenanceStatDurationReadLabel},{itemId:"db-stat-Write",fieldLabel:f.htcConfig.locData.AdminDbMaintenanceStatDurationWriteLabel},{itemId:"db-stat-Compact",fieldLabel:f.htcConfig.locData.AdminDbMaintenanceStatDurationCompactLabel},{xtype:"button",anchor:"",height:"auto",style:{margin:"auto",minWidth:"100px"},text:f.htcConfig.locData.AdminDbMaintenanceStatGetButton,handler:function(m){var n=Ext.Ajax.timeout;
Ext.Ajax.timeout=150000;
g.show();
HttpCommander.Admin.GatherStats({},function(p,o){Ext.Ajax.timeout=n;
g.hide();
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(p,o,Ext.Msg,f.htcConfig)){if(Ext.isArray(p.avgs)){Ext.each(p.avgs,function(r){if(Ext.isObject(r)&&!Ext.isEmpty(r.name)){var q=c.getComponent("db-stat-"+r.name);
if(!!q){q.setValue(r.value||"")
}}})
}}})
}}]})]})
};
var debugmode=false,updateTab=null,shrinkLiveSupportImage=function(a){if(!a){return
}var b=30;
if(a.height>b){a.style.width=String(a.width*b/a.height)+"px";
a.style.height=String(b)+"px"
}},liveSupportEl='<a href="javascript:void(window.open(\'//demo.element-it.com/onlinesupport/chat.php?fromhc=true{0}\',\'\',\'width=590,height=610,left=0,top=0,resizable=yes,menubar=no,location=no,status=yes,scrollbars=yes\'))"><img onload="shrinkLiveSupportImage(this)" alt="Live Support" src="//demo.element-it.com/onlinesupport/image.php?id=01&type=inlay" /></a>',PermissionRecord=Ext.data.Record.create([{name:"name",mapping:"name"},{name:"type",mapping:"type"},{name:"icon",mapping:"icon"},{name:"permission",mapping:"permission"}]),MemberRecord=Ext.data.Record.create([{name:"name",mapping:"name"},{name:"icon",mapping:"icon"}]),isWindowsVersion=htcConfig.hcAuthMode=="windows"||htcConfig.hcAuthMode=="formswithwindowsusers",adminPerms=htcConfig.adminPerms||{},checkPrivilege=function(a){return htcConfig.isFullAdmin||(adminPerms&&adminPerms[String(a)]===true)
},browserContextMenuTypes=["textarea","text"],denyEditAD=htcConfig.hcAuthMode=="novelledirectory"||isWindowsVersion,showListForAllowedFolders=false,ajaxRequestTimeout=180000,controlUrl=(function(d){d=d||"";
if(d==""){return null
}d=d.toLowerCase();
var c=decodeURIComponent(window.location.search.substr(1)).replace(/\+/g," ").split("&");
for(var b=0;
b<c.length;
b++){var a=c[b].split("=");
if(a.length>1&&a[0].toLowerCase()==d){return a[1]
}}return null
})("control"),isControl=controlUrl!==null,isWebKit=(function(){try{return navigator.userAgent.toLowerCase().indexOf("webkit/")>=0
}catch(a){return false
}})(),adminPermsTab=null,userFoldersWindow=null;
Ext.onReady(function(){try{if((htcConfig.styleName||"").toLowerCase()=="access"){Ext.getBody().addClass("access-theme-font-color")
}}catch(D){}var z=function(){var J,K;
try{if(!!window.tbtnNewVersion){tbtnNewVersion.setVisible(!Ext.isEmpty(detectNewVersion()))
}}catch(L){}try{var K=document.getElementById("hcLatestVersionSpan");
if(!!K){var J=Ext.isArray(window.hclatestversion)&&window.hclatestversion.length>0?window.hclatestversion.join("."):"&nbsp;";
K.innerHTML=J
}}catch(L){}};
setTimeout(function(){HttpCommander.Lib.Utils.includeJsFile({url:"//demo.element-it.com/hclatestversion.js?rid="+(new Date()).getTime(),callback:function(){z()
}})
},10);
Ext.QuickTips.init();
Ext.apply(Ext.QuickTips.getQuickTip(),{dismissDelay:60000});
try{Ext.util.Observable.observeClass(Ext.data.Connection);
Ext.data.Connection.on("requestcomplete",function(L,K){try{var J=null;
if(K.getResponseHeader){J=K.getResponseHeader("X-HttpCommander-Status")
}if(!isControl&&J&&J==0){location.href=htcConfig.relativePath+"Logout.aspx"
}}catch(M){if(debugmode||window.onerror){throw M
}}})
}catch(D){if(debugmode||window.onerror){throw D
}}if(htcConfig&&htcConfig.listAllowedFoldersPaths&&htcConfig.allowedFoldersPaths&&htcConfig.allowedFoldersPaths.length>0){showListForAllowedFolders=htcConfig.listAllowedFoldersPaths>0
}Ext.getDoc().on("contextmenu",function(K,J){try{if(J&&J.type&&browserContextMenuTypes.indexOf(J.type.toLowerCase())!=-1){if(window.event){window.event.returnValue=true
}return true
}else{K.stopEvent();
return false
}}catch(L){if(debugmode||window.onerror){throw L
}}});
Ext.Direct.addProvider(HttpCommander.Remote.AdminHandler);
var y=Ext.get("loading-mask");
var g=Ext.get("loading");
if(g){g.fadeOut({duration:0.2,remove:true});
y.setOpacity(0.9);
y.shift({xy:g.getXY(),width:g.getWidth(),height:g.getHeight(),remove:true,duration:1,opacity:0.1,easing:"bounceOut"})
}addUserWindow=new Ext.Window({title:htcConfig.locData.AdminUsersPropertiesTitle,bodyStyle:"padding:5px",layout:"table",layoutConfig:{columns:1},resizable:false,closeAction:"hide",width:325,plain:true,autoHeight:true,items:[addUserInfo=new Ext.form.FieldSet({title:htcConfig.locData.AdminUsersGeneralInfo,labelWidth:100,defaultType:"textfield",items:[{fieldLabel:htcConfig.locData.CommonFieldLabelUserName,id:"add-user-name",name:"name",width:170},{fieldLabel:htcConfig.locData.CommonFieldLabelPassword,id:"add-user-password",name:"password",inputType:"password",width:170},{fieldLabel:htcConfig.locData.CommonFieldLabelRepeatPassword,id:"add-user-password2",name:"password2",inputType:"password",width:170},{fieldLabel:htcConfig.locData.AdminUsersUserEmail,id:"add-user-email",name:"email",width:170},{fieldLabel:htcConfig.showAdminPanelCustomFields?htcConfig.locData.AdminCommonCustomField:"",hideLabel:!htcConfig.showAdminPanelCustomFields,hidden:!htcConfig.showAdminPanelCustomFields,id:"add-user-custom-field",name:"customField",width:170}]}),addGridMembersOf=new Ext.grid.GridPanel({store:new Ext.data.ArrayStore({fields:["name","icon"]}),multiSelect:true,height:200,enableHdMenu:false,header:true,title:htcConfig.locData.AdminUsersGroups,selModel:new Ext.grid.RowSelectionModel({singleSelect:false,listeners:{selectionchange:function(e){var J=addGridMembersOf.getTopToolbar().findById("remove-member-of-add");
if(!!J){J.setDisabled(e.getCount()==0)
}}}}),tbar:{enableOverflow:true,items:[{text:htcConfig.locData.AdminCommandSelectGroups+"...",id:"add-member-of-add",icon:HttpCommander.Lib.Utils.getIconPath(this,"add"),handler:function(){promptGroupsNames(addGridMembersOf.getStore().getRange(),function(L,M,V){if(M=="ok"&&Ext.isArray(V)&&V.length>0){var T=0,U=V.length,e=addGridMembersOf.getStore(),Q=e.getRange(),S=0,Z=Q.length,O=[],P=(Z>0),X=HttpCommander.Lib.Utils.getIconPath(this,"group");
for(;
T<U;
T++){var aa=V[T];
var Y=aa.toLowerCase();
var J=true;
for(S=0;
S<Z;
S++){if(Y==Q[S].get("name").toLowerCase()){J=false;
break
}}if(J){if(P){P=false
}O.push(new MemberRecord({name:aa,icon:X}))
}}if(P){Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:htcConfig.locData.AdminUsersGroupAlreadyExists,icon:Ext.MessageBox.WARNING,buttons:Ext.Msg.CANCEL})
}else{e.add(O);
e.commitChanges();
addGridMembersOf.setTitle(htcConfig.locData.AdminUsersGroups+" ("+e.data.items.length+")");
var R=addGridMembersOf.getSelectionModel();
var W=e.data.items.length-1;
if(W>=0){R.selectRow(W,false);
var N=addGridMembersOf.getView();
var K=N.getRow(W);
if(K){K.scrollIntoView()
}}}}setTimeout(function(){if(!!L){L.close()
}},150)
})
}},{text:htcConfig.locData.AdminCommandRemoveGroups,id:"remove-member-of-add",icon:HttpCommander.Lib.Utils.getIconPath(this,"remove"),disabled:true,handler:function(){var e=addGridMembersOf.getStore();
var J=addGridMembersOf.getSelectionModel().getSelections();
if(Ext.isArray(J)&&J.length>0){e.remove(J);
e.commitChanges();
addGridMembersOf.setTitle(htcConfig.locData.AdminUsersGroups+" ("+e.data.items.length+")")
}}}]},columns:[{header:htcConfig.locData.CommonFieldLabelGroupName,width:275,flex:1,dataIndex:"name",renderer:function(J,K,e){return"<img src='"+htcConfig.relativePath+e.data.icon+"' class='filetypeimage' />"+Ext.util.Format.htmlEncode(J||"")
}}]})],listeners:{show:function(J){var e=addGridMembersOf.getStore();
e.commitChanges();
addGridMembersOf.setTitle(htcConfig.locData.AdminUsersGroups+" ("+e.data.items.length+")")
}},buttons:[{text:htcConfig.locData.CommonButtonCaptionAdd,handler:function(){var J=validateAddUserData();
if(J){Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:J,icon:Ext.MessageBox.WARNING,buttons:Ext.Msg.CANCEL})
}else{addUserWindow.hide();
var e=aggregateAddUserData();
gridUsers.loadMask.msg=htcConfig.locData.ProgressCreating+"...";
gridUsers.loadMask.show();
HttpCommander.Admin.AddUser(e,function(L,K){gridUsers.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
HttpCommander.Lib.Utils.checkDirectHandlerResult(L,K,Ext.Msg,htcConfig);
gridUsers.getStore().reload()
})
}}},{text:htcConfig.locData.CommonButtonCaptionCancel,handler:function(){addUserWindow.hide()
}},{text:htcConfig.locData.AdminCommandHelp,handler:function(){navigateHelpAdminPanelWithFragment("users")
}}]});
editUserWindow=new Ext.Window({title:htcConfig.locData.AdminUsersPropertiesTitle,bodyStyle:"padding:5px",layout:"table",layoutConfig:{columns:1},resizable:false,closeAction:"hide",width:300,plain:true,autoHeight:true,items:[editUserInfo=new Ext.form.FieldSet({title:htcConfig.locData.AdminUsersGeneralInfo,labelWidth:75,defaultType:"textfield",userName:"",items:[{fieldLabel:htcConfig.locData.CommonFieldLabelUserName,id:"edit-user-name",name:"name",width:170},{fieldLabel:htcConfig.locData.AdminUsersUserEmail,id:"edit-user-email",name:"email",width:170},{fieldLabel:htcConfig.showAdminPanelCustomFields?htcConfig.locData.AdminCommonCustomField:"",hideLabel:!htcConfig.showAdminPanelCustomFields,hidden:!htcConfig.showAdminPanelCustomFields,id:"edit-user-custom-field",name:"customField",width:170}]}),editGridMembersOf=new Ext.grid.GridPanel({store:new Ext.data.ArrayStore({fields:["name","icon"]}),multiSelect:true,height:200,enableHdMenu:false,header:true,title:htcConfig.locData.AdminUsersGroups,selModel:new Ext.grid.RowSelectionModel({singleSelect:false,listeners:{selectionchange:function(e){var J=editGridMembersOf.getTopToolbar().findById("remove-member-of");
if(!!J){J.setDisabled(e.getCount()==0)
}}}}),tbar:{enableOverflow:true,items:[{text:htcConfig.locData.AdminCommandSelectGroups+"...",id:"add-member-of",icon:HttpCommander.Lib.Utils.getIconPath(this,"add"),handler:function(){promptGroupsNames(editGridMembersOf.getStore().getRange(),function(L,M,V){if(M=="ok"&&Ext.isArray(V)&&V.length>0){var T=0,U=V.length,e=editGridMembersOf.getStore(),Q=e.getRange(),S=0,Z=Q.length,O=[],P=(Z>0),X=HttpCommander.Lib.Utils.getIconPath(this,"group");
for(;
T<U;
T++){var aa=V[T];
var Y=aa.toLowerCase();
var J=true;
for(S=0;
S<Z;
S++){if(Y==Q[S].get("name").toLowerCase()){J=false;
break
}}if(J){if(P){P=false
}O.push(new MemberRecord({name:aa,icon:X}))
}}if(P){Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:htcConfig.locData.AdminUsersGroupAlreadyExists,icon:Ext.MessageBox.WARNING,buttons:Ext.Msg.CANCEL})
}else{e.add(O);
e.commitChanges();
editGridMembersOf.setTitle(htcConfig.locData.AdminUsersGroups+" ("+e.data.items.length+")");
var R=editGridMembersOf.getSelectionModel();
var W=e.data.items.length-1;
if(W>=0){R.selectRow(W,false);
var N=editGridMembersOf.getView();
var K=N.getRow(W);
if(K){K.scrollIntoView()
}}}}setTimeout(function(){if(!!L){L.close()
}},150)
})
}},{text:htcConfig.locData.AdminCommandRemoveGroups,id:"remove-member-of",icon:HttpCommander.Lib.Utils.getIconPath(this,"remove"),disabled:true,handler:function(){var e=editGridMembersOf.getStore();
var J=editGridMembersOf.getSelectionModel().getSelections();
if(Ext.isArray(J)&&J.length>0){e.remove(J);
e.commitChanges();
editGridMembersOf.setTitle(htcConfig.locData.AdminUsersGroups+" ("+e.data.items.length+")")
}}}]},columns:[{header:htcConfig.locData.CommonFieldLabelGroupName,width:250,flex:1,dataIndex:"name",renderer:function(J,K,e){return"<img src='"+htcConfig.relativePath+e.data.icon+"' class='filetypeimage' />"+Ext.util.Format.htmlEncode(J||"")
}}]})],listeners:{show:function(J){var e=editGridMembersOf.getStore();
e.commitChanges();
editGridMembersOf.setTitle(htcConfig.locData.AdminUsersGroups+" ("+e.data.items.length+")")
},hide:function(J){if(gridUsers){var L=-1;
var e=gridUsers.getStore();
if(e){var K=gridUsers.getSelectionModel().getSelected();
if(K){L=e.indexOf(K)
}else{if(e.getCount()>0){L=0
}}}if(L>=0){gridUsers.getView().focusRow(L)
}}}},buttons:[{text:htcConfig.locData.CommandSave,id:"edit",handler:function(){var J=validateEditUserData();
if(J){Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:J,icon:Ext.MessageBox.WARNING,buttons:Ext.Msg.CANCEL})
}else{editUserWindow.hide();
var e=aggregateEditUserData();
HttpCommander.Admin.UpdateUser(e,function(L,K){gridUsers.loadMask.msg=htcConfig.locData.ProgressUpdating+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(L,K,Ext.Msg,htcConfig)){if(L.digest){Ext.Msg.alert(htcConfig.locData.CommonWarningCaption,L.digest)
}}gridUsers.getStore().reload()
})
}}},{text:htcConfig.locData.CommonButtonCaptionCancel,handler:function(){editUserWindow.hide()
}},{text:htcConfig.locData.AdminCommandHelp,handler:function(){navigateHelpAdminPanelWithFragment("users")
}}]});
setUserPasswordWindow=new Ext.Window({title:htcConfig.locData.AdminUsersSetPasswordTitle,bodyStyle:"padding:5px",layout:"table",layoutConfig:{columns:1},resizable:false,plain:true,closeAction:"hide",width:325,items:[setUserPasswordInfo=new Ext.form.FieldSet({title:htcConfig.locData.AdminUsersGeneralInfo,labelWidth:100,defaultType:"textfield",items:[{fieldLabel:htcConfig.locData.CommonFieldLabelUserName,id:"set-user-password-name",name:"name",disabled:true,width:170},{fieldLabel:htcConfig.locData.CommonFieldLabelPassword,id:"set-user-password-password",name:"password",inputType:"password",width:170},{fieldLabel:htcConfig.locData.CommonFieldLabelRepeatPassword,id:"set-user-password-password2",name:"password2",inputType:"password",width:170}]})],buttons:[{text:htcConfig.locData.CommandSave,id:"save",handler:function(){var J=validateSetUserPasswordData();
if(J){Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:J,icon:Ext.MessageBox.WARNING,buttons:Ext.Msg.CANCEL})
}else{setUserPasswordWindow.hide();
var e=aggregateSetUserPasswordData();
HttpCommander.Admin.SetUserPassword(e,function(L,K){gridUsers.loadMask.msg=htcConfig.locData.ProgressUpdating+"...";
HttpCommander.Lib.Utils.checkDirectHandlerResult(L,K,Ext.Msg,htcConfig);
gridUsers.getStore().reload()
})
}}},{text:htcConfig.locData.CommonButtonCaptionCancel,handler:function(){setUserPasswordWindow.hide()
}},{text:htcConfig.locData.AdminCommandHelp,handler:function(){navigateHelpAdminPanelWithFragment("users")
}}]});
userHelpWindow=HttpCommander.Lib.AdminUserHelpWindow({htcConfig:htcConfig});
groupWindow=new Ext.Window({title:htcConfig.locData.AdminGroupsPropertiesTitle,isEditing:false,bodyStyle:"padding:5px",layout:"table",layoutConfig:{columns:1},resizable:false,closeAction:"hide",width:260,plain:true,autoHeight:true,items:[groupInfo=new Ext.form.FieldSet({title:htcConfig.locData.AdminGroupsGeneralInfo,labelWidth:75,defaultType:"textfield",groupName:"",items:[{fieldLabel:htcConfig.locData.CommonFieldLabelGroupName,id:"group-name",name:"name",width:130},{fieldLabel:htcConfig.showAdminPanelCustomFields?htcConfig.locData.AdminCommonCustomField:"",hideLabel:!htcConfig.showAdminPanelCustomFields,hidden:!htcConfig.showAdminPanelCustomFields,id:"group-custom-field",name:"customField",width:130}]}),gridMembers=new Ext.grid.GridPanel({store:new Ext.data.ArrayStore({fields:["name","icon"]}),multiSelect:true,height:200,enableHdMenu:false,header:true,title:htcConfig.locData.AdminGroupsUsers,selModel:new Ext.grid.RowSelectionModel({singleSelect:false,listeners:{selectionchange:function(e){var J=gridMembers.getTopToolbar().findById("remove-member");
if(!!J){J.setDisabled(e.getCount()==0)
}}}}),tbar:{enableOverflow:true,items:[{text:htcConfig.locData.AdminCommandSelectUsers+"...",id:"add-member",icon:HttpCommander.Lib.Utils.getIconPath(this,"add"),handler:function(){promptUsersNames(gridMembers.getStore().getRange(),function(M,N,Y){if(N=="ok"&&Ext.isArray(Y)&&Y.length>0){var T=0,U=Y.length,J=gridMembers.getStore(),Q=J.getRange(),S=0,Z=Q.length,P=[],e=(Z>0),W=HttpCommander.Lib.Utils.getIconPath(this,"user");
for(;
T<U;
T++){var aa=Y[T];
var X=aa.toLowerCase();
var K=true;
for(S=0;
S<Z;
S++){if(X==Q[S].get("name").toLowerCase()){K=false;
break
}}if(K){if(e){e=false
}P.push(new MemberRecord({name:aa,icon:W}))
}}if(e){Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:htcConfig.locData.AdminGroupsUserAlreadyExists,icon:Ext.MessageBox.WARNING,buttons:Ext.Msg.CANCEL})
}else{J.add(P);
J.commitChanges();
gridMembers.setTitle(htcConfig.locData.AdminGroupsUsers+" ("+J.data.items.length+")");
var R=gridMembers.getSelectionModel();
var V=J.data.items.length-1;
if(V>=0){R.selectRow(V,false);
var O=gridMembers.getView();
var L=O.getRow(V);
if(L){L.scrollIntoView()
}}}}setTimeout(function(){if(!!M){M.close()
}},150)
})
}},{text:htcConfig.locData.AdminCommandRemoveUsers,id:"remove-member",icon:HttpCommander.Lib.Utils.getIconPath(this,"remove"),disabled:true,handler:function(){var e=gridMembers.getStore();
var J=gridMembers.getSelectionModel().getSelections();
if(Ext.isArray(J)&&J.length>0){e.remove(J);
e.commitChanges();
gridMembers.setTitle(htcConfig.locData.AdminGroupsUsers+" ("+e.data.items.length+")")
}}}]},columns:[{header:htcConfig.locData.CommonFieldLabelUserName,width:215,dataIndex:"name",renderer:function(J,K,e){return"<img src='"+htcConfig.relativePath+e.data.icon+"' class='filetypeimage' />"+Ext.util.Format.htmlEncode(J||"")
}}]})],listeners:{show:function(J){var e=gridMembers.getStore();
e.commitChanges();
gridMembers.setTitle(htcConfig.locData.AdminGroupsUsers+" ("+e.data.items.length+")")
},hide:function(J){if(gridGroups){var L=-1;
var e=gridGroups.getStore();
if(e){var K=gridGroups.getSelectionModel().getSelected();
if(K){L=e.indexOf(K)
}else{if(e.getCount()>0){L=0
}}}if(L>=0){gridGroups.getView().focusRow(L)
}}}},buttons:[{text:htcConfig.locData.CommonButtonCaptionAdd,id:"add-edit-group",handler:function(){var e=validateGroupData();
if(e){Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:e,icon:Ext.MessageBox.WARNING,buttons:Ext.Msg.CANCEL})
}else{groupWindow.hide();
var J=aggregateGroupData();
if(!groupWindow.isEditing){gridGroups.loadMask.msg=htcConfig.locData.ProgressCreating+"...";
gridGroups.loadMask.show();
HttpCommander.Admin.AddGroup(J,function(L,K){gridGroups.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
HttpCommander.Lib.Utils.checkDirectHandlerResult(L,K,Ext.Msg,htcConfig);
gridGroups.getStore().reload()
})
}else{HttpCommander.Admin.UpdateGroup(J,function(L,K){gridGroups.loadMask.msg=htcConfig.locData.ProgressUpdating+"...";
HttpCommander.Lib.Utils.checkDirectHandlerResult(L,K,Ext.Msg,htcConfig);
gridGroups.getStore().reload()
})
}}}},{text:htcConfig.locData.CommonButtonCaptionCancel,handler:function(){groupWindow.hide()
}},{text:htcConfig.locData.AdminCommandHelp,handler:function(){navigateHelpAdminPanelWithFragment("users")
}}]});
var k=[{fieldLabel:htcConfig.locData.CommonFolderNameCaption+"*",id:"folder-name",name:"name",width:225}];
if(showListForAllowedFolders){k.push({xtype:"combo",fieldLabel:htcConfig.locData.AdminFoldersFolderPath+"*",name:"path",width:225,id:"folder-path",displayField:"path",mode:"remote",resizable:true,tpl:'<tpl for="."><div ext:qtip="{encodedPath}" class="x-combo-list-item" style="margin-left:{level}px;">'+(htcConfig.showRelativePathInAFL?'<img alt="" width="16" height="16" style="vertical-align:top;" src="'+HttpCommander.Lib.Utils.getIconPath(this,"folder")+'" />&nbsp;{name:htmlEncode}':"{path:htmlEncode}")+"</div></tpl>",triggerAction:"all",loadingText:htcConfig.locData.ProgressLoading+"...",forceSelection:true,editable:false,lazyInit:false,store:new Ext.data.DirectStore({directFn:HttpCommander.Admin.GetAllowedFolders,autoLoad:false,fields:["name","path","encodedPath",{name:"level",type:"int"}]}),listeners:{select:function(K,e,J){Ext.QuickTips.getQuickTip().register({target:this.el,text:e.data.encodedPath});
K.setValue(e.data.path)
}}})
}else{k.push({xtype:"container",layout:"hbox",width:225,fieldLabel:htcConfig.locData.AdminFoldersFolderPath+"*",items:[{id:"folder-path",name:"path",xtype:"textfield",hideLabel:true,flex:1,enableKeyEvents:true,listeners:{change:function(K,J,e){Ext.QuickTips.getQuickTip().unregister(K.el);
if(J&&J!=""){Ext.QuickTips.getQuickTip().register({target:K.el,text:Ext.util.Format.htmlEncode(J)})
}},keyup:function(K,e){var L=K.getValue();
if(L&&((L=L.trim()).indexOf("\\\\")==0||L.indexOf("//")==0)){var J=htcConfig.hcAuthMode=="forms";
document.getElementById("share-note").innerHTML=String.format(htcConfig.locData[J?"AdminFoldersFolderRemoteWarningForms":"AdminFoldersFolderRemoteWarningWin"],'<br /><a href="Manual/faq.html#'+(J?"accessshredfolder":"abe")+'" target="_blank">',"</a>")
}else{document.getElementById("share-note").innerHTML=""
}}}},{id:"create-folder-button",xtype:"button",icon:HttpCommander.Lib.Utils.getIconPath(this,"createfolder"),tooltip:htcConfig.locData.AdminFoldersFolderCreate,handler:function(){var e=Ext.getCmp("folder-path");
var J="";
if(e&&!(new RegExp("^\\s*$","i")).test(J=e.getValue())){gridFolders.loadMask.msg=htcConfig.locData.AdminFoldersFolderCreateProcess+"...";
gridFolders.loadMask.show();
HttpCommander.Admin.CreateFolder({path:J},function(L,K){gridFolders.loadMask.hide();
gridFolders.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(L,K,Ext.Msg,htcConfig)){Ext.Msg.show({title:htcConfig.locData.AdminFoldersFolderCreate,msg:String.format(htcConfig.locData.AdminFoldersFolderCreateSuccessfully,Ext.util.Format.htmlEncode(L.createdPath)),closable:true,modal:true,buttons:Ext.Msg.OK,icon:Ext.Msg.INFO})
}})
}}}]})
}k.push({xtype:"hidden",id:"original-folder-path"});
window.onClickShares=function(){promptShareName(function(e,J){if(e=="ok"){Ext.getCmp("folder-path").setValue(J)
}})
};
var w=!htcConfig.wsqbEnabled?null:new Ext.Window({title:"Windows Search Query Builder",width:500,height:400,plain:true,resizable:true,maximizable:true,closeAction:"hide",layout:{type:"vbox",padding:"5",align:"stretch"},tools:[{id:"help",qtip:"Windows Search Help",handler:function(K,J,e){window.open(htcConfig.relativePath+"Manual/WindowsSearch.html","_blank")
}}],defaults:{anchor:"100%",flex:1,defaults:{margins:"0 0 5 0"}},keys:{key:13,ctrl:true,fn:function(J){w.executeQuery()
},scope:w},items:[{itemId:"query",xtype:"textarea",style:"font-size:11px;font-family:Courier New;",split:true,emptyText:'Enter the SQL query and click "Execute" or CTRL + ENTER',collapsible:true,region:"north"},{itemId:"results",xtype:"grid",remoteSort:false,layout:"fit",forceFit:true,flex:1.7,region:"center",style:{marginTop:"2px"},stripeRows:true,rowLines:true,tbar:[{itemId:"enable-log-errors",xtype:"checkbox",boxLabel:"Enable logging of errors"},"->",{text:"Clear",handler:function(){var J=w;
J.getComponent("query").setValue(null);
var e=J.getComponent("results");
e.reconfigure(new Ext.data.JsonStore({autoDestroy:true,root:"data",fields:[{name:"num",type:"int"}]}),new Ext.grid.ColumnModel([{header:"#",dataIndex:"num",width:40,fixed:true,sortable:true},{header:"And here you see the result"}]));
e.getStore().loadData({data:[]});
e.syncSize();
e.getView().refresh(true)
}}],viewConfig:{forceFit:true,autoFill:true},split:true,store:new Ext.data.ArrayStore({autoDestroy:true,fields:[{name:"num",type:"int"}]}),columns:[{header:"#",dataIndex:"num",width:40,fixed:true,sortable:true},{header:"And here you see the result"}]}],buttonAlign:"left",buttons:[{xtype:"box",autoEl:{tag:"a",target:"_blank",href:"https://msdn.microsoft.com/en-us/library/windows/desktop/bb231256.aspx",html:"SQL Syntax"}},{xtype:"box",autoEl:{tag:"a",target:"_blank",href:"https://msdn.microsoft.com/en-us/library/windows/desktop/dd561977.aspx",html:"Columns"}},"->",{text:"Close",handler:function(){w.hide()
}},{text:"Execute",handler:function(e){w.executeQuery.call(w)
}}],executeQuery:function(){var L=this;
var M=L.getComponent("query").getValue();
var J=L.getComponent("results");
var N=J.getTopToolbar().getComponent("enable-log-errors").getValue();
L.body.mask("Executing...");
var K=Ext.Ajax.timeout;
Ext.Ajax.timeout=5*60*1000;
HttpCommander.Admin.ExecuteWindowsSearchQuery({q:M,e:N},function(P,W){Ext.Ajax.timeout=K;
L.body.unmask();
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(P,W,Ext.Msg,htcConfig)){var T=P.data,Q=0,V,O=L.getComponent("results"),S=[{name:"num",type:"int"}],U=[{header:"#",dataIndex:"num",width:40,fixed:true,sortable:true}];
if(Ext.isArray(T)&&T.length>0){var R=T[0];
Q=0;
for(var e in R){if(R.hasOwnProperty(e)){V=String(e);
S.push(V);
U.push({header:V,dataIndex:V,renderer:wordWrapRenderer,sortable:true});
Q++
}}}else{P.data=[]
}for(Q=0;
Q<P.data.length;
Q++){P.data[Q]["num"]=(Q+1)
}O.reconfigure(new Ext.data.JsonStore({autoDestroy:true,root:"data",fields:S}),new Ext.grid.ColumnModel(U));
O.getStore().loadData(P);
O.syncSize();
O.getView().refresh(true)
}})
}});
window.testAccessHandler=function(){var e={path:Ext.getCmp("folder-path").getValue()};
gridFolders.loadMask.msg=htcConfig.locData.ProgressTestAccess+"...";
gridFolders.loadMask.show();
HttpCommander.Admin.TestAccess(e,function(K,J){gridFolders.loadMask.hide();
gridFolders.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(K,J,Ext.Msg,htcConfig)){Ext.Msg.show({title:htcConfig.locData.AdminFoldersTestAccessButton,msg:K.message,closable:true,modal:true,buttons:Ext.Msg.OK,icon:K.error?Ext.Msg.ERROR:(K.success?Ext.Msg.INFO:Ext.Msg.WARNING)})
}})
};
window.testIndexingHandler=!htcConfig.wSearchEnabled?Ext.emptyFn:function(){var e=function(L){gridFolders.loadMask.msg=htcConfig.locData.ProgressTestIndexing+"...";
gridFolders.loadMask.show();
HttpCommander.Admin.TestIndexing(L,function(P,O){gridFolders.loadMask.hide();
gridFolders.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(P,O,Ext.Msg,htcConfig)){var M=(P.indexed>1);
var Q=M?"AdminTestIndexingYesResult":P.indexed<=0?"AdminTestIndexingUnknownResult":"AdminTestIndexingNoResult";
var N="";
if(!M){N+="<br />"+String.format(htcConfig.locData.AdminHowToIndexingLocationLink,'<a href="javascript:showHelpWindow(\'Manual/WindowsSearch.html#indexing\');" target="_self">Windows&nbsp;Search</a>')
}Ext.Msg.show({title:htcConfig.locData.AdminFoldersTestIndexingButton,msg:Ext.util.Format.htmlEncode(String.format(htcConfig.locData[Q],L.path))+N,closable:true,modal:true,buttons:Ext.Msg.OK,icon:Ext.Msg[P.indexed>1?"INFO":"WARNING"]})
}})
};
var K={path:Ext.getCmp("folder-path").getValue(),add:true};
if(!Ext.isEmpty(htcConfig.demoLogoHeader)){K.add=false
}else{var J=K.path.trim();
if(J.indexOf("\\\\")==0||J.indexOf("//")==0){K.add=false
}}if(!K.add){e(K);
return
}Ext.Msg.show({title:htcConfig.locData.AdminFoldersTestIndexingButton,msg:htcConfig.locData.AdminTestIndexingAddIfNotIndexed,closable:true,modal:true,buttons:Ext.Msg.YESNOCANCEL,icon:Ext.Msg.QUESTION,fn:function(L,M){if(L!="cancel"){K.add=(L=="yes");
e(K)
}}})
};
window.validateFilterHandler=function(){try{if(folderWindow&&folderWindow.isVisible()){var J=folderWindow.findById("folder-filter-field");
if(J){J.clearInvalid();
gridFolders.loadMask.msg=htcConfig.locData.ProgressExecuting+"...";
gridFolders.loadMask.show();
HttpCommander.Admin.ValidateFolderFilter({filter:J.getValue()},function(L,e){gridFolders.loadMask.hide();
gridFolders.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
if(typeof L=="undefined"||!L){Ext.Msg.alert(htcConfig.locData.CommonErrorCaption,Ext.util.Format.htmlEncode(e.message));
return
}if(!L.success&&J&&L.message){J.markInvalid(L.message);
Ext.Msg.show({title:htcConfig.locData.AdminCommonValidateField,msg:L.message,closable:true,modal:true,buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR})
}else{Ext.Msg.show({title:htcConfig.locData.AdminCommonValidateField,msg:htcConfig.locData.AdminFoldersFolderFilterSuccess,closable:true,modal:true,buttons:Ext.Msg.OK,icon:Ext.Msg.INFO})
}})
}}}catch(K){}};
var m=(htcConfig.winAuth?1:0)+(htcConfig.wSearchEnabled?1:0);
m=Math.round((310-4*m)/(1+m))-1;
k.push({hideLabel:true,width:310,defaultType:"label",layout:"column",xtype:"container",defaults:{width:m},style:{paddingBottom:"7px",textAlign:"right"},items:[{hidden:!htcConfig.winAuth,html:'<a href="#" target="_self" onclick="onClickShares(); return false;">'+Ext.util.Format.ellipsis(htcConfig.locData.AdminFoldersSharesButton,15)+"</a>",tooltip:htcConfig.locData.AdminFoldersSharesButton},{width:4,hidden:!htcConfig.winAuth,html:"&nbsp;&nbsp;&nbsp;"},{html:'<a href="#" target="_self" onclick="testAccessHandler(); return false;">'+Ext.util.Format.ellipsis(htcConfig.locData.AdminFoldersTestAccessButton,15)+"</a>",tooltip:htcConfig.locData.AdminFoldersTestAccessButton},{hidden:!htcConfig.wSearchEnabled,width:4,html:"&nbsp;&nbsp;&nbsp;"},{hidden:!htcConfig.wSearchEnabled,html:genQuestionIconWithUrl("Windows Search Service","Manual/WindowsSearch.html")+'&nbsp;<a href="#" target="_self" onclick="testIndexingHandler(); return false;">'+Ext.util.Format.ellipsis(htcConfig.locData.AdminFoldersTestIndexingButton,15)+"</a>",tooltip:htcConfig.locData.AdminFoldersTestIndexingButton}],listeners:{afterrender:function(e){}}});
k.push({fieldLabel:htcConfig.locData.AdminFoldersFolderLimitations,xtype:"textarea",id:"folder-limitations",name:"limitations",width:225,height:24});
k.push({fieldLabel:htcConfig.locData.AdminFoldersFolderDescription,xtype:"textarea",id:"folder-description",name:"path",width:225,height:24});
k.push({hideLabel:!htcConfig.showAdminPanelCustomFields,fieldLabel:htcConfig.showAdminPanelCustomFields?(htcConfig.locData.AdminCommonCustomField):"",xtype:"textfield",id:"folder-custom-field",name:"customField",width:225,hidden:!htcConfig.showAdminPanelCustomFields});
if(htcConfig.winAuth&&htcConfig.isFullAdmin){k.push({fieldLabel:htcConfig.locData.AdminFoldersFolderQuota+genHintWithQuestionIcon(htcConfig.locData.AdminFoldersFolderQuotaHint),id:"quota-limit",name:"quota",width:225});
k.push({labelWidth:90,fieldLabel:"<a href='javascript:navigateHelpAdminPanelWithFragment(\"quota\")'>"+htcConfig.locData.AdminFoldersFolderQuotaMoreInfoLink+"</a>",labelStyle:"color:#dfe8f6;",width:225,defaultType:"button",layout:"column",xtype:"container",items:[{xtype:"button",width:112,text:Ext.util.Format.ellipsis(htcConfig.locData.AdminFoldersGetQuotaButton,15),handler:function(){var K=folderWindow.findById("folder-path");
if(K.getValue()==""){return
}var J={path:K.getValue()};
gridFolders.loadMask.msg=htcConfig.locData.ProgressExecuting+"...";
gridFolders.loadMask.show();
var e=Ext.Ajax.timeout;
Ext.Ajax.timeout=5*60*1000;
HttpCommander.Admin.GetQuotaLimit(J,function(N,M){Ext.Ajax.timeout=e;
gridFolders.loadMask.hide();
gridFolders.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
var L=folderWindow.findById("quota-limit");
L.setValue("");
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(N,M,Ext.Msg,htcConfig)){L.setValue(N.quota)
}})
},tooltip:htcConfig.locData.AdminFoldersGetQuotaButton},{xtype:"label",width:4,html:"&nbsp;&nbsp;&nbsp;"},{xtype:"button",width:112,text:Ext.util.Format.ellipsis(htcConfig.locData.AdminFoldersSetQuotaButton,15),handler:function(){var M=folderWindow.findById("folder-path");
if(M.getValue()==""){return
}var e=folderWindow.findById("quota-limit");
var K=e.getValue();
K=parseInt(K);
e.setValue(K);
if(!(K>0)){e.focus();
Ext.Msg.alert(htcConfig.locData.CommonErrorCaption,htcConfig.locData.FsrmInvalidQuotaValueMsg);
return
}var L={path:M.getValue(),quota:K};
gridFolders.loadMask.msg=htcConfig.locData.ProgressExecuting+"...";
gridFolders.loadMask.show();
var J=Ext.Ajax.timeout;
Ext.Ajax.timeout=5*60*1000;
HttpCommander.Admin.SetQuotaLimit(L,function(O,N){Ext.Ajax.timeout=J;
gridFolders.loadMask.hide();
gridFolders.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(O,N,Ext.Msg,htcConfig)){Ext.Msg.alert(htcConfig.locData.CommonInfoCaption,htcConfig.locData.FsrmQuotaSetMsg)
}})
},tooltip:htcConfig.locData.AdminFoldersSetQuotaButton}]})
}k.push({fieldLabel:htcConfig.locData.AdminCommonFilterField+":<br /><a href='javascript:navigateHelpAdminPanelWithFragment(\"filter\")'>"+htcConfig.locData.AdminFoldersFolderQuotaMoreInfoLink+"</a><br /><a id='validateFilterLink' style='display:none;' href='#' target='_self' onclick='validateFilterHandler(); return false;'>"+htcConfig.locData.AdminCommonValidateField+"</a>",labelSeparator:"",xtype:"textarea",id:"folder-filter-field",name:"filterField",width:225,height:24,toggleValidateLink:function(L){try{var J=document.getElementById("validateFilterLink");
if(J){if(L&&String(L).trim().length>0){J.style.display=""
}else{J.style.display="none"
}}}catch(K){}},listeners:{change:function(J,K,e){J.toggleValidateLink(K)
},show:function(e){e.toggleValidateLink(e.getValue())
}}});
folderWindow=new Ext.Window({title:htcConfig.locData.AdminFoldersPropertiesTitle,width:700,cls:"admin-folder-window",autoHeight:true,plain:true,isEditing:false,bodyStyle:"padding:5px",layout:"table",layoutConfig:{columns:2},resizable:false,closeAction:"hide",items:[commonFolderInfo=new Ext.form.FieldSet({title:htcConfig.locData.AdminFoldersGeneralInfo+genHintWithQuestionIcon(htcConfig.locData.AdminFoldersGeneralInfoHint),labelWidth:90,defaultType:"textfield",items:k,autoHeight:true,style:{marginBottom:"0px",paddingBottom:"2px"}}),fpPermissions=new Ext.form.FormPanel({width:332,cellCls:"tlcell",bodyStyle:"padding:5px",rowspan:2,header:true,disabled:true,autoHeight:true,title:htcConfig.locData.AdminFoldersPermissions,items:[new Ext.form.FieldSet({title:htcConfig.locData.AdminFoldersAccessControl+genHintWithQuestionIcon(getPermissionHintMsg()),id:"access",layout:"column",defaults:{columnWidth:".5",border:false},defaultType:"checkbox",items:[{name:"create",boxLabel:htcConfig.locData.AdminFoldersCreate,id:"create"},{name:"del",boxLabel:htcConfig.locData.AdminFoldersDelete,id:"del"},{name:"rename",boxLabel:htcConfig.locData.AdminFoldersRename,id:"rename"},{name:"upload",boxLabel:htcConfig.locData.AdminFoldersUpload,id:"upload"},{name:"download",boxLabel:htcConfig.locData.AdminFoldersDownload,id:"download"},{name:"zipDownload",boxLabel:htcConfig.locData.AdminFoldersZipDownload,id:"zipDownload"},{name:"zip",boxLabel:htcConfig.locData.AdminFoldersZip,id:"zip"},{name:"unzip",boxLabel:htcConfig.locData.AdminFoldersUnzip,id:"unzip"},{name:"cut",boxLabel:htcConfig.locData.AdminFoldersCut,id:"cut"},{name:"copy",boxLabel:htcConfig.locData.AdminFoldersCopy,id:"copy"},{name:"listFiles",boxLabel:htcConfig.locData.AdminFoldersListFiles,id:"listFiles"},{name:"listFolders",boxLabel:htcConfig.locData.AdminFoldersListFolders,id:"listFolders"},{name:"modify",boxLabel:htcConfig.locData.AdminFoldersModify,id:"modify"},{name:"bulkMailing",boxLabel:htcConfig.locData.AdminFoldersBulkMailing,id:"bulkMailing"},{name:"anonymDownload",boxLabel:htcConfig.locData.AdminFoldersAnonymDownload,id:"anonymDownload"},{name:"anonymViewContent",boxLabel:htcConfig.locData.AdminFoldersAnonymViewContent,id:"anonymViewContent"},{name:"anonymUpload",boxLabel:htcConfig.locData.AdminFoldersAnonymUpload,id:"anonymUpload"},{name:"watchForModifs",boxLabel:htcConfig.locData.AdminFoldersWatch,id:"watchForModifs"}]}),new Ext.form.FieldSet({title:htcConfig.locData.AdminFoldersListRestrictions+genHintWithQuestionIcon(htcConfig.locData.AdminFoldersListRestrictionsHint),labelWidth:60,anchor:"100%",items:[{xtype:"radiogroup",fieldLabel:htcConfig.locData.CommonFieldLabelType,id:"list-rest",items:[{boxLabel:htcConfig.locData.AdminFoldersRestrictionAllow,name:"listType",inputValue:0},{boxLabel:htcConfig.locData.AdminFoldersRestrictionDeny,name:"listType",inputValue:1,checked:true}]},{name:"list-ext",id:"list-ext",fieldLabel:htcConfig.locData.AdminFoldersRestrictionExtensions,enableKeyEvents:true,anchor:"100%",xtype:"textfield",style:{textTransform:"uppercase"}}]}),new Ext.form.FieldSet({title:htcConfig.locData.AdminFoldersCreateRestrictions+genHintWithQuestionIcon(htcConfig.locData.AdminFoldersCreateRestrictionsHint),labelWidth:60,anchor:"100%",items:[{xtype:"radiogroup",id:"create-rest",fieldLabel:htcConfig.locData.CommonFieldLabelType,items:[{boxLabel:htcConfig.locData.AdminFoldersRestrictionAllow,name:"createType",inputValue:0},{boxLabel:htcConfig.locData.AdminFoldersRestrictionDeny,name:"createType",inputValue:1,checked:true}]},{name:"create-ext",id:"create-ext",fieldLabel:htcConfig.locData.AdminFoldersRestrictionExtensions,anchor:"100%",xtype:"textfield",style:{textTransform:"uppercase"}}]}),{name:"customField",id:"folders-permissions-custom-field",anchor:"100%",xtype:"textfield",hidden:!htcConfig.showAdminPanelCustomFields,hideLabel:!htcConfig.showAdminPanelCustomFields,fieldLabel:htcConfig.showAdminPanelCustomFields?htcConfig.locData.AdminCommonCustomField:""}]}),gridPerms=new Ext.grid.GridPanel({store:new Ext.data.ArrayStore({fields:["name","type","typeId","icon","permission"]}),minHeight:250,multiSelect:false,width:342,enableHdMenu:false,header:true,title:htcConfig.locData.AdminFoldersUsersGroups+genHintWithQuestionIcon(htcConfig.locData.AdminFoldersUsersGroupsHint),selModel:new Ext.grid.RowSelectionModel({singleSelect:true,listeners:{selectionchange:function(J){var K=gridPerms.getTopToolbar().findById("remove");
K.setDisabled(J.getCount()==0);
var e=gridPerms.getSelectionModel().getSelected();
fpPermissions.setDisabled(!e);
fpPermissions.setTitle(!e?htcConfig.locData.AdminFoldersPermissions:String.format(htcConfig.locData.AdminFoldersPermissionsFor,Ext.util.Format.htmlEncode(e.data.name)));
if(e){fillPermissionData(e.data.permission,fpPermissions)
}},beforerowselect:function(J,L,K,e){updatePermission()
}}}),tbar:{enableOverflow:true,items:[{text:htcConfig.locData.AdminCommandAddUser+"...",id:"add-user",icon:HttpCommander.Lib.Utils.getIconPath(this,"add"),handler:function(){promptUserName(function(J,L){if(J=="ok"){var K=false;
Ext.each(gridPerms.getStore().data.items,function(M){if(M.data.typeId=="user"&&M.data.name.toLowerCase()==L.toLowerCase()){K=true
}});
if(K){Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:htcConfig.locData.AdminFoldersUserAlreadyExists,icon:Ext.MessageBox.WARNING,buttons:Ext.Msg.OK})
}else{var e=new PermissionRecord({name:L,type:htcConfig.locData.CommonFieldLabelUser,typeId:"user",icon:HttpCommander.Lib.Utils.getIconPath(this,"user"),permission:getDefaultPermission(L)});
gridPerms.getStore().add(e)
}}},true)
}},{text:htcConfig.locData.AdminCommandAddGroup+"...",id:"add-group",icon:HttpCommander.Lib.Utils.getIconPath(this,"add"),handler:function(){promptGroupName(function(J,K){if(J=="ok"){var L=false;
Ext.each(gridPerms.getStore().data.items,function(M){if(M.data.typeId=="group"&&M.data.name.toLowerCase()==K.toLowerCase()){L=true
}});
if(L){Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:htcConfig.locData.AdminFoldersGroupAlreadyExists,icon:Ext.MessageBox.WARNING,buttons:Ext.Msg.OK})
}else{var e=new PermissionRecord({name:K,type:htcConfig.locData.CommonFieldLabelGroup,typeId:"group",icon:HttpCommander.Lib.Utils.getIconPath(this,"group"),permission:getDefaultPermission(K)});
gridPerms.getStore().add(e)
}}},true)
}},{text:htcConfig.locData.CommandDelete,id:"remove",icon:HttpCommander.Lib.Utils.getIconPath(this,"remove"),disabled:true,handler:function(){var e=gridPerms.getSelectionModel().getSelected();
if(e){gridPerms.getStore().remove(e);
fillPermissionData(getDefaultPermission(""),fpPermissions)
}}}]},columns:[{header:htcConfig.locData.CommonFieldLabelName,width:215,dataIndex:"name",renderer:function(J,K,e){var L=J;
if(!Ext.isEmpty(L)&&L.toLowerCase().indexOf("regex:")==0&&L.length>6){L='<span style="font-weight:bold;">regex:</span>'+Ext.util.Format.htmlEncode(L.substring(6))
}else{L=Ext.util.Format.htmlEncode(L||"")
}return"<img src='"+htcConfig.relativePath+e.data.icon+"' class='filetypeimage' />"+L
}},{header:htcConfig.locData.CommonFieldLabelType,width:80,dataIndex:"type",renderer:htmlEncodeRenderer}]})],buttonAlign:"left",buttons:[{html:'<div id="share-note" style="color:red;white-space:normal;width:350px;"></div>',xtype:"label"},"->",{text:htcConfig.locData.CommonButtonCaptionAdd,id:"add-edit-folder",handler:function(){updatePermission();
var e=validateFolderData();
if(e){Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:e,icon:Ext.MessageBox.WARNING,buttons:Ext.Msg.OK})
}else{var J=aggregateFolderData();
if(!J){return
}if(!folderWindow.isEditing){gridFolders.loadMask.msg=htcConfig.locData.ProgressCreating+"...";
gridFolders.loadMask.show();
HttpCommander.Admin.AddFolder(J,function(L,K){gridFolders.loadMask.hide();
gridFolders.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(L,K,Ext.Msg,htcConfig)){folderWindow.hide();
gridFolders.getStore().reload()
}})
}else{gridFolders.loadMask.msg=htcConfig.locData.ProgressUpdating+"...";
gridFolders.loadMask.show();
J.oldPath=commonFolderInfo.findById("original-folder-path").getValue();
HttpCommander.Admin.UpdateFolder(J,function(L,K){gridFolders.loadMask.hide();
gridFolders.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(L,K,Ext.Msg,htcConfig)){folderWindow.hide();
gridFolders.getStore().reload()
}})
}}}},{text:htcConfig.locData.CommonButtonCaptionCancel,handler:function(){folderWindow.hide()
}},{text:htcConfig.locData.AdminCommandHelp,handler:function(){navigateHelpAdminPanelWithFragment("foldersetup")
}}],listeners:{hide:function(J){if(gridFolders){var L=-1;
var e=gridFolders.getStore();
if(e){var K=gridFolders.getSelectionModel().getSelected();
if(K){L=e.indexOf(K)
}else{if(e.getCount()>0){L=0
}}}if(L>=0){gridFolders.getView().focusRow(L)
}}},show:function(K){var J=K.findById("folder-path"),L;
if(J){Ext.QuickTips.getQuickTip().unregister(J.el);
L=J.getValue();
if(L&&L!=""){Ext.QuickTips.getQuickTip().register({target:J.el,text:Ext.util.Format.htmlEncode(L)})
}}var e=K.findById("folder-filter-field");
if(e){L=e.getValue();
if(typeof e.toggleValidateLink=="function"){e.toggleValidateLink(L)
}}},afterrender:function(K){var J=commonFolderInfo.findById("folder-path");
var e=J.getValue();
J.setValue("_");
J.setValue(e);
commonFolderInfo.syncSize();
fpPermissions.syncSize();
gridPerms.setHeight(fpPermissions.getHeight()-commonFolderInfo.getHeight()-21);
K.syncSize()
}}});
var n=new Ext.TabPanel({activeTab:0,border:true,region:"center",margins:"0 0 5 0",deferredRender:true,enableTabScroll:true,items:[],listeners:{tabchange:function(J,e){if(e.id=="update-tab"){e.prepare()
}else{if(e.id=="folders-tab"&&!("loaded_once" in e)){e.loaded_once=true;
gridFolders.store.load()
}else{if(e.id=="anonym-tab"&&!("loaded_once" in e)){e.loaded_once=true;
gridAnonymLinks.store.load()
}else{if(e.id=="users-tab"&&!("loaded_once" in e)){e.loaded_once=true;
gridUsers.store.load()
}else{if(e.id=="groups-tab"&&!("loaded_once" in e)){e.loaded_once=true;
gridGroups.store.load()
}else{if(e.id=="log-tab"&&!("loaded_once" in e)){e.loaded_once=true;
gridLog.loadStore()
}else{if(e.id=="log-errors-tab"&&!("loaded_once" in e)){e.loaded_once=true;
gridLogErrors.store.load()
}else{if(e.id=="settings-tab"&&!("loaded_once" in e)){e.loaded_once=true;
if(gridSettings){gridSettings.store.load()
}if(emailNotifs){emailNotifs.LoadData()
}}else{if(e.id=="admin-permissions-tab"&&!("loaded_once" in e)){if(adminPermsTab){e.loaded_once=true;
if(adminPermsTab.getGridAdminPermissions()){adminPermsTab.getGridAdminPermissions().store.load()
}if(adminPermsTab.getGridAdminFolders()){adminPermsTab.getGridAdminFolders().store.load()
}}}}}}}}}}}}}});
if(checkPrivilege("ModifySettings")){window.restoreDefaultSettingValue=function(M,J){if(M=="Runtime"||(M=="Main"&&J=="WindowsUsersWithFormAuth")){Ext.Msg.alert(htcConfig.locData.CommonWarningCaption,"Not applicable");
return
}var L=settingsStore.findBy(function(N,O){return N.data.group==M&&N.data.name==J
});
if(L==-1){return
}var e=settingsStore.getAt(L);
var K=gridSettings;
if(!!e&&!!e.data&&e.data.defaultvalue==e.data.value){Ext.Msg.alert(htcConfig.locData.CommonWarningCaption,"This parameter already with value by default");
return
}b();
HttpCommander.Admin.RestoreSettingValue(M,J,function(P,O){x();
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(P,O,Ext.Msg,htcConfig)){var Q=e.data.value!==P.newvalue;
e.data.value=P.newvalue;
e.data.changed=P.changed;
e.commit();
if(e.data.group=="Main"&&e.data.name=="ShowHiddenParameters"){settingsStore.reload()
}else{K.getView().refresh()
}if(Q){if(tbtnSaveSettingsMsg){tbtnSaveSettingsMsg.show()
}var N=Ext.getCmp("settings-save-button");
if(N){N.setIcon(htcConfig.relativePath+"Images/savewarn.gif")
}}}})
};
var l=null,C=function(){if(l==null){l=new Ext.LoadMask(Ext.getBody(),{msg:htcConfig.locData.ProgressLoading+"...",removeMask:false});
l.showCnt=0
}},b=function(){C();
l.showCnt+=1;
if(l.showCnt==1){l.show()
}},x=function(){C();
if(l.showCnt>0){l.showCnt-=1;
if(l.showCnt==0){l.hide()
}}},I=function(){return HttpCommander.Lib.Utils.getCookie("showHiddenParams",true)==="1"||false
},f=function(J){var e=Ext.getCmp("toggle-hidden-params-button");
if(e){J=J||false;
e.toggle(J,true);
e.setText(String.format(htcConfig.locData.AdminToggleHiddenParams,(J?htcConfig.locData.AdminHideHiddenParams:htcConfig.locData.AdminShowHiddenParams)))
}},s=function(){HttpCommander.Lib.Utils.deleteCookie("showHiddenParams");
f(false)
},E=function(e){if(e.data.group=="Runtime"||(e.data.group=="Main"&&e.data.name=="WindowsUsersWithFormAuth")){return
}var J=document.getElementById("btn_restore_cnt_"+e.data.name);
if(J&&!J.hasChildNodes()){(new Ext.Button({text:htcConfig.locData.SettingsGridRestoreDefault,handler:function(){restoreDefaultSettingValue(e.data.group,e.data.name)
}})).render(J)
}},G=new Ext.ux.grid.RowExpander({tpl:new Ext.Template("<p><b>"+Ext.util.Format.htmlEncode(htcConfig.locData.SettingsGridDescriptionInfo)+':</b> {comment:htmlEncode} <a href="javascript:showHelpWindow(\'Manual/webconfigsetup.html#{name}\');" target="_self" id="moreInfo">'+Ext.util.Format.htmlEncode(htcConfig.locData.SettingsGridMoreInfo)+"</a></p><p><b>"+Ext.util.Format.htmlEncode(htcConfig.locData.SettingsGridFormatInfo)+":</b> {formathint:htmlEncode}</p><p><b>"+Ext.util.Format.htmlEncode(htcConfig.locData.SettingsGridDefaultValueInfo)+':</b> {defaultvalue:htmlEncode} <span id="btn_restore_cnt_{name}"></span></p>'),listeners:{bodycontent:function(K,e,J,L){if(e.data.group=="Runtime"||(e.data.group=="Main"&&e.data.name=="WindowsUsersWithFormAuth")){J.content=J.content.replace(/<a\s[^>]*id="restoreDefault">[^<]*<\/a>/i,"")
}if(e.data.hidden&&(e.data.comment==null||String(e.data.comment).trim()=="")){J.content=J.content.replace(/<a\s[^>]*id="moreInfo">[^<]*<\/a>/i,"")
}},expand:function(K,e,J,L){E(e)
}}}),i=function(J){var K=String(J.value);
if(J.record.data.name=="StyleThemeName"&&K==="blue"){K=""
}b();
HttpCommander.Admin.UpdateSettings(J.record.data.group,J.record.data.name,K,function(N,L){x();
var O=null;
var M=false;
var Q=J.grid.getStore().findExact("name","ShowHiddenParameters");
if(Q>=0&&J.grid.getStore().getAt(Q).data.value=="true"){M=true
}if(typeof N=="undefined"||!N){Ext.Msg.alert(htcConfig.locData.CommonErrorCaption,Ext.util.Format.htmlEncode(L.message));
J.record.reject();
if(O!=null){O=Ext.urlEncode({Error:L.message},O);
location.replace(O)
}return
}if(N.status!="success"){Ext.Msg.alert(htcConfig.locData.CommonErrorCaption,N.message);
J.record.reject();
if(O!=null){O=Ext.urlEncode({Error:N.message},O);
location.replace(O)
}return
}var P=J.value!==J.originalValue;
J.record.data.value=N.newvalue;
J.record.data.changed=N.changed;
J.record.commit();
if(O!=null){location.replace(O)
}else{if(J.record.data.group=="Main"&&J.record.data.name=="ShowHiddenParameters"){J.grid.getStore().reload()
}else{J.grid.getView().refresh()
}}if(P){if(tbtnSaveSettingsMsg){tbtnSaveSettingsMsg.show()
}var e=Ext.getCmp("settings-save-button");
if(e){e.setIcon(htcConfig.relativePath+"Images/savewarn.gif")
}}if(P&&J.record.data.name=="IdentifierWebDav"){Ext.Msg.show({title:htcConfig.locData.CommonWarningCaption,msg:'You changed value of the WebDAV identifier.<br />Please, <a target="_self" href="javascript:showHelpWindow(\'Manual/WebFolders.html#webdavconfig\');">configure web folder mapping</a>',buttons:Ext.Msg.OK,icon:Ext.Msg.WARNING,fn:function(R){if(R=="ok"){showHelpWindow("Manual/WebFolders.html#webdavconfig")
}}})
}})
};
n.add({title:htcConfig.locData.AdminSettingsTab,id:"settings-tab",autoScroll:true,xtype:"panel",tbar:{enableOverflow:true,items:[{text:htcConfig.locData.AdminSettingsSave,id:"settings-save-button",icon:HttpCommander.Lib.Utils.getIconPath(this,"savetofile"),handler:function(e){b();
HttpCommander.Admin.SaveSettings(function(K,J){x();
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(K,J,Ext.Msg,htcConfig)){if(tbtnSaveSettingsMsg){tbtnSaveSettingsMsg.hide()
}e.setIcon(HttpCommander.Lib.Utils.getIconPath(htcConfig,"savetofile"));
Ext.Msg.alert(htcConfig.locData.CommonWarningCaption,htcConfig.locData.SettingsSettingsSavedMsg)
}settingsStore.reload()
})
}},{id:"toggle-hidden-params-button",text:String.format(htcConfig.locData.AdminToggleHiddenParams,(I()?htcConfig.locData.AdminHideHiddenParams:htcConfig.locData.AdminShowHiddenParams)),icon:HttpCommander.Lib.Utils.getIconPath(this,"toggle-hidden-params"),tooltip:htcConfig.locData.AdminHintHiddenParams,enableToggle:true,toggleHandler:function(J,K){if(gridSettings){var e=gridSettings.getStore();
if(e){HttpCommander.Lib.Utils.setCookie("showHiddenParams",K?1:0);
e.changedHiddenViewState=true;
e.reload();
return
}}f(I())
},pressed:I()},{text:htcConfig.locData.AdminCommandHelp,icon:HttpCommander.Lib.Utils.getIconPath(this,"help"),handler:function(){showHelpWindow("Manual/webconfigsetup.html")
}}]},items:[gridSettings=new Ext.grid.EditorGridPanel({store:(settingsStore=new Ext.data.GroupingStore({reader:new Ext.data.JsonReader({totalProperty:"total",root:"data",remoteGroup:true,fields:[{name:"group",type:"string"},{name:"name",type:"string"},{name:"value",type:"string"},{name:"comment",type:"string"},{name:"type",type:"string"},{name:"data"},{name:"formathint",type:"string"},{name:"defaultvalue",type:"string"},{name:"changed",type:"boolean"},{name:"hidden",type:"boolean"},{name:"startcollapsed",type:"boolean"}]}),proxy:new Ext.data.DirectProxy({directFn:HttpCommander.Admin.GetSettings,paramOrder:"showHiddenParams"}),remoteSort:true,remoteGroup:true,groupField:"group",listeners:{beforeload:function(e,J){e.setBaseParam("showHiddenParams",I());
b()
},load:function(J,e,K){x();
gridSettings.getView().refresh();
if(typeof J.reader.jsonData.demoModeMsg!="undefined"){s();
if(J.changedHiddenViewState===true){Ext.Msg.alert(htcConfig.locData.CommonErrorCaption,J.reader.jsonData.demoModeMsg)
}}else{f(I())
}J.changedHiddenViewState===false
},exception:function(e){x();
f(I());
gridSettings.getStore().changedHiddenViewState=false
}}})),multiSelect:false,clicksToEdit:1,border:false,enableHdMenu:true,autoHeight:true,autoExpandColumn:"settings-col-value",plugins:G,id:"SettingsGrid",colModel:new Ext.grid.ColumnModel([G,{header:htcConfig.locData.CommonFieldLabelGroup,dataIndex:"group",hidden:true,renderer:function(e){return"<span style='font-weight:bold;font-size:1.1em;'>"+Ext.util.Format.htmlEncode(e||"")+"</span>"
}},{header:htcConfig.locData.CommonFieldLabelName,dataIndex:"name",width:180,renderer:function(M,J,e,O,L,K){if(e.data.hidden){J.attr=(htcConfig.styleName==="gray"?'style="cursor:pointer;background-color: #E0E0E0;"':String.format('style="cursor:pointer;background-repeat: repeat; background-image: url(./Images/resources_1.5/images/{0}/shared/glass-bg.gif);"',(htcConfig.styleName&&htcConfig.styleName.length>0?encodeURIComponent(htcConfig.styleName.indexOf("azzurra")>=0?"azzurra-legacy":htcConfig.styleName):"default")))
}else{J.attr='style="cursor:pointer;"'
}var N=(Ext.isEmpty(e.get("comment"))?"":("<p><b>"+Ext.util.Format.htmlEncode(htcConfig.locData.SettingsGridDescriptionInfo).replace(" ","&nbsp;")+":&nbsp;</b>"+Ext.util.Format.htmlEncode(e.get("comment")||"")+"</p>"))+"<p><b>"+Ext.util.Format.htmlEncode(htcConfig.locData.SettingsGridFormatInfo).replace(" ","&nbsp;")+":&nbsp;</b>"+Ext.util.Format.htmlEncode(e.get("formathint")||"")+"</p><p><b>"+Ext.util.Format.htmlEncode(htcConfig.locData.SettingsGridDefaultValueInfo).replace(" ","&nbsp;")+":&nbsp;</b>"+Ext.util.Format.htmlEncode(e.get("defaultvalue")||"")+"</p>";
J.attr+=' ext:qtip="'+Ext.util.Format.htmlEncode(N)+'"';
return Ext.util.Format.htmlEncode(M)
}},{id:"settings-col-value",header:htcConfig.locData.CommonFieldLabelValue,dataIndex:"value",editable:true,sortable:false,renderer:function(M,J,e,O,L,K){var N=((e.data.group=="MailSettings"&&e.data.name=="Password")||(e.data.name=="EDirectoryBindUserPassword"))?passwordRenderer(M):Ext.util.Format.htmlEncode(M);
if(e.data.changed){return'<span style="font-weight:bold;">'+N+"</span>"
}else{return N
}},css:String.format("background-position-y: -2px; background-repeat: repeat-x; background-image: url(./Images/resources_1.5/images/{0}/toolbar/bg.gif);",(htcConfig.styleName&&htcConfig.styleName.length>0?encodeURIComponent(htcConfig.styleName.indexOf("azzurra")>=0?"azzurra-legacy":htcConfig.styleName):"default"))}]),view:new Ext.grid.GroupingView({initTemplates:function(){Ext.grid.GroupingView.superclass.initTemplates.call(this);
this.state={};
var e=this.grid.getSelectionModel();
e.on(e.selectRow?"beforerowselect":"beforecellselect",this.onBeforeRowSelect,this);
if(!this.startGroup){this.startGroup=new Ext.XTemplate('<div id="{groupId}" class="x-grid-group {cls}">','<div id="{groupId}-hd" class="x-grid-group-hd x-toolbar" style="{style}"><div class="x-grid-group-title">',this.groupTextTpl,"</div></div>",'<div id="{groupId}-bd" class="x-grid-group-body">')
}this.startGroup.compile();
if(!this.endGroup){this.endGroup="</div></div>"
}this.endGroup="</div></div>"
},doRender:function(L,O,W,e,V,X){if(O.length<1){return""
}if(!this.canGroup()||this.isUpdating){return Ext.grid.GroupingView.superclass.doRender.apply(this,arguments)
}var ae=this.getGroupField(),U=this.cm.findColumnIndex(ae),ab,P="width:"+this.getTotalWidth()+";",N=this.cm.config[U],J=N.groupRenderer||N.renderer,Y=this.showGroupName?(N.groupName||N.header)+": ":"",ad=[],R,Z,aa,T;
for(Z=0,aa=O.length;
Z<aa;
Z++){var Q=e+Z,S=O[Z],M=S.data[ae],K=S.data.startcollapsed;
ab=this.getGroup(M,S,J,Q,U,W);
if(!R||R.group!=ab){T=this.constructId(M,ae,U);
this.state[T]=!(Ext.isDefined(this.state[T])?!this.state[T]:(this.startCollapsed||K));
R={group:ab,gvalue:M,text:Y+ab,groupId:T,startRow:Q,rs:[S],cls:this.state[T]?"":"x-grid-group-collapsed",style:P};
ad.push(R)
}else{R.rs.push(S)
}S._groupId=T
}var ac=[];
for(Z=0,aa=ad.length;
Z<aa;
Z++){ab=ad[Z];
this.doGroupStart(ac,ab,L,W,V);
ac[ac.length]=Ext.grid.GroupingView.superclass.doRender.call(this,L,ab.rs,W,ab.startRow,V,X);
this.doGroupEnd(ac,ab,L,W,V)
}return ac.join("")
},listeners:{refresh:function(K){var e=K.getRows().length;
for(var L=0;
L<e;
L++){var J=gridSettings.getStore().getAt(L);
E(J)
}}}}),listeners:{beforeedit:function(M){var L,J;
switch(M.record.data.type){case"bool":J=["true","false"];
L=new Ext.form.ComboBox({lazyInit:false,lazyRender:false,editable:false,forceSelection:true,triggerAction:"all",mode:"local",store:J,boxMaxWidth:100,listeners:{select:function(P,e,O){gridSettings.stopEditing(false)
}}});
L=new Ext.grid.GridEditor(L);
M.grid.colModel.setEditor(M.column,L);
break;
case"number":L=new Ext.form.NumberField({selectOnFocus:true,style:"text-align:left;"});
L=new Ext.grid.GridEditor(L);
M.grid.colModel.setEditor(M.column,L);
break;
case"enum":J=[];
for(var K=0;
K<M.record.data.data.length;
++K){var N=M.record.data.data[K];
J.push(N)
}L=new Ext.form.ComboBox({lazyInit:false,lazyRender:false,editable:false,forceSelection:true,triggerAction:"all",mode:"local",store:J,boxMaxWidth:155,listeners:{select:function(P,e,O){gridSettings.stopEditing(false)
}}});
L=new Ext.grid.GridEditor(L);
M.grid.colModel.setEditor(M.column,L);
break;
case"string":default:L=(M.record.data.name=="StyleThemeName")?new Ext.form.ComboBox({lazyInit:false,lazyRender:false,editable:false,forceSelection:true,triggerAction:"all",mode:"remote",boxMaxWidth:210,valueField:"value",displayField:"name",tpl:'<tpl for="."><div class="x-combo-list-item">{name:htmlEncode}</div></tpl>',store:new Ext.data.DirectStore({reader:new Ext.data.JsonReader({idProperty:"value",root:"data",fields:["name","value"]}),autoLoad:false,api:{read:HttpCommander.Admin.StyleThemeNames}}),listeners:{select:function(P,e,O){gridSettings.stopEditing(false)
}}}):new Ext.form.TextField({selectOnFocus:true,inputType:((M.record.data.group=="MailSettings"&&M.record.data.name=="Password")||(M.record.data.name=="EDirectoryBindUserPassword"))?"password":"text"});
L=new Ext.grid.GridEditor(L);
M.grid.colModel.setEditor(M.column,L);
break
}},afteredit:function(K){var J=false;
if((K.record.data.group=="Runtime"&&K.record.data.name=="AuthMode")||(J=(K.record.data.group=="Main"&&K.record.data.name=="WindowsUsersWithFormAuth"))){Ext.Msg.show({title:htcConfig.locData.CommonWarningCaption,msg:String.format(htcConfig.locData.SettingsDenyAuthModeChange,'<a href="javascript:showHelpWindow(\'Manual/ManualConfigurationOfAuthenticationMode.html\');" target="_self">Manual configuration of authentication mode</a>'),buttons:Ext.Msg.OK,icon:Ext.Msg.WARNING,fn:function(e){K.record.reject()
}})
}else{i(K)
}}}}),emailNotifs=HttpCommander.Lib.AdminEmailNotifications({htcConfig:htcConfig,showSettingsMask:b,hideSettingsMask:x})]})
}editFolderHandler=function(){var e=gridFolders.getSelectionModel().getSelected();
if(e){prepareFolderWindow(e.data);
folderWindow.show()
}};
if(checkPrivilege("ModifyFolders")||htcConfig.adminFoldersExists){n.add({title:htcConfig.locData.AdminFoldersTab,id:"folders-tab",layout:"fit",items:[gridFolders=new Ext.grid.GridPanel({header:isWindowsVersion&&htcConfig.isFullAdmin,headerCfg:isWindowsVersion&&htcConfig.isFullAdmin?{cls:"x-panel-tbar",html:String.format(htcConfig.locData.AdminFoldersDescription,"<a href='javascript:navigateHelpAdminPanelWithFragment(\"gpolfolders\")'>","</a>")}:undefined,store:new Ext.data.DirectStore({remoteSort:true,paramOrder:["sort","dir"],sortInfo:{field:null,direction:null},directFn:HttpCommander.Admin.GetFolders,fields:[{name:"name",type:"string"},{name:"path",type:"string"},{name:"icon",type:"string"},{name:"limitations",type:"string"},{name:"description",type:"string"},{name:"customField",type:"string"},{name:"filterField",type:"string"},{name:"filterError",type:"string"},{name:"userPerms"},{name:"groupPerms"}]}),keys:{key:[Ext.EventObject.ENTER],fn:function(J){switch(J){case Ext.EventObject.ENTER:editFolderHandler();
break
}},scope:this},plugins:[new Ext.ux.dd.GridDragDropRowOrder({listeners:{beforerowmove:function(e,M,J,K){if(K.length<=0){return false
}var L={name:K[0].data.name,path:K[0].data.path,index:J};
gridFolders.loadMask.msg=htcConfig.locData.ProgressMoving+"...";
gridFolders.loadMask.show();
HttpCommander.Admin.MoveFolder(L,function(O,N){gridFolders.loadMask.hide();
gridFolders.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
HttpCommander.Lib.Utils.checkDirectHandlerResult(O,N,Ext.Msg,htcConfig);
gridFolders.getStore().reload()
});
return true
}}})],viewConfig:{forceFit:true},multiSelect:false,border:false,loadMask:true,enableHdMenu:false,autoExpandColumn:"path",width:352,height:212,selModel:new Ext.grid.RowSelectionModel({singleSelect:true,listeners:{selectionchange:function(e){var J=gridFolders.getTopToolbar().findById("remove-folder");
var K=gridFolders.getTopToolbar().findById("edit-folder");
J.setDisabled(e.getCount()==0);
K.setDisabled(e.getCount()==0)
}}}),tbar:{enableOverflow:true,items:[{text:htcConfig.locData.CommandRefresh,icon:HttpCommander.Lib.Utils.getIconPath(this,"refresh"),handler:function(){gridFolders.getStore().reload()
}},{text:htcConfig.locData.AdminFoldersAddFolder+"...",icon:HttpCommander.Lib.Utils.getIconPath(this,"add"),handler:function(){prepareFolderWindow(null);
folderWindow.show()
}},{text:htcConfig.locData.AdminFoldersEditFolder+"...",id:"edit-folder",icon:HttpCommander.Lib.Utils.getIconPath(this,"editfolder"),disabled:true,handler:editFolderHandler},{id:"remove-folder",text:htcConfig.locData.AdminFoldersRemoveFolder,icon:HttpCommander.Lib.Utils.getIconPath(this,"remove"),disabled:true,handler:function(){var J=gridFolders.getSelectionModel().getSelected();
var L=J.data.name;
var K=J.data.path;
var e={};
e.name=L;
e.path=K;
Ext.Msg.show({title:htcConfig.locData.CommonConfirmCaption,msg:String.format(htcConfig.locData.AdminFoldersDeleteFolderPrompt,Ext.util.Format.htmlEncode(L)),buttons:Ext.Msg.YESNO,icon:Ext.MessageBox.QUESTION,fn:function(M){if(M=="yes"){gridFolders.loadMask.msg=htcConfig.locData.ProgressDeleting+"...";
gridFolders.loadMask.show();
HttpCommander.Admin.DeleteFolder(e,function(O,N){gridFolders.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
HttpCommander.Lib.Utils.checkDirectHandlerResult(O,N,Ext.Msg,htcConfig);
gridFolders.getStore().reload()
})
}}})
}},{text:htcConfig.locData.AdminUserFoldersButtonTitle,icon:HttpCommander.Lib.Utils.getIconPath(this,"viewfolders"),handler:function(){if(userFoldersWindow){userFoldersWindow.prepareAndShow()
}}},{text:htcConfig.locData.AdminCommandHelp,icon:HttpCommander.Lib.Utils.getIconPath(this,"help"),handler:function(){navigateHelpAdminPanelWithFragment("foldersetup")
}},{text:"Windows Search Query Builder",hidden:!htcConfig.wsqbEnabled||!w,icon:HttpCommander.Lib.Utils.getIconPath(this,"search"),handler:function(){if(w!=null){w.show()
}}}]},columns:[{id:"name",sortable:true,header:htcConfig.locData.CommonFieldLabelName,width:100,dataIndex:"name",renderer:function(J,K,e){return"<img src='"+htcConfig.relativePath+e.data.icon+"' class='filetypeimage' />"+Ext.util.Format.htmlEncode(J)
}},{id:"path",sortable:true,width:150,header:htcConfig.locData.CommonFieldLabelPath,dataIndex:"path",renderer:htmlEncodeRenderer},{id:"userPerms",width:150,header:htcConfig.locData.FolderGridUserPermissionsColumn,dataIndex:"userPerms",renderer:identitiesRenderer},{id:"groupPerms",width:150,header:htcConfig.locData.FolderGridGroupPermissionsColumn,dataIndex:"groupPerms",renderer:identitiesRenderer}],listeners:{rowdblclick:function(K,J,L){editFolderHandler()
}}})]})
}try{Ext.apply(Ext.form.VTypes,{password:function(K,J){if(J.initialPassField){var e=Ext.getCmp(J.initialPassField);
return(K==e.getValue())
}return true
},passwordText:htcConfig.locData.LinkToFilePasswordNotMatch})
}catch(D){if(debugmode||window.onerror){throw D
}}function d(){return{id:0,key:"",path:"",expires:HttpCommander.Lib.Utils.getNextYearDate(),password:"",acl:15,downloads:0,notes:"",emails:"",upload_overwrite:true,isfolder:true,virt_path:null,access_users:null,owner:null,perms:null,show_comments:true}
}function j(R){if(!anonymFolderWindow){return
}var U=Ext.getCmp("anonym-general-info");
var Z={down:Ext.getCmp("anonym-download-chk").getValue(),up:Ext.getCmp("anonym-upload-chk").getValue(),view:Ext.getCmp("anonym-view-chk").getValue(),zip:Ext.getCmp("anonym-zip-download-chk").getValue()};
Z.overwrite=Z.up&&Ext.getCmp("anonym-overwrite-rg").items.items[0].getValue();
var Q=Ext.getCmp("anonym-physical-path-field");
var L=Ext.getCmp("anonym-expire-date-field");
var N=Ext.getCmp("anonym-password-field");
var S=Ext.getCmp("anonym-password2-field");
var K=(function(){if(!(Q.isValid()&&L.isValid()&&N.isValid()&&S.isValid())){return htcConfig.locData.LinkToFileInvalidForm
}pass1=N.getValue();
pass2=S.getValue();
if(pass1!=pass2){return htcConfig.locData.LinkToFilePasswordNotMatch
}if(!(Z.down||Z.up||Z.view||Z.zip)){return htcConfig.locData.PublicFolderACLNotSet
}return null
})();
if(K){Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:K,icon:Ext.Msg.WARNING,buttons:Ext.Msg.OK});
return
}R=(R===true);
isFolderLink=Ext.getCmp("anonym-type-field").items.items[0].getValue()===true;
var P=Ext.getCmp("anonym-hash-field");
var J=Ext.getCmp("anonym-id-field");
var X=Ext.getCmp("anonym-owner-field");
var O={id:J.getValue(),key:P.getValue(),path:Q.getValue(),type:isFolderLink,password:N.getValue(),acl:Z,show_comments:Ext.getCmp("anonym-show-comments-field").getValue(),owner:X.getValue()};
if(R){O.pass_changed=Ext.isDefined(anonymFolderWindow.initPass)&&((O.password==null&&anonymFolderWindow.initPass==null)||(O.password===anonymFolderWindow.initPass))
}else{O.pass_changed=false
}var M=L.getValue();
var Y=new Date(M.getFullYear(),M.getMonth(),M.getDate());
var W=new Date(Y.getTime()+24*60*60*1000);
O.expireDate=HttpCommander.Lib.Utils.getDateUTCString(W);
if(isFolderLink){O.downloadCnt=0
}else{var V=String(Ext.getCmp("anonym-download-cnt-field").getValue());
if(V.trim()==""){O.downloadCnt=0
}else{try{O.downloadCnt=parseInt(V)
}catch(T){O.downloadCnt=0
}}}O.noteForUsers=isFolderLink?Ext.getCmp("anonym-note-users-field").getValue():null;
O.emails=isFolderLink?Ext.getCmp("anonym-emails-field").getValue():null;
O.accessusers=Ext.getCmp("anonym-limit-access").getValue();
O.virtpath=Ext.getCmp("anonym-virtual-path").getValue();
O.show_comments=Ext.getCmp("anonym-show-comments-field").getValue();
gridAnonymLinks.loadMask.msg=htcConfig.locData[(R?"ProgressSavingAnonymousLink":"ProgressGettingAnonymLink")]+"...";
gridAnonymLinks.loadMask.show();
HttpCommander.Admin.EditAnonymLink(O,function(ac,ab){gridAnonymLinks.loadMask.hide();
gridAnonymLinks.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
if(!HttpCommander.Lib.Utils.checkDirectHandlerResult(ac,ab,Ext.Msg,htcConfig)){return
}if(ac.id&&ac.key){J.setValue(ac.id);
P.setValue(ac.key);
Ext.getCmp("anonym-keys-field").setValue(ac.key);
anonymFolderWindow.isEditing=true
}if(ac.path){Q.setValue(ac.path)
}var aa=Ext.getCmp("anonym-link-field");
var e=Ext.getCmp("anonym-short-link-field");
aa.setValue(!aa.hidden&&ac.link?ac.link:"");
e.setValue(!e.hidden&&ac["short"]?ac["short"]:"");
anonymFolderWindow.buttons[0].setVisible(anonymFolderWindow.isEditing);
anonymFolderWindow.buttons[2].setText(htcConfig.locData[anonymFolderWindow.isEditing?"CommandSave":"LinkToFileGenerate"]);
if(typeof ac.accessusers!="undefined"){Ext.getCmp("accessusers").setValue(ac.accessusers)
}gridAnonymLinks.getStore().reload()
})
}function h(){var K=Ext.getCmp("anonym-download-chk");
var e=Ext.getCmp("anonym-upload-chk");
var L=Ext.getCmp("anonym-zip-download-chk");
var J=Ext.getCmp("anonym-view-chk");
var M=L.getValue()&&!K.getValue()&&!e.getValue()&&!J.getValue();
Ext.getCmp("anonym-note-users-field").setDisabled(M);
Ext.getCmp("anonym-emails-field").setDisabled(M);
Ext.getCmp("anonym-download-cnt-field").setDisabled(!M)
}anonymFolderWindow=new Ext.Window({title:htcConfig.locData.AdminAnonymFoldersPropertiesTitle,width:628+35,plain:true,autoHeight:true,isEditing:false,currentData:undefined,isFile:false,bodyStyle:"padding: 3px",buttonAlign:"left",layout:{type:"table",columns:2},resizable:false,closeAction:"hide",isEditing:true,defaults:{xtype:"fieldset",style:{margin:"2px"},width:300},items:[{id:"anonym-general-info",title:htcConfig.locData.AdminFoldersGeneralInfo,rowspan:2,defaults:{xtype:"textfield",anchor:"100%"},labelWidth:100,items:[{id:"anonym-id-field",xtype:"hidden",value:0},{id:"anonym-hash-field",xtype:"hidden",value:""},{id:"anonym-virtual-path",xtype:"hidden"},{id:"anonym-owner-field",xtype:"hidden",value:null},{id:"anonym-physical-path-field",fieldLabel:htcConfig.locData.AdminFoldersFolderPath,allowBlank:false},{xtype:"radiogroup",id:"anonym-type-field",fieldLabel:htcConfig.locData.CommonFieldLabelType,vertical:false,items:[{boxLabel:htcConfig.locData.CommonValueTypeFolder,name:"anonym-type-radio-group",checked:true,inputValue:0,listeners:{check:function(J,e){Ext.getCmp("anonym-zip-download-chk").setValue(e);
Ext.getCmp("anonym-view-chk").setValue(e);
Ext.getCmp("anonym-upload-chk").setValue(e);
Ext.getCmp("anonym-download-chk").setValue(true);
Ext.getCmp("anonym-acl-info").setDisabled(!e);
Ext.getCmp("anonym-note-users-field").setDisabled(!e);
Ext.getCmp("anonym-emails-field").setDisabled(!e);
Ext.getCmp("anonym-download-cnt-field").setDisabled(e)
}}},{boxLabel:htcConfig.locData.CommandFile,name:"anonym-type-radio-group",inputValue:1}]},{fieldLabel:htcConfig.locData.LinkToFileExpireDate,id:"anonym-expire-date-field",xtype:"datefield",format:htcConfig.USADateFormat?"m/d/Y":"d/m/Y",minValue:HttpCommander.Lib.Utils.getTodayDate(),value:HttpCommander.Lib.Utils.getNextYearDate()},{fieldLabel:htcConfig.locData.CommonFieldLabelPassword,id:"anonym-password-field",inputType:"password"},{fieldLabel:htcConfig.locData.CommonFieldLabelRepeatPassword,id:"anonym-password2-field",vtype:"password",inputType:"password",initialPassField:"anonym-password-field"},{hideLabel:true,id:"anonym-show-comments-field",xtype:"checkbox",boxLabel:htcConfig.locData.AnonymousLinkShowCommentsLabel,disabled:htcConfig.isAllowedComments!="1"&&htcConfig.isAllowedComments!="2"&&!htcConfig.allowedDescription,checked:htcConfig.isAllowedComments=="1"||htcConfig.isAllowedComments=="2"||htcConfig.allowedDescription},{fieldLabel:htcConfig.locData.LinkToFileDownloadCnt,id:"anonym-download-cnt-field",xtype:"numberfield",minValue:0,value:0,disabled:true},{xtype:"container",labelAlign:"top",layout:"form",items:[{fieldLabel:htcConfig.locData.AdminAnonymFoldersKeysColumn,id:"anonym-keys-field",xtype:"textarea",readOnly:true,height:53,anchor:"100%"}]}]},{id:"anonym-acl-info",title:htcConfig.locData.PublicFolderAnonymAccessControl,layout:"column",width:335,defaults:{border:false,baseCls:"x-plain",columnWidth:0.5,anchor:"100%"},items:[{defaults:{xtype:"checkbox"},items:[{id:"anonym-download-chk",boxLabel:htcConfig.locData.PublicFolderAnonymDownload,listeners:{check:function(e,J){h()
}}},{id:"anonym-zip-download-chk",boxLabel:htcConfig.locData.PublicFolderAnonymZipDownload,listeners:{check:function(e,J){h()
}}},{id:"anonym-view-chk",boxLabel:htcConfig.locData.PublicFolderAnonymViewContent,listeners:{check:function(e,K){var J=Ext.getCmp("anonym-download-chk");
J.setDisabled(!K);
if(!K){J.setValue(false)
}h()
}}}]},{items:[{id:"anonym-upload-chk",xtype:"checkbox",boxLabel:"&nbsp;"+htcConfig.locData.PublicFolderAnonymUpload+".&nbsp;"+htcConfig.locData.PublicFolderLinkOverwriteWhileUpload+":",anchor:"100%",listeners:{check:function(e,J){Ext.getCmp("anonym-overwrite-rg").setDisabled(!J);
h()
}}},{xtype:"container",layout:"form",anchor:"100%",items:[{id:"anonym-overwrite-rg",xtype:"radiogroup",hideLabel:true,anchor:"100%",items:[{boxLabel:htcConfig.locData.AdminFoldersRestrictionAllow,name:"overwriteExisting",inputValue:0,checked:true},{boxLabel:htcConfig.locData.AdminFoldersRestrictionDeny,name:"overwriteExisting",inputValue:1}]}]}]}]},{id:"anonym-additional-info",title:htcConfig.locData.AdminAnonymFoldersAdditionalInfo,labelAlign:"top",style:{paddingBottom:"0px"},width:335,defaults:{anchor:"100%"},items:[{fieldLabel:htcConfig.locData.PublicFolderNoteForUsers,id:"anonym-note-users-field",xtype:"textarea",height:40},{fieldLabel:htcConfig.locData.PublicFolderLinkSendEmails,xtype:"textfield",id:"anonym-emails-field"},{fieldLabel:htcConfig.locData.AnonymousLinkLimitAccessCheckBox,id:"anonym-limit-access",xtype:"textarea",height:40}]},{xtype:"container",labelAlign:"top",colspan:2,width:604+35,layout:"form",items:[{id:"anonym-link-field",fieldLabel:htcConfig.locData.AdminAnonymFoldersLinkLabel,readOnly:true,selectOnFocus:true,xtype:"textarea",value:"",anchor:"100%",height:40,hidden:htcConfig.publicLinksViewType==2,hideLabel:htcConfig.publicLinksViewType==2},{id:"anonym-short-link-field",fieldLabel:htcConfig.locData.AdminAnonymFoldersShortColumn,readOnly:true,selectOnFocus:true,xtype:"textfield",value:"",anchor:"100%",hidden:htcConfig.publicLinksViewType==1,hideLabel:htcConfig.publicLinksViewType==1}]}],buttons:[{text:htcConfig.locData.AnonymousEditLinkShowUrl,hidden:true,handler:function(){j(true)
}},"->",{text:htcConfig.locData.LinkToFileGenerate,handler:function(){j(anonymFolderWindow.isEditing)
}},{text:htcConfig.locData.CommonButtonCaptionCancel,handler:function(){anonymFolderWindow.hide()
}},{text:htcConfig.locData.AdminCommandHelp,handler:function(){navigateHelpAdminPanelWithFragment("publicfolders")
}}],listeners:{hide:function(J){if(J.needSelectInGrid===true){var K=Ext.getCmp("anonym-id-field");
var M=0;
if(K&&(M=K.getValue())!=""&&gridAnonymLinks){var L=gridAnonymLinks.getStore().findExact("id",M);
if(L>=0){var e=gridAnonymLinks.getSelectionModel();
e.selectRow(L);
gridAnonymLinks.getView().focusRow(L)
}}}},show:function(K){var O=K.isEditing===true&&typeof K.currentData!="undefined";
K.needSelectInGrid=O;
var N=O?K.currentData:d();
var L=N.acl;
K.isFile=!(N.isfolder===true);
Ext.getCmp("anonym-id-field").setValue(N.id);
Ext.getCmp("anonym-hash-field").setValue(N.key);
Ext.getCmp("anonym-owner-field").setValue(N.owner);
Ext.getCmp("anonym-physical-path-field").setValue(N.path);
Ext.getCmp("anonym-expire-date-field").setValue(N.expires);
Ext.getCmp("anonym-show-comments-field").setValue(N.show_comments);
if(O){K.initPass=N.password
}else{K.initPass=undefined
}Ext.getCmp("anonym-password-field").setValue(N.password);
Ext.getCmp("anonym-password2-field").setValue(N.password);
Ext.getCmp("anonym-virtual-path").setValue(N.virt_path);
var M=0;
if(K.isFile){try{M=Number(N.downloads)
}catch(P){M=0
}}Ext.getCmp("anonym-download-cnt-field").setValue(M);
Ext.getCmp("anonym-keys-field").setValue(N.key);
Ext.getCmp("anonym-note-users-field").setValue(N.notes);
Ext.getCmp("anonym-emails-field").setValue(N.emails);
Ext.getCmp("anonym-limit-access").setValue(N.access_users);
Ext.getCmp("anonym-link-field").setValue("");
Ext.getCmp("anonym-short-link-field").setValue("");
Ext.getCmp("anonym-type-field").items.items[1].setValue(K.isFile);
Ext.getCmp("anonym-type-field").items.items[0].setValue(!K.isFile);
if(!K.isFile){Ext.getCmp("anonym-download-chk").setValue((L&2)!=0);
Ext.getCmp("anonym-zip-download-chk").setValue((L&8)!=0);
Ext.getCmp("anonym-view-chk").setValue((L&1)!=0);
Ext.getCmp("anonym-upload-chk").setValue((L&4)!=0);
var J=N.upload_overwrite===true;
Ext.getCmp("anonym-overwrite-rg").items.items[0].setValue(J);
Ext.getCmp("anonym-overwrite-rg").items.items[1].setValue(!J)
}Ext.getCmp("anonym-physical-path-field").clearInvalid();
if(!Ext.isEmpty(N.url)){Ext.getCmp("anonym-link-field").setValue(N.url);
if(!Ext.isEmpty(N.shortUrl)){Ext.getCmp("anonym-short-link-field").setValue(N.shortUrl)
}}K.buttons[0].setVisible(O);
K.buttons[2].setText(htcConfig.locData[O?"CommandSave":"LinkToFileGenerate"])
},afterrender:function(e){e.syncSize();
e.doLayout()
}}});
function q(){anonymFolderWindow.needSelectInGrid=false;
anonymFolderWindow.hide();
var e=gridAnonymLinks.getSelectionModel().getSelected();
if(e){anonymFolderWindow.isEditing=true;
anonymFolderWindow.currentData=e.data;
anonymFolderWindow.show()
}}if(htcConfig.publicEnabled&&checkPrivilege("ModifyAnonymFolders")){var F=100,H;
n.add({title:htcConfig.locData.AdminAnonymFoldersTab,id:"anonym-tab",layout:"fit",items:[gridAnonymLinks=new Ext.grid.GridPanel({header:true,headerCfg:{cls:"x-panel-tbar",html:String.format(htcConfig.locData.AdminAnonymFoldersDescription,htcConfig.relativePath+"Diagnostics.aspx#trAuthIISModeForAnonymDownload")},keys:{key:[Ext.EventObject.ENTER,Ext.EventObject.DELETE],fn:function(J){switch(J){case Ext.EventObject.ENTER:q();
break;
case Ext.EventObject.DELETE:removeButton=Ext.getCmp("remove-anonym-links");
if(removeButton&&!removeButton.disabled){removeButton.handler()
}break
}},scope:this},store:H=new Ext.data.DirectStore({remoteSort:true,baseParams:{start:0,limit:F},paramOrder:["start","limit","sort","dir"],directFn:HttpCommander.Admin.GetAnonymLinks,idProperty:"id",totalProperty:"total",successProperty:"success",root:"data",sortInfo:{field:"virt_path",direction:"ASC"},fields:[{name:"id",type:"int"},{name:"key",type:"string"},{name:"path",type:"string"},{name:"date",type:"date",dateFormat:"timestamp"},{name:"expires",type:"date",dateFormat:"timestamp"},{name:"withpasswd",type:"boolean"},{name:"password",type:"string"},{name:"acl",type:"int"},{name:"downloads",type:"string"},{name:"notes",type:"string"},{name:"emails",type:"string"},{name:"upload_overwrite",type:"boolean"},{name:"show_comments",type:"boolean"},{name:"isfolder",type:"boolean"},{name:"owner",type:"string"},{name:"isstale",type:"boolean"},{name:"virt_path",type:"string"},{name:"access_users",type:"string"},{name:"created_for",type:"string"},{name:"perms",mapping:"perms"},{name:"url",type:"string"},{name:"url2",type:"string"},{name:"shortUrl",type:"string"},{name:"shortUrl2",type:"string"}]}),viewConfig:{forceFit:true},multiSelect:false,border:false,loadMask:true,autoExpandColumn:"anonym-path",width:352,height:212,selModel:new Ext.grid.RowSelectionModel({singleSelect:true,listeners:{selectionchange:function(K){var e=gridAnonymLinks.getTopToolbar();
if(e){var J=K.getCount()<=0;
var L=e.findById("remove-anonym-links");
if(L){L.setDisabled(J)
}var M=e.findById("edit-anonym-link");
if(M){M.setDisabled(J)
}}}}}),bbar:new Ext.PagingToolbar({pageSize:F,store:H,displayInfo:true,beforePageText:htcConfig.locData.PagingToolbarBeforePageText,afterPageText:htcConfig.locData.PagingToolbarAfterPageText,firstText:htcConfig.locData.PagingToolbarFirstText,prevText:htcConfig.locData.PagingToolbarPrevText,nextText:htcConfig.locData.PagingToolbarNextText,lastText:htcConfig.locData.PagingToolbarLastText,displayMsg:htcConfig.locData.PagingToolbarDisplayMsg,refreshText:htcConfig.locData.CommandRefresh,emptyMsg:htcConfig.locData.PagingToolbarEmptyMsg}),tbar:{enableOverflow:true,items:[{text:htcConfig.locData.CommandRefresh,icon:HttpCommander.Lib.Utils.getIconPath(this,"refresh"),handler:function(){gridAnonymLinks.getStore().reload()
}},{id:"add-anonym-link",text:htcConfig.locData.CommonButtonCaptionAdd+"...",icon:HttpCommander.Lib.Utils.getIconPath(this,"add"),handler:function(){anonymFolderWindow.needSelectInGrid=false;
anonymFolderWindow.hide();
anonymFolderWindow.isEditing=false;
anonymFolderWindow.currentData=undefined;
anonymFolderWindow.show()
}},{id:"edit-anonym-link",text:htcConfig.locData.CommandMenuEdit+"...",icon:HttpCommander.Lib.Utils.getIconPath(this,"editanonymousefolder"),disabled:true,handler:q},{id:"remove-anonym-links",text:htcConfig.locData.CommandDelete,icon:HttpCommander.Lib.Utils.getIconPath(this,"remove"),disabled:true,handler:function(){var e={ids:[]};
Ext.each(gridAnonymLinks.getSelectionModel().getSelections(),function(J){e.ids.push(J.get("id"))
});
if(e.ids.length<=0){return
}Ext.Msg.show({title:htcConfig.locData.CommonConfirmCaption,msg:String.format(htcConfig.locData.AdminAnonymFoldersDeleteFolderPrompt,e.ids.length),buttons:Ext.Msg.YESNO,icon:Ext.Msg.QUESTION,fn:function(J){if(J=="yes"){gridAnonymLinks.loadMask.msg=htcConfig.locData.ProgressDeleting+"...";
gridAnonymLinks.loadMask.show();
HttpCommander.Admin.DeleteAnonymLinks(e,function(L,K){gridAnonymLinks.loadMask.hide();
gridAnonymLinks.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
HttpCommander.Lib.Utils.checkDirectHandlerResult(L,K,Ext.Msg,htcConfig);
gridAnonymLinks.getStore().reload()
})
}}})
}},{text:htcConfig.locData.AdminCommandHelp,icon:HttpCommander.Lib.Utils.getIconPath(this,"help"),handler:function(){navigateHelpAdminPanelWithFragment("publicfolders")
}}]},plugins:[new Ext.ux.grid.GridFilters({menuFilterText:htcConfig.locData.MenuFilterText,encode:false,local:true,filters:[{dataIndex:"path",type:"string",emptyText:htcConfig.locData.EmptyTextFilter},{dataIndex:"virt_path",type:"string",emptyText:htcConfig.locData.EmptyTextFilter},{dataIndex:"access_users",type:"string",emptyText:htcConfig.locData.EmptyTextFilter},{dataIndex:"isfolder",type:"boolean",yesText:htcConfig.locData.CommonValueTypeFolder,noText:htcConfig.locData.CommandFile},{dataIndex:"owner",type:"string",emptyText:htcConfig.locData.EmptyTextFilter},{dataIndex:"date",type:"date",afterText:htcConfig.locData.AfterDateFilterText,beforeText:htcConfig.locData.BeforeDateFilterText,onText:htcConfig.locData.OnDateFilterText},{dataIndex:"expires",type:"date",afterText:htcConfig.locData.AfterDateFilterText,beforeText:htcConfig.locData.BeforeDateFilterText,onText:htcConfig.locData.OnDateFilterText},{dataIndex:"withpasswd",type:"boolean",yesText:htcConfig.locData.ExtMsgButtonTextYES,noText:htcConfig.locData.ExtMsgButtonTextNO},{dataIndex:"downloads",type:"numeric",menuItemCfgs:{emptyText:htcConfig.locData.EmptyTextFilter}},{dataIndex:"notes",type:"string",emptyText:htcConfig.locData.EmptyTextFilter},{dataIndex:"emails",type:"string",emptyText:htcConfig.locData.EmptyTextFilter},{dataIndex:"show_comments",type:"boolean",yesText:htcConfig.locData.ExtMsgButtonTextYES,noText:htcConfig.locData.ExtMsgButtonTextNO},{dataIndex:"created_for",type:"string",emptyText:htcConfig.locData.EmptyTextFilter}]})],colModel:new Ext.grid.ColumnModel({defaults:{sortable:true},columns:[{id:"anonym-id",header:"Id",dataIndex:"id",hidden:true},{id:"anonym-path",width:150,header:htcConfig.locData.LogsGridPhysPathColumn,dataIndex:"path",renderer:wordWrapRenderer},{id:"anonym-vpath",width:150,header:htcConfig.locData.CommonFieldLabelPath,dataIndex:"virt_path",hidden:true,renderer:wordWrapRenderer},{id:"anonym-type",header:htcConfig.locData.CommonFieldLabelType,dataIndex:"isfolder",width:60,renderer:function(N,e,M,L,K,J){return htcConfig.locData[(N?"CommonValueTypeFolder":"CommandFile")]
}},{id:"anonym-owner",header:htcConfig.locData.AdminAnonymFoldersLinkOwnerColumn,dataIndex:"owner",renderer:htmlEncodeRenderer,width:60},{id:"anonym-datecreated",header:htcConfig.locData.AnonymousViewLinksDateCreatedColumn,dataIndex:"date",renderer:dateRendererLocal,width:125,hidden:true},{id:"anonym-dateexpired",header:htcConfig.locData.AnonymousViewLinksDateExpiredColumn,dataIndex:"expires",renderer:function(N,e,M,L,K,J){if(e&&M&&M.get("isstale")){e.css="empty-lang-value"
}return dateRendererLocal(N,e,M,L,K,J)
},width:125},{id:"anonym-with-passwd",header:htcConfig.locData.CommonFieldLabelPassword,dataIndex:"withpasswd",renderer:booleanRenderer,width:45,align:"center"},{id:"anonym-created-for",header:htcConfig.locData.AdminAnonymFoldersCreatedForColumn,dataIndex:"created_for",hidden:true,width:100,renderer:htmlEncodeRenderer},{id:"anonym-permission",header:htcConfig.locData.AnonymousViewLinksPermissionColumn,dataIndex:"acl",width:150,renderer:function(O,e,N,M,K,J){var L="";
if((O&1)!=0){L+=htcConfig.locData.PublicFolderAnonymViewContent
}if((O&2)!=0){L+=(L==""?"":", ")+htcConfig.locData.PublicFolderAnonymDownload
}if((O&4)!=0){L+=(L==""?"":", ")+htcConfig.locData.PublicFolderAnonymUpload+String.format(htcConfig.locData.AdminAnonymFoldersOverwriteOnUploadHint,htcConfig.locData[N.get("upload_overwrite")==true?"AdminFoldersRestrictionAllow":"AdminFoldersRestrictionDeny"])
}if((O&8)!=0){L+=(L==""?"":", ")+htcConfig.locData.PublicFolderAnonymZipDownload
}return String.format("<span style='white-space: normal;'>{0}</span>",L)
}},{id:"anonym-show-comments",header:htcConfig.locData.AnonymousLinkShowCommentsShort,dataIndex:"show_comments",hidden:true,width:50,align:"center",renderer:booleanRenderer},{id:"anonym-downloaded",header:htcConfig.locData.AnonymousViewLinksDownloadedColumn,dataIndex:"downloads",hidden:true,renderer:htmlEncodeRenderer},{id:"anonym-notes",header:htcConfig.locData.PublicFolderNoteForUsers,dataIndex:"notes",renderer:htmlEncodeRenderer,hidden:true},{id:"anonym-emails",header:htcConfig.locData.AdminAnonymFoldersEmailsColumn,dataIndex:"emails",renderer:htmlEncodeRenderer,hidden:true},{id:"anonym-access-for-users",header:htcConfig.locData.AdminAnonymFoldersAccessForUsersColumn,dataIndex:"access_users",renderer:htmlEncodeRenderer,hidden:true},{id:"anonym-keys",header:htcConfig.locData.AdminAnonymFoldersKeysColumn,dataIndex:"key",width:150,hidden:true,renderer:htmlEncodeRenderer}]}),listeners:{rowdblclick:q}})]})
}editUserHandler=function(){if(!denyEditAD){var J=gridUsers.getSelectionModel().getSelected();
if(!J||!J.data){return
}if(!Ext.isArray(J.data.groups)){var e={name:J.data.name};
gridUsers.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
gridUsers.loadMask.show();
HttpCommander.Admin.GetUserGroups(e,function(M,L){gridUsers.loadMask.hide();
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(M,L,Ext.Msg,htcConfig)){var K=[];
Ext.each(M.groups||[],function(N){if(Ext.isArray(N)&&N.length>0&&!Ext.isEmpty(N[0])){K.push(N[0])
}});
J.set("groups",K);
J.commit();
prepareEditUserWindow(J.data);
editUserWindow.show()
}})
}else{prepareEditUserWindow(J.data);
editUserWindow.show()
}}};
if(checkPrivilege("ModifyAccounts")){n.add({title:htcConfig.locData.CommonFieldLabelUsers,layout:"fit",id:"users-tab",items:[gridUsers=new Ext.grid.GridPanel({header:htcConfig.hcAuthMode=="forms"&&htcConfig.licenseInfo&&htcConfig.licenseInfo.usersCount>=0,headerCfg:htcConfig.hcAuthMode=="forms"&&htcConfig.licenseInfo&&htcConfig.licenseInfo.usersCount>=0?{cls:"x-panel-tbar",html:'<div style="color:red;">'+String.format(htcConfig.locData.AdminUsersLicenseRestriction,htcConfig.licenseInfo.usersCount)+"</div>"}:undefined,store:new Ext.data.DirectStore({directFn:HttpCommander.Admin.GetUsers,fields:[{name:"name",type:"string"},{name:"email",type:"string"},{name:"icon",type:"string"},{name:"customField",type:"string"},{name:"groups"}],baseParams:{showGroups:true},listeners:{datachanged:function(J){var e=gridUsers.getBottomToolbar(),L=J.getTotalCount();
if(e){if(htcConfig.hcAuthMode=="forms"&&htcConfig.licenseInfo&&htcConfig.licenseInfo.usersCount>=0){e.items.items[0].setText(String.format(htcConfig.locData.AdminUsersCountInfoWithLimit,L,htcConfig.licenseInfo.usersCount),false)
}else{e.items.items[0].setText(String.format(htcConfig.locData.AdminUsersCountInfo,L),false)
}}if(htcConfig.hcAuthMode=="forms"){var K=gridUsers.getTopToolbar();
if(K){if(htcConfig.licenseInfo&&htcConfig.licenseInfo.usersCount>=0){K.items.items[1].setDisabled(L>=htcConfig.licenseInfo.usersCount)
}else{K.items.items[1].setDisabled(false)
}}}}}}),viewConfig:{forceFit:true},multiSelect:false,border:false,loadMask:true,enableHdMenu:false,autoExpandColumn:"name",width:352,height:212,selModel:new Ext.grid.RowSelectionModel({singleSelect:denyEditAD?true:false,listeners:{selectionchange:function(N){var M=gridUsers.getTopToolbar(),K,P,R,O,S,e=N.getCount()==0,J=N.getCount()!=1,Q=e||denyEditAD,L=J||denyEditAD;
if(M){K=M.getComponent("remove-user");
if(K){K.setDisabled(Q)
}P=M.getComponent("edit-user");
if(P){P.setDisabled(L)
}R=M.getComponent("set-user-password");
if(R){R.setDisabled(L)
}O=M.getComponent("view-groups");
if(O){O.setDisabled(J)
}S=M.getComponent("view-folders");
if(S){S.setDisabled(J)
}}}}}),keys:{key:[Ext.EventObject.ENTER],fn:function(J){switch(J){case Ext.EventObject.ENTER:editUserHandler();
break
}},scope:this},bbar:{items:[{xtype:"label",html:"&nbsp;"}]},tbar:{enableOverflow:true,items:[{text:htcConfig.locData.CommandRefresh,icon:HttpCommander.Lib.Utils.getIconPath(this,"refresh"),handler:function(){gridUsers.getStore().reload()
}},{text:htcConfig.locData.AdminCommandAddUser+"...",icon:HttpCommander.Lib.Utils.getIconPath(this,"add"),hidden:denyEditAD,handler:function(){prepareAddUserWindow();
addUserWindow.show()
}},{text:htcConfig.locData.AdminUsersEditUser+"...",itemId:"edit-user",icon:HttpCommander.Lib.Utils.getIconPath(this,"edituser"),disabled:true,hidden:denyEditAD,handler:editUserHandler},{itemId:"remove-user",text:htcConfig.locData.AdminCommandRemoveUser,icon:HttpCommander.Lib.Utils.getIconPath(this,"remove"),disabled:true,hidden:denyEditAD,handler:function(){var J=gridUsers.getSelectionModel().getSelections();
var K=[];
Ext.each(J,function(L){K.push(L.data.name)
});
var e={};
e.names=K;
Ext.Msg.show({title:htcConfig.locData.CommonConfirmCaption,msg:String.format(htcConfig.locData.AdminUsersDeleteUserPrompt,Ext.util.Format.htmlEncode(K.join('", "'))),buttons:Ext.Msg.YESNO,icon:Ext.MessageBox.QUESTION,fn:function(L){if(L=="yes"){gridUsers.loadMask.msg=htcConfig.locData.ProgressDeleting+"...";
gridUsers.loadMask.show();
HttpCommander.Admin.DeleteUser(e,function(O,M){gridUsers.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
gridUsers.loadMask.hide();
if(typeof O=="undefined"||!O){Ext.Msg.alert(htcConfig.locData.CommonErrorCaption,Ext.util.Format.htmlEncode(M.message));
return
}var N=O.status!="success";
var P=String.format(htcConfig.locData.AdminUsersDeletedUsers,O.deleted);
if(N){P=O.message+"<br />"+P
}Ext.Msg.show({title:htcConfig.locData[N?"CommonErrorCaption":"AdminCommandRevomeUser"],msg:P,icon:N?Ext.Msg.ERROR:Ext.Msg.INFO,buttons:Ext.Msg.OK,fn:function(Q){if(O.deleted&&O.deleted>0){gridUsers.getStore().reload()
}}})
})
}}})
}},{itemId:"set-user-password",text:htcConfig.locData.AdminUsersSetUserPassword+"...",icon:HttpCommander.Lib.Utils.getIconPath(this,"passwordreset"),disabled:true,hidden:denyEditAD,handler:function(){var e=gridUsers.getSelectionModel().getSelected();
prepareSetUserPasswordWindow(e.data);
setUserPasswordWindow.show()
}},{itemId:"view-groups",text:htcConfig.locData.AdminUsersViewGroups,icon:HttpCommander.Lib.Utils.getIconPath(this,"group"),disabled:true,handler:function(){var J=gridUsers.getSelectionModel().getSelected();
var e={name:J.data.name};
gridUsers.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
gridUsers.loadMask.show();
HttpCommander.Admin.GetUserGroups(e,function(M,L){gridUsers.loadMask.hide();
if(!HttpCommander.Lib.Utils.checkDirectHandlerResult(M,L,Ext.Msg,htcConfig)){return
}var K=[];
Ext.each(M.groups||[],function(O){if(Ext.isArray(O)&&O.length>0&&!Ext.isEmpty(O[0])){K.push(O[0])
}});
J.set("groups",K);
J.commit();
var N=new Ext.Window({title:Ext.util.Format.htmlEncode(e.name),modal:true,width:320,height:400,closable:true,closeAction:"close",layout:{type:"vbox",align:"stretch"},plain:true,items:[new Ext.grid.GridPanel({flex:1,viewConfig:{forceFit:true},multiSelect:false,border:false,store:new Ext.data.ArrayStore({autoDestroy:true,idIndex:0,fields:["name"],data:M.groups}),columns:[{id:"name",sortable:true,header:htcConfig.locData.CommonFieldLabelGroupName,width:100,dataIndex:"name",renderer:function(P,Q,O){return"<img src='"+HttpCommander.Lib.Utils.getIconPath(htcConfig,"group")+"' class='filetypeimage' />"+Ext.util.Format.htmlEncode(P)
}}]})],buttons:[{text:htcConfig.locData.CommonButtonCaptionClose,handler:function(){N.close()
}}]});
N.show()
})
}},{itemId:"view-folders",text:htcConfig.locData.AdminUsersViewFolders,icon:HttpCommander.Lib.Utils.getIconPath(this,"viewfolders"),disabled:true,handler:function(){if(!userFoldersWindow){return
}var e=gridUsers.getSelectionModel().getSelected();
if(!e||!e.data){return
}userFoldersWindow.hide();
userFoldersWindow.showFolders(e.data.name,false)
}},{text:htcConfig.locData.AdminCommandHelp,icon:HttpCommander.Lib.Utils.getIconPath(this,"help"),handler:function(){navigateHelpAdminPanelWithFragment("users")
}}]},columns:[{id:"name",sortable:true,header:htcConfig.locData.CommonFieldLabelName,width:100,dataIndex:"name",renderer:function(J,K,e){return"<img src='"+htcConfig.relativePath+e.data.icon+"' class='filetypeimage' />"+Ext.util.Format.htmlEncode(J)
}},{id:"groups",width:150,header:htcConfig.locData.AdminUsersGroups,dataIndex:"groups",renderer:htmlEncodeRenderer}],listeners:{rowdblclick:function(K,J,L){editUserHandler()
}}})]})
}if(checkPrivilege("ModifyFolders")||htcConfig.adminFoldersExists||checkPrivilege("ModifyAccounts")){try{userFoldersWindow=HttpCommander.Lib.AdminUserFoldersWindow({htcConfig:htcConfig,wordWrapRenderer:wordWrapRenderer,getLoadMask:function(){return typeof gridUsers!="undefined"?gridUsers.loadMask:null
}})
}catch(D){if(debugmode||window.onerror){throw D
}}}editGroupHandler=function(){if(!gridGroups||!groupWindow){return
}var e=gridGroups.getSelectionModel().getSelected();
if(!e||!e.data){return
}if(!e.data.users||e.data.users.length==0){var J={name:e.data.name};
gridGroups.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
gridGroups.loadMask.show();
HttpCommander.Admin.GetGroupUsers(J,function(L,K){gridGroups.loadMask.hide();
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(L,K,Ext.Msg,htcConfig)){e.set("users",L.users);
e.commit();
if(prepareGroupWindow(e.data)){groupWindow.show()
}}})
}else{if(prepareGroupWindow(e.data)){groupWindow.show()
}}};
if(checkPrivilege("ModifyAccounts")){n.add({title:htcConfig.locData.CommonFieldLabelGroups,layout:"fit",id:"groups-tab",items:[gridGroups=new Ext.grid.GridPanel({store:new Ext.data.DirectStore({directFn:HttpCommander.Admin.GetGroups,fields:[{name:"name",type:"string"},{name:"users"},{name:"icon",type:"string"},{name:"customField",type:"string"}],listeners:{datachanged:function(J){var e=gridGroups.getBottomToolbar();
if(e){e.items.items[0].setText(String.format(htcConfig.locData.AdminGroupsCountInfo,J.getTotalCount()),false)
}}}}),viewConfig:{forceFit:true},multiSelect:false,border:false,loadMask:true,enableHdMenu:false,autoExpandColumn:"name",width:352,height:212,selModel:new Ext.grid.RowSelectionModel({singleSelect:denyEditAD?true:false,listeners:{selectionchange:function(M){var L=gridGroups.getTopToolbar(),J,N,O,P=M.getCount()==0,e=M.getCount()!=1,Q=P||denyEditAD,K=e||denyEditAD;
if(L){J=L.getComponent("remove-group");
N=L.getComponent("edit-group");
O=L.getComponent("view-users");
gpb=L.getComponent("group-properties");
if(J){J.setDisabled(Q)
}if(N){N.setDisabled(K)
}if(O){O.setDisabled(e)
}if(gpb){gpb.setDisabled(e)
}}}}}),keys:{key:[Ext.EventObject.ENTER],fn:function(J){switch(J){case Ext.EventObject.ENTER:editGroupHandler();
break
}},scope:this},bbar:{items:[{xtype:"label",html:"&nbsp;"}]},tbar:{enableOverflow:true,items:[{text:htcConfig.locData.CommandRefresh,icon:HttpCommander.Lib.Utils.getIconPath(this,"refresh"),handler:function(){gridGroups.getStore().reload()
}},{text:htcConfig.locData.AdminCommandAddGroup+"...",icon:HttpCommander.Lib.Utils.getIconPath(this,"add"),hidden:denyEditAD,handler:function(){prepareGroupWindow(null);
groupWindow.show()
}},{text:htcConfig.locData.AdminGroupsEditGroup+"...",itemId:"edit-group",icon:HttpCommander.Lib.Utils.getIconPath(this,"editgroup"),disabled:true,hidden:denyEditAD,handler:editGroupHandler},{itemId:"remove-group",text:htcConfig.locData.AdminGroupsRemoveGroup,icon:HttpCommander.Lib.Utils.getIconPath(this,"remove"),disabled:true,hidden:denyEditAD,handler:function(){var K=gridGroups.getSelectionModel().getSelections();
var J=[];
Ext.each(K,function(L){J.push(L.data.name)
});
var e={};
e.names=J;
Ext.Msg.show({title:htcConfig.locData.CommonConfirmCaption,msg:String.format(htcConfig.locData.AdminGroupsDeleteGroupPrompt,Ext.util.Format.htmlEncode(J.join('", "'))),buttons:Ext.Msg.YESNO,icon:Ext.MessageBox.QUESTION,fn:function(L){if(L=="yes"){gridGroups.loadMask.msg=htcConfig.locData.ProgressDeleting+"...";
gridGroups.loadMask.show();
HttpCommander.Admin.DeleteGroup(e,function(O,M){gridGroups.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
gridGroups.loadMask.hide();
if(typeof O=="undefined"||!O){Ext.Msg.alert(htcConfig.locData.CommonErrorCaption,Ext.util.Format.htmlEncode(M.message));
return
}var N=O.status!="success";
var P=String.format(htcConfig.locData.AdminGroupsDeletedGroups,O.deleted);
if(N){P=O.message+"<br />"+P
}Ext.Msg.show({title:htcConfig.locData[N?"CommonErrorCaption":"AdminGroupsRemoveGroup"],msg:P,icon:N?Ext.Msg.ERROR:Ext.Msg.INFO,buttons:Ext.Msg.OK,fn:function(Q){if(O.deleted&&O.deleted>0){gridGroups.getStore().reload()
}}})
})
}}})
}},{itemId:"group-properties",text:htcConfig.locData.AdminGroupsProperties,icon:HttpCommander.Lib.Utils.getIconPath(this,"details"),hidden:!denyEditAD,disabled:true,handler:editGroupHandler},{itemId:"view-users",text:htcConfig.locData.AdminGroupsViewUsers,icon:HttpCommander.Lib.Utils.getIconPath(this,"user"),hidden:htcConfig.hcAuthMode=="none"||htcConfig.hcAuthMode=="forms"||htcConfig.hcAuthMode=="shibboleth",disabled:true,handler:editGroupHandler},{text:htcConfig.locData.AdminCommandHelp,icon:HttpCommander.Lib.Utils.getIconPath(this,"help"),handler:function(){navigateHelpAdminPanelWithFragment("users")
}}]},columns:[{id:"name",sortable:true,header:htcConfig.locData.CommonFieldLabelName,width:100,dataIndex:"name",renderer:function(J,K,e){return"<img src='"+htcConfig.relativePath+e.data.icon+"' class='filetypeimage' />"+Ext.util.Format.htmlEncode(J)
}},{id:"users",width:150,header:htcConfig.locData.CommonFieldLabelUsers,dataIndex:"users",renderer:htmlEncodeRenderer}],listeners:{rowdblclick:function(K,J,L){editGroupHandler()
}}})]})
}var B=200;
if(htcConfig.logs&&checkPrivilege("ViewLog")){var u,c=function(L){if(!u){return
}var J=Ext.getCmp("startdt"),N,M=Ext.getCmp("enddt"),O;
if(J){N=J.getValue();
if(Ext.isDate(N)){N=N.clearTime().getTime()
}else{N=null
}}if(M){O=M.getValue();
if(Ext.isDate(O)){O=O.clearTime().add(Date.DAY,1).add(Date.SECOND,-1).getTime()
}else{O=null
}}var K=Ext.apply({begin:N,end:O},L||{});
u.setBaseParam("begin",N);
u.setBaseParam("end",O);
if(u.baseParams.sort){K.sort=u.baseParams.sort
}if(u.baseParams.dir){K.dir=u.baseParams.dir
}if(!Ext.isDefined(K.start)){K.start=u.baseParams.start||0
}if(!Ext.isDefined(K.limit)){K.limit=u.baseParams.limit||B
}u.storeOptions(K);
u.load({params:K})
};
u=new Ext.data.DirectStore({directFn:HttpCommander.Admin.GetLog,remoteSort:true,baseParams:{start:0,limit:B,sort:"date",dir:"DESC",begin:null,end:null},len:6,paramOrder:["start","limit","sort","dir","begin","end"],totalProperty:"total",root:"data",paramNames:{start:"start",limit:"limit",sort:"sort",dir:"dir",begin:"begin",end:"end"},fields:[{name:"id",type:"int"},{name:"user",type:"string"},{name:"action",type:"string"},{name:"date",type:"date",dateFormat:"timestamp"},{name:"path",type:"string"},{name:"phys_path",type:"string"},{name:"is_folder",type:"boolean"},{name:"is_public",type:"boolean"},{name:"by_webdav",type:"boolean"},{name:"more_info",type:"string"}],sortInfo:{field:"date",direction:"DESC"},listeners:{load:function(J,e,K){if(!!J&&!!J.reader&&!!J.reader.jsonData&&!J.reader.jsonData.success){Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:J.reader.jsonData.message,icon:Ext.Msg.ERROR,buttons:Ext.Msg.OK})
}},exception:function(L,M,O,J,K,e){if(M==="remote"&&K&&K.message){var N="Message: "+Ext.util.Format.htmlEncode(K.message);
if(K.xhr){N="Status: "+Ext.util.Format.htmlEncode(K.xhr.status)+" "+Ext.util.Format.htmlEncode(K.xhr.statusText)+"<br />"+N
}Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:N,icon:Ext.Msg.ERROR,buttons:Ext.Msg.OK})
}}}});
n.add({title:htcConfig.locData.AdminLogsTab,id:"log-tab",layout:"border",items:[gridLog=new Ext.grid.GridPanel({store:u,loadStore:c,viewConfig:{forceFit:true},multiSelect:false,layout:"fit",border:false,loadMask:true,enableHdMenu:true,autoExpandColumn:"info",region:"center",selModel:new Ext.grid.RowSelectionModel({singleSelect:true,listeners:{selectionchange:function(e){if(e.getCount()==0){logDetailsPanel.update("")
}else{var J=Ext.util.Format.htmlEncode(e.getSelected().data.more_info);
if(!Ext.isEmpty(J)){J=J.replace(/\r\n|\n\r|\n/gi,"<br />")
}logDetailsPanel.update(J)
}}}}),columns:[{id:"id",sortable:true,header:"Id",width:30,hidden:true,dataIndex:"id"},{id:"user",sortable:true,header:htcConfig.locData.CommonFieldLabelUserName,width:40,dataIndex:"user",renderer:htmlEncodeRenderer},{id:"type",sortable:true,width:30,header:htcConfig.locData.CommonFieldLabelType,dataIndex:"action",renderer:htmlEncodeRenderer},{id:"date",sortable:true,width:70,header:htcConfig.locData.CommonFieldLabelDateTime,dataIndex:"date",renderer:dateRendererLocal},{id:"path",sortable:true,width:85,header:htcConfig.locData.CommonFieldLabelPath,dataIndex:"path",renderer:wordWrapRenderer},{id:"phys_path",sortable:true,width:85,header:htcConfig.locData.LogsGridPhysPathColumn,dataIndex:"phys_path",renderer:wordWrapRenderer},{id:"folder",sortable:true,width:25,header:htcConfig.locData.LogsGridIsFolderColumn,dataIndex:"is_folder",renderer:booleanRenderer},{id:"public",sortable:true,width:25,header:htcConfig.locData.LogsGridIsPublicColumn,dataIndex:"is_public",renderer:booleanRenderer},{id:"webdav",sortable:true,width:25,header:htcConfig.locData.LogsGridByWebDavColumn,dataIndex:"by_webdav",renderer:booleanRenderer},{id:"info",sortable:true,width:250,header:htcConfig.locData.LogsGridMoreInfoColumn,dataIndex:"more_info",hidden:true,renderer:wordWrapRenderer}],tbar:[{xtype:"label",html:htcConfig.locData.SearchByDateFrom+":&nbsp;"},{hideLabel:true,width:90,xtype:"datefield",name:"startdt",id:"startdt",vtype:"daterange",endDateField:"enddt",value:new Date(),editable:false,listeners:{select:function(){c()
}}},{xtype:"label",html:"&nbsp;&nbsp;"+htcConfig.locData.SearchByDateTo+":&nbsp;"},{hideLabel:true,width:90,xtype:"datefield",name:"enddt",id:"enddt",vtype:"daterange",startDateField:"startdt",value:new Date(),editable:false,listeners:{select:function(){c()
}}}," ",{text:htcConfig.locData.CommonForToday,handler:function(){var K=new Date(),J=Ext.getCmp("startdt"),L=Ext.getCmp("enddt");
if(K>=L.getValue()){L.setValue(K);
J.setValue(K)
}else{J.setValue(K);
L.setValue(K)
}c()
}},"->",{text:htcConfig.locData.CommandRefresh,icon:HttpCommander.Lib.Utils.getIconPath(this,"refresh"),handler:function(){c({start:0,limit:B})
}}],plugins:[new Ext.ux.grid.GridFilters({menuFilterText:htcConfig.locData.MenuFilterText,local:true,filters:[{type:"numeric",dataIndex:"id",menuItemCfgs:{emptyText:htcConfig.locData.EmptyTextFilter}},{type:"string",dataIndex:"user",emptyText:htcConfig.locData.EmptyTextFilter},{type:"string",dataIndex:"action",emptyText:htcConfig.locData.EmptyTextFilter},{type:"date",dataIndex:"date",afterText:htcConfig.locData.AfterDateFilterText,beforeText:htcConfig.locData.BeforeDateFilterText,onText:htcConfig.locData.OnDateFilterText},{type:"string",dataIndex:"path",emptyText:htcConfig.locData.EmptyTextFilter},{type:"string",dataIndex:"phys_path",emptyText:htcConfig.locData.EmptyTextFilter},{dataIndex:"is_folder",type:"boolean",yesText:htcConfig.locData.YesBooleanFilterText,noText:htcConfig.locData.NoBooleanFilterText},{dataIndex:"is_public",type:"boolean",yesText:htcConfig.locData.YesBooleanFilterText,noText:htcConfig.locData.NoBooleanFilterText},{dataIndex:"by_webdav",type:"boolean",yesText:htcConfig.locData.YesBooleanFilterText,noText:htcConfig.locData.NoBooleanFilterText},{type:"string",dataIndex:"more_info",emptyText:htcConfig.locData.EmptyTextFilter}]})],bbar:new Ext.PagingToolbar({pageSize:B,store:u,displayInfo:true,beforePageText:htcConfig.locData.PagingToolbarBeforePageText,afterPageText:htcConfig.locData.PagingToolbarAfterPageText,firstText:htcConfig.locData.PagingToolbarFirstText,prevText:htcConfig.locData.PagingToolbarPrevText,nextText:htcConfig.locData.PagingToolbarNextText,lastText:htcConfig.locData.PagingToolbarLastText,displayMsg:htcConfig.locData.PagingToolbarDisplayMsg,refreshText:htcConfig.locData.CommandRefresh,emptyMsg:htcConfig.locData.PagingToolbarEmptyMsg})}),logDetailsPanel=new Ext.Panel({title:htcConfig.locData.LogsGridDetailsTitle,region:"east",split:true,width:200,collapsible:true,collapseMode:"mini"})]})
}if(checkPrivilege("ViewErrorsLog")){var r=new Ext.data.DirectStore({directFn:HttpCommander.Admin.GetLogErrors,remoteSort:true,baseParams:{start:0,limit:B},len:4,paramOrder:["start","limit","sort","dir"],totalProperty:"total",root:"data",paramNames:{start:"start",limit:"limit",sort:"sort",dir:"dir"},fields:[{name:"type",type:"string"},{name:"date",type:"date"},{name:"url",type:"string"},{name:"msg",type:"string"},{name:"info",type:"string"}],sortInfo:{field:"date",direction:"DESC"},listeners:{datachanged:function(J){if(gridLogErrors){var e=gridLogErrors.getTopToolbar();
if(e){e.items.items[2].setVisible(J.getTotalCount()>0);
e.items.items[3].setVisible(J.getTotalCount()>0&&htcConfig.usersCountExceeded===true)
}}}}});
n.add({title:htcConfig.locData.AdminLogsErrorsTab,id:"log-errors-tab",layout:"border",items:[gridLogErrors=new Ext.grid.GridPanel({store:r,viewConfig:{forceFit:true},multiSelect:false,border:false,loadMask:true,enableHdMenu:true,autoExpandColumn:"msg-le",region:"center",selModel:new Ext.grid.RowSelectionModel({singleSelect:true,listeners:{selectionchange:function(e){if(e.getCount()==0){logErrorsDetailsPanel.update("")
}else{var J=e.getSelected().data.info;
logErrorsDetailsPanel.update(J)
}}}}),columns:[{id:"type-le",sortable:true,header:htcConfig.locData.CommonFieldLabelType,width:180,dataIndex:"type",renderer:wordWrapRenderer},{id:"date-le",sortable:true,width:110,header:htcConfig.locData.CommonFieldLabelDateTime,dataIndex:"date",renderer:dateRendererLocal},{id:"url-le",sortable:true,width:250,header:htcConfig.locData.LogsErrorsGridUrlColumn,dataIndex:"url",renderer:wordWrapRenderer},{id:"msg-le",sortable:true,header:htcConfig.locData.LogsErrorsGridMsgColumn,width:350,dataIndex:"msg",renderer:wordWrapRenderer}],tbar:[{text:htcConfig.locData.CommandRefresh,icon:HttpCommander.Lib.Utils.getIconPath(this,"refresh"),handler:function(){gridLogErrors.getStore().reload()
}},"-",{text:htcConfig.locData.AdminLogsErrorsClearBtn,hidden:true,handler:function(){gridLogErrors.loadMask.show();
HttpCommander.Admin.ClearLogErrors(function(J,e){gridLogErrors.loadMask.hide();
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(J,e,Ext.Msg,htcConfig)){htcConfig.usersCountExceeded=false;
gridLogErrors.getStore().reload()
}})
}},{text:htcConfig.locData.AdminLogsErrorsClearUsersCountExceededBtn,hidden:true,handler:function(){gridLogErrors.loadMask.show();
HttpCommander.Admin.ClearUsersCountExceededErrors(function(J,e){gridLogErrors.loadMask.hide();
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(J,e,Ext.Msg,htcConfig)){htcConfig.usersCountExceeded=false;
gridLogErrors.getStore().reload()
}})
}}],plugins:[new Ext.ux.grid.GridFilters({menuFilterText:htcConfig.locData.MenuFilterText,local:true,filters:[{type:"string",dataIndex:"type",emptyText:htcConfig.locData.EmptyTextFilter},{type:"date",dataIndex:"date",afterText:htcConfig.locData.AfterDateFilterText,beforeText:htcConfig.locData.BeforeDateFilterText,onText:htcConfig.locData.OnDateFilterText},{type:"string",dataIndex:"url",emptyText:htcConfig.locData.EmptyTextFilter},{type:"string",dataIndex:"msg",emptyText:htcConfig.locData.EmptyTextFilter}]})],bbar:new Ext.PagingToolbar({pageSize:B,store:r,displayInfo:true,beforePageText:htcConfig.locData.PagingToolbarBeforePageText,afterPageText:htcConfig.locData.PagingToolbarAfterPageText,firstText:htcConfig.locData.PagingToolbarFirstText,prevText:htcConfig.locData.PagingToolbarPrevText,nextText:htcConfig.locData.PagingToolbarNextText,lastText:htcConfig.locData.PagingToolbarLastText,displayMsg:htcConfig.locData.PagingToolbarDisplayMsg,refreshText:htcConfig.locData.CommandRefresh,emptyMsg:htcConfig.locData.PagingToolbarEmptyMsg})}),logErrorsDetailsPanel=new Ext.Panel({title:htcConfig.locData.LogsErrorsGridDetailsTitle,region:"south",split:true,height:300,collapsible:true,collapseMode:"mini",autoScroll:true})]})
}if(checkPrivilege("ModifyLocalizations")){try{Ext.Direct.addProvider(HttpCommander.Remote.CommonHandler);
var A=function(M){M=M||"";
var K=Ext.getCmp("refresh-lang");
if(K){K.setDisabled(false)
}var J=Ext.getCmp("save-as-lang");
if(J){J.setDisabled(false)
}var L=Ext.getCmp("save-csv");
if(L){L.setDisabled(false)
}var e=Ext.getCmp("load-csv");
if(e){e.setDisabled(false)
}t.load({params:{lang:M,fromcsv:false}})
};
var p=new Ext.form.ComboBox({editable:false,width:140,triggerAction:"all",mode:"remote",store:new Ext.data.DirectStore({reader:new Ext.data.JsonReader({idProperty:"name",root:"data",fields:["name"]}),autoLoad:false,api:{read:HttpCommander.Common.LocalizationList},listeners:{load:function(){if(p.showLang){p.setValue(p.showLang);
A(p.showLang)
}p.showLang=null
}}}),valueField:"name",displayField:"name",tpl:'<tpl for="."><div class="x-combo-list-item">{name:htmlEncode}</div></tpl>',lazyInit:false,listeners:{beforeselect:function(K,e,J){if(gridLang.getStore().getModifiedRecords().length>0||(Ext.getCmp("save-lang")&&!Ext.getCmp("save-lang").disabled)){Ext.Msg.show({title:htcConfig.locData.AdminLangConfirmRefreshTitle,msg:htcConfig.locData.AdminLangConfirmRefreshMessage,buttons:Ext.Msg.YESNOCANCEL,fn:function(L){if(L=="yes"){o(K.getValue(),t,e.data.name)
}else{if(L=="no"){K.showLang=e.data.name;
K.getStore().reload()
}else{return false
}}}});
return false
}return true
},select:function(K,e,J){A(e.data.name)
}}});
var t=new Ext.data.DirectStore({directFn:HttpCommander.Admin.GetLocalizaion,remoteSort:false,baseParams:{lang:"",fromcsv:false},totalProperty:"total",paramOrder:["lang","fromcsv"],root:"data",successProperty:"success",fields:[{name:"key",type:"string"},{name:"val",type:"string"},{name:"def",type:"string"},{name:"isadm",type:"boolean"}],listeners:{beforeload:function(e){e.commitChanges()
},datachanged:function(e){if(gridLang){var J=0;
if(e&&typeof e.getTotalCount=="function"){J=e.getTotalCount()
}var L=gridLang.getBottomToolbar();
if(L){var K=0;
if(e.reader&&e.reader.jsonData&&Ext.isNumber(e.reader.jsonData.emptyKeys)){K=e.reader.jsonData.emptyKeys
}L.items.items[0].setText(String.format(htcConfig.locData.AdminLangAmountInfo,(J-K),J,K),false)
}}},load:function(J,e,K){var L=Ext.getCmp("save-lang");
if(L){L.setDisabled(true)
}if(!J.reader.jsonData.success){Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:Ext.util.Format.htmlEncode(J.reader.jsonData.error),icon:Ext.MessageBox.ERROR,buttons:Ext.Msg.OK})
}if(J.lastOptions.params.fromcsv){if(L){L.setDisabled(false)
}}J.lastOptions.params.fromcsv=false
},exception:function(L,M,O,J,K,e){if(M==="remote"){var N="Message: "+Ext.util.Format.htmlEncode(K.message);
if(K.xhr){N="Status: "+Ext.util.Format.htmlEncode(K.xhr.status)+" "+Ext.util.Format.htmlEncode(K.xhr.statusText)+"<br />"+N
}Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:N,icon:Ext.Msg.ERROR,buttons:Ext.Msg.OK})
}}}});
var o=function(N,K,M,e){if(!K||!K.getRange||K.getRange()==0){return
}N=N||"";
M=M||N;
var J={lang:N,ldata:[],toCsv:!!e};
var L=K.getRange();
Ext.each(L,function(O){J.ldata.push({key:O.data.key,val:Ext.util.Format.htmlDecode(O.data.val)})
});
gridLang.loadMask.msg=htcConfig.locData.ProgressSaving+"...";
gridLang.loadMask.show();
HttpCommander.Admin.SaveLangAs(J,function(P,O){gridLang.loadMask.hide();
gridLang.loadMask.msg=htcConfig.locData.ProgressLoading+"...";
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(P,O,Ext.Msg,htcConfig)){p.showLang=M;
p.getStore().reload()
}})
};
n.add({title:htcConfig.locData.AdminLanguagesTab,id:"languages-tab",layout:"border",items:[gridLang=new Ext.grid.EditorGridPanel({store:t,clicksToEdit:1,pruneModifiedRecords:true,viewConfig:{forceFit:true},multiSelect:false,border:false,loadMask:true,enableHdMenu:true,autoExpandColumn:"val-lang",region:"center",selModel:new Ext.grid.RowSelectionModel({singleSelect:true}),columns:[{id:"key-lang",sortable:true,header:"<b>"+htcConfig.locData.AdminLangGridKeyColumn+"</b>",width:80,dataIndex:"key",renderer:function(K,e,J){e.css="";
if(J.data.isadm){e.css+=" admin-server-lang-record"
}return"<b>"+qtipCellRenderer(K,e,J)+"</b>"
}},{id:"val-lang",sortable:true,width:200,header:htcConfig.locData.CommonFieldLabelValue,dataIndex:"val",renderer:function(M,e,L,N,K,J){M=M||"";
e.css="";
if(M==""){e.css="empty-lang-value"
}else{if(L.data.isadm){e.css="admin-server-lang-record"
}}return String.format("<span style='white-space:normal;'>{0}</span>",Ext.util.Format.htmlEncode(M))
},editor:new Ext.form.TextArea({})},{id:"def-lang",sortable:true,width:200,header:htcConfig.locData.AdminLangGridDefaultColumn,dataIndex:"def",renderer:function(K,e,J){if(!K){K=""
}e.css="";
if(J.data.isadm){e.css="admin-server-lang-record"
}return String.format("<span style='white-space: normal;'>{0}</span>",Ext.util.Format.htmlEncode(K))
}}],bbar:{items:[{xtype:"label",html:"&nbsp;"}]},tbar:{xtype:"container",layout:"anchor",height:27*2,defaults:{height:27,anchor:"100%"},items:[new Ext.Toolbar({enableOverflow:true,items:[{xtype:"tbtext",html:htcConfig.locData.SettingsLanguage+":&nbsp;"},p,{id:"refresh-lang",text:htcConfig.locData.CommandRefresh,icon:HttpCommander.Lib.Utils.getIconPath(this,"refresh"),disabled:true,handler:function(){if(gridLang.getStore().getModifiedRecords().length>0){Ext.Msg.show({title:htcConfig.locData.AdminLangConfirmRefreshTitle,msg:htcConfig.locData.AdminLangConfirmRefreshMessage,buttons:Ext.Msg.YESNOCANCEL,fn:function(e){if(e=="yes"){o(p.getValue(),t)
}else{if(e=="no"){t.reload()
}}}})
}else{t.reload()
}}},{id:"save-lang",text:htcConfig.locData.CommandSave,disabled:true,icon:HttpCommander.Lib.Utils.getIconPath(this,"savetofile"),handler:function(){o(p.getValue(),t)
}},{id:"save-as-lang",text:htcConfig.locData.CommandSaveAs,disabled:true,icon:HttpCommander.Lib.Utils.getIconPath(this,"saveas"),handler:function(){Ext.Msg.prompt(htcConfig.locData.AdminEnterLanguageNameTitle,"",function(e,K){if(e=="ok"){var J=K.toString().trim();
if(J!=""){o(J,t)
}}})
}},{id:"save-csv",text:htcConfig.locData.AdminLangSaveToCSV,disabled:true,icon:HttpCommander.Lib.Utils.getIconPath(this,"savetofile"),handler:function(){o(p.getValue(),t,false,true)
}},{id:"load-csv",text:htcConfig.locData.AdminLangLoadFromCSV,disabled:true,icon:HttpCommander.Lib.Utils.getIconPath(this,"refresh"),handler:function(){t.load({params:{lang:p.getValue(),fromcsv:true}})
}},{text:htcConfig.locData.AdminCommandHelp,icon:HttpCommander.Lib.Utils.getIconPath(this,"help"),handler:function(){showHelpWindow("Manual/localization.html")
}}]}),new Ext.Toolbar({items:[{text:htcConfig.locData.AdminLanguagesTabMessage,xtype:"tbtext"}]})]},plugins:[new Ext.ux.grid.GridFilters({local:true,menuFilterText:htcConfig.locData.MenuFilterText,filters:[{type:"string",dataIndex:"key",emptyText:htcConfig.locData.EmptyTextFilter},{type:"string",dataIndex:"val",emptyText:htcConfig.locData.EmptyTextFilter},{type:"string",dataIndex:"def",emptyText:htcConfig.locData.EmptyTextFilter}]})],listeners:{afteredit:function(K){var J=Ext.getCmp("save-lang");
if(J){J.setDisabled(K.grid.getStore().getModifiedRecords().length==0)
}}}})]})
}catch(D){if(debugmode||window.onerror){throw D
}}}if(htcConfig.isFullAdmin){try{adminPermsTab=HttpCommander.Lib.AdminPermissions({htcConfig:htcConfig,promptUserName:promptUserName,promptGroupName:promptGroupName,navigateHelpAdminPanelWithFragment:navigateHelpAdminPanelWithFragment,identitiesRenderer:identitiesRenderer,htmlEncodeRenderer:htmlEncodeRenderer,getShowListForAllowedFolders:function(){return showListForAllowedFolders
}});
if(adminPermsTab){n.add(adminPermsTab)
}}catch(D){if(debugmode||window.onerror){throw D
}}try{n.add(HttpCommander.Lib.AdminDbMaintenance({htcConfig:htcConfig}))
}catch(D){if(debugmode||window.onerror){throw D
}}try{if(isWindowsVersion){n.add(HttpCommander.Lib.AdminMisc({htcConfig:htcConfig,getAjaxRequestTimeout:function(){return ajaxRequestTimeout
}}))
}}catch(D){if(debugmode||window.onerror){throw D
}}updateTab=HttpCommander.Lib.AdminUpdate({htcConfig:htcConfig,getAjaxRequestTimeout:function(){return ajaxRequestTimeout
}});
n.add(updateTab)
}n.doLayout();
Ext.QuickTips.init();
var a=[];
a.push(tbtnGoFileManager=new Ext.Toolbar.Button({text:htcConfig.locData.CommandFileManager,icon:HttpCommander.Lib.Utils.getIconPath(this,"fileman"),handler:function(){if(isControl&&controlUrl!=""){location.href=controlUrl
}else{if(!isControl){location.href=htcConfig.relativePath+"Default.aspx"
}}}}));
if(htcConfig.viewDiag){a.push(tbtnDiagnostics=new Ext.Toolbar.Button({text:htcConfig.locData.CommandDiagnostics,icon:HttpCommander.Lib.Utils.getIconPath(this,"diagnostics"),handler:function(){window.open(htcConfig.relativePath+"Diagnostics.aspx")
}}))
}if(htcConfig.allowRestart){a.push(tbtnRestartApplication=new Ext.Toolbar.Button({text:htcConfig.locData.CommandAppRestart,icon:HttpCommander.Lib.Utils.getIconPath(this,"restart"),handler:function(){b();
HttpCommander.Admin.RestartApplication(function(J,e){x();
if(HttpCommander.Lib.Utils.checkDirectHandlerResult(J,e,Ext.Msg,htcConfig)){Ext.Msg.alert(htcConfig.locData.CommonWarningCaption,htcConfig.locData.SettingsApplicationRestartedMsg)
}})
}}))
}if(htcConfig.isFullAdmin){a.push(tbtnLicenseInfo=new Ext.Toolbar.Button({text:htcConfig.locData.CommandLicenseInfo,icon:HttpCommander.Lib.Utils.getIconPath(this,adminPanelFirstLoad&&((htcConfig.showTrial&&htcConfig.demoExpired)||htcConfig.showUpgrade)?"keywarn":"key"),handler:function(){var e=htcConfig.locData.LicenseTrial;
var J=htcConfig.licenseInfo;
if(!htcConfig.showTrial&&J){if(J.usersCount<0){J.usersCount="Unlimited"
}e=String.format(htcConfig.locData.LicensePrompt,"<br />",J.usersCount,J.purchaseDate+(J.forVersion?("<br />For version: "+J.forVersion):""));
if(htcConfig.showUpgrade){e+=String.format(htcConfig.locData.LicenseCheckMessage,"//www.element-it.com/checklicense.aspx"+(!!J&&!!J.hash?("?key="+encodeURIComponent(J.hash)):""))
}else{if(J.daysForFreeUpgrade<0){e+="Your license type allow you to perform minor upgrades for free and major version upgrades with 50% discount.<br />"
}else{e+=String.format(htcConfig.locData.LicenseFreeUpgradeMessage,J.daysForFreeUpgrade)+"<br />"
}e+="<a href='//www.element-it.com/purchase.aspx?product=httpcommander' target='_blank'>HTTPCommander purchase page</a>"
}}else{e+=htcConfig.demoExpired?".<br /><b style='color:Red;'>Your evaluation period has expired!</b>":(".<br />Days left: "+htcConfig.trialDaysLeft)
}Ext.Msg.show({title:htcConfig.locData.LicenseTitle,msg:e,icon:Ext.Msg.INFO,buttons:Ext.Msg.OK})
}}));
a.push(tbtnBuyNow=new Ext.Toolbar.Button({text:htcConfig.locData.CommandBuyNow,icon:HttpCommander.Lib.Utils.getIconPath(this,"buynow"),handler:function(){window.open("//www.element-it.com/purchase.aspx?product=httpcommander")
}}))
}a.push({xtype:"label",html:'<div style="width:30px;"></div>'});
a.push(tbtnSaveSettingsMsg=new Ext.Toolbar.TextItem({text:htcConfig.locData.SettingsSettingsSaveNotif,hidden:true,style:{color:"red",fontWeight:"bold",fontSize:"1.2em"}}));
a.push({xtype:"tbfill"});
a.push(tbtnNewVersion=new Ext.Toolbar.Button({xtype:"button",hidden:true,text:'<span style="color:red;font-weight:bold;">'+htcConfig.locData.AdminNewVersionAvailableTitle+"</span>",handler:function(){try{var J=detectNewVersion();
if(Ext.isEmpty(J)){return
}var M=htcConfig.hccurrentversion.join(".");
var K=String.format(htcConfig.locData.AdminNewVersionAvailableInfo,"<b>"+M+"</b>","<b>"+J+"</b>")+'<br/><br/><a href="//www.element-it.com/httpcommander-changelog.aspx" target="_blank">Changelog page</a><br /><a href="//www.element-it.com/download.aspx?type='+encodeURIComponent(htcConfig.version||"st")+'" target="_blank">Dowload page</a><br /><a href="//www.element-it.com/checklicense.aspx'+(!!htcConfig.licenseInfo&&!!htcConfig.licenseInfo.hash?("?key="+encodeURIComponent(htcConfig.licenseInfo.hash)):"")+'" target="_blank">Check license page</a>';
Ext.Msg.show({title:htcConfig.locData.AdminNewVersionAvailableTitle,msg:K,icon:Ext.Msg.INFO,buttons:Ext.Msg.OK,fn:function(e){}})
}catch(L){}}}));
a.push(tbtnLiveSupport=new Ext.Toolbar.TextItem({hidden:typeof htcConfig=="undefined"||htcConfig.enableLiveSupport!==true,text:typeof htcConfig=="undefined"||htcConfig.enableLiveSupport!==true?"&nbsp;":String.format(liveSupportEl,htcConfig.licenseAndVersionQueryString)}));
a.push(tbtnLogout=new Ext.Toolbar.Button({xtype:"button",hidden:isControl,text:Ext.util.Format.htmlEncode(htcConfig.currentUser),tooltip:{text:htcConfig.locData.CommandLogoutHint,title:htcConfig.locData.CommandLogout},icon:HttpCommander.Lib.Utils.getIconPath(this,"logout"),handler:function(){location.href=htcConfig.relativePath+"Logout.aspx"
}}));
var v=new Ext.Panel({renderTo:Ext.getBody(),showHeader:false,layout:"border",margins:"5 0 0 0",height:Ext.getBody().getViewSize().height,items:[n,{region:"south",html:'<font color="red">'+Ext.util.Format.htmlEncode(htcConfig.locData.AdminCommonSettingsChangeWarning)+"</font>"+(htcConfig.allowedFoldersPaths&&htcConfig.allowedFoldersPaths.length>0?"<br/><br/><b>"+Ext.util.Format.htmlEncode(htcConfig.locData.AdminCommonAllowedFoldersPathsTitle)+":</b></br>"+Ext.util.Format.htmlEncode(htcConfig.allowedFoldersPaths):"")}],tbar:new Ext.Toolbar({enableOverflow:true,cls:"x-panel-header",height:typeof htcConfig=="undefined"||htcConfig.enableLiveSupport!==true?27:37,items:a}),listeners:{afterrender:function(e){z();
if((htcConfig.isFullAdmin||checkPrivilege("ViewErrorsLog"))&&htcConfig.usersCountExceeded===true){Ext.Msg.show({title:htcConfig.locData.CommonWarningCaption,msg:String.format(htcConfig.locData.AdminUsersCountExceededWarn,htcConfig.licenseInfo.usersCount,htcConfig.locData.AdminLogsErrorsTab,htcConfig.uniqueUsersCountExceededExceptionName),icon:Ext.Msg.WARNING,buttons:Ext.Msg.CANCEL})
}}}});
Ext.EventManager.onWindowResize(function(){var e=Ext.getBody();
v.setHeight(e.getViewSize().height);
v.setWidth(e.getViewSize().width)
},this)
});
function getDefaultPermission(b){var a={};
a=Ext.apply(a,getDefaultAAC());
a.identityName=b;
a.listRestriction={type:1,extensions:[]};
a.createRestriction={type:1,extensions:[]};
a.customField="";
return a
}function fillPermissionData(a,b){var c=b.getForm();
c.items.each(function(d){d.suspendEvents(false)
});
c.setValues(a);
b.findById("list-rest").setValue(a.listRestriction.type);
b.findById("list-ext").setValue(a.listRestriction.extensions.join(","));
b.findById("create-rest").setValue(a.createRestriction.type);
b.findById("create-ext").setValue(a.createRestriction.extensions.join(","));
if(a.customField){b.findById("folders-permissions-custom-field").setValue(a.customField)
}c.items.each(function(d){d.resumeEvents()
})
}function updatePermission(){var a=gridPerms.getSelectionModel().getSelected();
if(a){var b=fpPermissions.getForm().getValues();
a.data.permission.create=fpPermissions.findById("create").getValue();
a.data.permission.del=fpPermissions.findById("del").getValue();
a.data.permission.rename=fpPermissions.findById("rename").getValue();
a.data.permission.upload=fpPermissions.findById("upload").getValue();
a.data.permission.download=fpPermissions.findById("download").getValue();
a.data.permission.zipDownload=fpPermissions.findById("zipDownload").getValue();
a.data.permission.zip=fpPermissions.findById("zip").getValue();
a.data.permission.unzip=fpPermissions.findById("unzip").getValue();
a.data.permission.cut=fpPermissions.findById("cut").getValue();
a.data.permission.copy=fpPermissions.findById("copy").getValue();
a.data.permission.listFiles=fpPermissions.findById("listFiles").getValue();
a.data.permission.listFolders=fpPermissions.findById("listFolders").getValue();
a.data.permission.modify=fpPermissions.findById("modify").getValue();
a.data.permission.bulkMailing=fpPermissions.findById("bulkMailing").getValue();
a.data.permission.anonymDownload=fpPermissions.findById("anonymDownload").getValue();
a.data.permission.anonymUpload=fpPermissions.findById("anonymUpload").getValue();
a.data.permission.anonymViewContent=fpPermissions.findById("anonymViewContent").getValue();
a.data.permission.watchForModifs=fpPermissions.findById("watchForModifs").getValue();
a.data.permission.listRestriction.type=parseInt(b.listType);
a.data.permission.createRestriction.type=parseInt(b.createType);
var d=fpPermissions.findById("list-ext").getValue();
var c=fpPermissions.findById("create-ext").getValue();
a.data.permission.listRestriction.extensions=d?d.toUpperCase().split(","):[];
a.data.permission.createRestriction.extensions=c?c.toUpperCase().split(","):[];
a.data.permission.customField=fpPermissions.findById("folders-permissions-custom-field").getValue()
}}function validateFolderData(){var b=commonFolderInfo.findById("folder-name").getValue();
var a=commonFolderInfo.findById("folder-path").getValue();
if(!b){return htcConfig.locData.AdminFoldersEmptyName
}if(!a){return htcConfig.locData.AdminFoldersEmptyPath
}if(b.indexOf("\\")!=-1||b.indexOf(":")!=-1||b.indexOf("/")!=-1){return htcConfig.locData.AdminFoldersIncorrectName
}return null
}function validateAddUserData(){var c=addUserInfo.findById("add-user-name").getValue();
if(!c){return htcConfig.locData.AdminUsersEmptyName
}var b=addUserInfo.findById("add-user-password").getValue();
var a=addUserInfo.findById("add-user-password2").getValue();
if(!b){return htcConfig.locData.AdminUsersEmptyPassword
}if(b!=a){return htcConfig.locData.AdminUsersPasswordsNotMatch
}var d=false;
Ext.each(gridUsers.getStore().data.items,function(e){if(e.data.name.toLowerCase()==c.toLowerCase()){d=true
}});
if(d){return htcConfig.locData.AdminUsersAlreadyExists
}return null
}function validateEditUserData(){var a=editUserInfo.findById("edit-user-name").getValue();
if(!a){return htcConfig.locData.AdminUsersEmptyName
}if(editUserInfo.userName!=a){var b=false;
Ext.each(gridUsers.getStore().data.items,function(c){if(c.data.name.toLowerCase()==a.toLowerCase()){b=true
}});
if(b){return htcConfig.locData.AdminUsersAlreadyExists
}}return null
}function validateSetUserPasswordData(){var b=setUserPasswordInfo.findById("set-user-password-password").getValue();
var a=setUserPasswordInfo.findById("set-user-password-password2").getValue();
if(!b){return htcConfig.locData.AdminUsersEmptyPassword
}if(b!=a){return htcConfig.locData.AdminUsersPasswordsNotMatch
}return null
}function validateGroupData(){var b=groupInfo.findById("group-name").getValue();
if(!b){return htcConfig.locData.AdminGroupsEmptyName
}if(!groupWindow.isEditing||(groupWindow.isEditing&&groupInfo.groupName!=b)){var a=false;
Ext.each(gridGroups.getStore().data.items,function(c){if(c.data.name.toLowerCase()==b.toLowerCase()){a=true
}});
if(a){return htcConfig.locData.AdminGroupsAlreadyExists
}}return null
}function aggregateFolderData(){var b={};
var a=commonFolderInfo.findById("folder-name");
var c=a.getValue();
if(c.trim().toLowerCase()==="root"){Ext.Msg.show({title:htcConfig.locData.CommonWarningCaption,msg:String.format(htcConfig.locData.AdminFoldersRootNameUsed,Ext.util.Format.htmlEncode(c)),icon:Ext.MessageBox.WARNING,buttons:Ext.Msg.OK,fn:function(){if(a){a.focus(true)
}}});
return null
}b.name=c;
b.path=commonFolderInfo.findById("folder-path").getValue();
b.limitations=commonFolderInfo.findById("folder-limitations").getValue();
b.description=commonFolderInfo.findById("folder-description").getValue();
b.customField=commonFolderInfo.findById("folder-custom-field").getValue();
b.filterField=commonFolderInfo.findById("folder-filter-field").getValue();
b.userPerms=[];
b.groupPerms=[];
Ext.each(gridPerms.getStore().data.items,function(d){if(!d.data.permission.identityName||d.data.permission.identityName==""||d.data.permission.identityName!=d.data.name){d.data.permission.identityName=d.data.name
}if(d.data.typeId=="user"){b.userPerms.push(d.data.permission)
}else{b.groupPerms.push(d.data.permission)
}});
return b
}function aggregateAddUserData(){var a={};
a.name=addUserInfo.findById("add-user-name").getValue();
a.password=addUserInfo.findById("add-user-password").getValue();
a.email=addUserInfo.findById("add-user-email").getValue();
a.customField=addUserInfo.findById("add-user-custom-field").getValue();
a.groups=[];
Ext.each(addGridMembersOf.getStore().data.items,function(b){a.groups.push(b.data.name)
});
return a
}function aggregateEditUserData(){var a={};
a.origName=editUserInfo.userName;
a.name=editUserInfo.findById("edit-user-name").getValue();
a.email=editUserInfo.findById("edit-user-email").getValue();
a.customField=editUserInfo.findById("edit-user-custom-field").getValue();
a.groups=[];
Ext.each(editGridMembersOf.getStore().data.items,function(b){a.groups.push(b.data.name)
});
return a
}function aggregateSetUserPasswordData(){var a={};
a.name=setUserPasswordInfo.findById("set-user-password-name").getValue();
a.password=setUserPasswordInfo.findById("set-user-password-password").getValue();
return a
}function aggregateGroupData(){var a={};
a.name=groupInfo.findById("group-name").getValue();
a.users=[];
Ext.each(gridMembers.getStore().data.items,function(b){a.users.push(b.data.name)
});
a.origName=groupInfo.groupName;
a.customField=groupInfo.findById("group-custom-field").getValue();
return a
}function getDefaultAAC(){return htcConfig.defaultAAC||{create:true,del:true,rename:true,upload:true,download:true,zipDownload:true,zip:true,unzip:true,cut:true,copy:true,listFiles:true,listFolders:true,modify:true,bulkMailing:false,anonymDownload:true,anonymUpload:true,anonymViewContent:true,watchForModifs:true}
}function prepareFolderWindow(f){var a={},e;
a=Ext.apply(a,getDefaultAAC());
fpPermissions.findById("create").setValue(a.create);
fpPermissions.findById("del").setValue(a.del);
fpPermissions.findById("rename").setValue(a.rename);
fpPermissions.findById("upload").setValue(a.upload);
fpPermissions.findById("download").setValue(a.download);
fpPermissions.findById("zipDownload").setValue(a.zipDownload);
fpPermissions.findById("zip").setValue(a.zip);
fpPermissions.findById("unzip").setValue(a.unzip);
fpPermissions.findById("cut").setValue(a.cut);
fpPermissions.findById("copy").setValue(a.copy);
fpPermissions.findById("listFiles").setValue(a.listFiles);
fpPermissions.findById("listFolders").setValue(a.listFolders);
fpPermissions.findById("modify").setValue(a.modify);
fpPermissions.findById("bulkMailing").setValue(a.bulkMailing);
fpPermissions.findById("anonymDownload").setValue(a.anonymDownload);
fpPermissions.findById("anonymUpload").setValue(a.anonymUpload);
fpPermissions.findById("anonymViewContent").setValue(a.anonymViewContent);
fpPermissions.findById("watchForModifs").setValue(a.watchForModifs);
fpPermissions.findById("list-rest").setValue("1");
fpPermissions.findById("create-rest").setValue("1");
fpPermissions.findById("list-ext").setValue("");
fpPermissions.findById("create-ext").setValue("");
fpPermissions.findById("folders-permissions-custom-field").setValue("");
fpPermissions.setDisabled(true);
if(!f){folderWindow.isEditing=false;
folderWindow.buttons[2].setText(htcConfig.locData.CommonButtonCaptionAdd);
e=document.getElementById("share-note");
if(e){e.innerHTML=""
}commonFolderInfo.findById("folder-name").setDisabled(false);
commonFolderInfo.findById("folder-name").setValue("");
commonFolderInfo.findById("folder-path").setValue("");
commonFolderInfo.findById("original-folder-path").setValue("");
commonFolderInfo.findById("folder-limitations").setValue("");
commonFolderInfo.findById("folder-description").setValue("");
commonFolderInfo.findById("folder-custom-field").setValue("");
commonFolderInfo.findById("folder-filter-field").setValue("");
gridPerms.getStore().removeAll()
}else{folderWindow.isEditing=true;
folderWindow.buttons[2].setText(htcConfig.locData.CommandSave);
commonFolderInfo.findById("folder-name").setDisabled(true);
commonFolderInfo.findById("folder-name").setValue(f.name);
commonFolderInfo.findById("folder-path").setValue(f.path);
e=document.getElementById("share-note");
if(f.path&&f.path.trim().indexOf("\\\\")==0){var g=htcConfig.hcAuthMode=="forms";
var c=String.format(htcConfig.locData[g?"AdminFoldersFolderRemoteWarningForms":"AdminFoldersFolderRemoteWarningWin"],'<br /><a href="Manual/faq.html#'+(g?"accessshredfolder":"abe")+'" target="_blank">',"</a>");
if(e){document.getElementById("share-note").innerHTML=c
}else{folderWindow.buttons[0].html='<div id="share-note" style="color:red;white-space:normal;width:350px;">'+c+"</div>"
}}else{if(e){document.getElementById("share-note").innerHTML=""
}else{var d=folderWindow.buttons[0];
folderWindow.buttons[0].html='<div id="share-note" style="color:red;white-space:normal;width:350px;"></div>'
}}commonFolderInfo.findById("original-folder-path").setValue(f.path);
commonFolderInfo.findById("folder-limitations").setValue(f.limitations);
commonFolderInfo.findById("folder-description").setValue(f.description);
commonFolderInfo.findById("folder-custom-field").setValue(f.customField);
commonFolderInfo.findById("folder-filter-field").setValue(f.filterField);
if(f.filterError&&f.filterError!=""){commonFolderInfo.findById("folder-filter-field").markInvalid(f.filterError)
}var b=gridPerms.getStore();
b.removeAll();
Ext.each(f.userPerms,function(i){var h=new PermissionRecord({name:i.identityName,type:htcConfig.locData.CommonFieldLabelUser,typeId:"user",icon:HttpCommander.Lib.Utils.getIconPath(this,"user"),permission:i});
b.add(h)
},this);
Ext.each(f.groupPerms,function(i){var h=new PermissionRecord({name:i.identityName,type:htcConfig.locData.CommonFieldLabelGroup,typeId:"group",icon:HttpCommander.Lib.Utils.getIconPath(this,"group"),permission:i});
b.add(h)
},this)
}}function prepareAddUserWindow(b){addUserInfo.findById("add-user-name").setValue("");
addUserInfo.findById("add-user-password").setValue("");
addUserInfo.findById("add-user-password2").setValue("");
addUserInfo.findById("add-user-email").setValue("");
addUserInfo.findById("add-user-custom-field").setValue("");
addGridMembersOf.getTopToolbar().setVisible(!denyEditAD);
var a=addGridMembersOf.getStore();
a.removeAll();
a.commitChanges()
}function prepareEditUserWindow(b){editUserInfo.userName=b.name;
editUserInfo.findById("edit-user-name").setValue(b.name);
editUserInfo.findById("edit-user-email").setValue(b.email);
editUserInfo.findById("edit-user-custom-field").setValue(b.customField);
editGridMembersOf.getTopToolbar().setVisible(!denyEditAD);
var a=editGridMembersOf.getStore();
a.removeAll();
Ext.each(b.groups||[],function(d){var c=new MemberRecord({name:d,icon:HttpCommander.Lib.Utils.getIconPath(this,"group")});
a.add(c)
},this);
a.commitChanges()
}function prepareSetUserPasswordWindow(a){setUserPasswordInfo.findById("set-user-password-name").setValue(a.name);
setUserPasswordInfo.findById("set-user-password-password").setValue("");
setUserPasswordInfo.findById("set-user-password-password2").setValue("")
}function prepareGroupWindow(d){if(!d){if(!denyEditAD){groupWindow.isEditing=false;
groupWindow.buttons[0].setText(htcConfig.locData.CommonButtonCaptionAdd);
groupInfo.groupName="";
groupInfo.findById("group-name").setDisabled(false);
groupInfo.findById("group-name").setValue("");
groupInfo.findById("group-custom-field").setValue("");
gridMembers.getStore().removeAll();
gridMembers.getStore().commitChanges();
return true
}else{return false
}}else{groupWindow.isEditing=true;
var b=groupWindow.buttons[0];
if(b){b.setText(htcConfig.locData.CommandSave);
b.setVisible(!denyEditAD)
}groupInfo.groupName=d.name;
var e=groupInfo.findById("group-name");
if(e){e.setDisabled(denyEditAD);
e.setValue(d.name)
}var c=groupInfo.findById("group-custom-field");
if(c){c.setDisabled(denyEditAD);
c.setValue(d.customField)
}gridMembers.getTopToolbar().setVisible(!denyEditAD);
var a=gridMembers.getStore();
a.removeAll();
Ext.each(d.users,function(g){var f=new MemberRecord({name:g,icon:HttpCommander.Lib.Utils.getIconPath(this,"user")});
a.add(f)
},this);
a.commitChanges();
return true
}}function promptGroupsNames(i,f){if(!Ext.isFunction(f)){return
}var b=i;
var g,c,h;
var d=new Ext.data.DirectStore({directFn:HttpCommander.Admin.GetGroups,autoLoad:false,remoteSort:false,remoteFilter:false,fields:["name","icon"],listeners:{load:function(j){if(Ext.isArray(b)&&b.length>0){Ext.each(b,function(l){var k=j.find("name",l.get("name"),0,false,false);
if(k>=0){j.removeAt(k)
}});
j.commitChanges()
}},datachanged:function(k){var j=g.getBottomToolbar();
if(j){j.items.items[0].setText(String.format(htcConfig.locData.AdminGroupsCountInfo,k.data.items.length),false)
}}}});
var a=function(){var l=g.getSelectionModel();
var k=g.getTopToolbar().items.items[0];
var j=h.buttons[0];
if(!!j){j.setDisabled(l.getCount()==0&&Ext.isEmpty(k.getValue()))
}};
var e=new Ext.util.DelayedTask(function(){if(!c){return
}var j=Ext.getCmp("search-group-field");
if(!j){return
}var k=j.getValue();
j.onTrigger2Click.call(j,j)
},h);
h=new Ext.Window({title:htcConfig.locData.AdminCommandSelectGroups,labelWidth:100,closeAction:"close",frame:true,width:300,minWidth:300,height:300,minHeight:200,maximizable:true,resizable:true,border:false,modal:true,layout:"fit",plain:true,buttonAlign:"center",plain:true,items:[g=new Ext.grid.GridPanel({plain:true,frame:false,border:false,header:false,loadMask:true,flex:1,anchor:"100%",layout:"fit",viewConfig:{forceFit:true,autoFill:true,hdCtxIndex:0},bbar:[{xtype:"label",html:"&nbsp;"}],tbar:[{hideLabel:true,id:"search-group-field",xtype:"searchfield",ctCls:"x-form-quick-search-wrap"+(Ext.isGecko?"-ie":""),emptyText:htcConfig.locData.AdminSearchGroupEmptyText,flex:1,anchor:"100%",width:190,minWidth:190,enableKeyEvents:true,listeners:{keypress:a,change:a,keyup:function(l,m){var j=m.getKey();
if(j==m.BACKSPACE||!m.isSpecialKey()){e.delay(10)
}}},searchHandler:function(k,j){c.getMenuFilter().setValue(j);
c.onCheckChange.call(c,null,j)
},onClearFilter:function(j){c.getMenuFilter().setValue("");
c.onCheckChange.call(c,null,"")
}}],store:d,columns:[{dataIndex:"name",header:htcConfig.locData.CommonFieldLabelGroupName,sortable:true,renderer:function(j){return Ext.util.Format.htmlEncode(j||"")
}}],plugins:[c=new Ext.ux.grid.GridFilters({menuFilterText:htcConfig.locData.MenuFilterText,encode:false,local:true,filters:[{dataIndex:"name",type:"string",emptyText:htcConfig.locData.EmptyTextFilter}]})],multiSelect:true,selModel:new Ext.grid.RowSelectionModel({singleSelect:false,listeners:{selectionchange:a}}),listeners:{rowdblclick:function(j,l,k){h.buttons[0].handler()
}}})],listeners:{show:function(j){d.load()
}},buttons:[{text:htcConfig.locData.CommonButtonCaptionOK,disabled:true,handler:function(){var j=[];
var k=g.getTopToolbar().items.items[0].getValue();
Ext.each(g.getSelectionModel().getSelections(),function(l){j.push(l.get("name"))
});
if(j.length==0&&!Ext.isEmpty(k)){j.unshift(k)
}if(j.length==0){Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:htcConfig.locData.AdminFoldersGroupNameNotSelected,icon:Ext.MessageBox.ERROR,buttons:Ext.Msg.CANCEL})
}else{f(h,"ok",j)
}}},{text:htcConfig.locData.CommonButtonCaptionCancel,handler:function(){f(h,"cancel",[])
}}]});
h.show()
}function promptUsersNames(i,h){if(!Ext.isFunction(h)){return
}var b=i;
var c,e,a;
var g=new Ext.data.DirectStore({directFn:HttpCommander.Admin.GetUsers,autoLoad:false,remoteSort:false,remoteFilter:false,fields:["name","email","icon","customField"],listeners:{load:function(j){if(Ext.isArray(b)&&b.length>0){Ext.each(b,function(l){var k=j.find("name",l.get("name"),0,false,false);
if(k>=0){j.removeAt(k)
}});
j.commitChanges()
}},datachanged:function(k){var j=c.getBottomToolbar();
if(j){j.items.items[0].setText(String.format(htcConfig.locData.AdminUsersCountInfo,k.data.items.length),false)
}}}});
var d=function(){var l=c.getSelectionModel();
var k=c.getTopToolbar().items.items[0];
var j=a.buttons[0];
if(!!j){j.setDisabled(l.getCount()==0&&Ext.isEmpty(k.getValue()))
}};
var f=new Ext.util.DelayedTask(function(){if(!e){return
}var j=Ext.getCmp("search-user-field");
if(!j){return
}var k=j.getValue();
j.onTrigger2Click.call(j,j)
},a);
a=new Ext.Window({title:htcConfig.locData.AdminCommandSelectUsers,labelWidth:100,closeAction:"close",frame:true,width:300,minWidth:300,height:300,minHeight:200,maximizable:true,resizable:true,border:false,modal:true,layout:"fit",plain:true,buttonAlign:"center",plain:true,items:[c=new Ext.grid.GridPanel({plain:true,frame:false,border:false,header:false,loadMask:true,flex:1,anchor:"100%",layout:"fit",viewConfig:{forceFit:true,autoFill:true,hdCtxIndex:0},bbar:[{xtype:"label",html:"&nbsp;"}],tbar:[{hideLabel:true,id:"search-user-field",xtype:"searchfield",ctCls:"x-form-quick-search-wrap"+(Ext.isGecko?"-ie":""),emptyText:htcConfig.locData.AdminSearchUserEmptyText,flex:1,anchor:"100%",width:190,minWidth:190,enableKeyEvents:true,listeners:{keypress:d,change:d,keyup:function(l,m){var j=m.getKey();
if(j==m.BACKSPACE||!m.isSpecialKey()){f.delay(10)
}}},searchHandler:function(k,j){e.getMenuFilter().setValue(j);
e.onCheckChange.call(e,null,j)
},onClearFilter:function(j){e.getMenuFilter().setValue("");
e.onCheckChange.call(e,null,"")
}}],store:g,columns:[{dataIndex:"name",header:htcConfig.locData.CommonFieldLabelUserName,sortable:true,renderer:function(j){return Ext.util.Format.htmlEncode(j||"")
}}],plugins:[e=new Ext.ux.grid.GridFilters({menuFilterText:htcConfig.locData.MenuFilterText,encode:false,local:true,filters:[{dataIndex:"name",type:"string",emptyText:htcConfig.locData.EmptyTextFilter}]})],multiSelect:true,selModel:new Ext.grid.RowSelectionModel({singleSelect:false,listeners:{selectionchange:d}}),listeners:{rowdblclick:function(j,l,k){a.buttons[0].handler()
}}})],listeners:{show:function(j){g.load()
}},buttons:[{text:htcConfig.locData.CommonButtonCaptionOK,disabled:true,handler:function(){var k=[];
var j=c.getTopToolbar().items.items[0].getValue();
Ext.each(c.getSelectionModel().getSelections(),function(l){k.push(l.get("name"))
});
if(k.length==0&&!Ext.isEmpty(j)){k.unshift(j)
}if(k.length==0){Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:htcConfig.locData.AdminFoldersUserNameNotSelected,icon:Ext.MessageBox.ERROR,buttons:Ext.Msg.CANCEL})
}else{h(a,"ok",k)
}}},{text:htcConfig.locData.CommonButtonCaptionCancel,handler:function(){h(a,"cancel",[])
}}]});
a.show()
}function promptUserName(a,e){var h=new Ext.data.DirectStore({directFn:HttpCommander.Admin.GetUsers,autoLoad:false,fields:["name","email","icon","customField"],listeners:{load:function(i){var j=Ext.getCmp("userNameCombo");
if(!!j){j.mode="local";
j.minChars=0;
j.queryDelay=10
}}}});
var b;
var g=htcConfig.winAuth;
var d="";
if(g){if(folderWindow&&folderWindow.findById("folder-path")){d=folderWindow.findById("folder-path").getValue();
g=d&&d!=""
}else{g=false
}}var f=[];
if(g){b=new Ext.data.DirectStore({directFn:HttpCommander.Admin.GetUsersFromDACL,autoLoad:false,baseParams:{folder:d},paramOrder:["folder"],fields:["name","acl"]});
f.push({id:"users-all-or-dacl",xtype:"radiogroup",vertical:false,columns:2,hideLabel:true,anchor:"100%",items:[{boxLabel:htcConfig.locData.AdminUsersListAll,name:"rb-auto",id:"users-all-radio",checked:true,listeners:{check:function(j,k){var m=Ext.getCmp("userNameCombo");
if(m){m.bindStore(k?h:b,false)
}var i=Ext.getCmp("daclUserString");
if(i){i.setVisible(false);
if(!k){var l=b.findBy(function(n,o){return n.get("name").toLowerCase()==m.getValue().toLowerCase()
});
if(l>=0){i.setText("<span>"+htcConfig.locData.AdminDACLStringLabel+": <b>"+b.getAt(l).data.acl+"</b></span>",false);
i.setVisible(true)
}}}}}},{boxLabel:htcConfig.locData.AdminUsersListDACL,name:"rb-auto",id:"users-dacl-radio"}]})
}f.push({id:"userNameCombo",fieldLabel:htcConfig.locData.AdminFoldersUserNamePrompt,xtype:"combo",displayField:"name",anchor:"100%",mode:"remote",triggerAction:"all",disableKeyFilter:true,loadingText:htcConfig.locData.ProgressLoading+"...",emptyText:htcConfig.locData.AdminFoldersUserNameEmptyText+"...",selectOnFocus:true,editable:true,lazyInit:false,minChars:50,typeAhead:true,tpl:'<tpl for="."><div class="x-combo-list-item">{name:htmlEncode}</div></tpl>',store:h,listeners:{select:function(m,j,l){var i=Ext.getCmp("daclUserString");
if(i){i.setVisible(false);
i.setText("");
var k=Ext.getCmp("users-dacl-radio");
if(k&&k.checked){i.setText("<span>"+htcConfig.locData.AdminDACLStringLabel+": <b>"+j.data.acl+"</b></span>",false);
i.setVisible(true)
}}},change:function(n,m,k){var i=Ext.getCmp("daclUserString");
if(i){var j=Ext.getCmp("users-dacl-radio");
i.setVisible(false);
i.setText("");
if(j&&j.checked){var l=b.findBy(function(o,p){return o.get("name").toLowerCase()==m.toLowerCase()
});
if(l>=0){i.setText("<span>"+htcConfig.locData.AdminDACLStringLabel+": <b>"+b.getAt(l).data.acl+"</b></span>",false);
i.setVisible(true)
}}}},expand:function(i){i.syncSize()
}}});
if(g){f.push({id:"daclUserString",xtype:"label",hidden:true})
}if(e===true){if(!Ext.isFunction(window.pasteUserRegexExample)){window.pasteUserRegexExample=function(i){var k=i.innerHTML,j=Ext.getCmp("userNameCombo");
if(!Ext.isEmpty(k)&&!!j){j.setValue(k)
}return false
}
}f.push({xtype:"label",anchor:"100%",style:{fontSize:"11px"},width:"100%",html:String.format(htcConfig.locData.AdminFoldersPermissionsForRegex,"regex:")+"<br />"+String.format(htcConfig.locData.AdminFoldersPermissionsForRegexUsers,'<a href="#" onclick="pasteUserRegexExample(this)">regex:.*</a>','<a href="#" onclick="pasteUserRegexExample(this)">regex:^(jdoe|Mike)$</a>')})
}var c=new Ext.Window({title:htcConfig.locData.CommonFieldLabelUserName,labelWidth:100,frame:true,width:300,minWidth:300,autoHeight:true,border:false,modal:true,layout:"form",bodyStyle:"padding: 5px 5px 0 5px",buttonAlign:"center",plain:true,items:f,buttons:[{text:htcConfig.locData.CommonButtonCaptionOK,handler:function(){var i=c.findById("userNameCombo").getValue().trim();
if(i==""){Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:htcConfig.locData.AdminFoldersUserNameNotSelected,icon:Ext.MessageBox.ERROR,buttons:Ext.Msg.OK})
}else{c.close();
a("ok",i)
}}},{text:htcConfig.locData.CommonButtonCaptionCancel,handler:function(){c.close();
a("cancel","")
}}]});
c.show()
}function promptGroupName(b,f){var e=new Ext.data.DirectStore({directFn:HttpCommander.Admin.GetGroups,autoLoad:false,fields:["name","users","icon","customField"],listeners:{load:function(i){var j=Ext.getCmp("groupNameCombo");
if(!!j){j.mode="local";
j.minChars=0;
j.queryDelay=10
}}}});
var c;
var h=htcConfig.winAuth;
var d="";
if(h){if(folderWindow&&folderWindow.findById("folder-path")){d=folderWindow.findById("folder-path").getValue();
h=d&&d!=""
}else{h=false
}}var a=[];
if(h){c=new Ext.data.DirectStore({directFn:HttpCommander.Admin.GetGroupsFromDACL,autoLoad:false,baseParams:{folder:d},paramOrder:["folder"],fields:["name","acl"]});
a.push({id:"groups-all-or-dacl",xtype:"radiogroup",vertical:false,columns:2,hideLabel:true,anchor:"100%",items:[{boxLabel:htcConfig.locData.AdminGroupsListAll,name:"rb-auto",id:"groups-all-radio",checked:true,listeners:{check:function(j,k){var m=Ext.getCmp("groupNameCombo");
if(m){m.bindStore(k?e:c,false)
}var i=Ext.getCmp("daclGroupString");
if(i){i.setVisible(false);
if(!k){var l=c.findBy(function(n,o){return n.get("name").toLowerCase()==m.getValue().toLowerCase()
});
if(l>=0){i.setText("<span>"+htcConfig.locData.AdminDACLStringLabel+": <b>"+c.getAt(l).data.acl+"</b></span>",false);
i.setVisible(true)
}}}}}},{boxLabel:htcConfig.locData.AdminGroupsListDACL,name:"rb-auto",id:"groups-dacl-radio"}]})
}a.push({id:"groupNameCombo",fieldLabel:htcConfig.locData.AdminFoldersGroupNamePrompt,xtype:"combo",lazyInit:false,displayField:"name",mode:"remote",triggerAction:"all",anchor:"100%",loadingText:htcConfig.locData.ProgressLoading+"...",emptyText:htcConfig.locData.AdminFoldersGroupNameEmptyText+"...",selectOnFocus:true,minChars:50,typeAhead:true,editable:true,store:e,tpl:'<tpl for="."><div class="x-combo-list-item">{name:htmlEncode}</div></tpl>',listeners:{select:function(m,j,l){var i=Ext.getCmp("daclGroupString");
if(i){i.setVisible(false);
i.setText("");
var k=Ext.getCmp("groups-dacl-radio");
if(k&&k.checked){i.setText("<span>"+htcConfig.locData.AdminDACLStringLabel+": <b>"+j.data.acl+"</b></span>",false);
i.setVisible(true)
}}},change:function(n,m,k){var i=Ext.getCmp("daclGroupString");
if(i){var j=Ext.getCmp("groups-dacl-radio");
i.setVisible(false);
i.setText("");
if(j&&j.checked){var l=c.findBy(function(o,p){return o.get("name").toLowerCase()==m.toLowerCase()
});
if(l>=0){i.setText("<span>"+htcConfig.locData.AdminDACLStringLabel+": <b>"+c.getAt(l).data.acl+"</b></span>",false);
i.setVisible(true)
}}}},expand:function(i){i.syncSize()
}}});
if(h){a.push({id:"daclGroupString",xtype:"label",hidden:true})
}if(f===true){if(!Ext.isFunction(window.pasteGroupRegexExample)){window.pasteGroupRegexExample=function(i){var k=i.innerHTML,j=Ext.getCmp("groupNameCombo");
if(!Ext.isEmpty(k)&&!!j){j.setValue(k)
}return false
}
}a.push({xtype:"label",anchor:"100%",style:{fontSize:"11px"},width:"100%",html:String.format(htcConfig.locData.AdminFoldersPermissionsForRegex,"regex:")+"<br />"+String.format(htcConfig.locData.AdminFoldersPermissionsForRegexGroups,'<a href="#" onclick="pasteGroupRegexExample(this)">regex:.*</a>','<a href="#" onclick="pasteGroupRegexExample(this)">regex:Students</a>')})
}var g=new Ext.Window({title:htcConfig.locData.CommonFieldLabelGroupName,labelWidth:100,frame:true,width:300,minWidth:300,autoHeight:true,border:false,modal:true,layout:"form",bodyStyle:"padding: 5px 5px 0 5px",buttonAlign:"center",plain:true,items:a,buttons:[{text:htcConfig.locData.CommonButtonCaptionOK,handler:function(){var i=g.findById("groupNameCombo").getValue().trim();
if(i==""){Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:htcConfig.locData.AdminFoldersGroupNameNotSelected,icon:Ext.MessageBox.ERROR,buttons:Ext.Msg.OK})
}else{g.close();
b("ok",i)
}}},{text:htcConfig.locData.CommonButtonCaptionCancel,handler:function(){g.close();
b("cancel","")
}}]});
g.show()
}function promptShareName(a){var b=new Ext.Window({title:htcConfig.locData.AdminFoldersShareNameTitle,labelWidth:100,frame:true,width:300,minWidth:300,autoHeight:true,border:false,modal:true,layout:"form",bodyStyle:"padding: 5px 5px 0 5px",buttonAlign:"center",plain:true,items:[{id:"shareNameCombo",fieldLabel:htcConfig.locData.AdminFoldersShareNameEmptyText,xtype:"combo",lazyInit:false,anchor:"100%",displayField:"path",mode:"remote",triggerAction:"all",tpl:'<tpl for="."><div ext:qtip="{encodedPath}" class="x-combo-list-item">{path:htmlEncode}</div></tpl>',loadingText:htcConfig.locData.ProgressLoading+"...",emptyText:htcConfig.locData.AdminFoldersShareNameEmptyText+"...",selectOnFocus:true,editable:false,store:new Ext.data.DirectStore({directFn:HttpCommander.Admin.GetSharedFolders,autoLoad:false,stdTimeout:Ext.Ajax.timeout,fields:["path","encodedPath"],listeners:{beforeload:function(c,d){c.stdTimeout=Ext.Ajax.timeout;
Ext.Ajax.timeout=ajaxRequestTimeout
},load:function(d,c,e){Ext.Ajax.timeout=d.stdTimeout
},exception:function(c){if(this&&this.stdTimeout){Ext.Ajax.timeout=this.stdTimeout
}else{Ext.Ajax.timeout=30000
}}}}),listeners:{select:function(e,c,d){Ext.QuickTips.getQuickTip().register({target:this.el,text:c.data.encodedPath})
},expand:function(c){c.syncSize()
}}}],listeners:{show:function(d){var c=d.findById("shareNameCombo");
if(c){var e=c.getValue();
if(e&&e!=""){Ext.QuickTips.getQuickTip().register({target:c.el,text:Ext.util.Format.htmlEncode(e)})
}else{Ext.QuickTips.getQuickTip().unregister(c.el)
}}}},buttons:[{text:htcConfig.locData.CommonButtonCaptionOK,disabled:showListForAllowedFolders,handler:function(){var c=b.findById("shareNameCombo").getValue().trim();
if(c==""){Ext.Msg.show({title:htcConfig.locData.CommonErrorCaption,msg:htcConfig.locData.AdminFoldersShareNameNotSelected,icon:Ext.MessageBox.ERROR,buttons:Ext.Msg.OK})
}else{b.close();
a("ok",c)
}}},{text:htcConfig.locData.CommonButtonCaptionCancel,handler:function(){b.close();
a("cancel","")
}}]});
b.show()
}function passwordRenderer(b){var a=b?String(b):"";
return a.length>0?new Array(a.length).join("&#9679;"):""
}function htmlEncodeRenderer(a){return a?Ext.util.Format.htmlEncode(a):""
}function identitiesRenderer(b,c,a){result="";
Ext.each(b,function(d){if(result){result+=", "
}result+=Ext.util.Format.htmlEncode(d.identityName)
});
return result
}function dateRendererLocal(i,b,h,g,d,c){if(i==null){return null
}var a;
try{if(c.reader.jsonData.isUSA){a=(i.getMonth()+1)+"/"+i.getDate()+"/"
}else{a=i.getDate()+"/"+(i.getMonth()+1)+"/"
}a+=i.getFullYear()+" "+i.toLocaleTimeString()
}catch(f){a=i.toLocaleString()
}return a
}function booleanRenderer(f,a,e,d,c,b){a.css+=" x-grid3-check-col-td";
return String.format('<div class="x-grid3-check-col{0}">&#160;</div>',f?"-on":"")
}function wordWrapRenderer(c,a,b){if(!c){c=""
}return String.format("<span style='white-space: normal;'>{0}</span>",Ext.util.Format.htmlEncode(c))
}function qtipCellRenderer(c,a,b){a.attr="";
if(c&&c!=""){a.attr='ext:qtip="'+Ext.util.Format.htmlEncode(c)+'" ext:qchilds="true"'
}return c
}function detectNewVersion(){var c=null;
if(htcConfig.hccurrentversion&&Ext.isArray(htcConfig.hccurrentversion)&&htcConfig.hccurrentversion.length>0&&window.hclatestversion&&Ext.isArray(window.hclatestversion)&&window.hclatestversion.length>0){var a=window.hclatestversion.length;
if(htcConfig.hccurrentversion.length<a){a=htcConfig.hccurrentversion.length
}for(var b=0;
b<a;
b++){if(window.hclatestversion[b]>htcConfig.hccurrentversion[b]){c=window.hclatestversion.join(".");
break
}else{if(window.hclatestversion[b]<htcConfig.hccurrentversion[b]){break
}}}}return c
}function navigateHelpAdminPanel(){showHelpWindow("Manual/adminpanel.html")
}function navigateHelpAdminPanelWithFragment(a){showHelpWindow("Manual/adminpanel.html#"+a)
}function generateIFrameHelp(a){return'<iframe style="background-color: #FFFFFF;" scrolling="yes" width="100%" height="100%" border="0" src="'+htcConfig.relativePath+a+'"></iframe>'
}function showHelpWindow(b){if(navigator.userAgent.toLowerCase().indexOf("ipad")!=-1){window.open(htcConfig.relativePath+b)
}else{var c=userHelpWindow;
if(c!=undefined&&c!=null){c.hide();
b=b||"Manual/adminpanel.html";
var a=generateIFrameHelp(b);
c.html=a;
c.show();
c.update(a)
}}}function genHintWithQuestionIcon(a){if(a&&a!=""){return'&nbsp;<img class="filetypeimage" ext:qtip="'+Ext.util.Format.htmlEncode(a)+'" alt="" align="absmiddle" src="'+HttpCommander.Lib.Utils.getIconPath(this,"question")+'"/>'
}return""
}function genQuestionIconWithUrl(b,a){if(!Ext.isEmpty(b)&&!Ext.isEmpty(a)){return'<img class="filetypeimage" onclick="showHelpWindow(\''+Ext.util.Format.htmlEncode(a)+'\'); return false;" style="cursor:pointer;" ext:qtip="'+Ext.util.Format.htmlEncode(b)+'" alt="" align="absmiddle" src="'+HttpCommander.Lib.Utils.getIconPath(this,"question")+'"/>'
}return""
}function getPermissionHintMsg(){return"<table><tr><td><b>"+htcConfig.locData.AdminFoldersCreate+"</b></td><td>"+htcConfig.locData.AdminFoldersCreateHint+"</td></tr><tr><td><b>"+htcConfig.locData.AdminFoldersDelete+"</b></td><td>"+htcConfig.locData.AdminFoldersDeleteHint+"</td></tr><tr><td><b>"+htcConfig.locData.AdminFoldersRename+"</b></td><td>"+htcConfig.locData.AdminFoldersRenameHint+"</td></tr><tr><td><b>"+htcConfig.locData.AdminFoldersUpload+"</b></td><td>"+htcConfig.locData.AdminFoldersUploadHint+"</td></tr><tr><td><b>"+htcConfig.locData.AdminFoldersDownload+"</b></td><td>"+htcConfig.locData.AdminFoldersDownloadHint+"</td></tr><tr><td><b>"+htcConfig.locData.AdminFoldersZipDownload+"</b></td><td>"+htcConfig.locData.AdminFoldersZipDownloadHint+"</td></tr><tr><td><b>"+htcConfig.locData.AdminFoldersZip+"</b></td><td>"+htcConfig.locData.AdminFoldersZipHint+"</td></tr><tr><td><b>"+htcConfig.locData.AdminFoldersUnzip+"</b></td><td>"+htcConfig.locData.AdminFoldersUnzipHint+"</td></tr><tr><td><b>"+htcConfig.locData.AdminFoldersCut+"</b></td><td>"+htcConfig.locData.AdminFoldersCutHint+"</td></tr><tr><td><b>"+htcConfig.locData.AdminFoldersCopy+"</b></td><td>"+htcConfig.locData.AdminFoldersCopyHint+"</td></tr><tr><td><b>"+htcConfig.locData.AdminFoldersListFiles+"</b></td><td>"+htcConfig.locData.AdminFoldersListFilesHint+"</td></tr><tr><td><b>"+htcConfig.locData.AdminFoldersListFolders+"</b></td><td>"+htcConfig.locData.AdminFoldersListFoldersHint+"</td></tr><tr><td><b>"+htcConfig.locData.AdminFoldersModify+"</b></td><td>"+htcConfig.locData.AdminFoldersModifyHint+"</td></tr><tr><td><b>"+htcConfig.locData.AdminFoldersBulkMailing+"</b></td><td>"+htcConfig.locData.AdminFoldersBulkMailingHint+"</td></tr><tr><td><b>"+htcConfig.locData.AdminFoldersAnonymViewContent+"</b></td><td>"+htcConfig.locData.AdminFoldersAnonymViewContentHint+"</td></tr><tr><td><b>"+htcConfig.locData.AdminFoldersAnonymDownload+"</b></td><td>"+htcConfig.locData.AdminFoldersAnonymDownloadHint+"</td></tr><tr><td><b>"+htcConfig.locData.AdminFoldersAnonymUpload+"</b></td><td>"+htcConfig.locData.AdminFoldersAnonymUploadHint+"</td></tr><tr><td><b>"+htcConfig.locData.AdminFoldersWatch+"</b></td><td>"+htcConfig.locData.AdminFoldersWatchHint+"</td></tr></table>"
};