Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Window, $(), getUid(),
getAppRootUrl(), getIsEmbeddedtoIFRAME(),
globalLoadMask, Msg, openTreeRecent()
*/
HttpCommander.Lib.FlashViewerWindow = function(config) {
    var flashTemplate = "<OBJECT id='{0}_FlashViewer' type='application/x-shockwave-flash' codeBase='http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab' data='{1}Handlers/Download.ashx?action=view&file={2}&rid={3}' width='{4}' height='{5}' classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' VIEWASTEXT>\
<PARAM NAME='BGColor' VALUE='#DFE8F6'>\
<PARAM NAME='Movie' VALUE='{1}Handlers/Download.ashx?action=view&file={2}&rid={3}'>\
<PARAM NAME='Src' VALUE='{1}Handlers/Download.ashx?action=view&file={2}&rid={3}'>\
<PARAM NAME='WMode' VALUE='transparent'>\
<PARAM NAME='Quality' VALUE='high'>\
<embed wmode='transparent' bgcolor='#DFE8F6' id='{0}_FlashViewer' name='{0}_FlashViewer' src='{1}Handlers/Download.ashx?action=view&file={2}&rid={3}' quality='high' pluginspage='http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash' type='application/x-shockwave-flash' width='{4}' height='{5}'></embed>\
</OBJECT>";
    var self = new config.Window({
        modal: true,
        maximizable: true,
        closeAction: 'hide',
        layout: 'fit',
        minHeight: 50,
        minWidth: 50,
        plain: true,
        title: '',
        listeners: {
            hide: function(wind) {
                wind.restore();
                HttpCommander.Lib.Utils.removeElementFromDOM(config.$('FlashViewer'));
                wind.update('');
            }
        },
        showFlash: function(folder, name, w, h) {
            w = w < 0 ? 400 : w;
            h = h < 0 ? 200 : h;
            self.removeListener('resize', self.resizeFlashObject, self);
            self.hide();
            self.setTitle(Ext.util.Format.htmlEncode(name));
            var flashHtml = HttpCommander.Lib.Utils.flashPlayerIsSupported() ? String.format(flashTemplate,
                config.getUid(),
                config.getAppRootUrl(),
                encodeURIComponent(folder + '/' + name),
                (new Date()).getTime(),
                w,
                h
            ) : HttpCommander.Lib.Consts.needInstallAdobeFlashPlayerMessage;
            if (self.rendered) {
                self.update(flashHtml);
                self.setWidth(w + self.getWidth() - self.body.getWidth(true));
                self.setHeight(h + self.getHeight() - self.body.getHeight(true));
            } else {
                self.html = flashHtml;
            }
            self.show();
            self.addListener('resize', self.resizeFlashObject, self);
            self.center();
        },
        resizeFlashObject: function() {
            var flashObj = document[config.$('FlashViewer')];
            if (!flashObj) {
                flashObj = document.getElementById(config.$('FlashViewer'));
            }
            if (flashObj) {
                flashObj.width = self.body.getWidth(true);
                flashObj.height = self.body.getHeight(true);
            }
        },
        getFlashSize: function(folder, name) {
            self.hide();
            var fileInfo = {
                path: '',
                name: ''
            };
            fileInfo.path = String(folder);
            fileInfo.name = String(name);
            if (fileInfo.path == '' || fileInfo.name == '')
                return;
            config.globalLoadMask.msg = config.htcConfig.locData.GettingSizeFlashMovie + '...';
            config.globalLoadMask.show();
            HttpCommander.Common.GetSWFSize(fileInfo, function(data, trans) {
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                var w = 0, h = 0, error = null;
                if (typeof data == 'undefined') {
                    error = Ext.util.Format.htmlEncode(trans.message);
                } else if (!data.success) {
                    error = data.message || data.msg;
                } else {
                    w = data.width;
                    h = data.height;
                }
                if (h > 0 && w > 0) {
                    self.showFlash(folder, name, w, h);
                    config.openTreeRecent();
                } else {
                    error = 'Wrong SWF size';
                }
                if (error) {
                    config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, error);
                }
            });
        }
    });
    return self;
};