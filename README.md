# react-textarea-autocomplete 📝

Enhanced textarea to achieve autocomplete functionality in the style of GitHub.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/dw/@webscopeio/react-textarea-autocomplete.svg)](https://www.npmjs.com/package/@webscopeio/react-textarea-autocomplete)

---

## ✨ Features

- 🎯 **GitHub-style autocomplete** - Familiar UX pattern
- ⚡ **TypeScript** - Full type safety and IntelliSense support
- ⚛️ **React 18** - Built with modern React hooks
- 🎨 **Customizable** - Style everything to match your design
- 📦 **Lightweight** - Minimal dependencies
- 🔧 **Flexible triggers** - Support for multiple trigger characters
- 🎭 **Portal rendering** - Render dropdown anywhere in the DOM
- ♿ **Accessible** - Keyboard navigation support

---

## 📦 Installation

```bash
npm install @webscopeio/react-textarea-autocomplete
# or
yarn add @webscopeio/react-textarea-autocomplete
```

**Requirements:**
- React 18+
- TypeScript 5+ (if using TypeScript)

---

## 🚀 Quick Start

```tsx
import React from 'react';
import ReactTextareaAutocomplete from '@webscopeio/react-textarea-autocomplete';
import '@webscopeio/react-textarea-autocomplete/style.css';

const Item = ({ entity: { name, char } }) => <div>{`${name}: ${char}`}</div>;
const Loading = () => <div>Loading...</div>;

function App() {
  return (
    <ReactTextareaAutocomplete
      loadingComponent={Loading}
      trigger={{
        ':': {
          dataProvider: (token) => {
            // Return array of suggestions or Promise
            return [
              { name: 'smile', char: '😊' },
              { name: 'heart', char: '❤️' },
            ].filter((item) => item.name.includes(token));
          },
          component: Item,
          output: (item) => item.char,
        },
      }}
    />
  );
}
```

---

## 📖 API Reference

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `trigger` | `TriggerType` | ✅ Yes | - | Define triggers and their behavior |
| `loadingComponent` | `React.ComponentType` | ✅ Yes | - | Component shown while loading suggestions |
| `minChar` | `number` | No | `1` | Minimum characters to trigger autocomplete |
| `value` | `string` | No | - | Controlled value |
| `onChange` | `(e: Event) => void` | No | - | Change handler |
| `onSelect` | `(e: Event) => void` | No | - | Select handler |
| `onBlur` | `(e: Event) => void` | No | - | Blur handler |
| `onClick` | `(e: Event) => void` | No | - | Click handler |
| `onCaretPositionChange` | `(position: number) => void` | No | - | Caret position change handler |
| `onItemHighlighted` | `(data) => void` | No | - | Called when item is highlighted |
| `onItemSelected` | `(data) => void` | No | - | Called when item is selected |
| `innerRef` | `(ref: HTMLTextAreaElement) => void` | No | - | Get textarea ref |
| `scrollToItem` | `boolean \| function` | No | `true` | Auto-scroll behavior |
| `movePopupAsYouType` | `boolean` | No | `false` | Move popup with caret |
| `boundariesElement` | `string \| HTMLElement` | No | `'body'` | Boundary for dropdown positioning |
| `textAreaComponent` | `string \| object` | No | `'textarea'` | Custom textarea component |
| `renderToBody` | `boolean` | No | `false` | Render dropdown in body |
| `style` | `React.CSSProperties` | No | - | Textarea styles |
| `className` | `string` | No | - | Textarea className |
| `containerStyle` | `React.CSSProperties` | No | - | Container styles |
| `containerClassName` | `string` | No | - | Container className |
| `listStyle` | `React.CSSProperties` | No | - | List styles |
| `listClassName` | `string` | No | - | List className |
| `itemStyle` | `React.CSSProperties` | No | - | Item styles |
| `itemClassName` | `string` | No | - | Item className |
| `loaderStyle` | `React.CSSProperties` | No | - | Loader styles |
| `loaderClassName` | `string` | No | - | Loader className |
| `dropdownStyle` | `React.CSSProperties` | No | - | Dropdown styles |
| `dropdownClassName` | `string` | No | - | Dropdown className |

### Trigger Type

```typescript
type TriggerType = {
  [triggerChar: string]: {
    // Function that returns suggestions
    dataProvider: (token: string) => Promise<Array<any>> | Array<any>;
    
    // Component to render each suggestion
    component: React.ComponentType<{
      selected: boolean;
      entity: any;
    }>;
    
    // Optional: Transform selected item to text
    output?: (item: any, trigger?: string) => string | {
      text: string;
      caretPosition: 'start' | 'end' | 'next' | number;
    };
    
    // Optional: Allow whitespace in tokens
    allowWhitespace?: boolean;
    
    // Optional: Require whitespace before trigger
    afterWhitespace?: boolean;
  };
};
```

### Methods (via ref)

```typescript
const ref = useRef<ReactTextareaAutocompleteHandle>(null);

// Get current caret position
const position = ref.current?.getCaretPosition();

// Set caret position
ref.current?.setCaretPosition(10);

// Get selection range
const selection = ref.current?.getSelectionPosition();

// Get selected text
const text = ref.current?.getSelectedText();
```

---

## 💡 Examples

### Emoji Autocomplete

```tsx
const emojiData = [
  { name: 'smile', char: '😊' },
  { name: 'heart', char: '❤️' },
  { name: 'fire', char: '🔥' },
  { name: 'rocket', char: '🚀' },
  // ... more emojis
];

<ReactTextareaAutocomplete
  loadingComponent={Loading}
  trigger={{
    ':': {
      dataProvider: (token) =>
        emojiData.filter((emoji) => emoji.name.includes(token.toLowerCase())),
      component: ({ entity: { name, char } }) => (
        <div>{`${name}: ${char}`}</div>
      ),
      output: (item) => item.char,
    },
  }}
/>
```

### Mention Autocomplete

```tsx
<ReactTextareaAutocomplete
  loadingComponent={Loading}
  trigger={{
    '@': {
      dataProvider: async (token) => {
        const response = await fetch(`/api/users?search=${token}`);
        return response.json();
      },
      component: ({ entity: { username, avatar } }) => (
        <div>
          <img src={avatar} alt={username} />
          <span>@{username}</span>
        </div>
      ),
      output: (item) => `@${item.username}`,
    },
  }}
/>
```

### Multiple Triggers

```tsx
<ReactTextareaAutocomplete
  loadingComponent={Loading}
  trigger={{
    ':': {
      dataProvider: getEmojis,
      component: EmojiItem,
      output: (item) => item.char,
    },
    '@': {
      dataProvider: getUsers,
      component: UserItem,
      output: (item) => `@${item.username}`,
    },
    '#': {
      dataProvider: getHashtags,
      component: HashtagItem,
      output: (item) => `#${item.tag}`,
    },
  }}
/>
```

### Custom Caret Position

```tsx
trigger={{
  ':': {
    dataProvider: getEmojis,
    component: EmojiItem,
    output: (item) => ({
      text: item.char,
      caretPosition: 'end', // 'start' | 'end' | 'next' | number
    }),
  },
}}
```

---

## 🎨 Styling

Import the default styles:

```tsx
import '@webscopeio/react-textarea-autocomplete/style.css';
```

Or customize with your own CSS:

```css
.rta {
  /* Container */
}

.rta__textarea {
  /* Textarea */
}

.rta__autocomplete {
  /* Dropdown container */
}

.rta__list {
  /* Suggestion list */
}

.rta__item {
  /* Individual item */
}

.rta__item--selected {
  /* Selected item */
}

.rta__loader {
  /* Loading indicator */
}
```

---

## 🔧 TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import ReactTextareaAutocomplete, {
  ReactTextareaAutocompleteHandle,
  TriggerType,
  TextareaProps,
} from '@webscopeio/react-textarea-autocomplete';

const ref = useRef<ReactTextareaAutocompleteHandle>(null);

const trigger: TriggerType = {
  ':': {
    dataProvider: (token: string) => Promise<Array<Emoji>>,
    component: EmojiComponent,
    output: (item: Emoji) => item.char,
  },
};
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT © [Jakub Beneš](https://jukben.cz)

---

## 🙏 Acknowledgments

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification.

---

## 📚 Resources

- [GitHub Repository](https://github.com/webscopeio/react-textarea-autocomplete)
- [npm Package](https://www.npmjs.com/package/@webscopeio/react-textarea-autocomplete)
- [Issue Tracker](https://github.com/webscopeio/react-textarea-autocomplete/issues)
