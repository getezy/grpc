import { AbstractLoader, GrpcServiceDefinition } from '../../loaders';

class TestLoader extends AbstractLoader {
  public services: GrpcServiceDefinition[] = [];

  public load(): Promise<GrpcServiceDefinition[]> {
    return Promise.resolve(this.services);
  }
}

describe('AbstractLoader', () => {
  let loader: TestLoader;

  beforeAll(() => {
    loader = new TestLoader();
  });

  it('should be defined with loadDefinition method', async () => {
    expect(loader).toBeDefined();
    expect(await loader.load()).toStrictEqual([]);
  });
});
