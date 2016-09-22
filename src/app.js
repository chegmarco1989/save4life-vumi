go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;
    var JsonApi = vumigo.http.api.JsonApi;

    var api_url = 'http://api'; // TODO
    var msisdn = '27831234567'; //TODO

    var GoApp = App.extend(function(self) {

        App.call(self, 'states:start');

        self.init = function() {
            self.http = new JsonApi(self.im);
        };

        self.states.add('states:start', function(name) {
            self.im.log(self.im.user.addr);
            var promise = self.http.get(api_url + '/ussd/user_registration/' + msisdn + '/').then(function(resp) {
                //if (resp.registration_complete)
                // If registration is complete - send to menu
                // else start or resume registration flow
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
            return promise;
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
                text: 'Thanks for registering for Save4Life, [name]. Now it\'s time to start saving. Dial back in to redeem your first Save4Life voucher and save.',
                next: 'states:start'
            });
        });
    });

    return {
        GoApp: GoApp
    };
}();
