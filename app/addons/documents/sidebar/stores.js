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
  'addons/documents/sidebar/actiontypes'
],

function (app, FauxtonAPI, ActionTypes) {
  var Stores = {};

  Stores.SidebarStore = FauxtonAPI.Store.extend({

    initialize: function () {
      this._selectedTab = 'all-docs';
    },

    newOptions: function (options) {
      this._database = options.database;
      this._designDocs = options.designDocs;

      if (options.selectedTab) {
        this.setSelectedTab(options.selectedTab);
      }
    },

    setSelectedTab: function (tab) {
      this._selectedTab = tab;
    },

    getDatabaseName: function () {
      return this._database.safeID();
    },

    getDesignDocs: function () {
      var docs = this._designDocs.toJSON();
      return docs.map(function (doc) {
        doc.safeId = app.utils.safeURLName(doc._id.replace(/^_design\//, ""));
        return _.extend(doc, doc.doc);
      });
    },

    getSelectedTab: function () {
      return this._selectedTab;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.SIDEBAR_SET_SELECTED_TAB:
          this.setSelectedTab(action.tab);
          this.triggerChange();
        break;
        case ActionTypes.SIDEBAR_NEW_OPTIONS:
          this.newOptions(action.options);
          this.triggerChange();
        break;
        default:
        return;
        // do nothing
      }
    }

  });

  Stores.sidebarStore = new Stores.SidebarStore();

  Stores.sidebarStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.sidebarStore.dispatch);

  return Stores;

});
