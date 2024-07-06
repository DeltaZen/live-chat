import { IonLabel, IonToolbar, IonItem } from "@ionic/react";

import TextAvatar from "./TextAvatar";

import "./TitleBar.css";

export default function TitleBar({
  title,
  members,
}: {
  title: string;
  members: number;
}) {
  return (
    <IonToolbar>
      <IonItem>
        <TextAvatar text={title} />
        <IonLabel className="titlebar-title">
          <strong>{title}</strong>
          <p>{members} online</p>
        </IonLabel>
      </IonItem>
    </IonToolbar>
  );
}
