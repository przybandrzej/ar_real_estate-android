package com.arlab.realestate.android.activity;

import android.hardware.SensorManager;
import android.location.Location;
import android.location.LocationListener;
import android.os.Bundle;
import android.util.Log;
import android.view.WindowManager;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.arlab.realestate.R;
import com.arlab.realestate.android.util.ArchitectJavaScriptListener;
import com.arlab.realestate.android.util.CameraConfig;
import com.arlab.realestate.android.util.LocationProvider;
import com.wikitude.architect.ArchitectStartupConfiguration;
import com.wikitude.architect.ArchitectView;

import java.io.IOException;

public class ArActivity extends AppCompatActivity implements LocationListener {

    private static final String TAG = ArActivity.class.getSimpleName();

    private static final String AR_EXPERIENCE = "index.html";

    protected ArchitectView architectView;

    private LocationProvider locationProvider;

    private ArchitectJavaScriptListener javaScriptListener;

    /**
     * Error callback of the LocationProvider, noProvidersEnabled is called when neither location over GPS nor
     * location over the network are enabled by the device.
     */
    private final LocationProvider.ErrorCallback errorCallback = new LocationProvider.ErrorCallback() {
        @Override
        public void noProvidersEnabled() {
            Toast.makeText(ArActivity.this,
                    R.string.no_location_provider,
                    Toast.LENGTH_LONG)
                    .show();
        }
    };

    /**
     * The ArchitectView.SensorAccuracyChangeListener notifies of changes in the accuracy of the compass.
     * This can be used to notify the user that the sensors need to be recalibrated.
     *
     * This listener has to be registered after onCreate and unregistered before onDestroy in the ArchitectView.
     */
    private final ArchitectView.SensorAccuracyChangeListener sensorAccuracyChangeListener = new ArchitectView.SensorAccuracyChangeListener() {
        @Override
        public void onCompassAccuracyChanged(int accuracy) {
            if ( accuracy < SensorManager.SENSOR_STATUS_ACCURACY_MEDIUM) { // UNRELIABLE = 0, LOW = 1, MEDIUM = 2, HIGH = 3
                Toast.makeText(ArActivity.this,
                        R.string.compass_accuracy_low,
                        Toast.LENGTH_LONG )
                        .show();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView.setWebContentsDebuggingEnabled(true);

        locationProvider = new LocationProvider(this, this, errorCallback);

        final CameraConfig cameraConfig = new CameraConfig();

        final ArchitectStartupConfiguration config = new ArchitectStartupConfiguration();
        config.setLicenseKey(getString(R.string.WikitudeSDK_license_ley));
        config.setCameraPosition(cameraConfig.getCameraPosition());
        config.setCameraResolution(cameraConfig.getCameraResolution());
        config.setCameraFocusMode(cameraConfig.getCameraFocusMode());
        config.setCamera2Enabled(cameraConfig.isCamera2Enabled());

        architectView = new ArchitectView(this);
        architectView.onCreate(config);

        setContentView(architectView);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        javaScriptListener = new ArchitectJavaScriptListener(this, architectView);
        javaScriptListener.onCreate();
    }

    @Override
    protected void onPostCreate(@Nullable Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);
        architectView.onPostCreate();

        try {
            architectView.load(AR_EXPERIENCE);
        } catch (IOException e) {
            Toast.makeText(this, getString(R.string.error_loading_ar_experience), Toast.LENGTH_SHORT).show();
            Log.e(TAG, "Exception while loading arExperience " + AR_EXPERIENCE + ".", e);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        architectView.onResume();
        locationProvider.onResume();
        architectView.registerSensorAccuracyChangeListener(sensorAccuracyChangeListener);
    }

    @Override
    protected void onPause() {
        architectView.onPause();
        locationProvider.onPause();
        architectView.unregisterSensorAccuracyChangeListener(sensorAccuracyChangeListener);
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        javaScriptListener.onDestroy();
        architectView.clearCache();
        architectView.onDestroy();
        super.onDestroy();
    }

    @Override
    public void onLocationChanged(Location location) {
        float accuracy = location.hasAccuracy() ? location.getAccuracy() : 1000;
        if (location.hasAltitude()) {
            architectView.setLocation(location.getLatitude(), location.getLongitude(), location.getAltitude(), accuracy);
        } else {
            architectView.setLocation(location.getLatitude(), location.getLongitude(), accuracy);
        }
    }

    /**
     * The very basic LocationProvider setup of this sample app does not handle the following callbacks.
     * They should be used to handle changes in a production app.
     */
    //TODO
    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {

    }

    @Override
    public void onProviderEnabled(String provider) {

    }

    @Override
    public void onProviderDisabled(String provider) {

    }
}
