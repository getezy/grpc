/* eslint-disable max-classes-per-file */

import { TypedEmitter } from 'tiny-typed-emitter';

import { GrpcRequestValue, GrpcResponse, GrpcResponseValue } from '@protocols';

interface ClientStreamEmitterEvents<
  Request extends GrpcRequestValue,
  Response extends GrpcResponseValue
> {
  write: (payload: Request) => void;
  end: () => void;
  cancel: () => void;
  error: (error: GrpcResponse<Response>) => void;
  response: (response: GrpcResponse<Response>) => void;
}

export class ClientStream<
  Request extends GrpcRequestValue = GrpcRequestValue,
  Response extends GrpcResponseValue = GrpcResponseValue
> extends TypedEmitter<ClientStreamEmitterEvents<Request, Response>> {
  public error(error: GrpcResponse<Response>) {
    this.emit('error', error);
  }

  public response(response: GrpcResponse<Response>) {
    this.emit('response', response);
  }

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
   * End the stream.
   */
  public end() {
    this.emit('end');
  }
}
