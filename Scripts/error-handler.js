HttpCommanderLog=new function(){var a=(function(){var g=[function(){return new XMLHttpRequest()
},function(){return new ActiveXObject("MSXML2.XMLHTTP.7.0")
},function(){return new ActiveXObject("MSXML2.XMLHTTP.6.0")
},function(){return new ActiveXObject("MSXML2.XMLHTTP.5.0")
},function(){return new ActiveXObject("MSXML2.XMLHTTP.4.0")
},function(){return new ActiveXObject("MSXML2.XMLHTTP.3.0")
},function(){return new ActiveXObject("MSXML2.XMLHTTP")
},function(){return new ActiveXObject("Microsoft.XMLHTTP")
}],h=0,f=g.length,k;
for(;
h<f;
++h){try{k=g[h];
k();
break
}catch(j){}}return k
})(),b=(function(){try{var g="/Handlers/AnonymousDownload.ashx?error=",k=document.getElementsByTagName("script"),m=k.length,p,o,j,h,f;
for(var l=0;
l<m;
l++){p=k[l];
f=(typeof p.getAttribute.length!="undefined")?p.src:p.getAttribute("src",4);
if(!(f||"").match(/(\/scripts\/|\/handlers\/)/i)){continue
}if(f.match(/^https?:\/\//i)){o=-1;
if((o=f.search(/\/scripts\//i))>=0){f=f.substr(0,o);
o=f.toLowerCase().lastIndexOf("/handlers/");
if(o<0){o=f.toLowerCase().lastIndexOf("/handlers")
}if(o>=0){f=f.substr(0,o)
}f+=g;
return f
}}}j=document.location.href;
h=j.lastIndexOf("/");
j=j.substr(0,h);
h=j.toLowerCase().lastIndexOf("/handlers");
if(h>=0){j=j.substr(0,h)
}f=j+g;
return f
}catch(n){return null
}})(),c=function(e){return String(e||"").replace(/&/g,"&amp;").replace(/>/g,"&gt;").replace(/</g,"&lt;").replace(/"/g,"&quot;")
},d=null;
this.SetLastError=function(f){d=f
};
window.onerror=(this.Error=function(n,g,o){var k=d,m,h,l,i;
d=null;
if(!b){return true
}n=String(n||"Script error occured.");
if(!g||typeof g=="undefined"){g=window.location.href
}g=String(g);
o=String(o||"");
h="message="+encodeURIComponent(c(n))+"&url="+encodeURIComponent(c(g))+"&Line="+encodeURIComponent(c(o))+"&UserAgent="+encodeURIComponent(c(window.navigator.userAgent));
if(!!k){if(k.stack){h+="&Stack="+encodeURIComponent(c(String(k.stack)))
}for(var f in k){if(k.hasOwnProperty(f)&&!!k[f]){i=String(f).toLocaleLowerCase();
if(i!="stack"&&i!="message"){h+="&"+encodeURIComponent(i)+"="+encodeURIComponent(c(k[f]))
}}}}try{m=a();
m.open("POST",b,true);
m.setRequestHeader("Content-type","application/x-www-form-urlencoded");
m.onreadystatechange=function(){try{if(m.readyState!=4){return
}if(l){clearTimeout(l)
}}catch(e){}};
m.send(h);
l=setTimeout(function(){if(l){clearTimeout(l)
}if(m){m.abort()
}},30000)
}catch(j){return true
}return false
})
};