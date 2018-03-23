const HttpTrigger = require('../index');
const httpTrigger = new HttpTrigger();

httpTrigger.postHandler = function (event) {
    // console.log('POST handler is invoked with event:', event);
    return Promise.resolve('POST is handled');
}

module.exports.handler = httpTrigger.handler;
