/* Copyright Dirk Lemstra https://github.com/dlemstra/Magick.WASM */

import { AlphaOption } from "./alpha-option";
import { Channels } from "./channels";
import { ColorSpace } from "./color-space";
import { CompositeOperator } from "./composite-operator";
import { DistortMethod } from "./distort-method";
import { DistortSettings } from "./settings/distort-settings";
import { ErrorMetric } from "./error-metric";
import { Exception } from "./exception/exception";
import { Gravity } from "./gravity";
import { ImageMagick } from "./image-magick";
import { MagickColor } from "./magick-color";
import { MagickFormat } from "./magick-format";
import { MagickGeometry } from "./magick-geometry";
import { MagickImageCollection } from "./magick-image-collection";
import { MagickReadSettings } from "./settings/magick-read-settings";
import { MagickSettings } from "./settings/magick-settings";
import { NativeInstance } from "./native-instance";
import { OrientationType } from "./orientation-type";
import { Percentage } from "./percentage";
import { PixelChannel } from "./pixel-channel";
import { PixelCollection } from "./pixels/pixel-collection";
import { Point } from "./point";
import { Pointer } from "./pointer/pointer";
import { VirtualPixelMethod } from "./virtual-pixel-method";
import { _createString, _withString } from "./native/string";
import { _withDoubleArray } from "./native/array";

export class MagickImage extends NativeInstance {
    private readonly _settings: MagickSettings;

    private constructor(instance: number, settings: MagickSettings) {
        super(instance, ImageMagick._api._MagickImage_Dispose);
        this._settings = settings;
    }

    get artifactNames(): string[] {
        const artifactNames: string[] = [];
        ImageMagick._api._MagickImage_ResetArtifactIterator(this._instance);
        let name = ImageMagick._api._MagickImage_GetNextArtifactName(this._instance);
        while (name !== 0)
        {
            artifactNames.push(ImageMagick._api.UTF8ToString(name));
            name = ImageMagick._api._MagickImage_GetNextArtifactName(this._instance);
        }

        return artifactNames;
    }

    get backgroundColor(): MagickColor { 
        const colorPtr = ImageMagick._api._MagickImage_BackgroundColor_Get(this._instance);
        return MagickColor._create(colorPtr);
    }
    set backgroundColor(value: MagickColor) {
        value._use((valuePtr) =>
        {
            ImageMagick._api._MagickImage_BackgroundColor_Set(this._instance, valuePtr);
        });
    }

    get channelCount(): number { return ImageMagick._api._MagickImage_ChannelCount_Get(this._instance); }

    get colorSpace(): ColorSpace {
        return Exception.usePointer((exception) => {
            return ImageMagick._api._MagickImage_ColorSpace_Get(this._instance, exception);
        });
    }
    set colorSpace(value: ColorSpace) {
        Exception.usePointer((exception) => {
            ImageMagick._api._MagickImage_ColorSpace_Set(this._instance, value, exception);
        });
    }

    get depth(): number { return ImageMagick._api._MagickImage_Depth_Get(this._instance); }
    set depth(value: number) { ImageMagick._api._MagickImage_Depth_Set(this._instance, value); }

    get format(): string { return _createString(ImageMagick._api._MagickImage_Format_Get(this._instance), ''); }
    set format(value: string) { _withString(value, (instance) => ImageMagick._api._MagickImage_Format_Set(this._instance, instance)); }

    get hasAlpha(): boolean {
        return Exception.usePointer((exception) => {
            return this.toBool(ImageMagick._api._MagickImage_HasAlpha_Get(this._instance, exception));
        });
    }
    set hasAlpha(value: boolean) {
        Exception.usePointer((exception) => {
            if (value)
                this.alpha(AlphaOption.Opaque);

            ImageMagick._api._MagickImage_HasAlpha_Set(this._instance, this.fromBool(value), exception);
        });
    }

    get height(): number { return ImageMagick._api._MagickImage_Height_Get(this._instance); }

    get orientation(): OrientationType { return ImageMagick._api._MagickImage_Orientation_Get(this._instance); }
    set orientation(value: OrientationType) { ImageMagick._api._MagickImage_Orientation_Set(this._instance, value); }

    get virtualPixelMethod(): VirtualPixelMethod { 
        return Exception.usePointer((exception) => {
            return ImageMagick._api._MagickImage_VirtualPixelMethod_Get(this._instance, exception);
        });
    }
    set virtualPixelMethod(value: VirtualPixelMethod)  { 
        Exception.usePointer((exception) => {
            ImageMagick._api._MagickImage_VirtualPixelMethod_Set(this._instance, value, exception);
        });
    }

    get width(): number { return ImageMagick._api._MagickImage_Width_Get(this._instance); }

    alpha(value: AlphaOption): void {
        Exception.usePointer((exception) => {
            ImageMagick._api._MagickImage_SetAlpha(this._instance, value, exception);
        });
    }

    autoOrient(): void {
        Exception.use((exception) => {
            const instance = ImageMagick._api._MagickImage_AutoOrient(this._instance, exception.ptr);
            this._setInstance(instance, exception);
        });
    }

    blur(): void;
    blur(channels: Channels): void;
    blur(radius: number, sigma: number): void;
    blur(radius: number, sigma: number, channels: Channels): void;
    blur(radiusOrChannel?: number | Channels, sigma?: number, channels?: Channels): void {
        let radius = 0;
        const sigmaValue = this.valueOrDefault(sigma, 1);
        let channelsValue = this.valueOrDefault(channels, Channels.Composite);

        if (typeof radiusOrChannel === 'number')
            radius = radiusOrChannel;
        else if (radiusOrChannel !== undefined)
            channelsValue = radiusOrChannel;

        Exception.use((exception) => {
            const instance = ImageMagick._api._MagickImage_Blur(this._instance, radius, sigmaValue, channelsValue, exception.ptr);
            this._setInstance(instance, exception);
        });
    }

    channelOffset(pixelChannel: PixelChannel): number {
        if (!ImageMagick._api._MagickImage_HasChannel(this._instance, pixelChannel))
            return -1;

        return ImageMagick._api._MagickImage_ChannelOffset(this._instance, pixelChannel);
    }

    clone(func: (image: MagickImage) => void): void;
    clone(func: (image: MagickImage) => Promise<void>): Promise<void>;
    clone(func: (image: MagickImage) => void | Promise<void>): void | Promise<void> {
        Exception.usePointer((exception) => {
            const image = new MagickImage(ImageMagick._api._MagickImage_Clone(this._instance, exception), this._settings._clone());
            try {
                return func(image);
            } finally {
                image.dispose();
            }
        });
    }

    colorAlpha(color: MagickColor): void {
        if (!this.hasAlpha)
            return;

        const canvas = MagickImage.create();
        canvas.read(color, this.width, this.height);
        canvas.composite(this, CompositeOperator.SrcOver, new Point(0, 0));
        this._instance = canvas._instance;
    }

    compare(image: MagickImage, metric: ErrorMetric): number;
    compare(image: MagickImage, metric: ErrorMetric, channels: Channels): number;
    compare(image: MagickImage, metric: ErrorMetric, channels?: Channels): number {
        return Exception.usePointer((exception) => {
            const compareChannels = channels !== undefined ? channels : Channels.Composite;
            return ImageMagick._api._MagickImage_CompareDistortion(this._instance, image._instance, metric, compareChannels, exception);
        });
    }

    composite(image: MagickImage): void;
    composite(image: MagickImage, compose: CompositeOperator): void;
    composite(image: MagickImage, compose: CompositeOperator, channels: Channels): void;
    composite(image: MagickImage, compose: CompositeOperator, args: string): void;
    composite(image: MagickImage, compose: CompositeOperator, args: string, channels: Channels): void;
    composite(image: MagickImage, point: Point): void;
    composite(image: MagickImage, point: Point, channels: Channels): void;
    composite(image: MagickImage, compose: CompositeOperator, point: Point): void;
    composite(image: MagickImage, compose: CompositeOperator, point: Point, channels: Channels): void;
    composite(image: MagickImage, compose: CompositeOperator, point: Point, args: string): void;
    composite(image: MagickImage, compose: CompositeOperator, point: Point, args: string, channels: Channels): void;
    composite(image: MagickImage, composeOrPoint?: CompositeOperator | Point, pointOrArgsOrChannels?: Point | string | Channels, channelsOrArgs?:  Channels | string, channels?: Channels): void {
        let x = 0;
        let y = 0;
        let compose = CompositeOperator.In;
        let compositeChannels = Channels.Default;
        let args: string | null = null;

        if (composeOrPoint instanceof Point) {
            x = composeOrPoint.x;
            y = composeOrPoint.y;
        } else if (composeOrPoint !== undefined) {
            compose = composeOrPoint;
        }

        if (pointOrArgsOrChannels instanceof Point) {
            x = pointOrArgsOrChannels.x;
            y = pointOrArgsOrChannels.y;
        } else if (typeof pointOrArgsOrChannels === 'string') {
            args = pointOrArgsOrChannels;
        } else if (pointOrArgsOrChannels !== undefined) {
            compositeChannels = pointOrArgsOrChannels;
        }

        if (typeof channelsOrArgs === 'string')
            args = channelsOrArgs;
        else if (channelsOrArgs !== undefined)
            compositeChannels = channelsOrArgs;

        if (channels !== undefined)
            compositeChannels = channels;

        if (args !== null)
            this.setArtifact('compose:args', args);

        Exception.usePointer((exception) => {
            ImageMagick._api._MagickImage_Composite(this._instance, image._instance, x, y, compose, compositeChannels, exception);
        });

        if (args !== null)
            this.removeArtifact('compose:args');
    }

    compositeGravity(image: MagickImage, gravity: Gravity): void;
    compositeGravity(image: MagickImage, gravity: Gravity, compose: CompositeOperator): void;
    compositeGravity(image: MagickImage, gravity: Gravity, compose: CompositeOperator, channels: Channels): void;
    compositeGravity(image: MagickImage, gravity: Gravity, compose: CompositeOperator, args: string): void;
    compositeGravity(image: MagickImage, gravity: Gravity, compose: CompositeOperator, args: string, channels: Channels): void;
    compositeGravity(image: MagickImage, gravity: Gravity, point: Point): void;
    compositeGravity(image: MagickImage, gravity: Gravity, point: Point, channels: Channels): void;
    compositeGravity(image: MagickImage, gravity: Gravity, compose: CompositeOperator, point: Point): void;
    compositeGravity(image: MagickImage, gravity: Gravity, compose: CompositeOperator, point: Point, channels: Channels): void;
    compositeGravity(image: MagickImage, gravity: Gravity, compose: CompositeOperator, point: Point, args: string): void;
    compositeGravity(image: MagickImage, gravity: Gravity, compose: CompositeOperator, point: Point, args: string, channels: Channels): void;
    compositeGravity(image: MagickImage, gravity: Gravity, composeOrPoint?: CompositeOperator | Point, pointOrArgsOrChannels?: Point | string | Channels, channelsOrArgs?:  Channels | string, channels?: Channels): void {
        let x = 0;
        let y = 0;
        let compose = CompositeOperator.In;
        let compositeChannels = Channels.Default;
        let args: string | null = null;

        if (composeOrPoint instanceof Point) {
            x = composeOrPoint.x;
            y = composeOrPoint.y;
        } else if (composeOrPoint !== undefined) {
            compose = composeOrPoint;
        }

        if (pointOrArgsOrChannels instanceof Point) {
            x = pointOrArgsOrChannels.x;
            y = pointOrArgsOrChannels.y;
        } else if (typeof pointOrArgsOrChannels === 'string') {
            args = pointOrArgsOrChannels;
        } else if (pointOrArgsOrChannels !== undefined) {
            compositeChannels = pointOrArgsOrChannels;
        }

        if (typeof channelsOrArgs === 'string')
            args = channelsOrArgs;
        else if (channelsOrArgs !== undefined)
            compositeChannels = channelsOrArgs;

        if (channels !== undefined)
            compositeChannels = channels;

        if (args !== null)
            this.setArtifact('compose:args', args);

        Exception.usePointer((exception) => {
            ImageMagick._api._MagickImage_CompositeGravity(this._instance, image._instance, gravity, x, y, compose, compositeChannels, exception);
        });

        if (args !== null)
            this.removeArtifact('compose:args');
    }

    static create(): MagickImage {
        return new MagickImage(MagickImage.createInstance(), new MagickSettings());
    }

    deskew(threshold: Percentage): number {
        Exception.use((exception) => {
            const instance = ImageMagick._api._MagickImage_Deskew(this._instance, threshold.toQuantum(), exception.ptr);
            this._setInstance(instance, exception);
        });

        const angle = Number(this.getArtifact('deskew:angle'));
        return isNaN(angle) ? 0.0 : angle;
    }

    distort(method: DistortMethod, params: number[]): void;
    distort(method: DistortMethod, settings: DistortSettings, params: number[]): void;
    distort(method: DistortMethod, settingsOrParams: number[] | DistortSettings, params?: number[]): void {
        let distortArgs: number[];
        let bestFit = 0;
        let settings: DistortSettings | null = null;
        if (settingsOrParams instanceof Array) {
            distortArgs = settingsOrParams;
        } else if (params instanceof Array) {
            distortArgs = params;
            settings = <DistortSettings>settingsOrParams;
            bestFit = settings.bestFit ? 1 : 0;

            settings._setArtifacts(this);
        } else {
            distortArgs = [];
        }

        Exception.use((exception) => {
            _withDoubleArray(distortArgs, (distortArgsPtr: number) => {
                const instance = ImageMagick._api._MagickImage_Distort(this._instance, method, bestFit, distortArgsPtr, distortArgs.length, exception.ptr);
                this._setInstance(instance, exception)
            });
        });

        if (settings !== null)
            settings._removeArtifacts(this);
    }

    drawOnCanvas(canvas: HTMLCanvasElement): void {
        canvas.width = this.width;
        canvas.height = this.height;

        const ctx = canvas.getContext('2d');
        if (ctx === null)
            return;

        PixelCollection._map(this, 'RGBA', (q: number) => {
            const imageData = ctx.createImageData(this.width, this.height);

            let p = 0;
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    imageData.data[p++] = q++;
                    imageData.data[p++] = q++;
                    imageData.data[p++] = q++;
                    imageData.data[p++] = q++;
                }
            }

            ctx.putImageData(imageData, 0, 0);
        });
    }

    extent(width: number, height: number): void;
    extent(width: number, height: number, gravity: Gravity): void;
    extent(width: number, height: number, backgroundColor: MagickColor): void;
    extent(geometry: MagickGeometry): void;
    extent(geometry: MagickGeometry, gravity: Gravity): void;
    extent(geometry: MagickGeometry, gravity: Gravity, backgroundColor: MagickColor): void;
    extent(geometry: MagickGeometry, backgroundColor: MagickColor): void;
    extent(geometryOrWidth: MagickGeometry | number, widthOrGravityOrBackgroundColor?: Gravity | MagickColor | number, backgroundColorOrGravity?: MagickColor | Gravity): void {
        let gravity = Gravity.Undefined;
        let geometry: MagickGeometry;

        if (geometryOrWidth instanceof MagickGeometry)
            geometry = geometryOrWidth;
        else if (typeof widthOrGravityOrBackgroundColor === 'number')
            geometry = new MagickGeometry(geometryOrWidth, widthOrGravityOrBackgroundColor);

        if (widthOrGravityOrBackgroundColor instanceof MagickColor)
            this.backgroundColor = widthOrGravityOrBackgroundColor;
        else if (widthOrGravityOrBackgroundColor !== undefined)
            gravity = widthOrGravityOrBackgroundColor;

        if (backgroundColorOrGravity instanceof MagickColor)
            this.backgroundColor = backgroundColorOrGravity;
        else if (backgroundColorOrGravity !== undefined)
            gravity = backgroundColorOrGravity;

        Exception.use((exception) => {
            _withString(geometry.toString(), (geometryPtr) => {
                const instance = ImageMagick._api._MagickImage_Extent(this._instance, geometryPtr, gravity, exception.ptr);
                this._setInstance(instance, exception);
            });
        });
    }

    getArtifact(name: string): string | null {
        return _withString(name, (namePtr) => {
            const value = ImageMagick._api._MagickImage_GetArtifact(this._instance, namePtr);
            return _createString(value);
        });
    }

    pixels<TReturnType>(func: (pixels: PixelCollection) => TReturnType): TReturnType {
        return PixelCollection._use(this, (pixels) => {
            return func(pixels);
        });
    }

    read(color: MagickColor, width: number, height: number): void;
    read(fileName: string, settings?: MagickReadSettings): void;
    read(array: Uint8Array, settings?: MagickReadSettings): void;
    read(fileNameOrArrayOrColor: string | Uint8Array | MagickColor, settingsOrWidth?: MagickReadSettings | number, height?: number): void {
        Exception.use((exception) => {
            if (fileNameOrArrayOrColor instanceof Uint8Array) {
                const readSettings = settingsOrWidth instanceof MagickReadSettings  ? settingsOrWidth : MagickReadSettings._createFrom(this._settings);
                readSettings._use((settings) => {
                    const length = fileNameOrArrayOrColor.byteLength;
                    let data = 0;
                    try {
                        data = ImageMagick._api._malloc(length);
                        ImageMagick._api.HEAPU8.set(fileNameOrArrayOrColor, data);
                        const instance = ImageMagick._api._MagickImage_ReadBlob(settings._instance, data, 0, length, exception.ptr);
                        this._setInstance(instance, exception);
                    } finally {
                        if (data !== 0)
                            ImageMagick._api._free(data);
                    }
                });
            } else {
                const readSettings = settingsOrWidth instanceof MagickReadSettings ? settingsOrWidth : MagickReadSettings._createFrom(this._settings);
                if (typeof fileNameOrArrayOrColor === 'string') {
                    readSettings._fileName = fileNameOrArrayOrColor;
                } else if (fileNameOrArrayOrColor instanceof MagickColor) {
                    readSettings._fileName = 'xc:' + fileNameOrArrayOrColor.toShortString();
                    readSettings.width = typeof(settingsOrWidth) === 'number' ? settingsOrWidth : 0;
                    readSettings.height = typeof(height) === 'number' ? height : 0;
                } 
                readSettings._use((settings) => {
                    const instance = ImageMagick._api._MagickImage_ReadFile(settings._instance, exception.ptr);
                    this._setInstance(instance, exception);
                });
            }
        });
    }

    removeArtifact(name: string): void {
        _withString(name, (namePtr) => {
            ImageMagick._api._MagickImage_RemoveArtifact(this._instance, namePtr);
        });
    }

    resize(geometry: MagickGeometry): void;
    resize(width: number, height: number): void;
    resize(widthOrGeometry: number | MagickGeometry, height?: number): void {
        const geometry = typeof widthOrGeometry === 'number' ? new MagickGeometry(widthOrGeometry, height as number) : widthOrGeometry;
        Exception.use((exception) => {
            _withString(geometry.toString(), (geometryPtr) => {
                const image = ImageMagick._api._MagickImage_Resize(this._instance, geometryPtr, exception.ptr);
                this._setInstance(image, exception);
            });
        });
    }

    separate(func: (images: MagickImageCollection) => void): void;
    separate(func: (images: MagickImageCollection) => Promise<void>): Promise<void>;
    separate(func: (images: MagickImageCollection) => void, channels: Channels): void;
    separate(func: (images: MagickImageCollection) => Promise<void>, channels: Channels): Promise<void>;
    separate(func: (images: MagickImageCollection) => void | Promise<void>, channels?: Channels): void | Promise<void> {
        return Exception.use((exception) => {
            const images = ImageMagick._api._MagickImage_Separate(this._instance, channels ?? Channels.All, exception.ptr);
            const collection = MagickImageCollection._createFromImages(images, this._settings._clone());
            return collection._use(func);
        });
    }

    setArtifact(name: string, value: string): void;
    setArtifact(name: string, value: boolean): void;
    setArtifact(name: string, value: string | boolean): void {
        let strValue: string;
        if (typeof value === 'string') {
            strValue = value;
        } else {
            strValue = this.fromBool(value).toString();
        }
        _withString(name, (namePtr) => {
            _withString(strValue, (valuePtr) => {
                ImageMagick._api._MagickImage_SetArtifact(this._instance, namePtr, valuePtr);
            });
        });
    }

    toString = (): string => `${this.format} ${this.width}x${this.height} ${this.depth}-bit ${ColorSpace[this.colorSpace]}`

    write(func: (data: Uint8Array) => void, format?: MagickFormat): void;
    write(func: (data: Uint8Array) => Promise<void>, format?: MagickFormat): Promise<void>;
    write(func: (data: Uint8Array) => void | Promise<void>, format?: MagickFormat): void | Promise<void> {
        let bytes = new Uint8Array();

        Exception.use((exception) => {
            Pointer.use((pointer) => {
                if (format !== undefined)
                    this._settings.format = format;

                this._settings._use((settings) => {
                    let data = 0;
                    try {
                        data = ImageMagick._api._MagickImage_WriteBlob(this._instance, settings._instance, pointer.ptr, exception.ptr);
                        bytes = ImageMagick._api.HEAPU8.subarray(data, data + pointer.value);
                    } catch {
                        if (data !== 0)
                            ImageMagick._api._MagickMemory_Relinquish(data);
                    }
                });
            });
        });

        return func(bytes);
    }

    /** @internal */
    static _createFromImage(instance: number, settings: MagickSettings): MagickImage {
        return new MagickImage(instance, settings);
    }

    /** @internal */
    protected _instanceNotInitialized(): void {
        throw new Error('no image has been read');
    }

    /** @internal */
    static _use<TReturnType>(func: (image: MagickImage) => TReturnType): TReturnType;
    static _use<TReturnType>(func: (image: MagickImage) => Promise<TReturnType>): Promise<TReturnType>;
    static _use<TReturnType>(func: (image: MagickImage) => TReturnType | Promise<TReturnType>): TReturnType | Promise<TReturnType> {
        const image = MagickImage.create();
        try {
            return func(image);
        } finally {
            image.dispose();
        }
    }

    private static createInstance(): number
    {
        return Exception.usePointer((exception) => {
            return ImageMagick._api._MagickImage_Create(0, exception);
        });
    }

    private fromBool(value: boolean): number {
        return value ? 1 : 0;
    }

    private toBool(value: number): boolean {
        return value === 1;
    }

    private valueOrDefault<TType>(value: TType | undefined, defaultValue: TType): TType {
        if (value === undefined)
            return defaultValue;

        return value;
    }
}
