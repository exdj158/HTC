Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, globalLoadMask, getIsEmbeddedtoIFRAME(), getEmbedded(),
prepareAndShowMakePublicLinkWindow(), renderers, openGridFolder()
*/
HttpCommander.Lib.ViewLinksWindow = function (config) {
    var publicLinksGrid;
    var window = new config.Window({
        title: config.htcConfig.locData.AnonymousViewLinksWindowTitle,
        autoDestroy: true,
        border: false,
        boxMinHeight: 250,
        boxMinWidth: config.getIsEmbeddedtoIFRAME() ? 300 : 450,
        layout: {
            type: 'vbox',
            align: 'stretch',
            padding: 0
        },
        modal: true,
        resizable: true,
        plain: true,
        closeAction: 'hide',
        maximizable: !config.getEmbedded(), //true,
        width: config.getIsEmbeddedtoIFRAME() ? 350 : 500,
        height: 250,
        oldLinkPath: null,
        listeners: {
            beforeshow: function (wnd) {
                var tb = wnd.items.items[0].getTopToolbar();
                if (tb) {
                    var btn = tb.getComponent('toggle-all');
                    if (btn) {
                        btn.setVisible(window.oldLinkPath != null);
                        var state = window.linkPath == null;
                        btn.toggle(state, true);
                        btn.setText(config.htcConfig.locData[state
                            ? 'PublicLinksShowForSelected' : 'PublicLinksShowForAllItems']);
                    }
                }
            }
        },
        items:
        [
            publicLinksGrid = new Ext.grid.GridPanel({

                'openEditPublicLink': function (grid) {
                    grid = grid || publicLinksGrid;
                    var row = grid.getSelectionModel().getSelected().data;
                    var isFolder = row["isfolder"];
                    var p = row["acl"];
                    var hp = row["perms"];
                    var anonPerm = {
                        download: { checked: p && (p & 2) != 0 && (!isFolder || (p & 1) != 0) },
                        upload: { checked: isFolder && p && (p & 4) != 0 },
                        view: { checked: isFolder && p && (p & 1) != 0 },
                        zip: { checked: isFolder && p && (p & 8) != 0 }
                    };
                    var onlyZip = anonPerm.zip.checked && !anonPerm.upload.checked && !anonPerm.view.checked;
                    anonPerm.download["disabled"] = !isFolder || onlyZip || !(hp && hp.download && hp.anonymDownload);
                    anonPerm.upload["disabled"] = !isFolder || onlyZip || !(hp && hp.upload && hp.anonymUpload);
                    anonPerm.view["disabled"] = !isFolder || onlyZip || !(hp && (hp.listFiles || hp.listFolders) && hp.anonymViewContent);
                    anonPerm.zip["disabled"] = !isFolder || !(hp && hp.zipDownload && hp.anonymDownload);
                    anonPerm.modify = hp && hp.modify;
                    if (anonPerm.download["disabled"])
                        anonPerm.download["checked"] = false;
                    if (anonPerm.upload["disabled"])
                        anonPerm.upload["checked"] = false;
                    if (anonPerm.view["disabled"])
                        anonPerm.view["checked"] = false;
                    if (anonPerm.zip["disabled"])
                        anonPerm.zip["checked"] = false;
                    config.prepareAndShowMakePublicLinkWindow(row["virt_path"], isFolder, anonPerm, row);
                },

                header: false,
                loadMask: { msg: config.htcConfig.locData.ProgressGettingAnonymLinks + "..." },
                selModel: new Ext.grid.RowSelectionModel({
                    singleSelect: true,
                    listeners: {
                        selectionchange: function (model) {
                            var buttons = model.grid.getTopToolbar().items.items;
                            var disabled = model.getCount() < 1;
                            buttons[1].setDisabled(disabled);
                            buttons[2].setDisabled(disabled);
                        }
                    }
                }),
                autoExpandMin: 70,
                autoExpandColumn: 'view-links-virtpath',
                tbar: new Ext.Toolbar({
                    enableOverflow: true,
                    items:
                    [
                        {
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'refresh') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=linkswindow' : ''),
                            text: config.htcConfig.locData.CommandRefresh,
                            handler: function (btn) {
                                btn.ownerCt.ownerCt.getStore().load();
                            }
                        },
                        {
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'edit') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=linkswindow' : ''),
                            text: config.htcConfig.locData.CommandMenuEdit,
                            disabled: true,
                            handler: function (btn) {
                                var grid = btn.ownerCt.ownerCt;
                                grid.openEditPublicLink(grid);
                            }
                        },
                        {
                            text: config.htcConfig.locData.CommandDelete,
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'delete') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=linkswindow' : ''),
                            disabled: true,
                            handler: function (btn) {
                                config.Msg.confirm(
                                    config.htcConfig.locData.PublicLinksDeleteWindowTitle,
                                    config.htcConfig.locData.PublicLinksDeleteConfirmMsg,
                                    function (cnfrmBtn) {
                                        if (cnfrmBtn == 'yes') {
                                            var grid = btn.ownerCt.ownerCt;
                                            var rec = grid.getSelectionModel().getSelected();
                                            config.globalLoadMask.msg = config.htcConfig.locData.ProgressDeletingAnonymousLink + "...";
                                            config.globalLoadMask.show();
                                            HttpCommander.Common.RemoveAnonymLinks({ ids: [rec.data['id']] }, function (data, trans) {
                                                config.globalLoadMask.hide();
                                                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                                                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                                                            data, trans, config.Msg, config.htcConfig)) {
                                                    if (data && data.needrefresh) {
                                                        config.openGridFolder(config.getCurrentFolder());
                                                    }
                                                    grid.getStore().load();
                                                }
                                            });
                                        }
                                        config.Msg.hide();
                                    }
                                );
                            }
                        }, '->', {
                            itemId: 'toggle-all',
                            text: config.htcConfig.locData.PublicLinksShowForAllItems,
                            hidden: true,
                            enableToggle: true,
                            toggleHandler: function (btn, state) {
                                if (window.oldLinkPath != null) {
                                    window.linkPath = state ? null : window.oldLinkPath;
                                    btn.setText(config.htcConfig.locData[state
                                        ? 'PublicLinksShowForSelected' : 'PublicLinksShowForAllItems']);
                                    window.items.items[0].getStore().reload();
                                }
                            }
                        }
                    ]
                }),
                store: new Ext.data.DirectStore({
                    remoteSort: false,
                    directFn: HttpCommander.Common.GetAnonymLinks,
                    baseParams: { linkPath: null },
                    paramOrder: ['linkPath'],
                    idProperty: 'id',
                    totalProperty: 'total',
                    successProperty: 'success',
                    root: 'data',
                    fields:
                    [
                        { name: 'id', type: 'int' },
                        { name: 'key', type: 'string' },
                        { name: 'date', type: 'date', dateFormat: 'timestamp' },
                        { name: 'expires', type: 'date', dateFormat: 'timestamp' },
                        { name: 'withpasswd', type: 'boolean' },
                        { name: 'password', type: 'string' },
                        { name: 'virt_path', type: 'string' },
                        { name: 'acl', type: 'int' },
                        { name: 'downloads', type: 'string' },
                        { name: 'notes', type: 'string' },
                        { name: 'emails', type: 'string' },
                        { name: 'upload_overwrite', type: 'boolean' },
                        { name: 'isfolder', type: 'boolean' },
                        { name: 'perms', mapping: 'perms' },
                        { name: 'show_comments', type: 'boolean' },
                        { name: 'access_users', type: 'string' },
                        { name: 'url', type: 'string' },
                        { name: 'url2', type: 'string' },
                        { name: 'shortUrl', type: 'string' },
                        { name: 'shortUrl2', type: 'string' }
                    ],
                    listeners: {
                        beforeload: function (store, opts) {
                            store.baseParams.linkPath = window.linkPath;
                        }
                    }
                }),
                plugins: [
                    new Ext.ux.grid.GridFilters({
                        menuFilterText: config.htcConfig.locData.MenuFilterText,
                        encode: false,
                        local: true,
                        filters: [{
                            dataIndex: 'virt_path',
                            type: 'string',
                            emptyText: config.htcConfig.locData.EmptyTextFilter
                        }, {
                            dataIndex: 'isfolder',
                            type: 'boolean',
                            yesText: config.htcConfig.locData.CommonValueTypeFolder,
                            noText: config.htcConfig.locData.CommandFile
                        }, {
                            dataIndex: 'date',
                            type: 'date',
                            afterText: config.htcConfig.locData.AfterDateFilterText,
                            beforeText: config.htcConfig.locData.BeforeDateFilterText,
                            onText: config.htcConfig.locData.OnDateFilterText
                        }, {
                            dataIndex: 'expires',
                            type: 'date',
                            afterText: config.htcConfig.locData.AfterDateFilterText,
                            beforeText: config.htcConfig.locData.BeforeDateFilterText,
                            onText: config.htcConfig.locData.OnDateFilterText
                        }, {
                            dataIndex: 'withpasswd',
                            type: 'boolean',
                            yesText: config.htcConfig.locData.ExtMsgButtonTextYES,
                            noText: config.htcConfig.locData.ExtMsgButtonTextNO
                        }, {
                            dataIndex: 'downloads',
                            type: 'numeric',
                            menuItemCfgs: { emptyText: config.htcConfig.locData.EmptyTextFilter }
                        }, {
                            dataIndex: 'show_comments',
                            type: 'boolean',
                            yesText: config.htcConfig.locData.ExtMsgButtonTextYES,
                            noText: config.htcConfig.locData.ExtMsgButtonTextNO
                        }]
                    })
                ],
                colModel: new Ext.grid.ColumnModel({
                    defaults: { sortable: true },
                    columns:
                    [
                        {
                            id: 'view-links-virtpath',
                            header: config.htcConfig.locData.CommonFieldLabelPath,
                            dataIndex: 'virt_path',
                            renderer: config.renderers.wordWrapRenderer
                        },
                        {
                            id: 'view-links-type',
                            header: config.htcConfig.locData.CommonFieldLabelType,
                            dataIndex: 'isfolder',
                            width: 70,
                            renderer: function (val, cell, rec, row, col, store) {
                                return config.htcConfig.locData[(val ? 'CommonValueTypeFolder' : 'CommandFile')];
                            }
                        },
                        {
                            id: 'view-links-datecreated',
                            header: config.htcConfig.locData.AnonymousViewLinksDateCreatedColumn,
                            dataIndex: 'date',
                            renderer: config.renderers.dateRendererWithQTip,
                            width: 125,
                            hidden: true
                        },
                        {
                            id: 'view-links-dateexpired',
                            header: config.htcConfig.locData.AnonymousViewLinksDateExpiredColumn,
                            dataIndex: 'expires',
                            renderer: config.renderers.dateRendererWithQTip,
                            width: 125
                        },
                        {
                            id: 'view-links-with-passwd',
                            header: config.htcConfig.locData.CommonFieldLabelPassword,
                            dataIndex: 'withpasswd',
                            renderer: config.renderers.booleanRenderer,
                            width: 70,
                            align: 'center'
                        },
                        {
                            id: 'view-links-permission',
                            header: config.htcConfig.locData.AnonymousViewLinksPermissionColumn,
                            dataIndex: 'acl',
                            renderer: function (val, cell, rec, row, col, store) {
                                var res = '';
                                if ((val & 1) != 0)
                                    res += config.htcConfig.locData.PublicFolderAnonymViewContent;
                                if ((val & 2) != 0)
                                    res += (res == '' ? '' : ', ') + config.htcConfig.locData.PublicFolderAnonymDownload;
                                if ((val & 4) != 0)
                                    res += (res == '' ? '' : ', ') + config.htcConfig.locData.PublicFolderAnonymUpload;
                                if ((val & 8) != 0)
                                    res += (res == '' ? '' : ', ') + config.htcConfig.locData.PublicFolderAnonymZipDownload;
                                return String.format("<span style='white-space: normal;'>{0}</span>", res);
                            }
                        },
                        {
                            id: 'view-links-showcomments',
                            header: config.htcConfig.locData.AnonymousLinkShowCommentsShort,
                            dataIndex: 'show_comments',
                            renderer: config.renderers.booleanRenderer,
                            width: 70,
                            align: 'center',
                            hidden: true
                        },
                        {
                            id: 'view-links-downloaded',
                            header: config.htcConfig.locData.AnonymousViewLinksDownloadedColumn,
                            dataIndex: 'downloads',
                            hidden: true
                        }
                    ]
                }),
                flex: 1,
                stripeRows: true,
                keys: {
                    key: [Ext.EventObject.ENTER],
                    fn: function (e) {
                        if (e == Ext.EventObject.ENTER) {
                            publicLinksGrid.openEditPublicLink(publicLinksGrid);
                        }
                    },
                    scope: publicLinksGrid
                },
                listeners: {
                    rowdblclick: function (grd, index, e) {
                        grd.openEditPublicLink(grd);
                    }
                }
            })
        ]
    });
    return window;
};