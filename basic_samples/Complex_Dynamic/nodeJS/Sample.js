// Sample.js

var http = require("http");
var config = require("./config.js");

// retrieve configuration
var resource = config.resource;
var clientId = config.clientId;
var clientSecret = config.clientSecret;
var tenantId = config.tenantId;
var apiVersion = config.apiVersion;
var success = true;
var errorCap = {};


var logError = function (err) {    
    success = false;
    errorCap = err;
    if  (typeof (err.statusCode) !== "undefined" && err.statusCode === 302) {
        console.log("Error");
        console.trace();
    }
    else {
        console.trace();
        console.log(err.message)
        console.log(err.stack)
        console.log(err.options.headers['Operation-Id'])
        throw err;
    }
};

var app = function (request1, response)
{
    if(request1 != null){
        if (request1.url === '/favicon.ico') {
            return;
        }
        response.writeHead(200, { "Content-Type": "text/plain" });

        response.write("Sds Service Operations Begun!\n");
        response.write("Check the console for updates")
    }

    var clientObj = require("./Auth.js");

    var sampleNamespaceId = config.namespaceId;

    var client = new clientObj.SdsClient(resource, apiVersion);

    // Step 1
    var getClientToken = client.getToken(clientId,clientSecret, resource)
        .catch(function (err) { throw err });

    var nowSeconds = function () { return Date.now() / 1000; };

    // create an SdsType
    var createType = getClientToken.then(
        // Step 2
        function (res) {
            console.log("\nCreating an SdsType")
            refreshToken(res, client);
            if (client.tokenExpires < nowSeconds) {
                return checkTokenExpired(client).then(
                    function (res) {
                        refreshToken(res, client);
                        return client.createType(tenantId, sampleNamespaceId, sampleType);
                    }).catch(function (err) { logError(err); });
            } else {
                return client.createType(tenantId, sampleNamespaceId, sampleType);
            }
        }
    ).catch(function (err) { logError(err); });

    
    if(request1 != null){
        response.end();
    }
    
    if(!success){
        throw errorCap;
    }

    return getClientToken;
};

//if you want to run a server
var toRun =  function() {
    //This server is hosted over HTTP.  This is not secure and should not be used beyond local testing.
    http.createServer(app).listen(8080);
}

app();
//console.log("Server is listening at http://localhost:8080/");
//console.log("Sds endpoint at " + resource);