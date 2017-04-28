Ext.ns('HttpCommander.Lib');

/**
 *  config: htcConfig, Msg, Window, globalLoadMask,
 *  getIsEmbeddedtoIFRAME(), openGridFolder(),
 *  isExtensionAllowed(), showBalloon(), getRenderers(),
 *  setSelectPath(), openTreeRecent()
 */
HttpCommander.Lib.CloudConvertWindow = function (config) {
    var window = new config.Window({
        title: '',
        plain: true,
        bodyStyle: 'padding:5px',
        modal: true,
        width: config.getIsEmbeddedtoIFRAME() ? 250 : 300,
        minWidth: 265,
        autoHeight: true,
        minHeight: 230,
        layout: 'form',//'fit',
        closeAction: 'hide',

        itemPath: null,
        itemName: null,
        outputFormats: null,

        buttonAlign: 'left',

        defaults: {
            anchor: '100%',
            hideMode: 'visibility'
        },

        items: [{
            xtype: 'displayfield',
            hideLabel: true,
            value: '<img width="24" height="24" src="' + HttpCommander.Lib.Utils.getIconPath(config, 'cloudconvert') + '" class="filetypeimage" />&nbsp;Powered by <a href="https://cloudconvert.com/" target="_blank">CloudConvert</a>'
        }, {
            xtype: 'combo',
            itemId: 'output-formats',
            autoSelect: true,
            allowBlank: false,
            editable: false,
            fieldLabel: config.htcConfig.locData.CloudConvertWindowOutputFormatsLabel,
            forceSelection: true,
            mode: 'local',
            store: new Ext.data.ArrayStore({
                idIndex: 0,
                autoDestroy: true,
                fields: ['format'],
                data: []
            }),
            valueField: 'format',
            displayField: 'format',
            tpl: '<tpl for="."><div class="x-combo-list-item">{format:htmlEncode}</div></tpl>',
            typeAhead: true,
            triggerAction: 'all',
            lazyRender: false,
            lazyInit: false,
            listClass: 'x-combo-list-small'
        }, {
            xtype: 'displayfield',
            hideLabel: true,
            hidden: true,
            itemId: 'download-link',
            value: config.htcConfig.locData.CloudConvertDownloadLinkLabel
        }, {
            itemId: 'download-link-text',
            xtype: 'textfield',
            hideLabel: true,
            selectOnFocus: true,
            readOnly: true,
            hidden: true
        }, {
            xtype: 'label',
            hidden: true,
            itemId: 'save-as-label',
            text: config.htcConfig.locData.CloudConvertSaveAsLabel
        }, {
            xtype: 'textfield',
            value: '',
            hideLabel: true,
            hidden: true,
            itemId: 'save-as-name',
            emptyText: config.htcConfig.locData.CloudConvertSaveAsNameBlank
        }, {
            xtype: 'hidden',
            value: '',
            itemId: 'last-converted-of'
        }],
        listeners: {
            show: function (window) {
                var self = window,
                    cb = self.getComponent('output-formats'),
                    lcof = self.getComponent('last-converted-of'),
                    downLink = self.getComponent('download-link'),
                    saveAsLbl = self.getComponent('save-as-label'),
                    saveAsTxt = self.getComponent('save-as-name'),
                    downLinkTxt = self.getComponent('download-link-text'),
                    newData = [], i = 0, len = self.outputFormats.length;
                for (; i < len; i++) {
                    newData.push([self.outputFormats[i]]);
                }
                cb.getStore().loadData(newData);
                cb.setValue(self.outputFormats[0]);
                lcof.setValue('');
                downLink.hide();
                downLinkTxt.hide();
                saveAsLbl.hide();
                saveAsTxt.hide();
                self.buttons[0].hide();
            }
        },
        buttons: [{
            text: config.htcConfig.locData.CommandSave,
            hidden: true,
            handler: function () {
                var self = window,
                    downLink = self.getComponent('download-link'),
                    downLinkTxt = self.getComponent('download-link-text'),
                    saveAsTxt = self.getComponent('save-as-name'),
                    newName = saveAsTxt.getValue(), pos = -1,
                    cb = self.getComponent('output-formats'),
                    lcof = self.getComponent('last-converted-of'),
                    ext = lcof.getValue(),
                    saveInfo = {
                        path: self.itemPath,
                        url: downLinkTxt.getValue()
                    };

                if (!ext || ext.trim().length == 0) {
                    return;
                }

                if (!newName || newName.trim().length == 0) {
                    newName = self.itemName;
                }

                pos = newName.lastIndexOf('.');
                if (pos < 0 || newName.substring(pos) != ('.' + ext)) {
                    newName += '.' + ext;
                }

                saveInfo.name = newName;

                config.globalLoadMask.msg = config.htcConfig.locData.ProgressCloudConvertUploading + "...";
                config.globalLoadMask.show();
                var pervAjaxTimeout = Ext.Ajax.timeout;
                Ext.Ajax.timeout = 10 * 60 * 1000; // 10 minutes maximum conversion time per file in CloudConvert free account
                HttpCommander.Common.CloudConvertSave(saveInfo, function (data, trans) {
                    Ext.Ajax.timeout = pervAjaxTimeout;
                    config.globalLoadMask.hide();
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                    if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                            data, trans, config.Msg, config.htcConfig, 2)) {
                        if (!Ext.isEmpty(data.newname || saveInfo.name) && !Ext.isEmpty(saveInfo.path)) {
                            config.setSelectPath({
                                name: data.newname || saveInfo.name,
                                path: saveInfo.path
                            });
                        }
                        config.openTreeRecent();
                        config.openGridFolder(saveInfo.path);
                        config.showBalloon(String.format(config.htcConfig.locData.UploadFromUrlSuccessMsg,
                            HttpCommander.Lib.Utils.checkBracketsAndHtmlEncode(data.newname || saveInfo.name),
                            Ext.util.Format.htmlEncode(saveInfo.url)));
                    }
                });
            }
        }, '->', {
            text: config.htcConfig.locData.CloudConvertWindowConvertButton,
            handler: function () {
                var self = window,
                    downLink = self.getComponent('download-link'),
                    saveAsLbl = self.getComponent('save-as-label'),
                    saveAsTxt = self.getComponent('save-as-name'),
                    downLinkTxt = self.getComponent('download-link-text'),
                    newName = self.itemName, pos = -1,
                    cb = self.getComponent('output-formats'),
                    lcof = self.getComponent('last-converted-of'),
                    convInfo = {
                        path: self.itemPath,
                        name: self.itemName,
                        of: cb.getValue()
                    };
                self.buttons[0].hide();
                downLink.hide();
                downLinkTxt.hide();
                saveAsLbl.hide();
                saveAsTxt.hide();
                saveAsTxt.setValue('');
                lcof.setValue('');
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressCloudConvertConverting + "...";
                config.globalLoadMask.show();
                var pervAjaxTimeout = Ext.Ajax.timeout;
                Ext.Ajax.timeout = 10 * 60 * 1000; // 10 minutes maximum conversion time per file in CloudConvert free account
                HttpCommander.Common.CloudConvertConvert(convInfo, function (data, trans) {
                    Ext.Ajax.timeout = pervAjaxTimeout;
                    config.globalLoadMask.hide();
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                    if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                            data, trans, config.Msg, config.htcConfig, 0)) {
                        if (data.url) {
                            downLinkTxt.setValue(data.url.indexOf('//') == 0 ? (location.protocol + data.url) : data.url);
                            if (config.htcConfig.currentPerms && config.htcConfig.currentPerms.download) {
                                var size = config.getRenderers().sizeRenderer(data.size);
                                if (size && size.length > 0) {
                                    size = ' (' + size + ')';
                                } else {
                                    size = '';
                                }
                                downLink.setValue(String.format('<a href="{0}" target="_blank">{1}</a>{2}:',
                                    Ext.util.Format.htmlEncode(data.url),
                                    config.htcConfig.locData.CloudConvertDownloadLinkLabel,
                                    size), false);
                                downLink.show();
                                downLinkTxt.show();
                            }
                            pos = newName.lastIndexOf('.');
                            newName = (pos >= 0 ? String(newName).substring(0, pos) : newName) + '.' + cb.getValue();
                            if (config.htcConfig.currentPerms && config.htcConfig.currentPerms.upload && config.isExtensionAllowed(newName, true)) {
                                saveAsLbl.show();
                                saveAsTxt.setValue(newName);
                                saveAsTxt.show();
                                self.buttons[0].show();
                                lcof.setValue(convInfo.of);
                            }
                        }
                    }
                });
            }
        }, {
            text: config.htcConfig.locData.CommonButtonCaptionCancel,
            handler: function () { window.hide(); }
        }]
    });
    return window;
};