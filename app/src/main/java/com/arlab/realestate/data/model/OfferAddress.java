package com.arlab.realestate.data.model;

import lombok.Data;

@Data
public class OfferAddress {

    String address;
    String city;
    String state;
    String country;
    String postalCode;

    public String toString() {
        return address + System.lineSeparator()
                + postalCode + " " + city + System.lineSeparator()
                + state + System.lineSeparator()
                + country;
    }
}
