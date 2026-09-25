import React from 'react';

interface HighlightProps {
  code: string;
  language: string;
  searchQuery?: string;
}

export function HighlightedCode({ code, language, searchQuery }: HighlightProps) {
  const lines = code.split('\n');

  return (
    <pre className="font-mono text-[13px] leading-[1.65] text-slate-300 overflow-x-auto p-4 select-text">
      <code>
        {lines.map((line, idx) => {
          const isSearchMatch =
            searchQuery && searchQuery.trim().length > 0 && line.toLowerCase().includes(searchQuery.toLowerCase());

          return (
            <div
              key={idx}
              className={`flex items-start group hover:bg-slate-800/40 rounded px-1 -mx-1 transition-colors ${
                isSearchMatch ? 'bg-amber-500/15 ring-1 ring-amber-500/30' : ''
              }`}
            >
              {/* Line number */}
              <span
                className="w-10 shrink-0 text-right pr-4 text-slate-600 select-none tabular-nums text-xs pt-[2px] group-hover:text-slate-400"
                aria-hidden="true"
              >
                {idx + 1}
              </span>
              {/* Line content */}
              <span className="flex-1 whitespace-pre break-all">
                {renderHighlightedTokens(line, language)}
              </span>
            </div>
          );
        })}
      </code>
    </pre>
  );
}

function renderHighlightedTokens(line: string, language: string): React.ReactNode {
  if (!line) return <span> </span>;

  // Comment line check
  const trimmed = line.trimStart();
  if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
    return <span className="text-slate-500 italic">{line}</span>;
  }

  // Tokenize line using regex matcher
  // Matches: Comments, Strings, Decorators, Words, Numbers, Symbols
  const tokenRegex =
    /(#.*$)|("""[\s\S]*?"""|'''.*?'''|"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')|(@[a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*)|(\b(?:def|class|async|await|return|import|from|as|if|elif|else|for|while|try|except|finally|raise|with|yield|pass|lambda|global|nonlocal|in|is|not|and|or|True|False|None|FROM|RUN|COPY|WORKDIR|CMD|ENTRYPOINT|EXPOSE|ENV|USER|HEALTHCHECK|ARG|VOLUME|version|services|ports|environment|volumes|depends_on|build|restart|image)\b)|(\b(?:int|str|float|bool|datetime|Optional|List|Dict|Set|Tuple|Any|BaseModel|Field|ConfigDict|EmailStr|FastAPI|APIRouter|Depends|HTTPException|status|Query|Session|Mapped|mapped_column|relationship|DeclarativeBase|BaseSettings|SettingsConfigDict|TestClient)\b)|(\b\d+(?:\.\d+)?\b)|([a-zA-Z_]\w*)|([^\s\w])/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    // Add raw whitespace or text preceding match
    if (match.index > lastIndex) {
      elements.push(line.slice(lastIndex, match.index));
    }

    const [full, comment, stringLit, decorator, keyword, typeIdent, numberLit, word, symbol] = match;

    if (comment) {
      elements.push(
        <span key={match.index} className="text-slate-500 italic">
          {comment}
        </span>
      );
    } else if (stringLit) {
      elements.push(
        <span key={match.index} className="text-emerald-400">
          {stringLit}
        </span>
      );
    } else if (decorator) {
      elements.push(
        <span key={match.index} className="text-amber-400 font-medium">
          {decorator}
        </span>
      );
    } else if (keyword) {
      elements.push(
        <span key={match.index} className="text-purple-400 font-semibold">
          {keyword}
        </span>
      );
    } else if (typeIdent) {
      elements.push(
        <span key={match.index} className="text-sky-300 font-medium">
          {typeIdent}
        </span>
      );
    } else if (numberLit) {
      elements.push(
        <span key={match.index} className="text-amber-300 tabular-nums">
          {numberLit}
        </span>
      );
    } else if (word) {
      // Check if function call (followed by parenthesis)
      const afterMatch = line.slice(match.index + word.length);
      const isCall = /^\s*\(/.test(afterMatch);

      if (isCall) {
        elements.push(
          <span key={match.index} className="text-blue-300 font-normal">
            {word}
          </span>
        );
      } else {
        elements.push(
          <span key={match.index} className="text-slate-200">
            {word}
          </span>
        );
      }
    } else if (symbol) {
      elements.push(
        <span key={match.index} className="text-slate-400">
          {symbol}
        </span>
      );
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < line.length) {
    elements.push(line.slice(lastIndex));
  }

  return <>{elements}</>;
}
