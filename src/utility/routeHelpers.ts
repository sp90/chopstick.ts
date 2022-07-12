export type TMethods = 'GET' | 'PATCH' | 'PUT' | 'POST' | 'DELETE'

export type TRouteCbFunction = (req: TChopReq, res: any) => any
export type TExecutions = TRouteCbFunction | TRouteCbFunction[]

export const setExecutions = (executions: TExecutions) => {
  if (typeof executions === 'function') {
    return [executions]
  }

  return executions
}

export interface IPathDirectory {
  [key: string]: {
    GET?: TRouteCbFunction[]
    PUT?: TRouteCbFunction[]
    PATCH?: TRouteCbFunction[]
    POST?: TRouteCbFunction[]
    DELETE?: TRouteCbFunction[]
  }
}

export interface IObj {
  [key: string]: any
}

export interface IQuery extends IObj {}
export interface IParams extends IObj {}

export type TChopReq = {
  bunReq: Request
  originalUrl: string
  query?: IQuery
  params?: IParams
}

export type TChopRes = {
  // TODO make custom body types available
  _status?: number
  _body?: any
  json: Function
  text: Function
  status: Function
}
