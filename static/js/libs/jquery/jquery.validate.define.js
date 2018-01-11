// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview dev_4
 * @author oneroundseven@gmail.com
 */
/**
 * Modify log
 * 2017-04-17 add assign-rule attribute: support same name with different rule
 * 2017-10-13 validate add validSpecifyElements method validate specify elements
 */

(function(validator, win) {
    var __validator = $.fn.validate;
    var __rules = {};
    var toString = Object.prototype.toString;

    function ruleCheckMerge(result, ruleName, options) {
        var itemName, rules;
        if (typeof ruleName === 'string') {
            if (!__rules[ruleName]) {
                throw 'ValidatorError: rule ' + ruleName + ' is not defined';
            }
            rules = __rules[ruleName];
            for (itemName in rules) {
                if (options && options.debug && result[itemName]) {
                    window.console && console.warn('ValidatorError: rule ' + itemName + ' is repeat defined in rules, it will be meger toggle.');
                    result[itemName] = $.extend(true, {}, result[itemName], rules[itemName]);
                } else {
                    result[itemName] = rules[itemName];
                }
            }
            itemName = rules = null;
        }
        if (toString.call(ruleName) === '[object Array]') {
            for (var i = 0; i < ruleName.length; i++) {
                ruleCheckMerge(result, ruleName[i], options);
            }
        }
    }

    $.extend($.fn, {
        validate: function(name, options, lan) {
            try {
                var validator = this.data("validator"),
                    merge = {},
                    opts, messages, rules, ruleName, itemName, rule;

                // support old validate
                if (toString.call(name) === '[object Object]' || !name) {
                    return __validator.call(this, name);
                }

                name = name || (validator && validator.name);
                if (typeof name !== 'string' && toString.call(name) !== '[object Array]') {
                    throw 'ValidatorError: rule name must be String or Array';
                }

                ruleCheckMerge(merge, name, options);
                opts = $.extend(true, {}, options, {rules: this.transLan(merge, lan)});
                messages = opts.messages || {};

                for (itemName in opts.rules) {
                    rules = opts.rules[itemName];
                    for (ruleName in rules) {
                        rule = rules[ruleName];

                        if (toString.call(rule) !== "[object Object]") {
                            if (typeof rule === "string") {
                                rules[ruleName] = rule = {
                                    param: true,
                                    message: rule
                                };
                            } else {
                                rules[ruleName] = rule = {
                                    rule: rule,
                                    param: true
                                };
                            }
                        }
                        if (rule.message) {
                            messages[itemName] = messages[itemName] || {};
                            messages[itemName][ruleName] = messages[itemName][ruleName] || rule.message;
                        }
                    }
                }
                opts.messages = messages;
                validator = __validator.call(this, opts);
                validator.name = name;
                return validator;
            } catch (err) {
                if (win && win.console) {
                    win.console.log(err);
                }
            }
        },
        transLan: function(rules, lan) {
            var _lan = 0,
                itemName, ruleName, rule, message;

            if (lan === 'zh-CN') {
                _lan = 1;
            }

            if (typeof lan === 'undefined' && typeof SILK !== 'undefined' && SILK.lang) {
                if (SILK.lang === 'zh-CN') {
                    _lan = 1;
                }
            }

            for (itemName in rules) {
                for (ruleName in rules[itemName]) {
                    rule = rules[itemName][ruleName];
                    if (toString.call(rule) === '[object Array]') {
                        rules[itemName][ruleName] = { message: rule[_lan] };
                    } else {
                        message = rule['message'];
                        if (message && toString.call(message) === '[object Array]') {
                            rule['message'] = message[_lan];
                        }
                    }
                }
            }

            itemName = ruleName = rule = message = null;
            return rules;
        }
    });

    $.extend(true, $.validator, {
        define: function(name, rules) {
            if (name && rules) {
                __rules[name] = rules;
            }
        },
        staticRules: function(element) {
            var rules = {};
            var validator = $.data(element.form, 'validator');
            if (validator.settings.rules) {
                rules = $.validator.normalizeRule(validator.settings.rules[($(element).attr('assign-rule') || element.name)]) || {};
            }
            return rules;
        },
        defaults: {
            // fixed not submit required not valid bug
            onfocusout: function(element, event) {
                if ( !this.checkable(element) ) {
                    this.element(element);
                }
            }
        },
        prototype: {
            defaultMessage: function(element, method, rule) {
                return this.findDefined(
                    rule && rule.parameters && rule.parameters.message,
                    this.customMessage(($(element).attr('assign-rule') || element.name), method),
                    this.customDataMessage(element, method),
                    this.customMetaMessage(element, method),
                    // title is never undefined, so handle empty string as undefined
                    !this.settings.ignoreTitle && element.title || undefined,
                    $.validator.messages[method],
                    "<strong>Warning: No message defined for " + element.name + "</strong>"
                );
            },

            formatAndAdd: function(element, rule) {
                var message = this.defaultMessage(element, rule.method, rule),
                    theregex = /\$?\{(\d+)\}/g;
                if (typeof message === "function") {
                    message = message.call(this, rule.parameters, element);
                } else if (theregex.test(message)) {
                    message = $.validator.format(message.replace(theregex, '{$1}'), rule.parameters);
                }
                this.errorList.push({
                    message: message,
                    element: element
                });

                this.errorMap[($(element).attr('assign-rule') || element.name)] = message;
                this.submitted[($(element).attr('assign-rule') || element.name)] = message;
            },
            check: function(element) {
                element = this.validationTargetFor(this.clean(element));

                var rules = $(element).rules();
                var dependencyMismatch = false;
                var val = this.elementValue(element);
                var result;

                for (var method in rules) {
                    var rule = { method: method, parameters: rules[method] };
                    try {

                        var ruleChecker = $.validator.methods[method];

                        if (rule.parameters && rule.parameters.rule) {
                            var rtype = Object.prototype.toString.call(rule.parameters.rule);
                            switch (rtype) {
                                case "[object RegExp]":
                                    ruleChecker = function(val) {
                                        return rule.parameters.rule.test(val);
                                    };
                                    break;
                                case "[object Function]":
                                    ruleChecker = rule.parameters.rule;;
                                    break;
                            }
                        }

                        result = ruleChecker.call(this, val, element, rule.parameters);

                        // if a method indicates that the field is optional and therefore valid,
                        // don't mark it as valid when there are no other rules
                        if (result === "dependency-mismatch") {
                            dependencyMismatch = true;
                            continue;
                        }
                        dependencyMismatch = false;

                        if (result === "pending") {
                            this.toHide = this.toHide.not(this.errorsFor(element));
                            return;
                        }

                        if (!result) {
                            this.formatAndAdd(element, rule);
                            return false;
                        }
                    } catch (e) {
                        if (this.settings.debug && window.console) {
                            console.log("exception occured when checking element " + element.id + ", check the '" + rule.method + "' method", e);
                        }
                        throw e;
                    }
                }
                if (dependencyMismatch) {
                    return;
                }
                if (this.objectLength(rules)) {
                    this.successList.push(element);
                }
                return true;
            },
            showError: function(element) {
                this.settings.highlight.call( this, element, this.settings.highlightErrorClass, this.settings.highlightValidClass );
                this.errorsFor(element).show();
            },
            hideError: function(element) {
                this.settings.unhighlight.call( this, element, this.settings.highlightErrorClass, this.settings.highlightValidClass );
                this.errorsFor(element).hide();
            },
            validSpecifyElements: function(specifyWrap) {
                this.prepareForm();

                for ( var i = 0, elements = this.specifyElements(specifyWrap); elements[i]; i++ ) {
                    this.check( elements[i] );
                }
                return this.valid();
            },
            specifyElements: function(specifyWrap) {
                var validator = this,
                    rulesCache = {};

                // select all valid inputs inside the form (no submit or reset buttons)
                return $(specifyWrap)
                    .find("input, select, textarea")
                    .not(":submit, :reset, :image, [disabled]")
                    .not( this.settings.ignore )
                    .filter(function() {
                        if ( !this.name && validator.settings.debug && window.console ) {
                            console.error( "%o has no name assigned", this);
                        }

                        // select only the first element for each name, and only those with rules specified
                        if ( /*this.name in rulesCache ||*/ !validator.objectLength($(this).rules()) ) {
                            return false;
                        }

                        rulesCache[this.name] = true;
                        return true;
                    });
            }
        }
    });

}($.validator, window));