package com.arlab.realestate.android.util.location;

import android.annotation.SuppressLint;
import android.content.Context;
import android.location.Location;
import android.os.Bundle;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationListener;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationServices;

public class GooglePlayServiceLocationStrategy
    implements BaseLocationStrategy,
    GoogleApiClient.ConnectionCallbacks,
    GoogleApiClient.OnConnectionFailedListener,
    LocationListener {

  private Context mAppContext;
  private Location mLastLocation;

  private GoogleApiClient mGoogleApiClient;
  private LocationChangesListener mLocationListener;
  private boolean mUpdatePeriodically = true;
  private LocationRequest mLocationRequest;
  FusedLocationProviderClient mFusedLocationClient;
  private static GooglePlayServiceLocationStrategy INSTANCE;
  // Location updates intervals in sec
  private static long UPDATE_INTERVAL = 0; // 1 sec
  private static long FASTEST_INTERVAL = 0; // 0.5 sec
  private static long DISPLACEMENT = 0; // meters

  private static final String TAG = "GooglePlayServiceLocation";

  public GooglePlayServiceLocationStrategy(Context context) {
    this.mAppContext = context;
  }

  @Override
  public void startListeningForLocationChanges(LocationChangesListener locationListener) {
    this.mLocationListener = locationListener;
    if(mGoogleApiClient != null && !mGoogleApiClient.isConnected()) {
      mGoogleApiClient.connect();
    }
  }

  @Override
  public void stopListeningForLocationChanges() {
    mLocationListener = null;
    if(mGoogleApiClient.isConnected()) {
      if(mUpdatePeriodically) {
        stopLocationUpdates();
      }
      mGoogleApiClient.disconnect();
    }
  }


  public static BaseLocationStrategy getInstance(Context context) {
    if(INSTANCE == null) {
      INSTANCE = new GooglePlayServiceLocationStrategy(context);
      INSTANCE.initLocationClient();
    }
    return INSTANCE;
  }

  @Override
  public void setPeriodicalUpdateEnabled(boolean enable) {
    this.mUpdatePeriodically = enable;
  }

  @Override
  public void setPeriodicalUpdateInterval(long time) {
    UPDATE_INTERVAL = time;
    if(time < FASTEST_INTERVAL) {
      FASTEST_INTERVAL = time / 2;
    }
  }

  @Override
  public void setPeriodicalUpdateFastestInterval(long time) {
    FASTEST_INTERVAL = time;
    if(time > UPDATE_INTERVAL) {
      UPDATE_INTERVAL = time * 2;
    }
  }

  @Override
  public void setDisplacement(long displacement) {
    this.DISPLACEMENT = displacement;

  }

  @SuppressLint("MissingPermission")
  @Override
  public Location getLastLocation() {
    if(this.mLastLocation == null) {
      if(mGoogleApiClient != null && mGoogleApiClient.isConnected()) {
        this.mLastLocation = LocationServices.FusedLocationApi.getLastLocation(mGoogleApiClient);
      } else {
        this.mLastLocation = LocationManagerStrategy.getInstance(mAppContext).getLastLocation();
      }
    }
    LocationUtils.LastKnownLocaiton = mLastLocation;
    return this.mLastLocation;
  }

  @Override
  public void initLocationClient() {
    mGoogleApiClient = buildGoogleApiClient();
    mLocationRequest = createLocationRequest();
    mFusedLocationClient = LocationServices.getFusedLocationProviderClient(mAppContext);
  }

  protected synchronized GoogleApiClient buildGoogleApiClient() {
    return new GoogleApiClient
        .Builder(mAppContext)
        .addConnectionCallbacks(this)
        .addOnConnectionFailedListener(this)
        .addApi(LocationServices.API).build();
  }

  @SuppressLint("MissingPermission")
  @Override
  public void onConnected(Bundle bundle) {
    mLastLocation = LocationServices.FusedLocationApi.getLastLocation(mGoogleApiClient);
    if(mUpdatePeriodically || mLastLocation == null) {
      startLocationUpdates();
    }
    if(mLocationListener != null) {
      mLocationListener.onConnected();
    }
  }

  @Override
  public void onConnectionSuspended(int i) {
    if(mLocationListener != null) {
      mLocationListener.onConnectionStatusChanged();
    }
  }

  @Override
  public void onConnectionFailed(ConnectionResult connectionResult) {
    if(mLocationListener != null) {
      mLocationListener.onFailure("Failed to connect");
    }
  }

  /**
   * Starting the location updates
   */
  @SuppressLint("MissingPermission")
  @Override
  public void startLocationUpdates() {
    if(mGoogleApiClient.isConnected()) {
      LocationServices.FusedLocationApi.requestLocationUpdates(mGoogleApiClient, mLocationRequest, this);
    }
  }

  /**
   * Creating location request object
   */
  protected LocationRequest createLocationRequest() {
    LocationRequest locationRequest = new LocationRequest();
    locationRequest.setInterval(UPDATE_INTERVAL);
    locationRequest.setFastestInterval(FASTEST_INTERVAL);
    locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
    locationRequest.setSmallestDisplacement(DISPLACEMENT);
    return locationRequest;
  }

  /**
   * Stopping location updates
   */
  protected void stopLocationUpdates() {
    if(mGoogleApiClient != null && mGoogleApiClient.isConnected()) {
      LocationServices.FusedLocationApi.removeLocationUpdates(mGoogleApiClient, this);
    }
  }

  @Override
  public void onLocationChanged(Location location) {
    if(!mUpdatePeriodically) {
      stopLocationUpdates();
    }
    mLastLocation = location;
    if(mLocationListener != null) {
      mLocationListener.onLocationChanged(location);
    }
  }
}
