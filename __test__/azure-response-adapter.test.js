const AzureResponseAdapter = require('../azure-response-adapter');
const DATA = 'This is a test data';
const CLIENT_ERROR = 'This is a client error';
const SERVER_ERROR = 'This is a server error';

test ('4.1 ok response is valid', (done) => {
    let context = {};
    context.done = function () {
        expect(context.res).not.toBeNull();
        expect(context.res.body).toEqual(DATA);
        done();
    };
    let adapter = new AzureResponseAdapter(context);
    expect.assertions(2);
    adapter.ok(DATA);
})

test ('4.2 clientError response is valid', (done) => {
    let context = {};
    context.done = function () {
        expect(context.res).not.toBeNull();
        expect(context.res.body).toEqual(CLIENT_ERROR);
        done();
    };
    let adapter = new AzureResponseAdapter(context);
    expect.assertions(2);
    adapter.clientError(CLIENT_ERROR);
})

test ('4.3 serverError response is valid', (done) => {
    let context = {};
    context.done = function (err, result) {
        expect(context.res).not.toBeNull();
        expect(context.res.body).toEqual(SERVER_ERROR);
        done();
    };
    let adapter = new AzureResponseAdapter(context);
    expect.assertions(2);
    adapter.serverError(SERVER_ERROR);
})

test ('4.4 no exception shall be thrown when the callback is invalid', (done) => {
    let adapter = new AzureResponseAdapter(null);
    expect.assertions(1);
    adapter.ok(DATA);
    setTimeout(() => {
        expect(1).toBeTruthy();
        done();
    }, 1000);
})

test ('4.5 no exception shall be thrown when the callback throws exception', (done) => {
    let context = {};
    context.done = () => {
        throw new Error('I am evil');
    };
    let adapter = new AzureResponseAdapter(context);
    expect.assertions(1);
    adapter.ok(DATA);
    setTimeout(() => {
        expect(1).toBeTruthy();
        done();
    }, 1000);
})
