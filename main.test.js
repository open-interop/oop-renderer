import test from "ava";

var main = require("./main");

test("discard transmission", t => {
    t.plan(1);

    let published = [];

    return new Promise(resolve => {
        let broker = {
            consume: (queue, fn) => {
                return fn(
                    {
                        content: {
                            uuid: "1234-123456-1234-1234",
                            tempr: {
                                template: {
                                    language: "js",
                                    script: "DiscardTransmission();"
                                }
                            }
                        }
                    }
                ).then(resolve);
            },
            publish: (exchange, queue, message) => {
                published.push(message);
            }
        };

        main(broker, {}, console)
    }).then(() => {
        t.deepEqual([], published);
    });
});
