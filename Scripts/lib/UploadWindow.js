Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, getEnableMultipleUploader(),
getRenderers(), getAllowSetFileNameAtSimpleUpload(), 
$(), getAppRootUrl(), getUid(), getCurrentFolder(),
gridItemExists(), isModifyAllowed(), openGridFolder(), showBalloon(),
getExtEl(), ProcessScriptError(), getEnableDnDUploader(), getDnDZone(),
globalLoadMask,
getCurrentSelectedSet(),
openTreeNode(), getFileManagerInstance(),
getGoogleDriveAuth(), getSkyDriveAuth(), getDropboxAuth(), getBoxAuth(),
isDemoMode(), openTreeRecent()
*/
HttpCommander.Lib.UploadWindow = function (config) {
    var uploadTabs = [], uploaders = {},
        simpleFp,
        dndFp,
        googleFp,
        javaFp,
        flashFp,
        silverlightFp,
        dropboxFp,
        skyDriveFp,
        boxFp,
        uploadFromUrlFp,
        iosfp,
        permWarningShown = false,
        javaSilverSupported = !HttpCommander.Lib.Utils.browserIs.edge &&
                              !HttpCommander.Lib.Utils.browserIs.chrome42up;

    function getUploadWindow() {
        return self;
    }
    function getPermWarningShown() { return permWarningShown; }
    function setPermWarningShown(v) { permWarningShown = v; }

    /* Individual uploaders */
    /*Put this tab for IOS devices ONLY if IOS version > 6*/
    if (!HttpCommander.Lib.Utils.browserIs.ios || (HttpCommander.Lib.Utils.browserIs.ios && HttpCommander.Lib.Utils.browserIs.ios6up)) {
        try { // Simple upload
            simpleFp = HttpCommander.Lib.SimpleUpload({
                'htcConfig': config.htcConfig,
                'Msg': config.Msg,
                'Window': config.Window,
                'getAllowSetFileNameAtSimpleUpload': config.getAllowSetFileNameAtSimpleUpload,
                'getCurrentFolder': config.getCurrentFolder,
                'gridItemExists': config.gridItemExists,
                'isModifyAllowed': config.isModifyAllowed,
                'openGridFolder': config.openGridFolder,
                'showBalloon': config.showBalloon,
                'getExtEl': config.getExtEl,
                'getUid': config.getUid,
                'getEnableMultipleUploader': config.getEnableMultipleUploader,
                'getRenderers': config.getRenderers,
                'getAppRootUrl': config.getAppRootUrl,
                'openTreeRecent': config.openTreeRecent
            });
            uploaders['Simple'] = {
                itemId: 'simple-upload',
                title: config.htcConfig.locData.UploadSimpleTab,
                items: simpleFp
            };
        } catch (e) {
            config.ProcessScriptError(e);
        }
    }

    if (config.getEnableDnDUploader()) { // drag'n drop uploader
        try {
            var bis = HttpCommander.Lib.Utils.browserIs,
                pasteSreens = (config.htcConfig.enablePasteImages === true)
                    && (bis.chrome12up || bis.firefox36up || bis.edge10586up);
            dndFp = HttpCommander.Lib.DragAndDropUpload({
                'htcConfig': config.htcConfig,
                'Msg': config.Msg,
                'Window': config.Window,
                'getRenderers': config.getRenderers,
                'getCurrentFolder': config.getCurrentFolder,
                'openGridFolder': config.openGridFolder,
                'showBalloon': config.showBalloon,
                'gridItemExists': config.gridItemExists,
                'isModifyAllowed': config.isModifyAllowed,
                'globalLoadMask': config.globalLoadMask,
                'getDnDZone': config.getDnDZone,
                'openTreeRecent': config.openTreeRecent
            });
            uploaders['DragNDrop'] = {
                itemId: 'dnd-upload-tab',
                title: config.htcConfig.locData[pasteSreens ? 'UploadDragNDropTabImages' : 'UploadDragNDropTab'],
                items: dndFp
            };
        } catch (e) {
            config.ProcessScriptError(e);
        }
    }

    if (config.htcConfig.uploaders.java && !HttpCommander.Lib.Utils.browserIs.ios && javaSilverSupported) { // java uploader
        try {
            javaFp = HttpCommander.Lib.JavaUpload({
                'htcConfig': config.htcConfig,
                'getRenderers': config.getRenderers,
                'getUploadWindow': getUploadWindow,
                'getCurrentFolder': config.getCurrentFolder,
                'openGridFolder': config.openGridFolder,
                'openTreeNode': config.openTreeNode,
                '$': config.$,
                'getPermWarningShown': getPermWarningShown,
                'setPermWarningShown': setPermWarningShown,
                'showBalloon': config.showBalloon,
                'getUid': config.getUid,
                'getAppRootUrl': config.getAppRootUrl,
                'openTreeRecent': config.openTreeRecent
            });
            uploaders['Java'] = {
                itemId: 'java-upload',
                title: config.htcConfig.locData.UploadJavaTab,
                items: javaFp.items,
                html: javaFp.html
            };
        } catch (e) {
            config.ProcessScriptError(e);
        }
    }

    if (config.htcConfig.uploaders.flash && !HttpCommander.Lib.Utils.browserIs.ios) { // flash uploader
        flashFp = HttpCommander.Lib.FlashUpload({
            'htcConfig': config.htcConfig,
            'getRenderers': config.getRenderers,
            'getUploadWindow': getUploadWindow,
            'getCurrentFolder': config.getCurrentFolder,
            'openGridFolder': config.openGridFolder,
            '$': config.$,
            'getPermWarningShown': getPermWarningShown,
            'setPermWarningShown': setPermWarningShown,
            'showBalloon': config.showBalloon,
            'getUid': config.getUid,
            'openTreeRecent': config.openTreeRecent
        });
        uploaders['Flash'] = {
            itemId: 'flash-upload',
            title: config.htcConfig.locData.UploadFlashTab,
            bodyStyle: 'background-color:#DFE8F6;',
            html: flashFp.html
        };
    }

    if (config.htcConfig.uploaders.silverlight && !HttpCommander.Lib.Utils.browserIs.ios && javaSilverSupported) { // silverlight uploader
        silverlightFp = HttpCommander.Lib.SilverlightUpload({
            'htcConfig': config.htcConfig,
            'getUploadWindow': getUploadWindow,
            'getCurrentFolder': config.getCurrentFolder,
            'openGridFolder': config.openGridFolder,
            '$': config.$,
            'getPermWarningShown': getPermWarningShown,
            'setPermWarningShown': setPermWarningShown,
            'showBalloon': config.showBalloon,
            'getUid': config.getUid,
            'getAppRootUrl': config.getAppRootUrl,
            'Msg': config.Msg,
            'openTreeRecent': config.openTreeRecent
        });
        // Register javascript silverlight events in global context
        window[config.$('onSilverlightLoaded')] = silverlightFp.onSilverlightLoaded;
        uploaders['Silverlight'] = {
            itemId: 'silverlight-upload',
            title: config.htcConfig.locData.UploadSilverlightTab,
            html: silverlightFp.html
        };
    }

    if (config.htcConfig.enableUploadFromGoogle && config.htcConfig.isAllowedGoogleDrive) { // google uploader
        try {
            googleFp = HttpCommander.Lib.UploadFromGoogle({
                'htcConfig': config.htcConfig,
                'Msg': config.Msg,
                'Window': config.Window,
                'globalLoadMask': config.globalLoadMask,
                'getUid': config.getUid,
                'getCurrentFolder': config.getCurrentFolder,
                'openGridFolder': config.openGridFolder,
                'showBalloon': config.showBalloon,
                'gridItemExists': config.gridItemExists,
                'isModifyAllowed': config.isModifyAllowed,
                'getUploadWindow': getUploadWindow,
                'getFileManagerInstance': config.getFileManagerInstance,
                'getGoogleDriveAuth': config.getGoogleDriveAuth,
                'isDemoMode': config.isDemoMode,
                'openTreeRecent': config.openTreeRecent
            });
            uploaders['GoogleDocsDrive'] = {
                itemId: 'google-upload',
                items: googleFp,
                title: HttpCommander.Lib.Consts.CloudNames.google,
                iconCls: 'icon-google'
            };
        } catch (e) {
            config.ProcessScriptError(e);
        }
    }

    if (config.htcConfig.enableUploadFromDropbox) { // dropbox uploader
        try {
            dropboxFp = HttpCommander.Lib.UploadFromDropbox({
                'htcConfig': config.htcConfig,
                'getUid': config.getUid,
                'getUploadWindow': getUploadWindow,
                'globalLoadMask': config.globalLoadMask,
                'getRenderers': config.getRenderers,
                'getCurrentFolder': config.getCurrentFolder,
                'Msg': config.Msg,
                'openTreeNode': config.openTreeNode,
                'openGridFolder': config.openGridFolder,
                'showBalloon': config.showBalloon,
                'getDropboxAuth': config.getDropboxAuth,
                'isDemoMode': config.isDemoMode,
                'openTreeRecent': config.openTreeRecent
            });
            uploaders['Dropbox'] = {
                itemId: 'dropbox-upload',
                items: dropboxFp,
                title: HttpCommander.Lib.Consts.CloudNames.dropbox,
                iconCls: 'icon-dropbox'
            };
        } catch (e) {
            config.ProcessScriptError(e);
        }
    }

    // skydrive uploader
    if (config.htcConfig.enableUploadFromSkyDrive && config.htcConfig.isAllowedSkyDrive) {
        try {
            skyDriveFp = new HttpCommander.Lib.UploadFromSkyDrive({
                'htcConfig': config.htcConfig,
                'Msg': config.Msg,
                'Window': config.Window,
                'globalLoadMask': config.globalLoadMask,
                'getUid': config.getUid,
                'getUploadWindow': getUploadWindow,
                'getRenderers': config.getRenderers,
                'getCurrentFolder': config.getCurrentFolder,
                'openGridFolder': config.openGridFolder,
                'showBalloon': config.showBalloon,
                'getSkyDriveAuth': config.getSkyDriveAuth,
                'isDemoMode': config.isDemoMode,
                'openTreeRecent': config.openTreeRecent
            });
            uploaders['SkyDrive'] = {
                itemId: 'skydrive-upload',
                items: skyDriveFp,
                title: HttpCommander.Lib.Consts.CloudNames.onedrive,
                iconCls: 'icon-skydrive'
            };
        } catch (e) {
            config.ProcessScriptError(e);
        }
    }

    if (config.htcConfig.enableUploadFromBox && config.htcConfig.isAllowedBox) {
        try {
            boxFp = HttpCommander.Lib.UploadFromBox({
                'htcConfig': config.htcConfig,
                'getUid': config.getUid,
                'getUploadWindow': getUploadWindow,
                'globalLoadMask': config.globalLoadMask,
                'getRenderers': config.getRenderers,
                'getCurrentFolder': config.getCurrentFolder,
                'Msg': config.Msg,
                'openTreeNode': config.openTreeNode,
                'openGridFolder': config.openGridFolder,
                'showBalloon': config.showBalloon,
                'getBoxAuth': config.getBoxAuth,
                'isDemoMode': config.isDemoMode,
                'openTreeRecent': config.openTreeRecent
            });
            uploaders['Box'] = {
                itemId: 'box-upload',
                items: boxFp,
                title: HttpCommander.Lib.Consts.CloudNames.box,
                iconCls: 'icon-box'
            };
        } catch (e) {
            config.ProcessScriptError(e);
        }
    }

    if (config.htcConfig.enableFromUrlUploader) { // from url uploader
        try {
            uploadFromUrlFp = HttpCommander.Lib.UploadFromUrl({
                'htcConfig': config.htcConfig,
                'getUid': config.getUid,
                'getCurrentFolder': config.getCurrentFolder,
                'Msg': config.Msg,
                'gridItemExists': config.gridItemExists,
                'isModifyAllowed': config.isModifyAllowed,
                'openGridFolder': config.openGridFolder,
                'showBalloon': config.showBalloon,
                'openTreeRecent': config.openTreeRecent
            });
            uploaders['FromUrl'] = {
                itemId: 'from-url-upload',
                items: uploadFromUrlFp,
                title: config.htcConfig.locData.UploadFromUrlTab,
                autoScroll: true
            };
        } catch (e) {
            config.ProcessScriptError(e);
        }
    }

    if (HttpCommander.Lib.Utils.browserIs.ios && !HttpCommander.Lib.Utils.browserIs.ios6up) { // init iOS uploader
        try {
            iosfp = HttpCommander.Lib.iOSUpload({
                'htcConfig': config.htcConfig,
                'getAppRootUrl': config.getAppRootUrl,
                'getCurrentFolder': config.getCurrentFolder,
                'openTreeRecent': openTreeRecent
            });
            uploaders['iOS'] = {
                itemId: 'ios-upload-tab',
                items: iosfp,
                title: config.htcConfig.locData.UploadSimpleTab
            };
        } catch (e) {
            config.ProcessScriptError(e);
        }
    }

    // Order uploaders
    for (var j = 0; j < config.htcConfig.uploadersOrder.length; ++j) {
        if (typeof uploaders[config.htcConfig.uploadersOrder[j]] != 'undefined') {
            uploadTabs.push(uploaders[config.htcConfig.uploadersOrder[j]]);
        }
    }

    var lastActiveTab = null;
    var handleTabChange = function (panel, tab, force) {
        lastActiveTab = tab;
        // Reset variable to display error messages next time.
        setPermWarningShown(false);
        switch (tab.itemId) {
            case 'google-upload':
            case 'dnd-upload-tab':
                if ((tab.itemId == 'dnd-upload-tab' && dndFp) ||
                                (tab.itemId == 'google-upload' && googleFp)) {
                    if (tab.itemId == 'google-upload' && googleFp)
                        googleFp.prepare(true);
                    self.reResize();
                }
                break;
            case 'simple-upload':
                if (simpleFp) {
                    simpleFp.compileNote();
                }
                break;
            case 'skydrive-upload':
                if (skyDriveFp) {
                    if (skyDriveFp.isLoginFormVisible() || force) {
                        var personalOneDrive = !Ext.isEmpty(config.htcConfig.liveConnectID)
                            && String(config.htcConfig.liveConnectID).length > 0;
                        var businessOneDrive = !Ext.isEmpty(config.htcConfig.oneDriveForBusinessAuthUrl)
                            && String(config.htcConfig.oneDriveForBusinessAuthUrl).length > 0;
                        var business = businessOneDrive && !personalOneDrive;
                        if (!business)
                            business = (personalOneDrive && !businessOneDrive) ? false : undefined;
                        skyDriveFp.prepare(false, business);
                    }
                    if (skyDriveFp.isUploadPanelVisible()) {
                        self.reResize();
                    }
                }
                break;
            case 'box-upload':
                if (boxFp) {
                    boxFp.prepare();
                    self.reResize();
                }
                break;
            case 'dropbox-upload':
                if (dropboxFp) {
                    var dropboxUploadPanel = dropboxFp.getDropboxUploadPanel();
                    if (!dropboxUploadPanel || dropboxUploadPanel.hidden || force) {
                        if (config.htcConfig.enableUploadFromDropbox) {
                            dropboxFp.prepare();
                        }
                    }
                    if (dropboxUploadPanel && !dropboxUploadPanel.hidden) {
                        self.reResize();
                    }
                }
                break;
        }
    };

    // Main window
    var self = new config.Window({
        title: config.htcConfig.locData.UploadTitle,
        plain: true,
        layout: 'fit',
        width: 400,
        height: 320 + (simpleFp ? simpleFp.additionalHeight:0),
        minWidth: 400,
        minHeight: 320,
        closeAction: 'hide',
        collapsible: false, // becouse, java-, flash- ans silverlight upload is re-renderered on collapse window
        draggable: !HttpCommander.Lib.Utils.browserIs.ie, // becouse in IE silverlight uploader re-renderered on move window
        animCollapse: false,
        //minimizable: true,
        maximizable: true,
        closable: true,
        items: new Ext.TabPanel({
            itemId: 'upload-tab-panel',
            autoTabs: true,
            activeTab: 0,
            deferredRender: true,
            border: false,
            enableTabScroll: true,
            items: uploadTabs,
            listeners: {
                tabchange: handleTabChange
            }
        }),
        listeners: {
            /*minimize: function (selfWindow) {
                selfWindow.hide();
            },*/
            bodyresize: function (selfWindow, width, height) {
                /* Adjust size for uploaders */

                // Java upload
                if (javaFp) {
                    var javaPowUpload = document.getElementById(config.$("javaPowUpload"));
                    if (javaPowUpload) {
                        javaPowUpload.width = width - 10;
                        var jvuAdjHeight = height - 58
                        var javaUploaderRemarkSize = javaFp.getMaxSizeNoteCmp();
                        if (javaUploaderRemarkSize && javaUploaderRemarkSize.rendered) {
                            jvuAdjHeight -= (javaUploaderRemarkSize.getHeight() <= 0 ? 13 : javaUploaderRemarkSize.getHeight());
                        }
                        javaPowUpload.height = jvuAdjHeight;
                    }
                }
                // Flash upload
                if (flashFp) {
                    var flashPowUpload = window[config.$('MultiPowUpload')];
                    if (flashPowUpload) {
                        flashPowUpload.width = width - 2;
                        var fluAdjHeight = height - 32;
                        var flashUploaderRemarkSize = document.getElementById(config.$("flashUploaderRemarkSize"));
                        if (flashUploaderRemarkSize) {
                            fluAdjHeight -= (flashUploaderRemarkSize.offsetHeight <= 0 ? 13 : flashUploaderRemarkSize.offsetHeight);
                        }
                        flashPowUpload.height = fluAdjHeight;
                    }
                }
                // Silverlight upload
                if (silverlightFp) {
                    var ultimateUpload = document.getElementById(config.$("ultimateUploader"));
                    if (ultimateUpload) {
                        ultimateUpload.width = width - 2;
                        var sluAdjHeight = height - 32;
                        var ultimateUploaderRemarkSize = document.getElementById(config.$("ultimateUploaderRemarkSize"));
                        if (ultimateUploaderRemarkSize) {
                            sluAdjHeight -= (ultimateUploaderRemarkSize.offsetHeight <= 0 ? 13 : ultimateUploaderRemarkSize.offsetHeight);
                        }
                        ultimateUpload.height = sluAdjHeight;
                    }
                }
                // Drag'n Drop upload
                if (dndFp && dndFp.getUploadDnDGridPanel()) {
                    dndFp.getUploadDnDGridPanel().setHeight(height - 72);
                }
                // Google upload
                if (googleFp) {
                    var googleTree = googleFp.getGoogleDocsTree();
                    if (googleTree && googleTree.rendered && !googleTree.hidden) {
                        var newGDTreeHeight = height - 72;
                        googleTree.setHeight(newGDTreeHeight - googleTree.getPosition()[1] + googleFp.getPosition()[1]);
                        googleTree.setWidth(width - 10);
                    }
                }
                // SkyDrive upload
                if (skyDriveFp) {
                    skyDriveFp.reResize(width, height);
                }
                // Dropbox upload
                if (dropboxFp) {
                    var dropboxUploadPanel = dropboxFp.getDropboxUploadPanel();
                    if (dropboxUploadPanel && dropboxUploadPanel.rendered && !dropboxUploadPanel.hidden) {
                        var newDBTreeHeight = height - 72;
                        dropboxUploadPanel.setHeight(newDBTreeHeight);
                        dropboxUploadPanel.setWidth(width - 10);
                        var dropboxItemsTree = dropboxFp.getDropboxItemsTree();
                        if (dropboxItemsTree && dropboxItemsTree.rendered && !dropboxItemsTree.hidden) {
                            dropboxItemsTree.setHeight(newDBTreeHeight - dropboxItemsTree.getPosition()[1] + dropboxUploadPanel.getPosition()[1]);
                            dropboxItemsTree.setWidth(width - 12);
                        }
                    }
                }
                // Box upload
                if (boxFp) {
                    var boxUploadPanel = boxFp.getBoxUploadPanel();
                    if (boxUploadPanel && boxUploadPanel.rendered && !boxUploadPanel.hidden) {
                        var newBTreeHeight = height - 72;
                        boxUploadPanel.setHeight(newBTreeHeight);
                        boxUploadPanel.setWidth(width - 10);
                        var boxItemsTree = boxFp.getBoxItemsTree();
                        if (boxItemsTree && boxItemsTree.rendered && !boxItemsTree.hidden) {
                            boxItemsTree.setHeight(newBTreeHeight - boxItemsTree.getPosition()[1] + boxUploadPanel.getPosition()[1]);
                            boxItemsTree.setWidth(width - 12);
                        }
                    }
                }
                // Upload from Url
                if (uploadFromUrlFp) {
                    var uploadFromUrlField = uploadFromUrlFp.getUploadFromUrlField();
                    if (uploadFromUrlField) {
                        var lblH = uploadFromUrlField.rendered
                        ? (uploadFromUrlField.label.getHeight() == 0
                            ? 60 : uploadFromUrlField.label.getHeight())
                        : 60;
                        uploadFromUrlField.setHeight(height - lblH - 150);
                    }
                }
            },
            beforeshow: function (selfWindow) {
                if (javaFp) {
                    var juTab = selfWindow.getComponent('java-upload');
                    if (juTab) {
                        if (juTab.rendered) {
                            var contentJU = document.getElementById(config.$('contentForJavaUploader'));
                            if (contentJU) {
                                contentJU.innerHTML = String.format((config.htcConfig.chunkedUpload
                                        ? HttpCommander.Lib.Consts.uploadAppletTextEx
                                        : HttpCommander.Lib.Consts.uploadAppletText),
                                    Ext.util.Format.htmlEncode(config.getAppRootUrl()),
                                    config.getUid(),
                                    config.htcConfig.twoLetterLangName);
                            }
                        } else {
                            juTab.html = '<div style="margin-top:4px;margin-left:4px;" id="'
                                + config.$('contentForJavaUploader') + '">'
                                + String.format((config.htcConfig.chunkedUpload
                                        ? HttpCommander.Lib.Consts.uploadAppletTextEx
                                        : HttpCommander.Lib.Consts.uploadAppletText),
                                    Ext.util.Format.htmlEncode(config.getAppRootUrl()),
                                    config.getUid(),
                                    config.htcConfig.twoLetterLangName)
                                + '</div>';
                        }
                    }
                }
                if (lastActiveTab) {
                    if (lastActiveTab.itemId == 'dropbox-upload' ||
                        lastActiveTab.itemId == 'skydrive-upload' ||
                        lastActiveTab.itemId == 'google-upload' ||
                        lastActiveTab.itemId == 'box-upload') {
                        handleTabChange(selfWindow.getComponent('upload-tab-panel'), lastActiveTab, true);
                    }
                }
            },
            show: function (selfWindow) {
                selfWindow.syncSize(); /// ???
            },
            hide: function (selfWindow) {
                if (simpleFp) {
                    simpleFp.resetFields();
                }
                if (javaFp) {
                    var juTab = selfWindow.getComponent('java-upload');
                    if (juTab) {
                        HttpCommander.Lib.Utils.removeElementFromDOM(config.$('javaPowUpload'));
                        var contentJU = document.getElementById(config.$('contentForJavaUploader'));
                        if (contentJU) {
                            contentJU.innerHTML = '';
                        }
                    }
                }
            }
        },
        'reResize': function () {
            self.setSize(self.getWidth() + 1, self.getHeight() + 1);
            self.setSize(self.getWidth() - 1, self.getHeight() - 1);
        },
        'registerJavascriptEventsForUploaders': function (fileManager) {
            if (fileManager) {
                if (javaFp) { // Register javascript JavaPowUpload events
                    fileManager.JavaPowUpload_onUploadStart = javaFp.JavaPowUpload_onUploadStart;
                    fileManager.JavaPowUpload_onUploadFinish = javaFp.JavaPowUpload_onUploadFinish;
                    fileManager.JavaPowUpload_onServerResponse = javaFp.JavaPowUpload_onServerResponse;
                    fileManager.JavaPowUpload_onAppletInit = javaFp.JavaPowUpload_onAppletInit;
                }
                if (flashFp) { // Define and register javascript flash events
                    fileManager.MultiPowUpload_onStart = flashFp.MultiPowUpload_onStart;
                    fileManager.MultiPowUpload_onComplete = flashFp.MultiPowUpload_onComplete;
                    fileManager.MultiPowUpload_onServerResponse = flashFp.MultiPowUpload_onServerResponse;
                    fileManager.MultiPowUpload_onMovieLoad = flashFp.MultiPowUpload_onMovieLoad;
                }
            }
        },
        'setActiveUpload': function (itemId) {
            self.items.items[0].setActiveTab(itemId);
        },
        'activateiOSTabIfExists': function () {
            if (iosfp) {
                self.setActiveUpload('ios-upload-tab');
            }
        },
        'getDragAndDropFormPanel': function () {
            return dndFp;
        }
    });

    return self;
};