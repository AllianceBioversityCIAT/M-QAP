import {
  trigger,
  state,
  style,
  transition,
  animate,
  AnimationTriggerMetadata,
} from '@angular/animations';

export function fadeInOut(
  timingIn: number,
  timingOut: number
): AnimationTriggerMetadata {
  return trigger('fadeInOut', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-6px)' }),
      animate(timingIn, style({ opacity: 1, transform: 'translateY(0px)' })),
    ]),
    transition(':leave', [
      animate(timingOut, style({ opacity: 0, transform: 'translateY(-6px)' })),
    ]),
  ]);
}
