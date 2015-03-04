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

  var IndexListController = React.createClass({
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
      if (!this.state || !this.state.indexes) {
        return;
      }

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

  var Views = {
    renderIndexList: function (el) {
      React.render(<IndexListController />, el);
    },
    removeIndexList: function (el) {
      React.unmountComponentAtNode(el);
    },
    IndexListController: IndexListController
  };

  return Views;
});
