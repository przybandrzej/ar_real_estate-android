package com.arlab.realestate.android.util;

import com.wikitude.common.camera.CameraSettings.CameraFocusMode;
import com.wikitude.common.camera.CameraSettings.CameraResolution;
import com.wikitude.common.camera.CameraSettings.CameraPosition;

import java.io.Serializable;

import lombok.Data;

@Data
public class CameraConfig implements Serializable {

    private final CameraPosition cameraPosition;
    private final CameraResolution cameraResolution;
    private final CameraFocusMode cameraFocusMode;
    private final boolean camera2Enabled = true;

    public CameraConfig() {
        cameraPosition = CameraPosition.BACK;
        cameraResolution = CameraResolution.FULL_HD_1920x1080;
        cameraFocusMode = CameraFocusMode.CONTINUOUS;
    }
}
