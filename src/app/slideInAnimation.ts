import {
    animate,
    group,
    query,
    style,
    transition,
    trigger
} from '@angular/animations';

const resetRoute = [
    style({ position: 'relative' }),
    query(
        ':enter, :leave',
        [
            style({
                position: 'absolute',
                opacity: 0,
            }),
    	],
{ optional: true }
    ),
];

export const slideInAnimation = trigger('routeAnimations', [
    transition('* => *', [
        ...resetRoute,
        query(':enter', [style({ opacity: 0 })], {
            optional: true,
        }),
        group([
            query(
                ':leave',
                [style({ opacity: 1 }), animate('0.2s', style({ opacity: 0 }))],
                { optional: true }
            ),
            query(
                ':enter',
                [style({ opacity: 0 }), animate('0.8s', style({ opacity: 1 }))],
                { optional: true }
            ),
        ]),
    ]),
    transition('home => about', [
        style({ backgroundColor: 'red' })
    ])
]);
