/* Implementation of AR-Experience (aka "World"). */
let World = {

    maxRangeMeters: 300,

    /*
        User's latest known location, accessible via userLocation.latitude, userLocation.longitude,
         userLocation.altitude.
     */
    userLocation: null,

    offersJson: null,

    /* You may request new data from server periodically, however: in this sample data is only requested once. */
    isRequestingData: false,

    /* True once data was fetched. */
    initiallyLoadedData: false,

    /* Different POI-Marker assets. */
    markerDrawableIdle: null,
    markerDrawableSelected: null,
    markerDrawableDirectionIndicator: null,

    /* List of AR.GeoObjects that are currently shown in the scene / World. */
    markerList: [],

    /* the last selected marker. */
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
        World.markerDrawableIdle = new AR.ImageResource("assets/marker_idle.png", {
            onError: World.onError
        });
        World.markerDrawableSelected = new AR.ImageResource("assets/marker_selected.png", {
            onError: World.onError
        });
        World.markerDrawableDirectionIndicator = new AR.ImageResource("assets/indi.png", {
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
                "description": poiArray[currentPlaceNr].description
            };
            poisInfo = poisInfo + '</br>' + poiArray[currentPlaceNr].location.latitude
                + ', ' + poiArray[currentPlaceNr].location.longitude;
            World.markerList.push(new Marker(singlePoi));
        }
        World.offersJson = poiData;

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
            /*
                Update placemark distance information frequently, you may also update distances only every 10m with
                some more effort.
             */
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

    /*
        It may make sense to display POI details in your native style.
        In this sample a very simple native screen opens when user presses the 'More' button in HTML.
        This demoes the interaction between JavaScript and native code.
    */
    /* User clicked "More" button in POI-detail panel -> fire event to open native screen. */
    onPoiDetailMoreButtonClicked: function onPoiDetailMoreButtonClickedFn() {
        const currentMarker = World.currentMarker;
        const markerSelectedJSON = {
            action: "present_poi_details",
            id: currentMarker.poiData.id
        };
        //The sendJSONObject method can be used to send data from javascript to the native code.
        AR.platform.sendJSONObject(markerSelectedJSON);
    },

    /* Fired when user pressed maker in cam.
    * TODO change to a page */
    onMarkerSelected: function onMarkerSelectedFn(marker) {
        World.currentMarker = marker;

        $("#poi-detail-title").html(marker.poiData.title);
        $("#poi-detail-description").html(marker.poiData.description);

        if (marker.distanceToUser === undefined) {
            marker.distanceToUser = marker.markerObject.locations[0].distanceToUser();
        }

        let distanceToUserValue = (marker.distanceToUser > 999) ?
            ((marker.distanceToUser / 1000).toFixed(2) + " km") :
            (Math.round(marker.distanceToUser) + " m");

        $("#poi-detail-distance").html(distanceToUserValue);

        /* Show panel. */
        $("#panel-poidetail").panel("open", 123);

        $(".ui-panel-dismiss").unbind("mousedown");

        /* Deselect AR-marker when user exits detail screen div. */
        $("#panel-poidetail").on("panelbeforeclose", function (event, ui) {
            World.currentMarker.setDeselected(World.currentMarker);
        });
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
        $("#panel-distance-places").html((placesInRange != 1) ?
            (placesInRange + " Places") : (placesInRange + " Place"));

        World.updateStatusMessage((placesInRange != 1) ?
            (placesInRange + " places loaded") : (placesInRange + " place loaded"));

        /* Update culling distance, so only places within given range are rendered. */
        AR.context.scene.cullingDistance = Math.max(World.maxRangeMeters, 1);

        /* Update radar's maxDistance so radius of radar is updated too. */
        PoiRadar.setMaxDistance(Math.max(World.maxRangeMeters, 1));
    },

    /* Returns number of places with same or lower distance than given range. */
    getNumberOfVisiblePlacesInRange: function getNumberOfVisiblePlacesInRangeFn(maxRangeMeters) {
        /* Sort markers by distance. */
        World.markerList.sort(World.sortByDistanceSorting);

        /* Loop through list and stop once a placemark is out of range ( -> very basic implementation ). */
        for (let i = 0; i < World.markerList.length; i++) {
            if (World.markerList[i].distanceToUser > maxRangeMeters) {
                return i;
            }
        }
        /* In case no placemark is out of range -> all are visible. */
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

    /* Display range slider. */
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