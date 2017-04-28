Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, getIsEmbeddedtoIFRAME(), globalLoadMask,
showBalloon(), getCurrentFolder(), openGridFolder(), setSelectPath(),
openTreeRecent()
*/
HttpCommander.Lib.EditTextFileWindow = function (config) {
    var aceEditor = null;
    var self = new config.Window({
        title: '',
        /*layout: {
            type: 'vbox',
            align: 'stretch',
            padding: 0
        },*/
        layout: 'fit',
        resizable: true,
        closeAction: 'hide',
        minimizable: false,
        maximizable: true,
        border: false,
        plain: true,
        width: config.getIsEmbeddedtoIFRAME() ? 450 : 600,
        height: config.getIsEmbeddedtoIFRAME() ? 250 : 300,
        fileInfo: { // custom field, information about the edited file
            path: '',
            name: '',
            encoding: ''
        },
        defaults: {
            anchor: '100%'
        },
        items: [{/* xtype: 'textarea', flex: 1 */
            xtype: 'panel',
            border: false,
            width: '100%',
            height: '100%',
            flex: 1,
            anchor: '100%'
        }],
        buttonAlign: 'left',
        buttons: [{
            itemId: 'word-wrap',
            xtype: 'checkbox',
            boxLabel: config.htcConfig.locData.CommonWordWrap,
            checked: true,
            listeners: {
                check: function (cb, checked) {
                    if (aceEditor) {
                        aceEditor.setOption('wrap', checked ? 'free' : 'off');
                    }
                }
            }
        }, '->', {
            text: config.htcConfig.locData.CommandSave,
            handler: function () {
                self.saveTextFile();
            }
        }, {
            text: config.htcConfig.locData.CommonButtonCaptionCancel,
            handler: function () {
                self.hide();
                //self.items.items[0].setValue(""); // to free memory
                if (aceEditor) {
                    aceEditor.getSession().setValue('');
                }
            }
        }],
        listeners: {
            resize: function (winSelf, width, height) {
                if (aceEditor) {
                    var st = setTimeout(function () {
                        clearTimeout(st);
                        if (aceEditor) {
                            aceEditor.resize(true);
                        }
                    }, 200);
                }
            }
        },
        saveTextFile: function () {
            if (!aceEditor) {
                return;
            }
            var content = aceEditor.getSession().getValue(); //String(self.items.items[0].getValue());
            /* Add \r symbols before \n, if not exists */
            if (content.indexOf('\r\n') < 0) {
                content = content.replace(/\n/g, '\r\n');
            }
            var fileInfo = {
                path: self.fileInfo.path,
                name: self.fileInfo.name,
                encoding: self.fileInfo.encoding,
                content: content
            };
            config.globalLoadMask.msg = config.htcConfig.locData.ProgressSavingEdit + "...";
            config.globalLoadMask.show();
            HttpCommander.Common.Save(fileInfo, function (data, trans) {
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                            data, trans, config.Msg, config.htcConfig)) {
                    config.showBalloon(config.htcConfig.locData.BalloonSavedSuccessfully);
                    var curFolder = fileInfo.path;
                    if (!Ext.isEmpty(curFolder) && !Ext.isEmpty(fileInfo.name)) {
                        config.setSelectPath({
                            name: fileInfo.name,
                            path: curFolder
                        });
                    }
                    config.openTreeRecent();
                    config.openGridFolder(curFolder);
                }
            });
        },
        loadTextFileImpl: function (fileInfo, readOnly) {
            HttpCommander.Common.Open(fileInfo, function (data, trans) {
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                            data, trans, config.Msg, config.htcConfig)) {
                    var content = data.content;
                    //self.items.items[0].setValue(content);
                    self.setTitle(Ext.util.Format.htmlEncode(fileInfo.name));
                    self.fileInfo.path = fileInfo.path;
                    self.fileInfo.name = fileInfo.name;
                    self.fileInfo.encoding = data.encoding;

                    if (typeof window.ace != 'undefined') {
                        self.buttons[2].setVisible(!(readOnly === true));
                        self.show();

                        if (!aceEditor) {
                            aceEditor = ace.edit(self.items.items[0].body.id);
                            //aceEditor.setTheme("ace/theme/eclipse");
                            aceEditor.$blockScrolling = Infinity;
                            aceEditor.setShowInvisibles(true);
                            aceEditor.setOption('wrap', 'free');
                            aceEditor.setHighlightSelectedWord(true);
                        }

                        modelist = ace.require("ace/ext/modelist");
                        mode = modelist.getModeForPath(self.fileInfo.name).mode;
                        aceEditor.getSession().setMode(mode);

                        aceEditor.getSession().setValue(content);

                        aceEditor.setReadOnly((readOnly === true));

                        config.openTreeRecent();

                        setTimeout(function () {
                            if (aceEditor) {
                                try { aceEditor.focus(); }
                                catch (e) { }
                            }
                        }, 100);
                    }
                }
            });
        },
        loadTextFile: function (record, path, readOnly) {
            self.hide();
            var fileInfo = {
                path: '',
                name: ''
            }, modelist, mode;
            fileInfo.path = path;
            fileInfo.name = record.data.name;
            if (fileInfo.path == '' || fileInfo.name == '')
                return;
            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoadingEdit + "...";
            config.globalLoadMask.show();
            if (typeof window.ace == 'undefined') {
                HttpCommander.Lib.Utils.includeJsFile({
                    url: scriptSource.substring(0, scriptSource.lastIndexOf('/')) + '/ace/ace.js',
                    callback: function () {
                        if (typeof window.ace == 'undefined') {
                            config.globalLoadMask.hide();
                            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                            config.Msg.alert(config.htcConfig.locData.CommonErrorCaption,
                                config.htcConfig.locData.AceNotLoadedMessage);
                            return;
                        }
                        HttpCommander.Lib.Utils.includeJsFile({
                            url: scriptSource.substring(0, scriptSource.lastIndexOf('/')) + '/ace/ext-modelist.js',
                            callback: function () {
                                self.loadTextFileImpl.call(self, fileInfo, readOnly);
                            }
                        });
                    }
                });
            } else {
                self.loadTextFileImpl.call(self, fileInfo, readOnly);
            }
        }
    });
    return self;
};