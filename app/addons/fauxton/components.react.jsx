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
  'plugins/zeroclipboard/ZeroClipboard'
],

function (app, FauxtonAPI, React, ZeroClipboard) {

  // super basic right now, but can be expanded later to handle all the varieties of copy-to-clipboards
  // (target content element, custom label, classes, notifications, etc.)
  var Clipboard = React.createClass({
    propTypes: function () {
      return {
        text: React.PropTypes.string.isRequired
      };
    },

    componentWillMount: function () {
      ZeroClipboard.config({ moviePath: app.zeroClipboardPath });
    },

    componentDidMount: function () {
      var el = this.getDOMNode();
      this.clipboard = new ZeroClipboard(el);
    },

    render: function () {
      return (
        <a href="#" ref="copy" data-clipboard-text={this.props.text} data-bypass="true" title="Copy to clipboard">
          <i className="fonticon-clipboard"></i>
        </a>
      );
    }
  });

  // formats a block of code and pretty-prints it in the page. Currently uses the prettyPrint plugin
  var CodeFormat = React.createClass({
    getDefaultProps: function () {
      return {
        lang: "js"
      };
    },

    getClasses: function () {
      // added for forward compatibility. This component defines an api via it's props so you can pass lang="N" and
      // not the class that prettyprint requires for that lang. If (when, hopefully!) we drop prettyprint we won't
      // have any change this component's props API and break things
      var classMap = {
        js: 'lang-js'
      };

      var classNames = 'prettyprint';
      if (_.has(classMap, this.props.lang)) {
        classNames += ' ' + classMap[this.props.lang];
      }
      return classNames;
    },

    componentDidMount: function () {
      // this one function is all the lib offers. It parses the entire page and pretty-prints anything with
      // a .prettyprint class; only executes on an element once
      prettyPrint();
    },

    render: function () {
      var code = JSON.stringify(this.props.code, null, " ");
      return (
        <div><pre className={this.getClasses()}>{code}</pre></div>
      );
    }
  });


  var Tray = React.createClass({

    getInitialState : function () {
      return {
        show: false
      };
    },

    toggle : function (done) {
      if (this.state.show) {
        this.hide(done);
      } else {
        this.show(done);
      }
    },

    componentDidMount : function () {
      var that = this;
      $('body').on('click.Tray-' + this.props.trayid + "-" + this._rootNodeID, function (e) {
        var tgt = $(e.target);
        if (that.state.show && tgt.closest('.tray').length === 0) {
          that.hide();
        }
      });
    },

    componentWillUnmount : function () {
      $('body').off('click.Tray-' + this.props.trayid + "-" + this._rootNodeID);
    },

    show : function (done) {
      this.setState({show: true});
      $(this.refs.myself.getDOMNode()).velocity('transition.slideDownIn', FauxtonAPI.constants.MISC.TRAY_TOGGLE_SPEED, function () {
        if (done) {
          done(true);
        }
      });
    },

    hide : function (done) {
      var that = this;
      $(this.refs.myself.getDOMNode()).velocity('reverse', FauxtonAPI.constants.MISC.TRAY_TOGGLE_SPEED, function () {
        that.setState({show: false});
        if (done) {
          done(false);
        }
      });
    },

    render : function () {
      var styleSpec = this.state.show ? {"display": "block", "opacity": 1} :  {"display": "none", "opacity": 0};
      var classSpec = this.props.className || "";
      classSpec += " tray";
      return (
        <div ref="myself" style={styleSpec} className={classSpec}>{this.props.children}</div>
      );
    }
  });

  var Pagination = React.createClass({

    getInitialState: function () {
      return {};
    },

    getDefaultProps : function () {
      return {
        perPage: FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE,
        page: 1,
        total: 0
      };
    },

    render : function () {
      function getVisiblePages (page, totalPages) {
        var from, to;
        if (totalPages < 10) {
          from = 1;
          to = totalPages + 1;
        } else {
          from = page - 5;
          to = page + 5;
          if (from <= 1) {
            from = 1;
            to = 11;
          }
          if (to > totalPages + 1) {
            from =  totalPages - 9;
            to = totalPages + 1;
          }
        }
        return {
          from: from,
          to: to
        };
      }
      var page = this.state.page || this.props.page;
      var total = this.state.total || this.props.total;
      var perPage = this.props.perPage;
      var prefix = this.props.urlPrefix || "";
      var suffix = this.props.urlSuffix || "";
      var totalPages = total === 0 ? 1 : Math.ceil(total / perPage);
      var visiblePages = getVisiblePages(page, totalPages);
      var rangeItems = [];
      for (var i = visiblePages.from; i < visiblePages.to; i++) {
        rangeItems.push(
          <li className={(page === i ? "active" : null)}><a href={prefix + i + suffix}>{i}</a></li>
        );
      }
      return (
        <ul className="pagination">
          <li className={(page === 1 ? "disabled" : null)}><a href={prefix + Math.max(page - 1, 1) + suffix}>&laquo;</a></li>
          {rangeItems}
          <li className={(page < totalPages ? null : "disabled")}><a href={prefix + Math.min(page + 1, totalPages) + suffix}>&raquo;</a></li>
        </ul>
      );
    }
  });


  return {
    Clipboard: Clipboard,
    CodeFormat: CodeFormat,
    Tray: Tray,
    Pagination: Pagination
  };

});
