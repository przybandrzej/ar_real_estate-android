package com.arlab.realestate.android.util;

import android.app.Activity;
import android.content.Intent;
import android.widget.Toast;
import com.arlab.realestate.R;
import com.arlab.realestate.android.activity.OfferDetailActivity;
import com.arlab.realestate.android.extension.ArchitectViewExtension;
import com.arlab.realestate.data.DataProvider;
import com.arlab.realestate.data.model.Offer;
import com.wikitude.architect.ArchitectJavaScriptInterfaceListener;
import com.wikitude.architect.ArchitectView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ArchitectJavaScriptListener extends ArchitectViewExtension implements ArchitectJavaScriptInterfaceListener {

  public ArchitectJavaScriptListener(Activity activity, ArchitectView architectView) {
    super(activity, architectView);
  }

  @Override
  public void onCreate() {
    architectView.addArchitectJavaScriptInterfaceListener(this);
  }

  @Override
  public void onDestroy() {
    architectView.removeArchitectJavaScriptInterfaceListener(this);
  }

  @Override
  public void onJSONObjectReceived(JSONObject jsonObject) {
    final Intent poiDetailIntent = new Intent(activity, OfferDetailActivity.class);
    try {
      switch(jsonObject.getString("action")) {
        case "present_poi_details": {
          poiDetailIntent.putExtra(OfferDetailActivity.EXTRAS_KEY_POI_ID, jsonObject.getString("id"));
          activity.startActivity(poiDetailIntent);
          break;
        }
        case "places_labels_get": {
          JSONObject obj = new JSONObject();
          JSONArray array = new JSONArray();
          for(Offer offer : new DataProvider(activity).getOffers()) {
            JSONObject item = new JSONObject();
            item.put("offerId", offer.getId());
            item.put("address", new DataProvider(activity).getOffersAddress(offer).getAddress());
            array.put(item);
          }
          obj.put("items", array);
          architectView.callJavascript("World.onPlacesAddressesReceived('" + obj + "')");
          break;
        }
        case "user_address_get": {
          JSONObject userItem = new JSONObject();
          userItem.put("address", new DataProvider(activity).getUserAddressLine());
          architectView.callJavascript("panelSetUserAddress('" + userItem + "')");
          break;
        }
        default: break;
      }
    } catch(JSONException e) {
      activity.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          Toast.makeText(activity, R.string.error_parsing_json, Toast.LENGTH_LONG).show();
        }
      });
      e.printStackTrace();
    }
  }
}
