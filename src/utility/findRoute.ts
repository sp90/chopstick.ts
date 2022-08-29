import { match, MatchResult } from '../path-to-regex-temp/index'
import exectionMap from './exectionMap'
import {
  IMethodDirectory,
  TMethods,
  TRouteCbFunction,
  TRouteCbObj,
} from './routeHelpers'

interface IRoute {
  matchObj: MatchResult<object>
  matchExecArr: TRouteCbFunction[]
}

const findRoute = (
  method: TMethods,
  urlPathName: string,
  pathDirectory: Map<string, IMethodDirectory>,
  useDirectory: Map<string, TRouteCbObj[]>
): IRoute | null => {
  let matchExecArr: TRouteCbObj[] = []
  let matchObj = null

  pathDirectory.forEach((_, matchingPath) => {
    const innerMatchObj = match(matchingPath, { decode: decodeURIComponent })(
      urlPathName
    )

    const innerMatchExecArr =
      innerMatchObj && pathDirectory.get(matchingPath)[method]

    if (innerMatchExecArr?.length) {
      matchExecArr = matchExecArr.concat(innerMatchExecArr)
    }

    if (!matchObj && innerMatchObj) {
      matchObj = innerMatchObj
    }
  })

  useDirectory.forEach((_, useMatchingPath) => {
    const matchObj = match(useMatchingPath, { decode: decodeURIComponent })(
      urlPathName
    )

    const innerMatchExecArr = matchObj && useDirectory.get(useMatchingPath)

    if (innerMatchExecArr) {
      matchExecArr = matchExecArr.concat(innerMatchExecArr)
    }
  })

  if (!matchObj) {
    return null
  }

  return {
    matchObj,
    matchExecArr: exectionMap(matchExecArr),
  }
}

export default findRoute
