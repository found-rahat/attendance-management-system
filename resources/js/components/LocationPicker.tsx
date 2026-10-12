import { useEffect } from 'react';
import { Circle, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import type { Marker as LeafletMarker } from 'leaflet';
import '../lib/leaflet';

export function Recenter({ position }: { position: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        map.flyTo(position, map.getZoom(), { duration: 0.6 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position[0], position[1]]);

    return null;
}

export function LocationPicker({
    position,
    radius,
    onPick,
}: {
    position: [number, number];
    radius: number;
    onPick: (lat: number, lng: number) => void;
}) {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });

    return (
        <>
            <Circle
                center={position}
                radius={radius}
                pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.1 }}
            />
            <Marker
                position={position}
                draggable
                eventHandlers={{
                    dragend(e) {
                        const ll = (e.target as LeafletMarker).getLatLng();
                        onPick(ll.lat, ll.lng);
                    },
                }}
            >
                <Popup>Drag the pin, or click anywhere on the map</Popup>
            </Marker>
        </>
    );
}
