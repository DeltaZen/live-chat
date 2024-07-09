import { IonNote, IonLabel } from "@ionic/react";
// @ts-ignore
import getRGB from "consistent-color-generation";
import { Msg } from "../types";

export default function Message({ msg }: { msg: Msg }) {
  const textColor = getRGB(msg.senderId).toString();
  const time =
    msg.isAction || msg.isSystem
      ? "***"
      : new Date(msg.time).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
  return (
    <div className="msg">
      <IonNote slot="start">{time} </IonNote>
      <IonLabel>
        <strong style={{ color: textColor }}>{msg.senderName} </strong>
        {msg.isSystem ? <IonNote>{msg.text}</IonNote> : msg.text}
      </IonLabel>
    </div>
  );
}
