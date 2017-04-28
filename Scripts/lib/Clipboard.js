Ext.ns('HttpCommander.Lib');

HttpCommander.Lib.Clipboard = function () {
    this.enabled = false;

    /*
    optional fields:

    path,
    newPath,
    control,
    isCut,
    srcPath,

    files,
    folders,
    filesCount,
    foldersCount,

    zipname,
    password
    */
}

Ext.apply(HttpCommander.Lib.Clipboard.prototype, {
    setBadgeText: function (cmp, text, force) {
        if (!cmp) {
            return;
        }

        var me = cmp,
            oldBadgeText = me.badgeText,
            el = me.el,
            dom = el && el.dom;

        if (el && dom) {
            if (force || oldBadgeText !== text) {
                el.addClass('x-badge');

                me.badgeText = text;

                el.set({'data-hc-badge': me.badgeText || ''});

                if (Ext.isEmpty(me.badgeText)) {
                    el.addClass('hide-badge');
                } else {
                    el.removeClass('hide-badge');
                }
            }
        }
    },

    updateBadge: function () {
        var me = this,
            count = 0,
            bb = Ext.query('.x-badge-container');
        if (Ext.isArray(bb) && bb.length > 0) {
            if (me.enabled) {
                count = (Ext.isNumber(this.filesCount) ? this.filesCount : 0)
                    + (Ext.isNumber(this.foldersCount) ? this.foldersCount : 0);
            }
            count = count > 0 ? ('' + count) : '';
            Ext.each(bb, function (btn) {
                var btnCmp = Ext.getCmp(btn.id);
                me.setBadgeText(btnCmp, count, true);
            });
        }
    },

    clear: function(withoutUpdateBadge) {
        for (var name in this) {
            if (this.hasOwnProperty(name))
                delete this[name];
        }
        this.enabled = false;
        if (!(withoutUpdateBadge === true)) {
            this.updateBadge();
        }
    },

    /* o contains the following fields:
    path,
    files,
    folders,
    filesCount,
    foldersCount, 
    */
    setItems: function(o) {
        this.clear(true);
        this.enabled = true;
        this.path = o.path;
        this.files = o.files;
        this.folders = o.folders;
        this.filesCount = o.filesCount;
        this.foldersCount = o.foldersCount;
        this.updateBadge();
    }
});