import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Represents a custom event emitted between MFEs.
 */
export interface MFECustomEvent<
  T extends Record<string, unknown> | null | undefined = Record<string, unknown>,
> {
  /** Event type identifier (e.g., 'user:profile-updated') */
  type: string;
  /** Event payload */
  detail: T;
  /** Unix timestamp (ms) when the event was emitted */
  timestamp: number;
  /** Source MFE name */
  source: string;
}

/**
 * EventBusService — User MFE local implementation.
 *
 * Mirrors the Shell App's EventBusService interface so that, at runtime, the
 * singleton instance provided by Module Federation can be injected transparently.
 * When running standalone (e.g., in unit tests or without the Shell), this local
 * implementation emits the same window CustomEvents directly.
 *
 * Events emitted by the User MFE:
 *   - "user:profile-updated" — fired after a successful profile update (req 11.6).
 */
@Injectable({ providedIn: 'root' })
export class EventBusService {
  /**
   * Emits a custom event on the global window object.
   *
   * @param eventType - Event identifier (e.g., 'user:profile-updated')
   * @param detail    - Event payload
   * @param source    - Name of the MFE emitting the event
   */
  emit<T extends Record<string, unknown> | null | undefined>(
    eventType: string,
    detail: T,
    source: string,
  ): void {
    const mfeEvent: MFECustomEvent<T> = {
      type: eventType,
      detail,
      timestamp: Date.now(),
      source,
    };

    window.dispatchEvent(
      new CustomEvent(eventType, {
        detail: mfeEvent,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  /**
   * Listens for custom events emitted on the global window object.
   *
   * @param eventType - Event identifier to listen for
   * @returns Observable that emits typed MFECustomEvent objects
   */
  listen<T extends Record<string, unknown> | null | undefined = Record<string, unknown>>(
    eventType: string,
  ): Observable<MFECustomEvent<T>> {
    return fromEvent<CustomEvent<MFECustomEvent<T>>>(window, eventType).pipe(
      map((event) => event.detail),
    );
  }
}
