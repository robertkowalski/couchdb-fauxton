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
  'addons/databases/resources',
  'addons/fauxton/components',
  'addons/documents/shared-views',
  'addons/documents/resources',


],

function (app, FauxtonAPI, Helpers,
  BaseRoute, Documents, Mango, Databases, Components, SharedViews, Resources) {


  var MangoEditorAndResults = BaseRoute.extend({
    layout: 'two_pane',
    routes: {
      'database/:database/_index': 'createIndex'
    },

    initialize: function (route, masterLayout, options) {
      var databaseName = options[0];

      this.databaseName = databaseName;
      this.database = new Databases.Model({id: databaseName});
    },

    createIndex: function (database) {
      var params = this.createParams(),
          urlParams = params.urlParams,
          mangoIndexCollection = new Resources.MangoIndexCollection({database: this.database});

      this.breadcrumbs = this.setView('#breadcrumbs', new Components.Breadcrumbs({
        toggleDisabled: true,
        crumbs: [
          {'type': 'back', 'link': Helpers.getPreviousPage(this.database)},
          {'name': 'Create new index', 'link': Databases.databaseUrl(this.database) }
        ]
      }));

      this.resultList = this.setView('#dashboard-lower-content', new Mango.MangoIndexListReact({
        collection: mangoIndexCollection
      }));

      this.mangoEditor = this.setView('#left-content', new Mango.MangoIndexEditorReact({
        database: this.database
      }));

      this.apiUrl = function () {
        return [mangoIndexCollection.urlRef(urlParams), FauxtonAPI.constants.DOC_URLS.GENERAL];
      };
    }

  });

  return MangoEditorAndResults;
});
