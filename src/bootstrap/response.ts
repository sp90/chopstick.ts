export type ResType = 'text' | 'json' | 'buffer' | 'arrayBuffer'

export class ChopResponse {
  private asType: ResType
  private _status: number = 200
  private _responseBody: string
  private _headers = { 'Content-Type': 'application/json' }

  userData = undefined

  constructor() {}

  status(status: number) {
    this._status = status

    return this
  }

  text(message: string) {
    this._responseBody = message
    this.asType = 'text'

    return this
  }

  json(message: any) {
    this._responseBody = message
    this.asType = 'json'

    return this
  }

  bunRes() {
    if (this.asType === 'json') {
      return Response.json(this._responseBody, {
        headers: this._headers,
        status: this._status,
      })
    }

    if (this.asType === 'text') {
      return new Response(this._responseBody, {
        headers: this._headers,
        status: this._status,
      })
    }
  }
}
