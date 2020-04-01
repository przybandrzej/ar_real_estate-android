package com.arlab.realestate.extension;

import android.app.Activity;
import android.location.Location;
import android.os.Bundle;

import com.arlab.realestate.R;

public class OfferDetailActivity extends Activity {

    public static final String EXTRAS_KEY_OFFER_ID = "id";
    public static final String EXTRAS_KEY_OFFER_LOCATION = "location";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.setContentView(R.layout.activity_offer_detail);

        final Bundle extras = getIntent().getExtras();
        int offerId = extras.getInt(EXTRAS_KEY_OFFER_ID);
        Location offerLocation = (Location) extras.getSerializable(EXTRAS_KEY_OFFER_LOCATION);

        // TODO extract location from DB and display details

    }
}
