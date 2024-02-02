

export const API_ENDPOINT = "http://localhost:8080/"

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