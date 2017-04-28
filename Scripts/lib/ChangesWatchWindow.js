Ext.ns('HttpCommander.Lib');

/*  config: htcConfig, Msg, Window, getUid(), $, globalLoadMask, showHelpWindow(),
    getCurrentFolder(), setSelectPath(), openGridFolder(), showBalloon(),
    getMenuActions(), getPageLimit(), renderers, getIsEmbeddedtoIFRAMEgetPageLimit()
*/
HttpCommander.Lib.ChangesWatchWindow = function (config) {
    var wmGrid, wmStore = new Ext.data.DirectStore({
            remoteSort: true,
            baseParams: { id: 0, start: 0, limit: config.getPageLimit(), sort: 'date', dir: 'DESC', path: null, child: false, begin: null, end: null },
            paramOrder: ['id', 'start', 'limit', 'sort', 'dir', 'path', 'child', 'begin', 'end'],
            directFn: HttpCommander.Common.GetWatchedChanges,
            idProperty: 'id',
            totalProperty: 'total',
            successProperty: 'success',
            root: 'data',
            sortInfo: {
                field: 'date',
                direction: 'DESC'
            },
            defaultRequestTimeout: Ext.Ajax.timeout,
            listeners: {
                beforeload: function (store, opts) {
                    Ext.Ajax.timeout = HttpCommander.Lib.Consts.gridRequestTimeout;
                },
                datachanged: function (store) {
                    if (wmGrid && config.getPageLimit()) {
                        var gbb = wmGrid.getBottomToolbar();
                        if (gbb) {
                            var pageData = gbb.getPageData();
                            var totalCount = store.getTotalCount();
                            var count = store.getCount();
                            if (store.reader && store.reader.jsonData &&
                                    Ext.isNumber(store.reader.jsonData.position) &&
                                    store.reader.jsonData.position > -1) {
                                gbb.cursor = store.reader.jsonData.position;
                                pageData = gbb.getPageData();
                                var ap = pageData.activePage, ps = pageData.pages;
                                gbb.afterTextItem.setText(String.format(gbb.afterPageText, pageData.pages));
                                gbb.inputItem.setValue(ap);
                                gbb.first.setDisabled(ap == 1);
                                gbb.prev.setDisabled(ap == 1);
                                gbb.next.setDisabled(ap == ps);
                                gbb.last.setDisabled(ap == ps);
                                gbb.refresh.enable();
                                gbb.updateInfo();
                            }
                            gbb.fireEvent('change', this, pageData);
                            if (config.getPageLimit() >= totalCount && pageData.activePage >= 1 && pageData.activePage <= pageData.pages)
                                gbb.hide();
                            else
                                gbb.show();
                        }
                    }
                },
                load: function (store, records, options) {
                    Ext.Ajax.timeout = store.defaultRequestTimeout;
                    if (store.reader && store.reader.jsonData && !store.reader.jsonData.success) {
                        config.Msg.show({
                            title: config.htcConfig.locData.CommonErrorCaption,
                            msg: store.reader.jsonData.message,
                            icon: config.Msg.ERROR,
                            buttons: config.Msg.OK
                        });
                    }
                },
                exception: function (proxy, type, action, options, res, arg) {
                    if (wmStore) {
                        Ext.Ajax.timeout = wmStore.defaultRequestTimeout;
                    }
                    if (type === 'remote') {
                        var message = "Message: " + Ext.util.Format.htmlEncode(res.message);
                        if (res.xhr)
                            message = "Status: " + Ext.util.Format.htmlEncode(res.xhr.status)
                                + " " + Ext.util.Format.htmlEncode(res.xhr.statusText)
                                + "<br />" + message;
                        config.Msg.show({
                            title: config.htcConfig.locData.CommonErrorCaption,
                            msg: message,
                            icon: config.Msg.ERROR,
                            buttons: config.Msg.OK
                        });
                    }
                }
            },
            fields:
            [
                { name: 'id', type: 'int' },
                { name: 'user', type: 'string' },
                { name: 'date', type: 'date', dateFormat: 'timestamp' },
                { name: 'action', type: 'string' },
                { name: 'path', type: 'string' },
                { name: 'phys_path', type: 'string' },
                { name: 'more_info', type: 'string' },
                { name: 'is_folder', type: 'boolean' },
                { name: 'is_public', type: 'boolean' },
                { name: 'by_webdav', type: 'boolean' }
            ]
        }), self = new config.Window({
        title: config.htcConfig.locData.WatchForModifsViewChangesCommand,
        resizable: true,
        closable: true,
        maximizable: true,
        closeAction: 'hide',
        border: false,
        minHeight: 350,
        minWidth: config.getIsEmbeddedtoIFRAME() ? 300 : 500,
        modal: true,
        width: config.getIsEmbeddedtoIFRAME() ? 500 : 800,
        height: 500,
        layout: 'fit',
        pathInfo: null,
        frame: false,
        plain: true,
        items: [wmGrid = new Ext.grid.GridPanel({
            header: false,
            border: false,
            frame: false,
            buttonAlign: 'left',
            minColumnWidth: 25,
            loadMask: { msg: config.htcConfig.locData.ProgressLoading + "..." },
            autoExpandMin: 100,
            enableHdMenu: true,
            viewConfig: { forceFit: true },
            autoExpandColumn: 'w-more-info',
            tbar: [{
                xtype: 'label',
                html: config.htcConfig.locData.SearchByDateFrom + ':&nbsp;'
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
                        self.loadLogs({
                            start: 0,
                            limit: config.getPageLimit()
                        });
                    }
                }
            }, {
                xtype: 'label',
                html: '&nbsp;&nbsp;' + config.htcConfig.locData.SearchByDateTo + ':&nbsp;'
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
                        self.loadLogs({
                            start: 0,
                            limit: config.getPageLimit()
                        });
                    }
                }
            }, ' ', {
                text: config.htcConfig.locData.CommonForToday,
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
                    self.loadLogs({
                        start: 0,
                        limit: config.getPageLimit()
                    });
                }
            }, '->', {
                text: config.htcConfig.locData.CommandRefresh,
                icon: HttpCommander.Lib.Utils.getIconPath(config, 'refresh'),
                handler: function () {
                    if (wmStore) {
                        wmStore.reload();
                    }
                }
            }],
            bbar: config.getPageLimit() > 0 ? new Ext.PagingToolbar({
                pageSize: config.getPageLimit(),
                store: wmStore,
                displayInfo: true,
                beforePageText: config.htcConfig.locData.PagingToolbarBeforePageText,
                afterPageText: config.htcConfig.locData.PagingToolbarAfterPageText,
                firstText: config.htcConfig.locData.PagingToolbarFirstText,
                prevText: config.htcConfig.locData.PagingToolbarPrevText,
                nextText: config.htcConfig.locData.PagingToolbarNextText,
                lastText: config.htcConfig.locData.PagingToolbarLastText,
                displayMsg: config.htcConfig.locData.PagingToolbarDisplayMsg,
                refreshText: config.htcConfig.locData.CommandRefresh,
                emptyMsg: config.htcConfig.locData.PagingToolbarEmptyMsg
            }) : undefined,
            store: wmStore,
            plugins: [new Ext.ux.grid.GridFilters({
                menuFilterText: config.htcConfig.locData.MenuFilterText,
                encode: false,
                local: true,
                filters: [{
                    type: 'numeric',
                    dataIndex: 'id',
                    menuItemCfgs: { emptyText: config.htcConfig.locData.EmptyTextFilter }
                }, {
                    dataIndex: 'path',
                    type: 'string',
                    emptyText: config.htcConfig.locData.EmptyTextFilter
                }, {
                    dataIndex: 'action',
                    type: 'string',
                    emptyText: config.htcConfig.locData.EmptyTextFilter
                }, {
                    dataIndex: 'user',
                    type: 'string',
                    emptyText: config.htcConfig.locData.EmptyTextFilter
                }, {
                    dataIndex: 'phys_path',
                    type: 'string',
                    emptyText: config.htcConfig.locData.EmptyTextFilter
                }, {
                    dataIndex: 'more_info',
                    type: 'string',
                    emptyText: config.htcConfig.locData.EmptyTextFilter
                }, {
                    dataIndex: 'is_folder',
                    type: 'boolean',
                    yesText: config.htcConfig.locData.CommonValueTypeFolder,
                    noText: config.htcConfig.locData.CommandFile
                }, {
                    dataIndex: 'is_public',
                    type: 'boolean',
                    yesText: config.htcConfig.locData.YesBooleanFilterText,
                    noText: config.htcConfig.locData.NoBooleanFilterText
                }, {
                    dataIndex: 'by_webdav',
                    type: 'boolean',
                    yesText: config.htcConfig.locData.YesBooleanFilterText,
                    noText: config.htcConfig.locData.NoBooleanFilterText
                }, {
                    dataIndex: 'date',
                    type: 'date',
                    afterText: config.htcConfig.locData.AfterDateFilterText,
                    beforeText: config.htcConfig.locData.BeforeDateFilterText,
                    onText: config.htcConfig.locData.OnDateFilterText
                }]
            })],
            colModel: new Ext.grid.ColumnModel({
                defaults: { sortable: true },
                columns: [{
                    id: 'w-id',
                    header: 'Id',
                    width: 30,
                    hidden: true,
                    dataIndex: 'id'
                }, {
                    id: 'w-user',
                    header: config.htcConfig.locData.CommonFieldLabelUser,
                    dataIndex: 'user',
                    width: 70,
                    renderer: function (val) {
                        var user = HttpCommander.Lib.Utils.parseUserName(val);
                        return config.renderers.htmlEncodedRenderer(user);
                    }
                }, {
                    id: 'w-date',
                    header: config.htcConfig.locData.CommonFieldLabelDate,
                    dataIndex: 'date',
                    renderer: config.renderers.dateRendererWithQTip,
                    width: 140
                }, {
                    id: 'w-action',
                    header: config.htcConfig.locData.CommonFieldLabelAction,
                    dataIndex: 'action',
                    renderer: config.renderers.htmlEncodedRenderer,
                    width: 70
                }, {
                    id: 'w-path',
                    header: config.htcConfig.locData.CommonFieldLabelPath,
                    dataIndex: 'path',
                    renderer: function (val) {
                        if (Ext.isEmpty(val)) {
                            return '&nbsp;';
                        }
                        return String.format("<a ext:qtip='{0}' href='' style='white-space: normal;' class='fileNameLink' onclick='return false;'>{1}</a>",
                            Ext.util.Format.htmlEncode(config.htcConfig.locData.GridRowAlertEventHint),
                            Ext.util.Format.htmlEncode(val));
                    },
                    width: 200
                }, /*{
                    id: 'w-phys-path',
                    header: config.htcConfig.locData.LogsGridPhysPathColumn,
                    dataIndex: 'phys_path',
                    renderer: config.renderers.wordWrapRenderer,
                    width: 200,
                    hidden: true
                }, */{
                    id: 'w-more-info',
                    width: 250,
                    header: config.htcConfig.locData.LogsGridDetailsTitle,
                    dataIndex: 'more_info',
                    renderer: config.renderers.wordWrapRenderer
                }, {
                    id: 'w-is-folder',
                    width: 25,
                    header: config.htcConfig.locData.LogsGridIsFolderColumn,
                    dataIndex: 'is_folder',
                    hidden: true,
                    renderer: config.renderers.booleanRenderer
                }, {
                    id: 'w-is-public',
                    width: 35,
                    header: config.htcConfig.locData.LogsGridIsPublicColumn,
                    dataIndex: 'is_public',
                    renderer: config.renderers.booleanRenderer
                }, {
                    id: 'w-by-webdav',
                    width: 35,
                    header: config.htcConfig.locData.LogsGridByWebDavColumn,
                    dataIndex: 'by_webdav',
                    renderer: config.renderers.booleanRenderer
                }]
            }),
            flex: 1,
            stripeRows: true,
            listeners: {
                cellclick: function (grid, rowIndex, columnIndex, e) {
                    var record = wmGrid.getStore().getAt(rowIndex);  // Get the Record
                    var fieldName = wmGrid.getColumnModel().getDataIndex(columnIndex); // Get field name
                    if (fieldName == 'path') {
                        var path = record.get(fieldName);
                        var name = null;
                        if (Ext.isEmpty(path)) {
                            return;
                        }
                        var slashPos = path.lastIndexOf('/');
                        if (slashPos > 0 && slashPos < path.length - 1) {
                            name = path.substring(slashPos + 1);
                            path = path.substring(0, slashPos);
                        }
                        if (!Ext.isEmpty(name)) {
                            config.setSelectPath({
                                path: path,
                                name: name
                            });
                        }
                        config.openGridFolder(path);
                    }
                }
            }
        })],
        buttonAlign: 'left',
        buttons: [{
            icon: HttpCommander.Lib.Utils.getIconPath(config, 'stopwatch') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=stopwatch' : ''),
            text: config.htcConfig.locData.WatchForModifsStopCommand,
            hidden: true,
            handler: function (btn) {
                config.getMenuActions().stopWatch(self.pathInfo, self);
            }
        }, {
            icon: HttpCommander.Lib.Utils.getIconPath(config, 'edit') + (HttpCommander.Lib.Utils.browserIs.ie10standard ? '?q=edit' : ''),
            text: config.htcConfig.locData.WatchForModifsEditCommand,
            hidden: true,
            handler: function (btn) {
                config.getMenuActions().editWatch(self.pathInfo, self);
            }
        }, '->', {
            text: config.htcConfig.locData.CommonButtonCaptionClose,
            handler: function (btn) {
                self.hide();
            }
        }],
        loadLogs: function (opts) {
            if (!wmStore) {
                return;
            }
            var path = self.pathInfo && !Ext.isEmpty(self.pathInfo.path)
                ? self.pathInfo.path : null;
            var child = false;
            var id = self.pathInfo && Ext.isNumber(self.pathInfo.id)
                ? self.pathInfo.id : (child = Ext.isNumber(self.pathInfo.parentId)) ? self.pathInfo.parentId : 0;
            var b = Ext.getCmp('startdt'), bVal = null,
                e = Ext.getCmp('enddt'), eVal = null;
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
                path: path, id: id, child: child, begin: bVal, end: eVal
            }, opts || {});
            wmStore.setBaseParam('path', path);
            wmStore.setBaseParam('id', id);
            wmStore.setBaseParam('child', child);
            wmStore.setBaseParam('begin', bVal);
            wmStore.setBaseParam('end', eVal);
            if (wmStore.baseParams.sort) {
                prms.sort = wmStore.baseParams.sort;
            }
            if (wmStore.baseParams.dir) {
                prms.dir = wmStore.baseParams.dir;
            }
            if (!Ext.isDefined(prms.start)) {
                prms.start = wmStore.baseParams.start || 0;
            }
            if (!Ext.isDefined(prms.limit)) {
                prms.limit = wmStore.baseParams.limit || config.getPageLimit();
            }
            wmStore.storeOptions(prms);
            wmStore.load({ params: prms });
        },
        listeners: {
            beforeshow: function (wnd) {
                if (!wnd.pathInfo || Ext.isEmpty(wnd.pathInfo.path)) {
                    return false;
                }
                var allowStopChange = Ext.isNumber(wnd.pathInfo.id) && wnd.pathInfo.id > 0;
                wnd.buttons[0].setVisible(allowStopChange);
                wnd.buttons[1].setVisible(allowStopChange);
                wnd.setTitle(config.htcConfig.locData.WatchForModifsViewChangesCommand + ': <strong>'
                    + Ext.util.Format.htmlEncode(wnd.pathInfo.path) + '</strong>');
                return true;
            },
            hide: function (wnd) {
                wnd.pathInfo = null;
            },
            show: function (wnd) {
                if (wmStore) {
                    wmStore.removeAll();
                    wmStore.setDefaultSort('date', 'DESC');
                    self.loadLogs({
                        start: 0,
                        limit: config.getPageLimit(),
                        sort: 'date',
                        dir: 'DESC'
                    });
                }
                wnd.doLayout();
                wnd.syncSize();
            }
        }
    });

    return self;
};