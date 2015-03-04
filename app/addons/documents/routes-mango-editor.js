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
  'addons/documents/helpers',
  'addons/documents/shared-routes',
  'addons/documents/views',
  'addons/documents/views-mango',
  'addons/databases/base',
  'addons/fauxton/components',
  'addons/documents/shared-views'

],

function (app, FauxtonAPI, Helpers,
  BaseRoute, Documents, Mango, Databases, Components, SharedViews) {


  var MangoEditorAndResults = BaseRoute.extend({
    layout: 'two_pane',
    routes: {
      'database/:database/_find': 'find',
      'database/:database/_index': 'createIndex',
      'database/:database/_list': 'listIndex',
    },

    events: {

    },

    initialize: function (route, masterLayout, options) {
      var databaseName = options[0];

      this.databaseName = databaseName;
      this.database = new Databases.Model({id: databaseName});
    },

    find: function (databaseName) {

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

      this.apiUrl = function () {
        return ['foo', 'bar'];
      };

      //this.showQueryOptions(urlParams, ddoc, viewName);
    },

    createIndex: function (database, _designDoc) {
      this.breadcrumbs = this.setView('#breadcrumbs', new Components.Breadcrumbs({
        toggleDisabled: true,
        crumbs: [
          {'type': 'back', 'link': Helpers.getPreviousPage(this.database)},
          {'name': 'Create new index', 'link': Databases.databaseUrl(this.database) }
        ]
      }));

      this.resultList = this.setView('#dashboard-lower-content', new SharedViews.ViewResultListReact({
        documents: null
      }));

      this.mangoEditor = this.setView('#left-content', new Mango.MangoIndexEditorReact({
        database: this.database
      }));

      this.apiUrl = function () {
        return ['foo', 'bar'];
      };
    },

    listIndex: function () {


      this.apiUrl = function () {
        return ['foo', 'bar'];
      };
    }

  });

  return MangoEditorAndResults;
});
