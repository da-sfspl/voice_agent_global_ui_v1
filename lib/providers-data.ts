// ── Types ──────────────────────────────────────────────────────────────────

export type ProviderStatus = 'active' | 'inactive' | 'error'
export type TestState = 'idle' | 'testing' | 'success' | 'error'

export interface LLMProvider {
  id: string
  name: string
  logo: string          // emoji stand-in
  model: string
  temperature: number
  maxTokens: number
  topP: number
  systemPrompt: string
  streaming: boolean
  toolCalling: boolean
  contextWindow: number
  priority: number
  apiKey: string
  status: ProviderStatus
  latencyMs: number
  costPer1kTokens: number
}

export interface STTProvider {
  id: string
  name: string
  logo: string
  model: string
  language: string
  sampleRate: number
  encoding: string
  smartFormatting: boolean
  punctuation: boolean
  diarization: boolean
  interimResults: boolean
  endpointingMs: number
  priority: number
  apiKey: string
  status: ProviderStatus
  latencyMs: number
  costPerMinute: number
}

export interface TTSProvider {
  id: string
  name: string
  logo: string
  model: string
  voice: string
  voiceId: string
  language: string
  speed: number
  pitch: number
  volume: number
  emotion: string
  streaming: boolean
  sampleRate: number
  audioFormat: string
  priority: number
  apiKey: string
  status: ProviderStatus
  latencyMs: number
  costPer1kChars: number
}

export interface RoutingChain {
  primary: string
  fallback: string
  secondaryFallback: string
  strategy: 'priority' | 'failover' | 'round-robin'
  timeoutMs: number
  retryCount: number
  failureConditions: string[]
}

export interface RoutingConfig {
  llm: RoutingChain
  stt: RoutingChain
  tts: RoutingChain
}

// ── LLM Providers ─────────────────────────────────────────────────────────

export const llmProviders: LLMProvider[] = [
  {
    id: 'llm-001',
    name: 'OpenAI',
    logo: '🟢',
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 1024,
    topP: 1.0,
    systemPrompt: 'You are a helpful voice AI assistant. Be concise and conversational.',
    streaming: true,
    toolCalling: true,
    contextWindow: 128000,
    priority: 1,
    apiKey: 'sk-••••••••••••••••••••••••••••••••',
    status: 'active',
    latencyMs: 320,
    costPer1kTokens: 0.005,
  },
  {
    id: 'llm-002',
    name: 'Anthropic',
    logo: '🟤',
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.6,
    maxTokens: 2048,
    topP: 0.95,
    systemPrompt: 'You are a helpful voice AI assistant. Keep responses brief and natural.',
    streaming: true,
    toolCalling: true,
    contextWindow: 200000,
    priority: 2,
    apiKey: 'sk-ant-••••••••••••••••••••••••••••',
    status: 'active',
    latencyMs: 410,
    costPer1kTokens: 0.003,
  },
  {
    id: 'llm-003',
    name: 'Google Gemini',
    logo: '🔵',
    model: 'gemini-1.5-pro',
    temperature: 0.7,
    maxTokens: 1024,
    topP: 0.9,
    systemPrompt: 'You are a helpful voice AI assistant.',
    streaming: true,
    toolCalling: true,
    contextWindow: 1000000,
    priority: 3,
    apiKey: 'AIza••••••••••••••••••••••••••••••',
    status: 'active',
    latencyMs: 480,
    costPer1kTokens: 0.0035,
  },
  {
    id: 'llm-004',
    name: 'Mistral AI',
    logo: '🟠',
    model: 'mistral-large-latest',
    temperature: 0.7,
    maxTokens: 1024,
    topP: 1.0,
    systemPrompt: 'You are a helpful voice AI assistant.',
    streaming: true,
    toolCalling: false,
    contextWindow: 32000,
    priority: 4,
    apiKey: '••••••••••••••••••••••••••••••••',
    status: 'inactive',
    latencyMs: 290,
    costPer1kTokens: 0.002,
  },
  {
    id: 'llm-005',
    name: 'Qwen',
    logo: '🟣',
    model: 'qwen-max',
    temperature: 0.7,
    maxTokens: 1024,
    topP: 0.9,
    systemPrompt: 'You are a helpful voice AI assistant.',
    streaming: false,
    toolCalling: false,
    contextWindow: 32000,
    priority: 5,
    apiKey: '••••••••••••••••••••••••••••••••',
    status: 'inactive',
    latencyMs: 520,
    costPer1kTokens: 0.0015,
  },
]

// ── STT Providers ─────────────────────────────────────────────────────────

export const sttProviders: STTProvider[] = [
  {
    id: 'stt-001',
    name: 'Deepgram',
    logo: '🎙️',
    model: 'nova-2',
    language: 'en-US',
    sampleRate: 16000,
    encoding: 'linear16',
    smartFormatting: true,
    punctuation: true,
    diarization: false,
    interimResults: true,
    endpointingMs: 300,
    priority: 1,
    apiKey: '••••••••••••••••••••••••••••••••',
    status: 'active',
    latencyMs: 180,
    costPerMinute: 0.0059,
  },
  {
    id: 'stt-002',
    name: 'Google Cloud STT',
    logo: '🔵',
    model: 'latest_long',
    language: 'en-US',
    sampleRate: 16000,
    encoding: 'LINEAR16',
    smartFormatting: true,
    punctuation: true,
    diarization: true,
    interimResults: true,
    endpointingMs: 500,
    priority: 2,
    apiKey: '••••••••••••••••••••••••••••••••',
    status: 'active',
    latencyMs: 240,
    costPerMinute: 0.016,
  },
  {
    id: 'stt-003',
    name: 'Azure Speech',
    logo: '🔷',
    model: 'whisper',
    language: 'en-US',
    sampleRate: 16000,
    encoding: 'pcm',
    smartFormatting: true,
    punctuation: true,
    diarization: true,
    interimResults: true,
    endpointingMs: 400,
    priority: 3,
    apiKey: '••••••••••••••••••••••••••••••••',
    status: 'inactive',
    latencyMs: 310,
    costPerMinute: 0.01,
  },
  {
    id: 'stt-004',
    name: 'AssemblyAI',
    logo: '🟡',
    model: 'best',
    language: 'en',
    sampleRate: 16000,
    encoding: 'pcm_s16le',
    smartFormatting: true,
    punctuation: true,
    diarization: true,
    interimResults: false,
    endpointingMs: 700,
    priority: 4,
    apiKey: '••••••••••••••••••••••••••••••••',
    status: 'inactive',
    latencyMs: 420,
    costPerMinute: 0.0065,
  },
  {
    id: 'stt-005',
    name: 'Sarvam AI',
    logo: '🇮🇳',
    model: 'saarika:v2',
    language: 'hi-IN',
    sampleRate: 16000,
    encoding: 'linear16',
    smartFormatting: false,
    punctuation: true,
    diarization: false,
    interimResults: true,
    endpointingMs: 400,
    priority: 5,
    apiKey: '••••••••••••••••••••••••••••••••',
    status: 'inactive',
    latencyMs: 350,
    costPerMinute: 0.003,
  },
]

// ── TTS Providers ─────────────────────────────────────────────────────────

export const ttsProviders: TTSProvider[] = [
  {
    id: 'tts-001',
    name: 'Cartesia',
    logo: '🔊',
    model: 'sonic-english',
    voice: 'Friendly Assistant',
    voiceId: 'a0e99841-438c-4a64-b679-ae501e7d6091',
    language: 'en',
    speed: 1.0,
    pitch: 0,
    volume: 1.0,
    emotion: 'neutral',
    streaming: true,
    sampleRate: 22050,
    audioFormat: 'pcm_f32le',
    priority: 1,
    apiKey: '••••••••••••••••••••••••••••••••',
    status: 'active',
    latencyMs: 90,
    costPer1kChars: 0.065,
  },
  {
    id: 'tts-002',
    name: 'ElevenLabs',
    logo: '🎵',
    model: 'eleven_turbo_v2_5',
    voice: 'Rachel',
    voiceId: '21m00Tcm4TlvDq8ikWAM',
    language: 'en',
    speed: 1.0,
    pitch: 0,
    volume: 1.0,
    emotion: 'neutral',
    streaming: true,
    sampleRate: 22050,
    audioFormat: 'mp3_44100_128',
    priority: 2,
    apiKey: 'sk_••••••••••••••••••••••••••••••',
    status: 'active',
    latencyMs: 140,
    costPer1kChars: 0.18,
  },
  {
    id: 'tts-003',
    name: 'Google Cloud TTS',
    logo: '🔵',
    model: 'en-US-Journey-F',
    voice: 'Journey Female',
    voiceId: 'en-US-Journey-F',
    language: 'en-US',
    speed: 1.0,
    pitch: 0,
    volume: 0,
    emotion: 'neutral',
    streaming: false,
    sampleRate: 24000,
    audioFormat: 'LINEAR16',
    priority: 3,
    apiKey: '••••••••••••••••••••••••••••••••',
    status: 'inactive',
    latencyMs: 210,
    costPer1kChars: 0.016,
  },
  {
    id: 'tts-004',
    name: 'Azure Speech',
    logo: '🔷',
    model: 'neural',
    voice: 'Aria',
    voiceId: 'en-US-AriaNeural',
    language: 'en-US',
    speed: 1.0,
    pitch: 0,
    volume: 100,
    emotion: 'cheerful',
    streaming: true,
    sampleRate: 16000,
    audioFormat: 'riff-16khz-16bit-mono-pcm',
    priority: 4,
    apiKey: '••••••••••••••••••••••••••••••••',
    status: 'inactive',
    latencyMs: 190,
    costPer1kChars: 0.016,
  },
  {
    id: 'tts-005',
    name: 'PlayHT',
    logo: '▶️',
    model: 'PlayDialog',
    voice: 'Olivia',
    voiceId: 's3://voice-cloning-zero-shot/olivia',
    language: 'en',
    speed: 1.0,
    pitch: 0,
    volume: 1.0,
    emotion: 'neutral',
    streaming: true,
    sampleRate: 22050,
    audioFormat: 'mp3',
    priority: 5,
    apiKey: '••••••••••••••••••••••••••••••••',
    status: 'inactive',
    latencyMs: 160,
    costPer1kChars: 0.03,
  },
]

// ── Routing Config ─────────────────────────────────────────────────────────

export const routingConfig: RoutingConfig = {
  llm: {
    primary: 'llm-001',
    fallback: 'llm-002',
    secondaryFallback: 'llm-003',
    strategy: 'failover',
    timeoutMs: 5000,
    retryCount: 2,
    failureConditions: ['timeout', 'rate_limit', 'server_error'],
  },
  stt: {
    primary: 'stt-001',
    fallback: 'stt-002',
    secondaryFallback: 'stt-003',
    strategy: 'failover',
    timeoutMs: 3000,
    retryCount: 1,
    failureConditions: ['timeout', 'server_error'],
  },
  tts: {
    primary: 'tts-001',
    fallback: 'tts-002',
    secondaryFallback: 'tts-003',
    strategy: 'failover',
    timeoutMs: 2000,
    retryCount: 1,
    failureConditions: ['timeout', 'server_error', 'voice_not_found'],
  },
}
