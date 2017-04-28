Ext.ns('HttpCommander.Lib');

/**
 * config: htcConfig, getIsEmbeddedtoIFRAME(), getRenderers(),
 * getMetadataProvider(), getDebugMode(), Msg, globalLoadMask,
 * isSpecialTreeFolderOrSubFolder(), $(), getGrid(), openGridFolder(),
 * getHideDetailsPaneValue(), getCurrentFolder(), getSelectedRow(),
 * getMetadataWindow(), getAvatarHtml(), isRootFolder()
 */
HttpCommander.Lib.DetailsPane = function (config) {
    var me,  // this object (details pane)
        hdr, // header container
        pps, // main properties panel with html table
        tmb, // thumbnails container
        hst, // history grid
        cmt, // comments grid
        drp, // description and readme.txt panel
        wps, // writable properties grid
        eps, // viewable properties panel with html table
        lmk, // loading mask
        htcConfig = config.htcConfig,
        debugmode = config.getDebugMode(),
        mdp = config.getMetadataProvider(),
        renderers = config.getRenderers(),
        cmtBlockTpl =
        '<div class="comment-card-w-hint">' +
            '<div class="comment-card">' +
                '<div class="threaded-comment-list">' +
                    '<div>' +
                        '<div class="comment-activity">' +
                            '<div class="comment">' +
                                '{0}' + // avatar
                                '<div class="comment-body">' +
                                    '<div class="comment-top-bar">' +
                                        '<div class="commenter-name">' +
                                            '{1}' + // user (need htmlEncode)
                                        '</div>' +
                                        '<div class="comment-when">' +
                                            '<div class="activity-time-ago">' +
                                                '{2}' + // date
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<span>' +
                                        '<div class="comment-text">' +
                                            '{3}' + // value (need htmlEncode with \n -> <br />)
                                        '</div>' +
                                    '</span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

    Ext.util.Format['htmlEncodeWrap'] = function (value) {
        return !value ? value : Ext.util.Format.htmlEncode(value)
            .replace(/\r\n|\n\r/gi, '<br />').replace(/\n|\r|\u21B5/gi, '<br />');
    };

    window.onSaveDesc = function (img) {
        if (!config.htcConfig.allowedDescription || !img || !img.parentNode) {
            return false;
        }
        var ta = img.parentNode.firstChild;
        if (!ta) {
            return false;
        }
        config.globalLoadMask.msg = config.htcConfig.locData.DetailsSavingMsg + '...';
        config.globalLoadMask.show();
        HttpCommander.Metadata.SaveDesc({ path: me.itemPath, name: me.itemName, desc: ta.value }, function (data, trans) {
            config.globalLoadMask.hide();
            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
            if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, config.Msg, config.htcConfig)) {
                config.openGridFolder(config.getCurrentFolder());
            }
        });
        return false;
    };

    // Private methods
    var calcWpsHeight = function () {
        var th = 50, i = 0, len, view, row;
        if (!!wps && wps.rendered) {
            len = wps.getStore().getTotalCount();
            view = wps.getView();
            for (; i < len; i++) {
                try {
                    row = view.getRow(i);
                    th += Ext.fly(row).getHeight();
                } catch (e) {
                    th += 26; // default row height?
                }
            }
            if (th < 180) {
                th = 180;
            }
            wps.setHeight(th);
            wps.syncSize();
            wps.doLayout();
            view.refresh();
        }
        return th;
    };
    var getMetadata = function (name, path, skipreadme, callback) {
        if (!me || !mdp || !name || !path || me.itemPath != path || me.itemName != name) {
            if (!!lmk) {
                lmk.hide();
            }
            return;
        }
        if (!!lmk) {
            lmk.show();
        }
        HttpCommander.Metadata.Load({ path: path, name: name, forDetailsPane: true, skipreadme: skipreadme }, function (data, trans) {
            if (Ext.isObject(data) && data.success && !!me && !!(me.itemPath) && !!(me.itemName) &&
                me.itemPath == data.path && me.itemName == data.name) {
                if (Ext.isFunction(callback)) {
                    callback.call(me, skipreadme, data);
                } else if (!!lmk) {
                    lmk.hide();
                }
            } else if (!!lmk) {
                lmk.hide();
            }
        });
    };
    var updateBaseProps = function (row, isRow) {
        var props = {
            datecreated: '',
            dateaccessed: '',
            datemodified: '',
            type: '',
            size: '',
            attributes: '',
            downloads: '',
            labelDisplay: 'none',
            labelHtml: '&nbsp;'
        };

        if (isRow) {
            if (row.rowtype == 'folder' || row.rowtype == 'file') {
                props.type = row.type || '';
                props.attributes = row.attributes || '';
                if (row.rowtype == 'folder') {
                    props.size = "<span id='" + config.$('linkCalculateDirSize1') + "'>"
                        + "<a href='#'>" + htcConfig.locData.FolderCalculateSize + "...</a></span>";
                    props.contains = '<tr><td class="prop-name">' + htcConfig.locData.FolderContainsField + ':</td><td class="prop-value">'
                        + "<span id='" + config.$('linkCalculateDirCounts1') + "'>"
                        + "<a href='#'>" + htcConfig.locData.FolderCalculateSize + "...</a></span>"
                        + '</td></tr>';
                } else if (row.size && String(row.size) != '') {
                    var sizeInBytes = row.size;
                    props.size = renderers.sizeRenderer(row.size);
                    if (props.size.toLowerCase().indexOf('byte') == -1) {
                        props.size += ' (' + sizeInBytes + '&nbsp;bytes)';
                    }
                }
                if (row.rowtype == 'file' && htcConfig.allowSetReadOnly) {
                    var attr = [];
                    if (!!row.attributes) {
                        attr = row.attributes.split(/\s*,\s*/);
                    }
                    var detectReadOnly = false;
                    var attrHtml = '';
                    for (var i = 0; i < attr.length; i++) {
                        if (attr[i] == 'ReadOnly')
                            detectReadOnly = true;
                        else
                            attrHtml += attr[i] + ', ';
                    }
                    props.attributes = Ext.util.Format.htmlEncode(attrHtml)
                        + '<input style="vertical-align:middle;" type="checkbox" '
                        + (detectReadOnly ? 'checked="checked" ' : '')
                        + " id='" + config.$('linkReadOnlyAttribute1') + "'"
                        + ' /> ReadOnly';
                }
            }
            if (row.rowtype == 'file') {
                var isEnableDownloadings = false;
                if (Ext.isNumber(row.downloads) && row.downloads >= 0) {
                    props.downloads = '<tr><td class="prop-name">' + htcConfig.locData.AmountOfDownloadingsFile
                        + ':</td><td class="prop-value">' + Ext.util.Format.htmlEncode(row.downloads) + '</td></tr>';
                    isEnableDownloadings = true;
                }
                if (!isEnableDownloadings) {
                    props.downloads = '';
                }
            }

            var grdStore = config.getGrid();
            if (!!grdStore) {
                grdStore = grdStore.getStore();
            } else {
                grdStore = null;
            }

            if (row.datecreated)
                props.datecreated = renderers.dateRendererLocal(row.datecreated, null, null, null, null, grdStore);
            if (row.datemodified)
                props.datemodified = renderers.dateRendererLocal(row.datemodified, null, null, null, null, grdStore);
            if (row.dateaccessed)
                props.dateaccessed = renderers.dateRendererLocal(row.dateaccessed, null, null, null, null, grdStore);

            // label
            if (config.htcConfig.enabledLabels && !Ext.isEmpty(row.label) && !Ext.isEmpty(row.label_color)) {
                props.labelHtml = renderers.labelItemRenderer(row, grdStore);
                props.labelDisplay = '';
            }

        } else if (Ext.isObject(row)) {
            props.type = row.type || '';
            props.attributes = row.attributes || '';

            if (row.isDir) {
                props.size = "<span id='" + config.$('linkCalculateDirSize1') + "'>"
                    + "<a href='#'>" + config.htcConfig.locData.FolderCalculateSize + "...</a></span>";
                props.contains = '<tr><td class="prop-name">' + config.htcConfig.locData.FolderContainsField + ':</td><td class="prop-value">'
                    + "<span id='" + config.$('linkCalculateDirCounts1') + "'>"
                    + "<a href='#'>" + config.htcConfig.locData.FolderCalculateSize + "...</a></span>"
                    + '</td></tr>';
            } else {
                if (row.size && String(row.size) != '') {
                    var sizeInBytes = row.size;
                    props.size = config.getRenderers().sizeRenderer(row.size);
                    if (props.size.toLowerCase().indexOf('byte') == -1)
                        props.size += ' (' + sizeInBytes + '&nbsp;bytes)';
                }
                if (config.htcConfig.allowSetReadOnly) {
                    var attr = [];
                    if (row.attributes)
                        attr = row.attributes.split(/\s*,\s*/);
                    var detectReadOnly = false;
                    var attrHtml = '';
                    for (var i = 0; i < attr.length; i++) {
                        if (attr[i] == 'ReadOnly')
                            detectReadOnly = true;
                        else
                            attrHtml += attr[i] + ', ';
                    }
                    props.attributes = Ext.util.Format.htmlEncode(attrHtml)
                        + '<input style="vertical-align:middle;" type="checkbox" '
                        + (detectReadOnly ? 'checked="checked" ' : '')
                        + " id='" + config.$('linkReadOnlyAttribute1') + "'"
                        + ' /> ReadOnly';
                }
                var isEnableDownloadings = false;
                if (typeof row.downloadings != 'undefined' && row.downloadings >= 0) {
                    props.downloads = '<tr><td class="prop-name">' + config.htcConfig.locData.AmountOfDownloadingsFile
                        + ':</td><td class="prop-value">' + Ext.util.Format.htmlEncode(row.downloadings) + '</td></tr>';
                    isEnableDownloadings = true;
                }
                if (!isEnableDownloadings) {
                    props.downloads = '';
                }
            }

            var grdStore = config.getGrid();
            if (!!grdStore) {
                grdStore = grdStore.getStore();
            } else {
                grdStore = null;
            }

            if (row.created)
                props.datecreated = renderers.dateRendererLocal(row.created, null, null, null, null, grdStore);
            if (row.modified)
                props.datemodified = renderers.dateRendererLocal(row.modified, null, null, null, null, grdStore);
            if (row.accessed)
                props.dateaccessed = renderers.dateRendererLocal(row.accessed, null, null, null, null, grdStore);

            // label
            if (config.htcConfig.enabledLabels && !Ext.isEmpty(row.label) && !Ext.isEmpty(row.label_color)) {
                props.labelHtml = renderers.labelItemRenderer(row, grdStore);
                props.labelDisplay = '';
            }

            if (!!pps) {
                if (pps.rendered) {
                    pps.update(props);
                    setTimeout(function () { bindLinkHandlers.call(me); }, 100);
                } else {
                    pps.data = props;
                }
            }
        }

        return props;
    };
    var prepareFileProperties = function (row, path) {
        if (!!cmt) {
            cmt.stopEditing(true);
        }

        drp.hide();

        var skipreadme = false, props = {
            datecreated: '',
            dateaccessed: '',
            datemodified: '',
            type: '',
            size: '',
            attributes: '',
            downloads: ''
        }, isArgsGood = Ext.isObject(row) && !Ext.isEmpty(row.name) && !Ext.isEmpty(path),
            name = isArgsGood ? row.name : null;

        if (!isArgsGood || row.isParent) {
            if (!!drp) {
                if (!Ext.isEmpty(path)) {
                    skipreadme = true;
                    var descReadme = {
                        desc: config.htcConfig.folderDescription || '',
                        readme: config.htcConfig.readmeContent || '&nbsp;',
                        isfile: false,
                        edit: !!config.htcConfig.currentPerms && config.htcConfig.currentPerms.modify
                    };
                    if (drp.rendered) {
                        drp.update(descReadme);
                    } else {
                        drp.data = descReadme;
                    }
                    drp.show();
                }
            }
        }

        if (!isArgsGood) {
            path = null;
        }

        if (me.itemPath == path && me.itemName == name && !me.forceRefresh) {
            if (!!lmk) {
                lmk.hide();
            }
            if (!!name || !!path) {
                drp.show();
            }
            return;
        }

        me.forceRefresh = false;
        me.itemPath = isArgsGood ? path : null;
        me.itemName = isArgsGood ? row.name : null;

        if (!!wps) {
            wps.getStore().loadData([]);
            wps.getStore().commitChanges();
        }

        if (!!hst) {
            hst.getStore().loadData([]);
            hst.getStore().commitChanges();
            hst.ownerCt.setTitle('&nbsp;');
        }

        if (!!cmt) {
            var cmtStore = cmt.getStore();
            if (!!cmtStore) {
                cmtStore.loadData([]); //TODO: load empty [] only if previously item is equals (or on add/edit comments)
                cmtStore.commitChanges();
                changeAvailableFields.call(me, cmtStore);
            }
            cmt.buttons[0].setValue('');
            cmt.buttons[2].setDisabled(true);
            cmt.ownerCt.setTitle('&nbsp;');
        }

        if (isArgsGood) {

            if (!!mdp && !me.collapsed) {
                if (!mdp.hasListener('requestcreated')) {
                    mdp.on('requestcreated', function (prov, opt, req) {
                        var ts = Ext.isObject(opt) ? opt.ts : null,
                            prevReq = !!me ? me.prevReq : null;
                        if (!!ts && ts.method == 'Load' && !!(ts.args) &&
                            !!(ts.args[0]) && ts.args[0].forDetailsPane) {
                            if (Ext.isObject(prevReq)) {
                                Ext.lib.Ajax.abort(prevReq);
                            }
                            me.prevReq = req;
                        }
                    }, mdp);
                }
                (getMetadata.debounce(100, me))(row.name, path, skipreadme, function (skrdm, mdata) {
                    if (!!pps) {
                        updateBaseProps.call(me, mdata.props, false);
                    }

                    if (!!drp && !skrdm) {
                        var descReadme = null;
                        if (Ext.isObject(mdata.descme)) {
                            descReadme = {
                                desc: mdata.descme.desc || '',
                                readme: mdata.descme.readme || '&nbsp;',
                                isfile: mdata.descme.isfile || false,
                                edit: mdata.descme.edit || false
                            };
                        } else if (!!mdata.props && mdata.props.isDir) {
                            descReadme = {
                                desc: '',
                                readme: '&nbsp;',
                                isfile: false,
                                edit: false
                            };
                        }
                        if (!!descReadme) {
                            if (drp.rendered) {
                                drp.update(descReadme);
                            } else {
                                drp.data = descReadme;
                            }
                            drp.show();
                        }
                    }

                    // show writeable extended properties in grid
                    if (!!wps) {
                        var wpsData = mdata.wprops || [];
                        var wpsStore = wps.getStore();
                        if (wpsStore) {
                            wpsStore.isUSA = mdata.isUSA;
                            wpsStore.loadData(wpsData);
                            wpsStore.commitChanges();
                        }
                        wps.setVisible(wpsData.length > 0);
                        if (wps.rendered) {
                            wps.syncSize();
                        }
                        wps.doLayout();
                        wps.setWidth('100%');
                        wps.body.setWidth('100%');
                        wps.getView().refresh();
                        if (wps.isVisible()) {
                            setTimeout(calcWpsHeight, 50);
                        }
                    }

                    // show extended properties
                    if (!!eps) {
                        var epsData = mdata.propsex || [];
                        if (eps.rendered) {
                            eps.update(epsData);
                        } else {
                            eps.data = (epsData);
                        }
                        eps.setVisible(epsData.length > 0);
                        if (eps.rendered) {
                            eps.syncSize();
                        }
                        eps.doLayout();
                        eps.setWidth('100%');
                        eps.body.setWidth('100%');
                    }

                    if (!!hst) {
                        var hstStore = hst.getStore();
                        var hstTc = 0;
                        if (hstStore) {
                            hstStore.isUSA = mdata.isUSA;
                            hstStore.loadData(mdata.modifications || []);
                            hstStore.sort('date', 'DESC');
                            hstStore.commitChanges();
                            hstTc = hstStore.getTotalCount();
                        }
                        hst.ownerCt.setTitle(hstTc <= 0 ? '&nbsp;' : hstTc);
                        if (hst.rendered) {
                            hst.syncSize();
                        }
                        hst.doLayout();
                    }
                    if (!!cmt) {
                        var cmtStore = cmt.getStore();
                        var cmtsTc = 0;
                        if (!!cmtStore) {
                            cmtStore.isUSA = mdata.isUSA;
                            cmtStore.loadData(config.htcConfig.isAllowedComments <= 0 ? [] : (mdata.metadata || []));
                            cmtStore.filter('title', 'comment', false, false, true);
                            cmtsTc = cmtStore.data.length;
                            cmtStore.sort('datemodified', 'DESC');
                            cmtStore.commitChanges();
                        }
                        cmt.ownerCt.setTitle(cmtsTc <= 0 ? '&nbsp;' : cmtsTc);
                        changeAvailableFields.call(me, cmtStore);
                        cmt.buttons[0].setValue('');
                        cmt.buttons[2].setDisabled(true);
                        var allowEditCmt = config.htcConfig.currentPerms &&
                            config.htcConfig.currentPerms.modify;
                        cmt.fbar.setDisabled(!allowEditCmt);
                        if (cmt.rendered) {
                            cmt.syncSize();
                        }
                        cmt.doLayout();
                    }
                    if (!!lmk) {
                        lmk.hide();
                    }

                    var mw = config.getMetadataWindow();
                    if (!!mw && mw.isVisible()) {
                        setTimeout(function () {
                            mw.initialize.call(mw, { path: me.itemPath, name: me.itemName }, mdata);
                            mw.syncSizeWrap.call(mw);
                        }, 50);
                    }
                });
            }

            props = updateBaseProps.call(me, row, true);
        } else if (!!lmk) {
            lmk.hide();
        }

        if (!!pps) {
            if (pps.rendered) {
                pps.update(props);
                setTimeout(function () { bindLinkHandlers.call(me); }, 100);
            } else {
                pps.data = props;
            }
            pps.setVisible(isArgsGood);
        }

        if (!!wps) {
            wps.setVisible(false);
        }

        if (!!eps) {
            eps.setVisible(false);
        }
    };
    var calculateDirSize = function () {
        var folderInfo = { path: me.itemPath, name: me.itemName };
        if (!folderInfo.path || !folderInfo.name ||
            Ext.isEmpty(folderInfo.path) || Ext.isEmpty(folderInfo.name))
            return;
        var holder = document.getElementById(config.$('linkCalculateDirSize1'));
        var hodler1 = document.getElementById(config.$('linkCalculateDirCounts1'));
        if (!holder || !hodler1)
            return;
        if (holder.getElementsByTagName('a').length < 1 ||
            hodler1.getElementsByTagName('a').length < 1)
            return;
        var oldContent = holder.innerHTML,
            oldContent1 = hodler1.innerHTML;
        holder.innerHTML = '<img align="absmiddle" alt="' + htcConfig.locData.Calculating + '..."'
            + ' src="' + HttpCommander.Lib.Utils.getIconPath(htcConfig, 'loadingsmall.gif') + '" />';
        hodler1.innerHTML = '<img align="absmiddle" alt="' + htcConfig.locData.Calculating + '..."'
            + ' src="' + HttpCommander.Lib.Utils.getIconPath(htcConfig, 'loadingsmall.gif') + '" />';

        HttpCommander.Common.CalculateSizeDir(folderInfo, function (data, trans) {
            holder.innerHTML = oldContent;
            hodler1.innerHTML = oldContent1;
            if (typeof data == 'undefined') {
                config.Msg.alert(htcConfig.locData.CommonErrorCaption,
                    Ext.util.Format.htmlEncode(trans.message));
                return;
            }
            if (!data.success) {
                config.Msg.alert(htcConfig.locData.CommonErrorCaption, data.message);
            }
            var sizeInBytes = data.size;
            var recalcHtml = " <a href='#' >" + htcConfig.locData.FolderRecalculateSize + "...</a>";
            var html = renderers.sizeRenderer(data.size);
            if (html.toLowerCase().indexOf('byte') == -1)
                html += ' (' + sizeInBytes + '&nbsp;bytes)';
            html += recalcHtml;
            holder.innerHTML = html;
            hodler1.innerHTML = String.format(htcConfig.locData.FolderContainsFilesFolders,
                data.files, data.folders) + recalcHtml;
            bindLinkHandlers.call(me);
        });
    };
    var readOnlyStateChange = function () {
        var checkBox = document.getElementById(config.$('linkReadOnlyAttribute1'));
        if (htcConfig.allowSetReadOnly && !Ext.isEmpty(me.itemPath) && !Ext.isEmpty(me.itemName)) {
            if (checkBox && typeof checkBox.checked == 'boolean') {
                var setReadOnlyInfo = {
                    readonly: checkBox.checked,
                    path: me.itemPath,
                    name: me.itemName
                };
                config.globalLoadMask.msg = htcConfig.locData.ChangingReadOnlyProgressMessage + "...";
                config.globalLoadMask.show();
                HttpCommander.Common.ChangeReadOnly(setReadOnlyInfo, function (data, trans) {
                    config.globalLoadMask.hide();
                    config.globalLoadMask.msg = htcConfig.locData.ProgressLoading + "...";
                    if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, config.Msg, htcConfig)) {
                        checkBox.checked = setReadOnlyInfo.readonly;
                    } else {
                        checkBox.checked = !setReadOnlyInfo.readonly;
                    }
                });
            }
        }
    }
    var bindLinkHandlers = function () {
        if (!me || !me.rendered)
            return;
        var holder = document.getElementById(config.$('linkCalculateDirSize1'));
        if (holder) {
            holder.children[0].onclick = function () {
                calculateDirSize.call(me);
                return false;
            }
        }
        holder = document.getElementById(config.$('linkCalculateDirCounts1'));
        if (holder) {
            holder.children[0].onclick = function () {
                calculateDirSize.call(me);
                return false;
            }
        }
        holder = document.getElementById(config.$('linkReadOnlyAttribute1'));
        if (holder) {
            holder.onclick = function () {
                readOnlyStateChange.call(me);
                return false;
            }
        }
    };
    var prepareData = function (sel, curFolder, fromExpand) {
        if (me.expandCall && !fromExpand) {
            return;
        }

        if (!!lmk) {
            lmk.show();
        }

        var spec = config.isSpecialTreeFolderOrSubFolder(curFolder),
            row = (!spec && !!sel && !!(sel.data)) ? sel.data : null;

        if (Ext.isEmpty(curFolder)) {
            row = null;
            curFolder = null;
        }

        if (!!row && !spec && (spec = config.isSpecialTreeFolderOrSubFolder(row.path))) {
            row = null;
        }

        if (!row && !Ext.isEmpty(curFolder)) {
            if (curFolder == 'root' || curFolder == ':root') {
                curFolder = null;
            } else if (!spec) {
                var grid = config.getGrid();
                if (!!grid && grid.isVisible()) {
                    var upLink = grid.getStore().getAt(0);
                    if (!!upLink && upLink.get('name') == '..') {
                        var fName = curFolder.trim().split('/');
                        var newCurFolder = '', len = fName.length - 1;
                        for (var i = 0; i < len; i++) {
                            if (newCurFolder.length > 0) {
                                newCurFolder += '/';
                            }
                            newCurFolder += fName[i];
                        }
                        fName = fName[len].trim();
                        if (Ext.isEmpty(fName)) {
                            curFolder = null;
                        } else {
                            if (Ext.isEmpty(newCurFolder)) {
                                curFolder = ':root';
                            } else {
                                curFolder = newCurFolder;
                            }
                            row = {
                                dateaccessed: upLink.data.dateaccessed,
                                datecreated: upLink.data.datecreated,
                                datemodified: upLink.data.datemodified,
                                icon: HttpCommander.Lib.Utils.getIconPath(config.htcConfig, 'folder'),
                                name: fName,
                                rowtype: 'folder',
                                type: config.htcConfig.locData.CommonValueTypeFolder,
                                isParent: true
                            };
                        }
                    }
                }
            }
        }

        curFolder = spec ? null : curFolder;
        prepareFileProperties.call(me, row, curFolder);
        var name = !!row ? Ext.util.Format.htmlEncode(row.name || '') : '';
        var icon = !!row ? row.icon : null;
        if (Ext.isEmpty(name) && !Ext.isEmpty(curFolder)) {
            name = curFolder.trim().split('/');
            name = name[name.length - 1].trim();
            if (Ext.isEmpty(name)) {
                name = '';
            } else if (!icon) {
                icon = HttpCommander.Lib.Utils.getIconPath(config.htcConfig, 'folder');
            }
        }
        setTitleIcon.call(me, name, icon);
        setThumb.call(me, row, curFolder);
    };
    var setThumb = function (row, curFolder) {
        var imgTag = null;

        curFolder = curFolder ? curFolder.replace(/\/+$/g, '') : null;
        if (!Ext.isEmpty(curFolder) && curFolder.trim().length > 0) {
            curFolder += '/';
        }
        var ext = row ? HttpCommander.Lib.Utils.getFileExtension(row.name) : '';
        var fdsz = row ? row.size || row.size_hidden : null, fileSZ = 0;
        if (!Ext.isEmpty(fdsz) && String(fdsz).trim().length > 0) {
            fileSZ = parseFloat(fdsz);
            if (isNaN(fileSZ) || !isFinite(fileSZ)) {
                fileSZ = 0;
            }
        }

        if (row && htcConfig.currentPerms && htcConfig.currentPerms.download && htcConfig.showImagesThumbnail &&
            HttpCommander.Lib.Consts.imagesFileTypes.indexOf(";" + ext + ";") != -1 && fileSZ > 0) {
            var fileDate = '';
            var isSvg = (ext == 'svg');
            if (Ext.isDate(row.datemodified)) {
                fileDate = 'date=' + row.datemodified.getTime() + '&';
            } else if (isSvg) {
                fileDate = 'date=' + ((new Date()).getTime()) + '&';
            }
            imgTag = "<img align='absmiddle' alt='' style='vertical-align:bottom;max-width:160px !important;max-height:120px !important;' src='"
                + htcConfig.relativePath
                + (isSvg ? "Handlers/Download.ashx?action=download&" : "Handlers/ThumbnailHandler.ashx?")
                + fileDate + "file=" + encodeURIComponent(curFolder + row.name).replace(/'/gi, '%27').replace(/"/gi, '%22')
                + "' />";
        } else if (row && htcConfig.currentPerms && htcConfig.currentPerms.download &&
            htcConfig.enableThumbnailViewImagesLoading &&
            HttpCommander.Lib.Consts.imagesFileTypes &&
            HttpCommander.Lib.Consts.imagesFileTypes.indexOf(";" + ext + ";") != -1 && fileSZ > 0) {
            var fileDate = '';
            var isSvg = (ext == 'svg');
            if (Ext.isDate(row.datemodified)) {
                fileDate = 'date=' + row.datemodified.getTime() + '&';
            } else if (isSvg) {
                fileDate = 'date=' + ((new Date()).getTime()) + '&';
            }
            var sizeQuery = isSvg ? '' : ('size=' + maxWidthThumb + 'x' + maxHeightThumb + '&');
            imgTag = '<img align="absmiddle" alt="" style="vertical-align:bottom;'
                + 'max-width:' + maxWidthThumb + 'px !important;max-height:' + maxHeightThumb + 'px !important;" src="'
                + htcConfig.relativePath
                + (isSvg ? "Handlers/Download.ashx?action=download&" : "Handlers/ThumbsGridViewHandler.ashx?")
                + fileDate + sizeQuery
                + "file=" + encodeURIComponent(curFolder + row.name).replace(/'/gi, '%27').replace(/"/gi, '%22')
                + '" />';
        }

        if (Ext.isEmpty(imgTag)) {
            imgTag = '&nbsp;';
        } else {
            imgTag += '<hr />';
        }

        if (tmb.rendered) {
            tmb.update(imgTag);
        } else {
            tmb.html = imgTag;
        }
    };
    var setTitleIcon = function (title, icon) {
        var html = '';
        if (!!icon) {
            html += '<img alt="" src="' + htcConfig.relativePath + icon + '" class="filetypeimage" />';
        }
        if (!Ext.isEmpty(title)) {
            html += '<span style="cursor:default;" ext:qtip="' + Ext.util.Format.htmlEncode(title) + '">' + title + '</span>';
        }
        if (html.length > 0) {
            html += '<br />';
        }
        if (hdr.rendered) {
            hdr.update(html);
        } else {
            hdr.html = html;
        }
    };
    var getJSONMetadataArray = function (mds) {
        var mdArray = new Array();
        var data = (mds.snapshot || mds.data);
        if (data.items != undefined && data.items != null) {
            Ext.each(data.items, function (item) {
                mdArray.push(item.data);
            });
        }
        Ext.each(config.htcConfig.metaDataFields, function (f) {
            if (f.type == "date") {
                Ext.each(mdArray, function (mdi) {
                    eval("if (mdi." + f.name + ") try { mdi." + f.name + " = mdi." + f.name + ".toUTCString(); } catch (e) { }");
                });
            }
        });
        return mdArray;
    };
    var allCommentsUsed = function (rows) {
        if ((config.htcConfig.isAllowedComments <= 0) || !Ext.isArray(rows)) {
            return true;
        }
        return (config.htcConfig.isAllowedComments > 1) ? false : (rows.length > 0);
    };
    var changeAvailableFields = function (store) {
        if (store && cmt) {
            var range = store.getRange();
            var cArea = cmt.buttons[0];
            var cBtn = cmt.buttons[2];
            var allCUsed = allCommentsUsed(range);
            if (cArea) {
                cArea.setDisabled(allCUsed);
            }
            if (cBtn) {
                cBtn.setDisabled(allCUsed || Ext.isEmpty(cArea.getValue()));
            }
        }
    }
    var saveMetadata = function (dataBefore, record) {
        var cmtStore = !!cmt ? cmt.getStore() : null;
        var reject = function () {
            if (!!record) {
                record.reject();
            } else if (!!cmtStore && Ext.isArray(dataBefore)) {
                cmtStore.loadData(dataBefore);
                cmtStore.filter('title', 'comment', false, false, true);
                cmtsTc = cmtStore.data.length;
                cmtStore.sort('datemodified', 'DESC');
                cmtStore.commitChanges();
                cmt.ownerCt.setTitle(cmtsTc <= 0 ? '&nbsp;' : cmtsTc);
            }
        }
        if (!cmtStore || Ext.isEmpty(me.itemPath) || Ext.isEmpty(me.itemName)) {
            reject();
            return;
        }
        var mdInfo = {
            path: me.itemPath,
            name: me.itemName,
            metadata: getJSONMetadataArray.call(me, cmtStore),
            forDetailsPane: true
        };
        config.globalLoadMask.msg = config.htcConfig.locData.DetailsSavingMsg + "...";
        config.globalLoadMask.show();
        HttpCommander.Metadata.Save(mdInfo, function (mdata, strans) {
            config.globalLoadMask.hide();
            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
            if (HttpCommander.Lib.Utils.checkDirectHandlerResult(
                    mdata, strans, config.Msg, config.htcConfig, 2)) {
                cmtStore.commitChanges();
                var folder = mdInfo.path;
                if (config.isRootFolder(folder)) {
                    if (!Ext.isEmpty(mdInfo.name)) {
                        me.forceRefresh = true;
                        config.openGridFolder(mdInfo.name);
                    }
                } else if (!Ext.isEmpty(folder)) {
                    if (!Ext.isEmpty(mdInfo.name)) {
                        config.setSelectPath({
                            name: mdInfo.name,
                            path: folder
                        });
                    }
                    me.forceRefresh = true;
                    config.openGridFolder(folder);
                }
            } else {
                reject();
            }
        });
    };

    return (me = new Ext.TabPanel({
        //animCollapse: false,
        title: '&nbsp;',
        region: 'east',
        header: false,
        bodyBorder: true,
        collapsible: true,
        collapsed: config.getHideDetailsPaneValue(),
        minSize: 120,
        maxSize: 420,
        size: 270,
        autoScroll: 'false',
        tabPosition: 'bottom',
        activeTab: 0,
        cls: 'detailed-tap-panel',
        frame: false,
        collapseMode: 'mini',
        width: config.getIsEmbeddedtoIFRAME() ? 170 : 270,
        autoScroll: false,// true,
        split: true,

        itemPath: null,
        itemName: null,
        listeners: {
            render: function (tbp) {
                lmk = new Ext.LoadMask(tbp.getEl());
                if (config.htcConfig.isAllowedComments <= 0) {
                    me.hideTabStripItem('cmt-tab');
                }
            },
            expand: function (pane) {
                pane.syncShadow();
                me.forceRefresh = true;
                me.expandCall = true;
                setTimeout(function () {
                    me.expandCall = false;
                }, 1000);
                me.prepareData.call(me, config.getSelectedRow(), config.getCurrentFolder(), true);
                var mw = config.getMetadataWindow();
                if (!!mw && mw.isVisible()) {
                    mw.onDetailsPaneToggled.call(mw, false);
                }
                HttpCommander.Lib.Utils.setCookie(config.$("detailsexpanded"), 'true');
            },
            collapse: function (pane) {
                var mw = config.getMetadataWindow();
                if (!!mw && mw.isVisible()) {
                    mw.onDetailsPaneToggled.call(mw, true);
                }
                HttpCommander.Lib.Utils.setCookie(config.$("detailsexpanded"), 'false');
            },
            tabchange: function (pane, tab) {
                if (!!tab && tab.itemId == 'first-tab' && !!wps) {
                    if (wps.rendered) {
                        wps.syncSize();
                    }
                    wps.doLayout();
                    wps.setWidth('100%');
                    wps.body.setWidth('100%');
                    setTimeout(calcWpsHeight, 50);
                }
            }
        },
        items: [{
            itemId: 'first-tab',
            title: '&nbsp;',
            iconCls: 'icon-details',
            padding: 5,
            xtype: 'panel',
            header: false,
            border: false,
            frame: false,
            bodyStyle: {
                overflowY: 'auto'
            },
            listeners: {
                resize: function () {
                    if (!!wps && wps.rendered && wps.isVisible()) {
                        wps.syncSize();
                        wps.doLayout();
                        wps.setWidth('100%');
                        wps.body.setWidth('100%');
                        setTimeout(calcWpsHeight, 50);
                    }
                }
            },
            tabTip: config.htcConfig.locData.CommandDetails,
            items: [hdr = new Ext.BoxComponent({
                style: {
                    fontWeight: 'bold',
                    fontSize: '1.2em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                },
                html: '&nbsp;'
            }), pps = new Ext.Panel({
                header: false,
                flex: 1,
                anchor: '100%',
                frame: false,
                cls: 'detailed-props',
                autoHeight: true,
                baseCls: 'x-plain',
                tpl: new Ext.Template(
                    '<table style="width:100%;">' +
                    '<tr><td class="prop-name">' + htcConfig.locData.CommonFieldLabelType + ':</td><td class="prop-value">{type:htmlEncode}</td></tr>' +
                    '<tr><td class="prop-name">' + htcConfig.locData.CommonFieldLabelSize + ':</td><td class="prop-value">{size}</td></tr>' +
                    '{contains}' +
                    '<tr><td class="prop-name">' + htcConfig.locData.FileAttributesField + ':</td><td class="prop-value">{attributes}</td></tr>' +
                    '{downloads}' +
                    '<tr><td class="prop-name">' + htcConfig.locData.CommonFieldLabelDateCreated + ':</td><td class="prop-value">{datecreated:htmlEncode}</td></tr>' +
                    '<tr><td class="prop-name">' + htcConfig.locData.CommonFieldLabelDateModified + ':</td><td class="prop-value">{datemodified:htmlEncode}</td></tr>' +
                    '<tr><td class="prop-name">' + htcConfig.locData.CommonFieldLabelDateAccessed + ':</td><td class="prop-value">{dateaccessed:htmlEncode}</td></tr>' +
                    '<tr style="display:{labelDisplay};"><td class="prop-name">' + htcConfig.locData.LabelsTitle + ':</td><td class="prop-value">{labelHtml}</td></tr>' +
                    '</table><hr />'
                )
            }), tmb = new Ext.Container({
                style: {
                    textAlign: 'center'
                },
                html: '&nbsp;'
            }), drp = new Ext.Panel({
                header: false,
                flex: 1,
                anchor: '100%',
                frame: false,
                cls: 'detailed-props',
                autoHeight: true,
                baseCls: 'x-plain',
                tpl: new Ext.XTemplate(
                    '<table style="width:100%;">',
                    '<tpl if="' + config.htcConfig.allowedDescription + '">',
                        '<tr><td style="font-weight:bold;',
                            '<tpl if="edit == false">',
                                'border-bottom:solid 1px;',
                            '</tpl>',
                            'padding-top:5px;">',
                            Ext.util.Format.htmlEncode(config.htcConfig.locData.CommonFieldLabelDescription),
                        '</td></tr>',
                        '<tr><td style="white-space:normal;padding-right:6px;position:relative;">',
                            '<tpl if="edit == true">',
                                '<textarea style="white-space:normal;width:100%;height:44px;" placeholder="' + Ext.util.Format.htmlEncode(config.htcConfig.locData.EmptyDescriptionText) + '" autocomplete="off" class=" x-form-textarea x-form-field">{desc:htmlEncode}</textarea>',
                                '<img alt="" src="' + HttpCommander.Lib.Utils.getIconPath(config, 'save')
                                + '" title="' + Ext.util.Format.htmlEncode(config.htcConfig.locData.CommandSave)
                                + '" class="save-desc-icon" onclick="window.onSaveDesc(this);" />',
                            '</tpl>',
                            '<tpl if="edit == false">',
                                '{desc:htmlEncodeWrap}',
                            '</tpl>',
                            '<br />',
                        '</td></tr>',
                    '</tpl>',
                    '<tpl if="isfile == false">',
                        '<tr><td style="font-weight:bold;border-bottom:solid 1px;"><br />',
                            Ext.util.Format.htmlEncode(config.htcConfig.locData.CommonFieldLabelReadMeTxt),
                        '</td></tr>',
                        '<tr><td style="white-space:normal;">{readme}</td></tr>',
                    '</tpl>',
                    '</table>',
                    '<tpl if="' + config.htcConfig.allowedDescription + '||(isfile == false)">',
                        '<hr />',
                    '</tpl>'
                )
            }), wps = new Ext.grid.EditorGridPanel({
                clicksToEdit: 1,
                header: false,
                loadMask: false,
                autoScroll: false,
                //layout: 'fit',
                getTotalHeight: function () {
                    return 'auto';
                },
                style: {
                    minHeight: '175px'
                },
                minHeight: 175,
                hidden: true,
                border: false,
                frame: false,
                cls: 'writeable-props',
                forceLayout: true,
                enableHdMenu: false,
                enableColumnHide: false,
                enableColumnMove: false,
                enableColumnResize: false,
                hideHeaders: true,
                trackMouseOver: false,
                disableSelection: true,
                height: 200,
                width: '100%',
                stripeRows: false,
                viewConfig: {
                    autoFill: true,
                    //forceFit: true,
                    headersDisabled: true,
                    hideSortIcons: true
                },
                selModel: new Ext.grid.RowSelectionModel({
                    singleSelect: true,
                    moveEditorOnEnter: true
                }),
                store: new Ext.data.JsonStore({
                    autoSave: false,
                    remoteSort: false,
                    pruneModifiedRecords: false,
                    autoLoad: true,
                    autoDestroy: true,
                    data: [],
                    fields:
                    [
                        { name: 'k', type: 'string' },
                        { name: 'n', type: 'string' },
                        { name: 'v', type: 'string' },
                        { name: 'visd', type: 'boolean' },
                        { name: 'e', type: 'string' }
                    ]
                }),
                autoExpandColumn: 'value-column',
                columns: [{
                    id: 'name-column',
                    minWidth: 75,
                    width: 85,
                    sortable: false,
                    dataIndex: 'n',
                    renderer: function (val) {
                        return String.format(
                            "<span style='white-space:normal;color:#6E6E6E;'>{0}:</span>",
                            Ext.util.Format.htmlEncode(val || '')
                        );
                    }
                }, {
                    id: 'value-column',
                    sortable: false,
                    dataIndex: 'v',
                    flex: 1,
                    renderer: function (val, cell, rec, rowIndex, colIndex, store) { // word-wrap renderer for grid cell
                        if (!Ext.isEmpty(val)) {
                            if (rec.get('d')) {
                                var d = new Date(parseInt(val, 10));
                                return String.format(
                                    "<span style='white-space:normal !important;line-height:1em;'>{0}</span>",
                                    renderers.dateRendererLocal(d, cell, rec, rowIndex, colIndex, store)
                                );
                            } else {
                                return String.format(
                                    "<span style='white-space:normal !important;line-height:1em;'>{0}</span>",
                                    Ext.util.Format.htmlEncode(val).replace(/\r\n|\n\r/gi, '<br />').replace(/\n|\r|\u21B5/gi, '<br />')
                                );
                            }
                        } else if (!Ext.isEmpty(rec.get('e'))) {
                            return String.format(
                                "<span style='color:gray;white-space:normal !important;line-height:1em;'>{0}</span>",
                                Ext.util.Format.htmlEncode(rec.get('e'))
                            );
                        } else {
                            return '&nbsp;';
                        }
                    },
                    editor: new Ext.form.TextArea({
                        allowBlank: true,
                        selectOnFocus: true,
                        style: {
                            zIndex: '5'
                        }
                    })
                }],
                buttons: [{
                    text: config.htcConfig.locData.CommandSave,
                    handler: function () {
                        var values = [];
                        if (!wps || !wps.isVisible()) {
                            return;
                        }
                        Ext.each(wps.getStore().getModifiedRecords(), function (rec) {
                            if (!!rec) {
                                values.push({ k: rec.get('k'), v: rec.get('v') });
                            }
                        });
                        if (values.length == 0) {
                            return;
                        }
                        config.globalLoadMask.msg = config.htcConfig.locData.DetailsSavingMsg + '...';
                        config.globalLoadMask.show();
                        HttpCommander.Metadata.SaveProps({ path: me.itemPath, name: me.itemName, values: values }, function (data, trans) {
                            config.globalLoadMask.hide();
                            config.globalLoadMask.msg = config.htcConfig.locData.ProgressLoading + "...";
                            if (HttpCommander.Lib.Utils.checkDirectHandlerResult(data, trans, config.Msg, config.htcConfig)) {
                                me.forceRefresh = true;
                                me.prepareData.call(me, config.getSelectedRow(), config.getCurrentFolder());
                            } else {
                                wps.getStore().rejectChanges();
                            }
                        });
                    }
                }]
            }), eps = new Ext.Panel({
                header: false,
                flex: 1,
                anchor: '100%',
                frame: false,
                cls: 'detailed-props',
                autoHeight: true,
                baseCls: 'x-plain',
                tpl: new Ext.XTemplate(
                    '<table style="width:100%;">',
                    '<tpl for=".">',
                        '<tpl if="g == 1">',
                            '<tr><td colspan="2" style="font-weight:bold;border-bottom:solid 1px;"><br />{n:htmlEncode}</td></tr>',
                            '<tpl for="v">',
                                '<tr><td class="prop-name">{n:htmlEncode}:</td><td class="prop-value">',
                                '<tpl if="d == 1">',
                                    '{[this.toDateStr(values.v)]}',
                                '</tpl>',
                                '<tpl if="d == 0">',
                                    '{v:htmlEncode}',
                                '</tpl>',
                                '</td></tr>',
                            '</tpl>',
                        '</tpl>',
                        '<tpl if="g == 0">',
                            '<tr><td class="prop-name">{n:htmlEncode}:</td><td class="prop-value">',
                            '<tpl if="d == 1">',
                                '{[this.toDateStr(values.v)]}',
                            '</tpl>',
                            '<tpl if="d == 0">',
                                '{v:htmlEncode}',
                            '</tpl>',
                            '</td></tr>',
                        '</tpl>',
                    '</tpl>',
                    '</table>', {
                        toDateStr: function (v) {
                            var dt = new Date(parseInt(v, 10));
                            return String.format(
                                "<span style='white-space:normal !important;line-height:1em;'>{0}</span>",
                                renderers.dateRendererLocal(dt, null, null, null, null, !!wps ? wps.getStore() : null)
                            );
                        }
                    }
                )
            })]
        }, {
            title: '&nbsp;',
            layout: 'fit',
            frame: false,
            border: false,
            padding: 0,
            margin: 0,
            iconCls: 'icon-history',
            tabTip: config.htcConfig.locData.FileModificationsHistory,
            items: [hst = new Ext.grid.GridPanel({
                //header: false,
                title: config.htcConfig.locData.FileModificationsHistory,
                loadMask: false,
                layout: 'fit',
                border: false,
                frame: false,
                flex: 1,
                forceLayout: true,
                enableHdMenu: false,
                enableColumnHide: false,
                enableColumnMove: false,
                enableColumnResize: false,
                hideHeaders: true,
                trackMouseOver: false,
                disableSelection: true,
                stripeRows: true,
                store: new Ext.data.JsonStore({
                    autoSave: false,
                    remoteSort: false,
                    pruneModifiedRecords: false,
                    autoLoad: true,
                    autoDestroy: true,
                    data: [],
                    isUSA: true,
                    fields:
                    [
                        { name: 'type', type: 'string' },
                        { name: 'user', type: 'string' },
                        { name: 'date', type: 'date' },
                        { name: 'size', type: 'string' },
                        { name: 'path', type: 'string' }
                    ]
                }),
                columns: [{
                    sortable: false,
                    dataIndex: 'user',
                    flex: 1,
                    renderer: function (val, cell, rec, row, col, store) {
                        var avatar = config.getAvatarHtml(val || ' ', true);
                        var user = HttpCommander.Lib.Utils.parseUserName(val) || '';
                        var t = String(rec.get('type') || '').toLowerCase();
                        switch (t) {
                            case 'created':
                                t = htcConfig.locData.FileModificationsTypeCreated;
                                break;
                            case 'modified':
                                t = htcConfig.locData.FileModificationsTypeModified;
                                break;
                            case 'renamed':
                                t = config.htcConfig.locData.FileModificationsTypeRenamed;
                                break;
                            case 'restored':
                                t = config.htcConfig.locData.FileModificationsTypeRestored;
                                break;
                            case 'deleted':
                                t = config.htcConfig.locData.FileModificationsTypeDeleted;
                                break;
                            default:
                                t = null;
                                break;
                        }
                        return avatar + '<span style="font-weight:bold;">' + Ext.util.Format.htmlEncode(user)
                            + '</span>' + (Ext.isEmpty(t) ? '' : ('<br />' + t));
                    }
                }, {
                    minWidth: 140,
                    width: 140,
                    sortable: false,
                    dataIndex: 'date',
                    align: 'right',
                    flex: 1,
                    renderer: function (val, cell, rec, row, col, store) {
                        return renderers.dateRendererLocal(val, cell, rec, row, col, store)
                            + '<br />' + renderers.sizeRenderer(rec.get('size'));
                    }
                }],
                bodyCssClass: 'detailed-pane-history-row',
                viewConfig: {
                    autoFill: true,
                    forceFit: true,
                    headersDisabled: true,
                    hideSortIcons: true,
                    deferEmptyText: false,
                    emptyText: '<span style="font-size:1.1em;">' + config.htcConfig.locData.NoHistoryYetHint + '</span>'
                }
            })]
        }, {
            title: '&nbsp;',
            iconCls: 'icon-comment',
            tabTip: config.htcConfig.locData.CommonFieldLabelComments,
            layout: 'fit',
            frame: false,
            border: false,
            padding: 0,
            margin: 0,
            itemId: 'cmt-tab',
            hidden: config.htcConfig.isAllowedComments <= 0,
            items: [cmt = new Ext.grid.EditorGridPanel({
                //header: false,
                title: config.htcConfig.locData.CommonFieldLabelComments,
                loadMask: false,
                layout: 'fit',
                border: false,
                frame: false,
                flex: 1,
                cls: 'detailed-grid-comments',
                hidden: config.htcConfig.isAllowedComments <= 0,
                forceLayout: true,
                enableHdMenu: false,
                enableColumnHide: false,
                enableColumnMove: false,
                enableColumnResize: false,
                hideHeaders: true,
                clicksToEdit: 2,// 1,
                forceValidation: true,
                trackMouseOver: true,
                selModel: new Ext.grid.RowSelectionModel({
                    singleSelect: true,
                    moveEditorOnEnter: true
                }),
                stripeRows: true,
                store: new Ext.data.JsonStore({
                    autoSave: false,
                    remoteSort: false,
                    pruneModifiedRecords: false,
                    autoLoad: true,
                    autoDestroy: true,
                    data: [],
                    isUSA: true,
                    totalProperty: 'total',
                    writer: new Ext.data.JsonWriter({
                        encode: true,
                        writeAllFields: true
                    }),
                    fields: config.htcConfig.metaDataFields
                }),
                columns: [{
                    sortable: false,
                    dataIndex: 'value',
                    flex: 1,
                    editable: true,
                    editor: new Ext.form.TextArea({
                        allowBlank: false,
                        selectOnFocus: true,
                        style: {
                            marginLeft: '40px',
                            marginTop: '30px'
                        }
                    }),
                    renderer: function (val, cell, rec, row, col, store) {
                        var user = String(rec.get('userlastmodified') || '');
                        var avatar = config.getAvatarHtml(user);
                        var rawDate = rec.get('datemodified');
                        var date = renderers.dateRendererLocal(rawDate, cell, rec, row, col, store);
                        if (Ext.isDate(rawDate)) {
                            var now = new Date();
                            if ((now.getTime() - rawDate.getTime()) >= 604800000) { // 7 days
                                date = date;
                            } else {
                                date = String.format(htcConfig.locData.CommonChangedAgo,
                                    HttpCommander.Lib.Utils.dateDiff(
                                        rawDate,
                                        now,
                                        htcConfig.locData.DaysShort,
                                        htcConfig.locData.HoursShort,
                                        htcConfig.locData.MinutesShort,
                                        true
                                    )
                                );
                            }
                        }
                        var cmtVal = Ext.util.Format.htmlEncode(val || '')
                            .replace(/\r\n|\n\r/gi, '<br />').replace(/\n|\r|\u21B5/gi, '<br />');
                        var result = String.format(cmtBlockTpl, avatar,
                            Ext.util.Format.htmlEncode(HttpCommander.Lib.Utils.parseUserName(user)), date || ' ', cmtVal);
                        // add icon for delete
                        user = user.toLowerCase().trim();
                        var cu = config.htcConfig.friendlyUserName.toLowerCase().trim();
                        if (config.htcConfig.currentPerms && config.htcConfig.currentPerms.modify &&
                            (config.htcConfig.isFullAdmin || config.htcConfig.isAllowedComments <= 1 || user == cu)) {
                            result += '<img alt="" src="'
                                + HttpCommander.Lib.Utils.getIconPath(config, 'delete')
                                + '" title="' + Ext.util.Format.htmlEncode(config.htcConfig.locData.CommandDelete)
                                + '" class="delete-comment-icon" />';
                        }
                        return result;
                    }
                }],
                bodyCssClass: 'detailed-pane-comments-row',
                viewConfig: {
                    autoFill: true,
                    forceFit: true,
                    headersDisabled: true,
                    hideSortIcons: true,
                    rowSelectorDepth: 20,
                    cellSelectorDepth: 15,
                    deferEmptyText: false,
                    emptyText: '<span style="font-size:1.1em;">' + config.htcConfig.locData.NoCommentsYetHint + '</span>'
                },
                listeners: {
                    cellclick: function (grid, rowIndex, columnIndex, e) {
                        e = e || window.event;
                        var sender = e.target || e.srcElement;
                        if (sender && sender.tagName && sender.tagName.toUpperCase() == 'IMG') {
                            if (e.preventDefault) {
                                e.preventDefault();
                            }
                            if (e.stopPropagation) {
                                e.stopPropagation();
                            }
                            if (window.event && window.event.returnValue) {
                                window.event.returnValue = false;
                            }
                            if (e.stopEvent) {
                                e.stopEvent();
                            }

                            cmt.stopEditing();
                            var store = cmt.getStore();
                            var dataBefore = getJSONMetadataArray.call(me, store);
                            var s = cmt.getSelectionModel().getSelections();
                            var cu = config.htcConfig.friendlyUserName.toLowerCase().trim();
                            for (var i = 0, r; typeof (r = s[i]) != 'undefined'; i++) {
                                var user = r.get('userlastmodified').toLowerCase().trim();
                                if (config.htcConfig.isFullAdmin || config.htcConfig.isAllowedComments <= 1 || user == cu) {
                                    store.remove(r);
                                }
                            }
                            changeAvailableFields.call(me, store);
                            saveMetadata.call(me, dataBefore);

                            return false;
                        }
                    },
                    beforeedit: function (e) {
                        var cu = config.htcConfig.friendlyUserName.toLowerCase().trim();
                        var user = e.record.get('userlastmodified').toLowerCase().trim();
                        if (!config.htcConfig.currentPerms || !config.htcConfig.currentPerms.modify ||
                            (!config.htcConfig.isFullAdmin && config.htcConfig.isAllowedComments > 1 && user != cu)) {
                            e.cancel = true;
                            e.grid.stopEditing(true);
                            return false;
                        }
                    },
                    afteredit: function (e) {
                        var store = cmt.getStore();
                        if (String(e.value).toLowerCase().trim() != String(e.originalValue).toLowerCase().trim()) {
                            e.record.set('userlastmodified', config.htcConfig.friendlyUserName);
                            e.record.set('datemodified', null);
                            //e.record.commit();
                            saveMetadata.call(me, null, e.record);
                        }
                        changeAvailableFields.call(me, store);
                    }
                },
                buttonAlign: 'left',
                buttons: [{
                    xtype: 'textarea',
                    flex: 1,
                    anchor: '100%',
                    visible: config.htcConfig.isAllowedComments > 0,
                    width: '100%',
                    height: 50,
                    style: {
                        whiteSpace: 'normal'
                    },
                    enableKeyEvents: true,
                    emptyText: String.format(config.htcConfig.locData.CommentsWriteCommentHint, config.htcConfig.locData.CommonButtonCaptionAddComment),
                    listeners: {
                        change: function (fld, newVal, oldVal) {
                            cmt.buttons[2].setDisabled(Ext.isEmpty(me.itemPath) || Ext.isEmpty(me.itemName) || Ext.isEmpty(newVal));
                        },
                        keypress: function (fld, evt) {
                            cmt.buttons[2].setDisabled(Ext.isEmpty(me.itemPath) || Ext.isEmpty(me.itemName) || Ext.isEmpty(cmt.buttons[0].getValue()));
                        },
                        specialkey: function (field, e) {
                            if (e.getKey() == e.ENTER) {
                                var btn = cmt.buttons[2];
                                btn.handler.call(btn, btn, e);
                            }
                        }
                    }
                }, '->', {
                    text: config.htcConfig.locData.CommonButtonCaptionAddComment,
                    disabled: true,
                    autoHeight: true,
                    visible: config.htcConfig.isAllowedComments > 0,
                    handler: function (btn, evt) {
                        var cmtVal = cmt.buttons[0].getValue();
                        if (Ext.isEmpty(cmtVal)) {
                            btn.setDisabled(true);
                            return;
                        }

                        var cmtStore = cmt.getStore();
                        var dataBefore = getJSONMetadataArray.call(me, cmtStore);
                        var metaDataRecord = cmtStore.recordType;
                        var mdr = new metaDataRecord({
                            title: 'Comment',
                            value: cmtVal,
                            userlastmodified: config.htcConfig.friendlyUserName,
                            datemodified: null
                        });
                        cmtStore.insert(0, mdr);

                        changeAvailableFields.call(me, cmtStore);

                        saveMetadata.call(me, dataBefore);
                    }
                }]
            })]
        }],

        // public methods
        'prepareData': prepareData
    }));
};