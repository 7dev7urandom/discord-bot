import { Client, MessageAttachment, ChannelLogsQueryOptions, Message, MessageEmbed, TextChannel, Guild, PermissionOverwrites } from 'discord.js'; 
import { get } from 'https';
import { readFileSync } from 'fs';
try{

    const client = new Client();
    client.once('ready', async () => {
        console.log("Client ready!");
        mainGuild = client.guilds.cache.get('710742381409861642'); // MSG students
        client.user?.setPresence({
            status: "online",
            activity: {
                type: "WATCHING",
                name: "for !aaa"
            }
        });
        const x = mainGuild?.channels.resolve('753790911044911116');
        if (x) (<TextChannel> await x.fetch()).send("MSG bot loaded");
    });
    var messageJson: any = {};
    var mainGuild: Guild | undefined;
    
    const blogId = '750303283616153641';
    
    
    client.on("message", async message => {
        // console.log("message: " + message.content);
        if(!(message.guild === mainGuild)) return;
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
                message.reply("Sorry, only Administrators can use this feature.")
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
                if(!message.member.hasPermission('ADMINISTRATOR')) {
                    message.reply("Only administrators can clear whole channels!");
                    return;
                }
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
        } else if (message.content.startsWith('!disable')) {
            message.guild?.channels.cache.forEach(channel => {
                // if(channel.type !== "text" || !channel.parentID || channel.parentID !== '710742381409861643') return;
                // if(channel.id !== '710742381409861645') return;
                if ((channel.type !== 'category' || channel.id !== '710742381409861643') && channel.id !== '710742381409861645' && channel.id !== '753468247948656671') return;
                channel.updateOverwrite('749869767527104513', { SEND_MESSAGES: false }, 'Disabling message send abilities for people who should be in school');
            });
        } else if (message.content.startsWith('!enable')) {
            message.guild?.channels.cache.forEach(channel => {
                // if(channel.type !== "text" || !channel.parentID || channel.parentID !== '710742381409861643') return;
                // if(channel.id !== '710742381409861645') return;
                if ((channel.type !== 'category' || channel.id !== '710742381409861643') && channel.id !== '710742381409861645' && channel.id !== '753468247948656671') return;
                channel.updateOverwrite('749869767527104513', { SEND_MESSAGES: null }, 'Enabling message send abilities for school people');
            });
        }
        // } else if (message.content.startsWith('!pol2')) {
        //     const pollsChannel = await client.channels.cache.get('749870145962508349');
        //     if(!pollsChannel) return;
        //     let args = message.content.split("=");
        //     if(args.length < 3) {
        //         message.reply("The syntax for this command is `!poll=<possible-reactions-seperated-by-commas>=<text>`\nExample:\n `!poll=👍,👎=Is MSG Bot awesome?` ");
        //         return;
        //     }
        //     args.shift();
        //     let reactions = args.shift()?.split(",");
        //     let polltext = args.join("=");
        //     const messageToSend = new MessageEmbed()
        //     .setColor('#caed05')
        //     .setTitle(`Poll by ${message.member?.displayName}:`)
        //     .setDescription(polltext);
        //     console.log("Adding poll: " + polltext);
        //     //@ts-ignore
        //     pollsChannel.send(messageToSend).then(sentMessage => {
        //         reactions?.forEach(reaction => {
        //             sentMessage.react(reaction.trim());
        //         })
        //     });
        //     message.delete();
        // }
    });
    var colors = ['750606609574658058', '750606768354361356', '750606770497519647', '750606837455388713', '750606866165399565'];
    setInterval(async () => {
        [... (await mainGuild?.roles.cache.get('750606553177915443')?.members.array() || [])].forEach(member => {
            colors.forEach(color => member.roles.remove(color));
            member.roles.add(colors[Math.floor(Math.random() * colors.length)]);
        });
    }, 1200000);
    
    let currentNumOfPosts: number;
    
    setInterval(() => {
        get('https://public-api.wordpress.com/rest/v1.1/sites/familystudents.family.blog/posts?offset=0&number=1', res => {
            let datastr = '';
    
            res.on('data', chunk => datastr += chunk);
    
            res.on('end', async () => {
                let data = JSON.parse(datastr);
                if(!currentNumOfPosts) {
                    currentNumOfPosts = data.found;
    
    //                 let desc: string = data.posts[0].excerpt;
    //                 desc = desc.replace("<p>", "");
    //                 desc = desc.replace("</p>", "");
    //                 desc = desc.replace("[&hellip;]", "");
    
    //                 const embed = new MessageEmbed()
    //                     .setTitle("New post: " + data.posts[0].title)
    //                     .setAuthor(data.posts[0].author.name, data.posts[0].author.avatar_URL)
    //                     .setDescription(desc)
    //                     .setTimestamp(new Date(data.posts[0].date))
    //                     .setColor('#0000aa')
    //                     .setURL(data.posts[0].URL)
    //                     .setImage(data.posts[0].featured_image)
    // //                              http://familystudents.family.blog/2020/11/05/vergesssen/
    //                     .setFooter("Automatically detected by a bot. Please report any issues");
    
    //                 (<TextChannel> await client.channels.cache.get(blogId)?.fetch()).send(embed);
                    return;
                }
                if(data.found > currentNumOfPosts) {
    
                    let desc: string = data.posts[0].excerpt;
                    desc = desc.replace("<p>", "");
                    desc = desc.replace("</p>", "");
                    desc = desc.replace("[&hellip;]", "");
    
                    const embed = new MessageEmbed()
                        .setTitle("New post: " + data.posts[0].title)
                        .setAuthor(data.posts[0].author.name, data.posts[0].author.avatar_URL)
                        .setDescription(desc)
                        .setTimestamp(new Date(data.posts[0].date))
                        .setColor('#0000aa')
                        .setFooter(data.posts[0].URL)
                        .setImage(data.posts[0].featured_image)
    //                              http://familystudents.family.blog/2020/11/05/vergesssen/
                        .setFooter("Automatically detected by a bot. Please report any issues")
                        .setURL(data.posts[0].URL);
                    (<TextChannel> await client.channels.cache.get(blogId)?.fetch()).send(embed);
                    currentNumOfPosts = data.found;
                }
            });
        }).on('err', (err) => console.error("Error getting wordpress: " + err));
    }, 5000);
    
    client.on('messageReactionAdd', (reaction, user) => {
        if(reaction.message.guild === mainGuild) return;
    
    });
    client.on('messageDelete', async message => {
        if(message.guild === mainGuild) return;
    
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
    
    const token = JSON.parse(readFileSync('./config.json').toString('utf-8')).token;
    client.login(token);
    console.log("Authen with token: " + token);
} catch (e) {
    // Error, exit with error so systemctl will restart
    console.error(e);
    process.exit(111);
}