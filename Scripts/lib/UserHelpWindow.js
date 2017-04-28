Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, getIsEmbeddedtoIFRAME(),
getAppRootUrl(), generateUrlHelp()
*/
HttpCommander.Lib.UserHelpWindow = function(config) {
    var self = new config.Window({
        title: config.htcConfig.locData.UserHelpTitle,
        closable: true,
        closeAction: 'hide',
        minimizable: false,
        maximizable: true,
        width: config.getIsEmbeddedtoIFRAME() ? 350 : 600,
        height: config.getIsEmbeddedtoIFRAME() ? 250 : 350,
        plain: true,
        html: '<iframe style="background-color: #FFFFFF;" scrolling="yes" width="100%" height="100%" '
            + 'border="0" src="' + config.generateUrlHelp(null, true) + '"></iframe>',
        generateIFrameHelp: function(anchor) {
            return '<iframe style="background-color: #FFFFFF;" scrolling="yes" width="100%" height="100%" border="0" src="'
                + config.generateUrlHelp(anchor)
                + '"></iframe>';
        },
        initialize: function(anchor) {
            self.hide();
            var help_html = self.generateIFrameHelp(anchor);
            self.html = help_html;
            self.show();
            self.update(help_html);
        }
    });
    return self;
};