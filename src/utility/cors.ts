import { ChopReq } from '../../public'
import { ChopResponse } from '../bootstrap/response'

export type TCorsOptions = {
  origin?: string
  methods?: string | string[]
  preflightContinue?: boolean
  credentials?: boolean
  allowedHeaders?: string | string[]
  exposedHeaders?: string | string[]
  optionsSuccessStatus?: number
  maxAge?: number
}

let defaults: TCorsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
}

function isString(s: any) {
  return typeof s === 'string' || s instanceof String
}

function isOriginAllowed(
  origin: string,
  allowedOrigin: string | string[] | RegExp
) {
  if (Array.isArray(allowedOrigin)) {
    for (let i = 0; i < allowedOrigin.length; ++i) {
      if (isOriginAllowed(origin, allowedOrigin[i])) {
        return true
      }
    }
    return false
  } else if (isString(allowedOrigin)) {
    return origin === allowedOrigin
  } else if (allowedOrigin instanceof RegExp) {
    return allowedOrigin.test(origin)
  } else {
    return !!allowedOrigin
  }
}

function configureOrigin(
  options: TCorsOptions,
  req: ChopReq
): Map<string, string> {
  let requestOrigin = req.bunReq.headers.get('origin')
  let headers = new Map<string, string>()
  let isAllowed = null

  if (!options.origin || options.origin === '*') {
    // allow any origin
    headers.set('Access-Control-Allow-Origin', '*')
  } else if (isString(options.origin)) {
    // fixed origin
    headers.set('Access-Control-Allow-Origin', options.origin)
    headers.set('Vary', 'Origin')
  } else {
    isAllowed = isOriginAllowed(requestOrigin, options.origin)
    // reflect origin
    headers.set('Access-Control-Allow-Origin', requestOrigin)
    headers.set('Vary', 'Origin')
  }

  return headers
}

function configureMethods(options: TCorsOptions) {
  let methods = options.methods

  if (Array.isArray(methods) && methods.join) {
    methods = (options.methods as string[]).join(',') // .methods is an array, so turn it into a string
  }

  return new Map<string, string>().set(
    'Access-Control-Allow-Methods',
    methods as string
  )
}

function configureCredentials(options: TCorsOptions) {
  if (options.credentials !== true) return null

  return new Map<string, string>().set(
    'Access-Control-Allow-Credentials',
    'true'
  )
}

function configureAllowedHeaders(options: TCorsOptions, req: ChopReq) {
  let allowedHeaders = options.allowedHeaders
  let headers = new Map<string, string>()

  if (!allowedHeaders) {
    allowedHeaders = req.bunReq.headers.get('access-control-request-headers') // .headers wasn't specified, so reflect the request headers
    headers.set('Vary', 'Access-Control-Request-Headers')
  } else if (Array.isArray(allowedHeaders) && allowedHeaders.join) {
    allowedHeaders = allowedHeaders.join(',') // .headers is an array, so turn it into a string
  }

  if (allowedHeaders?.length) {
    headers.set('Access-Control-Allow-Headers', allowedHeaders as string)
  }

  return headers
}

function configureExposedHeaders(options: TCorsOptions) {
  let headers = options.exposedHeaders

  if (!headers) {
    return null
  } else if (Array.isArray(headers) && headers.join) {
    headers = headers.join(',') // .headers is an array, so turn it into a string
  }

  if (headers && headers.length) {
    return new Map<string, string>().set(
      'Access-Control-Expose-Headers',
      headers as string
    )
  }

  return null
}

function configureMaxAge(options: TCorsOptions) {
  let maxAge =
    (typeof options.maxAge === 'number' || options.maxAge) &&
    options.maxAge.toString()
  if (maxAge && maxAge.length) {
    new Map<string, string>().set('Access-Control-Max-Age', maxAge)
  }
  return null
}

function cors(
  options: TCorsOptions,
  req: ChopReq,
  res: ChopResponse,
  next: Function
) {
  let headers = new Map<string, string>()
  let method =
    req.bunReq.method &&
    req.bunReq.method.toUpperCase &&
    req.bunReq.method.toUpperCase()

  if (method === 'OPTIONS') {
    // preflight
    const originMap = configureOrigin(options, req)
    const credentialsMap = configureCredentials(options)
    const methodsMap = configureMethods(options)
    const allowedHeadersMap = configureAllowedHeaders(options, req)
    const maxAgeMap = configureMaxAge(options)
    const exposedHeadersMap = configureExposedHeaders(options)

    // Filter and then apply those headers to our bunReq headers
    const headerMaps = [
      originMap,
      credentialsMap,
      methodsMap,
      allowedHeadersMap,
      maxAgeMap,
      exposedHeadersMap,
    ]
      .filter((map) => map)
      .forEach((map: Map<string, string>) => {
        map.forEach(req.bunReq.headers.set)
      })
    if (options.preflightContinue) {
      next()
    } else {
      // Safari (and potentially other browsers) need content-length 0,
      //   for 204 or they just hang waiting for a body
      res.status(options.optionsSuccessStatus)
      req.bunReq.headers.set('Content-Length', '0')
      res.end()
    }
  } else {
    // actual response
    const originMap = configureOrigin(options, req)
    const credentialsMap = configureCredentials(options)
    const exposedHeadersMap = configureExposedHeaders(options)

    // Filter and then apply those headers to our bunReq headers
    const headerMaps = [originMap, credentialsMap, exposedHeadersMap]
      .filter((map) => map)
      .forEach((map: Map<string, string>) => {
        map.forEach(req.bunReq.headers.set)
      })

    next()
  }
}

export function corsModule(optionsCallback: Function) {
  return function corsMiddleware(
    req: ChopReq,
    res: ChopResponse,
    next: Function
  ) {
    optionsCallback(req, (err: Error, options: TCorsOptions) => {
      if (err) {
        next(err)
      } else {
        let corsOptions = Object.assign({}, defaults, options)
        let originCallback = null

        if (corsOptions.origin && typeof corsOptions.origin === 'function') {
          originCallback = corsOptions.origin
        } else if (corsOptions.origin) {
          originCallback = (origin: string | null, cb: Function) => {
            cb(null, corsOptions.origin)
          }
        }

        if (originCallback) {
          originCallback(
            req.bunReq.headers.get('origin'),
            (err2: Error, origin: string | null) => {
              if (err2 || !origin) {
                next(err2)
              } else {
                corsOptions.origin = origin
                cors(corsOptions, req, res, next)
              }
            }
          )
        } else {
          next()
        }
      }
    })
  }
}
