// QR Code generation - Coffee-themed QR code
// Customizable QR code generator with support for different data formats

export interface QRCodeOptions {
  amount: number;
  userId?: string;
  transactionId?: string;
  type?: 'recharge' | 'withdrawal';
  customData?: string;
  // Appearance options
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

/**
 * Generate QR code with customizable data format
 * 
 * Data format can be customized via environment variable:
 * - QR_DATA_FORMAT: Template string (default: "COFFEEPAY-{amount}-{timestamp}")
 *   Available placeholders: {amount}, {userId}, {transactionId}, {timestamp}, {type}
 */
export async function generateQRCode(
  amount: number,
  options?: Partial<QRCodeOptions>
): Promise<string> {
  // Get default values from settings if available
  let defaultWidth = 300;
  let defaultMargin = 2;
  let defaultDarkColor = '#8B4513';
  let defaultLightColor = '#FFFFFF';
  
  try {
    const { readSettings } = await import('@/lib/db');
    const settings = await readSettings();
    if (settings.qrWidth) defaultWidth = settings.qrWidth;
    if (settings.qrMargin) defaultMargin = settings.qrMargin;
    if (settings.qrDarkColor) defaultDarkColor = settings.qrDarkColor;
    if (settings.qrLightColor) defaultLightColor = settings.qrLightColor;
  } catch {
    // Use defaults if settings not available
  }
  
  const opts: QRCodeOptions = {
    amount,
    width: defaultWidth,
    margin: defaultMargin,
    darkColor: defaultDarkColor,
    lightColor: defaultLightColor,
    ...options, // User-provided options override defaults
  };

  // Build QR data based on format template or default
  // Try to get from settings first, then environment variable, then default
  let format = 'COFFEEPAY-{amount}-{timestamp}';
  try {
    const { readSettings } = await import('@/lib/db');
    const settings = await readSettings();
    if (settings.qrDataFormat) {
      format = settings.qrDataFormat;
    } else if (process.env.QR_DATA_FORMAT) {
      format = process.env.QR_DATA_FORMAT;
    }
  } catch {
    // Fallback to environment variable or default
    format = process.env.QR_DATA_FORMAT || 'COFFEEPAY-{amount}-{timestamp}';
  }
  
  const timestamp = Date.now();
  
  let qrData = format
    .replace('{amount}', opts.amount.toFixed(2))
    .replace('{userId}', opts.userId || '')
    .replace('{transactionId}', opts.transactionId || timestamp.toString())
    .replace('{timestamp}', timestamp.toString())
    .replace('{type}', opts.type || 'payment');

  // If custom data provided, use it instead
  if (opts.customData) {
    qrData = opts.customData;
  }

  // Fallback to default format if no template matches
  if (qrData === format && !opts.customData) {
    qrData = `COFFEEPAY-${opts.amount.toFixed(2)}-${timestamp}`;
  }
  
  try {
    // Try to use qrcode library if available
    const QRCodeModule = await import('qrcode');
    const QRCode = QRCodeModule.default || QRCodeModule;
    
    const qrCodeDataURL = await (QRCode as any).toDataURL(qrData, {
      width: opts.width || 300,
      margin: opts.margin || 2,
      color: {
        dark: opts.darkColor || '#8B4513',
        light: opts.lightColor || '#FFFFFF',
      },
      errorCorrectionLevel: 'M', // Medium error correction
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code, using fallback:', error);
    // Fallback: return a coffee-themed SVG QR code mock
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${opts.width || 300}" height="${opts.width || 300}" viewBox="0 0 300 300">
        <defs>
          <pattern id="qrPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="${opts.darkColor || '#8B4513'}"/>
            <rect x="10" y="10" width="10" height="10" fill="${opts.darkColor || '#8B4513'}"/>
          </pattern>
        </defs>
        <rect width="300" height="300" fill="${opts.lightColor || '#F5F5F5'}"/>
        <rect x="50" y="50" width="200" height="200" fill="url(#qrPattern)" opacity="0.8"/>
        <circle cx="150" cy="150" r="40" fill="${opts.darkColor || '#8B4513'}" opacity="0.3"/>
        <text x="150" y="140" text-anchor="middle" font-size="18" font-weight="bold" fill="${opts.darkColor || '#8B4513'}">☕</text>
        <text x="150" y="165" text-anchor="middle" font-size="14" fill="${opts.darkColor || '#8B4513'}">CoffeePay</text>
        <text x="150" y="185" text-anchor="middle" font-size="16" font-weight="bold" fill="${opts.darkColor || '#8B4513'}">$${opts.amount.toFixed(2)}</text>
      </svg>
    `;
    // Encode SVG to base64 (server-side only)
    if (typeof Buffer !== 'undefined') {
      return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    }
    // Fallback for client-side: URL encode
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
}

/**
 * Generate QR code for payment gateway URL
 * Example: https://payment.example.com/pay?amount=100&ref=123456
 */
export async function generatePaymentQRCode(
  amount: number,
  paymentUrl: string,
  options?: Partial<QRCodeOptions>
): Promise<string> {
  const transactionId = options?.transactionId || Date.now().toString();
  const url = `${paymentUrl}?amount=${amount}&ref=${transactionId}`;
  
  return generateQRCode(amount, {
    ...options,
    customData: url,
  });
}

