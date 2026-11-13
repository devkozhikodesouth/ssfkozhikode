declare module "qrcode" {
  // Minimal types used by this project. Expand if you use more APIs.
  export function toFile(path: string, text: string, options?: any): Promise<void>;
  export function toDataURL(text: string, options?: any): Promise<string>;
  export function toString(text: string, options?: any): Promise<string>;
  const _default: {
    toFile: typeof toFile;
    toDataURL: typeof toDataURL;
    toString: typeof toString;
  };
  export default _default;
}
