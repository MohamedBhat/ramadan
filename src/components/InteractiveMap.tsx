import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation, Route } from 'lucide-react';
import { Location } from '../types';

interface InteractiveMapProps {
  locations: Location[];
  currentLocation: { lat: number; lng: number; address: string } | null;
  optimizedRoute: Location[];
}

export default function InteractiveMap({ locations, currentLocation, optimizedRoute }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // تحميل مكتبة Leaflet ديناميكياً
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        // إضافة CSS الخاص بـ Leaflet
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // تحميل JavaScript الخاص بـ Leaflet
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else if (window.L) {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // إنشاء الخريطة
      const map = window.L.map(mapRef.current).setView([30.0444, 31.2357], 10);

      // إضافة طبقة الخريطة
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      updateMapContent();
    };

    const updateMapContent = () => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // مسح جميع العلامات السابقة
      map.eachLayer((layer: any) => {
        if (layer instanceof window.L.Marker || layer instanceof window.L.Polyline) {
          map.removeLayer(layer);
        }
      });

      const bounds = window.L.latLngBounds([]);

      // إضافة علامة الموقع الحالي
      if (currentLocation) {
        const currentIcon = window.L.divIcon({
          html: `<div style="background: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          className: 'custom-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        window.L.marker([currentLocation.lat, currentLocation.lng], { icon: currentIcon })
          .addTo(map)
          .bindPopup(`<strong>موقعك الحالي</strong><br>${currentLocation.address}`);
        
        bounds.extend([currentLocation.lat, currentLocation.lng]);
      }

      // إضافة علامات المواقع
      locations.forEach((location, index) => {
        const isInRoute = optimizedRoute.some(routeLocation => routeLocation.id === location.id);
        const routeIndex = optimizedRoute.findIndex(routeLocation => routeLocation.id === location.id);
        
        const color = isInRoute ? '#3b82f6' : '#6b7280';
        const number = isInRoute ? routeIndex + 1 : '';
        
        const locationIcon = window.L.divIcon({
          html: `<div style="background: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${number}</div>`,
          className: 'custom-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        window.L.marker([location.lat, location.lng], { icon: locationIcon })
          .addTo(map)
          .bindPopup(`<strong>${location.name}</strong><br>${location.address}<br><small>الإحداثيات: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</small>`);
        
        bounds.extend([location.lat, location.lng]);
      });

      // رسم المسار المحسن
      if (optimizedRoute.length > 0 && currentLocation) {
        const routeCoords = [
          [currentLocation.lat, currentLocation.lng],
          ...optimizedRoute.map(location => [location.lat, location.lng])
        ];

        window.L.polyline(routeCoords, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 5'
        }).addTo(map);
      }

      // تعديل عرض الخريطة لتشمل جميع النقاط
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    };

    loadLeaflet();

    // تحديث الخريطة عند تغيير البيانات
    if (mapInstanceRef.current) {
      updateMapContent();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [locations, currentLocation, optimizedRoute]);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">خريطة المواقع</h2>
      </div>

      {/* الخريطة */}
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-xl border border-gray-200 bg-gray-100"
        style={{ minHeight: '400px' }}
      />

      {/* مفتاح الخريطة */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
          <span className="text-sm font-medium text-green-800">موقعك الحالي</span>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow flex items-center justify-center">
            <span className="text-white text-xs font-bold">1</span>
          </div>
          <span className="text-sm font-medium text-blue-800">مواقع المسار</span>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="w-6 h-6 bg-gray-500 rounded-full border-2 border-white shadow"></div>
          <span className="text-sm font-medium text-gray-800">مواقع أخرى</span>
        </div>
      </div>

      {/* معلومات إضافية */}
      {locations.length === 0 && !currentLocation && (
        <div className="mt-4 text-center py-8">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            لا توجد مواقع لعرضها
          </h3>
          <p className="text-gray-500">
            أضف موقعك الحالي وبعض المواقع لرؤيتها على الخريطة
          </p>
        </div>
      )}

      {optimizedRoute.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Route className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-blue-800">المسار المحسن</h3>
          </div>
          <p className="text-sm text-blue-700">
            الخط المتقطع يوضح المسار المحسن من موقعك الحالي إلى جميع المواقع بالترتيب الأمثل
          </p>
        </div>
      )}
    </div>
  );
}