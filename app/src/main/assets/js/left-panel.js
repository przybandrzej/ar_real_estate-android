function panelAddPlaceToList(text) {
    let li = document.createElement('li');
    li.appendChild(document.createTextNode(text));
    document.getElementById("lp-content-places").appendChild(li);
}

function showPanel() {
    $("#lp-content-range-value").html(World.maxRangeMeters);
    let count = World.getNumberOfVisiblePlaces();
    $("#lp-content-places-count-value").html((count !== 1) ? (count + " places") : (count + " place"));
    handlePanelMovements();
    /* Open panel. */
    $("#panel-distance").trigger("updatelayout");
    $("#panel-distance").panel("open", 1234);
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