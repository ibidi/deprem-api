import { Earthquake } from './types';

export interface EarlyWarningAlert {
  id: string;
  earthquake: Earthquake;
  severity: 'critical' | 'high' | 'medium' | 'low';
  estimatedArrival?: number; // saniye cinsinden
  affectedCities: string[];
  recommendation: string;
  timestamp: number;
}

// Deprem büyüklüğüne göre tehlike seviyesi
export function getSeverityLevel(magnitude: number): 'critical' | 'high' | 'medium' | 'low' {
  if (magnitude >= 7.0) return 'critical';
  if (magnitude >= 5.5) return 'high';
  if (magnitude >= 4.0) return 'medium';
  return 'low';
}

// Deprem dalgasının tahmini varış süresi (basit hesaplama)
// P dalgası: ~6 km/s, S dalgası: ~3.5 km/s
export function estimateArrivalTime(
  epicenterLat: number,
  epicenterLon: number,
  targetLat: number,
  targetLon: number
): number {
  const distance = calculateDistance(epicenterLat, epicenterLon, targetLat, targetLon);
  const pWaveSpeed = 6; // km/s
  const arrivalTime = distance / pWaveSpeed;
  return Math.round(arrivalTime);
}

// İki nokta arası mesafe hesaplama (Haversine formülü)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Dünya yarıçapı (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Büyük şehirlerin koordinatları
const MAJOR_CITIES = [
  { name: 'İstanbul', lat: 41.0082, lon: 28.9784, population: 15840900 },
  { name: 'Ankara', lat: 39.9334, lon: 32.8597, population: 5663322 },
  { name: 'İzmir', lat: 38.4192, lon: 27.1287, population: 4425789 },
  { name: 'Bursa', lat: 40.1826, lon: 29.0665, population: 3147818 },
  { name: 'Antalya', lat: 36.8969, lon: 30.7133, population: 2619832 },
  { name: 'Adana', lat: 37.0000, lon: 35.3213, population: 2258718 },
  { name: 'Konya', lat: 37.8746, lon: 32.4932, population: 2250020 },
  { name: 'Gaziantep', lat: 37.0662, lon: 37.3833, population: 2130432 },
  { name: 'Şanlıurfa', lat: 37.1591, lon: 38.7969, population: 2115256 },
  { name: 'Kocaeli', lat: 40.8533, lon: 29.8815, population: 1997258 },
];

// Etkilenebilecek şehirleri bul
export function getAffectedCities(
  epicenterLat: number,
  epicenterLon: number,
  magnitude: number
): string[] {
  // Büyüklüğe göre etki yarıçapı (basitleştirilmiş)
  let radius = 0;
  if (magnitude >= 7.0) radius = 500;
  else if (magnitude >= 6.0) radius = 300;
  else if (magnitude >= 5.0) radius = 150;
  else if (magnitude >= 4.0) radius = 75;
  else radius = 30;

  return MAJOR_CITIES
    .filter(city => {
      const distance = calculateDistance(
        epicenterLat,
        epicenterLon,
        city.lat,
        city.lon
      );
      return distance <= radius;
    })
    .sort((a, b) => {
      const distA = calculateDistance(epicenterLat, epicenterLon, a.lat, a.lon);
      const distB = calculateDistance(epicenterLat, epicenterLon, b.lat, b.lon);
      return distA - distB;
    })
    .map(city => city.name);
}

// Öneriler oluştur
export function getRecommendation(severity: 'critical' | 'high' | 'medium' | 'low'): string {
  switch (severity) {
    case 'critical':
      return '🚨 ACİL: Hemen güvenli bir alana geçin! Masaların altına saklanın. Pencerelerden uzak durun. Asansör kullanmayın!';
    case 'high':
      return '⚠️ DİKKAT: Güvenli bir konuma geçin. Sağlam masa veya kapı pervazının altına saklanın. Sakin olun!';
    case 'medium':
      return '⚡ UYARI: Hazırlıklı olun. Çıkış yollarını kontrol edin. Acil durum çantanızı hazır bulundurun.';
    case 'low':
      return 'ℹ️ BİLGİ: Küçük bir sarsıntı hissedilebilir. Panik yapmayın, normal aktivitelerinize devam edebilirsiniz.';
  }
}

// Erken uyarı oluştur
export function createEarlyWarning(earthquake: Earthquake): EarlyWarningAlert {
  const magnitude = Math.max(
    earthquake.size.md,
    earthquake.size.ml,
    earthquake.size.mw
  );
  
  const severity = getSeverityLevel(magnitude);
  const affectedCities = getAffectedCities(
    earthquake.latitude,
    earthquake.longitude,
    magnitude
  );
  
  // İstanbul için tahmini varış süresi (örnek)
  const istanbulArrival = estimateArrivalTime(
    earthquake.latitude,
    earthquake.longitude,
    41.0082,
    28.9784
  );

  return {
    id: `alert-${earthquake.id}-${Date.now()}`,
    earthquake,
    severity,
    estimatedArrival: istanbulArrival,
    affectedCities,
    recommendation: getRecommendation(severity),
    timestamp: Date.now()
  };
}

// Son 5 dakikadaki büyük depremleri kontrol et
export function checkForRecentLargeEarthquakes(
  earthquakes: Earthquake[],
  minMagnitude: number = 4.0
): EarlyWarningAlert[] {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  
  return earthquakes
    .filter(eq => {
      const magnitude = Math.max(eq.size.md, eq.size.ml, eq.size.mw);
      return magnitude >= minMagnitude && eq.timestamp * 1000 >= fiveMinutesAgo;
    })
    .map(eq => createEarlyWarning(eq));
}

// Kullanıcının konumuna göre uyarı
export function getUserLocationWarning(
  earthquake: Earthquake,
  userLat: number,
  userLon: number
): EarlyWarningAlert & { distance: number; arrivalTime: number } {
  const warning = createEarlyWarning(earthquake);
  const distance = calculateDistance(
    earthquake.latitude,
    earthquake.longitude,
    userLat,
    userLon
  );
  const arrivalTime = estimateArrivalTime(
    earthquake.latitude,
    earthquake.longitude,
    userLat,
    userLon
  );

  return {
    ...warning,
    distance,
    arrivalTime
  };
}
