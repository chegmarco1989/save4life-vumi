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
                    "balance": 0,
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
                "method": "POST",
                "url": "http://api/ussd/user_registration/27830000111/",
                "data": {
                    "goal_item": "call minutes"
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "msisdn": "27831234567",
                    "name": "Spongebob",
                    "goal_item": "call minutes",
                    "goal_amount": 50
                }
            }
        },
        {
            "request": {
                "method": "POST",
                "url": "http://api/ussd/user_registration/27830000111/",
                "data": {
                    "goal_amount": 100
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "msisdn": "27831234567",
                    "name": "Spongebob",
                    "goal_item": "music",
                    "goal_amount": 100
                }
            }
        },
        {
            "request": {
                "method": "POST",
                "url": "http://api/ussd/user_registration/27830000111/",
                "data": {
                    "recurring_amount": 10
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "msisdn": "27831234567",
                    "name": "Spongebob",
                    "goal_item": "music",
                    "goal_amount": 100,
                    "recurring_amount": 10
                }
            }
        },

    ];
};
