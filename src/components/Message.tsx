// @ts-ignore
import getRGB from "consistent-color-generation";
import { Msg } from "../types";

export default function Message({ msg }: { msg: Msg }) {
  const textColor = getRGB(msg.senderName).toString();
  const time = new Date(msg.time).toLocaleTimeString();
  return (
    <div className="msg">
      <ion-note slot="start">{time} </ion-note>
      <ion-label>
        <strong style={{ color: textColor }}>{msg.senderName} </strong>
        {msg.text}
      </ion-label>
    </div>
  );
}
