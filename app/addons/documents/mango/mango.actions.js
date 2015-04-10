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
  'addons/documents/mango/mango.actiontypes',
  'addons/documents/mango/mango.stores'

],
function (app, FauxtonAPI, Documents, ActionTypes, Stores, IndexResultsActions) {
  var store = Stores.mangoStore;

  return {

    setDatabase: function (options) {
      FauxtonAPI.dispatch({
        type: ActionTypes.MANGO_SET_DB,
        options: options
      });
    },

    saveQuery: function (options) {
      var queryCode = JSON.parse(options.queryCode),
          mangoIndex = new Documents.MangoIndex(queryCode, {database: options.database});

      FauxtonAPI.addNotification({
        msg:  'Saving Index for Query...',
        type: 'info',
        clear: true
      });

      mangoIndex.save().then(function (res) {
        var msg = res.result === 'created' ? 'Index created.' : 'Index already exits.',
            url = FauxtonAPI.urls('mango', 'query-app', options.database.safeID());

        FauxtonAPI.addNotification({
          msg:  msg + ' Redirect to search...',
          type: 'success',
          clear: true
        });

        FauxtonAPI.dispatch({
          type: ActionTypes.MANGO_NEW_QUERY_CODE_FROM_FIELDS,
          options: {
            fields: queryCode.index.fields
          }
        });

        window.setTimeout(function () {
          FauxtonAPI.navigate(url);
          FauxtonAPI.addNotification({
            msg:  'Feel free to search now.',
            type: 'success',
            clear: true
          });
        }, 400);
      }.bind(this));
    },

    mangoReset: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.MANGO_RESET
      });
    },

    getIndexList: function (options) {
      FauxtonAPI.dispatch({
        type: ActionTypes.MANGO_NEW_AVAILABLE_INDEXES,
        options: options
      });

      options.indexList.fetch({reset: true}).then(function () {
        this.mangoReset();
      }.bind(this), function () {
        FauxtonAPI.addNotification({
          msg: 'Bad request!',
          type: "error",
          clear:  true
       });
      });
    }
  };
});
