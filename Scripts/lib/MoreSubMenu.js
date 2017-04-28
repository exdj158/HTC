Ext.ns('HttpCommander.Lib');

/**
 *  config: htcConfig, getMenuActions(), getSelTypeFilesModel(), getGrid(),
 *  getCurrentFolder(), prepareAndShowlinksToWebFoldersWindow(),
 *  initAndShowSyncWebFoldersHelpWindow(), versioningSubMenu,
 *  isRecentFolder(), isTrashFolder(), isAlertsFolder()
 */
HttpCommander.Lib.MoreSubMenu = function (config) {
    var moreSubMenu = new Ext.menu.Menu({
        items:
        [
            { itemId: 'web-folders', text: config.htcConfig.locData.CommandWebFoldersLinks, icon: HttpCommander.Lib.Utils.getIconPath(config, 'webfolders') },
            { itemId: 'sync-web-folders', text: config.htcConfig.locData.CommandSyncWebFolders, icon: HttpCommander.Lib.Utils.getIconPath(config, 'syncwebfolders') },
            {
                itemId: 'versioning', text: config.htcConfig.locData.CommandVersioning, icon: HttpCommander.Lib.Utils.getIconPath(config, 'versioning'),
                handler: function (item, e) { return false; },
                menu: config.versioningSubMenu
            }
        ],
        listeners: {
            beforeshow: function (cmp) {
                moreSubMenu.onBeforeShowMoreMenu(cmp, config.getSelTypeFilesModel(config.getGrid()));
            },
            itemclick: function (item) {
                switch (item.itemId) {
                    case 'web-folders':
                        config.getMenuActions().webFolders(config.prepareAndShowlinksToWebFoldersWindow);
                        break;
                    case 'sync-web-folders':
                        config.getMenuActions().syncWebFolders(config.initAndShowSyncWebFoldersHelpWindow);
                        break;
                }
            }
        },
        onBeforeShowMoreMenu: function (menu, selTypeFilesModel) {
            var curFolder = config.getCurrentFolder();
            if (config.isRecentFolder(curFolder) || config.isTrashFolder(curFolder) || config.isAlertsFolder(curFolder))
                return false;

            var selModel = selTypeFilesModel['selModel'];
            var row = selModel.getSelected();
            var rowData = row ? row.data : {};
            var selType = selTypeFilesModel['selType'];
            var selFiles = selTypeFilesModel['selFiles'];

            if (selType == 'trashroot')
                return false;

            var linksToWebFolders = config.htcConfig.enableWebFoldersLinks && config.htcConfig.hcAuthMode != 'shibboleth';
            var syncWithLocalFolderVisible = linksToWebFolders && config.htcConfig.showSyncWithLocalFolderInfo;
            var verCtrlVisible = config.htcConfig.enableVersionControl && selType == "file" && selFiles == 1;
            var moreVisible =
                   linksToWebFolders
                || syncWithLocalFolderVisible
                || verCtrlVisible;

            menu.getComponent('web-folders').setVisible(linksToWebFolders);
            menu.getComponent('web-folders').setDisabled(!linksToWebFolders);
            menu.getComponent('sync-web-folders').setVisible(syncWithLocalFolderVisible);
            menu.getComponent('sync-web-folders').setDisabled(!syncWithLocalFolderVisible);
            menu.getComponent('versioning').setVisible(verCtrlVisible);
            menu.getComponent('versioning').setDisabled(!verCtrlVisible);

            return moreVisible;
        }
    });
    return moreSubMenu;
};