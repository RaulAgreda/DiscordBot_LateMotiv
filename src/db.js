const { connect } = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await connect(process.env.MONGO_URL);
        console.log("MongoDB connected");
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
}

exports.connectDB = connectDB;
