export interface IVenueCacheService {
  set<T>(key: string, data: T): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  clear(key: string): Promise<void>;
  clearVenue(venueId: string): Promise<void>;
  getVenueKey(venueId: string): string;
}

export interface IVenueCapacityService {
  recalculateVenueCapacity(venueId: string): Promise<number>;
  recalculateSectionCapacity(sectionId: string): Promise<number>;
  recalculateFromSection(sectionId: string, venueId: string): Promise<void>;
}
