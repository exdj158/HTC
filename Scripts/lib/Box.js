Ext.ns('HttpCommander.Lib');

/**
 *  Box Tree Loader (extend Ext.tree.TreeLoader)
 */
HttpCommander.Lib.BoxTreeLoader = Ext.extend(Ext.tree.TreeLoader, {
    processDirectResponse: function (result, response, args) {
        if (response.status) {
            this.handleResponse({
                responseData: Ext.isArray(result) ? result : (Ext.isArray(result.data) ? result.data : null),
                responseText: result,
                argument: args
            });
        } else {
            this.handleFailure({
                argument: args
            });
        }
    }
});

/**
 *  config: htcConfig, getUid(), getUploadWindow(),
 *  globalLoadMask, getRenderers(), getCurrentFolder(),
 *  Msg, openGridFolder(), showBalloon(), getBoxAuth(),
 *  isDemoMode(), openTreeRecent()
 */
HttpCommander.Lib.UploadFromBox = function (config) {
    var cn = HttpCommander.Lib.Consts.CloudNames.box, 
        boxUploadPanel,
        boxIgnorePathsCheckbox,
        boxUploadTreeLoader,
        boxItemsTree,
        boxBBarLabel;

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
                    + HttpCommander.Lib.Utils.getIconPath(config, 'box') + '"/>&nbsp;'
                    + HttpCommander.Lib.Utils.getHelpLinkOpenTag(config.getUid(), 'box'),
                    '</a>')
                + '<br /><br /><div style="text-align:center;width:100%;">'
                + '<img alt="" align="absmiddle" width="16" height="16" src="'
                + HttpCommander.Lib.Utils.getIconPath(config, 'box') + '">&nbsp;<a href="#" '
                + ("id='" + config.getUid() + "_authBoxUp_link'")
                + ' target="_blank">'
                + String.format(config.htcConfig.locData.CloudAuthenticateLink, cn) + '</a>'
                + (config.isDemoMode() && !Ext.isEmpty(window.BoxDemoName) && !Ext.isEmpty(window.BoxDemoPass)
                        ? ('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="' + window.BoxDemoName + '" />&nbsp;'
                                + '<input readonly onclick="this.select();" type="text" value="' + window.BoxDemoPass + '" /></span>')
                        : '')
                + "</div>",
            listeners: {
                afterrender: function (wind) {
                    self.bindAuthLink();
                }
            }
        },
        boxUploadPanel = new Ext.Panel({
            layout: 'fit',
            hidden: true,
            border: false,
            items: [{
                xtype: 'label',
                html: String.format(config.htcConfig.locData.CloudUploadSelectItemsMessage, cn)
            },
            boxIgnorePathsCheckbox = new Ext.form.Checkbox({
                boxLabel: config.htcConfig.locData.UploadJavaIgnorePaths,
                listeners: {
                    check: function (cb, checked) {
                        if (!!boxItemsTree) {
                            var checkedNodes = boxItemsTree.getChecked();
                            self.buttons[0].setDisabled(checkedNodes.length == 0);
                        }
                    }
                }
            }),
            boxItemsTree = new Ext.tree.TreePanel({
                root: {
                    text: String.format(config.htcConfig.locData.CloudRootFolderName, cn),
                    expaded: false,
                    checked: false
                },
                useArrows: true,
                autoScroll: true,
                header: false,
                lines: false,
                loader: boxUploadTreeLoader = new HttpCommander.Lib.BoxTreeLoader({
                    directFn: HttpCommander.Box.GetFoldersInfo,
                    baseParams: { path: '0', onlyFolders: false, accessToken: null, refreshToken: null, expiresIn: 0, tokenType: 'bearer' },
                    paramOrder: ['path', 'onlyFolders', 'accessToken', 'refreshToken', 'expiresIn', 'tokenType'],
                    listeners: {
                        beforeload: function (treeLoader, node) {
                            var boxAuth = config.getBoxAuth();
                            var ai = boxAuth ? boxAuth.getAuthInfo() : null;
                            if (!ai) {
                                self.clearAuthInfo();
                                config.getUploadWindow().syncSize();
                                self.changeBoxUploadInfoFiles();
                                return false;
                            }
                            this.baseParams.path = typeof node.attributes.path != 'undefined'
                                ? node.attributes.path : '0';
                            this.baseParams.accessToken = ai.access_token;
                            this.baseParams.refreshToken = ai.refresh_token;
                            this.baseParams.expiresIn = ai.expires_in || 0;
                            this.baseParams.tokenType = ai.token_type || 'bearer';
                            this.baseParams.onlyFolders = false;
                            treeLoader.prevAjaxTimeout = Ext.Ajax.timeout;
                            Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
                        },
                        load: function (treeLoader, node, response) {
                            if (treeLoader.prevAjaxTimeout) {
                                Ext.Ajax.timeout = treeLoader.prevAjaxTimeout;
                            }
                            config.globalLoadMask.hide();
                            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                            var msg = null;
                            if (response && response.responseText && (msg = response.responseText.message) && (msg != '')) {
                                while (node.firstChild) {
                                    node.removeChild(node.firstChild);
                                }
                                if (response.responseText.noaccess === true) {
                                    self.clearAuthInfo();
                                    config.getUploadWindow().syncSize();
                                    self.changeBoxUploadInfoFiles();
                                    return;
                                } else {
                                    config.Msg.show({
                                        title: config.htcConfig.locData.CommonErrorCaption,
                                        msg: msg,
                                        icon: config.Msg.ERROR,
                                        buttons: config.Msg.OK
                                    });
                                }
                            }
                            if (response && response.responseText && response.responseText.tokenInfo && config.getBoxAuth()) {
                                config.getBoxAuth().setAuthInfo(response.responseText.tokenInfo);
                            }
                            self.changeViewBoxFp(false);
                            config.getUploadWindow().syncSize();
                            self.changeBoxUploadInfoFiles();
                        },
                        loadexception: function (treeLoader, node, response) {
                            if (treeLoader.prevAjaxTimeout) {
                                Ext.Ajax.timeout = treeLoader.prevAjaxTimeout;
                            }
                            config.globalLoadMask.hide();
                            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                            config.Msg.hide();
                            var msg = response && response.responseText
                                && response.responseText.message && response.responseText.message.length > 0
                                ? Ext.util.Format.htmlEncode(response.responseText.message) : config.htcConfig.locData.CommonLoadError;
                            config.Msg.show({
                                title: config.htcConfig.locData.CommonErrorCaption,
                                msg: msg,
                                icon: config.Msg.ERROR,
                                buttons: config.Msg.OK
                            });
                        }
                    }
                }),
                bbar: new Ext.Toolbar({
                    items: [
                        boxBBarLabel = new Ext.form.Label({
                            html: String.format(config.htcConfig.locData.CloudUploadTotalFiles,
                                '0', '0 bytes')
                        })
                    ]
                }),
                tbar: new Ext.Toolbar({
                    enableOverflow: true,
                    items: [{
                        icon: HttpCommander.Lib.Utils.getIconPath(config, 'gdrefresh'),
                        text: config.htcConfig.locData.CommandRefresh,
                        handler: function () {
                            self.getBoxItems();
                        }
                    }, '-', {
                        icon: HttpCommander.Lib.Utils.getIconPath(config, 'box') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=box' : ''),
                        text: cn,
                        tooltip: '<b><img alt="" align="absmiddle" width="16" height="16" src="'
                            + HttpCommander.Lib.Utils.getIconPath(config, 'box') + '">&nbsp;'
                            + String.format(config.htcConfig.locData.CloudLinkText, cn) + '</b><br/>'
                            + String.format(config.htcConfig.locData.CloudLinkDescription, cn),
                        handler: function () {
                            window.open('https://app.box.com/files/');
                        }
                    }, '->', {
                        text: String.format(config.htcConfig.locData.CloudSignInAsDifferentUserText, cn),
                        handler: function () {
                            if (config.getBoxAuth()) {
                                config.getBoxAuth().signOut(function (error) {
                                    if (!error) {
                                        self.clearAuthInfo();
                                        config.getUploadWindow().syncSize();
                                        self.changeBoxUploadInfoFiles();
                                    } else {
                                        config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, error);
                                    }
                                });
                            } else {
                                self.clearAuthInfo();
                                config.getUploadWindow().syncSize();
                                self.changeBoxUploadInfoFiles();
                            }
                        }
                    }]
                }),
                listeners: {
                    load: function (node) {
                        Ext.each(node.childNodes, function (el) {
                            if (el.attributes.file && el.attributes.size != 'undefined') {
                                el.text = el.attributes.text + ' ('
                                    + config.getRenderers().sizeRenderer(String(el.attributes.size))
                                    + ')';
                            }
                            if (el.attributes.file) {
                                el.attributes.icon = HttpCommander.Lib.Utils.getIconPath(config, 'none');
                            }
                        });
                    },
                    render: function (tr) {
                        tr.on('checkchange', self.checkChangeBoxUploadList);
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
                var checkedNodes = boxItemsTree.getChecked();
                if (checkedNodes.length == 0) {
                    self.buttons[0].setDisabled(true);
                    showError(String.format(config.htcConfig.locData.CloudUploadSelectItemsMessage, ''), true);
                    return;
                }
                var uploadInfo = {
                    path: curFolder,
                    ignorePaths: boxIgnorePathsCheckbox.getValue(),
                    files: [],
                    folders: []
                };
                var addedPaths = [];
                var emptyFolders = [];
                Ext.each(checkedNodes, function (node) {
                    if (node.attributes.file) {
                        var parentPath = '';
                        if (!uploadInfo.ignorePaths) {
                            var parentNode = node.parentNode;
                            while (!!parentNode && (typeof parentNode.isRoot == 'undefined' || !parentNode.isRoot)) {
                                parentPath = parentNode.attributes.name + (parentPath.length > 0 ? '/' : '') + parentPath;
                                parentNode = parentNode.parentNode;
                            }
                        }
                        uploadInfo.files.push({
                            name: node.attributes.name,
                            id: node.attributes.path,
                            path: parentPath
                        });
                        if (!uploadInfo.ignorePaths) {
                            addedPaths.push((parentPath + (parentPath.length > 0 ? '/' : '') + node.attributes.name).toLowerCase());
                        }
                    } else if (!uploadInfo.ignorePaths) {
                        var path1 = '';
                        var parentNode1 = node.parentNode;
                        while (!!parentNode1 && (typeof parentNode1.isRoot == 'undefined' || !parentNode1.isRoot)) {
                            path1 = parentNode1.attributes.name + (path1.length > 0 ? '/' : '') + path1;
                            parentNode1 = parentNode1.parentNode;
                        }
                        path1 = path1 + (path1.length > 0 ? '/' : '') + node.attributes.name;
                        addedPaths.push(path1.toLowerCase());
                        emptyFolders.push(path1);
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
                if (uploadInfo.files.length == 0 && uploadInfo.folders.length == 0) {
                    self.buttons[0].setDisabled(true);
                    showError(String.format(config.htcConfig.locData.CloudUploadSelectItemsMessage, ''), true);
                    return;
                }

                var dbAuth = config.getBoxAuth();
                uploadInfo.tokenInfo = dbAuth ? dbAuth.getAuthInfo() : null;

                var oldTA = Ext.Ajax.timeout;
                Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
                config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudUploadProgressMessage, cn) + '...';
                config.globalLoadMask.show();
                HttpCommander.Box.Upload(uploadInfo, function (data, trans) {
                    Ext.Ajax.timeout = oldTA;
                    config.globalLoadMask.hide();
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';

                    if (typeof data == 'undefined') {
                        showError(trans.message, true);
                        return;
                    }

                    if (dbAuth) {
                        dbAuth.setAuthInfo(data.tokenInfo);
                    }

                    if (!data.success) {
                        showError(data.message);
                        if (!data.connect) {
                            self.clearAuthInfo();
                        }
                        return;
                    }
                    if (boxItemsTree && boxItemsTree.getRootNode()) {
                        HttpCommander.Lib.Utils.recursiveCheckTreeChildNodesWithoutExpand(boxItemsTree.getRootNode(), false);
                        self.buttons[0].setDisabled(true);
                        self.changeBoxUploadInfoFiles();
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
                        if (!Ext.isEmpty(data.message)) {
                            balloonText += '<br />' + data.message;
                        }
                        config.showBalloon(balloonText);
                    }
                });
            }
        }],

        'prepare': function (interactive) {
            var dbAuth = config.getBoxAuth();
            if (dbAuth) {
                dbAuth.checkAuth(function (result, error) {
                    if (result === true) {
                        self.changeViewBoxFp(false);
                        self.getRootFolders();
                    } else {
                        self.changeViewBoxFp(true);
                        if (error) {
                            var msg = '';
                            if (Ext.isObject(error)) {
                                if (error.error_description) {
                                    msg = error.error_description;
                                } else {
                                    msg = JSON.stringify(error);
                                }
                            } else {
                                msg = error;
                            }
                            config.Msg.show({
                                title: config.htcConfig.locData.CommonErrorCaption,
                                msg: msg,
                                icon: config.Msg.ERROR,
                                buttons: config.Msg.OK
                            });
                        }
                    }
                }, interactive);
            }
        },
        'bindAuthLink': function () {
            var authLink = document.getElementById(config.getUid() + "_authBoxUp_link");
            if (authLink) {
                authLink.onclick = function () {
                    self.prepare(true);
                    return false;
                };
            }
        },
        'getBoxUploadPanel': function () {
            return boxUploadPanel;
        },
        'getBoxItemsTree': function () {
            return boxItemsTree;
        },
        'getBoxItems': function () {
            self.prepare(false);
        },
        'getRootFolders': function () {
            if (boxItemsTree) {
                var rootNode = boxItemsTree.getRootNode();
                if (rootNode) {
                    self.clearRootNode();
                    config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudLoadMsg, cn) + '...';
                    config.globalLoadMask.show();
                    rootNode.expanded = false;
                    rootNode.attributes.path = '0';
                    rootNode.expand(false, true);
                }
            }
        },
        'clearRootNode': function () {
            if (boxItemsTree) {
                var rootNode = boxItemsTree.getRootNode();
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
                self.changeBoxUploadInfoFiles();
            }
        },
        'changeViewBoxFp': function (status) {
            self.items.items[0].setVisible(status);
            self.items.items[1].setVisible(!status);
            self.buttons[0].setVisible(!status);
            if (status && config.getBoxAuth()) {
                config.getBoxAuth().clearAuth();
            }
        },
        'changeBoxUploadInfoFiles': function () {
            if (boxBBarLabel) {
                var count = 0,
                    size = 0;
                if (boxItemsTree) {
                    var checkedNodes = boxItemsTree.getChecked();
                    Ext.each(checkedNodes, function (node) {
                        if (node.attributes.file) {
                            count++;
                            size += parseInt(node.attributes.size);
                        }
                    });
                }
                boxBBarLabel.setText(String.format(config.htcConfig.locData.CloudUploadTotalFiles,
                    count, config.getRenderers().sizeRenderer(String(size))), true);
            }
        },
        'checkChangeBoxUploadList': function (node, checked) {
            if (boxItemsTree) {
                boxItemsTree.un('checkchange', self.checkChangeBoxUploadList);
                HttpCommander.Lib.Utils.recursiveCheckTreeChildNodes(node, checked);
                HttpCommander.Lib.Utils.recursiveCheckTreeParentNodes(node, checked);
                boxItemsTree.on('checkchange', self.checkChangeBoxUploadList);
                self.changeBoxUploadInfoFiles();
                self.buttons[0].setDisabled(boxItemsTree.getChecked().length == 0);
            }
        },
        'clearAuthInfo': function () {
            if (config.getBoxAuth()) {
                config.getBoxAuth().clearAuth();
            }
            self.changeViewBoxFp(true);
            config.getUploadWindow().syncSize();
        }
    });

    return self;
};


/**
 *  config:
 *  htcConfig, Msg, Window, getUid(), getBoxAuth(),
 *  globalLoadMask, getCurrentSelectedSet(), isDemoMode()
 */
HttpCommander.Lib.DownloadToBoxWindow = function (config) {
    var self,
        cn = HttpCommander.Lib.Consts.CloudNames.box,
        boxFoldersLabel,
        boxFoldersPanel,
        boxFoldersTree;

    self = new config.Window({
        title: config.htcConfig.locData.CommandDownloadToBox,
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
                    + HttpCommander.Lib.Utils.getIconPath(config, 'box') + "'/>&nbsp;"
                    + HttpCommander.Lib.Utils.getHelpLinkOpenTag(config.getUid(), "box"),
                    "</a>"
                )
                + "<br /><br /><br /><div style='text-align:center;width:100%;'>"
                + "<img align='absmiddle' width='16' height='16' src='"
                + HttpCommander.Lib.Utils.getIconPath(config, 'box') + "'>&nbsp;"
                + "<a id='" + config.getUid() + "_authBoxDown_link' href='#' target='_self'>"
                + String.format(config.htcConfig.locData.CloudAuthenticateLink, cn) + "</a>"
                + (config.isDemoMode() && !Ext.isEmpty(window.BoxDemoName) && !Ext.isEmpty(window.BoxDemoPass)
                        ? ('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="' + window.BoxDemoName + '" />&nbsp;'
                                + '<input readonly onclick="this.select();" type="text" value="' + window.BoxDemoPass + '" /></span>')
                        : '')
                + "</div>",
            listeners: {
                afterrender: function (lbl) {
                    self.bindAuthLink(self);
                }
            }
        },
        boxFoldersLabel = new Ext.form.Label({
            html: String.format(config.htcConfig.locData.CloudCheckFolerMessage, cn),
            hidden: true
        }),
        boxFoldersPanel = new Ext.Panel({
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
                        self.prepare(false);
                    }
                }, '-', {
                    icon: HttpCommander.Lib.Utils.getIconPath(config, 'box') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=box' : ''),
                    text: 'Box',
                    tooltip: '<b><img align="absmiddle" width="16" height="16" src="'
                        + HttpCommander.Lib.Utils.getIconPath(config, 'box') + '">&nbsp;'
                        + String.format(config.htcConfig.locData.CloudLinkText, cn) + '</b><br/>'
                        + String.format(config.htcConfig.locData.CloudLinkDescription, cn),
                    scope: this,
                    handler: function () {
                        window.open('https://app.box.com/files/');
                    }
                }, '->', {
                    text: String.format(config.htcConfig.locData.CloudSignInAsDifferentUserText, cn),
                    handler: function () {
                        if (config.getBoxAuth()) {
                            config.getBoxAuth().signOut(function (error) {
                                if (!error) {
                                    self.switchView(false);
                                } else {
                                    config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, error);
                                }
                            });
                        } else {
                            self.switchView(false);
                        }
                    }
                }]
            }),
            items: [
                boxFoldersTree = new Ext.tree.TreePanel({
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
                    loader: new HttpCommander.Lib.BoxTreeLoader({
                        directFn: HttpCommander.Box.GetFoldersInfo,
                        baseParams: { path: '0', onlyFolders: true, accessToken: null, refreshToken: null, expiresIn: 0, tokenType: 'bearer' },
                        paramOrder: ['path', 'onlyFolders', 'accessToken', 'refreshToken', 'expiresIn', 'tokenType'],
                        listeners: {
                            beforeload: function (treeLoader, node) {
                                var boxAuth = config.getBoxAuth();
                                var ai = boxAuth ? boxAuth.getAuthInfo() : null;
                                if (!ai) {
                                    self.switchView(false);
                                    return false;
                                }
                                this.baseParams.path = typeof node.attributes.path != 'undefined'
                                    ? node.attributes.path : '0';
                                this.baseParams.accessToken = ai.access_token;
                                this.baseParams.refreshToken = ai.refresh_token;
                                this.baseParams.expiresIn = ai.expires_in || 0;
                                this.baseParams.tokenType = ai.token_type || 'bearer';
                                this.baseParams.onlyFolders = true;

                                treeLoader.prevAjaxTimeout = Ext.Ajax.timeout;
                                Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
                            },
                            load: function (treeLoader, node, response) {
                                if (treeLoader.prevAjaxTimeout) {
                                    Ext.Ajax.timeout = treeLoader.prevAjaxTimeout;
                                }
                                config.globalLoadMask.hide();
                                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                                var msg = null;
                                if (response && response.responseText && (msg = response.responseText.message) && (msg != '')) {
                                    while (node.firstChild) {
                                        node.removeChild(node.firstChild);
                                    }
                                    if (response.responseText.noaccess === true) {
                                        self.switchView(false);
                                        return;
                                    } else {
                                        config.Msg.show({
                                            title: config.htcConfig.locData.CommonErrorCaption,
                                            msg: response.responseText.message,
                                            icon: config.Msg.ERROR,
                                            buttons: config.Msg.OK
                                        });
                                    }
                                }
                                if (response && response.responseText && response.responseText.tokenInfo && config.getBoxAuth()) {
                                    config.getBoxAuth().setAuthInfo(response.responseText.tokenInfo);
                                }
                            },
                            loadexception: function (treeLoader, node, response) {
                                if (treeLoader.prevAjaxTimeout)
                                    Ext.Ajax.timeout = treeLoader.prevAjaxTimeout;
                                config.globalLoadMask.hide();
                                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                                config.Msg.hide();
                                var msg = response && response.responseText
                                            && response.responseText.message && response.responseText.message.length > 0
                                    ? Ext.util.Format.htmlEncode(response.responseText.message) : config.htcConfig.locData.CommonLoadError;
                                config.Msg.show({
                                    title: config.htcConfig.locData.CommonErrorCaption,
                                    msg: msg,
                                    icon: config.Msg.ERROR,
                                    buttons: config.Msg.OK
                                });
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
                        },
                        click: function (node) {
                            var nodeui = node.getUI();
                            if (nodeui) {
                                nodeui.toggleCheck();
                            }
                        },
                        render: function (tr) {
                            tr.on('checkchange', self.checkChangeBoxFolders);
                        }
                    }
                })
            ]
        })],
        buttons: [{
            text: config.htcConfig.locData.CommonButtonCaptionContinue,
            hidden: true,
            disabled: true,
            handler: function () {
                if (!config.htcConfig.enableDownloadToBox)
                    return;
                var node;
                if (boxFoldersTree) {
                    var checkedNodes = boxFoldersTree.getChecked();
                    if (checkedNodes && checkedNodes.length > 0 && checkedNodes[0]) {
                        node = checkedNodes[0];
                    }
                }
                if (!node) {
                    self.buttons[0].setDisabled(true);
                    return;
                }
                self.downloadToBox(node);
            }
        }, {
            text: config.htcConfig.locData.CommonButtonCaptionClose,
            handler: function () { self.hide(); }
        }],
        listeners: {
            afterrender: function (wind) {
                wind.bindAuthLink(wind);
            },
            resize: function (win, width, height) {
                if (boxFoldersPanel && boxFoldersPanel.rendered
                    && !boxFoldersPanel.hidden && boxFoldersPanel.getTopToolbar) {
                    var pt = boxFoldersPanel.getTopToolbar();
                    if (pt.rendered && !pt.hidden)
                        boxFoldersPanel.setWidth(width - 24);
                    boxFoldersPanel.setHeight(win.body.getHeight() - boxFoldersLabel.getHeight() - 10);
                }
            }
        },
        bindAuthLink: function (wind) {
            var authLink = document.getElementById(config.getUid() + "_authBoxDown_link");
            if (authLink) {
                authLink.onclick = function () {
                    self.prepare(true);
                    return false;
                };
            }
        },
        clearRootNode: function () {
            if (boxFoldersTree) {
                var rootNode = boxFoldersTree.getRootNode();
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
        switchView: function (enabled) {
            if (boxFoldersLabel)
                boxFoldersLabel.setVisible(enabled);
            if (boxFoldersTree)
                boxFoldersTree.setVisible(enabled);
            if (boxFoldersPanel)
                boxFoldersPanel.setVisible(enabled);

            self.items.items[0].setVisible(!enabled);
            self.buttons[0].setVisible(enabled);

            if (!enabled) {
                if (config.getBoxAuth())
                    config.getBoxAuth().clearAuth();
                self.clearRootNode();
            }

            self.show();
            self.syncSize();
        },
        prepare: function (interactive) {
            if (config.getBoxAuth()) {
                config.getBoxAuth().checkAuth(function (success, error) {
                    if (success == true) {
                        self.switchView(true);
                        self.getRootFolders();
                    } else {
                        self.switchView(false);
                        if (error) {
                            var msg = '';
                            if (Ext.isObject(error)) {
                                if (error.error_description) {
                                    msg = error.error_description;
                                } else {
                                    msg = JSON.stringify(error);
                                }
                            } else {
                                msg = error;
                            }
                            config.Msg.show({
                                title: config.htcConfig.locData.CommonErrorCaption,
                                msg: msg,
                                icon: config.Msg.ERROR,
                                buttons: config.Msg.OK
                            });
                        }
                    }
                }, interactive);
            }
        },
        checkChangeBoxFolders: function (node, checked) {
            if (boxFoldersTree) {
                boxFoldersTree.un('checkchange', self.checkChangeBoxFolders);
                if (checked) {
                    Ext.each(boxFoldersTree.getChecked(), function (n) {
                        if (n && n != node && n.id != node.id && n.attributes.checked) {
                            n.getUI().toggleCheck(false);
                            n.attributes.checked = false;
                        }
                    });
                }
                boxFoldersTree.on('checkchange', self.checkChangeBoxFolders);
                self.buttons[0].setDisabled(boxFoldersTree.getChecked().length == 0);
            }
        },
        getRootFolders: function (rootInfo) {
            if (boxFoldersTree) {
                var rootNode = boxFoldersTree.getRootNode();
                if (rootNode) {
                    self.clearRootNode();
                    config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudLoadMsg, cn) + '...';
                    config.globalLoadMask.show();
                    rootNode.expanded = false;
                    rootNode.attributes.path = '0';
                    rootNode.expand(false, true);
                }
            }
        },
        downloadToBox: function (node) {
            var boxFolderInfo = node && node.attributes
                ? node.attributes
                : { name: '', path: '' };
            var dbAuth = config.getBoxAuth(),
                tokenInfo = dbAuth && dbAuth.getAuthInfo() ? dbAuth.getAuthInfo() : null;
            if (!tokenInfo) {
                self.switchView(false);
                return;
            }

            var upInfo = {
                'tokenInfo': tokenInfo,
                'selections': config.getCurrentSelectedSet(),
                'boxFolder': boxFolderInfo.path
            };
            if (upInfo.selections.files.length == 0 && upInfo.selections.folders.length == 0)
                return;

            var oldAT = Ext.Ajax.timeout;
            Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
            config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudDownloadingMessage, cn) + "...";
            config.globalLoadMask.show();
            HttpCommander.Box.Download(upInfo, function (data, trans) {
                Ext.Ajax.timeout = oldAT;
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";

                if (typeof data == 'undefined') {
                    config.Msg.alert(config.htcConfig.locData.CommonErrorCaption,
                        Ext.util.Format.htmlEncode(trans.message));
                    return;
                }

                if (dbAuth) {
                    dbAuth.setAuthInfo(data.tokenInfo);
                }

                if (!data.connect) {
                    if (dbAuth) {
                        dbAuth.clearAuth();
                    }
                    self.switchView(false);
                    if (data.message && data.message != '')
                        config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, data.message);
                    else if (data.errors && data.errors != '')
                        config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, data.errors);
                    return;
                }
                if (!data.success) {
                    config.Msg.alert(config.htcConfig.locData.CommonErrorCaption,
                        data.message && data.message != '' ? data.message : data.errors);
                    return;
                }

                var dfn = boxFolderInfo.text;
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
                    message += (message != '' ? '<br />' : '') + config.htcConfig.locData.BoxDownloadWithNewNames
                        + '<div style="width:100%;min-width:200px !important;overflow:auto;height:auto;max-height:75px;display:inline-block;">'
                            + data.newNames + '</div>';
                }

                config.Msg.show({
                    title: config.htcConfig.locData.CloudDownloadEndMessageTitle,
                    msg: message + "<br /><br />"// + (withoutErrors ? '<br />' : '')
                        + "<img align='absmiddle' width='16' height='16' src='"
                        + HttpCommander.Lib.Utils.getIconPath(config, 'box') + "'>&nbsp;<a href='https://app.box.com/files/' target='_blank'>"
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
