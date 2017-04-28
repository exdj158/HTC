Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, getUid(), $, globalLoadMask, showHelpWindow(),
initAndShowViewLinksWindow(), hideViewLinksWindow(), openGridFolder(), setSelectPath(),
openSharedByLink(), getCurrentFolder(), initSendEmail(), showBalloon()
*/
HttpCommander.Lib.CreatePublicLinkWindow = function (config) {
    var self,
        accessUsersFS,
        publicLinkForm,
        anonAccessControl,
        anonDownCb,
        anonUpCb,
        anonViewCb,
        anonZipCb,
        overwriteRG,
        downOrViewLink,
        advOptFS,
        hiddenSendEmail = function () {
            return (config.htcConfig.enableSendEmail != 'any' && config.htcConfig.enableSendEmail != 'linksonly') ||
                !config.htcConfig.allowSendPublicLinksProp;
        },
        hiddenShareLink = function () {
            return !config.htcConfig.allowSendPublicLinksProp;
        };

    function getLinkDefaultExpireDate(days) {
        var ds = Ext.isNumber(days) && days > 0 ? days : config.htcConfig.publicLinkDefaultValidPeriod;
        var ms = (new Date()).getTime();
        ms += ds * 24 * 60 * 60 * 1000;
        var d = new Date(ms);
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);
        return d;
    }

    function sendViaService(url, name) {
        if (!self || Ext.isEmpty(url) || hiddenShareLink() ||
            ((name == 'gmail' || name == 'outlook') && hiddenSendEmail())) {
            return false;
        }

        var isFacebook = (name == 'facebook');
        var body = ''
        var lnk = isFacebook ? self.lnk : self.shortLnk;
        var sLnk = isFacebook ? self.shortLnk : self.lnk;
        if (sLnk == lnk) {
            sLnk = null;
        }
        if (lnk && lnk.length > 0) {
            body += lnk
        }
        if ((name == 'gmail' || name == 'outlook' || body.length == 0) && sLnk && sLnk.length > 0) {
            if (body.length > 0) {
                body += '\n\n';
            }
            body += sLnk;
        }
        if (body.length == 0) {
            return false;
        }
        var sendWindow = window.open(url + encodeURIComponent(body),
            'publiclinksend' + (name || 'unknown'),
            HttpCommander.Lib.Utils.getPopupProps(600, 500));
        if (sendWindow) {
            try { sendWindow.focus(); }
            catch (e) { }
        }
        return true;
    }

    self = new config.Window({
        lnk: null,
        shortLnk: null,
        title: config.htcConfig.locData.CommandMakePublicFolder,
        bodyStyle: 'padding:5px',
        resizable: true,
        closeAction: 'hide',
        autoHeight: true,
        minWidth: 300,
        width: 400,
        layout: 'fit',
        virtPath: '',
        plain: true,
        shortShowed: false,
        isFolder: true,
        anonPerm: {
            download: { checked: true, disabled: false },
            upload: { checked: true, disabled: false },
            view: { checked: true, disabled: false },
            zip: { checked: true, disabled: false },
            modify: true
        },
        items: [publicLinkForm = new Ext.form.FormPanel({
            baseCls: 'x-plain',
            defaults: { xtype: 'textfield', anchor: '100%' },
            autoHeight: true,
            labelWidth: 100,
            items: [advOptFS = new Ext.form.FieldSet({
                checkboxToggle: true,
                defaults: { xtype: 'textfield', anchor: '100%' },
                autoHeight: true,
                labelWidth: 100,
                collapsed: true,
                cls: 'anon-field-set',
                style: {
                    paddingBottom: '0px'
                },
                title: '<a href="#">' + Ext.util.Format.htmlEncode(config.htcConfig.locData.AnonymousLinkAdvOptTitle) + '</a>',
                collapsible: true,
                hideMode: 'offsets',
                listeners: {
                    afterrender: function (p) {
                        var a = p.header.child('span').child('a');
                        p.mon(a, 'click', function () {
                            if (advOptFS.collapsed) {
                                advOptFS.expand.call(advOptFS);
                            } else {
                                advOptFS.collapse.call(advOptFS);
                            }
                        }, p);
                    },
                    collapse: function (p) {
                        if (self.needFixAutofillPasswords) {
                            p.items.items[1].setReadOnly(true);
                            p.items.items[2].setReadOnly(true);
                        }
                        self.syncShadow();
                    },
                    expand: function (p) {
                        self.syncShadow();
                        accessUsersFS.collapse();
                    }
                },
                items: [{
                    fieldLabel: config.htcConfig.locData.LinkToFileExpireDate,
                    name: 'expireDate-public-link',
                    xtype: 'datefield',
                    format: config.htcConfig.USADateFormat ? 'm/d/Y' : 'd/m/Y',
                    minValue: HttpCommander.Lib.Utils.getTodayDate(),
                    maxValue: config.htcConfig.publicLinkMaxValidPeriod <= 0 ? null
                        : getLinkDefaultExpireDate(config.htcConfig.publicLinkMaxValidPeriod),
                    value: getLinkDefaultExpireDate()
                }, {
                    fieldLabel: config.htcConfig.locData.CommonFieldLabelPassword,
                    name: 'password-public-link',
                    xtype: 'pwdfield',
                    allowBlank: !config.htcConfig.requirePasswordOnCreatePublicLink,
                    id: config.$('makePublicLinkWindowPassword-public-link')
                }, {
                    fieldLabel: config.htcConfig.locData.CommonFieldLabelRepeatPassword,
                    name: 'password2-public-link',
                    xtype: 'pwdfield',
                    vtype: 'password',
                    initialPassField: config.$('makePublicLinkWindowPassword-public-link')
                }, {
                    fieldLabel: config.htcConfig.locData.LinkToFileDownloadCnt,
                    name: 'downloadCnt-public-link',
                    xtype: 'numberfield',
                    minValue: 0,
                    value: 0
                }, {
                    boxLabel: config.htcConfig.locData.AnonymousLinkShowCommentsLabel,
                    name: 'showComments-public-link',
                    xtype: 'checkbox',
                    hideLabel: true,
                    hidden: !config.htcConfig.enabledLabels &&
                            config.htcConfig.isAllowedComments != '1' &&
                            config.htcConfig.isAllowedComments != '2' &&
                            !config.htcConfig.allowedDescription,
                    checked: config.htcConfig.enabledLabels ||
                             config.htcConfig.isAllowedComments == '1' ||
                             config.htcConfig.isAllowedComments == '2' ||
                             config.htcConfig.allowedDescription,
                    listeners: {
                        check: function (cb, ch) {
                            if (!self.isFolder) {
                                if (ch) {
                                    downOrViewLink.setVisible(true);
                                } else if (!downOrViewLink.allowedExcludeLCD) {
                                    downOrViewLink.setVisible(false);
                                }
                            }
                        }
                    }
                }, anonAccessControl = new Ext.form.FieldSet({
                    title: config.htcConfig.locData.PublicFolderAnonymAccessControl,
                    layout: 'column',
                    style: {
                        paddingBottom: '0px'
                    },
                    cls: 'acl-field-set',
                    defaults: {
                        border: false,
                        baseCls: 'x-plain',
                        columnWidth: .5,
                        anchor: '100%'
                    },
                    items: [{
                        defaults: {
                            ctCls: 'checkbox-auto-height'
                        },
                        items: [anonDownCb = new Ext.form.Checkbox({
                            boxLabel: config.htcConfig.locData.PublicFolderAnonymDownload
                        }), anonZipCb = new Ext.form.Checkbox({
                            boxLabel: config.htcConfig.locData.PublicFolderAnonymZipDownload,
                            listeners: {
                                check: function (cb, ch) {
                                    self.changeViewMakePublicLinkWindow(ch && !anonViewCb.getValue() && !anonUpCb.getValue());
                                }
                            }
                        }), anonViewCb = new Ext.form.Checkbox({
                            boxLabel: config.htcConfig.locData.PublicFolderAnonymViewContent,
                            listeners: {
                                check: function (cb, ch) {
                                    self.changeViewMakePublicLinkWindow(!ch && anonZipCb.getValue() && !anonUpCb.getValue());
                                    if (!self.anonPerm.download.disabled) {
                                        anonDownCb.setDisabled(!ch);
                                        anonDownCb.setValue(ch);
                                    }
                                }
                            }
                        })]
                    }, {
                        items: [anonUpCb = new Ext.form.Checkbox({
                            boxLabel: config.htcConfig.locData.PublicFolderAnonymUpload + '.',
                            anchor: '100%',
                            checked: false,
                            listeners: {
                                check: function (cb, ch) {
                                    self.changeViewMakePublicLinkWindow(!ch && anonZipCb.getValue() && !anonViewCb.getValue());
                                    if (overwriteRG.isAllowed === true)
                                        overwriteRG.setDisabled(!ch);
                                }
                            }
                        }), {
                            xtype: 'container',
                            layout: 'form',
                            anchor: '100%',
                            defaults: {
                                anchor: '100%'
                            },
                            items: [{
                                xtype: 'label',
                                text: config.htcConfig.locData.PublicFolderLinkOverwriteWhileUpload + ':'
                            }, overwriteRG = new Ext.form.RadioGroup({
                                hideLabel: true,
                                defaults: { ctCls: 'checkbox-auto-height' },
                                items: [{
                                    boxLabel: config.htcConfig.locData.AdminFoldersRestrictionAllow,
                                    inputValue: 0,
                                    name: 'overwrite-existing',
                                    checked: false
                                }, {
                                    boxLabel: config.htcConfig.locData.AdminFoldersRestrictionDeny,
                                    name: 'overwrite-existing',
                                    inputValue: 1,
                                    checked: true
                                }]
                            })]
                        }]
                    }]
                }), {
                    fieldLabel: config.htcConfig.locData.PublicFolderNoteForUsers,
                    name: 'noteForUsers-public-link',
                    xtype: 'textarea',
                    height: 40
                }, {
                    fieldLabel: config.htcConfig.locData.PublicFolderLinkSendEmails,
                    name: 'emails-public-link',
                    xtype: 'textarea',
                    height: 40
                }, downOrViewLink = new Ext.form.RadioGroup({
                    hidden: true,
                    allowed: false,
                    fieldLabel: config.htcConfig.locData.LinkToFileDownloadType,
                    anchor: '100%',
                    items: [{
                        boxLabel: config.htcConfig.locData.CommandDownload,
                        inputValue: 0,
                        name: 'download-view-link-type',
                        checked: true
                    }, {
                        boxLabel: config.htcConfig.locData.CommandDownloadOrView,//Download or view
                        name: 'download-view-link-type',
                        inputValue: 1
                    }],
                    listeners: {
                        afterrender: function (rg) {
                            var rbs = rg.el.dom.getElementsByTagName('input');
                            var len = 0;
                            if (rbs && (len = rbs.length) > 0) {
                                for (var i = 0; i < len; i++) {
                                    var rb = rbs[i];
                                    if (rb && rb.type == 'radio') {
                                        rb.onclick = function () {
                                            self.changeLinkType(downOrViewLink.getValue().getValue());
                                        };
                                    }
                                }
                            }
                        }
                    }
                })]
            }), accessUsersFS = new Ext.form.FieldSet({
                checkboxToggle: true,
                defaults: {
                    anchor: '100%'
                },
                cls: 'anon-field-set',
                hidden: !config.htcConfig.anonymLimitAccessForUsers,
                autoHeight: true,
                collapsed: true,
                title: '<a href="#">' + Ext.util.Format.htmlEncode(config.htcConfig.locData.AnonymousLinkLimitedAccessTitle) + '</a>',
                collapsible: true,
                labelAlign: 'top',
                listeners: {
                    afterrender: function (p) {
                        var a = p.header.child('span').child('a');
                        p.mon(a, 'click', function () {
                            if (accessUsersFS.collapsed) {
                                accessUsersFS.expand.call(accessUsersFS);
                            } else {
                                accessUsersFS.collapse.call(accessUsersFS);
                            }
                        }, p);
                    },
                    collapse: function (p) {
                        self.syncSize();
                        self.syncShadow();
                    },
                    expand: function (p) {
                        self.syncSize();
                        self.syncShadow();
                        advOptFS.collapse();
                    }
                },
                items: [{
                    itemId: 'au-checkbox',
                    name: 'au-checkbox',
                    xtype: 'checkbox',
                    hideLabel: true,
                    ctCls: 'checkbox-auto-height',
                    boxLabel: config.htcConfig.locData.AnonymousLinkLimitAccessCheckBox,
                    checked: false,
                    listeners: {
                        check: function (cb, ch) {
                            var fs = cb.ownerCt,
                                users = fs.getComponent('au-users'),
                                send = fs.getComponent('au-send-checkbox'),
                                msg = fs.getComponent('au-pers-msg');
                            users.setDisabled(!ch);
                            send.setDisabled(!ch);
                            msg.setDisabled(!ch || !send.getValue());
                        }
                    }
                }, {
                    itemId: 'au-users',
                    name: 'au-users',
                    xtype: 'textarea',
                    fieldLabel: config.htcConfig.locData.AnonymousLinkLimitAccessTextArea,
                    height: 40,
                    disabled: true
                }, {
                    itemId: 'au-send-checkbox',
                    name: 'au-send-checkbox',
                    xtype: 'checkbox',
                    hideLabel: true,
                    boxLabel: config.htcConfig.locData.AnonymousLinkLimitAccessSendCheckBox,
                    checked: true,
                    disabled: true,
                    ctCls: 'checkbox-auto-height',
                    listeners: {
                        check: function (cb, ch) {
                            var fs = cb.ownerCt,
                                msg = fs.getComponent('au-pers-msg');
                            msg.setDisabled(!ch);
                        }
                    }
                }, {
                    itemId: 'au-pers-msg',
                    name: 'au-pers-msg',
                    xtype: 'textarea',
                    emptyText: config.htcConfig.locData.AnonymousLinkLimitAccessPersMsgLabel,
                    hideLabel: true,
                    height: 40,
                    disabled: true
                }]
            }), {
                xtype: 'container',
                anchor: '100%',
                defaults: {
                    xtype: 'button',
                    style: {
                        marginLeft: '6px',
                        marginBottom: '6px'
                    }
                },
                layout: 'column',
                items:[{
                    id: config.$('public-link-create-btn'),
                    text: config.htcConfig.locData.LinkToFileGenerate,
                    handler: function (btn) { self.publicLinkMainHandler(btn.isEditMode); }
                }, {
                    id: config.$('public-link-view-btn'),
                    icon: HttpCommander.Lib.Utils.getIconPath(config, 'sharefolder') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=sharefolder' : ''),
                    text: config.htcConfig.locData.AnonymousViewLinksButton,
                    handler: function () { config.initAndShowViewLinksWindow(); }
                }]
            }, {
                xtype: 'label',
                hideLabel: true,
                autoHeight: true,
                id: config.$('hint-public-link'),
                cls: 'x-form-item',
                text: ''
            }, {
                xtype: 'areactc', //'textarea',
                ctcIcon: config.htcConfig.relativePath + 'Images/ctc.png',
                ctcHint: config.htcConfig.locData.CommandCopyToClipboard,
                autoScroll: true,
                hideLabel: true,
                id: config.$('url-public-link'),
                height: 50,
                selectOnFocus: true,
                readOnly: true,
                onSuccessCopied: function () {
                    config.showBalloon(config.htcConfig.locData.BalloonCopiedToClipboard);
                },
                onTriggerClickError: function (err) {
                    config.Msg.show({
                        title: config.htcConfig.locData.BalloonCopyToClipboardFailed,
                        msg: Ext.util.Format.htmlEncode(!!err ? err.toString() : config.htcConfig.locData.BalloonCopyToClipboardFailed),
                        icon: config.Msg.ERROR,
                        buttons: config.Msg.OK
                    });
                }
            }, {
                xtype: 'areactc', //'textarea',
                ctcIcon: config.htcConfig.relativePath + 'Images/ctc.png',
                ctcHint: config.htcConfig.locData.CommandCopyToClipboard,
                autoScroll: true,
                hideLabel: true,
                emptyText: config.htcConfig.locData.AnonymousLinkShortUrlLabel,
                id: config.$('url-short-public-link'),
                hidden: (config.htcConfig.publicLinksViewType == 1),
                height: 50,
                width: '100%',
                selectOnFocus: true,
                readOnly: true,
                onSuccessCopied: function () {
                    config.showBalloon(config.htcConfig.locData.BalloonCopiedToClipboard);
                },
                onTriggerClickError: function (err) {
                    config.Msg.show({
                        title: config.htcConfig.locData.BalloonCopyToClipboardFailed,
                        msg: Ext.util.Format.htmlEncode(!!err ? err.toString() : config.htcConfig.locData.BalloonCopyToClipboardFailed),
                        icon: config.Msg.ERROR,
                        buttons: config.Msg.OK
                    });
                },
                refreshIcon: HttpCommander.Lib.Utils.getIconPath(config, 'refresh') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=refresh' : ''),
                refreshHint: config.htcConfig.locData.AnonymousLinkShortUrlUpdate,
                refreshHandler: function (field) {
                    var url = self.findById(config.$('url-public-link')).getValue();
                    if (Ext.isEmpty(url)) {
                        return;
                    }
                    var viewAllowed = !self.isFolder && downOrViewLink.allowed;
                    var showView = viewAllowed && downOrViewLink.items.items[1].getValue();
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                    config.globalLoadMask.show();
                    HttpCommander.Common.ShortenAnonymLink({ url: url, view: viewAllowed }, function (data, trans) {
                        config.globalLoadMask.hide();
                        config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                        if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                                data, trans, config.Msg, config.htcConfig)) {
                            self.shortLnk = data.shortUrl;
                            self.shortLnk2 = data.shortUrl2;
                            var fld = self.findById(config.$('url-short-public-link'));
                            if (fld) {
                                fld.setValue(showView && self.shortLnk2 ? self.shortLnk2 : self.shortLnk);
                                fld.focus(true, 100);
                            }
                        }
                    });
                }
            }]
        })],
        buttonAlign: 'left',
        buttons: [{
            icon: HttpCommander.Lib.Utils.getIconPath(config, 'help') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=help' : ''),
            text: '',
            handler: function (btn) {
                config.showHelpWindow('publiclink');
            }
        }, {
            text: config.htcConfig.locData.PublicLinksDeleteLinkButton,
            handler: function (btn) {
                var linkId = Ext.isObject(self.linkForEdit) && Ext.isNumber(self.linkForEdit['id'])
                    ? self.linkForEdit['id'] : null;
                if (!linkId || linkId < 0) {
                    linkId = Ext.isNumber(self.link_id) && self.link_id > 0 ? self.link_id : null;
                    if (!linkId) {
                        btn.setVisible(false);
                        return;
                    }
                }
                config.Msg.confirm(
                    config.htcConfig.locData.PublicLinksDeleteWindowTitle,
                    config.htcConfig.locData.PublicLinksDeleteSingleConfirmMsg,
                    function (cnfrmBtn) {
                        if (cnfrmBtn == 'yes') {
                            config.globalLoadMask.msg = config.htcConfig.locData.ProgressDeletingAnonymousLink + "...";
                            config.globalLoadMask.show();
                            HttpCommander.Common.RemoveAnonymLinks({ ids: [linkId] }, function (data, trans) {
                                config.globalLoadMask.hide();
                                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                                            data, trans, config.Msg, config.htcConfig)) {
                                    self.hide();
                                    if (data && data.needrefresh) {
                                        config.openGridFolder(config.getCurrentFolder());
                                    }
                                }
                            });
                        }
                        config.Msg.hide();
                    }
                );
            },
            hidden: true
        }, '->', {
            icon: HttpCommander.Lib.Utils.getIconPath(config, 'sendemail') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=sendemail' : ''),
            text: config.htcConfig.locData.AnonymousLinkSendViaButton,
            menu: [{
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'sendemail') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=sendemail' : ''),
                text: config.htcConfig.locData.AnonymousLinkSendViaEmailItem,
                hidden: hiddenSendEmail(),
                handler: function (item) {
                    if (!hiddenSendEmail()) {
                        var sendEmailWindow = config.initSendEmail();
                        if (sendEmailWindow) {
                            var pubLinkInfo = {};
                            var lnk = self.lnk;
                            var sLnk = self.shortLnk;
                            if (lnk && lnk.length > 0) {
                                pubLinkInfo.url = lnk;
                            }
                            if (sLnk && sLnk.length > 0) {
                                pubLinkInfo.sUrl = sLnk;
                            }
                            sendEmailWindow.initialize(pubLinkInfo);
                            sendEmailWindow.show();
                        }
                    }
                }
            }, {
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'gmail'),
                text: 'Gmail',
                hidden: hiddenSendEmail(),
                handler: function (item) {
                    sendViaService('https://mail.google.com/mail/?view=cm&fs=1&ui=2&su='
                        + encodeURIComponent(config.htcConfig.locData.AnonymousLinkSendSubject) + '&body=', 'gmail');
                }
            }, {
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'outlook'),
                text: 'Outlook',
                hidden: hiddenSendEmail(),
                handler: function (item) {
                    sendViaService('https://outlook.live.com/?path=/mail/action/compose&subject='
                        + encodeURIComponent(config.htcConfig.locData.AnonymousLinkSendSubject) + '&body=', 'outlook');
                }
            }, {
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'gplus'),
                text: 'Google+',
                hidden: hiddenShareLink(),
                handler: function (item) {
                    sendViaService('https://plus.google.com/share?url=', 'gplus');
                }
            }, {
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'twitter'),
                text: 'Twitter',
                hidden: hiddenShareLink(),
                handler: function (item) {
                    sendViaService('https://twitter.com/intent/tweet?url=', 'twitter');
                }
            }, {
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'facebook'),
                text: 'Facebook',
                hidden: hiddenShareLink(),
                handler: function (item) {
                    sendViaService('https://www.facebook.com/sharer/sharer.php?title='
                        + encodeURIComponent(config.htcConfig.locData.AnonymousLinkSendSubject) + '&u=', 'facebook');
                }
            }, {
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'linkedin'),
                text: 'LinkedIn',
                hidden: hiddenShareLink(),
                handler: function (item) {
                    sendViaService('https://www.linkedin.com/shareArticle?mini=true&title='
                        + encodeURIComponent(config.htcConfig.locData.AnonymousLinkSendSubject) + '&url=', 'linkedin');
                }
            }, {
                text: config.htcConfig.locData.QRCodeButton,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'qrcode'),
                hidden: hiddenShareLink() || !QRCode,
                handler: function (item) {
                    var url = self.shortLnk2;
                    if (Ext.isEmpty(url)) {
                        url = self.shortLnk;
                    }
                    if (Ext.isEmpty(url)) {
                        url = self.lnk2;
                    }
                    if (Ext.isEmpty(url)) {
                        url = self.lnk;
                    }
                    if (!Ext.isEmpty(url)) {
                        (new config.Window({
                            title: config.htcConfig.locData.QRCodeButton,
                            width: 300,
                            height: 350,
                            layout: 'fit',
                            resizable: false,
                            modal: true,
                            onEsc: function () { this.close(); },
                            bodyCssClass: 'qrcode',
                            listeners: {
                                afterrender: function (w) {
                                    new QRCode(w.body.dom, url);
                                    setTimeout(function () { w.focus(); }, 50);
                                }
                            },
                            buttonAlign: 'center',
                            buttons: [{
                                text: config.htcConfig.locData.CommonButtonCaptionClose,
                                handler: function (btn) {
                                    btn.ownerCt.ownerCt.close();
                                }
                            }]
                        })).show();
                    }
                }
            }],
            hidden: hiddenShareLink(),
            disabled: true
        }],
        listeners: {
            resize: function (win, w, h) {
                win.syncShadow();
            },
            beforeshow: function (win) {
                self.lnk = null;
                self.lnk2 = null;
                self.shortLnk = null;
                self.shortLnk2 = null;
                self.shortShowed = false;
                self.link_id = null;
                self.link_key = null;

                var isEditMode = Ext.isObject(self.linkForEdit) && Ext.isNumber(self.linkForEdit['id']);
                if (isEditMode)
                    config.hideViewLinksWindow();

                if (isEditMode) {
                    self.link_id = self.linkForEdit['id'];
                    self.link_key = self.linkForEdit['key'];
                    self.lnk = self.linkForEdit['url'];
                    self.lnk2 = self.linkForEdit['url2'];
                    self.shortLnk = self.linkForEdit['shortUrl'];
                    self.shortLnk2 = self.linkForEdit['shortUrl2'];
                }

                var form = publicLinkForm.getForm();

                // set expire date
                form.findField('expireDate-public-link').setValue(isEditMode
                    ? self.linkForEdit['expires']
                    : getLinkDefaultExpireDate()
                );

                // set passwords
                if (isEditMode) {
                    form.initPass = self.linkForEdit['password'];
                } else {
                    form.initPass = undefined;
                }
                form.findField('password-public-link').setValue(isEditMode
                    ? self.linkForEdit['password']
                    : ''
                );
                form.findField('password2-public-link').setValue(isEditMode
                    ? self.linkForEdit['password']
                    : ''
                );
                var allowLCD = config.htcConfig.enabledLabels ||
                    config.htcConfig.isAllowedComments == '1' ||
                    config.htcConfig.isAllowedComments == '2' ||
                    config.htcConfig.allowedDescription;
                form.findField('showComments-public-link').setValue(allowLCD &&
                    (isEditMode ? self.linkForEdit['show_comments'] : true)
                );

                // set access control
                anonDownCb.setValue(self.anonPerm.download.checked);
                anonDownCb.setDisabled(self.anonPerm.download.disabled);
                anonUpCb.setValue(self.anonPerm.upload.checked);
                anonUpCb.setDisabled(self.anonPerm.upload.disabled);
                anonViewCb.setValue(self.anonPerm.view.checked);
                anonViewCb.setDisabled(self.anonPerm.view.disabled);
                anonZipCb.setValue(self.anonPerm.zip.checked);
                anonZipCb.setDisabled(self.anonPerm.zip.disabled);
                anonAccessControl.setVisible(self.isFolder);
                if (anonAccessControl.rendered) {
                    anonAccessControl.el.dom.style.display = self.isFolder ? '' : 'none';
                } else {
                    anonAccessControl.hidden = !self.isFolder;
                }
                anonAccessControl.setDisabled(!self.isFolder);

                // set overwrite
                if (self.anonPerm.modify === true) {
                    overwriteRG.isAllowed = true;
                    overwriteRG.setDisabled(!anonUpCb.getValue());
                } else {
                    overwriteRG.items.items[1].setValue(true);
                    overwriteRG.setDisabled(true);
                }

                // set and show/hide download count
                var downloadCntField = form.findField('downloadCnt-public-link');
                var visibleDownloadCntField = !self.isFolder ||
                    (self.anonPerm.zip.checked
                        && !self.anonPerm.upload.checked
                        && !self.anonPerm.view.checked
                    );
                downloadCntField.setValue(isEditMode
                    ? (String(self.linkForEdit['downloads']).trim() === '' ? 0 : self.linkForEdit['downloads'])
                    : 0
                );
                downloadCntField.label.dom.style.display = visibleDownloadCntField ? '' : 'none';
                downloadCntField.setVisible(visibleDownloadCntField);
                if (downloadCntField.rendered) {
                    downloadCntField.el.dom.style.display = visibleDownloadCntField ? '' : 'none';
                } else {
                    downloadCntField.hidden = !visibleDownloadCntField;
                }

                // downoload or view (for links to file)
                var ext = ';' + String(!self.Folder
                    ? HttpCommander.Lib.Utils.getFileExtension(self.virtPath)
                    : "") + ';';
                var vlt = config.htcConfig.showPublicLinksForView || 0;
                var viewVisible = !self.isFolder &&
                    (
                     ((vlt & 1) != 0 && HttpCommander.Lib.Utils.isAllowedForViewingInBrowser(self.virtPath, config.htcConfig))
                     ||
                     ((vlt & 2) != 0 && config.htcConfig.enableGoogleDocumentsViewer === true && HttpCommander.Lib.Consts.googleDocSupportedtypes.indexOf(ext) >= 0)
                     ||
                     ((vlt & 4) != 0 && config.htcConfig.enableOWADocumentsViewer === true && HttpCommander.Lib.Consts.owaSupportedtypes.indexOf(ext) >= 0)
                    );
                downOrViewLink.allowedExcludeLCD = viewVisible;
                if (!self.isFolder && !viewVisible) { //TODO
                    viewVisible = allowLCD;
                }
                downOrViewLink.setDisabled(false);
                downOrViewLink.setVisible(viewVisible);
                downOrViewLink.allowed = viewVisible;
                downOrViewLink.el.dom.style.display = viewVisible ? '' : 'none';
                downOrViewLink.items.items[viewVisible ? 1 : 0].setValue(true);
                downOrViewLink.label.dom.style.display = viewVisible ? '' : 'none';

                // set note for users
                var noteForUsersField = form.findField('noteForUsers-public-link');
                noteForUsersField.setValue(isEditMode
                    ? self.linkForEdit['notes']
                    : ''
                );
                noteForUsersField.label.dom.style.display = visibleDownloadCntField ? 'none' : '';
                noteForUsersField.setVisible(!visibleDownloadCntField);
                if (noteForUsersField.rendered) {
                    noteForUsersField.el.dom.style.display = !visibleDownloadCntField ? '' : 'none';
                } else {
                    noteForUsersField.hidden = visibleDownloadCntField;
                }

                // set emails
                var emails = form.findField('emails-public-link');
                emails.setValue(isEditMode
                    ? self.linkForEdit['emails']
                    : ''
                );
                emails.label.dom.style.display = visibleDownloadCntField ? 'none' : '';
                emails.setVisible(!visibleDownloadCntField);
                if (emails.rendered) {
                    emails.el.dom.style.display = !visibleDownloadCntField ? '' : 'none';
                } else {
                    emails.hidden = visibleDownloadCntField;
                }

                // set label and hint
                var lblUrl = self.findById(config.$('hint-public-link'));
                lblUrl.setVisible(config.htcConfig.publicLinksViewType != 2);
                if (config.htcConfig.publicLinksViewType != 2) {
                    if (self.isFolder) {
                        lblUrl.setText(
                            String.format(self.anonPerm.upload.checked || self.anonPerm.view.checked
                                    ? config.htcConfig.locData.PublicFolderLinkHint
                                    : config.htcConfig.locData.PublicFolderLinkDownloadZipHint
                                , ('<b><a href="#" class="a-p-l">' + Ext.util.Format.htmlEncode(self.virtPath) + '</a></b>')
                            )
                            , false
                        );
                    } else {
                        lblUrl.setText(String.format(
                            config.htcConfig.locData.LinkToFileAnonymDownloadLinkHint,
                            ('<b><a href="#" class="a-p-l">' + Ext.util.Format.htmlEncode(self.virtPath) + '</a></b>')), false
                        );
                    }
                }

                // set title
                self.setTitle(isEditMode
                    ? Ext.util.Format.htmlEncode(
                        String.format(config.htcConfig.locData.AnonymousEditLinkWindowTitle, self.linkForEdit['virt_path'])
                      )
                    : config.htcConfig.locData.CommandMakePublicFolder
                );

                // access for users
                var aCb = form.findField('au-checkbox'),
                    aUsers = form.findField('au-users'),
                    aSend = form.findField('au-send-checkbox'),
                    apMsg = form.findField('au-pers-msg');
                aCb.setValue(false);
                aUsers.setValue(null);
                aUsers.setDisabled(true);
                aSend.setValue(true);
                aSend.setDisabled(true);
                //apMsg.setValue(null);
                apMsg.setDisabled(true);
                if (isEditMode) {
                    var aUsersValue = self.linkForEdit['access_users'];
                    if (!Ext.isEmpty(aUsersValue) && aUsersValue.trim().length > 0) {
                        aCb.setValue(true);
                        aUsers.setValue(aUsersValue);
                        aUsers.setDisabled(false);
                        aSend.setDisabled(false);
                        aUsersMsg = self.linkForEdit['pesonalmessage'];
                        if (!Ext.isEmpty(aUsersMsg) && aUsersMsg.trim().length > 0) {
                            aSend.setValue(true);
                            apMsg.setValue(aUsersMsg);
                            apMsg.setDisabled(false);
                        }
                    }
                }

                // change buttons
                self.buttons[1].setVisible(isEditMode);
                self.buttons[3].setDisabled(!isEditMode);
                var createBtn = self.findById(config.$('public-link-create-btn')),
                    viewLinksBtn = self.findById(config.$('public-link-view-btn'));
                var buttonsContainer = viewLinksBtn.ownerCt;
                viewLinksBtn.setVisible(!isEditMode);
                var notAllowedCreateAndEdit =
                    (self.isFolder && !config.htcConfig.enablePublicLinkToFolder)
                    ||
                    (!self.isFolder && !config.htcConfig.enablePublicLinkToFile);
                if (createBtn) {
                    createBtn.setText(isEditMode
                        ? config.htcConfig.locData.CommandSave
                        : config.htcConfig.locData.LinkToFileGenerate
                    );
                    createBtn.isEditMode = isEditMode;
                    createBtn.setDisabled(notAllowedCreateAndEdit);
                }

                if (isEditMode || config.htcConfig.requirePasswordOnCreatePublicLink || config.htcConfig.expandSettingsWhenOpenCreatePublicLinkWindow)
                    advOptFS.expand();
                else
                    advOptFS.collapse();
                accessUsersFS.collapse();

                self.doLayout();
                self.syncShadow();
                self.syncSize();

                // set urls
                var lnkField = self.findById(config.$('url-public-link'));
                var sLnkField = self.findById(config.$('url-short-public-link'));
                if (lnkField) {
                    lnkField.setDisabled(!isEditMode);
                }
                if (sLnkField) {
                    sLnkField.setDisabled(!isEditMode);
                }
                self.changeLinkType(!viewVisible || downOrViewLink.getValue().getValue());

                return true;
            },
            hide: function (self) {
                self.buttons[1].setVisible(false);
                if (typeof self.linkForEdit != 'undefined'
                        && self.linkForEdit != null
                            && (typeof self.fromGrid == 'undefined' || !self.fromGrid))
                    config.initAndShowViewLinksWindow(true, true);
            },
            show: function (win) {
                var lblUrl = win.findById(config.$('hint-public-link'));
                if (lblUrl) {
                    var a = lblUrl.el.query('.a-p-l', true);
                    if (a && (a = a[0])) {
                        a.onclick = function () {
                            if (win && !Ext.isEmpty(win.virtPath)) {
                                var path = win.virtPath;
                                if (!win.isFolder) {
                                    var lastSlashPos = path.lastIndexOf('/');
                                    if (lastSlashPos >= 0) {
                                        var name = path.substring(lastSlashPos + 1);
                                        path = path.substring(0, lastSlashPos);
                                        config.setSelectPath({
                                            path: path,
                                            name: name
                                        });
                                    }
                                }
                                config.openGridFolder(path);
                            }
                            return false;
                        }
                    }
                }
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // methods
        changeLinkType: function (onlyDown) {
            var linkspage = !self.isFolder && downOrViewLink.allowed // isVisible()
                && downOrViewLink.items.items[1].getValue();
            var url = !onlyDown && linkspage && self.lnk2 ? self.lnk2 : self.lnk;
            var sUrl = !onlyDown && linkspage && self.shortLnk2 ? self.shortLnk2 : self.shortLnk;
            var lnkField = self.findById(config.$('url-public-link'));
            var sLnkField = self.findById(config.$('url-short-public-link'));
            if (lnkField) {
                lnkField.setValue(url);
                lnkField.focus(true, 100);
            }
            if (sLnkField) {
                sLnkField.setValue(sUrl);
            }
        },
        publicLinkMainHandler: function (isEditMode) {
            var validationResult = self.validatePublicLinkData();
            if (validationResult) {
                config.Msg.show({
                    title: config.htcConfig.locData.CommonErrorCaption,
                    msg: validationResult,
                    icon: config.Msg.WARNING,
                    buttons: config.Msg.OK
                });
                return;
            }

            isEditMode = (isEditMode === true);

            var isFolderLink = self.isFolder && (anonUpCb.getValue() || anonViewCb.getValue());
            var virtualPath = self.virtPath;
            var linkInfo = {
                path: virtualPath,
                service: (isFolderLink ? 'PublicFolder' : 'Share'),
                isFolder: self.isFolder
            };

            if (Ext.isNumber(self.link_id)) {
                linkInfo.link_id = self.link_id;
                linkInfo.link_key = self.link_key;
            }

            var form = publicLinkForm.getForm();
            var date = form.findField('expireDate-public-link').getValue();
            /* how date is interpreted 
            We assume that the expire date is the last day the link is valid.
            The link is valid till the beginning of the next day, local time.
            */
            var date2 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var date3 = new Date(date2.getTime() + 24 * 60 * 60 * 1000);
            linkInfo["expireDate"] = HttpCommander.Lib.Utils.getDateUTCString(date3);

            if (isFolderLink) {
                linkInfo.downloadCnt = 0;
            } else {
                var downCntStr = String(form.findField('downloadCnt-public-link').getValue());
                if (downCntStr.trim() == '') {
                    linkInfo.downloadCnt = 0;
                } else try {
                    linkInfo.downloadCnt = parseInt(downCntStr);
                } catch (e) {
                    linkInfo.downloadCnt = 0;
                }
            }
            linkInfo.password = form.findField('password-public-link').getValue();
            if (isEditMode) {
                linkInfo['pass_changed'] = Ext.isDefined(form.initPass) &&
                (
                    (linkInfo.password == null && form.initPass == null) ||
                    (linkInfo.password === form.initPass)
                );
            } else {
                linkInfo['pass_changed'] = false;
            }
            linkInfo.noteForUsers = isFolderLink ? form.findField('noteForUsers-public-link').getValue() : null;
            if (isFolderLink) {
                linkInfo["acl"] = {
                    down: anonDownCb.getValue(),
                    up: anonUpCb.getValue(),
                    view: anonViewCb.getValue(),
                    zip: anonZipCb.getValue()
                };
                if (anonUpCb.getValue()) {
                    linkInfo["acl"]["overwrite"] = overwriteRG.isAllowed === true && overwriteRG.items.items[0].getValue();
                }
                linkInfo["emails"] = form.findField('emails-public-link').getValue();
            }
            linkInfo.linktypeview = !self.isFolder
                && HttpCommander.Lib.Utils.isAllowedForViewingInBrowser(self.virtPath, config.htcConfig);
            var linkspage = !self.isFolder && downOrViewLink.allowed // isVisible()
                && downOrViewLink.items.items[1].getValue();

            linkInfo.show_comments = form.findField('showComments-public-link').getValue();

            // limit access
            var aCb = form.findField('au-checkbox'),
                aUsers = form.findField('au-users'),
                aSend = form.findField('au-send-checkbox'),
                apMsg = form.findField('au-pers-msg');
            var aUsersValue = null,
                aSendValue = false,
                apMsgValue = null;
            if (config.htcConfig.anonymLimitAccessForUsers && aCb.getValue()) {
                aUsersValue = aUsers.getValue();
                if (!Ext.isEmpty(aUsersValue) && (aUsersValue = aUsersValue.trim()).length > 0) {
                    if (!Ext.isEmpty(linkInfo.password)) {
                        config.Msg.show({
                            title: config.htcConfig.locData.CommonErrorCaption,
                            msg: config.htcConfig.locData.AnonymousLinkLimitAccessPassAndUsersMsg,
                            icon: config.Msg.WARNING,
                            buttons: config.Msg.OK
                        });
                        return;
                    }
                    aSendValue = aSend.getValue();
                    if (aSendValue) {
                        apMsgValue = apMsg.getValue();
                        if (Ext.isEmpty(apMsgValue) || (apMsgValue = apMsgValue.trim()).length == 0) {
                            apMsgValue = null;
                        }
                    }
                } else {
                    aUsersValue = null;
                }
            }
            linkInfo.accessusers = aUsersValue;
            linkInfo.pesonalmessage = apMsgValue;
            linkInfo.ausend = aSendValue;

            config.globalLoadMask.msg = config.htcConfig.locData[(isEditMode
                ? 'ProgressSavingAnonymousLink' : 'ProgressGettingAnonymLink')] + "...";
            var oldAT = Ext.Ajax.timeout;
            Ext.Ajax.timeout = 90000; // 1 minute 30 seconds
            config.globalLoadMask.show();
            HttpCommander.Common[(isEditMode ? 'SaveAnonymLink' : 'AnonymLink')](linkInfo, function (data, trans) {
                Ext.Ajax.timeout = oldAT;
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                if (!HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, config.Msg, config.htcConfig))
                    return;

                self.link_id = data['link_id'];
                self.link_key = data['link_key'];

                var lnkField = self.findById(config.$('url-public-link'));
                var sLnkField = self.findById(config.$('url-short-public-link'));

                var outputUrl = '';
                var backupOurl = '';
                var getLongUrl = function (inputUrl) {
                    if (!Ext.isEmpty(inputUrl)) {
                        var name = HttpCommander.Lib.Utils.getFileName(linkInfo.path);
                        var ext = HttpCommander.Lib.Utils.getFileExtension(name);
                        if (ext === "swf" && config.htcConfig.openSWFonDownload && HttpCommander.Lib.Utils.browserIs.ie) {
                            var urlParts = inputUrl.split(config.htcConfig.anonymHandlerPath);
                            if (urlParts.length == 2) {
                                return urlParts[0] + config.htcConfig.anonymHandlerPath + '/'
                                    + encodeURIComponent(name)
                                        + urlParts[1];
                            }
                        }
                    }
                    return inputUrl;
                };
                if (data.url) {
                    backupOurl = getLongUrl(data.url);
                    if (config.htcConfig.publicLinksViewType != 2) {
                        outputUrl = backupOurl;
                    }
                }
                self.lnk = outputUrl.length > 0 ? outputUrl : null;
                self.shortLnk = config.htcConfig.publicLinksViewType != 1 && data['short']
                    ? data['short'] : (config.htcConfig.publicLinksViewType != 1 && backupOurl.length > 0 ? backupOurl : null);
                self.lnk2 = config.htcConfig.publicLinksViewType != 2 ? data['url2'] : null;
                self.shortLnk2 = config.htcConfig.publicLinksViewType != 1 && data['short2']
                    ? data['short2'] : (config.htcConfig.publicLinksViewType != 1 && data['url2'] ? data['url2'] : null);

                var showForView = self.lnk2 || self.shortLnk2;
                var showShort = (self.shortLnk || self.shortLnk2) && !self.lnk && !self.lnk2;

                lnkField.setValue(linkspage && showForView && self.lnk2 ? self.lnk2 : self.lnk);
                sLnkField.setValue(linkspage && showForView && self.shortLnk2 ? self.shortLnk2 : self.shortLnk);

                lnkField.setDisabled(false);
                sLnkField.setDisabled(false);
                self.buttons[1].setVisible(true);
                self.buttons[3].setDisabled(false);

                isEditMode = true;

                var createBtn = self.findById(config.$('public-link-create-btn')),
                    viewLinksBtn = self.findById(config.$('public-link-view-btn'));
                var buttonsContainer = viewLinksBtn.ownerCt;
                viewLinksBtn.setVisible(!isEditMode);
                var notAllowedCreateAndEdit =
                    (self.isFolder && !config.htcConfig.enablePublicLinkToFolder)
                    ||
                    (!self.isFolder && !config.htcConfig.enablePublicLinkToFile);
                if (createBtn) {
                    createBtn.setText(isEditMode
                        ? config.htcConfig.locData.CommandSave
                        : config.htcConfig.locData.LinkToFileGenerate
                    );
                    createBtn.isEditMode = isEditMode;
                    createBtn.setDisabled(notAllowedCreateAndEdit);
                }

                lnkField.focus(true, 50);

                //if (data && data.needrefresh)
                {
                    var folderForRefresh = virtualPath;
                    var fileFolderName = null;
                    var posSlash = folderForRefresh.lastIndexOf('/');
                    if (posSlash >= 0) {
                        if (posSlash < folderForRefresh.length - 1) {
                            fileFolderName = folderForRefresh.substring(posSlash + 1, folderForRefresh.length);
                        }
                        folderForRefresh = folderForRefresh.substring(0, posSlash);
                    }
                    if (folderForRefresh && folderForRefresh.length > 0) {
                        if (!Ext.isEmpty(fileFolderName)) {
                            config.setSelectPath({
                                name: fileFolderName,
                                path: folderForRefresh
                            })
                        }
                        if (!(self.fromSharedGrid === true) || !config.openSharedByLink()) {
                            setTimeout(function () {
                                config.openGridFolder(folderForRefresh);
                            }, 300);
                        }
                    }
                }
            });
        },
        validatePublicLinkData: function () {
            if (publicLinkForm) {
                var form = publicLinkForm.getForm();
                if (!form.isValid())
                    return config.htcConfig.locData.LinkToFileInvalidForm;
                var pass1 = form.findField('password-public-link').getValue();
                if (config.htcConfig.requirePasswordOnCreatePublicLink && (typeof pass1 == 'undefined' || String(pass1).length == 0))
                    return config.htcConfig.locData.LinkToFilePasswordRequired;
                var pass2 = form.findField('password2-public-link').getValue();
                if (pass1 != pass2)
                    return config.htcConfig.locData.LinkToFilePasswordNotMatch;
                if (!anonAccessControl.hidden
                        && !anonDownCb.getValue()
                        && !anonUpCb.getValue()
                        && !anonViewCb.getValue()
                        && !anonZipCb.getValue())
                    return config.htcConfig.locData.PublicFolderACLNotSet;
            }
            return null;
        },
        changeViewMakePublicLinkWindow: function (onlyDown) {
            onlyDown = (onlyDown === true);
            var form = publicLinkForm.getForm();
            var downloadCntField = form.findField('downloadCnt-public-link');
            downloadCntField.label.dom.style.display = onlyDown ? '' : 'none';
            downloadCntField.setVisible(onlyDown);
            if (downloadCntField.rendered) {
                downloadCntField.el.dom.style.display = onlyDown ? '' : 'none';
            } else {
                downloadCntField.hidden = !onlyDown;
            }
            if (onlyDown)
                anonDownCb.setValue(false);
            var emails = form.findField('emails-public-link');
            if (emails) {
                emails.label.dom.style.display = onlyDown ? 'none' : '';
                emails.setVisible(!onlyDown);
            }
            var noteForUsersField = form.findField('noteForUsers-public-link');
            noteForUsersField.label.dom.style.display = onlyDown ? 'none' : '';
            noteForUsersField.setVisible(!onlyDown);
            self.findById(config.$('hint-public-link')).setText(
                String.format(onlyDown ?
                    config.htcConfig.locData.PublicFolderLinkDownloadZipHint : config.htcConfig.locData.PublicFolderLinkHint,
                    ('<b>' + Ext.util.Format.htmlEncode(self.virtPath) + '</b>')
                ), false);
            self.syncShadow();
        }
    });

    return self;
};