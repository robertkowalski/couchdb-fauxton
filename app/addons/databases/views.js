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
  'addons/fauxton/components',
  'api',
  'addons/databases/resources',
  'addons/databases/actions',
  'addons/databases/components.react'
],

function (app, Components, FauxtonAPI, Databases, Actions, ComponentsReact) {

  var Views = {};

  Views.Footer = FauxtonAPI.View.extend({
    template: 'addons/databases/templates/footer_alldbs',
  });

  Views.RightAllDBsHeader = FauxtonAPI.View.extend({
    tagName: 'div',

    initialize: function (options) {
      this.collection = options.collection;
    },

    afterRender: function () {
      Actions.init(null, this.collection);
      ComponentsReact.renderDatabasesHeader(this.el);
    },

    cleanup: function () {
      ComponentsReact.removeDatabasesHeader(this.el);
    }
  });

  Views.List = FauxtonAPI.View.extend({
    tagName: 'div',

    initialize: function (options) {
      this.collection = options.collection;
    },

    establish: function () {
      var currentDBs = this.paginated();
      var deferred = FauxtonAPI.Deferred();

      FauxtonAPI.when(currentDBs.map(function (database) {
        return database.status.fetchOnce();
      })).always(function (resp) {
        //make this always so that even if a user is not allowed access to a database
        //they will still see a list of all databases
        deferred.resolve();
      });
      return [deferred];
    },

    paginated: function () {
      var start = (this.page - 1) * this.perPage;
      var end = this.page * this.perPage;
      return this.collection.slice(start, end);
    },

    afterRender: function () {
      Actions.init(this.paginated(), this.collection);
      ComponentsReact.renderDatabases(this.el);
    },

    cleanup: function () {
      ComponentsReact.removeDatabases(this.el);
    },

    setPage: function (page) {
      this.page = page || 1;
    }
  });

  Views.Footer = FauxtonAPI.View.extend({
    tagName: 'div',

    initialize: function (options) {
      this.collection = options.collection;
    },

    afterRender: function () {
      Actions.init(null, this.collection);
      ComponentsReact.renderDatabasePagination(this.el, this.page);
    },

    cleanup: function () {
      ComponentsReact.removeDatabasePagination(this.el);
    },

    setPage: function (page) {
      this.page = page || 1;
    }
  });

  return Views;
});
