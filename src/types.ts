import type { BotEvents } from 'mineflayer'
import type { Bot } from 'mineflayer'
import type TypedEmitter from 'typed-emitter';
import SkyblockChatMessage from './data/SkyblockChatMessage';
import ChatQueue from './features/chatQueue';

// export interface SkyblockBotExtensions {
//     a: number;
// }

export interface SkyblockBotEvents {
    'skyblock:ready': () => Promise<void> | void
    'skyblock:chat': (message: SkyblockChatMessage) => Promise<void> | void
}

export type Botish = TypedEmitter<SkyblockBotEvents & BotEvents>

export interface ISkyblockBot<B extends Botish>
    extends Botish
{
    queueChat: (message: string) => void
    _chatQueue: ChatQueue<B>
}

// export type SkyblockBot<B extends TypedEmitter<SkyblockBotEvents & mineflayer.BotEvents>> = B & SkyblockBotExtensions
export type SkyblockBot<B extends Botish> = ISkyblockBot<B> & B