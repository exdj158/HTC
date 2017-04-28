Ext.ns('HttpCommander.Lib');

/* config: htcConfig, getUid(), getRenderers(), getCurrentFolder(),
openGridFolder(), setPermWarningShown()
getPermWarningShown(), showBalloon(), getUploadWindow(), $(), openTreeRecent()
*/
HttpCommander.Lib.FlashUpload = function(config) {
    return {
        'html': HttpCommander.Lib.Utils.flashPlayerIsSupported()
                ? String.format(HttpCommander.Lib.Consts.uploadFlashText,
                  /*{0}*/config.getUid(),
                  /*{1}*/(config.htcConfig.maxUploadSize && config.htcConfig.maxUploadSize != '-1' ? String.format(config.htcConfig.locData.UploadOneFileMaxSizeMessage, config.getRenderers().sizeRenderer(config.htcConfig.maxUploadSize)) : '&nbsp;'),
                  /*{2}*/config.htcConfig.relativePath,
                  /*{3}*/config.htcConfig.twoLetterLangName)
                : HttpCommander.Lib.Consts.needInstallAdobeFlashPlayerMessage,
        'MultiPowUpload_onStart': function() {
            var flashUploadObject = window[config.$('MultiPowUpload')];
            var curFolder = config.getCurrentFolder();
            if (!curFolder) {
                window.alert(config.htcConfig.locData.UploadFolderNotSelected);
                flashUploadObject.cancelUpload();
                return;
            }
            if (!config.htcConfig.currentPerms || !config.htcConfig.currentPerms.upload) {
                window.alert(config.htcConfig.locData.UploadNotAllowedPrompt);
                flashUploadObject.cancelUpload();
                return;
            }
            //flashUploadObject.removePostField('path');
            flashUploadObject.addPostField('path', curFolder);
        },
        'MultiPowUpload_onComplete': function () {
            config.openTreeRecent();
            var curFolder = config.getCurrentFolder();
            if (curFolder) {
                config.openGridFolder(curFolder);
            }
            config.setPermWarningShown(false);
        },
        'MultiPowUpload_onServerResponse': function(file) {
            if (!config.getPermWarningShown()) {
                var result = window.eval('(' + file.serverResponse + ')');
                if (result.filesRejected > 0) {
                    var balloonText = config.htcConfig.locData.BalloonSomeFilesNotUploaded + '.<br />' + result.msg;
                    config.showBalloon(balloonText);
                    config.setPermWarningShown(true);
                }
            }
        },
        'MultiPowUpload_onMovieLoad': function() {
            var uploadWindow = config.getUploadWindow();
            uploadWindow.fireEvent('bodyresize',
                uploadWindow,
                uploadWindow.getInnerWidth(),
                uploadWindow.getInnerHeight());
            uploadWindow.focus();
        }
    };
};