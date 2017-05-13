#!/usr/bin/env node

require('shelljs/global');
var exec = require('./lib/exec');

var nodeIndex = parseInt(env.CIRCLE_NODE_INDEX, 10);
var isCI = !isNaN(nodeIndex);

var run = function (runOnNodeIndex, name, command) {
  if (!isCI || nodeIndex === runOnNodeIndex) {
    echo(name);
    if (exec(command).code !== 0) {
      exit(1);
    }
  }
};

run(0, 'Running Chimp Cucumber tests', 'node ./bin/chimp.js --path=tests/cucumber');


if (isCI) {
run(1, 'Running Chimp Cucumber specs in Chrome', 'node ./bin/chimp.js --tags=~@cli');
} else {
  run(1, 'Running Chimp Cucumber specs in Chrome', 'node ./bin/chimp.js --tags=~@cli');
}

run(2, 'Running Chimp Cucumber specs in Firefox', 'node ./bin/chimp.js --browser=firefox --tags=~@cli');
run(3, 'Running Chimp Cucumber specs in Phantom', 'node ./bin/chimp.js --browser=phantomjs --tags=~@cli');
