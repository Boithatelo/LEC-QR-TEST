declare module "qrcode" {
  type QrCodeColorOptions = {
    dark?: string
    light?: string
  }

  type QrCodeToStringOptions = {
    type?: string
    width?: number
    margin?: number
    color?: QrCodeColorOptions
  }

  const QRCode: {
    toString(value: string, options?: QrCodeToStringOptions): Promise<string>
  }

  export default QRCode
}
