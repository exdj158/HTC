/* Note. scriptSource variable must be at the top level, it must be assigned when this script loads.
Do no place it elsewhere, in particular in HttpCommander.Main function. */
var scriptSource = (function(scripts) {
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
})();

//Main class for all methods and objects
HttpCommander.Main = {
    inited: false,
    handleErrors: true,
    defaultPath: "root",
    asControl: false,
    hidden: false,
    uid: "",
    //! Google viewer supported types.
    googleDocSupportedtypes: ";pdf;doc;docx;ppt;pptx;tif;tiff;xls;xlsx;pages;ai;psd;svg;eps;ps;xps;ttf;zip;rar;dxf;txt;css;html;htm;php;c;cpp;h;hpp;js;",
    //Commented : removed support of zoho viewer
    //zohoSupportedtypes: ";doc;docx;xls;xlsx;ppt;pptx;pps;odt;ods;odp;sxw;sxc;sxi;wpd;pdf;rtf;txt;html;csv;tsv;",
    events: {},
    fm: {},
    // html encode function
    htmlEncode: function (v) {
        return !v ? v : String(v).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    },
    // absolute URL of the HttpCommander root folder
    appRootUrl: (function() {
        // scriptSource == "http://server-name" + appRoolUrl + "Scripts/error-handler.js?..."
        // scriptSource == "http://server-name" + appRoolUrl + "Scripts/error-handler-debug.js?..."
        var url = scriptSource.replace(/\/Scripts\/error-handler.*$/i, "/");
        //url = url.replace(/^https?:\/\/[^\/]+\//i, "/");
        return url;
    })(),

    InitFileManager: function(config) {
        if (!HttpCommander.Main.inited) {
            HttpCommander.Main.inited = true;
            config = config || {};
            HttpCommander.Main.handleErrors = (config.handleErrors === true);
            HttpCommander.Main.defaultPath = config.defaultPath ? config.defaultPath : "root";
            HttpCommander.Main.asControl = (config.control !== false);
            HttpCommander.Main.hidden = (config.showOnLoad === false);
            HttpCommander.Main.uid = String(config.id || '');
            if (!HttpCommander.Main.uid || typeof HttpCommander.Main.uid !== 'string'
                || HttpCommander.Main.uid == '' || HttpCommander.Main.uid.trim() == '') {
                HttpCommander.Main.uid = (new Date()).getTime().toString();
            } else {
                HttpCommander.Main.uid = HttpCommander.Main.uid.trim().replace(/[^a-zA-Z0-9-_]+/g, '_');
                if (HttpCommander.Main.uid === '_') {
                    HttpCommander.Main.uid = (new Date()).getTime().toString();
                }
            }
            var docOnReadyFunction = function() {
                //hide loading mask            
                try { $("#" + HttpCommander.Main.uid + "_loadingTouch").remove(); }
                catch (e) { }
                try { $("#" + HttpCommander.Main.uid + "_loading").remove(); }
                catch (e) { }
                try { $("#" + HttpCommander.Main.uid + "_loading-mask").remove(); }
                catch (e) { }
                HttpCommander.Main.fm.onPreRender();
                HttpCommander.Main.init();
                HttpCommander.Main.fm.onRender();
                HttpCommander.Main.fm.onShow();
                if (HttpCommander.Main.asControl && !HttpCommander.Main.events["LogOut"])
                    $('#jqm-settings-logout').hide();
                // Update link for MobileHelp.html
                var webdavUrl = htcConfig.enableWebFoldersLinks && htcConfig.hcAuthMode != 'shibboleth' ?
                    ('?webdav=' + encodeURIComponent((htcConfig.domainNameUrl != '' ? htcConfig.domainNameUrl : HttpCommander.Main.appRootUrl)
                        + htcConfig.identifierWebDav)) : '';
                if (document.getElementById('jqm-mobile-help'))
                    document.getElementById('jqm-mobile-help').href = htcConfig.mobileHelpRelUrl + webdavUrl;
            };
            try {
                //Init main object when document is ready
                $(document).ready(function() {
                    docOnReadyFunction();
                });
            } catch (e) {
                throw e;
            }
            // Private events
            var eventNames = ["PreRender", "Render", "Show", "Hide", "LogOut", "Destroy"];

            var callEventFn = function(nameFn, args) {

                if (HttpCommander.Main.fm && typeof nameFn === 'string' && typeof HttpCommander.Main.events[nameFn] === 'function') {
                    var argsArray = [];
                    if (!!args && Object.prototype.toString.apply(args) !== '[object Array]') {
                        argsArray.push(args);
                    } else if (!!args) {
                        argsArray = args;
                    }
                    argsArray.push(HttpCommander.Main.fm);
                    try {
                        return HttpCommander.Main.events[nameFn].apply(HttpCommander.Main.fm, argsArray);
                    } catch (e) {
                        ProcessScriptError(e);
                    }
                }
            };
            HttpCommander.Main.fm.onPreRender = function() { // prerender
                callEventFn('PreRender');
            };
            HttpCommander.Main.fm.onRender = function() { // render
                callEventFn('Render');
            };
            HttpCommander.Main.fm.onShow = function() { // showed
                callEventFn('Show');
            };
            HttpCommander.Main.fm.onHide = function() { // hided
                callEventFn('Hide');
            };
            HttpCommander.Main.fm.onLogOut = function(user, domain) { // logout
                callEventFn('LogOut', user, domain);
            };
            HttpCommander.Main.fm.onDestroy = function() { // destroy
                callEventFn('Destroy');
                try {
                    //if (view && view.destroy) view.destroy();
                    if (HttpCommander.Main.fm) {
                        delete HttpCommander.Main.fm;
                        HttpCommander.Main.fm = undefined;
                    }
                } catch (e) {
                    ProcessScriptError(e);
                }
            };

            var setEvent = function(eventName, func) {
                if (typeof eventName == "string" && eventNames.indexOf(eventName) != -1 && typeof func == "function") {
                    HttpCommander.Main.events[eventName] = func;
                    if (eventName === "LogOut" && $('#jqm-settings-logout')) {
                        $('#jqm-settings-logout').show();
                    }
                }
            };
            HttpCommander.Main.fm["SetEvent"] = setEvent;
            HttpCommander.Main.fm["Show"] = function() {
                //HttpCommander.Main.ui.show();
            };
            HttpCommander.Main.fm["Hide"] = function() {
                //HttpCommander.Main.ui.hide();
            };

            return HttpCommander.Main.fm;

        }
    },

    //Meta data columns
    colModelMetaDataGrid: [
			{
			    header: htcConfig.locData.FileDetailsGridTitleColumn,
			    name: 'title',
			    type: 'string'
			},
			{
			    header: htcConfig.locData.CommonFieldLabelValue,
			    name: 'value',
			    type: 'string'
			},
			{
			    header: htcConfig.locData.FileDetailsGridAuthorColumn,
			    name: 'userlastmodified',
			    type: 'string'
			},
			{
			    header: htcConfig.locData.CommonFieldLabelDateModified,
			    name: 'datemodified',
			    type: 'date',
			    dateFormat: 'timestamp'
			}
	],


    configureEventHandlers: function() {
        /*
        Attach event handler to all list item links    
        */
        $('a[id^="listItem"]').live("click", this.listItemClick);
        // button handler for header of file info panel
        $('a[id^="jqm-fileInfo-header-btn"]').bind("click", this.fileInfoHeaderHandler);
        $('a[id^="jqm-uploadFromUrl-header-btn"]').bind("click", this.fileInfoHeaderHandler);
        $('a[id^="jqm-uploadHeader-btn"]').bind("click", this.fileInfoHeaderHandler);

        // button handler for footer of file info panel
        // $('a[id^="jqm-fileInfo-footer-btn"]').bind("click", this.fileInfoFooterHandler);
        // button handler for header of file list
        $('a[id^="jqm-main-header-btn"]').bind("click", this.fileListHeaderHandler);
        $('a[id^="jqm-main-footer-btn"]').bind("click", this.fileListHeaderHandler);
        $('a[id^="jqm-settings-home"]').bind("click", this.fileListHeaderHandler);
        $('#jqm-settings-logout').bind("click", this.fileListHeaderHandler);

        $('a[id^="jqm-uploadMenu"]').bind("click", this.fileListHeaderHandler);
        $('input[id^="jqm-uploadFromUrl-content-submit-btn"]').bind("click", this.fileListHeaderHandler);

        // button handler for header in options popup dialog
        $('a[id^="jqm-optionsMenu-header-btn"]').bind("click", this.fileInfoHeaderHandler);
        $("a[data-role='button']").live('click', function() {
            HttpCommander.Main.resetButton($(this));
        });
        $('a[id^="listItem"]').live("click", function() {
            HttpCommander.Main.resetButton($('li[class*="ui-btn-active"]'));
        });

    },
    resetButton: function(button) {
        setTimeout(function() {
            try {
                $(button).removeClass('ui-btn-active');
            } catch (err) { }
        }, 500);
    },

    init: function() {

        try {
            $.each(htcConfig.metaDataFields, function(key, item) {
                var flag = true;
                for (var i = 0; i < HttpCommander.Main.colModelMetaDataGrid.length; i++)
                    if (HttpCommander.Main.colModelMetaDataGrid[i].name == item.name) {
                    flag = false;
                    break;
                }
                if (flag) {
                    var column = {
                        header: item.name.substring(0, 1).toUpperCase() + item.name.substring(1),
                        name: item.name,
                        type: item.type,
                        dateFormat: item.type == 'date' ? 'timestamp' : ''
                    };
                    HttpCommander.Main.colModelMetaDataGrid.push(column);
                }
            });


            this.configureEventHandlers();
            //Init object for ext direct communication
            this.extDirect = {
                url: '',
                tid: 1,
                directAction: 'Common',
                directMethod: 'GetInfo',
                responseIsArray: true,
                cbs: new Array(),
                callMethod: function(url, action, method, params, callback) {
                    this.url = url;
                    this.cbs[this.tid] = callback;
                    this.directAction = action;
                    this.directMethod = method;
                    this.params = params;
                    this.load();
                },
                load: function() {
                    var requestData = {
                        type: "rpc",
                        action: this.directAction,
                        method: this.directMethod,
                        tid: this.tid,
                        data: this.params
                    };
                    $.mobile.showPageLoadingMsg();
                    var that = jQuery.extend(true, {}, this);

                    $.ajax({
                        url: this.url,
                        global: false,
                        processData: false,
                        type: "POST",
                        data: $.toJSON(requestData),
                        dataType: "json",
                        async: true,
                        success: function(data, textStatus, jqXHR) {
                            that.complete(data, textStatus, jqXHR, that);
                        } /*,
                        complete: function(jqXHR, textStatus) {
                            alert(textStatus);
                        }*/,
                        error: function(jqXHR, textStatus, errorThrown) {
                            alert(errorThrown);
                        }
                    });
                    this.tid++;
                },
                complete: function(data, textStatus, jqXHR, that) {
                    $.mobile.hidePageLoadingMsg();
                    if (that.responseIsArray) data = data[0];
                    if (data.tid && data.type == 'rpc') {
                        that.cbs[data.tid].call(that, data, textStatus, jqXHR);
                        //alert(textStatus+" tid:"+data.tid+" callback: "+that.cbs[data.tid]);
                        //delete that.cbs[data.tid];
                        that.cbs = $.grep(that.cbs, function(val) { return val != that.cbs[data.tid]; });
                    }
                    else if (data.type == 'exception') {
                        if (data.action == 'Grid' && data.method == 'FastLoad')
                            HttpCommander.Main.currentDirectory = HttpCommander.Main.pathUp(HttpCommander.Main.getCurrentFolder());
                        alert(data.message || data.msg || data.error);
                    }
                    return false;
                }
            }

        }
        catch (e) {
            this.ProcessScriptError(e);
        }
        try {
            this.openGridFolder(HttpCommander.Main.defaultPath != null ? HttpCommander.Main.defaultPath : "root");
        }
        catch (e) {
            this.ProcessScriptError(e);
        }
        //this.extDirect.callMethod(HttpCommander.Remote.GridHandler.url, "Grid","Load", ["name","ASC","root"], this.generateFileList);
    },



    //Render file info panel based on received data
    showFileInfoPanel: function(data, textStatus, jqXHR, that) {
        if (data && data.result && (data.result.status == 'success' || data.result.success)) {
            HttpCommander.Main.fileInfo = data.result;
            //$("#jqm-fileInfo-header-caption").html(data.result.name);
            $.mobile.changePage($("#jqm-fileInfo"), "none", false, true);
            HttpCommander.Main.configureFileInfoPanel();
        }
        else if (data && data.result) {
            alert(data.result.message);
        }
        return false;
    },
    //Get list item object by anchor element
    getListItemIndexByElement: function(item) {
        var id = item.id;
        try { return id.indexOf("listItem") >= 0 ? id.substring(id.indexOf("listItem") + "listItem".length) : -1; }
        catch (e) { }
        return -1;
    },

    //Action on for click event in list
    listItemClick: function() {
        var index = HttpCommander.Main.getListItemIndexByElement(this);
        if (index >= 0) {
            var item = HttpCommander.Main.currentListData[index],
                newPath;
            if (item.rowtype == "folder" || item.rowtype == "rootfolder") {
                newPath = HttpCommander.Main.pathAppendFolder(HttpCommander.Main.getCurrentFolder(), item.name);
                HttpCommander.Main.openGridFolder(newPath);
            }
            else if (item.rowtype == "uplink") {
                HttpCommander.Main.itemToSelect = HttpCommander.Main.getCurrentFolderName();
                newPath = HttpCommander.Main.pathUp(HttpCommander.Main.getCurrentFolder());
                HttpCommander.Main.openGridFolder(newPath);
            }
            else if (item.rowtype == "file") {
                HttpCommander.Main.loadFileInfo(item);
            }
        }
        return false;
    },
    //Action for folder change
    folderChanged: function() {
        var curFolder = HttpCommander.Main.getCurrentFolderName();
        $("#jqm-main-header-caption").html(curFolder == 'root' ? htcConfig.locData.CommonMainTitle
            : HttpCommander.Main.htmlEncode(curFolder));
        if (curFolder == 'root')
            $("#jqm-main-header-btnBack").hide()
        else
            $("#jqm-main-header-btnBack").show();
        var uploadVisible = !this.isiPhone() && htcConfig.currentPerms && htcConfig.currentPerms.upload;
        if ($("#jqm-main-footer-btnUpload"))
            uploadVisible ? $("#jqm-main-footer-btnUpload").show() : $("#jqm-main-footer-btnUpload").hide();
    },
    //Configure file info panel before display 
    configureFileInfoPanel: function() {
        $("#jqm-fileInfo-content-fileName").text(this.fileInfo.props.name);
        $("#jqm-fileInfo-content-fileType").val(this.fileInfo.props.type);
        $("#jqm-fileInfo-content-fileSize").val(HttpCommander.Main.sizeRenderer(this.fileInfo.props.size));
        $("#jqm-fileInfo-content-fileCreationDate").val(HttpCommander.Main.dateRenderer(this.fileInfo.props.created));
        $("#jqm-fileInfo-content-fileModificationDate").val(HttpCommander.Main.dateRenderer(this.fileInfo.props.modified));
        $("#jqm-fileInfo-content-fileAccessedDate").val(HttpCommander.Main.dateRenderer(this.fileInfo.props.accessed));
        var downloadVisible = htcConfig.currentPerms && htcConfig.currentPerms.download;
        var name = this.fileInfo.props.name;
        var selType = "file";

        var viewVisible = htcConfig.currentPerms && selType == "file" && htcConfig.currentPerms.download;
        if (viewVisible) {
            var fileExt = HttpCommander.Main.file_get_ext(name.toLowerCase());
            viewVisible = htcConfig.mimeTypes.indexOf(fileExt) != -1;
            /*if (viewVisible)
            viewVisible = msoSupportedtypes.indexOf(";" + fileExt + ";") == -1;*/
        }
        var viewEnabled = selType != "empty";

        var googleViewVisiable = htcConfig.currentPerms && htcConfig.currentPerms.download && htcConfig.enableGoogleDocumentsViewer;
        var googleViewEnabled = googleViewVisiable && HttpCommander.Main.googleDocSupportedtypes.indexOf(";" + HttpCommander.Main.file_get_ext(name.toLowerCase()) + ";") != -1;
        var fileUrl;

        if ($("#jqm-fileInfo-footer-btnDownload"))
            if (downloadVisible) {
            fileUrl = /*htcConfig.relativePath + */"Handlers/Download.ashx?action=download&file=" + encodeURIComponent(HttpCommander.Main.getCurrentFolder()) + "/" + encodeURIComponent(this.fileInfo.props.name);
            $("#jqm-fileInfo-footer-btnDownload").attr('href', fileUrl);
            $("#jqm-fileInfo-footer-btnDownload").attr('target', "blank");
            $("#jqm-fileInfo-footer-btnDownload").show();
        }
        else
            $("#jqm-fileInfo-footer-btnDownload").hide();

        if ($("#jqm-fileInfo-footer-btnView"))
            if (viewVisible && viewEnabled) {
            fileUrl = /*htcConfig.relativePath + */"Handlers/Download.ashx?action=view&file=" + encodeURIComponent(HttpCommander.Main.getCurrentFolder()) + "/" + encodeURIComponent(this.fileInfo.props.name);
            $("#jqm-fileInfo-footer-btnView").attr('href', fileUrl);
            $("#jqm-fileInfo-footer-btnView").attr('target', "blank");
            $("#jqm-fileInfo-footer-btnView").show();
        }
        else
            $("#jqm-fileInfo-footer-btnView").hide();

        if ($("#jqm-fileInfo-footer-btn-google-view"))
            if (googleViewEnabled) {
            $("#jqm-fileInfo-footer-btn-google-view").attr('href', '');
            $("#jqm-fileInfo-footer-btn-google-view").attr('target', "blank");
            $("#jqm-fileInfo-footer-btn-google-view").show();
        }
        else
            $("#jqm-fileInfo-footer-btn-google-view").hide();
        if(googleViewEnabled) {
            $("#jqm-fileInfo-footer-viewControl").show();
            HttpCommander.Main.loadAnonymLink(googleViewEnabled ? 'GoogleView' : 'ZohoView');
        }
        else
            $("#jqm-fileInfo-footer-viewControl").hide();

        /*Configure modifications list*/
        if (this.fileInfo.modifications && this.fileInfo.modifications.length > 0) {
            $("#jqm-fileInfo-modifications").show();
            var modsList = $("#jqm-fileInfo-modifications-list");
            modsList.empty();
            //show modifications in list
            $.each(this.fileInfo.modifications, function(key, value) {
                modsList.append('<li data-icon="false"><table style="border-collapse:separate; border-spacing: 10px 0px;"><tr><td><div class="sencha-table-label" >' + htcConfig.locData.CommonFieldLabelType + '</div></td><td> ' + HttpCommander.Main.htmlEncode(value.type) + '</td></tr>' +
                    '<tr><td><div class="sencha-table-label" >' + htcConfig.locData.CommonFieldLabelUser + '</div></td><td>' + HttpCommander.Main.htmlEncode(value.user) + '</td></tr>' +
                    '<tr><td><div class="sencha-table-label" >' + htcConfig.locData.CommonFieldLabelSize + '</div></td><td>' + HttpCommander.Main.sizeRenderer(value.size) + '</td></tr>' +
                    '<tr><td><div class="sencha-table-label" >' + htcConfig.locData.CommonFieldLabelDate + '</div></td><td>' + HttpCommander.Main.dateRenderer(value.date) + '</td></tr>' +
                    '<tr><td><div class="sencha-table-label" >' + htcConfig.locData.CommonFieldLabelPath + '</div></td><td>' + HttpCommander.Main.htmlEncode(value.path) + '</td></tr></table></li>'
               );
            });
            modsList.listview('refresh');
        }
        else
            $("#jqm-fileInfo-modifications").hide();

        if (this.fileInfo.metadata && this.fileInfo.metadata.length > 0) {
            $("#jqm-fileInfo-metadata").show();
            var metaList = $("#jqm-fileInfo-metadata-list");
            metaList.empty();
            //show modifications in list
            var line = '';
            //read all metadata
            $.each(this.fileInfo.metadata, function(key, value) {
                line = '<li data-icon="false"><table style="border-collapse:separate; border-spacing: 10px 0px;">';
                //read all available metadata columns
                $.each(HttpCommander.Main.colModelMetaDataGrid, function(key, item) {
                    line += '<tr><td><div class="sencha-table-label" >' + HttpCommander.Main.htmlEncode(item.header) + '</div></td><td>';
                    switch (item.type) {
                        case 'size':
                            line += HttpCommander.Main.sizeRenderer(value[item.name]);
                            break;
                        case 'date':
                            line += HttpCommander.Main.dateRenderer(value[item.name]);
                            break;
                        default:
                            line += HttpCommander.Main.htmlEncode(value[item.name]);
                    }
                    line += '</td></tr>';
                });

                line += '</table></li>';
                metaList.append(line);

            });
            metaList.listview('refresh');
        }
        else
            $("#jqm-fileInfo-metadata").hide();
    },

    anonymLinkReceived: function(data, textStatus, jqXHR, that) {
        if (data && data.result && (data.result.status == 'success' || data.result.success)) {
            var url = data.result.url;
            if (url == '')
                return;

            /* Add a fake paramenter to make the url appear to point to a real file. 
            It looks like doc.google.com needs file extension
            in order to recognise the type of the file. 
            .docx file are not shown without this trick. */
            var name = HttpCommander.Main.fileInfo.props.name;

            if ($("#jqm-fileInfo-footer-btn-google-view")) {
                var url_parts = url.split('?');
                url = url_parts[0] + '/' + name;
                for (var i = 1; i < url_parts.length; i++)
                    url += '?' + url_parts[i];
                $("#jqm-fileInfo-footer-btn-google-view").attr('href', 'https://drive.google.com/viewerng/viewer?embedded=false&url=' + escape(url));

            }
        }
        else if (data && data.result) {
            alert(data.result.message);
        }
        return false;
    },

    //Handlers for header/footer button
    fileInfoHeaderHandler: function() {
        switch (this.id) {
            case "jqm-fileInfo-header-btnBack":
            case "jqm-optionsMenu-header-btnBack":
            case "jqm-uploadFromUrl-header-btnBack":
            case "jqm-uploadHeader-btnBack":
                $.mobile.changePage($("#jqm-main-list"), "none", true, true);
                break;
        }
        return false;
    },

    fileInfoFooterHandler: function() {
        switch (this.id) {
            case "jqm-fileInfo-footer-btnDownload":
            //Commented : removed support of zoho viewer
            //case "jqm-fileInfo-footer-btn-zoho-view":
            case "jqm-fileInfo-footer-btn-google-view":
                //$.mobile.changePage($("#jqm-main-list"), "slide", true, true);
                //HttpCommander.Main.downloadFile(HttpCommander.Main.fileInfo.name, HttpCommander.Main.getCurrentFolder());
                return true;
        }
        return false;
    },

    fileListHeaderHandler: function() {
        switch (this.id) {
            case "jqm-main-header-btnBack":
                HttpCommander.Main.itemToSelect = HttpCommander.Main.getCurrentFolderName();
                var newPath = HttpCommander.Main.pathUp(HttpCommander.Main.getCurrentFolder());
                HttpCommander.Main.openGridFolder(newPath);
                break;
            case "jqm-settings-logout":
                if (HttpCommander.Main.asControl) {
                    HttpCommander.Main.fm.onLogOut(htcConfig.currentUser,
                        typeof htcConfig.currentUserDomain != 'undefined' && htcConfig.currentUserDomain != ''
                            ? htcConfig.currentUserDomain : undefined);
                    return false;
                }
                else
                    location.href = /*htcConfig.relativePath + */"Logout.aspx";
                break;
            case "jqm-settings-home":
                HttpCommander.Main.openGridFolder("root");
                break;
            case "jqm-main-header-btnSettings":
            case "jqm-main-footer-btnSettings":
                $.mobile.changePage($("#jqm-optionsMenu"), "none", false, true);
                if (HttpCommander.Main.asControl && !HttpCommander.Main.events["LogOut"])
                    $('#jqm-settings-logout').hide();
                break;
            case "jqm-main-footer-btnUpload":
                $.mobile.changePage($("#jqm-uploadMenu"), "none", false, true);
                break;
            case "jqm-uploadMenu-upload":
                var uploadUrl = /*htcConfig.relativePath + */"Handlers/UploadJQuery.aspx?";
                uploadUrl += "path=" + encodeURIComponent(HttpCommander.Main.getCurrentFolder()) + "&Mobile=jquery";
                $.mobile.changePage(uploadUrl, "slide", false, true);
                break;
            case "jqm-uploadMenu-uploadFromUrl":
                $("#jqm-uploadFromUrl-content-field").val("");
                $("#jqm-uploadFromUrl-content-file-name").val("");
                $("#jqm-uploadFromUrl-content-file-status").val("");
                $.mobile.changePage($("#jqm-uploadFromUrl"), "none", false, true);
                break;
            case "jqm-uploadFromUrl-content-submit-btn":
                HttpCommander.Main.uploadFromUrl();
                break;
        }
        return false;
    },

    //download cy\urrent file
    downloadFile: function(name, path, windowOpen) {
        if (htcConfig.currentPerms && htcConfig.currentPerms.download) {
            var fileUrl = /*htcConfig.relativePath + */"Handlers/Download.ashx?action=download&file=" + encodeURIComponent(path) + "/" + encodeURIComponent(name);
            if (!window.open(fileUrl))
                location.href = fileUrl;
        }
    },
    //open specified path
    openGridFolder: function(getPath, doNotLoadList) {
        HttpCommander.Main.currentDirectory = getPath;
        HttpCommander.Main.extDirect.callMethod(HttpCommander.Remote.GridHandler.url, "Grid", "FastLoad", ["name", "ASC", getPath], //Render received list data 
             function(data, textStatus, jqXHR, that) {
                 if (data && data.result && data.result.success) {
                     HttpCommander.Main.currentListData = data.result.data;
                     htcConfig.currentPerms = eval("(" + data.result.permissions + ")");
                     var fileList = $("#jqm-main-filesList");
                     fileList.empty();

                     $.each(data.result.data, function(key, value) {
                         var itemUrl = "Default.aspx?";

                         if (window.location.search)
                             itemUrl += encodeURIComponent(window.location.search.substring(1)) + "&";
                         if (value.rowtype == "folder" || value.rowtype == "rootfolder")
                             itemUrl += "path=" + encodeURIComponent(HttpCommander.Main.pathAppendFolder(HttpCommander.Main.getCurrentFolder(), value.name));
                         else if (value.rowtype == "uplink")
                             itemUrl += "path=" + encodeURIComponent(HttpCommander.Main.pathUp(HttpCommander.Main.getCurrentFolder()));
                         else if (value.rowtype == 'file')
                             itemUrl += "path=" + encodeURIComponent(HttpCommander.Main.getCurrentFolder());
                         else
                             return;
                         //Uncomment to add icon (info) for files
                         //data-icon="' + (value.rowtype == 'file' ? 'info' : 'false') + '
                         var modIcons = "";
                         if (value.isnew) {
                             modIcons += "&nbsp;<img src='" + htcConfig.relativePath + "Images/isnew.png' class='no_class' />";
                         }
                         if (value.ismod) {
                             modIcons += "&nbsp;<img src='" + htcConfig.relativePath + "Images/ismod.png' class='no_class' />";
                         }
                         /* if (modIcons)
                         modIcons = "<span>" + modIcons + "</span>";*/
                         fileList.append('<li class="ui-li-has-icon" data-icon="false">\
                        <img class="ui-li-icon" src="' + htcConfig.relativePath + value.icon + '">\
                        <a style="white-space:normal" id="listItem' + key + '" href="' + itemUrl + '" >' + HttpCommander.Main.htmlEncode(value.name) + modIcons + '</a></li>');
                     });
                     fileList.listview('refresh');
                     $(".no_class").each(function(index) { $(this).removeClass("ui-li-thumb ui-corner-tl"); });
                     if (!doNotLoadList)
                         $.mobile.changePage($("#jqm-main-list"), "none", false, false);
                 }
                 else {
                     HttpCommander.Main.currentDirectory = HttpCommander.Main.pathUp(HttpCommander.Main.getCurrentFolder());
                     if (data && data.result)
                        alert(data.result.msg);
                 }
                 HttpCommander.Main.folderChanged();
                 return false;
             });
    },
    //load info for specified item
    loadFileInfo: function(item) {
        var data = { type: item.rowtype, name: item.name, path: this.getCurrentFolder(), isMobile: true };
        HttpCommander.Main.extDirect.callMethod(HttpCommander.Remote.MetadataHandler.url, "Metadata", "Load", [data], HttpCommander.Main.showFileInfoPanel);
    },
    //get anonym link
    loadAnonymLink: function(service) {
        var data = { path: this.getCurrentFolder(), name: this.fileInfo.props.name, service: service };
        HttpCommander.Main.extDirect.callMethod(HttpCommander.Remote.CommonHandler.url, "Common", "AnonymLink", [data], HttpCommander.Main.anonymLinkReceived);
    },

    //upload from url
    uploadFromUrl: function() {
        $("#jqm-uploadFromUrl-content-file-status").val(htcConfig.locData.UploadInProgress + "...");
        var rdata = { path: this.getCurrentFolder(), name: $("#jqm-uploadFromUrl-content-file-name").val(), url: $("#jqm-uploadFromUrl-content-field").val() };
        HttpCommander.Main.extDirect.callMethod(HttpCommander.Remote.UploadFromURLHandler.url, "UploadFromURL", "Upload", [rdata], function(data, textStatus, jqXHR, that) {
            if (typeof data == 'undefined' || typeof data.result == 'undefined') {
                //alert(trans.message);
                return;
            }
            if (!data.result.success) {
                alert(data.result.message);
                $("#jqm-uploadFromUrl-content-file-status").val(data.result.message);
                return;
            }
            $("#jqm-uploadFromUrl-content-file-status").val(HttpCommander.Main.format(htcConfig.locData.UploadFromUrlSuccessMsg, data.result.file, rdata.url));
            HttpCommander.Main.openGridFolder(rdata.path, true);
        });
    },

    /* concatenate path + name producing new path */
    pathAppendFolder: function(path, name) {
        if (path.toLowerCase() == "root")
            return name;
        if (path.length > 0 && path[path.length - 1] != '/')
            path += '/';
        return path + name;
    },

    /* one level up, truncate the last folder */
    pathUp: function(path) {
        var i = path.lastIndexOf('/');
        if (i < 0)
            return "root";
        else
            return path.substr(0, i);
    },

    /*
    Return name of current folder.
    */
    getCurrentFolderName: function() {
        var path = HttpCommander.Main.getCurrentFolder();
        var i = path.lastIndexOf('/');
        if (i < 0)
            return path;
        else
            return path.substr(i + 1);
    },

    // folder opened in HttpCommander
    getCurrentFolder: function() {
        return HttpCommander.Main.currentDirectory;
    },
    /*
    If some error in JS occured
    */
    ProcessScriptError: function(e) {
        if (HttpCommander.Main.handleErrors) {
            var msg = "Script error occured. ";
            if (e != undefined && e.message != undefined && e.name != undefined)
                msg += "Message:" + e.message + " Name: " + e.name;
            window.alert(msg);
        }
        else
            throw e;
    },
    //render size
    sizeRenderer: function(size) {
        if (size == "") return "";
        else if (size < 1024) {
            return size + " bytes";
        } else if (size < 1048576) {
            return (Math.round(((size * 10) / 1024)) / 10) + " KB";
        } else if (size < 1073741824) {
            return (Math.round(((size * 10) / 1048576)) / 10) + " MB";
        } else {
            return (Math.round(((size * 10) / 1073741824)) / 10) + " GB";
        }
    },
    //RenderDate
    dateRenderer: function(date) {
        return new Date(date * 1000).toLocaleString();
    },
    //detect apple device . Upload is not supported on apple devices
    isiPhone: function() {
        return (
            (navigator.platform.indexOf("iPhone") != -1) ||
            (navigator.platform.indexOf("iPad") != -1) ||
            (navigator.platform.indexOf("iPod") != -1)
        );
    },
    file_get_ext: function(filename) {
        return typeof filename != "undefined" ? filename.substring(filename.lastIndexOf(".") + 1, filename.length).toLowerCase() : false;
    },

    format: function(str, col) {
        col = typeof col === 'object' ? col : Array.prototype.slice.call(arguments, 1);

        return str.replace(/\{\{|\}\}|\{(\w+)\}/g, function(m, n) {
            if (m == "{{") { return "{"; }
            if (m == "}}") { return "}"; }
            return col[n];
        });
    }

}


/*
Parse current query string
*/
$.urlParam = function(name) {
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (!results) { return 0; }
    return decodeURIComponent(results[1].replace(/\+/g, " ")) || 0;
}

/*
Make all header and footer fixed if browse compatible
*/
$('div').live('pagebeforecreate.onetime', function() {
    var footer = $('div[data-role="footer"], div[data-role="header"]');
    footer.addClass('ui-footer-fixed');
    footer.addClass('ui-fixed-overlay');
    footer.addClass('fade');
    footer.attr("data-position", "fixed");
    //unbind live event
    $('div').die('pagebeforecreate.onetime');
});

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) { return i; }
        }
        return -1;
    }
}