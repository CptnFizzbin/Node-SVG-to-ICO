import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { createTempDir, fileExists, FIXTURE_DIR, getIcoImages } from '../tests/testUtils';
import fs from 'node:fs/promises';
import svgToIco, { defaultSizes } from './svg-to-ico';

const koalaSvgPath = path.resolve(FIXTURE_DIR, 'koala.svg');

describe('svgToIco', () => {
  let tempDir: string;
  let outputPath: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
    outputPath = path.resolve(tempDir, 'koala.ico');
  });

  afterEach(async () => {
    await fs.rmdir(tempDir, { recursive: true });
  });

  test('it creates an .ico file from an SVG file', async () => {
    // Act
    await svgToIco({
      input_name: koalaSvgPath,
      output_name: outputPath,
    });

    // Assert
    const outputExists = await fileExists(outputPath);
    expect(outputExists).toBe(true);
  });

  describe('without an output name', () => {
    let inputPath: string;
    let originalCwd: string;
    let currentDir: string;

    beforeEach(async () => {
      // change the current working directory to the temp directory for this test
      originalCwd = process.cwd();
      process.chdir(tempDir);
      currentDir = process.cwd();

      // create a copy of the input file in the temp directory
      // to avoid writing to the fixture directory
      inputPath = path.join(tempDir, 'input.svg');
      await fs.copyFile(koalaSvgPath, inputPath);
      outputPath = path.join(currentDir, 'favicon.ico');

    });

    afterEach(() => {
      process.chdir(originalCwd);
    });

    test('it creates a favicon.ico file in the current directory', async () => {
      // Act
      await svgToIco({
        input_name: inputPath,
      });

      // Assert
      const outputExists = await fileExists(outputPath);
      expect(outputExists).toBe(true);
    });
  });

  describe('compression level', () => {
    test.each([
      { level: 1 }, // min
      { level: 5 }, // default
      { level: 9 }, // max
    ])(
      'it accepts valid compression level $level', async ({ level }) => {
        await expect(svgToIco({
          input_name: koalaSvgPath,
          output_name: outputPath,
          compression_level: level,
        })).resolves.toBeUndefined();
      });

    test.each([
      { level: -1 },
      { level: 10 },
      { level: 5.5 },
    ])(
      'it throws an error for invalid compression level $level', async ({ level }) => {
        await expect(svgToIco({
          input_name: koalaSvgPath,
          output_name: outputPath,
          compression_level: level,
        })).rejects.toThrow(`invalid compression_level '${level}'`);
      });
  });

  describe('sizes', () => {

    test('it creates an .ico file with default sizes', async () => {
      // Act
      await svgToIco({
        input_name: koalaSvgPath,
        output_name: outputPath,
      });

      // Assert
      const images = await getIcoImages(outputPath);
      const imageSizes = images.map((img) => img.width);
      expect(imageSizes).toEqual(defaultSizes);
    });

    test('it creates an .ico file with custom sizes', async () => {
      // Arrange
      const customSizes = [24, 48, 96];

      // Act
      await svgToIco({
        input_name: koalaSvgPath,
        output_name: outputPath,
        sizes: customSizes,
      });

      // Assert
      const images = await getIcoImages(outputPath);
      const imageSizes = images.map((img) => img.width);
      expect(imageSizes).toEqual(customSizes);
    });

    test.each([
      { sizes: [1] }, // min
      { sizes: [256] }, // max
      { sizes: [16, 64, 256] }, // valid range
    ])(
      'it accepts valid sizes $sizes', async ({ sizes }) => {
        await expect(svgToIco({
          input_name: koalaSvgPath,
          output_name: outputPath,
          sizes,
        })).resolves.toBeUndefined();
      });

    test.each([
      { sizes: [0] }, // below min
      { sizes: [257] }, // above max
      { sizes: [16.5] }, // non-integer
      { sizes: [-1] }, // negative
      { sizes: [16, 256.5] }, // mixed valid and invalid
    ])(
      'it throws an error for invalid sizes $sizes', async ({ sizes }) => {
        await expect(svgToIco({
          input_name: koalaSvgPath,
          output_name: outputPath,
          sizes,
        })).rejects.toThrow(/invalid size/);
      });
  });
});