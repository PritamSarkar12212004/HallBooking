/**
 * Hall payment QR (owned by the CEO, stored on the backend).
 *
 * `isConfigured` is false until the CEO uploads a QR + bank holder name —
 * the app then shows the upload form instead of a QR.
 */
export interface PaymentQrSettings {
    bankHolderName: string | null;
    qrUrl: string | null;
    isConfigured: boolean;
    updatedAt: string | null;
}
