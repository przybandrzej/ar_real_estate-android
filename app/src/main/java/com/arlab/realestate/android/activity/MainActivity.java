package com.arlab.realestate.android.activity;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.Manifest;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;

import com.arlab.realestate.R;
import com.wikitude.architect.ArchitectView;
import com.wikitude.common.permission.PermissionManager;

import java.util.Arrays;

public class MainActivity extends AppCompatActivity {

    private final PermissionManager permissionManager = ArchitectView.getPermissionManager();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        start();
    }

    private void start() {
        final String[] permissions = new String[] {
                Manifest.permission.CAMERA,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_WIFI_STATE,
                Manifest.permission.INTERNET,
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.ACCESS_NETWORK_STATE,
                Manifest.permission.WRITE_EXTERNAL_STORAGE
        };
        permissionManager.checkPermissions(MainActivity.this, permissions,
                PermissionManager.WIKITUDE_PERMISSION_REQUEST,
                new PermissionManager.PermissionManagerCallback() {
            @Override
            public void permissionsGranted(int requestCode) {
                final Intent intent = new Intent(MainActivity.this, ArActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(intent);
                finish();
            }

            @Override
            public void permissionsDenied(@NonNull String[] deniedPermissions) {
                Toast.makeText(MainActivity.this,
                        getString(R.string.permissions_denied) + Arrays.toString(deniedPermissions),
                        Toast.LENGTH_SHORT)
                        .show();
            }

            @Override
            public void showPermissionRationale(final int requestCode, @NonNull String[] strings) {
                final AlertDialog.Builder alertBuilder = new AlertDialog.Builder(MainActivity.this);
                alertBuilder.setCancelable(true);
                alertBuilder.setTitle(R.string.permission_rationale_title);
                alertBuilder.setMessage(getString(R.string.permission_rationale_text) + Arrays.toString(permissions));
                alertBuilder.setPositiveButton(android.R.string.yes, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        permissionManager.positiveRationaleResult(requestCode, permissions);
                    }
                });
                AlertDialog alert = alertBuilder.create();
                alert.show();
            }
        });
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        ArchitectView.getPermissionManager().onRequestPermissionsResult(requestCode, permissions, grantResults);
    }
}
