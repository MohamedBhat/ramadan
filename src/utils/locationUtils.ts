import { Location } from '../types';

// حساب المسافة بين نقطتين باستخدام Haversine formula
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// ترتيب المواقع حسب القرب من موقع معين
export function sortLocationsByDistance(locations: Location[], currentLat: number, currentLng: number): Location[] {
  return locations
    .map(location => ({
      ...location,
      distance: calculateDistance(currentLat, currentLng, location.lat, location.lng)
    }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

// تحسين المسار باستخدام خوارزمية Nearest Neighbor
export function optimizeRoute(locations: Location[], startLat: number, startLng: number): Location[] {
  if (locations.length === 0) return [];
  
  const unvisited = [...locations];
  const route: Location[] = [];
  let currentLat = startLat;
  let currentLng = startLng;
  
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(currentLat, currentLng, unvisited[0].lat, unvisited[0].lng);
    
    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(currentLat, currentLng, unvisited[i].lat, unvisited[i].lng);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }
    
    const nearestLocation = unvisited.splice(nearestIndex, 1)[0];
    route.push(nearestLocation);
    currentLat = nearestLocation.lat;
    currentLng = nearestLocation.lng;
  }
  
  return route;
}

// تقدير الوقت بناءً على المسافة (متوسط سرعة 50 كم/ساعة)
export function estimateTime(distanceKm: number): string {
  const hours = distanceKm / 50;
  const totalMinutes = Math.round(hours * 60);
  
  if (totalMinutes < 60) {
    return `${totalMinutes} دقيقة`;
  } else {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h} ساعة و ${m} دقيقة` : `${h} ساعة`;
  }
}

// تحويل المسافة إلى نص
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} متر`;
  } else {
    return `${distanceKm.toFixed(1)} كم`;
  }
}