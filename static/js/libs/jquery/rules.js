// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview dev_4
 * @author sheny@made-in-china.com
 */

(function () {

    /**
     * 校验日期格式
     */
    $.validator.addMethod('date', function (value, element) {
        return this.optional(element) || !/Invalid|NaN/.test(new Date(value.replace(/-/g, '/')));
    });

    /**
     * 校验邮箱
     */
    $.validator.addMethod('email', function (value, element) {
        // var email = $.trim(value);
        var email = value;

        if (email === "") {
            return true;
        }

        if (!(/^[-\.\w]+@[-\.a-zA-Z0-9]+\.[-\.a-zA-Z0-9]+$/.test(email))) {
            return false;
        }

        var emailPrex = email.split("@")[0];
        var emailAfter = email.split("@")[1];

        if (!(/^.*[A-Za-z0-9]+.*$/.test(emailPrex))) {
            return false;
        }

        if (/(^\..*)|(.*\.$)/.test(emailPrex)) {
            return false;
        }

        if (/(\.){2,}/.test(emailPrex)) {
            return false;
        }

        var splitIndex = emailAfter.lastIndexOf(".");
        var splitPrex = emailAfter.substr(0, splitIndex);
        var splitAfter = emailAfter.substr(splitIndex + 1);
        if (/(^[\.-].*)|(.*[\.-]$)/.test(splitPrex)) {
            return false;
        }
        if (/(\.){2,}/.test(splitPrex)) {
            return false;
        }

        if (!(/^[a-zA-Z]+$/.test(splitAfter))) {
            return false;
        }

        return true;
    });

    /**
     * 校验是否为正确的url
     */
    $.validator.addMethod('url', function (value, element) {
        value = $.trim(value);
        return this.optional(element) || /^((?:https?):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
    });

    /**
     * 校验电话号码国家码
     */
    $.validator.addMethod('telCountryNum', function (value, element) {
        value = $.trim(value);
        return this.optional(element) || /^\d+$/.test(value);
    });

    /**
     * 校验电话号码地区码
     */
    $.validator.addMethod('telAreaNum', function (value, element) {
        value = $.trim(value);
        return this.optional(element) || /^\d+$/.test(value);
    });

    /**
     * 校验电话号码
     */
    $.validator.addMethod('telNum', function (value, element) {
        value = $.trim(value);
        return !value || /^[\d\s\-]*$/.test(value);
    });

    /**
     * 电话号码全格式
     */
    $.validator.addMethod('singleTelNum', function (value, element) {
        value = $.trim(value);
        return !value || /^[a-zA-Z0-9\+\(\)\-]{1,20}$/.test(value);
    });

    /**
     * 只能填写英文包含特殊符号
     */
    $.validator.addMethod('enOnly', function (value, element, param) {
        return !/[^\x00-\xff\u0000-\u00ff\u0021-\u002c\u002e\u002f\u003a-\u0040\u0043\u0046\u005b-\u0060\u007b-\u007d\u00a1-\u00ac\u00ae-\u0113\u0116-\u0122\u0124-\u012b\u012e-\u014d\u0150-\u017e\u0192\u01b5\u01f5\u0237\u02c6\u02c7\u02d8-\u02dd\u0311\u0391-\u03a1\u03a3-\u03a9\u03b1-\u03c9\u03d1\u03d2\u03d5\u03d6\u03dc\u03dd\u03f0\u03f1\u03f5\u03f6\u0401-\u040c\u040e-\u044f\u0451-\u045c\u045e\u045f\u2010\u2013-\u2016\u2018-\u201a\u201c-\u201e\u2020-\u2022\u2025\u2026\u2030-\u2035\u2039\u203a\u203e\u2041\u2043\u2044\u20ac\u20db\u20dc\u2102\u2105\u210a-\u2113\u2115-\u211e\u2122\u2124\u2127-\u2129\u212c\u212d\u212f-\u2131\u2133-\u2138\u2153-\u215e\u2190-\u219b\u219d-\u21a7\u21a9-\u21ae\u21b0-\u21b3\u21b5-\u21b7\u21ba-\u21db\u21dd\u21e4\u21e5\u2200-\u2205\u2207-\u2209\u220b\u220c\u220f-\u2214\u2216-\u2218\u221a\u221d-\u2238\u223a-\u2257\u2259\u225a\u225c\u225f-\u2262\u2264-\u228b\u228d-\u229b\u229d-\u22a5\u22a7-\u22b0\u22b2-\u22bb\u22bd-\u22db\u22de-\u22e3\u22e6-\u22f1\u2305\u2306\u2308-\u2310\u2312\u2313\u2315\u2316\u231c-\u231f\u2322\u2323\u232d\u232e\u2336\u233d\u233f\u2423\u24c8\u2500\u2502\u250c\u2510\u2514\u2518\u251c\u2524\u252c\u2534\u253c\u2550-\u256c\u2580\u2584\u2588\u2591-\u2593\u25aa\u25ab\u25ad\u25ae\u25b1\u25b3-\u25b5\u25b8\u25b9\u25bd-\u25bf\u25c2\u25c3\u25ca\u25cb\u25ec\u25ef\u2605\u2606\u260e\u2640\u2642\u2660\u2663\u2665\u2666\u266a\u266d-\u266f\u2713\u2717\u2720\u2736\u2758\u2772\u2773\u2935\u2985\u2986\u29bf\u2a00-\u2a02\u2a04\u2a06\u2a0c\u2a0d\u2a10-\u2a17\u2a22-\u2a27\u2a29\u2a2a\u2a2d-\u2a31\u2a33-\u2a3c\u2a3f\u2a40\u2a42-\u2a4d\u2a50\u2a53-\u2a58\u2a5a-\u2a5d\u2a5f\u2a66\u2a6a\u2a6d-\u2a75\u2a77-\u2a9a\u2a9d-\u2aa2\u2aa4-\u2ab0\u2ab3-\u2ac8\u2acb\u2acc\u2acf-\u2adb\u2ae4\u2ae6-\u2ae9\u2aeb-\u2af3\u2afd\ufb00-\ufb04]/.test(value);
    });

    /**
     * 只能填写英文 不包含特殊符号
     * exclude special
     */
    $.validator.addMethod('enOnlyES', function (value, element, param) {
        return !/[^\x00-\xff]/.test(value);
    });

    /**
     * 所有字段值不一样
     * 含有 ignore 的元素不参与different匹配
     * @depends diff-group attribute
     */
    $.validator.addMethod('different', function(value, element, param) {
        if (!$(element).attr('diff-group')) {
            window.console && console.warn('different valid Error:'+ element.name + ' need diff-group attribute.');
            return true;
        }
        var $form = $(element).parents('form'),
            validator = $form.data('validator');
        if ($form.length === 0) return true;
        var items = $form.find('[diff-group='+ $(element).attr('diff-group') +']');

        if (!$(element).data('different')) {
            // to find all of this name items
            var valid = {},
                validValue;

            // filter the same value item
            items.each(function(index, item) {
                validValue = $.trim(item.value);
                if (validValue) {
                    validValue = validValue.toLowerCase();
                }
                // ignore items
                if (!$(item).hasClass('ignore')) {
                    if (validValue) {
                        if (valid[validValue]) {
                            valid[validValue].push(index);
                        } else {
                            valid[validValue] = [index];
                        }
                    }
                    $(item).data('different', {
                        valid: true
                    });
                }
            });

            // modify default true 2 false
            for (var val in valid) {
                if (valid[val].length > 1) {
                    items.map(function(index, item) {
                        $(item).data('different').valid = false;
                        if (item.value) {
                            validator.showError(item);
                        }
                    });
                    break;
                }
            }
        }

        var data = $(element).data('different');
        var result = data.valid;
        items.data('different', '');
        return result;
    });

    /**
     * 群组校验是否填写en
     * 有一个不正确，所有输入框全部error
     */
    $.validator.addMethod('enOnlyGroup', function(value, element) {
        var $items = $('input[name='+ element.name +']');
        var valid = true,
            $form = $(element).parents('form'),
            validator = $form.data('validator'),
            item;

        for (var i = 0; i < $items.length; i++) {
            item = $items[i];
            if ($.trim(item.value) && !$.validator.methods.enOnly(item.value, item)) {
                valid = false;
                break;
            }
        }

        if (!valid) {
            $items.each(function(index, elem) {
                validator.showError(elem);
            });
        }

        return valid;
    });

    /**
     *  输入框至少有一个是有值的
     */
    $.validator.addMethod('leastOne', function(value, element) {
        var $items = $('input[name='+ element.name +']');
        var valid = false,
            $form = $(element).parents('form'),
            validator = $form.data('validator'),
            item;

        for (var i = 0; i < $items.length; i++) {
            item = $items[i];
            if ($.trim(item.value)) {
                valid = true;
                break;
            }
        }

        if (valid) {
            $items.each(function(index, elem) {
                if (elem !== element) {
                    validator.hideError(elem);
                }
            });
        }

        return valid;
    });

    /**
     * 浮点数精度校验
     */
    $.validator.addMethod('floatPrecision', function (value, element, param) {
        var precision = $(element).attr('valid-precision');

        if (!precision || value.indexOf('.') === -1) {
            return true;
        }

        precision = parseInt(precision);

        if (!isNaN(precision)) {
            var result = /\.(.*)$/.exec(value);
            return (result && result.length > 1 && result[1].length <= precision);
        }
        return true;
    });

    function compareSize(a, b, type) {
        if (isNaN(a) || isNaN(b) || !type) {
            return true;
        }

        return new Function('return ' + a + type + b)();
    }

    /**
     * 填写数值大于某个值
     */
    $.validator.addMethod('moreThan', function (value, element) {
        return compareSize(parseFloat(value), $(element).attr('valid-compare-more'), '>');
    });

    /**
     * 填写的数值大于等于某个值
     */
    $.validator.addMethod('moreEqual', function (value, element) {
        return compareSize(parseFloat(value), $(element).attr('valid-compare-more'), '>=');
    });

    /**
     * 填写的数值小于某个值
     */
    $.validator.addMethod('lessThan', function (value, element, param) {
        return compareSize(parseFloat(value), $(element).attr('valid-compare-less'), '<');
    });

    /**
     * 填写的数值小于等于某个值
     */
    $.validator.addMethod('lessEqual', function (value, element, param) {
        return compareSize(parseFloat(value), $(element).attr('valid-compare-less'), '<=');
    });

}());
