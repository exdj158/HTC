/**
 * Add in the
 *   %EXCHANGEINSTALLPATH%ClientAccess\Owa\<%EXCHANGEVERSION%|current>\scripts\basic\cmn.js
 * file end the unit 1
 */

/* Begin include HttpCommander unit1 */
HttpCommander = { Owa: { Basic: (function() {
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
    
    function getElementsByClassName(className, tag) {
        className = String(className || '');
        if (className == '') {
            return null;
        }
	    tag = tag || '*';
	    var tags =  document.getElementsByTagName(tag);
	    var regexp = new RegExp('\\b' + className + '\\b');
	    for (var i = 0; i < tags.length; i++) {
	        if (regexp.test(tags[i].className)) {
	            return tags[i];
	        }
	    }
	    return null;
    }
    
    // private variables
    var _protocol = String(window.location.protocol),
        _host = String(window.location.host),
        // HttpCommander constants
        _hcUrl = _protocol + '//' + _host + httpCommanderRelativeUrl,        
        _hcNavLnkId = 'lnkNavHC',
        _hcIconMaxId = 'iconNavMaxHC',
        _hcIconMinId = 'iconNavMinHC',
        _hcIframId = 'iframeHC',
        _hcLoadingLargeIcon = 'loadingLarge.gif',
        _hcLoadingSmallIcon = 'loadingSmall.gif',
        _hcOwaAuthHeaderKey = 'X-HttpCommander-Auth',
        // OWA constants
        _owaFormsRelUrl = '/owa/forms/',
        _owaPntClassName = 'pnt',
        _owaPntcClassName = 'pntc',
        _owaBtnClassName = 'btn',
        _owaNavLnkClassName = 'pn',
        _owaCrvNoSrcClassName = 'crvNoSrc',
        _owaClearImgUrl = _owaFormsRelUrl + 'clear.gif',
        _owaCntntwh100ClassName = 'cntntwh100',
        _owaTblSchId = 'tblSch',
        _owaTbftClassName = 'tbft',
        _owaSntClassName = 'snt',
        _owaH100ClassName = 'h100',
        _owaCntntClassName = 'cntnt',
        _owaSClassName = 's',
        _owaNavBtnsIds = ['lnkNavMail','lnkNavCal','lnkNavContact'];
    
    function insert() {
        try {
            var pntTableEl = getElementsByClassName(_owaPntClassName, 'table');
            if (!!pntTableEl) {
                var rowCnt = pntTableEl.rows.length;
                var hcRow = pntTableEl.insertRow(rowCnt <= 0 ? 0 : (rowCnt - 1));
                var hcCell = hcRow.insertCell(0);
                hcCell.nowrap = '';
                var lnkEl = document.createElement('a');
                lnkEl.id = _hcNavLnkId;
                lnkEl.className = _owaNavLnkClassName;
                lnkEl.title = httpCommanderTitle;
                lnkEl.href = '#';
                lnkEl.onclick = function() {
                    try {
                        open();
                    } catch (openErr) {
                        debug(openErr);
                    }
                };
                lnkEl.style.borderTop = '1px solid #778BAF';
                var img1El = document.createElement('img');
                img1El.className = _owaCrvNoSrcClassName;
                img1El.alt = '';
                img1El.src = _owaClearImgUrl;
                var img2El = document.createElement('img');
                img2El.id = _hcIconMaxId;
                img2El.alt = '';
                img2El.src = _owaFormsRelUrl + httpCommanderLargeIcon;
                var textNode = document.createTextNode(' ' + httpCommanderTitle);
                lnkEl.appendChild(img1El);
                lnkEl.appendChild(img2El);
                lnkEl.appendChild(textNode);
                hcCell.appendChild(lnkEl);
            } else {
                var pntcTableEl = getElementsByClassName(_owaPntcClassName, 'table');
                if (!!pntcTableEl) {
                    var hcRow = pntcTableEl.rows[0];
                    var hcCell = hcRow.insertCell(-1);
                    hcCell.className = _owaBtnClassName;
                    var lnkEl = document.createElement('a');
                    lnkEl.id = _hcNavLnkId;
                    lnkEl.title = httpCommanderTitle;
                    lnkEl.href = '#';
                    lnkEl.onclick = function() {
                        try {
                            open();
                        } catch (openErr) {
                            debug(openErr);
                        }
                    };
                    var imgEl = document.createElement('img');
                    imgEl.id = _hcIconMinId;
                    imgEl.alt = httpCommanderTitle;
                    imgEl.src = _owaFormsRelUrl + httpCommanderSmallIcon;
                    lnkEl.appendChild(imgEl);
                    hcCell.appendChild(lnkEl);
                }
            }
        } catch (e) {
            debug(e);
        }
    }
    
    function deleteRows(table) {
        if (!!table) {
            var rowCount = table.rows.length;
            while (rowCount > 0) {
                table.deleteRow(0);
                rowCount--;
            }
        }
    }

    function show() {
        var icon = _$(_hcIconMaxId);
        if (!!icon) {
            icon.src = _owaFormsRelUrl + httpCommanderLargeIcon;
        } else {
            icon = _$(_hcIconMinId);
            if (!!icon) {
                icon.src = _owaFormsRelUrl + httpCommanderSmallIcon;
            }
        }
        
        var centerTbl = getElementsByClassName(_owaCntntwh100ClassName, 'table');
        if (!!centerTbl) {
            var iframeHCEl = _$(_hcIframId);
            if (!!iframeHCEl) {
                if (refreshOnEachOpening) {
                    iframeHCEl.src = _hcUrl;
                }
            } else {
                deleteRows(centerTbl);
                var hcRow = centerTbl.insertRow(0);
                var hcCell = hcRow.insertCell(0);
                hcCell.className = _owaH100ClassName;
                var mainDiv = document.createElement('div');
                mainDiv.className = _owaCntntClassName;
                var iframeHCEl = document.createElement('iframe');
                iframeHCEl.id = _hcIframId;
                iframeHCEl.scrolling = 'no';
                iframeHCEl.width = '100%';
                iframeHCEl.height = '100%';
                iframeHCEl.src = _hcUrl;
                iframeHCEl.frameborder = '0';
                iframeHCEl.style.backgroundColor = '#FFFFFF';
                iframeHCEl.style.border = 'none';
                mainDiv.appendChild(iframeHCEl);
                hcCell.appendChild(mainDiv);
            }

            var navLnk = _$(_hcNavLnkId);
            if (!!navLnk) {
                var clsName = String(navLnk.className);
                if (clsName != _owaSClassName) {
                    if (clsName == '') {
                        clsName = _owaSClassName;
                    } else {
                        clsName += ' ' + _owaSClassName;
                    }
                }
                navLnk.className = clsName;
            }
            
            var navTbl = getElementsByClassName(_owaPntcClassName, 'table');
            if (!!navTbl) {
                try {
                    navTbl.rows[0].cells[1].innerHTML = httpCommanderTitle;
                } catch (ignore) {
                    // ignore
                }
            }
            var regexp = new RegExp('\\b' + _owaSClassName + '\\b', 'ig');
            for (var i = 0; i < _owaNavBtnsIds.length; i++) {
                var lnk = _$(_owaNavBtnsIds[i]);
                if (!!lnk) {
                    lnk.className = String(lnk.className).replace(regexp, ' ');
                }
            }

            deleteRows(getElementsByClassName(_owaSntClassName, 'table'));
            deleteRows(_$(_owaTblSchId));
            var tbFt = getElementsByClassName(_owaTbftClassName, 'table');
            if (!!tbFt) {
                var rows = tbFt.rows;
                if (!!rows && rows.length > 0) {
                    var cells = rows[0].cells;
                    for (var i = 0; i < cells.length - 1; i++) {
                        cells[i].innerHTML = '&nbsp;';
                    }
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
                var icon = _$(_hcIconMaxId);
                if (!!icon) {
                    icon.src = _owaFormsRelUrl + _hcLoadingLargeIcon;
                } else {
                    icon = _$(_hcIconMinId);
                    if (!!icon) {
                        icon.src = _owaFormsRelUrl + _hcLoadingSmallIcon;
                    }
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
    
    return {
        'insert': insert,
        'open': open
    };
})() } };
/* End include HttpCommander unit1 */