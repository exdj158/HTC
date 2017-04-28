Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, getIsEmbeddedtoIFRAME(), getUid(),
*/
HttpCommander.Lib.LinksToWebFoldersWindow = function (config) {
    var window = new config.Window({
        title: config.htcConfig.locData.CommandWebFoldersLinks,
        bodyStyle: 'padding:5px',
        layout: 'form',
        modal: true,
        resizable: false,
        closeAction: 'hide',
        width: 430,
        plain: true,
        height: config.getIsEmbeddedtoIFRAME() ? 250 : 300,
        autoHeight: true,
        labelAlign: 'top',
        items: [{
            xtype: 'label',
            html: ''
        },
        {
            xtype: 'label',
            html: String.format(
                config.htcConfig.locData.LinksToWebFoldersWindowText,
                "<span><img align='absmiddle' width='16' height='16' src='"
                + HttpCommander.Lib.Utils.getIconPath(config,'webfolders')+"'>&nbsp;"
                + HttpCommander.Lib.Utils.getHelpLinkOpenTag(config.getUid(), "webfolders")
                + "Web Folders</a></span>")
            + "<hr />"
        }, {
            xtype: 'htmleditor',
            fieldLabel: config.htcConfig.locData.WebFolderLinksFieldLabel,
            autoScroll: true,
            height: 130,
            readOnly: true,
            anchor: '100%',
            enableColors: false,
            enableAlignments: false,
            enableColors: false,
            enableFont: false,
            enableFontSize: false,
            enableFormat: false,
            enableLinks: false,
            enableLists: false,
            enableSourceEdit: false
        }],
        listeners: {
            afterrender: function (wind) {
                wind.items.items[2].getToolbar().hide();
            }
        },
        buttons: [{
            text: config.htcConfig.locData.CommonButtonCaptionClose,
            handler: function () { window.hide(); }
        }],
        initialize: function (root, parent, current) {
            var window = this;
            root = root || '';
            if (root == '')
                return;

            //window.hide();
            var note = window.items.items[0];
            var links = window.items.items[2];

            // clear
            links.setValue('');
            if (note.rendered)
                note.el.dom.innerHTML = '';
            else
                note.html = '';

            // set note text
            var noteText = '';
            var isNetUse = false;
            if (HttpCommander.Lib.Utils.browserIs.win) {
                noteText += "<p>"
                    + String.format(config.htcConfig.locData.WebFolderLinksForWindows64Note,
                        "<b>",
                        "</b>",
                        "<b>" + (typeof config.htcConfig.currentUserDomain != 'undefined' && config.htcConfig.currentUserDomain.trim().length > 0
                            ? (Ext.util.Format.htmlEncode(config.htcConfig.currentUserDomain) + "\\" + Ext.util.Format.htmlEncode(config.htcConfig.currentUser))
                            : Ext.util.Format.htmlEncode(config.htcConfig.currentUser))
                            + "</b>"
                    )
                    + "</p>";
                isNetUse = true;
                root = 'net use \"*\" "<span style="font-weight:bold;">' + Ext.util.Format.htmlEncode(root);
            } else if (HttpCommander.Lib.Utils.browserIs.mac && !HttpCommander.Lib.Utils.browserIs.ios) {
                noteText = "<p>"
                    + String.format(config.htcConfig.locData.WebFolderLinksForMacOSNote, "<b>", "</b>")
                    + "</p>";
            } else if (HttpCommander.Lib.Utils.browserIs.ubuntu) {
                noteText = "<p>"
                    + String.format(config.htcConfig.locData.WebFolderLinksForUbuntuNote, "<b>", "</b>")
                    + "</p>";
                if (root.toLowerCase().indexOf("https://") == 0)
                    root = "davs://" + root.substring(8);
                else if (root.toLowerCase().indexOf("http://") == 0)
                    root = "dav://" + root.substring(7);
            }
            if (note.rendered)
                note.el.dom.innerHTML = noteText;
            else
                note.html = noteText;

            // set value for links
            if (parent && parent != '') {
                parent = root + Ext.util.Format.htmlEncode(parent);
                if (current && current != '') {
                    current = parent + "/" + Ext.util.Format.htmlEncode(current) + "/";
                    if (isNetUse)
                        current += '</span>" /savecred /persistent:yes';
                }
                parent += "/";
                if (isNetUse)
                    parent += '</span>" /savecred /persistent:yes';
            }
            if (isNetUse)
                root += '</span>" /savecred /persistent:yes';
            links.setValue(root + (
                (parent && parent != '')
                ? ("<br />" + parent + (current && current != ''
                    ? ("<br />" + current) : ""))
                : "")
            );
        }
    });
    return window;
};