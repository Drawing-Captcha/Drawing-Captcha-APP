const { MongoClient } = require('mongodb');
require('dotenv').config();

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
        console.log(`Deleted ${result.deletedCount} sessions.`);
    } catch (error) {
        console.error('Error cleaning sessions:', error);
    } finally {
        await client.close();
    }
}

module.exports = cleanSessions;