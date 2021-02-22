class Lest {
  constructor(config) {
    if(!config) throw Error("I couldn't find the config file.");
    this.config = config;
    this.hostPath = process.cwd();
    this.mpp = require("./base/Client.js");
    this.client = new this.mpp(config.uri, config?.options);
    this.client.lest = {};
    this.commands = (typeof this.config.bot_config.commands === "string") ? require(require("path").join(this.hostPath, this.config.bot_config.commands)) : this.config.bot_config.commands;    
    this.defaults = {
      commands: [
        {
          name: "reload",
          description: "reload command",
          example: "reload",
          admin: true,
          category: "devtools",
          func: ({client, message}) => {
            this.reInitCmds();
            this.client.say("done");
          }
        }
      ],
      config: {
        bot_config: {
          commands: {cmds:[]},
          prefix: "/",
          admin: [],
          default: []
        }
      }
    };

    this.client.on("hi", async () => {
      if(this.config.bot_config.default) {
        this.config.bot_config.default.forEach(comName => {
          if(!(this.defaults.commands.some(c => c.name === comName))) return;
          this.commands.cmds.push(this.defaults.commands.find(c => c.name === comName));
        });
      }
      
      this.initCommands(this.commands, false);

      this.client.lest = this;
    });

    this.client.on("a", message => {
      this.cmnd(this.client, message);
    });
  }
  
  cmnd(client, message) {
    //if(message.author.bot) return;
    if(!message.a.match(new RegExp(`^${this.config.bot_config.prefix}`))) return;

    const args = message.a.toString().slice(this.config.bot_config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(this.commands.subCommands.some(c => c.name === command)) return this.subcmd(args, message, this.commands.subCommands.find(c => c.name === command));
    
    if(this.commands.cmds.some(c => c.name === command)) {
      const com = this.commands.cmds.find(c => c.name === command);
      if(com.admin) {
        if(!this.config.bot_config.admin.some(ad => ad === message.user._id)) return this.client.say("You do not have permission to use administrator commands.");
        com.func({client, message, args});
      } else {
        com.func({client, message, args});
      }
    }
  }

  subcmd(args, message, c) {
    const arg = args.join(" ").split(/ +/g);
    const command = arg.shift().toLowerCase();
    const com = c.commands.cmds.find(_c => _c.name === command);

    if(c.admin && !this.config.bot_config.admin.some(ad => ad === message.user._id)) return this.client.say("You do not have permission to use administrator commands.");
    if(c.commands.subCommands.some(_c => _c.name === command)) return this.subcmd(arg, message, c.commands.subCommands.find(_c => _c.name === command));
    if(c.commands.cmds.some(_c => _c.name === command)) {
      if(com.admin) {
        if(!this.config.bot_config.admin.some(ad => ad === message.user._id)) return this.client.say("You do not have permission to use administrator commands.");
        com.func({client: this.client, message, args: arg});
      } else {
        com.func({client: this.client, message, args: arg});
      }
    } else {
      var isHelp = (this.config.bot_config.default.some(d => d === "help")) ?
      "**When you type the help command, a list of commands will be displayed.**" :
      "There is no help by default.";

      this.client.say(`SubCommand - ${c.name} | ${isHelp}\nThere are currently ${c.commands.cmds.length} of commands in this command.`);
    }
  }

  initCommands(commands, reinit) {
    commands.categories = {
      list: [],
      splitData: []
    };
    commands.subCommands = [];

    if(this.config.bot_config.default.some(d => d === "help")) commands.cmds.unshift(this.makeHelp(commands));

    commands.cmds.forEach(i => {
      if(i.subCommand) {
        if(reinit && typeof i.commands === "string") delete require.cache[require("path").join(this.hostPath, i.commands)];

        commands.cmds = commands.cmds.filter(n => n !== i);
        commands.subCommands.push(i);
        if(typeof i.commands === "string") i._filePath = i.commands;
        i.commands = (typeof i.commands === "string") ? require(require("path").join(this.hostPath, i.commands)) : i.commands;
        if(typeof i.commands === "string") i.commands._filePath = i._filePath;
        i.commands.subCommand = true;

        i.commands.categories = {
          list: [],
          splitData: []
        };
        i.commands.subCommands = [];

        if(typeof commands.categories.splitData["SubCommand"] == "undefined") commands.categories.splitData["SubCommand"] = [];
        commands.categories.splitData["SubCommand"].push(i);

        if(i.commands?._filePath) i.commands.cmds.map(c => c._filePath = i._filePath);
        this.initCommands(i.commands, false);
      }

      const isSC = (i._filePath) ? `${i._filePath} - ` : "";

      if(i.func == null) return commands.cmds = commands.cmds.filter(n => n !== i);

      if(i.admin) {
        if(typeof commands.categories.splitData["Admin"] == "undefined") commands.categories.splitData["Admin"] = [];
        commands.categories.splitData["Admin"].push(i);
        console.log(`[Initter | Reinit: ${reinit} | ADMIN] ${isSC}${i.name}: loaded`);
        return;
      }

      var cat = i["category"];
      var isUnspecified = (cat == undefined || cat == null || cat == "") ? "Unspecified" : cat;
      if(typeof commands.categories.splitData[isUnspecified] == "undefined") commands.categories.splitData[isUnspecified] = [];
      commands.categories.splitData[isUnspecified].push(i);
      console.log(`[Initter | Reinit: ${reinit}] ${isSC}${i.name}: loaded`);
    });
    commands.categories.list = Object.keys(commands.categories.splitData);
  }

  makeHelp(commands) {
    var data = {
      name: "help",
      description: "CommandList",
      example: "help <command name>",
      category: "utils",
      func: ({message, args}) => {
        commands.cmds.sort();
        const [tx] = args;
        var viewData = commands.categories.list.map(i => {
          return {
            name: i,
            value: commands.categories.splitData[i].map(a => {
              return a.name;
            }).join(", ")
          };
        });

        if(tx == null) {
          this.client.say('"help <command name>" will give you more information.');
          viewData.map(vd => this.client.say(`${vd.name}: ${vd.value}`));
        } else {
          var isSubCmd_if = (commands.subCommands.some(c => c.name === tx)) ?
          !(commands.subCommands.some(c => c.name === tx)) :
          !(commands.cmds.some(c => c.name === tx));
          if(isSubCmd_if) return this.client.say(`No command is available.: ${tx}`);
          var isSubCmd_find = (commands.subCommands.some(c => c.name === tx)) ?
          commands.subCommands.find(c => c.name === tx) :
          commands.cmds.find(c => c.name === tx);
          var com = isSubCmd_find;
          var orAdmin = (com.admin) ? `[Admin] ${com.name}` : com.name;
          var isUnspecified = (com.category == undefined || com.category == null || com.category == "") ? "Unspecified" : com.category;
          var isSubCmd = (com.subCommand) ? isUnspecified = "SubCommand" : isUnspecified;
          this.client.say(`${com.name} - ${com.description}`);
          this.client.say(`Example: ${com.example}\nCategory: ${isSubCmd}`);
        }
      }
    };

    if(commands.subCommand) data._filePath = commands._filePath;
    
    return data;
  }

  reInitCmds() {
    this.commands = null;
    delete require.cache[require("path").join(this.hostPath, this.config.bot_config.commands)];
    this.commands = require(require("path").join(this.hostPath,this.config.bot_config.commands));

    if(this.config.bot_config.default) {
      this.config.bot_config.default.forEach(comName => {
        if(!(this.defaults.commands.some(c => c.name === comName))) return;
        this.commands.cmds.push(this.defaults.commands.find(c => c.name === comName));
      });
    }

    this.initCommands(this.commands, true);
  }
}

module.exports = Lest;
