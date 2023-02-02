/* eslint-disable no-underscore-dangle */

const originalModule = jest.requireActual('@improbable-eng/grpc-web');

const { grpc: originalGrpc } = originalModule;

let response: any = null;

// eslint-disable-next-line @typescript-eslint/naming-convention
const __setResponse = (code: number, details: string, metadata: any) => {
  response = [code, details, metadata];
};

const invoke = jest.fn((methodDefinition, options) => {
  setTimeout(() => {
    if (response) {
      options.onEnd(...response);
    } else {
      options.onMessage(
        methodDefinition.responseType.deserializeBinary(options.request.serializeBinary())
      );
    }
  }, 0);
});

export const grpc = {
  Metadata: originalGrpc.Metadata,
  invoke,
  __setResponse,
};
