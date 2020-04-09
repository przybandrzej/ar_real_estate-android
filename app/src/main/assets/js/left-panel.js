let isPanelOpen = false;

function showPanel() {
    isPanelOpen = true;
    $("#lp-content-places").empty();
    $("#lp-content-range-value").html(World.maxRangeMeters);
    let count = World.getNumberOfVisiblePlaces();
    $("#lp-content-places-count-value").html((count !== 1) ? (count + " places") : (count + " place"));
    handlePanelMovements();
    /* Open panel. */
    $("#panel-distance").trigger("updatelayout");
    $("#panel-distance").panel("open", 1234);
    $("#panel-distance").on("panelbeforeclose", function(event, ui) {
        isPanelOpen = false;
    });
    World.updatePanelValues();
    World.getPlacesLabelCall();
}

function handlePanelMovements() {

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
}

function panelAddPlaceToList(text) {
    let li = document.createElement('li');
    li.appendChild(document.createTextNode(text));
    document.getElementById("lp-content-places").appendChild(li);
}

function panelPopulateUserLocation() {
    $("#lp-content-userlocation-latitude").html(World.userLocation.latitude);
    $("#lp-content-userlocation-longitude").html(World.userLocation.longitude);
    $("#lp-content-userlocation-altitude").html(World.userLocation.altitude);
    $("#lp-content-userlocation-accuracy").html(World.userLocation.accuracy);
}

/* This is called from Native Android code after the World.updatePanelValues() to receive the user's current addresses. */
function panelSetUserAddress(value) {
    const json = JSON.parse(value);
    $("#lp-content-userlocation-address").html(json.address);
}