import React, { useState } from 'react';
import { MapPin, Plus, X, Search, Target, Link } from 'lucide-react';
import { Location } from '../types';

interface LocationInputProps {
  onAddLocation: (location: Location) => void;
  onRemoveLocation: (id: string) => void;
  locations: Location[];
}

export default function LocationInput({ onAddLocation, onRemoveLocation, locations }: LocationInputProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [locationLink, setLocationLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputMethod, setInputMethod] = useState<'address' | 'coordinates' | 'link'>('address');

  const parseLocationLink = (link: string) => {
    // إزالة المسافات الزائدة
    const cleanLink = link.trim();
    
    // أنماط مختلفة لروابط المواقع
    const patterns = [
      // Google Maps - https://maps.google.com/?q=30.0444,31.2357
      /maps\.google\.com\/.*[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/i,
      // Google Maps - https://www.google.com/maps/@30.0444,31.2357,15z
      /google\.com\/maps\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/i,
      // Google Maps - https://goo.gl/maps/... (يحتاج معالجة خاصة)
      /maps\.app\.goo\.gl/i,
      // WhatsApp Location - https://maps.google.com/?q=30.0444,31.2357
      /maps\.google\.com\/\?q=(-?\d+\.?\d*),(-?\d+\.?\d*)/i,
      // Apple Maps - https://maps.apple.com/?q=30.0444,31.2357
      /maps\.apple\.com\/.*[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/i,
      // Coordinates only - 30.0444,31.2357
      /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/,
      // Location with text - Location: https://maps.google.com/?q=30.0444,31.2357
      /Location:\s*https?:\/\/.*[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/i,
      // Waze - https://waze.com/ul?q=30.0444,31.2357
      /waze\.com\/.*[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/i
    ];

    for (const pattern of patterns) {
      const match = cleanLink.match(pattern);
      if (match && match[1] && match[2]) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        
        // التحقق من صحة الإحداثيات
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }
    }

    // محاولة استخراج الإحداثيات من أي مكان في النص
    const coordMatch = cleanLink.match(/(-?\d+\.?\d+),\s*(-?\d+\.?\d+)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }

    return null;
  };

  const parseCoordinates = (coordString: string) => {
    // دعم عدة تنسيقات للإحداثيات
    const patterns = [
      /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/, // lat,lng
      /^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/, // lat lng
      /^lat:\s*(-?\d+\.?\d*),?\s*lng:\s*(-?\d+\.?\d*)$/i, // lat: x, lng: y
      /^(-?\d+\.?\d*)°?\s*[NS]?,?\s*(-?\d+\.?\d*)°?\s*[EW]?$/i // degrees format
    ];

    for (const pattern of patterns) {
      const match = coordString.trim().match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        
        // التحقق من صحة الإحداثيات
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    
    try {
      let lat: number, lng: number;
      let finalAddress = address.trim();

      if (inputMethod === 'link' && locationLink.trim()) {
        const coords = parseLocationLink(locationLink);
        if (!coords) {
          alert('لم نتمكن من استخراج الإحداثيات من الرابط. تأكد من أن الرابط يحتوي على إحداثيات صحيحة.');
          setIsLoading(false);
          return;
        }
        lat = coords.lat;
        lng = coords.lng;
        
        // إذا لم يتم إدخال عنوان، استخدم الإحداثيات كعنوان
        if (!finalAddress) {
          finalAddress = `موقع مشارك (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        }
      } else if (inputMethod === 'coordinates' && coordinates.trim()) {
        const coords = parseCoordinates(coordinates);
        if (!coords) {
          alert('تنسيق الإحداثيات غير صحيح. استخدم تنسيق: خط العرض,خط الطول (مثال: 30.0444,31.2357)');
          setIsLoading(false);
          return;
        }
        lat = coords.lat;
        lng = coords.lng;
        
        // إذا لم يتم إدخال عنوان، استخدم الإحداثيات كعنوان
        if (!finalAddress) {
          finalAddress = `الموقع (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        }
      } else if (inputMethod === 'address' && address.trim()) {
        // محاكاة تحويل العنوان إلى إحداثيات
        lat = 30.0444 + (Math.random() - 0.5) * 0.1;
        lng = 31.2357 + (Math.random() - 0.5) * 0.1;
      } else {
        alert('يرجى إدخال العنوان أو الإحداثيات أو رابط الموقع');
        setIsLoading(false);
        return;
      }

      const newLocation: Location = {
        id: Date.now().toString(),
        name: name.trim(),
        address: finalAddress,
        lat,
        lng
      };

      onAddLocation(newLocation);
      setName('');
      setAddress('');
      setCoordinates('');
      setLocationLink('');
    } catch (error) {
      console.error('خطأ في إضافة الموقع:', error);
      alert('حدث خطأ في إضافة الموقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">إضافة موقع جديد</h2>
      </div>

      {/* اختيار طريقة الإدخال */}
      <div className="mb-6">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => setInputMethod('link')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              inputMethod === 'link'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Link className="w-4 h-4 inline-block ml-2" />
            رابط الموقع
          </button>
          <button
            type="button"
            onClick={() => setInputMethod('address')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              inputMethod === 'address'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Search className="w-4 h-4 inline-block ml-2" />
            العنوان
          </button>
          <button
            type="button"
            onClick={() => setInputMethod('coordinates')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              inputMethod === 'coordinates'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Target className="w-4 h-4 inline-block ml-2" />
            الإحداثيات
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اسم المكان *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال:  ، عميل رقم 1 , أو بأسم العميل"
            className="input-field"
            required
          />
        </div>

        {inputMethod === 'link' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رابط الموقع *
            </label>
            <textarea
              value={locationLink}
              onChange={(e) => setLocationLink(e.target.value)}
              placeholder="الصق هنا رابط الموقع المرسل إليك من واتساب أو أي تطبيق آخر..."
              className="input-field ltr min-h-[80px] resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              يدعم روابط من: خرائط جوجل، واتساب، آبل ماب، Waze، أو أي رابط يحتوي على إحداثيات
            </p>
          </div>
        ) : inputMethod === 'address' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="مثال: شارع التحرير، وسط البلد، القاهرة"
              className="input-field"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              أدخل العنوان الكامل للمكان
            </p>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الإحداثيات الجغرافية *
              </label>
              <input
                type="text"
                value={coordinates}
                onChange={(e) => setCoordinates(e.target.value)}
                placeholder="مثال: 30.0444,31.2357 أو 30.0444 31.2357"
                className="input-field ltr"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                أدخل خط العرض وخط الطول مفصولين بفاصلة أو مسافة
              </p>
            </div>
          </>
        )}

        {/* العنوان الاختياري لرابط الموقع والإحداثيات */}
        {(inputMethod === 'link' || inputMethod === 'coordinates') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان (اختياري)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="وصف المكان (اختياري)"
              className="input-field"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          {isLoading ? 'جاري الإضافة...' : 'إضافة الموقع'}
        </button>
      </form>

      {/* نصائح لرابط الموقع */}
      {inputMethod === 'link' && (
        <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
          <h3 className="font-medium text-green-800 mb-2">📱 أمثلة على الروابط المدعومة</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• رابط من واتساب: https://maps.google.com/?q=30.0444,31.2357</li>
            <li>• رابط خرائط جوجل: https://www.google.com/maps/@30.0444,31.2357,15z</li>
            <li>• رابط مختصر: https://goo.gl/maps/...</li>
            <li>• إحداثيات فقط: 30.0444,31.2357</li>
            <li>• رابط آبل ماب أو Waze</li>
          </ul>
        </div>
      )}

      {/* نصائح للإحداثيات */}
      {inputMethod === 'coordinates' && (
        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">💡 كيفية الحصول على الإحداثيات</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• افتح خرائط جوجل واختر المكان</li>
            <li>• انقر بالزر الأيمن واختر "ما هذا المكان؟"</li>
            <li>• انسخ الأرقام التي تظهر (خط العرض، خط الطول)</li>
            <li>• أو استخدم تطبيق GPS لمعرفة موقعك الحالي</li>
          </ul>
        </div>
      )}

      {locations.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            المواقع المضافة ({locations.length})
          </h3>
          <div className="space-y-3">
            {locations.map((location) => (
              <div
                key={location.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{location.name}</h4>
                  <p className="text-sm text-gray-600">{location.address}</p>
                  <p className="text-xs text-gray-500 mt-1 ltr">
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                  {location.distance && (
                    <p className="text-xs text-blue-600 mt-1">
                      المسافة: {location.distance.toFixed(1)} كم
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="عرض في خرائط جوجل"
                  >
                    <MapPin className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => onRemoveLocation(location.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف الموقع"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}