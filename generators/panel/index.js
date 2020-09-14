'use strict';

var yeoman = require('yeoman-generator');
var extend = require('deep-extend');
var _ = require('lodash');

module.exports = yeoman.Base.extend({
    initializing: function() {
        this.props = {};
    },

    prompting: {
        // Begin by asking for just the panel name.
        // This will be used to supply the default panel title.
        askForPanelName: function() {
            var done = this.async();

            var prompts = [{
                type: 'input',
                name: 'name',
                message: 'Your panel\'s name',
                filter: _.kebabCase
            }];

            this.prompt(prompts, function(props) {
                this.props = extend(this.props, props);
                done();
            }.bind(this));
        },

        askFor: function() {
            var done = this.async();

            var prompts = [{
                type: 'input',
                name: 'title',
                message: 'Your panel\'s title',
                default: _.startCase(this.props.name)
            }, {
                type: 'input',
                name: 'width',
                message: 'How many width units (1-8) should your panel be?',
                default: 2,
                filter: function(input) {
                    return parseInt(input, 10);
                },
                validate: function(input) {
                    return input > 0 && input <= 8;
                }
            }, {
                type: 'confirm',
                name: 'dialog',
                message: 'Is this panel a pop-up dialog?',
                default: false
            }, {
                type: 'input',
                name: 'headerColor',
                message: 'What hex color would you like your panel\'s header to be?',
                default: '#9f9bbd',
                when: function(answers) {
                    return !answers.dialog;
                }
            }, {
                type: 'confirm',
                name: 'dialogConfirmBtn',
                message: 'Should this dialog have a "confirm" button?',
                default: true,
                when: function(answers) {
                    return answers.dialog;
                }
            }, {
                type: 'input',
                name: 'dialogConfirmBtnLabel',
                message: 'What should the "confirm" button\'s label be?',
                default: 'Confirm',
                when: function(answers) {
                    return answers.dialogConfirmBtn;
                }
            }, {
                type: 'confirm',
                name: 'dialogDismissBtn',
                message: 'Should this dialog have a "dismiss" button?',
                default: true,
                when: function(answers) {
                    return answers.dialog;
                }
            }, {
                type: 'input',
                name: 'dialogDismissBtnLabel',
                message: 'What should the "dismiss" button\'s label be?',
                default: 'Dismiss',
                when: function(answers) {
                    return answers.dialogDismissBtn;
                }
            }];

            this.prompt(prompts, function(props) {
                this.props = extend(this.props, props);
                done();
            }.bind(this));
        }
    },

    writing: function() {
        var html = this.fs.read(this.templatePath('panel.html'));
        var panelFilePath = this.destinationPath('dashboard/' + this.props.name + '.html');
        if (!this.fs.exists(panelFilePath)) {
            this.fs.write(panelFilePath, html);
        }

        var panelProps = {
            name: this.props.name,
            title: this.props.title,
            width: this.props.width,
            file: this.props.name + '.html'
        };

        if (this.props.dialog) {
            panelProps.dialog = this.props.dialog;

            if (this.props.dialogConfirmBtn) {
                panelProps.dialogButtons = panelProps.dialogButtons || [];
                panelProps.dialogButtons.push({
                    name: this.props.dialogConfirmBtnLabel,
                    type: 'confirm'
                });
            }

            if (this.props.dialogDismissBtn) {
                panelProps.dialogButtons = panelProps.dialogButtons || [];
                panelProps.dialogButtons.push({
                    name: this.props.dialogDismissBtnLabel,
                    type: 'dismiss'
                });
            }
        } else {
            panelProps.headerColor = this.props.headerColor;
        }

        // Re-read the content at this point because a composed generator might modify it.
        var currentPkg = this.fs.readJSON(this.destinationPath('package.json'), {});
        currentPkg.nodecg = currentPkg.nodecg || {};
        currentPkg.nodecg.dashboardPanels = currentPkg.nodecg.dashboardPanels || [];
        currentPkg.nodecg.dashboardPanels.push(panelProps);

        // Let's extend package.json so we're not overwriting user previous fields
        this.fs.writeJSON(this.destinationPath('package.json'), currentPkg);
    }
});