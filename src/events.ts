import type { BotEvents } from 'mineflayer'
import type { ChatMessage } from 'prismarine-chat'
import type { SkyblockBot } from './types'
import type { Bot } from 'mineflayer'
import SkyblockChatMessage from './data/SkyblockChatMessage'

export const onMessage = (
    bot: SkyblockBot<Bot>, 
    jsonMsg: ChatMessage,
) => {
    const sbm = new SkyblockChatMessage(jsonMsg)
    bot.emit('skyblock:chat', sbm)
}