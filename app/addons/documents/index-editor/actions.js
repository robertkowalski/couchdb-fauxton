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
  '../../../app',
  '../../../core/api',
  '../resources',
  './actiontypes',
  '../index-results/actions'
],
function (app, FauxtonAPI, Documents, ActionTypes, IndexResultsActions) {

  var ActionHelpers = {
    findDesignDoc: function (designDocs, designDocId) {
      return _.find(designDocs, function (doc) {
        return doc.id === designDocId;
      }).dDocModel();
    }
  };


  return {
    //helpers are added here for use in testing actions
    helpers: ActionHelpers,

    selectReduceChanged: function (reduceOption) {
      FauxtonAPI.dispatch({
        type: ActionTypes.SELECT_REDUCE_CHANGE,
        reduceSelectedOption: reduceOption
      });
    },

    changeViewName: function (name) {
      FauxtonAPI.dispatch({
        type: ActionTypes.VIEW_NAME_CHANGE,
        name: name
      });
    },

    editIndex: function (options) {
      FauxtonAPI.dispatch({
        type: ActionTypes.EDIT_INDEX,
        options: options
      });
    },

    clearIndex: function () {
      FauxtonAPI.dispatch({ type: ActionTypes.CLEAR_INDEX });
    },

    fetchDesignDocsBeforeEdit: function (options) {
      options.designDocs.fetch({reset: true}).then(function () {
        this.editIndex(options);
      }.bind(this));
    },

    saveView: function (viewInfo) {
      var designDoc = viewInfo.designDoc;
      designDoc.setDdocView(viewInfo.viewName, viewInfo.map, viewInfo.reduce);

      FauxtonAPI.addNotification({
        msg:  "Saving View...",
        type: "info",
        clear: true
      });

      designDoc.save().then(function () {
        FauxtonAPI.addNotification({
          msg:  "View Saved.",
          type: "success",
          clear: true
        });

        if (_.any([viewInfo.designDocChanged, viewInfo.hasViewNameChanged, viewInfo.newDesignDoc, viewInfo.newView])) {
          FauxtonAPI.dispatch({ type: ActionTypes.VIEW_SAVED });
          var fragment = FauxtonAPI.urls('view', 'showNewlySavedView', viewInfo.database.safeID(), designDoc.safeID(), app.utils.safeURLName(viewInfo.viewName));
          FauxtonAPI.navigate(fragment, { trigger: true });
        } else {
          this.updateDesignDoc(designDoc);
        }

        // this can be removed after the Views are on their own page
        IndexResultsActions.reloadResultsList();
      }.bind(this));
    },

    updateDesignDoc: function (designDoc) {
      FauxtonAPI.dispatch({
        type: ActionTypes.VIEW_UPDATE_DESIGN_DOC,
        designDoc: designDoc.toJSON()
      });
    },

    deleteView: function (options) {
      var viewName = options.viewName;
      var database = options.database;
      var designDoc = ActionHelpers.findDesignDoc(options.designDocs, options.designDocId);
      var promise;

      designDoc.removeDdocView(viewName);

      if (designDoc.hasViews()) {
        promise = designDoc.save();
      } else {
        promise = designDoc.destroy();
      }

      promise.then(function () {
        var url = FauxtonAPI.urls('allDocs', 'app', database.safeID(), '?limit=' + FauxtonAPI.constants.DATABASES.DOCUMENT_LIMIT);
        FauxtonAPI.navigate(url);
        FauxtonAPI.triggerRouteEvent('reloadDesignDocs');
      });
    },

    updateMapCode: function (code) {
      FauxtonAPI.dispatch({
        type: ActionTypes.VIEW_UPDATE_MAP_CODE,
        code: code
      });
    },

    updateReduceCode: function (code) {
      FauxtonAPI.dispatch({
        type: ActionTypes.VIEW_UPDATE_REDUCE_CODE,
        code: code
      });
    },

    selectDesignDoc: function (designDoc) {
      FauxtonAPI.dispatch({
        type: ActionTypes.DESIGN_DOC_CHANGE,
        options: {
          value: designDoc
        }
      });
    },

    updateNewDesignDocName: function (designDocName) {
      FauxtonAPI.dispatch({
        type: ActionTypes.DESIGN_DOC_NEW_NAME_UPDATED,
        options: {
          value: designDocName
        }
      });
    }
  };
});
