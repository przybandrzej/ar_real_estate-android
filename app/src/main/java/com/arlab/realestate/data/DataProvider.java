package com.arlab.realestate.data;

import android.content.Context;
import android.content.res.AssetManager;
import android.location.Address;
import android.location.Geocoder;

import android.location.Location;
import com.arlab.realestate.data.model.Offer;
import com.arlab.realestate.data.model.OfferAddress;
import com.arlab.realestate.data.model.OffersResponse;
import com.google.gson.Gson;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Set;

public class DataProvider {

    private static final String OFFERS_FILE = "location-sources/offers-0_1.js";
    private static Set<Offer> offersCache = Collections.emptySet();
    private static Location userLocation = null;
    private Gson gson;
    private Context context;

    public DataProvider(Context context) {
        gson = new Gson();
        this.context = context;
    }

    public static Set<Offer> getOffersCache() {
        return offersCache;
    }

    public static void setUserLocation(Location location) {
        userLocation = location;
    }

    public Set<Offer> getOffers() {
        if(offersCache.isEmpty()) {
            readOffersToCache();
        }
        return offersCache;
    }

    public Offer getOfferById(String id) {
        for(Offer offer : getOffers()) {
            if(offer.getId().equals(id)) {
                return offer;
            }
        }
        return null;
    }

    private void readOffersToCache() {
        OffersResponse response = parseOffersFile();
        if(response != null) {
            offersCache = response.getOffers();
        }
    }

    public OfferAddress getOffersAddress(Offer offer) {
        OfferAddress offerAddress = new OfferAddress();
        try {
            Geocoder geocoder = new Geocoder(context, Locale.getDefault());
            List<Address> addresses = geocoder
                    .getFromLocation(offer.getLocation().getLatitude(),
                            offer.getLocation().getLongitude(), 1);

            Address address = addresses.get(0);
            offerAddress.setAddress(address.getThoroughfare() + " " + address.getSubThoroughfare());
            offerAddress.setCity(address.getLocality());
            offerAddress.setState(address.getAdminArea());
            offerAddress.setCountry(address.getCountryName());
            offerAddress.setPostalCode(address.getPostalCode());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return offerAddress;
    }

    private OffersResponse parseOffersFile() {
        OffersResponse response = null;
        AssetManager assets = context.getAssets();
        try(BufferedReader reader = new BufferedReader(new InputStreamReader(assets.open(OFFERS_FILE)))) {
            String mLine;
            StringBuilder file = new StringBuilder("");
            while ((mLine = reader.readLine()) != null) {
                file.append(mLine);
            }
            String jsonReader = file.toString()
                    .replace("const myJsonData = ", "")
                    .replace(";", "");
            response = gson.fromJson(jsonReader, OffersResponse.class);
        } catch(IOException e) {
            e.printStackTrace();
        }
        return response;
    }

    public String getUserAddressLine() {
        String str = "";
        try {
            if(userLocation != null) {
                Geocoder geocoder = new Geocoder(context, Locale.getDefault());
                List<Address> addresses = geocoder
                    .getFromLocation(userLocation.getLatitude(), userLocation.getLongitude(), 1);
                Address address = addresses.get(0);
                str = address.getThoroughfare() + " " + address.getSubThoroughfare();
            }
        } catch(IOException e) {
            e.printStackTrace();
        }
        return str;
    }
}
