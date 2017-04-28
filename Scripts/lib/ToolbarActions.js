Ext.ns('HttpCommander.Lib');

/* config: htcConfig, getMenuActions(), getLogoBtn(),
 getTree(), initAndShowSearch(), initUploaders(),
 Msg, showHelpWindow(), asControl(), onLogOut(),
 getClipboard(), toggleToolbarButtons(), getGrid(),
 getCurrentFolder(), getCurrentFolder(), createSelectedSet(),
 initMetadata, openGridFolder(), initOfficeEditor(),
 downloadToGoogle(), downloadToDropbox(), downloadToSkyDrive(),
 virtualFilePath(), prepareAndShowMakePublicLinkWindow(),
 prepareAndShowlinksToWebFoldersWindow(), 
 initAndShowSyncWebFoldersHelpWindow(), initZipContent(),
 isExtensionAllowed(), getSelTypeFilesModel(),
 getCurrentPerms(), getViewEditSubMenu(), getShareSubMenu(), getMoreSubMenu(),
 downloadToBox(), initAndShowViewLinksWindow(),
 getTreeViewValue(), getLabelsMenu(), supportsWebGlCanvasForAutodesk(),
 getEditOpenTxtButtons(), getMsoEditButtons(), getOooEditButtons(),
 openInMsoNewWay(), isRecentFolder(), isTrashFolder(), getTrashSubMenu(),
 isSharedTreeFolder(), getSharedGrid(), getWatchSubMenu(), isAlertsFolder(),
 isSharedForYouTreeFolder(), getSharedFYGrid(), initAndShowSelectFolder()
*/
HttpCommander.Lib.ToolbarActions = function (config) {
    var copyCutFunc = function (cutOrCopy, dlg) {
        var isCut = cutOrCopy === true;
        var clipboard = config.getClipboard();
        if (clipboard) {
            var curFolder = config.getCurrentFolder();
            clipboard.setItems(config.createSelectedSet(
                config.getGrid(), curFolder));
            clipboard.srcPath = curFolder;
            clipboard.isCut = isCut;
            config.toggleToolbarButtons();
            if (dlg === true) {
                config.initAndShowSelectFolder(curFolder, isCut ? 'move' : 'copy');
            }
        }
    };
    var newObjectAllowed = function (perms, selType, _ext_, selFiles, selItems) {
        return perms && perms.create && selType && selType != "empty";
    };
    var unzipAllowed = function (perms, selType, _ext_, selFiles, selItems) {
        return perms && perms.unzip && selType == "file" && _ext_ == ";zip;";
    };
    var allowDownloadToCloud = function (perms, selType, _ext_, selFiles, selItems, rowData, selFolders) {
        return perms && perms.download && (selFiles > 0 || selFolders > 0);
    };
    var self = {
        'Logo': {
            handler: function () {
                var logoBtn = config.getLogoBtn();
                if (logoBtn.url && logoBtn.url != '') {
                    if (logoBtn.showInNewWindow) {
                        window.open(logoBtn.url);
                    } else {
                        window.location.href = logoBtn.url;
                    }
                }
            },
            allowForShared: true
        },
        'Folders': {
            textKey: 'CommandFolders',
            iconName: 'folderftp',
            iconBigName: '24/folderftp',
            handler: function () {
                var tree = config.getTree();
                if (!tree || config.getTreeViewValue() == 'disabled')
                    return;
                tree[this.pressed ? 'expand' : 'collapse']();
            },
            allowForShared: true
        },
        'View': {
            textKey: 'CommandGridView',
            iconName: 'viewg',
            menu: true
        },
        'Favorites': {
            textKey: 'CommandFavorites',
            iconName: 'favorites',
            menu: true,
            access: function () {
                var curFolder = config.getCurrentFolder();
                if (config.isSharedForYouTreeFolder(curFolder)) {
                    return false;
                }
                return !(Ext.isEmpty(curFolder) || curFolder.toLowerCase() == 'root' || config.isRecentFolder())
                    && !config.isTrashFolder(curFolder) && !config.isAlertsFolder(curFolder);
            }
        },
        'Search': {
            textKey: 'CommandSearch',
            iconName: 'search',
            handler: function () {
                config.initAndShowSearch();
            },
            access: function () {
                var curFolder = config.getCurrentFolder();
                return config.htcConfig.searchEnabled &&
                    (!config.isRecentFolder(curFolder) && !config.isTrashFolder(curFolder) && !config.isAlertsFolder(curFolder));
            }
        },
        'FileMenu': {
            textKey: 'CommandFile',
            iconName: 'file',
            menu: true,
            access: function () {
                var curFolder = config.getCurrentFolder();
                return !config.isRecentFolder(curFolder) || config.isRecentFolder(curFolder, true);
            }
        },
        'Upload': {
            textKey: 'CommandUpload',
            iconName: 'upload',
            handler: function () {
                if (!config.htcConfig.currentPerms) {
                    return;
                }
                if (config.htcConfig.currentPerms.upload) {
                    config.initUploaders(true);
                } else {
                    config.Msg.alert(config.htcConfig.locData.UploadNotAllowedTitle,
                        config.htcConfig.locData.UploadNotAllowedPrompt);
                }
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                return perms && perms.upload;
            }
        },
        'Administration': {
            textKey: 'CommandAdministration',
            iconName: 'administration',
            menu: true,
            right: true,
            allowForShared: true
        },
        'Settings': {
            textKey: 'CommandSettings',
            iconName: 'settings',
            menu: true,
            right: true,
            allowForShared: true
        },
        'Help': {
            textKey: 'CommandHelp',
            iconName: 'help',
            right: true,
            handler: function () {
                config.showHelpWindow();
            },
            allowForShared: true
        },
        'Logout': {
            tooltip: {
                textKey: 'CommandLogoutHint',
                titleKey: 'CommandLogout'
            },
            iconName: 'logout',
            right: true,
            handler: function () {
                if (config.asControl()) {
                    if (typeof config.htcConfig.currentUserDomain != 'undefined' &&
                            config.htcConfig.currentUserDomain.trim().length > 0) {
                        config.onLogOut(config.htcConfig.currentUser, config.htcConfig.currentUserDomain);
                    } else {
                        config.onLogOut(config.htcConfig.currentUser);
                    }
                } else {
                    window.location.href = config.htcConfig.relativePath + "Logout.aspx";
                }
            },
            allowForShared: true
        },
        'ViewEdit': {
            textKey: 'CommandSubMenuViewAndEdit',
            iconName: 'viewwith',
            menu: true,
            access: function (perms, selType, _ext_, selFiles, selItems, rowData, selFolders, selTFM) {
                var vesm = config.getViewEditSubMenu();
                return vesm && vesm.onBeforeShowViewEditMenu(vesm, selTFM);
            }
        },
        'Share': {
            textKey: 'CommandSubMenuShare',
            iconName: 'share',
            menu: true,
            access: function (perms, selType, _ext_, selFiles, selItems, rowData, selFolders, selTFM) {
                var ssm = config.getShareSubMenu();
                return ssm && ssm.onBeforeShowShareMenu(ssm, selTFM);
            }
        },
        'ViewPublicLinks': {
            textKey: 'AnonymousViewLinksWindowTitle',
            iconName: 'sharefolder',
            handler: function () {
                config.initAndShowViewLinksWindow();
            },
            access: function (perms, selType, _ext_, selFiles, selItems, rowData, selFolders, selTFM) {
                return config && config.htcConfig && (config.htcConfig.enablePublicLinkToFile || config.htcConfig.enablePublicLinkToFolder);
            }
        },
        'More': {
            textKey: 'CommandSubMenuMore',
            iconName: 'more',
            menu: true,
            access: function (perms, selType, _ext_, selFiles, selItems, rowData, selFolders, selTFM) {
                var msm = config.getMoreSubMenu();
                return msm && msm.onBeforeShowMoreMenu(msm, selTFM);
            }
        },
        'Clouds': {
            textKey: 'CommandClouds',
            iconName: 'clouds',
            menu: true,
            access: function () {
                var curFolder = config.getCurrentFolder();
                return !(Ext.isEmpty(curFolder) || curFolder.toLowerCase() == 'root' || config.isRecentFolder(curFolder))
                    && !config.isTrashFolder(curFolder);
            }
        },
        'Trash': {
            textKey: 'TrashRootTitle',
            iconName: 'trash',
            menu: true,
            access: function (perms, selType, _ext_, selFiles, selItems, rowData, selFolders, selTFM) {
                var tsm = config.getTrashSubMenu();
                return tsm && tsm.onBeforeShowTrashMenu(tsm, selTFM);
            }
        },
        'Download': {
            textKey: 'CommandDownload',
            iconName: 'download',
            disabled: true,
            handler: function () {
                config.getMenuActions().downloadSelectedItems();
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                return perms && perms.download &&
                    selType && selType != "empty" && selType != "none";
            }
        },
        'New': {
            textKey: 'CommandNew',
            iconName: 'new',
            menu: true,
            access: newObjectAllowed
        },
        'NewFile': {
            textKey: 'CommandNewFile',
            iconName: 'file',
            disabled: true,
            iconBigName: '24/newfile',
            handler: function () {
                config.getMenuActions().createNewItem('file');
            },
            access: newObjectAllowed
        },
        'NewFolder': {
            textKey: 'CommandNewFolder',
            iconName: 'folder',
            disabled: true,
            iconBigName: '24/newfolder',
            handler: function () {
                config.getMenuActions().createNewItem('folder');
            },
            access: newObjectAllowed
        },
        'Rename': {
            textKey: 'CommandRename',
            iconName: 'rename',
            disabled: true,
            handler: function () {
                config.getMenuActions().renameSelectedItem();
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                return perms && perms.rename &&
                    (selType == "file" || selType == "folder");
            }
        },
        'Delete': {
            textKey: 'CommandDelete',
            iconName: 'delete',
            disabled: true,
            handler: function () {
                var curFolder = config.getCurrentFolder(),
                    sharedGrid;
                if (config.isSharedTreeFolder(curFolder)) {
                    sharedGrid = config.getSharedGrid();
                    if (sharedGrid) {
                        config.getMenuActions().deleteSelectedAnonymLinks(sharedGrid);
                    }
                } else {
                    config.getMenuActions().deleteSelectedItems();
                }
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                var curFolder = config.getCurrentFolder();
                return (config.isSharedTreeFolder(curFolder) || config.isTrashFolder(curFolder) || config.isRecentFolder(curFolder, true) || (perms && perms.del))
                    && selType && selType != "empty" && selType != "none";
            },
            allowForShared: true
        },
        'Copy': {
            textKey: 'CommandCopy',
            iconName: 'copy',
            disabled: true,
            handler: function () {
                copyCutFunc(false);
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                return config.htcConfig.copyMoveToMode < 3 && perms && perms.copy &&
                    selType && selType != "empty" && selType != "none";
            }
        },
        'Cut': {
            textKey: 'CommandCut',
            iconName: 'cut',
            disabled: true,
            handler: function () {
                copyCutFunc(true);
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                return config.htcConfig.copyMoveToMode < 3 && perms && perms.cut &&
                    selType && selType != "empty" && selType != "none";
            }
        },
        'CopyTo': {
            textKey: 'CommandCopyTo',
            iconName: 'copy',
            disabled: true,
            handler: function () {
                copyCutFunc(false, true);
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                return (config.htcConfig.copyMoveToMode == 1 || config.htcConfig.copyMoveToMode == 3) && perms && perms.copy &&
                    selType && selType != 'empty' && selType != 'none';
            }
        },
        'MoveTo': {
            textKey: 'CommandMoveTo',
            iconName: 'cut',
            disabled: true,
            handler: function () {
                copyCutFunc(true, true);
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                return (config.htcConfig.copyMoveToMode == 1 || config.htcConfig.copyMoveToMode == 3) && perms && perms.cut &&
                    selType && selType != 'empty' && selType != 'none';
            }
        },
        'Paste': {
            cls: 'x-badge-container',
            textKey: 'CommandPaste',
            iconName: 'paste',
            disabled: true,
            handler: function () {
                config.getMenuActions().paste(false, config.getClipboard());
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                return perms && (perms.cut || perms.copy) && perms.create &&
                    selType != "empty" && config.getClipboard() && config.getClipboard().enabled;
            }
        },
        'PasteInto': {
            cls: 'x-badge-container',
            textKey: 'CommandPasteInto',
            iconName: 'paste',
            disabled: true,
            handler: function () {
                config.getMenuActions().paste(true, config.getClipboard());
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                return perms && (perms.cut || perms.copy) && selType == "folder" &&
                    config.getClipboard() && config.getClipboard().enabled && perms.create;
            }
        },
        'Label': {
            textKey: 'LabelsTitle',
            iconName: 'label',
            menu: true,
            access: function (perms, selType, _ext_, selFiles, selItems, rowData, selFolders, selTFM) {
                var lm = config.getLabelsMenu();
                return lm && perms && perms.modify && selItems > 0;
            }
        },
        'WatchForModifs': {
            textKey: 'WatchForModifsCommand',
            iconName: 'watch',
            menu: true,
            access: function (perms, selType, _ext_, selFiles, selItems, rowData, selFolders, selTFM) {
                var wsm = config.getWatchSubMenu();
                return wsm && wsm.onBeforeShowWatchMenu(wsm, selTFM, true);
            }
        },
        'Details': {
            textKey: 'CommandDetails',
            iconName: 'details',
            disabled: true,
            handler: function () {
                config.getMenuActions().viewChangeDetails(config.initMetadata);
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                return perms && selItems == 1;
            }
        },
        'Select': {
            textKey: 'CommandSelectAll',
            iconName: 'selectall',
            handler: function () {
                var grid = config.isSharedTreeFolder() ? config.getSharedGrid() : config.getGrid();
                config.getMenuActions().selectAll(grid);
            },
            menu: [{
                text: config.htcConfig.locData.CommandInvertSelection,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'invert'),
                handler: function () {
                    var grid = config.isSharedTreeFolder() ? config.getSharedGrid() : config.getGrid();
                    config.getMenuActions().invertSelection(grid);
                }
            }],
            allowForShared: true
        },
        'SelectAll': {
            textKey: 'CommandSelectAll',
            iconName: 'selectall',
            handler: function () {
                var grid = config.isSharedTreeFolder() ? config.getSharedGrid() : config.getGrid();
                config.getMenuActions().selectAll(grid);
            },
            allowForShared: true
        },
        'InvertSelection': {
            textKey: 'CommandInvertSelection',
            iconName: 'invert',
            handler: function () {
                var grid = config.isSharedTreeFolder() ? config.getSharedGrid() : config.getGrid();
                config.getMenuActions().invertSelection(grid);
            },
            allowForShared: true
        },
        'Refresh': {
            textKey: 'CommandRefresh',
            iconName: 'refresh',
            handler: function () {
                config.openGridFolder(config.getCurrentFolder(), true, true);
            },
            allowForShared: true
        },
        'ViewItem': {
            textKey: 'CommandView',
            iconName: 'view',
            disabled: true,
            handler: function () {
                config.getMenuActions().viewFile();
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                var res = perms && selType == "file" && perms.download;
                if (res) {
                    var ext = _ext_.replace(/^;+|;+$/g, '');
                    res = HttpCommander.Lib.Consts.forbiddenTypesForViewInBrowser.indexOf(_ext_) < 0 &&
                        config.htcConfig.mimeTypes.indexOf(ext) >= 0;
                    if (res) {
                        res = HttpCommander.Lib.Consts.msoSupportedtypes.indexOf(_ext_) < 0 ||
                            HttpCommander.Lib.Consts.msoTypesForViewInBrowser.indexOf(_ext_) != -1;
                    }
                    if (res && ext == 'swf' && HttpCommander.Lib.Utils.browserIs.ios) {
                        res = false;
                    }
                }
                return res;
            }
        },
        'ImagesPreview': {
            textKey: 'CommandPreview',
            iconName: 'preview',
            disabled: true,
            handler: function () {
                config.getMenuActions().imagesPreview();
            },
            access: function (perms, selType, _ext_, selFiles, selItems, rowData) {
                var fileSize = (rowData.size || rowData.size_hidden || 0);
                return perms && selType == "file" && perms.download &&
                    HttpCommander.Lib.Consts.imagesFileTypes.indexOf(_ext_) != -1 && fileSize > 0;
            }
        },
        'FlashPreview': {
            textKey: 'CommandFlashPreview',
            iconName: 'flash',
            disabled: true,
            handler: function () {
                config.getMenuActions().flashPreview();
            },
            access: function (perms, selType, _ext_, selFiles, selItems, rowData) {
                var fileSize = (rowData.size || rowData.size_hidden || 0);
                return perms && selType == "file" && perms.download && _ext_ == ";swf;"
                    && !HttpCommander.Lib.Utils.browserIs.ios && fileSize > 0;
            }
        },
        'MSOEdit': {
            textKey: 'CommandEditInMSOffice',
            iconName: 'mso',
            disabled: true,
            handler: function () {
                config.getMenuActions().editInMsoOoo(true, config.openInMsoNewWay);
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                var btns = config.getMsoEditButtons();
                var view = perms && selType == "file" && perms.download && HttpCommander.Lib.Consts.msoSupportedtypes.indexOf(_ext_) != -1;
                var edit = view && perms.modify;
                if (view) {
                    view = !config.htcConfig.anonymousEditingOffice;
                }
                if (Ext.isArray(btns)) {
                    Ext.each(btns, function (item, index) {
                        if (item && Ext.isFunction(item.setText)) {
                            item.setText(config.htcConfig.locData[(view && !edit) ? 'CommandViewInMSOffice' : 'CommandEditInMSOffice'], true);
                        }
                    });
                }
                return (view || edit);
            }
        },
        'OOOEdit': {
            textKey: 'CommandEditInOOo',
            iconName: 'ooo',
            disabled: true,
            handler: function () {
                var officeEditor = config.initOfficeEditor();
                config.getMenuActions().editInMsoOoo(false, officeEditor.OpenFile);
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                var btns = config.getOooEditButtons();
                var view = perms && selType == "file" && perms.download && HttpCommander.Lib.Consts.oooSupportedtypes.indexOf(_ext_) != -1;
                var edit = view && perms.modify;
                if (view) {
                    view = !config.htcConfig.anonymousEditingOffice;
                }
                if (Ext.isArray(btns)) {
                    Ext.each(btns, function (item, index) {
                        if (item && Ext.isFunction(item.setText)) {
                            item.setText(config.htcConfig.locData[(view && !edit) ? 'CommandViewInOOo' : 'CommandEditInOOo'], true);
                        }
                    });
                }
                return (view || edit);
            }
        },
        'GoogleView': {
            textKey: 'CommandViewWithGoogleDoc',
            iconName: 'googledoc',
            disabled: true,
            handler: function () {
                config.getMenuActions().viewInService('google');
            },
            access: function (perms, selType, _ext_, selFiles, selItems, rowData) {
                var fileSize = (rowData.size || rowData.size_hidden || 0);
                return perms && selType == "file" && perms.download &&
                    HttpCommander.Lib.Consts.googleDocSupportedtypes.indexOf(_ext_) != -1 &&
                    fileSize > 0;
            }
        },
        'ShareCadView': {
            textKey: 'CommandViewWithShareCad',
            iconName: 'sharecad',
            disabled: true,
            handler: function () {
                config.getMenuActions().viewInService('sharecad');
            },
            access: function (perms, selType, _ext_, selFiles, selItems, rowData) {
                var fileSize = (rowData.size || rowData.size_hidden || 0);
                return perms && selType == "file" && perms.download
                    && config.htcConfig.enableShareCadViewer
                    && HttpCommander.Lib.Consts.shareCadOrgSupportedTypes.indexOf(_ext_) != -1
                    && fileSize > 0;
            }
        },
        'AutodeskView': {
            textKey: 'CommandViewWithAutodesk',
            iconName: 'autodesk',
            disabled: true,
            hidden: !config.supportsWebGlCanvasForAutodesk(),
            handler: function () {
                config.getMenuActions().viewInAutodesk();
            },
            access: function (perms, selType, _ext_, selFiles, selItems, rowData) {
                var fileSize = (rowData.size || rowData.size_hidden || 0);
                return perms && selType == "file" && perms.download
                    && config.htcConfig.enableAutodeskViewer
                    && HttpCommander.Lib.Consts.autodeskViewerFileTypes.indexOf(_ext_) != -1
                    && fileSize > 0
                    && config.supportsWebGlCanvasForAutodesk();
            }
        },
        'MSOfficeOnlineEdit': {
            textKey: 'CommandEditInMSOO',
            iconName: 'skydrive',
            disabled: true,
            handler: function () {
                config.getMenuActions().msooEdit();
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                var newExt = HttpCommander.Lib.Utils.checkAndGetNewExtensionConvertedFromMSOO(_ext_.replace(/^;+|;+$/g, ''));
                var newExtAllow = Ext.isEmpty(newExt) || config.isExtensionAllowed('file.' + newExtAllow);
                return perms && config.htcConfig.enableMSOOEdit && selType == "file"
                    && perms.download && perms.modify
                    && HttpCommander.Lib.Consts.msooEditorFileTypes.indexOf(_ext_) != -1
                    && newExtAllow;
            }
        },
        'Office365Edit': {
            textKey: 'CommandEditInOffice365',
            iconName: 'office365',
            disabled: true,
            handler: function () {
                config.getMenuActions().office365Edit();
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                return perms && config.htcConfig.enableOffice365Edit && selType == "file"
                    && perms.download && perms.modify
                    && HttpCommander.Lib.Consts.msooEditorFileTypes.indexOf(_ext_) != -1
                    && _ext_ != ';txt;'
                    && HttpCommander.Lib.Consts.msooEditFormatsForConvert.indexOf(_ext_) < 0;
            }
        },
        'GoogleEdit': {
            textKey: 'CommandEditInGoogle',
            iconName: 'googledocs',
            disabled: true,
            handler: function () {
                config.getMenuActions().googleEdit();
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                var newExt = HttpCommander.Lib.Utils.checkAndGetNewExtensionConvertedFromGoogle(_ext_.replace(/^;+|;+$/g, ''));
                var newExtAllow = Ext.isEmpty(newExt) || config.isExtensionAllowed('file.' + newExtAllow);
                return perms && config.htcConfig.enableGoogleEdit && selType == "file"
                    && perms.download && perms.modify
                    && HttpCommander.Lib.Consts.googleDriveEditorFileTypes.indexOf(_ext_) != -1
                    && newExtAllow;
            }
        },
        'BoxView': {
            textKey: 'CommandViewWithBox',
            iconName: 'box',
            disabled: true,
            handler: function () {
                config.getMenuActions().viewInService('box');
            },
            access: function (perms, selType, _ext_, selFiles, selItems, rowData) {
                var fileSize = (rowData.size || rowData.size_hidden || 0);
                return perms && selType == "file" && perms.download &&
                    HttpCommander.Lib.Consts.boxViewSupportedtypes.indexOf(_ext_) != -1 &&
                    fileSize > 0;
            }
        },
        'CloudConvert': {
            textKey: 'CommandCloudConvert',
            iconName: 'cloudconvert',
            disabled: true,
            handler: function () {
                config.getMenuActions().getOutputFormats();
            },
            access: function (perms, selType, _ext_, selFiles, selItems, rowData) {
                return perms && selType == "file" && (perms.upload || perms.download)
                    && _ext_ && _ext_.length > 2 && (rowData.size || rowData.size_hidden || 0) > 0;
            }
        },
        'OfficeWebView': {
            textKey: 'CommandViewWithOWA',
            iconName: 'owa',
            disabled: true,
            handler: function () {
                config.getMenuActions().viewInService('owa');
            },
            access: function (perms, selType, _ext_, selFiles, selItems, rowData) {
                var fileSize = (rowData.size || rowData.size_hidden || 0);
                return perms && selType == "file" && perms.download &&
                    HttpCommander.Lib.Consts.owaSupportedtypes.indexOf(_ext_) != -1 && fileSize > 0
                    // see http://office.microsoft.com/en-us/web-apps-help/view-office-documents-online-HA102724036.aspx
                    && ((_ext_.indexOf(';xls') == 0 && fileSize <= 5242880) || (_ext_.indexOf(';xls') < 0 && fileSize <= 10485760));
            }
        },
        'DownloadToGoogle': {
            textKey: 'CommandDownloadToGoogleDocs',
            iconName: 'googledocs',
            disabled: true,
            handler: function () {
                config.downloadToGoogle();
            },
            access: allowDownloadToCloud
        },
        'DownloadToBox': {
            textKey: 'CommandDownloadToBox',
            iconName: 'box',
            disabled: true,
            handler: function () {
                config.downloadToBox();
            },
            access: allowDownloadToCloud
        },
        'ZohoEdit': {
            textKey: 'CommandEditWithZoho',
            iconName: 'zohoeditor',
            disabled: true,
            handler: function () {
                config.getMenuActions().viewInService('zoho');
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                var ext = _ext_.replace(/^;+|;+$/g, '');
                return perms && selType == "file" && perms.download && perms.modify &&
                    config.htcConfig.zohoSupportedEditTypes.indexOf(ext) != -1;
            }
        },
        'PixlrEdit': {
            textKey: 'CommandEditInPixlr',
            iconName: 'pixlr',
            disabled: true,
            handler: function () {
                config.getMenuActions().viewInService('pixlr');
            },
            access: function (perms, selType, _ext_, selFiles, selItems, rowData) {
                var fileSize = (rowData.size || rowData.size_hidden || 0);
                return perms && perms.modify && selType == "file" && perms.download &&
                    HttpCommander.Lib.Consts.pixlrSupportedTypes.indexOf(_ext_) != -1 && fileSize > 0;
            }
        },
        'AdobeImageEdit': {
            textKey: 'CommandEditInAdobe',
            iconName: 'adobeimage',
            disabled: true,
            handler: function () {
                config.getMenuActions().viewInService('adobe');
            },
            access: function (perms, selType, _ext_, selFiles, selItems, rowData) {
                var fileSize = (rowData.size || rowData.size_hidden || 0);
                return perms && perms.modify && selType == "file" && perms.download &&
                    HttpCommander.Lib.Consts.adobeImageSupportedTypes.indexOf(_ext_) != -1 && fileSize > 0;
            }
        },
        'DownloadToDropbox': {
            textKey: 'CommandDownloadToDropbox',
            iconName: 'dropbox',
            disabled: true,
            handler: function () {
                config.downloadToDropbox();
            },
            access: function (perms, selType, _ext_, selFiles, selItems, rowData, selFolders) {
                return perms && perms.download && config.htcConfig.enableDownloadToDropbox &&
                    (selFiles > 0 || selFolders > 0);
            }
        },
        'DownloadToSkyDrive': {
            textKey: 'CommandDownloadToSkyDrive',
            iconName: 'skydrive',
            disabled: true,
            handler: function () {
                config.downloadToSkyDrive();
            },
            access: function (perms, selType, _ext_, selFiles, selItems, rowData, selFolders) {
                return perms && perms.download && config.htcConfig.isAllowedSkyDrive
                    && (selFiles > 0 || selFolders > 0);
            }
        },
        'Edit': {
            textKey: 'CommandEdit',
            iconName: 'textedit',
            disabled: true,
            handler: function () {
                config.getMenuActions().editFile();
            },
            access: function (perms, selType, _ext_, selFiles, selItems, rowData) {
                var resOpen = perms && selType == "file" && perms.download;
                var isLocked = (config.htcConfig.enableMSOfficeEdit
                    || config.htcConfig.enableOpenOfficeEdit
                    || config.htcConfig.enableWebFoldersLinks) && rowData.locked;
                var resEdit = resOpen && perms.modify && !isLocked;
                var sizeEditAllowed = (typeof config.htcConfig.maxSizeForEditAsTextFile != 'undefined')
                    ? ((rowData.size || rowData.size_hidden || 0) <= config.htcConfig.maxSizeForEditAsTextFile) : false;
                if (resEdit) {
                    resEdit = sizeEditAllowed;
                }
                if (resOpen) {
                    resOpen = sizeEditAllowed;
                }
                var eot = config.getEditOpenTxtButtons();
                if (Ext.isArray(eot)) {
                    Ext.each(eot, function (item, index) {
                        if (resOpen && !resEdit) {
                            item.setText(config.htcConfig.locData.CommandEditView, true);
                        } else {
                            item.setText(config.htcConfig.locData.CommandEdit, true);
                        }
                    });
                }
                return (resEdit || resOpen);
            }
        },
        'Link': {
            textKey: 'CommandLinkToFile',
            iconName: 'linktofile',
            disabled: true,
            handler: function () {
                config.getMenuActions().linkToFileFolder();
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                return perms &&
                (
                    ((selType == "folder" || selType == "none") && config.htcConfig.enableLinkToFolder === true)
                    ||
                    (perms.download && selType == "file" && config.htcConfig.enableLinkToFile === true)
                );
            }
        },
        'ShareFolder': {
            textKey: 'CommandMakePublicFolder',
            iconName: 'sharefolder',
            disabled: true,
            handler: function () {
                config.getMenuActions().shareFolder(config.virtualFilePath, config.prepareAndShowMakePublicLinkWindow);
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                return perms &&
                (
                    (
                        selType == "file"
                        && config.htcConfig.enablePublicLinkToFile === true
                        && perms.download
                        && perms.anonymDownload
                    )
                    ||
                    (
                        (selType == "folder" || selType == "none")
                        &&
                        config.htcConfig.enablePublicLinkToFolder === true
                        &&
                        (
                            (
                                (perms.download || perms.zipDownload)
                                &&
                                perms.anonymDownload
                            )
                            ||
                            (perms.upload && perms.anonymUpload)
                            ||
                            (
                                (perms.listFiles || perms.listFolders)
                                &&
                                perms.anonymViewContent
                            )
                        )
                    )
                );
            }
        },
        'Shortcut': {
            textKey: 'CommandCreateShortcut',
            iconName: 'folder-shortcut',
            disabled: true,
            handler: function () {
                config.getMenuActions().runShortcut();
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                return perms && perms.create && selItems < 2 && config.isExtensionAllowed('file.lnk');
            }
        },
        'WebFolders': {
            textKey: 'CommandWebFoldersLinks',
            iconName: 'webfolders',
            disabled: true,
            handler: function () {
                config.getMenuActions().webFolders(config.prepareAndShowlinksToWebFoldersWindow);
            },
            access: function () {
                var curFolder = config.getCurrentFolder();
                return !config.isRecentFolder(curFolder) && !config.isTrashFolder(curFolder);
            }
        },
        'SyncWebFolders': {
            textKey: 'CommandSyncWebFolders',
            iconName: 'syncwebfolders',
            disabled: true,
            handler: function () {
                config.getMenuActions().syncWebFolders(config.initAndShowSyncWebFoldersHelpWindow);
            },
            access: function () {
                var curFolder = config.getCurrentFolder();
                return !config.isRecentFolder(curFolder) && !config.isTrashFolder(curFolder);
            }
        },
        'SendEmail': {
            textKey: 'CommandSendEmail',
            iconName: 'sendemail',
            disabled: true,
            handler: function () {
                config.getMenuActions().sendEmail();
            },
            access: function () {
                var curFolder = config.getCurrentFolder();
                return !config.isRecentFolder(curFolder) && !config.isTrashFolder(curFolder);
            },
            allowForShared: true
        },
        'VideoConvert': {
            textKey: 'CommandConvertVideo',
            iconName: 'process',
            disabled: true,
            handler: function () {
                config.getMenuActions().videoConvert();
            },
            access: function (perms, selType, _ext_, selFiles, selItems, rowData) {
                var fileSize = (rowData.size || rowData.size_hidden || 0);
                return perms && perms.create && perms.modify && selType && selType == "file" &&
                    HttpCommander.Lib.Consts.videoConvertFileTypes.indexOf(_ext_) != -1 && fileSize > 0;
            }
        },
        'PlayVideoFlash': {
            textKey: 'CommandPlayVideoFlash',
            iconName: 'play-video',
            disabled: true,
            handler: function () {
                config.getMenuActions().playVideoFlash();
            },
            access: function (perms, selType, _ext_, selFiles, selItems, rowData) {
                var fileSize = (rowData.size || rowData.size_hidden || 0);
                return perms && perms.download && selType && selType == "file"
                    && HttpCommander.Lib.Consts.flowplayerFileTypes.indexOf(_ext_) != -1
                        && !HttpCommander.Lib.Utils.browserIs.ios && fileSize > 0;
            }
        },
        'PlayVideoHTML5': {
            textKey: 'CommandPlayVideoHtml5',
            iconName: 'play-video',
            disabled: true,
            handler: function () {
                config.getMenuActions().playVideoHTML5();
            },
            access: function (perms, selType, _ext_, selFiles, selItems, rowData) {
                var fileSize = (rowData.size || rowData.size_hidden || 0);
                return perms && perms.download && selType && selType == "file" &&
                    HttpCommander.Lib.Consts.html5VideoFileTypes.indexOf(_ext_) != -1 && fileSize > 0;
            }
        },
        'PlayAudioHTML5': {
            textKey: 'CommandPlayAudioHtml5',
            iconName: 'play-audio',
            disabled: true,
            handler: function () {
                config.getMenuActions().playAudioHTML5();
            },
            access: function (perms, selType, _ext_, selFiles, selItems, rowData) {
                var fileSize = (rowData.size || rowData.size_hidden || 0);
                return perms && perms.download &&
                    selType && selType == "file" &&
                        HttpCommander.Lib.Consts.html5AudioFileTypes.indexOf(_ext_) != -1 && fileSize > 0;
            }
        },
        'Versioning': {
            textKey: 'CommandVersioning',
            iconName: 'versioning',
            disabled: true,
            menu: true,
            access: function (perms, selType, _ext_, selFiles, selItems) {
                var curFolder = config.getCurrentFolder();
                return !config.isRecentFolder(curFolder) && !config.isTrashFolder(curFolder)
                    && selType && selType == "file" && selFiles == 1;
            }
        },
        'Zip': {
            textKey: 'CommandZip',
            iconName: 'zip',
            disabled: true,
            handler: function () {
                config.getMenuActions().zip();
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                return perms && perms.zip && config.isExtensionAllowed('.ZIP', true) &&
                    selType && selType != "empty" && selType != "none";
            }
        },
        'ZipContent': {
            textKey: 'CommandZipContents',
            iconName: 'unzip',
            disabled: true,
            handler: function () {
                config.getMenuActions().zipContent(config.initZipContent);
            },
            access: unzipAllowed
        },
        'Unzip': {
            textKey: 'CommandUnzip',
            iconName: 'unzip',
            disabled: true,
            menu: true,
            access: unzipAllowed
        },
        'ZipDownload': {
            textKey: 'CommandZipDownload',
            iconName: 'zipdownload',
            disabled: true,
            handler: function () {
                config.getMenuActions().zipDownload();
            },
            access: function (perms, selType, _ext_, selFiles, selItems) {
                return perms && perms.zipDownload &&
                    selType && (selType == "set" || selType == "folder" || (selType && selType != "empty" && selType != "none"));
            }
        },
        access: function (item) {
            var isShared = false, isSharedForYou = false;

            if (!item || !self[item]) {
                return true;
            }

            if ((isSharedForYou = config.isSharedForYouTreeFolder(config.getCurrentFolder()))) {
                if (Ext.isFunction(self[item].access) || item == 'View' || item == 'Select' || item == 'SelectAll' || item == 'InvertSelection') {
                    return false;
                }
            }

            if ((isShared = config.isSharedTreeFolder(config.getCurrentFolder())) && !self[item].allowForShared) {
                return false;
            }

            if (!Ext.isFunction(self[item].access)) {
                return true;
            }

            var perms = config.getCurrentPerms(),
                selTFM = config.getSelTypeFilesModel(isShared ? config.getSharedGrid()
                    : isSharedForYou ? config.getSharedFYGrid() : config.getGrid()),
                selModel = selTFM ? selTFM['selModel'] : null,
                row = selModel ? selModel.getSelected() : null,
                rowData = row ? row.data : {},
                selType = selTFM ? selTFM['selType'] : null,
                selFiles = selTFM ? selTFM['selFiles'] : 0,
                selFolders = selTFM ? selTFM['selFolders'] : 0,
                selItems = selModel ? selModel.getCount() : 0,
                ext = (!selType || selType == 'none' || !rowData.name)
                    ? '' : HttpCommander.Lib.Utils.getFileExtension(rowData.name),
                _ext_ = ';' + ext + ';';

            return self[item].access(perms, selType, _ext_, selFiles, selItems, rowData, selFolders, selTFM);
        }
    };

    self['ViewEditSharing'] = self['ViewEdit'];

    return self;
};