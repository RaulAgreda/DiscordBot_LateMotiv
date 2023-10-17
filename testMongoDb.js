const { connectDB } = require("./db.js");
const AudioModel = require('./audios.model.js');
const { getAudios, setAudios } = require('./personalizedAudiosFunctions.js');

async function Test()
{
    await connectDB();
    const userId = "123";
    const audios = await setAudios(userId, ["1", "2", "3"]);
    console.log(audios);
}

Test().then(() => {
    console.log("Done!");
    process.exit(0);
});