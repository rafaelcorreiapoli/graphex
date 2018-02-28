import * as util from 'util'

export const lowerFirstLetter = (str: string) => str.charAt(0).toLowerCase() + str.slice(1)

export const log = (what: string) => console.log(util.inspect(what, false, null))

export const lowerCase = (str: string) => str.toLowerCase()

export const forceArray = (something: any) => {
  if (!something) {
    return []
  }
  return Array.isArray(something) ? something : [something]
}

export const isEmpty = (obj: any) => obj && Object.keys(obj).length === 0
