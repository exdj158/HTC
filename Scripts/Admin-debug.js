// #include "ExtOverrides.js"
// #include "Utils.js"
// #include "AdminUserHelpWindow.js"
// #include "AdminEmailNotifications.js"
// #include "AdminPermissions.js"
// #include "AdminMisc.js"
// #include "AdminUpdate.js"
// #include "AdminUserFoldersWindow.js"
// #include "AdminDbMaintenance.js"

/** VARS section */
var debugmode = false,
    updateTab = null,
    shrinkLiveSupportImage = function(img) {
        if (!img) return;
        var maxHeight = 30;
        if (img.height > maxHeight) {
            img.style.width = String(img.width * maxHeight / img.height) + 'px';
            img.style.height = String(maxHeight) + 'px';
        }
    },
    liveSupportEl =
'<a href="javascript:void(window.open(' + "'//demo.element-it.com/onlinesupport/chat.php?fromhc=true{0}','','width=590,height=610,left=0,top=0,resizable=yes,menubar=no,location=no,status=yes,scrollbars=yes'" + '))">\
<img onload="shrinkLiveSupportImage(this)" alt="Live Support" src="//demo.element-it.com/onlinesupport/image.php?id=01&type=inlay" />\
</a>',
    PermissionRecord = Ext.data.Record.create([
        { name: 'name', mapping: 'name' },
        { name: 'type', mapping: 'type' },
        { name: 'icon', mapping: 'icon' },
        { name: 'permission', mapping: 'permission' }
    ]),
    MemberRecord = Ext.data.Record.create([
        { name: 'name', mapping: 'name' },
        { name: 'icon', mapping: 'icon' }
    ]),
    isWindowsVersion = htcConfig.hcAuthMode == 'windows' || htcConfig.hcAuthMode == 'formswithwindowsusers',
    adminPerms = htcConfig.adminPerms || {},
    checkPrivilege = function(priv) {
        return htcConfig.isFullAdmin || 
            (adminPerms && adminPerms[String(priv)] === true);
    },
    browserContextMenuTypes = ['textarea', 'text'],
    denyEditAD = htcConfig.hcAuthMode == 'novelledirectory' || isWindowsVersion,
    showListForAllowedFolders = false,
    ajaxRequestTimeout = 180000, // in milliseconds 3 min
    controlUrl = (function (paramName) {
        paramName = paramName || '';
        if (paramName == '')
            return null;
        paramName = paramName.toLowerCase();
        var qStr = decodeURIComponent(window.location.search.substr(1)).replace(/\+/g, ' ').split('&');
        for (var i = 0; i < qStr.length; i++) {
            var keyVal = qStr[i].split('=');
            if (keyVal.length > 1 && keyVal[0].toLowerCase() == paramName)
                return keyVal[1];
        }
        return null;
    })('control'),
    isControl = controlUrl !== null,
    isWebKit = (function() {
        try {
            return navigator.userAgent.toLowerCase().indexOf('webkit/') >= 0;
        } catch (e) {
            return false;
        }
    })(),
    adminPermsTab = null,
    userFoldersWindow = null;

/** end VARS section */


    Ext.onReady(function () {

        try {
            if ((htcConfig.styleName || '').toLowerCase() == 'access') {
                Ext.getBody().addClass('access-theme-font-color');
            }
        } catch (e) {
            // ignore
        }

        // new version detector
        var hcVersionReceived = function () {
            var newv, hcvSpan;
            try {
                if (!!window.tbtnNewVersion) {
                    tbtnNewVersion.setVisible(!Ext.isEmpty(detectNewVersion()));
                }
            } catch (e) { }
            try {
                var hcvSpan = document.getElementById('hcLatestVersionSpan');
                if (!!hcvSpan) {
                    var newv = Ext.isArray(window.hclatestversion) && window.hclatestversion.length > 0
                        ? window.hclatestversion.join('.') : '&nbsp;';
                    hcvSpan.innerHTML = newv;
                }
            } catch (e) { }
        };
        setTimeout(function () {
            HttpCommander.Lib.Utils.includeJsFile({
                url: '//demo.element-it.com/hclatestversion.js?rid=' + (new Date()).getTime(),
                callback: function () {
                    hcVersionReceived();
                }
            });
        }, 10);


        Ext.QuickTips.init();
        Ext.apply(Ext.QuickTips.getQuickTip(), {
            dismissDelay: 60000
        });

        try {
            Ext.util.Observable.observeClass(Ext.data.Connection);
            Ext.data.Connection.on('requestcomplete', function (dataconn, response) {
                try { // we can search something special in response text response.responseText;
                    var status = null;
                    if (response.getResponseHeader)
                        status = response.getResponseHeader("X-HttpCommander-Status");
                    if (!isControl && status && status == 0)
                        location.href = htcConfig.relativePath + "Logout.aspx";
                } catch (e) {
                    if (debugmode || window.onerror) throw e;
                }
            });
        } catch (e) {
            if (debugmode || window.onerror) throw e;
        }

        if (htcConfig
            && htcConfig.listAllowedFoldersPaths
                && htcConfig.allowedFoldersPaths
                    && htcConfig.allowedFoldersPaths.length > 0) {
            showListForAllowedFolders = htcConfig.listAllowedFoldersPaths > 0;
        }

        Ext.getDoc().on('contextmenu', function (event, object) {
            try {
                if (object && object.type && browserContextMenuTypes.indexOf(object.type.toLowerCase()) != -1) {
                    if (window.event)
                        window.event.returnValue = true;
                    return true;
                } else {
                    event.stopEvent();
                    return false;
                }
            } catch (e) {
                if (debugmode || window.onerror) throw e;
            };
        });

        Ext.Direct.addProvider(HttpCommander.Remote.AdminHandler);
        var loadingMask = Ext.get('loading-mask');
        var loading = Ext.get('loading');
        if (loading) {
            loading.fadeOut({ duration: 0.2, remove: true });
            loadingMask.setOpacity(0.9);
            loadingMask.shift({
                xy: loading.getXY(),
                width: loading.getWidth(),
                height: loading.getHeight(),
                remove: true,
                duration: 1,
                opacity: 0.1,
                easing: 'bounceOut'
            });
        }

        // add user window
        addUserWindow = new Ext.Window({
            title: htcConfig.locData.AdminUsersPropertiesTitle,
            bodyStyle: 'padding:5px',
            layout: 'table',
            layoutConfig: { columns: 1 },
            resizable: false,
            closeAction: 'hide',
            width: 325,
            plain: true,
            autoHeight: true,
            items: [addUserInfo = new Ext.form.FieldSet({
                title: htcConfig.locData.AdminUsersGeneralInfo,
                labelWidth: 100,
                defaultType: 'textfield',
                items: [{
                    fieldLabel: htcConfig.locData.CommonFieldLabelUserName,
                    id: 'add-user-name',
                    name: 'name',
                    width: 170
                }, {
                    fieldLabel: htcConfig.locData.CommonFieldLabelPassword,
                    id: 'add-user-password',
                    name: 'password',
                    inputType: 'password',
                    width: 170
                }, {
                    fieldLabel: htcConfig.locData.CommonFieldLabelRepeatPassword,
                    id: 'add-user-password2',
                    name: 'password2',
                    inputType: 'password',
                    width: 170
                }, {
                    fieldLabel: htcConfig.locData.AdminUsersUserEmail,
                    id: 'add-user-email',
                    name: 'email',
                    width: 170
                }, {
                    fieldLabel: htcConfig.showAdminPanelCustomFields ? htcConfig.locData.AdminCommonCustomField : '',
                    hideLabel: !htcConfig.showAdminPanelCustomFields,
                    hidden: !htcConfig.showAdminPanelCustomFields,
                    id: 'add-user-custom-field',
                    name: 'customField',
                    width: 170
                }]
            }), addGridMembersOf = new Ext.grid.GridPanel({
                store: new Ext.data.ArrayStore({
                    fields: ['name', 'icon']
                }),
                multiSelect: true,
                height: 200,
                enableHdMenu: false,
                header: true,
                title: htcConfig.locData.AdminUsersGroups,
                selModel: new Ext.grid.RowSelectionModel({
                    singleSelect: false,
                    listeners: {
                        selectionchange: function (model) {
                            var removeButton = addGridMembersOf.getTopToolbar().findById('remove-member-of-add');
                            if (!!removeButton) {
                                removeButton.setDisabled(model.getCount() == 0);
                            }
                        }
                    }
                }),
                tbar: {
                    enableOverflow: true,
                    items: [{
                        text: htcConfig.locData.AdminCommandSelectGroups + '...',
                        id: 'add-member-of-add',
                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'add'),
                        handler: function () {
                            promptGroupsNames(addGridMembersOf.getStore().getRange(), function (usw, btn, groupsArray) {
                                if (btn == 'ok' && Ext.isArray(groupsArray) && groupsArray.length > 0) {
                                    var i = 0, len = groupsArray.length,
                                        store = addGridMembersOf.getStore(), items = store.getRange(),
                                        j = 0, dLen = items.length, newRecs = [],
                                        allGroupsExists = (dLen > 0),
                                        icon = HttpCommander.Lib.Utils.getIconPath(this, 'group');
                                    for (; i < len; i++) {
                                        var name = groupsArray[i];
                                        var lName = name.toLowerCase();
                                        var notFound = true;
                                        for (j = 0; j < dLen; j++) {
                                            if (lName == items[j].get('name').toLowerCase()) {
                                                notFound = false;
                                                break;
                                            }
                                        }
                                        if (notFound) {
                                            if (allGroupsExists) {
                                                allGroupsExists = false;
                                            }
                                            newRecs.push(new MemberRecord({
                                                name: name,
                                                icon: icon
                                            }));
                                        }
                                    }
                                    if (allGroupsExists) {
                                        Ext.Msg.show({
                                            title: htcConfig.locData.CommonErrorCaption,
                                            msg: htcConfig.locData.AdminUsersGroupAlreadyExists,
                                            icon: Ext.MessageBox.WARNING,
                                            buttons: Ext.Msg.CANCEL
                                        });
                                    } else {
                                        store.add(newRecs);
                                        store.commitChanges();
                                        addGridMembersOf.setTitle(htcConfig.locData.AdminUsersGroups + ' (' + store.data.items.length + ')');
                                        var selModel = addGridMembersOf.getSelectionModel();
                                        var lastIndex = store.data.items.length - 1;
                                        if (lastIndex >= 0) {
                                            selModel.selectRow(lastIndex, false);
                                            var view = addGridMembersOf.getView();
                                            var row = view.getRow(lastIndex);
                                            if (row) {
                                                row.scrollIntoView();
                                            }
                                        }
                                    }
                                }
                                setTimeout(function () {
                                    if (!!usw) {
                                        usw.close();
                                    }
                                }, 150);
                            });
                        }
                    }, {
                        text: htcConfig.locData.AdminCommandRemoveGroups,
                        id: 'remove-member-of-add',
                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'remove'),
                        disabled: true,
                        handler: function () {
                            var store = addGridMembersOf.getStore();
                            var selectedRecords = addGridMembersOf.getSelectionModel().getSelections();
                            if (Ext.isArray(selectedRecords) && selectedRecords.length > 0) {
                                store.remove(selectedRecords);
                                store.commitChanges();
                                addGridMembersOf.setTitle(htcConfig.locData.AdminUsersGroups + ' (' + store.data.items.length + ')');
                            }
                        }
                    }]
                },
                columns: [{
                    header: htcConfig.locData.CommonFieldLabelGroupName,
                    width: 275,
                    flex: 1,
                    dataIndex: 'name',
                    renderer: function (value, p, r) {
                        return "<img src='" + htcConfig.relativePath + r.data.icon + "' class='filetypeimage' />"
                            + Ext.util.Format.htmlEncode(value || '');
                    }
                }]
            })],
            listeners: {
                show: function (wnd) {
                    var store = addGridMembersOf.getStore();
                    store.commitChanges();
                    addGridMembersOf.setTitle(htcConfig.locData.AdminUsersGroups + ' (' + store.data.items.length + ')');
                }
            },
            buttons: [{
                text: htcConfig.locData.CommonButtonCaptionAdd,
                handler: function () {
                    var validationResult = validateAddUserData();
                    if (validationResult) {
                        Ext.Msg.show({
                            title: htcConfig.locData.CommonErrorCaption,
                            msg: validationResult,
                            icon: Ext.MessageBox.WARNING,
                            buttons: Ext.Msg.CANCEL
                        });
                    } else {
                        addUserWindow.hide();
                        var user = aggregateAddUserData();
                        gridUsers.loadMask.msg = htcConfig.locData.ProgressCreating + "...";
                        gridUsers.loadMask.show();
                        HttpCommander.Admin.AddUser(user, function (data, trans) {
                            gridUsers.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                            HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig);
                            gridUsers.getStore().reload();
                        });
                    }
                }
            }, {
                text: htcConfig.locData.CommonButtonCaptionCancel,
                handler: function () { addUserWindow.hide(); }
            }, {
                text: htcConfig.locData.AdminCommandHelp,
                handler: function () { navigateHelpAdminPanelWithFragment('users'); }
            }]
        });
        // end add user window

        // edit user window
        editUserWindow = new Ext.Window({
            title: htcConfig.locData.AdminUsersPropertiesTitle,
            bodyStyle: 'padding:5px',
            layout: 'table',
            layoutConfig: { columns: 1 },
            resizable: false,
            closeAction: 'hide',
            width: 300,
            plain: true,
            autoHeight: true,
            items: [editUserInfo = new Ext.form.FieldSet({
                title: htcConfig.locData.AdminUsersGeneralInfo,
                labelWidth: 75,
                defaultType: 'textfield',

                // name of the edited user
                // Since this form allows to change the name of the existing user,
                // we need to store the original name.
                userName: '',

                items: [{
                    fieldLabel: htcConfig.locData.CommonFieldLabelUserName,
                    id: 'edit-user-name',
                    name: 'name',
                    width: 170
                }, {
                    fieldLabel: htcConfig.locData.AdminUsersUserEmail,
                    id: 'edit-user-email',
                    name: 'email',
                    width: 170
                }, {
                    fieldLabel: htcConfig.showAdminPanelCustomFields ? htcConfig.locData.AdminCommonCustomField : '',
                    hideLabel: !htcConfig.showAdminPanelCustomFields,
                    hidden: !htcConfig.showAdminPanelCustomFields,
                    id: 'edit-user-custom-field',
                    name: 'customField',
                    width: 170
                }]
            }), editGridMembersOf = new Ext.grid.GridPanel({
                store: new Ext.data.ArrayStore({
                    fields: ['name', 'icon']
                }),
                multiSelect: true,
                height: 200,
                enableHdMenu: false,
                header: true,
                title: htcConfig.locData.AdminUsersGroups,
                selModel: new Ext.grid.RowSelectionModel({
                    singleSelect: false,
                    listeners: {
                        selectionchange: function (model) {
                            var removeButton = editGridMembersOf.getTopToolbar().findById('remove-member-of');
                            if (!!removeButton) {
                                removeButton.setDisabled(model.getCount() == 0);
                            }
                        }
                    }
                }),
                tbar: {
                    enableOverflow: true,
                    items: [{
                        text: htcConfig.locData.AdminCommandSelectGroups + '...',
                        id: 'add-member-of',
                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'add'),
                        handler: function () {
                            promptGroupsNames(editGridMembersOf.getStore().getRange(), function (usw, btn, groupsArray) {
                                if (btn == 'ok' && Ext.isArray(groupsArray) && groupsArray.length > 0) {
                                    var i = 0, len = groupsArray.length,
                                        store = editGridMembersOf.getStore(), items = store.getRange(),
                                        j = 0, dLen = items.length, newRecs = [],
                                        allGroupsExists = (dLen > 0),
                                        icon = HttpCommander.Lib.Utils.getIconPath(this, 'group');
                                    for (; i < len; i++) {
                                        var name = groupsArray[i];
                                        var lName = name.toLowerCase();
                                        var notFound = true;
                                        for (j = 0; j < dLen; j++) {
                                            if (lName == items[j].get('name').toLowerCase()) {
                                                notFound = false;
                                                break;
                                            }
                                        }
                                        if (notFound) {
                                            if (allGroupsExists) {
                                                allGroupsExists = false;
                                            }
                                            newRecs.push(new MemberRecord({
                                                name: name,
                                                icon: icon
                                            }));
                                        }
                                    }
                                    if (allGroupsExists) {
                                        Ext.Msg.show({
                                            title: htcConfig.locData.CommonErrorCaption,
                                            msg: htcConfig.locData.AdminUsersGroupAlreadyExists,
                                            icon: Ext.MessageBox.WARNING,
                                            buttons: Ext.Msg.CANCEL
                                        });
                                    } else {
                                        store.add(newRecs);
                                        store.commitChanges();
                                        editGridMembersOf.setTitle(htcConfig.locData.AdminUsersGroups + ' (' + store.data.items.length + ')');
                                        var selModel = editGridMembersOf.getSelectionModel();
                                        var lastIndex = store.data.items.length - 1;
                                        if (lastIndex >= 0) {
                                            selModel.selectRow(lastIndex, false);
                                            var view = editGridMembersOf.getView();
                                            var row = view.getRow(lastIndex);
                                            if (row) {
                                                row.scrollIntoView();
                                            }
                                        }
                                    }
                                }
                                setTimeout(function () {
                                    if (!!usw) {
                                        usw.close();
                                    }
                                }, 150);
                            });
                        }
                    }, {
                        text: htcConfig.locData.AdminCommandRemoveGroups,
                        id: 'remove-member-of',
                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'remove'),
                        disabled: true,
                        handler: function () {
                            var store = editGridMembersOf.getStore();
                            var selectedRecords = editGridMembersOf.getSelectionModel().getSelections();
                            if (Ext.isArray(selectedRecords) && selectedRecords.length > 0) {
                                store.remove(selectedRecords);
                                store.commitChanges();
                                editGridMembersOf.setTitle(htcConfig.locData.AdminUsersGroups + ' (' + store.data.items.length + ')');
                            }
                        }
                    }]
                },
                columns: [{
                    header: htcConfig.locData.CommonFieldLabelGroupName,
                    width: 250,
                    flex: 1,
                    dataIndex: 'name',
                    renderer: function (value, p, r) {
                        return "<img src='" + htcConfig.relativePath + r.data.icon + "' class='filetypeimage' />"
                            + Ext.util.Format.htmlEncode(value || '');
                    }
                }]
            })],
            listeners: {
                show: function (wnd) {
                    var store = editGridMembersOf.getStore();
                    store.commitChanges();
                    editGridMembersOf.setTitle(htcConfig.locData.AdminUsersGroups + ' (' + store.data.items.length + ')');
                },
                hide: function (window) {
                    if (gridUsers) {
                        var indRow = -1;
                        var store = gridUsers.getStore();
                        if (store) {
                            var selRow = gridUsers.getSelectionModel().getSelected();
                            if (selRow) indRow = store.indexOf(selRow);
                            else if (store.getCount() > 0) indRow = 0;
                        }
                        if (indRow >= 0) gridUsers.getView().focusRow(indRow);
                    }
                }
            },
            buttons: [{
                text: htcConfig.locData.CommandSave,
                id: 'edit',
                handler: function () {
                    var validationResult = validateEditUserData();
                    if (validationResult) {
                        Ext.Msg.show({
                            title: htcConfig.locData.CommonErrorCaption,
                            msg: validationResult,
                            icon: Ext.MessageBox.WARNING,
                            buttons: Ext.Msg.CANCEL
                        });
                    } else {
                        editUserWindow.hide();
                        var user = aggregateEditUserData();
                        HttpCommander.Admin.UpdateUser(user, function (data, trans) {
                            gridUsers.loadMask.msg = htcConfig.locData.ProgressUpdating + "...";
                            if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                                if (data.digest) {// Added by ChessarX, 21.02.2011
                                    Ext.Msg.alert(htcConfig.locData.CommonWarningCaption, data.digest);
                                }
                            }
                            gridUsers.getStore().reload();
                        });
                    }
                }
            }, {
                text: htcConfig.locData.CommonButtonCaptionCancel,
                handler: function () { editUserWindow.hide(); }
            }, {
                text: htcConfig.locData.AdminCommandHelp,
                handler: function () { navigateHelpAdminPanelWithFragment('users'); }
            }]
        });
        // end edit user window

        // set user password window
        setUserPasswordWindow = new Ext.Window({
            title: htcConfig.locData.AdminUsersSetPasswordTitle,
            bodyStyle: 'padding:5px',
            layout: 'table',
            layoutConfig: { columns: 1 },
            resizable: false,
            plain: true,
            closeAction: 'hide',
            width: 325,
            items: [setUserPasswordInfo = new Ext.form.FieldSet({
                title: htcConfig.locData.AdminUsersGeneralInfo,
                labelWidth: 100,
                defaultType: 'textfield',
                items: [{
                    fieldLabel: htcConfig.locData.CommonFieldLabelUserName,
                    id: 'set-user-password-name',
                    name: 'name',
                    disabled: true,
                    width: 170
                }, {
                    fieldLabel: htcConfig.locData.CommonFieldLabelPassword,
                    id: 'set-user-password-password',
                    name: 'password',
                    inputType: 'password',
                    width: 170
                }, {
                    fieldLabel: htcConfig.locData.CommonFieldLabelRepeatPassword,
                    id: 'set-user-password-password2',
                    name: 'password2',
                    inputType: 'password',
                    width: 170
                }]
            })],
            buttons: [{
                text: htcConfig.locData.CommandSave,
                id: 'save',
                handler: function () {
                    var validationResult = validateSetUserPasswordData();
                    if (validationResult) {
                        Ext.Msg.show({
                            title: htcConfig.locData.CommonErrorCaption,
                            msg: validationResult,
                            icon: Ext.MessageBox.WARNING,
                            buttons: Ext.Msg.CANCEL
                        });
                    } else {
                        setUserPasswordWindow.hide();
                        var user = aggregateSetUserPasswordData();
                        HttpCommander.Admin.SetUserPassword(user, function (data, trans) {
                            gridUsers.loadMask.msg = htcConfig.locData.ProgressUpdating + "...";
                            HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig);
                            gridUsers.getStore().reload();
                        });
                    }
                }
            }, {
                text: htcConfig.locData.CommonButtonCaptionCancel,
                handler: function () { setUserPasswordWindow.hide(); }
            }, {
                text: htcConfig.locData.AdminCommandHelp,
                handler: function () { navigateHelpAdminPanelWithFragment('users'); }
            }]
        });
        // end set user password window

        userHelpWindow = HttpCommander.Lib.AdminUserHelpWindow({
            'htcConfig': htcConfig
        });

        // add/edit group window
        groupWindow = new Ext.Window({
            title: htcConfig.locData.AdminGroupsPropertiesTitle,
            isEditing: false,
            bodyStyle: 'padding:5px',
            layout: 'table',
            layoutConfig: { columns: 1 },
            resizable: false,
            closeAction: 'hide',
            width: 260,
            plain: true,
            autoHeight: true,
            items: [groupInfo = new Ext.form.FieldSet({
                title: htcConfig.locData.AdminGroupsGeneralInfo,
                labelWidth: 75,
                defaultType: 'textfield',

                // '' if isEditing is false,
                // name of the edited user if isEditing is true.
                // Since this form allows to change the name of the existing group,
                // we need to store the original name.
                groupName: '',

                items: [{
                    fieldLabel: htcConfig.locData.CommonFieldLabelGroupName,
                    id: 'group-name',
                    name: 'name',
                    width: 130
                }, {
                    fieldLabel: htcConfig.showAdminPanelCustomFields ? htcConfig.locData.AdminCommonCustomField : '',
                    hideLabel: !htcConfig.showAdminPanelCustomFields,
                    hidden: !htcConfig.showAdminPanelCustomFields,
                    id: 'group-custom-field',
                    name: 'customField',
                    width: 130
                }]
            }), gridMembers = new Ext.grid.GridPanel({
                store: new Ext.data.ArrayStore({
                    fields: ['name', 'icon']
                }),
                multiSelect: true,
                height: 200,
                enableHdMenu: false,
                header: true,
                title: htcConfig.locData.AdminGroupsUsers,
                selModel: new Ext.grid.RowSelectionModel({
                    singleSelect: false,
                    listeners: {
                        selectionchange: function (model) {
                            var removeButton = gridMembers.getTopToolbar().findById('remove-member');
                            if (!!removeButton) {
                                removeButton.setDisabled(model.getCount() == 0);
                            }
                        }
                    }
                }),
                tbar: {
                    enableOverflow: true,
                    items: [{
                        text: htcConfig.locData.AdminCommandSelectUsers + '...',
                        id: 'add-member',
                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'add'),
                        handler: function () {
                            promptUsersNames(gridMembers.getStore().getRange(), function (usw, btn, usersArray) {
                                if (btn == 'ok' && Ext.isArray(usersArray) && usersArray.length > 0) {
                                    var i = 0, len = usersArray.length,
                                        store = gridMembers.getStore(), items = store.getRange(),
                                        j = 0, dLen = items.length, newRecs = [],
                                        allUsersExists = (dLen > 0),
                                        icon = HttpCommander.Lib.Utils.getIconPath(this, 'user');
                                    for (; i < len; i++) {
                                        var name = usersArray[i];
                                        var lName = name.toLowerCase();
                                        var notFound = true;
                                        for (j = 0; j < dLen; j++) {
                                            if (lName == items[j].get('name').toLowerCase()) {
                                                notFound = false;
                                                break;
                                            }
                                        }
                                        if (notFound) {
                                            if (allUsersExists) {
                                                allUsersExists = false;
                                            }
                                            newRecs.push(new MemberRecord({
                                                name: name,
                                                icon: icon
                                            }));
                                        }
                                    }
                                    if (allUsersExists) {
                                        Ext.Msg.show({
                                            title: htcConfig.locData.CommonErrorCaption,
                                            msg: htcConfig.locData.AdminGroupsUserAlreadyExists,
                                            icon: Ext.MessageBox.WARNING,
                                            buttons: Ext.Msg.CANCEL
                                        });
                                    } else {
                                        store.add(newRecs);
                                        store.commitChanges();
                                        gridMembers.setTitle(htcConfig.locData.AdminGroupsUsers + ' (' + store.data.items.length + ')');
                                        var selModel = gridMembers.getSelectionModel();
                                        var lastIndex = store.data.items.length - 1;
                                        if (lastIndex >= 0) {
                                            selModel.selectRow(lastIndex, false);
                                            var view = gridMembers.getView();
                                            var row = view.getRow(lastIndex);
                                            if (row) {
                                                row.scrollIntoView();
                                            }
                                        }
                                    }
                                }
                                setTimeout(function () {
                                    if (!!usw) {
                                        usw.close();
                                    }
                                }, 150);
                            });
                        }
                    }, {
                        text: htcConfig.locData.AdminCommandRemoveUsers,
                        id: 'remove-member',
                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'remove'),
                        disabled: true,
                        handler: function () {
                            var store = gridMembers.getStore();
                            var selectedRecords = gridMembers.getSelectionModel().getSelections();
                            if (Ext.isArray(selectedRecords) && selectedRecords.length > 0) {
                                store.remove(selectedRecords);
                                store.commitChanges();
                                gridMembers.setTitle(htcConfig.locData.AdminGroupsUsers + ' (' + store.data.items.length + ')');
                            }
                        }
                    }]
                },
                columns: [{
                    header: htcConfig.locData.CommonFieldLabelUserName,
                    width: 215,
                    dataIndex: 'name',
                    renderer: function (value, p, r) {
                        return "<img src='" + htcConfig.relativePath + r.data.icon + "' class='filetypeimage' />"
                            + Ext.util.Format.htmlEncode(value || '');
                    }
                }]
            })],
            listeners: {
                show: function (wnd) {
                    var store = gridMembers.getStore();
                    store.commitChanges();
                    gridMembers.setTitle(htcConfig.locData.AdminGroupsUsers + ' (' + store.data.items.length + ')');
                },
                hide: function (window) {
                    if (gridGroups) {
                        var indRow = -1;
                        var store = gridGroups.getStore();
                        if (store) {
                            var selRow = gridGroups.getSelectionModel().getSelected();
                            if (selRow) indRow = store.indexOf(selRow);
                            else if (store.getCount() > 0) indRow = 0;
                        }
                        if (indRow >= 0) gridGroups.getView().focusRow(indRow);
                    }
                }
            },
            buttons: [{
                text: htcConfig.locData.CommonButtonCaptionAdd,
                id: 'add-edit-group',
                handler: function () {
                    var validationResult = validateGroupData();
                    if (validationResult) {
                        Ext.Msg.show({
                            title: htcConfig.locData.CommonErrorCaption,
                            msg: validationResult,
                            icon: Ext.MessageBox.WARNING,
                            buttons: Ext.Msg.CANCEL
                        });
                    } else {
                        groupWindow.hide();
                        var group = aggregateGroupData();
                        if (!groupWindow.isEditing) {
                            gridGroups.loadMask.msg = htcConfig.locData.ProgressCreating + "...";
                            gridGroups.loadMask.show();
                            HttpCommander.Admin.AddGroup(group, function (data, trans) {
                                gridGroups.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                                HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig);
                                gridGroups.getStore().reload();
                            });
                        } else {
                            HttpCommander.Admin.UpdateGroup(group, function (data, trans) {
                                gridGroups.loadMask.msg = htcConfig.locData.ProgressUpdating + "...";
                                HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig);
                                gridGroups.getStore().reload();
                            });
                        }
                    }
                }
            }, {
                text: htcConfig.locData.CommonButtonCaptionCancel,
                handler: function () { groupWindow.hide(); }
            }, {
                text: htcConfig.locData.AdminCommandHelp,
                handler: function () { navigateHelpAdminPanelWithFragment('users'); }
            }]
        });
        // end add/edit group window

        var commonFolderInfoItems = [{
            fieldLabel: htcConfig.locData.CommonFolderNameCaption + '*',
            id: 'folder-name',
            name: 'name',
            width: 225
        }];
        if (showListForAllowedFolders) {
            commonFolderInfoItems.push({
                xtype: 'combo',
                fieldLabel: htcConfig.locData.AdminFoldersFolderPath + '*',
                name: 'path',
                width: 225,
                id: 'folder-path',
                displayField: 'path',
                mode: 'remote',
                resizable: true,
                tpl: '<tpl for="."><div ext:qtip="{encodedPath}" class="x-combo-list-item" style="margin-left:{level}px;">'
                + (htcConfig.showRelativePathInAFL
                    ? '<img alt="" width="16" height="16" style="vertical-align:top;" src="' + HttpCommander.Lib.Utils.getIconPath(this, 'folder') + '" />&nbsp;{name:htmlEncode}'
                    : '{path:htmlEncode}')
                + '</div></tpl>',
                triggerAction: 'all',
                loadingText: htcConfig.locData.ProgressLoading + '...',
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
            });
        } else {
            commonFolderInfoItems.push({
                xtype: 'container',
                layout: 'hbox',
                width: 225,
                fieldLabel: htcConfig.locData.AdminFoldersFolderPath + '*',
                items: [{
                    id: 'folder-path',
                    name: 'path',
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
                        },
                        keyup: function (field, eo) {
                            var val = field.getValue();
                            if (val && ((val = val.trim()).indexOf('\\\\') == 0 || val.indexOf('//') == 0)) {
                                var isFormsAuth = htcConfig.hcAuthMode == 'forms';
                                document.getElementById('share-note').innerHTML = String.format(
                                    htcConfig.locData[isFormsAuth ? 'AdminFoldersFolderRemoteWarningForms' : 'AdminFoldersFolderRemoteWarningWin'],
                                    '<br /><a href="Manual/faq.html#' + (isFormsAuth ? 'accessshredfolder' : 'abe') + '" target="_blank">',
                                    '</a>'
                                );
                            } else {
                                document.getElementById('share-note').innerHTML = '';
                            }
                        }
                    }
                }, {
                    id: 'create-folder-button',
                    xtype: 'button',
                    icon: HttpCommander.Lib.Utils.getIconPath(this, 'createfolder'),
                    tooltip: htcConfig.locData.AdminFoldersFolderCreate,
                    handler: function () {
                        var pathField = Ext.getCmp('folder-path');
                        var path = '';
                        if (pathField && !(new RegExp('^\\s*$', 'i')).test(path = pathField.getValue())) {
                            gridFolders.loadMask.msg = htcConfig.locData.AdminFoldersFolderCreateProcess + "...";
                            gridFolders.loadMask.show();
                            HttpCommander.Admin.CreateFolder({ path: path }, function (data, trans) {
                                gridFolders.loadMask.hide();
                                gridFolders.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                                    //if (path.toLowerCase() != data.createdPath.toLowerCase()) {
                                    //    pathField.setValue(data.createdPath);
                                    //}
                                    Ext.Msg.show({
                                        title: htcConfig.locData.AdminFoldersFolderCreate,
                                        msg: String.format(htcConfig.locData.AdminFoldersFolderCreateSuccessfully,
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
            });
        }
        commonFolderInfoItems.push({
            xtype: 'hidden',
            id: 'original-folder-path'
        });
        window.onClickShares = function () {
            promptShareName(function (btn, text) {
                if (btn == 'ok') {
                    Ext.getCmp('folder-path').setValue(text);
                }
            });
        };
        var winSearchQueryWindow = !htcConfig.wsqbEnabled ? null : new Ext.Window({
            title: 'Windows Search Query Builder',
            width: 500,
            height: 400,
            plain: true,
            resizable: true,
            maximizable: true,
            closeAction: 'hide',
            layout: {
                type: 'vbox',
                padding: '5',
                align: 'stretch'
            },
            tools: [{
                id: 'help',
                qtip: 'Windows Search Help',
                handler: function(event, toolEl, panel){
                    window.open(htcConfig.relativePath + 'Manual/WindowsSearch.html', '_blank');
                }
            }],
            defaults: {
                anchor: '100%',
                flex: 1,
                defaults: { margins: '0 0 5 0' }
            },
            keys: {
                key: 13,
                ctrl: true,
                fn: function (e) {
                    winSearchQueryWindow.executeQuery();
                },
                scope: winSearchQueryWindow
            },
            items: [{
                itemId: 'query',
                xtype: 'textarea',
                style: 'font-size:11px;font-family:Courier New;',
                split: true,
                emptyText: 'Enter the SQL query and click "Execute" or CTRL + ENTER',
                collapsible: true,
                region: 'north'
            }, {
                itemId: 'results',
                xtype: 'grid',
                remoteSort: false,
                layout: 'fit',
                forceFit: true,
                flex: 1.7,
                region: 'center',
                style: {
                    marginTop: '2px'
                },
                stripeRows: true,
                rowLines: true,
                tbar: [{
                    itemId: 'enable-log-errors',
                    xtype: 'checkbox',
                    boxLabel: 'Enable logging of errors'
                }, '->', {
                    text: 'Clear',
                    handler: function () {
                        var me = winSearchQueryWindow;
                        me.getComponent('query').setValue(null);
                        var grd = me.getComponent('results');
                        grd.reconfigure(new Ext.data.JsonStore({
                            autoDestroy: true,
                            root: 'data',
                            fields: [{ name: 'num', type: 'int' }]
                        }), new Ext.grid.ColumnModel([{
                            header: '#',
                            dataIndex: 'num',
                            width: 40,
                            fixed: true,
                            sortable: true
                        }, {
                            header: 'And here you see the result'
                        }]));
                        grd.getStore().loadData({ data: [] });
                        grd.syncSize();
                        grd.getView().refresh(true);
                    }
                }],
                viewConfig: {
                    forceFit: true,
                    autoFill: true
                },
                split: true,
                store: new Ext.data.ArrayStore({
                    autoDestroy: true,
                    fields: [{name: 'num', type: 'int'}]
                }),
                columns: [{
                    header: '#',
                    dataIndex: 'num',
                    width: 40,
                    fixed: true,
                    sortable: true
                }, {
                    header: 'And here you see the result'
                }]
            }],
            buttonAlign: 'left',
            buttons: [{
                xtype: 'box',
                autoEl: {
                    tag: 'a',
                    target: '_blank',
                    href: 'https://msdn.microsoft.com/en-us/library/windows/desktop/bb231256.aspx',
                    html: 'SQL Syntax'
                }
            }, {
                xtype: 'box',
                autoEl: {
                    tag: 'a',
                    target: '_blank',
                    href: 'https://msdn.microsoft.com/en-us/library/windows/desktop/dd561977.aspx',
                    html: 'Columns'
                }
            }, '->', {
                text: 'Close',
                handler: function () {
                    winSearchQueryWindow.hide();
                }
            }, {
                text: 'Execute',
                handler: function (btn) {
                    winSearchQueryWindow.executeQuery.call(winSearchQueryWindow);
                }
            }],
            'executeQuery': function () {
                var me = this;
                var q = me.getComponent('query').getValue();
                var grd = me.getComponent('results');
                var e = grd.getTopToolbar().getComponent('enable-log-errors').getValue();
                me.body.mask('Executing...');
                var oldAjaxTimeout = Ext.Ajax.timeout;
                Ext.Ajax.timeout = 5 * 60 * 1000;
                HttpCommander.Admin.ExecuteWindowsSearchQuery({ q: q, e: e }, function (data, trans) {
                    Ext.Ajax.timeout = oldAjaxTimeout;
                    me.body.unmask();
                    if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                        var res = data.data, i = 0, fn,
                            grd = me.getComponent('results'),
                            fields = [{ name: 'num', type: 'int' }],
                            cols = [{ header: '#', dataIndex: 'num', width: 40, fixed: true, sortable: true }];
                        if (Ext.isArray(res) && res.length > 0) {
                            var first = res[0];
                            i = 0;
                            for (var p in first) {
                                if (first.hasOwnProperty(p)) {
                                    fn = String(p);
                                    fields.push(fn);
                                    cols.push({
                                        header: fn,
                                        dataIndex: fn,
                                        renderer: wordWrapRenderer,
                                        sortable: true
                                    })
                                    i++;
                                }
                            }
                        } else {
                            data.data = [];
                        }
                        for (i = 0; i < data.data.length; i++) {
                            data.data[i]['num'] = (i+1);
                        }
                        grd.reconfigure(new Ext.data.JsonStore({
                            autoDestroy: true,
                            root: 'data',
                            fields: fields
                        }), new Ext.grid.ColumnModel(cols));
                        grd.getStore().loadData(data);
                        grd.syncSize();
                        grd.getView().refresh(true);
                    }
                });
            }
        });
        window.testAccessHandler = function () {
            var pathInfo = { path: Ext.getCmp('folder-path').getValue() };
            gridFolders.loadMask.msg = htcConfig.locData.ProgressTestAccess + "...";
            gridFolders.loadMask.show();
            HttpCommander.Admin.TestAccess(pathInfo, function (data, trans) {
                gridFolders.loadMask.hide();
                gridFolders.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                    Ext.Msg.show({
                        title: htcConfig.locData.AdminFoldersTestAccessButton,
                        msg: data.message,
                        closable: true,
                        modal: true,
                        buttons: Ext.Msg.OK,
                        icon: data.error ? Ext.Msg.ERROR : (data.success ? Ext.Msg.INFO : Ext.Msg.WARNING)
                    });
                }
            });
        };
        window.testIndexingHandler = !htcConfig.wSearchEnabled ? Ext.emptyFn : function () {
            var testIndexingImpl = function (pathInfo) {
                gridFolders.loadMask.msg = htcConfig.locData.ProgressTestIndexing + "...";
                gridFolders.loadMask.show();
                HttpCommander.Admin.TestIndexing(pathInfo, function (data, trans) {
                    gridFolders.loadMask.hide();
                    gridFolders.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                    if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                        var isIndexed = (data.indexed > 1);
                        var langKey = isIndexed
                            ? 'AdminTestIndexingYesResult'
                            : data.indexed <= 0
                                ? 'AdminTestIndexingUnknownResult'
                                : 'AdminTestIndexingNoResult';
                        var linkToIndexing = '';
                        if (!isIndexed) {
                            linkToIndexing += '<br />' + String.format(htcConfig.locData.AdminHowToIndexingLocationLink,
                                '<a href="javascript:showHelpWindow(\'Manual/WindowsSearch.html#indexing\');" target="_self">Windows&nbsp;Search</a>');
                        }
                        Ext.Msg.show({
                            title: htcConfig.locData.AdminFoldersTestIndexingButton,
                            msg: Ext.util.Format.htmlEncode(String.format(htcConfig.locData[langKey], pathInfo.path))
                                + linkToIndexing,
                            closable: true,
                            modal: true,
                            buttons: Ext.Msg.OK,
                            icon: Ext.Msg[data.indexed > 1 ? 'INFO' : 'WARNING']
                        });
                    }
                });
            };
            var pathInfo = {
                path: Ext.getCmp('folder-path').getValue(),
                add: true
            };
            // only if not demo mode allowed add folder to indexed locations
            if (!Ext.isEmpty(htcConfig.demoLogoHeader)) {
                pathInfo.add = false;
            } else {
                var trimmedPath = pathInfo.path.trim();
                if (trimmedPath.indexOf('\\\\') == 0 || trimmedPath.indexOf('//') == 0) {
                    pathInfo.add = false;
                }
            }
            if (!pathInfo.add) {
                testIndexingImpl(pathInfo);
                return;
            }
            Ext.Msg.show({
                title: htcConfig.locData.AdminFoldersTestIndexingButton,
                msg: htcConfig.locData.AdminTestIndexingAddIfNotIndexed,
                closable: true,
                modal: true,
                buttons: Ext.Msg.YESNOCANCEL,
                icon: Ext.Msg.QUESTION,
                fn: function (btn, text) {
                    if (btn != 'cancel') {
                        pathInfo.add = (btn == 'yes');
                        testIndexingImpl(pathInfo);
                    }
                }
            });
        };
        window.validateFilterHandler = function () {
            try {
                if (folderWindow && folderWindow.isVisible()) {
                    var folderFilterField = folderWindow.findById('folder-filter-field');
                    if (folderFilterField) {
                        folderFilterField.clearInvalid();
                        gridFolders.loadMask.msg = htcConfig.locData.ProgressExecuting + "...";
                        gridFolders.loadMask.show();
                        HttpCommander.Admin.ValidateFolderFilter({ filter: folderFilterField.getValue() }, function (data, trans) {
                            gridFolders.loadMask.hide();
                            gridFolders.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                            if (typeof data == 'undefined' || !data) {
                                Ext.Msg.alert(htcConfig.locData.CommonErrorCaption, Ext.util.Format.htmlEncode(trans.message));
                                return;
                            }
                            if (!data.success && folderFilterField && data.message) {
                                folderFilterField.markInvalid(data.message);
                                Ext.Msg.show({
                                    title: htcConfig.locData.AdminCommonValidateField,
                                    msg: data.message,
                                    closable: true,
                                    modal: true,
                                    buttons: Ext.Msg.OK,
                                    icon: Ext.Msg.ERROR
                                });
                            } else {
                                Ext.Msg.show({
                                    title: htcConfig.locData.AdminCommonValidateField,
                                    msg: htcConfig.locData.AdminFoldersFolderFilterSuccess,
                                    closable: true,
                                    modal: true,
                                    buttons: Ext.Msg.OK,
                                    icon: Ext.Msg.INFO
                                });
                            }
                        });
                    }
                }
            } catch (e) {
                // ignore
            }
        };
        var s1s2 = (htcConfig.winAuth ? 1 : 0) + (htcConfig.wSearchEnabled ? 1 : 0);
        s1s2 = Math.round((310 - 4 * s1s2) / (1 + s1s2)) - 1;
        commonFolderInfoItems.push({
            hideLabel: true,
            width: 310,
            defaultType: 'label',
            layout: 'column',
            xtype: 'container',
            defaults: {
                width: s1s2
            },
            style: {
                paddingBottom: '7px',
                textAlign: 'right'
            },
            items: [{
                hidden: !htcConfig.winAuth,
                html: '<a href="#" target="_self" onclick="onClickShares(); return false;">'
                    + Ext.util.Format.ellipsis(htcConfig.locData.AdminFoldersSharesButton, 15) + '</a>',
                tooltip: htcConfig.locData.AdminFoldersSharesButton
            }, {
                width: 4,
                hidden: !htcConfig.winAuth,
                html: '&nbsp;&nbsp;&nbsp;'
            }, {
                html: '<a href="#" target="_self" onclick="testAccessHandler(); return false;">'
                    + Ext.util.Format.ellipsis(htcConfig.locData.AdminFoldersTestAccessButton, 15) + '</a>',
                tooltip: htcConfig.locData.AdminFoldersTestAccessButton
            }, {
                hidden: !htcConfig.wSearchEnabled,
                width: 4,
                html: '&nbsp;&nbsp;&nbsp;'
            }, {
                hidden: !htcConfig.wSearchEnabled,
                html: genQuestionIconWithUrl('Windows Search Service', 'Manual/WindowsSearch.html')
                    + '&nbsp;<a href="#" target="_self" onclick="testIndexingHandler(); return false;">'
                    + Ext.util.Format.ellipsis(htcConfig.locData.AdminFoldersTestIndexingButton, 15) + '</a>',
                tooltip: htcConfig.locData.AdminFoldersTestIndexingButton
            }],
            listeners: {
                afterrender: function (field) {
                    //field.label.dom.style.display = 'none';
                }
            }
        });
        commonFolderInfoItems.push({
            fieldLabel: htcConfig.locData.AdminFoldersFolderLimitations,//+ htcConfig.locData.AdminFoldersFolderOptional,
            xtype: 'textarea',
            id: 'folder-limitations',
            name: 'limitations',
            width: 225,
            height: 24
        });
        commonFolderInfoItems.push({
            fieldLabel: htcConfig.locData.AdminFoldersFolderDescription, //+ htcConfig.locData.AdminFoldersFolderOptional,
            xtype: 'textarea',
            id: 'folder-description',
            name: 'path',
            width: 225,
            height: 24
        });
        commonFolderInfoItems.push({
            hideLabel: !htcConfig.showAdminPanelCustomFields,
            fieldLabel: htcConfig.showAdminPanelCustomFields ? (htcConfig.locData.AdminCommonCustomField
                /*+ htcConfig.locData.AdminFoldersFolderOptional*/) : '',
            xtype: 'textfield',// 'textarea',
            id: 'folder-custom-field',
            name: 'customField',
            width: 225,
            //height: 40,
            hidden: !htcConfig.showAdminPanelCustomFields
        });
        if (htcConfig.winAuth && htcConfig.isFullAdmin) {
            commonFolderInfoItems.push({
                fieldLabel: htcConfig.locData.AdminFoldersFolderQuota
                    + genHintWithQuestionIcon(htcConfig.locData.AdminFoldersFolderQuotaHint),//+ htcConfig.locData.AdminFoldersFolderOptional,
                id: 'quota-limit',
                name: 'quota',
                width: 225
            });
            commonFolderInfoItems.push({
                labelWidth: 90,
                fieldLabel: "<a href='javascript:navigateHelpAdminPanelWithFragment(\"quota\")'>"
                        + htcConfig.locData.AdminFoldersFolderQuotaMoreInfoLink + "</a>",
                labelStyle: 'color:#dfe8f6;',
                width: 225,
                defaultType: 'button',
                layout: 'column', //'hbox',
                xtype: 'container',
                items: [
            {
                xtype: 'button',
                width: 112,
                text: Ext.util.Format.ellipsis(htcConfig.locData.AdminFoldersGetQuotaButton, 15),
                handler: function () {
                    var folderPathField = folderWindow.findById('folder-path');
                    if (folderPathField.getValue() == '')
                        return;
                    var pathInfo = { path: folderPathField.getValue() };
                    gridFolders.loadMask.msg = htcConfig.locData.ProgressExecuting + "...";
                    gridFolders.loadMask.show();
                    var oldAjaxTimeout = Ext.Ajax.timeout;
                    Ext.Ajax.timeout = 5 * 60 * 1000;
                    HttpCommander.Admin.GetQuotaLimit(pathInfo, function (data, trans) {
                        Ext.Ajax.timeout = oldAjaxTimeout;
                        gridFolders.loadMask.hide();
                        gridFolders.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                        var quotaLimitField = folderWindow.findById('quota-limit');
                        quotaLimitField.setValue('');
                        if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                            quotaLimitField.setValue(data.quota);
                        }
                    });
                },
                tooltip: htcConfig.locData.AdminFoldersGetQuotaButton
            },
            {
                xtype: 'label',
                width: 4,
                html: '&nbsp;&nbsp;&nbsp;'
            },
            {
                xtype: 'button',
                width: 112,
                text: Ext.util.Format.ellipsis(htcConfig.locData.AdminFoldersSetQuotaButton, 15),
                handler: function () {
                    var folderPathField = folderWindow.findById('folder-path');
                    if (folderPathField.getValue() == '')
                        return;
                    var quotaLimitField = folderWindow.findById('quota-limit');
                    var quota = quotaLimitField.getValue();
                    quota = parseInt(quota);
                    quotaLimitField.setValue(quota);
                    if (!(quota > 0)) {
                        quotaLimitField.focus();
                        Ext.Msg.alert(htcConfig.locData.CommonErrorCaption, htcConfig.locData.FsrmInvalidQuotaValueMsg);
                        return;
                    }
                    var pathInfo = { path: folderPathField.getValue(), quota: quota };
                    gridFolders.loadMask.msg = htcConfig.locData.ProgressExecuting + "...";
                    gridFolders.loadMask.show();
                    var oldAjaxTimeout = Ext.Ajax.timeout;
                    Ext.Ajax.timeout = 5 * 60 * 1000;
                    HttpCommander.Admin.SetQuotaLimit(pathInfo, function (data, trans) {
                        Ext.Ajax.timeout = oldAjaxTimeout;
                        gridFolders.loadMask.hide();
                        gridFolders.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                        if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                            Ext.Msg.alert(htcConfig.locData.CommonInfoCaption, htcConfig.locData.FsrmQuotaSetMsg);
                        }
                    });
                },
                tooltip: htcConfig.locData.AdminFoldersSetQuotaButton
            }]
            });
        }
        commonFolderInfoItems.push({
            fieldLabel: htcConfig.locData.AdminCommonFilterField
                + //htcConfig.locData.AdminFoldersFolderOptional +
                ":<br /><a href='javascript:navigateHelpAdminPanelWithFragment(\"filter\")'>"
                    + htcConfig.locData.AdminFoldersFolderQuotaMoreInfoLink + "</a>"
                    + "<br /><a id='validateFilterLink' style='display:none;' href='#' target='_self' onclick='validateFilterHandler(); return false;'>"
                    + htcConfig.locData.AdminCommonValidateField + "</a>",
            labelSeparator: '',
            xtype: 'textarea',
            id: 'folder-filter-field',
            name: 'filterField',
            width: 225,
            height: 24,
            toggleValidateLink: function (val) {
                try {
                    var link = document.getElementById('validateFilterLink');
                    if (link) {
                        if (val && String(val).trim().length > 0)
                            link.style.display = '';
                        else
                            link.style.display = 'none';
                    }
                } catch (e) { }
            },
            listeners: {
                change: function (fa, newValue, oldValue) {
                    fa.toggleValidateLink(newValue);
                },
                show: function (fa) {
                    fa.toggleValidateLink(fa.getValue());
                }
            }
        });
        folderWindow = new Ext.Window({
            title: htcConfig.locData.AdminFoldersPropertiesTitle,
            width: 700,
            cls: 'admin-folder-window',
            autoHeight: true,
            plain: true,
            isEditing: false,
            bodyStyle: 'padding:5px',
            layout: 'table',
            layoutConfig: {
                columns: 2
            },
            resizable: false,
            closeAction: 'hide',
            items: [commonFolderInfo = new Ext.form.FieldSet({
                title: htcConfig.locData.AdminFoldersGeneralInfo + genHintWithQuestionIcon(htcConfig.locData.AdminFoldersGeneralInfoHint),
                labelWidth: 90,// 75,
                defaultType: 'textfield',
                items: commonFolderInfoItems,
                autoHeight: true,
                style: {
                    marginBottom: '0px',
                    paddingBottom: '2px'
                }
            }), fpPermissions = new Ext.form.FormPanel({
                width: 332,
                cellCls: 'tlcell',
                bodyStyle: 'padding:5px',
                rowspan: 2,
                header: true,
                disabled: true,
                autoHeight: true,
                title: htcConfig.locData.AdminFoldersPermissions,
                items:
                [
                    new Ext.form.FieldSet({
                        title: htcConfig.locData.AdminFoldersAccessControl + genHintWithQuestionIcon(getPermissionHintMsg()),
                        id: 'access',
                        layout: 'column',
                        defaults: { columnWidth: '.5', border: false },
                        defaultType: 'checkbox',
                        items:
                        [
                            { name: 'create', boxLabel: htcConfig.locData.AdminFoldersCreate, id: 'create' },
                            { name: 'del', boxLabel: htcConfig.locData.AdminFoldersDelete, id: 'del' },
                            { name: 'rename', boxLabel: htcConfig.locData.AdminFoldersRename, id: 'rename' },
                            { name: 'upload', boxLabel: htcConfig.locData.AdminFoldersUpload, id: 'upload' },
                            { name: 'download', boxLabel: htcConfig.locData.AdminFoldersDownload, id: 'download' },
                            { name: 'zipDownload', boxLabel: htcConfig.locData.AdminFoldersZipDownload, id: 'zipDownload' },
                            { name: 'zip', boxLabel: htcConfig.locData.AdminFoldersZip, id: 'zip' },
                            { name: 'unzip', boxLabel: htcConfig.locData.AdminFoldersUnzip, id: 'unzip' },
                            { name: 'cut', boxLabel: htcConfig.locData.AdminFoldersCut, id: 'cut' },
                            { name: 'copy', boxLabel: htcConfig.locData.AdminFoldersCopy, id: 'copy' },
                            { name: 'listFiles', boxLabel: htcConfig.locData.AdminFoldersListFiles, id: 'listFiles' },
                            { name: 'listFolders', boxLabel: htcConfig.locData.AdminFoldersListFolders, id: 'listFolders' },
                            { name: 'modify', boxLabel: htcConfig.locData.AdminFoldersModify, id: 'modify' },
                            { name: 'bulkMailing', boxLabel: htcConfig.locData.AdminFoldersBulkMailing, id: 'bulkMailing' },
                            { name: 'anonymDownload', boxLabel: htcConfig.locData.AdminFoldersAnonymDownload, id: 'anonymDownload' },
                            { name: 'anonymViewContent', boxLabel: htcConfig.locData.AdminFoldersAnonymViewContent, id: 'anonymViewContent' },
                            { name: 'anonymUpload', boxLabel: htcConfig.locData.AdminFoldersAnonymUpload, id: 'anonymUpload' },
                            { name: 'watchForModifs', boxLabel: htcConfig.locData.AdminFoldersWatch, id: 'watchForModifs' }
                        ]
                    }),
                    new Ext.form.FieldSet({
                        title: htcConfig.locData.AdminFoldersListRestrictions + genHintWithQuestionIcon(htcConfig.locData.AdminFoldersListRestrictionsHint),
                        labelWidth: 60,
                        anchor: '100%',
                        //width: 278,
                        items:
                        [
                            {
                                xtype: 'radiogroup',
                                fieldLabel: htcConfig.locData.CommonFieldLabelType,
                                id: 'list-rest',
                                items:
                                [
                                    { boxLabel: htcConfig.locData.AdminFoldersRestrictionAllow, name: 'listType', inputValue: 0 },
                                    { boxLabel: htcConfig.locData.AdminFoldersRestrictionDeny, name: 'listType', inputValue: 1, checked: true }
                                ]
                            },
                            {
                                name: 'list-ext', id: 'list-ext', fieldLabel: htcConfig.locData.AdminFoldersRestrictionExtensions, enableKeyEvents: true,
                                anchor: '100%', /*width: 130,*/xtype: 'textfield', style: { textTransform: "uppercase" }
                            }
                        ]
                    }),
                    new Ext.form.FieldSet({
                        title: htcConfig.locData.AdminFoldersCreateRestrictions + genHintWithQuestionIcon(htcConfig.locData.AdminFoldersCreateRestrictionsHint),
                        labelWidth: 60,
                        anchor: '100%',
                        //width: 278,
                        items:
                        [
                            {
                                xtype: 'radiogroup',
                                id: 'create-rest',
                                fieldLabel: htcConfig.locData.CommonFieldLabelType,
                                items:
                                [
                                    { boxLabel: htcConfig.locData.AdminFoldersRestrictionAllow, name: 'createType', inputValue: 0 },
                                    { boxLabel: htcConfig.locData.AdminFoldersRestrictionDeny, name: 'createType', inputValue: 1, checked: true }
                                ]
                            },
                            {
                                name: 'create-ext', id: 'create-ext', fieldLabel: htcConfig.locData.AdminFoldersRestrictionExtensions,
                                anchor: '100%', /*width: 130,*/xtype: 'textfield', style: { textTransform: "uppercase" }
                            }
                        ]
                    }),
                    {
                        name: 'customField',
                        id: 'folders-permissions-custom-field',
                        anchor: '100%',
                        //width: 173,
                        xtype: 'textfield',
                        hidden: !htcConfig.showAdminPanelCustomFields,
                        hideLabel: !htcConfig.showAdminPanelCustomFields,
                        fieldLabel: htcConfig.showAdminPanelCustomFields ? htcConfig.locData.AdminCommonCustomField : ''
                    }
                ]
            }),
            gridPerms = new Ext.grid.GridPanel({
                store: new Ext.data.ArrayStore({
                    fields: ['name', 'type', 'typeId', 'icon', 'permission']
                }),
                minHeight: 250,
                multiSelect: false,
                width: 342,
                enableHdMenu: false,
                header: true,
                title: htcConfig.locData.AdminFoldersUsersGroups + genHintWithQuestionIcon(htcConfig.locData.AdminFoldersUsersGroupsHint),
                selModel: new Ext.grid.RowSelectionModel({
                    singleSelect: true,
                    listeners: {
                        selectionchange: function (model) {
                            var removeButton = gridPerms.getTopToolbar().findById('remove');
                            removeButton.setDisabled(model.getCount() == 0);

                            var selectedRecord = gridPerms.getSelectionModel().getSelected();
                            fpPermissions.setDisabled(!selectedRecord);
                            fpPermissions.setTitle(!selectedRecord ? htcConfig.locData.AdminFoldersPermissions : String.format(htcConfig.locData.AdminFoldersPermissionsFor, Ext.util.Format.htmlEncode(selectedRecord.data.name)));

                            if (selectedRecord) {
                                fillPermissionData(selectedRecord.data.permission, fpPermissions);
                            }
                        },
                        beforerowselect: function (model, rowIndex, keepExisting, record) {
                            updatePermission();
                        }
                    }
                }),
                tbar: {
                    enableOverflow: true,
                    items:
                    [
                        {
                            text: htcConfig.locData.AdminCommandAddUser + "...",
                            id: 'add-user',
                            icon: HttpCommander.Lib.Utils.getIconPath(this, 'add'),
                            handler: function () {
                                promptUserName(function (btn, text) {
                                    if (btn == 'ok') {
                                        var userExists = false;
                                        Ext.each(gridPerms.getStore().data.items, function (item) {
                                            if (item.data.typeId == "user" && item.data.name.toLowerCase() == text.toLowerCase())
                                                userExists = true;
                                        });
                                        if (userExists) {
                                            Ext.Msg.show({
                                                title: htcConfig.locData.CommonErrorCaption,
                                                msg: htcConfig.locData.AdminFoldersUserAlreadyExists,
                                                icon: Ext.MessageBox.WARNING,
                                                buttons: Ext.Msg.OK
                                            });
                                        }
                                        else {
                                            var newRecord = new PermissionRecord({
                                                name: text,
                                                type: htcConfig.locData.CommonFieldLabelUser,
                                                typeId: 'user',
                                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'user'),
                                                permission: getDefaultPermission(text)
                                            });
                                            gridPerms.getStore().add(newRecord);
                                            //gridPerms.getSelectionModel().selectLastRow(false);
                                        }
                                    }
                                }, true);
                            }
                        },
                        {
                            text: htcConfig.locData.AdminCommandAddGroup + '...',
                            id: 'add-group',
                            icon: HttpCommander.Lib.Utils.getIconPath(this, 'add'),
                            handler: function () {
                                promptGroupName(function (btn, text) {
                                    if (btn == 'ok') {
                                        var groupExists = false;
                                        Ext.each(gridPerms.getStore().data.items, function (item) {
                                            if (item.data.typeId == "group" && item.data.name.toLowerCase() == text.toLowerCase())
                                                groupExists = true;
                                        });
                                        if (groupExists) {
                                            Ext.Msg.show({
                                                title: htcConfig.locData.CommonErrorCaption,
                                                msg: htcConfig.locData.AdminFoldersGroupAlreadyExists,
                                                icon: Ext.MessageBox.WARNING,
                                                buttons: Ext.Msg.OK
                                            });
                                        }
                                        else {
                                            var newRecord = new PermissionRecord({
                                                name: text,
                                                type: htcConfig.locData.CommonFieldLabelGroup,
                                                typeId: 'group',
                                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'group'),
                                                permission: getDefaultPermission(text)
                                            });
                                            gridPerms.getStore().add(newRecord);
                                            //gridPerms.getSelectionModel().selectLastRow(false);
                                        }
                                    }
                                }, true);
                            }
                        },
                        {
                            text: htcConfig.locData.CommandDelete, id: 'remove', icon: HttpCommander.Lib.Utils.getIconPath(this, 'remove'), disabled: true,
                            handler: function () {
                                var selectedRecord = gridPerms.getSelectionModel().getSelected();
                                if (selectedRecord) {
                                    gridPerms.getStore().remove(selectedRecord);
                                    fillPermissionData(getDefaultPermission(''), fpPermissions);
                                }
                            }
                        }
                    ]
                },
                columns:
                [
                    {
                        header: htcConfig.locData.CommonFieldLabelName,
                        width: 215,
                        dataIndex: 'name',
                        renderer: function (value, p, r) {
                            var val = value;
                            if (!Ext.isEmpty(val) && val.toLowerCase().indexOf('regex:') == 0 && val.length > 6) {
                                val = '<span style="font-weight:bold;">regex:</span>'
                                    + Ext.util.Format.htmlEncode(val.substring(6));
                            } else {
                                val = Ext.util.Format.htmlEncode(val || '');
                            }
                            return "<img src='" + htcConfig.relativePath + r.data.icon + "' class='filetypeimage' />" + val;
                        }
                    },
                    {
                        header: htcConfig.locData.CommonFieldLabelType,
                        width: 80,
                        dataIndex: 'type',
                        renderer: htmlEncodeRenderer
                    }
                ]
            })
        ],
            buttonAlign: 'left',
            buttons: [{
                html: '<div id="share-note" style="color:red;white-space:normal;width:350px;"></div>',
                xtype: 'label'
            }, '->', {
                text: htcConfig.locData.CommonButtonCaptionAdd,
                id: 'add-edit-folder',
                handler: function () {
                    updatePermission();
                    var validationResult = validateFolderData();
                    if (validationResult) {
                        Ext.Msg.show({
                            title: htcConfig.locData.CommonErrorCaption,
                            msg: validationResult,
                            icon: Ext.MessageBox.WARNING,
                            buttons: Ext.Msg.OK
                        });
                    } else {
                        //folderWindow.hide();
                        var folder = aggregateFolderData();
                        if (!folder) {
                            return;
                        }
                        if (!folderWindow.isEditing) {
                            gridFolders.loadMask.msg = htcConfig.locData.ProgressCreating + "...";
                            gridFolders.loadMask.show();
                            HttpCommander.Admin.AddFolder(folder, function (data, trans) {
                                gridFolders.loadMask.hide();
                                gridFolders.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                                    folderWindow.hide();
                                    gridFolders.getStore().reload();
                                }
                            });
                        } else {
                            gridFolders.loadMask.msg = htcConfig.locData.ProgressUpdating + "...";
                            gridFolders.loadMask.show();
                            folder.oldPath = commonFolderInfo.findById('original-folder-path').getValue();
                            HttpCommander.Admin.UpdateFolder(folder, function (data, trans) {
                                gridFolders.loadMask.hide();
                                gridFolders.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                                    folderWindow.hide();
                                    gridFolders.getStore().reload();
                                }
                            });
                        }
                    }
                }
            }, {
                text: htcConfig.locData.CommonButtonCaptionCancel,
                handler: function () { folderWindow.hide(); }
            }, {
                text: htcConfig.locData.AdminCommandHelp,
                handler: function () { navigateHelpAdminPanelWithFragment('foldersetup'); }
            }],
            listeners: {
                hide: function (window) {
                    if (gridFolders) {
                        var indRow = -1;
                        var store = gridFolders.getStore();
                        if (store) {
                            var selRow = gridFolders.getSelectionModel().getSelected();
                            if (selRow) indRow = store.indexOf(selRow);
                            else if (store.getCount() > 0) indRow = 0;
                        }
                        if (indRow >= 0) gridFolders.getView().focusRow(indRow);
                    }
                },
                show: function (window) {
                    var comboField = window.findById('folder-path'),
                        val;
                    if (comboField) {
                        Ext.QuickTips.getQuickTip().unregister(comboField.el);
                        val = comboField.getValue();
                        if (val && val != '') {
                            Ext.QuickTips.getQuickTip().register({
                                target: comboField.el,
                                text: Ext.util.Format.htmlEncode(val)
                            });
                        }
                    }
                    var filterField = window.findById('folder-filter-field');
                    if (filterField) {
                        val = filterField.getValue();
                        if (typeof filterField.toggleValidateLink == 'function') {
                            filterField.toggleValidateLink(val);
                        }
                    }
                },
                afterrender: function (win) {
                    var pathField = commonFolderInfo.findById('folder-path');
                    var pathValue = pathField.getValue();
                    pathField.setValue('_');
                    pathField.setValue(pathValue);
                    commonFolderInfo.syncSize();
                    fpPermissions.syncSize();
                    gridPerms.setHeight(fpPermissions.getHeight() - commonFolderInfo.getHeight() - 21);
                    win.syncSize();
                }
            }
        });

        // Create TABS
        var adminTabs = new Ext.TabPanel({
            activeTab: 0,
            border: true,
            region: 'center',
            margins: '0 0 5 0',
            deferredRender: true,
            enableTabScroll: true,
            items: [],
            listeners: {
                tabchange: function (thisPanel, tab) {
                    if (tab.id == 'update-tab') {
                        tab.prepare();
                    } else if (tab.id == "folders-tab" && !("loaded_once" in tab)) {
                        tab.loaded_once = true;
                        gridFolders.store.load();
                    } else if (tab.id == "anonym-tab" && !("loaded_once" in tab)) {
                        tab.loaded_once = true;
                        gridAnonymLinks.store.load();
                    } else if (tab.id == "users-tab" && !("loaded_once" in tab)) {
                        tab.loaded_once = true;
                        gridUsers.store.load();
                    } else if (tab.id == "groups-tab" && !("loaded_once" in tab)) {
                        tab.loaded_once = true;
                        gridGroups.store.load();
                    } else if (tab.id == "log-tab" && !("loaded_once" in tab)) {
                        tab.loaded_once = true;
                        gridLog.loadStore();
                    } else if (tab.id == "log-errors-tab" && !("loaded_once" in tab)) {
                        tab.loaded_once = true;
                        gridLogErrors.store.load();
                    } else if (tab.id == "settings-tab" && !("loaded_once" in tab)) {
                        tab.loaded_once = true;
                        if (gridSettings)
                            gridSettings.store.load();
                        if (emailNotifs)
                            emailNotifs.LoadData();
                    } else if (tab.id == "admin-permissions-tab" && !("loaded_once" in tab)) {
                        if (adminPermsTab) {
                            tab.loaded_once = true;
                            if (adminPermsTab.getGridAdminPermissions())
                                adminPermsTab.getGridAdminPermissions().store.load();
                            if (adminPermsTab.getGridAdminFolders())
                                adminPermsTab.getGridAdminFolders().store.load();
                        }
                    }
                }
            }
        });

        /** SETTINGS tab */
        // Check ModifySettings (in this block all object and fucntions for Settings tab
        if (checkPrivilege('ModifySettings')) {
            // put 'restoreDefaultSettingValue' function to global context
            window.restoreDefaultSettingValue = function (group, name) {
                if (group == "Runtime" || (group == "Main" && name == "WindowsUsersWithFormAuth")) {
                    Ext.Msg.alert(htcConfig.locData.CommonWarningCaption, "Not applicable");
                    return;
                }
                // find the record
                var ind = settingsStore.findBy(function (record, id) {
                    return record.data.group == group && record.data.name == name;
                });
                if (ind == -1)
                    return;
                var record = settingsStore.getAt(ind);
                var grid = gridSettings;

                if (!!record && !!record.data && record.data.defaultvalue == record.data.value) {
                    Ext.Msg.alert(htcConfig.locData.CommonWarningCaption, 'This parameter already with value by default');
                    return;
                }

                showSettingsMask();
                HttpCommander.Admin.RestoreSettingValue(group, name, function (data, trans) {
                    hideSettingsMask();
                    if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                        var changed = record.data.value !== data.newvalue;
                        record.data.value = data.newvalue;
                        record.data.changed = data.changed;
                        record.commit();
                        if (record.data.group == "Main" && record.data.name == "ShowHiddenParameters") {
                            settingsStore.reload();
                        } else {
                            grid.getView().refresh();
                        }
                        if (changed) {
                            if (tbtnSaveSettingsMsg) {
                                tbtnSaveSettingsMsg.show();
                            }
                            var ssb = Ext.getCmp('settings-save-button');
                            if (ssb) {
                                ssb.setIcon(htcConfig.relativePath + 'Images/savewarn.gif');
                            }
                        }
                    }
                });
            };
            var settingsMask = null, // it is initialized on first use
            prepareSettingsMask = function () {
                if (settingsMask == null) {
                    settingsMask = new Ext.LoadMask(Ext.getBody(), {
                        msg: htcConfig.locData.ProgressLoading + "...",
                        removeMask: false
                    });
                    settingsMask.showCnt = 0;
                }
            },
            showSettingsMask = function () {
                prepareSettingsMask();
                settingsMask.showCnt += 1;
                if (settingsMask.showCnt == 1)
                    settingsMask.show();
            },
            hideSettingsMask = function () {
                prepareSettingsMask();
                if (settingsMask.showCnt > 0) {
                    settingsMask.showCnt -= 1;
                    if (settingsMask.showCnt == 0)
                        settingsMask.hide();
                }
            },
            getShowHiddenParamsValue = function () {
                return HttpCommander.Lib.Utils.getCookie('showHiddenParams', true) === '1' || false;
            },
            toggleHiddenParamsHandler = function (state) {
                var btn = Ext.getCmp('toggle-hidden-params-button');
                if (btn) {
                    state = state || false;
                    btn.toggle(state, true);
                    btn.setText(String.format(htcConfig.locData.AdminToggleHiddenParams,
                        (state ? htcConfig.locData.AdminHideHiddenParams : htcConfig.locData.AdminShowHiddenParams)));
                }
            },
            hideHiddenParams = function () {
                HttpCommander.Lib.Utils.deleteCookie('showHiddenParams');
                toggleHiddenParamsHandler(false);
            },
            addRestoreDefaultButton = function (record) {
                if (record.data.group == "Runtime" || (record.data.group == "Main" && record.data.name == "WindowsUsersWithFormAuth")) {
                    return;
                }
                var cnt = document.getElementById("btn_restore_cnt_" + record.data.name);
                if (cnt && !cnt.hasChildNodes()) {
                    (new Ext.Button({
                        text: htcConfig.locData.SettingsGridRestoreDefault,
                        handler: function () {
                            restoreDefaultSettingValue(record.data.group, record.data.name);
                        }
                    })).render(cnt);
                }
            },
            settingsExpanderPlugin = new Ext.ux.grid.RowExpander({
                tpl: new Ext.Template(
                    '<p><b>' + Ext.util.Format.htmlEncode(htcConfig.locData.SettingsGridDescriptionInfo) + ':</b> {comment:htmlEncode} '
                    + '<a href="javascript:showHelpWindow(\'Manual/webconfigsetup.html#{name}\');" target="_self" id="moreInfo">' + Ext.util.Format.htmlEncode(htcConfig.locData.SettingsGridMoreInfo) + '</a></p>'
                    + '<p><b>' + Ext.util.Format.htmlEncode(htcConfig.locData.SettingsGridFormatInfo) + ':</b> {formathint:htmlEncode}</p>'
                    + '<p><b>' + Ext.util.Format.htmlEncode(htcConfig.locData.SettingsGridDefaultValueInfo) + ':</b> {defaultvalue:htmlEncode} '
                    + '<span id="btn_restore_cnt_{name}"></span></p>'//<a href="javascript:restoreDefaultSettingValue(&quot;{group}&quot;, &quot;{name}&quot;);" id="restoreDefault">' + Ext.util.Format.htmlEncode(htcConfig.locData.SettingsGridRestoreDefault) + '</a></p>'
                ),
                listeners: {
                    bodycontent: function (RowExpander, record, data, rowIndex) {
                        // restore default link is not applicable to elements of the Runtime group
                        if (record.data.group == "Runtime" || (record.data.group == "Main" && record.data.name == "WindowsUsersWithFormAuth")) {
                            data.content = data.content.replace(/<a\s[^>]*id="restoreDefault">[^<]*<\/a>/i, "");
                        }
                        if (record.data.hidden && (record.data.comment == null || String(record.data.comment).trim() == "")) {
                            data.content = data.content.replace(/<a\s[^>]*id="moreInfo">[^<]*<\/a>/i, "");
                        }
                    },
                    expand: function (RowExpander, record, data, rowIndex) {
                        addRestoreDefaultButton(record);
                    }
                }
            }),
            updateGridSetting = function (e) {
                var val = String(e.value);
                if (e.record.data.name == 'StyleThemeName' && val === 'blue') {
                    val = '';
                }
                showSettingsMask();
                HttpCommander.Admin.UpdateSettings(e.record.data.group, e.record.data.name, val, function (data, trans) {
                    hideSettingsMask();
                    var redirectURL = null;
                    //if ((e.record.data.group == "Runtime" && e.record.data.name == "AuthMode") ||
                    //    (e.record.data.group == "Main" && e.record.data.name == "WindowsUsersWithFormAuth")) {
                    //    redirectURL = htcConfig.relativePath + "Diagnostics.aspx?"
                    //    if(data != null)
                    //        redirectURL += Ext.urlEncode({AuthModeChanged: data.newvalue});
                    //}
                    {
                        var state = false;
                        var rowIndex = e.grid.getStore().findExact('name', 'ShowHiddenParameters');
                        if (rowIndex >= 0 && e.grid.getStore().getAt(rowIndex).data.value == "true")
                            state = true;
                    }
                    if (typeof data == 'undefined' || !data) {
                        Ext.Msg.alert(htcConfig.locData.CommonErrorCaption, Ext.util.Format.htmlEncode(trans.message));
                        e.record.reject();
                        if (redirectURL != null) {
                            redirectURL = Ext.urlEncode({ Error: trans.message }, redirectURL);
                            location.replace(redirectURL);
                        }
                        return;
                    }
                    if (data.status != "success") {
                        Ext.Msg.alert(htcConfig.locData.CommonErrorCaption, data.message);
                        e.record.reject();
                        if (redirectURL != null) {
                            redirectURL = Ext.urlEncode({ Error: data.message }, redirectURL);
                            location.replace(redirectURL);
                        }
                        return;
                    }

                    var changed = e.value !== e.originalValue;
                    e.record.data.value = data.newvalue;
                    e.record.data.changed = data.changed;
                    e.record.commit();
                    if (redirectURL != null) {
                        location.replace(redirectURL);
                    } else if (e.record.data.group == "Main" && e.record.data.name == "ShowHiddenParameters") {
                        e.grid.getStore().reload();
                    } else {
                        e.grid.getView().refresh();
                    }
                    if (changed) {
                        if (tbtnSaveSettingsMsg) {
                            tbtnSaveSettingsMsg.show();
                        }
                        var ssb = Ext.getCmp('settings-save-button');
                        if (ssb) {
                            ssb.setIcon(htcConfig.relativePath + 'Images/savewarn.gif');
                        }
                    }
                    if (changed && e.record.data.name == 'IdentifierWebDav') {
                        Ext.Msg.show({
                            title: htcConfig.locData.CommonWarningCaption,
                            msg: "You changed value of the WebDAV identifier.<br />Please, " +
                                '<a target="_self" href="javascript:showHelpWindow(\'Manual/WebFolders.html#webdavconfig\');">configure web folder mapping</a>',
                            buttons: Ext.Msg.OK,
                            icon: Ext.Msg.WARNING,
                            fn: function (result) {
                                if (result == 'ok') {
                                    showHelpWindow('Manual/WebFolders.html#webdavconfig');
                                }
                            }
                        });
                    }
                });
            };

            adminTabs.add({
                title: htcConfig.locData.AdminSettingsTab,
                id: 'settings-tab',
                autoScroll: true,
                xtype: 'panel',
                tbar: { enableOverflow: true, items: [{
                    text: htcConfig.locData.AdminSettingsSave,
                    id: 'settings-save-button',
                    icon: HttpCommander.Lib.Utils.getIconPath(this, 'savetofile'),
                    handler: function (btn) {
                        showSettingsMask();
                        HttpCommander.Admin.SaveSettings(function (data, trans) {
                            hideSettingsMask();
                            if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                                if (tbtnSaveSettingsMsg) {
                                    tbtnSaveSettingsMsg.hide();
                                }
                                btn.setIcon(HttpCommander.Lib.Utils.getIconPath(htcConfig, 'savetofile'));
                                Ext.Msg.alert(htcConfig.locData.CommonWarningCaption,
                                    htcConfig.locData.SettingsSettingsSavedMsg);
                            }
                            settingsStore.reload();
                        });
                    }
                }, {
                    id: 'toggle-hidden-params-button',
                    text: String.format(htcConfig.locData.AdminToggleHiddenParams, (getShowHiddenParamsValue()/*htcConfig.showHiddenParams*/ ? htcConfig.locData.AdminHideHiddenParams : htcConfig.locData.AdminShowHiddenParams)),
                    icon: HttpCommander.Lib.Utils.getIconPath(this, 'toggle-hidden-params'),
                    tooltip: htcConfig.locData.AdminHintHiddenParams,
                    enableToggle: true,
                    toggleHandler: function (item, pressed) {
                        if (gridSettings) {
                            var store = gridSettings.getStore();
                            if (store) {
                                HttpCommander.Lib.Utils.setCookie('showHiddenParams', pressed ? 1 : 0);
                                store.changedHiddenViewState = true;
                                store.reload();
                                return;
                                //var rowIndex = store.findExact('name', 'ShowHiddenParameters');
                                //if (rowIndex >= 0) {
                                //    var rec = store.getAt(rowIndex);
                                //    gridSettings.fireEvent('afteredit', {
                                //        grid: gridSettings,
                                //        record: rec,
                                //        field: 'value',
                                //        value: String(pressed),
                                //        originalValue: rec.get('value'),
                                //        row: rowIndex,
                                //        col: gridSettings.getColumnModel().getIndexById('settings-col-value')
                                //    });
                                //}
                            }
                        }
                        toggleHiddenParamsHandler(getShowHiddenParamsValue());
                    },
                    pressed: getShowHiddenParamsValue()
                }, {
                    text: htcConfig.locData.AdminCommandHelp,
                    icon: HttpCommander.Lib.Utils.getIconPath(this, 'help'),
                    handler: function () { showHelpWindow('Manual/webconfigsetup.html'); }
                }]
            },
            items:[
                gridSettings = new Ext.grid.EditorGridPanel({
                    store: (settingsStore = new Ext.data.GroupingStore({
                        reader: new Ext.data.JsonReader({
                            totalProperty: 'total',
                            root: 'data',
                            remoteGroup: true,
                            fields:
                            [
                                { name: 'group', type: 'string' },
                                { name: 'name', type: 'string' },
                                { name: 'value', type: 'string' },
                                { name: 'comment', type: 'string' },
                                { name: 'type', type: 'string' },
                                { name: 'data' },
                                { name: 'formathint', type: 'string' },
                                { name: 'defaultvalue', type: 'string' },
                                { name: 'changed', type: 'boolean' },
                                { name: 'hidden', type: 'boolean' },
                                { name: 'startcollapsed', type: 'boolean' }
                            ]
                        }),
                        proxy: new Ext.data.DirectProxy({
                            directFn: HttpCommander.Admin.GetSettings,
                            paramOrder: 'showHiddenParams'
                        }),
                        //sortInfo:{field: 'name', direction: "ASC"},
                        //groupOnSort: true,
                        remoteSort: true,
                        remoteGroup: true,
                        groupField: 'group',
                        listeners: {
                            beforeload: function (store, options) {
                                store.setBaseParam('showHiddenParams', getShowHiddenParamsValue());
                                showSettingsMask();
                            },
                            load: function (store, records, options) {
                                hideSettingsMask();
                                gridSettings.getView().refresh();
                                if (typeof store.reader.jsonData.demoModeMsg != 'undefined') {
                                    hideHiddenParams();
                                    if (store.changedHiddenViewState === true)
                                        Ext.Msg.alert(htcConfig.locData.CommonErrorCaption, store.reader.jsonData.demoModeMsg);
                                } else toggleHiddenParamsHandler(getShowHiddenParamsValue());
                                store.changedHiddenViewState === false;
                                //{
                                //    var state = false;
                                //    var rowIndex = store.findExact('name', 'ShowHiddenParameters');
                                //    if (rowIndex >= 0 && store.getAt(rowIndex).data.value == "true")
                                //        state = true;
                                //    toggleHiddenParamsHandler(state);
                                //}
                            },
                            exception: function (misc) {
                                hideSettingsMask();
                                toggleHiddenParamsHandler(getShowHiddenParamsValue());
                                gridSettings.getStore().changedHiddenViewState = false;
                            }
                        }
                    })),
                    multiSelect: false,
                    clicksToEdit: 1,
                    border: false,
                    //loadMask: true,
                    enableHdMenu: true,
                    autoHeight: true,
                    autoExpandColumn: "settings-col-value",
                    plugins: settingsExpanderPlugin,
                    id: "SettingsGrid",
                    colModel: new Ext.grid.ColumnModel([
                        settingsExpanderPlugin,
                        {
                            header: htcConfig.locData.CommonFieldLabelGroup,
                            dataIndex: "group",
                            hidden: true,
                            renderer: function (val) {
                                return "<span style='font-weight:bold;font-size:1.1em;'>" + Ext.util.Format.htmlEncode(val || '') + '</span>';
                            }
                        },
                        {
                            header: htcConfig.locData.CommonFieldLabelName,
                            dataIndex: "name",
                            width: 180,
                            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                if (record.data.hidden) {
                                    metaData.attr = (htcConfig.styleName === 'gray'
                                        ? 'style="cursor:pointer;background-color: #E0E0E0;"'
                                        : String.format('style="cursor:pointer;background-repeat: repeat; background-image: url(./Images/resources_1.5/images/{0}/shared/glass-bg.gif);"',
                                                (htcConfig.styleName && htcConfig.styleName.length > 0 ? encodeURIComponent(htcConfig.styleName.indexOf("azzurra") >= 0 ? "azzurra-legacy" : htcConfig.styleName) : 'default')
                                            ));
                                } else {
                                    metaData.attr = 'style="cursor:pointer;"';
                                }
                                var qtip = (Ext.isEmpty(record.get('comment')) ? '' : ('<p><b>' + Ext.util.Format.htmlEncode(htcConfig.locData.SettingsGridDescriptionInfo).replace(' ', '&nbsp;') + ':&nbsp;</b>'
                                    + Ext.util.Format.htmlEncode(record.get('comment') || '') + '</p>'))
                                    + '<p><b>' + Ext.util.Format.htmlEncode(htcConfig.locData.SettingsGridFormatInfo).replace(' ', '&nbsp;') + ':&nbsp;</b>'
                                    + Ext.util.Format.htmlEncode(record.get('formathint') || '') + '</p>'
                                    + '<p><b>' + Ext.util.Format.htmlEncode(htcConfig.locData.SettingsGridDefaultValueInfo).replace(' ', '&nbsp;') + ':&nbsp;</b>'
                                    + Ext.util.Format.htmlEncode(record.get('defaultvalue') || '') + '</p>';
                                metaData.attr += ' ext:qtip="' + Ext.util.Format.htmlEncode(qtip) + '"';
                                return Ext.util.Format.htmlEncode(value);
                            }
                        },
                        {
                            id: 'settings-col-value',
                            header: htcConfig.locData.CommonFieldLabelValue,
                            dataIndex: "value",
                            editable: true,
                            sortable: false,
                            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                var val = ((record.data.group == 'MailSettings' && record.data.name == 'Password')
                                            || (record.data.name == 'EDirectoryBindUserPassword'))
                                    ? passwordRenderer(value) : Ext.util.Format.htmlEncode(value);
                                if (record.data.changed)
                                    return '<span style="font-weight:bold;">' + val + '</span>';
                                else
                                    return val;
                            },
                            css: String.format(
                                'background-position-y: -2px; background-repeat: repeat-x; background-image: url(./Images/resources_1.5/images/{0}/toolbar/bg.gif);',
                                (htcConfig.styleName && htcConfig.styleName.length > 0 ? encodeURIComponent(htcConfig.styleName.indexOf("azzurra") >= 0 ? "azzurra-legacy" : htcConfig.styleName) : 'default')
                            )
                        }
                    //,
                    // debug output
                    //{
                    //    header: "Type",
                    //    dataIndex: "type"
                    //}
                    ]),
                    view: new Ext.grid.GroupingView({
                        //forceFit:true
                        //groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})',
                        initTemplates: function () {
                            Ext.grid.GroupingView.superclass.initTemplates.call(this);
                            this.state = {};

                            var sm = this.grid.getSelectionModel();
                            sm.on(sm.selectRow ? 'beforerowselect' : 'beforecellselect',
                                    this.onBeforeRowSelect, this);

                            if (!this.startGroup) {
                                this.startGroup = new Ext.XTemplate(
                                    '<div id="{groupId}" class="x-grid-group {cls}">',
                                        '<div id="{groupId}-hd" class="x-grid-group-hd x-toolbar" style="{style}"><div class="x-grid-group-title">', this.groupTextTpl, '</div></div>',
                                        '<div id="{groupId}-bd" class="x-grid-group-body">'
                                );
                            }
                            this.startGroup.compile();
                            if (!this.endGroup) {
                                this.endGroup = '</div></div>';
                            }

                            this.endGroup = '</div></div>';
                        },
                        // private
                        doRender: function (cs, rs, ds, startRow, colCount, stripe) {
                            if (rs.length < 1) {
                                return '';
                            }

                            if (!this.canGroup() || this.isUpdating) {
                                return Ext.grid.GroupingView.superclass.doRender.apply(
                                        this, arguments);
                            }

                            var groupField = this.getGroupField(),
                                colIndex = this.cm.findColumnIndex(groupField),
                                g,
                                gstyle = 'width:' + this.getTotalWidth() + ';',
                                cfg = this.cm.config[colIndex],
                                groupRenderer = cfg.groupRenderer || cfg.renderer,
                                prefix = this.showGroupName ? (cfg.groupName || cfg.header) + ': ' : '',
                                groups = [],
                                curGroup, i, len, gid;

                            for (i = 0, len = rs.length; i < len; i++) {
                                var rowIndex = startRow + i,
                                    r = rs[i],
                                    gvalue = r.data[groupField],
                                    cll = r.data['startcollapsed'];

                                g = this.getGroup(gvalue, r, groupRenderer, rowIndex, colIndex, ds);
                                if (!curGroup || curGroup.group != g) {
                                    gid = this.constructId(gvalue, groupField, colIndex);
                                    // if state is defined use it, however state is in terms of expanded
                                    // so negate it, otherwise use the default.
                                    this.state[gid] = !(Ext.isDefined(this.state[gid]) ? !this.state[gid] : (this.startCollapsed || cll));
                                    curGroup = {
                                        group: g,
                                        gvalue: gvalue,
                                        text: prefix + g,
                                        groupId: gid,
                                        startRow: rowIndex,
                                        rs: [r],
                                        cls: this.state[gid] ? '' : 'x-grid-group-collapsed',
                                        style: gstyle
                                    };
                                    groups.push(curGroup);
                                } else {
                                    curGroup.rs.push(r);
                                }
                                r._groupId = gid;
                            }

                            var buf = [];
                            for (i = 0, len = groups.length; i < len; i++) {
                                g = groups[i];
                                this.doGroupStart(buf, g, cs, ds, colCount);
                                buf[buf.length] = Ext.grid.GroupingView.superclass.doRender.call(
                                        this, cs, g.rs, ds, g.startRow, colCount, stripe);

                                this.doGroupEnd(buf, g, cs, ds, colCount);
                            }
                            return buf.join('');
                        },
                        listeners: {
                            refresh: function (view) {
                                var len = view.getRows().length;
                                for (var i = 0; i < len; i++) {
                                    var record = gridSettings.getStore().getAt(i);
                                    addRestoreDefaultButton(record);
                                }
                            }
                        }
                    }),
                    listeners: {
                        beforeedit: function (e) {
                            var editor, values;
                            // set appropriate field editor
                            switch (e.record.data.type) {
                                case "bool":
                                    values = ['true', 'false'];
                                    editor = new Ext.form.ComboBox({
                                        lazyInit: false,
                                        lazyRender: false,
                                        editable: false,
                                        forceSelection: true,
                                        triggerAction: 'all',
                                        mode: "local",
                                        store: values,
                                        boxMaxWidth: 100,
                                        listeners: {
                                            select: function (combo, record, index) {
                                                gridSettings.stopEditing(false);
                                            }
                                        }
                                    });
                                    editor = new Ext.grid.GridEditor(editor);
                                    e.grid.colModel.setEditor(e.column, editor);
                                    break;
                                case "number":
                                    editor = new Ext.form.NumberField({ selectOnFocus: true, style: 'text-align:left;' });
                                    editor = new Ext.grid.GridEditor(editor);
                                    e.grid.colModel.setEditor(e.column, editor);
                                    break;
                                case "enum":
                                    values = [];
                                    for (var i = 0; i < e.record.data.data.length; ++i) {
                                        var val = e.record.data.data[i];
                                        values.push(val);
                                    }
                                    editor = new Ext.form.ComboBox({
                                        lazyInit: false,
                                        lazyRender: false,
                                        editable: false,
                                        forceSelection: true,
                                        triggerAction: 'all',
                                        mode: "local",
                                        store: values,
                                        boxMaxWidth: 155,
                                        listeners: {
                                            select: function (combo, record, index) {
                                                gridSettings.stopEditing(false);
                                            }
                                        }
                                    });
                                    editor = new Ext.grid.GridEditor(editor);
                                    e.grid.colModel.setEditor(e.column, editor);
                                    break;
                                case "string":
                                default:
                                    editor = (e.record.data.name == 'StyleThemeName')
                                        ?
                                        new Ext.form.ComboBox({
                                            lazyInit: false,
                                            lazyRender: false,
                                            editable: false,
                                            forceSelection: true,
                                            triggerAction: 'all',
                                            mode: "remote",
                                            boxMaxWidth: 210,
                                            valueField: 'value',
                                            displayField: 'name',
                                            tpl: '<tpl for="."><div class="x-combo-list-item">{name:htmlEncode}</div></tpl>',
                                            store: new Ext.data.DirectStore({
                                                reader: new Ext.data.JsonReader({
                                                    idProperty: 'value',
                                                    root: 'data',
                                                    fields: ['name', 'value']
                                                }),
                                                autoLoad: false,
                                                api: { read: HttpCommander.Admin.StyleThemeNames }
                                            }),
                                            listeners: {
                                                select: function (combo, record, index) {
                                                    gridSettings.stopEditing(false);
                                                }
                                            }
                                        })
                                        : new Ext.form.TextField({
                                            selectOnFocus: true,
                                            inputType: ((e.record.data.group == 'MailSettings' && e.record.data.name == 'Password')
                                                        || (e.record.data.name == 'EDirectoryBindUserPassword'))
                                                ? 'password' : 'text'
                                        });
                                    editor = new Ext.grid.GridEditor(editor);
                                    e.grid.colModel.setEditor(e.column, editor);
                                    break;
                            }
                        },
                        afteredit: function (e) {
                            var isWUWFA = false;
                            if ((e.record.data.group == "Runtime" && e.record.data.name == "AuthMode") ||
                                (isWUWFA = (e.record.data.group == "Main" && e.record.data.name == "WindowsUsersWithFormAuth"))) {
                                Ext.Msg.show({
                                    title: htcConfig.locData.CommonWarningCaption,
                                    msg: String.format(htcConfig.locData.SettingsDenyAuthModeChange,
                                        '<a href="javascript:showHelpWindow(\'Manual/ManualConfigurationOfAuthenticationMode.html\');" target="_self">Manual configuration of authentication mode</a>'
                                    ),
                                    buttons: Ext.Msg.OK,
                                    icon: Ext.Msg.WARNING,
                                    fn: function (result) {
                                        e.record.reject();
                                    }
                                });
                            } else {
                                updateGridSetting(e);
                            }
                        }
                    }
                }),
                emailNotifs = HttpCommander.Lib.AdminEmailNotifications({
                    'htcConfig': htcConfig,
                    'showSettingsMask': showSettingsMask,
                    'hideSettingsMask': hideSettingsMask
                })
            ]
            });
        }
        /** end SETTINGS tab */

        editFolderHandler = function () {
            var selectedRecord = gridFolders.getSelectionModel().getSelected();
            if (selectedRecord) {
                prepareFolderWindow(selectedRecord.data);
                folderWindow.show();
            }
        };
        if (checkPrivilege('ModifyFolders') || htcConfig.adminFoldersExists) {
            adminTabs.add(
            {
                title: htcConfig.locData.AdminFoldersTab,
                id: 'folders-tab',
                layout: 'fit',
                items:
                [
                    gridFolders = new Ext.grid.GridPanel({
                        header: isWindowsVersion && htcConfig.isFullAdmin,
                        headerCfg: isWindowsVersion && htcConfig.isFullAdmin ? {
                            cls: 'x-panel-tbar',
                            html: String.format(htcConfig.locData.AdminFoldersDescription,
                                "<a href='javascript:navigateHelpAdminPanelWithFragment(\"gpolfolders\")'>",
                                "</a>")
                        } : undefined,
                        store: new Ext.data.DirectStore({
                            remoteSort: true,
                            paramOrder: ['sort', 'dir'],
                            sortInfo: {
                                field: null,
                                direction: null
                            },
                            directFn: HttpCommander.Admin.GetFolders,
                            fields:
                            [
                                { name: 'name', type: 'string' },
                                { name: 'path', type: 'string' },
                                { name: 'icon', type: 'string' },
                                { name: 'limitations', type: 'string' },
                                { name: 'description', type: 'string' },
                                { name: 'customField', type: 'string' },
                                { name: 'filterField', type: 'string' },
                                { name: 'filterError', type: 'string' },
                                { name: 'userPerms' },
                                { name: 'groupPerms' }
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
                                        editFolderHandler();
                                        break;
                                }
                            },
                            scope: this
                        },
                        plugins: [new Ext.ux.dd.GridDragDropRowOrder({
                            listeners: {
                                beforerowmove: function (dd, rowIndex, rindex, selections) {
                                    if (selections.length <= 0) return false;
                                    var moveInfo = {
                                        name: selections[0].data.name,
                                        path: selections[0].data.path,
                                        index: rindex
                                    };
                                    gridFolders.loadMask.msg = htcConfig.locData.ProgressMoving + "...";
                                    gridFolders.loadMask.show();
                                    HttpCommander.Admin.MoveFolder(moveInfo, function (data, trans) {
                                        gridFolders.loadMask.hide();
                                        gridFolders.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                                        HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig);
                                        gridFolders.getStore().reload();
                                    });
                                    return true;
                                }
                            }
                        })],
                        viewConfig: { forceFit: true },
                        multiSelect: false,
                        border: false,
                        loadMask: true,
                        enableHdMenu: false,
                        autoExpandColumn: 'path',
                        width: 352, height: 212,
                        selModel: new Ext.grid.RowSelectionModel({
                            singleSelect: true,
                            listeners: {
                                selectionchange: function (model) {
                                    var removeButton = gridFolders.getTopToolbar().findById('remove-folder');
                                    var editButton = gridFolders.getTopToolbar().findById('edit-folder');
                                    removeButton.setDisabled(model.getCount() == 0);
                                    editButton.setDisabled(model.getCount() == 0);
                                }
                            }
                        }),
                        tbar: { enableOverflow: true, items:
                        [
                            {
                                text: htcConfig.locData.CommandRefresh, icon: HttpCommander.Lib.Utils.getIconPath(this, 'refresh'),
                                handler: function () {
                                    gridFolders.getStore().reload();
                                }
                            },
                            {
                                text: htcConfig.locData.AdminFoldersAddFolder + '...', icon: HttpCommander.Lib.Utils.getIconPath(this, 'add'),
                                handler: function () {
                                    prepareFolderWindow(null);
                                    folderWindow.show();
                                }
                            },
                            {
                                text: htcConfig.locData.AdminFoldersEditFolder + '...', id: 'edit-folder', icon: HttpCommander.Lib.Utils.getIconPath(this, 'editfolder'), disabled: true,
                                handler: editFolderHandler
                            },
                            {
                                id: 'remove-folder', text: htcConfig.locData.AdminFoldersRemoveFolder,
                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'remove'), disabled: true,
                                handler: function () {
                                    var selectedRecord = gridFolders.getSelectionModel().getSelected();
                                    var folderName = selectedRecord.data.name;
                                    var folderPath = selectedRecord.data.path;
                                    var removeInfo = {};
                                    removeInfo["name"] = folderName;
                                    removeInfo["path"] = folderPath;
                                    Ext.Msg.show({
                                        title: htcConfig.locData.CommonConfirmCaption,
                                        msg: String.format(htcConfig.locData.AdminFoldersDeleteFolderPrompt, Ext.util.Format.htmlEncode(folderName)),
                                        buttons: Ext.Msg.YESNO,
                                        icon: Ext.MessageBox.QUESTION,
                                        fn: function (result) {
                                            if (result == "yes") {
                                                gridFolders.loadMask.msg = htcConfig.locData.ProgressDeleting + "...";
                                                gridFolders.loadMask.show();
                                                HttpCommander.Admin.DeleteFolder(removeInfo, function (data, trans) {
                                                    gridFolders.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                                                    HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig);
                                                    gridFolders.getStore().reload();
                                                });
                                            }
                                        }
                                    });
                                }
                            },
                            {
                                text: htcConfig.locData.AdminUserFoldersButtonTitle,
                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'viewfolders'),
                                handler: function () {
                                    if (userFoldersWindow)
                                        userFoldersWindow.prepareAndShow();
                                }
                            },
                            {
                                text: htcConfig.locData.AdminCommandHelp, icon: HttpCommander.Lib.Utils.getIconPath(this, 'help'),
                                handler: function () { navigateHelpAdminPanelWithFragment('foldersetup'); }
                            },
                            {
                                text: 'Windows Search Query Builder',
                                hidden: !htcConfig.wsqbEnabled || !winSearchQueryWindow,
                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'search'),
                                handler: function () {
                                    if (winSearchQueryWindow != null) {
                                        winSearchQueryWindow.show();
                                    }
                                }
                            }
                        ]
                        },
                        columns:
                        [
                            {
                                id: 'name', sortable: true,
                                header: htcConfig.locData.CommonFieldLabelName,
                                width: 100,
                                dataIndex: 'name',
                                renderer: function (value, p, r) {
                                    return "<img src='" + htcConfig.relativePath + r.data.icon + "' class='filetypeimage' />" + Ext.util.Format.htmlEncode(value);
                                }
                            },
                            {
                                id: 'path', sortable: true,
                                width: 150,
                                header: htcConfig.locData.CommonFieldLabelPath,
                                dataIndex: 'path',
                                renderer: htmlEncodeRenderer
                            },
                            {
                                id: 'userPerms',
                                width: 150,
                                header: htcConfig.locData.FolderGridUserPermissionsColumn,
                                dataIndex: 'userPerms',
                                renderer: identitiesRenderer
                            },
                            {
                                id: 'groupPerms',
                                width: 150,
                                header: htcConfig.locData.FolderGridGroupPermissionsColumn,
                                dataIndex: 'groupPerms',
                                renderer: identitiesRenderer
                            }
                        ],
                        listeners: {
                            rowdblclick: function (grid, index, e) {
                                editFolderHandler();
                            }
                        }
                    })
                ]
            }
        );
        }

        // Anonymous links
        try { // Add the additional 'advanced' VTypes
            Ext.apply(Ext.form.VTypes, {
                password: function (val, field) {
                    if (field.initialPassField) {
                        var pwd = Ext.getCmp(field.initialPassField);
                        return (val == pwd.getValue());
                    }
                    return true;
                },
                passwordText: htcConfig.locData.LinkToFilePasswordNotMatch
            });
        } catch (e) {
            if (debugmode || window.onerror) throw e;
        }
        function getDefaultAnonymProps() {
            return {
                'id': 0,
                'key': '',
                'path': '',
                'expires': HttpCommander.Lib.Utils.getNextYearDate(),
                'password': '',
                'acl': 15,
                'downloads': 0,
                'notes': '',
                'emails': '',
                'upload_overwrite': true,
                'isfolder': true,
                'virt_path': null,
                'access_users': null,
                'owner': null,
                'perms': null,
                'show_comments': true
            };
        };
        function anonymProcessHandler(isEdit) {
            if (!anonymFolderWindow)
                return;
            var generalInfo = Ext.getCmp('anonym-general-info');
            var acl = {
                'down': Ext.getCmp('anonym-download-chk').getValue(),
                'up': Ext.getCmp('anonym-upload-chk').getValue(),
                'view': Ext.getCmp('anonym-view-chk').getValue(),
                'zip': Ext.getCmp('anonym-zip-download-chk').getValue()
            };
            acl['overwrite'] = acl.up && Ext.getCmp('anonym-overwrite-rg').items.items[0].getValue();

            var pathField = Ext.getCmp('anonym-physical-path-field');
            var expireDateField = Ext.getCmp('anonym-expire-date-field');
            var passField = Ext.getCmp('anonym-password-field');
            var pass2Field = Ext.getCmp('anonym-password2-field');
            var validationResult = (function () {
                if (!(pathField.isValid() && expireDateField.isValid() && passField.isValid() && pass2Field.isValid()))
                    return htcConfig.locData.LinkToFileInvalidForm;
                pass1 = passField.getValue();
                pass2 = pass2Field.getValue();
                if (pass1 != pass2)
                    return htcConfig.locData.LinkToFilePasswordNotMatch;
                if (!(acl.down || acl.up || acl.view || acl.zip))
                    return htcConfig.locData.PublicFolderACLNotSet;
                return null;
            })();
            if (validationResult) {
                Ext.Msg.show({
                    title: htcConfig.locData.CommonErrorCaption,
                    msg: validationResult,
                    icon: Ext.Msg.WARNING,
                    buttons: Ext.Msg.OK
                });
                return;
            }

            isEdit = (isEdit === true);
            isFolderLink = Ext.getCmp('anonym-type-field').items.items[0].getValue() === true;
            var keyField = Ext.getCmp('anonym-hash-field');
            var idField = Ext.getCmp('anonym-id-field');
            var ownField = Ext.getCmp('anonym-owner-field');
            var anonymInfo = {
                'id': idField.getValue(),
                'key': keyField.getValue(),
                'path': pathField.getValue(),
                'type': isFolderLink,
                'password': passField.getValue(),
                'acl': acl,
                'show_comments': Ext.getCmp('anonym-show-comments-field').getValue(),
                'owner': ownField.getValue()
            };
            if (isEdit) {
                anonymInfo['pass_changed'] = Ext.isDefined(anonymFolderWindow.initPass) &&
                (
                    (anonymInfo.password == null && anonymFolderWindow.initPass == null) ||
                    (anonymInfo.password === anonymFolderWindow.initPass)
                );
            } else {
                anonymInfo['pass_changed'] = false;
            }
            var date = expireDateField.getValue();
            /* how date is interpreted 
            We assume that the expire date is the last day the link is valid.
            The link is valid till the beginning of the next year, local time.
            */
            var date2 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var date3 = new Date(date2.getTime() + 24 * 60 * 60 * 1000);
            anonymInfo["expireDate"] = HttpCommander.Lib.Utils.getDateUTCString(date3); /*"" + date3.getUTCFullYear() + "."
            + (date3.getUTCMonth() + 1) + "." + date3.getUTCDate() + " "
            + date3.getUTCHours() + ":" + date3.getUTCMinutes() + ":"
            + date3.getUTCSeconds();*/
            if (isFolderLink) {
                anonymInfo['downloadCnt'] = 0;
            } else {
                var downCntStr = String(Ext.getCmp('anonym-download-cnt-field').getValue());
                if (downCntStr.trim() == '') {
                    anonymInfo['downloadCnt'] = 0;
                } else try {
                    anonymInfo['downloadCnt'] = parseInt(downCntStr);
                } catch (e) {
                    anonymInfo['downloadCnt'] = 0;
                }
            }
            anonymInfo['noteForUsers'] = isFolderLink ? Ext.getCmp('anonym-note-users-field').getValue() : null;
            anonymInfo['emails'] = isFolderLink ? Ext.getCmp('anonym-emails-field').getValue() : null;
            anonymInfo['accessusers'] = Ext.getCmp('anonym-limit-access').getValue();
            anonymInfo['virtpath'] = Ext.getCmp('anonym-virtual-path').getValue();
            anonymInfo['show_comments'] = Ext.getCmp('anonym-show-comments-field').getValue();

            gridAnonymLinks.loadMask.msg = htcConfig.locData[(isEdit ? 'ProgressSavingAnonymousLink' : 'ProgressGettingAnonymLink')] + "...";
            gridAnonymLinks.loadMask.show();
            HttpCommander.Admin.EditAnonymLink(anonymInfo, function (data, trans) {
                gridAnonymLinks.loadMask.hide();
                gridAnonymLinks.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                if (!HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                    return;
                }

                if (data.id && data.key) {
                    idField.setValue(data.id);
                    keyField.setValue(data.key);
                    Ext.getCmp('anonym-keys-field').setValue(data.key);
                    anonymFolderWindow.isEditing = true;
                }

                if (data.path)
                    pathField.setValue(data.path);
                var lnkField = Ext.getCmp('anonym-link-field');
                var sLnkField = Ext.getCmp('anonym-short-link-field');
                lnkField.setValue(!lnkField.hidden && data.link ? data.link : '');
                sLnkField.setValue(!sLnkField.hidden && data['short'] ? data['short'] : '');
                anonymFolderWindow.buttons[0].setVisible(anonymFolderWindow.isEditing);
                anonymFolderWindow.buttons[2].setText(htcConfig.locData[anonymFolderWindow.isEditing ? 'CommandSave' : 'LinkToFileGenerate']);

                if (typeof data.accessusers != 'undefined') {
                    Ext.getCmp('accessusers').setValue(data.accessusers);
                }

                gridAnonymLinks.getStore().reload();
            });
        }
        function checkOnlyZipDownload() {
            var downChk = Ext.getCmp('anonym-download-chk');
            var upChk = Ext.getCmp('anonym-upload-chk');
            var zipChk = Ext.getCmp('anonym-zip-download-chk');
            var viewChk = Ext.getCmp('anonym-view-chk');
            var onlyZip = zipChk.getValue() && !downChk.getValue() && !upChk.getValue() && !viewChk.getValue();
            //Ext.getCmp('anonym-additional-info').setDisabled(onlyZip);
            Ext.getCmp('anonym-note-users-field').setDisabled(onlyZip);
            Ext.getCmp('anonym-emails-field').setDisabled(onlyZip);
            Ext.getCmp('anonym-download-cnt-field').setDisabled(!onlyZip);
        }
        anonymFolderWindow = new Ext.Window({
            title: htcConfig.locData.AdminAnonymFoldersPropertiesTitle,
            width: 628 + 35,
            plain: true,
            autoHeight: true,
            isEditing: false,
            currentData: undefined,
            isFile: false,
            bodyStyle: 'padding: 3px',
            buttonAlign: 'left',
            layout: {
                type: 'table',
                columns: 2
            },
            resizable: false,
            closeAction: 'hide',
            /* true - editing exiting link, false - adding new link */
            isEditing: true,
            defaults: {
                xtype: 'fieldset',
                style: {
                    margin: '2px'
                },
                width: 300
            },
            items: [{
                id: 'anonym-general-info',
                title: htcConfig.locData.AdminFoldersGeneralInfo,
                rowspan: 2,
                defaults: { xtype: 'textfield', anchor: '100%' },
                labelWidth: 100,
                items:
                [
                    {
                        id: 'anonym-id-field',
                        xtype: 'hidden',
                        value: 0
                    }, {
                        id: 'anonym-hash-field',
                        xtype: 'hidden',
                        value: ''
                    }, {
                        id: 'anonym-virtual-path',
                        xtype: 'hidden'
                    }, {
                        id: 'anonym-owner-field',
                        xtype: 'hidden',
                        value: null
                    }, {
                        id: 'anonym-physical-path-field',
                        fieldLabel: htcConfig.locData.AdminFoldersFolderPath,
                        allowBlank: false
                    },
                    {
                        xtype: 'radiogroup',
                        id: 'anonym-type-field',
                        fieldLabel: htcConfig.locData.CommonFieldLabelType,
                        vertical: false,
                        items:
                        [
                            {
                                boxLabel: htcConfig.locData.CommonValueTypeFolder,
                                name: 'anonym-type-radio-group',
                                checked: true,
                                inputValue: 0,
                                listeners: {
                                    check: function (rb, ch) {
                                        Ext.getCmp('anonym-zip-download-chk').setValue(ch);
                                        Ext.getCmp('anonym-view-chk').setValue(ch);
                                        Ext.getCmp('anonym-upload-chk').setValue(ch);
                                        Ext.getCmp('anonym-download-chk').setValue(true);
                                        Ext.getCmp('anonym-acl-info').setDisabled(!ch);
                                        //Ext.getCmp('anonym-additional-info').setDisabled(!ch);
                                        Ext.getCmp('anonym-note-users-field').setDisabled(!ch);
                                        Ext.getCmp('anonym-emails-field').setDisabled(!ch);
                                        Ext.getCmp('anonym-download-cnt-field').setDisabled(ch);
                                    }
                                }
                            },
                            {
                                boxLabel: htcConfig.locData.CommandFile,
                                name: 'anonym-type-radio-group',
                                inputValue: 1
                            }
                        ]
                    },
                    {
                        fieldLabel: htcConfig.locData.LinkToFileExpireDate,
                        id: 'anonym-expire-date-field',
                        xtype: 'datefield',
                        format: htcConfig.USADateFormat ? 'm/d/Y' : 'd/m/Y',
                        minValue: HttpCommander.Lib.Utils.getTodayDate(),
                        value: HttpCommander.Lib.Utils.getNextYearDate()
                    },
                    {
                        fieldLabel: htcConfig.locData.CommonFieldLabelPassword,
                        id: 'anonym-password-field',
                        inputType: 'password'
                    },
                    {
                        fieldLabel: htcConfig.locData.CommonFieldLabelRepeatPassword,
                        id: 'anonym-password2-field',
                        vtype: 'password',
                        inputType: 'password',
                        initialPassField: 'anonym-password-field'
                    },
                    {
                        hideLabel: true,
                        id: 'anonym-show-comments-field',
                        xtype: 'checkbox',
                        boxLabel: htcConfig.locData.AnonymousLinkShowCommentsLabel,
                        disabled: htcConfig.isAllowedComments != '1' && htcConfig.isAllowedComments != '2'
                            && !htcConfig.allowedDescription,
                        checked: htcConfig.isAllowedComments == '1' || htcConfig.isAllowedComments == '2'
                            || htcConfig.allowedDescription
                    },
                    {
                        fieldLabel: htcConfig.locData.LinkToFileDownloadCnt,
                        id: 'anonym-download-cnt-field',
                        xtype: 'numberfield',
                        minValue: 0,
                        value: 0,
                        disabled: true
                    },
                    {
                        xtype: 'container',
                        labelAlign: 'top',
                        layout: 'form',
                        items:
                        [
                            {
                                fieldLabel: htcConfig.locData.AdminAnonymFoldersKeysColumn,
                                id: 'anonym-keys-field',
                                xtype: 'textarea',
                                readOnly: true,
                                height: 53,
                                anchor: '100%'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'anonym-acl-info',
                title: htcConfig.locData.PublicFolderAnonymAccessControl,
                layout: 'column',
                width: 335,
                defaults: {
                    border: false,
                    baseCls: 'x-plain',
                    columnWidth: .5,
                    anchor: '100%'
                },
                items:
                [
                    {
                        defaults: { xtype: 'checkbox' },
                        items:
                        [
                            {
                                id: 'anonym-download-chk',
                                boxLabel: htcConfig.locData.PublicFolderAnonymDownload,
                                listeners: {
                                    check: function (cb, ch) {
                                        checkOnlyZipDownload();
                                    }
                                }
                            },
                            {
                                id: 'anonym-zip-download-chk',
                                boxLabel: htcConfig.locData.PublicFolderAnonymZipDownload,
                                listeners: {
                                    check: function (cb, ch) {
                                        checkOnlyZipDownload();
                                    }
                                }
                            },
                            {
                                id: 'anonym-view-chk',
                                boxLabel: htcConfig.locData.PublicFolderAnonymViewContent,
                                listeners: {
                                    check: function (cb, ch) {
                                        var downChk = Ext.getCmp('anonym-download-chk');
                                        downChk.setDisabled(!ch);
                                        if (!ch) downChk.setValue(false);
                                        checkOnlyZipDownload();
                                    }
                                }
                            }
                        ]
                    },
                    {
                        items:
                        [
                            {
                                id: 'anonym-upload-chk',
                                xtype: 'checkbox',
                                boxLabel: '&nbsp;' + htcConfig.locData.PublicFolderAnonymUpload + '.&nbsp;' + htcConfig.locData.PublicFolderLinkOverwriteWhileUpload + ':',
                                anchor: '100%',
                                listeners: {
                                    check: function (cb, ch) {
                                        Ext.getCmp('anonym-overwrite-rg').setDisabled(!ch);
                                        checkOnlyZipDownload();
                                    }
                                }
                            },
                            {
                                xtype: 'container',
                                layout: 'form',
                                anchor: '100%',
                                items:
                                [
                                    {
                                        id: 'anonym-overwrite-rg',
                                        xtype: 'radiogroup',
                                        hideLabel: true,
                                        anchor: '100%',
                                        items:
                                        [
                                            {
                                                boxLabel: htcConfig.locData.AdminFoldersRestrictionAllow,
                                                name: 'overwriteExisting',
                                                inputValue: 0,
                                                checked: true
                                            },
                                            {
                                                boxLabel: htcConfig.locData.AdminFoldersRestrictionDeny,
                                                name: 'overwriteExisting',
                                                inputValue: 1
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'anonym-additional-info',
                title: htcConfig.locData.AdminAnonymFoldersAdditionalInfo,
                labelAlign: 'top',
                style: {
                    paddingBottom: '0px'
                },
                width: 335,
                defaults: { anchor: '100%' },
                items:
                [
                    {
                        fieldLabel: htcConfig.locData.PublicFolderNoteForUsers,
                        id: 'anonym-note-users-field',
                        xtype: 'textarea',
                        height: 40
                    },
                    {
                        fieldLabel: htcConfig.locData.PublicFolderLinkSendEmails,
                        xtype: 'textfield',
                        id: 'anonym-emails-field'
                    }, {
                        fieldLabel: htcConfig.locData.AnonymousLinkLimitAccessCheckBox,
                        id: 'anonym-limit-access',
                        xtype: 'textarea',
                        height: 40
                    }
                ]
            }, {
                xtype: 'container',
                labelAlign: 'top',
                colspan: 2,
                width: 604 + 35,
                layout: 'form',
                items:
                [
                    {
                        id: 'anonym-link-field',
                        fieldLabel: htcConfig.locData.AdminAnonymFoldersLinkLabel,
                        readOnly: true,
                        selectOnFocus: true,
                        xtype: 'textarea',
                        value: '',
                        anchor: '100%',
                        height: 40,
                        hidden: htcConfig.publicLinksViewType == 2,
                        hideLabel: htcConfig.publicLinksViewType == 2
                    },
                    {
                        id: 'anonym-short-link-field',
                        fieldLabel: htcConfig.locData.AdminAnonymFoldersShortColumn,
                        readOnly: true,
                        selectOnFocus: true,
                        xtype: 'textfield',
                        value: '',
                        anchor: '100%',
                        hidden: htcConfig.publicLinksViewType == 1,
                        hideLabel: htcConfig.publicLinksViewType == 1
                    }
                ]
            }
        ],
            buttons:
        [
            { //0
                text: htcConfig.locData.AnonymousEditLinkShowUrl,
                hidden: true,
                handler: function () {
                    anonymProcessHandler(true);
                }
            },
            '->', //1
            {//2
            text: htcConfig.locData.LinkToFileGenerate,
            handler: function () {
                anonymProcessHandler(anonymFolderWindow.isEditing);
            }
        },
            {//3
                text: htcConfig.locData.CommonButtonCaptionCancel,
                handler: function () { anonymFolderWindow.hide(); }
            },
            {//4
                text: htcConfig.locData.AdminCommandHelp,
                handler: function () { navigateHelpAdminPanelWithFragment("publicfolders"); }
            }
        ],
        listeners: {
            hide: function (wind) {
                if (wind.needSelectInGrid === true) {
                    var idField = Ext.getCmp('anonym-id-field');
                    var id = 0;
                    if (idField && (id = idField.getValue()) != '' && gridAnonymLinks) {
                        var indRow = gridAnonymLinks.getStore().findExact('id', id);
                        if (indRow >= 0) {
                            var selModel = gridAnonymLinks.getSelectionModel();
                            selModel.selectRow(indRow);
                            gridAnonymLinks.getView().focusRow(indRow);
                        }
                    }
                }
            },
            show: function (wind) {
                var isEdit = wind.isEditing === true && typeof wind.currentData != 'undefined';
                wind.needSelectInGrid = isEdit;
                var data = isEdit ? wind.currentData : getDefaultAnonymProps();
                var perms = data['acl'];
                wind.isFile = !(data['isfolder'] === true);
                Ext.getCmp('anonym-id-field').setValue(data['id']);
                Ext.getCmp('anonym-hash-field').setValue(data['key']);
                Ext.getCmp('anonym-owner-field').setValue(data['owner']);
                Ext.getCmp('anonym-physical-path-field').setValue(data['path']);
                Ext.getCmp('anonym-expire-date-field').setValue(data['expires']);
                Ext.getCmp('anonym-show-comments-field').setValue(data['show_comments']);
                // set passwords
                if (isEdit) {
                    wind.initPass = data['password'];
                } else {
                    wind.initPass = undefined;
                }
                Ext.getCmp('anonym-password-field').setValue(data['password']);
                Ext.getCmp('anonym-password2-field').setValue(data['password']);
                Ext.getCmp('anonym-virtual-path').setValue(data['virt_path']);
                var downCnt = 0;
                if (wind.isFile) {
                    try {
                        downCnt = Number(data['downloads']);
                    } catch (e) {
                        downCnt = 0;
                    }
                }
                Ext.getCmp('anonym-download-cnt-field').setValue(downCnt);
                Ext.getCmp('anonym-keys-field').setValue(data['key']);
                Ext.getCmp('anonym-note-users-field').setValue(data['notes']);
                Ext.getCmp('anonym-emails-field').setValue(data['emails']);
                Ext.getCmp('anonym-limit-access').setValue(data['access_users']);
                Ext.getCmp('anonym-link-field').setValue('');
                Ext.getCmp('anonym-short-link-field').setValue('');

                Ext.getCmp('anonym-type-field').items.items[1].setValue(wind.isFile);
                Ext.getCmp('anonym-type-field').items.items[0].setValue(!wind.isFile);

                if (!wind.isFile) {
                    Ext.getCmp('anonym-download-chk').setValue((perms & 2) != 0);
                    Ext.getCmp('anonym-zip-download-chk').setValue((perms & 8) != 0);
                    Ext.getCmp('anonym-view-chk').setValue((perms & 1) != 0);
                    Ext.getCmp('anonym-upload-chk').setValue((perms & 4) != 0);
                    var allowOverwrite = data['upload_overwrite'] === true;
                    Ext.getCmp('anonym-overwrite-rg').items.items[0].setValue(allowOverwrite);
                    Ext.getCmp('anonym-overwrite-rg').items.items[1].setValue(!allowOverwrite);
                }

                Ext.getCmp('anonym-physical-path-field').clearInvalid();

                if (!Ext.isEmpty(data['url'])) {
                    Ext.getCmp('anonym-link-field').setValue(data['url']);
                    if (!Ext.isEmpty(data['shortUrl'])) {
                        Ext.getCmp('anonym-short-link-field').setValue(data['shortUrl']);
                    }
                }

                wind.buttons[0].setVisible(isEdit);
                wind.buttons[2].setText(htcConfig.locData[isEdit ? 'CommandSave' : 'LinkToFileGenerate']);

            },
            afterrender: function (wind) {
                wind.syncSize();
                wind.doLayout();
            }
        }
    });
    function editAnonymLinkHandler() {
        anonymFolderWindow.needSelectInGrid = false;
        anonymFolderWindow.hide();
        var selRow = gridAnonymLinks.getSelectionModel().getSelected();
        if (selRow) {
            anonymFolderWindow.isEditing = true;
            anonymFolderWindow.currentData = selRow.data;
            anonymFolderWindow.show();
        }
    }
    if (htcConfig.publicEnabled && checkPrivilege('ModifyAnonymFolders')) {
        var anonFoldersPageSize = 100, anonStore;
        adminTabs.add({
            title: htcConfig.locData.AdminAnonymFoldersTab,
            id: 'anonym-tab',
            layout: 'fit',
            items: [gridAnonymLinks = new Ext.grid.GridPanel({
                header: true,
                headerCfg: {
                    cls: 'x-panel-tbar',
                    html: String.format(htcConfig.locData.AdminAnonymFoldersDescription, htcConfig.relativePath + "Diagnostics.aspx#trAuthIISModeForAnonymDownload")
                },
                keys: {
                    key: [
                        Ext.EventObject.ENTER,
                        Ext.EventObject.DELETE
                    ],
                    fn: function (e) {
                        switch (e) {
                            case Ext.EventObject.ENTER:
                                editAnonymLinkHandler();
                                break;
                            case Ext.EventObject.DELETE:
                                removeButton = Ext.getCmp('remove-anonym-links');
                                if (removeButton && !removeButton.disabled)
                                    removeButton.handler();
                                break;
                        }
                    },
                    scope: this
                },
                store: anonStore = new Ext.data.DirectStore({
                    remoteSort: true,
                    baseParams: { start: 0, limit: anonFoldersPageSize },
                    paramOrder: ['start', 'limit', 'sort', 'dir' ],
                    directFn: HttpCommander.Admin.GetAnonymLinks,
                    idProperty: 'id',
                    totalProperty: 'total',
                    successProperty: 'success',
                    root: 'data',
                    sortInfo: {
                        field: 'virt_path',
                        direction: 'ASC'
                    },
                    fields:
                    [
                        { name: 'id', type: 'int' },
                        { name: 'key', type: 'string' },
                        { name: 'path', type: 'string' },
                        { name: 'date', type: 'date', dateFormat: 'timestamp' },
                        { name: 'expires', type: 'date', dateFormat: 'timestamp' },
                        { name: 'withpasswd', type: 'boolean' },
                        { name: 'password', type: 'string' },
                        { name: 'acl', type: 'int' },
                        { name: 'downloads', type: 'string' },
                        { name: 'notes', type: 'string' },
                        { name: 'emails', type: 'string' },
                        { name: 'upload_overwrite', type: 'boolean' },
                        { name: 'show_comments', type: 'boolean' },
                        { name: 'isfolder', type: 'boolean' },
                        { name: 'owner', type: 'string' },
                        { name: 'isstale', type: 'boolean' },
                        { name: 'virt_path', type: 'string' },
                        { name: 'access_users', type: 'string' },
                        { name: 'created_for', type: 'string' },
                        { name: 'perms', mapping: 'perms' },
                        { name: 'url', type: 'string' },
                        { name: 'url2', type: 'string' },
                        { name: 'shortUrl', type: 'string' },
                        { name: 'shortUrl2', type: 'string' }
                    ]
                }),
                viewConfig: { forceFit: true },
                multiSelect: false,
                border: false,
                loadMask: true,
                autoExpandColumn: 'anonym-path',
                width: 352, height: 212,
                selModel: new Ext.grid.RowSelectionModel({
                    singleSelect: true,
                    listeners: {
                        selectionchange: function (model) {
                            var ttbar = gridAnonymLinks.getTopToolbar();
                            if (ttbar) {
                                var disable = model.getCount() <= 0;
                                var removeButton = ttbar.findById('remove-anonym-links');
                                if (removeButton) removeButton.setDisabled(disable);
                                var editButton = ttbar.findById('edit-anonym-link');
                                if (editButton) editButton.setDisabled(disable);
                            }
                        }
                    }
                }),
                bbar: new Ext.PagingToolbar({
                    pageSize: anonFoldersPageSize,
                    store: anonStore,
                    displayInfo: true,
                    beforePageText: htcConfig.locData.PagingToolbarBeforePageText,
                    afterPageText: htcConfig.locData.PagingToolbarAfterPageText,
                    firstText: htcConfig.locData.PagingToolbarFirstText,
                    prevText: htcConfig.locData.PagingToolbarPrevText,
                    nextText: htcConfig.locData.PagingToolbarNextText,
                    lastText: htcConfig.locData.PagingToolbarLastText,
                    displayMsg: htcConfig.locData.PagingToolbarDisplayMsg,
                    refreshText: htcConfig.locData.CommandRefresh,
                    emptyMsg: htcConfig.locData.PagingToolbarEmptyMsg
                }),
                tbar: {
                    enableOverflow: true,
                    items: [{
                        text: htcConfig.locData.CommandRefresh,
                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'refresh'),
                        handler: function () {
                            gridAnonymLinks.getStore().reload();
                        }
                    }, {
                        id: 'add-anonym-link',
                        text: htcConfig.locData.CommonButtonCaptionAdd + '...',
                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'add'),
                        handler: function () {
                            anonymFolderWindow.needSelectInGrid = false;
                            anonymFolderWindow.hide();
                            anonymFolderWindow.isEditing = false;
                            anonymFolderWindow.currentData = undefined;
                            anonymFolderWindow.show();
                        }
                    }, {
                        id: 'edit-anonym-link',
                        text: htcConfig.locData.CommandMenuEdit + '...',
                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'editanonymousefolder'),
                        disabled: true,
                        handler: editAnonymLinkHandler
                    }, {
                        id: 'remove-anonym-links',
                        text: htcConfig.locData.CommandDelete,
                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'remove'),
                        disabled: true,
                        handler: function () {
                            var removeInfo = { "ids": [] };
                            Ext.each(gridAnonymLinks.getSelectionModel().getSelections(), function (rec) {
                                removeInfo["ids"].push(rec.get('id'));
                            });
                            if (removeInfo["ids"].length <= 0)
                                return;
                            Ext.Msg.show({
                                title: htcConfig.locData.CommonConfirmCaption,
                                msg: String.format(htcConfig.locData.AdminAnonymFoldersDeleteFolderPrompt, removeInfo["ids"].length),
                                buttons: Ext.Msg.YESNO,
                                icon: Ext.Msg.QUESTION,
                                fn: function (result) {
                                    if (result == "yes") {
                                        gridAnonymLinks.loadMask.msg = htcConfig.locData.ProgressDeleting + "...";
                                        gridAnonymLinks.loadMask.show();
                                        HttpCommander.Admin.DeleteAnonymLinks(removeInfo, function (data, trans) {
                                            gridAnonymLinks.loadMask.hide();
                                            gridAnonymLinks.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                                            HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig);
                                            gridAnonymLinks.getStore().reload();
                                        });
                                    }
                                }
                            });
                        }
                    }, {
                        text: htcConfig.locData.AdminCommandHelp,
                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'help'),
                        handler: function () { navigateHelpAdminPanelWithFragment("publicfolders"); }
                    }]
                },
                plugins: [
                    new Ext.ux.grid.GridFilters({
                        menuFilterText: htcConfig.locData.MenuFilterText,
                        encode: false,
                        local: true,
                        filters: [{
                            dataIndex: 'path',
                            type: 'string',
                            emptyText: htcConfig.locData.EmptyTextFilter
                        }, {
                            dataIndex: 'virt_path',
                            type: 'string',
                            emptyText: htcConfig.locData.EmptyTextFilter
                        }, {
                            dataIndex: 'access_users',
                            type: 'string',
                            emptyText: htcConfig.locData.EmptyTextFilter
                        }, {
                            dataIndex: 'isfolder',
                            type: 'boolean',
                            yesText: htcConfig.locData.CommonValueTypeFolder,
                            noText: htcConfig.locData.CommandFile
                        }, {
                            dataIndex: 'owner',
                            type: 'string',
                            emptyText: htcConfig.locData.EmptyTextFilter
                        }, {
                            dataIndex: 'date',
                            type: 'date',
                            afterText: htcConfig.locData.AfterDateFilterText,
                            beforeText: htcConfig.locData.BeforeDateFilterText,
                            onText: htcConfig.locData.OnDateFilterText
                        }, {
                            dataIndex: 'expires',
                            type: 'date',
                            afterText: htcConfig.locData.AfterDateFilterText,
                            beforeText: htcConfig.locData.BeforeDateFilterText,
                            onText: htcConfig.locData.OnDateFilterText
                        }, {
                            dataIndex: 'withpasswd',
                            type: 'boolean',
                            yesText: htcConfig.locData.ExtMsgButtonTextYES,
                            noText: htcConfig.locData.ExtMsgButtonTextNO
                        }, {
                            dataIndex: 'downloads',
                            type: 'numeric',
                            menuItemCfgs: { emptyText: htcConfig.locData.EmptyTextFilter }
                        }, {
                            dataIndex: 'notes',
                            type: 'string',
                            emptyText: htcConfig.locData.EmptyTextFilter
                        }, {
                            dataIndex: 'emails',
                            type: 'string',
                            emptyText: htcConfig.locData.EmptyTextFilter
                        }, {
                            dataIndex: 'show_comments',
                            type: 'boolean',
                            yesText: htcConfig.locData.ExtMsgButtonTextYES,
                            noText: htcConfig.locData.ExtMsgButtonTextNO
                        }, {
                            dataIndex: 'created_for',
                            type: 'string',
                            emptyText: htcConfig.locData.EmptyTextFilter
                        }]
                    })
                ],
                colModel: new Ext.grid.ColumnModel({
                    defaults: { sortable: true },
                    columns: [{
                        id: 'anonym-id',
                        header: 'Id',
                        dataIndex: 'id',
                        hidden: true
                    }, {
                        id: 'anonym-path',
                        width: 150,
                        header: htcConfig.locData.LogsGridPhysPathColumn,
                        dataIndex: 'path',
                        renderer: wordWrapRenderer
                    }, {
                        id: 'anonym-vpath',
                        width: 150,
                        header: htcConfig.locData.CommonFieldLabelPath,
                        dataIndex: 'virt_path',
                        hidden: true,
                        renderer: wordWrapRenderer
                    }, {
                        id: 'anonym-type',
                        header: htcConfig.locData.CommonFieldLabelType,
                        dataIndex: 'isfolder',
                        width: 60,
                        renderer: function (val, cell, rec, row, col, store) {
                            return htcConfig.locData[(val ? 'CommonValueTypeFolder' : 'CommandFile')];
                        }
                    }, {
                        id: 'anonym-owner',
                        header: htcConfig.locData.AdminAnonymFoldersLinkOwnerColumn,
                        dataIndex: 'owner',
                        renderer: htmlEncodeRenderer,
                        width: 60
                    }, {
                        id: 'anonym-datecreated',
                        header: htcConfig.locData.AnonymousViewLinksDateCreatedColumn,
                        dataIndex: 'date',
                        renderer: dateRendererLocal,
                        width: 125,
                        hidden: true
                    }, {
                        id: 'anonym-dateexpired',
                        header: htcConfig.locData.AnonymousViewLinksDateExpiredColumn,
                        dataIndex: 'expires',
                        renderer: function (val, cell, rec, row, col, store) {
                            if (cell && rec && rec.get('isstale'))
                                cell.css = 'empty-lang-value';
                            return dateRendererLocal(val, cell, rec, row, col, store);
                        },
                        width: 125
                    }, {
                        id: 'anonym-with-passwd',
                        header: htcConfig.locData.CommonFieldLabelPassword,
                        dataIndex: 'withpasswd',
                        renderer: booleanRenderer,
                        width: 45,
                        align: 'center'
                    }, {
                        id: 'anonym-created-for',
                        header: htcConfig.locData.AdminAnonymFoldersCreatedForColumn,
                        dataIndex: 'created_for',
                        hidden: true,
                        width: 100,
                        renderer: htmlEncodeRenderer
                    }, {
                        id: 'anonym-permission',
                        header: htcConfig.locData.AnonymousViewLinksPermissionColumn,
                        dataIndex: 'acl',
                        width: 150,
                        renderer: function (val, cell, rec, row, col, store) {
                            var res = '';
                            if ((val & 1) != 0)
                                res += htcConfig.locData.PublicFolderAnonymViewContent;
                            if ((val & 2) != 0)
                                res += (res == '' ? '' : ', ') + htcConfig.locData.PublicFolderAnonymDownload;
                            if ((val & 4) != 0) {
                                res += (res == '' ? '' : ', ')
                                    + htcConfig.locData.PublicFolderAnonymUpload
                                    + String.format(htcConfig.locData.AdminAnonymFoldersOverwriteOnUploadHint,
                                        htcConfig.locData[rec.get('upload_overwrite') == true
                                            ? 'AdminFoldersRestrictionAllow'
                                            : 'AdminFoldersRestrictionDeny']);
                            }
                            if ((val & 8) != 0)
                                res += (res == '' ? '' : ', ') + htcConfig.locData.PublicFolderAnonymZipDownload;
                            return String.format("<span style='white-space: normal;'>{0}</span>", res);
                        }
                    }, {
                        id: 'anonym-show-comments',
                        header: htcConfig.locData.AnonymousLinkShowCommentsShort,
                        dataIndex: 'show_comments',
                        hidden: true,
                        width: 50,
                        align: 'center',
                        renderer: booleanRenderer
                    }, {
                        id: 'anonym-downloaded',
                        header: htcConfig.locData.AnonymousViewLinksDownloadedColumn,
                        dataIndex: 'downloads',
                        hidden: true,
                        renderer: htmlEncodeRenderer
                    }, {
                        id: 'anonym-notes',
                        header: htcConfig.locData.PublicFolderNoteForUsers,
                        dataIndex: 'notes',
                        renderer: htmlEncodeRenderer,
                        hidden: true
                    }, {
                        id: 'anonym-emails',
                        header: htcConfig.locData.AdminAnonymFoldersEmailsColumn,
                        dataIndex: 'emails',
                        renderer: htmlEncodeRenderer,
                        hidden: true
                    }, {
                        id: 'anonym-access-for-users',
                        header: htcConfig.locData.AdminAnonymFoldersAccessForUsersColumn,
                        dataIndex: 'access_users',
                        renderer: htmlEncodeRenderer,
                        hidden: true
                    }, {
                        id: 'anonym-keys',
                        header: htcConfig.locData.AdminAnonymFoldersKeysColumn,
                        dataIndex: 'key',
                        width: 150,
                        hidden: true,
                        renderer: htmlEncodeRenderer
                    }]
                }),
                listeners: {
                    rowdblclick: editAnonymLinkHandler
                }
            })]
        });
    }

    editUserHandler = function () {
        if (!denyEditAD) {
            var selectedRecord = gridUsers.getSelectionModel().getSelected();
            if (!selectedRecord || !selectedRecord.data) {
                return;
            }
            if (!Ext.isArray(selectedRecord.data.groups)) {
                var userInfo = { 'name': selectedRecord.data.name };
                gridUsers.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                gridUsers.loadMask.show();
                HttpCommander.Admin.GetUserGroups(userInfo, function (data, trans) {
                    gridUsers.loadMask.hide();
                    if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                        var grps = [];
                        Ext.each(data.groups || [], function (arr) {
                            if (Ext.isArray(arr) && arr.length > 0 && !Ext.isEmpty(arr[0])) {
                                grps.push(arr[0]);
                            }
                        });
                        selectedRecord.set('groups', grps);
                        selectedRecord.commit();
                        prepareEditUserWindow(selectedRecord.data);
                        editUserWindow.show();
                    }
                });
            } else {
                prepareEditUserWindow(selectedRecord.data);
                editUserWindow.show();
            }
        }
    };

    if (checkPrivilege('ModifyAccounts')) {

        adminTabs.add({
            title: htcConfig.locData.CommonFieldLabelUsers,
            layout: 'fit',
            id: 'users-tab',
            items:
            [
                gridUsers = new Ext.grid.GridPanel({
                    header: htcConfig.hcAuthMode == 'forms' && htcConfig.licenseInfo && htcConfig.licenseInfo.usersCount >= 0, //true
                    headerCfg: htcConfig.hcAuthMode == 'forms' && htcConfig.licenseInfo && htcConfig.licenseInfo.usersCount >= 0 ? {
                        cls: 'x-panel-tbar',
                        html: '<div style="color:red;">' + String.format(htcConfig.locData.AdminUsersLicenseRestriction, htcConfig.licenseInfo.usersCount) + '</div>'
                    } : undefined,
                    store: new Ext.data.DirectStore({
                        directFn: HttpCommander.Admin.GetUsers,
                        fields:
                        [
                            { name: 'name', type: 'string' },
                            { name: 'email', type: 'string' },
                            { name: 'icon', type: 'string' },
                            { name: 'customField', type: 'string' },
                            { name: 'groups' }
                        ],
                        baseParams: { 'showGroups': true }, // only applicable if used Forms Authentication
                        listeners: {
                            datachanged: function (store) {
                                var bt = gridUsers.getBottomToolbar(),
                                    countUsers = store.getTotalCount();
                                if (bt) {
                                    if (htcConfig.hcAuthMode == 'forms' && htcConfig.licenseInfo && htcConfig.licenseInfo.usersCount >= 0) {
                                        bt.items.items[0].setText(String.format(htcConfig.locData.AdminUsersCountInfoWithLimit,
                                                countUsers, htcConfig.licenseInfo.usersCount), false);
                                    } else {
                                        bt.items.items[0].setText(String.format(htcConfig.locData.AdminUsersCountInfo,
                                                countUsers), false);
                                    }
                                }
                                if (htcConfig.hcAuthMode == 'forms') {
                                    var tt = gridUsers.getTopToolbar();
                                    if (tt) {
                                        if (htcConfig.licenseInfo && htcConfig.licenseInfo.usersCount >= 0) {
                                            tt.items.items[1].setDisabled(countUsers >= htcConfig.licenseInfo.usersCount);
                                        } else {
                                            tt.items.items[1].setDisabled(false);
                                        }
                                    }
                                }
                            }
                        }
                    }),
                    viewConfig: { forceFit: true },
                    multiSelect: false,
                    border: false,
                    loadMask: true,
                    enableHdMenu: false,
                    autoExpandColumn: 'name',
                    width: 352,
                    height: 212,
                    selModel: new Ext.grid.RowSelectionModel({
                        singleSelect: denyEditAD ? true : false,
                        listeners: {
                            selectionchange: function (model) {
                                var tb = gridUsers.getTopToolbar(),
                                    rb, eb, spb, vgb, vfb,
                                    notSel = model.getCount() == 0,
                                    notOneSel = model.getCount() != 1,
                                    disabledRemove = notSel || denyEditAD,
                                    disabled = notOneSel || denyEditAD;
                                if (tb) {
                                    rb = tb.getComponent('remove-user');
                                    if (rb) rb.setDisabled(disabledRemove);
                                    eb = tb.getComponent('edit-user');
                                    if (eb) eb.setDisabled(disabled);
                                    spb = tb.getComponent('set-user-password');
                                    if (spb) spb.setDisabled(disabled);
                                    vgb = tb.getComponent('view-groups');
                                    if (vgb) vgb.setDisabled(notOneSel);
                                    vfb = tb.getComponent('view-folders');
                                    if (vfb) vfb.setDisabled(notOneSel);
                                }
                            }
                        }
                    }),
                    keys: {
                        key:
			            [
			                Ext.EventObject.ENTER
			            ],
                        fn: function (e) {
                            switch (e) {
                                case Ext.EventObject.ENTER:
                                    editUserHandler();
                                    break;
                            }
                        },
                        scope: this
                    },
                    bbar: {
                        items: [{
                            xtype: 'label',
                            html: '&nbsp;'
                        }]
                    },
                    tbar: {
                        enableOverflow: true,
                        items:
                        [
                            {
                                text: htcConfig.locData.CommandRefresh,
                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'refresh'),
                                handler: function () {
                                    gridUsers.getStore().reload();
                                }
                            },
                            {
                                text: htcConfig.locData.AdminCommandAddUser + '...',
                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'add'),
                                hidden: denyEditAD,
                                handler: function () {
                                    prepareAddUserWindow();
                                    addUserWindow.show();
                                }
                            },
                            {
                                text: htcConfig.locData.AdminUsersEditUser + '...',
                                itemId: 'edit-user',
                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'edituser'),
                                disabled: true,
                                hidden: denyEditAD,
                                handler: editUserHandler
                            },
                            {
                                itemId: 'remove-user',
                                text: htcConfig.locData.AdminCommandRemoveUser,
                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'remove'),
                                disabled: true,
                                hidden: denyEditAD,
                                handler: function () {
                                    var selectedRecords = gridUsers.getSelectionModel().getSelections();
                                    var userNames = [];
                                    Ext.each(selectedRecords, function (record) {
                                        userNames.push(record.data.name);
                                    });
                                    var removeInfo = {};
                                    removeInfo["names"] = userNames;
                                    Ext.Msg.show({
                                        title: htcConfig.locData.CommonConfirmCaption,
                                        msg: String.format(htcConfig.locData.AdminUsersDeleteUserPrompt, Ext.util.Format.htmlEncode(userNames.join('", "'))),
                                        buttons: Ext.Msg.YESNO,
                                        icon: Ext.MessageBox.QUESTION,
                                        fn: function (result) {
                                            if (result == "yes") {
                                                gridUsers.loadMask.msg = htcConfig.locData.ProgressDeleting + "...";
                                                gridUsers.loadMask.show();
                                                HttpCommander.Admin.DeleteUser(removeInfo, function (data, trans) {
                                                    gridUsers.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                                                    gridUsers.loadMask.hide();
                                                    if (typeof data == 'undefined' || !data) {
                                                        Ext.Msg.alert(htcConfig.locData.CommonErrorCaption,
                                                            Ext.util.Format.htmlEncode(trans.message));
                                                        return;
                                                    }
                                                    var isError = data.status != "success";
                                                    var msg = String.format(htcConfig.locData.AdminUsersDeletedUsers, data.deleted);
                                                    if (isError) msg = data.message + '<br />' + msg;
                                                    Ext.Msg.show({
                                                        title: htcConfig.locData[isError ? 'CommonErrorCaption' : 'AdminCommandRevomeUser'],
                                                        msg: msg,
                                                        icon: isError ? Ext.Msg.ERROR : Ext.Msg.INFO,
                                                        buttons: Ext.Msg.OK,
                                                        fn: function (btnAlert) {
                                                            if (data.deleted && data.deleted > 0)
                                                                gridUsers.getStore().reload();
                                                        }
                                                    });
                                                });
                                            }
                                        }
                                    });
                                }
                            },
                            {
                                itemId: 'set-user-password',
                                text: htcConfig.locData.AdminUsersSetUserPassword + '...',
                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'passwordreset'),
                                disabled: true,
                                hidden: denyEditAD,
                                handler: function () {
                                    var selectedRecord = gridUsers.getSelectionModel().getSelected();
                                    prepareSetUserPasswordWindow(selectedRecord.data);
                                    setUserPasswordWindow.show();
                                }
                            },
                            {
                                itemId: 'view-groups',
                                text: htcConfig.locData.AdminUsersViewGroups,
                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'group'),
                                disabled: true,
                                handler: function () {
                                    var selectedRecord = gridUsers.getSelectionModel().getSelected();
                                    var userInfo = {
                                        'name': selectedRecord.data.name
                                    };
                                    gridUsers.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                                    gridUsers.loadMask.show();
                                    HttpCommander.Admin.GetUserGroups(userInfo, function (data, trans) {
                                        gridUsers.loadMask.hide();
                                        if (!HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                                            return;
                                        }
                                        var grps = [];
                                        Ext.each(data.groups || [], function (arr) {
                                            if (Ext.isArray(arr) && arr.length > 0 && !Ext.isEmpty(arr[0])) {
                                                grps.push(arr[0]);
                                            }
                                        });
                                        selectedRecord.set('groups', grps);
                                        selectedRecord.commit();
                                        var win = new Ext.Window({
                                            title: Ext.util.Format.htmlEncode(userInfo.name),
                                            modal: true,
                                            width: 320,
                                            height: 400,
                                            closable: true,
                                            closeAction: 'close',
                                            layout: {
                                                type: 'vbox',
                                                align: 'stretch'
                                            },
                                            plain: true,
                                            items:
                                            [
                                                new Ext.grid.GridPanel({
                                                    flex: 1,
                                                    viewConfig: { forceFit: true },
                                                    multiSelect: false,
                                                    border: false,
                                                    store: new Ext.data.ArrayStore({
                                                        autoDestroy: true,
                                                        idIndex: 0,
                                                        fields: ['name'],
                                                        data: data.groups
                                                    }),
                                                    columns:
                                                    [
                                                        {
                                                            id: 'name',
                                                            sortable: true,
                                                            header: htcConfig.locData.CommonFieldLabelGroupName,
                                                            width: 100,
                                                            dataIndex: 'name',
                                                            renderer: function (value, p, r) {
                                                                return "<img src='" + HttpCommander.Lib.Utils.getIconPath(htcConfig, 'group') + "' class='filetypeimage' />" + Ext.util.Format.htmlEncode(value);
                                                            }
                                                        }
                                                    ]
                                                })
                                            ],
                                            buttons:
                                            [
                                                {
                                                    text: htcConfig.locData.CommonButtonCaptionClose,
                                                    handler: function () {
                                                        win.close();
                                                    }
                                                }
                                            ]
                                        });
                                        win.show();
                                    });
                                }
                            },
                            {
                                itemId: 'view-folders',
                                text: htcConfig.locData.AdminUsersViewFolders,
                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'viewfolders'),
                                disabled: true,
                                handler: function () {
                                    if (!userFoldersWindow)
                                        return;
                                    var selectedRecord = gridUsers.getSelectionModel().getSelected();
                                    if (!selectedRecord || !selectedRecord.data)
                                        return;
                                    userFoldersWindow.hide();
                                    userFoldersWindow.showFolders(selectedRecord.data.name, false);
                                }
                            },
                            {
                                text: htcConfig.locData.AdminCommandHelp,
                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'help'),
                                handler: function () { navigateHelpAdminPanelWithFragment('users'); }
                            }
                        ]
                    },
                    columns:
                    [
                        {
                            id: 'name',
                            sortable: true,
                            header: htcConfig.locData.CommonFieldLabelName,
                            width: 100,
                            dataIndex: 'name',
                            renderer: function (value, p, r) {
                                return "<img src='" + htcConfig.relativePath + r.data.icon + "' class='filetypeimage' />" + Ext.util.Format.htmlEncode(value);
                            }
                        },
                        {
                            id: 'groups',
                            width: 150,
                            header: htcConfig.locData.AdminUsersGroups,
                            dataIndex: 'groups',
                            renderer: htmlEncodeRenderer
                        }
                    ],
                    listeners: {
                        rowdblclick: function (grid, index, e) {
                            editUserHandler();
                        }
                    }
                })
            ]
        });
    }

    if (checkPrivilege('ModifyFolders') || htcConfig.adminFoldersExists || checkPrivilege('ModifyAccounts')) {
        try {
            userFoldersWindow = HttpCommander.Lib.AdminUserFoldersWindow({
                'htcConfig': htcConfig,
                'wordWrapRenderer': wordWrapRenderer,
                'getLoadMask': function () { return typeof gridUsers != 'undefined' ? gridUsers.loadMask : null; }
            });
        } catch (e) {
            if (debugmode || window.onerror) throw e;
        }
    }

    editGroupHandler = function () {
        if (!gridGroups || !groupWindow)
            return;

        var selectedRecord = gridGroups.getSelectionModel().getSelected();
        if (!selectedRecord || !selectedRecord.data)
            return;

        if (!selectedRecord.data.users || selectedRecord.data.users.length == 0) {
            var groupInfo = { 'name': selectedRecord.data.name };
            gridGroups.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
            gridGroups.loadMask.show();
            HttpCommander.Admin.GetGroupUsers(groupInfo, function (data, trans) {
                gridGroups.loadMask.hide();
                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                    selectedRecord.set('users', data.users);
                    selectedRecord.commit();
                    if (prepareGroupWindow(selectedRecord.data)) {
                        groupWindow.show();
                    }
                }
            });
        } else {
            if (prepareGroupWindow(selectedRecord.data)) {
                groupWindow.show();
            }
        }
    };

    if (checkPrivilege('ModifyAccounts')) {
        adminTabs.add({
            title: htcConfig.locData.CommonFieldLabelGroups,
            layout: 'fit',
            id: 'groups-tab',
            items:
            [
                gridGroups = new Ext.grid.GridPanel({
                    store: new Ext.data.DirectStore({
                        directFn: HttpCommander.Admin.GetGroups,
                        fields:
                        [
                            { name: 'name', type: 'string' },
                            { name: 'users' },
                            { name: 'icon', type: 'string' },
                            { name: 'customField', type: 'string' }
                        ],
                        listeners: {
                            datachanged: function (store) {
                                var bt = gridGroups.getBottomToolbar();
                                if (bt) {
                                    bt.items.items[0].setText(String.format(htcConfig.locData.AdminGroupsCountInfo,
                                        store.getTotalCount()), false);
                                }
                            }
                        }
                    }),
                    viewConfig: { forceFit: true },
                    multiSelect: false,
                    border: false,
                    loadMask: true,
                    enableHdMenu: false,
                    autoExpandColumn: 'name',
                    width: 352,
                    height: 212,
                    selModel: new Ext.grid.RowSelectionModel({
                        singleSelect: denyEditAD ? true : false,
                        listeners: {
                            selectionchange: function (model) {
                                var tb = gridGroups.getTopToolbar(),
                                    rb, eb, vub,
                                    noSel = model.getCount() == 0,
                                    noOneSel = model.getCount() != 1,
                                    remDisabled = noSel || denyEditAD,
                                    rebDisabled = noOneSel || denyEditAD;
                                if (tb) {
                                    rb = tb.getComponent('remove-group');
                                    eb = tb.getComponent('edit-group');
                                    vub = tb.getComponent('view-users');
                                    gpb = tb.getComponent('group-properties');
                                    if (rb) rb.setDisabled(remDisabled);
                                    if (eb) eb.setDisabled(rebDisabled);
                                    if (vub) vub.setDisabled(noOneSel);
                                    if (gpb) gpb.setDisabled(noOneSel);
                                }
                            }
                        }
                    }),
                    keys: {
                        key:
			            [
			                Ext.EventObject.ENTER
			            ],
                        fn: function (e) {
                            switch (e) {
                                case Ext.EventObject.ENTER:
                                    editGroupHandler();
                                    break;
                            }
                        },
                        scope: this
                    },
                    bbar: {
                        items: [{
                            xtype: 'label',
                            html: '&nbsp;'
                        }]
                    },
                    tbar: {
                        enableOverflow: true,
                        items:
                        [
                            {
                                text: htcConfig.locData.CommandRefresh,
                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'refresh'),
                                handler: function () {
                                    gridGroups.getStore().reload();
                                }
                            },
                            {
                                text: htcConfig.locData.AdminCommandAddGroup + '...',
                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'add'),
                                hidden: denyEditAD,
                                handler: function () {
                                    prepareGroupWindow(null);
                                    groupWindow.show();
                                }
                            },
                            {
                                text: htcConfig.locData.AdminGroupsEditGroup + '...',
                                itemId: 'edit-group',
                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'editgroup'),
                                disabled: true,
                                hidden: denyEditAD,
                                handler: editGroupHandler
                            },
                            {
                                itemId: 'remove-group',
                                text: htcConfig.locData.AdminGroupsRemoveGroup,
                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'remove'),
                                disabled: true,
                                hidden: denyEditAD,
                                handler: function () {
                                    var selectedRecords = gridGroups.getSelectionModel().getSelections();
                                    var groupNames = [];
                                    Ext.each(selectedRecords, function (record) {
                                        groupNames.push(record.data.name);
                                    });
                                    var removeInfo = {};
                                    removeInfo["names"] = groupNames;
                                    Ext.Msg.show({
                                        title: htcConfig.locData.CommonConfirmCaption,
                                        msg: String.format(htcConfig.locData.AdminGroupsDeleteGroupPrompt, Ext.util.Format.htmlEncode(groupNames.join('", "'))),
                                        buttons: Ext.Msg.YESNO,
                                        icon: Ext.MessageBox.QUESTION,
                                        fn: function (result) {
                                            if (result == "yes") {
                                                gridGroups.loadMask.msg = htcConfig.locData.ProgressDeleting + "...";
                                                gridGroups.loadMask.show();
                                                HttpCommander.Admin.DeleteGroup(removeInfo, function (data, trans) {
                                                    gridGroups.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                                                    gridGroups.loadMask.hide();
                                                    if (typeof data == 'undefined' || !data) {
                                                        Ext.Msg.alert(htcConfig.locData.CommonErrorCaption,
                                                            Ext.util.Format.htmlEncode(trans.message));
                                                        return;
                                                    }
                                                    var isError = data.status != "success";
                                                    var msg = String.format(htcConfig.locData.AdminGroupsDeletedGroups, data.deleted);
                                                    if (isError) msg = data.message + '<br />' + msg;
                                                    Ext.Msg.show({
                                                        title: htcConfig.locData[isError ? 'CommonErrorCaption' : 'AdminGroupsRemoveGroup'],
                                                        msg: msg,
                                                        icon: isError ? Ext.Msg.ERROR : Ext.Msg.INFO,
                                                        buttons: Ext.Msg.OK,
                                                        fn: function (btnAlert) {
                                                            if (data.deleted && data.deleted > 0)
                                                                gridGroups.getStore().reload();
                                                        }
                                                    });
                                                });
                                            }
                                        }
                                    });
                                }
                            },
                            {
                                itemId: 'group-properties',
                                text: htcConfig.locData.AdminGroupsProperties,
                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'details'),
                                hidden: !denyEditAD,
                                disabled: true,
                                handler: editGroupHandler
                            },
                            {
                                itemId: 'view-users',
                                text: htcConfig.locData.AdminGroupsViewUsers,
                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'user'),
                                hidden: htcConfig.hcAuthMode == 'none' || htcConfig.hcAuthMode == 'forms' || htcConfig.hcAuthMode == 'shibboleth',
                                disabled: true,
                                handler: editGroupHandler
                            },
                            {
                                text: htcConfig.locData.AdminCommandHelp,
                                icon: HttpCommander.Lib.Utils.getIconPath(this, 'help'),
                                handler: function () { navigateHelpAdminPanelWithFragment('users'); }
                            }
                        ]
                    },
                    columns:
                    [
                        {
                            id: 'name',
                            sortable: true,
                            header: htcConfig.locData.CommonFieldLabelName,
                            width: 100,
                            dataIndex: 'name',
                            renderer: function (value, p, r) {
                                return "<img src='" + htcConfig.relativePath + r.data.icon + "' class='filetypeimage' />" + Ext.util.Format.htmlEncode(value);
                            }
                        },
                        {
                            id: 'users',
                            width: 150,
                            header: htcConfig.locData.CommonFieldLabelUsers,
                            dataIndex: 'users',
                            renderer: htmlEncodeRenderer
                        }
                    ],
                    listeners: {
                        rowdblclick: function (grid, index, e) {
                            editGroupHandler();
                        }
                    }
                })
            ]
        });
    }

    var logPageSize = 200;

    if (htcConfig.logs && checkPrivilege('ViewLog')) {
        var logStore, loadLogs = function (opts) {
            if (!logStore) {
                return;
            }
            var b = Ext.getCmp('startdt'), bVal,
                e = Ext.getCmp('enddt'), eVal;
            if (b) {
                bVal = b.getValue();
                if (Ext.isDate(bVal)) {
                    bVal = bVal.clearTime().getTime();
                } else {
                    bVal = null;
                }
            }
            if (e) {
                eVal = e.getValue();
                if (Ext.isDate(eVal)) {
                    eVal = eVal.clearTime().add(Date.DAY, 1).add(Date.SECOND, -1).getTime();
                } else {
                    eVal = null;
                }
            }
            var prms = Ext.apply({
                begin: bVal, end: eVal
            }, opts || {});
            logStore.setBaseParam('begin', bVal);
            logStore.setBaseParam('end', eVal);
            if (logStore.baseParams.sort) {
                prms.sort = logStore.baseParams.sort;
            }
            if (logStore.baseParams.dir) {
                prms.dir = logStore.baseParams.dir;
            }
            if (!Ext.isDefined(prms.start)) {
                prms.start = logStore.baseParams.start || 0
            }
            if (!Ext.isDefined(prms.limit)) {
                prms.limit = logStore.baseParams.limit || logPageSize;
            }
            logStore.storeOptions(prms);
            logStore.load({ params: prms });
        };
        logStore = new Ext.data.DirectStore({
            directFn: HttpCommander.Admin.GetLog,
            remoteSort: true,
            baseParams: { start: 0, limit: logPageSize, sort: 'date', dir: 'DESC', begin: null, end: null },
            len: 6,
            paramOrder: ['start', 'limit', 'sort', 'dir', 'begin', 'end'],
            totalProperty: 'total',
            root: 'data',
            paramNames: { start: 'start', limit: 'limit', sort: 'sort', dir: 'dir', begin: 'begin', end: 'end' },
            fields: [
                { name: 'id', type: 'int' },
                { name: 'user', type: 'string' },
                { name: 'action', type: 'string' },
                { name: 'date', type: 'date', dateFormat: 'timestamp'},
                { name: 'path', type: 'string' },
                { name: 'phys_path', type: 'string' },
                { name: 'is_folder', type: 'boolean' },
                { name: 'is_public', type: 'boolean' },
                { name: 'by_webdav', type: 'boolean' },
                { name: 'more_info', type: 'string' }
            ],
            sortInfo: { field: 'date', direction: 'DESC' },
            listeners: {
                load: function (store, records, options) {
                    if (!!store && !!store.reader && !!store.reader.jsonData && !store.reader.jsonData.success) {
                        Ext.Msg.show({
                            title: htcConfig.locData.CommonErrorCaption,
                            msg: store.reader.jsonData.message,
                            icon: Ext.Msg.ERROR,
                            buttons: Ext.Msg.OK
                        });
                    }
                },
                exception: function (proxy, type, action, options, res, arg) {
                    if (type === 'remote' && res && res.message) {
                        var message = "Message: " + Ext.util.Format.htmlEncode(res.message);
                        if (res.xhr)
                            message = "Status: " + Ext.util.Format.htmlEncode(res.xhr.status)
                                + " " + Ext.util.Format.htmlEncode(res.xhr.statusText)
                                + "<br />" + message;
                        Ext.Msg.show({
                            title: htcConfig.locData.CommonErrorCaption,
                            msg: message,
                            icon: Ext.Msg.ERROR,
                            buttons: Ext.Msg.OK
                        });
                    }
                }
            }
        });
        adminTabs.add({
            title: htcConfig.locData.AdminLogsTab,
            id: 'log-tab',
            layout: 'border',
            items: [gridLog = new Ext.grid.GridPanel({
                store: logStore,
                loadStore: loadLogs,
                viewConfig: { forceFit: true },
                multiSelect: false,
                layout: 'fit',
                border: false,
                loadMask: true,
                enableHdMenu: true,
                autoExpandColumn: 'info',
                region: 'center',
                selModel: new Ext.grid.RowSelectionModel({
                    singleSelect: true,
                    listeners: {
                        selectionchange: function (model) {
                            if (model.getCount() == 0) {
                                logDetailsPanel.update('');
                            }  else {
                                var html = Ext.util.Format.htmlEncode(model.getSelected().data.more_info);
                                if (!Ext.isEmpty(html)) {
                                    html = html.replace(/\r\n|\n\r|\n/gi, '<br />');
                                }
                                logDetailsPanel.update(html);
                            }
                        }
                    }
                }),
                columns:[{
                    id: 'id',
                    sortable: true,
                    header: 'Id',
                    width: 30,
                    hidden: true,
                    dataIndex: 'id'
                }, {
                    id: 'user',
                    sortable: true,
                    header: htcConfig.locData.CommonFieldLabelUserName,
                    width: 40,
                    dataIndex: 'user',
                    renderer: htmlEncodeRenderer
                }, {
                    id: 'type',
                    sortable: true,
                    width: 30,
                    header: htcConfig.locData.CommonFieldLabelType,
                    dataIndex: 'action',
                    renderer: htmlEncodeRenderer
                }, {
                    id: 'date',
                    sortable: true,
                    width: 70,
                    header: htcConfig.locData.CommonFieldLabelDateTime,
                    dataIndex: 'date',
                    renderer: dateRendererLocal
                }, {
                    id: 'path',
                    sortable: true,
                    width: 85,
                    header: htcConfig.locData.CommonFieldLabelPath,
                    dataIndex: 'path',
                    renderer: wordWrapRenderer
                }, {
                    id: 'phys_path',
                    sortable: true,
                    width: 85,
                    header: htcConfig.locData.LogsGridPhysPathColumn,
                    dataIndex: 'phys_path',
                    renderer: wordWrapRenderer
                }, {
                    id: 'folder',
                    sortable: true,
                    width: 25,
                    header: htcConfig.locData.LogsGridIsFolderColumn,
                    dataIndex: 'is_folder',
                    renderer: booleanRenderer
                }, {
                    id: 'public',
                    sortable: true,
                    width: 25,
                    header: htcConfig.locData.LogsGridIsPublicColumn,
                    dataIndex: 'is_public',
                    renderer: booleanRenderer
                }, {
                    id: 'webdav',
                    sortable: true,
                    width: 25,
                    header: htcConfig.locData.LogsGridByWebDavColumn,
                    dataIndex: 'by_webdav',
                    renderer: booleanRenderer
                }, {
                    id: 'info',
                    sortable: true,
                    width: 250,
                    header: htcConfig.locData.LogsGridMoreInfoColumn,
                    dataIndex: 'more_info',
                    hidden: true,
                    renderer: wordWrapRenderer
                }],
                tbar: [{
                    xtype: 'label',
                    html: htcConfig.locData.SearchByDateFrom + ':&nbsp;'
                }, {
                    hideLabel: true,
                    width: 90,
                    xtype: 'datefield',
                    name: 'startdt',
                    id: 'startdt',
                    vtype: 'daterange',
                    endDateField: 'enddt',
                    value: new Date(),
                    editable: false,
                    listeners: {
                        select: function () {
                            loadLogs();
                        }
                    }
                }, {
                    xtype: 'label',
                    html: '&nbsp;&nbsp;' + htcConfig.locData.SearchByDateTo + ':&nbsp;'
                }, {
                    hideLabel: true,
                    width: 90,
                    xtype: 'datefield',
                    name: 'enddt',
                    id: 'enddt',
                    vtype: 'daterange',
                    startDateField: 'startdt',
                    value: new Date(),
                    editable: false,
                    listeners: {
                        select: function () {
                            loadLogs();
                        }
                    }
                }, ' ', {
                    text: htcConfig.locData.CommonForToday,
                    handler: function () {
                        var now = new Date(),
                            b = Ext.getCmp('startdt'),
                            e = Ext.getCmp('enddt');
                        if (now >= e.getValue()) {
                            e.setValue(now);
                            b.setValue(now);
                        } else {
                            b.setValue(now);
                            e.setValue(now);
                        }
                        loadLogs();
                    }
                }, '->', {
                    text: htcConfig.locData.CommandRefresh,
                    icon: HttpCommander.Lib.Utils.getIconPath(this, 'refresh'),
                    handler: function () {
                        loadLogs({
                            start: 0,
                            limit: logPageSize
                        });
                    }
                }],
                plugins:[new Ext.ux.grid.GridFilters({
                    menuFilterText: htcConfig.locData.MenuFilterText,
                    local: true,
                    filters: [{
                        type: 'numeric',
                        dataIndex: 'id',
                        menuItemCfgs: { emptyText: htcConfig.locData.EmptyTextFilter }
                    }, {
                        type: 'string',
                        dataIndex: 'user',
                        emptyText: htcConfig.locData.EmptyTextFilter
                    }, {
                        type: 'string',
                        dataIndex: 'action',
                        emptyText: htcConfig.locData.EmptyTextFilter
                    }, {
                        type: 'date',
                        dataIndex: 'date',
                        afterText: htcConfig.locData.AfterDateFilterText,
                        beforeText: htcConfig.locData.BeforeDateFilterText,
                        onText: htcConfig.locData.OnDateFilterText
                    }, {
                        type: 'string',
                        dataIndex: 'path',
                        emptyText: htcConfig.locData.EmptyTextFilter
                    }, {
                        type: 'string',
                        dataIndex: 'phys_path',
                        emptyText: htcConfig.locData.EmptyTextFilter
                    }, {
                        dataIndex: 'is_folder',
                        type: 'boolean',
                        yesText: htcConfig.locData.YesBooleanFilterText,
                        noText: htcConfig.locData.NoBooleanFilterText
                    }, {
                        dataIndex: 'is_public',
                        type: 'boolean',
                        yesText: htcConfig.locData.YesBooleanFilterText,
                        noText: htcConfig.locData.NoBooleanFilterText
                    }, {
                        dataIndex: 'by_webdav',
                        type: 'boolean',
                        yesText: htcConfig.locData.YesBooleanFilterText,
                        noText: htcConfig.locData.NoBooleanFilterText
                    }, {
                        type: 'string',
                        dataIndex: 'more_info',
                        emptyText: htcConfig.locData.EmptyTextFilter
                    }]
                })],
                bbar: new Ext.PagingToolbar({
                    pageSize: logPageSize,
                    store: logStore,
                    displayInfo: true,
                    beforePageText: htcConfig.locData.PagingToolbarBeforePageText,
                    afterPageText: htcConfig.locData.PagingToolbarAfterPageText,
                    firstText: htcConfig.locData.PagingToolbarFirstText,
                    prevText: htcConfig.locData.PagingToolbarPrevText,
                    nextText: htcConfig.locData.PagingToolbarNextText,
                    lastText: htcConfig.locData.PagingToolbarLastText,
                    displayMsg: htcConfig.locData.PagingToolbarDisplayMsg,
                    refreshText: htcConfig.locData.CommandRefresh,
                    emptyMsg: htcConfig.locData.PagingToolbarEmptyMsg
                })
            }), logDetailsPanel = new Ext.Panel({
                title: htcConfig.locData.LogsGridDetailsTitle,
                region: 'east',
                split: true,
                width: 200,
                collapsible: true,
                collapseMode: 'mini'
            })]
        });
    }

    if (checkPrivilege('ViewErrorsLog')) {
        var logErrorsStore = new Ext.data.DirectStore({
            directFn: HttpCommander.Admin.GetLogErrors,
            remoteSort: true,
            baseParams: { start: 0, limit: logPageSize },
            len: 4,
            paramOrder: ['start', 'limit', 'sort', 'dir'],
            totalProperty: 'total',
            root: 'data',
            paramNames: { start: 'start', limit: 'limit', sort: 'sort', dir: 'dir' },
            fields:
            [
                { name: 'type', type: 'string' },
                { name: 'date', type: 'date' },
                { name: 'url', type: 'string' },
                { name: 'msg', type: 'string' },
                { name: 'info', type: 'string' }
            ],
            sortInfo: { field: 'date', direction: 'DESC' },
            listeners: {
                datachanged: function (store) {
                    if (gridLogErrors) {
                        var tb = gridLogErrors.getTopToolbar();
                        if (tb) {
                            tb.items.items[2].setVisible(store.getTotalCount() > 0);
                            tb.items.items[3].setVisible(store.getTotalCount() > 0 && htcConfig.usersCountExceeded === true);
                        }
                    }
                }
            }
        });

        adminTabs.add({
            title: htcConfig.locData.AdminLogsErrorsTab,
            id: 'log-errors-tab',
            layout: 'border',
            items:
            [
                gridLogErrors = new Ext.grid.GridPanel({
                    store: logErrorsStore,
                    viewConfig: { forceFit: true },
                    multiSelect: false,
                    border: false,
                    loadMask: true,
                    enableHdMenu: true,
                    autoExpandColumn: 'msg-le',
                    region: 'center',
                    selModel: new Ext.grid.RowSelectionModel({
                        singleSelect: true,
                        listeners: {
                            selectionchange: function (model) {
                                if (model.getCount() == 0) {
                                    logErrorsDetailsPanel.update("");
                                } else {
                                    var html = model.getSelected().data.info;
                                    logErrorsDetailsPanel.update(html);
                                }
                            }
                        }
                    }),
                    columns:
                    [
                        {
                            id: 'type-le',
                            sortable: true,
                            header: htcConfig.locData.CommonFieldLabelType,
                            width: 180,
                            dataIndex: 'type',
                            renderer: wordWrapRenderer
                        },
                        {
                            id: 'date-le',
                            sortable: true,
                            width: 110,
                            header: htcConfig.locData.CommonFieldLabelDateTime,
                            dataIndex: 'date',
                            renderer: dateRendererLocal
                        },
                        {
                            id: 'url-le',
                            sortable: true,
                            width: 250,
                            header: htcConfig.locData.LogsErrorsGridUrlColumn,
                            dataIndex: 'url',
                            renderer: wordWrapRenderer
                        },
                        {
                            id: 'msg-le',
                            sortable: true,
                            header: htcConfig.locData.LogsErrorsGridMsgColumn,
                            width: 350,
                            dataIndex: 'msg',
                            renderer: wordWrapRenderer
                        }
                    ],
                    tbar:
                    [
                        {
                            text: htcConfig.locData.CommandRefresh,
                            icon: HttpCommander.Lib.Utils.getIconPath(this, 'refresh'),
                            handler: function () {
                                gridLogErrors.getStore().reload();
                            }
                        },
                        '-',
                        {
                            text: htcConfig.locData.AdminLogsErrorsClearBtn,
                            hidden: true,
                            handler: function () {
                                gridLogErrors.loadMask.show();
                                HttpCommander.Admin.ClearLogErrors(function (data, trans) {
                                    gridLogErrors.loadMask.hide();
                                    if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                                        htcConfig.usersCountExceeded = false;
                                        gridLogErrors.getStore().reload();
                                    }
                                });
                            }
                        },
                        {
                            text: htcConfig.locData.AdminLogsErrorsClearUsersCountExceededBtn,
                            hidden: true,
                            handler: function () {
                                gridLogErrors.loadMask.show();
                                HttpCommander.Admin.ClearUsersCountExceededErrors(function (data, trans) {
                                    gridLogErrors.loadMask.hide();
                                    if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                                        htcConfig.usersCountExceeded = false;
                                        gridLogErrors.getStore().reload();
                                    }
                                });
                            }
                        }
                    ],
                    plugins:
                    [
                        new Ext.ux.grid.GridFilters({
                            menuFilterText: htcConfig.locData.MenuFilterText,
                            local: true,
                            filters:
                            [
                                {
                                    type: 'string',
                                    dataIndex: 'type',
                                    emptyText: htcConfig.locData.EmptyTextFilter
                                },
                                {
                                    type: 'date',
                                    dataIndex: 'date',
                                    afterText: htcConfig.locData.AfterDateFilterText,
                                    beforeText: htcConfig.locData.BeforeDateFilterText,
                                    onText: htcConfig.locData.OnDateFilterText
                                },
                                {
                                    type: 'string',
                                    dataIndex: 'url',
                                    emptyText: htcConfig.locData.EmptyTextFilter
                                },
                                {
                                    type: 'string',
                                    dataIndex: 'msg',
                                    emptyText: htcConfig.locData.EmptyTextFilter
                                }
                            ]
                        })
                    ],
                    bbar: new Ext.PagingToolbar({
                        pageSize: logPageSize,
                        store: logErrorsStore,
                        displayInfo: true,
                        beforePageText: htcConfig.locData.PagingToolbarBeforePageText,
                        afterPageText: htcConfig.locData.PagingToolbarAfterPageText,
                        firstText: htcConfig.locData.PagingToolbarFirstText,
                        prevText: htcConfig.locData.PagingToolbarPrevText,
                        nextText: htcConfig.locData.PagingToolbarNextText,
                        lastText: htcConfig.locData.PagingToolbarLastText,
                        displayMsg: htcConfig.locData.PagingToolbarDisplayMsg,
                        refreshText: htcConfig.locData.CommandRefresh,
                        emptyMsg: htcConfig.locData.PagingToolbarEmptyMsg
                    })
                }),
                logErrorsDetailsPanel = new Ext.Panel({
                    title: htcConfig.locData.LogsErrorsGridDetailsTitle,
                    region: 'south',
                    split: true,
                    height: 300,
                    collapsible: true,
                    collapseMode: 'mini',
                    autoScroll: true
                })
            ]
        });
    }

    if (checkPrivilege('ModifyLocalizations'))
        try {
            Ext.Direct.addProvider(HttpCommander.Remote.CommonHandler);
            var fillLangStrings = function (lang) {
                lang = lang || '';
                var refreshBtn = Ext.getCmp('refresh-lang');
                if (refreshBtn) refreshBtn.setDisabled(false);
                var saveAsBtn = Ext.getCmp('save-as-lang');
                if (saveAsBtn) saveAsBtn.setDisabled(false);
                var saveAsCsvBtn = Ext.getCmp('save-csv');
                if (saveAsCsvBtn) saveAsCsvBtn.setDisabled(false);
                var loadCsvBtn = Ext.getCmp('load-csv');
                if (loadCsvBtn) loadCsvBtn.setDisabled(false);
                langStore.load({ params: { lang: lang, fromcsv: false} });
            }
            var cbLanguage = new Ext.form.ComboBox({
                editable: false,
                width: 140,
                triggerAction: 'all',
                mode: 'remote',
                store: new Ext.data.DirectStore({
                    reader: new Ext.data.JsonReader({
                        idProperty: 'name',
                        root: 'data',
                        fields: ['name']
                    }),
                    autoLoad: false,
                    api: { read: HttpCommander.Common.LocalizationList },
                    listeners: {
                        load: function () {
                            if (cbLanguage.showLang) {
                                cbLanguage.setValue(cbLanguage.showLang);
                                fillLangStrings(cbLanguage.showLang);
                            }
                            cbLanguage.showLang = null;
                        }
                    }
                }),
                valueField: 'name',
                displayField: 'name',
                tpl: '<tpl for="."><div class="x-combo-list-item">{name:htmlEncode}</div></tpl>',
                lazyInit: false,
                listeners: {
                    beforeselect: function (combo, record, index) {
                        if (gridLang.getStore().getModifiedRecords().length > 0 || (Ext.getCmp('save-lang') && !Ext.getCmp('save-lang').disabled)) {
                            Ext.Msg.show({
                                title: htcConfig.locData.AdminLangConfirmRefreshTitle,
                                msg: htcConfig.locData.AdminLangConfirmRefreshMessage,
                                buttons: Ext.Msg.YESNOCANCEL,
                                fn: function (btn) {
                                    if (btn == 'yes') {
                                        langSaveAsFunc(combo.getValue(), langStore, record.data.name);
                                    }
                                    else if (btn == 'no') {
                                        combo.showLang = record.data.name;
                                        combo.getStore().reload();
                                    }
                                    else return false;
                                }
                            });
                            return false;
                        }
                        return true;
                    },
                    'select': function (combo, record, index) {
                        fillLangStrings(record.data.name);
                    }
                }
            });
            var langStore = new Ext.data.DirectStore({
                directFn: HttpCommander.Admin.GetLocalizaion,
                remoteSort: false,
                baseParams: { lang: '', fromcsv: false },
                totalProperty: 'total',
                paramOrder: ['lang', 'fromcsv'],
                root: 'data',
                successProperty: 'success',
                fields:
            [
                { name: 'key', type: 'string' },
                { name: 'val', type: 'string' },
                { name: 'def', type: 'string' },
                { name: 'isadm', type: 'boolean' }
                //,{ name: 'valid', type: 'boolean' }
            ],
                listeners: {
                    beforeload: function (store) {
                        store.commitChanges();
                    },
                    datachanged: function (store) {
                        if (gridLang) {
                            var total = 0;
                            if (store && typeof store.getTotalCount == 'function') {
                                total = store.getTotalCount();
                            }
                            var bb = gridLang.getBottomToolbar();
                            if (bb) {
                                var emptyKeys = 0;
                                if (store.reader && store.reader.jsonData && Ext.isNumber(store.reader.jsonData.emptyKeys))
                                    emptyKeys = store.reader.jsonData.emptyKeys;
                                bb.items.items[0].setText(String.format(htcConfig.locData.AdminLangAmountInfo,
                                    (total - emptyKeys), total, emptyKeys), false);
                            }
                        }
                    },
                    load: function (store, records, options) {
                        var saveBtn = Ext.getCmp('save-lang');
                        if (saveBtn) saveBtn.setDisabled(true);

                        if (!store.reader.jsonData.success)
                            Ext.Msg.show({
                                title: htcConfig.locData.CommonErrorCaption,
                                msg: Ext.util.Format.htmlEncode(store.reader.jsonData.error),
                                icon: Ext.MessageBox.ERROR,
                                buttons: Ext.Msg.OK
                            });
                        if (store.lastOptions.params['fromcsv']) {
                            if (saveBtn) saveBtn.setDisabled(false);
                        }
                        store.lastOptions.params['fromcsv'] = false;
                    },
                    exception: function (proxy, type, action, options, res, arg) {
                        if (type === 'remote') {
                            var message = "Message: " + Ext.util.Format.htmlEncode(res.message);
                            if (res.xhr)
                                message = "Status: " + Ext.util.Format.htmlEncode(res.xhr.status)
                                    + " " + Ext.util.Format.htmlEncode(res.xhr.statusText) + "<br />"
                                    + message;
                            Ext.Msg.show({
                                title: htcConfig.locData.CommonErrorCaption,
                                msg: message,
                                icon: Ext.Msg.ERROR,
                                buttons: Ext.Msg.OK
                            });
                        }
                    }
                }
            });
            var langSaveAsFunc = function (lang, store, langForShow, exportToCsv) {
                if (!store || !store.getRange || store.getRange() == 0) return;
                lang = lang || '';
                langForShow = langForShow || lang;
                var saveInfo = { lang: lang, ldata: [], toCsv: !!exportToCsv };
                var recs = store.getRange();
                Ext.each(recs, function (r) {
                    saveInfo.ldata.push({ key: r.data.key, val: Ext.util.Format.htmlDecode(r.data.val) }); //, old: (r.modified != null ? Ext.util.Format.htmlEncode(r.modified.val) : null) });
                });
                gridLang.loadMask.msg = htcConfig.locData.ProgressSaving + "...";
                gridLang.loadMask.show();
                HttpCommander.Admin.SaveLangAs(saveInfo, function (data, trans) {
                    gridLang.loadMask.hide();
                    gridLang.loadMask.msg = htcConfig.locData.ProgressLoading + "...";
                    if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                        cbLanguage.showLang = langForShow;
                        cbLanguage.getStore().reload();
                    }
                });
            }

            adminTabs.add({
                title: htcConfig.locData.AdminLanguagesTab,
                id: 'languages-tab',
                layout: 'border',
                items:
            [
                gridLang = new Ext.grid.EditorGridPanel({
                    store: langStore,
                    //title: htcConfig.locData.AdminLanguagesTabMessage,
                    clicksToEdit: 1,
                    pruneModifiedRecords: true,
                    viewConfig: { forceFit: true },
                    multiSelect: false,
                    border: false,
                    loadMask: true,
                    enableHdMenu: true,
                    autoExpandColumn: 'val-lang',
                    region: 'center',
                    selModel: new Ext.grid.RowSelectionModel({
                        singleSelect: true
                    }),
                    columns:
                    [
                    /*{
                    id: 'val-valid',
                    header: 'valid',
                    sortable: true,
                    dataIndex: 'valid'
                    },*/
                        {
                        id: 'key-lang',
                        sortable: true,
                        header: '<b>' + htcConfig.locData.AdminLangGridKeyColumn + '</b>',
                        width: 80,
                        dataIndex: 'key',
                        renderer: function (val, cell, rec) {
                            cell.css = '';
                            //if (!rec.data.valid) cell.css = 'empty-lang-value';
                            if (rec.data.isadm) cell.css += ' admin-server-lang-record';
                            return '<b>' + qtipCellRenderer(val, cell, rec) + '</b>';
                        }
                    },
                        {
                            id: 'val-lang',
                            sortable: true,
                            width: 200,
                            header: htcConfig.locData.CommonFieldLabelValue,
                            dataIndex: 'val',
                            renderer: function (val, cell, rec, rowIndex, colIndex, store) {
                                val = val || '';
                                cell.css = '';
                                if (val == '') cell.css = 'empty-lang-value';
                                else if (rec.data.isadm) cell.css = 'admin-server-lang-record';
                                return String.format("<span style='white-space:normal;'>{0}</span>", Ext.util.Format.htmlEncode(val));
                            },
                            editor: new Ext.form.TextArea({})
                        },
                        {
                            id: 'def-lang',
                            sortable: true,
                            width: 200,
                            header: htcConfig.locData.AdminLangGridDefaultColumn,
                            dataIndex: 'def',
                            renderer: function (val, cell, rec) {
                                if (!val) val = '';
                                cell.css = '';
                                if (rec.data.isadm) cell.css = 'admin-server-lang-record';
                                return String.format("<span style='white-space: normal;'>{0}</span>", Ext.util.Format.htmlEncode(val));
                            }
                        }
                    ],
                    bbar: {
                        items: [{
                            xtype: 'label',
                            html: '&nbsp;'
                        }]
                    },
                    tbar: {
                        xtype: 'container',
                        layout: 'anchor',
                        height: 27 * 2,
                        defaults: { height: 27, anchor: '100%' },
                        items:
                        [
                            new Ext.Toolbar({
                                enableOverflow: true,
                                items:
                                [
                                    {
                                        xtype: 'tbtext',
                                        html: htcConfig.locData.SettingsLanguage + ":&nbsp;"
                                    },
                                    cbLanguage,
                                    {
                                        id: 'refresh-lang',
                                        text: htcConfig.locData.CommandRefresh, icon: HttpCommander.Lib.Utils.getIconPath(this, 'refresh'),
                                        disabled: true,
                                        handler: function () {
                                            if (gridLang.getStore().getModifiedRecords().length > 0) {
                                                Ext.Msg.show({
                                                    title: htcConfig.locData.AdminLangConfirmRefreshTitle,
                                                    msg: htcConfig.locData.AdminLangConfirmRefreshMessage,
                                                    buttons: Ext.Msg.YESNOCANCEL,
                                                    fn: function (btn) {
                                                        if (btn == 'yes') langSaveAsFunc(cbLanguage.getValue(), langStore);
                                                        else if (btn == 'no') langStore.reload();
                                                    }
                                                });
                                            } else langStore.reload();
                                        }
                                    },
                                    {
                                        id: 'save-lang',
                                        text: htcConfig.locData.CommandSave,
                                        disabled: true,
                                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'savetofile'),
                                        handler: function () {
                                            langSaveAsFunc(cbLanguage.getValue(), langStore);
                                        }
                                    },
                                    {
                                        id: 'save-as-lang',
                                        text: htcConfig.locData.CommandSaveAs,
                                        disabled: true,
                                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'saveas'),
                                        handler: function () {
                                            Ext.Msg.prompt(htcConfig.locData.AdminEnterLanguageNameTitle, '', function (btn, text) {
                                                if (btn == 'ok') {
                                                    var lang = text.toString().trim();
                                                    if (lang != '') langSaveAsFunc(lang, langStore);
                                                }
                                            });
                                        }
                                    },
                                    {
                                        id: 'save-csv',
                                        text: htcConfig.locData.AdminLangSaveToCSV,
                                        disabled: true,
                                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'savetofile'),
                                        handler: function () {
                                            langSaveAsFunc(cbLanguage.getValue(), langStore, false, true);
                                        }
                                    },
                                     {
                                         id: 'load-csv',
                                         text: htcConfig.locData.AdminLangLoadFromCSV,
                                         disabled: true,
                                         icon: HttpCommander.Lib.Utils.getIconPath(this, 'refresh'),
                                         handler: function () {
                                             langStore.load({ params: { lang: cbLanguage.getValue(), fromcsv: true} });
                                         }
                                     },
                                    {
                                        text: htcConfig.locData.AdminCommandHelp,
                                        icon: HttpCommander.Lib.Utils.getIconPath(this, 'help'),
                                        handler: function () { showHelpWindow('Manual/localization.html'); }
                                    }
                                ]
                            }),
                            new Ext.Toolbar({
                                items:
                                [
                                    {
                                        text: htcConfig.locData.AdminLanguagesTabMessage,
                                        xtype: 'tbtext'
                                    }
                                ]
                            })
                        ]
                    },
                    plugins:
                    [
                        new Ext.ux.grid.GridFilters({
                            local: true,
                            menuFilterText: htcConfig.locData.MenuFilterText,
                            filters:
                            [
                                {
                                    type: 'string',
                                    dataIndex: 'key',
                                    emptyText: htcConfig.locData.EmptyTextFilter
                                },
                                {
                                    type: 'string',
                                    dataIndex: 'val',
                                    emptyText: htcConfig.locData.EmptyTextFilter
                                },
                                {
                                    type: 'string',
                                    dataIndex: 'def',
                                    emptyText: htcConfig.locData.EmptyTextFilter
                                }
                            ]
                        })
                    ],
                    listeners: {
                        afteredit: function (e) {
                            var saveBtn = Ext.getCmp('save-lang');
                            if (saveBtn) saveBtn.setDisabled(e.grid.getStore().getModifiedRecords().length == 0);
                        }
                    }
                })
            ]
            });
        } catch (e) { if (debugmode || window.onerror) throw e; }

    if (htcConfig.isFullAdmin) {

        // Add admin permissions tab
        try {
            adminPermsTab = HttpCommander.Lib.AdminPermissions({
                'htcConfig': htcConfig,
                'promptUserName': promptUserName,
                'promptGroupName': promptGroupName,
                'navigateHelpAdminPanelWithFragment': navigateHelpAdminPanelWithFragment,
                'identitiesRenderer': identitiesRenderer,
                'htmlEncodeRenderer': htmlEncodeRenderer,
                'getShowListForAllowedFolders': function () { return showListForAllowedFolders; }
            });
            if (adminPermsTab)
                adminTabs.add(adminPermsTab);
        } catch (e) {
            if (debugmode || window.onerror)
                throw e;
        }

        // Add maintenance database tab
        try {
            adminTabs.add(HttpCommander.Lib.AdminDbMaintenance({
                'htcConfig': htcConfig
            }));
        } catch (e) {
            if (debugmode || window.onerror) {
                throw e;
            }
        }

        // Add misc tab if windows version
        try {
            if (isWindowsVersion) {
                adminTabs.add(HttpCommander.Lib.AdminMisc({
                    'htcConfig': htcConfig,
                    'getAjaxRequestTimeout': function () { return ajaxRequestTimeout; }
                }));
            }
        } catch (e) {
            if (debugmode || window.onerror) {
                throw e;
            }
        }

        updateTab = HttpCommander.Lib.AdminUpdate({
            'htcConfig': htcConfig,
            'getAjaxRequestTimeout': function () { return ajaxRequestTimeout; }
        });

        adminTabs.add(updateTab);
    }

    adminTabs.doLayout();

    Ext.QuickTips.init();

    // create toolbar
    var adminToolbarItems = [];
    adminToolbarItems.push(tbtnGoFileManager = new Ext.Toolbar.Button({
        text: htcConfig.locData.CommandFileManager,
        icon: HttpCommander.Lib.Utils.getIconPath(this, 'fileman'),
        handler: function () {
            if (isControl && controlUrl != '')
                location.href = controlUrl;
            else if (!isControl)
                location.href = htcConfig.relativePath + "Default.aspx";
        }
    }));
    if (htcConfig.viewDiag) {
        adminToolbarItems.push(tbtnDiagnostics = new Ext.Toolbar.Button({
            text: htcConfig.locData.CommandDiagnostics, icon: HttpCommander.Lib.Utils.getIconPath(this, 'diagnostics'),
            handler: function () { window.open(htcConfig.relativePath + "Diagnostics.aspx"); }
        }));
    }
    if (htcConfig.allowRestart) {
        adminToolbarItems.push(tbtnRestartApplication = new Ext.Toolbar.Button({
            text: htcConfig.locData.CommandAppRestart,
            icon: HttpCommander.Lib.Utils.getIconPath(this, 'restart'),
            handler: function () {
                showSettingsMask();
                HttpCommander.Admin.RestartApplication(function (data, trans) {
                    hideSettingsMask();
                    if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, Ext.Msg, htcConfig)) {
                        Ext.Msg.alert(htcConfig.locData.CommonWarningCaption,
                            htcConfig.locData.SettingsApplicationRestartedMsg);
                    }
                });
            }
        }));
    }
    if (htcConfig.isFullAdmin) {
        adminToolbarItems.push(tbtnLicenseInfo = new Ext.Toolbar.Button({
            text: htcConfig.locData.CommandLicenseInfo, icon: HttpCommander.Lib.Utils.getIconPath(this,
                 adminPanelFirstLoad && ((htcConfig.showTrial && htcConfig.demoExpired) || htcConfig.showUpgrade) ? 'keywarn' : 'key'),
            handler: function () {
                var message = htcConfig.locData.LicenseTrial;
                var licInfo = htcConfig.licenseInfo;
                if (!htcConfig.showTrial && licInfo) {
                    if (licInfo.usersCount < 0)
                        licInfo.usersCount = "Unlimited";
                    message = String.format(htcConfig.locData.LicensePrompt, '<br />', licInfo.usersCount, licInfo.purchaseDate
                        + (licInfo.forVersion ? ('<br />For version: ' + licInfo.forVersion) : ''));
                    if (htcConfig.showUpgrade) {
                        message += String.format(htcConfig.locData.LicenseCheckMessage, '//www.element-it.com/checklicense.aspx'
                            + (!!licInfo && !!licInfo.hash ? ('?key=' + encodeURIComponent(licInfo.hash)) : ''));
                    } else {
                        if (licInfo.daysForFreeUpgrade < 0) {
                            message += "Your license type allow you to perform minor upgrades for free and major version upgrades with 50% discount.<br />";
                        } else {
                            message += String.format(htcConfig.locData.LicenseFreeUpgradeMessage, licInfo.daysForFreeUpgrade) + "<br />";
                        }
                        message += "<a href='//www.element-it.com/purchase.aspx?product=httpcommander' target='_blank'>HTTPCommander purchase page</a>";
                    }
                } else {
                    message += htcConfig.demoExpired
                        ? ".<br /><b style='color:Red;'>Your evaluation period has expired!</b>"
                        : ('.<br />Days left: ' + htcConfig.trialDaysLeft);
                }
                Ext.Msg.show({
                    title: htcConfig.locData.LicenseTitle,
                    msg: message,
                    icon: Ext.Msg.INFO,
                    buttons: Ext.Msg.OK
                });
            }
        }));

        adminToolbarItems.push(tbtnBuyNow = new Ext.Toolbar.Button({
            text: htcConfig.locData.CommandBuyNow, icon: HttpCommander.Lib.Utils.getIconPath(this, 'buynow'),
            handler: function () {
                window.open("//www.element-it.com/purchase.aspx?product=httpcommander");
            }
        }));
    }
    adminToolbarItems.push({ xtype: 'label', html: '<div style="width:30px;"></div>' });
    adminToolbarItems.push(tbtnSaveSettingsMsg = new Ext.Toolbar.TextItem({
        text: htcConfig.locData.SettingsSettingsSaveNotif,
        hidden: true,
        style: {
            color: 'red',
            fontWeight: 'bold',
            fontSize: '1.2em'
        }
    }));
    adminToolbarItems.push({ xtype: 'tbfill' });
    adminToolbarItems.push(tbtnNewVersion = new Ext.Toolbar.Button({
        xtype: 'button',
        hidden: true,
        text: '<span style="color:red;font-weight:bold;">' + htcConfig.locData.AdminNewVersionAvailableTitle + '</span>',
        handler: function () {
            try {
                var newv = detectNewVersion();
                if (Ext.isEmpty(newv)) {
                    return;
                }
                var oldv = htcConfig.hccurrentversion.join('.');
                var message = String.format(htcConfig.locData.AdminNewVersionAvailableInfo,
                        '<b>' + oldv + '</b>', '<b>' + newv + '</b>')
                    + '<br/><br/>'
                    + '<a href="//www.element-it.com/httpcommander-changelog.aspx" target="_blank">Changelog page</a><br />'
                    + '<a href="//www.element-it.com/download.aspx?type=' + encodeURIComponent(htcConfig.version || 'st') + '" target="_blank">Dowload page</a><br />'
                    + '<a href="' + '//www.element-it.com/checklicense.aspx' +
                        (!!htcConfig.licenseInfo && !!htcConfig.licenseInfo.hash
                            ? ('?key=' + encodeURIComponent(htcConfig.licenseInfo.hash)) : '')
                    + '" target="_blank">Check license page</a>';
                Ext.Msg.show({
                    title: htcConfig.locData.AdminNewVersionAvailableTitle,
                    msg: message,
                    icon: Ext.Msg.INFO,
                    buttons: Ext.Msg.OK,
                    fn: function (btn) {
                        //if (btn == 'ok') {
                        //    if (!!updateTab) {
                        //        adminTabs.activate(updateTab);
                        //    }
                        //}
                    }
                });
            } catch (e) { }
        }
    }));
    adminToolbarItems.push(tbtnLiveSupport = new Ext.Toolbar.TextItem({
        hidden: typeof htcConfig == 'undefined' || htcConfig.enableLiveSupport !== true,
        text: typeof htcConfig == 'undefined' || htcConfig.enableLiveSupport !== true ? '&nbsp;' : String.format(liveSupportEl, htcConfig.licenseAndVersionQueryString)
    }));
    adminToolbarItems.push(tbtnLogout = new Ext.Toolbar.Button({
        xtype: 'button',
        hidden: isControl,
        text: Ext.util.Format.htmlEncode(htcConfig.currentUser),
        tooltip: { text: htcConfig.locData.CommandLogoutHint, title: htcConfig.locData.CommandLogout },
        icon: HttpCommander.Lib.Utils.getIconPath(this, 'logout'),
        handler: function () {
            location.href = htcConfig.relativePath + "Logout.aspx";
        }
    }));


    var view = new Ext.Panel({
        renderTo: Ext.getBody(),
        showHeader: false,
        layout: 'border',
        margins: '5 0 0 0',
        height: Ext.getBody().getViewSize().height,
        items:
        [
            adminTabs,
            {
                region: 'south',
                html: '<font color="red">'
                    + Ext.util.Format.htmlEncode(htcConfig.locData.AdminCommonSettingsChangeWarning)
                    + '</font>'
                    + (htcConfig.allowedFoldersPaths && htcConfig.allowedFoldersPaths.length > 0 ?
                      '<br/><br/><b>' + Ext.util.Format.htmlEncode(htcConfig.locData.AdminCommonAllowedFoldersPathsTitle) + ':</b></br>'
                    + Ext.util.Format.htmlEncode(htcConfig.allowedFoldersPaths)
                    : '')
            }
        ],
        tbar: new Ext.Toolbar({
            enableOverflow: true,
            cls: 'x-panel-header',
            height: typeof htcConfig == 'undefined' || htcConfig.enableLiveSupport !== true ? 27 : 37,
            items: adminToolbarItems
        }),
        listeners: {
            afterrender: function (viewPanel) {
                hcVersionReceived();
                if ((htcConfig.isFullAdmin || checkPrivilege('ViewErrorsLog'))
                        && htcConfig.usersCountExceeded === true) {
                    Ext.Msg.show({
                        title: htcConfig.locData.CommonWarningCaption,
                        msg: String.format(htcConfig.locData.AdminUsersCountExceededWarn,
                            htcConfig.licenseInfo.usersCount, htcConfig.locData.AdminLogsErrorsTab,
                                htcConfig.uniqueUsersCountExceededExceptionName),
                        icon: Ext.Msg.WARNING,
                        buttons: Ext.Msg.CANCEL
                    });
                }
            }
        }
    });

    Ext.EventManager.onWindowResize(function () {
        var el = Ext.getBody();
        view.setHeight(el.getViewSize().height);
        view.setWidth(el.getViewSize().width);
    }, this);
});

function getDefaultPermission(name) {
    var daac = {};
    daac = Ext.apply(daac, getDefaultAAC());
    daac.identityName = name;
    daac.listRestriction = { type: 1, extensions: [] };
    daac.createRestriction = { type: 1, extensions: [] };
    daac.customField = '';
    return daac;
}

/* fill the fpPermissions panel of the FolderPermissions dialog */
function fillPermissionData(permission, panel) {
    var form = panel.getForm();
    form.items.each(function(item) { item.suspendEvents(false); });
    form.setValues(permission);
    panel.findById('list-rest').setValue(permission.listRestriction.type);
    panel.findById('list-ext').setValue(permission.listRestriction.extensions.join(','));
    panel.findById('create-rest').setValue(permission.createRestriction.type);
    panel.findById('create-ext').setValue(permission.createRestriction.extensions.join(','));
    if (permission.customField) panel.findById('folders-permissions-custom-field').setValue(permission.customField);
    form.items.each(function(item) { item.resumeEvents(); });
}

/* save permissions selected on the fpPermissions panel of the FolderPermissions dialog */
function updatePermission() {
    var selectedRecord = gridPerms.getSelectionModel().getSelected();
    if (selectedRecord) {
        var values = fpPermissions.getForm().getValues();
        selectedRecord.data.permission.create = fpPermissions.findById('create').getValue();
        selectedRecord.data.permission.del = fpPermissions.findById('del').getValue();
        selectedRecord.data.permission.rename = fpPermissions.findById('rename').getValue();
        selectedRecord.data.permission.upload = fpPermissions.findById('upload').getValue();
        selectedRecord.data.permission.download = fpPermissions.findById('download').getValue();
        selectedRecord.data.permission.zipDownload = fpPermissions.findById('zipDownload').getValue();
        selectedRecord.data.permission.zip = fpPermissions.findById('zip').getValue();
        selectedRecord.data.permission.unzip = fpPermissions.findById('unzip').getValue();
        selectedRecord.data.permission.cut = fpPermissions.findById('cut').getValue();
        selectedRecord.data.permission.copy = fpPermissions.findById('copy').getValue();
        selectedRecord.data.permission.listFiles = fpPermissions.findById('listFiles').getValue();
        selectedRecord.data.permission.listFolders = fpPermissions.findById('listFolders').getValue();
        selectedRecord.data.permission.modify = fpPermissions.findById('modify').getValue();
        selectedRecord.data.permission.bulkMailing = fpPermissions.findById('bulkMailing').getValue();
        selectedRecord.data.permission.anonymDownload = fpPermissions.findById('anonymDownload').getValue();
        selectedRecord.data.permission.anonymUpload = fpPermissions.findById('anonymUpload').getValue();
        selectedRecord.data.permission.anonymViewContent = fpPermissions.findById('anonymViewContent').getValue();
        selectedRecord.data.permission.watchForModifs = fpPermissions.findById('watchForModifs').getValue();
        selectedRecord.data.permission.listRestriction.type = parseInt(values.listType);
        selectedRecord.data.permission.createRestriction.type = parseInt(values.createType);

        var listExtensions = fpPermissions.findById('list-ext').getValue();
        var createExtensions = fpPermissions.findById('create-ext').getValue();

        selectedRecord.data.permission.listRestriction.extensions = listExtensions ?  listExtensions.toUpperCase().split(',') : [];
        selectedRecord.data.permission.createRestriction.extensions = createExtensions ? createExtensions.toUpperCase().split(',') : [];
        
        selectedRecord.data.permission.customField = fpPermissions.findById('folders-permissions-custom-field').getValue();    
    }
}

function validateFolderData() {
    var folderName = commonFolderInfo.findById('folder-name').getValue();
    var folderPath = commonFolderInfo.findById('folder-path').getValue();
    if (!folderName) return htcConfig.locData.AdminFoldersEmptyName;
    if (!folderPath) return htcConfig.locData.AdminFoldersEmptyPath;
    if (/*folderName.indexOf('&') != -1 || */folderName.indexOf('\\') != -1 || folderName.indexOf(':') != -1 || folderName.indexOf('/') != -1) return htcConfig.locData.AdminFoldersIncorrectName;

    /*if (!folderWindow.isEditing) {
        var folderExists = false;
        Ext.each(gridFolders.getStore().data.items, function(item) {
            if (item.data.name.toLowerCase() == folderName.toLowerCase()) folderExists = true;
        });
        if (folderExists) return htcConfig.locData.AdminFoldersAlreadyExists;
    }*/

    //var regexp = new RegExp('^([A-Za-z]:|\\{2}([-\w]+|((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\\(([^"*/:?|<>\\,;[\]+=.\x00-\x20]|\.[.\x20]*[^"*/:?|<>\\,;[\]+=.\x00-\x20])([^"*/:?|<>\\,;[\]+=\x00-\x1F]*[^"*/:?|<>\\,;[\]+=\x00-\x20])?))\\([^"*/:?|<>\\.\x00-\x20]([^"*/:?|<>\\\x00-\x1F]*[^"*/:?|<>\\.\x00-\x20])?\\)*$');
    //if (!regexp.exec(commonFolderInfo.findById('folder-path').getValue())) return "Invalid folder path";
    
    return null;
}

function validateAddUserData() {
    var userName = addUserInfo.findById('add-user-name').getValue();
    if (!userName) 
        return htcConfig.locData.AdminUsersEmptyName;
    var userPassword  = addUserInfo.findById('add-user-password').getValue();
    var userPassword2 = addUserInfo.findById('add-user-password2').getValue();
    if (!userPassword)
        return htcConfig.locData.AdminUsersEmptyPassword;
    if(userPassword != userPassword2)
        return htcConfig.locData.AdminUsersPasswordsNotMatch;

    var userExists = false;
    Ext.each(gridUsers.getStore().data.items, function(item) {
        if (item.data.name.toLowerCase() == userName.toLowerCase()) userExists = true;
    });
    if (userExists) 
        return htcConfig.locData.AdminUsersAlreadyExists;
    return null;
}

function validateEditUserData() {
    var userName = editUserInfo.findById('edit-user-name').getValue();
    if (!userName)
        return htcConfig.locData.AdminUsersEmptyName;

    if (editUserInfo.userName != userName) {
        var userExists = false;
        Ext.each(gridUsers.getStore().data.items, function(item) {
            if (item.data.name.toLowerCase() == userName.toLowerCase()) userExists = true;
        });
        if (userExists) return htcConfig.locData.AdminUsersAlreadyExists;
    }
    return null;
}

function validateSetUserPasswordData() {
    var userPassword  = setUserPasswordInfo.findById('set-user-password-password').getValue();
    var userPassword2 = setUserPasswordInfo.findById('set-user-password-password2').getValue();
    if (!userPassword)
        return htcConfig.locData.AdminUsersEmptyPassword;
    if(userPassword != userPassword2)
        return htcConfig.locData.AdminUsersPasswordsNotMatch;
    return null;
}

function validateGroupData() {
    var groupName = groupInfo.findById('group-name').getValue();
    if (!groupName) return htcConfig.locData.AdminGroupsEmptyName;
    if (!groupWindow.isEditing || (groupWindow.isEditing && groupInfo.groupName != groupName)) {
        var groupExists = false;
        Ext.each(gridGroups.getStore().data.items, function(item) {
            if (item.data.name.toLowerCase() == groupName.toLowerCase()) groupExists = true;
        });
        if (groupExists) return htcConfig.locData.AdminGroupsAlreadyExists;
    }
    return null;
}

function aggregateFolderData() {
    var folder = {};
    var folderNameField = commonFolderInfo.findById('folder-name');
    var folderName = folderNameField.getValue();
    if (folderName.trim().toLowerCase() === 'root') {
        Ext.Msg.show({
            title: htcConfig.locData.CommonWarningCaption,
            msg: String.format(htcConfig.locData.AdminFoldersRootNameUsed,
                Ext.util.Format.htmlEncode(folderName)),
            icon: Ext.MessageBox.WARNING,
            buttons: Ext.Msg.OK,
            fn: function () {
                if (folderNameField) {
                    folderNameField.focus(true);
                }
            }
        });
        return null;
    }
    folder["name"] = folderName;
    folder["path"] = commonFolderInfo.findById('folder-path').getValue();
    folder["limitations"] = commonFolderInfo.findById('folder-limitations').getValue();
    folder["description"] = commonFolderInfo.findById('folder-description').getValue();
    folder["customField"] = commonFolderInfo.findById('folder-custom-field').getValue();
    folder["filterField"] = commonFolderInfo.findById('folder-filter-field').getValue();
    folder["userPerms"] = [];
    folder["groupPerms"] = [];
    Ext.each(gridPerms.getStore().data.items, function(item) {
        if (!item.data.permission.identityName || item.data.permission.identityName == '' || item.data.permission.identityName != item.data.name)
            item.data.permission.identityName = item.data.name;
        if (item.data.typeId == 'user')
            folder["userPerms"].push(item.data.permission);
        else 
            folder["groupPerms"].push(item.data.permission);
    });
    return folder;
}

function aggregateAddUserData() {
    var user = {};
    user["name"] = addUserInfo.findById('add-user-name').getValue();
    user["password"] = addUserInfo.findById('add-user-password').getValue();
    user["email"] = addUserInfo.findById('add-user-email').getValue();
    user["customField"] = addUserInfo.findById('add-user-custom-field').getValue();
    user["groups"] = [];
    Ext.each(addGridMembersOf.getStore().data.items, function (item) {
        user["groups"].push(item.data.name);
    });
    return user;
}

function aggregateEditUserData() {
    var user = {};
    user["origName"] = editUserInfo.userName;
    user["name"] = editUserInfo.findById('edit-user-name').getValue();
    user["email"] = editUserInfo.findById('edit-user-email').getValue();
    user["customField"] = editUserInfo.findById('edit-user-custom-field').getValue();
    user["groups"] = [];
    Ext.each(editGridMembersOf.getStore().data.items, function (item) {
        user["groups"].push(item.data.name);
    });
    return user;
}

function aggregateSetUserPasswordData() {
    var user = {};
    user["name"] = setUserPasswordInfo.findById('set-user-password-name').getValue();
    user["password"] = setUserPasswordInfo.findById('set-user-password-password').getValue();
    return user;
}

function aggregateGroupData() {
    var group = {};
    group["name"] = groupInfo.findById('group-name').getValue();
    group["users"] = [];
    Ext.each(gridMembers.getStore().data.items, function (item) {
        group["users"].push(item.data.name);
    });
    group["origName"] = groupInfo.groupName;
    group["customField"] = groupInfo.findById('group-custom-field').getValue();
    return group;
}

function getDefaultAAC() {
    return htcConfig.defaultAAC || {
        create: true, del: true, rename: true, upload: true, download: true,
        zipDownload: true, zip: true, unzip: true, cut: true, copy: true,
        listFiles: true, listFolders: true, modify: true, bulkMailing: false,
        anonymDownload: true, anonymUpload: true, anonymViewContent: true,
        watchForModifs: true
    };
}

function prepareFolderWindow(folder) {
    var daac = {}, shareNote;
    daac = Ext.apply(daac, getDefaultAAC());
    fpPermissions.findById('create').setValue(daac.create);
    fpPermissions.findById('del').setValue(daac.del);
    fpPermissions.findById('rename').setValue(daac.rename);
    fpPermissions.findById('upload').setValue(daac.upload);
    fpPermissions.findById('download').setValue(daac.download);
    fpPermissions.findById('zipDownload').setValue(daac.zipDownload);
    fpPermissions.findById('zip').setValue(daac.zip);
    fpPermissions.findById('unzip').setValue(daac.unzip);
    fpPermissions.findById('cut').setValue(daac.cut);
    fpPermissions.findById('copy').setValue(daac.copy);
    fpPermissions.findById('listFiles').setValue(daac.listFiles);
    fpPermissions.findById('listFolders').setValue(daac.listFolders);
    fpPermissions.findById('modify').setValue(daac.modify);
    fpPermissions.findById('bulkMailing').setValue(daac.bulkMailing);
    fpPermissions.findById('anonymDownload').setValue(daac.anonymDownload);
    fpPermissions.findById('anonymUpload').setValue(daac.anonymUpload);
    fpPermissions.findById('anonymViewContent').setValue(daac.anonymViewContent);
    fpPermissions.findById('watchForModifs').setValue(daac.watchForModifs);
    fpPermissions.findById('list-rest').setValue("1");
    fpPermissions.findById('create-rest').setValue("1");
    fpPermissions.findById('list-ext').setValue("");
    fpPermissions.findById('create-ext').setValue("");
    fpPermissions.findById('folders-permissions-custom-field').setValue("");
    fpPermissions.setDisabled(true);
    if (!folder) {
        folderWindow.isEditing = false;
        folderWindow.buttons[2].setText(htcConfig.locData.CommonButtonCaptionAdd);
        shareNote = document.getElementById('share-note');
        if (shareNote) shareNote.innerHTML = '';
        commonFolderInfo.findById('folder-name').setDisabled(false);
        commonFolderInfo.findById('folder-name').setValue("");
        commonFolderInfo.findById('folder-path').setValue("");
        commonFolderInfo.findById('original-folder-path').setValue("");
        commonFolderInfo.findById('folder-limitations').setValue("");
        commonFolderInfo.findById('folder-description').setValue("");
        commonFolderInfo.findById('folder-custom-field').setValue("");
        commonFolderInfo.findById('folder-filter-field').setValue("");
        gridPerms.getStore().removeAll();
    } else {
        folderWindow.isEditing = true;
        folderWindow.buttons[2].setText(htcConfig.locData.CommandSave);
        commonFolderInfo.findById('folder-name').setDisabled(true);
        commonFolderInfo.findById('folder-name').setValue(folder.name);
        commonFolderInfo.findById('folder-path').setValue(folder.path);

        shareNote = document.getElementById('share-note');
        if (folder.path && folder.path.trim().indexOf('\\\\') == 0) {
            var isFormsAuth = htcConfig.hcAuthMode == 'forms'; 
            var innerHtml = String.format(
                htcConfig.locData[isFormsAuth ? 'AdminFoldersFolderRemoteWarningForms' : 'AdminFoldersFolderRemoteWarningWin'],
                '<br /><a href="Manual/faq.html#' + (isFormsAuth ? 'accessshredfolder' : 'abe') + '" target="_blank">',
                '</a>'
            );
            if (shareNote) {
                document.getElementById('share-note').innerHTML = innerHtml;
            } else {
                folderWindow.buttons[0].html = '<div id="share-note" style="color:red;white-space:normal;width:350px;">' + innerHtml + '</div>';
            }
        } else {
            if (shareNote) {
                document.getElementById('share-note').innerHTML = '';
            } else {
                var button = folderWindow.buttons[0];
                folderWindow.buttons[0].html = '<div id="share-note" style="color:red;white-space:normal;width:350px;"></div>';
            }
        }
        
        commonFolderInfo.findById('original-folder-path').setValue(folder.path);
        commonFolderInfo.findById('folder-limitations').setValue(folder.limitations);
        commonFolderInfo.findById('folder-description').setValue(folder.description);
        commonFolderInfo.findById('folder-custom-field').setValue(folder.customField);
        commonFolderInfo.findById('folder-filter-field').setValue(folder.filterField);
        if (folder.filterError && folder.filterError != '')
            commonFolderInfo.findById('folder-filter-field').markInvalid(folder.filterError);
        var store = gridPerms.getStore();
        store.removeAll();
        Ext.each(folder.userPerms, function(item) {
            var userRecord = new PermissionRecord({
                name: item.identityName,
                type: htcConfig.locData.CommonFieldLabelUser,
                typeId: 'user',
                icon: HttpCommander.Lib.Utils.getIconPath(this, 'user'),
                permission: item
            });
            store.add(userRecord);
        }, this);
        Ext.each(folder.groupPerms, function(item) {
            var groupRecord = new PermissionRecord({
                name: item.identityName,
                type: htcConfig.locData.CommonFieldLabelGroup,
                typeId: 'group',
                icon: HttpCommander.Lib.Utils.getIconPath(this, 'group'),
                permission: item
            });
            store.add(groupRecord);
        }, this);
    }
}

function prepareAddUserWindow(user) {
    addUserInfo.findById('add-user-name').setValue("");
    addUserInfo.findById('add-user-password').setValue("");
    addUserInfo.findById('add-user-password2').setValue("");
    addUserInfo.findById('add-user-email').setValue("");
    addUserInfo.findById('add-user-custom-field').setValue("");
    addGridMembersOf.getTopToolbar().setVisible(!denyEditAD);
    var store = addGridMembersOf.getStore();
    store.removeAll();
    store.commitChanges();
}

function prepareEditUserWindow(user) {
    editUserInfo.userName = user.name;
    editUserInfo.findById('edit-user-name').setValue(user.name);
    editUserInfo.findById('edit-user-email').setValue(user.email);
    editUserInfo.findById('edit-user-custom-field').setValue(user.customField);
    editGridMembersOf.getTopToolbar().setVisible(!denyEditAD);
    var store = editGridMembersOf.getStore();
    store.removeAll();
    Ext.each(user.groups || [], function (item) {
        var memberRecord = new MemberRecord({
            name: item,
            icon: HttpCommander.Lib.Utils.getIconPath(this, 'group')
        });
        store.add(memberRecord);
    }, this);
    store.commitChanges();
}

function prepareSetUserPasswordWindow(user) {
    setUserPasswordInfo.findById('set-user-password-name').setValue(user.name);
    setUserPasswordInfo.findById('set-user-password-password').setValue("");
    setUserPasswordInfo.findById('set-user-password-password2').setValue("");
}

function prepareGroupWindow(group) {
    if (!group) {
        if (!denyEditAD) {
            groupWindow.isEditing = false;
            groupWindow.buttons[0].setText(htcConfig.locData.CommonButtonCaptionAdd);
            groupInfo.groupName = '';
            groupInfo.findById('group-name').setDisabled(false);
            groupInfo.findById('group-name').setValue("");
            groupInfo.findById('group-custom-field').setValue("");
            gridMembers.getStore().removeAll();
            gridMembers.getStore().commitChanges();
            return true;
        } else {
            return false;
        }
    } else {
        groupWindow.isEditing = true;
        var saveBtn = groupWindow.buttons[0];
        if (saveBtn) {
            saveBtn.setText(htcConfig.locData.CommandSave);
            saveBtn.setVisible(!denyEditAD);
        }
        groupInfo.groupName = group.name;
        var fieldName = groupInfo.findById('group-name');
        if (fieldName) {
            fieldName.setDisabled(denyEditAD);
            fieldName.setValue(group.name);
        }
        var fieldCustom = groupInfo.findById('group-custom-field')
        if (fieldCustom) {
            fieldCustom.setDisabled(denyEditAD);
            fieldCustom.setValue(group.customField);
        }
        gridMembers.getTopToolbar().setVisible(!denyEditAD);
        var store = gridMembers.getStore();
        store.removeAll();
        Ext.each(group.users, function(item) {
            var memberRecord = new MemberRecord({
                name: item,
                icon: HttpCommander.Lib.Utils.getIconPath(this, 'user')
            });
            store.add(memberRecord);
        }, this);
        store.commitChanges();
        return true;
    }
}

/**
 *  groupsCallback(selWindow, btn, groupsArray)
 *  selWindow for close
 *  btn - button that user clicked: 'ok', 'cancel'
 *  groupsArray - selected groups names array if btn is 'ok'
 */
function promptGroupsNames(rows, groupsCallback) {
    if (!Ext.isFunction(groupsCallback)) {
        return;
    }

    var erows = rows;
    var groupsGrid, fltPlugin, groupsSelectWindow;
    var allGroupsStore = new Ext.data.DirectStore({
        directFn: HttpCommander.Admin.GetGroups,
        autoLoad: false,
        remoteSort: false,
        remoteFilter: false,
        fields: ['name', 'icon' ],
        listeners: {
            load: function (store) {
                if (Ext.isArray(erows) && erows.length > 0) {
                    Ext.each(erows, function (erow) {
                        var idx = store.find('name', erow.get('name'), 0, false, false);
                        if (idx >= 0) {
                            store.removeAt(idx);
                        }
                    });
                    store.commitChanges();
                }
            },
            datachanged: function (store) {
                var bt = groupsGrid.getBottomToolbar();
                if (bt) {
                    bt.items.items[0].setText(String.format(htcConfig.locData.AdminGroupsCountInfo,
                        store.data.items.length), false);
                }
            }
        }
    });
    var onGroupsSelectChagned = function () {
        var sm = groupsGrid.getSelectionModel();
        var sf = groupsGrid.getTopToolbar().items.items[0];
        var okBtn = groupsSelectWindow.buttons[0];
        if (!!okBtn) {
            okBtn.setDisabled(sm.getCount() == 0 && Ext.isEmpty(sf.getValue()));
        }
    };
    var dqTask = new Ext.util.DelayedTask(function () {
        if (!fltPlugin) {
            return;
        }
        var fld = Ext.getCmp('search-group-field');
        if (!fld) {
            return;
        }
        var value = fld.getValue();
        fld.onTrigger2Click.call(fld, fld);
    }, groupsSelectWindow);
    groupsSelectWindow = new Ext.Window({
        title: htcConfig.locData.AdminCommandSelectGroups,
        labelWidth: 100,
        closeAction: 'close',
        frame: true,
        width: 300,
        minWidth: 300,
        height: 300,
        minHeight: 200,
        maximizable: true,
        resizable: true,
        border: false,
        modal: true,
        layout: 'fit',
        plain: true,
        buttonAlign: 'center',
        plain: true,
        items: [groupsGrid = new Ext.grid.GridPanel({
            plain: true,
            frame: false,
            border: false,
            header: false,
            loadMask: true,
            flex: 1,
            anchor: '100%',
            layout: 'fit',
            viewConfig: {
                forceFit: true,
                autoFill: true,
                hdCtxIndex: 0
            },
            bbar: [{
                xtype: 'label',
                html: '&nbsp;'
            }],
            tbar: [{
                hideLabel: true,
                id: 'search-group-field',
                xtype: 'searchfield',
                ctCls: 'x-form-quick-search-wrap' + (Ext.isGecko ? '-ie' : ''),
                emptyText: htcConfig.locData.AdminSearchGroupEmptyText,
                flex: 1,
                anchor: '100%',
                width: 190,
                minWidth: 190,
                enableKeyEvents: true,
                listeners: {
                    keypress: onGroupsSelectChagned,
                    change: onGroupsSelectChagned,
                    keyup: function (fld, e) {
                        var k = e.getKey();
                        if (k == e.BACKSPACE || !e.isSpecialKey()) {
                            dqTask.delay(10);
                        }
                    }
                },
                searchHandler: function (field, value) {
                    fltPlugin.getMenuFilter().setValue(value);
                    fltPlugin.onCheckChange.call(fltPlugin, null, value);
                },
                onClearFilter: function (field) {
                    fltPlugin.getMenuFilter().setValue('');
                    fltPlugin.onCheckChange.call(fltPlugin, null, '');
                }
            }],
            store: allGroupsStore,
            columns: [{
                dataIndex: 'name',
                header: htcConfig.locData.CommonFieldLabelGroupName,
                sortable: true,
                renderer: function (val) {
                    return Ext.util.Format.htmlEncode(val || '');
                }
            }],
            plugins: [fltPlugin = new Ext.ux.grid.GridFilters({
                menuFilterText: htcConfig.locData.MenuFilterText,
                encode: false,
                local: true,
                filters: [{
                    dataIndex: 'name',
                    type: 'string',
                    emptyText: htcConfig.locData.EmptyTextFilter
                }]
            })],
            multiSelect: true,
            selModel: new Ext.grid.RowSelectionModel({
                singleSelect: false,
                listeners: {
                    selectionchange: onGroupsSelectChagned
                }
            }),
            listeners: {
                rowdblclick: function (grd, rowIndex, e) {
                    groupsSelectWindow.buttons[0].handler();
                }
            }
        })],
        listeners: {
            show: function (win) {
                allGroupsStore.load();
            }
        },
        buttons: [{
            text: htcConfig.locData.CommonButtonCaptionOK,
            disabled: true,
            handler: function () {
                var groups = [];
                var sfv = groupsGrid.getTopToolbar().items.items[0].getValue();
                Ext.each(groupsGrid.getSelectionModel().getSelections(), function (row) {
                    groups.push(row.get('name'));
                });
                if (groups.length == 0 && !Ext.isEmpty(sfv)) {
                    groups.unshift(sfv);
                }
                if (groups.length == 0) {
                    Ext.Msg.show({
                        title: htcConfig.locData.CommonErrorCaption,
                        msg: htcConfig.locData.AdminFoldersGroupNameNotSelected,
                        icon: Ext.MessageBox.ERROR,
                        buttons: Ext.Msg.CANCEL
                    });
                } else {
                    groupsCallback(groupsSelectWindow, 'ok', groups);
                }
            }
        }, {
            text: htcConfig.locData.CommonButtonCaptionCancel,
            handler: function () {
                groupsCallback(groupsSelectWindow, 'cancel', []);
            }
        }]
    });
    groupsSelectWindow.show();
}

/**
 *  usersCallback(selWindow, btn, usersArray)
 *  selWindow for close
 *  btn - button that user clicked: 'ok', 'cancel'
 *  usersArray - selected users names array if btn is 'ok'
 */
function promptUsersNames(rows, usersCallback) {
    if (!Ext.isFunction(usersCallback)) {
        return;
    }

    var erows = rows;
    var usersGrid, fltPlugin, usersSelectWindow;
    var allUsersStore = new Ext.data.DirectStore({
        directFn: HttpCommander.Admin.GetUsers,
        autoLoad: false,
        remoteSort: false,
        remoteFilter: false,
        fields: ['name', 'email', 'icon', 'customField'],
        listeners: {
            load: function (store) {
                if (Ext.isArray(erows) && erows.length > 0) {
                    Ext.each(erows, function (erow) {
                        var idx = store.find('name', erow.get('name'), 0, false, false);
                        if (idx >= 0) {
                            store.removeAt(idx);
                        }
                    });
                    store.commitChanges();
                }
            },
            datachanged: function (store) {
                var bt = usersGrid.getBottomToolbar();
                if (bt) {
                    bt.items.items[0].setText(String.format(htcConfig.locData.AdminUsersCountInfo,
                        store.data.items.length), false);
                }
            }
        }
    });
    var onUsersSelectChagned = function () {
        var sm = usersGrid.getSelectionModel();
        var sf = usersGrid.getTopToolbar().items.items[0];
        var okBtn = usersSelectWindow.buttons[0];
        if (!!okBtn) {
            okBtn.setDisabled(sm.getCount() == 0 && Ext.isEmpty(sf.getValue()));
        }
    };
    var dqTask = new Ext.util.DelayedTask(function () {
        if (!fltPlugin) {
            return;
        }
        var fld = Ext.getCmp('search-user-field');
        if (!fld) {
            return;
        }
        var value = fld.getValue();
        fld.onTrigger2Click.call(fld, fld);
    }, usersSelectWindow);
    usersSelectWindow = new Ext.Window({
        title: htcConfig.locData.AdminCommandSelectUsers,
        labelWidth: 100,
        closeAction: 'close',
        frame: true,
        width: 300,
        minWidth: 300,
        height: 300,
        minHeight: 200,
        maximizable: true,
        resizable: true,
        border: false,
        modal: true,
        layout: 'fit',
        plain: true,
        buttonAlign: 'center',
        plain: true,
        items: [usersGrid = new Ext.grid.GridPanel({
            plain: true,
            frame: false,
            border: false,
            header: false,
            loadMask: true,
            flex: 1,
            anchor: '100%',
            layout: 'fit',
            viewConfig: {
                forceFit: true,
                autoFill: true,
                hdCtxIndex: 0
            },
            bbar: [{
                xtype: 'label',
                html: '&nbsp;'
            }],
            tbar: [{
                hideLabel: true,
                id: 'search-user-field',
                xtype: 'searchfield',
                ctCls: 'x-form-quick-search-wrap' + (Ext.isGecko ? '-ie' : ''),
                emptyText: htcConfig.locData.AdminSearchUserEmptyText,
                flex: 1,
                anchor: '100%',
                width: 190,
                minWidth: 190,
                enableKeyEvents: true,
                listeners: {
                    keypress: onUsersSelectChagned,
                    change: onUsersSelectChagned,
                    keyup: function (fld, e) {
                        var k = e.getKey();
                        if (k == e.BACKSPACE || !e.isSpecialKey()) {
                            dqTask.delay(10);
                        }
                    }
                },
                searchHandler: function (field, value) {
                    fltPlugin.getMenuFilter().setValue(value);
                    fltPlugin.onCheckChange.call(fltPlugin, null, value);
                },
                onClearFilter: function (field) {
                    fltPlugin.getMenuFilter().setValue('');
                    fltPlugin.onCheckChange.call(fltPlugin, null, '');
                }
            }],
            store: allUsersStore,
            columns: [{
                dataIndex: 'name',
                header: htcConfig.locData.CommonFieldLabelUserName,
                sortable: true,
                renderer: function (val) {
                    return Ext.util.Format.htmlEncode(val || '');
                }
            }],
            plugins: [fltPlugin = new Ext.ux.grid.GridFilters({
                menuFilterText: htcConfig.locData.MenuFilterText,
                encode: false,
                local: true,
                filters: [{
                    dataIndex: 'name',
                    type: 'string',
                    emptyText: htcConfig.locData.EmptyTextFilter
                }]
            })],
            multiSelect: true,
            selModel: new Ext.grid.RowSelectionModel({
                singleSelect: false,
                listeners: {
                    selectionchange: onUsersSelectChagned
                }
            }),
            listeners: {
                rowdblclick: function (grd, rowIndex, e) {
                    usersSelectWindow.buttons[0].handler();
                }
            }
        })],
        listeners: {
            show: function (win) {
                allUsersStore.load();
            }
        },
        buttons: [{
            text: htcConfig.locData.CommonButtonCaptionOK,
            disabled: true,
            handler: function () {
                var users = [];
                var sfv = usersGrid.getTopToolbar().items.items[0].getValue();
                Ext.each(usersGrid.getSelectionModel().getSelections(), function (row) {
                    users.push(row.get('name'));
                });
                if (users.length == 0 && !Ext.isEmpty(sfv)) {
                    users.unshift(sfv);
                }
                if (users.length == 0) {
                    Ext.Msg.show({
                        title: htcConfig.locData.CommonErrorCaption,
                        msg: htcConfig.locData.AdminFoldersUserNameNotSelected,
                        icon: Ext.MessageBox.ERROR,
                        buttons: Ext.Msg.CANCEL
                    });
                } else {
                    usersCallback(usersSelectWindow, 'ok', users);
                }
            }
        }, {
            text: htcConfig.locData.CommonButtonCaptionCancel,
            handler: function () {
                usersCallback(usersSelectWindow, 'cancel', []);
            }
        }]
    });
    usersSelectWindow.show();
}

/*
    userCallback(btn, userName)
    btn - button that user clicked: 'ok', 'cancel'
    userName - selected user name if btn is 'ok'
*/
function promptUserName(userCallback, withRegex) {
    var allUsersStore = new Ext.data.DirectStore({
        directFn: HttpCommander.Admin.GetUsers,
        autoLoad: false,
        fields: ['name', 'email', 'icon', 'customField'],
        listeners: {
            load: function (store) {
                var cmb = Ext.getCmp('userNameCombo');
                if (!!cmb) {
                    cmb.mode = 'local';
                    cmb.minChars = 0;
                    cmb.queryDelay = 10;
                }
            }
        }
    });
    var daclUsersStore;
    var showDACL = htcConfig.winAuth;
    var fpPath = '';
    if (showDACL) {
        if (folderWindow && folderWindow.findById('folder-path')) {
            fpPath = folderWindow.findById('folder-path').getValue();
            showDACL = fpPath && fpPath != '';
        } else showDACL = false;
    }    
    var uswItems = [];
    if (showDACL) {
        daclUsersStore = new Ext.data.DirectStore({
            directFn: HttpCommander.Admin.GetUsersFromDACL,
            autoLoad: false,
            baseParams: { folder: fpPath },
            paramOrder: ['folder'],
            fields: [ 'name', 'acl' ]
        });
        uswItems.push({
            id: 'users-all-or-dacl',
            xtype: 'radiogroup',
            vertical: false,
            columns: 2,
            hideLabel: true,
            anchor: '100%',
            items:
            [
                {
                    boxLabel: htcConfig.locData.AdminUsersListAll,
                    name: 'rb-auto',
                    id: 'users-all-radio',
                    checked: true,
                    listeners:
                    {
                        check: function (radio, checked) {
                            var combo = Ext.getCmp('userNameCombo');
                            if (combo) combo.bindStore(checked ? allUsersStore : daclUsersStore, false);
                            var daclStr = Ext.getCmp('daclUserString');
                            if (daclStr) {
                                daclStr.setVisible(false);
                                if (!checked) {
                                    var fIndex = daclUsersStore.findBy(function(rec, id) { return rec.get("name").toLowerCase() == combo.getValue().toLowerCase(); });
                                    if (fIndex >= 0) {
                                        daclStr.setText("<span>" + htcConfig.locData.AdminDACLStringLabel + ": <b>" + daclUsersStore.getAt(fIndex).data.acl + "</b></span>", false);
                                        daclStr.setVisible(true);
                                    }
                                }
                            }
                        } 
                    }
                },
                {
                    boxLabel: htcConfig.locData.AdminUsersListDACL,
                    name: 'rb-auto',
                    id: 'users-dacl-radio'
                }
            ]
        });
    }  
    uswItems.push({
        id: 'userNameCombo',
        fieldLabel: htcConfig.locData.AdminFoldersUserNamePrompt,
        xtype: 'combo',
        displayField: 'name',
        anchor: '100%',
        mode: 'remote', //'local',
        triggerAction: 'all',
        disableKeyFilter: true,
        loadingText: htcConfig.locData.ProgressLoading + '...',
        emptyText: htcConfig.locData.AdminFoldersUserNameEmptyText + '...',
        selectOnFocus: true,
        editable: true,
        lazyInit: false,
        minChars: 50,
        typeAhead: true,
        tpl: '<tpl for="."><div class="x-combo-list-item">{name:htmlEncode}</div></tpl>',
        store: allUsersStore,
        listeners: {
            'select': function (combo, record, index) {
                var daclStr = Ext.getCmp('daclUserString');
                if (daclStr) {
                    daclStr.setVisible(false);
                    daclStr.setText('');
                    var rg = Ext.getCmp('users-dacl-radio');
                    if (rg && rg.checked) {
                        daclStr.setText("<span>" + htcConfig.locData.AdminDACLStringLabel + ": <b>" + record.data.acl + "</b></span>", false);
                        daclStr.setVisible(true);
                    }
                } 
            },
            change: function(combo, newValue, oldValue) {
                var daclStr = Ext.getCmp('daclUserString');
                if (daclStr) {
                    var rg = Ext.getCmp('users-dacl-radio');
                    daclStr.setVisible(false);
                    daclStr.setText('');
                    if (rg && rg.checked) {
                        var fIndex = daclUsersStore.findBy(function(rec, id) { return rec.get("name").toLowerCase() == newValue.toLowerCase(); });
                        if (fIndex >= 0) {
                            daclStr.setText("<span>" + htcConfig.locData.AdminDACLStringLabel + ": <b>" + daclUsersStore.getAt(fIndex).data.acl + "</b></span>", false);
                            daclStr.setVisible(true);
                        }
                    }
                }
            },
            expand: function(combo) {
                combo.syncSize();
            }
        }
    });
    if (showDACL) {
        uswItems.push({
            id: 'daclUserString',
            xtype: 'label',
            hidden: true
        });
    }
    if (withRegex === true) {
        if (!Ext.isFunction(window.pasteUserRegexExample)) {
            window.pasteUserRegexExample = function (a) {
                var ex = a.innerHTML,
                    fld = Ext.getCmp('userNameCombo');
                if (!Ext.isEmpty(ex) && !!fld) {
                    fld.setValue(ex);
                }
                return false;
            };
        }
        uswItems.push({
            xtype: 'label',
            anchor: '100%',
            style: {
                fontSize: '11px'
            },
            width: '100%',
            html: String.format(htcConfig.locData.AdminFoldersPermissionsForRegex, 'regex:') + '<br />' +
                String.format(htcConfig.locData.AdminFoldersPermissionsForRegexUsers,
                    '<a href="#" onclick="pasteUserRegexExample(this)">regex:.*</a>',
                    '<a href="#" onclick="pasteUserRegexExample(this)">regex:^(jdoe|Mike)$</a>')
        });
    }
    var userSelectWindow = new Ext.Window({
        title: htcConfig.locData.CommonFieldLabelUserName,
        labelWidth: 100,
        frame: true,
        width: 300,
        minWidth: 300,
        autoHeight: true,
        border: false,
        modal: true,
        layout: 'form',
        bodyStyle: 'padding: 5px 5px 0 5px',
        buttonAlign: 'center',
        plain: true,
        items: uswItems,
        buttons:
        [
            {
                text: htcConfig.locData.CommonButtonCaptionOK,
                handler: function() {
                    var userName = userSelectWindow.findById('userNameCombo').getValue().trim();
                    if(userName == '') {
                        Ext.Msg.show({
                            title: htcConfig.locData.CommonErrorCaption,
                            msg: htcConfig.locData.AdminFoldersUserNameNotSelected,
                            icon: Ext.MessageBox.ERROR,
                            buttons: Ext.Msg.OK
                        });
                    } else {
                        userSelectWindow.close();
                        userCallback('ok', userName);
                    }
                }
            },
            {
                text: htcConfig.locData.CommonButtonCaptionCancel,
                handler: function() {
                    userSelectWindow.close();
                    userCallback('cancel', '');
                }
            }
        ]
    });
    userSelectWindow.show();
}

/*
    userCallback(btn, groupName)
    btn - button that user clicked: 'ok', cancel'
    groupName - selected group name if btn is 'ok'
*/
function promptGroupName(userCallback, withRegex) {
    var allGroupsStore = new Ext.data.DirectStore({
        directFn: HttpCommander.Admin.GetGroups,
        autoLoad: false,
        fields: ['name', 'users', 'icon', 'customField'],
        listeners: {
            load: function (store) {
                var cmb = Ext.getCmp('groupNameCombo');
                if (!!cmb) {
                    cmb.mode = 'local';
                    cmb.minChars = 0;
                    cmb.queryDelay = 10;
                }
            }
        }
    });
    var daclGroupsStore;
    var showDACL = htcConfig.winAuth;
    var fpPath = '';
    if (showDACL) {
        if (folderWindow && folderWindow.findById('folder-path')) {
            fpPath = folderWindow.findById('folder-path').getValue();
            showDACL = fpPath && fpPath != '';
        } else showDACL = false;
    }    
    var gswItems = [];
    if (showDACL) {
        daclGroupsStore = new Ext.data.DirectStore({
            directFn: HttpCommander.Admin.GetGroupsFromDACL,
            autoLoad: false,
            baseParams: { folder: fpPath },
            paramOrder: ['folder'],
            fields: [ 'name', 'acl' ]
        });
        gswItems.push({
            id: 'groups-all-or-dacl',
            xtype: 'radiogroup',
            vertical: false,
            columns: 2,
            hideLabel: true,
            anchor: '100%',
            items:
            [
                {
                    boxLabel: htcConfig.locData.AdminGroupsListAll,
                    name: 'rb-auto',
                    id: 'groups-all-radio',
                    checked: true,
                    listeners:
                    {
                        check: function (radio, checked) {
                            var combo = Ext.getCmp('groupNameCombo');
                            if (combo) combo.bindStore(checked ? allGroupsStore : daclGroupsStore, false);
                            var daclStr = Ext.getCmp('daclGroupString');
                            if (daclStr) {
                                daclStr.setVisible(false);
                                if (!checked) {
                                    var fIndex = daclGroupsStore.findBy(function(rec, id) { return rec.get("name").toLowerCase() == combo.getValue().toLowerCase(); });
                                    if (fIndex >= 0) {
                                        daclStr.setText("<span>" + htcConfig.locData.AdminDACLStringLabel + ": <b>" + daclGroupsStore.getAt(fIndex).data.acl + "</b></span>", false);
                                        daclStr.setVisible(true);
                                    }
                                }
                            }
                        } 
                    }
                },
                {
                    boxLabel: htcConfig.locData.AdminGroupsListDACL,
                    name: 'rb-auto',
                    id: 'groups-dacl-radio'
                }
            ]
        });
    }  
    gswItems.push({
        id: 'groupNameCombo',
        fieldLabel: htcConfig.locData.AdminFoldersGroupNamePrompt,
        xtype: 'combo',
        lazyInit: false,
        displayField: 'name',
        mode: 'remote', //'local',
        triggerAction: 'all',
        anchor: '100%',
        loadingText: htcConfig.locData.ProgressLoading + '...',
        emptyText: htcConfig.locData.AdminFoldersGroupNameEmptyText + '...',
        selectOnFocus: true,
        minChars: 50,
        typeAhead: true,
        editable: true,
        store: allGroupsStore,
        tpl: '<tpl for="."><div class="x-combo-list-item">{name:htmlEncode}</div></tpl>',
        listeners: {
            'select': function (combo, record, index) {
                var daclStr = Ext.getCmp('daclGroupString');
                if (daclStr) {
                    daclStr.setVisible(false);
                    daclStr.setText('');
                    var rg = Ext.getCmp('groups-dacl-radio');
                    if (rg && rg.checked) {
                        daclStr.setText("<span>" + htcConfig.locData.AdminDACLStringLabel + ": <b>" + record.data.acl + "</b></span>", false);
                        daclStr.setVisible(true);
                    }
                } 
            },
            change: function (combo, newValue, oldValue) {
                var daclStr = Ext.getCmp('daclGroupString');
                if (daclStr) {
                    var rg = Ext.getCmp('groups-dacl-radio');
                    daclStr.setVisible(false);
                    daclStr.setText('');
                    if (rg && rg.checked) {
                        var fIndex = daclGroupsStore.findBy(function(rec, id) { return rec.get("name").toLowerCase() == newValue.toLowerCase(); });
                        if (fIndex >= 0) {
                            daclStr.setText("<span>" + htcConfig.locData.AdminDACLStringLabel + ": <b>" + daclGroupsStore.getAt(fIndex).data.acl + "</b></span>", false);
                            daclStr.setVisible(true);
                        }
                    }
                }
            },
            expand: function(combo) {
                combo.syncSize();
            }
        }
    });
    if (showDACL) {
        gswItems.push({
            id: 'daclGroupString',
            xtype: 'label',
            hidden: true
        });
    }
    if (withRegex === true) {
        if (!Ext.isFunction(window.pasteGroupRegexExample)) {
            window.pasteGroupRegexExample = function (a) {
                var ex = a.innerHTML,
                    fld = Ext.getCmp('groupNameCombo');
                if (!Ext.isEmpty(ex) && !!fld) {
                    fld.setValue(ex);
                }
                return false;
            };
        }
        gswItems.push({
            xtype: 'label',
            anchor: '100%',
            style: {
                fontSize: '11px'
            },
            width: '100%',
            html: String.format(htcConfig.locData.AdminFoldersPermissionsForRegex, 'regex:') + '<br />' +
                String.format(htcConfig.locData.AdminFoldersPermissionsForRegexGroups,
                    '<a href="#" onclick="pasteGroupRegexExample(this)">regex:.*</a>',
                    '<a href="#" onclick="pasteGroupRegexExample(this)">regex:Students</a>')
        });
    }
    var groupSelectWindow = new Ext.Window({
        title: htcConfig.locData.CommonFieldLabelGroupName,
        labelWidth: 100,
        frame: true,
        width: 300,
        minWidth: 300,
        autoHeight: true,
        border: false,
        modal: true,
        layout: 'form',
        bodyStyle: 'padding: 5px 5px 0 5px',
        buttonAlign: 'center',
        plain: true,        
        items: gswItems,
        buttons:
        [
            {
                text: htcConfig.locData.CommonButtonCaptionOK,
                handler: function() {
                    var groupName = groupSelectWindow.findById('groupNameCombo').getValue().trim();
                    if(groupName == '') {
                        Ext.Msg.show({
                            title: htcConfig.locData.CommonErrorCaption,
                            msg: htcConfig.locData.AdminFoldersGroupNameNotSelected,
                            icon: Ext.MessageBox.ERROR,
                            buttons: Ext.Msg.OK
                        });
                    } else {
                        groupSelectWindow.close();
                        userCallback('ok', groupName);
                    }
                }
            },
            {
                text: htcConfig.locData.CommonButtonCaptionCancel,
                handler: function() {
                    groupSelectWindow.close();
                    userCallback('cancel', '');
                }
            }
        ]
    });
    groupSelectWindow.show();
}

/*
    userCallback(btn, shareName)
    btn - button that user clicked: 'ok', cancel'
    shareName - selected share name if btn is 'ok'
*/
function promptShareName(userCallback) {
    var shareSelectWindow = new Ext.Window({
        title: htcConfig.locData.AdminFoldersShareNameTitle,
        labelWidth: 100,
        frame: true,
        width: 300,
        minWidth: 300,
        autoHeight: true,
        border: false,
        modal: true,
        layout: 'form',
        bodyStyle: 'padding: 5px 5px 0 5px',
        buttonAlign: 'center',
        plain: true,
        items:
        [
            {
                id: 'shareNameCombo',
                fieldLabel: htcConfig.locData.AdminFoldersShareNameEmptyText,
                xtype: 'combo',
                lazyInit: false,
                anchor: '100%',
                displayField: 'path',
                mode: 'remote', //'local',
                triggerAction: 'all',
                tpl: '<tpl for="."><div ext:qtip="{encodedPath}" class="x-combo-list-item">{path:htmlEncode}</div></tpl>',
                loadingText: htcConfig.locData.ProgressLoading + '...',
                emptyText: htcConfig.locData.AdminFoldersShareNameEmptyText + '...',
                selectOnFocus: true,
                editable: false,
                store: new Ext.data.DirectStore({
                    directFn: HttpCommander.Admin.GetSharedFolders,
                    autoLoad: false,
                    stdTimeout: Ext.Ajax.timeout,
                    fields: [ 'path', 'encodedPath' ],
                    listeners: {
                        beforeload: function (ds, op) {
                            ds.stdTimeout = Ext.Ajax.timeout;
                            Ext.Ajax.timeout = ajaxRequestTimeout;
                        },
                        load: function(ds, records, op) {
                            Ext.Ajax.timeout = ds.stdTimeout;
                        },
                        exception: function(misc) {
                            if (this && this.stdTimeout)
                                Ext.Ajax.timeout = this.stdTimeout;
                            else
                                Ext.Ajax.timeout = 30000;
                        }
                    }
                }),
                listeners: {
                    'select': function (combo, record, index) {
                        Ext.QuickTips.getQuickTip().register({
                            target: this.el,
                            text: record.data.encodedPath
                        });
                    },
                    expand: function(combo) {
                        combo.syncSize();
                    }
                }
            }
        ],
        listeners: {
            show: function(window) {
                var comboField = window.findById('shareNameCombo');
                if (comboField) {
                    var val = comboField.getValue();
                    if (val && val != '') {
                        Ext.QuickTips.getQuickTip().register({
                            target: comboField.el,
                            text: Ext.util.Format.htmlEncode(val)
                        });
                    } else {
                        Ext.QuickTips.getQuickTip().unregister(comboField.el);
                    }
                }
            }
        },
        buttons:
        [
            {
                text: htcConfig.locData.CommonButtonCaptionOK,
                disabled: showListForAllowedFolders, // ???
                handler: function() {
                    var shareName = shareSelectWindow.findById('shareNameCombo').getValue().trim();
                    if(shareName == '') {
                        Ext.Msg.show({
                            title: htcConfig.locData.CommonErrorCaption,
                            msg: htcConfig.locData.AdminFoldersShareNameNotSelected,
                            icon: Ext.MessageBox.ERROR,
                            buttons: Ext.Msg.OK
                        });
                    } else {
                        shareSelectWindow.close();
                        userCallback('ok', shareName);
                    }
                }
            },
            {
                text: htcConfig.locData.CommonButtonCaptionCancel,
                handler: function() {
                    shareSelectWindow.close();
                    userCallback('cancel', '');
                }
            }
        ]
    });
    shareSelectWindow.show();
}

/** RENDERERS section */

function passwordRenderer(val) {
    var v = val ? String(val) : '';
    return v.length > 0 ? new Array(v.length).join('&#9679;') : '';
}

function htmlEncodeRenderer(val) {
    return val ? Ext.util.Format.htmlEncode(val) : '';
}

function identitiesRenderer(value, p, r) {
    result = "";
    Ext.each(value, function (el) {
        if (result) result += ", ";
        result += Ext.util.Format.htmlEncode(el.identityName);
    });
    return result;
}

function dateRendererLocal(val, cell, rec, row, col, store) {
    if(val==null)
        return null;
    var fval;
    try {
        if (store.reader.jsonData.isUSA) fval = (val.getMonth() + 1) + "/" + val.getDate() + "/";
        else fval = val.getDate() + "/" + (val.getMonth() + 1) + "/";
        fval += val.getFullYear() + " " + val.toLocaleTimeString();
    } catch (e) { 
        fval = val.toLocaleString();
    }    
    return fval;
}

function booleanRenderer(val, cell, rec, row, col, store) {
    cell.css += ' x-grid3-check-col-td';
    return String.format('<div class="x-grid3-check-col{0}">&#160;</div>', val ? '-on' : '');
}

// Word-wrap renderer for grid cell.
function wordWrapRenderer(val, cell, rec) {
	if (!val) val = '';
	return String.format("<span style='white-space: normal;'>{0}</span>", Ext.util.Format.htmlEncode(val));
}

// Grid cell renderer with quick tip.
function qtipCellRenderer(val, cell, rec) {
	cell.attr = '';
	if (val && val != '')
		cell.attr = 'ext:qtip="' + Ext.util.Format.htmlEncode(val) + '" ext:qchilds="true"';
	return val;
}

/** end RENDERERS section */

function detectNewVersion() {
    var newVersion = null;
    if (htcConfig.hccurrentversion &&
        Ext.isArray(htcConfig.hccurrentversion) &&
        htcConfig.hccurrentversion.length > 0 &&
        window.hclatestversion &&
        Ext.isArray(window.hclatestversion) &&
        window.hclatestversion.length > 0) {
        var len = window.hclatestversion.length;
        if (htcConfig.hccurrentversion.length < len) {
            len = htcConfig.hccurrentversion.length;
        }
        for (var i = 0; i < len; i++) {
            if (window.hclatestversion[i] > htcConfig.hccurrentversion[i]) {
                newVersion = window.hclatestversion.join('.');
                break;
            } else if (window.hclatestversion[i] < htcConfig.hccurrentversion[i]) {
                break;
            }
        }
    }
    return newVersion;
}

/** HELPS and HINTS section */

function navigateHelpAdminPanel() {
    showHelpWindow("Manual/adminpanel.html");
}

function navigateHelpAdminPanelWithFragment(fragment) {
    showHelpWindow("Manual/adminpanel.html#"+fragment);
}

function generateIFrameHelp(relURL) {
    return '<iframe style="background-color: #FFFFFF;" scrolling="yes" width="100%" height="100%" border="0" src="'
        + htcConfig.relativePath
        + relURL
        + '"></iframe>'
}

// Show user help window.
function showHelpWindow(relURL) {
    if (navigator.userAgent.toLowerCase().indexOf("ipad") != -1)
        window.open(htcConfig.relativePath + relURL);
    else {
        var helpWindow = userHelpWindow;
        if (helpWindow != undefined && helpWindow != null) {
            helpWindow.hide();
            relURL = relURL || "Manual/adminpanel.html";
            var help_html = generateIFrameHelp(relURL);
            helpWindow.html = help_html;
            helpWindow.show();
            helpWindow.update(help_html);
        }
    }
}

function genHintWithQuestionIcon(hint) {
    if (hint && hint != '')
        return '&nbsp;<img class="filetypeimage" ext:qtip="' + Ext.util.Format.htmlEncode(hint) + '" alt="" align="absmiddle" src="' + HttpCommander.Lib.Utils.getIconPath(this, 'question')+'"/>';
    return '';
}

function genQuestionIconWithUrl(hint, relUrl) {
    if (!Ext.isEmpty(hint) && !Ext.isEmpty(relUrl))
        return '<img class="filetypeimage" onclick="showHelpWindow(' + "'" + Ext.util.Format.htmlEncode(relUrl) + "'" + '); return false;" style="cursor:pointer;" ext:qtip="' + Ext.util.Format.htmlEncode(hint) + '" alt="" align="absmiddle" src="' + HttpCommander.Lib.Utils.getIconPath(this, 'question') + '"/>';
    return '';
}

function getPermissionHintMsg() {
    return '<table>'
        // create
        + '<tr><td><b>' + htcConfig.locData.AdminFoldersCreate + '</b></td>'
        + '<td>' + htcConfig.locData.AdminFoldersCreateHint + '</td></tr>'
        // delete
        + '<tr><td><b>' + htcConfig.locData.AdminFoldersDelete + '</b></td>'
        + '<td>' + htcConfig.locData.AdminFoldersDeleteHint + '</td></tr>'
        // rename
        + '<tr><td><b>' + htcConfig.locData.AdminFoldersRename + '</b></td>'
        + '<td>' + htcConfig.locData.AdminFoldersRenameHint + '</td></tr>'
        // upload
        + '<tr><td><b>' + htcConfig.locData.AdminFoldersUpload + '</b></td>'
        + '<td>' + htcConfig.locData.AdminFoldersUploadHint + '</td></tr>'
        // download
        + '<tr><td><b>' + htcConfig.locData.AdminFoldersDownload + '</b></td>'
        + '<td>' + htcConfig.locData.AdminFoldersDownloadHint + '</td></tr>'
        // zip download
        + '<tr><td><b>' + htcConfig.locData.AdminFoldersZipDownload + '</b></td>'
        + '<td>' + htcConfig.locData.AdminFoldersZipDownloadHint + '</td></tr>'
        // zip
        + '<tr><td><b>' + htcConfig.locData.AdminFoldersZip + '</b></td>'
        + '<td>' + htcConfig.locData.AdminFoldersZipHint + '</td></tr>'
        // unzip
        + '<tr><td><b>' + htcConfig.locData.AdminFoldersUnzip + '</b></td>'
        + '<td>' + htcConfig.locData.AdminFoldersUnzipHint + '</td></tr>'
        // cut
        + '<tr><td><b>' + htcConfig.locData.AdminFoldersCut + '</b></td>'
        + '<td>' + htcConfig.locData.AdminFoldersCutHint + '</td></tr>'
        // copy
        + '<tr><td><b>' + htcConfig.locData.AdminFoldersCopy + '</b></td>'
        + '<td>' + htcConfig.locData.AdminFoldersCopyHint + '</td></tr>'
        // list files
        + '<tr><td><b>' + htcConfig.locData.AdminFoldersListFiles + '</b></td>'
        + '<td>' + htcConfig.locData.AdminFoldersListFilesHint + '</td></tr>'
        // list folders
        + '<tr><td><b>' + htcConfig.locData.AdminFoldersListFolders + '</b></td>'
        + '<td>' + htcConfig.locData.AdminFoldersListFoldersHint + '</td></tr>'
        // modify
        + '<tr><td><b>' + htcConfig.locData.AdminFoldersModify + '</b></td>'
        + '<td>' + htcConfig.locData.AdminFoldersModifyHint + '</td></tr>'
        // bulk mailing
        + '<tr><td><b>' + htcConfig.locData.AdminFoldersBulkMailing + '</b></td>'
        + '<td>' + htcConfig.locData.AdminFoldersBulkMailingHint + '</td></tr>'
        // anonymous view content
        + '<tr><td><b>' + htcConfig.locData.AdminFoldersAnonymViewContent + '</b></td>'
        + '<td>' + htcConfig.locData.AdminFoldersAnonymViewContentHint + '</td></tr>'
        // anonymous download
        + '<tr><td><b>' + htcConfig.locData.AdminFoldersAnonymDownload + '</b></td>'
        + '<td>' + htcConfig.locData.AdminFoldersAnonymDownloadHint + '</td></tr>'
        // anonymous upload
        + '<tr><td><b>' + htcConfig.locData.AdminFoldersAnonymUpload + '</b></td>'
        + '<td>' + htcConfig.locData.AdminFoldersAnonymUploadHint + '</td></tr>'
        // watchForModifs
        + '<tr><td><b>' + htcConfig.locData.AdminFoldersWatch + '</b></td>'
        + '<td>' + htcConfig.locData.AdminFoldersWatchHint + '</td></tr>'
        + '</table>'
}

/** end HELPS and HINTS section */
