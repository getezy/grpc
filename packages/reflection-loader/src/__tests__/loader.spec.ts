// import * as path from 'node:path';

// import { ProtobufLoader } from '../index';

describe('ProtobufLoader', () => {
  it('should load protobuf v2', async () => {
    // const protobuf = path.join(__dirname, '../../../../tests/fixtures/proto/v2.proto');
    // const loader = new ProtobufLoader(protobuf);
    // await loader.load();
    // const packageDefinition = loader.getPackageDefinition();
    // expect(packageDefinition['simple_package.v1.SimpleMessage']).toBeTruthy();
  });

  // it('should load protobuf v3', async () => {
  //   const protobuf = path.join(__dirname, '../../../../tests/fixtures/proto/v3.proto');
  //   const loader = new ProtobufLoader(protobuf);

  //   await loader.load();

  //   const packageDefinition = loader.getPackageDefinition();

  //   expect(packageDefinition['simple_package.v1.SimpleMessage']).toBeTruthy();
  // });

  // it('should throw error if proto does not exist', async () => {
  //   const protobuf = path.join(__dirname, 'test.proto');
  //   const loader = new ProtobufLoader(protobuf);

  //   await expect(loader.load()).rejects.toThrow();
  // });

  // it('should throw error if parsing error occurs', async () => {
  //   const protobuf = path.join(__dirname, '../../../../tests/fixtures/proto/v3_with_error.proto');
  //   const loader = new ProtobufLoader(protobuf);

  //   await expect(loader.load()).rejects.toThrow();
  // });
});
