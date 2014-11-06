var util = require('util'),
    events = require('events'),
    helpers = require('../helpers/helpers.js');

function CreateDatabase () {
  events.EventEmitter.call(this);
}

// inherit from node's event emitter
util.inherits(CreateDatabase, events.EventEmitter);

CreateDatabase.prototype.command = function (databaseName) {
  var self = this,
      nano = helpers.getNanoInstance();

  nano.db.create(databaseName, function (err, body, header) {
    if (err) {
      console.log('Error in nano CreateDatabase Function: '+ databaseName, err.message);
      throw err;
    }
    console.log('nano created a database ' + databaseName + body);
    // emit the complete event
    self.emit('complete');
  });

  return this;
};

module.exports = CreateDatabase;
