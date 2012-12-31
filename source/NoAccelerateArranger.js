/**
 * Copyright (c) 2012, Martin Borho. 
 * Licensed under the Affero General Public License version 3 or later. 
 * See LICENSE for details.  
 */
enyo.kind({
        name: "NoAccelerateArranger",
        kind: "enyo.CollapsingArranger",

        flow: function() {
                this.c$ = [].concat(this.container.children);
                this.controlsIndex = 0;
        },
});