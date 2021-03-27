package com.arlab.realestate.android.util;

import android.content.Context;
import android.location.Location;
import android.util.Log;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Class logging location updates to external file for later analysis
 */
public class LocationLogger {

  private static String filePath = "location_log.txt";

  public static void log(Location location, Context context) {
    ExecutorService service = Executors.newFixedThreadPool(4);
    service.submit(() -> {
      String message = String.format("Timestamp [ %s ], Location [ %.6f, %.6f ]",
          LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss.SSS dd-MM-yyyy")),
          location.getLatitude(), location.getLongitude());

      File file = context.getFilesDir();
      File path = new File(file, filePath);

      if(!path.exists()) {
        try {
          path.createNewFile();
        } catch(IOException e) {
          Log.e("LocationManager", e.getMessage(), e.getCause());
        }
      }

      try(FileOutputStream stream = new FileOutputStream(path)) {
        stream.write(message.getBytes());
      } catch(IOException e) {
        Log.e("LocationManager", e.getMessage(), e.getCause());
      }
    });
  }
}
