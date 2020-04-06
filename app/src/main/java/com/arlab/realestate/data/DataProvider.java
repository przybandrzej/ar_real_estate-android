package com.arlab.realestate.data;

import android.content.res.AssetManager;

import com.arlab.realestate.data.model.Offer;
import com.arlab.realestate.data.model.OffersResponse;
import com.google.gson.Gson;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Collections;
import java.util.Set;

/**
 * Singleton class with static factory method and lazy loading
 */
public class DataProvider {

    private static final String OFFERS_FILE = "location-sources/offers-0_1.js";
    private Gson gson;
    private Set<Offer> offersCache = Collections.emptySet();

    private static DataProvider instance;

    private DataProvider() {
        gson = new Gson();
    }

    public static DataProvider getInstance() {
        if(instance == null) {
            instance = new DataProvider();
        }
        return instance;
    }

    public Set<Offer> getOffers(AssetManager assets) {
        if(offersCache.isEmpty()) {
            readOffersToCache(assets);
        }
        return offersCache;
    }

    public void readOffersToCache(AssetManager assets) {
        OffersResponse response = parseOffersFile(assets);
        if(!response.getOffers().isEmpty()) {
            offersCache = response.getOffers();
        }
    }

    public OffersResponse parseOffersFile(AssetManager assets) {
        OffersResponse response = null;
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

    public Offer getOfferById(int id, AssetManager assets) {
        for(Offer offer : getOffers(assets)) {
            if(offer.getId() == id) {
                return offer;
            }
        }
        return null;
    }
}
