package com.arlab.realestate.data.model;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class Offer {

    String id;
    String title;
    String description;
    int rooms;
    double area;
    String buildingType;
    Integer floor;
    String offerType;
    OfferLocation location;
    OfferPricing pricing;
    String imageResource;
}
