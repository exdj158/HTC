(function(f){var d=f.document.head,c=mobileScriptsPath,b=f.Ext;
if(typeof b=="undefined"){f.Ext=b={}
}function e(g){document.write(g)
}function a(g,h){var i=document.createElement("meta");
i.setAttribute("name",g);
i.setAttribute("content",h);
d.appendChild(i)
}b.blink=function(q){var k=q.js||[],o=q.css||[],m,n,p,h,l;
if(navigator.userAgent.match(/IEMobile\/10\.0/)){var j=document.createElement("style");
j.appendChild(document.createTextNode("@media screen and (orientation: portrait) {@-ms-viewport {width: 320px !important;}}@media screen and (orientation: landscape) {@-ms-viewport {width: 560px !important;}}"));
document.getElementsByTagName("head")[0].appendChild(j)
}a("viewport","width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no");
if(!window.Ext){window.Ext={}
}b.microloaded=true;
var g=window.Ext.filterPlatform=function(v){var E=false,s=navigator.userAgent,x,B,t;
v=[].concat(v);
function A(F){var i=/Mobile(\/|\s)/.test(F);
return/(iPhone|iPod)/.test(F)||(!/(Silk)/.test(F)&&(/(Android)/.test(F)&&(/(Android 2)/.test(F)||i)))||(/(BlackBerry|BB)/.test(F)&&i)||/(Windows Phone)/.test(F)
}function z(i){return !A(i)&&(/iPad/.test(i)||/Android|Silk/.test(i)||/(RIM Tablet OS)/.test(i)||(/MSIE 10/.test(i)&&/; Touch/.test(i)))
}var r=window.location.search.substr(1),u=r.split("&"),w={},C,y;
for(y=0;
y<u.length;
y++){var D=u[y].split("=");
w[D[0]]=D[1]
}C=w.platform;
if(C){return v.indexOf(C)!=-1
}for(x=0,B=v.length;
x<B;
x++){switch(v[x]){case"phone":E=A(s);
break;
case"tablet":E=z(s);
break;
case"desktop":E=!A(s)&&!z(s);
break;
case"ie10":E=/MSIE 10/.test(s)||/Edge/.test(s);
break;
case"windows":E=/MSIE 10/.test(s)||/Trident/.test(s);
break;
case"ios":E=/(iPad|iPhone|iPod)/.test(s);
break;
case"android":E=/(Android|Silk)/.test(s)&&!(/Edge/.test(s));
break;
case"blackberry":E=/(BlackBerry|BB)/.test(s);
break;
case"safari":E=/Safari/.test(s)&&!(/(BlackBerry|BB)/.test(s))&&!(/Edge/.test(s));
break;
case"chrome":E=/Chrome/.test(s)&&!(/Edge/.test(s));
break;
case"tizen":E=/Tizen/.test(s);
break;
case"firefox":E=/Firefox/.test(s)
}if(E){return true
}}return false
};
for(m=0,n=o.length;
m<n;
m++){p=o[m];
if(typeof p!="string"){h=p.platform;
exclude=p.exclude;
l=p.theme;
p=p.path
}if(h){if(!g(h)||g(exclude)){continue
}b.theme={name:l||"Default"}
}e('<link rel="stylesheet" href="'+c+p+'">')
}for(m=0,n=k.length;
m<n;
m++){p=k[m];
if(typeof p!="string"){h=p.platform;
exclude=p.exclude;
p=p.path
}if(h){if(!g(h)||g(exclude)){continue
}}e('<script src="'+(k[m].remote?"":c)+p+'"><\/script>')
}}
})(this);
Ext.blink({id:"b74fc7df-ace3-4723-8f9d-3600aa9b64ff",js:[{path:"app.js",update:"full"},{path:"Handlers/GridHandler.ashx",remote:true,update:"full",version:"Ext"},{path:"Handlers/CommonHandler.ashx",remote:true,update:"full",version:"Ext"},{path:"Handlers/MetadataHandler.ashx",remote:true,update:"full",version:"Ext"},{path:"Handlers/UploadFromURLHandler.ashx",remote:true,update:"full",version:"Ext"},{path:"Handlers/VideoHandler.ashx",remote:true,update:"full",version:"Ext"},{path:"Handlers/GoogleDriveHandler.ashx",remote:true,update:"full",version:"Ext"},{path:"Handlers/DropboxHandler.ashx",remote:true,update:"full",version:"Ext"},{path:"Handlers/SkyDriveHandler.ashx",remote:true,update:"full",version:"Ext"}],css:[{path:"resources/css/app.css",platform:["desktop"],update:"full"},{path:"resources/css/wp.css",platform:["ie10"],theme:"Windows",update:"delta"},{path:"resources/css/cupertino.css",platform:["ios"],theme:"Cupertino",update:"delta"},{path:"resources/css/cupertino-classic.css",platform:["ios-classic"],theme:"CupertinoClassic",update:"delta"},{path:"resources/css/mountainview.css",platform:["android"],theme:"MountainView",update:"delta"}]});