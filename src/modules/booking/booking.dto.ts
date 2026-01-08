import { IsString, IsUUID, IsOptional, IsInt, Min, Max } from "class-validator";

export class CreateBookingDto {
  @IsUUID(4, { message: "Session ID geçerli bir UUID olmalıdır." })
  sessionId!: string;

  @IsUUID(4, { message: "Seat ID geçerli bir UUID olmalıdır." })
  seatId!: string;

  @IsUUID(4, { message: "Price ID geçerli bir UUID olmalıdır." })
  priceId!: string;

  @IsUUID(4, { message: "User ID geçerli bir UUID olmalıdır." })
  userId!: string;

  @IsOptional()
  @IsInt({ message: "Yaş bir tam sayı olmalıdır." })
  @Min(0, { message: "Yaş 0'dan küçük olamaz." })
  @Max(150, { message: "Yaş 150'den büyük olamaz." })
  userAge?: number;
}

export class CancelBookingDto {
  @IsUUID(4, { message: "Booking ID geçerli bir UUID olmalıdır." })
  bookingId!: string;
}

export class GetBookingDto {
  @IsUUID(4, { message: "Booking ID geçerli bir UUID olmalıdır." })
  bookingId!: string;
}
