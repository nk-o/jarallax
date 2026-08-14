declare module 'video-worker' {
  export interface VideoWorkerOptions {
    autoplay?: boolean;
    loop?: boolean;
    showControls?: boolean;
    accessibilityHidden?: boolean;
    startTime?: number;
    endTime?: number;
    mute?: boolean;
    volume?: number;
    youtubeHost?: string;
    vimeoHost?: string;
  }

  export type VideoWorkerEvent = 'ready' | 'started' | 'ended' | 'error';

  export interface VideoWorkerInstance {
    type: string;
    videoID: unknown;
    videoWidth?: number;
    videoHeight?: number;

    isValid(): boolean;
    on(event: VideoWorkerEvent, callback: () => void): void;
    getVideo(callback: (video: HTMLElement) => void): void;
    getImageURL(callback: (url: string) => void): void;
    play(): void;
    pause(): void;
  }

  export default class VideoWorker implements VideoWorkerInstance {
    constructor(source: string, options?: VideoWorkerOptions);

    type: string;
    videoID: unknown;
    videoWidth?: number;
    videoHeight?: number;

    isValid(): boolean;
    on(event: VideoWorkerEvent, callback: () => void): void;
    getVideo(callback: (video: HTMLElement) => void): void;
    getImageURL(callback: (url: string) => void): void;
    play(): void;
    pause(): void;
  }
}
