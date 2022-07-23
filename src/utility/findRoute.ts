import { match, MatchResult } from '../path-to-regex-temp/index'
import { IMethodDirectory, TMethods, TRouteCbFunction } from './routeHelpers'

interface IRoute {
  matchObj: MatchResult<object>
  matchExecArr: TRouteCbFunction[]
}

const findRoute = (
  method: TMethods,
  urlPathName: string,
  pathDirectory: Map<string, IMethodDirectory>,
  useDirectory: Map<string, TRouteCbFunction[]>
): IRoute | null => {
  const matches = []
  const useMatches = []

  pathDirectory.forEach((_, matchingPath) => {
    const matchObj = match(matchingPath, { decode: decodeURIComponent })(
      urlPathName
    )

    const matchExecArr = matchObj && pathDirectory.get(matchingPath)[method]

    if (matchExecArr) {
      matches.push({
        matchObj,
        matchExecArr,
      })
    }
  })

  useDirectory.forEach((_, useMatchingPath) => {
    const matchObj = match(useMatchingPath, { decode: decodeURIComponent })(
      urlPathName
    )

    const matchExecArr = matchObj && useDirectory.get(useMatchingPath)

    if (matchExecArr) {
      useMatches.push(matchExecArr)
    }
  })

  const foundMatch = matches.find((item) => item)

  if (foundMatch) {
    foundMatch.matchExecArr = useMatches.flat().concat(foundMatch.matchExecArr)

    return foundMatch
  }

  return null
}

export default findRoute
