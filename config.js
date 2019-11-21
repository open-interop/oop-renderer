const oop = require("oop-node-common");

module.exports = new oop.Config({
    amqpAddress: "OOP_AMQP_ADDRESS",
    rendererInputQ: "OOP_RENDERER_INPUT_Q",
    endpointsExchangeName: "OOP_ENDPOINTS_EXCHANGE_NAME",
    oopEndpointsQ: "OOP_ENDPOINT_Q"
});
