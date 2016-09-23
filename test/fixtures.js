module.exports = function() {
    return [
        {
            "request": {
                "method": "GET",
                "url": "http://api/ussd/user_registration/27831234567/"
            },
            "response": {
                "code": 200,
                "data": {
                    "msisdn": "27831234567",
                    "name": "Spongebob"
                }
            }
        },
        {
            "request": {
                "method": "POST",
                "url": "http://api/ussd/user_registration/27831234567/",
                "data": {
                    "name": "Spongebob"
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "msisdn": "27831234567",
                    "name": "Spongebob"
                }
            }
        },
        {
            "request": {
                "method": "POST",
                "url": "http://api/ussd/user_registration/27831234567/",
                "data": {
                    "goal_item": "music"
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "msisdn": "27831234567",
                    "name": "Spongebob",
                    "goal_item": "music"
                }
            }
        },
        {
            "request": {
                "method": "POST",
                "url": "http://api/ussd/user_registration/27831234567/",
                "data": {
                    "goal_amount": "50"
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "msisdn": "27831234567",
                    "name": "Spongebob",
                    "goal_item": "music",
                    "goal_amount": "50"
                }
            }
        },
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
                    "goal_amount": "500000",
                    "balance": "0",
                }
            }
        }
    ];
};
