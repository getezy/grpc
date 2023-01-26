import * as fs from 'node:fs';
import * as path from 'node:path';

export interface Certificates {
  rootCertPath: string;
  rootCert: Buffer;
  clientCertPath: string;
  clientCert: Buffer;
  clientKeyPath: string;
  clientKey: Buffer;
}

export function loadCertificates(): Certificates {
  const rootCertPath = path.join(__dirname, '../__fixtures__/certs/ca-cert.pem');
  const clientCertPath = path.join(__dirname, '../__fixtures__/certs/client-cert.pem');
  const clientKeyPath = path.join(__dirname, '../__fixtures__/certs/client-key.pem');

  return {
    rootCertPath,
    rootCert: fs.readFileSync(rootCertPath),
    clientCertPath,
    clientCert: fs.readFileSync(clientCertPath),
    clientKeyPath,
    clientKey: fs.readFileSync(clientKeyPath),
  };
}
