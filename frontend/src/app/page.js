"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { getPromptResponse } from "../../api/getPromptResponse";
import { ChatResponse, ChatPrompt, TextArea } from "../components/chat";

const agentTypes = {
  user: "User",
  richieRich: "RichieRich",
};

export default function Home() {
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);

  const handleTextAreaChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleSubmit = () => {
    if (!prompt) {
      setError("Please enter a prompt.");
      return;
    }
    setError(null);
    setIsLoadingResponse(true);
    setMessages(prev => [...prev, { agent: agentTypes.user, contents: prompt }]);
    setCurrentMessage('');

    const cleanup = getPromptResponse(prompt, (response) => {
      setCurrentMessage(prev => prev + response);
    }, () => {
      // This is the callback for the end event
      setIsLoadingResponse(false);
    });

    // Clean up function
    return () => {
      cleanup();
      setIsLoadingResponse(false);
    };
  };

  useEffect(() => {
    if (currentMessage && !isLoadingResponse) {
      setMessages(prev => [
        ...prev,
        { agent: agentTypes.richieRich, contents: currentMessage.trim() }
      ]);
      setCurrentMessage('');
    }
  }, [isLoadingResponse, currentMessage]);

  useEffect(() => {
    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
  }, [messages, currentMessage]);

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center w-full bg-gray-100 h-[93vh]">
        <div
          ref={scrollContainerRef}
          className="flex flex-col overflow-y-scroll p-20 w-full mb-40"
        >
          {messages.map((message, index) =>
            message.agent === agentTypes.user ? (
              <ChatPrompt key={index} prompt={message.contents} />
            ) : (
              <ChatResponse key={index} response={message.contents} />
            )
          )}
          {currentMessage && (
            <ChatResponse response={currentMessage} />
          )}
        </div>
        <TextArea
          onChange={handleTextAreaChange}
          onSubmit={handleSubmit}
          isLoading={isLoadingResponse}
          hasError={error !== null}
        />
        {error && (
          <div className="absolute bottom-0 mb-2 text-red-500">{error}</div>
        )}
      </main>
    </>
  );
}
