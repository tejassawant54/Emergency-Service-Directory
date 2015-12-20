$.fn.validation = function(Obj){
   
    //console.log("In Plugin: ",Obj);
    
    var patternName = /^[a-zA-Z ]+$/,
        patternZip = /^[0-9]+$/,
        type = Obj['type'],
        val = Obj['val'];
    
    if(type === 'name'){
        
        //console.log("name"); 
        if(val === undefined){
            //console.log("In undefined");
            return "";
        }else if(val.match(patternName)){
            //console.log("True");
            return val;
        }else {
            //console.log("False");
            return false;
        }
        
    }
    
    if(type === 'zip'){
        
        //console.log("zip"); 
        
        if(val === undefined){
            //console.log("In undefined");
            return "";
        }else if(val.match(patternZip)){
            //console.log("True");
            return val;
        }else {
            //console.log("False");
            return false;
        }
    }
}