Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, getIsEmbeddedtoIFRAME(), getEmbedded(),
    getRenderers(), 
    getCurrentFolder(), initAndShowUnzipPromptWindow()
*/
HttpCommander.Lib.ZipContentWindow = function(config) {
    var zipFileInfo, zipContentTree;
    var self = new config.Window({
        title: '',
        plain: true,
        buttonAlign: 'center',
        autoDestroy: true,
        boxMinHeight: 250,
        boxMinWidth: config.getIsEmbeddedtoIFRAME() ? 350 : 400,
        layout: 'fit',
        border: false,
        resizable: true,
        closeAction: 'hide',
        maximizable: !config.getEmbedded(), //true,
        width: config.getIsEmbeddedtoIFRAME() ? 450 : 500,
        height: config.getIsEmbeddedtoIFRAME() ? 250 : 300,
        items:
        [
            zipFileInfo = new Ext.form.Hidden({
                hidden: true
            }),
            zipContentTree = new Ext.tree.TreePanel({
                useArrows: true,
                totalNodes: 0,
                autoScroll: true,
                header: false,
                rootVisible: false,
                lines: false,
                forceLayout: true,
                existsCryptedNodes: false,
                loader: new Ext.tree.TreeLoader(),
                root: { itemId: 'root-zip-content' },
                tbar: new Ext.Toolbar({
                    items:
                    [
                        {
                            xtype: 'checkbox',
                            itemId: 'unzip-contnet-ignore-paths',
                            boxLabel: config.htcConfig.locData.UploadJavaIgnorePaths
                        }
                    ]
                }),
                bbar: new Ext.Toolbar({
                    items:
                    [
                        {
                            xtype: 'label',
                            itemId: 'unzip-contnet-files-info',
                            html: String.format(config.htcConfig.locData.UnzipContentTotalFiles, '0', '0 bytes')
                        }
                    ]
                }),
                listeners: {
                    load: function(node) {
                        zipContentTree.existsCryptedNodes = false;
                        Ext.each(node.childNodes, function(el) {
                            if (typeof el.attributes.size !== 'undefined')
                                el.text = el.attributes.text + ' ('
                                    + config.getRenderers().sizeRenderer(el.attributes.size) + ')';
                            if (el.attributes.crypted === true) {
                                el.text += '&nbsp;<img alt="" src="' + HttpCommander.Lib.Utils.getIconPath(config,'lock')+'" class="filetypeimage" />';
                                zipContentTree.existsCryptedNodes = true;
                            }
                            if (config.htcConfig.relativePath != ''
                                && typeof el.attributes.icon !== 'undefined')
                                el.attributes.icon = config.htcConfig.relativePath + el.attributes.icon;
                        });
                    }
                }
            })
        ],
        buttons:
        [
            {
                itemId: 'unzip-sel-button',
                text: config.htcConfig.locData.CommandUnzipSelected,
                disabled: true,
                handler: function(btn, evt) { self.unzipContents(zipFileInfo.value); }
            },
            {
                itemId: 'unzip-all-button',
                disabled: true,
                text: config.htcConfig.locData.CommandUnzipAll,
                handler: function(btn, evt) { self.unzipContents(zipFileInfo.value, true); }
            },
            {
                text: config.htcConfig.locData.CommonButtonCaptionClose,
                handler: function() { self.hide(); }
            }
        ],
        listeners: {
            afterrender: function(selfWin) {
                if (zipContentTree) {
                    zipContentTree.on('checkchange', selfWin.checkChangeZipContentList, selfWin);
                }
            },
            hide: function(win) {
                zipFileInfo.setValue('');
                zipContentTree.totalNodes = 0;
                zipContentTree.setRootNode(new Ext.tree.AsyncTreeNode({
                    itemId: 'root-zip-content',
                    expanded: false,
                    children: []
                }));
                win.setTitle('');
            },
            beforeshow: function(win) {
                var btn = self.buttons[1];
                if (btn) {
                    btn.setDisabled(true);
                    if (config.htcConfig && config.htcConfig.currentPerms
                        && config.htcConfig.currentPerms.unzip && zipContentTree.totalNodes > 0)
                        btn.setDisabled(false);
                }
            },
            bodyresize: function(p, w, h) {
                zipContentTree.setHeight(h);
                zipContentTree.setWidth(w);
            }
        },
        checkChangeZipContentList: function(node, checked) {
            zipContentTree.un('checkchange', self.checkChangeZipContentList, self);
            HttpCommander.Lib.Utils.recursiveCheckTreeChildNodes(node, checked);
            HttpCommander.Lib.Utils.recursiveCheckTreeParentNodes(node, checked);
            zipContentTree.on('checkchange', self.checkChangeZipContentList, self);
            self.changeZipContentInfoFiles();
            self.buttons[0].setDisabled(zipContentTree.getChecked().length == 0);
        },
        unzipContents: function(unzipInfo, unzipAll) {
            unzipAll = unzipAll || false;
            var curFolder = config.getCurrentFolder();
            unzipInfo["extractPath"] = curFolder;
            var ignorePaths = zipContentTree.getTopToolbar().getComponent('unzip-contnet-ignore-paths');
            if (ignorePaths)
                unzipInfo["ignorePaths"] = ignorePaths.getValue();
            var crypted = zipContentTree.existsCryptedNodes;
            var checkedNodes = zipContentTree.getChecked();
            if (!unzipAll)
                unzipAll = checkedNodes.length == zipContentTree.totalNodes;
            unzipInfo["all"] = unzipAll;
            if (!unzipAll) {
                var entryArray = [];
                crypted = false;
                Ext.each(checkedNodes, function(node) {
                    if (node.attributes.file === true)
                        entryArray.push(node.attributes.path);
                    if (!crypted && node.attributes.crypted === true)
                        crypted = true;
                });
                unzipInfo["entries"] = eval(Ext.util.JSON.encode(entryArray));
            }
            unzipInfo['crypted'] = crypted;
            unzipInfo['password'] = null;

            config.initAndShowUnzipPromptWindow(unzipInfo);
        },
        changeZipContentInfoFiles: function() {
            var lblInfo = zipContentTree.getBottomToolbar().getComponent('unzip-contnet-files-info');
            if (lblInfo) {
                var count = 0, size = 0;
                var checkedNodes = zipContentTree.getChecked();
                Ext.each(checkedNodes, function(node) {
                    if (node.attributes.file) {
                        count++;
                        size += parseInt(node.attributes.size);
                    }
                });
                lblInfo.setText(String.format(config.htcConfig.locData.UnzipContentTotalFiles,
                    count,
                    config.getRenderers().sizeRenderer(String(size))),
                    true
                );
            }
        },
        setZipFileInfo: function(info) {
            zipFileInfo.setValue(info);
        },
        setContentTree: function(totalNodes, nodes) {
            zipContentTree.totalNodes = totalNodes;
            zipContentTree.setRootNode(new Ext.tree.AsyncTreeNode({
                itemId: 'root-zip-content',
                expanded: true,
                children: nodes
            }));
        }
    });
    return self;
};