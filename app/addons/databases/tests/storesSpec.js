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
  'app',
  'api',
  'testUtils',
  'addons/databases/stores',
  'addons/databases/actiontypes',
  'addons/databases/resources'
], function (app, FauxtonAPI, utils, Stores, ActionTypes, Resources) {

  var assert = utils.assert;

  describe('Databases Store', function () {

    var oldColl, oldBackbone, oldRouter;
    var passedId, doneCallback, errorCallback, navigationTarget;

    beforeEach(function () {
      oldColl = Stores.databasesStore._collection;
      oldBackbone = Stores.databasesStore._backboneCollection;
      Stores.databasesStore._backboneCollection = {};
      Stores.databasesStore._backboneCollection.model = function (options) {
        passedId = options.id;
        return {
          "save": function () {
            var res = {
              "done": function (callback) {
                doneCallback = callback;
                return res;
              },
              "error": function (callback) {
                errorCallback = callback;
                return res;
              }
            };
            return res;
          }
        };
      };
      oldRouter = app.router;
      app.router = {
        "navigate": function (target) {
          navigationTarget = target;
        }
      };
    });

    afterEach(function () {
      Stores.databasesStore._collection = oldColl;
      Stores.databasesStore._backboneCollection = oldBackbone;
      app.router = oldRouter;
    });

    it("inits lazily based on what we pass", function () {
      Stores.databasesStore.init({"name": "col1"}, null);
      Stores.databasesStore.init(null, {"name": "col2"});
      Stores.databasesStore.init({"name": "col1"}, null);
      assert.equal("col1", Stores.databasesStore.getCollection().name);
      assert.equal("col2", Stores.databasesStore._backboneCollection.name);
    });

    it("Creates database in backend", function () {
      passedId = null;
      var nameAccCallback = sinon.spy();
      var notificationText = [];
      navigationTarget = null;
      Stores.databasesStore.createNewDatabase("testdb", nameAccCallback, function (options) {
        notificationText.push(options.msg);
      });
      doneCallback();
      assert.equal("testdb", passedId);
      assert.ok(nameAccCallback.calledOnce);
      assert.equal(2, notificationText.length);
      assert(notificationText[0].indexOf("Creating") >= 0);
      assert(notificationText[1].indexOf("success") >= 0);
      assert(navigationTarget.indexOf("testdb") >= 0);
    });

    it("Creates no database without name", function () {
      passedId = null;
      var nameAccCallback = sinon.spy();
      var notificationText = [];
      Stores.databasesStore.createNewDatabase("   ", nameAccCallback, function (options) {
        notificationText.push(options.msg);
      });
      assert(passedId === null);
      assert.ok(!nameAccCallback.called);
      assert.equal(1, notificationText.length);
      assert(notificationText[0].indexOf("valid database name") >= 0);
    });

    it("Shows error message on create fail", function () {
      passedId = null;
      var nameAccCallback = sinon.spy();
      var notificationText = [];
      navigationTarget = null;
      Stores.databasesStore.createNewDatabase("testdb", nameAccCallback, function (options) {
        notificationText.push(options.msg);
      });
      errorCallback({"responseText": JSON.stringify({"reason": "testerror"})});
      assert.equal("testdb", passedId);
      assert.ok(nameAccCallback.calledOnce);
      assert.equal(2, notificationText.length);
      assert(notificationText[0].indexOf("Creating") >= 0);
      assert(notificationText[1].indexOf("failed") >= 0);
      assert(notificationText[1].indexOf("testerror") >= 0);
      assert(navigationTarget === null);
    });

  });

});
