/*
  Copyright Dirk Lemstra https://github.com/dlemstra/magick-wasm.
  Licensed under the Apache License, Version 2.0.
*/

import { DrawableLine } from '@src/drawing/drawable-line';
import { DrawableFillColor } from '@src/drawing/drawable-fill-color';
import { MagickColors } from '@src/magick-colors';
import { TestFiles } from '@test/test-files';

describe('DrawableLine', () => {
    it('should draw a line on the image', () => {
        TestFiles.Images.empty150x150Canvas.use((image) => {
            const fillColor = MagickColors.Red;

            image.draw([
                new DrawableFillColor(fillColor),
                new DrawableLine(10, 10, 40, 50)
            ]);

            expect(image).toHavePixelWithColor(9, 9, MagickColors.White);
            expect(image).toHavePixelWithColor(10, 9, MagickColors.White);
            expect(image).toHavePixelWithColor(9, 10, MagickColors.White);
            expect(image).toHavePixelWithColor(10, 10, fillColor);
            expect(image).toHavePixelWithColor(22, 26, fillColor);
            expect(image).toHavePixelWithColor(40, 50, fillColor);
        });
    });
});
