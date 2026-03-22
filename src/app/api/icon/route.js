import { ImageResponse } from 'next/og'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const size = parseInt(searchParams.get('size') ?? '192')
  const fontSize = Math.round(size * 0.5)
  const radius  = Math.round(size * 0.2)

  return new ImageResponse(
    <div style={{
      background: 'linear-gradient(135deg, #1a4520 0%, #286d2f 100%)',
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      borderRadius: `${radius}px`,
    }}>
      <div style={{ fontSize, lineHeight: 1 }}>🌾</div>
      <div style={{
        color: '#f1c929',
        fontSize: Math.round(size * 0.14),
        fontWeight: 'bold',
        marginTop: Math.round(size * 0.04),
        letterSpacing: '-0.5px',
      }}>
        SDV
      </div>
    </div>,
    { width: size, height: size }
  )
}
