import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  MinLength,
  MaxLength,
  IsInt,
  Min,
} from "class-validator";

/**
 * CreateVenueDTO
 * Yeni venue oluştururken kullanılır
 */
export class CreateVenueDTO {
  @IsString({ message: "Mekan adı metin olmalıdır" })
  @IsNotEmpty({ message: "Mekan adı zorunludur" })
  @MinLength(3, { message: "Mekan adı en az 3 karakter olmalıdır" })
  @MaxLength(100, { message: "Mekan adı en fazla 100 karakter olabilir" })
  name!: string;

  @IsString({ message: "Şehir metin olmalıdır" })
  @IsNotEmpty({ message: "Şehir zorunludur" })
  city!: string;

  @IsString({ message: "İlçe metin olmalıdır" })
  @IsNotEmpty({ message: "İlçe zorunludur" })
  district!: string;

  @IsString({ message: "Adres metin olmalıdır" })
  @IsNotEmpty({ message: "Adres zorunludur" })
  @MinLength(10, { message: "Adres en az 10 karakter olmalıdır" })
  address!: string;

  @IsOptional()
  @IsUrl({}, { message: "Geçerli bir URL giriniz" })
  imageUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: "Geçerli bir Google Maps linki giriniz" })
  googleMapsLink?: string;
}

/**
 * UpdateVenueDTO
 * Venue güncellerken kullanılır (tüm alanlar optional)
 */
export class UpdateVenueDTO {
  @IsOptional()
  @IsString({ message: "Mekan adı metin olmalıdır" })
  @MinLength(3, { message: "Mekan adı en az 3 karakter olmalıdır" })
  @MaxLength(100, { message: "Mekan adı en fazla 100 karakter olabilir" })
  name?: string;

  @IsOptional()
  @IsString({ message: "Şehir metin olmalıdır" })
  city?: string;

  @IsOptional()
  @IsString({ message: "İlçe metin olmalıdır" })
  district?: string;

  @IsOptional()
  @IsString({ message: "Adres metin olmalıdır" })
  @MinLength(10, { message: "Adres en az 10 karakter olmalıdır" })
  address?: string;

  @IsOptional()
  @IsUrl({}, { message: "Geçerli bir URL giriniz" })
  imageUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: "Geçerli bir Google Maps linki giriniz" })
  googleMapsLink?: string;
}

/**
 * AddSectionDTO
 * Section eklerken kullanılır
 */
export class AddSectionDTO {
  @IsString({ message: "Bölüm adı metin olmalıdır" })
  @IsNotEmpty({ message: "Bölüm adı zorunludur" })
  @MinLength(1, { message: "Bölüm adı en az 1 karakter olmalıdır" })
  @MaxLength(50, { message: "Bölüm adı en fazla 50 karakter olabilir" })
  name!: string;
}

/**
 * UpdateSectionDTO
 */
export class UpdateSectionDTO {
  @IsOptional()
  @IsString({ message: "Bölüm adı metin olmalıdır" })
  @MinLength(1, { message: "Bölüm adı en az 1 karakter olmalıdır" })
  @MaxLength(50, { message: "Bölüm adı en fazla 50 karakter olabilir" })
  name?: string;
}

/**
 * AddRowDTO
 * Tek sıra eklerken kullanılır
 */
export class AddRowDTO {
  @IsString({ message: "Sıra etiketi metin olmalıdır" })
  @IsNotEmpty({ message: "Sıra etiketi zorunludur" })
  @MaxLength(10, { message: "Sıra etiketi en fazla 10 karakter olabilir" })
  rowLabel!: string;

  @IsInt({ message: "Koltuk sayısı tam sayı olmalıdır" })
  @Min(1, { message: "Koltuk sayısı en az 1 olmalıdır" })
  seatCount!: number;
}

/**
 * AddBulkRowsDTO
 * Toplu sıra eklerken kullanılır
 */
export class AddBulkRowsDTO {
  @IsString({ message: "Sıra prefix'i metin olmalıdır" })
  @IsNotEmpty({ message: "Sıra prefix'i zorunludur" })
  @MaxLength(5, { message: "Sıra prefix'i en fazla 5 karakter olabilir" })
  rowPrefix!: string;

  @IsInt({ message: "Başlangıç sırası tam sayı olmalıdır" })
  @Min(1, { message: "Başlangıç sırası en az 1 olmalıdır" })
  startRow!: number;

  @IsInt({ message: "Bitiş sırası tam sayı olmalıdır" })
  @Min(1, { message: "Bitiş sırası en az 1 olmalıdır" })
  endRow!: number;

  @IsInt({ message: "Sıra başına koltuk sayısı tam sayı olmalıdır" })
  @Min(1, { message: "Sıra başına koltuk sayısı en az 1 olmalıdır" })
  seatsPerRow!: number;
}

/**
 * AddSeatDTO
 * Tek koltuk eklerken kullanılır
 */
export class AddSeatDTO {
  @IsString({ message: "Koltuk numarası metin olmalıdır" })
  @IsNotEmpty({ message: "Koltuk numarası zorunludur" })
  @MaxLength(20, { message: "Koltuk numarası en fazla 20 karakter olabilir" })
  seatNumber!: string;
}

/**
 * AddBulkSeatsDTO
 * Toplu koltuk eklerken kullanılır
 */
export class AddBulkSeatsDTO {
  @IsInt({ message: "Başlangıç numarası tam sayı olmalıdır" })
  @Min(1, { message: "Başlangıç numarası en az 1 olmalıdır" })
  startNumber!: number;

  @IsInt({ message: "Bitiş numarası tam sayı olmalıdır" })
  @Min(1, { message: "Bitiş numarası en az 1 olmalıdır" })
  endNumber!: number;

  @IsOptional()
  @IsString({ message: "Prefix metin olmalıdır" })
  @MaxLength(10, { message: "Prefix en fazla 10 karakter olabilir" })
  prefix?: string;
}

/**
 * UpdateSeatDTO
 */
export class UpdateSeatDTO {
  @IsOptional()
  @IsString({ message: "Koltuk numarası metin olmalıdır" })
  @MaxLength(20, { message: "Koltuk numarası en fazla 20 karakter olabilir" })
  seatNumber?: string;
}
