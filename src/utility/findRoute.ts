import {
  match,
  MatchResult,
} from '../../node_modules/path-to-regexp/dist/index'
import { IPathDirectory, TMethods, TRouteCbFunction } from './routeHelpers'

interface IRoute {
  matchObj: MatchResult<object>
  matchExecArr: TRouteCbFunction[]
}

const findRoute = (
  method: TMethods,
  urlPathName: string,
  pathDirectory: IPathDirectory
): IRoute | null => {
  const pathsToMatch = Object.keys(pathDirectory)
  const finalRoute = pathsToMatch
    .map((matchingPath) => {
      const matchObj = match(matchingPath, { decode: decodeURIComponent })(
        urlPathName
      )

      const matchExecArr = matchObj && pathDirectory[matchingPath][method]

      if (matchExecArr) {
        return {
          matchObj,
          matchExecArr,
        }
      }

      return null
    })
    .find((item) => item)

  return finalRoute ? finalRoute : null
}

export default findRoute
