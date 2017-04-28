if(!Array.prototype.indexOf){Array.prototype.indexOf=function(b,c){var a=this.length;
c=c||0;
c+=(c<0)?a:0;
for(;
c<a;
++c){if(this[c]===b){return c
}}return -1
}
}if(!!document.getElementsByClassName){getElementsByClass=function(b,a){return(a||document).getElementsByClassName(b)
}
}else{getElementsByClass=function(a,c){var c=c||document,g=c.getElementsByTagName("*"),b=g.length,h=a.split(/\s+/),d=h.length,k=[],f,e;
for(f=0;
f<b;
f++){for(e=0;
e<d;
e++){if(g[f].className.search("\\b"+h[e]+"\\b")!=-1){k.push(g[f]);
break
}}}return k
}
}function multi(){var c=navigator.userAgent.toLowerCase(),b=function(d){return d.test(c)
},a=function(e){var d=e.exec(c);
return d?parseFloat(d[1]):0
};
if(a(/\bfirefox\/(\d+\.\d+)/)>=3.6){return true
}else{if(b(/\bchrome\b/)){return a(/\bchrome\/(\d+\.\d+)/)>=2
}else{if(b(/safari/)){return true
}else{if(b(/opera/)){return a(/version\/(\d+\.\d+)/)>=11
}}}}return false
}function bload(){var a=document.getElementById("mnote"),f,g,b,d,c,e;
if(!!a){a.style.display=multi()?"":"none"
}f=document.getElementById("table-items");
if(!!f){g=getElementsByClass("selected-item",f);
if(!!g&&g.length>0&&!!(e=g[0])){b=e.id;
if(!!b){window.location.hash="#";
window.location.hash="#"+encodeURIComponent(b);
return
}}}b=window.location.hash;
if(!!b&&(c=b.indexOf("#"))>=0&&b.length>(c+1)){b=decodeURIComponent(b.substring(c+1));
d=document.getElementById(b);
if(!!d){tSelItem(d)
}}}function toggleUpload(b){var a=document.getElementById("anonymUploadDiv");
if(!!a){var c=(a.style.display=="none");
a.style.display=c?"":"none";
if(b){var d=b.getElementsByTagName("img");
if(!!d){if(!!d[0]){d[0].style.display=c?"":"none"
}if(d[1]){d[1].style.display=c?"none":""
}}b.title=c?(hideUploadHint||"Hide upload form"):(showUploadHint||"Show upload form")
}}}function changeLang(a){var b=document.getElementById("anonymFormChangeLang");
if(!!b&&!!a&&!!b.anonymLanguage){b.anonymLanguage.value=a.value;
b.submit()
}}function setParam(b,a,c){return b.replace(RegExp("([?&]"+a+"(?=[=&#]|$)[^#&]*|(?=#|$))"),"&"+a+"="+encodeURIComponent(c)).replace(/^([^?&]+)&/,"$1?")
}function changeSort(a){if(!!a){try{var b=a.getAttribute("datasort");
if(!!b){window.location.href=setParam(window.location.href,"sort",b)
}}catch(c){if(!!window.console&&!!window.console.log){window.console.log(c)
}}}}function isArray(a){return !!a&&a.toString()==="[object Array]"
}function removeClass(c,f){if(!c||!f){return
}var a=/^\s+|\s+$/g,h=/\s+/,d,g,e,j,b;
if(!isArray(f)){f=[f]
}if(c&&c.className){b=c.className.replace(a,"").split(h);
for(d=0,e=f.length;
d<e;
d++){j=f[d];
if(typeof j=="string"){j=j.replace(a,"");
g=b.indexOf(j);
if(g!=-1){b.splice(g,1)
}}}c.className=b.join(" ")
}return c
}function hasClass(b,a){return !!b&&!!a&&(" "+b.className+" ").indexOf(" "+a+" ")!=-1
}function addClass(f,e){if(!f||!e){return
}var d,a,c,b=[];
if(!isArray(e)){if(typeof e=="string"&&!hasClass(f,e)){f.className+=" "+e
}}else{for(d=0,a=e.length;
d<a;
d++){c=e[d];
if(typeof c=="string"&&(" "+f.className+" ").indexOf(" "+c+" ")==-1){b.push(c)
}}if(b.length){f.className+=" "+b.join(" ")
}}return f
}function tSelItem(f){if(!f){return
}var d,a,e,g,c="selected-item",b;
if(!f.parentNode){if(hasClass(f,c)){removeClass(f,c)
}else{addClass(f,c);
b=f.id
}}else{e=f.parentNode.childNodes;
for(d=0,a=e.length;
d<a;
d++){g=e[d];
if(g==f){if(hasClass(f,c)){removeClass(f,c)
}else{addClass(f,c);
b=f.id
}}else{removeClass(g,c)
}}}}function toggleRowCmts(b){if(!!b){var a=document.getElementById(String(b));
if(!!a){if(a.style.display=="none"){a.style.display=""
}else{a.style.display="none"
}}}};