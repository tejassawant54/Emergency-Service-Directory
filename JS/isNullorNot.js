/**
* isNullOrNot() - Jquery Plugin to check null or space for each xml element
*/

$.fn.isNullOrNot = function(){
    var val = this.text();
    
    if(val == "null" || val == ""){
        return val = "";
    }else{
        return val;
    }
}