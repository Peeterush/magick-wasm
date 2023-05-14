// Copyright Dirk Lemstra https://github.com/dlemstra/magick-wasm.
// Licensed under the Apache License, Version 2.0.

import { IMagickImage, MagickImage } from '../src/magick-image';
import { IMagickImageCollection, MagickImageCollection } from '../src/magick-image-collection';
import * as fs from 'fs';

interface Cloneable<T> {
    clone<TReturnType>(func: (clone: T) => TReturnType): TReturnType;
    clone<TReturnType>(func: (clone: T) => Promise<TReturnType>): Promise<TReturnType>;
  }

abstract class TestImageBase<TImageType extends Cloneable<TImageType>> {
    private _image: TImageType | undefined;

    use<TReturnType>(func: (image: TImageType) => TReturnType): TReturnType;
    use<TReturnType>(func: (image: TImageType) => Promise<TReturnType>): Promise<TReturnType>;
        use<TReturnType>(func: (image: TImageType) => TReturnType | Promise<TReturnType>): TReturnType | Promise<TReturnType> {
            if (this._image === undefined)
                this._image = this.load();

            return this._image.clone(image => {
                return func(image);
            });
        }

        abstract load(): TImageType;
    }

class BuiltinTestImage extends TestImageBase<IMagickImage> {
    private readonly _name: string;

    constructor(name: string) {
        super();

        this._name = name;
    }

    load() {
        return MagickImage.create(this._name);
    }
}

class TestImage extends TestImageBase<IMagickImage> {
    readonly data: Buffer;

    constructor(fileName: string) {
        super();

        this.data = fs.readFileSync(fileName);
    }

    load() {
        return MagickImage.create(this.data);
    }
}

class TestImageCollection extends TestImageBase<IMagickImageCollection> {
    readonly data: Buffer;

    constructor(fileName: string) {
        super();

        this.data = fs.readFileSync(fileName);
    }

    load() {
        return MagickImageCollection.create(this.data);
    }
}

export class TestImages {
    static readonly cmykJpg = new TestImage('tests/images/cmyk.jpg');
    static readonly fujiFilmFinePixS1ProJpg = new TestImage('tests/images/fuji-film-fine-pix-s1-pro.jpg');
    static readonly imageMagickJpg = new TestImage('tests/images/image-magick.jpg');
    static readonly redPng = new TestImage('tests/images/red.png');
    static readonly roseSparkleGif = new TestImageCollection('tests/images/röse-sparkle.gif');

    static Builtin = class {
        static readonly logo = new BuiltinTestImage('logo:');
        static readonly wizard = new BuiltinTestImage('wizard:');
    }
}
