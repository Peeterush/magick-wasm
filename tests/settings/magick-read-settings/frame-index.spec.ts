/*
  Copyright Dirk Lemstra https://github.com/dlemstra/magick-wasm.
  Licensed under the Apache License, Version 2.0.
*/

import { ImageMagick } from '@src/image-magick';
import { MagickReadSettings } from '@src/settings/magick-read-settings';
import { TestFiles } from '@test/test-files';

describe('MagickReadSettings#frameIndex', () => {
    it('should only read the specified index of the collection', () => {
        const settings = new MagickReadSettings();
        settings.frameIndex = 1;

        ImageMagick.read(TestFiles.Images.roseSparkleGif.data, settings, image => {
            TestFiles.Images.roseSparkleGif.use(collection => {
                expect(image).toEqualImage(collection[1]);
            });
        });
    });

    it('should throw exception when the frame index is invalid', () => {
        const settings = new MagickReadSettings();
        settings.frameIndex = 42;

        expect(() => {
            ImageMagick.read(TestFiles.Images.roseSparkleGif.data, settings, () => {});
        })
        .toThrowError('InvalidImageIndex');
    });
});
