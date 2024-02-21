const {getEmail} = require('./services/downloadAttachment/downloadAttachment');
const {uploadFile} = require('./services/storageService/storageService');
const {getToken} = require('./services/storageService/janus');
const {publishMessage} = require('./services/pubSub/publish');
const {listenForMessages} = require('./services/pubSub/subscribe');
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const run = async()=>{
    try{
        let {attachments} = await getEmail();
        let token = await getToken();      
        for(let i=0;i<attachments.length;i++){
            let reqBody = {
                useCase: "courier_pincode_mapping",
                type: "pdf",
                contextId: "email@gmail.com",
                contextType: 'shipment',
                fileName: attachments[i]?.attachmentS
            }
            let response = await uploadFile(token, attachments[i]?.attachments, reqBody);
            response.messageId=attachments[i]?.messageId
            publishMessage(process.env.PUBLISH_TOPIC, response);
        }
        return
    }catch(err){
        console.log(err.message)
    }
}
run()