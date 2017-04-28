Ext.ns('HttpCommander.Lib');

/*
    config:
        htcConfig, showSettingsMask(), hideSettingsMask(),
        emailNotifs
*/
HttpCommander.Lib.AdminEmailNotifications = function(config) {
    var enStore, enPanel;

    function EmailNotifsAddGroupHander() {
        var record = new enStore.recordType({
            events: "upload,modify,download",
            when: "OnSessionEnd",
            emails: "",
            users: "",
            groups: "",
            paths: []
        });
        var index = enStore.getCount();
        enStore.add([record]);
        EmailNotifsInsertGroup(index, record, enPanel);
        enPanel.doLayout();
    }
    function EmailNotifsApplyHandler() {
        EmailNotifsSaveGroups();
        var cnt = enStore.getCount();
        var data = new Array(cnt);
        for (var i=0; i<cnt; ++i)
            data[i] = enStore.getAt(i).data;
        config.showSettingsMask();
        HttpCommander.Admin.UpdateEmailNotifsSettings({ groups: data }, function (data, trans) {
            config.hideSettingsMask();
            if (typeof data == 'undefined' || !data) {
                Ext.Msg.alert(config.htcConfig.locData.CommonErrorCaption, Ext.util.Format.htmlEncode(trans.message));
                return;
            }
            if (data.status != "success") {
                Ext.Msg.alert(config.htcConfig.locData.CommonErrorCaption, data.message);
                if (data.igroup != null && data.ipath != null)
                    EmailNotifsMarkInvalidPath(data.igroup, data.ipath, data.message);
                return;
            }
            enStore.reload();
        });
    }
    function EmailNotifsResetHandler() {
        enStore.reload();
    }
    function EmailNotifsCreateGUI() {
        enPanel.removeAll();
        for (var i = 0; i < enStore.getCount(); ++i) {
            EmailNotifsAddGroup(enStore.getAt(i), enPanel);
        }
        //EmailNotifsAddBottomBtns(enPanel);
        enPanel.doLayout();
    }
    function EmailNotifsAddBottomBtns(container) {
        container.add({
            xtype: 'panel',
            layout: {
                type: 'hbox',
                padding: '5',
                pack: 'end'
            },
            border: false,
            defaults: {
                margins: '0 5 0 0'
            },
            items: [{
                xtype: 'button',
                text: config.htcConfig.locData.AdminCommandAddGroup,
                width: 75,
                handler: EmailNotifsAddGroupHander
            }, {
                xtype: 'button',
                text: config.htcConfig.locData.SettingsEmailNotifApplyBtn,
                width: 75,
                handler: EmailNotifsApplyHandler
            },{
                xtype: 'button',
                text: config.htcConfig.locData.SettingsEmailNotifResetBtn,
                width: 75,
                handler: EmailNotifsResetHandler
            }]
        });
    }
    function EmailNotifsInsertGroup(index, record, container) {
        var eventItems = [],
            len = enStore.eventValues.length;
        for (var i = 0; i < len; ++i) {
            var val = enStore.eventValues[i];
            eventItems.push({
                boxLabel: val,
                name: val,
                checked: i == 0
            });
        }
        var group = new Ext.form.FormPanel({
            defaultType: 'textfield',
            labelWidth: 100,
            collapsible: true,
            title: config.htcConfig.locData.CommonFieldLabelGroup,
            padding: 5,
            frame: true,
            items: [{
                fieldLabel: config.htcConfig.locData.SettingsEmailNotifEventsLabel,
                name: 'events',
                width: 600,
                xtype: 'checkboxgroup',
                itemCls: 'x-check-group-alt',
                items: eventItems
            },{
                fieldLabel: config.htcConfig.locData.SettingsEmailNotifWhenLabel,
                name: 'when',
                width: 150,
                xtype: 'combo',
                lazyInit: false,
                editable: false,
                forceSelection: true,
                triggerAction: 'all',
                mode: 'local',
                store: enStore.whenValues,
                value: enStore.whenValues[0]
            },{
                fieldLabel: config.htcConfig.locData.SettingsEmailNotifEmailsLabel,
                name: 'emails',
                anchor:'100%'  // anchor width by percentage
            },{
                fieldLabel: config.htcConfig.locData.CommonFieldLabelUsers,
                name: 'users',
                anchor: '100%'  // anchor width by percentage
            },{
                fieldLabel: config.htcConfig.locData.CommonFieldLabelGroups,
                name: 'groups',
                anchor: '100%'  // anchor width by percentage
            }, {
                xtype:'fieldset',
                title: config.htcConfig.locData.SettingsEmailNotifPathsLabel,
                name: 'paths',
                padding: 0,
                collapsible: true,
                items: [ ]
            }],
            tools: [{
                id: 'close',
                handler: EmailNotifsCloseGroupHander
            }]
        });
        var paths = group.items.find(function(a) {return a.name == 'paths'; });
        for (var j = 0; j < record.data.paths.length; ++j)
            EmailNotifsAddPath(record.data.paths[j], paths);
        EmailNotifsAddPathsBottomBtns(paths);
        container.insert(index, group);
    }
    function EmailNotifsAddGroup(record, container) {
        var index = container.items.getCount();
        EmailNotifsInsertGroup(index, record, container);
    }
    function EmailNotifsAddPathsBottomBtns(container) {
        container.add({
            xtype: 'panel',
            layout: {
                type: 'hbox',
                padding: '5 0 0 0',
                pack: 'end'
            },
            border: false,
            items: [{
                xtype: 'button',
                text: config.htcConfig.locData.CommonButtonCaptionAdd,
                width: 75,
                handler: EmailNotifsAddPathHandler
            }]
        });
    }
    function EmailNotifsInsertPath(index, pathRecord, container) {
         container.insert(index, {
            layout: {
                type:'hbox',
                padding: '5 0 0 0'
            },
            labelWidth: 50,
            defaults: {
                margins: '0 2 0 2'
            },
            items: [{
                xtype: 'textfield',
                name: 'path',
                anchor: '100%',
                flex: 1,
                listeners: {
                    focus: function(field) {
                        if (isWebKit && field && typeof field.getValue == 'function') {
                            var val = field.getValue();
                            if (!val || (String(val)).trim().length == 0) {
                                field.setValue("_");
                                field.setValue(val);
                            }
                        }
                    }
                }
            },{
                name: 'type',
                xtype: 'combo',
                width: 75,
                editable: false,
                lazyInit: false,
                forceSelection: true,
                triggerAction: 'all',
                mode: 'local',
                store: [ 'Plain', 'Regex' ]
            },{
                xtype: 'button',
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'delete'),
                handler: EmailNotifsDeletePathHandler
            }]
        });
    }
    function EmailNotifsAddPath(pathRecord, container) {
        /* While getCount() - 1? The last child item of the container is a button panel. */
        var index = container.items.getCount()-1;
        EmailNotifsInsertPath(index, pathRecord, container);
    }
    /* copy data from store to path GUI element */
    function EmailNotifsLoadPath(pathRecord, pathGroupEl) {
        var pathEl = pathGroupEl.items.find(function(a) { return a.name == 'path'; });
        pathEl.setValue(pathRecord.path);
        var typeEl = pathGroupEl.items.find(function(a) { return a.name == 'type'; });
        typeEl.setValue(pathRecord.type);
    }
    /* copy data from path GUI element to store */
    function EmailNotifsSavePath(pathRecord, pathGroupEl) {
        var pathEl = pathGroupEl.items.find(function(a) { return a.name == 'path'; });
        pathRecord.path = pathEl.getValue();
        var typeEl = pathGroupEl.items.find(function(a) { return a.name == 'type'; });
        pathRecord.type = typeEl.getValue();
    }
    /* copy date from store to group GUI element */
    function EmailNotifsLoadGroup(record, groupEl) {
        var eventsEl = groupEl.items.find(function(a) { return a.name == 'events'; });
        EmailNotifsLoadEvents(record.data.events, eventsEl);
        var whenEl = groupEl.items.find(function(a) { return a.name == 'when'; });
        whenEl.setValue(record.data.when);
        var emailsEl = groupEl.items.find(function(a) { return a.name == 'emails'; });
        emailsEl.setValue(record.data.emails);
        var usersEl = groupEl.items.find(function(a) { return a.name == 'users'; });
        usersEl.setValue(record.data.users);
        var ugroupsEl = groupEl.items.find(function(a) { return a.name == 'groups'; });
        ugroupsEl.setValue(record.data.groups);
        
        var self = this,
            pathsEl = groupEl.items.find(function(a) {return a.name == 'paths'; });
        for (var j=0; j < record.data.paths.length; ++j)
            EmailNotifsLoadPath(record.data.paths[j], pathsEl.items.itemAt(j));
    }
    function EmailNotifsLoadEvents(events, groupEl) {
        var len = enStore.eventValues.length;
        for (var i = 0; i < len; ++i) {
            var nameVal = enStore.eventValues[i],
                el = groupEl.items.find(function(a) { return a.name == nameVal; });
            if (el) el.setValue((events & (1 << i)) > 0);
        }
    }
    /* copy data from group GUI element to store */
    function EmailNotifsSaveGroup(record, groupEl) {
        var eventsEl = groupEl.items.find(function(a) { return a.name == 'events'; });
        EmailNotifsSaveEvents(record, eventsEl);
        var whenEl = groupEl.items.find(function(a) { return a.name == 'when'; });
        record.data.when = whenEl.getValue();
        var emailsEl = groupEl.items.find(function(a) { return a.name == 'emails'; });
        record.data.emails = emailsEl.getValue();
        var usersEl = groupEl.items.find(function(a) { return a.name == 'users'; });
        record.data.users = usersEl.getValue();
        var ugroupsEl = groupEl.items.find(function(a) { return a.name == 'groups'; });
        record.data.groups = ugroupsEl.getValue();
        
        var self = this,
            pathsEl = groupEl.items.find(function(a) {return a.name == 'paths'; });
        for(var j=0; j<record.data.paths.length; ++j)
            EmailNotifsSavePath(record.data.paths[j], pathsEl.items.itemAt(j));
    }
    function EmailNotifsSaveEvents(record, groupEl) {
        var len = enStore.eventValues.length,
            res = 0;
        for (var i = 0; i < len; ++i) {
            var nameVal = enStore.eventValues[i],
                el = groupEl.items.find(function(a) { return a.name == nameVal; });
            if (el && el.getValue())
                res |= (1 << i);
        }
        if (res < 1)
            res = 1;
        record.data.events = res;
    }
    /* copy data from store to groups GUI elements */
    function EmailNotifsLoadGroups() {
        for(var i=0; i<enStore.getCount(); ++i) {
            EmailNotifsLoadGroup(enStore.getAt(i), enPanel.items.itemAt(i));
        }
    }
    /* copy data from groups GUI elements to store */
    function EmailNotifsSaveGroups() {
        for(var i=0; i<enStore.getCount(); ++i) {
            EmailNotifsSaveGroup(enStore.getAt(i), enPanel.items.itemAt(i));
        }
    }
    function EmailNotifsMarkInvalidPath(igroup, ipath, message) {
        if (igroup < 0 || igroup >= enStore.getCount())
            return;
        var groupEl = enPanel.items.itemAt(igroup);
        var pathsEl = groupEl.items.find(function(a) {return a.name == 'paths'; });
        if (ipath < 0 || ipath >= pathsEl.items.getCount()-1)
            return;
        var pathGroupEl = pathsEl.items.itemAt(ipath);
        if (message == null)
            return;
        var pathEl = pathGroupEl.items.find(function(a) { return a.name == 'path'; });
        pathEl.markInvalid(message);
    }
    function EmailNotifsCloseGroupHander(event, toolEl, panel, tc) {
        var ind = enPanel.items.findIndexBy(function (o, k) { return o == panel; });
        enPanel.remove(panel);
        enStore.removeAt(ind);
    }
    function EmailNotifsDeletePathHandler(button) {
        var pathEl = button.ownerCt,
            fieldSetEl = pathEl.ownerCt,
            groupEl = fieldSetEl.ownerCt,
            groupInd = enPanel.items.findIndexBy(function (o, k) { return o == groupEl; }),
            pathInd = fieldSetEl.items.findIndexBy(function (o, k) { return o == pathEl; });
        fieldSetEl.remove(pathEl);
        enStore.getAt(groupInd).data.paths.splice(pathInd, 1);
    }
    function EmailNotifsAddPathHandler(button) {
        var pathGroupEl = button.ownerCt.ownerCt,
            groupEl = pathGroupEl.ownerCt,
            groupInd = enPanel.items.findIndexBy(function (o, k) { return o == groupEl; }),
            record = enStore.getAt(groupInd),
            pathInd = record.data.paths.length;
        record.data.paths.push({
            path: "",
            type: "Plain"
        });
        var pathRecord = record.data.paths[pathInd];
        EmailNotifsInsertPath(pathInd, pathRecord, pathGroupEl);
        EmailNotifsLoadPath(pathRecord, pathGroupEl.items.itemAt(pathInd));
        pathGroupEl.doLayout();
    }
    
    enStore = new Ext.data.DirectStore({
        directFn: HttpCommander.Admin.GetEmailNotifsSettings,
        fields:
        [
            { name: 'events' }, 
            { name: 'when' },
            { name: 'emails', type: 'string' },
            { name: 'users', type: 'string' },
            { name: 'groups', type: 'string' },
            { name: 'paths' }
        ],
        root: 'data',
        eventValues: ['Upload', 'Modify', 'Download'],
        whenValues: ['OnSessionEnd', 'Immediate'],
        listeners: {
            beforeload: function(store, options) {
                config.showSettingsMask();
            },
            load: function(store, records, options) {
                config.hideSettingsMask();
                enStore.eventValues = store.reader.jsonData.eventValues;
                enStore.whenValues = store.reader.jsonData.whenValues;
                EmailNotifsCreateGUI();
                EmailNotifsLoadGroups();
            },
            exception: function(misc) {
                config.hideSettingsMask();
            }
        }
    });
    
    enPanel = new Ext.Panel({
        title: config.htcConfig.locData.SettingsEmailNotifTitle
            + ' <a href="javascript:showHelpWindow(\'Manual/webconfigsetup.html#EmailNotification\');" target="_self" id="moreInfo">'
            + Ext.util.Format.htmlEncode(config.htcConfig.locData.SettingsGridMoreInfo) + '</a>',
        border: false,
        padding: '10',
        style: {
            paddingTop: '20px'
        },
        id: 'emailNotifs',
        collapsible: true,
        items: [ ],
        tbar: { enableOverflow: true, items: [
            {
                text: config.htcConfig.locData.AdminCommandAddGroup,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'addemailgroup'),
                handler: EmailNotifsAddGroupHander
            },
            {
                text: config.htcConfig.locData.SettingsEmailNotifApplyBtn,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'savetofile'),
                handler: EmailNotifsApplyHandler
            },
            {
                text: config.htcConfig.locData.SettingsEmailNotifResetBtn,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'remove'),
                handler: EmailNotifsResetHandler
            }
        ]},
        LoadData: function() {
            enStore.load();
        }
    });
    
    return enPanel;
};