/*
  Copyright Dirk Lemstra https://github.com/dlemstra/magick-wasm.
  Licensed under the Apache License, Version 2.0.
*/

import { TestImages } from '@test/test-images';

describe('MagickImageCollection#smushHorizontal', () => {
    it('should throw exception when collection is empty', () => {
        TestImages.emptyCollection.use((images) => {
            expect(() => {
                images.smushHorizontal(3, () => { /* never reached */ });
            }).toThrowError('operation requires at least one image');
        });
    });

    it('should smush the images horizontally', () => {
        TestImages.roseSparkleGif.use((images) => {
            images.smushHorizontal(10, (image) => {
                expect(image.width).toBe(230);
                expect(image.height).toBe(46);
                expect(image).toHavePixelWithColor(75, 20, '#2c2b2bff');
            });
        });
    });
});