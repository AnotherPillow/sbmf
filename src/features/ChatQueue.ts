import type { Bot } from 'mineflayer'
import { Botish } from '../types'

export default class ChatQueue<T extends Botish> {
    public messages = []
    
    private _timeout: NodeJS.Timeout
    private interval: number
    private bot: T
    
    constructor(bot: T, interval = 2000) {
        this.interval = interval
        this.bot = bot

        this._timeout = setInterval(() => {
            this.onLooped()
        }, interval)

        ;(bot as any).queueChat = (message: string) => this.messages.push(message)
    }

    private onLooped() {
        const message = this.messages.pop()
        if (!message) return
        
        ;(this.bot as any).chat(message)
    }
}