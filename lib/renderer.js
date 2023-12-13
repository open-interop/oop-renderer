const fs = require("fs");
const path = require("path");

const renderers = (() => {
    const rendererPath = `${__dirname}/renderers/`;
    const files = fs.readdirSync(rendererPath);
    const renderers = {};

    for (const file of files) {
        if (!/^[^.].*(?<!\.test)\.js$/.test(file)) {
            continue;
        }

        let renderer;

        try {
            renderer = require(path.join(rendererPath, file));
        } catch (e) {
            console.error(e);
        }

        if (!(renderer && "language" in renderer && "callback" in renderer)) {
            continue;
        }

        renderers[renderer.language] = renderer;
    }

    return renderers;
})();

module.exports = (message, template, layers, log = () => {}) => {
    const applyRecursive = async (object, func) => {
        var ret;

        if (Array.isArray(object)) {
            ret = [];

            for (const val of object) {
                ret.push(await applyRecursive(val));
            }
        } else if (typeof object === "object") {
            if ("language" in object && "script" in object) {
                if (!renderers[object.language]) {
                    throw new Error(
                        `Cannot find ${object.language} in exported renderers.`
                    );
                }

                const {
                    rendered,
                    console,
                    customFields,
                    messages
                } = await renderers[object.language].callback(
                    message,
                    object,
                    layers
                );

                log(console);

                rendered.customFields = {};
                if (customFields && Object.keys(customFields).length) {
                    rendered.customFields = customFields;
                }

                rendered.messages = [];
                if (messages && messages.length) {
                    rendered.messages = messages;
                }

                ret = rendered;
            } else {
                ret = {};

                for (const [key, val] of Object.entries(object)) {
                    ret[key] = await applyRecursive(val);
                }
            }
        } else {
            ret = applyRecursive({ language: "mustache", script: object });
        }

        return ret;
    };

    return applyRecursive(template);
};
