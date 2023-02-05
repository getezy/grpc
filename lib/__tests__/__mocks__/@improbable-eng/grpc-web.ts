const originalModule = jest.requireActual('@improbable-eng/grpc-web');

const { grpc: originalGrpc } = originalModule;

export const grpc = {
  Metadata: originalGrpc.Metadata,
  invoke: jest.fn((...args) => originalGrpc.invoke(...args)),
};
