Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, getEmails(), setEmails()
*/
HttpCommander.Lib.MailingGroupsWindow = function(config) {
    var mailingListTree;
    var window = new config.Window({
        title: config.htcConfig.locData.SendEmailBulkMailingListWindowTitle,
        height: 250,
        width: 300,
        autoScroll: true,
        plain: true,
        bodyStyle: 'padding:2px',
        header: false,
        modal: true,
        layout: 'fit',
        closeAction: 'hide',
        items:
        [
            {
                itemId: 'mailing-list-empty-label',
                xtype: 'label',
                text: ''
            },
            mailingListTree = new Ext.tree.TreePanel({
                useArrows: true,
                border: false,
                header: false,
                rootVisible: false,
                lines: false,
                frame: false,
                baseCls: 'x-plain',
                loader: new Ext.tree.TreeLoader(),
                root: { itemId: 'root-mailing-list' },              
                listeners: {
                    load: function (node) {
                        Ext.each(node.childNodes, function (el) {
                            var nodeEl = (node.ui && node.ui.getEl) ? node.ui.getEl() : undefined;
                            if (nodeEl)
                                Ext.fly(nodeEl).addClass('x-bg-free-tree-node');                           
                        });
                        if (config.htcConfig.relativePath != '')
                            Ext.each(node.childNodes, function (el) {                               
                                if (typeof el.attributes.icon !== 'undefined')
                                    el.attributes.icon = config.htcConfig.relativePath + el.attributes.icon;
                            });
                    }
                }
            })
        ],
        listeners: {
            afterrender: function(selfWindow) {
                mailingListTree.on('checkchange', selfWindow.onCheckChangeMailingList, selfWindow);
            }
        },
        buttons:
        [
            {
                text: config.htcConfig.locData.CommonButtonCaptionOK,
                handler: function() {
                    var emails = [];
//                    var emailsStr = config.getEmails();
//                    if (emailsStr)
//                        emails = emailsStr.split(/\s*[,|;|\|]\s*/);
//                    // strip user and group references from emails
//                    for (var i = 0; i < emails.length; i++) {
//                        if (emails[i].trim() == '') {
//                            emails.splice(i, 1);
//                            i--;
//                        } else {
//                            var type = emails[i].split(/\s*:\s*/)[0].trim().toLowerCase();
//                            if (type == 'group' || type == 'user') {
//                                emails.splice(i, 1);
//                                i--;
//                            } else
//                                emails[i] = emails[i].trim();
//                        }
//                    }
                    var users = ';';
                    Ext.each(mailingListTree.getRootNode().childNodes, function(node) {
                        if (node.getUI().isChecked())
                            emails.push('group:' + node.attributes.name);
                        else
                            Ext.each(node.childNodes, function(child) {
                                if (child.getUI().isChecked() && users.indexOf(';' + child.attributes.name.toLowerCase() + ';') < 0) {
                                    emails.push('user:' + child.attributes.name);
                                    users += child.attributes.name.toLowerCase() + ';';
                                }
                            });
                    });
                    config.setEmails(emails.join(','));
                    window.hide();
                }
            },
            {
                text: config.htcConfig.locData.CommonButtonCaptionCancel,
                handler: function() { window.hide(); }
            }
        ],
        onCheckChangeMailingList: function(node, checked) {
            var window = this;
            mailingListTree.un('checkchange', window.onCheckChangeMailingList, window);
            if (!node.isExpanded() && node.isExpandable())
                node.expand();
            if (node.hasChildNodes())
                Ext.each(node.childNodes, function(el) { el.getUI().toggleCheck(checked); });
            else if (node.parentNode && node.parentNode.id != mailingListTree.getComponent('root-mailing-list')) {
                var allChildInOneState = true;
                for (var i = 0; i < node.parentNode.childNodes.length; i++) {
                    if (node.parentNode.childNodes[i].getUI().isChecked() != checked) {
                        allChildInOneState = false;
                        break;
                    }
                }
                if (allChildInOneState)
                    node.parentNode.getUI().toggleCheck(checked);
                else
                    node.parentNode.getUI().toggleCheck(false);
            }
            mailingListTree.on('checkchange', window.onCheckChangeMailingList, window);
        },
        setNoteText: function(text) {
            this.getComponent('mailing-list-empty-label').setText(text);
        },
        setGroups: function(groups) {
            var window = this;
            var node = new Ext.tree.AsyncTreeNode({
                itemId: 'root-mailing-list',
               
                expanded: true,
                children: groups
            });
            mailingListTree.setRootNode(node);
        }
    });
    return window;
};