module.exports = {
  'Deletes a database': function(client){
    var waitTime = 8000;
    var newDatabaseName = 'delete_db'+ client.globals.getTimestamp();

    client
      .createDatabase(newDatabaseName)
      .loginToGUI()
      .url('http://localhost:8000/#/database/'+newDatabaseName+'/_all_docs')
      .waitForElementPresent('#header-dropdown-menu a.dropdown-toggle.icon.fonticon-cog', waitTime, false)
      .execute('$("#header-dropdown-menu a.dropdown-toggle.icon.fonticon-cog").click();')
      .waitForElementPresent('#header-dropdown-menu .fonticon-trash', waitTime, false)
      .click("#header-dropdown-menu .fonticon-trash")
      .waitForElementVisible('#db_name', waitTime, false)
      .click("#db_name")
      .setValue("input#db_name", [newDatabaseName, client.Keys.ENTER] )
      .url('http://localhost:8000/_all_dbs')
      .waitForElementPresent('html',waitTime, false)
      .getText("body",function(result){
        var data = result.value,
          createdDatabaseIsNotPresent = data.indexOf(newDatabaseName);

        this.verify.ok(createdDatabaseIsNotPresent === -1,
          'Checking if new database no longer shows up in _all_dbs.');
      })
      .deleteDatabase(newDatabaseName) // clean datatbase in case of functional failure
    .end();
  }
};