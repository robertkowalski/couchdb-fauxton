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
  'api',
  'addons/documents/mango/mango.components.react',
  'addons/documents/mango/mango.actions'

],

function (FauxtonAPI, Mango, MangoActions, Resources) {

  var Views = {};

  Views.MangoIndexListReact = FauxtonAPI.View.extend({
    initialize: function (options) {
      this.collection = options.collection;
    },

    establish: function () {
      return this.collection.fetch({
        reset: true
      });
    },

    afterRender: function () {
      MangoActions.setIndexes({
        indexes: this.collection.toJSON()
      });

      Mango.renderMangoIndexList(this.el);
    },

    cleanup: function () {
      Mango.removeMangoIndexList(this.el);
    }
  });

  Views.MangoIndexEditorReact = FauxtonAPI.View.extend({
    initialize: function (options) {
      this.database = options.database;
    },

    afterRender: function () {
      MangoActions.setDatabase({
        database: this.database
      });

      Mango.renderMangoIndexEditor(this.el);
    },

    cleanup: function () {
      Mango.removeMangoIndexEditor(this.el);
    }
  });

  return Views;
});
