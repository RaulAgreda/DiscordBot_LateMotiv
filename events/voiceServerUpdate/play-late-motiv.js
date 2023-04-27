module.exports = (oldState, newState) => {
    
    console.log("Voice server update");
    if (oldState.member.user.bot) return;
    // If the user is joining a channel
    if (oldState.channelId !== newState.channelId && newState.channelId !== null)
        playLateMotiv(newState.member);
    
    // If the user is leaving a channel
    else if (oldState.channelId !== null && newState.channelId === null)
        playLateMotiv("leave", oldState.channel);
    
};