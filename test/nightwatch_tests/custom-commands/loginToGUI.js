exports.command = function(){
	
	var client = this;

	client
	    .url('http://localhost:8000/#login')
	    .waitForElementPresent('a[href="#login"]', 8000, false)
	    .click('a[href="#login"]')
	    .waitForElementPresent('#username', 8000, false)
	    .setValue('#username', ['tester'])
	    .setValue('#password', ['testerpass', client.Keys.ENTER])
	    .execute('$("#global-notifications button.close").click();')
	    .pause(1000);
	    
    return this;
}