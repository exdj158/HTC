Ext.ns('HttpCommander.Lib');

/**
 *  config: htcConfig, Window, getSelectPath(), setSelectPath(), openGridFolder(), Msg,
 *  ProcessScriptError(), getCurrentFolder(), getExtEl(), getRenderers(), getFileManager(),
 *  isSpecialTreeFolderOrSubFolder(), isRootFolder(), getRootName()
 */
HttpCommander.Lib.FileSearchWindow = function (config) {
    // button vars
    var searchWindowFirstBtn, searchWindowPrevBtn,
        searchWindowNextBtn, searchWindowLastBtn,
        busy = false;
        searchBtnPressed = false, curPage = 0, lastForward = true;

    var searchStore = new Ext.data.DirectStore({
        autoLoad: false,
        remoteSort: false,
        baseParams: {
            namePattern: '*',
            detailsPattern: null,
            contentPattern: null,
            path: 'root',
            startTopFolder: null,
            startFilePath: null,
            searchDirection: 'forward',
            dateFrom: null,
            dateTo: null,
            searchType: 0,
            skip: 0,
            fwws: true,
        },
        directFn: HttpCommander.Grid.Search,
        paramOrder: [
            'namePattern',
            'detailsPattern',
            'contentPattern',
            'path',
            'startTopFolder',
            'startFilePath',
            'searchDirection',
            'dateFrom',
            'dateTo',
            'searchType',
            'skip',
            'fwws'
        ],
        totalProperty: 'total',
        firstFilePath: null,
        lastFilePath: null,
        firstTopFolder: null,
        lastTopFolder: null,
        // maximum number of files the HttpCommander.Grid.Search method may return in one response
        // HttpCommander.Grid.Search always returns the maximum number of files
        // if there are enough files matching the search criteria.
        maxFileNumber: config.htcConfig.maxSearchResults, // by default 20
        root: 'data',
        defaultRequestTimeout: Ext.Ajax.timeout,
        fields: [
            { name: 'name', type: 'string' },
            { name: 'path', type: 'string' },
            { name: 'icon', type: 'string' },
            { name: 'topFolder', type: 'string' },
            { name: 'isFolder', type: 'boolean' }
        ]
    });

    var gridSearch, gridSearchAnchor = '100% -';
    switch (config.htcConfig.searchCriterions.total) {
        case 0: gridSearchAnchor += '95'; break;
        case 1: gridSearchAnchor += config.htcConfig.searchCriterions.date ? '122' : '118'; break;
        case 2: gridSearchAnchor += config.htcConfig.searchCriterions.date ? '145' : '141'; break;
        case 3: gridSearchAnchor += '168'; break;
        default: gridSearchAnchor = '100%';
    }

    function searchGridRowAction(grd, index, e) {
        try {
            grd = grd || gridSearch;
            var record = grd.getStore().getAt(index);
            var path = record.data.path;
            var selectPath = { name: '', path: '' };
            selectPath.name = record.data.name;
            selectPath.path = record.data.path;
            config.setSelectPath(selectPath);
            config.openGridFolder(path, true);
            searchWindow.hide();
        } catch (err) {
            config.ProcessScriptError(err);
        }
    }

    var searchTypesStore = new Ext.data.ArrayStore({
        fields: ['index', 'label'],
        data:
        [
            [0, config.htcConfig.locData.SearchOnlyFiles],
            [1, config.htcConfig.locData.SearchOnlyFolders],
            [2, config.htcConfig.locData.SearchBothFilesFolders]
        ]
    });

    var searchHandlerImpl = function (form, details_pattern, scope) {
        var pattern = searchForm.getComponent('fileName').getComponent('name_search_pattern').getValue();
        if (Ext.isEmpty(pattern) || pattern.trim().length == 0)
            pattern = "*";
        searchStore.setBaseParam('namePattern', pattern);
        searchStore.setBaseParam('detailsPattern', details_pattern);
        var contentSearchPatternField = searchForm.getComponent("content_search_pattern");
        var file_content_pattern = config.htcConfig.searchCriterions.content && !contentSearchPatternField.disabled
            ? contentSearchPatternField.getValue() : null;
        searchStore.setBaseParam('contentPattern', file_content_pattern);
        var date_from = null, date_to = null;
        if (config.htcConfig.searchCriterions.date) {
            date_from = searchForm.getComponent('dateRange').getComponent('column1').getComponent('date_search_pattern_field_from').getValue();
            date_from = HttpCommander.Lib.Utils.getDateUTCString(date_from);
            date_to = searchForm.getComponent('dateRange').getComponent('column2').getComponent('date_search_pattern_field_to').getValue();
            if (Ext.isDate(date_to)) {
                date_to = date_to.clearTime().add(Date.DAY, 1).add(Date.SECOND, -1);
            }
            date_to = HttpCommander.Lib.Utils.getDateUTCString(date_to);
        }
        searchStore.setBaseParam('dateFrom', date_from);
        searchStore.setBaseParam('dateTo', date_to);
        var search_type = searchForm.getComponent('searchType').getValue();
        searchStore.setBaseParam('searchType', search_type);
        searchStore.setBaseParam('path', scope);
        searchStore.setBaseParam('startTopFolder', null);
        searchStore.setBaseParam('startFilePath', null);
        searchStore.setBaseParam('searchDirection', 'forward');
        searchStore.setBaseParam('fwws', true);
        searchStore.firstFilePath = null;
        searchStore.lastFilePath = null;
        searchStore.firstTopFolder = null;
        searchStore.lastTopFolder = null;

        searchBtnPressed = true;
        curPage = 0;
        lastForward = true;
        searchStore.setBaseParam('skip', 0);

        searchStore.reload();
    };
    var searchHandler = function () {
        var form = searchForm.getForm();
        if (!form.isValid()) {
            return;
        }
        var details_pattern = config.htcConfig.searchCriterions.details
            ? searchForm.getComponent("details_search_pattern").getValue() : null;
        var scopeRadioGroup = searchForm.getComponent('searchScope').getValue();
        var scope = config.getRootName();
        if (scopeRadioGroup.getGroupValue() != 'entire') {
            var curFolder = config.getCurrentFolder();
            if (!Ext.isEmpty(curFolder) && !config.isRootFolder(curFolder)) {
                if (config.isSpecialTreeFolderOrSubFolder(curFolder)) {
                    config.Msg.show({
                        title: config.htcConfig.locData.CommonConfirmCaption,
                        msg: Ext.util.Format.htmlEncode(config.htcConfig.locData.SearchInSpecialFolderWarning),
                        buttons: config.Msg.OKCANCEL,
                        icon: config.Msg.WARNING,
                        fn: function (result) {
                            if (result == "ok") {
                                searchHandlerImpl(form, details_pattern, scope);
                            }
                        }
                    });
                    return;
                } else {
                    scope = curFolder;
                }
            }
        }
        if (config.htcConfig.bothSearchMethods && !Ext.isEmpty(details_pattern)) {
            config.Msg.show({
                title: config.htcConfig.locData.CommonConfirmCaption,
                msg: Ext.util.Format.htmlEncode(config.htcConfig.locData.SearchByDetailsWarning),
                buttons: config.Msg.OKCANCEL,
                icon: config.Msg.WARNING,
                fn: function (result) {
                    if (result == "ok") {
                        searchHandlerImpl(form, details_pattern, scope);
                    }
                }
            });
            return;
        }
        searchHandlerImpl(form, details_pattern, scope);
    };

    var searchForm = new Ext.form.FormPanel({
        baseCls: 'x-plain',
        labelWidth: 75,
        items: [{
            xtype: 'container',
            layout: 'hbox',
            anchor: '100%',
            itemId: 'fileName',
            fieldLabel: config.htcConfig.locData.CommonFileNameCaption,
            items: [{
                xtype: 'textfield',
                itemId: 'name_search_pattern',
                hideLabel: true,
                flex: 1
            }, {
                xtype: 'button',
                text: config.htcConfig.locData.SearchSearch,
                handler: searchHandler
            }]
        }, {
            xtype: 'combo',
            lazyInit: false,
            fieldLabel: config.htcConfig.locData.SearchType,
            anchor: '100%',
            itemId: 'searchType',
            store: searchTypesStore,
            mode: 'local',
            displayField: 'label',
            tpl: '<tpl for="."><div class="x-combo-list-item">{label:htmlEncode}</div></tpl>',
            valueField: 'index',
            editable: false,
            autoSelect: false,
            triggerAction: 'all',
            allowBlank: false,
            value: 0,
            listeners: {
                select: function (combo, record, index) {
                    searchForm.getComponent('content_search_pattern').setDisabled(combo.getValue() > 0);
                }
            }
        }, {
            xtype: 'textfield',
            fieldLabel: config.htcConfig.locData.SearchFileDetails,
            itemId: 'details_search_pattern',
            hidden: !config.htcConfig.searchCriterions.details,
            hideLabel: !config.htcConfig.searchCriterions.details,
            anchor: '100%'
        }, {
            xtype: 'textfield',
            fieldLabel: config.htcConfig.locData.SearchFileContent,
            itemId: 'content_search_pattern',
            hidden: !config.htcConfig.searchCriterions.content,
            hideLabel: !config.htcConfig.searchCriterions.content,
            anchor: '100%'
        }, {
            xtype: 'container',
            layout: 'column',
            anchor: '100%',
            hidden: !config.htcConfig.searchCriterions.date,
            hideLabel: !config.htcConfig.searchCriterions.date,
            fieldLabel: config.htcConfig.locData.CommonFieldLabelDate,
            itemId: 'dateRange',
            defaults: {
                xtype: 'container',
                layout: 'form',
                labelWidth: 30
            },
            items: [{
                columnWidth: .52,
                itemId: 'column1',
                items: [{
                    anchor: '95%',
                    fieldLabel: config.htcConfig.locData.SearchByDateFrom,
                    xtype: 'datefield',
                    format: config.htcConfig.USADateFormat ? 'm/d/Y' : 'd/m/Y',
                    itemId: 'date_search_pattern_field_from'
                }]
            }, {
                columnWidth: .48,
                itemId: 'column2',
                items: [{
                    anchor: '100%',
                    fieldLabel: config.htcConfig.locData.SearchByDateTo,
                    xtype: 'datefield',
                    format: config.htcConfig.USADateFormat ? 'm/d/Y' : 'd/m/Y',
                    itemId: 'date_search_pattern_field_to'
                }]
            }]
        }, {
            xtype: 'radiogroup',
            itemId: 'searchScope',
            fieldLabel: config.htcConfig.locData.SearchLocation,
            items: [{
                dataIndex: 'entrie',
                boxLabel: config.htcConfig.locData.SearchLocationEntire,
                name: 'rb-auto',
                inputValue: 'entire'
            }, {
                dataIndex: 'current',
                boxLabel: config.htcConfig.locData.SearchLocationCurrent,
                name: 'rb-auto',
                inputValue: 'current',
                checked: true
            }]
        }, gridSearch = new Ext.grid.GridPanel({
            showHeader: false,
            hideLabel: true,
            flex: 1,
            style: {
                borderBottomWidth: '1px',
                borderTopWidth: '1px'
            },
            anchor: gridSearchAnchor,
            store: searchStore,
            columns: [{
                header: config.htcConfig.locData.CommonFieldLabelName,
                id: 'name',
                width: 200,
                sortable: true,
                dataIndex: 'name',
                renderer: config.getRenderers().searchNameRenderer
            }, {
                header: config.htcConfig.locData.CommonFieldLabelPath,
                id: 'path',
                sortable: true,
                dataIndex: 'path',
                renderer: config.getRenderers().htmlEncodedRenderer
            }],
            stripeRows: true,
            autoExpandColumn: 'path',
            listeners: {
                rowdblclick: searchGridRowAction
            }
        })]
    });

    config.getFileManager().searchGridRowAction = searchGridRowAction;

    var searchWindow = new config.Window({
        title: String.format(config.htcConfig.locData.SearchTitle, '*, ?'),
        closeAction: 'hide',
        width: 400,
        height: 400,
        minWidth: 300,
        minHeight: 250,
        maximizable: true,
        layout: 'fit',
        plain: true,
        collapsible: true,
        closable: true,
        bodyStyle: 'padding:5px;',
        items: searchForm,
        keys: {
            key: [
                Ext.EventObject.ENTER,
                Ext.EventObject.RETURN,
                Ext.EventObject.ESC
            ],
            fn: function (e) {
                if (e == Ext.EventObject.ENTER || e == Ext.EventObject.RETURN) {
                    searchHandler();
                } else if (e == Ext.EventObject.ESC) {
                    searchWindow.hide();
                }
            },
            scope: this
        },
        bbar: new Ext.Toolbar({
            items: [searchWindowFirstBtn = new Ext.Button({
                tooltip: config.htcConfig.locData.PagingToolbarFirstText,
                overflowText: config.htcConfig.locData.PagingToolbarFirstText,
                iconCls: 'x-tbar-page-first',
                disabled: true,
                handler: function () {
                    searchStore.setBaseParam('startTopFolder', null);
                    searchStore.setBaseParam('startFilePath', null);
                    searchStore.setBaseParam('searchDirection', 'forward');
                    searchStore.setBaseParam('fwws', true);
                    curPage = 0;
                    lastForward = true;
                    searchStore.setBaseParam('skip', curPage * searchStore.maxFileNumber);
                    searchStore.reload();
                }
            }), searchWindowPrevBtn = new Ext.Button({
                tooltip: config.htcConfig.locData.PagingToolbarPrevText,
                overflowText: config.htcConfig.locData.PagingToolbarPrevText,
                iconCls: 'x-tbar-page-prev',
                disabled: true,
                handler: function () {
                    searchStore.setBaseParam('startTopFolder', searchStore.firstTopFolder);
                    searchStore.setBaseParam('startFilePath', searchStore.firstFilePath);
                    searchStore.setBaseParam('searchDirection', 'backwards');
                    searchStore.setBaseParam('fwws', lastForward);
                    if (lastForward) curPage--;
                    else curPage++;
                    if (curPage < 0) curPage = 0;
                    searchStore.setBaseParam('skip', curPage * searchStore.maxFileNumber);
                    searchStore.reload();
                }
            }), searchWindowNextBtn = new Ext.Button({
                tooltip: config.htcConfig.locData.PagingToolbarNextText,
                overflowText: config.htcConfig.locData.PagingToolbarNextText,
                iconCls: 'x-tbar-page-next',
                disabled: true,
                handler: function () {
                    searchStore.setBaseParam('startTopFolder', searchStore.lastTopFolder);
                    searchStore.setBaseParam('startFilePath', searchStore.lastFilePath);
                    searchStore.setBaseParam('searchDirection', 'forward');
                    searchStore.setBaseParam('fwws', lastForward);
                    if (lastForward) curPage++;
                    else curPage--;
                    if (curPage < 0) curPage = 0;
                    searchStore.setBaseParam('skip', curPage * searchStore.maxFileNumber);
                    searchStore.reload();
                }
            }), searchWindowLastBtn = new Ext.Button({
                tooltip: config.htcConfig.locData.PagingToolbarLastText,
                overflowText: config.htcConfig.locData.PagingToolbarLastText,
                iconCls: 'x-tbar-page-last',
                disabled: true,
                handler: function () {
                    searchStore.setBaseParam('startTopFolder', null);
                    searchStore.setBaseParam('startFilePath', null);
                    searchStore.setBaseParam('searchDirection', 'backwards');
                    searchStore.setBaseParam('fwws', false);
                    curPage = 0;
                    lastForward = false;
                    searchStore.setBaseParam('skip', curPage * searchStore.maxFileNumber);
                    searchStore.reload();
                }
            })]
        }),
        listeners: {
            show: function (wind) {
                var fnf = searchForm.getComponent('fileName');
                if (fnf) fnf = fnf.getComponent('name_search_pattern');
                if (fnf) fnf.focus(true, 700);
            }
        },
        initQuickSearch: function (namePattern, contentPattern) {
            if (Ext.isEmpty(namePattern) && (!config.htcConfig.searchCriterions.content || Ext.isEmpty(contentPattern))) {
                return;
            }
            // fill fields from quick search handler
            if (busy) {
                Ext.Ajax.abort();
            }
            setTimeout(function () {
                if (!searchForm) {
                    return;
                }
                searchForm.getComponent('fileName').getComponent('name_search_pattern').setValue(Ext.isEmpty(namePattern) ? null : namePattern);
                searchForm.getComponent("details_search_pattern").reset();
                searchForm.getComponent("content_search_pattern").setValue(Ext.isEmpty(contentPattern) ? null : contentPattern);
                searchForm.getComponent('dateRange').getComponent('column1').getComponent('date_search_pattern_field_from').reset();
                searchForm.getComponent('dateRange').getComponent('column2').getComponent('date_search_pattern_field_to').reset();
                var scope, curFolder = config.getCurrentFolder();
                var vl = searchForm.getComponent('searchScope').getValue();
                if (curFolder && curFolder != null && curFolder != 'root') {
                    searchForm.getComponent('searchScope').setValue('current', true);
                } else {
                    searchForm.getComponent('searchScope').setValue('entrie', true);
                }
                searchForm.getComponent('searchType').setValue(Ext.isEmpty(namePattern) ? 0 : 2);
                setTimeout(searchHandler, 100);
            }, 300);
        },
        loadstart: function () {
            Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;

            searchWindow.body.mask(config.htcConfig.locData.ProgressSearching + '...');
            searchWindow.setIconClass('loading-indicator');
            searchWindow.searchWindowDisableAllButtons();

            busy = true;
        },
        loadfailed: function (proxy, type, action, options, res, arg) {
            busy = false;

            Ext.Ajax.timeout = searchStore.defaultRequestTimeout;

            searchBtnPressed = false;
            searchWindow.searchWindowDisableAllButtons();
            searchStore.firstFilePath = null;
            searchStore.lastFilePath = null;
            searchStore.firstTopFolder = null;
            searchStore.lastTopFolder = null;
            searchWindow.setIconClass('');
            searchWindow.body.unmask();

            if (type === 'remote' && res) {
                var message = "Message: " + Ext.util.Format.htmlEncode(Ext.isEmpty
                    ? config.htcConfig.locData.UploadFromUrlUnknownResponse : res.message);
                if (res.xhr)
                    message = "Status: " + Ext.util.Format.htmlEncode(res.xhr.status)
                        + " " + Ext.util.Format.htmlEncode(res.xhr.statusText)
                        + "<br />" + message;
                config.Msg.show({
                    title: htcConfig.locData.SearchErrorCaption,
                    closable: true,
                    modal: true,
                    msg: message,
                    icon: config.Msg.ERROR,
                    buttons: config.Msg.CANCEL
                });
            }
        },
        loadsucceed: function (store, records, options) {
            busy = false;

            Ext.Ajax.timeout = store.defaultRequestTimeout;

            searchWindow.setIconClass('');
            searchWindow.body.unmask();
            searchWindow.searchWindowEnableAllButtons();

            if (records.length > 0) {
                var ind = records.length - 1;
                searchStore.firstFilePath = records[0].data.path + '/' + records[0].data.name
                    + (records[0].data.isFolder ? '/' : '');
                searchStore.lastFilePath = records[ind].data.path + '/' + records[ind].data.name
                    + (records[ind].data.isFolder ? '/' : '');
                searchStore.firstTopFolder = records[0].data.topFolder;
                searchStore.lastTopFolder = records[ind].data.topFolder;

                // if new search, First or Last Page command
                if (options.params.startFilePath == null && options.params.startTopFolder == null) {
                    if (options.params.searchDirection == 'forward') {
                        searchWindowPrevBtn.disable();
                    } else {
                        searchWindowNextBtn.disable();
                    }
                }

                // The server returns less than searchStore.maxFileNumber files
                // only if there are no more files matching the search criteria.
                if (records.length < searchStore.maxFileNumber) {
                    if (options.params.searchDirection == 'forward') {
                        searchWindowNextBtn.disable();
                    } else {
                        searchWindowPrevBtn.disable();
                    }
                }
            } else {
                searchStore.firstFilePath = null;
                searchStore.lastFilePath = null;
                searchStore.firstTopFolder = null;
                searchStore.lastTopFolder = null;
                searchWindowPrevBtn.disable();
                searchWindowNextBtn.disable();
            }

            var msg, wrn, q, icon, caption, onlyWarn = false;
            if (store && store.reader && store.reader.jsonData) {
                ////<debug>
                //var elapsed = store.reader.jsonData.elapsed;
                //if (!!window.conosle && !!window.console.log && !Ext.isEmpty(elapsed) && elapsed.trim().length > 0) {
                //    window.console.log('Search Elapsed: ' + elapsed + ' c.');
                //}
                ////</debug>
                var msg = store.reader.jsonData.message;
                wrn = store.reader.jsonData.warning;
                q = store.reader.jsonData.query;
                if (!Ext.isEmpty(msg)) {
                    icon = config.Msg.ERROR;
                    caption = config.htcConfig.locData.SearchErrorCaption;
                }
            }
            if (searchBtnPressed && records.length <= 0 && Ext.isEmpty(msg)) {
                msg = config.htcConfig.locData.SearchNothingFound;
                icon = config.Msg.WARNING;
                caption = config.htcConfig.locData.CommandSearch;
            }
            if (Ext.isEmpty(msg) && searchBtnPressed && !Ext.isEmpty(wrn)) {
                msg = wrn;
                icon = config.Msg.WARNING;
                caption = config.htcConfig.locData.CommandSearch;
                onlyWarn = true;
            }
            if (!Ext.isEmpty(msg)) {
                config.Msg.show({
                    title: caption,
                    msg: msg
                        + (onlyWarn || Ext.isEmpty(wrn) ? '' : ('<br /><br />' + wrn))
                        + (Ext.isEmpty(q) ? '' : ('<br /><br />' + q)),
                    closable: true,
                    modal: true,
                    buttons: config.Msg.CANCEL,
                    icon: icon
                });
            }
            searchBtnPressed = false;
        },
        searchWindowDisableAllButtons: function () {
            searchWindowFirstBtn.disable();
            searchWindowPrevBtn.disable();
            searchWindowNextBtn.disable();
            searchWindowLastBtn.disable();
        },
        searchWindowEnableAllButtons: function () {
            searchWindowFirstBtn.enable();
            searchWindowPrevBtn.enable();
            searchWindowNextBtn.enable();
            searchWindowLastBtn.enable();
        }
    });

    searchStore.on('beforeload', searchWindow.loadstart, searchWindow);
    searchStore.on('exception', searchWindow.loadfailed, searchWindow);
    searchStore.on('load', searchWindow.loadsucceed, searchWindow);

    return searchWindow;
};