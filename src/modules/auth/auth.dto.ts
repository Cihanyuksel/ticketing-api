import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsDateString,
  Matches,
  IsMobilePhone,
} from "class-validator";
import { Gender } from "./user.entity";

export class RegisterDTO {
  @IsEmail({}, { message: "Geçerli bir email adresi giriniz" })
  @IsNotEmpty({ message: "Email adresi zorunludur" })
  email!: string;

  @IsString({ message: "Şifre metin olmalıdır" })
  @IsNotEmpty({ message: "Şifre zorunludur" })
  @MinLength(6, { message: "Şifre en az 6 karakter olmalıdır" })
  @MaxLength(20, { message: "Şifre en fazla 20 karakter olabilir" })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      "Şifre çok zayıf (En az 1 büyük harf, 1 küçük harf ve 1 sayı içermeli)",
  })
  password!: string;

  @IsString({ message: "İsim metin olmalıdır" })
  @IsNotEmpty({ message: "İsim zorunludur" })
  @MinLength(2, { message: "İsim en az 2 karakter olmalıdır" })
  firstName!: string;

  @IsString({ message: "Soyisim metin olmalıdır" })
  @IsNotEmpty({ message: "Soyisim zorunludur" })
  @MinLength(2, { message: "Soyisim en az 2 karakter olmalıdır" })
  lastName!: string;

  @IsOptional()
  @IsString({ message: "Telefon numarası metin olmalıdır" })
  @IsMobilePhone(
    undefined,
    {},
    { message: "Geçerli bir cep telefonu numarası giriniz" }
  )
  phone?: string;

  @IsOptional()
  @IsEnum(Gender, { message: "Geçersiz cinsiyet değeri" })
  gender?: Gender;

  @IsOptional()
  @IsDateString(
    {},
    { message: "Doğum tarihi geçerli bir tarih formatı (YYYY-MM-DD) olmalıdır" }
  )
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class LoginDTO {
  @IsEmail({}, { message: "Geçerli bir email adresi giriniz" })
  @IsNotEmpty({ message: "Email adresi zorunludur" })
  email!: string;

  @IsString({ message: "Şifre metin olmalıdır" })
  @IsNotEmpty({ message: "Şifre zorunludur" })
  password!: string;
}

export class RefreshTokenDTO {
  @IsString({ message: "Refresh token metin olmalıdır" })
  @IsNotEmpty({ message: "Refresh token zorunludur" })
  refreshToken!: string;
}
