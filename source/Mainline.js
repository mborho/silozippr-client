/**
 * Copyright (c) 2012, Martin Borho. 
 * Licensed under the Affero General Public License version 3 or later. 
 * See LICENSE for details.  
 */
enyo.kind({
    name: "Mainline",
    kind: "FittableRows",
    fit: true,
    results: [],
    pushed: [],
    lineActionIndex: false,
    //
    events: {
        onLoadMainline: "",
        onLoadNextSource: "",
        onSourceSelected: "",
        onDeleteItems:"",
        onShowItemOptions: "",
        onDragged: "",
        onDragFinished: "",
    },
    //
    published: {
        skey:false,
        source: false,
        startDoc: false,
        count: 0,
        expanded: true,        
    },
    //
    components: [               
        {name: "header", content: "&#160;", showing: false, allowHtml:true, classes: "view-name news-item source-item"},                                                
        {name: "scroller", kind: "Scroller", onmousewheel: "mousewheel", fit: true, touch: true, horizontal: "hidden", touchOverscroll:false,
            classes: "list enyo-unselectable", components: [
            {name: "list", kind: "Repeater", classes: "enyo-fit", fit: true, onSetupItem: "setupItem", components: [                
                {name:"item", components: [
                    {name:"newsItem", classes: "news-item enyo-border-box",showing:false, components:[ 
                        {classes: "line-action-icon", kind: "onyx.IconButton", src: "assets/menu-icon-bookmark.png", ontap:"showLineAction" },
                        {classes: "line-meta", components: [                        
                            {name:"newsDate", classes:"line-date"},
                        ]},
                        {classes: "line-content", components: [
                            {classes: "line-source", components: [
                                {name: "newsPublisher", skey:"", ontap: "loadSourceFromList"},
                            ]},
                            {classes: "line-title", onclick: "metaDataClicked", components: [
                                {tag:"a", name: "newsTitle"},
                            ]},
                            {name: "newsBody", onclick: "hrefClicked", classes: "line-body", style: "overflow-y: auto", allowHtml: true},                        
                        ]},                    
                    ]},
                    {name:"tweetItem", classes: "tweet enyo-border-box", showing:false, components:[                 
                        {classes: "line-action-icon", kind: "onyx.IconButton", src: "assets/menu-icon-bookmark.png", ontap:"showLineAction" },
                        {classes: "line-meta", components: [                        
                            {classes: "line-date", fit:true, components: [                            
                                {tag: "a", components: [
                                    {tag: "img", attributes: {src: "./assets/twitter.png"}}
                                ]},
                                {tag:"a", name:"tweetDate", onclick: "metaDataClicked", classes:"tweet-link"},
                                {name:"tweetByline", onclick: "hrefClicked", content:"", allowHtml: true},
                            ]},
                        ]},
                        {classes: "line-content", components: [
                            {name: "tweetBody",  onclick: "hrefClicked", classes: "line-body", allowHtml: true},
                        ]},                                        
                    ]},
                    {name: "moreItem", fit:true, classes: "line-item-more news-item enyo-border-box", style:"height:55px", 
                            ontap: "loadNextPage", showing:false, components:[                        
                        {classes: "line-content", components: [
                            {name: "moreBody", content: "", classes: "line-body", allowHtml: true},
                        ]},                    
                    ]}
                ]},
            ]},          
        ]},
        {kind: "onyx.Toolbar",style:"text-align:right;", components: [
            {kind: "onyx.Grabber", style:"float:left", ondragstart: "grabberDragstart", ondrag: "grabberDrag", ondragfinish: "grabberDragFinish"},                                                
            { name:"pushedSum", kind:"onyx.Button", ontap:"showPushed", content: "-", classes: "sum-pushed", showing:false},                
            { name:"sourceSum", kind:"onyx.Button", content: "-", classes: "sum-source", showing:false},                
            { name: "reloadButton", kind: "onyx.Button", ontap: "reload", components: [
                    {name: "spinner", kind: "Image", src: "assets/spinner.gif", showing:false},    
                    {name:"spinnerStopped", kind:"Image", src:"assets/spinner-stopped.png", showing:true}
                ]}, 
            { name: "clearButton", kind: "onyx.Button", content: "Clear", ontap: "delete"},                                    
        ]},            
        {kind: enyo.Signals, onkeypress: "handleKeyPress"}//, onkeydown: "handleKeyDown", onkeyup: "handleKeyUp"}
    ],
    //
    create: function() {
        this.inherited(arguments);
        document.onmousewheel = enyo.dispatch;
    },
    //
    mousewheel: function (inSender, inEvent) {
        this.$.scroller.stabilize();
    },
    //
    // handle keyboard shortcuts
    //
    scroll: function(diff) {
        var bounds = this.$.scroller.getScrollBounds();
        this.$.scroller.stabilize();
        this.$.scroller.scrollTo(bounds.left, bounds.top+diff);
    },
    scrollTo: function(where) {
        this.$.scroller.stabilize();
        if(where == "bottom") {
            this.$.scroller.scrollToBottom();
        } else if(where == "top") {
            this.$.scroller.scrollToTop();
        }
    },
    handleKeyPress: function(inSender, inEvent) {
        if(!this.lineActionIndex) {
            var key = String.fromCharCode(inEvent.charCode).toLowerCase();
            if(key == "m") {
                this.delete();
            } else if(key == "j") {
                this.scroll(130);
            } else if(key == "k") {
                this.scroll(-130);
            } else if(key == "b") {
                this.scrollTo("bottom");
           } else if(key == "t") {
                this.scrollTo("top");
           } else if(key == "l") {
                var last = this.results.slice(-1); 
                if(last && last[0].kind == "MoreItem") {
                    this.loadNextPage();
                }
            } else if(key == "r") {
                this.reload();
            } else if(key == "n") {
                this.doLoadNextSource();
            }
       } 
    },
    //
    clearItems: function() {
        this.results = [];
        this.$.list.setCount(0);
        this.$.header.setShowing(false); 
        this.resetPushed();
        this.render();
    },
    clearState: function() {
        this.skey = false;
        this.source =false;
        this.count = 0;
        this.startDoc = false;
        this.$.sourceSum.setShowing(false);        
    },
    //
    loadList: function() {
        var params = {format:"json"};
        if(this.skey) {
            params.id = this.skey;
        } else {
            this.$.header.hide();
        }
        if(this.startDoc) {
            params.startkey = JSON.stringify(this.startDoc);            
        }
        this.handleSpinner(true);
        this.doLoadMainline(params);
    },
    //
    loadStartView: function() {        
        this.clearItems();
        this.clearState();
        this.loadList();
    },
    reloadEmptyMainline: function() {
        this.clearItems();
        this.clearState();
        this.doLoadNextSource();   
    },    
    //
    loadNextPage: function(inSender, inEvent) {  
        this.results[this.results.length-1].title = '<b>loading ...</b>';
        this.$.list.renderRow(this.results.length-1);
        this.loadList();
    },
    //
    loadSourceFromList: function(inSender, inEvent) {        
        var item = this.results[inEvent.index];
        this.doSourceSelected({skey:item.skey, title:item.publisher});
    },
    //
    loadSource: function(source) {
        this.clearItems();        
        this.source = source;
        this.skey = source.skey;
        this.startDoc = false;
        this.$.header.setContent(source.title);
        this.loadList();
    },    
    //
    build: function(inSender, inResponse) {      
        var docs = inResponse.docs;
        this.handleSpinner(false);
        //
        if(this.skey && !this.$.header.getShowing()) {
            this.$.header.setShowing(true);
            this.render();
        }        
        //
        if(docs.length == 0 && this.skey) {
            this.reloadEmptyMainline();
        }
        //
        if(inResponse.more !== false) {
            this.startDoc = inResponse.more;
            docs.push({name: "more", kind: "MoreItem", title:"<b>more</b>"});
            this.lastDoc = docs.slice(docs.length-2);         
        } else {
            this.startDoc = false;            
            this.lastDoc = docs.slice(docs.length-1);
        }        
        //
        if(inResponse.append) {
            this.results.pop();
            this.results = this.results.concat(docs);          
            this.lastScroll = this.$.scroller.getScrollBounds().top;
        } else {
            this.results = docs;                      
        }
        //
        this.$.list.setCount(this.results.length);   
    },
    //
    setupItem: function(inSender, inEvent) {
        var item = this.results[inEvent.index];
        var row = inEvent.item;
        if(item.deleted == true) {            
            row.$.item.setShowing(false);
        } else {
            row.$.item.setShowing(true);
            if(item.kind=="NewsItem") {
                row.$.newsDate.setContent(item.date);        
                row.$.newsTitle.setContent(item.title);
                row.$.newsTitle.setAttribute('href',item.href);
                row.$.newsBody.setContent(item.body);
                row.$.newsPublisher.setContent((!this.skey) ? item.publisher : '');
                row.$.newsItem.setShowing(true);
                row.$.tweetItem.setShowing(false);
                row.$.moreItem.setShowing(false);
            } else if(item.kind=="TweetItem") {
                row.$.tweetDate.setContent(item.date);
                row.$.tweetByline.setContent(item.byline);
                row.$.tweetBody.setContent(item.body);            
                row.$.tweetItem.setShowing(true);
                row.$.newsItem.setShowing(false);
                row.$.moreItem.setShowing(false);
            } else if(item.kind=="MoreItem") {
                row.$.newsItem.setShowing(false);
                row.$.tweetItem.setShowing(false);
                row.$.moreBody.setContent(item.title);
                row.$.moreItem.setShowing(true);            
                
            }
        }
        return true;
    },
    // 
    // pushed 
    //
    addPushedItem: function(item) {
        if(!this.skey || this.skey == item.skey) {
            this.pushed.unshift(item);
            this.setPushedSum();
        }
    },
    //
    setPushedSum: function() {        
        var length = this.pushed.length;
        if(length == 1) {
            this.$.pushedSum.setShowing(true);
        }
        this.$.pushedSum.setContent(length);
    },
    //
    resetPushed: function() {
        this.pushed = [];
        this.$.pushedSum.setShowing(false);
        this.$.pushedSum.setContent(0);
    },
    //
    showPushed: function(inSender, inEvent) {
        this.results = this.pushed.concat(this.results);       
        this.$.list.setCount(this.results.length); 
        this.changeSourceSum(this.pushed.length);
        this.resetPushed();        
    },
    //
    // actions
    //
    reload: function() {         
        this.handleSpinner(true);
        if(this.source) {
            this.loadSource(this.source);
        } else {
            this.loadStartView();
        }        
    },
    //
    delete: function(inSender, inEvent) {        
        var docs = [];
        this.results.forEach(function(item) {
            if(item.doc_id != undefined && item.deleted != true) {
                docs.push({
                    _id: item.doc_id,
                    _rev: item.rev,
                    source: item.skey,
                    _deleted: true
                })
            }
        });
        this.doDeleteItems(docs);
    },
    //
    // handle source sum
    //
    setSourceSum: function(inSender, inData) {
        if(inData.sum > 0) {
            this.$.sourceSum.setContent(inData.sum);
            this.$.sourceSum.setShowing(true);            
        } else {
            this.$.sourceSum.setShowing(false);
            this.$.sourceSum.setContent("-");                    
            this.reloadEmptyMainline();
        }
        return true;
    },
    //
    gotSourceInfo: function(inSender, inResponse) {
        if(inResponse.success == true && inResponse.rows.length > 0) {            
            this.setSourceSum(null, {sum:inResponse.rows[0].value});
        }
    },
    // 
    changeSourceSum: function(diff) {
        if(this.$.sourceSum.getShowing()) {
            this.setSourceSum(null, {sum:parseInt(this.$.sourceSum.getContent())+diff});
        }
    },
    //
    // handle list actions
    //
    handleSpinner: function(active) {
        if(active) {
            this.$.spinnerStopped.hide();
            this.$.spinner.show();
        } else {
            this.$.spinner.hide();
            this.$.spinnerStopped.show();
        }
    },
    //
    grabberDragstart: function(inSender, inEvent) {
        this.doDragged();
    },
    //
    grabberDragFinish: function(inSender, inEvent) {
        this.doDragFinished();
    },
    //
    hrefClicked: function(inSender, inEvent) {
        if(inEvent.target.href !== undefined && inEvent.which < 3) {
            this.openHref(inEvent.target.href);
        }
        return true;
    },
    //
    metaDataClicked: function(inSender, inEvent) {
        if((inEvent.originator.name == "tweetDate"|| inEvent.originator.name == "newsTitle") 
                && inEvent.which < 3) {
            this.openHref(this.results[inEvent.index].href);
        }
        return true;
    },
    //
    openHref: function(href) {  
        if(!this.lineActionIndex) {
            window.open(href); 
        }
    },
    //
    // show options drawer
    //    
    showLineAction: function(inSender, inEvent) {
        var item = this.results[inEvent.index];
        this.doShowItemOptions({item:item});
        this.lineActionIndex = inEvent.index;
        return true;
    },
    // 
    // result receivers
    //
    optionsClosed: function() {
        this.lineActionIndex = false;
    },
    //
    itemDeleted: function(inResponse) {
        this.changeSourceSum(-1);            
        this.handleSpinner(false);
        this.results[this.lineActionIndex].deleted = true;
        this.$.list.renderRow(this.lineActionIndex);
        this.optionsClosed();
    },         
});
