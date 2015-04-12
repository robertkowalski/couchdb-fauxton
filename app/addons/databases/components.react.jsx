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
  'addons/fauxton/components.react',
  'addons/databases/stores',
  'addons/databases/resources',
  'addons/databases/actions',
  'helpers'
], function (app, FauxtonAPI, React, ComponentsReact, Stores, Resources, Actions, Helpers) {

  var databasesStore = Stores.databasesStore;

  var DatabasesController = React.createClass({

    getStoreState: function () {
      return {
        collection: databasesStore.getCollection()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    render: function () {
      return (
        <DatabaseTable body={this.state.collection} />
      );
    }
  });

  var DatabaseTable = React.createClass({

    createRows: function () {
      return _.map(this.props.body, function (item, iteration) {
        return (
          <DatabaseRow row={item} />
        );
      });
    },

    render: function () {
      var rows = this.createRows();
      return (
        <div className="view">
          <table className="databases table table-striped">
            <thead>
              <th>Name</th>
              <th>Size</th>
              <th># of Docs</th>
              <th>Update Seq</th>
              <th>Actions</th>
            </thead>
            <tbody>
            {rows}
            </tbody>
          </table>
        </div>
      );
    }
  });

  var DatabaseRow = React.createClass({

    renderGraveyard : function (row) {
      if (row.status.isGraveYard()) {
        return (
          <GraveyardInfo row={row} />
        );
      } else {
        return null;
      }
    },

    render: function () {
      var row = this.props.row;
      var name = row.get("name");
      var encoded = app.utils.safeURLName(name);
      var size = Helpers.formatSize(row.status.dataSize());
      return (
        <tr>
          <td>
            <a href={"#/database/"+encoded+"/_all_docs"}>{name}</a>
          </td>
          <td>{size}</td>
          <td>{row.status.numDocs()} {this.renderGraveyard(row)}</td>
          <td>{row.status.updateSeq()}</td>
          <td>
            <a className="db-actions btn fonticon-replicate set-replication-start" title={"Replicate "+name} href={"#/replication/"+encoded}></a>&#160;
            <a className="db-actions btn icon-lock set-permissions" title={"Set permissions for "+name} href={"#/database/"+encoded+"/permissions"}></a>
          </td>
        </tr>
      );
    }
  });

  var GraveyardInfo = React.createClass({

    componentDidMount : function () {
      $(this.refs.myself.getDOMNode()).tooltip();
    },

    render : function () {
      var row = this.props.row;
      return (
        <i className="js-db-graveyard icon icon-exclamation-sign" ref="myself" title={"This database has just " + row.status.numDocs() + " docs and " + row.status.numDeletedDocs() + " deleted docs"}></i>
      );
    }
  });

  var RightDatabasesHeader = React.createClass({

    render : function () {
      return (
        <div className="header-right">
          <AddDatabaseWidget />
          <JumpToDatabaseWidget />
        </div>
      );
    }
  });

  var AddDatabaseWidget = React.createClass({

    onTrayToggle : function () {
      var that = this;
      this.refs.newDbTray.toggle(function (shown) {
        if (shown) {
          that.refs.newDbName.getDOMNode().focus();
        }
      });
    },

    onKeyUpInInput : function (e) {
      if (e.which === 13) {
        this.onAddDatabase();
      }
    },

    onAddDatabase : function () {
      var databaseName = $(this.refs.newDbName.getDOMNode()).val();
      Actions.createNewDatabase(databaseName, this.refs.newDbTray.hide, FauxtonAPI.addNotification);
    },

    render : function () {

      return (
        <div className="button" id="add-db-button">
          <a id="add-new-database" className="add-new-database-btn" href="#" onClick={this.onTrayToggle}><i className="header-icon fonticon-new-database"></i> Add New Database</a>
          <ComponentsReact.Tray trayid="new-database-tray" ref="newDbTray" className="new-database-tray">
            <span className="add-on">Add New Database</span>
            <input id="js-new-database-name" type="text" onKeyUp={this.onKeyUpInInput} ref="newDbName" className="input-xxlarge" placeholder="Name of database" />
            <a className="btn" id="js-create-database" onClick={this.onAddDatabase}>Create</a>
          </ComponentsReact.Tray>
        </div>
      );
    }
  });

  var JumpToDatabaseWidget = React.createClass({

    componentDidMount : function () {
      var that = this;
      $(this.refs.searchDbName.getDOMNode()).typeahead({
        source : databasesStore.getDatabaseNames(),
        updater: function (item) {
          that.jumpToDb(item);
        }
      });
      // turn of browser autocomplete
      $(this.refs.searchDbName.getDOMNode()).attr("autocomplete", "off");
    },

    jumpToDb : function (dbname) {
      dbname = dbname || $(this.refs.searchDbName.getDOMNode()).val();
      dbname = dbname === null ? null : dbname.trim();
      if (dbname === null || dbname.length === 0) {
        return;
      }
      if (databasesStore.getDatabaseNames().indexOf(dbname) >= 0) {
        var url = FauxtonAPI.urls('allDocs', 'app', app.utils.safeURLName(dbname));
        FauxtonAPI.navigate(url);
      } else {
        FauxtonAPI.addNotification({
          msg: 'Database does not exist.',
          type: 'error'
        });
      }
    },

    jumpToDbHandler : function () {
      this.jumpToDb();
      return false;
    },

    render : function () {
      return (
        <div className="searchbox-wrapper">
          <div id="header-search" className="js-search searchbox-container">
            <form onSubmit={this.jumpToDbHandler} id="jump-to-db" className="navbar-form pull-right database-search">
              <div className="input-append">
                <input type="text" className="search-autocomplete" ref="searchDbName" name="search-query" placeholder="Database name" />
                <button className="btn btn-primary" type="submit"><i className="icon icon-search"></i></button>
              </div>
            </form>
          </div>
        </div>
      );
    }
  });

  var DatabasePagination = React.createClass({

    render : function () {
      var page = this.props.page;
      var total = this.props.total || databasesStore.getDatabaseNames().length;
      return (
        <footer className="all-db-footer pagination-footer">
          <div id="database-pagination">
            <ComponentsReact.Pagination page={page} total={total} urlPrefix="#/_all_dbs?page=" />
          </div>
        </footer>
      );
    }
  });

  return {
    renderDatabases: function (el) {
      React.render(<DatabasesController />, el);
    },
    removeDatabases: function (el) {
      React.unmountComponentAtNode(el);
    },

    renderDatabasesHeader: function (el) {
      React.render(<RightDatabasesHeader />, el);
    },
    removeDatabasesHeader: function (el) {
      React.unmountComponentAtNode(el);
    },

    renderDatabasePagination: function (el, page, total) {
      React.render(<DatabasePagination page={page} total={total} />, el);
    },
    removeDatabasePagination: function (el) {
      React.unmountComponentAtNode(el);
    },

    DatabasesController: DatabasesController,
    DatabaseTable: DatabaseTable,
    DatabaseRow: DatabaseRow,
    RightDatabasesHeader: RightDatabasesHeader,
    GraveyardInfo: GraveyardInfo,
    AddDatabaseWidget: AddDatabaseWidget,
    JumpToDatabaseWidget: JumpToDatabaseWidget,
    DatabasePagination: DatabasePagination
  };
});
