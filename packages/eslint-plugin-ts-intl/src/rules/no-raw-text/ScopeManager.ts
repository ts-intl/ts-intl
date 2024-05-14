export class ScopeManager {
  _targetCallStack = [false];
  _ignoreStack = [false];
  ignoreConfig: Record<string, RegExp[]>;

  constructor(
    ignoreNodes: {
      type: string;
      body: string;
      flags: string;
    }[],
  ) {
    this.ignoreConfig = ignoreNodes.reduce(
      (all, { type, body, flags }) => {
        const regexp = new RegExp(body, flags);
        type.split(',').forEach((t) => {
          all[t] ? all[t].push(regexp) : (all[t] = [regexp]);
        });
        return all;
      },
      {} as Record<string, RegExp[]>,
    );
  }

  get isInIgnoreNodes() {
    return this._ignoreStack[this._ignoreStack.length - 1];
  }

  pushIgnoreStack(type: string, text: string) {
    this._ignoreStack.push(
      this._ignoreStack[this._ignoreStack.length - 1] ||
        (this.ignoreConfig[type] || []).some((regexp) => regexp.test(text)),
    );
  }
  forcePushIgnoreStack(ignore: boolean) {
    this._ignoreStack.push(ignore);
  }
  popIgnoreStack() {
    this._ignoreStack.pop();
  }

  enterCall(isTargetCall: boolean) {
    this._targetCallStack.push(
      this._targetCallStack[this._targetCallStack.length - 1] || isTargetCall,
    );
  }
  exitCall() {
    this._targetCallStack.pop();
  }

  get isInTargetCall() {
    return this._targetCallStack[this._targetCallStack.length - 1];
  }
}
