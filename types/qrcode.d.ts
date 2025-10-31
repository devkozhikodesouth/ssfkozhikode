declare module "qrcode" {
  // Minimal types used by this project. Expand if you use more APIs.
  export function toFile(path: string, text: string, options?: any): Promise<void>;
  export function toDataURL(text: string, options?: any): Promise<string>;
  const _default: {
    toFile: typeof toFile;
    toDataURL: typeof toDataURL;
  };
  export default _default;
}
