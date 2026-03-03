declare module 'ico-endec' {
  export function encode (buffers: Buffer[]): Buffer;
  export function decode (buffers: Buffer): IcoIcon[];

  export interface IcoIcon {
    width: number;
    height: number;
    colors: number;
    colorPlanes: number;
    bitsPerPixel: number;
    horizontalHotspot: number;
    verticalHotspot: number;
    imageType: 'png' | 'bmp';
    imageData: Buffer;
  }
}