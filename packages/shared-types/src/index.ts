export type Brand<Value, Name extends string> = Value & {
  readonly __brand: Name;
};

export type Identifier = Brand<string, "Identifier">;

export type ISODateTime = Brand<string, "ISODateTime">;

export interface VersionedResource {
  readonly id: Identifier;
  readonly version: number;
  readonly updatedAt: ISODateTime;
}
