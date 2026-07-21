import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { Globe, MapPin, Building2, Users, ArrowRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom ODC Marker Icon
const odcIcon = L.divIcon({
  className: 'custom-odc-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 bg-odc-orange opacity-20 rounded-lg animate-ping"></div>
      <div class="relative w-6 h-6 bg-odc-orange rounded flex items-center justify-center shadow-lg border-2 border-white">
        <div class="w-2 h-2 bg-white rounded-sm"></div>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const cities = [
  { id: 'rabat', name: 'Rabat', position: [34.0209, -6.8416], status: 'Active', capacity: '120 participants', lead: 'Orange Digital Center' },
  { id: 'fes', name: 'Fès', position: [34.0331, -5.0003], status: 'Active', capacity: '85 participants', lead: 'ODC Hybrid Fès' },
  { id: 'agadir', name: 'Agadir', position: [30.4278, -9.5981], status: 'Active', capacity: '60 participants', lead: 'ODC Hybrid Agadir' },
];

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function OdcHybrid() {
  const [selectedCity, setSelectedCity] = useState(cities[0]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <PageHeader 
        title="ODC Hybrid" 
        description="Extension régionale des programmes Orange Digital Center via une cartographie immersive aux couleurs de l'écosystème."
        badge="Régional"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Section */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl relative overflow-hidden bg-white border border-gray-100 shadow-sm min-h-[550px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-odc-orange" />
              Cartographie ODC Ecosystem
            </h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wide">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-odc-orange" /> Opérationnel</span>
            </div>
          </div>

          <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-100 shadow-inner z-10 h-[450px]">
            {/* Custom Theme Map Container */}
            <div className="leaflet-orange-theme h-full w-full">
              <MapContainer 
                center={selectedCity.position} 
                zoom={6} 
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <ChangeView center={selectedCity.position} zoom={selectedCity.id === 'rabat' ? 7 : 8} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                {cities.map((city) => (
                  <Marker 
                    key={city.id} 
                    position={city.position}
                    icon={odcIcon}
                    eventHandlers={{
                      click: () => setSelectedCity(city),
                    }}
                  >
                    <Popup className="odc-popup">
                      <div className="p-2 min-w-[120px]">
                        <h4 className="font-bold text-odc-black text-sm">{city.name}</h4>
                        <p className="text-[10px] text-odc-orange font-bold uppercase tracking-wider mt-1">{city.status}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedCity.id === city.id 
                    ? 'bg-odc-orange text-white border-odc-orange shadow-lg shadow-orange-500/20 scale-105' 
                    : 'bg-white text-gray-500 border-gray-100 hover:border-odc-orange hover:text-odc-orange'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl bg-white border border-gray-100 relative overflow-hidden group transition-all duration-500 shadow-xl border-t-8 border-odc-orange">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-odc-orange/5 rounded-full group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-odc-black">
              <div className="w-8 h-8 rounded bg-odc-orange flex items-center justify-center">
                 <div className="w-2 h-2 bg-white rounded-sm" />
              </div>
              {selectedCity.name}
            </h3>
            
            <div className="space-y-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Building2 className="w-5 h-5 text-odc-orange" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.1em]">Entité Pilote</p>
                  <p className="text-sm font-bold text-odc-black">{selectedCity.lead}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Users className="w-5 h-5 text-odc-orange" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.1em]">Capacité d'accueil</p>
                  <p className="text-sm font-bold text-odc-black">{selectedCity.capacity}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-bold uppercase tracking-tighter">Statut ODC</span>
                  <span className="px-3 py-1 bg-orange-50 text-odc-orange rounded-full font-black text-[10px] uppercase tracking-wider border border-orange-100">
                    {selectedCity.status}
                  </span>
                </div>
              </div>

              <button className="w-full mt-6 flex items-center justify-center gap-2 py-4 bg-odc-black text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-odc-orange transition-all shadow-lg active:scale-95 group">
                Accéder au site
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden relative group">
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-odc-orange opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity" />
            <h4 className="text-[10px] font-black mb-4 uppercase tracking-[0.2em] text-gray-400 relative z-10">Données Régionales</h4>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-colors hover:bg-orange-50/50">
                 <p className="text-2xl font-black text-odc-black tracking-tighter">265</p>
                 <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">Impact</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-colors hover:bg-orange-50/50">
                 <p className="text-2xl font-black text-odc-orange tracking-tighter">08</p>
                 <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">Hubs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .leaflet-orange-theme .leaflet-tile-pane {
          filter: grayscale(100%) brightness(1.1) contrast(1.1);
        }
        .leaflet-orange-theme .leaflet-container {
          background: #fff;
        }
        .odc-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          border-left: 4px solid #FF7900;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .odc-popup .leaflet-popup-tip {
          display: none;
        }
      `}</style>
    </div>
  );
}
