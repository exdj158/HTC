Ext.ns('HttpCommander.Lib');

/*
    config: htcConfig, Msg, Window, getView(), isExtensionAllowed(),
    getRestrictionMessage(), gridItemExists(), globalLoadMask, getUid(),
    getCurrentFolder(), showBalloon(), openGridFolder(), openTreeNode(),
    getGrid(), getCurrentGridView(), getAsControl(), showRefreshWarning(),
    setAllowEdit(), createSelectedSet(), downloadFile(),
    initDownload(), getDownloadWindow(), 
    getAppRootUrl(), getFileManager(), reloadTreeNodeIfOpened,
    initAndShowShortcutWindow(), viewFile(),
    initImagesViewer(), initFlashViewer(), initEditTextFileWindow(),
    virtualFilePath(), prepareAndShowLinkToFileFolderWindow(),
    initSendEmail(), createVideoConvertWindow(),
    createPlayVideoFlashWindow(), createPlayVideoHtml5Window(),
    createPlayAudioHtml5Window(), initAndShowZipPromptWindow(),
    initAndShowCloudConvertWindow(),
    getGoogleDriveAuth(), editInGoogle(), deleteInGoogle(),
    getSkyDriveAuth(), editInMSOO(), deleteInMSOO(),
    office365Edit(), deleteInOffice365(), setSelectPath(), isRecentFolder(),
    openTreeRecent(), isTrashFolder(), openSharedByLink(), initAndShowWatchModifsWindow(),
    openTrash(), initAndShowChangesWatchWindow(), openTreeAlerts(), getSelectedFiles(),
    linkToFileByName(), linkToFolderByName(),
    toggleToolbarButtons(), clipboard, getDetailsPane()
*/
HttpCommander.Lib.MenuActions = function (config) {
    var showError = function (message) {
        config.Msg.show({
            title: config.htcConfig.locData.CommonErrorCaption,
            msg: message || 'Unknown error',
            icon: config.Msg.ERROR,
            buttons: config.Msg.CANCEL
        });
    };

    var createAndShowConfirmForNewInCloud = function (cfg) {
        cfg = cfg || {};
        var clw = new config.Window({
            title: cfg.title || '',
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
                fieldLabel: Ext.isEmpty(cfg.prompt) ? config.htcConfig.locData.CommonFileNamePrompt : cfg.prompt,
                itemId: 'new-value',
                allowBlank: false,
                xtype: 'textfield',
                anchor: '100%',
                value: cfg.newName || '',
                enableKeyEvents: true,
                listeners: {
                    keyup: function (fld, e) {
                        if (e && e.keyCode == 13) {
                            var val = fld.getValue();
                            if (!Ext.isEmpty(val) && val.trim().length > 0 && Ext.isFunction(cfg.callback)) {
                                cfg.callback(val, clw);
                            }
                        }
                    }
                }
            }],
            buttonAlign: 'center',
            buttons: [{
                text: config.htcConfig.locData.CommonButtonCaptionOK,
                handler: function (btn) {
                    var val = clw.getComponent('new-value').getValue();
                    if (!Ext.isEmpty(val) && Ext.isFunction(cfg.callback)) {
                        cfg.callback(val, clw);
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
                    var fld = wnd.getComponent('new-value');
                    if (fld && fld.rendered) {
                        var val = fld.getValue();
                        if (!Ext.isEmpty(val)) {
                            var lastDot = val.lastIndexOf('.');
                            if (lastDot < 0) {
                                lastDot = val.length;
                            }
                            setTimeout(function () {
                                try { fld.selectText(0, lastDot); } catch (e) { }
                                try { fld.focus(); } catch (e) { }
                            }, 50);
                            return;
                        }
                        fld.focus(true, 50);
                    }
                }
            }
        });
        clw.show();
        return clw;
    };
    var convertToNewDocFomat = function (cfg) {
        var newExt = (cfg || {}).newExt || '';
        var callback = (cfg || {}).callback;
        var args = (cfg || {}).args || [];
        if (!Ext.isArray(args)) {
            args = [args];
        }
        if (!Ext.isEmpty(newExt) && Ext.isFunction(callback)) {
            var cnvWin = new config.Window({
                title: config.htcConfig.locData.CommonConfirmCaption,
                autoDestroy: true,
                defaultButton: 0,
                modal: true,
                closable: true,
                minizable: false,
                maximizable: false,
                width: 260,
                minWidth: 200,
                layout: 'form',
                padding: 5,
                resizable: false,
                autoHeight: true,
                items: [{
                    xtype: 'label',
                    anchor: '100%',
                    html: String.format(config.htcConfig.locData.EditInGoogleConvertMessage,
                        newExt, '<span style="font-weight:bold;">', '</span>')
                }],
                buttonAlign: 'center',
                buttons: [{
                    text: config.htcConfig.locData.CommonButtonCaptionContinue,
                    handler: function (btn) {
                        cnvWin.hide();
                        callback.apply(self, args);
                    }
                }, {
                    text: config.htcConfig.locData.CommonButtonCaptionCancel,
                    handler: function (btn) {
                        cnvWin.hide();
                    }
                }]
            });
            cnvWin.show();
            return;
        }
    };
    var createAndShowWaitEdit = function (cfg) {
        cfg = cfg || {};
        var clw = new config.Window({
            id: cfg.id || Ext.id(),
            title: cfg.title || config.htcConfig.locData.CommonProgressPleaseWait,
            autoDestroy: true,
            modal: true,
            closable: false,
            minizable: false,
            maximizable: false,
            width: 400,
            layout: 'form',
            padding: 5,
            resizable: false,
            autoHeight: true,
            items: [{
                xtype: 'label',
                html: "<img src='" + HttpCommander.Lib.Utils.getIconPath(config, 'ajax-loader.gif') + "' class='filetypeimage'>&nbsp;"
                    + (cfg.message1 || config.htcConfig.locData.CommonProgressPleaseWait) + "...<br />",
            }, {
                xtype: 'label',
                html: String.format(cfg.message2 || config.htcConfig.locData.EditDocumentCancelHint,
                        '&quot;' + config.htcConfig.locData.HideButton + '&quot;',
                        '&quot;' + config.htcConfig.locData.CancelEditButton + '&quot;'
                    )
            }, {
                itemId: 'save-hint',
                xtype: 'label',
                html: String.format('<br />' + (cfg.message3 || config.htcConfig.locData.EditDocumentSaveHint),
                        '&quot;' + config.htcConfig.locData.CommandSave + '&quot;'
                    ),
                hidden: true
            }],
            listeners: {
                hide: function () {
                    setTimeout(config.openTreeRecent, 500);
                }
            },
            buttonAlign: 'center',
            buttons: [{
                text: config.htcConfig.locData.HideButton,
                handler: function (btn) {
                    clw.hide();
                }
            }, {
                text: config.htcConfig.locData.CancelEditButton,
                handler: function (btn) {
                    if (Ext.isFunction(cfg.cancelFn)) {
                        cfg.cancelFn.apply(self);
                    }
                    clw.hide();
                }
            }, {
                text: config.htcConfig.locData.CommandSave,
                hidden: true,
                handler: function (btn) {
                    if (Ext.isFunction(cfg.saveFn)) {
                        cfg.saveFn.apply(self);
                    }
                }
            }],
            showSave: function () {
                if (clw) {
                    try {
                        clw.getComponent('save-hint').show();
                        clw.buttons[2].show();
                    } catch (e) {
                        if (!!window.console && !!window.console.log) {
                            window.console.log(e);
                        }
                    }
                }
            }
        });
        if (!Ext.isFunction(window.refreshRecentFromEditor)) {
            window.refreshRecentFromEditor = function () {
                setTimeout(config.openTreeRecent, 1000);
            };
        }
        clw.show();
        return clw;
    };

    var self = {
        setLabel: function (label, color, clw) {
            var selectedSet = config.createSelectedSet(config.getGrid(), config.getCurrentFolder());
            var curFolder = config.getCurrentFolder();
            var remove = false;
            if (!Ext.isObject(selectedSet) || (selectedSet.filesCount == 0 && selectedSet.foldersCount == 0)) {
                return;
            }
            if (Ext.isEmpty(label) || Ext.isEmpty(color)) {
                remove = true;
            } else {
                selectedSet['label'] = label;
                selectedSet['color'] = color;
            }
            config.globalLoadMask.msg = config.htcConfig.locData[remove ? 'LabelsRemovingLabelMessage' : 'LabelsLabellingMessage'] + "...";
            config.globalLoadMask.show();
            var oldAT = Ext.Ajax.timeout;
            Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
            HttpCommander.Metadata.Label(selectedSet, function (data, trans) {
                Ext.Ajax.timeout = oldAT;
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                        data, trans, config.Msg, config.htcConfig)) {
                    var tip = '';
                    var ok = data.labelled;
                    var notOk = data.notLabelled;
                    if (ok > 0) {
                        tip += String.format(config.htcConfig.locData[remove ? 'LabelsRemovedMessage' : 'LabelsFileLabelledMessage'], ok);
                        if (notOk > 0) {
                            tip += ',<br />' + String.format(config.htcConfig.locData[remove ? 'LabelsNotRemovedMessages' : 'LabelsNotLabelledMessage'], notOk);
                            if (!Ext.isEmpty(data.message)) {
                                tip += '<br />' + data.message;
                            }
                        }
                    } else if (!Ext.isEmpty(data.message)) {
                        showError(data.message);
                    }
                    if (!Ext.isEmpty(tip)) {
                        config.showBalloon(tip);
                    }
                    if (clw && clw.isVisible()) {
                        clw.hide();
                    }
                    var firstItem = selectedSet.filesCount > 0 ? selectedSet.files[0]
                        : selectedSet.foldersCount > 0 ? selectedSet.folders[0] : null;
                    if (!Ext.isEmpty(curFolder) && !Ext.isEmpty(firstItem)) {
                        config.setSelectPath({
                            name: firstItem,
                            path: curFolder
                        })
                    }
                    config.openGridFolder(curFolder);
                }
            });
        },
        // Create new empty file / folder / template
        createNewItemImpl: function (createInfo, fromSelectFolderDlg) {
            config.globalLoadMask.msg = config.htcConfig.locData.ProgressCreating + "...";
            config.globalLoadMask.show();
            HttpCommander.Common.Create(createInfo, function (data, trans) {
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                if (typeof data == 'undefined') {
                    showError(Ext.util.Format.htmlEncode(trans.message));
                    return;
                }
                if (data.success) {
                    config.showBalloon(config.htcConfig.locData.BalloonCreatedSuccessfully);
                    var newFullPath = createInfo['path'];
                    if (!Ext.isEmpty(newFullPath) && !Ext.isEmpty(createInfo['newName'])) {
                        config.setSelectPath({
                            name: createInfo['newName'],
                            path: newFullPath
                        });
                        newFullPath += '/' + createInfo['newName'];
                    }
                    config.openTreeRecent();
                    if (!!fromSelectFolderDlg && fromSelectFolderDlg.isVisible()) {
                        config.openTreeNode(createInfo["path"], true);
                        fromSelectFolderDlg.openTreeNode(newFullPath);
                    } else {
                        config.openGridFolder(createInfo["path"], true, createInfo["type"] == "folder");
                    }
                } else {
                    if (data.newname) {
                        config.Msg.confirm(
                            config.htcConfig.locData.CommonConfirmCaption,
                            data.message,
                            function (btnConfirm) {
                                if (btnConfirm == 'yes') {
                                    createInfo["newName"] = data.newname;
                                    self.createNewItemImpl(createInfo, fromSelectFolderDlg);
                                }
                            },
                            self
                        );
                    } else {
                        showError(data.message);
                    }
                }
            });
        },
        createNewItem: function (type, specifiedFolder, fromSelectFolderDlg) {
            var caption =
                type == 'file'
                ? config.htcConfig.locData.CommonFileNameCaption
                : config.htcConfig.locData.CommonFolderNameCaption;
            var prompt =
                type == 'file'
                ? config.htcConfig.locData.CommonFileNamePrompt + ":"
                : config.htcConfig.locData.CommonFolderNamePrompt + ":";
            var msgp = config.Msg.prompt(caption, prompt, function (btn, text) {
                if (btn == 'ok') {
                    var curFolder = !Ext.isEmpty(specifiedFolder) ? specifiedFolder : config.getCurrentFolder();
                    if (type === 'file' && !config.isExtensionAllowed(text)) {
                        showError(config.getRestrictionMessage());
                        return;
                    }
                    var createInfo = {};
                    createInfo["path"] = curFolder;
                    createInfo["type"] = type;
                    createInfo["newName"] = text;
                    self.createNewItemImpl(createInfo, fromSelectFolderDlg);
                }
            }, self, false, config.htcConfig.locData[type == 'file' ? 'CommonFileNewNameValue' : 'CommonFolderNewNameValue']);
            if (msgp) {
                var dlg = msgp.getDialog(), inpts, edt;
                if (dlg && (inpts = dlg.el.dom.getElementsByTagName('input'))) {
                    if (inpts.length > 0 && (edt = inpts[0]) && edt.value) {
                        var isFile = type == 'file',
                            val = String(edt.value),
                            end = isFile ? val.lastIndexOf('.') : val.length;
                        if (end < 0)
                            end = val.length;
                        if (edt.createTextRange) {
                            var selRange = edt.createTextRange();
                            selRange.collapse(true);
                            selRange.moveStart('character', 0);
                            selRange.moveEnd('character', end);
                            selRange.select();
                            edt.focus();
                        } else if (edt.setSelectionRange) {
                            edt.focus();
                            edt.setSelectionRange(0, end);
                        } else if (typeof edt.selectionStart != 'undefined') {
                            edt.selectionStart = 0;
                            edt.selectionEnd = end;
                            edt.focus();
                        }
                    }
                }
            }
        },
        // New MSOO
        createNewMSOO: function (ext, newName) {
            if (Ext.isEmpty(ext)
                || !config.isExtensionAllowed(ext)
                || !config.getSkyDriveAuth()) {
                return;
            }
            var nm = newName;
            if (!Ext.isEmpty(nm)) {
                nm += '.' + ext;
            } else {
                return;
            }
            createAndShowConfirmForNewInCloud({
                title: config.htcConfig.locData.CommandNewMSOODocument,
                newName: nm,
                callback: function (text, confirmWindow) {
                    var ext1 = HttpCommander.Lib.Utils.getFileExtension(text);
                    if (ext1 != ext) {
                        text += '.' + ext;
                    }
                    if (Ext.isObject(confirmWindow) && Ext.isFunction(confirmWindow.hide)) {
                        confirmWindow.hide();
                    }
                    self.msooEdit(text);
                }
            });
        },
        // New Office 365
        createNew365: function (ext, newName) {
            if (Ext.isEmpty(ext)
                || !config.isExtensionAllowed(ext)
                || !config.getSkyDriveAuth()) {
                return;
            }
            var nm = newName;
            if (!Ext.isEmpty(nm)) {
                nm += '.' + ext;
            } else {
                return;
            }
            createAndShowConfirmForNewInCloud({
                title: config.htcConfig.locData.CommandNewOffice365Document,
                newName: nm,
                callback: function (text, confirmWindow) {
                    var ext1 = HttpCommander.Lib.Utils.getFileExtension(text);
                    if (ext1 != ext) {
                        text += '.' + ext;
                    }
                    if (Ext.isObject(confirmWindow) && Ext.isFunction(confirmWindow.hide)) {
                        confirmWindow.hide();
                    }
                    self.office365Edit(text);
                }
            });
        },
        // New Google
        createNewGoogle: function (mime, ext, newName) {
            if (Ext.isEmpty(mime) || Ext.isEmpty(ext)
                || !config.isExtensionAllowed(ext)
                || !config.getGoogleDriveAuth()) {
                return;
            }
            var nm = newName;
            if (!Ext.isEmpty(nm)) {
                nm += '.' + ext;
            } else {
                return;
            }
            createAndShowConfirmForNewInCloud({
                title: config.htcConfig.locData.CommandNewGoogleDocument,
                newName: nm,
                callback: function (text, confirmWindow) {
                    var ext1 = HttpCommander.Lib.Utils.getFileExtension(text);
                    if (ext1 != ext) {
                        text += '.' + ext;
                    }
                    if (Ext.isObject(confirmWindow) && Ext.isFunction(confirmWindow.hide)) {
                        confirmWindow.hide();
                    }
                    self.googleEdit(text, mime);
                }
            });
        },
        // Edit document in MS Office Online
        msooEditImpl: function (curFolder, fileName, create) {
            var pmeInterval = null, popupMSOOE = null, waitMsg = null, wmId = Ext.id();

            if (!Ext.isFunction(window.handleMSOOEditorError)) {
                window.handleMSOOEditorError = function (error, waitId) {
                    if (!Ext.isEmpty(error)) {
                        self.showedMSOOError = true;
                        self.hideEditWaitWindowById(waitId);
                        config.Msg.hide();
                        showError(error);
                    }
                }
            }
            if (!Ext.isFunction(window.handleMSOOEditorAuth)) {
                window.handleMSOOEditorAuth = function (odAuthInfo, waitId) {
                    var a = config && Ext.isFunction(config.getSkyDriveAuth)
                        ? config.getSkyDriveAuth() : null;
                    if (a && Ext.isFunction(a.setAuthAboutInfos)) {
                        a.setAuthAboutInfos(odAuthInfo);
                    }
                }
            }
            if (!Ext.isFunction(window.handleMSOOEditorSend)) {
                window.handleMSOOEditorSend = function (docInfo, waitId) {
                    if (Ext.isObject(docInfo)) {
                        if (!Ext.isEmpty(waitId)) {
                            if (!Ext.isArray(window['lastEditedMSOODoc'])) {
                                window['lastEditedMSOODoc'] = [];
                            }
                            window['lastEditedMSOODoc'].push({
                                id: waitId,
                                doc: Ext.apply({}, docInfo)
                            });
                            self.showSaveEditWaitWindowById(waitId);
                        } else {
                            window['lastEditedGoogleDoc'] = [{ id: null, doc: Ext.apply({}, docInfo) }];
                        }
                    }
                }
            }

            self.showedMSOOError = false;
            waitMsg = createAndShowWaitEdit({
                id: wmId,
                message1: config.htcConfig.locData.EditInMSOOWaiting,
                saveFn: function () {
                    var doc = self.getDocInfoByWaitId('lastEditedMSOODoc', wmId);
                    if (Ext.isObject(doc)) {
                        config.editInMSOO(wmId, doc, curFolder, fileName, create, true);
                    }
                },
                cancelFn: function () {
                    try { window.clearInterval(pmeInterval); }
                    catch (e) { }
                    try { if (popupMSOOE && !popupMSOOE.closed) popupMSOOE.close(); }
                    catch (e) { }
                    // delete doc
                    var doc = self.getDocInfoByWaitId('lastEditedMSOODoc', wmId);
                    if (Ext.isObject(doc) && !Ext.isEmpty(doc.id)) {
                        config.deleteInMSOO(doc);
                    }
                }
            });

            var file = encodeURIComponent(curFolder + '/' + fileName);
            popupMSOOE = window.open(config.htcConfig.relativePath + 'Handlers/MSOOEditor.aspx?doc=' + file
                + (create ? '&new=true' : '') + ('&wmid=' + encodeURIComponent(wmId)),
                'msooeditpopup' + (new Date()).getTime(),
                HttpCommander.Lib.Utils.getPopupProps());
            if (popupMSOOE) {
                try { popupMSOOE.focus(); }
                catch (e) { }
            }
            pmeInterval = window.setInterval(function () {
                try {
                    if (popupMSOOE == null || popupMSOOE.closed) {
                        window.clearInterval(pmeInterval);
                        self.hideEditWaitWindowById(wmId);
                        var doc = self.getDocInfoByWaitId('lastEditedMSOODoc', wmId);
                        if (Ext.isObject(doc)) {
                            config.editInMSOO(wmId, doc, curFolder, fileName, create);
                        } else if (!self.showedMSOOError) {
                            config.Msg.hide();
                            self.showedMSOOError = false;
                        }
                    }
                } catch (e) {
                    window.clearInterval(pmeInterval);
                }
            }, 1000);
        },
        msooEdit: function (newFileName) {
            var create = !Ext.isEmpty(newFileName);
            var curFolder = config.getCurrentFolder();
            var selModel = create ? null : config.getGrid().getSelectionModel();
            var selectedRecord, gda = config.getSkyDriveAuth();
            var fileName = create ? newFileName : null;
            if (!create && selModel.getCount() == 1) {
                selectedRecord = config.getGrid().getSelectionModel().getSelected();
                fileName = selectedRecord.data.name;
            }
            if ((!create && !selectedRecord) || !gda) {
                return;
            }

            var ext = HttpCommander.Lib.Utils.getFileExtension(fileName);
            var newExt = HttpCommander.Lib.Utils.checkAndGetNewExtensionConvertedFromMSOO(ext);
            if (!Ext.isEmpty(newExt)) {
                convertToNewDocFomat({
                    newExt: newExt,
                    callback: self.msooEditImpl,
                    args: [curFolder, fileName, create]
                });
                return;
            }

            self.msooEditImpl(curFolder, fileName, create);
        },
        // Edit in Office 365
        office365EditImpl: function (curFolder, fileName, create) {
            var pmeInterval1 = null, popup365 = null, waitMsg = null, wmId = Ext.id();

            if (!Ext.isFunction(window.getOffice365Auth)) {
                window.getOffice365Auth = function () {
                    var a = config && Ext.isFunction(config.getSkyDriveAuth)
                        ? config.getSkyDriveAuth() : null;
                    return a && Ext.isFunction(a.getAuthInfo) ? a.getAuthInfo(true) : null;
                }
            }
            if (!Ext.isFunction(window.handle365EditorError)) {
                window.handle365EditorError = function (error, waitId) {
                    var _error = Ext.isObject(error) ? error.error_description : error;
                    if (!Ext.isEmpty(_error)) {
                        self.showed365Error = true;
                        self.hideEditWaitWindowById(waitId);
                        config.Msg.hide();
                        showError(_error);
                    }
                }
            }
            if (!Ext.isFunction(window.handle365EditorAuth)) {
                window.handle365EditorAuth = function (odAuthInfo, waitId) {
                    var a = config && Ext.isFunction(config.getSkyDriveAuth)
                        ? config.getSkyDriveAuth() : null
                    if (odAuthInfo) {
                        if (a && Ext.isFunction(a.setAuthInfo)) {
                            a.setAuthInfo(odAuthInfo);
                        }
                    } else if (a && Ext.isFunction(a.clearAuth)) {
                        a.clearAuth();
                    }
                }
            }
            if (!Ext.isFunction(window.handle365EditorSend)) {
                window.handle365EditorSend = function (docInfo, waitId) {
                    if (Ext.isObject(docInfo)) {
                        if (!Ext.isEmpty(waitId)) {
                            if (!Ext.isArray(window['lastEdited365Doc'])) {
                                window['lastEdited365Doc'] = [];
                            }
                            window['lastEdited365Doc'].push({
                                id: waitId,
                                doc: Ext.apply({}, docInfo)
                            });
                            self.showSaveEditWaitWindowById(waitId);
                        } else {
                            window['lastEdited365Doc'] = [{ id: null, doc: Ext.apply({}, docInfo) }];
                        }
                    }
                }
            }

            self.showed365Error = false;
            waitMsg = createAndShowWaitEdit({
                id: wmId,
                message1: config.htcConfig.locData.EditInOffice365Waiting,
                saveFn: function () {
                    var doc = self.getDocInfoByWaitId('lastEdited365Doc', wmId);
                    if (Ext.isObject(doc)) {
                        config.editInOffice365(wmId, doc, curFolder, fileName, create, true);
                    }
                },
                cancelFn: function () {
                    try { window.clearInterval(pmeInterval1); }
                    catch (e) { }
                    try { if (popup365 && !popup365.closed) popup365.close(); }
                    catch (e) { }
                    // delete doc
                    var doc = self.getDocInfoByWaitId('lastEdited365Doc', wmId);
                    if (Ext.isObject(doc) && !Ext.isEmpty(doc.id)) {
                        config.deleteInOffice365(doc);
                    }
                }
            });

            var file = encodeURIComponent(curFolder + '/' + fileName);
            popup365 = window.open(config.htcConfig.relativePath + 'Handlers/Office365Editor.aspx?doc=' + file
                + (create ? '&new=true' : '') + ('&wmid=' + encodeURIComponent(wmId)),
                'o365editpopup' + (new Date()).getTime(),
                HttpCommander.Lib.Utils.getPopupProps());
            if (popup365) {
                try { popup365.focus(); }
                catch (e) { }
            }
            pmeInterval1 = window.setInterval(function () {
                try {
                    if (popup365 == null || popup365.closed) {
                        window.clearInterval(pmeInterval1);
                        self.hideEditWaitWindowById(wmId);
                        var doc = self.getDocInfoByWaitId('lastEdited365Doc', wmId);
                        if (Ext.isObject(doc)) {
                            config.editInOffice365(wmId, doc, curFolder, fileName, create);
                        } else if (!self.showed365Error) {
                            config.Msg.hide();
                            self.showed365Error = false;
                        }
                    }
                } catch (e) {
                    window.clearInterval(pmeInterval1);
                }
            }, 1000);
        },
        office365Edit: function (newFileName) {
            var create = !Ext.isEmpty(newFileName);
            var curFolder = config.getCurrentFolder();
            var selModel = create ? null : config.getGrid().getSelectionModel();
            var selectedRecord, gda = config.getSkyDriveAuth();
            var fileName = create ? newFileName : null;
            var waitMsg;
            if (!create && selModel.getCount() == 1) {
                selectedRecord = config.getGrid().getSelectionModel().getSelected();
                fileName = selectedRecord.data.name;
            }
            if ((!create && !selectedRecord) || !gda) {
                return;
            }

            /*var ext = HttpCommander.Lib.Utils.getFileExtension(fileName);
            var newExt = HttpCommander.Lib.Utils.checkAndGetNewExtensionConvertedFromMSOO(ext);
            if (!Ext.isEmpty(newExt)) {
                convertToNewDocFomat({
                    newExt: newExt,
                    callback: self.office365EditImpl,
                    args: [curFolder, fileName, create]
                });
                return;
            }*/

            self.office365EditImpl(curFolder, fileName, create);
        },
        // Edit document in Google Drive
        googleEditImpl: function (curFolder, fileName, mime, create) {
            var pgeInterval = null, popupGE = null, waitMsg = null, wmId = Ext.id();

            if (!Ext.isFunction(window.handleGoogleEditorError)) {
                window.handleGoogleEditorError = function (error, waitId) {
                    if (!Ext.isEmpty(error)) {
                        self.showedGoogleError = true;
                        self.hideEditWaitWindowById(waitId);
                        config.Msg.hide();
                        showError(error);
                    }
                }
            }
            if (!Ext.isFunction(window.handleGoogleEditorAuth)) {
                window.handleGoogleEditorAuth = function (googleAuthInfo, waitId) {
                    var a = config && Ext.isFunction(config.getGoogleDriveAuth)
                        ? config.getGoogleDriveAuth() : null;
                    if (a && Ext.isFunction(a.setAuthAboutInfos)) {
                        a.setAuthAboutInfos(googleAuthInfo);
                    }
                }
            }
            if (!Ext.isFunction(window.handleGoogleEditorSend)) {
                window.handleGoogleEditorSend = function (docInfo, waitId) {
                    if (Ext.isObject(docInfo)) {
                        var di = Ext.apply({}, docInfo);
                        if (Ext.isObject(docInfo.exportLinks)) {
                            di.exportLinks = Ext.apply({}, docInfo.exportLinks);
                        }
                        if (!Ext.isEmpty(waitId)) {
                            if (!Ext.isArray(window['lastEditedGoogleDoc'])) {
                                window['lastEditedGoogleDoc'] = [];
                            }
                            window['lastEditedGoogleDoc'].push({
                                id: waitId,
                                doc: di
                            });
                            self.showSaveEditWaitWindowById(waitId);
                        } else {
                            window['lastEditedGoogleDoc'] = [{id: null, doc: di}];
                        }
                    }
                }
            }

            self.showedGoogleError = false;
            waitMsg = createAndShowWaitEdit({
                id: wmId,
                message1: config.htcConfig.locData.EditInGoogleWaiting,
                getInterval: function () { return pgeInterval; },
                saveFn: function () {
                    var doc = self.getDocInfoByWaitId('lastEditedGoogleDoc', wmId);
                    if (Ext.isObject(doc)) {
                        config.editInGoogle(wmId, doc, curFolder, fileName, create, true);
                    }
                },
                cancelFn: function () {
                    try { window.clearInterval(pgeInterval); }
                    catch (e) { }
                    try { if (popupGE && !popupGE.closed) popupGE.close(); }
                    catch (e) { }
                    // delete doc
                    var doc = self.getDocInfoByWaitId('lastEditedGoogleDoc', wmId);
                    if (Ext.isObject(doc) && !Ext.isEmpty(doc.id)) {
                        config.deleteInGoogle(doc);
                    }
                }
            });

            var file = encodeURIComponent(curFolder + '/' + fileName);
            popupGE = window.open(config.htcConfig.relativePath + 'Handlers/GoogleEditor.aspx?doc=' + file
                + (create ? ('&mime=' + encodeURIComponent(mime)) : '') + ('&wmid=' + encodeURIComponent(wmId)),
                'googleeditpopup' + (new Date()).getTime(),
                HttpCommander.Lib.Utils.getPopupProps());
            if (popupGE) {
                try { popupGE.focus(); }
                catch (e) { }
            }
            pgeInterval = window.setInterval(function () {
                try {
                    if (popupGE == null || popupGE.closed) {
                        window.clearInterval(pgeInterval);
                        self.hideEditWaitWindowById(wmId);
                        var doc = self.getDocInfoByWaitId('lastEditedGoogleDoc', wmId);
                        if (Ext.isObject(doc)) {
                            config.editInGoogle(wmId, doc, curFolder, fileName, create);
                        } else if (!self.showedGoogleError) {
                            config.Msg.hide();
                            self.showedGoogleError = false;
                        }
                    }
                } catch (e) {
                    window.clearInterval(pgeInterval);
                }
            }, 1000);
        },
        googleEdit: function (newFileName, mime) {
            var create = !Ext.isEmpty(newFileName) && !Ext.isEmpty(mime);
            var curFolder = config.getCurrentFolder();
            var selModel = create ? null : config.getGrid().getSelectionModel();
            var selectedRecord, gda = config.getGoogleDriveAuth();
            var fileName = create ? newFileName : null;
            if (!create && selModel.getCount() == 1) {
                selectedRecord = config.getGrid().getSelectionModel().getSelected();
                fileName = selectedRecord.data.name;
            }
            if ((!create && !selectedRecord) || !gda) {
                return;
            }
            var ext = HttpCommander.Lib.Utils.getFileExtension(fileName);
            var newExt = HttpCommander.Lib.Utils.checkAndGetNewExtensionConvertedFromGoogle(ext);
            if (!Ext.isEmpty(newExt)) {
                convertToNewDocFomat({
                    newExt: newExt,
                    callback: self.googleEditImpl,
                    args: [curFolder, fileName, mime, create]
                });
                return;
            }
            self.googleEditImpl(curFolder, fileName, mime, create);
        },
        showSaveEditWaitWindowById: function (wmId) {
            if (!Ext.isEmpty(wmId)) {
                var wm = Ext.getCmp(wmId);
                if (wm && Ext.isFunction(wm.showSave)) {
                    wm.showSave.apply(wm);
                }
            }
        },
        hideEditWaitWindowById: function (wmId) {
            if (!Ext.isEmpty(wmId)) {
                var wm = Ext.getCmp(wmId);
                if (wm && Ext.isFunction(wm.hide)) {
                    wm.hide();
                }
            }
        },
        getDocInfoByWaitId: function (svc, wmId) {
            var doc = null, len, i, item;
            if (Ext.isEmpty(svc) || Ext.isEmpty(wmId)) {
                return doc;
            }
            if (Ext.isArray(window[svc])) {
                len = window[svc].length;
                for (i = 0; i < len; i++) {
                    item = window[svc][i] || {};
                    if (item.id === wmId) {
                        doc = item.doc;
                        if (Ext.isObject(doc)) {
                            return doc;
                        }
                    }
                }
            }
            return doc;
        },
        // Get output formats for CloudConvert service
        getOutputFormats: function () {
            var fileInfo = { path: '', name: '' };
            var curFolder = config.getCurrentFolder();
            var selModel = config.getGrid().getSelectionModel();
            var selectedRecord;
            if (selModel.getCount() == 1) {
                selectedRecord = config.getGrid().getSelectionModel().getSelected();
                if (selectedRecord) {
                    fileInfo.path = curFolder;
                    fileInfo.name = selectedRecord.data.name;
                }
            }
            if (!selectedRecord || fileInfo.path == '' || fileInfo.name == '') {
                return;
            }
            config.globalLoadMask.msg = config.htcConfig.locData.ProgressGetCloudConvertOutputFormats + "...";
            config.globalLoadMask.show();
            HttpCommander.Common.CloudConvertOutputFormats(fileInfo, function (data, trans) {
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                        data, trans, config.Msg, config.htcConfig, 2)) {
                    config.initAndShowCloudConvertWindow(selectedRecord, curFolder, data.ofs);
                }
            });
        },
        // Rename selected item
        renameImpl: function (renameInfo) {
            config.globalLoadMask.msg = config.htcConfig.locData.ProgressRenaming + "...";
            config.globalLoadMask.show();
            HttpCommander.Common.Rename(renameInfo, function (data, trans) {
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                if (typeof data == 'undefined') {
                    showError(Ext.util.Format.htmlEncode(trans.message));
                    return;
                }
                if (data.success) {
                    config.showBalloon(config.htcConfig.locData.BalloonRenamedSuccessfully);
                    if (data.warning !== true) {
                        if (!Ext.isEmpty(data.resultName)) {
                            config.setSelectPath({
                                name: data.resultName,
                                path: renameInfo["path"]
                            });
                        }
                        if (renameInfo["type"] == 'folder') {
                            config.openGridFolder(renameInfo["path"], true, true);
                        } else {
                            config.openGridFolder(renameInfo["path"]);
                        }
                    }
                } else {
                    if (data.newname) {
                        config.Msg.confirm(
                            config.htcConfig.locData.CommandRename,
                            data.message,
                            function (btnConfirm) {
                                if (btnConfirm == 'yes') {
                                    if (renameInfo["type"] == 'file')
                                        renameInfo["newName"] = data.newname;
                                    else
                                        renameInfo["merge"] = true;
                                    self.renameImpl(renameInfo);
                                }
                            },
                            self
                        );
                    } else {
                        showError(data.message);
                    }
                    return;
                }
                if (data.warning === true) {
                    config.showRefreshWarning();
                }
            });
        },
        renameSelectedItem: function () {
            var selectedRecord = config.getGrid().getSelectionModel().getSelected();
            if (!selectedRecord) {
                return;
            }
            var rowIndex = config.getGrid().getStore().indexOf(selectedRecord);
            if (config.getCurrentGridView() === 'thumbnails') {
                var msgp = config.Msg.prompt(config.htcConfig.locData.CommandRename, "", function (btn, text) {
                    if (btn == 'ok') {
                        if (selectedRecord.data.rowtype === 'file' && !config.isExtensionAllowed(text, false)) {
                            showError(config.getRestrictionMessage(false));
                            return;
                        }
                        var renameInfo = {};
                        renameInfo["path"] = config.getCurrentFolder();
                        renameInfo["name"] = selectedRecord.data.name;
                        renameInfo["type"] = selectedRecord.data.rowtype;
                        renameInfo["newName"] = text;
                        if (config.getAsControl())
                            renameInfo["control"] = true;
                        self.renameImpl(renameInfo);
                    }
                }, self, false, selectedRecord.data.name);
                if (msgp) {
                    var dlg = msgp.getDialog(), inpts, edt;
                    if (dlg && (inpts = dlg.el.dom.getElementsByTagName('input'))) {
                        if (inpts.length > 0 && (edt = inpts[0]) && edt.value) {
                            var isFile = selectedRecord.data.rowtype === 'file',
                                val = String(edt.value),
                                end = isFile ? val.lastIndexOf('.') : val.length;
                            if (end < 0)
                                end = val.length;
                            if (edt.createTextRange) {
                                var selRange = edt.createTextRange();
                                selRange.collapse(true);
                                selRange.moveStart('character', 0);
                                selRange.moveEnd('character', end);
                                selRange.select();
                                edt.focus();
                            } else if (edt.setSelectionRange) {
                                edt.focus();
                                edt.setSelectionRange(0, end);
                            } else if (typeof edt.selectionStart != 'undefined') {
                                edt.selectionStart = 0;
                                edt.selectionEnd = end;
                                edt.focus();
                            }
                        }
                    }
                }
            } else {
                config.setAllowEdit(true);
                config.getGrid().startEditing(rowIndex, 0);
                config.setAllowEdit(false);
            }
        },
        addWatch: function () {
            var item = self.getSelectedSingleFileOrFolder();
            if (!item.is_folder) {
                config.initAndShowWatchModifsWindow(item);
            } else {
                config.Msg.show({
                    title: config.htcConfig.locData.CommonConfirmCaption,
                    msg: Ext.util.Format.htmlEncode(config.htcConfig.locData.WatchForModifsNestedItemsWarning),
                    buttons: config.Msg.OKCANCEL,
                    icon: config.Msg.WARNING,
                    fn: function (result) {
                        if (result == "ok") {
                            config.initAndShowWatchModifsWindow(item);
                        }
                    }
                });
            }
        },
        editWatch: function (pInfo, viewWindow) {
            if (!Ext.isObject(pInfo)) {
                pInfo = self.getSelectedSingleFileOrFolder();
            }
            if (Ext.isObject(pInfo) && !Ext.isEmpty(pInfo.path) && Ext.isNumber(pInfo.id)) {
                config.initAndShowWatchModifsWindow(pInfo, viewWindow);
                return;
            }
        },
        stopWatch: function (pathInfo, wWindow) {
            var pInfo = Ext.isObject(pathInfo) ? pathInfo : self.getSelectedSingleFileOrFolder();
            if (!pInfo || Ext.isEmpty(pInfo.path)) {
                return;
            }
            config.globalLoadMask.msg = config.htcConfig.locData.WatchForModifsStopProgressLoading + "...";
            config.globalLoadMask.show();
            HttpCommander.Common.StopWatch(pInfo, function (data, trans) {
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                        data, trans, config.Msg, config.htcConfig)) {
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
                        config.htcConfig.locData.WatchForModifsStopSuccessMessage,
                            pInfo.path)));
                    if (wWindow && Ext.isFunction(wWindow.hide)) {
                        wWindow.hide();
                    }
                }
            });
        },
        viewWatch: function (rowIndex) {
            var pInfo = self.getSelectedSingleFileOrFolder(rowIndex);
            if (!pInfo || Ext.isEmpty(pInfo.path)) {
                return;
            }
            config.initAndShowChangesWatchWindow(pInfo);
        },
        // Restore trashed items (selected or all if forceAll == true)
        restoreTrashedItemsImpl: function (selectedSet) {
            var oldAT = Ext.Ajax.timeout;
            Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
            config.globalLoadMask.msg = config.htcConfig.locData.TrashProgressRestoring + "...";
            config.globalLoadMask.show();
            HttpCommander.Common.RestoreFromTrash(selectedSet, function (data, trans) {
                Ext.Ajax.timeout = oldAT;
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, config.Msg, config.htcConfig);
                if (data && data.restored > 0) {
                    config.showBalloon(String.format(config.htcConfig.locData.TrashBalloonRestored,
                        data.restored, data.total >= data.restored ? data.total : data.restored));
                }
                config.openTrash();
            });
        },
        restoreTrashedItems: function (forceAll) {
            var curFolder = config.getCurrentFolder();
            if (!config.htcConfig.enableTrash || !config.isTrashFolder(curFolder)) {
                return;
            }
            var selectedSet = {
                names: []
            };
            if (forceAll === true) {
                selectedSet.names = null;
                config.Msg.show({
                    title: config.htcConfig.locData.CommonConfirmCaption,
                    msg: config.htcConfig.locData.TrashRestoreAllPrompt,
                    buttons: config.Msg.YESNO,
                    icon: config.Msg.QUESTION,
                    fn: function (result) {
                        if (result == "yes") {
                            self.restoreTrashedItemsImpl(selectedSet);
                        }
                    }
                });
            } else {
                var selectedRecords = config.getGrid().getSelectionModel().getSelections();
                Ext.each(selectedRecords, function (el) {
                    var unqName = el.data.trashname;
                    if (!Ext.isEmpty(unqName)) {
                        selectedSet.names.push(unqName);
                    }
                });
                self.restoreTrashedItemsImpl(selectedSet);
            }
        },
        // Delete selected shared links
        deleteSelectedAnonymLinks: function (sharedGrid) {
            if (!sharedGrid) {
                return;
            }
            var selectedRecords = sharedGrid.getSelectionModel().getSelections(),
                ids = [];
            Ext.each(selectedRecords, function (el) {
                var id = el.data.id;
                if (Ext.isNumber(id) && id > 0) {
                    ids.push(id);
                }
            });
            if (ids.length == 0) {
                return;
            }
            config.Msg.confirm(
                config.htcConfig.locData.PublicLinksDeleteWindowTitle,
                config.htcConfig.locData.PublicLinksDeleteConfirmMsg,
                function (cnfrmBtn) {
                    if (cnfrmBtn == 'yes') {
                        config.globalLoadMask.msg = config.htcConfig.locData.ProgressDeletingAnonymousLink + "...";
                        config.globalLoadMask.show();
                        HttpCommander.Common.RemoveAnonymLinks({ ids: ids }, function (data, trans) {
                            config.globalLoadMask.hide();
                            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                            if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                                        data, trans, config.Msg, config.htcConfig)) {
                                config.openSharedByLink();
                            }
                        });
                    }
                    config.Msg.hide();
                }
            );
        },
        // Delete selected items
        deleteSelectedItems: function (forceClearTrash, draggedSet) {
            var curFolder = config.getCurrentFolder();
            var moveDraggedToTrash = false;
            if (Ext.isObject(draggedSet)) {
                if (!config.htcConfig.enableTrash) {
                    return;
                } else {
                    moveDraggedToTrash = true;
                    curFolder = draggedSet.path;
                    forceClearTrash = false;
                }
            }
            var selectedSet = Ext.isObject(draggedSet) ? draggedSet : config.createSelectedSet(config.getGrid(), curFolder, forceClearTrash);
            if (selectedSet.filesCount == 0 && selectedSet.foldersCount == 0) {
                return;
            }
            var isRcntFolder = !moveDraggedToTrash && config.isRecentFolder(curFolder);
            var isTrhFolder = !moveDraggedToTrash && config.isTrashFolder(curFolder);
            var message, itemName;
            if (selectedSet.filesCount == 0 && selectedSet.foldersCount == 1) {
                itemName = selectedSet.folders[0];
            }
            if (selectedSet.foldersCount == 0 && selectedSet.filesCount == 1) {
                itemName = selectedSet.files[0];
            }
            if (!Ext.isEmpty(itemName) && (isRcntFolder || isTrhFolder)) {
                var itemNameParts = itemName.split('/');
                itemName = itemNameParts[itemNameParts.length - 1];
            }
            if (forceClearTrash) {
                message = config.htcConfig.locData.TrashEmptyTrashPrompt;
            } else if (!Ext.isEmpty(itemName)) {
                if (isTrhFolder) {
                    itemName = config.getGrid().getSelectionModel().getSelected().get('name');
                }
                message = String.format(config.htcConfig.locData[isRcntFolder ? 'RecentDeleteOnePrompt' : isTrhFolder ? 'TrashDeleteOnePrompt' : 'CommonDeleteOnePrompt'],
                    Ext.util.Format.htmlEncode(itemName));
            } else {
                message = String.format(config.htcConfig.locData[isRcntFolder ? 'RecentDeleteManyPrompt' : isTrhFolder ? 'TrashDeleteManyPrompt' : 'CommonDeleteManyPrompt'],
                    selectedSet.filesCount + selectedSet.foldersCount
                );
            }
            var cbId = null
            if (!isRcntFolder && !isTrhFolder && config.htcConfig.enableTrash &&
                Ext.isNumber(config.htcConfig.deleteDirectly) && config.htcConfig.deleteDirectly < 2) {
                message += '<br/><br/><input type="checkbox" autocomplete="off" id="'
                    + (cbId = Ext.id()) + '" name="' + cbId + '" class=" x-form-checkbox x-form-field" style="vertical-align:middle;"'
                    + (config.htcConfig.deleteDirectly === 1 ? (' checked="checked"') : '')
                    + ' />&nbsp;'
                    + config.htcConfig.locData.TrashDeleteDirectlyLabel;
            }
            if (config.getAsControl()) {
                selectedSet["control"] = true;
            }
            config.Msg.show({
                title: config.htcConfig.locData.CommonConfirmCaption,
                msg: message,
                buttons: config.Msg.YESNO,
                icon: config.Msg.QUESTION,
                fn: function (result) {
                    if (result == "yes") {
                        if (cbId) {
                            var cb = Ext.get(cbId);
                            if (cb && cb.dom) {
                                selectedSet.dd = (cb.dom.checked === true);
                            }
                        }
                        var oldAT = Ext.Ajax.timeout;
                        Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
                        config.globalLoadMask.msg = config.htcConfig.locData.ProgressDeleting + "...";
                        config.globalLoadMask.show();
                        HttpCommander.Common.Delete(selectedSet, function (data, trans) {
                            Ext.Ajax.timeout = oldAT;
                            config.globalLoadMask.hide();
                            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                            if (typeof data == 'undefined') {
                                showError(Ext.util.Format.htmlEncode(trans.message));
                                return;
                            }
                            var tip = '';
                            if (data.filesDeleted > 0)
                                tip += String.format(config.htcConfig.locData.BalloonFilesDeleted,
                                    data.filesDeleted
                                );
                            if (data.foldersDeleted > 0) {
                                if (tip != '')
                                    tip += '<br />';
                                tip += String.format(config.htcConfig.locData.BalloonFoldersDeleted,
                                    data.foldersDeleted
                                );
                            }
                            var filesFailed = selectedSet.filesCount - data.filesDeleted;
                            if (filesFailed > 0) {
                                if (tip != '')
                                    tip += '<br />';
                                tip += String.format(config.htcConfig.locData.BalloonFilesFailed,
                                    filesFailed
                                );
                            }
                            var foldersFailed = selectedSet.foldersCount - data.foldersDeleted;
                            if (foldersFailed > 0) {
                                if (tip != '')
                                    tip += '<br />';
                                tip += String.format(config.htcConfig.locData.BalloonFoldersFailed,
                                    foldersFailed
                                );
                            }

                            if (data.status != "success") {
                                showError(data.message);
                            }

                            if (!Ext.isEmpty(tip)) {
                                config.showBalloon(tip);
                            }

                            if (data.warning === true) {
                                config.showRefreshWarning();
                            } else if (data.foldersDeleted > 0 || isRcntFolder || isTrhFolder || forceClearTrash) {
                                if (forceClearTrash) {
                                    if (data.foldersDeleted > 0) {
                                        config.reloadTreeNodeIfOpened(curFolder);
                                    }
                                    config.openTrash();
                                } else {
                                    config.openGridFolder(curFolder, true, true, false, true);
                                }
                            } else {
                                config.openGridFolder(curFolder, false, false, false, true);
                            }
                        });
                    }
                }
            });
        },
        // View and change details
        viewChangeDetails: function (initMetadata, index, comments) {
            var detailsPane = config.getDetailsPane();
            var clickOnComments = (comments === true) && !!detailsPane;
            if (clickOnComments) {
                if (detailsPane.collapsed) {
                    detailsPane.expand();
                }
                detailsPane.setActiveTab('cmt-tab');
                return;
            }
            var resInfo = { path: '', name: '' };
            var curFolder = config.getCurrentFolder();
            var selModel = config.getGrid().getSelectionModel();
            if (typeof index != 'undefined') {
                try {
                    var record = config.getGrid().getStore().getAt(index);
                    if (record) {
                        resInfo.path = curFolder;
                        resInfo.name = selectedRecord.data.name;
                    }
                } catch (e) {
                    // ignore
                }
            }
            if ((resInfo.path == '' || resInfo.name == '') && selModel.getCount() == 1) {
                var selectedRecord = config.getGrid().getSelectionModel().getSelected();
                if (selectedRecord) {
                    resInfo.path = curFolder;
                    resInfo.name = selectedRecord.data.name;
                }
            }
            if (resInfo.path == '' || resInfo.name == '') {
                return;
            }
            config.globalLoadMask.msg = config.htcConfig.locData.LoadingDetailsMask + "...";
            config.globalLoadMask.show();
            HttpCommander.Metadata.Load(resInfo, function (mdata, trans) {
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                        mdata, trans, config.Msg, config.htcConfig, 2)) {
                    var metadataWindow = initMetadata();
                    if (metadataWindow) {
                        metadataWindow.initialize(resInfo, mdata);
                        metadataWindow.show();
                        metadataWindow.syncSizeWrap();
                    }
                    if (!Ext.isEmpty(mdata.metaerror)) {
                        showError(mdata.metaerror);
                    }
                }
            });
        },
        // Download selected items
        downloadSelectedItems: function () {
            var curFolder = config.getCurrentFolder();
            var selModel = config.getGrid().getSelectionModel();
            if (!selModel || selModel.getCount() == 0) {
                return;
            }
            if (selModel.getCount() == 1 && selModel.getSelected().data.rowtype == "file") {
                var selectedRecord = config.getGrid().getSelectionModel().getSelected();
                config.downloadFile(selectedRecord, curFolder);
            } else if (config.initDownload()) {
                config.getDownloadWindow().hide();
                var selectedSet = config.createSelectedSet(config.getGrid(), config.getCurrentFolder());
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressPrepareDownload + "...";
                config.globalLoadMask.show();
                HttpCommander.Common.Download(selectedSet, function (data, trans) {
                    config.globalLoadMask.hide();
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                    if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, config.Msg, config.htcConfig)) {
                        config.getDownloadWindow().show();
                    }
                });
            }
        },
        // View file in specified service (Google, OWA, Box, ShareCad, ...)
        // or edit file in specified service (ZohoEdit, PixlrEdit, ...)
        viewInService: function (service, create) {
            var self = this, svc = Ext.isEmpty(service) ? '' : String(service).toLowerCase(),
                curFolder = config.getCurrentFolder(),
                path = encodeURIComponent((svc == 'pixlr' && create) ? curFolder : self.getSelectedFilePath()),
                filename = (svc == 'pixlr' && create) ? null : self.getSelectedFileName(),
                newAdobeExt = null, adbId = Ext.id();
            if (Ext.isEmpty(path) || Ext.isEmpty(curFolder)) {
                return;
            }
            if (!Ext.isFunction(window.handleViewerError)) {
                window.handleViewerError = function (error) {
                    if (!Ext.isEmpty(error)) {
                        self.showViewerError = true;
                        config.Msg.hide();
                        config.Msg.show({
                            title: config.htcConfig.locData.CommonErrorCaption,
                            msg: error,
                            icon: config.Msg.ERROR,
                            buttons: config.Msg.CANCEL
                        });
                    }
                }
            }

            if (svc == 'adobe') {
                var fExt = HttpCommander.Lib.Utils.getFileExtension(filename);
                if (';jpg;jpeg;jpe;jfif;png;'.indexOf(';' + fExt.toLowerCase() + ';') < 0) {
                    if (fExt.length > 0) {
                        filename = filename.substring(0, filename.length - fExt.length) + 'png';
                    } else {
                        filename += '.png';
                    }
                    newAdobeExt = '<span style="font-weight:bold;">PNG</span>';
                }
                if (!Ext.isArray(window['adobeEditedImages'])) {
                    window['adobeEditedImages'] = [];
                }
                window['adobeEditedImages'].push({
                    id: adbId,
                    filename: filename,
                    path: curFolder,
                    newAdobeExt: newAdobeExt
                });
                if (!Ext.isFunction(window.adobeImageSaved)) {
                    window.adobeImageSaved = function (adobeId) {
                        config.Msg.hide();
                        self.showViewerError = false;
                        var fName = null, fPath = null, fExt = null;
                        if (!Ext.isEmpty(adobeId) && Ext.isArray(window['adobeEditedImages'])) {
                            var j = 0, ln = window['adobeEditedImages'].length;
                            for (; j < ln; j++) {
                                var ei = window['adobeEditedImages'][j];
                                if (ei && !Ext.isEmpty(ei.id) && ei.id === adobeId) {
                                    fName = ei.filename;
                                    fPath = ei.path;
                                    fExt = ei.newAdobeExt;
                                    break;
                                }
                            }
                        }
                        if (!Ext.isEmpty(fName) && !Ext.isEmpty(fPath)) {
                            config.setSelectPath({
                                name: fName,
                                path: fPath
                            });
                        }
                        if (!Ext.isEmpty(fPath)) {
                            config.openGridFolder(fPath);
                        }
                        if (!Ext.isEmpty(fExt)) {
                            setTimeout(function () {
                                config.Msg.show({
                                    title: config.htcConfig.locData.CommandEditInAdobe,
                                    msg: String.format(Ext.util.Format.htmlEncode(config.htcConfig.locData.AdobeImageEditorSavedAsNewTypeMessage), fExt),
                                    icon: config.Msg.INFO,
                                    buttons: config.Msg.OK
                                });
                            }, 200);
                        }
                    };
                }
            }

            self.showViewerError = false;
            var popupV = window.open(config.htcConfig.relativePath
                    + 'Handlers/Viewer.aspx?path=' + path + '&svc=' + encodeURIComponent(svc)
                    + (svc == 'pixlr' && create ? ('&new=') : (svc == 'adobe' ? ('&adbid=' + encodeURIComponent(adbId)) : '')),
                'viewerpopup' + (new Date()).getTime(),
                HttpCommander.Lib.Utils.getPopupProps());
            if (popupV) {
                try { popupV.focus(); }
                catch (e) { }
            }
            var refreshRecent = !(svc == 'pixlr' && create);
            var pvInterval = window.setInterval(function () {
                try {
                    if (refreshRecent) {
                        refreshRecent = false;
                        config.openTreeRecent();
                    }
                    if (popupV == null || popupV.closed) {
                        window.clearInterval(pvInterval);
                        if ((svc == 'zoho' || svc == 'pixlr' || svc == 'adobe') && !self.showViewerError) {
                            if (svc == 'adobe') {
                                if (!Ext.isEmpty(adbId) && Ext.isArray(window['adobeEditedImages'])) {
                                    var j = 0, ln = window['adobeEditedImages'].length, aIdx = -1;
                                    for (; j < ln; j++) {
                                        var ei = window['adobeEditedImages'][j];
                                        if (ei && !Ext.isEmpty(ei.id) && ei.id === adbId) {
                                            aIdx = j;
                                            break;
                                        }
                                    }
                                }
                                if (aIdx >= 0) {
                                    window['adobeEditedImages'].splice(aIdx, 1);
                                }
                            }
                            config.Msg.hide();
                            self.showViewerError = false;
                            if (!Ext.isEmpty(filename) && !Ext.isEmpty(curFolder)) {
                                config.setSelectPath({
                                    name: filename,
                                    path: curFolder
                                });
                            }
                            config.openGridFolder(curFolder);
                        }
                    }
                } catch (e) {
                    window.clearInterval(pvInterval);
                    self.showViewerError = false;
                }
            }, 1000);
        },
        // View in Autodesk
        viewInAutodeskImpl: function (fileInfo) {
            var pervAjaxTimeout = Ext.Ajax.timeout;
            Ext.Ajax.timeout = 10 * 180 * 1000;
            HttpCommander.Common.AutodeskViewInfo(fileInfo, function (data, trans) {
                Ext.Ajax.timeout = pervAjaxTimeout;
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                if (!HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, config.Msg, config.htcConfig))
                    return;

                if (!Ext.isObject(data.view) || !Ext.isObject(data.token))
                    return;

                config.openTreeRecent();

                var urn = data.view.URN;
                var tkn = data.token.access_token;
                var fileName = HttpCommander.Lib.Utils.getFileName(fileInfo.path);
                var wnd;

                var handleAutodeskError = function (code, message, errors) { // onErrorCallback
                    if (!!wnd) {
                        wnd.hide();
                    }
                    var msg = '';
                    if (!Ext.isEmpty(message)) {
                        msg = Ext.util.Format.htmlEncode(message);
                    }
                    if (!Ext.isEmpty(code)) {
                        if (msg.length > 0) {
                            msg += ' (error code: ' + code + ')';
                        } else {
                            msg += 'Error code: ' + code;
                        }
                    }
                    if (Ext.isArray(errors)) {
                        Ext.each(errors, function (error) {
                            if (Ext.isObject(error)) {
                                var innerMsg = '' + Ext.util.Format.htmlEncode(error.code || '');
                                if (!Ext.isEmpty(error.message)) {
                                    if (innerMsg.length > 0) {
                                        innerMsg += '<br />'
                                    }
                                    innerMsg += Ext.util.Format.htmlEncode(error.message);
                                }
                                if (!Ext.isEmpty(innerMsg)) {
                                    if (msg.length > 0) {
                                        msg += '<br /><br />';
                                    }
                                    msg += innerMsg;
                                }
                            }
                        });
                    }
                    if (Ext.isEmpty(msg)) {
                        msg = 'Unknown error';
                    }
                    showError(msg);
                };

                wnd = new config.Window({
                    title: Ext.util.Format.htmlEncode(fileName),
                    closeAction: 'close',
                    height: 480,
                    width: 640,
                    modal: true,
                    plain: true,
                    padding: 0,
                    maximizable: true,
                    closable: true,
                    resizable: true,
                    minimizable: false,
                    listeners: {
                        show: function (wnd) {
                            if (config.getView())
                                wnd.setSize(
                                    Math.floor(config.getView().getWidth() * 0.85),
                                    Math.floor(config.getView().getHeight() * 0.8)
                                );
                            wnd.center();
                        },
                        resize: function (wnd, w, h) {
                            if (Ext.isObject(wnd.viewer) && Ext.isFunction(wnd.viewer.resize)) {
                                try {
                                    wnd.viewer.resize();
                                } catch (e) { /* ignore */ }
                            }
                        },
                        beforehide: function (wnd) {
                            if (!wnd.beforeHideInvoked) {
                                if (Ext.isObject(wnd.viewer) && Ext.isFunction(wnd.viewer.uninitialize)) {
                                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressUninitializeAutodeskViewer + "...";
                                    config.globalLoadMask.show();
                                    wnd.beforeHideInvoked = true;
                                    setTimeout(function () {
                                        try {
                                            wnd.viewer.uninitialize();
                                        } catch (e) { /* ignore */ }
                                        config.globalLoadMask.hide();
                                        config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                                        wnd.beforeHideInvoked = true;
                                        wnd.hide();
                                    }, 10);
                                    return false;
                                }
                            }
                        },
                        afterrender: function (wnd) {
                            var viewerElement = wnd.body.dom;
                            var options = {
                                'document': 'urn:' + urn,
                                'env': 'AutodeskProduction',
                                'getAccessToken': function () { return tkn; },
                                'refreshToken': function () { return tkn; }
                            };
                            var viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerElement, {});
                            Autodesk.Viewing.Initializer(options, function () {
                                viewer.initialize();
                                wnd.viewer = viewer;
                                Autodesk.Viewing.Document.load(options.document, function (doc) { // onLoadCallback
                                    var rootItem = doc.getRootItem();
                                    var geometryItems = [];
                                    // check 3d first
                                    geometryItems = Autodesk.Viewing.Document.getSubItemsWithProperties(rootItem, {
                                        'type': 'geometry',
                                        'role': '3d'
                                    }, true);
                                    // no 3d geometry, check 2d
                                    if (geometryItems.length == 0) {
                                        geometryItems = Autodesk.Viewing.Document.getSubItemsWithProperties(rootItem, {
                                            'type': 'geometry',
                                            'role': '2d'
                                        }, true);
                                    }
                                    // load the first geometry
                                    if (geometryItems.length > 0) {
                                        viewer.load(doc.getViewablePath(geometryItems[0]),
                                            null, // sharedPropertyDbPath
                                            function () { }, // onSuccessCallback
                                            function (errorMsg) {  // onErrorCallback
                                                handleAutodeskError(code, message, errors);
                                            }
                                        );
                                    }
                                }, function (code, message, errors) { // onErrorCallback
                                    handleAutodeskError(code, message, errors);
                                });
                            });
                        }
                    }
                });
                wnd.show();
            });
        },
        viewInAutodesk: function () {
            var self = this;
            var fileInfo = {
                path: this.getSelectedFilePath()
            };
            if (fileInfo.path == '')
                return;

            var ext = HttpCommander.Lib.Utils.getFileExtension(fileInfo.path);

            if (!config.htcConfig.enableAutodeskViewer || HttpCommander.Lib.Consts.autodeskViewerFileTypes.indexOf(';' + ext + ';') == -1)
                return;

            config.globalLoadMask.msg = config.htcConfig.locData.ProgressGettingAutodeskViewLink + "...";
            config.globalLoadMask.show();

            if (!Ext.isObject(window.Autodesk)) { // try to include css and js Autodesk fiels
                try {
                    var baseUrl = config.htcConfig.autodeskServiceUrl + 'viewingservice/v1/viewers/';
                    HttpCommander.Lib.Utils.includeCssFile({
                        id: 'autodeskCss',
                        url: baseUrl + 'style.css'
                    });
                    HttpCommander.Lib.Utils.includeJsFile({
                        url: baseUrl + 'three.min.js', // IMPORTANT! First include three.min.js, after - viewer3D.min.js
                        callback: function () {
                            HttpCommander.Lib.Utils.includeJsFile({
                                url: baseUrl + 'viewer3D.min.js',
                                callback: function () {
                                    if (!Ext.isObject(window.Autodesk)) {
                                        config.globalLoadMask.hide();
                                        config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                                        showError(Ext.util.Format.htmlEncode(config.htcConfig.locData.AutodeskScriptNotIncludedMessage));
                                    } else {
                                        self.viewInAutodeskImpl(fileInfo);
                                    }
                                }
                            });
                        }
                    });
                } catch (e) {
                    showError(e && !Ext.isEmpty(e.message)
                        ? Ext.util.Format.htmlEncode(e.message)
                        : Ext.util.Format.htmlEncode(config.htcConfig.locData.AutodeskScriptNotIncludedMessage));
                }
            } else {
                self.viewInAutodeskImpl(fileInfo);
            }
        },
        getSelectedSingleFileOrFolder: function (rowIndex) {
            var curFolder = config.getCurrentFolder(),
                selModel = config.getGrid().getSelectionModel(),
                sel, path, pInfo = null;
            if (Ext.isNumber(rowIndex)) {
                sel = config.getGrid().getStore().getAt(rowIndex);
                if (sel) {
                    sel = sel.data;
                }
            } else if (selModel.getCount() == 1) {
                sel = selModel.getSelected().data;
            }
            if (sel && (sel.rowtype == 'file' || sel.rowtype == 'folder'
                || sel.rowtype == 'rootfolder' || sel.rowtype == 'uplink')) {
                if (Ext.isEmpty(sel.srowtype)) {
                    if (Ext.isEmpty(curFolder) || curFolder.toLowerCase() == 'root') {
                        path = sel.name;
                    } else if (sel.rowtype == 'uplink') {
                        path = curFolder;
                    } else {
                        path = curFolder + '/' + sel.name;
                    }
                } else if (sel.srowtype == 'alert') {
                    path = sel.name;
                }
                if (Ext.isEmpty(path)) {
                    return null;
                }
                pInfo = {
                    path: path,
                    is_folder: (sel.rowtype != 'file')
                };
                if (Ext.isObject(sel.watchForModifs) && Ext.isNumber(sel.watchForModifs.id)) {
                    pInfo.id = sel.watchForModifs.id;
                    pInfo.emails = sel.watchForModifs.emails;
                    pInfo.iown = (sel.watchForModifs.iown === true);
                    pInfo.users = sel.watchForModifs.users;
                    pInfo.actions = sel.watchForModifs.actions;
                } else if (Ext.isNumber(sel.watchForModifs) && sel.watchForModifs > 0) {
                    pInfo.parentId = sel.watchForModifs;
                }
            }
            return pInfo;
        },
        // return virtual path of the selected file
        // If multiple items are selected or the selected item is not a file, return "".
        getSelectedFilePath: function () {
            var curFolder = config.getCurrentFolder();
            if (curFolder == "")
                return "";
            var selModel = config.getGrid().getSelectionModel();
            if (selModel.getCount() == 1 && selModel.getSelected().data.rowtype == "file") {
                var selectedRecord = selModel.getSelected();
                var name = selectedRecord.data.name;
                if (name == "")
                    return "";
                return curFolder + "/" + name;
            }
            return "";
        },
        getSelectedFileName: function () {
            var selModel = config.getGrid().getSelectionModel();
            if (selModel && selModel.getCount() == 1 && selModel.getSelected().data.rowtype == "file") {
                var selectedRecord = selModel.getSelected();
                var name = selectedRecord.data.name;
                if (!Ext.isEmpty(name))
                    return name;
            }
            return null;
        },
        editInMsoOoo: function (isMsOffice, _openFile) {
            var fileVirtualPath = this.getSelectedFilePath();
            if (fileVirtualPath == '')
                return;

            var urlPrefix = (config.htcConfig.domainNameUrl != ''
                ? config.htcConfig.domainNameUrl
                : config.getAppRootUrl())
                + config.htcConfig.identifierWebDav;
            var mode = isMsOffice ? 2 : 3;
            if (mode == 2 && config.htcConfig.useSSLForMSOffice && urlPrefix.match(/^http:/i)) {
                urlPrefix = "https:" + urlPrefix.substr(5);
            }
            if (!config.htcConfig.anonymousEditingOffice) {
                HttpCommander.Common.AddToRecent({
                    path: fileVirtualPath,
                    action: 'Edit'
                }, function (data, trans) {
                    if (!Ext.isEmpty(data) && data.success) {
                        config.openTreeRecent();
                    }
                });
                _openFile(urlPrefix + "/" + (config.htcConfig.anonymousEditingOffice
                    ? (config.htcConfig.webDavDefaultSuffix + "/") : "") + fileVirtualPath, mode);
                return;
            }
            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoadingEditInOffice + "...";
            config.globalLoadMask.show();
            var i = fileVirtualPath.indexOf("/");
            if (i < 0) {
                config.globalLoadMask.hide();
                return;
            }
            var rootFolder = fileVirtualPath.substr(0, i);
            var fileAnonVirtualPath = fileVirtualPath.substr(i + 1);
            var fileInfo = {
                fullVirtualPath: fileVirtualPath,
                path: rootFolder,
                service: isMsOffice ? 'MSOEdit' : 'OOOEdit',
                acl: {
                    down: true,
                    up: true,
                    view: true,
                    zip: false,
                    overwrite: true
                }
            };
            HttpCommander.Common.AnonymLink(fileInfo, function (data, trans) {
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                if (!HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, config.Msg, config.htcConfig))
                    return;
                var fileKey = data.link_key;
                if (!Ext.isEmpty(fileKey)) {
                    config.openTreeRecent();
                    _openFile(urlPrefix + "/" + config.htcConfig.webDavAnonymousSuffix + "/" + fileKey + "/" + fileAnonVirtualPath, mode);
                } else {
                    showError(config.htcConfig.locData.OfficeAnonymousEditPublicLinkError);
                    return;
                }
            });
        },
        shareFolder: function (virtualFilePath, prepareAndShowMakePublicLinkWindow) {
            var selectedRecord = config.getGrid().getSelectionModel().getSelected();
            var virtPath = virtualFilePath(selectedRecord, config.getCurrentFolder());
            var isFolder = selectedRecord ? selectedRecord.data.rowtype == 'folder' : true;
            var anonPerm = {
                download: {},
                upload: { checked: isFolder && (config.htcConfig.currentPerms && config.htcConfig.currentPerms.upload && config.htcConfig.currentPerms.anonymUpload) },
                view: { checked: isFolder && (config.htcConfig.currentPerms && (config.htcConfig.currentPerms.listFiles || config.htcConfig.currentPerms.listFolders) && config.htcConfig.currentPerms.anonymViewContent) },
                zip: { checked: isFolder ? (config.htcConfig.currentPerms && config.htcConfig.currentPerms.zipDownload && config.htcConfig.currentPerms.anonymDownload) : false }
            };
            anonPerm.download["checked"] = isFolder ? (anonPerm.view.checked && config.htcConfig.currentPerms && config.htcConfig.currentPerms.download && config.htcConfig.currentPerms.anonymDownload) : true;
            anonPerm.download["disabled"] = !isFolder || !anonPerm.download.checked;
            anonPerm.upload["disabled"] = !isFolder || !anonPerm.upload.checked;
            anonPerm.view["disabled"] = !isFolder || !anonPerm.view.checked;
            anonPerm.zip["disabled"] = !isFolder || !anonPerm.zip.checked;
            anonPerm.modify = config.htcConfig.currentPerms && config.htcConfig.currentPerms.modify;
            anonPerm.upload.checked = false;
            prepareAndShowMakePublicLinkWindow(virtPath, isFolder, anonPerm);
        },
        webFolders: function (prepareAndShowlinksToWebFoldersWindow) {
            var curFolder = config.getCurrentFolder();
            var selectedRecord = config.getGrid().getSelectionModel().getSelected();
            var urlRoot =
                (
                    config.htcConfig.domainNameUrl != ''
                    ? config.htcConfig.domainNameUrl
                    : config.getAppRootUrl()
                )
                + config.htcConfig.identifierWebDav + "/"
                + (config.htcConfig.anonymousEditingOffice ? (config.htcConfig.webDavDefaultSuffix + "/") : "");
            var urlParent = curFolder.toLowerCase() === 'root' ?
                ((selectedRecord && selectedRecord.data.rowtype == 'rootfolder') ?
                selectedRecord.data.name : '') : curFolder;
            var urlCurrent = '';
            if (selectedRecord && selectedRecord.data.rowtype == 'folder')
                urlCurrent = selectedRecord.data.name;
            prepareAndShowlinksToWebFoldersWindow(urlRoot, urlParent, urlCurrent);
        },
        syncWebFolders: function (initAndShowSyncWebFoldersHelpWindow) {
            var curFolder = config.getCurrentFolder();
            var selectedRecord = config.getGrid().getSelectionModel().getSelected();
            var urlRoot = (config.htcConfig.domainNameUrl != '' ? config.htcConfig.domainNameUrl : config.getAppRootUrl())
                + config.htcConfig.identifierWebDav + "/"
                + (config.htcConfig.anonymousEditingOffice ? (config.htcConfig.webDavDefaultSuffix + "/") : "");
            var urlParent = curFolder.toLowerCase() === 'root' ?
                ((selectedRecord && selectedRecord.data.rowtype == 'rootfolder') ?
                selectedRecord.data.name : '') : curFolder;
            var urlCurrent = '';
            if (selectedRecord && selectedRecord.data.rowtype == 'folder')
                urlCurrent = selectedRecord.data.name;
            initAndShowSyncWebFoldersHelpWindow(urlRoot, urlParent, urlCurrent);
        },
        newItemFromTemplate: function (item) {
            if (item.itemId && item.itemId != '' && item.itemFileName && item.text) {
                var type = item.itemId.substring(4);
                var caption = String.format(config.htcConfig.locData.CommonFileTypeNameCaption, item.text);
                createAndShowConfirmForNewInCloud({
                    title: caption,
                    prompt: caption,
                    newName: item.itemFileName,
                    callback: function (text, confirmWindow) {
                        var curFolder = config.getCurrentFolder();
                        if (!config.isExtensionAllowed(text)) {
                            showError(config.getRestrictionMessage());
                            return;
                        }
                        var createInfo = {};
                        createInfo["path"] = curFolder;
                        createInfo["type"] = type;
                        createInfo["newName"] = text;
                        createInfo["tmpName"] = item.itemFileName;
                        if (confirmWindow && Ext.isFunction(confirmWindow.hide)) {
                            confirmWindow.hide();
                        }
                        self.createNewItemImpl(createInfo);
                    }
                });
            }
        },
        versionHistory: function (fileInfo, versionHistoryWindow) {
            if (!versionHistoryWindow)
                return;
            versionHistoryWindow.hide();
            config.globalLoadMask.msg = config.htcConfig.locData.VersionHistoryObtainingMessage + "...";
            config.globalLoadMask.show();
            HttpCommander.Common.GetVersionHistory(fileInfo, function (data, trans) {
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                        data, trans, config.Msg, config.htcConfig)) {
                    if (!data.vhist || data.vhist.length < 1) {
                        showError(config.htcConfig.locData.NoVersionHistoryMessage);
                        return;
                    }
                    versionHistoryWindow.initialize(
                        String.format(config.htcConfig.locData.VersionHistoryTitle,
                            Ext.util.Format.htmlEncode(fileInfo.name)),
                        data.isUSA,
                        data.vhist,
                        fileInfo.path,
                        fileInfo.name
                    );
                    versionHistoryWindow.show();
                }
            });
        },
        checkOut: function (fileInfo) {
            config.globalLoadMask.msg = config.htcConfig.locData.CheckingOutMessage + "...";
            config.globalLoadMask.show();
            HttpCommander.Common.CheckOut(fileInfo, function (data, trans) {
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                if (!HttpCommander.Lib.Utils.checkDirectHandlerResult(
                            data, trans, config.Msg, config.htcConfig)) {
                    if (typeof data != 'undefined') {
                        config.openGridFolder(fileInfo.path);
                    }
                } else {
                    config.showBalloon(String.format(config.htcConfig.locData.SuccessfullyCheckedOutMessage,
                        Ext.util.Format.htmlEncode(fileInfo.name),
                        Ext.util.Format.htmlEncode(config.htcConfig.currentUser))
                    );
                    config.openGridFolder(fileInfo.path);
                }
            });
        },
        undoCheckOut: function (fileInfo) {
            config.Msg.confirm(
                config.htcConfig.locData.CommandUndoCheckOut,
                config.htcConfig.locData.FileUndoCheckOutConfirmMessage,
                function (btn) {
                    if (btn == 'yes') {
                        config.globalLoadMask.msg = config.htcConfig.locData.UndoCheckingOutMessage + "...";
                        config.globalLoadMask.show();
                        HttpCommander.Common.UnCheckOut(fileInfo, function (data, trans) {
                            config.globalLoadMask.hide();
                            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                            if (!HttpCommander.Lib.Utils.checkDirectHandlerResult(
                                        data, trans, config.Msg, config.htcConfig)) {
                                if (typeof data != 'undefined') {
                                    config.openGridFolder(fileInfo.path);
                                }
                            } else {
                                config.showBalloon(String.format(
                                    config.htcConfig.locData.SuccessfullyUndoCheckedOutMessage,
                                    Ext.util.Format.htmlEncode(fileInfo.name))
                                );
                                config.openGridFolder(fileInfo.path);
                            }
                        });
                    }
                }
            );
        },
        selectAll: function (gridPanel) {
            var sm, last, r;
            gridPanel = gridPanel || config.getGrid();
            if (!gridPanel || !Ext.isFunction(gridPanel.getSelectionModel)) {
                return;
            }
            sm = gridPanel.getSelectionModel();
            if (!sm) {
                return;
            }
            sm.silent = true;
            sm.selectAll();
            sm.silent = false;
            if (sm.isLocked()) {
                return;
            }
            last = sm.lastActive;
            r = gridPanel.getStore().getAt(last);
            if (r && sm.fireEvent('beforerowselect', sm, last, true, r) !== false) {
                sm.fireEvent('rowselect', sm, last, r);
                sm.fireEvent('selectionchange', sm);
            }
        },
        invertSelection: function (gridPanel) {
            gridPanel = gridPanel || config.getGrid();
            var sm, store, len, i, lastD = -1, lastS = -1, r;
            if (!gridPanel || !Ext.isFunction(gridPanel.getSelectionModel)) {
                return;
            }
            sm = gridPanel.getSelectionModel();
            if (!sm) {
                return;
            }
            store = gridPanel.getStore();
            len = store.getCount();
            sm.silent = true;
            for (i = 0; i < len; i++) {
                if (sm.isSelected(i)) {
                    sm.deselectRow(i);
                    lastD = i;
                } else {
                    sm.selectRow(i, true);
                    if (sm.isSelected(i)) {
                        lastS = i;
                    }
                }
            }
            sm.silent = false;
            if (lastS >= 0) {
                r = store.getAt(lastS);
                if (!!r && sm.fireEvent('beforerowselect', sm, lastS, true, r) !== false) {
                    sm.fireEvent('rowselect', sm, lastS, r);
                    sm.fireEvent('selectionchange', sm);
                }
            } else if (lastD >= 0) {
                r = store.getAt(lastD);
                if (!!r) {
                    sm.fireEvent('rowdeselect', sm, lastD, r);
                    sm.fireEvent('selectionchange', sm);
                }
            }
        },
        zipContent: function (initZipContent) {
            var selectedRecord = config.getGrid().getSelectionModel().getSelected();
            var curFolder = config.getCurrentFolder();
            var unzipInfo = {
                path: curFolder,
                name: selectedRecord.data.name
            };
            var zipContentWindow = initZipContent();
            if (zipContentWindow) {
                zipContentWindow.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressZipContents + "...";
                config.globalLoadMask.show();
                HttpCommander.Common.ZipContents(unzipInfo, function (data, trans) {
                    config.globalLoadMask.hide();
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                    if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                                data, trans, config.Msg, config.htcConfig)) {
                        zipContentWindow.setTitle(String.format(
                            config.htcConfig.locData.ArchiveContentsTitle,
                            Ext.util.Format.htmlEncode(unzipInfo.name)
                        ));
                        zipContentWindow.setZipFileInfo(unzipInfo);
                        zipContentWindow.setContentTree(data.totalNodes, data.nodes);
                        zipContentWindow.show();
                    }
                });
            }
        },
        zip: function () {
            var selectedSet = config.createSelectedSet(config.getGrid(), config.getCurrentFolder());
            selectedSet["zipDownload"] = false;
            config.initAndShowZipPromptWindow(selectedSet);
        },
        zipDownload: function () {
            var curFolder = config.getCurrentFolder();
            var selectedSet = config.createSelectedSet(config.getGrid(), curFolder);
            var now = new Date();
            selectedSet.name = "selected_files_" + now.getFullYear() + (now.getMonth() + 1)
                + now.getDate() + "_" + now.getHours() + now.getMinutes() + now.getSeconds() + ".zip";
            selectedSet.zipDownload = true;
            selectedSet.noCompress = true;
            var oldAT = Ext.Ajax.timeout;
            Ext.Ajax.timeout = HttpCommander.Lib.Consts.zipRequestTimeout;
            config.globalLoadMask.msg = config.htcConfig.locData.ProgressZipping + "...";
            config.globalLoadMask.show();
            HttpCommander.Common.Zip(selectedSet, function (data, trans) {
                Ext.Ajax.timeout = oldAT;
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, config.Msg, config.htcConfig)) {
                    var url = config.htcConfig.relativePath
                        + "Handlers/Download.ashx?action=download&delete=true&file="
                        + encodeURIComponent(curFolder + "/" + data.filename);
                    if (!Ext.isIE) {
                        window.location.href = url;
                    } else {
                        var ddStr = 'HttpCommander.Main.FileManagers["' + config.getUid() + '"].downloadDialog';
                        var downloadLink = String.format(
                            "<a href='{0}' onclick='if(" + ddStr + "){" + ddStr + ".hide();delete "
                            + ddStr + ";}'>{1}</a>",
                                url,
                                config.htcConfig.locData.DownloadIEClickHere
                        );
                        var message = String.format(config.htcConfig.locData.DownloadIEArchiveReady,
                            Ext.util.Format.htmlEncode(selectedSet.name));
                        message += ". " + downloadLink;
                        config.getFileManager().downloadDialog = config.Msg.show({
                            title: config.htcConfig.locData.DownloadIECaption,
                            msg: message,
                            fn: function (result) {
                                var cleanupInfo = {};
                                cleanupInfo.path = selectedSet.path;
                                cleanupInfo.name = data.filename;
                                HttpCommander.Common.Cleanup(cleanupInfo, function (data, trans) { });
                            }
                        });
                    }
                }
            });
        },
        pasteTo: function (move, node, dlg) {
            self.paste(null, config.clipboard, node.attributes.path, dlg);
        },
        paste: function (isPasteInfo, clipboard, newPath, dlg) {
            var fromDlg = !Ext.isEmpty(newPath) && !!dlg;
            var curFolder = fromDlg ? newPath : config.getCurrentFolder();

            var filePath = curFolder;

            if (isPasteInfo) {
                var selectedRecord = config.getGrid().getSelectionModel().getSelected();
                if (typeof selectedRecord != 'undefined' && selectedRecord.data.rowtype == "folder")
                    filePath += "/" + selectedRecord.data.name;
            }

            clipboard.newPath = filePath;
            if (config.getAsControl())
                clipboard.control = true;

            config.globalLoadMask.msg = clipboard.isCut
                ? config.htcConfig.locData.ProgressMoving + "..."
                : config.htcConfig.locData.ProgressCopying + "...";
            config.globalLoadMask.show();
            var oldAT = Ext.Ajax.timeout;
            Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
            HttpCommander.Common.Paste(clipboard, function (data, trans) {
                Ext.Ajax.timeout = oldAT;
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";

                if (typeof data == 'undefined') {
                    showError(Ext.util.Format.htmlEncode(trans.message));
                    return;
                }

                var tip = '';
                if (data.filesProcessed > 0)
                    tip += String.format(
                        clipboard.isCut
                            ? config.htcConfig.locData.BalloonFilesMoved
                            : config.htcConfig.locData.BalloonFilesCopied,
                        data.filesProcessed
                    );
                if (data.foldersProcessed > 0) {
                    if (tip != '')
                        tip += '<br />';
                    tip += String.format(
                        clipboard.isCut
                            ? config.htcConfig.locData.BalloonFoldersMoved
                            : config.htcConfig.locData.BalloonFoldersCopied,
                        data.foldersProcessed
                    );
                }
                var filesFailed = clipboard.filesCount - data.filesProcessed;
                if (filesFailed > 0) {
                    if (tip != '')
                        tip += '<br />';
                    tip += String.format(config.htcConfig.locData.BalloonFilesFailed, filesFailed);
                }
                var foldersFailed = clipboard.foldersCount - data.foldersProcessed;
                if (foldersFailed > 0) {
                    if (tip != '')
                        tip += '<br />';
                    tip += String.format(config.htcConfig.locData.BalloonFoldersFailed, foldersFailed);
                }

                if (!data.success) {
                    showError(data.message);
                } else {
                    var srcPath = clipboard.srcPath;
                    if (data.foldersProcessed > 0 && srcPath && clipboard.isCut
                            && data.warning !== true) {
                        config.reloadTreeNodeIfOpened(srcPath);
                    }
                }
                config.showBalloon(tip);

                if (data.warning === true) {
                    config.showRefreshWarning();
                } else {
                    if (!Ext.isEmpty(data.firstname) && !Ext.isEmpty(data.pathto)) {
                        config.setSelectPath({
                            name: data.firstname,
                            path: data.pathto
                        });
                    }
                    if (data.foldersProcessed > 0) {
                        config.openGridFolder(Ext.isEmpty(data.pathto) ? filePath : data.pathto, true, true);
                    } else {
                        config.openGridFolder(Ext.isEmpty(data.pathto) ? filePath : data.pathto);
                    }
                    if (fromDlg && !!dlg) {
                        dlg.hide();
                    }
                }
                if (clipboard.isCut || fromDlg) {
                    clipboard.clear();
                }
            });
        },
        runShortcut: function () {
            var selectedRecord = config.getGrid().getSelectionModel().getSelected();
            config.initAndShowShortcutWindow(selectedRecord, config.getCurrentFolder());
        },
        viewFile: function () {
            var selectedRecord = config.getGrid().getSelectionModel().getSelected();
            config.viewFile(selectedRecord, config.getCurrentFolder());
        },
        imagesPreview: function () {
            var selectedRecord = config.getGrid().getSelectionModel().getSelected();
            var imageViewerWindow = config.initImagesViewer();
            if (imageViewerWindow) {
                imageViewerWindow.showImageViewer(selectedRecord, config.getCurrentFolder(),
                    config.getGrid().getStore()
                );
            }
        },
        flashPreview: function () {
            var selectedRecord = config.getGrid().getSelectionModel().getSelected();
            var flashViewerWindow = config.initFlashViewer();
            if (flashViewerWindow) {
                flashViewerWindow.getFlashSize(config.getCurrentFolder(), selectedRecord.data.name);
            }
        },
        editFile: function () {
            var selectedRecord = config.getGrid().getSelectionModel().getSelected();
            var editTextFileWindow = config.initEditTextFileWindow();
            var readOnly = false;
            if (editTextFileWindow) {
                if (config.htcConfig.currentPerms && (!config.htcConfig.currentPerms.modify ||
                    (
                        (config.htcConfig.enableMSOfficeEdit
                        || config.htcConfig.enableOpenOfficeEdit
                        || config.htcConfig.enableWebFoldersLinks) && selectedRecord.data.locked
                    ))) {
                    readOnly = true;
                }
                editTextFileWindow.loadTextFile(selectedRecord, config.getCurrentFolder(), readOnly);
            }
        },
        linkToFileFolder: function () {
            var selectedRecord = config.getGrid().getSelectionModel().getSelected();
            var virtPath = config.virtualFilePath(selectedRecord, config.getCurrentFolder());
            config.prepareAndShowLinkToFileFolderWindow(virtPath,
                selectedRecord ? selectedRecord.data.rowtype == 'folder' : true);
        },
        sendEmail: function () {
            if (!Ext.isDefined(config.htcConfig.enableSendEmail) || config.htcConfig.enableSendEmail == 'disable') {
                return;
            }
            var sendEmailWindow = config.initSendEmail();
            if (sendEmailWindow) {
                sendEmailWindow.initialize();
                sendEmailWindow.show();
            }
        },
        sendEmailWithService: function (name) {
            if (!Ext.isDefined(config.htcConfig.enableSendEmail) || config.htcConfig.enableSendEmail == 'disable') {
                return;
            }
            name = name || 'gmail';
            var sfo = config.getSelectedFiles(),
                selFileNames = sfo.files, selFiles = selFileNames.length,
                selFolderNames = sfo.folders, selFolders = selFolderNames.length,
                enableLinksToFile = (config.htcConfig.currentPerms && config.htcConfig.currentPerms.download && selFiles > 0 && config.htcConfig.enableLinkToFile == true),
                enableLinksToFolder = (selFolders > 0 && config.htcConfig.enableLinkToFolder == true),
                url, urls = '', maxLen = 2048, dnl = encodeURIComponent('\n\n'),
                i, len, itemName, itemUrl;
            var allowLinks = (enableLinksToFile || enableLinksToFolder) &&
                ((config.htcConfig.enableSendEmail == "any") || (config.htcConfig.enableSendEmail == "linksonly"));
            switch (name) {
                case 'outlook':
                    url = 'https://outlook.live.com/?path=/mail/action/compose&body=';
                    break;
                default:
                    url = 'https://mail.google.com/mail/?view=cm&fs=1&ui=2&body=';
                    maxLen = 8192;
                    break;
            }
            if (allowLinks) {
                var curFolder = config.getCurrentFolder();
                if (enableLinksToFile) {
                    len = selFileNames.length;
                    for (i = 0; i < len; i++) {
                        itemName = selFileNames[i];
                        itemUrl = (i == 0 ? '' : dnl)
                            + encodeURIComponent(config.linkToFileByName(itemName, curFolder).replace(/&action=download/gi, ''));
                        if ((url + itemUrl).length >= maxLen) {
                            break;
                        }
                        url += itemUrl;
                    }
                }
                if (enableLinksToFolder && url.length < maxLen) {
                    len = selFolderNames.length;
                    for (i = 0; i < len; i++) {
                        itemName = selFolderNames[i];
                        itemUrl = (i == 0 ? '' : dnl)
                            + encodeURIComponent(config.linkToFolderByName(itemName, curFolder).replace(/&action=download/gi, ''));
                        if ((url + itemUrl).length >= maxLen) {
                            break;
                        }
                        url += itemUrl;
                    }
                }
            }
            var sendWindow = window.open(url, 'linkssend' + name,
                HttpCommander.Lib.Utils.getPopupProps(600, 500));
            if (sendWindow) {
                try { sendWindow.focus(); }
                catch (e) { }
            }
        },
        videoConvert: function () {
            var selectedRecord = config.getGrid().getSelectionModel().getSelected();
            var videoConvertWindow = config.createVideoConvertWindow();
            if (videoConvertWindow) {
                videoConvertWindow.prepare(selectedRecord, config.getCurrentFolder());
                videoConvertWindow.show();
            }
        },
        playVideoFlash: function () {
            var selectedRecord = config.getGrid().getSelectionModel().getSelected();
            var playVideoFlashWindow = config.createPlayVideoFlashWindow();
            if (playVideoFlashWindow) {
                playVideoFlashWindow.playVideoFile(selectedRecord, config.getCurrentFolder());
            }
        },
        playVideoJS: function () {
            var selectedRecord = config.getGrid().getSelectionModel().getSelected();
            var playVideoJSWindow = config.createPlayVideoJSWindow();
            if (playVideoJSWindow) {
                playVideoJSWindow.playVideoFile(selectedRecord, config.getCurrentFolder());
            }
        },
        playVideoHTML5: function () {
            var selectedRecord = config.getGrid().getSelectionModel().getSelected();
            var playVideoHtml5Window = config.createPlayVideoHtml5Window();
            if (playVideoHtml5Window) {
                playVideoHtml5Window.playVideoFile(selectedRecord, config.getCurrentFolder());
            }
        },
        playAudioHTML5: function () {
            var selectedRecord = config.getGrid().getSelectionModel().getSelected();
            var playAudioHtml5Window = config.createPlayAudioHtml5Window();
            if (playAudioHtml5Window) {
                playAudioHtml5Window.playFile(selectedRecord, config.getCurrentFolder());
            }
        }
    };
    return self;
};