import { ChatMessage } from "prismarine-chat";
import { cleanChatMessage, colourToCodes, formatHex, stripColourCodesAmp, stripColourCodesPara } from "./ColourCodes";

export default class SkyblockChatMessage {

    // public rawNickname: string;
    // public rawMessageContent: string;
    
    public fullMessage: string;
    public chatMessage: ChatMessage;

    /**
     * @description Username of the PLAYER that sent this message. Null if not player. Sourced from signature data
     */
    private playerUsernameSignature: string | null | undefined
    /**
     * @description Username of the PLAYER that sent this message. Null if not player. Sourced from /visit suggestion
     */
    private playerUsernameVisit: string | null | undefined
    /**
     * @description Username of the PLAYER that sent this message. Null if not player. Merged from signature or visit suggestion, with visit priority.
     */
    public sourcePlayer: string | null | undefined
    public prefixedNickname: string | null | undefined
    public playerPrefix: string | null | undefined
    public playerNickname: string | null | undefined
    public playerInfo: {
        flightMode: boolean,
        rank: string,
        level: number,
        joined: string,
        joinedDate: Date,
        playtime: string,
        playtimeSeconds: number,
    } | null | undefined
    /**
     * @description the parts of {@link chatMessage}'s extras that contain the message content
     */
    public playerMessageExtras: any[] | null | undefined
    /**
     * @description equivalent of calling {@link toChattable} on {@link playerMessageExtras}
     */
    public playerMessageChattable: string | null | undefined
    /**
     * @description {@link playerMessageChattable} with colour stripped
     */
    public playerMessageClean: string | null | undefined
    
    public channel: 'COOP' | 'GLOBAL' | 'LOCAL' | 'BROADCAST' | 'TIP' | 'VOTE' | 'RAFFLE' | 'MISC' | 'ISLAND_MOTD' | 'ISLAND_WELCOME' | 'VISITING_ISLAND' | 'NEW_PLAYER_JOIN' | 'DIRECT_MESSAGE' | 'CHAT_TEXT_GAMES' = 'MISC'
    
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

        this.playerUsernameSignature = this.chatMessage.json.insertion ?? null
        if (this.chatMessage.json?.clickEvent?.action == 'suggest_command'
            && this.chatMessage.json?.clickEvent?.value?.startsWith('/visit ')
        ) {
            this.playerUsernameVisit = this.chatMessage.json?.clickEvent?.value?.split('/visit ')[1]
        }

        this.sourcePlayer = (this.playerUsernameSignature ?? this.playerUsernameVisit) || null

        const extras = this.chatMessage.json.extra

        let extraIndexWithPlayerMessage = 0;

        if (extras?.[0].color == 'dark_gray' && extras[0].text =='[' && extras[1].color == 'gray') {
            const channelHuman = extras[1].text
            if (channelHuman == 'Local') {
                this.channel = 'LOCAL'
                extraIndexWithPlayerMessage = 4
            } else if (channelHuman == 'Coop') {
                this.channel = 'COOP'
                extraIndexWithPlayerMessage = 4
            }
        }

        // parse player messages
        if (extras?.[extraIndexWithPlayerMessage]
            && extras[extraIndexWithPlayerMessage]?.hoverEvent?.action == 'show_text'
            && extras[extraIndexWithPlayerMessage]?.text.trim()
        ) {
            if (this.channel == 'MISC') this.channel = 'GLOBAL'
            const element = extras[extraIndexWithPlayerMessage]
            
            this.prefixedNickname = element.text.trim().replace(/:$/, '')
            if (this.prefixedNickname.includes(' ')) {
                const prefixedNicknameparts = this.prefixedNickname.split(' ')
                this.playerPrefix = prefixedNicknameparts[0].trim()
                // get the colour code from the end of the prefix to add to the start of the main nickname
                const endColourCode = this.playerPrefix.match(/(§[a-f0-9]$)/)?.[1] ?? ''
                this.playerNickname = prefixedNicknameparts[1] ? endColourCode + prefixedNicknameparts[1].trim().replace(/§$/, '') : null
            } else {
                this.playerNickname = this.prefixedNickname
            }

            const playerInfoText = element.hoverEvent.value?.[1]?.text as string
            if (playerInfoText) {
                const parts = playerInfoText.split('\n')
                let initialRankRow = 1
                this.playerInfo = {} as any
                if (parts[1].toString().endsWith('Fly Mode Activated')) {
                    this.playerInfo.flightMode = true
                    initialRankRow = 2
                } else {
                    this.playerInfo.flightMode = false
                }

                for (let i = initialRankRow; i < (initialRankRow + 4); i++) {
                    const label = stripColourCodesPara(parts[i].split(' ')[0]).replace(/:$/, '')
                    const value = parts[i].split(' ').slice(1).join(' ')
                    switch (label) {
                        case 'Rank':
                            this.playerInfo.rank = value
                            break;
                        case 'Level':
                            this.playerInfo.level = Number(stripColourCodesPara(value))
                            if (isNaN(this.playerInfo.level)) this.playerInfo.level = 0
                            break;
                        case 'Joined':
                            this.playerInfo.joined = stripColourCodesPara(value)

                            let jyears = Number(this.playerInfo.joined.match(/(\d+)y/)?.[1] || 0)
                            jyears = isNaN(jyears) ? 0 : jyears
                            let jmonths = Number(this.playerInfo.joined.match(/(\d+)m(?![a-zA-Z])/)?.[1] || 0)
                            jmonths = isNaN(jmonths) ? 0 : jmonths
                            let jdays = Number(this.playerInfo.joined.match(/(\d+)d/)?.[1] || 0)
                            jdays = isNaN(jdays) ? 0 : jdays
                            let jhours = Number(this.playerInfo.joined.match(/(\d+)h/)?.[1] || 0)
                            jhours = isNaN(jhours) ? 0 : jhours
                            let jminutes = Number(this.playerInfo.joined.match(/(\d+)m ago/)?.[1] || 0) // months + minutes both m but m at end
                            jminutes = isNaN(jminutes) ? 0 : jminutes
                            let jseconds = Number(this.playerInfo.joined.match(/(\d+)s/)?.[1] || 0)
                            jseconds = isNaN(jseconds) ? 0 : jseconds

                            this.playerInfo.joinedDate = new Date(new Date().valueOf()
                                // month 30d maybe??
                                - ((((((((jyears * 365) + (jmonths * 30) + jdays) * 24) + jhours) * 60) + jminutes) * 60) + jseconds) * 1000
                            )   
                            break;
                        case 'Playtime':
                            this.playerInfo.playtime = stripColourCodesPara(value)

                            let pdays = Number(this.playerInfo.playtime.match(/(\d+)d/)?.[1] || 0)
                            pdays = isNaN(pdays) ? 0 : pdays
                            let phours = Number(this.playerInfo.playtime.match(/(\d+)h/)?.[1] || 0)
                            phours = isNaN(phours) ? 0 : phours
                            let pminutes = Number(this.playerInfo.playtime.match(/(\d+)m/)?.[1] || 0)
                            pminutes = isNaN(pminutes) ? 0 : pminutes
                            let pseconds = Number(this.playerInfo.playtime.match(/(\d+)s/)?.[1] || 0)
                            pseconds = isNaN(pseconds) ? 0 : pseconds

                            this.playerInfo.playtimeSeconds = (
                                (((((pdays * 24) + phours) * 60) + pminutes) * 60) + pseconds
                            )
                            
                            break;
                        default: break;
                    }
                }
            }

            const contentIndex = extraIndexWithPlayerMessage + 1
            const contentExtras = extras.slice(contentIndex)

            this.playerMessageExtras = contentExtras || null
            this.playerMessageChattable = this.toChattable(this.playerMessageExtras)
            this.playerMessageClean = stripColourCodesAmp(this.playerMessageChattable)

        }
    }

    /**
     * @description converts it into a format using & that can be said in chat. does not abuse bugs to type in bold, italic, etc. &r is not allowed so it uses &f instead
     */
    toChattable(elements = this.flattened): string {
        let content = ''
        
        elements.forEach((msg: Record<string, any>) => {
            // console.log(msg.json)
            
            const cc = colourToCodes[msg.json?.color ?? msg.color]
            if (cc) content += cleanChatMessage(cc)
            if ((msg.json?.color ?? msg.color)?.startsWith('#')) content += formatHex(msg.json?.color ?? msg.color)
            
            content += cleanChatMessage(msg.json?.text ?? msg.text)
            
            // console.log(content)
        })
        if (stripColourCodesAmp(content).trim() == '') return ''

        return content
    }
}