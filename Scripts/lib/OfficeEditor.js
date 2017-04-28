Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Window, Msg, $(), setOfficeTypeDetected(),
getFileManagerInstance(), showBalloon()
*/
HttpCommander.Lib.LinkEditInOffice = function (config) {
    var ctcIcon = config.htcConfig.relativePath + 'Images/ctc.png';
    var self = new config.Window({
        title: '',
        plain: true,
        bodyStyle: 'padding:5px',
        layout: 'form',
        resizable: false,
        closeAction: 'hide',
        width: 400,
        autoHeigth: true,
        deferredRender: true,
        labelAlign: 'top',
        items:
        [
            {
                itemId: 'link-edit-office-label',
                xtype: 'label',
                text: '',
                anchor: '100%'
            },
            {
                xtype: 'areactc', //'textarea',
                ctcIcon: ctcIcon,
                ctcHint: config.htcConfig.locData.CommandCopyToClipboard,
                autoScroll: true,
                hideLabel: true,
                itemId: 'link-edit-in-office',
                readOnly: true,
                selectOnFocus: true,
                anchor: '100%',
                height: 40,
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
                flex: 1
            },
            {
                itemId: 'link-edit-loo-label',
                xtype: 'label',
                html: String.format(config.htcConfig.locData.OpenLibreOfficeRunCommandNote ||
                    'Or press the key combination {0}Win+R{1}, insert the command line below in the {0}Open:{1} field and press {0}OK{1}', '<b>', '</b>'),
                anchor: '100%'
            },
            {
                xtype: 'areactc', //'textarea',
                ctcIcon: ctcIcon,
                ctcHint: config.htcConfig.locData.CommandCopyToClipboard,
                autoScroll: true,
                hideLabel: true,
                itemId: 'link-edit-in-loo',
                readOnly: true,
                selectOnFocus: true,
                anchor: '100%',
                height: 40,
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
                flex: 1
            },
            {
                itemId: 'office-open-mode',
                xtype: 'hidden',
                value: 2
            }
        ],
        buttons: [{
            text: config.htcConfig.locData.CommonButtonCaptionClose,
            handler: function() {
                self.hide();
            }
        }],
        listeners: {
            hide: function(selfWindow) {
                var fLabel = selfWindow.getComponent('link-edit-office-label');
                if (fLabel) {
                    fLabel.setText('');
                    fLabel.el.dom.innerHTML = '';
                }
                selfWindow.setTitle('');
                var fUrl = selfWindow.getComponent('link-edit-in-office');
                if (fUrl) {
                    fUrl.setValue('');
                }
                var fUrl1 = selfWindow.getComponent('link-edit-in-loo');
                if (fUrl1) {
                    fUrl1.setValue('');
                }
            },
            show: function (window) {
                window.center();
                window.doLayout();
                window.syncSize();
                var cmp = window.getComponent('link-edit-in-office');
                if (cmp)
                    cmp.focus(true);
            }
        }
    });
    
    return self;
};

/* config: htcConfig, Window, getUid(), $()
*/
HttpCommander.Lib.BasicAuthAlert = function(config) {
    var fbaCheckBox;
    
    var self = new config.Window({
        title: config.htcConfig.locData.FixBasicAuthAlertTitle,
        bodyStyle: 'padding:5px',
        layout: {
            type: 'vbox',
            align: 'stretch',
            padding: 0
        },
        resizable: true,
        closeAction: 'hide',
        width: 300,
        height: 140,
        plain: true,
        items:
        [
            {
                xtype: 'label',
                hideLabel: true,
                autoHeight: true,
                margins: '0 0 5 0',
                html: String.format(config.htcConfig.locData.FixBasicAuthAlertMessage,
                    '<span>'
                    + HttpCommander.Lib.Utils.getHelpLinkOpenTag(config.getUid(), 'basicSSLfix')
                    + 'Microsoft Office</a></span>')
            },
            fbaCheckBox = new Ext.form.Checkbox({
                checked: false,
                boxLabel: config.htcConfig.locData.FixBasicAuthAlertCheckBoxText,
                listeners: {
                    check: function(thisCheckBox, checkedState) {
                        if (checkedState) {
                            HttpCommander.Lib.Utils.setCookie(config.$('notshowfixsslalert'), 1);
                        } else {
                            HttpCommander.Lib.Utils.deleteCookie(config.$('notshowfixsslalert'));
                        }
                    }
                }
            })
        ],
        buttons: [{
            text: config.htcConfig.locData.CommonButtonCaptionClose,
            handler: function() {
                self.hide();
            }
        }],
        listeners: {
            show: function(selfWindow) {
                var cookieFixAlert = HttpCommander.Lib.Utils.getCookie(config.$('notshowfixsslalert'), true);
                fbaCheckBox.checked = false;
                if (typeof cookieFixAlert != 'undefined' && cookieFixAlert != null && cookieFixAlert == '1') {
                    fbaCheckBox.checked = true;
                }
            }
        }
    });
    
    return self;
}

/* config: htcConfig, Window, Msg, getUid(), $(), ProcessScriptError(),
setOfficeTypeDetected(), getOfficeTypeDetected(),
getFileManagerInstance(), getAppRootUrl()
*/
HttpCommander.Lib.OfficeEditor = function(config) {
    var fixBasicAuthAlert,
        linkToFileEditInOffice;

    var self = {
        initAndShowFixBasicAuthAlert: function() {
            try {
                if (!fixBasicAuthAlert) {
                    fixBasicAuthAlert = HttpCommander.Lib.BasicAuthAlert({
                        'htcConfig': config.htcConfig,
                        'Window': config.Window,
                        'getUid': config.getUid,
                        '$': config.$
                    });
                }
                fixBasicAuthAlert.show();
            } catch (e) {
                config.ProcessScriptError(e);
            }
        },
        prepareAndShowLinkToFileEditInOffice: function(url, mode) {
            try {
                if (!linkToFileEditInOffice) {
                    linkToFileEditInOffice = HttpCommander.Lib.LinkEditInOffice({
                        'htcConfig': config.htcConfig,
                        'Window': config.Window,
                        'Msg': config.Msg,
                        '$': config.$,
                        'setOfficeTypeDetected': config.setOfficeTypeDetected,
                        'getFileManagerInstance': config.getFileManagerInstance,
                        'showBalloon': config.showBalloon
                    });
                }
                linkToFileEditInOffice.hide();
                var mso = (mode === 0 || mode === 2);
                var officeTypeDetected = config.getOfficeTypeDetected();
                var enabled = ((officeTypeDetected == 1 || officeTypeDetected == 3) && (mode == 0 || mode == 2)) || ((officeTypeDetected == 2 || officeTypeDetected == 3) && (mode == 1 || mode == 3));
                linkToFileEditInOffice.getComponent('link-edit-in-office').setValue(url);
                var sLinkLabel = linkToFileEditInOffice.getComponent('link-edit-loo-label');
                var sLink = linkToFileEditInOffice.getComponent('link-edit-in-loo');
                var msCmd = HttpCommander.Lib.Utils.getMSOfficeCommand(url);
                var showRunCmd = !mso || msCmd;
                if (showRunCmd) {
                    sLink.setValue((mso ? msCmd : 'soffice') + ' "' + url + '"');
                    sLinkLabel.setVisible(true);
                    sLink.setVisible(true);
                } else {
                    sLinkLabel.setVisible(false);
                    sLink.setVisible(false);
                }
                linkToFileEditInOffice.setTitle(mso
                    ? config.htcConfig.locData.CommandEditInMSOffice
                    : config.htcConfig.locData.CommandEditInOOo);
                var backColor = HttpCommander.Lib.Utils.getBackgroundColor(document.body);
                try {
                    var list = HttpCommander.Lib.Utils.getElementsByClass('x-window-mc');
                    if (list && list.length > 0) {
                        backColor = HttpCommander.Lib.Utils.getBackgroundColor(list[0]);
                    }
                } catch (e) {
                    // ignore
                }
                linkToFileEditInOffice.getComponent('link-edit-office-label').setText(
                    '<table><tr><td style="width:100%;">'
                        + ('<p>' + Ext.util.Format.htmlEncode(config.htcConfig.locData.OfficeEditCopyLinkLabel) + '</p>')
                    + '</table>', false);
                linkToFileEditInOffice.getComponent('office-open-mode').setValue(mode);
                linkToFileEditInOffice.getComponent('link-edit-in-office').setHeight(80);
                if (showRunCmd) {
                    linkToFileEditInOffice.getComponent('link-edit-in-loo').setHeight(80);
                }
                linkToFileEditInOffice.show();
            } catch (e) {
                config.ProcessScriptError(e);
            }
        },
        EditDocumentInMSOffice: function(url) { // edit document (url) in MS Office.
            // check ssl for basic auth
            var isSSLurl = config.htcConfig.isSSLConnection;
            if (!isSSLurl && config.htcConfig.isBasicAuth) {
                if (config.htcConfig.useSSLForMSOffice) {
                    url = String(url).replace(/^http:\/\//i, 'https://');
                }
                if (config.htcConfig.showFixBasicAuthAlert) {
                    var cookieFixAlert = HttpCommander.Lib.Utils.getCookie(config.$('notshowfixsslalert'), true);
                    if (typeof cookieFixAlert == 'undefined' || cookieFixAlert == null || cookieFixAlert != '1') {
                        self.initAndShowFixBasicAuthAlert();
                    }
                }
            }

            // url encode
            var encUrl = String(url)
                .replace(/%/g, '%25')
                .replace(/&/g, '%26')
                .replace(/#/g, '%23')
                .replace(/\+/g, '%2B');
            //.replace(/=/g, '%3D')
            //.replace(/,/g, '%2C');

            // create sharepoint object
            var sharePointObject = HttpCommander.Lib.Utils.createSharePointPlugin();
            if (!sharePointObject && (window.ActiveXObject || HttpCommander.Lib.Utils.browserIs.ie11up)) {
                var fileExt = HttpCommander.Lib.Utils.getFileExtension(url);
                if (!fileExt) {
                    return false;
                }
                fileExt = ',' + fileExt + ',';
                var activeXMSOffice;
                if ((',' + HttpCommander.Lib.Consts.msoWordTypes + ',').indexOf(fileExt) > -1) {
                    activeXMSOffice = HttpCommander.Lib.Consts.ActiveXMSOfficeApplications['Word'];
                } else if ((',' + HttpCommander.Lib.Consts.msoExcelTypes + ',').indexOf(fileExt) > -1) {
                    activeXMSOffice = HttpCommander.Lib.Consts.ActiveXMSOfficeApplications['Excel'];
                } else if ((',' + HttpCommander.Lib.Consts.msoPowerTypes + ',').indexOf(fileExt) > -1) {
                    activeXMSOffice = HttpCommander.Lib.Consts.ActiveXMSOfficeApplications['PowerPoint'];
                }
                if (typeof activeXMSOffice != 'undefined') {
                    try {
                        var OfficeApp = new ActiveXObject(activeXMSOffice.app);
                        if (typeof OfficeApp.Visible != 'undefined') {
                            OfficeApp.Visible = true;
                        } else if (typeof OfficeApp.ActiveWindow != 'undefined') {
                            OfficeApp.ActiveWindow.Visible = true;
                        }
                        if (typeof activeXMSOffice.obj != 'undefined') {
                            OfficeApp[activeXMSOffice.obj].Open(encUrl);
                            return true;
                        }
                    } catch (e) {
                        return false;
                    }
                }
                return false;
            }

            // try to launch sharepoint object
            try {
                return sharePointObject.EditDocument(encUrl);
            } catch (e) {
                return false;
            }
        },
        EditDocumentInOOo: function(file) { // edit 'file' in OpenOffice/LibreOffice
            if (window.ActiveXObject || HttpCommander.Lib.Utils.browserIs.ie11up) {
                try {
                    var ServiceManager = new ActiveXObject('com.sun.star.ServiceManager');
                    if (ServiceManager) {
                        var Desktop = ServiceManager.createInstance('com.sun.star.frame.Desktop');
                        if (Desktop) {
                            var iHandler = ServiceManager.Bridge_GetStruct('com.sun.star.beans.PropertyValue');
                            iHandler.Name = 'InteractionHandler';
                            iHandler.Value = ServiceManager.createInstance('com.sun.star.task.InteractionHandler');
                            var args = new Array();
                            args[0] = iHandler;
                            Desktop.LoadComponentFromURL(file, '_blank', 0, args);
                            return true;
                        }
                    }
                } catch (e) {
                    return false;
                }
            }
            return false;
        },
        EditDocumentInOffice: function(file, mode) {
            switch (mode) {
                case 0:
                    if (!self.EditDocumentInMSOffice(file)) {
                        return self.EditDocumentInOOo(file); // not used
                    }
                    return true;
                case 1:
                    if (!self.EditDocumentInOOo(file)) {
                        return self.EditDocumentInMSOffice(file); // not used
                    }
                    return true;
                case 2: return self.EditDocumentInMSOffice(file);
                case 3: return self.EditDocumentInOOo(file);
                default: return false;
            }
        },
        OpenFile: function(file, mode) {
            if (!self.EditDocumentInOffice(file, mode)) {
                file = HttpCommander.Lib.Utils.urlEncode(file);
                self.prepareAndShowLinkToFileEditInOffice(file, mode);
            }
        }
    };

    return self;
};