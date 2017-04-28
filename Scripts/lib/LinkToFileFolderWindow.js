Ext.ns('HttpCommander.Lib');

/**
 *  config: htcConfig, Msg, Window, linkToOpenFolderByVirtPath(), linkToFileByVirtPath(),
 *  linkToSelectFileByVirtPath(), showBalloon()
 */
HttpCommander.Lib.LinkToFileFolderWindow = function (config) {
    var linkToFileFolderHint, linkToFileFolderUrl, linkToSelectFileHint, linkToSelectFileUrl;
    var ctcIcon = config.htcConfig.relativePath + 'Images/ctc.png',
        ctcHint = config.htcConfig.locData.CommandCopyToClipboard;
    var window = new config.Window({
        title: config.htcConfig.locData.LinkToFileTitle,
        bodyStyle: 'padding:5px',
        resizable: true,
        plain: true,
        closeAction: 'hide',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        width: 350,
        height: 250,
        minHeight: 190,
        minWidth: 300,
        virtPath: "", // virtual path of the file or folder
        isFolder: false, // true if the virtPath points to folder (vs file)
        defaults: { anchor: '100%' },
        items: [
            linkToFileFolderHint = new Ext.form.Label({
                hideLabel: true,
                autoHeight: true,
                cls: 'x-form-item',
                text: '&nbsp;'
            }),
            linkToFileFolderUrl = new Ext.ux.AreaCopyToClipboard({
                autoScroll: true,
                hideLabel: true,
                flex: 1,
                selectOnFocus: true,
                readOnly: true,
                ctcIcon: ctcIcon,
                ctcHint: ctcHint,
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
            }),
            linkToSelectFileHint = new Ext.form.Label({
                hideLabel: true,
                autoHeight: true,
                hidden: true,
                cls: 'x-form-item',
                text: config.htcConfig.locData.LinkToFileOpenFileLink
            }),
            linkToSelectFileUrl = new Ext.ux.AreaCopyToClipboard({
                autoScroll: true,
                hideLabel: true,
                flex: 1,
                selectOnFocus: true,
                readOnly: true,
                hidden: true,
                ctcIcon: ctcIcon,
                ctcHint: ctcHint,
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
            })
        ],
        buttons: [{
            text: config.htcConfig.locData.CommonButtonCaptionClose,
            handler: function () { window.hide(); }
        }],
        listeners: {
            beforeshow: function (window) {
                if (linkToFileFolderHint) {
                    linkToFileFolderHint.setText(String.format(
                        (window.isFolder ? config.htcConfig.locData.LinkToFileOpenFolderLink : config.htcConfig.locData.LinkToFileDownloadFileLink),
                        "<b>" + Ext.util.Format.htmlEncode(window.virtPath) + "</b>", config.htcConfig.appName
                        ), false);
                }
                if (linkToFileFolderUrl) {
                    linkToFileFolderUrl.setValue(window.isFolder ?
                        config.linkToOpenFolderByVirtPath(window.virtPath) :
                        config.linkToFileByVirtPath(window.virtPath)
                    );
                }
                if (linkToSelectFileUrl) {
                    if (!window.isFolder) {
                        linkToSelectFileUrl.setValue(config.linkToSelectFileByVirtPath(window.virtPath));
                        linkToSelectFileUrl.flex = 1;
                        window.setHeight(250);
                        linkToSelectFileHint.show();
                        linkToSelectFileUrl.show();
                    } else {
                        linkToSelectFileUrl.flex = 0;
                        linkToSelectFileUrl.hide();
                        linkToSelectFileHint.hide();
                        window.setHeight(190);
                    }
                }
            },
            show: function (window) {
                window.center();
                window.doLayout();
                window.syncSize();
                if (linkToFileFolderUrl)
                    linkToFileFolderUrl.focus(true);
            }
        }
    });
    return window;
};