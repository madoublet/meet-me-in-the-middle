(function () {
    "use strict";

    // uncomment for release
    var currentApp = Windows.ApplicationModel.Store.CurrentApp;

    // comment for release
    //var currentApp = Windows.ApplicationModel.Store.CurrentAppSimulator;

    // Get the license info
    var licenseInformation;

    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var ui = WinJS.UI;

    // creates a quick debug message
    function debug(message) {
        console.log(message);
    }

    function purchase() {
        if (!licenseInformation.productLicenses.lookup("noads").isActive) {
            // The customer doesn't own this feature, so 
            // show the purchase dialog.

            // note: currentApp is a reference to CurrentAppSimulator from a previous declaration
            currentApp.requestProductPurchaseAsync("noads", false).then(
                function () {
                    // the in-app purchase was successful
                    var md = new Windows.UI.Popups.MessageDialog('Thank you for your purchase!  Enjoy your upgraded version of Meet me in the Middle.');
                    md.showAsync();

                    removeAds();
                },
                function () {
                    // The in-app purchase was not completed because 
                    // there was an error.
                    var md = new Windows.UI.Popups.MessageDialog('It looks like you encountered an error.  Please try again.  Contact @matthewsmith for questions or issues.');
                    md.showAsync();
                });
        }
        else {
            var md = new Windows.UI.Popups.MessageDialog('You have already upgraded your app.  Contact @matthewsmith for questions or issues.');
            md.showAsync();
        }
    }

    function removeAds() {// remove ads
        $('.upgrade').hide();
        $('.ad').remove();
        $('.more').show();
        $('.pro').show();
    }


    ui.Pages.define("/pages/items/items.html", {

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            try{
                licenseInformation = currentApp.licenseInformation;

                if (licenseInformation.productLicenses.lookup("noads").isActive) {
                    // the customer can access this feature
                    removeAds();
                }
            }
            catch (e) {

            }

            var main = $('#main').get(0);

            // enter page animation
            WinJS.UI.Animation.enterPage(main, null).done( /* Your success and error handlers */);

            // pointer animations
            $('.item').on('MSPointerDown', function () {
                WinJS.UI.Animation.pointerDown(this);
            });

            $('.item').on('MSPointerUp', function () {
                WinJS.UI.Animation.pointerUp(this);
            });

            $('.item').click(function () {

                if ($(this).hasClass('more')) {
                    var more = $(this).attr('data-more');
                    var title = $(this).find('h3').text();
                    var key = 'more';

                    WinJS.Navigation.navigate("/pages/split/split.html", { more: more, title: title, key: key });
                }
                else {
                    var category = $(this).attr('data-category');
                    var title = $(this).find('h3').text();
                    var key = $(this).attr('id');

                    WinJS.Navigation.navigate("/pages/split/split.html", { category: category, title: title, key: key });
                }

                
            });

            $('.upgrade a').click(function () {
                purchase();
            });

            $('#personalize').click(function () {
                WinJS.Navigation.navigate("/pages/personalize/personalize.html", {});
            });

        }
    });
})();
