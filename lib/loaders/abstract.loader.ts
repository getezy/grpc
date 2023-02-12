import type { PackageDefinition } from '@grpc/proto-loader';

import { GrpcServiceDefinition } from './interfaces';

/**
 * AbstractLoader used for loading package definition from giving source.
 */
export abstract class AbstractLoader {
  protected services?: GrpcServiceDefinition[];

  protected packageDefinition?: PackageDefinition;

  constructor(protected readonly source: string) {}

  /**
   * Returns grpc service definitions
   */
  public getServices() {
    return this.services;
  }

  /**
   * Returns package definition from '@grpc/proto-loader'
   */
  public getPackageDefinition() {
    if (this.packageDefinition) {
      return this.packageDefinition;
    }

    throw new Error('Package definition is undefined, please load it first.');
  }

  /**
   * Loads PackageDefinition from source
   */
  public abstract load(): Promise<void>;
}
