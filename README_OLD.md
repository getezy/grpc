### Protocols

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

#### gRPC
Uses [@grpc/grpc-js](https://www.npmjs.com/package/@grpc/grpc-js).

```js
import { GrpcProtocol, GrpcTlsType } from '@getezy/grpc-client';

const protocol = new GrpcProtocol({
  address: '10.10.10.10',
  tls: { type: GrpcTlsType.INSECURE },
  channelOptions: { sslTargetNameOverride: 'test' },
});
```

#### gRPC-Web
Uses [@improbable-eng/grpc-web](https://www.npmjs.com/package/@improbable-eng/grpc-web).

⚠️ gRPC-Web supports only **unary** and **server streaming** requests, read more [here](https://github.com/grpc/grpc-web/blob/master/doc/streaming-roadmap.md#client-streaming-and-half-duplex-streaming).

```js
import { GrpcWebProtocol, GrpcTlsType } from '@getezy/grpc-client';

const protocol = new GrpcWebProtocol({
  address: '10.10.10.10',
  tls: { type: GrpcTlsType.INSECURE },
});
```

#### Custom protocol
You can write custom protocol implementation by extending `AbstractProtocol` class imported from `@getezy/grpc-client`.

```ts
import { AbstractProtocol } from '@getezy/grpc-client';

class CustomProtocol extends AbstractProtocol {
  // custom protocol implementation
}
```

## License
Mozilla Public License Version 2.0
