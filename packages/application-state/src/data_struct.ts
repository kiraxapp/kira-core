export type ValidStateData = Record<string, string | number | symbol | boolean | null | Array<unknown> | Record<string, unknown>>;

export class DataStruct<T extends ValidStateData> {
  private readonly stored_data = new Map<keyof T, unknown>();
  private readonly keys: string[];

  constructor(data: T) {
    this.keys = Object.keys(data);
    this.insert(data);
  }

  public insert(from_object: Partial<T>): void {
    for (const key of this.keys) {
      const pre_value = this.stored_data.get(key);

      // Continue if undefined, from_object is Partial<T> and we can't determine
      // if the value or index was undefined. Null should be used to represent
      // non-assigned values
      if (from_object[key] === undefined) {
        continue;
      }

      // Keeps the mem ref to the original object and
      if (typeof pre_value === 'object' && pre_value === from_object[key]) {
        this.stored_data.set(key, from_object[key]);
        continue;
      }

      this.stored_data.set(key, from_object[key]);
    }
  }

  public extract(): T {
    const builder: Record<string, unknown> = {};

    for (const key of this.keys) {
      builder[key] = this.stored_data.get(key);
    }

    return builder as T;
  }
}
