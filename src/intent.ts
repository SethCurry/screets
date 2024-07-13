export enum Action {
  Mine = 1,
  Carry = 2,
  Explore = 3,
}

export interface Intent {
  action: Action;
  target: Id<any>;
}
