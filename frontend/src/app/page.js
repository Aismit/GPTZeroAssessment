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
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);

  const handleTextAreaChange = (event) => {
    setPrompt(event.target.value);
  };

  const addMessage = (message, agent) => {
    setMessages((prev) => [
      ...prev,
      {
        agent,
        contents: message,
      },
    ]);
  };

  const handleSubmit = () => {
    if (!prompt) {
      setError("Please enter a prompt.");
      return;
    }
    setError(null);
    setIsLoadingResponse(true);
    addMessage(prompt, agentTypes.user);

    const eventSource = getPromptResponse(prompt, (response) => {
      setMessages((prev) => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1]?.agent === agentTypes.richieRich) {
          newMessages[newMessages.length - 1].contents += response;
        } else {
          newMessages.push({
            agent: agentTypes.richieRich,
            contents: response,
          });
        }
        return newMessages;
      });
    });

    eventSource.onopen = () => {
      console.log("Connection to server opened.");
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
      setIsLoadingResponse(false);
      setPrompt("");
    };

    eventSource.onclose = () => {
      setIsLoadingResponse(false);
      setPrompt("");
    };

    // Clean up eventSource on unmount
    return () => {
      eventSource.close();
    };
  };

  useEffect(() => {
    scrollContainerRef.current.scrollTop =
      scrollContainerRef.current.scrollHeight;
  }, [messages]);

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
