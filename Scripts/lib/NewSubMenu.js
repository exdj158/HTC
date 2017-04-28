Ext.ns('HttpCommander.Lib');

/* config: htcConfig, getMenuActions(),
    isExtensionAllowed(), initAndShowShortcutWindow(),
    getSelTypeFilesModel(),
    getGrid(), getCurrentPerms()
*/
HttpCommander.Lib.NewSubMenu = function(config) {
    var menuItemsNew = [],
        googleNewMenu = null,
        msooNewMenu = null,
        office365NewMenu = null,
        ofst = config.htcConfig.officeTemplates,
        allowMSOOExts = {
            docx: false,
            xlsx: false,
            pptx: false
        },
        templatesNewMenu = [];
    menuItemsNew.push({ itemId: 'new-folder', text: config.htcConfig.locData.CommandFolder, icon: HttpCommander.Lib.Utils.getIconPath(config, 'folder') });
    menuItemsNew.push({ itemId: 'new-file', text: config.htcConfig.locData.CommandEmptyFile, icon: HttpCommander.Lib.Utils.getIconPath(config, 'file') });
    if (ofst && ofst.length > 0) {
        Ext.each(ofst, function (item) {
            if (allowMSOOExts.hasOwnProperty(item.type))
                allowMSOOExts[item.type] = true;
        });
        if (config.htcConfig.enableMSOOEdit) {
            msooNewMenu = {
                itemId: 'new-msoo',
                text: config.htcConfig.locData.CommandNewMSOODocument,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'skydrive'),
                menu: {
                    items: [{
                        itemId: 'new-msoo-docx',
                        ext: 'docx',
                        newName: config.htcConfig.locData.CommonNewDocument,
                        text: config.htcConfig.locData.CommandNewMSOOWord,
                        icon: HttpCommander.Lib.Utils.getIconPath(config, 'docx')
                    }, {
                        itemId: 'new-msoo-xlsx',
                        ext: 'xlsx',
                        newName: config.htcConfig.locData.CommonNewSpreadsheet,
                        text: config.htcConfig.locData.CommandNewMSOOExcel,
                        icon: HttpCommander.Lib.Utils.getIconPath(config, 'xlsx')
                    }, {
                        itemId: 'new-msoo-pptx',
                        ext: 'pptx',
                        newName: config.htcConfig.locData.CommonNewPresentation,
                        text: config.htcConfig.locData.CommandNewMSOOPowerPoint,
                        icon: HttpCommander.Lib.Utils.getIconPath(config, 'pptx')
                    }],
                    listeners: {
                        itemclick: function (item) {
                            config.getMenuActions().createNewMSOO(item.ext, item.newName);
                        },
                        beforeshow: function (menu) {
                            Ext.each(menu.items.items, function (item) {
                                var localVisible = !Ext.isEmpty(item.ext)
                                    && config.isExtensionAllowed('a.' + item.ext, true)
                                    && HttpCommander.Lib.Consts.msooEditorFileTypes.indexOf(';' + item.ext + ';') != -1
                                    && allowMSOOExts[item.ext];
                                item.setVisible(localVisible);
                            });
                        }
                    }
                }
            };
            menuItemsNew.push(msooNewMenu);
        }
        if (config.htcConfig.enableOffice365Edit) {
            office365NewMenu = {
                itemId: 'new-365',
                text: config.htcConfig.locData.CommandNewOffice365Document,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'office365'),
                menu: {
                    items: [{
                        itemId: 'new-365-docx',
                        ext: 'docx',
                        newName: config.htcConfig.locData.CommonNewDocument,
                        text: config.htcConfig.locData.CommandNewMSOOWord,
                        icon: HttpCommander.Lib.Utils.getIconPath(config, 'docx')
                    }, {
                        itemId: 'new-365-xlsx',
                        ext: 'xlsx',
                        newName: config.htcConfig.locData.CommonNewSpreadsheet,
                        text: config.htcConfig.locData.CommandNewMSOOExcel,
                        icon: HttpCommander.Lib.Utils.getIconPath(config, 'xlsx')
                    }, {
                        itemId: 'new-365-pptx',
                        ext: 'pptx',
                        newName: config.htcConfig.locData.CommonNewPresentation,
                        text: config.htcConfig.locData.CommandNewMSOOPowerPoint,
                        icon: HttpCommander.Lib.Utils.getIconPath(config, 'pptx')
                    }],
                    listeners: {
                        itemclick: function (item) {
                            config.getMenuActions().createNew365(item.ext, item.newName);
                        },
                        beforeshow: function (menu) {
                            Ext.each(menu.items.items, function (item) {
                                var localVisible = !Ext.isEmpty(item.ext)
                                    && config.isExtensionAllowed('a.' + item.ext, true)
                                    && HttpCommander.Lib.Consts.msooEditorFileTypes.indexOf(';' + item.ext + ';') != -1
                                    && allowMSOOExts[item.ext];
                                item.setVisible(localVisible);
                            });
                        }
                    }
                }
            };
            menuItemsNew.push(office365NewMenu);
        }
    }
    if (config.htcConfig.enableGoogleEdit) {
        googleNewMenu = {
            itemId: 'new-google',
            text: config.htcConfig.locData.CommandNewGoogleDocument,
            icon: HttpCommander.Lib.Utils.getIconPath(config, 'googledocs'),
            menu: {
                items: [{
                    itemId: 'new-gdoc',
                    ext: 'docx',
                    newName: config.htcConfig.locData.CommonNewDocument,
                    mimeType: 'application/vnd.google-apps.document',
                    text: config.htcConfig.locData.CommandNewGoogleDocs,
                    icon: HttpCommander.Lib.Utils.getIconPath(config, 'gtype1')
                }, {
                    itemId: 'new-gsheet',
                    ext: 'xlsx',
                    newName: config.htcConfig.locData.CommonNewSpreadsheet,
                    mimeType: 'application/vnd.google-apps.spreadsheet',
                    text: config.htcConfig.locData.CommandNewGoogleSheets,
                    icon: HttpCommander.Lib.Utils.getIconPath(config, 'gtype2')
                }, {
                    itemId: 'new-gslide',
                    ext: 'pptx',
                    newName: config.htcConfig.locData.CommonNewPresentation,
                    mimeType: 'application/vnd.google-apps.presentation',
                    text: config.htcConfig.locData.CommandNewGoogleSlides,
                    icon: HttpCommander.Lib.Utils.getIconPath(config, 'gtype3')
                }],
                listeners: {
                    itemclick: function (item) {
                        config.getMenuActions().createNewGoogle(item.mimeType, item.ext, item.newName);
                    },
                    beforeshow: function (menu) {
                        Ext.each(menu.items.items, function (item) {
                            var localVisible = !Ext.isEmpty(item.mimeType)
                                && !Ext.isEmpty(item.ext)
                                && config.isExtensionAllowed('a.' + item.ext, true)
                                && HttpCommander.Lib.Consts.googleDriveEditorFileTypes.indexOf(';' + item.ext + ';') != -1;
                            item.setVisible(localVisible);
                        });
                    }
                }
            }
        };
        menuItemsNew.push(googleNewMenu);
    }
    if (config.htcConfig.enablePixlrEditor)
        menuItemsNew.push({ itemId: 'new-image-with-pixlr', text: config.htcConfig.locData.CommandNewImage, icon: HttpCommander.Lib.Utils.getIconPath(config, 'pixlr') });
    if (config.htcConfig.allowCreateShortcuts)
        menuItemsNew.push({ itemId: 'shortcut', text: config.htcConfig.locData.CommandCreateShortcut, icon: HttpCommander.Lib.Utils.getIconPath(config, 'folder-shortcut') });
    if (config.htcConfig.officeTemplates.length > 0) {
        //menuItemsNew.push('-');
        Ext.each(config.htcConfig.officeTemplates, function(item) {
            var itemId = 'new-' + (item.type == '' ? item.name : item.type);
            if (item.type.toLowerCase() == 'zip') {
                menuItemsNew.push({
                    itemId: itemId,
                    text: Ext.util.Format.htmlEncode(item.name),
                    itemFileName: item.name,
                    icon: config.htcConfig.relativePath + item.icon
                })
            } else {
                templatesNewMenu.push({
                    itemId: itemId,
                    text: Ext.util.Format.htmlEncode(item.name),
                    itemFileName: item.name,
                    icon: config.htcConfig.relativePath + item.icon
                });
            }
        });
        menuItemsNew.push({
            text: config.htcConfig.locData.CommandNewWithTemplate,
            handler: function (item, e) { return false; },
            itemId: 'new-with-template',
            menu: {
                items: templatesNewMenu,
                listeners: {
                    itemclick: function(item) {
                        config.getMenuActions().newItemFromTemplate(item);
                    },
                    beforeshow: function (menu) {
                        var perms = config.getCurrentPerms();
                        if (config.htcConfig.officeTemplates.length > 0 && perms) {
                            Ext.each(menu.items.items, function (item) {
                                if (!Ext.isEmpty(item.text)) {
                                    item.setVisible(config.isExtensionAllowed(item.text));
                                }
                            });
                        }
                    }
                }
            }
        });
    }
    var newSubMenu = new Ext.menu.Menu({
        items: menuItemsNew,
        listeners: {
            itemclick: function(item) {
                switch (item.itemId) {
                    case 'new-file':
                    case 'new-folder':
                        config.getMenuActions().createNewItem(item.itemId == 'new-file' ? 'file' : 'folder');
                        break;
                    case 'new-image-with-pixlr':
                        config.getMenuActions().viewInService('pixlr', true);
                        break;
                    case 'shortcut':
                        config.getMenuActions().runShortcut();
                        break;
                    case 'new-zip':
                        config.getMenuActions().newItemFromTemplate(item);
                        break;
                    case 'new-google':
                    case 'new-msoo':
                    case 'new-365':
                        break;
                }
            },
            beforeshow: function (menu) {
                var perms = config.getCurrentPerms(),
                    existTemplate = false;
                if (config.htcConfig.officeTemplates.length > 0 && perms) {
                    Ext.each(templatesNewMenu, function (item) {
                        if (!Ext.isEmpty(item.itemFileName)) {
                            if (!existTemplate && config.isExtensionAllowed(item.itemFileName)) {
                                existTemplate = true;
                            }
                        }
                    });
                }
                var newZip = menu.getComponent('new-zip');
                if (newZip) {
                    newZip.setVisible(perms && config.isExtensionAllowed('file.zip') && perms.zip);
                }
                menu.getComponent('new-with-template').setVisible(existTemplate);
                if (config.htcConfig.allowCreateShortcuts) {
                    var scItem = menu.getComponent('shortcut');
                    if (scItem) {
                        var selTFM = config.getSelTypeFilesModel(config.getGrid()),
                            selModel = selTFM ? selTFM['selModel'] : null,
                            selItems = selModel ? selModel.getCount() : 0;
                        scItem.setVisible(perms && perms.create && selItems < 2 && config.isExtensionAllowed('file.lnk'));
                    }
                }
                // check google types
                if (googleNewMenu) {
                    var existsVisible = false;
                    var gnm = menu.getComponent('new-google');
                    if (gnm) {
                        Ext.each(gnm.menu.items.items, function (item) {
                            var localVisible = !Ext.isEmpty(item.mimeType)
                                && !Ext.isEmpty(item.ext)
                                && config.isExtensionAllowed('a.' + item.ext, true);
                            item.setVisible(localVisible);
                            if (localVisible && !existsVisible) {
                                existsVisible = true;
                            }
                        });
                        gnm.setVisible(existsVisible);
                    }
                }
                // check msoo types
                if (msooNewMenu) {
                    var existsVisible1 = false;
                    var gnm1 = menu.getComponent('new-msoo');
                    if (gnm1) {
                        Ext.each(gnm1.menu.items.items, function (item) {
                            var localVisible = !Ext.isEmpty(item.ext)
                                && config.isExtensionAllowed('a.' + item.ext, true)
                                && allowMSOOExts[item.ext];
                            item.setVisible(localVisible);
                            if (localVisible && !existsVisible1) {
                                existsVisible1 = true;
                            }
                        });
                        gnm1.setVisible(existsVisible1);
                    }
                }
                if (office365NewMenu) {
                    var existsVisible2 = false;
                    var gnm2 = menu.getComponent('new-365');
                    if (gnm2) {
                        Ext.each(gnm2.menu.items.items, function (item) {
                            var localVisible = !Ext.isEmpty(item.ext)
                                && config.isExtensionAllowed('a.' + item.ext, true)
                                && allowMSOOExts[item.ext];
                            item.setVisible(localVisible);
                            if (localVisible && !existsVisible2) {
                                existsVisible2 = true;
                            }
                        });
                        gnm2.setVisible(existsVisible2);
                    }
                }
            }
        }
    });
    return newSubMenu;
};