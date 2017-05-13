#!/usr/bin/env node
var Launcher = require('webdriverio').Launcher;
var path = require('path');
var fs   = require('fs');

var args = process.argv.slice(2);
var specs = args.join();
const configPath = path.join(path.dirname(fs.realpathSync(__filename)), '../wdio.conf.js');

const opts = {
  spec: specs
};
const wdio = new Launcher(configPath, opts);

wdio.run().then(function(code) {

}, function(error) {
  console.error("failed", error.stacktrace);
});
