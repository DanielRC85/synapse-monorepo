import * as crypto from 'crypto';

/**
 * Base class for Entities.
 * Entities are defined by a unique Identity.
 */
export abstract class Entity<T> {
  protected readonly _id: string;
  protected readonly props: T;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: T, id?: string) {
    this._id = id ? id : this.generateId(); // ID generation strategy
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this.props = props;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Basic comparison by ID.
   */
  public equals(object?: Entity<T>): boolean {
    if (object == null || object == undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!isEntity(object)) {
      return false;
    }

    return this._id === object._id;
  }

  /**
   * Update the timestamp. Should be called by AggregateRoot on change.
   */
  protected updateTimestamp(): void {
    this._updatedAt = new Date();
  }

  /**
   * Abstract method to force ID generation implementation or use a library
   * like 'uuid' in the concrete class or a utility.
   * For now, we keep it simple string, but ideally use UUID v4.
   */
  private generateId(): string {
    return crypto.randomUUID(); 
  }
}

// Type guard
function isEntity(v: any): v is Entity<any> {
  return v instanceof Entity;
}