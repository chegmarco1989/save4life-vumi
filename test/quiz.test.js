var vumigo = require('vumigo_v02');
var fixtures = require('./quiz.fixtures');
var AppTester = vumigo.AppTester;


describe("Save4Life app", function() {

    describe("Quiz interface", function() {
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

        describe("when there is an active quiz", function() {
            it("ask the user if they want to take the quiz", function() {
                return tester
                    .setup.user.addr('27830000000')
                    .setup.user.state('states:quiz')
                    .check.interaction({
                        reply: [
                            'Take the weekly quiz and stand a chance to win double your savings this week!',
                            '1. Take the quiz',
                            '2. Back',
                            '3. Exit'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user already completed the active quiz", function() {
            it("Do not show the take the quiz option", function() {
                return tester
                    .setup.user.addr('27830000002')
                    .setup.user.state('states:quiz')
                    .check.interaction({
                        reply: [
                            'You\'ve completed the current quiz. We\'ll notify you when there\'s a new quiz available.',
                            '1. Back',
                            '2. Exit'
                        ].join('\n')
                    })
                    .run();
            });
        });


        describe("when there is no active quiz", function() {
            it("do not show the take the quiz option", function() {
                return tester
                    .setup.user.addr('27830000001')
                    .setup.user.state('states:quiz')
                    .check.interaction({
                        reply: [
                            'There isn\'t an active quiz right now. We\'ll notify you when there\'s a new quiz available.',
                            '1. Back',
                            '2. Exit'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when a user starts the quiz", function() {
            it("show them the first question", function() {
                return tester
                    .setup.user.addr('27830000000')
                    .setup.user.state('states:quiz')
                    .input('1')
                    .check.interaction({
                        state: 'states:quiz_question',
                        reply: [
                            'Q 1 of 4: Pick a number below 10',
                            '1. 1-2',
                            '2. 3 and 4',
                            '3. 5',
                            '4. 6 to 9'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when a user answers a question right", function() {
            it("show them a confirmation screen", function() {
                return tester
                    .setup.user.addr('27830000000')
                    .setup.user.answer('states:quiz:quiz_data', JSON.stringify(fixtures()[1].response.data))
                    .setup.user.answer('states:quiz:active_question', 0)
                    .setup.user.state('states:quiz_question')
                    .input('1')
                    .check.interaction({
                        state: 'states:quiz_question_mark',
                        reply: [
                            'Correct :) That is the only number',
                            '1. Next question'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when a user answers a question wrong", function() {
            it("show them the right answer", function() {
                return tester
                    .setup.user.addr('27830000000')
                    .setup.user.answer('states:quiz:quiz_data', JSON.stringify(fixtures()[1].response.data))
                    .setup.user.answer('states:quiz:active_question', 1)
                    .setup.user.state('states:quiz_question')
                    .input('1')
                    .check.interaction({
                        state: 'states:quiz_question_mark',
                        reply: [
                            'You\'ll get it right next time. The answer is Five',
                            '1. Next question'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when a user select to continue with the quiz", function() {
            it("show them the next question", function() {
                return tester
                    .setup.user.addr('27830000000')
                    .setup.user.answer('states:quiz:quiz_data', JSON.stringify(fixtures()[1].response.data))
                    .setup.user.answer('states:quiz:active_question', 1)
                    .setup.user.answer('states:quiz:question_1', 0)
                    .setup.user.state('states:quiz_question_mark')
                    .input('1')
                    .check.interaction({
                        state: 'states:quiz_question',
                        reply: [
                            'Q 3 of 4: Pick the 3rd option',
                            '1. Foo',
                            '2. Baa',
                            '3. Baz',
                            '4. Boom'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when a user answers the last question correctly", function() {
            it("show them the final question screen", function() {
                return tester
                    .setup.user.addr('27830000000')
                    .setup.user.answer('states:quiz:quiz_data', JSON.stringify(fixtures()[1].response.data))
                    .setup.user.answer('states:quiz:active_question', 3)
                    .setup.user.state('states:quiz_question')
                    .input('1')
                    .check.interaction({
                        state: 'states:quiz_question_mark',
                        reply: [
                            'Correct :) Well done',
                            '1. Find out my score'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when a user select 'Find out my score'", function() {
            it("show them their quiz result", function() {
                return tester
                    .setup.user.addr('27830000002')
                    .setup.user.answer('states:quiz:quiz_data', JSON.stringify(fixtures()[1].response.data))
                    .setup.user.answer('states:quiz:active_question', 3)
                    .setup.user.answer('states:quiz:question_3', 0)
                    .setup.user.state('states:quiz_question_mark')
                    .input('1')
                    .check.interaction({
                        state: 'states:quiz_result',
                        reply: [
                            'Great effort Patric. Your score was 2/4. We\'ll send you a SMS if you have earned a data bundle this week.',
                            '1. Menu',
                            '2. Exit'
                        ].join('\n')
                    })
                    .run();
            });
        });

    });

});
