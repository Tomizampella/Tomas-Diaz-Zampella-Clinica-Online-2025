// slideInAnimation.ts
import {
  animate,
  group,
  query,
  style,
  transition,
  trigger
} from '@angular/animations';

export const slideInDerIzqAnimation = trigger('routeAnimationsDerIzq', [
  transition('* => *', [
    query(':enter, :leave', style({ position: 'absolute', width: '100%' }), {
      optional: true,
    }),
    query(':enter', style({ transform: 'translateX(100%)' }), {
      optional: true,
    }),
    group([
      query(
        ':leave',
        animate('600ms ease-out', style({ transform: 'translateX(-100%)' })),
        { optional: true }
      ),
      query(
        ':enter',
        animate('600ms ease-out', style({ transform: 'translateX(0%)' })),
        { optional: true }
      ),
    ]),
  ]),
]);
