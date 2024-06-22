export type GrpcRequestOptions = {
  /**
   * Full service name
   * @example <caption>With package name</caption>
   * simple_package.v1.SimpleService
   * @example <caption>Without package name</caption>
   * SimpleService
   */
  service: string;

  /**
   * Method name
   * @example
   * SimpleUnaryRequest
   */
  method: string;
};
