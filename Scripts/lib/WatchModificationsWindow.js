Ext.ns('HttpCommander.Lib');

/*  config: htcConfig, Msg, Window, getUid(), $, globalLoadMask, showHelpWindow(),
    getCurrentFolder(), setSelectPath(), openGridFolder(), showBalloon(), openTreeAlerts()
*/
HttpCommander.Lib.WatchModificationsWindow = function (config) {
    var actsItems = [];
    if (Ext.isArray(config.htcConfig.watchActions)) {
        Ext.each(config.htcConfig.watchActions, function (item) {
            actsItems.push({
                name: item,
                itemId: item,
                checked: true,
                boxLabel: item
            });
        });
    }
    var actsCbs = null, self = new config.Window({
        title: config.htcConfig.locData.WatchForModifsCommand,
        bodyStyle: 'padding:5px',
        resizable: true,
        closable: true,
        maximizable: false,
        closeAction: 'hide',
        minHeight: 400,
        minWidth: 450,
        height: 400,
        modal: true,
        width: 450,
        layout: 'fit',
        pathInfo: null,
        viewWindow: null,
        plain: true,
        items: new Ext.form.FormPanel({
            itemId: 'form',
            baseCls: 'x-plain',
            defaults: {
                hideLabel: true,
                anchor: '100%',
            },
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [{
                xtype: 'label',
                text: config.htcConfig.locData.CommonFieldLabelPath + ':'
            }, {
                itemId: 'path',
                xtype: 'displayfield',
                style: {
                    fontWeight: 'bold'
                },
                value: ''
            }, {
                itemId: 'nested',
                xtype: 'checkbox',
                hidden: true,
                checked: true,
                hideLabel: false,
                boxLabel: config.htcConfig.locData.WatchForModifsIncludingNestedLabel
            }, {
                xtype: 'label',
                html: '&nbsp;'
            }, {
                itemId: 'users-checkbox',
                xtype: 'checkbox',
                checked: false,
                hideLabel: false,
                boxLabel: config.htcConfig.locData.WatchForModifsWatchedUsersCheckBox,
                listeners: {
                    change: function (cb, newValue, oldValue) {
                        var form = self.getComponent('form'),
                            ufld = form.getComponent('users');
                        if (ufld) {
                            ufld.setDisabled(!newValue);
                        }
                    },
                    check: function (cb, checked) {
                        var form = self.getComponent('form'),
                            ufld = form.getComponent('users');
                        if (ufld) {
                            ufld.setDisabled(!checked);
                        }
                    }
                }
            }, {
                itemId: 'users',
                xtype: 'textarea',
                anchor: '100%',
                width: '100%',
                disabled: true,
                flex: 1,
                value: ''
            }, {
                xtype: 'label',
                html: '&nbsp;'
            }, {
                itemId: 'acts-checkbox',
                xtype: 'checkbox',
                checked: true,
                hideLabel: false,
                boxLabel: config.htcConfig.locData.WatchForModifsActionsCheckBox,
                listeners: {
                    change: function (cb, newValue, oldValue) {
                        if (actsCbs) {
                            actsCbs.setDisabled(newValue);
                        }
                    },
                    check: function (cb, checked) {
                        if (actsCbs) {
                            actsCbs.setDisabled(checked);
                        }
                    }
                }
            }, actsCbs = new Ext.form.FieldSet({
                itemId: 'acts',
                layout: 'column',
                defaults: { columnWidth: '.20', border: false },
                defaultType: 'checkbox',
                border: false,
                padding: 0,
                margin: 0,
                cls: 'watch-actions',
                disabled: true,
                hidden: actsItems.length == 0,
                items: actsItems
            }), {
                xtype: 'label',
                html: '&nbsp;'
            }, {
                itemId: 'emails-checkbox',
                xtype: 'checkbox',
                hidden: !(config.htcConfig.watchSend == true),
                checked: false,
                hideLabel: false,
                boxLabel: config.htcConfig.locData.WatchForModifsNotifCheckBox,
                listeners: {
                    change: function (cb, newValue, oldValue) {
                        var form = self.getComponent('form'),
                            efld = form.getComponent('emails'),
                            ifld = form.getComponent('ignore-own');
                        if (efld && ifld) {
                            efld.setDisabled(!newValue);
                            ifld.setDisabled(!newValue);
                        }
                    },
                    check: function (cb, checked) {
                        var form = self.getComponent('form'),
                            efld = form.getComponent('emails'),
                            ifld = form.getComponent('ignore-own');
                        if (efld && ifld) {
                            efld.setDisabled(!checked);
                            ifld.setDisabled(!checked);
                        }
                    }
                }
            }, {
                itemId: 'emails',
                xtype: 'textarea',
                anchor: '100%',
                width: '100%',
                disabled: true,
                hidden: !(config.htcConfig.watchSend == true),
                flex: 1,
                value: ''
            }, {
                itemId: 'ignore-own',
                hidden: !(config.htcConfig.watchSend == true),
                xtype: 'checkbox',
                checked: false,
                hideLabel: false,
                boxLabel: config.htcConfig.locData.WatchForModifsIgnoreOwnerCheckBox,
                disabled: true
            }]
        }),
        mainHandler: function () {
            var form, pInfo, eFld, cb, icb, ucb, uta, acb,
                withEmails = false, withUsers = false, withActs = false,
                emails, users, acts = [];
            if (!self.pathInfo || Ext.isEmpty(self.pathInfo.path)) {
                return;
            }
            form = self.getComponent('form');
            eFld = form.getComponent('emails');
            cb = form.getComponent('emails-checkbox');
            icb = form.getComponent('ignore-own');
            ucb = form.getComponent('users-checkbox');
            uta = form.getComponent('users');
            acb = form.getComponent('acts-checkbox');
            withEmails = config.htcConfig.watchSend && cb.getValue() &&
                !Ext.isEmpty(emails = eFld.getValue()) && (emails = emails.trim()).length > 0;
            withUsers = ucb.getValue() && !Ext.isEmpty(users = uta.getValue()) && (users = users.trim()).length > 0;
            withActs = !acb.getValue();
            if (withActs) {
                Ext.each(actsCbs.items.items, function (item) {
                    if (item && item.getValue()) {
                        acts.push(item.itemId);
                    }
                });
                withActs = (acts.length > 0 && acts.length < actsItems.length);
            }
            pInfo = {
                path: self.pathInfo.path,
                is_folder: (self.pathInfo.is_folder === true),
                //incl_nested: form.getComponent('nested').getValue(), // always true if folder, else - false
                emails: withEmails ? emails : null,
                users: withUsers ? users : null,
                actions: withActs ? acts.join(',') : null
            };
            pInfo.iown = withEmails ? icb.getValue() : false;
            config.globalLoadMask.msg = config.htcConfig.locData.WatchForModifsStartProgressLoading + "...";
            config.globalLoadMask.show();
            HttpCommander.Common.AddWatch(pInfo, function (data, trans) {
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                        data, trans, config.Msg, config.htcConfig)) {
                    var wi = Ext.isObject(data.watchForModifs) ? data.watchForModifs : null;
                    if (self.viewWindow && Ext.isObject(self.viewWindow.pathInfo)) {
                        self.viewWindow.pathInfo = {
                            path: pInfo.path,
                            is_folder: pInfo.is_folder,
                            id: (Ext.isNumber(wi.id) && wi.id > 0) ? wi.id : self.pathInfo.id,
                            iown: pInfo.iown
                        }
                        if (withEmails) {
                            self.viewWindow.pathInfo.emails = wi.emails || pInfo.emails;
                        }
                        if (withUsers) {
                            self.viewWindow.pathInfo.users = wi.users || pInfo.users;
                        }
                        if (withActs) {
                            self.viewWindow.pathInfo.actions = wi.actions || pInfo.actions;
                        }
                        self.viewWindow.loadLogs({});
                    }
                    self.hide();
                    /*var name = pInfo.path, path,
                        lastSlashPos = pInfo.path.lastIndexOf('/');
                    if (lastSlashPos >= 0 && lastSlashPos < pInfo.path.length - 1) {
                        name = pInfo.path.substr(lastSlashPos + 1);
                        path = pInfo.path.substr(0, lastSlashPos);
                    } else {
                        path = 'root';
                    }
                    config.setSelectPath({
                        name: name,
                        path: path
                    });*/
                    config.openTreeAlerts();
                    config.openGridFolder(config.getCurrentFolder());
                    config.showBalloon(Ext.util.Format.htmlEncode(String.format(
                        config.htcConfig.locData.WatchForModifsSubscriptionSuccessMessage,
                        pInfo.path)));
                }
            });
        },
        buttons: [{
            text: config.htcConfig.locData.WatchForModifsStartCommand,
            handler: function (btn) {
                self.mainHandler();
            }
        }, {
            text: config.htcConfig.locData.CommonButtonCaptionCancel,
            handler: function (btn) {
                self.hide();
            }
        }],
        listeners: {
            beforeshow: function (wnd) {
                var form, pathLabel, nested, cbEmails, emailFld, cbIgnore, actsCb,
                    cbUsers, usersFld, wSend = (config.htcConfig.watchSend === true);
                if (!wnd.pathInfo || Ext.isEmpty(wnd.pathInfo.path)) {
                    return false;
                }
                var form = wnd.getComponent('form');
                if (!form) {
                    return false;
                }
                pathLabel = form.getComponent('path');
                //nested = form.getComponent('nested');
                cbEmails = form.getComponent('emails-checkbox');
                emailFld = form.getComponent('emails');
                cbIgnore = form.getComponent('ignore-own');
                cbUsers = form.getComponent('users-checkbox');
                usersFld = form.getComponent('users');
                actsCb = form.getComponent('acts-checkbox');
                if (!pathLabel || !cbEmails || !emailFld || !cbIgnore || !cbUsers || !usersFld || !actsCb || !actsCbs) { // || !nested
                    return false;
                }

                pathLabel.setValue(wnd.pathInfo.path);
                //nested.setVisible(wnd.pathInfo.is_folder === true);
                cbEmails.setValue(false);
                emailFld.setValue(null);
                emailFld.setDisabled(true);
                cbIgnore.setValue(false);
                cbIgnore.setDisabled(true);
                cbIgnore.setVisible(wSend);
                emailFld.setVisible(wSend);
                cbUsers.setValue(false);
                usersFld.setValue(null);
                usersFld.setDisabled(true);
                actsCb.setValue(true);
                actsCbs.setDisabled(true);
                wnd.buttons[0].setText(config.htcConfig.locData.WatchForModifsStartCommand);

                if (Ext.isNumber(wnd.pathInfo.id)) {
                    if (!Ext.isEmpty(wnd.pathInfo.emails) && wnd.pathInfo.emails.trim().length > 0) {
                        emailFld.setValue(wnd.pathInfo.emails);
                        cbEmails.setValue(true);
                        emailFld.setDisabled(false);
                        cbIgnore.setDisabled(false);
                        cbIgnore.setValue(wnd.pathInfo.iown);
                    }
                    if (!Ext.isEmpty(wnd.pathInfo.users) && wnd.pathInfo.users.trim().length > 0) {
                        usersFld.setValue(wnd.pathInfo.users);
                        cbUsers.setValue(true);
                        usersFld.setDisabled(false);
                        cbUsers.setDisabled(false);
                    }
                    if (!Ext.isEmpty(wnd.pathInfo.actions) && actsCbs) {
                        var actsArr = wnd.pathInfo.actions.split(',');
                        actsCb.setValue(false);
                        actsCbs.setDisabled(false);
                        Ext.each(actsCbs.items.items, function (item) {
                            if (item) {
                                item.setValue(false);
                            }
                        });
                        var actsExist = false;
                        if (actsArr.length > 0) {
                            Ext.each(actsArr, function (item) {
                                var cmp = actsCbs.getComponent(item);
                                if (cmp) {
                                    cmp.setValue(true);
                                    if (!actsExist) {
                                        actsExist = true;
                                    }
                                }
                            });
                        }
                        if (!actsExist) {
                            actsCb.setValue(true);
                            actsCbs.setDisabled(true);
                            Ext.each(actsCbs.items.items, function (item) {
                                if (item) {
                                    item.setValue(true);
                                }
                            });
                        }
                    }
                    wnd.buttons[0].setText(config.htcConfig.locData.CommandSave);
                }

                return true;
            },
            hide: function (wnd) {
                wnd.viewWindow = null;
                wnd.pathInfo = null;
            }
        }
    });

    return self;
};