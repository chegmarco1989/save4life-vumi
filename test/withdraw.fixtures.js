module.exports = function() {
    return [
        {
            "request": {
                "method": "GET",
                "url": "http://api/ussd/user_registration/27830000000/"
            },
            "response": {
                "code": 200,
                "data": {
                    "msisdn": "27830000000",
                    "name": "Patric",
                    "goal_item": "new pants",
                    "goal_amount": 500,
                    "balance": 100,
                }
            }
        },
        {
            "request": {
                "method": "GET",
                "url": "http://api/ussd/user_registration/27830000111/"
            },
            "response": {
                "code": 200,
                "data": {
                    "msisdn": "27830000111",
                    "name": "Mr. Krabs",
                    "goal_item": "Braai tongs",
                    "goal_amount": 5000,
                    "balance": 0,
                    "recurring_amount": 20
                }
            }
        },
        {
            "request": {
                "method": "GET",
                "url": "http://api/ussd/user_registration/27830000222/"
            },
            "response": {
                "code": 200,
                "data": {
                    "msisdn": "27830000222",
                    "name": "Gary the Snail",
                    "goal_item": "New shell",
                    "goal_amount": 500,
                    "balance": 0,
                    "recurring_amount": 20,
                    "pin_set": true
                }
            }
        },
        {
            "request": {
                "method": "GET",
                "url": "http://api/ussd/user_registration/27830000444/"
            },
            "response": {
                "code": 200,
                "data": {
                    "msisdn": "27830000444",
                    "name": "Sheldon",
                    "goal_item": "Restaurant makeover",
                    "goal_amount": 1000,
                    "balance": 960,
                    "recurring_amount": 50,
                    "pin_set": true
                }
            }
        },
        {
            "request": {
                "method": "POST",
                "url": "http://api/ussd/pin/verify/",
                "data": {
                    "pin":"1234",
                    "msisdn":"27830000000",
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "status": "invalid"
                }
            }
        },
        {
            "request": {
                "method": "POST",
                "url": "http://api/ussd/pin/verify/",
                "data": {
                    "pin":"0000",
                    "msisdn":"27830000000",
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "status": "valid"
                }
            }
        },
        {
            "request": {
                "method": "POST",
                "url": "http://api/ussd/withdraw/",
                "data": {
                    "pin":"0000",
                    "amount":20,
                    "msisdn":"27830000000",
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "status": "success"
                }
            }
        },
        {
            "request": {
                "method": "POST",
                "url": "http://api/ussd/withdraw/",
                "data": {
                    "pin":"0000",
                    "amount":50,
                    "msisdn":"27830000000",
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "status": "error"
                }
            }
        },




    ];
};
