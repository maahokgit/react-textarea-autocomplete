import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import ReactDOM from 'react-dom';
import getCaretCoordinates from 'textarea-caret';

import Listeners, { KEY_CODES } from './listener';
import List from './List';
import { defaultScrollToItem } from './utilities';

import type {
  TextareaProps,
  CaretPositionType,
  OutputType,
  SettingType,
} from './types';

const DEFAULT_CARET_POSITION: CaretPositionType = 'next';

const POSITION_CONFIGURATION = {
  X: {
    LEFT: 'rta__autocomplete--left',
    RIGHT: 'rta__autocomplete--right',
  },
  Y: {
    TOP: 'rta__autocomplete--top',
    BOTTOM: 'rta__autocomplete--bottom',
  },
} as const;

const errorMessage = (message: string): void => {
  console.error(
    `RTA: dataProvider fails: ${message}
    \nCheck the documentation or create issue if you think it's bug. https://github.com/webscopeio/react-textarea-autocomplete/issues`
  );
};

const reservedRegexChars = ['.', '^', '$', '*', '+', '-', '?', '(', ')', '[', ']', '{', '}', '\\', '|'];

const escapeRegex = (text: string): string =>
  [...text]
    .map((character) => (reservedRegexChars.includes(character) ? `\\${character}` : character))
    .join('');

// Autocomplete positioning component
interface AutocompleteProps {
  style?: React.CSSProperties;
  className?: string;
  innerRef: (ref: HTMLDivElement | null) => void;
  boundariesElement: string | HTMLElement;
  top: number | null;
  left: number | null;
  children: React.ReactNode;
  textareaRef: HTMLTextAreaElement;
  renderToBody?: boolean;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  style,
  className,
  innerRef,
  boundariesElement,
  top,
  left,
  children,
  textareaRef,
  renderToBody,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const containerElemRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof boundariesElement === 'string') {
      const elem = document.querySelector(boundariesElement);
      if (!elem) {
        throw new Error(
          'RTA: Invalid prop boundariesElement: it has to be string or HTMLElement.'
        );
      }
      containerElemRef.current = elem as HTMLElement;
    } else if (boundariesElement instanceof HTMLElement) {
      containerElemRef.current = boundariesElement;
    } else {
      throw new Error(
        'RTA: Invalid prop boundariesElement: it has to be string or HTMLElement.'
      );
    }

    if (
      !containerElemRef.current ||
      !ref.current ||
      !containerElemRef.current.contains(ref.current)
    ) {
      if (process.env.NODE_ENV !== 'test') {
        throw new Error(
          'RTA: Invalid prop boundariesElement: it has to be one of the parents of the RTA.'
        );
      }
    }
  }, [boundariesElement]);

  useEffect(() => {
    if (!ref.current || !containerElemRef.current) return;

    const topPos = top || 0;
    const leftPos = left || 0;
    const usedClasses: string[] = [];
    const unusedClasses: string[] = [];

    let topPosition = 0;
    let leftPosition = 0;

    const containerBounds = containerElemRef.current.getBoundingClientRect();
    const dropdownBounds = ref.current.getBoundingClientRect();
    const textareaBounds = textareaRef.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(ref.current);

    const marginTop = parseInt(computedStyle.getPropertyValue('margin-top'), 10);
    const marginBottom = parseInt(computedStyle.getPropertyValue('margin-bottom'), 10);
    const marginLeft = parseInt(computedStyle.getPropertyValue('margin-left'), 10);
    const marginRight = parseInt(computedStyle.getPropertyValue('margin-right'), 10);

    const dropdownBottom =
      marginTop + marginBottom + textareaBounds.top + topPos + dropdownBounds.height;
    const dropdownRight =
      marginLeft + marginRight + textareaBounds.left + leftPos + dropdownBounds.width;

    if (
      dropdownRight > containerBounds.right &&
      textareaBounds.left + leftPos > dropdownBounds.width
    ) {
      leftPosition = leftPos - dropdownBounds.width;
      usedClasses.push(POSITION_CONFIGURATION.X.LEFT);
      unusedClasses.push(POSITION_CONFIGURATION.X.RIGHT);
    } else {
      leftPosition = leftPos;
      usedClasses.push(POSITION_CONFIGURATION.X.RIGHT);
      unusedClasses.push(POSITION_CONFIGURATION.X.LEFT);
    }

    if (
      dropdownBottom > containerBounds.bottom &&
      textareaBounds.top + topPos > dropdownBounds.height
    ) {
      topPosition = topPos - dropdownBounds.height;
      usedClasses.push(POSITION_CONFIGURATION.Y.TOP);
      unusedClasses.push(POSITION_CONFIGURATION.Y.BOTTOM);
    } else {
      topPosition = topPos;
      usedClasses.push(POSITION_CONFIGURATION.Y.BOTTOM);
      unusedClasses.push(POSITION_CONFIGURATION.Y.TOP);
    }

    if (renderToBody) {
      topPosition += textareaBounds.top;
      leftPosition += textareaBounds.left;
    }

    ref.current.style.top = `${topPosition}px`;
    ref.current.style.left = `${leftPosition}px`;

    ref.current.classList.remove(...unusedClasses);
    ref.current.classList.add(...usedClasses);
  }, [top, left, textareaRef, renderToBody]);

  const autocompleteContainer = (
    <div
      ref={(r) => {
        ref.current = r;
        innerRef(r);
      }}
      className={`rta__autocomplete ${className || ''}`}
      style={style}
    >
      {children}
    </div>
  );

  const body = document.body;
  return renderToBody && body !== null
    ? ReactDOM.createPortal(autocompleteContainer, body)
    : autocompleteContainer;
};

// Main component
export interface ReactTextareaAutocompleteHandle {
  getCaretPosition: () => number;
  setCaretPosition: (position: number) => void;
  getSelectionPosition: () => { selectionStart: number; selectionEnd: number } | null;
  getSelectedText: () => string | null;
}

const ReactTextareaAutocomplete = forwardRef<ReactTextareaAutocompleteHandle, TextareaProps>(
  (props, ref) => {
    const {
      loadingComponent: Loader,
      trigger,
      value: controlledValue,
      minChar = 1,
      onChange,
      onSelect,
      onBlur,
      onClick,
      onCaretPositionChange,
      onItemHighlighted,
      onItemSelected,
      innerRef,
      scrollToItem = true,
      movePopupAsYouType = false,
      boundariesElement = 'body',
      textAreaComponent = 'textarea',
      renderToBody = false,
      style,
      className,
      listStyle,
      itemStyle,
      containerStyle,
      containerClassName,
      loaderStyle,
      loaderClassName,
      listClassName,
      itemClassName,
      dropdownStyle,
      dropdownClassName,
      ...restProps
    } = props;

    // Validate required props
    if (!Loader) {
      throw new Error('RTA: loadingComponent is not defined');
    }
    if (!trigger) {
      throw new Error('RTA: trigger is not defined');
    }

    // State
    const [state, setState] = useState({
      top: null as number | null,
      left: null as number | null,
      currentTrigger: null as string | null,
      actualToken: '',
      data: null as Array<Record<string, unknown> | string> | null,
      value: controlledValue || '',
      dataLoading: false,
      selectionEnd: 0,
      component: null as React.ComponentType<{ selected: boolean; entity: Record<string, unknown> | string }> | null,
      textToReplace: null as OutputType | null,
    });

    // Refs
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const tokenRegExpRef = useRef<RegExp | null>(null);
    const tokenRegExpEndingRef = useRef<RegExp | null>(null);
    const lastTriggerRef = useRef<number>(0);
    const lastValueBubbledEventRef = useRef<string>('');
    const escListenerRef = useRef<number | null>(null);

    // Create RegExp for triggers
    const createRegExp = useCallback(() => {
      const sortedTriggers = Object.keys(trigger).sort((a, b) => {
        if (a < b) return 1;
        if (a > b) return -1;
        return 0;
      });

      const escapedTriggers = sortedTriggers.map((a) => escapeRegex(a)).join('|');

      tokenRegExpRef.current = new RegExp(`(${escapedTriggers})((?:(?!\\1)[^\\s])*$)`);
      tokenRegExpEndingRef.current = new RegExp(`(${escapedTriggers})$`);
    }, [trigger]);

    // Initialize RegExp
    useEffect(() => {
      createRegExp();
    }, [createRegExp]);

    // ESC listener management
    const escListenerDestroy = useCallback(() => {
      if (escListenerRef.current !== null) {
        Listeners.remove(escListenerRef.current);
        escListenerRef.current = null;
      }
    }, []);

    const closeAutocomplete = useCallback(() => {
      const currentTrigger = state.currentTrigger;
      escListenerDestroy();
      setState((prev) => ({
        ...prev,
        data: null,
        dataLoading: false,
        currentTrigger: null,
      }));

      if (currentTrigger && onItemHighlighted) {
        onItemHighlighted({ currentTrigger, item: null });
      }
    }, [state.currentTrigger, escListenerDestroy, onItemHighlighted]);

    const escListenerInit = useCallback(() => {
      if (!escListenerRef.current) {
        escListenerRef.current = Listeners.add(KEY_CODES.ESC, closeAutocomplete);
      }
    }, [closeAutocomplete]);

    // Public API methods
    const getCaretPosition = useCallback((): number => {
      if (!textareaRef.current) return 0;
      return textareaRef.current.selectionEnd;
    }, []);

    const setCaretPosition = useCallback((position: number = 0): void => {
      if (!textareaRef.current) return;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(position, position);
    }, []);

    const getSelectionPosition = useCallback((): {
      selectionStart: number;
      selectionEnd: number;
    } | null => {
      if (!textareaRef.current) return null;
      return {
        selectionStart: textareaRef.current.selectionStart,
        selectionEnd: textareaRef.current.selectionEnd,
      };
    }, []);

    const getSelectedText = useCallback((): string | null => {
      if (!textareaRef.current) return null;
      const { selectionStart, selectionEnd } = textareaRef.current;
      if (selectionStart === selectionEnd) return null;
      return state.value.substring(selectionStart, selectionEnd);
    }, [state.value]);

    // Expose public methods via ref
    useImperativeHandle(
      ref,
      () => ({
        getCaretPosition,
        setCaretPosition,
        getSelectionPosition,
        getSelectedText,
      }),
      [getCaretPosition, setCaretPosition, getSelectionPosition, getSelectedText]
    );

    // Helper functions
    const getCurrentTriggerSettings = useCallback((): SettingType | null => {
      if (!state.currentTrigger) return null;
      return trigger[state.currentTrigger] || null;
    }, [state.currentTrigger, trigger]);

    const getSuggestions = useCallback((): Array<Record<string, unknown> | string> | null => {
      if (!state.currentTrigger || !state.data || state.data.length === 0) return null;
      return state.data;
    }, [state.currentTrigger, state.data]);

    const isAutocompleteOpen = useCallback((): boolean => {
      const suggestionData = getSuggestions();
      return !!((state.dataLoading || suggestionData) && state.currentTrigger);
    }, [state.dataLoading, state.currentTrigger, getSuggestions]);

    const getTextToReplace = useCallback(
      (currentTrigger: string): OutputType | null => {
        const triggerSettings = trigger[currentTrigger];
        if (!currentTrigger || !triggerSettings) return null;

        const { output } = triggerSettings;

        return (item: Record<string, unknown> | string) => {
          if (typeof item === 'object' && (!output || typeof output !== 'function')) {
            throw new Error(
              'Output functor is not defined! If you are using items as object you have to define "output" function. https://github.com/webscopeio/react-textarea-autocomplete#trigger-type'
            );
          }

          if (output) {
            const textToReplace = output(item, currentTrigger);

            if (textToReplace === undefined || typeof textToReplace === 'number') {
              throw new Error(
                `Output functor should return string or object in shape {text: string, caretPosition: string | number}.\nGot "${String(
                  textToReplace
                )}". Check the implementation for trigger "${currentTrigger}"\n\nSee https://github.com/webscopeio/react-textarea-autocomplete#trigger-type for more information.\n`
              );
            }

            if (textToReplace === null) return null;

            if (typeof textToReplace === 'string') {
              return {
                text: textToReplace,
                caretPosition: DEFAULT_CARET_POSITION,
                key: null,
              };
            }

            if (!textToReplace.text || typeof textToReplace.text !== 'string') {
              throw new Error(
                `Output "text" is not defined! Object should has shape {text: string, caretPosition: string | number}. Check the implementation for trigger "${currentTrigger}"\n`
              );
            }

            if (!textToReplace.caretPosition) {
              throw new Error(
                `Output "caretPosition" is not defined! Object should has shape {text: string, caretPosition: string | number}. Check the implementation for trigger "${currentTrigger}"\n`
              );
            }

            return textToReplace;
          }

          if (typeof item !== 'string') {
            throw new Error('Output item should be string\n');
          }

          return {
            text: `${currentTrigger}${item}${currentTrigger}`,
            caretPosition: DEFAULT_CARET_POSITION,
            key: null,
          };
        };
      },
      [trigger]
    );

    const getValuesFromProvider = useCallback(() => {
      const { currentTrigger, actualToken } = state;
      const triggerSettings = getCurrentTriggerSettings();

      if (!currentTrigger || !triggerSettings) return;

      const { dataProvider, component } = triggerSettings;

      if (typeof dataProvider !== 'function') {
        throw new Error('Trigger provider has to be a function!');
      }

      setState((prev) => ({ ...prev, dataLoading: true }));

      let providedData = dataProvider(actualToken);

      if (!(providedData instanceof Promise)) {
        providedData = Promise.resolve(providedData);
      }

      providedData
        .then((data) => {
          if (!Array.isArray(data)) {
            throw new Error('Trigger provider has to provide an array!');
          }

          if (typeof component !== 'function') {
            throw new Error('Component should be defined!');
          }

          // Ignore if trigger changed
          if (currentTrigger !== state.currentTrigger) return;

          if (!data.length) {
            closeAutocomplete();
            return;
          }

          setState((prev) => ({
            ...prev,
            dataLoading: false,
            data,
            component,
          }));
        })
        .catch((e) => errorMessage(e.message));
    }, [state, getCurrentTriggerSettings, closeAutocomplete]);

    const handleItemSelect = useCallback(
      (item: Record<string, unknown> | string): void => {
        const { selectionEnd, currentTrigger, value: textareaValue } = state;

        if (!currentTrigger) return;

        const getTextToReplaceForCurrentTrigger = getTextToReplace(currentTrigger);

        if (!getTextToReplaceForCurrentTrigger) {
          closeAutocomplete();
          return;
        }

        const newToken = getTextToReplaceForCurrentTrigger(item);

        if (!newToken) {
          closeAutocomplete();
          return;
        }

        if (onItemSelected) {
          onItemSelected({ currentTrigger, item });
        }

        const computeCaretPosition = (
          position: CaretPositionType,
          token: string,
          startToken: number
        ): number => {
          switch (position) {
            case 'start':
              return startToken;
            case 'next':
            case 'end':
              return startToken + token.length;
            default:
              if (!Number.isInteger(position)) {
                throw new Error(
                  'RTA: caretPosition should be "start", "next", "end" or number.'
                );
              }
              return position;
          }
        };

        const textToModify = textareaValue.slice(0, selectionEnd);
        const escapedCurrentTrigger = escapeRegex(currentTrigger);
        const triggerOffset = textToModify.length - textToModify.lastIndexOf(currentTrigger);
        const startOfTokenPosition =
          textToModify.search(new RegExp(`(?!${escapedCurrentTrigger})$`)) - triggerOffset;

        const newTokenString =
          newToken.caretPosition === 'next' ? `${newToken.text} ` : newToken.text;

        const newCaretPosition = computeCaretPosition(
          newToken.caretPosition,
          newTokenString,
          startOfTokenPosition
        );

        const modifiedText = textToModify.substring(0, startOfTokenPosition) + newTokenString;
        const newValue = textareaValue.replace(textToModify, modifiedText);

        setState((prev) => ({ ...prev, value: newValue, dataLoading: false }));

        // Update textarea after state update
        setTimeout(() => {
          if (!textareaRef.current || !tokenRegExpEndingRef.current) return;

          const insertedTrigger = tokenRegExpEndingRef.current.exec(newTokenString);
          const insertedTriggerModifier = insertedTrigger ? insertedTrigger[0].length : 1;

          lastTriggerRef.current = newCaretPosition
            ? newCaretPosition - insertedTriggerModifier
            : newCaretPosition;

          textareaRef.current.value = newValue;
          textareaRef.current.selectionEnd = newCaretPosition;

          // Trigger change event
          const event = new CustomEvent('change', { bubbles: true });
          textareaRef.current.dispatchEvent(event);

          const scrollTop = textareaRef.current.scrollTop;
          setCaretPosition(newCaretPosition);

          if ((window as Window & { chrome?: unknown }).chrome) {
            textareaRef.current.scrollTop = scrollTop;
          }
        }, 0);
      },
      [state, getTextToReplace, closeAutocomplete, onItemSelected, setCaretPosition]
    );

    const handleCaretChange = useCallback(
      (e: Event) => {
        const cleanLastTrigger = () => {
          const beforeHandle = getCaretPosition() - 1;
          lastTriggerRef.current = lastTriggerRef.current ? beforeHandle : 0;
        };

        if (e.type === 'keydown') {
          const code = (e as KeyboardEvent).keyCode || (e as KeyboardEvent).which;
          switch (code) {
            case KEY_CODES.UP:
            case KEY_CODES.DOWN:
              if (!isAutocompleteOpen()) {
                cleanLastTrigger();
              }
              break;
            case KEY_CODES.LEFT:
            case KEY_CODES.RIGHT:
              cleanLastTrigger();
              break;
            default:
          }
          return;
        }

        cleanLastTrigger();
      },
      [getCaretPosition, isAutocompleteOpen]
    );

    const changeHandler = useCallback(
      (e?: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const { top, left } = state;

        let event = e;
        if (!event && textareaRef.current) {
          event = new CustomEvent('change', { bubbles: true }) as unknown as React.ChangeEvent<HTMLTextAreaElement>;
          textareaRef.current.dispatchEvent(event as unknown as Event);
        }

        const textarea = event?.target || textareaRef.current;
        if (!textarea) return;

        const { selectionEnd } = textarea;
        const value = textarea.value;
        lastValueBubbledEventRef.current = value;

        if (onChange && event) {
          onChange(
            new Proxy(event, {
              get(original, prop, receiver) {
                if (prop === 'target') {
                  return textarea;
                }
                return Reflect.get(original, prop, receiver);
              },
            }) as React.ChangeEvent<HTMLTextAreaElement>
          );
        }

        if (onCaretPositionChange) {
          const caretPosition = getCaretPosition();
          onCaretPositionChange(caretPosition);
        }

        setState((prev) => ({ ...prev, value }));

        const setTopLeft = () => {
          if (!textareaRef.current) return;
          const { top: newTop, left: newLeft } = getCaretCoordinates(textarea, selectionEnd);
          setState((prev) => ({
            ...prev,
            top: newTop - (textareaRef.current?.scrollTop || 0),
            left: newLeft,
          }));
        };

        const cleanLastTrigger = (triggerLength: number) => {
          lastTriggerRef.current = selectionEnd - triggerLength;
          closeAutocomplete();
          setTopLeft();
        };

        if (!tokenRegExpRef.current) return;

        if (selectionEnd <= lastTriggerRef.current) {
          const affectedTextareaValue = value.slice(0, selectionEnd);
          const newTrigger = tokenRegExpRef.current.exec(affectedTextareaValue);
          cleanLastTrigger(newTrigger ? newTrigger[0].length : 0);
        }

        const affectedTextareaValue = value.slice(lastTriggerRef.current, selectionEnd);
        let tokenMatch = tokenRegExpRef.current.exec(affectedTextareaValue);
        let lastToken = tokenMatch && tokenMatch[0];
        let currentTrigger = (tokenMatch && tokenMatch[1]) || null;
        const currentTriggerLength = currentTrigger ? currentTrigger.length - 1 : 0;

        const newTrigger = tokenRegExpEndingRef.current?.exec(affectedTextareaValue);

        if (newTrigger) {
          cleanLastTrigger(newTrigger[0].length);
        } else if (!isAutocompleteOpen()) {
          closeAutocomplete();
        }

        if (
          (!lastToken || lastToken.length <= minChar + currentTriggerLength) &&
          ((state.currentTrigger && !trigger[state.currentTrigger]?.allowWhitespace) ||
            !state.currentTrigger)
        ) {
          closeAutocomplete();
          return;
        }

        if (
          currentTrigger &&
          lastToken &&
          trigger[currentTrigger]?.afterWhitespace &&
          !/\s/.test(value[selectionEnd - lastToken.length - 1] || '') &&
          value[selectionEnd - lastToken.length - 1] !== undefined
        ) {
          closeAutocomplete();
          return;
        }

        if (state.currentTrigger && trigger[state.currentTrigger]?.allowWhitespace) {
          tokenMatch = new RegExp(`${escapeRegex(state.currentTrigger)}.*$`).exec(
            value.slice(0, selectionEnd)
          );
          lastToken = tokenMatch && tokenMatch[0];

          if (!lastToken) {
            closeAutocomplete();
            return;
          }

          currentTrigger =
            Object.keys(trigger).find(
              (a) =>
                lastToken && a.slice(0, currentTriggerLength + 1) === lastToken.slice(0, currentTriggerLength + 1)
            ) || null;
        }

        const actualToken = lastToken ? lastToken.slice(1) : '';

        if (!currentTrigger) return;

        if (
          movePopupAsYouType ||
          (top === null && left === null) ||
          state.currentTrigger !== currentTrigger
        ) {
          setTopLeft();
        }

        escListenerInit();

        const textToReplace = getTextToReplace(currentTrigger);

        setState((prev) => ({
          ...prev,
          selectionEnd,
          currentTrigger,
          textToReplace,
          actualToken,
        }));

        // Trigger data provider after state update
        setTimeout(() => {
          try {
            getValuesFromProvider();
          } catch (err) {
            errorMessage((err as Error).message);
          }
        }, 0);
      },
      [
        state,
        onChange,
        onCaretPositionChange,
        getCaretPosition,
        closeAutocomplete,
        isAutocompleteOpen,
        minChar,
        trigger,
        movePopupAsYouType,
        escListenerInit,
        getTextToReplace,
        getValuesFromProvider,
      ]
    );

    const selectHandler = useCallback(
      (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        if (onCaretPositionChange) {
          const caretPosition = getCaretPosition();
          onCaretPositionChange(caretPosition);
        }

        if (onSelect) {
          onSelect(e);
        }
      },
      [onCaretPositionChange, getCaretPosition, onSelect]
    );

    const shouldStayOpen = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>): boolean => {
        let el = e.relatedTarget as Node | null;
        if (el === null) {
          el = document.activeElement;
        }

        if (dropdownRef.current && el instanceof Node && dropdownRef.current.contains(el)) {
          return true;
        }

        return false;
      },
      []
    );

    const clickHandler = useCallback(
      (e: React.MouseEvent<HTMLTextAreaElement>): void => {
        if (onClick) {
          onClick(e);
        }

        if (shouldStayOpen(e as unknown as React.FocusEvent<HTMLTextAreaElement>)) {
          return;
        }

        closeAutocomplete();
      },
      [onClick, shouldStayOpen, closeAutocomplete]
    );

    const blurHandler = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        if (onBlur) {
          onBlur(e);
        }

        if (shouldStayOpen(e)) {
          return;
        }

        closeAutocomplete();
      },
      [onBlur, shouldStayOpen, closeAutocomplete]
    );

    const scrollHandler = useCallback(() => {
      closeAutocomplete();
    }, [closeAutocomplete]);

    const onItemHighlightedHandler = useCallback(
      (item: Record<string, unknown> | string | null) => {
        if (onItemHighlighted) {
          if (typeof onItemHighlighted === 'function') {
            onItemHighlighted({ currentTrigger: state.currentTrigger, item });
          } else {
            throw new Error('`onItemHighlighted` has to be a function');
          }
        }
      },
      [onItemHighlighted, state.currentTrigger]
    );

    const dropdownScroll = useCallback(
      (item: HTMLDivElement) => {
        if (!scrollToItem || !dropdownRef.current) return;

        if (scrollToItem === true) {
          defaultScrollToItem(dropdownRef.current, item);
          return;
        }

        if (typeof scrollToItem !== 'function' || scrollToItem.length !== 2) {
          throw new Error(
            '`scrollToItem` has to be boolean (true for default implementation) or function with two parameters: container, item.'
          );
        }

        scrollToItem(dropdownRef.current, item);
      },
      [scrollToItem]
    );

    const textareaRefCallback = useCallback(
      (ref: HTMLTextAreaElement | null) => {
        textareaRef.current = ref;
        if (innerRef) {
          innerRef(ref);
        }
      },
      [innerRef]
    );

    // Mount/unmount effects
    useEffect(() => {
      if (!textareaRef.current) return;

      Listeners.startListen(textareaRef.current);
      textareaRef.current.addEventListener('focus', handleCaretChange);
      textareaRef.current.addEventListener('click', handleCaretChange);
      textareaRef.current.addEventListener('keydown', handleCaretChange);

      return () => {
        if (!textareaRef.current) return;
        escListenerDestroy();
        Listeners.stopListen(textareaRef.current);
        textareaRef.current.removeEventListener('focus', handleCaretChange);
        textareaRef.current.removeEventListener('click', handleCaretChange);
        textareaRef.current.removeEventListener('keydown', handleCaretChange);
      };
    }, [handleCaretChange, escListenerDestroy]);

    // Handle controlled value changes
    useEffect(() => {
      if (controlledValue !== undefined && controlledValue !== null) {
        setState((prev) => ({ ...prev, value: controlledValue }));
      }
    }, [controlledValue]);

    // Handle trigger changes
    useEffect(() => {
      createRegExp();
    }, [createRegExp]);

    useEffect(() => {
      if (
        controlledValue !== undefined &&
        controlledValue !== state.value &&
        lastValueBubbledEventRef.current !== controlledValue
      ) {
        lastTriggerRef.current = 0;
        changeHandler();
      }
    }, [controlledValue, state.value, changeHandler]);

    // Clean up props for textarea
    const cleanUpProps = (): Record<string, unknown> => {
      const cleanedProps = { ...restProps } as Record<string, unknown>;
      const notSafe = [
        'loadingComponent',
        'boundariesElement',
        'containerStyle',
        'minChar',
        'scrollToItem',
        'ref',
        'innerRef',
        'onChange',
        'onCaretPositionChange',
        'className',
        'value',
        'trigger',
        'listStyle',
        'itemStyle',
        'containerStyle',
        'loaderStyle',
        'className',
        'containerClassName',
        'listClassName',
        'itemClassName',
        'loaderClassName',
        'dropdownStyle',
        'dropdownClassName',
        'movePopupAsYouType',
        'textAreaComponent',
        'renderToBody',
        'onItemSelected',
        'onItemHighlighted',
      ];

      notSafe.forEach((prop) => {
        delete cleanedProps[prop];
      });

      return cleanedProps;
    };

    const isOpen = isAutocompleteOpen();
    const suggestionData = getSuggestions();

    const extraAttrs: Record<string, unknown> = {};
    let TextAreaComponent: React.ElementType;

    if (typeof textAreaComponent === 'object' && textAreaComponent.component) {
      TextAreaComponent = textAreaComponent.component;
      extraAttrs[textAreaComponent.ref] = textareaRefCallback;
    } else {
      TextAreaComponent = textAreaComponent as React.ElementType;
      extraAttrs.ref = textareaRefCallback;
    }

    return (
      <div
        className={`rta ${state.dataLoading === true ? 'rta--loading' : ''} ${
          containerClassName || ''
        }`}
        style={containerStyle}
      >
        <TextAreaComponent
          {...cleanUpProps()}
          className={`rta__textarea ${className || ''}`}
          onChange={changeHandler}
          onSelect={selectHandler}
          onScroll={scrollHandler}
          onClick={clickHandler}
          onBlur={blurHandler}
          value={state.value}
          style={style}
          {...extraAttrs}
        />
        {isOpen && textareaRef.current && (
          <Autocomplete
            innerRef={(ref) => {
              dropdownRef.current = ref;
            }}
            top={state.top}
            left={state.left}
            style={dropdownStyle}
            className={dropdownClassName}
            boundariesElement={boundariesElement}
            textareaRef={textareaRef.current}
            renderToBody={renderToBody}
          >
            {suggestionData && state.component && state.textToReplace && (
              <List
                values={suggestionData}
                component={state.component}
                style={listStyle}
                className={listClassName}
                itemClassName={itemClassName}
                itemStyle={itemStyle}
                getTextToReplace={state.textToReplace}
                onItemHighlighted={onItemHighlightedHandler}
                onSelect={handleItemSelect}
                closeAutocomplete={closeAutocomplete}
                dropdownScroll={dropdownScroll}
              />
            )}
            {state.dataLoading && (
              <div
                className={`rta__loader ${
                  suggestionData !== null
                    ? 'rta__loader--suggestion-data'
                    : 'rta__loader--empty-suggestion-data'
                } ${loaderClassName || ''}`}
                style={loaderStyle}
              >
                <Loader data={suggestionData} />
              </div>
            )}
          </Autocomplete>
        )}
      </div>
    );
  }
);

ReactTextareaAutocomplete.displayName = 'ReactTextareaAutocomplete';

export default ReactTextareaAutocomplete;

