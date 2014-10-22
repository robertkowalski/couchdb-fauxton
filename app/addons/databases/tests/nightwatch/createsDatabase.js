module.exports = {
  'Creates a Database' : function(client) {
    var waitTime = 10000;
    var newDatabaseName = 'create_db'+ client.globals.getTimestamp();

    client
      .loginToGUI()
      .url('http://localhost:8000')
      .waitForElementPresent('#add-new-database', waitTime, false)
      .click('#add-new-database')
      .pause(1000)
      .waitForElementVisible('#js-new-database-name', waitTime, false)
      .setValue('#js-new-database-name', [newDatabaseName])
      .click('#js-create-database')
      .waitForElementVisible('#global-notifications div.alert-success', waitTime, false)
      .url('http://localhost:8000/_all_dbs')
      .waitForElementVisible('html', waitTime, false)
      .getText("html",function(result){
        var data = result.value,
          createdDatabaseIsPresent = data.indexOf(newDatabaseName);

        this.verify.ok(createdDatabaseIsPresent > 0, 
          'Checking if new database shows up in _all_dbs.');
      })
      .deleteDatabase(newDatabaseName)
    .end();
  }
};