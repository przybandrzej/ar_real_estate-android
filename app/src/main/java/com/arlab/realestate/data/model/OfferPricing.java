package com.arlab.realestate.data.model;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class OfferPricing {

    String type;
    BigDecimal price;
    String currency;
    BigDecimal deposit;
    BigDecimal extraCosts;
}
