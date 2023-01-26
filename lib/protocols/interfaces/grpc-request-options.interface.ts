export interface GrpcRequestOptions {
  /**
   * Full service name
   * @example
   * // If protobuf definition has package name
   * simple_package.v1.SimpleService
   * @example
   * // If protobuf definition doesn't have package name
   * SimpleService
   */
  service: string;

  /**
   * Method name
   * @example
   * SimpleUnaryRequest
   */
  method: string;
}
