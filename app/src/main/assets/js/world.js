const whereYouAre = "Trying to find out where you are...";
const requestingData = "Requesting Data...";
const unknownLocation = 'Unknown user-location.';
const requestPending = 'Already requesting places...';
const clear = '';

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
    updatePlacemarkDistancesEveryXLocationUpdates: 1,

    reloadPlaces: function reloadPlacesFn() {
        if (!World.isRequestingData) {
            if (World.userLocation) {
                World.requestDataFromLocal();
            } else {
                World.updateStatusMessage(unknownLocation, 2000);
            }
        } else {
            World.updateStatusMessage(requestPending, 1000);
        }
    },

    requestDataFromLocal: function requestDataFromLocalFn() {
        World.isRequestingData = true;
        World.updateStatusMessage(requestingData);
        World.loadPoisFromJsonData(myJsonData);
        World.isRequestingData = false;
        World.initiallyLoadedData = true;
        World.updateStatusMessage(clear, 0);
    },

    loadPoisFromJsonData: function loadPoisFromJsonDataFn(poiData) {
        /* Destroys all existing AR-Objects (markers & radar). */
        AR.context.destroyAll();

        /* Show radar & set click-listener. */
        PoiRadar.show();
        $('#radarContainer').unbind('click');
        $("#radarContainer").click(PoiRadar.clickedRadar);

        /* Update culling distance, so only places within given range are rendered. */
        AR.context.scene.cullingDistance = World.maxRangeMeters;
        /* Update Marker's scaling factors and distance. */
        AR.context.scene.maxScalingDistance = World.maxRangeMeters;
        AR.context.scene.minScalingDistance = World.minScalingDistance;
        AR.context.scene.scalingFactor = World.scalingFactor;
        /* Update radar's maxDistance so radius of radar is updated too. */
        PoiRadar.setMaxDistance(World.maxRangeMeters);

        /* Empty list of visible markers. */
        World.markerList = [];

        /* Start loading marker assets. */
        World.markerDrawableIdle = new AR.ImageResource("assets/marker.png", {
            onError: World.onError
        });
        World.markerDrawableSelected = new AR.ImageResource("assets/marker_selected.png", {
            onError: World.onError
        });
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
            if ("floor" in poiArray[currentPlaceNr]) {
                singlePoi["floor"] = parseInt(poiArray[currentPlaceNr].floor)
            }
            World.markerList.push(new Marker(singlePoi));
        }
        World.updateDistanceToUserValues();
    },

    /* Location updates, fired every time architectView.setLocation() is called in native environment. */
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
        } else {
            World.updateDistanceToUserValues();
            World.updatePanelValues();
        }
    },

    updatePanelValues: function updatePanelValuesFn() {
        if (isPanelOpen) {
            panelPopulateUserLocation();
            const JSONcall = {action: "user_address_get"};
            AR.platform.sendJSONObject(JSONcall);
        }
    },

    updateDistanceToUserValues: function updateDistanceToUserValuesFn() {
        for (let i = 0; i < World.markerList.length; i++) {
            let marker = World.markerList[i];
            let distance = marker.markerObject.locations[0].distanceToUser();
            marker.distanceToUser = distance;
            marker.updateDistanceLabel(marker, distance);
        }
    },

    onMarkerSelected: function onMarkerSelectedFn(marker) {
        World.currentMarker = marker;
        const markerSelectedJSON = {
            action: "present_poi_details",
            id: World.currentMarker.poiData.id
        };
        AR.platform.sendJSONObject(markerSelectedJSON);
    },

    /* This is called from Native Android code after the Offer's Detail screen is closed. */
    onOfferDetailScreenDestroyed: function onOfferDetailScreenDestroyedFn() {
        if (World.currentMarker !== null) {
            World.currentMarker.setDeselected(World.currentMarker);
        }
    },

    getPlacesLabelCall: function getPlacesLabelCallFn() {
        const JSONcall = {
            action: "places_labels_get"
        };
        AR.platform.sendJSONObject(JSONcall);
    },

    /* This is called from Native Android code after the World.getPlacesLabelCall() to receive the addresses of the offers. */
    onPlacesAddressesReceived: function onPlacesAddressesReceivedFn(text) {
        const json = JSON.parse(text);
        World.markerList.sort(World.sortByDistanceSorting);

        for (let i = 0; i < World.markerList.length; i++) {
            const marker = World.markerList[i];
            if (marker.distanceToUser > World.maxRangeMeters) {
                break;
            }
            panelAddPlaceToList(json.items.filter(function (chain) {
                return chain.offerId === marker.poiData.id;
            })[0].address);
        }
    },

    getNumberOfVisiblePlaces: function getNumberOfVisiblePlacesFn() {
        World.markerList.sort(World.sortByDistanceSorting);
        for (let i = 0; i < World.markerList.length; i++) {
            if (World.markerList[i].distanceToUser > World.maxRangeMeters) {
                return i;
            }
        }
        return World.markerList.length;
    },

    /* Screen was clicked but no geo-object was hit. */
    onScreenClick: function onScreenClickFn() {
        if (World.currentMarker) {
            World.currentMarker.setDeselected(World.currentMarker);
        }
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
    },

    /* Updates status message shown in the bottom right corner. */
    updateStatusMessage: function updateStatusMessageFn(message, time) {
        $("#status-message").html(message);
        if(time !== 0) {
            setTimeout(function () {
                $("#status-message").html(clear);
            }, 5000);
        }
    },

    setMessageAsync: async function setMessageAsyncFn(time) {
        await new Promise(resolve => {
            setTimeout(function () {
                resolve()
            }, time);
        });
    }
};

/* Forward locationChanges to custom function. */
AR.context.onLocationChanged = World.locationChanged;

/* Forward clicks in empty area to World. */
AR.context.onScreenClick = World.onScreenClick;

World.updateStatusMessage(whereYouAre, 0);
