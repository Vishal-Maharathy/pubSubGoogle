const {getEmail} = require('./services/downloadAttachment/downloadAttachment');
const {uploadFile} = require('./services/storageService/storageService');
const {getToken} = require('./services/storageService/janus');
const {publishMessage} = require('./services/pubSub/publish');
const {listenForMessages} = require('./services/pubSub/subscribe');
const path = require('path');
const run = async()=>{
    try{
        let {fileName} = await getEmail();
        const filePath = path.join(__dirname, 'attachments', fileName)
        console.log(filePath);
        const token = await getToken();
        let reqBody = {
            useCase: "admin",
            type: "pdf",
            contextId: "email@email.com",
            contextType: 'shipment',
            fileName: fileName
        }
        // let response = await uploadFile(token, filePath, reqBody);
        let response = 'LINK'
        publishMessage(process.env.PUBLISH_TOPIC, response);
    }catch(err){
        console.log(err.message)
    }
}
run()