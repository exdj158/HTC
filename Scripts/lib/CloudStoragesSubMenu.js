Ext.ns('HttpCommander.Lib');

/**
 *  config: htcConfig, getSelTypeFilesModel(), getGrid(),
 *  showUploadWindow(), showHelpWindow(), downloadToGoogle(),
 *  downloadToDropbox(), downloadToSkyDrive(), downloadToBox(),
 *  getCurrentFolder(), isRecentFolder(), isTrashFolder(), isAlertsFolder()
 */
HttpCommander.Lib.CloudStoragesSubMenu = function (config) {
    var cds = {
        'Google': {
            name: HttpCommander.Lib.Consts.CloudNames.google,
            icon: 'googledocs',
            down: config.htcConfig.isAllowedGoogleDrive && config.htcConfig.enableDownloadToGoogle,
            up: config.htcConfig.isAllowedGoogleDrive && config.htcConfig.enableUploadFromGoogle
        },
        'Dropbox': {
            name: HttpCommander.Lib.Consts.CloudNames.dropbox,
            icon: 'dropbox',
            down: config.htcConfig.isAllowedDropbox && config.htcConfig.enableDownloadToDropbox,
            up: config.htcConfig.isAllowedDropbox && config.htcConfig.enableUploadFromDropbox
        },
        'SkyDrive': {
            name: HttpCommander.Lib.Consts.CloudNames.onedrive,
            icon: 'skydrive',
            down: (config.htcConfig.isAllowedSkyDrive && config.htcConfig.enableDownloadToSkyDrive),
            up: (config.htcConfig.isAllowedSkyDrive && config.htcConfig.enableUploadFromSkyDrive)
        },
        'Box': {
            name: HttpCommander.Lib.Consts.CloudNames.box,
            icon: 'box',
            down: config.htcConfig.isAllowedBox && config.htcConfig.enableDownloadToBox,
            up: config.htcConfig.isAllowedBox && config.htcConfig.enableUploadFromBox
        }
    };
    var downMenu, upMenu, downMenuHidden = true, upMenuHidden = true,
        downMenuItems = [], upMenuItems = [];
    for (prop in cds) {
        if (cds.hasOwnProperty(prop)) {
            var name = String(prop);
            downMenuItems.push({
                itemId: name,
                text: cds[prop].name,
                icon: HttpCommander.Lib.Utils.getIconPath(config, cds[prop].icon) + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=cloudsmenu' : ''),
                hidden: !cds[prop].down
            });
            upMenuItems.push({
                itemId: name,
                text: cds[prop].name,
                icon: HttpCommander.Lib.Utils.getIconPath(config, cds[prop].icon) + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=cloudsmenu' : ''),
                hidden: !cds[prop].up
            });
            if (cds[prop].down) downMenuHidden = false;
            if (cds[prop].up) upMenuHidden = false;
        }
    }

    var csSubMenu = new Ext.menu.Menu({
        hidden: downMenuHidden && upMenuHidden,
        items:
        [
            {
                itemId: 'download',
                text: config.htcConfig.locData.CommandCloudsDownloadTo,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'downloadtocloud'),
                handler: function (item, e) { return false; },
                menu: downMenu = new Ext.menu.Menu({
                    items: downMenuItems,
                    listeners: {
                        itemclick: function (item) {
                            if (item && item.itemId) {
                                var handlerName = 'downloadTo' + item.itemId;
                                if (typeof config[handlerName] == 'function')
                                    config[handlerName]();
                            }
                        }
                    }
                })
            },
            {
                itemId: 'upload',
                text: config.htcConfig.locData.CommandCloudsUploadFrom,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'uploadfromcloud'),
                handler: function (item, e) { return false; },
                menu: upMenu = new Ext.menu.Menu({
                    items: upMenuItems,
                    listeners: {
                        itemclick: function (item) {
                            if (item && item.itemId)
                                config.showUploadWindow(item.itemId.toLowerCase() + '-upload');
                        }
                    }
                })
            },
            '-',
            {
                itemId: 'about',
                text: config.htcConfig.locData.CommandCloudsAbout,
                hidden: false,
                handler: function () { config.showHelpWindow("clouds"); }
            }
        ],
        listeners: {
            beforeshow: function (cmp) {
                csSubMenu.onBeforeShowCloudSubMenu(cmp, config.getSelTypeFilesModel(config.getGrid()));
            }
        },
        onBeforeShowCloudSubMenu: function (menu, selTypeFilesModel) {
            var curFolder = config.getCurrentFolder();
            if (config.isRecentFolder(curFolder) || config.isTrashFolder(curFolder) || config.isAlertsFolder(curFolder))
                return false;
            var selFiles = selTypeFilesModel['selFiles'],
                selFolders = selTypeFilesModel['selFolders'],
                selType = selTypeFilesModel['selType'];
            var commonDownPerms = config.htcConfig.currentPerms
                && config.htcConfig.currentPerms.download
                && (selFiles > 0 || selFolders > 0);
            var commonUpPerms = config.htcConfig.currentPerms
                && config.htcConfig.currentPerms.upload;
            var downVisible = false, upVisible = false;
            for (prop in cds) {
                if (cds.hasOwnProperty(prop)) {
                    var down = commonDownPerms && cds[prop].down,
                        up = commonUpPerms && cds[prop].up,
                        name = String(prop);
                    if (prop == 'SkyDrive' && down) {
                        down = (config.htcConfig.isAllowedSkyDrive && (selFiles > 0 || selFolders > 0));
                    } else if (prop == 'Dropbox' && down) {
                        down = (config.htcConfig.isAllowedDropbox && (selFiles > 0 || selFolders > 0));
                    }
                    downMenu.getComponent(name).setVisible(down);
                    downMenu.getComponent(name).setDisabled(!down);
                    upMenu.getComponent(name).setVisible(up);
                    upMenu.getComponent(name).setDisabled(!up);
                    if (down)
                        downVisible = true;
                    if (up)
                        upVisible = true;
                }
            }
            menu.getComponent('download').setVisible(downVisible);
            menu.getComponent('download').setDisabled(!downVisible);
            menu.getComponent('upload').setVisible(upVisible);
            menu.getComponent('upload').setDisabled(!upVisible);
            return true;
        }
    });
    return csSubMenu;
};