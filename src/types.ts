import { ComponentType, SyntheticEvent } from 'react';

export type CaretPositionType = 'start' | 'end' | 'next' | number;

export type TextToReplaceType = {
  text: string;
  caretPosition: CaretPositionType;
  key?: string | null;
} | null;

export type OutputType = (
  item: Record<string, unknown> | string,
  trigger?: string
) => TextToReplaceType;

export type DataProviderType = (
  token: string
) => Promise<Array<Record<string, unknown> | string>> | Array<Record<string, unknown> | string>;


/**
 * Textarea Types
 */
export interface SettingType {
  component: ComponentType<{
    selected: boolean;
    entity: Record<string, unknown> | string;
  }>;
  dataProvider: DataProviderType;
  allowWhitespace?: boolean;
  afterWhitespace?: boolean;
  output?: (
    item: Record<string, unknown> | string,
    trigger?: string
  ) => TextToReplaceType | string;
}

export type TriggerType = {
  [key: string]: SettingType;
};

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'onSelect'> {
  trigger: TriggerType;
  loadingComponent: ComponentType<{ data: Array<Record<string, unknown> | string> | null }>;
  textAreaComponent?:
    | string
    | {
        component: ComponentType<Record<string, unknown>>;
        ref: string;
      };
  onChange?: (e: SyntheticEvent | Event) => void;
  onSelect?: (e: SyntheticEvent | Event) => void;
  onBlur?: (e: SyntheticEvent | Event) => void;
  onClick?: (e: SyntheticEvent | Event) => void;
  onCaretPositionChange?: (position: number) => void;
  innerRef?: (ref: HTMLTextAreaElement | null) => void;
  scrollToItem?: boolean | ((container: HTMLDivElement, item: HTMLDivElement) => void);
  closeOnClickOutside?: boolean;
  onItemHighlighted?: (data: {
    currentTrigger: string | null;
    item: Record<string, unknown> | string | null;
  }) => void;
  onItemSelected?: (data: {
    currentTrigger: string;
    item: Record<string, unknown> | string;
  }) => void;
  movePopupAsYouType?: boolean;
  boundariesElement?: string | HTMLElement;
  minChar?: number;
  value?: string;
  style?: React.CSSProperties;
  listStyle?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  loaderStyle?: React.CSSProperties;
  dropdownStyle?: React.CSSProperties;
  className?: string;
  containerClassName?: string;
  listClassName?: string;
  itemClassName?: string;
  loaderClassName?: string;
  dropdownClassName?: string;
  renderToBody?: boolean;
}

