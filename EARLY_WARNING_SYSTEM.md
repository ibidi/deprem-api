# 🚨 Erken Uyarı Sistemi

## 📋 Genel Bakış

Deprem Takip Sistemi, büyük depremleri otomatik olarak tespit eden ve kullanıcıları uyaran gelişmiş bir erken uyarı sistemine sahiptir.

## ✨ Özellikler

### 1. Otomatik Tespit
- ✅ 4.0+ büyüklüğündeki depremler otomatik tespit edilir
- ✅ Son 5 dakika içindeki depremler izlenir
- ✅ Her 30 saniyede bir kontrol yapılır
- ✅ En hızlı kaynaklar kullanılır (Deprem.io, USGS)

### 2. Tarayıcı Bildirimleri
- ✅ Büyük deprem tespit edildiğinde anında bildirim
- ✅ Kullanıcı izni ile çalışır
- ✅ Arka planda bile çalışır

### 3. Tehlike Seviyeleri

| Seviye | Büyüklük | Renk | Açıklama |
|--------|----------|------|----------|
| 🚨 Kritik | 7.0+ | Kırmızı | Acil durum! Hemen güvenli alana geçin |
| ⚠️ Yüksek | 5.5-6.9 | Turuncu | Dikkat! Güvenli konuma geçin |
| ⚡ Orta | 4.0-5.4 | Sarı | Uyarı! Hazırlıklı olun |
| ℹ️ Düşük | <4.0 | Mavi | Bilgi amaçlı |

### 4. Tahmini Varış Süresi
- ✅ P dalgası hızı: ~6 km/s
- ✅ S dalgası hızı: ~3.5 km/s
- ✅ Kullanıcı konumuna göre hesaplama
- ✅ Saniye cinsinden gösterim

### 5. Etkilenebilecek Şehirler
- ✅ Büyüklüğe göre etki yarıçapı hesaplama
- ✅ 10 büyük şehir için kontrol
- ✅ Mesafeye göre sıralama
- ✅ Nüfus bilgisi

## 🎯 Nasıl Çalışır?

### 1. Veri Toplama
```
Deprem.io + USGS → En hızlı kaynaklar
↓
Her 30 saniyede kontrol
↓
Son 5 dakikadaki veriler
```

### 2. Analiz
```
Büyüklük kontrolü (≥4.0)
↓
Tehlike seviyesi belirleme
↓
Etkilenebilecek şehirler
↓
Varış süresi hesaplama
```

### 3. Uyarı
```
Ekranda banner gösterimi
↓
Tarayıcı bildirimi
↓
Öneriler ve talimatlar
```

## 📊 Hesaplamalar

### Mesafe Hesaplama (Haversine Formülü)
```typescript
distance = 2 * R * arcsin(√(sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)))
```

### Varış Süresi
```typescript
arrivalTime = distance / waveSpeed
P dalgası: 6 km/s
S dalgası: 3.5 km/s
```

### Etki Yarıçapı
| Büyüklük | Yarıçap |
|----------|---------|
| 7.0+ | 500 km |
| 6.0-6.9 | 300 km |
| 5.0-5.9 | 150 km |
| 4.0-4.9 | 75 km |
| <4.0 | 30 km |

## 🔔 Bildirim İzni

İlk ziyarette tarayıcı bildirim izni istenir:

```javascript
if ('Notification' in window) {
  Notification.requestPermission();
}
```

## 🌍 Kullanıcı Konumu

Konum izni verilirse:
- ✅ Daha hassas uyarılar
- ✅ Kişiselleştirilmiş varış süresi
- ✅ Mesafe bilgisi

## 📱 API Endpoint

```
GET /api/early-warning
```

### Parametreler
- `minMagnitude` (optional): Minimum büyüklük (varsayılan: 4.0)
- `lat` (optional): Kullanıcı enlemi
- `lon` (optional): Kullanıcı boylamı

### Yanıt
```json
{
  "alerts": [
    {
      "id": "alert-123",
      "severity": "high",
      "affectedCities": ["İstanbul", "Bursa"],
      "recommendation": "Güvenli bir konuma geçin...",
      "estimatedArrival": 45
    }
  ],
  "userAlert": {
    "distance": 120.5,
    "arrivalTime": 20
  },
  "totalEarthquakes": 150,
  "timestamp": 1699000000000
}
```

## 🎨 UI Bileşenleri

### 1. Banner Uyarısı
- Sayfa üstünde gösterilir
- Animasyonlu (pulse)
- Öneriler listesi
- Otomatik gösterim (4.0+ ve son 5 dk)

### 2. Floating Panel
- Sağ alt köşede
- Kapatılabilir
- Çoklu uyarı desteği
- Varış süresi gösterimi

## ⚙️ Yapılandırma

### Kontrol Sıklığı
```typescript
const CHECK_INTERVAL = 30000; // 30 saniye
```

### Minimum Büyüklük
```typescript
const MIN_MAGNITUDE = 4.0;
```

### Zaman Penceresi
```typescript
const TIME_WINDOW = 5 * 60 * 1000; // 5 dakika
```

## 🔒 Güvenlik ve Gizlilik

- ✅ Konum bilgisi sadece tarayıcıda saklanır
- ✅ Sunucuya gönderilmez (opsiyonel)
- ✅ Kullanıcı izni gereklidir
- ✅ İstediğiniz zaman devre dışı bırakılabilir

## 📈 Performans

- ✅ Hafif ve hızlı
- ✅ Arka planda çalışır
- ✅ Minimum kaynak kullanımı
- ✅ Optimize edilmiş API çağrıları

## 🚀 Gelecek Geliştirmeler

- [ ] WebSocket ile gerçek zamanlı güncelleme
- [ ] SMS/Email uyarı entegrasyonu
- [ ] Sesli uyarı sistemi
- [ ] Deprem haritası overlay
- [ ] Artçı sarsıntı tahmini
- [ ] Tsunami uyarı sistemi
- [ ] Acil durum toplanma noktaları
- [ ] Deprem çantası kontrol listesi

## 📞 Acil Durum Numaraları

- **112** - Acil Yardım
- **110** - İtfaiye
- **155** - Polis
- **AFAD** - 122

## ⚠️ Önemli Notlar

1. Bu sistem **bilgilendirme amaçlıdır**
2. Resmi uyarı sistemlerinin yerini almaz
3. Her zaman yerel yetkililerin talimatlarını takip edin
4. Düzenli deprem tatbikatları yapın
5. Acil durum çantanızı hazır bulundurun

## 🎓 Deprem Güvenliği

### Deprem Anında
1. **Sakin olun** - Panik yapmayın
2. **Çök, Kapan, Tutun** - Masanın altına
3. **Pencerelerden uzak durun**
4. **Asansör kullanmayın**
5. **Dışarıdaysanız** - Açık alana geçin

### Deprem Sonrası
1. Yaralıları kontrol edin
2. Gaz, elektrik, su vanalarını kapatın
3. Artçı sarsıntılara hazırlıklı olun
4. Hasar kontrolü yapın
5. Yetkililerin talimatlarını bekleyin

## 📚 Kaynaklar

- [AFAD Deprem Rehberi](https://www.afad.gov.tr/)
- [Kandilli Rasathanesi](http://www.koeri.boun.edu.tr/)
- [USGS Earthquake Hazards](https://earthquake.usgs.gov/)
- [Deprem.io](https://deprem.io/)
