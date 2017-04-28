// Add delayed debounce invokes for functions
Function.prototype.debounce = function (delay, ctx) {
    var fn = this, timer;
    return function () {
        var args = arguments, that = this;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(ctx || that, args);
        }, delay);
    };
};

// Override constructor and doSend method for Ext.direct.RemotingProvider
// Need for get request object with XMLHttpRequest connection for abort previously
// calls of MetadataHandler.Load on select items in grid
Ext.override(Ext.direct.RemotingProvider, {
    constructor: function (config) {
        Ext.direct.RemotingProvider.superclass.constructor.call(this, config);
        this.addEvents(
            /**
             * @event beforecall
             * Fires immediately before the client-side sends off the RPC call.
             * By returning false from an event handler you can prevent the call from
             * executing.
             * @param {Ext.direct.RemotingProvider} provider
             * @param {Ext.Direct.Transaction} transaction
             */
            'beforecall',
            /**
             * @event call
             * Fires immediately after the request to the server-side is sent. This does
             * NOT fire after the response has come back from the call.
             * @param {Ext.direct.RemotingProvider} provider
             * @param {Ext.Direct.Transaction} transaction
             */
            'call',
            /**
             * @event requestcreated
             * Fires immediately after the invoked Ext.Ajax.request
             * @param {Ext.direct.RemotingProvider} provider
             * @param {Object} opt - request parameters
             * @param {Object} req - { conn: XMLHttpRequest, tId: Number (transaction Id) }
             */
            'requestcreated'
        );
        this.namespace = (Ext.isString(this.namespace)) ? Ext.ns(this.namespace) : this.namespace || window;
        this.transactions = {};
        this.callBuffer = [];
    },
    doSend: function (data) {
        var o = {
            url: this.url,
            callback: this.onData,
            scope: this,
            ts: data,
            timeout: this.timeout
        }, callData;

        if (Ext.isArray(data)) {
            callData = [];
            for (var i = 0, len = data.length; i < len; i++) {
                callData.push(this.getCallData(data[i]));
            }
        } else {
            callData = this.getCallData(data);
        }

        if (this.enableUrlEncode) {
            var params = {};
            params[Ext.isString(this.enableUrlEncode) ? this.enableUrlEncode : 'data'] = Ext.encode(callData);
            o.params = params;
        } else {
            o.jsonData = callData;
        }

        // overrides, instead only line:
        //Ext.Ajax.request(o);
        var req = Ext.Ajax.request(o); // new code
        this.fireEvent('requestcreated', this, o, req); // new code
    }
});

// Override Ext.grid.GridView to keep position in grid view when needed
Ext.override(Ext.grid.GridView, {
    holdPosition: false,
    onLoad: function () { // old body contains only one line: this.scrollToTop.defer(Ext.isGecko ? 1 : 0, this);
        try {
            if (!this.holdPosition) {
                this.scrollToTop(); // this.scrollToTop.defer(Ext.isGecko ? 1 : 0, this);
            }
            this.holdPosition = false;
        } catch (e) {
            if (!!window.console && !!window.console.log) {
                window.console.log(e);
            }
        }
    },
    /**
     * Returns the grid's <tt>&lt;td></tt> HtmlElement at the specified coordinates.
     * @param {Number} row The row index in which to find the cell.
     * @param {Number} col The column index of the cell.
     * @return {HtmlElement} The td at the specified coordinates.
     */
    getCell: function (row, col) {
        var r = this.getRow(row);
        return !!r ? r.getElementsByTagName('td')[col] : null;
    },

    skipSyncFocusRow: false,

    /**
     * @private
     * Returns the XY co-ordinates of a given row/cell resolution (see {@link #resolveCell})
     * @return {Array} X and Y coords
     */
    getResolvedXY: function (resolved) {
        if (!resolved) {
            return null;
        }

        var cell = resolved.cell,
            row = resolved.row;

        if (cell) {
            return Ext.fly(cell).getXY();
        } else {
            return [this.el.getX(), Ext.fly(row).getY()];
        }
    },

    syncFocusElImpl: function (row, col, hscroll) {
        var xy = row;

        if (!Ext.isArray(xy)) {
            row = Math.min(row, Math.max(0, this.getRows().length - 1));

            if (isNaN(row)) {
                return;
            }

            xy = this.getResolvedXY(this.resolveCell(row, col, hscroll));
        }

        this.focusEl.setXY(xy || this.scroller.getXY());
    },

    /**
     * @private
     * Moves the focus element to the x and y co-ordinates of the given row and column
     */
    syncFocusEl: function (row, col, hscroll) {
        var me = this;
        if (me.skipSyncFocusRow === true) {
            window.setTimeout(function () {
                me.syncFocusElImpl.call(me, row, col, hscroll);
            }, 1);
        } else {
            me.syncFocusElImpl(row, col, hscroll);
        }
    },

    /**
     * Focuses the specified cell.
     * @param {Number} row The row index
     * @param {Number} col The column index
     */
    focusCell: function (row, col, hscroll) {
        this.syncFocusElImpl(this.ensureVisible(row, col, hscroll));
        if (Ext.isGecko) {
            this.focusEl.focus();
        } else {
            this.focusEl.focus.defer(1, this.focusEl);
        }
    },

    skipLayoutOnUpdateColumnHidden: false,

    /**
     * @private
     * Sets the hidden status of a given column.
     * @param {Number} col The column index
     * @param {Boolean} hidden True to make the column hidden
     */
    updateColumnHidden: function (col, hidden) {
        var tw = this.getTotalWidth();
        this.innerHd.firstChild.style.width = this.getOffsetWidth();
        this.innerHd.firstChild.firstChild.style.width = tw;
        this.mainBody.dom.style.width = tw;
        var display = hidden ? 'none' : '';

        var hd = this.getHeaderCell(col);
        hd.style.display = display;

        var ns = this.getRows(), row;
        for (var i = 0, len = ns.length; i < len; i++) {
            row = ns[i];
            row.style.width = tw;
            if (row.firstChild) {
                row.firstChild.style.width = tw;
                row.firstChild.rows[0].childNodes[col].style.display = display;
            }
        }

        this.onColumnHiddenUpdated(col, hidden, tw);
        delete this.lastViewWidth; // force recalc
        if (!(this.skipLayoutOnUpdateColumnHidden === true)) { // fix for slow render in Firefox, IE, Edge
            this.layout();
        }
    }
});

// Override process event for Ext.grid.GridPanel class
Ext.override(Ext.grid.GridPanel, {
    processEvent: function (name, e) { // old body contains only one line: this.view.processEvent(name, e);
        this.fireEvent(name, e);
        var t = e.getTarget();
        var v = this.view;
        var header = v.findHeaderIndex(t);
        if (header !== false) {
            this.fireEvent('header' + name, this, header, e);
        } else {
            var row = v.findRowIndex(t);
            var cell = v.findCellIndex(t);
            if (row !== false) {
                this.fireEvent('row' + name, this, row, e);
                if (cell !== false) {
                    this.fireEvent('cell' + name, this, row, cell, e);
                }
            } else {
                this.fireEvent('container' + name, this, e);
                this.fireEvent(name, e);
            }
        }
    }
});

// Override Ext.form.ComboBox for query filter by substring instead begin of field
Ext.override(Ext.form.ComboBox, {
    /**
     * Execute a query to filter the dropdown list.  Fires the {@link #beforequery} event prior to performing the
     * query allowing the query action to be canceled if needed.
     * @param {String} query The SQL query to execute
     * @param {Boolean} forceAll <tt>true</tt> to force the query to execute even if there are currently fewer
     * characters in the field than the minimum specified by the <tt>{@link #minChars}</tt> config option.  It
     * also clears any filter previously saved in the current store (defaults to <tt>false</tt>)
     */
    doQuery: function (q, forceAll) {
        q = Ext.isEmpty(q) ? '' : q;
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
        if (forceAll === true || (q.length >= this.minChars)) {
            if (this.lastQuery !== q) {
                this.lastQuery = q;
                if (this.mode == 'local') {
                    this.selectedIndex = -1;
                    if (forceAll) {
                        this.store.clearFilter();
                    } else {
                        this.store.filter(this.displayField, q, true, false); // fix instead this.store.filter(this.displayField, q);
                    }
                    this.onLoad();
                } else {
                    this.store.baseParams[this.queryParam] = q;
                    this.store.load({
                        params: this.getParams(q)
                    });
                    this.expand();
                }
            } else {
                this.selectedIndex = -1;
                this.onLoad();
            }
        }
    }
});

// Override Ext.direct.RemotingProvider for prevent double requests on timeouts
Ext.override(Ext.direct.RemotingProvider, {
    /**
     * @cfg {Number} maxRetries
     * Number of times to re-attempt delivery on failure of a call. Defaults to <tt>1</tt>.
     */
    maxRetries: 0 // only one request if error
});

// override Ext.grid.ColumnModel for prevent event 'hidenchange' on set column hidden flag (by specified 3th arg)
Ext.override(Ext.grid.ColumnModel, {
    /**
     * Sets if a column is hidden.
<pre><code>
myGrid.getColumnModel().setHidden(0, true); // hide column 0 (0 = the first column).
</code></pre>
     * @param {Number} colIndex The column index
     * @param {Boolean} hidden True if the column is hidden
     * @param {Boolean} suppressEvent True if do not invoke 'hiddenchange' event
     */
    setHidden: function (colIndex, hidden, suppressEvent) {// suppressEvent - new parameter
        var c = this.config[colIndex];
        if (c.hidden !== hidden) {
            c.hidden = hidden;
            this.totalWidth = null;
            if (!(suppressEvent === true)) // new line
                this.fireEvent("hiddenchange", this, colIndex, hidden);
        }
    }
});

// override Ext.grid.RowSelectionModel for silent (without rowselect and selectionchange invokes) selectAll and invertSelection
Ext.override(Ext.grid.RowSelectionModel, {
    /**
     * Selects a row.  Before selecting a row, checks if the selection model
     * {@link Ext.grid.AbstractSelectionModel#isLocked is locked} and fires the
     * {@link #beforerowselect} event.  If these checks are satisfied the row
     * will be selected and followed up by  firing the {@link #rowselect} and
     * {@link #selectionchange} events.
     * @param {Number} row The index of the row to select
     * @param {Boolean} keepExisting (optional) <tt>true</tt> to keep existing selections
     * @param {Boolean} preventViewNotify (optional) Specify <tt>true</tt> to
     * prevent notifying the view (disables updating the selected appearance)
     */
    selectRow : function(index, keepExisting, preventViewNotify){
        if(this.isLocked() || (index < 0 || index >= this.grid.store.getCount()) || (keepExisting && this.isSelected(index))){
            return;
        }
        var r = this.grid.store.getAt(index);
        if(r && this.fireEvent('beforerowselect', this, index, keepExisting, r) !== false){
            if(!keepExisting || this.singleSelect){
                this.clearSelections();
            }
            this.selections.add(r);
            this.last = this.lastActive = index;
            if(!preventViewNotify){
                this.grid.getView().onRowSelect(index);
            }
            if(!this.silent){
                this.fireEvent('rowselect', this, index, r);
                this.fireEvent('selectionchange', this);
            }
        }
    },

    /**
     * Deselects a row.  Before deselecting a row, checks if the selection model
     * {@link Ext.grid.AbstractSelectionModel#isLocked is locked}.
     * If this check is satisfied the row will be deselected and followed up by
     * firing the {@link #rowdeselect} and {@link #selectionchange} events.
     * @param {Number} row The index of the row to deselect
     * @param {Boolean} preventViewNotify (optional) Specify <tt>true</tt> to
     * prevent notifying the view (disables updating the selected appearance)
     */
    deselectRow: function (index, preventViewNotify) {
        if (this.isLocked()) {
            return;
        }
        if (this.last == index) {
            this.last = false;
        }
        if (this.lastActive == index) {
            this.lastActive = false;
        }
        var r = this.grid.store.getAt(index);
        if (r) {
            this.selections.remove(r);
            if (!preventViewNotify) {
                this.grid.getView().onRowDeselect(index);
            }
            if (!this.silent) {
                this.fireEvent('rowdeselect', this, index, r);
                this.fireEvent('selectionchange', this);
            }
        }
    },

    /**
     * Clears all selections if the selection model
     * {@link Ext.grid.AbstractSelectionModel#isLocked is not locked}.
     * @param {Boolean} fast (optional) <tt>true</tt> to bypass the
     * conditional checks and events described in {@link #deselectRow}.
     */
    clearSelections: function (fast) {
        if (this.isLocked()) {
            return;
        }
        if (fast !== true) {
            var ds = this.grid.store;
            var s = this.selections;
            var lastRow, lastIndex;
            this.silent = true;
            s.each(function (r) {
                lastIndex = ds.indexOfId(r.id);
                this.deselectRow(lastIndex);
                lastRow = r;
            }, this);
            this.silent = false;
            s.clear();
            this.last = false;
            if (!!lastRow) {
                this.fireEvent('rowdeselect', this, lastIndex, lastRow);
                this.fireEvent('selectionchange', this);
            }
        } else {
            this.selections.clear();
            this.last = false;
        }
    }
});
