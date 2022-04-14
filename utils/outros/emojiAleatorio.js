function emojiAleatorio() {
    const emojis = ['🤠', '😁', '🤠', '😺', '👋', '👊', '✨', '👍', '🙃', '🤯', '👽', '👻'];

    const random = Math.floor(Math.random() * emojis.length);
    return emojis[random];
}

export default emojiAleatorio;