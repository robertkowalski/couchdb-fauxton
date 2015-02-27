// Licensed under the Apache License, Version 2.0 (the 'License'); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

define([
  'app',
  'api',

  // Modules
  "addons/documents/helpers",
  'addons/documents/shared-routes',
  'addons/documents/views',
  'addons/documents/views-index',
  'addons/databases/base',
  'addons/fauxton/components'

],

function (app, FauxtonAPI, Helpers, BaseRoute, Documents, Index, Databases, Components) {


  var MangoEditorAndResults = BaseRoute.extend({
    layout: 'two_pane',
    routes: {
      'database/:database/_find': 'find'
    },

    events: {

    },

    initialize: function (route, masterLayout, options) {
      var databaseName = options[0];

      this.databaseName = databaseName;
      this.database = new Databases.Model({id: databaseName});
      this.allDatabases = new Databases.List();
      this.createDesignDocsCollection();
    },

    establish: function () {
      return [

      ];
    },

    findWithMango: function (databaseName) {

      this.rightHeader = this.setView('#right-header', new Documents.Views.RightAllDocsHeader({
        database: this.database
      }));

      this.breadcrumbs = this.setView('#breadcrumbs', new Components.Breadcrumbs({
        toggleDisabled: true,
        crumbs: [
          {'type': 'back', 'link': Helpers.getPreviousPage(this.database)},
          {'name': this.database.id, 'link': Databases.databaseUrl(this.database) }
        ]
      }));

      this.footer = this.setView('#footer', new Documents.Views.Footer());

      this.viewEditor = this.setView('#left-content', new Index.ViewEditorReact({
        viewName: viewName,
        newView: false,
        database: this.database,
        designDocs: this.designDocs,
        designDocId: '_design/' + decodeDdoc
      }));

      this.apiUrl = function () {
        return ["foo", "bar"];
      };

      //this.showQueryOptions(urlParams, ddoc, viewName);
    },

    newViewEditor: function (database, _designDoc) {
      this.breadcrumbs = this.setView('#breadcrumbs', new Components.Breadcrumbs({
        toggleDisabled: true,
        crumbs: [
          {'type': 'back', 'link': Helpers.getPreviousPage(this.database)},
          {'name': 'Create new index', 'link': Databases.databaseUrl(this.database) }
        ]
      }));

      this.viewEditor = this.setView('#left-content', new Index.ViewEditorReact({
        viewName: 'new-view',
        newView: true,
        database: this.database,
        designDocs: this.designDocs,
        designDocId: designDoc,
        newDesignDoc: newDesignDoc
      }));

      this.resultList = this.setView('#dashboard-lower-content', new Index.ViewResultListReact({
        documents: null
      }));
    }

  });

  return MangoEditorAndResults;
});
