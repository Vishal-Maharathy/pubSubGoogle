// const { logger: parentLogger } = require('./logger');
const axios = require("axios");
// const logger = parentLogger.child({ file: __filename })
const NodeCache = require( "node-cache" );
let cache = new NodeCache( { stdTTL: 100 } );
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

async function generateJanusToken(clientId,clientSecret,tokenURL,context){
    try{
        let client_id = clientId ?? process.env.JANUS_CLIENT;
        let client_secret = clientSecret ?? process.env.JANUS_SECRET;

        let url = tokenURL ?? process.env.JANUS_TOKEN_URL;
        const token = `${client_id}:${client_secret}`;
        const encodedToken = Buffer.from(token).toString('base64');

        const params = new URLSearchParams({
            grant_type: "client_credentials"
        })

        let response = await axios.post(url,params.toString(),{
            headers:{
                'Authorization': `Basic ${encodedToken}`,
                'Content-Type':'application/x-www-form-urlencoded'
            }
        });
        if(response.data){
            let key = context ?? "janus-token";
            let response_data = response?.data;
            let value = response_data?.access_token;
            let ttl = (jwt.decode(value).exp*1000 - new Date().valueOf())/1000;
            cache.set(key,value,ttl);
            console.log("Janus token stored in cache!!");
            return value;
        }
    }catch(err){
        // logger.error(err.message);
        console.log(err)
    }
}
const getToken = async (clientId,clientSecret,tokenURL,context)=>{
    const before = new Date().valueOf();
    token = context ? cache.get(context) : cache.get('janus-token');
    if(token === undefined){
        token = await generateJanusToken(clientId,clientSecret,tokenURL,context);
        const after = new Date().valueOf();
        console.log(`Function: getToken, Time Elapsed: ${(after-before)/1000} sec`);
        // logger.info(`Function: getToken, Time Elapsed: ${(after-before)/1000} sec`);
        return token;
    }
    const after = new Date().valueOf();
    console.log(`Function: getToken, Time Elapsed: ${(after-before)/1000} sec`);
    // logger.info(`Function: getToken, Time Elapsed: ${(after-before)/1000} sec`);
    return token;
}

module.exports={
    getToken
}