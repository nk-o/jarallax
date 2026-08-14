import type { VideoWorkerInstance } from 'video-worker';
export interface JarallaxOnScrollCalculations {
    section: DOMRect;
    beforeTop: number;
    beforeTopEnd: number;
    afterTop: number;
    beforeBottom: number;
    beforeBottomEnd: number;
    afterBottom: number;
    visiblePercent: number;
    fromViewportCenter: number;
}
export interface JarallaxCoverImageData {
    image: {
        height: number;
        marginTop: number;
    };
    container: DOMRect;
}
export interface JarallaxWindowData {
    width: number;
    height: number;
    y: number;
}
export type DisableOption = boolean | RegExp | string | (() => boolean);
export type JarallaxMethodName = 'destroy' | 'onResize' | 'onScroll' | 'isVisible' | 'coverImage';
export type JarallaxVoidMethodName = 'destroy' | 'onResize' | 'onScroll';
export type JarallaxItem = HTMLElement & {
    jarallax?: JarallaxInstance;
};
export type JarallaxItems = JarallaxItem | ArrayLike<JarallaxItem>;
export interface JarallaxOptions {
    type?: string;
    speed?: number | string;
    containerClass?: string;
    imgSrc?: string | null;
    imgElement?: string | Element | null;
    imgSize?: string;
    imgPosition?: string;
    imgRepeat?: string;
    keepImg?: boolean;
    elementInViewport?: Element | ArrayLike<Element> | null;
    zIndex?: number | string;
    disableParallax?: DisableOption;
    onScroll?: ((this: JarallaxInstance, calculations: JarallaxOnScrollCalculations) => void) | null;
    onInit?: ((this: JarallaxInstance) => void) | null;
    onDestroy?: ((this: JarallaxInstance) => void) | null;
    onCoverImage?: ((this: JarallaxInstance) => void) | null;
    videoClass?: string;
    videoSrc?: string | null;
    videoStartTime?: number | string;
    videoEndTime?: number | string;
    videoVolume?: number | string;
    videoYoutubeHost?: string;
    videoVimeoHost?: string;
    videoLoop?: boolean;
    videoPlayOnlyVisible?: boolean;
    videoLazyLoading?: boolean;
    disableVideo?: DisableOption;
    onVideoInsert?: ((this: JarallaxInstance) => void) | null;
    onVideoWorkerInit?: ((this: JarallaxInstance, video: VideoWorkerInstance) => void) | null;
    speedY?: number;
    speedX?: number;
    thresholdY?: number | null;
    thresholdX?: number | null;
    threshold?: string;
}
export interface JarallaxResolvedOptions extends Omit<JarallaxOptions, 'disableParallax' | 'disableVideo'> {
    type: string;
    speed: number;
    containerClass: string;
    imgSrc: string | null;
    imgElement: string | Element | null;
    imgSize: string;
    imgPosition: string;
    imgRepeat: string;
    keepImg: boolean;
    elementInViewport: Element | null;
    zIndex: number | string;
    disableParallax: () => boolean;
    onScroll: ((this: JarallaxInstance, calculations: JarallaxOnScrollCalculations) => void) | null;
    onInit: ((this: JarallaxInstance) => void) | null;
    onDestroy: ((this: JarallaxInstance) => void) | null;
    onCoverImage: ((this: JarallaxInstance) => void) | null;
    videoClass: string;
    videoSrc: string | null;
    videoStartTime: number | string;
    videoEndTime: number | string;
    videoVolume: number | string;
    videoYoutubeHost: string;
    videoVimeoHost: string;
    videoLoop: boolean;
    videoPlayOnlyVisible: boolean;
    videoLazyLoading: boolean;
    disableVideo: () => boolean;
    onVideoInsert: ((this: JarallaxInstance) => void) | null;
    onVideoWorkerInit: ((this: JarallaxInstance, video: VideoWorkerInstance) => void) | null;
    speedY?: number;
    speedX?: number;
    thresholdY?: number | null;
    thresholdX?: number | null;
    threshold?: string;
}
export interface JarallaxImageData {
    src: string | null;
    bgImage?: string;
    $item?: HTMLElement;
    $container: HTMLElement | null;
    $itemParent?: ParentNode | null;
    $default_item?: HTMLElement;
    useImgTag: boolean;
    position: 'fixed' | 'absolute';
    width?: number;
    height?: number;
}
export interface JarallaxInstance {
    [key: string]: unknown;
    instanceID: number;
    $item: JarallaxItem;
    defaults: JarallaxResolvedOptions;
    options: JarallaxResolvedOptions;
    pureOptions: Record<string, unknown>;
    image: JarallaxImageData;
    parallaxScrollDistance: number;
    isElementInViewport?: boolean;
    isVideoInserted?: boolean;
    video?: VideoWorkerInstance;
    $video?: HTMLIFrameElement | HTMLVideoElement;
    videoError?: boolean;
    videoEnded?: boolean;
    defaultInitImgResult?: boolean;
    itemData?: {
        width: number;
        height: number;
        y: number;
        x: number;
    };
    css(el: HTMLElement, styles: string): string;
    css(el: HTMLElement, styles: Record<string, string | number>): HTMLElement;
    extend<T extends Record<string, unknown>>(out: T, ...args: Array<Record<string, unknown> | null | undefined>): T;
    getWindowData(): JarallaxWindowData;
    initImg(): boolean;
    canInitParallax(): boolean;
    init(): boolean | void;
    destroy(): void;
    coverImage(): JarallaxCoverImageData | true | void;
    isVisible(): boolean;
    onScroll(force?: boolean): void;
    onResize(): void;
}
export interface JarallaxConstructor {
    new (item: JarallaxItem, userOptions?: JarallaxOptions): JarallaxInstance;
    prototype: JarallaxInstance;
}
export interface JarallaxStatic {
    (items: JarallaxItems, options?: JarallaxOptions): JarallaxItems;
    (items: JarallaxItems, methodName: JarallaxVoidMethodName): void;
    (items: JarallaxItems, methodName: 'isVisible'): boolean | undefined;
    (items: JarallaxItems, methodName: 'coverImage'): JarallaxCoverImageData | true | void;
    constructor: JarallaxConstructor;
}
export type GlobalLike = typeof globalThis & {
    jarallax?: JarallaxStatic;
    jQuery?: {
        fn: Record<string, unknown>;
    };
    VideoWorker?: unknown;
};
//# sourceMappingURL=types.d.ts.map