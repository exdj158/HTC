Ext.ns('HttpCommander.Lib');

/* config: htcConfig, getMenuActions(), getSelTypeFilesModel(), getGrid(),
    getCurrentFolder(), isExtensionAllowed(), createSelectedSet(),
    viewEditSubMenu, newSubMenu, shareSubMenu, moreSubMenu, unzipSubMenu, clipboard,
    initZipContent(), initMetadata(), isRecentFolder(), isTrashFolder(), isSharedTreeFolder(),
    toggleToolbarButtons, cloudsSubMenu, watchSubMenu, isAlertsFolder(),
    isSpecialTreeFolderOrSubFolder(), isSharedForYouTreeFolder(), initAndShowSelectFolder(),
    copyMenu, moveMenu, toggleToolbarButtons()
*/
HttpCommander.Lib.FileMenu = function (config) {
    var copyMoveToClipboard = function (isCut) {
        var curFolder = config.getCurrentFolder();
        config.clipboard.setItems(config.createSelectedSet(config.getGrid(), curFolder));
        config.clipboard.srcPath = curFolder;
        config.clipboard.isCut = isCut;
        config.toggleToolbarButtons();
    };
    var fileMenu = new Ext.menu.Menu({
        items:
        [
            {
                itemId: 'view-and-edit',
                text: config.htcConfig.locData.CommandSubMenuViewAndEdit,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'viewwith'),
                handler: function (item, e) { return false; },
                menu: config.viewEditSubMenu
            },
            {
                itemId: 'share',
                text: config.htcConfig.locData.CommandSubMenuShare,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'share'),
                handler: function (item, e) { return false; },
                menu: config.shareSubMenu
            },
            {
                itemId: 'cloud-storages',
                text: config.htcConfig.locData.CommandClouds,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'clouds'),
                handler: function (item, e) { return false; },
                menu: config.cloudsSubMenu
            },
            { itemId: 'download', text: config.htcConfig.locData.CommandDownload, icon: HttpCommander.Lib.Utils.getIconPath(config, 'download') },
            {
                itemId: 'new',
                text: config.htcConfig.locData.CommandNew,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'new'),
                handler: function (item, e) { return false; },
                menu: config.newSubMenu
            },
            { itemId: 'rename', text: config.htcConfig.locData.CommandRename, icon: HttpCommander.Lib.Utils.getIconPath(config, 'rename') },

            { itemId: 'empty', hidden: true, text: config.htcConfig.locData.TrashEmptyTrashLabel, icon: HttpCommander.Lib.Utils.getIconPath(config, 'emptytrash') },
            { itemId: 'delete', hidden: true, text: config.htcConfig.locData.CommandDelete, icon: HttpCommander.Lib.Utils.getIconPath(config, 'delete') },
            { itemId: 'sep-trash', hidden: true, xtype: 'menuseparator' },
            { itemId: 'restore-all', hidden: true, text: config.htcConfig.locData.TrashRestoreAllLabel, icon: HttpCommander.Lib.Utils.getIconPath(config, 'restoreall') },
            { itemId: 'restore', hidden: true, text: config.htcConfig.locData.TrashRestoreSelectedLabel, icon: HttpCommander.Lib.Utils.getIconPath(config, 'restore') },

            // copy (to clipboard, to..., menu)
            { itemId: 'copy', hidden: config.htcConfig.copyMoveToMode > 1, text: config.htcConfig.locData.CommandCopy + (config.htcConfig.copyMoveToMode == 1 ? (' (' + config.htcConfig.locData.CommandCopyCutClipboardSuffix + ')') : ''), icon: HttpCommander.Lib.Utils.getIconPath(config, 'copy') },
            { itemId: 'copy-to', hidden: config.htcConfig.copyMoveToMode != 0 && config.htcConfig.copyMoveToMode != 3, text: config.htcConfig.locData.CommandCopyTo, icon: HttpCommander.Lib.Utils.getIconPath(config, 'copy') },
            {
                itemId: 'copy-menu',
                hidden: config.htcConfig.copyMoveToMode != 2,
                text: config.htcConfig.locData.CommandCopy,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'copy'),
                handler: function (item, e) {
                    copyMoveToClipboard(false);
                    return false;
                },
                menu: config.copyMenu
            },
            // move, cut (to clipboard, to..., menu)
            { itemId: 'cut', hidden: config.htcConfig.copyMoveToMode > 1, text: config.htcConfig.locData.CommandCut + (config.htcConfig.copyMoveToMode == 1 ? (' (' + config.htcConfig.locData.CommandCopyCutClipboardSuffix + ')') : ''), icon: HttpCommander.Lib.Utils.getIconPath(config, 'cut') },
            { itemId: 'move-to', hidden: config.htcConfig.copyMoveToMode != 1 && config.htcConfig.copyMoveToMode != 3, text: config.htcConfig.locData.CommandMoveTo, icon: HttpCommander.Lib.Utils.getIconPath(config, 'cut') },
            {
                itemId: 'move-menu',
                hidden: config.htcConfig.copyMoveToMode != 2,
                text: config.htcConfig.locData.CommandCut,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'cut'),
                handler: function (item, e) {
                    copyMoveToClipboard(true);
                    return false;
                },
                menu: config.moveMenu
            },

            {
                itemId: 'paste',
                cls: 'x-badge-container',
                text: config.htcConfig.locData.CommandPaste,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'paste')
            },
            {
                itemId: 'paste-into',
                cls: 'x-badge-container',
                text: config.htcConfig.locData.CommandPasteInto + ' ',
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'paste')
            },
            { itemId: 'zip', text: config.htcConfig.locData.CommandZip, icon: HttpCommander.Lib.Utils.getIconPath(config, 'zip') },
            { itemId: 'zip-content', text: config.htcConfig.locData.CommandZipContents, icon: HttpCommander.Lib.Utils.getIconPath(config, 'unzip') },
            {
                itemId: 'unzip', text: config.htcConfig.locData.CommandUnzip, icon: HttpCommander.Lib.Utils.getIconPath(config, 'unzip'),
                handler: function (item, e) { return false; },
                menu: config.unzipSubMenu
            },
            { itemId: 'zip-download', text: config.htcConfig.locData.CommandZipDownload, icon: HttpCommander.Lib.Utils.getIconPath(config, 'zipdownload') },
            {
                itemId: 'label',
                text: config.htcConfig.locData.LabelsTitle,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'label'),
                handler: function (item, e) { return false; },
                menu: config.labelsMenu
            },
            { itemId: 'metadata', text: config.htcConfig.locData.CommandDetails, icon: HttpCommander.Lib.Utils.getIconPath(config, 'details') },
            {
                itemId: 'watchForModifs',
                text: config.htcConfig.locData.WatchForModifsCommand + '...',
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'watch'),
                handler: function (item, e) { return false; },
                menu: config.watchSubMenu
            },
            { itemId: 'stop-watch', hidden: true, text: config.htcConfig.locData.WatchForModifsStopCommand, icon: HttpCommander.Lib.Utils.getIconPath(config, 'stopwatch') },
            { itemId: 'edit-watch', hidden: true, text: config.htcConfig.locData.WatchForModifsEditCommand, icon: HttpCommander.Lib.Utils.getIconPath(config, 'edit') },
            { itemId: 'view-watch', hidden: true, text: config.htcConfig.locData.WatchForModifsViewChangesCommand, icon: HttpCommander.Lib.Utils.getIconPath(config, 'view') },
            {
                itemId: 'more',
                text: config.htcConfig.locData.CommandSubMenuMore,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'more'),
                handler: function (item, e) { return false; },
                menu: config.moreSubMenu
            },
            '-',
            { itemId: 'select-all', text: config.htcConfig.locData.CommandSelectAll, icon: HttpCommander.Lib.Utils.getIconPath(config, 'selectall') },
            { itemId: 'invert', text: config.htcConfig.locData.CommandInvertSelection, icon: HttpCommander.Lib.Utils.getIconPath(config, 'invert') }
        ],
        listeners: {
            beforeshow: function (menu) {
                if (config.isSharedForYouTreeFolder()) {
                    return false;
                }

                var curFolder = config.getCurrentFolder();
                var isTrash = config.isTrashFolder(curFolder);

                var selTFM = config.getSelTypeFilesModel(config.getGrid());
                var selModel = selTFM['selModel'];
                var totalCount = (isTrash
                    ? config.getGrid().getStore().getCount()
                    : config.getGrid().getStore().getTotalCount()) - (config.htcConfig.showUpLink ? 1 : 0);
                var row = selModel.getSelected();
                var rowData = row ? row.data : {};
                var selType = selTFM['selType'];
                var selFiles = selTFM['selFiles'];
                var selFolders = selTFM['selFolders'];

                var ext = selType == 'none' ? '' : HttpCommander.Lib.Utils.getFileExtension(rowData.name);
                var _ext_ = ';' + ext + ';';

                var viewEditVisible = config.viewEditSubMenu && config.viewEditSubMenu.onBeforeShowViewEditMenu(config.viewEditSubMenu, selTFM);
                var shareVisible = config.shareSubMenu && config.shareSubMenu.onBeforeShowShareMenu(config.shareSubMenu, selTFM);
                var watchVisible = config.watchSubMenu && config.watchSubMenu.onBeforeShowWatchMenu(config.watchSubMenu, selTFM);
                var moreVisible = config.moreSubMenu && config.moreSubMenu.onBeforeShowMoreMenu(config.moreSubMenu, selTFM);

                var labelsVisible = config.htcConfig.enabledLabels && config.htcConfig.currentPerms && config.htcConfig.currentPerms.modify;
                var labelsEnabled = selType != "empty" && selType != "none";

                var newVisible = config.htcConfig.currentPerms && config.htcConfig.currentPerms.create;
                var newEnabled = selType != "empty";

                var renameVisible = config.htcConfig.currentPerms && config.htcConfig.currentPerms.rename;
                var renameEnabled = selType == "file" || selType == "folder";

                var isRecent = config.isRecentFolder(curFolder);
                var deleteVisible = isRecent || isTrash || (config.htcConfig.currentPerms && config.htcConfig.currentPerms.del);
                var deleteEnabled = selType != "empty" && selType != "none";

                // Trash
                var visibleTrashItem = config.htcConfig.enableTrash && isTrash;
                var enableTrashItem = visibleTrashItem && selType != 'empty' && selType != 'none';

                // copy (cut) items and menus
                var baseCopyVisible = config.htcConfig.currentPerms && config.htcConfig.currentPerms.copy;
                var baseCutVisible = config.htcConfig.currentPerms && config.htcConfig.currentPerms.cut;
                var copyCutEnabled = selType != 'empty' && selType != 'none';
                var copyVisible = baseCopyVisible && config.htcConfig.copyMoveToMode < 2;
                var copyEnabled = copyCutEnabled;
                var cutVisible = baseCutVisible && config.htcConfig.copyMoveToMode < 2;
                var cutEnabled = copyCutEnabled;
                var copyToVisible = baseCopyVisible && (config.htcConfig.copyMoveToMode == 1 || config.htcConfig.copyMoveToMode == 3);
                var copyToEnabled = copyCutEnabled;
                var moveToVisible = baseCutVisible && (config.htcConfig.copyMoveToMode == 1 || config.htcConfig.copyMoveToMode == 3);
                var moveToEnabled = copyCutEnabled;
                var copyMenuVisible = baseCopyVisible && config.htcConfig.copyMoveToMode == 2;
                var copyMenuEnabled = copyCutEnabled;
                var moveMenuVisible = baseCutVisible && config.htcConfig.copyMoveToMode == 2;
                var moveMenuEnabled = copyCutEnabled;

                var pasteIntoVisible = config.htcConfig.currentPerms && (config.htcConfig.currentPerms.cut || config.htcConfig.currentPerms.copy) && selType == "folder" && config.clipboard.enabled && config.htcConfig.currentPerms.create;
                var pasteIntoText = selType == "folder" ? config.htcConfig.locData.CommandPasteInto + " '" + selModel.getSelected().data.name + "'" : config.htcConfig.locData.CommandPasteInto + ' ';

                var pasteVisible = config.htcConfig.currentPerms && (config.htcConfig.currentPerms.cut || config.htcConfig.currentPerms.copy) && config.htcConfig.currentPerms.create;
                var pasteEnabled = selType != "empty" && config.clipboard.enabled;

                var zipVisible = config.htcConfig.currentPerms && config.htcConfig.currentPerms.zip && config.isExtensionAllowed('.ZIP', true);
                var zipEnabled = selType != "empty" && selType != "none";

                var unzipVisible = config.htcConfig.currentPerms && config.htcConfig.currentPerms.unzip && selType == "file" && selModel.getSelected().data.name.toLowerCase().indexOf('.zip') != -1;
                var unzipEnabled = true;

                var downloadVisible = config.htcConfig.currentPerms && config.htcConfig.currentPerms.download;
                var downloadEnabled = selType != "empty" && selType != "none";
                var downloadText = selType == "file" ? config.htcConfig.locData.CommandDownload : config.htcConfig.locData.CommandDownload + "...";

                var zipDownloadVisible = config.htcConfig.currentPerms && config.htcConfig.currentPerms.zipDownload && (selType == "set" || selType == "folder");
                var zipDownloadEnabled = selType != "empty" && selType != "none";

                var downAllow = config.htcConfig.currentPerms && config.htcConfig.currentPerms.download
                    && (selFiles > 0 || selFolders > 0);
                var upAllow = config.htcConfig.currentPerms && config.htcConfig.currentPerms.upload;
                var allowDownToSkyDrive = config.htcConfig.enableDownloadToSkyDrive && config.htcConfig.isAllowedSkyDrive;
                var allowDownToDropbox = (config.htcConfig.enableDownloadToDropbox && (selFiles > 0 || selFolders > 0));
                var allowUpFromSkyDrive = config.htcConfig.enableUploadFromSkyDrive && config.htcConfig.isAllowedSkyDrive;
                var allowDownToBox = config.htcConfig.enableDownloadToBox && config.htcConfig.isAllowedBox;
                var allowUpFromBox = config.htcConfig.isAllowedBox && config.htcConfig.enableUploadFromBox;
                var cloudsVisible = (
                    (downAllow &&
                        ((config.htcConfig.enableDownloadToGoogle && config.htcConfig.isAllowedGoogleDrive) ||
                         allowDownToDropbox ||
                         allowDownToSkyDrive ||
                         allowDownToBox)
                    ) ||
                    (upAllow &&
                        ((config.htcConfig.enableUploadFromGoogle && config.htcConfig.isAllowedGoogleDrive) ||
                         (config.htcConfig.enableUploadFromDropbox && config.htcConfig.isAllowedDropbox) ||
                         allowUpFromSkyDrive ||
                         allowUpFromBox)
                    )
                );

                var metadataVisible = config.htcConfig.currentPerms && selModel.getCount() == 1;

                // items in 'Alerts' folder
                var isAlerts = config.isAlertsFolder(curFolder);
                var watchItemsEnabled = isAlerts && (selType == "file" || selType == "folder");

                fileMenu.getComponent('view-and-edit').setVisible(viewEditVisible);
                fileMenu.getComponent('view-and-edit').setDisabled(!viewEditVisible);

                fileMenu.getComponent('share').setVisible(shareVisible);
                fileMenu.getComponent('share').setDisabled(!shareVisible);

                fileMenu.getComponent('more').setVisible(moreVisible);
                fileMenu.getComponent('more').setDisabled(!moreVisible);

                fileMenu.getComponent('new').setVisible(newVisible);
                fileMenu.getComponent('new').setDisabled(!newVisible || !newEnabled);

                fileMenu.getComponent('cloud-storages').setVisible(cloudsVisible);
                fileMenu.getComponent('cloud-storages').setDisabled(!cloudsVisible);

                fileMenu.getComponent('rename').setVisible(renameVisible && renameEnabled);
                fileMenu.getComponent('rename').setDisabled(!renameVisible || !renameEnabled);

                fileMenu.getComponent('delete').setVisible(deleteVisible && (isTrash || deleteEnabled));
                fileMenu.getComponent('delete').setDisabled(!deleteVisible || !deleteEnabled);

                fileMenu.getComponent('copy').setVisible(copyVisible && copyEnabled);
                fileMenu.getComponent('copy').setDisabled(!copyVisible || !copyEnabled);
                fileMenu.getComponent('cut').setVisible(cutVisible && cutEnabled);
                fileMenu.getComponent('cut').setDisabled(!cutVisible || !cutEnabled);
                fileMenu.getComponent('copy-to').setVisible(copyToVisible && copyToEnabled);
                fileMenu.getComponent('copy-to').setDisabled(!copyToVisible || !copyToEnabled);
                fileMenu.getComponent('move-to').setVisible(moveToVisible && moveToEnabled);
                fileMenu.getComponent('move-to').setDisabled(!moveToVisible || !moveToEnabled);
                fileMenu.getComponent('copy-menu').setVisible(copyMenuVisible && copyMenuEnabled);
                fileMenu.getComponent('copy-menu').setDisabled(!copyMenuVisible || !copyMenuEnabled);
                fileMenu.getComponent('move-menu').setVisible(moveMenuVisible && moveMenuEnabled);
                fileMenu.getComponent('move-menu').setDisabled(!moveMenuVisible || !moveMenuEnabled);

                fileMenu.getComponent('paste').setVisible(pasteVisible && pasteEnabled);
                fileMenu.getComponent('paste').setDisabled(!pasteVisible || !pasteEnabled);

                fileMenu.getComponent('paste-into').setVisible(pasteIntoVisible);
                fileMenu.getComponent('paste-into').setDisabled(!pasteIntoVisible);
                fileMenu.getComponent('paste-into').setText(pasteIntoText, true);

                fileMenu.getComponent('zip').setVisible(zipVisible && zipEnabled);
                fileMenu.getComponent('zip').setDisabled(!zipVisible || !zipEnabled);

                fileMenu.getComponent('zip-content').setVisible(unzipVisible && unzipEnabled);
                fileMenu.getComponent('zip-content').setDisabled(!unzipVisible || !unzipEnabled);

                fileMenu.getComponent('unzip').setVisible(unzipVisible && unzipEnabled);
                fileMenu.getComponent('unzip').setDisabled(!unzipVisible || !unzipEnabled);

                fileMenu.getComponent('download').setVisible(downloadVisible && downloadEnabled);
                fileMenu.getComponent('download').setDisabled(!downloadVisible || !downloadEnabled);
                fileMenu.getComponent('download').setText(downloadText, true);

                fileMenu.getComponent('zip-download').setVisible(zipDownloadVisible && zipDownloadEnabled);
                fileMenu.getComponent('zip-download').setDisabled(!zipDownloadVisible || !zipDownloadEnabled);

                fileMenu.getComponent('label').setVisible(labelsVisible && labelsEnabled);
                fileMenu.getComponent('label').setDisabled(!labelsVisible || !labelsEnabled);

                fileMenu.getComponent('metadata').setVisible(metadataVisible);
                fileMenu.getComponent('metadata').setDisabled(!metadataVisible);

                fileMenu.getComponent('watchForModifs').setVisible(watchVisible);
                fileMenu.getComponent('watchForModifs').setDisabled(!watchVisible);

                // Trash
                fileMenu.getComponent('empty').setVisible(visibleTrashItem || selType == 'trashroot');
                fileMenu.getComponent('empty').setDisabled(!(visibleTrashItem || selType == 'trashroot'));
                fileMenu.getComponent('restore-all').setVisible(visibleTrashItem);
                fileMenu.getComponent('restore-all').setDisabled(!visibleTrashItem || totalCount <= 0);
                fileMenu.getComponent('restore').setVisible(visibleTrashItem);
                fileMenu.getComponent('restore').setDisabled(!enableTrashItem);
                fileMenu.getComponent('sep-trash').setVisible(visibleTrashItem);

                // Watches in alerts folder
                fileMenu.getComponent('stop-watch').setVisible(isAlerts);
                fileMenu.getComponent('stop-watch').setDisabled(!watchItemsEnabled);
                fileMenu.getComponent('edit-watch').setVisible(isAlerts && config.htcConfig.watchSend);
                fileMenu.getComponent('edit-watch').setDisabled(!config.htcConfig.watchSend || !watchItemsEnabled);
                fileMenu.getComponent('view-watch').setVisible(isAlerts);
                fileMenu.getComponent('view-watch').setDisabled(!watchItemsEnabled);
            },
            itemclick: function (item) {
                switch (item.itemId) {
                    case 'select-all':
                        config.getMenuActions().selectAll(config.getGrid());
                        break;
                    case 'invert':
                        config.getMenuActions().invertSelection(config.getGrid());
                        break;
                    case 'empty':
                        config.getMenuActions().deleteSelectedItems(true);
                        break;
                    case 'restore':
                        config.getMenuActions().restoreTrashedItems();
                        break;
                    case 'restore-all':
                        config.getMenuActions().restoreTrashedItems(true);
                        break;
                    case 'delete':
                        config.getMenuActions().deleteSelectedItems();
                        break;
                    case 'zip':
                        config.getMenuActions().zip();
                        break;
                    case 'zip-content':
                        config.getMenuActions().zipContent(config.initZipContent);
                        break;
                    case 'zip-download':
                        config.getMenuActions().zipDownload();
                        break;
                    case 'download':
                        config.getMenuActions().downloadSelectedItems();
                        break;
                    case 'rename':
                        config.getMenuActions().renameSelectedItem();
                        break;
                    case 'copy-to':
                    case 'move-to':
                        var action = item.itemId.substring(0, 4);
                        var move = (action == 'move');
                        var curFolder = config.getCurrentFolder();
                        copyMoveToClipboard(move);
                        config.initAndShowSelectFolder(curFolder, action);
                        break;
                    case 'copy':
                    case 'cut':
                        copyMoveToClipboard(item.itemId == 'cut');
                        break;
                    case 'paste':
                    case 'paste-into':
                        config.getMenuActions().paste(item.itemId == 'paste-into', config.clipboard);
                        break;
                    case 'metadata':
                        config.getMenuActions().viewChangeDetails(config.initMetadata);
                        break;
                    // watch
                    case 'stop-watch':
                        config.getMenuActions().stopWatch();
                        break;
                    case 'edit-watch':
                        config.getMenuActions().editWatch();
                        break;
                    case 'view-watch':
                        config.getMenuActions().viewWatch();
                        break;
                }
            }
        }
    });
    return fileMenu;
};
