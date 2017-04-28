Ext.ns('HttpCommander.Lib');

/* config: getHtcConfig(), getUid(), getCurrentFolder(), labelsIsHided()
*/
HttpCommander.Lib.DataRenderers = function (config) {
    var iconTmpl = "&#8205;<img ext:qtip='{0}' src='{1}' class='filetypeimage' />",
        iconTmplWithPointer = "&#8205;<img style='cursor:pointer;' ext:qtip='{0}' src='{1}' class='filetypeimage'"
            + " onclick='HttpCommander.Main.FileManagers["
                + '"' + config.getUid() + '"' + "].{2}({3})' />";
    var iconComments = "&#8205;<span class='comment-txt icon-comment' ext:qtip='{0}'"
            + " onclick='HttpCommander.Main.FileManagers["
                + '"' + config.getUid() + '"' + "].{1}({2},true)'>{3}</span>&nbsp;";
    var dateRendererLocalImpl = function (val, cell, rec, row, col, store) {
        if (val == null)
            return null;
        var locDate;
        try {
            if (!!store && store.isUSA)
                locDate = (val.getMonth() + 1) + "/" + val.getDate() + "/";
            else
                locDate = val.getDate() + "/" + (val.getMonth() + 1) + "/";
            locDate += val.getFullYear() + " " + val.toLocaleTimeString();
        } catch (e) {
            locDate = val.toLocaleString();
        }
        return locDate;
    };
    var sizeRendererImpl0 = function (sz, negEmpty) {
        if (typeof sz == 'undefined' || sz == null || String(sz) == '')
            return '';
        var size = parseFloat(sz);
        if (isNaN(size) || !isFinite(size))
            return '';
        if (negEmpty && size < 0)
            return '';
        else if (size < 1024)
            return size + " bytes";
        else if (size < 1048576)
            return (Math.round(((size * 10) / 1024)) / 10) + " KB";
        else if (size < 1073741824)
            return (Math.round(((size * 10) / 1048576)) / 10) + " MB";
        else
            return (Math.round(((size * 10) / 1073741824)) / 10) + " GB";
    };
    var sizeRendererImpl = function (sz) {
        return sizeRendererImpl0(sz, false);
    };
    var labelItemRendererImpl = function (row, store, rowIndex) {
        if (!Ext.isObject(row)) {
            return '';
        }
        var isGridRow = Ext.isNumber(rowIndex) && Ext.isObject(row.data);
        var rowData = isGridRow ? row.data : row;
        if (!Ext.isObject(rowData) || Ext.isEmpty(rowData.label) || Ext.isEmpty(rowData.label_color)) {
            return '';
        }
        var hcfg = config.getHtcConfig();
        var tip = '';
        if (!Ext.isEmpty(rowData.label_user) && Ext.isDefined(rowData.label_date)) {
            tip = String.format(hcfg.locData.LabelsLabelInfoTip,
                rowData.label,
                dateRendererLocalImpl(isGridRow ? row.get('label_date') : (Ext.isDate(rowData.label_date) ? rowData.label_date : new Date(rowData.label_date * 1000)), null, row, null, null, store),
                HttpCommander.Lib.Utils.parseUserName(rowData.label_user)
            );
        } else {
            tip = rowData.label;
        }
        return '&#8205;<span class="file-folder-label" ext:qtip="'
            + Ext.util.Format.htmlEncode(Ext.util.Format.htmlEncode(tip))
            + '" style="background-color:'
            + Ext.util.Format.htmlEncode(rowData.label_color)
            + (hcfg.enabledLabels && isGridRow ? ";cursor:pointer" : ';cursor:default')
            + ';"'
            + (hcfg.enabledLabels && isGridRow
                ? " onclick='HttpCommander.Main.FileManagers[" + '"' + config.getUid() + '"' + "].showLabelsMenu(" + rowIndex + ",this);'"
                : '')
            + '>'
            + Ext.util.Format.htmlEncode(rowData.label) + '</span>';
    };
    return {
        dateRendererWithQTip: function (val, cell, rec, row, col, store) {
            if (val == null)
                return null;
            //cell.attr = '';
            var fval;
            try {
                if (!!store && !!store.reader && !!store.reader.jsonData && store.reader.jsonData.isUSA)
                    fval = (val.getMonth() + 1) + "/" + val.getDate() + "/";
                else
                    fval = val.getDate() + "/" + (val.getMonth() + 1) + "/";
                fval += val.getFullYear() + " " + val.toLocaleTimeString();
            } catch (e) {
                fval = val.toLocaleString();
            }
            /*
            if (fval != '')
            cell.attr = 'ext:qtip="' + Ext.util.Format.htmlEncode(fval) + '" ext:qchilds="true"';
            */
            return fval;
        },
        sizeRenderer: sizeRendererImpl,
        sizeNegRenderer: function (sz) {
            return sizeRendererImpl0(sz, true);
        },
        namePublicRenderer: function (value, metaData, r, rowIndex, colIndex, store) {
            var result = '';
            var url = r.data.url2;
            if (Ext.isEmpty(url) || url.trim().length == 0) {
                url = r.data.url;
            }
            var qtip = String.format(" ext:qtip='{0}' ", Ext.util.Format.htmlEncode(config.getHtcConfig().locData.GridRowPublicHint));
            var hasUrl = (!Ext.isEmpty(url) && url.trim().length > 0);
            if (r.data.rowtype == 'uplink') {
                result += "<span class='x-tree-node'><a href='' class='fileNameLink' onclick='HttpCommander.Main.FileManagers"
                    + '["' + config.getUid() + '"].shared' + (store.sharedForYou ? 'FY' : '') + 'GridRowAction(' + rowIndex + ", null); return false;'>"
                    + "<img src='" + config.getHtcConfig().relativePath + r.data.icon + "' class='filetypeimage' />"
                    + Ext.util.Format.htmlEncode(value)
                    + "</a></span>";
            } else if (store.sharedForYou && !hasUrl) {
                result += "<span class='x-tree-node' style='white-space: normal;'><img src='"
                    + config.getHtcConfig().relativePath + r.data.icon + "' class='filetypeimage' />"
                    + '<a ' + qtip + 'class="fileNameLink" href="' + config.getHtcConfig().relativePath
                        + 'Handlers/Viewer.aspx?path=' + Ext.util.Format.htmlEncode(encodeURIComponent(value))
                            + '&key=' + encodeURIComponent(r.data.key || '')
                            + '&svc=sharedforyou" target="_blank">'
                    + Ext.util.Format.htmlEncode(value)
                    + "</a></span>";
            } else {
                result += "<span class='x-tree-node' style='white-space: normal;'><img src='"
                    + config.getHtcConfig().relativePath + r.data.icon + "' class='filetypeimage' />"
                    + (hasUrl ? ('<a ' + qtip + 'class="fileNameLink" href="' + Ext.util.Format.htmlEncode(url) + '" target="_blank">') : '')
                    + Ext.util.Format.htmlEncode(value)
                    + (hasUrl ? '</a>' : '')
                    + "</span>";
            }
            return result;
        },
        nameRenderer: function (value, metaData, r, rowIndex, colIndex, store) {
            var result = '';
            var imgQTip = '';
            var isRecent = (r.data.srowtype == 'recent');
            var isTrashed = (r.data.srowtype == 'trash');
            var isAlert = (r.data.srowtype == 'alert');
            var recOrAlrQtip = '';
            var wState = (config.getHtcConfig().watchForModifs === true) ? r.data.watchForModifs : null;
            if (!isAlert && !Ext.isEmpty(r.data.datemodified)) {
                imgQTip += '<span style="font-weight:bold;">' + (config.getHtcConfig().locData[isTrashed ? 'TrashLabelDateDeleted' : 'CommonFieldLabelDateModified']).replace(/\s/gi, '&nbsp;') + '</span>:&nbsp;'
                    + (dateRendererLocalImpl(r.data.datemodified, metaData, r, rowIndex, colIndex, store)).replace(/\s/gi, '&nbsp;');
            }
            if (!isTrashed && !Ext.isEmpty(r.data.datecreated)) {
                if (imgQTip.length > 0) {
                    imgQTip += '<br />';
                }
                imgQTip += '<span style="font-weight:bold;">' + (config.getHtcConfig().locData.CommonFieldLabelDateCreated).replace(/\s/gi, '&nbsp;') + '</span>:&nbsp;'
                    + (dateRendererLocalImpl(r.data.datecreated, metaData, r, rowIndex, colIndex, store)).replace(/\s/gi, '&nbsp;');
            }
            if (!isAlert && !isTrashed && !Ext.isEmpty(r.data.dateaccessed)) {
                if (imgQTip.length > 0) {
                    imgQTip += '<br />';
                }
                imgQTip += '<span style="font-weight:bold;">' + (config.getHtcConfig().locData.CommonFieldLabelDateAccessed).replace(/\s/gi, '&nbsp;') + '</span>:&nbsp;'
                    + (dateRendererLocalImpl(r.data.dateaccessed, metaData, r, rowIndex, colIndex, store)).replace(/\s/gi, '&nbsp;');
            }
            if (!Ext.isEmpty(r.data.type)) {
                if (imgQTip.length > 0) {
                    imgQTip += '<br />';
                }
                imgQTip += '<span style="font-weight:bold;">' + (config.getHtcConfig().locData.CommonFieldLabelType).replace(/\s/gi, '&nbsp;') + '</span>:&nbsp;'
                    + (Ext.util.Format.htmlEncode(r.data.type)).replace(/\s/gi, '&nbsp;');
            }
            if ((isRecent || isTrashed) && !Ext.isEmpty(r.data.qtip)) {
                if (imgQTip.length > 0) {
                    imgQTip += '<br />';
                }
                imgQTip += '<span style="font-weight:bold;">' + (config.getHtcConfig().locData.CommonValueTypeFolder).replace(/\s/gi, '&nbsp;') + '</span>:&nbsp;'
                    + r.data.qtip.replace(/\s/gi, '&nbsp;');
            }
            if (r.data.rowtype == 'file') {
                var sz = sizeRendererImpl(r.data.size);
                if (!Ext.isEmpty(sz)) {
                    if (imgQTip.length > 0) {
                        imgQTip += '<br />';
                    }
                    imgQTip += '<span style="font-weight:bold;">' + (config.getHtcConfig().locData.CommonFieldLabelSize) + '</span>:&nbsp;'
                        + sz.replace(/\s/gi, '&nbsp;');
                }
                //var qtip = '>';
                var ext = HttpCommander.Lib.Utils.getFileExtension(r.data.name);
                var isLnkOrUrl = (ext == 'lnk' || ext == 'url');
                var isGDoc = config.getHtcConfig().googleDriveFileTypes && config.getHtcConfig().googleDriveFileTypes.indexOf(';' + ext + ';') >= 0;
                if (!isTrashed && (isAlert || isRecent || isLnkOrUrl || isGDoc)) {
                    recOrAlrQtip = (isAlert || isRecent)
                        ? String.format(" ext:qtip='{0}' ", config.getHtcConfig().locData[isAlert ? 'GridRowAlertHint' : 'GridRowRecentHint'])
                        : '';
                    result += "<span class='x-tree-node'><a " + recOrAlrQtip + "href='' class='fileNameLink' onclick='HttpCommander.Main.FileManagers" + '["' + config.getUid() + '"].gridRowAction(' + rowIndex + ", null); return false;'>";
                }
                result += "<img src='" + config.getHtcConfig().relativePath + r.data.icon + "' class='filetypeimage' "
                    + (imgQTip.length > 0 ? String.format("ext:qtip='{0}'", Ext.util.Format.htmlEncode(imgQTip)) : '')
                    + " />";
                var fdsz = r.data.size || r.data.size_hidden, fileSZ = 0;
                if (!Ext.isEmpty(fdsz) && String(fdsz).trim().length > 0) {
                    fileSZ = parseFloat(fdsz);
                    if (isNaN(fileSZ) || !isFinite(fileSZ)) {
                        fileSZ = 0;
                    }
                }
                var fileExt = HttpCommander.Lib.Utils.getFileExtension(r.data.name);
                if (!isRecent && !isTrashed && config.getHtcConfig().currentPerms
                    && config.getHtcConfig().currentPerms.download
                    && config.getHtcConfig().showImagesThumbnail
                    && HttpCommander.Lib.Consts.imagesFileTypes.indexOf(";" + fileExt + ";") != -1
                    && fileSZ > 0) {
                    var fileDate = '';
                    var isSvg = (fileExt == 'svg');
                    if (Ext.isDate(r.data.datemodified)) {
                        fileDate = 'date=' + r.data.datemodified.getTime() + '&';
                    } else if (isSvg) {
                        fileDate = 'date=' + ((new Date()).getTime()) + '&';
                    }
                    result += '<span ext:qclass="x-thumbnail" ext:qtip="' + Ext.util.Format.htmlEncode("<span class='img-shadow'><img align='absmiddle' class='filetypeimage' alt='' src='"
                        + config.getHtcConfig().relativePath
                        + (isSvg ? "Handlers/Download.ashx?action=download&" : "Handlers/ThumbnailHandler.ashx?")
                        + fileDate
                        + "file=" + encodeURIComponent(config.getCurrentFolder() + "/" + r.data.name).replace(/'/gi, '%27').replace(/"/gi, '%22')
                        + "' "
                        + (isSvg ? ('style="max-width:160px !important;max-height:120px !important;" ') : '')
                        + "/></span>") + '" >' + Ext.util.Format.htmlEncode(value) + "</span>";
                } else {
                    result += Ext.util.Format.htmlEncode(value);
                }
                if (!isTrashed && (isAlert || isRecent || isLnkOrUrl || isGDoc)) {
                    result += "</a></span>";
                }
                if (config.labelsIsHided()) {
                    result += '&nbsp;';
                    if (r.data.isnew) {
                        result += String.format(
                            iconTmpl,
                            Ext.util.Format.htmlEncode(
                                String.format(config.getHtcConfig().locData.FileWasCreatedHint,
                                    HttpCommander.Lib.Utils.dateDiff(
                                        r.data.datecreated,
                                        new Date(),
                                        config.getHtcConfig().locData.DaysShort,
                                        config.getHtcConfig().locData.HoursShort,
                                        config.getHtcConfig().locData.MinutesShort
                                    )
                                )
                            ),
                            HttpCommander.Lib.Utils.getIconPath(config, 'isnew')
                        );
                    }
                    if (r.data.ismod) {
                        result += String.format(
                            iconTmpl,
                            Ext.util.Format.htmlEncode(
                                String.format(config.getHtcConfig().locData.FileWasModifiedHint,
                                    HttpCommander.Lib.Utils.dateDiff(
                                        r.data.datemodified,
                                        new Date(),
                                        config.getHtcConfig().locData.DaysShort,
                                        config.getHtcConfig().locData.HoursShort,
                                        config.getHtcConfig().locData.MinutesShort
                                    )
                                )
                            ),
                            HttpCommander.Lib.Utils.getIconPath(config, 'ismod')
                        );
                    }
                    if (Ext.isObject(wState)) {
                        result += String.format(
                            iconTmplWithPointer,
                            Ext.util.Format.htmlEncode(config.getHtcConfig().locData.WatchForModifsIconHint),
                            HttpCommander.Lib.Utils.getIconPath(config, 'watch'),
                            'viewWatch',
                            rowIndex
                        );
                    }
                    if (Ext.isNumber(r.data.comments) && r.data.comments > 0) {
                        result += String.format(
                            iconComments,
                            Ext.util.Format.htmlEncode(String.format(config.getHtcConfig().locData.CommentsCountInfoTip, r.data.comments)),
                            'viewChangeDetails',
                            rowIndex,
                            r.data.comments
                        );
                    } else if (r.data.isdet) {
                        result += String.format(
                            iconTmplWithPointer,
                            Ext.util.Format.htmlEncode(config.getHtcConfig().locData.FileContainsMetaDataHint),
                            HttpCommander.Lib.Utils.getIconPath(config, 'details'),
                            'viewChangeDetails',
                            rowIndex
                        );
                    }
                    if ((config.getHtcConfig().enableMSOfficeEdit
                        || config.getHtcConfig().enableOpenOfficeEdit
                        || config.getHtcConfig().enableWebFoldersLinks
                        ) && r.data.locked) {
                        result += String.format(
                            iconTmpl,
                            Ext.util.Format.htmlEncode(config.getHtcConfig().locData.IsLockedHint),
                           HttpCommander.Lib.Utils.getIconPath(config, 'lock')
                        );
                    }
                    if (config.getHtcConfig().enableVersionControl && r.data.vstate) {
                        if (r.data.vstate & 1) {
                            result += String.format(
                                iconTmpl,
                                Ext.util.Format.htmlEncode(config.getHtcConfig().locData.IsCheckedOutHint),
                                HttpCommander.Lib.Utils.getIconPath(config, 'checkout')
                            );
                        }
                        if (r.data.vstate & 4) {
                            result += String.format(
                                iconTmplWithPointer,
                                Ext.util.Format.htmlEncode(config.getHtcConfig().locData.ExistsOldVersionsHint),
                                HttpCommander.Lib.Utils.getIconPath(config, 'verhist'),
                                'versionHistory',
                                rowIndex
                            );
                        }
                    }
                    try {
                        if (r.data.publiclinks > 0) {
                            result += String.format(
                                iconTmplWithPointer,
                                Ext.util.Format.htmlEncode(config.getHtcConfig().locData.ExistsPublicLinksFileHint),
                                HttpCommander.Lib.Utils.getIconPath(config, 'sharefolder'),
                                'editOrViewPublicLinks',
                                rowIndex
                            );
                        }
                    } catch (err) {
                        // ignore
                    }
                    // labels
                    result += labelItemRendererImpl(r, store, rowIndex);
                }
                return "<span>"/* + qtip*/ + result + "</span>";
            } else {
                recOrAlrQtip = (isAlert || isRecent)
                    ? String.format(" ext:qtip='{0}' ", config.getHtcConfig().locData[isAlert ? 'GridRowAlertHint' : 'GridRowRecentHint'])
                    : '';
                result = "<span class='x-tree-node'>" + (isTrashed ? '' : ("<a " + recOrAlrQtip + "href='' class='fileNameLink fakeFolderNameForDnD' onclick='HttpCommander.Main.FileManagers"
                    + '["' + config.getUid() + '"].gridRowAction(' + rowIndex + ", null); return false;'>"))
                    + "<img src='" + config.getHtcConfig().relativePath + r.data.icon + "' class='filetypeimage' "
                    + (imgQTip.length > 0 ? String.format("ext:qtip='{0}'", Ext.util.Format.htmlEncode(imgQTip)) : '') + " />"
                    + Ext.util.Format.htmlEncode(value)
                    + (isTrashed ? '' : "</a>") + "</span>";
                if (config.labelsIsHided()) {
                    result += '&nbsp;';
                    if (r.data.isnew) {
                        result += String.format(
                            iconTmpl,
                            Ext.util.Format.htmlEncode(
                                String.format(config.getHtcConfig().locData.FileWasCreatedHint,
                                    HttpCommander.Lib.Utils.dateDiff(
                                        r.data.datecreated,
                                        new Date(),
                                        config.getHtcConfig().locData.DaysShort,
                                        config.getHtcConfig().locData.HoursShort,
                                        config.getHtcConfig().locData.MinutesShort
                                    )
                                )
                            ),
                           HttpCommander.Lib.Utils.getIconPath(config, 'isnew')
                        );
                    }
                    if (r.data.ismod) {
                        result += String.format(
                            iconTmpl,
                            Ext.util.Format.htmlEncode(
                                String.format(config.getHtcConfig().locData.FileWasModifiedHint,
                                    HttpCommander.Lib.Utils.dateDiff(
                                        r.data.datemodified,
                                        new Date(),
                                        config.getHtcConfig().locData.DaysShort,
                                        config.getHtcConfig().locData.HoursShort,
                                        config.getHtcConfig().locData.MinutesShort
                                    )
                                )
                            ),
                            HttpCommander.Lib.Utils.getIconPath(config, 'ismod')
                        );
                    }
                    if (Ext.isObject(wState)) {
                        result += String.format(
                            iconTmplWithPointer,
                            Ext.util.Format.htmlEncode(config.getHtcConfig().locData.WatchForModifsIconHint),
                            HttpCommander.Lib.Utils.getIconPath(config, 'watch'),
                            'viewWatch',
                            rowIndex
                        );
                    }
                    if (Ext.isNumber(r.data.comments) && r.data.comments > 0) {
                        result += String.format(
                            iconComments,
                            Ext.util.Format.htmlEncode(String.format(config.getHtcConfig().locData.CommentsCountInfoTip, r.data.comments)),
                            'viewChangeDetails',
                            rowIndex,
                            r.data.comments
                        );
                    } else if (r.data.isdet) {
                        result += String.format(
                            iconTmplWithPointer,
                            Ext.util.Format.htmlEncode(config.getHtcConfig().locData.FileContainsMetaDataHint),
                            HttpCommander.Lib.Utils.getIconPath(config, 'details'),
                            'viewChangeDetails',
                            rowIndex
                        );
                    }
                    try {
                        if (r.data.publiclinks > 0) {
                            result += String.format(
                                iconTmplWithPointer,
                                Ext.util.Format.htmlEncode(config.getHtcConfig().locData.ExistsPublicLinksFolderHint),
                                HttpCommander.Lib.Utils.getIconPath(config, 'sharefolder'),
                                'editOrViewPublicLinks',
                                rowIndex
                            );
                        }
                    } catch (err) {
                        // ignore
                    }
                    // labels
                    result += labelItemRendererImpl(r, store, rowIndex);
                }
                return result;
            }
        },
        labelRenderer: function (value, metaData, r, rowIndex, colIndex, store) {
            var result = '';
            var wState = (config.getHtcConfig().watchForModifs === true) ? r.data.watchForModifs : null;
            if (r.data.isnew) {
                result += String.format(
                    iconTmpl,
                    Ext.util.Format.htmlEncode(
                        String.format(config.getHtcConfig().locData.FileWasCreatedHint,
                            HttpCommander.Lib.Utils.dateDiff(
                                r.data.datecreated,
                                new Date(),
                                config.getHtcConfig().locData.DaysShort,
                                config.getHtcConfig().locData.HoursShort,
                                config.getHtcConfig().locData.MinutesShort
                            )
                        )
                    ),
                    HttpCommander.Lib.Utils.getIconPath(config, 'isnew')
                );
            }
            if (r.data.ismod) {
                result += String.format(
                    iconTmpl,
                    Ext.util.Format.htmlEncode(
                        String.format(config.getHtcConfig().locData.FileWasModifiedHint,
                            HttpCommander.Lib.Utils.dateDiff(
                                r.data.datemodified,
                                new Date(),
                                config.getHtcConfig().locData.DaysShort,
                                config.getHtcConfig().locData.HoursShort,
                                config.getHtcConfig().locData.MinutesShort
                            )
                        )
                    ),
                    HttpCommander.Lib.Utils.getIconPath(config, 'ismod')
                );
            }
            if (Ext.isObject(wState)) {
                result += String.format(
                    iconTmplWithPointer,
                    Ext.util.Format.htmlEncode(config.getHtcConfig().locData.WatchForModifsIconHint),
                    HttpCommander.Lib.Utils.getIconPath(config, 'watch'),
                    'viewWatch',
                    rowIndex
                );
            }
            if (Ext.isNumber(r.data.comments) && r.data.comments > 0) {
                result += String.format(
                    iconComments,
                    Ext.util.Format.htmlEncode(String.format(config.getHtcConfig().locData.CommentsCountInfoTip, r.data.comments)),
                    'viewChangeDetails',
                    rowIndex,
                    r.data.comments
                );
            } else if (r.data.isdet) {
                result += String.format(
                    iconTmplWithPointer,
                    Ext.util.Format.htmlEncode(config.getHtcConfig().locData.FileContainsMetaDataHint),
                    HttpCommander.Lib.Utils.getIconPath(config, 'details'),
                    'viewChangeDetails',
                    rowIndex
                );
            }
            if (r.data.rowtype == 'file') {
                if ((config.getHtcConfig().enableMSOfficeEdit
                    || config.getHtcConfig().enableOpenOfficeEdit
                    || config.getHtcConfig().enableWebFoldersLinks
                    ) && r.data.locked) {
                    result += String.format(
                        iconTmpl,
                        Ext.util.Format.htmlEncode(config.getHtcConfig().locData.IsLockedHint),
                       HttpCommander.Lib.Utils.getIconPath(config, 'lock')
                    );
                }
                if (config.getHtcConfig().enableVersionControl && r.data.vstate) {
                    if (r.data.vstate & 1) {
                        result += String.format(
                            iconTmpl,
                            Ext.util.Format.htmlEncode(config.getHtcConfig().locData.IsCheckedOutHint),
                            HttpCommander.Lib.Utils.getIconPath(config, 'checkout')
                        );
                    }
                    if (r.data.vstate & 4) {
                        result += String.format(
                            iconTmplWithPointer,
                            Ext.util.Format.htmlEncode(config.getHtcConfig().locData.ExistsOldVersionsHint),
                            HttpCommander.Lib.Utils.getIconPath(config, 'verhist'),
                            'versionHistory',
                            rowIndex
                        );
                    }
                }
            }
            try {
                if (r.data.publiclinks > 0) {
                    result += String.format(
                        iconTmplWithPointer,
                        Ext.util.Format.htmlEncode(config.getHtcConfig().locData.ExistsPublicLinksFileHint),
                        HttpCommander.Lib.Utils.getIconPath(config, 'sharefolder'),
                        'editOrViewPublicLinks',
                        rowIndex
                    );
                }
            } catch (err) {
                // ignore
            }
            if (!Ext.isEmpty(r.data.label) && !Ext.isEmpty(r.data.label_color)) {
                var tip = '';
                if (!Ext.isEmpty(r.data.label_user) && Ext.isDefined(r.data.label_date)) {
                    tip = String.format(config.getHtcConfig().locData.LabelsLabelInfoTip,
                        r.data.label,
                        dateRendererLocalImpl(r.get('label_date'), metaData, r, rowIndex, colIndex, store),
                        HttpCommander.Lib.Utils.parseUserName(r.data.label_user)
                    );
                } else {
                    tip = r.data.label;
                }
                result += '&#8205;<span class="file-folder-label" ext:qtip="'
                    + Ext.util.Format.htmlEncode(Ext.util.Format.htmlEncode(tip))
                    + '" style="background-color:'
                    + Ext.util.Format.htmlEncode(r.data.label_color)
                    + (htcConfig.enabledLabels ? ";cursor:pointer" : '')
                    + ';"'
                    + (htcConfig.enabledLabels
                        ? " onclick='HttpCommander.Main.FileManagers[" + '"' + config.getUid() + '"' + "].showLabelsMenu(" + rowIndex + ",this);'"
                        : '')
                    + '>'
                    + Ext.util.Format.htmlEncode(r.data.label) + '</span>';
            }
            return result;
        },
        qtipCellRenderer: function (val, cell, rec) {
            cell.attr = '';
            if (val && val != '')
                cell.attr = 'ext:qtip="' + Ext.util.Format.htmlEncode(
                        Ext.util.Format.htmlEncode(val)).replace(/\r\n|\n\r/gi, '<br />').replace(/\n|\r|\u21B5/gi, '<br />')
                    + '" ext:qchilds="true"';
            return Ext.util.Format.htmlEncode(val || '');
        },
        htmlEncodedRenderer: function (value, metaData, record, rowIndex, colIndex, store) {
            return Ext.util.Format.htmlEncode(value || '');
        },
        searchNameRenderer: function (value, metaData, r, rowIndex, colIndex, store) {
            return "<img src='" + config.getHtcConfig().relativePath + r.data.icon
                + "' class='filetypeimage'> <span class='x-tree-node'><a href='' class='fileNameLink'"
                + " onclick='HttpCommander.Main.FileManagers" + '["' + config.getUid() + '"].searchGridRowAction(null, ' + rowIndex + ", null); return false;'>"
                + Ext.util.Format.htmlEncode(value) + "</a></span>";
        },
        wordWrapRenderer: function (val, cell, rec) { // word-wrap renderer for grid cell
            return String.format(
                "<span style='white-space: normal;'>{0}</span>",
                Ext.util.Format.htmlEncode(val || '')
            );
        },
        wordWrapRendererWithoutEncoding: function (val, cell, rec) { // word-wrap renderer for cell with error in d'n'd uploader grid
            return String.format("<span style='white-space: normal;'>{0}</span>", val || '');
        },
        dateRendererLocal: dateRendererLocalImpl,
        booleanRenderer: function (val, cell, rec, row, col, store) {
            cell.css += ' x-grid3-check-col-td';
            if (rec.get('rowtype') == 'uplink') {
                return '&nbsp;';
            }
            return String.format('<div class="x-grid3-check-col{0}">&#160;</div>', val ? '-on' : '');
        },
        labelItemRenderer: labelItemRendererImpl
    };
};