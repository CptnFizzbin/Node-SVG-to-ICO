import fs from "node:fs";
import sharp from "sharp";
import { encode } from "ico-endec";

/**
 * Default sizes to include in the .ico file if not specified by the user
 */
export const defaultSizes = [16, 32, 48, 64, 128, 256];

export interface SvgToIcoOptions {
  /** Specifies the file name and path for the SVG input file */
  input_name: string;

  /** Specifies the name and path for the output .ico file */
  output_name?: string;

  /** Specifies the array of sizes to include in the packaged .ico file */
  sizes?: number[];

  /** Specifies the compression level (0-9) to use with PNG conversions */
  compression_level?: number;
}

/**
 * Converts an SVG file to ICO format with multiple sizes
 *
 * @param options - Configuration options for the conversion
 * @returns Promise that resolves when the conversion is complete
 */
export async function svgToIco({
  input_name,
  output_name = "favicon.ico",
  sizes = defaultSizes,
  compression_level = 1,
}: SvgToIcoOptions): Promise<void> {
  if (!Number.isInteger(compression_level) || compression_level < 0 || compression_level > 9) {
    throw new Error(`invalid compression_level '${compression_level}'`);
  }

  for (const size of sizes) {
    if (!Number.isInteger(size) || size < 1 || size > 256) {
      throw new Error(`invalid size '${size}'. Size must be an integer between 1 and 256`);
    }
  }

  const output_promises = sizes.map((size) => {
    return sharp(input_name)
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: compression_level })
      .toBuffer();
  });

  const buffers = await Promise.all(output_promises);
  const ico_buffer = encode(buffers);
  await fs.promises.writeFile(output_name, ico_buffer);
}

// noinspection JSUnusedGlobalSymbols - Default export for backward compatibility
export default svgToIco;

