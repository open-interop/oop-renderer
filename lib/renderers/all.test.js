const test = require("ava");

const message = { test: "foo" };

test("Javascript Renderer", t => {
    t.plan(2);

    const renderer = require("./javascript");

    t.is(renderer.language, "js");

    const template = {
        language: "js",
        script: 'module.exports = message.test + "bar";',
    };

    return renderer.callback(message, template).then(res => {
        t.deepEqual(res, {
            rendered: "foobar",
            customFields: {},
            console: "",
            messages: []
        });
    });
});

test("Json Renderer", t => {
    t.plan(2);

    const renderer = require("./json");

    t.is(renderer.language, "json");

    const message = {};
    const template = {
        language: "json",
        script: '{ "test": "a", "other": "b" }',
    };

    return renderer.callback(message, template).then(res => {
        t.deepEqual(res, {
            rendered: { test: "a", other: "b" },
            console: ""
        });
    });
});

test("Mustache Renderer", t => {
    t.plan(2);

    const renderer = require("./mustache");

    t.is(renderer.language, "mustache");

    const template = {
        language: "json",
        script: '{{{test}}}bar',
    };

    return renderer.callback(message, template).then(res => {
        t.deepEqual(res, {
            rendered: "foobar",
            console: ""
        });
    });
});

test("Text Renderer", t => {
    t.plan(2);

    const renderer = require("./text");

    t.is(renderer.language, "text");

    const template = {
        language: "text",
        script: 'Hello, World!',
    };

    return renderer.callback(message, template).then(res => {
        t.deepEqual(res, {
            rendered: "Hello, World!",
            console: ""
        });
    });
});

