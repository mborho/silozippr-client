enyo.kind({
    name: "Toc",
    kind: enyo.Control,
    public: {
        connector: ""
    },
    events: {
        onSourceSelected:""
    },
    components: [
        {name: "tocList", kind: "Scroller", fit: true, touch: true, horizontal: "hidden", touchOverscroll:false, classes: "enyo-fit list enyo-unselectable", components: [
        
        ]}
    ],    
    create: function() {
        this.inherited(arguments);
    },    
    load: function() {
        this.connector.loadToc().response(this,"build");        
    },    
    build: function(inSender, inResponse) {
        enyo.forEach(inResponse.rows, this.addItem, this);
        this.$.tocList.render();
    },    
    addItem: function(row) {   
       this.$.tocList.createComponent({
            kind: "TocItem",
            title: row.key[1],
            sum: row.value,
            skey: row.key[0]
        });        
    },
    unselect: function() {
        try {
            this.$.tocList.controls.forEach(function(item) {    
                if(item.hasClass("onyx-selected")) {
                    item.removeClass("onyx-selected");
                    throw Exception;
                }
            });
        } catch(e) {};
    },
    sourceSelected: function(source) {
        this.doSourceSelected(source);
    }
}); 