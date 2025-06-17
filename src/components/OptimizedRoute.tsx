import React from 'react';
import { MapPin, Navigation, Clock, Route, ExternalLink } from 'lucide-react';
import { Location } from '../types';
import { calculateDistance, estimateTime, formatDistance } from '../utils/locationUtils';

interface OptimizedRouteProps {
  route: Location[];
  currentLocation: { lat: number; lng: number; address: string };
}

export default function OptimizedRoute({ route, currentLocation }: OptimizedRouteProps) {
  const generateGoogleMapsUrl = () => {
    // إنشاء رابط خرائط جوجل مع جميع النقاط
    const origin = `${currentLocation.lat},${currentLocation.lng}`;
    const destination = route.length > 0 ? `${route[route.length - 1].lat},${route[route.length - 1].lng}` : origin;
    
    // إضافة النقاط الوسطية (waypoints) إذا كان هناك أكثر من موقع واحد
    let waypointsParam = '';
    if (route.length > 1) {
      const waypoints = route.slice(0, -1).map(location => `${location.lat},${location.lng}`).join('|');
      waypointsParam = `&waypoints=${waypoints}`;
    }
    
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointsParam}&travelmode=driving`;
  };

  const generateAlternativeUrl = () => {
    // رابط بديل يتضمن جميع النقاط في تسلسل
    const allPoints = [
      `${currentLocation.lat},${currentLocation.lng}`,
      ...route.map(location => `${location.lat},${location.lng}`)
    ];
    return `https://www.google.com/maps/dir/${allPoints.join('/')}`;
  };

  const calculateStepDetails = (index: number) => {
    let fromLat = currentLocation.lat;
    let fromLng = currentLocation.lng;
    
    if (index > 0) {
      fromLat = route[index - 1].lat;
      fromLng = route[index - 1].lng;
    }
    
    const toLat = route[index].lat;
    const toLng = route[index].lng;
    
    const distance = calculateDistance(fromLat, fromLng, toLat, toLng);
    const time = estimateTime(distance);
    
    return {
      distance: formatDistance(distance),
      time
    };
  };

  const calculateTotalStats = () => {
    let totalDistance = 0;
    let currentLat = currentLocation.lat;
    let currentLng = currentLocation.lng;

    route.forEach(location => {
      totalDistance += calculateDistance(currentLat, currentLng, location.lat, location.lng);
      currentLat = location.lat;
      currentLng = location.lng;
    });

    return {
      totalDistance: formatDistance(totalDistance),
      totalTime: estimateTime(totalDistance)
    };
  };

  const totalStats = calculateTotalStats();

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
            <Route className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">المسار المحسن</h2>
        </div>
        
        <div className="flex gap-2">
          <a
            href={generateGoogleMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            خرائط جوجل
          </a>
          <a
            href={generateAlternativeUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Navigation className="w-4 h-4" />
            مسار بديل
          </a>
        </div>
      </div>

      {/* إحصائيات إجمالية */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Route className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">إجمالي المسافة</span>
          </div>
          <p className="text-xl font-bold text-green-900">{totalStats.totalDistance}</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">الوقت المقدر</span>
          </div>
          <p className="text-xl font-bold text-blue-900">{totalStats.totalTime}</p>
        </div>
      </div>

      {/* معلومات المسار */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
        <h3 className="font-medium text-yellow-800 mb-2">📍 معلومات المسار</h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>• نقطة البداية: موقعك الحالي</p>
          <p>• عدد المحطات: {route.length} موقع</p>
          <p>• ترتيب المسار: من الأقرب إلى الأبعد</p>
          <p>• إذا لم يعمل الرابط الأول، جرب الرابط البديل</p>
        </div>
      </div>

      {/* نقطة البداية */}
      <div className="mb-4">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Navigation className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-green-800">نقطة البداية</h3>
            <p className="text-sm text-green-700">{currentLocation.address}</p>
            <p className="text-xs text-green-600 mt-1 ltr">
              {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </p>
          </div>
        </div>
      </div>

      {/* خطوات المسار */}
      <div className="space-y-3">
        {route.map((location, index) => {
          const stepDetails = calculateStepDetails(index);
          
          return (
            <div key={location.id} className="relative">
              {/* خط الاتصال */}
              {index < route.length - 1 && (
                <div className="absolute right-4 top-16 w-0.5 h-8 bg-gray-300"></div>
              )}
              
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">{location.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                  <p className="text-xs text-gray-500 mb-2 ltr">
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Route className="w-3 h-3" />
                      <span>{stepDetails.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{stepDetails.time}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="فتح هذا الموقع في خرائط جوجل"
                  >
                    <MapPin className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* نصائح */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <h3 className="font-medium text-blue-800 mb-2">💡 نصائح للاستخدام</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• استخدم زر "خرائط جوجل" للحصول على الاتجاهات الكاملة</li>
          <li>• إذا لم يعمل الرابط، جرب "مسار بديل"</li>
          <li>• يمكنك النقر على أيقونة الموقع لفتح كل نقطة منفردة</li>
          <li>• تأكد من تفعيل الموقع الجغرافي في المتصفح</li>
        </ul>
      </div>
    </div>
  );
}