Ext.ns('HttpCommander.Lib');

/* config: htcConfig, getAppRootUrl(), getCurrentFolder(), openTreeRecent()
*/
HttpCommander.Lib.iOSUpload = function(config) {
    var self = new Ext.FormPanel({
        frame: false,
        bodyStyle: 'padding: 5px 5px 0px 5px;',
        border: false,
        bodyBorder: false,
        header: false,
        defaults: { anchor: '100%' },
        items:
        [
            {
                xtype: 'label',
                html: '<br/><a href="http://itunes.apple.com/ru/app/aurigma-up/id432611633?mt=8">'
                    + config.htcConfig.locData.UploadMobileAurigmaLink + '</a><br/>'
                    + config.htcConfig.locData.UploadMobileAurigmaReady + '<br/>'
            },
            {
                xtype: 'textfield',
                value: (typeof config.htcConfig.currentUserDomain != 'undefined' && config.htcConfig.currentUserDomain.trim().length > 0
                    ? (config.htcConfig.currentUserDomain + '_') : '') + config.htcConfig.currentUser + '_',
                fieldLabel: config.htcConfig.locData.UploadMobileAurigmaFilePrefix,
                width: 150
            }
        ],
        buttons:
        [
            {
                text: config.htcConfig.locData.UploadSimpleUpload,
                handler: function() {
                    var cookies = 'cookies=ASP.NET_SessionId%3D'
                        + encodeURIComponent(HttpCommander.Lib.Utils.getCookie("ASP.NET_SessionId", true));
                    cookies += '%3B.ASPXAUTH%3D'
                        + encodeURIComponent(HttpCommander.Lib.Utils.getCookie(".ASPXAUTH", true));
                    var returnUrl = encodeURIComponent(config.getAppRootUrl()
                        + 'Default.aspx?Mobile=standard&folder='
                        + encodeURIComponent(config.getCurrentFolder()));
                    var uploadUrl = 'aurup:?licenseKey=79FF0-00040-44BA0-000E5-8EA73-3F6BCF&VideoMode=source&uploadUrl='
                        + config.getAppRootUrl() + 'Handlers/Upload.ashx&fields=path%3D'
                        + encodeURIComponent(config.getCurrentFolder()) + '%3Bprefix%3D'
                        + encodeURIComponent(self.getForm().items.items[0].getValue())
                        + '&redirectUrl=' + returnUrl + '&returnUrl=' + returnUrl + '&' + cookies;
                    window.location = uploadUrl;
                }
            }
        ]
    });
    
    return self;
};