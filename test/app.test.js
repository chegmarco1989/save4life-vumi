var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var AppTester = vumigo.AppTester;


describe("Save4Life app", function() {
    describe("Regitration flow", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();

            tester = new AppTester(app);

            tester
                .setup.config.app({
                    name: 'test_app',
                    msisdn: '27831234567'
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                });
        });

        ////// User registration //////

        describe("when a new user starts a session", function() {
            it("ask them if they want to sign up", function() {
                return tester
                    .start()
                    .check.interaction({
                        state: 'states:registration_menu',
                        reply: [
                            'Welcome to Save4Life. Your easy airtime wallet that rewards you for saving a little every week!',
                            '1. Get Started',
                            '2. Read T&Cs',
                            '3. Exit'
                        ].join('\n')
                    })
                    .run();
            });
        });

        // TODO test R&Cs
        // TODO test exit

        describe("when the user gets started", function() {
            it("ask their name", function() {
                return tester
                    .setup.user.state('states:start')
                    .input('1')
                    .check.interaction({
                        state: 'states:registration_step_1',
                        reply: [
                            'Step 1 of 3: What is your first name?'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user enters their name", function() {
            it("ask them their savings goal", function() {
                return tester
                    .setup.user.state('states:registration_step_1')
                    .input('Spongebob')
                    .check.interaction({
                        state: 'states:registration_step_2',
                        reply: [
                            'Step 2 of 3: What are you saving airtime for?',
                            '1. Call minutes',
                            '2. Data bundle',
                            '3. Music',
                            '4. Games',
                            '5. Nothing in particular',
                            '6. Other'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user selects a goal", function() {
            it("ask them how much they wish to save", function() {
                return tester
                    .setup.user.state('states:registration_step_2')
                    .input('3')
                    .check.interaction({
                        state: 'states:registration_step_3',
                        reply: [
                            'Step 3 of 3: How much do you need to save to reach your goal?',
                            '1. R20',
                            '2. R50',
                            '3. R75',
                            '4. R100',
                            '5. R200',
                            '6. Other amount'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user selects other for goal", function() {
            it("ask them what their goal is", function() {
                return tester
                    .setup.user.state('states:registration_step_2')
                    .input('6')
                    .check.interaction({
                        state: 'states:registration_step_2_other',
                        reply: [
                            'Please tell us what you are saving for. e.g. New phone'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user enters an other goal", function() {
            it("ask them their savings target", function() {
                return tester
                    .setup.user.state('states:registration_step_2_other')
                    .input('music')
                    .check.interaction({
                        state: 'states:registration_step_3'
                    })
                    .run();
            });
        });

        describe("when the user select an amount to save", function() {
            it("show confirmation message and terminate the session", function() {
                return tester
                    .setup.user.state('states:registration_step_3')
                    .input('2')
                    .check.interaction({
                        state: 'states:end_registration',
                        reply: [
                            'Thanks for registering for Save4Life, Spongebob. Now it\'s time to start saving. Dial back in to redeem your first Save4Life voucher and save.'
                        ].join('\n')
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });

        describe("when the user select other amount to save", function() {
            it("ask amount the user wants to save", function() {
                return tester
                    .setup.user.state('states:registration_step_3')
                    .input('6')
                    .check.interaction({
                        state: 'states:registration_step_3_other',
                        reply: [
                            'Please enter the amount you want to save e.g. 1000'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user enters their saving amount", function() {
            it("end the conversation", function() {
                return tester
                    .setup.user.state('states:registration_step_3_other')
                    .input('50')
                    .check.reply.ends_session()
                    .run();
            });
        });
    });

    ////// Registered User //////
    describe("Registered users flow", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();

            tester = new AppTester(app);

            tester
                .setup.config.app({
                    name: 'test_app',
                    msisdn: '27830000000'
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                });
        });

        describe("when an existing user starts a session", function() {
            it("show them the main menu", function() {
                return tester
                    .start()
                    .check.interaction({
                        state: 'states:main_menu',
                        reply: [
                            'Welcome back to Save4Life Patric you have R0 saved for new pants.',
                            '1. Redeem voucher',
                            '2. Earn rewards',
                            '3. Take quiz',
                            '4. Withdrawal',
                            '5. Edit settings'
                        ].join('\n')
                    })
                    .run();
            });
        });
    });

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
                    msisdn: '27830000000'
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                });
        });


        describe("when a user enters an invalid voucher code", function() {
            it("show them the invalid voucher screen", function() {
                return tester
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
                    .setup.user.state('states:voucher_input')
                    .input('111122223333')
                    .check.interaction({
                        state: 'states:voucher_valid_recur_not_set'
                    })
                    .run();
            });
        });


    });

});
