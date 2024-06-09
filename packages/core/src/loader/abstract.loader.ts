import type { PackageDefinition } from '@grpc/proto-loader';

export abstract class AbstractLoader {
  protected packageDefinition?: PackageDefinition;

  /**
   * Loads package definition from provided source
   */
  public abstract load(): Promise<void>;

  /**
   * Returns package definition from '@grpc/proto-loader'
   */
  public getPackageDefinition(): PackageDefinition {
    if (this.packageDefinition) {
      return this.packageDefinition;
    }

    throw new Error(`PackageDefinition wasn't loaded`);
  }
}
