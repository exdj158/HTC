Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, globalLoadMask, getEmbedded(), getIsEmbeddedtoIFRAME(),
    getCurrentFolder(), getSelectedFiles(), linkToFileByName(), linkToFolderByName()
*/
HttpCommander.Lib.SendEmailWindow = function (config) {
    var mailingGroupsWindow = HttpCommander.Lib.MailingGroupsWindow({
        "htcConfig": config.htcConfig,
        "Msg": config.Msg,
        "Window": config.Window,
        'getEmails': function () {
            return self.getEmails();
        },
        'setEmails': function (emailsStr) {
            self.setEmails(emailsStr);
        }
    });
    var sendForm, sbs, emailsStore = new Ext.data.SimpleStore({
        fields:
        [
            { name: 'name', type: 'string' },
            { name: 'flag', type: 'boolean' }
        ],
        data: HttpCommander.Lib.Utils.EMails.getDataStore(),
        sortInfo: { field: 'name', direction: 'ASC' }
    });

    sbs = new Ext.ux.form.SuperBoxSelect({
        itemId: 'send-to',
        hideLabel: true,
        columnWidth: 1,
        allowBlank: false,
        autoHeight: true,
        xtype: 'superboxselect',
        resizable: true,
        forceFormValue: false,
        allowAddNewData: true,
        addNewDataOnBlur: true,
        store: emailsStore,
        triggerAction: 'all',
        lazyInit: false,
        mode: 'local',
        displayField: 'name',
        displayFieldTpl: '{name:htmlEncode}',
        tpl: '<tpl for="."><div class="x-combo-list-item">{name:htmlEncode}</div></tpl>',
        valueField: 'name',
        forceSelection: true,
        allowQueryAll: true,
        listeners: {
            newitem: function (ss, val, flt) {
                if (Ext.isEmpty(val) || val.trim().length == 0) {
                    return;
                }
                var recs = ss.usedRecords, emls = val.split(/,|;|\|/gi);
                Ext.each(emls, function (itm, idx) {
                    var vl;
                    if (!Ext.isEmpty(itm) && ((vl = itm.trim()).length > 0) && !recs.containsKey(vl.toLowerCase())) {
                        var rec = new Ext.data.Record({
                            name: vl,
                            flag: true
                        });
                        ss.getStore().add(rec);
                        ss.getStore().commitChanges();
                        ss.addRecord(rec);
                    }
                });
            },
            render: function (ss) {
                ss.syncSize();
                ss.firstHeight = ss.getHeight();
                ss.initHeight = ss.getHeight();
            },
            autosize: function (ss, w) {
                //if (ss && sendForm) {
                var bodyEl = sendForm.getComponent('send-body');
                //if (bodyEl) {
                if (typeof ss.initHeight != 'undefined') {
                    var oldH = self.getHeight();
                    var deltaH = ss.getHeight() - ss.initHeight;
                    var newH = oldH + deltaH;
                    ss.initHeight = ss.getHeight();
                    if (oldH != newH) {
                        self.setHeight(newH);
                        self.syncShadow();
                        self.fireEvent('resize', self, self.getWidth(), newH);
                        if (bodyEl && bodyEl.rendered) {
                            //alert('h=' + bodyEl.getHeight() + ', dh=' + deltaH);
                            bodyEl.syncSize();
                            //bodyEl.setHeight(bodyEl.getHeight() - deltaH);
                            //bodyEl.lastHeight = bodyEl.getHeight();
                        }
                    }
                }
                //}
            }
        }
    });

    var self = new config.Window({
        title: config.htcConfig.locData.CommandSendEmail,
        plain: true,
        bodyStyle: 'padding:5px',
        modal: true,
        collapsible: false,
        maximizable: !config.getEmbedded(), // true,
        width: 400,
        height: config.getIsEmbeddedtoIFRAME() ? 275 : 325,
        minWidth: 400,
        minHeight: config.getIsEmbeddedtoIFRAME() ? 275 : 325,
        layout: 'fit',
        closeAction: 'hide',
        sendType: 1, // 0 - disable, 1 - only links, 2 - only attachments, 3 - any
        withFiles: true,
        withFolders: false,
        urls: [],
        urlsBT: [],
        fUrls: [],
        fUrlsBT: [],
        items:
        [
            sendForm = new Ext.form.FormPanel({
                baseCls: 'x-plain',
                labelWidth: 75,
                defaults: { xtype: 'textfield', anchor: '100%' },
                items:
                [
                    {
                        xtype: 'container',
                        layout: 'column', // 'hbox',
                        anchor: '100%',
                        itemId: 'send-to-cont',
                        autoHeight: true,
                        fieldLabel: config.htcConfig.locData.SendEmailTo,
                        items:
                        [
                            sbs,
                            {
                                itemId: 'mailing-groups-button',
                                style: {
                                    paddingLeft: '5px'
                                },
                                xtype: 'button',
                                icon: HttpCommander.Lib.Utils.getIconPath(config,'mailgroups'),
                                tooltip: config.htcConfig.locData.SendEmailBulkMailingListHint,
                                handler: function () {
                                    mailingGroupsWindow.setNoteText('');
                                    mailingGroupsWindow.hide();
                                    var oldTA = Ext.Ajax.timeout;
                                    Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
                                    config.globalLoadMask.msg = config.htcConfig.locData.GettingMailingListProgressMessage + "...";
                                    config.globalLoadMask.show();
                                    var params = {
                                        path: config.getCurrentFolder(),
                                        emails: self.getSendToField().getValueArray()
                                    };
                                    HttpCommander.Common.GetMailingList(params, function (data, trans) {
                                        Ext.Ajax.timeout = oldTA;
                                        config.globalLoadMask.hide();
                                        config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                                        if (typeof data == 'undefined')
                                            config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, Ext.util.Format.htmlEncode(trans.message));
                                        else if (!data.success)
                                            config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, data.message);
                                        else
                                            mailingGroupsWindow.setGroups(data.groups);
                                        if (data.groups.length == 0)
                                            mailingGroupsWindow.setNoteText(config.htcConfig.locData.SendEmailEmptyMailingListMessage);
                                        mailingGroupsWindow.show();
                                    });
                                }
                            }
                        ]
                    },
                    {
                        itemId: 'send-sender-email',
                        fieldLabel: config.htcConfig.locData.SendEmailSenderEmail,
                        anchor: '100%',
                        vtype: 'email',
                        allowBlank: true,
                        value: config.htcConfig.currentEMail
                    },
                    {
                        itemId: 'send-subject',
                        fieldLabel: config.htcConfig.locData.SendEmailSubject,
                        anchor: '100%',
                        allowBlank: false
                    },
                    {
                        itemId: 'send-files',
                        xtype: 'radiogroup',
                        anchor: '100%',
                        vertical: true,
                        columns: 1,
                        hideLabel: true,
                        disabled: true,
                        items:
                        [
                            {
                                boxLabel: config.htcConfig.locData.SendEmailFilesAsLinksTo,
                                name: 'rb-auto',
                                inputValue: 'links-to',
                                checked: false,
                                listeners:
                                {
                                    check: function (radio, checked) {
                                        var sendBody = sendForm.getComponent('send-body');
                                        var body = sendBody.getValue();
                                        var url, i;
                                        for (i = 0; i < self.urls.length; i++) {
                                            url = self.urls[i];
                                            if (typeof url == 'string' && url != '') {
                                                while (body.indexOf(url) >= 0) {
                                                    body = body.replace(url, '');
                                                }
                                            }
                                        }
                                        for (i = 0; i < self.urlsBT.length; i++) {
                                            url = self.urlsBT[i];
                                            if (typeof url == 'string' && url != '') {
                                                while (body.indexOf(url) >= 0) {
                                                    body = body.replace(url, '');
                                                }
                                            }
                                        }
                                        if (checked && self.urls.length > 0)
                                            body += self.urls.join('');
                                        sendBody.setValue(body);
                                        sendBody.syncValue();
                                    }
                                }
                            },
                            {
                                boxLabel: config.htcConfig.locData.SendEmailFilesAsAttachements,
                                name: 'rb-auto',
                                inputValue: 'attach',
                                checked: false
                            }
                        ]
                    },
                    {
                        itemId: 'send-body',
                        xtype: 'htmleditor',
                        hideLabel: true,
                        flex: 1,
                        //anchor: '100%-135'
                        width: '100%',
                        //height: '100%',
                        anchor: '100%',
                        listeners: {
                            afterrender: function (cmp) {
                                cmp.lastHeight = cmp.getHeight();
                            }
                        }
                    }
                ]
            })
        ],
        buttonAlign: 'left',
        buttons: [{
            icon: HttpCommander.Lib.Utils.getIconPath(config, 'sendemail') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=sendemail' : ''),
            text: config.htcConfig.locData.AnonymousLinkSendViaButton,
            menu: [{
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'gmail'),
                text: 'Gmail',
                handler: function (item) {
                    self.sendViaService('https://mail.google.com/mail/?view=cm&fs=1&ui=2&to={0}&su={1}&body={2}', 'gmail');
                }
            }, {
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'outlook'),
                text: 'Outlook',
                handler: function (item) {
                    self.sendViaService('https://outlook.live.com/?path=/mail/action/compose&subject={1}&body={2}&to={0}', 'outlook');
                }
            }]
        }, '->', {
            text: config.htcConfig.locData.SendEmailSend,
            handler: function () {
                if (sendForm.getForm().isValid()) {
                    var toField = self.getSendToField();
                    var sendInfo = {
                        to: toField.getValueArray(),
                        subject: sendForm.getComponent('send-subject').getValue(),
                        body: sendForm.getComponent('send-body').getValue(),
                        files: [],
                        path: config.getCurrentFolder(),
                        withFiles: self.withFiles,
                        withFolders: self.withFolders,
                        sender: sendForm.getComponent('send-sender-email').getValue()
                    };
                    var eStore = toField.usedRecords,
                        recs = eStore.getRange(),
                        rec;
                    for (var i = 0, len = recs.length; i < len; i++) {
                        rec = recs[i];
                        if (rec.get('flag') === true) {
                            HttpCommander.Lib.Utils.EMails.put(rec.get('name'));
                            rec.set('flag', false);
                            rec.commit();
                        }
                    }
                    var st = sendForm.getComponent('send-files').getValue();
                    var attach = st && st.getGroupValue() == "attach";
                    if (sendInfo.withFiles && ((attach && self.sendType == 3) || self.sendType == 2))
                        sendInfo.files = self.createSelectedFilesSet().files;
                    sendInfo.withFiles = sendInfo.files && sendInfo.files.length > 0;
                    var oldTA = Ext.Ajax.timeout;
                    Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
                    config.globalLoadMask.msg = config.htcConfig.locData.SendEmailProgressMessage + "...";
                    config.globalLoadMask.show();
                    HttpCommander.Common.SendEmail(sendInfo, function (data, trans) {
                        Ext.Ajax.timeout = oldTA;
                        config.globalLoadMask.hide();
                        config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                        if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                                    data, trans, config.Msg, config.htcConfig)) {
                            config.Msg.show({
                                title: config.htcConfig.locData.CommandSendEmail,
                                msg: config.htcConfig.locData.SendEmailSuccessMessage + '<br />'
                                    + String.format(
                                        config.htcConfig.locData.SendEmailResultsMessage,
                                        data.sended,
                                        data.failed,
                                        data.message || ''
                                    ),
                                closable: true,
                                modal: true,
                                buttons: config.Msg.OK,
                                fn: function (btn) {
                                    self.hide();
                                },
                                icon: config.Msg.INFO
                            });
                        }
                    });
                }
            }
        }, {
            text: config.htcConfig.locData.CommonButtonCaptionClose,
            handler: function () {
                self.hide();
                sendForm.getForm().reset();
            }
        }],
        listeners: {
            afterrender: function (win) {
                win.lastHeight = win.getHeight();
                var wit = sendForm.getComponent('send-files');
                if (!wit)
                    return;
                switch (win.sendType) {
                    case 0:
                        wit.items.items[0].el.dom.checked = wit.items.items[1].el.dom.checked = false;
                        wit.setDisabled(true);
                        break;
                    case 1:
                        wit.items.items[0].el.dom.checked = true;
                        wit.items.items[1].el.dom.checked = false;
                        wit.setDisabled(true);
                        break;
                    case 2:
                        wit.items.items[0].el.dom.checked = false;
                        wit.items.items[1].el.dom.checked = true;
                        wit.setDisabled(true);
                        break;
                    case 3:
                        wit.items.items[0].el.dom.checked = true;
                        wit.items.items[1].el.dom.checked = false;
                        break;
                }
            },
            hide: function (win) {
                self.urls = [];
                self.urlsBT = [];
                self.fUrls = [];
                self.fUrlsBT = [];
            },
            resize: function (win, w, h) {
                if (win && sendForm && typeof sbs.firstHeight != 'undefined') {
                    var bodyEl = sendForm.getComponent('send-body');
                    if (typeof win.lastHeight != 'undefined' && bodyEl && typeof bodyEl.lastHeight != 'undefined') {
                        var deltaH = h - win.lastHeight;
                        bodyEl.setHeight(bodyEl.lastHeight + deltaH);
                        bodyEl.lastHeight = bodyEl.getHeight();
                        win.lastHeight = win.getHeight();
                        bodyEl.setHeight(bodyEl.getHeight() - 73 - (sbs.getHeight() - sbs.firstHeight));
                        //bodyEl.syncSize();
                    }
                }
            }
        },


        sendViaService: function (urlTpl, service) {
            if (!urlTpl) {
                return;
            }
            var to = self.getSendToField().getValueArray(),
                subject = sendForm.getComponent('send-subject').getValue(),
                body = (self.allRawUrls || []).join('\n\n').replace(/&action=download/gi, '');

            if (Ext.isEmpty(body)) {
                body = sendForm.getComponent('send-body').getValue();
            }

            var maxLen = (service == 'gmail' ? 8192 : 2048),
                url = String.format(urlTpl,
                encodeURIComponent(to || ''),
                encodeURIComponent(subject || ''),
                encodeURIComponent(body || ''));

            if (url.length >= maxLen) {
                url = url.substring(0, maxLen);
            }

            var sendWindow = window.open(url, 'linkssend' + (service || 'gmail'),
                HttpCommander.Lib.Utils.getPopupProps(600, 500));
            if (sendWindow) {
                try { sendWindow.focus(); }
                catch (e) { }
            }
        },
        createSelectedFilesSet: function () {
            //var self = this;
            //var fileArray = config.getSelectedFiles();
            //return eval(Ext.util.JSON.encode(fileArray));
            return config.getSelectedFiles();
        },
        cleanup: function () {
            self.urls = [];
            self.urlsBT = [];
            self.fUrls = [];
            self.fUrlsBT = [];
            self.allRawUrls = [];
            sendForm.getComponent('send-sender-email').setValue('');
            sendForm.getComponent('send-subject').setValue('');
            sendForm.getForm().reset();
            sendForm.getComponent('send-body').setValue('');
            sendForm.getComponent('send-body').syncValue();
        },
        setSendFiles: function (enableRadioGroup) {
            var sendFiles = sendForm.getComponent('send-files');
            if (sendFiles) {
                sendFiles.setDisabled(!enableRadioGroup);
                if (self.sendType > 0) {
                    sendFiles.setValue(self.sendType == 2 ? 'attach' : 'links-to');
                }
            }
        },
        setUrls: function (urls, urlsBT, fUrls, fUrlsBT, allRawUrls) {
            var windows = this;

            var content = "";

            if (urls || urls.length > 0) {
                content += urls.join('');
            }
            if (fUrls && fUrls.length > 0) {
                content += fUrls.join('');
            }

            sendForm.getComponent('send-body').setValue(content);
            sendForm.getComponent('send-body').syncValue();

            self.urls = urls || [];
            self.urlsBT = urlsBT || [];
            self.fUrls = fUrls || [];
            self.fUrlsBT = fUrlsBT || [];
            self.allRawUrls = allRawUrls || [];
        },
        setVisibleMailingGroupsButton: function (visible) {
            var mgb = sendForm.getComponent('send-to-cont').getComponent('mailing-groups-button');
            if (mgb) {
                mgb.setVisible(visible);
            }
        },
        getSendToField: function () {
            return sbs || sendForm.getComponent('send-to-cont').getComponent('send-to');
        },
        getEmails: function () {
            var self = this;
            var emailsFields = self.getSendToField();
            if (emailsFields)
                return emailsFields.getValue();
            else
                return null;
        },
        setEmails: function (emails) {
            var self = this;
            var emailsFields = self.getSendToField();
            if (emailsFields) {
                //emailsFields.setValue(emails);
                var eArr = [], email;
                if (typeof emails != 'undefined' && emails.length > 0) {
                    eArr = emails.split(',');
                    for (var i = 0, len = eArr.length; i < len; i++) {
                        email = eArr[i];
                        if (email && email.length > 0) {
                            emailsFields.fireEvent('newitem', emailsFields, email, '');
                        }
                    }
                }
            }
        },
        initialize: function (pubLinkInfo) {
            self.cleanup();

            sendForm.getComponent('send-sender-email').setValue(config.htcConfig.currentEMail);

            var isPubLinks = typeof pubLinkInfo != 'undefined' && pubLinkInfo != null;

            var selFileNames = isPubLinks ? [] : config.getSelectedFiles().files;
            var selFiles = selFileNames.length;
            var selFolderNames = config.getSelectedFiles().folders;
            var selFolders = selFolderNames.length;
            var allRawUrls = [];
            var urls = [];
            var urlsBT = [];
            var fUrls = [];
            var fUrlsBT = [];
            if (isPubLinks) {
                sendForm.getComponent('send-subject').setValue(config.htcConfig.locData.AnonymousLinkSendSubject);
                var pubUrl;
                if (typeof pubLinkInfo.url != 'undefined') {
                    allRawUrls.push(pubLinkInfo.url);
                    pubUrl = Ext.util.Format.htmlEncode(pubLinkInfo.url);
                    urls.push('<br><a href="' + pubUrl + '">' + pubUrl + '</a>');
                    urlsBT.push('<BR><A href="' + pubUrl + '">' + pubUrl + '</A>');
                }
                if (typeof pubLinkInfo.sUrl != 'undefined') {
                    allRawUrls.push(pubLinkInfo.sUrl);
                    pubUrl = Ext.util.Format.htmlEncode(pubLinkInfo.sUrl)
                    urls.push('<br><a href="' + pubUrl + '">' + pubUrl + '</a>');
                    urlsBT.push('<BR><A href="' + pubUrl + '">' + pubUrl + '</A>');
                }
            } else {
                if (sendForm.getComponent('send-subject').getValue() == config.htcConfig.locData.AnonymousLinkSendSubject) {
                    sendForm.getComponent('send-subject').setValue('');
                }
                if ((config.htcConfig.currentPerms && config.htcConfig.currentPerms.download && selFiles > 0) || selFolders > 0) {
                    var curFolder = config.getCurrentFolder();
                    if (config.htcConfig.currentPerms && config.htcConfig.currentPerms.download && selFiles > 0) {
                        Ext.each(selFileNames, function (fileName) {
                            var url = config.linkToFileByName(fileName, curFolder);
                            allRawUrls.push(url);
                            urls.push('<br><a href="' + Ext.util.Format.htmlEncode(url) + '">' + Ext.util.Format.htmlEncode(url) + '</a>');
                            urlsBT.push('<BR><A href="' + Ext.util.Format.htmlEncode(url) + '">' + Ext.util.Format.htmlEncode(url) + '</A>');
                        });
                    }
                    if (selFolders > 0) {
                        Ext.each(selFolderNames, function (fileName) {
                            var url = config.linkToFolderByName(fileName, curFolder);
                            allRawUrls.push(url);
                            fUrls.push('<br><a href="' + Ext.util.Format.htmlEncode(url) + '">' + Ext.util.Format.htmlEncode(url) + '</a>');
                            fUrlsBT.push('<BR><A href="' + Ext.util.Format.htmlEncode(url) + '">' + Ext.util.Format.htmlEncode(url) + '</A>');
                        });
                    }
                }
            }
            var allowLinks =
                (
                    ((selFiles > 0 && config.htcConfig.enableLinkToFile == true) || (isPubLinks && urls.length > 0))
                        ||
                    (selFolders > 0 && config.htcConfig.enableLinkToFolder == true)
                )
                && (config.htcConfig.enableSendEmail == "any"
                    || config.htcConfig.enableSendEmail == "linksonly"
                );
            var allowAttach = urls.length > 0 && (isPubLinks || config.htcConfig.currentPerms.download)
                && (config.htcConfig.enableSendEmail == "any"
                    || config.htcConfig.enableSendEmail == "attachmentsonly"
                );

            self.sendType = ((selFiles == 0 && selFolders == 0) ? 0 : (allowLinks && !allowAttach ? 1 : (!allowLinks && allowAttach ? 2 : 3)));
            self.setSendFiles(selFiles > 0 && config.htcConfig.enableSendEmail == "any" && allowLinks && allowAttach);
            self.withFiles = selFiles > 0;
            self.withFolders = selFolders > 0;
            if (allowLinks) {
                self.setUrls(urls, urlsBT, fUrls, fUrlsBT, allRawUrls);
            }

            self.setVisibleMailingGroupsButton(
                config.htcConfig.bulkMailSendSettings
                && config.htcConfig.bulkMailSendSettings != 'disabled'
                && config.htcConfig.currentPerms
                && config.htcConfig.currentPerms.bulkMailing
            );

            emailsStore.loadData(HttpCommander.Lib.Utils.EMails.getDataStore());
            sbs.focus();
        }
    });
    return self;
};