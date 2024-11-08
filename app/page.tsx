"use client";

import Image from "next/image";
import logo512 from "./assets/logo512.png";
import { useChat } from "ai/react";
import { Message } from "ai";
import Bubble from "./components/Bubble";
import LoadingBubble from "./components/LoadingBubble";
import PromptSuggestionsRow from "./components/PromptSuggestionsRow";

const Home = () => {
    const {
        append,
        isLoading,
        input,
        handleInputChange,
        handleSubmit,
        messages,
      } = useChat();
  const noMessages = !messages || messages.length === 0;

  const handlePrompt = ( promptText ) => {
    const msg: Message = {
        id: crypto.randomUUID(),
        content: promptText,
        role: "user"
    }
    append(msg)
  }

  return (
    <main>
      <Image src={logo512} alt="Seen Apps Logo" width={100} height={100} />
      <section className={noMessages ? "" : "populated"}>
        {noMessages ? (
          <>
            <p className="starter-text">
              The Ultimate place for Seen Apps super fans! Ask Seen Apps GPT
              anything about Seen Apps and it will come back to you with the
              most up-to-date answers.
            </p>
            <br />
            <PromptSuggestionsRow onPromptClick={handlePrompt} />
          </>
        ) : (
          <>
            {messages.map((message, index) => <Bubble key={`message-${index}`} message={message}/>)}
            { isLoading && <LoadingBubble/>}
          </>
        )}
      </section>
      <form onSubmit={handleSubmit}>
        <input
          className="question-box"
          onChange={handleInputChange}
          value={input}
          placeholder="Ask Seen Apps GPT anything..."
        />
        <input type="submit" value="Send" />
      </form>
    </main>
  );
};

export default Home;
