export enum PricingStrategyType {
  STANDARD = "STANDARD",
  SURGE = "SURGE",
}

export enum EventType {
  CONCERT = "CONCERT",
  THEATER = "THEATER",
  STANDUP = "STANDUP",
}

export enum EventStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export enum RuleType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
  FIXED_PRICE = "FIXED_PRICE",
  BOGO = "BOGO",
}
