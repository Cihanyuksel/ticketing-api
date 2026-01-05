export interface IPricingStrategy {
  calculatePrice(basePrice: number, context: PricingContext): number;
}

export interface PricingContext {
  sessionId: string;
  totalSeats: number;
  soldSeats: number;
  timeUntilEvent: number;
  sectionId?: string;
}
