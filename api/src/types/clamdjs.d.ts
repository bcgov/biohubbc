declare module 'clamdjs' {
  interface ClamScanner {
    scanBuffer: (buffer: string | Buffer, timeout: number, chunkSize: number) => Promise;
  }

  export function createScanner(host: string, port: number): ClamScanner;
}
