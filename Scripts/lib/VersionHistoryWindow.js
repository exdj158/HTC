Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, globalLoadMask, getIsEmbeddedtoIFRAME(), getEmbedded(),
getRenderers(), openGridFolder()
*/
HttpCommander.Lib.VersionHistoryWindow = function (config) {
    var vhistGrid;
    var self = new config.Window({
        title: '',
        autoDestroy: true,
        plain: true,
        border: false,
        boxMinHeight: 250,
        boxMinWidth: config.getIsEmbeddedtoIFRAME() ? 350 : 500,
        layout: {
            type: 'vbox',
            align: 'stretch',
            padding: 0
        },
        fileInfo: {},
        resizable: true,
        closeAction: 'hide',
        maximizable: !config.getEmbedded(), //true,
        width: config.getIsEmbeddedtoIFRAME() ? 450 : 650,
        height: 250, // don't use height greater than 250 becouse it will rise problem at iframe mode
        items:
        [
            { itemId: 'file-path-vhist', xtype: 'hidden' },
            { itemId: 'file-name-vhist', xtype: 'hidden' },
            vhistGrid = new Ext.grid.GridPanel({
                header: false,
                loadMask: false,
                selModel: new Ext.grid.RowSelectionModel({
                    singleSelect: true,
                    listeners: {
                        selectionchange: function (sm) {
                            if (vhistGrid) {
                                var vhistTb = vhistGrid.getTopToolbar();
                                if (vhistTb)
                                    vhistTb.setDisabled(sm.getCount() < 1);
                            }
                        }
                    }
                }),
                store: new Ext.data.JsonStore({
                    autoSave: false,
                    storeId: 'vhistStore',
                    remoteSort: false,
                    pruneModifiedRecords: false,
                    autoLoad: true,
                    autoDestroy: true,
                    data: [],
                    idProperty: 'id',
                    fields:
                    [
                        { name: 'id', type: 'int' },
                        { name: 'size', type: 'int' },
                        { name: 'date', type: 'string' },
                        { name: 'user', type: 'string' },
                        { name: 'notes', type: 'string' }
                    ]
                }),
                tbar: new Ext.Toolbar({
                    items:
                    [
                        {
                            itemId: 'download-vhist',
                            disabled: true,
                            text: config.htcConfig.locData.CommandDownload,
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'download') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=download' : ''),
                            handler: function () {
                                var sRec;
                                if (vhistGrid)
                                    sRec = vhistGrid.getSelectionModel().getSelected();
                                if (sRec && self) {
                                    var verInfo = {};
                                    verInfo['path'] = self.getComponent('file-path-vhist').getValue();
                                    verInfo['name'] = self.getComponent('file-name-vhist').getValue();
                                    verInfo['date'] = sRec.data.date;
                                    verInfo['user'] = sRec.data.user;
                                    window.location.href = config.htcConfig.relativePath
                                        + "Handlers/Download.ashx?action=download&file="
                                        + encodeURIComponent(verInfo.path + "/" + verInfo.name)
                                        + "&version=" + encodeURIComponent(verInfo.date) + "_" + encodeURIComponent(verInfo.user);
                                }
                            }
                        },
                        {
                            itemId: 'restore-vhist',
                            disabled: true,
                            text: config.htcConfig.locData.CommandRestoreVersion,
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'restore') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=restore' : ''),
                            handler: function () {
                                var sRec;
                                if (vhistGrid)
                                    sRec = vhistGrid.getSelectionModel().getSelected();
                                if (sRec && self) {
                                    var verInfo = {};
                                    verInfo['path'] = self.getComponent('file-path-vhist').getValue();
                                    verInfo['name'] = self.getComponent('file-name-vhist').getValue();
                                    verInfo['date'] = sRec.data.date;
                                    verInfo['user'] = sRec.data.user;
                                    verInfo['newName'] = verInfo['name'];
                                    self.verInfo = verInfo;
                                    config.Msg.prompt(
                                        config.htcConfig.locData.FileVersionRestoreConfirmTitle,
                                        String.format(config.htcConfig.locData.FileVersionRestoreConfirmMessage, '<br />', '<br />'),
                                        self.confirmRestoreHandler,
                                        self,
                                        false,
                                        verInfo['newName']
                                    );
                                }
                            }
                        },
                        {
                            itemId: 'delete-vhist',
                            disabled: true,
                            text: config.htcConfig.locData.CommandDelete,
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'delete') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=delete' : ''),
                            handler: function () {
                                var sRec;
                                if (vhistGrid)
                                    sRec = vhistGrid.getSelectionModel().getSelected();
                                if (sRec && self) {
                                    var verInfo = {};
                                    verInfo['path'] = self.getComponent('file-path-vhist').getValue();
                                    verInfo['name'] = self.getComponent('file-name-vhist').getValue();
                                    verInfo['date'] = sRec.data.date;
                                    verInfo['user'] = sRec.data.user;
                                    self.verInfo = verInfo;
                                    config.Msg.confirm(
                                        config.htcConfig.locData.FileVersionDeleteConfirmTitle,
                                        config.htcConfig.locData.FileVersionDeleteConfirmMessage,
                                        self.confirmDeleteHandler,
                                        self
                                    );
                                }
                            }
                        }
                    ]
                }),
                columns:
                [
                    {
                        id: 'number-vhist',
                        sortable: true,
                        header: config.htcConfig.locData.VersionHistoryGridNumberColumn,
                        dataIndex: 'id',
                        width: 35,
                        align: 'center',
                        renderer: function (val, cell, rec, row, col, store) {
                            if (rec.data.latest) {
                                val = val || '';
                                return '<b>' + Ext.util.Format.htmlEncode(val) + '</b>';
                            }
                            return Ext.util.Format.htmlEncode(val || '');
                        }
                    },
                    {
                        id: 'size-vhist',
                        sortable: true,
                        header: config.htcConfig.locData.CommonFieldLabelSize,
                        dataIndex: 'size',
                        width: 70,
                        align: 'right',
                        renderer: function (val, cell, rec, row, col, store) {
                            var sizeVal = config.getRenderers().sizeRenderer(val);
                            if (rec.data.latest)
                                return '<b>' + sizeVal + '</b>';
                            return sizeVal;
                        }
                    },
                    {
                        id: 'date-vhist',
                        sortable: true,
                        header: config.htcConfig.locData.CommonFieldLabelDateCreated,
                        dataIndex: 'date',
                        width: 125,
                        renderer: function (val, cell, rec, row, col, store) {
                            if (val == null)
                                return null;
                            var valDate = new Date(
                                val.substring(0, 4),
                                val.substring(4, 6) - 1,
                                val.substring(6, 8),
                                val.substring(8, 10),
                                val.substring(10, 12),
                                val.substring(12, 14));
                            var locDate;
                            try {
                                if (store.isUSA)
                                    locDate = (valDate.getMonth() + 1) + "/" + valDate.getDate() + "/";
                                else
                                    locDate = valDate.getDate() + "/" + (valDate.getMonth() + 1) + "/";
                                locDate += valDate.getFullYear() + " " + valDate.toLocaleTimeString();
                            } catch (e) {
                                locDate = valDate.toLocaleString();
                            }
                            if (rec.data.latest)
                                locDate = '<b>' + Ext.util.Format.htmlEncode(locDate) + '</b>';
                            return Ext.util.Format.htmlEncode(locDate);
                        }
                    },
                    {
                        id: 'user-vhist',
                        sortable: true,
                        header: config.htcConfig.locData.CommonFieldLabelUser,
                        dataIndex: 'user',
                        width: 90,
                        renderer: function (val, cell, rec, row, col, store) {
                            var user = HttpCommander.Lib.Utils.parseUserName(val) || '';
                            if (rec.data.latest) {
                                return '<span style="font-weight:bold;">' + Ext.util.Format.htmlEncode(user) + '</span>';
                            }
                            return Ext.util.Format.htmlEncode(user);
                        }
                    },
                    {
                        id: 'notes-vhist',
                        sortable: true,
                        header: config.htcConfig.locData.VersionHistoryGridNotesColumn,
                        dataIndex: 'notes',
                        renderer: function (val, cell, rec, row, col, store) {
                            if (rec.data.latest) {
                                val = val || '';
                                return '<b>' + Ext.util.Format.htmlEncode(val) + '</b>';
                            }
                            return String.format("<span style='white-space: normal;'>{0}</span>", Ext.util.Format.htmlEncode(val || ''));
                        }
                    }
                ],
                autoExpandColumn: 'notes-vhist',
                flex: 1,
                stripeRows: true,
                listeners: {
                    render: function (grd) {
                        var downloadItem = grd.getTopToolbar().getComponent('download-vhist');
                        if (downloadItem) {
                            downloadItem.setVisible(config.htcConfig.currentPerms
                                && config.htcConfig.currentPerms.download
                            );
                        }
                    }
                }
            })
        ],
        buttons:
        [
            {
                text: config.htcConfig.locData.CommonButtonCaptionClose,
                handler: function () { self.hide(); }
            }
        ],
        listeners: {
            hide: function (self) {
                if (vhistGrid) {
                    vhistGrid.getStore().loadData([]);
                    vhistGrid.getStore().commitChanges();
                }
                self.setTitle('');
                self.getComponent('file-path-vhist').setValue('');
                self.getComponent('file-name-vhist').setValue('');
            }
        },
        confirmRestoreHandler: function (btn, text) {
            var verInfo = self.verInfo;
            if (btn == 'ok') {
                if (text != '')
                    verInfo['newName'] = text;
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressRestoringVersion + "...";
                config.globalLoadMask.show();
                HttpCommander.Common.RestoreVersion(verInfo, function (data, trans) {
                    config.globalLoadMask.hide();
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                    if (!HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, config.Msg, config.htcConfig)) {
                        if (typeof data != 'undefined') {
                            config.openGridFolder(verInfo.path);
                        }
                    } else {
                        if (!data.vhist || data.vhist.length < 1) {
                            config.Msg.alert(config.htcConfig.locData.CommonWarningCaption,
                                config.htcConfig.locData.NoVersionHistoryMessage
                            );
                            if (self)
                                self.hide();
                            config.openGridFolder(verInfo.path);
                            return;
                        }
                        if (self && vhistGrid) {
                            self.setTitle(String.format(config.htcConfig.locData.VersionHistoryTitle,
                                Ext.util.Format.htmlEncode(verInfo.name))
                            );
                            var store = vhistGrid.getStore();
                            store.isUSA = data.isUSA;
                            store.loadData(data.vhist);
                            store.commitChanges();
                            self.getComponent('file-path-vhist').setValue(verInfo.path);
                            self.getComponent('file-name-vhist').setValue(verInfo.name);
                            self.show();
                            config.openGridFolder(verInfo.path);
                        }
                    }
                });
            }
        },
        confirmDeleteHandler: function (btn) {
            var verInfo = self.verInfo;
            if (btn == 'yes') {
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressDeletingVersion + "...";
                config.globalLoadMask.show();
                HttpCommander.Common.DeleteVersion(verInfo, function (data, trans) {
                    config.globalLoadMask.hide();
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                    if (!HttpCommander.Lib.Utils.checkDirectHandlerResult(
                                data, trans, config.Msg, config.htcConfig)) {
                        if (typeof data != 'undefined') {
                            config.openGridFolder(verInfo.path);
                        }
                    } else {
                        if (!data.vhist || data.vhist.length < 1) {
                            config.Msg.alert(config.htcConfig.locData.CommonWarningCaption,
                                config.htcConfig.locData.NoVersionHistoryMessage
                            );
                            if (self)
                                self.hide();
                            config.openGridFolder(verInfo.path);
                            return;
                        }
                        if (self && vhistGrid) {
                            self.setTitle(String.format(config.htcConfig.locData.VersionHistoryTitle,
                                Ext.util.Format.htmlEncode(verInfo.name))
                            );
                            var store = vhistGrid.getStore();
                            store.isUSA = data.isUSA;
                            store.loadData(data.vhist);
                            store.commitChanges();
                            self.getComponent('file-path-vhist').setValue(verInfo.path);
                            self.getComponent('file-name-vhist').setValue(verInfo.name);
                            self.show();
                            config.openGridFolder(verInfo.path);
                        }
                    }
                });
            }
        },
        initialize: function (title, isUSA, vhist, path, name) {
            var store = vhistGrid.getStore();
            self.setTitle(title);
            store.isUSA = isUSA;
            store.loadData(vhist);
            store.commitChanges();
            self.getComponent('file-path-vhist').setValue(path);
            self.getComponent('file-name-vhist').setValue(name);
        }
    });
    return self;
};