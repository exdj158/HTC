Ext.ns('HttpCommander.Lib');

/* config: htcConfig, getMenuActions(), getSelTypeFilesModel(), getGrid(),
    getCurrentFolder(), Msg, Window
*/
HttpCommander.Lib.LabelsMenu = function (config) {
    var items = [], addSep = false;
    items.push({
        itemId: 'no-label',
        text: config.htcConfig.locData.LabelsNoLabel
    });
    items.push('-');
    if (Ext.isArray(config.htcConfig.predefinedLabels)) {
        Ext.each(config.htcConfig.predefinedLabels, function (item) {
            if (Ext.isObject(item) && !Ext.isEmpty(item.name) && !Ext.isEmpty(item.color)) {
                items.push({
                    text: Ext.util.Format.htmlEncode(item.name),
                    nameLabel: item.name,
                    colorLabel: item.color,
                    style: {
                        fontWeight: 'bold',
                        color: item.color
                    }
                });
                if (!addSep) {
                    addSep = true;
                }
            }
        });
    }
    if (addSep) {
        items.push('-');
    }
    items.push({
        itemId: 'custom-label',
        text: config.htcConfig.locData.LabelsCustomLabel + '...',
        menu: {
            xtype: 'colormenu',
            forceLayout: true,
            colors: [
                'CC4125', 'E06666', 'F6B26B', 'FFD966', '93C47D', '76A5AF', '6D9EEB', '6FA8DC', '8E7CC3', 'C27BA0',
                'A61C00', 'CC0000', 'E69138', 'F1C232', '6AA84F', '45818E', '3C78D8', '3D85C6', '674EA7', 'A64D79',
                '85200C', '990000', 'B45F06', 'BF9000', '38761D', '134F5C', '1155CC', '0B5394', '351C75', '741B47',
                '5B0F00', '660000', '783F04', '7F6000', '274E13', '0C343D', '1C4587', '073763', '20124D', '4C1130',
                '000000', '434343', '666666', '999999'
            ],
            listeners: {
                afterrender: function (cm) {
                    if (cm && cm.palette) {
                        cm.palette.allowReselect = true;
                    }
                },
                select: function (palette, color) {
                    var sm = config.getSelTypeFilesModel(config.getGrid());
                    var newLbl = null;
                    if (sm && sm.selModel && (sm = sm.selModel.getSelected()) && sm.data) {
                        newLbl = sm.data.label;
                    }
                    var getEx = function (val) {
                        return String.format(config.htcConfig.locData.LabelsCustomLabelView,
                            '<span class="file-folder-label" style="margin-bottom:-5px;display:inline-block;max-width:140px;background-color:#' + color + ';">',
                            Ext.isEmpty(val) || val.trim().length == 0 ? '&nbsp;' : Ext.util.Format.htmlEncode(val),
                            '</span>'
                        );
                    }
                    if (Ext.isEmpty(newLbl) || newLbl.trim().length == 0) {
                        newLbl = config.htcConfig.locData.LabelsNewLabel;
                    }
                    var lw =  String.format(config.htcConfig.locData.LabelsCustomLabelView,
                        '<span class="file-folder-label" style="background-color:#' + color + ';">',
                        Ext.util.Format.htmlEncode(newLbl),
                        '</span>'
                    );
                    var clw = new config.Window({
                        title: config.htcConfig.locData.LabelsCustomLabel,
                        autoDestroy: true,
                        modal: true,
                        closable: true,
                        minizable: false,
                        maximizable: false,
                        width: 260,
                        layout: 'form',
                        padding: 5,
                        resizable: false,
                        autoHeight: true,
                        labelAlign: 'top',
                        items: [{
                            fieldLabel: config.htcConfig.locData.LabelsCustomLabelHint,
                            itemId: 'label-value',
                            allowBlank: false,
                            xtype: 'textfield',
                            enableKeyEvents: true,
                            anchor: '100%',
                            value: newLbl,
                            listeners: {
                                change: function (fld, val, oldVal) {
                                    var lw = clw.getComponent('label-view');
                                    lw.setText(getEx(val), false);
                                },
                                keyup: function (fld, evt) {
                                    var val = fld.getValue();
                                    if (evt && evt.keyCode == 13) {
                                        if (!Ext.isEmpty(val) && val.trim().length > 0) {
                                            var lbl = clw.getComponent('label-value').getValue();
                                            if (!Ext.isEmpty(lbl) && lbl.trim().length > 0) {
                                                config.getMenuActions().setLabel(lbl, '#' + color, clw);
                                            }
                                        }
                                    } else {
                                        var lw = clw.getComponent('label-view');
                                        lw.setText(getEx(val), false);
                                    }
                                }
                            }
                        }, {
                            itemId: 'label-view',
                            xtype: 'label',
                            width: 240,
                            html: getEx(newLbl)
                        }],
                        buttonAlign: 'center',
                        buttons: [{
                            text: config.htcConfig.locData.CommonButtonCaptionOK,
                            handler: function (btn) {
                                var lbl = clw.getComponent('label-value').getValue();
                                if (!Ext.isEmpty(lbl) && lbl.trim().length > 0) {
                                    config.getMenuActions().setLabel(lbl, '#' + color, clw);
                                } else {
                                    clw.getComponent('label-value').setValue('');
                                }
                            }
                        }, {
                            text: config.htcConfig.locData.CommonButtonCaptionCancel,
                            handler: function (btn) {
                                clw.hide();
                            }
                        }],
                        listeners: {
                            show: function (wnd) {
                                var fld = wnd.getComponent('label-value');
                                if (fld && fld.rendered) {
                                    var val = fld.getValue();
                                    if (!Ext.isEmpty(val) && val.trim().length > 0) {
                                        setTimeout(function () {
                                            try { fld.selectText(); } catch (e) { }
                                            try { fld.focus(); } catch (e) { }
                                        }, 50);
                                        return;
                                    }
                                    fld.focus(true, 50);
                                }
                            }
                        }
                    });
                    try {
                        var sc = palette.el.child('.x-color-palette-sel', false);
                        if (sc) {
                            sc.removeClass('x-color-palette-sel');
                        }
                    } catch (e) {
                        if (!!window.console && !!window.console.log) {
                            window.console.log(e);
                        }
                    }
                    clw.show();
                }
            }
        }
    });
    var labelsMenu = new Ext.menu.Menu({
        items: items,
        listeners: {
            itemclick: function (item) {
                switch (item.itemId) {
                    case 'no-label':
                        config.getMenuActions().setLabel();
                        break;
                    case 'custom-label':
                        break;
                    default:
                        if (!Ext.isEmpty(item.nameLabel) && !Ext.isEmpty(item.colorLabel)) {
                            config.getMenuActions().setLabel(item.nameLabel, item.colorLabel);
                        }
                        break;
                }
            }
        }
    });

    return labelsMenu;
};