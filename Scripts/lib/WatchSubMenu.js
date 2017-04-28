Ext.ns('HttpCommander.Lib');

/**
 *  config: htcConfig, getMenuActions(), getSelTypeFilesModel(), getGrid(),
 *  getCurrentFolder(), initAndShowWatchModifsWindow(), isSpecialTreeFolderOrSubFolder()
 */
HttpCommander.Lib.WatchSubMenu = function (config) {
    var watchSubMenu = new Ext.menu.Menu({
        items:
        [
            { itemId: 'start', text: config.htcConfig.locData.WatchForModifsStartCommand, icon: HttpCommander.Lib.Utils.getIconPath(config, 'watch') },
            { itemId: 'stop', text: config.htcConfig.locData.WatchForModifsStopCommand, icon: HttpCommander.Lib.Utils.getIconPath(config, 'stopwatch') },
            { itemId: 'edit', text: config.htcConfig.locData.WatchForModifsEditCommand, icon: HttpCommander.Lib.Utils.getIconPath(config, 'edit') },
            { itemId: 'view', text: config.htcConfig.locData.WatchForModifsViewChangesCommand, icon: HttpCommander.Lib.Utils.getIconPath(config, 'view') }
        ],
        listeners: {
            beforeshow: function (cmp) {
                watchSubMenu.onBeforeShowWatchMenu(cmp, config.getSelTypeFilesModel(config.getGrid()));
            },
            itemclick: function (item) {
                switch (item.itemId) {
                    case 'start':
                        config.getMenuActions().addWatch();
                        break;
                    case 'stop':
                        config.getMenuActions().stopWatch();
                        break;
                    case 'view':
                        config.getMenuActions().viewWatch();
                        break;
                    case 'edit':
                        config.getMenuActions().editWatch();
                        break;
                }
            }
        },
        onBeforeShowWatchMenu: function (menu, selTypeFilesModel, fromToolbar) {
            var selModel = selTypeFilesModel['selModel'],
                row = selModel.getSelected(),
                rowData = row ? row.data : {},
                selType = selTypeFilesModel['selType'],
                selFiles = selTypeFilesModel['selFiles'],
                watchState = rowData.watchForModifs,
                allowWatch = (!!config.htcConfig.currentPerms && config.htcConfig.currentPerms.watchForModifs),
                enabled = ((Ext.isEmpty(rowData.srowtype) && allowWatch) || (fromToolbar && rowData.srowtype == 'alert')) &&
                    (selType == 'file' || selType == 'folder' || selType == 'rootfolder'),
                startItem, stopItem, viewItem, editItem;

            startItem = menu.getComponent('start');
            stopItem = menu.getComponent('stop');
            viewItem = menu.getComponent('view');
            editItem = menu.getComponent('edit');

            if (!watchState) {
                startItem.setVisible(!fromToolbar);
                startItem.setDisabled(fromToolbar);
                stopItem.setVisible(false);
                stopItem.setDisabled(true);
                viewItem.setVisible(false);
                viewItem.setDisabled(true);
                editItem.setVisible(false);
                editItem.setDisabled(true);
            } else if (Ext.isObject(watchState)) {
                startItem.setVisible(false);
                startItem.setDisabled(true);
                stopItem.setVisible(true);
                stopItem.setDisabled(false);
                viewItem.setVisible(true);
                viewItem.setDisabled(false);
                editItem.setVisible(config.htcConfig.watchSend);
                editItem.setDisabled(!config.htcConfig.watchSend);
            } else {
                startItem.setVisible(false);
                startItem.setDisabled(true);
                stopItem.setVisible(false);
                stopItem.setDisabled(true);
                viewItem.setVisible(true);
                viewItem.setDisabled(false);
                editItem.setVisible(false);
                editItem.setDisabled(true);
            }

            return enabled;
        }
    });
    return watchSubMenu;
};