export interface UfcDataSource {
  getEvents(): Promise<unknown[]>;
}
