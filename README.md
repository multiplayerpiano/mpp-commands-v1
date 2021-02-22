# MultiPlayerPiano Bot command framework - Lest vBeta1.0
Based on https://github.com/Zel9278/Lest (Discord.js command framework)

idk more description :p

## install
`npm install git+https://github.com/MultiPlayerPiano/mpp-commands-v1.git`

## how to

```javascript
const config = {
  uri: "mpp server uri",
  bot_config: {
    commands: require("./commands.js"),//command require("command path") or {cmds: []}
    prefix: "/",//prefix
    admin: ["id"],//ID of the person who can use the command with admin.
    default: ["help"]//default command, right now only help and reload is available right now
  }
};

const Lest   = require("@Zel9278/lest-mpp")
    , cf     = new Lest(config)
    , client = cf.client;

client.setChannel("lobby");
client.start();

client.on("hi", () => {
    console.log("started");
});
```

# commands, subcommands
command file
```javascript
const commands = {
  cmds: [
    {
        name: "echo",//CommandName
        description: "echo",//CommandDescription
        example: "echo <text>",//CommandExample
        category: "utils",//commandCategory
        func: ({ client, message, args }) => {
            client.say(`${message.user.name} says "${args.join(" ")}"`);
        }//CommandFunction
    },
    {
      name: "test",
      description: "debug",
      example: "test",
      category: "DevTools",//The picture category will be fixed to Admin.
      admin: true,//For the admin command, add here
      func: () => {
        ...
      }
    },
    {
      name: "subcmd",
      description: "Debug",
      example: "subcmd help",
      subCommand: true,//The category will be fixed to the subcommand.
      commands: {}//subcommand require("subcommand path") or {cmds: []}
    }
  ]
};

module.exports = commands;
```

## wtf
`<client>.lest: this.lest`

## attention
```
//??????????????? mpp is not work
message.client.lest.config //When responding to a message, if there is another one, the config must be referenced from here.
//idk
client.lest.config = this.lest
```
