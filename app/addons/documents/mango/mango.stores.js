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
  'addons/documents/mango/mango.actiontypes'
],

function (FauxtonAPI, ActionTypes) {
  var Stores = {};

  Stores.MangoStore = FauxtonAPI.Store.extend({

    setIndexes: function (options) {
      this._indexes = options.indexes.toJSON();
    },

    getIndexes: function () {
      return this._indexes;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.MANGO_SHOW_INDEXLIST:
          this.setIndexes(action.options);
          this.triggerChange();
        break;
      }
    }

  });

  Stores.mangoStore = new Stores.MangoStore();

  Stores.mangoStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.mangoStore.dispatch);

  return Stores;

});
