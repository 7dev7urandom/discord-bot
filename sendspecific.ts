import { Client } from 'discord.js';
const client = new Client();
client.on('message', async message => {
    if(message.content.startsWith("!sendzoey")) {
        const messagetext = message.content.split(' ').slice(1).join(' ');
        await message.guild?.members.fetch();
        message.guild?.members.cache.get('710696257768652802')?.send(messagetext);
    }
    console.log(message.content);
})
client.login('NzMwNzc4MDc0MjYxNDg3NzQ4.Xwce3w.N98cXlCAmoJL0dIToJFRoOO5qQE')