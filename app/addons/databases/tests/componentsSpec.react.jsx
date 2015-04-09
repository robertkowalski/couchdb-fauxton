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
define([
  'api',
  'addons/databases/components.react',
  'addons/databases/actions',
  'addons/databases/stores',
  'testUtils',
  "react"
], function (FauxtonAPI, Views, Actions, Stores, utils, React) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;

  describe('DatabasesController', function () {

    var container, dbEl, oldGetCollection;

    beforeEach(function () {
      // define our own collection
      oldGetCollection = Stores.databasesStore.getCollection;
      Stores.databasesStore.getCollection = function () {
        return [
          {
            "get": function (what) {
              if ("name" === what) {
                return "db1";
              } else {
                throw "Unknown get('" + what + "')";
              }
            },
            "status": {
              "dataSize": function () {
                return 2 * 1024 * 1024;
              },
              "numDocs": function () {
                return 88;
              },
              "isGraveYard": function () {
                return false;
              },
              "updateSeq": function () {
                return 99;
              }
            }
          },
          {
            "get": function (what) {
              if ("name" === what) {
                return "db2";
              } else {
                throw "Unknown get('" + what + "')";
              }
            },
            "status": {
              "dataSize": function () {
                return 1024;
              },
              "numDocs": function () {
                return 188;
              },
              "numDeletedDocs": function () {
                return 222;
              },
              "isGraveYard": function () {
                return true;
              },
              "updateSeq": function () {
                return 399;
              }
            }
          }
        ];
      };
      container = document.createElement('div');
      dbEl = TestUtils.renderIntoDocument(React.createElement(Views.DatabasesController, {}), container);
    });

    afterEach(function () {
      Stores.databasesStore.getCollection = oldGetCollection;
      React.unmountComponentAtNode(container);
    });

    it('renders base data of DBs', function () {
      assert.equal(1 + 2, dbEl.getDOMNode().getElementsByTagName('tr').length);
      assert.equal("db1", dbEl.getDOMNode().getElementsByTagName('tr')[1].getElementsByTagName('td')[0].innerText.trim());
      assert.equal("2.0 MB", dbEl.getDOMNode().getElementsByTagName('tr')[1].getElementsByTagName('td')[1].innerText.trim());
      assert.equal("88", dbEl.getDOMNode().getElementsByTagName('tr')[1].getElementsByTagName('td')[2].innerText.trim());
      assert.equal(0, dbEl.getDOMNode().getElementsByTagName('tr')[1].getElementsByTagName('td')[2].getElementsByTagName("i").length);
      assert.equal(2, dbEl.getDOMNode().getElementsByTagName('tr')[1].getElementsByTagName('td')[4].getElementsByTagName("a").length);
      assert.equal("db2", dbEl.getDOMNode().getElementsByTagName('tr')[2].getElementsByTagName('td')[0].innerText.trim());
      assert.equal(1, dbEl.getDOMNode().getElementsByTagName('tr')[2].getElementsByTagName('td')[2].getElementsByTagName("i").length);
    });

  });

  describe('AddDatabaseWidget', function () {

    var container, addEl, oldCreateNewDatabase;
    var createCalled, passedDbName;

    beforeEach(function () {
      oldCreateNewDatabase = Actions.createNewDatabase;
      Actions.createNewDatabase = function (dbName) {
        createCalled = true;
        passedDbName = dbName;
      };
      container = document.createElement('div');
      addEl = TestUtils.renderIntoDocument(React.createElement(Views.AddDatabaseWidget, {}), container);
    });

    afterEach(function () {
      Actions.createNewDatabase = oldCreateNewDatabase;
      React.unmountComponentAtNode(container);
    });

    it("Creates a database with given name", function () {
      createCalled = false;
      passedDbName = null;
      TestUtils.findRenderedDOMComponentWithTag(addEl, 'input').getDOMNode().value = "testdb";
      addEl.onAddDatabase();
      assert.equal(true, createCalled);
      assert.equal("testdb", passedDbName);
    });

  });

  describe('JumpToDatabaseWidget', function () {

    var container, jumpEl, oldNavigate, oldAddNotification, oldGetDatabaseNames, old$;
    var navigationTarget, notificationText;

    beforeEach(function () {
      old$ = $;
      // simulate typeahead
      $ = function (selector) {
        var res = old$(selector);
        res.typeahead = function () {};
        return res;
      };
      oldNavigate = FauxtonAPI.navigate;
      FauxtonAPI.navigate = function (url) {
        navigationTarget = url;
      };
      oldAddNotification = FauxtonAPI.addNotification;
      FauxtonAPI.addNotification = function (msg) {
        notificationText = msg;
      };
      oldGetDatabaseNames = Stores.databasesStore.getDatabaseNames;
      Stores.databasesStore.getDatabaseNames = function () {
        return ["db1", "db2"];
      };
      container = document.createElement('div');
      jumpEl = TestUtils.renderIntoDocument(React.createElement(Views.JumpToDatabaseWidget, {}), container);
    });

    afterEach(function () {
      $ = old$;
      FauxtonAPI.navigate = oldNavigate;
      FauxtonAPI.addNotification = oldAddNotification;
      Stores.databasesStore.getDatabaseNames = oldGetDatabaseNames;
      React.unmountComponentAtNode(container);
    });

    it("jumps to an existing DB", function () {
      navigationTarget = null;
      notificationText = null;
      jumpEl.jumpToDb("db1");
      assert(navigationTarget.indexOf("db1") >= 0);
      assert(notificationText === null);
    });

    it("jumps to an existing DB from input", function () {
      navigationTarget = null;
      notificationText = null;
      TestUtils.findRenderedDOMComponentWithTag(jumpEl, 'input').getDOMNode().value = "db2";
      jumpEl.jumpToDb();
      assert(navigationTarget.indexOf("db2") >= 0);
      assert(notificationText === null);
    });

    it("does nothing on empty name", function () {
      navigationTarget = null;
      notificationText = null;
      jumpEl.jumpToDb("  ");
      assert(navigationTarget === null);
      assert(notificationText === null);
    });

    it("shows a message on non-existent DB", function () {
      navigationTarget = null;
      notificationText = null;
      jumpEl.jumpToDb("db3");
      assert(navigationTarget === null);
      assert(notificationText.msg.indexOf("not exist") >= 0);
    });

  });

});

