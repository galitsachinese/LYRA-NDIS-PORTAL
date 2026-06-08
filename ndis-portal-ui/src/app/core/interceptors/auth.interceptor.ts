import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  /**
   * RULE:
   * - Do NOT attach token for public endpoints
   * - Attach ONLY for protected endpoints
   *
   * IMPORTANT:
   * Services GET is public by requirement
   */
  const isPublicRequest = req.url.includes('/services') && req.method === 'GET';

  // If token exists AND request is NOT public → attach Authorization header
  if (token && !isPublicRequest) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};
