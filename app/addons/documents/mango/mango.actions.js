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
  'addons/documents/resources',
  'addons/documents/mango/mango.actiontypes'
],
function (app, FauxtonAPI, Documents, ActionTypes) {
  return {
    setIndexes: function (options) {
      FauxtonAPI.dispatch({
        type: ActionTypes.MANGO_SHOW_INDEXLIST,
        options: options
      });
    },

    setDatabase: function (options) {
      FauxtonAPI.dispatch({
        type: ActionTypes.MANGO_SET_DB,
        options: options
      });
    },

    saveQuery: function (options) {
      var mangoIndex = new Documents.MangoIndex(JSON.parse(options.queryCode), {database: options.database});

      FauxtonAPI.addNotification({
        msg:  'Saving Index for Query...',
        type: 'info',
        clear: true
      });

      mangoIndex.save().then(function (res) {
        var msg = res.result === 'created' ? 'Index created' : 'Index already exits',
            url = FauxtonAPI.urls('mango', 'index-app', options.database.safeID());

        FauxtonAPI.addNotification({
          msg:  msg,
          type: 'success',
          clear: true
        });

        this.designDocs.fetch({reset: true});
      });

    }
  };
});
