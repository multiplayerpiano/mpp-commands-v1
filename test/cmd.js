const commands = {
    cmds: [
        {
            name: "echo",//CommandName
            description: "echo",//CommandDescription
            example: "echo <text>",//CommandExample
            category: "utils",//commandCategory
            func: ({ client, message, args }) => {
                client.say(`${message.p.name} says "${args.join(" ")}"`);
            }//CommandFunction
        },
        {
            name: "subcmd",
            description: "Debug",
            example: "subcmd help",
            subCommand: true,//The category will be fixed to the subcommand.
            commands: {
                cmds: [
                    {
                        name: "echo",//CommandName
                        description: "echo",//CommandDescription
                        example: "echo <text>",//CommandExample
                        category: "utils",//commandCategory
                        func: ({ client, message, args }) => {
                            client.say(`${message.p.name} says "${args.join(" ")}"`);
                        }//CommandFunction
                    }
                ]
            }//subcommand require("subcommand path") or {cmds: []}
        }
        ]
};

module.exports = commands;