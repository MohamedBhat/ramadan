import React from 'react';
import { Route, Clock, MapPin, Navigation } from 'lucide-react';
import { Location } from '../types';
import { optimizeRoute, calculateDistance, estimateTime, formatDistance } from '../utils/locationUtils';

interface RouteOptimizerProps {
  locations: Location[];
  currentLocation: { lat: number; lng: number; address: string } | null;
  onOptimize: (optimizedRoute: Location[]) => void;
}

export default function RouteOptimizer({ locations, currentLocation, onOptimize }: RouteOptimizerProps) {
  const handleOptimize = () => {
    if (!currentLocation || locations.length === 0) return;

    const optimizedRoute = optimizeRoute(locations, currentLocation.lat, currentLocation.lng);
    onOptimize(optimizedRoute);
  };

  const calculateTotalStats = () => {
    if (!currentLocation || locations.length === 0) return null;

    const optimizedRoute = optimizeRoute(locations, currentLocation.lat, currentLocation.lng);
    let totalDistance = 0;
    let currentLat = currentLocation.lat;
    let currentLng = currentLocation.lng;

    optimizedRoute.forEach(location => {
      totalDistance += calculateDistance(currentLat, currentLng, location.lat, location.lng);
      currentLat = location.lat;
      currentLng = location.lng;
    });

    return {
      totalDistance: formatDistance(totalDistance),
      totalTime: estimateTime(totalDistance),
      locationsCount: locations.length
    };
  };

  const stats = calculateTotalStats();

  if (!currentLocation) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            يرجى تحديد موقعك الحالي أولاً
          </h3>
          <p className="text-gray-500">
            لتتمكن من تحسين المسار، نحتاج لمعرفة نقطة البداية
          </p>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            لا توجد مواقع مضافة
          </h3>
          <p className="text-gray-500">
            أضف بعض المواقع لتتمكن من تحسين المسار
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
          <Route className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">تحسين المسار</h2>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">عدد المواقع</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{stats.locationsCount}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Route className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">إجمالي المسافة</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{stats.totalDistance}</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">الوقت المقدر</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{stats.totalTime}</p>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200 mb-6">
        <h3 className="font-medium text-orange-800 mb-2">كيف يعمل تحسين المسار؟</h3>
        <ul className="text-sm text-orange-700 space-y-1">
          <li>• يحسب المسافة بين موقعك وجميع المواقع المضافة</li>
          <li>• يرتب المواقع بحيث تزور الأقرب أولاً</li>
          <li>• يقلل من إجمالي المسافة والوقت المطلوب</li>
          <li>• يوفر لك مسار محسن للرحلة</li>
        </ul>
      </div>

      <button
        onClick={handleOptimize}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Route className="w-5 h-5" />
        تحسين المسار الآن
      </button>
    </div>
  );
}