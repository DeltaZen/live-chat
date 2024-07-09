import { IonToolbar, IonInput, IonButton, IonIcon } from "@ionic/react";
import { send } from "ionicons/icons";
import { useState } from "react";

type Props = {
  onTyping: (text: string) => void;
  onSend: (text: string) => void;
};

import "./Composer.css";

export default function Composer({ onTyping, onSend }: Props) {
  const [input, setInput] = useState("");
  const onSendClick = () => {
    onSend(input);
    setInput("");
  };
  const onInput = (event: any) => {
    setInput(event.target.value);
    onTyping(event.target.value);
  };
  const onEnter = (event: any) => {
    if (event.key === "Enter") {
      onSendClick();
    }
  };

  return (
    <IonToolbar className="composer">
      <IonInput
        value={input}
        placeholder="Message"
        enterkeyhint="send"
        onInput={onInput}
        onKeyPress={onEnter}
      >
        <IonButton slot="end" aria-label="Send" onClick={onSendClick}>
          <IonIcon slot="icon-only" icon={send} aria-hidden="true" />
        </IonButton>
      </IonInput>
    </IonToolbar>
  );
}
