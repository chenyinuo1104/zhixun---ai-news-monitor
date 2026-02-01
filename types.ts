import React from 'react';

export interface NewsItem {
  id: string;
  source: string;
  time: string;
  title: string;
  tags: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  imageUrl: string;
  category?: 'tech' | 'finance' | 'culture' | 'policy';
  isHighRisk?: boolean;
  summary?: string;
}

export interface TrendItem {
  id: number;
  rank: number;
  name: string;
  volume: string;
  growth: number;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: React.ReactNode;
  time?: string;
}