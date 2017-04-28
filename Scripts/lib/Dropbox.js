Ext.ns('HttpCommander.Lib');

/**
 *  Dropbox Tree Loader (extend Ext.tree.TreeLoader)
 */
HttpCommander.Lib.DropboxTreeLoader = Ext.extend(Ext.tree.TreeLoader, {
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
    requestData: function (node, callback, scope) {
        if (this.fireEvent("beforeload", this, node, callback) !== false) {
            if (this.api) {
                var sc = this,
                    argument = {
                        'callback': callback,
                        'node': node,
                        'scope': scope
                    },
                    onlyFldr = sc.onlyFolders;
                sc.api.getFileList(function (list, error, immediate) {
                    if (list && Ext.isArray(list)) {
                        var childs = [];
                        Ext.each(list, function (item, index, allItems) {
                            if (item && (!onlyFldr || (onlyFldr && item['.tag'] == 'folder'))) {
                                childs.push(Ext.copyTo({
                                    'title': item.name,
                                    'leaf': item['.tag'] != 'folder',
                                    'file': item['.tag'] != 'folder',
                                    'path': item['path_lower'],
                                    'checked': false,
                                    'entryId': item.id
                                }, item, 'name size'));
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
                    ? node.attributes.path : '');
            }
        } else {
            this.runCallback(callback, scope || node, []);
        }
    }
});

/**
 *  config: htcConfig, getUid(), getUploadWindow(),
 *  globalLoadMask, getRenderers(), getCurrentFolder(), Msg,
 *  openGridFolder(), showBalloon(), getDropboxAuth(), isDemoMode(), openTreeRecent()
 */
HttpCommander.Lib.UploadFromDropbox = function (config) {
    var cn = HttpCommander.Lib.Consts.CloudNames.dropbox,
        dropboxUploadPanel,
        dropboxIgnorePathsCheckbox,
        dropboxUploadTreeLoader,
        dropboxItemsTree,
        dropboxBBarLabel;

    var showError = function (msg, encode) {
        config.Msg.show({
            title: config.htcConfig.locData.CommonErrorCaption,
            msg: encode ? Ext.util.Format.htmlEncode(msg) : msg,
            icon: config.Msg.ERROR,
            buttons: config.Msg.CANCEL
        });
    };

    var self = new Ext.FormPanel({
        frame: false,
        bodyStyle: 'padding: 5px 5px 0px 5px;',
        border: false,
        bodyBorder: false,
        header: false,
        buttonAlign: 'center',
        layout: 'fit',
        items: [{
            xtype: 'label',
            autoHeight: true,
            html: String.format(config.htcConfig.locData.CloudAuthenticateMessage,
                    cn,
                    String.format(config.htcConfig.locData.CloudAuthenticateLink, cn),
                    '<img alt="" align="absmiddle" width="16" height="16" src="'
                    + HttpCommander.Lib.Utils.getIconPath(config, 'dropbox') + '"/>&nbsp;'
                    + HttpCommander.Lib.Utils.getHelpLinkOpenTag(config.getUid(), 'dropbox'),
                    '</a>')
                + '<br /><br /><div style="text-align:center;width:100%;">'
                + '<img alt="" align="absmiddle" width="16" height="16" src="'
                + HttpCommander.Lib.Utils.getIconPath(config, 'dropbox') + '">&nbsp;<a href="#"'
                + (" id='" + config.getUid() + "_authDropboxUp_link'")
                + ' target="_blank">'
                + String.format(config.htcConfig.locData.CloudAuthenticateLink, cn) + '</a>'
                + (config.isDemoMode() && !Ext.isEmpty(window.DropboxDemoName) && !Ext.isEmpty(window.DropboxDemoPass)
                        ? ('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="' + window.DropboxDemoName + '" />&nbsp;'
                                + '<input readonly onclick="this.select();" type="text" value="' + window.DropboxDemoPass + '" /></span>')
                        : '')
                + "</div>",
            listeners: {
                afterrender: function (wind) {
                    self.bindAuthLink();
                }
            }
        }, dropboxUploadPanel = new Ext.Panel({
            layout: 'fit',
            hidden: true,
            border: false,
            items: [{
                xtype: 'label',
                html: String.format(config.htcConfig.locData.CloudUploadSelectItemsMessage, cn)
            }, dropboxIgnorePathsCheckbox = new Ext.form.Checkbox({
                boxLabel: config.htcConfig.locData.UploadJavaIgnorePaths,
                listeners: {
                    check: function (cb, checked) {
                        if (!!dropboxItemsTree) {
                            var checkedNodes = dropboxItemsTree.getChecked();
                            self.buttons[0].setDisabled(checkedNodes == 0);
                        }
                    }
                }
            }), dropboxItemsTree = new Ext.tree.TreePanel({
                root: {
                    text: String.format(config.htcConfig.locData.CloudRootFolderName, cn),
                    expaded: false,
                    checked: false
                },
                useArrows: true,
                autoScroll: true,
                header: false,
                lines: false,
                loader: new HttpCommander.Lib.DropboxTreeLoader({
                    api: config.getDropboxAuth(),
                    onlyFolders: false,
                    listeners: {
                        beforeload: function (treeLoader, node) {
                            
                        },
                        load: function (treeLoader, node, response) {
                            config.globalLoadMask.hide();
                            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                            self.changeDropboxUploadInfoFiles();
                        },
                        loadexception: function (treeLoader, node, response) {
                            config.globalLoadMask.hide();
                            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...'; var s401 = false;
                            var msg = !!response
                                ? ((s401 = Ext.isObject(response.error)) ? response.error.msg : response.error)
                                : null;
                            if (s401) {
                                self.clearAuthInfo();
                            }
                            if (Ext.isEmpty(msg) && !s401) {
                                msg = config.htcConfig.locData.CommonLoadError;
                            }
                            if (!Ext.isEmpty(msg)) {
                                showError(msg);
                            }
                        }
                    }
                }),
                bbar: new Ext.Toolbar({
                    items: [dropboxBBarLabel = new Ext.form.Label({
                        html: String.format(config.htcConfig.locData.CloudUploadTotalFiles, '0', '0 bytes')
                    })]
                }),
                tbar: new Ext.Toolbar({
                    enableOverflow: true,
                    items:[{
                        icon: HttpCommander.Lib.Utils.getIconPath(config, 'gdrefresh'),
                        text: config.htcConfig.locData.CommandRefresh,
                        handler: function () {
                            self.prepare(false);
                        }
                    }, '-', {
                        icon: HttpCommander.Lib.Utils.getIconPath(config, 'dropbox'),
                        text: cn,
                        tooltip: '<b><img alt="" align="absmiddle" width="16" height="16" src="'
                            + HttpCommander.Lib.Utils.getIconPath(config, 'dropbox') + '">&nbsp;'
                            + String.format(config.htcConfig.locData.CloudLinkText, cn) + '</b><br/>'
                            + String.format(config.htcConfig.locData.CloudLinkDescription, cn),
                        handler: function () {
                            window.open('https://www.dropbox.com/');
                        }
                    }, '->', {
                        text: String.format(config.htcConfig.locData.CloudSignInAsDifferentUserText, cn),
                        handler: function () {
                            config.globalLoadMask.msg = config.htcConfig.locData.CloudRevokeTokenMsg + "...";
                            config.globalLoadMask.show();
                            var dbAuth = config.getDropboxAuth();
                            if (dbAuth) {
                                dbAuth.signOut(function () {
                                    config.globalLoadMask.hide();
                                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                                    self.changeViewDropboxFp(true);
                                });
                            } else {
                                config.globalLoadMask.hide();
                                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                                self.changeViewDropboxFp(true);
                            }
                        }
                    }]
                }),
                listeners: {
                    load: function (node) {
                        Ext.each(node.childNodes, function (el) {
                            if (el.attributes.file && el.attributes.size != 'undefined') {
                                el.text = el.attributes.text = Ext.util.Format.htmlEncode(el.attributes.title) + ' ('
                                    + config.getRenderers().sizeRenderer(el.attributes.size)
                                    + ')';
                            } else {
                                el.text = el.attributes.text = Ext.util.Format.htmlEncode(el.attributes.title);
                            }
                            if (el.attributes.file) {
                                el.attributes.icon = HttpCommander.Lib.Utils.getIconPath(config, 'none');
                            }
                        });
                    },
                    render: function (tr) {
                        tr.on('checkchange', self.checkChangeDropboxUploadList);
                    }
                }
            })]
        })],
        buttons: [{
            hidden: true,
            disabled: true,
            text: config.htcConfig.locData.UploadSimpleUpload,
            handler: function () {
                var curFolder = config.getCurrentFolder();
                if (!curFolder) {
                    config.Msg.alert(config.htcConfig.locData.UploadFolderNotSelectedTitle,
                        config.htcConfig.locData.UploadFolderNotSelected);
                    return;
                }
                if (!config.htcConfig.currentPerms || !config.htcConfig.currentPerms.upload) {
                    config.Msg.alert(config.htcConfig.locData.UploadNotAllowedTitle,
                        config.htcConfig.locData.UploadNotAllowedPrompt);
                    return;
                }
                var checkedNodes = dropboxItemsTree.getChecked();
                if (checkedNodes.length == 0) {
                    self.buttons[0].setDisabled(true);
                    showError(String.format(config.htcConfig.locData.CloudUploadSelectItemsMessage, ''), true);
                    return;
                }
                var uploadInfo = {
                    path: curFolder,
                    ignorePaths: dropboxIgnorePathsCheckbox.getValue(),
                    files: [],
                    folders: []
                };
                var addedPaths = [];
                var emptyFolders = [];
                Ext.each(checkedNodes, function (node) {
                    if (node.attributes.file) {
                        uploadInfo.files.push({
                            name: node.attributes.title,
                            url: node.attributes.path
                        });
                        if (!uploadInfo.ignorePaths) {
                            addedPaths.push(node.attributes.path.toLowerCase());
                        }
                    } else if (!uploadInfo.ignorePaths) {
                        emptyFolders.push({
                            name: node.attributes.title,
                            url: node.attributes.path
                        });
                        addedPaths.push(node.attributes.path.toLowerCase());
                    }
                });
                var pLen = addedPaths.length;
                if (pLen > 0) {
                    Ext.each(emptyFolders, function (folder) {
                        for (var i = 0; i < pLen; i++) {
                            if (addedPaths[i].length > folder.url.length &&
                                addedPaths[i].indexOf(folder.url.toLowerCase()) == 0) {
                                return;
                            }
                        }
                        uploadInfo.folders.push(folder);
                    });
                }
                if (uploadInfo.files.length == 0 && uploadInfo.folders.length == 0) {
                    self.buttons[0].setDisabled(true);
                    showError(String.format(config.htcConfig.locData.CloudUploadSelectItemsMessage, ''), true);
                    return;
                }

                var dbAuth = config.getDropboxAuth();
                var dbTokenInfo = dbAuth ? dbAuth.getAuthInfo() : null;
                uploadInfo.token = dbTokenInfo ? dbTokenInfo.token : null;

                var oldTA = Ext.Ajax.timeout;
                Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
                config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudUploadProgressMessage, cn) + '...';
                config.globalLoadMask.show();
                HttpCommander.Dropbox.Upload(uploadInfo, function (data, trans) {
                    Ext.Ajax.timeout = oldTA;
                    config.globalLoadMask.hide();
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                    if (typeof data == 'undefined') {
                        showError(Ext.util.Format.htmlEncode(trans.message));
                        return;
                    }
                    if (!data.success) {
                        if (!data.connect) {
                            self.clearAuthInfo();
                        }
                        showError(data.message);
                        return;
                    }
                    if (dropboxItemsTree && dropboxItemsTree.getRootNode()) {
                        HttpCommander.Lib.Utils.recursiveCheckTreeChildNodesWithoutExpand(dropboxItemsTree.getRootNode(), false);
                        self.buttons[0].setDisabled(true);
                        self.changeDropboxUploadInfoFiles();
                    }
                    config.openTreeRecent();
                    config.openGridFolder(uploadInfo.path, true, true);
                    if (data.filesSaved && data.filesSaved > 0) {
                        var balloonText = String.format(config.htcConfig.locData.BalloonFilesUploaded,
                            data.filesSaved);
                        if (data.filesRejected > 0) {
                            balloonText += '<br />'
                                + String.format(config.htcConfig.locData.BalloonFilesNotUploaded,
                                    data.filesRejected);
                        }
                        if (data.message && data.message != '') {
                            balloonText += '<br />' + data.message;
                        }
                        config.showBalloon(balloonText);
                    }
                });
            }
        }],

        'prepare': function (interactive) {
            var dbAuth = config.getDropboxAuth();
            if (dbAuth) {
                dbAuth.checkAuth(true, function (result, error) {
                    if (result && result.length > 0 && typeof result[0] != 'undefined') {
                        self.changeViewDropboxFp(false);
                        self.getRootFolders();
                    } else {
                        self.changeViewDropboxFp(true);
                        if (error) {
                            showError(error);
                        }
                    }
                }, interactive);
            }
        },
        'bindAuthLink': function () {
            var authLink = document.getElementById(config.getUid() + "_authDropboxUp_link");
            if (authLink) {
                authLink.onclick = function () {
                    self.prepare(true);
                    return false;
                };
            }
        },
        'getDropboxUploadPanel': function () {
            return dropboxUploadPanel;
        },
        'getDropboxItemsTree': function () {
            return dropboxItemsTree;
        },
        'getRootFolders': function () {
            if (dropboxItemsTree) {
                var rootNode = dropboxItemsTree.getRootNode();
                if (rootNode) {
                    self.clearRootNode();
                    config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudLoadMsg, cn) + '...';
                    config.globalLoadMask.show();
                    rootNode.expanded = false;
                    rootNode.attributes.path = '';
                    rootNode.expand(false, true);
                }
            }
        },
        'clearRootNode': function () {
            if (dropboxItemsTree) {
                var rootNode = dropboxItemsTree.getRootNode();
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
                self.changeDropboxUploadInfoFiles();
            }
        },
        'changeViewDropboxFp': function (status) {
            self.items.items[0].setVisible(status);
            self.items.items[1].setVisible(!status);
            self.buttons[0].setVisible(!status);
            if (status && config.getDropboxAuth()) {
                config.getDropboxAuth().clearAuth();
            }
        },
        'changeDropboxUploadInfoFiles': function () {
            if (dropboxBBarLabel) {
                var count = 0,
                    size = 0;
                if (dropboxItemsTree) {
                    var checkedNodes = dropboxItemsTree.getChecked();
                    Ext.each(checkedNodes, function (node) {
                        if (node.attributes.file) {
                            count++;
                            size += parseInt(node.attributes.size);
                        }
                    });
                }
                dropboxBBarLabel.setText(String.format(config.htcConfig.locData.CloudUploadTotalFiles,
                    count, config.getRenderers().sizeRenderer(String(size))), true);
            }
        },
        'checkChangeDropboxUploadList': function (node, checked) {
            if (dropboxItemsTree) {
                dropboxItemsTree.un('checkchange', self.checkChangeDropboxUploadList);
                HttpCommander.Lib.Utils.recursiveCheckTreeChildNodes(node, checked);
                HttpCommander.Lib.Utils.recursiveCheckTreeParentNodes(node, checked);
                dropboxItemsTree.on('checkchange', self.checkChangeDropboxUploadList);
                self.changeDropboxUploadInfoFiles();
                self.buttons[0].setDisabled(dropboxItemsTree.getChecked().length == 0);
            }
        },
        'clearAuthInfo': function () {
            if (config.getDropboxAuth()) {
                config.getDropboxAuth().clearAuth();
            }
            self.changeViewDropboxFp(true);
            config.getUploadWindow().syncSize();
        }
    });

    return self;
};

/**
 *  config:
 *  htcConfig, Msg, Window, getUid(), getDropboxAuth(),
 *  globalLoadMask, getCurrentSelectedSet(), isDemoMode()
 */
HttpCommander.Lib.DownloadToDropboxWindow = function (config) {
    var self, cn = HttpCommander.Lib.Consts.CloudNames.dropbox,
        dropboxFoldersLabel, dropboxFoldersPanel, dropboxFoldersTree;

    var showError = function (msg, encode) {
        config.Msg.show({
            title: config.htcConfig.locData.CommonErrorCaption,
            msg: encode ? Ext.util.Format.htmlEncode(msg) : msg,
            icon: config.Msg.ERROR,
            buttons: config.Msg.CANCEL
        });
    };

    self = new config.Window({
        title: config.htcConfig.locData.CommandDownloadToDropbox,
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
        items: [{
            xtype: 'label',
            hideLabel: true,
            autoHeight: true,
            margins: '0 0 5 0',
            html: String.format
                (
                    config.htcConfig.locData.CloudAuthenticateMessage,
                    cn,
                    String.format(config.htcConfig.locData.CloudAuthenticateLink, cn),
                    "<img align='absmiddle' width='16' height='16' src='"
                    + HttpCommander.Lib.Utils.getIconPath(config, 'dropbox') + "'/>&nbsp;"
                    + HttpCommander.Lib.Utils.getHelpLinkOpenTag(config.getUid(), "dropbox"),
                    "</a>"
                )
                + "<br /><br /><br /><div style='text-align:center;width:100%;'>"
                + "<img align='absmiddle' width='16' height='16' src='"
                + HttpCommander.Lib.Utils.getIconPath(config, 'dropbox') + "'>&nbsp;"
                + "<a id='" + config.getUid() + "_authDropboxDown_link' href='#' target='_self'>"
                + String.format(config.htcConfig.locData.CloudAuthenticateLink, cn) + "</a>"
                + (config.isDemoMode() && !Ext.isEmpty(window.DropboxDemoName) && !Ext.isEmpty(window.DropboxDemoPass)
                        ? ('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="' + window.DropboxDemoName + '" />&nbsp;'
                                + '<input readonly onclick="this.select();" type="text" value="' + window.DropboxDemoPass + '" /></span>')
                        : '')
                + "</div>",
            listeners: {
                afterrender: function (lbl) {
                    self.bindAuthLink(self);
                }
            }
        }, dropboxFoldersLabel = new Ext.form.Label({
            html: String.format(config.htcConfig.locData.CloudCheckFolerMessage, cn),
            hidden: true
        }), dropboxFoldersPanel = new Ext.Panel({
            layout: 'fit',
            height: 230,
            hidden: true,
            anchor: '100%',
            tbar: new Ext.Toolbar({
                enableOverflow: true,
                items: [{
                    icon: HttpCommander.Lib.Utils.getIconPath(config, 'gdrefresh'),
                    text: config.htcConfig.locData.CommandRefresh,
                    handler: function () {
                        if (config.getDropboxAuth())
                            config.getDropboxAuth().clearAuth();
                        self.prepare(true);
                    }
                }, '-', {
                    icon: HttpCommander.Lib.Utils.getIconPath(config, 'dropbox'),
                    text: cn,
                    tooltip: '<b><img align="absmiddle" width="16" height="16" src="'
                        + HttpCommander.Lib.Utils.getIconPath(config, 'dropbox') + '">&nbsp;'
                        + String.format(config.htcConfig.locData.CloudLinkText, cn) + '</b><br/>'
                        + String.format(config.htcConfig.locData.CloudLinkDescription, cn),
                    scope: this,
                    handler: function () {
                        window.open('https://www.dropbox.com/');
                    }
                }, '->', {
                    text: String.format(config.htcConfig.locData.CloudSignInAsDifferentUserText, cn),
                    handler: function () {
                        config.globalLoadMask.msg = config.htcConfig.locData.CloudRevokeTokenMsg + "...";
                        config.globalLoadMask.show();
                        if (config.getDropboxAuth()) {
                            config.getDropboxAuth().signOut(function () {
                                self.switchView(false);
                                config.globalLoadMask.hide();
                                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                            });
                        } else {
                            self.switchView(false);
                            config.globalLoadMask.hide();
                            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                        }
                    }
                }]
            }),
            items: [dropboxFoldersTree = new Ext.tree.TreePanel({
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
                loader: new HttpCommander.Lib.DropboxTreeLoader({
                    onlyFolders: true,
                    api: config.getDropboxAuth(),
                    listeners: {
                        beforeload: function (treeLoader, node) {
                            
                        },
                        load: function (treeLoader, node, response) {
                            config.globalLoadMask.hide();
                            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                        },
                        loadexception: function (treeLoader, node, response) {
                            config.globalLoadMask.hide();
                            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                            var s401 = false;
                            var msg = !!response
                                ? ((s401 = Ext.isObject(response.error)) ? response.error.msg : response.error)
                                : null;
                            if (s401) {
                                self.switchView(false);
                            }
                            if (Ext.isEmpty(msg) && !s401) {
                                msg = config.htcConfig.locData.CommonLoadError;
                            }
                            if (!Ext.isEmpty(msg)) {
                                showError(msg);
                            }
                        }
                    }
                }),
                listeners: {
                    load: function (node) {
                        if (node.isRoot || !node.parentNode) {
                            var ui = node.getUI ? node.getUI() : null;
                            if (ui && ui.toggleCheck) {
                                ui.toggleCheck(true);
                            } else {
                                node.checked = true;
                            }
                        }
                        Ext.each(node.childNodes, function (el) {
                            el.text = el.attributes.text = Ext.util.Format.htmlEncode(el.attributes.title);
                        });
                    },
                    click: function (node) {
                        var nodeui = node ? node.getUI() : null;
                        if (nodeui) {
                            nodeui.toggleCheck();
                        }
                    },
                    render: function (tr) {
                        tr.on('checkchange', self.checkChangeDropboxFolders);
                    }
                }
            })]
        })],
        buttons: [{
            text: config.htcConfig.locData.CommonButtonCaptionContinue,
            hidden: true,
            disabled: true,
            handler: function () {
                if (!config.htcConfig.enableDownloadToDropbox) {
                    return;
                }
                var node;
                if (dropboxFoldersTree) {
                    var checkedNodes = dropboxFoldersTree.getChecked();
                    if (checkedNodes && checkedNodes.length > 0 && checkedNodes[0]) {
                        node = checkedNodes[0];
                    }
                }
                if (!node) {
                    self.buttons[0].setDisabled(true);
                    return;
                }
                self.downloadToDropbox(node);
            }
        }, {
            text: config.htcConfig.locData.CommonButtonCaptionClose,
            handler: function () {
                self.hide();
            }
        }],
        listeners: {
            afterrender: function (wind) {
                wind.bindAuthLink(wind);
            },
            resize: function (win, width, height) {
                if (dropboxFoldersPanel && dropboxFoldersPanel.rendered
                        && !dropboxFoldersPanel.hidden && dropboxFoldersPanel.getTopToolbar) {
                    var pt = dropboxFoldersPanel.getTopToolbar();
                    if (pt.rendered && !pt.hidden) {
                        dropboxFoldersPanel.setWidth(width - 24);
                    }
                    dropboxFoldersPanel.setHeight(win.body.getHeight() - dropboxFoldersLabel.getHeight() - 10);
                }
            }
        },

        'bindAuthLink': function (wind) {
            var authLink = document.getElementById(config.getUid() + "_authDropboxDown_link");
            if (authLink) {
                authLink.onclick = function () {
                    self.prepare(true);
                    return false;
                };
            }
        },
        'clearRootNode': function () {
            if (dropboxFoldersTree) {
                var rootNode = dropboxFoldersTree.getRootNode();
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
        'switchView': function (enabled) {
            if (dropboxFoldersLabel)
                dropboxFoldersLabel.setVisible(enabled);
            if (dropboxFoldersTree)
                dropboxFoldersTree.setVisible(enabled);
            if (dropboxFoldersPanel)
                dropboxFoldersPanel.setVisible(enabled);

            self.items.items[0].setVisible(!enabled);
            self.buttons[0].setVisible(enabled);

            if (!enabled) {
                if (config.getDropboxAuth())
                    config.getDropboxAuth().clearAuth();
                self.clearRootNode();
            }

            self.show();
            self.syncSize();
        },
        'prepare': function (interactive) {
            if (config.getDropboxAuth()) {
                config.getDropboxAuth().checkAuth(false, function (result, error) {
                    config.Msg.hide();
                    config.globalLoadMask.hide();
                    if (result && result.length > 0 && typeof result[0] != 'undefined') {
                        self.switchView(true);
                        self.getRootFolders();
                    } else {
                        self.switchView(false);
                        if (error) {
                            showError(error);
                        }
                    }
                }, interactive);
            }
        },
        'checkChangeDropboxFolders': function (node, checked) {
            if (dropboxFoldersTree) {
                dropboxFoldersTree.un('checkchange', self.checkChangeDropboxFolders);
                if (checked) {
                    Ext.each(dropboxFoldersTree.getChecked(), function (n) {
                        if (n && n != node && n.id != node.id && n.attributes.checked) {
                            n.getUI().toggleCheck(false);
                            n.attributes.checked = false;
                        }
                    });
                }
                dropboxFoldersTree.on('checkchange', self.checkChangeDropboxFolders);
                self.buttons[0].setDisabled(dropboxFoldersTree.getChecked().length == 0);
            }
        },
        'getRootFolders': function (rootInfo) {
            if (dropboxFoldersTree) {
                var rootNode = dropboxFoldersTree.getRootNode();
                if (rootNode) {
                    self.clearRootNode();
                    config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudLoadMsg, cn) + '...';
                    config.globalLoadMask.show();
                    rootNode.expanded = false;
                    rootNode.attributes.path = '';
                    rootNode.expand(false, true);
                }
            }
        },
        'downloadToDropbox': function (node) {
            var dropboxFolderInfo = node && node.attributes
                ? node.attributes : { text: '', path: '' };
            var dbAuth = config.getDropboxAuth(),
                token = dbAuth && dbAuth.getAuthInfo() ? dbAuth.getAuthInfo().token : null;
            if (Ext.isEmpty(token)) {
                self.switchView(false);
                return;
            }
            var upInfo = {
                'token': token,
                'selections': config.getCurrentSelectedSet(),
                'dropboxFolder': dropboxFolderInfo.path
            };
            if (upInfo.selections.files.length == 0 && upInfo.selections.folders.length == 0)
                return;

            var oldAT = Ext.Ajax.timeout;
            Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
            config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudDownloadingMessage, cn) + "...";
            config.globalLoadMask.show();
            HttpCommander.Dropbox.Download(upInfo, function (data, trans) {
                Ext.Ajax.timeout = oldAT;
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";

                if (typeof data == 'undefined') {
                    showError(Ext.util.Format.htmlEncode(trans
                        ? (trans.message || config.htcConfig.locData.UploadFromUrlUnknownResponse)
                        : config.htcConfig.locData.UploadFromUrlUnknownResponse));
                    return;
                }

                if (!data.connect) {
                    if (dbAuth)
                        dbAuth.clearAuth();
                    self.switchView(false);
                    if (!Ext.isEmpty(data.message)) {
                        showError(data.message);
                    } else if (!Ext.isEmpty(data.errors)) {
                        showError(data.errors);
                    }
                    return;
                }

                if (!data.success) {
                    showError(data.message || data.errors || config.htcConfig.locData.UploadFromUrlUnknownResponse);
                    return;
                }

                var dfn = dropboxFolderInfo.text;
                var message = data.downloaded > 0 && data.foldersCreated < 1
                    ? String.format(config.htcConfig.locData.CloudDownloadFilesSuccessMessage, data.downloaded, dfn, cn)
                    : data.foldersCreated > 1 && data.downloaded < 0
                        ? String.format(config.htcConfig.locData.CloudFoldersCreatedSuccessMessage, data.foldersCreated, dfn, cn)
                        : String.format(config.htcConfig.locData.CloudFilesFoldersSuccessMessage, data.downloaded, data.foldersCreated, dfn, cn);

                if (data.rejected > 0 || data.foldersRejected > 0) {
                    message += '<br />' +
                        (data.rejected > 0 && data.foldersRejected < 1
                            ? String.format(config.htcConfig.locData.CloudNotDownloadedFilesMessage, data.rejected)
                            : data.foldersRejected > 0 && data.rejected < 1
                                ? String.format(config.htcConfig.locData.CloudNotFoldersCreatedMessage, data.foldersRejected)
                                : String.format(config.htcConfig.locData.CloudNotFilesFoldersDownloadedMessage, data.rejected, data.foldersRejected)
                        );
                }

                var withoutErrors = true;
                if (data.errors && data.errors != '') {
                    message += '<div style="width:100%;min-width:200px !important;overflow:auto;height:auto;max-height:75px;display:inline-block;">'
                        + data.errors + '</div>';
                    withoutErrors = false;
                }

                if (typeof data.newNames != 'undefined' && data.newNames != '') {
                    message += (message != '' ? '<br />' : '') + config.htcConfig.locData.CloudDownloadWithNewNames
                        + '<div style="width:100%;min-width:200px !important;overflow:auto;height:auto;max-height:75px;display:inline-block;">'
                            + data.newNames + '</div>';
                }

                config.Msg.show({
                    title: config.htcConfig.locData.CloudDownloadEndMessageTitle,
                    msg: message + "<br /><br />"
                        + "<img align='absmiddle' width='16' height='16' src='"
                        + HttpCommander.Lib.Utils.getIconPath(config, 'dropbox') + "'>&nbsp;<a href='https://www.dropbox.com/' target='_blank'>"
                        + String.format(config.htcConfig.locData.CloudLinkText, cn) + "</a>",
                    closable: false,
                    modal: true,
                    buttons: config.Msg.OK,
                    icon: config.Msg.INFO,
                    fn: function (btn) {
                        if (btn == 'ok' && data.foldersCreated > 0 && node) {
                            node.expanded = false;
                            node.loaded = false;
                            node.expand(false, true);
                        }
                    }
                });
            });
        }
    });

    return self;
};
