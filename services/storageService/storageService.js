const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const getStorageURL = async (token, docId) => {
    try {
        // logger.info(`Function: getStorageURL called`);
        const before = new Date().valueOf();
        let response = await axios.get(process.env.STORAGEURL + 'api/file-metas/' + docId,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
        const after = new Date().valueOf();
        // logger.info(`Function: getStorageURL, Time Elapsed: ${(after - before) / 1000} sec`);
        return response.data.signedUrl;
    } catch (err) {
        throw new Error(err.message);
    }
}

const uploadFile = async (token,filepath,reqBody) => {
    try {
        // logger.info(`Function: uploadFile called`);
        const before = new Date().valueOf();
        let payload = {
            "useCase": reqBody.useCase,
            "contextId": reqBody.contextId,
            "fileType": reqBody.type,
            "fileName": reqBody.fileName,
        }
        const formData = new FormData();
        filepath = path.join(__dirname, '../../attachments/') + `${reqBody.fileName}`;
        formData.append('fileContent', fs.createReadStream(filepath));
        Object.keys(payload).forEach(key => {
            formData.append(key, payload[key]);
        });
        let response = await axios.post(process.env.STORAGEURL + 'api/file-metas', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': `multipart/form-data;boundary=${formData._boundary}`
            },
        });
        const after = new Date().valueOf();
        // logger.info(`Function: uploadFile, Time Elapsed: ${(after - before) / 1000} sec`);
        return response.data;
    } catch (err) {
        // logger.error(`Error in uploadFile: ${err.message}`);
        console.log(err)
    }
}

module.exports = {
    getStorageURL,
    uploadFile,
}