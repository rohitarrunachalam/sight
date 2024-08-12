'use client'

import { Marker, Popup } from 'react-leaflet'
import { useRouter } from 'next/navigation'
import { LatLngExpression } from 'leaflet'

interface Store {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

interface StoreMarkerProps {
  store: Store;
}

export default function StoreMarker({ store }: StoreMarkerProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/store/${store.id}`)
  }

  const position: LatLngExpression = [store.lat, store.lng]

  return (
    <Marker position={position}>
      <Popup>
        <div>
          <h3>{store.name}</h3>
          <button onClick={handleClick}>View Store Details</button>
        </div>
      </Popup>
    </Marker>
  )
}