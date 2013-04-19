(function () {
    "use strict";

    // create characters
    var characters = [
        { key: "stache", title: "Stache", icon: "/images/icons/stache.png" },
        { key: "ninja", title: "Yarrr!", icon: "/images/icons/ninja.png" },
        { key: "shades", title: "Shades", icon: "/images/icons/shades.png" },
        { key: "pirate", title: "Yarrr!", icon: "/images/icons/pirate.png" },
        { key: "bow", title: "Yarrr!", icon: "/images/icons/bow.png" }
    ];

    // set fun
    var fun = [
        { key: "amusementparks", title: "Amusement Parks" },
        { key: "aquariums", title: "Aquariums" },
        { key: "comedyclubs", title: "Comedy" },
        { key: "countrydancehalls", title: "Country Dancing" },
        { key: "fitness", title: "Fitness" },
        { key: "jazzandblues", title: "Jazz and Blues" },
        { key: "karaoke", title: "Karaoke" },
        { key: "pianobars", title: "Piano Bars" },
        { key: "poolhalls", title: "Pool" },
        { key: "museums", title: "Museums" },
        { key: "musicvenues", title: "Music" },
        { key: "skatingrinks", title: "Skating Rinks" },
        { key: "shopping", title: "Shopping" },
        { key: "tennis", title: "Tennis" },
        { key: "wineries", title: "Wineries" },
        { key: "zoos", title: "Zoos" }
    ];

    // set food
    var food = [
        { key: "tradamerican", title: "American" },
        { key: "bakeries", title: "Bakeries" },
        { key: "brazilian", title: "Brazilian" },
        { key: "breakfast_brunch", title: "Breakfast and Brunch" },
        { key: "buffets", title: "Buffets" },
        { key: "cafes", title: "Cafes" },
        { key: "cajun", title: "Cajun" },
        { key: "chicken_wings", title: "Chicken Wings" },
        { key: "chinese", title: "Chinese" },
        { key: "delis", title: "Delis" },
        { key: "desserts", title: "Desserts" },
        { key: "diners", title: "Diners" },
        { key: "donuts", title: "Donuts" },
        { key: "diners", title: "Fast Food" },
        { key: "gelato", title: "Gelato" },
        { key: "german", title: "German" },
        { key: "greek", title: "Greek" },
        { key: "grocery", title: "Grocery" },
        { key: "hawaiian", title: "Hawaiian" },
        { key: "irish", title: "Irish" },
        { key: "italian", title: "Italian" },
        { key: "japanese", title: "Japanese" },
        { key: "juicebars", title: "Juice Bars" },
        { key: "korean", title: "Korean" },
        { key: "kosher", title: "Kosher" },
        { key: "latin", title: "Latin" },
        { key: "mediterranean", title: "Mediterranean" },
        { key: "peruvian", title: "Peruvian" },
        { key: "salad", title: "Salad" },
        { key: "scottish", title: "Scottish" },
        { key: "seafood", title: "Seafood" },
        { key: "steak", title: "Steak" },
        { key: "tapas", title: "Tapas" },
        { key: "tex-mex", title: "Tex-mex" },
        { key: "vegan", title: "Vegan" },
        { key: "vegetarian", title: "Vegetarian" }
    ];

    // set outdoors
    var outdoors = [
        { key: "archery", title: "Archery" },
        { key: "bikerentals", title: "Bike Rentals" },
        { key: "boating", title: "Boating" },
        { key: "discgolf", title: "Disc Golf" },
        { key: "scuba", title: "Scuba Diving" },
        { key: "fishing", title: "Fishing" },
        { key: "gokarts", title: "Go Karts" },
        { key: "horsebackriding", title: "Horseback Riding" },
        { key: "mini_golf", title: "Mini Golf" },
        { key: "paintball", title: "Paintball" },
        { key: "rafting", title: "Rafting / Kayaking" },
        { key: "skydiving", title: "Skydiving" },
        { key: "football", title: "Soccer" },
        { key: "surfing", title: "Surfing" },
        { key: "swimmingpools", title: "Swimming Pools" }
    ];

    // create a list
    var list = new WinJS.Binding.List();

    WinJS.Namespace.define("data", {
        characters: characters,
        food: food,
        fun: fun,
        outdoors: outdoors
    });
})();
