const changeAnimationDuration = 500;
const resizeAnimationDuration = 1000;

function Marker(poiData) {

    this.poiData = poiData;
    this.isSelected = false;

    this.animationGroupIdle = null;
    this.animationGroupSelected = null;

    const markerLocation = new AR.GeoLocation(poiData.latitude, poiData.longitude, poiData.altitude);

    this.markerDrawableIdle = new AR.ImageDrawable(World.markerDrawableIdle, 2.5, {
        zOrder: 0,
        opacity: 0.8,
        onClick: Marker.prototype.getOnClickTrigger(this)
    });

    this.markerDrawableSelected = new AR.ImageDrawable(World.markerDrawableSelected, 2.5, {
        zOrder: 0,
        opacity: 0.0,
        onClick: null
    });

    this.titleLabels = [];
    let titleStrings = wrapString(poiData.title, 24);

    this.titleLabels.push(new AR.Label(titleStrings[0], 0.4, {
        zOrder: 1,
        verticalAnchor: AR.CONST.VERTICAL_ANCHOR.TOP,
        horizontalAnchor: AR.CONST.HORIZONTAL_ANCHOR.LEFT,
        translate: {
            x: -1.7,
            y: 1
        },
        style: {
            textColor: '#FFFFFF'
        }
    }));

    if (titleStrings.length > 1) {
        this.titleLabels.push(new AR.Label(titleStrings[1], 0.4, {
            zOrder: 1,
            verticalAnchor: AR.CONST.VERTICAL_ANCHOR.TOP,
            horizontalAnchor: AR.CONST.HORIZONTAL_ANCHOR.LEFT,
            translate: {
                x: -1.7,
                y: 0.6
            },
            style: {
                textColor: '#FFFFFF'
            }
        }));
    }

    this.priceLabel = new AR.Label(
        String.fromCodePoint(0x1F4B0) + " " + poiData.price + " / " + poiData.offerType, 0.4, {
            zOrder: 1,
            verticalAnchor: AR.CONST.VERTICAL_ANCHOR.BOTTOM,
            horizontalAnchor: AR.CONST.HORIZONTAL_ANCHOR.LEFT,
            translate: {
                x: -2.2,
                y: -0.35
            },
            style: {
                textColor: '#FFFFFF'
            }
        });

    let numbers = "Rooms: " + poiData.rooms;
    if ("floor" in poiData) {
        numbers = numbers + " / Floor: " + poiData.floor;
    }

    this.numbersLabel = new AR.Label(numbers, 0.3, {
        zOrder: 1,
        verticalAnchor: AR.CONST.VERTICAL_ANCHOR.BOTTOM,
        horizontalAnchor: AR.CONST.HORIZONTAL_ANCHOR.LEFT,
        translate: {
            x: -2.2,
            y: -0.65
        },
        style: {
            textColor: '#FFFFFF'
        }
    });

    this.distanceLabel = new AR.Label("Distance: " + markerLocation.distanceToUser().toFixed() + "m", 0.3, {
        zOrder: 1,
        verticalAnchor: AR.CONST.VERTICAL_ANCHOR.BOTTOM,
        horizontalAnchor: AR.CONST.HORIZONTAL_ANCHOR.LEFT,
        translate: {
            x: -2.2,
            y: -0.96
        },
        style: {
            textColor: '#FFFFFF'
        }
    });

    /*
        The representation of an AR.GeoObject in the radar is defined in its drawables set (second argument of
        AR.GeoObject constructor).
        Once drawables.radar is set the object is also shown on the radar e.g. as an AR.Circle
    */
    this.radarCircle = new AR.Circle(0.03, {
        horizontalAnchor: AR.CONST.HORIZONTAL_ANCHOR.CENTER,
        opacity: 0.8,
        style: {
            fillColor: "#ffffff"
        }
    });

    /*
        Additionally create circles with a different color for the selected state.
    */
    this.radarCircleSelected = new AR.Circle(0.05, {
        horizontalAnchor: AR.CONST.HORIZONTAL_ANCHOR.CENTER,
        opacity: 0.8,
        style: {
            fillColor: "#0066ff"
        }
    });

    this.radardrawables = [];
    this.radardrawables.push(this.radarCircle);

    this.radardrawablesSelected = [];
    this.radardrawablesSelected.push(this.radarCircleSelected);

    let cam = [this.markerDrawableIdle, this.markerDrawableSelected, this.titleLabels[0],
        this.priceLabel, this.numbersLabel, this.distanceLabel];
    if(this.titleLabels.length === 2) {
        cam.push(this.titleLabels[1]);
    }
    this.markerObject = new AR.GeoObject(markerLocation, {
        drawables: {
            cam: cam,
            radar: this.radardrawables
        }
    });
    return this;
}

Marker.prototype.getOnClickTrigger = function (marker) {
    return function () {
        if (!Marker.prototype.isAnyAnimationRunning(marker)) {
            if (marker.isSelected) {
                Marker.prototype.setDeselected(marker);
            } else {
                Marker.prototype.setSelected(marker);
                try {
                    World.onMarkerSelected(marker);
                } catch (err) {
                    alert(err);
                }
            }
        } else {
            AR.logger.debug('a animation is already running');
        }
        return true;
    };
};

/*
    Property Animations allow constant changes to a numeric value/property of an object, dependent on start-value,
    end-value and the duration of the animation. Animations can be seen as functions defining the progress of the
    change on the value. The Animation can be parametrized via easing curves.
*/
Marker.prototype.setSelected = function (marker) {

    marker.isSelected = true;

    /* New: . */
    if (marker.animationGroupSelected === null) {
        let easingCurve = new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        });

        /* Create AR.PropertyAnimation that animates the opacity to 0.0 in order to hide the idle-state-drawable. */
        let hideIdleDrawableAnimation = new AR.PropertyAnimation(
            marker.markerDrawableIdle, "opacity", null, 0.0, changeAnimationDuration);
        /* Create AR.PropertyAnimation that animates the opacity to 1.0 in order to show the selected-state-drawable. */
        let showSelectedDrawableAnimation = new AR.PropertyAnimation(
            marker.markerDrawableSelected, "opacity", null, 1.0, changeAnimationDuration);

        /* Create AR.PropertyAnimation that animates the scaling of the idle-state-drawable to 1.2. */
        let idleDrawableResizeAnimationX = new AR.PropertyAnimation(
            marker.markerDrawableIdle, 'scale.x', null, 1.2, resizeAnimationDuration, easingCurve);
        /* Create AR.PropertyAnimation that animates the scaling of the selected-state-drawable to 1.2. */
        let selectedDrawableResizeAnimationX = new AR.PropertyAnimation(
            marker.markerDrawableSelected, 'scale.x', null, 1.2, resizeAnimationDuration, easingCurve);
        /* Create AR.PropertyAnimation that animates the scaling of the title label to 1.2. */
        let titleLabelResizeAnimationX = new AR.PropertyAnimation(
            marker.titleLabels[0], 'scale.x', null, 1.2, resizeAnimationDuration, easingCurve);
        let title2LabelResizeAnimationX = null;
        if (marker.titleLabels.length > 1) {
            title2LabelResizeAnimationX = new AR.PropertyAnimation(
                marker.titleLabels[1], 'scale.x', null, 1.2, resizeAnimationDuration, easingCurve);
        }
        /* Create AR.PropertyAnimation that animates the scaling of the description label to 1.2. */
        let priceLabelResizeAnimationX = new AR.PropertyAnimation(
            marker.priceLabel, 'scale.x', null, 1.2, resizeAnimationDuration, easingCurve);
        let distanceLabelResizeAnimationX = new AR.PropertyAnimation(
            marker.distanceLabel, 'scale.x', null, 1.2, resizeAnimationDuration, easingCurve);
        let numbersLabelResizeAnimationX = new AR.PropertyAnimation(
            marker.numbersLabel, 'scale.x', null, 1.2, resizeAnimationDuration, easingCurve);

        /* Create AR.PropertyAnimation that animates the scaling of the idle-state-drawable to 1.2. */
        let idleDrawableResizeAnimationY = new AR.PropertyAnimation(
            marker.markerDrawableIdle, 'scale.y', null, 1.2, resizeAnimationDuration, easingCurve);
        /* Create AR.PropertyAnimation that animates the scaling of the selected-state-drawable to 1.2. */
        let selectedDrawableResizeAnimationY = new AR.PropertyAnimation(
            marker.markerDrawableSelected, 'scale.y', null, 1.2, resizeAnimationDuration, easingCurve);
        /* Create AR.PropertyAnimation that animates the scaling of the title label to 1.2. */
        let titleLabelResizeAnimationY = new AR.PropertyAnimation(
            marker.titleLabels[0], 'scale.y', null, 1.2, resizeAnimationDuration, easingCurve);
        let title2LabelResizeAnimationY = null;
        if (marker.titleLabels.length > 1) {
            title2LabelResizeAnimationY = new AR.PropertyAnimation(
                marker.titleLabels[1], 'scale.y', null, 1.2, resizeAnimationDuration, easingCurve);
        }
        /* Create AR.PropertyAnimation that animates the scaling of the description label to 1.2. */
        let priceLabelResizeAnimationY = new AR.PropertyAnimation(
            marker.priceLabel, 'scale.y', null, 1.2, resizeAnimationDuration, easingCurve);
        let distanceLabelResizeAnimationY = new AR.PropertyAnimation(
            marker.distanceLabel, 'scale.y', null, 1.2, resizeAnimationDuration, easingCurve);
        let numbersLabelResizeAnimationY = new AR.PropertyAnimation(
            marker.numbersLabel, 'scale.y', null, 1.2, resizeAnimationDuration, easingCurve);

        let animArray = [
            hideIdleDrawableAnimation,
            showSelectedDrawableAnimation,
            idleDrawableResizeAnimationX,
            selectedDrawableResizeAnimationX,
            titleLabelResizeAnimationX,
            priceLabelResizeAnimationX,
            distanceLabelResizeAnimationX,
            numbersLabelResizeAnimationX,
            idleDrawableResizeAnimationY,
            selectedDrawableResizeAnimationY,
            titleLabelResizeAnimationY,
            priceLabelResizeAnimationY,
            distanceLabelResizeAnimationY,
            numbersLabelResizeAnimationY];
        if (title2LabelResizeAnimationX !== null && title2LabelResizeAnimationY !== null) {
            animArray.push(title2LabelResizeAnimationX);
            animArray.push(title2LabelResizeAnimationY);
        }
        /*
            There are two types of AR.AnimationGroups. Parallel animations are running at the same time,
            sequentials are played one after another.
        */
        marker.animationGroupSelected = new AR.AnimationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, animArray);
    }

    /* Removes function that is set on the onClick trigger of the idle-state marker. */
    marker.markerDrawableIdle.onClick = null;
    /* Sets the click trigger function for the selected state marker. */
    marker.markerDrawableSelected.onClick = Marker.prototype.getOnClickTrigger(marker);

    /* Starts the selected-state animation. */
    marker.animationGroupSelected.start();
};

Marker.prototype.setDeselected = function (marker) {

    marker.isSelected = false;

    if (marker.animationGroupIdle === null) {
        let easingCurve = new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        });

        /* Create AR.PropertyAnimation that animates the opacity to 1.0 in order to show the idle-state-drawable. */
        let showIdleDrawableAnimation = new AR.PropertyAnimation(
            marker.markerDrawableIdle, "opacity", null, 1.0, changeAnimationDuration);
        /* Create AR.PropertyAnimation that animates the opacity to 0.0 in order to hide the selected-state-drawable. */
        let hideSelectedDrawableAnimation = new AR.PropertyAnimation(
            marker.markerDrawableSelected, "opacity", null, 0, changeAnimationDuration);
        /* Create AR.PropertyAnimation that animates the scaling of the idle-state-drawable to 1.0. */
        let idleDrawableResizeAnimationX = new AR.PropertyAnimation(
            marker.markerDrawableIdle, 'scale.x', null, 1.0, resizeAnimationDuration, easingCurve);
        /* Create AR.PropertyAnimation that animates the scaling of the selected-state-drawable to 1.0. */
        let selectedDrawableResizeAnimationX = new AR.PropertyAnimation(
            marker.markerDrawableSelected, 'scale.x', null, 1.0, resizeAnimationDuration, easingCurve);
        /* Create AR.PropertyAnimation that animates the scaling of the title label to 1.0. */
        let titleLabelResizeAnimationX = new AR.PropertyAnimation(
            marker.titleLabels[0], 'scale.x', null, 1.0, resizeAnimationDuration, easingCurve);
        let title2LabelResizeAnimationX = null;
        if (marker.titleLabels.length > 1) {
            title2LabelResizeAnimationX = new AR.PropertyAnimation(
                marker.titleLabels[1], 'scale.x', null, 1.0, resizeAnimationDuration, easingCurve);
        }
        /* Create AR.PropertyAnimation that animates the scaling of the description label to 1.0. */
        let priceLabelResizeAnimationX = new AR.PropertyAnimation(
            marker.priceLabel, 'scale.x', null, 1.0, resizeAnimationDuration, easingCurve);
        let distanceLabelResizeAnimationX = new AR.PropertyAnimation(
            marker.distanceLabel, 'scale.x', null, 1.0, resizeAnimationDuration, easingCurve);
        let numbersLabelResizeAnimationX = new AR.PropertyAnimation(
            marker.numbersLabel, 'scale.x', null, 1.0, resizeAnimationDuration, easingCurve);
        /* Create AR.PropertyAnimation that animates the scaling of the idle-state-drawable to 1.0. */
        let idleDrawableResizeAnimationY = new AR.PropertyAnimation(
            marker.markerDrawableIdle, 'scale.y', null, 1.0, resizeAnimationDuration, easingCurve);
        /* Create AR.PropertyAnimation that animates the scaling of the selected-state-drawable to 1.0. */
        let selectedDrawableResizeAnimationY = new AR.PropertyAnimation(
            marker.markerDrawableSelected, 'scale.y', null, 1.0, resizeAnimationDuration, easingCurve);
        /* Create AR.PropertyAnimation that animates the scaling of the title label to 1.0. */
        let titleLabelResizeAnimationY = new AR.PropertyAnimation(
            marker.titleLabels[0], 'scale.y', null, 1.0, resizeAnimationDuration, easingCurve);
        let title2LabelResizeAnimationY = null;
        if (marker.titleLabels.length > 1) {
            title2LabelResizeAnimationY = new AR.PropertyAnimation(
                marker.titleLabels[1], 'scale.x', null, 1.0, resizeAnimationDuration, easingCurve);
        }
        /* Create AR.PropertyAnimation that animates the scaling of the description label to 1.0. */
        let priceLabelResizeAnimationY = new AR.PropertyAnimation(
            marker.priceLabel, 'scale.y', null, 1.0, resizeAnimationDuration, easingCurve);
        let distanceLabelResizeAnimationY = new AR.PropertyAnimation(
            marker.distanceLabel, 'scale.y', null, 1.0, resizeAnimationDuration, easingCurve);
        let numbersLabelResizeAnimationY = new AR.PropertyAnimation(
            marker.numbersLabel, 'scale.y', null, 1.0, resizeAnimationDuration, easingCurve);

        /*
            There are two types of AR.AnimationGroups. Parallel animations are running at the same time,
            sequentials are played one after another. This example uses a parallel AR.AnimationGroup.
        */
        let animArray = [
            showIdleDrawableAnimation,
            hideSelectedDrawableAnimation,
            idleDrawableResizeAnimationX,
            selectedDrawableResizeAnimationX,
            titleLabelResizeAnimationX,
            priceLabelResizeAnimationX,
            distanceLabelResizeAnimationX,
            numbersLabelResizeAnimationX,
            idleDrawableResizeAnimationY,
            selectedDrawableResizeAnimationY,
            titleLabelResizeAnimationY,
            priceLabelResizeAnimationY,
            distanceLabelResizeAnimationY,
            numbersLabelResizeAnimationY
        ];
        if(title2LabelResizeAnimationX !== null && title2LabelResizeAnimationY !== null) {
            animArray.push(title2LabelResizeAnimationX);
            animArray.push(title2LabelResizeAnimationY);
        }
        marker.animationGroupIdle = new AR.AnimationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, animArray);
    }

    /* Sets the click trigger function for the idle state marker. */
    marker.markerDrawableIdle.onClick = Marker.prototype.getOnClickTrigger(marker);
    /* Removes function that is set on the onClick trigger of the selected-state marker. */
    marker.markerDrawableSelected.onClick = null;

    /* Starts the idle-state animation. */
    marker.animationGroupIdle.start();
};

Marker.prototype.isAnyAnimationRunning = function (marker) {

    if (marker.animationGroupIdle === null || marker.animationGroupSelected === null) {
        return false;
    } else {
        return marker.animationGroupIdle.isRunning() === true || marker.animationGroupSelected.isRunning() === true;
    }
};

/* Will truncate all strings longer than given max-length "n". */
String.prototype.trunc = function (n) {
    return this.substr(0, n - 1) + (this.length > n ? '...' : '');
};

/* Helper function to split long String to two Strings. */
wrapString = function (text, wrapLength) {
    let array = [];
    if(text.length > wrapLength) {
        let char = text.charAt(wrapLength);
        if(char === ' ') {
            text = text.slice(0, wrapLength) + text.slice(wrapLength+1, text.length);
            array.push(text.substr(0, wrapLength));
            if(text.length < 2*wrapLength) {
                let rest = text.length - wrapLength;
                array.push(text.substr(wrapLength, rest));
            } else {
                array.push(text.substr(wrapLength, text.length - wrapLength).trunc(wrapLength));
            }
        } else {
            let spaceIndex = text.substr(0, wrapLength).lastIndexOf(' ');
            text = text.slice(0, spaceIndex) + text.slice(spaceIndex+1, text.length);
            array.push(text.substr(0, spaceIndex));
            if(text.length < spaceIndex + wrapLength) {
                let rest = text.length - spaceIndex;
                array.push(text.substr(spaceIndex, rest));
            } else {
                array.push(text.substr(spaceIndex, text.length - spaceIndex).trunc(wrapLength));
            }
        }
    } else {
        array.push(text);
    }
    return array;
};