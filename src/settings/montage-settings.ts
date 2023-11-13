// Copyright Dirk Lemstra https://github.com/dlemstra/magick-wasm.
// Licensed under the Apache License, Version 2.0.

import { Disposable } from '../internal/disposable';
import { Gravity } from '../gravity';
import { MagickColor } from '../magick-color';
import { MagickGeometry } from '../magick-geometry';
import { NativeMontageSettings } from './native-montage-settings';

/**
 * Class that contains setting for the montage operation.
 */
export class MontageSettings {
    /**
     * Gets or sets the color of the background that thumbnails are composed on.
     */
    backgroundColor?: MagickColor;

    /**
     * Gets or sets the frame border color.
     */
    borderColor?: MagickColor;

    /**
     * Gets or sets the pixels between thumbnail and surrounding frame.
     */
    borderWidth?: number;

    /**
     * Gets or sets the fill color.
     */
    fillColor?: MagickColor;

    /**
     * Gets or sets the label font.
     */
    font?: string;

    /**
     * Gets or sets the font point size.
     */
    fontPointsize?: number;

    /**
     * Gets or sets the frame geometry (width & height frame thickness).
     */
    frameGeometry?: MagickGeometry;

    /**
     * Gets or sets the thumbnail width & height plus border width &amp; height.
     */
    geometry?: MagickGeometry;

    /**
     * Gets or sets the thumbnail position (e.g. Southwest).
     */
    gravity?: Gravity;

    /**
     * Gets or sets the thumbnail label (applied to image prior to montage).
     */
    label?: string;

    /**
     * Gets or sets a value indicating whether drop-shadows on thumbnails are enabled or disabled.
     */
    shadow?: boolean;

    /**
     * Gets or sets the outline color.
     */
    strokeColor?: MagickColor;

    /**
     * Gets or sets the background texture image.
     */
    textureFileName?: string;

    /**
     * Gets or sets the frame geometry (width &amp; height frame thickness).
     */
    tileGeometry?: MagickGeometry;

    /**
     * Gets or sets the montage title.
     */
    title?: string;

    /**
     * Gets or sets the transparent color.
     */
    transparentColor?: MagickColor;

    /** @internal */
    _use<TReturnType>(func: (settings: NativeMontageSettings) => TReturnType): TReturnType

    /** @internal */
    _use<TReturnType>(func: (settings: NativeMontageSettings) => Promise<TReturnType>): Promise<TReturnType>
    _use<TReturnType>(func: (settings: NativeMontageSettings) => TReturnType | Promise<TReturnType>): TReturnType | Promise<TReturnType> {
        const settings = new NativeMontageSettings(this);
        return Disposable._disposeAfterExecution(settings, func);
    }
}
