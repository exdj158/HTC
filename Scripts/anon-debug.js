if (!Array.prototype.indexOf) { // fix for IE8
    Array.prototype.indexOf = function (o, from) {
        var len = this.length;
        from = from || 0;
        from += (from < 0) ? len : 0;
        for (; from < len; ++from) {
            if (this[from] === o) {
                return from;
            }
        }
        return -1;
    };
}

if (!!document.getElementsByClassName) {
    getElementsByClass = function (classList, node) {
        return (node || document).getElementsByClassName(classList)
    };
} else {
    getElementsByClass = function (classList, node) {
        var node = node || document,
            list = node.getElementsByTagName('*'),
            length = list.length,
            classArray = classList.split(/\s+/),
            classes = classArray.length,
            result = [], i, j;
        for (i = 0; i < length; i++) {
            for (j = 0; j < classes; j++) {
                if (list[i].className.search('\\b' + classArray[j] + '\\b') != -1) {
                    result.push(list[i]);
                    break;
                }
            }
        }
        return result;
    };
}

// Check if supports multiply select files in upload field
function multi() {
    var ua = navigator.userAgent.toLowerCase(),
        check = function (reg) {
            return reg.test(ua);
        },
        version = function (reg) {
            var arr = reg.exec(ua);
            return arr ? parseFloat(arr[1]) : 0;
        };
    if (version(/\bfirefox\/(\d+\.\d+)/) >= 3.6) {
        return true;
    } else if (check(/\bchrome\b/)) {
        return version(/\bchrome\/(\d+\.\d+)/) >= 2;
    } else if (check(/safari/)) {
        return true;
    } else if (check(/opera/)) {
        return version(/version\/(\d+\.\d+)/) >= 11;
    }
    return false;
}

// disable multiple upload files notes if not supported
function bload() {
    var mnoteEl = document.getElementById('mnote'),
        tableItems, selectedItems, hid, el, i, selectedItem;
    if (!!mnoteEl) {
        mnoteEl.style.display = multi() ? '' : 'none';
    }
    tableItems = document.getElementById('table-items');
    if (!!tableItems) {
        selectedItems = getElementsByClass('selected-item', tableItems);
        if (!!selectedItems && selectedItems.length > 0 && !!(selectedItem = selectedItems[0])) {
            hid = selectedItem.id;
            if (!!hid) {
                window.location.hash = '#';
                window.location.hash = '#' + encodeURIComponent(hid);
                return;
            }
        }
    }
    hid = window.location.hash;
    if (!!hid && (i = hid.indexOf('#')) >= 0 && hid.length > (i + 1)) {
        hid = decodeURIComponent(hid.substring(i + 1));
        el = document.getElementById(hid);
        if (!!el) {
            tSelItem(el);
        }
    }
}

// toggle visibility upload div
function toggleUpload(el) {
    var ud = document.getElementById('anonymUploadDiv');
    if (!!ud) {
        var hidden = (ud.style.display == 'none');
        ud.style.display = hidden ? '' : 'none';
        if (el) {
            var imgs = el.getElementsByTagName('img');
            if (!!imgs) {
                if (!!imgs[0]) {
                    imgs[0].style.display = hidden ? '' : 'none';
                }
                if (imgs[1]) {
                    imgs[1].style.display = hidden ? 'none' : '';
                }
            }
            el.title = hidden ? (hideUploadHint || 'Hide upload form') : (showUploadHint || 'Show upload form');
        }
    }
}

// change language
function changeLang(el) {
    var form = document.getElementById('anonymFormChangeLang');
    if (!!form && !!el && !!form['anonymLanguage']) {
        form['anonymLanguage'].value = el.value;
        form.submit();
    }
}

function setParam(uri, key, val) {
    return uri
        .replace(RegExp("([?&]" + key + "(?=[=&#]|$)[^#&]*|(?=#|$))"), "&" + key + "=" + encodeURIComponent(val))
        .replace(/^([^?&]+)&/, "$1?");
}

// change sorting
function changeSort(el) {
    if (!!el) {
        try {
            var q = el.getAttribute('datasort');
            if (!!q) {
                window.location.href =  setParam(window.location.href, 'sort', q);
            }
        } catch (e) {
            if (!!window.console && !!window.console.log) {
                window.console.log(e);
            }
        }
    }
}

function isArray(v){
    return !!v && v.toString() === '[object Array]';
}

function removeClass(el, className) {
    if (!el || !className) {
        return;
    }
    var trimRe = /^\s+|\s+$/g, spacesRe = /\s+/,
        i, idx, len, cls, elClasses;
    if (!isArray(className)) {
        className = [className];
    }
    if (el && el.className) {
        elClasses = el.className.replace(trimRe, '').split(spacesRe);
        for (i = 0, len = className.length; i < len; i++) {
            cls = className[i];
            if (typeof cls == 'string') {
                cls = cls.replace(trimRe, '');
                idx = elClasses.indexOf(cls);
                if (idx != -1) {
                    elClasses.splice(idx, 1);
                }
            }
        }
        el.className = elClasses.join(' ');
    }
    return el;
}

function hasClass(el, className){
    return !!el && !!className && (' ' + el.className + ' ').indexOf(' ' + className + ' ') != -1;
}

function addClass(el, className) {
    if (!el || !className) {
        return;
    }
    var i, len, v, cls = [];
    // Separate case is for speed
    if (!isArray(className)) {
        if (typeof className == 'string' && !hasClass(el, className)) {
            el.className += ' ' + className;
        }
    } else {
        for (i = 0, len = className.length; i < len; i++) {
            v = className[i];
            if (typeof v == 'string' && (' ' + el.className + ' ').indexOf(' ' + v + ' ') == -1) {
                cls.push(v);
            }
        }
        if (cls.length) {
            el.className += " " + cls.join(" ");
        }
    }
    return el;
}

function tSelItem(tr) {
    if (!tr) {
        return;
    }
    var i, len, childs, child, cls = 'selected-item', hid;
    if (!tr.parentNode) {
        if (hasClass(tr, cls)) {
            removeClass(tr, cls);
        } else {
            addClass(tr, cls);
            hid = tr.id;
        }
    } else {
        childs = tr.parentNode.childNodes;
        for (i = 0, len = childs.length; i < len; i++) {
            child = childs[i];
            if (child == tr) {
                if (hasClass(tr, cls)) {
                    removeClass(tr, cls);
                } else {
                    addClass(tr, cls);
                    hid = tr.id;
                }
            } else {
                removeClass(child, cls);
            }
        }
    }
    //if (!!hid) {
    //    window.location.hash = '#';
    //    window.location.hash = '#!' + encodeURIComponent(hid);
    //} else {
    //    window.location.hash = '';
    //}
}

function toggleRowCmts(id) {
    if (!!id) {
        var el = document.getElementById(String(id));
        if (!!el) {
            if (el.style.display == 'none') {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        }
    }
}
