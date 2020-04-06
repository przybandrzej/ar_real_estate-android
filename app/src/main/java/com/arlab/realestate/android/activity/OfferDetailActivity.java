package com.arlab.realestate.android.activity;

import android.app.Activity;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.TextView;
import com.arlab.realestate.R;
import com.arlab.realestate.data.DataProvider;
import com.arlab.realestate.data.model.CurrencyEnum;
import com.arlab.realestate.data.model.Offer;

public class OfferDetailActivity extends Activity {

    public static final String EXTRAS_KEY_POI_ID = "id";

    private Offer offer;
    private CurrencyEnum offerCurrency;

    private TextView tvOfferId;
    private TextView tvOfferTitle;
    private TextView tvOfferDescription;
    private TextView tvOfferRooms;
    private TextView tvOfferArea;
    private TextView tvOfferBuildingType;
    private TextView tvOfferFloor;
    private TextView tvOfferType;
    private TextView tvOfferPricingType;
    private TextView tvOfferPricingPrice;
    private TextView tvOfferPricingDeposit;
    private TextView tvOfferPricingExtraCosts;
    private ImageView ivOfferImage;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.setContentView(R.layout.activity_offer_detail);

        setUp();
        setContent();
    }

    private void setUp() {
        offer = DataProvider.getInstance().getOfferById(getIntent().getExtras().getInt(EXTRAS_KEY_POI_ID), getAssets());
        offerCurrency = offer.getPricing().getCurrency();
        tvOfferId = findViewById(R.id.poi_detail_offerId_value_text_view);
        ivOfferImage = findViewById(R.id.poi_detail_image_image_view);
        tvOfferTitle = findViewById(R.id.poi_detail_title_value_text_view);
        tvOfferDescription = findViewById(R.id.poi_detail_description_value_text_view);
        tvOfferRooms = findViewById(R.id.poi_detail_rooms_value_text_view);
        tvOfferArea = findViewById(R.id.poi_detail_area_value_text_view);
        tvOfferBuildingType = findViewById(R.id.poi_detail_buildingType_value_text_view);
        tvOfferFloor = findViewById(R.id.poi_detail_floor_value_text_view);
        tvOfferType = findViewById(R.id.poi_detail_offerType_value_text_view);
        tvOfferPricingType = findViewById(R.id.poi_detail_pricingType_value_text_view);
        tvOfferPricingPrice = findViewById(R.id.poi_detail_price_value_text_view);
        tvOfferPricingDeposit = findViewById(R.id.poi_detail_deposit_value_text_view);
        tvOfferPricingExtraCosts = findViewById(R.id.poi_detail_extraCosts_value_text_view);
    }

    private void setContent() {
        tvOfferId.setText(String.valueOf(offer.getId())); //TODO change ID from int to complex String
        //ivOfferImage.setImageResource(); // TODO add image resources
        tvOfferTitle.setText(offer.getTitle());
        tvOfferDescription.setText(offer.getDescription());
        tvOfferRooms.setText(String.valueOf(offer.getRooms()));
        //tvOfferRooms.setText(offer.getArea()); // TODO change to String with m^2
//        tvOfferBuildingType.setText(offer.getBuildingType().toString()); // TODO change to String
        tvOfferFloor.setText(String.valueOf(offer.getFloor()));
//        tvOfferType.setText(offer.getOfferType().toString()); // TODO change to String
//        tvOfferPricingType.setText(offer.getPricing().getType().toString()); // TODO change to String
        tvOfferPricingPrice.setText(String.valueOf(offer.getPricing().getPrice()));
        tvOfferPricingDeposit.setText(String.valueOf(offer.getPricing().getDeposit()));
        tvOfferPricingExtraCosts.setText(String.valueOf(offer.getPricing().getExtraCosts()));
    }
}
