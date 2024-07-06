import { IonContent, IonHeader, IonPage, IonFooter } from "@ionic/react";

import Conversation from "../components/Conversation";
import Composer from "../components/Composer";
import TitleBar from "../components/TitleBar";
import { User, Msg } from "../types";

type Props = {
  users: User[];
  messages: Msg[];
  onSendMsg: (text: string) => void;
};

export default function Home({ users, messages, onSendMsg }: Props) {
  return (
    <IonPage>
      <IonHeader>
        <TitleBar title="Live Chat" members={users.length} />
      </IonHeader>
      <IonContent fullscreen>
        <Conversation messages={messages} />
      </IonContent>
      <IonFooter>
        <Composer onSend={onSendMsg} />
      </IonFooter>
    </IonPage>
  );
}
