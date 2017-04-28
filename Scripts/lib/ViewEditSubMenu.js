Ext.ns('HttpCommander.Lib');

/* config: htcConfig, getMenuActions(), getSelTypeFilesModel(), getGrid(),
    getCurrentFolder(),viewFile(), initImagesViewer(), initOfficeEditor(),
    createVideoConvertWindow(), createPlayVideoFlashWindow(),
    createPlayVideoHtml5Window(), createPlayAudioHtml5Window(), initFlashViewer(),
    isExtensionAllowed(), supportsWebGlCanvasForAutodesk(), openInMsoNewWay(),
    isTrashFolder(), isRecentFolder()
*/
HttpCommander.Lib.ViewEditSubMenu = function (config) {
    var viewEditSubMenu = new Ext.menu.Menu({
        items:
        [
            { itemId: 'view', text: config.htcConfig.locData.CommandView, icon: HttpCommander.Lib.Utils.getIconPath(config, 'view') },
            { itemId: 'preview', text: config.htcConfig.locData.CommandPreview, icon: HttpCommander.Lib.Utils.getIconPath(config, 'preview') },
            { itemId: 'flash-preview', text: config.htcConfig.locData.CommandFlashPreview, icon: HttpCommander.Lib.Utils.getIconPath(config, 'flash') },
            { itemId: 'mso-edit', text: config.htcConfig.locData.CommandEditInMSOffice, icon: HttpCommander.Lib.Utils.getIconPath(config, 'mso') },
            { itemId: 'msoo-edit', text: config.htcConfig.locData.CommandEditInMSOO, icon: HttpCommander.Lib.Utils.getIconPath(config, 'skydrive') },
            { itemId: 'office365-edit', text: config.htcConfig.locData.CommandEditInOffice365, icon: HttpCommander.Lib.Utils.getIconPath(config, 'office365') },
            { itemId: 'ooo-edit', text: config.htcConfig.locData.CommandEditInOOo, icon: HttpCommander.Lib.Utils.getIconPath(config, 'ooo') },
            { itemId: 'owa-view', text: config.htcConfig.locData.CommandViewWithOWA, icon: HttpCommander.Lib.Utils.getIconPath(config, 'owa') },
            { itemId: 'google-edit', text: config.htcConfig.locData.CommandEditInGoogle, icon: HttpCommander.Lib.Utils.getIconPath(config, 'googledocs') },
            { itemId: 'google-view', text: config.htcConfig.locData.CommandViewWithGoogleDoc, icon: HttpCommander.Lib.Utils.getIconPath(config, 'googledoc') },
            { itemId: 'autodesk-view', text: config.htcConfig.locData.CommandViewWithAutodesk, icon: HttpCommander.Lib.Utils.getIconPath(config, 'autodesk') },
            { itemId: 'sharecad-view', text: config.htcConfig.locData.CommandViewWithShareCad, icon: HttpCommander.Lib.Utils.getIconPath(config, 'sharecad') },
            { itemId: 'box-view', text: config.htcConfig.locData.CommandViewWithBox, icon: HttpCommander.Lib.Utils.getIconPath(config, 'box') },
            { itemId: 'zoho-edit', text: config.htcConfig.locData.CommandEditWithZoho, icon: HttpCommander.Lib.Utils.getIconPath(config, 'zohoeditor') },
            { itemId: 'image-edit-in-pixlr', text: config.htcConfig.locData.CommandEditInPixlr, icon: HttpCommander.Lib.Utils.getIconPath(config, 'pixlr') },
            { itemId: 'image-edit-in-adobe', text: config.htcConfig.locData.CommandEditInAdobe, icon: HttpCommander.Lib.Utils.getIconPath(config, 'adobeimage') },
            { itemId: 'play-video-js', text: config.htcConfig.locData.CommandPlayVideoHtml5, icon: HttpCommander.Lib.Utils.getIconPath(config, 'play-video') },
            { itemId: 'play-audio-html5', text: config.htcConfig.locData.CommandPlayAudioHtml5, icon: HttpCommander.Lib.Utils.getIconPath(config, 'play-audio') },
            { itemId: 'video-convert', text: config.htcConfig.locData.CommandConvertVideo, icon: HttpCommander.Lib.Utils.getIconPath(config, 'process') },
            { itemId: 'cloud-convert', text: config.htcConfig.locData.CommandCloudConvert, icon: HttpCommander.Lib.Utils.getIconPath(config, 'cloudconvert') },
            { itemId: 'edit', text: config.htcConfig.locData.CommandEdit, icon: HttpCommander.Lib.Utils.getIconPath(config, 'textedit') }
        ],
        listeners: {
            beforeshow: function (cmp) {
                viewEditSubMenu.onBeforeShowViewEditMenu(cmp, config.getSelTypeFilesModel(config.getGrid()));
            },
            itemclick: function (item) {
                switch (item.itemId) {
                    case 'view':
                        config.getMenuActions().viewFile();
                        break;
                    case 'preview':
                        config.getMenuActions().imagesPreview();
                        break;
                    case 'flash-preview':
                        config.getMenuActions().flashPreview();
                        break;
                    case 'edit':
                        config.getMenuActions().editFile();
                        break;
                    /* new viewer strategy */
                    case 'google-view':
                    case 'owa-view':
                    case 'sharecad-view':
                    case 'box-view':
                    case 'zoho-edit':
                    case 'image-edit-in-pixlr':
                    case 'image-edit-in-adobe':
                        var svc = item.itemId,
                            dPos = svc.indexOf('-');
                        if (dPos > 0) {
                            if (svc == 'image-edit-in-pixlr') {
                                svc = 'pixlr';
                            } else if (svc == 'image-edit-in-adobe') {
                                svc = 'adobe';
                            } else {
                                svc = svc.substring(0, dPos);
                            }
                        }
                        config.getMenuActions().viewInService(svc);
                        break;
                    case 'autodesk-view':
                        config.getMenuActions().viewInAutodesk();
                        break;
                    case 'cloud-convert':
                        config.getMenuActions().getOutputFormats();
                        break;
                    case 'mso-edit':
                        config.getMenuActions().editInMsoOoo(true, config.openInMsoNewWay);
                        break;
                    case 'ooo-edit':
                        var officeEditor = config.initOfficeEditor();
                        config.getMenuActions().editInMsoOoo(false, officeEditor.OpenFile);
                        break;
                    case 'msoo-edit':
                        config.getMenuActions().msooEdit();
                        break;
                    case 'office365-edit':
                        config.getMenuActions().office365Edit();
                        break;
                    case 'google-edit':
                        config.getMenuActions().googleEdit();
                        break;
                    case 'video-convert':
                        config.getMenuActions().videoConvert();
                        break;
                    case 'play-video-flash':
                        config.getMenuActions().playVideoFlash();
                        break;
                    case 'play-video-js':
                        config.getMenuActions().playVideoJS();
                        break;
                    case 'play-video-html5':
                        config.getMenuActions().playVideoHTML5();
                        break;
                    case 'play-audio-html5':
                        config.getMenuActions().playVideoJS();
                        break;
                }
            }
        },

        // Change visible/enable for View & Edit submenu
        onBeforeShowViewEditMenu: function (menu, selTypeFilesModel) {
            var curFolder = config.getCurrentFolder();
            if (config.isRecentFolder(curFolder) || config.isTrashFolder(curFolder))
                return false;

            var selModel = selTypeFilesModel['selModel'];
            var row = selModel.getSelected();
            var rowData = row ? row.data : {};
            var selType = selTypeFilesModel['selType'];
            var selFiles = selTypeFilesModel['selFiles'];

            var ext = selType == 'none' ? '' : HttpCommander.Lib.Utils.getFileExtension(rowData.name);
            var _ext_ = ';' + ext + ';';

            var fileSize = (rowData.size || rowData.size_hidden || 0);
            var googleViewVisible = config.htcConfig.currentPerms && selType == "file" && config.htcConfig.currentPerms.download && config.htcConfig.enableGoogleDocumentsViewer && HttpCommander.Lib.Consts.googleDocSupportedtypes.indexOf(_ext_) != -1 && fileSize > 0;
            var owaViewVisible = config.htcConfig.currentPerms && selType == "file" && config.htcConfig.currentPerms.download && config.htcConfig.enableOWADocumentsViewer && HttpCommander.Lib.Consts.owaSupportedtypes.indexOf(_ext_) != -1 && fileSize > 0
                // see http://office.microsoft.com/en-us/web-apps-help/view-office-documents-online-HA102724036.aspx
                && ((_ext_.indexOf(';xls') == 0 && fileSize <= 5242880) || (_ext_.indexOf(';xls') < 0 && fileSize <= 10485760));
            var boxViewVisible = config.htcConfig.currentPerms && selType == "file" && config.htcConfig.currentPerms.download && config.htcConfig.enableBoxDocumentsViewer && HttpCommander.Lib.Consts.boxViewSupportedtypes.indexOf(_ext_) != -1 && fileSize > 0;

            var shareCadViewVisible = config.htcConfig.currentPerms && selType == "file" && config.htcConfig.currentPerms.download && config.htcConfig.enableShareCadViewer && HttpCommander.Lib.Consts.shareCadOrgSupportedTypes.indexOf(_ext_) != -1 && fileSize > 0;

            var webGlAvl = config.supportsWebGlCanvasForAutodesk();
            var autodeskViewVisible = config.htcConfig.currentPerms && selType == "file" && config.htcConfig.currentPerms.download && config.htcConfig.enableAutodeskViewer && HttpCommander.Lib.Consts.autodeskViewerFileTypes.indexOf(_ext_) != -1 && fileSize > 0 && webGlAvl;

            var viewVisible = config.htcConfig.currentPerms && selType == "file" &&
                config.htcConfig.currentPerms.download &&
                    HttpCommander.Lib.Utils.isAllowedForViewingInBrowser(rowData.name, config.htcConfig);
            if (viewVisible && ext == "swf" && HttpCommander.Lib.Utils.browserIs.ios)
                viewVisible = false;
            var viewEnabled = (selType != "empty");

            var previewVisible = config.htcConfig.currentPerms && selType == "file" && config.htcConfig.currentPerms.download && HttpCommander.Lib.Consts.imagesFileTypes.indexOf(_ext_) != -1 && fileSize > 0;

            var flashPreviewVisible = config.htcConfig.currentPerms && selType == "file" && config.htcConfig.currentPerms.download && ext == "swf" && !HttpCommander.Lib.Utils.browserIs.ios && fileSize > 0;

            var isLocked = (config.htcConfig.enableMSOfficeEdit
                || config.htcConfig.enableOpenOfficeEdit
                || config.htcConfig.enableWebFoldersLinks) && rowData.locked;

            var editVisible = config.htcConfig.enableEditAsTextFile && config.htcConfig.currentPerms && selType == "file" && config.htcConfig.currentPerms.download && config.htcConfig.currentPerms.modify;
            var editViewVisible = config.htcConfig.enableEditAsTextFile && config.htcConfig.currentPerms && selType == "file" && config.htcConfig.currentPerms.download;
            var sizeEditAllowed = (typeof config.htcConfig.maxSizeForEditAsTextFile != 'undefined')
                ? (fileSize <= config.htcConfig.maxSizeForEditAsTextFile) : false;
            if (editVisible) {
                editVisible = sizeEditAllowed;
            }
            if (editViewVisible) {
                editViewVisible = sizeEditAllowed;
            }
            if (editViewVisible && (!editVisible || isLocked)) {
                menu.getComponent('edit').setText(config.htcConfig.locData.CommandEditView);
            } else {
                menu.getComponent('edit').setText(config.htcConfig.locData.CommandEdit);
            }

            var newExtForGoogleEdit = HttpCommander.Lib.Utils.checkAndGetNewExtensionConvertedFromGoogle(ext);
            var newExtForMSOO365Edit = HttpCommander.Lib.Utils.checkAndGetNewExtensionConvertedFromMSOO(ext);
            /*
            * MSOffice, OpenOffice.org/LibreOffice, Google Editing Zoho Editing and Meta data menu items visible indicators.
            */
            var msoViewVisible = config.htcConfig.currentPerms && config.htcConfig.enableMSOfficeEdit && selType == "file" && config.htcConfig.currentPerms.download && HttpCommander.Lib.Consts.msoSupportedtypes.indexOf(_ext_) != -1 && config.htcConfig.hcAuthMode != 'shibboleth';
            var msoEditVisible = msoViewVisible && config.htcConfig.currentPerms.modify;
            if (msoViewVisible) {
                msoViewVisible = !config.htcConfig.anonymousEditingOffice;
            }
            if (msoViewVisible && !msoEditVisible) {
                menu.getComponent('mso-edit').setText(config.htcConfig.locData.CommandViewInMSOffice);
            } else {
                menu.getComponent('mso-edit').setText(config.htcConfig.locData.CommandEditInMSOffice);
            }
            var oooViewVisible = config.htcConfig.currentPerms && config.htcConfig.enableOpenOfficeEdit && selType == "file" && config.htcConfig.currentPerms.download && HttpCommander.Lib.Consts.oooSupportedtypes.indexOf(_ext_) != -1 && config.htcConfig.hcAuthMode != 'shibboleth';
            var oooEditVisible = oooViewVisible && config.htcConfig.currentPerms.modify;
            if (oooViewVisible) {
                oooViewVisible = !config.htcConfig.anonymousEditingOffice;
            }
            if (oooViewVisible && !oooEditVisible) {
                menu.getComponent('ooo-edit').setText(config.htcConfig.locData.CommandViewInOOo);
            } else {
                menu.getComponent('ooo-edit').setText(config.htcConfig.locData.CommandEditInOOo);
            }
            var zohoEditVisible = config.htcConfig.currentPerms && selType == "file" && config.htcConfig.currentPerms.download && config.htcConfig.currentPerms.modify && config.htcConfig.enableZohoDocumentsEditor && config.htcConfig.zohoSupportedEditTypes.indexOf(ext) != -1;
            var msooEditVisible = config.htcConfig.currentPerms && config.htcConfig.enableMSOOEdit && selType == "file" && config.htcConfig.currentPerms.download && config.htcConfig.currentPerms.modify && HttpCommander.Lib.Consts.msooEditorFileTypes.indexOf(_ext_) != -1 && (Ext.isEmpty(newExtForMSOO365Edit) || (config.isExtensionAllowed('file.' + newExtForMSOO365Edit) && config.htcConfig.currentPerms.create));
            var office365EditVisible = config.htcConfig.currentPerms && config.htcConfig.enableOffice365Edit && selType == "file" && config.htcConfig.currentPerms.download && config.htcConfig.currentPerms.modify && HttpCommander.Lib.Consts.msooEditorFileTypes.indexOf(_ext_) != -1 && ext != 'txt' && (HttpCommander.Lib.Consts.msooEditFormatsForConvert.indexOf(_ext_) < 0);
            var googleEditVisible = config.htcConfig.currentPerms && config.htcConfig.enableGoogleEdit && selType == "file" && config.htcConfig.currentPerms.download && config.htcConfig.currentPerms.modify && HttpCommander.Lib.Consts.googleDriveEditorFileTypes.indexOf(_ext_) != -1 && (Ext.isEmpty(newExtForGoogleEdit) || (config.isExtensionAllowed('file.' + newExtForGoogleEdit) && config.htcConfig.currentPerms.create));
            var imageEditInPixlrVisible = config.htcConfig.currentPerms && selType == "file" && config.htcConfig.currentPerms.download && HttpCommander.Lib.Consts.pixlrSupportedTypes.indexOf(_ext_) != -1 && config.htcConfig.currentPerms.modify && config.htcConfig.enablePixlrEditor && fileSize > 0;
            var imageEditInAdobeVisible = config.htcConfig.currentPerms && selType == "file" && config.htcConfig.currentPerms.download && HttpCommander.Lib.Consts.adobeImageSupportedTypes.indexOf(_ext_) != -1 && config.htcConfig.currentPerms.modify && config.htcConfig.enableAdobeImageEditor && fileSize > 0;
            var videoConvertVisible = config.htcConfig.enableConvertingVideo && config.htcConfig.currentPerms && config.htcConfig.currentPerms.create && config.htcConfig.currentPerms.modify && selType == "file" && HttpCommander.Lib.Consts.videoConvertFileTypes.indexOf(_ext_) != -1 && fileSize > 0;
            var playVideoFlashVisible = config.htcConfig.enablePlayVideo && config.htcConfig.currentPerms && config.htcConfig.currentPerms.download && selType == "file" && HttpCommander.Lib.Consts.flowplayerFileTypes.indexOf(_ext_) != -1 && !HttpCommander.Lib.Utils.browserIs.ios && fileSize > 0;
            var playVideoHtml5Visible = config.htcConfig.enablePlayVideo && config.htcConfig.currentPerms && config.htcConfig.currentPerms.download && selType == "file" && HttpCommander.Lib.Consts.html5VideoFileTypes.indexOf(_ext_) != -1 && fileSize > 0;
            var playAudioHtml5Visible = config.htcConfig.enablePlayAudio && config.htcConfig.currentPerms && config.htcConfig.currentPerms.download && selType == "file" && HttpCommander.Lib.Consts.html5AudioFileTypes.indexOf(_ext_) != -1 && fileSize > 0;
            var cloudConvertVisible = config.htcConfig.enableCloudConvert && config.htcConfig.currentPerms && selType == "file" && (config.htcConfig.currentPerms.upload || config.htcConfig.currentPerms.download) && ext && ext.length > 0 && fileSize > 0;
            var viewEditVisible =
                   viewVisible
                || msooEditVisible
                || office365EditVisible
                || googleViewVisible
                || googleEditVisible
                || shareCadViewVisible
                || autodeskViewVisible
                || owaViewVisible
                || boxViewVisible
                || cloudConvertVisible
                || zohoEditVisible
                || msoEditVisible || msoViewVisible
                || oooEditVisible || oooViewVisible
                || editVisible || editViewVisible
                || imageEditInPixlrVisible
                || imageEditInAdobeVisible
                || previewVisible
                || videoConvertVisible
                || playVideoFlashVisible
                || playVideoHtml5Visible
                || playAudioHtml5Visible
                || flashPreviewVisible;

            menu.getComponent('view').setVisible(viewVisible && viewEnabled);
            menu.getComponent('view').setDisabled(!viewVisible || !viewEnabled);
            menu.getComponent('preview').setVisible(previewVisible);
            menu.getComponent('preview').setDisabled(!previewVisible);
            menu.getComponent('flash-preview').setVisible(flashPreviewVisible);
            menu.getComponent('flash-preview').setDisabled(!flashPreviewVisible);
            menu.getComponent('edit').setVisible(editVisible || editViewVisible);
            menu.getComponent('edit').setDisabled(!editVisible && !editViewVisible);
            menu.getComponent('owa-view').setVisible(owaViewVisible);
            menu.getComponent('owa-view').setDisabled(!owaViewVisible);
            menu.getComponent('google-view').setVisible(googleViewVisible);
            menu.getComponent('google-view').setDisabled(!googleViewVisible);
            menu.getComponent('google-edit').setVisible(googleEditVisible);
            menu.getComponent('google-edit').setDisabled(!googleEditVisible || isLocked);
            menu.getComponent('msoo-edit').setVisible(msooEditVisible);
            menu.getComponent('msoo-edit').setDisabled(!msooEditVisible || isLocked);
            menu.getComponent('office365-edit').setVisible(office365EditVisible);
            menu.getComponent('office365-edit').setDisabled(!office365EditVisible || isLocked);
            menu.getComponent('sharecad-view').setVisible(shareCadViewVisible);
            menu.getComponent('sharecad-view').setDisabled(!shareCadViewVisible);
            menu.getComponent('autodesk-view').setVisible(autodeskViewVisible);
            menu.getComponent('autodesk-view').setDisabled(!autodeskViewVisible);
            menu.getComponent('box-view').setVisible(boxViewVisible);
            menu.getComponent('box-view').setDisabled(!boxViewVisible);
            menu.getComponent('cloud-convert').setVisible(cloudConvertVisible);
            menu.getComponent('cloud-convert').setDisabled(!cloudConvertVisible);
            menu.getComponent('mso-edit').setVisible(msoEditVisible || msoViewVisible);
            menu.getComponent('mso-edit').setDisabled(!msoEditVisible && !msoViewVisible);
            menu.getComponent('ooo-edit').setVisible(oooEditVisible || oooViewVisible);
            menu.getComponent('ooo-edit').setDisabled(!oooEditVisible && !oooViewVisible);
            menu.getComponent('zoho-edit').setVisible(zohoEditVisible);
            menu.getComponent('zoho-edit').setDisabled(!zohoEditVisible || isLocked);
            menu.getComponent('image-edit-in-pixlr').setVisible(imageEditInPixlrVisible);
            menu.getComponent('image-edit-in-pixlr').setDisabled(!imageEditInPixlrVisible);
            menu.getComponent('image-edit-in-adobe').setVisible(imageEditInAdobeVisible);
            menu.getComponent('image-edit-in-adobe').setDisabled(!imageEditInAdobeVisible);
            menu.getComponent('video-convert').setVisible(videoConvertVisible);
            menu.getComponent('video-convert').setDisabled(!videoConvertVisible);

            menu.getComponent('play-video-js').setVisible(playVideoHtml5Visible || playVideoFlashVisible);
            menu.getComponent('play-video-js').setDisabled(!playVideoHtml5Visible && !playVideoFlashVisible);
            menu.getComponent('play-audio-html5').setVisible(playAudioHtml5Visible);
            menu.getComponent('play-audio-html5').setDisabled(!playAudioHtml5Visible);

            return viewEditVisible;
        }
    });
    return viewEditSubMenu;
};