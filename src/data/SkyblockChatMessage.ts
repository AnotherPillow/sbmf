import { ChatMessage } from "prismarine-chat";
import { cleanChatMessage, colourToCodes, formatHex, stripColourCodesAmp } from "./ColourCodes";

export default class SkyblockChatMessage {

    // public rawNickname: string;
    // public rawMessageContent: string;
    public fullMessage: string;
    public chatMessage: ChatMessage;
    private flattened: ChatMessage[] = []
    
    public constructor(
        jsonMsg: ChatMessage,
    ) {
        this.fullMessage = jsonMsg.toString();
        this.chatMessage = jsonMsg;

        const recurse = (msg: ChatMessage) => {
            if (!msg) return;

            this.flattened.push(msg)
            
            if (msg.extra) msg.extra.forEach(recurse)
        }
        recurse(this.chatMessage)
        
    }

    /**
     * @description converts it into a format using & that can be said in chat. does not abuse bugs to type in bold, italic, etc. &r is not allowed so it uses &f instead
     */
    toChattable(): string {
        let content = ''
        
        this.flattened.forEach((msg: Record<string, any>) => {
            // console.log(msg.json)
            
            const cc = colourToCodes[msg.json.color]
            if (cc) content += cleanChatMessage(cc)
            if (msg.json?.color?.startsWith('#')) content += formatHex(msg.json.color)
            
            content += cleanChatMessage(msg.json.text)
            
            // console.log(content)
        })
        if (stripColourCodesAmp(content).trim() == '') return ''

        return content
    }
}