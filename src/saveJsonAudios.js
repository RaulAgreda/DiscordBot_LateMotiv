const { connectDB } = require("./db.js");
const AudioModel = require('./audios.model.js');
const fs = require('fs');
const path = require('path');

async function saveJsonAudios()
{
    await connectDB();
    const audios = JSON.parse(fs.readFileSync(path.join(__dirname, 'personalizedAudios_good.json')));
    for (const user_audios of audios)
    {
        const userId = user_audios['userId']
        const audiosArray = user_audios['audios']
        console.log(`Saving audios for user ${userId}`);
        try {
            await AudioModel.model.findOneAndUpdate({ userId: userId, audios: audiosArray }, { upsert: true });
        }
        catch (e)
        {
            console.log(e);
        }
    }
}

saveJsonAudios().then(() => {
    console.log("Done!");
    process.exit(0);
});
