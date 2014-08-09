var App;
(function (App) {
    'use strict';

    var ModelState = (function () {
        function ModelState() {
        }
        ModelState.clearErrors = function (jForm) {
            ModelState.clearSummary(jForm);
            ModelState.clearFields(jForm);
        };

        ModelState.showResponseErrors = function (jForm, jqXHR) {
            var response = $.parseJSON(jqXHR.responseText);
            if (typeof response.ModelState === 'undefined') {
                return false;
            }

            ModelState.showErrors(jForm, response.ModelState);
            return true;
        };

        ModelState.showErrors = function (jForm, modelState) {
            ModelState.showSummary(jForm, modelState);

            ModelState.showFields(jForm, modelState);
        };

        ModelState.clearFields = function (jForm) {
            jForm.find('.input-validation-error').removeClass('input-validation-error');
            jForm.find('.field-validation-error').removeClass('field-validation-error').addClass('field-validation-valid');
        };

        ModelState.showFields = function (jForm, modelState) {
            $.each(modelState, function (i, ival) {
                ModelState.renderFieldErrors(jForm, i, ival);
            });
        };

        ModelState.renderFieldErrors = function (jForm, name, errors) {
            for (var i = 0; i < errors.length; i++) {
                var errorText = errors[i];

                var currDom = $('#' + name.split('.')[1]);
                if (currDom.length == 0)
                    continue;

                var currForm = currDom.parents('form').first();
                if (currForm.length == 0)
                    continue;

                if (!currDom.hasClass('input-validation-error'))
                    currDom.addClass('input-validation-error');

                var currDisplay = $(currForm).find("[data-valmsg-for='" + name.split('.')[1] + "']");
                if (currDisplay.length > 0) {
                    currDisplay.removeClass("field-validation-valid").addClass("field-validation-error");
                    if (currDisplay.attr("data-valmsg-replace")) {
                        currDisplay.empty();
                        currDisplay.text(errorText);
                    }
                }
            }
        };

        ModelState.clearSummary = function (jForm) {
            var validationSummaryErrors = jForm.find('.validation-summary-errors');
            if (validationSummaryErrors) {
                validationSummaryErrors.addClass("validation-summary-valid").removeClass("validation-summary-errors");

                var ul = validationSummaryErrors.find("ul");
                ul.empty();
                $("<li />", { display: 'none' }).appendTo(ul);
            }
        };

        ModelState.showSummary = function (jForm, modelState) {
            var errors = [];
            var validationContainer = jForm.find("[data-valmsg-summary=true]");
            if (validationContainer.length) {
                for (var field in modelState) {
                    errors = $.merge(errors, modelState[field]);
                }
            } else {
                if (typeof modelState[''] !== 'undefined') {
                    errors = modelState[''];
                }
            }

            ModelState.renderSummaryErrors(jForm, errors);
        };

        ModelState.renderSummaryErrors = function (jForm, errors) {
            var container = ModelState.getSummaryContainer(jForm);
            if (!container.length) {
                return;
            }

            setTimeout(function () {
                var list = container.find("ul");
                list.empty();
                if (errors && errors.length > 0) {
                    $.each(errors, function (i, ival) {
                        $("<li />").html(ival).appendTo(list);
                    });

                    container.addClass("validation-summary-errors").removeClass("validation-summary-valid");
                    setTimeout(function () {
                        jForm.find('span.input-validation-error[data-element-type]').removeClass('input-validation-error');
                    }, 0);
                } else {
                    container.addClass("validation-summary-valid").removeClass("validation-summary-errors");
                }
            }, 0);
        };

        ModelState.getSummaryContainer = function (jForm) {
            var validationSummaryContainer = jForm.find('.validation-summary-errors');
            if (!validationSummaryContainer.length) {
                validationSummaryContainer = jForm.find('.validation-summary-valid');
            }

            if (!validationSummaryContainer.length) {
                var validationSummary = jForm.find('.validation-summary');
                if (validationSummary.length) {
                    validationSummaryContainer = $('<div/>', {
                        "class": "validation-summary-valid"
                    }).appendTo(validationSummary);

                    $("<ul />").appendTo(validationSummaryContainer);
                }
            }

            return validationSummaryContainer;
        };

        ModelState.addCustomSummaryError = function (jForm, error, id) {
            var container = ModelState.getSummaryContainer(jForm);
            if (!container.length) {
                return;
            }

            setTimeout(function () {
                var list = container.find("ul");
                $("<li />").attr('id', id).addClass('custom-summary-error').html(error).appendTo(list);
                container.addClass("validation-summary-errors").removeClass("validation-summary-valid");
                setTimeout(function () {
                    jForm.find('span.input-validation-error[data-element-type]').removeClass('input-validation-error');
                }, 0);
            }, 0);
        };

        ModelState.removeCustomSummaryError = function (jForm, id) {
            var li = jForm.find('#' + id);
            if (li.length > 0) {
                var container = ModelState.getSummaryContainer(jForm);
                if (!container.length) {
                    return;
                }

                var list = container.find("ul");
                if (list.length > 0 && list.children('li').length <= 1) {
                    container.addClass("validation-summary-valid").removeClass("validation-summary-errors");
                }

                li.remove();
            }
        };

        ModelState.clearCustomSummaryErrors = function (jForm) {
            var items = jForm.find('.custom-summary-error');
            if (items.length <= 0)
                return;

            var container = ModelState.getSummaryContainer(jForm);
            if (!container.length) {
                return;
            }

            items.remove();
            setTimeout(function () {
                var list = container.find("ul");
                if (list.length > 0 && list.children('li').length <= 0) {
                    container.addClass("validation-summary-valid").removeClass("validation-summary-errors");
                }
            }, 0);
        };
        return ModelState;
    })();
    App.ModelState = ModelState;
})(App || (App = {}));
