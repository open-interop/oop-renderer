const ivm = require("isolated-vm");

const getLayers = (layerRefs, layers) => {
    const ret = [];

    for (const ref of layerRefs) {
        ret.push(layers.find(l => l.id === ref));
    }

    return ret;
};

const loadLayers = async (layers, context, vm) => {
    const layersObject = {};

    for (const layer of layers) {
        layersObject[layer.reference] = {
            exports: {},
            id: layer.reference,
            loaded: false
        };
    }

    const layerLoader = await vm.compileScript(`
        modules = ${JSON.stringify(layersObject)};
        const require = (moduleName) => {
            if (!modules[moduleName].loaded) {
                modules[moduleName].init();
            }

            return modules[moduleName].exports;
        };
    `);

    await layerLoader.run(context);

    for (const layer of layers) {
        loadLayer(layer, context, vm);
    }
};

const loadLayer = async (layer, context, vm) => {
    const reference = JSON.stringify(layer.reference);

    const layerScript = await vm.compileScript(`
        modules[${reference}].init = () => {
            modules[${reference}].loaded = true;

            (function(module, global, modules) {
                "use strict";
                ${layer.script}
            })(modules[${reference}], null, null);

            delete modules[${reference}].init;
        };
    `);

    await layerScript.run(context);
};

module.exports.language = "js";

module.exports.callback = async (message, template, layers) => {
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
        if (template.layers && template.layers.length) {
            await loadLayers(
                getLayers(template.layers, layers),
                context,
                isolate
            );
        }

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
