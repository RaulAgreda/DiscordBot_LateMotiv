const { connect } = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        console.log(process.env.PUBLIC_MONGO_URI);
        await connect(process.env.PUBLIC_MONGO_URI);
        console.log("MongoDB connected");
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
}

exports.connectDB = connectDB;
