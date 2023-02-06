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
import { GrpcClientFactory, GrpcProtocol, ProtobufLoader } from '@getezy/grpc-client';
import * as path from 'node:path';

const client = await GrpcClientFactory.create(
  new ProtobufLoader(path.join(__dirname, '../proto/main.proto')),
  new GrpcProtocol({ address: '10.10.10.10' })
);

const payload = { id: '21443e83-d6ab-45b7-9afd-65b2e0ee8957' };
const metadata = { 'x-access-token': 'token' };
const response = await client.invokeUnaryRequest<Request, Response>(
  { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
  payload,
  metadata
);
```

## GrpcClient API
`GrpcClient` has public methods to query gRPC server:

```ts
class GrpcClient<MetadataValue, Metadata> {
  public invokeUnaryRequest<Request, Response>(
    options: GrpcRequestOptions,
    request: Request,
    metadata?: Record<string, MetadataValue>
  ): Promise<GrpcResponse<Response>>;

  public invokeClientStreamingRequest<Request, Response>(
    options: GrpcRequestOptions,
    metadata?: Record<string, MetadataValue>
  ): ClientStream<Request, Response>;

  public invokeServerStreamingRequest<Request, Response>(
    options: GrpcRequestOptions,
    payload: Request,
    metadata?: Record<string, MetadataValue>
  ): ServerStream<Response>;

  public invokeBidirectionalStreamingRequest<Request, Response>(
    options: GrpcRequestOptions,
    metadata?: Record<string, MetadataValue>
  ): BidirectionalStream<Request, Response>;
}
```

The first argument in each method defines the query options - service and method name.

```ts
interface GrpcRequestOptions {
  service: string;
  method: string;
}
```

### Response Convention
When you define `Response` type in methods it will be wrapped with `GrpcResponse` type.

```ts
interface GrpcErrorResponseValue {
  details?: string;
  metadata?: Record<string, unknown>;
}

type GrpcResponseValue = Record<string, unknown>;

interface GrpcResponse<Response extends GrpcResponseValue = GrpcResponseValue> {
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

### Unary Request
```ts
const response = await client.invokeUnaryRequest(
  { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
  { id: '21443e83-d6ab-45b7-9afd-65b2e0ee8957' }
);
```

> **Note**
> If error occured this method will not through error. You can handle this by checking status code in response.

```ts
import { GrpcStatus } from '@getezy/grpc-client';

const response = await client.invokeUnaryRequest(
  { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
  { id: '21443e83-d6ab-45b7-9afd-65b2e0ee8957' }
);

if (response.code !== GrpcStatus.OK) {
  // do something
}
```

### Client-Streaming Request
```ts
const stream = client.invokeClientStreamingRequest({
  service: 'simple_package.v1.SimpleService',
  method: 'SimpleClientStreamRequest',
});

stream.on('response', (response) => {});

stream.on('error', (error) => {});

stream.write({ id: '21443e83-d6ab-45b7-9afd-65b2e0ee8957' });

stream.end();

// If you want to cancel stream from the client do
stream.cancel()
```

`ClientStream` extended from `EventEmitter`.

#### Events:
`stream.on('response', (response: GrpcResponse<Response>) => {})`  
Sibscribe on server response.

`stream.on('error', (error: GrpcResponse<Response>) => {})`  
Subscribe on server error.

#### Methods:
`stream.write(payload: Request)`  
Send payload to the stream.

`stream.cancel()`  
Cancel the stream.

`stream.end()`  
End the stream.

### Server-Streaming Request
```ts
const stream = client.invokeServerStreamingRequest(
  {
    service: 'simple_package.v1.SimpleService',
    method: 'SimpleServerStreamRequest',
  },
  { id: '21443e83-d6ab-45b7-9afd-65b2e0ee8957' },
);

stream.on('response', (response) => {});

stream.on('error', (error) => {});

stream.on('end', () => {});

// If you want to cancel stream from the client do
stream.cancel()
```

`ServerStream` extended from `EventEmitter`.

#### Events:
`stream.on('response', (response: GrpcResponse<Response>) => {})`  
Sibscribe on server response.

`stream.on('error', (error: GrpcResponse<Response>) => {})`  
Subscribe on server error.

#### Methods:
`stream.cancel()`  
Cancel the stream.

### Bidirectional-Streaming Request
```ts
const stream = client.invokeBidirectionalStreamingRequest({
  service: 'simple_package.v1.SimpleService',
  method: 'SimpleBidirectionalStreamRequest',
});

stream.on('response', (response) => {});

stream.on('error', (error) => {});

stream.on('end-server-stream', () => {})

stream.write({ id: '21443e83-d6ab-45b7-9afd-65b2e0ee8957' });

stream.end();

// If you want to cancel stream from the client do
stream.cancel()
```

`BidirectionalStream` extended from `EventEmitter`.

#### Events:
`stream.on('response', (response: GrpcResponse<Response>) => {})`  
Sibscribe on server response.

`stream.on('error', (error: GrpcResponse<Response>) => {})`  
Subscribe on server error.

`stream.on('end-server-stream', () => {})`  
Subscribe on end server stream.

#### Methods:
`stream.write(payload: Request)`  
Send payload to the stream.

`stream.cancel()`  
Cancel the stream.

`stream.end()`  
End the client stream.

## TLS
Read [this article](https://itnext.io/how-to-setup-and-test-tls-in-grpc-grpc-web-1b67cc4413e6) to understand how TLS works in gRPC and gRPC-Web.

Each protocol accepts TLS options, if TLS options are not specified Insecure connection will be used by default.

### Insecure
```ts
import { GrpcProtocol, GrpcTlsType } from '@getezy/grpc-client';

const protocol = new GrpcProtocol({
  address: '10.10.10.10',
  tls: {
    type: GrpcTlsType.INSECURE,
  },
});
```

### Server-Side TLS
```ts
import * as path from 'node:path';
import { GrpcProtocol, GrpcTlsType } from '@getezy/grpc-client';

const protocol = new GrpcProtocol({
  address: '10.10.10.10',
  tls: {
    tls: {
      type: GrpcTlsType.SERVER_SIDE,
      rootCertificatePath: path.join(__dirname, '../certs/ca-cert.pem')
    },
  },
});
```

> **Note**
> rootCertificatePath - is optional, usually used if your server has self-signed CA

### Mutual TLS
```ts
const protocol = new GrpcProtocol({
  address: '10.10.10.10',
  tls: {
    type: GrpcTlsType.MUTUAL,
    rootCertificatePath: path.join(__dirname, '../certs/ca-cert.pem'),
    clientCertificatePath: path.join(__dirname, '../certs/client-cert.pem');
    clientKeyPath: path.join(__dirname, '../certs/client-key.pem');
  },
});
```

> **Note**
> rootCertificatePath - is optional, usually used if your server has self-signed CA

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

await loader.load();
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
`Protocol` - is the strategy defines how to make queries to gRPC server.

### GrpcProtocol
Uses [@grpc/grpc-js](https://www.npmjs.com/package/@grpc/grpc-js).

`new GrpcProtocol(options: GrpcProtocolOptions)`

```ts
import { GrpcProtocol, GrpcTlsType } from '@getezy/grpc-client';

const protocol = new GrpcProtocol({
  address: '10.10.10.10',
  tls: { type: GrpcTlsType.INSECURE },
  channelOptions: { sslTargetNameOverride: 'test' },
});
```

### GrpcWebProtocol
Uses [@improbable-eng/grpc-web](https://www.npmjs.com/package/@improbable-eng/grpc-web).

> **Note**  
> Official gRPC-Web implementation has problems with server-streaming responses. Read more [here](https://github.com/grpc/grpc-web/issues/1277).

> **Warning**  
> gRPC-Web protocol supports only **unary** and **server-streaming** requests, follow the streaming roadmap [here](https://github.com/grpc/grpc-web/blob/master/doc/streaming-roadmap.md#client-streaming-and-half-duplex-streaming). When you will try to call client or bidirectional streaming request with this protocol you will get the error.

`new GrpcWebProtocol(options: AbstractProtocolOptions)`

```ts
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

class CustomProtocol extends AbstractProtocol<MetadataValue, Metadata> {
  // custom protocol implementation
}
```

## License
Mozilla Public License Version 2.0
