package com.arlab.realestate.data;

import com.arlab.realestate.data.model.Offer;
import com.arlab.realestate.data.model.OffersResponse;
import com.google.gson.Gson;

import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.util.Collections;
import java.util.Set;

/**
 * Singleton class with static factory method and lazy loading
 */
public class DataProvider {

    public static final String OFFERS_DIR_PATH = System.getProperty("user.dir")
            + "/src/main/assets/location-sources/";

    private String offersFile = "offers-0.1.json";
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

    public Set<Offer> getOffers() {
        if(offersCache.isEmpty()) {
            readOffersToCache();
        }
        return offersCache;
    }

    public void readOffersToCache() {
        OffersResponse response = parseOffersFile();
        if(!response.getOffers().isEmpty()) {
            offersCache = response.getOffers();
        }
    }

    public OffersResponse parseOffersFile() {
        OffersResponse response = null;
        try(Reader reader = new FileReader(OFFERS_DIR_PATH + offersFile)) {
            response = gson.fromJson(reader, OffersResponse.class);
        } catch(IOException e) {
            e.printStackTrace();
        }
        return response;
    }

    public String getOffersFile() {
        return offersFile;
    }

    public void setOffersFile(String offersFile) {
        this.offersFile = offersFile;
    }
}
