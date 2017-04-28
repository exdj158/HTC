Ext.ns('HttpCommander.Lib');

/**
    config: htcConfig, Msg, Window, globalLoadMask,
    showBalloon(), openTreeNode(), openGridFolder()
*/
HttpCommander.Lib.UnzipPromptWindow = function (config) {
    var self = new config.Window({
        closeAction: 'hide',
        autoHeight: true,
        width: 300,
        buttonAlign: 'center',
        defaultButton: 0,
        modal: true,
        plain: true,
        layout: 'form',
        bodyStyle: 'padding:5px',
        labelAlign: 'top',
        defaults: {
            anchor: '100%',
            xtype: 'textfield'
        },
        flags: 0,
        unzipInfo: null,
        items:[{
            xtype: 'label',
            text: ''
        }, {
            xtype: 'pwdfield',
            inputType: 'text',
            hideLabel: true
        }, {
            xtype: 'checkbox',
            boxLabel: config.htcConfig.locData.OpenFolderAfterUnzipCheckBox,
            checked: true
        }, {
            xtype: 'label',
            text: ''
        }, {
            xtype: 'pwdfield',
            hideLabel: true
        }],
        buttons: [{
            text: config.htcConfig.locData.CommonButtonCaptionOK,
            handler: function () {
                if (!!self.node && !!self.dlg) {
                    self.unzipInfo["extractPath"] = self.items.items[1].getValue();
                } else if (self.flags != 1) {
                    self.unzipInfo["newName"] = self.items.items[1].getValue();
                }
                var pass = self.items.items[4].getValue();
                if (self.unzipInfo['crypted'] && String(pass || '').length > 0) {
                    self.unzipInfo["password"] = pass;
                }
                var dlg = self.dlg;
                self.hide();
                var oldAT = Ext.Ajax.timeout;
                Ext.Ajax.timeout = HttpCommander.Lib.Consts.zipRequestTimeout;
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressUnzipping + "...";
                config.globalLoadMask.show();
                HttpCommander.Common.Unzip(self.unzipInfo, function (data, trans) {
                    Ext.Ajax.timeout = oldAT;
                    config.globalLoadMask.hide();
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                    if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                                data, trans, config.Msg, config.htcConfig)) {
                        if (data.filesRejected > 0) {
                            config.showBalloon(String.format(
                                config.htcConfig.locData.BalloonNotUnzipped,
                                data.filesRejected)
                            + ".<br />" + data.msg);
                        } else {
                            config.showBalloon(config.htcConfig.locData.BalloonUnzippedSuccessfully);
                        }
                        var parentPath = self.unzipInfo["extractPath"] || self.unzipInfo["path"];
                        var pathForOpen = parentPath;
                        if (self.flags != 1 && self.items.items[2].getValue() && self.unzipInfo["newName"] && self.unzipInfo["newName"].length > 0) {
                            pathForOpen += '/' + self.unzipInfo["newName"];
                        }
                        if (!!dlg) {
                            dlg.hide();
                        }
                        config.openGridFolder(pathForOpen, parentPath != pathForOpen ? parentPath : true, true);
                    }
                });
            }
        }, {
            text: config.htcConfig.locData.CommonButtonCaptionCancel,
            handler: function () {
                self.hide();
            }
        }],
        listeners: {
            hide: function (win) {
                win.dlg = null;
                win.node = null;
                win.items.items[1].setValue('');
                win.items.items[4].setValue('');
                if (window.needFixAutofillPasswords) {
                    win.items.items[1].setDisabled(false);
                    win.items.items[1].setReadOnly(true);
                    win.items.items[4].setReadOnly(true);
                }
            }
        },

        'initialize': function (unzipInfo, flags, node, dlg) {
            var self = this;
            self.dlg = null;
            self.node = null;
            self.flags = flags;
            self.unzipInfo = unzipInfo;
            var zipNameWithoutExt = unzipInfo["name"],
                pos = zipNameWithoutExt.lastIndexOf('.');
            if (pos > 0) {
                zipNameWithoutExt = zipNameWithoutExt.substring(0, pos);
            }
            var title = config.htcConfig.locData[flags == 0
                ? (unzipInfo["all"] === true ? 'CommandUnzipAll' : 'CommandUnzipSelected')
                : (flags == 2 ? 'CommonFolderNameCaption' : 'CommandUnzip')];
            if (flags == 3) {
                title += ' ' + config.htcConfig.locData.CommandUnzipTo + ' "'
                    + Ext.util.Format.htmlEncode(zipNameWithoutExt) + '"';
            }
            var needPass = (unzipInfo['crypted'] === true);
            self.setTitle(title);
            self.items.items[4].setValue('');
            self.items.items[4].setVisible(needPass);
            if (self.items.items[4].el && self.items.items[3].el.dom)
                self.items.items[4].el.dom.style.display = needPass ? '' : 'none';
            self.items.items[3].setVisible(needPass);
            if (self.items.items[3].el && self.items.items[2].el.dom)
                self.items.items[3].el.dom.style.display = needPass ? '' : 'none';
            self.items.items[1].setValue(flags == 3 ? zipNameWithoutExt : '');
            self.items.items[0].setText(
                (flags == 0 ? (config.htcConfig.locData.MessageUnzipToFolder + '.<br />') : '')
                    + config.htcConfig.locData.CommonFolderNamePrompt + ":",
                 false
            );
            var showNewFolderField = (flags != 1 && flags != 3);
            self.items.items[0].setVisible(showNewFolderField);
            if (self.items.items[0].el && self.items.items[0].el.dom)
                self.items.items[0].el.dom.style.display = showNewFolderField ? '' : 'none';
            self.items.items[1].setVisible(showNewFolderField);
            self.items.items[1].setDisabled(false);
            if (self.items.items[1].el && self.items.items[1].el.dom)
                self.items.items[1].el.dom.style.display = showNewFolderField ? '' : 'none';
            self.items.items[3].setText(
                config.htcConfig.locData[flags == 0 ? 'MessageUnzipNeedPassword' : 'MessageUnzipPasswordHint'] + ':',
                false
            );
            var showOpenFolderAfterUnzip = flags != 1;
            self.items.items[2].setVisible(showOpenFolderAfterUnzip);
            if (self.items.items[2].el && self.items.items[2].el.dom)
                self.items.items[2].el.dom.style.display = showOpenFolderAfterUnzip ? '' : 'none';

            if (!!node && !!dlg) {
                self.items.items[1].setValue(node.attributes.path);
                self.items.items[1].setDisabled(true);
                self.node = node;
                self.dlg = dlg;
            }
        }
    });
    return self;
};