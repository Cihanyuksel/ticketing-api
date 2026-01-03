export interface IVenueCacheService {
  getCachedVenueDetails(venueId: string): Promise<any | null>;
  cacheVenueDetails(venueId: string, data: any): Promise<void>;
  clearVenueCache(venueId: string): Promise<void>;
}

export interface IVenueCapacityService {
  recalculateVenueCapacity(venueId: string): Promise<number>;
  recalculateSectionCapacity(sectionId: string): Promise<number>;
  recalculateFromSection(sectionId: string, venueId: string): Promise<void>;
}
