import type { Bot, BotOptions } from 'mineflayer'
import type { SkyblockBot } from './src/types'
import type TypedEmitter from 'typed-emitter';
import { onMessage } from './src/events'
import type { ChatMessage } from 'prismarine-chat';
import ChatQueue from './src/features/ChatQueue';

export const inject = <T extends Bot>(bot: T): bot is SkyblockBot<T> => {
    bot.loadPlugin(plugin)
    return true;
}

/**
 * @deprecated It's preferred to use {@link inject} instead.
 */
export const plugin = (_bot: Bot, options: BotOptions) => {
    const bot = _bot as SkyblockBot<typeof _bot>
    bot.emit('skyblock:ready')
    bot._chatQueue = new ChatQueue(bot)
    
    bot.on('message', (jsonMsg) => onMessage(bot, jsonMsg))
}