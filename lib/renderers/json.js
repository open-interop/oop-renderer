module.exports.language = "json";

module.exports.callback = async (message, template) => {
    let res = null;
    let error = null;

    try {
        res = JSON.parse(template.script);
    } catch (e) {
        error = e;
    }

    return {
        rendered: res,
        console: "",
        error: error,
    };
};
