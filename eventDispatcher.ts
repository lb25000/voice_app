// eventDispatcher.ts
import { NativeEventEmitter, NativeModule, Platform } from 'react-native';
import { EventEmitter } from 'eventemitter3';


const emitter = Platform.select({
  native: new EventEmitter(),
  default: new EventEmitter(),
});

export const eventEmitter = emitter;

// Funktion, um ein "Save"-Event zu dispatchen
export const dispatchSaveEvent = () => {
  eventEmitter.emit('voiceSaveCommand');
};

// Hier können auch andere Events hinzugefügt werden
