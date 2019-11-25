const mustache = require("mustache");

module.exports.language = "mustache";

module.exports.callback = async (message, template) => {
    if (typeof template.script === "undefined") {
        return "";
    }

    return mustache.render(String(template.script), message);
};
