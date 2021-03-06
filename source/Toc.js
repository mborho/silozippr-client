/**
 * Copyright (c) 2012, Martin Borho. 
 * Licensed under the Affero General Public License version 3 or later. 
 * See LICENSE for details.  
 */
enyo.kind({
    name: "Toc",
    kind: "FittableRows",
    classes: "toc", 
    results: [],
    totalSum:0,
    selectedIndex: false,
    public: {
        getNextSource: "getNextSource",
    },
    //
    events: {
        onSourceSelected:"",
        onContentPanel:"",
        onTotalSum:""
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
        var sources = [],
            sum = 0;
        inResponse.rows.forEach(function(row) {
            sources.push(
                {title: row.key[1],
                sum: row.value,
                skey: row.key[0]}
            );
            sum += row.value;
        });        
        this.results = sources;
        //
        this.setTotalSum(sum);
        //
        this.$.list.setCount(this.results.length); 
        this.$.list.scrollToStart();
        this.render();
    },
    //
    setupItem: function(inSender, inEvent) {
        var data = this.results[inEvent.index];
        this.$.title.setContent(data.title);
        if(data.sum > 0) {
            this.$.sum.setContent(data.sum);
            this.$.item.setShowing(true);
        } else {
            this.$.item.setShowing(false);
        }
        if(data.selected == true ) {
            this.$.item.addClass('selected');
        } else if(this.$.item.hasClass('selected')) {
            this.$.item.removeClass('selected');
        }
    },
    //
    setTotalSum: function(sum) {
        //
        this.totalSum = sum;
        this.doTotalSum({sum:sum});
    },
    //
    itemWasSelected: function(index) {
        this.doSourceSelected(this.results[index]);
    },
    //
    removeDocs: function(docs) {
        var sourceSums = {},
            max = this.results.length,
            sumRemoved = 0;
        //
        docs.forEach(function(doc) {
            if(sourceSums[doc.source] == undefined) {
                sourceSums[doc.source] = 0;
            }
            sourceSums[doc.source]++                                
            sumRemoved++;
        });
        //
        this.setTotalSum(this.totalSum-sumRemoved);
        //
        for(var x = 0;max > x; x++) {
            if(sourceSums[this.results[x].skey] != undefined) {
                this.results[x].sum -= sourceSums[this.results[x].skey];
                if(this.results[x].sum < 0) {
                    this.results[x].sum = 0;
                }
            }
        }
        //
        this.$.list.refresh();
    }, 
    //
    addPushed: function(doc) { 
        var max = this.results.length,
            index = false;
        for(var x = 0;max > x; x++) {
            if(this.results[x].skey == doc.skey) {
                index = x;
                break;                
            }            
        }
        if(index > -1 && this.results[index] !== undefined) {
            this.results[index].sum += 1;
        } else {
            this.results.push({skey: doc.skey, sum:1, title: doc.feed.title});
            this.$.list.setCount(this.results.length); 
        }
        this.setTotalSum(this.totalSum+1);
        this.$.list.refresh();
    },
    //
    getNextSource: function() {
        var len = this.results.length;
        for(var x=0; len > x; x++) {
            if(this.results[x].sum > 0) {
                this.itemWasSelected(x);                
                return this.results[x];
            }
        }
        return false;
    }
}); 