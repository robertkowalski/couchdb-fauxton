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
  'addons/databases/actiontypes',
  'addons/databases/resources'
],
function (FauxtonAPI, ActionTypes, Resources) {
  return {
    init: function (collection, backboneCollection) {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATABASES_INIT,
        options: {
          collection: collection,
          backboneCollection: backboneCollection
        }
      });
    },

    createNewDatabase: function (databaseName, nameAccCallback, notifyCallback) {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATABASES_CREATENEW,
        options: {
          databaseName: databaseName,
          nameAccCallback: nameAccCallback,
          notifyCallback: notifyCallback
        }
      });
    }
  };
});
