Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, name, getIsEmbeddedtoIFRAME(), getEmbedded(), getIsUSA(),
    getRenderers(), store
*/
HttpCommander.Lib.FileModificationsWindow = function(config) {
    var self = new config.Window({
        title: Ext.util.Format.htmlEncode(String.format(
            config.htcConfig.locData.FileModificationsWindowTitle, config.name)
        ),
        autoDestroy: true,
        border: false,
        plain: true,
        boxMinHeight: 250,
        boxMinWidth: config.getIsEmbeddedtoIFRAME() ? 300 : 450,
        layout: {
            type: 'vbox',
            align: 'stretch',
            padding: 0
        },
        modal: true,
        resizable: true,
        closeAction: 'close',
        maximizable: !config.getEmbedded(), //true,
        width: config.getIsEmbeddedtoIFRAME() ? 350 : 500,
        height: 250,
        items:
        [
            new Ext.grid.GridPanel({
                header: false,
                loadMask: false,
                store: new Ext.data.JsonStore({
                    autoSave: false,
                    remoteSort: false,
                    pruneModifiedRecords: false,
                    autoLoad: true,
                    autoDestroy: true,
                    data: config.store,
                    isUSA: config.getIsUSA(),
                    fields:
                    [
                        { name: 'type', type: 'string' },
                        { name: 'user', type: 'string' },
                        { name: 'date', type: 'date'   },
                        { name: 'size', type: 'string' },
                        { name: 'path', type: 'string' }
                    ]
                }),
                columns:
                [
                    {
                        id: 'type-modifications',
                        sortable: true,
                        header: config.htcConfig.locData.CommonFieldLabelType,
                        dataIndex: 'type',
                        width: 60,
                        renderer: function(val) {
                            var v = (val || '').toString().toLowerCase();
                            switch (v) {
                                case 'created': return config.htcConfig.locData.FileModificationsTypeCreated;
                                case 'modified': return config.htcConfig.locData.FileModificationsTypeModified;
                                case 'renamed': return config.htcConfig.locData.FileModificationsTypeRenamed;
                                case 'restored': return config.htcConfig.locData.FileModificationsTypeRestored;
                                case 'deleted': return config.htcConfig.locData.FileModificationsTypeDeleted;
                                default: return '';
                            }
                        }
                    },
                    {
                        id: 'user-modifications',
                        sortable: true,
                        header: config.htcConfig.locData.CommonFieldLabelUser,
                        dataIndex: 'user',
                        renderer: function (val) {
                            var user = HttpCommander.Lib.Utils.parseUserName(val);
                            return config.getRenderers().htmlEncodedRenderer(user);
                        },
                        width: 70
                    },
                    {
                        id: 'date-modifications',
                        sortable: true,
                        header: config.htcConfig.locData.CommonFieldLabelDate,
                        dataIndex: 'date',
                        width: 125,
                        renderer: config.getRenderers().dateRendererLocal
                    },
                    {
                        id: 'size-modifications',
                        sortable: true,
                        header: config.htcConfig.locData.CommonFieldLabelSize,
                        dataIndex: 'size',
                        width: 80,
                        renderer: config.getRenderers().sizeRenderer
                    },
                    {
                        id: 'path-modifications',
                        sortable: true,
                        header: config.htcConfig.locData.CommonFieldLabelPath,
                        dataIndex: 'path',
                        width: 80,
                        renderer: config.getRenderers().wordWrapRenderer
                    }
                ],
                autoExpandColumn: 'path-modifications',
                flex: 1,
                stripeRows: true
            })
        ],
        buttons:
        [
            {
                text: config.htcConfig.locData.CommonButtonCaptionClose,
                handler: function() { self.close(); }
            }
        ]
    });
    return self;
};