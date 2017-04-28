Ext.ns('HttpCommander.Lib');

/**
    config: htcConfig, Msg, Window, getRootName(), getCurrentFolder(),
    getMenuActions(), clipboard, initAndShowUnzipPromptWindow(), getGrid()

*/
HttpCommander.Lib.FolderSelectionDialog = function (config) {
    var maskLoader, self, tree, treeLoader, folderForSelect,
        mainHandler = function (node) {
            var move = (self.action === 'move'), perms = null,
                unzip = (self.action === 'unzip'),
                btn = self.buttons[0];
            if (!node) {
                btn.setDisabled(true);
                return;
            }
            try { perms = eval('(' + node.attributes.permissions + ')'); }
            catch (e) { }
            var allow = perms && (
                (unzip && perms.unzip) ||
                (!unzip && perms.create && (perms.cut || perms.copy))
            );
            if (!allow) {
                btn.setDisabled(true);
                return;
            }
            if (unzip) {
                if (Ext.isEmpty(self.zipPath) || Ext.isEmpty(self.zipName)) {
                    btn.setDisabled(true);
                    return;
                }
                var unzipInfo = {
                    path: self.zipPath,
                    name: self.zipName,
                    crypted: true
                };
                config.initAndShowUnzipPromptWindow(unzipInfo, 2, node, self);
            } else {
                config.getMenuActions().pasteTo(move, node, self);
            }
        }, reloadTree = function () {
            treeLoader.firstTreeLoad = true;
            tree.getRootNode().reload();
        };

    treeLoader = HttpCommander.Lib.TreeLoader({
        'htcConfig': config.htcConfig,
        'Msg': config.Msg,
        'globalLoadMask': function () { return maskLoader; },
        'getRootName': config.getRootName,
        'onlyFolders': true
    });

    tree = new Ext.tree.TreePanel({
        header: false,
        collapsible: false,
        anchor: '100%',
        autoScroll: true,
        rootVisible: false,
        loader: treeLoader,
        enableDD: false,
        selModel: new Ext.tree.DefaultSelectionModel({
            listeners: {
                selectionchange: function (model, node) {
                    if (!treeLoader.firstTreeLoad) {
                        tree.lastFolder = !node ? null : node.attributes.path;
                    }
                    var move = (self.action === 'move'), perms = null,
                        unzip = (self.action === 'unzip'), btn = self.buttons[0];
                    if (!node) {
                        btn.setDisabled(true);
                    } else {
                        try { perms = eval('(' + node.attributes.permissions + ')'); }
                        catch (e) { }
                        var allow = perms && (
                            (unzip && perms.unzip) ||
                            (!unzip && perms.create && (perms.cut || perms.copy))
                        );
                        btn.setDisabled(!allow);
                    }
                    var newFolder = self.getTopToolbar().items.items[0];
                    newFolder.setDisabled(!perms || !perms.listFolders || !perms.create);
                }
            }
        }),
        openTreeData: { // tree vars
            path: [],
            index: -1,
            reloadLastNode: false
        },
        lastFolder: config.getRootName(),
        root: {
            id: config.getRootName(),
            text: config.getRootName(),
            expaded: false
        },
        listeners: {
            load: function (n) {
                if (config.htcConfig.relativePath != '') {
                    Ext.each(n.childNodes, function (el) {
                        if (!Ext.isEmpty(el.attributes.icon)) {
                            el.attributes.icon = config.htcConfig.relativePath + el.attributes.icon;
                        }
                    });
                }
                if (!!n && !n.parentNode) {
                    if (!Ext.isEmpty(tree.lastFolder)) {
                        tree.openTreeNode(tree.lastFolder, true);
                    }
                }
            },
            dblclick: mainHandler
        },
        openTreeNode: function (path, reloadLastNode) {
            if (reloadLastNode == null) {
                reloadLastNode = false;
            }
            tree.openTreeData.path = path.split('/');
            if (path.toLowerCase() != config.getRootName().toLowerCase()) {
                tree.openTreeData.path.unshift(config.getRootName());
            }
            tree.openTreeData.index = -1;
            tree.openTreeData.reloadLastNode = reloadLastNode;
            tree.openTreeNodeImpl();
        },
        openTreeNodeClear: function () {
            tree.openTreeData.path = [];
            tree.openTreeData.index = -1;
        },
        findTreeNodeChild: function (node, name, deep) {
            return node.findChildBy(
                function (n) { return !Ext.isEmpty(n.attributes.name) && n.attributes.name.toLowerCase() == name.toLowerCase(); },
                node,
                deep);
        },
        openTreeNodeImpl: function () {
            if (tree.openTreeData.path[0].toLowerCase() != config.getRootName().toLowerCase()) {
                // invalid path
                tree.openTreeNodeClear();
                return;
            }
            // index of node in tree.openTreeData.path
            // always: index < tree.openTreeData.path.length
            // all nodes with indexes < index are expanded
            var index = 0;
            var node = tree.getRootNode();
            while (node.isExpanded() && index + 1 < tree.openTreeData.path.length) {
                var childNode = tree.findTreeNodeChild(node, tree.openTreeData.path[index + 1], false);
                if (childNode == null) {
                    // invalid tree.openTreeData.path or should we reload the tree?
                    tree.openTreeNodeClear();
                    return;
                }
                node = childNode;
                index++;
            }
            if (node.isExpanded()) {
                // all expanded, we are done
                if (tree.openTreeData.reloadLastNode && node.firstExpand !== true) {
                    if (Ext.isFunction(node.reload)) {
                        node.reload();
                    }
                    tree.openTreeData.index = index;
                } else {
                    tree.openTreeNodeClear();
                }
                node.firstExpand = null;
                node.select();
                return;
            }
            if (tree.openTreeData.index == index) {
                // either already expanding this node or expand failed
                return;
            }
            if (tree.openTreeData.index > index) {
                // error
                tree.openTreeNodeClear();
                return;
            }
            tree.openTreeData.index = index;
            // If node is not expanded and not loaded (first expand), then on
            // expand this node will be sended request to TreeHandler and after
            // fill node will be call openTreeNodeImpl function and node.reaload
            // (double request)
            if (!node.expanded && !node.loaded) {
                node.firstExpand = true;
            }
            node.expand(false, true, tree.openTreeNodeImpl, self);
            node.select();
        },
        reloadTreeNodeIfOpened: function (pathStr) {
            var path = pathStr.split('/');
            if (pathStr.toLowerCase() != config.getRootName().toLowerCase())
                path.unshift(getRootName());
            var index = 0;
            var node = tree.getRootNode();
            while (node.isExpanded() && index + 1 < path.length) {
                var childNode = tree.findTreeNodeChild(node, path[index + 1], false);
                if (childNode == null) {
                    // invalid path
                    return;
                }
                node = childNode;
                index++;
            }
            if (node.isExpanded() && Ext.isFunction(node.reload)) {
                node.reload();
            }
        }
    });

    self = new config.Window({
        title: config.htcConfig.locData.UploadSimpleUploadFolderButtonText,
        closeAction: 'hide',
        modal: true,
        layout: 'fit',
        resizable: true,
        maximizable: true,
        minWidth: 200,
        minHeight: 300,
        width: 300,
        height: 350,
        plain: true,
        frame: false,
        tbar: [{
            text: config.htcConfig.locData.CommandNewFolder,
            icon: HttpCommander.Lib.Utils.getIconPath(config, 'folder'),
            disabled: true,
            handler: function (btn) {
                var node = tree.getSelectionModel().getSelectedNode();
                if (!node) {
                    btn.setDisabled(true);
                    return;
                }
                config.getMenuActions().createNewItem('folder', node.attributes.path, self);
            }
        }, '->', {
            text: config.htcConfig.locData.CommandRefresh,
            icon: HttpCommander.Lib.Utils.getIconPath(config, 'refresh'),
            handler: function () {
                reloadTree();
            },
        }],
        items: tree,
        listeners: {
            render: function (wnd) {
                maskLoader = new Ext.LoadMask(wnd.getEl(), {
                    msg: config.htcConfig.locData.ProgressLoading + '...'
                });
            },
            hide: function (wnd) {
                if (!!config.clipboard) {
                    config.clipboard.clear();
                }
            }
        },
        buttonAlign: 'center',
        buttons: [{
            text: config.htcConfig.locData.CommonButtonCaptionOK,
            disabled: true,
            handler: function (btn) {
                mainHandler(tree.getSelectionModel().getSelectedNode());
            }
        }, {
            text: config.htcConfig.locData.CommonButtonCaptionCancel,
            handler: function (btn) {
                self.hide();
            }
        }],

        'openTreeNode': function (folder) {
            if (!Ext.isEmpty(folder)) {
                tree.lastFolder = folder;
            }
            if (tree.getRootNode().loaded) {
                reloadTree();
            }
        }
    });

    return self;
};