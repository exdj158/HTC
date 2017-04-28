Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, refreshCurrentFolder(), setSelectPath()
*/
HttpCommander.Lib.VideoConvertProgressWindow = function(config) {
    var window = new config.Window({
        title: config.htcConfig.locData.VideoConvertProgressWindowTitle,
        bodyStyle: 'padding:5px',
        modal: false,
        width: 300,
        plain: true,
        autoHeight: true,
        layout: 'fit',
        closeAction: 'hide',
        updateTask: null,
        jobkey: null,
        // true if the progress bar is running in the auto update mode
        progressBarAutoupdateMode: false,
        items:
        [
            new Ext.FormPanel({
                baseCls: 'x-plain',
                frame: false,
                autoHeight: true,
                itemId: 'form',
                defaults: { anchor: '100%' },
                items:
                [
                    {
                        fieldLabel: config.htcConfig.locData.VideoConvertProgressWindowInputFile,
                        itemId: 'input-file',
                        xtype: 'displayfield'
                    },
                    {
                        fieldLabel: config.htcConfig.locData.VideoConvertProgressWindowOutputFile,
                        itemId: 'output-file',
                        xtype: 'displayfield'
                    },
                    {
                        fieldLabel: config.htcConfig.locData.VideoConvertProgressWindowStatus,
                        xtype: 'displayfield',
                        itemId: 'status'
                    },
                    {
                        xtype: 'progress',
                        hideLabel: true,
                        cls: 'x-form-item',
                        itemId: 'step-progress'
                    },
                    {
                        xtype: 'textarea',
                        hideLabel: true,
                        itemId: 'status-message'
                    }
                ]
            })
        ],
        buttons:
        [
            {
                text: config.htcConfig.locData.CommonButtonCaptionCancel,
                itemId: "cancel-btn",
                handler: function() {
                    var operationInfo = {
                        jobkey: window.jobkey
                    };
                    HttpCommander.Video.Terminate(operationInfo, function(data, trans) {
                        var form = window.getComponent('form');
                        if (data == undefined) {
                            form.getComponent('status').setValue(config.htcConfig.locData.CommonErrorCaption);
                            form.getComponent('status-message').show();
                            form.getComponent('status-message').setValue(Ext.util.Format.htmlEncode(trans.message));
                            window.stopProgressUpdater();
                            window.onConvertStop();
                            return;
                        }
                        if (data.status != "success") {
                            form.getComponent('status').setValue(config.htcConfig.locData.CommonErrorCaption);
                            form.getComponent('status-message').show();
                            form.getComponent('status-message').setValue(HttpCommander.Lib.Utils.checkBracketsAndHtmlEncode(data.message));
                            window.stopProgressUpdater();
                            window.onConvertStop();
                            return;
                        }
                        if (data.jobstatus != "Done" && data.jobstatus != "Error") {
                            form.getComponent('status').setValue(config.htcConfig.locData.VideoConvertProgressWindowStatusTerminating);
                        }
                    });
                }
            },
            {
                text: config.htcConfig.locData.CommonButtonCaptionClose,
                handler: function() {
                    window.hide();
                }
            }
        ],
        listeners: {
            hide: function() {
                window.stopProgressUpdater();
            }
        },

        prepare: function(inputFileName, outputFileName, jobkey, folderPath) {
            this.stopProgressUpdater();
            this.jobkey = jobkey;
            this.outputFileName = outputFileName;
            this.folderPath = folderPath;
            var form = this.getComponent('form');
            form.getComponent('input-file').setValue(Ext.util.Format.htmlEncode(inputFileName));
            form.getComponent('output-file').setValue(Ext.util.Format.htmlEncode(outputFileName));
            form.getComponent('status').setValue(config.htcConfig.locData.VideoConvertProgressWindowStatusPreparing);
            form.getComponent('step-progress').reset();
            form.getComponent('status-message').setValue('');
            form.getComponent('status-message').hide();
            this.fbar.getComponent('cancel-btn').enable();
            this.startProgressUpdater();
        },

        updateProgress: function() {
            var window = this;
            var operationInfo = {
                jobkey: window.jobkey
            };
            HttpCommander.Video.ProgressInfo(operationInfo, function(data, trans) {
                var form = window.getComponent('form');
                if (data == undefined) {
                    form.getComponent('status').setValue(config.htcConfig.locData.CommonErrorCaption);
                    form.getComponent('status-message').show();
                    form.getComponent('status-message').setValue(Ext.util.Format.htmlEncode(trans.message));
                    window.stopProgressUpdater();
                    window.stopProgressBarAutoupdater();
                    window.onConvertStop();
                    return;
                }
                if (data.status != "success") {
                    form.getComponent('status').setValue(config.htcConfig.locData.CommonErrorCaption);
                    form.getComponent('status-message').show();
                    form.getComponent('status-message').setValue(HttpCommander.Lib.Utils.checkBracketsAndHtmlEncode(data.message));
                    window.stopProgressUpdater();
                    window.stopProgressBarAutoupdater();
                    window.onConvertStop();
                    return;
                }
                switch (data.jobstate) {
                    case "Initial":
                        form.getComponent('status').setValue(config.htcConfig.locData.VideoConvertProgressWindowStatusPreparing);
                        form.getComponent('step-progress').reset();
                        break;
                    case "Running":
                        var top_progress = String.format(config.htcConfig.locData.VideoConvertProgressWindowStatusProgress, data.stepnum, data.stepcnt);
                        form.getComponent('status').setValue(top_progress);
                        if (data.stepprog >= 0) {
                            window.stopProgressBarAutoupdater();
                            var step_progress = String.format("{0}%", data.stepprog);
                            form.getComponent('step-progress').updateProgress(data.stepprog / 100, step_progress);
                        } else {
                            window.startProgressBarAutoupdater();
                        }
                        break;
                    case "Done":
                        window.stopProgressUpdater();
                        window.stopProgressBarAutoupdater();
                        form.getComponent('status').setValue(config.htcConfig.locData.VideoConvertProgressWindowStatusDone);
                        form.getComponent('step-progress').updateProgress(1);
                        form.getComponent('step-progress').updateText('');
                        form.getComponent('status-message').hide();
                        window.fbar.getComponent('cancel-btn').disable();
                        window.onConvertStop();
                        break;
                    case "Error":
                        window.stopProgressUpdater();
                        window.stopProgressBarAutoupdater();
                        form.getComponent('status').setValue(config.htcConfig.locData.CommonErrorCaption);
                        form.getComponent('status-message').show();
                        form.getComponent('status-message').setValue(HttpCommander.Lib.Utils.checkBracketsAndHtmlEncode(data.jobmessage));
                        window.fbar.getComponent('cancel-btn').disable();
                        window.onConvertStop();
                        break;
                }
            });
        },

        startProgressUpdater: function() {
            var window = this;
            window.stopProgressUpdater();
            window.updateTask = Ext.TaskMgr.start({
                run: window.updateProgress,
                interval: 1000,
                scope: window
            });
        },

        stopProgressUpdater: function() {
            var window = this;
            if (window.updateTask != null) {
                Ext.TaskMgr.stop(window.updateTask);
                window.updateTask = null;
                window.stopProgressBarAutoupdater();
            }
        },

        startProgressBarAutoupdater: function() {
            var window = this;
            if (!window.progressBarAutoupdateMode) {
                window.progressBarAutoupdateMode = true;
                var form = window.getComponent('form');
                form.getComponent('step-progress').wait({
                    interval: 500,
                    increment: 10
                });
            }
        },

        stopProgressBarAutoupdater: function() {
            var window = this;
            if (window.progressBarAutoupdateMode) {
                window.progressBarAutoupdateMode = false;
                var form = window.getComponent('form');
                form.getComponent('step-progress').reset();
            }
        },

        /* conversion process terminated */
        onConvertStop: function () {
            var me = this;
            if (me && !Ext.isEmpty(me.outputFileName) && !Ext.isEmpty(me.folderPath)) {
                config.setSelectPath({
                    name: me.outputFileName,
                    path: me.folderPath
                })
            }
            config.refreshCurrentFolder(me ? me.folderPath : null);
        }
    });
    return window;
};