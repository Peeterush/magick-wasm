/*
  Copyright Dirk Lemstra https://github.com/dlemstra/magick-wasm.
  Licensed under the Apache License, Version 2.0.
*/

import { ColorProfileData } from "./color-profile-data";
import { ColorProfileReader } from "./color-profile-reader";
import { ColorSpace } from "../../enums/color-space";
import { IImageProfile, ImageProfile } from "../image-profile";
import { MagickError } from "../../magick-error";

/**
 * Interface that describes an ICM/ICC color profile.
 */
export interface IColorProfile extends IImageProfile {
    readonly colorSpace: ColorSpace;
    readonly copyright: string | null;
    readonly description: string | null;
    readonly manufacturer: string | null;
    readonly model: string | null;
}

export class ColorProfile extends ImageProfile implements IColorProfile {
    private _data?: ColorProfileData;

    constructor(data: Uint8Array);
    constructor(name: 'icm' | 'icc', data: Uint8Array);
    constructor(nameOrData: string | Uint8Array, dataOrUndefined?: Uint8Array) {
        const name = typeof nameOrData === 'string' ? nameOrData : 'icc';
        const data = typeof nameOrData !== 'string' ? nameOrData : dataOrUndefined!;

        super(name, data);

        if (name !== 'icm' && name !== 'icc') {
            throw new MagickError(`Invalid profile name: ${name}.`);
        }
    }

    /**
     * Gets the color space of the profile.
     */
    get colorSpace(): ColorSpace {
        this.initialize();

        return this._data!.colorSpace;
    }

    /**
     * Gets the copyright of the profile.
     */
    get copyright(): string | null {
        this.initialize();

        return this._data!.copyright;
    }

    /**
     * Gets the description of the profile.
     */
    get description(): string | null {
        this.initialize();

        return this._data!.description;
    }

    /**
     * Gets the manufacturer of the profile.
     */
    get manufacturer(): string | null {
        this.initialize();

        return this._data!.manufacturer;
    }

    /**
     * Gets the model of the profile.
     */
    get model(): string | null {
        this.initialize();

        return this._data!.model;
    }

    private initialize() {
        if (!this._data) {
            this._data = ColorProfileReader.read(this.data);
        }
    }
}
