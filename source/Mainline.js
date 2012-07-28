enyo.kind({
    name: "Mainline",
    kind: "FittableColumns",
    fit: true,
    results: [],
    pulled: false,
    published: {
        skey:false,
        source: false,
        startDoc: false,
        count: 0,
        expanded: true,        
    },
    components: [
        { kind: "FittableRows", fit:true, components: [
            {name: "header", kind: enyo.Control, content: "", showing: false, classes: "news-item source-item enyo-border-box"},        
            {name: "spinner", kind: "Image", src: "assets/ajax-loader.gif", showing: false},
            {name: "itemList", kind: "PulldownList", classes: "list-sample-pulldown-list", fit: true, 
                onSetupItem: "setupItem", onPullRelease: "pullRelease", onPullComplete: "pullComplete", components: [
                    {name:"newsItem", classes: "news-item enyo-border-box", showing:false, components:[ 
                        {classes: "line-meta", components: [
                            {name:"newsDate", classes:"line-date"},
                        ]},
                        {classes: "line-content", components: [
                            {classes: "line-source", components: [
                                {name: "newsPublisher", skey:"", ontap: "loadSourceFromList"},
                            ]},
                            {classes: "line-title", components: [
                                {name: "newsTitle"},
                            ]},
                            {name: "newsBody", classes: "line-body", style: "overflow-y: auto", allowHtml: true},
                        ]},
                    ]},
                    {name:"tweetItem", classes: "tweet enyo-border-box", showing:false, components:[ 
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
                    {name: "moreItem", classes: "news-item enyo-border-box", style:"height:55px", ontap: "loadNextPage", showing:false, components:[                        
                        {classes: "line-content", components: [
                            {name: "moreBody", content: "<b>more</b>", classes: "line-body", allowHtml: true},
                        ]},                    
                    ]}
                ]}
        ]},        
    ],
    create: function() {
        this.inherited(arguments);
        this.owner = this.getOwner();
    },
    clearItems: function() {
        this.results = [];
        this.$.itemList.setCount(0);
        this.$.itemList.reset();
        this.$.header.setShowing(false);        
    },
    clearMoreItem: function() {
        var components = this.$.itemList.getComponents(),
            lastItem = components.slice(components.length-1);
        if(lastItem.length  > 0 && lastItem[0].name === 'more') {
            lastItem[0].destroy();
        }
    },
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
        new enyo.Ajax({url: this.owner.getApiEndpoint()+"/api/list/docs"}).go(params).response(this, "build");
    },
    loadStartView: function() {        
        this.clearItems();
        this.skey = false;
        this.source =false;
        this.count = 0;
        this.startDoc = false;
        this.loadList();
    },
    loadNextPage: function(inSender, inEvent) {        
        this.loadList();
    },    
    loadSourceFromList: function(inSender, inEvent) {        
        var item = this.results[inEvent.index];
        this.loadSource({skey:item.skey, title:item.publisher});
    },    

    loadSource: function(source) {
        this.clearItems();        
        this.source = source;
        this.skey = source.skey;
        this.startDoc = false;
        this.$.header.setContent(source.title);
        this.loadList();
    },
    build: function(inSender, inResponse) {      
        var docs = inResponse.docs;
        enyo.Signals.send("onSpinner", false);
        if (this.pulled) { 
            this.$.itemList.completePull();
        }          
        
        if(inResponse.more !== false) {
            this.startDoc = inResponse.more;
            docs.push({name: "more", kind: "MoreItem"});
            this.lastDoc = docs.slice(docs.length-2);         
        } else {
            this.startDoc = false;            
            this.lastDoc = docs.slice(docs.length-1);
        }        
        
        if(this.skey) {
            this.$.header.setShowing(true);
        }
        
        if(inResponse.append) {
            this.results.pop();
            this.results = this.results.concat(docs);          
            this.$.itemList.setCount(this.results.length);        
            this.$.itemList.refresh();
        } else {
            this.results = docs;                      
            this.$.itemList.setCount(this.results.length);        
            this.$.itemList.reset();
        }
                
    },    
    setupItem: function(inSender, inEvent) {
        var item = this.results[inEvent.index]; 
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
    },
    addItem: function(row) {        
        row.combined = !this.skey;
        this.$.itemList.createComponent(row);
        this.count++;
    },
    pullRelease: function() { 
        var callFunc = false;
        this.pulled = true;         
        // add 1 second delay so we can see the loading message 
        if(this.source) {
            callFunc = function() {
                this.loadSource(this.source);
            }
        } else {
            callFunc = function() {
                this.loadStartView();
            }
        }
        setTimeout(enyo.bind(this, callFunc), 1000); 
            
    }, 
    pullComplete: function() { 
        this.pulled = false; 
        this.$.itemList.reset(); 
    },
});