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
            {name: "header", content: "", showing: false, classes: "news-item enyo-border-box"},        
            {name: "itemList", kind: "Scroller", fit: true, horizontal: "hidden", 
                touchOverscroll:false, classes: "list enyo-unselectable", components: []}        
        ]}
    ],
    create: function() {
        this.inherited(arguments);
        this.owner = this.getOwner();
    },
    clearItems: function() {
        var components = this.$.itemList.getComponents();
        if(components.length > 0) {
            components.forEach(function(instance) {
                if(instance.kind == "TweetItem" || instance.kind == "NewsItem") {
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
    loadSource: function(source) {
        this.clearItems();        
        console.log('load in mainline: '+source.skey);
        this.skey = source.skey;
        this.$.header.setContent(source.title);
        this.$.header.show();
        this.loadList();
    },
    build: function(inSender, inResponse) {        
        enyo.forEach(inResponse.docs, this.addItem, this);
        this.$.itemList.render();
    },    
    addItem: function(row) {  
        this.$.itemList.createComponent(row);
        this.count++;
    }
});