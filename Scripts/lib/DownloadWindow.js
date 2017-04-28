Ext.ns('HttpCommander.Lib');

/**
 *  config: htcConfig, Msg, Window, $, appRootUrl, getMenuActions(),
 *  getUid(), getFileManager(), onJavaPowDownloadInit()
 */
HttpCommander.Lib.DownloadWindow = function(config) {
    var downloadTabs = [], downloadPanel,
        doc = document, createdFrames = [],
        createIFrame = function (url, triggerDelay) {
            setTimeout(function () {
                var frameId = Ext.id(),
                    frame = doc.createElement('iframe');
                Ext.fly(frame).set({
                    id: frameId,
                    name: frameId,
                    cls: 'x-hidden',
                    src: url
                });
                doc.body.appendChild(frame);
                createdFrames.push(frameId);
                if (Ext.isIE) try {
                    document.frames[frameId].name = frameId;
                } catch (e) { }
            }, triggerDelay);
        };

    downloadTabs.push({
        title: config.htcConfig.locData.DownloadSimpleTab,
        layout: 'fit',
        items: [
            downloadPanel = new Ext.grid.GridPanel({
                store: new Ext.data.JsonStore({
                    url: config.htcConfig.relativePath + 'Handlers/Download.ashx?list=true',
                    fields: ['name', 'path', 'icon', 'url', 'mime']
                }),
                tbar: [{
                    text: config.htcConfig.locData.CommonDownloadAll,
                    icon: HttpCommander.Lib.Utils.getIconPath(config, 'download'),
                    handler: function () {
                        var triggerDelay = 300,
                            records = downloadPanel.getStore().getRange();
                        Ext.each(records, function (item, index) {
                            createIFrame(item.get('url'), index * triggerDelay);
                        });
                    }
                }, {
                    itemId: 'zip-download',
                    text: config.htcConfig.locData.CommandZipDownload,
                    icon: HttpCommander.Lib.Utils.getIconPath(config, 'zipdownload'),
                    handler: function () {
                        config.getMenuActions().zipDownload();
                    }
                }, '->', {
                    xtype: 'displayfield',
                    value: config.htcConfig.locData.DownloadListDragFile,
                    hidden: !HttpCommander.Lib.Utils.browserIs.chrome6up || HttpCommander.Lib.Utils.browserIs.edge
                }],
                multiSelect: false,
                enableHdMenu: false,
                autoExpandColumn: 'path',
                width: 486,
                height: 242,
                columns: [{
                    id: 'name',
                    sortable: true,
                    header: config.htcConfig.locData.CommonFieldLabelName,
                    width: 120,
                    dataIndex: 'name',
                    renderer: function (value, p, r) {
                        var downUrl = Ext.util.Format.htmlEncode(r.get('mime')
                            + ':' + value + ':' + config.appRootUrl + r.get('url')).replace(/'/g, '&#39;');
                        return "<img src='" + config.htcConfig.relativePath + r.data.icon + "' class='filetypeimage'>"
                            + "<a draggable='true' ondragstart='arguments[0].dataTransfer.setData(\"DownloadURL\", \"" + downUrl + "\");' href='" + config.htcConfig.relativePath + r.data.url + "'>"
                            + Ext.util.Format.htmlEncode(value) + "</a>";
                    }
                }, {
                    id: 'path',
                    sortable: true,
                    header: config.htcConfig.locData.CommonFieldLabelPath,
                    renderer: function(value, p, r) {
                        return Ext.util.Format.htmlEncode(value || '');
                    },
                    dataIndex: 'path'
                }],
                listeners: {
                    afterrender: function (gp) {
                        gp.body.dom.setAttribute("dragenter", false);
                    }
                }
            })
        ]
    });

    if (config.htcConfig.javaDownload &&
        !HttpCommander.Lib.Utils.browserIs.edge &&
        !HttpCommander.Lib.Utils.browserIs.chrome42up) {
        downloadTabs.push({
            title: config.htcConfig.locData.DownloadJavaTab,
            itemId: 'java-download',
            style: 'margin: 4px',
            html: ''
        });
        config.getFileManager().JavaPowDownload_onAppletInit = config.onJavaPowDownloadInit;
    }

    var self = new config.Window({
        title: config.htcConfig.locData.DownloadTitle,
        layout: 'fit',
        width: 500,
        height: 300,
        modal: true,
        plain: true,
        closeAction: 'hide',
        collapsible: false,
        animCollapse: false,
        //minimizable: true,
        closable: true,
        items: new Ext.TabPanel({
            autoTabs: true,
            activeTab: 0,
            deferredRender: true,
            border: false,
            items: downloadTabs
        }),
        listeners: {
            /*minimize: function(win) {
                win.hide();
            },*/
            beforeshow: function(win) {
                downloadPanel.store.load();
                var zd = config.htcConfig.currentPerms && config.htcConfig.currentPerms.zipDownload;
                win.modal = zd;
                var tb = downloadPanel.getTopToolbar();
                var zdCmp;
                if (tb) {
                    zdCmp = tb.getComponent('zip-download');
                    if (zdCmp) {
                        zdCmp.setVisible(zd);
                    }
                }
                var jdTab = win.items.items[0].getComponent('java-download');
                if (jdTab) {
                    if (!jdTab.rendered) {
                        jdTab.html = '<div id="' + config.$('contentForJavaDownloader') + '">'
                            + String.format(HttpCommander.Lib.Consts.downloadAppletText,
                                Ext.util.Format.htmlEncode(config.appRootUrl),
                                config.getUid(),
                                config.htcConfig.twoLetterLangName
                            )
                            + '</div>';
                    } else {
                        var contentJD = document.getElementById(config.$('contentForJavaDownloader'));
                        if (contentJD)
                            contentJD.innerHTML = String.format(HttpCommander.Lib.Consts.downloadAppletText,
                                Ext.util.Format.htmlEncode(config.appRootUrl),
                                config.getUid(),
                                config.htcConfig.twoLetterLangName
                            );
                    }
                }
            },
            bodyresize: function(win, width, height) {
                var javaPowDownload = document.getElementById(config.$("javaPowDownload"));
                if (javaPowDownload) {
                    javaPowDownload.width = (width - 10);
                    javaPowDownload.height = (height - 32);
                }
            },
            hide: function(win) {
                var jdTab = win.items.items[0].getComponent('java-download'),
                    i = 0, len = 0, frm;
                if (jdTab) {
                    HttpCommander.Lib.Utils.removeElementFromDOM(config.$('javaPowDownload'));
                    var contentJD = document.getElementById(config.$('contentForJavaDownloader'));
                    if (contentJD)
                        contentJD.innerHTML = '';
                }
                if (Ext.isArray(createdFrames)) {
                    len = createdFrames.length;
                    if (len > 0) {
                        i = len - 1;
                        for (; i >= 0; i--) {
                            frm = doc.getElementById(createdFrames[i]);
                            if (frm) {
                                doc.body.removeChild(frm);
                            }
                            createdFrames.pop();
                        }
                    }
                }
            }
        }
    });

    return self;
};