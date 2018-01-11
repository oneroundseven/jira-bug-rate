// Copyright 2017 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview dev_4
 * @author oneroundseven@gmail.com
 */

$.extend(true, $.validator, {
    defaults: {
        //successIcon: false,

        errorWrap: false,
        //errorWrapPlacement: function($wrap, $elem){},
        errorWrapElement: '<div class="feedback-block"></div>',
        ignore: ":disabled",
        onkeyup: false,
        onfocus: false,
        highlightErrorClass: 'hlt-error',
        highlightValidClass: 'hlt-valid',
        showErrors: function(map, list){
            var _this = this;
            var form = this.currentForm;

            var probeType = "FE";

            if(typeof(window.SILK) === "undefined" && SILK.PROBE_TYPE){
                probeType = SILK.PROBE_TYPE.formType;
            }

            var EN = [];
            var EM = [];

            $.each(list, function(i, item){
                _this.errorsFor(item.element).html(item.message);

                if(item.element.value){
                    EN.push(item.element.name);
                    EM.push(item.message);
                }
            });

            if(list && list.length > 0 && typeof(Probe) !== "undefined" && form.name && EN.length > 0){
                new Probe().post({
                    URL: window.location.href,
                    FN: form.name,
                    EN: EN.join("@@"),
                    EM: EM.join("@@"),
                    type: "crov"
                }, probeType);
            }
            
            this.defaultShowErrors();
        },
        /*highlight: false,
        unhighlight:false, */
        /*success: function (label, elem) {
            if (!this.successIcon) return;
            if (elem.icon) return;

            var icon = $('<i class="icon feedback-suc">&#xf00c;</i>');
            $(elem).after(icon);
            elem.icon = icon;
        }, */
        highlight: function (element, errorClass, validClass) {
            if (element.type === 'select-one') {
                $(element).prev().addClass(errorClass).removeClass(validClass);
            } else if (element.type === 'radio') {
                this.findByName(element.name).addClass(errorClass).removeClass(validClass);
            } else {
                $(element).addClass(errorClass).removeClass(validClass);
            }
        },
        unhighlight: function (element, errorClass, validClass) {
            if (element.type === 'select-one') {
                $(element).prev().removeClass(errorClass).addClass(validClass);
            } else if (element.type === 'radio') {
                this.findByName(element.name).removeClass(errorClass).addClass(validClass);
            } else {
                $(element).removeClass(errorClass).addClass(validClass);
            }
        }
    },
    'prototype': {
        elements: function() {
            var validator = this,
                rulesCache = {};

            // select all valid inputs inside the form (no submit or reset buttons)
            return $(this.currentForm)
                .find("input, select, textarea")
                .not(":submit, :reset, :image, [disabled]")
                .not( this.settings.ignore )
                .filter(function() {
                    if ( !this.name && validator.settings.debug && window.console ) {
                        console.error( "%o has no name assigned", this);
                    }

                    // select only the first element for each name, and only those with rules specified
                    if (/* this.name in rulesCache || */!validator.objectLength($(this).rules()) ) {
                        return false;
                    }

                    rulesCache[this.name] = true;
                    return true;
                });
        },
        element: function( element ) {
            element = this.validationTargetFor( this.clean( element ) );
            var $element = $(element).not(":submit, :reset, :image, [disabled]")
                .not( this.settings.ignore );

            if(!$element.length){
                return true;
            }

            element = $element[0];

            this.lastElement = element;
            this.prepareElement( element );
            this.currentElements = $(element);
            var result = this.check( element ) !== false;

            if (result) {
                delete this.invalid[element.name];
            } else {
                this.invalid[element.name] = true;
            }
            if ( !this.numberOfInvalids() ) {
                // Hide error containers on last error
                this.toHide = this.toHide.add( this.containers );
            }
            this.showErrors();
            return result;
        },
        errorWrapsFor: function(element){
            var name = this.idOrName(element);
            return $(element).parents('form:first').find('[wrapfor="' + name + '"]');
        },
        showLabel: function(element, message) {
            var label = this.errorsFor( element );
            if ( label.length ) {
                // refresh error/success class
                label.removeClass( this.settings.validClass ).addClass( this.settings.errorClass );

                // check if we have a generated label, replace the message then
                if ( label.attr("generated") ) {
                    label.html(message);
                }
            } else {
                // create label
                label = $("<" + this.settings.errorElement + "/>")
                    .attr({"for":  this.idOrName(element), generated: true})
                    .addClass(this.settings.errorClass)
                    .html(message || "");
                if ( this.settings.wrapper ) {
                    // make sure the element is visible, even in IE
                    // actually showing the wrapped element is handled elsewhere
                    label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
                }
                if ( !this.labelContainer.append(label).length ) {
                    if ( this.settings.errorPlacement ) {
                        this.settings.errorPlacement(label, $(element) );
                    } else if(this.settings.errorWrap){
                        var $wrap;

                        $wrap = this.errorWrapsFor(element);

                        if(!$wrap.length){
                            $wrap = $(typeof this.settings.errorWrap === 'string' ? this.settings.errorWrap : this.settings.errorWrapElement).attr({
                                'wrapfor': this.idOrName(element)
                            });

                            if(this.settings.errorWrapPlacement){
                                this.settings.errorWrapPlacement($wrap, $(element));
                            }else{
                                $(element).after($wrap);
                            }

                        }

                        $wrap.append(label);
                    }else {
                        label.insertAfter(element);
                    }
                }
            }
            if ( !message && this.settings.success ) {
                label.text("");
                if ( typeof this.settings.success === "string" ) {
                    label.addClass( this.settings.success );
                } else {
                    this.settings.success( label, element );
                }
            }
            this.toShow = this.toShow.add(label);
        },
        getLength: function(value, element) {
            switch( element.nodeName.toLowerCase() ) {
                case 'select':
                    return $("option:selected", element).length;
                case 'input':
                    if( this.checkable( element) ) {
                        return this.findByName(element.name).filter(':checked').length;
                    }
                case 'textarea': value = value.replace(/\n/g, '**'); break;
            }

            return value.replace(/[^\x00-\xff]/g, '*').length;
        }
    },
    methods: {

    }
});

// 静态提示
$.fn.staticTip = function(){
    this.each(function(i, elem){
        if((/input/i.test(elem.tagName) && /text|password|hidden/i.test(elem.type)) || (/textarea/i.test(elem.tagName))){
            $(elem).blur(function(){
                var tipText = elem.getAttribute('static-tip');

                var idOrName = elem.name || elem.id;
                var $tip = $('[tip4=' + idOrName + ']');

                if($(elem).valid()){
                    if(tipText && !/true|false/i.test(tipText)){
                        $tip.html(tipText);
                    }

                    $tip.show();
                }else{
                    $tip.hide();
                }
            });
        }
    });
};

$(function(){
    $('input[static-tip],textarea[static-tip]').each(function(){
        $(this).staticTip();
    });
});