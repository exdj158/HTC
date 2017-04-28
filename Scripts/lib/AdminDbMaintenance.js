Ext.ns('HttpCommander.Lib');

/**
 *   config:
 *       htcConfig,
 */
HttpCommander.Lib.AdminDbMaintenance = function (config) {
    // VARS section
    var self, infoPanel, compactPanel, settingsPanel, statPanel,
        logLvls, logLvlItems = [], connParams = [],
        loadingMask = new Ext.LoadMask(Ext.getBody(), {
            msg: config.htcConfig.locData.ProgressLoading + "...",
            removeMask: false
        });

    if (Ext.isArray(config.htcConfig.dbLogLevels)) {
        var ll = config.htcConfig.dbLogEnabled;
        var checkLogLevelHandler = function (cb, checked) {
            var parent = cb.ownerCt;
            if (!checked || !parent) {
                return;
            }
            if (cb.enumValue == 0) {
                Ext.each(parent.items.items, function (item) {
                    if (item.enumValue != 0) {
                        item.setValue(false);
                    }
                });
            } else if (cb.enumValue != 0) {
                parent.getComponent('dbLogLevelDisabled').setValue(false);
            }
        };
        Ext.each(config.htcConfig.dbLogLevels, function (item) {
            var checked = (ll == item.value) || (ll & item.value) != 0;
            logLvlItems.push({
                name: item.name,
                itemId: 'dbLogLevel' + item.name,
                checked: checked,
                value: checked,
                enumValue: item.value,
                boxLabel: item.name,
                listeners: {
                    change: checkLogLevelHandler,
                    check: checkLogLevelHandler
                }
            });
        });
    }

    if (Ext.isArray(config.htcConfig.dbAdvConnParams)) {
        Ext.each(config.htcConfig.dbAdvConnParams, function (item) {
            if (Ext.isObject(item)) {
                var lsts = {
                    afterrender: function (cmp) {
                        var qtp = Ext.isEmpty(cmp.vqtip) ? cmp.qtip : cmp.vqtip;
                        if (!Ext.isEmpty(qtp)) {
                            var target = cmp.getEl();
                            if (!!target) {
                                target.dom.qtip = qtp;
                            }
                        }
                        if (!Ext.isEmpty(cmp.qtip) && !!cmp.label && !!cmp.label.dom) {
                            cmp.label.dom.qtip = cmp.qtip;
                        }
                    }
                };
                if (item.xtype == 'combo' && Ext.isObject(item.qtips)) {
                    lsts['change'] = lsts['select'] = function (cb, newValue, oldValue) {
                        var newQTip = cb.qtip || '';
                        var val = cb.getValue();
                        if (Ext.isObject(cb.qtips) && !Ext.isEmpty(cb.qtips[val])) {
                            newQTip = cb.qtips[val];
                        }
                        if (!!cb.el && !!cb.el.dom) {
                            cb.el.dom.qtip = newQTip;
                        }
                        if (cb.el.setAttributeNS) {
                            cb.el.setAttributeNS("ext", "qtip", newQTip);
                        } else if (cb.el.setAttribute) {
                            cb.el.setAttribute("ext:qtip", newQTip);
                        }
                    };
                }
                item['listeners'] = lsts;
                connParams.push(item);
            }
        });
    }

    // return main object
    return (self = {
        title: config.htcConfig.locData.AdminDbMaintenanceTab,
        id: 'mdb-tab',
        padding: 5,
        autoScroll: true,
        layout: 'table',
        cls: 'admin-misc-tab',
        layoutConfig: { columns: 2 },
        items: [infoPanel = new Ext.FormPanel({
            title: config.htcConfig.locData.AdminDbMaintenanceInfoTitle,
            labelWidth: 70,
            frame: false,
            //plain: true,
            padding: 5,
            width: 400,
            defaults: {
                xtype: 'textfield',
                anchor: '100%',
                readOnly: true
            },
            items: [{
                xtype: 'textarea',
                fieldLabel: config.htcConfig.locData.AdminDbMaintenanceInfoPathLabel,
                value: config.htcConfig.dbPhysicalPath || ''
            }, {
                itemId: 'db-file-size',
                fieldLabel: config.htcConfig.locData.AdminDbMaintenanceInfoSizeLabel,
                value: config.htcConfig.dbFileSize || ''
            }]
        }), compactPanel = new Ext.FormPanel({
            title: config.htcConfig.locData.AdminDbMaintenanceCompactTitle,
            labelWidth: 70,
            frame: false,
            //plain: true,
            padding: 5,
            bodyStyle: {
                textAlign: 'center'
            },
            width: 400,
            defaults: {
                anchor: '100%'
            },
            items: [{
                xtype: 'label',
                html: config.htcConfig.locData.AdminDbMaintenanceCompactNote + '<br /><br />'
            }, {
                xtype: 'button',
                anchor: '',
                style: {
                    margin: 'auto',
                    minWidth: '100px'
                },
                text: config.htcConfig.locData.AdminDbMaintenanceCompactButton,
                handler: function (btn) {
                    loadingMask.show();
                    HttpCommander.Admin.CompactDb({}, function (data, trans) {
                        loadingMask.hide();
                        if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, config.htcConfig)) {
                            infoPanel.getComponent('db-file-size').setValue(data.newsize);
                            if (!Ext.isEmpty(data.successmsg)) {
                                Ext.Msg.show({
                                    title: config.htcConfig.locData.AdminDbMaintenanceCompactTitle,
                                    msg: data.successmsg,
                                    buttons: Ext.Msg.OK,
                                    icon: Ext.Msg.INFO
                                });
                            }
                        }
                    });
                }
            }/*, {
                xtype: 'label',
                text: config.htcConfig.locData.AdminDbMaintenanceCompactAutoNote
            }, {
                hideLabel: true,
                itemId: 'db-auto-compact',
                xtype: 'checkbox',
                boxLabel: config.htcConfig.locData.AdminDbMaintenanceCompactAutoCheckBox,
                checked: config.htcConfig.dbUsedVacuum,
                value: config.htcConfig.dbUsedVacuum,
                listeners: {
                    change: function (cb, newValue, oldValue) {
                        compactPanel.getComponent('db-save-auto-compact').setDisabled(newValue === config.htcConfig.dbUsedVacuum);
                    },
                    check: function (cb, checked) {
                        compactPanel.getComponent('db-save-auto-compact').setDisabled(checked === config.htcConfig.dbUsedVacuum);
                    }
                }
            }, {
                xtype: 'button',
                itemId: 'db-save-auto-compact',
                anchor: '',
                style: {
                    margin: 'auto',
                    minWidth: '100px'
                },
                disabled: true,
                text: config.htcConfig.locData.AdminDbMaintenanceCompactAutoSaveButton,
                handler: function (btn) {
                    var enabled = compactPanel.getComponent('db-auto-compact').getValue();
                    loadingMask.show();
                    HttpCommander.Admin.ChangeAutoCompactDb({ enabled: enabled }, function (data, trans) {
                        loadingMask.hide();
                        if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, config.htcConfig)) {
                            config.htcConfig.dbUsedVacuum = enabled;
                            btn.setDisabled(true);
                            Ext.Msg.show({
                                title: config.htcConfig.locData.AdminDbMaintenanceCompactTitle,
                                msg: config.htcConfig.locData.AdminDbMaintenanceCompactAutoSaveSuccess,
                                buttons: Ext.Msg.OK,
                                icon: Ext.Msg.INFO,
                                fn: function () {
                                    window.location.reload(true);
                                }
                            });
                        }
                    });
                }
            }*/]
        }), settingsPanel = new Ext.FormPanel({
            title: config.htcConfig.locData.AdminSettingsTab,
            labelWidth: 300,
            frame: false,
            //plain: true,
            padding: 5,
            width: 400,
            items: [{
                xtype: 'label',
                text: config.htcConfig.locData.AdminDbMaintenanceEnableLogLabel + ':',
                hidden: logLvlItems.length == 0
            }, logLvls = new Ext.form.FieldSet({
                labelAlign: 'top',
                hideLabel: true,
                layout: 'column',
                defaults: { columnWidth: '.33', border: false },
                defaultType: 'checkbox',
                border: false,
                padding: 0,
                margin: 0,
                hidden: logLvlItems.length == 0,
                items: logLvlItems
            }), {
                itemId: 'db-interval-write',
                fieldLabel: config.htcConfig.locData.AdminDbMaintenanceInsertIntervalLabel,
                xtype: 'numberfield',
                allowNegative: false,
                allowDecimals: false,
                width: '100%',
                anchor: '100%',
                allowBlank: false,
                minValue: 0,
                value: config.htcConfig.dbIntervalWrite
            }, {
                itemId: 'db-adv-conn-params',
                xtype: 'fieldset',
                hideLabel: true,
                labelWidth: 120,
                collapsible: true,
                collapsed: true,
                checkboxToggle: true,
                title: config.htcConfig.locData.AdminDbMaintenanceAdvDbParamsTitle,
                width: '100%',
                anchor: '100%',
                defaults: {
                    width: '100%',
                    anchor: '100%'
                },
                defaultType: 'textfield',
                items: connParams,
                buttonAlign: 'center',
                buttons: [{
                    text: config.htcConfig.locData.SettingsGridRestoreDefault,
                    handler: function (btn) {
                        var connps = settingsPanel.getComponent('db-adv-conn-params');
                        Ext.each(connps.items.items, function (item) {
                            item.reset();
                            item.fireEvent('change', item, item.getValue(), item.getValue());
                        });
                    }
                }]
            }, {
                xtype: 'label',
                html: Ext.util.Format.htmlEncode(config.htcConfig.locData.AdminDbMaintenanceSettingsChangeNote) + '<br /><br />',
                width: '100%',
                anchor: '100%',
                style: {
                    textAlign: 'center',
                    paddingTop: '10px',
                    paddingBottom: '10px'
                }
            }, {
                xtype: 'button',
                anchor: '',
                style: {
                    margin: 'auto',
                    minWidth: '100px'
                },
                text: config.htcConfig.locData.CommandSave,
                handler: function (btn) {
                    var logLvl = 0;
                    Ext.each(logLvls.items.items, function (item) {
                        if (item.getValue()) {
                            logLvl |= item.enumValue;
                        }
                    });
                    var intFld = settingsPanel.getComponent('db-interval-write');
                    if (intFld.getValue() < 0) {
                        return;
                    }
                    var connps = settingsPanel.getComponent('db-adv-conn-params');
                    var caps = null;
                    if (!connps.collapsed) {
                        caps = {};
                        Ext.each(connps.items.items, function (item) {
                            caps[item.itemId] = item.getValue();
                        });
                    }
                    var params = {
                        log: logLvl,
                        interval: intFld.getValue(),
                        caps: caps
                    };
                    loadingMask.show();
                    HttpCommander.Admin.ChangeDbSettings(params, function (data, trans) {
                        loadingMask.hide();
                        if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, config.htcConfig)) {
                            config.htcConfig.dbLogEnabled = params.log;
                            Ext.Msg.show({
                                title: config.htcConfig.locData.AdminSettingsTab,
                                msg: config.htcConfig.locData.AdminDbMaintenanceSettingsSaveSuccess,
                                buttons: Ext.Msg.OK,
                                icon: Ext.Msg.INFO,
                                fn: function () {
                                    window.location.reload(true);
                                }
                            });
                        } else {
                            logLvls.reset();
                            Ext.each(connps.items.items, function (item) {
                                item.reset();
                                item.fireEvent('change', item, item.getValue(), item.getValue());
                            });
                            intFld.setValue(config.htcConfig.dbIntervalWrite);
                        }
                    });
                }
            }]
        }), statPanel = new Ext.FormPanel({
            title: config.htcConfig.locData.AdminDbMaintenanceStatTitle,
            labelWidth: '100%',
            labelAlign: 'top',
            frame: false,
            //plain: true,
            padding: 5,
            width: 400,
            defaults: {
                xtype: 'textarea',
                anchor: '100%',
                readOnly: true,
                height: 45,
                style: {
                    fontFamily: 'monospace',
                    fontSize: '0.98em'
                }
            },
            items: [{
                itemId: 'db-stat-Get',
                fieldLabel: config.htcConfig.locData.AdminDbMaintenanceStatDurationReadLabel
            }, {
                itemId: 'db-stat-Write',
                fieldLabel: config.htcConfig.locData.AdminDbMaintenanceStatDurationWriteLabel
            }, {
                itemId: 'db-stat-Compact',
                fieldLabel: config.htcConfig.locData.AdminDbMaintenanceStatDurationCompactLabel
            }, {
                xtype: 'button',
                anchor: '',
                height: 'auto',
                style: {
                    margin: 'auto',
                    minWidth: '100px'
                },
                text: config.htcConfig.locData.AdminDbMaintenanceStatGetButton,
                handler: function (btn) {
                    var oldAT = Ext.Ajax.timeout;
                    Ext.Ajax.timeout = 150000; // 3 minutes
                    loadingMask.show();
                    HttpCommander.Admin.GatherStats({}, function (data, trans) {
                        Ext.Ajax.timeout = oldAT;
                        loadingMask.hide();
                        if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, config.htcConfig)) {
                            if (Ext.isArray(data.avgs)) {
                                Ext.each(data.avgs, function (item) {
                                    if (Ext.isObject(item) && !Ext.isEmpty(item.name)) {
                                        var cmp = statPanel.getComponent('db-stat-' + item.name);
                                        if (!!cmp) {
                                            cmp.setValue(item.value || '');
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            }]
        })]
    });
};
