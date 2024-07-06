import { createEncoder, toUint8Array, writeVarString } from "lib0/encoding";
import { createDecoder, readVarString } from "lib0/decoding";
import { User, Msg } from "./types";

type PresenceCallback = (users: Record<string, User>) => void;
type MessagesCallback = (messages: Msg[]) => void;

const messageTypes = {
  Presence: 1,
  Normal: 2,
};

function encode(obj: any): Uint8Array {
  const encoder = createEncoder();
  writeVarString(encoder, JSON.stringify(obj));
  return toUint8Array(encoder);
}

function decode(data: Uint8Array): any {
  const decoder = createDecoder(data);
  return JSON.parse(readVarString(decoder));
}

export default class RealTime {
  users: Record<string, User>;
  messages: Msg[];
  channel: any;
  timeout: number;
  _onPresenceChanged: PresenceCallback;
  _onMessagesChanged: MessagesCallback;

  constructor({
    onPresenceChanged,
    onMessagesChanged,
  }: {
    onPresenceChanged: PresenceCallback;
    onMessagesChanged: MessagesCallback;
  }) {
    this._onPresenceChanged = onPresenceChanged;
    this._onMessagesChanged = onMessagesChanged;
    this.users = {};
    this.messages = [];
    this.channel = window.webxdc.joinRealtimeChannel();
    this.timeout = 5;
    const tick = 2;

    const self = this;
    this.channel.setListener((data: Uint8Array) => {
      const update = data.subarray(1);
      if (data[0] === messageTypes.Presence) {
        const user = decode(update);
        if (user.time === -1) {
          delete self.users[user.name];
        } else {
          self.users[user.name] = {
            name: user.name,
            lastSeen: new Date().valueOf(),
          };
        }
        self._onPresenceChanged(self.users);
      } else if (data[0] === messageTypes.Normal) {
        self._addMessage(decode(update));
      }
    });
    setInterval(() => this._sync(), tick * 1000);
  }

  _sync() {
    const state = {
      name: window.webxdc.selfName,
    };
    const update = encode(state);
    const data = new Uint8Array(update.length + 1);
    data[0] = messageTypes.Presence;
    data.set(update, 1);
    this.channel.send(data);

    let usersChanged = false;
    const self = this;
    Object.keys(this.users).forEach(function (key) {
      const now = new Date().valueOf();
      if (now - self.users[key].lastSeen > self.timeout * 1000) {
        delete self.users[key];
        usersChanged = true;
      }
    });
    if (usersChanged) {
      this._onPresenceChanged(this.users);
    }
  }

  _addMessage(msg: Msg) {
    if (this.messages.length >= 500) {
      this.messages.shift();
    }
    this.messages.push(msg);
    this._onMessagesChanged(this.messages);
  }

  sendMessage(text: string) {
    if (!text) return;
    const msg: Msg = {
      senderName: window.webxdc.selfName,
      time: new Date().valueOf(),
      text: text,
    };
    const update = encode(msg);
    const data = new Uint8Array(update.length + 1);
    data[0] = messageTypes.Normal;
    data.set(update, 1);
    this.channel.send(data);
    this._addMessage(msg);
  }
}
