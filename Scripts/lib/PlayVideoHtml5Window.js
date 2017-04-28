Ext.ns('HttpCommander.Lib');

/* config: htcConfig, globalLoadMask, Msg, Window, openTreeRecent()
*/
HttpCommander.Lib.PlayVideoHtml5Window = function (config) {
    var window = new config.Window({
        title: '', // file name
        //bodyStyle: 'padding:5px',
        layout: 'fit',
        resizable: true,
        closeAction: 'hide',
        minimizable: false,
        maximizable: true,
        border: false,
        plain: true,
        width: 300,
        height: 200,
        //autoHeight: true,
        monitorMetadataTask: null,
        items: [],
        listeners: {
            hide: function (win) {
                win.videoPause(win);
            },
            close: function (win) {
                win.videoPause(win);
            }
        },
        /*buttons:
        [
        {
        text: 'Adjust',
        handler: function () {
        window.autoResize();
        }
        }
        ],*/
        videoPause: function (win) {
            var window = win || this;
            var videoObj = window.getVideoObj();
            if (videoObj && videoObj.pause) {
                videoObj.onerror = null;
                videoObj.pause();
            }
            window.stopMonitorMetadataTask();
        },
        playVideoFile: function (record, path) {
            var window = this;
            window.stopMonitorMetadataTask();
            window.removeAll(true);
            window.add({
                xtype: 'box',
                autoEl: {
                    tag: "div",
                    html: ''
                }
            });

            window.restore();

            if (window.isVisible()) {
                window.doLayout();
            } else {
                window.show();
            }

            var videoFileName = record.data.name;
            window.setTitle(Ext.util.Format.htmlEncode(videoFileName));
            var operationInfo = {
                inputFile: path + "/" + videoFileName
            };
            config.globalLoadMask.msg = config.htcConfig.locData.VideoConvertWindowExtractDetailsProgressMsg + "...";
            config.globalLoadMask.show();
            HttpCommander.Video.VideoInfo(operationInfo, function (data, trans) {
                config.globalLoadMask.hide();

                if (!HttpCommander.Lib.Utils.checkDirectHandlerResult(
                        data, trans, config.Msg, config.htcConfig, 2)) {
                    window.hide();
                    return;
                }

                window.removeAll(true);
                var url = config.htcConfig.relativePath + "Handlers/Download.ashx?action=download&file=" + encodeURIComponent(path + "/" + videoFileName);
                window.add({
                    xtype: 'box',
                    //autoHeight: true,
                    itemId: 'video-box',
                    autoEl: {
                        tag: "div",
                        html: ''
                    }
                });
                window.doLayout();
                var box = window.getComponent('video-box').el.dom;

                var videoObj = document.createElement('video');
                videoObj.controls = true;
                videoObj.preload = "metadata";
                if (videoObj.style.setProperty) {
                    videoObj.style.setProperty('width', '100%', '');
                    videoObj.style.setProperty('height', '100%', '');
                }
                else {
                    videoObj.style['width'] = '100%';
                    videoObj.style['height'] = '100%';
                }
                videoObj.onerror = function (evt) {
                    config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, config.htcConfig.locData.PlayHtml5VideoPlayFailed);
                    window.stopMonitorMetadataTask();
                };

                var sourceObj = document.createElement('source');
                sourceObj.onerror = function (evt) {
                    config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, config.htcConfig.locData.PlayHtml5VideoPlayFailed);
                    window.stopMonitorMetadataTask();
                };
                sourceObj.type = data.IMediaType;
                sourceObj.src = url;
                videoObj.appendChild(sourceObj);
                var p = document.createElement('p');
                p.appendChild(document.createTextNode(config.htcConfig.locData.PlayHtml5VideoNotSupported));
                videoObj.appendChild(p);
                box.appendChild(videoObj);
                /* Google Chrome issues none of the following events:
                loadedmetadata, loadstart, loaddata, load, change.
                The only way to know when metadata become available is to check
                the value of the readyState property periodically. */
                window.monitorMetadataTask = Ext.TaskMgr.start({
                    run: window.checkMetadataLoaded,
                    interval: 1000,
                    scope: window
                });

                setTimeout(config.openTreeRecent, 1000);
            });
        },
        getVideoObj: function () {
            var box = this.getComponent('video-box');
            if (box == null || box.el == null || box.el.dom == null) {
                return null;
            }
            return box.el.dom.firstChild;
        },
        checkMetadataLoaded: function () {
            var window = this;
            var videoObj = window.getVideoObj();
            if (videoObj == null) {
                return;
            }
            /* When the browser does not support video object, this property may contain a string.
            For example, in IE8 it may contain "completed". */
            var state = Number(videoObj.readyState);
            if (isNaN(state)) {
                window.stopMonitorMetadataTask();
                return;
            }
            if (state >= 1) {
                window.stopMonitorMetadataTask();
                window.autoResize();
            }
            /* sometimes video tag may be replaced with other html,
            for example, embed tag */
            if (videoObj.tagName.toLowerCase() != "video") {
                window.stopMonitorMetadataTask();
                //window.autoResize();
            }
        },
        stopMonitorMetadataTask: function () {
            var window = this;
            if (window.monitorMetadataTask != null) {
                Ext.TaskMgr.stop(window.monitorMetadataTask);
                window.monitorMetadataTask = null;
            }
        },
        /* resize window to fit video size */
        autoResize: function () {
            var window = this;
            var box = window.getComponent('video-box');
            var videoObj = window.getVideoObj();
            var w, h;
            w = videoObj.width;
            h = videoObj.height;
            if (!w || !h) {
                w = videoObj.videoWidth;
                h = videoObj.videoHeight;
            }
            if (w && h) {
                var addw = window.getWidth() - box.el.dom.clientWidth;
                var addh = window.getHeight() - box.el.dom.clientHeight;
                //box.setSize(w, h);
                //window.syncSize();
                window.setSize(w + addw, h + addh);
                window.doLayout();
            }
        }
    });
    return window;
};