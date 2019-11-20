import test from "ava";

var javascript = require("./javascript");

test("script execution", t => {
    t.plan(1);

    const message = { test: "foo" };
    const template = {
        language: "js",
        script: 'module.exports = message.test + "bar";'
    };

    return javascript.callback(message, template).then(res => {
        t.is(res, "foobar");
    });
});

test("unsported language rejected", async t => {
    t.plan(1);

    const message = { test: "foo" };
    const template = {
        language: "lua",
        script: "1 + 1;"
    };

    await t.throwsAsync(() => javascript.callback(message, template));
});

test("discard transmission", t => {
    t.plan(1);

    const message = { test: "foo" };
    const template = {
        language: "js",
        script: "DiscardTransmission();"
    };

    return javascript.callback(message, template).catch(err => {
        t.true(err.discard);
    });
});
