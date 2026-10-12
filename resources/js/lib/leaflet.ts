import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export const officeIcon = L.divIcon({
    className: 'rating-div-icon',
    html: `<div style="display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#4f46e5;color:#fff;font-size:16px;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)">🏢</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
});

export const checkInIcon = L.divIcon({
    className: 'rating-div-icon',
    html: `<div style="display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#15803d;color:#fff;font-size:14px;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)">✓</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
});

export const checkOutIcon = L.divIcon({
    className: 'rating-div-icon',
    html: `<div style="display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#b91c1c;color:#fff;font-size:14px;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)">✕</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
});

export const currentIcon = L.divIcon({
    className: 'rating-div-icon',
    html: `<div style="display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
});