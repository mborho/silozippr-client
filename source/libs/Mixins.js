/**
 * Copyright (c) 2012, Martin Borho. 
 * Licensed under the Affero General Public License version 3 or later. 
 * See LICENSE for details.  
 */
var ListExtenders = {
    highlight: function(index, unset) {
        if(this.selectedIndex !== false && !unset) {
            this.highlight(this.selectedIndex, true);
        }
        this.selectedIndex = index;
        this.results[index].selected = !unset;
        this.$.list.prepareRow(index);
        this.$.list.renderRow(index);
        this.$.list.lockRow();
    },
    itemSelected: function(inSender, inEvent) {
        var selection = this.$.list.getSelection(),
            newIndex = inEvent.index;
        this.highlight(newIndex);
        this.itemWasSelected(newIndex);
        return true;
    }, 
}    