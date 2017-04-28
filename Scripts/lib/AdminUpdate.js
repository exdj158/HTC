Ext.ns('HttpCommander.Lib');

/**
 *   config:
 *       htcConfig, getAjaxRequestTimeout()
 */
HttpCommander.Lib.AdminUpdate = function (config) {
    var spot = new Ext.ux.Spotlight({
        easing: 'easeOut',
        duration: .3
    });
    var cancelBtnCfg = {
        text: config.htcConfig.locData.CommonButtonCaptionCancel,
        handler: function (btn) {
            backupPanel.update(String.format(config.htcConfig.locData.AdminUpdateBackupContent, '<strong>' + config.htcConfig.locData.AdminUpdateBackupButton + '</strong>'));
            if (!!downPanel && downPanel.rendered) {
                if (!Ext.isEmpty(downPanel.link)) {
                    var lnk = downPanel.link + '&delete=true';
                    Ext.Ajax.request({ url: lnk });
                }
                downPanel.link = '';
                downPanel.update({ link: '', name: '' });
            }
            var frm;
            applyPanel.auto = false;
            applyPanel.buttons[2].setText(config.htcConfig.locData.AdminUpdateUploadButton);
            var applyItems;
            if (!!(frm = (applyItems = applyPanel.items.items[0]).getForm())) {
                frm.reset();
                applyItems = applyItems.items;
                applyItems.items[0].setVisible(false);
                applyItems.items[1].setVisible(false);
                applyItems.items[2].setText(config.htcConfig.locData.AdminUpdateFinishContent + '<br />', false);
                applyItems.items[3].backupName = null;
                applyItems.items[5].setVisible(false);
            }
            updateSpot(false);
        }
    };
    var UpgradePanel = Ext.extend(Ext.Panel, {
        frame: true,
        width: 310,
        height: 300,
        bodyStyle: 'padding:5px 10px;',
        buttonAlign: 'left',
        toggle: function (on) {
            this.setDisabled(!on);
        }
    });
    var stopUpload = function () {
        var upload_frame = Ext.getBody().child('iframe.x-hidden:last');
        if (upload_frame) {
            if (HttpCommander.Lib.Utils.browserIs.ie)
                window.frames[upload_frame.id].window.document.execCommand('Stop');
            else
                window.frames[upload_frame.id].window.stop();
        }
        Ext.Msg.hide();
    };
    var oldAjaxTimeout = Ext.Ajax.timeout,
        loadingMask = new Ext.LoadMask(Ext.getBody(), {
            msg: config.htcConfig.locData.ProgressLoading + "...",
            removeMask: true
        }),
        showLoadingMask = function () {
            Ext.Msg.hide();
            loadingMask.hide();
            Ext.Ajax.timeout = config.getAjaxRequestTimeout();
            loadingMask.show();
        },
        hideLoadingMask = function () {
            Ext.Ajax.timeout = oldAjaxTimeout;
            Ext.Msg.hide();
            loadingMask.hide();
        };
    var self, backupPanel, downPanel, applyPanel;
    var panels = [backupPanel = new UpgradePanel({
        id: 'admin-update-backup',
        title: String.format(config.htcConfig.locData.AdminUpdateStepTitle, config.htcConfig.locData.AdminUpdateNumberSymbol,
            1, config.htcConfig.locData.AdminUpdateBackupButton),
        html: String.format(config.htcConfig.locData.AdminUpdateBackupContent, '<strong>' + config.htcConfig.locData.AdminUpdateBackupButton + '</strong>'),
        buttons: [cancelBtnCfg, '->', {
            text: config.htcConfig.locData.AdminUpdateBackupButton,
            handler: function (btn) {
                showLoadingMask();
                HttpCommander.Admin.BackupRoot({}, function (data, trans) {
                    hideLoadingMask();
                    if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, config.htcConfig)) {
                        var lnk = config.htcConfig.relativePath + "Handlers/Download.ashx?backup=" + encodeURIComponent(data.filename);
                        downPanel.link = lnk;
                        downPanel.update({
                            link: lnk,
                            name: data.filename
                        });
                        if (applyPanel.auto) {
                            if (!Ext.isFunction(window.showAutoStep23)) {
                                window.showAutoStep23 = function (a) {
                                    applyPanel.auto = true;
                                    applyPanel.buttons[2].setText(config.htcConfig.locData.AdminUpdateUploadAndInstallButton);
                                    var applyItems = applyPanel.items.items[0].items;
                                    applyItems.items[0].setVisible(true);
                                    applyItems.items[1].setVisible(true);
                                    applyItems.items[2].setText(config.htcConfig.locData.AdminUpdateFinishContent + config.htcConfig.locData.AdminUpdateRestoreFromBackupEmpty + '<br />', false);
                                    applyItems.items[3].backupName = data.filename;
                                    updateSpot('admin-update-finish');
                                };
                            }
                            backupPanel.update(String.format(config.htcConfig.locData.AdminUpdateBackupContent, '<strong>' + config.htcConfig.locData.AdminUpdateBackupButton + '</strong>')
                                + '<br /><br /><div>' + Ext.util.Format.htmlEncode(config.htcConfig.locData.AdminUpdateDownloadBackupLinkHint) + '</div>'
                                + '<a href="' + Ext.util.Format.htmlEncode(lnk) + '" target="_blank" onclick="showAutoStep23(this);return true;">'
                                + Ext.util.Format.htmlEncode(data.filename) + '</a><br /><br />');
                        } else {
                            backupPanel.update(String.format(config.htcConfig.locData.AdminUpdateBackupContent, '<strong>' + config.htcConfig.locData.AdminUpdateBackupButton + '</strong>'));
                            updateSpot('admin-update-download');
                        }
                    }
                });
            }
        }]
    }), downPanel = new UpgradePanel({
        id: 'admin-update-download',
        title: String.format(config.htcConfig.locData.AdminUpdateStepTitle, config.htcConfig.locData.AdminUpdateNumberSymbol,
            2, config.htcConfig.locData.AdminUpdateDownloadNewButton),
        tpl: new Ext.XTemplate(
            '<tpl if="!Ext.isEmpty(link)">',
                '<div>' + Ext.util.Format.htmlEncode(config.htcConfig.locData.AdminUpdateDownloadBackupLinkHint) + '</div>',
                '<a href="{link:htmlEncode}" target="_blank">{name:htmlEncode}</a><br /><br />',
            '</tpl>',
            '<p>',
                String.format(config.htcConfig.locData.AdminUpdateDownloadNewContent,
                    '<a href="//www.element-it.com/OnlineHelpHTTPCommander/' + ((config.htcConfig.version || 'st').toLowerCase() == 'ad' ? 'Windows' : 'Forms') + '/win2008.html#installationHTTPCOM" target="_blank">',
                    '</a>',
                    '<a href="//www.element-it.com/OnlineHelpHTTPCommander/' + ((config.htcConfig.version || 'st').toLowerCase() == 'ad' ? 'Windows' : 'Forms') + '/faq.html#updatewithexistingsettings" target="_blank">',
                    Ext.util.Format.htmlEncode(config.htcConfig.locData.AdminUpdateTab),
                    Ext.util.Format.htmlEncode(config.htcConfig.locData.AdminUpdateFinishButton)
                ),
            '</p>'
        ),
        data: {
            link: '',
            name: ''
        },
        buttons: [cancelBtnCfg, '->', {
            text: config.htcConfig.locData.AdminUpdateDownloadNewButton,
            xtype: 'box',
            autoEl: {
                tag: 'a',
                href: '//www.element-it.com/download.aspx?type=' + encodeURIComponent(config.htcConfig.version || 'st'),
                target: '_blank',
                html: config.htcConfig.locData.AdminUpdateDownloadNewButton
            }
        }]
    }), applyPanel = new UpgradePanel({
        id: 'admin-update-finish',
        title: String.format(config.htcConfig.locData.AdminUpdateStepTitle, config.htcConfig.locData.AdminUpdateNumberSymbol,
            3, config.htcConfig.locData.AdminUpdateFinishButton),
        layout: 'fit',
        items: new Ext.FormPanel({
            layout: 'fit',
            fileUpload: true,
            plain: true,
            frame: false,
            padding: 0,
            items: [{
                xtype: 'label',
                html: config.htcConfig.locData.AdminUpdateInstallZipPathHint + '<br />',
                hidden: true
            }, {
                xtype: 'textfield',
                hideLabel: true,
                width: 277,
                hidden: true,
                id: 'upgrade-install-zip-field',
                name: 'upgrade-install-zip-field',
                emptyText: config.htcConfig.locData.AdminUpdateInstallZipPathEmpty
            }, {
                xtype: 'label',
                html: config.htcConfig.locData.AdminUpdateFinishContent + '<br />'
            }, {
                xtype: 'fileuploadfield',
                hideLabel: true,
                width: '100%',
                id: 'backup-upload-field',
                name: 'backup-upload-field',
                accept: '.zip,application/zip,application/x-zip,application/x-zip-compressed',
                emptyText: config.htcConfig.locData.AdminUpdateUploadEmptyText + '...',
                buttonText: config.htcConfig.locData.UploadBrowseLabel
            }, {
                xtype: 'checkbox',
                style: {
                    marginTop: '10px'
                },
                boxLabel: config.htcConfig.locData.AdminUpdateRestoreWebConfigCheckBox,
                checked: true
            }, {
                xtype: 'label',
                hidden: true,
                html: '<br />' + config.htcConfig.locData.AdminUpdateFinishMessage + '<br />'
                    + '<a href="//www.element-it.com/OnlineHelpHTTPCommander/' + ((config.htcConfig.version || 'st').toLowerCase() == 'ad' ? 'Windows' : 'Forms') + '/faq.html#updatewithexistingsettings" target="_blank">'
                    + 'FAQ: How can I update my existing installation</a>'
            }]
        }),
        buttons: [cancelBtnCfg, '->', {
            text: config.htcConfig.locData.AdminUpdateUploadButton,
            handler: function (btn) {
                var applyItems = applyPanel.items.items[0].items;
                var finishLbl = applyItems.items[5];
                var wccb = applyItems.items[4].getValue();
                finishLbl.setVisible(false);
                var form = applyPanel.items.items[0].getForm();
                if (!form.isValid()) {
                    return;
                }

                var installZipFld = form.items.items[0];
                var installZip = installZipFld.isVisible() ? installZipFld.getValue() : null;
                var backupZipFld = form.items.items[1];
                var backupName = backupZipFld.backupName;

                if (Ext.isEmpty(backupZipFld.getValue()) && Ext.isEmpty(backupName)) {
                    Ext.Msg.show({
                        title: config.htcConfig.locData.CommonErrorCaption,
                        msg: Ext.util.Format.htmlEncode(config.htcConfig.locData.AdminUpdateUploadEmptyText),
                        modal: true,
                        buttons: Ext.Msg.CANCEL,
                        icon: Ext.Msg.ERROR
                    });
                    return;
                }

                var uploadUrl = config.htcConfig.relativePath + 'Handlers/Upload.ashx?restore='
                    + (applyPanel.auto ? 'auto' : 'manual')
                    + ('&webconfig=' + wccb)
                    + (!Ext.isEmpty(backupName) ? ('&backup=' + encodeURIComponent(backupName)) : '')
                    + (!Ext.isEmpty(installZip) ? ('&install=' + encodeURIComponent(installZip)) : '');
                var loadingMsg = Ext.Msg.show({
                    title: config.htcConfig.locData.CommonProgressPleaseWait,
                    msg: "<img src='" + HttpCommander.Lib.Utils.getIconPath(config, 'ajax-loader.gif') + "' class='filetypeimage'>&nbsp;"
                        + config.htcConfig.locData.AdminUpdateProgress + "...",
                    modal: true,
                    closable: false,
                    width: 220,
                    buttons: { cancel: config.htcConfig.locData.StopUploadingButtonText },
                    fn: stopUpload,
                    scope: form
                });
                var onUploadComplete = function (form, action) {
                    var msg = null, needReload = false;
                    Ext.Msg.hide();
                    loadingMsg.hide();

                    if (!!action && !!action.result) {
                        msg = action.result.message;
                        needReload = (action.result.needReload === true);
                    }

                    if (!!action && !!action.failureType) {
                        switch (action.failureType) {
                            case Ext.form.Action.CLIENT_INVALID:
                                msg = config.htcConfig.locData.UploadInvalidFormFields;
                                break;
                            case Ext.form.Action.CONNECT_FAILURE:
                                msg = config.htcConfig.locData.UploadAjaxFailed;
                                break;
                            case Ext.form.Action.SERVER_INVALID:
                            case Ext.form.Action.LOAD_FAILURE:
                                if (!!action.result && !!action.result.responseNotParsed && !!action.response) {
                                    if (action.response.url && (String(action.response.url)).toLowerCase()
                                            .indexOf(config.getAppRootUrl().toLowerCase() + 'default.aspx') == 0) {
                                        window.location.href = action.response.url.split('?')[0];
                                        return;
                                    } else if (!!action.response && !!action.response.responseText) {
                                        var serverMessage = action.response.responseText;
                                        var onClickShowErrorElement = "<a href='#' onclick='showPageError();return false;'>";
                                        msg = String.format(config.htcConfig.locData.SimpleUploadErrorInfo, onClickShowErrorElement);
                                        if (!Ext.isFunction(window.showPageError)) {
                                            window.showPageError = function () {
                                                if (serverMessage) {
                                                    var windowError = window.open('', '_blank');
                                                    windowError.document.write(serverMessage);
                                                }
                                            }
                                        }
                                    }
                                }
                                break;
                        }
                    }

                    if (Ext.isEmpty(msg)) {

                        if (needReload) {
                            Ext.Msg.show({
                                title: config.htcConfig.locData.CommonWarningCaption,
                                msg: Ext.util.Format.htmlEncode(String.format(config.htcConfig.locData.AdminUpdateNeedRefreshPageForContinue, config.htcConfig.locData.CommonButtonCaptionOK)),
                                modal: true,
                                buttons: Ext.Msg.OK,
                                icon: Ext.Msg.WARNING,
                                fn: function (btn) {
                                    window.location.reload(true);
                                }
                            });
                            return;
                        }

                        form.reset();
                        finishLbl.setVisible(true);
                        Ext.Msg.show({
                            title: config.htcConfig.locData.AdminUpdateFinishButton,
                            msg: config.htcConfig.locData.AdminUpdateFinishMessage
                                + '<br /><br /><a href="//www.element-it.com/OnlineHelpHTTPCommander/' + ((config.htcConfig.version || 'st').toLowerCase() == 'ad' ? 'Windows' : 'Forms') + '/faq.html#updatewithexistingsettings" target="_blank">'
                                + 'FAQ: How can I update my existing installation</a>' + '<br /><br />'
                                + config.htcConfig.locData.AdminUpdateFinishRefreshPage,
                            modal: true,
                            buttons: Ext.Msg.OK,
                            icon: Ext.Msg.INFO,
                            fn: function () {
                                window.location.reload(true);
                            }
                        });
                    } else {
                        Ext.Msg.show({
                            title: config.htcConfig.locData.CommonErrorCaption,
                            msg: msg + (needReload ? ('<br /><br />'
                                + Ext.util.Format.htmlEncode(String.format(config.htcConfig.locData.AdminUpdateNeedRefreshPageForContinue, config.htcConfig.locData.CommonButtonCaptionOK))) : ''),
                            modal: true,
                            buttons: needReload ? Ext.Msg.OK : Ext.Msg.CANCEL,
                            icon: Ext.Msg.ERROR,
                            fn: function () {
                                if (needReload) {
                                    window.location.reload(true);
                                }
                            }
                        });
                    }
                };
                form.submit({
                    url: uploadUrl,
                    success: onUploadComplete,
                    failure: onUploadComplete
                });
            }
        }]
    })];
    var updateSpot = function (id) {
        if (typeof id == 'string') {
            if (!!spot.el && !!spot.all) {
                spot.destroy();
            }
            spot.show(id);
        } else if (!id && spot.active) {
            spot.hide();
        }
        Ext.each(panels, function (p) {
            p.toggle.call(p, id == p.id)
        });
    };

    var tabItems = [{
        xtype: 'panel',
        colspan: 3,
        header: false,
        frame: false,
        border: false,
        plain: true,
        autoHegith: true,
        forceLayout: true,
        height: 315,
        layout: {
            type: 'vbox',
            align: 'center'
        },
        listeners: {
            afterrender: function (p) {
                var info = p.items.items[0];
                var curv = Ext.isArray(config.htcConfig.hccurrentversion)
                    ? config.htcConfig.hccurrentversion.join('.') : '&nbsp;';
                var newv = Ext.isArray(window.hclatestversion) && window.hclatestversion.length > 0
                    ? window.hclatestversion.join('.') : '&nbsp;';
                var html = String.format(htcConfig.locData.AdminNewVersionAvailableInfo,
                        '<b>' + curv + '</b>', '<span id="hcLatestVersionSpan" style="font-weight:bold;">' + newv + '</span>')
                    + '<br/>'
                    + '<a href="//www.element-it.com/httpcommander-changelog.aspx" target="_blank">Changelog page</a>&nbsp;&nbsp;&nbsp;&nbsp;'
                    + '<a href="' + '//www.element-it.com/checklicense.aspx'
                        + (!!config.htcConfig.licenseInfo && !!config.htcConfig.licenseInfo.hash ? ('?key=' + encodeURIComponent(config.htcConfig.licenseInfo.hash)) : '')
                    + '" target="_blank">Check license page</a><br />';
                var message = config.htcConfig.locData.LicenseTrial;
                var licInfo = config.htcConfig.licenseInfo;
                if (!config.htcConfig.showTrial && licInfo) {
                    if (licInfo.usersCount < 0)
                        licInfo.usersCount = "Unlimited";
                    message = String.format(config.htcConfig.locData.LicensePrompt, '<br />', licInfo.usersCount, licInfo.purchaseDate
                        + (licInfo.forVersion ? ('<br />For version: ' + licInfo.forVersion) : ''));
                    if (!config.htcConfig.showUpgrade) {
                        if (licInfo.daysForFreeUpgrade < 0) {
                            message += "Your license type allow you to perform minor upgrades for free and major version upgrades with 50% discount.<br />";
                        } else {
                            message += String.format(config.htcConfig.locData.LicenseFreeUpgradeMessage, licInfo.daysForFreeUpgrade) + "&nbsp;&nbsp;&nbsp;&nbsp;";
                        }
                        message += "<a href='//www.element-it.com/purchase.aspx?product=httpcommander' target='_blank'>HTTPCommander purchase page</a>";
                    }
                } else {
                    message += config.htcConfig.demoExpired
                        ? ".<br /><b style='color:Red;'>Your evaluation period has expired!</b>"
                        : ('.<br />Days left: ' + config.htcConfig.trialDaysLeft);
                }
                html += message;
                info.setText(html, false);
            }
        },
        items: [{
            xtype: 'label',
            html: '',
            style: {
                paddingBottom: '10px'
            }
        }, {
            xtype: 'panel',
            width: '100%',
            anchor: '100%',
            layout: 'column',
            layoutConfig: {
                columns: 2,
                tableAttrs: {
                    align: 'center'
                }
            },
            header: false,
            border: false,
            plain: true,
            frame: false,
            colspan: 3,
            defaultType: 'panel',
            forceLayout: true,
            defaults: {
                layout: 'fit',
                width: '100%',
                anchor: '100%',
                plain: true,
                flex: 1,
                frame: false,
                border: true,
                autoScroll: true,
                height: 175,
                columnWidth: .5,
                buttonAlign: 'center'
            },
            items: [{
                title: config.htcConfig.locData.AdminUpdateManual,
                html: config.htcConfig.locData.AdminUpdateMainInfo,
                style: {
                    paddingRight: '10px'
                },
                buttons: [{
                    xtype: 'button',
                    text: config.htcConfig.locData.AdminUpdateStartButton + '&nbsp;(' + String.format(config.htcConfig.locData.AdminUpdateStepInfo,
                        config.htcConfig.locData.AdminUpdateNumberSymbol, '1-2)'),
                    handler: function (btn) {
                        if (!!downPanel && downPanel.rendered) {
                            downPanel.link = '';
                            downPanel.update({ link: '', name: '' });
                        }
                        updateSpot('admin-update-backup');
                    }
                }, {
                    xtype: 'button',
                    text: config.htcConfig.locData.AdminUpdateFinishButton + '&nbsp;(' + String.format(config.htcConfig.locData.AdminUpdateStepInfo,
                        config.htcConfig.locData.AdminUpdateNumberSymbol, '3)'),
                    handler: function (btn) {
                        backupPanel.update(String.format(config.htcConfig.locData.AdminUpdateBackupContent, '<strong>' + config.htcConfig.locData.AdminUpdateBackupButton + '</strong>'));
                        applyPanel.auto = false;
                        applyPanel.buttons[2].setText(config.htcConfig.locData.AdminUpdateUploadButton);
                        applyItems = applyPanel.items.items[0].items;
                        applyItems.items[0].setVisible(false);
                        applyItems.items[1].setVisible(false);
                        applyItems.items[2].setText(config.htcConfig.locData.AdminUpdateFinishContent + '<br />', false);
                        applyItems.items[3].backupName = null;
                        updateSpot('admin-update-finish');
                    }
                }]
            }, {
                title: config.htcConfig.locData.AdminUpdateAuto,
                html: config.htcConfig.locData.AdminUpdateAutoInfo,
                buttons: [{
                    xtype: 'button',
                    text: String.format(config.htcConfig.locData.AdminUpdateStepInfo, config.htcConfig.locData.AdminUpdateNumberSymbol, '1'),
                    handler: function (btn) {
                        backupPanel.update(String.format(config.htcConfig.locData.AdminUpdateBackupContent, '<strong>' + config.htcConfig.locData.AdminUpdateBackupButton + '</strong>'));
                        applyPanel.auto = true;
                        applyItems = applyPanel.items.items[0].items;
                        applyItems.items[0].setVisible(true);
                        applyItems.items[1].setVisible(true);
                        if (!!downPanel && downPanel.rendered) {
                            downPanel.link = '';
                            downPanel.update({ link: '', name: '' });
                        }
                        updateSpot('admin-update-backup');
                    }
                },  {
                    xtype: 'button',
                    text: config.htcConfig.locData.AdminUpdateAutoButton + '&nbsp;' + String.format(config.htcConfig.locData.AdminUpdateStepInfo,
                        config.htcConfig.locData.AdminUpdateNumberSymbol, '2-3'),
                    handler: function (btn) {
                        applyPanel.auto = true;
                        applyPanel.buttons[2].setText(config.htcConfig.locData.AdminUpdateUploadAndInstallButton);
                        applyItems = applyPanel.items.items[0].items;
                        applyItems.items[0].setVisible(true);
                        applyItems.items[1].setVisible(true);
                        updateSpot('admin-update-finish');
                    }
                }]
            }]
        }]
    }];
    for (var i = 0; i < panels.length; i++) {
        tabItems.push(panels[i]);
    }

    return (self = new Ext.Panel({
        id: 'update-tab',
        title: config.htcConfig.locData.AdminUpdateTab,
        padding: 5,
        autoScroll: true,
        layout: 'table',
        cls: 'admin-update-tab',
        layoutConfig: {
            columns: 3,
            tableAttrs: {
                align: 'center'
            }
        },
        items: tabItems,
        prepare: function () {
            if (!!downPanel && downPanel.rendered) {
                downPanel.link = '';
                downPanel.update({ link: '', name: '' });
            }
            updateSpot(false);
        }
    }));
};