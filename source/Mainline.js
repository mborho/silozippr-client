enyo.kind({
    name: "Mainline",
    kind: "FittableColumns",
    fit: true,
    published: {
        skey:false,
        count: 0,
        expanded: true,        
    },
    components: [
        { kind: "FittableRows", fit:true, components: [
            {name: "header", kind: enyo.Control, content: "", showing: false, classes: "news-item enyo-border-box"},        
            {name: "itemList", kind: "Scroller", ontap: "itemListClicked", fit: true, horizontal: "hidden", 
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
    loadList: function() {
        var params = {format:"json"};
        if(this.skey) {
            params.id = this.skey;
        } else {
            this.$.header.hide();
        }
        new enyo.Ajax({url: this.owner.getApiEndpoint()+"/api/list/docs"}).go(params).response(this, "build");
    },
    loadStartView: function() {        
        this.clearItems();
        this.skey = false;
        this.count = 0;
        this.loadList();
    },
    loadNextPage: function(inSender, inEvent) {
        console.log('load next page');
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
            this.$.itemList.createComponent({
                name: "more", classes: "news-item enyo-border-box",content: "more", 
            });
        }
    },
    build: function(inSender, inResponse) {      
        enyo.forEach(inResponse.docs, this.addItem, this);
        this.manageMoreItem(inResponse.more);                   
        this.$.itemList.render();
    },    
    addItem: function(row) {
        this.$.itemList.createComponent(row);
        this.count++;
    },
    itemListClicked: function(inSender, inEvent) {
        if(inEvent.originator.name == 'more') {
            this.loadNextPage();
        }
    },  
});