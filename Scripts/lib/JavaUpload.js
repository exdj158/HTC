Ext.ns('HttpCommander.Lib');

/* config: htcConfig, getRenderers(), getUploadWindow(), getCurrentFolder(),
//openTreeNode()->removed
openGridFolder(), $(), setPermWarningShown(),
showBalloon(), getPermWarningShown(), getUid(), getAppRootUrl(), openTreeRecent()
*/
HttpCommander.Lib.JavaUpload = function(config) {
    var ignorePathsItem, maxSizeNoteItem;
    var self = {
        'items':
        [
            ignorePathsItem = new Ext.form.Checkbox({
                boxLabel: config.htcConfig.locData.UploadJavaIgnorePaths,
                hidden: !config.htcConfig.folderUpload,
                value: config.htcConfig.folderUpload,
                style: 'padding-left:4px;'
            }),
            maxSizeNoteItem = new Ext.form.Label({
                style: 'padding-left:4px;',
                html: config.htcConfig.chunkedUpload
                      ? config.htcConfig.locData.UploadUnlimitedSizeMessage
                      : (
                            config.htcConfig.maxUploadSize && config.htcConfig.maxUploadSize != '-1'
                            ? String.format(
                                config.htcConfig.locData.UploadTotalMaxSizeMessage,
                                config.getRenderers().sizeRenderer(config.htcConfig.maxUploadSize))
                            : '&nbsp;'
                        )
            })
        ],
        'html': '<div style="margin-top:4px;margin-left:4px;" id="' + config.$('contentForJavaUploader') + '">'
                + String.format((config.htcConfig.chunkedUpload ? HttpCommander.Lib.Consts.uploadAppletTextEx : HttpCommander.Lib.Consts.uploadAppletText),
                    Ext.util.Format.htmlEncode(config.getAppRootUrl()), config.getUid(), config.htcConfig.twoLetterLangName)
                + '</div>',
        'JavaPowUpload_onUploadStart': function() {
            var javaPowUpload = document.getElementById(config.$('javaPowUpload'));
            var curFolder = config.getCurrentFolder();
            var ignorePaths = ignorePathsItem.el.dom.checked;
            if (!curFolder) {
                window.alert(config.htcConfig.locData.UploadFolderNotSelected);
                javaPowUpload.clickStop();
                return;
            }
            if (!config.htcConfig.currentPerms || !config.htcConfig.currentPerms.upload) {
                window.alert(config.htcConfig.locData.UploadNotAllowedPrompt);
                javaPowUpload.clickStop();
                return;
            }
            javaPowUpload.removePostFields();
            javaPowUpload.addPostField('path', curFolder);
            if (ignorePaths) {
                javaPowUpload.addPostField('ignorePaths', 'true');
            }
            ignorePathsItem.el.dom.disabled = true;
        },
        'JavaPowUpload_onUploadFinish': function () {
            config.openTreeRecent();
            var curFolder = config.getCurrentFolder();
            if (curFolder) {
                //config.openTreeNode(curFolder, true);
                config.openGridFolder(curFolder, true, true);
            }
            ignorePathsItem.el.dom.disabled = false;
            config.setPermWarningShown(false);
        },
        'JavaPowUpload_onServerResponse': function(status, response) {
            if (response) {
                var result = window.eval('(' + response + ')'),
                    balloonText = '';
                if (!config.htcConfig.chunkedUpload) {
                    balloonText = String.format(
                        config.htcConfig.locData.BalloonFilesUploaded,
                        result.filesSaved);
                    if (!result.success) {
                        if (result.filesRejected > 0) {
                            balloonText += '<br />' + String.format(
                                config.htcConfig.locData.BalloonFilesNotUploaded,
                                result.filesRejected);
                        }
                        if (typeof result.msg != 'undefined') {
                            balloonText += '.<br />' + result.msg;
                        }
                    }
                    config.showBalloon(balloonText);
                } else if (!config.getPermWarningShown() && result.msg.indexOf('$') != -1) {
                    balloonText = config.htcConfig.locData.BalloonSomeFilesNotUploaded
                        + '. ' + result.msg.replace('$', '');
                    config.showBalloon(balloonText);
                    config.setPermWarningShown(true);
                }
            }
        },
        'JavaPowUpload_onAppletInit': function() {
            var uploadWindow = config.getUploadWindow();
            uploadWindow.fireEvent('bodyresize',
                uploadWindow,
                uploadWindow.getInnerWidth(),
                uploadWindow.getInnerHeight());
        },
        getMaxSizeNoteCmp: function() {
            return maxSizeNoteItem;
        }
    };
    return self;
};