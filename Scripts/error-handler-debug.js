HttpCommanderLog = new function () {
    var getXhrInstance = (function () {
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
        errorHandlerUrl = (function () {
            try {
                var relUrl = '/Handlers/AnonymousDownload.ashx?error=',
                    scripts = document.getElementsByTagName('script'),
                    len = scripts.length, script,
                    pos, docUrl, prefixLen, src;
                for (var i = 0; i < len; i++) {
                    script = scripts[i];
                    src = (typeof script.getAttribute.length != 'undefined')
                        ? script.src                     // FF/Chrome/Safari (only FYI, this would work also in IE8)
                        : script.getAttribute('src', 4); // IE 6/7/8 using 4 (and not -1) see MSDN http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx

                    if (!(src || '').match(/(\/scripts\/|\/handlers\/)/i)) {
                        continue;
                    }

                    // src variable should contain absolute URL of this script file,
                    // IE 8, however, sometimes returns relative URL.
                    // As far as I can see IE always returns relative URL
                    // when this script is used as part of HttpCommander.
                    if (src.match(/^https?:\/\//i)) {
                        // absolute URL
                        pos = -1;
                        if ((pos = src.search(/\/scripts\//i)) >= 0) {
                            src = src.substr(0, pos);
                            pos = src.toLowerCase().lastIndexOf('/handlers/');
                            if (pos < 0) {
                                pos = src.toLowerCase().lastIndexOf('/handlers');
                            }
                            if (pos >= 0) {
                                src = src.substr(0, pos);
                            }
                            src += relUrl;
                            return src;
                        }
                    }
                }
                // src - relative URL
                docUrl = document.location.href;
                prefixLen = docUrl.lastIndexOf('/');
                // create absolute URL
                docUrl = docUrl.substr(0, prefixLen)
                prefixLen = docUrl.toLowerCase().lastIndexOf('/handlers');
                if (prefixLen >= 0) {
                    docUrl = docUrl.substr(0, prefixLen);
                }
                src = docUrl + relUrl;
                return src;
            } catch (e) {
                return null;
            }
        })(),
        htmlEncode = function (input) {
            return String(input || '').replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
        },
        lastError = null;
    this.SetLastError = function (e) {
        lastError = e;
    };
    window.onerror = (this.Error = function (message, url, line) {
        var error = lastError, req, params, timeout, propName;
        lastError = null;
        if (!errorHandlerUrl)
            return true;
        message = String(message || 'Script error occured.');
        if (!url || typeof url == 'undefined') {
            url = window.location.href;
        }
        url = String(url);
        line = String(line || '');
        params = 'message=' + encodeURIComponent(htmlEncode(message))
            + '&url=' + encodeURIComponent(htmlEncode(url))
            + '&Line=' + encodeURIComponent(htmlEncode(line))
            + '&UserAgent=' + encodeURIComponent(htmlEncode(window.navigator.userAgent));
        if (!!error) {
            if (error.stack) {
                params += '&Stack=' + encodeURIComponent(htmlEncode(String(error.stack)));
            }
            for (var prop in error) {
                if (error.hasOwnProperty(prop) && !!error[prop]) {
                    propName = String(prop).toLocaleLowerCase();
                    if (propName != 'stack' && propName != 'message') {
                        params += '&' + encodeURIComponent(propName) + '=' + encodeURIComponent(htmlEncode(error[prop]));
                    }
                }
            }
        }
        try {
            req = getXhrInstance();
            req.open('POST', errorHandlerUrl, true);
            req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            req.onreadystatechange = function () {
                try {
                    if (req.readyState != 4) {
                        return;
                    }
                    if (timeout) {
                        clearTimeout(timeout);
                    }
                } catch (ie) { }
            }
            req.send(params);
            timeout = setTimeout(function () {
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (req) {
                    req.abort();
                }
            }, 30000);
        } catch (e) {
            return true;
        }
        return false;
    });
};