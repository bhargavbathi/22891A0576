import { Logger } from '../utils/logger';

export interface ShortenUrlRequest {
  originalUrl: string;
  customShortcode?: string;
  validityMinutes?: number;
}

export interface ShortenUrlResponse {
  shortUrl: string;
  shortcode: string;
  originalUrl: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface UrlMapping {
  shortcode: string;
  originalUrl: string;
  expiresAt: Date;
  createdAt: Date;
  accessCount: number;
}

// URL Service for shortening URLs
export class UrlService {
  private static readonly STORAGE_KEY = 'url_mappings';
  private static readonly BASE_URL = window.location.origin;

  private static generateShortcode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private static isValidShortcode(shortcode: string): boolean {
    const regex = /^[a-zA-Z0-9]{3,10}$/;
    return regex.test(shortcode);
  }

  private static getStoredMappings(): UrlMapping[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      Logger.Log('UrlService', 'ERROR', 'urlService', 'Failed to retrieve stored mappings');
      return [];
    }
  }

  private static saveMappings(mappings: UrlMapping[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mappings));
    } catch (error) {
      Logger.Log('UrlService', 'ERROR', 'urlService', 'Failed to save mappings to storage');
    }
  }

  private static cleanExpiredMappings(): void {
    const mappings = this.getStoredMappings();
    const now = new Date();
    const validMappings = mappings.filter(mapping => new Date(mapping.expiresAt) > now);
    
    if (validMappings.length !== mappings.length) {
      this.saveMappings(validMappings);
      Logger.Log('UrlService', 'INFO', 'urlService', `Cleaned ${mappings.length - validMappings.length} expired mappings`);
    }
  }

  static async shortenUrl(request: ShortenUrlRequest): Promise<ShortenUrlResponse> {
    await Logger.Log('UrlService', 'INFO', 'urlService', 'Starting URL shortening process');

    // Check if URL is valid
    if (!this.isValidUrl(request.originalUrl)) {
      await Logger.Log('UrlService', 'ERROR', 'urlService', 'URL validation failed');
      throw new Error('Invalid URL provided');
    }

    // Clean expired mappings first
    this.cleanExpiredMappings();

    const mappings = this.getStoredMappings();
    let shortcode = request.customShortcode;

    // Validate custom shortcode if provided
    if (shortcode) {
      if (!this.isValidShortcode(shortcode)) {
        await Logger.Log('UrlService', 'ERROR', 'urlService', 'Custom shortcode is invalid');
        throw new Error('Custom shortcode must be 3-10 alphanumeric characters');
      }

      // Check if shortcode already exists
      if (mappings.some(mapping => mapping.shortcode === shortcode)) {
        await Logger.Log('UrlService', 'ERROR', 'urlService', 'Shortcode already taken');
        throw new Error('Custom shortcode already exists');
      }
    } else {
      // Generate shortcode
      shortcode = this.generateShortcode();
      // Check if it exists (simple approach)
      while (mappings.some(mapping => mapping.shortcode === shortcode)) {
        shortcode = this.generateShortcode();
      }
    }

    // Set expiry time
    const validityMinutes = request.validityMinutes || 30;
    const expiresAt = new Date(Date.now() + validityMinutes * 60 * 1000);
    const createdAt = new Date();

    // Create new mapping
    const newMapping: UrlMapping = {
      shortcode,
      originalUrl: request.originalUrl,
      expiresAt,
      createdAt,
      accessCount: 0
    };

    mappings.push(newMapping);
    this.saveMappings(mappings);

    const shortUrl = `${this.BASE_URL}/${shortcode}`;

    await Logger.Log('UrlService', 'INFO', 'urlService', 'URL shortened successfully');

    return {
      shortUrl,
      shortcode,
      originalUrl: request.originalUrl,
      expiresAt,
      createdAt
    };
  }

  static async resolveShortcode(shortcode: string): Promise<string | null> {
    await Logger.Log('UrlService', 'INFO', 'urlService', `Attempting to resolve shortcode: ${shortcode}`);

    this.cleanExpiredMappings();
    const mappings = this.getStoredMappings();
    const mapping = mappings.find(m => m.shortcode === shortcode);

    if (!mapping) {
      await Logger.Log('UrlService', 'WARN', 'urlService', `Shortcode not found: ${shortcode}`);
      return null;
    }

    // Check if expired
    if (new Date(mapping.expiresAt) <= new Date()) {
      await Logger.Log('UrlService', 'WARN', 'urlService', `Shortcode expired: ${shortcode}`);
      return null;
    }

    // Increment access count
    mapping.accessCount++;
    this.saveMappings(mappings);

    await Logger.Log('UrlService', 'INFO', 'urlService', `Successfully resolved shortcode ${shortcode} to ${mapping.originalUrl}`);
    return mapping.originalUrl;
  }

  static async getAllMappings(): Promise<UrlMapping[]> {
    await Logger.Log('UrlService', 'INFO', 'urlService', 'Retrieving all URL mappings');
    this.cleanExpiredMappings();
    return this.getStoredMappings();
  }

  static async deleteMappingByShortcode(shortcode: string): Promise<boolean> {
    await Logger.Log('UrlService', 'INFO', 'urlService', `Attempting to delete mapping: ${shortcode}`);

    const mappings = this.getStoredMappings();
    const initialLength = mappings.length;
    const filteredMappings = mappings.filter(m => m.shortcode !== shortcode);

    if (filteredMappings.length === initialLength) {
      await Logger.Log('UrlService', 'WARN', 'urlService', `Mapping not found for deletion: ${shortcode}`);
      return false;
    }

    this.saveMappings(filteredMappings);
    await Logger.Log('UrlService', 'INFO', 'urlService', `Successfully deleted mapping: ${shortcode}`);
    return true;
  }
}
