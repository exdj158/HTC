Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, globalLoadMask, getCurrentFolder(), openGridFolder(), setSelectPath()
*/
HttpCommander.Lib.ShortcutWindow = function (config) {
    var window = new config.Window({
        title: config.htcConfig.locData.CommandCreateShortcut,
        bodyStyle: 'padding:5px',
        modal: true,
        width: 300,
        autoHeight: true,
        closeAction: 'hide',
        itemName: '',
        itemPath: '',
        plain: true,
        layout: 'form',
        labelAlign: 'top',
        defaults: {
            anchor: '100%',
            xtype: 'label'
        },
        items:
        [
            {
                text: config.htcConfig.locData.ShortcutNameHint + ':'
            },
            {
                itemId: 'shortcut-name',
                xtype: 'textfield'
            },
            {
                text: config.htcConfig.locData.ShortcutTargetPathHint + ':'
            },
            {
                itemId: 'shortcut-target',
                xtype: 'textarea',
                flex: 1
            }
        ],
        buttons:
        [
            {
                text: config.htcConfig.locData.CreateShortcutButtonTitle,
                handler: function () {
                    var lnkInfo = {
                        lnkName: window.getComponent('shortcut-name').getValue(),
                        lnkPath: config.getCurrentFolder(),
                        itemName: window.itemName,
                        itemPath: window.getComponent('shortcut-target').getValue()
                    };
                    config.globalLoadMask.msg = config.htcConfig.locData.CreatingShortcutProgress + '...';
                    config.globalLoadMask.show();
                    HttpCommander.Common.CreateShortcut(lnkInfo, function (data, trans) {
                        config.globalLoadMask.hide();
                        config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                        if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, config.Msg, config.htcConfig)) {
                            config.Msg.show({
                                title: config.htcConfig.locData.CommandCreateShortcut,
                                msg: String.format(config.htcConfig.locData.CreateShortcutSuccessMessage,
                                    Ext.util.Format.htmlEncode(data.lnkName),
                                    Ext.util.Format.htmlEncode(data.target)),
                                buttons: config.Msg.OK,
                                icon: config.Msg.INFO,
                                fn: function (buttonId) {
                                    window.hide();
                                    if (!Ext.isEmpty(data.lnkName) && !Ext.isEmpty(data.lnkPath)) {
                                        config.setSelectPath({
                                            name: data.lnkName,
                                            path: data.lnkPath
                                        });
                                    }
                                    config.openGridFolder(Ext.isEmpty(data.lnkPath) ? config.getCurrentFolder() : data.lnkPath);
                                }
                            });
                        }
                    });
                }
            },
            {
                text: config.htcConfig.locData.CommonButtonCaptionCancel,
                handler: function () {
                    window.hide();
                }
            }
        ],
        listeners: {
            hide: function (w) {
                w.itemName = '';
                w.itemPath = '';
                w.getComponent('shortcut-name').setValue('');
                w.getComponent('shortcut-target').setValue('');
            },
            show: function (w) {
                var lnkName = String(w.itemName);
                if (lnkName.length > 0) {
                    var nameParts = lnkName.split('.');
                    if (nameParts.length > 1) {
                        nameParts.pop();
                        lnkName = nameParts.join('.');
                    }
                }
                w.getComponent('shortcut-name').setValue(lnkName);
                w.getComponent('shortcut-target').setValue(w.itemPath + (w.itemPath.length > 0 ? '/' : '') + w.itemName);
            }
        }
    });
    return window;
};