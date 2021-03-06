/* eslint-disable @typescript-eslint/ban-types */
import './_debug_hook';
import { useEffect, useState } from 'react';
import { SynchronousPresentation } from './synchronous_presentation';
import { ConcurrentPresentation } from './concurrent_presentation';
import { FlowPresentation, CurrPresentationTuple } from './flow_presentation';

export function usePresentation<T extends object>(state: FlowPresentation<T>, deps?: ReadonlyArray<keyof T>): CurrPresentationTuple<T>;
export function usePresentation<T extends object>(state: ConcurrentPresentation<T>, deps?: ReadonlyArray<keyof T>): Readonly<T>;
export function usePresentation<T extends object>(state: SynchronousPresentation<T>, deps?: ReadonlyArray<keyof T>): Readonly<T>;
export function usePresentation<T extends object>(
  state: SynchronousPresentation<T> | ConcurrentPresentation<T> | FlowPresentation<T>,
  triggers?: ReadonlyArray<keyof T>,
): CurrPresentationTuple<T> | Readonly<T> {
  const [, forceUpdate] = useState([]);

  useEffect(() => {
    globalThis['__one_atom_debug_hook__'].emit('add', state);

    const disposer = state.subscribe((changeSet) => {
      if (triggers && changeSet) {
        const shouldUpdate = triggers.find((trigger) => {
          return changeSet.has(trigger);
        });

        if (shouldUpdate) {
          forceUpdate([]);
        }

        return;
      }

      forceUpdate([]);
    });

    return () => {
      globalThis['__one_atom_debug_hook__'].emit('remove', state);
      disposer();
    };
  }, [state, triggers]);

  return state.read();
}
