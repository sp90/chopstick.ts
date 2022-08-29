import { TRouteCbObj } from './routeHelpers'

export default (matchExecArr: TRouteCbObj[]) => {
  return matchExecArr
    .sort((a: TRouteCbObj, b: TRouteCbObj) => (a.order > b.order ? 1 : -1))
    .map((obj: TRouteCbObj) => obj.cb)
    .flat()
}
