const HttpTrigger = require('../index');
const AWS_TEST_EVENT = require('./aws.http-trigger.event');
const AZURE_TEST_EVENT = require('./azure.http-trigger.event');

test ('Service provider return null', () => {
    let httpTrigger = new HttpTrigger();
    expect(httpTrigger._serviceProvider()).toBeNull();
})

test ('Service provider return aws', () => {
    let httpTrigger = new HttpTrigger();
    process.env['SERVICE_PROVIDER'] = 'aws';
    expect(httpTrigger._serviceProvider()).toEqual('aws');
})

test ('Service provider return azure', () => {
    let httpTrigger = new HttpTrigger();
    process.env['SERVICE_PROVIDER'] = 'azure';
    expect(httpTrigger._serviceProvider()).toEqual('azure');
})

test ('Service provider is aws due to process.env', () => {
    let httpTrigger = new HttpTrigger();
    process.env['SERVICE_PROVIDER'] = 'aws';
    expect(httpTrigger._isAws()).toBeTruthy();
})

test ('Service provider is aws due to event', () => {
    let httpTrigger = new HttpTrigger();
    process.env['SERVICE_PROVIDER'] = 'unknown';
    expect(httpTrigger._isAws(AWS_TEST_EVENT)).toBeTruthy();
})

test ('Service provider is azure due to process.env', () => {
    let httpTrigger = new HttpTrigger();
    process.env['SERVICE_PROVIDER'] = 'azure';
    expect(httpTrigger._isAzure()).toBeTruthy();
})

test ('Service provider is azure due to event', () => {
    let httpTrigger = new HttpTrigger();
    process.env['SERVICE_PROVIDER'] = 'unknown';
    expect(httpTrigger._isAzure(AZURE_TEST_EVENT)).toBeTruthy();
})

test ('Object is a Promise', () => {
    let httpTrigger = new HttpTrigger();
    expect(httpTrigger._isPromise(Promise.resolve())).toBeTruthy();
})

test ('Object is not a Promise', () => {
    let httpTrigger = new HttpTrigger();
    expect(httpTrigger._isPromise({then: 'object'})).toBeFalsy();
})

test ('_map rejects to ERROR_PROVIDER_NOT_SUPPORTED', () => {
    let httpTrigger = new HttpTrigger();
    process.env['SERVICE_PROVIDER'] = 'unknown';
    return expect(httpTrigger._map()).rejects.toThrow(HttpTrigger.ERROR_PROVIDER_NOT_SUPPORTED);
})

test ('_map resolves and aws event is ready', () => {
    let httpTrigger = new HttpTrigger();
    process.env['SERVICE_PROVIDER'] = 'unknown';
    return expect(
        httpTrigger._map(AWS_TEST_EVENT, {}, () => {})
        .then(() => {
            return  httpTrigger.event.host.includes('amazonaws.com');
        })
    ).resolves.toBeTruthy();
})

test ('_map resolves and azure event is ready', () => {
    let httpTrigger = new HttpTrigger();
    process.env['SERVICE_PROVIDER'] = 'unknown';
    return expect(
        httpTrigger._map(AZURE_TEST_EVENT)
        .then(() => {
            return  httpTrigger.event.host.includes('azurewebsites.net');
        })
    ).resolves.toBeTruthy();
})

test ('_handlerNotImplemented rejects to GET + ERROR_NOT_IMPLEMENTED', () => {
    let httpTrigger = new HttpTrigger();
    process.env['SERVICE_PROVIDER'] = 'unknown';
    return expect(httpTrigger._handlerNotImplemented('GET')).rejects.toThrow('GET' + HttpTrigger.ERROR_NOT_IMPLEMENTED);
})

test ('_handlerNotImplemented rejects to POST + ERROR_NOT_IMPLEMENTED', () => {
    let httpTrigger = new HttpTrigger();
    process.env['SERVICE_PROVIDER'] = 'unknown';
    return expect(httpTrigger._handlerNotImplemented('POST')).rejects.toThrow('POST' + HttpTrigger.ERROR_NOT_IMPLEMENTED);
})

test ('_handlerNotImplemented rejects to PATCH + ERROR_NOT_IMPLEMENTED', () => {
    let httpTrigger = new HttpTrigger();
    process.env['SERVICE_PROVIDER'] = 'unknown';
    return expect(httpTrigger._handlerNotImplemented('PATCH')).rejects.toThrow('PATCH' + HttpTrigger.ERROR_NOT_IMPLEMENTED);
})

test ('_handlerNotImplemented rejects to PUT + ERROR_NOT_IMPLEMENTED', () => {
    let httpTrigger = new HttpTrigger();
    process.env['SERVICE_PROVIDER'] = 'unknown';
    return expect(httpTrigger._handlerNotImplemented('PUT')).rejects.toThrow('PUT' + HttpTrigger.ERROR_NOT_IMPLEMENTED);
})

test ('_handlerNotImplemented rejects to DELETE + ERROR_NOT_IMPLEMENTED', () => {
    let httpTrigger = new HttpTrigger();
    process.env['SERVICE_PROVIDER'] = 'unknown';
    return expect(httpTrigger._handlerNotImplemented('DELETE')).rejects.toThrow('DELETE' + HttpTrigger.ERROR_NOT_IMPLEMENTED);
})

test ('_invokeAuthorization rejects to Authorization + ERROR_HANDLER_SIGNATURE_ERROR', () => {
    let httpTrigger = new HttpTrigger();
    httpTrigger.authorizationHandler = () => {};
    process.env['SERVICE_PROVIDER'] = 'unknown';
    return expect(httpTrigger._invokeAuthorization(httpTrigger.event)).rejects.toThrow('Authorization' + HttpTrigger.ERROR_HANDLER_SIGNATURE_ERROR);
})

test ('_invokeAuthorization resolves', () => {
    let httpTrigger = new HttpTrigger();
    process.env['SERVICE_PROVIDER'] = 'unknown';
    return httpTrigger._map(AWS_TEST_EVENT, {}, () => {})
    .then( () => {
        return httpTrigger._invokeAuthorization();
    })
})

test ('_invokeHandler rejects to POST + ERROR_HANDLER_SIGNATURE_ERROR', () => {
    let httpTrigger = new HttpTrigger();
    httpTrigger.postHandler = () => {};
    process.env['SERVICE_PROVIDER'] = 'unknown';
    return expect(
        httpTrigger._map(AWS_TEST_EVENT, {}, () => {})
        .then(() => httpTrigger._invokeHandler(httpTrigger.event))
    ).rejects.toThrow('POST' + HttpTrigger.ERROR_HANDLER_SIGNATURE_ERROR);
})

test ('_invokeHandler resolves to Request is handled', () => {
    const result = 'Request is handled';
    let httpTrigger = new HttpTrigger();
    httpTrigger.requestHandler = (event) => {
        return Promise.resolve(result);
    }
    process.env['SERVICE_PROVIDER'] = 'unknown';
    return expect(
        httpTrigger._map(AWS_TEST_EVENT, {}, () => {})
        .then( () => httpTrigger._invokeHandler(httpTrigger.event))
    ).resolves.toEqual(result);
})

test ('_invokeHandler resolves to POST is handled', () => {
    const result = 'POST is handled';
    let httpTrigger = new HttpTrigger();
    httpTrigger.postHandler = (event) => {
        return Promise.resolve(result);
    }
    process.env['SERVICE_PROVIDER'] = 'unknown';
    return expect(
        httpTrigger._map(AWS_TEST_EVENT, {}, () => {})
        .then( () => httpTrigger._invokeHandler(httpTrigger.event))
    ).resolves.toEqual(result);
})

test ('_invokeHandler resolves to GET is handled', () => {
    const result = 'GET is handled';
    let httpTrigger = new HttpTrigger();
    httpTrigger.getHandler = (event) => {
        return Promise.resolve(result);
    }
    process.env['SERVICE_PROVIDER'] = 'unknown';
    return expect(
        httpTrigger._map(AWS_TEST_EVENT, {}, () => {})
        .then( () => {
            httpTrigger.event.method = 'get';
            return httpTrigger._invokeHandler(httpTrigger.event);
        })
    ).resolves.toEqual(result);
})

test ('_invokeHandler resolves to PATCH is handled', () => {
    const result = 'PATCH is handled';
    let httpTrigger = new HttpTrigger();
    httpTrigger.patchHandler = (event) => {
        return Promise.resolve(result);
    }
    process.env['SERVICE_PROVIDER'] = 'unknown';
    return expect(
        httpTrigger._map(AWS_TEST_EVENT, {}, () => {})
        .then( () => {
            httpTrigger.event.method = 'patch';
            return httpTrigger._invokeHandler(httpTrigger.event);
        })
    ).resolves.toEqual(result);
})

test ('_invokeHandler resolves to PUT is handled', () => {
    const result = 'PUT is handled';
    let httpTrigger = new HttpTrigger();
    httpTrigger.putHandler = (event) => {
        return Promise.resolve(result);
    }
    process.env['SERVICE_PROVIDER'] = 'unknown';
    return expect(
        httpTrigger._map(AWS_TEST_EVENT, {}, () => {})
        .then( () => {
            httpTrigger.event.method = 'put';
            return httpTrigger._invokeHandler(httpTrigger.event);
        })
    ).resolves.toEqual(result);
})

test ('_invokeHandler resolves to DELETE is handled', () => {
    const result = 'DELETE is handled';
    let httpTrigger = new HttpTrigger();
    httpTrigger.deleteHandler = (event) => {
        return Promise.resolve(result);
    }
    process.env['SERVICE_PROVIDER'] = 'unknown';
    return expect(
        httpTrigger._map(AWS_TEST_EVENT, {}, () => {})
        .then( () => {
            httpTrigger.event.method = 'delete';
            return httpTrigger._invokeHandler(httpTrigger.event);
        })
    ).resolves.toEqual(result);
})

