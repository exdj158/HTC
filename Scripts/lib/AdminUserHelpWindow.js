Ext.ns('HttpCommander.Lib');

/* config: htcConfig
*/
HttpCommander.Lib.AdminUserHelpWindow = function(config) {
    var self = new Ext.Window({
        title: config.htcConfig.locData.AdminCommandHelp,
        closable: true,
        closeAction: 'hide',
        collapsible: true,
        minimizable: false,
        maximizable: true,
        width: config.htcConfig.isEmbeddedtoIFRAME ? 350 : 700,
        height: config.htcConfig.isEmbeddedtoIFRAME ? 250 : 450,
        plain: true,
        html: '<iframe style="background-color: #FFFFFF;" scrolling="yes" width="100%" height="100%" border="0" src="' + config.htcConfig.relativePath + 'Manual/adminpanel.html' + '"></iframe>'
    });
    return self;
};