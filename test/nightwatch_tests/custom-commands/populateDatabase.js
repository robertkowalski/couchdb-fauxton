exports.command = function(databaseName) {
  	
    var client = this;
    var nano = client.globals.getNanoInstance();
    var database = nano.use(databaseName);

    for( var i=1 ; i<20 ; i++){

        var document_id = "document_" + i;

        database.insert({ number: i }, document_id, function(err, body, header) {
            
            if (err) {
            
                console.log('Error in nano populateDatabase Function: '+document_id+',in database: '+databaseName, err.message);
                return client;
            }
            
            console.log('nano is populating '+ databaseName);
        });
    }

    client.pause(1000);
    return this; 
};