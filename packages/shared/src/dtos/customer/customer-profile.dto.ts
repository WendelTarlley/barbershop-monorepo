export class CustomerProfileDto {
  id!: string
  name!: string
  phone!: string
  email!: string | null
  firstAccess!: boolean
  active!: boolean
  createdAt!: Date
  updatedAt!: Date
}
