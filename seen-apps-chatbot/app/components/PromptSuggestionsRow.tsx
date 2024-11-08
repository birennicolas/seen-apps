import React from 'react'
import PromptSuggestionButton from './PromptSuggestionButton'
const prompts = [
  "What is Seen Apps?",
  "What is the Seen Apps mission?",
  "What is the Seen Apps vision?",
]

const PromptSuggestionsRow = ({ onPromptClick }) => {
  return (
    <div className="prompt-suggestion-row">
      {prompts.map((prompt, index) => (
        <PromptSuggestionButton key={`suggestion-${index}`} onClick={() => onPromptClick(prompt)} text={prompt} />
      ))}
    </div>
  )
}

export default PromptSuggestionsRow
