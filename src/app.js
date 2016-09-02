go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var JsonApi = vumigo.http.api.JsonApi;

    var GoApp = App.extend(function(self) {
        App.call(self, 'states:start');

        self.init = function() {
            self.http = new JsonApi(self.im);
        };

        self.states.add('states:start', function(name) {
            self.im.log(self.im.user.addr);
            return self.http.post('http://httpbin.org/post', {
                data: {message: 'test_login'}
            }).then(function(resp) {
                return new ChoiceState(name, {
                    question: 'Hi there! What do you want to do?',
             
                    choices: [
                        new Choice('states:start', 'Show this menu again'),
                        new Choice('states:end', 'Exit')],
             
                    next: function(choice) {
                        return choice.value;
                    }
                });
            });
        });

        self.states.add('states:end', function(name) {
            return new EndState(name, {
                text: 'Thanks, cheers!',
                next: 'states:start'
            });
        });
    });

    return {
        GoApp: GoApp
    };
}();
