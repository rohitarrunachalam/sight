'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import StoreMarker from './StoreMarker'

interface Store {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

const stores: Store[] = [
  { id: 1, name: 'Walmart Store 1', lat: 40.7128, lng: -74.0060 },
  { id: 2, name: 'Walmart Store 2', lat: 34.0522, lng: -118.2437 },
  // Add more store data as needed
]

export default function Map() {
  const center: LatLngExpression = [39.8283, -98.5795]

  return (
    <MapContainer center={center} zoom={4} style={{ height: '600px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {stores.map(store => (
        <StoreMarker key={store.id} store={store} />
      ))}
    </MapContainer>
  )
}