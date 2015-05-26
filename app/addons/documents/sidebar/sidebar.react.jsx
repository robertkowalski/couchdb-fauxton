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
  'addons/documents/sidebar/stores',
  'addons/documents/sidebar/actions',
  'addons/components/react-components.react',

  'plugins/prettify'
],

function (app, FauxtonAPI, React, Stores, Actions, Components) {
  var store = Stores.sidebarStore;

  var MainSidebar = React.createClass({

    buildDocLinks: function () {
      var base = FauxtonAPI.urls('base', 'app', this.props.databaseName);
      var isActive = this.props.isActive;

      return FauxtonAPI.getExtensions('docLinks').map(function (link) {
        return (
          <li key={link.url} className={isActive(link.url)}>
            <a id={link.url} href={base + link.url}>{link.title}</a>
          </li>
        );

      });
    },

    render: function () {
      var isActive = this.props.isActive;
      var docLinks = this.buildDocLinks();
      var changesUrl = '#' + FauxtonAPI.urls('changes', 'app', this.props.databaseName, '');
      var permissionsUrl = '#' + FauxtonAPI.urls('permissions', 'app', this.props.databaseName);
      var databaseUrl = FauxtonAPI.urls('allDocs', 'app', this.props.databaseName, '');
      var mangoQueryUrl = FauxtonAPI.urls('mango', 'query-app', this.props.databaseName);
      var runQueryWithMangoText = app.i18n.en_US['run-query-with-mango'];

      return (
        <ul className="nav nav-list">
          <li className={isActive('permissions')}>
            <a id="permissions" href={permissionsUrl}>Permissions</a>
          </li>
          <li className={isActive('changes')}>
            <a id="changes" href={changesUrl}>Changes</a>
          </li>
          {docLinks}
          <li className={isActive('all-docs')}>
            <a id="all-docs"
              href={"#/" + databaseUrl}
              className="toggle-view">
              All Documents
            </a>
            <div id="new-all-docs-button" className="add-dropdown"> </div>
           </li>
          <li className={isActive('mango-query')}>
            <a
              id="mango-query"
              href={'#/' + mangoQueryUrl}
              className="toggle-view">
              {runQueryWithMangoText}
            </a>
            <div id="mango-query-button" className="add-dropdown"> </div>
          </li>
          <li className={isActive('design-docs')}>
            <a
              id="design-docs"
              href={"#/" + databaseUrl + '?startkey="_design"&endkey="_design0"'}
              className="toggle-view">
              All Design Docs
            </a>
            <div id="new-design-docs-button" className="add-dropdown"> </div>
          </li>
        </ul>
      );
    }

  });

  var DesignDocs = React.createClass({

    render: function () {
      return null;
    }

  });


  var SidebarController = React.createClass({
    getStoreState: function () {
      return {
        databaseName: store.getDatabaseName(),
        selectedTab: store.getSelectedTab()
      };
    },

    isActive: function (id) {
      console.log('ac', this.state.selectedTab);
      if (id === this.state.selectedTab) {
        return 'active';
      }

      return '';
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      store.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      store.off('change', this.onChange);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },


    render: function () {

      return (
        <nav className="sidenav">
          <MainSidebar isActive={this.isActive} databaseName={this.state.databaseName} />
          <DesignDocs />
        </nav>
      );
    }
  });

  var Views = {
    SidebarController: SidebarController
  };

  return Views;
});
