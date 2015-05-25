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
  'addons/documents/sidebar/actiontypes'
],

function (FauxtonAPI, ActionTypes) {
  var Stores = {};

  Stores.SidebarStore = FauxtonAPI.Store.extend({

    initialize: function () {
    },

    dispatch: function (action) {
      switch (action.type) {
        default:
        return;
        // do nothing
      }
    }

  });

  Stores.sidebarStore = new Stores.SidebarStore();

  Stores.sidebarStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.SidebarStore.dispatch);

  return Stores;

});
