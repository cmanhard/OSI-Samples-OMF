// sample.js

var config = require('./config.js');
const readline = require('readline');
var authObj = require('./auth.js');
var omfObj = require('./omfClient.js');

// retrieve configuration
var endpoint = config.endpoint;
var resource = config.resource;
var clientId = config.clientId;
var clientSecret = config.clientSecret;
var success = true;
var deleteData = true;
var errorCap = {};

var omfType = [{ 'id': 'TankMeasurement', 'type': 'object', 'classification': 'dynamic', 'properties': { 'Time': { 'format': 'date-time', 'type': 'string', 'isindex': true }, 'Pressure': { 'type': 'number', 'name': 'Tank Pressure', 'description': 'Tank Pressure in Pa' }, 'Temperature': { 'type': 'number', 'name': 'Tank Temperature', 'description': 'Tank Temperature in K' } } }];

var omfContainer= function() {
    return [{
        'id': 'Tank1Measurements',
        'typeid': 'TankMeasurement',
        'typeVersion': '1.0.0.0'
        }];
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

var refreshToken = function (res, authClient) {
    var obj = JSON.parse(res);
    authClient.token = obj.access_token;
    authClient.tokenExpires = obj.expires_on;
};

var logError = function (err) {    
    success = false;
    errorCap = err;

    console.log('Error');
    console.trace();
    console.log(err.message);
    console.log(err.stack);
    console.log(err.options.headers['Operation-Id']);
    throw err;
};

var app = function ()
{
    var omfURL = config.omfURL;
    var authClient = new authObj.AuthClient(resource);
    var omfClient = new omfObj.OMFClient(omfURL,authClient);
    var getClientToken;

    if(endpoint == 1){//OCS
        getClientToken = authClient.getToken(clientId,clientSecret, resource).then(
            function (res) {
                refreshToken(res, authClient);         
            }
        ).catch(function (err) { throw err });
    } else if(endpoint == 2){//EDS
        getClientToken =  function () {
            authClient.tokenExpires = 0;
        }      
                
    } else {//PI
        getClientToken =  function () {
            authClient.tokenExpires = 0;
            omfClient = new omfObj.OMFClient(omfURL, null, clientId, clientSecret);
        }      
    }

    var nowSeconds = function () { return Date.now() / 1000; };
    
    var createType = getClientToken.then(
        function (res) {
            console.log('Creating Type');
            if (authClient.tokenExpires >= nowSeconds) {
                return function (res) {
                        refreshToken(res, authClient);
                        return  omfClient.createType(omfType);
                    };
            } else {
                return  omfClient.createType(omfType);
            }
        }
    ).catch(function (err) { logError(err); });
    
    var checkContainerCreate = createType.then(
        function (res) {
            console.log('Check Type');
            containerObj = omfContainer();
            if (authClient.tokenExpires >= nowSeconds) {
                return function (res) {
                        refreshToken(res, authClient);
                        return  omfClient.createContainer(containerObj);
                    };
            } else {
                return  omfClient.createContainer(containerObj);
            }
        }
    ).catch(function (err) { logError(err); });   
    
    var createContainer = createType.then(
        function (res) {
            console.log('Creating Container');
            containerObj = omfContainer();
            if (authClient.tokenExpires >= nowSeconds) {
                return function (res) {
                        refreshToken(res, authClient);
                        return  omfClient.createContainer(containerObj);
                    };
            } else {
                return  omfClient.createContainer(containerObj);
            }
        }
    ).catch(function (err) { logError(err); });    
    
    var sendDataWrapper = createContainer.then(
        function (res) {            
            console.log('Creating Data');            
            if(process.argv.length >0){
                process.argv.forEach(function (val, index, array) {
                    sendData(val);
                });

            }
            createData();        
        }        
    ).catch(function (err) { logError(err); });

    var createData = function (){
        if(!ending){
            rl.question('Enter pressure, temperature? n to cancel:', (answer) => {
                sendData(answer);
            });
        }
    }

    var ending = false;
    
    var sendData = function (answer){
        try{
            if(answer== "n"){
                appFinished();                    
            }
            else{
                var arr = answer.split(',');
                var currtime = new Date();
                var dataStr = `[{ "containerid": "Tank1Measurements", "values": [{ "Time": "${currtime.toISOString()}", "Pressure": ${arr[0]}, "Temperature": ${arr[1]} }] }]`;
                var dataObj = JSON.parse(dataStr);
                if (authClient.tokenExpires >= nowSeconds) {
                    return function (res) {
                            refreshToken(res, authClient);
                            return  omfClient.createData(dataObj).then(createData());
                        };
                } else {
                    return  omfClient.createData(dataObj).then(createData());
                }  
            }                  
        }
        catch(err)
        {
            logError(err);
            appFinished();
        }

    }

    var appFinished = function () {
            ending = true;
            console.log();

            if(!success){
                throw errorCap;
            }

            if(deleteData){
                console.log('Deleting Container');
                omfClient.createContainer(omfContainer()).then(
                        function (res) {        
                            console.log('Deleting Type'); 
                            omfClient.deleteType(omfType).then(
                                function (res) {         
                                    process.exit();
                                });
                        }
                    );
            }
            else{
                console.log('All values sent successfully!');
                process.exit();
            }
        }    
            
    if(!success){
        throw errorCap;
    }

    return getClientToken;
};

process.argv= process.argv.slice(2);
app();