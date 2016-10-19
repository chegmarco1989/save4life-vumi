var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var AppTester = vumigo.AppTester;


describe("Save4Life app", function() {
    describe("Rewards info screen", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();
            tester = new AppTester(app);
            tester
                .setup.config.app({
                    name: 'test_app'
                })
                .setup.user.addr('27830000000')
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                });
        });


        describe("when a user selects the reward info screen", function() {
            it("show it to them", function() {
                return tester
                    .setup.user.state('states:main_menu')
                    .input('2')
                    .check.interaction({
                        state: 'states:rewards',
                        reply: [
                            'Save4Life rewards you for good savings habits. Find out what you can earn below if you:',
                            '1. Save consistently each week',
                            '2. Take the weekly quiz'
                        ].join('\n')
                    })
                    .run();
            });
        });


        describe("when a user selects saving streak info", function() {
            it("show it to them", function() {
                return tester
                    .setup.user.state('states:rewards')
                    .input('1')
                    .check.interaction({
                        state: 'states:about_savings_streak_1'
                    })
                    .run();
            });
        });

        describe("when a user selects quiz info", function() {
            it("show it to them", function() {
                return tester
                    .setup.user.state('states:rewards')
                    .input('2')
                    .check.interaction({
                        state: 'states:about_weekly_quiz_1'
                    })
                    .run();
            });
        });

        describe("when a user moves to the second streak info screen", function() {
            it("show it to them", function() {
                return tester
                    .setup.user.state('states:about_savings_streak_1')
                    .input('1')
                    .check.interaction({
                        state: 'states:about_savings_streak_2'
                    })
                    .run();
            });
        });

    });
});
