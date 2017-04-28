// #include "ExtOverrides.js"
// #include "Message.js"
// #include "Window.js"
// #include "Consts.js"
// #include "Utils.js"
// #include "PlayVideoFlashWindow.js"
// #include "PlayVideoHtml5Window.js"
// #include "PlayVideoJSWindow.js"
// #include "PlayAudioHtml5Window.js"
// #include "VideoConvertProgressWindow.js"
// #include "VideoConvertWindow.js"
// #include "ShortcutWindow.js"
// #include "LinkToFileFolderWindow.js"
// #include "ViewLinksWindow.js"
// #include "DataRenderers.js"
// #include "DetailsPane.js"
// #include "ThumbView.js"
// #include "CreatePublicLinkWindow.js"
// #include "LinksToWebFoldersWindow.js"
// #include "MailingGroupsWindow.js"
// #include "SendEmailWindow.js"
// #include "CheckInWindow.js"
// #include "VersionHistoryWindow.js"
// #include "ZipPromptWindow.js"
// #include "UnzipPromptWindow.js"
// #include "ZipContentWindow.js"
// #include "DownloadWindow.js"
// #include "FileModificationsWindow.js"
// #include "MetadataWindow.js"
// #include "MetadataWindowParts.js"
// #include "EditTextFileWindow.js"
// #include "UserHelpWindow.js"
// #include "SyncWebFoldersHelpWindow.js"
// #include "TreeLoader.js"
// #include "TreePanel.js"
// #include "FolderSelectionDialog.js"
// #include "Clipboard.js"
// #include "MenuActions.js"
// #include "GoogleDriveAuth.js"
// #include "GoogleDrive.js"
// #include "SkyDriveAuth.js"
// #include "SkyDrive.js"
// #include "DropboxAuth.js"
// #include "Dropbox.js"
// #include "BoxAuth.js"
// #include "Box.js"
// #include "ImageViewerWindow.js"
// #include "Html5ChunkedUpload.js"
// #include "SimpleUpload.js"
// #include "DragAndDropUpload.js"
// #include "DragAndDropZone.js"
// #include "JavaUpload.js"
// #include "FlashUpload.js"
// #include "SilverlightUpload.js"
// #include "UploadFromUrl.js"
// #include "iOSUpload.js"
// #include "UploadWindow.js"
// #include "OfficeEditor.js"
// #include "NewSubMenu.js"
// #include "ViewEditSubMenu.js"
// #include "ShareSubMenu.js"
// #include "CloudConvertWindow.js"
// #include "CloudStoragesSubMenu.js"
// #include "TrashSubMenu.js"
// #include "VersioningSubMenu.js"
// #include "LabelsMenu.js"
// #include "MoreSubMenu.js"
// #include "FileMenu.js"
// #include "AnonymContextMenu.js"
// #include "FlashViewerWindow.js"
// #include "FileSearchWindow.js"
// #include "ToolbarActions.js"
// #include "ControlNavFolders.js"
// #include "FavoritesSubMenu.js"
// #include "ActivityMonitor.js"
// #include "WatchSubMenu.js"
// #include "WatchModificationsWindow.js"
// #include "ChangesWatchWindow.js"

// Note. scriptSource variable must be at the top level, it must be assigned when this script loads.
//Do no place it elsewhere, in particular in HttpCommander.Main function.
var scriptSource = HttpCommander.Lib.Utils.getScriptSource();

Ext.ns('HttpCommander');

HttpCommander.Main = (function () { // Singleton HttpCommander.Main class

    /** Private fields */
    var hcMain = {};

    var vTypesApplied = false,
        connectionClassObserved = false;
    // absolute URL of the HttpCommander root folder
    var appRootUrl = (function () {
        // scriptSource == "http://server-name" + appRoolUrl + "Scripts/main.js"
        // scriptSource == "http://server-name" + appRoolUrl + "Scripts/main-debug.js"
        var url = scriptSource.replace(/\/Scripts\/[^\/]+$/i, "/");
        //url = url.replace(/^https?:\/\/[^\/]+\//i, "/");
        return url;
    })();
    /** End (Private fields) */

    /** Public members */

    /*! Uncomment line below to notify users that they should click logout  at the end) */
    /*! window.onunload = HttpCommander.Main.onunloadFunc; */
    hcMain.onunloadFunc = function () {
        if (Ext.isObject(htcConfig) && typeof htcConfig.version == 'string' && htcConfig.version.toLowerCase().indexOf("ad") == 0)
            window.alert("You should close your browser or click LogOut button to clear authentication otherwise anybody can login under your account!");
    };

    /**
    * Definition of array of file managers.
    */
    hcMain.FileManagers = {};

    /**
    * InitFileManager class.
    */
    hcMain.InitFileManager = function (config) {
        config = config || {};

        var debugmode = (config.debugmode === true),        // debug mode flag
            handleErrors = (config.handleErrors === true),  // set true to show window with error
            ProcessScriptError = function (e) {
                if (!debugmode && handleErrors) {
                    var msg = 'Script error occured.';
                    if (typeof e != 'undefined' && typeof e.message != 'undefined' && typeof e.name != 'undefined')
                        msg += ' Message: ' + e.message + ' Name: ' + e.name;
                    window.alert(msg);
                }
                if (HttpCommanderLog && typeof HttpCommanderLog.SetLastError == 'function')
                    HttpCommanderLog.SetLastError(e);
                if (debugmode || typeof window.onerror == 'function')
                    throw e;
            };

        // Get and check HttpCommander configuration
        var htcConfig = config.htcConfig || window.htcConfig;
        if (!Ext.isObject(htcConfig)) {
            ProcessScriptError(new Error("HTTP Commander configuration not defined! Please check up presence and correctness Handlers/Config.ashx script."));
            return null;
        } else if (typeof htcConfig['_ERROR_'] == 'string') {
            ProcessScriptError(new Error(htcConfig['_ERROR_']));
            return null;
        }

        //if (debugmode && !!window.console && !!window.console.log) {
        //    // debug info about session timeout
        //    //if (Ext.isNumber(htcConfig.sessionTimeout) && htcConfig.sessionTimeout > 0)
        //    //    htcConfig.sessionTimeout = 60000; // 1 minute only for debug mode testing
        //    window.console.log('session timeout: ' + (htcConfig ? (htcConfig.sessionTimeout || 0) : 0) / 60000 + ' minute(s)');
        //}

        HttpCommander.Lib.Utils.registerCssClasses(htcConfig);

        // Set Google Docs Viewer / Google Drive Editor / OWA Viewer/ MS OO Editor / Box Viewer / ShareCad / Adobe Image Editor file types from server
        if (htcConfig.msooEditorFileTypes)
            HttpCommander.Lib.Consts.msooEditorFileTypes = htcConfig.msooEditorFileTypes;
        else
            HttpCommander.Lib.Consts.msooEditorFileTypes = '';
        if (htcConfig.googleDocsViewerFileTypes)
            HttpCommander.Lib.Consts.googleDocSupportedtypes = htcConfig.googleDocsViewerFileTypes;
        if (htcConfig.googleDriveEditorFileTypes)
            HttpCommander.Lib.Consts.googleDriveEditorFileTypes = htcConfig.googleDriveEditorFileTypes;
        else
            HttpCommander.Lib.Consts.googleDriveEditorFileTypes = '';
        if (htcConfig.owaViewerFileTypes)
            HttpCommander.Lib.Consts.owaSupportedtypes = htcConfig.owaViewerFileTypes;
        if (htcConfig.boxViewerFileTypes)
            HttpCommander.Lib.Consts.boxViewSupportedtypes = htcConfig.boxViewerFileTypes;
        if (htcConfig.shareCadViewerFileTypes)
            HttpCommander.Lib.Consts.shareCadOrgSupportedTypes = htcConfig.shareCadViewerFileTypes;
        else
            HttpCommander.Lib.Consts.shareCadOrgSupportedTypes = '';
        if (htcConfig.autodeskViewerFileTypes)
            HttpCommander.Lib.Consts.autodeskViewerFileTypes = htcConfig.autodeskViewerFileTypes;
        else
            HttpCommander.Lib.Consts.autodeskViewerFileTypes = '';
        if (htcConfig.pixlrEditorFileTypes)
            HttpCommander.Lib.Consts.pixlrSupportedTypes = htcConfig.pixlrEditorFileTypes;
        else
            HttpCommander.Lib.Consts.pixlrSupportedTypes = '';
        if (htcConfig.adobeImageEditorFileTypes)
            HttpCommander.Lib.Consts.adobeImageSupportedTypes = htcConfig.adobeImageEditorFileTypes;
        else
            HttpCommander.Lib.Consts.adobeImageSupportedTypes = '';

        // is black theme
        var isBlackTheme = (';azzurra-black;access;'.indexOf(';' + (htcConfig.styleName || '').toLowerCase() + ';') >= 0);
        var isAccessTheme = (htcConfig.styleName || '').toLowerCase() == 'access';

        // Get and check FileManager container element
        var container = null;
        try {
            if (!!config.id) {
                if (typeof config.id == "string") { // element id
                    if (!(container = document.getElementById(config.id))) {
                        container = null;
                    }
                } else if (!container.tagName) { // no dom element
                    container = null;
                }
            }
        } catch (e) {
            ProcessScriptError(e);
            return null;
        }

        // User variables
        var allowSetFileNameAtSimpleUpload = false; // set true for change file name in simple upload form

        // constants
        // special folder names
        var _OLD_ROOT_ = 'root',
            _ROOT_ = ':root',
            _RECENT_ = ':recent',
            _TRASH_ = ':trash',
            _SHARED_ = ':shared',
            _SHARED_FOR_YOU_ = ':sharedforyou',
            _ALERTS_ = ':alerts',
            _SPEC_TREE_FOLDER_NAMES_ = [_OLD_ROOT_, _ROOT_, _RECENT_, _TRASH_, _SHARED_, _ALERTS_, _SHARED_FOR_YOU_],
            _SPEC_LANG_TITLE_KEYS_ = {};
        _SPEC_LANG_TITLE_KEYS_[_RECENT_] = 'RecentRootTitle';
        _SPEC_LANG_TITLE_KEYS_[_TRASH_] = 'TrashRootTitle';
        _SPEC_LANG_TITLE_KEYS_[_SHARED_] = 'SharedByLinkRootTitle';
        _SPEC_LANG_TITLE_KEYS_[_SHARED_FOR_YOU_] = 'SharedForYouRootTitle';
        _SPEC_LANG_TITLE_KEYS_[_ALERTS_] = 'WatchForModifsRootFolder';
        _SPEC_LANG_TITLE_KEYS_[_ROOT_] = _SPEC_LANG_TITLE_KEYS_[_OLD_ROOT_] = 'RootTitle';

        // Private variables
        var extOnReadyInvoked = false,
            activityMonitor = null,
            rendered = false,
            embedded = !(config.resizeToScreen === true),
            showMaximizedButton = (htcConfig.showFullScreenOrExitFullScreenButton == true),
            asControl = !(config.control === false),
            uid = String(config.id || ''),
            controlId = config.controlId || null,
            resizable = (config.resizable === true),
            draggable = (config.draggable === true),
            showHideIcon = (config.showHideIcon === true),
            hidden = (config.showOnLoad === false),
            modal = (config.modal === true),
            extEl = null,
            maxWidthThumb = maxHeightThumb = 100,
            thumbnailTpl,
            globalLoadMask,
            isEmbeddedtoIFRAME = false,
            Msg, Window, // MessageBox, Window classes
            pagingEnabled = false,
            logoBtn = config.logoBtn || {
                url: "",
                tooltip: "Your logo or link",
                icon: "Scripts/logo.png",
                showInNewWindow: false
            },
            logoHeader = { html: "" },
            welcome = { title: "Welcome window", message: "" },
            userHelpWindow, helpInNewPage = false,
            syncWebFoldersHelpWindow,

            offset = 0,
            clipboard = new HttpCommander.Lib.Clipboard(),
            tree, selectFolderTree,
            styleName = htcConfig.styleName,
            selectPath = null, searchWindow, // search vars
            sharedSelectPath = null, sharedFYSelectPath = null,
            grid, gridStore, gridColModel, currentGridView = 'detailed', allowEdit = false, // grid vars
            sharedGrid, sharedGridStore, sharedColModel, sharedGridPagingToolBar,
            sharedFYGrid, sharedFYGridStore, sharedFYColModel, sharedFYGridPagingToolBar,
            cardSwitchGrid,
            fileMenu, newSubMenu, versioningSubMenu, unzipSubMenu, copyMenu, moveMenu, // menus
            menuActions,
            sharedFileMenu,
            toptbarConfig = {}, toptbar, toptbarButtons = {},
        // and buttons
            viewEditSubMenu, cloudsSubMenu, trashSubMenu,
            shareSubMenu, labelsMenu, watchSubMenu, moreSubMenu,
            view, detailsPane,
        // Windows
            editTextFileWindow,
            imageViewerWindow,
            flashViewerWindow,
            enableDnDUploader = false, enableMultipleUploader = false,
            dndZone,
            uploadWindow,
            officeEditor, officeTypeDetected = 0,
            downloadToSkyDriveWindow,
            linkToFileFolderWindow, makePublicLinkWindow, viewLinksWindow,
            linksToWebFoldersWindow,
            sendEmailWindow,
            checkInWindow, versionHistoryWindow,
            zipContentWindow,
            downloadWindow,
        // Metadata (details) objects
            metadataWindow,
            showMetaDataInList = false,
            videoConvertWindow, playVideoFlashWindow, playVideoHtml5Window, playVideoJSWindow,
            playAudioHtml5Window,
            zipPromptWindow, unzipPromptWindow,
            shortcutWindow,
            cloudConvertWindow,
            itemDoubleClickEventDefined = false,
            googleDriveAuth,
            skyDriveAuth,
            dropboxAuth,
            boxAuth,
            downloadToGoogleWindow,
            editInGoogleWindow,
            editInMSOOWindow,
            editInOffice365Window,
            downloadToDropboxWindow,
            downloadToBoxWindow,
            isDemoMode = false,
            controlNavFolders = null, // back, forward, history controls object
            // arrays with toolbar buttons was can changed title
            editOpenTxtButtons = [],
            msoEditButtons = [],
            oooEditButtons = [],
            charsGrid = [],
            watchModifsWindow = null,
            changesWatchWindow = null,
            initAndShowSearch = Ext.emptyFn,
            metadataProvider = null,
            keepColsOnViewRecents = {
                'datemodified': true,
                'datecreated': false,
                'dateaccessed': false
            },
            keepGridSort = {
                'sort': 'name',
                'dir': 'ASC'
            };

        if (!uid || typeof uid !== 'string' || uid == '' || uid.trim() == '') {
            uid = HttpCommander.Lib.Utils.generateUniqueString();
        } else {
            uid = uid.trim().replace(/[^a-zA-Z0-9-_]+/g, '_');
            if (uid === '_') {
                uid = HttpCommander.Lib.Utils.generateUniqueString();
            }
        }

        var fm = { // FileManager object
            isRendered: function () { return rendered; },
            isEmbedded: function () { return embedded; },
            isControl: function () { return asControl; },
            instanceId: function () { return uid; },
            getElement: function () { return (extEl || {}).dom; },
            isHidden: function () { return hidden; },
            extOnReadyInvoked: function () { return extOnReadyInvoked; }
        };

        // Private events
        var eventNames = ["PreRender", "Render", "Show", "Hide", "LogOut", "Destroy", "ItemDoubleClick"];
        var events = {};
        var callEventFn = function (nameFn, args) {
            if (Ext.isObject(fm) && typeof nameFn === 'string' && typeof events[nameFn] === 'function') {
                var argsArray = [];
                if (!!args && Object.prototype.toString.apply(args) !== '[object Array]') {
                    for (var i = 1; i < arguments.length; i++) {
                        argsArray.push(arguments[i]);
                    }
                } else if (!!args) {
                    argsArray = args;
                }
                argsArray.push(fm);
                try {
                    return events[nameFn].apply(fm, argsArray);
                } catch (e) {
                    ProcessScriptError(e);
                }
            }
        };
        var onPreRender = function () { // prerender
            callEventFn('PreRender');
        };
        var onRender = function () { // render
            callEventFn('Render');
        };
        var onShow = function () { // showed
            callEventFn('Show');
        };
        var onHide = function () { // hided
            callEventFn('Hide');
        };
        var onLogOut = function (user, domain) { // logout
            callEventFn('LogOut', user, domain);
        };
        var onDestroy = function () { // destroy
            callEventFn('Destroy');
            try {
                if (view && view.destroy) view.destroy();
                if (fm) {
                    delete fm;
                    fm = undefined;
                }
            } catch (e) {
                ProcessScriptError(e);
            }
        };
        var onItemDoubleClick = function (itemPath) {
            callEventFn('ItemDoubleClick', itemPath);
        };
        var setEvent = function (eventName, func) {
            if (typeof eventName == "string" && eventNames.indexOf(eventName) != -1 && typeof func == "function") {
                events[eventName] = func;
                if (eventName === "LogOut" && toptbarButtons['Logout']) {
                    Ext.each(toptbarButtons['Logout'], function (item) {
                        item.setVisible(true);
                    });
                }
                if (eventName === "ItemDoubleClick") {
                    itemDoubleClickEventDefined = true;
                }
            }
        };
        fm["SetEvent"] = setEvent;

        if (HttpCommander.Lib.Utils.browserIs.ios) {
            helpInNewPage = true;
        }

        enableMultipleUploader =
               HttpCommander.Lib.Utils.browserIs.firefox36up
            || HttpCommander.Lib.Utils.browserIs.chrome2up
            || HttpCommander.Lib.Utils.browserIs.safari
            || HttpCommander.Lib.Utils.browserIs.ie10standard
            || HttpCommander.Lib.Utils.browserIs.ie11up
            || HttpCommander.Lib.Utils.browserIs.opera11up
            || HttpCommander.Lib.Utils.browserIs.yandex
            || HttpCommander.Lib.Utils.browserIs.edge;

        enableDnDUploader = (function () {
            var testXHR = null,
                enabled = false;
            try {
                // Drag-n-Drop folders in Microsoft Edge >= 14.14316
                // https://developer.microsoft.com/ru-ru/microsoft-edge/platform/issues/7230109/

                enabled = htcConfig.enableDnDUploader &&
                (
                       HttpCommander.Lib.Utils.browserIs.firefox4up
                    || HttpCommander.Lib.Utils.browserIs.chrome6up
                    || HttpCommander.Lib.Utils.browserIs.ie10standard
                    || HttpCommander.Lib.Utils.browserIs.ie11up
                    || HttpCommander.Lib.Utils.browserIs.opera11up
                    || HttpCommander.Lib.Utils.browserIs.yandex
                    || HttpCommander.Lib.Utils.browserIs.safari5up
                    || HttpCommander.Lib.Utils.browserIs.edge10586up // see https://wpdev.uservoice.com/forums/257854-microsoft-edge-developer/suggestions/8964523-support-html5-drag-and-drop-of-files-from-explorer, http://stackoverflow.com/questions/31649569/microsoft-edge-html5-file-drag-and-drop
                );
                if (enabled) {
                    enabled = false;
                    testXHR = HttpCommander.Lib.Utils.getXhrInstance();
                    enabled = (typeof testXHR.upload != 'undefined')
                        && (Ext.isFunction(window.FormData) || Ext.isObject(window.FormData));
                }
            } catch (e) {
                enabled = false;
                ProcessScriptError(e);
            } finally {
                if (testXHR) {
                    testXHR = null;
                    delete testXHR;
                }
            }
            return enabled;
        })();

        supportsWebGlCanvasForAutodesk = HttpCommander.Lib.Utils.webglAvailable();

        /** Private utils */

        var $ = function (elementId) {
            return uid + "_" + elementId;
        };

        var initQuickTips = function () { // initialize quick tips
            try {
                Ext.QuickTips.init();
            } catch (e) {
                ProcessScriptError(e);
            }
        };

        var showRefreshWarning = function () {
            try {
                Msg.show({
                    title: htcConfig.locData.CommonWarningCaption,
                    msg: htcConfig.locData.RefreshPageWarningMessage,
                    buttons: Msg.YESNO,
                    icon: Msg.QUESTION,
                    fn: function (btn) {
                        if (btn == 'yes') {
                            window.location.reload(true);
                        }
                    }
                });
            } catch (e) {
                ProcessScriptError(e);
            }
        };

        var showBalloon = function (text, fixed) {
            if (!view)
                return null;
            var tt = new Ext.Tip({
                autoHeight: true,
                width: 400,
                baseCls: 'x-tip', //'x-balloon',
                bodyCfg: {
                    tag: 'center'
                },
                renderTo: extEl,
                html: text
            });
            var vpos = view.el.getTop() + offset,
                hpos = view.el.getLeft() + ((view.el.getWidth() - 400) / 2);
            tt.showAt([hpos, vpos]);
            tt.el.disableShadow();
            var height = tt.el.getHeight() + 5;
            if (!fixed) {
                tt.el.animate({ opacity: { to: 1, from: 1} }, 3,
                    function (el) {
                        el.animate({ opacity: { to: 0, from: 1} }, 3,
                        function (el) {
                            el.remove();
                            offset -= height;
                        }, 'easeOut', 'run');
                    }, 'easeOut', 'run');
                offset += height;
            } else
                return tt.el;
        };

        var pathAppendFolder = function (path, name) { /* concatenate path + name producing new path */
            if (Ext.isEmpty(path) || path.toLowerCase() == 'root' || isRecentFolder(path, true))
                return name;
            if (path.length > 0 && path[path.length - 1] != '/')
                path += '/';
            return path + name;
        };
        var openUpLink = function (path) {
            if (!Ext.isDefined(path)) {
                path = getCurrentFolder();
            }
            var i = (Ext.isEmpty(path) ? -1 : path.lastIndexOf('/')),
                newPath = (i < 0 ? 'root' : path.substr(0, i)),
                curName = (i < 0 ? path : path.substr(i + 1));
            if (!Ext.isEmpty(newPath) && !Ext.isEmpty(curName)) {
                selectPath = {
                    path: newPath,
                    name: curName
                };
            }
            openGridFolder(newPath, true);
        };
        var openTreeNode = function (path, reloadLastNode /* = false */, forceHighlightCurrentFolderNode /* = false */) {
            if (!tree)
                return;
            tree.openTreeNode(path, reloadLastNode, forceHighlightCurrentFolderNode);
        };
        var openTreeRecent = function () {
            if (!tree || !htcConfig.enableRecents)
                return;
            //tree.openTreeNode(_RECENT_, true);
        };
        var openTreeAlerts = function () {
            if (!tree || !htcConfig.enableRecents)
                return;
            tree.openTreeNode(_ALERTS_, true);
        }
        var openAlertsFolder = function (forceReloadIfOpened) {
            if (!(htcConfig.watchForModifs === true))
                return;
            if (forceReloadIfOpened || getCurrentFolder().toLowerCase() != _ALERTS_)
                openGridFolder(_ALERTS_);
        };
        var openSharedByLink = function () {
            if (htcConfig.sharedInTree) {
                openGridFolder(_SHARED_, true, true);
                openTreeNode(_SHARED_, true);
                return true;
            } else {
                return false;
            }
        };
        var openSharedForYou = function () {
            if (htcConfig.sharedForYou) {
                openGridFolder(_SHARED_FOR_YOU_, true, true);
                openTreeNode(_SHARED_FOR_YOU_, true);
                return true;
            } else {
                return false;
            }
        };
        var openTrash = function (onlyGrid) {
            if (htcConfig.enableTrash) {
                if (onlyGrid === true) {
                    openGridFolder(_TRASH_);
                } else {
                    openGridFolder(_TRASH_, true, true);
                }
            }
        };
        var reloadTreeNodeIfOpened = function (pathStr) {
            if (!tree)
                return;
            tree.reloadTreeNodeIfOpened(pathStr);
        };
        var getFolderTitle = function (path, curFolder) {
            if (Ext.isEmpty(path) || path.trim().length == 0 || path.toLowerCase() == 'root') {
                return htcConfig.locData.RootTitle;
            }
            if (typeof curFolder != 'undefined') {
                if (isRecentFolder(curFolder)) {
                    if (isRecentFolder(path)) {
                        return htcConfig.locData.RecentRootTitle;
                    } else {
                        return (htcConfig.recentGroups[path] || path);
                    }
                }
            } else {
                if (isRecentFolder(path)) {
                    return htcConfig.locData.RecentRootTitle
                } else if (isRecentFolder()) {
                    return (htcConfig.recentGroups[path] || path);
                }
            }
            if (_SPEC_LANG_TITLE_KEYS_.hasOwnProperty(path)) {
                return htcConfig.locData[_SPEC_LANG_TITLE_KEYS_[path]];
            }
            return path;
        };
        var openGridFolder = function (path, reloadTree, reloadLastNode, fromControlNav, keepCurrentPage) {
            var curPage = 1, pd;
            if (htcConfig.sharedForYou && isSharedForYouTreeFolder(path)) {
                if (cardSwitchGrid && sharedFYGrid) {
                    if (!!detailsPane) {
                        detailsPane.prepareData();
                    }
                    cardSwitchGrid.getLayout().setActiveItem(sharedGrid ? 2 : 1);
                    view.doLayout();
                    if (pagingEnabled) {
                        curPage = 1;
                        if (keepCurrentPage === true) {
                            pd = sharedFYGrid.getBottomToolbar();
                            if (!!pd) {
                                pd = pd.getPageData();
                            } else {
                                pd = null;
                            }
                            curPage = !pd ? 1 : pd.activePage;
                            if (curPage < 1) {
                                curPage = 1;
                            }
                        }
                        var pars = {
                            start: (curPage - 1) * htcConfig.itemsPerPage,
                            limit: htcConfig.itemsPerPage,
                            path: path
                        };
                        if (sharedFYGridStore.baseParams.sort)
                            pars.sort = sharedFYGridStore.baseParams.sort;
                        if (sharedFYGridStore.baseParams.dir)
                            pars.dir = sharedFYGridStore.baseParams.dir;
                        sharedFYGridStore.storeOptions(pars);
                        sharedFYGridStore.load({ params: pars });
                    } else {
                        sharedFYGridStore.reload();
                    }
                } else {
                    Msg.alert(htcConfig.locData.CommonErrorCaption, 'Grid for view shared foy you public links is not prepared!');
                    return;
                }
            } else if (htcConfig.sharedInTree && isSharedTreeFolder(path)) {
                if (cardSwitchGrid && sharedGrid) {
                    if (!!detailsPane) {
                        detailsPane.prepareData();
                    }
                    cardSwitchGrid.getLayout().setActiveItem(1);
                    view.doLayout();
                    sharedGridStore.setBaseParam('linkPath', null);
                    if (pagingEnabled) {
                        curPage = 1;
                        if (keepCurrentPage === true) {
                            pd = sharedGrid.getBottomToolbar();
                            if (!!pd) {
                                pd = pd.getPageData();
                            } else {
                                pd = null;
                            }
                            curPage = !pd ? 1 : pd.activePage;
                            if (curPage < 1) {
                                curPage = 1;
                            }
                        }
                        var pars = {
                            start: (curPage - 1) * htcConfig.itemsPerPage,
                            limit: htcConfig.itemsPerPage,
                            path: path
                        };
                        if (sharedGridStore.baseParams.sort)
                            pars.sort = sharedGridStore.baseParams.sort;
                        if (sharedGridStore.baseParams.dir)
                            pars.dir = sharedGridStore.baseParams.dir;
                        sharedGridStore.storeOptions(pars);
                        sharedGridStore.load({ params: pars });
                    } else {
                        sharedGridStore.reload();
                    }
                } else {
                    Msg.alert(htcConfig.locData.CommonErrorCaption, 'Grid for view public links is not prepared!');
                    return;
                }
            } else if (gridStore) {
                if (cardSwitchGrid) {
                    cardSwitchGrid.getLayout().setActiveItem(0);
                    view.doLayout();
                }
                gridStore.reloadTree = null;
                if (reloadTree === true) {
                    gridStore.reloadTree = function () {
                        openTreeNode(path, reloadLastNode);
                    };
                } else if (typeof reloadTree == 'string' && reloadTree.length > 0) {
                    gridStore.reloadTree = function () {
                        openTreeNode(reloadTree, reloadLastNode);
                    };
                }
                if (path) {
                    while (path[path.length - 1] == '/' || path[path.length - 1] == '\\' || path[path.length - 1] == ' ')
                        path = path.substring(0, path.length - 1);
                }
                var newIsRecent = isRecentFolder(path);
                grid.toggledRecent = (isRecentFolder() != newIsRecent);
                var oldPath = gridStore.baseParams.path.toLowerCase();
                gridStore.setBaseParam('path', path);
                if (pagingEnabled) {
                    curPage = 1;
                    if (keepCurrentPage === true) {
                        pd = grid.getBottomToolbar();
                        if (!!pd) {
                            pd = pd.getPageData();
                        } else {
                            pd = null;
                        }
                        curPage = !pd ? 1 : pd.activePage;
                        if (curPage < 1) {
                            curPage = 1;
                        }
                    }
                    var pars = {
                        start: (curPage - 1) * htcConfig.itemsPerPage,
                        limit: htcConfig.itemsPerPage,
                        path: path
                    };
                    if (grid.toggledRecent) {
                        if (newIsRecent) {
                            pars.sort = 'daterecent';
                            pars.dir = 'DESC';
                        } else {
                            pars.sort = keepGridSort.sort;
                            pars.dir = keepGridSort.dir;
                        }
                        gridStore.storeOptions(pars);
                        gridStore.sort(pars.sort, pars.dir);
                    } else {
                        if (gridStore.baseParams.sort)
                            pars.sort = gridStore.baseParams.sort;
                        if (gridStore.baseParams.dir)
                            pars.dir = gridStore.baseParams.dir;
                        gridStore.load({ params: pars });
                    }
                } else {
                    if (grid.toggledRecent) {
                        if (newIsRecent) {
                            gridStore.sort('daterecent', 'DESC');
                        } else {
                            gridStore.sort(keepGridSort.sort, keepGridSort.dir);
                        }
                    } else {
                        gridStore.reload();
                    }
                }
            }
            if (!fromControlNav && controlNavFolders && typeof controlNavFolders.pushFolder == 'function')
                controlNavFolders.pushFolder(path);
        };
        var getCurrentFolder = function () { // folder opened in HttpCommander
            var isShared = !!sharedGrid && sharedGrid.rendered && !sharedGrid.hidden;
            var isSharedForYou = !!sharedFYGrid && sharedFYGrid.rendered && !sharedFYGrid.hidden;
            return isShared ? _SHARED_ : isSharedForYou ? _SHARED_FOR_YOU_
                : ((!!gridStore && gridStore.baseParams) ? gridStore.baseParams.path : null);
        };
        var getAvatarHtml = function (userName, hideWrap) {
            return HttpCommander.Lib.Utils.getAvatarHtml(userName, htcConfig.avatarColors, htcConfig.maxAbbrLen, hideWrap);
        };
        var isSpecialTreeFolderOrSubFolder = function (path) {
            var len = _SPEC_TREE_FOLDER_NAMES_.length,
                i = 0;
            if (!Ext.isDefined(path)) {
                path = getCurrentFolder();
            }
            if (Ext.isEmpty(path)) {
                return false;
            }
            path = path.toLowerCase();
            if (_SPEC_TREE_FOLDER_NAMES_.indexOf(path) >= 0) {
                return true;
            }
            path = '/' + path + '/';
            for (; i < len; ++i) {
                if (path.indexOf('/' + _SPEC_TREE_FOLDER_NAMES_[i] + '/') >= 0) {
                    return true;
                }
            }
            return false;
        };
        var isAlertsFolder = function (folderPath) {
            if (!htcConfig.watchForModifs) {
                return false;
            }
            if (!Ext.isDefined(folderPath)) {
                folderPath = getCurrentFolder();
            }
            if (Ext.isEmpty(folderPath)) {
                return false;
            }
            return folderPath.toLowerCase() == _ALERTS_;
        }
        var isSharedTreeFolder = function (folderPath) {
            if (!htcConfig.sharedInTree) {
                return false;
            }
            if (!Ext.isDefined(folderPath)) {
                folderPath = getCurrentFolder();
            }
            if (Ext.isEmpty(folderPath)) {
                return false;
            }
            return folderPath.toLowerCase() == _SHARED_;
        };
        var isSharedForYouTreeFolder = function (folderPath) {
            if (!htcConfig.sharedForYou) {
                return false;
            }
            if (!Ext.isDefined(folderPath)) {
                folderPath = getCurrentFolder();
            }
            return folderPath.toLowerCase() == _SHARED_FOR_YOU_;
        };
        var isRecentFolder = function (folderPath, checkOnlyOnSubfolder/*false*/) {
            if (!Ext.isDefined(folderPath)) {
                folderPath = getCurrentFolder();
            }
            if (Ext.isEmpty(folderPath)) {
                return false;
            }
            var isRcnt = (folderPath.toLowerCase().indexOf(_RECENT_) == 0);
            if (checkOnlyOnSubfolder === true && isRcnt) {
                return folderPath.indexOf('/') > 0;
            }
            return isRcnt;
        };
        var isTrashFolder = function (folderPath) {
            if (!Ext.isDefined(folderPath)) {
                folderPath = getCurrentFolder();
            }
            if (Ext.isEmpty(folderPath)) {
                return false;
            }
            return folderPath.toLowerCase() == _TRASH_;
        };
        var isRootFolder = function (folderPath) {
            if (!Ext.isDefined(folderPath)) {
                folderPath = getCurrentFolder();
            }
            if (Ext.isEmpty(folderPath)) {
                return true;
            }
            return (folderPath.toLowerCase() == _ROOT_) ||
                (folderPath.toLowerCase() == _OLD_ROOT_);
        };

        // Section for handle params from query string or htcConfig
        var getParamValue = function (paramName, paramType/*'boolean', 'int', 'string', ...*/, defaultValue, forceReturnFromQuery) {
            if (typeof defaultValue == 'undefined') {
                defaultValue = null;
            }
            if (typeof paramName == 'undefined' || !paramName) {
                return defaultValue;
            }
            paramName = String(paramName).trim();
            if (paramName.length == 0) {
                return defaultValue;
            }
            var result;
            try {
                result = HttpCommander.Lib.Utils.queryString(paramName);
            } catch (e) { }
            if (typeof result != 'undefined' && result != null) {
                if (paramType === 'boolean') {
                    if ((result = result.toLowerCase().trim()) === 'true') {
                        return true;
                    } else if (result === 'false') {
                        return false;
                    } else {
                        result = forceReturnFromQuery ? defaultValue : null;
                    }
                } else if (paramType === 'string') {
                    if ((result = String(result).trim()) == '') {
                        result = forceReturnFromQuery === true ? defaultValue : null;
                    }
                }
            }
            return forceReturnFromQuery === true ? result :
                (result || (htcConfig && htcConfig[paramName] ? htcConfig[paramName] : defaultValue));
        };
        var getParamBooleanValue = function (paramName) {
            return getParamValue(paramName, 'boolean', false);
        };
        var getHideTreeValue = function () {
            return getParamBooleanValue('hideTree');
        };
        var getHideDetailsPaneValue = function () {
            var de = HttpCommander.Lib.Utils.getCookie($("detailsexpanded"));
            if (!Ext.isEmpty(de) && (de == 'false' || de == 'true')) {
                return (de == 'false');
            }
            return getParamBooleanValue('hideDetailsPane');
        };
        var getTreeViewValue = function () {
            return getParamValue('TreeView', 'string', 'notautoexpandable').toLowerCase();
        };
        // --- end

        // Grid actions
        var downloadFile = function (record, path) {
            if (htcConfig.currentPerms && htcConfig.currentPerms.download) {
                var fileName = encodeURIComponent(record.data.name),
                    filePath = encodeURIComponent(path),
                    ext = HttpCommander.Lib.Utils.getFileExtension(record.data.name);
                if (ext === "swf" && htcConfig.openSWFonDownload) {
                    var suffix = HttpCommander.Lib.Utils.browserIs.ie ? ('/' + fileName) : '';
                    window.open(htcConfig.relativePath +
                        "Handlers/Download.ashx" + suffix + "?action=download&file="
                            + filePath + "/" + fileName,
                                "_blank");
                } else {
                    window.location.href = htcConfig.relativePath +
                        "Handlers/Download.ashx?action=download&file="
                            + filePath + "/" + fileName;
                }
                if (htcConfig.enableRecents) {
                    setTimeout(openTreeRecent, 1000);
                }
            }
        };
        var linkToFile = function (record, path) { // non-anonymous link to file
            return linkToFileByVirtPath(virtualFilePath(record, path));
        };
        var linkToFileByName = function (fileName, folderPath) { // non-anonymous link to file
            return linkToFileByVirtPath(folderPath + "/" + fileName);
        };
        var linkToFolderByName = function (folderName, folderPath) {
            return linkToOpenFolderByVirtPath(folderPath + "/" + folderName);
        };
        var linkToFileByVirtPath = function (virtpath) {
            var suffix = '';
            if (virtpath) {
                var vpParts = virtpath.split('/');
                var fName = vpParts[vpParts.length - 1];
                var ext = HttpCommander.Lib.Utils.getFileExtension(fName);
                if (ext === "swf" && htcConfig.openSWFonDownload && HttpCommander.Lib.Utils.browserIs.ie)
                    suffix = '/' + encodeURIComponent(fName);
            }
            return appRootUrl
                + "Handlers/Download.ashx" + suffix
                    + "?file=" + encodeURIComponent(virtpath) + '&action=download';
        };
        var linkToOpenFolderByVirtPath = function (virtPath) {
            return appRootUrl + "Default.aspx?folder=" + encodeURIComponent(virtPath);
        };
        var linkToSelectFileByVirtPath = function (virtPath) {
            return appRootUrl + "Default.aspx?file=" + encodeURIComponent(virtPath);
        };
        var virtualFilePath = function (record, path) {
            if (record)
                return path + "/" + record.data.name;
            else
                return path;
        };
        var viewFile = function (record, path) {
            var encName = encodeURIComponent(record.data.name),
                dt = Ext.isDate(record.data.datemodified) ? record.data.datemodified.getTime() : (new Date()).getTime(),
                url = htcConfig.relativePath
                    + "Handlers/Download.ashx/" + encName + "?action=view&file="
                    + encodeURIComponent(path) + "/" + encName
                    + '&date=' + dt;
            var viewWin = window.open(url, 'viewinbpopup' + (new Date()).getTime(),
                HttpCommander.Lib.Utils.getPopupProps());
            if (!viewWin) {
                window.alert(htcConfig.locData.ViewPopupBlocked);
            } else {
                try { viewWin.focus(); }
                catch (e) { }
                if (htcConfig.enableRecents) {
                    setTimeout(openTreeRecent, 1000);
                }
            }
        };
        var openShortcut = function (path, name, refreshLastFolder) {
            globalLoadMask.msg = htcConfig.locData.OpeningShortcutProgress + '...';
            globalLoadMask.show();
            HttpCommander.Common.OpenShortcut({ path: path, name: name }, function (data, trans) {
                globalLoadMask.hide();
                globalLoadMask.msg = htcConfig.locData.ProgressLoading + '...';
                if (typeof data == 'undefined') {
                    Msg.alert(htcConfig.locData.CommonErrorCaption, Ext.util.Format.htmlEncode(trans.message));
                    if (refreshLastFolder === true)
                        openGridFolder(getCurrentFolder());
                    return;
                }
                if (!data.success) {
                    Msg.alert(htcConfig.locData.CommonErrorCaption, data.message);
                    if (refreshLastFolder === true)
                        openGridFolder(getCurrentFolder());
                    return;
                }

                // openTreeNode(data.path);
                if (!data.folder) {
                    selectPath = { name: '', path: '' };
                    selectPath.name = data.name;
                    selectPath.path = data.path;
                }
                openGridFolder(data.path, true);
            });
        };
        var editOrViewPublicLinks = function (index) {
            var record = grid.getStore().getAt(index),
                curFolder = getCurrentFolder(),
                newPath;
            if (record && (record.data.rowtype == "folder" || record.data.rowtype == "file")) {
                newPath = pathAppendFolder(curFolder, record.data.name);
                if (record.data.publiclinks == 1) {
                    globalLoadMask.msg = htcConfig.locData.ProgressGettingAnonymLinks + "...";
                    globalLoadMask.show();
                    HttpCommander.Common.GetAnonymLink({ path: newPath }, function (data, trans) {
                        globalLoadMask.hide();
                        globalLoadMask.msg = htcConfig.locData.ProgressLoading + "...";
                        if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Msg, htcConfig)) {
                            if (data.link) {
                                var row = data.link,
                                    isFolder = row["isfolder"],
                                    p = row["acl"],
                                    hp = row["perms"],
                                    anonPerm = {
                                        download: { checked: p && (p & 2) != 0 && (!isFolder || (p & 1) != 0) },
                                        upload: { checked: isFolder && p && (p & 4) != 0 },
                                        view: { checked: isFolder && p && (p & 1) != 0 },
                                        zip: { checked: isFolder && p && (p & 8) != 0 }
                                    },
                                    onlyZip = anonPerm.zip.checked && !anonPerm.upload.checked && !anonPerm.view.checked;

                                anonPerm.download["disabled"] = !isFolder || onlyZip || !(hp && hp.download && hp.anonymDownload);
                                anonPerm.upload["disabled"] = !isFolder || onlyZip || !(hp && hp.upload && hp.anonymUpload);
                                anonPerm.view["disabled"] = !isFolder || onlyZip || !(hp && (hp.listFiles || hp.listFolders) && hp.anonymViewContent);
                                anonPerm.zip["disabled"] = !isFolder || !(hp && hp.zipDownload && hp.anonymDownload);
                                anonPerm.modify = hp && hp.modify;
                                if (anonPerm.download["disabled"])
                                    anonPerm.download["checked"] = false;
                                if (anonPerm.upload["disabled"])
                                    anonPerm.upload["checked"] = false;
                                if (anonPerm.view["disabled"])
                                    anonPerm.view["checked"] = false;
                                if (anonPerm.zip["disabled"])
                                    anonPerm.zip["checked"] = false;

                                try {
                                    row['date'] = new Date(row['date'] * 1000);
                                    row['expires'] = new Date(row['expires'] * 1000);
                                } catch (err) {
                                    // ignore
                                }

                                prepareAndShowMakePublicLinkWindow(
                                    newPath,
                                    isFolder,
                                    anonPerm,
                                    row,
                                    true
                                );
                            }
                        }
                    });
                } else if (record.data.publiclinks > 1) {
                    initAndShowViewLinksWindow(newPath, true);
                }
            }
        };
        var sharedGridRowAction = function (index, e) {
            if (sharedGrid) {
                var record = sharedGrid.getStore().getAt(index);
                if (record && record.data.rowtype == 'uplink') {
                    openGridFolder('root', true);
                }
            }
        };
        var sharedFYGridRowAction = function (index, e) {
            if (sharedFYGrid) {
                var record = sharedFYGrid.getStore().getAt(index);
                if (record && record.data.rowtype == 'uplink') {
                    openGridFolder('root', true);
                }
            }
        };
        var gridRowAction = function (index, e) {
            grid.needReloadTree = null;
            var record = grid.getStore().getAt(index),
                curFolder = getCurrentFolder(),
                newPath, isRcnt = false, isTrh = false,
                isShr = false, isAlerts = false, isShrFY = false;
            if (record.data.srowtype == 'alert') {
                initAndShowChangesWatchWindow({
                    id: record.data.watchForModifs.id,
                    emails: record.data.watchForModifs.emails,
                    path: record.data.name,
                    is_folder: record.data.rowtype != 'file',
                    iown: (record.data.watchForModifs.iown === true),
                    users: record.data.watchForModifs.users,
                    actions: record.data.watchForModifs.actions
                });
            } else if (record.data.rowtype == "folder"
                || record.data.rowtype == "rootfolder"
                || (isTrh = (record.data.rowtype == "trashroot"))
                || (isRcnt = (record.data.rowtype == "recentroot"))
                || (isShr = (record.data.rowtype == 'sharedroot'))
                || (isShrFY = (record.data.rowtype == 'sharedforyouroot'))
                || (isAlerts = (record.data.rowtype == 'alertsroot'))) {
                newPath = (isRcnt || isTrh || isShr || isAlerts || isShrFY) ? record.data.path
                    : (record.data.srowtype == "recentgroup")
                        ? pathAppendFolder(curFolder, ('' + record.data.recentgroup))
                        : pathAppendFolder(curFolder, record.data.name);
                if (isRecentFolder(curFolder)) {
                    isRcnt = true;
                    newPath = pathAppendFolder(record.data.path, (record.data.srowtype == "recentgroup") ? ('' + record.data.recentgroup) : record.data.name);
                }
                openGridFolder(newPath, true, isRcnt || isTrh || isAlerts);
            } else if (record.data.rowtype == "uplink") {
                openUpLink(curFolder);
            } else if (record.data.rowtype == "file") {
                var ext = HttpCommander.Lib.Utils.getFileExtension(record.data.name),
                    _ext_ = ';' + ext + ';';
                if (record.data.srowtype == 'recent') {
                    newPath = record.data.path;
                    selectPath = {};
                    selectPath.name = record.data.name;
                    selectPath.path = record.data.path;
                    selectPath.recent = true;
                    openGridFolder(newPath, true, true);
                } else if (ext == 'lnk') {
                    openShortcut(curFolder, record.data.name);
                } else if (ext == 'url' || (htcConfig.googleDriveFileTypes && htcConfig.googleDriveFileTypes.indexOf(_ext_) >= 0)) {
                    menuActions.viewInService('shortcut');
                } else {
                    var dca = 'showmenu';
                    if (htcConfig.doubleClickAction)
                        dca = htcConfig.doubleClickAction;
                    switch (dca) {
                        case 'download':
                            if (htcConfig.currentPerms && htcConfig.currentPerms.download)
                                downloadFile(record, curFolder);
                            break;
                        case 'showmenu':
                            var selModel = grid.getSelectionModel();
                            if (!selModel.isSelected(index))
                                selModel.selectRow(index, false);
                            if (fileMenu) {
                                if (e.getXY) {
                                    fileMenu.showAt(e.getXY());
                                } else {
                                    var firstCell = grid.getView().getCell(index, 0);
                                    if (firstCell) {
                                        var pos = HttpCommander.Lib.Utils.offsetPosition(firstCell);
                                        pos[0] += firstCell.offsetWidth / 2;
                                        pos[1] += firstCell.offsetHeight / 2;
                                        fileMenu.showAt(pos);
                                    }
                                }
                            }
                            break;
                        case 'view':
                            var viewAllowed = htcConfig.currentPerms && htcConfig.currentPerms.download;
                            if (viewAllowed) {
                                viewAllowed = HttpCommander.Lib.Utils.isAllowedForViewingInBrowser(record.data.name, htcConfig);
                                if (viewAllowed) {
                                    viewFile(record, curFolder);
                                } else {
                                    downloadFile(record, curFolder);
                                }
                            }
                            break;
                    }
                }
            }
        };
        // returns true if an item with specified name exists in grid
        var gridItemExists = function (name) {
            var ind = grid.getStore().findBy(
                function (rec, id) {
                    return rec.get("name").toLowerCase() == name.toLowerCase();
                }
            );
            return ind != -1;
        }

        // Check permission
        var isExtensionAllowed = function (fileName, forCreate) {
            if (!htcConfig.currentPerms)
                return false;
            if (forCreate == null || forCreate == undefined)
                forCreate = true;
            var cr = forCreate ? htcConfig.currentPerms.createRestriction : htcConfig.currentPerms.listRestriction;
            var ext = /\.\w+$/i.exec(fileName);
            if (!ext) ext = '';
            else ext = ext[0].substring(1).toUpperCase();
            return (cr.type == 1 && cr.extensions.indexOf(ext) == -1) || (cr.type == 0 && cr.extensions.indexOf(ext) >= 0);
        };
        var getRestrictionMessage = function (forCreate) {
            if (!htcConfig.currentPerms)
                return '';
            if (forCreate == null || forCreate == undefined)
                forCreate = true;
            var cr = forCreate ? htcConfig.currentPerms.createRestriction : htcConfig.currentPerms.listRestriction;
            var exts = '';
            Ext.each(cr.extensions, function (ext) {
                if (exts.length > 0)
                    exts += ' ';
                exts += ext;
            });
            if (cr.type == 0)
                return String.format(htcConfig.locData.ClientPermissionsAllowTypes, exts);
            else
                return String.format(htcConfig.locData.ClientPermissionsDenyTypes, exts);
        };
        var isModifyAllowed = function () {
            if (!htcConfig.currentPerms) return false;
            return htcConfig.currentPerms.modify;
        };

        // Drag'n Drop (tree|grid <-> grid|tree)
        var dragDropPermission = function (nodeFrom, nodeTo) {
            var move = copy = create = zip = del = shareFile = shareFolder = false;
            if (nodeFrom) {
                try {
                    var nodeFromPerms = eval("(" + nodeFrom.attributes.permissions + ")");
                    if (nodeFromPerms) {
                        move = nodeFromPerms.cut;
                        copy = nodeFromPerms.copy;
                        del = nodeFromPerms.del && htcConfig.enableTrash;
                        shareFolder = (htcConfig.sharedInTree &&
                            htcConfig.enablePublicLinkToFolder &&
                            (
                                (
                                    (nodeFromPerms.download || nodeFromPerms.zipDownload) &&
                                    nodeFromPerms.anonymDownload
                                )
                                ||
                                (nodeFromPerms.upload && nodeFromPerms.anonymUpload)
                                ||
                                (
                                    (nodeFromPerms.listFiles || nodeFromPerms.listFolders) &&
                                    nodeFromPerms.anonymViewContent
                                )
                            )
                        );
                    }
                } catch (e) { }
            } else if (htcConfig.currentPerms) {
                var cps = htcConfig.currentPerms;
                move = cps.cut;
                copy = cps.copy;
                del = cps.del && htcConfig.enableTrash;
                shareFile = (htcConfig.sharedInTree &&
                    htcConfig.enablePublicLinkToFile &&
                    cps.download &&
                    cps.anonymDownload);
                shareFolder = (htcConfig.sharedInTree &&
                    htcConfig.enablePublicLinkToFolder &&
                    (
                        (
                            (cps.download || cps.zipDownload) &&
                            cps.anonymDownload
                        )
                        ||
                        (cps.upload && cps.anonymUpload)
                        ||
                        (
                            (cps.listFiles || cps.listFolders) &&
                            cps.anonymViewContent
                        )
                    )
                );
            }
            if (nodeTo) {
                if (Ext.isObject(nodeTo.data)) {
                    create = htcConfig.currentPerms && htcConfig.currentPerms.create;
                    zip = htcConfig.currentPerms && htcConfig.currentPerms.zip;
                    if (del) {
                        del = isTrashFolder(nodeTo.data.path);
                    }
                    if (!isSharedTreeFolder(nodeTo.data.path)) {
                        shareFile = false;
                        shareFolder = false;
                    }
                } else if (Ext.isObject(nodeTo.attributes)) {
                    try {
                        var nodeToPerms = eval("(" + nodeTo.attributes.permissions + ")");
                        if (nodeToPerms) {
                            create = nodeToPerms.create;
                        }
                    } catch (e) { }
                    if (del) {
                        del = isTrashFolder(nodeTo.attributes.path);
                    }
                    if (!isSharedTreeFolder(nodeTo.attributes.path)) {
                        shareFile = false;
                        shareFolder = false;
                    }
                }
            } else {
                shareFile = false;
                shareFolder = false;
                if (htcConfig.currentPerms) {
                    create = htcConfig.currentPerms.create;
                    zip = htcConfig.currentPerms.zip;
                } else if (del) {
                    del = isTrashFolder();
                }
            }
            return {
                allow: (create && (move || copy)) || del || shareFile || shareFolder || zip,
                create: create,
                move: move,
                copy: copy,
                moveOrCopy: move || copy,
                onlyMoveOrCopy: (move && !copy) || (copy && !move),
                zip: zip,// && copy,
                dnd: create && (move || copy),
                del: del,
                shareFile: shareFile,
                shareFolder: shareFolder,
                share: (shareFile || shareFolder)
            };
        };
        var getSelectedFiles = function () {
            var grd = grid;
            if (!grd || !grd.rendered || grd.hidden) {
                return { 'files': [], 'folders': [] };
            }
            var selectedRecords = grd.getSelectionModel().getSelections();
            var fileArray = new Array();
            var folderArray = new Array();
            Ext.each(selectedRecords, function (el) {
                if (el.data.rowtype == "file") {
                    fileArray.push(el.data.name);
                } else if (el.data.rowtype == "folder") {
                    folderArray.push(el.data.name);
                }
            });
            return { 'files': fileArray, 'folders': folderArray };
        };
        var createSelectedSet = function (grd, curFolder, forceClearTrash) {
            if (forceClearTrash === true) {
                return {
                    'path': _TRASH_,
                    'files': null,
                    'folders': null,
                    'filesCount': -1,
                    'foldersCount': -1
                };
            }
            grd = grd || grid;
            var selectedRecords = grid.getSelectionModel().getSelections();
            var fileArray = new Array();
            var folderArray = new Array();
            var isRecent = isRecentFolder(curFolder);
            var isTrash = isTrashFolder(curFolder);
            Ext.each(selectedRecords, function (el) {
                var name = isRecent ? el.data.path : isTrash ? el.data.trashname : el.data.name;
                if (isRecent) {
                    if (Ext.isEmpty(name)) {
                        name = el.data.name;
                    } else if (!Ext.isEmpty(el.data.name)) {
                        name += '/' + el.data.name;
                    }
                }
                if (el.data.rowtype == "folder")
                    folderArray.push(name);
                else if (el.data.rowtype == "file")
                    fileArray.push(name);
            });
            var selectedSet = {};
            selectedSet["path"] = curFolder;
            selectedSet["files"] = eval(Ext.util.JSON.encode(fileArray));
            selectedSet["folders"] = eval(Ext.util.JSON.encode(folderArray));
            selectedSet["filesCount"] = fileArray.length;
            selectedSet["foldersCount"] = folderArray.length;
            return selectedSet;
        };
        var createDraggedSet = function (selectedRecords, curFolder, moveToTrash) {
            moveToTrash = htcConfig.enableTrash && moveToTrash;
            var fileArray = new Array();
            var folderArray = new Array();
            Ext.each(selectedRecords, function (el) {
                if (el.data.rowtype == "folder") folderArray.push(el.data.name);
                else if (el.data.rowtype == "file") fileArray.push(el.data.name);
            });
            var selectedSet = {};
            selectedSet["path"] = curFolder;
            selectedSet["files"] = eval(Ext.util.JSON.encode(fileArray));
            selectedSet["folders"] = eval(Ext.util.JSON.encode(folderArray));
            selectedSet["filesCount"] = fileArray.length;
            selectedSet["foldersCount"] = folderArray.length;
            return selectedSet;
        };
        var dropDraggedSet = function (dropTargetRow) {
            if (!clipboard.enabled)
                return;
            var isNode = false;
            var curFolder;
            if (dropTargetRow) {
                if (dropTargetRow.attributes) {
                    isNode = true;
                    curFolder = dropTargetRow.attributes.path;
                    clipboard.newPath = curFolder;
                } else if (!dropTargetRow.data || (dropTargetRow.data.rowtype != "folder" && dropTargetRow.data.rowtype != "uplink")) {
                    return;
                } else {
                    curFolder = getCurrentFolder();
                    if (dropTargetRow.data.rowtype == "folder")
                        clipboard.newPath = curFolder + "/" + dropTargetRow.data.name;
                    else if (curFolder.lastIndexOf('/') > -1)
                        clipboard.newPath = curFolder.substring(0, curFolder.lastIndexOf('/'));
                    else return;
                }
            } else {
                curFolder = getCurrentFolder();
                clipboard.newPath = curFolder;
            }
            //if (clipboard.path != clipboard.newPath)
            {
                if (asControl)
                    clipboard.control = true;
                globalLoadMask.msg = clipboard.isCut ? htcConfig.locData.ProgressMoving + "..." : htcConfig.locData.ProgressCopying + "...";
                globalLoadMask.show();
                HttpCommander.Common.Paste(clipboard, function (data, trans) {
                    globalLoadMask.hide();
                    globalLoadMask.msg = htcConfig.locData.ProgressLoading + "...";
                    if (typeof data == 'undefined') {
                        clipboard.clear();
                        Msg.alert(htcConfig.locData.CommonErrorCaption, Ext.util.Format.htmlEncode(trans.message));
                        return;
                    }
                    var tip = "";
                    if (data.filesProcessed > 0)
                        tip += String.format(clipboard.isCut ? htcConfig.locData.BalloonFilesMoved : htcConfig.locData.BalloonFilesCopied, data.filesProcessed);
                    if (data.foldersProcessed > 0) {
                        if (tip != "") tip += "<br />";
                        tip += String.format(clipboard.isCut ? htcConfig.locData.BalloonFoldersMoved : htcConfig.locData.BalloonFoldersCopied, data.foldersProcessed);
                    }
                    var filesFailed = clipboard.filesCount - data.filesProcessed;
                    if (filesFailed > 0) {
                        if (tip != "") tip += "<br />";
                        tip += String.format(htcConfig.locData.BalloonFilesFailed, filesFailed);
                    }
                    var foldersFailed = clipboard.foldersCount - data.foldersProcessed;
                    if (foldersFailed > 0) {
                        if (tip != "") tip += "<br />";
                        tip += String.format(htcConfig.locData.BalloonFoldersFailed, foldersFailed);
                    }

                    var srcPath = clipboard.srcPath;
                    if (!data.success) {
                        Msg.alert(htcConfig.locData.CommonErrorCaption, data.message);
                    } else if (data.foldersProcessed > 0 && srcPath && clipboard.isCut && data.warning !== true) {
                        reloadTreeNodeIfOpened(srcPath);
                    }
                    showBalloon(tip);
                    if (data.warning === true) {
                        showRefreshWarning();
                    } else {
                        /*
                        if (isNode || data.foldersProcessed > 0) {
                        openTreeNode(curFolder, srcPath.indexOf(curFolder) != 0);
                        }
                        */
                        var folder = getCurrentFolder();
                        if (clipboard.isCut) {
                            for (var i = 0; i < clipboard.folders.length; i++) {
                                if (srcPath && (srcPath + '/' + clipboard.folders[i]) == folder) {
                                    folder = clipboard.newPath;
                                    break;
                                }
                            }
                        }
                        if (isNode || data.foldersProcessed > 0) {
                            openGridFolder(folder, curFolder, srcPath && srcPath.indexOf(curFolder) != 0);
                        } else {
                            openGridFolder(folder);
                        }
                    }
                    clipboard.clear();
                });
            }
        };
        var dropDraggedToTrash = function (dropTargetRow, draggedSet) {
            var isNode = false;
            var curFolder;
            if (dropTargetRow) {
                if (dropTargetRow.attributes) {
                    isNode = true;
                    if (!isTrashFolder(dropTargetRow.attributes.path))
                        return;
                } else if (!dropTargetRow.data || dropTargetRow.data.rowtype != "trashroot") {
                    return;
                }
            } else if (!isTrashFolder()) {
                return;
            }
            if (!menuActions) {
                initMenuActions();
            }
            if (!!menuActions) {
                menuActions.deleteSelectedItems(false, draggedSet);
            }
        };
        var dropDraggedToZip = function (dropTargetRow) {
            if (!clipboard.enabled)
                return;
            if (!dropTargetRow || !dropTargetRow.data || HttpCommander.Lib.Utils.getFileExtension(dropTargetRow.data.name) != "zip")
                return;
            var curFolder = getCurrentFolder();
            clipboard.newPath = curFolder;
            clipboard.zipname = dropTargetRow.data.name;
            var oldAT = Ext.Ajax.timeout;
            Ext.Ajax.timeout = HttpCommander.Lib.Consts.zipRequestTimeout;
            globalLoadMask.msg = htcConfig.locData.ProgressZipping + '...';
            globalLoadMask.show();
            HttpCommander.Common.AppendToZip(clipboard, function (data, trans) {
                Ext.Ajax.timeout = oldAT;
                globalLoadMask.hide();
                globalLoadMask.msg = htcConfig.locData.ProgressLoading + '...';
                if (typeof data == 'undefined') {
                    Msg.alert(htcConfig.locData.CommonErrorCaption, Ext.util.Format.htmlEncode(trans.message));
                    return;
                }
                var tip = '';
                if (typeof data.filesZipped == 'undefined')
                    data.filesZipped = 0;
                if (typeof data.foldersZipped == 'undefined')
                    data.foldersZipped = 0;
                if (data.filesAdded > 0)
                    tip += String.format(htcConfig.locData.BalloonFilesZipped, data.filesAdded);
                if (data.foldersAdded > 0) {
                    if (tip != '')
                        tip += '<br />';
                    tip += String.format(htcConfig.locData.BalloonFoldersZipped, data.foldersAdded);
                }
                var filesFailed = clipboard.filesCount - data.filesAdded;
                if (filesFailed > 0) {
                    if (tip != '')
                        tip += '<br />';
                    tip += String.format(htcConfig.locData.BalloonFilesFailed, filesFailed);
                }
                var foldersFailed = clipboard.foldersCount - data.foldersAdded;
                if (foldersFailed > 0) {
                    if (tip != '')
                        tip += '<br />';
                    tip += String.format(htcConfig.locData.BalloonFoldersFailed, foldersFailed);
                }
                showBalloon(tip);
                if (!data.success)
                    Msg.alert(htcConfig.locData.CommonErrorCaption, data.msg);
                if (!Ext.isEmpty(data.zipname) && !Ext.isEmpty(data.zippath)) {
                    selectPath = {};
                    selectPath.name = data.zipname;
                    selectPath.path = data.zippath;
                }
                clipboard.clear();
                openGridFolder(Ext.isEmpty(data.zippath) ? curFolder : data.zippath);
            });
        };
        var dropDraggedForShare = function (selectedRecord, srcPath, perms) {
            var virtPath = !Ext.isEmpty(srcPath) ? virtualFilePath(selectedRecord, srcPath) : selectedRecord.data.name;
            var isFolder = selectedRecord.data.rowtype == 'folder';
            var anonPerm = {
                download: {},
                upload: { checked: isFolder && (perms && perms.upload && perms.anonymUpload) },
                view: { checked: isFolder && (perms && (perms.listFiles || perms.listFolders) && perms.anonymViewContent) },
                zip: { checked: isFolder ? (perms && perms.zipDownload && perms.anonymDownload) : false }
            };
            anonPerm.download["checked"] = isFolder ? (anonPerm.view.checked && perms && perms.download && perms.anonymDownload) : true;
            anonPerm.download["disabled"] = !isFolder || !anonPerm.download.checked;
            anonPerm.upload["disabled"] = !isFolder || !anonPerm.upload.checked;
            anonPerm.view["disabled"] = !isFolder || !anonPerm.view.checked;
            anonPerm.zip["disabled"] = !isFolder || !anonPerm.zip.checked;
            anonPerm.modify = perms && perms.modify;
            anonPerm.upload.checked = false;
            prepareAndShowMakePublicLinkWindow(virtPath, isFolder, anonPerm);
        };

        var initOfficeEditor = function () {
            if (!officeEditor) {
                officeEditor = HttpCommander.Lib.OfficeEditor({
                    'htcConfig': htcConfig,
                    'Window': Window,
                    'Msg': Msg,
                    'getUid': function () { return uid; },
                    'getAppRootUrl': function () { return appRootUrl; },
                    '$': $,
                    'ProcessScriptError': ProcessScriptError,
                    'getOfficeTypeDetected': function () { return officeTypeDetected; },
                    'setOfficeTypeDetected': function (v) { officeTypeDetected = v; },
                    'getFileManagerInstance': function () { return fm; },
                    'showBalloon': showBalloon
                });
            }
            return officeEditor;
        };

        var openInMsoOldWay = function () {
            var officeEditor = initOfficeEditor();
            menuActions.editInMsoOoo(true, officeEditor.OpenFile);
        };

        var openInMsoNewWay = function (fileUrl) {
            var row = getSelTypeFilesModel(grid)['selModel'].getSelected(),
                rowData = row ? row.data : {},
                scheme = HttpCommander.Lib.Utils.getMSOfficeUriScheme(rowData.name),
                url, editOrViewFlag;
            if (scheme) {
                if (HttpCommander.Lib.Utils.browserIs.mac) {
                    fileUrl = fileUrl.replace(/%23/g, "%2523");
                    if (scheme == 'ms-word') {
                        fileUrl = fileUrl.replace(/#/g, "%23").replace(/%/g, "%25");
                    }
                } else {
                    fileUrl = fileUrl.replace(/%/g, "%25").replace(/#/g, "%23");
                }

                if ((!htcConfig.currentPerms || !htcConfig.currentPerms.modify) && !htcConfig.anonymousEditingOffice) {
                    editOrViewFlag = 'v';
                } else {
                    editOrViewFlag = 'e';
                }

                url = scheme + ':of' + editOrViewFlag + encodeURIComponent('|u|') + fileUrl;

                if (HttpCommander.Lib.Utils.browserIs.chrome && HttpCommander.Lib.Utils.browserIs.mac) {
                    url = url.split(" ").join("%20");
                }

                HttpCommander.Lib.Utils.launchCustomProtocol(url, function (result) {
                    if (!result) {
                        openInMsoOldWay();
                    }
                });
            } else {
                openInMsoOldWay();
            }
        };

        var showUploadWindow = function (tabId) {
            if (!uploadWindow)
                initUploaders();
            uploadWindow.setActiveUpload(tabId);
            uploadWindow.show();
        }

        // Init main drop zone if EnableDnDUploader
        var initMainDropZone = function () {
            if (enableDnDUploader !== true)
                return;
            if (!dndZone) {
                dndZone = new HttpCommander.Lib.DragAndDropZone({
                    'htcConfig': htcConfig,
                    'getExtEl': function () { return extEl; },
                    'getDragAndDropFormPanel': function () {
                        return uploadWindow
                            ? uploadWindow.getDragAndDropFormPanel()
                            : null;
                    },
                    'ProcessScriptError': ProcessScriptError,
                    'getView': function () { return view; },
                    'isUploadWindowVisible': function () {
                        return !!uploadWindow && uploadWindow.rendered && !uploadWindow.hidden;
                    },
                    'getGrid': function () { return !!grid && grid.rendered && !grid.hidden ? grid : null; },
                    'getTree': function () { return !!tree && tree.rendered && !tree.hidden ? tree : null; },
                    'openGridFolder': openGridFolder,
                    'getCurrentFolder': getCurrentFolder,
                    'showUploadWindow': function () {
                        showUploadWindow('dnd-upload-tab');
                    }
                });
                // attach to root extEl and to upload window if initialized
                dndZone.addDnDEvents();
            }
        };

        // Init allowed uploaders and upload window
        var initUploaders = function (show) {
            show = (show === true);
            if (uploadWindow && show && uploadWindow.show) {
                uploadWindow.show();
                return;
            }
            try {
                uploadWindow = HttpCommander.Lib.UploadWindow({
                    'htcConfig': htcConfig,
                    'Msg': Msg,
                    'Window': Window,
                    'getEnableMultipleUploader': function () { return enableMultipleUploader; },
                    'getRenderers': function () { return renderers; },
                    'getAllowSetFileNameAtSimpleUpload': function () { return allowSetFileNameAtSimpleUpload; },
                    '$': $,
                    'getAppRootUrl': function () { return appRootUrl; },
                    'getUid': function () { return uid; },
                    'getCurrentFolder': getCurrentFolder,
                    'gridItemExists': gridItemExists,
                    'isModifyAllowed': isModifyAllowed,
                    'openGridFolder': openGridFolder,
                    'showBalloon': showBalloon,
                    'getExtEl': function () { return extEl; },
                    'ProcessScriptError': ProcessScriptError,
                    'getEnableDnDUploader': function () { return enableDnDUploader; },
                    'getDnDZone': function () { return dndZone; },
                    'globalLoadMask': globalLoadMask,
                    'getCurrentSelectedSet': function () { return createSelectedSet(grid, getCurrentFolder()); },
                    'openTreeNode': openTreeNode,
                    'getFileManagerInstance': function () { return fm; },
                    'getGoogleDriveAuth': function () { return googleDriveAuth; },
                    'getSkyDriveAuth': function () { return skyDriveAuth; },
                    'getDropboxAuth': function () { return dropboxAuth; },
                    'getBoxAuth': function () { return boxAuth; },
                    'isDemoMode': function () { return isDemoMode; },
                    'openTreeRecent': openTreeRecent
                });
                uploadWindow.registerJavascriptEventsForUploaders(fm);
                if (show) {
                    uploadWindow.activateiOSTabIfExists();
                    uploadWindow.show();
                }
            } catch (e) {
                ProcessScriptError(e);
            }
        };

        // Images preview objects
        var initImagesViewer = function () {
            if (imageViewerWindow)
                return imageViewerWindow;
            try {
                imageViewerWindow = HttpCommander.Lib.ImageViewerWindow({
                    'htcConfig': htcConfig,
                    'Msg': Msg,
                    'Window': Window,
                    'globalLoadMask': globalLoadMask,
                    'getUid': function () { return uid; },
                    '$': $,
                    'getMaxWidthThumb': function () { return maxWidthThumb; },
                    'getMaxHeightThumb': function () { return maxHeightThumb; },
                    'getCurrentFolder': getCurrentFolder,
                    'getView': function () { return view; },
                    'getFileManager': function () { return fm; },
                    'ProcessScriptError': ProcessScriptError,
                    'getThumbnailTpl': function () { return thumbnailTpl; },
                    'openTreeRecent': openTreeRecent
                }).render(extEl);
            } catch (e) {
                ProcessScriptError(e);
                return null;
            }
            return imageViewerWindow;
        };

        // Flash preview objects
        var initFlashViewer = function () {
            if (flashViewerWindow)
                return flashViewerWindow;
            try {
                flashViewerWindow = HttpCommander.Lib.FlashViewerWindow({
                    'htcConfig': htcConfig,
                    'Window': Window,
                    'Msg': Msg,
                    'getUid': function () { return uid; },
                    '$': $,
                    'getAppRootUrl': function () { return appRootUrl; },
                    'getIsEmbeddedtoIFRAME': function () { return isEmbeddedtoIFRAME; },
                    'globalLoadMask': globalLoadMask,
                    'openTreeRecent': openTreeRecent
                });
            } catch (e) {
                ProcessScriptError(e);
                return null;
            }
            return flashViewerWindow;
        };

        // Init download to Box objects
        var downloadToBox = function () {
            if (!htcConfig.enableDownloadToBox || !htcConfig.isAllowedBox)
                return;
            try {
                if (!downloadToBoxWindow) {
                    downloadToBoxWindow = HttpCommander.Lib.DownloadToBoxWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'globalLoadMask': globalLoadMask,
                        'getUid': function () { return uid; },
                        'getBoxAuth': function () { return boxAuth; },
                        'isDemoMode': function () { return isDemoMode; },
                        'getCurrentSelectedSet': function () { return createSelectedSet(grid, getCurrentFolder()); }
                    });
                }
                downloadToBoxWindow.prepare();
            } catch (e) {
                ProcessScriptError(e);
            }
        };

        // Init edit in Google Drive objects
        var editInGoogle = function (waitId, documentInfo, curFolder, fileName, create, suppressDelete) {
            if (!htcConfig.enableGoogleEdit || !Ext.isObject(documentInfo)
                || Ext.isEmpty(curFolder) || Ext.isEmpty(fileName))
                return;
            try {
                if (!editInGoogleWindow) {
                    editInGoogleWindow = HttpCommander.Lib.EditorGoogleWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'globalLoadMask': globalLoadMask,
                        'getUid': function () { return uid; },
                        'getGoogleDriveAuth': function () { return googleDriveAuth; },
                        'getCurrentSelectedSet': function () { return createSelectedSet(grid, getCurrentFolder()); },
                        'getCurrentFolder': getCurrentFolder,
                        'openGridFolder': openGridFolder,
                        'showBalloon': showBalloon,
                        'isDemoMode': function () { return isDemoMode; },
                        'setSelectPath': function (v) { selectPath = v; },
                        'openTreeRecent': openTreeRecent
                    });
                }
                editInGoogleWindow.getEditedDocFromGoogle(waitId, documentInfo, curFolder, fileName, create, suppressDelete);
            } catch (e) {
                ProcessScriptError(e);
            }
        }

        // Init edit in Google Drive objects for delete document
        var deleteInGoogle = function (doc) {
            if (!htcConfig.enableGoogleEdit || !Ext.isObject(doc) || Ext.isEmpty(doc.id))
                return;
            try {
                if (!editInGoogleWindow) {
                    editInGoogleWindow = HttpCommander.Lib.EditorGoogleWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'globalLoadMask': globalLoadMask,
                        'getUid': function () { return uid; },
                        'getGoogleDriveAuth': function () { return googleDriveAuth; },
                        'getCurrentSelectedSet': function () { return createSelectedSet(grid, getCurrentFolder()); },
                        'getCurrentFolder': getCurrentFolder,
                        'openGridFolder': openGridFolder,
                        'showBalloon': showBalloon,
                        'isDemoMode': function () { return isDemoMode; },
                        'setSelectPath': function (v) { selectPath = v; },
                        'openTreeRecent': openTreeRecent
                    });
                }
                editInGoogleWindow.deleteDocFromGoogle(doc.id, doc.title);
            } catch (e) {
                ProcessScriptError(e);
            }
        }

        // Init edit in MS Office Online objects
        var editInMSOO = function (waitId, documentInfo, curFolder, fileName, create, suppressDelete) {
            if (!htcConfig.enableMSOOEdit || !Ext.isObject(documentInfo)
                || Ext.isEmpty(curFolder) || Ext.isEmpty(fileName))
                return;
            try {
                if (!editInMSOOWindow) {
                    editInMSOOWindow = HttpCommander.Lib.EditorMSOOWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'globalLoadMask': globalLoadMask,
                        'getUid': function () { return uid; },
                        'getSkyDriveAuth': function () { return skyDriveAuth; },
                        'getCurrentSelectedSet': function () { return createSelectedSet(grid, getCurrentFolder()); },
                        'getCurrentFolder': getCurrentFolder,
                        'openGridFolder': openGridFolder,
                        'showBalloon': showBalloon,
                        'isDemoMode': function () { return isDemoMode; },
                        'setSelectPath': function (v) { selectPath = v; },
                        'openTreeRecent': openTreeRecent
                    });
                }
                editInMSOOWindow.getEditedDocFromMS(waitId, documentInfo, curFolder, fileName, create, suppressDelete);
            } catch (e) {
                ProcessScriptError(e);
            }
        }

        // Init edit in MS Office Online objects for delete file in OneDrive
        var deleteInMSOO = function (documentInfo) {
            if (!htcConfig.enableMSOOEdit || !Ext.isObject(documentInfo) || Ext.isEmpty(documentInfo.id))
                return;
            try {
                if (!editInMSOOWindow) {
                    editInMSOOWindow = HttpCommander.Lib.EditorMSOOWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'globalLoadMask': globalLoadMask,
                        'getUid': function () { return uid; },
                        'getSkyDriveAuth': function () { return skyDriveAuth; },
                        'getCurrentSelectedSet': function () { return createSelectedSet(grid, getCurrentFolder()); },
                        'getCurrentFolder': getCurrentFolder,
                        'openGridFolder': openGridFolder,
                        'showBalloon': showBalloon,
                        'isDemoMode': function () { return isDemoMode; },
                        'setSelectPath': function (v) { selectPath = v; },
                        'openTreeRecent': openTreeRecent
                    });
                }
                editInMSOOWindow.deleteDocFromMS(documentInfo);
            } catch (e) {
                ProcessScriptError(e);
            }
        }

        // Init edit in Office 365 objects
        var editInOffice365 = function (waitId, documentInfo, curFolder, fileName, create, suppressDelete) {
            if (!htcConfig.enableOffice365Edit || !Ext.isObject(documentInfo)
                || Ext.isEmpty(curFolder) || Ext.isEmpty(fileName))
                return;
            try {
                if (!editInOffice365Window) {
                    editInOffice365Window = HttpCommander.Lib.Editor365Window({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'globalLoadMask': globalLoadMask,
                        'getUid': function () { return uid; },
                        'getSkyDriveAuth': function () { return skyDriveAuth; },
                        'getCurrentSelectedSet': function () { return createSelectedSet(grid, getCurrentFolder()); },
                        'getCurrentFolder': getCurrentFolder,
                        'openGridFolder': openGridFolder,
                        'showBalloon': showBalloon,
                        'isDemoMode': function () { return isDemoMode; },
                        'setSelectPath': function (v) { selectPath = v; },
                        'openTreeRecent': openTreeRecent
                    });
                }
                editInOffice365Window.getEditedDocFrom365(waitId, documentInfo, curFolder, fileName, create, suppressDelete);
            } catch (e) {
                ProcessScriptError(e);
            }
        }

        // Init edit in Office 365 objects for delete from OneDrive for Business
        var deleteInOffice365 = function (documentInfo) {
            if (!htcConfig.enableOffice365Edit || !Ext.isObject(documentInfo) || Ext.isEmpty(documentInfo.id))
                return;
            try {
                if (!editInOffice365Window) {
                    editInOffice365Window = HttpCommander.Lib.Editor365Window({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'globalLoadMask': globalLoadMask,
                        'getUid': function () { return uid; },
                        'getSkyDriveAuth': function () { return skyDriveAuth; },
                        'getCurrentSelectedSet': function () { return createSelectedSet(grid, getCurrentFolder()); },
                        'getCurrentFolder': getCurrentFolder,
                        'openGridFolder': openGridFolder,
                        'showBalloon': showBalloon,
                        'isDemoMode': function () { return isDemoMode; },
                        'setSelectPath': function (v) { selectPath = v; },
                        'openTreeRecent': openTreeRecent
                    });
                }
                editInOffice365Window.deleteDocFrom365(documentInfo);
            } catch (e) {
                ProcessScriptError(e);
            }
        }

        // Init download to Google Drive objects
        var downloadToGoogle = function () {
            if (!htcConfig.enableDownloadToGoogle || !htcConfig.isAllowedGoogleDrive)
                return;
            try {
                if (!downloadToGoogleWindow) {
                    downloadToGoogleWindow = HttpCommander.Lib.DownloadToGoogleWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'globalLoadMask': globalLoadMask,
                        'getUid': function () { return uid; },
                        'getGoogleDriveAuth': function () { return googleDriveAuth; },
                        'isDemoMode': function () { return isDemoMode; },
                        'getCurrentSelectedSet': function () { return createSelectedSet(grid, getCurrentFolder()); }
                    });
                }
                downloadToGoogleWindow.prepare(true);
            } catch (e) {
                ProcessScriptError(e);
            }
        }

        // Init download to Dropbox objects
        var downloadToDropbox = function () {
            if (!htcConfig.enableDownloadToDropbox)
                return;
            try {
                if (!downloadToDropboxWindow) {
                    downloadToDropboxWindow = new HttpCommander.Lib.DownloadToDropboxWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'globalLoadMask': globalLoadMask,
                        'getUid': function () { return uid; },
                        'isDemoMode': function () { return isDemoMode; },
                        'getDropboxAuth': function () { return dropboxAuth; },
                        'getCurrentSelectedSet': function () { return createSelectedSet(grid, getCurrentFolder()); }
                    });
                }
                downloadToDropboxWindow.prepare();
            } catch (e) {
                ProcessScriptError(e);
            }
        };

        // Init download to SkyDrive objects
        var downloadToSkyDrive = function () {
            if (!htcConfig.enableDownloadToSkyDrive && !htcConfig.isAllowedSkyDrive)
                return;
            try {
                if (!downloadToSkyDriveWindow) {
                    downloadToSkyDriveWindow = HttpCommander.Lib.DownloadToSkyDriveWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'globalLoadMask': globalLoadMask,
                        'getUid': function () { return uid; },
                        'isDemoMode': function () { return isDemoMode; },
                        'getCurrentSelectedSet': function () { return createSelectedSet(grid, getCurrentFolder()); },
                        'getSkyDriveAuth': function () { return skyDriveAuth; },
                        'isDemoMode': function () { return isDemoMode; }
                    });
                }
                var personalOneDrive = typeof (htcConfig.liveConnectID) != 'undefined'
                    && htcConfig.liveConnectID != null && String(htcConfig.liveConnectID).length > 0;
                var businessOneDrive = typeof (htcConfig.oneDriveForBusinessAuthUrl) != 'undefined'
                    && htcConfig.oneDriveForBusinessAuthUrl != null && String(htcConfig.oneDriveForBusinessAuthUrl).length > 0;
                var business = businessOneDrive && !personalOneDrive;
                if (!business)
                    business = personalOneDrive && !businessOneDrive ? false : undefined;
                downloadToSkyDriveWindow.main(false, business);
            } catch (e) {
                ProcessScriptError(e);
            }
        };

        // Init non-anonymous link to file/folder objects
        var prepareAndShowLinkToFileFolderWindow = function (virtPath, isFolder) {
            if (!linkToFileFolderWindow) {
                try {
                    linkToFileFolderWindow = HttpCommander.Lib.LinkToFileFolderWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'linkToOpenFolderByVirtPath': linkToOpenFolderByVirtPath,
                        'linkToFileByVirtPath': linkToFileByVirtPath,
                        'linkToSelectFileByVirtPath': linkToSelectFileByVirtPath,
                        'showBalloon': showBalloon
                    });
                } catch (e) {
                    ProcessScriptError(e);
                    return;
                }
            }

            linkToFileFolderWindow.hide();
            linkToFileFolderWindow.virtPath = virtPath;
            linkToFileFolderWindow.isFolder = isFolder;
            linkToFileFolderWindow.show();
        };

        // Init and show editor of anonymous links
        var initAndShowViewLinksWindow = function (linkPath, forceShowModal) {
            if (!(forceShowModal === true) && htcConfig.sharedInTree && cardSwitchGrid && sharedGrid) {
                openSharedByLink();
                return;
            }

            if (!viewLinksWindow) {
                try {
                    viewLinksWindow = HttpCommander.Lib.ViewLinksWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'globalLoadMask': globalLoadMask,
                        'getIsEmbeddedtoIFRAME': function () { return isEmbeddedtoIFRAME; },
                        'getEmbedded': function () { return embedded; },
                        'prepareAndShowMakePublicLinkWindow': prepareAndShowMakePublicLinkWindow,
                        'renderers': renderers,
                        'openGridFolder': openGridFolder,
                        'getCurrentFolder': getCurrentFolder
                    });
                } catch (e) {
                    ProcessScriptError(e);
                    return;
                }
            }
            if (!(linkPath === true)) {
                if (typeof linkPath != 'undefined' && (linkPath = String(linkPath)).length > 0) {
                    viewLinksWindow.linkPath = linkPath;
                    viewLinksWindow.oldLinkPath = linkPath;
                } else {
                    viewLinksWindow.linkPath = null;
                    viewLinksWindow.oldLinkPath = null;
                }
            }
            viewLinksWindow.hide();
            viewLinksWindow.show();
            viewLinksWindow.items.items[0].getStore().load();
        };

        // Init anonymous links to file/folder objects
        var prepareAndShowMakePublicLinkWindow = function (virtPath, isFolder, anonPerm, linkForEdit, fromGrid, fromSharedGrid) {
            if (!makePublicLinkWindow) {
                try {
                    makePublicLinkWindow = HttpCommander.Lib.CreatePublicLinkWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'getUid': function () { return uid; },
                        '$': $,
                        'globalLoadMask': globalLoadMask,
                        'initAndShowViewLinksWindow': initAndShowViewLinksWindow,
                        'hideViewLinksWindow': function () {
                            if (viewLinksWindow)
                                viewLinksWindow.hide();
                        },
                        'initSendEmail': initSendEmail,
                        'openGridFolder': openGridFolder,
                        'showHelpWindow': showHelpWindow,
                        'setSelectPath': function (v) { selectPath = v; },
                        'openSharedByLink': openSharedByLink,
                        'getCurrentFolder': getCurrentFolder,
                        'showBalloon': showBalloon
                    });
                } catch (e) {
                    ProcessScriptError(e);
                    return;
                }
            }

            makePublicLinkWindow.hide();
            makePublicLinkWindow.virtPath = virtPath;
            makePublicLinkWindow.isFolder = isFolder;
            makePublicLinkWindow.anonPerm = anonPerm;
            makePublicLinkWindow.linkForEdit = Ext.isObject(linkForEdit) && Ext.isNumber(linkForEdit['id'])
                ? linkForEdit : null;
            makePublicLinkWindow.fromGrid = fromGrid;
            makePublicLinkWindow.fromSharedGrid = fromSharedGrid;
            makePublicLinkWindow.show();
        };

        // Init watched modifications
        var initAndShowChangesWatchWindow = function (pathInfo) {
            if (!(htcConfig.watchForModifs === true) || !pathInfo || Ext.isEmpty(pathInfo.path)) {
                return;
            }
            if (!changesWatchWindow) {
                try {
                    changesWatchWindow = HttpCommander.Lib.ChangesWatchWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'getUid': function () { return uid; },
                        '$': $,
                        'globalLoadMask': globalLoadMask,
                        'openGridFolder': openGridFolder,
                        'showHelpWindow': showHelpWindow,
                        'setSelectPath': function (v) { selectPath = v; },
                        'getCurrentFolder': getCurrentFolder,
                        'openGridFolder': openGridFolder,
                        'showBalloon': showBalloon,
                        'getMenuActions': function () { return menuActions; },
                        'getPageLimit': function () { return (pagingEnabled ? htcConfig.itemsPerPage : 0); },
                        'renderers': renderers,
                        'getIsEmbeddedtoIFRAME': function () { return isEmbeddedtoIFRAME; }
                    });
                } catch (e) {
                    ProcessScriptError(e);
                    return;
                }
            }

            changesWatchWindow.hide();
            changesWatchWindow.pathInfo = pathInfo;
            changesWatchWindow.show();
        };

        // Init watch for modifications window
        var initAndShowWatchModifsWindow = function (pathInfo, viewWindow) {
            if (!(htcConfig.watchForModifs === true) || !pathInfo || Ext.isEmpty(pathInfo.path)) {
                return;
            }
            if (!watchModifsWindow) {
                try {
                    watchModifsWindow = HttpCommander.Lib.WatchModificationsWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'getUid': function () { return uid; },
                        '$': $,
                        'globalLoadMask': globalLoadMask,
                        'openGridFolder': openGridFolder,
                        'showHelpWindow': showHelpWindow,
                        'setSelectPath': function (v) { selectPath = v; },
                        'getCurrentFolder': getCurrentFolder,
                        'openGridFolder': openGridFolder,
                        'showBalloon': showBalloon,
                        'openTreeAlerts': openTreeAlerts
                    });
                } catch (e) {
                    ProcessScriptError(e);
                    return;
                }
            }

            watchModifsWindow.hide();
            watchModifsWindow.pathInfo = pathInfo;
            watchModifsWindow.viewWindow = viewWindow;
            watchModifsWindow.show();
        };

        // Init web folder links objects
        var prepareAndShowlinksToWebFoldersWindow = function (root, parent, current) {
            if (!linksToWebFoldersWindow) {
                try {
                    linksToWebFoldersWindow = HttpCommander.Lib.LinksToWebFoldersWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'getIsEmbeddedtoIFRAME': function () { return isEmbeddedtoIFRAME; },
                        'getUid': function () { return uid; }
                    });
                } catch (e) {
                    ProcessScriptError(e);
                    return;
                }
            }

            if (linksToWebFoldersWindow) {
                linksToWebFoldersWindow.initialize(root, parent, current);
                linksToWebFoldersWindow.show();
            }
        };

        // Init send email objects
        var initSendEmail = function () {
            if (sendEmailWindow)
                return sendEmailWindow;

            try {
                sendEmailWindow = HttpCommander.Lib.SendEmailWindow({
                    'htcConfig': htcConfig,
                    'Msg': Msg,
                    'Window': Window,
                    'globalLoadMask': globalLoadMask,
                    'getEmbedded': function () { return embedded; },
                    'getIsEmbeddedtoIFRAME': function () { return isEmbeddedtoIFRAME; },
                    'getCurrentFolder': getCurrentFolder,
                    'getSelectedFiles': getSelectedFiles,
                    'linkToFileByName': linkToFileByName,
                    'linkToFolderByName': linkToFolderByName
                });
            } catch (e) {
                ProcessScriptError(e);
                return null;
            }
            return sendEmailWindow;
        };

        // Init version history objects
        var initVersionHistory = function (fileInfo) {
            if (htcConfig.enableVersionControl !== true)
                return null;
            if (!versionHistoryWindow) {
                try {
                    versionHistoryWindow = HttpCommander.Lib.VersionHistoryWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'globalLoadMask': globalLoadMask,
                        'getIsEmbeddedtoIFRAME': function () { return isEmbeddedtoIFRAME; },
                        'getEmbedded': function () { return embedded; },
                        'getRenderers': function () { return renderers; },
                        'openGridFolder': openGridFolder
                    });
                } catch (e) {
                    ProcessScriptError(e);
                    return null;
                }
            }
            versionHistoryWindow.fileInfo = fileInfo;
            return versionHistoryWindow;
        };

        var initCheckInWindow = function (fileInfo) {
            if (htcConfig.enableVersionControl !== true)
                return null;
            if (!checkInWindow) {
                try {
                    checkInWindow = HttpCommander.Lib.CheckInWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'globalLoadMask': globalLoadMask,
                        'getIsEmbeddedtoIFRAME': function () { return isEmbeddedtoIFRAME; },
                        'showBalloon': showBalloon,
                        'openGridFolder': openGridFolder
                    });
                } catch (e) {
                    ProcessScriptError(e);
                    return null;
                }
            }
            checkInWindow.fileInfo = fileInfo;
            return checkInWindow;
        }

        // Init and show Zip prompt window
        var initAndShowZipPromptWindow = function (zipInfo) {
            if (!zipInfo) {
                return;
            }
            if (!zipPromptWindow) {
                try {
                    zipPromptWindow = HttpCommander.Lib.ZipPromptWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'globalLoadMask': globalLoadMask,
                        'getUid': function () { return uid; },
                        'getFileManager': function () { return fm; },
                        'showBalloon': showBalloon,
                        'openGridFolder': openGridFolder,
                        'setSelectPath': function (v) { selectPath = v; },
                        'openTreeRecent': openTreeRecent
                    });
                } catch (e) {
                    ProcessScriptError(e);
                    return;
                }
            } else {
                zipPromptWindow.hide();
            }
            zipPromptWindow.initialize(zipInfo);
            zipPromptWindow.show();
            zipPromptWindow.syncSize();
            zipPromptWindow.doLayout();
        };

        // Init and show uzip prompt window
        var initAndShowUnzipPromptWindow = function (unzipInfo, flags, node, dlg) {
            if (!unzipInfo)
                return;
            flags = flags || 0;
            if (!unzipPromptWindow) {
                try {
                    unzipPromptWindow = HttpCommander.Lib.UnzipPromptWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'globalLoadMask': globalLoadMask,
                        'showBalloon': showBalloon,
                        'openTreeNode': openTreeNode,
                        'openGridFolder': openGridFolder
                    });
                } catch (e) {
                    ProcessScriptError(e);
                    return;
                }
            } else {
                unzipPromptWindow.hide();
            }
            unzipPromptWindow.initialize(unzipInfo, flags, node, dlg);
            unzipPromptWindow.show();
            unzipPromptWindow.syncSize();
            unzipPromptWindow.doLayout();
            return;
        };

        // Init zip content objects
        var initZipContent = function () {
            if (zipContentWindow)
                return zipContentWindow;

            try {
                zipContentWindow = HttpCommander.Lib.ZipContentWindow({
                    'htcConfig': htcConfig,
                    'Msg': Msg,
                    'Window': Window,
                    'getIsEmbeddedtoIFRAME': function () { return isEmbeddedtoIFRAME; },
                    'getEmbedded': function () { return embedded; },
                    'getRenderers': function () { return renderers; },
                    'getCurrentFolder': getCurrentFolder,
                    'initAndShowUnzipPromptWindow': initAndShowUnzipPromptWindow
                });
                return zipContentWindow;
            } catch (e) {
                ProcessScriptError(e);
            }

            return null;
        };

        // Init download objects
        var initDownload = function () {
            if (downloadWindow)
                return true;

            try {
                downloadWindow = HttpCommander.Lib.DownloadWindow({
                    'htcConfig': htcConfig,
                    'Msg': Msg,
                    'Window': Window,
                    '$': $,
                    'appRootUrl': appRootUrl,
                    'getUid': function () { return uid; },
                    'getFileManager': function () { return fm; },
                    'getMenuActions': function () { return menuActions; },
                    'onJavaPowDownloadInit': function () {
                        var javaPowDownload = document.getElementById($("javaPowDownload"));
                        if (downloadWindow && javaPowDownload) {
                            downloadWindow.fireEvent("bodyresize",
                                downloadWindow,
                                downloadWindow.getInnerWidth(),
                                downloadWindow.getInnerHeight()
                            );
                            javaPowDownload.reloadTree();
                        }
                    }
                });
                return true;
            } catch (e) {
                ProcessScriptError(e);
            }

            return false;
        };

        // Init metadata (details) objects
        var initMetadata = function () {
            if (metadataWindow)
                return metadataWindow;

            try {
                metadataWindow = HttpCommander.Lib.MetadataWindow({
                    'htcConfig': htcConfig,
                    'Msg': Msg,
                    'Window': Window,
                    'globalLoadMask': globalLoadMask,
                    'getIsEmbeddedtoIFRAME': function () { return isEmbeddedtoIFRAME; },
                    'getEmbedded': function () { return embedded; },
                    '$': $,
                    'getShowMetaDataInList': function () { return showMetaDataInList; },
                    'getCurrentFolder': getCurrentFolder,
                    'openGridFolder': openGridFolder,
                    'getRenderers': function () { return renderers; },
                    'isModifyAllowed': isModifyAllowed,
                    'setSelectPath': function (v) { selectPath = v; },
                    'getDetailsPane': function () { return detailsPane; },
                    'getHideDetailsPaneValue': getHideDetailsPaneValue
                });
                return metadataWindow;
            } catch (e) {
                ProcessScriptError(e);
            }

            return null;
        };

        // Edit text file objects
        var initEditTextFileWindow = function () {
            if (!editTextFileWindow) {
                try {
                    editTextFileWindow = HttpCommander.Lib.EditTextFileWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'getIsEmbeddedtoIFRAME': function () { return isEmbeddedtoIFRAME; },
                        'globalLoadMask': globalLoadMask,
                        'showBalloon': showBalloon,
                        'getCurrentFolder': getCurrentFolder,
                        'openGridFolder': openGridFolder,
                        'setSelectPath': function (v) { selectPath = v; },
                        'openTreeRecent': openTreeRecent
                    });
                } catch (e) {
                    ProcessScriptError(e);
                    return null;
                }
            }
            return editTextFileWindow;
        };

        var renderers = HttpCommander.Lib.DataRenderers({
            'getHtcConfig': function () { return htcConfig; },
            'getUid': function () { return uid; },
            'getCurrentFolder': getCurrentFolder,
            'labelsIsHided': function () {
                try {
                    var cm = grid.getColumnModel();
                    var cols = cm.getColumnsBy(function (c) {
                        return c && c.dataIndex == 'label';
                    });
                    if (Ext.isArray(cols) && cols.length > 0 && cols[0]) {
                        return cols[0].hidden;
                    }
                } catch (e) { }
                return true;
            }
        });

        // Get help URL
        var generateUrlHelp = function (anchor, withoutWebDavLink) {
            var webdavUrl = '';
            if (!(withoutWebDavLink === true) && htcConfig.enableWebFoldersLinks && htcConfig.hcAuthMode != 'shibboleth') {
                webdavUrl = '?webdav=' + encodeURIComponent((htcConfig.domainNameUrl != ''
                        ? htcConfig.domainNameUrl : appRootUrl)
                    + htcConfig.identifierWebDav + "/" + (htcConfig.anonymousEditingOffice
                        ? (htcConfig.webDavDefaultSuffix + "/") : ""));
            }
            return String.format('{0}{1}{2}{3}',
                htcConfig.relativePath,
                htcConfig.usersHelpRelUrl,
                webdavUrl,
                (anchor && anchor != '' ? ('#' + anchor) : '')
            );
        };

        // Help objects
        var showHelpWindow = function (anchor) { // Show user help window.
            if (helpInNewPage) {
                window.open(generateUrlHelp(anchor));
            } else {
                if (!userHelpWindow) {
                    try {
                        userHelpWindow = HttpCommander.Lib.UserHelpWindow({
                            'htcConfig': htcConfig,
                            'Msg': Msg,
                            'Window': Window,
                            'getAppRootUrl': function () { return appRootUrl; },
                            'getIsEmbeddedtoIFRAME': function () { return isEmbeddedtoIFRAME; },
                            'generateUrlHelp': generateUrlHelp
                        });
                    } catch (e) {
                        ProcessScriptError(e);
                        return;
                    }
                }
                userHelpWindow.initialize(anchor);
            }
        };
        fm.showHelp = showHelpWindow;

        // Init and show sync web folders help window
        var initAndShowSyncWebFoldersHelpWindow = function (urlRoot, urlParent, urlCurrent) {
            urlRoot = String(urlRoot || '');
            urlParent = String(urlParent || '');
            urlCurrent = String(urlCurrent || '');
            var url = htcConfig.relativePath + 'SyncWebFolders.html?root='
                + encodeURIComponent(urlRoot) + '&parent='
                + encodeURIComponent(urlParent) + '&current='
                + encodeURIComponent(urlCurrent);
            if (helpInNewPage) {
                window.open(url);
            } else {
                if (!syncWebFoldersHelpWindow) {
                    try {
                        syncWebFoldersHelpWindow = HttpCommander.Lib.SyncWebFoldersHelpWindow({
                            'htcConfig': htcConfig,
                            'Msg': Msg,
                            'Window': Window,
                            'getIsEmbeddedtoIFRAME': function () { return isEmbeddedtoIFRAME; }
                        });
                    } catch (e) {
                        ProcessScriptError(e);
                        return;
                    }
                }
                syncWebFoldersHelpWindow.initialize(url);
            }
        };

        // Select folder dialog as tree
        var initAndShowSelectFolder = function (path, action, zipName) {
            if (!selectFolderTree) {
                selectFolderTree = HttpCommander.Lib.FolderSelectionDialog({
                    'htcConfig': htcConfig,
                    'Msg': Msg,
                    'getRootName': function () { return _OLD_ROOT_; },
                    'Window': Window,
                    'getMenuActions': function () { return menuActions; },
                    'clipboard': clipboard,
                    'initAndShowUnzipPromptWindow': initAndShowUnzipPromptWindow,
                    'getGrid': function () { return grid; },
                    'getCurrentFolder': getCurrentFolder
                });
            }
            var title = htcConfig.locData.UploadSimpleUploadFolderButtonText + ' (';
            if (action === 'unzip') {
                title += htcConfig.locData.CommandUnzip + ' ' + htcConfig.locData.CommandUnzipToNew;
            } else if (action === 'move') {
                title += htcConfig.locData.CommandMoveTo;
            } else {
                title += htcConfig.locData.CommandCopyTo;
            }
            title += ')';
            selectFolderTree.setTitle(title);
            selectFolderTree.zipPath = null;
            selectFolderTree.zipName = null;
            selectFolderTree.action = action;
            if (!Ext.isEmpty(zipName) && !Ext.isEmpty(path)) {
                selectFolderTree.zipPath = path;
                selectFolderTree.zipName = zipName;
            }
            selectFolderTree.show();
            selectFolderTree.openTreeNode(path);
        };

        // Tree objects
        var initTree = function () {
            try {
                if (getTreeViewValue() != 'disabled') {
                    tree = HttpCommander.Lib.TreePanel({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'getIsEmbeddedtoIFRAME': function () { return isEmbeddedtoIFRAME; },
                        '$': $,
                        'globalLoadMask': globalLoadMask,
                        'openGridFolder': openGridFolder,
                        'toptbarButtons': toptbarButtons,
                        'clipboard': clipboard,
                        'dragDropPermission': dragDropPermission,
                        'createDraggedSet': createDraggedSet,
                        'dropDraggedSet': dropDraggedSet,
                        'dropDraggedToTrash': dropDraggedToTrash,
                        'getCurrentFolder': getCurrentFolder,
                        'getHideTreeValue': getHideTreeValue,
                        'getTreeViewValue': getTreeViewValue,
                        'setSelectPath': function (v) { selectPath = v; },
                        'isRecentFolder': isRecentFolder,
                        'isTrashFolder': isTrashFolder,
                        'getRenderers': function () { return renderers; },
                        'getGrid': function () { return grid; },
                        'isAlertsFolder': isAlertsFolder,
                        'isSharedTreeFolder': isSharedTreeFolder,
                        'initAndShowChangesWatchWindow': initAndShowChangesWatchWindow,
                        'openAlertsFolder': openAlertsFolder,
                        'dropDraggedForShare': dropDraggedForShare,
                        'getRootName': function () { return _OLD_ROOT_; },
                        'openTrash': openTrash,
                    });
                }
            } catch (e) {
                throw e;
            }
        };

        var createPlayVideoFlashWindow = function () {
            if (!playVideoFlashWindow) {
                try {
                    playVideoFlashWindow = HttpCommander.Lib.PlayVideoFlashWindow({
                        '$': $,
                        'htcConfig': htcConfig,
                        'appRootUrl': appRootUrl,
                        'Window': Window,
                        'openTreeRecent': openTreeRecent
                    });
                } catch (e) {
                    ProcessScriptError(e);
                    return null;
                }
            }
            return playVideoFlashWindow;
        };

        var createPlayVideoHtml5Window = function () {
            if (!playVideoHtml5Window) {
                try {
                    playVideoHtml5Window = HttpCommander.Lib.PlayVideoHtml5Window({
                        'htcConfig': htcConfig,
                        'globalLoadMask': globalLoadMask,
                        'Msg': Msg,
                        'Window': Window,
                        'openTreeRecent': openTreeRecent
                    });
                } catch (e) {
                    ProcessScriptError(e);
                    return null;
                }
            }
            return playVideoHtml5Window;
        }

        var createPlayVideoJSWindow = function () {
            if (!playVideoJSWindow) {
                try {
                    playVideoJSWindow = HttpCommander.Lib.PlayVideoJSWindow({
                        'htcConfig': htcConfig,
                        'globalLoadMask': globalLoadMask,
                        'Msg': Msg,
                        'Window': Window,
                        'openTreeRecent': openTreeRecent
                    });
                } catch (e) {
                    ProcessScriptError(e);
                    return null;
                }
            }
            return playVideoJSWindow;
        };

        var createPlayAudioHtml5Window = function () {
            if (!playAudioHtml5Window) {
                try {
                    playAudioHtml5Window = HttpCommander.Lib.PlayAudioHtml5Window({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'openTreeRecent': openTreeRecent
                    });
                } catch (e) {
                    ProcessScriptError(e);
                    return null;
                }
            }
            return playAudioHtml5Window;
        }

        // Init and show shortcut window
        var initAndShowShortcutWindow = function (selectedRecord, curFolder) {
            var itemName = selectedRecord ? selectedRecord.data.name : '';
            if (itemName == '') {
                var pathParts = curFolder.split('/');
                itemName = pathParts.pop();
                itemPath = pathParts.join('/');
            } else
                itemPath = curFolder;

            if (!shortcutWindow) {
                try {
                    shortcutWindow = HttpCommander.Lib.ShortcutWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'globalLoadMask': globalLoadMask,
                        'getCurrentFolder': getCurrentFolder,
                        'openGridFolder': openGridFolder,
                        'setSelectPath': function (v) { selectPath = v; }
                    });
                } catch (e) {
                    ProcessScriptError(e);
                    return;
                }
            }
            shortcutWindow.hide();
            shortcutWindow.itemName = itemName;
            shortcutWindow.itemPath = itemPath;
            shortcutWindow.show();
        };

        // Init and show CloudConvert window
        var initAndShowCloudConvertWindow = function (selectedRecord, curFolder, outputFormats) {
            var itemName = selectedRecord ? selectedRecord.data.name : '';
            if (itemName == '' || !Ext.isArray(outputFormats) || outputFormats.length == 0) {
                return;
            }
            if (!cloudConvertWindow) {
                try {
                    cloudConvertWindow = HttpCommander.Lib.CloudConvertWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'showBalloon': showBalloon,
                        'getRenderers': function () { return renderers; },
                        'isExtensionAllowed': isExtensionAllowed,
                        'getIsEmbeddedtoIFRAME': function () { return isEmbeddedtoIFRAME; },
                        'globalLoadMask': globalLoadMask,
                        'getCurrentFolder': getCurrentFolder,
                        'openGridFolder': openGridFolder,
                        'setSelectPath': function (v) { selectPath = v; },
                        'openTreeRecent': openTreeRecent
                    });
                } catch (e) {
                    ProcessScriptError(e);
                    return;
                }
            }
            cloudConvertWindow.hide();
            cloudConvertWindow.itemName = itemName;
            cloudConvertWindow.itemPath = curFolder;
            cloudConvertWindow.outputFormats = outputFormats;
            cloudConvertWindow.setTitle(String.format(htcConfig.locData.CloudConvertWindowTitle,
                Ext.util.Format.htmlEncode(itemName)));
            cloudConvertWindow.show();
        };

        // Prepare and show video converter
        var createVideoConvertWindow = function () {
            if (!videoConvertWindow) {
                try {
                    videoConvertWindow = HttpCommander.Lib.VideoConvertWindow({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        'Window': Window,
                        'globalLoadMask': globalLoadMask,
                        'isFileExists': function (fileName) {
                            var fIndex = gridStore.findBy(function (rec, id) {
                                return rec.get("name").toLowerCase() == fileName.toLowerCase();
                            });
                            return fIndex >= 0;
                        },
                        'refreshCurrentFolder': function (folder) {
                            var curFolder = folder || getCurrentFolder();
                            //openTreeNode(curFolder, true);
                            openGridFolder(curFolder, true, true);
                        },
                        'setSelectPath': function (v) { selectPath = v; }
                    });
                } catch (e) {
                    ProcessScriptError(e);
                    return null;
                }
            }
            return videoConvertWindow;
        };

        /* returns config object with the following fields:
        - selType in "set", "empty", "none", "file", "folder"
        - selFiles - number of selected files
        - selFolders - number of selected folders
        - selModel = grid.getSelectionModel()
        */
        var getSelTypeFilesModel = function (gridPanel) {
            var selModel = gridPanel.getSelectionModel();
            var selType = "set";
            var selFiles = 0, selFolders = 0;
            if (getCurrentFolder() == null) {
                selType = 'empty';
            } else {
                if (selModel.getCount() == 0) {
                    selType = "none";
                } else if (selModel.getCount() == 1) {
                    selType = selModel.getSelected().data.rowtype;
                    if (selType == 'file') {
                        selFiles++;
                    } else if (selType == 'folder') {
                        selFolders++;
                    }
                } else {
                    Ext.each(selModel.selections.items, function (r) {
                        if (r.data.rowtype == 'file') {
                            selFiles++;
                        } else if (r.data.rowtype == 'folder') {
                            selFolders++;
                        }
                    });
                }
            }
            return {
                'selType': selType,
                'selFiles': selFiles,
                'selModel': selModel,
                'selFolders': selFolders
            };
        }

        var changeAccessibilityButton = function (btnName, enabled) {
            if (toptbarButtons && toptbarButtons[btnName]) {
                Ext.each(toptbarButtons[btnName], function (btn) {
                    btn.setDisabled(!enabled);
                });
            }
        };

        var toggleToolbarButtons = function () {
            for (var item in toptbarButtons) {
                if (toptbarButtons.hasOwnProperty(item)) {
                    changeAccessibilityButton(item, toptbarConfig.access(item));
                }
            }
        };

        // Init file menu
        var initMenu = function () {
            try { // main context menu
                newSubMenu = HttpCommander.Lib.NewSubMenu({
                    'htcConfig': htcConfig,
                    'getMenuActions': function () { return menuActions; },
                    'isExtensionAllowed': isExtensionAllowed,
                    'initAndShowShortcutWindow': initAndShowShortcutWindow,
                    'getSelTypeFilesModel': getSelTypeFilesModel,
                    'getGrid': function () { return grid; },
                    'getCurrentPerms': function () {
                        return htcConfig && htcConfig.currentPerms
                        ? htcConfig.currentPerms : null;
                    }
                });

                viewEditSubMenu = HttpCommander.Lib.ViewEditSubMenu({
                    'htcConfig': htcConfig,
                    'getMenuActions': function () { return menuActions; },
                    'getSelTypeFilesModel': getSelTypeFilesModel,
                    'getGrid': function () { return grid; },
                    'getCurrentFolder': getCurrentFolder,
                    'viewFile': viewFile,
                    'initImagesViewer': initImagesViewer,
                    'initOfficeEditor': initOfficeEditor,
                    'createVideoConvertWindow': createVideoConvertWindow,
                    'createPlayVideoFlashWindow': createPlayVideoFlashWindow,
                    'createPlayVideoHtml5Window': createPlayVideoHtml5Window,
                    'createPlayVideoJSWindow': createPlayVideoJSWindow,
                    'createPlayAudioHtml5Window': createPlayAudioHtml5Window,
                    'initFlashViewer': initFlashViewer,
                    'isExtensionAllowed': isExtensionAllowed,
                    'supportsWebGlCanvasForAutodesk': function () { return supportsWebGlCanvasForAutodesk; },
                    'openInMsoNewWay': openInMsoNewWay,
                    'isRecentFolder': isRecentFolder,
                    'isTrashFolder': isTrashFolder
                });

                shareSubMenu = HttpCommander.Lib.ShareSubMenu({
                    'htcConfig': htcConfig,
                    'getMenuActions': function () { return menuActions; },
                    'getSelTypeFilesModel': getSelTypeFilesModel,
                    'getGrid': function () { return grid; },
                    'getCurrentFolder': getCurrentFolder,
                    'virtualFilePath': virtualFilePath,
                    'prepareAndShowLinkToFileFolderWindow': prepareAndShowLinkToFileFolderWindow,
                    'prepareAndShowMakePublicLinkWindow': prepareAndShowMakePublicLinkWindow,
                    'initSendEmail': initSendEmail,
                    'isRecentFolder': isRecentFolder,
                    'isTrashFolder': isTrashFolder,
                    'isAlertsFolder': isAlertsFolder
                });

                versioningSubMenu = HttpCommander.Lib.VersioningSubMenu({
                    'htcConfig': htcConfig,
                    'getMenuActions': function () { return menuActions; },
                    'getSelTypeFilesModel': getSelTypeFilesModel,
                    'getGrid': function () { return grid; },
                    'getCurrentFolder': getCurrentFolder,
                    'initVersionHistory': initVersionHistory,
                    'initCheckInWindow': initCheckInWindow,
                    'isRecentFolder': isRecentFolder,
                    'isTrashFolder': isTrashFolder
                });

                if (htcConfig.enabledLabels) {
                    labelsMenu = HttpCommander.Lib.LabelsMenu({
                        'htcConfig': htcConfig,
                        'getMenuActions': function () { return menuActions; },
                        'getSelTypeFilesModel': getSelTypeFilesModel,
                        'getGrid': function () { return grid; },
                        'getCurrentFolder': getCurrentFolder,
                        'Msg': Msg,
                        'Window': Window
                    });
                    fm.showLabelsMenu = function (index, e) {
                        var selModel, allow = htcConfig.enabledLabels
                            && htcConfig.currentPerms && htcConfig.currentPerms.modify;
                        if (allow && labelsMenu && grid && index >= 0) {
                            selModel = grid.getSelectionModel();
                            selModel.selectRow(index, false);
                            labelsMenu.show(e);
                        }
                    };
                }

                if (htcConfig.watchForModifs === true) {
                    watchSubMenu = HttpCommander.Lib.WatchSubMenu({
                        'htcConfig': htcConfig,
                        'getMenuActions': function () { return menuActions; },
                        'getSelTypeFilesModel': getSelTypeFilesModel,
                        'getGrid': function () { return grid; },
                        'getCurrentFolder': getCurrentFolder,
                        'initAndShowWatchModifsWindow': initAndShowWatchModifsWindow,
                        'isSpecialTreeFolderOrSubFolder': isSpecialTreeFolderOrSubFolder
                    });
                }

                moreSubMenu = HttpCommander.Lib.MoreSubMenu({
                    'htcConfig': htcConfig,
                    'getMenuActions': function () { return menuActions; },
                    'getSelTypeFilesModel': getSelTypeFilesModel,
                    'getGrid': function () { return grid; },
                    'getCurrentFolder': getCurrentFolder,
                    'prepareAndShowlinksToWebFoldersWindow': prepareAndShowlinksToWebFoldersWindow,
                    'initAndShowSyncWebFoldersHelpWindow': initAndShowSyncWebFoldersHelpWindow,
                    'versioningSubMenu': versioningSubMenu,
                    'isRecentFolder': isRecentFolder,
                    'isTrashFolder': isTrashFolder,
                    'isAlertsFolder': isAlertsFolder
                });

                cloudsSubMenu = HttpCommander.Lib.CloudStoragesSubMenu({
                    'htcConfig': htcConfig,
                    'getGrid': function () { return grid; },
                    'getSelTypeFilesModel': getSelTypeFilesModel,
                    'downloadToGoogle': downloadToGoogle,
                    'downloadToDropbox': downloadToDropbox,
                    'downloadToSkyDrive': downloadToSkyDrive,
                    'downloadToBox': downloadToBox,
                    'showHelpWindow': showHelpWindow,
                    'showUploadWindow': showUploadWindow,
                    'getCurrentFolder': getCurrentFolder,
                    'isRecentFolder': isRecentFolder,
                    'isTrashFolder': isTrashFolder,
                    'isAlertsFolder': isAlertsFolder
                });

                trashSubMenu = htcConfig.enableTrash ? HttpCommander.Lib.TrashSubMenu({
                    'htcConfig': htcConfig,
                    'getGrid': function () { return grid; },
                    'getCurrentFolder': getCurrentFolder,
                    'getSelTypeFilesModel': getSelTypeFilesModel,
                    'isTrashFolder': isTrashFolder,
                    'getMenuActions': function () { return menuActions; }
                }) : null;

                copyMenu = new Ext.menu.Menu({
                    items:
                    [
                        { itemId: 'copy', text: htcConfig.locData.CommandCopy + ' (' + htcConfig.locData.CommandCopyCutClipboardSuffix + ')', icon: HttpCommander.Lib.Utils.getIconPath(this, 'copy') },
                        { itemId: 'copy-to', text: htcConfig.locData.CommandCopyTo, icon: HttpCommander.Lib.Utils.getIconPath(this, 'copy') }
                    ],
                    listeners: {
                        itemclick: function (item) {
                            var curFolder = getCurrentFolder();
                            clipboard.setItems(createSelectedSet(grid, curFolder));
                            clipboard.srcPath = curFolder;
                            clipboard.isCut = false;
                            toggleToolbarButtons();
                            switch (item.itemId) {
                                case 'copy-to':
                                    initAndShowSelectFolder(curFolder, 'copy');
                                    break;
                                default: break;
                            }
                        },
                        beforeshow: function (menu) {
                            var selTFM = getSelTypeFilesModel(grid);
                            var selModel = selTFM['selModel'];
                            var row = selModel.getSelected();
                            var rowData = row ? row.data : {};
                            var selType = selTFM['selType'];
                            var visible = htcConfig.currentPerms && htcConfig.currentPerms.copy;
                            var enabled = selType != 'empty' && selType != 'none';

                            copyMenu.getComponent('copy').setVisible(visible && enabled);
                            copyMenu.getComponent('copy').setDisabled(!visible || !enabled);
                            copyMenu.getComponent('copy-to').setVisible(visible && enabled);
                            copyMenu.getComponent('copy-to').setDisabled(!visible || !enabled);

                            return true;
                        }
                    }
                });

                moveMenu = new Ext.menu.Menu({
                    items:
                    [
                        { itemId: 'cut', text: htcConfig.locData.CommandCut + ' (' + htcConfig.locData.CommandCopyCutClipboardSuffix + ')', icon: HttpCommander.Lib.Utils.getIconPath(this, 'cut') },
                        { itemId: 'move-to', text: htcConfig.locData.CommandMoveTo, icon: HttpCommander.Lib.Utils.getIconPath(this, 'cut') }
                    ],
                    listeners: {
                        itemclick: function (item) {
                            var curFolder = getCurrentFolder();
                            clipboard.setItems(createSelectedSet(grid, curFolder));
                            clipboard.srcPath = curFolder;
                            clipboard.isCut = true;
                            toggleToolbarButtons();
                            switch (item.itemId) {
                                case 'move-to':
                                    initAndShowSelectFolder(curFolder, 'move');
                                    break;
                                default: break;
                            }
                        },
                        beforeshow: function (menu) {
                            var selTFM = getSelTypeFilesModel(grid);
                            var selModel = selTFM['selModel'];
                            var row = selModel.getSelected();
                            var rowData = row ? row.data : {};
                            var selType = selTFM['selType'];
                            var visible = htcConfig.currentPerms && htcConfig.currentPerms.cut;
                            var enabled = selType != 'empty' && selType != 'none';

                            moveMenu.getComponent('cut').setVisible(visible && enabled);
                            moveMenu.getComponent('cut').setDisabled(!visible || !enabled);
                            moveMenu.getComponent('move-to').setVisible(visible && enabled);
                            moveMenu.getComponent('move-to').setDisabled(!visible || !enabled);
                        }
                    }
                });

                unzipSubMenu = new Ext.menu.Menu({
                    items:
                    [
                        { itemId: 'unzip-to-folder-zipname', text: htcConfig.locData.CommandUnzipTo, icon: HttpCommander.Lib.Utils.getIconPath(this, 'unzip') },
                        { itemId: 'unzip-here', text: htcConfig.locData.CommandUnzipToCurrent, icon: HttpCommander.Lib.Utils.getIconPath(this, 'unzip') },
                        { itemId: 'unzip-to', text: htcConfig.locData.CommandUnzipToNew + '...', icon: HttpCommander.Lib.Utils.getIconPath(this, 'unzip') }
                    ],
                    listeners: {
                        itemclick: function (item) {
                            var selectedRecord = grid.getSelectionModel().getSelected();
                            var curFolder = getCurrentFolder();
                            var unzipInfo = {};
                            var flags = item.itemId == 'unzip-here' ? 1 : item.itemId == 'unzip-to' ? 2 : 3;
                            if (flags == 2) {
                                initAndShowSelectFolder(curFolder, 'unzip', selectedRecord.data.name);
                            } else {
                                unzipInfo["path"] = curFolder;
                                unzipInfo["name"] = selectedRecord.data.name;
                                unzipInfo["crypted"] = true;
                                initAndShowUnzipPromptWindow(unzipInfo, flags);
                            }
                        },
                        beforeshow: function (menu) {
                            var selectedRecord = grid.getSelectionModel().getSelected(),
                                toZipNameFolder = menu.getComponent('unzip-to-folder-zipname');
                            if (toZipNameFolder) {
                                if (selectedRecord) {
                                    var zipNameWithoutExt = selectedRecord.data.name,
                                    pos = zipNameWithoutExt.lastIndexOf('.');
                                    if (pos > 0) {
                                        zipNameWithoutExt = zipNameWithoutExt.substring(0, pos);
                                    }
                                    toZipNameFolder.setText(String.format('{0} "{1}"',
                                        htcConfig.locData.CommandUnzipTo, Ext.util.Format.htmlEncode(zipNameWithoutExt)))
                                    toZipNameFolder.setVisible(true);
                                    toZipNameFolder.setDisabled(false);
                                } else {
                                    toZipNameFolder.setVisible(false);
                                    toZipNameFolder.setDisabled(true);
                                }
                            }
                        }
                    }
                });

                fileMenu = HttpCommander.Lib.FileMenu({
                    'htcConfig': htcConfig,
                    'getMenuActions': function () { return menuActions; },
                    'getSelTypeFilesModel': getSelTypeFilesModel,
                    'getGrid': function () { return grid; },
                    'getCurrentFolder': getCurrentFolder,
                    'isExtensionAllowed': isExtensionAllowed,
                    'createSelectedSet': createSelectedSet,
                    'viewEditSubMenu': viewEditSubMenu,
                    'shareSubMenu': shareSubMenu,
                    'newSubMenu': newSubMenu,
                    'unzipSubMenu': unzipSubMenu,
                    'clipboard': clipboard,
                    'initZipContent': initZipContent,
                    'initMetadata': initMetadata,
                    'toggleToolbarButtons': toggleToolbarButtons,
                    'cloudsSubMenu': cloudsSubMenu,
                    'labelsMenu': labelsMenu,
                    'watchSubMenu': watchSubMenu,
                    'moreSubMenu': moreSubMenu,
                    'isRecentFolder': isRecentFolder,
                    'isTrashFolder': isTrashFolder,
                    'isSharedTreeFolder': isSharedTreeFolder,
                    'isSharedForYouTreeFolder': isSharedForYouTreeFolder,
                    'isAlertsFolder': isAlertsFolder,
                    'isSpecialTreeFolderOrSubFolder': isSpecialTreeFolderOrSubFolder,
                    'initAndShowSelectFolder': initAndShowSelectFolder,
                    'copyMenu': copyMenu,
                    'moveMenu': moveMenu
                });

                if (htcConfig.sharedInTree) {
                    sharedFileMenu = HttpCommander.Lib.AnonymContextMenu({
                        'htcConfig': htcConfig,
                        'getMenuActions': function () { return menuActions; },
                        'getSelTypeFilesModel': getSelTypeFilesModel,
                        'getSharedGrid': function () { return sharedGrid; },
                        'getCurrentFolder': getCurrentFolder,
                        'createSelectedSet': createSelectedSet,
                        'toggleToolbarButtons': toggleToolbarButtons,
                        'Msg': Msg,
                        'showBalloon': showBalloon
                    });
                }
            } catch (e) {
                throw e;
            }
        };

        // Init Menu Actions
        var initMenuActions = function () {
            if (menuActions)
                return;
            try {
                menuActions = HttpCommander.Lib.MenuActions({
                    'htcConfig': htcConfig,
                    'Msg': Msg,
                    'Window': Window,
                    'getView': function () { return view; },
                    'isExtensionAllowed': isExtensionAllowed,
                    'getRestrictionMessage': getRestrictionMessage,
                    'gridItemExists': gridItemExists,
                    'globalLoadMask': globalLoadMask,
                    'getUid': function () { return uid; },
                    'getCurrentFolder': getCurrentFolder,
                    'showBalloon': showBalloon,
                    'openGridFolder': openGridFolder,
                    'openTreeNode': openTreeNode,
                    'getGrid': function () { return grid; },
                    'getCurrentGridView': function () { return currentGridView; },
                    'getAsControl': function () { return asControl; },
                    'showRefreshWarning': showRefreshWarning,
                    'setAllowEdit': function (v) { allowEdit = v; },
                    'createSelectedSet': createSelectedSet,
                    'downloadFile': downloadFile,
                    'initDownload': initDownload,
                    'getDownloadWindow': function () { return downloadWindow; },
                    'getAppRootUrl': function () { return appRootUrl; },
                    'getFileManager': function () { return fm; },
                    'reloadTreeNodeIfOpened': reloadTreeNodeIfOpened,
                    'initAndShowShortcutWindow': initAndShowShortcutWindow,
                    'initAndShowCloudConvertWindow': initAndShowCloudConvertWindow,
                    'viewFile': viewFile,
                    'initImagesViewer': initImagesViewer,
                    'initFlashViewer': initFlashViewer,
                    'initEditTextFileWindow': initEditTextFileWindow,
                    'virtualFilePath': virtualFilePath,
                    'prepareAndShowLinkToFileFolderWindow': prepareAndShowLinkToFileFolderWindow,
                    'initSendEmail': initSendEmail,
                    'createVideoConvertWindow': createVideoConvertWindow,
                    'createPlayVideoFlashWindow': createPlayVideoFlashWindow,
                    'createPlayVideoHtml5Window': createPlayVideoHtml5Window,
                    'createPlayVideoJSWindow': createPlayVideoJSWindow,
                    'createPlayAudioHtml5Window': createPlayAudioHtml5Window,
                    'initAndShowZipPromptWindow': initAndShowZipPromptWindow,
                    'getGoogleDriveAuth': function () { return googleDriveAuth; },
                    'editInGoogle': editInGoogle,
                    'deleteInGoogle': deleteInGoogle,
                    'getSkyDriveAuth': function () { return skyDriveAuth; },
                    'editInMSOO': editInMSOO,
                    'deleteInMSOO': deleteInMSOO,
                    'editInOffice365': editInOffice365,
                    'deleteInOffice365': deleteInOffice365,
                    'setSelectPath': function (v) { selectPath = v; },
                    'isRecentFolder': isRecentFolder,
                    'openTreeRecent': openTreeRecent,
                    'isTrashFolder': isTrashFolder,
                    'openSharedByLink': openSharedByLink,
                    'initAndShowWatchModifsWindow': initAndShowWatchModifsWindow,
                    'openTrash': openTrash,
                    'initAndShowChangesWatchWindow': initAndShowChangesWatchWindow,
                    'openTreeAlerts': openTreeAlerts,
                    'getSelectedFiles': getSelectedFiles,
                    'linkToFileByName': linkToFileByName,
                    'linkToFolderByName': linkToFolderByName,
                    'toggleToolbarButtons': toggleToolbarButtons,
                    'clipboard': clipboard,
                    'getDetailsPane': function () { return detailsPane; }
                });
            } catch (e) {
                throw e;
            }
        };

        // Grid objects
        var initGrid = function () {
            // Private vars
            var gridStoreFields = [],
                sizeColumnAvailable = false,
                gridPagingToolBar, gridPagerInfo, sharedGridPagerInfo,
                gridStdToolBar, gridItemsInfo, trashInfo,
                gridDropTarget = null,
                sharedGridDropTarget = null,
                listFilters = [],
                gridColumns = [],
                gridFilters,
                sRowTypeExist = false,
                qtipExist = false,
                recentGroupExist = false,
                trashNameExist = false,
                watchExist = false,
                labelsExist = false;

            try { // fields
                var sizeColumnExist = false;
                Ext.each(htcConfig.fileListColumns, function (col) {
                    if ((col.state & 1) || (col.state & 2)) {
                        var field = { name: col.name, type: col.type };
                        if (col.type === 'date')
                            field['dateFormat'] = col.dateFormat;
                        if (col.name === 'size') {
                            sizeColumnExist = true;
                            if (col.state & 2) {
                                sizeColumnAvailable = true;
                            }
                        }
                        if (col.name === 'labels') {
                            field['name'] = 'label';
                            gridStoreFields.push({
                                name: 'label_color',
                                type: 'string'
                            }, {
                                name: 'label_user',
                                type: 'string'
                            }, {
                                name: 'label_date',
                                type: 'date',
                                dateFormat: 'timestamp'
                            });
                            labelsExist = true;
                        }
                        if (htcConfig.enableRecents) {
                            if (col.name === 'srowtype') {
                                sRowTypeExist = true;
                                field.type = 'string';
                            }
                            if (col.name === 'qtip') {
                                qtipExist = true;
                                field.type = 'string';
                            }
                            if (col.name === 'recentgroup') {
                                recentGroupExist = true;
                                field.type = 'int'
                            }
                        }
                        if (htcConfig.enableTrash) {
                            if (col.name == 'trashname') {
                                trashNameExist = true;
                                field.type = 'string';
                            }
                        }
                        if (htcConfig.watchForModifs) {
                            if (col.name == 'watchForModifs') {
                                watchExist = true;
                                field.type = 'auto';
                            }
                        }
                        gridStoreFields.push(field);
                    }
                    if ((col.state & 8) && (col.state & 2))
                        showMetaDataInList = true;
                });
                if (!sizeColumnExist) {
                    gridStoreFields.push({ // fix for allowed view/edit files
                        name: 'size_hidden',
                        type: 'int',
                        defaultValue: 1
                    });
                }
                if (htcConfig.enableRecents) {
                    if (!sRowTypeExist) {
                        gridStoreFields.push({ name: 'srowtype', type: 'string' });
                    }
                    if (!qtipExist) {
                        gridStoreFields.push({ name: 'qtip', type: 'string' });
                    }
                    if (!recentGroupExist) {
                        gridStoreFields.push({ name: 'recentgroup', type: 'int' });
                    }
                }
                if (htcConfig.enableTrash && !trashNameExist) {
                    gridStoreFields.push({ name: 'trashname', type: 'string' });
                }
                if (htcConfig.watchForModifs && !watchExist) {
                    gridStoreFields.push({ name: 'watchForModifs', type: 'auto' });
                }
                if (!showMetaDataInList) {
                    showMetaDataInList = htcConfig.showFileMarkWhenExistsDetails;
                }
                if (!labelsExist) {
                    gridStoreFields.push({
                        name: 'label',
                        type: 'string'
                    }, {
                        name: 'label_color',
                        type: 'string'
                    }, {
                        name: 'label_user',
                        type: 'string'
                    }, {
                        name: 'label_date',
                        type: 'date',
                        dateFormat: 'timestamp'
                    });
                }
                if (htcConfig.timeIntervalMarkRecentlyCreatedFiles > 0)
                    gridStoreFields.push({ name: 'isnew', type: 'boolean' });
                if (htcConfig.timeIntervalMarkRecentlyModifiedFiles > 0)
                    gridStoreFields.push({ name: 'ismod', type: 'boolean' });
                gridStoreFields.push({ name: 'isdet', type: 'boolean' });
                gridStoreFields.push({ name: 'comments', type: 'int' });
                if (htcConfig.enableMSOfficeEdit || htcConfig.enableOpenOfficeEdit || htcConfig.enableWebFoldersLinks)
                    gridStoreFields.push({ name: 'locked', type: 'boolean' });
                if (htcConfig.enableVersionControl)
                    gridStoreFields.push({ name: 'vstate', type: 'int' });
                gridStoreFields.push({ name: 'isshortcut', type: 'boolean' });
                gridStoreFields.push({ name: 'publiclinks', type: 'int' });
                //32px
                gridStoreFields.push({ name: 'icon_normal', type: 'string' });
                //48px
                gridStoreFields.push({ name: 'icon_big', type: 'string' });
                //96px
                gridStoreFields.push({ name: 'icon_large', type: 'string' });

                gridStoreFields.push({ name: 'attributes', type: 'string' });
            } catch (e) {
                ProcessScriptError(e);
            }

            var getSelectedAndTotalFilesFolders = function (gridPanel) {
                var result = {
                    selectedFiles: 0,
                    totalFiles: 0,
                    selectedFolders: 0,
                    totalFolders: 0
                };
                if (sizeColumnAvailable) {
                    result['selectedSize'] = 0;
                    result['totalSize'] = 0;
                }
                if (gridPanel) {
                    var rows = gridPanel.getStore();
                    var sm = gridPanel.getSelectionModel();
                    if (sm && rows && rows.getRange) {
                        rows = rows.getRange();
                        if (rows && rows.length > 0) try {
                            Ext.each(rows, function (r) {
                                if (r.data.rowtype == 'file') {
                                    result.totalFiles++;
                                    var rSize = 0;
                                    if (sizeColumnAvailable && r.data.size != null && String(r.data.size) != "") {
                                        try {
                                            rSize = parseInt(r.data.size);
                                            result.totalSize += rSize;
                                        } catch (e) { }
                                    }
                                    if (sm.isSelected(r)) {
                                        result.selectedFiles++;
                                        if (sizeColumnAvailable && rSize > 0)
                                            result.selectedSize += rSize;
                                    }
                                } else if (r.data.rowtype == 'folder' || r.data.rowtype == 'rootfolder') {
                                    result.totalFolders++;
                                    if (sm.isSelected(r))
                                        result.selectedFolders++;
                                }
                            });
                        } catch (e) { }
                    }
                }
                return result;
            };
            var fillInfoAboutSelectedAndTotalFilesFolders = function (gridPanel, usedTrashMsg) {
                if (gridPanel && gridPanel.getStore) {
                    var store = gridPanel.getStore();
                    if (store) {
                        var gfb = gridPanel.fbar;
                        if (gfb && gridItemsInfo) {
                            if (trashInfo && isTrashFolder()) {
                                gridItemsInfo.hide();
                            } else {
                                var ffInfo = getSelectedAndTotalFilesFolders(gridPanel);
                                var html = '<b>';
                                var mainTplInfo = htcConfig.locData.GridBottomFilesFoldersInfo;
                                if (sizeColumnAvailable)
                                    html += String.format(htcConfig.locData.GridBottomFilesSizeInfo, renderers.sizeRenderer(ffInfo.selectedSize), renderers.sizeRenderer(ffInfo.totalSize));
                                else
                                    mainTplInfo = mainTplInfo.substring(0, 1).toUpperCase() + mainTplInfo.substring(1);
                                html += String.format(mainTplInfo,
                                    ffInfo.selectedFiles,
                                    ffInfo.totalFiles,
                                    ffInfo.selectedFolders,
                                    ffInfo.totalFolders) + '</b>';
                                gridItemsInfo.el.dom.innerHTML = html;
                                gridItemsInfo.show();
                            }
                        }
                        if (gfb && trashInfo) {
                            if (!isTrashFolder()) {
                                trashInfo.hide();
                            } else {
                                if (!Ext.isEmpty(usedTrashMsg)) {
                                    trashInfo.el.dom.innerHTML = '<span style="font-weight:bold;">'
                                        + usedTrashMsg + '</span>';
                                }
                                trashInfo.show();
                            }
                        }
                        if (pagingEnabled) {
                            var gbb = gridPanel.getBottomToolbar();
                            if (gbb && gridPagerInfo) {
                                var needRefresh = false;
                                var pageData = gbb.getPageData();
                                var totalCount = store.getTotalCount();
                                var count = store.getCount();
                                var fIndex = store.findBy(function (rec, id) {
                                    return rec.get("rowtype").toLowerCase() === 'uplink';
                                });
                                if (fIndex > -1) count--;
                                if (store.reader.jsonData.position && store.reader.jsonData.position > -1) {
                                    gbb.cursor = store.reader.jsonData.position;
                                    pageData = gbb.getPageData();
                                    var ap = pageData.activePage, ps = pageData.pages;
                                    if (ap > ps) {
                                        needRefresh = true;
                                    }
                                    gbb.afterTextItem.setText(String.format(gbb.afterPageText, pageData.pages));
                                    gbb.inputItem.setValue(ap);
                                    gbb.first.setDisabled(ap == 1);
                                    gbb.prev.setDisabled(ap == 1);
                                    gbb.next.setDisabled(ap >= ps);
                                    gbb.last.setDisabled(ap >= ps);
                                    gbb.refresh.enable();
                                    gbb.updateInfo();
                                }
                                gridPagerInfo.setText(count == 0 ?
                                    htcConfig.locData.PagingToolbarEmptyMsg :
                                    String.format(htcConfig.locData.PagingToolbarDisplayMsg,
                                        gbb.cursor + 1,
                                        gbb.cursor + count,
                                        totalCount)
                                );
                                gbb.fireEvent('change', this, pageData);
                                var isSpecialFolder = isRecentFolder();// || isTrashFolder();
                                if (isSpecialFolder || (htcConfig.itemsPerPage >= totalCount && pageData.activePage >= 1 && pageData.activePage <= pageData.pages))
                                    gbb.hide();
                                else
                                    gbb.show();
                                if (needRefresh) {
                                    gbb.movePrevious();
                                }
                            }
                        }
                        if (gfb)
                            gfb.doLayout(true, true);
                    }
                }
            };

            var createGridDropTarget = function (grd) {
                if (gridDropTarget)
                    gridDropTarget.destroy();
                gridDropTarget = null;
                if (grd.enableDragDrop) try {
                    gridDropTarget = new Ext.dd.DropTarget(grd.getView().scroller.dom, {
                        ddGroup: $('GridDD'),
                        dropOK: false,
                        dtGrid: grd,
                        curTargetRow: null,
                        notifyOver: function (ddSource, e, data) {
                            if (this.curTargetRow)
                                Ext.fly(this.curTargetRow).removeClass('x-drop-target-active');
                            this.curTargetRow = null;
                            this.dropOK = false;

                            var source = ddSource.dragData.node;

                            var extFile = '';
                            var grdView;
                            var curFolder = getCurrentFolder().toLowerCase().trim();
                            var targetRow, target;
                            try {
                                grdView = this.dtGrid.getView();
                                var targetEl = e.getTarget(grdView.rowSelector);
                                targetRow = grdView.findRow(targetEl);
                                target = this.dtGrid.getStore().getAt(grdView.findRowIndex(targetEl));
                            } catch (err) {
                                return this.dropNotAllowed;
                            }

                            var ddAllow = dragDropPermission(source, target);
                            if (!ddAllow.allow)
                                return this.dropNotAllowed;

                            try {
                                if (target) {
                                    if (target.data.rowtype == 'sharedroot') {
                                        if (!ddAllow.share)
                                            return this.dropNotAllowed;
                                    } else if (target.data.rowtype == 'trashroot') {
                                        if (!ddAllow.del)
                                            return this.dropNotAllowed;
                                    } else {
                                        if (target.data.rowtype == 'file')
                                            extFile = HttpCommander.Lib.Utils.getFileExtension(target.data.name);
                                        if (target.data.rowtype != 'folder' && !(target.data.rowtype == 'file' && extFile == 'zip') && !(target.data.rowtype == 'uplink' && curFolder.indexOf('/') > -1))
                                            return this.dropNotAllowed;
                                        if ((target.data.rowtype == 'folder' || target.data.rowtype == 'uplink') && !ddAllow.dnd)
                                            return this.dropNotAllowed;
                                        if (target.data.rowtype == 'file' && extFile == 'zip' && !ddAllow.zip)
                                            return this.dropNotAllowed;
                                    }
                                } else if (isTrashFolder()) {
                                    if (!ddAllow.del)
                                        return this.dropNotAllowed;
                                } else if (!ddAllow.dnd)
                                    return this.dropNotAllowed;
                            } catch (err) {
                                return this.dropNotAllowed;
                            }

                            if (source) {
                                if (source.isRoot || !source.parentNode) {
                                    return this.dropNotAllowed;
                                }
                                if (!target || target.data.rowtype != 'sharedroot') {
                                    if (source.parentNode.isRoot) {
                                        return this.dropNotAllowed;
                                    }
                                    var nodeFolder = source.attributes.path.toLowerCase().trim();
                                    if (curFolder.indexOf(nodeFolder) == 0)
                                        return this.dropNotAllowed;
                                    var parentNodeFolder = source.parentNode.attributes.path.toLowerCase().trim();
                                    if (!target && curFolder == parentNodeFolder)
                                        return this.dropNotAllowed;
                                    if (target) {
                                        var fName = '';
                                        if (target.data.rowtype == 'folder')
                                            fName = curFolder + '/' + target.data.name.toLowerCase().trim();
                                        else if (target.data.rowtype != 'file') {
                                            fName = curFolder.substring(0, curFolder.lastIndexOf('/'));
                                            if (fName == parentNodeFolder)
                                                return this.dropNotAllowed;
                                        }
                                        if (fName == nodeFolder)
                                            return this.dropNotAllowed;
                                    }
                                }
                            } else {
                                source = ddSource.dragData.selections;
                                if (!source || !target || !Ext.isArray(source) || source.length < 1)
                                    return this.dropNotAllowed;
                                if (this.dtGrid.getSelectionModel().isSelected(target))
                                    return this.dropNotAllowed;
                            }

                            if (targetRow) {
                                this.curTargetRow = targetRow;
                                Ext.fly(this.curTargetRow).addClass('x-drop-target-active');
                                //if (grdView) {
                                //    targetRow.scrollIntoView();
                                //    grdView.holdPosition = true;
                                //}
                            }

                            this.dropOK = true;
                            return this.dropAllowed;
                        },
                        notifyOut: function (ddSource, e, data) {
                            if (this.curTargetRow)
                                Ext.fly(this.curTargetRow).removeClass('x-drop-target-active');
                        },
                        notifyEnter: function (ddSource, e, data) {
                            var ddAllow = dragDropPermission(ddSource.dragData.node);
                            if (!ddAllow.allow)
                                return this.dropNotAllowed;
                            var recs = ddSource.dragData.selections;
                            if (recs && Ext.isArray(recs) && recs.length > 0) {
                                var folders = 0, files = 0;
                                Ext.each(recs, function (r) {
                                    if (r.data.rowtype == "file") files++;
                                    else if (r.data.rowtype == "folder") folders++;
                                });
                                var ddHtml = '';
                                if (files > 0)
                                    ddHtml = String.format(htcConfig.locData.GridDDSelectedFilesText, files);
                                if (folders > 0) {
                                    if (ddHtml != '')
                                        ddHtml += "<br />";
                                    ddHtml += String.format(htcConfig.locData.GridDDSelectedFoldersText, folders);
                                }
                                if (ddHtml != '')
                                    data.ddel.innerHTML = ddHtml;
                            }
                        },
                        notifyDrop: function (ddSource, e, data) {
                            if (this.curTargetRow)
                                Ext.fly(this.curTargetRow).removeClass('x-drop-target-active');

                            this.curTargetRow = null;
                            var source = ddSource.dragData.node;
                            var target;
                            try {
                                var grdView = this.dtGrid.getView();
                                target = this.dtGrid.getStore().getAt(grdView.findRowIndex(e.getTarget(grdView.rowSelector)));
                            } catch (err) {
                                Msg.show({
                                    title: htcConfig.locData.CommonErrorCaption,
                                    msg: err,
                                    icon: Msg.ERROR,
                                    buttons: Msg.OK
                                });
                                return false;
                            }
                            var ddAllow = dragDropPermission(source, target);
                            if (!ddAllow.allow)
                                this.dropOK = false;
                            clipboard.clear();
                            if (!this.dropOK)
                                return false;

                            this.dropOK = false;

                            var addToZip = false,
                                moveToTrash = false,
                                createShare = false;
                            if (target) {
                                addToZip = (target.data.rowtype == 'file');
                                moveToTrash = (target.data.rowtype == 'trashroot');
                                createShare = (target.data.rowtype == 'sharedroot');
                                if (addToZip && (HttpCommander.Lib.Utils.getFileExtension(target.data.name) != 'zip' || !ddAllow.zip))
                                    return false;
                            } else if (isTrashFolder()) {
                                moveToTrash = true;
                            }

                            if (moveToTrash && !ddAllow.del)
                                return false;

                            if (createShare && !ddAllow.share)
                                return false;

                            var curFolder = getCurrentFolder();
                            var srcPath, perms;
                            if (source) {
                                try {
                                    perms = eval("(" + source.attributes.permissions + ")");
                                } catch (e) { }
                                srcPath = source.parentNode.attributes.path;
                                var temp = [];
                                temp.push({ data: { name: source.attributes.name, rowtype: 'folder'} });
                                source = temp;
                            } else {
                                if (!target)
                                    return false;
                                perms = htcConfig.currentPerms;
                                source = ddSource.dragData.selections;
                                srcPath = curFolder;
                            }

                            try {
                                if (!createShare && !moveToTrash) {
                                    clipboard.setItems(createDraggedSet(source, srcPath));
                                    clipboard.srcPath = curFolder;
                                }
                                var draggedFiles = '', draggedFolders = '';
                                Ext.each(source, function (rec) {
                                    if (rec.data.rowtype == "file") draggedFiles += ", " + Ext.util.Format.htmlEncode(rec.data.name);
                                    else if (rec.data.rowtype == "folder") draggedFolders += ", " + Ext.util.Format.htmlEncode(rec.data.name);
                                });
                                var draggedItemsText = '';
                                if (draggedFiles != '')
                                    draggedItemsText = String.format(htcConfig.locData.GridDDDraggedFileNames, draggedFiles.substring(1));
                                if (draggedFolders != '') {
                                    if (draggedItemsText != '')
                                        draggedItemsText += ".<br />";
                                    draggedItemsText += String.format(htcConfig.locData.GridDDDraggedFolderNames, draggedFolders.substring(1));
                                }

                                if (createShare) {
                                    dropDraggedForShare(source[0], srcPath, perms);
                                    return;
                                } else if (moveToTrash) {
                                    dropDraggedToTrash(target, createDraggedSet(source, srcPath, true));
                                    return true;
                                } else if (addToZip) {
                                    if (htcConfig.allowSetPasswordForZipArchives) {
                                        (new Window({
                                            title: String.format(htcConfig.locData.GridDDConfirmAddToZipTitle, Ext.util.Format.htmlEncode(target.data.name)),
                                            autoHeight: true,
                                            width: 300,
                                            buttonAlign: 'center',
                                            defaultButton: 0,
                                            modal: true,
                                            plain: true,
                                            layout: 'form',
                                            bodyStyle: 'padding:5px',
                                            labelAlign: 'top',
                                            defaults: {
                                                anchor: '100%',
                                                xtype: 'textfield'
                                            },
                                            items: [{
                                                xtype: 'label',
                                                html: String.format(htcConfig.locData.GridDDConfirmAddToZipMessage, '<br />' + draggedItemsText) + '<br /><br />'
                                            }, {
                                                xtype: 'pwdfield',
                                                fieldLabel: htcConfig.locData.AppendToZipPasswordProtectHint
                                            }],
                                            buttons: [{
                                                text: htcConfig.locData.CommonButtonCaptionOK,
                                                handler: function () {
                                                    var pass = this.ownerCt.ownerCt.items.items[1].getValue();
                                                    if (String(pass || '').length > 0)
                                                        clipboard.password = pass;
                                                    else
                                                        clipboard.password = undefined;
                                                    dropDraggedToZip(target);
                                                    this.ownerCt.ownerCt.close();
                                                }
                                            }, {
                                                text: htcConfig.locData.CommonButtonCaptionCancel,
                                                handler: function () {
                                                    this.ownerCt.ownerCt.close();
                                                }
                                            }]
                                        })).show();
                                        return true;
                                    } else {
                                        Msg.confirm(
                                            String.format(htcConfig.locData.GridDDConfirmAddToZipTitle, Ext.util.Format.htmlEncode(target.data.name)),
                                            String.format(htcConfig.locData.GridDDConfirmAddToZipMessage, '<br />' + draggedItemsText),
                                            function (btn) {
                                                if (btn == 'yes') {
                                                    dropDraggedToZip(target);
                                                    return true;
                                                } else {
                                                    clipboard.clear();
                                                    return false;
                                                }
                                            }
                                        );
                                    }
                                    return;
                                }

                                if (ddAllow.onlyMoveOrCopy) {
                                    clipboard.isCut = ddAllow.move;
                                    Msg.confirm(
                                        Ext.util.Format.htmlEncode(String.format(htcConfig.locData.GridDDConfirmCopyMoveTitle, target ? (target.data.rowtype == 'folder' ? target.data.name : curFolder.substring(0, curFolder.lastIndexOf('/'))) : curFolder)),
                                        (ddAllow.move
                                            ? String.format(htcConfig.locData.GridDDConfirmTargetFolderOnlyMoveMsg, '<br />' + draggedItemsText)
                                            : String.format(htcConfig.locData.GridDDConfirmTargetFolderOnlyCopyMsg, '<br />' + draggedItemsText)),
                                        function (btn) {
                                            if (btn == 'yes') {
                                                dropDraggedSet(target);
                                                return true;
                                            } else {
                                                clipboard.clear();
                                                return false;
                                            }
                                        }
                                    );
                                    return;
                                }
                                //var dropResult = HttpCommander.Lib.Utils.getCookie($("dropresult"));
                                //if (dropResult) {
                                //    var dr = String(dropResult).toLowerCase().trim();
                                //    if (dr === "copy" || dr === "move") {
                                //        clipboard.isCut = (dr === "move");
                                //        dropDraggedSet(target);
                                //        return true;
                                //    } else {
                                //        HttpCommander.Lib.Utils.deleteCookie("dropresult");
                                //    }
                                //}
                                Msg.show({
                                    title: Ext.util.Format.htmlEncode(String.format(htcConfig.locData.GridDDConfirmCopyMoveTitle, target ? (target.data.rowtype == 'folder' ? target.data.name : curFolder.substring(0, curFolder.lastIndexOf('/'))) : curFolder)),
                                    msg: String.format(htcConfig.locData.GridDDConfirmCopyMoveMsg,
                                            Ext.util.Format.htmlEncode(srcPath),
                                            Ext.util.Format.htmlEncode(target
                                                ? (target.data.rowtype == 'folder'
                                                    ? (curFolder + '/' + target.data.name)
                                                    : curFolder.substring(0, curFolder.lastIndexOf('/')))
                                                : curFolder),
                                            '<br />' + draggedItemsText,
                                            '&nbsp;'), //'<br /><br /><input id="ddCopyMoveCheckBox" type="checkbox" />&nbsp;'
                                    buttons: {
                                        yes: htcConfig.locData.CommandMove,
                                        no: htcConfig.locData.CommandCopy,
                                        cancel: htcConfig.locData.CommonButtonCaptionCancel
                                    },
                                    fn: function (btn) {
                                        if (btn == 'yes' || btn == 'no') {
                                            clipboard.isCut = (btn == 'yes');
                                            //var ddcmcb = Ext.get('ddCopyMoveCheckBox');
                                            //if (ddcmcb && ddcmcb.dom.checked)
                                            //    HttpCommander.Lib.Utils.setCookie($("dropresult"), (btn == "yes" ? "move" : "copy"));
                                            //else
                                            //    HttpCommander.Lib.Utils.deleteCookie($("dropresult"));
                                            dropDraggedSet(target);
                                        } else {
                                            clipboard.clear();
                                            Msg.hide();
                                        }
                                    }
                                });
                            } catch (err) {
                                clipboard.clear();
                                Msg.show({
                                    title: htcConfig.locData.CommonErrorCaption,
                                    msg: err,
                                    icon: Msg.ERROR,
                                    buttons: Msg.CANCEL
                                });
                                return false;
                            }

                            return true;
                        }
                    });
                } catch (e) {
                    ProcessScriptError(e);
                }
            };

            var createSharedGridDropTarget = function (grd) {
                if (sharedGridDropTarget)
                    sharedGridDropTarget.destroy();
                sharedGridDropTarget = null;
                if (grd.enableDragDrop) try {
                    sharedGridDropTarget = new Ext.dd.DropTarget(grd.getView().scroller.dom, {
                        ddGroup: $('GridDD'),
                        dropOK: false,
                        dtGrid: grd,
                        curTargetRow: null,
                        notifyOver: function (ddSource, e, data) {
                            if (this.curTargetRow)
                                Ext.fly(this.curTargetRow).removeClass('x-drop-target-active');

                            this.dropOK = false;

                            var source = ddSource.dragData.node;
                            var ddAllow = dragDropPermission(source, { data: { path: _SHARED_}});
                            if (!ddAllow.allow)
                                return this.dropNotAllowed;

                            this.dropOK = true;
                            return this.dropAllowed;
                        },
                        notifyOut: function (ddSource, e, data) {
                            if (this.curTargetRow)
                                Ext.fly(this.curTargetRow).removeClass('x-drop-target-active');
                        },
                        notifyDrop: function (ddSource, e, data) {
                            if (this.curTargetRow)
                                Ext.fly(this.curTargetRow).removeClass('x-drop-target-active');

                            var source = ddSource.dragData.node;
                            var ddAllow = dragDropPermission(source, { data: { path: _SHARED_} });
                            if (!ddAllow.allow)
                                this.dropOK = false;
                            if (!this.dropOK)
                                return false;

                            this.dropOK = false;

                            var srcPath, perms;
                            try {
                                perms = eval("(" + source.attributes.permissions + ")");
                            } catch (e) { }
                            srcPath = source.parentNode.attributes.path;
                            var temp = [];
                            temp.push({ data: { name: source.attributes.name, rowtype: 'folder' } });
                            source = temp;

                            dropDraggedForShare(source[0], srcPath, perms);

                            return true;
                        }
                    });
                } catch (e) {
                    ProcessScriptError(e);
                }
            };

            try { // store
                // get sort info
                var mainGridSortInfo = HttpCommander.Lib.Utils.getCookie($("sortinfo"));
                if (!Ext.isEmpty(mainGridSortInfo)) {
                    mainGridSortInfo = mainGridSortInfo.split(':');
                    var si = {
                        field: mainGridSortInfo[0],
                        direction: 'ASC'
                    };
                    if (mainGridSortInfo.length > 1) {
                        var dirInfo = mainGridSortInfo[1];
                        if (!Ext.isEmpty(dirInfo)) {
                            dirInfo = dirInfo.toUpperCase();
                            if (dirInfo == 'ASC' || dirInfo == 'DESC') {
                                si.direction = dirInfo;
                            }
                        }
                    }
                    if (Ext.isEmpty(si.field) || si.field.trim().length == 0) {
                        si.field = 'name';
                    }
                    mainGridSortInfo = si;
                } else {
                    mainGridSortInfo = {
                        field: 'name',
                        direction: 'ASC'
                    };
                }
                gridStore = new Ext.data.DirectStore({
                    remoteSort: true,
                    baseParams: { start: 0, limit: pagingEnabled ? htcConfig.itemsPerPage : 0, path: 'root', fAllow: null, fIgnore: null, fARegexp: null, fIRegexp: null, selectPath: null },
                    directFn: HttpCommander.Grid.FastLoadPage,
                    paramOrder: ['start', 'limit', 'sort', 'dir', 'path', 'fAllow', 'fIgnore', 'fARegexp', 'fIRegexp', 'selectPath'],
                    idProperty: 'id',
                    totalProperty: 'total',
                    successProperty: 'success',
                    root: 'data',
                    sortInfo: mainGridSortInfo,
                    fields: gridStoreFields,
                    defaultRequestTimeout: Ext.Ajax.timeout,
                    listeners: {
                        beforeload: function (store, opts) {
                            Ext.Ajax.timeout = HttpCommander.Lib.Consts.gridRequestTimeout;
                            this.baseParams.fAllow = null;
                            this.baseParams.fIgnore = null;
                            this.baseParams.fARegexp = null;
                            this.baseParams.fIRegexp = null;
                            this.baseParams.selectPath = null;
                            if (this.baseParams.path == 'root') {
                                var filter = HttpCommander.Lib.Utils.getFolderFilter();
                                if (filter.folderFilterAllow) this.baseParams.fAllow = filter.folderFilterAllow;
                                if (filter.folderFilterIgnore) this.baseParams.fIgnore = filter.folderFilterIgnore;
                                if (filter.folderFilterAllowRegexp) this.baseParams.fARegexp = filter.folderFilterAllowRegexp;
                                if (filter.folderFilterIgnoreRegexp) this.baseParams.fIRegexp = filter.folderFilterIgnoreRegexp;
                            } else if (selectPath != null && selectPath.path == this.baseParams.path && !selectPath.userSelect) {
                                this.baseParams.selectPath = selectPath.name;
                            }
                            if (!!detailsPane) {
                                detailsPane.forceRefresh = true;
                            }
                        },
                        datachanged: function (store) {
                            if (grid) {
                                var curFolder = getCurrentFolder();
                                var hNotSet = true;
                                var limits = '';
                                var needCurFolderEncode = true;
                                if (typeof store.reader.jsonData.limitations != 'undefined' && store.reader.jsonData.limitations != '') {
                                    limits = ' <span class="x-grid3-cell-text" style="display: inline;">('
                                        + Ext.util.Format.htmlEncode(store.reader.jsonData.limitations) + ')</span>';
                                }
                                var hSpanDom;
                                var tbg = grid.getTopToolbar();
                                if (tbg) {
                                    var qsn = tbg.getComponent($('quick-search-by-name-fld'));
                                    var qsc = tbg.getComponent($('quick-search-by-content-fld'));
                                    var issf = isSpecialTreeFolderOrSubFolder(curFolder);
                                    if (qsn) {
                                        qsn.setVisible(!issf && htcConfig.searchEnabled);
                                    }
                                    if (qsc) {
                                        qsc.setVisible(!issf && htcConfig.searchEnabled && htcConfig.searchCriterions.content);
                                    }

                                    var hEl = tbg.getComponent('path-info');
                                    if (hEl) {
                                        var hSpan = hEl.el;
                                        if (hSpan) {
                                            hSpanDom = hSpan.dom;
                                        }
                                    }
                                }
                                if (curFolder.toLowerCase() == 'root') {
                                    curFolder = 'root'; //'\\';
                                    needCurFolderEncode = false;
                                } else if (String(curFolder) == '') {
                                    curFolder = '&nbsp;';
                                    needCurFolderEncode = false;
                                } else {
                                    var isRcnt = isRecentFolder(curFolder);
                                    var pathParts = curFolder.split('/');
                                    var len = pathParts.length;
                                    if (len > 0 && hSpanDom) {
                                        hSpanDom.innerHTML = '';
                                        var a = document.createElement('span'); //('a');
                                        //a.href = '';
                                        a.className = 'link-emul' + (isBlackTheme ? ' white-text-color' : '');
                                        a.path = 'root';
                                        a.style.fontWeight = 'bold';
                                        a.onclick = function () {
                                            if (this && this.path) {
                                                //openTreeNode(this.path);
                                                openGridFolder(this.path, true);
                                            }
                                            return false;
                                        };
                                        a.innerHTML = 'root';
                                        hSpanDom.appendChild(a);
                                        var path = '',
                                            aEl, pathP;
                                        for (var i = 0; i < len - 1; i++) {
                                            pathP = pathParts[i];;
                                            hSpanDom.appendChild(document.createTextNode('\\'));
                                            path += (path.length == 0 ? '' : '/') + pathP;
                                            aEl = document.createElement('span'); //('a');
                                            aEl.href = '';
                                            aEl.className = 'link-emul' + (isBlackTheme ? ' white-text-color' : '');
                                            aEl.path = path;
                                            aEl.style.fontWeight = 'bold';
                                            aEl.onclick = function () {
                                                if (this && this.path) {
                                                    //openTreeNode(this.path);
                                                    openGridFolder(this.path, true);
                                                }
                                                return false;
                                            };
                                            aEl.innerHTML = Ext.util.Format.htmlEncode(getFolderTitle(pathP));
                                            hSpanDom.appendChild(aEl);
                                        }
                                        pathP = pathParts[len - 1];
                                        hSpanDom.appendChild(document.createTextNode('\\'));
                                        hSpanDom.appendChild(document.createTextNode(getFolderTitle(pathP)));
                                        if (limits.length > 0) {
                                            //hSpanDom.appendChild(document.createTextNode(limits));
                                            var sl = document.createElement('span');
                                            sl.innerHTML = limits;
                                            hSpanDom.appendChild(sl);
                                        }
                                        hNotSet = false;
                                    }
                                    if (hNotSet) {
                                        var curFolderInfo = '\\' + (needCurFolderEncode
                                            ? Ext.util.Format.htmlEncode(curFolder.replace(/\//g, '\\'))
                                            : curFolder.replace(/\//g, '\\')) + limits;
                                        if (hSpanDom) {
                                            hSpanDom.innerHTML = '';
                                            hSpanDom.appendChild(document.createTextNode(curFolderInfo));
                                        }
                                        hNotSet = false;
                                    }
                                }
                                if (hNotSet) {
                                    var curFolderInfo = (needCurFolderEncode
                                        ? Ext.util.Format.htmlEncode(curFolder) : curFolder) + limits;
                                    if (hSpanDom) {
                                        hSpanDom.innerHTML = '';
                                        hSpanDom.appendChild(document.createTextNode(curFolderInfo));
                                    }
                                }
                                toggleToolbarButtons();

                                // fill used Trash space
                                var usedTrashMsg = null;
                                if (htcConfig.enableTrash && isTrashFolder(curFolder)) {
                                    var trashNode = null,
                                        percent = null,
                                        usedTrashSize = null,
                                        qtip = '',
                                        tmp;
                                    if (tree) {
                                        trashNode = tree.getRootNode().findChild('path', _TRASH_);
                                    }
                                    if (store.reader && store.reader.jsonData &&
                                        Ext.isNumber(store.reader.jsonData.usedbytes)) {
                                        usedTrashSize = store.reader.jsonData.usedbytes;
                                    }
                                    if (Ext.isNumber(htcConfig.trashSize) && htcConfig.trashSize > 0) {
                                        percent = '0%';
                                        if (store.reader.jsonData.usedbytes > 0) {
                                            percent = '' + Math.round((usedTrashSize * 100.) / htcConfig.trashSize) + '%';
                                        }
                                        usedTrashMsg = Ext.util.Format.htmlEncode(String.format(
                                            htcConfig.locData.TrashUsedSpaceHint, percent));
                                    } else if (Ext.isNumber(usedTrashSize)) {
                                        usedTrashMsg = Ext.util.Format.htmlEncode(String.format(htcConfig.locData.TrashUsedSpaceHint,
                                            renderers.sizeRenderer('' + (usedTrashSize < 0 ? 0 : usedTrashSize))));
                                    }
                                    if (!Ext.isEmpty(usedTrashMsg) && trashNode) {
                                        trashNode.setText(Ext.util.Format.htmlEncode(htcConfig.locData.TrashRootTitle)
                                            + '&nbsp;(' + usedTrashMsg + ')');
                                    }
                                    // qtip
                                    if (!Ext.isEmpty(percent)) {
                                        usedTrashMsg = Ext.util.Format.htmlEncode(String.format(htcConfig.locData.TrashLimitSizeHint,
                                            renderers.sizeRenderer('' + (usedTrashSize < 0 ? 0 : usedTrashSize)),
                                            renderers.sizeRenderer('' + htcConfig.trashSize),
                                            percent));
                                        qtip += usedTrashMsg + '<br />';
                                    } else if (Ext.isNumber(usedTrashSize)) {
                                        Ext.util.Format.htmlEncode(String.format(htcConfig.locData.TrashUsedSpaceHint,
                                            renderers.sizeRenderer('' + (usedTrashSize < 0 ? 0 : usedTrashSize))));
                                        qtip += usedTrashMsg + '<br />';
                                    }
                                    if (Ext.isNumber(htcConfig.trashLargeItemSize) && htcConfig.trashLargeItemSize > 0) {
                                        tmp = Ext.util.Format.htmlEncode(String.format(htcConfig.locData.TrashLargeItemsShelfTimeHint,
                                            renderers.sizeRenderer('' + htcConfig.trashLargeItemSize),
                                            htcConfig.trashLargeItemShelfDays));
                                        qtip += tmp;
                                        if (!Ext.isEmpty(usedTrashMsg)) {
                                            usedTrashMsg += '.&nbsp;' + tmp;
                                        } else {
                                            usedTrashMsg += tmp;
                                        }
                                        tmp = Ext.util.Format.htmlEncode(String.format(htcConfig.locData.TrashSmallItemsShelfTimeHint,
                                            htcConfig.trashSmallItemShelfDays));
                                        usedTrashMsg += '.&nbsp;' + tmp;
                                        qtip += '<br />' + tmp;
                                    } else {
                                        tmp = Ext.util.Format.htmlEncode(String.format(htcConfig.locData.TrashItemsShelfTimeHint,
                                            htcConfig.trashSmallItemShelfDays));
                                        qtip += tmp;
                                        if (!Ext.isEmpty(usedTrashMsg)) {
                                            usedTrashMsg += '.&nbsp;' + tmp;
                                        } else {
                                            usedTrashMsg += tmp;
                                        }
                                    }
                                    if (trashNode) {
                                        trashNode.attributes.qtip = qtip;
                                        if (trashNode.rendered && trashNode.ui && trashNode.ui.textNode) {
                                            var tn = trashNode.ui.textNode;
                                            if (tn.setAttributeNS) {
                                                tn.setAttributeNS("ext", "qtip", qtip);
                                            } else {
                                                tn.setAttribute("ext:qtip", qtip);
                                            }
                                        }
                                    }
                                }

                                fillInfoAboutSelectedAndTotalFilesFolders(grid, usedTrashMsg);

                                // change columns if switches between 'Recents' and other folder
                                if (grid.toggledRecent)
                                {
                                    var colModel = grid.getColumnModel(), isRecent = isRecentFolder(),
                                        recentCol = colModel.getColumnById('col-daterecent'),
                                        recentIndex = colModel.getIndexById('col-daterecent'),
                                        modifCol = colModel.getColumnById('col-datemodified'),
                                        modifIndex = colModel.getIndexById('col-datemodified'),
                                        createCol = colModel.getColumnById('col-datecreated'),
                                        createIndex = colModel.getIndexById('col-datecreated'),
                                        accessCol = colModel.getColumnById('col-dateaccessed'),
                                        accessIndex = colModel.getIndexById('col-dateaccessed'),
                                        setColHidden = function (col, idx, hidden) {
                                            if (!!col && idx >= 0) {
                                                col.hideable = !hidden;
                                                colModel.setHidden(idx, hidden
                                                    ? true
                                                    : keepColsOnViewRecents.hasOwnProperty(col.dataIndex)
                                                        ? !keepColsOnViewRecents[col.dataIndex]
                                                        : false, true);
                                            }
                                        };
                                    setColHidden(recentCol, recentIndex, !isRecent);
                                    setColHidden(modifCol, modifIndex, isRecent);
                                    setColHidden(createCol, createIndex, isRecent);
                                    setColHidden(accessCol, accessIndex, isRecent);
                                    grid.getView().refresh(true);
                                }
                            }
                        },
                        load: function (store, records, options) {
                            charsGrid = [];

                            Ext.Ajax.timeout = store.defaultRequestTimeout;

                            var jsonData = {};
                            if (!!store && !!store.reader && Ext.isObject(store.reader.jsonData)) {
                                jsonData = store.reader.jsonData;
                            }

                            //if (!!window.console && !!window.console.log) { // durations
                            //    if (!Ext.isEmpty(jsonData.elapsed)) {
                            //        window.console.log('total elapsed: ' + jsonData.elapsed);
                            //    }
                            //    if (!Ext.isEmpty(jsonData.melapsed)) {
                            //        window.console.log('mdata elapsed: ' + jsonData.melapsed);
                            //    }
                            //}

                            htcConfig.currentPerms = eval("(" + jsonData.permissions + ")");
                            htcConfig.folderDescription = !Ext.isEmpty(jsonData.desc) ? String(jsonData.desc) : '';
                            htcConfig.readmeContent = !Ext.isEmpty(jsonData.readme) ? String(jsonData.readme) : '&nbsp;';

                            if (!jsonData.success) {
                                Msg.show({
                                    title: htcConfig.locData.CommonErrorCaption,
                                    msg: jsonData.tpiid === true
                                        ? String.format(jsonData.msg || 'Unknown error', htcConfig.relativePath || '')
                                        : (jsonData.msg || 'Unknown error'),
                                    icon: Msg.ERROR,
                                    buttons: Msg.OK
                                });
                            }

                            var curFolder = getCurrentFolder();
                            var fIndex = -1;
                            var rowSelected = false;
                            try { // Auto select  item clicked  in search window (selectPath)
                                if (selectPath != null && selectPath.path == curFolder) {
                                    var isTrash = isTrashFolder();
                                    fIndex = gridStore.findBy(function (rec, id) {
                                        return (isTrash ? rec.get('trashname') : rec.get('name')).toLowerCase() == selectPath.name.toLowerCase();
                                    });
                                    if (fIndex >= 0) {
                                        var selModel = grid.getSelectionModel();
                                        if (!selModel.isSelected(fIndex))
                                            selModel.selectRow(fIndex, false);
                                        var row = grid.getView().getRow(fIndex <= 1 ? 0 : fIndex);
                                        if (row) {
                                            row.scrollIntoView();
                                            //grid.getView().focusRow(fIndex <= 1 ? 0 : fIndex);
                                            grid.getView().holdPosition = true;
                                        }
                                        rowSelected = true;
                                    } else if (selectPath.recent === true) {
                                        var pathAndName = selectPath.path;
                                        if (!Ext.isEmpty(selectPath.name)) {
                                            if (Ext.isEmpty(pathAndName)) {
                                                pathAndName = selectPath.name;
                                            } else {
                                                pathAndName += '/' + selectPath.name;
                                            }
                                        }
                                        if (!Ext.isEmpty(pathAndName)) {
                                            Msg.hide();
                                            Msg.alert(htcConfig.locData.CommonErrorCaption,
                                                Ext.util.Format.htmlEncode(String.format(htcConfig.locData.RecentPathNotExist, pathAndName)));
                                        }
                                    }
                                    selectPath = null;
                                }
                            } catch (e) {
                                selectPath = null;
                                ProcessScriptError(e);
                            }

                            if (!!grid && !!detailsPane) {
                                var selModel = grid.getSelectionModel();
                                if (!selModel || !selModel.getSelected()) {
                                    detailsPane.prepareData(null, curFolder);
                                }
                            }

                            if (!!grid) { // Create grid drop target
                                var curPerms = htcConfig.currentPerms;
                                if (!!curPerms) {
                                    grid.enableDragDrop =
                                        (curPerms.zip) ||
                                        (curPerms.del && htcConfig.enableTrash) ||
                                        (curPerms.create && (curPerms.cut || curPerms.copy)) ||
                                        (htcConfig.sharedInTree &&
                                            (
                                                (
                                                    htcConfig.enablePublicLinkToFile &&
                                                    curPerms.download &&
                                                    curPerms.anonymDownload
                                                )
                                                ||
                                                (
                                                    htcConfig.enablePublicLinkToFolder &&
                                                    (
                                                        (
                                                            (curPerms.download || curPerms.zipDownload) &&
                                                            curPerms.anonymDownload
                                                        )
                                                        ||
                                                        (curPerms.upload && curPerms.anonymUpload)
                                                        ||
                                                        (
                                                            (curPerms.listFiles || curPerms.listFolders) &&
                                                            curPerms.anonymViewContent
                                                        )
                                                    )
                                                )
                                            )
                                        );
                                } else {
                                    grid.enableDragDrop = htcConfig.enableTrash;
                                }
                                if (grid.enableDragDrop)
                                    createGridDropTarget(grid);
                                else if (gridDropTarget) {
                                    gridDropTarget.destroy();
                                    gridDropTarget = null;
                                }
                            }

                            if (Ext.isFunction(store.reloadTree)) {
                                store.reloadTree();
                            }
                            store.reloadTree = null;
                        },
                        exception: function (proxy, type, action, options, res, arg) {
                            charsGrid = [];
                            this.reloadTree = null;
                            Ext.Ajax.timeout = gridStore.defaultRequestTimeout;
                            var curFolder = getCurrentFolder();
                            if (type === 'remote') {
                                var message = "Message: " + Ext.util.Format.htmlEncode(res.message);
                                if (res.xhr)
                                    message = "Status: " + Ext.util.Format.htmlEncode(res.xhr.status)
                                        + " " + Ext.util.Format.htmlEncode(res.xhr.statusText)
                                        + "<br />" + message;
                                Msg.show({
                                    title: htcConfig.locData.CommonErrorCaption,
                                    msg: message,
                                    icon: Msg.ERROR,
                                    buttons: Msg.OK
                                });
                            }
                        }
                    }
                });
            } catch (e) {
                ProcessScriptError(e);
            }

            if (htcConfig.sharedInTree) { // store for public links
                try {
                    sharedGridStore = new Ext.data.DirectStore({
                        remoteSort: true,
                        baseParams: { start: 0, limit: pagingEnabled ? htcConfig.itemsPerPage : 0, linkPath: null, selectId: null },
                        paramOrder: ['start', 'limit', 'sort', 'dir', 'linkPath', 'selectId'],
                        directFn: HttpCommander.Common.GetPageWithAnonymLinks,
                        idProperty: 'id',
                        totalProperty: 'total',
                        successProperty: 'success',
                        root: 'data',
                        sortInfo: {
                            field: 'virt_path',
                            direction: 'ASC'
                        },
                        defaultRequestTimeout: Ext.Ajax.timeout,
                        fields:
                        [
                            { name: 'id', type: 'int' },
                            { name: 'key', type: 'string' },
                            { name: 'date', type: 'date', dateFormat: 'timestamp' },
                            { name: 'expires', type: 'date', dateFormat: 'timestamp' },
                            { name: 'withpasswd', type: 'boolean' },
                            { name: 'password', type: 'string' },
                            { name: 'virt_path', type: 'string' },
                            { name: 'acl', type: 'int' },
                            { name: 'downloads', type: 'string' },
                            { name: 'notes', type: 'string' },
                            { name: 'emails', type: 'string' },
                            { name: 'upload_overwrite', type: 'boolean' },
                            { name: 'isfolder', type: 'boolean' },
                            { name: 'access_users', type: 'string' },
                            { name: 'perms', mapping: 'perms' },
                            { name: 'show_comments', type: 'boolean' },
                            // only for pageable requests
                            { name: 'icon', type: 'string' },
                            { name: 'rowtype', type: 'string' },
                            { name: 'icon_large', type: 'string' },
                            { name: 'icon_normal', type: 'string' },
                            { name: 'name', type: 'string' },
                            { name: 'type', type: 'string' },
                            { name: 'url', type: 'string' },
                            { name: 'url2', type: 'string' },
                            { name: 'shortUrl', type: 'string' },
                            { name: 'shortUrl2', type: 'string' }
                        ],
                        listeners: {
                            beforeload: function (store, opts) {
                                Ext.Ajax.timeout = HttpCommander.Lib.Consts.gridRequestTimeout;
                                if (Ext.isObject(sharedSelectPath) && !sharedSelectPath.userSelect) {
                                    this.baseParams.selectId = sharedSelectPath.id;
                                }
                            },
                            datachanged: function (store) {
                                toggleToolbarButtons();
                                var hEl = (sharedGrid ? sharedGrid.header : null),
                                    hSpan = (hEl ? hEl.child('span') : null),
                                    hSpanDom = (hSpan ? hSpan.dom : null);
                                if (hSpanDom) {
                                    hSpanDom.innerHTML = '';
                                    var a = document.createElement('span');
                                    a.className = 'link-emul';
                                    a.path = 'root';
                                    a.onclick = function () {
                                        if (this && this.path) {
                                            openGridFolder(this.path, true);
                                        }
                                        return false;
                                    };
                                    a.innerHTML = 'root';
                                    hSpanDom.appendChild(a);
                                    hSpanDom.appendChild(document.createTextNode('\\'));
                                    hSpanDom.appendChild(document.createTextNode(htcConfig.locData.SharedByLinkRootTitle));
                                }

                                if (pagingEnabled) {
                                    var gbb = sharedGrid.getBottomToolbar();
                                    if (gbb && sharedGridPagingToolBar) {
                                        var pageData = gbb.getPageData();
                                        var totalCount = store.getTotalCount();
                                        var count = store.getCount();
                                        if (store.reader && store.reader.jsonData &&
                                            Ext.isNumber(store.reader.jsonData.position) &&
                                            store.reader.jsonData.position > -1) {
                                            gbb.cursor = store.reader.jsonData.position;
                                            pageData = gbb.getPageData();
                                            var ap = pageData.activePage, ps = pageData.pages;
                                            gbb.afterTextItem.setText(String.format(gbb.afterPageText, pageData.pages));
                                            gbb.inputItem.setValue(ap);
                                            gbb.first.setDisabled(ap == 1);
                                            gbb.prev.setDisabled(ap == 1);
                                            gbb.next.setDisabled(ap == ps);
                                            gbb.last.setDisabled(ap == ps);
                                            gbb.refresh.enable();
                                            gbb.updateInfo();
                                        }
                                        sharedGridPagerInfo.setText(count == 0 ?
                                            htcConfig.locData.PagingToolbarEmptyMsg :
                                            String.format(htcConfig.locData.PagingToolbarDisplayMsg,
                                                gbb.cursor + 1,
                                                gbb.cursor + count,
                                                totalCount)
                                        );
                                        gbb.fireEvent('change', this, pageData);
                                        if (htcConfig.itemsPerPage >= totalCount && pageData.activePage >= 1 && pageData.activePage <= pageData.pages)
                                            gbb.hide();
                                        else
                                            gbb.show();
                                    }
                                }
                            },
                            load: function (store, records, options) {
                                charsGrid = [];
                                Ext.Ajax.timeout = store.defaultRequestTimeout;

                                if (store.reader && store.reader.jsonData && !store.reader.jsonData.success) {
                                    Msg.show({
                                        title: htcConfig.locData.CommonErrorCaption,
                                        msg: store.reader.jsonData.message,
                                        icon: Msg.ERROR,
                                        buttons: Msg.OK
                                    });
                                }

                                htcConfig.currentPerms = null;

                                var fIndex = -1;
                                try { // Auto select  item clicked  in search window (sharedSelectPath)
                                    if (Ext.isObject(sharedSelectPath) && !Ext.isEmpty(sharedSelectPath.id)) {
                                        fIndex = store.findBy(function (rec, id) {
                                            return rec.get('id') == sharedSelectPath.id;
                                        });
                                        if (fIndex >= 0) {
                                            var selModel = sharedGrid.getSelectionModel();
                                            if (!selModel.isSelected(fIndex))
                                                selModel.selectRow(fIndex, false);
                                            sharedGrid.getView().getRow(fIndex).scrollIntoView();
                                            sharedGrid.getView().holdPosition = true;
                                        }
                                        sharedSelectPath = null;
                                    }
                                } catch (e) {
                                    sharedSelectPath = null;
                                    ProcessScriptError(e);
                                }

                                if (!!sharedGrid) { // Create grid drop target
                                    sharedGrid.enableDragDrop =
                                        htcConfig.sharedInTree && htcConfig.enablePublicLinkToFolder;
                                    if (sharedGrid.enableDragDrop)
                                        createSharedGridDropTarget(sharedGrid);
                                    else if (sharedGridDropTarget) {
                                        sharedGridDropTarget.destroy();
                                        sharedGridDropTarget = null;
                                    }
                                }
                            },
                            exception: function (proxy, type, action, options, res, arg) {
                                charsGrid = [];
                                if (sharedGridStore) {
                                    Ext.Ajax.timeout = sharedGridStore.defaultRequestTimeout;
                                }
                                if (type === 'remote') {
                                    var message = "Message: " + Ext.util.Format.htmlEncode(res.message);
                                    if (res.xhr)
                                        message = "Status: " + Ext.util.Format.htmlEncode(res.xhr.status)
                                            + " " + Ext.util.Format.htmlEncode(res.xhr.statusText)
                                            + "<br />" + message;
                                    Msg.show({
                                        title: htcConfig.locData.CommonErrorCaption,
                                        msg: message,
                                        icon: Msg.ERROR,
                                        buttons: Msg.OK
                                    });
                                }
                            }
                        }
                    });
                } catch (e) {
                    ProcessScriptError(e);
                }
            }

            if (htcConfig.sharedForYou) { // store for public links shared for you
                try {
                    sharedFYGridStore = new Ext.data.DirectStore({
                        remoteSort: true,
                        baseParams: { start: 0, limit: pagingEnabled ? htcConfig.itemsPerPage : 0, selectId: null },
                        paramOrder: ['start', 'limit', 'sort', 'dir', 'selectId'],
                        directFn: HttpCommander.Common.GetSharedForYouAnonymLinks,
                        sharedForYou: true,
                        idProperty: 'id',
                        totalProperty: 'total',
                        successProperty: 'success',
                        root: 'data',
                        sortInfo: {
                            field: 'virtpath',
                            direction: 'ASC'
                        },
                        defaultRequestTimeout: Ext.Ajax.timeout,
                        fields:
                        [
                            { name: 'id', type: 'int' },
                            { name: 'key', type: 'string' },
                            { name: 'date', type: 'date', dateFormat: 'timestamp' },
                            { name: 'expires', type: 'date', dateFormat: 'timestamp' },
                            { name: 'withpasswd', type: 'boolean' },
                            //{ name: 'password', type: 'string' },
                            { name: 'virt_path', type: 'string' },
                            { name: 'acl', type: 'int' },
                            //{ name: 'downloads', type: 'string' },
                            { name: 'notes', type: 'string' },
                            //{ name: 'emails', type: 'string' },
                            { name: 'upload_overwrite', type: 'boolean' },
                            { name: 'isfolder', type: 'boolean' },
                            { name: 'show_comments', type: 'boolean' },
                            //{ name: 'access_users', type: 'string' },
                            { name: 'perms', mapping: 'perms' },
                            { name: 'url', type: 'string' },
                            { name: 'url2', type: 'string' },
                            { name: 'shortUrl', type: 'string' },
                            { name: 'shortUrl2', type: 'string' },
                            // only for pageable requests
                            { name: 'icon', type: 'string' },
                            { name: 'rowtype', type: 'string' },
                            { name: 'icon_large', type: 'string' },
                            { name: 'icon_normal', type: 'string' },
                            { name: 'name', type: 'string' },
                            { name: 'type', type: 'string' }
                        ],
                        listeners: {
                            beforeload: function (store, opts) {
                                Ext.Ajax.timeout = HttpCommander.Lib.Consts.gridRequestTimeout;
                                if (Ext.isObject(sharedFYSelectPath) && !sharedFYSelectPath.userSelect) {
                                    this.baseParams.selectId = sharedFYSelectPath.id;
                                }
                            },
                            datachanged: function (store) {
                                toggleToolbarButtons();
                                var hEl = (sharedFYGrid ? sharedFYGrid.header : null),
                                    hSpan = (hEl ? hEl.child('span') : null),
                                    hSpanDom = (hSpan ? hSpan.dom : null);
                                if (hSpanDom) {
                                    hSpanDom.innerHTML = '';
                                    var a = document.createElement('span');
                                    a.className = 'link-emul';
                                    a.path = 'root';
                                    a.onclick = function () {
                                        if (this && this.path) {
                                            openGridFolder(this.path, true);
                                        }
                                        return false;
                                    };
                                    a.innerHTML = 'root';
                                    hSpanDom.appendChild(a);
                                    hSpanDom.appendChild(document.createTextNode('\\'));
                                    hSpanDom.appendChild(document.createTextNode(htcConfig.locData.SharedForYouRootTitle));
                                }

                                if (pagingEnabled) {
                                    var gbb = sharedFYGrid.getBottomToolbar();
                                    if (gbb && sharedFYGridPagingToolBar) {
                                        var pageData = gbb.getPageData();
                                        var totalCount = store.getTotalCount();
                                        var count = store.getCount();
                                        if (store.reader && store.reader.jsonData &&
                                            Ext.isNumber(store.reader.jsonData.position) &&
                                            store.reader.jsonData.position > -1) {
                                            gbb.cursor = store.reader.jsonData.position;
                                            pageData = gbb.getPageData();
                                            var ap = pageData.activePage, ps = pageData.pages;
                                            gbb.afterTextItem.setText(String.format(gbb.afterPageText, pageData.pages));
                                            gbb.inputItem.setValue(ap);
                                            gbb.first.setDisabled(ap == 1);
                                            gbb.prev.setDisabled(ap == 1);
                                            gbb.next.setDisabled(ap == ps);
                                            gbb.last.setDisabled(ap == ps);
                                            gbb.refresh.enable();
                                            gbb.updateInfo();
                                        }
                                        sharedFYGridPagerInfo.setText(count == 0 ?
                                            htcConfig.locData.PagingToolbarEmptyMsg :
                                            String.format(htcConfig.locData.PagingToolbarDisplayMsg,
                                                gbb.cursor + 1,
                                                gbb.cursor + count,
                                                totalCount)
                                        );
                                        gbb.fireEvent('change', this, pageData);
                                        if (htcConfig.itemsPerPage >= totalCount && pageData.activePage >= 1 && pageData.activePage <= pageData.pages)
                                            gbb.hide();
                                        else
                                            gbb.show();
                                    }
                                }
                            },
                            load: function (store, records, options) {
                                charsGrid = [];
                                Ext.Ajax.timeout = store.defaultRequestTimeout;

                                if (store.reader && store.reader.jsonData && !store.reader.jsonData.success) {
                                    Msg.show({
                                        title: htcConfig.locData.CommonErrorCaption,
                                        msg: store.reader.jsonData.message,
                                        icon: Msg.ERROR,
                                        buttons: Msg.OK
                                    });
                                }

                                htcConfig.currentPerms = null;

                                var fIndex = -1;
                                try { // Auto select  item clicked  in search window (sharedSelectPath)
                                    if (Ext.isObject(sharedFYSelectPath) && !Ext.isEmpty(sharedFYSelectPath.id)) {
                                        fIndex = store.findBy(function (rec, id) {
                                            return rec.get('id') == sharedFYSelectPath.id;
                                        });
                                        if (fIndex >= 0) {
                                            var selModel = sharedFYGrid.getSelectionModel();
                                            if (!selModel.isSelected(fIndex))
                                                selModel.selectRow(fIndex, false);
                                            sharedFYGrid.getView().getRow(fIndex).scrollIntoView();
                                            sharedFYGrid.getView().holdPosition = true;
                                        }
                                        sharedFYSelectPath = null;
                                    }
                                } catch (e) {
                                    sharedFYSelectPath = null;
                                    ProcessScriptError(e);
                                }
                            },
                            exception: function (proxy, type, action, options, res, arg) {
                                charsGrid = [];
                                if (sharedFYGridStore) {
                                    Ext.Ajax.timeout = sharedFYGridStore.defaultRequestTimeout;
                                }
                                if (type === 'remote') {
                                    var message = "Message: " + Ext.util.Format.htmlEncode(res.message);
                                    if (res.xhr)
                                        message = "Status: " + Ext.util.Format.htmlEncode(res.xhr.status)
                                            + " " + Ext.util.Format.htmlEncode(res.xhr.statusText)
                                            + "<br />" + message;
                                    Msg.show({
                                        title: htcConfig.locData.CommonErrorCaption,
                                        msg: message,
                                        icon: Msg.ERROR,
                                        buttons: Msg.OK
                                    });
                                }
                            }
                        }
                    });
                } catch (e) {
                    ProcessScriptError(e);
                }
            }

            try { // grid columns and filters
                var uccs = [], uccsLength = 0;
                try {
                    var ucc = HttpCommander.Lib.Utils.getCookie($("columns"));
                    if (!Ext.isEmpty(ucc) && Ext.isString(ucc)) {
                        ucc = ucc.split(',');
                        if (ucc.length > 0) {
                            Ext.each(ucc, function (uccItem, uccIndex) {
                                if (!Ext.isEmpty(uccItem)) {
                                    var uci = uccItem.split(':'); // '<dataIndex>:<width>:<visibility:true|false>'
                                    if (uci.length > 0) {
                                        var uColW = uci.length > 1 ? parseInt(uci[1], 10) : 0;
                                        var uColN = uci[0];
                                        var uColH = ((uci.length > 2 && uci[2] === 'false') || (uColW <= 0)) ? true : false;
                                        if (!Ext.isEmpty(uColN) && uColN.trim().length > 0) {
                                            var uCol = {
                                                name: uColN.toLowerCase(),
                                                hidden: uColH
                                            }
                                            if (uColW > 0) {
                                                uCol.width = uColW;
                                            }
                                            uccs.push(uCol);
                                        }
                                    }
                                }
                            });
                        }
                    }
                } catch (e) { }
                uccsLength = uccs.length;
                Ext.each(htcConfig.fileListColumns, function (col) {
                    if ((col.state & 2) || (col.name == 'daterecent')) {
                        var ff = { dataIndex: col.name, type: col.type };
                        var gf = { dataIndex: col.name, id: 'col-' + col.name };
                        if (col.width > 0)
                            gf["width"] = col.width;
                        if (col.type === 'date') {
                            ff['afterText'] = htcConfig.locData.AfterDateFilterText;
                            ff['beforeText'] = htcConfig.locData.BeforeDateFilterText;
                            ff['onText'] = htcConfig.locData.OnDateFilterText;
                            gf['width'] = gf["width"] || 140;
                            gf['renderer'] = renderers.dateRendererWithQTip;
                            switch (col.name) {
                                case 'datemodified':
                                    gf['header'] = htcConfig.locData.CommonFieldLabelDateModified;
                                    break;
                                case 'datecreated':
                                    gf['header'] = htcConfig.locData.CommonFieldLabelDateCreated;
                                    break;
                                case 'dateaccessed':
                                    gf['header'] = htcConfig.locData.CommonFieldLabelDateAccessed;
                                    break;
                                case 'daterecent':
                                    gf['header'] = htcConfig.locData.CommonFieldLabelDate;
                                    //gf['menuDisabled'] = true;
                                    gf['hideable'] = false;
                                    break;
                            }
                        } else if (col.name == 'size') {
                            ff['type'] = 'numeric';
                            ff['menuItemCfgs'] = { emptyText: htcConfig.locData.EmptyTextFilter };
                            gf['header'] = htcConfig.locData.CommonFieldLabelSize;
                            gf['width'] = gf['width'] || 70;
                            gf['renderer'] = renderers.sizeRenderer;
                        } else {
                            ff['emptyText'] = htcConfig.locData.EmptyTextFilter;
                            switch (col.name) {
                                case 'name':
                                    gf['header'] = htcConfig.locData.CommonFieldLabelName;
                                    gf['width'] = gf['width'] || 200;
                                    gf['id'] = 'name';
                                    gf['renderer'] = renderers.nameRenderer;
                                    gf['editor'] = new Ext.form.TextField({
                                        width: 100,
                                        listeners: {
                                            show: function (edt) {
                                                if (!edt || !edt.getValue)
                                                    return;
                                                var selTFM = getSelTypeFilesModel(grid),
                                                    isFile = selTFM && selTFM['selType'] == 'file',
                                                    val = String(edt.getValue()),
                                                    dot = isFile ? val.lastIndexOf('.') : val.length;
                                                edt.selectText(0, dot < 0 ? val.length : dot);
                                            }
                                        }
                                    });
                                    break;
                                case 'type':
                                    gf['header'] = htcConfig.locData.CommonFieldLabelType;
                                    gf['width'] = gf['width'] || 140;
                                    gf['renderer'] = renderers.qtipCellRenderer;
                                    break;
                                case 'labels':
                                    gf['dataIndex'] = 'label';
                                    gf['header'] = htcConfig.locData.CommonFieldLabelLabels;
                                    gf['width'] = gf['width'] || 120;
                                    gf['sortable'] = false; // TODO
                                    gf['renderer'] = renderers.labelRenderer;
                                    break;
                                case 'downloads':
                                    ff['type'] = 'numeric';
                                    ff['menuItemCfgs'] = { emptyText: htcConfig.locData.EmptyTextFilter };
                                    gf['header'] = htcConfig.locData.AmountOfDownloadingsFile;
                                    gf['width'] = gf['width'] || 70;
                                    gf['renderer'] = function (d) { return (!Ext.isNumber(d) || d <= 0) ? '' : String(d); };
                                    break;
                                default:
                                    var colHeader = col.header;
                                    if (colHeader.toLowerCase() == 'comment') {
                                        colHeader = htcConfig.locData.CommonFieldLabelComments;
                                    } else if (colHeader.toLowerCase() == 'description') {
                                        colHeader = htcConfig.locData.CommonFieldLabelDescription;
                                    }
                                    gf['header'] = Ext.util.Format.htmlEncode(colHeader);
                                    gf['renderer'] = renderers.qtipCellRenderer;
                                    break;
                            }
                        }
                        if (col.name != 'labels') {
                            listFilters.push(ff);
                        }
                        if (!(col.state & 4)) {
                            gf['hidden'] = true;
                        }
                        if (uccsLength > 0) {
                            var uColFound = false;
                            for (var k = 0; k < uccsLength; k++) {
                                if (uccs[k].name == gf['dataIndex'].toLowerCase()) {
                                    gf['hidden'] = uccs[k].hidden;
                                    if (uccs[k].width > 0) {
                                        gf['width'] = uccs[k].width;
                                    }
                                    uColFound = true;
                                    break;
                                }
                            }
                            if (!uColFound) {
                                gf['hidden'] = true;
                            }
                        }
                        if (col.name == 'daterecent') {
                            gf['hidden'] = true;
                        }
                        if (keepColsOnViewRecents.hasOwnProperty(col.name)) {
                            keepColsOnViewRecents[col.name] = !gf['hidden'];
                        }
                        gridColumns.push(gf);
                    }
                });
                var allColsHidden = true, nameIndex = -1;
                for (var k = 0; k < gridColumns.length; k++) {
                    if (!gridColumns[k].hidden) {
                        allColsHidden = false;
                        break;
                    } else if (gridColumns[k].dataIndex == 'name') {
                        nameIndex = k;
                    }
                }
                if (allColsHidden && gridColumns.length > 0) {
                    if (nameIndex < 0) {
                        nameIndex = 0;
                    }
                    gridColumns[nameIndex].hidden = false;
                }
                if (uccsLength > 0) {
                    var sortedGridColumns = [];
                    for (var k = 0; k < uccsLength; k++) {
                        var gcLength = gridColumns.length;
                        for (var l = 0; l < gcLength; l++) {
                            if (gridColumns[l].dataIndex.toLowerCase() == uccs[k].name) {
                                sortedGridColumns.push(gridColumns[l]);
                                gridColumns.splice(l, 1);
                                break;
                            }
                        }
                    }
                    for (var k = 0; k < gridColumns.length; k++) {
                        sortedGridColumns.push(gridColumns[k]);
                    }
                    gridColumns = sortedGridColumns;
                }
                gridFilters = new Ext.ux.grid.GridFilters({
                    menuFilterText: htcConfig.locData.MenuFilterText,
                    encode: false,
                    local: true,
                    filters: listFilters
                });
            } catch (e) {
                ProcessScriptError(e);
            }

            var setGridView = function () {
                var gridView = typeof (grid) != 'undefined' ? grid.getView() : null;
                if (gridView) {
                    var viewStateFromQueryString = getParamValue('defaultGridView', 'string', null, true);
                    var viewState = null;
                    if (viewStateFromQueryString && (viewStateFromQueryString.toLowerCase() == 'thumbnails' ||
                            viewStateFromQueryString.toLowerCase() == 'detailed'))
                        viewState = viewStateFromQueryString;
                    else
                        viewState = (toptbarButtons['View'] ? HttpCommander.Lib.Utils.getCookie($("htcgridview")) : undefined) || htcConfig.defaultGridView;
                    var thumbView = typeof (thumbnailTpl) != 'undefined' && viewState == 'thumbnails';
                    gridView.tpl = thumbView ? thumbnailTpl : null;
                    gridView.refresh(true);
                    currentGridView = thumbView ? 'thumbnails' : 'detailed';
                }
            };

            try { // grid and toolbars
                gridPagingToolBar = new Ext.PagingToolbar({
                    pageSize: htcConfig.itemsPerPage,
                    store: gridStore,
                    beforePageText: htcConfig.locData.PagingToolbarBeforePageText,
                    afterPageText: htcConfig.locData.PagingToolbarAfterPageText,
                    firstText: htcConfig.locData.PagingToolbarFirstText,
                    prevText: htcConfig.locData.PagingToolbarPrevText,
                    nextText: htcConfig.locData.PagingToolbarNextText,
                    lastText: htcConfig.locData.PagingToolbarLastText,
                    displayMsg: htcConfig.locData.PagingToolbarDisplayMsg,
                    refreshText: htcConfig.locData.CommandRefresh,
                    emptyMsg: htcConfig.locData.PagingToolbarEmptyMsg,
                    cls: 'x-grid3-cell-text',
                    items:
                    [
                        '->',
                        gridPagerInfo = new Ext.form.Label({
                            text: htcConfig.locData.PagingToolbarEmptyMsg,
                            cls: 'x-grid3-cell-text'
                        })
                    ]
                });
                if (sharedGridStore) {
                    sharedGridPagingToolBar = new Ext.PagingToolbar({
                        pageSize: htcConfig.itemsPerPage,
                        store: sharedGridStore,
                        beforePageText: htcConfig.locData.PagingToolbarBeforePageText,
                        afterPageText: htcConfig.locData.PagingToolbarAfterPageText,
                        firstText: htcConfig.locData.PagingToolbarFirstText,
                        prevText: htcConfig.locData.PagingToolbarPrevText,
                        nextText: htcConfig.locData.PagingToolbarNextText,
                        lastText: htcConfig.locData.PagingToolbarLastText,
                        displayMsg: htcConfig.locData.PagingToolbarDisplayMsg,
                        refreshText: htcConfig.locData.CommandRefresh,
                        emptyMsg: htcConfig.locData.PagingToolbarEmptyMsg,
                        cls: 'x-grid3-cell-text',
                        items:
                        [
                            '->',
                            sharedGridPagerInfo = new Ext.form.Label({
                                text: htcConfig.locData.PagingToolbarEmptyMsg,
                                cls: 'x-grid3-cell-text'
                            })
                        ]
                    });
                }
                gridStdToolBar = [gridItemsInfo = new Ext.form.Label({
                    html: '&nbsp;',
                    cls: 'x-grid3-cell-text'
                })];
                if (htcConfig.enableTrash) {
                    gridStdToolBar.push(trashInfo = new Ext.form.Label({
                        html: '&nbsp;',
                        cls: 'x-grid3-cell-text',
                        hidden: true
                    }));
                }
                fm.editOrViewPublicLinks = editOrViewPublicLinks;
                fm.gridRowAction = gridRowAction;
                fm.sharedGridRowAction = sharedGridRowAction;
                fm.sharedFYGridRowAction = sharedFYGridRowAction;
                fm.viewChangeDetails = function (index, comments) {
                    if (menuActions && initMetadata)
                        menuActions.viewChangeDetails(initMetadata, index, comments);
                };
                fm.viewWatch = function (index) {
                    if (menuActions && htcConfig.watchForModifs === true) {
                        menuActions.viewWatch(index);
                    }
                };
                fm.versionHistory = function (index) {
                    if (htcConfig && htcConfig.enableVersionControl && grid
                            && menuActions && initVersionHistory && typeof index != 'undefined') {
                        try {
                            var rec = grid.getStore().getAt(index);
                            if (rec.data.rowtype === 'file') {
                                var fileInfo = { path: getCurrentFolder(), name: rec.data.name };
                                if (!versionHistoryWindow)
                                    versionHistoryWindow = initVersionHistory(fileInfo);
                                if (versionHistoryWindow) {
                                    menuActions.versionHistory(fileInfo, versionHistoryWindow);
                                }
                            }
                        } catch (e) {
                            // ignore
                        }
                    }
                };
                var sortChanged = function (sortInfo) {
                    var si = null, isRcnt = isRecentFolder(), isDateRecent = false;
                    if (Ext.isObject(sortInfo) && !Ext.isEmpty(sortInfo.field) && 
                        Ext.isString(sortInfo.field) && sortInfo.field.trim().length > 0) {
                        si = sortInfo.field + ':';
                        if (isRcnt) {
                            isDateRecent = (sortInfo.field == 'daterecent');
                        }
                        var dir = '';
                        if (Ext.isString(sortInfo.direction)) {
                            dir = sortInfo.direction;
                        }
                        if (Ext.isEmpty(dir)) {
                            dir = 'ASC';
                        }
                        dir = dir.toUpperCase();
                        if (dir != 'ASC' && dir != 'DESC') {
                            dir = 'ASC';
                        }
                        si += dir;
                        if (!isDateRecent) {
                            keepGridSort = {
                                'sort': sortInfo.field,
                                'dir': dir
                            };
                        }
                    }
                    if (!Ext.isEmpty(si)) {
                        if (!isDateRecent) {
                            HttpCommander.Lib.Utils.setCookie($("sortinfo"), si);
                        }
                    } else {
                        HttpCommander.Lib.Utils.deleteCookie($("sortinfo"));
                    }
                };
                var columnsChanged = function (cm) {
                    var cols = cm ? cm.config : null,
                        vCols = [], w, isRcnt = isRecentFolder();
                    if (Ext.isArray(cols)) {
                        Ext.each(cols, function (item, index) {
                            if (Ext.isObject(item) && (w = cm.getColumnWidth(index)) > 0 && !Ext.isEmpty(item.dataIndex)) {
                                var vis = !cm.isHidden(index);
                                if (isRcnt) {
                                    if (item.dataIndex == 'datarecent') {
                                        //TODO: do not keep visibility of 'daterecent' column
                                    }
                                    if (keepColsOnViewRecents.hasOwnProperty(item.dataIndex)) {
                                        vis = keepColsOnViewRecents[item.dataIndex];
                                    }
                                }
                                vCols.push(item.dataIndex.toLowerCase() + ':' + w + ':' + (vis ? 'true' : 'false'));
                                if (keepColsOnViewRecents.hasOwnProperty(item.dataIndex)) {
                                    keepColsOnViewRecents[item.dataIndex] = vis;
                                }
                            }
                        });
                    }
                    if (vCols.length > 0) {
                        HttpCommander.Lib.Utils.setCookie($("columns"), vCols.join(','));
                    } else {
                        HttpCommander.Lib.Utils.deleteCookie($("columns"));
                    }
                };

                var handleKeyPress = function (e) {
                    var ch = HttpCommander.Lib.Utils.getChar(e), idx,
                        grd = ((!!sharedGrid && sharedGrid.rendered && !sharedGrid.hidden) ? sharedGrid
                            : (!!sharedFYGrid && sharedFYGrid.rendered && !sharedFYGrid.hidden) ? sharedFYGrid : grid),
                        sm = (grd ? grd.getSelectionModel() : null),
                        st = (grd ? grd.getStore() : null),
                        data = (st ? st.data : null),
                        view = (grd ? grd.getView() : null),
                        startIndex = 0, len, i, dt, row;
                    if (Ext.isEmpty(ch)) {
                        charsGrid = [];
                    } else if (!Ext.isEmpty(ch) && grd && sm && data) {
                        ch = ch.toLowerCase();
                        len = sm.getSelections().length;
                        if (len > 0) {
                            startIndex = (st.indexOf(sm.getSelections()[len - 1]) + 1);
                        }

                        len = charsGrid.length;
                        if (!len || ((charsGrid[len - 1]).ch == ch) ||
                            (((new Date()).getTime() - (charsGrid[len - 1]).date) >= 1500)) {
                            charsGrid = [];
                        }
                        charsGrid.push({ ch: ch, date: (new Date()).getTime() });

                        ch = '';
                        Ext.each(charsGrid, function (item) {
                            ch += item.ch;
                        });

                        idx = st.findBy(function (rec) {
                            return rec.get('name').toLowerCase().indexOf(ch) == 0 && rec.data.rowtype != 'uplink';
                        }, st, startIndex);
                        if (idx < 0 && startIndex > 0) {
                            idx = st.findBy(function (rec) {
                                return rec.data.name.toLowerCase().indexOf(ch) == 0 && rec.data.rowtype != 'uplink';
                            });
                        }

                        if (idx >= 0 && !sm.isSelected(idx)) {
                            sm.selectRow(idx, false);
                            view = grd.getView();
                            view.getRow(idx).scrollIntoView();
                            view.holdPosition = true;
                        }
                    }
                };

                var mainGridSelectionChange = function (model) {
                    //if (debugmode && !!window.console && !!window.console.log) {
                    //    window.console.log('sel changed for row ' + model.last);
                    //}
                    toggleToolbarButtons();
                    fillInfoAboutSelectedAndTotalFilesFolders(grid);
                    // keep selected first item to higlight after refresh
                    var sel = model ? model.getSelected() : null;
                    var curFolder = getCurrentFolder();
                    if (sel && sel.data) {
                        selectPath = {
                            name: !Ext.isEmpty(sel.data.trashname) ? sel.data.trashname : sel.data.name,
                            path: curFolder,
                            userSelect: true
                        };
                    }
                    if (!!detailsPane) {
                        detailsPane.prepareData.call(detailsPane, sel, curFolder);
                    }
                    if (!!metadataWindow && metadataWindow.rendered && !metadataWindow.hidden && !metadataWindow.modal) {
                        metadataWindow.onSelectingChanged.call(metadataWindow, sel, curFolder);
                    }
                };

                //window[$('gridRowAction')] = gridRowAction;
                grid = new Ext.grid.EditorGridPanel({
                    view: new HttpCommander.Lib.ThumbView({
                        'htcUid': uid,
                        'htcCfg': htcConfig,
                        'maxWidthThumb': maxWidthThumb,
                        'maxHeightThumb': maxHeightThumb
                    }),
                    enableDragDrop: true,
                    ddText: htcConfig.locData.GridDDSelectedRowsText,
                    ddGroup: $('GridDD'),
                    stripeRows: false,
                    region: 'center',
                    header: false,
                    tbar: {
                        enableOverflow: false,
                        ctCls: 'x-panel',
                        cls: 'x-panel-header x-tree-node',
                        items: [' ', {
                            itemId: 'path-info',
                            xtype: 'container',
                            cls: 'x-tree-node' + (isBlackTheme ? ' white-text-color'  : ''),
                            style: {
                                fontWeight: 'bold',
                                overflow: 'visible !important',
                                maxWidth: '50px'
                            },
                            html: '&nbsp;'
                        }, '->', {
                            id: $('quick-search-by-name-fld'),
                            ctCls: 'x-form-quick-search-wrap' + (!htcConfig.searchCriterions.content && Ext.isGecko ? '-ie' : ''),
                            hidden: !htcConfig.searchEnabled,
                            xtype: htcConfig.searchCriterions.content ? 'textfield' : 'searchfield',
                            width: htcConfig.searchCriterions.content ? 120 : 137,
                            emptyText: htcConfig.locData.QuerySearchByNameText,
                            searchHandler: function (field, nameValue) {
                                initAndShowSearch(nameValue);
                            },
                            listeners: {
                                specialkey: htcConfig.searchCriterions.content ? function (f, e) {
                                    var cmp2 = Ext.getCmp($('quick-search-by-content-fld'));
                                    if (!cmp2) {
                                        return;
                                    }
                                    var k = e.getKey();
                                    if (k == e.ENTER) {
                                        cmp2.onTrigger2Click.call(cmp2);
                                    } else if (k == e.ESC) {
                                        cmp2.onTrigger1Click.call(cmp2);
                                    }
                                } : Ext.emptyFn
                            }
                        }, {
                            id: $('quick-search-by-content-fld'),
                            xtype: 'searchfield',
                            style: {
                                borderLeftWidth: '0px'
                            },
                            ctCls: 'x-form-quick-search-wrap' + (Ext.isGecko ? '-ie' : ''),
                            firstFieldId: $('quick-search-by-name-fld'),
                            hidden: !htcConfig.searchEnabled || !htcConfig.searchCriterions.content,
                            emptyText: htcConfig.locData.QuerySearchByConentText,
                            width: 137,
                            searchHandler: function (field, contentValue, nameValue) {
                                initAndShowSearch(nameValue, contentValue);
                            }
                        }, ' ']
                    },
                    buttonAlign: 'left',
                    footer: true,
                    minColumnWidth: 70,
                    loadMask: globalLoadMask,
                    plugins: [gridFilters],
                    keys:
                    {
                        key:
                        [
                            Ext.EventObject.ENTER,
                            Ext.EventObject.HOME,
                            Ext.EventObject.END,
                            Ext.EventObject.DELETE,
                            Ext.EventObject.BACKSPACE
                        ],
                        fn: function (e, obj) {
                            if (obj && obj.target && obj.target.id) {
                                if (obj.target.id.indexOf('quick-search-by') >= 0) {
                                    return true;
                                }
                            }
                            var sm = grid.getSelectionModel();
                            if (sm) {
                                switch (e) {
                                    case Ext.EventObject.ENTER:
                                        if (sm.getCount() == 1)
                                            gridRowAction(grid.getStore().indexOf(sm.getSelected()), e);
                                        break;
                                    case Ext.EventObject.HOME:
                                        sm.selectRow(getCurrentFolder() == 'root' || !htcConfig.showUpLink ? 0 : 1);
                                        break;
                                    case Ext.EventObject.END:
                                        sm.selectLastRow();
                                        break;
                                    case Ext.EventObject.DELETE:
                                        if (menuActions && htcConfig.currentPerms && htcConfig.currentPerms.del) {
                                            var selTFM = getSelTypeFilesModel(grid);
                                            var selType = selTFM['selType'];
                                            if (selType != 'empty' && selType != 'none') {
                                                menuActions.deleteSelectedItems();
                                            }
                                        }
                                        break;
                                    case Ext.EventObject.BACKSPACE:
                                        var curFolder = getCurrentFolder();
                                        if (curFolder !== 'root') {
                                            openUpLink(curFolder);
                                        }
                                        break;
                                }
                            }
                        }
                    },
                    selModel: new Ext.grid.RowSelectionModel({
                        moveEditorOnEnter: false,
                        listeners: {
                            beforerowselect: function (model, index, keep, record) {
                                if (record.data.rowtype == "uplink")
                                    return false;
                            },
                            selectionchange: function (model) {
                                (mainGridSelectionChange.debounce(200))(model); //TODO: change debounce delay
                            }
                        }
                    }),
                    fbar: gridStdToolBar,
                    bbar: pagingEnabled ? gridPagingToolBar : undefined,
                    store: gridStore,
                    autoExpandColumn: isEmbeddedtoIFRAME ? '' : 'name',
                    autoExpandMin: 70,
                    colModel: (gridColModel = new Ext.grid.ColumnModel({
                        defaults: { sortable: true },
                        columns: gridColumns
                    })),
                    renameImpl: function (renameInfo, e) {
                        globalLoadMask.msg = htcConfig.locData.ProgressRenaming + "...";
                        globalLoadMask.show();
                        HttpCommander.Common.Rename(renameInfo, function (data, trans) {
                            globalLoadMask.hide();
                            globalLoadMask.msg = htcConfig.locData.ProgressLoading + "...";
                            if (typeof data == 'undefined') {
                                e.record.reject();
                                Msg.alert(htcConfig.locData.CommonErrorCaption, trans.message);
                                return;
                            }
                            if (data.success) {
                                e.record.data.name = renameInfo["newName"];
                                e.record.commit();
                                showBalloon(htcConfig.locData.BalloonRenamedSuccessfully);
                                if (e.record.data.rowtype !== 'folder' && typeof data.icon != 'undefined') {
                                    e.record.data.icon = data.icon;
                                    e.record.data.type = data.type;
                                    e.record.commit();
                                }
                                if (data.warning !== true) {
                                    if (!Ext.isEmpty(renameInfo["newName"]) &&
                                        !Ext.isEmpty(renameInfo["path"])) {
                                        selectPath = {
                                            name: renameInfo["newName"],
                                            path: renameInfo["path"]
                                        };
                                    }
                                    if (e.record.data.rowtype === 'folder') {
                                        openGridFolder(renameInfo["path"], true, true);
                                    } else {
                                        openGridFolder(renameInfo["path"]);
                                    }
                                }
                            } else {
                                e.record.reject();
                                if (data.newname) {
                                    Msg.confirm(
                                        htcConfig.locData.CommandRename,
                                        data.message,
                                        function (btnConfirm) {
                                            if (btnConfirm == 'yes') {
                                                if (renameInfo["type"] == 'file')
                                                    renameInfo["newName"] = data.newname;
                                                else
                                                    renameInfo["merge"] = true;
                                                grid.renameImpl(renameInfo, e);
                                            }
                                        },
                                        grid
                                    );
                                } else {
                                    Msg.alert(htcConfig.locData.CommonErrorCaption, data.message);
                                }
                                return;
                            }
                            if (data.warning === true) {
                                showRefreshWarning();
                            }
                        });
                    },
                    listeners: {
                        resize: function (grd, adjWidth, adjHeight, rawWidth, rawHeight) {
                            grd.getView().refresh(true);
                        },
                        columnmove: function (oldIndex, newIndex) {
                            grid.getView().refresh(true);
                            columnsChanged(grid.getColumnModel());
                        },
                        columnresize: function (oldIndex, newIndex) {
                            grid.getView().refresh(true);
                            columnsChanged(grid.getColumnModel());
                        },
                        sortchange: function (grd, sortInfo) {
                            sortChanged(sortInfo);
                        },
                        render: function (grd) {
                            grd.getColumnModel().on("hiddenchange", function (cm, columnIndex, hidden) {
                                grid.getView().refresh(true);
                                columnsChanged(cm);
                            });
                            setGridView();
                            Ext.dd.ScrollManager.register(grd.getView().getEditorParent());
                        },
                        beforedestroy: function (grd) {
                            Ext.dd.ScrollManager.unregister(grd.getView().getEditorParent());
                        },
                        afterrender: function (grd) {
                            if (gridDropTarget)
                                gridDropTarget.destroy();
                            gridDropTarget = null;
                            createGridDropTarget(grd);
                            var gbtb = null;
                            if (grd.getBottomToolbar && (gbtb = grd.getBottomToolbar()))
                                gbtb.hide();
                        },
                        rowcontextmenu: function (grd, index, e) {
                            var curFolder = getCurrentFolder();
                            if (isRecentFolder(curFolder) && !isRecentFolder(curFolder, true))
                                return;
                            var selModel = grd.getSelectionModel();
                            if (!selModel.isSelected(index))
                                selModel.selectRow(index, false);
                            fileMenu.showAt(e.getXY());
                        },
                        containercontextmenu: function (grd, e) {
                            if (grd && grd.editing === true && e && e.target && e.target.tagName
                                    && e.target.tagName.match(/INPUT|TEXTAREA/i)) {
                                return false;
                            }
                            var curFolder = getCurrentFolder();
                            grd.getSelectionModel().clearSelections();
                            if (isRecentFolder(curFolder) && !isRecentFolder(curFolder, true))
                                return;
                            fileMenu.showAt(e.getXY());
                        },
                        containerclick: function (grd, e) {
                            grd.getSelectionModel().clearSelections();
                        },
                        containerdblclick: function (grd, e) {
                            var curFolder = getCurrentFolder();
                            grd.getSelectionModel().clearSelections();
                            if (isRecentFolder(curFolder) && !isRecentFolder(curFolder, true))
                                return false;
                            fileMenu.showAt(e.getXY());
                        },
                        rowdblclick: function (grd, index, e) {
                            var record = grd.getStore().getAt(index);
                            if (record.data.srowtype == 'trash') {
                                return false;
                            }
                            if (itemDoubleClickEventDefined &&
                                (record.data.rowtype == 'folder' || record.data.rowtype == 'rootfolder' || record.data.rowtype == 'file')) {
                                var itemPath = record.data.rowtype == 'rootfolder' ? record.data.name : (getCurrentFolder() + '/' + record.data.name);
                                onItemDoubleClick(itemPath);
                            } else {
                                gridRowAction(index, e);
                            }
                        },
                        beforeedit: function (e) {
                            return allowEdit;
                        },
                        afteredit: function (e) {
                            if (e.record.data.rowtype === 'file' && !isExtensionAllowed(e.value, false)) {
                                e.record.reject();
                                Msg.alert(htcConfig.locData.CommonErrorCaption, getRestrictionMessage(false));
                                return;
                            }

                            var renameInfo = {};
                            renameInfo["path"] = getCurrentFolder();
                            renameInfo["name"] = e.originalValue;
                            renameInfo["type"] = e.record.data.rowtype;
                            renameInfo["newName"] = e.value;
                            if (asControl)
                                renameInfo["control"] = true;

                            grid.renameImpl(renameInfo, e);
                        },
                        keypress: handleKeyPress
                    }
                });

                if (htcConfig.sharedInTree) {
                    sharedColModel = new Ext.grid.ColumnModel({
                        defaults: { sortable: true },
                        columns: [{
                            id: 'view-links-virtpath',
                            header: htcConfig.locData.CommonFieldLabelPath,
                            dataIndex: 'virt_path',
                            renderer: renderers.namePublicRenderer
                        }, {
                            id: 'view-links-type',
                            header: htcConfig.locData.CommonFieldLabelType,
                            dataIndex: 'type',
                            width: 140,
                            renderer: renderers.qtipCellRenderer
                        }, {
                            id: 'view-links-datecreated',
                            header: htcConfig.locData.AnonymousViewLinksDateCreatedColumn,
                            dataIndex: 'date',
                            renderer: renderers.dateRendererWithQTip,
                            width: 140,
                            hidden: true
                        }, {
                            id: 'view-links-dateexpired',
                            header: htcConfig.locData.AnonymousViewLinksDateExpiredColumn,
                            dataIndex: 'expires',
                            renderer: renderers.dateRendererWithQTip,
                            width: 140
                        }, {
                            id: 'view-links-with-passwd',
                            header: htcConfig.locData.CommonFieldLabelPassword,
                            dataIndex: 'withpasswd',
                            renderer: renderers.booleanRenderer,
                            width: 70,
                            align: 'center'
                        }, {
                            id: 'view-links-permission',
                            header: htcConfig.locData.AnonymousViewLinksPermissionColumn,
                            dataIndex: 'acl',
                            width: 200,
                            renderer: function (val, cell, rec, row, col, store) {
                                var res = '';
                                if ((val & 1) != 0)
                                    res += htcConfig.locData.PublicFolderAnonymViewContent;
                                if ((val & 2) != 0)
                                    res += (res == '' ? '' : ', ') + htcConfig.locData.PublicFolderAnonymDownload;
                                if ((val & 4) != 0)
                                    res += (res == '' ? '' : ', ') + htcConfig.locData.PublicFolderAnonymUpload;
                                if ((val & 8) != 0)
                                    res += (res == '' ? '' : ', ') + htcConfig.locData.PublicFolderAnonymZipDownload;
                                return String.format("<span style='white-space: normal;'>{0}</span>", res);
                            }
                        }, {
                            id: 'view-links-showcomments',
                            header: htcConfig.locData.AnonymousLinkShowCommentsShort,
                            dataIndex: 'show_comments',
                            renderer: renderers.booleanRenderer,
                            width: 70,
                            align: 'center',
                            hidden: true
                        }, {
                            id: 'view-links-downloaded',
                            header: htcConfig.locData.AnonymousViewLinksDownloadedColumn,
                            dataIndex: 'downloads',
                            hidden: true
                        }]
                    });
                    sharedGrid = new Ext.grid.GridPanel({

                        'openEditPublicLink': function (grd) {
                            grd = grd || sharedGrid;
                            if (!grd) {
                                return;
                            }
                            var row = grd.getSelectionModel().getSelected().data;
                            if (!row) {
                                return;
                            }
                            var isFolder = row["isfolder"];
                            var p = row["acl"];
                            var hp = row["perms"];
                            var anonPerm = {
                                download: { checked: p && (p & 2) != 0 && (!isFolder || (p & 1) != 0) },
                                upload: { checked: isFolder && p && (p & 4) != 0 },
                                view: { checked: isFolder && p && (p & 1) != 0 },
                                zip: { checked: isFolder && p && (p & 8) != 0 }
                            };
                            var onlyZip = anonPerm.zip.checked && !anonPerm.upload.checked && !anonPerm.view.checked;
                            anonPerm.download["disabled"] = !isFolder || onlyZip || !(hp && hp.download && hp.anonymDownload);
                            anonPerm.upload["disabled"] = !isFolder || onlyZip || !(hp && hp.upload && hp.anonymUpload);
                            anonPerm.view["disabled"] = !isFolder || onlyZip || !(hp && (hp.listFiles || hp.listFolders) && hp.anonymViewContent);
                            anonPerm.zip["disabled"] = !isFolder || !(hp && hp.zipDownload && hp.anonymDownload);
                            anonPerm.modify = hp && hp.modify;
                            if (anonPerm.download["disabled"])
                                anonPerm.download["checked"] = false;
                            if (anonPerm.upload["disabled"])
                                anonPerm.upload["checked"] = false;
                            if (anonPerm.view["disabled"])
                                anonPerm.view["checked"] = false;
                            if (anonPerm.zip["disabled"])
                                anonPerm.zip["checked"] = false;
                            prepareAndShowMakePublicLinkWindow(row["virt_path"], isFolder, anonPerm, row, true, true);
                        },

                        enableDragDrop: true,
                        ddText: htcConfig.locData.GridDDSelectedRowsText,
                        ddGroup: $('GridDD'),

                        region: 'center',
                        title: '&nbsp;',
                        header: true,
                        buttonAlign: 'left',
                        footer: true,
                        minColumnWidth: 70,
                        headerCfg: {
                            cls: 'x-panel-header x-tree-node'
                        },
                        loadMask: globalLoadMask,
                        selModel: new Ext.grid.RowSelectionModel({
                            listeners: {
                                beforerowselect: function (model, index, keep, record) {
                                    if (record.data.rowtype == "uplink")
                                        return false;
                                },
                                selectionchange: function (model) {
                                    toggleToolbarButtons();
                                    /*fillInfoAboutSelectedAndTotalFilesFolders(grid);*/
                                    // keep selected first item to higlight after refresh
                                    var sel = model ? model.getSelected() : null;
                                    if (sel && sel.data) {
                                        sharedSelectPath = {
                                            id: sel.data.id,
                                            userSelect: true
                                        };
                                    }
                                }
                            }
                        }),
                        autoExpandMin: 70,
                        autoExpandColumn: 'view-links-virtpath',
                        //fbar: gridStdToolBar,
                        bbar: pagingEnabled ? sharedGridPagingToolBar : undefined,
                        store: sharedGridStore,
                        plugins: [new Ext.ux.grid.GridFilters({
                            menuFilterText: htcConfig.locData.MenuFilterText,
                            encode: false,
                            local: true,
                            filters: [{
                                dataIndex: 'virt_path',
                                type: 'string',
                                emptyText: htcConfig.locData.EmptyTextFilter
                            }, {
                                dataIndex: 'type',
                                type: 'string',
                                emptyText: htcConfig.locData.EmptyTextFilter
                            }, {
                                dataIndex: 'isfolder',
                                type: 'boolean',
                                yesText: htcConfig.locData.CommonValueTypeFolder,
                                noText: htcConfig.locData.CommandFile
                            }, {
                                dataIndex: 'date',
                                type: 'date',
                                afterText: htcConfig.locData.AfterDateFilterText,
                                beforeText: htcConfig.locData.BeforeDateFilterText,
                                onText: htcConfig.locData.OnDateFilterText
                            }, {
                                dataIndex: 'expires',
                                type: 'date',
                                afterText: htcConfig.locData.AfterDateFilterText,
                                beforeText: htcConfig.locData.BeforeDateFilterText,
                                onText: htcConfig.locData.OnDateFilterText
                            }, {
                                dataIndex: 'withpasswd',
                                type: 'boolean',
                                yesText: htcConfig.locData.ExtMsgButtonTextYES,
                                noText: htcConfig.locData.ExtMsgButtonTextNO
                            }, {
                                dataIndex: 'downloads',
                                type: 'numeric',
                                menuItemCfgs: { emptyText: htcConfig.locData.EmptyTextFilter }
                            }, {
                                dataIndex: 'show_comments',
                                type: 'boolean',
                                yesText: htcConfig.locData.ExtMsgButtonTextYES,
                                noText: htcConfig.locData.ExtMsgButtonTextNO
                            }]
                        })],
                        colModel: sharedColModel,
                        flex: 1,
                        stripeRows: true,
                        keys: {
                            key: [
                                Ext.EventObject.ENTER,
                                Ext.EventObject.HOME,
                                Ext.EventObject.END,
                                Ext.EventObject.DELETE,
                                Ext.EventObject.BACKSPACE
                            ],
                            fn: function (e) {
                                var sm = sharedGrid.getSelectionModel();
                                switch (e) {
                                    case Ext.EventObject.HOME:
                                        sm.selectRow(!htcConfig.showUpLink ? 0 : 1);
                                        break;
                                    case Ext.EventObject.END:
                                        sm.selectLastRow();
                                        break;
                                    case Ext.EventObject.DELETE:
                                        if (menuActions) {
                                            var selTFM = getSelTypeFilesModel(sharedGrid);
                                            var selType = selTFM['selType'];
                                            if (selType != 'empty' && selType != 'none') {
                                                menuActions.deleteSelectedItems();
                                            }
                                        }
                                        break;
                                    case Ext.EventObject.BACKSPACE:
                                        openGridFolder('root', true);
                                        break;
                                    case Ext.EventObject.ENTER:
                                        if (sm.getCount() == 1) {
                                            sharedGrid.openEditPublicLink(sharedGrid);
                                        }
                                        break;
                                }
                            }
                        },
                        listeners: {
                            resize: function (grd, adjWidth, adjHeight, rawWidth, rawHeight) {
                                grd.getView().refresh(true);
                            },
                            columnmove: function (oldIndex, newIndex) {
                                if (sharedGrid) {
                                    sharedGrid.getView().refresh(true);
                                }
                            },
                            afterrender: function (grd) {
                                if (sharedGridDropTarget)
                                    sharedGridDropTarget.destroy();
                                sharedGridDropTarget = null;
                                createSharedGridDropTarget(grd);
                                var gbtb = null;
                                if (grd.getBottomToolbar && (gbtb = grd.getBottomToolbar()))
                                    gbtb.hide();
                            },
                            rowcontextmenu: function (grd, index, e) {
                                var selModel = grd.getSelectionModel();
                                if (!selModel.isSelected(index))
                                    selModel.selectRow(index, false);
                                if (sharedFileMenu) {
                                    sharedFileMenu.showAt(e.getXY());
                                }
                            },
                            containercontextmenu: function (grd, e) {
                                grd.getSelectionModel().clearSelections();
                                if (sharedFileMenu) {
                                    sharedFileMenu.showAt(e.getXY());
                                }
                            },
                            containerclick: function (grd, e) {
                                grd.getSelectionModel().clearSelections();
                            },
                            containerdblclick: function (grd, e) {
                                grd.getSelectionModel().clearSelections();
                            },
                            rowdblclick: function (grd, index, e) {
                                grd.openEditPublicLink(grd);
                            },
                            render: function (grd) {
                                Ext.dd.ScrollManager.register(grd.getView().getEditorParent());
                            },
                            beforedestroy: function (grd) {
                                Ext.dd.ScrollManager.unregister(grd.getView().getEditorParent());
                            },
                            keypress: handleKeyPress
                        }
                    });
                }

                if (htcConfig.sharedForYou) {
                    sharedFYColModel = new Ext.grid.ColumnModel({
                        defaults: { sortable: true },
                        columns: [{
                            id: 'view-links-virtpath',
                            header: htcConfig.locData.CommonFieldLabelPath,
                            dataIndex: 'virt_path',
                            renderer: renderers.namePublicRenderer
                        }, {
                            id: 'view-links-type',
                            header: htcConfig.locData.CommonFieldLabelType,
                            dataIndex: 'type',
                            width: 140,
                            renderer: renderers.qtipCellRenderer
                        }, {
                            id: 'view-links-datecreated',
                            header: htcConfig.locData.AnonymousViewLinksDateCreatedColumn,
                            dataIndex: 'date',
                            renderer: renderers.dateRendererWithQTip,
                            width: 140,
                            hidden: true
                        }, {
                            id: 'view-links-dateexpired',
                            header: htcConfig.locData.AnonymousViewLinksDateExpiredColumn,
                            dataIndex: 'expires',
                            renderer: renderers.dateRendererWithQTip,
                            width: 140
                        }, {
                            id: 'view-links-with-passwd',
                            header: htcConfig.locData.CommonFieldLabelPassword,
                            dataIndex: 'withpasswd',
                            renderer: renderers.booleanRenderer,
                            width: 70,
                            align: 'center'
                        }, {
                            id: 'view-links-permission',
                            header: htcConfig.locData.AnonymousViewLinksPermissionColumn,
                            dataIndex: 'acl',
                            width: 200,
                            renderer: function (val, cell, rec, row, col, store) {
                                var res = '';
                                if ((val & 1) != 0)
                                    res += htcConfig.locData.PublicFolderAnonymViewContent;
                                if ((val & 2) != 0)
                                    res += (res == '' ? '' : ', ') + htcConfig.locData.PublicFolderAnonymDownload;
                                if ((val & 4) != 0)
                                    res += (res == '' ? '' : ', ') + htcConfig.locData.PublicFolderAnonymUpload;
                                if ((val & 8) != 0)
                                    res += (res == '' ? '' : ', ') + htcConfig.locData.PublicFolderAnonymZipDownload;
                                return String.format("<span style='white-space: normal;'>{0}</span>", res);
                            }
                        }/*, {
                            id: 'view-links-downloaded',
                            header: htcConfig.locData.AnonymousViewLinksDownloadedColumn,
                            dataIndex: 'downloads',
                            hidden: true
                        }*/]
                    });
                    sharedFYGrid = new Ext.grid.GridPanel({
                        enableDragDrop: false,
                        region: 'center',
                        title: '&nbsp;',
                        header: true,
                        buttonAlign: 'left',
                        footer: true,
                        minColumnWidth: 70,
                        headerCfg: {
                            cls: 'x-panel-header x-tree-node'
                        },
                        loadMask: globalLoadMask,
                        selModel: new Ext.grid.RowSelectionModel({
                            listeners: {
                                beforerowselect: function (model, index, keep, record) {
                                    if (record.data.rowtype == "uplink")
                                        return false;
                                },
                                selectionchange: function (model) {
                                    toggleToolbarButtons();
                                    // keep selected first item to higlight after refresh
                                    var sel = model ? model.getSelected() : null;
                                    if (sel && sel.data) {
                                        sharedFYSelectPath = {
                                            id: sel.data.id,
                                            userSelect: true
                                        };
                                    }
                                }
                            }
                        }),
                        autoExpandMin: 70,
                        autoExpandColumn: 'view-links-virtpath',
                        //fbar: gridStdToolBar,
                        bbar: pagingEnabled ? sharedFYGridPagingToolBar : undefined,
                        store: sharedFYGridStore,
                        plugins: [new Ext.ux.grid.GridFilters({
                            menuFilterText: htcConfig.locData.MenuFilterText,
                            encode: false,
                            local: true,
                            filters: [{
                                dataIndex: 'virt_path',
                                type: 'string',
                                emptyText: htcConfig.locData.EmptyTextFilter
                            }, {
                                dataIndex: 'type',
                                type: 'string',
                                emptyText: htcConfig.locData.EmptyTextFilter
                            }, {
                                dataIndex: 'isfolder',
                                type: 'boolean',
                                yesText: htcConfig.locData.CommonValueTypeFolder,
                                noText: htcConfig.locData.CommandFile
                            }, {
                                dataIndex: 'date',
                                type: 'date',
                                afterText: htcConfig.locData.AfterDateFilterText,
                                beforeText: htcConfig.locData.BeforeDateFilterText,
                                onText: htcConfig.locData.OnDateFilterText
                            }, {
                                dataIndex: 'expires',
                                type: 'date',
                                afterText: htcConfig.locData.AfterDateFilterText,
                                beforeText: htcConfig.locData.BeforeDateFilterText,
                                onText: htcConfig.locData.OnDateFilterText
                            }, {
                                dataIndex: 'withpasswd',
                                type: 'boolean',
                                yesText: htcConfig.locData.ExtMsgButtonTextYES,
                                noText: htcConfig.locData.ExtMsgButtonTextNO
                            }/*, {
                                dataIndex: 'downloads',
                                type: 'numeric',
                                menuItemCfgs: { emptyText: htcConfig.locData.EmptyTextFilter }
                            }*/]
                        })],
                        colModel: sharedFYColModel,
                        flex: 1,
                        stripeRows: true,
                        keys: {
                            key: [
                                Ext.EventObject.ENTER,
                                Ext.EventObject.HOME,
                                Ext.EventObject.END,
                                Ext.EventObject.BACKSPACE
                            ],
                            fn: function (e) {
                                var sm = sharedFYGrid.getSelectionModel();
                                switch (e) {
                                    case Ext.EventObject.HOME:
                                        sm.selectRow(!htcConfig.showUpLink ? 0 : 1);
                                        break;
                                    case Ext.EventObject.END:
                                        sm.selectLastRow();
                                        break;
                                    case Ext.EventObject.BACKSPACE:
                                        openGridFolder('root', true);
                                        break;
                                    case Ext.EventObject.ENTER:
                                        if (sm.getCount() == 1) {
                                            //sharedFYGrid.openPublicLink(sharedFYGrid); //TODO
                                        }
                                        break;
                                }
                            }
                        },
                        listeners: {
                            resize: function (grd, adjWidth, adjHeight, rawWidth, rawHeight) {
                                grd.getView().refresh(true);
                            },
                            columnmove: function (oldIndex, newIndex) {
                                if (sharedFYGrid) {
                                    sharedFYGrid.getView().refresh(true);
                                }
                            },
                            afterrender: function (grd) {
                                var gbtb = null;
                                if (grd.getBottomToolbar && (gbtb = grd.getBottomToolbar()))
                                    gbtb.hide();
                            },
                            rowcontextmenu: function (grd, index, e) {
                                var selModel = grd.getSelectionModel();
                                if (!selModel.isSelected(index))
                                    selModel.selectRow(index, false);
                                //if (sharedFYFileMenu) {
                                //    sharedFYFileMenu.showAt(e.getXY());
                                //}
                            },
                            containercontextmenu: function (grd, e) {
                                grd.getSelectionModel().clearSelections();
                                //if (sharedFYFileMenu) {
                                //    sharedFYFileMenu.showAt(e.getXY());
                                //}
                            },
                            containerclick: function (grd, e) {
                                grd.getSelectionModel().clearSelections();
                            },
                            containerdblclick: function (grd, e) {
                                grd.getSelectionModel().clearSelections();
                            },
                            rowdblclick: function (grd, index, e) {
                                //grd.openPublicLink(grd); //TODO
                            },
                            keypress: handleKeyPress
                        }
                    });
                }

            } catch (e) {
                throw e;
            }
        };

        // Init top tool bar
        var initToolBar = function () {

            initAndShowSearch = function (namePattern, contentPattern) { // Search objects
                try {
                    if (!htcConfig.searchEnabled) {
                        return;
                    }
                    if (!searchWindow) {
                        searchWindow = HttpCommander.Lib.FileSearchWindow({
                            'htcConfig': htcConfig,
                            'Window': Window,
                            'Msg': Msg,
                            'getSelectPath': function () { return selectPath; },
                            'setSelectPath': function (v) { selectPath = v; },
                            'openGridFolder': openGridFolder,
                            'ProcessScriptError': ProcessScriptError,
                            'getCurrentFolder': getCurrentFolder,
                            'getExtEl': function () { return extEl; },
                            'getRenderers': function () { return renderers; },
                            'getFileManager': function () { return fm; },
                            'isRootFolder': isRootFolder,
                            'getRootName': function () { return _OLD_ROOT_; },
                            'isSpecialTreeFolderOrSubFolder': isSpecialTreeFolderOrSubFolder
                        });
                    }
                    // if specified namePattern or contentPattern - used quick search, need - fill values
                    searchWindow.initQuickSearch(namePattern, contentPattern);
                    searchWindow.show();
                } catch (e) {
                    ProcessScriptError(e);
                }
            };

            toptbarConfig = HttpCommander.Lib.ToolbarActions({
                'htcConfig': htcConfig,
                'getMenuActions': function () { return menuActions; },
                'getLogoBtn': function () { return logoBtn; },
                'getTree': function () { return tree; },
                'initAndShowSearch': initAndShowSearch,
                'initUploaders': initUploaders,
                'Msg': Msg,
                'showHelpWindow': showHelpWindow,
                'asControl': function () { return asControl; },
                'onLogOut': onLogOut,
                'getClipboard': function () { return clipboard; },
                'toggleToolbarButtons': toggleToolbarButtons,
                'getGrid': function () { return grid; },
                'getCurrentFolder': getCurrentFolder,
                'createSelectedSet': createSelectedSet,
                'initMetadata': initMetadata,
                'openGridFolder': openGridFolder,
                'initOfficeEditor': initOfficeEditor,
                'downloadToGoogle': downloadToGoogle,
                'downloadToDropbox': downloadToDropbox,
                'downloadToSkyDrive': downloadToSkyDrive,
                'downloadToBox': downloadToBox,
                'virtualFilePath': virtualFilePath,
                'prepareAndShowMakePublicLinkWindow': prepareAndShowMakePublicLinkWindow,
                'prepareAndShowlinksToWebFoldersWindow': prepareAndShowlinksToWebFoldersWindow,
                'initAndShowSyncWebFoldersHelpWindow': initAndShowSyncWebFoldersHelpWindow,
                'initZipContent': initZipContent,
                'isExtensionAllowed': isExtensionAllowed,
                'getSelTypeFilesModel': getSelTypeFilesModel,
                'getCurrentPerms': function () {
                    return htcConfig && htcConfig.currentPerms
                        ? htcConfig.currentPerms : null;
                },
                'getViewEditSubMenu': function () { return viewEditSubMenu; },
                'getLabelsMenu': function () { return labelsMenu; },
                'getShareSubMenu': function () { return shareSubMenu; },
                'getMoreSubMenu': function () { return moreSubMenu; },
                'initAndShowViewLinksWindow': initAndShowViewLinksWindow,
                'getTreeViewValue': getTreeViewValue,
                'supportsWebGlCanvasForAutodesk': function () { return supportsWebGlCanvasForAutodesk; },
                'getEditOpenTxtButtons': function () { return editOpenTxtButtons; },
                'getMsoEditButtons': function () { return msoEditButtons; },
                'getOooEditButtons': function () { return oooEditButtons; },
                'openInMsoNewWay': openInMsoNewWay,
                'isRecentFolder': isRecentFolder,
                'isTrashFolder': isTrashFolder,
                'getTrashSubMenu': function () { return trashSubMenu; },
                'isSharedTreeFolder': isSharedTreeFolder,
                'isSharedForYouTreeFolder': isSharedForYouTreeFolder,
                'getWatchSubMenu': function () { return watchSubMenu; },
                'getSharedGrid': function () { return sharedGrid; },
                'getSharedFYGrid': function () { return sharedFYGrid; },
                'isAlertsFolder': isAlertsFolder,
                'initAndShowSelectFolder': initAndShowSelectFolder
            });

            // Private vars
            var favoritesSubMenu,
                gridViewMenu,
                adminMenu,
                settingsMenu;

            var buttonExists = function (btnName) {
                var i;
                for (i = 0; i < htcConfig.toolbarButtons1.length; i++) {
                    if (htcConfig.toolbarButtons1[i]['name'] === btnName) {
                        return true;
                    }
                }
                for (i = 0; i < htcConfig.toolbarButtons2.length; i++) {
                    if (htcConfig.toolbarButtons2[i]['name'] === btnName) {
                        return true;
                    }
                }
                return false;
            };

            var changeGridView = function (viewState) {
                var gridView = typeof (grid) != 'undefined' ? grid.getView() : null;
                if (gridView) {
                    if (!viewState)
                        viewState = 'detailed';
                    viewState = viewState.toString().toLowerCase();
                    var thumbView = typeof (thumbnailTpl) != 'undefined' && viewState == 'thumbnails';
                    if (!thumbView)
                        viewState = 'detailed';
                    gridView.tpl = thumbView ? thumbnailTpl : null;
                    gridView.refresh(true);
                    currentGridView = thumbView ? 'thumbnails' : 'detailed';
                    HttpCommander.Lib.Utils.deleteCookie($("htcgridview"));
                    HttpCommander.Lib.Utils.setCookie($("htcgridview"), viewState);
                }
            };

            try { // favorites view submenu
                if (buttonExists('Favorites') || buttonExists('View')) {
                    favoritesSubMenu = HttpCommander.Lib.FavoritesSubMenu({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        '$': $,
                        'getCurrentFolder': getCurrentFolder,
                        'openGridFolder': openGridFolder,
                        'globalLoadMask': globalLoadMask,
                        'getGridViewMenu': function () { return gridViewMenu; }
                    });
                }
            } catch (e) {
                ProcessScriptError(e);
            }

            try { // grid view submenu
                if (buttonExists('View')) {
                    var viewMenuItemsArr = [{
                        itemId: 'grid-view-refresh',
                        text: htcConfig.locData.CommandRefresh,
                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'refresh')
                    }, '-', {
                        itemId: 'grid-view-thumbnails',
                        text: htcConfig.locData.CommandThumbnailView,
                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'viewt')
                    }, {
                        itemId: 'grid-view-detailed',
                        text: htcConfig.locData.CommandDetailedView,
                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'viewd')
                    }];
                    if (htcConfig.enableDetailsPane) {
                        viewMenuItemsArr.push('-', {
                            xtype: 'menucheckitem',
                            itemId: 'show-hide-details-pane',
                            text: htcConfig.locData.CommandDetailsPane,
                            checked: !getHideDetailsPaneValue(),
                            listeners: {
                                checkchange: function (shdp, checked) {
                                    if (!!detailsPane) {
                                        if (checked && detailsPane.collapsed) {
                                            detailsPane.expand();
                                        } else if (!checked && !detailsPane.collapsed) {
                                            detailsPane.collapse();
                                        }
                                    }
                                }
                            }
                        });
                    }
                    viewMenuItemsArr.push('-', {
                        text: htcConfig.locData.CommandFavorites,
                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'favorites'),
                        handler: function (item, e) { return false; },
                        menu: favoritesSubMenu
                    });
                    gridViewMenu = new Ext.menu.Menu({
                        items: viewMenuItemsArr,
                        listeners: {
                            beforeshow: function (cmp) {
                                var shdp = cmp.getComponent('show-hide-details-pane');
                                if (!!shdp) {
                                    shdp.setChecked(!!detailsPane && !detailsPane.collapsed, true);
                                }
                            },
                            itemclick: function (item) {
                                switch (item.itemId) {
                                    case 'grid-view-refresh':
                                        var curFolder = getCurrentFolder();
                                        //openTreeNode(curFolder, true);
                                        openGridFolder(curFolder, true, true);
                                        break;
                                    case 'grid-view-thumbnails':
                                        changeGridView('thumbnails');
                                        break;
                                    case 'grid-view-detailed':
                                        changeGridView('detailed');
                                        break;
                                }
                            }
                        }
                    });
                }
            } catch (e) {
                ProcessScriptError(e);
            }

            try { // admin menu
                if ((htcConfig.isAdmin || htcConfig.viewDiag) && buttonExists('Administration')) {
                    var adminMenuItems = [];
                    if (htcConfig.isAdmin) adminMenuItems.push({
                        itemId: 'admin-panel',
                        text: htcConfig.locData.CommandAdminPanel,
                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'adpanel')
                    });
                    if (htcConfig.isAdmin && htcConfig.viewDiag) adminMenuItems.push({
                        itemId: 'diagnostics',
                        text: htcConfig.locData.CommandDiagnostics,
                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'diagnostics')
                    });
                    if (adminMenuItems.length > 0) {
                        adminMenu = new Ext.menu.Menu({
                            items: adminMenuItems,
                            listeners: {
                                itemclick: function (item) {
                                    var queryString = (asControl ? "?control=" + encodeURIComponent(window.location.toString()) : "");
                                    switch (item.itemId) {
                                        case 'admin-panel':
                                            if (htcConfig.isAdmin) {
                                                var adminUrl = htcConfig.relativePath + "AdminPanel.aspx" + queryString;
                                                if (embedded || isEmbeddedtoIFRAME) {
                                                    var adminpanelWin = window.open(adminUrl, "_blank");
                                                    if (!adminpanelWin) {
                                                        window.alert(htcConfig.locData.ViewPopupBlocked);
                                                    }
                                                } else {
                                                    window.location.href = adminUrl;
                                                }
                                            }
                                            break;
                                        case 'diagnostics':
                                            if (htcConfig.viewDiag) {
                                                window.open(htcConfig.relativePath + "Diagnostics.aspx" + queryString);
                                            }
                                            break;
                                    }
                                }
                            }
                        });
                    }
                }
            } catch (e) {
                ProcessScriptError(e);
            }

            try { // settings menu
                if (buttonExists('Settings')) {
                    var cbLanguage; // Language objects
                    var settingsWindow = new Window({
                        title: htcConfig.locData.SettingsTitle,
                        width: 250,
                        resizable: false,
                        plain: true,
                        closeAction: 'hide',
                        items: new Ext.FormPanel({
                            labelWidth: 70,
                            border: false,
                            bodyBorder: false,
                            header: false,
                            frame: true,
                            width: 250,
                            items:
                            [
                                cbLanguage = new Ext.form.ComboBox({
                                    fieldLabel: htcConfig.locData.SettingsLanguage,
                                    editable: false,
                                    width: 140,
                                    triggerAction: 'all',
                                    mode: 'remote',
                                    tpl: '<tpl for="."><div class="x-combo-list-item">{name:htmlEncode}</div></tpl>',
                                    store: new Ext.data.DirectStore({
                                        reader: new Ext.data.JsonReader({
                                            idProperty: 'name',
                                            root: 'data',
                                            fields: ['name', 'code']
                                        }),
                                        autoLoad: false,
                                        api: { read: HttpCommander.Common.LocalizationList }
                                    }),
                                    valueField: 'name',
                                    displayField: 'name',
                                    lazyInit: false
                                })
                            ]
                        }),
                        buttons:
                        [
                            {
                                text: htcConfig.locData.CommandSave,
                                handler: function () {
                                    HttpCommander.Lib.Utils.deleteCookie("htclang");
                                    HttpCommander.Lib.Utils.setCookie("htclang", cbLanguage.getValue());
                                    Msg.alert(htcConfig.locData.CommonWarningCaption, htcConfig.locData.SettingsLogOutRequired);
                                    settingsWindow.hide();
                                }
                            },
                            {
                                text: htcConfig.locData.CommonButtonCaptionCancel,
                                handler: function () { settingsWindow.hide(); }
                            }
                        ],
                        listeners: {
                            show: function (win) {
                                var langFromCookie = cbLanguage.setValue(HttpCommander.Lib.Utils.getCookie("htclang"));
                                if (typeof langFromCookie != 'string' || langFromCookie.trim() == '') {
                                    cbLanguage.setValue(htcConfig.language);
                                    HttpCommander.Lib.Utils.setCookie("htclang", htcConfig.language);
                                }
                            }
                        }
                    });

                    // Change password and email
                    var changePasswordWindow,
                        userPasswordInfo,
                        changeEmailWindow,
                        userEmailInfo;
                    var validateChangePasswordData = function () {
                        var userName = userPasswordInfo.findById($('change-password-user-name')).getValue();
                        var oldPassword = userPasswordInfo.findById($('user-old-password')).getValue();
                        var newPassword1 = userPasswordInfo.findById($('user-new-password1')).getValue();
                        var newPassword2 = userPasswordInfo.findById($('user-new-password2')).getValue();
                        if (newPassword1 != newPassword2)
                            return htcConfig.locData.ChangeUserPasswordPasswordsNotMatch;
                        return null;
                    };
                    var aggregateChangePasswordData = function () {
                        var data = {};
                        data["name"] = userPasswordInfo.findById($('change-password-user-name')).getValue();
                        data["old-password"] = userPasswordInfo.findById($('user-old-password')).getValue();
                        data["new-password"] = userPasswordInfo.findById($('user-new-password1')).getValue();
                        return data;
                    };
                    var prepareChangePasswordWindow = function () {
                        userPasswordInfo.findById($('change-password-user-name')).setValue(
                            (typeof htcConfig.currentUserDomain != 'undefined' && htcConfig.currentUserDomain.trim().length > 0
                                ? (htcConfig.currentUserDomain + '\\') : '') + htcConfig.currentUser);
                        userPasswordInfo.findById($('user-old-password')).setValue('');
                        userPasswordInfo.findById($('user-new-password1')).setValue('');
                        userPasswordInfo.findById($('user-new-password2')).setValue('');
                    };
                    var prepareChangeEmailWindow = function () {
                        userEmailInfo.findById($('change-email-user-name')).setValue(
                            (typeof htcConfig.currentUserDomain != 'undefined' && htcConfig.currentUserDomain.trim().length > 0
                                ? (htcConfig.currentUserDomain + '\\') : '') + htcConfig.currentUser);
                        userEmailInfo.findById($('change-email-user-email')).setValue('');
                        HttpCommander.Admin.GetCurrentUserInfo(function (data, trans) {
                            if (typeof data == 'undefined') {
                                Msg.alert(htcConfig.locData.CommonErrorCaption, Ext.util.Format.htmlEncode(trans.message));
                                return;
                            }
                            if (data.status != "success") {
                                Msg.alert(htcConfig.locData.CommonErrorCaption, data.message);
                                return;
                            }
                            if (data.data.email != null) {
                                userEmailInfo.findById($('change-email-user-email')).setValue(data.data.email);
                            }
                        });
                    };
                    var aggregateChangeEmailData = function () {
                        var data = {};
                        data["email"] = userEmailInfo.findById($('change-email-user-email')).getValue();
                        return data;
                    };

                    try {
                        changePasswordWindow = new Window({
                            title: htcConfig.locData.ChangeUserPasswordTitle,
                            bodyStyle: 'padding:5px',
                            layout: 'table',
                            layoutConfig: { columns: 2 },
                            resizable: false,
                            plain: true,
                            closeAction: 'hide',
                            width: 345,
                            items:
                            [
                                userPasswordInfo = new Ext.form.FieldSet({
                                    title: htcConfig.locData.AdminUsersGeneralInfo,
                                    labelWidth: 120,
                                    defaultType: 'textfield',
                                    items:
                                    [
                                        {
                                            fieldLabel: htcConfig.locData.CommonFieldLabelUserName,
                                            id: $('change-password-user-name'),
                                            width: 170,
                                            disabled: true,
                                            readOnly: true
                                        },
                                        {
                                            fieldLabel: htcConfig.locData.ChangeUserPasswordOldPassword,
                                            id: $('user-old-password'),
                                            inputType: 'password',
                                            width: 170
                                        },
                                        {
                                            fieldLabel: htcConfig.locData.ChangeUserPasswordNewPassword,
                                            id: $('user-new-password1'),
                                            inputType: 'password',
                                            width: 170
                                        },
                                        {
                                            fieldLabel: htcConfig.locData.ChangeUserPasswordRepeatNewPassword,
                                            id: $('user-new-password2'),
                                            inputType: 'password',
                                            width: 170
                                        }
                                    ]
                                })
                            ],
                            buttons:
                            [
                                {
                                    text: htcConfig.locData.CommandSave,
                                    handler: function () {
                                        var validationResult = validateChangePasswordData();
                                        if (validationResult) {
                                            Msg.show({
                                                title: htcConfig.locData.CommonErrorCaption,
                                                msg: validationResult,
                                                icon: Msg.WARNING,
                                                buttons: Msg.OK
                                            });
                                        } else {
                                            changePasswordWindow.hide();
                                            var pass_data = aggregateChangePasswordData();
                                            globalLoadMask.msg = htcConfig.locData.ProgressChangePassword + "...";
                                            globalLoadMask.show();
                                            HttpCommander.Admin.ChangePasswordUser(pass_data, function (data, trans) {
                                                globalLoadMask.hide();
                                                globalLoadMask.msg = htcConfig.locData.ProgressLoading + "...";
                                                if (typeof data == 'undefined') {
                                                    Msg.alert(htcConfig.locData.CommonErrorCaption, Ext.util.Format.htmlEncode(trans.message));
                                                    return;
                                                }
                                                if (data.status != "success") {
                                                    Msg.alert(htcConfig.locData.CommonErrorCaption, data.message);
                                                    return;
                                                }
                                                Msg.alert('', htcConfig.locData.ChangeUserPasswordSuccessMessage);
                                            });
                                        }
                                    }
                                },
                                {
                                    text: htcConfig.locData.CommonButtonCaptionCancel,
                                    handler: function () { changePasswordWindow.hide(); }
                                }
                            ]
                        });
                    } catch (e) {
                        ProcessScriptError(e);
                    }

                    try {
                        changeEmailWindow = new Window({
                            title: htcConfig.locData.ChangeUserEmailTitle,
                            bodyStyle: 'padding:5px',
                            layout: 'table',
                            plain: true,
                            layoutConfig: { columns: 2 },
                            resizable: false,
                            closeAction: 'hide',
                            width: 345,
                            items:
                            [
                                userEmailInfo = new Ext.form.FieldSet({
                                    title: htcConfig.locData.AdminUsersGeneralInfo,
                                    labelWidth: 120,
                                    defaultType: 'textfield',
                                    items:
                                    [
                                        {
                                            fieldLabel: htcConfig.locData.CommonFieldLabelUserName,
                                            id: $('change-email-user-name'),
                                            width: 170,
                                            readOnly: true,
                                            disabled: true
                                        },
                                        {
                                            fieldLabel: htcConfig.locData.ChangeUserEmailEmail,
                                            id: $('change-email-user-email'),
                                            width: 170
                                        }
                                    ]
                                })
                            ],
                            buttons:
                            [
                                {
                                    text: htcConfig.locData.CommandSave,
                                    handler: function () {
                                        changeEmailWindow.hide();
                                        var email_data = aggregateChangeEmailData();
                                        globalLoadMask.msg = htcConfig.locData.ProgressChangeEmail + "...";
                                        globalLoadMask.show();
                                        HttpCommander.Admin.UpdateCurrentUserInfo(email_data, function (data, trans) {
                                            globalLoadMask.hide();
                                            globalLoadMask.msg = htcConfig.locData.ProgressLoading + "...";
                                            if (typeof data == 'undefined') {
                                                Msg.alert(htcConfig.locData.CommonErrorCaption, Ext.util.Format.htmlEncode(trans.message));
                                                return;
                                            }
                                            if (data.status != "success") {
                                                Msg.alert(htcConfig.locData.CommonErrorCaption, data.message);
                                                return;
                                            }
                                            Msg.alert('', htcConfig.locData.ChangeUserEmailSuccessMessage);
                                        });
                                    }
                                },
                                {
                                    text: htcConfig.locData.CommonButtonCaptionCancel,
                                    handler: function () { changeEmailWindow.hide(); }
                                }
                            ]
                        });
                    } catch (e) {
                        ProcessScriptError(e);
                    }

                    settingsMenu = new Ext.menu.Menu({
                        items: [{
                            itemId: 'language',
                            text: htcConfig.locData.CommandLanguage + (String(htcConfig.language).toLowerCase() === 'english' ? '' : ' (Language)'),
                            icon: HttpCommander.Lib.Utils.getIconPath(this, 'language')
                        }, {
                            itemId: 'change-password',
                            text: htcConfig.locData.CommandChangePassword,
                            icon: HttpCommander.Lib.Utils.getIconPath(this, 'password'),
                            hidden: asControl,
                            disabled: !htcConfig.changePassword
                        }, {
                            itemId: 'change-email',
                            text: htcConfig.locData.CommandChangeEmail,
                            icon: HttpCommander.Lib.Utils.getIconPath(this, 'changeemail'),
                            hidden: asControl,
                            disabled: !htcConfig.changeEmail
                        }, {
                            itemId: 'mobile-view',
                            text: htcConfig.locData.CommandMobileView,
                            icon: HttpCommander.Lib.Utils.getIconPath(this, 'iphone'),
                            hidden: asControl
                        }],
                        listeners: {
                            itemclick: function (item) {
                                switch (item.itemId) {
                                    case 'language':
                                        settingsWindow.show();
                                        break;
                                    case 'change-password':
                                        prepareChangePasswordWindow();
                                        changePasswordWindow.show();
                                        break;
                                    case 'change-email':
                                        prepareChangeEmailWindow();
                                        changeEmailWindow.show();
                                        break;
                                    case 'mobile-view':
                                        if (asControl) return;
                                        window.location.href = htcConfig.relativePath + "Default.aspx?Mobile=";
                                        break;
                                }
                            }
                        }
                    });
            }
        } catch (e) {
            ProcessScriptError(e);
        }

        var getToolbarButtons = function (baseArray) {
            if (!Ext.isArray(baseArray) || baseArray.length < 1) {
                return [];
            }
            var result = [];
            var rr = [];
            var needSep = false;
            var needFill = true;
            var smallIcon = isEmbeddedtoIFRAME || htcConfig.toolbarIconSize == 1;
            var scale = smallIcon ? 'small' : 'medium'
            var appendSep = function () {
                if (needSep) {
                    if (result.length > 0) {
                        result.push('-');
                    }
                    needSep = false;
                }
            };
            var pushFill = function () {
                if (needFill) {
                    rr.push('->');
                    needFill = false;
                }
            };
            var getMenuObject = function (itemName) {
                switch (itemName) {
                    case 'View': return gridViewMenu;
                    case 'Favorites': return favoritesSubMenu;
                    case 'FileMenu': return fileMenu;
                    case 'Administration': return adminMenu;
                    case 'Settings': return settingsMenu;
                    case 'ViewEditSharing':
                    case 'ViewEdit': return viewEditSubMenu;
                    case 'Share': return shareSubMenu;
                    case 'Label': return labelsMenu;
                    case 'WatchForModifs': return watchSubMenu;
                    case 'More': return moreSubMenu;
                    case 'Clouds': return cloudsSubMenu;
                    case 'Trash': return htcConfig.enableTrash ? trashSubMenu : null;
                    case 'New': return newSubMenu;
                    case 'Versioning': return versioningSubMenu;
                    case 'Unzip': return unzipSubMenu;
                    case 'Copy': return (htcConfig.copyMoveToMode == 2) ? copyMenu : null;
                    case 'Cut': return (htcConfig.copyMoveToMode == 2) ? moveMenu : null;
                    default: return null;
                }
            };
            try {
                Ext.each(baseArray, function (item, index, allItems) {
                    var button = null,
                        rButton = null,
                        sButton = null,
                        srButton = null,
                        allow = true,
                        cfg = null,
                        isRight = false,
                        btnCfg = null,
                        withHandler = false,
                        withMenu = false,
                        copyOrCut = false,
                        itmName = item.name,
                        secondItmName = null,
                        secondBtnCfg = null;

                    if (item.name === 'Separator') {
                        needSep = true;
                    } else {
                        switch (item.name) {
                            case 'Folders':
                                allow = getTreeViewValue() != 'disabled';
                                break;
                            case 'View':
                                allow = gridViewMenu ? true : false;
                                break;
                            case 'Favorites':
                                allow = favoritesSubMenu ? true : false;
                                break;
                            case 'Administration':
                                allow = adminMenu ? true : false;
                                break;
                            case 'Settings':
                                allow = settingsMenu ? true : false;
                                break;
                            case 'Copy':
                            case 'Cut':
                                if (htcConfig.copyMoveToMode == 3) {
                                    itmName = (item.name == 'Cut') ? 'MoveTo' : 'CopyTo';
                                } else if (htcConfig.copyMoveToMode == 1) {
                                    secondItmName = (item.name == 'Cut') ? 'MoveTo' : 'CopyTo';
                                }
                                copyOrCut = true;
                                break;
                        }
                    }

                    if (allow && (cfg = toptbarConfig[itmName])) {
                        isRight = (cfg.right === true);
                        if (isRight) {
                            pushFill();
                        } else {
                            appendSep();
                        }
                        btnCfg = { scale: scale };
                        if (typeof cfg.handler == 'function') {
                            btnCfg.handler = cfg.handler;
                            withHandler = true;
                        }
                        if (cfg.menu === true || copyOrCut) {
                            var subMenu = getMenuObject(item.name);
                            if (subMenu) {
                                btnCfg.menu = subMenu;
                                withMenu = true;
                                if (copyOrCut) {
                                    btnCfg.handler = undefined;
                                    withHandler = false;
                                }
                            }
                        } else if (Ext.isObject(cfg.menu) || Ext.isArray(cfg.menu)) {
                            btnCfg.menu = cfg.menu;
                            withMenu = true;
                        }
                        if (item.view != 2) {
                            if (cfg.textKey)
                                btnCfg['text'] = htcConfig.locData[cfg.textKey];
                            else if (item.name == 'Logout')
                                btnCfg['text'] = Ext.util.Format.htmlEncode(htcConfig.currentUser);
                        }
                        if (item.view != 1 && cfg.iconName) {
                            btnCfg['icon'] = HttpCommander.Lib.Utils.getIconPath(this, (smallIcon || htcConfig.iconSet.ext.indexOf('png') < 0
                                ? cfg.iconName : (cfg.iconBigName ? cfg.iconBigName : ('24/' + cfg.iconName))));
                            if (htcConfig.iconSet.ext.indexOf('svg') >= 0 && HttpCommander.Lib.Utils.browserIs.ie10standard)
                                btnCfg['icon'] += '?q=toolbar';
                        }
                        if (item.view == 2 && (cfg.textKey || cfg.tooltip)) {
                            if (cfg.textKey) {
                                btnCfg['tooltip'] = { text: htcConfig.locData[cfg.textKey] };
                            } else {
                                btnCfg['tooltip'] = {
                                    text: htcConfig.locData[cfg.tooltip.textKey],
                                    title: htcConfig.locData[cfg.tooltip.titleKey]
                                };
                            }
                        }
                        if (cfg.disabled === true) {
                            btnCfg.disabled = true;
                        }
                        if (item.name === 'Logo') {
                            btnCfg.tooltip = { text: logoBtn.tooltip };
                            btnCfg.icon = htcConfig.relativePath + logoBtn.icon;
                            btnCfg.iconCls = 'x-logo-icon';
                        }
                        if (item.name === 'Folders') {
                            btnCfg.pressed = !getHideTreeValue();
                            btnCfg.enableToggle = true;
                        }
                        if (item.name == 'FileMenu') {
                            btnCfg.weight = 3 - item.view;
                        }
                        if (item.name == 'Logout') {
                            btnCfg.hidden = asControl;
                            btnCfg.listeners = {
                                render: function (btn) {
                                    if (typeof events["LogOut"] == "function")
                                        btn.setVisible(true);
                                }
                            };
                            if (cfg.tooltip) {
                                btnCfg['tooltip'] = {
                                    text: htcConfig.locData[cfg.tooltip.textKey],
                                    title: htcConfig.locData[cfg.tooltip.titleKey]
                                };
                            }
                        }
                        // badge configs
                        if (!Ext.isEmpty(cfg.cls)) {
                            btnCfg['cls'] = cfg.cls;
                        }
                    }

                    if (!Ext.isEmpty(secondItmName) && allow && (cfg = toptbarConfig[secondItmName])) {
                        secondBtnCfg = {
                            scale: scale,
                            handler: cfg.handler
                        };
                        if (item.view != 2) {
                            secondBtnCfg['text'] = htcConfig.locData[cfg.textKey]
                        }
                        if (item.view != 1 && cfg.iconName) {
                            secondBtnCfg['icon'] = HttpCommander.Lib.Utils.getIconPath(this, (smallIcon || htcConfig.iconSet.ext.indexOf('png') < 0
                                ? cfg.iconName : (cfg.iconBigName ? cfg.iconBigName : ('24/' + cfg.iconName))));
                            if (htcConfig.iconSet.ext.indexOf('svg') >= 0 && HttpCommander.Lib.Utils.browserIs.ie10standard)
                                secondBtnCfg['icon'] += '?q=toolbar';
                        }
                        if (item.view == 2 && (cfg.textKey || cfg.tooltip)) {
                            if (cfg.textKey) {
                                secondBtnCfg['tooltip'] = { text: htcConfig.locData[cfg.textKey] };
                            } else {
                                secondBtnCfg['tooltip'] = {
                                    text: htcConfig.locData[cfg.tooltip.textKey],
                                    title: htcConfig.locData[cfg.tooltip.titleKey]
                                };
                            }
                        }
                        if (cfg.disabled === true) {
                            secondBtnCfg.disabled = true;
                        }
                        // badge configs
                        if (!Ext.isEmpty(cfg.cls)) {
                            secondBtnCfg['cls'] = cfg.cls;
                        }
                    }

                    if (btnCfg) {
                        if (isRight)
                            rButton = (withHandler && withMenu) ? new Ext.SplitButton(btnCfg) : new Ext.Button(btnCfg);
                        else
                            button = (withHandler && withMenu) ? new Ext.SplitButton(btnCfg) : new Ext.Button(btnCfg);
                    }

                    if (secondBtnCfg) {
                        if (isRight)
                            rsButton = new Ext.Button(secondBtnCfg);
                        else
                            sButton = new Ext.Button(secondBtnCfg);
                    }

                    if (button) {
                        result.push(button);
                        if (item.name == 'Edit') {
                            editOpenTxtButtons.push(button);
                        } else if (item.name == 'MSOEdit') {
                            msoEditButtons.push(button)
                        } else if (item.name == 'OOOEdit') {
                            oooEditButtons.push(button);
                        }
                        (toptbarButtons[itmName] = toptbarButtons[itmName] || []).push(button);
                    }
                    if (sButton) {
                        result.push(sButton);
                        (toptbarButtons[secondItmName] = toptbarButtons[secondItmName] || []).push(sButton);
                    }
                    if (rButton) {
                        rr.push(rButton);
                        if (item.name == 'Edit') {
                            editOpenTxtButtons.push(rButton);
                        } else if (item.name == 'MSOEdit') {
                            msoEditButtons.push(rButton)
                        } else if (item.name == 'OOOEdit') {
                            oooEditButtons.push(rButton);
                        }
                        (toptbarButtons[itmName] = toptbarButtons[itmName] || []).push(rButton);
                    }
                    if (srButton) {
                        rr.push(srButton);
                        (toptbarButtons[secondItmName] = toptbarButtons[secondItmName] || []).push(srButton);
                    }
                }, this);
            } catch (e) {
                ProcessScriptError(e);
            }
            for (var i = 0; i < rr.length; i++) {
                result.push(rr[i]);
            }
            return result;
        };
        try {
            var ttbb1, ttbb2;
            if (htcConfig.toolbarButtons1.length > 0) {
                ttbb1 = getToolbarButtons(htcConfig.toolbarButtons1);
            }
            if (htcConfig.toolbarButtons2.length > 0) {
                ttbb2 = getToolbarButtons(htcConfig.toolbarButtons2);
            }
            if (htcConfig.showControlNavigationFolders) {
                try {
                    controlNavFolders = new HttpCommander.Lib.ControlNavFolders({
                        'htcConfig': htcConfig,
                        'isUsedSmallIcons': function () { return isEmbeddedtoIFRAME || htcConfig.toolbarIconSize == 1; },
                        'openGridFolder': openGridFolder,
                        'getFolderTitle': getFolderTitle
                    });
                } catch (e) {
                    controlNavFolders = null;
                    //ProcessScriptError(e);
                }
            }
            if (typeof ttbb1 != 'undefined' && typeof ttbb2 != 'undefined') {
                toptbar = new Ext.Container({
                    xtype: 'container',
                    layout: 'anchor',
                    defaults: {
                        anchor: '0',
                        cls: 'x-panel-header',
                        enableOverflow: true,
                        xtype: 'toolbar'
                    },
                    items:
                        [
                            { items: ttbb1 },
                            { items: ttbb2 }
                        ]
                });
                if (controlNavFolders) {
                    var toolbar1 = toptbar.items.items[0];
                    if (toolbar1) {
                        toolbar1.insert(0, controlNavFolders.historyBtn);
                        toolbar1.insert(0, controlNavFolders.forwardBtn);
                        toolbar1.insert(0, controlNavFolders.backBtn);
                    }
                }
            } else {
                var ttbb = ttbb1 || ttbb2;
                if (typeof ttbb != 'undefined' || controlNavFolders) {
                    toptbar = new Ext.Toolbar({
                        cls: 'x-panel-header',
                        enableOverflow: true,
                        items: ttbb ? ttbb : []
                    });
                    if (controlNavFolders) {
                        toptbar.insert(0, controlNavFolders.historyBtn);
                        toptbar.insert(0, controlNavFolders.forwardBtn);
                        toptbar.insert(0, controlNavFolders.backBtn);
                    }
                }
            }
        } catch (e) {
            ProcessScriptError(e);
        }
    };

    // Init view
    var initView = function () {
        var showAdditionalHints = function () {
            if (embedded && modal) {
                var xy = xy = extEl.getAlignToXY(Ext.getBody(), 'c-c');
                if (xy[0] < 0) xy[0] = 0;
                if (xy[1] < 0) xy[1] = 0;
                extEl.setLocation(xy[0], xy[1]);
            }
            view.doLayout();

            try { // Show trial
                if (htcConfig.showTrial || htcConfig.showUpgrade) {
                    var message = htcConfig.showTrial ?
                            HttpCommander.Lib.Utils.encrypt("Vmqfdjpwfqfg#03.gbz#fubovbwjlm#ufqpjlm")
                                + (htcConfig.demoExpired === true
                                    ? ".<br /><b style='color:Red;'>Your evaluation period has expired!</b>"
                                    : '.<br />Days left: ' + htcConfig.trialDaysLeft) : "";
                    if (htcConfig.showUpgrade) {
                        if (message.length > 0)
                            message += ".<br /><br />";
                        message += String.format(htcConfig.locData.LicenseCheckMessage,
                            '//www.element-it.com/checklicense.aspx');
                    }
                    Msg.show({
                        title: htcConfig.showTrial ? HttpCommander.Lib.Utils.encrypt("Wqjbo#ufqpjlm") : "Upgrade info",
                        msg: message,
                        icon: htcConfig.demoExpired ? Msg.ERROR : Msg.WARNING,
                        buttons: Msg.OK
                    });
                }
            } catch (e) {
                ProcessScriptError(e);
            }

            try { // Open / Expand symb. link / first root folder
                var symbLink = HttpCommander.Lib.Utils.queryString("symblink");
                var symbLinkExists = false;
                if (symbLink != null && symbLink.length > 0) {
                    if (HttpCommander.Lib.Utils.getFileExtension(symbLink) == 'lnk') {
                        var pathParts = symbLink.split('/');
                        if (pathParts.length > 1) {
                            symbLinkExists = true;
                            var lnkName = pathParts.pop();
                            openShortcut(pathParts.join('/'), lnkName, true);
                        }
                    }
                }
                if (!symbLinkExists) {
                    var selectFileFromUrl = HttpCommander.Lib.Utils.queryString("file"),
                        openFolderFromUrl = HttpCommander.Lib.Utils.queryString("folder"),
                        fileParts = [],
                        folderParts = [];
                    if (selectFileFromUrl && selectFileFromUrl != '') {
                        var filePartsTmp = selectFileFromUrl.split('/');
                        while (filePartsTmp.length > 0 && filePartsTmp[filePartsTmp.length - 1].trim().length == 0)
                            filePartsTmp.pop();
                        if (filePartsTmp.length > 0) {
                            selectFileFromUrl = filePartsTmp.pop();
                            Ext.each(filePartsTmp, function (part) {
                                if (part.trim().length > 0)
                                    fileParts.push(part);
                            });
                        } else
                            selectFileFromUrl = null;
                    } else {
                        selectFileFromUrl = null;
                    }
                    if (openFolderFromUrl && openFolderFromUrl != '') {
                        var folderPartsTmp = openFolderFromUrl.split('/');
                        while (folderPartsTmp.length > 0 && folderPartsTmp[folderPartsTmp.length - 1].trim().length == 0)
                            folderPartsTmp.pop();
                        Ext.each(folderPartsTmp, function (part) {
                            if (part.trim().length > 0)
                                folderParts.push(part);
                        });
                    }
                    openFolderFromUrl = folderParts.concat(fileParts).join('/');

                    if (tree && getTreeViewValue() != 'disabled') {
                        if (openFolderFromUrl == null || openFolderFromUrl.length == 0) {
                            tree.getRootNode().expand(false, false, function (node) {
                                var firstChild = node.childNodes[0];
                                //var isRecent = false;
                                if (firstChild && htcConfig.autoOpen) {
                                    var path = firstChild.attributes.path;
                                    //var isRecent = isRecentFolder(path);
                                    //if (isRecent) {
                                        openGridFolder(path, true, true);
                                    //} else {
                                        openGridFolder(path, true, true);
                                    //}
                                } else {
                                    openGridFolder('root');
                                }
                                //if (htcConfig.enableRecents) {
                                //    setTimeout(function () {
                                //        openTreeNode(_RECENT_ + '/-1', true, true);
                                //    }, 100);
                                //}
                            });
                        } else {
                            if (selectFileFromUrl != null && selectFileFromUrl.length > 0)
                                selectPath = { name: selectFileFromUrl, path: openFolderFromUrl };
                            //var isRecent = isRecentFolder(openFolderFromUrl);
                            //if (isRecent) {
                            //    openGridFolder(openFolderFromUrl, true, true);
                            //} else {
                                openGridFolder(openFolderFromUrl, true, true);
                                //if (htcConfig.enableRecents) {
                                //    setTimeout(function () {
                                //        openTreeNode(_RECENT_ + '/-1', true, true);
                                //    }, 100);
                                //}
                            //}
                        }
                    } else {
                        if (openFolderFromUrl != null && openFolderFromUrl.length > 0) {
                            if (selectFileFromUrl != null && selectFileFromUrl.length > 0)
                                selectPath = { name: selectFileFromUrl, path: openFolderFromUrl };
                            openGridFolder(openFolderFromUrl);
                        } else {
                            openGridFolder('root');
                        }
                    }
                }
            } catch (e) {
                ProcessScriptError(e);
            }

            try { // Show welcome window
                if (welcome && !Ext.isEmpty(welcome.message) && welcome.message.trim().length > 0) {
                    var showCb = (htcConfig.welcomeWindowAllowHide === true),
                        show = true;
                    if (showCb) {
                        var cce = HttpCommander.Lib.Utils.getCookie($("htcwwm"));
                        if (!Ext.isEmpty(cce) && (cce == 'yes' || cce == '1' || cce == 'true')) {
                            show = false;
                        }
                    }
                    if (show) {
                        (new Window({
                            title: (welcome.title && welcome.title != '') ? welcome.title : 'Welcome window',
                            bodyStyle: 'padding: 5px',
                            layout: 'fit',
                            width: 400,
                            height: 200,
                            buttonAlign: 'center',
                            closeAction: 'close',
                            collapsible: false,
                            minimizable: false,
                            closable: true,
                            resizable: false,
                            maximizable: false,
                            modal: true,
                            plain: true,
                            autoHeight: true,
                            items: [{
                                xtype: 'label',
                                hideLabel: true,
                                autoHeight: true,
                                margins: '0 0 5 0',
                                html: welcome.message + (showCb ? '<br /><br />' : '')
                            }, {
                                itemId: 'hide-wwm-cb',
                                xtype: 'checkbox',
                                boxLabel: htcConfig.locData.WelcomeWindowHideCheckboxLabel,
                                autoHeight: true,
                                hidden: !showCb
                            }],
                            listeners: {
                                hide: function (wnd) {
                                    HttpCommander.Lib.Utils.deleteCookie($("htcwwm"));
                                    var cb = wnd.getComponent('hide-wwm-cb');
                                    if (cb && cb.isVisible && cb.getValue()) {
                                        HttpCommander.Lib.Utils.setCookie($("htcwwm"), "1");
                                    }
                                }
                            },
                            buttons: [{
                                text: 'OK',
                                handler: function () {
                                    var wnd = this.ownerCt.ownerCt;
                                    wnd.hide();
                                }
                            }]
                        })).show();
                    }
                }
            } catch (e) {
                ProcessScriptError(e);
            }

            try { // Show remained days password
                if (typeof htcConfig.remainedDaysPassword != 'undefined' && htcConfig.remainedDaysPassword != null
                    && Ext.isNumber(htcConfig.remainedDaysPassword)) {
                    var passExpMsg = '';
                    if (htcConfig.remainedDaysPassword < 0) {
                        passExpMsg = htcConfig.locData.PasswordExpiredMessage;
                    } else {
                        passExpMsg = String.format(htcConfig.locData.PasswordExpiresMessage, htcConfig.remainedDaysPassword);
                    }
                    if (htcConfig.changePassword) {
                        passExpMsg += '<br /><br />' + String.format(htcConfig.locData.PasswordChangeMessage, '<b>',
                                htcConfig.locData.CommandSettings, htcConfig.locData.CommandChangePassword, '</b>');
                    }
                    Msg.show({
                        title: htcConfig.locData.PasswordExpiresTitle,
                        msg: passExpMsg,
                        closable: true,
                        modal: true,
                        buttons: Msg.CANCEL,
                        icon: Msg.WARNING
                    });
                }
            } catch (e) {
                ProcessScriptError(e);
            }
        };

        try { // view
            var header = logoHeader && logoHeader.html && logoHeader.html != '';
            var headerCfg = undefined;
            if (header || (embedded && (showHideIcon || draggable))) {
                headerCfg = { cls: 'x-panel-header' };
                headerCfg['html'] = header ? logoHeader.html : '&nbsp;';
            }
            var mask;
            // Get this iframe if exists
            var iframeEl = (function () {
                try {
                    if (parent != null) {
                        var iframes = parent.document.getElementsByTagName('iframe');
                        for (var i = 0; i < iframes.length; i++) {
                            if (iframes[i].contentWindow == window) {
                                return iframes[i];
                            }
                        }
                    }
                } catch (error) {
                    // ignore
                }
                return null;
            })();
            var winResizeFunc = function () {
                if (view) {
                    var b = Ext.getBody();
                    if (b) {
                        view.setSize(b.getViewSize());
                    }
                }
            };
            var getStyle = function (element) {
                if (element) {
                    return window.getComputedStyle ? getComputedStyle(element, '') : element.currentStyle;
                }
                return null;
            };
            // Maximize and minimize handler action
            var minimizeHandler = function (event, toolEl, panel, tc) {
                if (iframeEl != null) {

                    if (panel.getTool('restore')) {
                        panel.getTool('restore').hide();
                    }
                    if (panel.getTool('maximize')) {
                        panel.getTool('maximize').show();
                    }

                    if (iframeEl.restoreStyle) {
                        for (var prop in iframeEl.restoreStyle) {
                            iframeEl.style[prop] = iframeEl.restoreStyle[prop];
                        }
                        delete iframeEl.restoreStyle;
                    }

                    if (iframeEl.parentPositions && iframeEl.parentPositions.length > 0) {
                        var parentEl = iframeEl.parentNode;
                        var i = 0;
                        do {
                            if (parentEl.style && iframeEl.parentPositions[i]) {
                                parentEl.style.position = iframeEl.parentPositions[i];
                            }
                            i++;
                        } while ((parentEl = parentEl.parentNode) && (i < iframeEl.parentPositions.length));
                        delete iframeEl.parentPositions;
                    }
                    if (iframeEl.htmlOverflow) {
                        try {
                            parent.document.documentElement.style.overflow = iframeEl.htmlOverflow;
                            delete iframeEl.htmlOverflow;
                        } catch (e1) { }
                    }
                    if (iframeEl.bodyOverflow) {
                        try {
                            parent.document.body.style.overflow = iframeEl.bodyOverflow;
                            delete iframeEl.bodyOverflow;
                        } catch (e2) { }
                    }
                    if (iframeEl.oldScrolling) {
                        iframeEl.scrolling = iframeEl.oldScrolling;
                        delete iframeEl.oldScrolling;
                    }

                    panel.maximized = false;
                    iframeEl.maximized = false;

                    return;
                }

                Ext.EventManager.removeResizeListener(winResizeFunc, panel);

                panel.el.removeClass('x-window-maximized');

                if (panel.getTool('restore')) {
                    panel.getTool('restore').hide();
                }
                if (panel.getTool('maximize')) {
                    panel.getTool('maximize').show();
                }

                if (extEl.resizer) {
                    extEl.resizer.enabled = true;
                }

                var vs = panel.container;
                vs.removeClass('x-window-maximized-ct');
                if (panel.restoreStyle) {
                    vs.setStyle(panel.restoreStyle);
                    delete panel.restoreStyle;
                }
                if (panel.restorePos) {
                    panel.setPosition(panel.restorePos[0], panel.restorePos[1]);
                    delete panel.restorePos;
                }
                if (panel.restoreSize) {
                    panel.setSize(panel.restoreSize.width, panel.restoreSize.height);
                    delete panel.restoreSize;
                }

                panel.maximized = false;
                if (panel.el.enableShadow) {
                    panel.el.enableShadow(true);
                }
                if (panel.dd) {
                    panel.dd.unlock();
                }
                if (extEl.dd) {
                    extEl.dd.unlock();
                }
                if (panel.collapsible && panel.getTool('toggle')) {
                    panel.getTool('toggle').show();
                }
            };
            var maximizeHandler = function (event, toolEl, panel, tc) {
                if (iframeEl != null) {
                    try {
                        parent.scrollTo(0, 0);
                    } catch (e1) { }

                    if (panel.getTool('restore')) {
                        panel.getTool('restore').show();
                    }
                    if (panel.getTool('maximize')) {
                        panel.getTool('maximize').hide();
                    }

                    // save current style
                    var hcStyle = getStyle(iframeEl);
                    if (hcStyle) {
                        iframeEl.restoreStyle = {
                            position: hcStyle.position,
                            left: hcStyle.left,
                            top: hcStyle.top,
                            width: hcStyle.width,
                            height: hcStyle.height,
                            zIndex: hcStyle.zIndex,
                            overflow: hcStyle.overflow
                        }
                    }

                    // save and change 'position:static' for parent nodes
                    var parentEl = iframeEl.parentNode;
                    var cs;
                    iframeEl.parentPositions = [];
                    do {
                        if (parentEl.style) {
                            cs = getStyle(parentEl);
                            if (cs) {
                                iframeEl.parentPositions.push(cs.position);
                            }
                            parentEl.style.position = 'static';
                        }
                    } while (parentEl = parentEl.parentNode);

                    // save and change overflow for html and body
                    try {
                        var csHtml = getStyle(parent.document.documentElement);
                        if (csHtml) {
                            iframeEl.htmlOverflow = csHtml.overflow;
                        }
                        parent.document.documentElement.style.overflow = 'hidden';
                        var csBody = getStyle(parent.document.body);
                        if (csBody) {
                            iframeEl.bodyOverflow = csBody.overflow;
                        }
                        parent.document.body.style.overflow = 'hidden';
                    } catch (e2) { }

                    // change iframe styles
                    iframeEl.style.position = 'absolute';
                    iframeEl.style.left = '0px';
                    iframeEl.style.top = '0px';
                    iframeEl.style.width = '100%';
                    iframeEl.style.height = '100%';
                    iframeEl.style.overflow = 'hidden';
                    iframeEl.oldScrolling = iframeEl.scrolling;
                    iframeEl.scrolling = 'no';

                    panel.maximized = true;
                    iframeEl.maximized = true;

                    return;
                }
                panel.expand(false);
                panel.restoreSize = panel.getSize();
                panel.restorePos = panel.getPosition(true);
                var vs = panel.container;
                panel.restoreStyle = {
                    width: vs.getStyle('width'),
                    height: vs.getStyle('height'),
                    position: vs.getStyle('position'),
                    left: vs.getStyle('left'),
                    top: vs.getStyle('top')
                };

                if (panel.getTool('maximize')) {
                    panel.getTool('maximize').hide();
                }
                if (panel.getTool('restore')) {
                    panel.getTool('restore').show();
                }
                if (panel.el.disableShadow) {
                    panel.el.disableShadow();
                }
                if (panel.dd) {
                    panel.dd.lock();
                }
                if (extEl.dd) {
                    extEl.dd.lock();
                }
                if (panel.collapsible && panel.getTool('toggle')) {
                    panel.getTool('toggle').hide();
                }
                if (extEl.resizer) {
                    extEl.resizer.enabled = false;
                }

                panel.el.addClass('x-window-maximized');
                vs.addClass('x-window-maximized-ct');
                vs.setStyle({
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    left: '0px',
                    top: '0px'
                });
                panel.setPosition(0, 0);
                var b = Ext.getBody();
                panel.setSize(b.getViewSize());
                panel.maximized = true;
                Ext.EventManager.onWindowResize(winResizeFunc, panel);
            };
            var viewTools = [];
            if (showMaximizedButton) {
                viewTools.push({
                    id: 'restore',
                    hidden: (iframeEl != null && !iframeEl.maximized) || ((htcConfig.insideDiv == true) && embedded),
                    handler: function (event, toolEl, panel, tc) {
                        if (iframeEl == null && !embedded) {
                            Msg.alert('',
                                    'You have enabled parameter <b>ShowFullScreenOrExitFullScreenButton=true</b> ' +
                                    'but DIV with <b>id="httpcommander"</b> not found.<br />' +
                                    'See manual at ' +
                                    '<a target="_black" href="' + htcConfig.relativePath + 'Manual/webconfigsetup.html#ShowFullScreenOrExitFullScreenButton">ShowFullScreenOrExitFullScreenButton parameter</a>');
                        } else if ((iframeEl != null && iframeEl.maximized) || panel.maximized) {
                            minimizeHandler(event, toolEl, panel, tc);
                        }
                        return panel;
                    }
                });
                if (embedded || iframeEl != null) {
                    viewTools.push({
                        id: 'maximize',
                        hidden: (iframeEl != null && iframeEl.maximized === true) || (iframeEl == null && (typeof htcConfig.insideDiv == 'undefined' || htcConfig.insideDiv === false)),
                        handler: function (event, toolEl, panel, tc) {
                            if ((iframeEl != null && !iframeEl.maximized) || !panel.maximized) {
                                maximizeHandler(event, toolEl, panel, tc);
                            }
                            return panel;
                        }
                    });
                }
            }
            if (showHideIcon && embedded) {
                viewTools.push({
                    id: 'close',
                    qtip: htcConfig.locData.ControlHideFileManager,
                    handler: function (e, t, p) {
                        fm.Hide();
                    }
                });
            }
            if (viewTools.length == 0) {
                viewTools = undefined;
            }
            if (sharedGrid || sharedFYGrid) {
                var cwItems = [grid];
                if (sharedGrid) {
                    cwItems.push(sharedGrid);
                }
                if (sharedFYGrid) {
                    cwItems.push(sharedFYGrid);
                }
                cardSwitchGrid = new Ext.Panel({
                    layout: 'card',
                    activeItem: 0,
                    header: false,
                    region: 'center',
                    border: false,
                    items: cwItems
                });
            }
            var mainItemsArr = [];

            if (htcConfig.enableDetailsPane) {
                try {
                    detailsPane = HttpCommander.Lib.DetailsPane({
                        'htcConfig': htcConfig,
                        'Msg': Msg,
                        '$': $,
                        'globalLoadMask': globalLoadMask,
                        'getIsEmbeddedtoIFRAME': function () { return isEmbeddedtoIFRAME; },
                        'getRenderers': function () { return renderers; },
                        'getMetadataProvider': function () { return metadataProvider; },
                        'getDebugMode': function () { return debugmode; },
                        'getGrid': function () { return grid; },
                        'isSpecialTreeFolderOrSubFolder': isSpecialTreeFolderOrSubFolder,
                        'openGridFolder': openGridFolder,
                        'getHideDetailsPaneValue': getHideDetailsPaneValue,
                        'setSelectPath': function (v) { selectPath = v; },
                        'getCurrentFolder': getCurrentFolder,
                        'getMetadataWindow': function () { return metadataWindow; },
                        'getAvatarHtml': getAvatarHtml,
                        'getSelectedRow': function () {
                            var sm = null; sel = null;
                            if (!!grid && grid.rendered && !grid.hidden) {
                                sm = grid.getSelectionModel();
                                if (!!sm) {
                                    sel = sm.getSelected();
                                }
                            }
                            return sel;
                        },
                        'isRootFolder': isRootFolder
                    });
                } catch (e) {
                    detailsPane = null;
                    ProcessScriptError(e);
                }
            }

            if (embedded) {
                mainItemsArr = [(cardSwitchGrid ? cardSwitchGrid : grid)];
                if (tree && getTreeViewValue() != 'disabled') {
                    mainItemsArr.unshift(tree);
                }
                if (!!detailsPane) {
                    mainItemsArr.unshift(detailsPane);
                }
                view = new Ext.Panel({
                    renderTo: extEl,
                    width: extEl.getWidth(),
                    height: extEl.getHeight(),
                    layout: 'border',
                    style: resizable ? { padding: '6px'} : undefined,
                    header: header || showHideIcon || draggable,
                    headerCfg: headerCfg,
                    items: mainItemsArr,
                    tbar: toptbar,
                    tools: viewTools,
                    listeners: {
                        afterrender: function (p) {
                            if (iframeEl == null && (typeof htcConfig.insideDiv == 'undefined' || htcConfig.insideDiv === false)) {
                                if (p.getTool('maximize')) {
                                    maximizeHandler(null, null, p, null);
                                }
                            }
                        }
                    }
                });
                if (resizable) { // init resizer resizable
                    extEl.resizer = new Ext.Resizable(extEl, {
                        handles: 'all',
                        minWidth: 300,
                        minHeight: 200,
                        pinned: true,
                        handleCls: 'x-window-handle',
                        listeners: {
                            resize: function (r, w, h, e) {
                                view.setSize(extEl.getWidth(), extEl.getHeight());
                            }
                        }
                    });
                }
                if (draggable && view.header) { // init drag-drop manager for view
                    extEl.dd = new Ext.dd.DD(extEl.id, $('view'), {
                        moveOnly: true,
                        scroll: false
                    });
                    extEl.dd.setHandleElId(view.header.id);
                }
                if (modal) { // init modal mode
                    mask = Ext.getBody().createChild({ cls: 'ext-el-mask-modal' });
                    mask.enableDisplayMode('block');
                    if (hidden) {
                        mask.hide();
                        Ext.getBody().removeClass('x-body-masked');
                    } else {
                        Ext.getBody().addClass('x-body-masked');
                        mask.setSize(Ext.lib.Dom.getViewWidth(true), Ext.lib.Dom.getViewHeight(true));
                        mask.show();
                    }
                }
            } else {
                var northPanel = new Ext.Panel({
                    tools: viewTools,
                    region: 'north',
                    header: header,
                    headerCfg: headerCfg,
                    tbar: toptbar,
                    bodyBorder: false,
                    bodyStyle: { height: '0px' },
                    autoHeight: true,
                    listeners: {
                        resize: function (selfPanel) {
                            selfPanel.body.dom.style.height = '0px';
                        }
                    }
                });
                mainItemsArr = [(cardSwitchGrid ? cardSwitchGrid : grid)];
                if (tree && getTreeViewValue() != 'disabled') {
                    mainItemsArr.unshift(tree);
                }
                if (!!detailsPane) {
                    mainItemsArr.unshift(detailsPane);
                }
                mainItemsArr.unshift(northPanel);
                view = new Ext.Viewport({
                    layout: 'border',
                    items: mainItemsArr,
                    listeners: {
                        afterrender: function (selfView) {
                            if (showMaximizedButton && iframeEl != null && !iframeEl.maximized && (typeof htcConfig.insideDiv == 'undefined' || htcConfig.insideDiv === false)) {
                                if (northPanel.getTool("restore")) {
                                    maximizeHandler(null, null, northPanel, null);
                                }
                            }
                            selfView.syncSize();
                            selfView.el.dom.parentNode.onresize = function () {
                                selfView.syncSize();
                            };
                            window.onresize = function () {
                                selfView.syncSize();
                            };
                        }
                    }
                });
            }
            view.on('show', showAdditionalHints, view, { single: true });
            fm.Show = function () {
                if (embedded) {
                    if (modal) {
                        Ext.getBody().addClass('x-body-masked');
                        if (mask) {
                            mask.setSize(Ext.lib.Dom.getViewWidth(true), Ext.lib.Dom.getViewHeight(true));
                            mask.show();
                        }
                    }
                    extEl.show();
                    view.setSize(extEl.getWidth(), extEl.getHeight());
                }
                view.show();
                hidden = false;
                onShow();
            };
            fm.Hide = function () {
                if (embedded) {
                    if (modal) {
                        if (mask) {
                            mask.hide();
                        }
                        Ext.getBody().removeClass('x-body-masked');
                    }
                    view.hide();
                    extEl.setVisibilityMode(Ext.Element.DISPLAY);
                    extEl.hide();
                    hidden = true;
                    onHide();
                } else {
                    hidden = false;
                }
            };
            if (hidden && embedded) {
                fm.Hide();
            } else {
                fm.Show();
            }
        } catch (e) {
            throw e;
        }
    };

    // Set theme functions
    var setActiveStyleSheet = function (title) {
        Ext.util.CSS.swapStyleSheet(
                'httpcommander-default-theme',
                String.format(
                    '{0}Images/resources_1.5/css/{1}{2}.css',
                    htcConfig.relativePath,
                    styleName == 'default' ? 'ext-all' : 'xtheme-' + styleName,
                    debugmode ? '' : '-min'
                )
            );
        if (grid) {
            grid.getView().refresh();
        }
    };
    var setThemeFromCookie = function () {
        var styleCookie = HttpCommander.Lib.Utils.getCookie("htctheme");
        styleName = styleCookie ? styleCookie : "default";
        setActiveStyleSheet(styleName);
    };

    // Init Google Drive auth object
    var initGoogleDriveAuth = function () {
        if (htcConfig.isAllowedGoogleDrive || htcConfig.enableGoogleEdit) {
            try {
                googleDriveAuth = HttpCommander.Lib.GoogleDriveAuth({
                    'htcConfig': htcConfig,
                    'Msg': Msg,
                    'globalLoadMask': globalLoadMask,
                    'isDemoMode': function () { return isDemoMode; }
                });
            } catch (e) {
                ProcessScriptError(e);
            }
        }
    };

    // Init SkyDrive auth object
    var initSkyDriveAuth = function () {
        if (htcConfig.isAllowedSkyDrive || htcConfig.enableMSOOEdit) {
            try {
                skyDriveAuth = HttpCommander.Lib.SkyDriveAuth({
                    'htcConfig': htcConfig,
                    'Msg': Msg,
                    'globalLoadMask': globalLoadMask,
                    'getDebugMode': function () { return debugmode; },
                    'getFileManagerInstance': function () { return fm; },
                    'getUid': function () { return uid; },
                    'isDemoMode': function () { return isDemoMode; }
                });
                if (skyDriveAuth)
                    skyDriveAuth.init();
            } catch (e) {
                ProcessScriptError(e);
            }
        }
    };

    // Init Box auth object
    var initBoxAuth = function () {
        if (htcConfig.isAllowedBox) {
            try {
                boxAuth = HttpCommander.Lib.BoxAuth({
                    'htcConfig': htcConfig,
                    'Msg': Msg,
                    'globalLoadMask': globalLoadMask,
                    'getUid': function () { return uid; },
                    'getFileManagerInstance': function () { return fm; },
                    'isDemoMode': function () { return isDemoMode; }
                });
            } catch (e) {
                ProcessScriptError(e);
            }
        }
    };

    // Init Dropbox auth object
    var initDropboxAuth = function () {
        if (htcConfig.isAllowedDropbox) {
            try {
                dropboxAuth = HttpCommander.Lib.DropboxAuth({
                    'htcConfig': htcConfig,
                    'Msg': Msg,
                    'globalLoadMask': globalLoadMask,
                    'isDemoMode': function () { return isDemoMode; }
                });
            } catch (e) {
                ProcessScriptError(e);
            }
        }
    };

    // Main function
    var extOnReadyFunction = function () {
        extOnReadyInvoked = true;
        if (rendered)
            return;

        try {
            if (isAccessTheme) {
                Ext.getBody().addClass('access-theme-font-color');
            }
        } catch (e) {
            // ignore
        }

        // Set theme from cookie
        //setThemeFromCookie();

        // Invoke preload event
        onPreRender();

        // Set BLANK_IMAGE_URL for IE7-
        if (Ext.isIE6 || Ext.isIE7 || Ext.isAir) {
            Ext.BLANK_IMAGE_URL = htcConfig.relativePath + 'Images/resources_1.5/images/default/s.gif';
        }

        // Check Microsoft Edge and add ext-edge css for body
        try {
            if (HttpCommander.Lib.Utils.browserIs.edge) {
                var bd = document.body || document.getElementsByTagName('body')[0];
                if (!!bd) {
                    bd.className += ' ext-edge';
                }
            }
        } catch (e) {
            if (!!window.console && !!window.console.log) {
                window.console.log(e);
            }
        }

        // Initialize quick tips
        initQuickTips();

        try { // Get Ext.Element container for this FileManager instance
            extEl = embedded ? Ext.get(container) : Ext.getBody();
            if (!extEl || extEl.dom.tagName.toLowerCase() != 'div' || (!asControl && (typeof htcConfig.insideDiv == 'undefined' || htcConfig.insideDiv === false) && (typeof htcConfig.showFullScreenOrExitFullScreenButton == 'undefined' || htcConfig.showFullScreenOrExitFullScreenButton === false))) {
                container = null;
                embedded = false;
                extEl = Ext.getBody();
            } else {
                embedded = true;
            }
            // Disable default browser selection on FileManager container
            HttpCommander.Lib.Utils.preventSelection(extEl.dom, ProcessScriptError);
        } catch (e) {
            ProcessScriptError(e);
        }

        Ext.enableFx = true;

        try { // Thumbnail template definition
            maxWidthThumb = htcConfig.maxWidthThumb || 100;
            maxHeightThumb = htcConfig.maxHeightThumb || 100;
            thumbnailTpl = new Ext.Template(
                    '<div class="thumbnailWraper {cls}" style="height:' + (maxHeightThumb + 25) + 'px;width:' + (maxWidthThumb + 20) + 'px;">' +
                    '<div class="thumb" style="height:' + maxHeightThumb + 'px;width:' + (maxWidthThumb + 10) + 'px;">{thumbnail}</div>' +
                    '<div class="filename"><span ext:qtip="{name}" unselectable="on">{viewname}</span></div></div>'
                );
        } catch (e) {
            ProcessScriptError(e);
        }

        try { // Global load mask definition
            globalLoadMask = new Ext.LoadMask(extEl, {
                msg: htcConfig.locData.ProgressLoading + "..."
            });
        } catch (e) {
            ProcessScriptError(e);
        }

        // Get and set 'isEmbeddedtoIFRAME' value and change width of message boxes
        isEmbeddedtoIFRAME = embedded || (htcConfig.isEmbeddedtoIFRAME || isEmbeddedtoIFRAME);
        if (getParamBooleanValue('isEmbeddedtoIFRAME'))
            isEmbeddedtoIFRAME = true;

        try { // Msg definition
            Msg = (isEmbeddedtoIFRAME || embedded) ? HttpCommander.Lib.MessageBox({
                container: extEl, maxWidth: 400
            }) : Ext.Msg;
            if (htcConfig.locData) Ext.apply(Msg.buttonText, {
                yes: htcConfig.locData.ExtMsgButtonTextYES || Msg.buttonText.yes,
                no: htcConfig.locData.ExtMsgButtonTextNO || Msg.buttonText.no,
                ok: htcConfig.locData.CommonButtonCaptionOK || Msg.buttonText.ok,
                cancel: htcConfig.locData.CommonButtonCaptionCancel || Msg.buttonText.cancel
            });
            fm.messageBoxHide = function () {
                if (Msg) Msg.hide();
                else if (Ext.Msg) Ext.Msg.hide();
            }
        } catch (e) {
            ProcessScriptError(e);
        }

        try { // Window definition
            Window = embedded ? HttpCommander.Lib.Window(extEl) : Ext.Window;
        } catch (e) {
            ProcessScriptError(e);
        }

        if (connectionClassObserved !== true) {
            try {
                Ext.util.Observable.observeClass(Ext.data.Connection);
                Ext.data.Connection.on('requestcomplete', function (dataconn, response) {
                    try { // we can search something special in response text response.responseText;
                        var status = null;
                        if (Ext.isFunction(response.getResponseHeader)) {
                            status = response.getResponseHeader('X-HttpCommander-Status');
                        }
                        if (!asControl && status && status == 0) {
                            window.location.href = htcConfig.relativePath + 'Logout.aspx';
                            return;
                        }
                    } catch (e) {
                        ProcessScriptError(e);
                    }
                    if (activityMonitor && Ext.isFunction(activityMonitor.killSessionTaskReset)) {
                        activityMonitor.killSessionTaskReset();
                    }
                });
                connectionClassObserved = true;
            } catch (e) {
                ProcessScriptError(e);
            }
        }

        try { // Show default browser context menu for types elements from 'browserContextMenuTypes' array.
            extEl.on('contextmenu', function (event, object) {
                try {
                    if (object && object.type && HttpCommander.Lib.Consts.browserContextMenuTypes.indexOf(object.type.toLowerCase()) != -1) {
                        if (window.event) window.event.returnValue = true;
                        return true;
                    } else {
                        event.stopEvent();
                        return false;
                    }
                } catch (e) {
                    ProcessScriptError(e);
                }
            });
        } catch (e) {
            ProcessScriptError(e);
        }

        try { // Needed providers
            Ext.Direct.addProvider(HttpCommander.Remote.TreeHandler);
            Ext.Direct.addProvider(HttpCommander.Remote.GridHandler);
            Ext.Direct.addProvider(HttpCommander.Remote.CommonHandler);
        } catch (e) {
            ProcessScriptError(e);
            return fm;
        }
        try { // Optional providers
            Ext.Direct.addProvider(HttpCommander.Remote.AdminHandler);
            metadataProvider = Ext.Direct.addProvider(HttpCommander.Remote.MetadataHandler);
            Ext.Direct.addProvider(HttpCommander.Remote.GoogleDriveHandler);
            Ext.Direct.addProvider(HttpCommander.Remote.UploadFromURLHandler);
            Ext.Direct.addProvider(HttpCommander.Remote.DropboxHandler);
            Ext.Direct.addProvider(HttpCommander.Remote.SkyDriveHandler);
            Ext.Direct.addProvider(HttpCommander.Remote.OneDriveForBusinessHandler);
            Ext.Direct.addProvider(HttpCommander.Remote.BoxHandler);
            Ext.Direct.addProvider(HttpCommander.Remote.VideoHandler);
        } catch (e) {
            ProcessScriptError(e);
        }

        try { // Hide loading mask
            var loading = Ext.get($('loading'));
            if (loading) {
                loading.fadeOut({ duration: 0.2, remove: true });
                var loadingMask = Ext.get($('loading-mask'));
                loadingMask.setOpacity(0.9);
                loadingMask.shift({
                    xy: loading.getXY(),
                    width: loading.getWidth(),
                    height: loading.getHeight(),
                    remove: true,
                    duration: 1,
                    opacity: 0.1,
                    easing: 'bounceOut'
                });
            }
        } catch (e) {
            ProcessScriptError(e);
        }

        try { // Fill logo header and welcome window
            if (typeof htcConfig.demoLogoHeader == 'string' && htcConfig.demoLogoHeader.trim() != '') {
                logoHeader.html = htcConfig.demoLogoHeader
                    .replace(/\{0\}/g, htcConfig.relativePath)
                    .replace(/\{1\}/g, uid)
                    .replace(/\{2\}/g, embedded || isEmbeddedtoIFRAME ? 'display:none!important;' : '')
                    .replace(/\{3\}/g, embedded || isEmbeddedtoIFRAME ? '' : 'padding-top:33px;');
                isDemoMode = true;
            } else if (typeof htcConfig.logoHeaderHtml == 'string' && htcConfig.logoHeaderHtml.trim() != '') {
                logoHeader.html = htcConfig.logoHeaderHtml.replace(/\{0\}/g, htcConfig.relativePath).replace(/\{1\}/g, uid);
            }
            if (!Ext.isEmpty(htcConfig.welcomeWindowMessage) && htcConfig.welcomeWindowMessage.trim().length > 0) {
                welcome.message = htcConfig.welcomeWindowMessage.trim();
            }
        } catch (e) {
            ProcessScriptError(e);
        }

        if (vTypesApplied !== true) {
            try { // Add the additional 'advanced' VTypes
                Ext.apply(Ext.form.VTypes, {
                    password: function (val, field) {
                        if (field.initialPassField) {
                            var pwd = Ext.getCmp(field.initialPassField);
                            return (val == pwd.getValue());
                        }
                        return true;
                    },
                    passwordText: htcConfig.locData.LinkToFilePasswordNotMatch
                });
                vTypesApplied = true;
            } catch (e) {
                ProcessScriptError(e);
            }
        }

        // Set paging enabled
        if (typeof htcConfig.itemsPerPage == 'number') {
            pagingEnabled = htcConfig.itemsPerPage > 0;
        }

        // Init main objects
        initTree();             // tree
        initGrid();             // grid
        initMenu();             // menu
        initMenuActions();      // menu actions
        initToolBar();          // top toolbar
        initView();             // view
        initMainDropZone();     // main drop zone
        initGoogleDriveAuth();  // init gapi auth object
        initSkyDriveAuth();     // init WL auth object
        initDropboxAuth();      // init Dropbox auth object
        initBoxAuth();          // init Box auth object

        rendered = true;

        // Create activity monitor for windows version
        if (Ext.isNumber(htcConfig.sessionTimeout) && htcConfig.sessionTimeout > 0) {
            activityMonitor = new HttpCommander.Lib.ActivityMonitor({
                'htcConfig': htcConfig,
                'debug': debugmode
            });
        }

        // Invoke load event
        onRender();
    }; // end of extOnReadyFunction()
    initQuickTips();
    try {
        Ext.onReady(extOnReadyFunction);
    } catch (e) {
        throw e;
    }
    fm.Render = function () {
        extOnReadyFunction();
    };

    hcMain.FileManagers[uid] = fm;

    return fm; // Return instance of InitFileManager class
}; // end of InitFileManager

/** End (Public members) */

return hcMain; // Return singleton instance of HttpCommander.Main class
})();