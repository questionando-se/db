interface ArgCommand {
    name: string;
    value: string;
}

export default class ArgParser {
    private args: string[];

    private commands: ArgCommand[];

    private lastCommand: ArgCommand | null;

    constructor() {
        this.args = process.argv.slice(2);
        this.lastCommand = null;
        this.commands = [];
        this.parse();
    }

    private parse() {
        for (let i = 0; i < this.args.length; i += 1) {
            const argVal = this.args[i];
            if (argVal.startsWith('--')) {
                if (this.lastCommand !== null) {
                    this.commands.push(this.lastCommand);
                }
                this.lastCommand = {
                    name: argVal.replace('--', ''),
                    value: '',
                };
            } else if (this.lastCommand !== null) {
                if (this.lastCommand.value === '') {
                    this.lastCommand.value = argVal;
                } else {
                    this.lastCommand.value = this.lastCommand.value + ' ' + argVal;
                }
            }
        }
        if (this.lastCommand !== null) {
            this.commands.push(this.lastCommand);
        }
    }

    public getArg(name: string, defaultValue: string) {
        const values = this.commands.filter((v) => v.name === name);
        if (values.length === 0) {
            return defaultValue;
        }
        return values[0].value;
    }
}
