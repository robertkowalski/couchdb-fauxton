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
  'addons/databases/actiontypes',
  'addons/databases/resources'
], function (app, FauxtonAPI, ActionTypes, Resources) {

  var DatabasesStore = FauxtonAPI.Store.extend({

    init: function (collection, backboneCollection) {
      // allow partial inits - don't depend on creation order
      this._collection = collection || this._collection;
      this._backboneCollection = backboneCollection || this._backboneCollection;
    },

    createNewDatabase: function (databaseName, nameAccCallback, notifyCallback) {
      databaseName = (databaseName === null ? null : databaseName.trim());
      if (databaseName === null || databaseName.length === 0) {
        notifyCallback({
          msg: 'Please enter a valid database name',
          type: 'error',
          clear: true
        });
        return;
      }
      nameAccCallback();

      var db = new this._backboneCollection.model({
        id: databaseName,
        name: databaseName
      });
      notifyCallback({ msg: 'Creating database.' });

      db.save().done(function () {
          notifyCallback({
            msg: 'Database created successfully',
            type: 'success',
            clear: true
          });
          var route = '#/database/' + app.utils.safeURLName(databaseName) + '/_all_docs?limit=' + Resources.DocLimit;
          app.router.navigate(route, { trigger: true });
        }
      ).error(function (xhr) {
          var responseText = JSON.parse(xhr.responseText).reason;
          notifyCallback({
            msg: 'Create database failed: ' + responseText,
            type: 'error',
            clear: true
          });
        }
      );
    },

    getCollection: function () {
      return this._collection;
    },

    getDatabaseNames: function () {
      return _.map(this._backboneCollection.toJSON(), function (item, key) {
        return item.name;
      });
    },

    dispatch: function (action) {
      switch (action.type) {

        case ActionTypes.DATABASES_INIT:
          this.init(action.options.collection, action.options.backboneCollection);
        break;

        case ActionTypes.DATABASES_CREATENEW:
          this.createNewDatabase(action.options.databaseName, action.options.nameAccCallback, action.options.notifyCallback);
        break;

        default:
        return;
      }
    }
  });

  var databasesStore = new DatabasesStore();
  databasesStore.dispatchToken = FauxtonAPI.dispatcher.register(databasesStore.dispatch.bind(databasesStore));
  return {
    databasesStore: databasesStore
  };

});
