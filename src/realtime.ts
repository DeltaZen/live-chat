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
  Presence: 0,
  Normal: 1,
};

const userState = {
  Offline: 0,
  Online: 1,
  Writing: 2,
};

type Props = {
  nick: string;
  onPresenceChanged: PresenceCallback;
  onMessagesChanged: MessagesCallback;
};

export default class RealTime {
  users: Record<string, User>;
  messages: Msg[];
  channel: any;
  timeout: number;
  _onPresenceChanged: PresenceCallback;
  _onMessagesChanged: MessagesCallback;
  _interval: number;
  _nick: string;
  _deviceId: string;
  _state: number;
  _writingTime: number;

  constructor({ nick, onPresenceChanged, onMessagesChanged }: Props) {
    this._nick = nick;
    this._deviceId = getDeviceId();
    this._onPresenceChanged = onPresenceChanged;
    this._onMessagesChanged = onMessagesChanged;
    this._state = userState.Online;
    this._writingTime = 0;
    this.users = {};
    this.messages = [];
    this.channel = window.webxdc.joinRealtimeChannel();
    this.timeout = 5;
    const tick = 2;

    this.channel.setListener((data: Uint8Array) => {
      const decoder = createDecoder(data);
      const mType = readVarUint(decoder);
      const deviceId = readVarString(decoder);
      if (mType === messageTypes.Presence) {
        const name = readVarString(decoder);
        const state = readVarUint(decoder);
        if (state) {
          const user = this.users[deviceId];
          if (user && user.name !== name) {
            this.addSysMessage(`${user.name} changed nick to ${name}`);
          }
          this.users[deviceId] = {
            name,
            state,
            id: deviceId,
            lastSeen: new Date().valueOf(),
          };
        } else {
          delete this.users[deviceId];
        }
        this._onPresenceChanged(this.users);
      } else if (mType === messageTypes.Normal) {
        const sender = readVarString(decoder);
        const text = readVarString(decoder);
        const isAction = readVarUint(decoder) === 1;
        this.addTextMessage(deviceId, sender, text, isAction);
        if (this.users[deviceId]) {
          // cancel writing state when receiving message from user
          this.users[deviceId].state = userState.Online;
          this._onPresenceChanged(this.users);
        }
      } else {
        console.error("Unexpected MessageType: " + mType);
      }
    });
    this._interval = window.setInterval(() => this._sync(), tick * 1000);
  }

  disconnect() {
    clearInterval(this._interval);
    this._state = userState.Offline;
    this._sendPresence();
  }

  setWritingMode(enabled: boolean) {
    this._writingTime = enabled ? new Date().valueOf() : 0;
  }

  setNick(nick: string): string {
    if (nick && nick !== this._nick) {
      this.addSysMessage(`${this._nick} changed nick to ${nick}`);
      this._nick = localStorage.nick = nick;
      this._sendPresence();
    }
    return this._nick;
  }

  getNick(): string {
    return this._nick;
  }

  getDeviceId(): string {
    return this._deviceId;
  }

  clearMessages() {
    this.messages = [];
    this._onMessagesChanged(this.messages);
  }

  sendMessage(text: string, isAction: boolean) {
    const sender = this._nick;
    const encoder = createEncoder();
    writeVarUint(encoder, messageTypes.Normal);
    writeVarString(encoder, this._deviceId);
    writeVarString(encoder, sender);
    writeVarString(encoder, text);
    writeVarUint(encoder, isAction ? 1 : 0);
    this.channel.send(toUint8Array(encoder));
    this.addTextMessage(this._deviceId, sender, text, isAction);
  }

  _sendPresence() {
    const isWriting = this._writingTime ? 1 : 0;
    const state = this._state;
    const encoder = createEncoder();
    writeVarUint(encoder, messageTypes.Presence);
    writeVarString(encoder, this._deviceId);
    writeVarString(encoder, this._nick);
    writeVarUint(
      encoder,
      state === userState.Online ? state + isWriting : state,
    );
    this.channel.send(toUint8Array(encoder));
  }

  _sync() {
    if (
      this._writingTime &&
      new Date().valueOf() - this._writingTime > 4 * 1000
    ) {
      this.setWritingMode(false);
    }
    this._sendPresence();

    let usersChanged = false;
    Object.keys(this.users).forEach((key) => {
      const now = new Date().valueOf();
      if (now - this.users[key].lastSeen > this.timeout * 1000) {
        delete this.users[key];
        usersChanged = true;
      }
    });
    if (usersChanged) {
      this._onPresenceChanged(this.users);
    }
  }

  addSysMessage(text: string) {
    this.addTextMessage("", "", text, false, true);
  }

  addTextMessage(
    senderId: string,
    senderName: string,
    text: string,
    isAction: boolean = false,
    isSystem: boolean = false,
  ) {
    const msg = {
      senderId: senderId,
      senderName: senderName,
      time: new Date().valueOf(),
      text,
      isAction,
      isSystem,
    };
    if (this.messages.length >= 500) {
      this.messages.shift();
    }
    this.messages.push(msg);
    this._onMessagesChanged(this.messages);
  }
}

function getDeviceId(): string {
  let deviceId = localStorage.deviceId;
  if (deviceId) return deviceId;

  try {
    deviceId = crypto.randomUUID();
  } catch (ex) {
    const s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    deviceId =
      s4() +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      s4() +
      s4();
  }
  localStorage.deviceId = deviceId;
  return deviceId;
}
