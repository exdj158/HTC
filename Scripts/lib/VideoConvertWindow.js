Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, globalLoadMask, isFileExists(fileName), refreshCurrentFolder(), setSelectPath()
*/
HttpCommander.Lib.VideoConvertWindow = function (config) {
    var profileStore = new Ext.data.ArrayStore({
        fields:
        [
            'index',
            'label',
            'width',
            'height'
        ],
        data:
        [
            [0, 'Custom', 0, 0],
            [1, 'iPod Classic', 320, 240],
            [2, 'iPhone/iPhone 3G(S)/iPod Touch/iPad', 480, 320],
            [3, 'iPhone 4/iPod Touch 4/iPad', 960, 640],
            [4, 'iPad', 1024, 768]
        ]
    });

    function intergerValidator(val) {
        if (val > 0) {
            return true;
        }
        return config.htcConfig.locData.VideoConvertWindowValidatorPositiveInt;
    }

    var window = new config.Window({
        title: config.htcConfig.locData.VideoConvertWindowTitle,
        bodyStyle: 'padding:5px',
        modal: true,
        width: 400,
        plain: true,
        autoHeight: true,
        layout: 'fit',
        closeAction: 'hide',
        folderPath: null, // path of the current folder
        videoInfo: { /* video information */
            width: 0, // frame width (pixels)
            height: 0, // frame height (pixels)
            PAR: 0, // pixel aspect ratio (real number)
            DAR: 0 // display aspect ratio (real number)
        },
        resizeEnabled: false,
        initialized: false,
        items:
        [
            new Ext.FormPanel({
                baseCls: 'x-plain',
                frame: false,
                defaults: { anchor: '100%' },
                itemId: 'form',
                autoHeight: true,
                items:
                [
                    {
                        fieldLabel: config.htcConfig.locData.VideoConvertWindowInputFile,
                        itemId: 'input-file',
                        xtype: 'displayfield'
                    },
                    {
                        fieldLabel: config.htcConfig.locData.VideoConvertWindowOutputFile,
                        itemId: 'output-file',
                        xtype: 'textfield'
                    },
                    {
                        fieldLabel: config.htcConfig.locData.VideoConvertWindowOutputFormat,
                        xtype: 'radiogroup',
                        itemId: 'output-format-rg',
                        name: 'output-format-radiogroup',
                        items:
                        [
                            {
                                checked: true,
                                boxLabel: 'flv',
                                name: 'output-format',
                                inputValue: 'flv',
                                xtype: 'radio'
                            },
                            {
                                boxLabel: 'mp4',
                                name: 'output-format',
                                inputValue: 'mp4',
                                xtype: 'radio'
                            }
                        ],
                        listeners: {
                            change: function (radiogroup, radio) {
                                var form = window.getComponent('form');
                                var fileName = form.getComponent('output-file').getValue();
                                fileName = HttpCommander.Lib.Utils.setFileExtension(fileName, radio.getGroupValue());
                                form.getComponent('output-file').setValue(fileName);
                            }
                        }
                    },
                    {
                        fieldLabel: config.htcConfig.locData.VideoConvertWindowBitrate,
                        itemId: 'bitrate',
                        xtype: 'textfield',
                        maskRe: /\d/,
                        allowBlank: false,
                        validator: intergerValidator
                    },
                    {
                        fieldLabel: config.htcConfig.locData.VideoConvertWindowFrameResolution,
                        itemId: 'resolution',
                        xtype: 'displayfield'
                    },
                    {
                        fieldLabel: config.htcConfig.locData.VideoConvertWindowDAR,
                        itemId: "display-aspect-ratio",
                        xtype: 'displayfield'
                    },
                    {
                        fieldLabel: config.htcConfig.locData.VideoConvertWindowPAR,
                        itemId: "pixel-aspect-ratio",
                        xtype: 'displayfield'
                    },
                    {
                        xtype: 'fieldset',
                        checkboxToggle: true,
                        title: config.htcConfig.locData.VideoConvertWindowResize,
                        autoHeight: true,
                        defaults: { anchor: '100%' },
                        defaultType: 'textfield',
                        collapsed: true,
                        itemId: 'resize-set',
                        items:
                        [
                            {
                                xtype: 'combo',
                                fieldLabel: config.htcConfig.locData.VideoConvertWindowProfile,
                                itemId: 'profile',
                                store: profileStore,
                                mode: 'local',
                                displayField: 'label',
                                tpl: '<tpl for="."><div class="x-combo-list-item">{label:htmlEncode}</div></tpl>',
                                valueField: 'index',
                                lazyInit: false,
                                editable: false,
                                autoSelect: false,
                                triggerAction: 'all',
                                allowBlank: false,
                                listeners: {
                                    select: function () { window.loadResizeDimentions(); }
                                }
                            },
                            {
                                fieldLabel: config.htcConfig.locData.VideoConvertWindowWidth,
                                itemId: 'new-width',
                                xtype: 'textfield',
                                maskRe: /\d/,
                                allowBlank: false,
                                validator: intergerValidator,
                                listeners: {
                                    change: function () { window.onUserChangedVideoWidth(); }
                                }
                            },
                            {
                                fieldLabel: config.htcConfig.locData.VideoConvertWindowHeight,
                                itemId: 'new-height',
                                xtype: 'textfield',
                                maskRe: /\d/,
                                allowBlank: false,
                                validator: intergerValidator,
                                listeners: {
                                    change: function () { window.onUserChangedVideoHeight(); }
                                }
                            }
                        ],
                        listeners: {
                            expand: function (p) {
                                var window = p.ownerCt.ownerCt;
                                window.resizeEnabled = true;
                                if (window.initialized) {
                                    window.updateBitrateField();
                                }
                            },
                            collapse: function (p) {
                                var window = p.ownerCt.ownerCt;
                                window.resizeEnabled = false;
                                if (window.initialized) {
                                    window.updateBitrateField();
                                }
                            }
                        }
                    }
                ]
            })
        ],
        buttons:
        [
            {
                text: config.htcConfig.locData.CommonButtonCaptionOK,
                handler: function () {
                    if (!window.isFormValid()) {
                        return;
                    }
                    if (window.isOutputFileExist()) {
                        window.confirmOverwriteOutputFile(function () {
                            window.doConversion();
                        });
                    } else {
                        window.doConversion();
                    }
                }
            },
            {
                text: config.htcConfig.locData.CommonButtonCaptionCancel,
                handler: function () {
                    window.hide();
                }
            }
        ],

        prepare: function (record, path) {
            // path, record.data.name
            var window = this;
            window.initialized = false;
            var form = window.getComponent('form');
            var inputFile = record.data.name;
            window.inputFile = inputFile;
            form.getComponent('input-file').setValue(Ext.util.Format.htmlEncode(inputFile));
            var outputFile = HttpCommander.Lib.Utils.setFileExtension(inputFile, 'flv');
            form.getComponent('output-file').setValue(outputFile);
            form.getComponent("output-format-rg").setValue("flv");
            form.getComponent("resolution").setValue("?");
            form.getComponent("display-aspect-ratio").setValue("?");
            form.getComponent("bitrate").setValue("500");
            var resizeSet = form.getComponent("resize-set");
            resizeSet.getComponent("profile").setValue(0);
            window.folderPath = path;

            var operationInfo = {
                inputFile: window.folderPath + "/" + inputFile
            };
            config.globalLoadMask.msg = config.htcConfig.locData.VideoConvertWindowExtractDetailsProgressMsg + "...";
            config.globalLoadMask.show();
            HttpCommander.Video.VideoInfo(operationInfo, function (data, trans) {
                config.globalLoadMask.hide();
                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                        data, trans, config.Msg, config.htcConfig, 2)) {
                    window.videoInfo.width = data.width;
                    window.videoInfo.height = data.height;
                    window.videoInfo.PAR = data.PARNum / data.PARDen;
                    window.videoInfo.DAR = data.DARNum / data.DARDen;
                    form.getComponent("resolution").setValue(window.videoInfo.width + " x " + window.videoInfo.height);
                    form.getComponent("display-aspect-ratio").setValue(window.videoInfo.DAR);
                    form.getComponent("pixel-aspect-ratio").setValue(window.videoInfo.PAR);
                    window.loadResizeDimentions();
                    window.updateBitrateField();
                    window.initialized = true;
                }
            });
        },

        isOutputFileExist: function () {
            var form = this.getComponent('form');
            var outputFile = form.getComponent('output-file').getValue();
            return config.isFileExists(outputFile);
        },

        /*
        action - function to invoke if the user confirmed to overwrite the file
        return value: 
        true - to overwrite output file
        false - to cancel the operation
        */
        confirmOverwriteOutputFile: function (action) {
            config.Msg.show({
                title: config.htcConfig.locData.VideoConvertWindowOutputFileExistsTitle,
                msg: config.htcConfig.locData.VideoConvertWindowOutputFileExistsMsg,
                buttons: config.Msg.OKCANCEL,
                icon: config.Msg.WARNING,
                fn: function (buttonId) {
                    if (buttonId == "ok") {
                        action();
                    }
                }
            });
        },

        newFrameSize: function () {
            var window = this;
            var form = window.getComponent('form');
            var resizeSet = form.getComponent('resize-set');
            var operationInfo = {};
            if (window.resizeEnabled) {
                operationInfo.width = resizeSet.getComponent('new-width').getValue();
                operationInfo.height = resizeSet.getComponent('new-height').getValue();
            } else {
                operationInfo.height = window.videoInfo.height;
                operationInfo.width = Math.round(operationInfo.height * window.videoInfo.DAR);
            }
            operationInfo.width = Number(operationInfo.width);
            operationInfo.height = Number(operationInfo.height);
            return operationInfo;
        },

        doConversion: function () {
            var window = this;
            window.hide();
            var form = window.getComponent('form');
            var operationInfo = {
                folderPath: window.folderPath,
                inputFileName: window.inputFile, // form.getComponent('input-file').getValue(),
                outputFileName: form.getComponent('output-file').getValue(),
                outputFormat: form.getComponent('output-format-rg').getValue().getGroupValue(),
                bitrate: Number(form.getComponent('bitrate').getValue())
            };
            var newSize = window.newFrameSize();
            operationInfo.width = newSize.width;
            operationInfo.height = newSize.height;
            config.globalLoadMask.msg = config.htcConfig.locData.VideoConvertWindowPrepareToConvert + "...";
            config.globalLoadMask.show();
            HttpCommander.Video.Convert(operationInfo, function (data, trans) {
                config.globalLoadMask.hide();
                if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                        data, trans, config.Msg, config.htcConfig, 2)) {
                    window.openProgressWindow(operationInfo.inputFileName,
                        operationInfo.outputFileName, data.jobkey, operationInfo.folderPath);
                }
            });
        },

        openProgressWindow: function (inputFileName, outputFileName, jobkey, folderPath) {
            var videoConvertProgressWindow = HttpCommander.Lib.VideoConvertProgressWindow({
                'htcConfig': config.htcConfig,
                'Msg': config.Msg,
                'Window': config.Window,
                'refreshCurrentFolder': config.refreshCurrentFolder,
                'setSelectPath': config.setSelectPath
            });
            videoConvertProgressWindow.prepare(inputFileName, outputFileName, jobkey, folderPath);
            videoConvertProgressWindow.show();
        },

        /* check if form fields are filled with valid values. 
        return true if everything is OK
        otherwise return false and focus the invalid field */
        isFormValid: function () {
            var window = this;
            var form = window.getComponent('form');
            var inputFileName = window.inputFile;// form.getComponent('input-file').getValue();
            var outputFileName = form.getComponent('output-file').getValue();
            if (inputFileName.toLowerCase() == outputFileName.toLowerCase()) {
                form.getComponent('output-file').markInvalid(config.htcConfig.locData.VideoConvertWindowOutputFileMatchInputFile);
                form.getComponent('output-file').focus(true);
                return false;
            }
            if (!form.getComponent('bitrate').validate()) {
                form.getComponent('bitrate').focus(true);
                return false;
            }
            var resizeSet = form.getComponent('resize-set');
            if (window.resizeEnabled) {
                if (!resizeSet.getComponent('new-width').validate()) {
                    resizeSet.getComponent('new-width').focus(true);
                    return false;
                }
                if (!resizeSet.getComponent('new-height').validate()) {
                    resizeSet.getComponent('new-height').focus(true);
                    return false;
                }
            }
            return true;
        },

        /* calculates recommended bitrate for target frame size */
        recommendedBitrate: function () {
            /* http://www.ezs3.com/public/What_bitrate_should_I_use_when_encoding_my_video_How_do_I_optimize_my_video_for_the_web.cfm
            arr[*][0] - number of pixels in frame
            arr[*][1] - bitrate (kbps) */
            var arr = [
                [76800, 400],
                [129600, 700],
                [589824, 1500],
                [921600, 2500],
                [2073600, 4000]
            ];
            var window = this;
            var newSize = window.newFrameSize();
            var pixels = newSize.width * newSize.height;
            for (var i = 0; i < arr.length; i += 1) {
                if (pixels < arr[i][0]) {
                    break;
                }
            }
            if (i == 0) {
                return window.solveBitrateEquation(arr[0], arr[1], pixels);
            }
            if (i == arr.length) {
                return window.solveBitrateEquation(arr[arr.length - 2], arr[arr.length - 1], pixels);
            }
            else {
                return window.solveBitrateEquation(arr[i - 1], arr[i], pixels);
            }
        },

        solveBitrateEquation: function (v0, v1, pixels) {
            /* f(x) = a*x + b
            f(<pixels number>) = <bitrate>
            a*v0[0] + b = v0[1]
            a*v1[0] + b = v1[1]
            a = (v0[1]-v1[1])/(v0[0]-v1[0])
            b = v0[1] - a*v0[0] */
            var a = (v0[1] - v1[1]) / (v0[0] - v1[0]);
            var b = v0[1] - a * v0[0];
            return Math.round(a * pixels + b);
        },

        updateBitrateField: function () {
            var window = this;
            var form = window.getComponent('form');
            form.getComponent("bitrate").setValue(window.recommendedBitrate());
        },

        /* resizing video frame
                                
        When converting video for playing with a flash player,
        namely flowplayer, we should strive for square pixel, 
        that pixel aspect ratio = 1:1.
        Flowplayer extracts neither pixel aspect ratio,
        nor display aspect ratio from the video file.
        Flowplayer provides access only to frame width and height properties.
                                
        In the case the user has not specified the required video size,
        we preserve the height and change the width apropriately:
        width = height * <Display aspect ratio>
                                
        When the user specifies the desired frame size, for example, 
        the video is targeted for iPod, we take the following restriction into consideration.
        1. we want to preserve the original display aspect ratio
        2. we do not want to crop frames
                                
        To fit the frame into the specifed container, 
        we need to select the base dimention and calculate the other dimention
        according to the display aspect ratio.
        To select the base dimention we must compare the
        video display aspect ratio (DAR) and target container aspect ratio (CAR).
        For example, we selected iPod classic profile: 320x240.
        CAR = 320/240.
        if CAR <= DAR, the base dimention is width = 320, 
        we calculate the target height as width / DAR.
        if CAR > DAR, the base dimention is height = 240,
        we calculate the target width as height * DAR.
        */
        loadResizeDimentions: function () {
            var window = this;
            var form = window.getComponent('form');
            var resizeSet = form.getComponent('resize-set');
            var profile = resizeSet.getComponent('profile').getValue();
            var record = profileStore.getAt(profile);
            var w, h;
            if (record.data.width && record.data.height) {
                // display aspect ratio of the target format
                var DAR = record.data.width / record.data.height;
                if (DAR <= window.videoInfo.DAR) {
                    w = record.data.width;
                    h = Math.round(w / window.videoInfo.DAR);
                } else {
                    h = record.data.height;
                    w = Math.round(h * window.videoInfo.DAR);
                }
                resizeSet.getComponent('new-width').setValue(w);
                resizeSet.getComponent('new-height').setValue(h);
            } else {
                w = Math.round(window.videoInfo.width * window.videoInfo.PAR);
                h = window.videoInfo.height;
                resizeSet.getComponent('new-width').setValue(w);
                resizeSet.getComponent('new-height').setValue(h);
            }
            window.updateBitrateField();
        },

        onUserChangedVideoWidth: function () {
            var window = this;
            var form = window.getComponent('form');
            var resizeSet = form.getComponent('resize-set');
            resizeSet.getComponent('profile').setValue(0);
            var w = resizeSet.getComponent('new-width').getValue();
            var h = Math.round(w / window.videoInfo.DAR);
            resizeSet.getComponent('new-height').setValue(h);
            window.updateBitrateField();
        },

        onUserChangedVideoHeight: function () {
            var window = this;
            var form = window.getComponent('form');
            var resizeSet = form.getComponent('resize-set');
            resizeSet.getComponent('profile').setValue(0);
            var h = resizeSet.getComponent('new-height').getValue();
            var w = Math.round(h * window.videoInfo.DAR);
            resizeSet.getComponent('new-width').setValue(w);
            window.updateBitrateField();
        }
    });
    return window;
};