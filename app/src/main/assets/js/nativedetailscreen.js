/* Implementation of AR-Experience (aka "World"). */
let World = {

    maxRangeMeters: 200,
    minScalingDistance: 10,
    scalingFactor: 0.25,
    userLocation: null,
    isRequestingData: false,
    initiallyLoadedData: false,

    markerDrawableIdle: null,
    markerDrawableSelected: null,

    markerList: [],
    currentMarker: null,

    locationUpdateCounter: 0,
    updatePlacemarkDistancesEveryXLocationUpdates: 2,

    /* Reload places from content source. */
    reloadPlaces: function reloadPlacesFn() {
        if (!World.isRequestingData) {
            if (World.userLocation) {
                World.requestDataFromLocal();
            } else {
                World.updateStatusMessage('Unknown user-location.', true);
            }
        } else {
            World.updateStatusMessage('Already requesting places...', true);
        }
    },

    /* Request POI data. */
    requestDataFromLocal: function requestDataFromLocalFn() {
        World.isRequestingData = true;
        World.updateStatusMessage('Requesting places...');
        World.loadPoisFromJsonData(myJsonData);
        World.isRequestingData = false;
        /* Update culling distance, so only places within given range are rendered. */
        AR.context.scene.cullingDistance = World.maxRangeMeters;
        /* Update Marker's scaling factors and distance. */
        AR.context.scene.maxScalingDistance = World.maxRangeMeters;
        AR.context.scene.minScalingDistance = World.minScalingDistance;
        AR.context.scene.scalingFactor = World.scalingFactor;
        /* Update radar's maxDistance so radius of radar is updated too. */
        PoiRadar.setMaxDistance(World.maxRangeMeters);
    },

    /* Called to inject new POI data. */
    loadPoisFromJsonData: function loadPoisFromJsonDataFn(poiData) {
        /* Destroys all existing AR-Objects (markers & radar). */
        AR.context.destroyAll();

        /* Show radar & set click-listener. */
        PoiRadar.show();
        $('#radarContainer').unbind('click');
        $("#radarContainer").click(PoiRadar.clickedRadar);

        /* Empty list of visible markers. */
        World.markerList = [];

        /* Start loading marker assets. */
        World.markerDrawableIdle = new AR.ImageResource("assets/marker.png", {
            onError: World.onError
        });
        World.markerDrawableSelected = new AR.ImageResource("assets/marker_selected.png", {
            onError: World.onError
        });

        let poisInfo = 'Places loaded:';
        let poiArray = poiData.offers;
        /* Loop through POI-information and create an AR.GeoObject (=Marker) per POI. */
        for (let currentPlaceNr = 0; currentPlaceNr < poiArray.length; currentPlaceNr++) {
            let singlePoi = {
                "id": poiArray[currentPlaceNr].id,
                "latitude": parseFloat(poiArray[currentPlaceNr].location.latitude),
                "longitude": parseFloat(poiArray[currentPlaceNr].location.longitude),
                "altitude": parseFloat(poiArray[currentPlaceNr].location.altitude),
                "title": poiArray[currentPlaceNr].title,
                "rooms": poiArray[currentPlaceNr].rooms,
                "area": parseFloat(poiArray[currentPlaceNr].area) + "m\u00B2",
                "offerType": poiArray[currentPlaceNr].offerType,
                "price": poiArray[currentPlaceNr].pricing.price + " " + poiArray[currentPlaceNr].pricing.currency
            };
            if("floor" in poiArray[currentPlaceNr]) {
                singlePoi["floor"] = parseInt(poiArray[currentPlaceNr].floor)
            }

            poisInfo = poisInfo + '</br>' + poiArray[currentPlaceNr].location.latitude
                + ', ' + poiArray[currentPlaceNr].location.longitude;
            World.markerList.push(new Marker(singlePoi));
        }
        World.updateDistanceToUserValues();
        World.updateStatusMessage(poisInfo);
    },

    /* Location updates, fired every time you call architectView.setLocation() in native environment. */
    locationChanged: function locationChangedFn(lat, lon, alt, acc) {
        World.userLocation = {
            'latitude': lat,
            'longitude': lon,
            'altitude': alt,
            'accuracy': acc
        };

        /* Request data if not already present. */
        if (!World.initiallyLoadedData) {
            World.requestDataFromLocal();
            World.initiallyLoadedData = true;
        } else if (World.locationUpdateCounter === 0) {
            World.updateDistanceToUserValues();
        }

        /* Helper used to update placemark information every now and then (e.g. every 10 location upadtes fired). */
        World.locationUpdateCounter =
            (++World.locationUpdateCounter % World.updatePlacemarkDistancesEveryXLocationUpdates);
    },

    /*
        Sets/updates distances of all makers so they are available way faster than calling (time-consuming)
        distanceToUser() method all the time.
     */
    updateDistanceToUserValues: function updateDistanceToUserValuesFn() {
        for (let i = 0; i < World.markerList.length; i++) {
            World.markerList[i].distanceToUser = World.markerList[i].markerObject.locations[0].distanceToUser();
        }
    },

    /* Updates status message shown in small "i"-button aligned bottom center. */
    updateStatusMessage: function updateStatusMessageFn(message, isWarning) {
        let themeToUse = isWarning ? "e" : "c";
        let iconToUse = isWarning ? "alert" : "info";
        $("#status-message").html(message);
        $("#popupInfoButton").buttonMarkup({
            theme: themeToUse,
            icon: iconToUse
        });
    },

    /* Fired when user pressed maker in cam. */
    onMarkerSelected: function onMarkerSelectedFn(marker) {
        World.currentMarker = marker;
        const markerSelectedJSON = {
                    action: "present_poi_details",
                    id: World.currentMarker.poiData.id
                };
        //The sendJSONObject method can be used to send data from javascript to the native code.
        AR.platform.sendJSONObject(markerSelectedJSON);
    },

    onOfferDetailScreenDestroyed: function onOfferDetailScreenDestroyedFn() {
        if(World.currentMarker !== null) {
            World.currentMarker.setDeselected(World.currentMarker);
        }
    },

    /* Screen was clicked but no geo-object was hit. */
    // TODO
    onScreenClick: function onScreenClickFn() {
        if (World.currentMarker) {
            World.currentMarker.setDeselected(World.currentMarker);
        }
    },

    /* Updates values shown in "range panel". */
    updateRangeValues: function updateRangeValuesFn() {
        let placesInRange = World.getNumberOfVisiblePlacesInRange(World.maxRangeMeters);

        /* Update UI labels accordingly. */
        $("#panel-distance-value").html(World.maxRangeMeters);
        $("#panel-distance-places").html((placesInRange !== 1) ?
            (placesInRange + " Places") : (placesInRange + " Place"));

        World.updateStatusMessage((placesInRange !== 1) ?
            (placesInRange + " places loaded") : (placesInRange + " place loaded"));
    },

    /* Returns number of places with same or lower distance than given range. */
    getNumberOfVisiblePlacesInRange: function getNumberOfVisiblePlacesInRangeFn(maxRangeMeters) {
        World.markerList.sort(World.sortByDistanceSorting);
        for (let i = 0; i < World.markerList.length; i++) {
            if (World.markerList[i].distanceToUser > maxRangeMeters) {
                return i;
            }
        }
        return World.markerList.length;
    },

    handlePanelMovements: function handlePanelMovementsFn() {

        $("#panel-distance").on("panelclose", function (event, ui) {
            $("#radarContainer").addClass("radarContainer_left");
            $("#radarContainer").removeClass("radarContainer_right");
            PoiRadar.updatePosition();
        });

        $("#panel-distance").on("panelopen", function (event, ui) {
            $("#radarContainer").removeClass("radarContainer_left");
            $("#radarContainer").addClass("radarContainer_right");
            PoiRadar.updatePosition();
        });
    },

    /* Display range panel. */
    showRange: function showRangeFn() {
        World.updateRangeValues();
        World.handlePanelMovements();
        /* Open panel. */
        $("#panel-distance").trigger("updatelayout");
        $("#panel-distance").panel("open", 1234);
    },

    /* Helper to sort places by distance. */
    sortByDistanceSorting: function sortByDistanceSortingFn(a, b) {
        return a.distanceToUser - b.distanceToUser;
    },

    /* Helper to sort places by distance, descending. */
    sortByDistanceSortingDescending: function sortByDistanceSortingDescendingFn(a, b) {
        return b.distanceToUser - a.distanceToUser;
    },

    onError: function onErrorFn(error) {
        alert(error);
    }
};

/* Forward locationChanges to custom function. */
AR.context.onLocationChanged = World.locationChanged;

/* Forward clicks in empty area to World. */
AR.context.onScreenClick = World.onScreenClick;