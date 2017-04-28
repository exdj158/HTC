Ext.ns('HttpCommander.Lib');

/* config: $, htcConfig, appRootUrl, Window, openTreeRecent()
*/
HttpCommander.Lib.PlayVideoFlashWindow = function(config) {
    return new config.Window({
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
        player: null, // player object
        //autoHeight: true,
        items: {
            xtype: 'box',
            itemId: 'video-box',
            autoEl: {
                tag: 'div',
                html: '<div id="' + config.$('video-player') + '" style="width: 100%; height: 100%"></div>'
            }
        },
        listeners: {
            hide: function(win) {
                win.restoreVideoPlayer();
                win.player.stop();
                win.player.close();
            },
            close: function(win) {
                win.restoreVideoPlayer();
                win.player.stop();
                win.player.close();
            },
            afterrender: function(win) {
                win.installVideoPlayer();
            }
        },

        installVideoPlayer: function() {
            var window = this;
            window.player = flowplayer(config.$('video-player'),
                                    {
                                        id: config.$('video-player-api'),
                                        src: config.htcConfig.relativePath + "Scripts/flowplayer.unlimited-3.2.7.swf"
                                    },
                                    {
                                        clip: {
                                            url: '',
                                            autoPlay: false,
                                            scaling: 'fit',
                                            provider: "IIS_pseudostreaming",
                                            onStart: function(clip) {
                                                // resize video window and player control to match clip size
                                                //var oPlayer = Ext.get(config.$('video-player'));
                                                var oContainer = window.getComponent('video-box');
                                                var wadd = window.getWidth() - oContainer.getWidth();
                                                var hadd = window.getHeight() - oContainer.getHeight();
                                                var w = parseInt(clip.metaData.width, 10);
                                                var h = parseInt(clip.metaData.height, 10);

                                                // check that video dimensions have reasonable values
                                                if (w == null || !isFinite(w) || w <= 0 || Math.abs(w) > 2000) {
                                                    w = 400;
                                                }
                                                if (h == null || !isFinite(h) || h <= 0 || Math.abs(h) > 2000) {
                                                    h = 400;
                                                }
                                                window.setSize(w + wadd, h + hadd);
                                                //oContainer.setSize(w, h);
                                                //oPlayer.setSize(w, h);
                                            }
                                        },
                                        plugins: {
                                            IIS_pseudostreaming: {
                                                url: config.htcConfig.relativePath + 'Scripts/flowplayer.pseudostreaming-3.2.7.swf',
                                                queryString: escape('flvstart=${start}')
                                            }
                                        },
                                        key: config.htcConfig.flowplayerKey
                                    }
                                );
        },

        playVideoFile: function(record, path) {
            var window = this;
            window.restoreVideoPlayer();
            if (window.player != null) {
                window.player.stop();
                window.player.close();
            }
            /* Note. Path and name may contain special characters like '&' and '='.
            Normally, we should escape them. That is '&' -> %26, '=' -> %3D and so on,
            but flowplayer refuses such urls (playback fails). 
            That is we cannot play files with special characters is name and path. */
            var url = config.appRootUrl + "Handlers/Download.ashx?"
                                    + "action=download&file=" + path + "/" + record.data.name;

            window.restore();

            if (window.isVisible()) {
                window.setVideoFile(url, record.data.name);
            } else {
                window.show(null, function() {
                    window.setVideoFile(url, record.data.name);
                });
            }

            setTimeout(config.openTreeRecent, 1000);
        },

        /* check that video player api is not brocken,
        reinstall the player if necessary.

                            Flash player api may be brocken if you drag the window with the player in IE.
        Flash control is reloaded invalidating JavaScript api to the flash player.
        We may continue to play the video after reload using flash GUI,
        but JavaScript api is brocken. We need to reinstall the player to restore JavaScript api. */
        restoreVideoPlayer: function() {
            var window = this;
            var api = document.getElementById(config.$('video-player-api'));
            if (api != null) {
                if (api["fp_close"] == null) {
                    //alert("flash api is brocken");
                    window.installVideoPlayer();
                }
            }
        },

        setVideoFile: function(url, fileName) {
            var window = this;
            var clip = window.player.getClip(0);
            var provider = HttpCommander.Lib.Utils.getFileExtension(fileName) == 'flv' ? "IIS_pseudostreaming" : "http";
            if (clip.url == '') {
                clip.update({ url: escape(url), provider: provider });
            } else {
                clip.update({ url: url, provider: provider });
            }
            // force the play button
            //window.player.getPlugin("play").show();
            window.setTitle(Ext.util.Format.htmlEncode(fileName));
        }
    });
};