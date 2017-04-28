Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, getIsEmbeddedtoIFRAME()
*/
HttpCommander.Lib.SyncWebFoldersHelpWindow = function(config) {
    var self = new config.Window({
        title: config.htcConfig.locData.CommandSyncWebFolders,
        closable: true,
        closeAction: 'hide',
        minimizable: false,
        maximizable: true,
        width: config.getIsEmbeddedtoIFRAME() ? 350 : 600,
        height: config.getIsEmbeddedtoIFRAME() ? 250 : 350,
        plain: true,
        html: '',
        initialize: function(url) {
            var iframe = '<iframe style="background-color: #FFFFFF;" scrolling="yes" width="100%" height="100%" border="0" src="'
                        + url + '"></iframe>';
            self.hide();
            self.html = iframe;
            self.show();
            self.update(iframe);
        }
    });
    return self;
};