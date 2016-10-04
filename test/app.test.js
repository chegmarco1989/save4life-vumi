var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var AppTester = vumigo.AppTester;


describe("Save4Life app", function() {

    ////// Voucher redemption flow //////
    describe("Voucher redemption flow", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();
            tester = new AppTester(app);
            tester
                .setup.config.app({
                    name: 'test_app',
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                });
        });

        describe("State states:voucher_input", function(){

            describe("when a user enters an invalid voucher code", function() {
                it("show them the invalid voucher screen", function() {
                    return tester
                        .setup.user.addr('27830000000')
                        .setup.user.state('states:voucher_input')
                        .input('50')
                        .check.interaction({
                            state: 'states:voucher_invalid'
                        })
                        .run();
                });
            });
            
            describe("when a user enters an used voucher code", function() {
                it("show them the voucher used screen", function() {
                    return tester
                        .setup.user.addr('27830000000')
                        .setup.user.state('states:voucher_input')
                        .input('123456789012')
                        .check.interaction({
                            state: 'states:voucher_used'
                        })
                        .run();
                });
            });
         
            describe("when a user enters a valid voucher code the first time", function() {
                it("ask them how much they want to save each time", function() {
                    return tester
                        .setup.user.addr('27830000000')
                        .setup.user.state('states:voucher_input')
                        .input('111122223333')
                        .check.interaction({
                            state: 'states:voucher_set_savings_amount'
                        })
                        .check.user.answer('voucher_amount', 60)
                        .run();
                });
            });
         
            describe("when a user enters a valid voucher code with recurring amount set", function() {
                it("ask them to confirm saving the amount", function() {
                    return tester
                        .setup.user.addr('27830000111')
                        .setup.user.state('states:voucher_input')
                        .input('111122223333')
                        .check.interaction({
                            state: 'states:voucher_valid'
                        })
                        .check.user.answer('voucher_amount', 80)
                        .run();
                });
            });
        });
        
        describe("State states:voucher_valid", function(){

            describe("when the user selects change amount", function() {
                it("redirect them to voucher_set_savings_amount state", function(){
                    return tester
                        .setup.user.addr('27830000000')
                        .setup.user.state('states:voucher_valid')
                        .input('1')
                        .check.interaction({
                            state: 'states:voucher_set_savings_amount'
                        })
                        .run();
                });
            });

            describe("when the user selects save without a pin set", function() {
                it("should ask them to set a pin", function(){
                    return tester
                        .setup.user.addr('27830000000')
                        .setup.user.state('states:voucher_valid')
                        .input('2')
                        .check.interaction({
                            state: 'states:pin_code'
                        })
                        .run();
                });
            });

            describe("when the user selects save with a pin set", function() {
                it("should redeem the voucher and show an updated balance", function(){
                    return tester
                        .setup.user.addr('27830000222')
                        .setup.user.answer('states:voucher_input', '20')
                        .setup.user.state('states:voucher_valid')
                        .input('2')
                        .check.interaction({
                            state: 'states:savings_update',
                            reply: [
                                'Well done Gary the Snail, your total savings for New shell is now R20. Just R480 more until you reach your goal R500 goal.',
                                '1. Menu',
                                '2. Exit'
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("when the user selects save with a pin set and reaches their goal", function() {
                it("should redeem the voucher and show them they reached their goal", function(){
                    return tester
                        .setup.user.addr('27830000444')
                        .setup.user.answer('states:voucher_input', '50')
                        .setup.user.state('states:voucher_valid')
                        .input('2')
                        .check.interaction({
                            state: 'states:savings_reached',
                            reply: [
                                'Amazing Sheldon. You\'ve reached your R1000 savings goal! Congratulations.',
                                '1. Increase your goal amount',
                                '2. Menu',
                                '3. Exit'
                            ].join('\n')
                        })
                        .run();

                });
            });


        });


        describe("when user picks savings amount", function() {
            it("ask them if they would like to save this amount every time", function(){
                return tester
                    .setup.user.addr('27830000000')
                    .setup.user.answer('voucher_amount', 60)
                    .setup.user.state('states:voucher_set_savings_amount')
                    .input('3')
                    .check.interaction({
                        state: 'states:voucher_recur_confirm',
                        reply: [
                            'Thanks Patric! Would you like to save this amount every time you redeem a Save4Life airtime voucher?',
                            '1. Yes',
                            '2. No'
                        ].join('\n')
                    })
                    .check.user.answer('states:voucher_set_savings_amount', 30)
                    .run();
            });
        });


        describe("State states:voucher_recur_confirm", function(){

            describe("when user confirms recurring savings amount", function() {
                it("save preference and ask pin", function(){
                    var quickFix = {
                        "request": {
                            "method": "POST",
                            "url": "http://api/ussd/user_registration/27830000000/",
                            "data": { "recurring_amount" : 30}
                        },
                        "response": { "code": 200, "data": {} }
                    };

                    return tester
                        .setup(function(api){ api.http.fixtures.add(quickFix); })
                        .setup.user.addr('27830000000')
                        .setup.user.answer('states:voucher_input', '9999')
                        .setup.user.answer('states:voucher_set_savings_amount', 30)
                        .setup.user.state('states:voucher_recur_confirm')
                        .input('1')
                        .check.interaction({
                            state: 'states:pin_code'
                        })
                        .run();
                });
            });
         
            describe("when user would not like to save recurring amount", function() {
                it("ask pin", function(){
                    return tester
                        .setup.user.addr('27830000000')
                        .setup.user.answer('states:voucher_input', '9999')
                        .setup.user.answer('states:voucher_set_savings_amount', 30)
                        .setup.user.state('states:voucher_recur_confirm')
                        .input('2')
                        .check.interaction({
                            state: 'states:pin_code'
                        })
                        .run();
                });
            });

            describe("when user with pin would not like to save recurring amount", function() {
                it("show updated saving screen", function(){
                    return tester
                        .setup.user.addr('27830000222')
                        .setup.user.answer('states:voucher_input', '9999')
                        .setup.user.answer('states:voucher_set_savings_amount', 30)
                        .setup.user.state('states:voucher_recur_confirm')
                        .input('2')
                        .check.interaction({
                            state: 'states:savings_update'
                        })
                        .run();
                });
            });

            describe("when user with pin would like to save recurring amount", function() {
                it("show updated saving screen", function(){
                    return tester
                        .setup.user.addr('27830000222')
                        .setup.user.answer('states:voucher_input', '9999')
                        .setup.user.answer('states:voucher_set_savings_amount', 30)
                        .setup.user.state('states:voucher_recur_confirm')
                        .input('1')
                        .check.interaction({
                            state: 'states:savings_update'
                        })
                        .run();
                });
            });

            // test user with pin reaching goal
            describe("when user with pin would not like to save recurring amount and reaches goal", function() {
                it("show goal reached screen", function(){
                    return tester
                        .setup.user.addr('27830000444')
                        .setup.user.answer('states:voucher_input', '50')
                        .setup.user.answer('states:voucher_set_savings_amount', 50)
                        .setup.user.state('states:voucher_recur_confirm')
                        .input('2')
                        .check.interaction({
                            state: 'states:savings_reached'
                        })
                        .run();
                });
            });

        });

        describe("when user sets pin", function() {
            it("ask them to confirm voucher transaction", function(){
                var quickFix = {
                    "request": {
                        "method": "POST",
                        "url": "http://api/ussd/user_registration/27830000000/",
                        "data": { "pin" : "1234"}
                    },
                    "response": { "code": 200, "data": {} }
                };

                return tester
                    .setup(function(api){ api.http.fixtures.add(quickFix); })
                    .setup.user.addr('27830000000')
                    .setup.user.answer('states:voucher_input', '9999')
                    .setup.user.answer('states:voucher_set_savings_amount', 30)
                    .setup.user.state('states:pin_code')
                    .input('1234')
                    .check.interaction({
                        state: 'states:pin_code_saved'
                    })
                    .run();
            });
        });

        describe("when user confirms saving after setting pin", function() {
            it("redeem voucher and show savings updated screen", function(){
                return tester
                    .setup.user.addr('27830000000')
                    .setup.user.answer('states:voucher_input', '9999')
                    .setup.user.answer('states:voucher_set_savings_amount', 30)
                    .setup.user.state('states:pin_code_saved')
                    .input('1')
                    .check.interaction({
                        state: 'states:savings_update'
                    })
                    .run();

            });
        });

    });

});
