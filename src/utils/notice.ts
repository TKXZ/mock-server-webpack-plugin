import chalk, { BackgroundColor, ForegroundColor } from 'chalk'

const createNotice = (
  title: string,
  content: string,
  t_color: typeof ForegroundColor = 'black',
  t_bg: typeof BackgroundColor = 'bgGreen',
  c_color: typeof ForegroundColor = 'greenBright'
) => {
  if (title) {
    return chalk[t_color][t_bg](`\n ${title} `) + ' ' + chalk[c_color](content)
  } else {
    return chalk[c_color](content)
  }
}

export const genNotice = {
  success: (title: string, content: string): string => {
    const t_color = 'black'
    const t_bg = 'bgGreen'
    const c_color = 'greenBright'
    return createNotice(title, content, t_color, t_bg, c_color)
  },
  warn: (title: string, content: string): string => {
    const t_color = 'black'
    const t_bg = 'bgRed'
    const c_color = 'redBright'

    return createNotice(title, content, t_color, t_bg, c_color)
  },
  error: (title: string, content: string): string => {
    const t_color = 'black'
    const t_bg = 'bgRed'
    const c_color = 'redBright'

    return createNotice(title, content, t_color, t_bg, c_color)
  },
  info: (title: string, content: string): string => {
    const t_color = 'black'
    const t_bg = 'bgBlue'
    const c_color = 'blueBright'

    return createNotice(title, content, t_color, t_bg, c_color)
  },
}
