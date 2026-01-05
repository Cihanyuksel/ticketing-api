import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  Min,
  ValidateNested,
  IsArray,
  IsBoolean,
  IsObject,
} from "class-validator";
import { Type } from "class-transformer";
import {
  EventStatus,
  EventType,
  PricingStrategyType,
  RuleType,
} from "./entities/enum";

// ============================================
// EVENT DTO
// ============================================

export class CreateEventDTO {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(EventType)
  type!: EventType;

  @IsString()
  @IsNotEmpty()
  performer!: string;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateEventDTO {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @IsOptional()
  @IsString()
  performer?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}

// ============================================
// SESSION DTO
// ============================================

export class CreateSessionDTO {
  @IsUUID()
  eventId!: string;

  @IsUUID()
  venueId!: string;

  @IsDateString()
  startTime!: Date;

  @IsDateString()
  endTime!: Date;

  @IsOptional()
  @IsEnum(PricingStrategyType)
  pricingStrategy?: PricingStrategyType;
}

export class UpdateSessionDTO {
  @IsOptional()
  @IsDateString()
  startTime?: Date;

  @IsOptional()
  @IsDateString()
  endTime?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(PricingStrategyType)
  pricingStrategy?: PricingStrategyType;
}

// ============================================
// PRICING DTO
// ============================================

export class PriceItemDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsUUID()
  sectionId?: string;
}

export class AddPricesDTO {
  @IsUUID()
  sessionId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceItemDTO)
  prices!: PriceItemDTO[];
}

// ============================================
// PRICING RULE DTO
// ============================================

export class CreatePricingRuleDTO {
  @IsUUID()
  sessionId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(RuleType)
  type!: RuleType;

  @IsNumber()
  @Min(0)
  value!: number;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  priority?: number;
}

export class UpdatePricingRuleDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RuleType)
  type?: RuleType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================
// CATEGORY DTO
// ============================================

export class CreateCategoryDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;
}
