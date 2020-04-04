package com.arlab.realestate.data.model;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class OfferLocation {

    double latitude;
    double longitude;
    int altitude;
}
