Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window,
    getAllowSetFileNameAtSimpleUpload(), getCurrentFolder(),
    gridItemExists(), isModifyAllowed(), openGridFolder(),
    showBalloon(), getExtEl(), getEnableMultipleUploader(),
    getRenderers(), getUid(), getAppRootUrl(), openTreeRecent()
*/
HttpCommander.Lib.SimpleUpload = function (config) {
    var self, multiUploadXType = 'multiplefileuploadfield',
        uploadXType = config.getAllowSetFileNameAtSimpleUpload()
            ? 'fileuploadfield'
            : multiUploadXType,
        html5 = new HttpCommander.Lib.Html5ChunkedUpload({
            url: config.htcConfig.relativePath + 'Handlers/ChunkedUpload.ashx',
            chunkSize: 262144
        });
    var chunked = html5 && html5.available;

    var uploadItems = [
        { itemId: 'simple-upload-notes', xtype: 'label' },
        { xtype: uploadXType, hideLabel: true, buttonText: config.htcConfig.locData.UploadBrowseLabel },
        { xtype: uploadXType, hideLabel: true, buttonText: config.htcConfig.locData.UploadBrowseLabel },
        { xtype: uploadXType, hideLabel: true, buttonText: config.htcConfig.locData.UploadBrowseLabel }
    ];
    if (chunked) {
        uploadItems.push({ itemId: 'simple-upload-chunked-label', xtype: 'label', visible: false },
        {
            itemId: 'simple-upload-chunked',
            xtype: multiUploadXType,
            hideLabel: true,
            buttonText: config.htcConfig.locData.UploadBrowseLabel,
            chunkedUpload: true,
            onchangeForChunked: html5.addFiles
        });
    } else {
        uploadItems.push({ xtype: uploadXType, hideLabel: true, buttonText: config.htcConfig.locData.UploadBrowseLabel });
    }
    if (HttpCommander.Lib.Utils.browserIs.dndFolders) {
        uploadItems.push({
            itemId: 'simple-upload-checkboxes',
            xtype: 'container',
            anchor: '100%',
            layout: 'column',
            items: [{
                itemId: 'simple-upload-folders-checkbox',
                xtype: 'checkbox',
                checked: false,
                hideLabel: true,
                columnWidth: .35,
                boxLabel: '<img alt="" style="vertical-align:middle;" width="16" height="16" src="'
                    + HttpCommander.Lib.Utils.getIconPath(config, 'folder')
                    + '"/>&nbsp;' + config.htcConfig.locData.UploadSimpleUploadFolderLabelCollapsed,
                listeners: {
                    check: function (cb, checked) {
                        var container = self.getComponent('simple-upload-checkboxes');
                        var ufCmp = self.getComponent('simple-upload-folders');
                        ufCmp.el.dom.parentNode.parentNode.parentNode.style.visibility = checked ? 'visible' : 'hidden';
                        var ipCmp = container.items.items[1];
                        ipCmp.setVisible(checked);
                        ipCmp.el.dom.parentNode.style.display = checked ? '' : 'none';
                        if (!checked) {
                            ufCmp.reset();
                            ipCmp.reset();
                        }
                    }
                }
            }, {
                itemId: 'simple-upload-ignore-path',
                xtype: 'checkbox',
                checked: false,
                columnWidth: .65,
                hideLabel: true,
                boxLabel: config.htcConfig.locData.UploadJavaIgnorePaths,
                hidden: true
            }]
        }, {
            hideLabel: true,
            buttonText: config.htcConfig.locData.UploadSimpleUploadFolderButtonText + '...',
            itemId: 'simple-upload-folders',
            xtype: multiUploadXType,
            anchor: '100%',
            uploadFolders: true,
            listeners: {
                afterrender: function (f) {
                    f.el.dom.parentNode.parentNode.parentNode.style.visibility = 'hidden';
                }
            }
        });
    }
    var additionalHeight = 0;
    if (config.htcConfig.uploadFormFields && config.htcConfig.uploadFormFields.length > 0) {
        var typeConversion = { "text": "textfield", "checkbox": "checkbox", "multiline": "textarea", "select": "combo" };
        uploadFormFields = [];
        additionalHeight = 20;
        Ext.each(config.htcConfig.uploadFormFields, function (uploadField) {
            var selectData = [];

            if (uploadField.type == 'select') {
                Ext.each(uploadField.values, function (val) {
                    selectData.push([val, val]);
                });
            }

            additionalHeight += 50


            uploadFormFields.push({
                itemId: 'uploadFormField_' + uploadField.name + '_Label',
                xtype: 'label',
                text: uploadField.description
            });
            if (uploadField.type == 'select') {
                uploadFormFields.push({
                    itemId: 'uploadFormField_' + uploadField.name,
                    name: 'uploadFormField_' + uploadField.name,
                    xtype: typeConversion[uploadField.type],
                    hideLabel: true,
                    lazyInit: false,
                    lazyRender: false,
                    store: new Ext.data.ArrayStore({
                        id: 0,
                        fields: [
                                'valueID',
                                'displayText'],
                        data: selectData
                    }),
                    //this method used to fix issue with z-index of x-combo-list 
                    /*getListParent: function () {
                        return this.ownerCt.getEl();
                    },*/
                    autoShow: true,
                    mode: 'local',
                    editable: false,
                    typeAhead: false,
                    autoSelect: true,
                    selectOnFocus: true,
                    triggerAction: 'all',
                    valueField: 'valueID',
                    displayField: 'displayText',
                    validator: uploadField.required ? function (value) {
                        return value ? true : "Value is required";
                    } : null
                });
            } else {
                uploadFormFields.push({
                    itemId: 'uploadFormField_' + uploadField.name,
                    name: 'uploadFormField_' + uploadField.name,
                    xtype: typeConversion[uploadField.type],
                    fieldLabel: uploadField.name,
                    hideLabel: true,
                    validator: uploadField.required ? function (value) {
                        return value ? true : "Value is required";
                    } : null
                });
            }
        });
        uploadItems.push({
            xtype: 'fieldset',
            collapsible: false,
            autoHeight: true,
            defaults: { anchor: '90%' },
            anchor: '100%',
            defaultType: 'textfield',
            items: uploadFormFields
        });
    }

    var showError = function (message) {
        config.Msg.show({
            title: config.htcConfig.locData.CommonErrorCaption,
            msg: message || 'Unknown error',
            icon: config.Msg.ERROR,
            buttons: config.Msg.CANCEL
        });
    };

    self = new Ext.FormPanel({
        fileUpload: true,
        frame: false,
        bodyStyle: 'padding: 5px 5px 0 5px;',
        border: false,
        bodyBorder: false,
        header: false,
        defaults: { anchor: (HttpCommander.Lib.Utils.browserIs.ie && config.htcConfig.styleName && config.htcConfig.styleName.indexOf("azzurra") >= 0) ? '95%' : '100%' },
        labelWidth: 40,
        additionalHeight: additionalHeight,
        items: uploadItems,
        'resetFields': function () {
            self.getForm().reset();
            var chunkedUploadField = self.getComponent('simple-upload-chunked');
            if (!!chunkedUploadField) {
                chunkedUploadField.reset();
            }
            if (chunked) {
                html5.clearList();
            }
        },
        buttons:
        [
            {
                text: config.htcConfig.locData.UploadSimpleReset,
                handler: function () {
                    self.resetFields();
                }
            },
            {
                text: config.htcConfig.locData.UploadSimpleUpload,
                handler: function () {
                    if (self.getForm().isValid()) {
                        var curFolder = config.getCurrentFolder();

                        if (!curFolder) {
                            config.Msg.alert(
                                config.htcConfig.locData.UploadFolderNotSelectedTitle,
                                config.htcConfig.locData.UploadFolderNotSelected
                            );
                            return;
                        }
                        if (!config.htcConfig.currentPerms || !config.htcConfig.currentPerms.upload) {
                            config.Msg.alert(
                                config.htcConfig.locData.UploadNotAllowedTitle,
                                config.htcConfig.locData.UploadNotAllowedPrompt
                            );
                            return;
                        }

                        var showWarning = false;
                        var notEmpty = false;

                        var ignorePath = true;
                        var container = null;
                        if (container = self.getComponent('simple-upload-checkboxes')) {
                            var ignPthCmp = container.items.items[1];
                            if (ignPthCmp && ignPthCmp.isVisible()) {
                                ignorePath = ignPthCmp.getValue();
                            }
                        }

                        Ext.each(self.getForm().items.items, function (el) {
                            if (el.xtype != 'checkbox') {
                                var files = el.getFiles ? el.getFiles() : el.value;
                                if (files) {
                                    if (typeof files == 'string') {
                                        var value;
                                        if (value = el.getValue() || el.value) {
                                            notEmpty = true;
                                            var slashIndex = value.lastIndexOf('\\');
                                            if (slashIndex < 0)
                                                slashIndex = value.lastIndexOf('/');
                                            if (slashIndex != -1)
                                                value = value.substring(slashIndex + 1);
                                            if (config.gridItemExists(value))
                                                showWarning = true;
                                        }
                                    } else for (var i = 0; i < files.length; i++) {
                                        if (files[i].name === '.')
                                            continue;
                                        notEmpty = true;
                                        var fileOrFolderName = '';
                                        if (!ignorePath && files[i].webkitRelativePath && files[i].webkitRelativePath != '') {
                                            fileOrFolderName = files[i].webkitRelativePath.split(/[\/\\]/)[0];
                                        }
                                        if (!fileOrFolderName || fileOrFolderName.length == 0)
                                            fileOrFolderName = files[i].name;
                                        if (config.gridItemExists(fileOrFolderName))
                                            showWarning = true;
                                    }
                                }
                            }
                        });

                        if (!notEmpty)
                            return;

                        if (showWarning) {
                            var modify = config.isModifyAllowed();
                            var showQuestion = modify && !HttpCommander.Lib.Utils.browserIs.ios;
                            config.Msg.show({
                                title: config.htcConfig.locData.UploadFilesAlreadyExists,
                                msg: showQuestion
                                    ? String.format(config.htcConfig.locData.UploadOverwriteOrRenameFiles,
                                        config.htcConfig.locData.ExtMsgButtonTextYES,
                                        config.htcConfig.locData.ExtMsgButtonTextNO
                                      )
                                    : config.htcConfig.locData.UploadRenamedExistingFiles,
                                buttons: showQuestion ? config.Msg.YESNOCANCEL : config.Msg.OKCANCEL,
                                icon: showQuestion ? config.Msg.QUESTION : config.Msg.INFO,
                                fn: function (btn) {
                                    if (btn == 'ok' || btn == 'yes' || btn == 'no') {
                                        self.uploadFiles(curFolder, btn == 'ok' || btn == 'no');
                                    }
                                }
                            });
                        } else {
                            self.uploadFiles(curFolder, true);
                        }
                    }
                }
            }
        ],
        uploadFiles: function (uploadFolderPath, rename) {
            var uploadInfoForChunked = {
                'Path': uploadFolderPath
            };
            var uploadUrl = config.htcConfig.relativePath + 'Handlers/Upload.ashx?path='
                + encodeURIComponent(uploadFolderPath);
            if (rename || HttpCommander.Lib.Utils.browserIs.ios) {
                uploadUrl += '&rename=true';
                uploadInfoForChunked['Rename'] = 'true';
            }
            var container = null;
            if (container = self.getComponent('simple-upload-checkboxes')) {
                var ignPthCmp = container.items.items[1];
                if (ignPthCmp && ignPthCmp.isVisible()) {
                    var ignPths = ignPthCmp.getValue();
                    uploadUrl += '&ignorepath=' + ignPths;
                    uploadInfoForChunked['IgnorePath'] = '' + ignPths;
                }
            }
            if (config.getAllowSetFileNameAtSimpleUpload()) {
                var newFileNames = '';
                for (var i = 0, items = self.getForm().items.items, l = items.length; i < l; i++) {
                    var el = items[i];
                    var origVal, newVal;
                    if ((origVal = el.value) && (newVal = el.getValue())) {
                        var slashIndex = origVal.lastIndexOf('\\');
                        if (slashIndex < 0)
                            slashIndex = origVal.lastIndexOf('/');
                        if (slashIndex != -1) {
                            origVal = origVal.substring(slashIndex + 1);
                        }
                        slashIndex = newVal.lastIndexOf('\\');
                        if (slashIndex < 0)
                            slashIndex = newVal.lastIndexOf('/');
                        if (slashIndex != -1) {
                            newVal = newVal.substring(slashIndex + 1);
                        }
                        if (origVal.toLowerCase() !== newVal.toLowerCase() && newVal.trim() != '') {
                            newFileNames += '&fileName' + String(i) + '=' + encodeURIComponent(newVal);
                        }
                    }
                }
                uploadUrl += newFileNames;
            }
            var loadingMsg = config.Msg.show({
                title: config.htcConfig.locData.CommonProgressPleaseWait,
                msg: "<img src='" + HttpCommander.Lib.Utils.getIconPath(config, 'ajax-loader.gif') + "' class='filetypeimage'>&nbsp;"
                    + config.htcConfig.locData.UploadInProgress + "...",
                closable: false,
                modal: true,
                width: 220,
                buttons: { cancel: config.htcConfig.locData.StopUploadingButtonText },
                fn: self.stopUpload,
                scope: self
            });
            var chunkedUploadField = self.getComponent('simple-upload-chunked');
            if (chunkedUploadField && Ext.isFunction(chunkedUploadField.setFileInputDisabled)) {
                chunkedUploadField.setFileInputDisabled(true);
            }
            var uploadResult = null,
                uploadChunked = chunked && html5.getFilesCount() > 0;
            var onUploadComplete = function (form, action) {
                var uploadResultExist = true;
                if (!uploadResult) {
                    uploadResultExist = false;
                    uploadResult = {
                        filesSaved: action && action.result ? (action.result.filesSaved || 0) : 0,
                        filesRejected: action && action.result ? (action.result.filesRejected || 0) : 0,
                        msg: action && action.result ? action.result.msg : null
                    };
                    if (uploadResult.filesSaved < 0)
                        uploadResult.filesSaved = 0;
                    if (uploadResult.filesRejected < 0)
                        uploadResult.filesRejected = 0;
                    if (uploadChunked)
                        return;
                }

                if (chunkedUploadField && Ext.isFunction(chunkedUploadField.setFileInputDisabled))
                    chunkedUploadField.setFileInputDisabled(false);
                config.Msg.hide();

                if (uploadResultExist && action && action.result) {
                    if (action.result.filesSaved)
                        uploadResult.filesSaved += action.result.filesSaved;
                    if (action.result.filesRejected > 0)
                        uploadResult.filesRejected += action.result.filesRejected;
                    if (action.result.msg)
                        uploadResult.msg = action.result.msg;
                }

                if (action && action.failureType) {
                    switch (action.failureType) {
                        case Ext.form.Action.CLIENT_INVALID:
                            uploadResult.msg = config.htcConfig.locData.UploadInvalidFormFields;
                            break;
                        case Ext.form.Action.CONNECT_FAILURE:
                            uploadResult.msg = config.htcConfig.locData.UploadAjaxFailed;
                            break;
                        case Ext.form.Action.SERVER_INVALID:
                        case Ext.form.Action.LOAD_FAILURE:
                            if (action.result && action.result.responseNotParsed && action.response) {
                                if (action.response.url && (String(action.response.url)).toLowerCase()
                                    .indexOf(config.getAppRootUrl().toLowerCase() + 'default.aspx') == 0) {
                                    window.location.href = action.response.url.split('?')[0];
                                    return;
                                } else if (action.response && action.response.responseText) {
                                    var serverMessage = action.response.responseText;
                                    var onClickShowErrorElement = "<a href='#' onclick='HttpCommander.Main.FileManagers[" + '"' + config.getUid() + '"' + "].showPageError();return false;'>";
                                    uploadResult.msg = String.format(config.htcConfig.locData.SimpleUploadErrorInfo, onClickShowErrorElement);
                                    if (!HttpCommander.Main.FileManagers[config.getUid()].showPageError) {
                                        HttpCommander.Main.FileManagers[config.getUid()].showPageError = function () {
                                            if (serverMessage) {
                                                var windowError = window.open('', '_blank');
                                                windowError.document.write(serverMessage);
                                            }
                                        }
                                    }
                                }
                            }
                            break;
                    }
                }

                if (uploadResult.filesSaved > 0 || !uploadResult.msg) {
                    config.openTreeRecent();
                    config.openGridFolder(uploadFolderPath);
                    var balloonText = String.format(config.htcConfig.locData.BalloonFilesUploaded,
                        uploadResult.filesSaved);
                    if (uploadResult.filesRejected > 0)
                        balloonText += '<br />' + String.format(config.htcConfig.locData.BalloonFilesNotUploaded,
                            uploadResult.filesRejected) + (uploadResult.msg ? ('<br />' + uploadResult.msg) : '');
                    config.showBalloon(balloonText);
                } else {
                    showError(uploadResult.msg); //config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, uploadResult.msg);
                }
            };
            self.getForm().submit({
                url: uploadUrl,
                success: onUploadComplete,
                failure: onUploadComplete
            });
            var onFileUploadProgress = function (file, progressInfo) {
                var percent = Math.round(progressInfo.uploadedSize / progressInfo.totalSize * 100);
                loadingMsg.updateText( "<img src='" + HttpCommander.Lib.Utils.getIconPath(config, 'ajax-loader.gif') + "' class='filetypeimage'>&nbsp;"
                    + config.htcConfig.locData.UploadInProgress + "... (" + percent + "%)");
            };
            if (uploadChunked) {
                html5.setUploadInfo(uploadInfoForChunked);
                html5.options.onUploadComplete = onUploadComplete;
                html5.options.onFileUploadProgress = onFileUploadProgress;
                html5.options.customFormFields = [];
                Ext.each(self.getForm().items.items, function (item) {
                    if (item.getName() && item.getName().indexOf("uploadFormField_") >= 0)
                        html5.options.customFormFields.push({ "name": item.getName(), "value": item.getValue() });
                });
                html5.upload();
            }
        },
        stopUpload: function () {
            var upload_frame = config.getExtEl().child('iframe.x-hidden:last');
            if (upload_frame) {
                if (HttpCommander.Lib.Utils.browserIs.ie)
                    window.frames[upload_frame.id].window.document.execCommand('Stop');
                else
                    window.frames[upload_frame.id].window.stop();
            }
            var chunkedUploadField = self.getComponent('simple-upload-chunked');
            if (chunkedUploadField && Ext.isFunction(chunkedUploadField.setFileInputDisabled)) {
                chunkedUploadField.setFileInputDisabled(false);
            }
            if (chunked) {
                html5.stop();
            }
            config.Msg.hide();
            config.openTreeRecent();
            var curFolder = config.getCurrentFolder();
            config.openGridFolder(curFolder);
            config.showBalloon(htcConfig.locData.BalloonAbortFilesUploaded);
        },
        compileNote: function () {
            var mus = config.htcConfig.maxUploadSize && config.htcConfig.maxUploadSize != '-1'
                ? config.htcConfig.maxUploadSize : '2147483648';
            var notes = self.getComponent('simple-upload-notes');
            if (notes) {
                notes.setText('');
                var notesContent = '';
                if (config.getEnableMultipleUploader()) {
                    notesContent = config.htcConfig.locData.MultipleFileInputMessage;
                }
                if (!HttpCommander.Lib.Utils.browserIs.dndFolders &&
                    !HttpCommander.Lib.Utils.browserIs.ios &&
                    config.htcConfig.currentPerms && config.htcConfig.currentPerms.unzip) {
                    if (notesContent != '') {
                        notesContent += '<br />';
                    }
                    notesContent += String.format(config.htcConfig.locData.UploadZipUnzipNote,
                        config.htcConfig.locData.CommandUnzip);
                }
                if (config.getAllowSetFileNameAtSimpleUpload() === true) {
                    if (notesContent != '') {
                        notesContent += '<br />';
                    }
                    notesContent += config.htcConfig.locData.SimpleUploadSetFileNameNote;
                }
                if (mus) {
                    if (notesContent != '') {
                        notesContent += '<br />';
                    }
                    notesContent += '&lt; ' + config.getRenderers().sizeRenderer(mus) + ':';
                }
                notes.el.dom.innerHTML = notesContent;
            }
            var chunkedLabel = self.getComponent('simple-upload-chunked-label');
            if (chunkedLabel) {
                chunkedLabel.setVisible(chunked);
                if (chunked) {
                    chunkedLabel.setText('> ' + config.getRenderers().sizeRenderer(mus) + ':');
                }
            }
        }
    });

    return self;
};