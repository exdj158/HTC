/*!
 * Ext JS Library 3.1.1, 3.3.1
 * Copyright(c) 2006-2010 Ext JS, LLC
 * licensing@extjs.com
 * http://www.extjs.com/license
 * Features was modified by Element-IT Software
 */

/******* FileUploadField.js *******/

Ext.ns('Ext.ux.form');

/**
 * @class Ext.ux.form.FileUploadField
 * @extends Ext.form.TextField
 * Creates a file upload field.
 * @xtype fileuploadfield
 */
Ext.ux.form.FileUploadField = Ext.extend(Ext.form.TextField,  {
    /**
     * @cfg {String} buttonText The button text to display on the upload button (defaults to
     * 'Browse...').  Note that if you supply a value for {@link #buttonCfg}, the buttonCfg.text
     * value will be used instead if available.
     */
    buttonText: 'Browse...',
    /**
     * @cfg {Boolean} buttonOnly True to display the file upload field as a button with no visible
     * text field (defaults to false).  If true, all inherited TextField members will still be available.
     */
    buttonOnly: false,
    /**
     * @cfg {Number} buttonOffset The number of pixels of space reserved between the button and the text field
     * (defaults to 3).  Note that this only applies if {@link #buttonOnly} = false.
     */
    buttonOffset: 3,
    /**
     * @cfg {Object} buttonCfg A standard {@link Ext.Button} config object.
     */

    // private
    readOnly: false, //true,

    /**
     * @hide
     * @method autoSize
     */
    autoSize: Ext.emptyFn,

    // private
    initComponent: function(){
        Ext.ux.form.FileUploadField.superclass.initComponent.call(this);

        this.addEvents(
            /**
             * @event fileselected
             * Fires when the underlying file input field's value has changed from the user
             * selecting a new file from the system file selection dialog.
             * @param {Ext.ux.form.FileUploadField} this
             * @param {String} value The file value returned by the underlying file input field
             */
            'fileselected'
        );
    },

    // private
    onRender : function(ct, position){
        Ext.ux.form.FileUploadField.superclass.onRender.call(this, ct, position);

        this.wrap = this.el.wrap({cls:'x-form-field-wrap x-form-file-wrap'});
        this.el.addClass('x-form-file-text');
        this.el.dom.removeAttribute('name');
        this.createFileInput();

        var btnCfg = Ext.applyIf(this.buttonCfg || {}, {
            text: this.buttonText
        });
        this.button = new Ext.Button(Ext.apply(btnCfg, {
            renderTo: this.wrap,
            cls: 'x-form-file-btn' + (btnCfg.iconCls ? ' x-btn-icon' : '')
        }));

        if(this.buttonOnly){
            this.el.hide();
            this.wrap.setWidth(this.button.getEl().getWidth());
        }

        this.bindListeners();
        this.resizeEl = this.positionEl = this.wrap;
    },
    
    bindListeners: function(){
        this.fileInput.on({
            scope: this,
            mouseenter: function() {
                this.button.addClass(['x-btn-over','x-btn-focus'])
            },
            mouseleave: function(){
                this.button.removeClass(['x-btn-over','x-btn-focus','x-btn-click'])
            },
            mousedown: function(){
                this.button.addClass('x-btn-click')
            },
            mouseup: function(){
                this.button.removeClass(['x-btn-over','x-btn-focus','x-btn-click'])
            },
            change: function(){
                var v = this.fileInput.dom.value;
                this.setValue((v || '').replace(/^C:[\\\/]fakepath[\\\/]/gi, ''));
                this.fireEvent('fileselected', this, v);
            }
        }); 
    },
    
    createFileInput: function () {
        var inputConfig = {
            id: this.getFileInputId(),
            name: this.name || this.getId(),
            cls: 'x-form-file',
            tag: 'input',
            type: 'file',
            size: 1
        };
        if (!Ext.isEmpty(this.accept)) {
            inputConfig.accept = this.accept;
        }
        this.fileInput = this.wrap.createChild(inputConfig);
    },
    
    reset : function(){
        this.fileInput.remove();
        this.createFileInput();
        this.bindListeners();
        Ext.ux.form.FileUploadField.superclass.reset.call(this);
    },

    // private
    getFileInputId: function(){
        return this.id + '-file';
    },

    // private
    onResize : function(w, h){
        Ext.ux.form.FileUploadField.superclass.onResize.call(this, w, h);

        this.wrap.setWidth(w);

        if(!this.buttonOnly){
            var w = this.wrap.getWidth() - this.button.getEl().getWidth() - this.buttonOffset;
            this.el.setWidth(w);
        }
    },

    // private
    onDestroy: function(){
        Ext.ux.form.FileUploadField.superclass.onDestroy.call(this);
        Ext.destroy(this.fileInput, this.button, this.wrap);
    },
    
    onDisable: function(){
        Ext.ux.form.FileUploadField.superclass.onDisable.call(this);
        this.doDisable(true);
    },
    
    onEnable: function(){
        Ext.ux.form.FileUploadField.superclass.onEnable.call(this);
        this.doDisable(false);

    },
    
    // private
    doDisable: function(disabled){
        this.fileInput.dom.disabled = disabled;
        this.button.setDisabled(disabled);
    },


    // private
    preFocus : Ext.emptyFn,

    // private
    alignErrorIcon : function(){
        this.errorIcon.alignTo(this.wrap, 'tl-tr', [2, 0]);
    }

});

Ext.reg('fileuploadfield', Ext.ux.form.FileUploadField);

// backwards compat
Ext.form.FileUploadField = Ext.ux.form.FileUploadField;

/******* MultipleFileUploadField.js *******/

/**
* @class Ext.ux.form.MultipleFileUploadField
* @extends Ext.form.TextField
* Creates a multiple file upload field.
* @xtype multiplefileuploadfield
*/
Ext.ux.form.MultipleFileUploadField = Ext.extend(Ext.form.TextField, {
    /**
    * @cfg {String} buttonText The button text to display on the upload button (defaults to
    * 'Browse...').  Note that if you supply a value for {@link #buttonCfg}, the buttonCfg.text
    * value will be used instead if available.
    */
    buttonText: 'Browse...',
    /**
    * @cfg {Boolean} buttonOnly True to display the file upload field as a button with no visible
    * text field (defaults to false).  If true, all inherited TextField members will still be available.
    */
    buttonOnly: false,
    /**
    * @cfg {Number} buttonOffset The number of pixels of space reserved between the button and the text field
    * (defaults to 3).  Note that this only applies if {@link #buttonOnly} = false.
    */
    buttonOffset: 3,
    /**
    * @cfg {Boolean} uploadFolders True to allow upload folder (only in Chrome browsers)
    * (defaults to false).
    */
    uploadFolders: false,
    /**
    * @cfg {Object} buttonCfg A standard {@link Ext.Button} config object.
    */

    // private
    readOnly: true,

    /**
    * @hide
    * @method autoSize
    */
    autoSize: Ext.emptyFn,

    // private
    initComponent: function () {
        Ext.ux.form.MultipleFileUploadField.superclass.initComponent.call(this);

        this.addEvents(
        /**
        * @event fileselected
        * Fires when the underlying file input field's value has changed from the user
        * selecting a new file from the system file selection dialog.
        * @param {Ext.ux.form.MultipleFileUploadField} this
        * @param {String} value The file value returned by the underlying file input field
        */
            'fileselected'
        );
    },

    // private
    onRender: function (ct, position) {
        Ext.ux.form.MultipleFileUploadField.superclass.onRender.call(this, ct, position);

        this.wrap = this.el.wrap({ cls: 'x-form-field-wrap x-form-file-wrap' });
        this.el.addClass('x-form-file-text');
        this.el.dom.removeAttribute('name');
        this.createFileInput();

        var btnCfg = Ext.applyIf(this.buttonCfg || {}, {
            text: this.buttonText
        });
        this.button = new Ext.Button(Ext.apply(btnCfg, {
            renderTo: this.wrap,
            cls: 'x-form-file-btn' + (btnCfg.iconCls ? ' x-btn-icon' : '')
        }));

        if (this.buttonOnly) {
            this.el.hide();
            this.wrap.setWidth(this.button.getEl().getWidth());
        }

        this.bindListeners();
        this.resizeEl = this.positionEl = this.wrap;
    },

    bindListeners: function () {
        this.fileInput.on({
            scope: this,
            mouseenter: function () {
                this.button.addClass(['x-btn-over', 'x-btn-focus'])
            },
            mouseleave: function () {
                this.button.removeClass(['x-btn-over', 'x-btn-focus', 'x-btn-click'])
            },
            mousedown: function () {
                this.button.addClass('x-btn-click')
            },
            mouseup: function () {
                this.button.removeClass(['x-btn-over', 'x-btn-focus', 'x-btn-click'])
            },
            change: function () {
                var v = this.fileInput.dom.value;
                var files = this.fileInput.dom.files;
                if (files) {
                    v = '';
                    for (var i = 0; i < files.length; i++) {
                        if (files[i].name !== '.') {
                            if (files[i].webkitRelativePath && files[i].webkitRelativePath != '') {
                                v += files[i].webkitRelativePath;
                            } else {
                                v += files[i].name;
                            }
                            v += ', ';
                        }
                    }
                    if (v.length > 2)
                        v = v.substring(0, v.length - 2);
                    this.setValue(v);
                } else {
                    this.setValue((v || '').replace(/^C:[\\\/]fakepath[\\\/]/gi, ''));
                }
                this.fireEvent('fileselected', this, files ? files : v);
            }
        });
    },

    createFileInput: function () {
        var inputCfg = {
            id: this.getFileInputId(),
            name: this.name || this.getId(),
            cls: 'x-form-file',
            tag: 'input',
            type: 'file',
            multiple: 'multiple',
            size: 1
        };
        if (this.uploadFolders) {
            inputCfg.webkitdirectory = '';
            inputCfg.directory = '';
            inputCfg.mozdirectory = '';
            inputCfg.msdirectory = '';
            inputCfg.odirectory = '';
        }
        var chunkedEnabled = this.chunkedUpload && typeof this.onchangeForChunked == 'function';
        if (this.wrap) {
            this.fileInput = this.wrap.createChild(inputCfg);
            if (this.fileInput.dom && chunkedEnabled) {
                this.fileInput.dom.onchange = this.onchangeForChunked;
            }
        }
    },

    reset: function () {
        if (this.fileInput)
            this.fileInput.remove();
        this.createFileInput();
        if (this.fileInput)
            this.bindListeners();
        Ext.ux.form.MultipleFileUploadField.superclass.reset.call(this);
    },

    getFiles: function () {
        if (this.fileInput) {
            if (this.fileInput.dom.files)
                return this.fileInput.dom.files;
            else
                return this.fileInput.dom.value;
        }
        return null;
    },

    setFileInputDisabled: function (disabled) {
        if (this.chunkedUpload && this.fileInput && this.fileInput.dom) {
            this.fileInput.dom.disabled = disabled === true;
        }
    },

    // private
    getFileInputId: function () {
        return this.id + '-file';
    },

    // private
    onResize: function (w, h) {
        Ext.ux.form.MultipleFileUploadField.superclass.onResize.call(this, w, h);

        this.wrap.setWidth(w);

        if (!this.buttonOnly) {
            var w = this.wrap.getWidth() - this.button.getEl().getWidth() - this.buttonOffset;
            this.el.setWidth(w);
        }

        this.wrap.setHeight(24);
    },

    // private
    onDestroy: function () {
        Ext.ux.form.MultipleFileUploadField.superclass.onDestroy.call(this);
        Ext.destroy(this.fileInput, this.button, this.wrap);
    },

    onDisable: function () {
        Ext.ux.form.MultipleFileUploadField.superclass.onDisable.call(this);
        this.doDisable(true);
    },

    onEnable: function () {
        Ext.ux.form.MultipleFileUploadField.superclass.onEnable.call(this);
        this.doDisable(false);
    },

    // private
    doDisable: function (disabled) {
        this.fileInput.dom.disabled = disabled;
        this.button.setDisabled(disabled);
    },

    // private
    preFocus: Ext.emptyFn,

    // private
    alignErrorIcon: function () {
        this.errorIcon.alignTo(this.wrap, 'tl-tr', [2, 0]);
    }

});

Ext.reg('multiplefileuploadfield', Ext.ux.form.MultipleFileUploadField);

// backwards compat
Ext.form.MultipleFileUploadField = Ext.ux.form.MultipleFileUploadField;

/******* ext-columns.js *******/

Ext.ns('Ext.ux.grid');

/**
 * @class Ext.ux.grid.CheckColumn
 * @extends Ext.grid.Column
 * <p>A Column subclass which renders a checkbox in each column cell which toggles the truthiness of the associated data field on click.</p>
 * <p><b>Note. As of ExtJS 3.3 this no longer has to be configured as a plugin of the GridPanel.</b></p>
 * <p>Example usage:</p>
 * <pre><code>
var cm = new Ext.grid.ColumnModel([{
       header: 'Foo',
       ...
    },{
       xtype: 'checkcolumn',
       header: 'Indoor?',
       dataIndex: 'indoor',
       width: 55
    }
]);

// create the grid
var grid = new Ext.grid.EditorGridPanel({
    ...
    colModel: cm,
    ...
});
 * </code></pre>
 * In addition to toggling a Boolean value within the record data, this
 * class toggles a css class between <tt>'x-grid3-check-col'</tt> and
 * <tt>'x-grid3-check-col-on'</tt> to alter the background image used for
 * a column.
 */
Ext.ux.grid.CheckColumn = Ext.extend(Ext.grid.Column, {

    /**
     * @private
     * Process and refire events routed from the GridView's processEvent method.
     */
    processEvent : function(name, e, grid, rowIndex, colIndex){
        if (name == 'mousedown') {
            var record = grid.store.getAt(rowIndex);
            record.set(this.dataIndex, !record.data[this.dataIndex]);
            return false; // Cancel row selection.
        } else {
            return Ext.grid.ActionColumn.superclass.processEvent.apply(this, arguments);
        }
    },

    renderer : function(v, p, record){
        p.css += ' x-grid3-check-col-td'; 
        return String.format('<div class="x-grid3-check-col{0}">&#160;</div>', v ? '-on' : '');
    },

    // Deprecate use as a plugin. Remove in 4.0
    init: Ext.emptyFn
});

// register ptype. Deprecate. Remove in 4.0
Ext.preg('checkcolumn', Ext.ux.grid.CheckColumn);

// backwards compat. Remove in 4.0
Ext.grid.CheckColumn = Ext.ux.grid.CheckColumn;

// register Column xtype
Ext.grid.Column.types.checkcolumn = Ext.ux.grid.CheckColumn;

/******* ext-filters.js *******/

////////////////////////////////////////////////////////////////////////////////
// RangeMenu

Ext.ns('Ext.ux.menu');

/** 
* @class Ext.ux.menu.RangeMenu
* @extends Ext.menu.Menu
* Custom implementation of Ext.menu.Menu that has preconfigured
* items for gt, lt, eq.
* <p><b><u>Example Usage:</u></b></p>
* <pre><code>    

* </code></pre> 
*/
Ext.ux.menu.RangeMenu = Ext.extend(Ext.menu.Menu, {

    constructor: function (config) {

        Ext.ux.menu.RangeMenu.superclass.constructor.call(this, config);

        this.addEvents(
        /**
        * @event update
        * Fires when a filter configuration has changed
        * @param {Ext.ux.grid.filter.Filter} this The filter object.
        */
            'update'
        );

        this.updateTask = new Ext.util.DelayedTask(this.fireUpdate, this);

        var i, len, item, cfg, Cls;

        for (i = 0, len = this.menuItems.length; i < len; i++) {
            item = this.menuItems[i];
            if (item !== '-') {
                // defaults
                cfg = {
                    itemId: 'range-' + item,
                    enableKeyEvents: true,
                    iconCls: this.iconCls[item] || 'no-icon',
                    listeners: {
                        scope: this,
                        keyup: this.onInputKeyUp
                    }
                };
                Ext.apply(
                    cfg,
                // custom configs
                    Ext.applyIf(this.fields[item] || {}, this.fieldCfg[item]),
                // configurable defaults
                    this.menuItemCfgs
                );
                Cls = cfg.fieldCls || this.fieldCls;
                item = this.fields[item] = new Cls(cfg);
            }
            this.add(item);
        }
    },

    /**
    * @private
    * called by this.updateTask
    */
    fireUpdate: function () {
        this.fireEvent('update', this);
    },

    /**
    * Get and return the value of the filter.
    * @return {String} The value of this filter
    */
    getValue: function () {
        var result = {}, key, field;
        for (key in this.fields) {
            field = this.fields[key];
            if (field.isValid() && String(field.getValue()).length > 0) {
                result[key] = field.getValue();
            }
        }
        return result;
    },

    /**
    * Set the value of this menu and fires the 'update' event.
    * @param {Object} data The data to assign to this menu
    */
    setValue: function (data) {
        var key;
        for (key in this.fields) {
            this.fields[key].setValue(data[key] !== undefined ? data[key] : '');
        }
        this.fireEvent('update', this);
    },

    /**  
    * @private
    * Handler method called when there is a keyup event on an input
    * item of this menu.
    */
    onInputKeyUp: function (field, e) {
        var k = e.getKey();
        if (k == e.RETURN && field.isValid()) {
            e.stopEvent();
            this.hide(true);
            return;
        }

        if (field == this.fields.eq) {
            if (this.fields.gt) {
                this.fields.gt.setValue(null);
            }
            if (this.fields.lt) {
                this.fields.lt.setValue(null);
            }
        }
        else {
            this.fields.eq.setValue(null);
        }

        // restart the timer
        this.updateTask.delay(this.updateBuffer);
    }
});

// end RangeMenu
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// ListMenu

/** 
* @class Ext.ux.menu.ListMenu
* @extends Ext.menu.Menu
* This is a supporting class for {@link Ext.ux.grid.filter.ListFilter}.
* Although not listed as configuration options for this class, this class
* also accepts all configuration options from {@link Ext.ux.grid.filter.ListFilter}.
*/
Ext.ux.menu.ListMenu = Ext.extend(Ext.menu.Menu, {
    /**
    * @cfg {String} labelField
    * Defaults to 'text'.
    */
    labelField: 'text',
    /**
    * @cfg {String} paramPrefix
    * Defaults to 'Loading...'.
    */
    loadingText: 'Loading...',
    /**
    * @cfg {Boolean} loadOnShow
    * Defaults to true.
    */
    loadOnShow: true,
    /**
    * @cfg {Boolean} single
    * Specify true to group all items in this list into a single-select
    * radio button group. Defaults to false.
    */
    single: false,

    constructor: function (cfg) {
        this.selected = [];
        this.addEvents(
        /**
        * @event checkchange
        * Fires when there is a change in checked items from this list
        * @param {Object} item Ext.menu.CheckItem
        * @param {Object} checked The checked value that was set
        */
            'checkchange'
        );

        Ext.ux.menu.ListMenu.superclass.constructor.call(this, cfg = cfg || {});

        if (!cfg.store && cfg.options) {
            var options = [];
            for (var i = 0, len = cfg.options.length; i < len; i++) {
                var value = cfg.options[i];
                switch (Ext.type(value)) {
                    case 'array': options.push(value); break;
                    case 'object': options.push([value.id, value[this.labelField]]); break;
                    case 'string': options.push([value, value]); break;
                }
            }

            this.store = new Ext.data.Store({
                reader: new Ext.data.ArrayReader({ id: 0 }, ['id', this.labelField]),
                data: options,
                listeners: {
                    'load': this.onLoad,
                    scope: this
                }
            });
            this.loaded = true;
        } else {
            this.add({ text: this.loadingText, iconCls: 'loading-indicator' });
            this.store.on('load', this.onLoad, this);
        }
    },

    destroy: function () {
        if (this.store) {
            this.store.destroy();
        }
        Ext.ux.menu.ListMenu.superclass.destroy.call(this);
    },

    /**
    * Lists will initially show a 'loading' item while the data is retrieved from the store.
    * In some cases the loaded data will result in a list that goes off the screen to the
    * right (as placement calculations were done with the loading item). This adapter will
    * allow show to be called with no arguments to show with the previous arguments and
    * thus recalculate the width and potentially hang the menu from the left.
    */
    show: function () {
        var lastArgs = null;
        return function () {
            if (arguments.length === 0) {
                Ext.ux.menu.ListMenu.superclass.show.apply(this, lastArgs);
            } else {
                lastArgs = arguments;
                if (this.loadOnShow && !this.loaded) {
                    this.store.load();
                }
                Ext.ux.menu.ListMenu.superclass.show.apply(this, arguments);
            }
        };
    } (),

    /** @private */
    onLoad: function (store, records) {
        var visible = this.isVisible();
        this.hide(false);

        this.removeAll(true);

        var gid = this.single ? Ext.id() : null;
        for (var i = 0, len = records.length; i < len; i++) {
            var item = new Ext.menu.CheckItem({
                text: records[i].get(this.labelField),
                group: gid,
                checked: this.selected.indexOf(records[i].id) > -1,
                hideOnClick: false
            });

            item.itemId = records[i].id;
            item.on('checkchange', this.checkChange, this);

            this.add(item);
        }

        this.loaded = true;

        if (visible) {
            this.show();
        }
        this.fireEvent('load', this, records);
    },

    /**
    * Get the selected items.
    * @return {Array} selected
    */
    getSelected: function () {
        return this.selected;
    },

    /** @private */
    setSelected: function (value) {
        value = this.selected = [].concat(value);

        if (this.loaded) {
            this.items.each(function (item) {
                item.setChecked(false, true);
                for (var i = 0, len = value.length; i < len; i++) {
                    if (item.itemId == value[i]) {
                        item.setChecked(true, true);
                    }
                }
            }, this);
        }
    },

    /**
    * Handler for the 'checkchange' event from an check item in this menu
    * @param {Object} item Ext.menu.CheckItem
    * @param {Object} checked The checked value that was set
    */
    checkChange: function (item, checked) {
        var value = [];
        this.items.each(function (item) {
            if (item.checked) {
                value.push(item.itemId);
            }
        }, this);
        this.selected = value;

        this.fireEvent('checkchange', item, checked);
    }
});

// end ListMenu
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// GridFilters

/**
* @class Ext.ux.grid.GridFilters
* @extends Ext.util.Observable
* <p>GridFilter is a plugin (<code>ptype='gridfilters'</code>) for grids that
* allow for a slightly more robust representation of filtering than what is
* provided by the default store.</p>
* <p>Filtering is adjusted by the user using the grid's column header menu
* (this menu can be disabled through configuration). Through this menu users
* can configure, enable, and disable filters for each column.</p>
* <p><b><u>Features:</u></b></p>
* <div class="mdetail-params"><ul>
* <li><b>Filtering implementations</b> :
* <div class="sub-desc">
* Default filtering for Strings, Numeric Ranges, Date Ranges, Lists (which can
* be backed by a Ext.data.Store), and Boolean. Additional custom filter types
* and menus are easily created by extending Ext.ux.grid.filter.Filter.
* </div></li>
* <li><b>Graphical indicators</b> :
* <div class="sub-desc">
* Columns that are filtered have {@link #filterCls a configurable css class}
* applied to the column headers.
* </div></li>
* <li><b>Paging</b> :
* <div class="sub-desc">
* If specified as a plugin to the grid's configured PagingToolbar, the current page
* will be reset to page 1 whenever you update the filters.
* </div></li>
* <li><b>Automatic Reconfiguration</b> :
* <div class="sub-desc">
* Filters automatically reconfigure when the grid 'reconfigure' event fires.
* </div></li>
* <li><b>Stateful</b> :
* Filter information will be persisted across page loads by specifying a
* <code>stateId</code> in the Grid configuration.
* <div class="sub-desc">
* The filter collection binds to the
* <code>{@link Ext.grid.GridPanel#beforestaterestore beforestaterestore}</code>
* and <code>{@link Ext.grid.GridPanel#beforestatesave beforestatesave}</code>
* events in order to be stateful.
* </div></li>
* <li><b>Grid Changes</b> :
* <div class="sub-desc"><ul>
* <li>A <code>filters</code> <i>property</i> is added to the grid pointing to
* this plugin.</li>
* <li>A <code>filterupdate</code> <i>event</i> is added to the grid and is
* fired upon onStateChange completion.</li>
* </ul></div></li>
* <li><b>Server side code examples</b> :
* <div class="sub-desc"><ul>
* <li><a href="http://www.vinylfox.com/extjs/grid-filter-php-backend-code.php">PHP</a> - (Thanks VinylFox)</li>
* <li><a href="http://extjs.com/forum/showthread.php?p=77326#post77326">Ruby on Rails</a> - (Thanks Zyclops)</li>
* <li><a href="http://extjs.com/forum/showthread.php?p=176596#post176596">Ruby on Rails</a> - (Thanks Rotomaul)</li>
* <li><a href="http://www.debatablybeta.com/posts/using-extjss-grid-filtering-with-django/">Python</a> - (Thanks Matt)</li>
* <li><a href="http://mcantrell.wordpress.com/2008/08/22/extjs-grids-and-grails/">Grails</a> - (Thanks Mike)</li>
* </ul></div></li>
* </ul></div>
* <p><b><u>Example usage:</u></b></p>
* <pre><code>
var store = new Ext.data.GroupingStore({
...
});

var filters = new Ext.ux.grid.GridFilters({
autoReload: false, //don&#39;t reload automatically
local: true, //only filter locally
// filters may be configured through the plugin,
// or in the column definition within the column model configuration
filters: [{
type: 'numeric',
dataIndex: 'id'
}, {
type: 'string',
dataIndex: 'name'
}, {
type: 'numeric',
dataIndex: 'price'
}, {
type: 'date',
dataIndex: 'dateAdded'
}, {
type: 'list',
dataIndex: 'size',
options: ['extra small', 'small', 'medium', 'large', 'extra large'],
phpMode: true
}, {
type: 'boolean',
dataIndex: 'visible'
}]
});
var cm = new Ext.grid.ColumnModel([{
...
}]);

var grid = new Ext.grid.GridPanel({
ds: store,
cm: cm,
view: new Ext.grid.GroupingView(),
plugins: [filters],
height: 400,
width: 700,
bbar: new Ext.PagingToolbar({
store: store,
pageSize: 15,
plugins: [filters] //reset page to page 1 if filters change
})
});

store.load({params: {start: 0, limit: 15}});

// a filters property is added to the grid
grid.filters
* </code></pre>
*/
Ext.ux.grid.GridFilters = Ext.extend(Ext.util.Observable, {
    /**
    * @cfg {Boolean} autoReload
    * Defaults to true, reloading the datasource when a filter change happens.
    * Set this to false to prevent the datastore from being reloaded if there
    * are changes to the filters.  See <code>{@link updateBuffer}</code>.
    */
    autoReload: true,
    /**
    * @cfg {Boolean} encode
    * Specify true for {@link #buildQuery} to use Ext.util.JSON.encode to
    * encode the filter query parameter sent with a remote request.
    * Defaults to false.
    */
    /**
    * @cfg {Array} filters
    * An Array of filters config objects. Refer to each filter type class for
    * configuration details specific to each filter type. Filters for Strings,
    * Numeric Ranges, Date Ranges, Lists, and Boolean are the standard filters
    * available.
    */
    /**
    * @cfg {String} filterCls
    * The css class to be applied to column headers with active filters.
    * Defaults to <tt>'ux-filterd-column'</tt>.
    */
    filterCls: 'ux-filtered-column',
    /**
    * @cfg {Boolean} local
    * <tt>true</tt> to use Ext.data.Store filter functions (local filtering)
    * instead of the default (<tt>false</tt>) server side filtering.
    */
    local: false,
    /**
    * @cfg {String} menuFilterText
    * defaults to <tt>'Filters'</tt>.
    */
    menuFilterText: 'Filters',
    /**
    * @cfg {String} paramPrefix
    * The url parameter prefix for the filters.
    * Defaults to <tt>'filter'</tt>.
    */
    paramPrefix: 'filter',
    /**
    * @cfg {Boolean} showMenu
    * Defaults to true, including a filter submenu in the default header menu.
    */
    showMenu: true,
    /**
    * @cfg {String} stateId
    * Name of the value to be used to store state information.
    */
    stateId: undefined,
    /**
    * @cfg {Integer} updateBuffer
    * Number of milliseconds to defer store updates since the last filter change.
    */
    updateBuffer: 500,

    /** @private */
    constructor: function (config) {
        config = config || {};
        this.deferredUpdate = new Ext.util.DelayedTask(this.reload, this);
        this.filters = new Ext.util.MixedCollection();
        this.filters.getKey = function (o) {
            return o ? o.dataIndex : null;
        };
        this.addFilters(config.filters);
        delete config.filters;
        Ext.apply(this, config);
    },

    /** @private */
    init: function (grid) {
        if (grid instanceof Ext.grid.GridPanel) {
            this.grid = grid;

            this.bindStore(this.grid.getStore(), true);
            // assumes no filters were passed in the constructor, so try and use ones from the colModel
            if (this.filters.getCount() == 0) {
                this.addFilters(this.grid.getColumnModel());
            }

            this.grid.filters = this;

            this.grid.addEvents({ 'filterupdate': true });

            grid.on({
                scope: this,
                beforestaterestore: this.applyState,
                beforestatesave: this.saveState,
                beforedestroy: this.destroy,
                reconfigure: this.onReconfigure
            });

            if (grid.rendered) {
                this.onRender();
            } else {
                grid.on({
                    scope: this,
                    single: true,
                    render: this.onRender
                });
            }

        } else if (grid instanceof Ext.PagingToolbar) {
            this.toolbar = grid;
        }
    },

    /**
    * @private
    * Handler for the grid's beforestaterestore event (fires before the state of the
    * grid is restored).
    * @param {Object} grid The grid object
    * @param {Object} state The hash of state values returned from the StateProvider.
    */
    applyState: function (grid, state) {
        var key, filter;
        this.applyingState = true;
        this.clearFilters();
        if (state.filters) {
            for (key in state.filters) {
                filter = this.filters.get(key);
                if (filter) {
                    filter.setValue(state.filters[key]);
                    filter.setActive(true);
                }
            }
        }
        this.deferredUpdate.cancel();
        if (this.local) {
            this.reload();
        }
        delete this.applyingState;
        delete state.filters;
    },

    /**
    * Saves the state of all active filters
    * @param {Object} grid
    * @param {Object} state
    * @return {Boolean}
    */
    saveState: function (grid, state) {
        var filters = {};
        this.filters.each(function (filter) {
            if (filter.active) {
                filters[filter.dataIndex] = filter.getValue();
            }
        });
        return (state.filters = filters);
    },

    /**
    * @private
    * Handler called when the grid is rendered
    */
    onRender: function () {
        this.grid.getView().on('refresh', this.onRefresh, this);
        this.createMenu();
    },

    /**
    * @private
    * Handler called by the grid 'beforedestroy' event
    */
    destroy: function () {
        this.removeAll();
        this.purgeListeners();

        if (this.filterMenu) {
            Ext.menu.MenuMgr.unregister(this.filterMenu);
            this.filterMenu.destroy();
            this.filterMenu = this.menu.menu = null;
        }
    },

    /**
    * Remove all filters, permanently destroying them.
    */
    removeAll: function () {
        if (this.filters) {
            Ext.destroy.apply(Ext, this.filters.items);
            // remove all items from the collection
            this.filters.clear();
        }
    },


    /**
    * Changes the data store bound to this view and refreshes it.
    * @param {Store} store The store to bind to this view
    */
    bindStore: function (store, initial) {
        if (!initial && this.store) {
            if (this.local) {
                store.un('load', this.onLoad, this);
            } else {
                store.un('beforeload', this.onBeforeLoad, this);
            }
        }
        if (store) {
            if (this.local) {
                store.on('load', this.onLoad, this);
            } else {
                store.on('beforeload', this.onBeforeLoad, this);
            }
        }
        this.store = store;
    },

    /**
    * @private
    * Handler called when the grid reconfigure event fires
    */
    onReconfigure: function () {
        this.bindStore(this.grid.getStore());
        this.store.clearFilter();
        this.removeAll();
        this.addFilters(this.grid.getColumnModel());
        this.updateColumnHeadings();
    },

    createMenu: function () {
        var view = this.grid.getView(),
            hmenu = view.hmenu;

        if (this.showMenu && hmenu) {

            this.sep = hmenu.addSeparator();
            this.filterMenu = new Ext.menu.Menu({
                id: this.grid.id + '-filters-menu'
            });
            this.menu = hmenu.add({
                checked: false,
                itemId: 'filters',
                text: this.menuFilterText,
                menu: this.filterMenu
            });

            this.menu.on({
                scope: this,
                checkchange: this.onCheckChange,
                beforecheckchange: this.onBeforeCheck
            });
            hmenu.on('beforeshow', this.onMenu, this);
        }
        this.updateColumnHeadings();
    },

    /**
    * @private
    * Get the filter menu from the filters MixedCollection based on the clicked header
    */
    getMenuFilter: function () {
        var view = this.grid.getView();
        if (!view || view.hdCtxIndex === undefined) {
            return null;
        }
        return this.filters.get(
            view.cm.config[view.hdCtxIndex].dataIndex
        );
    },

    /**
    * @private
    * Handler called by the grid's hmenu beforeshow event
    */
    onMenu: function (filterMenu) {
        var filter = this.getMenuFilter();

        if (filter) {
            /*
            TODO: lazy rendering
            if (!filter.menu) {
            filter.menu = filter.createMenu();
            }
            */
            this.menu.menu = filter.menu;
            this.menu.setChecked(filter.active, false);
            // disable the menu if filter.disabled explicitly set to true
            this.menu.setDisabled(filter.disabled === true);
        }

        this.menu.setVisible(filter !== undefined);
        this.sep.setVisible(filter !== undefined);
    },

    /** @private */
    onCheckChange: function (item, value) {
        this.getMenuFilter().setActive(value);
    },

    /** @private */
    onBeforeCheck: function (check, value) {
        return !value || this.getMenuFilter().isActivatable();
    },

    /**
    * @private
    * Handler for all events on filters.
    * @param {String} event Event name
    * @param {Object} filter Standard signature of the event before the event is fired
    */
    onStateChange: function (event, filter) {
        if (event === 'serialize') {
            return;
        }

        if (filter == this.getMenuFilter()) {
            this.menu.setChecked(filter.active, false);
        }

        if ((this.autoReload || this.local) && !this.applyingState) {
            this.deferredUpdate.delay(this.updateBuffer);
        }
        this.updateColumnHeadings();

        if (!this.applyingState) {
            this.grid.saveState();
        }
        this.grid.fireEvent('filterupdate', this, filter);
    },

    /**
    * @private
    * Handler for store's beforeload event when configured for remote filtering
    * @param {Object} store
    * @param {Object} options
    */
    onBeforeLoad: function (store, options) {
        options.params = options.params || {};
        this.cleanParams(options.params);
        var params = this.buildQuery(this.getFilterData());
        Ext.apply(options.params, params);
    },

    /**
    * @private
    * Handler for store's load event when configured for local filtering
    * @param {Object} store
    * @param {Object} options
    */
    onLoad: function (store, options) {
        store.filterBy(this.getRecordFilter());
    },

    /**
    * @private
    * Handler called when the grid's view is refreshed
    */
    onRefresh: function () {
        this.updateColumnHeadings();
    },

    /**
    * Update the styles for the header row based on the active filters
    */
    updateColumnHeadings: function () {
        var view = this.grid.getView(),
            i, len, filter;
        if (view.mainHd) {
            for (i = 0, len = view.cm.config.length; i < len; i++) {
                filter = this.getFilter(view.cm.config[i].dataIndex);
                Ext.fly(view.getHeaderCell(i))[filter && filter.active ? 'addClass' : 'removeClass'](this.filterCls);
            }
        }
    },

    /** @private */
    reload: function () {
        if (this.local) {
            if (!!this.grid && !!this.grid.store) {
                this.grid.store.clearFilter(true);
                this.grid.store.filterBy(this.getRecordFilter());
            }
        } else {
            var start,
                store = this.grid.store;
            this.deferredUpdate.cancel();
            if (this.toolbar) {
                start = store.paramNames.start;
                if (store.lastOptions && store.lastOptions.params && store.lastOptions.params[start]) {
                    store.lastOptions.params[start] = 0;
                }
            }
            store.reload();
        }
    },

    /**
    * Method factory that generates a record validator for the filters active at the time
    * of invokation.
    * @private
    */
    getRecordFilter: function () {
        var f = [], len, i;
        this.filters.each(function (filter) {
            if (filter.active) {
                f.push(filter);
            }
        });

        len = f.length;
        return function (record) {
            for (i = 0; i < len; i++) {
                if (!f[i].validateRecord(record)) {
                    return false;
                }
            }
            return true;
        };
    },

    /**
    * Adds a filter to the collection and observes it for state change.
    * @param {Object/Ext.ux.grid.filter.Filter} config A filter configuration or a filter object.
    * @return {Ext.ux.grid.filter.Filter} The existing or newly created filter object.
    */
    addFilter: function (config) {
        var Cls = this.getFilterClass(config.type),
            filter = config.menu ? config : (new Cls(config));
        this.filters.add(filter);

        Ext.util.Observable.capture(filter, this.onStateChange, this);
        return filter;
    },

    /**
    * Adds filters to the collection.
    * @param {Array/Ext.grid.ColumnModel} filters Either an Array of
    * filter configuration objects or an Ext.grid.ColumnModel.  The columns
    * of a passed Ext.grid.ColumnModel will be examined for a <code>filter</code>
    * property and, if present, will be used as the filter configuration object.
    */
    addFilters: function (filters) {
        if (filters) {
            var i, len, filter, cm = false, dI;
            if (filters instanceof Ext.grid.ColumnModel) {
                filters = filters.config;
                cm = true;
            }
            for (i = 0, len = filters.length; i < len; i++) {
                filter = false;
                if (cm) {
                    dI = filters[i].dataIndex;
                    filter = filters[i].filter || filters[i].filterable;
                    if (filter) {
                        filter = (filter === true) ? {} : filter;
                        Ext.apply(filter, { dataIndex: dI });
                        // filter type is specified in order of preference:
                        //     filter type specified in config
                        //     type specified in store's field's type config
                        filter.type = filter.type || this.store.fields.get(dI).type.type;
                    }
                } else {
                    filter = filters[i];
                }
                // if filter config found add filter for the column
                if (filter) {
                    this.addFilter(filter);
                }
            }
        }
    },

    /**
    * Returns a filter for the given dataIndex, if one exists.
    * @param {String} dataIndex The dataIndex of the desired filter object.
    * @return {Ext.ux.grid.filter.Filter}
    */
    getFilter: function (dataIndex) {
        return this.filters.get(dataIndex);
    },

    /**
    * Turns all filters off. This does not clear the configuration information
    * (see {@link #removeAll}).
    */
    clearFilters: function () {
        this.filters.each(function (filter) {
            filter.setActive(false);
        });
    },

    /**
    * Returns an Array of the currently active filters.
    * @return {Array} filters Array of the currently active filters.
    */
    getFilterData: function () {
        var filters = [], i, len;

        this.filters.each(function (f) {
            if (f.active) {
                var d = [].concat(f.serialize());
                for (i = 0, len = d.length; i < len; i++) {
                    filters.push({
                        field: f.dataIndex,
                        data: d[i]
                    });
                }
            }
        });
        return filters;
    },

    /**
    * Function to take the active filters data and build it into a query.
    * The format of the query depends on the <code>{@link #encode}</code>
    * configuration:
    * <div class="mdetail-params"><ul>
    *
    * <li><b><tt>false</tt></b> : <i>Default</i>
    * <div class="sub-desc">
    * Flatten into query string of the form (assuming <code>{@link #paramPrefix}='filters'</code>:
    * <pre><code>
    filters[0][field]="someDataIndex"&
    filters[0][data][comparison]="someValue1"&
    filters[0][data][type]="someValue2"&
    filters[0][data][value]="someValue3"&
    * </code></pre>
    * </div></li>
    * <li><b><tt>true</tt></b> :
    * <div class="sub-desc">
    * JSON encode the filter data
    * <pre><code>
    filters[0][field]="someDataIndex"&
    filters[0][data][comparison]="someValue1"&
    filters[0][data][type]="someValue2"&
    filters[0][data][value]="someValue3"&
    * </code></pre>
    * </div></li>
    * </ul></div>
    * Override this method to customize the format of the filter query for remote requests.
    * @param {Array} filters A collection of objects representing active filters and their configuration.
    *    Each element will take the form of {field: dataIndex, data: filterConf}. dataIndex is not assured
    *    to be unique as any one filter may be a composite of more basic filters for the same dataIndex.
    * @return {Object} Query keys and values
    */
    buildQuery: function (filters) {
        var p = {}, i, f, root, dataPrefix, key, tmp,
            len = filters.length;

        if (!this.encode) {
            for (i = 0; i < len; i++) {
                f = filters[i];
                root = [this.paramPrefix, '[', i, ']'].join('');
                p[root + '[field]'] = f.field;

                dataPrefix = root + '[data]';
                for (key in f.data) {
                    p[[dataPrefix, '[', key, ']'].join('')] = f.data[key];
                }
            }
        } else {
            tmp = [];
            for (i = 0; i < len; i++) {
                f = filters[i];
                tmp.push(Ext.apply(
                    {},
                    { field: f.field },
                    f.data
                ));
            }
            // only build if there is active filter
            if (tmp.length > 0) {
                p[this.paramPrefix] = Ext.util.JSON.encode(tmp);
            }
        }
        return p;
    },

    /**
    * Removes filter related query parameters from the provided object.
    * @param {Object} p Query parameters that may contain filter related fields.
    */
    cleanParams: function (p) {
        // if encoding just delete the property
        if (this.encode) {
            delete p[this.paramPrefix];
            // otherwise scrub the object of filter data
        } else {
            var regex, key;
            regex = new RegExp('^' + this.paramPrefix + '\[[0-9]+\]');
            for (key in p) {
                if (regex.test(key)) {
                    delete p[key];
                }
            }
        }
    },

    /**
    * Function for locating filter classes, overwrite this with your favorite
    * loader to provide dynamic filter loading.
    * @param {String} type The type of filter to load ('Filter' is automatically
    * appended to the passed type; eg, 'string' becomes 'StringFilter').
    * @return {Class} The Ext.ux.grid.filter.Class
    */
    getFilterClass: function (type) {
        // map the supported Ext.data.Field type values into a supported filter
        switch (type) {
            case 'auto':
                type = 'string';
                break;
            case 'int':
            case 'float':
                type = 'numeric';
                break;
            case 'bool':
                type = 'boolean';
                break;
        }
        return Ext.ux.grid.filter[type.substr(0, 1).toUpperCase() + type.substr(1) + 'Filter'];
    }
});

// register ptype
Ext.preg('gridfilters', Ext.ux.grid.GridFilters);

// end GridFilters
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// Filter

Ext.ns('Ext.ux.grid.filter');

/** 
* @class Ext.ux.grid.filter.Filter
* @extends Ext.util.Observable
* Abstract base class for filter implementations.
*/
Ext.ux.grid.filter.Filter = Ext.extend(Ext.util.Observable, {
    /**
    * @cfg {Boolean} active
    * Indicates the initial status of the filter (defaults to false).
    */
    active: false,
    /**
    * True if this filter is active.  Use setActive() to alter after configuration.
    * @type Boolean
    * @property active
    */
    /**
    * @cfg {String} dataIndex 
    * The {@link Ext.data.Store} dataIndex of the field this filter represents.
    * The dataIndex does not actually have to exist in the store.
    */
    dataIndex: null,
    /**
    * The filter configuration menu that will be installed into the filter submenu of a column menu.
    * @type Ext.menu.Menu
    * @property
    */
    menu: null,
    /**
    * @cfg {Number} updateBuffer
    * Number of milliseconds to wait after user interaction to fire an update. Only supported 
    * by filters: 'list', 'numeric', and 'string'. Defaults to 500.
    */
    updateBuffer: 500,

    constructor: function (config) {
        Ext.apply(this, config);

        this.addEvents(
        /**
        * @event activate
        * Fires when an inactive filter becomes active
        * @param {Ext.ux.grid.filter.Filter} this
        */
            'activate',
        /**
        * @event deactivate
        * Fires when an active filter becomes inactive
        * @param {Ext.ux.grid.filter.Filter} this
        */
            'deactivate',
        /**
        * @event serialize
        * Fires after the serialization process. Use this to attach additional parameters to serialization
        * data before it is encoded and sent to the server.
        * @param {Array/Object} data A map or collection of maps representing the current filter configuration.
        * @param {Ext.ux.grid.filter.Filter} filter The filter being serialized.
        */
            'serialize',
        /**
        * @event update
        * Fires when a filter configuration has changed
        * @param {Ext.ux.grid.filter.Filter} this The filter object.
        */
            'update'
        );
        Ext.ux.grid.filter.Filter.superclass.constructor.call(this);

        this.menu = new Ext.menu.Menu();
        this.init(config);
        if (config && config.value) {
            this.setValue(config.value);
            this.setActive(config.active !== false, true);
            delete config.value;
        }
    },

    /**
    * Destroys this filter by purging any event listeners, and removing any menus.
    */
    destroy: function () {
        if (this.menu) {
            this.menu.destroy();
        }
        this.purgeListeners();
    },

    /**
    * Template method to be implemented by all subclasses that is to
    * initialize the filter and install required menu items.
    * Defaults to Ext.emptyFn.
    */
    init: Ext.emptyFn,

    /**
    * Template method to be implemented by all subclasses that is to
    * get and return the value of the filter.
    * Defaults to Ext.emptyFn.
    * @return {Object} The 'serialized' form of this filter
    * @methodOf Ext.ux.grid.filter.Filter
    */
    getValue: Ext.emptyFn,

    /**
    * Template method to be implemented by all subclasses that is to
    * set the value of the filter and fire the 'update' event.
    * Defaults to Ext.emptyFn.
    * @param {Object} data The value to set the filter
    * @methodOf Ext.ux.grid.filter.Filter
    */
    setValue: Ext.emptyFn,

    /**
    * Template method to be implemented by all subclasses that is to
    * return <tt>true</tt> if the filter has enough configuration information to be activated.
    * Defaults to <tt>return true</tt>.
    * @return {Boolean}
    */
    isActivatable: function () {
        return true;
    },

    /**
    * Template method to be implemented by all subclasses that is to
    * get and return serialized filter data for transmission to the server.
    * Defaults to Ext.emptyFn.
    */
    getSerialArgs: Ext.emptyFn,

    /**
    * Template method to be implemented by all subclasses that is to
    * validates the provided Ext.data.Record against the filters configuration.
    * Defaults to <tt>return true</tt>.
    * @param {Ext.data.Record} record The record to validate
    * @return {Boolean} true if the record is valid within the bounds
    * of the filter, false otherwise.
    */
    validateRecord: function () {
        return true;
    },

    /**
    * Returns the serialized filter data for transmission to the server
    * and fires the 'serialize' event.
    * @return {Object/Array} An object or collection of objects containing
    * key value pairs representing the current configuration of the filter.
    * @methodOf Ext.ux.grid.filter.Filter
    */
    serialize: function () {
        var args = this.getSerialArgs();
        this.fireEvent('serialize', args, this);
        return args;
    },

    /** @private */
    fireUpdate: function () {
        if (this.active) {
            this.fireEvent('update', this);
        }
        this.setActive(this.isActivatable());
    },

    /**
    * Sets the status of the filter and fires the appropriate events.
    * @param {Boolean} active        The new filter state.
    * @param {Boolean} suppressEvent True to prevent events from being fired.
    * @methodOf Ext.ux.grid.filter.Filter
    */
    setActive: function (active, suppressEvent) {
        if (this.active != active) {
            this.active = active;
            if (suppressEvent !== true) {
                this.fireEvent(active ? 'activate' : 'deactivate', this);
            }
        }
    }
});

// end Filter
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// StringFilter

/** 
* @class Ext.ux.grid.filter.StringFilter
* @extends Ext.ux.grid.filter.Filter
* Filter by a configurable Ext.form.TextField
* <p><b><u>Example Usage:</u></b></p>
* <pre><code>    
var filters = new Ext.ux.grid.GridFilters({
...
filters: [{
// required configs
type: 'string',
dataIndex: 'name',
        
// optional configs
value: 'foo',
active: true, // default is false
iconCls: 'ux-gridfilter-text-icon' // default
// any Ext.form.TextField configs accepted
}]
});
* </code></pre>
*/
Ext.ux.grid.filter.StringFilter = Ext.extend(Ext.ux.grid.filter.Filter, {

    /**
    * @cfg {String} iconCls
    * The iconCls to be applied to the menu item.
    * Defaults to <tt>'ux-gridfilter-text-icon'</tt>.
    */
    iconCls: 'ux-gridfilter-text-icon',

    emptyText: 'Enter Filter Text...',
    selectOnFocus: true,
    width: 125,

    /**  
    * @private
    * Template method that is to initialize the filter and install required menu items.
    */
    init: function (config) {
        Ext.applyIf(config, {
            enableKeyEvents: true,
            iconCls: this.iconCls,
            listeners: {
                scope: this,
                keyup: this.onInputKeyUp
            }
        });

        this.inputItem = new Ext.form.TextField(config);
        this.menu.add(this.inputItem);
        this.updateTask = new Ext.util.DelayedTask(this.fireUpdate, this);
    },

    /**
    * @private
    * Template method that is to get and return the value of the filter.
    * @return {String} The value of this filter
    */
    getValue: function () {
        return this.inputItem.getValue();
    },

    /**
    * @private
    * Template method that is to set the value of the filter.
    * @param {Object} value The value to set the filter
    */
    setValue: function (value) {
        this.inputItem.setValue(value);
        this.fireEvent('update', this);
    },

    /**
    * @private
    * Template method that is to return <tt>true</tt> if the filter
    * has enough configuration information to be activated.
    * @return {Boolean}
    */
    isActivatable: function () {
        return (this.inputItem.getValue() || '').length > 0;
    },

    /**
    * @private
    * Template method that is to get and return serialized filter data for
    * transmission to the server.
    * @return {Object/Array} An object or collection of objects containing
    * key value pairs representing the current configuration of the filter.
    */
    getSerialArgs: function () {
        return { type: 'string', value: this.getValue() };
    },

    /**
    * Template method that is to validate the provided Ext.data.Record
    * against the filters configuration.
    * @param {Ext.data.Record} record The record to validate
    * @return {Boolean} true if the record is valid within the bounds
    * of the filter, false otherwise.
    */
    validateRecord: function (record) {
        var val = record.get(this.dataIndex);

        if (typeof val != 'string') {
            return (this.getValue().length === 0);
        }

        return val.toLowerCase().indexOf(this.getValue().toLowerCase()) > -1;
    },

    /**  
    * @private
    * Handler method called when there is a keyup event on this.inputItem
    */
    onInputKeyUp: function (field, e) {
        var k = e.getKey();
        if (k == e.RETURN && field.isValid()) {
            e.stopEvent();
            this.menu.hide(true);
            return;
        }
        // restart the timer
        this.updateTask.delay(this.updateBuffer);
    }
});

// end StringFilter
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// DateFilter

/** 
* @class Ext.ux.grid.filter.DateFilter
* @extends Ext.ux.grid.filter.Filter
* Filter by a configurable Ext.menu.DateMenu
* <p><b><u>Example Usage:</u></b></p>
* <pre><code>    
var filters = new Ext.ux.grid.GridFilters({
...
filters: [{
// required configs
type: 'date',
dataIndex: 'dateAdded',
        
// optional configs
dateFormat: 'm/d/Y',  // default
beforeText: 'Before', // default
afterText: 'After',   // default
onText: 'On',         // default
pickerOpts: {
// any DateMenu configs
},

active: true // default is false
}]
});
* </code></pre>
*/
Ext.ux.grid.filter.DateFilter = Ext.extend(Ext.ux.grid.filter.Filter, {
    /**
    * @cfg {String} afterText
    * Defaults to 'After'.
    */
    afterText: 'After',
    /**
    * @cfg {String} beforeText
    * Defaults to 'Before'.
    */
    beforeText: 'Before',
    /**
    * @cfg {Object} compareMap
    * Map for assigning the comparison values used in serialization.
    */
    compareMap: {
        before: 'lt',
        after: 'gt',
        on: 'eq'
    },
    /**
    * @cfg {String} dateFormat
    * The date format to return when using getValue.
    * Defaults to 'm/d/Y'.
    */
    dateFormat: 'm/d/Y',

    /**
    * @cfg {Date} maxDate
    * Allowable date as passed to the Ext.DatePicker
    * Defaults to undefined.
    */
    /**
    * @cfg {Date} minDate
    * Allowable date as passed to the Ext.DatePicker
    * Defaults to undefined.
    */
    /**
    * @cfg {Array} menuItems
    * The items to be shown in this menu
    * Defaults to:<pre>
    * menuItems : ['before', 'after', '-', 'on'],
    * </pre>
    */
    menuItems: ['before', 'after', '-', 'on'],

    /**
    * @cfg {Object} menuItemCfgs
    * Default configuration options for each menu item
    */
    menuItemCfgs: {
        selectOnFocus: true,
        width: 125
    },

    /**
    * @cfg {String} onText
    * Defaults to 'On'.
    */
    onText: 'On',

    /**
    * @cfg {Object} pickerOpts
    * Configuration options for the date picker associated with each field.
    */
    pickerOpts: {},

    /**  
    * @private
    * Template method that is to initialize the filter and install required menu items.
    */
    init: function (config) {
        var menuCfg, i, len, item, cfg, Cls;

        menuCfg = Ext.apply(this.pickerOpts, {
            minDate: this.minDate,
            maxDate: this.maxDate,
            format: this.dateFormat,
            listeners: {
                scope: this,
                select: this.onMenuSelect
            }
        });

        this.fields = {};
        for (i = 0, len = this.menuItems.length; i < len; i++) {
            item = this.menuItems[i];
            if (item !== '-') {
                cfg = {
                    itemId: 'range-' + item,
                    text: this[item + 'Text'],
                    menu: new Ext.menu.DateMenu(
                        Ext.apply(menuCfg, {
                            itemId: item
                        })
                    ),
                    listeners: {
                        scope: this,
                        checkchange: this.onCheckChange
                    }
                };
                Cls = Ext.menu.CheckItem;
                item = this.fields[item] = new Cls(cfg);
            }
            //this.add(item);
            this.menu.add(item);
        }
    },

    onCheckChange: function () {
        this.setActive(this.isActivatable());
        this.fireEvent('update', this);
    },

    /**  
    * @private
    * Handler method called when there is a keyup event on an input
    * item of this menu.
    */
    onInputKeyUp: function (field, e) {
        var k = e.getKey();
        if (k == e.RETURN && field.isValid()) {
            e.stopEvent();
            this.menu.hide(true);
            return;
        }
    },

    /**
    * Handler for when the menu for a field fires the 'select' event
    * @param {Object} date
    * @param {Object} menuItem
    * @param {Object} value
    * @param {Object} picker
    */
    onMenuSelect: function (menuItem, value, picker) {
        var fields = this.fields,
            field = this.fields[menuItem.itemId];

        field.setChecked(true);

        if (field == fields.on) {
            fields.before.setChecked(false, true);
            fields.after.setChecked(false, true);
        } else {
            fields.on.setChecked(false, true);
            if (field == fields.after && fields.before.menu.picker.value < value) {
                fields.before.setChecked(false, true);
            } else if (field == fields.before && fields.after.menu.picker.value > value) {
                fields.after.setChecked(false, true);
            }
        }
        this.fireEvent('update', this);
    },

    /**
    * @private
    * Template method that is to get and return the value of the filter.
    * @return {String} The value of this filter
    */
    getValue: function () {
        var key, result = {};
        for (key in this.fields) {
            if (this.fields[key].checked) {
                result[key] = this.fields[key].menu.picker.getValue();
            }
        }
        return result;
    },

    /**
    * @private
    * Template method that is to set the value of the filter.
    * @param {Object} value The value to set the filter
    * @param {Boolean} preserve true to preserve the checked status
    * of the other fields.  Defaults to false, unchecking the
    * other fields
    */
    setValue: function (value, preserve) {
        var key;
        for (key in this.fields) {
            if (value[key]) {
                this.fields[key].menu.picker.setValue(value[key]);
                this.fields[key].setChecked(true);
            } else if (!preserve) {
                this.fields[key].setChecked(false);
            }
        }
        this.fireEvent('update', this);
    },

    /**
    * @private
    * Template method that is to return <tt>true</tt> if the filter
    * has enough configuration information to be activated.
    * @return {Boolean}
    */
    isActivatable: function () {
        var key;
        for (key in this.fields) {
            if (this.fields[key].checked) {
                return true;
            }
        }
        return false;
    },

    /**
    * @private
    * Template method that is to get and return serialized filter data for
    * transmission to the server.
    * @return {Object/Array} An object or collection of objects containing
    * key value pairs representing the current configuration of the filter.
    */
    getSerialArgs: function () {
        var args = [];
        for (var key in this.fields) {
            if (this.fields[key].checked) {
                args.push({
                    type: 'date',
                    comparison: this.compareMap[key],
                    value: this.getFieldValue(key).format(this.dateFormat)
                });
            }
        }
        return args;
    },

    /**
    * Get and return the date menu picker value
    * @param {String} item The field identifier ('before', 'after', 'on')
    * @return {Date} Gets the current selected value of the date field
    */
    getFieldValue: function (item) {
        return this.fields[item].menu.picker.getValue();
    },

    /**
    * Gets the menu picker associated with the passed field
    * @param {String} item The field identifier ('before', 'after', 'on')
    * @return {Object} The menu picker
    */
    getPicker: function (item) {
        return this.fields[item].menu.picker;
    },

    /**
    * Template method that is to validate the provided Ext.data.Record
    * against the filters configuration.
    * @param {Ext.data.Record} record The record to validate
    * @return {Boolean} true if the record is valid within the bounds
    * of the filter, false otherwise.
    */
    validateRecord: function (record) {
        var key,
            pickerValue,
            val = record.get(this.dataIndex);

        if (!Ext.isDate(val)) {
            return false;
        }
        val = val.clearTime(true).getTime();

        for (key in this.fields) {
            if (this.fields[key].checked) {
                pickerValue = this.getFieldValue(key).clearTime(true).getTime();
                if (key == 'before' && pickerValue <= val) {
                    return false;
                }
                if (key == 'after' && pickerValue >= val) {
                    return false;
                }
                if (key == 'on' && pickerValue != val) {
                    return false;
                }
            }
        }
        return true;
    }
});

// end DateFilter
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// ListFilter

/** 
* @class Ext.ux.grid.filter.ListFilter
* @extends Ext.ux.grid.filter.Filter
* <p>List filters are able to be preloaded/backed by an Ext.data.Store to load
* their options the first time they are shown. ListFilter utilizes the
* {@link Ext.ux.menu.ListMenu} component.</p>
* <p>Although not shown here, this class accepts all configuration options
* for {@link Ext.ux.menu.ListMenu}.</p>
* 
* <p><b><u>Example Usage:</u></b></p>
* <pre><code>    
var filters = new Ext.ux.grid.GridFilters({
...
filters: [{
type: 'list',
dataIndex: 'size',
phpMode: true,
// options will be used as data to implicitly creates an ArrayStore
options: ['extra small', 'small', 'medium', 'large', 'extra large']
}]
});
* </code></pre>
* 
*/
Ext.ux.grid.filter.ListFilter = Ext.extend(Ext.ux.grid.filter.Filter, {

    /**
    * @cfg {Array} options
    * <p><code>data</code> to be used to implicitly create a data store
    * to back this list when the data source is <b>local</b>. If the
    * data for the list is remote, use the <code>{@link #store}</code>
    * config instead.</p>
    * <br><p>Each item within the provided array may be in one of the
    * following formats:</p>
    * <div class="mdetail-params"><ul>
    * <li><b>Array</b> :
    * <pre><code>
    options: [
    [11, 'extra small'], 
    [18, 'small'],
    [22, 'medium'],
    [35, 'large'],
    [44, 'extra large']
    ]
    * </code></pre>
    * </li>
    * <li><b>Object</b> :
    * <pre><code>
    labelField: 'name', // override default of 'text'
    options: [
    {id: 11, name:'extra small'}, 
    {id: 18, name:'small'}, 
    {id: 22, name:'medium'}, 
    {id: 35, name:'large'}, 
    {id: 44, name:'extra large'} 
    ]
    * </code></pre>
    * </li>
    * <li><b>String</b> :
    * <pre><code>
    * options: ['extra small', 'small', 'medium', 'large', 'extra large']
    * </code></pre>
    * </li>
    */
    /**
    * @cfg {Boolean} phpMode
    * <p>Adjust the format of this filter. Defaults to false.</p>
    * <br><p>When GridFilters <code>@cfg encode = false</code> (default):</p>
    * <pre><code>
    // phpMode == false (default):
    filter[0][data][type] list
    filter[0][data][value] value1
    filter[0][data][value] value2
    filter[0][field] prod 

    // phpMode == true:
    filter[0][data][type] list
    filter[0][data][value] value1, value2
    filter[0][field] prod 
    * </code></pre>
    * When GridFilters <code>@cfg encode = true</code>:
    * <pre><code>
    // phpMode == false (default):
    filter : [{"type":"list","value":["small","medium"],"field":"size"}]

    // phpMode == true:
    filter : [{"type":"list","value":"small,medium","field":"size"}]
    * </code></pre>
    */
    phpMode: false,
    /**
    * @cfg {Ext.data.Store} store
    * The {@link Ext.data.Store} this list should use as its data source
    * when the data source is <b>remote</b>. If the data for the list
    * is local, use the <code>{@link #options}</code> config instead.
    */

    /**  
    * @private
    * Template method that is to initialize the filter and install required menu items.
    * @param {Object} config
    */
    init: function (config) {
        this.dt = new Ext.util.DelayedTask(this.fireUpdate, this);

        // if a menu already existed, do clean up first
        if (this.menu) {
            this.menu.destroy();
        }
        this.menu = new Ext.ux.menu.ListMenu(config);
        this.menu.on('checkchange', this.onCheckChange, this);
    },

    /**
    * @private
    * Template method that is to get and return the value of the filter.
    * @return {String} The value of this filter
    */
    getValue: function () {
        return this.menu.getSelected();
    },
    /**
    * @private
    * Template method that is to set the value of the filter.
    * @param {Object} value The value to set the filter
    */
    setValue: function (value) {
        this.menu.setSelected(value);
        this.fireEvent('update', this);
    },

    /**
    * @private
    * Template method that is to return <tt>true</tt> if the filter
    * has enough configuration information to be activated.
    * @return {Boolean}
    */
    isActivatable: function () {
        return this.getValue().length > 0;
    },

    /**
    * @private
    * Template method that is to get and return serialized filter data for
    * transmission to the server.
    * @return {Object/Array} An object or collection of objects containing
    * key value pairs representing the current configuration of the filter.
    */
    getSerialArgs: function () {
        var args = { type: 'list', value: this.phpMode ? this.getValue().join(',') : this.getValue() };
        return args;
    },

    /** @private */
    onCheckChange: function () {
        this.dt.delay(this.updateBuffer);
    },


    /**
    * Template method that is to validate the provided Ext.data.Record
    * against the filters configuration.
    * @param {Ext.data.Record} record The record to validate
    * @return {Boolean} true if the record is valid within the bounds
    * of the filter, false otherwise.
    */
    validateRecord: function (record) {
        return this.getValue().indexOf(record.get(this.dataIndex)) > -1;
    }
});

// end ListFilter
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// NumericFilter

/** 
* @class Ext.ux.grid.filter.NumericFilter
* @extends Ext.ux.grid.filter.Filter
* Filters using an Ext.ux.menu.RangeMenu.
* <p><b><u>Example Usage:</u></b></p>
* <pre><code>    
var filters = new Ext.ux.grid.GridFilters({
...
filters: [{
type: 'numeric',
dataIndex: 'price'
}]
});
* </code></pre> 
*/
Ext.ux.grid.filter.NumericFilter = Ext.extend(Ext.ux.grid.filter.Filter, {

    /**
    * @cfg {Object} fieldCls
    * The Class to use to construct each field item within this menu
    * Defaults to:<pre>
    * fieldCls : Ext.form.NumberField
    * </pre>
    */
    fieldCls: Ext.form.NumberField,
    /**
    * @cfg {Object} fieldCfg
    * The default configuration options for any field item unless superseded
    * by the <code>{@link #fields}</code> configuration.
    * Defaults to:<pre>
    * fieldCfg : {}
    * </pre>
    * Example usage:
    * <pre><code>
    fieldCfg : {
    width: 150,
    },
    * </code></pre>
    */
    /**
    * @cfg {Object} fields
    * The field items may be configured individually
    * Defaults to <tt>undefined</tt>.
    * Example usage:
    * <pre><code>
    fields : {
    gt: { // override fieldCfg options
    width: 200,
    fieldCls: Ext.ux.form.CustomNumberField // to override default {@link #fieldCls}
    }
    },
    * </code></pre>
    */
    /**
    * @cfg {Object} iconCls
    * The iconCls to be applied to each comparator field item.
    * Defaults to:<pre>
    iconCls : {
    gt : 'ux-rangemenu-gt',
    lt : 'ux-rangemenu-lt',
    eq : 'ux-rangemenu-eq'
    }
    * </pre>
    */
    iconCls: {
        gt: 'ux-rangemenu-gt',
        lt: 'ux-rangemenu-lt',
        eq: 'ux-rangemenu-eq'
    },

    /**
    * @cfg {Object} menuItemCfgs
    * Default configuration options for each menu item
    * Defaults to:<pre>
    menuItemCfgs : {
    emptyText: 'Enter Filter Text...',
    selectOnFocus: true,
    width: 125
    }
    * </pre>
    */
    menuItemCfgs: {
        emptyText: 'Enter Filter Text...',
        selectOnFocus: true,
        width: 125
    },

    /**
    * @cfg {Array} menuItems
    * The items to be shown in this menu.  Items are added to the menu
    * according to their position within this array. Defaults to:<pre>
    * menuItems : ['lt','gt','-','eq']
    * </pre>
    */
    menuItems: ['lt', 'gt', '-', 'eq'],

    /**  
    * @private
    * Template method that is to initialize the filter and install required menu items.
    */
    init: function (config) {
        // if a menu already existed, do clean up first
        if (this.menu) {
            this.menu.destroy();
        }
        this.menu = new Ext.ux.menu.RangeMenu(Ext.apply(config, {
            // pass along filter configs to the menu
            fieldCfg: this.fieldCfg || {},
            fieldCls: this.fieldCls,
            fields: this.fields || {},
            iconCls: this.iconCls,
            menuItemCfgs: this.menuItemCfgs,
            menuItems: this.menuItems,
            updateBuffer: this.updateBuffer
        }));
        // relay the event fired by the menu
        this.menu.on('update', this.fireUpdate, this);
    },

    /**
    * @private
    * Template method that is to get and return the value of the filter.
    * @return {String} The value of this filter
    */
    getValue: function () {
        return this.menu.getValue();
    },

    /**
    * @private
    * Template method that is to set the value of the filter.
    * @param {Object} value The value to set the filter
    */
    setValue: function (value) {
        this.menu.setValue(value);
    },

    /**
    * @private
    * Template method that is to return <tt>true</tt> if the filter
    * has enough configuration information to be activated.
    * @return {Boolean}
    */
    isActivatable: function () {
        var values = this.getValue();
        for (key in values) {
            if (values[key] !== undefined) {
                return true;
            }
        }
        return false;
    },

    /**
    * @private
    * Template method that is to get and return serialized filter data for
    * transmission to the server.
    * @return {Object/Array} An object or collection of objects containing
    * key value pairs representing the current configuration of the filter.
    */
    getSerialArgs: function () {
        var key,
            args = [],
            values = this.menu.getValue();
        for (key in values) {
            args.push({
                type: 'numeric',
                comparison: key,
                value: values[key]
            });
        }
        return args;
    },

    /**
    * Template method that is to validate the provided Ext.data.Record
    * against the filters configuration.
    * @param {Ext.data.Record} record The record to validate
    * @return {Boolean} true if the record is valid within the bounds
    * of the filter, false otherwise.
    */
    validateRecord: function (record) {
        var val = record.get(this.dataIndex),
            values = this.getValue();
        if (values.eq !== undefined && val != values.eq) {
            return false;
        }
        if (values.lt !== undefined && val >= values.lt) {
            return false;
        }
        if (values.gt !== undefined && val <= values.gt) {
            return false;
        }
        return true;
    }
});

// end NumericFilter
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// BooleanFilter

/** 
* @class Ext.ux.grid.filter.BooleanFilter
* @extends Ext.ux.grid.filter.Filter
* Boolean filters use unique radio group IDs (so you can have more than one!)
* <p><b><u>Example Usage:</u></b></p>
* <pre><code>    
var filters = new Ext.ux.grid.GridFilters({
...
filters: [{
// required configs
type: 'boolean',
dataIndex: 'visible'

// optional configs
defaultValue: null, // leave unselected (false selected by default)
yesText: 'Yes',     // default
noText: 'No'        // default
}]
});
* </code></pre>
*/
Ext.ux.grid.filter.BooleanFilter = Ext.extend(Ext.ux.grid.filter.Filter, {
    /**
    * @cfg {Boolean} defaultValue
    * Set this to null if you do not want either option to be checked by default. Defaults to false.
    */
    defaultValue: false,
    /**
    * @cfg {String} yesText
    * Defaults to 'Yes'.
    */
    yesText: 'Yes',
    /**
    * @cfg {String} noText
    * Defaults to 'No'.
    */
    noText: 'No',

    /**  
    * @private
    * Template method that is to initialize the filter and install required menu items.
    */
    init: function (config) {
        var gId = Ext.id();
        this.options = [
			new Ext.menu.CheckItem({ text: this.yesText, group: gId, checked: this.defaultValue === true }),
			new Ext.menu.CheckItem({ text: this.noText, group: gId, checked: this.defaultValue === false })];

        this.menu.add(this.options[0], this.options[1]);

        for (var i = 0; i < this.options.length; i++) {
            this.options[i].on('click', this.fireUpdate, this);
            this.options[i].on('checkchange', this.fireUpdate, this);
        }
    },

    /**
    * @private
    * Template method that is to get and return the value of the filter.
    * @return {String} The value of this filter
    */
    getValue: function () {
        return this.options[0].checked;
    },

    /**
    * @private
    * Template method that is to set the value of the filter.
    * @param {Object} value The value to set the filter
    */
    setValue: function (value) {
        this.options[value ? 0 : 1].setChecked(true);
    },

    /**
    * @private
    * Template method that is to get and return serialized filter data for
    * transmission to the server.
    * @return {Object/Array} An object or collection of objects containing
    * key value pairs representing the current configuration of the filter.
    */
    getSerialArgs: function () {
        var args = { type: 'boolean', value: this.getValue() };
        return args;
    },

    /**
    * Template method that is to validate the provided Ext.data.Record
    * against the filters configuration.
    * @param {Ext.data.Record} record The record to validate
    * @return {Boolean} true if the record is valid within the bounds
    * of the filter, false otherwise.
    */
    validateRecord: function (record) {
        return record.get(this.dataIndex) == this.getValue();
    }
});

// end BooleanFilter
////////////////////////////////////////////////////////////////////////////////

/******* RowExpander.js *******/

/**
 * @class Ext.ux.grid.RowExpander
 * @extends Ext.util.Observable
 * Plugin (ptype = 'rowexpander') that adds the ability to have a Column in a grid which enables
 * a second row body which expands/contracts.  The expand/contract behavior is configurable to react
 * on clicking of the column, double click of the row, and/or hitting enter while a row is selected.
 *
 * @ptype rowexpander
 */
Ext.ux.grid.RowExpander = Ext.extend(Ext.util.Observable, {
    /**
     * @cfg {Boolean} expandOnEnter
     * <tt>true</tt> to toggle selected row(s) between expanded/collapsed when the enter
     * key is pressed (defaults to <tt>true</tt>).
     */
    expandOnEnter : true,
    /**
     * @cfg {Boolean} expandOnDblClick
     * <tt>true</tt> to toggle a row between expanded/collapsed when double clicked
     * (defaults to <tt>true</tt>).
     */
    expandOnDblClick : true,

    header : '',
    width : 20,
    sortable : false,
    fixed : true,
    menuDisabled : true,
    dataIndex : '',
    id : 'expander',
    lazyRender : true,
    enableCaching : true,

    constructor: function(config){
        Ext.apply(this, config);

        this.addEvents({
            /**
             * @event beforeexpand
             * Fires before the row expands. Have the listener return false to prevent the row from expanding.
             * @param {Object} this RowExpander object.
             * @param {Object} Ext.data.Record Record for the selected row.
             * @param {Object} body body element for the secondary row.
             * @param {Number} rowIndex The current row index.
             */
            beforeexpand: true,
            /**
             * @event expand
             * Fires after the row expands.
             * @param {Object} this RowExpander object.
             * @param {Object} Ext.data.Record Record for the selected row.
             * @param {Object} body body element for the secondary row.
             * @param {Number} rowIndex The current row index.
             */
            expand: true,
            /**
             * @event beforecollapse
             * Fires before the row collapses. Have the listener return false to prevent the row from collapsing.
             * @param {Object} this RowExpander object.
             * @param {Object} Ext.data.Record Record for the selected row.
             * @param {Object} body body element for the secondary row.
             * @param {Number} rowIndex The current row index.
             */
            beforecollapse: true,
            /**
             * @event collapse
             * Fires after the row collapses.
             * @param {Object} this RowExpander object.
             * @param {Object} Ext.data.Record Record for the selected row.
             * @param {Object} body body element for the secondary row.
             * @param {Number} rowIndex The current row index.
             */
            collapse: true,
            /**
             * @event bodycontent
             * Fires after body content is built. 
             * Use this event to perform last twicks to body content.
             * @param {Object} this RowExpander object.
             * @param {Object} Ext.data.Record Record for the selected row.
             * @param {Object} data data object containing single field content = body content.
             * Type - string. You may change this field.
             * @param {Number} rowIndex The current row index.
             */
            bodycontent: true
        });

        Ext.ux.grid.RowExpander.superclass.constructor.call(this);

        if(this.tpl){
            if(typeof this.tpl == 'string'){
                this.tpl = new Ext.Template(this.tpl);
            }
            this.tpl.compile();
        }

        this.state = {};
        this.bodyContent = {};
    },

    getRowClass : function(record, rowIndex, p, ds){
        p.cols = p.cols-1;
        var content = this.bodyContent[record.id];
        if(!content && !this.lazyRender){
            content = this.getBodyContent(record, rowIndex);
        }
        if(content){
            p.body = content;
        }
        return this.state[record.id] ? 'x-grid3-row-expanded' : 'x-grid3-row-collapsed';
    },

    init : function(grid){
        this.grid = grid;

        var view = grid.getView();
        view.getRowClass = this.getRowClass.createDelegate(this);

        view.enableRowBody = true;


        grid.on('render', this.onRender, this);
        grid.on('destroy', this.onDestroy, this);
    },

    // @private
    onRender: function() {
        var grid = this.grid;
        var mainBody = grid.getView().mainBody;
        mainBody.on('mousedown', this.onMouseDown, this, {delegate: '.x-grid3-row-expander'});
        if (this.expandOnEnter) {
            this.keyNav = new Ext.KeyNav(this.grid.getGridEl(), {
                'enter' : this.onEnter,
                scope: this
            });
        }
        if (this.expandOnDblClick) {
            grid.on('rowdblclick', this.onRowDblClick, this);
        }
    },
    
    // @private    
    onDestroy: function() {
        if(this.keyNav){
            this.keyNav.disable();
            delete this.keyNav;
        }
        /*
         * A majority of the time, the plugin will be destroyed along with the grid,
         * which means the mainBody won't be available. On the off chance that the plugin
         * isn't destroyed with the grid, take care of removing the listener.
         */
        var mainBody = this.grid.getView().mainBody;
        if(mainBody){
            mainBody.un('mousedown', this.onMouseDown, this);
        }
    },
    // @private
    onRowDblClick: function(grid, rowIdx, e) {
        //this.toggleRow(rowIdx);
        this.expandRow(rowIdx);
    },

    onEnter: function (e) {
        var me = this, g = me.grid, rowIdx, store, sm, sels;
        if (g) {
            sm = g.getSelectionModel();
            if (sm) {
                store = g.getStore();
                sels = sm.getSelections();
                for (var i = 0, len = sels.length; i < len; i++) {
                    rowIdx = store.indexOf(sels[i]);
                    if (rowIdx >= 0) {
                        me.toggleRow(rowIdx);
                    }
                }
            }
        }
    },

    getBodyContent : function(record, index){
        var content;
        if(!this.enableCaching){
            content = this.tpl.apply(record.data);
            var data = {content: content};
            this.fireEvent('bodycontent', this, record, data, index);
            return data.content;
        }
        content = this.bodyContent[record.id];
        if(!content){
            content = this.tpl.apply(record.data);
            var data = {content: content};
            this.fireEvent('bodycontent', this, record, data, index);
            content = data.content;
            this.bodyContent[record.id] = content;
        }
        return content;
    },

    onMouseDown : function(e, t){
        e.stopEvent();
        var row = e.getTarget('.x-grid3-row');
        this.toggleRow(row);
    },

    renderer : function(v, p, record){
        p.cellAttr = 'rowspan="2"';
        return '<div class="x-grid3-row-expander">&#160;</div>';
    },

    beforeExpand : function(record, body, rowIndex){
        if(this.fireEvent('beforeexpand', this, record, body, rowIndex) !== false){
            if(this.tpl && this.lazyRender){
                body.innerHTML = this.getBodyContent(record, rowIndex);
            }
            return true;
        }else{
            return false;
        }
    },

    toggleRow : function(row){
        if(typeof row == 'number'){
            row = this.grid.view.getRow(row);
        }
        this[Ext.fly(row).hasClass('x-grid3-row-collapsed') ? 'expandRow' : 'collapseRow'](row);
    },

    expandRow : function(row){
        if(typeof row == 'number'){
            row = this.grid.view.getRow(row);
        }
        var record = this.grid.store.getAt(row.rowIndex);
        var body = Ext.DomQuery.selectNode('tr:nth(2) div.x-grid3-row-body', row);
        if(this.beforeExpand(record, body, row.rowIndex)){
            this.state[record.id] = true;
            Ext.fly(row).replaceClass('x-grid3-row-collapsed', 'x-grid3-row-expanded');
            this.fireEvent('expand', this, record, body, row.rowIndex);
        }
    },

    collapseRow : function(row){
        if(typeof row == 'number'){
            row = this.grid.view.getRow(row);
        }
        var record = this.grid.store.getAt(row.rowIndex);
        var body = Ext.fly(row).child('tr:nth(1) div.x-grid3-row-body', true);
        if(this.fireEvent('beforecollapse', this, record, body, row.rowIndex) !== false){
            this.state[record.id] = false;
            Ext.fly(row).replaceClass('x-grid3-row-expanded', 'x-grid3-row-collapsed');
            this.fireEvent('collapse', this, record, body, row.rowIndex);
        }
    }
});

Ext.preg('rowexpander', Ext.ux.grid.RowExpander);

//backwards compat
Ext.grid.RowExpander = Ext.ux.grid.RowExpander;

/******* GridDragDropRowOrder.js *******/

Ext.ns('Ext.ux.dd');
/**
 * Plugin for a Grid that allows the rows to be re-ordered by dragging and dropping.
 * The code is taken from http://www.sencha.com/forum/showthread.php?21913-SOLVED-Grid-Drag-and-Drop-reorder-rows
 */
Ext.ux.dd.GridDragDropRowOrder = Ext.extend(Ext.util.Observable, {
    copy: false,
    scrollable: true,
    constructor: function(config) {
        if (config)
            Ext.apply(this, config);
        this.addEvents({
            beforerowmove: true,
            afterrowmove: true,
            beforerowcopy: true,
            afterrowcopy: true
        });
        Ext.ux.dd.GridDragDropRowOrder.superclass.constructor.call(this);
    },
    init: function (grid) {
        this.grid = grid;
        grid.enableDragDrop = true;
        grid.on({
            render: { fn: this.onGridRender, scope: this, single: true }
        });
    },
    onGridRender: function (grid) {
        var self = this;
        this.target = new Ext.dd.DropTarget(grid.getEl(), {
            ddGroup: grid.ddGroup || 'GridDD',
            grid: grid,
            gridDropTarget: this,
            notifyDrop: function(dd, e, data) {
                // Remove drag lines. The 'if' condition prevents null error when drop occurs without dragging out of the selection area
                if (this.currentRowEl) {
                    this.currentRowEl.removeClass('grid-row-insert-below');
                    this.currentRowEl.removeClass('grid-row-insert-above');
                }
                // determine the row
                var t = Ext.lib.Event.getTarget(e);
                var rindex = this.grid.getView().findRowIndex(t);
                if (rindex === false || rindex == data.rowIndex) {
                    return false;
                }
                // fire the before move/copy event
                if (this.gridDropTarget.fireEvent(self.copy ? 'beforerowcopy' : 'beforerowmove', this.gridDropTarget, data.rowIndex, rindex, data.selections, 123) === false) {
                    return false;
                }
                // update the store
                var ds = this.grid.getStore();
                // Changes for multiselction by Spirit
                var selections = new Array();
                var keys = ds.data.keys;
                for (var key in keys) {
                    for (var i = 0; i < data.selections.length; i++) {
                        if (keys[key] == data.selections[i].id) {
                            // Exit to prevent drop of selected records on itself.
                            if (rindex == key) {
                                return false;
                            }
                            selections.push(data.selections[i]);
                        }
                    }
                }
                // fix rowindex based on before/after move
                if (rindex > data.rowIndex && this.rowPosition < 0) {
                    rindex--;
                }
                if (rindex < data.rowIndex && this.rowPosition > 0) {
                    rindex++;
                }
                // fix rowindex for multiselection
                if (rindex > data.rowIndex && data.selections.length > 1) {
                    rindex = rindex - (data.selections.length - 1);
                }
                // we tried to move this node before the next sibling, we stay in place
                if (rindex == data.rowIndex) {
                    return false;
                }
                // fire the before move/copy event
                /* dupe - does it belong here or above???
                if (this.gridDropTarget.fireEvent(self.copy ? 'beforerowcopy' : 'beforerowmove', this.gridDropTarget, data.rowIndex, rindex, data.selections, 123) === false) {
                    return false;
                }
                */
                if (!self.copy) {
                    for (var i = 0; i < data.selections.length; i++) {
                        ds.remove(ds.getById(data.selections[i].id));
                    }
                }
                for (var i = selections.length - 1; i >= 0; i--) {
                    var insertIndex = rindex;
                    ds.insert(insertIndex, selections[i]);
                }
                // re-select the row(s)
                var sm = this.grid.getSelectionModel();
                if (sm) {
                    sm.selectRecords(data.selections);
                }
                // fire the after move/copy event
                this.gridDropTarget.fireEvent(self.copy ? 'afterrowcopy' : 'afterrowmove', this.gridDropTarget, data.rowIndex, rindex, data.selections);
                return true;
            },
            notifyOver: function(dd, e, data) {
                var t = Ext.lib.Event.getTarget(e);
                var rindex = this.grid.getView().findRowIndex(t);
                // Similar to the code in notifyDrop. Filters for selected rows and quits function if any one row matches the current selected row.
                var ds = this.grid.getStore();
                var keys = ds.data.keys;
                for (var key in keys) {
                    for (var i = 0; i < data.selections.length; i++) {
                        if (keys[key] == data.selections[i].id) {
                            if (rindex == key) {
                                if (this.currentRowEl) {
                                    this.currentRowEl.removeClass('grid-row-insert-below');
                                    this.currentRowEl.removeClass('grid-row-insert-above');
                                }
                                return this.dropNotAllowed;
                            }
                        }
                    }
                }
                // If on first row, remove upper line. Prevents negative index error as a result of rindex going negative.
                if (rindex < 0 || rindex === false) {
                    this.currentRowEl.removeClass('grid-row-insert-above');
                    return this.dropNotAllowed;
                }
                try {
                    var currentRow = this.grid.getView().getRow(rindex);
                    // Find position of row relative to page (adjusting for grid's scroll position)
                    var resolvedRow = new Ext.Element(currentRow).getY() - this.grid.getView().scroller.dom.scrollTop;
                    var rowHeight = currentRow.offsetHeight;

                    // Cursor relative to a row. -ve value implies cursor is above the row's middle and +ve value implues cursor is below the row's middle.
                    this.rowPosition = e.getPageY() - resolvedRow - (rowHeight/2);

                    // Clear drag line.
                    if (this.currentRowEl) {
                        this.currentRowEl.removeClass('grid-row-insert-below');
                        this.currentRowEl.removeClass('grid-row-insert-above');
                    }
                    if (this.rowPosition > 0) {
                        // If the pointer is on the bottom half of the row.
                        this.currentRowEl = new Ext.Element(currentRow);
                        this.currentRowEl.addClass('grid-row-insert-below');
                    }
                    else {
                        // If the pointer is on the top half of the row.
                        if (rindex - 1 >= 0) {
                            var previousRow = this.grid.getView().getRow(rindex - 1);
                            this.currentRowEl = new Ext.Element(previousRow);
                            this.currentRowEl.addClass('grid-row-insert-below');
                        }
                        else {
                            // If the pointer is on the top half of the first row.
                            this.currentRowEl.addClass('grid-row-insert-above');
                        }
                    }
                }
                catch (err) {
                    if (!!window.console && !!window.console.warn) {
                        window.console.warn(err);
                    }
                    rindex = false;
                }
                return (rindex === false)? this.dropNotAllowed : this.dropAllowed;
            },
            notifyOut: function(dd, e, data) {
                // Remove drag lines when pointer leaves the gridView.
                if (this.currentRowEl) {
                    this.currentRowEl.removeClass('grid-row-insert-above');
                    this.currentRowEl.removeClass('grid-row-insert-below');
                }
            }
        });
        if (this.targetCfg) {
            Ext.apply(this.target, this.targetCfg);
        }
        if (this.scrollable) {
            Ext.dd.ScrollManager.register(grid.getView().getEditorParent());
            grid.on({
                beforedestroy: this.onBeforeDestroy,
                scope: this,
                single: true
            });
        }
    },
    getTarget: function() {
        return this.target;
    },
    getGrid: function() {
        return this.grid;
    },
    getCopy: function() {
        return this.copy ? true : false;
    },
    setCopy: function(b) {
        this.copy = b ? true : false;
    },
    onBeforeDestroy : function (grid) {
        // if we previously registered with the scroll manager, unregister
        // it (if we don't it will lead to problems in IE)
        Ext.dd.ScrollManager.unregister(grid.getView().getEditorParent());
    }
});

/** SUPERBOXSELECT component */

/**
* <p>SuperBoxSelect is an extension of the ComboBox component that displays selected items as labelled boxes within the form field. As seen on facebook, hotmail and other sites.</p>
* 
* @author <a href="mailto:dan.humphrey@technomedia.co.uk">Dan Humphrey</a>
* @class Ext.ux.form.SuperBoxSelect
* @extends Ext.form.ComboBox
* @constructor
* @component
* @version 1.0
* @license TBA (To be announced)
* 
*/
Ext.ux.form.SuperBoxSelect = function (config) {
    Ext.ux.form.SuperBoxSelect.superclass.constructor.call(this, config);
    this.addEvents(
    /**
    * Fires before an item is added to the component via user interaction. Return false from the callback function to prevent the item from being added.
    * @event beforeadditem
    * @memberOf Ext.ux.form.SuperBoxSelect
    * @param {SuperBoxSelect} this
    * @param {Mixed} value The value of the item to be added
    * @param {Record} rec The record being added
    * @param {Mixed} filtered Any filtered query data (if using queryFilterRe)
    */
        'beforeadditem',

    /**
    * Fires after a new item is added to the component.
    * @event additem
    * @memberOf Ext.ux.form.SuperBoxSelect
    * @param {SuperBoxSelect} this
    * @param {Mixed} value The value of the item which was added
    * @param {Record} record The store record which was added
    */
        'additem',

    /**
    * Fires when the allowAddNewData config is set to true, and a user attempts to add an item that is not in the data store.
    * @event newitem
    * @memberOf Ext.ux.form.SuperBoxSelect
    * @param {SuperBoxSelect} this
    * @param {Mixed} value The new item's value
    * @param {Mixed} filtered Any filtered query data (if using queryFilterRe)
    */
        'newitem',

    /**
    * Fires when an item's remove button is clicked. Return false from the callback function to prevent the item from being removed.
    * @event beforeremoveitem
    * @memberOf Ext.ux.form.SuperBoxSelect
    * @param {SuperBoxSelect} this
    * @param {Mixed} value The value of the item to be removed
    */
        'beforeremoveitem',

    /**
    * Fires after an item has been removed.
    * @event removeitem
    * @memberOf Ext.ux.form.SuperBoxSelect
    * @param {SuperBoxSelect} this
    * @param {Mixed} value The value of the item which was removed
    * @param {Record} record The store record which was removed
    */
        'removeitem',
    /**
    * Fires after the component values have been cleared.
    * @event clear
    * @memberOf Ext.ux.form.SuperBoxSelect
    * @param {SuperBoxSelect} this
    */
        'clear'
    );

};
/**
* @private hide from doc gen
*/
Ext.ux.form.SuperBoxSelect = Ext.extend(Ext.ux.form.SuperBoxSelect, Ext.form.ComboBox, {
    /**
    * @cfg {Boolean} addNewDataOnBlur Allows adding new items when the user tabs from the input element.
    */
    addNewDataOnBlur: false,
    /**
    * @cfg {Boolean} allowAddNewData When set to true, allows items to be added (via the setValueEx and addItem methods) that do not already exist in the data store. Defaults to false.
    */
    allowAddNewData: false,
    /**
    * @cfg {Boolean} allowQueryAll When set to false, prevents the trigger arrow from rendering, and the DOWN key from triggering a query all. Defaults to true.
    */
    allowQueryAll: true,
    /**
    * @cfg {Boolean} backspaceDeletesLastItem When set to false, the BACKSPACE key will focus the last selected item. When set to true, the last item will be immediately deleted. Defaults to true.
    */
    backspaceDeletesLastItem: true,
    /**
    * @cfg {String} classField The underlying data field that will be used to supply an additional class to each item.
    */
    classField: null,

    /**
    * @cfg {String} clearBtnCls An additional class to add to the in-field clear button.
    */
    clearBtnCls: '',
    /**
    * @cfg {Boolean} clearLastQueryOnEscape When set to true, the escape key will clear the lastQuery, enabling the previous query to be repeated. 
    */
    clearLastQueryOnEscape: false,
    /**
    * @cfg {Boolean} clearOnEscape When set to true, the escape key will clear the input text when the component is not expanded.
    */
    clearOnEscape: false,

    /**
    * @cfg {String/XTemplate} displayFieldTpl A template for rendering the displayField in each selected item. Defaults to null.
    */
    displayFieldTpl: null,

    /**
    * @cfg {String} extraItemCls An additional css class to apply to each item.
    */
    extraItemCls: '',

    /**
    * @cfg {String/Object/Function} extraItemStyle Additional css style(s) to apply to each item. Should be a valid argument to Ext.Element.applyStyles.
    */
    extraItemStyle: '',

    /**
    * @cfg {String} expandBtnCls An additional class to add to the in-field expand button.
    */
    expandBtnCls: '',

    /**
    * @cfg {Boolean} fixFocusOnTabSelect When set to true, the component will not lose focus when a list item is selected with the TAB key. Defaults to true.
    */
    fixFocusOnTabSelect: true,
    /**
    * @cfg {Boolean} forceFormValue When set to true, the component will always return a value to the parent form getValues method, and when the parent form is submitted manually. Defaults to false, meaning the component will only be included in the parent form submission (or getValues) if at least 1 item has been selected.  
    */
    forceFormValue: true,
    /**
    * @cfg {Boolean} forceSameValueQuery When set to true, the component will always query the server even when the last query was the same. Defaults to false.  
    */
    forceSameValueQuery: false,
    /**
    * @cfg {Number} itemDelimiterKey A key code which terminates keying in of individual items, and adds the current
    * item to the list. Defaults to the ENTER key.
    */
    itemDelimiterKey: Ext.EventObject.ENTER,
    /**
    * @cfg {Boolean} navigateItemsWithTab When set to true the tab key will navigate between selected items. Defaults to true.
    */
    navigateItemsWithTab: true,
    /**
    * @cfg {Boolean} pinList When set to true and the list is opened via the arrow button, the select list will be pinned to allow for multiple selections. Defaults to true.
    */
    pinList: true,

    /**
    * @cfg {Boolean} preventDuplicates When set to true unique item values will be enforced. Defaults to true.
    */
    preventDuplicates: true,
    /**
    * @cfg {String|Regex} queryFilterRe Used to filter input values before querying the server, specifically useful when allowAddNewData is true as the filtered portion of the query will be passed to the newItem callback.
    */
    queryFilterRe: '',
    /**
    * @cfg {String} queryValuesDelimiter Used to delimit multiple values queried from the server when mode is remote.
    */
    queryValuesDelimiter: '|',

    /**
    * @cfg {String} queryValuesIndicator A request variable that is sent to the server (as true) to indicate that we are querying values rather than display data (as used in autocomplete) when mode is remote.
    */
    queryValuesIndicator: 'valuesqry',

    /**
    * @cfg {Boolean} removeValuesFromStore When set to true, selected records will be removed from the store. Defaults to true.
    */
    removeValuesFromStore: true,

    /**
    * @cfg {String} renderFieldBtns When set to true, will render in-field buttons for clearing the component, and displaying the list for selection. Defaults to true.
    */
    renderFieldBtns: true,

    /**
    * @cfg {Boolean} stackItems When set to true, the items will be stacked 1 per line. Defaults to false which displays the items inline.
    */
    stackItems: false,

    /**
    * @cfg {String} styleField The underlying data field that will be used to supply additional css styles to each item.
    */
    styleField: null,

    /**
    * @cfg {Boolean} supressClearValueRemoveEvents When true, the removeitem event will not be fired for each item when the clearValue method is called, or when the clear button is used. Defaults to false.
    */
    supressClearValueRemoveEvents: false,

    /**
    * @cfg {String/Boolean} validationEvent The event that should initiate field validation. Set to false to disable automatic validation (defaults to 'blur').
    */
    validationEvent: 'blur',

    /**
    * @cfg {String} valueDelimiter The delimiter to use when joining and splitting value arrays and strings.
    */
    valueDelimiter: ',',
    initComponent: function () {
        Ext.apply(this, {
            items: new Ext.util.MixedCollection(false),
            usedRecords: new Ext.util.MixedCollection(false),
            addedRecords: [],
            remoteLookup: [],
            hideTrigger: true,
            grow: false,
            resizable: false,
            multiSelectMode: false,
            preRenderValue: null,
            filteredQueryData: ''

        });
        if (this.queryFilterRe) {
            if (Ext.isString(this.queryFilterRe)) {
                this.queryFilterRe = new RegExp(this.queryFilterRe);
            }
        }
        if (this.transform) {
            this.doTransform();
        }
        if (this.forceFormValue) {
            this.items.on({
                add: this.manageNameAttribute,
                remove: this.manageNameAttribute,
                clear: this.manageNameAttribute,
                scope: this
            });
        }

        Ext.ux.form.SuperBoxSelect.superclass.initComponent.call(this);
        if (this.mode === 'remote' && this.store) {
            this.store.on('load', this.onStoreLoad, this);
        }
    },
    onRender: function (ct, position) {
        var h = this.hiddenName;
        this.hiddenName = null;
        Ext.ux.form.SuperBoxSelect.superclass.onRender.call(this, ct, position);
        this.hiddenName = h;
        this.manageNameAttribute();

        var extraClass = (this.stackItems === true) ? 'x-superboxselect-stacked' : '';
        if (this.renderFieldBtns) {
            extraClass += ' x-superboxselect-display-btns';
        }
        this.el.removeClass('x-form-text').addClass('x-superboxselect-input-field');

        this.wrapEl = this.el.wrap({
            tag: 'ul'
        });

        this.outerWrapEl = this.wrapEl.wrap({
            tag: 'div',
            cls: 'x-form-text x-superboxselect ' + extraClass
        });

        this.inputEl = this.el.wrap({
            tag: 'li',
            cls: 'x-superboxselect-input'
        });

        if (this.renderFieldBtns) {
            this.setupFieldButtons().manageClearBtn();
        }

        this.setupFormInterception();
    },
    doTransform: function () {
        var s = Ext.getDom(this.transform), transformValues = [];
        if (!this.store) {
            this.mode = 'local';
            var d = [], opts = s.options;
            for (var i = 0, len = opts.length; i < len; i++) {
                var o = opts[i], oe = Ext.get(o),
                        value = oe.getAttributeNS(null, 'value') || '',
                        cls = oe.getAttributeNS(null, 'className') || '',
                        style = oe.getAttributeNS(null, 'style') || '';
                if (o.selected) {
                    transformValues.push(value);
                }
                d.push([value, o.text, cls, typeof (style) === "string" ? style : style.cssText]);
            }
            this.store = new Ext.data.SimpleStore({
                'id': 0,
                fields: ['value', 'text', 'cls', 'style'],
                data: d
            });
            Ext.apply(this, {
                valueField: 'value',
                displayField: 'text',
                classField: 'cls',
                styleField: 'style'
            });
        }

        if (transformValues.length) {
            this.value = transformValues.join(',');
        }
    },
    setupFieldButtons: function () {
        this.buttonWrap = this.outerWrapEl.createChild({
            cls: 'x-superboxselect-btns'
        });

        this.buttonClear = this.buttonWrap.createChild({
            tag: 'div',
            cls: 'x-superboxselect-btn-clear ' + this.clearBtnCls
        });

        if (this.allowQueryAll) {
            this.buttonExpand = this.buttonWrap.createChild({
                tag: 'div',
                cls: 'x-superboxselect-btn-expand ' + this.expandBtnCls
            });
        }

        this.initButtonEvents();

        return this;
    },
    initButtonEvents: function () {
        this.buttonClear.addClassOnOver('x-superboxselect-btn-over').on('click', function (e) {
            e.stopEvent();
            if (this.disabled) {
                return;
            }
            this.clearValue();
            this.el.focus();
        }, this);

        if (this.allowQueryAll) {
            this.buttonExpand.addClassOnOver('x-superboxselect-btn-over').on('click', function (e) {
                e.stopEvent();
                if (this.disabled) {
                    return;
                }
                if (this.isExpanded()) {
                    this.multiSelectMode = false;
                } else if (this.pinList) {
                    this.multiSelectMode = true;
                }
                this.onTriggerClick();
            }, this);
        }
    },
    removeButtonEvents: function () {
        this.buttonClear.removeAllListeners();
        if (this.allowQueryAll) {
            this.buttonExpand.removeAllListeners();
        }
        return this;
    },
    clearCurrentFocus: function () {
        if (this.currentFocus) {
            this.currentFocus.onLnkBlur();
            this.currentFocus = null;
        }
        return this;
    },
    initEvents: function () {
        var el = this.el;
        el.on({
            click: this.onClick,
            focus: this.clearCurrentFocus,
            blur: this.onBlur,
            keydown: this.onKeyDownHandler,
            keyup: this.onKeyUpBuffered,
            scope: this
        });

        this.on({
            collapse: this.onCollapse,
            expand: this.clearCurrentFocus,
            scope: this
        });

        this.wrapEl.on('click', this.onWrapClick, this);
        this.outerWrapEl.on('click', this.onWrapClick, this);

        this.inputEl.focus = function () {
            el.focus();
        };

        Ext.ux.form.SuperBoxSelect.superclass.initEvents.call(this);

        Ext.apply(this.keyNav, {
            tab: function (e) {
                if (this.fixFocusOnTabSelect && this.isExpanded()) {
                    e.stopEvent();
                    el.blur();
                    this.onViewClick(false);
                    this.focus(false, 10);
                    return true;
                }

                this.onViewClick(false);
                if (el.dom.value !== '') {
                    this.setRawValue('');
                }

                return true;
            },

            down: function (e) {
                if (!this.isExpanded() && !this.currentFocus) {
                    if (this.allowQueryAll) {
                        this.onTriggerClick();
                    }
                } else {
                    this.inKeyMode = true;
                    this.selectNext();
                }
            },

            enter: function () { }
        });
    },

    onClick: function () {
        this.clearCurrentFocus();
        this.collapse();
        this.autoSize();
    },

    beforeBlur: function () {
        if (this.allowAddNewData && this.addNewDataOnBlur) {
            var v = this.el.dom.value;
            if (v.trim().length > 0) {
                this.fireNewItemEvent(v);
            }
        }
        Ext.form.ComboBox.superclass.beforeBlur.call(this);
    },

    onFocus: function () {
        this.outerWrapEl.addClass(this.focusClass);

        Ext.ux.form.SuperBoxSelect.superclass.onFocus.call(this);
    },

    onBlur: function () {
        this.outerWrapEl.removeClass(this.focusClass);

        this.clearCurrentFocus();

        var v = this.el.dom.value;

        if (v !== '') {
            if (v.trim().length > 0 && this.allowAddNewData && this.addNewDataOnBlur) {
                this.fireNewItemEvent(v);
            } else {
                this.applyEmptyText();
                this.autoSize();
            }
        }

        Ext.ux.form.SuperBoxSelect.superclass.onBlur.call(this);
    },

    onCollapse: function () {
        this.view.clearSelections();
        this.multiSelectMode = false;
    },

    onWrapClick: function (e) {
        e.stopEvent();
        this.collapse();
        this.el.focus();
        this.clearCurrentFocus();
    },
    markInvalid: function (msg) {
        var elp, t;

        if (!this.rendered || this.preventMark) {
            return;
        }
        this.outerWrapEl.addClass(this.invalidClass);
        msg = msg || this.invalidText;

        switch (this.msgTarget) {
            case 'qtip':
                Ext.apply(this.el.dom, {
                    qtip: msg,
                    qclass: 'x-form-invalid-tip'
                });
                Ext.apply(this.wrapEl.dom, {
                    qtip: msg,
                    qclass: 'x-form-invalid-tip'
                });
                if (Ext.QuickTips) { // fix for floating editors interacting with DND
                    Ext.QuickTips.enable();
                }
                break;
            case 'title':
                this.el.dom.title = msg;
                this.wrapEl.dom.title = msg;
                this.outerWrapEl.dom.title = msg;
                break;
            case 'under':
                if (!this.errorEl) {
                    elp = this.getErrorCt();
                    if (!elp) { // field has no container el
                        this.el.dom.title = msg;
                        break;
                    }
                    this.errorEl = elp.createChild({ cls: 'x-form-invalid-msg' });
                    this.errorEl.setWidth(elp.getWidth(true) - 20);
                }
                this.errorEl.update(msg);
                Ext.form.Field.msgFx[this.msgFx].show(this.errorEl, this);
                break;
            case 'side':
                if (!this.errorIcon) {
                    elp = this.getErrorCt();
                    if (!elp) { // field has no container el
                        this.el.dom.title = msg;
                        break;
                    }
                    this.errorIcon = elp.createChild({ cls: 'x-form-invalid-icon' });
                }
                this.alignErrorIcon();
                Ext.apply(this.errorIcon.dom, {
                    qtip: msg,
                    qclass: 'x-form-invalid-tip'
                });
                this.errorIcon.show();
                this.on('resize', this.alignErrorIcon, this);
                break;
            default:
                t = Ext.getDom(this.msgTarget);
                t.innerHTML = msg;
                t.style.display = this.msgDisplay;
                break;
        }
        this.fireEvent('invalid', this, msg);
    },
    clearInvalid: function () {
        if (!this.rendered || this.preventMark) { // not rendered
            return;
        }
        this.outerWrapEl.removeClass(this.invalidClass);
        switch (this.msgTarget) {
            case 'qtip':
                this.el.dom.qtip = '';
                this.wrapEl.dom.qtip = '';
                break;
            case 'title':
                this.el.dom.title = '';
                this.wrapEl.dom.title = '';
                this.outerWrapEl.dom.title = '';
                break;
            case 'under':
                if (this.errorEl) {
                    Ext.form.Field.msgFx[this.msgFx].hide(this.errorEl, this);
                }
                break;
            case 'side':
                if (this.errorIcon) {
                    this.errorIcon.dom.qtip = '';
                    this.errorIcon.hide();
                    this.un('resize', this.alignErrorIcon, this);
                }
                break;
            default:
                var t = Ext.getDom(this.msgTarget);
                t.innerHTML = '';
                t.style.display = 'none';
                break;
        }
        this.fireEvent('valid', this);
    },
    alignErrorIcon: function () {
        if (this.wrap) {
            this.errorIcon.alignTo(this.wrap, 'tl-tr', [Ext.isIE ? 5 : 2, 3]);
        }
    },
    expand: function () {
        if (this.isExpanded() || !this.hasFocus) {
            return;
        }
        if (this.bufferSize) {
            this.doResize(this.bufferSize);
            delete this.bufferSize;
        }
        this.list.alignTo(this.outerWrapEl, this.listAlign).show();
        this.innerList.setOverflow('auto'); // necessary for FF 2.0/Mac
        this.mon(Ext.getDoc(), {
            scope: this,
            mousewheel: this.collapseIf,
            mousedown: this.collapseIf
        });
        this.fireEvent('expand', this);
    },
    restrictHeight: function () {
        var inner = this.innerList.dom,
            st = inner.scrollTop,
            list = this.list;

        inner.style.height = '';

        var pad = list.getFrameWidth('tb') + (this.resizable ? this.handleHeight : 0) + this.assetHeight,
            h = Math.max(inner.clientHeight, inner.offsetHeight, inner.scrollHeight),
            ha = this.getPosition()[1] - Ext.getBody().getScroll().top,
            hb = Ext.lib.Dom.getViewHeight() - ha - this.getSize().height,
            space = Math.max(ha, hb, this.minHeight || 0) - list.shadowOffset - pad - 5;

        h = Math.min(h, space, this.maxHeight);
        this.innerList.setHeight(h);

        list.beginUpdate();
        list.setHeight(h + pad);
        list.alignTo(this.outerWrapEl, this.listAlign);
        list.endUpdate();

        if (this.multiSelectMode) {
            inner.scrollTop = st;
        }
    },
    validateValue: function (val) {
        if (this.items.getCount() === 0) {
            if (this.allowBlank) {
                this.clearInvalid();
                return true;
            } else {
                this.markInvalid(this.blankText);
                return false;
            }
        }
        this.clearInvalid();
        return true;
    },
    manageNameAttribute: function () {
        if (!this.el) return
        if (this.items.getCount() === 0 && this.forceFormValue) {
            this.el.dom.setAttribute('name', this.hiddenName || this.name);
        } else {
            this.el.dom.removeAttribute('name');
        }
    },
    setupFormInterception: function () {
        var form;
        this.findParentBy(function (p) {
            if (p.getForm) {
                form = p.getForm();
            }
        });
        if (form) {
            var formGet = form.getValues;
            form.getValues = function (asString) {
                this.el.dom.disabled = true;
                var oldVal = this.el.dom.value;
                this.setRawValue('');
                var vals = formGet.call(form);
                this.el.dom.disabled = false;
                this.setRawValue(oldVal);
                if (this.forceFormValue && this.items.getCount() === 0) {
                    vals[this.name] = '';
                }
                return asString ? Ext.urlEncode(vals) : vals;
            } .createDelegate(this);
        }
    },
    onResize: function (w, h, rw, rh) {
        var reduce = Ext.isIE6 ? 4 : Ext.isIE7 ? 1 : Ext.isIE8 ? 1 : 0;
        if (this.wrapEl) {
            this._width = w;
            this.outerWrapEl.setWidth(w - reduce);
            if (this.renderFieldBtns) {
                reduce += (this.buttonWrap.getWidth() + 20);
                this.wrapEl.setWidth(w - reduce);
            }
        }
        Ext.ux.form.SuperBoxSelect.superclass.onResize.call(this, w, h, rw, rh);
        this.autoSize();
    },
    onEnable: function () {
        Ext.ux.form.SuperBoxSelect.superclass.onEnable.call(this);
        this.items.each(function (item) {
            item.enable();
        });
        if (this.renderFieldBtns) {
            this.initButtonEvents();
        }
    },
    onDisable: function () {
        Ext.ux.form.SuperBoxSelect.superclass.onDisable.call(this);
        this.items.each(function (item) {
            item.disable();
        });
        if (this.renderFieldBtns) {
            this.removeButtonEvents();
        }
    },
    /**
    * Clears all values from the component.
    * @methodOf Ext.ux.form.SuperBoxSelect
    * @name clearValue
    * @param {Boolean} supressRemoveEvent [Optional] When true, the 'removeitem' event will not fire for each item that is removed.    
    */
    clearValue: function (supressRemoveEvent) {
        Ext.ux.form.SuperBoxSelect.superclass.clearValue.call(this);
        this.preventMultipleRemoveEvents = supressRemoveEvent || this.supressClearValueRemoveEvents || false;
        this.removeAllItems();
        this.preventMultipleRemoveEvents = false;
        this.fireEvent('clear', this);
        return this;
    },
    fireNewItemEvent: function (val) {
        this.view.clearSelections();
        this.collapse();
        this.setRawValue('');
        if (this.queryFilterRe) {
            val = val.replace(this.queryFilterRe, '');
            if (!val) {
                return;
            }
        }
        this.fireEvent('newitem', this, val, this.filteredQueryData);
    },
    onKeyUp: function (e) {
        if (this.editable !== false && (!e.isSpecialKey() || e.getKey() === e.BACKSPACE) && this.itemDelimiterKey.indexOf !== e.getKey() && (!e.hasModifier() || e.shiftKey)) {
            this.lastKey = e.getKey();
            this.dqTask.delay(this.queryDelay);
        }
    },
    onKeyDownHandler: function (e, t) {

        var toDestroy, nextFocus, idx;

        if (e.getKey() === e.ESC) {
            if (!this.isExpanded()) {
                if (this.el.dom.value != '' && (this.clearOnEscape || this.clearLastQueryOnEscape)) {
                    if (this.clearOnEscape) {
                        this.el.dom.value = '';
                    }
                    if (this.clearLastQueryOnEscape) {
                        this.lastQuery = '';
                    }
                    e.stopEvent();
                }
            }
        }
        if ((e.getKey() === e.DELETE || e.getKey() === e.SPACE) && this.currentFocus) {
            e.stopEvent();
            toDestroy = this.currentFocus;
            this.on('expand', function () { this.collapse(); }, this, { single: true });
            idx = this.items.indexOfKey(this.currentFocus.key);
            this.clearCurrentFocus();

            if (idx < (this.items.getCount() - 1)) {
                nextFocus = this.items.itemAt(idx + 1);
            }

            toDestroy.preDestroy(true);
            if (nextFocus) {
                (function () {
                    nextFocus.onLnkFocus();
                    this.currentFocus = nextFocus;
                }).defer(200, this);
            }

            return true;
        }

        var val = this.el.dom.value, it, ctrl = e.ctrlKey;

        if (this.itemDelimiterKey === e.getKey()) {
            e.stopEvent();
            if (val !== "") {
                if (ctrl || !this.isExpanded()) {  //ctrl+enter for new items
                    this.fireNewItemEvent(val);
                } else {
                    this.onViewClick();
                    //removed from 3.0.1
                    if (this.unsetDelayCheck) {
                        this.delayedCheck = true;
                        this.unsetDelayCheck.defer(10, this);
                    }
                }
            } else {
                if (!this.isExpanded()) {
                    return;
                }
                this.onViewClick();
                //removed from 3.0.1
                if (this.unsetDelayCheck) {
                    this.delayedCheck = true;
                    this.unsetDelayCheck.defer(10, this);
                }
            }
            return true;
        }

        if (val !== '') {
            this.autoSize();
            return;
        }

        //select first item
        if (e.getKey() === e.HOME) {
            e.stopEvent();
            if (this.items.getCount() > 0) {
                this.collapse();
                it = this.items.get(0);
                it.el.focus();

            }
            return true;
        }
        //backspace remove
        if (e.getKey() === e.BACKSPACE) {
            e.stopEvent();
            if (this.currentFocus) {
                toDestroy = this.currentFocus;
                this.on('expand', function () {
                    this.collapse();
                }, this, { single: true });

                idx = this.items.indexOfKey(toDestroy.key);

                this.clearCurrentFocus();
                if (idx < (this.items.getCount() - 1)) {
                    nextFocus = this.items.itemAt(idx + 1);
                }

                toDestroy.preDestroy(true);

                if (nextFocus) {
                    (function () {
                        nextFocus.onLnkFocus();
                        this.currentFocus = nextFocus;
                    }).defer(200, this);
                }

                return;
            } else {
                it = this.items.get(this.items.getCount() - 1);
                if (it) {
                    if (this.backspaceDeletesLastItem) {
                        this.on('expand', function () { this.collapse(); }, this, { single: true });
                        it.preDestroy(true);
                    } else {
                        if (this.navigateItemsWithTab) {
                            it.onElClick();
                        } else {
                            this.on('expand', function () {
                                this.collapse();
                                this.currentFocus = it;
                                this.currentFocus.onLnkFocus.defer(20, this.currentFocus);
                            }, this, { single: true });
                        }
                    }
                }
                return true;
            }
        }

        if (!e.isNavKeyPress()) {
            this.multiSelectMode = false;
            this.clearCurrentFocus();
            return;
        }
        //arrow nav
        if (e.getKey() === e.LEFT || (e.getKey() === e.UP && !this.isExpanded())) {
            e.stopEvent();
            this.collapse();
            //get last item
            it = this.items.get(this.items.getCount() - 1);
            if (this.navigateItemsWithTab) {
                //focus last el
                if (it) {
                    it.focus();
                }
            } else {
                //focus prev item
                if (this.currentFocus) {
                    idx = this.items.indexOfKey(this.currentFocus.key);
                    this.clearCurrentFocus();

                    if (idx !== 0) {
                        this.currentFocus = this.items.itemAt(idx - 1);
                        this.currentFocus.onLnkFocus();
                    }
                } else {
                    this.currentFocus = it;
                    if (it) {
                        it.onLnkFocus();
                    }
                }
            }
            return true;
        }
        if (e.getKey() === e.DOWN) {
            if (this.currentFocus) {
                this.collapse();
                e.stopEvent();
                idx = this.items.indexOfKey(this.currentFocus.key);
                if (idx == (this.items.getCount() - 1)) {
                    this.clearCurrentFocus.defer(10, this);
                } else {
                    this.clearCurrentFocus();
                    this.currentFocus = this.items.itemAt(idx + 1);
                    if (this.currentFocus) {
                        this.currentFocus.onLnkFocus();
                    }
                }
                return true;
            }
        }
        if (e.getKey() === e.RIGHT) {
            this.collapse();
            it = this.items.itemAt(0);
            if (this.navigateItemsWithTab) {
                //focus first el
                if (it) {
                    it.focus();
                }
            } else {
                if (this.currentFocus) {
                    idx = this.items.indexOfKey(this.currentFocus.key);
                    this.clearCurrentFocus();
                    if (idx < (this.items.getCount() - 1)) {
                        this.currentFocus = this.items.itemAt(idx + 1);
                        if (this.currentFocus) {
                            this.currentFocus.onLnkFocus();
                        }
                    }
                } else {
                    this.currentFocus = it;
                    if (it) {
                        it.onLnkFocus();
                    }
                }
            }
        }
    },
    onKeyUpBuffered: function (e) {
        if (!e.isNavKeyPress()) {
            this.autoSize();
        }
    },
    reset: function () {
        this.killItems();
        Ext.ux.form.SuperBoxSelect.superclass.reset.call(this);
        this.addedRecords = [];
        this.autoSize().setRawValue('');
    },
    applyEmptyText: function () {
        this.setRawValue('');
        if (this.items.getCount() > 0) {
            this.el.removeClass(this.emptyClass);
            this.setRawValue('');
            return this;
        }
        if (this.rendered && this.emptyText && this.getRawValue().length < 1) {
            this.setRawValue(this.emptyText);
            this.el.addClass(this.emptyClass);
        }
        return this;
    },
    /**
    * @private
    * 
    * Use clearValue instead
    */
    removeAllItems: function () {
        this.items.each(function (item) {
            item.preDestroy(true);
        }, this);
        this.manageClearBtn();
        return this;
    },
    killItems: function () {
        this.items.each(function (item) {
            item.kill();
        }, this);
        this.resetStore();
        this.items.clear();
        this.manageClearBtn();
        return this;
    },
    resetStore: function () {
        this.store.clearFilter();
        if (!this.removeValuesFromStore) {
            return this;
        }
        this.usedRecords.each(function (rec) {
            this.store.add(rec);
        }, this);
        this.usedRecords.clear();
        if (!this.store.remoteSort) {
            this.store.sort(this.displayField, 'ASC');
        }

        return this;
    },
    sortStore: function () {
        var ss = this.store.getSortState();
        if (ss && ss.field) {
            this.store.sort(ss.field, ss.direction);
        }
        return this;
    },
    getCaption: function (dataObject) {
        if (typeof this.displayFieldTpl === 'string') {
            this.displayFieldTpl = new Ext.XTemplate(this.displayFieldTpl);
        }
        var caption, recordData = dataObject instanceof Ext.data.Record ? dataObject.data : dataObject;

        if (this.displayFieldTpl) {
            caption = this.displayFieldTpl.apply(recordData);
        } else if (this.displayField) {
            caption = recordData[this.displayField];
        }

        return caption;
    },
    addRecord: function (record) {
        var display = record.data[this.displayField],
            caption = this.getCaption(record),
            val = record.data[this.valueField],
            cls = this.classField ? record.data[this.classField]
                : (record.data['flag'] === true ? 'x-superboxselect-item-not-exists' : ''),
            style = this.styleField ? record.data[this.styleField] : '';

        if (this.removeValuesFromStore) {
            this.usedRecords.add(val.toLowerCase(), record);
            this.store.remove(record);
        }

        this.addItemBox(val, display, caption, cls, style);
        this.fireEvent('additem', this, val, record);
    },
    createRecord: function (recordData) {
        if (!this.recordConstructor) {
            var recordFields = [
                { name: this.valueField },
                { name: this.displayField }
            ];
            if (this.classField) {
                recordFields.push({ name: this.classField });
            }
            if (this.styleField) {
                recordFields.push({ name: this.styleField });
            }
            this.recordConstructor = Ext.data.Record.create(recordFields);
        }
        return new this.recordConstructor(recordData);
    },
    /**
    * Adds an array of items to the SuperBoxSelect component if the {@link #Ext.ux.form.SuperBoxSelect-allowAddNewData} config is set to true.
    * @methodOf Ext.ux.form.SuperBoxSelect
    * @name addItem
    * @param {Array} newItemObjects An Array of object literals containing the property names and values for an item. The property names must match those specified in {@link #Ext.ux.form.SuperBoxSelect-displayField}, {@link #Ext.ux.form.SuperBoxSelect-valueField} and {@link #Ext.ux.form.SuperBoxSelect-classField} 
    */
    addItems: function (newItemObjects) {
        if (Ext.isArray(newItemObjects)) {
            Ext.each(newItemObjects, function (item) {
                this.addItem(item);
            }, this);
        } else {
            this.addItem(newItemObjects);
        }
    },
    /**
    * Adds a new non-existing item to the SuperBoxSelect component if the {@link #Ext.ux.form.SuperBoxSelect-allowAddNewData} config is set to true.
    * This method should be used in place of addItem from within the newitem event handler.
    * @methodOf Ext.ux.form.SuperBoxSelect
    * @name addNewItem
    * @param {Object} newItemObject An object literal containing the property names and values for an item. The property names must match those specified in {@link #Ext.ux.form.SuperBoxSelect-displayField}, {@link #Ext.ux.form.SuperBoxSelect-valueField} and {@link #Ext.ux.form.SuperBoxSelect-classField} 
    */
    addNewItem: function (newItemObject) {
        this.addItem(newItemObject, true);
    },
    /**
    * Adds an item to the SuperBoxSelect component if the {@link #Ext.ux.form.SuperBoxSelect-allowAddNewData} config is set to true.
    * @methodOf Ext.ux.form.SuperBoxSelect
    * @name addItem
    * @param {Object} newItemObject An object literal containing the property names and values for an item. The property names must match those specified in {@link #Ext.ux.form.SuperBoxSelect-displayField}, {@link #Ext.ux.form.SuperBoxSelect-valueField} and {@link #Ext.ux.form.SuperBoxSelect-classField} 
    */
    addItem: function (newItemObject, /*hidden param*/forcedAdd) {

        var val = newItemObject[this.valueField];

        if (this.disabled) {
            return false;
        }
        if (this.preventDuplicates && this.hasValue(val)) {
            return;
        }

        //use existing record if found
        var record = this.findRecord(this.valueField, val);
        if (record) {
            this.addRecord(record);
            return;
        } else if (!this.allowAddNewData) { // else it's a new item
            return;
        }

        if (this.mode === 'remote') {
            this.remoteLookup.push(newItemObject);
            this.doQuery(val, false, false, forcedAdd);
            return;
        }

        var rec = this.createRecord(newItemObject);
        this.store.add(rec);
        this.addRecord(rec);

        return true;
    },
    addItemBox: function (itemVal, itemDisplay, itemCaption, itemClass, itemStyle) {
        var hConfig, parseStyle = function (s) {
            var ret = '';
            switch (typeof s) {
                case 'function':
                    ret = s.call();
                    break;
                case 'object':
                    for (var p in s) {
                        ret += p + ':' + s[p] + ';';
                    }
                    break;
                case 'string':
                    ret = s + ';';
            }
            return ret;
        }, itemKey = Ext.id(null, 'sbx-item'), box = new Ext.ux.form.SuperBoxSelectItem({
            owner: this,
            notExists: itemClass != '',
            disabled: this.disabled,
            renderTo: this.wrapEl,
            cls: this.extraItemCls + ' ' + itemClass,
            style: parseStyle(this.extraItemStyle) + ' ' + itemStyle,
            caption: itemCaption,
            display: itemDisplay,
            value: itemVal,
            key: itemKey,
            listeners: {
                'remove': function (item) {
                    if (this.fireEvent('beforeremoveitem', this, item.value) === false) {
                        return false;
                    }
                    this.items.removeKey(item.key);
                    if (this.removeValuesFromStore) {
                        if (this.usedRecords.containsKey(item.value)) {
                            this.store.add(this.usedRecords.get(item.value));
                            this.usedRecords.removeKey(item.value);
                            this.sortStore();
                            if (this.view) {
                                this.view.render();
                            }
                        }
                    }
                    if (!this.preventMultipleRemoveEvents) {
                        this.fireEvent.defer(250, this, ['removeitem', this, item.value, this.findInStore(item.value)]);
                    }
                },
                destroy: function () {
                    this.collapse();
                    this.autoSize().manageClearBtn().validateValue();
                },
                scope: this
            }
        });
        box.render();

        hConfig = {
            tag: 'input',
            type: 'hidden',
            value: Ext.util.Format.htmlEncode(itemVal),
            name: (this.hiddenName || this.name)
        };

        if (this.disabled) {
            Ext.apply(hConfig, {
                disabled: 'disabled'
            })
        }
        box.hidden = this.el.insertSibling(hConfig, 'before');

        this.items.add(itemKey, box);
        this.applyEmptyText().autoSize().manageClearBtn().validateValue();
    },
    manageClearBtn: function () {
        if (!this.renderFieldBtns || !this.rendered) {
            return this;
        }
        var cls = 'x-superboxselect-btn-hide';
        if (this.items.getCount() === 0) {
            this.buttonClear.addClass(cls);
        } else {
            this.buttonClear.removeClass(cls);
        }
        return this;
    },
    findInStore: function (val) {
        var index = this.store.find(this.valueField, val);
        if (index > -1) {
            return this.store.getAt(index);
        }
        return false;
    },
    /**
    * Returns an array of records associated with the selected items.
    * @methodOf Ext.ux.form.SuperBoxSelect
    * @name getSelectedRecords
    * @return {Array} An array of records associated with the selected items. 
    */
    getSelectedRecords: function () {
        var ret = [];
        if (this.removeValuesFromStore) {
            ret = this.usedRecords.getRange();
        } else {
            var vals = [];
            this.items.each(function (item) {
                vals.push(item.value);
            });
            Ext.each(vals, function (val) {
                ret.push(this.findInStore(val));
            }, this);
        }
        return ret;
    },
    /**
    * Returns an item which contains the passed HTML Element.
    * @methodOf Ext.ux.form.SuperBoxSelect
    * @name findSelectedItem
    * @param {HTMLElement} el The LI HTMLElement of a selected item in the list  
    */
    findSelectedItem: function (el) {
        var ret;
        this.items.each(function (item) {
            if (item.el.dom === el) {
                ret = item;
                return false;
            }
        });
        return ret;
    },
    /**
    * Returns a record associated with the item which contains the passed HTML Element.
    * @methodOf Ext.ux.form.SuperBoxSelect
    * @name findSelectedRecord
    * @param {HTMLElement} el The LI HTMLElement of a selected item in the list  
    */
    findSelectedRecord: function (el) {
        var ret, item = this.findSelectedItem(el);
        if (item) {
            ret = this.findSelectedRecordByValue(item.value)
        }

        return ret;
    },
    /**
    * Returns a selected record associated with the passed value.
    * @methodOf Ext.ux.form.SuperBoxSelect
    * @name findSelectedRecordByValue
    * @param {Mixed} val The value to lookup
    * @return {Record} The matching Record. 
    */
    findSelectedRecordByValue: function (val) {
        var ret;
        if (this.removeValuesFromStore) {
            this.usedRecords.each(function (rec) {
                if (rec.get(this.valueField) == val) {
                    ret = rec;
                    return false;
                }
            }, this);
        } else {
            ret = this.findInStore(val);
        }
        return ret;
    },
    /**
    * Returns a String value containing a concatenated list of item values. The list is concatenated with the {@link #Ext.ux.form.SuperBoxSelect-valueDelimiter}.
    * @methodOf Ext.ux.form.SuperBoxSelect
    * @name getValue
    * @return {String} a String value containing a concatenated list of item values. 
    */
    getValue: function () {
        var ret = [];
        this.items.each(function (item) {
            ret.push(item.value);
        });
        return Ext.util.JSON.encode(ret); //.join(this.valueDelimiter);
    },
    getValueArray: function () {
        var ret = [];
        this.items.each(function (item) {
            ret.push(item.value);
        });
        return ret;
    },
    /**
    * Returns the count of the selected items.
    * @methodOf Ext.ux.form.SuperBoxSelect
    * @name getCount
    * @return {Number} the number of selected items. 
    */
    getCount: function () {
        return this.items.getCount();
    },
    /**
    * Returns an Array of item objects containing the {@link #Ext.ux.form.SuperBoxSelect-displayField}, {@link #Ext.ux.form.SuperBoxSelect-valueField}, {@link #Ext.ux.form.SuperBoxSelect-classField} and {@link #Ext.ux.form.SuperBoxSelect-styleField} properties.
    * @methodOf Ext.ux.form.SuperBoxSelect
    * @name getValueEx
    * @return {Array} an array of item objects. 
    */
    getValueEx: function () {
        var ret = [];
        this.items.each(function (item) {
            var newItem = {};
            newItem[this.valueField] = item.value;
            newItem[this.displayField] = item.display;
            if (this.classField) {
                newItem[this.classField] = item.cls || '';
            }
            if (this.styleField) {
                newItem[this.styleField] = item.style || '';
            }
            ret.push(newItem);
        }, this);
        return ret;
    },
    // private
    initValue: function () {
        if (Ext.isObject(this.value) || Ext.isArray(this.value)) {
            this.setValueEx(this.value);
            this.originalValue = this.getValue();
        } else {
            Ext.ux.form.SuperBoxSelect.superclass.initValue.call(this);
        }
        if (this.mode === 'remote') {
            this.setOriginal = true;
        }
    },
    /**
    * Adds an existing value to the SuperBoxSelect component.
    * @methodOf Ext.ux.form.SuperBoxSelect
    * @name setValue
    * @param {String|Array} value An array of item values, or a String value containing a delimited list of item values. (The list should be delimited with the {@link #Ext.ux.form.SuperBoxSelect-valueDelimiter) 
    */
    addValue: function (value) {

        if (Ext.isEmpty(value)) {
            return;
        }

        var values = value;
        if (!Ext.isArray(value)) {
            value = '' + value;
            values = value.split(this.valueDelimiter);
        }

        Ext.each(values, function (val) {
            var record = this.findRecord(this.valueField, val);
            if (record) {
                this.addRecord(record);
            } else if (this.mode === 'remote') {
                this.remoteLookup.push(val);
            }
        }, this);

        if (this.mode === 'remote') {
            var q = this.remoteLookup.join(this.queryValuesDelimiter);
            this.doQuery(q, false, true); //3rd param to specify a values query
        }
    },
    /**
    * Sets the value of the SuperBoxSelect component.
    * @methodOf Ext.ux.form.SuperBoxSelect
    * @name setValue
    * @param {String|Array} value An array of item values, or a String value containing a delimited list of item values. (The list should be delimited with the {@link #Ext.ux.form.SuperBoxSelect-valueDelimiter) 
    */
    setValue: function (value) {
        if (!this.rendered) {
            this.value = value;
            return;
        }
        this.removeAllItems().resetStore();
        this.remoteLookup = [];
        this.addValue(value);

    },
    /**
    * Sets the value of the SuperBoxSelect component, adding new items that don't exist in the data store if the {@link #Ext.ux.form.SuperBoxSelect-allowAddNewData} config is set to true.
    * @methodOf Ext.ux.form.SuperBoxSelect
    * @name setValue
    * @param {Array} data An Array of item objects containing the {@link #Ext.ux.form.SuperBoxSelect-displayField}, {@link #Ext.ux.form.SuperBoxSelect-valueField} and {@link #Ext.ux.form.SuperBoxSelect-classField} properties.  
    */
    setValueEx: function (data) {
        if (!this.rendered) {
            this.value = data;
            return;
        }
        this.removeAllItems().resetStore();

        if (!Ext.isArray(data)) {
            data = [data];
        }
        this.remoteLookup = [];

        if (this.allowAddNewData && this.mode === 'remote') { // no need to query
            Ext.each(data, function (d) {
                var r = this.findRecord(this.valueField, d[this.valueField]) || this.createRecord(d);
                this.addRecord(r);
            }, this);
            return;
        }

        Ext.each(data, function (item) {
            this.addItem(item);
        }, this);
    },
    /**
    * Returns true if the SuperBoxSelect component has a selected item with a value matching the 'val' parameter.
    * @methodOf Ext.ux.form.SuperBoxSelect
    * @name hasValue
    * @param {Mixed} val The value to test.
    * @return {Boolean} true if the component has the selected value, false otherwise.
    */
    hasValue: function (val) {
        var has = false;
        this.items.each(function (item) {
            if (item.value == val) {
                has = true;
                return false;
            }
        }, this);
        return has;
    },
    onSelect: function (record, index) {
        if (this.fireEvent('beforeselect', this, record, index) !== false) {
            var val = record.data[this.valueField];

            if (this.preventDuplicates && this.hasValue(val)) {
                return;
            }

            this.setRawValue('');
            this.lastSelectionText = '';

            if (this.fireEvent('beforeadditem', this, val, record, this.filteredQueryData) !== false) {
                this.addRecord(record);
            }
            if (this.store.getCount() === 0 || !this.multiSelectMode) {
                this.collapse();
            } else {
                this.restrictHeight();
            }
        }
    },
    onDestroy: function () {
        this.items.purgeListeners();
        this.killItems();
        if (this.allowQueryAll) {
            Ext.destroy(this.buttonExpand);
        }
        if (this.renderFieldBtns) {
            Ext.destroy(
                this.buttonClear,
                this.buttonWrap
            );
        }

        Ext.destroy(
            this.inputEl,
            this.wrapEl,
            this.outerWrapEl
        );

        Ext.ux.form.SuperBoxSelect.superclass.onDestroy.call(this);
    },
    autoSize: function () {
        if (!this.rendered) {
            return this;
        }
        if (!this.metrics) {
            this.metrics = Ext.util.TextMetrics.createInstance(this.el);
        }
        var el = this.el,
            v = el.dom.value,
            d = document.createElement('div');

        if (v === "" && this.emptyText && this.items.getCount() < 1) {
            v = this.emptyText;
        }
        d.appendChild(document.createTextNode(v));
        v = d.innerHTML;
        d = null;
        v += "&#160;";
        var w = Math.max(this.metrics.getWidth(v) + 24, 24);
        if (typeof this._width != 'undefined') {
            w = Math.min(this._width, w);
        }
        this.el.setWidth(w);

        if (Ext.isIE) {
            this.el.dom.style.top = '0';
        }
        this.fireEvent('autosize', this, w);
        return this;
    },
    shouldQuery: function (q) {
        if (this.lastQuery) {
            try {
                var m = q.match("^" + this.lastQuery);
                if (!m || this.store.getCount()) {
                    return true;
                } else {
                    return (m[0] !== this.lastQuery);
                }
            } catch (e) {
                return false;
            }
        }
        return true;
    },
    doQuery: function (q, forceAll, valuesQuery, forcedAdd) {
        q = Ext.isEmpty(q) ? '' : q;
        if (this.queryFilterRe) {
            this.filteredQueryData = '';
            var m = null;
            try {
                m = q.match(this.queryFilterRe);
            } catch (e) {
                // ignore
            }
            if (m && m.length) {
                this.filteredQueryData = m[0];
            }
            q = q.replace(this.queryFilterRe, '');
            if (!q && m) {
                return;
            }
        }
        var qe = {
            query: q,
            forceAll: forceAll,
            combo: this,
            cancel: false
        };
        if (this.fireEvent('beforequery', qe) === false || qe.cancel) {
            return false;
        }
        q = qe.query;
        forceAll = qe.forceAll;
        if (forceAll === true || (q.length >= this.minChars) || valuesQuery && !Ext.isEmpty(q)) {
            if (forcedAdd || this.forceSameValueQuery || this.shouldQuery(q)) {
                this.lastQuery = q;
                if (this.mode == 'local') {
                    this.selectedIndex = -1;
                    if (forceAll) {
                        this.store.clearFilter();
                    } else {
                        this.store.filter(this.displayField, q);
                    }
                    this.onLoad();
                } else {

                    this.store.baseParams[this.queryParam] = q;
                    this.store.baseParams[this.queryValuesIndicator] = valuesQuery;
                    this.store.load({
                        params: this.getParams(q)
                    });
                    if (!forcedAdd) {
                        this.expand();
                    }
                }
            } else {
                this.selectedIndex = -1;
                this.onLoad();
            }
        }
    },
    onStoreLoad: function (store, records, options) {
        //accomodating for bug in Ext 3.0.0 where options.params are empty
        var q = options.params[this.queryParam] || store.baseParams[this.queryParam] || "",
            isValuesQuery = options.params[this.queryValuesIndicator] || store.baseParams[this.queryValuesIndicator];

        if (this.removeValuesFromStore) {
            this.store.each(function (record) {
                if (this.usedRecords.containsKey(record.get(this.valueField))) {
                    this.store.remove(record);
                }
            }, this);
        }
        //queried values
        if (isValuesQuery) {

            var params = q.split(this.queryValuesDelimiter);
            Ext.each(params, function (p) {
                this.remoteLookup.remove(p);
                var rec = this.findRecord(this.valueField, p);
                if (rec) {
                    this.addRecord(rec);
                }
            }, this);

            if (this.setOriginal) {
                this.setOriginal = false;
                this.originalValue = this.getValue();
            }
        }

        //queried display (autocomplete) & addItem
        if (q !== '' && this.allowAddNewData) {
            Ext.each(this.remoteLookup, function (r) {
                if (typeof r === "object" && r[this.valueField] === q) {
                    this.remoteLookup.remove(r);
                    if (records.length && records[0].get(this.valueField) === q) {
                        this.addRecord(records[0]);
                        return;
                    }
                    var rec = this.createRecord(r);
                    this.store.add(rec);
                    this.addRecord(rec);
                    this.addedRecords.push(rec); //keep track of records added to store
                    (function () {
                        if (this.isExpanded()) {
                            this.collapse();
                        }
                    }).defer(10, this);
                    return;
                }
            }, this);
        }

        var toAdd = [];
        if (q === '') {
            Ext.each(this.addedRecords, function (rec) {
                if (this.preventDuplicates && this.usedRecords.containsKey(rec.get(this.valueField))) {
                    return;
                }
                toAdd.push(rec);

            }, this);

        } else {
            var re = new RegExp(Ext.escapeRe(q) + '.*', 'i');
            Ext.each(this.addedRecords, function (rec) {
                if (this.preventDuplicates && this.usedRecords.containsKey(rec.get(this.valueField))) {
                    return;
                }
                if (re.test(rec.get(this.displayField))) {
                    toAdd.push(rec);
                }
            }, this);
        }
        this.store.add(toAdd);
        this.sortStore();

        if (this.store.getCount() === 0 && this.isExpanded()) {
            this.collapse();
        }

    }
});
Ext.reg('superboxselect', Ext.ux.form.SuperBoxSelect);
/*
* @private
*/
Ext.ux.form.SuperBoxSelectItem = function (config) {
    Ext.apply(this, config);
    Ext.ux.form.SuperBoxSelectItem.superclass.constructor.call(this);
};
/*
* @private
*/
Ext.ux.form.SuperBoxSelectItem = Ext.extend(Ext.ux.form.SuperBoxSelectItem, Ext.Component, {
    initComponent: function () {
        Ext.ux.form.SuperBoxSelectItem.superclass.initComponent.call(this);
    },
    onElClick: function (e) {
        var o = this.owner;
        o.clearCurrentFocus().collapse();
        if (o.navigateItemsWithTab) {
            this.focus();
        } else {
            o.el.dom.focus();
            var that = this;
            (function () {
                this.onLnkFocus();
                o.currentFocus = this;
            }).defer(10, this);
        }
    },

    onLnkClick: function (e) {
        if (e) {
            e.stopEvent();
        }
        this.preDestroy();
        if (!this.owner.navigateItemsWithTab) {
            this.owner.el.focus();
        }
    },

    onLnkFocus: function () {
        this.el.addClass("x-superboxselect-item-focus");
        if (this.notExists === true)
            this.el.addClass("x-superboxselect-item-not-exists-focus");
        this.owner.outerWrapEl.addClass("x-form-focus");
    },

    onLnkBlur: function () {
        this.el.removeClass("x-superboxselect-item-focus");
        if (this.notExists === true)
            this.el.removeClass("x-superboxselect-item-not-exists-focus");
        this.owner.outerWrapEl.removeClass("x-form-focus");
    },

    enableElListeners: function () {
        this.el.on('click', this.onElClick, this, { stopEvent: true });
        this.el.addClassOnOver('x-superboxselect-item x-superboxselect-item-hover');
        if (this.notExists === true)
            this.el.addClassOnOver('x-superboxselect-item-not-exists x-superboxselect-item-not-exists-hover');
    },

    enableLnkListeners: function () {
        this.lnk.on({
            click: this.onLnkClick,
            focus: this.onLnkFocus,
            blur: this.onLnkBlur,
            scope: this
        });
    },

    enableAllListeners: function () {
        this.enableElListeners();
        this.enableLnkListeners();
    },
    disableAllListeners: function () {
        this.el.removeAllListeners();
        this.lnk.un('click', this.onLnkClick, this);
        this.lnk.un('focus', this.onLnkFocus, this);
        this.lnk.un('blur', this.onLnkBlur, this);
    },
    onRender: function (ct, position) {

        Ext.ux.form.SuperBoxSelectItem.superclass.onRender.call(this, ct, position);

        var el = this.el;
        if (el) {
            el.remove();
        }

        this.el = el = ct.createChild({ tag: 'li' }, ct.last());
        el.addClass('x-superboxselect-item');
        if (this.notExists === true)
            el.addClass('x-superboxselect-item-not-exists');

        var btnEl = this.owner.navigateItemsWithTab ? (Ext.isSafari ? 'button' : 'a') : 'span';
        var itemKey = this.key;

        Ext.apply(el, {
            focus: function () {
                var c = this.down(btnEl + '.x-superboxselect-item-close');
                if (c) {
                    c.focus();
                }
            },
            preDestroy: function () {
                this.preDestroy();
            } .createDelegate(this)
        });

        this.enableElListeners();

        el.update(this.caption);

        var cfg = {
            tag: btnEl,
            'class': 'x-superboxselect-item-close',
            tabIndex: this.owner.navigateItemsWithTab ? '0' : '-1'
        };
        if (btnEl === 'a') {
            cfg.href = '#';
        }
        this.lnk = el.createChild(cfg);


        if (!this.disabled) {
            this.enableLnkListeners();
        } else {
            this.disableAllListeners();
        }

        this.on({
            disable: this.disableAllListeners,
            enable: this.enableAllListeners,
            scope: this
        });

        this.setupKeyMap();
    },
    setupKeyMap: function () {
        this.keyMap = new Ext.KeyMap(this.lnk, [
            {
                key: [
                    Ext.EventObject.BACKSPACE,
                    Ext.EventObject.DELETE,
                    Ext.EventObject.SPACE
                ],
                fn: this.preDestroy,
                scope: this
            }, {
                key: [
                    Ext.EventObject.RIGHT,
                    Ext.EventObject.DOWN
                ],
                fn: function () {
                    this.moveFocus('right');
                },
                scope: this
            },
            {
                key: [Ext.EventObject.LEFT, Ext.EventObject.UP],
                fn: function () {
                    this.moveFocus('left');
                },
                scope: this
            },
            {
                key: [Ext.EventObject.HOME],
                fn: function () {
                    var l = this.owner.items.get(0).el.focus();
                    if (l) {
                        l.el.focus();
                    }
                },
                scope: this
            },
            {
                key: [Ext.EventObject.END],
                fn: function () {
                    this.owner.el.focus();
                },
                scope: this
            },
            {
                key: Ext.EventObject.ENTER,
                fn: function () {
                }
            }
        ]);
        this.keyMap.stopEvent = true;
    },
    moveFocus: function (dir) {
        var el = this.el[dir == 'left' ? 'prev' : 'next']() || this.owner.el;
        el.focus.defer(100, el);
    },

    preDestroy: function (supressEffect) {
        if (this.fireEvent('remove', this) === false) {
            return;
        }
        var actionDestroy = function () {
            if (this.owner.navigateItemsWithTab) {
                this.moveFocus('right');
            }
            this.hidden.remove();
            this.hidden = null;
            this.destroy();
        };

        if (supressEffect) {
            actionDestroy.call(this);
        } else {
            this.el.hide({
                duration: 0.2,
                callback: actionDestroy,
                scope: this
            });
        }
        return this;
    },
    kill: function () {
        if (this.hidden && this.hidden.remove && typeof this.hidden.remove == 'function') {
            this.hidden.remove();
        }
        this.hidden = null;
        this.purgeListeners();
        this.destroy();
    },
    onDisable: function () {
        if (this.hidden) {
            this.hidden.dom.setAttribute('disabled', 'disabled');
        }
        this.keyMap.disable();
        Ext.ux.form.SuperBoxSelectItem.superclass.onDisable.call(this);
    },
    onEnable: function () {
        if (this.hidden) {
            this.hidden.dom.removeAttribute('disabled');
        }
        this.keyMap.enable();
        Ext.ux.form.SuperBoxSelectItem.superclass.onEnable.call(this);
    },
    onDestroy: function () {
        Ext.destroy(
            this.lnk,
            this.el
        );

        Ext.ux.form.SuperBoxSelectItem.superclass.onDestroy.call(this);
    }
});

/* TextArea with copy to clipboard button */

Ext.ux.AreaCopyToClipboard = Ext.extend(Ext.form.TextField, {
    /**
     * @cfg {Number} growMin The minimum height to allow when <tt>{@link Ext.form.TextField#grow grow}=true</tt>
     * (defaults to <tt>60</tt>)
     */
    growMin: 60,
    /**
     * @cfg {Number} growMax The maximum height to allow when <tt>{@link Ext.form.TextField#grow grow}=true</tt>
     * (defaults to <tt>1000</tt>)
     */
    growMax: 1000,
    growAppend: '&#160;\n&#160;',

    enterIsSpecial: false,

    /**
     * @cfg {Boolean} preventScrollbars <tt>true</tt> to prevent scrollbars from appearing regardless of how much text is
     * in the field. This option is only relevant when {@link #grow} is <tt>true</tt>. Equivalent to setting overflow: hidden, defaults to 
     * <tt>false</tt>.
     */
    preventScrollbars: false,

    /**
     * @cfg {String/Object} autoCreate <p>A {@link Ext.DomHelper DomHelper} element spec, or true for a default
     * element spec. Used to create the {@link Ext.Component#getEl Element} which will encapsulate this Component.
     * See <tt>{@link Ext.Component#autoEl autoEl}</tt> for details.  Defaults to:</p>
     * <pre><code>{tag: "input", type: "text", size: "16", autocomplete: "off"}</code></pre>
     */
    defaultAutoCreate: {
        tag: "textarea",
        style:"width:100px;height:60px;",
        autocomplete: "off"
    },
    /**
     * @cfg {Boolean} hideTrigger <tt>true</tt> to hide the trigger element and display only the base
     * text field (defaults to <tt>false</tt>)
     */
    hideTrigger: false,
    /**
     * @cfg {Boolean} editable <tt>false</tt> to prevent the user from typing text directly into the field,
     * the field will only respond to a click on the trigger to set the value. (defaults to <tt>true</tt>).
     */
    editable: true,
    /**
     * @cfg {Boolean} readOnly <tt>true</tt> to prevent the user from changing the field, and
     * hides the trigger.  Superceeds the editable and hideTrigger options if the value is true.
     * (defaults to <tt>false</tt>)
     */
    readOnly: false,
    /**
     * @cfg {String} wrapFocusClass The class added to the to the wrap of the trigger element. Defaults to
     * <tt>x-trigger-wrap-focus</tt>.
     */
    wrapFocusClass: 'x-trigger-wrap-focus',

    // private
    monitorTab: true,
    // private
    deferHeight: true,
    // private
    mimicing: false,

    actionMode: 'wrap',

    defaultTriggerWidth: 17,

    // private
    onResize: function (w, h) {
        Ext.form.TriggerField.superclass.onResize.call(this, w, h);
        var tw = this.getTriggerWidth();
        if (Ext.isNumber(w)) {
            this.el.setWidth(w);
        }
        this.wrap.setWidth(this.el.getWidth());
        if (Ext.isNumber(h)) {
            this.el.setHeight(h);
        }
        this.wrap.setHeight(this.el.getHeight());
    },

    getTriggerWidth: function () {
        var tw = this.trigger.getWidth();
        if (!this.hideTrigger && !this.readOnly && tw === 0) {
            tw = this.defaultTriggerWidth;
        }
        return tw;
    },

    // private
    alignErrorIcon: function () {
        if (this.wrap) {
            this.errorIcon.alignTo(this.wrap, 'tl-tr', [2, 0]);
        }
    },

    // private
    onRender: function (ct, position) {
        this.doc = Ext.isIE ? Ext.getBody() : Ext.getDoc();
        Ext.form.TriggerField.superclass.onRender.call(this, ct, position);

        this.wrap = this.el.wrap({ cls: 'x-form-field-wrap x-form-field-trigger-wrap' });
        this.trigger = this.wrap.createChild(this.triggerConfig || {
            tag: 'img',
            src: this.ctcIcon || Ext.BLANK_IMAGE_URL,
            alt: '',
            title: this.ctcHint || 'Copy to clipboard',
            cls: 'x-menu-item-icon x-copy-to-clipboard-icon'
        });
        this.initTrigger();
        if (Ext.isFunction(this.refreshHandler)) {
            this.refreshTrigger = this.wrap.createChild({
                tag: 'img',
                src: this.refreshIcon || Ext.BLANK_IMAGE_URL,
                alt: '',
                title: this.refreshHint || 'Update short link',
                cls: 'x-menu-item-cion x-refresh-field-icon'
            });
            this.initRefreshTrigger();
        }
        if (!this.width) {
            this.wrap.setWidth(this.el.getWidth() + this.trigger.getWidth());
        }
        if (!this.height) {
            this.wrap.setHeight(this.el.getHeight());
        }
        this.resizeEl = this.positionEl = this.wrap;

        if (this.grow) {
            this.textSizeEl = Ext.DomHelper.append(document.body, {
                tag: "pre", cls: "x-form-grow-sizer"
            });
            if (this.preventScrollbars) {
                this.el.setStyle("overflow", "hidden");
            }
            this.el.setHeight(this.growMin);
        }
    },

    getWidth: function () {
        return (this.wrap.getWidth());// (this.el.getWidth() + this.trigger.getWidth());
    },

    updateEditState: function () {
        if (this.rendered) {
            this.el.dom.readOnly = this.readOnly;
            this.trigger.setDisplayed(!this.hideTrigger);
            this.onResize(this.width || this.wrap.getWidth());
        }
    },

    /**
     * Changes the hidden status of the trigger.
     * @param {Boolean} hideTrigger True to hide the trigger, false to show it.
     */
    setHideTrigger: function (hideTrigger) {
        if (hideTrigger != this.hideTrigger) {
            this.hideTrigger = hideTrigger;
            this.updateEditState();
        }
    },

    /**
     * Setting this to true will supersede settings {@link #editable} and {@link #hideTrigger}.
     * Setting this to false will defer back to {@link #editable} and {@link #hideTrigger}. This method
     * is the runtime equivalent of setting the {@link #readOnly} config option at config time.
     * @param {Boolean} value True to prevent the user changing the field and explicitly
     * hide the trigger.
     */
    setReadOnly: function (readOnly) {
        if (readOnly != this.readOnly) {
            this.readOnly = readOnly;
            this.updateEditState();
        }
    },

    afterRender: function () {
        Ext.form.TriggerField.superclass.afterRender.call(this);
        this.updateEditState();
    },

    // private
    initTrigger: function () {
        this.mon(this.trigger, 'click', this.onTriggerClick, this, { preventDefault: true });
        this.trigger.addClassOnOver('x-form-trigger-over');
        this.trigger.addClassOnClick('x-form-trigger-click');

        // copy to clipboard support
        var ctcSupported = false;
        try {
            ctcSupported = !!document.queryCommandSupported;
            if (!!ctcSupported) {
                ctcSupported = !!document.queryCommandSupported('copy');
            }
        } catch (err) { }
        if (!ctcSupported) {
            this.trigger.dom.style.display = 'none';
        }
    },

    initRefreshTrigger: function () {
        if (this.refreshTrigger) {
            this.mon(this.refreshTrigger, 'click', this.onRefreshTriggerClick, this, { preventDefault: true });
            this.refreshTrigger.addClassOnOver('x-form-trigger-over');
            this.refreshTrigger.addClassOnClick('x-form-trigger-click');
        }
    },

    // private
    onDestroy: function () {
        Ext.removeNode(this.textSizeEl);
        Ext.destroy(this.trigger, this.wrap);
        if (this.refreshTrigger) {
            Ext.destroy(this.refreshTrigger, this.wrap);
        }
        if (this.mimicing) {
            this.doc.un('mousedown', this.mimicBlur, this);
        }
        delete this.doc;
        Ext.form.TriggerField.superclass.onDestroy.call(this);
    },

    fireKey: function (e) {
        if (e.isSpecialKey() && (this.enterIsSpecial || (e.getKey() != e.ENTER || e.hasModifier()))) {
            this.fireEvent("specialkey", this, e);
        }
    },

    // private
    doAutoSize: function (e) {
        return !e.isNavKeyPress() || e.getKey() == e.ENTER;
    },

    // inherit docs
    filterValidation: function (e) {
        if (!e.isNavKeyPress() || (!this.enterIsSpecial && e.keyCode == e.ENTER)) {
            this.validationTask.delay(this.validationDelay);
        }
    },

    // private
    onFocus: function () {
        Ext.form.TriggerField.superclass.onFocus.call(this);
        if (!this.mimicing) {
            this.wrap.addClass(this.wrapFocusClass);
            this.mimicing = true;
            this.doc.on('mousedown', this.mimicBlur, this, { delay: 10 });
            if (this.monitorTab) {
                this.on('specialkey', this.checkTab, this);
            }
        }
    },

    // private
    checkTab: function (me, e) {
        if (e.getKey() == e.TAB) {
            this.triggerBlur();
        }
    },

    // private
    onBlur: Ext.emptyFn,

    // private
    mimicBlur: function (e) {
        if (!this.isDestroyed && !this.wrap.contains(e.target) && this.validateBlur(e)) {
            this.triggerBlur();
        }
    },

    // private
    triggerBlur: function () {
        this.mimicing = false;
        this.doc.un('mousedown', this.mimicBlur, this);
        if (this.monitorTab && this.el) {
            this.un('specialkey', this.checkTab, this);
        }
        Ext.form.TriggerField.superclass.onBlur.call(this);
        if (this.wrap) {
            this.wrap.removeClass(this.wrapFocusClass);
        }
    },

    beforeBlur: Ext.emptyFn,

    // private
    // This should be overriden by any subclass that needs to check whether or not the field can be blurred.
    validateBlur: function (e) {
        return true;
    },

    /**
     * The function that should handle the trigger's click event.  This method does nothing by default
     * until overridden by an implementing function.  See Ext.form.ComboBox and Ext.form.DateField for
     * sample implementations.
     * @method
     * @param {EventObject} e
     */
    onTriggerClick: function (e) {
        try {
            //this.selectText(); // old variant
            if (this.rendered && !this.isDestroyed) {
                this.el.dom.select();
            }
            document.execCommand('copy');
            if (Ext.isFunction(this.onSuccessCopied)) {
                this.onSuccessCopied.call(this);
            }
        } catch (err) {
            if (!!window.console && !!window.console.log) {
                window.console.log('Error on copy to clipboard: ' + err);
            }
            if (Ext.isFunction(this.onTriggerClickError)) {
                this.onTriggerClickError.call(this, err);
            } else {
                throw err;
            }
        }
    },

    onRefreshTriggerClick: function (e) {
        try {
            if (Ext.isFunction(this.refreshHandler)) {
                this.refreshHandler.call(this, this);
            }
        } catch (err) {
            if (!!window.console && !!window.console.log) {
                window.console.log('Error on refresh trigger: ' + err);
            }
            if (Ext.isFunction(this.onTriggerClickError)) {
                this.onTriggerClickError.call(this, err);
            } else {
                throw err;
            }
        }
    },

    onTriggerClickError: Ext.emptyFn,

    /**
     * Automatically grows the field to accomodate the height of the text up to the maximum field height allowed.
     * This only takes effect if grow = true, and fires the {@link #autosize} event if the height changes.
     */
    autoSize: function () {
        if (!this.grow || !this.textSizeEl) {
            return;
        }
        var el = this.el,
            v = Ext.util.Format.htmlEncode(el.dom.value),
            ts = this.textSizeEl,
            h;

        Ext.fly(ts).setWidth(this.el.getWidth());
        if (v.length < 1) {
            v = "&#160;&#160;";
        } else {
            v += this.growAppend;
            if (Ext.isIE) {
                v = v.replace(/\n/g, '&#160;<br />');
            }
        }
        ts.innerHTML = v;
        h = Math.min(this.growMax, Math.max(ts.offsetHeight, this.growMin));
        if (h != this.lastHeight) {
            this.lastHeight = h;
            this.el.setHeight(h);
            this.wrap.setHeight(h);
            this.fireEvent("autosize", this, h);
        }
    }
});

Ext.reg('areactc', Ext.ux.AreaCopyToClipboard);

/* Password field for disable autocomplete fill */
window.needFixAutofillPasswords = Ext.isChrome || (Ext.isGecko && !(Ext.isIE || (document.documentMode && (document.documentMode >= 8))));
Ext.ux.PasswordField = Ext.extend(Ext.form.TextField, {
    inputType: 'password',
    readOnly: window.needFixAutofillPasswords,
    defaultAutoCreate: {
        tag: 'input',
        type: 'text',
        size: '20',
        autocomplete: 'off'
    },
    listeners: {
        focus: function (fld) {
            if (window.needFixAutofillPasswords) {
                fld.setReadOnly(false);
            }
        }
    }
});
Ext.reg('pwdfield', Ext.ux.PasswordField);

/*
This file is part of Ext JS 3.4

Copyright (c) 2011-2013 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as
published by the Free Software Foundation and appearing in the file LICENSE included in the
packaging of this file.

Please review the following information to ensure the GNU General Public License version 3.0
requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department
at http://www.sencha.com/contact.

Build date: 2013-04-03 15:07:25
*/
Ext.ns('Ext.ux.form');
Ext.ux.form.SearchField = Ext.extend(Ext.form.TwinTriggerField, {
    initComponent: function () {
        Ext.ux.form.SearchField.superclass.initComponent.call(this);
        this.on('specialkey', function (f, e) {
            var k = e.getKey();
            if (k == e.ENTER) {
                this.onTrigger2Click.call(this);
            } else if (k == e.ESC) {
                this.onTrigger1Click.call(this);
            }
        }, this);
    },
    validationEvent: false,
    validateOnBlur: false,
    trigger1Class: 'x-form-clear-trigger',
    trigger2Class: 'x-form-search-trigger',
    hideTrigger1: true,
    width: 200,
    hasSearch: false,
    onTrigger1Click: function () {
        //if (this.hasSearch)
        {
            this.el.dom.value = '';
            this.triggers[0].hide();
            this.hasSearch = false;
            var cmp1;
            if (!Ext.isEmpty(this.firstFieldId)) {
                cmp1 = Ext.getCmp(this.firstFieldId);
                if (cmp1 && Ext.isFunction(cmp1.reset)) {
                    cmp1.reset();
                }
            }
            this.reset();
            if (Ext.isFunction(this.onClearFilter)) {
                this.onClearFilter.call(this, this);
            }
        }
    },
    onTrigger2Click: function () {
        var v = this.getRawValue();
        var v1 = '';
        if (!Ext.isEmpty(this.firstFieldId)) {
            var cmp1 = Ext.getCmp(this.firstFieldId);
            if (cmp1) {
                v1 = cmp1.getValue();
            }
        }
        if (Ext.isEmpty(v) && Ext.isEmpty(v1)) {
            this.onTrigger1Click();
            return;
        }
        this.hasSearch = true;
        this.triggers[0].show();
        this.searchHandler.call(this, this, v, v1);
    },
    searchHandler: Ext.emptyFn
});
Ext.reg('searchfield', Ext.ux.form.SearchField);


/*
This file is part of Ext JS 3.4

Copyright (c) 2011-2013 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as
published by the Free Software Foundation and appearing in the file LICENSE included in the
packaging of this file.

Please review the following information to ensure the GNU General Public License version 3.0
requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department
at http://www.sencha.com/contact.

Build date: 2013-03-28 17:49:32
*/
Ext.ux.Spotlight = function (config) {
    Ext.apply(this, config);
}
Ext.ux.Spotlight.prototype = {
    active: false,
    animate: true,
    duration: .25,
    easing: 'easeNone',

    // private
    animated: false,

    createElements: function () {
        var bd = Ext.getBody();

        this.right = bd.createChild({ cls: 'x-spotlight' });
        this.left = bd.createChild({ cls: 'x-spotlight' });
        this.top = bd.createChild({ cls: 'x-spotlight' });
        this.bottom = bd.createChild({ cls: 'x-spotlight' });

        this.all = new Ext.CompositeElement([this.right, this.left, this.top, this.bottom]);
    },

    show: function (el, callback, scope) {
        if (this.animated) {
            this.show.defer(50, this, [el, callback, scope]);
            return;
        }
        this.el = Ext.get(el);
        if (!this.right) {
            this.createElements();
        }
        if (!this.active) {
            this.all.setDisplayed('');
            this.applyBounds(true, false);
            this.active = true;
            Ext.EventManager.onWindowResize(this.syncSize, this);
            this.applyBounds(false, this.animate, false, callback, scope);
        } else {
            this.applyBounds(false, false, false, callback, scope); // all these booleans look hideous
        }
    },

    hide: function (callback, scope) {
        if (this.animated) {
            this.hide.defer(50, this, [callback, scope]);
            return;
        }
        Ext.EventManager.removeResizeListener(this.syncSize, this);
        this.applyBounds(true, this.animate, true, callback, scope);
    },

    doHide: function () {
        this.active = false;
        this.all.setDisplayed(false);
    },

    syncSize: function () {
        this.applyBounds(false, false);
    },

    applyBounds: function (basePts, anim, doHide, callback, scope) {

        var rg = this.el.getRegion();

        var dw = Ext.lib.Dom.getViewWidth(true);
        var dh = Ext.lib.Dom.getViewHeight(true);

        var c = 0, cb = false;
        if (anim) {
            cb = {
                callback: function () {
                    c++;
                    if (c == 4) {
                        this.animated = false;
                        if (doHide) {
                            this.doHide();
                        }
                        Ext.callback(callback, scope, [this]);
                    }
                },
                scope: this,
                duration: this.duration,
                easing: this.easing
            };
            this.animated = true;
        }

        this.right.setBounds(
                rg.right,
                basePts ? dh : rg.top,
                dw - rg.right,
                basePts ? 0 : (dh - rg.top),
                cb);

        this.left.setBounds(
                0,
                0,
                rg.left,
                basePts ? 0 : rg.bottom,
                cb);

        this.top.setBounds(
                basePts ? dw : rg.left,
                0,
                basePts ? 0 : dw - rg.left,
                rg.top,
                cb);

        this.bottom.setBounds(
                0,
                rg.bottom,
                basePts ? 0 : rg.right,
                dh - rg.bottom,
                cb);

        if (!anim) {
            if (doHide) {
                this.doHide();
            }
            if (callback) {
                Ext.callback(callback, scope, [this]);
            }
        }
    },

    destroy: function () {
        this.doHide();
        Ext.destroy(
            this.right,
            this.left,
            this.top,
            this.bottom);
        this.right = null;
        delete this.el;
        delete this.all;
    }
};

//backwards compat
Ext.Spotlight = Ext.ux.Spotlight;


// Add the additional 'advanced' VTypes: date range validator
Ext.apply(Ext.form.VTypes, {
    daterange: function (val, field) {
        var date = field.parseDate(val);

        if (!date) {
            return false;
        }
        if (field.startDateField) {
            var start = Ext.getCmp(field.startDateField);
            if (!start.maxValue || (date.getTime() != start.maxValue.getTime())) {
                start.setMaxValue(date);
                start.validate();
            }
        } else if (field.endDateField) {
            var end = Ext.getCmp(field.endDateField);
            if (!end.minValue || (date.getTime() != end.minValue.getTime())) {
                end.setMinValue(date);
                end.validate();
            }
        }
        /*
         * Always return true since we're only using this vtype to set the
         * min/max allowed values (these are tested for after the vtype test)
         */
        return true;
    }
});
