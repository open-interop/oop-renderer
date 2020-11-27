module.exports.language = "json";

module.exports.callback = async (message, template) => {
    return {
        rendered: JSON.parse(template.script),
        console: "",
    };
};
