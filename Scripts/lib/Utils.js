Ext.ns('HttpCommander.Lib');

HttpCommander.Lib.Utils = {

    getXhrInstance: (function () {
        var options = [
            function () { return new XMLHttpRequest(); },
            function () { return new ActiveXObject('MSXML2.XMLHTTP.7.0'); },
            function () { return new ActiveXObject('MSXML2.XMLHTTP.6.0'); },
            function () { return new ActiveXObject('MSXML2.XMLHTTP.5.0'); },
            function () { return new ActiveXObject('MSXML2.XMLHTTP.4.0'); },
            function () { return new ActiveXObject('MSXML2.XMLHTTP.3.0'); },
            function () { return new ActiveXObject('MSXML2.XMLHTTP'); },
            function () { return new ActiveXObject('Microsoft.XMLHTTP'); }
        ], i = 0, len = options.length, xhr;
        for (; i < len; ++i) {
            try {
                xhr = options[i];
                xhr();
                break;
            } catch (e) { }
        }
        return xhr;
    })(),

    getPopupProps: function (width, height) {
        if (!Ext.isNumber(width) || width <= 0) {
            width = 900;
        }
        if (!Ext.isNumber(height) || height <= 0) {
            height = 600;
        }
        var left = ((screen.width / 2) - (width / 2)),
            top = (screen.height - height) / 4;
        return 'scrollbars=yes,menubar=no,toolbar=no,location=no,status=no,resizable=yes,directories=no'
            + ',width=' + width + ',height=' + height + ',top=' + top + ',left=' + left;
    },

    getChar: function (e) {
        if (!e) return null;
        if (Ext.isEmpty(e.which)) { // IE or Firefox
            if (e.charCode != 0) { // Firefox
                if (e.charCode < 32) return null; // spec. symobl
                return String.fromCharCode(e.charCode);
            }
            // IE
            if (e.keyCode < 32) return null; // spec. symbol
            return String.fromCharCode(e.keyCode);
        }
        if (e.which != 0 && e.charCode != 0) { // all instead IE
            if (e.which < 32) return null; // spec. symbol
            return String.fromCharCode(e.which); // others
        }
        return null; // spec. symbol
    },

    // Check input value on angle brackets and htmlEncode if exists
    checkBracketsAndHtmlEncode: function (value) {
        return /(>|<|'|")/g.test(value)
            ? Ext.util.Format.htmlEncode(value)
            : value;
    },

    /***
    ** Get error message from data object and html encode if needed
    **  obj - object with message|msg|error|errors property
    **  defaultMsg - if property message|msg|error|errors not in obj or obj null|udefinded
    **      returned this defaultMsg
    **  htmlEncodeType:
    **      0 or undefinde  - use Ext.util.Format.htmlEncode function
    **      1               - use HttpCommander.Lib.Utils.checkBracketsAndHtmlEncode function
    **      2               - without html encoding
    */
    getAndHtmlEncodeMessage: function (obj, defaultMsg, htmlEncodeType) {
        var encodeFunc = htmlEncodeType === 2
            ? HttpCommander.Lib.Utils.checkBracketsAndHtmlEncode
            : htmlEncodeType === 1
                ? Ext.util.Format.htmlEncode
                : function (v) { return v; };
        var msg = null;
        if (obj) {
            msg = obj.message;
            if (!msg || msg == '')
                msg = obj.msg;
            if (!msg || msg == '')
                msg = obj.error;
            if (!msg || msg == '')
                msg = obj.errors;
            if (!msg || msg == '')
                msg = defaultMsg;
        }
        if (!msg) {
            msg = defaultMsg;
        }
        return encodeFunc(String(msg));
    },

    // Function for check result of direct handler with show error (msg - is Ext.MessageBox).
    //  data - json reponse,
    //  trans - info about direct handler or object with info about communication error,
    //  msg - Ext.Msg object,
    //  cfg - htcConfig object
    checkDirectHandlerResult: function (data, trans, msg, cfg, encType, cb) {
        msg.hide();
        if (typeof data == 'undefined' || !data) {
            msg.show({
                title: cfg.locData.CommonErrorCaption,
                msg: HttpCommander.Lib.Utils.getAndHtmlEncodeMessage(trans, cfg.locData.UploadFromUrlUnknownResponse),
                closable: true,
                modal: true,
                buttons: msg.CANCEL,
                icon: msg.ERROR
            });
            return false;
        }
        if ((typeof data.success != 'undefined' && !data.success) ||
            (typeof data.status != 'undefined' && data.status != 'success')) {
            if (typeof cb == 'function') {
                cb();
            }
            msg.show({
                title: cfg.locData.CommonErrorCaption,
                msg: HttpCommander.Lib.Utils.getAndHtmlEncodeMessage(data, cfg.locData.UploadFromUrlUnknownResponse, encType),
                closable: true,
                modal: true,
                buttons: msg.CANCEL,
                icon: msg.ERROR
            });
            return false;
        }
        return true;
    },

    getIconPath: function (config, name) {
        var htccfg = config.htcConfig || config.htcCfg || (Ext.isFunction(config.getHtcConfig) ? config.getHtcConfig() : config);
        return htccfg.relativePath + htccfg.iconSet.path + name + (name && name.indexOf('.gif') < 0 ? htccfg.iconSet.ext : '');
    },

    //getIconCls: function (config, name, size) {
    //    size = size || 16;
    //    var htccfg = config.htcConfig || config.htcCfg || (Ext.isFunction(config.getHtcConfig) ? config.getHtcConfig() : config);
    //    return 'icons-sprite-' + size + '-' + name; //TODO: check htccfg.iconSet.ext on '.svg' and use icons-sprite-svg
    //},

    getScriptSource: function (scripts) {
        scripts = scripts || document.getElementsByTagName('script');
        var script, len = scripts.length, src, docUrl, prefixLen;
        for (var i = 0; i < len; i++) {
            script = scripts[i];
            src = (typeof script.getAttribute.length != 'undefined')
                ? script.src                     // FF/Chrome/Safari (only FYI, this would work also in IE8)
                : script.getAttribute('src', 4); // IE 6/7/8 using 4 (and not -1) see MSDN http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx

            if ((src || '').toLowerCase().indexOf("scripts/error-handler.js") < 0 &&
                (src || '').toLowerCase().indexOf("scripts/error-handler-debug.js") < 0) {
                continue;
            }

            // src variable should contain absolute URL of this script file,
            // IE 8, however, sometimes returns relative URL.
            // As far as I can see IE always returns relative URL
            // when this script is used as part of HttpCommander.
            if (src.match(/^https?:\/\//i)) { // absolute URL
                return src;
            }
        }
        // src - relative URL
        docUrl = document.location.href;
        prefixLen = docUrl.lastIndexOf('/');
        // create absolute URL
        src = docUrl.substr(0, prefixLen + 1) + src;
        return src;
    },

    flashPlayerIsSupported: function () {
        if (typeof navigator.plugins != 'undefined' &&
            typeof navigator.plugins['Shockwave Flash'] == 'object') {
            if (typeof navigator.mimeTypes != 'undefined' &&
                navigator.mimeTypes['application/x-shockwave-flash'] &&
                navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
                return true;
            }
        } else if (typeof window.ActiveXObject != 'undefined' || HttpCommander.Lib.Utils.browserIs.ie11up) {
            try {
                if (new ActiveXObject('ShockwaveFlash.ShockwaveFlash')) {
                    return true;
                }
            } catch (e) {
                // ignore
            }
        }
        return false;
    },

    webglAvailable: function() {
        try {
            var canvas = document.createElement('canvas');
            return !!window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch(e) { 
            return false;
        }
    },

    /* DOM */

    // Get absolute offset position for element
    offsetPosition: function (element) {
        var offsetLeft = offsetTop = 0;
        try {
            do {
                offsetLeft += element.offsetLeft;
                offsetTop += element.offsetTop;
            } while (element = element.offsetParent);
        } catch (e) { }
        return [offsetLeft, offsetTop];
    },

    // Remove element with ID 'elId' from DOM
    removeElementFromDOM: function (elId) {
        var el = document.getElementById(elId);
        if (el) {
            try {
                el.parentNode.removeChild(el);
                return true;
            } catch (e) { }
        }
        return false;
    },

    // Add handler for element on event
    addHandler: function (element, event, handler) {
        if (!!element.addEventListener) {
            element.addEventListener(event.toLowerCase(), handler, false);
        } else if (!!element.attachEvent) {
            element.attachEvent('on' + event.toLowerCase(), handler);
        } else {
            element['on' + event.toLowerCase()] = handler;
        }
    },

    // Prevent selection
    preventSelection: function (element, processScriptErrorFunction) {
        HttpCommander.Lib.Utils.addHandler(element, 'selectstart', function (event) {
            event = event || window.event;
            var sender = event.target || event.srcElement;
            try {
                if (sender && sender.tagName && sender.tagName.match(/INPUT|TEXTAREA/i)) {
                    return;
                }
                if (event.preventDefault) {
                    event.preventDefault();
                }
                if (event.stopPropagation) {
                    event.stopPropagation();
                }
                if (event.returnValue) {
                    window.event.returnValue = false;
                }
                if (event.stopEvent) {
                    event.stopEvent();
                }
                if (window.getSelection) {
                    /*setTimeout(function () {
                    window.getSelection().removeAllRanges();
                    }, 0);*/
                    try { window.getSelection().removeAllRanges(); }
                    catch (e) { /* suppress, becouse maybe error in IE: Could not complete the operation due to error 800a025e */ }
                } else if (document.selection && document.selection.clear) {
                    document.selection.clear();
                }
                return false;
            } catch (e) {
                if (typeof processScriptErrorFunction == 'function') {
                    processScriptErrorFunction(e);
                } else {
                    throw e;
                }
            }
        });
    },

    queryString: function (paramName) {
        paramName = String(paramName || '');
        if (paramName == '') {
            return '';
        }
        paramName = paramName.toLowerCase();
        var qStr = window.location.search.substr(1).split('&');
        for (var i = 0; i < qStr.length; i++) {
            var keyVal = qStr[i].split('=');
            if (keyVal.length > 1 && decodeURIComponent(keyVal[0]).toLowerCase() == paramName) {
                return decodeURIComponent(keyVal[1]);
            }
        }
        return '';
    },

    checkAndGetNewExtensionConvertedFromGoogle: function (extension) {
        var newExt = '';
        if (Ext.isEmpty(extension)) {
            return newExt;
        }
        var ext = extension.toLowerCase();
        if (HttpCommander.Lib.Consts.googleEditFormatsForConvert.indexOf(';' + ext + ';') >= 0) {
            if (ext.indexOf('pp') == 0) {
                newExt = 'pptx';
            } else if (ext.length == 3) {
                newExt = ext + 'x';
            } else {
                newExt = ext.replace('m', 'x');
            }
        }
        return newExt;
    },

    checkAndGetNewExtensionConvertedFromMSOO: function (extension) {
        var newExt = '';
        if (Ext.isEmpty(extension)) {
            return newExt;
        }
        var ext = extension.toLowerCase();
        if (HttpCommander.Lib.Consts.msooEditFormatsForConvert.indexOf(';' + ext + ';') >= 0) {
            newExt = ext + 'x';
            if (newExt == 'ppsx') {
                newExt = 'pptx';
            }
        }
        return newExt;
    },

    getFileExtension: function (filename) {
        var ext = '';
        if (typeof filename == 'undefined' || !filename)
            return ext;
        var lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex >= 0)
            ext = filename.substring(lastDotIndex + 1, filename.length).toLowerCase();
        return ext;
    },

    // get last component of the path
    getFileName: function (path) {
        if (path == "")
            return "";
        var ind = path.lastIndexOf("/");
        if (ind < 0)
            return path;
        else
            return path.substr(ind + 1);
    },

    /* return a Date object representing the midnight of the current day
    In other words, get the now date and time, them strip the time part. */
    getTodayDate: function () {
        var d = new Date();
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);
        return d;
    },
    getNextYearDate: function () {
        var d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);
        return d;
    },

    getXTypeColumn: function (columnType) { // get 'xtype' for specified column type
        switch (columnType) {
            case 'int': case 'float': return 'numbercolumn';
            case 'date': return 'datecolumn';
            case 'bool': case 'boolean':
                if (Ext.grid.Column.types.checkcolumn) return 'checkcolumn'; // TODO
                else return 'booleancolumn';
            default: return 'gridcolumn';
        }
    },
    getAlignColumn: function (columnType) { // get align column for specified column type
        switch (columnType) {
            case 'int': case 'float': return 'right';
            case 'bool': case 'boolean': return 'center';
            default: return 'left'; // undefined;
        }
    },

    browserIs: new (function () {
        try {
            // copy to clipboard support
            this.copyToClipboard = false;
            try {
                var ctcSupported = !!document.queryCommandSupported;
                this.copyToClipboard = ctcSupported && !!document.queryCommandSupported('copy');
            } catch (err) { }

            this.firefox36up = false; // set first to be sure that this vars is initiated
            this.firefox35up = false;
            var agt = navigator.userAgent.toLowerCase();
            this.osver = 1.0;
            if (agt) {
                var stOSVer = agt.substring(agt.indexOf("windows ") + 11);
                this.osver = parseFloat(stOSVer);
            }
            this.major = parseInt(navigator.appVersion);
            this.nav = ((agt.indexOf('mozilla') != -1) && ((agt.indexOf('spoofer') == -1) && (agt.indexOf('compatible') == -1)));
            this.nav6 = this.nav && (this.major == 5);
            this.nav6up = this.nav && (this.major >= 5);
            this.nav7up = false;
            var navIdx
            if (this.nav6up) {
                navIdx = agt.indexOf('netscape/');
                if (navIdx >= 0) {
                    this.nav7up = parseInt(agt.substring(navIdx + 9)) >= 7;
                }
            }
            this.ie = (agt.indexOf('msie') != -1);
            this.aol = this.ie && agt.indexOf(' aol ') != -1;
            if (this.ie) {
                var stIEVer = agt.substring(agt.indexOf('msie ') + 5);
                this.iever = parseInt(stIEVer);
                this.verIEFull = parseFloat(stIEVer);
            } else {
                this.iever = 0;
            }
            this.ie4up = this.ie && (this.major >= 4);
            this.ie5up = this.ie && (this.iever >= 5);
            this.ie55up = this.ie && (this.verIEFull >= 5.5);
            this.ie6up = this.ie && (this.iever >= 6);
            this.ie7down = this.ie && (this.iever <= 7);
            this.ie7up = this.ie && (this.iever >= 7);
            this.ie8standard = this.ie && document.documentMode && (document.documentMode == 8);
            this.ie9up = this.ie && (this.iever >= 9);
            this.ie9standard = this.ie && document.documentMode && (document.documentMode == 9);
            this.ie10up = this.ie && (this.iever >= 10);
            this.ie10standard = this.ie && document.documentMode && (document.documentMode == 10);
            this.ie11up = document.documentMode && (document.documentMode >= 11);
            if (!this.ie && this.ie11up) {
                this.ie = true;
                this.iever = document.documentMode;
            }
            // edge
            var edgeVerIdx = agt.indexOf('edge/')
            this.edge = edgeVerIdx >= 0;
            this.edgeVer = 0;
            this.edge10586up = false;
            if (this.edge) {
                this.edgeVer = parseFloat(agt.substring(edgeVerIdx + 5));
                this.edge10586up = (this.edgeVer >= 13.10586); // for support dran-n-drop upload
            }

            this.winnt = ((agt.indexOf('winnt') != -1) || (agt.indexOf('windows nt') != -1));
            this.win32 = ((this.major >= 4) && (navigator.platform == 'Win32')) || (agt.indexOf('win32') != -1) || (agt.indexOf("32bit") != -1);
            this.win64bit = (agt.indexOf('win64') != -1) || (agt.indexOf('wow64') != -1);
            this.win = this.winnt || this.win32 || this.win64bit;
            this.mac = (agt.indexOf('mac') != -1);

            // iOS
            this.ipad = (agt.indexOf('ipad') != -1);
            this.iphone = (agt.indexOf('iphone') != -1);
            this.ipod = (agt.indexOf('ipod') != -1);
            this.ios = this.ipad || this.iphone || this.ipod;
            this.ios6up = false;
            if (this.ios) {
                var iosVer = 0;
                var iosVerRegex = /os\s+(\d+)(_\d+)*\s+like\s+mac\s+os\s+x/i;
                var matchesIosVer = iosVerRegex.exec(agt);
                if (matchesIosVer && matchesIosVer.length > 0 && matchesIosVer[1]) {
                    iosVer = parseInt(matchesIosVer[1]);
                }
                this.ios6up = iosVer >= 6;
            }

            this.ubuntu = (agt.indexOf('ubuntu') != -1);
            this.w3c = this.nav6up;
            this.safari = (agt.indexOf('webkit') != -1);
            this.safari125up = false;
            this.safari3up = false;
            this.safari5up = false;
            this.safari7up = false;
            this.safari8up = false;
            if (this.safari && this.major >= 5) {
                navIdx = agt.indexOf('webkit/');
                if (navIdx >= 0) {
                    this.safari125up = parseInt(agt.substring(navIdx + 7)) >= 125;
                }
                var verIdx = agt.indexOf('version/');
                if (verIdx >= 0) {
                    var safariVersion = parseInt(agt.substring(verIdx + 8));
                    this.safari3up = (safariVersion >= 3);
                    this.safari5up = (safariVersion >= 5);
                    this.safari7up = (safariVersion >= 7);
                    this.safari8up = (safariVersion >= 8); // for detect WebGL canvas support for Autodesk Viewer
                }
            }
            this.firefox = this.nav && (agt.indexOf('firefox') != -1);
            this.firefox3up = false;
            this.firefox35up = false;
            this.firefox36up = false;
            this.firefox4up = false;
            this.firefox450up = false;
            if (this.firefox && this.major >= 5) {
                var ffVerIdx = agt.indexOf('firefox/');
                if (ffVerIdx >= 0) {
                    var firefoxVStr = agt.substring(ffVerIdx + 8);
                    var firefoxVInt = parseInt(firefoxVStr);
                    this.firefox3up = firefoxVInt >= 3;
                    this.firefox4up = firefoxVInt >= 4; // for detect WebGL canvas support for Autodesk Viewer
                    var firefoxVFloat = parseFloat(firefoxVStr);
                    this.firefox35up = firefoxVFloat >= 3.5;
                    this.firefox36up = firefoxVFloat >= 3.6;
                    this.firefox450up = firefoxVInt >= 45;
                }
            }
            this.chrome = this.nav && (agt.indexOf('chrome') != -1);
            this.chrome2up = false;
            this.chrome3up = false;
            this.chrome6up = false;
            this.chrome11up = false;
            this.chrome12up = false;
            this.chrome18up = false;
            this.chrome42up = false;
            if (this.chrome) {
                var chrVerIdx = agt.indexOf('chrome/');
                if (chrVerIdx >= 0) {
                    var chromeVStr = agt.substring(chrVerIdx + 7);
                    var chromeVInt = parseInt(chromeVStr);
                    this.chrome2up = chromeVInt >= 2;
                    this.chrome3up = chromeVInt >= 3;
                    this.chrome6up = chromeVInt >= 6;
                    this.chrome11up = chromeVInt >= 11;
                    this.chrome12up = chromeVInt >= 12; // for paste screenshots
                    this.chrome18up = chromeVInt >= 18; // for detect WebGL canvas support for Autodesk Viewer
                    this.chrome42up = chromeVInt >= 42; // for detect disabled Java & Silverlight
                }
            }
            this.dndFolders = this.firefox450up || (this.chrome11up && !this.edge); // Microsoft Edge standard input[type=file] supported select folders, but transfer files without relative path!
            this.opera = agt.indexOf('opera') != -1;
            this.opera11up = false;
            this.opera15up = false;
            if (this.opera) {
                var oVerIdx = agt.indexOf('version/');
                if (oVerIdx >= 0) {
                    var operaVStr = agt.substring(oVerIdx + 8);
                    this.opera11up = parseFloat(operaVStr) >= 11;
                    this.opera15up = parseFloat(operaVStr) >= 15; // for detect WebGL canvas support for Autodesk Viewer
                }
            }
            this.yandex = this.nav && (agt.indexOf('yabrowser') != -1);
            // check support chunked upload
            this.chunkedUpload = false;
            try {
                var reader = new FileReader();
                if (reader.readAsBinaryString)
                    this.chunkedUpload = true;
            } catch (err) { }
            if (!this.chunkedUpload) {
                try {
                    if (window.File.slice)
                        this.chunkedUpload = true;
                } catch (err) { }
            }
            if (!this.chunkedUpload) {
                try {
                    if (window.File.webkitSlice)
                        this.chunkedUpload = true;
                } catch (err) { }
            }
            if (!this.chunkedUpload) {
                try {
                    if (window.File.mozSlice)
                        this.chunkedUpload = true;
                } catch (err) { }
            }
            if (!this.chunkedUpload) {
                try {
                    if (window.Blob && window.Blob().slice)
                        this.chunkedUpload = true;
                } catch (err) { }
            }
        } catch (e) {
            // ignore
        }
    })(),

    // check ajax with upload chunked support --------------------------------------------------
    isChunkedUploadSupported: function () {
        var available = true, testXhr = null, testFd = null;

        try {
            testXhr = HttpCommander.Lib.Utils.getXhrInstance();
            available = (testXhr.sendAsBinary || testXhr.upload || testXhr.send) ? true : false;
            try {
                testFd = new window.FormData();
            } catch (e2) {
                available = false;
            }
        } catch (e1) {
            available = false;
        } finally {
            if (!!testFd) {
                delete testFd;
            }
            if (!!testXhr) {
                delete testXhr;
            }
        }

        if (available) {
            // check chunked support
            available = HttpCommander.Lib.Utils.browserIs.chunkedUpload;
        }

        return available;
    },
    //------------------------------------------------------------------------------------------

    Base64: (function () { // Singleton Base64 class
        // Private fields
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
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        };
        return { // Public fields
            encode: function (input) { // encode string to base64
                var output = '';
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
            decode: function (input) { // decode string from base64
                if (input == null)
                    return '';
                var output = '';
                var chr1, chr2, chr3;
                var enc1, enc2, enc3, enc4;
                var i = 0;
                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
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
    })(),

    // Work with cookies
    getCookie: function (name, asIs) {
        var matches = document.cookie.match(new RegExp(
            '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
        ));
        var cookie = matches ? decodeURIComponent(matches[1]) : undefined;
        if (typeof cookie == 'undefined') {
            return undefined;
        }
        if (asIs) {
            return cookie;
        }
        try {
            return HttpCommander.Lib.Utils.Base64.decode(cookie);
        } catch (e) {
            return cookie;
        }
    },
    setCookie: function (name, value, props) {
        props = props || {};
        var exp = props.expires;
        var d = new Date();
        if (typeof exp == 'number' && exp) {
            d.setTime(d.getTime() + exp * 1000);
            exp = props.expires = d;
        } else {
            exp = props.expires = new Date(d.getFullYear() + 10, d.getMonth(), d.getDate());
        }
        if (exp && exp.toUTCString) {
            props.expires = exp.toUTCString();
        }
        //value = encodeURIComponent(value);
        if (typeof value == 'string') {
            value = HttpCommander.Lib.Utils.Base64.encode(value);
        }
        var updatedCookie = name + '=' + value;
        var pathNotDetected = true;
        for (var propName in props) {
            if (props.hasOwnProperty(propName)) {
                if (String(propName).toLowerCase() == 'path') {
                    updatedCookie += '; path=/';
                    pathNotDetected = false;
                } else {
                    updatedCookie += '; ' + propName;
                    var propValue = props[propName];
                    if (propValue !== true) {
                        updatedCookie += '=' + propValue;
                    }
                }
            }
        }
        if (pathNotDetected) {
            updatedCookie += '; path=/';
        }
        if (updatedCookie.length >= 4096) {
            return false;
        }
        document.cookie = updatedCookie;
        return true;
    },
    deleteCookie: function (name) {
        HttpCommander.Lib.Utils.setCookie(name, null, { expires: -1 });
    },

    // Create sharepoint plugin for open and edit MS Office files from browser
    createSharePointPlugin: function () { // function for getting SharePointPlugin
        var browseris = HttpCommander.Lib.Utils.browserIs;

        // Check MacOS browser.
        var IsSupportedMacBrowser = function () {
            return browseris.mac && (browseris.firefox3up || browseris.safari3up);
        };
        // To check up, whether the specified plug-in in the browser is installed.
        var IsBrowserPluginInstalled = function (mimeType) {
            return navigator.mimeTypes && navigator.mimeTypes[mimeType] && navigator.mimeTypes[mimeType].enabledPlugin;
        };
        // To check up, whether the sharepoint plug-in in the MacOS browser.
        var IsMacPluginInstalled = function () {
            var webkitPluginInstalled = IsBrowserPluginInstalled('application/x-sharepoint-webkit');
            var npapiPluginInstalled = IsBrowserPluginInstalled('application/x-sharepoint');
            if (browseris.safari3up && webkitPluginInstalled)
                return true;
            return npapiPluginInstalled;
        };
        // Create and return sharepoint plug-in for MacOS browser.
        var CreateMacPlugin = function () {
            var plugin = null;
            if (IsSupportedMacBrowser()) {
                plugin = document.getElementById('macSharePointPlugin');
                if (plugin == null && IsMacPluginInstalled()) {
                    var pluginMimeType = null;
                    if (browseris.safari3up && IsBrowserPluginInstalled('application/x-sharepoint-webkit'))
                        pluginMimeType = 'application/x-sharepoint-webkit';
                    else
                        pluginMimeType = 'application/x-sharepoint';
                    var pluginNode = document.createElement('object');
                    pluginNode.id = 'macSharePointPlugin';
                    pluginNode.type = pluginMimeType;
                    pluginNode.width = 0;
                    pluginNode.height = 0;
                    pluginNode.style.setProperty('visibility', 'hidden', '');
                    document.body.appendChild(pluginNode);
                    plugin = document.getElementById('macSharePointPlugin');
                }
            }
            return plugin;
        };
        // To check up, whether current browser Mozilla is.
        var IsSupportedFirefoxOnWin = function () {
            return (browseris.winnt || browseris.win32 || browseris.win64bit) && browseris.firefox3up;
        };
        // Create and return sharepoint plug-in for Mozilla browser in Windows.
        var CreateFirefoxOnWindowsPlugin = function () {
            var plugin = null;
            if (IsSupportedFirefoxOnWin()) {
                try {
                    plugin = document.getElementById('winFirefoxPlugin');
                    if (!plugin && IsBrowserPluginInstalled('application/x-sharepoint')) {
                        var pluginNode = document.createElement('object');
                        pluginNode.id = 'winFirefoxPlugin';
                        pluginNode.type = 'application/x-sharepoint';
                        pluginNode.width = 0;
                        pluginNode.height = 0;
                        pluginNode.style.setProperty('visibility', 'hidden', '');
                        document.body.appendChild(pluginNode);
                        plugin = document.getElementById('winFirefoxPlugin');
                    }
                } catch (e) {
                    plugin = null;
                }
            }
            return plugin;
        };

        var sharePointObject = null;
        if (window.ActiveXObject || browseris.ie11up) { // let's check up support ActiveX.
            var SharePointOpenDocumentsVersions = [
                function () { return new ActiveXObject('SharePoint.OpenDocuments.5'); }, // MS Office 2013
                function () { return new ActiveXObject('SharePoint.OpenDocuments.4'); }, // MS Office 2010
                function () { return new ActiveXObject('SharePoint.OpenDocuments.3'); }, // MS Office 2007
                function () { return new ActiveXObject('SharePoint.OpenDocuments.2'); }, // MS Office 2003
                function () { return new ActiveXObject('SharePoint.OpenDocuments.1'); }  // MS Office XP-
            ], i = 0, len = SharePointOpenDocumentsVersions.length;
            for (; i < len; ++i) {
                try {
                    sharePointObject = (SharePointOpenDocumentsVersions[i])();
                    break;
                } catch (e) { }
            }
        } else if (browseris) { // if not support ActiveX and browser info defined
            try {
                if (IsSupportedMacBrowser())
                    sharePointObject = CreateMacPlugin();
                else if (IsSupportedFirefoxOnWin())
                    sharePointObject = CreateFirefoxOnWindowsPlugin();
            } catch (e) { }
        }
        return sharePointObject;
    },

    encrypt: function (s) {
        var r = '';
        for (var i = 0; i < s.length; ++i) {
            r += String.fromCharCode(3 ^ s.charCodeAt(i));
        }
        return r;
    },

    generateUniqueString: function () {
        return (new Date()).getTime().toString();
    },

    dateDiff: function (start, end, dLabel, hLabel, mLabel, noBold) {
        var total_seconds = ((Ext.isDate(end) ? end : new Date()) - (Ext.isDate(start) ? start : new Date())) / 1000,
            time = total_seconds < 0 ? '-' : '',
            days, hours, minutes, seconds;

        if (total_seconds < 0) {
            total_seconds = -total_seconds;
        }

        days = Math.floor(total_seconds / 86400);
        total_seconds -= days * 86400;
        hours = Math.floor(total_seconds / 3600);
        minutes = Math.floor((total_seconds - (hours * 3600)) / 60);
        seconds = total_seconds - (hours * 3600) - (minutes * 60);

        if (days > 0) {
            time += days + (dLabel || 'd') + '&thinsp;';
        }
        if (seconds >= 30) {
            minutes++;
        }
        if (hours > 0 || (hours <= 0 && days > 0 && minutes > 0)) {
            time += hours + (hLabel || 'h') + '&thinsp;';
        }
        if (minutes > 0) {
            time += minutes + (mLabel || 'm') + '&thinsp;';
        } else if (time.length < 2) {
            time += '0' + (mLabel || 'm') + '&thinsp;';
        }

        return noBold ? time : '<span style="font-weight:bold;">' + time + '</span>';
    },

    urlEncode: function (url) {
        url = String(url || '');
        var len = url.length;
        if (len > 0) {
            var pos = url.indexOf('/', 8);
            if (pos >= 0 && pos < len - 1) {
                var parts = url.substring(pos + 1, len).split('/');
                for (var i = 0; i < parts.length; i++) {
                    parts[i] = encodeURIComponent(parts[i]);
                }
                parts.unshift(url.substring(0, pos));
                return parts.join('/');
            }
        }
        return url;
    },

    getFolderFilter: function () {
        var result = {};
        var qStr = window.location.search.substr(1).split('&');
        for (var i = 0; i < qStr.length; i++) {
            var keyVal = qStr[i].split('=');
            if (keyVal.length > 1) {
                var keyName = decodeURIComponent(keyVal[0]).toLowerCase();
                switch (keyName) {
                    case 'folderfilterallow':
                        if (result.folderFilterAllow) result.folderFilterAllow += ',' + decodeURIComponent(keyVal[1]);
                        else result.folderFilterAllow = decodeURIComponent(keyVal[1]);
                        break;
                    case 'folderfilterignore':
                        if (result.folderFilterIgnore) result.folderFilterIgnore += ',' + decodeURIComponent(keyVal[1]);
                        else result.folderFilterIgnore = decodeURIComponent(keyVal[1]);
                        break;
                    case 'folderfilterallowregexp':
                        if (result.folderFilterAllowRegexp) result.folderFilterAllowRegexp += ',' + decodeURIComponent(keyVal[1]);
                        else result.folderFilterAllowRegexp = decodeURIComponent(keyVal[1]);
                        break;
                    case 'folderfilterignoreregexp':
                        if (result.folderFilterIgnoreRegexp) result.folderFilterIgnoreRegexp += ',' + decodeURIComponent(keyVal[1]);
                        else result.folderFilterIgnoreRegexp = decodeURIComponent(keyVal[1]);
                        break;
                }
            }
        }
        return result;
    },

    getHelpLinkOpenTag: function (fmUid, anchor) {
        return "<a href='#' target='_self' onclick='HttpCommander.Main.FileManagers" + '["' + fmUid + '"].showHelp("' + anchor + '");' + "'>";
    },

    getAssociatedMSApp: function (file) {
        var u = HttpCommander.Lib.Utils,
            c = HttpCommander.Lib.Consts,
            ext = u.getFileExtension(file.toLowerCase());
        if (c.msoWordTypes.split(",").indexOf(ext) >= 0) return 0;
        if (c.msoExcelTypes.split(",").indexOf(ext) >= 0) return 1;
        if (c.msoOutlookTypes.split(",").indexOf(ext) >= 0) return 2;
        if (c.msoPowerTypes.split(",").indexOf(ext) >= 0) return 3;
        // MS Access only read-only on Edit in MS Office
        //if (c.msoAccessTypes.split(",").indexOf(ext) >= 0) return 4;
        if (c.msoFrontPageTypes.split(",").indexOf(ext) >= 0) return 5;
        return -1;
    },

    /* replace file extension with the specified one - ext */
    setFileExtension: function (fileName, ext) {
        var pos = fileName.lastIndexOf('.');
        if (pos == -1)
            return fileName + '.' + ext;
        else
            return fileName.substr(0, pos + 1) + ext;
    },

    getCurrentStyle: function (el) {
        return window.getComputedStyle ?
            getComputedStyle(el, null) : el.currentStyle;
    },

    getHexRGBColor: function (color) {
        color = color.replace(/\s/g, "");
        var aRGB = color.match(/^rgb\((\d{1,3}[%]?),(\d{1,3}[%]?),(\d{1,3}[%]?)\)$/i);
        if (aRGB) {
            color = '';
            for (var i = 1; i <= 3; i++) {
                color += Math.round((aRGB[i][aRGB[i].length - 1] == "%" ? 2.55 : 1) * parseInt(aRGB[i])).toString(16).replace(/^(.)$/, '0$1');
            }
        } else {
            color = color.replace(/^#?([\da-f])([\da-f])([\da-f])$/i, '$1$1$2$2$3$3');
        }
        return '#' + color;
    },

    getBackgroundColor: function (el) {
        return HttpCommander.Lib.Utils.getHexRGBColor(HttpCommander.Lib.Utils.getCurrentStyle(el).backgroundColor);
    },

    recursiveCheckTreeChildNodes: function (node, checked) {
        if (!node.isExpanded() && node.isExpandable())
            node.expand();
        if (node.hasChildNodes())
            Ext.each(node.childNodes, function (el) {
                el.getUI().toggleCheck(checked);
                el.attributes.checked = checked;
                HttpCommander.Lib.Utils.recursiveCheckTreeChildNodes(el, checked);
            });
    },

    recursiveCheckTreeChildNodesWithoutExpand: function (node, checked) {
        if (node) {
            var ui = node.getUI();
            node.attributes.checked = checked;
            if (ui && ui.checkbox && ui.checkbox.checked != checked)
                ui.checkbox.checked = checked === true;
            if (node.childrenRendered && node.childNodes && node.childNodes.length > 0) {
                Ext.each(node.childNodes, function (el) {
                    el.attributes.checked = checked;
                    HttpCommander.Lib.Utils.recursiveCheckTreeChildNodesWithoutExpand(el, checked);
                });
            }
        }
    },

    recursiveCheckTreeParentNodes: function (node, checked) {
        if (node.parentNode && (typeof node.isRoot == 'undefined' || !node.isRoot)) {// && (typeof node.parentNode.isRoot == 'undefined' || !node.parentNode.isRoot)) {
            var parent = node.parentNode;
            var allSiblingInOneState = true;
            for (var i = 0; i < parent.childNodes.length; i++) {
                if (parent.childNodes[i].getUI().isChecked() != checked) {
                    allSiblingInOneState = false;
                    break;
                }
            }
            if (allSiblingInOneState && parent.getUI().isChecked() != checked) {
                parent.getUI().toggleCheck(checked);
                HttpCommander.Lib.Utils.recursiveCheckTreeParentNodes(parent, checked);
            }
        }
    },

    cloneMsOAuthInfo: function (authInfo) {
        var wat = null, scopes;
        if (Ext.isObject(authInfo)) {
            wat = Ext.apply({}, authInfo);
            if (!!wat.scope) {
                delete wat.scope;
            }
            if (!!authInfo.scope) {
                try {
                    scopes = [];
                    for (var sc in authInfo.scope) {
                        if (authInfo.scope.hasOwnProperty(sc) && !!authInfo.scope[sc]) {
                            scopes.push(authInfo.scope[sc]);
                        }
                    }
                    if (scopes.length > 0) {
                        wat.scope = scopes;
                    }
                } catch (e) { }
            }
        }
        return wat;
    },

    getElementsByClass: function (getClass) {
        if (document.querySelectorAll) {
            return document.querySelectorAll('.' + getClass);
        } else if (document.getElementsByClassName) {
            return document.getElementsByClassName(getClass);
        } else {
            var list = document.getElementsByTagName('*'),
                i = list.length,
                classArray = getClass.split(/\s+/),
                result = [];
            while (i--) {
                if (list[i].className.search('\\b' + classArray + '\\b') != -1) {
                    result.push(list[i]);
                }
            }
            return result;
        }
    },
    /**
    * Get UTC datetime string in 'yyyyMMddhhmmss' format
    * from date object argument.
    * If 'date' argument in not valid date object, then returned null.
    */
    getDateUTCString: function (date) {
        if (!date) return null;
        try {
            var n2s = function (n) { return String(n < 10 ? ('0' + n) : n); },
                y = String(date.getUTCFullYear()),  // full year string (2013, ...)
                mo = n2s(date.getUTCMonth() + 1),   // month string (03 or 11, ...)
                d = n2s(date.getUTCDate()),         // day in month (05 or 28, ...)
                h = n2s(date.getUTCHours()),        // hours in 24 format (23 or 07, ...)
                mi = n2s(date.getUTCMinutes()),     // minutes (47 or 09, ...)
                s = n2s(date.getUTCSeconds());      // seconds (59 or 04, ...)
            return '' + y + mo + d + h + mi + s;
        } catch (e) {
            return null;
        }
    },

    isAllowedForViewingInBrowser: function (filePath, htcCfg) {
        if (!filePath || !htcCfg)
            return false;
        var result = false,
            vpParts = filePath.split('/'),
            fName = vpParts[vpParts.length - 1],
            ext = HttpCommander.Lib.Utils.getFileExtension(fName),
            _ext_ = ';' + ext + ';';
        result = HttpCommander.Lib.Consts.forbiddenTypesForViewInBrowser.indexOf(_ext_) < 0 &&
            htcCfg.mimeTypes.indexOf(ext) >= 0;
        if (result) {
            result = HttpCommander.Lib.Consts.msoSupportedtypes.indexOf(_ext_) < 0 ||
                HttpCommander.Lib.Consts.msoTypesForViewInBrowser.indexOf(_ext_) != -1;
        }
        return result;
    },

    includeCssFile: function (config) {
        var cfg = Ext.isObject(config) ? config : {},
            cssId = cfg.id || Ext.id(), head, link,
            css = document.getElementById(cssId);
        if (!css) {
            head = document.getElementsByTagName('head')[0];
            link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = cfg.url || '';
            link.media = 'all';
            head.appendChild(link);
        }
    },

    includeJsFile: function (config) {
        var script, cfg = Ext.isObject(config) ? config : {},
            head = document.getElementsByTagName('head')[0],
            afterLoad = function () {
                if (Ext.isFunction(cfg.callback)) {
                    cfg.callback.call();
                }
            };
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        if (Ext.isFunction(cfg.callback)) {
            script.onload = script.onerror = function () {
                var self = this;
                if (!self.executed) {
                    self.executed = true;
                    afterLoad();
                }
            };
            script.onreadystatechange = function () {
                var self = this;
                if (self.readyState == 'complete' || self.readyState == 'loaded') {
                    setTimeout(function () { self.onload() }, 0);
                }
            };
        }
        script.src = config.url || '';
        head.appendChild(script);
    },

    registerCssClasses: function (htcConfig) {
        HttpCommander.Lib.Utils.createCSSClass('.x-tree-node-expanded .x-tree-node-icon{' +
            'background-image: url(' + HttpCommander.Lib.Utils.getIconPath(htcConfig, 'folder-open') + ');'
            + '}'
        );
        HttpCommander.Lib.Utils.createCSSClass('.x-tree-node-collapsed .x-tree-node-icon{' +
            'background-image: url(' + HttpCommander.Lib.Utils.getIconPath(htcConfig, 'folder') + ');'
            + '}'
        );
        HttpCommander.Lib.Utils.createCSSClass('.x-remove-from-favorites{' +
            'background-image: url(' + HttpCommander.Lib.Utils.getIconPath(htcConfig, 'delete') + ') !important;'
            + '}'
        );

        HttpCommander.Lib.Utils.createCSSClass('.icon-google{' +
            'background-image: url(' + HttpCommander.Lib.Utils.getIconPath(htcConfig, 'googledocs') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=googledocs' : '') + ') !important;'
            + '}'
        );
        HttpCommander.Lib.Utils.createCSSClass('.icon-skydrive{' +
            'background-image: url(' + HttpCommander.Lib.Utils.getIconPath(htcConfig, 'skydrive') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=skydrive' : '') + ') !important;'
            + '}'
        );
        HttpCommander.Lib.Utils.createCSSClass('.icon-dropbox{' +
            'background-image: url(' + HttpCommander.Lib.Utils.getIconPath(htcConfig, 'dropbox') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=dropbox' : '') + ') !important;'
            + '}'
        );
        HttpCommander.Lib.Utils.createCSSClass('.icon-box{' +
            'background-image: url(' + HttpCommander.Lib.Utils.getIconPath(htcConfig, 'box') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=box' : '') + ') !important;'
            + '}'
        );
        HttpCommander.Lib.Utils.createCSSClass('.icon-comment{' +
            'background-image: url(' + HttpCommander.Lib.Utils.getIconPath(htcConfig, 'comment') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=comment' : '') + ') !important; '
            + '}'
        );
        HttpCommander.Lib.Utils.createCSSClass('.icon-details{' +
            'background-image: url(' + HttpCommander.Lib.Utils.getIconPath(htcConfig, 'details') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=details' : '') + ') !important; '
            + '}'
        );
        HttpCommander.Lib.Utils.createCSSClass('.icon-history{' +
            'background-image: url(' + HttpCommander.Lib.Utils.getIconPath(htcConfig, 'versioning') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=versioning' : '') + ') !important; '
            + '}'
        );
        HttpCommander.Lib.Utils.createCSSClass('.ext-el-mask { z-index: 35001; }');
        HttpCommander.Lib.Utils.createCSSClass('.ext-el-mask-msg { z-index: 35002; }');
    },

    createCSSClass: function (cssText) {
        try {
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = cssText;
            document.getElementsByTagName('head')[0].appendChild(style);
        }
        catch (e) { }

    },
    /**
    * Detect if URI is supported by watching for blur event. If window blured , custom uri is supported, otherwise does not. 
    */
    openCustomUriTimeout: function (uri, callback, inFrame) {
        var success = false;
        var onBlur = function () {
            success = true;
            clearTimeout(timeout);
            Ext.EventManager.removeListener(window, 'blur', onBlur, this, null);
            if (callback)
                callback(true);  // true

        };

        var timeout = setTimeout(function () {
            Ext.EventManager.removeListener(window, 'blur', onBlur, this, null);
            if ((inFrame && !document.hasFocus() || !inFrame) && !success && callback) {
                callback(false);
            }
        }, 1000);

        
        Ext.EventManager.on(window, 'blur', onBlur, this, null);
        if (!inFrame)
            window.location = uri;
        else {
            var iframe = HttpCommander.Lib.Utils.getCustomUriFrame();
            iframe.contentWindow.location.href = uri;
            //iframe.remove();
        }
    },
    /**
    *Open custom URI in hidden iframe
    */
    openCustomUriFirefox: function (uri, callback) {
        var success = false;
        var iframe = HttpCommander.Lib.Utils.getCustomUriFrame();
        try {
            iframe.contentWindow.location.href = uri;
            success = true;
        } catch (e) {
            if (e.name == "NS_ERROR_UNKNOWN_PROTOCOL")
                success = false;
        }
        iframe.remove();
        if (callback)
            callback(success);
    },
    /**
    * Return hidden iframe used to lauch custom URI. 
    * Create it if needed.
    */
    getCustomUriFrame: function () {
        var iframe = document.getElementById("cusomUriOpenerIframe");
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.src = "about:blank";
            iframe.id = "cusomUriOpenerIframe";
            iframe.style.display = "none";
            Ext.getBody().appendChild(iframe);
        }
        return iframe;
    },
    /**
    * Open Custom URI in new window.
    * Small new window opened and closed after 1 second
    */
    openCustomUriInNewWindow: function (uri, callback) {
        var win = window.open("", "", "width=0,height=0");
        win.document.write("<iframe src='" + uri + "'></iframe>");
        setTimeout(function () {
            try {
                win.location.href;
                win.setTimeout("window.close()", 1000);
                callback(true);
            } catch (e) {
                win.close();
                callback(false);
            }
        }, 1000);
    },
    /**
    * Open URI in hiddent frame and wait for blur event.
    */
    openCustomUriInHiddenFrame: function (uri, callback) {
        HttpCommander.Lib.Utils.openCustomUriTimeout(uri, callback, true);
    },
    /**
    * Open URI in hiddent frame and wait for blur event.
    */
    openCustomUriIE: function (uri, callback) {
        if (navigator.msLaunchUri)
            navigator.msLaunchUri(uri, function () { callback(true) }, function () { callback(false) });
        else {
            var ua = navigator.userAgent.toLowerCase();
            var isWin8AndLater = /windows nt 6.2/.test(ua) || /windows nt 6.3/.test(ua);
            if (isWin8AndLater)
                window.location.href = uri;
            else if (HttpCommander.Lib.Utils.browserIs.iever === 9 ||
                    (HttpCommander.Lib.Utils.browserIs.iever === 11 && !/windows nt 6.1/.test(ua) && !/windows nt 6.0/.test(ua)))
                HttpCommander.Lib.Utils.openCustomUriInHiddenFrame(uri, callback);
            else
                HttpCommander.Lib.Utils.openCustomUriInNewWindow(uri, callback);
        }
    },
    launchCustomProtocol: function (uri, callback) {
        if (HttpCommander.Lib.Utils.browserIs.firefox)
            HttpCommander.Lib.Utils.openCustomUriFirefox(uri, callback);
        else if (HttpCommander.Lib.Utils.browserIs.ie)
            HttpCommander.Lib.Utils.openCustomUriIE(uri, callback);
        else if (HttpCommander.Lib.Utils.browserIs.chrome)
            HttpCommander.Lib.Utils.openCustomUriTimeout(uri, callback);
        else if (HttpCommander.Lib.Utils.browserIs.safari)
            HttpCommander.Lib.Utils.openCustomUriInHiddenFrame(uri, callback);
        else if (HttpCommander.Lib.Utils.browserIs.edge)
            HttpCommander.Lib.Utils.openCustomUriEdge(uri, callback);
        else
            HttpCommander.Lib.Utils.openCustomUriTimeout(uri, callback);
    },
    getMSOfficeUriScheme: function (filename) {
        var ext = HttpCommander.Lib.Utils.getFileExtension(filename);
        var _ext_ = ',' + ext + ',';
        if ((',' + HttpCommander.Lib.Consts.msoWordTypes + ',').indexOf(_ext_) >= 0)
            return "ms-word";
        else if ((',' +HttpCommander.Lib.Consts.msoExcelTypes + ',').indexOf(_ext_) >= 0)
            return "ms-excel";
        else if ((',' +HttpCommander.Lib.Consts.msoPowerTypes + ',').indexOf(_ext_) >= 0)
            return "ms-powerpoint";
        // MS Access only read-only on Edit in MS Office
        //else if ((',' +HttpCommander.Lib.Consts.msoAccessTypes + ',').indexOf(_ext_) >= 0)
        //    return "ms-access";
        else if ((',' +HttpCommander.Lib.Consts.msoInfoPathTypes + ',').indexOf(_ext_) >= 0)
            return "ms-infopath";
        else if ((',' +HttpCommander.Lib.Consts.msoPubTypes + ',').indexOf(_ext_) >= 0)
            return "ms-publisher";
        else if ((',' +HttpCommander.Lib.Consts.msoVisioTypes + ',').indexOf(_ext_) >= 0)
            return "ms-visio";
        else if ((',' + HttpCommander.Lib.Consts.msoProjectTypes + ',').indexOf(_ext_) >= 0)
            return "ms-project";
        else
            return null;
    },
    getMSOfficeCommand: function (filename) {
        var ext = HttpCommander.Lib.Utils.getFileExtension(filename);
        var _ext_ = ',' + ext + ',';
        if ((',' + HttpCommander.Lib.Consts.msoWordTypes + ',').indexOf(_ext_) >= 0)
            return "WINWORD";
        else if ((',' +HttpCommander.Lib.Consts.msoExcelTypes + ',').indexOf(_ext_) >= 0)
            return "EXCEL";
        else if ((',' +HttpCommander.Lib.Consts.msoPowerTypes + ',').indexOf(_ext_) >= 0)
            return "POWERPNT";
        // MS Access only read-only on Edit in MS Office
        //else if ((',' +HttpCommander.Lib.Consts.msoAccessTypes + ',').indexOf(_ext_) >= 0)
        //    return "MSACCESS";
        else if ((',' +HttpCommander.Lib.Consts.msoInfoPathTypes + ',').indexOf(_ext_) >= 0)
            return "INFOPATH";
        else if ((',' +HttpCommander.Lib.Consts.msoPubTypes + ',').indexOf(_ext_) >= 0)
            return "MSPUB";
        else if ((',' +HttpCommander.Lib.Consts.msoVisioTypes + ',').indexOf(_ext_) >= 0)
            return "VISIO";
        else if ((',' + HttpCommander.Lib.Consts.msoProjectTypes + ',').indexOf(_ext_) >= 0)
            return "WINPROJ";
        else
            return null;
    },

    // Avatar
    getAbbr: function (userName, maxAbbrLen) {
        if (Ext.isEmpty(userName) || userName.trim().length == 0) {
            return ' ';
        }
        if (!Ext.isNumber(maxAbbrLen) || maxAbbrLen <= 0) {
            maxAbbrLen = 2;
        }
        var res = '', i, part,
            userParts = HttpCommander.Lib.Utils.parseUserName(userName).trim().split(/[\s_]+/gi),
            len = userParts.length;
        for (i = 0; i < len; i++)
        {
            if (res.length >= maxAbbrLen)
                break;
            part = userParts[i];
            if (part.length > 0)
                res += part[0];
        }
        return res.length > 0 ? res.toUpperCase() : ' ';
    },
    // get hash code for input string
    getHashCode: function (str) {
        var hash = 0, i, chr, len = str.length;
        if (len == 0) {
            return hash;
        }
        var s = str.toLowerCase();
        for (i = 0; i < len; i++) {
            chr = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return hash;
    },
    getAvatarHtml: function (userName, colors, maxAbbrLen, hideWrap) {
        if (!Ext.isArray(colors) || colors.length == 0) {
            return '';
        }
        var abbr = HttpCommander.Lib.Utils.getAbbr(userName, maxAbbrLen),
            hash, idx, bg, fg;
        if (Ext.isEmpty(userName) || userName.trim().length == 0) {
            bg = 'black';
            fg = 'white'
        } else {
            hash = HttpCommander.Lib.Utils.getHashCode(userName);
            idx = Math.abs(hash % colors.length);
            bg = colors[idx].bg;
            fg = colors[idx].fg;
        }
        return String.format(
            '{3}<div class="c-avatar--no-img c-avatar--circle c-avatar c-avatar--m" style="background-color:{0};color:{1};{5}">{2}</div>{4}',
            bg, fg, Ext.util.Format.htmlEncode(abbr),
            hideWrap ? '' : '<div class="commenter-photo">',
            hideWrap ? '' : '</div>',
            hideWrap ? 'margin-right:8px;margin-top:3px;' : ''
        );
    },
    parseUserName: function (user) {
        var i, u;
        if (!Ext.isEmpty(user)) {
            i = (u = String(user)).indexOf('\\');
            if (i < 0) {
                i = u.indexOf('/');
            }
            if (i >= 0 && u.length > (i + 1)) {
                return u.substring(i + 1);
            }
        }
        return user;
    },

    // Copy 'text' to clipboard with create textarea html element
    // if success - returns true, otherwise - returns error object or false
    copyTextToClipboard: function (text) {
        var success = false, textArea;

        if (Ext.isEmpty(text)) {
            return success;
        }

        try {
            textArea = document.createElement('textarea');

            //
            // *** This styling is an extra step which is likely not required. ***
            //
            // Why is it here? To ensure:
            // 1. the element is able to have focus and selection.
            // 2. if element was to flash render it has minimal visual impact.
            // 3. less flakyness with selection and copying which **might** occur if
            //    the textarea element is not visible.
            //
            // The likelihood is the element won't even render, not even a flash,
            // so some of these are just precautions. However in IE the element
            // is visible whilst the popup box asking the user for permission for
            // the web page to copy to the clipboard.
            //

            // Place in top-left corner of screen regardless of scroll position.
            textArea.style.position = 'fixed';
            textArea.style.top = 0;
            textArea.style.left = 0;

            // Ensure it has a small width and height. Setting to 1px / 1em
            // doesn't work as this gives a negative w/h on some browsers.
            textArea.style.width = '2em';
            textArea.style.height = '2em';

            // We don't need padding, reducing the size if it does flash render.
            textArea.style.padding = 0;

            // Clean up any borders.
            textArea.style.border = 'none';
            textArea.style.outline = 'none';
            textArea.style.boxShadow = 'none';

            // Avoid flash of white box if rendered for any reason.
            textArea.style.background = 'transparent';

            textArea.value = String(text);

            document.body.appendChild(textArea);

            textArea.select();

            success = document.execCommand('copy');
        } catch (e) {
            if (!!window.console && !!window.console.log) {
                window.console.log('Error on copy to clipboard: ' + e);
            }
            success = e;
        }

        if (!!textArea) {
            try {
                document.body.removeChild(textArea);
            } catch (e) {
                if (!!window.console && !!window.console.log) {
                    window.console.log('Error remove textarea after copy to clipboard: ' + e);
                }
            }
        }

        return success;
    }
};

// List of emails (stored in localStorage)
HttpCommander.Lib.Utils.EMails = (function () {

    var emails = [],
        localStorageSupported = (function () {
            try {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        })(),
        isArray = function (v) {
            return (Object.prototype.toString.apply(v) === '[object Array]');
        },
        getCurUser = function () {
            var user = !!htcConfig ? htcConfig.friendlyUserName : null;
            return !!user ? user : null;
        };

    if (localStorageSupported) try {
        var userEmails = localStorage.getItem(getCurUser());
        if (userEmails) {
            emails = JSON.parse(userEmails);
        }
        if (!isArray(emails)) {
            emails = [];
        }
    } catch (e) {
        emails = [];
        if (!!window.console && !!window.console.log) {
            window.console.log('Check local storage for current user error: ');
            window.console.log(e);
        }
    }

    var putFunc = function (email) {
        email = String(email || '').trim();
        if (email.length == 0)
            return;
        for (var i = 0, len = emails.length; i < len; i++) {
            if (emails[i].toLowerCase() == email.toLowerCase())
                return;
        }
        emails.push(email);
        if (localStorageSupported) try {
            localStorage.setItem(getCurUser(), JSON.stringify(emails));
        } catch (e) {
            if (!!window.console && !!window.console.log) {
                window.console.log('Set local storage for current user error: ');
                window.console.log(e);
            }
        }
    };

    return {
        put: putFunc,
        get: function (index) {
            if (arguments.length == 0 || typeof index == 'undefined')
                return emails;
            if (index >= 0 && index < emails.length)
                return emails[index];
        },
        getDataStore: function () {
            var data = [];
            for (var i = 0, len = emails.length; i < len; i++) {
                data.push([emails[i], false]);
            }
            return data;
        },
        clear: function () {
            emails = [];
            if (localStorageSupported) try {
                localStorage.removeItem(getCurUser());
            } catch (e) {
                if (!!window.console && !!window.console.log) {
                    window.console.log('Error on clear local storage for current user: ');
                    window.console.log(e);
                }
            }
        }
    }
})();
