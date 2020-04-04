package com.arlab.realestate.data.model;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class OfferPricing {

    OfferPricingTypeEnum type;
    BigDecimal price;
    CurrencyEnum currency;
    BigDecimal deposit;
    BigDecimal extraCosts;
}
