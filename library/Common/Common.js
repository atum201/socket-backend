/**
 * Created by Administrator on 9/3/2014.
 */
var Backbone = require('backbone');

var Common = Backbone.Model.extend({
    daydiff : function(first, second){
        return (second-first)/(1000*60*60*24);
    },
    monthdiff: function(first,second){
        return (this.monthindex(second) - this.monthindex(first));
    },
    monthindex: function(date){
        return (date.getFullYear() - 2014)*12 + date.getMonth();
    }

});

module.exports = Common;