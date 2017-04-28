Ext.ns('HttpCommander.Lib');

/* config: htcConfig, getMenuActions(), getSelTypeFilesModel(), getGrid(),
    getCurrentFolder(), initVersionHistory(), initCheckInWindow(),
    isTrashFolder(), isRecentFolder()
*/
HttpCommander.Lib.VersioningSubMenu = function(config) {
    var versioningSubMenu = new Ext.menu.Menu({
        items:
        [
            { itemId: 'version-history', text: config.htcConfig.locData.CommandVersionHistory, icon: HttpCommander.Lib.Utils.getIconPath(config, 'verhist') },
            '-',
            { itemId: 'check-out', text: config.htcConfig.locData.CommandCheckOut, icon: HttpCommander.Lib.Utils.getIconPath(config, 'checkout') },
            { itemId: 'check-in', text: config.htcConfig.locData.CommandCheckIn, icon: HttpCommander.Lib.Utils.getIconPath(config, 'checkin') },
            { itemId: 'undo-check-out', text: config.htcConfig.locData.CommandUndoCheckOut, icon: HttpCommander.Lib.Utils.getIconPath(config, 'undocout') }
        ],
        listeners: {
            itemclick: function(item) {
                if (config.htcConfig.enableVersionControl) {
                    var selectedRecord = config.getGrid().getSelectionModel().getSelected();
                    if (selectedRecord.data.rowtype === 'file') {
                        var fileInfo = { path: config.getCurrentFolder(), name: selectedRecord.data.name };
                        switch (item.itemId) {
                            case 'version-history':
                                var versionHistoryWindow = config.initVersionHistory(fileInfo);
                                if (versionHistoryWindow) {
                                    config.getMenuActions().versionHistory(fileInfo, versionHistoryWindow);
                                }
                                break;
                            case 'check-out':
                                config.getMenuActions().checkOut(fileInfo);
                                break;
                            case 'check-in':
                                var checkInWindow = config.initCheckInWindow(fileInfo);
                                if (checkInWindow) {
                                    checkInWindow.setTitle(config.htcConfig.locData.CommandCheckIn 
                                        + ' "' + Ext.util.Format.htmlEncode(fileInfo.name) + '"');
                                    checkInWindow.show();
                                }
                                break;
                            case 'undo-check-out':
                                config.getMenuActions().undoCheckOut(fileInfo);
                                break;
                        }
                    }
                }
            },
            beforeshow: function () {
                var curFolder = config.getCurrentFolder();
                if (config.isRecentFolder(curFolder) || config.isTrashFolder(curFolder))
                    return false;

                var selTFM = config.getSelTypeFilesModel(config.getGrid());
                var selModel = selTFM['selModel'];

                var vhistEnable = false;
                var baseCheckInOut = config.htcConfig.currentPerms && config.htcConfig.currentPerms.modify;
                var checkOutEnable = false;
                var checkInEnable = false;
                var curRow = selModel.getSelected().data;
                if (curRow) {
                    var vstate = curRow.vstate || 0;
                    vhistEnable = (vstate & 4);
                    checkOutEnable = baseCheckInOut && !(vstate & 1);
                    checkInEnable = baseCheckInOut && !checkOutEnable && (vstate & 2);
                }
                versioningSubMenu.getComponent('check-out').setDisabled(!checkOutEnable);
                versioningSubMenu.getComponent('check-in').setDisabled(!checkInEnable);
                versioningSubMenu.getComponent('undo-check-out').setDisabled(!checkInEnable);
            }
        }
    });
    return versioningSubMenu;
};