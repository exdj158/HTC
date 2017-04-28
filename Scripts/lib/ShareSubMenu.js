Ext.ns('HttpCommander.Lib');

/**
 *  config: htcConfig, getMenuActions(), getSelTypeFilesModel(), getGrid(),
 *  getCurrentFolder(), virtualFilePath(), prepareAndShowLinkToFileFolderWindow(),
 *  prepareAndShowMakePublicLinkWindow(), initSendEmail(), isRecentFolder(), isTrashFolder(), isAlertsFolder()
 */
HttpCommander.Lib.ShareSubMenu = function (config) {
    var shareSubMenu = new Ext.menu.Menu({
        items:
        [
            { itemId: 'link', text: config.htcConfig.locData.CommandLinkToFile, icon: HttpCommander.Lib.Utils.getIconPath(config, 'linktofile') },
            { itemId: 'share-folder', text: config.htcConfig.locData.CommandMakePublicFolder, icon: HttpCommander.Lib.Utils.getIconPath(config, 'sharefolder') },
            { itemId: 'send-email', text: config.htcConfig.locData.CommandSendEmail, icon: HttpCommander.Lib.Utils.getIconPath(config, 'sendemail') },
            { itemId: 'send-gmail', text: config.htcConfig.locData.CommandSendWithGmail, icon: HttpCommander.Lib.Utils.getIconPath(config, 'gmail') },
            { itemId: 'send-outlook', text: config.htcConfig.locData.CommandSendWithOutlook, icon: HttpCommander.Lib.Utils.getIconPath(config, 'outlook') }
        ],
        listeners: {
            beforeshow: function (cmp) {
                shareSubMenu.onBeforeShowShareMenu(cmp, config.getSelTypeFilesModel(config.getGrid()));
            },
            itemclick: function (item) {
                switch (item.itemId) {
                    case 'link':
                        config.getMenuActions().linkToFileFolder();
                        break;
                    case 'share-folder':
                        config.getMenuActions().shareFolder(config.virtualFilePath, config.prepareAndShowMakePublicLinkWindow);
                        break;
                    case 'send-email':
                        config.getMenuActions().sendEmail();
                        break;
                    case 'send-gmail':
                        config.getMenuActions().sendEmailWithService('gmail');
                        break;
                    case 'send-outlook':
                        config.getMenuActions().sendEmailWithService('outlook');
                        break;
                }
            }
        },
        onBeforeShowShareMenu: function (menu, selTypeFilesModel) {
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

            var ext = selType == 'none' ? '' : HttpCommander.Lib.Utils.getFileExtension(rowData.name);
            var _ext_ = ';' + ext + ';';

            var fileSize = (rowData.size || 0);

            var linkToFileFolderVisible = config.htcConfig.currentPerms &&
            (
                ((selType == "folder" || selType == "none") && config.htcConfig.enableLinkToFolder === true)
                ||
                (config.htcConfig.currentPerms.download && selType == "file" && config.htcConfig.enableLinkToFile === true)
            );
            var shareFolderVisible = config.htcConfig.currentPerms &&
            (
                (
                    selType == "file"
                    && config.htcConfig.enablePublicLinkToFile === true
                    && config.htcConfig.currentPerms.download
                    && config.htcConfig.currentPerms.anonymDownload
                )
                ||
                (
                    (selType == "folder" || selType == "none")
                    &&
                    config.htcConfig.enablePublicLinkToFolder === true
                    &&
                    (
                        (
                            (config.htcConfig.currentPerms.download || config.htcConfig.currentPerms.zipDownload)
                            &&
                            config.htcConfig.currentPerms.anonymDownload
                        )
                        ||
                        (config.htcConfig.currentPerms.upload && config.htcConfig.currentPerms.anonymUpload)
                        ||
                        (
                            (config.htcConfig.currentPerms.listFiles || config.htcConfig.currentPerms.listFolders)
                            &&
                            config.htcConfig.currentPerms.anonymViewContent
                        )
                    )
                )
            );
            var sendEmailVisible = config.htcConfig.enableSendEmail != "disable";
            var sendGmailOutlookVisile = sendEmailVisible &&
                (config.htcConfig.enableSendEmail == 'any' || config.htcConfig.enableSendEmail == 'linksonly');
            var shareVisible =
                   linkToFileFolderVisible
                || shareFolderVisible
                || sendEmailVisible
                || sendGmailOutlookVisile;

            menu.getComponent('link').setVisible(linkToFileFolderVisible);
            menu.getComponent('link').setDisabled(!linkToFileFolderVisible);
            menu.getComponent('share-folder').setVisible(shareFolderVisible);
            menu.getComponent('share-folder').setDisabled(!shareFolderVisible);
            menu.getComponent('send-email').setVisible(sendEmailVisible);
            menu.getComponent('send-email').setDisabled(!sendEmailVisible);
            menu.getComponent('send-gmail').setVisible(sendGmailOutlookVisile);
            menu.getComponent('send-gmail').setDisabled(!sendGmailOutlookVisile);
            menu.getComponent('send-outlook').setVisible(sendGmailOutlookVisile);
            menu.getComponent('send-outlook').setDisabled(!sendGmailOutlookVisile);

            return shareVisible;
        }
    });
    return shareSubMenu;
};