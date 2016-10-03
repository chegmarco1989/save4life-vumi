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
        });


        describe("when user picks savings amount without recurring amount set", function() {
            it("ask them if they would like to save this amount every time", function(){
                return tester
                    .setup.user.addr('27830000000')
                    .setup.user.answer('voucher_amount', 60)
                    .setup.user.state('states:voucher_set_savings_amount')
                    .input('30')
                    .check.interaction({
                        state: 'states:voucher_set_savings_amount'
                    })
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
                            "data": { "recurring_amount" : "30"}
                        },
                        "response": { "code": 200, "data": {} }
                    };

                    return tester
                        .setup(function(api){ api.http.fixtures.add(quickFix); })
                        .setup.user.addr('27830000000')
                        .setup.user.answer('states:voucher_input', '9999')
                        .setup.user.answer('states:voucher_set_savings_amount', '30')
                        .setup.user.state('states:voucher_recur_confirm')
                        .input('1')
                        .check.interaction({
                            state: 'states:savings_update'
                        })
                        .run();
                });
            });
         
            describe("when user would not like to save recurring amount", function() {
                it("ask pin", function(){
                    return tester
                        .setup.user.addr('27830000000')
                        .setup.user.answer('states:voucher_input', '9999')
                        .setup.user.answer('states:voucher_set_savings_amount', '30')
                        .setup.user.state('states:voucher_recur_confirm')
                        .input('2')
                        .check.interaction({
                            state: 'states:savings_update'
                        })
                        .run();
                });
            });
        });
    });

});
