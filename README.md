🛵 Universal, extendable, typesafe gRPC/gRPC-Web client for node used in [ezy](https://github.com/getezy/ezy).

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/731941e4ddcb4fc7aa675d51dfb55f51)](https://www.codacy.com/gh/getezy/grpc-client/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=getezy/grpc-client&amp;utm_campaign=Badge_Grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/731941e4ddcb4fc7aa675d51dfb55f51)](https://www.codacy.com/gh/getezy/grpc-client/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=getezy/grpc-client&amp;utm_campaign=Badge_Coverage)

> **Warning**  
> This lib is not production ready until it is merged to main ezy project.

## Installation
```bash
npm i @getezy/grpc-client
```

## Usage
This library was designed to be extendable as much as possible.
To start you need `GrpcClient`, `Loader` and `Protocol`.

Use `GrpcClientFactory` for creating `GrpcClient` instance.

`GrpcClientFactory.create(loader: AbstractLoader, protocol: AbstractProtocol): Promise<GrpcClient>`

```ts
import { GrpcClientFactory, GrpcProtocol, ProtobufLoader, GrpcTlsType } from '@getezy/grpc-client';
import * as path from 'node:path';

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
`Loader` - is the strategy defines how to load gRPC package definitions.

### ProtobufLoader
Uses [@grpc/proto-loader](https://www.npmjs.com/package/@grpc/proto-loader) for load protobuf definition from the giving path.

`new ProtobufLoader(path: string, [options])`

```ts
import { ProtobufLoader } from '@getezy/grpc-client';
import * as path from 'node:path';

const loader = new ProtobufLoader(
  path.join(__dirname, '../proto/main.proto'),
  {
    defaults: false,
  }
);
```

Refer to `@grpc/proto-loader` [documentation](https://github.com/grpc/grpc-node/tree/master/packages/proto-loader#usage) to see available options.

Default options are:
```ts
{
  // Preserve field names. The default
  // is to change them to camel case.
  keepCase: true,

  // Set default values on output objects.
  // Defaults to false.
  defaults: true,

  // A list of search paths for imported .proto files.
  includeDirs: [],

  // The type to use to represent long values.
  // Defaults to a Long object type.
  longs: String,
}
```

### ReflectionLoader
Loader by reflection API is coming soon.

### CustomLoader
You can write custom loader implementation by extending `AbstractLoader` class imported from `@getezy/grpc-client`.

```ts
import { AbstractLoader } from '@getezy/grpc-client';

class CustomLoader extends AbstractLoader {
  public async load(): Promise<void> {
    // custom loader implementation
  }
}
```

## Protocols
`Protocol` - is the strategy defines how to make queries to the gRPC server.

### GrpcProtocol
Uses [@grpc/grpc-js](https://www.npmjs.com/package/@grpc/grpc-js).

### GrpcWebProtocol
> **Note**  
> Official gRPC-Web implementation has problems with server-streaming responses. Read more [here](https://github.com/grpc/grpc-web/issues/1277).

Uses [@improbable-eng/grpc-web](https://www.npmjs.com/package/@improbable-eng/grpc-web).

> **Warning**  
> gRPC-Web protocol supports only **unary** and **server streaming** requests, follow the streaming roadmap [here](https://github.com/grpc/grpc-web/blob/master/doc/streaming-roadmap.md#client-streaming-and-half-duplex-streaming).

## License
Mozilla Public License Version 2.0
