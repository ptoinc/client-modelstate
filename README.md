client-modelstate
=================

Uniform client-side ModelState error handling for ASP.NET MVC projects.

If you're using ASP.NET MVC, especially the new Web API 2 ApiController helpers, like BadRequest(), you may have run up against the challenge of how to present the returned ModelState object on the client.
This component takes care of that currently missing piece.

You can see more examples and learn about the motivation [here](http://www.toddlucas.net/2014/08/client-side-modelstate).

This is a single class with a number of static methods, written in TypeScript.
The project includes the transformed JavaScript, which you can use directly.
To render errors on a POST failure, you can use jQuery's ajax statusCode setting for status code 400 (Bad Request).

```js
$('#myform').submit(function(event) {
    event.preventDefault();
    
    $.ajax({
        url: '/controller/action',
        data: $(this).serializeArray(),
        statusCode: {
            400: function (jqXHR) {
                App.ModelState.showResponseErrors($('#myform'), jqXHR);
            }
        }
    });
});
```

As an alternative, if you're using deferred promise chaining, you could handle status code 400 in the fail method.

```js
$('#myform').submit(function(event) {
    event.preventDefault();
    
    $.ajax({
        url: '/controller/action',
        data: $(this).serializeArray()
    }).fail(function(jqXHR) {
        if (jqXHR.status == 400)
            App.ModelState.showResponseErrors($('#myform'), jqXHR);
    });
});
```

In addition to the standard error handling in response to a POST, additional methods have been provided to manage supplemental custom summary errors.
These can be used, for example, to add and remove errors as users interact with a form, either before or after submitting it.
Custom errors are marked with a 'custom-summary-error' class, which allows them to be treated independently of the standard validation errors.
In this way, the uniform presentation of server-side vs. client-side form posting can be extended to support interactive features.
In some cases, this can be a good alternative to modal dialogs, toast notifications, and similar mechanisms.
