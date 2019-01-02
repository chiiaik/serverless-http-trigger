const EventHelper = require('serverless-lambda-event-helper');
const AwsResponseAdapter = require('./aws-response-adapter');
const AzureResponseAdapter = require('./azure-response-adapter');
const DefaultResponseAdapter = require('./default-response-adapter');

/**
 * Constructor to create HttpTrigger object
 */
function HttpTrigger () {
    // this.identity = 'HttpTrigger';
    // Should NOT overwrite 
    this.handler = this._handler.bind(this);
    this.responseAdapter = new DefaultResponseAdapter(function (error, result) {
        if (error) {
            console.error(error);
        }
    });
    this.event = null;
    this.handlers = {};
    this.handlers['get'] = function (event) { return this.getHandler ? this.getHandler(event) : this._handlerNotImplemented('GET'); }.bind(this);
    this.handlers['post'] = function (event) { return this.postHandler ? this.postHandler(event) : this._handlerNotImplemented('POST'); }.bind(this);
    this.handlers['put'] = function (event) { return this.putHandler ? this.putHandler(event) : this._handlerNotImplemented('PUT'); }.bind(this);
    this.handlers['patch'] = function (event) { return this.patchHandler ? this.patchHandler(event) : this._handlerNotImplemented('PATCH'); }.bind(this);
    this.handlers['delete'] = function (event) { return this.deleteHandler ? this.deleteHandler(event) : this._handlerNotImplemented('DELETE'); }.bind(this);
    
    // Can be overwritten
    this.authorizationHandler = this._authorization.bind(this);
    this.requestHandler = null;
    this.responseHandler = null;
    this.getHandler = null;
    this.postHandler = null;
    this.putHandler = null;
    this.patchHandler = null;
    this.deleteHandler = null;
}

/**
 * Error messages
 */
HttpTrigger.ERROR_NOT_IMPLEMENTED = ' handler NOT implemented';
HttpTrigger.ERROR_HANDLER_SIGNATURE_ERROR = ' handler does NOT return a Promise';
HttpTrigger.ERROR_PROVIDER_NOT_SUPPORTED = 'cloud service provider NOT supported';
HttpTrigger.ERROR_AWS_MISSING_ARGUMENTS = 'expect (event, context, callback) for AWS';

/**
 * Entry point for AWS Lambda, Azure Function or Google Cloud Function
 * AWS Lambda
 *  - @param {Object} event
 *  - @param {Object} context
 *  - @param {Function} callback
 * Azure Function
 *  - @param {Object} context
 * Google Cloud Function
 *  - @param {Object} req (Based on ExpressJS Request object)
 *  - @param {Object} res (Based on ExpressJS Response object)
 */
HttpTrigger.prototype._handler = function (arg1, arg2, arg3) {
    let self = this;
    // console.log('identity:', self.identity);
    return self._map(arg1, arg2, arg3)
    .then(function () {
        return self._invokeAuthorization(self.event);
    })
    .then(function () {
        return self._invokeHandler(self.event);
    })
    .then(function (result) {
        self._invokeResultHandler(result);
    })
    .catch(function (error) {
        self._invokeErrorHandler(error);
    });
}

HttpTrigger.prototype._invokeResultHandler = function (result) {
    const self = this;
    if (self.responseHandler) {
        return self.responseHandler(provider, result);
    }
    return self.responseAdapter.ok(result);
}

HttpTrigger.prototype._invokeErrorHandler = function (error) {
    const self = this;
    return self.responseAdapter.serverError(error.message);
}

/**
 * Private method to map cloud service provider arguments to common event, response adapter and authorizer adapter
 * @param {*} arg1 First argument to the entry function
 * @param {*} arg2 Second argument to the entry function
 * @param {*} arg3 Third argument to the entry function
 * @returns {Promise} Promise resolves to null
 */
HttpTrigger.prototype._map = function (arg1, arg2, arg3) {
    let self = this;
    return new Promise(function (resolve, reject) {
        let unwrap = new EventHelper(arg1);
        let provider = null;
        if (self._isAws(arg1)) {
            if (arg3 && typeof arg3 === 'function') {
                provider = unwrap.aws().httpTrigger();
                self.responseAdapter = new AwsResponseAdapter(arg3);
            }
            else {
                return reject(new Error(HttpTrigger.ERROR_AWS_MISSING_ARGUMENTS));
            }
        }
        else if (self._isAzure(arg1)) {
            provider = unwrap.azure().httpTrigger();
            self.responseAdapter = new AzureResponseAdapter(arg1);
        }
        if (provider) {
            self.event = ({
                host: provider.getHost ? provider.getHost() : null,
                method: provider.getMethod ? provider.getMethod() : null,
                headers: provider.getHeaders ? provider.getHeaders() : null,
                body: provider.getBody ? provider.getBody() : null,
                queryStrings: provider.getQueryStrings ? provider.getQueryStrings() : null,
                pathParameters: provider.getPathParameters ? provider.getPathParameters() : null,
            });
            resolve();
        }
        else {
            reject(new Error(HttpTrigger.ERROR_PROVIDER_NOT_SUPPORTED));
        }
    });
}

/**
 * Private method to invoke request handler
 * @param {Object} event Mapped event object
 * @returns {Promise} Promise resolves to a result, either an Object or String
 */
HttpTrigger.prototype._invokeHandler = function (event) {
    let self = this;
    let promise;
    if (self.requestHandler) {
        promise = self.requestHandler(event);
    }
    else {
        promise = self.handlers[event.method](event);
    }
    return self._isPromise(promise) ? promise : Promise.reject(new Error(event.method.toUpperCase() + HttpTrigger.ERROR_HANDLER_SIGNATURE_ERROR));
}

/**
 * Private method to invoke authorizer
 * @param {Object} event Mapped event object
 * @returns {Promise} Promise resolves null
 */
HttpTrigger.prototype._invokeAuthorization = function (event) {
    let self = this;
    let promise = self.authorizationHandler(event);
    return self._isPromise(promise) ? promise : Promise.reject(new Error('Authorization' + HttpTrigger.ERROR_HANDLER_SIGNATURE_ERROR));
}

// Helper methods
/**
 * Helper method that implements default authorizer
 * @param {Object} event Mapped event object
 * @returns {Promise} Promise resolves to null
 */
HttpTrigger.prototype._authorization = function (event) {
    return Promise.resolve();
}

/**
 * Helper method to handle the case where handler is not implemented
 * @param {String} handlerName Name of the handler, GET,POST,PUT,etc
 * @returns {Promise} Promis rejects to HttpTrigger.ERROR_NOT_IMPLEMENTED error message
 */
HttpTrigger.prototype._handlerNotImplemented = function (handlerName) {
    return Promise.reject(new Error(handlerName + HttpTrigger.ERROR_NOT_IMPLEMENTED));
}

/**
 * Helper method to retrieve service provider string from environment variable
 * @returns {String|null} Service provider string
 */
HttpTrigger.prototype._serviceProvider = function () {
    return process.env.SERVICE_PROVIDER ? process.env.SERVICE_PROVIDER.toLowerCase() : null;
}

/**
 * Helper method to check if AWS is the service provider
 * @param {Object} event Unmapped event object
 * @returns {Boolean} true if AWS else false
 */
HttpTrigger.prototype._isAws = function (event) {
    let self = this;
    if (self._serviceProvider() === 'aws') {
        return true;
    }
    if (event && event.headers && event.headers.Host) {
        return event.headers.Host.includes('amazonaws.com');
    }
    return false;
}

/**
 * Helper method to check if Azure is the service provider
 * @param {Object} event Unmapped event object
 * @returns {Boolean} true if Azure else false
 */
HttpTrigger.prototype._isAzure = function (event) {
    let self = this;
    if (self._serviceProvider() === 'azure') {
        return true;
    }
    if (event && event.req && event.req.headers && event.req.headers.host) {
        return event.req.headers.host.includes('azurewebsites.net');
    }
    return false;
}

/**
 * Helper method to check if the passed object is a Promise
 * @param {Promise} promise A promise object
 * @returns {Boolean} true if Promise else false
 */
HttpTrigger.prototype._isPromise = function (promise) {
    return promise && promise.then && typeof promise.then === 'function';
}

module.exports = HttpTrigger;
