module.exports = function() {
    return [{
        "request": {
            "method": "POST",
            "url": "http://httpbin.org/post",
            "data": {
                "message": "test_login"
            }
        },
        "response": {
            "code": 200,
            "data": {
                "ham": "spam"
            }
        }
    }];
};
