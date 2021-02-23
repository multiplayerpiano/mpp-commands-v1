const config = {
    uri: process.argv[2],
    bot_config: {
        commands: "./cmd.js",//command require("command path") or {cmds: []}
        prefix: "/",//prefix
        admin: ["id"],//ID of the person who can use the command with admin.
        default: ["help"]//default command, right now only help and reload is available right now
    }
};

const Lest       = require("../Lest.js")
        , cf     = new Lest(config)
        , client = cf.client;

client.setChannel("lobby");
client.start();

client.on("hi", () => {
    console.log("started");
});