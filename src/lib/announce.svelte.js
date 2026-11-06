// Région de statut de l'app (A9) : ce que les lecteurs d'écran doivent annoncer

export const notice = $state({ text: '' })

// même texte deux fois de suite : une espace insécable le rend différent, pour qu'il soit annoncé de nouveau
export const announce = (text) => { notice.text = notice.text === text ? `${text}\u00a0` : text }
