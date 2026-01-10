import { Entity } from './entity.base';

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: any[] = [];
  get domainEvents(): any[] { return this._domainEvents; }
  protected addDomainEvent(domainEvent: any): void {
    this._domainEvents.push(domainEvent);
    this.updateTimestamp();
  }
  public clearEvents(): void { this._domainEvents = []; }
}