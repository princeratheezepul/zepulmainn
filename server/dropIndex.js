import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

async function dropIndex() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected.");

        console.log("Dropping index jobtitle_1 on jobs collection...");
        await mongoose.connection.collection('jobs').dropIndex('jobtitle_1');
        console.log("Successfully dropped index.");
    } catch (error) {
        if (error.codeName === 'IndexNotFound') {
            console.log("Index not found, probably already dropped.");
        } else {
            console.error("Error dropping index:", error);
        }
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

dropIndex();
