go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;
    var JsonApi = vumigo.http.api.JsonApi;

    var api_url = 'http://api'; // TODO - move to config

    var GoApp = App.extend(function(self) {
        
        App.call(self, 'states:start');

        var msisdn = '';
        self.init = function() {
            msisdn = self.im.user.addr; // TODO - not sure if it's a good idea to set here
            if (self.im.user.addr.indexOf(':') >= 0){
                msisdn = '27831231234'; // TODO - load this from a config variable
            }
            self.http = new JsonApi(self.im);
            var url = api_url + '/ussd/user_registration/' + msisdn + '/';
            self.user_data = {};
            self.im.log('************** fetching user data from API ***************');
            return self.http.get(url)
                .then(function(resp){
                    self.user_data.name = resp.data.name;
                    self.user_data.extra = resp.data;
                });
        };

        self.redeem_voucher = function(voucherCode, savingsAmount){
            var promise = self.http.post(api_url + '/ussd/voucher/redeem/', {
                data: {
                    msisdn: msisdn,
                    voucher_code: voucherCode,
                    savings_amount: savingsAmount
                }
            }).then(function(resp){
                // update user balance
                if (resp.data.status === 'success'){
                    self.user_data.extra.balance += savingsAmount;
                }
            });
            return promise;
        };


        ///// Registration states /////

        self.states.add('states:start', function(name) {
            //self.im.log(self.im.user.addr);
            // If registration is complete - send to menu
            if (self.user_data.name && self.user_data.extra.goal_item && self.user_data.extra.goal_amount) {
                return self.states.create('states:main_menu');
            }
            // else start registration flow
            return self.states.create('states:registration_menu');
        });

        self.states.add('states:registration_menu', function(name) {
            return new ChoiceState(name, {
                question: 'Welcome to Save4Life. Your easy airtime wallet that rewards you for saving a little every week!',
                choices: [
                    new Choice('states:registration_step_1', 'Get Started'),
                    new Choice('states:tandc', 'Read T&Cs'),
                    new Choice('states:end', 'Exit')],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        self.states.add('states:registration_step_1', function(name) {
            return new FreeText(name, {
                question: 'Step 1 of 3: What is your first name?',
                check: function(content){
                    return self.http.post(api_url + '/ussd/user_registration/' + msisdn + '/', { data: { name: content}}).then(
                        function(){ return null; }
                    );
                },
                next: 'states:registration_step_2'
            });
        });

        self.states.add('states:registration_step_2', function(name) {
            return new ChoiceState(name, {
                question: 'Step 2 of 3: What are you saving airtime for?',
                choices: [
                    new Choice('call minutes', 'Call minutes'),
                    new Choice('data bundle', 'Data bundle'),
                    new Choice('music', 'Music'),
                    new Choice('games', 'Games'),
                    new Choice('nothing', 'Nothing in particular'),
                    new Choice('other', 'Other')
                ],
                next: function(choice){
                    if (choice.value === 'other') {
                        return 'states:registration_step_2_other';
                    } else {
                        var promise = self.http.post(api_url + '/ussd/user_registration/' + msisdn + '/', { data: {goal_item: choice.value}}).then(function(){ 
                            return 'states:registration_step_3';
                        });
                        return promise;
                    }
                }
            });
        });

        self.states.add('states:registration_step_2_other', function(name) {
            return new FreeText(name, {
                question: 'Please tell us what you are saving for. e.g. New phone',
                check: function(content){
                    var promise = self.http.post(api_url + '/ussd/user_registration/' + msisdn + '/', { data: {goal_item: content}}).then(function(){ 
                        return null; 
                    });
                    return promise;
                },
                next: 'states:registration_step_3'
            });
        });

        self.states.add('states:registration_step_3', function(name) {
            return new ChoiceState(name, {
                question: 'Step 3 of 3: How much do you need to save to reach your goal?',
                choices: [
                    new Choice(20, 'R20'),
                    new Choice(50, 'R50'),
                    new Choice(75, 'R75'),
                    new Choice(100, 'R100'),
                    new Choice(200, 'R200'),
                    new Choice('other', 'Other amount')
                ],
                next: function(choice){
                    if (choice.value === 'other') {
                        return 'states:registration_step_3_other';
                    } else {
                        var promise = self.http.post(api_url + '/ussd/user_registration/' + msisdn + '/', { data: {goal_amount: choice.value}}).then(function(){ 
                            return 'states:end_registration';
                        });
                        return promise;
                    }
                }
            });
        });

        self.states.add('states:registration_step_3_other', function(name) {
            return new FreeText(name, {
                question: 'Please enter the amount you want to save e.g. 1000',
                check: function(content){
                    return self.http.post(api_url + '/ussd/user_registration/' + msisdn + '/', {
                        data: {goal_amount: parseInt(content)}
                    }).then(function(){ return null; });
                },
                next: 'states:end_registration'
            });
        });

        self.states.add('states:end_registration', function(name) {
            return new EndState(name, {
                text: 'Thanks for registering for Save4Life, ' + self.user_data.name + '. Now it\'s time to start saving. Dial back in to redeem your first Save4Life voucher and save.',
                next: 'states:start'
            });
        });

        self.states.add('states:main_menu', function(name) {
            return new ChoiceState(name, {
                question: 'Welcome back to Save4Life ' + self.user_data.name + ' you have R' + self.user_data.extra.balance + ' saved for ' + self.user_data.extra.goal_item + '.',
                choices: [
                    new Choice('states:voucher_input', 'Redeem voucher'),
                    new Choice('states:rewards', 'Earn rewards'),
                    new Choice('states:quiz', 'Take quiz'),
                    new Choice('states:withdrawal', 'Withdrawal'),
                    new Choice('states:settings', 'Edit settings')
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        self.states.add('states:voucher_input', function(name) {
            return new FreeText(name, {
                question: 'Please enter the Save4Life voucher code you purchased.',
                next: function(content){
                    var promise = self.http.post(api_url + '/ussd/voucher/verify/', {
                        data: {
                            voucher_code: content,
                            msisdn: msisdn
                        }
                    }).then(function(resp){
                        if (resp.data.status === 'valid'){
                            self.im.user.set_answer('voucher_amount', resp.data.amount);
                            if (self.user_data.extra.recurring_amount){
                                return 'states:voucher_valid';
                            } else {
                                return 'states:voucher_set_savings_amount';
                            }
                        } else if (resp.data.status === 'used'){
                            return 'states:voucher_used';
                        } else if (resp.data.status === 'invalid'){
                            return 'states:voucher_invalid';
                        }
                        return null; 
                    });
                    return promise;
                }
            });
        });

        self.states.add('states:voucher_invalid', function(name) {
            return new ChoiceState(name, {
                question: 'The code you entered is not a valid Save4Life voucher code. Please try again. e.g. 123456789078',
                choices: [
                    new Choice('states:voucher_input', 'Try again'),
                    new Choice('states:end', 'Exit')
                ],
                next: function(choice){
                    return choice.value;
                }
            });
        });

        self.states.add('states:voucher_used', function(name) {
            return new ChoiceState(name, {
                question: 'This voucher code has already been used. Please enter a new Save4Life airtime voucher code.',
                choices: [
                    new Choice('states:voucher_input', 'Try again'),
                    new Choice('states:end', 'Exit')
                ],
                next: function(choice){
                    return choice.value;
                }
            });
        });

        self.states.add('states:voucher_set_savings_amount', function(name) {
            var voucherAmount = self.im.user.get_answer('voucher_amount');
            var choices = [];
            // TODO - pick sensible amounts and limit options
            for (var savingsAmount = 10; savingsAmount <= voucherAmount; savingsAmount += 10){
                choices.push(new Choice(savingsAmount, 'R' + savingsAmount));
            }
            return new ChoiceState(name, {
                question: 'Thanks. How much of your R' + voucherAmount + ' voucher would you like to save?',
                choices: choices,
                next: function(choice){
                    return 'states:voucher_recur_confirm';
                }
            });
        });

        self.states.add('states:voucher_recur_confirm', function(name) {
            return new ChoiceState(name, {
                question: 'Thanks ' + self.user_data.name + '! Would you like to save this amount every time you redeem a Save4Life airtime voucher?',
                choices: [
                    new Choice('yes', 'Yes'),
                    new Choice('no', 'No')
                ],
                next: function(choice){
                    var savingsAmount = self.im.user.get_answer('states:voucher_set_savings_amount');
                    var pinCheck = function(){
                        // set user PIN before redeeming voucher!
                        if (self.user_data.extra.pin_set !== true){
                            return 'states:pin_code';
                        }

                        // Redeem voucher
                        return self.redeem_voucher(self.im.user.get_answer('states:voucher_input'), savingsAmount).then(function(){
                            return 'states:voucher_redeemed';
                        });
                    };

                    if (choice.value === 'yes'){
                        // store recurring amount
                        var post_data = { data: { recurring_amount: savingsAmount } };
                        return self.http.post(api_url + '/ussd/user_registration/' + msisdn + '/', post_data).then(function(){
                            return pinCheck();
                        });
                    } else {
                        return pinCheck();
                    }                   
                }
            });
        });

        self.states.add('states:voucher_valid', function(name) {
            return new ChoiceState(name, {
                question: 'Thanks, we will put R' + self.user_data.extra.recurring_amount + ' into your Save4Life airtime wallet.', 
                choices: [
                    new Choice('change', 'Change amount saved'),
                    new Choice('save', 'Save')
                ],
                next: function(choice){
                    if (choice.value === 'change'){
                        return 'states:voucher_set_savings_amount';
                    }
                    else {
                        if (self.user_data.extra.pin_set !== true){
                            return 'states:pin_code';
                        }

                        // redeem voucher
                        return self.redeem_voucher(self.im.user.get_answer('states:voucher_input'), self.user_data.extra.recurring_amount).then(function(resp){
                            return 'states:voucher_redeemed';
                        });
                    }
                }
            });
        });

        self.states.add('states:pin_code', function(name) {
            return new FreeText(name, {
                question: 'Before you can redeem your voucher and save, you need to create a 4 digit pin code (eg. 0821) that you\'ll use to withdraw your savings.',
                check: function(content){
                    return self.http.post(api_url + '/ussd/user_registration/' + msisdn + '/', { data: { pin: content}}).then(
                        function(){ return null; }
                    );
                },
                next: 'states:pin_code_saved'
            });
        });

        self.states.add('states:pin_code_saved', function(name) {
            var voucherAmount = self.im.user.get_answer('voucher_amount');
            var savingsAmount = self.im.user.get_answer('states:voucher_set_savings_amount');
            if ( !savingsAmount ) {
                savingsAmount = self.user_data.extra.recurring_amount;
            }
            // TODO - handle error if we have no savings amount set?
            return new ChoiceState(name, {
                question: 'Thanks ' + self.user_data.name + '. Your pin code has been saved! Confirm redeeming a R' + voucherAmount + ' voucher and saving R' + savingsAmount + '.', 
                choices: [
                    new Choice('yes', 'Yes'),
                    new Choice('no', 'No'),
                ],
                next: function(choice){
                    if (choice.value === 'no'){
                        return 'states:main_menu';
                    }
                    return self.redeem_voucher(self.im.user.get_answer('states:voucher_input'), savingsAmount).then(function(){
                        return 'states:voucher_redeemed';
                    });
                }
            });
        });

        self.states.add('states:voucher_redeemed', function(name){
            // If user reached their goal
            if (self.user_data.extra.balance >= self.user_data.extra.goal_amount) {
                return self.states.create('states:savings_reached');
            }
            return self.states.create('states:savings_update');
        });

        self.states.add('states:savings_update', function(name) {
            return new ChoiceState(name, {
                question: 'Well done ' + self.user_data.name + ', your total savings for ' + self.user_data.extra.goal_item + ' is now R' + self.user_data.extra.balance + '. Just R' + (self.user_data.extra.goal_amount - self.user_data.extra.balance) + ' more until you reach your goal R' + self.user_data.extra.goal_amount + ' goal.', 
                choices: [
                    new Choice('states:main_menu', 'Menu'),
                    new Choice('states:exit', 'Exit')
                ],
                next: function(choice){
                    return choice.value;
                }
            });
        });

        self.states.add('states:savings_reached', function(name) {
            return new ChoiceState(name, {
                question: 'Amazing ' + self.user_data.name + '. You\'ve reached your R' + self.user_data.extra.goal_amount + ' savings goal! Congratulations.', 
                choices: [
                    new Choice('states:setting_increase_goal', 'Increase your goal amount'),
                    new Choice('states:main_menu', 'Menu'),
                    new Choice('states:exit', 'Exit')
                ],
                next: function(choice){
                    return choice.value;
                }
            });
        });


        self.states.add('states:rewards', function(name) {
            return new ChoiceState(name, {
                question: 'Save4Life rewards you for good savings habits. Find out what you can earn below if you:',
                choices: [
                    new Choice('states:about_savings_streak_1', 'Save consistently each week'),
                    new Choice('states:about_weekly_quiz_1', 'Take the weekly quiz')
                ],
                next: function(choice){
                    return choice.value;
                }
            });
        });

        self.states.add('states:about_savings_streak_1', function(name){
            return new ChoiceState(name, {
                question: 'Saving streaks:\nSave4Life will reward you an airtime bonus if you save for 2 weeks in a row, 4 weeks in a row and 6 weeks in a',
                choices: [
                    new Choice('states:about_savings_streak_2', 'Next'),
                    new Choice('states:reward', 'Back'),
                    new Choice('states:exit', 'Exit')
                ],
                next: function(choice){ return choice.value; }
            });
        });

        self.states.add('states:about_savings_streak_2', function(name){
            return new ChoiceState(name, {
                question: 'row. The longer your streak, the bigger your reward. Save any amount each week to earn your savings streak rewards',
                choices: [
                    new Choice('states:rewards', 'Rewards'),
                    new Choice('states:about_savings_streak_1', 'Back'),
                    new Choice('states:exit', 'Exit')
                ],
                next: function(choice){ return choice.value; }
            });
        });

        self.states.add('states:about_weekly_quiz_1', function(name){
            return new ChoiceState(name, {
                question: 'Weekly quiz: Take the quiz and stand a chance to double your savings. Each week we\'ll rewards someone who completes the weekly quiz.',
                choices: [
                    new Choice('states:rewards', 'Back'),
                    new Choice('states:exit', 'Exit')
                ],
                next: function(choice){ return choice.value; }
            });
        });


        /////////////////////////////////
        ////////// Quiz states //////////
        /////////////////////////////////

        self.states.add('states:quiz', function(name) {
            var url = api_url + '/ussd/quiz/';
            var opts = {params: {msisdn: msisdn}};
            var promise = self.http.get(url, opts).then(function(resp){
                // Store quiz data as an answer
                // TODO - should show when there is no quiz or if the user already completed the current quiz
                self.im.user.set_answer('states:quiz:quiz_data', JSON.stringify(resp.data));
                self.im.user.set_answer('states:quiz:active_question', resp.data.user_progress);
                var choices = [];
                if (resp.data.user_progress === 0){
                    choices.push(new Choice('states:quiz_question', 'Take the quiz'));
                }
                choices.push(new Choice('states:main_menu', 'Back'));
                choices.push(new Choice('states:exit', 'Exit'));
               
                return new ChoiceState(name, {
                    question: 'Take the weekly quiz and stand a chance to win double your savings this week!', 
                    choices: choices,
                    next: function(choice){
                        return choice.value;
                    }
                });
            });
            return promise;
        });


        self.states.add('states:quiz_question', function(name) {
            // get choices for active question
            var quiz_data = JSON.parse(self.im.user.get_answer('states:quiz:quiz_data'));
            var active_question = self.im.user.get_answer('states:quiz:active_question');
            var choices = quiz_data.questions[active_question].options.map(function(choice, i){
                return new Choice(i, choice);
            });
            return new ChoiceState(name, {
                question: 'Q ' + (active_question+1) + ' of ' + quiz_data.questions.length + ': '  + quiz_data.questions[active_question].question, 
                choices: choices,
                next: function(choice){
                    var url = api_url + '/ussd/quiz/' + quiz_data.quiz_id + '/question/' + active_question + '/';
                    var promise = self.http.post(url, { 
                        data: {
                            'answer': choice.value,
                            'msisdn': msisdn
                        } 
                    }).then(function(resp){
                        // store result
                        self.im.user.set_answer('states:quiz:question_' + active_question, JSON.stringify(resp.data));
                        return 'states:quiz_question_mark';
                    });
                    return promise;
                }
            });
        });


        self.states.add('states:quiz_question_mark', function(name) {
            var quiz_data = JSON.parse(self.im.user.get_answer('states:quiz:quiz_data'));
            var active_question = self.im.user.get_answer('states:quiz:active_question');
            var question_result = JSON.parse(self.im.user.get_answer('states:quiz:question_' + active_question));

            var user_prompt = '';
            if (question_result.correct === true){
                user_prompt = 'Correct :) ' + question_result.reinforce_text;
            } else {
                user_prompt = 'You\'ll get it right next time. The answer is ' + question_result.answer_text;
            }

            var choices = [];
            if (active_question + 1 >= quiz_data.questions.length){
                choices = [new Choice('states:quiz_result', 'Find out my score')];
            } else {
                choices = [new Choice('states:quiz_question', 'Next question')];
            }
            return new ChoiceState(name, {
                question: user_prompt,
                choices: choices,
                next: function(choice){
                    active_question += 1;
                    self.im.user.set_answer('states:quiz:active_question', active_question);
                    return choice.value;
                }
            });
        });

        self.states.add('states:quiz_result', function(name) {
            // get quiz score
            var url = api_url + '/ussd/quiz/';
            var opts = {params: {msisdn: msisdn}};
            var promise = self.http.get(url, opts).then(function(resp){
                var user_prompt = 'Great effort ' + self.user_data.name + '. Your score was ' + resp.data.user_score + '/4. We\'ll send you a SMS if you have earned a data bundle this week.';
                return new ChoiceState(name, {
                    question: user_prompt, 
                    choices: [
                        new Choice('states:main_menu', 'Menu'),
                        new Choice('states:exit', 'Exit')
                    ],
                    next: function(choice){
                        return choice.value;
                    }
                });
            });
            return promise;
        });

        /////////////////////////////////
        //////// Settings states //////// 
        /////////////////////////////////
        
        self.states.add('states:settings', function(name){
            return new ChoiceState(name, {
                question: 'Your Safe4Life settings:',
                choices: [
                    new Choice('states:change_goal', 'Change goal'),
                    new Choice('states:change_recur', 'Change recurring savings amount'),
                    new Choice('states:', 'Read T&Cs'),
                    new Choice('states:main_menu', 'Back')
                ],
                next: function(choice){
                    return choice.value;
                }
            });
        });

        self.states.add('states:change_goal', function(name){
            return new ChoiceState(name, {
                question: 'You are currently trying to save R' + self.user_data.extra.goal_amount + ' for ' + self.user_data.extra.goal_item + '.',
                choices: [
                    new Choice('states:change_goal_item', 'Change goal'),
                    new Choice('states:change_goal_amount', 'Change amount'),
                    new Choice('states:settings', 'Back')
                ],
                next: function(choice){
                    return choice.value;
                }
            });
        });

        self.states.add('states:change_goal_item', function(name){
            return new ChoiceState(name, {
                question: 'What are you saving airtime for?',
                choices: [
                    new Choice('call minutes', 'Call minutes'),
                    new Choice('data bundle', 'Data bundle'),
                    new Choice('music', 'Music'),
                    new Choice('games', 'Games'),
                    new Choice('nothing', 'Nothing in particular'),
                    new Choice('other', 'Other')
                ],
                next: function(choice){
                    if (choice.value === 'other') {
                        return 'states:change_goal_item_other';
                    } else {
                        var promise = self.http.post(api_url + '/ussd/user_registration/' + msisdn + '/', { data: {goal_item: choice.value}}).then(function(){ 
                            return 'states:change_goal_item_done';
                        });
                        return promise;
                    }
                }
            });
        });

        self.states.add('states:change_goal_item_other', function(name) {
            return new FreeText(name, {
                question: 'Please tell us what you are saving for. e.g. New phone',
                check: function(content){
                    var promise = self.http.post(api_url + '/ussd/user_registration/' + msisdn + '/', { data: {goal_item: content}}).then(function(){ 
                        return null; 
                    });
                    return promise;
                },
                next: 'states:change_goal_item_done'
            });
        });

        self.states.add('states:change_goal_item_done', function(name){
            return new ChoiceState(name, {
                question: 'Thanks ' + self.user_data.name + '. Your goal has been updated.',
                choices: [
                    new Choice('states:settings', 'Settings'),
                    new Choice('states:main_menu', 'Menu'),
                ],
                next: function(choice){
                    return choice.value;
                }
            });
        });

        self.states.add('states:change_goal_amount', function(name) {
            return new ChoiceState(name, {
                question: 'How much do you need to save?',
                choices: [
                    new Choice(20, 'R20'),
                    new Choice(50, 'R50'),
                    new Choice(75, 'R75'),
                    new Choice(100, 'R100'),
                    new Choice(200, 'R200'),
                    new Choice('other', 'Other amount')
                ],
                next: function(choice){
                    if (choice.value === 'other') {
                        return 'states:change_goal_amount_other';
                    } else {
                        var promise = self.http.post(api_url + '/ussd/user_registration/' + msisdn + '/', { data: {goal_amount: choice.value}}).then(function(){ 
                            return 'states:change_goal_item_done';
                        });
                        return promise;
                    }
                }
            });
        });

        self.states.add('states:change_goal_amount_other', function(name) {
            return new FreeText(name, {
                question: 'Please enter the amount you want to save e.g. 1000',
                check: function(content){
                    return self.http.post(api_url + '/ussd/user_registration/' + msisdn + '/', {
                        data: {goal_amount: parseInt(content)}
                    }).then(function(){ return null; });
                },
                next: 'states:change_goal_item_done'
            });
        });

        self.states.add('states:change_recur', function(name){
            var change_text = '';
            var question_text = '';
            if (self.user_data.extra.recurring_amount){
                question_text = 'You have currently opted to save R' + self.user_data.extra.recurring_amount + ' each time you redeem a Save4Life voucher.';
                change_text = 'Edit';
            } else {
                question_text = 'You have not set an amount to save each time you redeem a Save4Life voucher.';
                change_text = 'Set recurring amount';
            }
            return new ChoiceState(name, {
                question: question_text,
                choices: [
                    new Choice('states:change_recur_amount', change_text),
                    new Choice('states:settings', 'Back')
                ],
                next: function(choice){
                    return choice.value;
                }
            });
        });

        self.states.add('states:change_recur_amount', function(name) {
            return new ChoiceState(name, {
                question: 'How much of each new voucher you redeem would you like to save?',
                choices: [
                    new Choice(5, 'R5'),
                    new Choice(7, 'R7'),
                    new Choice(10, 'R10'),
                    new Choice(15, 'R15'),
                    new Choice(20, 'R20')
                ],
                next: function(choice){
                    var post_data = { data: { recurring_amount: choice.value } };
                    return self.http.post(api_url + '/ussd/user_registration/' + msisdn + '/', post_data).then(function(){
                        return 'states:change_recur_done';
                    });
                }
            });
        });

        self.states.add('states:change_recur_done', function(name){
            return new ChoiceState(name, {
                question: 'Thanks ' + self.user_data.name + '. Your recurring savings amount has been updated.',
                choices: [
                    new Choice('states:settings', 'Settings'),
                    new Choice('states:main_menu', 'Menu'),
                ],
                next: function(choice){
                    return choice.value;
                }
            });
        });








    });
    return {
        GoApp: GoApp
    };
}();
