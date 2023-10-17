import { Schema, model } from "mongoose";

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

export default model("Audios", audioSchema);
