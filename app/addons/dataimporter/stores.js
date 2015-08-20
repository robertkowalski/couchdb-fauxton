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
  'addons/dataimporter/actiontypes',
  'papaparse'
], function (app, FauxtonAPI, ActionTypes, Papa) {

  Papa.SCRIPT_PATH = '../../assets/js/libs/papaparse.js';

  var DATA_IMPORTER_NUMBERS = {
    BIG_FILE_SIZE_CAP: 100000,
    FILE_MAX_SIZE: 150000000,  //in bytes
    REPEAT_EVERY_3_SECONDS: 3000,
    MAX_ROWS_TO_PREVIEW: 500,
    DATA_ROW_CHUNKS: 500
  };

  var DataImporterStore = FauxtonAPI.Store.extend({
    init: function (firstTimeHere) { //to reset, call this with true
      if (firstTimeHere) {
        this.reset();
      } // else keeps store as it was when you left the page
    },

    reset: function () {
      this._isDataCurrentlyLoading = false;
      this._hasDataLoaded = false;
      this._hasErrored = false;
      this._theData = [];
      this._theMetadata = [];
      this._smallData = [];
      this._showView = 'table';
      this._theFile = { size: 0 };
      this._config = this.getDefaultConfig();
      this._completeFn = this._config.complete;
      this._errorFn = this._config.error;
      this._fileSize = 0;
      this._time = "just started";
      this._repeatTimeID;
      this._chunkedData = [];
      this._maxSize = DATA_IMPORTER_NUMBERS.FILE_MAX_SIZE;
      this._showErrorScreen = false;
      this._errorMessageArray = [];
      this._loadingInDBInProgress = false;
    },

    setAllDBs: function (allDBs) {
      this._all_dbs = allDBs;
    },

    getAllDBs: function () {
      return this._all_dbs;
    },

    getMaxSize: function () {
      return this._maxSize;
    },

    isDataCurrentlyLoading: function () {
      return this._isDataCurrentlyLoading;
    },

    dataIsLoading: function () {
      this._startTime = app.helpers.moment();
      this._isDataCurrentlyLoading = true;
    },

    hasDataLoaded: function () {
      return this._hasDataLoaded;
    },

    dataLoaded: function () {
      this._hasDataLoaded = true;
      clearInterval(this._repeatTimeID);
    },

    loadData: function (data) {
      this._theData = data;
    },

    getFileSize: function () {
      return this._theFile.size;
    },

    isThisABigFile: function () {
      return this._theFile.size > DATA_IMPORTER_NUMBERS.BIG_FILE_SIZE_CAP ? true : false;
    },

    getTimeSinceLoad: function () {
      return this._time;
    },

    repeatTime: function () {
      this._repeatTimeID = setInterval(function () {
        var secondsElapsed = app.helpers.moment().diff(this._startTime);
        this._time = app.helpers.getDateFromNow(this._startTime);
        if (secondsElapsed < 60000) {
          this._time = '~' + Math.ceil(secondsElapsed / 1000) + ' seconds ago';
        }
        this.triggerChange();
      }.bind(this), DATA_IMPORTER_NUMBERS.REPEAT_EVERY_3_SECONDS);
    },

    loadMeta: function (meta) {
      this._theMetadata = meta;
    },

    loadFile: function (file) {
      this._theFile = file;
      this.repeatTime();
    },

    getTotalRows: function () {
      return this._totalRows;
    },

    getPreviewView: function () {
      return this._showView;
    },

    setPreviewView: function (type) {
      this._showView = type;
    },

    calcSmallPreviewOfData: function () {
      //this is incase the file has large rows
      var filesize = this._theFile.size,
          rows = this._totalRows,
          sizeOfEachRow = filesize / rows, //this is approximate
          sizeCap = DATA_IMPORTER_NUMBERS.BIG_FILE_SIZE_CAP,  //in bytes
          numberOfRowsToShow;

      numberOfRowsToShow = Math.ceil(sizeCap / sizeOfEachRow);
      numberOfRowsToShow = (numberOfRowsToShow < DATA_IMPORTER_NUMBERS.MAX_ROWS_TO_PREVIEW) ?
        DATA_IMPORTER_NUMBERS.MAX_ROWS_TO_PREVIEW : numberOfRowsToShow;

      this._rowsShown = numberOfRowsToShow;
      this._smallData = this._theData.slice(0, this._rowsShown);
    },

    getSmallPreviewOfData: function () {
      return this._smallData;
    },

    getRowsShown: function () {
      return this._rowsShown;
    },

    getTheMetadata: function () {
      return this._theMetadata;
    },

    getTheData: function () {
      return this._theData;
    },

    papaparse: function () {
      //for some reason this._config.complete gets overwritten on setconfig
      this._config.complete = this._completeFn;
      this._config.error = this._errorFn;
      Papa.parse(this._theFile, this._config);
    },

    loadingComplete: function (results) {
      this.loadMeta(results.meta);
      this.loadData(results.data);
      this._totalRows = this._theData.length;

      if (this.isThisABigFile()) {
        this.calcSmallPreviewOfData();
      }

      this.chunkData();
      this.dataLoaded();
      this.triggerChange();
    },

    chunkData: function () {
      this.cleanTheDataForBlankID();
      for (var i = 0; i < this._theData.length; i += DATA_IMPORTER_NUMBERS.DATA_ROW_CHUNKS) {
        var oneChunk = this._theData.slice(i, i + DATA_IMPORTER_NUMBERS.DATA_ROW_CHUNKS);
        this._chunkedData.push(oneChunk);
      }
      this.triggerChange();
    },

    getChunkData: function () {
      return this._chunkedData;
    },

    cleanTheDataForBlankID: function () {
      // this function checks the last thing in the array, and deletes the last element if it is empty
      // which happens if you have a newline in at the end of your csv file
      var lastElement = this._theData.length - 1;

      if (this._theData[lastElement]._id === '') {
        this._theData.splice(lastElement, 1);
      }
    },

    clearData: function () {
      this._theData = [];
    },

    setParseConfig: function (key, value) {
      this._config[key] = value;
    },

    getConfigSetting: function (key) {
      return this._config[key];
    },

    getDefaultConfig: function () {

      // the following object shows all of the options available for papaparse
      // some are defaulted to undefined
      // this is from http://papaparse.com/docs#config
      return {
        delimiter : '',  // auto-detect
        newline: '',  // auto-detect
        header: true,
        dynamicTyping: true,
        preview: 0,
        encoding: '',
        worker: true, //true = page doesn't lock up
        comments: false,
        complete: function (results) {
          this.loadingComplete(results);
          this._changingConfig = false;
        }.bind(this),
        error: function () {
          var msg1 = 'There was an error while parsing the file.',
              msg2 = 'Please try again.';

          this.goToErrorScreen('', [msg1, msg2]);
        }.bind(this),
        download: false,
        skipEmptyLines: false,
        chunk: undefined, //define function for streaming
        beforeFirstChunk: undefined,
      };
    },

    loadDataIntoDatabaseProgress: function () {
      this._loadingInDBInProgress = true;
      this.triggerChange();
    },

    showErrorScreen: function () {
      return this._showErrorScreen;
    },

    getErrorMsg: function () {
      return this._errorMessageArray;
    },

    goToErrorScreen: function (resp, messageArray) {
      this._loadingInDBInProgress = false;
      this._showErrorScreen = true;
      if (resp) {
        messageArray.push(resp);
      }
      this._errorMessageArray.unshift(messageArray);
      this.triggerChange();
    },

    dbPopulationInProgress: function () {
      return this._loadingInDBInProgress;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.DATA_IMPORTER_INIT:
          this.init(action.firstTimeHere);
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_SET_ALL_DBS:
          this.setAllDBs(action.allDBs);
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_DATA_IS_CURRENTLY_LOADING:
          this.dataIsLoading();
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_LOAD_FILE:
          this.loadFile(action.file);
          this.papaparse(action.file);
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_SET_PREVIEW_VIEW:
          this.setPreviewView(action.view);
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_SET_PARSE_CONFIG:
          this.setParseConfig(action.key, action.value);
          this.clearData();
          this.papaparse(this._theFile);
        break;

        case ActionTypes.DATA_IMPORTER_LOAD_DATA_INTO_DB:
          this.loadDataIntoDatabaseProgress();
        break;

        case ActionTypes.DATA_IMPORTER_GO_TO_ERROR_SCREEN:
          this.goToErrorScreen(action.resp, action.messageArray );
        break;

        default:
        return;
      }
    }
  });

  var dataImporterStore = new DataImporterStore();
  dataImporterStore.dispatchToken = FauxtonAPI.dispatcher.register(dataImporterStore.dispatch.bind(dataImporterStore));

  return {
    dataImporterStore: dataImporterStore
  };
});
