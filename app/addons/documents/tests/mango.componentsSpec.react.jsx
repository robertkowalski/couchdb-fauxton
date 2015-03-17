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
  'addons/documents/mango/mango.components.react',
  'addons/documents/mango/mango.stores',
  'addons/documents/mango/mango.actions',

  'addons/documents/resources',
  'testUtils',
  'react'
], function (FauxtonAPI, Views, Stores, Actions, Resources, utils, React) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;

  var fakeData = {
    indexes: [
      {
        ddoc: '_design/e4d338e5d6f047749f5399ab998b4fa04ba0c816',
        def: {
          fields: [{
            '_id': 'asc'
          }]
        },
        name: 'e4d338e5d6f047749f5399ab998b4fa04ba0c816',
        type: 'json'
      },
      {
        ddoc: null,
        def: {
          fields: [{
            '_id': 'asc'
          }]
        },
        name: '_all_docs',
        type: 'special'
      }
    ]
  };

  describe('Mango ListController', function () {
    var container, toggleEl, indexCollection;
    beforeEach(function () {
      container = document.createElement('div');
      indexCollection = new Resources.MangoIndexCollection(fakeData);
      Actions.setIndexes({indexes: indexCollection});
    });

    afterEach(function () {
      React.unmountComponentAtNode(container);
    });

    it('render the elements', function () {
      toggleEl = TestUtils.renderIntoDocument(<Views.MangoIndexListController />, container);
      var $el = $(toggleEl.getDOMNode());
      var texts = [];
      $el.find('header-doc-id').each(function () {
        texts.push($(this).text());
      });
      assert.ok(texts.indexOf !== -1, 'e4d338e5d6f047749f5399ab998b4fa04ba0c816', 'name present');
      assert.ok(texts.indexOf !== -1, '_all_docs', 'name present');
    });

  });

});
