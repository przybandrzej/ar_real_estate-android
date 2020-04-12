package com.arlab.realestate.android.util.location;

import android.location.Location;

public interface LocationChangesListener {
    void onLocationChanged(Location location);
    void onLocationProviderEnabled(String provider);
    void onLocationProviderStatusChanged(String provider, int status);
    void onLocationProviderDisabled(String failureMessage);
}
