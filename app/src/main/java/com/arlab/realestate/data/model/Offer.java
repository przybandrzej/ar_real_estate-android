package com.arlab.realestate.data.model;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class Offer {

    String title;
    String description;
    int rooms;
    double area;
    BuildingTypeEnum buildingType;
    Integer floor;
    OfferPricingTypeEnum offerType;
    OfferLocation location;
    OfferPricing pricing;
}
