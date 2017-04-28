/*!
 * Ext JS Library 3.1.1, 3.3.1
 * Copyright(c) 2006-2010 Ext JS, LLC
 * licensing@extjs.com
 * http://www.extjs.com/license
 * Features was modified by Element-IT Software
 */
;
Ext.ns("Ext.ux.form");
Ext.ux.form.FileUploadField=Ext.extend(Ext.form.TextField,{buttonText:"Browse...",buttonOnly:false,buttonOffset:3,readOnly:false,autoSize:Ext.emptyFn,initComponent:function(){Ext.ux.form.FileUploadField.superclass.initComponent.call(this);
this.addEvents("fileselected")
},onRender:function(c,a){Ext.ux.form.FileUploadField.superclass.onRender.call(this,c,a);
this.wrap=this.el.wrap({cls:"x-form-field-wrap x-form-file-wrap"});
this.el.addClass("x-form-file-text");
this.el.dom.removeAttribute("name");
this.createFileInput();
var b=Ext.applyIf(this.buttonCfg||{},{text:this.buttonText});
this.button=new Ext.Button(Ext.apply(b,{renderTo:this.wrap,cls:"x-form-file-btn"+(b.iconCls?" x-btn-icon":"")}));
if(this.buttonOnly){this.el.hide();
this.wrap.setWidth(this.button.getEl().getWidth())
}this.bindListeners();
this.resizeEl=this.positionEl=this.wrap
},bindListeners:function(){this.fileInput.on({scope:this,mouseenter:function(){this.button.addClass(["x-btn-over","x-btn-focus"])
},mouseleave:function(){this.button.removeClass(["x-btn-over","x-btn-focus","x-btn-click"])
},mousedown:function(){this.button.addClass("x-btn-click")
},mouseup:function(){this.button.removeClass(["x-btn-over","x-btn-focus","x-btn-click"])
},change:function(){var a=this.fileInput.dom.value;
this.setValue((a||"").replace(/^C:[\\\/]fakepath[\\\/]/gi,""));
this.fireEvent("fileselected",this,a)
}})
},createFileInput:function(){var a={id:this.getFileInputId(),name:this.name||this.getId(),cls:"x-form-file",tag:"input",type:"file",size:1};
if(!Ext.isEmpty(this.accept)){a.accept=this.accept
}this.fileInput=this.wrap.createChild(a)
},reset:function(){this.fileInput.remove();
this.createFileInput();
this.bindListeners();
Ext.ux.form.FileUploadField.superclass.reset.call(this)
},getFileInputId:function(){return this.id+"-file"
},onResize:function(a,b){Ext.ux.form.FileUploadField.superclass.onResize.call(this,a,b);
this.wrap.setWidth(a);
if(!this.buttonOnly){var a=this.wrap.getWidth()-this.button.getEl().getWidth()-this.buttonOffset;
this.el.setWidth(a)
}},onDestroy:function(){Ext.ux.form.FileUploadField.superclass.onDestroy.call(this);
Ext.destroy(this.fileInput,this.button,this.wrap)
},onDisable:function(){Ext.ux.form.FileUploadField.superclass.onDisable.call(this);
this.doDisable(true)
},onEnable:function(){Ext.ux.form.FileUploadField.superclass.onEnable.call(this);
this.doDisable(false)
},doDisable:function(a){this.fileInput.dom.disabled=a;
this.button.setDisabled(a)
},preFocus:Ext.emptyFn,alignErrorIcon:function(){this.errorIcon.alignTo(this.wrap,"tl-tr",[2,0])
}});
Ext.reg("fileuploadfield",Ext.ux.form.FileUploadField);
Ext.form.FileUploadField=Ext.ux.form.FileUploadField;
Ext.ux.form.MultipleFileUploadField=Ext.extend(Ext.form.TextField,{buttonText:"Browse...",buttonOnly:false,buttonOffset:3,uploadFolders:false,readOnly:true,autoSize:Ext.emptyFn,initComponent:function(){Ext.ux.form.MultipleFileUploadField.superclass.initComponent.call(this);
this.addEvents("fileselected")
},onRender:function(c,a){Ext.ux.form.MultipleFileUploadField.superclass.onRender.call(this,c,a);
this.wrap=this.el.wrap({cls:"x-form-field-wrap x-form-file-wrap"});
this.el.addClass("x-form-file-text");
this.el.dom.removeAttribute("name");
this.createFileInput();
var b=Ext.applyIf(this.buttonCfg||{},{text:this.buttonText});
this.button=new Ext.Button(Ext.apply(b,{renderTo:this.wrap,cls:"x-form-file-btn"+(b.iconCls?" x-btn-icon":"")}));
if(this.buttonOnly){this.el.hide();
this.wrap.setWidth(this.button.getEl().getWidth())
}this.bindListeners();
this.resizeEl=this.positionEl=this.wrap
},bindListeners:function(){this.fileInput.on({scope:this,mouseenter:function(){this.button.addClass(["x-btn-over","x-btn-focus"])
},mouseleave:function(){this.button.removeClass(["x-btn-over","x-btn-focus","x-btn-click"])
},mousedown:function(){this.button.addClass("x-btn-click")
},mouseup:function(){this.button.removeClass(["x-btn-over","x-btn-focus","x-btn-click"])
},change:function(){var a=this.fileInput.dom.value;
var c=this.fileInput.dom.files;
if(c){a="";
for(var b=0;
b<c.length;
b++){if(c[b].name!=="."){if(c[b].webkitRelativePath&&c[b].webkitRelativePath!=""){a+=c[b].webkitRelativePath
}else{a+=c[b].name
}a+=", "
}}if(a.length>2){a=a.substring(0,a.length-2)
}this.setValue(a)
}else{this.setValue((a||"").replace(/^C:[\\\/]fakepath[\\\/]/gi,""))
}this.fireEvent("fileselected",this,c?c:a)
}})
},createFileInput:function(){var b={id:this.getFileInputId(),name:this.name||this.getId(),cls:"x-form-file",tag:"input",type:"file",multiple:"multiple",size:1};
if(this.uploadFolders){b.webkitdirectory="";
b.directory="";
b.mozdirectory="";
b.msdirectory="";
b.odirectory=""
}var a=this.chunkedUpload&&typeof this.onchangeForChunked=="function";
if(this.wrap){this.fileInput=this.wrap.createChild(b);
if(this.fileInput.dom&&a){this.fileInput.dom.onchange=this.onchangeForChunked
}}},reset:function(){if(this.fileInput){this.fileInput.remove()
}this.createFileInput();
if(this.fileInput){this.bindListeners()
}Ext.ux.form.MultipleFileUploadField.superclass.reset.call(this)
},getFiles:function(){if(this.fileInput){if(this.fileInput.dom.files){return this.fileInput.dom.files
}else{return this.fileInput.dom.value
}}return null
},setFileInputDisabled:function(a){if(this.chunkedUpload&&this.fileInput&&this.fileInput.dom){this.fileInput.dom.disabled=a===true
}},getFileInputId:function(){return this.id+"-file"
},onResize:function(a,b){Ext.ux.form.MultipleFileUploadField.superclass.onResize.call(this,a,b);
this.wrap.setWidth(a);
if(!this.buttonOnly){var a=this.wrap.getWidth()-this.button.getEl().getWidth()-this.buttonOffset;
this.el.setWidth(a)
}this.wrap.setHeight(24)
},onDestroy:function(){Ext.ux.form.MultipleFileUploadField.superclass.onDestroy.call(this);
Ext.destroy(this.fileInput,this.button,this.wrap)
},onDisable:function(){Ext.ux.form.MultipleFileUploadField.superclass.onDisable.call(this);
this.doDisable(true)
},onEnable:function(){Ext.ux.form.MultipleFileUploadField.superclass.onEnable.call(this);
this.doDisable(false)
},doDisable:function(a){this.fileInput.dom.disabled=a;
this.button.setDisabled(a)
},preFocus:Ext.emptyFn,alignErrorIcon:function(){this.errorIcon.alignTo(this.wrap,"tl-tr",[2,0])
}});
Ext.reg("multiplefileuploadfield",Ext.ux.form.MultipleFileUploadField);
Ext.form.MultipleFileUploadField=Ext.ux.form.MultipleFileUploadField;
Ext.ns("Ext.ux.grid");
Ext.ux.grid.CheckColumn=Ext.extend(Ext.grid.Column,{processEvent:function(c,f,d,g,b){if(c=="mousedown"){var a=d.store.getAt(g);
a.set(this.dataIndex,!a.data[this.dataIndex]);
return false
}else{return Ext.grid.ActionColumn.superclass.processEvent.apply(this,arguments)
}},renderer:function(b,c,a){c.css+=" x-grid3-check-col-td";
return String.format('<div class="x-grid3-check-col{0}">&#160;</div>',b?"-on":"")
},init:Ext.emptyFn});
Ext.preg("checkcolumn",Ext.ux.grid.CheckColumn);
Ext.grid.CheckColumn=Ext.ux.grid.CheckColumn;
Ext.grid.Column.types.checkcolumn=Ext.ux.grid.CheckColumn;
Ext.ns("Ext.ux.menu");
Ext.ux.menu.RangeMenu=Ext.extend(Ext.menu.Menu,{constructor:function(c){Ext.ux.menu.RangeMenu.superclass.constructor.call(this,c);
this.addEvents("update");
this.updateTask=new Ext.util.DelayedTask(this.fireUpdate,this);
var d,a,e,b,f;
for(d=0,a=this.menuItems.length;
d<a;
d++){e=this.menuItems[d];
if(e!=="-"){b={itemId:"range-"+e,enableKeyEvents:true,iconCls:this.iconCls[e]||"no-icon",listeners:{scope:this,keyup:this.onInputKeyUp}};
Ext.apply(b,Ext.applyIf(this.fields[e]||{},this.fieldCfg[e]),this.menuItemCfgs);
f=b.fieldCls||this.fieldCls;
e=this.fields[e]=new f(b)
}this.add(e)
}},fireUpdate:function(){this.fireEvent("update",this)
},getValue:function(){var a={},b,c;
for(b in this.fields){c=this.fields[b];
if(c.isValid()&&String(c.getValue()).length>0){a[b]=c.getValue()
}}return a
},setValue:function(b){var a;
for(a in this.fields){this.fields[a].setValue(b[a]!==undefined?b[a]:"")
}this.fireEvent("update",this)
},onInputKeyUp:function(c,b){var a=b.getKey();
if(a==b.RETURN&&c.isValid()){b.stopEvent();
this.hide(true);
return
}if(c==this.fields.eq){if(this.fields.gt){this.fields.gt.setValue(null)
}if(this.fields.lt){this.fields.lt.setValue(null)
}}else{this.fields.eq.setValue(null)
}this.updateTask.delay(this.updateBuffer)
}});
Ext.ux.menu.ListMenu=Ext.extend(Ext.menu.Menu,{labelField:"text",loadingText:"Loading...",loadOnShow:true,single:false,constructor:function(b){this.selected=[];
this.addEvents("checkchange");
Ext.ux.menu.ListMenu.superclass.constructor.call(this,b=b||{});
if(!b.store&&b.options){var c=[];
for(var d=0,a=b.options.length;
d<a;
d++){var e=b.options[d];
switch(Ext.type(e)){case"array":c.push(e);
break;
case"object":c.push([e.id,e[this.labelField]]);
break;
case"string":c.push([e,e]);
break
}}this.store=new Ext.data.Store({reader:new Ext.data.ArrayReader({id:0},["id",this.labelField]),data:c,listeners:{load:this.onLoad,scope:this}});
this.loaded=true
}else{this.add({text:this.loadingText,iconCls:"loading-indicator"});
this.store.on("load",this.onLoad,this)
}},destroy:function(){if(this.store){this.store.destroy()
}Ext.ux.menu.ListMenu.superclass.destroy.call(this)
},show:function(){var a=null;
return function(){if(arguments.length===0){Ext.ux.menu.ListMenu.superclass.show.apply(this,a)
}else{a=arguments;
if(this.loadOnShow&&!this.loaded){this.store.load()
}Ext.ux.menu.ListMenu.superclass.show.apply(this,arguments)
}}
}(),onLoad:function(c,b){var g=this.isVisible();
this.hide(false);
this.removeAll(true);
var e=this.single?Ext.id():null;
for(var d=0,a=b.length;
d<a;
d++){var f=new Ext.menu.CheckItem({text:b[d].get(this.labelField),group:e,checked:this.selected.indexOf(b[d].id)>-1,hideOnClick:false});
f.itemId=b[d].id;
f.on("checkchange",this.checkChange,this);
this.add(f)
}this.loaded=true;
if(g){this.show()
}this.fireEvent("load",this,b)
},getSelected:function(){return this.selected
},setSelected:function(a){a=this.selected=[].concat(a);
if(this.loaded){this.items.each(function(d){d.setChecked(false,true);
for(var c=0,b=a.length;
c<b;
c++){if(d.itemId==a[c]){d.setChecked(true,true)
}}},this)
}},checkChange:function(b,a){var c=[];
this.items.each(function(d){if(d.checked){c.push(d.itemId)
}},this);
this.selected=c;
this.fireEvent("checkchange",b,a)
}});
Ext.ux.grid.GridFilters=Ext.extend(Ext.util.Observable,{autoReload:true,filterCls:"ux-filtered-column",local:false,menuFilterText:"Filters",paramPrefix:"filter",showMenu:true,stateId:undefined,updateBuffer:500,constructor:function(a){a=a||{};
this.deferredUpdate=new Ext.util.DelayedTask(this.reload,this);
this.filters=new Ext.util.MixedCollection();
this.filters.getKey=function(b){return b?b.dataIndex:null
};
this.addFilters(a.filters);
delete a.filters;
Ext.apply(this,a)
},init:function(a){if(a instanceof Ext.grid.GridPanel){this.grid=a;
this.bindStore(this.grid.getStore(),true);
if(this.filters.getCount()==0){this.addFilters(this.grid.getColumnModel())
}this.grid.filters=this;
this.grid.addEvents({filterupdate:true});
a.on({scope:this,beforestaterestore:this.applyState,beforestatesave:this.saveState,beforedestroy:this.destroy,reconfigure:this.onReconfigure});
if(a.rendered){this.onRender()
}else{a.on({scope:this,single:true,render:this.onRender})
}}else{if(a instanceof Ext.PagingToolbar){this.toolbar=a
}}},applyState:function(b,d){var a,c;
this.applyingState=true;
this.clearFilters();
if(d.filters){for(a in d.filters){c=this.filters.get(a);
if(c){c.setValue(d.filters[a]);
c.setActive(true)
}}}this.deferredUpdate.cancel();
if(this.local){this.reload()
}delete this.applyingState;
delete d.filters
},saveState:function(a,c){var b={};
this.filters.each(function(d){if(d.active){b[d.dataIndex]=d.getValue()
}});
return(c.filters=b)
},onRender:function(){this.grid.getView().on("refresh",this.onRefresh,this);
this.createMenu()
},destroy:function(){this.removeAll();
this.purgeListeners();
if(this.filterMenu){Ext.menu.MenuMgr.unregister(this.filterMenu);
this.filterMenu.destroy();
this.filterMenu=this.menu.menu=null
}},removeAll:function(){if(this.filters){Ext.destroy.apply(Ext,this.filters.items);
this.filters.clear()
}},bindStore:function(a,b){if(!b&&this.store){if(this.local){a.un("load",this.onLoad,this)
}else{a.un("beforeload",this.onBeforeLoad,this)
}}if(a){if(this.local){a.on("load",this.onLoad,this)
}else{a.on("beforeload",this.onBeforeLoad,this)
}}this.store=a
},onReconfigure:function(){this.bindStore(this.grid.getStore());
this.store.clearFilter();
this.removeAll();
this.addFilters(this.grid.getColumnModel());
this.updateColumnHeadings()
},createMenu:function(){var a=this.grid.getView(),b=a.hmenu;
if(this.showMenu&&b){this.sep=b.addSeparator();
this.filterMenu=new Ext.menu.Menu({id:this.grid.id+"-filters-menu"});
this.menu=b.add({checked:false,itemId:"filters",text:this.menuFilterText,menu:this.filterMenu});
this.menu.on({scope:this,checkchange:this.onCheckChange,beforecheckchange:this.onBeforeCheck});
b.on("beforeshow",this.onMenu,this)
}this.updateColumnHeadings()
},getMenuFilter:function(){var a=this.grid.getView();
if(!a||a.hdCtxIndex===undefined){return null
}return this.filters.get(a.cm.config[a.hdCtxIndex].dataIndex)
},onMenu:function(b){var a=this.getMenuFilter();
if(a){this.menu.menu=a.menu;
this.menu.setChecked(a.active,false);
this.menu.setDisabled(a.disabled===true)
}this.menu.setVisible(a!==undefined);
this.sep.setVisible(a!==undefined)
},onCheckChange:function(a,b){this.getMenuFilter().setActive(b)
},onBeforeCheck:function(a,b){return !b||this.getMenuFilter().isActivatable()
},onStateChange:function(b,a){if(b==="serialize"){return
}if(a==this.getMenuFilter()){this.menu.setChecked(a.active,false)
}if((this.autoReload||this.local)&&!this.applyingState){this.deferredUpdate.delay(this.updateBuffer)
}this.updateColumnHeadings();
if(!this.applyingState){this.grid.saveState()
}this.grid.fireEvent("filterupdate",this,a)
},onBeforeLoad:function(a,b){b.params=b.params||{};
this.cleanParams(b.params);
var c=this.buildQuery(this.getFilterData());
Ext.apply(b.params,c)
},onLoad:function(a,b){a.filterBy(this.getRecordFilter())
},onRefresh:function(){this.updateColumnHeadings()
},updateColumnHeadings:function(){var b=this.grid.getView(),c,a,d;
if(b.mainHd){for(c=0,a=b.cm.config.length;
c<a;
c++){d=this.getFilter(b.cm.config[c].dataIndex);
Ext.fly(b.getHeaderCell(c))[d&&d.active?"addClass":"removeClass"](this.filterCls)
}}},reload:function(){if(this.local){if(!!this.grid&&!!this.grid.store){this.grid.store.clearFilter(true);
this.grid.store.filterBy(this.getRecordFilter())
}}else{var b,a=this.grid.store;
this.deferredUpdate.cancel();
if(this.toolbar){b=a.paramNames.start;
if(a.lastOptions&&a.lastOptions.params&&a.lastOptions.params[b]){a.lastOptions.params[b]=0
}}a.reload()
}},getRecordFilter:function(){var c=[],a,b;
this.filters.each(function(d){if(d.active){c.push(d)
}});
a=c.length;
return function(d){for(b=0;
b<a;
b++){if(!c[b].validateRecord(d)){return false
}}return true
}
},addFilter:function(a){var c=this.getFilterClass(a.type),b=a.menu?a:(new c(a));
this.filters.add(b);
Ext.util.Observable.capture(b,this.onStateChange,this);
return b
},addFilters:function(f){if(f){var c,b,e,a=false,d;
if(f instanceof Ext.grid.ColumnModel){f=f.config;
a=true
}for(c=0,b=f.length;
c<b;
c++){e=false;
if(a){d=f[c].dataIndex;
e=f[c].filter||f[c].filterable;
if(e){e=(e===true)?{}:e;
Ext.apply(e,{dataIndex:d});
e.type=e.type||this.store.fields.get(d).type.type
}}else{e=f[c]
}if(e){this.addFilter(e)
}}}},getFilter:function(a){return this.filters.get(a)
},clearFilters:function(){this.filters.each(function(a){a.setActive(false)
})
},getFilterData:function(){var c=[],b,a;
this.filters.each(function(e){if(e.active){var g=[].concat(e.serialize());
for(b=0,a=g.length;
b<a;
b++){c.push({field:e.dataIndex,data:g[b]})
}}});
return c
},buildQuery:function(b){var a={},c,h,j,e,k,d,g=b.length;
if(!this.encode){for(c=0;
c<g;
c++){h=b[c];
j=[this.paramPrefix,"[",c,"]"].join("");
a[j+"[field]"]=h.field;
e=j+"[data]";
for(k in h.data){a[[e,"[",k,"]"].join("")]=h.data[k]
}}}else{d=[];
for(c=0;
c<g;
c++){h=b[c];
d.push(Ext.apply({},{field:h.field},h.data))
}if(d.length>0){a[this.paramPrefix]=Ext.util.JSON.encode(d)
}}return a
},cleanParams:function(c){if(this.encode){delete c[this.paramPrefix]
}else{var b,a;
b=new RegExp("^"+this.paramPrefix+"[[0-9]+]");
for(a in c){if(b.test(a)){delete c[a]
}}}},getFilterClass:function(a){switch(a){case"auto":a="string";
break;
case"int":case"float":a="numeric";
break;
case"bool":a="boolean";
break
}return Ext.ux.grid.filter[a.substr(0,1).toUpperCase()+a.substr(1)+"Filter"]
}});
Ext.preg("gridfilters",Ext.ux.grid.GridFilters);
Ext.ns("Ext.ux.grid.filter");
Ext.ux.grid.filter.Filter=Ext.extend(Ext.util.Observable,{active:false,dataIndex:null,menu:null,updateBuffer:500,constructor:function(a){Ext.apply(this,a);
this.addEvents("activate","deactivate","serialize","update");
Ext.ux.grid.filter.Filter.superclass.constructor.call(this);
this.menu=new Ext.menu.Menu();
this.init(a);
if(a&&a.value){this.setValue(a.value);
this.setActive(a.active!==false,true);
delete a.value
}},destroy:function(){if(this.menu){this.menu.destroy()
}this.purgeListeners()
},init:Ext.emptyFn,getValue:Ext.emptyFn,setValue:Ext.emptyFn,isActivatable:function(){return true
},getSerialArgs:Ext.emptyFn,validateRecord:function(){return true
},serialize:function(){var a=this.getSerialArgs();
this.fireEvent("serialize",a,this);
return a
},fireUpdate:function(){if(this.active){this.fireEvent("update",this)
}this.setActive(this.isActivatable())
},setActive:function(b,a){if(this.active!=b){this.active=b;
if(a!==true){this.fireEvent(b?"activate":"deactivate",this)
}}}});
Ext.ux.grid.filter.StringFilter=Ext.extend(Ext.ux.grid.filter.Filter,{iconCls:"ux-gridfilter-text-icon",emptyText:"Enter Filter Text...",selectOnFocus:true,width:125,init:function(a){Ext.applyIf(a,{enableKeyEvents:true,iconCls:this.iconCls,listeners:{scope:this,keyup:this.onInputKeyUp}});
this.inputItem=new Ext.form.TextField(a);
this.menu.add(this.inputItem);
this.updateTask=new Ext.util.DelayedTask(this.fireUpdate,this)
},getValue:function(){return this.inputItem.getValue()
},setValue:function(a){this.inputItem.setValue(a);
this.fireEvent("update",this)
},isActivatable:function(){return(this.inputItem.getValue()||"").length>0
},getSerialArgs:function(){return{type:"string",value:this.getValue()}
},validateRecord:function(a){var b=a.get(this.dataIndex);
if(typeof b!="string"){return(this.getValue().length===0)
}return b.toLowerCase().indexOf(this.getValue().toLowerCase())>-1
},onInputKeyUp:function(c,b){var a=b.getKey();
if(a==b.RETURN&&c.isValid()){b.stopEvent();
this.menu.hide(true);
return
}this.updateTask.delay(this.updateBuffer)
}});
Ext.ux.grid.filter.DateFilter=Ext.extend(Ext.ux.grid.filter.Filter,{afterText:"After",beforeText:"Before",compareMap:{before:"lt",after:"gt",on:"eq"},dateFormat:"m/d/Y",menuItems:["before","after","-","on"],menuItemCfgs:{selectOnFocus:true,width:125},onText:"On",pickerOpts:{},init:function(c){var g,d,a,e,b,f;
g=Ext.apply(this.pickerOpts,{minDate:this.minDate,maxDate:this.maxDate,format:this.dateFormat,listeners:{scope:this,select:this.onMenuSelect}});
this.fields={};
for(d=0,a=this.menuItems.length;
d<a;
d++){e=this.menuItems[d];
if(e!=="-"){b={itemId:"range-"+e,text:this[e+"Text"],menu:new Ext.menu.DateMenu(Ext.apply(g,{itemId:e})),listeners:{scope:this,checkchange:this.onCheckChange}};
f=Ext.menu.CheckItem;
e=this.fields[e]=new f(b)
}this.menu.add(e)
}},onCheckChange:function(){this.setActive(this.isActivatable());
this.fireEvent("update",this)
},onInputKeyUp:function(c,b){var a=b.getKey();
if(a==b.RETURN&&c.isValid()){b.stopEvent();
this.menu.hide(true);
return
}},onMenuSelect:function(c,d,b){var a=this.fields,e=this.fields[c.itemId];
e.setChecked(true);
if(e==a.on){a.before.setChecked(false,true);
a.after.setChecked(false,true)
}else{a.on.setChecked(false,true);
if(e==a.after&&a.before.menu.picker.value<d){a.before.setChecked(false,true)
}else{if(e==a.before&&a.after.menu.picker.value>d){a.after.setChecked(false,true)
}}}this.fireEvent("update",this)
},getValue:function(){var b,a={};
for(b in this.fields){if(this.fields[b].checked){a[b]=this.fields[b].menu.picker.getValue()
}}return a
},setValue:function(c,b){var a;
for(a in this.fields){if(c[a]){this.fields[a].menu.picker.setValue(c[a]);
this.fields[a].setChecked(true)
}else{if(!b){this.fields[a].setChecked(false)
}}}this.fireEvent("update",this)
},isActivatable:function(){var a;
for(a in this.fields){if(this.fields[a].checked){return true
}}return false
},getSerialArgs:function(){var a=[];
for(var b in this.fields){if(this.fields[b].checked){a.push({type:"date",comparison:this.compareMap[b],value:this.getFieldValue(b).format(this.dateFormat)})
}}return a
},getFieldValue:function(a){return this.fields[a].menu.picker.getValue()
},getPicker:function(a){return this.fields[a].menu.picker
},validateRecord:function(a){var b,d,c=a.get(this.dataIndex);
if(!Ext.isDate(c)){return false
}c=c.clearTime(true).getTime();
for(b in this.fields){if(this.fields[b].checked){d=this.getFieldValue(b).clearTime(true).getTime();
if(b=="before"&&d<=c){return false
}if(b=="after"&&d>=c){return false
}if(b=="on"&&d!=c){return false
}}}return true
}});
Ext.ux.grid.filter.ListFilter=Ext.extend(Ext.ux.grid.filter.Filter,{phpMode:false,init:function(a){this.dt=new Ext.util.DelayedTask(this.fireUpdate,this);
if(this.menu){this.menu.destroy()
}this.menu=new Ext.ux.menu.ListMenu(a);
this.menu.on("checkchange",this.onCheckChange,this)
},getValue:function(){return this.menu.getSelected()
},setValue:function(a){this.menu.setSelected(a);
this.fireEvent("update",this)
},isActivatable:function(){return this.getValue().length>0
},getSerialArgs:function(){var a={type:"list",value:this.phpMode?this.getValue().join(","):this.getValue()};
return a
},onCheckChange:function(){this.dt.delay(this.updateBuffer)
},validateRecord:function(a){return this.getValue().indexOf(a.get(this.dataIndex))>-1
}});
Ext.ux.grid.filter.NumericFilter=Ext.extend(Ext.ux.grid.filter.Filter,{fieldCls:Ext.form.NumberField,iconCls:{gt:"ux-rangemenu-gt",lt:"ux-rangemenu-lt",eq:"ux-rangemenu-eq"},menuItemCfgs:{emptyText:"Enter Filter Text...",selectOnFocus:true,width:125},menuItems:["lt","gt","-","eq"],init:function(a){if(this.menu){this.menu.destroy()
}this.menu=new Ext.ux.menu.RangeMenu(Ext.apply(a,{fieldCfg:this.fieldCfg||{},fieldCls:this.fieldCls,fields:this.fields||{},iconCls:this.iconCls,menuItemCfgs:this.menuItemCfgs,menuItems:this.menuItems,updateBuffer:this.updateBuffer}));
this.menu.on("update",this.fireUpdate,this)
},getValue:function(){return this.menu.getValue()
},setValue:function(a){this.menu.setValue(a)
},isActivatable:function(){var a=this.getValue();
for(key in a){if(a[key]!==undefined){return true
}}return false
},getSerialArgs:function(){var c,b=[],a=this.menu.getValue();
for(c in a){b.push({type:"numeric",comparison:c,value:a[c]})
}return b
},validateRecord:function(a){var c=a.get(this.dataIndex),b=this.getValue();
if(b.eq!==undefined&&c!=b.eq){return false
}if(b.lt!==undefined&&c>=b.lt){return false
}if(b.gt!==undefined&&c<=b.gt){return false
}return true
}});
Ext.ux.grid.filter.BooleanFilter=Ext.extend(Ext.ux.grid.filter.Filter,{defaultValue:false,yesText:"Yes",noText:"No",init:function(a){var c=Ext.id();
this.options=[new Ext.menu.CheckItem({text:this.yesText,group:c,checked:this.defaultValue===true}),new Ext.menu.CheckItem({text:this.noText,group:c,checked:this.defaultValue===false})];
this.menu.add(this.options[0],this.options[1]);
for(var b=0;
b<this.options.length;
b++){this.options[b].on("click",this.fireUpdate,this);
this.options[b].on("checkchange",this.fireUpdate,this)
}},getValue:function(){return this.options[0].checked
},setValue:function(a){this.options[a?0:1].setChecked(true)
},getSerialArgs:function(){var a={type:"boolean",value:this.getValue()};
return a
},validateRecord:function(a){return a.get(this.dataIndex)==this.getValue()
}});
Ext.ux.grid.RowExpander=Ext.extend(Ext.util.Observable,{expandOnEnter:true,expandOnDblClick:true,header:"",width:20,sortable:false,fixed:true,menuDisabled:true,dataIndex:"",id:"expander",lazyRender:true,enableCaching:true,constructor:function(a){Ext.apply(this,a);
this.addEvents({beforeexpand:true,expand:true,beforecollapse:true,collapse:true,bodycontent:true});
Ext.ux.grid.RowExpander.superclass.constructor.call(this);
if(this.tpl){if(typeof this.tpl=="string"){this.tpl=new Ext.Template(this.tpl)
}this.tpl.compile()
}this.state={};
this.bodyContent={}
},getRowClass:function(a,e,d,c){d.cols=d.cols-1;
var b=this.bodyContent[a.id];
if(!b&&!this.lazyRender){b=this.getBodyContent(a,e)
}if(b){d.body=b
}return this.state[a.id]?"x-grid3-row-expanded":"x-grid3-row-collapsed"
},init:function(b){this.grid=b;
var a=b.getView();
a.getRowClass=this.getRowClass.createDelegate(this);
a.enableRowBody=true;
b.on("render",this.onRender,this);
b.on("destroy",this.onDestroy,this)
},onRender:function(){var a=this.grid;
var b=a.getView().mainBody;
b.on("mousedown",this.onMouseDown,this,{delegate:".x-grid3-row-expander"});
if(this.expandOnEnter){this.keyNav=new Ext.KeyNav(this.grid.getGridEl(),{enter:this.onEnter,scope:this})
}if(this.expandOnDblClick){a.on("rowdblclick",this.onRowDblClick,this)
}},onDestroy:function(){if(this.keyNav){this.keyNav.disable();
delete this.keyNav
}var a=this.grid.getView().mainBody;
if(a){a.un("mousedown",this.onMouseDown,this)
}},onRowDblClick:function(a,b,c){this.expandRow(b)
},onEnter:function(j){var k=this,f=k.grid,a,l,b,c;
if(f){b=f.getSelectionModel();
if(b){l=f.getStore();
c=b.getSelections();
for(var d=0,h=c.length;
d<h;
d++){a=l.indexOf(c[d]);
if(a>=0){k.toggleRow(a)
}}}}},getBodyContent:function(a,b){var c;
if(!this.enableCaching){c=this.tpl.apply(a.data);
var d={content:c};
this.fireEvent("bodycontent",this,a,d,b);
return d.content
}c=this.bodyContent[a.id];
if(!c){c=this.tpl.apply(a.data);
var d={content:c};
this.fireEvent("bodycontent",this,a,d,b);
c=d.content;
this.bodyContent[a.id]=c
}return c
},onMouseDown:function(b,a){b.stopEvent();
var c=b.getTarget(".x-grid3-row");
this.toggleRow(c)
},renderer:function(b,c,a){c.cellAttr='rowspan="2"';
return'<div class="x-grid3-row-expander">&#160;</div>'
},beforeExpand:function(b,a,c){if(this.fireEvent("beforeexpand",this,b,a,c)!==false){if(this.tpl&&this.lazyRender){a.innerHTML=this.getBodyContent(b,c)
}return true
}else{return false
}},toggleRow:function(a){if(typeof a=="number"){a=this.grid.view.getRow(a)
}this[Ext.fly(a).hasClass("x-grid3-row-collapsed")?"expandRow":"collapseRow"](a)
},expandRow:function(c){if(typeof c=="number"){c=this.grid.view.getRow(c)
}var b=this.grid.store.getAt(c.rowIndex);
var a=Ext.DomQuery.selectNode("tr:nth(2) div.x-grid3-row-body",c);
if(this.beforeExpand(b,a,c.rowIndex)){this.state[b.id]=true;
Ext.fly(c).replaceClass("x-grid3-row-collapsed","x-grid3-row-expanded");
this.fireEvent("expand",this,b,a,c.rowIndex)
}},collapseRow:function(c){if(typeof c=="number"){c=this.grid.view.getRow(c)
}var b=this.grid.store.getAt(c.rowIndex);
var a=Ext.fly(c).child("tr:nth(1) div.x-grid3-row-body",true);
if(this.fireEvent("beforecollapse",this,b,a,c.rowIndex)!==false){this.state[b.id]=false;
Ext.fly(c).replaceClass("x-grid3-row-expanded","x-grid3-row-collapsed");
this.fireEvent("collapse",this,b,a,c.rowIndex)
}}});
Ext.preg("rowexpander",Ext.ux.grid.RowExpander);
Ext.grid.RowExpander=Ext.ux.grid.RowExpander;
Ext.ns("Ext.ux.dd");
Ext.ux.dd.GridDragDropRowOrder=Ext.extend(Ext.util.Observable,{copy:false,scrollable:true,constructor:function(a){if(a){Ext.apply(this,a)
}this.addEvents({beforerowmove:true,afterrowmove:true,beforerowcopy:true,afterrowcopy:true});
Ext.ux.dd.GridDragDropRowOrder.superclass.constructor.call(this)
},init:function(a){this.grid=a;
a.enableDragDrop=true;
a.on({render:{fn:this.onGridRender,scope:this,single:true}})
},onGridRender:function(b){var a=this;
this.target=new Ext.dd.DropTarget(b.getEl(),{ddGroup:b.ddGroup||"GridDD",grid:b,gridDropTarget:this,notifyDrop:function(m,k,h){if(this.currentRowEl){this.currentRowEl.removeClass("grid-row-insert-below");
this.currentRowEl.removeClass("grid-row-insert-above")
}var o=Ext.lib.Event.getTarget(k);
var j=this.grid.getView().findRowIndex(o);
if(j===false||j==h.rowIndex){return false
}if(this.gridDropTarget.fireEvent(a.copy?"beforerowcopy":"beforerowmove",this.gridDropTarget,h.rowIndex,j,h.selections,123)===false){return false
}var d=this.grid.getStore();
var c=new Array();
var n=d.data.keys;
for(var l in n){for(var g=0;
g<h.selections.length;
g++){if(n[l]==h.selections[g].id){if(j==l){return false
}c.push(h.selections[g])
}}}if(j>h.rowIndex&&this.rowPosition<0){j--
}if(j<h.rowIndex&&this.rowPosition>0){j++
}if(j>h.rowIndex&&h.selections.length>1){j=j-(h.selections.length-1)
}if(j==h.rowIndex){return false
}if(!a.copy){for(var g=0;
g<h.selections.length;
g++){d.remove(d.getById(h.selections[g].id))
}}for(var g=c.length-1;
g>=0;
g--){var p=j;
d.insert(p,c[g])
}var f=this.grid.getSelectionModel();
if(f){f.selectRecords(h.selections)
}this.gridDropTarget.fireEvent(a.copy?"afterrowcopy":"afterrowmove",this.gridDropTarget,h.rowIndex,j,h.selections);
return true
},notifyOver:function(o,l,j){var r=Ext.lib.Event.getTarget(l);
var k=this.grid.getView().findRowIndex(r);
var d=this.grid.getStore();
var q=d.data.keys;
for(var n in q){for(var h=0;
h<j.selections.length;
h++){if(q[n]==j.selections[h].id){if(k==n){if(this.currentRowEl){this.currentRowEl.removeClass("grid-row-insert-below");
this.currentRowEl.removeClass("grid-row-insert-above")
}return this.dropNotAllowed
}}}}if(k<0||k===false){this.currentRowEl.removeClass("grid-row-insert-above");
return this.dropNotAllowed
}try{var m=this.grid.getView().getRow(k);
var g=new Ext.Element(m).getY()-this.grid.getView().scroller.dom.scrollTop;
var c=m.offsetHeight;
this.rowPosition=l.getPageY()-g-(c/2);
if(this.currentRowEl){this.currentRowEl.removeClass("grid-row-insert-below");
this.currentRowEl.removeClass("grid-row-insert-above")
}if(this.rowPosition>0){this.currentRowEl=new Ext.Element(m);
this.currentRowEl.addClass("grid-row-insert-below")
}else{if(k-1>=0){var p=this.grid.getView().getRow(k-1);
this.currentRowEl=new Ext.Element(p);
this.currentRowEl.addClass("grid-row-insert-below")
}else{this.currentRowEl.addClass("grid-row-insert-above")
}}}catch(f){if(!!window.console&&!!window.console.warn){window.console.warn(f)
}k=false
}return(k===false)?this.dropNotAllowed:this.dropAllowed
},notifyOut:function(c,f,d){if(this.currentRowEl){this.currentRowEl.removeClass("grid-row-insert-above");
this.currentRowEl.removeClass("grid-row-insert-below")
}}});
if(this.targetCfg){Ext.apply(this.target,this.targetCfg)
}if(this.scrollable){Ext.dd.ScrollManager.register(b.getView().getEditorParent());
b.on({beforedestroy:this.onBeforeDestroy,scope:this,single:true})
}},getTarget:function(){return this.target
},getGrid:function(){return this.grid
},getCopy:function(){return this.copy?true:false
},setCopy:function(a){this.copy=a?true:false
},onBeforeDestroy:function(a){Ext.dd.ScrollManager.unregister(a.getView().getEditorParent())
}});
Ext.ux.form.SuperBoxSelect=function(a){Ext.ux.form.SuperBoxSelect.superclass.constructor.call(this,a);
this.addEvents("beforeadditem","additem","newitem","beforeremoveitem","removeitem","clear")
};
Ext.ux.form.SuperBoxSelect=Ext.extend(Ext.ux.form.SuperBoxSelect,Ext.form.ComboBox,{addNewDataOnBlur:false,allowAddNewData:false,allowQueryAll:true,backspaceDeletesLastItem:true,classField:null,clearBtnCls:"",clearLastQueryOnEscape:false,clearOnEscape:false,displayFieldTpl:null,extraItemCls:"",extraItemStyle:"",expandBtnCls:"",fixFocusOnTabSelect:true,forceFormValue:true,forceSameValueQuery:false,itemDelimiterKey:Ext.EventObject.ENTER,navigateItemsWithTab:true,pinList:true,preventDuplicates:true,queryFilterRe:"",queryValuesDelimiter:"|",queryValuesIndicator:"valuesqry",removeValuesFromStore:true,renderFieldBtns:true,stackItems:false,styleField:null,supressClearValueRemoveEvents:false,validationEvent:"blur",valueDelimiter:",",initComponent:function(){Ext.apply(this,{items:new Ext.util.MixedCollection(false),usedRecords:new Ext.util.MixedCollection(false),addedRecords:[],remoteLookup:[],hideTrigger:true,grow:false,resizable:false,multiSelectMode:false,preRenderValue:null,filteredQueryData:""});
if(this.queryFilterRe){if(Ext.isString(this.queryFilterRe)){this.queryFilterRe=new RegExp(this.queryFilterRe)
}}if(this.transform){this.doTransform()
}if(this.forceFormValue){this.items.on({add:this.manageNameAttribute,remove:this.manageNameAttribute,clear:this.manageNameAttribute,scope:this})
}Ext.ux.form.SuperBoxSelect.superclass.initComponent.call(this);
if(this.mode==="remote"&&this.store){this.store.on("load",this.onStoreLoad,this)
}},onRender:function(b,a){var c=this.hiddenName;
this.hiddenName=null;
Ext.ux.form.SuperBoxSelect.superclass.onRender.call(this,b,a);
this.hiddenName=c;
this.manageNameAttribute();
var d=(this.stackItems===true)?"x-superboxselect-stacked":"";
if(this.renderFieldBtns){d+=" x-superboxselect-display-btns"
}this.el.removeClass("x-form-text").addClass("x-superboxselect-input-field");
this.wrapEl=this.el.wrap({tag:"ul"});
this.outerWrapEl=this.wrapEl.wrap({tag:"div",cls:"x-form-text x-superboxselect "+d});
this.inputEl=this.el.wrap({tag:"li",cls:"x-superboxselect-input"});
if(this.renderFieldBtns){this.setupFieldButtons().manageClearBtn()
}this.setupFormInterception()
},doTransform:function(){var m=Ext.getDom(this.transform),f=[];
if(!this.store){this.mode="local";
var h=[],a=m.options;
for(var e=0,g=a.length;
e<g;
e++){var c=a[e],l=Ext.get(c),j=l.getAttributeNS(null,"value")||"",k=l.getAttributeNS(null,"className")||"",b=l.getAttributeNS(null,"style")||"";
if(c.selected){f.push(j)
}h.push([j,c.text,k,typeof(b)==="string"?b:b.cssText])
}this.store=new Ext.data.SimpleStore({id:0,fields:["value","text","cls","style"],data:h});
Ext.apply(this,{valueField:"value",displayField:"text",classField:"cls",styleField:"style"})
}if(f.length){this.value=f.join(",")
}},setupFieldButtons:function(){this.buttonWrap=this.outerWrapEl.createChild({cls:"x-superboxselect-btns"});
this.buttonClear=this.buttonWrap.createChild({tag:"div",cls:"x-superboxselect-btn-clear "+this.clearBtnCls});
if(this.allowQueryAll){this.buttonExpand=this.buttonWrap.createChild({tag:"div",cls:"x-superboxselect-btn-expand "+this.expandBtnCls})
}this.initButtonEvents();
return this
},initButtonEvents:function(){this.buttonClear.addClassOnOver("x-superboxselect-btn-over").on("click",function(a){a.stopEvent();
if(this.disabled){return
}this.clearValue();
this.el.focus()
},this);
if(this.allowQueryAll){this.buttonExpand.addClassOnOver("x-superboxselect-btn-over").on("click",function(a){a.stopEvent();
if(this.disabled){return
}if(this.isExpanded()){this.multiSelectMode=false
}else{if(this.pinList){this.multiSelectMode=true
}}this.onTriggerClick()
},this)
}},removeButtonEvents:function(){this.buttonClear.removeAllListeners();
if(this.allowQueryAll){this.buttonExpand.removeAllListeners()
}return this
},clearCurrentFocus:function(){if(this.currentFocus){this.currentFocus.onLnkBlur();
this.currentFocus=null
}return this
},initEvents:function(){var a=this.el;
a.on({click:this.onClick,focus:this.clearCurrentFocus,blur:this.onBlur,keydown:this.onKeyDownHandler,keyup:this.onKeyUpBuffered,scope:this});
this.on({collapse:this.onCollapse,expand:this.clearCurrentFocus,scope:this});
this.wrapEl.on("click",this.onWrapClick,this);
this.outerWrapEl.on("click",this.onWrapClick,this);
this.inputEl.focus=function(){a.focus()
};
Ext.ux.form.SuperBoxSelect.superclass.initEvents.call(this);
Ext.apply(this.keyNav,{tab:function(b){if(this.fixFocusOnTabSelect&&this.isExpanded()){b.stopEvent();
a.blur();
this.onViewClick(false);
this.focus(false,10);
return true
}this.onViewClick(false);
if(a.dom.value!==""){this.setRawValue("")
}return true
},down:function(b){if(!this.isExpanded()&&!this.currentFocus){if(this.allowQueryAll){this.onTriggerClick()
}}else{this.inKeyMode=true;
this.selectNext()
}},enter:function(){}})
},onClick:function(){this.clearCurrentFocus();
this.collapse();
this.autoSize()
},beforeBlur:function(){if(this.allowAddNewData&&this.addNewDataOnBlur){var a=this.el.dom.value;
if(a.trim().length>0){this.fireNewItemEvent(a)
}}Ext.form.ComboBox.superclass.beforeBlur.call(this)
},onFocus:function(){this.outerWrapEl.addClass(this.focusClass);
Ext.ux.form.SuperBoxSelect.superclass.onFocus.call(this)
},onBlur:function(){this.outerWrapEl.removeClass(this.focusClass);
this.clearCurrentFocus();
var a=this.el.dom.value;
if(a!==""){if(a.trim().length>0&&this.allowAddNewData&&this.addNewDataOnBlur){this.fireNewItemEvent(a)
}else{this.applyEmptyText();
this.autoSize()
}}Ext.ux.form.SuperBoxSelect.superclass.onBlur.call(this)
},onCollapse:function(){this.view.clearSelections();
this.multiSelectMode=false
},onWrapClick:function(a){a.stopEvent();
this.collapse();
this.el.focus();
this.clearCurrentFocus()
},markInvalid:function(c){var b,a;
if(!this.rendered||this.preventMark){return
}this.outerWrapEl.addClass(this.invalidClass);
c=c||this.invalidText;
switch(this.msgTarget){case"qtip":Ext.apply(this.el.dom,{qtip:c,qclass:"x-form-invalid-tip"});
Ext.apply(this.wrapEl.dom,{qtip:c,qclass:"x-form-invalid-tip"});
if(Ext.QuickTips){Ext.QuickTips.enable()
}break;
case"title":this.el.dom.title=c;
this.wrapEl.dom.title=c;
this.outerWrapEl.dom.title=c;
break;
case"under":if(!this.errorEl){b=this.getErrorCt();
if(!b){this.el.dom.title=c;
break
}this.errorEl=b.createChild({cls:"x-form-invalid-msg"});
this.errorEl.setWidth(b.getWidth(true)-20)
}this.errorEl.update(c);
Ext.form.Field.msgFx[this.msgFx].show(this.errorEl,this);
break;
case"side":if(!this.errorIcon){b=this.getErrorCt();
if(!b){this.el.dom.title=c;
break
}this.errorIcon=b.createChild({cls:"x-form-invalid-icon"})
}this.alignErrorIcon();
Ext.apply(this.errorIcon.dom,{qtip:c,qclass:"x-form-invalid-tip"});
this.errorIcon.show();
this.on("resize",this.alignErrorIcon,this);
break;
default:a=Ext.getDom(this.msgTarget);
a.innerHTML=c;
a.style.display=this.msgDisplay;
break
}this.fireEvent("invalid",this,c)
},clearInvalid:function(){if(!this.rendered||this.preventMark){return
}this.outerWrapEl.removeClass(this.invalidClass);
switch(this.msgTarget){case"qtip":this.el.dom.qtip="";
this.wrapEl.dom.qtip="";
break;
case"title":this.el.dom.title="";
this.wrapEl.dom.title="";
this.outerWrapEl.dom.title="";
break;
case"under":if(this.errorEl){Ext.form.Field.msgFx[this.msgFx].hide(this.errorEl,this)
}break;
case"side":if(this.errorIcon){this.errorIcon.dom.qtip="";
this.errorIcon.hide();
this.un("resize",this.alignErrorIcon,this)
}break;
default:var a=Ext.getDom(this.msgTarget);
a.innerHTML="";
a.style.display="none";
break
}this.fireEvent("valid",this)
},alignErrorIcon:function(){if(this.wrap){this.errorIcon.alignTo(this.wrap,"tl-tr",[Ext.isIE?5:2,3])
}},expand:function(){if(this.isExpanded()||!this.hasFocus){return
}if(this.bufferSize){this.doResize(this.bufferSize);
delete this.bufferSize
}this.list.alignTo(this.outerWrapEl,this.listAlign).show();
this.innerList.setOverflow("auto");
this.mon(Ext.getDoc(),{scope:this,mousewheel:this.collapseIf,mousedown:this.collapseIf});
this.fireEvent("expand",this)
},restrictHeight:function(){var b=this.innerList.dom,c=b.scrollTop,f=this.list;
b.style.height="";
var g=f.getFrameWidth("tb")+(this.resizable?this.handleHeight:0)+this.assetHeight,d=Math.max(b.clientHeight,b.offsetHeight,b.scrollHeight),a=this.getPosition()[1]-Ext.getBody().getScroll().top,i=Ext.lib.Dom.getViewHeight()-a-this.getSize().height,e=Math.max(a,i,this.minHeight||0)-f.shadowOffset-g-5;
d=Math.min(d,e,this.maxHeight);
this.innerList.setHeight(d);
f.beginUpdate();
f.setHeight(d+g);
f.alignTo(this.outerWrapEl,this.listAlign);
f.endUpdate();
if(this.multiSelectMode){b.scrollTop=c
}},validateValue:function(a){if(this.items.getCount()===0){if(this.allowBlank){this.clearInvalid();
return true
}else{this.markInvalid(this.blankText);
return false
}}this.clearInvalid();
return true
},manageNameAttribute:function(){if(!this.el){return
}if(this.items.getCount()===0&&this.forceFormValue){this.el.dom.setAttribute("name",this.hiddenName||this.name)
}else{this.el.dom.removeAttribute("name")
}},setupFormInterception:function(){var a;
this.findParentBy(function(c){if(c.getForm){a=c.getForm()
}});
if(a){var b=a.getValues;
a.getValues=function(d){this.el.dom.disabled=true;
var c=this.el.dom.value;
this.setRawValue("");
var e=b.call(a);
this.el.dom.disabled=false;
this.setRawValue(c);
if(this.forceFormValue&&this.items.getCount()===0){e[this.name]=""
}return d?Ext.urlEncode(e):e
}.createDelegate(this)
}},onResize:function(a,c,e,b){var d=Ext.isIE6?4:Ext.isIE7?1:Ext.isIE8?1:0;
if(this.wrapEl){this._width=a;
this.outerWrapEl.setWidth(a-d);
if(this.renderFieldBtns){d+=(this.buttonWrap.getWidth()+20);
this.wrapEl.setWidth(a-d)
}}Ext.ux.form.SuperBoxSelect.superclass.onResize.call(this,a,c,e,b);
this.autoSize()
},onEnable:function(){Ext.ux.form.SuperBoxSelect.superclass.onEnable.call(this);
this.items.each(function(a){a.enable()
});
if(this.renderFieldBtns){this.initButtonEvents()
}},onDisable:function(){Ext.ux.form.SuperBoxSelect.superclass.onDisable.call(this);
this.items.each(function(a){a.disable()
});
if(this.renderFieldBtns){this.removeButtonEvents()
}},clearValue:function(a){Ext.ux.form.SuperBoxSelect.superclass.clearValue.call(this);
this.preventMultipleRemoveEvents=a||this.supressClearValueRemoveEvents||false;
this.removeAllItems();
this.preventMultipleRemoveEvents=false;
this.fireEvent("clear",this);
return this
},fireNewItemEvent:function(a){this.view.clearSelections();
this.collapse();
this.setRawValue("");
if(this.queryFilterRe){a=a.replace(this.queryFilterRe,"");
if(!a){return
}}this.fireEvent("newitem",this,a,this.filteredQueryData)
},onKeyUp:function(a){if(this.editable!==false&&(!a.isSpecialKey()||a.getKey()===a.BACKSPACE)&&this.itemDelimiterKey.indexOf!==a.getKey()&&(!a.hasModifier()||a.shiftKey)){this.lastKey=a.getKey();
this.dqTask.delay(this.queryDelay)
}},onKeyDownHandler:function(g,c){var b,i,a;
if(g.getKey()===g.ESC){if(!this.isExpanded()){if(this.el.dom.value!=""&&(this.clearOnEscape||this.clearLastQueryOnEscape)){if(this.clearOnEscape){this.el.dom.value=""
}if(this.clearLastQueryOnEscape){this.lastQuery=""
}g.stopEvent()
}}}if((g.getKey()===g.DELETE||g.getKey()===g.SPACE)&&this.currentFocus){g.stopEvent();
b=this.currentFocus;
this.on("expand",function(){this.collapse()
},this,{single:true});
a=this.items.indexOfKey(this.currentFocus.key);
this.clearCurrentFocus();
if(a<(this.items.getCount()-1)){i=this.items.itemAt(a+1)
}b.preDestroy(true);
if(i){(function(){i.onLnkFocus();
this.currentFocus=i
}).defer(200,this)
}return true
}var h=this.el.dom.value,d,f=g.ctrlKey;
if(this.itemDelimiterKey===g.getKey()){g.stopEvent();
if(h!==""){if(f||!this.isExpanded()){this.fireNewItemEvent(h)
}else{this.onViewClick();
if(this.unsetDelayCheck){this.delayedCheck=true;
this.unsetDelayCheck.defer(10,this)
}}}else{if(!this.isExpanded()){return
}this.onViewClick();
if(this.unsetDelayCheck){this.delayedCheck=true;
this.unsetDelayCheck.defer(10,this)
}}return true
}if(h!==""){this.autoSize();
return
}if(g.getKey()===g.HOME){g.stopEvent();
if(this.items.getCount()>0){this.collapse();
d=this.items.get(0);
d.el.focus()
}return true
}if(g.getKey()===g.BACKSPACE){g.stopEvent();
if(this.currentFocus){b=this.currentFocus;
this.on("expand",function(){this.collapse()
},this,{single:true});
a=this.items.indexOfKey(b.key);
this.clearCurrentFocus();
if(a<(this.items.getCount()-1)){i=this.items.itemAt(a+1)
}b.preDestroy(true);
if(i){(function(){i.onLnkFocus();
this.currentFocus=i
}).defer(200,this)
}return
}else{d=this.items.get(this.items.getCount()-1);
if(d){if(this.backspaceDeletesLastItem){this.on("expand",function(){this.collapse()
},this,{single:true});
d.preDestroy(true)
}else{if(this.navigateItemsWithTab){d.onElClick()
}else{this.on("expand",function(){this.collapse();
this.currentFocus=d;
this.currentFocus.onLnkFocus.defer(20,this.currentFocus)
},this,{single:true})
}}}return true
}}if(!g.isNavKeyPress()){this.multiSelectMode=false;
this.clearCurrentFocus();
return
}if(g.getKey()===g.LEFT||(g.getKey()===g.UP&&!this.isExpanded())){g.stopEvent();
this.collapse();
d=this.items.get(this.items.getCount()-1);
if(this.navigateItemsWithTab){if(d){d.focus()
}}else{if(this.currentFocus){a=this.items.indexOfKey(this.currentFocus.key);
this.clearCurrentFocus();
if(a!==0){this.currentFocus=this.items.itemAt(a-1);
this.currentFocus.onLnkFocus()
}}else{this.currentFocus=d;
if(d){d.onLnkFocus()
}}}return true
}if(g.getKey()===g.DOWN){if(this.currentFocus){this.collapse();
g.stopEvent();
a=this.items.indexOfKey(this.currentFocus.key);
if(a==(this.items.getCount()-1)){this.clearCurrentFocus.defer(10,this)
}else{this.clearCurrentFocus();
this.currentFocus=this.items.itemAt(a+1);
if(this.currentFocus){this.currentFocus.onLnkFocus()
}}return true
}}if(g.getKey()===g.RIGHT){this.collapse();
d=this.items.itemAt(0);
if(this.navigateItemsWithTab){if(d){d.focus()
}}else{if(this.currentFocus){a=this.items.indexOfKey(this.currentFocus.key);
this.clearCurrentFocus();
if(a<(this.items.getCount()-1)){this.currentFocus=this.items.itemAt(a+1);
if(this.currentFocus){this.currentFocus.onLnkFocus()
}}}else{this.currentFocus=d;
if(d){d.onLnkFocus()
}}}}},onKeyUpBuffered:function(a){if(!a.isNavKeyPress()){this.autoSize()
}},reset:function(){this.killItems();
Ext.ux.form.SuperBoxSelect.superclass.reset.call(this);
this.addedRecords=[];
this.autoSize().setRawValue("")
},applyEmptyText:function(){this.setRawValue("");
if(this.items.getCount()>0){this.el.removeClass(this.emptyClass);
this.setRawValue("");
return this
}if(this.rendered&&this.emptyText&&this.getRawValue().length<1){this.setRawValue(this.emptyText);
this.el.addClass(this.emptyClass)
}return this
},removeAllItems:function(){this.items.each(function(a){a.preDestroy(true)
},this);
this.manageClearBtn();
return this
},killItems:function(){this.items.each(function(a){a.kill()
},this);
this.resetStore();
this.items.clear();
this.manageClearBtn();
return this
},resetStore:function(){this.store.clearFilter();
if(!this.removeValuesFromStore){return this
}this.usedRecords.each(function(a){this.store.add(a)
},this);
this.usedRecords.clear();
if(!this.store.remoteSort){this.store.sort(this.displayField,"ASC")
}return this
},sortStore:function(){var a=this.store.getSortState();
if(a&&a.field){this.store.sort(a.field,a.direction)
}return this
},getCaption:function(c){if(typeof this.displayFieldTpl==="string"){this.displayFieldTpl=new Ext.XTemplate(this.displayFieldTpl)
}var b,a=c instanceof Ext.data.Record?c.data:c;
if(this.displayFieldTpl){b=this.displayFieldTpl.apply(a)
}else{if(this.displayField){b=a[this.displayField]
}}return b
},addRecord:function(b){var e=b.data[this.displayField],c=this.getCaption(b),f=b.data[this.valueField],a=this.classField?b.data[this.classField]:(b.data.flag===true?"x-superboxselect-item-not-exists":""),d=this.styleField?b.data[this.styleField]:"";
if(this.removeValuesFromStore){this.usedRecords.add(f.toLowerCase(),b);
this.store.remove(b)
}this.addItemBox(f,e,c,a,d);
this.fireEvent("additem",this,f,b)
},createRecord:function(a){if(!this.recordConstructor){var b=[{name:this.valueField},{name:this.displayField}];
if(this.classField){b.push({name:this.classField})
}if(this.styleField){b.push({name:this.styleField})
}this.recordConstructor=Ext.data.Record.create(b)
}return new this.recordConstructor(a)
},addItems:function(a){if(Ext.isArray(a)){Ext.each(a,function(b){this.addItem(b)
},this)
}else{this.addItem(a)
}},addNewItem:function(a){this.addItem(a,true)
},addItem:function(a,c){var e=a[this.valueField];
if(this.disabled){return false
}if(this.preventDuplicates&&this.hasValue(e)){return
}var b=this.findRecord(this.valueField,e);
if(b){this.addRecord(b);
return
}else{if(!this.allowAddNewData){return
}}if(this.mode==="remote"){this.remoteLookup.push(a);
this.doQuery(e,false,false,c);
return
}var d=this.createRecord(a);
this.store.add(d);
this.addRecord(d);
return true
},addItemBox:function(c,e,i,h,d){var f,g=function(k){var j="";
switch(typeof k){case"function":j=k.call();
break;
case"object":for(var l in k){j+=l+":"+k[l]+";"
}break;
case"string":j=k+";"
}return j
},a=Ext.id(null,"sbx-item"),b=new Ext.ux.form.SuperBoxSelectItem({owner:this,notExists:h!="",disabled:this.disabled,renderTo:this.wrapEl,cls:this.extraItemCls+" "+h,style:g(this.extraItemStyle)+" "+d,caption:i,display:e,value:c,key:a,listeners:{remove:function(j){if(this.fireEvent("beforeremoveitem",this,j.value)===false){return false
}this.items.removeKey(j.key);
if(this.removeValuesFromStore){if(this.usedRecords.containsKey(j.value)){this.store.add(this.usedRecords.get(j.value));
this.usedRecords.removeKey(j.value);
this.sortStore();
if(this.view){this.view.render()
}}}if(!this.preventMultipleRemoveEvents){this.fireEvent.defer(250,this,["removeitem",this,j.value,this.findInStore(j.value)])
}},destroy:function(){this.collapse();
this.autoSize().manageClearBtn().validateValue()
},scope:this}});
b.render();
f={tag:"input",type:"hidden",value:Ext.util.Format.htmlEncode(c),name:(this.hiddenName||this.name)};
if(this.disabled){Ext.apply(f,{disabled:"disabled"})
}b.hidden=this.el.insertSibling(f,"before");
this.items.add(a,b);
this.applyEmptyText().autoSize().manageClearBtn().validateValue()
},manageClearBtn:function(){if(!this.renderFieldBtns||!this.rendered){return this
}var a="x-superboxselect-btn-hide";
if(this.items.getCount()===0){this.buttonClear.addClass(a)
}else{this.buttonClear.removeClass(a)
}return this
},findInStore:function(b){var a=this.store.find(this.valueField,b);
if(a>-1){return this.store.getAt(a)
}return false
},getSelectedRecords:function(){var a=[];
if(this.removeValuesFromStore){a=this.usedRecords.getRange()
}else{var b=[];
this.items.each(function(c){b.push(c.value)
});
Ext.each(b,function(c){a.push(this.findInStore(c))
},this)
}return a
},findSelectedItem:function(b){var a;
this.items.each(function(c){if(c.el.dom===b){a=c;
return false
}});
return a
},findSelectedRecord:function(b){var a,c=this.findSelectedItem(b);
if(c){a=this.findSelectedRecordByValue(c.value)
}return a
},findSelectedRecordByValue:function(b){var a;
if(this.removeValuesFromStore){this.usedRecords.each(function(c){if(c.get(this.valueField)==b){a=c;
return false
}},this)
}else{a=this.findInStore(b)
}return a
},getValue:function(){var a=[];
this.items.each(function(b){a.push(b.value)
});
return Ext.util.JSON.encode(a)
},getValueArray:function(){var a=[];
this.items.each(function(b){a.push(b.value)
});
return a
},getCount:function(){return this.items.getCount()
},getValueEx:function(){var a=[];
this.items.each(function(c){var b={};
b[this.valueField]=c.value;
b[this.displayField]=c.display;
if(this.classField){b[this.classField]=c.cls||""
}if(this.styleField){b[this.styleField]=c.style||""
}a.push(b)
},this);
return a
},initValue:function(){if(Ext.isObject(this.value)||Ext.isArray(this.value)){this.setValueEx(this.value);
this.originalValue=this.getValue()
}else{Ext.ux.form.SuperBoxSelect.superclass.initValue.call(this)
}if(this.mode==="remote"){this.setOriginal=true
}},addValue:function(c){if(Ext.isEmpty(c)){return
}var a=c;
if(!Ext.isArray(c)){c=""+c;
a=c.split(this.valueDelimiter)
}Ext.each(a,function(e){var d=this.findRecord(this.valueField,e);
if(d){this.addRecord(d)
}else{if(this.mode==="remote"){this.remoteLookup.push(e)
}}},this);
if(this.mode==="remote"){var b=this.remoteLookup.join(this.queryValuesDelimiter);
this.doQuery(b,false,true)
}},setValue:function(a){if(!this.rendered){this.value=a;
return
}this.removeAllItems().resetStore();
this.remoteLookup=[];
this.addValue(a)
},setValueEx:function(a){if(!this.rendered){this.value=a;
return
}this.removeAllItems().resetStore();
if(!Ext.isArray(a)){a=[a]
}this.remoteLookup=[];
if(this.allowAddNewData&&this.mode==="remote"){Ext.each(a,function(c){var b=this.findRecord(this.valueField,c[this.valueField])||this.createRecord(c);
this.addRecord(b)
},this);
return
}Ext.each(a,function(b){this.addItem(b)
},this)
},hasValue:function(b){var a=false;
this.items.each(function(c){if(c.value==b){a=true;
return false
}},this);
return a
},onSelect:function(a,b){if(this.fireEvent("beforeselect",this,a,b)!==false){var c=a.data[this.valueField];
if(this.preventDuplicates&&this.hasValue(c)){return
}this.setRawValue("");
this.lastSelectionText="";
if(this.fireEvent("beforeadditem",this,c,a,this.filteredQueryData)!==false){this.addRecord(a)
}if(this.store.getCount()===0||!this.multiSelectMode){this.collapse()
}else{this.restrictHeight()
}}},onDestroy:function(){this.items.purgeListeners();
this.killItems();
if(this.allowQueryAll){Ext.destroy(this.buttonExpand)
}if(this.renderFieldBtns){Ext.destroy(this.buttonClear,this.buttonWrap)
}Ext.destroy(this.inputEl,this.wrapEl,this.outerWrapEl);
Ext.ux.form.SuperBoxSelect.superclass.onDestroy.call(this)
},autoSize:function(){if(!this.rendered){return this
}if(!this.metrics){this.metrics=Ext.util.TextMetrics.createInstance(this.el)
}var c=this.el,b=c.dom.value,e=document.createElement("div");
if(b===""&&this.emptyText&&this.items.getCount()<1){b=this.emptyText
}e.appendChild(document.createTextNode(b));
b=e.innerHTML;
e=null;
b+="&#160;";
var a=Math.max(this.metrics.getWidth(b)+24,24);
if(typeof this._width!="undefined"){a=Math.min(this._width,a)
}this.el.setWidth(a);
if(Ext.isIE){this.el.dom.style.top="0"
}this.fireEvent("autosize",this,a);
return this
},shouldQuery:function(b){if(this.lastQuery){try{var a=b.match("^"+this.lastQuery);
if(!a||this.store.getCount()){return true
}else{return(a[0]!==this.lastQuery)
}}catch(c){return false
}}return true
},doQuery:function(g,f,b,d){g=Ext.isEmpty(g)?"":g;
if(this.queryFilterRe){this.filteredQueryData="";
var a=null;
try{a=g.match(this.queryFilterRe)
}catch(h){}if(a&&a.length){this.filteredQueryData=a[0]
}g=g.replace(this.queryFilterRe,"");
if(!g&&a){return
}}var c={query:g,forceAll:f,combo:this,cancel:false};
if(this.fireEvent("beforequery",c)===false||c.cancel){return false
}g=c.query;
f=c.forceAll;
if(f===true||(g.length>=this.minChars)||b&&!Ext.isEmpty(g)){if(d||this.forceSameValueQuery||this.shouldQuery(g)){this.lastQuery=g;
if(this.mode=="local"){this.selectedIndex=-1;
if(f){this.store.clearFilter()
}else{this.store.filter(this.displayField,g)
}this.onLoad()
}else{this.store.baseParams[this.queryParam]=g;
this.store.baseParams[this.queryValuesIndicator]=b;
this.store.load({params:this.getParams(g)});
if(!d){this.expand()
}}}else{this.selectedIndex=-1;
this.onLoad()
}}},onStoreLoad:function(b,a,c){var f=c.params[this.queryParam]||b.baseParams[this.queryParam]||"",g=c.params[this.queryValuesIndicator]||b.baseParams[this.queryValuesIndicator];
if(this.removeValuesFromStore){this.store.each(function(i){if(this.usedRecords.containsKey(i.get(this.valueField))){this.store.remove(i)
}},this)
}if(g){var h=f.split(this.queryValuesDelimiter);
Ext.each(h,function(i){this.remoteLookup.remove(i);
var j=this.findRecord(this.valueField,i);
if(j){this.addRecord(j)
}},this);
if(this.setOriginal){this.setOriginal=false;
this.originalValue=this.getValue()
}}if(f!==""&&this.allowAddNewData){Ext.each(this.remoteLookup,function(i){if(typeof i==="object"&&i[this.valueField]===f){this.remoteLookup.remove(i);
if(a.length&&a[0].get(this.valueField)===f){this.addRecord(a[0]);
return
}var j=this.createRecord(i);
this.store.add(j);
this.addRecord(j);
this.addedRecords.push(j);
(function(){if(this.isExpanded()){this.collapse()
}}).defer(10,this);
return
}},this)
}var d=[];
if(f===""){Ext.each(this.addedRecords,function(i){if(this.preventDuplicates&&this.usedRecords.containsKey(i.get(this.valueField))){return
}d.push(i)
},this)
}else{var e=new RegExp(Ext.escapeRe(f)+".*","i");
Ext.each(this.addedRecords,function(i){if(this.preventDuplicates&&this.usedRecords.containsKey(i.get(this.valueField))){return
}if(e.test(i.get(this.displayField))){d.push(i)
}},this)
}this.store.add(d);
this.sortStore();
if(this.store.getCount()===0&&this.isExpanded()){this.collapse()
}}});
Ext.reg("superboxselect",Ext.ux.form.SuperBoxSelect);
Ext.ux.form.SuperBoxSelectItem=function(a){Ext.apply(this,a);
Ext.ux.form.SuperBoxSelectItem.superclass.constructor.call(this)
};
Ext.ux.form.SuperBoxSelectItem=Ext.extend(Ext.ux.form.SuperBoxSelectItem,Ext.Component,{initComponent:function(){Ext.ux.form.SuperBoxSelectItem.superclass.initComponent.call(this)
},onElClick:function(b){var c=this.owner;
c.clearCurrentFocus().collapse();
if(c.navigateItemsWithTab){this.focus()
}else{c.el.dom.focus();
var a=this;
(function(){this.onLnkFocus();
c.currentFocus=this
}).defer(10,this)
}},onLnkClick:function(a){if(a){a.stopEvent()
}this.preDestroy();
if(!this.owner.navigateItemsWithTab){this.owner.el.focus()
}},onLnkFocus:function(){this.el.addClass("x-superboxselect-item-focus");
if(this.notExists===true){this.el.addClass("x-superboxselect-item-not-exists-focus")
}this.owner.outerWrapEl.addClass("x-form-focus")
},onLnkBlur:function(){this.el.removeClass("x-superboxselect-item-focus");
if(this.notExists===true){this.el.removeClass("x-superboxselect-item-not-exists-focus")
}this.owner.outerWrapEl.removeClass("x-form-focus")
},enableElListeners:function(){this.el.on("click",this.onElClick,this,{stopEvent:true});
this.el.addClassOnOver("x-superboxselect-item x-superboxselect-item-hover");
if(this.notExists===true){this.el.addClassOnOver("x-superboxselect-item-not-exists x-superboxselect-item-not-exists-hover")
}},enableLnkListeners:function(){this.lnk.on({click:this.onLnkClick,focus:this.onLnkFocus,blur:this.onLnkBlur,scope:this})
},enableAllListeners:function(){this.enableElListeners();
this.enableLnkListeners()
},disableAllListeners:function(){this.el.removeAllListeners();
this.lnk.un("click",this.onLnkClick,this);
this.lnk.un("focus",this.onLnkFocus,this);
this.lnk.un("blur",this.onLnkBlur,this)
},onRender:function(c,a){Ext.ux.form.SuperBoxSelectItem.superclass.onRender.call(this,c,a);
var e=this.el;
if(e){e.remove()
}this.el=e=c.createChild({tag:"li"},c.last());
e.addClass("x-superboxselect-item");
if(this.notExists===true){e.addClass("x-superboxselect-item-not-exists")
}var d=this.owner.navigateItemsWithTab?(Ext.isSafari?"button":"a"):"span";
var f=this.key;
Ext.apply(e,{focus:function(){var g=this.down(d+".x-superboxselect-item-close");
if(g){g.focus()
}},preDestroy:function(){this.preDestroy()
}.createDelegate(this)});
this.enableElListeners();
e.update(this.caption);
var b={tag:d,"class":"x-superboxselect-item-close",tabIndex:this.owner.navigateItemsWithTab?"0":"-1"};
if(d==="a"){b.href="#"
}this.lnk=e.createChild(b);
if(!this.disabled){this.enableLnkListeners()
}else{this.disableAllListeners()
}this.on({disable:this.disableAllListeners,enable:this.enableAllListeners,scope:this});
this.setupKeyMap()
},setupKeyMap:function(){this.keyMap=new Ext.KeyMap(this.lnk,[{key:[Ext.EventObject.BACKSPACE,Ext.EventObject.DELETE,Ext.EventObject.SPACE],fn:this.preDestroy,scope:this},{key:[Ext.EventObject.RIGHT,Ext.EventObject.DOWN],fn:function(){this.moveFocus("right")
},scope:this},{key:[Ext.EventObject.LEFT,Ext.EventObject.UP],fn:function(){this.moveFocus("left")
},scope:this},{key:[Ext.EventObject.HOME],fn:function(){var a=this.owner.items.get(0).el.focus();
if(a){a.el.focus()
}},scope:this},{key:[Ext.EventObject.END],fn:function(){this.owner.el.focus()
},scope:this},{key:Ext.EventObject.ENTER,fn:function(){}}]);
this.keyMap.stopEvent=true
},moveFocus:function(a){var b=this.el[a=="left"?"prev":"next"]()||this.owner.el;
b.focus.defer(100,b)
},preDestroy:function(a){if(this.fireEvent("remove",this)===false){return
}var b=function(){if(this.owner.navigateItemsWithTab){this.moveFocus("right")
}this.hidden.remove();
this.hidden=null;
this.destroy()
};
if(a){b.call(this)
}else{this.el.hide({duration:0.2,callback:b,scope:this})
}return this
},kill:function(){if(this.hidden&&this.hidden.remove&&typeof this.hidden.remove=="function"){this.hidden.remove()
}this.hidden=null;
this.purgeListeners();
this.destroy()
},onDisable:function(){if(this.hidden){this.hidden.dom.setAttribute("disabled","disabled")
}this.keyMap.disable();
Ext.ux.form.SuperBoxSelectItem.superclass.onDisable.call(this)
},onEnable:function(){if(this.hidden){this.hidden.dom.removeAttribute("disabled")
}this.keyMap.enable();
Ext.ux.form.SuperBoxSelectItem.superclass.onEnable.call(this)
},onDestroy:function(){Ext.destroy(this.lnk,this.el);
Ext.ux.form.SuperBoxSelectItem.superclass.onDestroy.call(this)
}});
Ext.ux.AreaCopyToClipboard=Ext.extend(Ext.form.TextField,{growMin:60,growMax:1000,growAppend:"&#160;\n&#160;",enterIsSpecial:false,preventScrollbars:false,defaultAutoCreate:{tag:"textarea",style:"width:100px;height:60px;",autocomplete:"off"},hideTrigger:false,editable:true,readOnly:false,wrapFocusClass:"x-trigger-wrap-focus",monitorTab:true,deferHeight:true,mimicing:false,actionMode:"wrap",defaultTriggerWidth:17,onResize:function(a,c){Ext.form.TriggerField.superclass.onResize.call(this,a,c);
var b=this.getTriggerWidth();
if(Ext.isNumber(a)){this.el.setWidth(a)
}this.wrap.setWidth(this.el.getWidth());
if(Ext.isNumber(c)){this.el.setHeight(c)
}this.wrap.setHeight(this.el.getHeight())
},getTriggerWidth:function(){var a=this.trigger.getWidth();
if(!this.hideTrigger&&!this.readOnly&&a===0){a=this.defaultTriggerWidth
}return a
},alignErrorIcon:function(){if(this.wrap){this.errorIcon.alignTo(this.wrap,"tl-tr",[2,0])
}},onRender:function(b,a){this.doc=Ext.isIE?Ext.getBody():Ext.getDoc();
Ext.form.TriggerField.superclass.onRender.call(this,b,a);
this.wrap=this.el.wrap({cls:"x-form-field-wrap x-form-field-trigger-wrap"});
this.trigger=this.wrap.createChild(this.triggerConfig||{tag:"img",src:this.ctcIcon||Ext.BLANK_IMAGE_URL,alt:"",title:this.ctcHint||"Copy to clipboard",cls:"x-menu-item-icon x-copy-to-clipboard-icon"});
this.initTrigger();
if(Ext.isFunction(this.refreshHandler)){this.refreshTrigger=this.wrap.createChild({tag:"img",src:this.refreshIcon||Ext.BLANK_IMAGE_URL,alt:"",title:this.refreshHint||"Update short link",cls:"x-menu-item-cion x-refresh-field-icon"});
this.initRefreshTrigger()
}if(!this.width){this.wrap.setWidth(this.el.getWidth()+this.trigger.getWidth())
}if(!this.height){this.wrap.setHeight(this.el.getHeight())
}this.resizeEl=this.positionEl=this.wrap;
if(this.grow){this.textSizeEl=Ext.DomHelper.append(document.body,{tag:"pre",cls:"x-form-grow-sizer"});
if(this.preventScrollbars){this.el.setStyle("overflow","hidden")
}this.el.setHeight(this.growMin)
}},getWidth:function(){return(this.wrap.getWidth())
},updateEditState:function(){if(this.rendered){this.el.dom.readOnly=this.readOnly;
this.trigger.setDisplayed(!this.hideTrigger);
this.onResize(this.width||this.wrap.getWidth())
}},setHideTrigger:function(a){if(a!=this.hideTrigger){this.hideTrigger=a;
this.updateEditState()
}},setReadOnly:function(a){if(a!=this.readOnly){this.readOnly=a;
this.updateEditState()
}},afterRender:function(){Ext.form.TriggerField.superclass.afterRender.call(this);
this.updateEditState()
},initTrigger:function(){this.mon(this.trigger,"click",this.onTriggerClick,this,{preventDefault:true});
this.trigger.addClassOnOver("x-form-trigger-over");
this.trigger.addClassOnClick("x-form-trigger-click");
var b=false;
try{b=!!document.queryCommandSupported;
if(!!b){b=!!document.queryCommandSupported("copy")
}}catch(a){}if(!b){this.trigger.dom.style.display="none"
}},initRefreshTrigger:function(){if(this.refreshTrigger){this.mon(this.refreshTrigger,"click",this.onRefreshTriggerClick,this,{preventDefault:true});
this.refreshTrigger.addClassOnOver("x-form-trigger-over");
this.refreshTrigger.addClassOnClick("x-form-trigger-click")
}},onDestroy:function(){Ext.removeNode(this.textSizeEl);
Ext.destroy(this.trigger,this.wrap);
if(this.refreshTrigger){Ext.destroy(this.refreshTrigger,this.wrap)
}if(this.mimicing){this.doc.un("mousedown",this.mimicBlur,this)
}delete this.doc;
Ext.form.TriggerField.superclass.onDestroy.call(this)
},fireKey:function(a){if(a.isSpecialKey()&&(this.enterIsSpecial||(a.getKey()!=a.ENTER||a.hasModifier()))){this.fireEvent("specialkey",this,a)
}},doAutoSize:function(a){return !a.isNavKeyPress()||a.getKey()==a.ENTER
},filterValidation:function(a){if(!a.isNavKeyPress()||(!this.enterIsSpecial&&a.keyCode==a.ENTER)){this.validationTask.delay(this.validationDelay)
}},onFocus:function(){Ext.form.TriggerField.superclass.onFocus.call(this);
if(!this.mimicing){this.wrap.addClass(this.wrapFocusClass);
this.mimicing=true;
this.doc.on("mousedown",this.mimicBlur,this,{delay:10});
if(this.monitorTab){this.on("specialkey",this.checkTab,this)
}}},checkTab:function(a,b){if(b.getKey()==b.TAB){this.triggerBlur()
}},onBlur:Ext.emptyFn,mimicBlur:function(a){if(!this.isDestroyed&&!this.wrap.contains(a.target)&&this.validateBlur(a)){this.triggerBlur()
}},triggerBlur:function(){this.mimicing=false;
this.doc.un("mousedown",this.mimicBlur,this);
if(this.monitorTab&&this.el){this.un("specialkey",this.checkTab,this)
}Ext.form.TriggerField.superclass.onBlur.call(this);
if(this.wrap){this.wrap.removeClass(this.wrapFocusClass)
}},beforeBlur:Ext.emptyFn,validateBlur:function(a){return true
},onTriggerClick:function(b){try{if(this.rendered&&!this.isDestroyed){this.el.dom.select()
}document.execCommand("copy");
if(Ext.isFunction(this.onSuccessCopied)){this.onSuccessCopied.call(this)
}}catch(a){if(!!window.console&&!!window.console.log){window.console.log("Error on copy to clipboard: "+a)
}if(Ext.isFunction(this.onTriggerClickError)){this.onTriggerClickError.call(this,a)
}else{throw a
}}},onRefreshTriggerClick:function(b){try{if(Ext.isFunction(this.refreshHandler)){this.refreshHandler.call(this,this)
}}catch(a){if(!!window.console&&!!window.console.log){window.console.log("Error on refresh trigger: "+a)
}if(Ext.isFunction(this.onTriggerClickError)){this.onTriggerClickError.call(this,a)
}else{throw a
}}},onTriggerClickError:Ext.emptyFn,autoSize:function(){if(!this.grow||!this.textSizeEl){return
}var c=this.el,a=Ext.util.Format.htmlEncode(c.dom.value),d=this.textSizeEl,b;
Ext.fly(d).setWidth(this.el.getWidth());
if(a.length<1){a="&#160;&#160;"
}else{a+=this.growAppend;
if(Ext.isIE){a=a.replace(/\n/g,"&#160;<br />")
}}d.innerHTML=a;
b=Math.min(this.growMax,Math.max(d.offsetHeight,this.growMin));
if(b!=this.lastHeight){this.lastHeight=b;
this.el.setHeight(b);
this.wrap.setHeight(b);
this.fireEvent("autosize",this,b)
}}});
Ext.reg("areactc",Ext.ux.AreaCopyToClipboard);
window.needFixAutofillPasswords=Ext.isChrome||(Ext.isGecko&&!(Ext.isIE||(document.documentMode&&(document.documentMode>=8))));
Ext.ux.PasswordField=Ext.extend(Ext.form.TextField,{inputType:"password",readOnly:window.needFixAutofillPasswords,defaultAutoCreate:{tag:"input",type:"text",size:"20",autocomplete:"off"},listeners:{focus:function(a){if(window.needFixAutofillPasswords){a.setReadOnly(false)
}}}});
Ext.reg("pwdfield",Ext.ux.PasswordField);
Ext.ns("Ext.ux.form");
Ext.ux.form.SearchField=Ext.extend(Ext.form.TwinTriggerField,{initComponent:function(){Ext.ux.form.SearchField.superclass.initComponent.call(this);
this.on("specialkey",function(b,c){var a=c.getKey();
if(a==c.ENTER){this.onTrigger2Click.call(this)
}else{if(a==c.ESC){this.onTrigger1Click.call(this)
}}},this)
},validationEvent:false,validateOnBlur:false,trigger1Class:"x-form-clear-trigger",trigger2Class:"x-form-search-trigger",hideTrigger1:true,width:200,hasSearch:false,onTrigger1Click:function(){this.el.dom.value="";
this.triggers[0].hide();
this.hasSearch=false;
var a;
if(!Ext.isEmpty(this.firstFieldId)){a=Ext.getCmp(this.firstFieldId);
if(a&&Ext.isFunction(a.reset)){a.reset()
}}this.reset();
if(Ext.isFunction(this.onClearFilter)){this.onClearFilter.call(this,this)
}},onTrigger2Click:function(){var b=this.getRawValue();
var c="";
if(!Ext.isEmpty(this.firstFieldId)){var a=Ext.getCmp(this.firstFieldId);
if(a){c=a.getValue()
}}if(Ext.isEmpty(b)&&Ext.isEmpty(c)){this.onTrigger1Click();
return
}this.hasSearch=true;
this.triggers[0].show();
this.searchHandler.call(this,this,b,c)
},searchHandler:Ext.emptyFn});
Ext.reg("searchfield",Ext.ux.form.SearchField);
Ext.ux.Spotlight=function(a){Ext.apply(this,a)
};
Ext.ux.Spotlight.prototype={active:false,animate:true,duration:0.25,easing:"easeNone",animated:false,createElements:function(){var a=Ext.getBody();
this.right=a.createChild({cls:"x-spotlight"});
this.left=a.createChild({cls:"x-spotlight"});
this.top=a.createChild({cls:"x-spotlight"});
this.bottom=a.createChild({cls:"x-spotlight"});
this.all=new Ext.CompositeElement([this.right,this.left,this.top,this.bottom])
},show:function(b,c,a){if(this.animated){this.show.defer(50,this,[b,c,a]);
return
}this.el=Ext.get(b);
if(!this.right){this.createElements()
}if(!this.active){this.all.setDisplayed("");
this.applyBounds(true,false);
this.active=true;
Ext.EventManager.onWindowResize(this.syncSize,this);
this.applyBounds(false,this.animate,false,c,a)
}else{this.applyBounds(false,false,false,c,a)
}},hide:function(b,a){if(this.animated){this.hide.defer(50,this,[b,a]);
return
}Ext.EventManager.removeResizeListener(this.syncSize,this);
this.applyBounds(true,this.animate,true,b,a)
},doHide:function(){this.active=false;
this.all.setDisplayed(false)
},syncSize:function(){this.applyBounds(false,false)
},applyBounds:function(e,d,j,i,k){var h=this.el.getRegion();
var a=Ext.lib.Dom.getViewWidth(true);
var g=Ext.lib.Dom.getViewHeight(true);
var f=0,b=false;
if(d){b={callback:function(){f++;
if(f==4){this.animated=false;
if(j){this.doHide()
}Ext.callback(i,k,[this])
}},scope:this,duration:this.duration,easing:this.easing};
this.animated=true
}this.right.setBounds(h.right,e?g:h.top,a-h.right,e?0:(g-h.top),b);
this.left.setBounds(0,0,h.left,e?0:h.bottom,b);
this.top.setBounds(e?a:h.left,0,e?0:a-h.left,h.top,b);
this.bottom.setBounds(0,h.bottom,e?0:h.right,g-h.bottom,b);
if(!d){if(j){this.doHide()
}if(i){Ext.callback(i,k,[this])
}}},destroy:function(){this.doHide();
Ext.destroy(this.right,this.left,this.top,this.bottom);
this.right=null;
delete this.el;
delete this.all
}};
Ext.Spotlight=Ext.ux.Spotlight;
Ext.apply(Ext.form.VTypes,{daterange:function(d,c){var b=c.parseDate(d);
if(!b){return false
}if(c.startDateField){var e=Ext.getCmp(c.startDateField);
if(!e.maxValue||(b.getTime()!=e.maxValue.getTime())){e.setMaxValue(b);
e.validate()
}}else{if(c.endDateField){var a=Ext.getCmp(c.endDateField);
if(!a.minValue||(b.getTime()!=a.minValue.getTime())){a.setMinValue(b);
a.validate()
}}}return true
}});