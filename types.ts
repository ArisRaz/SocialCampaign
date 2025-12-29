export enum Platform {
  Twitter = 'Twitter/X',
  Facebook = 'Facebook',
  Instagram = 'Instagram',
  TikTok = 'TikTok',
  Reddit = 'Reddit',
  Discord = 'Discord'
}

export enum Length {
  One = '1',
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6'
}

export enum Tone {
  Entertaining = 'Entertaining',
  Fun = 'Fun',
  Warm = 'Warm',
  Playful = 'Playful',
  Witty = 'Witty',
  Casual = 'Casual',
  Urgent = 'Urgent',
  Inspirational = 'Inspirational'
}

export interface AsanaBrief {
  description: string;
  lookAndFeel: string;
  messagingHierarchy: string;
}

export interface GenerationRequest {
  campaignTitle: string;
  visualConcept: string;
  copyTopic: string;
  platform: Platform;
  length: Length;
  tone: Tone[];
}

export interface GeneratedResult {
  id: string;
  content: string;
  asanaBrief?: AsanaBrief;
  imageUrl?: string;
  request: GenerationRequest;
  timestamp: number;
}