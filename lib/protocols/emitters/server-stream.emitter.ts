/* eslint-disable max-classes-per-file */

import { TypedEmitter } from 'tiny-typed-emitter';

import { GrpcResponse, GrpcResponseValue } from '@protocols';

interface ServerStreamEvents<Response extends GrpcResponseValue> {
  end: () => void;
  cancel: () => void;
  error: (error: GrpcResponse<Response>) => void;
  response: (response: GrpcResponse<Response>) => void;
}

export class ServerStream<
  Response extends GrpcResponseValue = GrpcResponseValue,
> extends TypedEmitter<ServerStreamEvents<Response>> {
  /**
   * Cancel the stream.
   */
  public cancel() {
    this.emit('cancel');
  }
}
