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

    getNewButtonLinks: function () {  //these are links for the sidebar '+' on All Docs and All Design Docs
      var addLinks = FauxtonAPI.getExtensions('sidebar:links');
      var databaseName = this.props.databaseName;
      var newUrlPrefix = '#' + FauxtonAPI.urls('databaseBaseURL', 'app', databaseName);

      var addNewLinks = _.reduce(addLinks, function (menuLinks, link) {
        menuLinks.push({
          title: link.title,
          url: newUrlPrefix + '/' + link.url,
          icon: 'fonticon-plus-circled'
        });

        return menuLinks;
      }, [{
        title: 'New Doc',
        url: newUrlPrefix + '/new',
        icon: 'fonticon-plus-circled'
      }, {
        title: 'New View',
        url: newUrlPrefix + '/new_view',
        icon: 'fonticon-plus-circled'
      }, this.getMangoLink()]);

      return [{
        title: 'Add new',
        links: addNewLinks
      }];
    },

    getMangoLink: function () {
      var databaseName = this.props.databaseName;
      var newUrlPrefix = '#' + FauxtonAPI.urls('databaseBaseURL', 'app', databaseName);

      return {
        title: app.i18n.en_US['new-mango-index'],
        url: newUrlPrefix + '/_index',
        icon: 'fonticon-plus-circled'
      };
    },

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
      var buttonLinks = this.getNewButtonLinks();

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
            <div id="new-all-docs-button" className="add-dropdown">
              <Components.MenuDropDown links={buttonLinks} />
            </div>
           </li>
          <li className={isActive('mango-query')}>
            <a
              id="mango-query"
              href={'#/' + mangoQueryUrl}
              className="toggle-view">
              {runQueryWithMangoText}
            </a>
            <div id="mango-query-button" className="add-dropdown">
              <Components.MenuDropDown links={buttonLinks} />
            </div>
          </li>
          <li className={isActive('design-docs')}>
            <a
              id="design-docs"
              href={"#/" + databaseUrl + '?startkey="_design"&endkey="_design0"'}
              className="toggle-view">
              All Design Docs
            </a>
            <div id="new-design-docs-button" className="add-dropdown">
              <Components.MenuDropDown links={buttonLinks} />
            </div>
          </li>
        </ul>
      );
    }

  });

  var IndexSection = React.createClass({

    getDefaultProps: function () {
      return {
        indexTypeMap: {
          views:   { icon: 'fonticon-sidenav-map-reduce', urlFolder: '_view', type: 'view' },
          indexes: { icon: 'fonticon-sidenav-search', urlFolder: '_indexes', type: 'search' }
        }
      };
    },

    createItems: function () {
      this.props.items(function (index, key) {
        var href = FauxtonAPI.urls(this.indexTypeMap[this.props.selector].type, 'app', this.database, this.ddoc);
        return (
          <li key={key}>
          <a
            id="<%- removeSpecialCharacters(ddoc) %>_<%- removeSpecialCharacters(index) %>"
            href={"#/" + href + index}
            class="toggle-view">
            {index}
          </a>
          </li>
        );
      });
    },

    render: function () {
      var title = this.props.title;
      return (
        <li>
          <a class="accordion-header" data-toggle="collapse"  data-target="#<%- removeSpecialCharacters(ddoc) + ddocType %>">
            <div class="fonticon-play"></div>
            <span class={this.props.icon + " fonticon"}></span>
            {title}
            </a>
            <ul class="accordion-body collapse" id="<%- removeSpecialCharacters(ddoc) + ddocType %>">
              {this.createItems()}
          </ul>
        </li>
      );
    }

  });

  var DesignDoc = React.createClass({

    getInitialState: function () {
      return {
        contentHidden: true
      };
    },

    createIndexList: function () {
      var sidebarListTypes = FauxtonAPI.getExtensions('sidebar:list');
      sidebarListTypes.unshift({
        selector: 'views',
        name: 'Views'
      });

      return _.map(sidebarListTypes, function (index, key) {
        return <IndexSection
          key={key}
          title={index.name}
          selector={index.selector}
          items={this.props.designDoc[index.selector]} />;
      }.bind(this));
    },

    toggle: function (e) {
      e.preventDefault();
      var toggleState = !this.state.contentHidden;
      this.setState({contentHidden: toggleState});
      var state = toggleState ? 'hide' : 'show';
      $(this.getDOMNode()).find('#' + this.props.designDocName).collapse(state);
    },

    render: function () {
      console.log(this.props.designDoc);
      var toggleClassNames = 'accordion-header';
      if (!this.state.contentHidden) {
        toggleClassNames += ' down';
      }
      var designDocName = this.props.designDocName;
      var designDocMetaUrl = FauxtonAPI.urls('designDocs', 'app', this.props.databaseName, designDocName);
      return (
        <li onClick={this.toggle} className="nav-header">

        <div className={toggleClassNames}>
          <div className='accordion-list-item'>
            <div className='fonticon-play'></div>
            <p className='design-doc-name'>
              <span title={'_design/' + designDocName}>{'_design/' + designDocName}</span>
            </p>
          </div>
          <div className='new-button add-dropdown'></div>
        </div>
        <ul className='accordion-body collapse' id={this.props.designDocName}>
          <li>
            <a href={"#/" + designDocMetaUrl} className="toggle-view accordion-header">
              <span className="fonticon-sidenav-info fonticon"></span>
              Design Doc Metadata
            </a>
          </li>
          {this.createIndexList()}
        </ul>
        </li>
      );
    }

  });

  var DesignDocList = React.createClass({
    createDesignDocs: function () {
      return this.props.designDocs.map(function (designDoc, key) {
        return <DesignDoc key={key} designDoc={designDoc} designDocName={designDoc.safeId} databaseName={this.props.databaseName} />;
      }.bind(this));
    },

    render: function () {
      var designDocName = this.props.designDocName;
      var designDocMetaUrl = FauxtonAPI.urls('designDocs', 'app', this.props.databaseName, designDocName);

      return (
        <ul className="nav nav-list">
          {this.createDesignDocs()}
        </ul>
      );
    }

  });


  var SidebarController = React.createClass({
    getStoreState: function () {
      return {
        databaseName: store.getDatabaseName(),
        selectedTab: store.getSelectedTab(),
        designDocs: store.getDesignDocs()
      };
    },

    isActive: function (id) {
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

      console.log(this.props);
      return (
        <nav className="sidenav">
          <MainSidebar isActive={this.isActive} databaseName={this.state.databaseName} />
          <DesignDocList designDocs={this.state.designDocs} databaseName={this.state.databaseName} />
        </nav>
      );
    }
  });

  var Views = {
    SidebarController: SidebarController
  };

  return Views;
});
