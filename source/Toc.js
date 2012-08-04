
enyo.kind({
    name: "Toc",
    kind: "FittableRows",
    classes: "toc", 
    results: [],
    selectedIndex: false,
    public: {},
    //
    events: {
        onSourceSelected:"",
        onContentPanel:"",
    },
    //
    components: [
        {kind: "List", name:"list", fit: true, onSetupItem: "setupItem", components: [
            {name: "item", classes: "toc-item enyo-border-box", ontap: "itemSelected", components: [
                {name: "title", classes: "toc-title", content: ""},
                {name: "sum", classes: "toc-sum", content: ""}
            ]}
        ]},          
        {kind: "onyx.Toolbar", components: [
            {kind: "onyx.Grabber",ontap: "doContentPanel"},
        ]}     
    ],
    //
    create: function() {
        this.inherited(arguments);
        enyo.mixin(this, ListExtenders);
    },
    //
    build: function(inSender, inResponse) {
        var sources = []
        inResponse.rows.forEach(function(row) {
            sources.push({
                title: row.key[1],
                sum: row.value,
                skey: row.key[0]});
        });        
        this.results = sources;
        //
        this.$.list.setCount(this.results.length); 
        this.$.list.scrollToStart();
        this.render();
    },
    //
    setupItem: function(inSender, inEvent) {
        var data = this.results[inEvent.index];
        this.$.title.setContent(data.title);
        this.$.sum.setContent(data.sum);
        if(data.selected == true ) {
            this.$.item.addClass('selected');
        } else if(this.$.item.hasClass('selected')) {
            this.$.item.removeClass('selected');
        }
    },
    //
    itemWasSelected: function(index) {
        this.doSourceSelected(this.results[index]);
    },        
}); 