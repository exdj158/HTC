Ext.ns('HttpCommander.Lib');

/* config: htcConfig, getCurrentFolder(), getGridViewMenu(), Msg, openGridFolder(), globalLoadMask */
HttpCommander.Lib.FavoritesSubMenu = function (config) {
    var userFavorites = [], favMenuGroupItems, favoritesSubMenu;
    var addFavorite = function (fav, callback) {
        config.globalLoadMask.msg = config.htcConfig.locData.AddingToFavoritesMessage + "...";
        config.globalLoadMask.show();
        HttpCommander.Common.AddFavorite({ fav: fav }, function (data, trans) {
            config.globalLoadMask.hide();
            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
            if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                data, trans, config.Msg, config.htcConfig)) {
                callback();
            }
        });
    };
    var removeFavorite = function (fav, callback) {
        config.globalLoadMask.msg = config.htcConfig.locData.RemoveFromFavoritesMessage + "...";
        config.globalLoadMask.show();
        HttpCommander.Common.RemoveFavorite({ fav: fav }, function (data, trans) {
            config.globalLoadMask.hide();
            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
            if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                data, trans, config.Msg, config.htcConfig)) {
                callback();
            }
        });
    };
    var createFavMenuItem = function (fav, menu) {
        menu = menu || favMenuGroupItems;
        if (menu && !Ext.isEmpty(fav) && fav.trim().length > 0) {
            try {
                if (menu.items.length == 1)
                    menu.add({ xtype: 'menuseparator', colspan: 2 });
                var menuId = Ext.id();
                menu.add({
                    id: menuId,
                    icon: HttpCommander.Lib.Utils.getIconPath(config, 'folder'),
                    xtype: 'menuitem',
                    width: '100%',
                    originName: fav,
                    text: Ext.util.Format.htmlEncode(fav),
                    handler: function (item) {
                        var gridViewMenu = config.getGridViewMenu();
                        if (gridViewMenu)
                            gridViewMenu.hide();
                        if (favoritesSubMenu)
                            favoritesSubMenu.hide();
                        //openTreeNode(item.text);
                        config.openGridFolder(item.originName, true);
                    }
                });
                menu.add({
                    favId: menuId,
                    width: 'auto',
                    tooltip: String.format(config.htcConfig.locData.RemoveFromFavoritesHint,
                        Ext.util.Format.htmlEncode(fav)),
                    iconCls: 'x-remove-from-favorites',
                    cls: 'x-remove-from-favorites-btn',
                    xtype: 'button',
                    handler: function (item) {
                        var favItem = Ext.getCmp(item.favId);
                        if (favItem) {
                            var fav = favItem.originName;
                            var i = userFavorites.indexOf(fav);
                            if (i > -1) {
                                removeFavorite(fav, function () {
                                    userFavorites.splice(i, 1);
                                    menu.remove(item);
                                    menu.remove(favItem);
                                    if (menu.items.length == 2)
                                        menu.remove(menu.items.items[1]);
                                });
                            }
                        }
                    }
                });
                return true;
            } catch (e) { }
        }
        return false;
    };
    favoritesSubMenu = new Ext.menu.Menu({
        plain: true,
        items:
        [
            favMenuGroupItems = new Ext.ButtonGroup({
                autoWidth: true,
                columns: 2,
                frame: false,
                baseCls: 'x-menu',
                defaults: { xtype: 'menuitem', width: '100%' },
                items:
                [
                    {
                        colspan: 2,
                        text: config.htcConfig.locData.CommandAddToFavorites,
                        icon: HttpCommander.Lib.Utils.getIconPath(config, 'addtofav'),
                        handler: function (item, e) {
                            var gridVM = config.getGridViewMenu();
                            if (gridVM)
                                gridVM.hide();
                            if (favoritesSubMenu)
                                favoritesSubMenu.hide();
                            userFavorites = userFavorites || [];
                            var curFolder = config.getCurrentFolder();
                            var cf = curFolder.toLowerCase().trim();
                            if (cf != 'root') {
                                for (var i = 0; i < userFavorites.length; i++) {
                                    if (cf == userFavorites[i].toLowerCase().trim()) {
                                        config.Msg.show({
                                            title: config.htcConfig.locData.CommandAddToFavorites,
                                            msg: String.format(config.htcConfig.locData.FolderAlreadyAddedInFavorites,
                                                Ext.util.Format.htmlEncode(curFolder)),
                                            icon: config.Msg.WARNING,
                                            buttons: config.Msg.OK
                                        });
                                        return;
                                    }
                                }
                                addFavorite(curFolder, function () {
                                    if (createFavMenuItem(curFolder)) {
                                        userFavorites.push(curFolder);
                                        config.Msg.show({
                                            title: config.htcConfig.locData.CommandAddToFavorites,
                                            msg: String.format(config.htcConfig.locData.FolderAddedInFavoritesSuccessfully,
                                                Ext.util.Format.htmlEncode(curFolder)),
                                            icon: config.Msg.INFO,
                                            buttons: config.Msg.OK
                                        });
                                    }
                                });
                            }
                        }
                    }
                ]
            })
        ],
        listeners: {
            afterrender: function (item) {
                if (Ext.isArray(config.htcConfig.favs)) {
                    userFavorites = config.htcConfig.favs;
                } else {
                    userFavorites = [];
                }
                favMenuGroupItems.items.items[0].setDisabled(config.getCurrentFolder().toLowerCase() == 'root');
                if (userFavorites.length > 0) {
                    Ext.each(userFavorites, function (fav) {
                        createFavMenuItem(fav, favMenuGroupItems);
                    });
                }
            }
        }
    });

    return favoritesSubMenu;
};