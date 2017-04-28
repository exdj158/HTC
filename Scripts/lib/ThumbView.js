Ext.ns('HttpCommander.Lib');

/* ThumbView class (extend Ext.grid.GridView class) */
HttpCommander.Lib.ThumbView = Ext.extend(Ext.grid.GridView, {
    htcCfg: {},
    htcUid: 'httpCommander',
    maxWidthThumb: 100,
    maxHeightThumb: 100,
    //0 - Small (32), 1 - Medium (48), 2 - Big (72), 3 - Large(96)
    iconSizeSet: 1,
    styleName: 'thmbIconMedium',
    curFolder: null,
    tpl: null,
    initTemplates: function () {
        HttpCommander.Lib.ThumbView.superclass.initTemplates.call(this);
        if (!this.templatedNode) {
            this.templatedNode = new Ext.Template('<div class="thumbnailedItem x-unselectable">{content}</div>');
        }
        this.templatedNode.compile();
        var iconSize = Math.min(this.maxWidthThumb, this.maxHeightThumb);
        if (iconSize <= 70)
            this.iconSizeSet = 0;
        else if (iconSize >= 100 && iconSize < 120)
            this.iconSizeSet = 2;
        else if (iconSize >= 120)
            this.iconSizeSet = 3;
        this.styleName = 'thmbIconMedium';
        if (this.iconSizeSet == 0)
            this.styleName = 'thmbIconSmall';
        else if (this.iconSizeSet == 2)
            this.styleName = 'thmbIconBig';
        else if (this.iconSizeSet == 3)
            this.styleName = 'thmbIconLarge';
    },
    onRowSelect: function (row) {
        if (this.tpl === null) {
            this.addRowClass(row, "x-grid3-row-selected");
        } else {
            this.addRowClass(row, "x-grid3-cell-selected");
            this.addRowClass(row, "thumbnailedItemSelected");
        }
    },
    onRowDeselect: function (row) {
        if (this.tpl === null) {
            this.removeRowClass(row, "x-grid3-row-selected");
        } else {
            this.removeRowClass(row, "thumbnailedItemSelected");
            this.removeRowClass(row, "x-grid3-cell-selected");
        }
    },
    prepareData: function (data) {
        data.thumbnail = this.getThumbnail(data);
        var isRecent = (data.srowtype == 'recent');
        var isTrashed = (data.srowtype == 'trash');
        var isAlert = (data.srowtype == 'alert');
        var recOrAlrQtip = (isAlert || isRecent)
            ? String.format(" ext:qtip='{0}' ", this.htcCfg.locData[isAlert ? 'GridRowAlertHint' : 'GridRowRecentHint'])
            : '';
        if (data.rowtype == 'file') {
            var ext = HttpCommander.Lib.Utils.getFileExtension(data.name);
            var isLnkOrUrl = (ext == 'lnk' || ext == 'url');
            var isGDoc = this.htcCfg.googleDriveFileTypes && this.htcCfg.googleDriveFileTypes.indexOf(';' + ext + ';') >= 0;
            if (!isTrashed && (isAlert || isRecent || isLnkOrUrl || isGDoc)) {
                data.viewname =
                    "<span class='x-tree-node'><a " + recOrAlrQtip + "href='' class='fileNameLinkThumb' onclick='HttpCommander.Main.FileManagers"
                    + '["' + this.htcUid + '"].gridRowAction(' + data.row + ", null); return false;'>"
                    + Ext.util.Format.htmlEncode(data.name) + "</a></span>";
            } else {
                data.viewname = Ext.util.Format.htmlEncode(data.name);
            }
        } else {
            data.viewname = "<span class='x-tree-node'>" + (isTrashed ? '' : ("<a " + recOrAlrQtip + "href='' class='fileNameLinkThumb' onclick='HttpCommander.Main.FileManagers"
                + '["' + this.htcUid + '"].gridRowAction(' + data.row + ", null); return false;'>"))
                + Ext.util.Format.htmlEncode(data.name)
                + (isTrashed ? '' : "</a>") + "</span>";
        }
        return data;
    },
    getThumbnail: function (data) {
        var dateRendererLocalImpl = function (val, isUSA) {
            if (val == null)
                return null;
            var locDate;
            try {
                if (isUSA)
                    locDate = (val.getMonth() + 1) + "/" + val.getDate() + "/";
                else
                    locDate = val.getDate() + "/" + (val.getMonth() + 1) + "/";
                locDate += val.getFullYear() + " " + val.toLocaleTimeString();
            } catch (e) {
                locDate = val.toLocaleString();
            }
            return locDate;
        };
        var sizeRendererImpl = function (sz) {
            if (typeof sz == 'undefined' || sz == null || String(sz) == '')
                return '';
            var size = parseFloat(sz);
            if (isNaN(size) || !isFinite(size))
                return '';
            if (size < 1024)
                return size + " bytes";
            else if (size < 1048576)
                return (Math.round(((size * 10) / 1024)) / 10) + " KB";
            else if (size < 1073741824)
                return (Math.round(((size * 10) / 1048576)) / 10) + " MB";
            else
                return (Math.round(((size * 10) / 1073741824)) / 10) + " GB";
        };
        var isThumb = false;
        var iconsHTML = '';
        var labelHTML = '';
        var imgTag = '';
        var imgQTip = '';
        var recOrAlrQtip = '';
        var isTrashed = (data.srowtype == 'trash');
        var isRecent = (data.srowtype == 'recent');
        var isAlert = (data.srowtype == 'alert');
        var wState = (this.htcCfg.watchForModifs === true) ? data.watchForModifs : null;
        if (!isAlert && !Ext.isEmpty(data.datemodified)) {
            imgQTip += '<span style="font-weight:bold;">' + (this.htcCfg.locData[isTrashed ? 'TrashLabelDateDeleted' : 'CommonFieldLabelDateModified']).replace(/\s/gi, '&nbsp;') + '</span>:&nbsp;'
                + (dateRendererLocalImpl(data.datemodified, data.isUSA)).replace(/\s/gi, '&nbsp;');
        }
        if (!isTrashed && !Ext.isEmpty(data.datecreated)) {
            if (imgQTip.length > 0) {
                imgQTip += '<br />';
            }
            imgQTip += '<span style="font-weight:bold;">' + (this.htcCfg.locData.CommonFieldLabelDateCreated).replace(/\s/gi, '&nbsp;') + '</span>:&nbsp;'
                + (dateRendererLocalImpl(data.datecreated, data.isUSA)).replace(/\s/gi, '&nbsp;');
        }
        if (!isAlert && !isTrashed && !Ext.isEmpty(data.dateaccessed)) {
            if (imgQTip.length > 0) {
                imgQTip += '<br />';
            }
            imgQTip += '<span style="font-weight:bold;">' + (this.htcCfg.locData.CommonFieldLabelDateAccessed).replace(/\s/gi, '&nbsp;') + '</span>:&nbsp;'
                + (dateRendererLocalImpl(data.dateaccessed, data.isUSA)).replace(/\s/gi, '&nbsp;');
        }
        if (!Ext.isEmpty(data.type)) {
            if (imgQTip.length > 0) {
                imgQTip += '<br />';
            }
            imgQTip += '<span style="font-weight:bold;">' + (this.htcCfg.locData.CommonFieldLabelType).replace(/\s/gi, '&nbsp;') + '</span>:&nbsp;'
                + (Ext.util.Format.htmlEncode(data.type)).replace(/\s/gi, '&nbsp;');
        }
        if ((isRecent || isTrashed) && !Ext.isEmpty(data.qtip)) {
            if (imgQTip.length > 0) {
                imgQTip += '<br />';
            }
            imgQTip += '<span style="font-weight:bold;">' + (this.htcCfg.locData.CommonValueTypeFolder).replace(/\s/gi, '&nbsp;') + '</span>:&nbsp;'
                + data.qtip.replace(/\s/gi, '&nbsp;');
        }
        if (data.rowtype == 'file') {
            var sz = sizeRendererImpl(data.size);
            if (!Ext.isEmpty(sz)) {
                if (imgQTip.length > 0) {
                    imgQTip += '<br />';
                }
                imgQTip += '<span style="font-weight:bold;">' + (this.htcCfg.locData.CommonFieldLabelSize) + '</span>:&nbsp;'
                    + sz.replace(/\s/gi, '&nbsp;');
            }
            var ext = HttpCommander.Lib.Utils.getFileExtension(data.name);
            var fdsz = data.size || data.size_hidden, fileSZ = 0;
            if (!Ext.isEmpty(fdsz) && String(fdsz).trim().length > 0) {
                fileSZ = parseFloat(fdsz);
                if (isNaN(fileSZ) || !isFinite(fileSZ)) {
                    fileSZ = 0;
                }
            }
            if (!isRecent && !isTrashed && this.htcCfg && this.htcCfg.currentPerms
                    && this.htcCfg.currentPerms.download
                    && this.htcCfg.enableThumbnailViewImagesLoading
                    && HttpCommander.Lib.Consts.imagesFileTypes
                    && HttpCommander.Lib.Consts.imagesFileTypes.indexOf(";" + ext + ";") != -1
                    && fileSZ > 0) {
                var fileDate = '';
                var isSvg = (ext == 'svg');
                if (Ext.isDate(data.datemodified)) {
                    fileDate = 'date=' + data.datemodified.getTime() + '&';
                } else if (isSvg) {
                    fileDate = 'date=' + ((new Date()).getTime()) + '&';
                }
                var sizeQuery = 'size=' + this.maxWidthThumb + 'x' + this.maxHeightThumb + '&';
                var imgRelPath = encodeURIComponent(this.curFolder + data.name).replace(/'/gi, '%27').replace(/"/gi, '%22');
                var imgThumbUrl = this.htcCfg.relativePath + "Handlers/ThumbsGridViewHandler.ashx?"
                    + fileDate + sizeQuery + "file=" + imgRelPath;
                if (isSvg) {
                    imgThumbUrl = this.htcCfg.relativePath + "Handlers/Download.ashx?action=download&"
                        + fileDate + "file=" + imgRelPath;
                }
                imgTag = '<img align="absmiddle" '
                    + (imgQTip.length > 0 ? String.format("ext:qtip='{0}'", Ext.util.Format.htmlEncode(imgQTip)) : '')
                    + ' alt="" style="max-width:' + this.maxWidthThumb
                    + 'px !important;max-height:' + this.maxHeightThumb + 'px !important;" src="'
                    + imgThumbUrl + '" />';
                isThumb = true;
            } else {
                var isLnkOrUrl = (ext == 'lnk' || ext == 'url');
                var isGDoc = this.htcCfg.googleDriveFileTypes && this.htcCfg.googleDriveFileTypes.indexOf(';' + ext + ';') >= 0;
                if (!isTrashed && (isRecent || isLnkOrUrl || isGDoc)) {
                    recOrAlrQtip = (isAlert || isRecent)
                        ? String.format(" ext:qtip='{0}' ", this.htcCfg.locData[isAlert ? 'GridRowAlertHint' : 'GridRowRecentHint'])
                        : '';
                    imgTag += '<a ' + recOrAlrQtip + 'href="" class="fileNameLink" onclick="HttpCommander.Main.FileManagers' + "['" + this.htcUid + "'].gridRowAction(" + data.row + ', null); return false;">';
                }
                //add  class="thmbIcon" to make file ext icon larger 

                var thmbIcon = data.icon_big ? data.icon_big : data.icon_normal ? data.icon_normal : data.icon;
                if (this.iconSizeSet == 0)
                    thmbIcon = data.icon_normal ? data.icon_normal : data.icon;
                else if (this.iconSizeSet >= 2 && data.icon_large)
                    thmbIcon = data.icon_large ? data.icon_large : data.icon;
                /* else if (this.iconSizeSet == 1 && !data.icon_big && data.icon_large) {
                    thmbIcon = data.icon_large;
                    downScale = true;
                }*/

                imgTag += '<img ' + (thmbIcon.indexOf('.svg') > 0 ? 'class="' + this.styleName + '"' : '') + ' alt="" '
                    + (imgQTip.length > 0 ? String.format("ext:qtip='{0}'", Ext.util.Format.htmlEncode(imgQTip)) : '')
                    + ' align="absmiddle" src="' + this.htcCfg.relativePath + thmbIcon + '" />';
                if (!isTrashed && (isRecent || isLnkOrUrl || isGDoc)) {
                    imgTag += '</a>';
                }
            }
            if (data.isnew) {
                iconsHTML += "<img ext:qtip='" + Ext.util.Format.htmlEncode(String.format(this.htcCfg.locData.FileWasCreatedHint,
                            HttpCommander.Lib.Utils.dateDiff(
                                data.datecreated,
                                new Date(),
                                this.htcCfg.locData.DaysShort,
                                this.htcCfg.locData.HoursShort,
                                this.htcCfg.locData.MinutesShort
                            )
                        ))
                    + "' src='" + HttpCommander.Lib.Utils.getIconPath(this, 'isnew') + "' class='filetypeimage' />";
            }
            if (data.ismod) {
                iconsHTML += "<img ext:qtip='" + Ext.util.Format.htmlEncode(String.format(this.htcCfg.locData.FileWasModifiedHint,
                            HttpCommander.Lib.Utils.dateDiff(
                                data.datemodified,
                                new Date(),
                                this.htcCfg.locData.DaysShort,
                                this.htcCfg.locData.HoursShort,
                                this.htcCfg.locData.MinutesShort
                            )
                        ))
                    + "' src='" + HttpCommander.Lib.Utils.getIconPath(this, 'ismod') + "' class='filetypeimage' />";
            }
            if (this.htcCfg.enableMSOfficeEdit || this.htcCfg.enableOpenOfficeEdit || this.htcCfg.enableWebFoldersLinks) {
                if (data.locked)
                    iconsHTML += "<img ext:qtip='" + Ext.util.Format.htmlEncode(this.htcCfg.locData.IsLockedHint) + "' src='" + HttpCommander.Lib.Utils.getIconPath(this, 'lock') + "' class='filetypeimage' />";
            }
            if (this.htcCfg.enableVersionControl && data.vstate) {
                if (data.vstate & 1)
                    iconsHTML += "<img ext:qtip='" + Ext.util.Format.htmlEncode(this.htcCfg.locData.IsCheckedOutHint) + "' src='" + HttpCommander.Lib.Utils.getIconPath(this, 'checkout') + "' class='filetypeimage' />";
                if (data.vstate & 4)
                    iconsHTML += "<img style='cursor:pointer' ext:qtip='"
                        + Ext.util.Format.htmlEncode(this.htcCfg.locData.ExistsOldVersionsHint)
                        + "' src='" + HttpCommander.Lib.Utils.getIconPath(this, 'verhist') + "' class='filetypeimage'"
                        + " onclick='HttpCommander.Main.FileManagers["
                        + '"' + this.htcUid + '"' + "].versionHistory(" + data.row + ")' />";
            }
        } else {
            var imgSrc = this.htcCfg.relativePath + 'Images/48/' + (data.rowtype == 'folder'
                ? (data.isshortcut === true
                    ? 'folder-shortcut.png'
                    : 'folder.png')
                : (data.rowtype == 'rootfolder'
                    ? 'folderftp.png'
                    : (data.rowtype == 'recentroot'
                        ? 'recent.png'
                        : (data.rowtype == 'trashroot'
                            ? 'trash.png'
                            : (data.rowtype == 'sharedroot'
                                ? 'sharefolder.png'
                                : (data.rowtype == 'sharedforyouroot'
                                    ? 'sharedforyou.png'
                                    : (data.rowtype == 'alertsroot'
                                        ? 'alerts.png'
                                        : 'up.png')))))));
            var folderStyle = 'thmbIconMedium';
            if (this.htcCfg.iconSet.ext && this.htcCfg.iconSet.ext.indexOf("svg") >= 0) {
                //for svg icons we can change size dynamically
                folderStyle = this.styleName;
                imgSrc = HttpCommander.Lib.Utils.getIconPath(this, data.rowtype == 'folder'
                    ? (data.isshortcut === true
                        ? 'folder-shortcut'
                        : 'folder')
                    : (data.rowtype == 'rootfolder'
                        ? 'folderftp'
                        : (data.rowtype == 'recentroot'
                            ? 'recent'
                            : (data.rowtype == 'trashroot'
                                ? 'trash'
                                : (data.rowtype == 'sharedroot'
                                    ? 'sharefolder'
                                    : (data.rowtype == 'sharedforyouroot'
                                        ? 'sharedforyou'
                                        : (data.rowtype == 'alertsroot'
                                            ? 'alerts'
                                            : 'up')))))));
                if (HttpCommander.Lib.Utils.browserIs.ie9standard)
                    imgSrc += '?q=thumbview';
            }
            recOrAlrQtip = (isAlert || isRecent)
                ? String.format(" ext:qtip='{0}' ", this.htcCfg.locData[isAlert ? 'GridRowAlertHint' : 'GridRowRecentHint'])
                : '';
            imgTag = (isTrashed ? '' : ('<a ' + recOrAlrQtip + 'href="" class="fileNameLink" onclick="HttpCommander.Main.FileManagers' + "['" + this.htcUid + "'].gridRowAction(" + data.row + ', null); return false;">'))
                + '<img class="' + folderStyle + '" alt="" '
                + (imgQTip.length > 0 ? String.format("ext:qtip='{0}'", Ext.util.Format.htmlEncode(imgQTip)) : '')
                + ' align="absmiddle" src="' + imgSrc + '" />'
                + (isTrashed ? '' : '</a>');
            if (data.isnew) {
                iconsHTML += "<img ext:qtip='" + Ext.util.Format.htmlEncode(String.format(this.htcCfg.locData.FileWasCreatedHint,
                            HttpCommander.Lib.Utils.dateDiff(
                                data.datecreated,
                                new Date(),
                                this.htcCfg.locData.DaysShort,
                                this.htcCfg.locData.HoursShort,
                                this.htcCfg.locData.MinutesShort
                            )
                    )) + "' src='" + HttpCommander.Lib.Utils.getIconPath(this, 'isnew') + "' class='filetypeimage' />";
            }
            if (data.ismod) {
                iconsHTML += "<img ext:qtip='" + Ext.util.Format.htmlEncode(String.format(this.htcCfg.locData.FileWasModifiedHint,
                            HttpCommander.Lib.Utils.dateDiff(
                                data.datemodified,
                                new Date(),
                                this.htcCfg.locData.DaysShort,
                                this.htcCfg.locData.HoursShort,
                                this.htcCfg.locData.MinutesShort
                            )
                    )) + "' src='" + HttpCommander.Lib.Utils.getIconPath(this, 'ismod') + "' class='filetypeimage' />";
            }
        }
        if (Ext.isObject(wState)) {
            iconsHTML += "<img style='cursor:pointer' ext:qtip='"
                    + Ext.util.Format.htmlEncode(this.htcCfg.locData.WatchForModifsIconHint)
                    + "' src='" + HttpCommander.Lib.Utils.getIconPath(this, 'watch') + "' class='filetypeimage'"
                    + " onclick='HttpCommander.Main.FileManagers["
                    + '"' + this.htcUid + '"' + "].viewWatch(" + data.row + ")' />";
        }
        if (Ext.isNumber(data.comments) && data.comments > 0) {
            iconsHTML += "<span class='comment-txt icon-comment' style='background-position-y:0px !important;' ext:qtip='"
                    + Ext.util.Format.htmlEncode(String.format(this.htcCfg.locData.CommentsCountInfoTip, data.comments))
                    + "' onclick='HttpCommander.Main.FileManagers["
                    + '"' + this.htcUid + '"' + "].viewChangeDetails(" + data.row + ",true)'>"
                    + data.comments
                    + "</span>&nbsp;";
        } else if (data.isdet) {
            iconsHTML += "<img style='cursor:pointer' ext:qtip='"
                    + Ext.util.Format.htmlEncode(this.htcCfg.locData.FileContainsMetaDataHint)
                    + "' src='" + HttpCommander.Lib.Utils.getIconPath(this, 'details') + "' class='filetypeimage'"
                    + " onclick='HttpCommander.Main.FileManagers["
                    + '"' + this.htcUid + '"' + "].viewChangeDetails(" + data.row + ")' />";
        }
        if (data.publiclinks > 0) {
            iconsHTML += "<img style='cursor:pointer' ext:qtip='"
                    + Ext.util.Format.htmlEncode(this.htcCfg.locData[data.rowtype == 'file' ? 'ExistsPublicLinksFileHint' : 'ExistsPublicLinksFolderHint'])
                    + "' src='" + HttpCommander.Lib.Utils.getIconPath(this, 'sharefolder') + "' class='filetypeimage'"
                    + " onclick='HttpCommander.Main.FileManagers["
                    + '"' + this.htcUid + '"' + "].editOrViewPublicLinks(" + data.row + ")' />";
        }
        if (iconsHTML !== '') {
            /*
            if (typeof this.htcCfg != 'undefined') {
            maxHeightThumb = this.htcCfg.maxHeightThumb || maxHeightThumb;
            }
            maxHeightThumb = maxHeightThumb || 80;
            */
            iconsHTML = '<div style="position:relative;height:0px;"><div style="text-align:left;position:absolute;bottom:-' + (this.maxHeightThumb - 1) + 'px;left:1px;height:16px;float:left;">' + iconsHTML + '</div></div>';
        }
        if (!Ext.isEmpty(data.label) && !Ext.isEmpty(data.label_color)) {
            var ltip = '';
            if (!Ext.isEmpty(data.label_user) && Ext.isDefined(data.label_date)) {
                ltip = String.format(this.htcCfg.locData.LabelsLabelInfoTip,
                    data.label,
                    dateRendererLocalImpl(data.label_date, data.isUSA),
                    HttpCommander.Lib.Utils.parseUserName(data.label_user)
                );
            } else {
                ltip = data.label;
            }
            labelHTML = '<div style="position:relative;height:0px;"><div style="text-align:left;position:absolute;top:2px;left:0px;height:18px;float:left;max-width:' + this.maxWidthThumb + 'px;"><span class="file-folder-label" '
                + ' ext:qtip="'
                + Ext.util.Format.htmlEncode(Ext.util.Format.htmlEncode(ltip))
                + '" style="display:block;background-color:' + Ext.util.Format.htmlEncode(data.label_color)
                + (this.htcCfg.enabledLabels ? ";cursor:pointer" : '')
                + ';"'
                + (this.htcCfg.enabledLabels
                    ? " onclick='HttpCommander.Main.FileManagers[" + '"' + this.htcUid + '"' + "].showLabelsMenu(" + data.row + ",this);'"
                    : '')
                + '>'
                + Ext.util.Format.htmlEncode(data.label)
                + '</span></div></div>';
        }

        return labelHTML + iconsHTML + '<table border="0" cellpadding="0" cellspacing="0"><tr><td' + (isThumb ? ' class="lthumb"' : '') + '>' + imgTag + '</td></tr></table>';
    },
    doRender: function (cs, rs, ds, startRow, colCount, stripe) {
        if (window['htcConfig']) {
            this.htcCfg.currentPerms = window['htcConfig'].currentPerms;
        }
        this.curFolder = ds ? String(ds.baseParams.path).replace(/\/+$/g, '') : null;
        if (this.curFolder != null && this.curFolder.length > 0) {
            this.curFolder += '/';
        }
        if (this.tpl === null) {
            return HttpCommander.Lib.ThumbView.superclass.doRender.apply(this, arguments);
        }
        var buf = [], rp = {}, r;
        for (var j = 0, len = rs.length; j < len; j++) {
            r = rs[j];
            r.data.row = r.store.indexOf(r);
            r.data = this.prepareData(r.data);
            r.data.isUSA = r.store.isUSA;
            rp.content = this.tpl.apply(r.data);
            buf[buf.length] = this.templatedNode.apply(rp);
        }
        return buf.join("") + '<div style="clear:both"></div>';
    },
    refresh: function (headersToo) {
        this.rowSelector = this.tpl == null ? 'div.x-grid3-row' : 'div.thumbnailedItem';
        return HttpCommander.Lib.ThumbView.superclass.refresh.apply(this, arguments);
    },
    updateAllColumnWidths: function () {
        if (this.tpl === null) {
            return HttpCommander.Lib.ThumbView.superclass.updateAllColumnWidths.apply(this);
        }
        var tw = this.getTotalWidth();
        var clen = this.cm.getColumnCount();
        var ws = [];
        var i;
        for (i = 0; i < clen; i++) {
            ws[i] = this.getColumnWidth(i);
        }
        this.innerHd.firstChild.firstChild.style.width = tw;
        for (i = 0; i < clen; i++) {
            var hd = this.getHeaderCell(i);
            hd.style.width = ws[i];
        }
        this.onAllColumnWidthsUpdated(ws, tw);
    },
    updateColumnWidth: function (col, width) {
        if (this.tpl === null) {
            return HttpCommander.Lib.ThumbView.superclass.updateColumnWidth.apply(this, arguments);
        }
        var w = this.getColumnWidth(col);
        var tw = this.getTotalWidth();
        this.innerHd.firstChild.firstChild.style.width = tw;
        var hd = this.getHeaderCell(col);
        hd.style.width = w;
        this.onColumnWidthUpdated(col, w, tw);
    },
    updateColumnHidden: function (col, hidden) {
        if (this.tpl === null) {
            return HttpCommander.Lib.ThumbView.superclass.updateColumnHidden.apply(this, arguments);
        }
        var tw = this.getTotalWidth();
        this.innerHd.firstChild.firstChild.style.width = tw;
        var display = hidden ? 'none' : '';
        var hd = this.getHeaderCell(col);
        hd.style.display = display;
        this.onColumnHiddenUpdated(col, hidden, tw);
        delete this.lastViewWidth;
        this.layout();
    }
});