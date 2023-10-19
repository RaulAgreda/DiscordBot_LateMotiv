const { connectDB } = require("./db.js");
const AudioModel = require('./audios.model.js');
const { getAudios, setAudios } = require('./dbFunctions.js');

async function Test()
{
    await connectDB();
    const userId = "default";
    // await setAudios(userId);
    const audios = await getAudios(userId);
    if (audios)
        console.log(audios);
    else
        console.log("No audios");
}

Test().then(() => {
    console.log("Done!");
    process.exit(0);
});