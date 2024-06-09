import { AbstractLoader } from '@getezy/grpc-core';
import * as ProtoLoader from '@grpc/proto-loader';

import type { ProtobufLoaderOptions } from './types';

export class ReflectionLoader extends AbstractLoader {
  constructor(
    private readonly source: string,
    private readonly options?: ProtobufLoaderOptions
  ) {
    super();
  }

  public async load(): Promise<void> {
    this.packageDefinition = await ProtoLoader.load(this.source, {
      keepCase: true,
      defaults: true,
      includeDirs: [],
      longs: String,
      ...this.options,
    });
  }
}
