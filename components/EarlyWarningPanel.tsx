'use client';

import { useState, useEffect } from 'react';

interface EarlyWarningAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedCities: string[];
  recommendation: string;
  estimatedArrival?: number;
}

export default function EarlyWarningPanel() {
  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);

  // Kullanıcı konumunu al
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.log('Konum alınamadı:', error);
        }
      );
    }
  }, []);

  // Erken uyarıları kontrol et (her 30 saniyede bir)
  useEffect(() => {
    const checkAlerts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('minMagnitude', '4.0');
        if (userLocation) {
          params.append('lat', userLocation.lat.toString());
          params.append('lon', userLocation.lon.toString());
        }

        const response = await fetch(`/api/early-warning?${params.toString()}`);
        const data = await response.json();
        
        if (data.alerts && data.alerts.length > 0) {
          setAlerts(data.alerts);
          
          // Tarayıcı bildirimi gönder
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🚨 Deprem Erken Uyarı!', {
              body: `${data.alerts.length} adet yeni deprem tespit edildi!`,
              icon: '/earthquake-icon.png'
            });
          }
        } else {
          setAlerts([]);
        }
      } catch (error) {
        console.error('Erken uyarı kontrolü başarısız:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 30000); // 30 saniye

    return () => clearInterval(interval);
  }, [userLocation]);

  // Bildirim izni iste
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'from-red-600 to-red-700';
      case 'high': return 'from-orange-500 to-orange-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      default: return 'ℹ️';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`bg-gradient-to-r ${getSeverityColor(alert.severity)} text-white rounded-2xl shadow-2xl p-6 mb-4 animate-bounce`}
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl">{getSeverityIcon(alert.severity)}</div>
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-2">ERKEN UYARI!</h4>
              <p className="text-sm mb-3">{alert.recommendation}</p>
              
              {alert.affectedCities.length > 0 && (
                <div className="bg-white/20 rounded-lg p-2 text-xs mb-2">
                  <p className="font-semibold mb-1">Etkilenebilecek Şehirler:</p>
                  <p>{alert.affectedCities.join(', ')}</p>
                </div>
              )}
              
              {alert.estimatedArrival && alert.estimatedArrival > 0 && (
                <div className="bg-white/20 rounded-lg p-2 text-xs">
                  <p className="font-semibold">Tahmini Varış: {alert.estimatedArrival} saniye</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
              className="text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
