import { OperatorFunction, ObservableInput } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { take } from 'rxjs/internal/operators/take';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { mapTo } from 'rxjs/internal/operators/derived/mapTo';
import { from } from 'rxjs/internal/create/from';
import { defaultIfEmpty } from 'rxjs/internal/operators/defaultIfEmpty';
import { defer } from 'rxjs/internal/create/defer';

/* tslint:disable:max-line-length */
/** @deprecated In future versions, empty notifiers will no longer re-emit the source value on the output observable. */
export function delayWhen<T>(delayDurationSelector: (value: T, index: number) => Observable<never>, subscriptionDelay?: Observable<any>): OperatorFunction<T, T>;
export function delayWhen<T>(delayDurationSelector: (value: T, index: number) => Observable<any>, subscriptionDelay?: Observable<any>): OperatorFunction<T, T>;
/* tslint:disable:max-line-length */

/**
 * Delays the emission of items from the source Observable by a given time span
 * determined by the emissions of another Observable.
 *
 * <span class="informal">It's like {@link delay}, but the time span of the
 * delay duration is determined by a second Observable.</span>
 *
 * ![](delayWhen.png)
 *
 * `delayWhen` time shifts each emitted value from the source Observable by a
 * time span determined by another Observable. When the source emits a value,
 * the `delayDurationSelector` function is called with the source value as
 * argument, and should return an Observable, called the "duration" Observable.
 * The source value is emitted on the output Observable only when the duration
 * Observable emits a value or completes.
 * The completion of the notifier triggering the emission of the source value
 * is deprecated behavior and will be removed in future versions.
 *
 * Optionally, `delayWhen` takes a second argument, `subscriptionDelay`, which
 * is an Observable. When `subscriptionDelay` emits its first value or
 * completes, the source Observable is subscribed to and starts behaving like
 * described in the previous paragraph. If `subscriptionDelay` is not provided,
 * `delayWhen` will subscribe to the source Observable as soon as the output
 * Observable is subscribed.
 *
 * ## Example
 * Delay each click by a random amount of time, between 0 and 5 seconds
 * ```javascript
 * const clicks = fromEvent(document, 'click');
 * const delayedClicks = clicks.pipe(
 *   delayWhen(event => interval(Math.random() * 5000)),
 * );
 * delayedClicks.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link debounce}
 * @see {@link delay}
 *
 * @param {function(value: T, index: number): Observable} delayDurationSelector A function that
 * returns an Observable for each value emitted by the source Observable, which
 * is then used to delay the emission of that item on the output Observable
 * until the Observable returned from this function emits a value.
 * @param {Observable} subscriptionDelay An Observable that triggers the
 * subscription to the source Observable once it emits any value.
 * @return {Observable} An Observable that delays the emissions of the source
 * Observable by an amount of time specified by the Observable returned by
 * `delayDurationSelector`.
 * @method delayWhen
 * @owner Observable
 */
export function delayWhen<T>(
  delayDurationSelector: (value: T, index: number) => ObservableInput<any>,
  subscriptionDelay?: Observable<any>): OperatorFunction<T, T> {
    return (source: Observable<T>): Observable<T> => {
      const modifiedSource = source.pipe(
        mergeMap((v, i) => from(delayDurationSelector(v, i)).pipe(
          take(1),
          defaultIfEmpty(undefined),
          mapTo(v),
        ))
      );

      return subscriptionDelay ? defer(() => from(subscriptionDelay)).pipe(
        take(1),
        defaultIfEmpty(undefined),
        mergeMap(() => modifiedSource)
      ) : modifiedSource;
  };
}