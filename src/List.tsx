import React, { useState, useEffect, useRef, useCallback, ComponentType } from 'react';
import Listeners, { KEY_CODES } from './listener';
import Item from './Item';
import { OutputType } from './types';


interface ListProps {
  values: Array<Record<string, unknown> | string>;
  component: ComponentType<{
    selected: boolean;
    entity: Record<string, unknown> | string;
  }>;
  getTextToReplace: OutputType;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  className?: string;
  itemClassName?: string;
  onItemHighlighted: (item: Record<string, unknown> | string) => void;
  onSelect: (item: Record<string, unknown> | string) => void;
  dropdownScroll: (item: HTMLDivElement) => void;
  closeAutocomplete: () => void;
}

const List: React.FC<ListProps> = ({
  values,
  component,
  style,
  itemClassName,
  className,
  itemStyle,
  getTextToReplace,
  onItemHighlighted,
  onSelect,
  dropdownScroll,
  closeAutocomplete,
}) => {
  const [selectedItem, setSelectedItem] = useState<Record<string, unknown> | string | null>(null);
  const listenersRef = useRef<number[]>([]);
  const cachedIdOfItemsRef = useRef<Map<Record<string, unknown> | string, string>>(new Map());
  const itemsRef = useRef<Record<string, HTMLDivElement>>({});

  const getId = useCallback(
    (item: Record<string, unknown> | string): string => {
      if (cachedIdOfItemsRef.current.has(item)) {
        return cachedIdOfItemsRef.current.get(item)!;
      }

      const textToReplace = getTextToReplace(item);

      const computeId = (): string => {
        if (textToReplace) {
          if (textToReplace.key) {
            return textToReplace.key;
          }

          if (typeof item === 'string' || !(item as Record<string, unknown>).key) {
            return textToReplace.text;
          }
        }

        if (typeof item === 'object' && !(item as Record<string, unknown>).key) {
          throw new Error(`Item ${JSON.stringify(item)} has to have defined "key" property`);
        }

        return (item as Record<string, unknown>).key as string;
      };

      const id = computeId();
      cachedIdOfItemsRef.current.set(item, id);

      return id;
    },
    [getTextToReplace]
  );

  const getPositionInList = useCallback((): number => {
    if (!selectedItem) return 0;
    return values.findIndex((a) => getId(a) === getId(selectedItem));
  }, [values, selectedItem, getId]);

  const modifyText = useCallback(
    (value: Record<string, unknown> | string, event?: React.MouseEvent) => {
      if (!value) return;
      
      if (event && event.button === 0) {
        closeAutocomplete();
        return;
      }
      
      setSelectedItem(value);
      onItemHighlighted(value);
      onSelect(value);
    },
    [onSelect, onItemHighlighted, closeAutocomplete, setSelectedItem]
  );

  const onPressEnter = useCallback(
    (e: Event) => {
      if (typeof e !== 'undefined') {
        e.preventDefault();
      }
      const item = values[getPositionInList()];
      if (item !== undefined) {
        modifyText(item);
      }
    },
    [values, getPositionInList, modifyText]
  );

  const selectItem = useCallback(
    (item: Record<string, unknown> | string, keyboard: boolean = false) => {
      if (selectedItem === item) return;
      setSelectedItem(item);
      onItemHighlighted(item);

      if (keyboard) {
        const itemElement = itemsRef.current[getId(item)];
        if (itemElement) {
          dropdownScroll(itemElement);
        }
      }
    },
    [selectedItem, onItemHighlighted, dropdownScroll, getId]
  );

  const scroll = useCallback(
    (e: Event) => {
      e.preventDefault();

      const keyboardEvent = e as KeyboardEvent;
      const code = keyboardEvent.keyCode || keyboardEvent.which;
      const oldPosition = getPositionInList();
      let newPosition: number;

      switch (code) {
        case KEY_CODES.DOWN:
          newPosition = oldPosition + 1;
          break;
        case KEY_CODES.UP:
          newPosition = oldPosition - 1;
          break;
        default:
          newPosition = oldPosition;
          break;
      }

      newPosition = ((newPosition % values.length) + values.length) % values.length;
      const isUpOrDown = (code === KEY_CODES.DOWN || code === KEY_CODES.UP);
      const newItem = values[newPosition];
      if (newItem !== undefined) {
        selectItem(newItem, isUpOrDown);
      }
    },
    [values, getPositionInList, selectItem]
  );

  const isSelected = useCallback(
    (item: Record<string, unknown> | string): boolean => {
      if (!selectedItem) return false;
      return getId(selectedItem) === getId(item);
    },
    [selectedItem, getId]
  );

  // componentDidMount
  useEffect(() => {
    const listeners = listenersRef.current;
    listeners.push(
      Listeners.add([KEY_CODES.DOWN, KEY_CODES.UP], scroll),
      Listeners.add([KEY_CODES.ENTER, KEY_CODES.TAB], onPressEnter)
    );

    if (values && values[0]) {
      selectItem(values[0]);
    }

    // componentWillUnmount
    return () => {
      let listener: number | undefined;
      while (listeners.length) {
        listener = listeners.pop();
        if (listener !== undefined) {
          Listeners.remove(listener);
        }
      }
    };
  }, [scroll, onPressEnter, selectItem, values]);

  // componentDidUpdate - handle values change
  useEffect(() => {
    if (values && values[0]) {
      selectItem(values[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.map((val) => getId(val)).join('')]);

  return (
    <ul className={`rta__list ${className || ''}`} style={style}>
      {values.map((item) => (
        <Item
          key={getId(item)}
          innerRef={(ref: HTMLDivElement) => {
            itemsRef.current[getId(item)] = ref;
          }}
          selected={isSelected(item)}
          item={item}
          className={itemClassName}
          style={itemStyle}
          onClickHandler={modifyText}
          onSelectHandler={selectItem}
          component={component}
        />
      ))}
    </ul>
  );
};

export default List;

