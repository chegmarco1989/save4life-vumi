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
                    "goal_amount": 50
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "msisdn": "27831234567",
                    "name": "Spongebob",
                    "goal_item": "music",
                    "goal_amount": 50
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
                    "goal_amount": 500,
                    "balance": 0,
                }
            }
        },
        {
            "request": {
                "method": "POST",
                "url": "http://api/ussd/voucher/verify/",
                "data": {
                    "voucher_code":"50",
                    "msisdn":"27830000000"
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "status":"invalid"
                }
            }
        },
        {
            "request": {
                "method": "POST",
                "url": "http://api/ussd/voucher/verify/",
                "data": {
                    "voucher_code":"123456789012",
                    "msisdn":"27830000000"
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "status":"used"
                }
            }
        },
        {
            "request": {
                "method": "POST",
                "url": "http://api/ussd/voucher/verify/",
                "data": {
                    "voucher_code":"111122223333",
                    "msisdn":"27830000000"
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "status":"valid",
                    "amount": 60
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
                "url": "http://api/ussd/voucher/verify/",
                "data": {
                    "voucher_code":"111122223333",
                    "msisdn":"27830000111"
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "status":"valid",
                    "amount": 80
                }
            }
        },
        {
            "request": {
                "method": "POST",
                "url": "http://api/ussd/voucher/redeem/",
                "data": {
                    "voucher_code":"9999",
                    "msisdn":"27830000000",
                    "savings_amount" : 30
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "status":"success"
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
                "method": "POST",
                "url": "http://api/ussd/user_registration/27830000222/",
                "data": {"recurring_amount":30}
            },
            "response": {
                "code": 200,
                "data": {}
            }
        },
        {
            "request": {
                "method": "POST",
                "url": "http://api/ussd/voucher/redeem/",
                "data": {
                    "voucher_code":"9999",
                    "msisdn":"27830000222",
                    "savings_amount" : 30
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "status":"success"
                }
            }
        },
        {
            "request": {
                "method": "POST",
                "url": "http://api/ussd/voucher/redeem/",
                "data": {
                    "voucher_code":"20",
                    "msisdn":"27830000222",
                    "savings_amount" : 20
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "status":"success"
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
                "url": "http://api/ussd/voucher/redeem/",
                "data": {
                    "voucher_code":"50",
                    "msisdn":"27830000444",
                    "savings_amount" : 50
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "status":"success"
                }
            }
        },


    ];
};
