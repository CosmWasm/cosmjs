#!/usr/bin/env node

require("source-map-support").install();
const defaultSpecReporterConfig = require("../../jasmine-spec-reporter.config.json");

// setup Jasmine
const Jasmine = require("jasmine");
const jasmine = new Jasmine();
jasmine.loadConfig({
  spec_dir: "build",
  spec_files: ["**/*.spec.js"],
  helpers: [],
  random: false,
  seed: null,
  stopSpecOnExpectationFailure: false,
});
jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 15 * 1000;

// setup reporter
const { SpecReporter } = require("jasmine-spec-reporter");
const reporter = new SpecReporter({ ...defaultSpecReporterConfig });

// initialize and execute
jasmine.env.clearReporters();
jasmine.addReporter(reporter);
jasmine.execute();
