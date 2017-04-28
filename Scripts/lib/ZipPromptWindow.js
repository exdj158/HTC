Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, globalLoadMask, getUid(), getFileManager(),
showBalloon(), openGridFolder(), setSelectPath(), openTreeRecent()
*/
HttpCommander.Lib.ZipPromptWindow = function(config) {
    var self = new config.Window({
        title: '',
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
        items:
        [
            {
                xtype: 'label',
                text: config.htcConfig.locData.CommonZipFileNamePrompt + ':'
            },
            {
                xtype: 'pwdfield',
                inputType: 'text',
                hideLabel: true
            },
            {
                xtype: 'label',
                text: config.htcConfig.locData.ZipPasswordProtectHint + ':'
            },
            {
                xtype: 'pwdfield',
                hideLabel: true
            }
        ],
        buttons:
        [
            {
                text: config.htcConfig.locData.CommonButtonCaptionOK,
                handler: function() {
                    if (!self.zipInfo["zipDownload"]) {
                        self.zipInfo["name"] = self.items.items[1].getValue();
                    }
                    if (config.htcConfig.allowSetPasswordForZipArchives) {
                        var pass = self.items.items[3].getValue();
                        if (String(pass).length > 0) {
                            self.zipInfo["password"] = pass;
                        }
                    }
                    self.hide();
                    var oldAT = Ext.Ajax.timeout;
                    Ext.Ajax.timeout = HttpCommander.Lib.Consts.zipRequestTimeout;
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressZipping + "...";
                    config.globalLoadMask.show();
                    HttpCommander.Common.Zip(self.zipInfo, function(data, trans) {
                        Ext.Ajax.timeout = oldAT;
                        config.globalLoadMask.hide();
                        config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                        if (typeof data == 'undefined') {
                            config.Msg.alert(config.htcConfig.locData.CommonErrorCaption,
                                Ext.util.Format.htmlEncode(trans.message));
                            return;
                        }
                        var curFolder = self.zipInfo["path"];
                        if (self.zipInfo["zipDownload"]) {
                            if (!data.success) {
                                config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, data.msg);
                            } else {
                                var url = config.htcConfig.relativePath
                                    + "Handlers/Download.ashx?action=download&delete=true&file="
                                    + encodeURIComponent(curFolder + "/" + data.filename);
                                self.zipDownload(url, data.filename);
                            }
                        } else {
                            self.zipCompleted(data, curFolder);
                        }
                    });
                }
            },
            {
                text: config.htcConfig.locData.CommonButtonCaptionCancel,
                handler: function() {
                    self.hide();
                }
            }
        ],
        listeners: {
            hide: function(win) {
                win.items.items[1].setValue('');
                win.items.items[3].setValue('');
                if (window.needFixAutofillPasswords) {
                    win.items.items[1].setReadOnly(true);
                    win.items.items[3].setReadOnly(true);
                }
            }
        },
        zipDownload: function(url, filename) {
            var self = this;
            if (!Ext.isIE) {
                window.location.href = url;
            } else {
                var ddStr = 'HttpCommander.Main.FileManagers["' + config.getUid() + '"].downloadDialog';
                var downloadLink = String.format(
                    "<a href='{0}' onclick='if(" + ddStr + "){" + ddStr + ".hide();delete " + ddStr + ";}'>{1}</a>",
                    url, config.htcConfig.locData.DownloadIEClickHere
                );
                var message = String.format(config.htcConfig.locData.DownloadIEArchiveReady,
                    Ext.util.Format.htmlEncode(self.zipInfo.name));
                message += ". " + downloadLink;
                config.getFileManager().downloadDialog = config.Msg.show({
                    title: config.htcConfig.locData.DownloadIECaption,
                    msg: message,
                    fn: function(result) {
                        var cleanupInfo = {};
                        cleanupInfo.path = self.zipInfo.path;
                        cleanupInfo.name = filename;
                        HttpCommander.Common.Cleanup(cleanupInfo, function(data, trans) { });
                    }
                });
            }
        },
        zipCompleted: function(data, curFolder) {
            var tip = "";
            if (typeof data.filesZipped == 'undefined')
                data.filesZipped = 0;
            if (typeof data.foldersZipped == 'undefined')
                data.foldersZipped = 0;
            if (data.filesZipped > 0)
                tip += String.format(config.htcConfig.locData.BalloonFilesZipped,
                    data.filesZipped
                );
            if (data.foldersZipped > 0) {
                if (tip != "")
                    tip += "<br />";
                tip += String.format(config.htcConfig.locData.BalloonFoldersZipped,
                    data.foldersZipped
                );
            }
            var filesFailed = self.zipInfo.filesCount - data.filesZipped;
            if (filesFailed > 0) {
                if (tip != "")
                    tip += "<br />";
                tip += String.format(config.htcConfig.locData.BalloonFilesFailed, filesFailed);
            }
            var foldersFailed = self.zipInfo.foldersCount - data.foldersZipped;
            if (foldersFailed > 0) {
                if (tip != "")
                    tip += "<br />";
                tip += String.format(config.htcConfig.locData.BalloonFoldersFailed, foldersFailed);
            }

            config.showBalloon(tip);

            if (!data.success) {
                config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, data.msg);
            }

            if (!Ext.isEmpty(data.filename) && !Ext.isEmpty(data.filepath)) {
                config.setSelectPath({
                    name: data.filename,
                    path: data.filepath
                });
            }

            if (data.success) {
                config.openTreeRecent();
            }
            config.openGridFolder(Ext.isEmpty(data.filepath) ? curFolder : data.filepath);
        },
        initialize: function(zipInfo) {
            var self = this;
            self.zipInfo = zipInfo;
            zipDownload = zipInfo['zipDownload'];
            self.setTitle(config.htcConfig.locData[zipDownload ? 'ZipPasswordProtectWindowTitle' : 'CommonZipFileNameCaption']);
            self.items.items[0].setVisible(!zipDownload);
            self.items.items[1].setValue('');
            self.items.items[1].setVisible(!zipDownload);
            self.items.items[2].setVisible(config.htcConfig.allowSetPasswordForZipArchives);
            self.items.items[3].setValue('');
            self.items.items[3].setVisible(config.htcConfig.allowSetPasswordForZipArchives);
        }
    });
    return self;
};