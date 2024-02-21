const {getEmail} = require('./services/downloadAttachment/downloadAttachment');
const {uploadFile} = require('./services/storageService/storageService');
const {getToken} = require('./services/storageService/janus');
const {publishMessage} = require('./services/pubSub/publish');
const {listenForMessages} = require('./services/pubSub/subscribe');

const path = require('path');
const run = async()=>{
    try{
        let attachments = await getEmail();
        console.log(attachments)
        for(let i=0;i<attachments.length;i++){
            let token = await getToken();
            let reqBody = {
                useCase: "admin",
                type: "pdf",
                contextId: "",
                contextType: 'shipment',
                fileName: attachments[i].filename
            }
            let response = await uploadFile(token, attachments[i].filepath, reqBody);
            publishMessage(process.env.PUBLISH_TOPIC, response);
        }
    }catch(err){
        console.log(err.message)
    }
}
run()