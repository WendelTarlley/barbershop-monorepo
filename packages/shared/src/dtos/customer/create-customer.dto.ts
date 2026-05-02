import { IsEmail, IsOptional, IsString, MinLength } from "class-validator"

export class CreateCustomerDto {
  @IsString()
  name!: string

  @IsString()
  phone!: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string
}
