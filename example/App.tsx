import React, { useState, useRef } from 'react';
import ReactTextareaAutocomplete, {
  ReactTextareaAutocompleteHandle,
} from '../src/index';
import '../style.css';

// Simple emoji data for demo
const emojiData = [
  { name: 'smile', char: '😊' },
  { name: 'heart', char: '❤️' },
  { name: 'thumbsup', char: '👍' },
  { name: 'fire', char: '🔥' },
  { name: 'rocket', char: '🚀' },
  { name: 'star', char: '⭐' },
  { name: 'check', char: '✅' },
  { name: 'tada', char: '🎉' },
  { name: 'eyes', char: '👀' },
  { name: 'thinking', char: '🤔' },
  { name: 'laugh', char: '😂' },
  { name: 'cool', char: '😎' },
  { name: 'party', char: '🥳' },
  { name: 'love', char: '😍' },
  { name: 'clap', char: '👏' },
  { name: 'wave', char: '👋' },
  { name: 'trophy', char: '🏆' },
  { name: 'muscle', char: '💪' },
  { name: 'brain', char: '🧠' },
  { name: 'sparkles', char: '✨' },
];

interface ItemProps {
  entity: Record<string, unknown> | string;
  selected: boolean;
}

const Item: React.FC<ItemProps> = ({ entity }) => {
  if (typeof entity === 'string') {
    return <div>{entity}</div>;
  }
  const name = entity.name as string;
  const char = entity.char as string;
  return <div>{`${name}: ${char}`}</div>;
};

interface LoadingProps {
  data: Array<Record<string, unknown> | string> | null;
}

const Loading: React.FC<LoadingProps> = () => <div>Loading</div>;

const App: React.FC = () => {
  const [caretPosition, setCaretPosition] = useState(0);
  const [movePopupAsYouType, setMovePopupAsYouType] = useState(false);
  const [text, setText] = useState('');
  const [minChar, setMinChar] = useState(0);
  const [optionsCaret, setOptionsCaret] = useState<'start' | 'end' | 'next'>('start');
  const [actualTokenInProvider, setActualTokenInProvider] = useState('');
  const [showSecondTextarea, setShowSecondTextarea] = useState(false);
  const [renderToBody, setRenderToBody] = useState(false);

  const rtaRef = useRef<ReactTextareaAutocompleteHandle>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const outputCaretEnd = (item: any, trigger?: string) => ({
    text: item.char,
    caretPosition: 'end' as const,
  });

  const outputCaretStart = (item: any) => ({
    text: item.char,
    caretPosition: 'start' as const,
  });

  const outputCaretNext = (item: any) => ({
    text: item.char,
    caretPosition: 'next' as const,
  });

  const outputCaretDefault = (item: any) => item.char;

  const handleSetCaretPosition = () => {
    rtaRef.current?.setCaretPosition(1);
  };

  const handleGetCaretPosition = () => {
    const pos = rtaRef.current?.getCaretPosition();
    alert(pos);
  };

  const handleGetSelectionPosition = () => {
    const pos = rtaRef.current?.getSelectionPosition();
    alert(JSON.stringify(pos));
  };

  const handleGetSelectedText = () => {
    const text = rtaRef.current?.getSelectedText();
    alert(text);
  };

  const handleFocus = () => {
    textareaRef.current?.focus();
  };

  const handleChangeValueTo = () => {
    setText(':troph');
  };

  return (
    <div>
      <div>
        <input
          data-test="caretStart"
          name="caret"
          value="start"
          type="radio"
          checked={optionsCaret === 'start'}
          onChange={() => setOptionsCaret('start')}
        />
        <label htmlFor="caretStart">Place caret before word</label>

        <input
          data-test="caretEnd"
          name="caret"
          value="end"
          type="radio"
          checked={optionsCaret === 'end'}
          onChange={() => setOptionsCaret('end')}
        />
        <label htmlFor="caretEnd">Place caret after word</label>

        <input
          data-test="caretNext"
          name="caret"
          value="next"
          type="radio"
          checked={optionsCaret === 'next'}
          onChange={() => setOptionsCaret('next')}
        />
        <label htmlFor="caretNext">Place caret after word with a space</label>
      </div>
      <div>
        <label>
          <input
            data-test="showSecondTextarea"
            type="checkbox"
            checked={showSecondTextarea}
            onChange={() => setShowSecondTextarea(!showSecondTextarea)}
          />
          Show second textarea
        </label>
      </div>
      <div>
        <label>
          <input
            data-test="movePopupAsYouType"
            type="checkbox"
            checked={movePopupAsYouType}
            onChange={() => setMovePopupAsYouType(!movePopupAsYouType)}
          />
          Move popup as you type
        </label>
      </div>
      <div>
        <label>
          <input
            data-test="renderToBody"
            type="checkbox"
            checked={renderToBody}
            onChange={() => setRenderToBody(!renderToBody)}
          />
          Render autocomplete to body
        </label>
      </div>
      <div>
        <label>
          <input
            data-test="minChar"
            type="number"
            value={minChar}
            onChange={(e) => setMinChar(+e.target.value)}
          />
          Minimal characters typed to trigger autocomplete
        </label>
      </div>
      <div>
        Actual caret position: <span data-test="actualCaretPosition">{caretPosition}</span>
      </div>
      <button data-test="setCaretPosition" onClick={handleSetCaretPosition}>
        setCaretPosition(1);
      </button>
      <button data-test="getCaretPosition" onClick={handleGetCaretPosition}>
        getCaretPosition();
      </button>
      <button data-test="getSelectionPosition" onClick={handleGetSelectionPosition}>
        getSelectionPosition();
      </button>
      <button data-test="getSelectedText" onClick={handleGetSelectedText}>
        getSelectedText();
      </button>
      <button data-test="focus" onClick={handleFocus}>
        Focus the textarea
      </button>
      <button data-test="changeValueTo" onClick={handleChangeValueTo}>
        Change value to &quot;:troph&quot;
      </button>
      <button data-test="dummy">dummy</button>
      <div>
        Actual token in &quot;[&quot; provider:{' '}
        <span data-test="actualToken">{actualTokenInProvider}</span>
      </div>
      <ReactTextareaAutocomplete
        className="one"
        ref={rtaRef}
        innerRef={(ref) => {
          textareaRef.current = ref;
        }}
        loadingComponent={Loading}
        style={{
          padding: 5,
        }}
        containerStyle={{
          marginTop: 20,
          width: 500,
          height: 100,
          margin: '20px auto',
        }}
        movePopupAsYouType={movePopupAsYouType}
        onCaretPositionChange={setCaretPosition}
        onItemHighlighted={(info) => {
          (window as any).__lastHighlightedItem = info;
        }}
        onItemSelected={(info) => {
          (window as any).__lastSelectedItem = info;
        }}
        minChar={minChar}
        value={text}
        onChange={(e) => {
          if (e.target && 'value' in e.target) {
            setText(e.target.value as string);
          }
        }}
        renderToBody={renderToBody}
        trigger={{
          ':': {
            dataProvider: (token) =>
              emojiData.filter((emoji) => emoji.name.includes(token.toLowerCase())),
            component: Item,
            output: {
              start: outputCaretStart,
              end: outputCaretEnd,
              next: outputCaretNext,
            }[optionsCaret],
          },
          '::': {
            dataProvider: () => [{ name: 'test', char: 'test2' }],
            component: Item,
            output: {
              start: outputCaretStart,
              end: outputCaretEnd,
              next: outputCaretNext,
            }[optionsCaret],
          },
          '@': {
            dataProvider: () =>
              new Promise((res) =>
                setTimeout(() => {
                  res([{ name: 'jakub', char: 'Jakub' }]);
                }, 1000)
              ),
            component: Item,
            output: {
              start: outputCaretStart,
              end: outputCaretEnd,
              next: outputCaretDefault,
            }[optionsCaret],
          },
          '[': {
            dataProvider: (token) => {
              setActualTokenInProvider(token);
              return [
                { name: 'alt', char: '@' },
                { name: 'another character', char: '/' },
              ];
            },
            component: Item,
            allowWhitespace: true,
            output: {
              start: outputCaretStart,
              end: outputCaretEnd,
              next: outputCaretNext,
            }[optionsCaret],
          },
          ';': {
            dataProvider: () => [
              { name: '1', char: 'one' },
              { name: '2', char: 'two' },
            ],
            component: Item,
            afterWhitespace: true,
            output: {
              start: outputCaretStart,
              end: outputCaretEnd,
              next: outputCaretNext,
            }[optionsCaret],
          },
          '/': {
            dataProvider: () => [{ name: '1', char: '/kick' }],
            component: Item,
            output: outputCaretEnd,
          },
          '/kick': {
            dataProvider: () => [
              { name: '1', char: 'fred' },
              { name: '2', char: 'jeremy' },
            ],
            component: Item,
            output: outputCaretEnd,
          },
          '/filter': {
            dataProvider: (token) =>
              [
                { name: 'a', char: 'amy' },
                { name: 'b', char: 'ben' },
                { name: 'c', char: 'cheryl' },
                { name: 'd', char: 'daniel' },
                { name: 'e', char: 'emily' },
              ].filter((x) => x.name === token.slice(6) || token.length === 6),
            component: Item,
            output: outputCaretEnd,
          },
          '(': {
            dataProvider: () => [
              { name: 'country', char: 'country' },
              { name: 'person', char: 'person' },
              {
                name: 'trigger',
                char: 'trigger',
                key: 'trigger',
                type: 'trigger',
              },
            ],
            component: Item,
            output: (item: any, trigger?: string) => {
              if (item.type === 'trigger') return null;
              return {
                text: `${trigger}${item.name}`,
                caretPosition: 'end' as const,
              };
            },
          },
          '.': {
            dataProvider: () => [
              { name: 'ID', char: 'ID' },
              { name: 'name', char: 'name' },
              { name: 'someProperty', char: 'someProperty' },
            ],
            component: Item,
            output: (item: any, trigger?: string) => ({
              text: `${trigger}${item.name}`,
              caretPosition: 'end' as const,
            }),
          },
          '-': {
            dataProvider: () => [
              { name: 'f', char: '-first' },
              { name: 's', char: '-second' },
            ],
            component: Item,
            output: outputCaretEnd,
          },
        }}
      />
      {showSecondTextarea && (
        <ReactTextareaAutocomplete
          style={{
            padding: 5,
          }}
          containerStyle={{
            marginTop: 20,
            width: 400,
            height: 100,
            margin: '20px auto',
          }}
          loadingComponent={Loading}
          trigger={{
            ':': {
              dataProvider: (token) =>
                emojiData.filter((emoji) => emoji.name.includes(token.toLowerCase())),
              component: Item,
              output: {
                start: outputCaretStart,
                end: outputCaretEnd,
                next: outputCaretNext,
              }[optionsCaret],
            },
          }}
        />
      )}
    </div>
  );
};

export default App;

