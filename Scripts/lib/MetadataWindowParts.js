Ext.ns('HttpCommander.Lib');

/* config: htcConfig, getRenderers()
*/
HttpCommander.Lib.MetadataWindowParts = function(config) {
    var cbAvailableTitlesStore = new Ext.data.ArrayStore({
        id: 0,
        autoDestroy: true,
        fields: ['avlTitle'],
        data: []
    });

    var cbAvailableTitlesEditor = new Ext.form.ComboBox({
        autoSelect: true,
        allowBlank: false,
        editable: config.htcConfig.isEditingMetadataTitles,
        forceSelection: false,
        mode: 'local',
        store: cbAvailableTitlesStore,
        valueField: 'avlTitle',
        displayField: 'avlTitle',
        typeAhead: true,
        tpl:  new Ext.XTemplate(
            '<tpl for=".">',
                '<tpl if="this.isComment(avlTitle)">',
                    '<div class="x-combo-list-item" style="text-align:center;">',
                        '<span class="comment-cb-icon icon-comment">&nbsp;</span>',
                '</tpl>',
                '<tpl if="this.isComment(avlTitle) == false">',
                    '<div class="x-combo-list-item">',
                        '{avlTitle:htmlEncode}',
                '</tpl>',
                    '</div>',
            '</tpl>', {
                isComment: function (ttl) {
                    return !Ext.isEmpty(ttl) && ttl.toLowerCase() === 'comment';
                }
            }
        ),
        //tpl: '<tpl for="."><div class="x-combo-list-item">{avlTitle:htmlEncode}</div></tpl>',
        triggerAction: 'all',
        lazyRender: false,
        lazyInit: false,
        listClass: 'x-combo-list-small'
    });

    var colModelMetaDataGrid = new Ext.grid.ColumnModel( // Meta data columns, grid and window
    [
        {
            id: 'title-md',
            sortable: true,
            header: config.htcConfig.locData.FileDetailsGridTitleColumn,
            dataIndex: 'title',
            width: 85,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                if (!Ext.isEmpty(value) && value.toLowerCase() === 'comment') {
                    if (metaData) {
                        metaData.css = 'comment-cb-centered';
                    }
                    return '<span class="comment-cb-icon icon-comment">&nbsp;</span>';
                } else {
                    return Ext.util.Format.htmlEncode(value || '');
                }
            },
            editor: cbAvailableTitlesEditor
        },
        {
            id: 'value-md',
            sortable: true,
            header: config.htcConfig.locData.CommonFieldLabelValue,
            dataIndex: 'value',
            renderer: function (val, cell, rec) { // word-wrap renderer for grid cell
                return String.format(
                    "<span style='white-space:normal !important;line-height:1em;'>{0}</span>",
                    Ext.util.Format.htmlEncode(val || '').replace(/\r\n|\n\r/gi, '<br />').replace(/\n|\r|\u21B5/gi, '<br />')
                );
            },
            editor: new Ext.form.TextArea({
                allowBlank: false,
                selectOnFocus: true
            })
        },
        {
            id: 'userlastmodified-md',
            sortable: true,
            header: config.htcConfig.locData.FileDetailsGridAuthorColumn,
            dataIndex: 'userlastmodified',
            renderer: function (val) {
                var user = HttpCommander.Lib.Utils.parseUserName(val);
                return config.getRenderers().htmlEncodedRenderer(user);
            },
            editable: false
        },
        {
            id: 'datemodified-md',
            sortable: true,
            header: config.htcConfig.locData.CommonFieldLabelDateModified,
            dataIndex: 'datemodified',
            width: 110,
            renderer: config.getRenderers().dateRendererLocal,
            editable: false
        }
    ]);
    Ext.each(config.htcConfig.metaDataFields, function(item) {
        var flag = true;
        for (var i = 0; i < colModelMetaDataGrid.config.length; i++) {
            if (colModelMetaDataGrid.config[i].dataIndex == item.name.replace(/\s/gi, '_')) {
                flag = false;
                break;
            }
        }
        if (flag) {
            var column = new Ext.grid.Column({
                id: item.name.replace(/\s/gi, '_') + '-md',
                sortable: true,
                header: Ext.util.Format.htmlEncode(item.name.substring(0, 1).toUpperCase() + item.name.substring(1)),
                dataIndex: item.name,
                resizable: true,
                editable: true,
                width: item.type == 'boolean' ? 55 : 110,
                align: HttpCommander.Lib.Utils.getAlignColumn(item.type),
                xtype: HttpCommander.Lib.Utils.getXTypeColumn(item.type)
            });
            switch (item.type) {
                case "int":
                case "float":
                    column.setEditor(new Ext.form.NumberField());
                    break;
                case "boolean":
                    column.renderer = config.getRenderers().booleanRenderer;
                    break;
                case "date":
                    column.setEditor(new Ext.form.DateField({ format: 'Y-m-d H:i:s', minValue: '01/01/1970' }));
                    column.renderer = config.getRenderers().dateRendererLocal;
                    break;
                default:
                    column.setEditor(new Ext.form.TextArea({ selectOnFocus: true }));
                    column.renderer = config.getRenderers().wordWrapRenderer;
                    break;
            }
            colModelMetaDataGrid.config.push(column);
        }
    });

    return {
        'colModelMetaDataGrid': colModelMetaDataGrid,
        'cbAvailableTitlesEditor': cbAvailableTitlesEditor,
        'cbAvailableTitlesStore': cbAvailableTitlesStore
    };
};