Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, globalLoadMask, getIsEmbeddedtoIFRAME(), showBalloon(),
openGridFolder()
*/
HttpCommander.Lib.CheckInWindow = function (config) {
    var window = new config.Window({
        title: '',
        plain: true,
        bodyStyle: 'padding:5px',
        modal: true,
        width: config.getIsEmbeddedtoIFRAME() ? 250 : 300,
        autoHeight: true,
        layout: 'fit',
        closeAction: 'hide',
        fileInfo: {},
        items:
        [
            new Ext.FormPanel({
                itemId: 'check-in-form-panel',
                baseCls: 'x-plain',
                frame: false,
                fileUpload: true,
                autoHeight: true,
                defaults: { anchor: '100%' },
                labelAlign: 'top',
                items:
                [
                    {
                        itemId: 'check-in-label',
                        xtype: 'label',
                        html: config.htcConfig.locData.FileUploadCheckInLabel + "<hr />"
                    },
                    {
                        itemId: 'check-in-notes',
                        name: 'check-in-notes',
                        xtype: 'textarea',
                        height: 45,
                        fieldLabel: config.htcConfig.locData.VersionHistoryGridNotesColumn
                    },
                    {
                        itemId: 'check-in-upload-field',
                        name: 'check-in-upload-field',
                        hideLabel: true,
                        xtype: 'fileuploadfield'
                    }
                ]
            })
        ],
        listeners: {
            show: function (window) {
                window.getComponent('check-in-form-panel').getForm().reset();
            }
        },
        buttons:
        [
            {
                text: config.htcConfig.locData.CommandCheckIn,
                handler: function () {
                    var fileInfo = window.fileInfo;
                    fileInfo.notes = window.getComponent('check-in-form-panel').getComponent('check-in-notes').getValue();

                    var fupf = window.items.items[0].getForm();
                    var upFileName = window.getComponent('check-in-form-panel').getComponent('check-in-upload-field').value;

                    if (upFileName != '') {
                        var slashIndex = upFileName.lastIndexOf('\\');
                        if (slashIndex != -1)
                            upFileName = upFileName.substring(slashIndex + 1);
                        if (upFileName.toLowerCase() != fileInfo.name.toLowerCase()) {
                            config.Msg.alert(config.htcConfig.locData.CommonErrorCaption,
                                config.htcConfig.locData.FileUploadCheckInInvalidFileName);
                            return;
                        }
                        config.globalLoadMask.msg = config.htcConfig.locData.CheckingInMessage + "...";
                        config.globalLoadMask.show();
                        fupf.submit({
                            url: config.htcConfig.relativePath + 'Handlers/Upload.ashx?checkin='
                                + encodeURIComponent(fileInfo.name)
                                + '&path=' + encodeURIComponent(fileInfo.path),
                            success: function (form, action) {
                                config.globalLoadMask.hide();
                                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                                window.hide();
                                config.showBalloon(String.format(
                                    config.htcConfig.locData.SuccessfullyCheckedInMessage,
                                    Ext.util.Format.htmlEncode(fileInfo.name),
                                    Ext.util.Format.htmlEncode(config.htcConfig.currentUser))
                                );
                                config.openGridFolder(fileInfo.path);
                            },
                            failure: function (form, action) {
                                config.globalLoadMask.hide();
                                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                                switch (action.failureType) {
                                    case Ext.form.Action.CLIENT_INVALID:
                                        config.Msg.alert(config.htcConfig.locData.CommonErrorCaption,
                                            config.htcConfig.locData.UploadInvalidFormFields
                                        );
                                        break;
                                    case Ext.form.Action.CONNECT_FAILURE:
                                        config.Msg.alert(config.htcConfig.locData.CommonErrorCaption,
                                            config.htcConfig.locData.UploadAjaxFailed
                                        );
                                        break;
                                    case Ext.form.Action.SERVER_INVALID:
                                        config.Msg.alert(config.htcConfig.locData.CommonErrorCaption,
                                            action.result.msg || action.result.message
                                        );
                                        break;
                                }
                                config.openGridFolder(fileInfo.path);
                            }
                        });
                    } else {
                        config.globalLoadMask.msg = config.htcConfig.locData.CheckingInMessage + "...";
                        config.globalLoadMask.show();
                        HttpCommander.Common.CheckIn(fileInfo, function (data, trans) {
                            config.globalLoadMask.hide();
                            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                            if (!HttpCommander.Lib.Utils.checkDirectHandlerResult(
                                        data, trans, config.Msg, config.htcConfig)) {
                                if (typeof data != 'undefined') {
                                    config.openGridFolder(fileInfo.path);
                                }
                            } else {
                                window.hide();
                                config.showBalloon(String.format(config.htcConfig.locData.SuccessfullyCheckedInMessage,
                                    Ext.util.Format.htmlEncode(fileInfo.name),
                                    Ext.util.Format.htmlEncode(config.htcConfig.currentUser)
                                ));
                                config.openGridFolder(fileInfo.path);
                            }
                        });
                    }
                }
            },
            {
                text: config.htcConfig.locData.UploadSimpleReset,
                handler: function () { window.items.items[0].getForm().reset(); }
            },
            {
                text: config.htcConfig.locData.CommonButtonCaptionCancel,
                handler: function () { window.hide(); }
            }
        ]
    });
    return window;
};