import { Client, MessageAttachment, ChannelLogsQueryOptions, Message, MessageEmbed, TextChannel, Guild } from 'discord.js'; 
const client = new Client();
client.once('ready', () => {
    console.log("Client ready!");
    mainGuild = client.guilds.cache.get('710742381409861642'); // MSG students
});
var messageJson: any = {};
var mainGuild: Guild | undefined;
client.on("message", async message => {
    // console.log("message: " + message.content);
    if(message.content.startsWith("!export")) {
        if (message.member?.roles.cache.has('710759824396255252')) {
            message.channel.send(`Message export requested by ${message.member?.displayName}. Messages exporting!`);
            
            var keepGoing = true;
            var totalMessages = 0;
            var lastMessage: Message | null = null;
            var prevLastMessage: Message | null = null;
            messageJson = {};
            while(keepGoing) {
                var config: ChannelLogsQueryOptions = {};
                if(lastMessage) {
                    if (lastMessage === prevLastMessage) break;
                    config.before = lastMessage['id'] || undefined;
                    prevLastMessage = lastMessage;
                }
                console.log("lastMessage is " + lastMessage + " and config is " + JSON.stringify(config));
                const messages = await message.channel.messages.fetch({ limit: 100 });
                    console.log("this many messages: " + messages.array().length);
                    var currentMessageCount = 0;
                    messages.forEach(message => {
                        currentMessageCount++;
                        totalMessages++;
                        // console.log(message.createdAt.toDateString());
                        // console.log(`MessageJson: ${JSON.stringify(messageJson)}`);
                        lastMessage = message;
                        if(messageJson[message.createdAt.toDateString()] === undefined) {
                            // We don't have any data saved for today
                            messageJson[message.createdAt.toDateString()] = {};
                            if(message.member?.displayName) {
                                messageJson[message.createdAt.toDateString()][message.member?.displayName] = 1;
                            } else {
                                console.log("Wrong context! Skipping...");
                                return;
                            }
                        } else if (messageJson[message.createdAt.toDateString()][message.member?.displayName || "null"] === undefined) {
                            // Do we have anything for this user yet?
                            if(message.member?.displayName) {
                                if(messageJson[message.createdAt.toDateString()][message.member?.displayName] === undefined) {
                                    messageJson[message.createdAt.toDateString()][message.member?.displayName] = 1;
                                } else {
                                    messageJson[message.createdAt.toDateString()][message.member?.displayName]++;
                                }
                            }
                        }

                        if(messageJson[message.createdAt.toDateString()][message.member?.displayName || "null"]) {
                            messageJson[message.createdAt.toDateString()][message.member?.displayName || "null"]++;
                        } else {
                            messageJson[message.createdAt.toDateString()][message.member?.displayName || "null"] = 1;
                        }
                    });
                    if (currentMessageCount < 100) keepGoing = false;
                    currentMessageCount = 0;
            }
            messageJson = {};
            message.channel.messages.cache.forEach(message => {
                // currentMessageCount++;
                // totalMessages++;
                // console.log(message.createdAt.toDateString());
                console.log(`MessageJson: ${JSON.stringify(messageJson)}`);
                // lastMessage = message;
                if(messageJson[message.createdAt.toDateString()] === undefined) {
                    // We don't have any data saved for today
                    messageJson[message.createdAt.toDateString()] = {};
                    if(message.member?.displayName) {
                        messageJson[message.createdAt.toDateString()][message.member?.displayName] = 1;
                    } else {
                        console.log("Wrong context! Skipping...");
                        return;
                    }
                } else if (messageJson[message.createdAt.toDateString()][message.member?.displayName || "null"] === undefined) {
                    // Do we have anything for this user yet?
                    if(message.member?.displayName) {
                        if(messageJson[message.createdAt.toDateString()][message.member?.displayName] === undefined) {
                            messageJson[message.createdAt.toDateString()][message.member?.displayName] = 1;
                        } else {
                            messageJson[message.createdAt.toDateString()][message.member?.displayName]++;
                        }
                    }
                }

                if(messageJson[message.createdAt.toDateString()][message.member?.displayName || "null"]) {
                    messageJson[message.createdAt.toDateString()][message.member?.displayName || "null"]++;
                } else {
                    messageJson[message.createdAt.toDateString()][message.member?.displayName || "null"] = 1;
                }
            });
            // if (currentMessageCount < 100) keepGoing = false;
            // currentMessageCount = 0;
            console.log("---------------- " + JSON.stringify(messageJson));
            const buf = Buffer.from(JSON.stringify(messageJson));
            const attachment = new MessageAttachment(buf, "messages.json");
            message.channel.send("Export complete! Here is the data", attachment);
        } else {
            message.reply("Sorry, only users with the Admin role can use this feature.")
        }
    } else if (message.content.startsWith('!poll')) {
        const pollsChannel = await client.channels.cache.get('733177335301406791');
        if(!pollsChannel) return;
        let args = message.content.split("=");
        if(args.length < 3) {
            message.reply("The syntax for this command is `!poll=<possible-reactions-seperated-by-commas>=<text>`\nExample:\n `!poll=👍,👎=Is MSG Bot awesome?` ");
            return;
        }
        args.shift();
        let reactions = args.shift()?.split(",");
        let polltext = args.join("=");
        const messageToSend = new MessageEmbed()
        .setColor('#caed05')
        .setTitle(`Poll by ${message.member?.displayName}:`)
        .setDescription(polltext);
        console.log("Adding poll: " + polltext);
        //@ts-ignore
        pollsChannel.send(messageToSend).then(sentMessage => {
            reactions?.forEach(reaction => {
                sentMessage.react(reaction.trim());
            })
        });
        message.delete();
    } else if (message.content.startsWith('!purge')) {
        if(!message.member?.hasPermission('MANAGE_MESSAGES')) {
            message.reply("You do not have permission to do that!");
            return;
        };
        let split = message.content.split(' ');
        split.shift();
        if (split.length == 1 && split[0] == "all") {
            const channel = message.channel;
            let messages;
            while((await channel.messages.fetch()).array().length > 0) {
                channel.bulkDelete(100);
            }
            message.reply("All messages have been purged!");
            return;
        }
        let num;
        if(!isNaN(parseInt(split[0]))) {
            num = parseInt(split[0]) + 1;
            message.channel.bulkDelete(num);
            message.reply("Deleted " + num + " messages!");
            return;
        }
        let user = getUserFromMention(split[0])
        if(user) {
            message.reply("This has not been implemented yet. Sorry!");
            return;
            if(split.length > 1) {
                num = parseInt(split[1]);
            } else {
                num = 100;
            }

            return;
        }
        message.reply("Missing parameter. Syntax: `!purge <<numberOfMessages>|<username>|all> [numberOfMessages]`");
    } else if (message.content.startsWith('!aaa')) {
        message.delete();
        message.reply("You found the secret easter egg! You now have the rainbow role.");
        message.member?.roles.add('750606553177915443');
    }
});
var colors = ['750606609574658058', '750606768354361356', '750606770497519647', '750606837455388713', '750606866165399565'];
setInterval(async () => {
    [... (await mainGuild?.roles.cache.get('750606553177915443')?.members.array() || [])].forEach(member => {
        colors.forEach(color => member.roles.remove(color));
        member.roles.add(colors[Math.floor(Math.random() * colors.length)]);
    });
}, 300000);
client.on('messageReactionAdd', (reaction, user) => {
    
});
client.on('messageDelete', async message => {
    const channel: TextChannel = <TextChannel> await client.channels.fetch('751349307382431845');
    const logMessage = new MessageEmbed()
        .setTitle("Message deleted in #" + (<TextChannel>message.channel).name)
        .setAuthor(message.author?.username + '#' + message.author?.discriminator, message.author?.avatarURL() || undefined)
        .setDescription(message.content)
        .setTimestamp(new Date())
        .setColor('#de6053')
        .setFooter("ID: " + message.id);
    channel.send(logMessage);
});
function getUserFromMention(mention: string) {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return client.users.cache.get(mention);
	}
}
client.login('NzMwNzc4MDc0MjYxNDg3NzQ4.Xwce3w.N98cXlCAmoJL0dIToJFRoOO5qQE');
