// Icônes du starter, dessinées dans la couleur du texte qui les entoure : les états (tableau ouvert, survol, thème) les colorent.
// Elles sont décoratives (A5) : le nom accessible vient du texte ou de l'aria-label du bouton.
import board from '../../assets/icon-board.svg?raw'
import addTask from '../../assets/icon-add-task-mobile.svg?raw'
import check from '../../assets/icon-check.svg?raw'
import chevronDown from '../../assets/icon-chevron-down.svg?raw'
import chevronUp from '../../assets/icon-chevron-up.svg?raw'
import cross from '../../assets/icon-cross.svg?raw'
import dark from '../../assets/icon-dark-theme.svg?raw'
import light from '../../assets/icon-light-theme.svg?raw'
import hide from '../../assets/icon-hide-sidebar.svg?raw'
import show from '../../assets/icon-show-sidebar.svg?raw'
import ellipsis from '../../assets/icon-vertical-ellipsis.svg?raw'

const tint = (svg) => svg.replace(/(fill|stroke)="#[^"]+"/g, '$1="currentColor"').replace('<svg', '<svg aria-hidden="true"')

export const icons = Object.fromEntries(Object.entries({ board, addTask, check, chevronDown, chevronUp, cross, dark, light, hide, show, ellipsis }).map(([name, svg]) => [name, tint(svg)]))
