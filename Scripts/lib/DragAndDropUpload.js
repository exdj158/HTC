Ext.ns('HttpCommander.Lib');

/* config: htcConfig, Msg, Window, getRenderers(), getCurrentFolder(),
openGridFolder(), showBalloon(), globalLoadMask,
getDnDZone(), gridItemExists(), isModifyAllowed(), openTreeRecent()
*/
HttpCommander.Lib.DragAndDropUpload = function (config) {
    var uploadDnDGridPanel,
        blockFilesCount = config.htcConfig.dndCountParallelFiles,
        bis = HttpCommander.Lib.Utils.browserIs,
        pasteSreens = (config.htcConfig.enablePasteImages === true)
            && (bis.chrome12up || bis.firefox36up || bis.edge10586up),
        pasteFiles = bis.firefox36up,
        maxUpSize = parseInt(config.htcConfig.maxUploadSize, 10),
        maxUpSizeStr = '-1',
        chunked = HttpCommander.Lib.Utils.isChunkedUploadSupported(),
        defChunkSize = 262144 * 4; // 1Mb (: 256Kb) //TODO: 256Kb?
    if (!Ext.isNumber(blockFilesCount) || blockFilesCount <= 0) {
        blockFilesCount = 5;
    }
    if (maxUpSize <= 0) {
        maxUpSize = 2147483648; // 2GB - used by default if not detected from Config.ashx
    }
    maxUpSizeStr = String(maxUpSize);
    var tbar = {
        itemId: 'dnd-upload-ignore-path',
        xtype: 'checkbox',
        checked: false,
        hideLabel: true,
        boxLabel: config.htcConfig.locData.UploadJavaIgnorePaths
    };
    var self = new Ext.FormPanel({
        fileUpload: true,
        frame: false,
        bodyStyle: 'padding: 5px 5px 0 5px;',
        border: false,
        bodyBorder: false,
        header: false,
        layout: 'fit',
        filesInProgress: 0,
        filesNextIndex: 0,
        aborted: false,
        balloonShowedAfterAbort: false,
        defaults: { anchor: '100%' },
        statusIcons: {
            "none": "none",
            "upload": "ajax-loader.gif",
            "uploaderror": "error",
            "uploadabort": "error",
            "uploadend": "apply"
        },
        items: [uploadDnDGridPanel = new Ext.grid.GridPanel({
            header: false,
            height: 156,
            loadMask: true,
            enableHdMenu: false,
            autoExpandColumn: 'file-name-dnd-upload',
            headerAsText: true,
            header: true,
            headerCfg: {
                cls: 'x-panel-header dnd-note',
                html: config.htcConfig.locData[HttpCommander.Lib.Utils.browserIs.dndFolders
                            ? 'DndFileUploadingAllowDropFoldersMsg' : 'DndFileUploadingDontDropFoldersMsg']
                    + (!chunked
                        ? '<br />'
                            + String.format(config.htcConfig.locData.UploadOneFileMaxSizeMessage,
                                config.getRenderers().sizeRenderer(maxUpSizeStr))
                        : '')
                    + (pasteSreens ? ('<br />' + config.htcConfig.locData.ClipboardScreenshotHint
                        + (pasteFiles ? (' ' + config.htcConfig.locData.ClipboardFileHint) : ''))
                        : '')
            },
            tbar: HttpCommander.Lib.Utils.browserIs.dndFolders ? [tbar] : undefined,
            bbar: [{
                xtype: 'label',
                text: '',
                html: '&nbsp;'
            }],
            headerCssClass: 'custom-header',
            headerStyle: 'background-color:white;color:black;background-image:none;font-weight:normal;',
            store: new Ext.data.JsonStore({
                autoSave: false,
                remoteSort: false,
                totalProperty: 'total',
                pruneModifiedRecords: false,
                autoLoad: true,
                autoDestroy: true,
                data: [],
                idProperty: 'fileid',
                fields:
                [
                    { name: 'fileid', type: 'string' },
                    { name: 'filestatus', type: 'string' }, /* none, upload, uploadend, uploaderror, uploadabort */
                    { name: 'filename', type: 'string' },
                    { name: 'filesize', type: 'int' },
                    { name: 'progress', type: 'float' },
                    { name: 'error', type: 'string' },
                    { name: 'deletefile', type: 'string' }
                ],
                listeners: {
                    update: function (store, rec, op) {
                        //setTimeout(function () {
                        if (op === 'commit') {
                            var hideError = true;
                            var complete = store.getCount() > 0;
                            var errorRegEx = /error$|abort$/;
                            var filesSaved = 0;
                            var filesRejected = 0;
                            Ext.each(store.data.items, function (r) {
                                if (hideError && r.data.error && r.data.error != '') {
                                    hideError = false;
                                }
                                if (r.data.filestatus === 'uploadend') {
                                    filesSaved++;
                                } else if (r.data.filestatus.match(errorRegEx)) {
                                    filesRejected++;
                                } else {
                                    complete = false;
                                }
                            });
                            if (complete && (self.filesNextIndex < store.getCount() || self.filesInProgress > 0))
                                complete = false;
                            if (!complete && self.aborted)
                                complete = true;
                            var cm = uploadDnDGridPanel.getColumnModel();
                            if (cm)
                                cm.setHidden(cm.getIndexById('file-error-message'), hideError);//, true);
                            var curFolder = self.curFolderForUplaod || config.getCurrentFolder();
                            if (curFolder && complete && !self.balloonShowedAfterAbort) {
                                if (self.aborted)
                                    self.balloonShowedAfterAbort = true;
                                //else
                                    self.abortXHRUA();
                                config.openTreeRecent();
                                config.openGridFolder(curFolder, true, true);

                                var balloonText = String.format(
                                    config.htcConfig.locData.BalloonFilesUploaded, filesSaved
                                );
                                if (filesRejected > 0)
                                    balloonText += ". " + String.format(
                                        config.htcConfig.locData.BalloonFilesNotUploaded,
                                        filesRejected) + ".";
                                config.showBalloon(balloonText);
                                self.changeDnDButtons(false);
                                config.getDnDZone().dndShare.isNotDnDUploading = true;
                                cm.setHidden(cm.getIndexById('file-dnd-delete'), false);//, true);
                                var gView = uploadDnDGridPanel.getView();
                                window.clearInterval(self.updateViewTask);
                                self.busyViewUpdate = false;
                                if (!!gView) {
                                    gView.skipLayoutOnUpdateColumnHidden = false;
                                }
                            } else if (complete) {
                                var gView = uploadDnDGridPanel.getView();
                                window.clearInterval(self.updateViewTask);
                                self.busyViewUpdate = false;
                                if (!!gView) {
                                    gView.skipLayoutOnUpdateColumnHidden = false;
                                }
                            }
                        }
                        //}, 10);
                    }
                }
            }),
            listeners: {
                render: function (dndGrid) {
                    if (config.getDnDZone()) {
                        config.getDnDZone().addDnDEvents();
                    }
                },
                cellclick: function (g, r, c, e) {
                    var store = g.getStore();
                    var rec = store.getAt(r);
                    var cm = g.getColumnModel();
                    if (cm.getDataIndex(c) == 'deletefile' && !cm.isHidden(c)
                        && rec.get('filestatus') != 'upload') {
                        var i = rec.get('fileid');
                        store.remove(rec);
                        var foundFileIndex = -1;
                        var foundFileObj = null;
                        Ext.each(config.getDnDZone().dndShare.dndFiles, function (fileItem, j) {
                            if (i == fileItem.fileid) {
                                foundFileObj = fileItem;
                                foundFileIndex = j;
                            }
                        });
                        if (foundFileIndex >= 0) {
                            self.filesTotalSize -= foundFileObj.size;
                            if (self.filesTotalSize < 0) {
                                self.filesTotalSize = 0;
                            }
                            config.getDnDZone().dndShare.dndFiles.splice(foundFileIndex, 1);
                            self.updateFilesFoldersInfo();
                        }
                        uploadDnDGridPanel.getView().syncScroll();
                    }
                }
            },
            selModel: new Ext.grid.RowSelectionModel({}),
            columns: [{
                id: 'file-name-dnd-upload',
                sortable: true,
                header: config.htcConfig.locData.CommonFieldLabelName,
                dataIndex: 'filename',
                renderer: function (val, cell, rec) {
                    cell.attr = '';
                    if (val && val != '')
                        cell.attr = 'ext:qtip="' + Ext.util.Format.htmlEncode(val) + '" ext:qchilds="true"';
                    if (rec.get('filestatus') === 'none')
                        return Ext.util.Format.htmlEncode(val || '');
                    return "<img src='" + HttpCommander.Lib.Utils.getIconPath(config, self.statusIcons[rec.get('filestatus')] ? self.statusIcons[rec.get('filestatus')] : "none")
                        + "' class='filetypeimage'>" + Ext.util.Format.htmlEncode(val || '');
                }
            }, {
                id: 'file-size-dnd-upload',
                sortable: true,
                header: config.htcConfig.locData.CommonFieldLabelSize,
                dataIndex: 'filesize',
                renderer: config.getRenderers().sizeNegRenderer,
                align: 'right'
            }, {
                id: 'file-progress-upload',
                sortable: true,
                header: config.htcConfig.locData.DnDGridProgressColumn,
                dataIndex: 'progress',
                align: 'center',
                width: 75,
                renderer: function (val) {
                    var str;
                    if ((!val || val == '' || val < 0) && val !== 0)
                        str = '';
                    else if (val > 100)
                        str = '100%';
                    else
                        str = Ext.util.Format.htmlEncode(val.toString()) + '%';
                    return str;
                }
            }, {
                id: 'file-error-message',
                sortable: true,
                header: config.htcConfig.locData.CommonErrorCaption,
                dataIndex: 'error',
                hidden: true,
                renderer: config.getRenderers().wordWrapRendererWithoutEncoding
            }, {
                id: 'file-dnd-delete',
                sortable: false,
                resizable: false,
                groupable: false,
                header: '&nbsp;',
                dataIndex: 'deletefile',
                align: 'center',
                width: 25,
                renderer: function (val, cell, rec) {
                    var show = rec.get('filestatus') != 'upload';
                    if (show) {
                        return "<img style='cursor:pointer' src='"
                            + HttpCommander.Lib.Utils.getIconPath(config, 'delete') + "' class='filetypeimage' >";
                    }
                    return '&nbsp;';
                }
            }]
        })],
        abortXHRUA: function () {
            if (config.getDnDZone().dndShare.fileReadersXHRUArray) {
                for (var i = 0; i < config.getDnDZone().dndShare.fileReadersXHRUArray.length; i++) {
                    if (!!config.getDnDZone().dndShare.fileReadersXHRUArray[i].xhru) {
                        if (Ext.isFunction(config.getDnDZone().dndShare.fileReadersXHRUArray[i].xhru.stop)) {
                            config.getDnDZone().dndShare.fileReadersXHRUArray[i].xhru.stop();
                        } else if (config.getDnDZone().dndShare.fileReadersXHRUArray[i].xhru.readyState != 4) {
                            config.getDnDZone().dndShare.fileReadersXHRUArray[i].xhru.abort();
                        }
                    }
                }
            }
            config.getDnDZone().dndShare.fileReadersXHRUArray = [];
        },
        buttons: [{
            text: config.htcConfig.locData.StopUploadingButtonText,
            disabled: true,
            handler: function () {
                self.aborted = true;
                setTimeout(function () { self.abortXHRUA(); }, 1);
                self.changeDnDButtons(false);
            }
        }, {
            text: config.htcConfig.locData.UploadSimpleReset,
            handler: function () {
                config.getDnDZone().dndShare.dndFiles = [];
                config.getDnDZone().dndShare.fileReadersXHRUArray = [];
                self.getForm().reset();
                var dndStore = uploadDnDGridPanel.getStore();
                var gView = uploadDnDGridPanel.getView();
                if (!!gView) {
                    gView.skipSyncFocusRow = true;
                    gView.skipLayoutOnUpdateColumnHidden = false;
                }
                if (!!dndStore) {
                    dndStore.loadData([]);
                    dndStore.commitChanges();
                    dndStore.fireEvent('update', dndStore, null, 'commit');
                }
                self.foldersCount = 0;
                self.filesTotalSize = 0;
                self.updateFilesFoldersInfo();
                uploadDnDGridPanel.getView().syncScroll();
            }
        }, {
            text: config.htcConfig.locData.UploadSimpleUpload,
            handler: function (b, e, f) {
                self.curFolderForUplaod = null;

                var gView = uploadDnDGridPanel.getView();
                if (!!gView) {
                    gView.skipSyncFocusRow = true;
                    gView.skipLayoutOnUpdateColumnHidden = false;
                }

                if (self.getForm().isValid() &&
                    config.getDnDZone().dndShare.dndFiles &&
                    config.getDnDZone().dndShare.dndFiles.length > 0 &&
                    config.getDnDZone()) {

                    var curFolder = Ext.isEmpty(f) ? config.getCurrentFolder() : f;

                    if (!curFolder) {
                        config.Msg.alert(config.htcConfig.locData.UploadFolderNotSelectedTitle,
                            config.htcConfig.locData.UploadFolderNotSelected
                        );
                        return;
                    }
                    if (!config.htcConfig.currentPerms || !config.htcConfig.currentPerms.upload) {
                        config.Msg.alert(config.htcConfig.locData.UploadNotAllowedTitle,
                            config.htcConfig.locData.UploadNotAllowedPrompt
                        );
                        return;
                    }

                    var showWarning = false;
                    var notEmpty = false;
                    var fileItem;
                    var ignorePath = false;
                    var toptb = null;
                    if (toptb = uploadDnDGridPanel.getTopToolbar()) {
                        ignorePath = toptb.items.items[0].getValue();
                    }

                    for (var i = 0; i < config.getDnDZone().dndShare.dndFiles.length; i++) {
                        notEmpty = true;
                        fileItem = config.getDnDZone().dndShare.dndFiles[i];
                        var fileOrFolderName = '';
                        if (!ignorePath && fileItem.relativePath && fileItem.relativePath.length > 1) {
                            fileOrFolderName = fileItem.relativePath.substring(1).split(/[\/\\]/)[0];
                        }
                        if (!fileOrFolderName || fileOrFolderName.length == 0) {
                            fileOrFolderName = fileItem.name;
                        }
                        if (config.gridItemExists(fileOrFolderName)) {
                            showWarning = true;
                        }
                    }

                    if (!notEmpty) {
                        return;
                    }

                    if (showWarning) {
                        var modify = config.isModifyAllowed();
                        config.Msg.show({
                            title: config.htcConfig.locData.UploadFilesAlreadyExists,
                            msg: modify
                                ? String.format(config.htcConfig.locData.UploadOverwriteOrRenameFiles,
                                    config.htcConfig.locData.ExtMsgButtonTextYES,
                                    config.htcConfig.locData.ExtMsgButtonTextNO
                                    )
                                : config.htcConfig.locData.UploadRenamedExistingFiles,
                            buttons: modify ? config.Msg.YESNOCANCEL : config.Msg.OKCANCEL,
                            icon: modify ? config.Msg.QUESTION : config.Msg.INFO,
                            fn: function (btn) {
                                if (btn == 'ok' || btn == 'yes' || btn == 'no') {
                                    self.dndFilesReadUpload(uploadDnDGridPanel, curFolder, btn == 'ok' || btn == 'no', chunked);
                                }
                            }
                        });
                    } else {
                        self.dndFilesReadUpload(uploadDnDGridPanel, curFolder, true, chunked);
                    }
                }
            }
        }],
        changeDnDButtons: function (disabled) {
            if (self.buttons.length > 2) {
                self.buttons[0].setDisabled(!disabled);
                self.buttons[1].setDisabled(disabled);
                self.buttons[2].setDisabled(disabled);
            }
        },
        getUploadDnDGridPanel: function () {
            return uploadDnDGridPanel;
        },
        dndFilesReadUpload: function (dndGrid, folderPath, rename, chunks) {
            config.getDnDZone().dndShare.fileReadersXHRUArray = [];
            self.changeDnDButtons(true);
            self.aborted = false;
            self.balloonShowedAfterAbort = false;
            window.clearInterval(self.updateViewTask);
            window.busyViewUpdate = false;
            if (config.getDnDZone().dndShare.dndFiles && config.getDnDZone().dndShare.dndFiles.length > 0) {
                config.getDnDZone().dndShare.isNotDnDUploading = false;
                if (dndGrid) {
                    var gView = dndGrid.getView();
                    if (!!gView) {
                        gView.skipLayoutOnUpdateColumnHidden = true;
                        gView.skipSyncFocusRow = true;
                    }
                    var store = dndGrid.getStore();
                    if (!!store) {
                        if (!!gView) {
                            self.updateViewTask = window.setInterval(function () {
                                if (window.busyViewUpdate === true) {
                                    return;
                                }
                                window.busyViewUpdate = true;
                                if (!!gView) {
                                    gView.layout();
                                }
                                window.busyViewUpdate = false;
                            }, 500);
                        }
                        var cm = dndGrid.getColumnModel();
                        if (!!cm) {
                            cm.setHidden(cm.getIndexById('file-dnd-delete'), true);//, true);
                        }
                        self.filesInProgress = 0;
                        self.filesNextIndex = 0;
                        self.dndFilesUploadPage(folderPath, rename, chunks);
                    }
                }
            }
        },
        dndFilesUploadPage: function (folderPath, rename, chunks) {
            if (self.aborted) {
                return;
            }
            self.curFolderForUplaod = folderPath;
            var store = uploadDnDGridPanel.getStore(),
                i = self.filesNextIndex,
                len = config.getDnDZone().dndShare.dndFiles.length;
            var ignorePath = false;
            var toptb = null;
            if (!!(toptb = uploadDnDGridPanel.getTopToolbar())) {
                ignorePath = toptb.items.items[0].getValue();
            }
            for (; i < len && self.filesInProgress < blockFilesCount; i++) {
                self.filesNextIndex++;
                var j = store.findExact('fileid', config.getDnDZone().dndShare.dndFiles[i].fileid);
                if (j > -1) {
                    self.filesInProgress++;
                    var rec = store.getAt(j);
                    rec.set('filestatus', 'none');
                    rec.set('progress', 0);
                    rec.set('error', '');
                    rec.commit();
                    config.getDnDZone().dndShare.fileReadersXHRUArray.push({
                        idx: rec.get("fileid"),
                        xhru: null
                    });
                    self.dndFileUpload(rec, config.getDnDZone().dndShare.dndFiles[i], folderPath, rename, ignorePath, chunks);
                }
            }
        },
        dndFileUpload: function (rec, file, folderPath, rename, ignorePath, chunks) {
            var xhr, chu, useChunks = (chunks && file.size > maxUpSize);// 0);

            if (useChunks) {
                chu = new HttpCommander.Lib.Html5ChunkedUpload({
                    url: config.htcConfig.relativePath + 'Handlers/ChunkedUpload.ashx',
                    chunkSize: defChunkSize,

                    onUploadStart: function (e) {
                        rec.set("filestatus", "upload");
                        rec.set("progress", 0);
                        rec.set("error", "");
                        rec.commit();
                    },
                    //onUploadStop: onUploadStop,
                    //onUploadComplete: onUploadComplete,

                    onFileUploadStart: function (e) {
                        rec.set("filestatus", "upload");
                        rec.set("progress", 0);
                        rec.set("error", "");
                        rec.commit();
                    },
                    onFileUploadStop: function (e) {
                        rec.set("filestatus", "uploadabort");
                        rec.set("progress", -1);
                        rec.set("error", config.htcConfig.locData.DnDFileUploadingAbort);
                        rec.commit();
                    },
                    onFileUploadComplete: function (e) {
                        if (self.filesInProgress > 0)
                            self.filesInProgress--;

                        rec.set("filestatus", "uploadend");
                        rec.set("error", "");
                        rec.set("progress", 100);
                        rec.commit();

                        if (self.filesInProgress == 0 && !self.aborted) {
                            self.dndFilesUploadPage(folderPath, rename, chunks);
                        }
                    },
                    onFileUploadError: function (f, i, e) {
                        if (self.filesInProgress > 0)
                            self.filesInProgress--;

                        rec.set("filestatus", "uploaderror");
                        rec.set("progress", -1);
                        rec.set("error", String.format(config.htcConfig.locData.DnDFileUploadingError,
                            (!!i ? ('' + i + '. ') : '') + e + '.')
                        );
                        rec.commit();

                        if (self.filesInProgress == 0 && !self.aborted) {
                            self.dndFilesUploadPage(folderPath, rename, chunks);
                        }
                    },
                    onFileUploadProgress: function (f, p) {
                        if (!!p && p.totalSize > 0) {
                            var persent = ((p.uploadedSize * 100.0) / p.totalSize).toFixed(2);
                            if (persent >= 100) {
                                persent = 99.99;
                            }
                            rec.set("progress", persent);
                            rec.commit();
                        }
                    },
                });
            }

            if (!!chu) {
                xhr = chu;
            } else {
                xhr = new XMLHttpRequest();
            }

            if (config.getDnDZone().dndShare.fileReadersXHRUArray) {
                for (var i = 0; i < config.getDnDZone().dndShare.fileReadersXHRUArray.length; i++) {
                    if (config.getDnDZone().dndShare.fileReadersXHRUArray[i].idx == rec.get('fileid')) {
                        config.getDnDZone().dndShare.fileReadersXHRUArray[i].xhru = xhr;
                        break;
                    }
                }
            }

            if (!!chu) {
                var uploadInfoForChunked = {
                    'Path': folderPath,
                    'IgnorePath': '' + ignorePath,
                    'DnD': 'true'
                };
                if (rename || HttpCommander.Lib.Utils.browserIs.ios) {
                    uploadInfoForChunked['Rename'] = 'true';
                }
                chu.addFiles({ files: [file] });
                chu.setUploadInfo(uploadInfoForChunked);
                chu.upload();
                return;
            }

            xhr.upload.addEventListener("loadstart", function (e) {
                rec.set("filestatus", "upload");
                rec.set("progress", 0);
                rec.set("error", "");
                rec.commit();
            }, false);
            xhr.upload.addEventListener("progress", function (e) {
                if (e.lengthComputable && e.total > 0) {
                    var persent = ((e.loaded * 100) / e.total).toFixed(2);
                    if (persent >= 100)
                        persent = 99.99;
                    rec.set("progress", persent);
                    rec.commit();
                }
            }, false);
            xhr.upload.addEventListener("error", function (e) {
                rec.set("filestatus", "uploaderror");
                rec.set("progress", -1);
                rec.set("error", String.format(config.htcConfig.locData.DnDFileUploadingError,
                    config.htcConfig.locData.DnDFileUploadingStatusCode + ": "
                        + xhr.status.toString() + ". " + xhr.statusText + ".")
                );
                rec.commit();
            }, false);
            xhr.upload.addEventListener("abort", function (e) {
                rec.set("filestatus", "uploadabort");
                rec.set("progress", -1);
                rec.set("error", config.htcConfig.locData.DnDFileUploadingAbort);
                rec.commit();
            }, false);

            var postUrl = config.htcConfig.relativePath + 'Handlers/DragNDropUpload.ashx?path='
                + encodeURIComponent(folderPath) + '&name=' + encodeURIComponent((file.relativePath && file.relativePath.length > 1
                    ? file.relativePath.substring(1) : '') + file.name)
                + (rename ? '&rename=true' : '');
            if (ignorePath) {
                postUrl += '&ignorepath=true';
            }
            if (file.size < 0) {
                postUrl += '&folder=true';
            }

            xhr.open("POST", postUrl, true);
            xhr.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;

            var fd = new FormData();
            fd.append("file", file);

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (self.filesInProgress > 0)
                        self.filesInProgress--;
                    var res = "";
                    try {
                        res = eval("(" + xhr.responseText + ')');
                    } catch (e) {
                        res = xhr.responseText;
                    }
                    if (res.success) {
                        rec.set("filestatus", "uploadend");
                        rec.set("error", "");
                        rec.set("progress", 100);
                        rec.commit();
                    } else {
                        rec.set("progress", -1);
                        rec.set("filestatus", "uploaderror");
                        if (res.msg) {
                            rec.set("error", String.format(
                                config.htcConfig.locData.DnDFileUploadingError, res.msg
                            ));
                        } else {
                            rec.set("error", String.format(config.htcConfig.locData.DnDFileUploadingError,
                                (typeof res == 'string' ? (Ext.util.Format.htmlEncode(res) + '. ') : '')
                                + config.htcConfig.locData.DnDFileUploadingStatusCode + ": "
                                + Ext.util.Format.htmlEncode(xhr.status.toString()) + ". "
                                + Ext.util.Format.htmlEncode(xhr.statusText) + "."));
                        }
                        var hr = xhr.getAllResponseHeaders();
                        if ((res && res != "") || (hr && hr != ""))
                            rec.commit();
                    }
                    if (self.filesInProgress == 0 && !self.aborted) {
                        self.dndFilesUploadPage(folderPath, rename, chunks);
                    }
                }
            };

            xhr.send(fd);
        },
        foldersCount: 0,
        filesTotalSize: 0,
        updateFilesFoldersInfo: function () {
            setTimeout(function () {
                var lbl = uploadDnDGridPanel.getBottomToolbar().items.items[0];
                if (lbl) {
                    var dndfls = config.getDnDZone().dndShare.dndFiles;
                    var len = 0, emptyFolders = 0;
                    for (var i = 0; i < dndfls.length; i++) {
                        if (dndfls[i].size >= 0) {
                            len++;
                        } else {
                            emptyFolders++;
                        }
                    }
                    lbl.setText(String.format(config.htcConfig.locData.DndFileUploadingFilesSummaryInfo,
                    '<b>' + len + '</b>',
                    '<b>' + config.getRenderers().sizeRenderer(self.filesTotalSize)
                        + (emptyFolders > 0 ? (', ' + config.htcConfig.locData.GridTotalFoldersLabel + ':&nbsp;' + emptyFolders) : '')
                        + '</b>'), false);
                }
            }, 10);
        },
        _addDndFile: function (file) {
            setTimeout(function () {
                var dndStore = uploadDnDGridPanel.getStore();

                if (!!dndStore && config.getDnDZone().dndShare.isNotDnDUploading && file.name != '' && file.name != '.') {
                    // check size on over maxUpSize (by default - 2GB) and support chunks
                    if (file.size > maxUpSize && !chunked) {
                        return;
                    }

                    var num = -1;
                    var fullFilePath = (file.relativePath ? file.relativePath.toLowerCase() : '') + file.name.toLowerCase();
                    for (j = 0; j < config.getDnDZone().dndShare.dndFiles.length; j++) {
                        var existsFile = config.getDnDZone().dndShare.dndFiles[j];
                        var fullPath = (existsFile.relativePath ? existsFile.relativePath.toLowerCase() : '') + existsFile.name.toLowerCase();
                        if (fullPath === fullFilePath) {
                            num = j;
                            break;
                        }
                    }
                    file.fileid = Ext.id();
                    var rec = new Ext.data.Record({
                        fileid: file.fileid, // num > -1 ? num : config.getDnDZone().dndShare.dndFiles.length,
                        filestatus: 'none',
                        filename: (file.relativePath && file.relativePath.length > 1 ? file.relativePath.substring(1) : '') + file.name,
                        filesize: file.size,
                        progress: -1,
                        error: '',
                        deletefile: ''
                    });
                    if (num > -1) {
                        self.filesTotalSize -= config.getDnDZone().dndShare.dndFiles[num].size;
                        if (self.filesTotalSize < 0)
                            self.filesTotalSize = 0;
                        config.getDnDZone().dndShare.dndFiles.splice(num, 1, file);
                        dndStore.insert(num, [rec]);
                        dndStore.removeAt(num + 1);
                    } else {
                        config.getDnDZone().dndShare.dndFiles.push(file);
                        dndStore.add([rec]);
                    }
                    dndStore.commitChanges();
                    dndStore.fireEvent('update', dndStore, null, 'commit');
                    if (file.size >= 0) {
                        self.filesTotalSize += file.size;
                        self.updateFilesFoldersInfo();
                    }
                }
            }, 0);
        },
        toArray: function (list) {
            return Array.prototype.slice.call(list || [], 0);
        },
        _traverseFileTree: function (_item, pathItem) {
            var path = pathItem || '';
            var item = _item;
            setTimeout(function () {
                if (item && item.isFile) {
                    item.file(function (file) {
                        file.webkitRelativePath = path;
                        file.relativePath = path;
                        self._addDndFile(file);
                    });
                } else if (item && item.isDirectory) {
                    var dirReader = item.createReader();
                    var entries = [];

                    var listEntries = function (entires) {
                        self.foldersCount++;
                        self.updateFilesFoldersInfo();
                        if (entries.length > 0) {
                            for (var i = 0; i < entries.length; i++) {
                                self._traverseFileTree(entries[i], path + item.name + "/");
                            }
                        } else { // add folder structure
                            self._addDndFile({
                                name: item.name,
                                relativePath: path,
                                webkitRelativePath: path,
                                size: -1,
                                type: 'folder'
                            });
                        }
                    };
                    // Keep calling readEntries() until no more results are returned.
                    var readEntries = function () {
                        dirReader.readEntries(function (results) {
                            if (!results.length) {
                                listEntries(entries.sort());
                            } else {
                                entries = entries.concat(self.toArray(results));
                                readEntries();
                            }
                        }, function () { /* ignore */ });
                    };

                    readEntries();

                    /*
                    dirReader.readEntries(function (entries) {
                        self.foldersCount++;
                        self.updateFilesFoldersInfo();
                        for (var i = 0; i < entries.length; i++)
                            self._traverseFileTree(entries[i], path + item.name + "/");
                    }, function () { });
                    */
                } else if (item) { // Blob (after paste CTRL+V screenshot)
                    item.webkitRelativePath = path;
                    item.relativePath = path;
                    self._addDndFile(item);
                }
            }, 0);
        },
        _addFiles: function (transferFiles, pasted) {
            // main loop
            for (var i = 0, lenFiles = transferFiles.length; i < lenFiles; i++) {
                var file = transferFiles[i],
                    _file = null, ext;
                if (!file || (!Ext.isEmpty(file.kind) && file.kind != 'file')) {
                    continue;
                }
                if (Ext.isFunction(file.webkitGetAsEntry) || Ext.isFunction(file.getAsFile)) {
                    try { // try .. catch for Edge when pasted screenshot
                        if (Ext.isFunction(file.webkitGetAsEntry)) {
                            _file = file.webkitGetAsEntry();
                        }
                    } catch (e) { }
                    if (!_file && Ext.isFunction(file.getAsFile)) {
                        _file = file.getAsFile();
                    }
                    if (!_file) {
                        _file = file;
                    }
                    if (Ext.isEmpty(_file.name)) {
                        if (config.htcConfig.enablePasteImages === true) {
                            _file.name = self._getScreenshotName(_file);
                        } else {
                            continue;
                        }
                    }
                    self._traverseFileTree(_file, '/');
                } else {
                    if (Ext.isEmpty(file.name)) {
                        if (config.htcConfig.enablePasteImages === true) {
                            file.name = self._getScreenshotName(file);
                        } else {
                            continue;
                        }
                    }
                    self._addDndFile(file);
                }
            }
        },
        _getScreenshotName: function (file) {
            var ext = file.type;
            if (!Ext.isEmpty(ext)) {
                ext = file.type.split('/');
                ext = ext[ext.length - 1];
            }
            return config.htcConfig.locData.ClipboardScreenshotTitlePrefix
                + '_' + (new Date()).format('Y-m-d_H.i.s')
                + (!Ext.isEmpty(ext) && ext.trim().length > 0 ? ('.' + ext) : '');
        },
        addFiles: function (transferFiles, pasted, tog) {
            var dndStore = uploadDnDGridPanel.getStore();
            var i, j, fileItem, lenFiles;
            var gView = uploadDnDGridPanel.getView();
            self.busyViewUpdate = false;
            window.clearInterval(self.updateViewTask);
            if (!!gView) {
                gView.skipLayoutOnUpdateColumnHidden = true;
                gView.skipSyncFocusRow = true;
                self.updateViewTask = window.setInterval(function () {
                    if (window.busyViewUpdate === true) {
                        return;
                    }
                    window.busyViewUpdate = true;
                    if (!!gView) {
                        gView.layout();
                    }
                    window.busyViewUpdate = false;
                }, 500);
            }

            if (!!dndStore) {
                for (i = config.getDnDZone().dndShare.dndFiles.length - 1; i >= 0; i--) {
                    fileItem = config.getDnDZone().dndShare.dndFiles[i];
                    j = dndStore.findExact('fileid', fileItem.fileid);
                    if (j > -1) {
                        var rec = dndStore.getAt(j);
                        if (rec.get('filestatus') != 'none') {
                            self.filesTotalSize -= fileItem.size;
                            if (self.filesTotalSize < 0) {
                                self.filesTotalSize = 0;
                            }
                            config.getDnDZone().dndShare.dndFiles.splice(i, 1);
                            dndStore.remove(rec);
                            self.updateFilesFoldersInfo();
                        }
                    }
                }
                dndStore.commitChanges();
                dndStore.fireEvent('update', dndStore, null, 'commit');
            }

            self._addFiles(transferFiles, pasted);

            // open grid or tree folder if dropped into highlighted item
            if (Ext.isObject(tog)) {
                setTimeout(function () {
                    if (!!tog.node) {
                        config.openGridFolder(tog.node.attributes.path, true);
                    } else if (!!tog.rec && tog.rec.data.rowtype == 'folder') {
                        config.openGridFolder(tog.rec.virtPath);
                    }
                }, 200);
            }
        }
    });
    return self;
};