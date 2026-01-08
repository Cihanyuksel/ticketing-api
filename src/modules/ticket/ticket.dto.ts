import { IsUUID } from "class-validator";

export class IssueTicketDto {
  @IsUUID(4, { message: "Booking ID geçerli bir UUID olmalıdır." })
  bookingId!: string;
}
