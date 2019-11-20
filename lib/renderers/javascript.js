const ivm = require("isolated-vm");

module.exports.language = "js";

module.exports.callback = async (message, template) => {
    if (template.language !== "js") {
        throw new Error("Must supply a javascript template.");
    }

    const isolate = new ivm.Isolate();

    var context = await isolate.createContext();
    await context.global.set("_message", new ivm.Reference(message));

    const bootstrap = await isolate.compileScript(
        `
            message = _message.copySync();

            delete _message;

            module = { exports: null, discard: false };

            DiscardTransmission = () => {
                module.discard = true;
            };
        `
    );

    await bootstrap.run(context);

    const script = await isolate.compileScript(template.script);

    await script.run(context, { release: true, timeout: 5000 });

    const module = await context.global.getSync("module").copy();

    if (module.discard === true) {
        const e = new Error("Message discarded");

        e.discard = true;

        throw e;
    }

    context.release();
    isolate.dispose();

    return module.exports;
};
