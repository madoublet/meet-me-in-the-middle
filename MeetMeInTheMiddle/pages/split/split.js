(function () {
    "use strict";

    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var binding = WinJS.Binding;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;
    var utils = WinJS.Utilities;
    var applicationData = Windows.Storage.ApplicationData.current;
    var localSettings = applicationData.localSettings;
    var dataTransferManager = null;

    // handles page el
    var el = null;

    // holds the map
    var map; 

    // set api key
    var bingMapsApiKey = 'bing-maps-key';

    // yelp v1.0
    var yelpApiKey = 'yelp-api-key';

    // yelp v2.0
    var auth = {
        consumerKey: 'yelp-consumer-key',
        consumerSecret: 'yelp-consumer-secret',
        accessToken: 'yelp-access-token',
        accessTokenSecret: 'yelp-access-token-secret',
        serviceProvider: { signatureMethod: "HMAC-SHA1" }
    };

    // set default icons
    var myIcon = 'stache';
    var friendIcon = 'shades';

    // current
    var current = null; // set to the current location

    // search param
    var term = 'beer';
    var category = 'pubs';
    var key = 'beer';
    var radius = 5;

    // setup geoloc params
    var loc = null;
    var start = { lat: 40.71, long: -74.00 };
    var setByGPS = false;
    var loc1 = { lat: null, long: null };
    var loc2 = { lat: null, long: null };
    var middle = { lat: null, long: null };
    var locs = [];

    // holds the infobox
    var infobox;
    var route1;
    var route2;

    // creates a quick debug message
    function debug(message) {
        console.log(message);
    }

    // debugs an object
    function debugObject(o) {
        var out = '';
        for (var p in o) {
            out += p + ': ' + o[p] + '\n';
        }

        console.log(out);
    }

    // get the middle b/w two points (loc1 and loc2)
    function getMiddle() {

        // setup vars
        var lat1 = loc1.lat;
        var lon1 = loc1.long;
        var lat2 = loc2.lat;
        var lon2 = loc2.long;

        // helper functions
        function toRadians(degrees) {
            return degrees * (Math.PI / 180);
        }

        function toDegrees(radians) {
            return radians * (180 / Math.PI);
        }

        var dLon = toRadians(lon2 - lon1);

        // convert to radians
        lat1 = toRadians(lat1);
        lat2 = toRadians(lat2);
        lon1 = toRadians(lon1);

        // some calculations
        var Bx = Math.cos(lat2) * Math.cos(dLon);
        var By = Math.cos(lat2) * Math.sin(dLon);
        var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By));
        var lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

        // convert back to degrees
        lat3 = toDegrees(lat3);
        lon3 = toDegrees(lon3);

        return { lat: lat3, long: lon3 };
    }

    // shows the info box for the current selected item
    function showCurrentInfoBox() {

        var desc = current.address + '<br>';

        desc += '<strong>' + current.phone + '</strong><br><br>';
        desc += '<img src="' + current.ratingimage + '"> <small>Based on ' + current.reviews + ' reviews</small><br>';
        desc += '<a href="' + current.url + '">Read Reviews on Yelp</a>';

        var html = '<table><tr><td valign="top"><img src="' + current.photo + '"></td><td valign="top" style="padding-left: 5px">' + desc + '</td></tr></table>';

        $('#name').html(current.title);

        $('#yelpLink').html('<a href="' + current.url + '">Read Reviews on Yelp</a>');
        $('#bingLink').html('<a href="http://www.bing.com/maps/?v=2&where1=' + current.url_address + '">Map it on Bing</a>');
        $('#address').html(current.address);

        createInfobox(current.latitude, current.longitude, current.title, html);
    }

    // set a point on the map
    function setPointOnMap(lat, long, icon) {

        var loc = new Microsoft.Maps.Location(lat, long);
        locs.push(loc);

        var bestview = Microsoft.Maps.LocationRect.fromLocations(locs); // find bestview

        map.setView({ center: loc, bounds: bestview });

        var startPushpinOptions = { icon: '/images/icons/' + icon + '.png', width: 100, height: 86 };
        var startPin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(lat, long), startPushpinOptions);

        map.entities.push(startPin);
    }

    // creates a route
    function createRoute(result, selector) {

        result = JSON.parse(result.responseText);
        if (result && result.resourceSets && result.resourceSets.length > 0 && result.resourceSets[0].resources && result.resourceSets[0].resources.length > 0 && result.resourceSets[0].resources[0].routeLegs.length > 0) {
            // instruction list can be displayed using below code

            var html = '<ol>';

            for (var i = 0; i < result.resourceSets[0].resources[0].routeLegs[0].itineraryItems.length; ++i) {

                var resultStr = result.resourceSets[0].resources[0].routeLegs[0].itineraryItems[i].instruction.text;

                html += '<li>' + resultStr + '</li>';
            }

            html += '</ol>';

            $(selector).html(html);

            var bbox = result.resourceSets[0].resources[0].bbox;
            var viewBoundaries = Microsoft.Maps.LocationRect.fromLocations(new Microsoft.Maps.Location(bbox[0], bbox[1]), new Microsoft.Maps.Location(bbox[2], bbox[3]));
            var routeline = result.resourceSets[0].resources[0].routePath.line;
            var routepoints = new Array();
            for (var i = 0; i < routeline.coordinates.length; i++) {
                routepoints[i] = new Microsoft.Maps.Location(routeline.coordinates[i][0], routeline.coordinates[i][1]);
            }

            if (selector == '#mydirections') {
                route1 = new Microsoft.Maps.Polyline(routepoints, { strokeColor: new Microsoft.Maps.Color(200, 12, 156, 200) });
                map.entities.push(route1);
            }
            else {
                route2 = new Microsoft.Maps.Polyline(routepoints, { strokeColor: new Microsoft.Maps.Color(200, 142, 202, 45) });
                map.entities.push(route2);
            }

            $('.poweredBy img').attr('src', '/images/bing.png');
            $('.poweredBy').attr('href', 'http://maps.bing.com');
        }

    }


    // create an infobox on the map
    function createInfobox(lat, long, i_title, i_desc) {

        map.entities.remove(infobox);
        map.entities.remove(route1);
        map.entities.remove(route2);

        var loc = new Microsoft.Maps.Location(lat, long);

        function getDirections() {
            $('.itemlist').hide();

            var incoming = $('.directions').get(0);

            WinJS.UI.Animation.enterContent(incoming, null).done( /* Your success and error handlers */);

            var start = loc1.lat + ', ' + loc1.long;
            var end = lat + ', ' + long;

            var routeRequest = 'http://dev.virtualearth.net/REST/v1/Routes?wp.0=' + start + '&wp.1=' + end + '&routePathOutput=Points&output=json&key=' + bingMapsApiKey;

            WinJS.xhr({ url: routeRequest }).then(function (response) { // success
                createRoute(response, '#mydirections');
            }, function (response) { });

            var start = loc2.lat + ', ' + loc2.long;

            routeRequest = 'http://dev.virtualearth.net/REST/v1/Routes?wp.0=' + start + '&wp.1=' + end + '&routePathOutput=Points&output=json&key=' + bingMapsApiKey;

            WinJS.xhr({ url: routeRequest }).then(function (response) { // success
                createRoute(response, '#friendsdirections');
            }, function (response) { });
        }

        infobox = new Microsoft.Maps.Infobox(loc, {
            width: 400, height: 250,
            title: i_title, description: i_desc, titleClickHandler: function () {
                getDirections();
            }, actions: [{
                label: 'Get Directions', eventHandler: function () {

                    getDirections();
                }
            }]
        });

        // create infobox
        map.entities.push(infobox);

        var bestview = Microsoft.Maps.LocationRect.fromLocations(locs); // find bestview

        map.setView({ center: loc, bounds: bestview });
    }

    // gets locations data from Yelp
    function getLocationsData() {
        middle = getMiddle();
        setPointOnMap(middle.lat, middle.long, key);
        var radiusInMeters = radius * 1609.34;

        $('.poweredBy').fadeIn();

        // create accessor
        var accessor = {
            consumerSecret: auth.consumerSecret,
            tokenSecret: auth.accessTokenSecret
        };

        // push params
        var parameters = [];
        parameters.push(['category_filter', category]);
        parameters.push(['sort', 1]);
        parameters.push(['limit', 10]);
        parameters.push(['radius_filter', radiusInMeters]);
        parameters.push(['ll', middle.lat + ',' + middle.long]);
        parameters.push(['oauth_consumer_key', auth.consumerKey]);
        parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
        parameters.push(['oauth_token', auth.accessToken]);
        parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

        var message = {
            'action': 'http://api.yelp.com/v2/search',
            'method': 'GET',
            'parameters': parameters
        };

        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);

        var parameterMap = OAuth.getParameterMap(message.parameters);
        parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);

        var qs = '';

        for (var p in parameterMap) {
            qs += p + '=' + parameterMap[p] + '&';
        }

        var url = message.action + '?' + qs;


        WinJS.xhr({
            url: url
        }).then(success, failure);

        $('#searching').show(); // hide progress

        // handles a succesful yelp response
        function success(result) {

            var response = window.JSON.parse(result.responseText);

            $('#searching').hide(); // hide progress

            if (response.businesses.length == 0) { // handle no results error
                $('.error').show();

                if (radius == 25) {
                    $('.error .noresultsLargest').show();
                }
                else {
                    $('.error .noresults').show();
                }

            }

            var businesses = response.businesses;

            var list = new WinJS.Binding.List(); // create a new list to hold items

            response.businesses.forEach(function (item) {

                var cleaned = [];
                cleaned['name'] = item.name;

                var imgurl = item.image_url;

                if (imgurl == null || imgurl == '') {
                    imgurl = '/images/no-image.png';
                }

                cleaned['image_url'] = imgurl;

                var address = '';
                var url_address = '';

                for (var x = 0; x < item.location.display_address.length; x++) {
                    if (x > 0) {
                        address += '<br>';
                        url_address += ' ';
                    }
                    address = address + item.location.display_address[x];
                    url_address = url_address + item.location.display_address[x];
                }

                cleaned['display_address'] = address;
                cleaned['url_address'] = encodeURIComponent(url_address);
                cleaned['city'] = item.location.city;
                cleaned['state'] = item.location.state_code;
                cleaned['city_state'] = item.location.city + ', ' + item.location.state_code;
                cleaned['cross_streets'] = item.location.cross_streets;
                cleaned['latitude'] = item.location.coordinate.latitude;
                cleaned['longitude'] = item.location.coordinate.longitude;
                cleaned['rating_img_url'] = item.rating_img_url;
                cleaned['display_phone'] = item.display_phone;
                cleaned['review_count'] = item.review_count;
                cleaned['url'] = item.url;
                cleaned['distance'] = (item.distance / 1609.34).toFixed(2) + ' miles away from the middle';

                list.push(cleaned);
            });

            // Set up the ListView
            var listView = el.querySelector(".itemlist").winControl;
            ui.setOptions(listView, {
                itemDataSource: list.dataSource,
                itemTemplate: el.querySelector(".itemtemplate"),
                layout: new ui.ListLayout(),
                oniteminvoked: itemInvoked
            });


            function itemInvoked(e) {

                var i = e.detail.itemIndex;

                // win-item
                var item = $(listView.element).find('.win-item')[i];

                var latitude = $(item).find('.lat').val();
                var longitude = $(item).find('.long').val();
                var title = $(item).find('.title').val();
                var address = jQuery.trim($(item).find('.address').val());
                var city_state = jQuery.trim($(item).find('.city_state').val());
                var url_address = jQuery.trim($(item).find('.url_address').val());
                var url = $(item).find('.url').val();
                var photo = $(item).find('.photo').val();
                var ratingimage = $(item).find('.ratingimage').val();
                var reviews = $(item).find('.reviews').val();
                var phone = $(item).find('.phone').val();

                current = {
                    latitude: latitude,
                    longitude: longitude,
                    title: title,
                    address: address,
                    url_address: url_address,
                    city_state: city_state,
                    url: url,
                    photo: photo,
                    ratingimage: ratingimage,
                    reviews: reviews,
                    phone: phone,
                    key: key
                };

                showCurrentInfoBox();
            }

        }

        // handles a failed yelp response
        function failure(result) {
            debug(result.responseText);
        }
    }

    // gets the address for a given textbox
    function getAddress(textbox) {

        var query = jQuery.trim($('#' + textbox).val());
        var location = $('#' + textbox).attr('data-loc');
        var icon = $('#' + textbox).attr('data-icon');

        var def = $.Deferred(); // setup promise

        query = encodeURIComponent(query);

        if (map) {
            map.getCredentials(function (credentials) {
                var request = 'http://dev.virtualearth.net/REST/v1/Locations?q=' + query + '&o=json&key=' + credentials;

                if (setByGPS == true) {
                    request += '&userLocation=' + start.lat + ',' + start.long;
                }

                WinJS.xhr({ url: request }).then(addressSuccess, addressFailure);
            });
        }

        // handles the json that comes back from the bing api
        function addressSuccess(result) {

            result = JSON.parse(result.responseText);

            var p_lat = result.resourceSets[0].resources[0].geocodePoints[0].coordinates[0];
            var p_long = result.resourceSets[0].resources[0].geocodePoints[0].coordinates[1];

            if (location == 'location1') {
                loc1.lat = p_lat;
                loc1.long = p_long;
            }
            else if (location == 'location2') {
                loc2.lat = p_lat;
                loc2.long = p_long;
            }

            setPointOnMap(p_lat, p_long, icon);

            def.resolve('success!');
        }

        // handles the failure of the address
        function addressFailure(e) {

            if (location == 'location2' && loc1.lat != null) {
                loc2.lat = loc1.lat;
                loc2.long = loc1.long;

                setPointOnMap(loc2.lat, loc2.long, icon);
                def.resolve('success!');
            }

            def.reject(e);
        }

        return def;
    }

    ui.Pages.define("/pages/split/split.html", {

        // initializes the map
        initMap: function () {

            $('#location1').attr('placeholder', 'Trying to get your location...');

            // create map
            var mapOptions = {  // Add your Bing Maps key here
                credentials: bingMapsApiKey,
                center: new Microsoft.Maps.Location(start.lat, start.long),
                mapTypeId: Microsoft.Maps.MapTypeId.road,
                zoom: 8
            };
            map = new Microsoft.Maps.Map(document.getElementById("mapdiv"), mapOptions);

            // get location
            if (loc == null) {
                loc = new Windows.Devices.Geolocation.Geolocator();
            }

            if (loc != null) {
                loc.getGeopositionAsync().then(
                    geoSuccess,
                    geoFailure);
            }

            function geoSuccess(pos) { // handles successfull location

                try {
                    setByGPS = true;
                    start.lat = pos.coordinate.latitude;
                    start.long = pos.coordinate.longitude;
                    loc1.lat = pos.coordinate.latitude;
                    loc1.long = pos.coordinate.longitude;

                    setPointOnMap(start.lat, start.long, myIcon);
                    $('#location1').attr('placeholder', 'Got it! Change your location by clicking here.');
                }
                catch (e) {
                    $('#location1').attr('placeholder', "Couldn't get it, please key it here.");
                }

            }

            function geoFailure(e) {
                $('#location1').attr('placeholder', "Couldn't get it, please key it here.");
            }
            
        },

        // orchestrates the search pattern
        orchestrate: function () {

            // hide the form
            $('.locationForm').hide();

            // get initial values
            var location1 = jQuery.trim($('#location1').val());

            // orchestrate the search
            if (setByGPS == false || location1 != '') {

                if (map) {
                    map.entities.clear();
                }

                getAddress('location1').then(
                    function () { // success
                        getAddress('location2').then(
                            function () { // success 2
                                getLocationsData();
                            },
                            orchestrationError
                            );
                    },
                    orchestrationError
                    );

            }
            else {
                getAddress('location2').then(
                    function () { // success
                        getLocationsData();
                    },
                    orchestrationError
                    );
            }

            function orchestrationError(e) {
                debug(e);
            } // empty for now

            return false;
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            el = element;

            // get settings
            if (localSettings.values["myIcon"] != null) {
                myIcon = localSettings.values["myIcon"];
                $('#location1').attr('data-icon', myIcon);
            }

            if (localSettings.values["friendIcon"] != null) {
                friendIcon = localSettings.values["friendIcon"];
                $('#location2').attr('data-icon', friendIcon);
            }

            if (options.category) {
                // setup passed params
                term = options.category;
                category = options.category;
            }
            else if (options.more) {

                $('#where').show();

                var more = null;

                if (options.more == 'fun') {
                    more = data.fun;
                }
                else if (options.more == 'food') {
                    more = data.food;
                }
                else if (options.more == 'outdoors') {
                    more = data.outdoors;
                }

                var select = $('#more').get(0);
                var temp = '';

                for (var x = 0; x < more.length; x++) {
                    var option = document.createElement("OPTION");
                    option.text = more[x].title;
                    option.value = more[x].key;
                    select.add(option);
                    temp = temp + ': ' + more[x].title;
                }

                term = $('#more').val();
                category = $('#more').val();

                $('#more').change(function () {
                    term = $('#more').val();
                    category = $('#more').val();
                });
            }

            key = options.key;
            $('.pagetitle').text(options.title);

            // initialize map
            setByGPS = false;
            locs = [];
            Microsoft.Maps.loadModule('Microsoft.Maps.Map', { callback: this.initMap });

            // handle back to results
            $('.backToResults').click(function () {
                $('.itemlist').show();

              
                $('.poweredBy img').attr('src', '/images/yelp.png');
                $('.poweredBy').attr('href', 'http://yelp.com');
            });

            // setup events
            document.getElementById('meetup').addEventListener("click", this.orchestrate, false);
            
            $('#tryLarger').click(function () {

                $('.error').hide();
                $('.noresults').hide();
                radius = 10;
                getLocationsData();

                $('#radius').text(radius);
                $('#tryLarger').hide();
            });

            $('#tryEvenLarger').click(function () {
                $('.error').hide();
                $('.noresults').hide();
                radius = 25;
                getLocationsData();

                $('#radius').text(radius);
            });

            // setup sharing
            if (dataTransferManager == null) {
                dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();

                dataTransferManager.addEventListener("datarequested", function (e) {
                    var request = e.request;

                    var css = '<style>h2, h3, p, ol{margin: 0 0 15px 0; padding: 0} li{margin:0 0 15px 20px; padding: 0}</style>';

                    var html = $('div.directionsContainer').html();

                    var htmlFormat = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(css + html);
                    request.data.properties.title = "Meet me in the Middle!";
                    request.data.properties.description = "Here are directions to where I would like to meetup.";
                    request.data.setHtmlFormat(htmlFormat);
                });
            }
        }
    });
})();
