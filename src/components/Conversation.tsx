import { useRef, useEffect } from "react";

import Message from "./Message";
import { Msg } from "../types";

import "./Conversation.css";

export default function Conversation({ messages }: { messages: Msg[] }) {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const items = messages.map((msg) => <Message msg={msg} />);

  return (
    <div className="conversation">
      {items}
      <div ref={messagesEndRef} />
    </div>
  );
}
