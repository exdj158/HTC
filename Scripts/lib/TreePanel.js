Ext.ns('HttpCommander.Lib');

/**
    config: htcConfig, Msg, Window, getIsEmbeddedtoIFRAME(), $, 
    globalLoadMask, openGridFolder(), isRecentFolder(), isTrashFolder(),
    toptbarButtons, clipboard, dragDropPermission(),
    createDraggedSet(), dropDraggedSet(), getCurrentFolder(),
    getHideTreeValue(), getTreeViewValue(), setSelectPath(),
    getRenderers(), getGrid(), isAlertsFolder(), initAndShowChangesWatchWindow(),
    openAlertsFolder(), dropDraggedToTrash(), isSharedTreeFolder(), dropDraggedForShare(),
    getRootName(), openTrash()
*/
HttpCommander.Lib.TreePanel = function (config) {
    var treeLoader = HttpCommander.Lib.TreeLoader({
        'htcConfig': config.htcConfig,
        'Msg': config.Msg,
        'globalLoadMask': config.globalLoadMask,
        'getRootName': config.getRootName,
        'onlyFolders': false
    });
    var self = new Ext.tree.TreePanel({
        region: 'west',
        header: false,
        collapsible: true,
        collapsed: config.getHideTreeValue(),
        collapseMode: 'mini',
        width: config.getIsEmbeddedtoIFRAME() ? 150 : 250,
        autoScroll: true,
        split: true,
        rootVisible: false,
        loader: treeLoader,
        enableDD: true,
        ddGroup: config.$('GridDD'),
        ddAppendOnly: true,
        hlDrop: false,
        openTreeData: { // tree vars
            path: [],
            index: -1,
            reloadLastNode: false
        },
        root: {
            id: config.getRootName(),
            text: config.getRootName(),
            expaded: false
        },
        listeners: {
            load: function (n) {
                if (n.parentNode == null) {
                    n.on('expand', function (rootNode) {
                        Ext.each(rootNode.childNodes, function (el) {
                            self.appendNodeDescription(el);
                        });
                    }, n, { single: true });
                } else {
                    self.appendNodeDescription(n);
                }
                if (config.htcConfig.relativePath != '') {
                    Ext.each(n.childNodes, function (el) {
                        if (typeof el.attributes.icon !== 'undefined')
                            el.attributes.icon = config.htcConfig.relativePath + el.attributes.icon;
                    });
                }
                if (config.htcConfig.enableTrash && config.isTrashFolder(n.attributes.path)) {
                    var usedTrashSize = null,
                        percent = null,
                        qtip = '',
                        rndrs = config.getRenderers();
                    if (n.firstChild && n.firstChild.attributes && Ext.isNumber(n.firstChild.attributes.usedbytes)) {
                        usedTrashSize = n.firstChild.attributes.usedbytes;
                    } else if (n.isLoaded() || n.isExpanded()) {
                        usedTrashSize = 0;
                    }
                    if (Ext.isNumber(config.htcConfig.trashSize) && config.htcConfig.trashSize > 0 && usedTrashSize != null) {
                        percent = '0%';
                        if (usedTrashSize > 0) {
                            percent = '' + Math.round((usedTrashSize * 100.) / config.htcConfig.trashSize) + '%';
                        }
                        n.setText(Ext.util.Format.htmlEncode(config.htcConfig.locData.TrashRootTitle)
                            + '&nbsp;('
                            + Ext.util.Format.htmlEncode(String.format(config.htcConfig.locData.TrashUsedSpaceHint, percent))
                            + ')');
                    } else if (Ext.isNumber(usedTrashSize)) {
                        n.setText(Ext.util.Format.htmlEncode(config.htcConfig.locData.TrashRootTitle)
                            + '&nbsp;('
                            + Ext.util.Format.htmlEncode(String.format(config.htcConfig.locData.TrashUsedSpaceHint,
                                rndrs.sizeRenderer('' + (usedTrashSize < 0 ? 0 : usedTrashSize))))
                            + ')');
                    }
                    if (!Ext.isEmpty(percent)) {
                        qtip += Ext.util.Format.htmlEncode(String.format(config.htcConfig.locData.TrashLimitSizeHint,
                            rndrs.sizeRenderer('' + (usedTrashSize < 0 ? 0 : usedTrashSize)),
                            rndrs.sizeRenderer('' + config.htcConfig.trashSize),
                            percent)) + '<br />';
                    } else if (Ext.isNumber(usedTrashSize)) {
                        qtip += Ext.util.Format.htmlEncode(String.format(config.htcConfig.locData.TrashUsedSpaceHint,
                            rndrs.sizeRenderer('' + (usedTrashSize < 0 ? 0 : usedTrashSize)))) + '<br />';
                    }
                    if (Ext.isNumber(config.htcConfig.trashLargeItemSize) && config.htcConfig.trashLargeItemSize > 0) {
                        qtip += Ext.util.Format.htmlEncode(String.format(config.htcConfig.locData.TrashLargeItemsShelfTimeHint,
                            rndrs.sizeRenderer('' + config.htcConfig.trashLargeItemSize),
                            config.htcConfig.trashLargeItemShelfDays));
                        qtip += '<br />' + Ext.util.Format.htmlEncode(String.format(config.htcConfig.locData.TrashSmallItemsShelfTimeHint,
                            config.htcConfig.trashSmallItemShelfDays));
                    } else {
                        qtip += Ext.util.Format.htmlEncode(String.format(config.htcConfig.locData.TrashItemsShelfTimeHint,
                            config.htcConfig.trashSmallItemShelfDays));
                    }
                    n.attributes.qtip = qtip;
                    if (n.rendered && n.ui && n.ui.textNode) {
                        var tn = n.ui.textNode;
                        if (tn.setAttributeNS) {
                            tn.setAttributeNS("ext", "qtip", qtip);
                        } else {
                            tn.setAttribute("ext:qtip", qtip);
                        }
                    }
                }
            },
            click: function (n) {
                if (Ext.isEmpty(n.attributes.path) && Ext.isEmpty(n.attributes.name) && !(n.attributes.stype == 'recent')) {
                    if (!Ext.isEmpty(n.attributes.error)) {
                        config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, n.attributes.error);
                    }
                    return false;
                }
                if (n.attributes.stype == 'alert') {
                    var pInfo = {
                        path: n.attributes.path,
                        is_folder: n.attributes.folder === true,
                        id: n.attributes.alertid
                    };
                    if (!Ext.isEmpty(pInfo.path) && !Ext.isEmpty(n.attributes.name)) {
                        pInfo.path = pInfo.path + '/' + n.attributes.name;
                    }
                    if (Ext.isEmpty(pInfo.path)) {
                        pInfo.path = n.attributes.name;
                    }
                    config.openAlertsFolder();
                    config.initAndShowChangesWatchWindow(pInfo);
                    return;
                } else if (n.attributes.stype == 'trash' && !Ext.isEmpty(n.attributes.path) && !Ext.isEmpty(n.attributes.name)) {
                    config.setSelectPath({
                        path: ':trash',
                        name: n.attributes.name
                    });
                    config.openTrash(true);
                    return;
                }
                if (n.attributes.path == ':recent') {
                    config.openGridFolder(n.attributes.path + '/-1', true, true);
                    return;
                }
                if (config.isRecentFolder(n.attributes.path) || config.isTrashFolder(n.attributes.path) ||
                    config.isAlertsFolder(n.attributes.path)) {
                    config.openGridFolder(n.attributes.path, true, true);
                    return;
                } else if (n.attributes.stype == 'recent' &&
                    !Ext.isEmpty(n.attributes.path) &&
                    !Ext.isEmpty(n.attributes.name) &&
                    !n.attributes.folder) {
                    config.setSelectPath({
                        path: n.attributes.path,
                        name: n.attributes.name,
                        recent: true
                    });
                }
                var isRcnt = (n.attributes.stype == 'recent');
                var path = Ext.isEmpty(n.attributes.path)
                    ? n.attributes.name
                    : (isRcnt && n.attributes.folder && !Ext.isEmpty(n.attributes.name))
                        ? (n.attributes.path + '/' + n.attributes.name).replace(/\/\//gi, '/')
                        : n.attributes.path;
                if (isRcnt || n.attributes.style == 'recentgroup') {
                    config.openGridFolder(path, true, true);
                } else {
                    config.openGridFolder(path);
                }
            },
            collapse: function (panel) {
                if (config.toptbarButtons['Folders']) {
                    Ext.each(config.toptbarButtons['Folders'], function (item) {
                        item.toggle(false, true);
                    });
                }
            },
            expand: function (panel) {
                if (config.toptbarButtons['Folders']) {
                    Ext.each(config.toptbarButtons['Folders'], function (item) {
                        item.toggle(true, true);
                    });
                }
            },
            render: function (tr) {
                Ext.dd.ScrollManager.register(tr.getTreeEl());
            },
            beforedestroy: function (tr) {
                Ext.dd.ScrollManager.unregister(tr.getTreeEl());
            },
            beforenodedrop: function (dropEvent) {
                config.clipboard.clear();
                dropEvent.cancel = true;
                var source = dropEvent.data.node;
                var ddAllow = config.dragDropPermission(source, dropEvent.target);
                var srcPath = config.getCurrentFolder();
                var perms;

                var target = dropEvent.target;
                var tgtPath = target.attributes.path;
                if (Ext.isEmpty(target.attributes.path)) {
                    return;
                }

                if (source) {
                    if (Ext.isEmpty(source.attributes.name)) {
                        return;
                    }
                    if (Ext.isEmpty(source.parentNode.attributes.path)) {
                        if (!config.isSharedTreeFolder(target.attributes.path)) {
                            return;
                        }
                    }
                    try {
                        perms = eval("(" + source.attributes.permissions + ")");
                    } catch (e) { }
                    srcPath = source.parentNode.attributes.path;
                    var temp = [];
                    temp.push({
                        data: {
                            name: source.attributes.name,
                            rowtype: 'folder'
                        }
                    });
                    source = temp;
                } else {
                    perms = config.htcConfig.currentPerms;
                    source = dropEvent.data.selections;
                }
                var moveToTrash = config.isTrashFolder(target.attributes.path);
                if (moveToTrash) {
                    if (!config.htcConfig.enableTrash || !ddAllow.del) {
                        return;
                    }
                }
                var createShare = config.isSharedTreeFolder(target.attributes.path);
                if (createShare) {
                    if (!config.htcConfig.sharedInTree || !ddAllow.share) {
                        return;
                    }
                }
                try {
                    if (!createShare && !moveToTrash) {
                        config.clipboard.setItems(config.createDraggedSet(source, srcPath));
                        config.clipboard.srcPath = srcPath;
                    }
                    var draggedFiles = '', draggedFolders = '';
                    Ext.each(source, function (rec) {
                        if (rec.data.rowtype == "file")
                            draggedFiles += ", " + Ext.util.Format.htmlEncode(rec.data.name);
                        else if (rec.data.rowtype == "folder")
                            draggedFolders += ", " + Ext.util.Format.htmlEncode(rec.data.name);
                    });
                    var draggedItemsText = '';
                    if (draggedFiles != '') {
                        draggedItemsText = String.format(config.htcConfig.locData.GridDDDraggedFileNames,
                            draggedFiles.substring(1));
                    }
                    if (draggedFolders != '') {
                        if (draggedItemsText != '')
                            draggedItemsText += ".<br />";
                        draggedItemsText += String.format(
                            config.htcConfig.locData.GridDDDraggedFolderNames, draggedFolders.substring(1)
                        );
                    }

                    if (moveToTrash) {
                        config.dropDraggedToTrash(target, config.createDraggedSet(source, srcPath, true));
                        return;
                    } else if (createShare) {
                        config.dropDraggedForShare(source[0], srcPath, perms);
                        return;
                    } else if (ddAllow.onlyMoveOrCopy) {
                        config.clipboard.isCut = ddAllow.move;
                        self.confirmMoveOrCopy(target, ddAllow, draggedItemsText);
                        return;
                    }
                } catch (err) {
                    config.clipboard.clear();
                    config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, err);
                }
                self.askCopyOrMove(target, srcPath, tgtPath, draggedItemsText);
            },
            nodedragover: function (dragOverEvent) {
                if (!dragOverEvent.target)
                    return false;
                var tNode = dragOverEvent.target;
                if (!tNode.parentNode || tNode.isRoot)
                    return false;
                var ddAllow = config.dragDropPermission(dragOverEvent.data.node, tNode);
                if (!ddAllow.allow) {
                    return false;
                }
                var sNode = dragOverEvent.data.node || dragOverEvent.data.selections;
                if (!sNode)
                    return false;
                if (Ext.isArray(sNode)) {
                    var curFolder = config.getCurrentFolder().toLowerCase().trim();
                    if (curFolder === config.getRootName().toLowerCase())
                        return false;
                    if (sNode.length < 1)
                        return false;
                    if (Ext.isEmpty(tNode.attributes.path))
                        return false;
                    if (sNode.length > 1 && config.isSharedTreeFolder(tNode.attributes.path))
                        return false;
                    var nodeFolder = tNode.attributes.path.toLowerCase().trim();
                    //if (curFolder == nodeFolder)
                    //    return false;
                    if (nodeFolder.indexOf(curFolder) == 0) {
                        for (var i = 0; i < sNode.length; i++) {
                            if (sNode[i].data.rowtype == 'folder') {
                                var fName = curFolder + '/' + sNode[i].data.name.toLowerCase().trim();
                                if (nodeFolder.indexOf(fName) == 0)
                                    return false;
                            }
                        }
                    }
                } else {
                    if (sNode.isRoot || !sNode.parentNode)
                        return false;
                    if (sNode.parentNode.isRoot) {
                        if (!config.isSharedTreeFolder(tNode.attributes.path))
                            return false;
                    }
                    if (/*sNode == tNode || */sNode.parentNode == tNode)
                        return false;
                }
                return true;
            }
        },
        checkAndShowQtipError: function (node) {
            if (!!node && !!node.attributes && !Ext.isEmpty(node.attributes.error)) {
                var qtipError = node.attributes.error;
                if (node.rendered && node.ui && node.ui.textNode) {
                    var tn = node.ui.textNode;
                    if (tn.setAttributeNS) {
                        tn.setAttributeNS("ext", "qtip", qtipError);
                    } else {
                        tn.setAttribute("ext:qtip", qtipError);
                    }
                } else {
                    node.attributes.qtip = qtipError;
                }
            }
        },
        appendNodeDescription: function (node) {
            var nodeEl;
            if (node && node.parentNode && (node.parentNode.id.toLowerCase() === config.getRootName().toLowerCase() || !node.parentNode.parentNode)) {
                nodeEl = (node.ui && node.ui.getEl) ? node.ui.getEl() : undefined;
                if (nodeEl && nodeEl.firstChild) {
                    Ext.fly(nodeEl.firstChild).addClass('x-root-tree-node');
                }
                if (node.attributes && (typeof node.attributes.qtip != 'undefined')
                    && !config.isTrashFolder(node.attributes.path)
                    && nodeEl && nodeEl.firstChild) {
                    if (node.descInserted === true) {
                        nodeEl.removeChild(nodeEl.firstChild);
                        node.descInserted = false;
                        if (!nodeEl.firstChild) {
                            self.checkAndShowQtipError(node);
                            return;
                        }
                    }
                    var descDiv = document.createElement("div");
                    descDiv.style.whiteSpace = 'normal';
                    descDiv.style.lineHeight = '14px';
                    descDiv.style.cursor = 'default';
                    descDiv.style.font = '11px arial,tahoma,helvetica,sans-serif;';
                    descDiv.style.margin = '0';
                    descDiv.style.paddingLeft = '4px'; //'20px';
                    descDiv.style.paddingTop = '2px';
                    var innerHtml = '<span class="x-tree-node-indent">';
                    innerHtml += '</span><span class="x-grid3-cell-text x-panel-header" style="line-height:14px;vertical-align:middle !important;text-align:left;padding:1px 3px 1px 0px;font-weight:bold;">'
                        + String(node.attributes.qtip) // qtip field is already html encoded from server
                        + '</span>';
                    descDiv.innerHTML = innerHtml;
                    nodeEl.insertBefore(descDiv, nodeEl.firstChild);
                    node.descInserted = true;
                }
            }
            self.checkAndShowQtipError(node);
        },
        confirmMoveOrCopy: function (target, ddAllow, draggedItemsText) {
            config.Msg.confirm(
                Ext.util.Format.htmlEncode(String.format(
                    config.htcConfig.locData.GridDDConfirmCopyMoveTitle, target.text)
                ),
                (ddAllow.move
                    ? String.format(config.htcConfig.locData.GridDDConfirmTargetFolderOnlyMoveMsg,
                        '<br />' + draggedItemsText
                    )
                    : String.format(config.htcConfig.locData.GridDDConfirmTargetFolderOnlyCopyMsg,
                        '<br />' + draggedItemsText
                    )
                ),
                function (btn) {
                    if (btn == 'yes') {
                        config.dropDraggedSet(target);
                        return true;
                    } else {
                        config.clipboard.clear();
                        return false;
                    }
                }
            );
        },
        askCopyOrMove: function (target, srcPath, tgtPath, draggedItemsText) {
            config.Msg.show({
                title: Ext.util.Format.htmlEncode(String.format(
                    config.htcConfig.locData.GridDDConfirmCopyMoveTitle, target.text)
                ),
                msg: String.format(config.htcConfig.locData.GridDDConfirmCopyMoveMsg,
                    Ext.util.Format.htmlEncode(srcPath),
                    Ext.util.Format.htmlEncode(tgtPath),
                    '<br />' + draggedItemsText,
                    '&nbsp;'
                ),
                buttons: {
                    yes: config.htcConfig.locData.CommandMove,
                    no: config.htcConfig.locData.CommandCopy,
                    cancel: config.htcConfig.locData.CommonButtonCaptionCancel
                },
                fn: function (btn) {
                    if (btn == 'yes' || btn == 'no') {
                        config.clipboard.isCut = (btn == 'yes');
                        config.dropDraggedSet(target);
                    } else {
                        config.clipboard.clear();
                        config.Msg.hide();
                    }
                }
            });
        },
        openTreeNode: function (path, reloadLastNode /* = false */, forceHighlightCurrentFolderNode /* = false */) {
            forceHighlightCurrentFolderNode = (forceHighlightCurrentFolderNode === true);
            if (config.getTreeViewValue() != 'enabled' && !reloadLastNode) {
                if (forceHighlightCurrentFolderNode) {
                    self.highlightCurrentFolderNode();
                }
                return;
            }
            if (reloadLastNode == null) {
                reloadLastNode = false;
            }
            self.openTreeData.path = path.split('/');
            if (path.toLowerCase() != config.getRootName().toLowerCase()) {
                self.openTreeData.path.unshift(config.getRootName());
            }
            self.openTreeData.index = -1;
            self.openTreeData.reloadLastNode = reloadLastNode;
            self.openTreeNodeImpl(forceHighlightCurrentFolderNode);
        },
        openTreeNodeClear: function () {
            self.openTreeData.path = [];
            self.openTreeData.index = -1;
        },
        findTreeNodeChild: function (node, name, deep) {
            return node.findChildBy(
                function (n) { return !Ext.isEmpty(n.attributes.name) && n.attributes.name.toLowerCase() == name.toLowerCase(); },
                node,
                deep);
        },
        highlightCurrentFolderNode: function() {
            var path = config.getCurrentFolder(),
                node = self.getRootNode();
            if (!Ext.isEmpty(path) && path.toLowerCase() != config.getRoo) {
                node = node.findChild('path', path, true);
            }
            if (node) {
                try {
                    node.select();
                } catch (e) {
                    if (!!window.console && !!window.console.log) {
                        window.console.log(e);
                    }
                }
            }
        },
        openTreeNodeWithHighlightCurrentImpl: function () {
            self.openTreeNodeImpl(true);
        },
        openTreeNodeImpl: function (forceHighlightCurrentFolderNode /* = false */) {
            forceHighlightCurrentFolderNode = (forceHighlightCurrentFolderNode === true);
            if (self.openTreeData.path.length == 0) {
                if (forceHighlightCurrentFolderNode) {
                    self.highlightCurrentFolderNode();
                }
                return;
            }
            if (self.openTreeData.path[0].toLowerCase() != config.getRootName().toLowerCase()) {
                // invalid path
                self.openTreeNodeClear();
                if (forceHighlightCurrentFolderNode) {
                    self.highlightCurrentFolderNode();
                }
                return;
            }
            /* index of node in self.openTreeData.path
            always: index < self.openTreeData.path.length
            all nodes with indexes < index are expanded */
            var index = 0;
            var node = self.getRootNode();
            while (node.isExpanded() && index + 1 < self.openTreeData.path.length) {
                var childNode = self.findTreeNodeChild(node, self.openTreeData.path[index + 1], false);
                if (childNode == null) {
                    // invalid self.openTreeData.path or should we reload the tree?
                    self.openTreeNodeClear();
                    if (forceHighlightCurrentFolderNode) {
                        self.highlightCurrentFolderNode();
                    }
                    return;
                }
                node = childNode;
                index++;
            }
            if (node.isExpanded()) {
                // all expanded, we are done
                if (self.openTreeData.reloadLastNode && node.firstExpand !== true) {
                    if (Ext.isFunction(node.reload)) {
                        node.reload();
                    }
                    self.openTreeData.index = index;
                } else {
                    self.openTreeNodeClear();
                }
                node.firstExpand = null;
                if (forceHighlightCurrentFolderNode) {
                    self.highlightCurrentFolderNode();
                } else {
                    node.select();
                }
                return;
            }
            if (self.openTreeData.index == index) {
                if (forceHighlightCurrentFolderNode) {
                    self.highlightCurrentFolderNode();
                }
                // either already expanding this node or expand failed
                return;
            }
            if (self.openTreeData.index > index) {
                // error
                self.openTreeNodeClear();
                if (forceHighlightCurrentFolderNode) {
                    self.highlightCurrentFolderNode();
                }
                return;
            }
            self.openTreeData.index = index;
            /*
            If node is not expanded and not loaded (first expand), then on
            expand this node will be sended request to TreeHandler and after
            fill node will be call openTreeNodeImpl function and node.reaload
            (double request)
            */
            if (!node.expanded && !node.loaded) {
                node.firstExpand = true;
            }
            node.expand(false, true, forceHighlightCurrentFolderNode ? self.openTreeNodeWithHighlightCurrentImpl : self.openTreeNodeImpl, self);
            if (forceHighlightCurrentFolderNode) {
                self.highlightCurrentFolderNode();
            } else {
                node.select();
            }
        },
        reloadTreeNodeIfOpened: function (pathStr) {
            var path = pathStr.split('/');
            if (pathStr.toLowerCase() != config.getRootName().toLowerCase())
                path.unshift(config.getRootName());
            var index = 0;
            var node = self.getRootNode();
            while (node.isExpanded() && index + 1 < path.length) {
                var childNode = self.findTreeNodeChild(node, path[index + 1], false);
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
    return self;
};