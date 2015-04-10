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
  'addons/documents/mango/mango.stores',
  'addons/documents/mango/mango.actiontypes',
  'testUtils'
], function (FauxtonAPI, Stores, ActionTypes, testUtils) {
  var assert = testUtils.assert;
  var dispatchToken;
  var store;

  describe('Mango Store', function () {

    describe('getQueryCode', function () {

      beforeEach(function () {
        store = new Stores.MangoStore();
        dispatchToken = FauxtonAPI.dispatcher.register(store.dispatch);
      });

      afterEach(function () {
        FauxtonAPI.dispatcher.unregister(dispatchToken);
      });

      it('returns a default query', function () {
        assert.ok(store.getQueryFindCode());
      });

      it('can set new selectors', function () {
        store.newQueryFindCodeFromFields({fields: ['foo', 'bar']});
        var res = store.getQueryFindCode();
        assert.equal(res, JSON.stringify({
          "selector": {
            "foo": {"$gt": null},
            "bar": {"$gt": null}
          }
        }, null, '  '));
      });

      it('indicates that we set another query for the user', function () {
        assert.notOk(store.getQueryFindCodeChanged());
        store.newQueryFindCodeFromFields({fields: ['mussman', 'zetti']});
        assert.ok(store.getQueryFindCodeChanged());
      });

      it('alters the default query', function () {
        assert.notOk(store.getQueryFindCodeChanged());
        store.newQueryFindCodeFromFields({fields: ['mussman', 'zetti']});
        assert.deepEqual(store.getQueryFindCode(), JSON.stringify({
          "selector": {
            "mussman": {"$gt": null},
            "zetti": {"$gt": null}
          }
        }, null, '  '));
      });

    });
  });
});
