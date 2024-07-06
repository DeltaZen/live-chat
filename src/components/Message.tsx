import { IonLabel } from "@ionic/react";
// @ts-ignore
import getRGB from "consistent-color-generation";

type Props = {
  sender: string;
  text: string;
};

export default function Message({ sender, text }: Props) {
  const textColor = getRGB(sender + "fool").toString();
  return (
    <IonLabel>
      <strong style={{ color: textColor }}>{sender}: </strong> {text}
    </IonLabel>
  );
}
