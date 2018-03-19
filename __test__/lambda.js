const HttpTrigger = require('../index');
const httpTrigger = new HttpTrigger();

httpTrigger.getHandler = function (event) {
    // console.log('GET handler is invoked with event:', event);
    return Promise.resolve('GET is handled');
}

httpTrigger.postHandler = function (event) {
    // console.log('POST handler is invoked with event:', event);
    return Promise.resolve('POST is handled');
}

module.exports.handler = httpTrigger.handler;
