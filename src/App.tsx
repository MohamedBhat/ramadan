import React, { useState } from 'react';
import { MapPin, Route, Navigation } from 'lucide-react';
import LocationInput from './components/LocationInput';
import CurrentLocationInput from './components/CurrentLocationInput';
import RouteOptimizer from './components/RouteOptimizer';
import OptimizedRoute from './components/OptimizedRoute';
import InteractiveMap from './components/InteractiveMap';
import { Location } from './types';

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [optimizedRoute, setOptimizedRoute] = useState<Location[]>([]);

  const handleAddLocation = (location: Location) => {
    setLocations(prev => [...prev, location]);
  };

  const handleRemoveLocation = (id: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== id));
    // إعادة تعيين المسار المحسن إذا تم حذف موقع
    setOptimizedRoute([]);
  };

  const handleLocationSet = (lat: number, lng: number, address: string) => {
    setCurrentLocation({ lat, lng, address });
    // إعادة تعيين المسار المحسن عند تغيير الموقع الحالي
    setOptimizedRoute([]);
  };

  const handleOptimize = (route: Location[]) => {
    setOptimizedRoute(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
              <Route className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">أبلكيشن للطرق حسين</h1>
              <p className="text-gray-600 mt-1">خطط لرحلتك واحصل على أفضل مسار مع خريطة تفاعلية</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Inputs */}
          <div className="xl:col-span-1 space-y-8">
            <CurrentLocationInput
              onLocationSet={handleLocationSet}
              currentLocation={currentLocation}
            />
            
            <LocationInput
              onAddLocation={handleAddLocation}
              onRemoveLocation={handleRemoveLocation}
              locations={locations}
            />
          </div>

          {/* Middle Column - Map */}
          <div className="xl:col-span-1">
            <InteractiveMap
              locations={locations}
              currentLocation={currentLocation}
              optimizedRoute={optimizedRoute}
            />
          </div>

          {/* Right Column - Route Optimizer & Results */}
          <div className="xl:col-span-1 space-y-8">
            <RouteOptimizer
              locations={locations}
              currentLocation={currentLocation}
              onOptimize={handleOptimize}
            />

            {optimizedRoute.length > 0 && currentLocation && (
              <OptimizedRoute
                route={optimizedRoute}
                currentLocation={currentLocation}
              />
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">إدخال متقدم للمواقع</h3>
            <p className="text-gray-600">أضف المواقع بالعنوان أو الإحداثيات الجغرافية</p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Route className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">تحسين المسار</h3>
            <p className="text-gray-600">احصل على أقصر مسار يمر بجميع المواقع</p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">التنقل السهل</h3>
            <p className="text-gray-600">افتح المسار مباشرة في خرائط جوجل</p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">خريطة تفاعلية</h3>
            <p className="text-gray-600">شاهد جميع المواقع والمسار على خريطة واضحة</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2025 برنامج حسين - جميع الحقوق محفوظة</p>
            <p className="mt-2 text-sm">تطبيق ذكي لتحسين رحلاتك وتوفير الوقت والجهد مع خرائط تفاعلية</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;