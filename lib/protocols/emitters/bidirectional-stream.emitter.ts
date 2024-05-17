/* eslint-disable max-classes-per-file */

import { TypedEmitter } from 'tiny-typed-emitter';

import { GrpcRequestValue, GrpcResponse, GrpcResponseValue } from '@protocols';

interface BidirectionalStreamEvents<
  Request extends GrpcRequestValue,
  Response extends GrpcResponseValue,
> {
  write: (payload: Request) => void;
  'end-client-stream': () => void;
  'end-server-stream': () => void;
  cancel: () => void;
  error: (error: GrpcResponse<Response>) => void;
  response: (response: GrpcResponse<Response>) => void;
}

export class BidirectionalStream<
  Request extends GrpcRequestValue = GrpcRequestValue,
  Response extends GrpcResponseValue = GrpcResponseValue,
> extends TypedEmitter<BidirectionalStreamEvents<Request, Response>> {
  /**
   * Send payload to the stream.
   */
  public write(payload: Request) {
    this.emit('write', payload);
  }

  /**
   * Cancel the stream.
   */
  public cancel() {
    this.emit('cancel');
  }

  /**
   * End the client stream.
   */
  public end() {
    this.emit('end-client-stream');
  }
}
