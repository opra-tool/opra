// definitions taken from @types/audioworklet and adjusted

declare class AudioWorkletProcessor {
  readonly port: MessagePort;
}

interface AudioWorkletProcessorImpl extends AudioWorkletProcessor {
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean;
}

interface AudioWorkletProcessorConstructor {
  new (options: any): AudioWorkletProcessorImpl;
}

declare function registerProcessor(
  name: string,
  processorCtor: AudioWorkletProcessorConstructor
): void;
