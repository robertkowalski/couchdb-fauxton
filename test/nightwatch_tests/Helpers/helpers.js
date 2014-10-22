module.exports = {
    'username' : 'tester',
    'password' : 'testerpass',
    'getNanoInstance' : function(){
        var nano = require('nano')('http://'+this.username+':'+this.password+'@localhost:5984');
        return nano;
    },
    'getTimestamp' : function(){
    	var time = new Date(),
         timestamp = "(date"+time.getDate()+
            "-"+(time.getMonth()+1)+
            "-"+time.getFullYear()+
            ")(time"+time.getHours()+
            "-"+time.getMinutes()+
            "-"+time.getMilliseconds()+")";
    	return timestamp;
    }
}