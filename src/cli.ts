#!/usr/bin/env node
import { svgToIco } from './svg-to-ico.js';
import path from 'path';

async function do_convert () {
  // check the command line arguments
  if (process.argv.length < 3) {
    throw new Error('requires the input file name.');
  }

  // parse the command line arguments.
  const input_name = process.argv[2];
  let output_name = path.join(process.cwd(), 'favicon.ico');
  if (process.argv.length >= 4) {
    output_name = process.argv[3];
  }

  await svgToIco({ input_name, output_name });
}

do_convert()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(`conversion error: ${error}`);
    process.exit(1);
  });

