Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, globalLoadMask, getUid(), $,
    getMaxWidthThumb(), getMaxHeightThumb(), getCurrentFolder(), getView(),
    getFileManager(), ProcessScriptError(), getThumbnailTpl(), openTreeRecent()
*/
HttpCommander.Lib.ImageViewerWindow = function(config) {
    var imageViewSingle, imageViewThumbnails;
    var toolbarHeight = 27;
    var imageViewerThumbnailsHeight = config.getMaxHeightThumb() + 33 + 2 * toolbarHeight;
    var imageViewerSingleHeight = '100% -' + imageViewerThumbnailsHeight;
    
    var imageViewerDelayedSlideTask = new Ext.util.DelayedTask(function() {
        if (imageViewThumbnails) {
            var sm = imageViewThumbnails.getSelectionModel();
            if (sm) {
                self.selectNextImageInImageViewer(sm);
                var sRow = sm.getSelected();
                var gStore = imageViewThumbnails.getStore();
                if (gStore.indexOf(sRow) >= gStore.getCount() - 1) {
                    //var sh = imageViewThumbnails.getTopToolbar().getComponent('play-stop-images-btn');
                    var sh = imageViewSingle.getBottomToolbar().getComponent('play-stop-images-btn');
                    sh.toggle(false, false);
                }
                return;
            }
        }
        imageViewerDelayedSlideTask.cancel();
    });

    var imageViewerNavTabCfg = {
        enableOverflow: true,
        buttonAlign: 'center',
        html: '<div style="position:relative;height:0px;">'
            + '<div id="' + config.$('image-simple-info')
            + '" style="text-align:left;top:4px;position:absolute;left:1px;float:left;">'
            + '</div></div>',
        items:
        [
            {
                itemId: 'first-image-btn',
                iconCls: 'x-tbar-page-first',
                tooltip: config.htcConfig.locData.ImageViewerFirstImageTip,
                handler: function() { self.selectFirstImageInImageViewer(); }
            },
            {
                itemId: 'prev-image-btn',
                iconCls: 'x-tbar-page-prev',
                tooltip: config.htcConfig.locData.ImageViewerPreviousImageTip,
                handler: function() { self.selectPreviousImageInImageViewer(); }
            },
            {
                itemId: 'play-stop-images-btn',
                enableToggle: true,
                icon: config.htcConfig.relativePath + 'Images/play.png',
                tooltip: config.htcConfig.locData.ImageViewerRunSlideShow,
                disabled: true,
                toggleHandler: function(item, pressed) {
                    item.setIcon(config.htcConfig.relativePath
                        + 'Images/' + (pressed ? 'stop' : 'play') + '.png'
                    );
                    item.setTooltip(
                        pressed
                        ? config.htcConfig.locData.ImageViewerStopSlideShow
                        : config.htcConfig.locData.ImageViewerRunSlideShow
                    );
                    imageViewSingle.slideShow = pressed;
                    if (pressed)
                        imageViewerDelayedSlideTask.delay(4000);
                    else
                        imageViewerDelayedSlideTask.cancel();
                }
            },
            {
                itemId: 'next-image-btn',
                iconCls: 'x-tbar-page-next',
                tooltip: config.htcConfig.locData.ImageViewerNextImageTip,
                handler: function() { self.selectNextImageInImageViewer(); }
            },
            {
                itemId: 'last-image-btn',
                iconCls: 'x-tbar-page-last',
                tooltip: config.htcConfig.locData.ImageViewerLastImageTip,
                handler: function() { self.selectLastImageInImageViewer(); }
            }
        ]
    };

    var self = new config.Window({
        modal: true,
        maximizable: true,
        closeAction: 'hide',
        layout: 'fit',
        width: 640,
        height: 480,
        plain: true,
        items:
        [
            new Ext.form.FormPanel({
                plain: true,
                layout: 'border',
                border: false,
                frame: false,
                baseCls: 'x-plain',
                items:
                [
                    imageViewSingle = new Ext.Panel({
                        anchor: imageViewerSingleHeight,
                        autoScroll: true,
                        baseCls: 'x-plain',
                        region: 'center',
                        border: false,
                        frame: false,
                        bodyCfg: { tag: 'center' },
                        bbar: new Ext.Toolbar(imageViewerNavTabCfg),
                        tpl: new Ext.Template(
                            '<table border="0" cellpadding="0" cellspacing="0" '
                            + 'style="border:0px;padding:0px;margin:0px;width:100%;height:100%;vertical-align:middle;text-align:center;">'
                            + '<tr><td>{content}</td></tr></table>'),
                        listeners: {
                            resize: function(panel, adjWidth, adjHeight, rawWidth, rawHeight) {
                                var img = panel.body.dom.getElementsByTagName('img')[0];
                                if (img && img.complete) {
                                    self.changeImageSize(
                                        img,
                                        false,
                                        {
                                            width: adjWidth || panel.getWidth(),
                                            height: adjHeight || panel.getHeight()
                                        },
                                        panel.naturalImgSize
                                    );
                                }
                            }
                        }
                    }),
                    imageViewThumbnails = new Ext.grid.GridPanel({
                        autoScroll: true,
                        height: imageViewerThumbnailsHeight,
                        keys: {
                            key:
                            [
                                Ext.EventObject.LEFT,
                                Ext.EventObject.RIGHT,
                                Ext.EventObject.HOME,
                                Ext.EventObject.END
                            ],
                            fn: function(e) {
                                switch (e) {
                                    case Ext.EventObject.LEFT:
                                        self.selectPreviousImageInImageViewer();
                                        break;
                                    case Ext.EventObject.RIGHT:
                                        self.selectNextImageInImageViewer();
                                        break;
                                    case Ext.EventObject.HOME:
                                        self.selectFirstImageInImageViewer();
                                        break;
                                    case Ext.EventObject.END:
                                        self.selectLastImageInImageViewer();
                                        break;
                                }
                                return true;
                            },
                            scope: this,
                            stopEvent: true
                        },
                        //tbar: new Ext.Toolbar(imageViewerNavTabCfg),
                        view: new HttpCommander.Lib.ThumbView({
                            htcCfg: config.htcConfig,
                            maxWidthThumb: config.getMaxWidthThumb(),
                            maxHeightThumb: config.getMaxHeightThumb(),
                            tpl: config.getThumbnailTpl(),
                            htcUid: config.getUid(),
                            rowSelector: 'div.thumbnailedItem',
                            listeners: {
                                refresh: function(gView) {
                                    var grd = imageViewThumbnails;
                                    var crs = grd.getStore().getCount();
                                    //var tb = grd.getTopToolbar();
                                    var tb = imageViewSingle.getBottomToolbar();
                                    if (tb) {
                                        tb.getComponent('first-image-btn').setDisabled(crs <= 0);
                                        tb.getComponent('prev-image-btn').setDisabled(crs <= 0);
                                        tb.getComponent('next-image-btn').setDisabled(crs <= 0);
                                        tb.getComponent('last-image-btn').setDisabled(crs <= 0);
                                        tb.getComponent('play-stop-images-btn').setDisabled(crs <= 1);
                                    }
                                    var row = gView.getRow(0);
                                    if (row) {
                                        var w = crs * (row.offsetWidth + 10);
                                        gView.mainBody.setWidth(w);
                                        grd.getColumnModel().setColumnWidth(0, w);
                                    }
                                }
                            }
                        }),
                        //header: false,
                        hideHeaders: true,
                        collapsible: true,
                        region: 'south',
                        anchor: '100%',
                        autoWidth: true,
                        enableColumnResize: false,
                        bodyCfg: { tag: 'center' },
                        trackMouseOver: false,
                        columns: [{ dataIndex: 'name'}],
                        store: new Ext.data.JsonStore({
                            fields: ['name', 'icon', 'rowtype', 'datemodified', 'size', 'size_hidden'],
                            data: []
                        }),
                        selModel: new Ext.grid.RowSelectionModel({
                            singleSelect: true,
                            listeners: {
                                beforerowselect: function(sm, rowIndex, keepExisting, record) {
                                    if (self.needLoadImage === true) {
                                        imageViewSingle.el.mask(
                                            config.htcConfig.locData.ImageViewerLoadingImageMessage + "...",
                                            "x-mask-loading"
                                        );
                                    }
                                    return true;
                                },
                                rowselect: function(sm, rnum, rec) {
                                    var gView = imageViewThumbnails.getView();

                                    if (self.needLoadImage === true) {
                                        var fileDate = '';
                                        if (Ext.isDate(rec.data.datemodified)) {
                                            fileDate = 'date=' + rec.data.datemodified.getTime() + '&';
                                        }
                                        var url = config.htcConfig.relativePath
                                            + "Handlers/Download.ashx?" + fileDate + "action=view&file="
                                            + encodeURIComponent(config.getCurrentFolder()) + "/"
                                            + encodeURIComponent(rec.data.name);
                                        if (imageViewSingle.slideShow === true)
                                            imageViewerDelayedSlideTask.cancel();
                                        imageViewSingle.update({
                                            content: '<img onload="HttpCommander.Main.FileManagers' + "['" + config.getUid() + "'].changeImageSize(this);" + '"' +
                                                     'onclick="HttpCommander.Main.FileManagers' + "['" + config.getUid() + "'].showImageRealSize(this);" + '"' +
                                                     'onerror="HttpCommander.Main.FileManagers' + "['" + config.getUid() + "'].imageLoadError(this);" + '"' +
                                                     'style="background-color:Transparent;visibility:hidden;" align="absmiddle" src="' + url + '" />'
                                        });
                                    }
                                    self.needLoadImage = true;

                                    //var tb = imageViewThumbnails.getTopToolbar();
                                    var tb = imageViewSingle.getBottomToolbar();
                                    var crs = imageViewThumbnails.getStore().getCount();
                                    tb.getComponent('first-image-btn').setDisabled(rnum == 0);
                                    tb.getComponent('prev-image-btn').setDisabled(rnum == 0);
                                    tb.getComponent('next-image-btn').setDisabled(rnum == crs - 1);
                                    tb.getComponent('last-image-btn').setDisabled(rnum == crs - 1);
                                    var sh = tb.getComponent('play-stop-images-btn');
                                    if (sh) {
                                        if (rnum == crs - 1) {
                                            sh.toggle(false, false);
                                            sh.setDisabled(true);
                                        } else
                                            sh.setDisabled(false);
                                    }

                                    var rw = gView.getRow(rnum).offsetWidth + 10;
                                    var sw = (rnum * rw) + rw / 2;
                                    var gw = imageViewThumbnails.getWidth() / 2;
                                    gView.scroller.dom.scrollLeft = sw > gw ? Math.floor(sw - gw) : 0;
                                    gView.focusRow(rnum);
                                }
                            }
                        }),
                        multiSelect: false,
                        listeners: {
                            afterrender: function(grd) {
                                grd.getView().refresh(false);
                            },
                            resize: function(grd, adjWidth, adjHeight, rawWidth, rawHeight) {
                                var gView = grd.getView();
                                var sm = grd.getSelectionModel();
                                if (gView && sm && sm.hasSelection()) {
                                    var sRow = sm.getSelected();
                                    if (sRow) {
                                        var rnum = grd.getStore().indexOf(sRow);
                                        var rw = gView.getRow(rnum).offsetWidth + 10;
                                        var sw = (rnum * rw) + rw / 2;
                                        var gw = (adjWidth || grd.getWidth()) / 2;
                                        var msw = gView.scroller.dom.scrollWidth - gView.scroller.dom.clientWidth;
                                        gView.scroller.dom.scrollLeft = sw > gw ? Math.floor(sw - gw) : 0;
                                        gView.focusRow(rnum);
                                    }
                                }
                            }
                        }
                    })
                ]
            })
        ],
        listeners: {
            beforehide: function (wind) { // fix bug#1360 https://demo.element-it.com/redmine/issues/1360
                wind.restore();
                imageViewThumbnails.expand();
                wind.doLayout();
            },
            hide: function(wind) {
                wind.restore();
                wind.selectedRowNum = -1;
                var store = imageViewThumbnails.getStore();
                store.loadData([]);
                store.commitChanges();
                imageViewSingle.slideShow = false;
                imageViewerDelayedSlideTask.cancel();
                //imageViewThumbnails.getTopToolbar().getComponent('play-stop-images-btn').toggle(false, false);
                imageViewSingle.getBottomToolbar().getComponent('play-stop-images-btn').toggle(false, false);
                imageViewSingle.update({ content: '&nbsp;' });
                config.openTreeRecent();
            },
            show: function(wind) {
                if (config.getView())
                    wind.setSize(
                        Math.floor(config.getView().getWidth() * 0.8),
                        Math.floor(config.getView().getHeight() * 0.8)
                    );
                wind.center();
                self.selectThumbinalInImageViewer(wind);
            },
            render: function(wind) {
                config.getFileManager().changeImageSize = function() {
                    self.changeImageSize.apply(self, arguments);
                };
                config.getFileManager().showImageRealSize = function() {
                    self.showImageRealSize.apply(self, arguments);
                };
                config.getFileManager().imageLoadError = function() {
                    self.imageLoadError.apply(self, arguments);
                };
            }
        },
        changeImageSize: function(img, loadOrResize, size, naturalImgSize) {
            if (!img)
                return;
            if (typeof (loadOrResize) != 'boolean')
                loadOrResize = true;
            try {
                var cnt = size || imageViewSingle.getSize();
            } catch (e) {
                return;
            }
            if (loadOrResize && !imageViewSingle)
                return;
            if (!loadOrResize && !size && !naturalImgSize)
                return;
            var nis = {
                width: img.naturalWidth || img.width,
                height: img.naturalHeight || img.height
            };
            naturalImgSize = loadOrResize ? nis : naturalImgSize || nis;
            imageViewSingle.naturalImgSize = naturalImgSize;
            cnt.width -= 2;
            cnt.height -= (2 + toolbarHeight);
            var w, h;
            Ext.QuickTips.unregister(img);
            if (naturalImgSize.width > cnt.width || naturalImgSize.height > cnt.height) {
                if (naturalImgSize.width >= naturalImgSize.height) {
                    w = cnt.width;
                    h = naturalImgSize.height * w / naturalImgSize.width;
                    if (h > cnt.height) {
                        h = cnt.height;
                        w = naturalImgSize.width * h / naturalImgSize.height;
                    }
                } else {
                    h = cnt.height;
                    w = naturalImgSize.width * h / naturalImgSize.height;
                    if (w > cnt.width) {
                        w = cnt.width;
                        h = naturalImgSize.height * w / naturalImgSize.width;
                    }
                }
                Ext.QuickTips.register({
                    target: img,
                    text: config.htcConfig.locData.ImageViewerShowRealImageSize
                });
                img.realSize = false;
            } else {
                w = naturalImgSize.width;
                h = naturalImgSize.height;
                img.realSize = true;
            }
            img.style.width = String(w) + 'px';
            img.style.height = String(h) + 'px';
            if (loadOrResize) {
                imageViewSingle.el.unmask();
                img.style.visibility = 'visible';
                var info = document.getElementById(config.$('image-simple-info'));
                if (info) {
                    var gStore = imageViewThumbnails.getStore();
                    var sRow = imageViewThumbnails.getSelectionModel().getSelected();
                    var htmlInfo = '&nbsp;';
                    if (gStore && sRow)
                        htmlInfo = '<b>'
                            + String.format(config.htcConfig.locData.ImageViewerImageSimpleInfo,
                                gStore.indexOf(sRow) + 1,
                                gStore.getCount(),
                                Ext.util.Format.htmlEncode(sRow.data.name),
                                String(naturalImgSize.width) + 'x' + String(naturalImgSize.height)
                            )
                            + '</b>';
                    info.innerHTML = htmlInfo;
                }
                if (imageViewSingle.slideShow === true)
                    imageViewerDelayedSlideTask.delay(4000);
            }
        },
        selectFirstImageInImageViewer: function(sm) {
            sm = sm || imageViewThumbnails.getSelectionModel();
            sm.selectFirstRow();
        },
        selectPreviousImageInImageViewer: function(sm) {
            sm = sm || imageViewThumbnails.getSelectionModel();
            sm.selectPrevious(false);
        },
        selectNextImageInImageViewer: function(sm) {
            sm = sm || imageViewThumbnails.getSelectionModel();
            return sm.selectNext(false);
        },
        selectLastImageInImageViewer: function(sm) {
            sm = sm || imageViewThumbnails.getSelectionModel();
            sm.selectLastRow(false);
        },
        selectThumbinalInImageViewer: function(wind, thumbs) {
            wind = wind || self;
            thumbs = thumbs || imageViewThumbnails;
            if (wind && thumbs && typeof wind.selectedRowNum == "number" && wind.selectedRowNum >= 0) {
                try {
                    thumbs.getSelectionModel().selectRow(wind.selectedRowNum);
                } catch (e) {
                    config.ProcessScriptError(e);
                }
            }
        },
        showImageRealSize: function(img) {
            if (img && img.complete === true) {
                Ext.QuickTips.unregister(img);
                if (imageViewSingle && imageViewSingle.naturalImgSize) {
                    if (img.realSize !== true) {
                        img.style.width = String(imageViewSingle.naturalImgSize.width) + 'px';
                        img.style.height = String(imageViewSingle.naturalImgSize.height) + 'px';
                        Ext.QuickTips.register({
                            target: img,
                            text: config.htcConfig.locData.ImageViewerShowImageSizeOfWindow
                        });
                        img.realSize = true;
                    } else
                        self.changeImageSize(img, false, imageViewSingle.getSize(),
                            imageViewSingle.naturalImgSize
                        );
                }
            }
        },
        imageLoadError: function(img) {
            if (imageViewSingle) {
                imageViewSingle.el.unmask();
                imageViewSingle.update({
                    content: '<b>' + config.htcConfig.locData.ImageViewerImageLoadErrorMessage + '</b>'
                });
                var info = document.getElementById(config.$('image-simple-info'));
                if (info) {
                    var gStore = imageViewThumbnails.getStore();
                    var sRow = imageViewThumbnails.getSelectionModel().getSelected();
                    var htmlInfo = '&nbsp;';
                    if (gStore && sRow)
                        htmlInfo = '<b>'
                            + String.format(config.htcConfig.locData.ImageViewerImageSimpleInfo,
                                gStore.indexOf(sRow) + 1,
                                gStore.getCount(),
                                Ext.util.Format.htmlEncode(sRow.data.name),
                                '...'
                            )
                            + '</b>';
                    info.innerHTML = htmlInfo;
                }
                if (imageViewSingle.slideShow === true)
                    imageViewerDelayedSlideTask.delay(4000);
            }
        },
        showImageViewer: function(record, path, store) {
            self.hide();
            var imagesData = [];
            var selectedRowNum = -1, count = 0;
            Ext.each(store.data.items, function (rec) {
                var fdsz = rec.data.size || rec.data.size_hidden, fileSZ = 0;
                if (!Ext.isEmpty(fdsz) && String(fdsz).trim().length > 0) {
                    fileSZ = parseFloat(fdsz);
                    if (isNaN(fileSZ) || !isFinite(fileSZ)) {
                        fileSZ = 0;
                    }
                }
                if (rec.data.rowtype == "file" && fileSZ > 0
                    && HttpCommander.Lib.Consts.imagesFileTypes.indexOf(
                            ";" + HttpCommander.Lib.Utils.getFileExtension(rec.data.name) + ";"
                        ) != -1) {
                    imagesData.push({
                        name: rec.data.name,
                        icon: rec.data.icon,
                        rowtype: 'file',
                        datemodified: rec.data.datemodified,
                        size: rec.data.size,
                        size_hidden: rec.data.size_hidden
                    });
                    if (rec === record) {
                        selectedRowNum = count;
                    }
                    count++;
                }
            });
            self.selectedRowNum = selectedRowNum;
            if (selectedRowNum >= 0) {
                imageViewSingle.el.mask(config.htcConfig.locData.ImageViewerLoadingImageMessage + "...",
                    "x-mask-loading"
                );
                var fileDate = '';
                if (Ext.isDate(record.data.datemodified)) {
                    fileDate = 'date=' + record.data.datemodified.getTime() + '&';
                }
                var url = config.htcConfig.relativePath + "Handlers/Download.ashx?" + fileDate
                    + "action=view&file="
                    + encodeURIComponent(config.getCurrentFolder()) + "/"
                    + encodeURIComponent(record.data.name);
                imageViewSingle.update({
                    content: '<img onload="HttpCommander.Main.FileManagers' + "['" + config.getUid() + "'].changeImageSize(this);" + '"' +
                        'onclick="HttpCommander.Main.FileManagers' + "['" + config.getUid() + "'].showImageRealSize(this);" + '"' +
                        'onerror="HttpCommander.Main.FileManagers' + "['" + config.getUid() + "'].imageLoadError(this);" + '"' +
                        'style="background-color:Transparent;visibility:hidden;" align="absmiddle" src="' + url + '" />'
                });
                var iStore = imageViewThumbnails.getStore();
                iStore.baseParams.path = config.getCurrentFolder();
                iStore.loadData(imagesData);
                iStore.commitChanges();
                self.setTitle(String.format(config.htcConfig.locData.ImageViewerWindowTitle,
                    "\\" + Ext.util.Format.htmlEncode(path).replace(/\//g, "\\"))
                );
                self.needLoadImage = false;
                self.show();
                setTimeout(config.openTreeRecent, 1000);
            }
        }
    });
    return self;
};