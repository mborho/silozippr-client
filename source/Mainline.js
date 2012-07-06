enyo.kind({
    name: "Mainline",
    kind: "FittableColumns",
    fit: true,
    published: {
        skey:false,
        startDoc: false,
        count: 0,
        expanded: true,        
    },
    components: [
        {kind: "Signals", onLoadMore: "loadNextPage"},
        { kind: "FittableRows", fit:true, components: [
            {name: "header", kind: enyo.Control, content: "", showing: false, classes: "news-item enyo-border-box"},        
            {name: "itemList", kind: "Scroller", fit: true, horizontal: "hidden", 
                touchOverscroll:false, classes: "list", components: []}
        ]},        
    ],
    create: function() {
        this.inherited(arguments);
        this.owner = this.getOwner();
    },
    clearItems: function() {
        var components = this.$.itemList.getComponents();
        if(components.length > 0) {
            components.forEach(function(instance) {
                if(instance.kind == "TweetItem" 
                        || instance.kind == "NewsItem" 
                                || instance.name == "more") {
                    instance.destroy();                       
                }
            });
        }
        this.$.itemList.render();
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
        new enyo.Ajax({url: this.owner.getApiEndpoint()+"/api/list/docs"}).go(params).response(this, "build");
    },
    loadStartView: function() {        
        this.clearItems();
        this.skey = false;
        this.count = 0;
        this.startDoc = false;
        this.loadList();
    },
    loadNextPage: function(inSender, inEvent) {        
        this.loadList();
    },    
    loadSource: function(source) {
        this.clearItems();        
        this.skey = source.skey;
        this.$.header.setContent(source.title);
        this.$.header.show();
        this.loadList();
    },
    manageMoreItem: function(show) {
        if(show === true) {
            this.$.itemList.createComponent({name: "more", kind: "MoreItem"});
        }
    },
    build: function(inSender, inResponse) {      

        var docs = inResponse.docs,
            appendDocs = inResponse.append;
        if(appendDocs) {
            this.clearMoreItem();
        }
        enyo.forEach(docs, this.addItem, this);
        this.lastDoc = docs.slice(docs.length-1);
        if(inResponse.more !== false) {
            this.startDoc = inResponse.more;
            this.manageMoreItem(true);                   
        } else {
            this.startDoc = false;
        }
        this.$.itemList.render();
    },    
    addItem: function(row) {
        this.$.itemList.createComponent(row);
        this.count++;
    },
});