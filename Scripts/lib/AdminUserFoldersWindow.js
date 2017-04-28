Ext.ns('HttpCommander.Lib');

/* config: htcConfig, wordWrapRenderer(), getLoadMask()
*/
HttpCommander.Lib.AdminUserFoldersWindow = function (config) {
    var usersField, foldersLabel, foldersGrid, foldersStore, frm;

    var self = new Ext.Window({
        title: config.htcConfig.locData.AdminUserFoldersWindowTitle,
        closable: true,
        closeAction: 'hide',
        minimizable: false,
        maximizable: true,
        modal: true,
        bodyStyle: 'padding: 5px',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        width: config.htcConfig.isEmbeddedtoIFRAME ? 350 : 700,
        height: config.htcConfig.isEmbeddedtoIFRAME ? 250 : 450,
        plain: true,
        hideLabel: false,
        defaults: { anchor: '100%', hideLabel: false },
        //listeners: {
        //    hide: function (wnd) {
        //        if (!!usersField) {
        //            usersField.mode = 'remote';
        //            usersField.minChars = 50;
        //            usersField.queryDelay = 250;
        //        }
        //    }
        //},
        items:
        [
            frm = new Ext.form.FormPanel({
                hideLabel: false,
                baseCls: 'x-plain',
                labelWidth: 100,
                defaults: { anchor: '100%', hideLabel: false },
                items:
                [
                    usersField = new Ext.form.ComboBox({
                        fieldLabel: config.htcConfig.locData.AdminFoldersUserNamePrompt, //.replace(/\s/g, '&nbsp;'),
                        displayField: 'name',
                        tpl: '<tpl for="."><div class="x-combo-list-item">{name:htmlEncode}</div></tpl>',
                        mode: 'remote',
                        hideLabel: false,
                        triggerAction: 'all',
                        disableKeyFilter: true,
                        loadingText: config.htcConfig.locData.ProgressLoading + '...',
                        emptyText: config.htcConfig.locData.AdminFoldersUserNameEmptyText + '...',
                        selectOnFocus: true,
                        editable: true,
                        lazyInit: false,
                        minChars: 50,
                        enableKeyEvents: true,
                        typeAhead: true,
                        store: new Ext.data.DirectStore({
                            directFn: HttpCommander.Admin.GetUsers,
                            autoLoad: false,
                            fields: ['name', 'email', 'icon', 'customField'],
                            listeners: {
                                load: function (store) {
                                    if (!!usersField) {
                                        usersField.mode = 'local';
                                        usersField.minChars = 0;
                                        usersField.queryDelay = 10;
                                    }
                                }
                            }
                        }),
                        listeners: {
                            'select': function (combo, record, index) {
                                self.showFolders(combo.getValue(), true);
                            },
                            keyup: function (combo, e) {
                                if (e.keyCode == Ext.EventObject.ENTER) {
                                    self.showFolders(combo.getValue(), true);
                                }
                            },
                            expand: function (combo) {
                                combo.syncSize();
                            }
                        }
                    })
                ]
            }),
            foldersLabel = new Ext.form.Label({
                text: config.htcConfig.AdminFoldersUserNameEmptyText,
                hidden: true
            }),
            foldersGrid = new Ext.grid.GridPanel({
                flex: 1,
                loadMask: true,
                viewConfig: { forceFit: true },
                multiSelect: false,
                border: true,
                enableHdMenu: true,
                autoExpandColumn: 'permission',
                store: foldersStore = new Ext.data.ArrayStore({
                    autoDestroy: true,
                    idIndex: 0,
                    fields: ['name', 'path', 'finalPath', 'permission'],
                    data: []
                }),
                columns:
                [
                    {
                        id: 'name',
                        sortable: true,
                        header: config.htcConfig.locData.CommonFolderNameCaption,
                        width: 75,
                        dataIndex: 'name',
                        renderer: function (value, p, r) {
                            return "<img src='" + HttpCommander.Lib.Utils.getIconPath(config, 'folderftp') + "' class='filetypeimage'>" + Ext.util.Format.htmlEncode(value);
                        }
                    },
                    {
                        id: 'path',
                        sortable: true,
                        header: config.htcConfig.locData.AdminFoldersLocationPath,
                        width: 100,
                        dataIndex: 'path',
                        renderer: config.wordWrapRenderer
                    },
                    {
                        id: 'finalPath',
                        width: 100,
                        sortable: true,
                        header: config.htcConfig.locData.AdminFoldersFolderPath,
                        renderer: config.wordWrapRenderer
                    },
                    {
                        id: 'permission',
                        sortable: true,
                        width: 200,
                        header: config.htcConfig.locData.AdminFoldersPermissions,
                        renderer: config.wordWrapRenderer
                    }
                ]
            })
        ],
        buttons:
        [
            {
                text: config.htcConfig.locData.CommonButtonCaptionClose,
                handler: function () { self.hide(); }
            }
        ],
        prepareAndShow: function () {
            self.hide();
            usersField.setValue('');
            frm.setVisible(true);
            foldersLabel.hide();
            foldersStore.removeAll();
            foldersStore.commitChanges();
            self.show();
            self.syncSize();
        },
        showFolders: function (userName, fromCombo) {
            if (!userName)
                return;
            var userInfo = { 'name': userName },
                mask = fromCombo || !config.getLoadMask() ? foldersGrid.loadMask : config.getLoadMask();
            frm.setDisabled(true);
            foldersLabel.hide();
            mask.msg = config.htcConfig.locData.ProgressLoading + "...";
            mask.show();
            HttpCommander.Admin.GetUserFolders(userInfo, function (data, trans) {
                usersField.setDisabled(false);
                mask.hide();
                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, config.htcConfig)) {
                    foldersLabel.setText(String.format(config.htcConfig.locData.AdminUserFoldersLabel,
                        '<b>' + Ext.util.Format.htmlEncode(userName) + '</b>'), false);
                    foldersLabel.show();
                    frm.setVisible(fromCombo);
                    frm.setDisabled(false);
                    foldersStore.loadData(data.folders);
                    foldersStore.commitChanges();
                    if (!fromCombo)
                        self.show();
                    self.syncSize();
                }
            });
        }
    });
    return self;
};