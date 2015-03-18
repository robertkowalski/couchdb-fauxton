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
  var ConfirmButton = ReactComponents.ConfirmButton;

  var MangoIndexListController = React.createClass({
    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        indexes: mangoStore.getIndexesResults()
      };
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    componentDidMount: function () {
      prettyPrint();
      mangoStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function() {
      mangoStore.off('change', this.onChange);
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
        queryCode: mangoStore.getQueryCode(),
        database: mangoStore.getDatabase(),
      };
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    componentDidMount: function () {
      mangoStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function() {
      mangoStore.off('change', this.onChange);
    },

    render: function () {
      return (
        <div className="editor-wrapper span5 scrollable">
          <PaddedBorderedBox>
            <div className="editor-description">{this.props.description}</div>
          </PaddedBorderedBox>
          <PaddedBorderedBox>
            <strong>Database</strong>
            <div className="db-title">{this.state.database.id}</div>
          </PaddedBorderedBox>
          <form className="form-horizontal" onSubmit={this.saveQuery}>
            <PaddedBorderedBox>
              <CodeEditor
                id="query-field"
                ref="indexQueryEditor"
                title={'Index'}
                docs={false}
                code={this.state.queryCode} />
            </PaddedBorderedBox>
            <div className="padded-box">
              <div className="control-group">
                <ConfirmButton text="Create Index" />
              </div>
            </div>
          </form>
        </div>
      );
    },

    getEditor: function () {
      return this.refs.indexQueryEditor.getEditor();
    },

    hasValidCode: function() {
      var editor = this.getEditor();
      return editor.hadValidCode();
    },

    clearNotifications: function () {
      var editor = this.getEditor();
      editor.editSaved();
    },

    saveQuery: function (event) {
      event.preventDefault();

      if (!this.hasValidCode()) {
        FauxtonAPI.addNotification({
          msg:  'Please fix the Javascript errors and try again.',
          type: 'error',
          clear: true
        });
        return;
      }

      this.clearNotifications();

      Actions.saveQuery({
        database: this.state.database,
        queryCode: this.refs.indexQueryEditor.getValue()
      });
    }
  });

  var Views = {
    renderMangoIndexList: function (el) {
      React.render(<MangoIndexListController />, el);
    },
    removeMangoIndexList: function (el) {
      React.unmountComponentAtNode(el);
    },
    renderMangoIndexEditor: function (el, description) {
      React.render(
        <MangoIndexEditorController description={app.i18n.en_US['mango-descripton']} />,
        el
      );
    },
    removeMangoIndexEditor: function (el) {
      React.unmountComponentAtNode(el);
    },
    MangoIndexListController: MangoIndexListController,
    MangoIndexEditorController: MangoIndexEditorController
  };

  return Views;
});