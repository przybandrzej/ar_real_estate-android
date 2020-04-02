package com.arlab.realestate.data;

import com.arlab.realestate.data.model.OffersResponse;
import com.google.gson.JsonObject;

import org.junit.Test;

import java.math.BigDecimal;

import static org.junit.Assert.*;

public class DataProviderTest {

    @Test
    public void parseOffersFileToJsonObject() {
        DataProvider provider = new DataProvider();
        OffersResponse response = provider.parseOffersFileToJsonObject();
        assertNotNull(response);
        assertEquals(new BigDecimal("0.1"), response.getVersion());
        assertEquals(2, response.getOffers().size());
    }
}