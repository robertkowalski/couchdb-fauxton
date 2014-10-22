exports.command = function(databaseName) {
    var client = this;
    var nano = client.globals.getNanoInstance();
    
    nano.db.create(databaseName, function(err, body, header) {
        if(err){
            console.log('Error in nano CreateDatabase Function: '+ databaseName, err.message);
            return;
        }
        console.log("nano created a database "+databaseName + body);
    });
    
    client.pause(1000);
    
    return this;
};