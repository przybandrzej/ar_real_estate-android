package com.arlab.realestate.data.model;

import java.math.BigDecimal;
import java.util.Set;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class OffersResponse {

    String dataSet;
    BigDecimal version;
    Set<Offer> offers;
}
