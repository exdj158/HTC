Ext.ns('HttpCommander.Lib');

/**
 *  SkyDrive Tree Loader (extend Ext.tree.TreeLoader)
 */
HttpCommander.Lib.SkyDriveTreeLoader = Ext.extend(Ext.tree.TreeLoader, {
    onlyFolders: false,
    api: null,
    load: function (node, callback, scope) {
        if (this.clearOnLoad) {
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
        }
        if (this.doPreload(node)) { // preloaded json children
            this.runCallback(callback, scope || node, [node]);
        } else if (this.api || this.directFn || this.dataUrl || this.url) {
            this.requestData(node, callback, scope || node);
        }
    },
    skyDriveFolderTypes: ['folder', 'album', 'MS.FileServices.Folder', 'Folder'],
    requestData: function (node, callback, scope) {
        if (this.fireEvent("beforeload", this, node, callback) !== false) {
            if (this.api) {
                var sc = this,
                    argument = {
                        'callback': callback,
                        'node': node,
                        'scope': scope
                    },
                    types = this.skyDriveFolderTypes;
                sc.api.getFileList(function (list, error, connect) {
                    if (list && Ext.isArray(list)) {
                        var childs = [],
                            checked = node && node.attributes && node.attributes.checked && !sc.onlyFolders;
                        Ext.each(list, function (item, index, allItems) {
                            var isBusinessItem = item && typeof item['@odata.id'] != 'undefined';
                            var isFile = types.indexOf(item.type) < 0;
                            if (item && item.type.toLowerCase() != 'notebook' && (!sc.onlyFolders || (sc.onlyFolders && !isFile))) {
                                var chn = Ext.copyTo({
                                    'title': item.name,
                                    'leaf': isFile,
                                    'file': isFile,
                                    'checked': checked && isFile
                                }, item, 'id size type link parent_id count name');
                                if (isBusinessItem) {
                                    chn.count = item.childCount;
                                    chn.businessUrl = item.webUrl;
                                    if (item.parentReference)
                                        chn.parent_id = item.parentReference.id;
                                    if (!isFile && item.childCount === 0) {
                                        chn.leaf = true;
                                        chn.icon = HttpCommander.Lib.Utils.getIconPath(sc.htcConfig, 'folder-open')
                                    }
                                } else {
                                    chn.url = item.upload_location;
                                }
                                childs.push(chn);
                            }
                        });
                        sc.handleResponse.apply(sc, [{
                            'responseData': childs,
                            'argument': argument
                        }]);
                    } else {
                        sc.handleFailure.apply(sc, [{
                            'error': error,
                            'connect': connect,
                            'argument': argument
                        }]);
                    }
                }, sc.onlyFolders, // only folders flag
                    node.attributes.parent_id || node.parentNode ? node.id : 'root', // current node id
                        node.attributes.businessUrl); // url for business account
            }
        } else {
            this.runCallback(callback, scope || node, []);
        }
    }
});

/**
 *  config:
 *  htcConfig, Msg, Window, getSkyDriveAuth(), getUid(),
 *  getCurrentSelectedSet(), openGridFolder(), getCurrentFolder(),
 *  showBalloon(), isDemoMode(), setSelectPath(), openTreeRecent()
 */
HttpCommander.Lib.Editor365Window = function (config) {
    var cn = HttpCommander.Lib.Consts.CloudNames.office365,
        self;

    self = new config.Window({
        title: config.htcConfig.locData.CommandEditInOffice365,
        bodyStyle: 'padding: 5px',
        layout: 'fit',
        width: 400,
        plain: true,
        minWidth: 320,
        minHeight: 200,
        height: 200,
        buttonAlign: 'center',
        closeAction: 'hide',
        collapsible: false,
        minimizable: false,
        closable: true,
        resizable: false,
        maximizable: false,
        modal: true,
        items: [{
            xtype: 'label',
            hideLabel: true,
            autoHeight: true,
            margins: '0 0 5 0',
            html: String.format
                (
                    config.htcConfig.locData.CloudAuthenticateMessage,
                    cn,
                    String.format(config.htcConfig.locData.CloudAuthenticateLink, cn),
                    "<br /><img align='absmiddle' width='16' height='16' src='"
                    + HttpCommander.Lib.Utils.getIconPath(config, 'office365') + "'/>&nbsp;"
                    + HttpCommander.Lib.Utils.getHelpLinkOpenTag(config.getUid(), "onedrive"),
                    "</a>"
                )
                + "<br /><br /><br /><div style='text-align:center;width:100%;'>"
                + "<img align='absmiddle' width='16' height='16' src='"
                + HttpCommander.Lib.Utils.getIconPath(config, 'office365') + "'>&nbsp;"
                + "<a id='" + config.getUid() + "_auth365Edit_link' href='#' target='_self'>"
                + String.format(config.htcConfig.locData.CloudAuthenticateLink, cn) + "</a>"
                + (config.isDemoMode() && !Ext.isEmpty(window.OneDriveForBusinessDemoName) && !Ext.isEmpty(window.OneDriveForBusinessDemoPass)
                    ? ('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="' + window.OneDriveForBusinessDemoName + '" />&nbsp;'
                            + '<input readonly onclick="this.select();" type="text" value="' + window.OneDriveForBusinessDemoPass + '" /></span>')
                    : '')
                + "</div>"
        }],
        buttons: [{
            text: config.htcConfig.locData.CommonButtonCaptionCancel,
            handler: function () { self.hide(); }
        }],
        listeners: {
            afterrender: function (wind) {
                var authLink = document.getElementById(config.getUid() + "_auth365Edit_link");
                if (authLink) {
                    authLink.onclick = function () {
                        config.getSkyDriveAuth().checkAuth(1, function (result, error) {
                            if (result && !error) {
                                self.hide();
                                if (self.deleteDoc === true) {
                                    self.deleteDocFrom365(self.docInfo);
                                } else {
                                    self.getEditedDocFromMS(self.waitId, self.docInfo, self.curFolder, self.fileName, self.create);
                                }
                            } else {
                                self.show();
                                var _error = Ext.isObject(error) ? error.error_description : error;
                                if (!Ext.isEmpty(_error)) {
                                    config.Msg.show({
                                        title: config.htcConfig.locData.CommonErrorCaption,
                                        msg: _error,
                                        icon: config.Msg.ERROR,
                                        buttons: config.Msg.OK
                                    });
                                }
                            }
                        }, true, true);
                        return false;
                    };
                }
            }
        },
        deleteDocFrom365: function (docInfo) {
            self.docInfo = null;
            self.curFolder = null;
            self.fileName = null;
            self.create = null;
            self.deleteDoc = true;

            config.Msg.hide();
            self.hide();

            if (!config.htcConfig.enableOffice365Edit || !Ext.isObject(docInfo) || Ext.isEmpty(docInfo.id))
                return;

            self.docInfo = Ext.apply({}, docInfo);

            var authObj = config.getSkyDriveAuth();
            if (!Ext.isObject(authObj)) {
                config.Msg.hide();
                self.show();
                return;
            }
            var authInfo = authObj.getAuthInfo();
            if (!authInfo) {
                config.Msg.hide();
                self.show();
                return;
            }

            var wat = HttpCommander.Lib.Utils.cloneMsOAuthInfo(authInfo);

            var oldTA = Ext.Ajax.timeout;
            Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
            HttpCommander.OneDriveForBusiness.Delete({ id: docInfo.id, wat: wat }, function (data, trans) {
                Ext.Ajax.timeout = oldTA;
                config.globalLoadMask.hide();
                if (!HttpCommander.Lib.Utils.checkDirectHandlerResult(
                        data, trans, config.Msg, config.htcConfig)) {
                    if (typeof data == 'undefined') {
                        return;
                    } else if (!data.connect) {
                        authObj.clearAuth();
                        config.Msg.hide();
                        self.show();
                        return;
                    }
                }
            });
        },
        getEditedDocFrom365: function (waitId, docInfo, curFolder, fileName, create, suppressDelete) {
            self.waitId = null;
            self.docInfo = null;
            self.curFolder = null;
            self.fileName = null;
            self.create = null;
            self.deleteDoc = null;

            config.Msg.hide();
            self.hide();

            if (!config.htcConfig.enableOffice365Edit || !Ext.isObject(docInfo)
                || Ext.isEmpty(docInfo.id) || Ext.isEmpty(docInfo.eTag))
                return;

            self.docInfo = Ext.apply({}, docInfo);
            self.curFolder = curFolder;
            self.fileName = fileName;
            self.create = create;
            self.waitId = waitId;

            var authObj = config.getSkyDriveAuth();
            if (!Ext.isObject(authObj)) {
                config.Msg.hide();
                self.show();
                return;
            }
            var authInfo = authObj.getAuthInfo();
            if (!authInfo) {
                config.Msg.hide();
                self.show();
                return;
            }

            var uploadInfo = {
                edit: true,
                create: create,
                path: curFolder,
                ignorePaths: true,
                files: [{
                    name: fileName,
                    newName: !Ext.isEmpty(docInfo.newName) ? docInfo.newName : null,
                    id: docInfo.id,
                    url: docInfo.webLink
                }],
                folders: [],
                wat: HttpCommander.Lib.Utils.cloneMsOAuthInfo(authInfo),
                notdel: (suppressDelete === true)
            };

            var oldTA = Ext.Ajax.timeout;
            Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
            config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudUploadProgressMessage, cn) + "...";
            config.globalLoadMask.show();
            HttpCommander.OneDriveForBusiness.Upload(uploadInfo, function (data, trans) {
                Ext.Ajax.timeout = oldTA;
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";

                if (!HttpCommander.Lib.Utils.checkDirectHandlerResult(
                        data, trans, config.Msg, config.htcConfig)) {
                    if (typeof data == 'undefined') {
                        return;
                    } else if (!data.connect) {
                        authObj.clearAuth();
                        config.Msg.hide();
                        self.show();
                        return;
                    }
                }

                var editNewName = data.editNewName;
                if (!Ext.isEmpty(editNewName) && !Ext.isEmpty(waitId)) {
                    if (Ext.isArray(window['lastEdited365Doc'])) {
                        var i, item, len = window['lastEdited365Doc'].length;
                        for (i = 0; i < len; i++) {
                            item = window['lastEdited365Doc'][i] || {};
                            if (item.id === waitId && Ext.isObject(item.doc)) {
                                item.doc.newName = editNewName;
                                window['lastEdited365Doc'][i] = item;
                                break;
                            }
                        }
                    }
                }

                if (!Ext.isEmpty(data.editNewName)) {
                    config.setSelectPath({
                        name: data.editNewName,
                        path: uploadInfo.path
                    });
                }

                config.openTreeRecent();

                config.openGridFolder(uploadInfo.path);

                if (data.filesSaved && data.filesSaved > 0) {
                    var balloonText = String.format(config.htcConfig.locData.BalloonFilesUploaded,
                        data.filesSaved
                    );
                    if (data.filesRejected > 0)
                        balloonText += "<br />" + String.format(
                            config.htcConfig.locData.BalloonFilesNotUploaded,
                            data.filesRejected
                        );
                    if (data.message && data.message != '')
                        balloonText += "<br />" + data.message;
                    config.showBalloon(balloonText);
                }
            });
        }
    });

    return self;
};

/**
 *  config:
 *  htcConfig, Msg, Window, getSkyDriveAuth(), getUid(),
 *  getCurrentSelectedSet(), openGridFolder(), getCurrentFolder(),
 *  showBalloon(), setSelectPath(), isDemoMode(), openTreeRecent()
 */
HttpCommander.Lib.EditorMSOOWindow = function (config) {
    var cn = HttpCommander.Lib.Consts.CloudNames.onedrive,
        self;

    self = new config.Window({
        title: config.htcConfig.locData.CommandEditInMSOO,
        bodyStyle: 'padding: 5px',
        layout: 'fit',
        width: 400,
        plain: true,
        minWidth: 320,
        minHeight: 200,
        height: 200,
        buttonAlign: 'center',
        closeAction: 'hide',
        collapsible: false,
        minimizable: false,
        closable: true,
        resizable: false,
        maximizable: false,
        modal: true,
        items: [{
            xtype: 'label',
            hideLabel: true,
            autoHeight: true,
            margins: '0 0 5 0',
            html: String.format
                (
                    config.htcConfig.locData.CloudAuthenticateMessage,
                    cn,
                    String.format(config.htcConfig.locData.CloudAuthenticateLink, cn),
                    "<br /><img align='absmiddle' width='16' height='16' src='"
                    + HttpCommander.Lib.Utils.getIconPath(config, 'skydrive') + "'/>&nbsp;"
                    + HttpCommander.Lib.Utils.getHelpLinkOpenTag(config.getUid(), "onedrive"),
                    "</a>"
                )
                + "<br /><br /><br /><div style='text-align:center;width:100%;'>"
                + "<img align='absmiddle' width='16' height='16' src='"
                + HttpCommander.Lib.Utils.getIconPath(config, 'skydrive') + "'>&nbsp;"
                + "<a id='" + config.getUid() + "_authMSOOEdit_link' href='#' target='_self'>"
                + String.format(config.htcConfig.locData.CloudAuthenticateLink, cn) + "</a>"
                + (config.isDemoMode() && !Ext.isEmpty(window.OneDriveDemoName) && !Ext.isEmpty(window.OneDriveDemoPass)
                    ? ('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="' + window.OneDriveDemoName + '" />&nbsp;'
                            + '<input readonly onclick="this.select();" type="text" value="' + window.OneDriveDemoPass + '" /></span>')
                    : '')
                + "</div>"
        }],
        buttons: [{
            text: config.htcConfig.locData.CommonButtonCaptionCancel,
            handler: function () { self.hide(); }
        }],
        listeners: {
            afterrender: function (wind) {
                var authLink = document.getElementById(config.getUid() + "_authMSOOEdit_link");
                if (authLink) {
                    authLink.onclick = function () {
                        config.getSkyDriveAuth().checkAuth(1, function (result, error) {
                            if (result && !error) {
                                self.hide();
                                if (self.deleteDoc == true) {
                                    self.deleteDocFromMS(self.docInfo);
                                } else {
                                    self.getEditedDocFromMS(self.waitId, self.docInfo, self.curFolder, self.fileName, self.create);
                                }
                            } else {
                                self.show();
                                if (error) {
                                    config.Msg.show({
                                        title: config.htcConfig.locData.CommonErrorCaption,
                                        msg: error,
                                        icon: config.Msg.ERROR,
                                        buttons: config.Msg.OK
                                    });
                                }
                            }
                        }, true, false);
                        return false;
                    };
                }
            }
        },
        deleteDocFromMS: function (docInfo) {
            self.docInfo = null;
            self.curFolder = null;
            self.fileName = null;
            self.create = null;
            self.deleteDoc = true;

            config.Msg.hide();
            self.hide();

            if (!config.htcConfig.enableMSOOEdit || !Ext.isObject(docInfo) || Ext.isEmpty(docInfo.id))
                return;

            self.docInfo = Ext.apply({}, docInfo);

            var authObj = config.getSkyDriveAuth();
            if (!Ext.isObject(authObj)) {
                self.show();
                return;
            }

            authObj.checkAuth(1, function (result, error) {
                if (!self.docInfo || Ext.isEmpty(self.docInfo.id)) {
                    self.hide();
                    return;
                }
                if (result && !error) {
                    self.hide();
                    setTimeout(function () {
                        if (self && self.docInfo && !Ext.isEmpty(self.docInfo.id)) {
                            try {
                                WL.api({ 'path': self.docInfo.id, 'method': 'DELETE' }).then(
                                    function (response) { },
                                    function (responseFailed) {
                                        var errCode = ((responseFailed || {}).error || {}).code,
                                            errMess = ((responseFailed || {}).error || {}).message;
                                        if (Ext.isEmpty(errCode) || errCode == 'resource_not_found') {
                                            return;
                                        }
                                        if (errCode == 'request_token_missing' || errCode == 'request_token_expired') {
                                            self.show();
                                            return;
                                        }
                                        if (Ext.isEmpty(errMess)) {
                                            errMess = errCode;
                                        }
                                        if (!Ext.isEmpty(errMess)) {
                                            config.Msg.show({
                                                title: config.htcConfig.locData.CommonErrorCaption,
                                                msg: Ext.util.Format.htmlEncode(errMess),
                                                icon: config.Msg.ERROR,
                                                buttons: config.Msg.OK
                                            });
                                        }
                                    }
                                );
                            } catch (e) {
                                if (e && !Ext.isEmpty(e.message)) {
                                    config.Msg.show({
                                        title: config.htcConfig.locData.CommonErrorCaption,
                                        msg: Ext.util.Format.htmlEncode(e.message),
                                        icon: config.Msg.ERROR,
                                        buttons: config.Msg.OK
                                    });
                                }
                            }
                        }
                    }, 2000);
                } else {
                    self.show();
                    if (error) {
                        config.Msg.show({
                            title: config.htcConfig.locData.CommonErrorCaption,
                            msg: error,
                            icon: config.Msg.ERROR,
                            buttons: config.Msg.OK
                        });
                    }
                }
            }, false, false);
        },
        getEditedDocFromMS: function (waitId, docInfo, curFolder, fileName, create, suppressDelete) {
            self.waitId = null;
            self.docInfo = null;
            self.curFolder = null;
            self.fileName = null;
            self.create = null;
            self.deleteDoc = null;

            config.Msg.hide();
            self.hide();

            if (!config.htcConfig.enableMSOOEdit || !Ext.isObject(docInfo)
                || Ext.isEmpty(docInfo.id) || Ext.isEmpty(docInfo.source))
                return;

            self.docInfo = Ext.apply({}, docInfo);
            self.curFolder = curFolder;
            self.fileName = fileName;
            self.create = create;
            self.waitId = waitId;

            var authObj = config.getSkyDriveAuth();
            if (!Ext.isObject(authObj)) {
                config.Msg.hide();
                self.show();
                return;
            }
            var authInfo = authObj.getAuthInfo();
            if (!authInfo || !authInfo.access_token) {
                config.Msg.hide();
                self.show();
                return;
            }

            var uploadInfo = {
                edit: true,
                create: create,
                path: curFolder,
                ignorePaths: true,
                files: [{
                    name: fileName,
                    id: docInfo.id,
                    newName: !Ext.isEmpty(docInfo.newName) ? docInfo.newName : null,
                    url: docInfo.source
                }],
                folders: [],
                wat: HttpCommander.Lib.Utils.cloneMsOAuthInfo(authInfo),
                notdel: (suppressDelete === true)
            };

            var oldTA = Ext.Ajax.timeout;
            Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
            config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudUploadProgressMessage, cn) + "...";
            config.globalLoadMask.show();
            HttpCommander.SkyDrive.Upload(uploadInfo, function (data, trans) {
                Ext.Ajax.timeout = oldTA;
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";

                if (!HttpCommander.Lib.Utils.checkDirectHandlerResult(
                        data, trans, config.Msg, config.htcConfig)) {
                    if (typeof data == 'undefined') {
                        return;
                    } else if (!data.connect) {
                        authObj.clearAuth();
                        config.Msg.hide();
                        self.show();
                        if (Ext.isBoolean(data.session) && !data.session) {
                            config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, "LiveConnectSession not created");
                        }
                        return;
                    }
                }

                var editNewName = data.editNewName;
                if (!Ext.isEmpty(editNewName) && !Ext.isEmpty(waitId)) {
                    if (Ext.isArray(window['lastEditedMSOODoc'])) {
                        var i, item, len = window['lastEditedMSOODoc'].length;
                        for (i = 0; i < len; i++) {
                            item = window['lastEditedMSOODoc'][i] || {};
                            if (item.id === waitId && Ext.isObject(item.doc)) {
                                item.doc.newName = editNewName;
                                window['lastEditedMSOODoc'][i] = item;
                                break;
                            }
                        }
                    }
                }

                if (!Ext.isEmpty(data.editNewName)) {
                    config.setSelectPath({
                        name: data.editNewName,
                        path: uploadInfo.path
                    });
                }

                config.openTreeRecent();

                config.openGridFolder(uploadInfo.path);

                if (data.filesSaved && data.filesSaved > 0) {
                    var balloonText = String.format(config.htcConfig.locData.BalloonFilesUploaded,
                        data.filesSaved
                    );
                    if (data.filesRejected > 0)
                        balloonText += "<br />" + String.format(
                            config.htcConfig.locData.BalloonFilesNotUploaded,
                            data.filesRejected
                        );
                    if (data.message && data.message != '')
                        balloonText += "<br />" + data.message;
                    config.showBalloon(balloonText);
                }
            });
        }
    });

    return self;
};

/**
 *  config:
 *  htcConfig, Msg, Window, globalLoadMask, getUid(),
 *  getCurrentSelectedSet(), getSkyDriveAuth(), isDemoMode()
 */
HttpCommander.Lib.DownloadToSkyDriveWindow = function (config) {
    // vars
    var cn = HttpCommander.Lib.Consts.CloudNames.onedrive,
        cn1 = HttpCommander.Lib.Consts.CloudNames.onedriveforbusiness,
        skyDriveLoginForm,
        skyDriveFoldersLabel,
        skyDriveFoldersPanel,
        skyDriveFoldersTree,
        skyDriveFoldersTreeLoader,
        skyDriveMapRootForm1,
        self;

    // prepare titles for OneDrive and OneDrive for Business
    var personalOneDrive = typeof (config.htcConfig.liveConnectID) != 'undefined'
        && config.htcConfig.liveConnectID != null && String(config.htcConfig.liveConnectID).length > 0;
    var businessOneDrive = typeof (config.htcConfig.oneDriveForBusinessAuthUrl) != 'undefined'
        && config.htcConfig.oneDriveForBusinessAuthUrl != null && String(config.htcConfig.oneDriveForBusinessAuthUrl).length > 0;
    var authLinkTitleInNote = '',
        authServiceName = '';
    if (personalOneDrive) {
        authLinkTitleInNote = String.format(config.htcConfig.locData.CloudAuthenticateLink, cn);
        authServiceName = 'Microsoft Live';
    }
    if (businessOneDrive) {
        if (authLinkTitleInNote.length > 0) {
            authLinkTitleInNote += String.format('" {0} "', config.htcConfig.locData.CommonWordOr);
            authServiceName += String.format(' {0} ', config.htcConfig.locData.CommonWordOr);
        }
        authLinkTitleInNote += String.format(config.htcConfig.locData.CloudAuthenticateLink, cn1);
        authServiceName += cn1;
    }

    self = new config.Window({
        title: config.htcConfig.locData.CommandDownloadToSkyDrive,
        bodyStyle: 'padding: 5px',
        layout: 'fit',
        width: 400,
        plain: true,
        minWidth: 320,
        minHeight: 200,
        height: 300,
        buttonAlign: 'center',
        closeAction: 'hide',
        collapsible: false,
        minimizable: false,
        closable: true,
        resizable: true,
        maximizable: true,
        modal: true,
        items:
        [
            skyDriveLoginForm = new Ext.form.Label({
                xtype: 'label',
                html: String.format
                    (
                        config.htcConfig.locData.CloudAuthenticateMessage,
                        authServiceName,
                        authLinkTitleInNote,
                        "<img align='absmiddle' width='16' height='16' src='"
                            + HttpCommander.Lib.Utils.getIconPath(config, 'skydrive') + "'/>&nbsp;"
                            + HttpCommander.Lib.Utils.getHelpLinkOpenTag(config.getUid(), "onedrive"),
                        "</a>"
                    )
                    + "<div style='text-align:center;width:100%;'>"
                    + (personalOneDrive ?
                            "<br /><br /><img align='absmiddle' width='16' height='16' src='"
                            + HttpCommander.Lib.Utils.getIconPath(config, 'skydrive') + "'/>&nbsp;"
                            + "<a id='" + config.getUid() + "_authSkyDriveDown_link' href='#' target='_self'>"
                            + String.format(config.htcConfig.locData.CloudAuthenticateLink, cn) + "</a>"

                            + (config.isDemoMode() && !Ext.isEmpty(window.OneDriveDemoName) && !Ext.isEmpty(window.OneDriveDemoPass)
                                    ? ('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="' + window.OneDriveDemoName + '" />&nbsp;'
                                            + '<input readonly onclick="this.select();" type="text" value="' + window.OneDriveDemoPass + '" /></span>')
                                    : '')
                        : "")
                    + (businessOneDrive ?
                            "<br /><br /><img align='absmiddle' width='16' height='16' src='"
                            + HttpCommander.Lib.Utils.getIconPath(config, 'onedriveforbusiness') + "'/>&nbsp;"
                            + "<a id='" + config.getUid() + "_authOneDriveForBusinessDown_link' href='#' target='_self'>"
                            + String.format(config.htcConfig.locData.CloudAuthenticateLink, cn1) + "</a>"
                            + (config.isDemoMode() && !Ext.isEmpty(window.OneDriveForBusinessDemoName) && !Ext.isEmpty(window.OneDriveForBusinessDemoPass)
                                    ? ('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="' + window.OneDriveForBusinessDemoName + '" />&nbsp;'
                                            + '<input readonly onclick="this.select();" type="text" value="' + window.OneDriveForBusinessDemoPass + '" /></span>')
                                    : '')
                        : "")
                    + "</div>",
                listeners: {
                    afterrender: function (wind) {
                        var authLink = document.getElementById(config.getUid() + "_authSkyDriveDown_link"),
                            authLinkBusiness = document.getElementById(config.getUid() + "_authOneDriveForBusinessDown_link");
                        if (authLink) {
                            authLink.onclick = function () {
                                self.main(true, false);
                                return false;
                            };
                        }
                        if (authLinkBusiness) {
                            authLinkBusiness.onclick = function () {
                                self.main(true, true);
                                return false;
                            };
                        }
                    }
                }
            }),
            skyDriveFoldersLabel = new Ext.form.Label({
                html: String.format(config.htcConfig.locData.CloudCheckFolerMessage, cn),
                hidden: true
            }),
            skyDriveFoldersPanel = new Ext.Panel({
                layout: 'fit',
                height: 230,
                flex: 1,
                hidden: true,
                anchor: '100%',
                tbar: new Ext.Toolbar({
                    enableOverflow: true,
                    items:
                    [
                        {
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'gdrefresh'),
                            text: config.htcConfig.locData.CommandRefresh,
                            handler: function () {
                                self.main();
                            }
                        },
                        '-',
                        {
                            icon: HttpCommander.Lib.Utils.getIconPath(config, 'skydrive'),
                            text: cn,
                            tooltip: '<b><img align="absmiddle" width="16" height="16" src="'
                                + HttpCommander.Lib.Utils.getIconPath(config, 'skydrive') + '">&nbsp;'
                                + String.format(config.htcConfig.locData.CloudLinkText, cn) + '</b><br/>'
                                + String.format(config.htcConfig.locData.CloudLinkDescription, cn),
                            scope: this,
                            handler: function () {
                                if (config.getSkyDriveAuth() && config.getSkyDriveAuth().isBusinessAccount()
                                    && config.htcConfig.oneDriveForBusinessRootUrl)
                                    window.open(config.htcConfig.oneDriveForBusinessRootUrl);
                                else
                                    window.open('https://onedrive.live.com/');
                            }
                        },
                        '->',
                        {
                            text: String.format(config.htcConfig.locData.CloudSignInAsDifferentUserText, cn),
                            handler: function () {
                                if (config.getSkyDriveAuth()) {
                                    config.getSkyDriveAuth().signOut(function () {
                                        self.switchView(false);
                                    });
                                }
                            }
                        }
                    ]
                }),
                items:
                [
                    skyDriveFoldersTree = new Ext.tree.TreePanel({
                        root: {
                            text: String.format(config.htcConfig.locData.CloudRootFolderName, cn),
                            expaded: false,
                            checked: false
                        },
                        useArrows: true,
                        autoScroll: true,
                        header: false,
                        flex: 1,
                        anchor: '100%',
                        lines: false,
                        loader: skyDriveFoldersTreeLoader = new HttpCommander.Lib.SkyDriveTreeLoader({
                            htcConfig: config.htcConfig,
                            onlyFolders: true,
                            api: config.getSkyDriveAuth(),
                            listeners: {
                                beforeload: function (treeLoader, node) {
                                    // TODO: before load childs
                                },
                                load: function (treeLoader, node, response) {
                                    // TODO: after load childs
                                    config.globalLoadMask.hide();
                                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                                },
                                loadexception: function (treeLoader, node, response) {
                                    config.globalLoadMask.hide();
                                    config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                                    var errorMsg = config.htcConfig.locData.CommonLoadError;
                                    if (response && response.error) {
                                        if (Ext.isObject(response.error))
                                            errorMsg = response.error.error_description;
                                        else
                                            errorMsg = response.error;
                                    }
                                    if (response && typeof (response.connect) != 'undefined' && !response.connect) {
                                        self.clearAuthInfo();
                                    }
                                    config.Msg.show({
                                        title: config.htcConfig.locData.CommonErrorCaption,
                                        msg: errorMsg,
                                        icon: config.Msg.ERROR,
                                        buttons: config.Msg.OK
                                    });
                                }
                            }
                        }),
                        listeners: {
                            load: function (node) {
                                if (node.isRoot || !node.parentNode) {
                                    var ui = node.getUI ? node.getUI() : null;
                                    if (ui && ui.toggleCheck) {
                                        ui.toggleCheck(true);
                                    } else {
                                        node.checked = true;
                                    }
                                }
                                Ext.each(node.childNodes, function (el) {
                                    el.text = el.attributes.text = Ext.util.Format.htmlEncode(el.attributes.title);
                                });
                            },
                            click: function (node) {
                                var nodeui = node.getUI();
                                if (nodeui) {
                                    nodeui.toggleCheck();
                                }
                            },
                            render: function (tr) {
                                tr.on('checkchange', self.checkChangeSkyDriveFolders);
                            }
                        }
                    })
                ]
            }),
            skyDriveMapRootForm1 = new Ext.form.FormPanel({
                baseCls: 'x-plain',
                labelAlign: 'top',
                hidden: true,
                items:
                [
                    {
                        xtype: 'textfield',
                        anchor: '100%',
                        readOnly: true,
                        selectOnFocus: true,
                        fieldLabel: String.format(config.htcConfig.locData.SkyDriveMapRootFolder,
                            HttpCommander.Lib.Utils.getHelpLinkOpenTag(config.getUid(), "webfolders"),
                            "</a>")
                    }
                ]
            })
        ],
        buttons:
        [
            {
                text: config.htcConfig.locData.CommonButtonCaptionContinue,
                hidden: true,
                disabled: true,
                handler: function () {
                    if (!config.htcConfig.enableDownloadToSkyDrive)
                        return;

                    var selectedSet = config.getCurrentSelectedSet();
                    if (selectedSet.files == 0 && selectedSet.folders == 0)
                        return;

                    var selectedFolder = null,
                        skyFolder = null,
                        node;
                    if (skyDriveFoldersTree) {
                        var checkedNodes = skyDriveFoldersTree.getChecked();
                        if (checkedNodes && checkedNodes.length > 0 && checkedNodes[0]) {
                            node = checkedNodes[0];
                            selectedFolder = node.attributes;
                            if (node.isRoot || !node.parentNode)
                                selectedFolder.id = null;
                            skyFolder = node.text;
                        }
                    }

                    if (!selectedFolder) {
                        self.buttons[0].setDisabled(true);
                        return;
                    }

                    var downloadInfo = {
                        folderId: selectedFolder.id,
                        folderUrl: config.getSkyDriveAuth().isBusinessAccount() ? selectedFolder.businessUrl : selectedFolder.url,
                        selections: selectedSet
                    };

                    if (config.getSkyDriveAuth()) {
                        downloadInfo['wat'] = HttpCommander.Lib.Utils.cloneMsOAuthInfo(config.getSkyDriveAuth().getAuthInfo());
                        var aboutInfo = config.getSkyDriveAuth().getAboutInfo();
                        if (aboutInfo) {
                            downloadInfo['freeSpace'] = aboutInfo.freeSpace;
                        }
                    }

                    self.downloadFilesFolders(downloadInfo, skyFolder, node);
                }
            },
            {
                text: config.htcConfig.locData.CommonButtonCaptionClose,
                handler: function () { self.hide(); }
            }
        ],
        listeners: {
            hide: function (win) {
                skyDriveLoginForm.show();
                win.buttons[0].setVisible(false);
                skyDriveFoldersLabel.hide();
                skyDriveFoldersPanel.hide();
                skyDriveMapRootForm1.hide();
                skyDriveMapRootForm1.items.items[0].setValue('');
            },
            resize: function (win, width, height) {
                if (skyDriveFoldersPanel.rendered
                    && !skyDriveFoldersPanel.hidden
                    && skyDriveFoldersPanel.getTopToolbar) {
                    var pt = skyDriveFoldersPanel.getTopToolbar();
                    if (pt.rendered && !pt.hidden)
                        skyDriveFoldersPanel.setWidth(width - 25);
                    skyDriveFoldersPanel.setHeight(win.body.getHeight() - skyDriveFoldersLabel.getHeight()
                        - skyDriveMapRootForm1.getHeight() - 5);
                }
            }
        },
        checkChangeSkyDriveFolders: function (node, checked) {
            if (skyDriveFoldersTree) {
                skyDriveFoldersTree.un('checkchange', self.checkChangeSkyDriveFolders);
                if (checked) {
                    Ext.each(skyDriveFoldersTree.getChecked(), function (n) {
                        if (n && n != node && n.id != node.id && n.attributes.checked) {
                            n.getUI().toggleCheck(false);
                            n.attributes.checked = false;
                        }
                    });
                }
                skyDriveFoldersTree.on('checkchange', self.checkChangeSkyDriveFolders);
                self.buttons[0].setDisabled(skyDriveFoldersTree.getChecked().length == 0);
            }
        },
        switchView: function (enabled) {
            if (skyDriveLoginForm)
                skyDriveLoginForm.setVisible(!enabled);
            if (skyDriveFoldersLabel)
                skyDriveFoldersLabel.setVisible(enabled);
            if (skyDriveFoldersPanel)
                skyDriveFoldersPanel.setVisible(enabled);
            if (skyDriveMapRootForm1) {
                skyDriveMapRootForm1.setVisible(enabled);
                if (!enabled)
                    skyDriveMapRootForm1.items.items[0].setValue('');
            }

            self.items.items[0].setVisible(!enabled);
            self.buttons[0].setVisible(enabled);

            if (!enabled) {
                if (config.getSkyDriveAuth())
                    config.getSkyDriveAuth().clearAuth();
                self.clearRootNode();
            }

            self.show();
            self.syncSize();
        },
        clearAuthInfo: function () {
            if (config.getSkyDriveAuth()) {
                config.getSkyDriveAuth().clearAuth();
            }
            self.switchView(false);
        },
        main: function (interactive, business) {
            var skdAuth = config.getSkyDriveAuth();
            if (skdAuth) {
                if (skyDriveMapRootForm1)
                    skyDriveMapRootForm1.items.items[0].setValue('');
                skdAuth.checkAuth(false, function (result, error) {
                    if (result === true || Ext.isArray(result)) {
                        self.switchView(true);
                        if (skyDriveMapRootForm1) {
                            skyDriveMapRootForm1.items.items[0].setValue(skdAuth.getWebDAVRootUrl());
                            if (skdAuth.isBusinessAccount() && config.htcConfig.locData.OneDriveForBusinessMapWebFolderInfo) {
                                Ext.QuickTips.register({
                                    target: skyDriveMapRootForm1.items.items[0].getEl(),
                                    text: config.htcConfig.locData.OneDriveForBusinessMapWebFolderInfo,
                                    enabled: true,
                                    autoShow: true
                                });
                            } else {
                                Ext.QuickTips.unregister(skyDriveMapRootForm1.items.items[0].getEl());
                            }
                        }
                        self.getRootFolders(result === true || result.length == 0 || !result[0] ? null : result[0]);
                    } else {
                        self.switchView(false);
                        if (error) {
                            config.Msg.show({
                                title: config.htcConfig.locData.CommonErrorCaption,
                                msg: Ext.isObject(error) ? error.error_description : error,
                                icon: config.Msg.ERROR,
                                buttons: config.Msg.OK
                            });
                        }
                    }
                }, interactive, business);
            }
        },
        clearRootNode: function () {
            if (skyDriveFoldersTree) {
                var rootNode = skyDriveFoldersTree.getRootNode();
                if (rootNode) {
                    self.buttons[0].setDisabled(true);
                    rootNode.removeAll();
                    rootNode.checked = false;
                    var ui = rootNode.getUI();
                    if (ui && ui.toggleCheck) {
                        ui.toggleCheck(false);
                    }
                    rootNode.loaded = false;
                }
            }
        },
        getRootFolders: function (rootInfo) {
            if (skyDriveFoldersTree) {
                var rootNode = skyDriveFoldersTree.getRootNode();
                if (rootNode) {
                    self.clearRootNode();
                    config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudLoadMsg, cn) + '...';
                    config.globalLoadMask.show();
                    rootNode.expanded = false;
                    if (rootInfo) {
                        rootNode.attributes.name = rootInfo.name;
                        rootNode.attributes.url = rootInfo.upload_location;
                        rootNode.attributes.id = rootInfo.id;
                        rootNode.id = rootInfo.id;
                    }
                    rootNode.expand(false, true);
                    return;
                }
            }
        },
        downloadFilesFolders: function (downloadInfo, skyFolder, node) {
            var oldTA = Ext.Ajax.timeout;
            Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
            config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudDownloadingMessage, cn) + "...";
            config.globalLoadMask.show();
            var business = config.getSkyDriveAuth() && config.getSkyDriveAuth().isBusinessAccount();
            HttpCommander[business === true ? 'OneDriveForBusiness' : 'SkyDrive'].Download(downloadInfo, function (data, trans) {
                Ext.Ajax.timeout = oldTA;
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";

                if (!HttpCommander.Lib.Utils.checkDirectHandlerResult(
                        data, trans, config.Msg, config.htcConfig)) {
                    if (!data.connect) {
                        self.clearAuthInfo();
                        if (Ext.isBoolean(data.session) && !data.session) {
                            config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, "LiveConnectSession not created");
                        }
                    }
                    return;
                }

                if (!data.connect) {
                    self.clearAuthInfo();
                    if (Ext.isBoolean(data.session) && !data.session) {
                        config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, "LiveConnectSession not created");
                    }
                }

                var message = data.downloaded > 0 && data.foldersCreated < 1
                    ? String.format(config.htcConfig.locData.CloudDownloadFilesSuccessMessage, data.downloaded, skyFolder, cn)
                    : data.foldersCreated > 1 && data.downloaded < 0
                        ? String.format(config.htcConfig.locData.CloudFoldersCreatedSuccessMessage, data.foldersCreated, skyFolder, cn)
                        : String.format(config.htcConfig.locData.CloudFilesFoldersSuccessMessage, data.downloaded, data.foldersCreated, skyFolder, cn);

                if (data.rejected > 0 || data.foldersRejected > 0) {
                    message += '<br />' +
                        (data.rejected > 0 && data.foldersRejected < 1
                            ? String.format(config.htcConfig.locData.CloudNotDownloadedFilesMessage, data.rejected)
                            : data.foldersRejected > 0 && data.rejected < 1
                                ? String.format(config.htcConfig.locData.CloudNotFoldersCreatedMessage, data.foldersRejected)
                                : String.format(config.htcConfig.locData.CloudNotFilesFoldersDownloadedMessage, data.rejected, data.foldersRejected)
                        );
                }

                var withoutErrors = true;
                if (data.errors && data.errors != '') {
                    message += '<div style="width:100%;min-width:200px !important;overflow:auto;height:auto;max-height:75px;display:inline-block;">'
                                + data.errors + '</div>';
                    withoutErrors = false;
                }

                if (typeof data.newTitle != 'undefined' && data.newTitle != '') {
                    message += (message != '' ? '<br />' : '') + config.htcConfig.locData.CloudDownloadWithNewNames
                        + '<div style="width:100%;min-width:200px !important;overflow:auto;height:auto;max-height:75px;display:inline-block;">'
                            + data.newTitle + '</div>';
                }

                var oneDriveUrl = 'https://onedrive.live.com/';
                if (business && config.htcConfig.oneDriveForBusinessRootUrl)
                    oneDriveUrl = config.htcConfig.oneDriveForBusinessRootUrl;
                config.Msg.show({
                    title: config.htcConfig.locData.CommandDownloadToSkyDrive,
                    msg: message + "<br /><br />"// + (withoutErrors ? '<br />' : '')
                        + "<img align='absmiddle' width='16' height='16' src='"
                        + HttpCommander.Lib.Utils.getIconPath(config, 'skydrive') + "'>&nbsp;"
                        + "<a href='" + oneDriveUrl + "' target='_blank'>"
                        + String.format(config.htcConfig.locData.CloudLinkText, cn) + "</a>",
                    closable: false,
                    modal: true,
                    buttons: config.Msg.OK,
                    icon: config.Msg.INFO,
                    fn: function (btn) {
                        if (btn == 'ok' && data.foldersCreated > 0 && node) {
                            node.expanded = false;
                            node.loaded = false;
                            node.expand(false, true);
                        }
                    }
                });
            });
        }
    });

    return self;
};

/**
 *  config:
 *  htcConfig, Msg, Window, globalLoadMask, getUid(),
 *  getUploadWindow(), getRenderers(), getCurrentFolder(),
 *  openGridFolder(), showBalloon(), getSkyDriveAuth(), isDemoMode()
 */
HttpCommander.Lib.UploadFromSkyDrive = function (config) {
    var cn = HttpCommander.Lib.Consts.CloudNames.onedrive,
        cn1 = HttpCommander.Lib.Consts.CloudNames.onedriveforbusiness,
        skyDriveUploadLoginForm,
        skyDriveUploadPanel,
        skyDriveItemsTree,
        skyDriveMapRootForm2,
        skyDriveUploadTreeLoader,
        self;

    var showError = function (msg, encode) {
        config.Msg.show({
            title: config.htcConfig.locData.CommonErrorCaption,
            msg: encode ? Ext.util.Format.htmlEncode(msg) : msg,
            icon: config.Msg.ERROR,
            buttons: config.Msg.CANCEL
        });
    };

    // prepare titles for OneDrive and OneDrive for Business
    var personalOneDrive = typeof (config.htcConfig.liveConnectID) != 'undefined'
        && config.htcConfig.liveConnectID != null && String(config.htcConfig.liveConnectID).length > 0;
    var businessOneDrive = typeof (config.htcConfig.oneDriveForBusinessAuthUrl) != 'undefined'
        && config.htcConfig.oneDriveForBusinessAuthUrl != null && String(config.htcConfig.oneDriveForBusinessAuthUrl).length > 0;
    var authLinkTitleInNote = '',
        authServiceName = '';
    if (personalOneDrive) {
        authLinkTitleInNote = String.format(config.htcConfig.locData.CloudAuthenticateLink, cn);
        authServiceName = 'Microsoft Live';
    }
    if (businessOneDrive) {
        if (authLinkTitleInNote.length > 0) {
            authLinkTitleInNote += String.format('" {0} "', config.htcConfig.locData.CommonWordOr);
            authServiceName += String.format(' {0} ', config.htcConfig.locData.CommonWordOr);
        }
        authLinkTitleInNote += String.format(config.htcConfig.locData.CloudAuthenticateLink, cn1);
        authServiceName += cn1;
    }

    skyDriveUploadTreeLoader = new HttpCommander.Lib.SkyDriveTreeLoader({
        htcConfig: config.htcConfig,
        onlyFolders: false,
        api: config.getSkyDriveAuth(),
        listeners: {
            beforeload: function (treeLoader, node) {
                // TODO: before load childs
            },
            load: function (treeLoader, node, response) {
                // TODO: after load childs
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                self.changeSkyDriveUploadInfoFiles();
            },
            loadexception: function (treeLoader, node, response) {
                config.globalLoadMask.hide();
                config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + '...';
                var errorMsg = config.htcConfig.locData.CommonLoadError;
                if (response && response.error) {
                    if (Ext.isObject(response.error))
                        errorMsg = response.error.error_description;
                    else
                        errorMsg = response.error;
                }
                if (response && typeof (response.connect) != 'undefined' && !response.connect) {
                    self.skyDriveClearAuth();
                }
                config.Msg.show({
                    title: config.htcConfig.locData.CommonErrorCaption,
                    msg: errorMsg,
                    icon: config.Msg.ERROR,
                    buttons: config.Msg.OK
                });
            }
        }
    });

    self = new Ext.FormPanel({
        frame: false,
        bodyStyle: 'padding: 5px 5px 0 5px;',
        border: false,
        bodyBorder: false,
        header: false,
        buttonAlign: 'center',
        layout: 'fit',
        items:
        [
            skyDriveUploadLoginForm = new Ext.form.Label({
                xtype: 'label',
                html: String.format
                    (
                        config.htcConfig.locData.CloudAuthenticateMessage,
                        authServiceName,
                        authLinkTitleInNote,
                        "<img align='absmiddle' width='16' height='16' src='"
                            + HttpCommander.Lib.Utils.getIconPath(config, 'skydrive') + "'/>&nbsp;"
                            + HttpCommander.Lib.Utils.getHelpLinkOpenTag(config.getUid(), "onedrive"),
                        "</a>"
                    )
                    + "<br /><div style='text-align:center;width:100%;'>"
                    + (personalOneDrive ?
                            "<br /><br /><img align='absmiddle' width='16' height='16' src='"
                            + HttpCommander.Lib.Utils.getIconPath(config, 'skydrive') + "'/>&nbsp;"
                            + "<a id='" + config.getUid() + "_authSkyDriveUp_link' href='#' target='_self'>"
                            + String.format(config.htcConfig.locData.CloudAuthenticateLink, cn) + "</a>"
                            + (config.isDemoMode() && !Ext.isEmpty(window.OneDriveDemoName) && !Ext.isEmpty(window.OneDriveDemoPass)
                                    ? ('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="' + window.OneDriveDemoName + '" />&nbsp;'
                                            + '<input readonly onclick="this.select();" type="text" value="' + window.OneDriveDemoPass + '" /></span>')
                                    : '')
                        : "")
                    + (businessOneDrive ?
                            "<br /><br /><img align='absmiddle' width='16' height='16' src='"
                            + HttpCommander.Lib.Utils.getIconPath(config, 'onedriveforbusiness') + "'/>&nbsp;"
                            + "<a id='" + config.getUid() + "_authOneDriveForBusinessUp_link' href='#' target='_self'>"
                            + String.format(config.htcConfig.locData.CloudAuthenticateLink, cn1) + "</a>"
                            + (config.isDemoMode() && !Ext.isEmpty(window.OneDriveForBusinessDemoName) && !Ext.isEmpty(window.OneDriveForBusinessDemoPass)
                                    ? ('<br /><span class="demo-account-field">Demo&nbsp;account:&nbsp;<input readonly onclick="this.select();" type="text" value="' + window.OneDriveForBusinessDemoName + '" />&nbsp;'
                                            + '<input readonly onclick="this.select();" type="text" value="' + window.OneDriveForBusinessDemoPass + '" /></span>')
                                    : '')
                        : "")
                    + "</div>",
                listeners: {
                    afterrender: function (wind) {
                        self.bindAuthOnLink();
                    }
                }
            }),
            skyDriveUploadPanel = new Ext.Panel({
                layout: 'fit',
                hidden: true,
                border: false,
                items:
                [
                    {
                        xtype: 'label',
                        html: String.format(config.htcConfig.locData.CloudUploadSelectItemsMessage, cn)
                    },
                    {
                        xtype: 'checkbox',
                        itemId: 'upload-from-skydrive-ignore-paths',
                        boxLabel: config.htcConfig.locData.UploadJavaIgnorePaths,
                        listeners: {
                            check: function (cb, checked) {
                                if (!!skyDriveItemsTree) {
                                    var checkedNodes = skyDriveItemsTree.getChecked();
                                    self.buttons[0].setDisabled(checkedNodes.length == 0);
                                }
                            }
                        }
                    },
                    skyDriveItemsTree = new Ext.tree.TreePanel({
                        root: {
                            text: String.format(config.htcConfig.locData.CloudRootFolderName, cn),
                            expaded: false,
                            checked: false
                        },
                        useArrows: true,
                        autoScroll: true,
                        header: false,
                        lines: false,
                        loader: skyDriveUploadTreeLoader,
                        bbar: new Ext.Toolbar({
                            items:
                            [
                                {
                                    xtype: 'label',
                                    itemId: 'upload-from-skydrive-bbar-label',
                                    html: String.format(config.htcConfig.locData.CloudUploadTotalFiles,
                                        '0', '0 bytes'
                                    )
                                }
                            ]
                        }),
                        tbar: new Ext.Toolbar({
                            enableOverflow: true,
                            items:
                            [
                                {
                                    icon: HttpCommander.Lib.Utils.getIconPath(config, 'gdrefresh'),
                                    text: config.htcConfig.locData.CommandRefresh,
                                    handler: function () { self.getSkyDriveItems(); }
                                },
                                '-',
                                {
                                    icon: HttpCommander.Lib.Utils.getIconPath(config, 'skydrive'),
                                    text: cn,
                                    tooltip: '<b><img align="absmiddle" width="16" height="16" src="'
                                        + HttpCommander.Lib.Utils.getIconPath(config, 'skydrive') + '">&nbsp;'
                                        + String.format(config.htcConfig.locData.CloudLinkText, cn) + '</b><br/>'
                                        + String.format(config.htcConfig.locData.CloudLinkDescription, cn),
                                    scope: this,
                                    handler: function () {
                                        if (config.getSkyDriveAuth() && config.getSkyDriveAuth().isBusinessAccount()
                                            && config.htcConfig.oneDriveForBusinessRootUrl)
                                            window.open(config.htcConfig.oneDriveForBusinessRootUrl);
                                        else
                                            window.open('https://onedrive.live.com/');
                                    }
                                },
                                '->',
                                {
                                    text: String.format(config.htcConfig.locData.CloudSignInAsDifferentUserText, cn),
                                    handler: function () {
                                        if (config.getSkyDriveAuth()) {
                                            config.getSkyDriveAuth().signOut(function () {
                                                self.changeViewSkyDriveFp(true);
                                            });
                                        }
                                    }
                                }
                            ]
                        }),
                        listeners: {
                            load: function (node) {
                                Ext.each(node.childNodes, function (el) {
                                    if (el.attributes.file && typeof el.attributes.size !== 'undefined')
                                        el.text = el.attributes.text = Ext.util.Format.htmlEncode(el.attributes.title)
                                            + ' ('
                                            + config.getRenderers().sizeRenderer(el.attributes.size)
                                            + ')';
                                    else
                                        el.text = el.attributes.text = Ext.util.Format.htmlEncode(el.attributes.title);
                                    if (el.attributes.file)
                                        el.attributes.icon = HttpCommander.Lib.Utils.getIconPath(config, 'none');
                                });
                            },
                            render: function (tr) {
                                tr.on('checkchange', self.checkChangeSkyDriveUploadList, self);
                            }
                        }
                    })
                ]
            }),
            skyDriveMapRootForm2 = new Ext.Panel({
                baseCls: 'x-plain',
                layout: 'form',
                unstyled: true,
                hidden: true,
                labelAlign: 'top',
                collapsible: false,
                autoHeight: true,
                items:
                [
                    {
                        itemId: 'upload-from-skydrive-map-root-url',
                        xtype: 'textfield',
                        anchor: '100%',
                        readOnly: true,
                        selectOnFocus: true,
                        fieldLabel: String.format(config.htcConfig.locData.SkyDriveMapRootFolder,
                            HttpCommander.Lib.Utils.getHelpLinkOpenTag(config.getUid(), "webfolders"),
                            "</a>")
                    }
                ]
            })
        ],
        buttons:
        [
            {
                hidden: true,
                disabled: true,
                text: config.htcConfig.locData.UploadSimpleUpload,
                handler: function () {
                    var curFolder = config.getCurrentFolder();
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
                    var checkedNodes = skyDriveItemsTree.getChecked();
                    if (checkedNodes.length == 0) {
                        self.buttons[0].setDisabled(true);
                        showError(String.format(config.htcConfig.locData.CloudUploadSelectItemsMessage, ''), true);
                        return;
                    }
                    var uploadInfo = {
                        path: curFolder,
                        ignorePaths: skyDriveUploadPanel.getComponent('upload-from-skydrive-ignore-paths').getValue(),
                        files: [],
                        folders: []
                    };
                    var addedPaths = [];
                    var emptyFolders = [];
                    Ext.each(checkedNodes, function (node) {
                        if (node && (typeof (node.isRoot) == 'undefined' || !node.isRoot) && node.parentNode) {
                            var nodeInfo = {
                                name: node.attributes.name || node.attributes.title,
                                url: config.getSkyDriveAuth().isBusinessAccount() ? node.attributes.businessUrl : node.attributes.url,
                                id: node.attributes.id
                            };
                            if (!uploadInfo.ignorePaths) {
                                var itemPath = '';
                                var pnode = node.parentNode;
                                while (!!pnode && (typeof (pnode.isRoot) == 'undefined' || !pnode.isRoot)) {
                                    itemPath = pnode.attributes.name + '\\' + itemPath;
                                    pnode = pnode.parentNode;
                                }
                                nodeInfo["path"] = itemPath;
                            }
                            if (node.attributes.file) {
                                uploadInfo.files.push(nodeInfo);
                                if (!uploadInfo.ignorePaths) {
                                    addedPaths.push((nodeInfo.path + nodeInfo.name).toLowerCase());
                                }
                            } else if (!uploadInfo.ignorePaths) {
                                emptyFolders.push(nodeInfo);
                                addedPaths.push((nodeInfo.path + nodeInfo.name).toLowerCase());
                            }
                        }
                    });
                    var pLen = addedPaths.length;
                    if (pLen > 0) {
                        Ext.each(emptyFolders, function (folder) {
                            var folderPath = (folder.path + folder.name).toLowerCase();
                            for (var i = 0; i < pLen; i++) {
                                if (addedPaths[i].length > folderPath.length &&
                                    addedPaths[i].indexOf(folderPath) == 0) {
                                    return;
                                }
                            }
                            uploadInfo.folders.push(folder);
                        });
                    }

                    if (uploadInfo.files.length == 0 && uploadInfo.folders.length == 0) {
                        self.buttons[0].setDisabled(true);
                        showError(String.format(config.htcConfig.locData.CloudUploadSelectItemsMessage, ''), true);
                        return;
                    }

                    if (config.getSkyDriveAuth()) {
                        uploadInfo['wat'] = HttpCommander.Lib.Utils.cloneMsOAuthInfo(config.getSkyDriveAuth().getAuthInfo());
                    }

                    var oldTA = Ext.Ajax.timeout;
                    Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
                    config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudUploadProgressMessage, cn) + "...";
                    config.globalLoadMask.show();
                    var business = config.getSkyDriveAuth() && config.getSkyDriveAuth().isBusinessAccount();
                    HttpCommander[business === true ? 'OneDriveForBusiness' : 'SkyDrive'].Upload(uploadInfo, function (data, trans) {
                        Ext.Ajax.timeout = oldTA;
                        config.globalLoadMask.hide();
                        config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";

                        if (!HttpCommander.Lib.Utils.checkDirectHandlerResult(
                                data, trans, config.Msg, config.htcConfig)) {
                            if (typeof data == 'undefined') {
                                return;
                            } else if (!data.connect) {
                                self.skyDriveClearAuth();
                                if (Ext.isBoolean(data.session) && !data.session) {
                                    config.Msg.alert(config.htcConfig.locData.CommonErrorCaption, "LiveConnectSession not created");
                                }
                                return;
                            }
                        }

                        if (skyDriveItemsTree && skyDriveItemsTree.getRootNode()) {
                            HttpCommander.Lib.Utils.recursiveCheckTreeChildNodesWithoutExpand(skyDriveItemsTree.getRootNode(), false);
                            self.buttons[0].setDisabled(true);
                            self.changeSkyDriveUploadInfoFiles();
                        }

                        config.openTreeRecent();

                        config.openGridFolder(uploadInfo.path, true, true);

                        if (data.filesSaved && data.filesSaved > 0) {
                            var balloonText = String.format(config.htcConfig.locData.BalloonFilesUploaded,
                                data.filesSaved
                            );
                            if (data.filesRejected > 0)
                                balloonText += "<br />" + String.format(
                                    config.htcConfig.locData.BalloonFilesNotUploaded,
                                    data.filesRejected
                                );
                            if (data.message && data.message != '')
                                balloonText += "<br />" + data.message;
                            config.showBalloon(balloonText);
                        }
                    });
                }
            }
        ],
        checkChangeSkyDriveUploadList: function (node, checked) {
            skyDriveItemsTree.un('checkchange', self.checkChangeSkyDriveUploadList, self);
            HttpCommander.Lib.Utils.recursiveCheckTreeChildNodes(node, checked);
            HttpCommander.Lib.Utils.recursiveCheckTreeParentNodes(node, checked);
            skyDriveItemsTree.on('checkchange', self.checkChangeSkyDriveUploadList, self);
            self.changeSkyDriveUploadInfoFiles();
            self.buttons[0].setDisabled(skyDriveItemsTree.getChecked().length == 0);
        },
        changeSkyDriveUploadInfoFiles: function () {
            var lblInfo = skyDriveItemsTree.getBottomToolbar().getComponent('upload-from-skydrive-bbar-label');
            if (lblInfo) {
                var count = 0, size = 0;
                if (skyDriveItemsTree) {
                    var checkedNodes = skyDriveItemsTree.getChecked();
                    Ext.each(checkedNodes, function (node) {
                        if (node.attributes.file) {
                            count++;
                            size += parseInt(node.attributes.size);
                        }
                    });
                }
                var sizeStr = config.getRenderers().sizeRenderer(String(size));
                lblInfo.setText(String.format(htcConfig.locData.CloudUploadTotalFiles,
                    count, sizeStr), true);
            }
        },
        skyDriveClearAuth: function () {
            if (config.getSkyDriveAuth())
                config.getSkyDriveAuth().clearAuth();
            self.changeViewSkyDriveFp(true);
        },
        getSkyDriveItems: function (loginInfo) {
            self.prepare();
        },
        changeViewSkyDriveFp: function (state) {
            if (state) {
                skyDriveItemsTree.hide();
                skyDriveUploadPanel.hide();
                self.buttons[0].hide();
                skyDriveUploadLoginForm.show();
                skyDriveMapRootForm2.hide();
                skyDriveMapRootForm2.getComponent('upload-from-skydrive-map-root-url').setValue('');
            } else {
                skyDriveUploadLoginForm.hide();
                skyDriveUploadPanel.show();
                skyDriveItemsTree.show();
                skyDriveItemsTree.getBottomToolbar().getComponent('upload-from-skydrive-bbar-label')
                    .setText(
                        String.format(config.htcConfig.locData.CloudUploadTotalFiles, '0', '0 bytes')
                    );
                skyDriveMapRootForm2.show();
                self.buttons[0].show();
            }
            config.getUploadWindow().syncSize();
        },
        bindAuthOnLink: function () {
            var authLink = document.getElementById(config.getUid() + "_authSkyDriveUp_link"),
                authLinkBusiness = document.getElementById(config.getUid() + "_authOneDriveForBusinessUp_link");
            if (authLink) {
                authLink.onclick = function () {
                    self.prepare(true, false);
                    return false;
                };
            }
            if (authLinkBusiness) {
                authLinkBusiness.onclick = function () {
                    self.prepare(true, true);
                    return false;
                };
            }
        },
        prepare: function (interactive, business) {
            var skAuth = config.getSkyDriveAuth();
            if (skAuth) {
                skAuth.checkAuth(true, function (result, error) {
                    if (result === true || Ext.isArray(result)) {
                        self.changeViewSkyDriveFp(false);
                        if (skyDriveMapRootForm2) {
                            skyDriveMapRootForm2.items.items[0].setValue(skAuth.getWebDAVRootUrl());
                            if (skAuth.isBusinessAccount() && config.htcConfig.locData.OneDriveForBusinessMapWebFolderInfo) {
                                Ext.QuickTips.register({
                                    target: skyDriveMapRootForm2.items.items[0].getEl(),
                                    text: config.htcConfig.locData.OneDriveForBusinessMapWebFolderInfo,
                                    enabled: true,
                                    autoShow: true
                                });
                            } else {
                                Ext.QuickTips.unregister(skyDriveMapRootForm2.items.items[0].getEl());
                            }
                        }
                        self.getRootFolders(result === true || result.length == 0 || !result[0] ? null : result[0]);
                    } else {
                        self.changeViewSkyDriveFp(true);
                        if (error) {
                            config.Msg.show({
                                title: config.htcConfig.locData.CommonErrorCaption,
                                msg: Ext.isObject(error) ? error.error_description : error,
                                icon: config.Msg.ERROR,
                                buttons: config.Msg.OK
                            });
                        }
                    }
                }, interactive, business);
            }
        },
        getRootFolders: function (rootInfo) {
            if (skyDriveItemsTree) {
                var rootNode = skyDriveItemsTree.getRootNode();
                if (rootNode) {
                    self.clearRootNode();
                    config.globalLoadMask.msg = String.format(config.htcConfig.locData.CloudLoadMsg, cn) + '...';
                    config.globalLoadMask.show();
                    rootNode.expanded = false;
                    if (rootInfo) {
                        rootNode.attributes.name = rootInfo.name;
                        rootNode.attributes.url = rootInfo.upload_location;
                        rootNode.attributes.id = rootInfo.id;
                        rootNode.id = rootInfo.id;
                    }
                    rootNode.expand(false, true);
                    return;
                }
            }
        },
        clearRootNode: function () {
            if (skyDriveItemsTree) {
                var rootNode = skyDriveItemsTree.getRootNode();
                if (rootNode) {
                    rootNode.loginInfo = null;
                    self.buttons[0].setDisabled(true);
                    rootNode.removeAll();
                    rootNode.checked = false;
                    var ui = rootNode.getUI();
                    if (ui && ui.toggleCheck) {
                        ui.toggleCheck(false);
                    }
                    rootNode.loaded = false;
                    config.getUploadWindow().syncSize();
                }
                skyDriveItemsTree.getBottomToolbar().getComponent('upload-from-skydrive-bbar-label')
                    .setText(
                        String.format(config.htcConfig.locData.CloudUploadTotalFiles, '0', '0 bytes')
                    );
            }
        },
        isLoginFormVisible: function () {
            return !skyDriveUploadLoginForm.hidden;
        },
        isUploadPanelVisible: function () {
            return !skyDriveUploadPanel.hidden;
        },
        reResize: function (width, height) {
            if (skyDriveUploadPanel && skyDriveUploadPanel.rendered && !skyDriveUploadPanel.hidden) {
                var newSDTreeHeight = height - 72;
                if (skyDriveMapRootForm2 && skyDriveMapRootForm2.rendered && !skyDriveMapRootForm2.hidden)
                    newSDTreeHeight -= skyDriveMapRootForm2.getHeight();
                skyDriveUploadPanel.setHeight(newSDTreeHeight);
                skyDriveUploadPanel.setWidth(width - 10);
                if (skyDriveItemsTree && skyDriveItemsTree.rendered && !skyDriveItemsTree.hidden) {
                    skyDriveItemsTree.setHeight(newSDTreeHeight
                        - skyDriveItemsTree.getPosition()[1]
                        + skyDriveUploadPanel.getPosition()[1]
                        - 5
                    );
                    skyDriveItemsTree.setWidth(width - 12);
                }
            }
        }
    });

    return self;
};
