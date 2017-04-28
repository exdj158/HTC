Ext.ns('HttpCommander.Lib');

/**
 *  Google Tree Loader (extend Ext.tree.TreeLoader)
 */
HttpCommander.Lib.GoogleTreeLoader = Ext.extend(Ext.tree.TreeLoader, {
    onlyFolders: false,
    api: null,
    load: function (node, callback, scope) {
        if (this.clearOnLoad) {
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
        }
        if (this.doPreload(node)) { // preloaded json children
            this.runCallback(callback, scope || node, [node]);
        } else if (this.api || this.directFn || this.dataUrl || this.url) {
            this.requestData(node, callback, scope || node);
        }
    },
    googleTypes: [
        'application/vnd.google-apps.folder',
        'application/vnd.google-apps.document',
        'application/vnd.google-apps.spreadsheet',
        'application/vnd.google-apps.presentation',
        'application/pdf',
        'application/vnd.google-apps.drawing',
        'application/vnd.google-apps.form'
    ],
    requestData: function (node, callback, scope) {
        if (this.fireEvent("beforeload", this, node, callback) !== false) {
            if (this.api) {
                var sc = this,
                    argument = {
                        'callback': callback,
                        'node': node,
                        'scope': scope
                    },
                    types = this.googleTypes;
                sc.api.getFileList(function (list, error, immediate) {
                    if (list && Ext.isArray(list)) {
                        var childs = [];
                        Ext.each(list, function (item, index, allItems) {
                            if (item && item.mimeType != types[6] && (!item.labels || !item.labels.trashed)) {
                                node = {
                                    'text': item.title,
                                    'leaf': item.mimeType != types[0],
                                    'checked': false
                                };
                                if (node.leaf) {
                                    node.file = true;
                                    node.type = types.indexOf(item.mimeType);
                                    if (node.type < 1) {
                                        node.type = 0;
                                        if (item.iconLink) {
                                            node.icon = item.iconLink;
                                        }
                                    } else {
                                        node.icon = sc.htcConfig.relativePath + 'Images/gtype' + node.type + '.png';
                                    }
                                    node.iconCls = 'google-tree-node-icon';
                                }
                                node = Ext.copyTo(node, item, 'id downloadUrl title exportLinks mimeType');
                                childs.push(node);
                            }
                        });
                        sc.handleResponse.apply(sc, [{
                            'responseData': childs,
                            'argument': argument
                        }]);
                    } else {
                        sc.handleFailure.apply(sc, [{
                            'error': error,
                            'argument': argument
                        }]);
                    }
                }, sc.onlyFolders, node && node.parentNode
                    ? node.id : (node.googleId ? node.googleId : undefined));
            }
        } else {
            this.runCallback(callback, scope || node, []);
        }
    }
});

/**
 *  config:
 *  htcConfig, Msg, Window, getGoogleDriveAuth(), getUid(),
 *  getCurrentSelectedSet(), openGridFolder(), getCurrentFolder(),
 *  showBalloon(), setSelectPath(), isDemoMode(), openTreeRecent()
 */
HttpCommander.Lib.EditorGoogleWindow = function (config) {
    var cn = HttpCommander.Lib.Consts.CloudNames.google,
        self, ppFormats = ['ppt', 'pps', 'ppsx', 'ppsm', 'pptm'];

    self = new config.Window({
        title: config.htcConfig.locData.CommandEditInGoogle,
        bodyStyle: 'padding: 5px',
        layout: 'fit',
        width: 400,
        plain: true,
        minWidth: 320,
        minHeight: 200,
        height: 200,
        buttonAlign: 'center',
        closeAction: 'hide',
        collapsible: false,
        minimizable: false,
        closable: true,
        resizable: false,
        maximizable: false,
        modal: true,
        items:[{
            xtype: 'label',
            hideLabel: true,
            autoHeight: true,
            margins: '0 0 5 0',
            html: String.format
                (
                    config.htcConfig.locData.CloudAuthenticateMessage,
                    cn,
                    String.format(config.htcConfig.locData.CloudAuthenticateLink, cn),
                    "<br /><img align='absmiddle' width='16' height='16' src='"
                    + HttpCommander.Lib.Utils.getIconPath(config, 'googledocs') + "'/>&nbsp;"
                    + HttpCommander.Lib.Utils.getHelpLinkOpenTag(config.getUid(), "googledrive"),
                    "</a>"
                )
                + "<br /><br /><br /><div style='text-align:center;width:100%;'>"
                + "<img align='absmiddle' width='16' height='16' src='"
                + HttpCommander.Lib.Utils.getIconPath(config, 'googledocs') + "'>&nbsp;"
                + "<a id='" + config.getUid() + "_authGoogleEdit_link' href='#' target='_self'>"
                + String.format(config.htcConfig.locData.CloudAuthenticateLink, cn) + "</a>"
                + (config.isDemoMode() && !Ext.isEmpty(window.GoogleDemoName) && !Ext.isEmpty(window.GoogleDemoPass)
                        ? ('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="' + window.GoogleDemoName + '" />&nbsp;'
                                + '<input readonly onclick="this.select();" type="text" value="' + window.GoogleDemoPass + '" /></span>')
                        : '')
                + "</div>"
        }],
        buttons: [{
            text: config.htcConfig.locData.CommonButtonCaptionCancel,
            handler: function () { self.hide(); }
        }],
        listeners: {
            afterrender: function (wind) {
                var authLink = document.getElementById(config.getUid() + "_authGoogleEdit_link");
                if (authLink) {
                    authLink.onclick = function () {
                        config.getGoogleDriveAuth().checkAuth(false, 1, function (result, error) {
                            if (result && !error) {
                                self.hide();
                                if (self.deleteDoc === true) {
                                    self.deleteDocFromGoogle((self.docInfo || {}).id, (self.docInfo || {}).title);
                                } else {
                                    self.getEditedDocFromGoogle(self.waitId, self.docInfo, self.curFolder, self.fileName, self.create);
                                }
                            } else {
                                self.show();
                                if (error) {
                                    config.Msg.show({
                                        title: config.htcConfig.locData.CommonErrorCaption,
                                        msg: error,
                                        icon: config.Msg.ERROR,
                                        buttons: config.Msg.OK
                                    });
                                }
                            }
                        });
                        return false;
                    };
                }
            }
        },
        deleteDocFromGoogle: function (docId, docTitle) {
            config.Msg.hide();
            self.hide();
            self.deleteDoc = true;
            self.docInfo = null;
            self.curFolder = null;
            self.fileName = null;
            self.create = null;

            if (!config.htcConfig.enableGoogleEdit || Ext.isEmpty(docId))
                return;

            self.docInfo = { id: docId, title: docTitle };

            var authObj = config.getGoogleDriveAuth();
            if (!Ext.isObject(authObj)) {
                self.show();
                return;
            }

            authObj.checkAuth(true, 1, function (result, error) {
                if (result && !error) {
                    self.hide();
                    try {
                        var request = gapi.client.drive.files['delete']({
                            'fileId': docId
                        });
                        request.execute(function (resp) {
                            if (Ext.isObject(resp) && Ext.isObject(resp.error)) {
                                if (self.deleteDoc === true && Ext.isObject(self.docInfo)) {
                                    if (reps.error.code == 401) {
                                        self.show();
                                    }
                                    if (resp.error.code != 403 && reps.error.code != 401 && !Ext.isEmpty(resp.error.message)) {
                                        config.Msg.show({
                                            title: config.htcConfig.locData.CommonErrorCaption,
                                            msg: Ext.util.Format.htmlEncode(resp.error.message),
                                            icon: config.Msg.ERROR,
                                            buttons: config.Msg.OK
                                        });
                                    }
                                }
                            }
                        });
                    } catch (e) {
                        if (e && !Ext.isEmpty(e.message)) {
                            config.Msg.show({
                                title: config.htcConfig.locData.CommonErrorCaption,
                                msg: Ext.util.Format.htmlEncode(e.message),
                                icon: config.Msg.ERROR,
                                buttons: config.Msg.OK
                            });
                        }
                    }
                } else {
                    self.show();
                    if (error) {
                        config.Msg.show({
                            title: config.htcConfig.locData.CommonErrorCaption,
                            msg: error,
                            icon: config.Msg.ERROR,
                            buttons: config.Msg.OK
                        });
                    }
                }
            });
        },
        getEditedDocFromGoogle: function (waitId, docInfo, curFolder, fileName, create, suppressDelete) {
            self.waitId = null;
            self.docInfo = null;
            self.curFolder = null;
            self.fileName = null;
            self.create = null;
            self.deleteDoc = null;

            config.Msg.hide();
            self.hide();

            if (!config.htcConfig.enableGoogleEdit || !Ext.isObject(docInfo) || Ext.isEmpty(docInfo.id))
                return;

            self.docInfo = Ext.apply({}, docInfo);
            self.curFolder = curFolder;
            self.fileName = fileName;
            self.create = create;
            self.waitId = waitId;

            var authObj = config.getGoogleDriveAuth();
            if (!Ext.isObject(authObj)) {
                self.show();
                return;
            }
            var authInfo = authObj.getAuthInfo();
            if (!authInfo || !authInfo.access_token) {
                self.show();
                return;
            }

            var aboutInfo = authObj.getAboutInfo();

            var uploadInfo = {
                token: authInfo.access_token,
                path: curFolder,
                edit: true,
                create: create,
                gdocs: [{
                    name: fileName,
                    id: docInfo.id,
                    newName: !Ext.isEmpty(docInfo.newName) ? docInfo.newName : null,
                    link: docInfo.downloadUrl,
                    ext: ''
                }],
                folders: [],
                rename: create,
                notdel: (suppressDelete === true)
            };

            var ext = HttpCommander.Lib.Utils.getFileExtension(fileName);
            var newExt = HttpCommander.Lib.Utils.checkAndGetNewExtensionConvertedFromGoogle(ext);
            var firstExportFormat = null;

            // Get download url from export links
            if (Ext.isObject(docInfo.exportLinks)) {
                if (Ext.isEmpty(docInfo.downloadUrl)) {
                    for (var p in docInfo.exportLinks) {
                        if (docInfo.exportLinks.hasOwnProperty(p)) {
                            if (Ext.isEmpty(firstExportFormat)) {
                                firstExportFormat = p;
                            }
                            var v = docInfo.exportLinks[p];
                            var ve = null;
                            if (!Ext.isEmpty(v)) {
                                var lastEqPos = v.lastIndexOf('=');
                                if (lastEqPos >= 0 && lastEqPos + 1 < v.length) {
                                    ve = v.substring(lastEqPos + 1).toLowerCase();
                                    if ((ext == ve) || (newExt == ve)) {
                                        uploadInfo.gdocs[0].link = v;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                // if export url not found - get first export url link
                if (Ext.isEmpty(uploadInfo.gdocs[0].link) && !Ext.isEmpty(firstExportFormat)) {
                    var v = docInfo.exportLinks[firstExportFormat];
                    if (!Ext.isEmpty(v)) {
                        var lastEqPos = v.lastIndexOf('=');
                        if (lastEqPos >= 0 && lastEqPos + 1 < v.length) {
                            v = v.substring(0, lastEqPos + 1) + ext; // try export to file exstension
                            uploadInfo.gdocs[0].ext = v.substring(lastEqPos + 1).toLowerCase();
                        }
                        uploadInfo.gdocs[0].link = v;
                    }
                }
            }

            var oldAT = Ext.Ajax.timeout;
            Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
            config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudUploadProgressMessage, cn) + '...';
            config.globalLoadMask.show();
            HttpCommander.GoogleDrive.UploadDocs(uploadInfo, function (data, trans) {
                Ext.Ajax.timeout = oldAT;
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                        data, trans, config.Msg, config.htcConfig, 0, function () {
                            if (data.needAuth === true) self.show(); })) {

                    var editNewName = data.editNewName;
                    if (!Ext.isEmpty(editNewName) && !Ext.isEmpty(waitId)) {
                        if (Ext.isArray(window['lastEditedGoogleDoc'])) {
                            var i, item, len = window['lastEditedGoogleDoc'].length;
                            for (i = 0; i < len; i++) {
                                item = window['lastEditedGoogleDoc'][i] || {};
                                if (item.id === waitId && Ext.isObject(item.doc)) {
                                    item.doc.newName = editNewName;
                                    window['lastEditedGoogleDoc'][i] = item;
                                    break;
                                }
                            }
                        }
                    }

                    if (!Ext.isEmpty(data.editNewName)) {
                        config.setSelectPath({
                            name: data.editNewName,
                            path: curFolder
                        });
                    }

                    config.openTreeRecent();

                    config.openGridFolder(curFolder);
                    var balloonText = String.format(
                        config.htcConfig.locData.BalloonFilesUploaded,
                        data.filesSaved
                    );
                    if (data.filesRejected > 0) {
                        balloonText += '<br />' + String.format(
                            config.htcConfig.locData.BalloonFilesNotUploaded,
                            data.filesRejected
                        );
                    }
                    if (data.errors && data.errors != '') {
                        balloonText += '<br />' + data.errors;
                    }
                    config.showBalloon(balloonText);
                }
            });
        }
    });

    return self;
};

/**
 *  config:
 *  htcConfig, Msg, Window, getGoogleDriveAuth(), getUid(),
 *  getCurrentSelectedSet(), isDemoMode()
 */
HttpCommander.Lib.DownloadToGoogleWindow = function (config) {
    var cn = HttpCommander.Lib.Consts.CloudNames.google,
        self,
        googleFoldersLabel,
        googleConvertCheckBox,
        googleFoldersPanel,
        googleFoldersTreeLoader,
        googleFoldersTree;

    self = new config.Window({
        title: config.htcConfig.locData.CommandDownloadToGoogleDocs,
        bodyStyle: 'padding: 5px',
        layout: 'fit',
        width: 400,
        plain: true,
        minWidth: 320,
        minHeight: 200,
        height: 300,
        buttonAlign: 'center',
        closeAction: 'hide',
        collapsible: false,
        minimizable: false,
        closable: true,
        resizable: true,
        maximizable: true,
        modal: true,
        items:
        [
            {
                xtype: 'label',
                hideLabel: true,
                autoHeight: true,
                margins: '0 0 5 0',
                html: String.format
                    (
                        config.htcConfig.locData.CloudAuthenticateMessage,
                        cn,
                        String.format(config.htcConfig.locData.CloudAuthenticateLink, cn),
                        "<br /><img align='absmiddle' width='16' height='16' src='"
                        + HttpCommander.Lib.Utils.getIconPath(config, 'googledocs') + "'/>&nbsp;"
                        + HttpCommander.Lib.Utils.getHelpLinkOpenTag(config.getUid(), "googledrive"),
                        "</a>"
                    )
                    + "<br /><br /><br /><div style='text-align:center;width:100%;'>"
                    + "<img align='absmiddle' width='16' height='16' src='"
                    + HttpCommander.Lib.Utils.getIconPath(config, 'googledocs') + "'>&nbsp;"
                    + "<a id='" + config.getUid() + "_authGoogleDown_link' href='#' target='_self'>"
                    + String.format(config.htcConfig.locData.CloudAuthenticateLink, cn) + "</a>"
                    + (config.isDemoMode() && !Ext.isEmpty(window.GoogleDemoName) && !Ext.isEmpty(window.GoogleDemoPass)
                            ? ('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="' + window.GoogleDemoName + '" />&nbsp;'
                                    + '<input readonly onclick="this.select();" type="text" value="' + window.GoogleDemoPass + '" /></span>')
                            : '')
                    + "</div>"
            },
            googleFoldersLabel = new Ext.form.Label({
                html: String.format(config.htcConfig.locData.CloudSelectFolderMessage, cn),
                hidden: true
            }),
            googleConvertCheckBox = new Ext.form.Checkbox({
                hidden: true,
                checked: true,
                boxLabel: String.format(config.htcConfig.locData.GoogleDriveConvertMsg,
                    '<a href="https://support.google.com/drive/answer/49008" target="_blank">',
                    '</a>'
                )
            }),
            googleFoldersPanel = new Ext.Panel({
                layout: 'fit',
                height: 230,
                hidden: true,
                anchor: '100%',
                tbar: new Ext.Toolbar({
                    enableOverflow: true,
                    items:
                    [
                        {
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'gdrefresh'),
                            text: config.htcConfig.locData.CommandRefresh,
                            handler: function () {
                                config.getGoogleDriveAuth().clearAuth();
                                self.prepare(true);
                            }
                        },
                        '-',
                        {
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'googledocs'),
                            text: cn,
                            tooltip: '<b><img align="absmiddle" width="16" height="16" src="'
                                + HttpCommander.Lib.Utils.getIconPath(config, 'googledocs') + '">&nbsp;'
                                + String.format(config.htcConfig.locData.CloudLinkText, cn) + '</b><br/>'
                                + String.format(config.htcConfig.locData.CloudLinkDescription, cn),
                            scope: this,
                            handler: function () {
                                window.open('https://drive.google.com/');
                            }
                        },
                        '->',
                        {
                            text: String.format(config.htcConfig.locData.CloudSignInAsDifferentUserText, cn),
                            handler: function () {
                                config.getGoogleDriveAuth().signOut(function () {
                                    self.switchView(false);
                                });
                            }
                        }
                    ]
                }),
                items:
                [
                    googleFoldersTree = new Ext.tree.TreePanel({
                        root: {
                            text: String.format(config.htcConfig.locData.CloudRootFolderName, cn),
                            expaded: false,
                            checked: false
                        },
                        hidden: true,
                        useArrows: true,
                        autoScroll: true,
                        header: false,
                        flex: 1,
                        anchor: '100%',
                        lines: false,
                        loader: googleFoldersTreeLoader = new HttpCommander.Lib.GoogleTreeLoader({
                            htcConfig: config.htcConfig,
                            onlyFolders: true,
                            api: config.getGoogleDriveAuth(),
                            listeners: {
                                beforeload: function (treeLoader, node) {
                                    // TODO: before load childs
                                },
                                load: function (treeLoader, node, response) {
                                    // TODO: after load childs
                                    config.globalLoadMask.hide();
                                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                                },
                                loadexception: function (treeLoader, node, response) {
                                    config.globalLoadMask.hide();
                                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                                    config.Msg.show({
                                        title: config.htcConfig.locData.CommonErrorCaption,
                                        msg: response && response.error
                                            ? Ext.util.Format.htmlEncode(response.error)
                                            : config.htcConfig.locData.CommonLoadError,
                                        icon: config.Msg.ERROR,
                                        buttons: config.Msg.OK
                                    });
                                }
                            }
                        }),
                        listeners: {
                            load: function (node) {
                                if (node && (node.isRoot || !node.parentNode)) {
                                    var ui = node.getUI ? node.getUI() : null;
                                    if (ui && ui.toggleCheck) {
                                        ui.toggleCheck(true);
                                    } else {
                                        node.checked = true;
                                    }
                                }
                                if (node && node.childNodes) {
                                    Ext.each(node.childNodes, function (el) {
                                        el.setText(Ext.util.Format.htmlEncode(el.attributes.title));
                                    });
                                }
                            },
                            click: function (node) {
                                var nodeui = node.getUI();
                                if (nodeui) {
                                    nodeui.toggleCheck();
                                }
                            },
                            render: function (tr) {
                                tr.on('checkchange', self.checkChangeGoogleFolders);
                            }
                        }
                    })
                ]
            })
        ],
        buttons:
        [
            {
                text: config.htcConfig.locData.CommonButtonCaptionContinue,
                hidden: true,
                disabled: true,
                handler: function () {
                    if (!config.htcConfig.enableDownloadToGoogle)
                        return;

                    var node;
                    if (googleFoldersTree) {
                        var checkedNodes = googleFoldersTree.getChecked();
                        if (checkedNodes && checkedNodes.length > 0 && checkedNodes[0]) {
                            node = checkedNodes[0];
                        }
                    }
                    if (!node) {
                        self.buttons[0].setDisabled(true);
                        return;
                    }

                    var authInfo = config.getGoogleDriveAuth().getAuthInfo();
                    if (!authInfo || !authInfo.access_token) {
                        self.switchView(false);
                        return;
                    }

                    var aboutInfo = config.getGoogleDriveAuth().getAboutInfo();

                    var selectedSet = config.getCurrentSelectedSet();
                    var folderName = node.attributes.text;
                    var upInfo = {
                        importFormats: aboutInfo.importFormats,
                        maxUploadSizes: aboutInfo.maxUploadSizes,
                        quotaBytesTotal: aboutInfo.quotaBytesTotal,
                        quotaBytesUsed: aboutInfo.quotaBytesUsed,
                        folderId: node.id,
                        token: authInfo.access_token,
                        selections: selectedSet,
                        convert: googleConvertCheckBox && googleConvertCheckBox.getValue()
                    };

                    var oldAT = Ext.Ajax.timeout;
                    Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
                    config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudDownloadingMessage, cn) + "...";
                    config.globalLoadMask.show();
                    HttpCommander.GoogleDrive.DownloadDocs(upInfo, function (data, trans) {
                        Ext.Ajax.timeout = oldAT;
                        config.globalLoadMask.hide();
                        config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                        if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                                data, trans, config.Msg, config.htcConfig, 0, function () {
                                    if (data.needAuth === true) self.switchView(false); })) {
                            var dd = data.downloaded;
                            var balloonText = dd.files > 0 && dd.folders < 1
                                ? String.format(config.htcConfig.locData.CloudDownloadFilesSuccessMessage, dd.files, folderName, cn)
                                : dd.folders > 1 && dd.files < 0
                                    ? String.format(config.htcConfig.locData.CloudFoldersCreatedSuccessMessage, dd.folders, folderName, cn)
                                    : String.format(config.htcConfig.locData.CloudFilesFoldersSuccessMessage, dd.files, dd.folders, folderName, cn);
                            var dnd = data.notDownloaded;
                            if (dnd.files > 0 || dnd.folders > 0) {
                                balloonText += '<br />' +
                                    (dnd.files > 0 && dnd.folders < 1
                                        ? String.format(config.htcConfig.locData.CloudNotDownloadedFilesMessage, dnd.files)
                                        : dnd.folders > 0 && dnd.files < 1
                                            ? String.format(config.htcConfig.locData.CloudNotFoldersCreatedMessage, dnd.folders)
                                            : String.format(config.htcConfig.locData.CloudNotFilesFoldersDownloadedMessage, dnd.files, dnd.folders)
                                    );
                            }
                            var withoutErrors = true;
                            if (data.errors && data.errors != '') {
                                balloonText += '<div style="width:100%;min-width:200px !important;overflow:auto;height:auto;max-height:75px;display:inline-block;">'
                                    + data.errors + '</div>';
                                withoutErrors = false;
                            }

                            config.Msg.show({
                                title: config.htcConfig.locData.CloudDownloadEndMessageTitle,
                                msg: balloonText
                                    + '<br />' + (withoutErrors ? '<br />' : '') + config.htcConfig.locData.GoogleDocsDownloadEndWarningMessage
                                    + '<br /><br />'
                                    + '<img align="absmiddle" alt="Google Drive" width="16" height="16" src="'
                                    + HttpCommander.Lib.Utils.getIconPath(config, 'googledocs') + '">&nbsp;'
                                    + '<a href="https://drive.google.com/" target="_blank">'
                                    + String.format(config.htcConfig.locData.CloudLinkText, cn) + '</a>',
                                closable: false,
                                modal: true,
                                buttons: config.Msg.OK,
                                icon: config.Msg.INFO,
                                fn: function (btn) {
                                    if (btn == 'ok' && dd.folders > 0 && node) {
                                        node.expanded = false;
                                        node.loaded = false;
                                        node.expand(false, true);
                                    }
                                }
                            });
                        }
                    });
                }
            },
            {
                text: config.htcConfig.locData.CommonButtonCaptionCancel,
                handler: function () { self.hide(); }
            }
        ],
        listeners: {
            afterrender: function (wind) {
                var authLink = document.getElementById(config.getUid() + "_authGoogleDown_link");
                if (authLink) {
                    authLink.onclick = function () {
                        self.prepare();
                        return false;
                    };
                }
            },
            resize: function (win, width, height) {
                if (googleFoldersPanel && googleFoldersPanel.rendered
                    && !googleFoldersPanel.hidden && googleFoldersPanel.getTopToolbar) {
                    var pt = googleFoldersPanel.getTopToolbar();
                    if (pt.rendered && !pt.hidden)
                        googleFoldersPanel.setWidth(width - 24);
                    googleFoldersPanel.setHeight(win.body.getHeight() - googleFoldersLabel.getHeight()
                        - googleConvertCheckBox.getHeight() - 10);
                }
            }
        },
        checkChangeGoogleFolders: function (node, checked) {
            if (googleFoldersTree) {
                googleFoldersTree.un('checkchange', self.checkChangeGoogleFolders);
                if (checked) {
                    Ext.each(googleFoldersTree.getChecked(), function (n) {
                        if (n && n != node && n.id != node.id && n.attributes.checked) {
                            n.getUI().toggleCheck(false);
                            n.attributes.checked = false;
                        }
                    });
                }
                googleFoldersTree.on('checkchange', self.checkChangeGoogleFolders);
                self.buttons[0].setDisabled(googleFoldersTree.getChecked().length == 0);
            }
        },
        prepare: function (hidden) {
            config.getGoogleDriveAuth().checkAuth(hidden === true, false, function (result, error) {
                if (result && Ext.isArray(result)) {
                    self.switchView(true);
                    self.getRootFolders();
                } else {
                    self.switchView(false);
                    if (error) {
                        config.Msg.show({
                            title: config.htcConfig.locData.CommonErrorCaption,
                            msg: error,
                            icon: config.Msg.ERROR,
                            buttons: config.Msg.OK
                        });
                    }
                }
            });
        },
        switchView: function (enabled) {
            if (googleFoldersLabel)
                googleFoldersLabel.setVisible(enabled);
            if (googleConvertCheckBox)
                googleConvertCheckBox.setVisible(enabled);
            if (googleFoldersTree)
                googleFoldersTree.setVisible(enabled);
            if (googleFoldersPanel)
                googleFoldersPanel.setVisible(enabled);

            self.items.items[0].setVisible(!enabled);
            self.buttons[0].setVisible(enabled);

            if (!enabled) {
                config.getGoogleDriveAuth().clearAuth();
                self.clearRootNode();
            }

            self.show();
            self.syncSize();
        },
        clearRootNode: function () {
            if (googleFoldersTree) {
                var rootNode = googleFoldersTree.getRootNode();
                if (rootNode) {
                    self.buttons[0].setDisabled(true);
                    rootNode.removeAll();
                    rootNode.checked = false;
                    var ui = rootNode.getUI();
                    if (ui && ui.toggleCheck) {
                        ui.toggleCheck(false);
                    }
                    rootNode.loaded = false;
                }
            }
        },
        getRootFolders: function (rootInfo) {
            if (googleFoldersTree) {
                var rootNode = googleFoldersTree.getRootNode();
                if (rootNode) {
                    self.clearRootNode();
                    config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudLoadMsg, cn) + '...';
                    config.globalLoadMask.show();
                    rootNode.expanded = false;
                    rootNode.id = (rootInfo || {}).id;
                    rootNode.expand(false, true);
                    return;
                }
            }
        }
    });

    return self;
};


/**
 *  config:
 *  htcConfig, Msg, Window, globalLoadMask, getUid(), getUploadWindow(),
 *  getCurrentFolder(), openGridFolder(), showBalloon(),
 *  gridItemExists(), isModifyAllowed(), getFileManagerInstance(),
 *  getGoogleDriveAuth(), isDemoMode(), openTreeRecent()
 */
HttpCommander.Lib.UploadFromGoogle = function (config) {
    var editorFormats = new Ext.form.ComboBox({
        autoSelect: true,
        allowBlank: true,
        editable: false,
        forceSelection: false,
        mode: 'local',
        store: new Ext.data.ArrayStore({
            idIndex: 0,
            autoDestroy: true,
            fields: ['format'],
            data: []
        }),
        valueField: 'format',
        displayField: 'format',
        tpl: '<tpl for="."><div class="x-combo-list-item">{format:htmlEncode}</div></tpl>',
        typeAhead: true,
        triggerAction: 'all',
        lazyRender: false,
        lazyInit: false,
        listClass: 'x-combo-list-small'
    });

    var cn = HttpCommander.Lib.Consts.CloudNames.google,
        self,
        googleDocsGrid,
        googleDocsIgnorePathsCheckbox,
        googleDocsItemsTree,
        googleDocsUploadTreeLoader;

    var showError = function (msg, encode) {
        config.Msg.show({
            title: config.htcConfig.locData.CommonErrorCaption,
            msg: encode ? Ext.util.Format.htmlEncode(msg) : msg,
            icon: config.Msg.ERROR,
            buttons: config.Msg.CANCEL
        });
    };

    self = new Ext.FormPanel({
        frame: false,
        bodyStyle: 'padding: 5px 5px 0 5px;',
        border: false,
        bodyBorder: false,
        header: false,
        buttonAlign: 'center',
        layout: 'fit',
        items:
        [
            {
                xtype: 'label',
                html: String.format
                    (
                        config.htcConfig.locData.CloudAuthenticateMessage,
                        cn,
                        String.format(config.htcConfig.locData.CloudAuthenticateLink, cn),
                        "<img align='absmiddle' width='16' height='16' src='"
                            + HttpCommander.Lib.Utils.getIconPath(config, 'googledocs') + "'/>&nbsp;"
                            + HttpCommander.Lib.Utils.getHelpLinkOpenTag(config.getUid(), "googledrive"),
                        "</a>"
                    )
                    + "<br /><br /><br /><div style='text-align:center;width:100%;'>"
                    + "<img align='absmiddle' width='16' height='16' src='"
                    + HttpCommander.Lib.Utils.getIconPath(config, 'googledocs') + "'/>&nbsp;"
                    + "<a id='" + config.getUid() + "_authGoogleUp_link' href='#"
                    + "' target='_self'>"
                    + String.format(config.htcConfig.locData.CloudAuthenticateLink, cn) + "</a>"
                    + (config.isDemoMode() && !Ext.isEmpty(window.GoogleDemoName) && !Ext.isEmpty(window.GoogleDemoPass)
                            ? ('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="' + window.GoogleDemoName + '" />&nbsp;'
                                    + '<input readonly onclick="this.select();" type="text" value="' + window.GoogleDemoPass + '" /></span>')
                            : '')
                    + "</div>",
                listeners: {
                    afterrender: function (wind) {
                        self.bindAuthOnLink();
                    }
                }
            },
            {
                xtype: 'label',
                hidden: true,
                html: String.format(config.htcConfig.locData.CloudUploadSelectItemsMessage, cn)
            },
            googleDocsIgnorePathsCheckbox = new Ext.form.Checkbox({
                hidden: true,
                boxLabel: config.htcConfig.locData.UploadJavaIgnorePaths,
                listeners: {
                    check: function (cb, checked) {
                        if (!!googleDocsItemsTree) {
                            var checkedNodes = googleDocsItemsTree.getChecked();
                            self.buttons[0].setDisabled(checkedNodes.length == 0);
                        }
                    }
                }
            }),
            googleDocsItemsTree = new Ext.tree.TreePanel({
                root: {
                    text: String.format(config.htcConfig.locData.CloudRootFolderName, cn),
                    expaded: false,
                    checked: false
                },
                hidden: true,
                useArrows: true,
                autoScroll: true,
                header: false,
                lines: false,
                loader: googleDocsUploadTreeLoader = new HttpCommander.Lib.GoogleTreeLoader({
                    htcConfig: config.htcConfig,
                    onlyFolders: false,
                    api: config.getGoogleDriveAuth(),
                    listeners: {
                        beforeload: function (treeLoader, node) {
                            // TODO: before load childs
                        },
                        load: function (treeLoader, node, response) {
                            // TODO: after load childs
                            config.globalLoadMask.hide();
                            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                        },
                        loadexception: function (treeLoader, node, response) {
                            config.globalLoadMask.hide();
                            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                            config.Msg.show({
                                title: config.htcConfig.locData.CommonErrorCaption,
                                msg: response && response.error
                                    ? Ext.util.Format.htmlEncode(response.error)
                                    : config.htcConfig.locData.CommonLoadError,
                                icon: config.Msg.ERROR,
                                buttons: config.Msg.OK
                            });
                        }
                    }
                }),
                tbar: new Ext.Toolbar({
                    enableOverflow: true,
                    items:
                    [
                        {
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'gdrefresh'),
                            text: config.htcConfig.locData.CommandRefresh,
                            handler: function () {
                                config.getGoogleDriveAuth().clearAuth();
                                self.prepare();
                            }
                        },
                        '-',
                        {
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'googledocs'),
                            text: cn,
                            tooltip: '<b><img align="absmiddle" width="16" height="16" src="'
                                + HttpCommander.Lib.Utils.getIconPath(config, 'googledocs') + '">&nbsp;'
                                + String.format(config.htcConfig.locData.CloudLinkText, cn) + '</b><br/>'
                                + String.format(config.htcConfig.locData.CloudLinkDescription, cn),
                            scope: self,
                            handler: function () {
                                window.open('https://drive.google.com/');
                            }
                        },
                        '->',
                        {
                            text: String.format(config.htcConfig.locData.CloudSignInAsDifferentUserText, cn),
                            handler: function () {
                                config.getGoogleDriveAuth().signOut(function () {
                                    self.switchView(false);
                                });
                            }
                        }
                    ]
                }),
                listeners: {
                    load: function (node) {
                        Ext.each(node.childNodes, function (el) {
                            if (el.attributes.leaf && el.attributes.type > 0 && el.attributes.type != 4 && el.attributes.exportLinks) {
                                if (config.getFileManagerInstance && !config.getFileManagerInstance().showSelectExportFormats)
                                    config.getFileManagerInstance().showSelectExportFormats = self.showSelectExportFormats;
                                el.attributes.exports = self.googleExportDefaultFormats[el.attributes.type];
                                var expTitle = self.googleExportFormats[el.attributes.exports].title;
                                el.setText(Ext.util.Format.htmlEncode(el.attributes.title) + ' (' + config.htcConfig.locData.GoogleDocsSaveAs
                                    + ' <a href="#" style="text-decoration:underline;" onclick="HttpCommander.Main.FileManagers['
                                        + "'" + config.getUid() + "'" + '].showSelectExportFormats(' + el.attributes.type
                                            + ",'" + el.id + "','" + el.attributes.exports + "','"
                                                + Ext.util.Format.htmlEncode(el.attributes.title) + "'" + ')">' + expTitle + '</a>)');
                            } else {
                                el.setText(Ext.util.Format.htmlEncode(el.attributes.title));
                            }
                            if (el.attributes.leaf && el.attributes.type > 0
                                    && el.attributes.icon && config.htcConfig.relativePath != '') {
                                el.attributes.icon = config.htcConfig.relativePath + el.attributes.icon;
                            }
                        });
                    },
                    render: function (tr) {
                        tr.on('checkchange', self.checkChangeGoogleDocsUploadList);
                    }
                }
            })
        ],
        listeners: {
            afterrender: function (wind) {
                wind.bindAuthOnLink();
            }
        },
        buttons:
        [
            {
                hidden: true,
                text: config.htcConfig.locData.UploadSimpleUpload,
                handler: function () {
                    var curFolder = config.getCurrentFolder();

                    if (!curFolder) {
                        config.Msg.alert(config.htcConfig.locData.UploadFolderNotSelectedTitle,
                            config.htcConfig.locData.UploadFolderNotSelected
                        );
                        return;
                    }
                    if (!config.htcConfig.currentPerms || !config.htcConfig.currentPerms.upload) {
                        config.Msg.alert(config.htcConfig.locData.UploadNotAllowedTitle,
                            config.htcConfig.locData.UploadNotAllowedPrompt
                        );
                        return;
                    }

                    var checkedNodes = googleDocsItemsTree.getChecked();
                    if (checkedNodes.length == 0) {
                        self.buttons[0].setDisabled(true);
                        showError(String.format(config.htcConfig.locData.CloudUploadSelectItemsMessage, ''), true);
                        return;
                    }

                    var authInfo = config.getGoogleDriveAuth().getAuthInfo();
                    if (!authInfo || !authInfo.access_token) {
                        self.switchView(false);
                        return;
                    }

                    var ignorePaths = googleDocsIgnorePathsCheckbox.getValue();
                    var uploadInfo = {
                        token: authInfo.access_token,
                        path: curFolder,
                        gdocs: [],
                        folders: [],
                        rename: true
                    };
                    var addedPaths = [];
                    var emptyFolders = [];
                    Ext.each(checkedNodes, function (node) {
                        if (node.attributes.file) {
                            var itemFile = {
                                name: node.attributes.title,
                                id: node.attributes.id,
                                link: node.attributes.downloadUrl,
                                ext: ''
                            };
                            if (!ignorePaths) {
                                var parentNode = node.parentNode;
                                var path1 = '';
                                while (!!parentNode && (!parentNode.isRoot || typeof parentNode.isRoot == 'undefined')) {
                                    if (path1.length > 0)
                                        path1 = '/' + path1;
                                    path1 = parentNode.attributes.title + path1;
                                    parentNode = parentNode.parentNode;
                                }
                                itemFile.path = path1;
                            }
                            var attr = node.attributes
                            if (attr.exports && attr.exports.length > 0
                                    && attr.exportLinks && attr.exportLinks.hasOwnProperty(attr.exports)) {
                                itemFile.link = attr.exportLinks[attr.exports];
                                if (self.googleExportFormats.hasOwnProperty(attr.exports)) {
                                    itemFile.ext = self.googleExportFormats[attr.exports].ext;
                                }
                            }
                            if (Ext.isEmpty(itemFile.ext) || itemFile.ext.trim().length == 0) {
                                if (!Ext.isEmpty(attr.mimeType) && self.googleExportFormats.hasOwnProperty(attr.mimeType)) {
                                    itemFile.ext = self.googleExportFormats[attr.mimeType].ext;
                                }
                            }
                            uploadInfo.gdocs.push(itemFile);
                            if (!uploadInfo.ignorePaths && !Ext.isEmpty(itemFile.path)) {
                                addedPaths.push((itemFile.path + (itemFile.path.length > 0 ? '/' : '') + itemFile.name).toLowerCase());
                            }
                        } else if (!ignorePaths) {
                            var parentNode1 = node.parentNode;
                            var path2 = '';
                            while (!!parentNode1 && (!parentNode1.isRoot || typeof parentNode1.isRoot == 'undefined')) {
                                if (path2.length > 0) {
                                    path2 = '/' + path2;
                                }
                                path2 = parentNode1.attributes.title + path2;
                                parentNode1 = parentNode1.parentNode;
                            }
                            var emptyFolderPath = path2 + (path2.length > 0 ? '/' : '') + node.attributes.title;
                            emptyFolders.push(emptyFolderPath);
                            addedPaths.push(emptyFolderPath.toLowerCase());
                        }
                    });
                    var pLen = addedPaths.length;
                    if (pLen > 0) {
                        Ext.each(emptyFolders, function (folder) {
                            for (var i = 0; i < pLen; i++) {
                                if (addedPaths[i].length > folder.length &&
                                    addedPaths[i].indexOf(folder.toLowerCase()) == 0) {
                                    return;
                                }
                            }
                            uploadInfo.folders.push(folder);
                        });
                    }
                    if (uploadInfo.gdocs.length > 0 || uploadInfo.folders.length > 0) {
                        self.uploadGoogleDocs(uploadInfo);
                    } else {
                        self.buttons[0].setDisabled(true);
                        showError(String.format(config.htcConfig.locData.CloudUploadSelectItemsMessage, ''), true);
                    }
                }
            }
        ],
        bindAuthOnLink: function () {
            var authLink = document.getElementById(config.getUid() + "_authGoogleUp_link");
            if (authLink) {
                authLink.onclick = function () {
                    self.prepare();
                    return false;
                };
            }
        },
        getRootFolders: function (rootInfo) {
            if (googleDocsItemsTree) {
                var rootNode = googleDocsItemsTree.getRootNode();
                if (rootNode) {
                    self.clearRootNode();
                    config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudLoadMsg, cn) + '...';
                    config.globalLoadMask.show();
                    rootNode.expanded = false;
                    rootNode.id = (rootInfo || {}).id;
                    rootNode.expand(false, true);
                    return;
                }
            }
        },
        prepare: function (hidden) {
            config.getGoogleDriveAuth().checkAuth(hidden === true, true, function (result, error) {
                if (result && Ext.isArray(result)) {
                    self.switchView(true);
                    self.getRootFolders();
                } else {
                    self.switchView(false);
                    if (error) {
                        config.Msg.show({
                            title: config.htcConfig.locData.CommonErrorCaption,
                            msg: error,
                            icon: config.Msg.ERROR,
                            buttons: config.Msg.OK
                        });
                    }
                }
            });
        },
        clearRootNode: function () {
            if (googleDocsItemsTree) {
                var rootNode = googleDocsItemsTree.getRootNode();
                if (rootNode) {
                    self.buttons[0].setDisabled(true);
                    rootNode.removeAll();
                    rootNode.checked = false;
                    var ui = rootNode.getUI();
                    if (ui && ui.toggleCheck) {
                        ui.toggleCheck(false);
                    }
                    rootNode.loaded = false;
                    config.getUploadWindow().syncSize();
                }
            }
        },
        googleExportDefaultFormats:
        [
            '', // none (0)
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // for documents (1)
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // for tables (2)
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // for presentations (3)
            '', // for pdf (4) (none)
            'image/jpeg' // for images (5)
        ],
        googleExportFormats: { // see https://developers.google.com/drive/manage-downloads#downloading_google_documents
            'text/html': { title: 'HTML', ext: 'html' },
            'text/plain': { title: 'Plain text', ext: 'txt' },
            'application/rtf': { title: 'Rich text', ext: 'rtf' },
            'application/vnd.oasis.opendocument.text': { title: 'Open Office document', ext: 'odt' },
            'application/pdf': { title: 'PDF', ext: 'pdf' },
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { title: 'MS Word document', ext: 'docx' },
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { title: 'MS Excel', ext: 'xlsx' },
            'application/x-vnd.oasis.opendocument.spreadsheet': { title: 'Open Office sheet', ext: 'ods' },
            'image/jpeg': { title: 'JPEG', ext: 'jpeg' },
            'image/png': { title: 'PNG', ext: 'png' },
            'image/svg+xml': { title: 'SVG', ext: 'svg' },
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': { title: 'MS PowerPoint', ext: 'pptx' }
        },
        showSelectExportFormats: function (gtype, nodeId, frmt, title) {
            if (gtype < 1 || !frmt || gtype == 4) {
                return;
            }
            var rb,
                node,
                radioItems = [],
                expLinks;
            if (googleDocsItemsTree) {
                node = googleDocsItemsTree.getNodeById(nodeId);
            }
            if (!node) {
                return;
            }
            expLinks = node.attributes.exportLinks;
            for (format in expLinks) {
                if (expLinks.hasOwnProperty(format) && self.googleExportFormats.hasOwnProperty(format)) {
                    radioItems.push({
                        checked: frmt == format,
                        name: 'rb-formats',
                        inputValue: format,
                        boxLabel: self.googleExportFormats[format].title
                    });
                }
            }
            if (radioItems.length == 0) {
                return;
            }
            var sefw = new Ext.Window({
                modal: true,
                plain: true,
                layout: 'fit',
                gtype: gtype,
                nodeId: nodeId,
                autoHeight: true,
                buttonAlign: 'center',
                resizable: false,
                width: 200,
                title: String.format(config.htcConfig.locData.GoogleDocsSaveAsTitle,
                    Ext.util.Format.htmlEncode(title)),
                items:
                [
                    rb = new Ext.form.RadioGroup({
                        columns: 1,
                        items: radioItems,
                        style: {
                            marginLeft: '7px'
                        }
                    })
                ],
                buttons:
                [
                    {
                        text: config.htcConfig.locData.CommonButtonCaptionOK,
                        handler: function () {
                            if (googleDocsItemsTree) {
                                var node = googleDocsItemsTree.getNodeById(nodeId);
                                if (node) {
                                    node.attributes.exports = rb.getValue().inputValue;
                                    var expTitle = self.googleExportFormats[node.attributes.exports].title;
                                    var linkHTML = '<a href="#" style="text-decoration:underline;" onclick="HttpCommander.Main.FileManagers['
                                        + "'" + config.getUid() + "'" + '].showSelectExportFormats(' + gtype
                                            + ",'" + node.id + "','" + node.attributes.exports + "','"
                                                + Ext.util.Format.htmlEncode(node.attributes.title) + "'" + ')">' + expTitle + '</a>';
                                    node.text = node.attributes.text = Ext.util.Format.htmlEncode(node.attributes.title)
                                        + ' (' + config.htcConfig.locData.GoogleDocsSaveAs + ' ' + linkHTML + ')';
                                    if (node.rendered) {
                                        var nodeUI = node.getUI();
                                        var links = nodeUI.elNode.getElementsByTagName('a');
                                        if (links && links.length > 1) {
                                            var link = links[1];
                                            link.outerHTML = linkHTML;
                                        }
                                    }
                                }
                            }
                            sefw.close();
                        }
                    },
                    {
                        text: config.htcConfig.locData.CommonButtonCaptionCancel,
                        handler: function () { sefw.close(); }
                    }
                ]
            });
            sefw.show();
            sefw.syncSize();
        },
        switchView: function (status) {
            self.items.items[0].setVisible(!status);
            if (!status) {
                self.bindAuthOnLink();
            }
            self.items.items[1].setVisible(status);
            self.items.items[2].setVisible(status);
            self.items.items[3].setVisible(status);
            self.buttons[0].setVisible(status);
            if (!status) {
                config.getGoogleDriveAuth().clearAuth();
                self.clearRootNode();
            }
        },
        uploadGoogleDocs: function (uploadInfo) {
            var oldAT = Ext.Ajax.timeout;
            Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
            config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudUploadProgressMessage, cn) + '...';
            config.globalLoadMask.show();
            HttpCommander.GoogleDrive.UploadDocs(uploadInfo, function (data, trans) {
                Ext.Ajax.timeout = oldAT;
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                        data, trans, config.Msg, config.htcConfig, 0, function () {
                            if (data.needAuth === true) self.switchView(false); })) {
                    if (googleDocsItemsTree && googleDocsItemsTree.getRootNode()) {
                        HttpCommander.Lib.Utils.recursiveCheckTreeChildNodesWithoutExpand(googleDocsItemsTree.getRootNode(), false);
                        self.buttons[0].setDisabled(true);
                    }
                    config.openTreeRecent();
                    config.openGridFolder(uploadInfo.path, true, true);
                    var balloonText = String.format(
                        config.htcConfig.locData.BalloonFilesUploaded,
                        data.filesSaved
                    );
                    if (data.filesRejected > 0) {
                        balloonText += '<br />' + String.format(
                            config.htcConfig.locData.BalloonFilesNotUploaded,
                            data.filesRejected
                        );
                    }
                    if (data.errors && data.errors != '') {
                        balloonText += '<br />' + data.errors;
                    }
                    config.showBalloon(balloonText);
                }
            });
        },
        checkChangeGoogleDocsUploadList: function (node, checked) {
            if (googleDocsItemsTree) {
                googleDocsItemsTree.un('checkchange', self.checkChangeGoogleDocsUploadList);
                HttpCommander.Lib.Utils.recursiveCheckTreeChildNodes(node, checked);
                HttpCommander.Lib.Utils.recursiveCheckTreeParentNodes(node, checked);
                googleDocsItemsTree.on('checkchange', self.checkChangeGoogleDocsUploadList);
                self.buttons[0].setDisabled(googleDocsItemsTree.getChecked().length == 0);
            }
        },
        getGoogleDocsTree: function () {
            return googleDocsItemsTree;
        }
    });

    this.googleExportFormats = self.googleExportFormats;

    return self;
};
