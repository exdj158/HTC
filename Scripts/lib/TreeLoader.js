Ext.ns('HttpCommander.Lib');

// config: htcConfig, Msg, globalLoadMask, getGrid(), getRootName()
HttpCommander.Lib.TreeLoader = function (config) {
    var mask = function () {
        return Ext.isFunction(config.globalLoadMask)
            ? config.globalLoadMask() : config.globalLoadMask
    };
    var self = new Ext.tree.TreeLoader({
        directFn: HttpCommander.Tree.Load,
        baseParams: {
            path: config.getRootName(),
            fAllow: null, fIgnore: null, fARegexp: null, fIRegexp: null,
            onlyFolders: (config.onlyFolders === true)
        },
        paramOrder: ['path', 'fAllow', 'fIgnore', 'fARegexp', 'fIRegexp', 'onlyFolders'],
        firstTreeLoad: true,
        preloadChildren: true,
        listeners: {
            beforeload: function(treeLoader, node) {
                if (treeLoader.firstTreeLoad) {
                    treeLoader.prevAjaxTimeout = Ext.Ajax.timeout;
                    Ext.Ajax.timeout = HttpCommander.Lib.Consts.ajaxRequestTimeout;
                    mask().show();
                }
                if (Ext.isEmpty(node.attributes.path) && node.parentNode) {
                    if (!Ext.isEmpty(node.attributes.error)) {
                        config.Msg.show({
                            title: config.htcConfig.locData.CommonErrorCaption,
                            msg: node.attributes.error,
                            icon: config.Msg.ERROR,
                            buttons: config.Msg.CANCEL
                        });
                    }
                    return false;
                }
                this.baseParams.path = !Ext.isEmpty(node.attributes.path)
                    ? node.attributes.path : config.getRootName();
                this.baseParams.fAllow = null;
                this.baseParams.fIgnore = null;
                this.baseParams.fARegexp = null;
                this.baseParams.fIRegexp = null;
                if (this.baseParams.path.toLowerCase() == config.getRootName().toLowerCase()) {
                    var filter = HttpCommander.Lib.Utils.getFolderFilter();
                    if (filter.folderFilterAllow)
                        this.baseParams.fAllow = filter.folderFilterAllow;
                    if (filter.folderFilterIgnore)
                        this.baseParams.fIgnore = filter.folderFilterIgnore;
                    if (filter.folderFilterAllowRegexp)
                        this.baseParams.fARegexp = filter.folderFilterAllowRegexp;
                    if (filter.folderFilterIgnoreRegexp)
                        this.baseParams.fIRegexp = filter.folderFilterIgnoreRegexp;
                }
            },
            load: function(treeLoader, node, response) {
                if (treeLoader.firstTreeLoad) {
                    treeLoader.firstTreeLoad = false;
                    if (treeLoader.prevAjaxTimeout) {
                        Ext.Ajax.timeout = treeLoader.prevAjaxTimeout;
                    }
                    mask().hide();
                }
                if (!!response && !!response.responseData && response.responseData.length == 1 && !!response.responseData[0].error) {
                    config.Msg.show({
                        title: config.htcConfig.locData.CommonErrorCaption,
                        msg: response.responseData[0].neem === true
                            ? String.format(response.responseData[0].error, config.htcConfig.relativePath || '')
                            : HttpCommander.Lib.Utils.checkBracketsAndHtmlEncode(response.responseData[0].error),
                        icon: config.Msg.ERROR,
                        buttons: config.Msg.CANCEL
                    });
                    while (node.firstChild && (Ext.isEmpty(node.firstChild.attributes) || Ext.isEmpty(node.firstChild.attributes.path))) {
                        node.removeChild(node.firstChild);
                    }
                }
            },
            loadexception: function(treeLoader, node, response) {
                if (treeLoader.firstTreeLoad) {
                    treeLoader.firstTreeLoad = false;
                    if (treeLoader.prevAjaxTimeout) {
                        Ext.Ajax.timeout = treeLoader.prevAjaxTimeout;
                    }
                    mask().hide();
                }
                config.Msg.show({
                    title: config.htcConfig.locData.CommonErrorCaption,
                    msg: config.htcConfig.locData.CommonLoadError,
                    icon: config.Msg.ERROR,
                    buttons: config.Msg.CANCEL
                });
            }
        }
    });
    return self;
};