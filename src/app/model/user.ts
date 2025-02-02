export interface User{
  id: number,
  username: string,
  status: boolean
}

export interface AuthUser extends User{
  password: string,
}
