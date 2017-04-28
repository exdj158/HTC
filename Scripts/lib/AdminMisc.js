Ext.ns('HttpCommander.Lib');

/**
 *   config:
 *       htcConfig, getAjaxRequestTimeout()
 */
HttpCommander.Lib.AdminMisc = function (config) {
    // VARS section
    var loadADAccountsForm = null,
        manageQuotasForm = null,
        foldersGPOLForm = null,
        gpolFrom = config.htcConfig.gpolFrom,
        gpolToPerms = config.htcConfig.gpolToPerms,
        extendedAjaxRequestTimeout = 5 * 60 * 1000,
        loadingMask = null, // it is initialized on first use
        prepareLoadingMask = function () {
            if (loadingMask == null) {
                loadingMask = new Ext.LoadMask(Ext.getBody(), {
                    msg: config.htcConfig.locData.ProgressLoading + "...",
                    removeMask: false
                });
                loadingMask.showCnt = 0;
            }
        },
        showLoadingMask = function () {
            prepareLoadingMask();
            loadingMask.showCnt += 1;
            if (loadingMask.showCnt == 1)
                loadingMask.show();
        },
        hideLoadingMask = function () {
            prepareLoadingMask();
            if (loadingMask.showCnt > 0) {
                loadingMask.showCnt -= 1;
                if (loadingMask.showCnt == 0)
                    loadingMask.hide();
            }
        };

    // return main object
    return {
        title: config.htcConfig.locData.AdminMiscTab,
        id: 'misc-tab',
        padding: 5,
        autoScroll: true,
        layout: 'table',
        cls: 'admin-misc-tab',
        layoutConfig: { columns: 2 },
        items:
        [
            loadADAccountsForm = new Ext.FormPanel({
                labelWidth: 110,
                title: config.htcConfig.locData.AdminMiscLoadADAccountsTitle,
                frame: false,
                padding: 5,
                width: 400,
                defaults: {
                    xtype: 'textfield',
                    anchor: '100%'
                },
                items:
                [
                    {
                        xtype: 'label',
                        html: String.format(config.htcConfig.locData.AdminMiscLoadADAccountsInfo,
                            '<a href="javascript:showHelpWindow(' + "'Manual/webconfigsetup.html#ADAccountsFilePath'" + ')">', '</a>')
                    },
                    {
                        id: 'load-ada-ldap',
                        fieldLabel: config.htcConfig.locData.AdminMiscLoadADAccountsLdap,
                        value: config.htcConfig.ldapContainer
                    },
                    {
                        id: 'load-ada-user',
                        fieldLabel: config.htcConfig.locData.CommonFieldLabelUserName
                    },
                    {
                        id: 'load-ada-pwd',
                        inputType: 'password',
                        fieldLabel: config.htcConfig.locData.CommonFieldLabelPassword
                    },
                    {
                        id: 'load-ada-file',
                        fieldLabel: config.htcConfig.locData.AdminMiscLoadADAccountsToFile,
                        allowBlank: false,
                        name: 'load-ada-file',
                        value: config.htcConfig.adAccountsFile
                    }
                ],
                buttons:
                [
                    {
                        text: config.htcConfig.locData.AdminMiscLoadADAccountsResetButton,
                        handler: function () {
                            loadADAccountsForm.getForm().reset();
                            loadADAccountsForm.findById('load-ada-file').setValue(config.htcConfig.adAccountsFile);
                        }
                    },
                    {
                        text: config.htcConfig.locData.AdminMiscLoadADAccountsLoadButton,
                        handler: function () {
                            if (loadADAccountsForm.getForm().isValid()) {
                                var loadInfo = {
                                    ldap: loadADAccountsForm.findById('load-ada-ldap').getValue(),
                                    user: loadADAccountsForm.findById('load-ada-user').getValue(),
                                    pwd: loadADAccountsForm.findById('load-ada-pwd').getValue(),
                                    file: loadADAccountsForm.findById('load-ada-file').getValue()
                                };
                                var oldAjaxTimeout = Ext.Ajax.timeout;
                                Ext.Ajax.timeout = config.getAjaxRequestTimeout();
                                showLoadingMask();
                                HttpCommander.Admin.LoadADAccounts(loadInfo, function (data, trans) {
                                    hideLoadingMask();
                                    Ext.Ajax.timeout = oldAjaxTimeout;
                                    if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, config.htcConfig)) {
                                        Ext.Msg.alert('', config.htcConfig.locData.AdminMiscLoadADAccountsSuccessMessage);
                                    }
                                });
                            }
                        }
                    }
                ]
            }),
            manageQuotasForm = new Ext.FormPanel({
                labelWidth: 110,
                title: config.htcConfig.locData.AdminMiscManageQuotasTitle,
                frame: false,
                padding: 5,
                width: 400,
                defaults: {
                    xtype: 'textfield',
                    anchor: '100%'
                },
                items:
                [
                    {
                        xtype: 'label',
                        html: config.htcConfig.locData.AdminMiscManageQuotasInfo
                            + " <a href='javascript:navigateHelpAdminPanelWithFragment(\"quota\")'>"
                            + config.htcConfig.locData.AdminFoldersFolderQuotaMoreInfoLink + "</a>"
                    },
                    {
                        id: 'manage-quotas-folder-path',
                        fieldLabel: config.htcConfig.locData.AdminMiscManageQuotasFolderPath
                    },
                    {
                        id: 'manage-quotas-quota-limit',
                        fieldLabel: config.htcConfig.locData.AdminMiscManageQuotasQuota
                    }
                ],
                buttons:
                [
                    {
                        text: config.htcConfig.locData.AdminMiscManageQuotasGetQuota,
                        handler: function () {
                            var folderPathField = manageQuotasForm.findById('manage-quotas-folder-path');
                            if (folderPathField.getValue() == '')
                                return;
                            var pathInfo = { path: folderPathField.getValue() };
                            showLoadingMask();
                            var oldAjaxTimeout = Ext.Ajax.timeout;
                            Ext.Ajax.timeout = extendedAjaxRequestTimeout;
                            HttpCommander.Admin.GetQuotaLimit(pathInfo, function (data, trans) {
                                Ext.Ajax.timeout = oldAjaxTimeout;
                                hideLoadingMask();
                                var quotaLimitField = manageQuotasForm.findById('manage-quotas-quota-limit');
                                quotaLimitField.setValue('');
                                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, config.htcConfig)) {
                                    quotaLimitField.setValue(data.quota);
                                }
                            });
                        }
                    },
                    {
                        text: config.htcConfig.locData.AdminMiscManageQuotasSetQuota,
                        handler: function () {
                            var folderPathField = manageQuotasForm.findById('manage-quotas-folder-path');
                            if (folderPathField.getValue() == '')
                                return;
                            var quotaLimitField = manageQuotasForm.findById('manage-quotas-quota-limit');
                            var quota = quotaLimitField.getValue();
                            quota = parseInt(quota);
                            quotaLimitField.setValue(quota);
                            if (!(quota > 0)) {
                                quotaLimitField.focus();
                                Ext.Msg.alert(config.htcConfig.locData.CommonErrorCaption, config.htcConfig.locData.FsrmInvalidQuotaValueMsg);
                                return;
                            }
                            var pathInfo = { path: folderPathField.getValue(), quota: quota };
                            showLoadingMask();
                            var oldAjaxTimeout = Ext.Ajax.timeout;
                            Ext.Ajax.timeout = extendedAjaxRequestTimeout;
                            HttpCommander.Admin.SetQuotaLimit(pathInfo, function (data, trans) {
                                Ext.Ajax.timeout = oldAjaxTimeout;
                                hideLoadingMask();
                                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, config.htcConfig)) {
                                    Ext.Msg.alert(config.htcConfig.locData.CommonInfoCaption, config.htcConfig.locData.FsrmQuotaSetMsg);
                                }
                            });
                        }
                    }
                ]
            }),
            foldersGPOLForm = new Ext.FormPanel({
                labelWidth: 110,
                title: config.htcConfig.locData.AdminMiscFoldersFromGPOLTitle,
                frame: false,
                padding: 5,
                width: 400,
                defaults: {
                    xtype: 'textfield',
                    anchor: '100%'
                },
                items:
                [
                    {
                        xtype: 'label',
                        html: config.htcConfig.locData.AdminMiscFoldersFromGPOLInfo
                            + " <a href='javascript:navigateHelpAdminPanelWithFragment(\"gpolfolders\")'>"
                            + config.htcConfig.locData.AdminFoldersFolderQuotaMoreInfoLink + "</a>"
                    },
                    {
                        xtype: 'radiogroup',
                        id: 'fodlers-gpol-dc-or-file',
                        name: 'fodlers-gpol-dc-or-file',
                        items:
                        [
                            {
                                boxLabel: config.htcConfig.locData.AdminMiscFoldersFromGPOLFromDC,
                                name: 'rb-auto1',
                                inputValue: 1,
                                checked: !gpolFrom, //true,
                                fromDC: true,
                                listeners: {
                                    check: function (rb, ch) {
                                        var f = Ext.getCmp('folders-gpol-computer-name');
                                        if (f) {
                                            f.label.update(config.htcConfig.locData[ch ? 'AdminMiscFoldersFromGPOLComputerName' : 'AdminMiscFoldersFromGPOLFilePath'] + ':');
                                            f.setValue('');
                                        }
                                    }
                                }
                            },
                            {
                                checked: gpolFrom,
                                fromDC: false,
                                boxLabel: config.htcConfig.locData.AdminMiscFoldersFromGPOLFromFile,
                                name: 'rb-auto1',
                                inputValue: 0
                            }
                        ]
                    },
                    {
                        id: 'folders-gpol-computer-name',
                        fieldLabel: config.htcConfig.locData[gpolFrom ? 'AdminMiscFoldersFromGPOLFilePath' : 'AdminMiscFoldersFromGPOLComputerName'],
                        value: gpolFrom ? gpolFrom : ""
                    },
                    {
                        xtype: 'label',
                        text: config.htcConfig.locData.AdminMiscFoldersTargetLabel
                    },
                    {
                        xtype: 'radiogroup',
                        id: 'fodlers-gpol-target',
                        name: 'fodlers-gpol-target',
                        items:
                        [
                            {
                                boxLabel: config.htcConfig.locData.AdminMiscFoldersTargetFilter,
                                name: 'rb-auto2',
                                inputValue: 1,
                                checked: !gpolToPerms, //true,
                                toPerms: false
                            },
                            {
                                checked: gpolToPerms,
                                toPerms: true,
                                boxLabel: config.htcConfig.locData.AdminMiscFoldersTargetPermission,
                                name: 'rb-auto2',
                                inputValue: 0
                            }
                        ]
                    }
                ],
                buttons:
                [
                    {
                        text: config.htcConfig.locData.AdminMiscFoldersFromGPOLResetButton,
                        handler: function () {
                            foldersGPOLForm.getForm().reset();

                        }
                    },
                    {
                        text: config.htcConfig.locData.AdminMiscLoadADAccountsLoadButton,
                        handler: function () {
                            var form = foldersGPOLForm.getForm();
                            var dc = form.findField('fodlers-gpol-dc-or-file').getValue().fromDC;
                            var tg = form.findField('fodlers-gpol-target').getValue().toPerms;
                            var loadInfo = {
                                field: foldersGPOLForm.findById('folders-gpol-computer-name').getValue(),
                                fromDC: dc,
                                toPerms: tg
                            };
                            var oldAjaxTimeout = Ext.Ajax.timeout;
                            Ext.Ajax.timeout = config.getAjaxRequestTimeout();
                            showLoadingMask();
                            HttpCommander.Admin.LoadFolderGPOL(loadInfo, function (data, trans) {
                                hideLoadingMask();
                                Ext.Ajax.timeout = oldAjaxTimeout;
                                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, config.htcConfig)) {
                                    Ext.Msg.alert('', String.format(config.htcConfig.locData.AdminMiscFoldersFromGPOLSuccessMessage, data.added, data.updated));
                                }
                            });

                        }
                    }
                ]
            })
        ]
    };
};