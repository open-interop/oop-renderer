module.exports.language = "text";

module.exports.callback = async (message, template) => {
    return {
        rendered: template.script,
        console: ""
    };
};
