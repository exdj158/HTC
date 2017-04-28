Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, openTreeRecent()
*/
HttpCommander.Lib.PlayAudioHtml5Window = function(config) {
    var window = new config.Window({
        title: '', // file name
        //bodyStyle: 'padding:5px',
        layout: 'fit',
        resizable: true,
        closeAction: 'hide',
        minimizable: false,
        maximizable: false,
        border: false,
        plain: true,
        width: 300,
        //height: 100,
        autoHeight: true,
        items: [],
        listeners: {
            hide: function(win) {
                var audioObj = window.getAudioObj();
                if (audioObj && audioObj.pause) {
                    audioObj.pause();
                }
            },
            close: function(win) {
                var audioObj = window.getAudioObj();
                if (audioObj && audioObj.pause) {
                    audioObj.pause();
                }
            }
        },
        playFile: function(record, path) {
            var window = this;
            window.removeAll(true);
            window.add({
                xtype: 'box',
                itemId: 'audio-box',
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

            var fileName = record.data.name;
            window.setTitle(Ext.util.Format.htmlEncode(fileName));

            var url = config.htcConfig.relativePath + "Handlers/Download.ashx?action=download&file=" + encodeURIComponent(path + "/" + fileName);
            var box = window.getComponent('audio-box').el.dom;

            var audioObj = document.createElement('audio');
            audioObj.controls = true;
            audioObj.preload = "metadata";
            if (audioObj.style.setProperty) {
                audioObj.style.setProperty('width', '100%', '');
                //audioObj.style.setProperty('height', '100%', '');
            }
            else {
                audioObj.style['width'] = '100%';
                //audioObj.style['height'] = '100%';
            }
            audioObj.onerror = function(evt) {
                config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, config.htcConfig.locData.PlayHtml5AudioPlayFailed);
            };

            var sourceObj = document.createElement('source');
            sourceObj.onerror = function(evt) {
                config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, config.htcConfig.locData.PlayHtml5AudioPlayFailed);
            };
            sourceObj.src = url;
            audioObj.appendChild(sourceObj);
            var p = document.createElement('p');
            p.appendChild(document.createTextNode(config.htcConfig.locData.PlayHtml5AudioNotSupported));
            audioObj.appendChild(p);
            box.appendChild(audioObj);

            setTimeout(config.openTreeRecent, 1000);
        },
        getAudioObj: function() {
            var box = this.getComponent('audio-box');
            if (box == null || box.el == null || box.el.dom == null) {
                return null;
            }
            return box.el.dom.firstChild;
        }
    });
    return window;
};