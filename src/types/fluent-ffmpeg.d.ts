declare module "fluent-ffmpeg" {
  interface FfmpegCommand {
    input(input?: string | string[]): FfmpegCommand;
    output(output: string): FfmpegCommand;
    inputOptions(options: string[]): FfmpegCommand;
    outputOptions(options: string[]): FfmpegCommand;
    videoCodec(codec: string): FfmpegCommand;
    audioCodec(codec: string): FfmpegCommand;
    on(event: "start", listener: (commandLine: string) => void): FfmpegCommand;
    on(event: "progress", listener: (progress: any) => void): FfmpegCommand;
    on(event: "end", listener: () => void): FfmpegCommand;
    on(event: "error", listener: (error: Error) => void): FfmpegCommand;
    run(): void;
  }

  interface FfmpegStatic {
    (input?: string): FfmpegCommand;
    setFfmpegPath(path: string): void;
    getAvailableFormats(callback: (err: any, formats: any) => void): void;
  }

  const ffmpeg: FfmpegStatic;
  export = ffmpeg;
}
