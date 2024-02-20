const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), '../../token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), '../../credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

// async function listLabels(auth) {
//     const gmail = google.gmail({ version: 'v1', auth });
//     const res = await gmail.users.labels.list({
//         userId: 'me',
//     });
//     const labels = res.data.labels;
//     if (!labels || labels.length === 0) {
//         console.log('No labels found.');
//         return;
//     }
//     console.log('Labels:');
//     labels.forEach((label) => {
//         console.log(`- ${label.name}`);
//     });
// }
async function getEmails(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    const userId = 'me';
    const query = 'subject:resume'; // Filter by subject "resume"

    const response = await gmail.users.messages.list({ userId, q: query});
    const messages = response.data.messages || [];
    if(messages.length === 0) {
        console.log(`No emails found with the subject ${query}`);
        return;
    }
    for (const message of messages) {
        const email = await gmail.users.messages.get({ userId, id: message.id });
        const attachments = getAttachments(email.data.payload);
        for (const attachment of attachments) {
            const attachmentData = await gmail.users.messages.attachments.get({
                userId,
                messageId: message.id,
                id: attachment.id,
            });
            const data = attachmentData.data.data;
            const buff = Buffer.from(data, 'base64');
            await fs.mkdir('../../attachments', { recursive: true });
            await fs.writeFile(`../../attachments/${attachment.filename}`, buff);
        }
    }
}

function getAttachments(payload) {
    const parts = payload.parts;
    if (!parts) return [];
    const attachments = [];
    for (const part of parts) {
        if (part.filename && part.filename.length > 0) {
            const data = part.body;
            if (data) {
                const attachment = {
                    id: data.attachmentId,
                    filename: part.filename,
                    mimeType: part.mimeType,
                    fileExtension: part.filename.split('.').pop(),
                };
                attachments.push(attachment);
            }
        } else if (part.parts) {
            const nestedAttachments = getAttachments(part);
            attachments.push(...nestedAttachments);
        }
    }
    return attachments;
}

const main = async () => {
    try{
        const auth = await authorize();
        await getEmails(auth);
        return { success: true, message: 'Emails downloaded successfully' };
    }catch(err){
        console.log(err);
        return { success: false, message: err.message };
    }
}
module.exports = {
    getEmail:main
}
