const uuidv4 = require("uuid/v4");
const renderer = require("./lib/renderer");

const uuid = uuidv4;

module.exports = (broker, config, logger) => {
    return broker.consume(config.rendererInputQ, async message => {
        var data = message.content;

        logger.info(`Rendering ${data.uuid}.`);

        data.transmissionId = uuid();
        let output = "";

        try {
            const log = msg => {
                output += msg;
            };

            var rendered = await renderer(
                data,
                data.tempr.template,
                data.layers,
                log
            );

            if (rendered.body && rendered.body.customFields) {
                data.customFields = rendered.body.customFields;
                delete rendered.body.customFields;
            }

            if (rendered.body && rendered.body.messages) {
                data.messages = rendered.body.messages;
                delete rendered.body.messages;

                for (const newMessage of data.messages) {
                    const newMessageUuid = uuid();

                    newMessage.hostname = data.message.hostname;

                    broker.publish(config.exchangeName, config.gatewayOutputQ, {
                        uuid: newMessageUuid,
                        parentUuid: data.uuid,
                        message: newMessage
                    });

                    logger.info(
                        `Requeue from ${data.uuid} in '${config.gatewayOutputQ}' as ${newMessageUuid}`
                    );

                    log(
                        `Requeue from ${data.uuid} in '${config.gatewayOutputQ}' as ${newMessageUuid}`
                    );
                }
            }

            data.tempr.rendered = rendered;
            data.tempr.console = output;
            data.tempr.error = null;

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
                    success: true,
                    datetime: new Date()
                };
            } else {
                logger.error(`Transmission from ${data.uuid} failed.`);
                logger.error(`Error message: ${e}`);

                responseData = {
                    datetime: new Date(),
                    discarded: false,
                    success: false,
                    error: `Unable to render tempr: '${e}'.`
                };
            }

            data.tempr.response = responseData;
            data.tempr.rendered = null;
            data.tempr.console = output;
            data.tempr.error = String(e);

            broker.publish(config.exchangeName, config.coreResponseQ, data);
        }
    });
};
