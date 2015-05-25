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
  'addons/documents/sidebar/stores',
  'addons/documents/sidebar/actiontypes',
  'testUtils'
], function (FauxtonAPI, Stores, ActionTypes, testUtils) {
  var assert = testUtils.assert;
  var dispatchToken;
  var store;
  var opts;

  describe('Index Results Store', function () {
    beforeEach(function () {
      store = new Stores.SidebarStore();
      dispatchToken = FauxtonAPI.dispatcher.register(store.dispatch);
    });

    afterEach(function () {
      FauxtonAPI.dispatcher.unregister(dispatchToken);
    });
  });
});
