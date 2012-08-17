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
        onSourceSelected: "",
        onDeleteItems:"",
        onDeleteSingleItem:"",
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
        {name: "scroller", kind: "Scroller", fit: true, touch: true, horizontal: "hidden", touchOverscroll:false,
            classes: "list enyo-unselectable", components: [
            {name: "list", kind: "Repeater", classes: "enyo-fit", fit: true, onSetupItem: "setupItem", components: [                
                {name:"item", ontap: "itemTapped", components: [
                    {name:"newsItem", classes: "news-item enyo-border-box",showing:false, components:[ 
                        {classes: "line-action-icon", kind: "onyx.IconButton", src: "assets/square-light.png", ontap:"showLineAction" },
                        {classes: "line-meta", components: [                        
                            {name:"newsDate", classes:"line-date"},
                        ]},
                        {classes: "line-content", components: [
                            {classes: "line-source", components: [
                                {name: "newsPublisher", skey:"", ontap: "loadSourceFromList"},
                            ]},
                            {classes: "line-title", components: [
                                {tag:"a", name: "newsTitle"},
                            ]},
                            {name: "newsBody", classes: "line-body", style: "overflow-y: auto", allowHtml: true},                        
                        ]},                    
                    ]},
                    {name:"tweetItem", classes: "tweet enyo-border-box", showing:false, components:[                 
                        {classes: "line-action-icon", kind: "onyx.IconButton", src: "assets/square-light.png", ontap:"showLineAction" },
                        {classes: "line-meta", components: [                        
                            {classes: "line-date", fit:true, components: [                            
                                {tag: "a", components: [
                                    {tag: "img", attributes: {src: "./assets/twitter.png"}}
                                ]},
                                {tag:"a", name:"tweetDate", classes:"tweet-link"},
                                {name:"tweetByline", content:"", allowHtml: true},
                            ]},
                        ]},
                        {classes: "line-content", components: [
                            {name: "tweetBody", classes: "line-body", allowHtml: true},
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
        {name: "lineActionPopup", kind: "onyx.Popup", scrim: true, classes: "line-action-popup", centered: true, modal: true, 
            floating: true,  onShow: "popupShown", onHide: "popupHidden", components: [
                {kind:"onyx.Button", content: "Delete item", classes: "onyx-negative", ontap:"deleteItem"},
        ]},      
    ],
    //
    create: function() {
        this.inherited(arguments);
    },
    //
    clearItems: function() {
        this.results = [];
        this.$.list.setCount(0);
        this.$.header.setShowing(false); 
        this.resetPushed();
        this.render();
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
        this.skey = false;
        this.source =false;
        this.count = 0;
        this.startDoc = false;
        this.$.sourceSum.setShowing(false);
        this.loadList();
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
            this.loadStartView();
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
    deleteItem: function(inSender, inEvent) {
        var index = this.lineActionIndex,
            item = this.results[index],
            doc = {
                _id: item.doc_id,
                _rev: item.rev,
                source: item.skey,
                _deleted: true                
            };
        //
        this.results[index].deleted = true;;
        this.$.list.setCount(this.results.length);
        //
        this.doDeleteSingleItem(doc); 
        // 
        this.hideLineAction();
        return true;
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
    showLineAction: function(inSender, inEvent) {
        this.lineActionIndex = inEvent.index;
        this.$.lineActionPopup.show();
        return true;
    },
    //
    hideLineAction: function(inSender, inEvent) {
        this.lineActionIndex = false;
        this.$.lineActionPopup.hide();
        return true;
    },    
    //
    itemTapped: function(inSender, inEvent) {
        var href = false;
        if(inEvent.target.tagName == "A" && inEvent.target.href ) {
            href = inEvent.target.href;
        } else if(inEvent.originator.name == "tweetDate"
            || inEvent.originator.name == "newsTitle") {
            href = this.results[inEvent.index].href;
        }
        if(href) {
            this.openHref(href);
        }
        return false;
    },
    //
    openHref: function(href) {        
//         this.log("opening "+href);
        window.open(href, '', ''); 
    },
});