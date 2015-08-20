define([
  'api',
  'addons/dataimporter/components.react',
  'addons/dataimporter/stores',
  'addons/dataimporter/actions',
  'testUtils',
  'react'
], function (FauxtonAPI, Components, Stores, Actions, utils, React) {
  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;
  var restore = utils.restore;

  describe('Data Importer -- Stores', function () {
    var spy, container, El, dataImportStore, server;
    var fakeData = ['a', 'b', 'c'];
    var fakeResults = {meta: "meta", data: fakeData};

    beforeEach(function () {
      container = document.createElement('div');
      dataImportStore = Stores.dataImporterStore;
      dataImportStore.init(true);
      dataImportStore.loadData(fakeData);
      server = sinon.fakeServer.create();
    });

    afterEach(function () {
      if (spy) restore(spy);
      React.unmountComponentAtNode(container);
      server.restore();
    });

    it('should load data into a existing target database', function () {
      spy = sinon.spy(dataImportStore, 'loadDataIntoTarget');
      dataImportStore.loadDataIntoDatabase(false, 'some_database');
      assert.ok(spy.calledOnce);
    });

    it('should load data into a new target database', function () {
      spy = sinon.spy(dataImportStore, 'loadIntoNewDB');
      dataImportStore.loadDataIntoDatabase(true, 'some_database');
      assert.ok(spy.calledOnce);
    });

    it('should call successfulImport() to navigate to target database after successful loading', function () {
      spy = sinon.spy(dataImportStore, 'successfulImport');

      dataImportStore.loadingComplete(fakeResults);
      dataImportStore.loadDataIntoDatabase(false, 'some_database');
      server.respondWith('200');
      server.respond();
      assert.ok(spy.calledOnce);
    });

    it('should call importFailed() to navigate to error screen if failure in loading', function () {
      spy = sinon.spy(dataImportStore, 'importFailed');
      dataImportStore.loadingComplete(fakeResults);
      dataImportStore.loadDataIntoDatabase(false, 'some_database');
      server.respondWith("GET", "/api/session", [
          404,
          { "Content-Type": "application/json" },
          '[{"test":"error"}]'
      ]);  //failing response
      server.respond();
      assert.ok(spy.calledOnce);
    });

  });
});
