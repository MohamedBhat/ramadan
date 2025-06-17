import React, { useState } from 'react';
import { Navigation, MapPin, Loader } from 'lucide-react';

interface CurrentLocationInputProps {
  onLocationSet: (lat: number, lng: number, address: string) => void;
  currentLocation: { lat: number; lng: number; address: string } | null;
}

export default function CurrentLocationInput({ onLocationSet, currentLocation }: CurrentLocationInputProps) {
  const [address, setAddress] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('المتصفح لا يدعم تحديد الموقع الجغرافي');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // محاكاة استدعاء API للحصول على العنوان
        const mockAddress = `الموقع الحالي (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        
        onLocationSet(latitude, longitude, mockAddress);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('خطأ في تحديد الموقع:', error);
        alert('لم نتمكن من تحديد موقعك. يرجى إدخال العنوان يدوياً.');
        setIsGettingLocation(false);
        setIsManualInput(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    // محاكاة تحويل العنوان إلى إحداثيات
    const mockCoordinates = {
      lat: 30.0444 + (Math.random() - 0.5) * 0.1,
      lng: 31.2357 + (Math.random() - 0.5) * 0.1
    };

    onLocationSet(mockCoordinates.lat, mockCoordinates.lng, address.trim());
    setAddress('');
    setIsManualInput(false);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
          <Navigation className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">موقعك الحالي</h2>
      </div>

      {currentLocation ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">تم تحديد موقعك</span>
          </div>
          <p className="text-sm text-green-700">{currentLocation.address}</p>
          <p className="text-xs text-green-600 mt-1 ltr">
            {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
          </p>
          <button
            onClick={() => setIsManualInput(true)}
            className="mt-3 text-sm text-green-600 hover:text-green-700 underline"
          >
            تغيير الموقع
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {!isManualInput ? (
            <div className="text-center">
              <button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="btn-primary flex items-center justify-center gap-2 mx-auto"
              >
                {isGettingLocation ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Navigation className="w-5 h-5" />
                )}
                {isGettingLocation ? 'جاري تحديد الموقع...' : 'تحديد موقعي الحالي'}
              </button>
              
              <div className="mt-4 text-center">
                <span className="text-gray-500">أو</span>
              </div>
              
              <button
                onClick={() => setIsManualInput(true)}
                className="btn-secondary mt-2"
              >
                إدخال العنوان يدوياً
              </button>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان موقعك الحالي
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="مثال: شارع الجامعة، المعادي، القاهرة"
                  className="input-field"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  تأكيد الموقع
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualInput(false)}
                  className="btn-secondary"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}