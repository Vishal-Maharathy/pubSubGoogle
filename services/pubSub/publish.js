/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');
const path = require('path');
// Creates a client; cache this for further use
const pubSubClient = new PubSub({keyFilename: path.join(__dirname, '../../key.json')});

async function publishMessage(topicNameOrId, data) {
  try {
      let msg = JSON.stringify({success:true, message:data});
      const dataBuffer = Buffer.from(msg);
      const messageId = await pubSubClient
        .topic(topicNameOrId)
        .publishMessage({data: dataBuffer});
      console.log(`Message ${messageId} published.`);
  } catch (error) {
    console.error(`Received error while publishing: ${error.message}`);
    process.exitCode = 1;
  }
}
// publishMessage('testTopic', 'Hello, World!');
module.exports = {
  publishMessage
}