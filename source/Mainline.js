enyo.kind({
    name: "Mainline",
    kind: "FittableRows",
    fit: true,
    results: [],
    pulled: false,
    lineActionIndex: false,
    //
    events: {
        onLoadMainline: "",
        onDeleteItems:"",
        onDeleteSingleItem:"",
        onSpinner: "",
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
        {name: "header", content: "", showing: false, classes: "view-name news-item source-item"},     
        {kind:"FittableRows", fit:true, components: [                
            {name: "list", kind: "PulldownList", classes: "enyo-fit pulldown-list", fit: true, 
                onSetupItem: "setupItem", onPullRelease: "pullRelease", onPullComplete: "pullComplete", components: [                
                {name:"item", components: [
                    {name:"newsItem", classes: "news-item enyo-border-box",showing:false, components:[ 
                        {classes: "line-action-icon", kind: "onyx.IconButton", src: "assets/square-light.png", ontap:"showLineAction" },
                        {classes: "line-meta", components: [                        
                            {name:"newsDate", classes:"line-date"},
                        ]},
                        {classes: "line-content", components: [
                            {classes: "line-source", components: [
                                {name: "newsPublisher", skey:"", ontap: "loadSourceFromList"},
                            ]},
                            {classes: "line-title", ontap: "openUrl", components: [
                                {name: "newsTitle"},
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
                                {name:"tweetDate", classes:"tweet-link"},
                                {name:"tweetByline", content:"", allowHtml: true},
                            ]},
                        ]},
                        {classes: "line-content", components: [
                            {name: "tweetBody", classes: "line-body", allowHtml: true},
                        ]},                                        
                    ]},
                    {name: "moreItem", classes: "line-item-more news-item enyo-border-box", style:"height:55px", 
                            ontap: "loadNextPage", showing:false, components:[                        
                        {classes: "line-content", components: [
                            {name: "moreBody", content: "<b>more</b>", classes: "line-body", allowHtml: true},
                        ]},                    
                    ]}
                ]},
            ]},          
        ]},
        {name: "lineActionPopup", kind: "onyx.Popup", scrim: true, classes: "line-action-popup", centered: true, modal: true, 
            floating: true,  onShow: "popupShown", onHide: "popupHidden", components: [
                {kind:"onyx.Button", content: "Delete item", classes: "onyx-negative", ontap:"deleteItem"},
//                 {kind: "onyx.Button", content: "tweet"}, 
//                 {tag: "br"}, 
//                 {kind: "onyx.Button", content: "delete"}, 
        ]},
        {kind: "onyx.Toolbar", components: [
            {kind: "onyx.Grabber", ondragstart: "grabberDragstart", ondrag: "grabberDrag", ondragfinish: "grabberDragFinish"},
        ]}  
        
      
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
        this.render();
    },
    //
    clearMoreItem: function() {
        var components = this.$.list.getComponents(),
            lastItem = components.slice(components.length-1);
        if(lastItem.length  > 0 && lastItem[0].name === 'more') {
            lastItem[0].destroy();
        }
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
        enyo.Signals.send("onSpinner", true);
        this.doLoadMainline(params);
    },
    //
    loadStartView: function() {        
        this.clearItems();
        this.skey = false;
        this.source =false;
        this.count = 0;
        this.startDoc = false;
        this.loadList();
    },
    //
    loadNextPage: function(inSender, inEvent) {        
        this.loadList();
    },
    //
    loadSourceFromList: function(inSender, inEvent) {        
        var item = this.results[inEvent.index];
        this.loadSource({skey:item.skey, title:item.publisher});
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
        enyo.Signals.send("onSpinner", false);
        if (this.pulled) { 
            this.$.list.completePull();
        }          
        //
        if(docs.length == 0) {
            this.loadStartView();
        }
        //
        if(inResponse.more !== false) {
            this.startDoc = inResponse.more;
            docs.push({name: "more", kind: "MoreItem"});
            this.lastDoc = docs.slice(docs.length-2);         
        } else {
            this.startDoc = false;            
            this.lastDoc = docs.slice(docs.length-1);
        }        
        //
        if(this.skey) {
            this.$.header.setShowing(true);
        }
        //
        if(inResponse.append) {
            this.results.pop();
            this.results = this.results.concat(docs);          
            this.$.list.setCount(this.results.length);        
            this.$.list.refresh();
        } else {
            this.results = docs;                      
            this.$.list.setCount(this.results.length);        
            this.$.list.reset();            
            this.render();       
        }
        //
        this.$.list.show();
    },
    //
    setupItem: function(inSender, inEvent) {
        var item = this.results[inEvent.index]; 
        if(item.deleted == true) {            
            this.$.item.setShowing(false);
        } else {
            this.$.item.setShowing(true);
            if(item.kind=="NewsItem") {
                this.$.newsDate.setContent(item.date);        
                this.$.newsTitle.setContent(item.title);
                this.$.newsTitle.setAttribute('href',item.href);
                this.$.newsBody.setContent(item.body);
                this.$.newsPublisher.setContent((!this.skey) ? item.publisher : '');
                this.$.newsItem.setShowing(true);
                this.$.tweetItem.setShowing(false);
                this.$.moreItem.setShowing(false);
            } else if(item.kind=="TweetItem") {
                this.$.tweetDate.setContent(item.date);
                this.$.tweetByline.setContent(item.byline);
                this.$.tweetBody.setContent(item.body);            
                this.$.tweetItem.setShowing(true);
                this.$.newsItem.setShowing(false);
                this.$.moreItem.setShowing(false);
            } else if(item.kind=="MoreItem") {
                this.$.newsItem.setShowing(false);
                this.$.tweetItem.setShowing(false);
                this.$.moreItem.setShowing(true);            
            }
        }
    },
    //
    openUrl: function(inSender, inEvent) {        
        var item = this.results[inEvent.index];
        window.open(item.href, '', ''); 
    },
    // 
    reload: function() {         
        enyo.Signals.send("onSpinner", true);
        if(this.source) {
            this.loadSource(this.source);
        } else {
            this.loadStartView();
        }        
    },
    //
    delete: function() {        
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
        this.$.list.hide();
    },
    deleteItem: function(inSender, inEvent) {
        var index = this.lineActionIndex,
            item = this.results[index],
            doc = [{
                _id: item.doc_id,
                _rev: item.rev,
                source: item.skey,
                _deleted: true                
            }];
        //
        this.results[index].deleted = true;
        this.$.list.prepareRow(index);
        this.$.list.renderRow(index);
        this.$.list.lockRow();
        //
        this.doDeleteSingleItem(doc); 
        // 
        this.hideLineAction();
        return true;
    },
    //
    pullRelease: function() {         
        this.pulled = true;         
        setTimeout(enyo.bind(this, "reload"), 1000);                     
    },
    //
    pullComplete: function() { 
        enyo.Signals.send("onSpinner", false);
        this.pulled = false; 
        this.$.list.reset(); 
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
});