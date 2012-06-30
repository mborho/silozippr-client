enyo.kind({
    name: "Mainline",
    kind: enyo.Control,
    fit: true,
    published: {
        source:false,
        count: 0,
        expanded: true,        
    },
    components: [
        {name: "itemList", kind: "Scroller", fit: true, horizontal: "hidden", touchOverscroll:false, classes: "enyo-fit list enyo-unselectable", components: []}        
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
                    console.log(instance);
                    instance.destroy();                    
                }
            });
        }
        this.$.itemList.render();
    },
    loadList: function() {
        var params = {format:"json"};
        if(this.source) params.id = this.source;
          console.log(params);
        new enyo.Ajax({url: this.owner.getApiEndpoint()+"/api/list/docs"}).go(params).response(this, "build");
    },
    loadSource: function(source) {
        this.clearItems();        
        console.log('load in mainline: '+source);
        this.source = source;
        this.loadList();
    },
    build: function(inSender, inResponse) {        
        enyo.forEach(inResponse.docs, this.addItem, this);
        this.$.itemList.render();
    },    
    addItem: function(row) {  
        console.log(row);
        this.$.itemList.createComponent(row);
        this.count++;
    }
});