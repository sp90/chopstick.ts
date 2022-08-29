import { ChopResponse } from '../bootstrap/response'

export type TMethods = 'GET' | 'PATCH' | 'PUT' | 'POST' | 'DELETE'

export type TRouteCbFunction = (
  req: TChopReq,
  res: TChopRes,
  next?: TChopNext
) => any

export type TRouteCbObj = {
  order: number
  cb: TRouteCbFunction
}

export type TRouteErrorCbFunction = (
  error: Error,
  req: TChopReq,
  res: any
) => any
export type TExecutions = TRouteCbObj | TRouteCbObj[]
export type TExecutionFns = TRouteCbFunction | TRouteCbFunction[]

export interface IChopListenOptions {
  port: string | number
}

export interface IMethodDirectory {
  GET?: TRouteCbObj[]
  PUT?: TRouteCbObj[]
  PATCH?: TRouteCbObj[]
  POST?: TRouteCbObj[]
  DELETE?: TRouteCbObj[]
}

export interface IUseDirectory {
  [key: string]: TRouteCbFunction[]
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

export type TChopNext = Function

export type TChopRes = ChopResponse
export interface IListenCallback {}
