package com.arlab.realestate.android.util.location;

import android.location.Location;

public interface BaseLocationStrategy {

    void startListeningForLocationChanges(LocationChangesListener locationListener);

    void stopListeningForLocationChanges();

    void setPeriodicalUpdateEnabled(boolean enable);

    void setPeriodicalUpdateInterval(long time);

    void setPeriodicalUpdateFastestInterval(long time);

    void setDisplacement(long displacement);

    Location getLastLocation();

    void initLocationClient();

    void startLocationUpdates();

}
