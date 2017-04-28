Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, globalLoadMask,
getIsEmbeddedtoIFRAME(), getEmbedded(), $,
getShowMetaDataInList(),
getCurrentFolder(), openGridFolder(), getRenderers(), isModifyAllowed(),
setSelectPath(), getHideDetailsPaneValue(), detailsPane()
*/
HttpCommander.Lib.MetadataWindow = function (config) {
    var helper = HttpCommander.Lib.MetadataWindowParts({
        'htcConfig': config.htcConfig,
        'getRenderers': config.getRenderers
    });

    var configPrivate = {
        availabelMDTitlesWoComments: [],
        availableMDTitles: [],
        existsMultiValueMDTitle: false,
        isCustomMultiValue: false,
        commentsAllowed: false,
        commentsIsMultiValue: false
    };

    /* assign: existsMultiValueMDTitle, isCustomMultiValue, availableMDTitles */
    Ext.each(config.htcConfig.fileListColumns, function (col) {
        if (col.state & 8) {
            var mdc = { id: col.name, name: col.header };
            if (col.state & 32) {
                configPrivate.existsMultiValueMDTitle = mdc.name.toLowerCase() != 'comment';// true;
                mdc['multi'] = true;
                if (col.state & 16) {
                    configPrivate.isCustomMultiValue = true;
                }
            } else {
                mdc['multi'] = false;
            }
            configPrivate.availableMDTitles.push(mdc);
            if (mdc.name.toLowerCase() != 'comment') {
                configPrivate.availabelMDTitlesWoComments.push(Ext.apply({}, mdc));
            }
        }
    });

    if (!configPrivate.isCustomMultiValue) {
        configPrivate.isCustomMultiValue = config.htcConfig.isCustomMultiValue;
    }

    if (Ext.isNumber(config.htcConfig.isAllowedComments)) {
        configPrivate.commentsAllowed = (config.htcConfig.isAllowedComments > 0);
        configPrivate.commentsIsMultiValue = (config.htcConfig.isAllowedComments > 1);
    }

    var fileNameMetaData, metadataPanel;
    var self = new config.Window({
        title: '',
        autoDestroy: true,
        minWidth: config.getIsEmbeddedtoIFRAME() ? 350 : 550,
        minHeight: config.getIsEmbeddedtoIFRAME() ? 250 : 360,
        boxMinHeight: 250,
        boxMinWidth: config.getIsEmbeddedtoIFRAME() ? 350 : 500,
        layout: {
            type: 'vbox',
            align: 'stretch',
            padding: '-1px'
        },
        plain: true,
        resizable: true,
        closeAction: 'hide',
        maximizable: !config.getEmbedded(), //true,
        modificationHistory: {},
        width: config.getIsEmbeddedtoIFRAME() ? 450 : 650,
        height: config.getIsEmbeddedtoIFRAME() ? 250 : 400,
        items: [
            fileNameMetaData = new Ext.form.Hidden({ hidden: true }), {
            itemId: 'file-details-info',
            xtype: 'panel',
            autoHeight: true,
            baseCls: 'x-plain',
            tpl: new Ext.Template(
                '<table style="width:100%;"><tr><td style="width:50%;"><table>' +
                '<tr><td>' + config.htcConfig.locData.CommonFieldLabelType + ':</td><td>{type:htmlEncode}</td></tr>' +
                '<tr><td>' + config.htcConfig.locData.CommonFieldLabelSize + ':</td><td>{size}</td></tr>' +
                '{contains}' +
                '<tr><td>' + config.htcConfig.locData.FileAttributesField + ':</td><td>{attributes}</td></tr>' +
                '{downloadings}' +
                '</table></td><td style="width:50%;"><table>' +
                '<tr><td>' + config.htcConfig.locData.CommonFieldLabelDateCreated + ':</td><td>{created:htmlEncode}</td></tr>' +
                '<tr><td>' + config.htcConfig.locData.CommonFieldLabelDateModified + ':</td><td>{modified:htmlEncode}</td></tr>' +
                '<tr><td>' + config.htcConfig.locData.CommonFieldLabelDateAccessed + ':</td><td>{accessed:htmlEncode}</td></tr>' +
                '{modifications}' + // '{empty}' +
                '</table></td></tr></table>'
            )
        }, metadataPanel = new Ext.grid.EditorGridPanel({
            clicksToEdit: 1,
            forceValidation: true,
            header: false,
            enableColumnMove: false,
            loadMask: false,
            selModel: new Ext.grid.RowSelectionModel({
                singleSelect: true,
                moveEditorOnEnter: true,
                listeners: {
                    selectionchange: function (sm) {
                        var deleteButton = metadataPanel.getTopToolbar().getComponent('delete-md-button');
                        if (deleteButton) {
                            deleteButton.setDisabled(true);
                            if (sm.getCount() > 0 && config.htcConfig.currentPerms.modify
                                    && (configPrivate.availableMDTitles.length > 0 || config.htcConfig.isEditingMetadataTitles)) {
                                deleteButton.setDisabled(false);
                                var r = sm.getSelected();
                                var ttl = r.get('title').toLowerCase().trim();
                                var user = r.get('userlastmodified').toLowerCase().trim();
                                var isMulti = false;
                                var isCustom = true;
                                for (var j = 0, t; typeof (t = configPrivate.availableMDTitles[j]) != 'undefined'; j++) {
                                    if (t.name.toLowerCase().trim() == ttl) {
                                        isCustom = false;
                                        if (t.multi) {
                                            isMulti = true;
                                        }
                                        break;
                                    }
                                }
                                if (isCustom && configPrivate.isCustomMultiValue) {
                                    isMulti = true;
                                }
                                if (!config.htcConfig.isFullAdmin && isMulti && user != config.htcConfig.friendlyUserName.toLowerCase().trim()) {
                                    deleteButton.setDisabled(true);
                                }
                            }
                        }
                    }
                }
            }),
            store: new Ext.data.JsonStore({
                autoSave: false,
                storeId: 'mdStore',
                remoteSort: false,
                totalProperty: 'total',
                pruneModifiedRecords: false,
                autoLoad: true,
                autoDestroy: true,
                data: [],
                writer: new Ext.data.JsonWriter({
                    encode: true,
                    writeAllFields: true
                }),
                fields: config.htcConfig.metaDataFields,
                listeners: {
                    add: function (store, records, index) {
                        self.changeAvailableFields(store);
                        self.isChanged = true;
                    },
                    remove: function (store, record, index) {
                        self.changeAvailableFields(store);
                        self.isChanged = true;
                    }
                }
            }),
            tbar: new Ext.Toolbar({
                items: [{
                    itemId: 'add-md-button',
                    icon: HttpCommander.Lib.Utils.getIconPath(config, 'add'),
                    text: config.htcConfig.locData.CommonButtonCaptionAddDetail,
                    handler: function (b, ev) {
                        var mdStore = metadataPanel.getStore();
                        var rows = mdStore.getRange();
                        var countRows = rows.length;

                        var titlesList = self.generateCBArrayStoreTitles(rows);

                        if (titlesList.length == 0 && !config.htcConfig.isEditingMetadataTitles) {
                            self.changeAvailableFields(mdStore);
                            b.setDisabled(true);
                            return;
                        }

                        var newTitle = '', metaDataRecord, mdr;

                        // If allow multi value for titles
                        if (configPrivate.existsMultiValueMDTitle) {
                            var tli = 0;
                            do {
                                newTitle = titlesList[tli][0];
                                tli++;
                            } while (tli < titlesList.length && newTitle.toLowerCase() == 'comment');
                            //if (newTitle.toLowerCase() != 'comment')
                            {
                                metaDataRecord = mdStore.recordType;
                                mdr = new metaDataRecord({
                                    title: newTitle,
                                    value: config.htcConfig.locData.NewDetailsValue,
                                    userlastmodified: config.htcConfig.friendlyUserName,
                                    datemodified: null
                                });
                                metadataPanel.stopEditing();
                                mdStore.insert(0, mdr);
                                metadataPanel.startEditing(0, 0);
                                return;
                            }
                        }

                        // Get new title
                        newTitle = '';
                        var flag = true;
                        for (var i = 0; i < titlesList.length; i++) {
                            newTitle = titlesList[i][0];
                            flag = true;
                            if (newTitle.toLowerCase() == 'comment') {
                                newTitle = '';
                                continue;
                            }
                            for (var j = 0; j < countRows; j++) {
                                if (rows[j].get('title').toLowerCase().trim() == newTitle.toLowerCase().trim()) {
                                    flag = false;
                                    break;
                                }
                            }
                            if (flag) {
                                break;
                            }
                        }

                        if ((!flag || newTitle == '') && config.htcConfig.isEditingMetadataTitles) {
                            var numTitle = 1;
                            flag = true;
                            while (flag) {
                                flag = false;
                                newTitle = config.htcConfig.locData.NewDetailsTitle + numTitle;
                                for (var k = 0; k < mdStore.getCount() ; k++) {
                                    if (rows[k].get('title').toLowerCase().trim() == newTitle.toLowerCase().trim()) {
                                        numTitle++;
                                        flag = true;
                                        break;
                                    }
                                }
                            }
                            flag = true;
                        }

                        metadataPanel.stopEditing();

                        if (flag && newTitle.length > 0) {
                            metaDataRecord = mdStore.recordType;
                            mdr = new metaDataRecord({
                                title: newTitle,
                                value: config.htcConfig.locData.NewDetailsValue,
                                userlastmodified: config.htcConfig.friendlyUserName,
                                datemodified: null
                            });
                            mdStore.insert(0, mdr);
                            metadataPanel.startEditing(0, 0);
                        } else if (!config.htcConfig.isEditingMetadataTitles) {
                            self.changeAvailableFields(mdStore);
                            b.setDisabled(true);
                        }
                    }
                }, '-', {
                    itemId: 'delete-md-button',
                    icon: HttpCommander.Lib.Utils.getIconPath(config, 'remove'),
                    text: config.htcConfig.locData.CommandDelete,
                    disabled: true,
                    handler: function () {
                        metadataPanel.stopEditing();
                        var store = metadataPanel.getStore();
                        var s = metadataPanel.getSelectionModel().getSelections();
                        var cu = config.htcConfig.friendlyUserName.toLowerCase().trim();
                        for (var i = 0, r; typeof (r = s[i]) != 'undefined'; i++) {
                            var isCustom = true;
                            var ttl = r.get('title').toLowerCase().trim();
                            var user = r.get('userlastmodified').toLowerCase().trim();
                            for (var j = 0, t; typeof (t = configPrivate.availableMDTitles[j]) != 'undefined'; j++) {
                                if (ttl == t.name.toLowerCase().trim()) {
                                    isCustom = false;
                                    if (config.htcConfig.isFullAdmin || !t.multi || user == cu) {
                                        store.remove(r);
                                    }
                                    break;
                                }
                            }
                            if (isCustom && (config.htcConfig.isFullAdmin || !configPrivate.isCustomMultiValue || user == cu)) {
                                store.remove(r);
                            }
                        }
                        self.changeAvailableFields(store);
                    }
                }]
            }),
            multiSelect: false,
            colModel: helper.colModelMetaDataGrid,
            autoExpandColumn: 'value-md',
            flex: 1,
            stripeRows: true,
            listeners: {
                render: function (grd) {
                    if (grd) {
                        self.changeAvailableFields(grd.getStore());
                    }
                },
                cellclick: function (grid, row, col, e) {
                    var rec = grid.getStore().getAt(row);
                    var cm = grid.getColumnModel();
                    var fieldName = cm.getDataIndex(col);
                    var cl = cm.getColumnAt(col);
                    if (cl.editable && (cl.xtype === 'checkcolumn' || cl.xtype === 'booleancolumn')) {
                        if (typeof(rec.get(fieldName)) != 'undefined') {
                            rec.set(fieldName, !rec.get(fieldName));
                        } else {
                            eval("rec.data." + fieldName + " = true;");
                            rec.commit();
                        }
                        self.isChanged = true;
                    }
                },
                beforeedit: function (e) {
                    var ttl = e.record.get('title').toLowerCase().trim();
                    var cu = config.htcConfig.friendlyUserName.toLowerCase().trim();
                    var user = e.record.get('userlastmodified').toLowerCase().trim();
                    var isCustom = true;
                    for (var j = 0, t; typeof (t = configPrivate.availableMDTitles[j]) != 'undefined'; j++) {
                        if (ttl == t.name.toLowerCase().trim()) {
                            isCustom = false;
                            if (!config.htcConfig.isFullAdmin && t.multi && user != cu) {
                                e.cancel = true;
                                e.grid.stopEditing(true);
                                return false;
                            }
                            break;
                        }
                    }
                    if (isCustom && configPrivate.isCustomMultiValue && user != cu) {
                        e.cancel = true;
                        e.grid.stopEditing(true);
                        return false;
                    }
                    if (e.field == 'title') {
                        var titles = self.generateCBArrayStoreTitles(e.grid.getStore().getRange());
                        helper.cbAvailableTitlesEditor.getStore().loadData(titles);
                        helper.cbAvailableTitlesEditor.getStore().commitChanges();
                        if (titles.length == 0 && !config.htcConfig.isEditingMetadataTitles) {
                            e.cancel = true;
                            e.grid.stopEditing(true);
                            return false;
                        }
                    }
                },
                afteredit: function (e) {
                    if (e.field == 'title') {
                        var val = e.value.toLowerCase().trim();
                        var isMulti = false;
                        var isCustom = true;
                        var storeMD = e.grid.getStore();
                        var rows = storeMD.getRange();
                        var i, t;
                        for (i = 0; typeof (t = configPrivate.availableMDTitles[i]) != 'undefined'; i++) {
                            if (val == t.name.toLowerCase().trim()) {
                                isCustom = false;
                                if (t.multi)
                                    isMulti = true;
                                break;
                            }
                        }

                        if (isCustom && configPrivate.isCustomMultiValue) {
                            isMulti = true;
                        }

                        if (!isMulti) {
                            for (i = 0; i < storeMD.getCount() ; i++) {
                                if (i != e.row && rows[i].get('title').toLowerCase().trim() == val) {
                                    e.record.set('title', e.originalValue);
                                    e.grid.stopEditing(true);
                                    return;
                                }
                            }
                        }

                        e.record.set('userlastmodified', config.htcConfig.friendlyUserName);
                        e.record.set('datemodified', null);
                        self.isChanged = true;
                    } else if (e.value.toString().toLowerCase().trim() != e.originalValue.toString().toLowerCase().trim()) {
                        e.record.set('userlastmodified', config.htcConfig.friendlyUserName);
                        e.record.set('datemodified', null);
                        self.isChanged = true;
                    }

                    self.changeAvailableFields(storeMD);
                }
            }
        })],
        buttonAlign: 'left',
        buttons: [{
            xtype: 'textarea',
            minWidth: config.getIsEmbeddedtoIFRAME() ? 100 : 250,
            visible: configPrivate.commentsAllowed,
            width: config.getIsEmbeddedtoIFRAME() ? 100 : 250,
            height: 60,
            style: {
                whiteSpace: 'normal'
            },
            enableKeyEvents: true,
            emptyText: String.format(config.htcConfig.locData.CommentsWriteCommentHint, config.htcConfig.locData.CommonButtonCaptionAddComment),
            listeners: {
                change: function (fld, newVal, oldVal) {
                    self.buttons[1].setDisabled(Ext.isEmpty(newVal));
                },
                keypress: function (fld, evt) {
                    self.buttons[1].setDisabled(Ext.isEmpty(self.buttons[0].getValue()));
                },
                specialkey: function (fld, e) {
                    if (e.getKey() == e.ENTER) {
                        var btn = self.buttons[1];
                        btn.handler.call(btn, btn, e);
                    }
                }
            }
        }, {
            text: config.htcConfig.locData.CommonButtonCaptionAddComment,
            disabled: true,
            visible: configPrivate.commentsAllowed,
            handler: function (btn, evt) {
                var cmt = self.buttons[0].getValue();
                if (Ext.isEmpty(cmt)) {
                    btn.setDisabled(true);
                    return;
                }

                var mdStore = metadataPanel.getStore();
                var rows = mdStore.getRange();
                var countRows = rows.length;

                var titlesList = self.generateCBArrayStoreTitles(rows);

                if (titlesList.length == 0 && !config.htcConfig.isEditingMetadataTitles) {
                    self.changeAvailableFields(mdStore);
                    btn.setDisabled(true);
                    return;
                }

                var metaDataRecord, mdr;

                metadataPanel.stopEditing();

                metaDataRecord = mdStore.recordType;
                mdr = new metaDataRecord({
                    title: 'Comment',
                    value: cmt,
                    userlastmodified: config.htcConfig.friendlyUserName,
                    datemodified: null
                });
                mdStore.insert(0, mdr);

                self.changeAvailableFields(mdStore);

                self.saveMetadata(fileNameMetaData.value);
            }
        }, '->', {
            text: config.htcConfig.locData.FileDetailsSave,
            handler: function (btn, evt) {
                self.saveMetadata(fileNameMetaData.value);
            }
        }, {
            text: config.htcConfig.locData.CommonButtonCaptionClose,
            handler: function () { self.hide(); }
        }, {
            text: config.htcConfig.locData.CommandDetailsPane,
            hidden: !config.htcConfig.enableDetailsPane || !config.getDetailsPane() || !config.getDetailsPane().collapsed,
            handler: function (btn) {
                var dp = config.getDetailsPane();
                if (!dp || !config.htcConfig.enableDetailsPane) {
                    btn.hide();
                    return;
                }
                if (dp.collapsed) {
                    dp.expand();
                }
                btn.hide();
            }
        }],
        listeners: {
            afterrender: function (selfWin) {
                selfWin.bindLinkHandlers();
            },
            beforehide: function (win) {
                if (win.ignoreChanges) {
                    win.ignoreChanges = false;
                    return true;
                }
                if (win.isChanged) {
                    config.Msg.show({
                        title: config.htcConfig.locData.FileDetailsCloseConfirmTitle,
                        msg: config.htcConfig.locData.FileDetailsCloseConfirmMsg,
                        icon: config.Msg.QUESTION,
                        buttons: {
                            yes: config.htcConfig.locData.FileDetailsSave,
                            no: config.htcConfig.locData.FileDetailsIgnoreChanges,
                            cancel: config.htcConfig.locData.CommonButtonCaptionCancel
                        },
                        fn: function (btn) {
                            if (btn == 'yes') {
                                if (win.ignoreChanges) {
                                    win.ignoreChange = false;
                                }
                                self.saveMetadata(fileNameMetaData.value, win);
                                return true;
                            } else if (btn == 'no') {
                                win.ignoreChanges = true;
                                win.hide();
                                return true;
                            } else {
                                if (win.ignoreChanges) {
                                    win.ignoreChange = false;
                                }
                                return false;
                            }
                        }
                    });
                    return false;
                }
                return true;
            },
            hide: function (win) {
                var self = win;
                self.modificationHistory = {};
                fileNameMetaData.setValue('');
                metadataPanel.stopEditing();
                metadataPanel.getStore().loadData([]);
                metadataPanel.getStore().commitChanges();
                self.buttons[0].setValue('');
                self.buttons[1].setDisabled(true);
                self.isChanged = false;
            }
        },

        onDetailsPaneToggled: function (visible) {
            if (!!self && self.isVisible()) {
                self.buttons[5].setVisible(visible);
            }
        },
        onSelectingChanged: function (sel, curFolder) {
            if (typeof sel == 'undefined') {
                return;
            }
            if (!!self && self.isVisible()) {
                var needHide = true;
                var curResInfo = !!fileNameMetaData ? fileNameMetaData.value : null;
                if (Ext.isObject(curResInfo) && Ext.isObject(sel) && Ext.isObject(sel.data) &&
                    curResInfo.path == curFolder && curResInfo.name == sel.data.name) {
                    needHide = false;
                }
                if (needHide) {
                    self.hide();
                }
            }
        },

        saveMetadata: function (fileInfo, mdWin) {
            var mdStore = metadataPanel.getStore();
            var mdInfo = {
                path: fileInfo.path,
                name: fileInfo.name,
                metadata: self.getJSONMetadataArray(mdStore)
            };
            config.globalLoadMask.msg = config.htcConfig.locData.DetailsSavingMsg + "...";
            config.globalLoadMask.show();
            HttpCommander.Metadata.Save(mdInfo, function (mdata, strans) {
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                        mdata, strans, config.Msg, config.htcConfig, 2)) {
                    mdStore.loadData(mdata.metadata);
                    mdStore.commitChanges();
                    self.isChanged = false;
                    self.changeAvailableFields(mdStore);
                    self.buttons[0].setValue('');
                    self.buttons[1].setDisabled(true);
                    self.prepareFileProperties(mdata);
                    if (config.getShowMetaDataInList()) {
                        var folder = mdInfo.path;
                        if (!Ext.isEmpty(folder)) {
                            if (!Ext.isEmpty(mdInfo.name)) {
                                config.setSelectPath({
                                    name: mdInfo.name,
                                    path: folder
                                });
                            }
                            config.openGridFolder(folder);
                        }
                    }
                    if (mdWin)
                        mdWin.hide();
                }
            });
        },
        getJSONMetadataArray: function (mdStore) {
            var mdArray = new Array();
            if (mdStore.data.items != undefined && mdStore.data.items != null) {
                Ext.each(mdStore.data.items, function (item) {
                    mdArray.push(item.data);
                });
            }
            Ext.each(config.htcConfig.metaDataFields, function (f) {
                if (f.type == "date") {
                    Ext.each(mdArray, function (mdi) {
                        eval("if (mdi." + f.name + ") try { mdi." + f.name + " = mdi." + f.name + ".toUTCString(); } catch (e) { }");
                    });
                }
            });
            return /*eval(Ext.util.JSON.encode(*/mdArray/*))*/;
        },
        generateCBArrayStoreTitles: function (rows) {
            var result = [];
            var titlesRecord = helper.cbAvailableTitlesStore.recordType;
            var i, j, t, r, arr;
            for (j = 0; typeof (t = configPrivate.availableMDTitles[j]) != 'undefined'; j++) {
                if (t.multi) {
                    arr = [];
                    arr.push(t.name);
                    result.push(arr);
                }
            }
            for (j = 0; typeof (t = configPrivate.availableMDTitles[j]) != 'undefined'; j++) {
                if (!t.multi) {
                    var tnExists = true;
                    for (i = 0; typeof (r = rows[i]) != 'undefined'; i++) {
                        if (r.get('title').toLowerCase().trim() == t.name.toLowerCase().trim()) {
                            tnExists = false;
                            break;
                        }
                    }
                    if (tnExists) {
                        arr = [];
                        arr.push(t.name);
                        result.push(arr);
                    }
                }
            }
            return eval(Ext.util.JSON.encode(result));
        },
        readOnlyStateChange: function () {
            var checkBox = document.getElementById(config.$('linkReadOnlyAttribute'));
            if (config.htcConfig.allowSetReadOnly && fileNameMetaData) {
                if (checkBox && typeof checkBox.checked == 'boolean') {
                    var setReadOnlyInfo = {
                        readonly: checkBox.checked,
                        path: fileNameMetaData.value.path,
                        name: fileNameMetaData.value.name
                    };
                    config.globalLoadMask.msg = config.htcConfig.locData.ChangingReadOnlyProgressMessage + "...";
                    config.globalLoadMask.show();
                    HttpCommander.Common.ChangeReadOnly(setReadOnlyInfo, function (data, trans) {
                        config.globalLoadMask.hide();
                        config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                        if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, config.Msg, config.htcConfig)) {
                            checkBox.checked = setReadOnlyInfo.readonly;
                        } else {
                            checkBox.checked = !setReadOnlyInfo.readonly;
                        }
                    });
                }
            }
        },
        showFileModifications: function () {
            if (self.modificationHistory) {
                var path = self.modificationHistory.path || '';
                var name = self.modificationHistory.name || '';
                var store = self.modificationHistory.changes || [];
                if (path != '' && name != '' && store.length > 0) {
                    var winModifs = HttpCommander.Lib.FileModificationsWindow({
                        'htcConfig': config.htcConfig,
                        'Msg': config.Msg,
                        'Window': config.Window,
                        'name': name,
                        'store': store,
                        'getIsEmbeddedtoIFRAME': config.getIsEmbeddedtoIFRAME,
                        'getEmbedded': config.getEmbedded,
                        'getIsUSA': function () { return metadataPanel.getStore().isUSA; },
                        'getRenderers': config.getRenderers
                    });
                    winModifs.show();
                }
            }
        },
        calculateDirSize: function () {
            var folderInfo = self.modificationHistory;
            if (!folderInfo || !folderInfo.path || !folderInfo.name)
                return;
            if (folderInfo.path == '' || folderInfo.name == '')
                return;
            var holder = document.getElementById(config.$('linkCalculateDirSize'));
            var hodler1 = document.getElementById(config.$('linkCalculateDirCounts'));
            if (!holder || !hodler1)
                return;
            if (holder.getElementsByTagName('a').length < 1 ||
                hodler1.getElementsByTagName('a').length < 1)
                return;
            var oldContent = holder.innerHTML,
                oldContent1 = hodler1.innerHTML;
            holder.innerHTML = '<img align="absmiddle" alt="' + config.htcConfig.locData.Calculating + '..."'
                + ' src="' + HttpCommander.Lib.Utils.getIconPath(config, 'loadingsmall.gif') + '" />';
            hodler1.innerHTML = '<img align="absmiddle" alt="' + config.htcConfig.locData.Calculating + '..."'
                + ' src="' + HttpCommander.Lib.Utils.getIconPath(config, 'loadingsmall.gif') + '" />';
            self.syncSizeWrap();
            HttpCommander.Common.CalculateSizeDir(folderInfo, function (data, trans) {
                holder.innerHTML = oldContent;
                hodler1.innerHTML = oldContent1;
                self.syncSizeWrap();
                if (typeof data == 'undefined') {
                    config.Msg.alert(config.htcConfig.locData.CommonErrorCaption,
                        Ext.util.Format.htmlEncode(trans.message));
                    return;
                }
                if (!data.success) {
                    config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, data.message);
                    //return;
                }
                var sizeInBytes = data.size;
                var recalcHtml = " <a href='#' >" + config.htcConfig.locData.FolderRecalculateSize + "...</a>";
                var html = config.getRenderers().sizeRenderer(data.size);
                if (html.toLowerCase().indexOf('byte') == -1)
                    html += ' (' + sizeInBytes + '&nbsp;bytes)';
                html += recalcHtml;
                holder.innerHTML = html;
                hodler1.innerHTML = String.format(config.htcConfig.locData.FolderContainsFilesFolders,
                    data.files, data.folders) + recalcHtml;
                self.bindLinkHandlers();
                self.syncSizeWrap();
            });
        },
        syncSizeWrap: function () {
            if (self.rendered && !self.hidden && self.syncSize)
                self.syncSize();
        },
        prepareFileProperties: function (mdata) {
            var empty = '<tr><td>&nbsp;</td><td>&nbsp;</td></tr>';
            var store = metadataPanel.getStore();
            mdata = mdata || {};
            var props = mdata.props || {};
            props.path = props.path || '';
            props.name = props.name || '';
            self.modificationHistory = { path: props.path, name: props.name, changes: [] };
            if (typeof mdata.modifications != 'undefined') {
                self.modificationHistory.changes = mdata.modifications;
            }
            if (props.isDir) {
                props.size = "<span id='" + config.$('linkCalculateDirSize') + "'>"
                    + "<a href='#'>" + config.htcConfig.locData.FolderCalculateSize + "...</a></span>";
                props.contains = '<tr><td>' + config.htcConfig.locData.FolderContainsField + ':</td><td>'
                    + "<span id='" + config.$('linkCalculateDirCounts') + "'>"
                    + "<a href='#'>" + config.htcConfig.locData.FolderCalculateSize + "...</a></span>"
                    + '</td></tr>';
                props.modifications = empty;
            } else {
                if (props.size && String(props.size) != '') {
                    var sizeInBytes = props.size;
                    props.size = config.getRenderers().sizeRenderer(props.size);
                    if (props.size.toLowerCase().indexOf('byte') == -1)
                        props.size += ' (' + sizeInBytes + '&nbsp;bytes)';
                }
                if (config.htcConfig.allowSetReadOnly) {
                    var attr = [];
                    if (props.attributes)
                        attr = props.attributes.split(/\s*,\s*/);
                    var detectReadOnly = false;
                    var attrHtml = '';
                    for (var i = 0; i < attr.length; i++) {
                        if (attr[i] == 'ReadOnly')
                            detectReadOnly = true;
                        else
                            attrHtml += attr[i] + ', ';
                    }
                    props.attributes = Ext.util.Format.htmlEncode(attrHtml)
                        + '<input style="vertical-align:middle;" type="checkbox" '
                        + (detectReadOnly ? 'checked="checked" ' : '')
                        + " id='" + config.$('linkReadOnlyAttribute') + "'"
                        + ' /> ReadOnly';
                }
                var isEnableDownloadings = false,
                    isEnabledModifications = false;
                if (typeof props.downloadings != 'undefined' && props.downloadings >= 0) {
                    props.downloadings = '<tr><td>' + config.htcConfig.locData.AmountOfDownloadingsFile
                        + ':</td><td>' + Ext.util.Format.htmlEncode(props.downloadings) + '</td></tr>';
                    isEnableDownloadings = true;
                }
                if (typeof mdata.author != 'undefined' && typeof mdata.modifications != 'undefined') {
                    props.modifications = '<tr><td>' + config.htcConfig.locData.FileModificationsAuthor + ':</td><td>'
                        + Ext.util.Format.htmlEncode(HttpCommander.Lib.Utils.parseUserName(mdata.author) || '')
                        + '&nbsp;<a href="#"'
                        + " id='" + config.$('linkFileModificationHistory') + "'"
                        + ' >'
                        + config.htcConfig.locData.FileModificationsHistory + '</a></td></tr>';
                    isEnabledModifications = true;
                }
                if (isEnableDownloadings && !isEnabledModifications)
                    props.modifications = empty;
                else if (!isEnableDownloadings && isEnabledModifications)
                    props.downloadings = empty;
            }
            if (props.created)
                props.created = config.getRenderers().dateRendererLocal(props.created, null, null, null, null, store);
            if (props.modified)
                props.modified = config.getRenderers().dateRendererLocal(props.modified, null, null, null, null, store);
            if (props.accessed)
                props.accessed = config.getRenderers().dateRendererLocal(props.accessed, null, null, null, null, store);

            var propInfo = self.getComponent('file-details-info');
            if (propInfo) {
                if (self.rendered) {
                    propInfo.update(props);
                    self.bindLinkHandlers();
                } else
                    propInfo.data = props;
            }
        },
        bindLinkHandlers: function () {
            var slf = self || this;
            if (!slf.rendered)
                return;
            var holder = document.getElementById(config.$('linkCalculateDirSize'));
            if (holder) {
                holder.children[0].onclick = function () {
                    slf.calculateDirSize();
                    return false;
                }
            }
            holder = document.getElementById(config.$('linkCalculateDirCounts'));
            if (holder) {
                holder.children[0].onclick = function () {
                    slf.calculateDirSize();
                    return false;
                }
            }
            holder = document.getElementById(config.$('linkReadOnlyAttribute'));
            if (holder) {
                holder.onclick = function () {
                    slf.readOnlyStateChange();
                    return false;
                }
            }
            holder = document.getElementById(config.$('linkFileModificationHistory'));
            if (holder) {
                holder.onclick = function () {
                    slf.showFileModifications();
                    return false;
                }
            }
        },
        initialize: function (resInfo, mdata) {
            var notNtfs = (mdata.notntfs === true);
            self.setTitle(String.format(config.htcConfig.locData.DetailsWindowTitle,
                Ext.util.Format.htmlEncode(resInfo.name)));
            fileNameMetaData.setValue(resInfo);
            var mdStore = metadataPanel.getStore();
            mdStore.isUSA = mdata.isUSA;
            mdStore.loadData(mdata.metadata);
            mdStore.sort('datemodified', 'DESC');
            mdStore.commitChanges();
            self.isChanged = false;
            var modify = !notNtfs && config.isModifyAllowed() && (configPrivate.availableMDTitles.length > 0
                || config.htcConfig.isEditingMetadataTitles);
            Ext.each(helper.colModelMetaDataGrid.config, function (col) { col.editable = modify; });
            self.changeAvailableFields(mdStore, modify);
            var enableAddComment = modify && configPrivate.commentsAllowed
                && !self.allCommentsUsed(mdStore.getRange());
            metadataPanel.toolbars[0].setVisible(modify);
            self.buttons[0].setValue('');
            self.buttons[0].setVisible(modify && configPrivate.commentsAllowed);
            self.buttons[1].setVisible(modify && configPrivate.commentsAllowed);
            self.buttons[0].setDisabled(!enableAddComment);
            self.buttons[1].setDisabled(true);
            self.buttons[3].setVisible(modify);
            self.buttons[5].setVisible(false);
            var dp = config.getDetailsPane();
            if (!!dp && config.htcConfig.enableDetailsPane && dp.collapsed) {
                self.buttons[5].setVisible(true);
            }
            self.prepareFileProperties(mdata);
        },
        allCommentsUsed: function (rows) {
            if (!configPrivate.commentsAllowed || !Ext.isArray(rows)) {
                return true;
            }
            var k = 0;
            for (var j = 0, t; typeof (t = rows[j]) != 'undefined'; j++) {
                var u = t.data.title.toLowerCase().trim();
                if ('comment' == u) {
                    k++;
                    if (k > 1) {
                        break;
                    }
                }
            }
            return configPrivate.commentsIsMultiValue ? false : (k > 0);
        },
        changeAvailableFields: function (store) {
            if (store) {
                var addButton = metadataPanel.getTopToolbar().getComponent('add-md-button');
                var range = store.getRange();
                if (!config.htcConfig.isEditingMetadataTitles && !configPrivate.existsMultiValueMDTitle) {
                    if (addButton) {
                        addButton.setDisabled(self.allAccessibleTitlesAlreadyUsed(range));
                    }
                } else if (addButton && config.isModifyAllowed() && (configPrivate.availableMDTitles.length > 0
                        || config.htcConfig.isEditingMetadataTitles)) {
                    addButton.setDisabled(false);
                }
                var cArea = self.buttons[0];
                var cBtn = self.buttons[1];
                var allCUsed = self.allCommentsUsed(range);
                if (cArea) {
                    cArea.setDisabled(allCUsed);
                }
                if (cBtn) {
                    cBtn.setDisabled(allCUsed || Ext.isEmpty(cArea.getValue()));
                }
            }
        },
        allAccessibleTitlesAlreadyUsed: function (rows) {
            if (!Ext.isArray(rows)) {
                return true;
            }
            var k = 0, p = 0;
            for (var i = 0, a; typeof (a = configPrivate.availableMDTitles[i]) != 'undefined'; i++) {
                if (a.name.toLowerCase() == 'comment') {
                    continue;
                }
                p++;
                for (var j = 0, t; typeof (t = rows[j]) != 'undefined'; j++) {
                    var b = a.name.toLowerCase().trim();
                    var u = t.data.title.toLowerCase().trim();
                    if (b == u) {
                        k++;
                        break;
                    }
                }
            }
            return k >= p;// configPrivate.availableMDTitles.length;
        }
    });
    return self;
};