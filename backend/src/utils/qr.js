import qrcode from "qrcode";

export const generateQR = async (data = "ticket") => {
  try {
    const qrCodeDataURL = await qrcode.toDataURL(data);
    return qrCodeDataURL;
  } catch (error) {
    throw new Error("Failed to generate QR code");
  }
};