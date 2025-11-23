import { AuthService } from "../../aplicacion/auth.service.js";

export class AuthController {
  static home(req, res) {
    const user = AuthService.getUserInfo(req.oidc.user);

    res.send(`
      <h1>Bienvenido a la demo Auth0</h1>
      ${req.oidc.isAuthenticated()
        ? `<p>Hola, ${user.name}</p><p><a href="/logout">Cerrar sesión</a></p>`
        : `<p><a href="/login">Iniciar sesión</a></p>`}
    `);
  }
}
