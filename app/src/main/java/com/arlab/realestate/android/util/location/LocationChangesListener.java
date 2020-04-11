package com.arlab.realestate.android.util.location;

import android.location.Location;

public interface LocationChangesListener {
    void onLocationChanged(Location location);
    void onConnected();
    void onConnectionStatusChanged();
    void onFailure(String failureMessage);
}
