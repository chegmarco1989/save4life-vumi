var vumigo = require('vumigo_v02');
var fixtures = require('./withdraw.fixtures');
var AppTester = vumigo.AppTester;


describe("Save4Life app", function() {

    ////// Voucher redemption flow //////
    describe("Withdrawing airtime", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();
            tester = new AppTester(app);
            tester
                .setup.user.addr('27830000000')
                .setup.config.app({
                    name: 'test_app',
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                });
        });

        describe("when a user choose withdraw", function() {
            it("show them the withdrawal menu", function() {
                return tester
                    .setup.user.state('states:main_menu')
                    .input('4')
                    .check.interaction({
                        state: 'states:withdrawal_screen',
                        reply: [
                            'You haven\'t yet reached your goal of R500. Are you sure you want to withdraw your airtime, Patric?',
                            '1. Yes',
                            '2. Cancel',
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("in the withdraw menu", function(){

            describe("when a user choose no", function() {
                it("show them the cancel withrawal screen", function() {
                    return tester
                        .setup.user.state('states:withdrawal_screen')
                        .input('2')
                        .check.interaction({
                            state: 'states:cancel_withdrawal',
                            reply: [
                                'Great choice!',
                                '1. Menu'
                            ].join('\n')
                        })
                        .run();
                });
            });
         
            describe("when a user choose yes", function() {
                it("ask them how much they wish to withdraw", function() {
                    return tester
                        .setup.user.state('states:withdrawal_screen')
                        .input('1')
                        .check.interaction({
                            state: 'states:withdrawal_amount',
                            reply: [
                                'How much would you like to withdraw?',
                                '1. R5',
                                '2. R10',
                                '3. R15',
                                '4. R20',
                                '5. R25',
                                '6. Other amount'
                            ].join('\n')
                        })
                        .run();
                });
            });
        });

        describe("when the user choose an amount", function() {
            it("ask them for their pin", function() {
                return tester
                    .setup.user.state('states:withdrawal_amount')
                    .input('4')
                    .check.interaction({
                        state: 'states:pincode_request',
                        reply: [
                            'Please enter your Save4Life pincode now.'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user choose \'other amount\'", function() {
            it("ask them to enter the amount", function() {
                return tester
                    .setup.user.state('states:withdrawal_amount')
                    .input('6')
                    .check.interaction({
                        state: 'states:withdrawal_amount_other',
                        reply: [
                            'Enter the amount you would like to withdraw?'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user enters a valid other amount", function() {
            it("ask them to enter their pin code", function() {
                return tester
                    .setup.user.state('states:withdrawal_amount_other')
                    .input('100')
                    .check.interaction({
                        state: 'states:pincode_request',
                        reply: [
                            'Please enter your Save4Life pincode now.'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user enters an other amount larger than their balance", function() {
            it("show them an error", function() {
                return tester
                    .setup.user.state('states:withdrawal_amount_other')
                    .input('105')
                    .check.interaction({
                        state: 'states:withdrawal_amount_other',
                        reply: [
                            'Amount is bigger than your balance.'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user enters an other amount smaller than the mininum", function() {
            it("show them an error", function() {
                return tester
                    .setup.user.state('states:withdrawal_amount_other')
                    .input('4')
                    .check.interaction({
                        state: 'states:withdrawal_amount_other',
                        reply: [
                            'Your chosen amount is smaller than the minimum of R5'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user enters an other amount that will leave them with a balance smaller than the minimum", function() {
            it("show them an error", function() {
                return tester
                    .setup.user.state('states:withdrawal_amount_other')
                    .input('96')
                    .check.interaction({
                        state: 'states:withdrawal_amount_other',
                        reply: [
                            'Your resulting balance will be less than the minimum of R5. Please choose a smaller amount or withdraw your whole savings amount.'
                        ].join('\n')
                    })
                    .run();
            });
        });


        describe("when the enters the wrong pin code", function() {
            it("ask them to try again", function() {
                return tester
                    .setup.user.state('states:pincode_request')
                    .input('1234')
                    .check.interaction({
                        state: 'states:pincode_request',
                        reply: [
                            'You have not entered a valid 4 number code. Please try again. eg. 0199'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the enters their pin code", function() {
            it("ask them to confirm their withdrawal", function() {
                return tester
                    .setup.user.state('states:pincode_request')
                    .setup.user.answer('states:withdrawal_amount', 20)
                    .input('0000')
                    .check.interaction({
                        state: 'states:withdraw_confirm',
                        reply: [
                            'Withdrawing R20 will reduce your savings to R80. Please confirm you would like to withdraw this amount',
                            '1. Yes',
                            '2. Cancel',
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user cancels the withdrawal", function() {
            it("show them the withdraw cancel screen", function() {
                return tester
                    .setup.user.state('states:withdraw_confirm')
                    .setup.user.answer('states:withdrawal_amount', 20)
                    .input('2')
                    .check.interaction({
                        state: 'states:cancel_withdrawal',
                        reply: [
                            'Great choice!',
                            '1. Menu',
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user confirms the withdrawal", function() {
            it("show them the withdraw success screen", function() {
                return tester
                    .setup.user.answer('states:withdrawal_amount', 20)
                    .setup.user.answer('states:pincode_request', '0000')
                    .setup.user.state('states:withdraw_confirm')
                    .input('1')
                    .check.interaction({
                        state: 'states:withdraw_successful',
                        reply: [
                            'Withdrawal successful. Your new savings balance is R80. You\'ll receive a confirmation SMS that shows your airtime credit.',
                            '1. Menu',
                            '2. Exit',
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user confirms the withdrawal, but something goes wrong", function() {
            it("show them the withdraw unsuccessful screen", function() {
                return tester
                    .setup.user.answer('states:withdrawal_amount', 50)
                    .setup.user.answer('states:pincode_request', '0000')
                    .setup.user.state('states:withdraw_confirm')
                    .input('1')
                    .check.interaction({
                        state: 'states:withdraw_unsuccessful',
                        reply: [
                            'Unfortunately we cannot process your request at this time. Please try again later.',
                            '1. Menu',
                            '2. Exit',
                        ].join('\n')
                    })
                    .run();
            });
        });


    });

});
