Ext.ns('HttpCommander.Lib');

/*  config: htcConfig, isUsedSmallIcons(), openGridFolder(), getFolderTitle()
*/
HttpCommander.Lib.ControlNavFolders = function (config) {
    var maxSize = 10,
        smallIcons = config.htcConfig.iconSet.ext.indexOf('png') < 0 || (config.isUsedSmallIcons() && config.htcConfig.iconSet.ext.indexOf('png') >= 0),
        historyItems = [],
        selectedIndex = -1,
        backButton = new Ext.Button({
            disabled: true,
            icon: HttpCommander.Lib.Utils.getIconPath(config, smallIcons ? 'back' : '24/back'),
            tooltip: config.htcConfig.locData.CommandBack,
            scale: config.isUsedSmallIcons() ? 'small' : 'medium',
            handler: function (b, e) {
                if (historyItems.length > 0 && selectedIndex < historyItems.length - 1) {
                    selectedIndex++;
                    handler(historyItems[selectedIndex], null);
                } else {
                    b.setDisabled(true);
                }
            }
        }),
        forwardButton = new Ext.Button({
            disabled: true,
            icon: HttpCommander.Lib.Utils.getIconPath(config, smallIcons ? 'forward' : '24/forward'),
            tooltip: config.htcConfig.locData.CommandForward,
            scale: config.isUsedSmallIcons() ? 'small' : 'medium',
            handler: function (b, e) {
                if (historyItems.length > 0 && selectedIndex > 0) {
                    selectedIndex--;
                    handler(historyItems[selectedIndex], null);
                } else {
                    b.setDisabled(true);
                }
            }
        }),
        historyMenu = new Ext.menu.Menu({
            items: [],
            listeners: {
                mouseover: function (menu, e, item) {
                    if (item && typeof item.index != 'undefined' && item.index != selectedIndex) {
                        var icon = item.el.dom.getElementsByTagName('img');
                        if (icon && icon.length > 0) {
                            icon = icon[0];
                            if (icon) {
                                if (item.index > selectedIndex) {
                                    icon.src = HttpCommander.Lib.Utils.getIconPath(config, 'left');
                                } else if (item.index < selectedIndex) {
                                    icon.src = HttpCommander.Lib.Utils.getIconPath(config, 'right');
                                }
                            }
                        }
                    }
                },
                mouseout: function (menu, e, item) {
                    if (item && typeof item.index != 'undefined' && item.index != selectedIndex) {
                        var icon = item.el.dom.getElementsByTagName('img');
                        if (icon && icon.length > 0) {
                            icon = icon[0];
                            if (icon) {
                                icon.src = Ext.BLANK_IMAGE_URL;
                            }
                        }
                    }
                }
            }
        }),
        historyButton = new Ext.Button({
            disabled: true,
            menu: historyMenu,
            tooltip: config.htcConfig.locData.CommandRecentFolders,
            scale: config.isUsedSmallIcons() ? 'small' : 'medium',
            listeners: {
                afterrender: function (btn) {
                    var b = btn.el.dom.getElementsByTagName('button');
                    if (b && b.length > 0) {
                        var s = b[0].style;
                        s.paddingLeft = '0px';
                        s.paddingRight = '0px';
                        s.width = '0px';
                    }
                }
            }
        }),
        changeButtons = function() {
            backButton.setDisabled(historyItems.length == 0 || selectedIndex < 0 || selectedIndex >= historyItems.length - 1);
            forwardButton.setDisabled(historyItems.length == 0 || selectedIndex <= 0);
            historyButton.setDisabled(historyItems.length == 0);
        },
        handler = function(item, event) {
            if (item && item.text && item.path && typeof item.index != 'undefined' &&
                    config && config.openGridFolder) {
                selectedIndex = item.index;
                if (selectedIndex < 0 || selectedIndex >= historyItems.length)
                    selectedIndex = 0;
                changeButtons();
                config.openGridFolder(item.path, true, false, true);
                prepareMenu();
            }
        },
        prepareMenu = function() {
            var i, h, len = historyItems.length;
            historyMenu.removeAll();
            if ((selectedIndex < 0 || selectedIndex >= len) && len > 0)
                selectedIndex = 0;
            else if (len == 0)
                selectedIndex = -1;
            for (i = 0; i < len; i++) {
                h = historyItems[i];
                h.index = i;
                if (selectedIndex == i)
                    h.icon = HttpCommander.Lib.Utils.getIconPath(config, 'check');
                else if (h.hasOwnProperty('icon'))
                    delete h['icon'];
                h.handler = handler;
                historyMenu.add(h);
            }
        };

    this.backBtn = backButton;
    this.forwardBtn = forwardButton;
    this.historyBtn = historyButton;
    this.pushFolder = function (path) {
        if (!path)
            return;
        var name = path,
            pos = path.lastIndexOf('/');
        if (pos >= 0 && pos < path.length - 1)
            name = path.substring(pos + 1);
        if (selectedIndex < 0 || selectedIndex >= historyItems.length) {
            selectedIndex = 0;
        } else {
            while (selectedIndex > 0) {
                historyItems.shift();
                selectedIndex--;
            }
        }
        if (historyItems.length == 0 || path.toLowerCase() != historyItems[0].path.toLowerCase()) {
            historyItems.unshift({
                text: config.getFolderTitle(name, path),
                path: path
            });
            while (historyItems.length > maxSize)
                historyItems.pop();
        }
        changeButtons();
        prepareMenu();
    };
};