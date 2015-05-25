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


  //doclink
  // <li><a id="docLink_<%-link.url%>" href="<%- base + link.url %>"><%- link.title %></a></li>
  var SidebarController = React.createClass({
    getStoreState: function () {
      return {
      };
    },


    render: function () {
      var docLinks = [];
      var changesUrl = "";
      var permissionsUrl = "";

      return (
        <nav className="sidebar">
          <ul class="nav nav-list">
            <li><a id="permissions" href={permissionsUrl}>Permissions</a><li>
            <li><a id="changes" href={changesUrl}>Changes</a><li>
            {{docLinks}}
            <li class="active">
              <a
                id="all-docs"
                href="#/<%- databaseUrl %>"
                class="toggle-view">
                All Documents
              </a>
              <div id="new-all-docs-button" class="add-dropdown"> </div>
             </li>
            <li>
              <a
                id="mango-query"
                href='#/<%- mangoQueryUrl %>'
                class="toggle-view">
                <%- runQueryWithMangoText %>
              </a>
              <div id="mango-query-button" class="add-dropdown"> </div>
            </li>
            <li>
              <a
                id="design-docs"
                href='#/<%- databaseUrl %>?startkey="_design"&endkey="_design0"'
                class="toggle-view">
                All Design Docs
              </a>
              <div id="new-design-docs-button" class="add-dropdown"> </div>
            </li>
          </ul>


        </nav>
      );
    }
  });

  var Views = {
    SidebarController: SidebarController
  };

  return Views;
});
