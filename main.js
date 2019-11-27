const uuidv4 = require("uuid/v4");
const renderer = require("./lib/renderer");

const uuid = uuidv4;

module.exports = (broker, config, logger) => {
    return broker.consume(config.rendererInputQ, async message => {
        var data = message.content;

        logger.info(`Rendering ${data.uuid}.`);

        data.transmissionId = uuid();

        try {
            let output = "";
            const log = msg => {
                output += msg;
            };

            var rendered = await renderer(data, data.tempr.template, log);

            data.tempr.rendered = rendered;
            data.tempr.console = output;

            broker.publish(
                config.endpointsExchangeName,
                `${config.oopEndpointsQ}.${data.tempr.endpointType}`,
                data
            );
        } catch (e) {
            let responseData;

            if (e.discard === true) {
                logger.info(
                    `Transmission from ${data.uuid} discarded in renderer.`
                );

                responseData = {
                    discarded: true,
                    success: false,
                    datetime: new Date()
                };
            } else {
                logger.error(`Transmission from ${data.uuid} failed.`);

                responseData = {
                    datetime: new Date(),
                    discarded: false,
                    success: false,
                    error: `Unable to render tempr: '${e}'.`
                };
            }

            data.response = responseData;

            broker.publish(config.exchangeName, config.coreResponseQ, data);
        }
    });
};
