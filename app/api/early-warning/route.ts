import { NextRequest, NextResponse } from 'next/server';
import { getDepremIoData } from '@/lib/scrapers/deprem-io';
import { getUSGSData } from '@/lib/scrapers/usgs';
import { checkForRecentLargeEarthquakes, getUserLocationWarning } from '@/lib/early-warning';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const minMagnitude = parseFloat(searchParams.get('minMagnitude') || '4.0');
  const userLat = parseFloat(searchParams.get('lat') || '0');
  const userLon = parseFloat(searchParams.get('lon') || '0');

  try {
    // En hızlı kaynakları kullan (Deprem.io ve USGS)
    const [depremIoData, usgsData] = await Promise.all([
      getDepremIoData(),
      getUSGSData()
    ]);

    // Tüm verileri birleştir
    const allEarthquakes = [...depremIoData, ...usgsData];

    // Son 5 dakikadaki büyük depremleri kontrol et
    const alerts = checkForRecentLargeEarthquakes(allEarthquakes, minMagnitude);

    // Kullanıcı konumu verilmişse, ona özel uyarı oluştur
    let userAlert = null;
    if (userLat !== 0 && userLon !== 0 && alerts.length > 0) {
      userAlert = getUserLocationWarning(alerts[0].earthquake, userLat, userLon);
    }

    return NextResponse.json({
      alerts,
      userAlert,
      totalEarthquakes: allEarthquakes.length,
      timestamp: Date.now(),
      message: alerts.length > 0 
        ? `${alerts.length} adet erken uyarı bulundu!` 
        : 'Şu anda aktif erken uyarı yok.'
    });
  } catch (error) {
    console.error('Early warning API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch early warning data' },
      { status: 500 }
    );
  }
}
