var vumigo = require('vumigo_v02');
var fixtures = require('./settings.fixtures');
var AppTester = vumigo.AppTester;


describe("Save4Life app", function() {
    describe("Settings", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();
            tester = new AppTester(app);
            tester
                .setup.config.app({
                    name: 'test_app'
                })
                .setup.user.addr('27830000111')
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                });
        });

        describe("when the user choose settings", function() {
            it("show them the settings menu", function() {
                return tester
                    .setup.user.state('states:main_menu')
                    .input('5')
                    .check.interaction({
                        state: 'states:settings',
                        reply: [
                            'Your Safe4Life settings:',
                            '1. Change goal',
                            '2. Change recurring savings amount',
                            '3. Read T&Cs',
                            '4. Back'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe('When the user choose Change goal', function() {
            it('show them the change goal screen', function() {
                return tester
                    .setup.user.state('states:settings')
                    .input('1')
                    .check.interaction({
                        state: 'states:change_goal',
                        reply: [
                            'You are currently trying to save R5000 for Braai tongs.',
                            '1. Change goal',
                            '2. Change amount',
                            '3. Back'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe('When the user choose Change recurring savings amount', function() {
            it('show them the change savings amount screen', function() {
                return tester
                    .setup.user.addr('27830000000')
                    .setup.user.state('states:settings')
                    .input('2')
                    .check.interaction({
                        state: 'states:change_recur',
                        reply: [
                            'You have not set an amount to save each time you redeem a Save4Life voucher.',
                            '1. Set recurring amount',
                            '2. Back'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe('When a user with recurring amount set choose Change recurring savings amount', function() {
            it('show them the change savings amount screen', function() {
                return tester
                    .setup.user.state('states:settings')
                    .input('2')
                    .check.interaction({
                        state: 'states:change_recur',
                        reply: [
                            'You have currently opted to save R20 each time you redeem a Save4Life voucher.',
                            '1. Edit',
                            '2. Back'
                        ].join('\n')
                    })
                    .run();
            });
        });

        // TODO test for T&Cs

        describe('When a user choose back', function() {
            it('take them to the main menu', function() {
                return tester
                    .setup.user.state('states:settings')
                    .input('4')
                    .check.interaction({
                        state: 'states:main_menu'
                    })
                    .run();
            });
        });

        describe('When a user select change goal item', function() {
            it('ask them what they are saving for', function() {
                return tester
                    .setup.user.state('states:change_goal')
                    .input('1')
                    .check.interaction({
                        state: 'states:change_goal_item',
                        reply: [
                            'What are you saving airtime for?',
                            '1. Call minutes',
                            '2. Data bundle',
                            '3. Music',
                            '4. Games',
                            '5. Nothing in particular',
                            '6. Other',
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe('When a user selects a goal item', function() {
            it('save their choice and display a confirmantion screen', function() {
                return tester
                    .setup.user.state('states:change_goal_item')
                    .input('1')
                    .check.interaction({
                        state: 'states:change_goal_item_done',
                        reply: [
                            'Thanks Mr. Krabs. Your goal has been updated.',
                            '1. Settings',
                            '2. Menu'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe('when a user selects other as goal item', function() {
            it('ask them their goal', function() {
                return tester
                    .setup.user.state('states:change_goal_item')
                    .input('6')
                    .check.interaction({
                        state: 'states:change_goal_item_other',
                        reply: [
                            'Please tell us what you are saving for. e.g. New phone',
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe('when a user enters other goal item', function() {
            it('save their goal', function() {
                return tester
                    .setup.user.state('states:change_goal_item_other')
                    .input('call minutes')
                    .check.interaction({
                        state: 'states:change_goal_item_done',
                        reply: [
                            'Thanks Mr. Krabs. Your goal has been updated.',
                            '1. Settings',
                            '2. Menu'
                        ].join('\n')
                    })
                    .run();
            });
        });


        //////////////////////////
        //  Update goal amount  //
        //////////////////////////

        describe('When a user select change goal amount', function() {
            it('ask them how much they want to save', function() {
                return tester
                    .setup.user.state('states:change_goal')
                    .input('2')
                    .check.interaction({
                        state: 'states:change_goal_amount',
                        reply: [
                            'How much do you need to save?',
                            '1. R20',
                            '2. R50',
                            '3. R75',
                            '4. R100',
                            '5. R200',
                            '6. Other amount',
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe('When a user selects an amount', function() {
            it('save the amount and show a done screen', function() {
                return tester
                    .setup.user.state('states:change_goal_amount')
                    .input('4')
                    .check.interaction({
                        state: 'states:change_goal_item_done',
                        reply: [
                            'Thanks Mr. Krabs. Your goal has been updated.',
                            '1. Settings',
                            '2. Menu'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe('when a user selects other as goal amount', function() {
            it('ask them their goal amount', function() {
                return tester
                    .setup.user.state('states:change_goal_amount')
                    .input('6')
                    .check.interaction({
                        state: 'states:change_goal_amount_other',
                        reply: [
                            'Please enter the amount you want to save e.g. 1000',
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe('when a user enters other goal amount', function() {
            it('save their amount and show them a done screen', function() {
                return tester
                    .setup.user.state('states:change_goal_amount_other')
                    .input('100')
                    .check.interaction({
                        state: 'states:change_goal_item_done',
                        reply: [
                            'Thanks Mr. Krabs. Your goal has been updated.',
                            '1. Settings',
                            '2. Menu'
                        ].join('\n')
                    })
                    .run();
            });
        });

        ///////////////////////////////
        //  Update recurring amount  //
        ///////////////////////////////
        
        describe('when a user selects to set a recurring amount', function() {
            it('ask them how much they wish to save each time', function() {
                return tester
                    .setup.user.state('states:change_recur')
                    .input('1')
                    .check.interaction({
                        state: 'states:change_recur_amount',
                        reply: [
                            'How much of each new voucher you redeem would you like to save?',
                            '1. R5',
                            '2. R7',
                            '3. R10',
                            '4. R15',
                            '5. R20',
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe('when a user selects a recurring amount', function() {
            it('save the amount and show them a confirmation screen', function() {
                return tester
                    .setup.user.state('states:change_recur_amount')
                    .input('3')
                    .check.interaction({
                        state: 'states:change_recur_done',
                        reply: [
                            'Thanks Mr. Krabs. Your recurring savings amount has been updated.',
                            '1. Settings',
                            '2. Menu',
                        ].join('\n')
                    })
                    .run();
            });
        });


    });

});
