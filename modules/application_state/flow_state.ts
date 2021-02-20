/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/ban-types */
import './_debug_hook';
import { DataStruct, MutationFn } from './_data_struct';

type Disposer = () => void;

type HookFn<T> = (changeSet?: Set<keyof T>) => void;

export enum Flow {
  ACCESSIBLE,
  UNSET,
  PENDING,
  ERROR,
}

export type CurrStateTuple<T> = [data: Readonly<T>, flow: Flow];

interface Specification<T> {
  initialState?: T;
  designatedFlowState?: Flow;
}

export class FlowState<T extends object> {
  public error: Error | null = null;
  public flowState: Readonly<Flow> = Flow.UNSET;
  private data: DataStruct<T> | null = null;
  private readonly hooks: Map<symbol, HookFn<T>> = new Map();

  constructor(spec: Specification<T> = {}) {
    if (globalThis['__one_atom_debug_ref__']) {
      globalThis['__one_atom_debug_ref__'].add(this);
    }

    const { initialState, designatedFlowState } = spec;

    if (designatedFlowState !== undefined) this.flowState = designatedFlowState;

    if (initialState) {
      this.data = new DataStruct(initialState);
    }
  }

  public subscribe(event: HookFn<T>): Disposer {
    const id = Symbol();

    this.hooks.set(id, event);

    return () => {
      this.hooks.delete(id);
    };
  }

  public unsafeWrite(currentState: Partial<T> | MutationFn<T>): void {
    if (!this.data) throw new Error('data need to first be set');

    try {
      const newState = currentState instanceof Function ? currentState(this.data) : currentState;

      const changeSet = this.data.insert(newState);
      this.error = null;
      this.flowState = Flow.ACCESSIBLE;
      this.dispatch(changeSet);
    } catch (error) {
      this.error = new Error(`could not mutate the state:\n\n${error}`);
      this.flowState = Flow.ERROR;
      this.dispatch();
    }
  }

  public read(): CurrStateTuple<T> {
    // The following is purposely being ignored by TypeScript, when the state is
    // not accessible it should deliberately cause an error so a correct
    // Behavior can be written
    switch (this.flowState) {
      case Flow.PENDING:
        // @ts-ignore
        return [undefined, this.flowState];
      case Flow.UNSET:
        // @ts-ignore
        return [undefined, this.flowState];
      case Flow.ERROR:
        // @ts-ignore
        return [undefined, this.flowState];
      default: {
        if (!this.data) {
          this.flowState = Flow.UNSET;

          // @ts-ignore
          return [this.flowState, Flow.UNSET];
        }

        return [this.data.extract(), this.flowState];
      }
    }
  }

  public peekState(): Readonly<T> {
    const [state] = this.read();

    return state;
  }

  public changeFlowTo(action: Flow): void {
    this.flowState = action;
    this.dispatch();
  }

  public overwriteData(state: T): void {
    this.data = new DataStruct(state);
  }

  private dispatch(changeSet?: Set<keyof T>): void {
    this.hooks.forEach((hook) => hook(changeSet));
  }
}

export function createFlowState<T extends object>(initialState?: T, designatedFlowState?: Flow): FlowState<T> {
  const flowState = new FlowState<T>({
    initialState,
    designatedFlowState,
  });

  // todo, add to window for later debug purposes

  return flowState;
}
