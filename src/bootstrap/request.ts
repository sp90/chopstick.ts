import { IObj, TChopReq } from '../utility/routeHelpers'

export function chopRequest(req: Request, query: IObj, routeData?: any) {
  const requestObj: TChopReq = {
    bunReq: req,
    originalUrl: req.url,
  }

  if (routeData) {
    requestObj.query = query
    requestObj.params = routeData.matchObj.params
  }

  return requestObj
}
