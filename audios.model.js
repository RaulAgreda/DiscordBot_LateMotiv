const { Schema, model } = require("mongoose");

const audioSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    audios: {
        type: [String],
        required: true,
    }
});

module.exports = {
    model: model("Audios", audioSchema)
} 
