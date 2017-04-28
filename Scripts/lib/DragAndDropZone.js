Ext.ns('HttpCommander.Lib');

/* config: htcConfig, getExtEl(), getDragAndDropFormPanel(), ProcessScriptError(), getView(),
    isUploadWindowVisible(), showUploadWindow(), getGrid(), getTree(), openGridFolder(), getCurrentFolder()
    
This class attaches handlers to root extEl and to upload window if it is initialized.
Attaching to root extEl intersepts all Drag and Drop events in Http Commander area.
When upload window is initialized, this class register additional handlers for that window.
When drop event occurs, upload window is shown.
Dropped files are added to the upload window list.
*/
HttpCommander.Lib.DragAndDropZone = function (config) {
    var self = this;
    self.config = config;
    self.uploadDropZone = null;
    self.showDnDTipTimeOut = undefined;
    self.dndShare = {
        fileReadersXHRUArray: [],
        dndFiles: [],
        isNotDnDUploading: true
    };

    try {
        self.uploadDnDTip = new Ext.Tip({
            shadow: false,
            autoHeight: true,
            autoWidth: true,
            renderTo: self.config.getExtEl(),
            baseCls: 'x-tip', //'x-balloon',
            bodyStyle: 'font-size:16pt;font-weight:600;font-family:verdana;text-align:center;',
            //+ HttpCommander.Lib.Utils.getIconPath(config,'drophere')+
            html: '<img alt="" src="' + self.config.htcConfig.relativePath + 'Images/drophere.png"/>'
                + '<br />'
                + self.config.htcConfig.locData.DropFilesHere,
            listeners: {
                hide: function() {
                    if (self.showDnDTipTimeOut) {
                        window.clearTimeout(self.showDnDTipTimeOut);
                        self.showDnDTipTimeOut = undefined;
                    }
                }
            }
        });
    } catch (e) {
        self.config.ProcessScriptError(e);
    }
}

Ext.apply(HttpCommander.Lib.DragAndDropZone.prototype, {
    addDnDEvents: function () {
        var self = this;
        try {
            var dndGrid = (self.config.getDragAndDropFormPanel() ? self.config.getDragAndDropFormPanel().getUploadDnDGridPanel() : null);
            var dragstart = function () {
                return self.dragstart.apply(self, arguments);
            }, dragenter = function () {
                return self.dragenter.apply(self, arguments);
            }, dragover = function () {
                return self.dragover.apply(self, arguments);
            }, drop = function () {
                return self.drop.apply(self, arguments);
            }, dragleave = function () {
                return self.dragleave.apply(self, arguments);
            }, pasteHandler = function () {
                return self.pasteHandler.apply(self, arguments);
            };
            var dom;
            if (self.config.htcConfig.enablePasteImages === true) {
                if (window.addEventListener) {
                    window.addEventListener('paste', pasteHandler, true);
                } else if (window.attachEvent) {
                    window.attachEvent('onpaste', pasteHandler);
                }
            }
            if (self.config.getExtEl() && (dom = self.config.getExtEl().dom)) {
                if (dom.addEventListener) {
                    dom.addEventListener("dragstart", dragstart, true);
                    dom.addEventListener("dragenter", dragenter, true);
                    dom.addEventListener("dragover", dragover, true);
                    dom.addEventListener("drop", drop, true);
                    dom.addEventListener("dragleave", dragleave, true);
                } else if (dom.attachEvent) {
                    dom.attachEvent("ondragstart", dragstart);
                    dom.attachEvent("ondragenter", dragenter);
                    dom.attachEvent("ondragover", dragover);
                    dom.attachEvent("ondrop", drop);
                    dom.attachEvent("ondragleave", dragleave, true);
                }
                dom.setAttribute("dragenter", true);
            }
            if (dndGrid && dndGrid.el && (self.uploadDropZone = dndGrid.el.dom)) {
                if (self.uploadDropZone.addEventListener) {
                    self.uploadDropZone.addEventListener("dragover", dragover, true);
                    self.uploadDropZone.addEventListener("drop", drop, true);
                    self.uploadDropZone.addEventListener("dragenter", dragenter, true);
                } else if (self.uploadDropZone.attachEvent) {
                    self.uploadDropZone.attachEvent("ondragover", dragover);
                    self.uploadDropZone.attachEvent("ondrop", drop);
                    self.uploadDropZone.attachEvent("ondragenter", dragenter, true);
                }
                self.uploadDropZone.setAttribute("dragenter", true);
            }
            var existingHiddenDiv = document.getElementById('checkCookieEnabledHolder');
            if (existingHiddenDiv) {
                existingHiddenDiv.setAttribute('contenteditable', true);
            }
        } catch (err) {
            self.config.ProcessScriptError(err);
        }
    },
    dataURItoBlob: function (dataURI) {
        try {
            var mime = dataURI.split(';')[0].split(':')[1],
                byteString = atob(dataURI.split(',')[1]),
                ab = new ArrayBuffer(byteString.length),
                ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ab], { type: mime });
        } catch (e) {
            if (!!window.console && !!window.console.log) {
                window.console.log(e);
            }
            return null;
        }
    },
    pasteHandlerImpl: function (items, e) {
        var self = this;
        try {
            var len = (items ? items.length : null);

            if (self.uploadDnDTip)
                self.uploadDnDTip.hide();

            if (e.preventDefault)
                e.preventDefault();
            if (e.stopPropagation)
                e.stopPropagation();
            if (window.event)
                window.event.returnValue = false;
            if (e.stopEvent)
                e.stopEvent();
            e.cancelBubble = true;

            var allow = (self.config.htcConfig.currentPerms &&
                self.config.htcConfig.currentPerms.upload);

            if (allow && len && self.dndShare.isNotDnDUploading) {
                try {
                    self.config.showUploadWindow();
                } catch (err) {
                    self.config.ProcessScriptError(err);
                    return;
                }
                if (self.config.getDragAndDropFormPanel()) {
                    self.config.getDragAndDropFormPanel().addFiles(items, true);
                }
            }
        } catch (err) {
            self.config.ProcessScriptError(err);
        }

        return false;
    },
    pasteHandler: function (e) {
        var self = this, allow = false, clipData;

        if (!(self.config.htcConfig.enablePasteImages === true)) {
            return;
        }

        // cancel if pasted to input text or textarea fields
        try {
            var sender = e.target || e.srcElement;
            if (sender && sender.tagName && sender.tagName.match(/INPUT|TEXTAREA/i)) {
                return;
            }
        } catch (e) {
            // ignore
        }

        try {
            clipData = (e.clipboardData || (e.originalEvent ? e.originalEvent.clipboardData : null));
            items = (clipData ? (clipData.items || clipData.files) : null);

            if ((!items || !items.length) && HttpCommander.Lib.Utils.browserIs.firefox36up) { // Ext.isGecko
                var hiddenDiv = document.getElementById('checkCookieEnabledHolder');
                if (hiddenDiv) {
                    hiddenDiv.focus();
                    var images = hiddenDiv.getElementsByTagName('img');
                    for (var i = 0; i < images.length; i++) {
                        hiddenDiv.removeChild(images[i]);
                    }
                    setTimeout(function () {
                        images = hiddenDiv.getElementsByTagName('img');
                        if (images.length) {
                            images[0].style.display = 'none';
                            var blob = self.dataURItoBlob(images[0].src);
                            self.pasteHandlerImpl.apply(self, [[blob], e]);
                        }
                    }, 1);
                    return true;
                }
            }

            self.pasteHandlerImpl.apply(self, [items, e]);
        } catch (err) {
            self.config.ProcessScriptError(err);
        }

        return false;
    },
    findRowAndNode: function (e, leave) {
        var self = this, rec, row, rowIndex, grid, view,
            tree, node, nodeId, found, res = null, isThumb = false,
            ieNoEdge = HttpCommander.Lib.Utils.browserIs.ie && !HttpCommander.Lib.Utils.browserIs.edge;

        try { // search row grid by target element
            if (self.config.htcConfig.currentPerms && self.config.htcConfig.currentPerms.upload) {
                grid = self.config.getGrid();
                if (!!grid) {
                    view = grid.getView();
                    if (!!view) {
                        row = !!e ? (e.target || e.srcElement) : null;
                        found = false;
                        while (row) {
                            isThumb = false;
                            var rowClass = (' ' + (row.className || '') + ' ');
                            if (rowClass.indexOf(' fakeFolderNameForDnD ') > -1 || (isThumb = (
                                rowClass.indexOf(' thmbIconMedium ') > -1 ||
                                rowClass.indexOf(' thmbIconSmall ') > -1 ||
                                rowClass.indexOf(' thmbIconBig ') > -1 ||
                                rowClass.indexOf(' thmbIconLarge ') > -1))) {
                                found = true;
                                break;
                            }
                            row = row.parentNode;
                        }
                        if (found) {
                            if (isThumb) {
                                found = false;
                                while (row) {
                                    if ((' ' + (row.className || '') + ' ').indexOf(' thumbnailedItem ') > -1) {
                                        found = true;
                                        break;
                                    }
                                    row = row.parentNode;
                                }
                            } else {
                                found = false;
                                while (row) {
                                    if ((' ' + (row.className || '') + ' ').indexOf(' x-grid3-row ') > -1) {
                                        found = true;
                                        break;
                                    }
                                    row = row.parentNode;
                                }
                            }
                        } else if (!isThumb && ieNoEdge && leave) {
                            found = false;
                            row = !!e ? (e.target || e.srcElement) : null;
                            while (row) {
                                if ((' ' + (row.className || '') + ' ').indexOf(' x-grid3-row ') > -1) {
                                    found = true;
                                    break;
                                }
                                row = row.parentNode;
                            }
                        }
                        if (found) {
                            rowIndex = view.findRowIndex(row);
                            rec = grid.getStore().getAt(rowIndex);
                            if (!!rec && rec.get('rowtype') != 'folder') {
                                rec = null;
                            }
                        }
                    }
                }
            }
        } catch (err) {
            if (!!window.console && !!window.console.log) {
                window.console.log(err);
            }
            row = null;
            grid = null;
            view = null;
            rec = null;
        }

        try { // search tree node by target element
            tree = self.config.getTree();
            if (!!tree) {
                node = !!e ? (e.target || e.srcElement) : null;
                found = false;
                var nodeEl = ieNoEdge ? ' x-tree-node-el ' : ' x-tree-node-anchor ';
                while (node) {
                    if ((' ' + (node.className || '') + ' ').indexOf(nodeEl) > -1) {
                        found = true;
                        break;
                    }
                    node = node.parentNode;
                }
                if (found && !ieNoEdge) {
                    found = false;
                    while (node) {
                        if ((' ' + (node.className || '') + ' ').indexOf(' x-tree-node-el ') > -1) {
                            found = true;
                            break;
                        }
                        node = node.parentNode;
                    }
                }
                if (found) {
                    nodeId = Ext.fly(node, '_treeEvents').getAttribute('tree-node-id', 'ext');
                    if (nodeId) {
                        node = tree.getNodeById(nodeId);
                        if (!!node) {
                            try {
                                var nodePerms = eval("(" + node.attributes.permissions + ")");
                                if (!nodePerms || !nodePerms.upload) {
                                    node = null;
                                }
                            } catch (err) { }
                        }
                    } else {
                        node = null;
                    }
                }
            }
        } catch (e) {
            if (!!window.console && !!window.console.log) {
                window.console.log(e);
            }
            tree = null;
            node = null;
        }

        if (!!rec) {
            rec.virtPath = self.config.getCurrentFolder() + '/' + rec.data.name;
            res = {
                grid: grid,
                view: view,
                rec: rec,
                row: row
            }
        }

        if (!!node) {
            (res || (res = {})).node = node;
        }

        return res;
    },
    dragstart: function (e) {
        var self = this;
        try {
            if (e.target.getAttribute('draggable')) {
                return true;
            }
        } catch (e) { }
        try {
            if (e.preventDefault)
                e.preventDefault();
            if (e.stopPropagation)
                e.stopPropagation();
            if (window.event)
                window.event.returnValue = false;
            if (e.stopEvent)
                e.stopEvent();
        } catch (err) {
            self.config.ProcessScriptError(err);
        }
        return false;
    },
    dragenter: function (e) {
        var self = this, noFiles = true, i = 0, len = 0,
            ieNoEdge = HttpCommander.Lib.Utils.browserIs.ie && !HttpCommander.Lib.Utils.browserIs.edge;

        var rowAndNode = self.findRowAndNode.call(self, e);

        try {
            if (self.uploadDnDTip)
                self.uploadDnDTip.hide();
            if (!e.dataTransfer || e.dataTransfer.mozSourceNode || !(
                (e.dataTransfer.items && e.dataTransfer.items.length > 0) ||
                (e.dataTransfer.files && (e.dataTransfer.files.length > 0 || ieNoEdge))))
                return;
            if (e.dataTransfer.items && (len = e.dataTransfer.items.length) > 0) {
                for (; i < len; i++) {
                    if (e.dataTransfer.items[i].kind == 'file') {
                        noFiles = false;
                        break;
                    }
                }
                if (noFiles)
                    return;
            }

            var allow = (!!rowAndNode && !!rowAndNode.node) ||
                (self.config.htcConfig.currentPerms && self.config.htcConfig.currentPerms.upload);
            if (allow) {
                // highlight grid row or tree node
                if (!!rowAndNode && !!rowAndNode.node) {
                    rowAndNode.node.select();
                }
                if (!!rowAndNode && !!rowAndNode.row) {
                    Ext.fly(rowAndNode.row).addClass('x-drop-target-active');
                }

                if (self.dndShare.isNotDnDUploading && self.uploadDnDTip
                    && !self.config.isUploadWindowVisible()) {
                    self.uploadDnDTip.setVisible(false);
                    self.uploadDnDTip.show();
                    var hpos = self.config.getView().el.getLeft() + (self.config.getView().el.getWidth() - self.uploadDnDTip.el.getWidth()) / 2;
                    var vpos = self.config.getView().el.getTop() + (self.config.getView().el.getHeight() - self.uploadDnDTip.el.getHeight()) / 2;
                    self.uploadDnDTip.showAt([hpos, vpos]);
                    self.uploadDnDTip.setVisible(true);
                    self.showDnDTipTimeOut = setTimeout(function () {
                        if (self.uploadDnDTip)
                            self.uploadDnDTip.hide();
                    }, 3000);
                }
            }
        } catch (err) {
            self.config.ProcessScriptError(err);
        }
    },
    dragover: function (e) {
        var self = this;
        try {
            if (e.preventDefault)
                e.preventDefault();
            if (e.stopPropagation)
                e.stopPropagation();
            if (window.event)
                window.event.returnValue = false;
            if (e.stopEvent)
                e.stopEvent();
        } catch (err) {
            self.config.ProcessScriptError(err);
        }
        return false;
    },
    dragleave: function (e) {
        var self = this;

        var rowAndNode = self.findRowAndNode.call(self, e, true);

        // unhighlight grid row node tree node
        if (!!rowAndNode && !!rowAndNode.node) {
            rowAndNode.node.unselect(true);
        }
        if (!!rowAndNode && !!rowAndNode.row) {
            Ext.fly(rowAndNode.row).removeClass('x-drop-target-active');
        }

        try {
            if (e.preventDefault)
                e.preventDefault();
            if (e.stopPropagation)
                e.stopPropagation();
            if (window.event)
                window.event.returnValue = false;
            if (e.stopEvent)
                e.stopEvent();
        } catch (err) {
            self.config.ProcessScriptError(err);
        }
        return false;
    },
    drop: function (e) {
        var self = this, i, len, noFiles = true;

        var rowAndNode = self.findRowAndNode.call(self, e, true);

        // unhighlight grid row node tree node
        if (!!rowAndNode && !!rowAndNode.node) {
            rowAndNode.node.unselect(true);
        }
        if (!!rowAndNode && !!rowAndNode.row) {
            Ext.fly(rowAndNode.row).removeClass('x-drop-target-active');
        }

        try {
            if (self.uploadDnDTip)
                self.uploadDnDTip.hide();

            if (e.preventDefault)
                e.preventDefault();
            if (e.stopPropagation)
                e.stopPropagation();
            if (window.event)
                window.event.returnValue = false;
            if (e.stopEvent)
                e.stopEvent();

            if (!e.dataTransfer || !(
                    (e.dataTransfer.items && e.dataTransfer.items.length > 0)
                    ||
                    (e.dataTransfer.files && e.dataTransfer.files.length > 0)
                )) {
                return false;
            }
            if (e.dataTransfer.items && (len = e.dataTransfer.items.length) > 0) {
                for (i = 0; i < len; i++) {
                    if (e.dataTransfer.items[i].kind == 'file') {
                        noFiles = false;
                        break;
                    }
                }
                if (noFiles)
                    return;
            }

            var allow = (!!rowAndNode && !!rowAndNode.node) ||
                (self.config.htcConfig.currentPerms && self.config.htcConfig.currentPerms.upload);
            if (allow && self.dndShare.isNotDnDUploading) {
                try {
                    self.config.showUploadWindow();
                } catch (err) {
                    self.config.ProcessScriptError(err);
                    return false;
                }
                if (self.config.getDragAndDropFormPanel()) {
                    self.config.getDragAndDropFormPanel().addFiles(
                        e.dataTransfer.items && e.dataTransfer.items.length > 0
                            ? e.dataTransfer.items : e.dataTransfer.files, false, rowAndNode);
                }
            }
        } catch (err) {
            self.config.ProcessScriptError(err);
        }

        return false;
    }
});