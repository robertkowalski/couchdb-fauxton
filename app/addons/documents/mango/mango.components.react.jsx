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
  'react',
  'addons/documents/mango/mango.stores',
  'addons/documents/mango/mango.actions',
  'addons/components/react-components.react',

  'plugins/prettify'
],

function (app, FauxtonAPI, React, Stores, Actions, ReactComponents) {
  var mangoStore = Stores.mangoStore;

  var Document = ReactComponents.Document;
  var PaddedBorderedBox = ReactComponents.PaddedBorderedBox;
  var CodeEditor = ReactComponents.CodeEditor;

  var MangoIndexListController = React.createClass({
    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        indexes: mangoStore.getIndexes()
      };
    },

    componentDidMount: function() {
      prettyPrint();
    },

    getIndexList: function () {
      return this.state.indexes.reduce(function (acc, key) {
        var content = JSON.stringify({
          def: key.def
        }, null, ' ');

        acc.push(
          <Document
            key={key.name}
            checked={null}
            docIdentifier={key.name}
            keylabel="name: "
            docContent={content} />
        );

        return acc;
      }, []);
    },

    render: function () {
      return (
        <div id="doc-list">
          {this.getIndexList()}
        </div>
      );
    }

  });

  var MangoIndexEditorController = React.createClass({
    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        queryCode: mangoStore.getQueryCode()
      };
    },

    render: function () {
      return (
        <div className="editor-wrapper span5 scrollable">
          <PaddedBorderedBox>
            CouchDB Query is an easy way to find documents on predefined indexes.
          </PaddedBorderedBox>
          <PaddedBorderedBox>
            <strong>Database</strong>
            <div className="db-title">Test-DB</div>
          </PaddedBorderedBox>
          <PaddedBorderedBox>
            <CodeEditor
              id={'query-function'}
              ref="indexQueryEditor"
              title={'Index'}
              docs={false}
              code={this.state.queryCode} />
          </PaddedBorderedBox>
        </div>
      );
    }
  });

  var Views = {
    renderMangoIndexList: function (el) {
      React.render(<MangoIndexListController />, el);
    },
    removeMangoIndexList: function (el) {
      React.unmountComponentAtNode(el);
    },
    renderMangoIndexEditor: function (el) {
      React.render(<MangoIndexEditorController />, el);
    },
    removeMangoIndexEditor: function (el) {
      React.unmountComponentAtNode(el);
    },
    MangoIndexListController: MangoIndexListController,
    MangoIndexEditorController: MangoIndexEditorController
  };

  return Views;
});
