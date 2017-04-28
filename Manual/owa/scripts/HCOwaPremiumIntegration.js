/**
 * Insert the unit2 into the
 *   %EXCHANGEINSTALLPATH%ClientAccess\Owa\<%EXCHANGEVERSION%|current>\scripts\premium\uglobal.js
 * file beginning
 */

/* Begin include HttpCommander unit2 */
HttpCommander = { Owa: { Premium: (function() {
    /* Variables for sets by admins */    
    // set true for show alerts on errors
    var debugmode = false;
    // set true for refresh HttpCommander site in iframe on each opening from menu in OWA
    var refreshOnEachOpening = false;
    // relative HttpCommander url (Important! Shall begin with the character '/')
    var httpCommanderRelativeUrl = '/HTCOMNET/';
    // name for display in the menu and OWA title
    var httpCommanderTitle = 'Http Commander';
    // large and small icon names for HttpCommander (located in /owa/forms/)
    var httpCommanderLargeIcon = 'HttpCommanderLarge.png';
    var httpCommanderSmallIcon = 'HttpCommanderSmall.png';
    // HTML info about HTTP Commander instance
    var httpCommanderDescription = '';
    
    function debug(e) { // if debugmode=true show alert with specified error e
        if (debugmode === true) {
            window.alert(e || 'Unknown error');
        }
    }
    
    function _$(elId) {
        return document.getElementById(elId);
    }
    
    var getXhrInstance = (function() {
        var options = [
            function() { return new XMLHttpRequest(); },
            function() { return new ActiveXObject('MSXML2.XMLHTTP.7.0'); },
            function() { return new ActiveXObject('MSXML2.XMLHTTP.6.0'); },
            function() { return new ActiveXObject('MSXML2.XMLHTTP.5.0'); },
            function() { return new ActiveXObject('MSXML2.XMLHTTP.4.0'); },
            function() { return new ActiveXObject('MSXML2.XMLHTTP.3.0'); },
            function() { return new ActiveXObject('MSXML2.XMLHTTP'); },
            function() { return new ActiveXObject('Microsoft.XMLHTTP'); }
        ], i = 0, len = options.length, xhr;
        for(; i < len; ++i) {
            try {
                xhr = options[i];
                xhr();
                break;
            } catch(e) { }
        }
        return xhr;
    })();
    
    function xhrRequest(url, headers, callback, user, pass, method, ctx) {
        method = method || 'HEAD';
        url = url || location.href;
        headers = headers || {};
        ctx = ctx || window;
        
        var xhr = getXhrInstance();        
        if (typeof user == 'string' && typeof pass == 'string' && user.length > 0) {
            xhr.open(method, url, true, user, pass);
        } else {
            xhr.open(method, url, true);
        }        
        for (var header in headers) {
            if (headers.hasOwnProperty(header)) {
                xhr.setRequestHeader(header, headers[header]);
            }
        }
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && typeof callback == 'function') {
                callback.call(ctx, xhr.responseText, xhr);
            }
        };
        xhr.send(null);
        
        return xhr;
    }
    
    var Base64 = (function() {
        var _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var _utf8_encode = function (string) {
            string = string.replace(/\r\n/g, '\n');
            var utftext = '';
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        };
        var _utf8_decode = function (utftext) {
            var string = '';
            var i = 0;
            var c = c1 = c2 = 0;
            while (i < utftext.length) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if ((c > 191) && (c < 224)) {
                    c1 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c1 & 63));
                    i += 2;
                } else {
                    c1 = utftext.charCodeAt(i + 1);
                    c2 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
                    i += 3;
                }
            }
            return string;
        };
        return {
            encode: function (input) {
                var output = "";
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                var i = 0;
                input = _utf8_encode(input);
                while (i < input.length) {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);
                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;
                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }
                    output = output +
			            _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
			            _keyStr.charAt(enc3) + _keyStr.charAt(enc4);

                }
                return output;
            },
            decode: function (input) {
                if (input == null)
                    return "";
                var output = "";
                var chr1, chr2, chr3;
                var enc1, enc2, enc3, enc4;
                var i = 0;
                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                while (i < input.length) {
                    enc1 = _keyStr.indexOf(input.charAt(i++));
                    enc2 = _keyStr.indexOf(input.charAt(i++));
                    enc3 = _keyStr.indexOf(input.charAt(i++));
                    enc4 = _keyStr.indexOf(input.charAt(i++));
                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;
                    output = output + String.fromCharCode(chr1);
                    if (enc3 != 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 != 64) {
                        output = output + String.fromCharCode(chr3);
                    }
                }
                output = _utf8_decode(output);
                return output;
            }
        };
    })();
    
    // private variables
    var _protocol = new String(window.location.protocol),
        _host = new String(window.location.host),
        // HttpCommander constants
        _hcUrl = _protocol + '//' + _host + httpCommanderRelativeUrl,        
        _hcLnkMaxId = 'lnkHC',
        _hcLnkMinId = 'lnkQlHC',
        _hcIconMaxId = 'iconNavMaxHC',
        _hcIconMinId = 'iconNavMinHC',
        _hcIframId = 'iframeHC',
        _hcLoadingLargeIcon = 'loadingLarge.gif',
        _hcLoadingSmallIcon = 'loadingSmall.gif',
        _hcOwaAuthHeaderKey = 'X-HttpCommander-Auth',
        _hcInfoBar = 'infoHC',
        // OWA constants
        _owaFormsRelUrl = '/owa/forms/',
        _owaNavBtnsIds = ['Mail','Calendar','Contacts','Tasks','PublicFolders'],
        _owaDivNbMaxId = 'divNbMax',
        _owaDivSecNvId = 'divSecNv',
        _owaDivNbMinId = 'divNbMin',
        _owaNbWunderBarClassName = 'nbWunderBar',
        _owaDivMainViewId = 'divMainView',
        _owaDivMdNmId = 'divMdNm',
        _owaLnkMaxNoHiLtClassNames = 'nbMnuItm nbMnuItmN nbNoHiLt',
        _owaLnkMinNoHiLtClassNames = 'nbMnuItm nbMnuItmWS nbNoHiLt',
        _owaLnkMaxHiLtClassNames = 'nbMnuItm nbMnuItmN nbHiLt',
        _owaLnkMinHiLtClassNames = 'nbMnuItm nbMnuItmWS nbHiLt',
        _owaIconMaxClassName = 'nbMnuImgN',
        _owaIconMinClassName = 'nbMnuImgWS',
        _owaLabelMaxClassName = 'nbMainTxt',
        _owaMainViewClassName = 'mainView',
        _owaSecNvPaneContClassName = 'secNvPaneCont';
        
    function removeHiLt(el) {
        if (!!el && el.className) {
            el.className = (new String(el.className)).replace('nbHiLt', 'nbNoHiLt');
        }
    }
    
    function insert() {
        try {
            var divNbMaxEl = _$(_owaDivNbMaxId);
            if (!!divNbMaxEl) {
                var linkMaxEl = document.createElement('a');
                linkMaxEl.className = _owaLnkMaxNoHiLtClassNames;
                linkMaxEl.id = _hcLnkMaxId;
                linkMaxEl.href = '#';
                linkMaxEl.onclick = function() {
                    try {
                        open();
                    } catch(openErr) {
                        debug(openErr);
                    }
                };

                var iconMaxEl = document.createElement('img');
                iconMaxEl.id = _hcIconMaxId;
                iconMaxEl.className = _owaIconMaxClassName;
                iconMaxEl.src = _owaFormsRelUrl + httpCommanderLargeIcon;

                var labelMaxEl = document.createElement('span');
                labelMaxEl.className = _owaLabelMaxClassName;
                labelMaxEl.innerHTML = httpCommanderTitle;
                
                linkMaxEl.appendChild(iconMaxEl);
                linkMaxEl.appendChild(labelMaxEl);                
                divNbMaxEl.appendChild(linkMaxEl);
                if (divNbMaxEl.style.display != 'none') {
		            var divSecNvEl = _$(_owaDivSecNvId);
		            if (!!divSecNvEl) {
			            divSecNvEl.style.bottom = '192px';
                    }
			    }

			    var br = document.createElement('br');
			    divNbMaxEl.appendChild(br);
            }

            var divNbMinEl = _$(_owaDivNbMinId);
            if (!!divNbMinEl) {
                var nbWunderBarEl;
                var divs = divNbMinEl.getElementsByTagName('div'),
                    d = divs.length;
                while (d--) {
                    if(divs[d].className.search('\\b' + _owaNbWunderBarClassName + '\\b') != -1) {
                        nbWunderBarEl = divs[d];
                        break;
                    }
                }
                if (!!nbWunderBarEl) {
                    var linkMinEl = document.createElement('a');
                    linkMinEl.className = _owaLnkMinNoHiLtClassNames;
                    linkMinEl.id = _hcLnkMinId;
                    linkMinEl.title = httpCommanderTitle;
                    linkMinEl.href = '#';
                    linkMinEl.onclick = function() {
                        try {
                            open();
                        } catch(openErr) {
                            debug(openErr);
                        }
                    };
                    
                    var iconMinEl = document.createElement('img');
                    iconMinEl.id = _hcIconMinId;
                    iconMinEl.className = _owaIconMinClassName;
                    iconMinEl.src = _owaFormsRelUrl + httpCommanderSmallIcon;

                    var links = nbWunderBarEl.getElementsByTagName('a');
                    if (links.length > 0) {
                        var n = links.length;
                        var w = Math.round(100 / (n + 1));
                        var wStr = new String('' + w + '%');
                        if (w > 1) {
                            linkMinEl.style.width = new String('' + (100-n*w) + '%');
                            while (n--) {
                                links[n].style.width = wStr;
                            }
                        }
                    }
                    
                    linkMinEl.appendChild(iconMinEl);
                    nbWunderBarEl.appendChild(linkMinEl);
                }
            }

            var divSecNvEl = _$(_owaDivSecNvId);
            if (!!divSecNvEl) {
                var divInfoHC = _$(_hcInfoBar);
                if (!divInfoHC) {
                    divInfoHC = document.createElement('div');
                    divInfoHC.id = _hcInfoBar;
                    divInfoHC.className = _owaSecNvPaneContClassName;
                    divInfoHC.style.display = 'none';
                    divInfoHC.innerHTML = httpCommanderDescription;
                    divSecNvEl.appendChild(divInfoHC);
                } else {
                    divInfoHC.style.display = 'none';
                }
            }
        } catch (e) {
            debug(e);
        }
    }

    function show() { 
        var iconMax = _$(_hcIconMaxId);
        if (!!iconMax) {
            iconMax.src = _owaFormsRelUrl + httpCommanderLargeIcon;
        }
        var iconMin = _$(_hcIconMinId);
        if (!!iconMin) {
            iconMin.src = _owaFormsRelUrl + httpCommanderSmallIcon;
        }
    
        var divMainViewEl = _$(_owaDivMainViewId);
        if (!!divMainViewEl) {
            var divMdNmEl = _$(_owaDivMdNmId);
            if (!!divMdNmEl) {
                divMdNmEl.innerHTML = httpCommanderTitle;
            }
            
            var divSecNvEl = _$(_owaDivSecNvId);
            if (!!divSecNvEl) {
                var child = divSecNvEl.firstChild;
                while (child) {
                    if (child.nodeType == 1 && child.tagName.toUpperCase() == 'DIV' && child.style) {
                        child.style.display = child.id == _hcInfoBar ? '' : 'none';
                    }
                    child = child.nextSibling;
                }
            }
            
            var child = divMainViewEl.firstChild;
            while (child) {
                if (child.nodeType == 1 && child.style) {
                    child.style.display = 'none';
                }
                child = child.nextSibling;
            }
            var divNbMaxEl = _$(_owaDivNbMaxId);
            if (!!divNbMaxEl) {
                var child = divNbMaxEl.firstChild;
                while (child) {
                    if (child.nodeType == 1 && child.tagName.toUpperCase() == 'A') {
                        removeHiLt(child);
                    }
                    child = child.nextSibling;
                }
                var lnkHCEl = _$(_hcLnkMaxId);
                if (!!lnkHCEl) {
                    lnkHCEl.className = _owaLnkMaxHiLtClassNames;
                }
            }
            
            var divNbMinEl = _$(_owaDivNbMinId);
            if (!!divNbMinEl) {
                var nbWunderBarEl;
                var divs = divNbMinEl.getElementsByTagName('div'),
                    d = divs.length;
                while (d--) {
                    if(divs[d].className.search('\\b' + _owaNbWunderBarClassName + '\\b') != -1) {
                        nbWunderBarEl = divs[d];
                        break;
                    }
                }
                if (!!nbWunderBarEl) {
                    var child = nbWunderBarEl.firstChild;
                    while (child) {
                        if (child.nodeType == 1 && child.tagName.toUpperCase() == 'A') {
                            removeHiLt(child);
                        }
                        child = child.nextSibling;
                    }
                    var lnkQlHCEl = _$(_hcLnkMinId);
                    if (!!lnkQlHCEl) {
                        lnkQlHCEl.className = _owaLnkMinHiLtClassNames;
                    }
                }
            }
            
            var iframeHCEl = _$(_hcIframId);
            if (!iframeHCEl) {
                iframeHCEl = document.createElement('iframe');
                iframeHCEl.id = _hcIframId;
                iframeHCEl.scrolling = 'no';
                iframeHCEl.width = '100%';
                iframeHCEl.height = '100%';
                iframeHCEl.src = _hcUrl;
                iframeHCEl.className = _owaMainViewClassName;
                iframeHCEl.style.backgroundColor = '#FFFFFF';
                iframeHCEl.style.border = 'none';
                iframeHCEl.frameborder = '0';
                divMainViewEl.appendChild(iframeHCEl);
            } else {
                iframeHCEl.style.display = '';
                if (refreshOnEachOpening === true) {
                    iframeHCEl.src = _hcUrl;
                }
            }
        }
    }
    
    function open() {
        try {
            var iframeHCEl = _$(_hcIframId);
            if (!!iframeHCEl) {
                show();
            } else {
                var iconMax = _$(_hcIconMaxId);
                if (!!iconMax) {
                    iconMax.src = _owaFormsRelUrl + _hcLoadingLargeIcon;
                }
                var iconMin = _$(_hcIconMinId);
                if (!!iconMin) {
                    iconMin.src = _owaFormsRelUrl + _hcLoadingSmallIcon;
                }
                try {
                    var headers = {};
                    headers[_hcOwaAuthHeaderKey] = 'Need auth header';
                    xhrRequest(location.href, headers, function (resp, xhr) {
                        if (xhr) {
                            var auth = xhr.getResponseHeader(_hcOwaAuthHeaderKey);
                            if (auth) {
                                auth = Base64.decode(decodeURIComponent(auth));
                                var i = auth.indexOf(':');
                                var user = i >= 0 ? auth.substring(0, i) : auth;
                                var pass = i >= 0 ? auth.substring(i + 1) : '';
                                xhrRequest(_hcUrl, {}, function(resp, xhr) {
                                    if (!xhr || xhr.status != 200) {
                                        var msg = 'Unknown error in case of Http Commander authentication';
                                        if (xhr && xhr.status) {
                                            if (xhr.status == 401) {
                                                msg = 'Your attempt of login in Http Commander was not successful';
                                            } else {
                                                msg = '' + xhr.status;
                                                if (xhr.statusText) {
                                                    msg += '. ' + xhr.statusText;
                                                }
                                            }
                                        }
                                        debug(msg);
                                    }
                                    show();
                                }, user, pass);
                            } else {
                                show();
                            }
                        } else {
                            show();
                        }
                    });
                } catch (ie) {
                    debug(ie);
                    show();
                }
            }
        } catch (oe) {
            debug(oe);
        }
    }    
    
    function hide(nb) {
        try {
            var hcVeiwIframe = _$(_hcIframId);
            if (!!hcVeiwIframe) {
                hcVeiwIframe.style.display = 'none';
            }
            
            var lnkHCEl = _$(_hcLnkMaxId);
            if (!!lnkHCEl) {
                lnkHCEl.className = _owaLnkMaxNoHiLtClassNames;
            }
            
            var lnkQlHCEl = _$(_hcLnkMinId);
            if (!!lnkQlHCEl) {
                lnkQlHCEl.className = _owaLnkMinNoHiLtClassNames;
            }

            if (typeof nb != 'undefined' && typeof _owaNavBtnsIds[nb] == 'string') {
                var navBtn = _$(_owaNavBtnsIds[nb]);
                if (!!navBtn) {
                    navBtn.style.display = '';
                }
            }

            var divInfoBar = _$(_hcInfoBar);
            if (!!divInfoBar) {
                divInfoBar.style.display = 'none';
            }
        } catch (e) {
            debug(e);
        }
    }
    
    return {
        'insert': insert,
        'open': open,
        'hide': hide
    };
})() } };
/* End include HttpCommander unit2 */