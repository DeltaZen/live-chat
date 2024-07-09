import { useRef, useEffect } from "react";

import Message from "./Message";
import { User, Msg } from "../types";

import "./Conversation.css";

type Props = { typingUsers: User[]; messages: Msg[] };

export default function Conversation({ typingUsers, messages }: Props) {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [typingUsers, messages]);

  const items = messages.map((msg) => <Message msg={msg} />);

  if (typingUsers.length) {
    let text = typingUsers.map((user) => user.name).join(", ");
    text += (typingUsers.length > 1 ? " are" : " is") + " typing...";
    const msg = {
      text,
      isSystem: true,
      time: 0,
      senderId: "",
      senderName: "",
      isAction: false,
    };
    items.push(<Message msg={msg} />);
  }

  return (
    <div className="conversation">
      {items}
      <div ref={messagesEndRef} />
    </div>
  );
}
