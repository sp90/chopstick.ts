import { IObj, THelloReq } from '../utility/routeHelpers'

export function helloRequest(req: Request, query: IObj, routeData?: any) {
  const requestObj: THelloReq = {
    bunReq: req,
    originalUrl: req.url,
  }

  if (routeData) {
    requestObj.query = query
    requestObj.params = routeData.matchObj.params
  }

  return requestObj
}
