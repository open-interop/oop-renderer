const mustache = require("mustache");

module.exports.language = "mustache";

module.exports.callback = async (message, template) => {
    if (typeof template.script === "undefined") {
        return {
            rendered: "",
            console: ""
        };
    }

    return {
        rendered: mustache.render(String(template.script), message),
        console: ""
    };
};
