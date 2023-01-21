import * as path from 'node:path';

import { GrpcMethodType, ProtobufLoader } from '../../loaders';

const SERVICES_MOCK = [
  {
    methods: [
      { name: 'SimpleUnaryRequest', type: GrpcMethodType.UNARY },
      { name: 'SimpleClientStreamRequest', type: GrpcMethodType.CLIENT_STREAMING },
      { name: 'SimpleServerStreamRequest', type: GrpcMethodType.SERVER_STREAMING },
      { name: 'SimpleBidirectionalStreamRequest', type: GrpcMethodType.BIDIRECTIONAL_STREAMING },
    ],
    name: 'simple_package.v1.SimpleService',
  },
];

describe('ProtobufLoader', () => {
  it('should load protobuf v2', async () => {
    const v2 = path.join(__dirname, '../fixtures/proto/v2.proto');
    const loader = new ProtobufLoader(v2);

    const services = await loader.load();

    expect(services).toStrictEqual(SERVICES_MOCK);
  });

  it('should load protobuf v3', async () => {
    const v3 = path.join(__dirname, '../fixtures/proto/v3.proto');
    const loader = new ProtobufLoader(v3);

    const services = await loader.load();

    expect(services).toStrictEqual(SERVICES_MOCK);
  });

  it('should throw error if proto does not exist', async () => {
    const protobuf = path.join(__dirname, '../ixtures/proto/test.proto');
    const loader = new ProtobufLoader(protobuf);

    await expect(loader.load()).rejects.toThrow();
  });

  it('should throw error if parsing error occurs', async () => {
    const v3 = path.join(__dirname, '../fixtures/proto/v3-with-error.proto');
    const loader = new ProtobufLoader(v3);

    await expect(loader.load()).rejects.toThrow();
  });
});
