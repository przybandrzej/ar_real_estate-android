package com.arlab.realestate.android.activity;

import android.app.Activity;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.TextView;

import com.arlab.realestate.R;
import com.arlab.realestate.data.DataProvider;
import com.arlab.realestate.data.model.Offer;

import java.io.IOException;
import java.util.Objects;

public class OfferDetailActivity extends Activity {

    public static final String EXTRAS_KEY_POI_ID = "id";
    public static final String IMG_SRC_DIR = "img-offers/";

    private Offer offer;
    private DataProvider provider;

    private TextView tvOfferId;
    private TextView tvOfferTitle;
    private TextView tvOfferDescription;
    private TextView tvOfferRooms;
    private TextView tvOfferArea;
    private TextView tvOfferBuildingType;
    private TextView tvOfferFloor;
    private TextView tvOfferAddress;
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
        provider = new DataProvider(getApplicationContext());

        setUp();
        setContent();
    }

    private void setUp() {
        String id = Objects.requireNonNull(getIntent().getExtras()).getString(EXTRAS_KEY_POI_ID);
        offer = provider.getOfferById(id);
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
        tvOfferAddress = findViewById(R.id.poi_detail_address_value_text_view);
    }

    private void setContent() {
        if (offer == null) {
            return;
        }

        tvOfferId.setText(offer.getId());

        if(offer.getImageResource() != null && offer.getImageResource().isEmpty()) {
            try {
                ivOfferImage.setImageBitmap(
                        BitmapFactory.decodeStream(
                                getAssets().open(IMG_SRC_DIR + offer.getImageResource())
                        ));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        tvOfferTitle.setText(offer.getTitle());
        tvOfferDescription.setText(offer.getDescription());
        tvOfferRooms.setText(String.valueOf(offer.getRooms()));

        tvOfferArea.setText(
                new StringBuilder(String.valueOf(offer.getArea()))
                        .append("m\u00B2"));
        tvOfferBuildingType.setText(offer.getBuildingType());

        if(offer.getFloor() == null) {
            tvOfferFloor.setText(getString(R.string.no_floor));
        } else {
            tvOfferFloor.setText(String.valueOf(offer.getFloor()));
        }

        tvOfferAddress.setText(provider.getOffersAddress(offer).toString());
        tvOfferType.setText(offer.getOfferType());
        tvOfferPricingType.setText(offer.getPricing().getType());
        tvOfferPricingPrice.setText(
                new StringBuilder(String.valueOf(offer.getPricing().getPrice()))
                        .append(" ").append(offer.getPricing().getCurrency()));

        if(offer.getPricing().getDeposit() != null) {
            tvOfferPricingDeposit.setText(
                    new StringBuilder(String.valueOf(offer.getPricing().getDeposit()))
                            .append(" ").append(offer.getPricing().getCurrency()));
        } else {
            tvOfferPricingDeposit.setText(
                    new StringBuilder(String.valueOf(0))
                            .append(" ").append(offer.getPricing().getCurrency()));
        }

        if(offer.getPricing().getExtraCosts() != null) {
            tvOfferPricingExtraCosts.setText(
                    new StringBuilder(String.valueOf(offer.getPricing().getExtraCosts()))
                            .append(" ").append(offer.getPricing().getCurrency()));
        } else {
            tvOfferPricingExtraCosts.setText(
                    new StringBuilder(String.valueOf(0))
                            .append(" ").append(offer.getPricing().getCurrency()));
        }
    }
}
