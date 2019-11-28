# oop-renderer

This is the render service for Open Interop.

This service consumes authenticated messages which have had their temprs populated and renders the tempr ready to be used by an endpoint.

The renderer will attempt to render every value in a tempr's `template` field. By default the mustache rendering engine will be used, however other rendering engines can be specified.

### Rendering using Javascript

To render a field in a tempr using javascript, the value to be rendered must be an object with the two keys, `language` and `script`, with language set to `js`. E.g.
```javacript
{
    body: {
        language: "js",
        script: "module.exports = Math.random();"
    }
}
```

This will cause a random number to be sent as the body of the request.

If an object is exported from the script, this value will be serialised into JSON.

#### Debugging Javascript temprs

`console.log` is available from within the tempr.

#### Cancelling temprs

If you want to programmatically discard a transmission, this can be done from within a javascript template by calling `DiscardTransmission()` from within the script.

Discarded transmissions will still be reported to core.

#### Fields the tempr has access to

```javascript
{
    uuid: 'add28426-8839-4c41-b0fa-91b5d0720caa',
    message: {
        path: '/',
        query: {"q": "value"},
        method: 'GET',
        ip: '::ffff:127.0.0.1',
        body: {},
        headers: {
            host: 'localhost:3000',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0',
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'accept-language': 'en-US,en;q=0.5',
            'accept-encoding': 'gzip, deflate',
            dnt: '1',
            connection: 'keep-alive',
            'upgrade-insecure-requests': '1',
            'cache-control': 'max-age=0'
        },
        hostname: 'localhost',
        protocol: 'http'
    },
    device: {
        id: 5,
        hostname: 'customer.oop.example',
        authentication: { path: '/' }
    },
    tempr: {
        endpointType: 'http',
        deviceId: '5',
        deviceTemprId: 1,
        queueResponse: true,
        template: {
            host: 'localhost',
            port: 443,
            path: '/test/path/here',
            requestMethod: 'POST',
            headers: [],
            body: '{"message": "here"}',
            protocol: 'https'
        }
    }
}
```

So reading from the body of the request and using it in the body of the response would be done as follows:
```javascript
{
    body: {
        language: "js",
        script: "module.exports = message.message.body;"
    }
}
```

## Installation

- Ensure node is installed with version at least `10.16.2` LTS.
- Install `yarn` if necessary (`npm install -g yarn`).
- Run `yarn install` to install the node dependencies.
- Once everything is installed the service can be started with `yarn start`.

## Configuration

- `OOP_AMQP_ADDRESS`: The address of the AMQP messaging service.
- `OOP_EXCHANGE_NAME`: The message exchange for Open Interop.
- `OOP_ERROR_EXCHANGE_NAME`:  The exchange errors will be published to.
- `OOP_JSON_ERROR_Q`: The queue JSON decode messages will be published to.
- `OOP_RENDERER_INPUT_Q`: The queue this service will consume from.
- `OOP_ENDPOINTS_EXCHANGE_NAME`: The endpoints exchange.
- `OOP_ENDPOINT_Q`:  The basename for endpoint queues, this will be concatinated with the endpoint type to produce the final queue name. E.g. `oop.endpoints` goes to `oop.endpoints.http` for an HTTP tempr.
- `OOP_CORE_RESPONSE_Q`: The core response message queue.

## Testing

`yarn test` to run the tests and generate a coverage report.

## Contributing

We welcome help from the community, please read the [Contributing guide](https://github.com/open-interop/oop-guidelines/blob/master/CONTRIBUTING.md) and [Community guidelines](https://github.com/open-interop/oop-guidelines/blob/master/CODE_OF_CONDUCT.md).

## License

Copyright (C) 2019 Blue Frontier IT Ltd

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
