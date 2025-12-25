// QR Code generation - Coffee-themed QR code
export async function generateQRCode(amount: number): Promise<string> {
  const qrData = `COFFEEPAY-${amount.toFixed(2)}-${Date.now()}`;
  
  try {
    // Try to use qrcode library if available
    // @ts-ignore - Dynamic import may not have types
    const QRCodeModule = await import('qrcode');
    const QRCode = QRCodeModule.default || QRCodeModule;
    
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#8B4513', // Coffee brown
        light: '#FFFFFF',
      },
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code, using fallback:', error);
    // Fallback: return a coffee-themed SVG QR code mock
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
        <defs>
          <pattern id="qrPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#8B4513"/>
            <rect x="10" y="10" width="10" height="10" fill="#8B4513"/>
          </pattern>
        </defs>
        <rect width="300" height="300" fill="#F5F5F5"/>
        <rect x="50" y="50" width="200" height="200" fill="url(#qrPattern)" opacity="0.8"/>
        <circle cx="150" cy="150" r="40" fill="#8B4513" opacity="0.3"/>
        <text x="150" y="140" text-anchor="middle" font-size="18" font-weight="bold" fill="#8B4513">☕</text>
        <text x="150" y="165" text-anchor="middle" font-size="14" fill="#8B4513">CoffeePay</text>
        <text x="150" y="185" text-anchor="middle" font-size="16" font-weight="bold" fill="#8B4513">$${amount.toFixed(2)}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
}

