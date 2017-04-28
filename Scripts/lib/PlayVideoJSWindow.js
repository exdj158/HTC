Ext.ns('HttpCommander.Lib');

/* config: htcConfig, globalLoadMask, Msg, Window, openTreeRecent()
*/
HttpCommander.Lib.PlayVideoJSWindow = function (config) {
    
    var window = new config.Window({
        title: '', // file name      
        layout: 'fit',
        resizable: true,
        closeAction: 'hide',
        minimizable: false,
        maximizable: true,
        border: false,
        plain: true,
        width: 480,
        height: 320,
        isAudio: false,
        volume: 1.0,
        //http://videojs.com/mimes.html
        mimeTypes: {
            "flv": "video/x-flv",
            "mp4": "video/mp4",
            "m3u8": "application/x-mpegURL",
            "3gp": "video/3gpp",
            "mov": "video/quicktime",
            "avi": "video/avi",
            "wmv": "video/x-ms-wmv",
            "ogv": "video/ogg",
            "webm": "video/webm",
            "mpg": "video/mpeg",
            "mp3": "audio/mpeg",
            "wav": "audio/wav",
            "ogg": "audio/ogg",
            "aac": "audio/aac"
        },
        items: [],
        listeners: {
            hide: function (win) {
                win.videoPause(win);
                win.disposePlayer(win);
            },
            close: function (win) {
                win.videoPause(win);
                win.disposePlayer(win);                
            }
        },

        disposePlayer: function(win){
            try {
                var player = videojs.getPlayers()["htcomnet_video"];
                if (player)
                    player.dispose();
                if (document.getElementById("htcomnet_video") && window.getComponent('video-box')) {
                    var box = window.getComponent('video-box').el.dom;
                    if (box)
                        box.removeChild(document.getElementById("htcomnet_video"));
                }
            } catch (e) {
            }
        },

        videoPause: function (win) {
            try {
                var player = videojs.getPlayers()["htcomnet_video"];
                if (document.getElementById("htcomnet_video") && player && !player.paused())                  
                    player.pause();
            } catch (e) {
            }
        },
        isAudioFile: function (fileName) {
            var extension = HttpCommander.Lib.Utils.getFileExtension(fileName);
            return "wav mp3 ogg".indexOf(extension) >= 0;
        },
        //<script type="text/javascript" src="Scripts/plugins/video-js/video.min.js"></script>
        //<script type="text/javascript" src="Scripts/plugins/video-js/lang/<%=Utils.CurrentTwoLetterLanguageName%>.js"></script>
        //Utils.AddCss("Scripts/plugins/video-js/video-js.css", this.Page);

        playVideoFile: function (record, path) {
            var self = this;
            if (typeof videojs == 'undefined') {
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                config.globalLoadMask.show();
                if (HttpCommander.Lib.Utils.browserIs.ie && HttpCommander.Lib.Utils.browserIs.iever < 9)
                    HttpCommander.Lib.Utils.includeJsFile({
                        url: scriptSource.substring(0, scriptSource.lastIndexOf('/')) + '/plugins/video-js/videojs-ie8.min.js',
                        callback: function () {
                            self.loadVideoJSFiles.call(self, record, path);
                        }
                    });
                else
                    self.loadVideoJSFiles.call(self, record, path);
                
            } else {
                self.playVideoFileInternal.call(self, record, path);
            }
        },

        loadVideoJSFiles: function (record, path) {
            var self = this;
            HttpCommander.Lib.Utils.includeJsFile({
                url: scriptSource.substring(0, scriptSource.lastIndexOf('/')) + '/plugins/video-js/video.min.js',
                callback: function () {
                    config.globalLoadMask.hide();
                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                    if (typeof videojs == 'undefined') {                        
                        config.Msg.alert(config.htcConfig.locData.CommonErrorCaption,
                            config.htcConfig.locData.VideoJsNotLoadedMessage);
                        return;
                    }

                    HttpCommander.Lib.Utils.includeCssFile({
                        url: scriptSource.substring(0, scriptSource.lastIndexOf('/')) + '/plugins/video-js/video-js.css',                        
                    });

                    HttpCommander.Lib.Utils.includeJsFile({
                        url: scriptSource.substring(0, scriptSource.lastIndexOf('/')) + '/plugins/video-js/lang/' + config.htcConfig.twoLetterLangName + '.js',
                        callback: function () {
                            self.playVideoFileInternal.call(self, record, path);
                        }
                    });
                }
            });
        },

        playVideoFileInternal: function (record, path) {
            videojs.options.flash.swf = "Scripts/plugins/video-js/video-js.swf";
            var window = this;
            window.videoPause();
            window.disposePlayer(window);
           
            window.removeAll(true);
            window.add({
                xtype: 'box',
                itemId: 'video-box',
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
            var operationInfo = {
                inputFile: path + "/" + videoFileName
            };


            if (!window.isAudioFile(record.data.name)) {
                config.globalLoadMask.msg = config.htcConfig.locData.VideoConvertWindowExtractDetailsProgressMsg + "...";
                config.globalLoadMask.show();
                HttpCommander.Video.VideoInfo(operationInfo, function (data, trans) {
                    config.globalLoadMask.hide();
                    window.playFile(window, record, path, data, trans);
                });
            }
            else
                window.playFile(window, record, path);
        },

        playFile: function (window, record, path, data, trans) {
            var videoFileName = record.data.name;
            window.setTitle(Ext.util.Format.htmlEncode(videoFileName));
            window.isAudio = window.isAudioFile(videoFileName);
            var url = config.htcConfig.relativePath + "Handlers/Download.ashx/" + encodeURIComponent(videoFileName) + "?action=download&file=" + encodeURIComponent(path + "/" + videoFileName);


            var box = window.getComponent('video-box').el ? window.getComponent('video-box').el.dom : window.el.dom;

            var videoObj = window.isAudio ? document.createElement('audio') : document.createElement('video');
            videoObj.id = "htcomnet_video";
            if (videoObj.style.setProperty) {
                videoObj.style.setProperty('width', '100%', '');
                videoObj.style.setProperty('height', '100%', '');
            }
            else {
                videoObj.style['width'] = '100%';
                videoObj.style['height'] = '100%';
            }
            var extension = HttpCommander.Lib.Utils.getFileExtension(videoFileName);
            var sourceObj = document.createElement('source');
            sourceObj.src = url;
            //set type for video files

            if (!window.isAudio && HttpCommander.Lib.Utils.checkDirectHandlerResult(
                    data, trans, config.Msg, config.htcConfig, 2))
                sourceObj.type = data.IMediaType;
            else if (window.mimeTypes[extension])
                sourceObj.type = window.mimeTypes[extension];

            videoObj.appendChild(sourceObj);
            var p = document.createElement('p');
            p.appendChild(document.createTextNode(config.htcConfig.locData.PlayHtml5VideoNotSupported));
            videoObj.appendChild(p);
            box.appendChild(videoObj);
            videojs(document.getElementById("htcomnet_video"), { "controls": true, "autoplay": true, "preload": "metadata", "language": config.htcConfig.twoLetterLangName }, function () {
                try {
                    this.on('error', function (e) {
                        e.stopImmediatePropagation();
                    });
                    this.el_.className = this.el_.className + " video-js vjs-default-skin";
                    this.on('loadedmetadata', window.autoResize);
                    this.on('volumechange', function () {
                        window.volume = this.volume();
                    });
                    this.volume(window.volume);
                }
                catch(e){}
            });

            setTimeout(config.openTreeRecent, 1000);
        },
        /* resize window to fit video size */
        autoResize: function () {
            var w, h;
            var box = window.getComponent('video-box');
            h = window.isAudio ? 70 : this.videoHeight();
            w = window.isAudio ? window.getWidth() : this.videoWidth();
            if (w && h) {
                w = w > 640 ? 640 : w;
                h = h > 640 ? 480 : h;
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