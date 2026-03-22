import { ImageResponse } from 'next/og'

export const size        = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{
      background: 'linear-gradient(135deg, #1a4520, #286d2f)',
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      borderRadius: '40px', gap: '4px',
    }}>
      <div style={{ fontSize: 90, lineHeight: 1 }}>🌾</div>
      <div style={{
        color: '#f1c929', fontSize: 22, fontWeight: 'bold',
        letterSpacing: '-0.5px', fontFamily: 'serif',
      }}>
        SDV
      </div>
    </div>
  )
}
