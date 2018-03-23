const ResponseHelper = require('serverless-lambda-http-response');

function AwsResponseAdapter (callback) {
    this.callback = callback;
}

AwsResponseAdapter.prototype.clientError = function (err) {
    let self = this;
    let response = new ResponseHelper().aws().clientError(err);
    self._send(response);
}

AwsResponseAdapter.prototype.serverError = function (err) {
    let self = this;
    let response = new ResponseHelper().aws().serverError(err);
    self._send(response);
}

AwsResponseAdapter.prototype.ok = function (result) {
    let self = this;
    let response = new ResponseHelper().aws().ok(result);
    self._send(null, response);
}

AwsResponseAdapter.prototype._send = function (err, res = null) {
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

module.exports = AwsResponseAdapter;
