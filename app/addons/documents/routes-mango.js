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
  'addons/documents/views-mango',
  'addons/databases/resources',
  'addons/fauxton/components',
  'addons/documents/resources',
  'addons/documents/views',


  'addons/documents/index-results/actions',
  'addons/documents/pagination/stores',
  'addons/documents/mango/mango.actions',
  'addons/documents/mango/mango.stores'

],

function (app, FauxtonAPI, Helpers, BaseRoute, Mango, Databases,
  Components, Resources, Documents, IndexResultsActions, PaginationStores,
  MangoActions, MangoStores) {

  var MangoIndexList = BaseRoute.extend({
    layout: 'with_tabs_sidebar',
    routes: {
      'database/:database/_indexlist(:extra)': {
        route: 'mangoIndexList',
        roles: ['fx_loggedIn']
      },
    },

    establish: function () {
      return [
        this.designDocs.fetch({reset: true}),
        this.allDatabases.fetchOnce()
      ];
    },

    initialize: function (route, masterLayout, options) {
      var databaseName = options[0];
      this.databaseName = databaseName;
      this.database = new Databases.Model({id: databaseName});

      // magic methods
      this.allDatabases = this.getAllDatabases();
      this.createDesignDocsCollection();
      this.addLeftHeader();
      this.addSidebar();

      this.rightHeader = this.setView('#right-header', new Documents.Views.RightAllDocsHeader({
        database: this.database
      }));
    },

    mangoIndexList: function () {
      var params = this.createParams(),
          urlParams = params.urlParams,
          mangoIndexCollection = new Resources.MangoIndexCollection(null, {
            database: this.database,
            params: null,
            paging: {
              pageSize: PaginationStores.indexPaginationStore.getPerPage()
            }
          });

      this.sidebar.setSelectedTab('mango-indexes');

      IndexResultsActions.newResultsList({
        collection: mangoIndexCollection,
        isListDeletable: true,
        bulkCollection: Documents.MangoBulkDeleteDocCollection,
        typeOfIndex: 'mango'
      });

      this.reactHeader = this.setView('#react-headerbar', new Documents.Views.ReactHeaderbar());

      this.breadcrumbs = this.setView('#breadcrumbs', new Components.Breadcrumbs({
        toggleDisabled: true,
        crumbs: [
          {'type': 'back', 'link': Databases.databaseUrl(this.database)},
          {'name': 'Indexes', 'link': Databases.databaseUrl(this.database)}
        ]
      }));

      this.rightHeader.hideQueryOptions();

      this.resultList = this.setView('#dashboard-lower-content', new Mango.MangoIndexListReact());

      this.apiUrl = function () {
        return [mangoIndexCollection.urlRef('index-apiurl', urlParams), FauxtonAPI.constants.DOC_URLS.MANGO];
      };
    }
  });

  var MangoIndexEditorAndQueryEditor = BaseRoute.extend({
    layout: 'two_pane',
    routes: {
      'database/:database/_index': {
        route: 'createIndex',
        roles: ['fx_loggedIn']
      },
      'database/:database/_find': {
        route: 'findUsingIndex',
        roles: ['fx_loggedIn']
      },
    },

    initialize: function (route, masterLayout, options) {
      var databaseName = options[0];
      this.databaseName = databaseName;
      this.database = new Databases.Model({id: databaseName});

      // magic methods
      this.allDatabases = this.getAllDatabases();
      this.createDesignDocsCollection();
      this.addLeftHeader();
      this.addSidebar();

      MangoActions.setDatabase({
        database: this.database
      });
    },

    findUsingIndex: function () {
      var params = this.createParams(),
          urlParams = params.urlParams,
          mangoResultCollection = new Resources.MangoDocumentCollection(null, {
            database: this.database,
            params: null,
            paging: {
              pageSize: PaginationStores.indexPaginationStore.getPerPage()
            }
          }),
          mangoIndexList = new Resources.MangoIndexCollection(null, {
            database: this.database,
            params: null,
            paging: {
              pageSize: PaginationStores.indexPaginationStore.getPerPage()
            }
          });

      // magic method
      this.sidebar.setSelectedTab('mango-query');
      this.reactHeader = this.setView('#react-headerbar', new Documents.Views.ReactHeaderbar());

      IndexResultsActions.newMangoResultsList({
        collection: mangoResultCollection,
        isListDeletable: true,
        textEmptyIndex: 'No Results',
        bulkCollection: Documents.BulkDeleteDocCollection
      });

      IndexResultsActions.runMangoFindQuery({
        database: this.database,
        queryCode: MangoStores.mangoStore.getQueryFindCode()
      });

      MangoActions.getIndexList({
        indexList: mangoIndexList
      });

      this.breadcrumbs = this.setView('#breadcrumbs', new Components.Breadcrumbs({
        toggleDisabled: true,
        crumbs: [
          {'type': 'back', 'link': Databases.databaseUrl(this.database)},
          {'name': app.i18n.en_US['mango-find-heading'], 'link': Databases.databaseUrl(this.database)}
        ]
      }));

      this.mangoEditor = this.setView('#left-content', new Mango.MangoQueryEditorReact({
        database: this.database
      }));

      this.resultList = this.setView('#dashboard-lower-content', new Mango.MangoIndexListReact());

      this.apiUrl = function () {
        return [mangoResultCollection.urlRef('query-apiurl', urlParams), FauxtonAPI.constants.DOC_URLS.MANGO];
      };
    },

    createIndex: function (database) {
      var params = this.createParams(),
          urlParams = params.urlParams,
          mangoIndexCollection = new Resources.MangoIndexCollection(null, {
            database: this.database,
            params: null,
            paging: {
              pageSize: PaginationStores.indexPaginationStore.getPerPage()
            }
          });

      IndexResultsActions.newResultsList({
        collection: mangoIndexCollection,
        isListDeletable: false,
        bulkCollection: Documents.MangoBulkDeleteDocCollection,
        typeOfIndex: 'mango'
      });

      this.breadcrumbs = this.setView('#breadcrumbs', new Components.Breadcrumbs({
        toggleDisabled: true,
        crumbs: [
          {'type': 'back', 'link': Databases.databaseUrl(this.database)},
          {'name': 'Create new index', 'link': Databases.databaseUrl(this.database) }
        ]
      }));

      this.resultList = this.setView('#dashboard-lower-content', new Mango.MangoIndexListReact());

      this.mangoEditor = this.setView('#left-content', new Mango.MangoIndexEditorReact({
        database: this.database
      }));

      this.apiUrl = function () {
        return [mangoIndexCollection.urlRef('index-apiurl', urlParams), FauxtonAPI.constants.DOC_URLS.MANGO];
      };
    }
  });

  return {
    MangoIndexEditorAndQueryEditor: MangoIndexEditorAndQueryEditor,
    MangoIndexList: MangoIndexList
  };
});
