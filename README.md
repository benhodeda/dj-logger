# dj-logger
Transactional logger. Keep it simple to write log about transactions in asynchronous application.    

[![Version npm](https://img.shields.io/npm/v/dj-logger.svg?style=flat-square)](https://www.npmjs.com/package/dj-logger)

[![NPM](https://nodei.co/npm/dj-logger.png?downloads=true&downloadRank=true)](https://nodei.co/npm/dj-logger/)
  
##Motivation
Dj-logger is a logging library for node.js (wrapping Winston library), that helps you write logs with request context.

Node.js is a single threaded engine for any internal work. When it comes to external work (like accessing DB, IO, etc.) we'll most likely want to use another thread to handle other requests to our server until the external works will finish.
This behavior makes it hard to write logs with fully context of the request in every step of our flow.
For example, assume you want to set a Guid for a server request, and write it in every log of an asynchronous flow.
 You'll probably set the Guid when the flow starts, save it somewhere in your app and use it every time you write a log.
    
That way, when your server will get its first request your logs will contain the request Guid you set, all the way of your asynchronous action.
Now, assume that your server decided to handle a second request while it waiting to this action to finish. It'll set the second request Guid and override the first Guid!
When the asynchronous action will finish, every time you'll want to use the request id, you'll end up using the second request id!

One way to solve this problem is to give access to the request object (the one you get in your route handler), from any point of your app.
Most of the time you won't want to do this, because most of your code shouldn't be aware of the request context, especially when you need this information just for logs.
   
Dj-logger gives you a transparent way to set transactional parameters like request id and write them in any of the request log.

##Installation

```bashp
npm install dj-logger
```

##Usage

There are several features you would like to be aware of:

* [Logger Initialization](#logger-initialization)
* [Using Winston Logger](#using-winston-logger)
* [Transactions](#transactions)
    * [Initialize Transactions](#initialize-transactions)
    * [Set Transactional Parameters](#set-transactional-parameters)
    * [Measure Actions in Transaction](#measure-actions-in-transactions)

###Logger Initialization

```javascript
var dj = require('dj-logger');
var config = require('./logger.config'); //configuration for the logger
var loggerFactory = new dj.LoggerFactory(config);
var logger = loggerFactory.get('logger-name', config);
```

The LoggerFactory initialized with the loggers' configuration and can retrieve logger by its name using the `get` method.
The second overload of `get` method receives logger name (yours to choose) and a configuration for the logger.
In case you've already created a logger with this name, the factory will return it (ignoring the new configuration), Otherwise it'll create a new logger and will set its settings according to the configuration object.
(see [Setup Logger Configuration](#setup-logger-configuration) to understand the configuration of the logger)

After you have an instance of the logger, you can start writing logs!

###Setup Logger Configuration

Dj-logger configuration is a Json object, which its keys is the different loggers' names and the value of each is the logger configuration.
A logger configuration is a Json object, which its keys is the transport method name and the value is Winston's settings for this transport.
The current supported transports are Winston's supported transports (which its key is the transport's name) and custom transport.
You can use a custom key for a custom transport and set in its settings a 'module' which contains your transport module name.

For example:

```javascript
{
    "my-logger": {
        "file": {
            "formatter": "splunk",
            "filename": "./log.txt",
            "level": "debug",
            "silent": false,
            "colorize": false,
            "maxsize": 100 * 1000 * 1024,
            "maxFiles": 100,
            "json": false,
            "zippedArchive": false,
            "fsoptions": {flags: "a"}
        }
    }
}
```

As you can see, the configuration sets a single file transport and sets its settings. The transport's settings are the same as Winston transport's settings, with one exception - the formatter option.
Winston library gives you a way, through the transport's settings to set a formatter function of your own.
Dj-logger comes with new approach that gives you a way to inherit from base Formatter class and override the format function. After calling super.format(log) in your format function, all the transactional parameters will be accessible through `log.meta`.
For example, assume that I've create a new formatter module and called it MyFormatter, which contains the following code:

```javascript
var Formatter = require('dj-logger').Formatter;

module.exports = class MyFormatter extends Formatter {
    format(log) {
            super.format(log); //you MUST call base formatter before your logic!
            
            // format the log object to your custom string and return it.
            
        }
}
```

Now, to use this formatter, all you need to do is to declare it in your configuration:
```javascript
{
    file: {
        formatter: 'MyFormatter',
        ...
    }
}
```

By default, Dj-logger comes with 2 kinds of formatter - Winston default formatter (to use it you need to remove the formatter option from configuration) and Splunk formatter (easy format for Splunk engine to read, you can use it by specifying 'splunk' in the formatter option, as I've done in the first example).
 
For more information about other configuration settings you can see [Winston's documentation](https://github.com/winstonjs/winston/blob/master/README.md).

###Using Winston Logger

Dj-logger is based on winston logging library and you can use the logger the exactly the same way you are using winston.
For more information about Winston logger you can see [Winston's documentation](https://github.com/winstonjs/winston/blob/master/README.md).


###Transactions

The main use of Dj-logger is for handling transactions that involve asynchronous actions. In this section, I'll explain how simple it is to use Dj-logger to solve this problem 

####Initialize Transactions

Dj-logger uses the library Continuation-Local-Storage to handle all the context issues. It means every request should run in its own namespace.
By using Dj-logger you don't need to be aware of this mechanism (if you want to know more, you can read [Continuation-Local-Storage's documentation](https://github.com/othiym23/node-continuation-local-storage/blob/master/README.md)), you simply need to use the startTransaction middleware exposed by Dj-logger BEFORE your routes handlers

```javascript
var dj = require('dj-logger');
var config = require('./logger.config');
var logger = dj.LoggerFactory.get('logger-name', config);

var app = express();

app.use(dj.startTransaction(logger,'YOUR-SYSYTEM-NAME','SYSTEM-COMPONENT', (req) => logger.setParam("user", req.headers.user)));

//your routes comes here!
```

The startTransaction method sets your first transactional parameters and returns a middleware that sets any request in its own namespace.
The startTransaction parameters are: the transactional logger (each transactional logger should be initiate separately), your system name, the name of the system's component (e.g. "App Server", "Users Micro-Service", etc.), a callback that receives the request object and will execute before the call to next() method (optional).
After executing this middleware, your logs will contain transactionId (generated automatically, or sets by the request's 'transaction-id' header), your system name, your current system component and requestUrl.
 
###Set Transactional Parameters

There are two ways to set transactional parameters: single parameter and many parameters at once.
The Logger expose two methods: `setParam` and `setMany` to handle the above.

Examples:
```javascript
logger.setParam('myParam', 'myValue');
```

The code above sets a transactional parameter called 'myParam' and sets its value to 'myValue'. This parameter will be accessible in your custom formatter and from the (already exists) splunk formatter in every log written in the current request.
The Splunk formatter will write this parameter in every log in the current request context that will come after this code.

Examples:
```javascript
logger.setManyParams({
    one: 'First Value',
    two: 'Second Value'
});
```

This code will set two transactional parameters called 'one' and 'two' with the values 'First Value' and 'Second Value'. Those parameters will be accessible in your custom formatter and from the (already exists) Splunk formatter in every log written in the current request.
The Splunk formatter will write those parameters in every log in the current request context that will come after this code.


###Measure Actions in Transaction

One of the coolest features of Dj-logger is its simple logging of functions or promises measurement.

Measure Functions:
```javascript
function f1() {
    //some code...
}

let x = logger.measure('myMeasure', f1, "f1 measure");
//more code...
logger.logMeasurements('my message');
```

The code above will execute and measure the method f1. The first parameter is a name for the measurement, the second parameter is the method or promise to measure and the last parameter (optional) tells the logger to log the measurement right after f1 finished its executing with message "f1 measure". If the third parameter (which is a log message) exists, the measurements will be logged as info with this message and parameter myMeasureTime=x (x will be the number of milliseconds took to execute f1). 
If the third parameter is absent or set to false, all the measurements of the request will be stored until executing logMeasurements. logMeasurements will write info log with the measures results (all the measures in single log).
When calling measure with function as the second parameter, measure's return value will be the input function's return value.

Assume we have the following code:
```javascript
logger.measure('myMeasure', f1);
logger.measure('myMeasure', f1);
logger.measure('myMeasure', f1);
logger.measure('myMeasure', f1);
logger.logMeasurements('my message');
```

logMeasurements will print an info log with the following details: myMeasureTotalTime (the total time of all the measures called 'myMeasure' in milliseconds), myMeasureCount (the count of measures called 'myMeasure', in this example it will be 4), myMeasureAvgTime (the average time of all the measures called 'myMeasure' in milliseconds), myMeasureMin and myMeasureMax (the minimum and maximum time of all the measures called 'myMeasure' in milliseconds).


Measure Promises:
```javascript
function f1() {
    //some asyn code that return a promise
}

logger.measure('myMeasure', f1, "f1 measure").then((result) => console.log(`f1 result is ${result}`));
//more code...
logger.logMeasurements('my message');
```

This code executes the same way as function measuring, except when getting a promise as the second parameter, measure's return value is a promise containing f1 result.
You can do number of promise measures with the same name, it will act the same as number of function measures with the same name.
