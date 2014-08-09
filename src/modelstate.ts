
interface IDictionary<T> {
    [index: string]: T[];
}

module App {
    'use strict';

    interface IModelResponse {
        ModelState: IDictionary<string>;
    }

    export class ModelState {
        static clearErrors(jForm) {
            ModelState.clearSummary(jForm);
            ModelState.clearFields(jForm);
        }

        static showResponseErrors(jForm: JQuery, jqXHR: JQueryXHR): boolean {
            var response = <IModelResponse>$.parseJSON(jqXHR.responseText);
            if (typeof response.ModelState === 'undefined') {
                // REVIEW: Log or throw error?
                // TODO: Should we handle response.Message?
                return false;
            }

            ModelState.showErrors(jForm, response.ModelState);
            return true;
        }

        static showErrors(jForm: JQuery, modelState: IDictionary<string>) {
            // Show any errors at the Html.ValidationSummary() site.
            ModelState.showSummary(jForm, modelState);

            // Show any model property errors at the associated form controls
            // where Html.ValidationMessageFor() is called.
            ModelState.showFields(jForm, modelState);
        }

        private static clearFields(jForm: JQuery) {
            // TODO: Remove any earlier text which was set for elements with 
            // the data-valmsg-replace attribute.
            jForm.find('.input-validation-error').removeClass('input-validation-error');
            jForm.find('.field-validation-error').removeClass('field-validation-error').addClass('field-validation-valid');
        }

        private static showFields(jForm: JQuery, modelState: IDictionary<string>) {
            $.each(modelState, function (i, ival) {
                ModelState.renderFieldErrors(jForm, i, ival);
            });
        }

        private static renderFieldErrors(jForm: JQuery, name: string, errors: Array<string>) {
            // http://brettedotnet.wordpress.com/2013/05/01/asp-net-web-api-validation-a-one-more-better-approach/
            for (var i = 0; i < errors.length; i++) {
                var errorText = errors[i];

                var currDom = $('#' + name.split('.')[1]);
                if (currDom.length == 0) continue;

                var currForm = currDom.parents('form').first();
                if (currForm.length == 0) continue;

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
        }

        private static clearSummary(jForm: JQuery) {
            // Is there an error?
            var validationSummaryErrors = jForm.find('.validation-summary-errors');
            if (validationSummaryErrors) {

                validationSummaryErrors
                    .addClass("validation-summary-valid")
                    .removeClass("validation-summary-errors");

                // Put the list back to the initial state.
                var ul = validationSummaryErrors.find("ul");
                ul.empty();
                $("<li />", { display: 'none' }).appendTo(ul);
            }
        }

        private static showSummary(jForm: JQuery, modelState: IDictionary<string>) {
            var errors = [];
            var validationContainer = jForm.find("[data-valmsg-summary=true]");
            if (validationContainer.length) {
                // Show all errors.
                // REVIEW: Should we order non-model errors first?
                for (var field in modelState) {
                    errors = $.merge(errors, modelState[field]);
                }
            }
            else {
                // Only show model-level errors.
                if (typeof modelState[''] !== 'undefined') {
                    errors = modelState[''];
                }
            }

            ModelState.renderSummaryErrors(jForm, errors);
        }

        private static renderSummaryErrors(jForm: JQuery, errors: Array<string>) {
            var container = ModelState.getSummaryContainer(jForm);
            if (!container.length) {
                return;
            }

            // The container may have been generated, so delay.
            setTimeout(function () {
                var list = container.find("ul");
                list.empty();
                if (errors && errors.length > 0) {
                    $.each(errors, function (i, ival) {
                        $("<li />").html(ival).appendTo(list);
                    });

                    container.addClass("validation-summary-errors").removeClass("validation-summary-valid");
                    setTimeout(function () { jForm.find('span.input-validation-error[data-element-type]').removeClass('input-validation-error') }, 0);
                }
                else {
                    container.addClass("validation-summary-valid").removeClass("validation-summary-errors");
                }
            }, 0);
        }

        private static getSummaryContainer(jForm: JQuery): JQuery {
            // Is there already an error?
            var validationSummaryContainer = jForm.find('.validation-summary-errors');
            if (!validationSummaryContainer.length) {
                validationSummaryContainer = jForm.find('.validation-summary-valid');
            }

            if (!validationSummaryContainer.length) {
                // ValidationSummary(excludePropertyErrors: true) will not 
                // render anything initially. If we would like non-model
                // errors to render, we should wrap this method in an 
                // element having the validation-summary class.
                var validationSummary = jForm.find('.validation-summary');
                if (validationSummary.length) {
                    validationSummaryContainer = $('<div/>', {
                        "class": "validation-summary-valid"
                    }).appendTo(validationSummary);

                    $("<ul />").appendTo(validationSummaryContainer);
                }
            }

            return validationSummaryContainer;
        }

        //
        // Optional client-side supplement
        //

        public static addCustomSummaryError(jForm: JQuery, error: string, id: string) {
            var container = ModelState.getSummaryContainer(jForm);
            if (!container.length) {
                return;
            }

            // The container may have been generated, so delay.
            setTimeout(function () {
                var list = container.find("ul");
                $("<li />").attr('id', id).addClass('custom-summary-error').html(error).appendTo(list);
                container.addClass("validation-summary-errors").removeClass("validation-summary-valid");
                setTimeout(function () { jForm.find('span.input-validation-error[data-element-type]').removeClass('input-validation-error') }, 0);
            }, 0);
        }

        public static removeCustomSummaryError(jForm: JQuery, id: string) {
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
        }

        public static clearCustomSummaryErrors(jForm: JQuery) {
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
        }
    }
}
 