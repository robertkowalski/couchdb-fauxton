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
  'addons/dataimporter/actiontypes',
  'addons/dataimporter/resources'
],
function (FauxtonAPI, ActionTypes, Resources) {
  return {
    dataImporterInit: function (firstTimeHere) {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_INIT,
        firstTimeHere: firstTimeHere
      });
    },

    fetchAllDBs: function () {
      $.ajax({
        method: "GET",
        dataType: "json",
        url: window.location.origin + "/_all_dbs"
      }).then(function (resp) {
        this._all_dbs = _.filter(resp, function (dbName) {
          return dbName[0] !== '_'; //_all_dbs without _ as first letter
        });
        this.setAllDBs(this._all_dbs);
      }.bind(this));
    },

    setAllDBs: function (all_dbs) {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_SET_ALL_DBS,
        allDBs: all_dbs
      });
    },

    dataIsCurrentlyLoading: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_DATA_IS_CURRENTLY_LOADING
      });
    },

    loadFile: function (file) {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_LOAD_FILE,
        file: file
      });
    },

    setPreviewView: function (viewType) {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_SET_PREVIEW_VIEW,
        view: viewType
      });
    },

    setParseConfig: function (key, value) {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_SET_PARSE_CONFIG,
        key: key,
        value: value
      });
    },

    loadDataIntoDatabase: function (createNewDB, targetDB, chunkedData) {
      var databaseIsNew = this.databaseIsNew(targetDB);

      if (createNewDB) {
        if (databaseIsNew) {
          var msg1 = 'The database ' + targetDB + ' already exists.';
          this.goToErrorScreen('', [msg1]);
        }
        this.loadIntoNewDB(targetDB, chunkedData);
      } else {
        this.loadDataIntoTarget(targetDB, chunkedData);
      }

      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_LOAD_DATA_INTO_DB_PROGRESS
      });
    },

    loadIntoNewDB: function (targetDB, chunkedData) {
      $.ajax({
        url: FauxtonAPI.urls('databaseBaseURL', 'server', targetDB),
        xhrFields: { withCredentials: true },
        contentType: 'application/json; charset=UTF-8',
        method: 'PUT'
      }).then(function (resp) {
        this.loadDataIntoTarget(targetDB, chunkedData);
      }.bind(this), function (resp) {
        this.goToErrorScreen(resp,  ['There was an error', 'Could not create a new database named: ' + targetDB]);
      }.bind(this));
    },

    loadDataIntoTarget: function (targetDB, chunkedData) {
      var loadURL = FauxtonAPI.urls('document', 'server', targetDB, '_bulk_docs');
      _.each(chunkedData, function (data, i) {
        var payload = JSON.stringify({ 'docs': data });
        var prettyprint = JSON.stringify({ 'docs': data }, null, 2);
        $.ajax({
          url: loadURL,
          xhrFields: { withCredentials: true },
          contentType: 'application/json; charset=UTF-8',
          method: 'POST',
          data: payload
        }).then(function (resp) {
          i++;
          if (i === chunkedData.length ) {
            this.successfulImport(targetDB);
            this.dataImporterInit(true);
          }
        }.bind(this), function (resp) {
          this.goToErrorScreen(resp, ['There was an error loading documents into ' + targetDB, 'Data that failed to load:' + prettyprint]);
        }.bind(this));
      }.bind(this));
    },

    goToErrorScreen: function (resp, messageArray) {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_GO_TO_ERROR_SCREEN,
        resp: resp,
        messageArray: messageArray
      });
    },

    databaseIsNew: function (targetDB) {
      return _.some(this._all_dbs, targetDB);
    },

    successfulImport: function (targetDB) {
      FauxtonAPI.navigate(FauxtonAPI.urls('allDocs', 'app', targetDB, '?include_docs=true'));
    },
  };
});
