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
  'Deletes a database': function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .waitForElementNotPresent('.loading-lines', waitTime, false)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_all_docs')

      .waitForElementVisible('.nav-list', waitTime, false)
      .waitForElementPresent('#header-dropdown-menu a.dropdown-toggle.icon.fonticon-cog', waitTime, false)
      .clickWhenVisible("#header-dropdown-menu a.dropdown-toggle.icon.fonticon-cog", waitTime, false)
      .waitForElementPresent('#header-dropdown-menu .fonticon-trash', waitTime, false)
      .waitForElementPresent('#delete-db-modal', waitTime, false)
      .clickWhenVisible('#header-dropdown-menu .fonticon-trash', waitTime, false)
      .waitForElementVisible('#db-name', waitTime, false)
      .clickWhenVisible('#db-name', waitTime, false)
      .setValue('#db-name', [newDatabaseName, client.Keys.ENTER])
      .checkForDatabaseDeleted(newDatabaseName, waitTime)

    .end();
  }
};
