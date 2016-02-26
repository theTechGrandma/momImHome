var AWS = require("aws-sdk");
// Lambda function:
exports.handler = function (event, context) {

    console.log('Running event');
    
    // Send an SMS message to the number provided in the event data.
    // End the lambda function when the send function completes.
    TextMom(event.to, 'Mom Im home!', 
                function (status) { context.done(null, status); });  
};

// Sends an SMS message using SNS
// kindOfDay: response from Holly on the kind of day she had
// completedCallback(status) : Callback with status message when the function completes.
function TextMom(kindOfDay, callback) {
    var day = kindOfDay.value;
    console.log("Day value is " + day);
    
    if (day)
    {
        var sns = new AWS.SNS();
        var params = {
            Message: 'Holly is home and she had a ' + day + " day.", 
            TopicArn: 'arn:aws:sns:us-east-1:664961887072:MomImHome'
        };
    
        sns.publish(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else
            {   
                console.log("Success"); 
                
                 if ("good" === day)
                    {
                        speechOutput = "I'm glad to know you had a good day! " +
                        "I will inform your mom so she can raise the roof with her hands like your dad does. ";
                    } 
                    else if ("bad" === day)
                    { 
                        speechOutput = "I'm sorry you had a bad day. " +
                        "I will inform your mom but she will want to know why when she gets home. ";
                    }
                    
                    var sessionAttributes = {};
                    var speechOutput = speechOutput + "Ok, the message was sent.";
                            
                    var repromptText = "";
                    var shouldEndSession = true;
                    
                    callback(sessionAttributes,
                        buildSpeechletResponse(speechOutput, repromptText, shouldEndSession));
                    
            }
        });
    }
    else
        {
            var sessionAttributes = {};
            var shouldEndSession = false;
            speechOutput = "I'm not sure what kind of day you had. Please try again";
            repromptText = "I'm not sure what kind of day you had. You can tell me if " +
            "you had a good or bad day.";
            
            callback(sessionAttributes,
                        buildSpeechletResponse(speechOutput, repromptText, shouldEndSession));
        }
    }

/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.

exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
             context.fail("Invalid Application ID");
        }
        */

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session, 
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("MyDayIsIntent" === intentName) {
         var kindOfDay = intent.slots.Day;
         TextMom(kindOfDay, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        getWelcomeResponse(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var speechOutput = "Hello Boo Bear " +
        "I'm excited to learn about your day. Was it good or bad?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Tell me if your day was good or bad ";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(speechOutput, repromptText, shouldEndSession));
}



// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}