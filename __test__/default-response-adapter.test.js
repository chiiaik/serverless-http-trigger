const ResponseAdapter = require('../default-response-adapter');
const DATA = 'This is a test data';
const CLIENT_ERROR = 'This is a client error';
const SERVER_ERROR = 'This is a server error';

test ('5.1 ok response is valid', (done) => {
    let adapter = new ResponseAdapter(function (err, result) {
        expect(err).toBeNull();
        expect(result).not.toBeNull();
        let data = null;
        try {
            data = JSON.parse(result.body);
        } catch (e) {}
        expect(data).toEqual(DATA);
        done();
    });
    expect.assertions(3);
    adapter.ok(DATA);
})

test ('5.2 clientError response is valid', (done) => {
    let adapter = new ResponseAdapter(function (err, result) {
        expect(err).not.toBeNull();
        expect(result).toBeNull();
        let data = null;
        try {
            data = JSON.parse(err.body);
        } catch (e) {}
        expect(data).toEqual(CLIENT_ERROR);
        done();
    });
    expect.assertions(3);
    adapter.clientError(CLIENT_ERROR);
})

test ('5.3 serverError response is valid', (done) => {
    let adapter = new ResponseAdapter(function (err, result) {
        expect(err).not.toBeNull();
        expect(result).toBeNull();
        let data = null;
        try {
            data = JSON.parse(err.body);
        } catch (e) {}
        expect(data).toEqual(SERVER_ERROR);
        done();
    });
    expect.assertions(3);
    adapter.serverError(SERVER_ERROR);
})

test ('5.4 no exception shall be thrown when the callback is invalid', (done) => {
    let adapter = new ResponseAdapter(null);
    expect.assertions(1);
    adapter.ok(DATA);
    setTimeout(() => {
        expect(1).toBeTruthy();
        done();
    }, 1000);
})

test ('5.5 no exception shall be thrown when the callback throws exception', (done) => {
    let adapter = new ResponseAdapter((err, result) => {
        throw new Error('I am evil');
    });
    expect.assertions(1);
    adapter.ok(DATA);
    setTimeout(() => {
        expect(1).toBeTruthy();
        done();
    }, 1000);
})
