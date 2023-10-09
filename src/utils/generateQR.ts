import QRCode from 'qrcode'

const generateQR = async (text: string) => {
    try {
        const qr = QRCode.toDataURL(text);
        return qr
    } catch(err) {
        console.log(err)
    }
}

export default generateQR;