# @getezy/grpc-client
Universal, extendable, typesafe gRPC/gRPC-Web client for node used in [ezy](https://github.com/getezy/ezy).

⚠️ This lib is not production ready until it is merged to main ezy project.

# Install
```bash
npm install @getezy/grpc-client
```

# Usage
```ts
import { GrpcClientFactory, GrpcProtocol, ProtobufLoader, GrpcTlsType } from '@getezy/grpc-client';

const client = await GrpcClientFactory.create(
  new ProtobufLoader(path.join(__dirname, '../proto/main.proto')),
  new GrpcProtocol({ address: '10.10.10.10', tls: { type: GrpcTlsType.INSECURE } })
);

const payload = { id: '21443e83-d6ab-45b7-9afd-65b2e0ee8957' };
const metadata = { 'x-access-token': 'token' };
const response = await client.invokeUnaryRequest<Request, Response>(
  { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
  payload,
  metadata
);
```

## Loaders
Loader sets the strategy how to load gRPC package definitions.

### ProtobufLoader
Uses [@grpc/proto-loader](https://www.npmjs.com/package/@grpc/proto-loader) for load protobuf definition from the giving path.

Refer to [@grpc/proto-loader](https://www.npmjs.com/package/@grpc/proto-loader) documentation to see available options.

⚠️ Overided default options are:
```js
// Preserve field names. The default is to change them to camel case.
keepCase: true,
// Set default values on output objects. Defaults to false.
defaults: true,
// A list of search paths for imported .proto files.
includeDirs: [],
// The type to use to represent long values. Defaults to a Long object type.
longs: String,
```

```ts
import { ProtobufLoader } from '@getezy/grpc-client';
import * as path from 'node:path';

const loader = new ProtobufLoader(
  path.join(__dirname, '../proto/main.proto'),
  {
    defaults: false,
  }
);

const definition = await loader.load();
```

### ReflectionLoader
Loader by reflection API is coming soon.

### Custom loader
You can write custom loader implementation by extending `AbstractLoader` class imported from `@getezy/grpc-client`.

```ts
import { AbstractLoader, GrpcServiceDefinition } from '@getezy/grpc-client';

class CustomLoader extends AbstractLoader {
  public async load(): Promise<void> {
    // custom loader implementation
  }
}
```

## Protocols

Protocol sets the strategy how to make queries to the gRPC server.

Each protocol extended from `AbstractProtocol` and implements the same API:

`invokeUnaryRequest<Request,Response>(..args): Promise<GrpcResponse<Response>>`

Basic response from gRPC servers contains:
```js
import { GrpcStatus } from '@getezy/grpc-client';

export interface GrpcErrorResponseValue {
  details?: string;
  metadata?: Record<string, unknown>;
}

export interface GrpcResponse<Response> {
  /**
   * Status code of gRPC request
   */
  code: GrpcStatus;

  /**
   * For unary requests - query execution time in milliseconds.
   * For streaming requests - receiving response actual time in utc.
   */
  timestamp: number;

  data: Response | GrpcErrorResponseValue;
}
```

`invokeClientStreamingRequest<Request,Response>(..args): ClientStream<Request, Response>`

`invokeServerStreamingRequest<Request,Response>(..args): ServerStream<Response>`

`invokeBidirectionalStreamingRequest<Request,Response>(..args): BidirectionalStream<Request, Response>`

### gRPC
Uses [@grpc/grpc-js](https://www.npmjs.com/package/@grpc/grpc-js).

```js
import { GrpcProtocol, GrpcTlsType } from '@getezy/grpc-client';

const protocol = new GrpcProtocol({
  address: '10.10.10.10',
  tls: { type: GrpcTlsType.INSECURE },
  channelOptions: { sslTargetNameOverride: 'test' },
});
```

### gRPC-Web
Uses [@improbable-eng/grpc-web](https://www.npmjs.com/package/@improbable-eng/grpc-web).

⚠️ gRPC-Web supports only **unary** and **server streaming** requests, read more [here](https://github.com/grpc/grpc-web/blob/master/doc/streaming-roadmap.md#client-streaming-and-half-duplex-streaming).

```js
import { GrpcWebProtocol, GrpcTlsType } from '@getezy/grpc-client';

const protocol = new GrpcWebProtocol({
  address: '10.10.10.10',
  tls: { type: GrpcTlsType.INSECURE },
});
```

### Custom protocol
You can write custom protocol implementation by extending `AbstractProtocol` class imported from `@getezy/grpc-client`.

```ts
import { AbstractProtocol } from '@getezy/grpc-client';

class CustomProtocol extends AbstractProtocol {
  // custom protocol implementation
}
```

# License
Mozilla Public License Version 2.0
