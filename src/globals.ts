
const config = (window as unknown as Window & {config: {[key:string]:string}}).config;
export const API_ENDPOINT = config.API_URL

export type ApiResponse<T extends any> = {
  success: boolean,
  data: T
  reason?: string
}
export type User = {
  id: number,
  uuid: string,
  username: string,
  password?:string,
  joindate?: number,
  posts?: {
    title:string,
    uuid: string,
    created: number
  }[],
  isAdmin?: number
}

export type Post = {
  id: number,
  uuid: string,
  title: string,
  lang: string,
  content: string,
  created: number,
  edited: number,
  ownerId: string,
  ownerName: string
}
export const ANONID = "00000000-0000-0000-0000-000000000000";