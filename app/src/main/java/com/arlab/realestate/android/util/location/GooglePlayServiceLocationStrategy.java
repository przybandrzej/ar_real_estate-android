package com.arlab.realestate.android.util.location;

import android.annotation.SuppressLint;
import android.content.Context;
import android.location.Location;
import android.os.Looper;
import androidx.annotation.NonNull;
import com.google.android.gms.location.*;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;

public class GooglePlayServiceLocationStrategy implements BaseLocationStrategy, LocationListener {

  private Context mAppContext;
  private Location mLastLocation;
  private LocationChangesListener mLocationListener;
  private LocationRequest mLocationRequest;
  private FusedLocationProviderClient mFusedLocationClient;
  private LocationCallback locationCallback;
  private boolean mUpdatePeriodically = true;
  private static GooglePlayServiceLocationStrategy INSTANCE;
  private static long UPDATE_INTERVAL = 0; // milliseconds
  private static long FASTEST_INTERVAL = 0; // milliseconds
  private static long DISPLACEMENT = 0; // meters
  private static final String TAG = "GooglePlayServiceLocation";

  private GooglePlayServiceLocationStrategy(Context context) {
    this.mAppContext = context;
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

  @Override
  public void startListeningForLocationChanges(LocationChangesListener locationListener) {
    this.mLocationListener = locationListener;
    startLocationUpdates();
  }

  @Override
  public void stopListeningForLocationChanges() {
    mLocationListener = null;
    if(mUpdatePeriodically) {
      stopLocationUpdates();
    }
  }

  @Override
  public void initLocationClient() {
    mLocationRequest = createLocationRequest();
    mFusedLocationClient = LocationServices.getFusedLocationProviderClient(mAppContext);
    locationCallback = createLocationCallback();
  }

  protected LocationCallback createLocationCallback() {
    return new LocationCallback() {
      @Override
      public void onLocationResult(LocationResult locationResult) {
        if(locationResult == null) {
          return;
        }
        for(Location location : locationResult.getLocations()) {
          onLocationChanged(location);
        }
      }
    };
  }

  @SuppressLint("MissingPermission")
  @Override
  public void startLocationUpdates() {
    if(mFusedLocationClient != null) {
      mFusedLocationClient.requestLocationUpdates(mLocationRequest, locationCallback, Looper.myLooper());
    }
  }

  protected LocationRequest createLocationRequest() {
    LocationRequest locationRequest = new LocationRequest();
    locationRequest.setInterval(UPDATE_INTERVAL);
    locationRequest.setFastestInterval(FASTEST_INTERVAL);
    locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
    locationRequest.setSmallestDisplacement(DISPLACEMENT);
    return locationRequest;
  }

  protected void stopLocationUpdates() {
    if(mFusedLocationClient != null) {
      mFusedLocationClient.removeLocationUpdates(locationCallback);
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

  @SuppressLint("MissingPermission")
  @Override
  public Location getLastLocation() {
    if(this.mLastLocation == null) {
      if(mFusedLocationClient != null) {
        mFusedLocationClient.getLastLocation().addOnCompleteListener(new OnCompleteListener<Location>() {
          @Override
          public void onComplete(@NonNull Task<Location> task) {
            if (task.isSuccessful() && task.getResult() != null) {
              mLastLocation = task.getResult();
            }
          }
        });
      } else {
        this.mLastLocation = LocationManagerStrategy.getInstance(mAppContext).getLastLocation();
      }
    }
    LocationUtils.LastKnownLocaiton = mLastLocation;
    return this.mLastLocation;
  }
}
