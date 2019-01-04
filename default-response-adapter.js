const ResponseHelper = require('serverless-lambda-http-response');

function DefaultResponseAdapter (callback) {
    this.callback = callback;
}

DefaultResponseAdapter.prototype.clientError = function (err) {
    let self = this;
    let response = new ResponseHelper().clientError(err);
    self._send(null, response);
}

DefaultResponseAdapter.prototype.serverError = function (err) {
    let self = this;
    let response = new ResponseHelper().serverError(err);
    self._send(null, response);
}

DefaultResponseAdapter.prototype.ok = function (result) {
    let self = this;
    let response = new ResponseHelper().ok(result);
    self._send(null, response);
}

DefaultResponseAdapter.prototype.redirect = function (isPermenant, location) {
    const self = this;
    const response = new ResponseHelper().redirect(isPermenant, location);
    self._send(null, response);
}

DefaultResponseAdapter.prototype._send = function (err, res = null) {
    let self = this;
    if (self.callback && typeof self.callback === 'function') {
        try {
            self.callback(err, res);
        }
        catch (e) {
            console.error('FAILED to send response due to', e.message);
        }
    }
}

module.exports = DefaultResponseAdapter;
