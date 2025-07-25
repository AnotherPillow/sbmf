export const colourToCodes = {
    black: '&0',
    dark_blue: '&1',
    dark_green: '&2',
    dark_aqua: '&3',
    dark_red: '&4',
    dark_purple: '&5',
    gold: '&6',
    gray: '&7',
    dark_gray: '&8',
    blue: '&9',
    green: '&a',
    aqua: '&b',
    red: '&c',
    light_purple: '&d',
    yellow: '&e',
    white: '&f',
    reset: '&f'
    // reset: '&r'
}

export const formatHex = (hex: string, sep: string = '&') => {
    if (hex.startsWith('#')) hex = hex.slice(1)
    return sep + 'x' + sep + hex.split('').join(sep)
}

export const stripColourCodesAmp = (content: string) => {
    return content.replace(/&[a-f0-9klmnor]/g, '')
}

export const cleanChatMessage = (content: string) => {
    if (!content) return ''
    return content
        .replace(/[§\u00A7]([a-f0-9])/g, "&$1")
        .replace(/[§\u00A7]r/g, '&f')
        .replace(/[§\u00A7][klmno]/g, '')
}