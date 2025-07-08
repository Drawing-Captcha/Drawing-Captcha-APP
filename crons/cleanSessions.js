const { MongoClient } = require('mongodb');
require('dotenv').config();
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

async function cleanSessions() {
    const uri = process.env.MONGO_URI; 
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db(); 
        const sessions = database.collection('mySessions');

        
        const query = {
            $and: [
                { "session.user": { $exists: false } },
                { "session.captchaSession": { $exists: false } }
            ]
        };

        const result = await sessions.deleteMany(query);
        logger.info(`Deleted ${result.deletedCount} sessions.`, {
            operation: 'clean_sessions',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        logger.error(`Error cleaning sessions: ${error}`, {
            operation: 'clean_sessions',
            error: error
        });
    } finally {
        await client.close();
    }
}

module.exports = cleanSessions;