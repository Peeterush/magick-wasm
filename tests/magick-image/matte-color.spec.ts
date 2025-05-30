/*
  Copyright Dirk Lemstra https://github.com/dlemstra/magick-wasm.
  Licensed under the Apache License, Version 2.0.
*/

import { MagickColors } from '@src/magick-colors';
import { TestFiles } from '@test/test-files';

describe('MagickImage#matteColor', () => {
    it('should return the matte color of the image', () => {
        TestFiles.Images.empty.use(image => {
            const matteColor = image.matteColor;
            expect(matteColor.r).toBe(189);
            expect(matteColor.g).toBe(189);
            expect(matteColor.b).toBe(189);
            expect(matteColor.a).toBe(255);
        });
    });

    it('should change matte color', () => {
        TestFiles.Images.empty.use(image => {
            image.matteColor = MagickColors.Black;
            const matteColor = image.matteColor;
            expect(matteColor.r).toBe(0);
            expect(matteColor.g).toBe(0);
            expect(matteColor.b).toBe(0);
            expect(matteColor.a).toBe(255);
        });
    });
});
