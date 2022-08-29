export type ResType = 'text' | 'json' | 'buffer' | 'arrayBuffer'
export interface IHeaderObj {
  [key: string]: string
}

const DEFAULT_SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self';base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Expect-CT': 'max-age=0',
  'Origin-Agent-Cluster': '?1',
  'Referrer-Policy': 'no-referrer',
  'Strict-Transport-Security': 'max-age=15552000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-DNS-Prefetch-Control': 'off',
  'X-Download-Options': 'noopen',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-XSS-Protection': '0',
}

export class ChopResponse {
  private _status: number = 200
  private _responseClass = null

  headers = DEFAULT_SECURITY_HEADERS
  userData = undefined
  connectionClosed = false

  constructor() {}

  setHeader(key: string, value: string) {
    this.headers[key] = value
  }

  setHeaders(headerObj: IHeaderObj) {
    this.headers = { ...this.headers, ...headerObj }
  }

  status(status: number) {
    this._status = status

    return this
  }

  text(message: string) {
    this._responseClass = new Response(message, {
      headers: this.headers,
      status: this._status,
    })
  }

  // TODO rewrite send
  send(message: string) {
    this._responseClass = new Response(message, {
      headers: this.headers,
      status: this._status,
    })
  }

  json(jsonContent: any) {
    this._responseClass = Response.json(jsonContent, {
      headers: this.headers,
      status: this._status,
    })
  }

  end() {
    this._responseClass = new Response('', {
      headers: this.headers,
      status: this._status,
    })
  }

  getResponseClass(): Response {
    return this._responseClass
  }
}
