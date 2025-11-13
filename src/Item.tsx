import React, { useRef, memo, ComponentType } from 'react';

interface ItemProps {
  component: ComponentType<{
    selected: boolean;
    entity: Record<string, unknown> | string;
  }>;
  onSelectHandler: (item: Record<string, unknown> | string) => void;
  item: Record<string, unknown> | string;
  style?: React.CSSProperties;
  className?: string;
  onClickHandler: (item: Record<string, unknown> | string) => void;
  selected: boolean;
  innerRef: (ref: HTMLDivElement) => void;
}

const Item: React.FC<ItemProps> = memo(
  ({ component: Component, style, onClickHandler, item, selected, className, innerRef }) => {
    const clickedRef = useRef<boolean>(false);

    const selectItem = (): void => {
      onClickHandler(item);
    };

    return (
      <li
        className={`rta__item  ${selected === true ? 'rta__item--selected' : ''} ${
          className || ''
        }`}
        style={style}
      >
        <div
          className={`rta__entity ${selected === true ? 'rta__entity--selected' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => onClickHandler(item)}
          onFocus={selectItem}
          onMouseEnter={selectItem}
          onTouchStart={() => {
            clickedRef.current = true;
            selectItem();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            if (clickedRef.current) {
              onClickHandler(item);
            }
          }}
          onTouchMove={() => {
            clickedRef.current = false;
          }}
          onTouchCancel={() => {
            clickedRef.current = false;
          }}
          ref={innerRef}
        >
          <Component selected={selected} entity={item} />
        </div>
      </li>
    );
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (don't re-render)
    return (
      prevProps.item === nextProps.item &&
      prevProps.selected === nextProps.selected &&
      prevProps.style === nextProps.style &&
      prevProps.className === nextProps.className
    );
  }
);

Item.displayName = 'Item';

export default Item;
