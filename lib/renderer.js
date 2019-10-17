const fs = require("fs");
const path = require("path");

const loadRenderers = () => {
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

        if (!("language" in renderer && "callback" in renderer)) {
            continue;
        }

        renderers[renderer.language] = renderer;
    }

    return renderers;
};

const renderers = loadRenderers();

module.exports = (message, template) => {
    const applyRecursive = async (object, func) => {
        var ret;

        if (Array.isArray(object)) {
            ret = [];

            for (const val of object) {
                ret.push(await applyRecursive(val));
            }
        } else if (typeof object === "object") {
            if ("language" in object && "script" in object) {
                ret = await renderers[object.language].callback(
                    message,
                    object
                );

                if (typeof ret !== "string") {
                    ret = JSON.stringify(ret);
                }
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
