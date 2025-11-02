'use client';

import { useState, useEffect } from 'react';
import { Earthquake, SourceType } from '@/lib/types';
import EarlyWarningPanel from '@/components/EarlyWarningPanel';

export default function Home() {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  
  const [filters, setFilters] = useState({
    type: 'kandilli' as SourceType,
    location: '',
    size: '',
    sizeType: 'ml' as 'md' | 'ml' | 'mw',
    isGreater: true,
    hour: ''
  });

  useEffect(() => {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const fetchEarthquakes = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      params.append('type', filters.type);
      if (filters.location) params.append('location', filters.location);
      if (filters.size) params.append('size', filters.size);
      params.append('sizeType', filters.sizeType);
      params.append('isGreater', filters.isGreater ? '1' : '0');
      if (filters.hour) params.append('hour', filters.hour);
      
      const response = await fetch(`/api/earthquakes?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Veri alınamadı');
      }
      
      setEarthquakes(data.earthquakes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMagnitude = (eq: Earthquake) => {
    return Math.max(eq.size.md, eq.size.ml, eq.size.mw);
  };

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude >= 5) return 'bg-red-500';
    if (magnitude >= 4) return 'bg-orange-500';
    if (magnitude >= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getMagnitudeTextColor = (magnitude: number) => {
    if (magnitude >= 5) return 'text-red-600 dark:text-red-400';
    if (magnitude >= 4) return 'text-orange-600 dark:text-orange-400';
    if (magnitude >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center py-6 mb-6 relative">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="absolute top-0 right-0 p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform shadow-lg"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? (
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <div className="inline-block mb-2">
            <div className="text-4xl animate-pulse">🌍</div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Deprem Takip Sistemi
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            AFAD ve Kandilli Rasathanesi verilerine dayalı gerçek zamanlı deprem takibi
          </p>
        </header>

        {/* Early Warning Banner */}
        {earthquakes.length > 0 && earthquakes.some(eq => {
          const magnitude = getMagnitude(eq);
          const isRecent = Date.now() - eq.timestamp * 1000 < 5 * 60 * 1000;
          return magnitude >= 4.0 && isRecent;
        }) && (
          <div className="mb-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white shadow-2xl animate-pulse">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🚨</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">ERKEN UYARI!</h3>
                <p className="text-lg mb-3">
                  Son 5 dakika içinde 4.0+ büyüklüğünde deprem tespit edildi!
                </p>
                <div className="bg-white/20 rounded-lg p-3 text-sm">
                  <p className="font-semibold">⚠️ Öneriler:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Sakin olun ve panik yapmayın</li>
                    <li>Güvenli bir alana geçin</li>
                    <li>Artçı sarsıntılara hazırlıklı olun</li>
                    <li>Acil durum çantanızı hazır bulundurun</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {earthquakes.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-3xl font-bold">{earthquakes.length}</div>
              <div className="text-sm opacity-90">Toplam Deprem</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">⚠️</div>
              <div className="text-3xl font-bold">
                {earthquakes.filter(eq => getMagnitude(eq) >= 4).length}
              </div>
              <div className="text-sm opacity-90">4.0+ Büyüklük</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-3xl font-bold">
                {earthquakes.length > 0 ? getMagnitude(earthquakes[0]).toFixed(1) : '0.0'}
              </div>
              <div className="text-sm opacity-90">En Büyük</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg transform hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">🌐</div>
              <div className="text-3xl font-bold">
                {filters.type === 'kandilli' ? 'KAN' : 
                 filters.type === 'afad' ? 'AFAD' : 
                 filters.type === 'depremio' ? 'D.IO' : 'USGS'}
              </div>
              <div className="text-sm opacity-90">Kaynak</div>
            </div>
          </div>
        )}

        {/* Filters Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span className="text-2xl">🔍</span>
              Filtreleme Seçenekleri
            </h2>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
              Gelişmiş Arama
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <span className="text-lg">📡</span>
                Veri Kaynağı
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as SourceType })}
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer"
              >
                <option value="kandilli">🏛️ Kandilli Rasathanesi</option>
                <option value="afad">🚨 AFAD</option>
                <option value="depremio">⚡ Deprem.io (Anlık)</option>
                <option value="usgs">🌍 USGS (Dünya Çapında)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <span className="text-lg">📍</span>
                Lokasyon
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="Örn: İstanbul, Ankara, İzmir"
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300 dark:hover:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <span className="text-lg">⏰</span>
                Son X Saat
              </label>
              <input
                type="number"
                value={filters.hour}
                onChange={(e) => setFilters({ ...filters, hour: e.target.value })}
                placeholder="Örn: 24"
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300 dark:hover:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <span className="text-lg">📊</span>
                Büyüklük
              </label>
              <input
                type="number"
                step="0.1"
                value={filters.size}
                onChange={(e) => setFilters({ ...filters, size: e.target.value })}
                placeholder="Örn: 3.5"
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300 dark:hover:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <span className="text-lg">📏</span>
                Büyüklük Tipi
              </label>
              <select
                value={filters.sizeType}
                onChange={(e) => setFilters({ ...filters, sizeType: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer"
              >
                <option value="ml">ML (Lokal Magnitüd)</option>
                <option value="md">MD (Süre Magnitüdü)</option>
                <option value="mw">MW (Moment Magnitüd)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <span className="text-lg">🎯</span>
                Filtre Tipi
              </label>
              <select
                value={filters.isGreater ? '1' : '0'}
                onChange={(e) => setFilters({ ...filters, isGreater: e.target.value === '1' })}
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer"
              >
                <option value="1">≥ Büyük veya Eşit</option>
                <option value="0">≤ Küçük veya Eşit</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchEarthquakes}
              disabled={loading}
              className="flex-1 relative group bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-2xl disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Depremleri Getir
                  </>
                )}
              </span>
            </button>
            
            <button
              onClick={() => {
                setFilters({
                  type: 'kandilli',
                  location: '',
                  size: '',
                  sizeType: 'ml',
                  isGreater: true,
                  hour: ''
                });
                setEarthquakes([]);
                setError('');
              }}
              className="px-6 py-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-md"
              title="Filtreleri Temizle"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl flex items-start gap-3 animate-pulse">
              <span className="text-xl">⚠️</span>
              <div>
                <div className="font-semibold mb-1">Hata Oluştu</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!loading && earthquakes.length === 0 && !error && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="text-6xl mb-4 animate-bounce">🔍</div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              Deprem Verisi Bekleniyor
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Filtreleme seçeneklerini ayarlayın ve "Depremleri Getir" butonuna tıklayın
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                Kandilli & AFAD
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                Gerçek Zamanlı
              </span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                5 Dakika Cache
              </span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                Deprem Verileri Yükleniyor...
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {filters.type === 'kandilli' ? 'Kandilli Rasathanesi' : 
                 filters.type === 'afad' ? 'AFAD' :
                 filters.type === 'depremio' ? 'Deprem.io' : 'USGS'} verilerine bağlanılıyor
              </p>
            </div>
          </div>
        )}

        {earthquakes.length > 0 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                <span className="text-3xl">📋</span>
                Deprem Listesi
              </h2>
              <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-bold shadow-lg">
                {earthquakes.length} Sonuç
              </span>
            </div>
            
            <div className="space-y-3">
              {earthquakes.map((eq) => {
                const magnitude = getMagnitude(eq);
                return (
                  <div
                    key={eq.id}
                    className="group bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl p-4 md:p-5 border-2 border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/20 cursor-pointer transform hover:-translate-y-1"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Magnitude Badge */}
                      <div className="flex-shrink-0">
                        <div className={`w-16 h-16 rounded-2xl ${getMagnitudeColor(magnitude)} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
                          <span className="text-white font-bold text-2xl">
                            {magnitude.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex-1">
                            📍 {eq.location}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getMagnitudeColor(magnitude)} text-white`}>
                            {eq.attribute}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 dark:text-slate-400">🕐</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                              {eq.date}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 dark:text-slate-400">📏</span>
                            <span className={`font-bold ${getMagnitudeTextColor(magnitude)}`}>
                              {magnitude.toFixed(1)} Büyüklük
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 dark:text-slate-400">⬇️</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                              {eq.depth.toFixed(1)} km
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 dark:text-slate-400">🌐</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                              {eq.latitude.toFixed(2)}°, {eq.longitude.toFixed(2)}°
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 mb-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
              {/* Hakkında */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <span>ℹ️</span>
                  Hakkında
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Bu proje açık kaynak olarak geliştirilmiştir. AFAD ve Kandilli Rasathanesi verilerini kullanarak gerçek zamanlı deprem takibi sağlar.
                </p>
              </div>

              {/* Teknolojiler */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <span>⚡</span>
                  Teknolojiler
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                    Next.js 16
                  </span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                    TypeScript
                  </span>
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                    Tailwind CSS
                  </span>
                </div>
              </div>

              {/* Geliştirici */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <span>👨‍💻</span>
                  Geliştirici
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  İhsan Baki Doğan tarafından geliştirilmiştir
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://github.com/ibidi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    aria-label="GitHub"
                  >
                    <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a
                    href="https://x.com/ibidicodes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    aria-label="Twitter"
                  >
                    <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="https://linkedin.com/in/ibidi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span>📊</span>
                  <span>Veriler <span className="font-semibold">AFAD</span> ve <span className="font-semibold">Kandilli Rasathanesi</span> kaynaklarından alınmaktadır</span>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href="https://github.com/ibidi/deprem-api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    <span>Açık Kaynak</span>
                  </a>
                  <span className="text-xs text-slate-500 dark:text-slate-500">
                    MIT License © 2025
                  </span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Early Warning Panel */}
      <EarlyWarningPanel />
    </div>
  );
}
