Ext.ns('HttpCommander.Lib');

/* config: htcConfig, getUid(), getCurrentFolder(), Msg,
gridItemExists(), isModifyAllowed(), openGridFolder, showBalloon(), openTreeRecent()
*/
HttpCommander.Lib.UploadFromUrl = function (config) {
    var uploadFromUrlField,
        uploadFromUrlFileName;

    var self = new Ext.FormPanel({
        bodyStyle: 'padding: 5px 5px 0px 5px;',
        border: false,
        bodyBorder: false,
        header: false,
        labelAlign: 'top',
        items:
        [
            uploadFromUrlField = new Ext.form.TextArea({
                fieldLabel: String.format(config.htcConfig.locData.UploadFromUrlLabelText,
                        "<span><img alt='' align='absmiddle' width='16' height='16' src='"
                        + HttpCommander.Lib.Utils.getIconPath(config, 'dropbox') + "'>&nbsp;"
                        + HttpCommander.Lib.Utils.getHelpLinkOpenTag(config.getUid(), "dropbox") + "<b>"
                        + HttpCommander.Lib.Consts.CloudNames.dropbox + "</b></a></span>",
                        "&nbsp;<img alt='' align='absmiddle' width='16' height='16' src='"
                        + config.htcConfig.relativePath + "Images/picasa.png'>&nbsp;<b>Picasa</b>",
                        "&nbsp;<img alt='' align='absmiddle' width='16' height='16' src='"
                        + config.htcConfig.relativePath + "Images/flickr.png'>&nbsp;<b>Flickr</b>",
                        "&nbsp;<img alt='' align='absmiddle' width='16' height='16' src='"
                        + config.htcConfig.relativePath + "Images/photobucket.png'>&nbsp;<b>PhotoBucket</b>",
                        "&nbsp;<img alt='' align='absmiddle' width='16' height='16' src='"
                        + config.htcConfig.relativePath + "Images/facebook.png'>&nbsp;<b>Facebook</b>")
                    + '<br />' + config.htcConfig.locData.UploadFromUrlFieldLabel,
                anchor: '100%',
                autoScroll: true,
                height: 40
            }),
            uploadFromUrlFileName = new Ext.form.TextField({
                fieldLabel: config.htcConfig.locData.UploadFromUrlFileName,
                width: 150
            })
        ],
        buttons:
        [
            {
                text: config.htcConfig.locData.UploadSimpleReset,
                handler: function () {
                    self.getForm().reset();
                }
            },
            {
                text: config.htcConfig.locData.UploadSimpleUpload,
                handler: function () {
                    var upURL = uploadFromUrlField.getValue();
                    if (upURL && upURL != '' && self.getForm().isValid()) {
                        var curFolder = config.getCurrentFolder();
                        if (!curFolder) {
                            config.Msg.alert(config.htcConfig.locData.UploadFolderNotSelectedTitle,
                                config.htcConfig.locData.UploadFolderNotSelected);
                            return;
                        }
                        if (!config.htcConfig.currentPerms || !config.htcConfig.currentPerms.upload) {
                            config.Msg.alert(config.htcConfig.locData.UploadNotAllowedTitle,
                                config.htcConfig.locData.UploadNotAllowedPrompt);
                            return;
                        }
                        var uploadInfo = {
                            url: upURL,
                            path: curFolder,
                            name: uploadFromUrlFileName.getValue()
                        };
                        var showWarning = false;
                        if (uploadInfo.name && uploadInfo.name != '') {
                            if (config.gridItemExists(uploadInfo.name)) {
                                showWarning = true;
                            }
                        }
                        if (showWarning) {
                            var modify = config.isModifyAllowed();
                            config.Msg.show({
                                title: config.htcConfig.locData.UploadFilesAlreadyExists,
                                msg: modify
                                    ? String.format(config.htcConfig.locData.UploadOverwriteOrRenameFiles,
                                        config.htcConfig.locData.ExtMsgButtonTextYES,
                                        config.htcConfig.locData.ExtMsgButtonTextNO
                                      )
                                    : config.htcConfig.locData.UploadRenamedExistingFiles,
                                buttons: modify ? config.Msg.YESNOCANCEL : config.Msg.OKCANCEL,
                                icon: modify ? config.Msg.QUESTION : config.Msg.INFO,
                                fn: function (btn) {
                                    if (btn == 'ok' || btn == 'yes' || btn == 'no') {
                                        uploadInfo['rename'] = btn == 'ok' || btn == 'no';
                                        self.uploadFileFromUrl(upURL, curFolder, uploadInfo);
                                    }
                                }
                            });
                        } else {
                            uploadInfo['rename'] = true;
                            self.uploadFileFromUrl(upURL, curFolder, uploadInfo);
                        }
                    }
                }
            }
        ],
        'uploadFileFromUrl': function (url, uploadFolderPath, upInfo) {
            var oldAT = Ext.Ajax.timeout;
            Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
            config.Msg.show({
                title: config.htcConfig.locData.UploadFromUrlProgressTitle,
                msg: "<img alt='' src='" + HttpCommander.Lib.Utils.getIconPath(config, 'ajax-loader.gif') + "' class='filetypeimage'>&nbsp;"
                    + config.htcConfig.locData.UploadFromUrlMsg + "...",
                closable: false,
                modal: true,
                width: 220
            });
            HttpCommander.UploadFromURL.Upload(upInfo, function (data, trans) {
                Ext.Ajax.timeout = oldAT;
                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                        data, trans, config.Msg, config.htcConfig, 2)) {
                    config.openTreeRecent();
                    config.openGridFolder(uploadFolderPath);
                    config.showBalloon(String.format(config.htcConfig.locData.UploadFromUrlSuccessMsg,
                        HttpCommander.Lib.Utils.checkBracketsAndHtmlEncode(data.file),
                        Ext.util.Format.htmlEncode(url)));
                }
            });
        },
        'getUploadFromUrlField': function () {
            return uploadFromUrlField;
        }
    });

    return self;
};