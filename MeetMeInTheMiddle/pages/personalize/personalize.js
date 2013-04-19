// For an introduction to the HTML Fragment template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var applicationData = Windows.Storage.ApplicationData.current;
    var localSettings = applicationData.localSettings;

    // This function is called whenever a user navigates to this page. It
    // populates the page elements with the app's data.
    function ready(element, options) {

        // default icons
        var myIcon = 'stache';
        var friendIcon = 'shades';

        // get settings
        if (localSettings.values["myIcon"] != null) {
            myIcon = localSettings.values["myIcon"];
        }

        if (localSettings.values["friendIcon"] != null) {
            friendIcon = localSettings.values["friendIcon"];
        }

        var html = '';

        // setup my character
        data.characters.forEach(function (item) {
            var selected = '';

            if (item.key == myIcon) {
                selected = ' selected';
            }

            html += '<span id="' + item.key + '" class="character' + selected + '"><img src="' + item.icon + '"></span>';
        });

        $('#mycharacter').html(html);

        html = '';

        // setup friend character
        data.characters.forEach(function (item) {
            var selected = '';

            if (item.key == friendIcon) {
                selected = ' selected';
            }

            html += '<span id="' + item.key + '" class="character' + selected + '"><img src="' + item.icon + '"></span>';
        });

        $('#friendcharacter').html(html);

        // setup events
        $('#mycharacter span.character').click(function () {
            $('#mycharacter span.character').removeClass('selected');
            $(this).addClass('selected');

            localSettings.values["myIcon"] = $(this).attr('id');
        });

        $('#friendcharacter span.character').click(function () {
            $('#friendcharacter span.character').removeClass('selected');
            $(this).addClass('selected');

            localSettings.values["friendIcon"] = $(this).attr('id');
        });


    }

    function updateLayout(element, viewState) {
        // TODO: Respond to changes in viewState.
    }

    WinJS.UI.Pages.define("/pages/personalize/personalize.html", {
        ready: ready,
        updateLayout: updateLayout
    });
})();
