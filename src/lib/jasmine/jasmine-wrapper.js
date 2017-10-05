require('../babel-register');

import path from 'path';
import Fiber from 'fibers';
import _ from 'underscore';
import {parseBoolean, parseString} from '../environment-variable-parsers';
import escapeRegExp from '../utils/escape-reg-exp';
import fiberizeJasmineApi from './jasmine-fiberized-api';
import screenshotHelper from '../screenshot-helper';
import booleanHelper from '../boolean-helper';

import {SpecReporter} from "jasmine-spec-reporter";

new Fiber(function runJasmineInFiber() {
  const projectDir = process.env.PWD;
  const testsDir = process.env['chimp.path'];
  process.chdir(testsDir);

  const Jasmine = require('jasmine');
  const jasmine = new Jasmine();

  // Capability to add multiple spec filters
  const specFilters = [];
  jasmine.env.specFilter = function shouldRunSpec(spec) {
    return _.every(specFilters, specFilter => specFilter(spec));
  };

  jasmine.jasmine.addSpecFilter = function addSpecFilter(filterFn) {
    specFilters.push(filterFn);
  };

  if (parseBoolean(process.env['chimp.watch'])) {
    // Only run specs with a watch tag in watch mode
    const watchedSpecRegExp = new RegExp(
      parseString(process.env['chimp.watchTags']).split(',').map(escapeRegExp).join('|')
    );
    jasmine.jasmine.addSpecFilter((spec) => watchedSpecRegExp.test(spec.getFullName()));
  }

  fiberizeJasmineApi(global);

  jasmine.loadConfig(getJasmineConfig());

  jasmine.jasmine.getEnv().addReporter(new SpecReporter({
    spec: {
      displayStacktrace: true,
      displaySuccessesSummary: false, // display summary of all successes after execution
      displayFailuresSummary: true,   // display summary of all failures after execution
      displayPendingSummary: true,    // display summary of all pending specs after execution
      displaySuccessfulSpec: true,    // display each successful spec
      displayFailedSpec: true,        // display each failed spec
      displayPendingSpec: true,      // display each pending spec
      displaySpecDuration: true,     // display each spec duration
      displaySuiteNumber: false,      // display each suite number (hierarchical)
    },
    summary: {
      displayErrorMessages: true,
      displayStacktrace: true,
      displaySuccessful: false,
      displayFailed: true,
      displayPending: true,
      displayDuration: true,
    },
    colors: {
      success: 'green',
      failure: 'red',
      pending: 'yellow',
    },
    prefixes: {
      success: '✓ ',
      failure: '✗ ',
      pending: '* ',
    },
    customProcessors: [],
  }));

  jasmine.execute();
}).run();


function getJasmineConfig() {
  const jasmineConfig = JSON.parse(process.env['chimp.jasmineConfig']);

  if (jasmineConfig.specDir) {
    if (!jasmineConfig.spec_dir) {
      jasmineConfig.spec_dir = jasmineConfig.specDir;
    }
    delete jasmineConfig.specDir;
  }

  if (jasmineConfig.specFiles) {
    if (!jasmineConfig.spec_files) {
      jasmineConfig.spec_files = jasmineConfig.specFiles;
    }
    delete jasmineConfig.specFiles;
  }

  if (!jasmineConfig.helpers) {
    jasmineConfig.helpers = [];
  }
  jasmineConfig.helpers.unshift(
    path.relative(jasmineConfig.spec_dir, path.resolve(__dirname, 'jasmine-helpers.js'))
  );

  return jasmineConfig;
}
