/**
 * Copyright (c) 2012, Martin Borho. 
 * Licensed under the Affero General Public License version 3 or later. 
 * See LICENSE for details.  
 */
enyo.kind({
    name: "Tools",
    kind: "onyx.Drawer",
    classes: "options-drawer", 
    open: false,
    animated: false,
    item: {},
    connector: {},    
    public: {
        show: "show",
        setItem: "setItem",
    },
    //
    events: {               
        onDeleteSingleItem:"",
        onShortUrl: "",
        onSendTweet: "",
        onOptionsClosed: "",
    },
    //
    components: [
        {kind: "onyx.Scrim", name: "scrim", classes: "onyx-scrim-translucent", floating: true, showing: false}, 
        {name: "desc", allowHtml: true, classes: "item-options-desc"},  
        {name: "itemOptions", kind: "FittableColumns", classes: "item-options enyo-center", showing: false, components: [
                {kind:"onyx.Button", name: "tweetButton", content: "Tweet", classes: "onyx-affirmative", ontap:"showTweetOption", showing:false},
                {kind:"onyx.Button", name: "tweetReplyButton", content: "Reply", classes: "onyx-affirmative", ontap:"showTweetReplyOption", showing:false},
                {kind:"onyx.Button", name: "retweetButton", content: "RT", classes: "onyx-affirmative", ontap:"showRetweetOption", showing:false},
                {kind:"onyx.Button", content: "Delete", classes: "onyx-blue", ontap:"deleteItem"},
//                 {kind:"onyx.Button", content: "Cancel", classes: "onyx-negative", ontap:"close"},
/*                {classes: "options-close-icon", components: [
                        {kind: "onyx.IconButton", src: "assets/progress-button-cancel.png",ontap:"close"},
                ]},*/        
                {kind:"closeIcon", ontap:"cancelled"},
        ]},
        {name: "tweetOption", classes: "tweet-option", showing: false, components: [
            {kind: "onyx.InputDecorator", classes: "tweet-input-decorator", components: [
                {kind: "onyx.TextArea", name: "tweetTextArea", placeholder: "Enter text here", onkeypress:"setTweetCharCount"},
            ]},
            {kind: "FittableColumns", classes: "tweet-form-buttons enyo-center", components: [
                {kind:"onyx.Button", content: "Send", classes: "onyx-affirmative", ontap:"sendTweet"},                
                {name: "tweetCharCount", content: "", classes: "tweet-char-count", showing:true},
                { components: [
                    {name: "tweetSpinner", kind: "Image", classes:"options-spinner", src: "assets/spinner.gif", showing:false},
                ]},          
                {kind:"closeIcon", ontap:"cancelled"},
          ]}
        ]},
        {name: "retweetOption", classes: "tweet-option", showing: false, components: [
            {kind: "FittableColumns", classes: "tweet-form-buttons enyo-center", components: [
                {kind:"onyx.Button", content: "Retweet ?", classes: "onyx-affirmative", ontap:"sendRetweet"},
                { components: [
                    {name: "retweetSpinner", kind: "Image", src: "assets/spinner.gif", classes:"options-spinner", showing:false}, 
                ]},
                {kind:"closeIcon", ontap:"cancelled"},
            ]},
        ]},       
    ],
    //
    create: function() {
        this.inherited(arguments);
    },
    //
    display: function(inParams) {
        this.item = inParams.item;
        this.setDesc();
        this.showItemOptions();
        this.slideIn();
        return true;
    },
    //
    slideIn: function() {
        this.animated = true;
        this.$.scrim.showAtZIndex(3);
        this.setOpen(true);
        return true;
    },
    //
    cancelled: function() {
        this.doOptionsClosed();
        this.close()
        return true;
    },    
    //
    success: function() {
        this.doOptionsClosed();
        this.close()
        return true;
    },        
    //
    close: function() {
        this.animated = false;
        this.setOpen(false);
        this.$.scrim.hideAtZIndex(3);
        return true;
    },    
    //
    // activation of the different options
    //
    setDesc: function() {
        var desc = '';
        if(this.item.kind === "TweetItem") {
            desc = this.item.body;
        } else {
            desc = "<b>"+this.item.publisher+":</b><br/> "+this.item.title;
        }
        this.$.desc.setContent(desc);            
    },
    //
    showItemOptions: function() {
        if(this.item.kind === "TweetItem") {
            this.$.tweetButton.hide();
            this.$.tweetReplyButton.show();
            this.$.retweetButton.show();
        } else {
            this.$.tweetButton.show();
            this.$.tweetReplyButton.hide();
            this.$.retweetButton.hide();
        }
        this.$.tweetOption.hide();
        this.$.retweetOption.hide();
        this.$.itemOptions.show();
        return true;
    },
    //
    showTweetOption: function(inSender, inParams) {
        var text = this.item.title+" "+this.item.href;  
        this.showTweetForm({text:text});
        return true;
    },
    //
    showTweetReplyOption: function(inSender, inParams) {
        var text = '',
            userMatches = this.item.body.match(/\/\/twitter.com\/[^"]+/g);
        if(userMatches) {
            text = "@"+userMatches[0].replace("//twitter.com/",'');
        }
        this.showTweetForm({text: text, reply: true});
        return true;
    },
    //
    showTweetForm: function(params) {
        this.close();
        this.$.itemOptions.hide();
        this.$.tweetOption.show();
        this.setTweetTextArea(params.text);
        this.slideIn();
    },    
    //
    setTweetTextArea: function(text) {
        this.$.tweetTextArea.setValue(text);        
        this.setTweetCharCount();
    },
    //
    setTweetCharCount: function() {
        this.$.tweetCharCount.setContent(140-this.$.tweetTextArea.getValue().length);        
    },
    //
    setTweetSpinner: function(state) {
        this.$.tweetCharCount.setShowing(!state);
        this.$.tweetSpinner.setShowing(state);
    },
    //
    setRetweetSpinner: function(state) {
        this.$.retweetSpinner.setShowing(state);
    },    
    //
    showRetweetOption: function(inSender, inParams) {
        this.close();
        this.$.itemOptions.hide();        
        this.$.retweetOption.show();
        this.slideIn();
        return true;
    }, 
    //
    // actions
    //
    deleteItem: function(inSender, inEvent) {
        var doc = {
            _id: this.item.doc_id,
            _rev: this.item.rev,
            source: this.item.skey,
            _deleted: true                
        };
        //
        this.doDeleteSingleItem(doc); 
        // 
        this.close();
        return true;
    },
    // 
    sendTweet: function() {
        var text = this.$.tweetTextArea.getValue(),
            parts = text.split(' '),
            parts_sum = parts.length,
            that = this;
            
            function replaceLongUrl(inSender, data) {
                if(data.success === true) {                                    
                    var new_text = decodeURIComponent(
                        encodeURIComponent(text).replace(
                            encodeURIComponent(data.long), data.short));
                    text = new_text;
                    that.setTweetTextArea(new_text);
                    that.setTweetSpinner(false);
                }
            }
            
            if(text.length > 140) {
                for(var x=0;parts_sum > x;x++) {
                    if(parts[x].search(/^http[s]?:\/\//i) > -1) {
                        this.setTweetSpinner(true);
                        this.doShortUrl({url:parts[x], callback:replaceLongUrl});                        
                    }
                };
            } else {
                this.setTweetSpinner(true);
                this.doSendTweet({text:text});                        
            }            
    },
    //
    sendRetweet: function() {
        this.setRetweetSpinner(true);
        this.doSendTweet({retweet: true, id:this.item.doc_id});    
    }, 
    //
    // response receiver
    //
    tweetSended: function(inSender, inResponse) {
        this.setTweetSpinner(false);
        if(inResponse.success === true) {
            this.setTweetSpinner(false);
            this.success();
        }
    },
    //
    retweetSended: function(inSender, inResponse) {
        this.setRetweetSpinner(false);
        if(inResponse.success === true) {
            this.success();
        }
    },      
});

enyo.kind({
    name: "closeIcon",
    classes: "options-close-icon", 
    components: [
            {kind: "onyx.IconButton", src: "assets/progress-button-cancel.png"},
    ],
});