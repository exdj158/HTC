Ext.ns('HttpCommander.Lib');

/**
 *   config:
 *       htcConfig, promptUserName(), promptGroupName(),
 *       getShowListForAllowedFolders(), htmlEncodeRenderer(),
 *       identitiesRenderer(), navigateHelpAdminPanelWithFragment()
 */
HttpCommander.Lib.AdminPermissions = function (config) {
    // VARS section
    var adminPermsWindow,
        adminPermsFolderWindow,
        gridAdminPermissions,
        gridAdminPermsUsers,
        gridAdminPermsGroups,
        gridAdminFoldersUsers,
        gridAdminFoldersGroups,
        tabConfig;

    // FUNCTIONS section
    function prepareAdminPermsWindow(data) {
        adminPermsWindow.setTitle(Ext.util.Format.htmlEncode(data.title));
        adminPermsWindow.typePerms = data.name;
        var hint = String.format(config.htcConfig.locData.AdminPermissionsPrivilegeHint, data.title);
        var hintEl = adminPermsWindow.items.items[0];
        if (adminPermsWindow.rendered)
            hintEl.setText(hint);
        else
            hintEl.text = hint;
        var store1 = gridAdminPermsUsers.getStore();
        store1.removeAll();
        Ext.each(data.users, function (item) {
            var userRecord = new Ext.data.Record({
                name: item.identityName
            });
            store1.add(userRecord);
        });
        var store2 = gridAdminPermsGroups.getStore();
        store2.removeAll();
        Ext.each(data.groups, function (item) {
            var groupRecord = new Ext.data.Record({
                name: item.identityName
            });
            store2.add(groupRecord);
        });
    }
    function editPrivilegeHandler() {
        if (gridAdminPermissions) {
            var selectedRecord = gridAdminPermissions.getSelectionModel().getSelected();
            if (selectedRecord) {
                prepareAdminPermsWindow(selectedRecord.data);
                adminPermsWindow.show();
            }
        }
    }
    function aggregateAdminPermsData() {
        var perms = {};
        perms["name"] = adminPermsWindow.typePerms;
        perms["users"] = [];
        Ext.each(gridAdminPermsUsers.getStore().data.items, function (item) {
            perms["users"].push({ 'identityName': item.data.name });
        });
        perms["groups"] = [];
        Ext.each(gridAdminPermsGroups.getStore().data.items, function (item) {
            perms["groups"].push({ identityName: item.data.name });
        });
        return perms;
    }
    function prepareAdminPermsFolderWindow(data) {
        if (!data) {
            adminPermsFolderWindow.isEditing = false;
            adminPermsFolderWindow.buttons[0].setText(config.htcConfig.locData.CommonButtonCaptionAdd);
            adminPermsFolderWindow.findById('admin-folder-path').setValue("");
            adminPermsFolderWindow.findById('admin-folder-path-original').setValue("");
            gridAdminFoldersUsers.getStore().removeAll();
            gridAdminFoldersGroups.getStore().removeAll();
        } else {
            adminPermsFolderWindow.isEditing = true;
            adminPermsFolderWindow.findById('admin-folder-path').setValue(data.path);
            adminPermsFolderWindow.findById('admin-folder-path-original').setValue(data.path);
            adminPermsFolderWindow.buttons[0].setText(config.htcConfig.locData.CommandSave);
            var store1 = gridAdminFoldersUsers.getStore();
            store1.removeAll();
            Ext.each(data.users, function (item) {
                var userRecord = new Ext.data.Record({
                    name: item.identityName
                });
                store1.add(userRecord);
            });
            var store2 = gridAdminFoldersGroups.getStore();
            store2.removeAll();
            Ext.each(data.groups, function (item) {
                var groupRecord = new Ext.data.Record({
                    name: item.identityName
                });
                store2.add(groupRecord);
            });
        }
    }
    function editAdminFolderHandler() {
        if (gridAdminFolders) {
            var selectedRecord = gridAdminFolders.getSelectionModel().getSelected();
            if (selectedRecord) {
                prepareAdminPermsFolderWindow(selectedRecord.data);
                adminPermsFolderWindow.show();
            }
        }
    }
    function aggregateAdminFoldersData() {
        var perms = {};
        perms["path"] = adminPermsFolderWindow.findById('admin-folder-path').getValue();
        perms["pathOriginal"] = adminPermsFolderWindow.findById('admin-folder-path-original').getValue();
        perms["users"] = [];
        Ext.each(gridAdminFoldersUsers.getStore().data.items, function (item) {
            perms["users"].push({ 'identityName': item.data.name });
        });
        perms["groups"] = [];
        Ext.each(gridAdminFoldersGroups.getStore().data.items, function (item) {
            perms["groups"].push({ identityName: item.data.name });
        });
        return perms;
    }
    function validateAdminPermsFolderData() {
        var folderPath = adminPermsFolderWindow.findById('admin-folder-path').getValue();
        if (!folderPath)
            return config.htcConfig.locData.AdminFoldersEmptyPath;
        if (gridAdminFoldersUsers.getStore().getCount() == 0 &&
            gridAdminFoldersGroups.getStore().getCount() == 0)
            return config.htcConfig.locData.AdminPermissionsFolderEmptyAccounts;
        return null;
    }

    // WINDOW objects
    adminPermsWindow = new Ext.Window({
        title: '',
        width: 525,
        autoHeight: true,
        plain: true,
        bodyStyle: 'padding:5px',
        layout: 'table',
        layoutConfig: { columns: 2 },
        resizable: false,
        closeAction: 'hide',
        typePerms: null,
        items:
        [
            {
                xtype: 'label',
                colspan: 2,
                text: ''
            },
            gridAdminPermsUsers = new Ext.grid.GridPanel({
                title: config.htcConfig.locData.CommonFieldLabelUsers,
                store: new Ext.data.ArrayStore({
                    fields: ['name']
                }),
                multiSelect: false,
                height: 300,
                width: 250,
                enableHdMenu: false,
                selModel: new Ext.grid.RowSelectionModel({
                    singleSelect: true,
                    listeners: {
                        selectionchange: function (model) {
                            var removeButton = gridAdminPermsUsers.getTopToolbar().findById('remove-amdin-perms-users');
                            removeButton.setDisabled(model.getCount() == 0);
                        }
                    }
                }),
                tbar: {
                    enableOverflow: true,
                    items:
                    [
                        {
                            text: config.htcConfig.locData.AdminCommandAddUser + "...",
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'add'),
                            handler: function () {
                                config.promptUserName(function (btn, text) {
                                    if (btn == 'ok') {
                                        var userExists = false;
                                        Ext.each(gridAdminPermsUsers.getStore().data.items, function (item) {
                                            if (item.data.name.toLowerCase() == text.toLowerCase())
                                                userExists = true;
                                        });
                                        if (userExists) {
                                            Ext.Msg.show({
                                                title: config.htcConfig.locData.CommonErrorCaption,
                                                msg: config.htcConfig.locData.AdminFoldersUserAlreadyExists,
                                                icon: Ext.MessageBox.WARNING,
                                                buttons: Ext.Msg.OK
                                            });
                                        } else {
                                            var newRecord = new Ext.data.Record({
                                                name: text
                                            });
                                            gridAdminPermsUsers.getStore().add(newRecord);
                                        }
                                    }
                                });
                            }
                        },
                        {
                            text: config.htcConfig.locData.CommandDelete,
                            id: 'remove-amdin-perms-users',
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'remove'), disabled: true,
                            handler: function () {
                                var selectedRecord = gridAdminPermsUsers.getSelectionModel().getSelected();
                                if (selectedRecord) {
                                    gridAdminPermsUsers.getStore().remove(selectedRecord);
                                }
                            }
                        }
                    ]
                },
                columns:
                [
                    {
                        header: config.htcConfig.locData.CommonFieldLabelName,
                        width: 220,
                        dataIndex: 'name',
                        renderer: function (value, p, r) {
                            return "<img src='" + HttpCommander.Lib.Utils.getIconPath(config, 'user') + "' class='filetypeimage'>" + Ext.util.Format.htmlEncode(value);
                        }
                    }
                ]
            }),
            gridAdminPermsGroups = new Ext.grid.GridPanel({
                title: config.htcConfig.locData.CommonFieldLabelGroups,
                store: new Ext.data.ArrayStore({
                    fields: ['name']
                }),
                multiSelect: false,
                height: 300,
                width: 250,
                enableHdMenu: false,
                selModel: new Ext.grid.RowSelectionModel({
                    singleSelect: true,
                    listeners: {
                        selectionchange: function (model) {
                            var removeButton = gridAdminPermsGroups.getTopToolbar().findById('remove-admin-perms-groups');
                            removeButton.setDisabled(model.getCount() == 0);
                        }
                    }
                }),
                tbar: {
                    enableOverflow: true,
                    items:
                    [
                        {
                            text: config.htcConfig.locData.AdminCommandAddGroup + '...',
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'add'),
                            handler: function () {
                                config.promptGroupName(function (btn, text) {
                                    if (btn == 'ok') {
                                        var groupExists = false;
                                        Ext.each(gridAdminPermsGroups.getStore().data.items, function (item) {
                                            if (item.data.name.toLowerCase() == text.toLowerCase())
                                                groupExists = true;
                                        });
                                        if (groupExists) {
                                            Ext.Msg.show({
                                                title: config.htcConfig.locData.CommonErrorCaption,
                                                msg: config.htcConfig.locData.AdminFoldersGroupAlreadyExists,
                                                icon: Ext.MessageBox.WARNING,
                                                buttons: Ext.Msg.OK
                                            });
                                        }
                                        else {
                                            var newRecord = new Ext.data.Record({
                                                name: text
                                            });
                                            gridAdminPermsGroups.getStore().add(newRecord);
                                        }
                                    }
                                });
                            }
                        },
                        {
                            text: config.htcConfig.locData.CommandDelete,
                            id: 'remove-admin-perms-groups',
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'remove'),
                            disabled: true,
                            handler: function () {
                                var selectedRecord = gridAdminPermsGroups.getSelectionModel().getSelected();
                                if (selectedRecord) {
                                    gridAdminPermsGroups.getStore().remove(selectedRecord);
                                }
                            }
                        }
                    ]
                },
                columns:
                [
                    {
                        header: config.htcConfig.locData.CommonFieldLabelName,
                        width: 220,
                        dataIndex: 'name',
                        renderer: function (value, p, r) {
                            return "<img src='" + HttpCommander.Lib.Utils.getIconPath(config, 'group') + "' class='filetypeimage'>" + Ext.util.Format.htmlEncode(value);
                        }
                    }
                ]
            })
        ],
        buttonsAlign: 'right',
        buttons:
        [
            {
                text: config.htcConfig.locData.CommandSave,
                id: 'add-edit-admin-priv',
                handler: function () {
                    var p = aggregateAdminPermsData();
                    adminPermsWindow.hide();
                    gridAdminPermissions.loadMask.msg = config.htcConfig.locData.ProgressCreating + "...";
                    gridAdminPermissions.loadMask.show();
                    HttpCommander.Admin.UpdateAdminPermissions(p, function (data, trans) {
                        gridAdminPermissions.loadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                        HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, config.htcConfig);
                        gridAdminPermissions.getStore().reload();
                    });
                }
            },
            {
                text: config.htcConfig.locData.CommonButtonCaptionCancel,
                handler: function () { adminPermsWindow.hide(); }
            }
        ],
        listeners: {
            afterrender: function (win) {
                win.syncSize();
            }
        }
    });
    adminPermsFolderWindow = new Ext.Window({
        title: config.htcConfig.locData.AdminPermissionsFolderTitle,
        autoHeight: true,
        plain: true,
        width: 525,
        isEditing: false,
        bodyStyle: 'padding:5px',
        layout: 'table',
        layoutConfig: { columns: 2 },
        resizable: false,
        closeAction: 'hide',
        items:
        [
            new Ext.form.FormPanel({
                colspan: 2,
                plain: true,
                unstyled: true,
                autoHeight: true,
                items:
                [
                    {
                        id: 'admin-folder-path-original',
                        xtype: 'hidden'
                    },
                    config.getShowListForAllowedFolders() ? {
                        xtype: 'combo',
                        fieldLabel: config.htcConfig.locData.AdminPermissionsFolderFieldTitle,
                        anchor: '100%',
                        id: 'admin-folder-path',
                        name: 'admin-folder-path',
                        displayField: 'path',
                        mode: 'remote',
                        resizable: true,
                        tpl: '<tpl for="."><div ext:qtip="{encodedPath}" class="x-combo-list-item" style="margin-left:{level}px;">'
                            + (config.htcConfig.showRelativePathInAFL
                                ? '<img alt="" width="16" height="16" style="vertical-align:top;" src="' + HttpCommander.Lib.Utils.getIconPath(config, 'folder') + '" />&nbsp;{name:htmlEncode}'
                                : '{path:htmlEncode}')
                            + '</div></tpl>',
                        triggerAction: 'all',
                        loadingText: config.htcConfig.locData.ProgressLoading + '...',
                        //selectOnFocus: true,
                        forceSelection: true,
                        editable: false,
                        lazyInit: false,
                        store: new Ext.data.DirectStore({
                            directFn: HttpCommander.Admin.GetAllowedFolders,
                            autoLoad: false,
                            fields: ['name', 'path', 'encodedPath', { name: 'level', type: 'int'}]
                        }),
                        listeners: {
                            'select': function (combo, record, index) {
                                Ext.QuickTips.getQuickTip().register({
                                    target: this.el,
                                    text: record.data.encodedPath
                                });
                                combo.setValue(record.data.path);
                            }
                        }
                    } : {
                        xtype: 'container',
                        layout: 'hbox',
                        anchor: '100%',
                        fieldLabel: config.htcConfig.locData.AdminPermissionsFolderFieldTitle,
                        items:
                        [
                            {
                                id: 'admin-folder-path',
                                name: 'admin-folder-path',
                                xtype: 'textfield',
                                hideLabel: true,
                                flex: 1,
                                enableKeyEvents: true,
                                listeners: {
                                    change: function (field, newVal, oldVal) {
                                        Ext.QuickTips.getQuickTip().unregister(field.el);
                                        if (newVal && newVal != '')
                                            Ext.QuickTips.getQuickTip().register({
                                                target: field.el,
                                                text: Ext.util.Format.htmlEncode(newVal)
                                            });
                                    }
                                }
                            },
                            {
                                id: 'create-admin-folder-button',
                                xtype: 'button',
                                icon: HttpCommander.Lib.Utils.getIconPath(config, 'createfolder'),
                                tooltip: config.htcConfig.locData.AdminFoldersFolderCreate,
                                handler: function () {
                                    var pathField = Ext.getCmp('admin-folder-path');
                                    var path = '';
                                    if (pathField && !(new RegExp('^\\s*$', 'i')).test(path = pathField.getValue())) {
                                        gridAdminFolders.loadMask.msg = config.htcConfig.locData.AdminFoldersFolderCreateProcess + "...";
                                        gridAdminFolders.loadMask.show();
                                        HttpCommander.Admin.CreateFolder({ path: path }, function (data, trans) {
                                            gridAdminFolders.loadMask.hide();
                                            gridAdminFolders.loadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                                            if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, config.htcConfig)) {
                                                Ext.Msg.show({
                                                    title: config.htcConfig.locData.AdminFoldersFolderCreate,
                                                    msg: String.format(config.htcConfig.locData.AdminFoldersFolderCreateSuccessfully,
                                                        Ext.util.Format.htmlEncode(data.createdPath)),
                                                    closable: true,
                                                    modal: true,
                                                    buttons: Ext.Msg.OK,
                                                    icon: Ext.Msg.INFO
                                                });
                                            }
                                        });
                                    }
                                }
                            }
                        ]
                    },
                    {
                        id: 'admin-folder-hint',
                        xtype: 'label',
                        anchor: '100%',
                        text: config.htcConfig.locData.AdminPermissionsFolderHint
                    }
                ]
            }),
            gridAdminFoldersUsers = new Ext.grid.GridPanel({
                title: config.htcConfig.locData.CommonFieldLabelUsers,
                store: new Ext.data.ArrayStore({
                    fields: ['name']
                }),
                multiSelect: false,
                height: 300,
                width: 250,
                enableHdMenu: false,
                selModel: new Ext.grid.RowSelectionModel({
                    singleSelect: true,
                    listeners: {
                        selectionchange: function (model) {
                            var removeButton = gridAdminFoldersUsers.getTopToolbar().findById('remove-amdin-folders-users');
                            removeButton.setDisabled(model.getCount() == 0);
                        }
                    }
                }),
                tbar: {
                    enableOverflow: true,
                    items:
                    [
                        {
                            text: config.htcConfig.locData.AdminCommandAddUser + "...",
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'add'),
                            handler: function () {
                                config.promptUserName(function (btn, text) {
                                    if (btn == 'ok') {
                                        var userExists = false;
                                        Ext.each(gridAdminFoldersUsers.getStore().data.items, function (item) {
                                            if (item.data.name.toLowerCase() == text.toLowerCase())
                                                userExists = true;
                                        });
                                        if (userExists) {
                                            Ext.Msg.show({
                                                title: config.htcConfig.locData.CommonErrorCaption,
                                                msg: config.htcConfig.locData.AdminFoldersUserAlreadyExists,
                                                icon: Ext.MessageBox.WARNING,
                                                buttons: Ext.Msg.OK
                                            });
                                        } else {
                                            var newRecord = new Ext.data.Record({
                                                name: text
                                            });
                                            gridAdminFoldersUsers.getStore().add(newRecord);
                                        }
                                    }
                                });
                            }
                        },
                        {
                            text: config.htcConfig.locData.CommandDelete,
                            id: 'remove-amdin-folders-users',
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'remove'), disabled: true,
                            handler: function () {
                                var selectedRecord = gridAdminFoldersUsers.getSelectionModel().getSelected();
                                if (selectedRecord) {
                                    gridAdminFoldersUsers.getStore().remove(selectedRecord);
                                }
                            }
                        }
                    ]
                },
                columns:
                [
                    {
                        header: config.htcConfig.locData.CommonFieldLabelName,
                        width: 220,
                        dataIndex: 'name',
                        renderer: function (value, p, r) {
                            return "<img src='" + HttpCommander.Lib.Utils.getIconPath(config, 'user') + "' class='filetypeimage'>" + Ext.util.Format.htmlEncode(value);
                        }
                    }
                ]
            }),
            gridAdminFoldersGroups = new Ext.grid.GridPanel({
                title: config.htcConfig.locData.CommonFieldLabelGroups,
                store: new Ext.data.ArrayStore({
                    fields: ['name']
                }),
                multiSelect: false,
                height: 300,
                width: 250,
                enableHdMenu: false,
                selModel: new Ext.grid.RowSelectionModel({
                    singleSelect: true,
                    listeners: {
                        selectionchange: function (model) {
                            var removeButton = gridAdminFoldersGroups.getTopToolbar().findById('remove-admin-folders-groups');
                            removeButton.setDisabled(model.getCount() == 0);
                        }
                    }
                }),
                tbar: {
                    enableOverflow: true,
                    items:
                    [
                        {
                            text: config.htcConfig.locData.AdminCommandAddGroup + '...',
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'add'),
                            handler: function () {
                                config.promptGroupName(function (btn, text) {
                                    if (btn == 'ok') {
                                        var groupExists = false;
                                        Ext.each(gridAdminFoldersGroups.getStore().data.items, function (item) {
                                            if (item.data.name.toLowerCase() == text.toLowerCase())
                                                groupExists = true;
                                        });
                                        if (groupExists) {
                                            Ext.Msg.show({
                                                title: config.htcConfig.locData.CommonErrorCaption,
                                                msg: config.htcConfig.locData.AdminFoldersGroupAlreadyExists,
                                                icon: Ext.MessageBox.WARNING,
                                                buttons: Ext.Msg.OK
                                            });
                                        }
                                        else {
                                            var newRecord = new Ext.data.Record({
                                                name: text
                                            });
                                            gridAdminFoldersGroups.getStore().add(newRecord);
                                        }
                                    }
                                });
                            }
                        },
                        {
                            text: config.htcConfig.locData.CommandDelete,
                            id: 'remove-admin-folders-groups',
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'remove'),
                            disabled: true,
                            handler: function () {
                                var selectedRecord = gridAdminFoldersGroups.getSelectionModel().getSelected();
                                if (selectedRecord) {
                                    gridAdminFoldersGroups.getStore().remove(selectedRecord);
                                }
                            }
                        }
                    ]
                },
                columns:
                [
                    {
                        header: config.htcConfig.locData.CommonFieldLabelName,
                        width: 220,
                        dataIndex: 'name',
                        renderer: function (value, p, r) {
                            return "<img src='" + HttpCommander.Lib.Utils.getIconPath(config, 'group') + "' class='filetypeimage'>" + Ext.util.Format.htmlEncode(value);
                        }
                    }
                ]
            })
        ],
        buttonsAlign: 'right',
        buttons:
        [
            {
                text: config.htcConfig.locData.CommandSave,
                id: 'add-edit-admin-folder',
                handler: function () {
                    var validationResult = validateAdminPermsFolderData();
                    if (validationResult) {
                        Ext.Msg.show({
                            title: config.htcConfig.locData.CommonErrorCaption,
                            msg: validationResult,
                            icon: Ext.MessageBox.WARNING,
                            buttons: Ext.Msg.OK
                        });
                    } else {
                        var f = aggregateAdminFoldersData();
                        adminPermsFolderWindow.hide();
                        if (!adminPermsFolderWindow.isEditing) {
                            gridAdminFolders.loadMask.msg = config.htcConfig.locData.ProgressCreating + "...";
                            gridAdminFolders.loadMask.show();
                            HttpCommander.Admin.AddAdminFolder(f, function (data, trans) {
                                gridFolders.loadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                                HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, config.htcConfig);
                                gridAdminFolders.getStore().reload();
                            });
                        } else {
                            gridAdminFolders.loadMask.msg = config.htcConfig.locData.ProgressUpdating + "...";
                            gridAdminFolders.loadMask.show();
                            HttpCommander.Admin.UpdateAdminFolder(f, function (data, trans) {
                                gridAdminFolders.loadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                                HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, config.htcConfig);
                                gridAdminFolders.getStore().reload();
                            });
                        }
                    }
                }
            },
            {
                text: config.htcConfig.locData.CommonButtonCaptionCancel,
                handler: function () { adminPermsFolderWindow.hide(); }
            }
        ],
        listeners: {
            afterrender: function (win) {
                win.syncSize();
            }
        }
    });

    // MAIN object (tab config)
    tabConfig = {
        title: config.htcConfig.locData.AdminPermissionsTab,
        id: 'admin-permissions-tab',
        layout: 'fit',
        autoScroll: true,
        xtype: 'panel',
        items:
        [
            gridAdminPermissions = new Ext.grid.GridPanel({
                title: config.htcConfig.locData.AdminPermissionsTab,
                store: new Ext.data.DirectStore({
                    directFn: HttpCommander.Admin.GetAdminPermissions,
                    fields:
                    [
                        { name: 'name', type: 'string' },
                        { name: 'title', type: 'string' },
                        { name: 'users' },
                        { name: 'groups' }
                    ]
                }),
                keys: {
                    key:
		            [
		                Ext.EventObject.ENTER
		            ],
                    fn: function (e) {
                        switch (e) {
                            case Ext.EventObject.ENTER:
                                editPrivilegeHandler();
                                break;
                        }
                    },
                    scope: this
                },
                multiSelect: false,
                border: false,
                loadMask: true,
                enableHdMenu: false,
                autoExpandColumn: 'title',
                autoHeight: true,
                selModel: new Ext.grid.RowSelectionModel({
                    singleSelect: true,
                    listeners: {
                        selectionchange: function (model) {
                            var editButton = gridAdminPermissions.getTopToolbar().findById('edit-admin-perms');
                            editButton.setDisabled(model.getCount() == 0);
                        }
                    }
                }),
                tbar: { enableOverflow: true, items:
                [
                    {
                        text: config.htcConfig.locData.CommandRefresh,
                        icon: HttpCommander.Lib.Utils.getIconPath(config, 'refresh'),
                        handler: function () {
                            gridAdminPermissions.getStore().reload();
                        }
                    },
                    {
                        text: config.htcConfig.locData.AdminPermissionsEditButton + '...',
                        id: 'edit-admin-perms',
                        icon: HttpCommander.Lib.Utils.getIconPath(config, 'editpermissions'),
                        disabled: true,
                        handler: editPrivilegeHandler
                    },
                    {
                        text: config.htcConfig.locData.AdminCommandHelp,
                        icon: HttpCommander.Lib.Utils.getIconPath(config, 'help'),
                        handler: function () { config.navigateHelpAdminPanelWithFragment('adminpermissions'); }
                    }
                ]
                },
                columns:
                [
                    {
                        id: 'title',
                        header: config.htcConfig.locData.AdminPermissionsPrivilege,
                        width: 100,
                        dataIndex: 'title',
                        renderer: config.htmlEncodeRenderer
                    },
                    {
                        id: 'users',
                        width: 150,
                        header: config.htcConfig.locData.CommonFieldLabelUsers,
                        dataIndex: 'users',
                        renderer: config.identitiesRenderer
                    },
                    {
                        id: 'groups',
                        width: 150,
                        header: config.htcConfig.locData.CommonFieldLabelGroups,
                        dataIndex: 'groups',
                        renderer: config.identitiesRenderer
                    }
                ],
                listeners: {
                    rowdblclick: function (grid, index, e) {
                        editPrivilegeHandler();
                    }
                }
            }),
            gridAdminFolders = new Ext.grid.GridPanel({
                title: config.htcConfig.locData.AdminPermissionsFoldersTitle,
                store: new Ext.data.DirectStore({
                    directFn: HttpCommander.Admin.GetAdminFolders,
                    fields:
                    [
                        { name: 'path', type: 'string' },
                        { name: 'users' },
                        { name: 'groups' }
                    ]
                }),
                keys: {
                    key:
		            [
		                Ext.EventObject.ENTER
		            ],
                    fn: function (e) {
                        switch (e) {
                            case Ext.EventObject.ENTER:
                                editAdminFolderHandler();
                                break;
                        }
                    },
                    scope: this
                },
                viewConfig: { forceFit: true, autoFill: true },
                multiSelect: false,
                border: false,
                loadMask: true,
                enableHdMenu: false,
                autoExpandColumn: 'path',
                width: '100%',
                //height: '100%',
                autoHeight: true,
                selModel: new Ext.grid.RowSelectionModel({
                    singleSelect: true,
                    listeners: {
                        selectionchange: function (model) {
                            var removeButton = gridAdminFolders.getTopToolbar().findById('remove-admin-perms-folder');
                            if (removeButton)
                                removeButton.setDisabled(model.getCount() == 0);
                            var editButton = gridAdminFolders.getTopToolbar().findById('edit-admin-perms-folder');
                            if (editButton)
                                editButton.setDisabled(model.getCount() == 0);
                        }
                    }
                }),
                tbar: {
                    enableOverflow: true,
                    items:
                    [
                        {
                            text: config.htcConfig.locData.CommandRefresh,
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'refresh'),
                            handler: function () {
                                gridAdminFolders.getStore().reload();
                            }
                        },
                        {
                            text: config.htcConfig.locData.AdminFoldersAddFolder + '...',
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'add'),
                            handler: function () {
                                prepareAdminPermsFolderWindow(null);
                                adminPermsFolderWindow.show();
                            }
                        },
                        {
                            text: config.htcConfig.locData.AdminFoldersEditFolder + '...',
                            id: 'edit-admin-perms-folder',
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'editfolder'),
                            disabled: true,
                            handler: editAdminFolderHandler
                        },
                        {
                            id: 'remove-admin-perms-folder',
                            text: config.htcConfig.locData.AdminFoldersRemoveFolder,
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'remove'),
                            disabled: true,
                            handler: function () {
                                var selectedRecord = gridAdminFolders.getSelectionModel().getSelected();
                                var folderPath = selectedRecord.data.path;
                                var removeInfo = { path: folderPath };
                                Ext.Msg.show({
                                    title: config.htcConfig.locData.CommonConfirmCaption,
                                    msg: String.format(config.htcConfig.locData.AdminFoldersDeleteFolderPrompt,
                                        Ext.util.Format.htmlEncode(folderPath)),
                                    buttons: Ext.Msg.YESNO,
                                    icon: Ext.MessageBox.QUESTION,
                                    fn: function (result) {
                                        if (result == "yes") {
                                            gridAdminFolders.loadMask.msg = config.htcConfig.locData.ProgressDeleting + "...";
                                            gridAdminFolders.loadMask.show();
                                            HttpCommander.Admin.DeleteAdminFolder(removeInfo, function (data, trans) {
                                                gridFolders.loadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                                                HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, config.htcConfig);
                                                gridAdminFolders.getStore().reload();
                                            });
                                        }
                                    }
                                });
                            }
                        },
                        {
                            text: config.htcConfig.locData.AdminCommandHelp,
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'help'),
                            handler: function () { config.navigateHelpAdminPanelWithFragment('adminpermissions'); }
                        }
                    ]
                },
                columns:
                [
                    {
                        id: 'path',
                        header: config.htcConfig.locData.AdminPermissionsFolderPathTitle,
                        width: 100,
                        dataIndex: 'path',
                        renderer: config.htmlEncodeRenderer
                    },
                    {
                        id: 'users',
                        width: 150,
                        header: config.htcConfig.locData.CommonFieldLabelUsers,
                        dataIndex: 'users',
                        renderer: config.identitiesRenderer
                    },
                    {
                        id: 'groups',
                        width: 150,
                        header: config.htcConfig.locData.CommonFieldLabelGroups,
                        dataIndex: 'groups',
                        renderer: config.identitiesRenderer
                    }
                ],
                listeners: {
                    rowdblclick: function (grid, index, e) {
                        editAdminFolderHandler();
                    }
                }
            })
        ],
        'getGridAdminPermissions': function () { return gridAdminPermissions; },
        'getGridAdminFolders': function () { return gridAdminFolders; }
    };

    return tabConfig;
};