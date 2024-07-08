import { IonNote, IonLabel } from "@ionic/react";
// @ts-ignore
import getRGB from "consistent-color-generation";
import { Msg } from "../types";

export default function Message({ msg }: { msg: Msg }) {
  const textColor = getRGB(msg.senderName).toString();
  const time = new Date(msg.time).toLocaleTimeString();
  return (
    <div className="msg">
      <IonNote slot="start">{time} </IonNote>
      <IonLabel>
        <strong style={{ color: textColor }}>{msg.senderName} </strong>
        {msg.text}
      </IonLabel>
    </div>
  );
}
