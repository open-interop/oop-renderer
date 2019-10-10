const ivm = require("isolated-vm");

module.exports = async (message, template) => {
    if (template.language !== "js") {
        throw new Error("Only 'js' is supported as a language.");
    }

    let isolate = new ivm.Isolate();

    var context = await isolate.createContext();
    await context.global.set("_message", new ivm.Reference(message));

    let bootstrap = await isolate.compileScript("new " + function() {
        message = _message.copySync();

        delete _message;

        module = { exports: null, discard: false };

        DiscardTransmission = () => {
            module.discard = true;
        };
    });

    await bootstrap.run(context);

    let script = await isolate.compileScript(template.script);

    await script.run(context, {release: true, timeout: 5000});

    let module = await context.global.getSync("module").copy();

    if (module.discard === true) {
        let e = new Error("Message discarded");

        e.discard = true;

        throw e;
    }

    context.release();
    isolate.dispose();

    return module.exports;
};
