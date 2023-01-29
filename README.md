# @getezy/grpc-client

Universal, extendable, typesafe gRPC/gRPC-Web client for node used in [ezy](https://github.com/getezy/ezy).

# Install

```bash
npm install @getezy/grpc-client
```

# Usage

```ts
import { GrpcClient, GrpcProtocol, ProtobufLoader } from '@getezy/grpc-client';

const client = new GrpcClient(new ProtobufLoader(), new GrpcProtocol())
```

## Loaders

### ProtobufLoader

Uses [@grpc/proto-loader](https://www.npmjs.com/package/@grpc/proto-loader) for load protobuf definition from giving path.

Overided defaults options are:
```js
keepCase: true,
defaults: true,
includeDirs: [],
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
  public load(): Promise<GrpcServiceDefinition[]> {
    // custom load implementation
  }
}
```

## Protocols

### gRPC

### gRPC-Web

### Custom protocol

You can write custom protocol implementation by extending `AbstractProtocol` class imported from `@getezy/grpc-client`.

```ts
import { AbstractProtocol } from '@getezy/grpc-client';

class CustomProtocol extends AbstractProtocol {}
```

# License
Mozilla Public License Version 2.0
