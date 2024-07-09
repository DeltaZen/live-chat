import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactHashRouter } from "@ionic/react-router";
import { useState } from "react";

import Home from "./pages/Home";
import RealTime from "./realtime";
import { User, Msg } from "./types";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

setupIonicReact({
  mode: "ios",
});

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>(localStorage.topic || "Live Chat");
  const [nick, setNick] = useState<string>(
    localStorage.nick || window.webxdc.selfName,
  );
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);

  const onPresenceChanged = (newUsers: Record<string, User>) => {
    const usersArr = Object.values(newUsers).map((user) => user as User);
    setUsers(usersArr);
  };
  const onMessagesChanged = (newMessages: Msg[]) =>
    setMessages([...newMessages]);
  const [realtime] = useState(
    () => new RealTime({ nick, onPresenceChanged, onMessagesChanged }),
  );

  const [ignore] = useState(() => {
    window.webxdc.setUpdateListener(
      (update) => {
        if (update.serial === update.max_serial) {
          localStorage.maxSerial = update.serial;
          const topic = (localStorage.topic = update.document || "");
          setTopic(topic);
          const sender = update.payload.sender;
          realtime.addSysMessage(`${sender} changed topic to "${topic}"`);
        }
      },
      parseInt(localStorage.maxSerial || "0"),
    );
    window.addEventListener("beforeunload", () => realtime.disconnect());
  });

  const onTyping = (text: string) => {
    realtime.setWritingMode(text !== "");
  };

  const onSendMsg = (text: string) => {
    text = text.trim();
    if (!text) return;
    realtime.setWritingMode(false);
    if (text === "/clear") {
      realtime.clearMessages();
    } else if (text === "/whoami") {
      realtime.addSysMessage(`your are: ${nick}`);
    } else if (text.startsWith("/nick ")) {
      const newNick = realtime.setNick(text.slice(5).trim());
      if (newNick === window.webxdc.selfName) {
        localStorage.removeItem("nick");
      } else {
        localStorage.nick = newNick;
      }
      setNick(newNick);
    } else if (text.startsWith("/me ")) {
      realtime.sendMessage(text.slice(3).trim(), true);
    } else if (text.startsWith("/topic ")) {
      const newTopic = text.slice(6).trim();
      if (newTopic) {
        const sender = realtime.getNick();
        window.webxdc.sendUpdate(
          { payload: { sender }, document: newTopic },
          "",
        );
      }
    } else {
      realtime.sendMessage(text, false);
    }
  };

  const me = { name: nick, id: realtime.getDeviceId(), state: 1, lastSeen: 0 };

  return (
    <IonApp>
      <IonReactHashRouter>
        <IonRouterOutlet>
          <Route exact path="/home">
            <Home
              me={me}
              topic={topic}
              users={users}
              messages={messages}
              onSendMsg={onSendMsg}
              onTyping={onTyping}
            />
          </Route>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>
      </IonReactHashRouter>
    </IonApp>
  );
};

export default App;
