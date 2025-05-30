/*
  Copyright Dirk Lemstra https://github.com/dlemstra/magick-wasm.
  Licensed under the Apache License, Version 2.0.
*/

import { MagickColors } from '@src/magick-colors';
import { TestFiles } from '@test/test-files';

describe('MagickImage#histogram', () => {
    it('should return a histogram of the image', () => {
        TestFiles.Images.Builtin.logo.use(image => {
            const histogram = image.histogram();

            expect(histogram).not.toBeNull();
            expect(histogram.size).toBe(256);
            expect(histogram.get(MagickColors.Red.toString())).toBe(2942n);
            expect(histogram.get(MagickColors.White.toString())).toBe(256244n);
        });
    });
});
