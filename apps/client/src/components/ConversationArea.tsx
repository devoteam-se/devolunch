import React from 'react';
import { css } from '@emotion/react';
import { color } from '@/utils/theme';
import type { PromptSuggestion } from '@/types/ai';

const conversationArea = css`
  max-height: calc(100vh - 5.625rem - 8rem - 8rem); /* viewport - header - input/title - chevron area */
  overflow-y: auto;
  margin-bottom: 1rem; /* Minimal gap to input */
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e0e0e0;
  display: none;

  &.show {
    display: block;
  }

  @media (max-width: 768px) {
    max-height: calc(100vh - 5rem - 8rem - 6rem);
    margin-bottom: 1rem;
  }
`;

const messageBubble = css`
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  max-width: 80%;
  word-wrap: break-word;
`;

const userMessage = css`
  ${messageBubble}
  background: ${color.blue};
  color: white;
  margin-left: auto;
  border-bottom-right-radius: 4px;
`;

const aiMessage = css`
  ${messageBubble}
  background: #f5f5f5;
  color: #333;
  border-bottom-left-radius: 4px;
`;

const aiLoadingMessage = css`
  ${aiMessage}
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-style: italic;
  color: #666;
`;

const typingIndicator = css`
  display: flex;
  gap: 0.25rem;

  span {
    width: 6px;
    height: 6px;
    background: #666;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;

    &:nth-of-type(1) { animation-delay: -0.32s; }
    &:nth-of-type(2) { animation-delay: -0.16s; }
  }

  @keyframes typing {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

export type ConversationMessage =
  | {
      id: string;
      type: 'user' | 'ai' | 'loading';
      content: string;
      timestamp: Date;
    }
  | {
      id: string;
      type: 'suggestions';
      suggestions: PromptSuggestion[];
      timestamp: Date;
    };

interface ConversationAreaProps {
  messages: ConversationMessage[];
  hasActiveConversation: boolean;
  onSuggestionClick?: (suggestion: PromptSuggestion) => void;
  renderSuggestions?: (suggestions: PromptSuggestion[], messageId: string) => React.ReactNode;
}

export default function ConversationArea({
  messages,
  hasActiveConversation,
  renderSuggestions
}: ConversationAreaProps) {


  return (
    <div
      css={[conversationArea, hasActiveConversation && css`display: block;`]}
    >
      {messages.map((message) => (
        <div key={message.id}>
          {message.type === 'user' && (
            <div css={userMessage}>{message.content}</div>
          )}
          {message.type === 'ai' && (
            <div css={aiMessage}>{message.content}</div>
          )}
          {message.type === 'loading' && (
            <div css={aiLoadingMessage}>
              <div css={typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
              {message.content}
            </div>
          )}
          {message.type === 'suggestions' && renderSuggestions && (
            <div data-message-type="suggestions">
              {renderSuggestions(message.suggestions, message.id)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}