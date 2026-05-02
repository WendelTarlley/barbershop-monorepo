import { Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class CustomerRefreshGuard extends AuthGuard("customer-jwt-refresh") {}
