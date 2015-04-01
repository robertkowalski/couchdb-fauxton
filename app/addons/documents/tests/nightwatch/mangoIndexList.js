// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

module.exports = {

  'Creating new indexes with mango': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_indexlist')
      .waitForElementPresent('.prettyprint', waitTime, false)
      .assert.containsText('.header-doc-id', '_all_docs')
      .assert.containsText('#doc-list', 'ente_ente_mango_ananas')
    .end();
  },

  'Deleting new indexes with mango': function (client) {
    var waitTime = 10000,
        newDatabaseName = client.globals.testDatabaseName,
        newDocumentName1 = 'bulktest1',
        newDocumentName2 = 'bulktest2',
        baseUrl = client.globals.test_settings.launch_url;

    client
      .populateDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_indexlist')
      .waitForElementPresent('.control-toggle-alternative-header', waitTime, false)
      .click('.control-toggle-alternative-header')
      .getText('body', function (result) {
        var data = result.value;

        this.verify.ok(data.indexOf('ente_ente_mango_ananas') !== -1,
          'Checking if documents were deleted');
      })
      .waitForElementPresent('.control-select-all', waitTime, false)
      .click('.control-select-all')
      .click('.control-delete')
      .acceptAlert()
      .waitForElementVisible('#global-notifications .alert.alert-info', waitTime, false)
      .waitForElementNotPresent('[data-id="' + newDocumentName1 + '"]', waitTime, false)
      .getText('body', function (result) {
        var data = result.value;

        this.verify.ok(data.indexOf('ente_ente_mango_ananas') !== -1,
          'Checking if documents were deleted');
      })
      .end();
  }
};
