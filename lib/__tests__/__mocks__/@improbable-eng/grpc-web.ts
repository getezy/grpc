/* eslint-disable no-underscore-dangle */

const originalModule = jest.requireActual('@improbable-eng/grpc-web');

const { grpc: originalGrpc } = originalModule;

const invoke = jest.fn((methodDefinition, options) => {
  // Hack to wait for subscribers
  setTimeout(() => {
    options.onMessage(
      methodDefinition.responseType.deserializeBinary(options.request.serializeBinary())
    );
  }, 0);
});

export const grpc = {
  Metadata: originalGrpc.Metadata,
  invoke,
};
