go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;
    var JsonApi = vumigo.http.api.JsonApi;

    var api_url = 'http://api'; // TODO
    var msisdn = '27831234568'; // TODO

    var GoApp = App.extend(function(self) {
        
        App.call(self, 'states:start');

        self.init = function() {
            self.http = new JsonApi(self.im);
            if (self.im.config.msisdn) { // TODO - used for testing. Is there a better way?
                msisdn = self.im.config.msisdn;
            }
            var url = api_url + '/ussd/user_registration/' + msisdn + '/';
            self.user_data = {};
            return self.http.get(url)
                .then(function(resp){
                    self.user_data.name = resp.data.name;
                    self.user_data.extra = resp.data;
                    //return self.im.user_datas.save(self.user_data);
                });
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
                    new Choice('20', 'R20'),
                    new Choice('50', 'R50'),
                    new Choice('75', 'R75'),
                    new Choice('100', 'R100'),
                    new Choice('200', 'R200'),
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
                        data: {goal_amount: content}
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
                            if (self.user_data.recurring_amount){
                                return 'states:voucher_valid';
                            } else {
                                return 'states:voucher_valid_recur_not_set';
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
            return new FreeText(name, {
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
            return new FreeText(name, {
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

        self.states.add('states:voucher_valid_recur_not_set', function(name) {
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
                    
                    return 'states:voucher_redeem';
                }
            });
        });

        // Redeem voucher
        self.states.add('states:voucher_redeem', function(name) {
            var savings_amount = 0; //TODO
            var promise = self.http.post(api_url + '/ussd/voucher/verify/', {
                data: {
                    voucher_code: self.im.user.get_answer('states:voucher_input'),
                    savings_amount: savings_amount,
                    save_recurring_amount: true, //TODO
                    msisdn: msisdn
                }
            }).then(function(resp){
                // See if goal was reached
                // else
                return self.states.create('states:savings_update');
            });
            return promise;
        });




    });



    return {
        GoApp: GoApp
    };
}();
