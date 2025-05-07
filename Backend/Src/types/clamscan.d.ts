declare module "clamscan" {
  interface ClamOptions {
    clamdscan?: {
      socket?: string;
      host?: string;
      port?: number;
      path?: string;
      timeout?: number;
      local_fallback?: boolean;
      config_file?: string;
    };
    clamscan?: {
      path?: string;
      db?: string;
      scan_archives?: boolean;
      active?: boolean;
    };
    preference?: "clamdscan" | "clamscan";
  }

  interface ScanResult {
    file: string;
    isInfected: boolean;
    viruses: string[];
  }

  interface Scanner {
    init(options?: ClamOptions): Promise<Scanner>;
    scanFile(filePath: string): Promise<ScanResult>;
    scanFiles(filePaths: string[]): Promise<ScanResult[]>;
    scanDir(directoryPath: string): Promise<ScanResult[]>;
    isInfected(filePath: string): Promise<boolean>;
    passthrough(readStream: NodeJS.ReadableStream): NodeJS.ReadableStream;
    scanStream(readStream: NodeJS.ReadableStream): Promise<ScanResult>;
  }

  class NodeClam {
    constructor();
    init(options?: ClamOptions): Promise<Scanner>;
  }

  export = NodeClam;
}
