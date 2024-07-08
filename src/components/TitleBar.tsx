import {
  IonNote,
  IonBadge,
  IonList,
  IonModal,
  IonHeader,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonLabel,
  IonToolbar,
  IonItem,
} from "@ionic/react";
import { useRef } from "react";

import TextAvatar from "./TextAvatar";
import { User } from "../types";

import "./TitleBar.css";

type Props = {
  title: string;
  users: User[];
};

export default function TitleBar({ title, users }: Props) {
  const modal = useRef<HTMLIonModalElement>(null);

  function dismiss() {
    modal.current?.dismiss();
  }

  const userItem = (user: User, isMe: boolean) => (
    <IonItem>
      <TextAvatar text={user.name} />
      <IonLabel className="contact-title">
        <strong>{user.name}</strong>
      </IonLabel>
      {isMe && <IonBadge slot="end">me</IonBadge>}
    </IonItem>
  );

  const items = users.map((user) => userItem(user, false));
  items.push(userItem({ name: window.webxdc.selfName, lastSeen: 0 }, true));

  return (
    <>
      <IonToolbar id="open-modal">
        <IonButtons slot="start">
          <IonButton>
            <TextAvatar text={title} />
          </IonButton>
        </IonButtons>
        <IonLabel>
          <strong>{title}</strong>
          <br />
          <IonNote>{users.length + 1} online</IonNote>
        </IonLabel>
      </IonToolbar>

      <IonModal ref={modal} trigger="open-modal">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Online</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => dismiss()}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList>{items}</IonList>
        </IonContent>
      </IonModal>
    </>
  );
}
