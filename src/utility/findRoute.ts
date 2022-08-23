import { match, MatchResult } from '../path-to-regex-temp/index'
import {
  IMethodDirectory,
  IPathObj,
  TMethods,
  TRouteCbFunction,
} from './routeHelpers'

interface IRoute {
  matchObj: MatchResult<object>
  matchExecArr: TRouteCbFunction[]
}

const findRoute = (
  method: TMethods,
  urlPathName: string,
  pathDirectory: Map<string, IMethodDirectory>,
  useDirectory: Map<string, IPathObj>
): IRoute | null => {
  const matchExecArr = []
  let matchObj = null

  pathDirectory.forEach((_, matchingPath) => {
    const innerMatchObj = match(matchingPath, { decode: decodeURIComponent })(
      urlPathName
    )

    const innerMatchExecArr =
      innerMatchObj && pathDirectory.get(matchingPath)[method]

    if (innerMatchExecArr) {
      matchExecArr.push(innerMatchExecArr)
    }

    if (!matchObj) {
      matchObj = innerMatchObj
    }
  })

  useDirectory.forEach((_, useMatchingPath) => {
    const matchObj = match(useMatchingPath, { decode: decodeURIComponent })(
      urlPathName
    )

    const innerMatchExecArr = matchObj && useDirectory.get(useMatchingPath)

    if (innerMatchExecArr) {
      matchExecArr.push(innerMatchExecArr)
    }
  })

  if (!matchObj) {
    return null
  }

  return {
    matchObj,
    matchExecArr: matchExecArr
      .sort((a: IPathObj, b: IPathObj) => (a.order > b.order ? 1 : -1))
      .map((obj: IPathObj) => obj.executions)
      .flat(),
  }
}

export default findRoute
