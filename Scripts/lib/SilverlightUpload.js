Ext.ns('HttpCommander.Lib');

/* config: htcConfig, getUid(), getCurrentFolder(), Msg,
openGridFolder(), setPermWarningShown(), getPermWarningShown(),
showBalloon(), getUploadWindow(), $(), getAppRootUrl(), openTreeRecent()
*/
HttpCommander.Lib.SilverlightUpload = function (config) {
    return {
        'html': String.format(HttpCommander.Lib.Consts.uploadSilverlightText,
                /*{0}*/config.getUid(),
                /*{1}*/config.htcConfig.locData.UploadUnlimitedSizeMessage,
                /*{2}*/config.htcConfig.relativePath,
                /*{3}*/Ext.util.Format.htmlEncode(config.getAppRootUrl())),
        'onSilverlightLoaded': function () {
            var uploadWindow = config.getUploadWindow();
            uploadWindow.fireEvent('bodyresize',
                uploadWindow,
                uploadWindow.getInnerWidth(),
                uploadWindow.getInnerHeight());
            var ultimateUploader = document.getElementById(config.$('ultimateUploader')).Content.JSAPI;
            var curFolder = config.getCurrentFolder();
            ultimateUploader.Tag = curFolder;
            ultimateUploader.UploadStarted = function () {
                var curFolder = config.getCurrentFolder();
                if (!curFolder) {
                    config.Msg.alert(htcConfig.locData.CommonErrorCaption,
                        config.htcConfig.locData.UploadFolderNotSelected);
                    return;
                } else {
                    ultimateUploader.Tag = curFolder;
                }
                if (!config.htcConfig.currentPerms || !config.htcConfig.currentPerms.upload) {
                    config.Msg.alert(htcConfig.locData.CommonErrorCaption,
                        config.htcConfig.locData.UploadNotAllowedPrompt);
                    return;
                }
            };
            ultimateUploader.UploadFileCompleted = function (sender, args) {
                if (!config.getPermWarningShown() && args.ServerResponse.indexOf('$') != -1) {
                    var balloonText = config.htcConfig.locData.BalloonSomeFilesNotUploaded
                        + '. ' + args.ServerResponse.replace('$', '');
                    config.showBalloon(balloonText);
                    config.setPermWarningShown(true);
                }
            };
            ultimateUploader.UploadCompleted = function () {
                config.openTreeRecent();
                var curFolder = config.getCurrentFolder();
                if (curFolder) {
                    config.openGridFolder(curFolder);
                }
                config.setPermWarningShown(false);
            };
            ultimateUploader.UploadError = function (sender, args) {
                if (!config.getPermWarningShown() && args.ErrorMessage.indexOf('$') != -1) {
                    var balloonText = config.htcConfig.locData.BalloonSomeFilesNotUploaded
                        + '. ' + args.ErrorMessage.replace('$', '');
                    config.showBalloon(balloonText);
                    config.setPermWarningShown(true);
                }
            };
        }
    };
};