import { IonContent, IonHeader, IonPage, IonFooter } from "@ionic/react";

import Conversation from "../components/Conversation";
import Composer from "../components/Composer";
import TitleBar from "../components/TitleBar";
import { User, Msg } from "../types";

type Props = {
  topic: string;
  me: User;
  users: User[];
  messages: Msg[];
  onSendMsg: (text: string) => void;
  onTyping: (text: string) => void;
};

export default function Home({
  topic,
  me,
  users,
  messages,
  onSendMsg,
  onTyping,
}: Props) {
  const typingUsers = users.filter((user) => user.state === 2);

  return (
    <IonPage>
      <IonHeader>
        <TitleBar title={topic} me={me} users={users} />
      </IonHeader>
      <IonContent fullscreen>
        <Conversation typingUsers={typingUsers} messages={messages} />
      </IonContent>
      <IonFooter>
        <Composer onTyping={onTyping} onSend={onSendMsg} />
      </IonFooter>
    </IonPage>
  );
}
