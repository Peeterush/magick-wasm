/*
  Copyright Dirk Lemstra https://github.com/dlemstra/magick-wasm.
  Licensed under the Apache License, Version 2.0.
*/

import { MagickGeometry } from '@src/types/magick-geometry';
import { TestImages } from '@test/test-images';

describe('MagickImage#thumbnail', () => {
    it('should resize the image to within the given dimensions', () => {
        TestImages.Builtin.logo.use(image => {
            image.thumbnail(100, 100);

            expect(image.width).toBe(100);
            expect(image.height).toBe(75);
        });
    });

    it('should resize the image based on the given width', () => {
        TestImages.Builtin.logo.use(image => {
            image.thumbnail(150, 0);

            expect(image.width).toBe(150);
            expect(image.height).toBe(113);
        });
    });

    it('should resize the image based on the given height', () => {
        TestImages.Builtin.logo.use(image => {
            image.thumbnail(0, 100);

            expect(image.width).toBe(133);
            expect(image.height).toBe(100);
        });
    });

    it('should resize based on the given geometry', () => {
        TestImages.Builtin.logo.use(image => {
            image.thumbnail(new MagickGeometry(200, 200));

            expect(image.width).toBe(200);
            expect(image.height).toBe(150);
        });
    });
});
