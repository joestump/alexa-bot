'use strict';

const AWS = require('aws-sdk');

// Returns a random integer between min (inclusive) and max (inclusive)
const getRandomInt = (min, max) => Math.floor(Math.random() * ((max - min) + 1)) + min;

module.exports.luckyNumber = (event, context, callback) => {
  const upperLimit = event.request.intent.slots.UpperLimit.value || 100;
  const number = getRandomInt(0, upperLimit);
  const response = {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'PlainText',
        text: `Your lucky number is ${number}`,
      },
    },
  };

  callback(null, response);
};

const suffixOf = function(i) {
  var j = i % 10,
      k = i % 100;

  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
};

module.exports.bookBoarding = (event, context, callback) => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
    'Friday', 'Saturday'];

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const dropoff = new Date(event.request.intent.slots.Dropoff.value);
  const pickup = new Date(event.request.intent.slots.Pickup.value);

  const prettyDropoff = daysOfWeek[dropoff.getDay()] + ', ' + months[dropoff.getMonth()] + ' ' + suffixOf(dropoff.getDate()) + ', ' + dropoff.getFullYear();
  const prettyPickup =  daysOfWeek[pickup.getDay()] + ', ' + months[pickup.getMonth()] + ' ' + suffixOf(pickup.getDate()) + ', ' + pickup.getFullYear();

  const confirmMessage = 'I have notified Rose City Vetinary you will be dropping the dogs off ' + prettyDropoff + ' and plan to pick them up ' + prettyPickup + '.'; 
  console.log(confirmMessage);
  
  const ses = new AWS.SES();

  const emailMessage = "Hello there, \n\n" + 
    "We're heading out of town and would like to book our dogs for boarding. " +
    "We'd like to drop off our dogs " + prettyDropoff + " and plan " +
    "on picking them up " + prettyPickup + ".\n\n" +
    "This request was sent by my personal robot assistant. You can confirm " +
    "with me at 971-285-6400 or by replying to this email." +
    "\n\nCheers,\n\n--Joe";

  const params = { 
    Source: 'joe@stu.mp', 
    Destination: {
      ToAddresses: ['joe@stu.mp']
    },
    Message: {
      Subject: {
        Data: 'Need to schedule boarding for our dogs'
      },
      Body: {
        Text: {
          Data: emailMessage
        }
      }
    }
  };

  console.log(params);

  ses.sendEmail(params, (err, data) => {
    if (err) {
      console.log(err);
      throw err;
    }

    const response = {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: confirmMessage
        }
      }
    };

    console.log(data);

    callback(null, response);
  });
};
