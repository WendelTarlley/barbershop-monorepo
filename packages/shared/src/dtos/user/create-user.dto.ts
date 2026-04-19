export class CreateUserDto {
  name!: string;
  email!: string;
  roleId!: string;
  specialty?: string;
  active?: boolean;
  cpf?: string;
  photoUrl?: string;
}
