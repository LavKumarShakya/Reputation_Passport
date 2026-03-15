const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://LavPass:lpfkdOfP2ahg5CVO@reputationpassport.ltwom3l.mongodb.net/reputation-passport?appName=ReputationPassport";

const UserSchema = new mongoose.Schema({
    handle: String,
    techStack: Map,
    connectedProviders: Object
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('CONNECTED');
        
        const u = await User.findOne({ handle: 'LavKumarShakya' });
        if (u) {
            console.log('USER_FOUND');
            console.log('TECH_STACK:', JSON.stringify(u.techStack));
            const github = u.connectedProviders?.github;
            console.log('GITHUB_TOKEN:', !!github?.accessToken);
        } else {
            console.log('USER_NOT_FOUND');
        }
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

check();
