Ext.ns('HttpCommander.Lib');

/* config: htcConfig, debugmode */
HttpCommander.Lib.ActivityMonitor = function (config) {
    var me = this,
        mouse;

    this.config = config;
    this.killSessionTask = null;
    this.killSessionTaskReset = Ext.emptyFn;

    if (!Ext.isObject(config) || !Ext.isObject(config.htcConfig) ||
        !config.htcConfig.sessionTimeout || config.htcConfig.sessionTimeout <= 0)
        return;

    this.killSessionTask = new Ext.util.DelayedTask(function () {
        //if (me.config.debug && window.console) {
        //    window.console.log('killSessionTask');
        //}
        window.location.href = me.config.htcConfig.relativePath + "Logout.aspx";
    });

    this.killSessionTaskReset = function () {
        if (me.killSessionTask) {
            //if (me.config.debug && window.console) {
            //    window.console.log('killSessionTaskReset');
            //}
            me.killSessionTask.delay(me.config.htcConfig.sessionTimeout);
        }
    };
};
