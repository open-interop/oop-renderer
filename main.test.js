import test from "ava";

var main = require("./main");

const mockLogger = { info: () => {}, error: () => {} };

test("discard transmission", t => {
    t.plan(2);

    const published = [];

    return new Promise(resolve => {
        const broker = {
            consume: (queue, fn) => {
                return fn({
                    content: {
                        uuid: "1234-123456-1234-1234",
                        tempr: {
                            template: {
                                language: "js",
                                script: "DiscardTransmission();"
                            }
                        },
                        device: {
                            id: 1
                        }
                    }
                }).then(resolve);
            },
            publish: (exchange, queue, message) => {
                published.push(message);
            }
        };

        main(broker, {}, mockLogger);
    }).then(() => {
        t.is(published.length, 1);
        t.deepEqual(published[0].response.discarded, true);
    });
});

test("transmission works", t => {
    t.plan(2);

    const published = [];

    return new Promise(resolve => {
        const broker = {
            consume: (queue, fn) => {
                return fn({
                    content: {
                        uuid: "1234-123456-1234-1234",
                        tempr: {
                            template: {
                                val: "test"
                            }
                        }
                    }
                }).then(resolve);
            },
            publish: (exchange, queue, message) => {
                published.push(message);
            }
        };

        main(broker, {}, mockLogger);
    }).then(() => {
        t.is(published.length, 1);
        t.is(published[0].tempr.rendered.val, "test");
    });
});

test("console log works", t => {
    t.plan(2);

    const published = [];

    return new Promise(resolve => {
        const broker = {
            consume: (queue, fn) => {
                return fn({
                    content: {
                        uuid: "1234-123456-1234-1234",
                        tempr: {
                            template: {
                                val: {
                                    script: "console.log('foo');",
                                    language: "js"
                                }
                            }
                        }
                    }
                }).then(resolve);
            },
            publish: (exchange, queue, message) => {
                published.push(message);
            }
        };

        main(broker, {}, mockLogger);
    }).then(() => {
        t.is(published.length, 1);
        t.is(published[0].tempr.console, "foo\n");
    });
});
