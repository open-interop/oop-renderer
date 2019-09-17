const renderer = require("./lib/renderer");

module.exports = async (broker, config, logger) => {
    return broker.consume(config.rendererInputQ, async message => {
        var data = message.content;

        logger.info(`Rendering ${data.uuid}.`);
        var rendered = await renderer(data, data.tempr.template);
        data.rendered = rendered;

        broker.publish(
            config.endpointsExchangeName,
            `${config.oopEndpointsQ}.${data.tempr.endpointType}`,
            data
        );
    });
};
