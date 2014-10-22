exports.command = function(databaseName) {
  	
    var client = this;
    var nano = client.globals.getNanoInstance();

    nano.db.destroy(databaseName, function(err, body, header) {
        
        if(err){
        
            console.log('in nano DeleteDatabase Function '+databaseName, err.message);
            return this;
        }
        
        console.log('nano cleaned up: '+ databaseName+' is deleted: ', body);
    });

    client.pause(1000);
    return this;
};