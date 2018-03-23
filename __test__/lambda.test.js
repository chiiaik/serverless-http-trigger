const Lambda = require('./lambda');
const AWS_TEST_EVENT = require('./aws.http-trigger.event');
const AZURE_TEST_EVENT = require('./azure.http-trigger.event');

test ('2.1 POST handler is invoked for aws event', (done) => {
    function callback (error, result) {
        let tmp = result.body;
        expect(error).toBeNull();
        expect(tmp).toBeDefined();
        expect(tmp).toBe('"POST is handled"');
        done();
    }
    Lambda.handler(AWS_TEST_EVENT, {}, callback);
})

test ('2.2 POST handler is invoked for azure event', (done) => {
    function callback () {
        let result = AZURE_TEST_EVENT.res;
        expect(result.body).toEqual('POST is handled');
        done();
    }
    AZURE_TEST_EVENT.done = callback;
    Lambda.handler(AZURE_TEST_EVENT);
})
