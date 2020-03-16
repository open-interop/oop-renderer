const ivm = require("isolated-vm");

module.exports.language = "js";

module.exports.callback = async (message, template) => {
    if (template.language !== "js") {
        throw new Error("Must supply a javascript template.");
    }

    const isolate = new ivm.Isolate({ memoryLimit: 8 });

    try {
        var context = await isolate.createContext();
    } catch (e) {
        isolate.dispose();

        throw e;
    }

    try {
        await context.global.set("_message", new ivm.Reference(message));

        const bootstrap = await isolate.compileScript(
            `
                message = _message.copySync();

                delete _message;

                module = { exports: null, discard: false };

                _console = "";
                console = {
                    log: (msg) => {
                        _console += msg + "\\n";
                    }
                };

                DiscardTransmission = () => {
                    module.discard = true;
                };
            `
        );

        await bootstrap.run(context);

        const script = await isolate.compileScript(template.script);

        await script.run(context, { release: true, timeout: 5000 });

        const module = await context.global.getSync("module").copy();
        const log = await context.global.getSync("_console").copy();

        if (module.discard === true) {
            const e = new Error("Message discarded");

            e.discard = true;

            throw e;
        }

        return {
            rendered: module.exports,
            console: log
        };
    } finally {
        context.release();
        isolate.dispose();
    }
};
