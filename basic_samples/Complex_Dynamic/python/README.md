# Complex Dynamic OMF Python Sample

NEEDS BADGEs

This sample uses OSIsoft Message Format to send data to OSIsoft Cloud Services, Edge Data Store, or PI Web API. 

## Requirements

request 2.22.0

## Details

See [ReadMe](../) 

### Configuration

Configure desired OMF endpoints to receive the data in [config.ini](.\config.ini]).
The following fields are all of the default expected fields:
```ini
[Destination]
OCS = 
PI =
EDS = 

[Access]
omfURL = 

[Credentials]
id = 
password = 

[Configurations]
omfVersion = 
compression = 
WEB_REQUEST_TIMEOUT_SECONDS = 
VERIFY_SSL = 
```

note only 1 of OCS, PI, and EDS can be set at a time.
Configuration settings apply to all endpoints.  
Capitalized fields have default settings that are used if not entered.  

`VERIFY_SSL` may be set to false in order to bypass certificate validation.  This is helpful if PI Web API is configured to use a self-signed certificate. This will generate a warning; this should only be done for testing with a self-signed PI Web API certificate as it is insecure.

#### OSIsoft Cloud Services

An OMF ingress client must be configured.

1. Set `Destination` `OCS` to true. All others to empty or not in the .ini
1. `omfURL` should be the full omf URL.  For example: `https://dat-b.osisoft.com/api/v1/Tenants/{{tenant}}/Namespaces/{{namespace}}/omf`
1. `id` is your clientID
1. `password` is your clientSecret

#### Edge Data Store

1. Set `Destination` `EDS` to true.  All others to empty or not in the .ini
1. `omfURL` should be the full omf URL.  For example: `http://localhost:5590/api/v1/tenants/default/namespaces/default/omf/`

#### PI Web API

An OMF endpoint must be properly set up and configured.
      
1. Set `Destination` `PI` to true. All others to empty or not in the .ini
1. `omfURL` should be the full omf URL.  For example: `https://{{webapi_machine}}/piwebapi/omf`
1. `id` is your username
1. `password` is your password 


## Running the Sample

1. Clone the GitHub repository
1. Install required modules: `pip install -r requirements.txt`
1. Open the folder with your favorite IDE
1. Update `config.ini` with tour credentials
1. Check and update the program to ensure you are sending to OCS or PI.
1. Run `program.py` from commandline run `python program.py`

To test the sample after running it:

1. Run `python test_sample.py`

or

1. Install pytest `pip install pytest`
1. Run `pytest test_sample.py`


---
 
For the OMF landing page [ReadMe](../../../)  
For the OSIsoft Samples landing page [ReadMe](https://github.com/osisoft/OSI-Samples)