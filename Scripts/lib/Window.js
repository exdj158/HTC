Ext.ns('HttpCommander.Lib');

HttpCommander.Lib.Window = function(containerEl) {
    return Ext.Window.extend({
        renderTo: containerEl,
        constrain: true,
        beforeShow: function () {
            delete this.el.lastXY;
            delete this.el.lastLT;
            if (this.x === undefined || this.y === undefined) {
                var xy = this.el.getAlignToXY(this.container, 'c-c');
                var pos = this.el.translatePoints(xy[0], xy[1]);
                this.x = this.x === undefined ? pos.left : this.x;
                this.y = this.y === undefined ? pos.top : this.y;
            }
            this.el.setLeftTop(this.x, this.y);
            if (this.expandOnShow) this.expand(false);
            if (this.modal) {
                if (this.container) {
                    this.container.addClass('x-body-masked');
                    //this.mask.setSize(this.container.getViewSize().width, this.container.getViewSize().height);
                } else {
                    Ext.getBody().addClass('x-body-masked');
                    this.mask.setSize(Ext.lib.Dom.getViewWidth(true), Ext.lib.Dom.getViewHeight(true));
                }
                /* commented
                Ext.getBody().addClass('x-body-masked');
                this.mask.setSize(Ext.lib.Dom.getViewWidth(true), Ext.lib.Dom.getViewHeight(true));
                */
                this.mask.show();
            }
        }
    });
};