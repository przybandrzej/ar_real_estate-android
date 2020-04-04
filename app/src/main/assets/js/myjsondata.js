const myJsonData = {
    "dataSet": "locations",
    "version": 0.1,
    "offers": [
        {
            "id": 1,
            "title": "Mieszkanie 3-pokojowe w centrum",
            "description": "This is a description",
            "rooms": 3,
            "area": 78,
            "buildingType": "block",
            "floor": 3,
            "offerType": "rental",
            "location": {
                "latitude": 52.406653,
                "longitude": 16.917883,
                "altitude": 78
            },
            "pricing": {
                "type": "monthly",
                "price": 2500,
                "currency": "PLN",
                "deposit": 2500,
                "extraCosts": 0
            }
        },
        {
            "id": 2,
            "title": "Wolnostojący dom na przedmieściach",
            "description": "This is a description",
            "rooms": 6,
            "area": 180,
            "buildingType": "house",
            "offerType": "sale",
            "location": {
                "latitude": 52.119514,
                "longitude": 16.128616,
                "altitude": 71
            },
            "pricing": {
                "type": "single",
                "price": 400000,
                "currency": "PLN",
                "extraCosts": 10000
            }
        }
    ]
}