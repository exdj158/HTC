Ext.ns('HttpCommander.Lib');

/* config: htcConfig, getMenuActions(), getSelTypeFilesModel(), getSharedGrid(),
    getCurrentFolder(), createSelectedSet(), toggleToolbarButtons, Msg, showBalloon()
*/
HttpCommander.Lib.AnonymContextMenu = function (config) {
    var fileMenu = new Ext.menu.Menu({
        items:
        [
            { itemId: 'copy-link', text: config.htcConfig.locData.CommandCopyLinkToClipboard, icon: HttpCommander.Lib.Utils.getIconPath(config, 'copy') },
            { itemId: 'edit', hidden: true, text: config.htcConfig.locData.CommandMenuEdit, icon: HttpCommander.Lib.Utils.getIconPath(config, 'edit') },
            { itemId: 'delete', hidden: true, text: config.htcConfig.locData.CommandDelete, icon: HttpCommander.Lib.Utils.getIconPath(config, 'delete') },
            '-',
            { itemId: 'select-all', text: config.htcConfig.locData.CommandSelectAll, icon: HttpCommander.Lib.Utils.getIconPath(config, 'selectall') },
            { itemId: 'invert', text: config.htcConfig.locData.CommandInvertSelection, icon: HttpCommander.Lib.Utils.getIconPath(config, 'invert') }
        ],
        listeners: {
            beforeshow: function (menu) {
                var sharedGrid = config.getSharedGrid();
                if (!sharedGrid) {
                    return false;
                }
                var selTFM = config.getSelTypeFilesModel(sharedGrid),
                    selModel = selTFM['selModel'],
                    totalCount = sharedGrid.getStore().getTotalCount(),
                    row = selModel.getSelected(),
                    rowData = row ? row.data : {},
                    selType = selTFM['selType'],
                    selFiles = selTFM['selFiles'],
                    selFolders = selTFM['selFolders'],
                    ext = (selType == 'none' ? '' : HttpCommander.Lib.Utils.getFileExtension(rowData.name)),
                    _ext_ = ';' + ext + ';',
                    editDelEnabled = (selType != "empty" && selType != "none"),
                    editItem = fileMenu.getComponent('edit'),
                    delItem = fileMenu.getComponent('delete'),
                    copyItem = fileMenu.getComponent('copy-link'),
                    copyVisible = HttpCommander.Lib.Utils.browserIs.copyToClipboard,
                    copyEnabled = copyVisible && (selType == "file" || selType == "folder");

                if (copyEnabled) {
                    copyEnabled = !Ext.isEmpty(row.get('shortUrl2') || row.get('shortUrl') || row.get('url2') || row.get('url'));
                }

                editItem.setVisible(true);
                editItem.setDisabled(!editDelEnabled);
                delItem.setVisible(true);
                delItem.setDisabled(!editDelEnabled);
                copyItem.setVisible(copyVisible);
                copyItem.setDisabled(!copyEnabled);
            },
            itemclick: function (item) {
                var sharedGrid = config.getSharedGrid();
                if (!sharedGrid) {
                    return;
                }
                switch (item.itemId) {
                    case 'copy-link':
                        var lnk, row = sharedGrid.getSelectionModel().getSelected();
                        if (!!row) {
                            lnk = row.get('shortUrl2') || row.get('shortUrl')
                                || row.get('url2') || row.get('url');
                            var res = HttpCommander.Lib.Utils.copyTextToClipboard(lnk);
                            if (res === true) {
                                config.showBalloon(config.htcConfig.locData.BalloonCopiedToClipboard);
                            } else {
                                config.Msg.show({
                                    title: config.htcConfig.locData.BalloonCopyToClipboardFailed,
                                    msg: Ext.util.Format.htmlEncode(!Ext.isBoolean(res) && !!res ? res.toString() : config.htcConfig.locData.BalloonCopyToClipboardFailed),
                                    icon: config.Msg.ERROR,
                                    buttons: config.Msg.OK
                                });
                            }
                        }
                        break;
                    case 'select-all':
                        config.getMenuActions().selectAll(sharedGrid);
                        break;
                    case 'invert':
                        config.getMenuActions().invertSelection(sharedGrid);
                        break;
                    case 'edit':
                        if (Ext.isFunction(sharedGrid.openEditPublicLink)) {
                            sharedGrid.openEditPublicLink(sharedGrid);
                        }
                        break;
                    case 'delete':
                        config.getMenuActions().deleteSelectedAnonymLinks(sharedGrid);
                        break;
                }
            }
        }
    });
    return fileMenu;
};
