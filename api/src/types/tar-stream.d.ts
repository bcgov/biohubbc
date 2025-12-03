declare module 'tar-stream' {
  import { Readable, Writable } from 'stream';

  export interface Headers {
    name: string;
    mode?: number;
    uid?: number;
    gid?: number;
    size?: number;
    mtime?: Date;
    linkname?: string | null;
    type?:
      | 'file'
      | 'link'
      | 'symlink'
      | 'character-device'
      | 'block-device'
      | 'directory'
      | 'fifo'
      | 'contiguous-file'
      | 'pax-header'
      | 'pax-global-header'
      | 'gnu-long-link-path'
      | 'gnu-long-path'
      | null
      | undefined;
    uname?: string;
    gname?: string;
    devmajor?: number;
    devminor?: number;
  }

  export type Callback = (err?: Error | null) => void;

  export interface Pack extends Readable {
    entry(headers: Headers, callback?: Callback): Writable;
    entry(headers: Headers, buffer?: string | Buffer, callback?: Callback): Writable;
    finalize(): void;
  }

  export interface Extract extends Writable {
    on(event: string, listener: (...args: any[]) => void): this;
    on(event: 'entry', listener: (headers: Headers, stream: Readable, next: (error?: unknown) => void) => void): this;
  }

  export interface ExtractOptions {
    allowUnknownFormat?: boolean;
    filenameEncoding?: BufferEncoding;
  }

  export function pack(opts?: any): Pack;
  export function extract(opts?: ExtractOptions): Extract;
}
