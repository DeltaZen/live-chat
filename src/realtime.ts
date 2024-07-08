import {
  createEncoder,
  toUint8Array,
  writeVarString,
  writeVarUint,
} from "lib0/encoding";
import { createDecoder, readVarString, readVarUint } from "lib0/decoding";
import { User, Msg } from "./types";

type PresenceCallback = (users: Record<string, User>) => void;
type MessagesCallback = (messages: Msg[]) => void;

const messageTypes = {
  Presence: 1,
  Normal: 2,
};

export default class RealTime {
  users: Record<string, User>;
  messages: Msg[];
  channel: any;
  timeout: number;
  _onPresenceChanged: PresenceCallback;
  _onMessagesChanged: MessagesCallback;
  _interval: number;

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
      const decoder = createDecoder(data);
      const mType = readVarUint(decoder);
      if (mType === messageTypes.Presence) {
        const name = readVarString(decoder);
        const online = readVarUint(decoder);
        if (online) {
          self.users[name] = { name, lastSeen: new Date().valueOf() };
        } else {
          delete self.users[name];
        }
        self._onPresenceChanged(self.users);
      } else if (mType === messageTypes.Normal) {
        self._addMessage(readVarString(decoder), readVarString(decoder));
      } else {
        console.error("Unexpected MessageType: " + mType);
      }
    });
    this._interval = window.setInterval(() => this._sync(), tick * 1000);
  }

  disconnect() {
    clearInterval(this._interval);
    this._sendPresence(0);
  }

  sendMessage(text: string) {
    if (!text) return;
    const sender = window.webxdc.selfName;
    const encoder = createEncoder();
    writeVarUint(encoder, messageTypes.Normal);
    writeVarString(encoder, sender);
    writeVarString(encoder, text);
    this.channel.send(toUint8Array(encoder));
    this._addMessage(sender, text);
  }

  _sendPresence(state: number) {
    const encoder = createEncoder();
    writeVarUint(encoder, messageTypes.Presence);
    writeVarString(encoder, window.webxdc.selfName);
    writeVarUint(encoder, state);
    this.channel.send(toUint8Array(encoder));
  }

  _sync() {
    this._sendPresence(1);

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

  _addMessage(sender: string, text: string) {
    if (this.messages.length >= 500) {
      this.messages.shift();
    }
    this.messages.push({
      senderName: sender,
      time: new Date().valueOf(),
      text: text,
    });
    this._onMessagesChanged(this.messages);
  }
}
