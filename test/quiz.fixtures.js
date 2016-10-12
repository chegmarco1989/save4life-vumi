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
                "url": "http://api/ussd/quiz/"
            },
            "response": {
                "code": 200,
                "data": {
                    "user_progress": 0,
                    "quiz_id": 1,
                    "questions": [
                        {
                            "question":"Pick a number below 10",
                            "options": ["1-2","3 and 4","5","6 to 9"]
                        },
                        {
                            "question":"What was the number of the previous question?",
                            "options":["Pick the 3rd option","two"," 2","Five"]
                        },
                        {
                            "question":"Pick the 3rd option",
                            "options":["Foo","Baa","Baz","Boom"]
                        },
                        {
                            "question":"What is 1+1",
                            "options":["1","2","3","4"]
                        }
                    ]
                }
            }
        },
        {
            "request": {
                "method": "POST",
                "url": "http://api/ussd/quiz/1/question/0/",
                "data": {
                    "msisdn": "27830000000",
                    "answer": 0
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "correct": true,
                    "reinforce_text": "That is the only number"
                }
            }
        },
        {
            "request": {
                "method": "POST",
                "url": "http://api/ussd/quiz/1/question/1/",
                "data": {
                    "msisdn": "27830000000",
                    "answer": 0
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "correct": false,
                    "answer_text": "Five"
                }
            }
        },
        {
            "request": {
                "method": "POST",
                "url": "http://api/ussd/quiz/1/question/3/",
                "data": {
                    "msisdn": "27830000000",
                    "answer": 0
                }
            },
            "response": {
                "code": 200,
                "data": {
                    "correct": true,
                    "reinforce_text": "Well done"
                }
            }
        },

    ];
};
