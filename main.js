const uuidv4 = require("uuid/v4");
const renderer = require("./lib/renderer");

const uuid = uuidv4;

module.exports = async (broker, config, logger) => {
    return broker.consume(config.rendererInputQ, async message => {
        var data = message.content;

        logger.info(`Rendering ${data.uuid}.`);

        data.transmissionUuid = uuid();

        try {
            var rendered = await renderer(data, data.tempr.template);
        } catch (e) {
            const responseData = {
                success: false,
                status: null,
                datetime: new Date(),
                messageId: data.uuid,
                deviceId: data.device.id,
                deviceTemprId: data.tempr.deviceTemprId,
                transmissionUuid: data.transmissionUuid,
                error: `Unable to render tempr: '${e}'.`,
            };

            broker.publish(
                config.exchangeName,
                config.coreResponseQ,
                responseData
            );

            return;
        }

        data.rendered = rendered;

        broker.publish(
            config.endpointsExchangeName,
            `${config.oopEndpointsQ}.${data.tempr.endpointType}`,
            data
        );
    });
};
