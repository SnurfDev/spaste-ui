
const config = (window as unknown as Window & {config: {[key:string]:string}}).config;
export const API_ENDPOINT = config.API_URL

export type ApiResponse<T extends any> = {
  success: boolean,
  data: T
  reason?: string
}
export type User = {
  id: number,
  username: string,
  password?:string,
  joindate?: number,
  posts?: {
    title:string,
    id: number,
    created: number
  }[],
  isAdmin?: number
}

export type Post = {
  id: number,
  title: string,
  lang: string,
  content: string,
  created: number,
  edited: number,
  ownerId: number,
  ownerName: string
}