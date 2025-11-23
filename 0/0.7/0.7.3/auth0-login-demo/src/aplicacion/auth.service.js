import { User } from "../dominio/user.entity.js";

export class AuthService {
  static getUserInfo(oidcUser) {
    if (!oidcUser) return null;
    return new User({ name: oidcUser.name, email: oidcUser.email });
  }
}
