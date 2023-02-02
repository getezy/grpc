import { grpc } from '@improbable-eng/grpc-web';

export class GrpcWebError extends Error {
  constructor(
    readonly code: grpc.Code,
    readonly details: string,
    readonly metadata?: grpc.Metadata
  ) {
    super(details);
  }

  toObject() {
    return {
      details: this.details,
      metadata: this.metadata?.headersMap,
    };
  }
}
