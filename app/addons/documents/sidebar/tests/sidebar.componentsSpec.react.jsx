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
  '../../../../core/api',
  'react',
  'react-dom',
  '../../../../../test/mocha/testUtils',
  '../sidebar.react',
  'react-addons-test-utils',
  'sinon'
], function (FauxtonAPI, React, ReactDOM, utils, Components, TestUtils, sinon) {
  var assert = utils.assert;
  var DesignDoc = Components.DesignDoc;


  describe('DesignDoc', function () {
    var container;

    var selectedNavInfo = {
      navItem: 'all-docs',
      designDocName: '',
      designDocSection: '',
      indexName: ''
    };

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('confirm only single sub-option is shown by default (metadata link)', function () {
      var stub = function () { return true; };
      var el = TestUtils.renderIntoDocument(<DesignDoc
        toggle={stub}
        sidebarListTypes={[]}
        contentVisible={true}
        isVisible={stub}
        designDoc={{}}
        selectedNavInfo={selectedNavInfo}
        designDocName="id"
        databaseName="db-name" />, container);
      var subOptions = $(ReactDOM.findDOMNode(el)).find('.accordion-body li');
      assert.equal(subOptions.length, 1);
   });

    it('confirm design doc sidebar extensions appear', function () {
      var stub = function () { return true; };
      var el = TestUtils.renderIntoDocument(<DesignDoc
        toggle={stub}
        contentVisible={true}
        isVisible={stub}
        sidebarListTypes={[{
          selector: 'customProp',
          name: 'Search Indexes',
          icon: 'icon-here',
          urlNamespace: 'whatever'
        }]}
        designDoc={{
          customProp: {
            one: 'something'
          }
        }}
        selectedNavInfo={selectedNavInfo}
        designDocName="id"
        databaseName="db-name" />, container);
      var subOptions = $(ReactDOM.findDOMNode(el)).find('.accordion-body li');
      assert.equal(subOptions.length, 3); // 1 for "Metadata" row, 1 for Type List row ("search indexes") and one for the index itself
    });

    it('confirm design doc sidebar extensions do not appear when they have no content', function () {
      var stub = function () { return true; };
      var el = TestUtils.renderIntoDocument(<DesignDoc
        toggle={stub}
        sidebarListTypes={[{
          selector: 'customProp',
          name: 'Search Indexes',
          icon: 'icon-here',
          urlNamespace: 'whatever'
        }]}
        contentVisible={true}
        isVisible={stub}
        selectedNavInfo={selectedNavInfo}
        designDoc={{}} // note that this is empty
        designDocName="id"
        databaseName="db-name" />, container);
      var subOptions = $(ReactDOM.findDOMNode(el)).find('.accordion-body li');
      assert.equal(subOptions.length, 1);
    });

    it('confirm doc metadata page is highlighted if selected', function () {
      var stub = function () { return true; };
      var el = TestUtils.renderIntoDocument(<DesignDoc
        toggle={stub}
        sidebarListTypes={[]}
        contentVisible={true}
        isVisible={stub}
        selectedNavInfo={{
          navItem: 'designDoc',
          designDocName: 'id',
          designDocSection: 'metadata',
          indexName: ''
        }}
        designDoc={{}}
        designDocName="id"
        databaseName="db-name" />, container);

      assert.equal($(ReactDOM.findDOMNode(el)).find('.accordion-body li.active a').html(), 'Metadata');
    });

  });

});
