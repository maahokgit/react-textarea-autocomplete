export const KEY_CODES = {
  ESC: 27,
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  ENTER: 13,
  TAB: 9,
} as const;

interface ListenerItem {
  keyCode: number[];
  fn: (e: Event) => void;
}

// This is self-made key shortcuts manager, used for caching key strokes
class Listener {
  private index: number;
  private listeners: Record<number, ListenerItem>;
  private f: (e: Event) => void;

  constructor() {
    this.index = 1;
    this.listeners = {};

    this.f = (e: Event) => {
      if (!e) return;

      const keyboardEvent = e as KeyboardEvent;
      const code = keyboardEvent.keyCode || keyboardEvent.which;
      Object.values(this.listeners).forEach(({ keyCode, fn }) => {
        if (keyCode.includes(code)) {
          e.stopPropagation();
          e.preventDefault();
          fn(e);
        }
      });
    };
  }

  startListen = (ref: HTMLInputElement | HTMLTextAreaElement): void => {
    if (!ref) return;

    ref.addEventListener('keydown', this.f);
  };

  stopListen = (ref: HTMLInputElement | HTMLTextAreaElement): void => {
    if (!ref) return;

    ref.removeEventListener('keydown', this.f);
  };

  add = (keyCodes: number[] | number, fn: (e: Event) => void): number => {
    const keyCode: number[] = Array.isArray(keyCodes) ? keyCodes : [keyCodes];

    this.listeners[this.index] = {
      keyCode,
      fn,
    };

    return this.index++;
  };

  remove = (id: number): void => {
    delete this.listeners[id];
  };

  removeAll = (): void => {
    this.listeners = {};
    this.index = 1;
  };
}

export default new Listener();

