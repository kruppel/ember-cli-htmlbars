'use strict';

var path = require('path');
var checker = require('ember-cli-version-checker');
var htmlbarsCompile = require('./index');

module.exports = {
  name: 'ember-cli-htmlbars',

  init: function() {
    checker.assertAbove(this, '0.1.2');
  },

  parentRegistry: null,

  shouldSetupRegistryInIncluded: function() {
    return !checker.isAbove(this, '0.2.0');
  },

  setupPreprocessorRegistry: function(type, registry) {
    var self = this;
    var pluginWrappers = this.registry.load('htmlbars-ast-plugin');
    var plugins = pluginWrappers.map(function(wrapper) {
      return wrapper.plugin;
    });

    registry.remove('template', 'broccoli-ember-hbs-template-compiler');

    registry.add('template', {
      name: 'ember-cli-htmlbars',
      ext: 'hbs',
      toTree: function(tree) {
        var options = self.htmlbarsOptions();

        options.plugins = {
          ast: plugins
        };

        return htmlbarsCompile(tree, options);
      }
    })

    if (type === 'parent') {
      this.parentRegistry = registry;
    }
  },

  included: function (app) {
    this._super.included.apply(this, arguments);

    if (this.shouldSetupRegistryInIncluded()) {
      this.setupPreprocessorRegistry('parent', app.registry);
    }
  },

  emberPath: function() {
    return path.join(this.project.root, this.project.bowerDirectory, 'ember');
  },

  htmlbarsOptions: function() {
    var emberVersion = require(this.emberPath() + '/bower.json').version;
    var projectConfig = this.project.config(process.env.EMBER_ENV);
    var htmlbarsEnabled = !/^1\.[0-9]\./.test(emberVersion);

    var htmlbarsOptions;
    if (htmlbarsEnabled) {
      htmlbarsOptions = {
        isHTMLBars: true,
        FEATURES: projectConfig.EmberENV.FEATURES,
        templateCompiler: require(path.join(this.emberPath(), 'ember-template-compiler'))
      };
    }

    return htmlbarsOptions;
  }
}
