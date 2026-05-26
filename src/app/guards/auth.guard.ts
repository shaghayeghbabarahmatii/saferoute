import { Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard = () => {
  const auth = localStorage.getItem('saferoute_auth');
  if (auth === 'true') {
    return true;
  }
  return inject(Router).createUrlTree(['/login']);
};
 