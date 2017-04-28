Ext.ns('HttpCommander.Lib');

/**
 *  config: htcConfig, getSelTypeFilesModel(), getGrid(),
 *  getCurrentFolder(), isTrashFolder(), getMenuActions()
 */
HttpCommander.Lib.TrashSubMenu = function (config) {
    var trashSubMenu = new Ext.menu.Menu({
        items:
        [
            { itemId: 'empty', text: config.htcConfig.locData.TrashEmptyTrashLabel, icon: HttpCommander.Lib.Utils.getIconPath(config, 'emptytrash') },
            { itemId: 'delete', text: config.htcConfig.locData.CommandDelete, icon: HttpCommander.Lib.Utils.getIconPath(config, 'delete') },
            '-',
            { itemId: 'restore-all', text: config.htcConfig.locData.TrashRestoreAllLabel, icon: HttpCommander.Lib.Utils.getIconPath(config, 'restoreall') },
            { itemId: 'restore', text: config.htcConfig.locData.TrashRestoreSelectedLabel, icon: HttpCommander.Lib.Utils.getIconPath(config, 'restore') }
        ],
        listeners: {
            beforeshow: function (cmp) {
                trashSubMenu.onBeforeShowTrashMenu(cmp, config.getSelTypeFilesModel(config.getGrid()));
            },
            itemclick: function (item) {
                switch (item.itemId) {
                    case 'empty':
                        config.getMenuActions().deleteSelectedItems(true);
                        break;
                    case 'delete':
                        config.getMenuActions().deleteSelectedItems();
                        break;
                    case 'restore-all':
                        config.getMenuActions().restoreTrashedItems(true);
                        break;
                    case 'restore':
                        config.getMenuActions().restoreTrashedItems();
                        break;
                }
            }
        },
        onBeforeShowTrashMenu: function (menu, selTypeFilesModel) {
            var curFolder = config.getCurrentFolder();
            if (!config.htcConfig.enableTrash)
                return false;

            var isTrashFolder = config.isTrashFolder(curFolder);

            var selModel = selTypeFilesModel['selModel'];
            var row = selModel.getSelected();
            var rowData = row ? row.data : {};
            var selType = selTypeFilesModel['selType'];
            var selFiles = selTypeFilesModel['selFiles'];

            var selected = (selType != 'empty' && selType != 'none');

            menu.getComponent('empty').setVisible(true);
            menu.getComponent('empty').setDisabled(false);
            menu.getComponent('restore-all').setVisible(true);
            menu.getComponent('restore-all').setDisabled(!isTrashFolder);
            menu.getComponent('delete').setVisible(true);
            menu.getComponent('delete').setDisabled(!isTrashFolder || !selected);
            menu.getComponent('restore').setVisible(true);
            menu.getComponent('restore').setDisabled(!isTrashFolder || !selected);

            return true;
        }
    });
    return trashSubMenu;
};