const logger = require('tracer');

module.exports = logger.colorConsole({
  format: '{{message}} (in {{file}}:{{line}})',
});
