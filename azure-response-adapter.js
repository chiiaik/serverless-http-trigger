const ResponseHelper = require('serverless-lambda-http-response');

function AzureResponseAdapter (context) {
    this.context = context;
}

AzureResponseAdapter.prototype.clientError = function (err) {
    let self = this;
    let response = new ResponseHelper().azure().clientError(err);
    self._send(response);
}

AzureResponseAdapter.prototype.serverError = function (err) {
    let self = this;
    let response = new ResponseHelper().azure().serverError(err);
    self._send(response);
}

AzureResponseAdapter.prototype.ok = function (result) {
    let self = this;
    let response = new ResponseHelper().azure().ok(result);
    self._send(response);
}

AzureResponseAdapter.prototype.redirect = function (isPermanent, location) {
    const self = this;
    const response = new ResponseHelper().azure().redirect(isPermanent, location);
    self._send(response);
}

AzureResponseAdapter.prototype._send = function (res) {
    let self = this;
    if (self.context && self.context.done && typeof self.context.done === 'function') {
        self.context.res = res;
        try {
            self.context.done();
        }
        catch (e) {
            console.error('FAILED to send response due to', e.message);
        }
    }
}

module.exports = AzureResponseAdapter;
