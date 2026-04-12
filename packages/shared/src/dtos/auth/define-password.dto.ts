// auth/dto/define-password.dto.ts
import { IsString, MinLength } from "class-validator"

export class DefinePasswordDto {
  @IsString()
  token!: string  // magic link token

  @IsString()
  @MinLength(8)
  password!: string
}