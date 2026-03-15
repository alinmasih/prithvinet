import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const Map3D = ({ onLocationClick, selectedStation, industries, stations }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    try {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!token) throw new Error('VITE_MAPBOX_TOKEN missing');

      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [81.8661, 21.2787],
        zoom: 6.5,
        pitch: 45,
        antialias: true,
        attributionControl: false
      });

      map.current.on('load', () => {
        setInitialized(true);
        loadCustomIcons();
        setupMapLayers();
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e.error);
        setError(`Mapbox Error: ${e.error?.message || 'Check console'}`);
      });

      map.current.on('click', (e) => {
        onLocationClick(e.lngLat.lat, e.lngLat.lng);
      });

    } catch (err) {
      setError(err.message);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle Dynamic Layer Updates
  useEffect(() => {
    if (initialized && map.current && stations && industries) {
      updateSources();
    }
  }, [initialized, stations, industries]);

  const loadCustomIcons = () => {
    const m = map.current;
    
    // Create SVGs as images for Mapbox
    const createIcon = (color) => {
      const svg = `
        <svg width="64" height="64" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <path d="M256 0C161.896 0 85.333 76.563 85.333 170.667c0 28.25 7.063 56.25 20.479 81.104l136.209 251.271c3.854 7.125 10.979 11.646 19.313 11.646s15.458-4.521 19.313-11.646l136.209-251.271C419.604 226.917 426.667 198.917 426.667 170.667 426.667 76.563 350.104 0 256 0zm0 256c-47.057 0-85.333-38.276-85.333-85.333s38.276-85.333 85.333-85.333 85.333 38.276 85.333 85.333S303.057 256 256 256z" fill="${color}" stroke="white" stroke-width="15"/>
        </svg>
      `;
      const img = new Image(32, 32);
      img.src = 'data:image/svg+xml;base64,' + btoa(svg);
      return img;
    };

    m.addImage('icon-air', createIcon('#10b981'));
    m.addImage('icon-water', createIcon('#06b6d4'));
    m.addImage('icon-noise', createIcon('#f43f5e'));
    m.addImage('icon-industry', createIcon('#fbbf24'));
  };

  const setupMapLayers = () => {
    const m = map.current;

    // 1. Heatmap Source
    m.addSource('aqi-heatmap', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });

    // 2. Monitoring Team Source
    m.addSource('monitoring-stations', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
    });

    // 3. Industry Source
    m.addSource('industries', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
    });

    // Heatmap Layer - Smoother Gradients
    m.addLayer({
      id: 'aqi-heat',
      type: 'heatmap',
      source: 'aqi-heatmap',
      maxzoom: 15,
      paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'aqi'], 0, 0, 300, 1],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0, 255, 0, 0)',
          0.2, 'rgba(16, 185, 129, 0.5)',
          0.4, 'rgba(234, 179, 8, 0.6)',
          0.6, 'rgba(249, 115, 22, 0.7)',
          0.8, 'rgba(239, 68, 68, 0.8)',
          1, 'rgba(153, 27, 27, 0.9)'
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 5, 15, 30],
        'heatmap-opacity': 0.7
      }
    }, 'waterway-label');

    // Monitoring Team Layer - Icons
    m.addLayer({
        id: 'station-icons',
        type: 'symbol',
        source: 'monitoring-stations',
        layout: {
            'icon-image': ['match', ['get', 'type'], 'air', 'icon-air', 'water', 'icon-water', 'noise', 'icon-noise', 'icon-air'],
            'icon-size': 1.2,
            'icon-allow-overlap': true,
            'icon-anchor': 'bottom'
        }
    });

    // Industry Icons
    m.addLayer({
        id: 'industry-icons',
        type: 'symbol',
        source: 'industries',
        layout: {
            'icon-image': 'icon-industry',
            'icon-size': 1.5,
            'icon-allow-overlap': true,
            'icon-anchor': 'bottom'
        }
    });

    // Add Popups on click
    m.on('click', 'station-icons', (e) => {
        const props = e.features[0].properties;
        new mapboxgl.Popup({ className: 'custom-popup' })
            .setLngLat(e.lngLat)
            .setHTML(`
                <div style="padding: 10px; color: #fff; background: #0f172a; border-radius: 8px;">
                    <strong style="color: #10b981;">${props.station_name}</strong>
                    <div style="margin-top: 4px; font-size: 12px; opacity: 0.8;">
                        Type: ${props.type.toUpperCase()}<br/>
                        ${props.type === 'air' ? `AQI: ${props.aqi}` : ''}
                        ${props.type === 'water' ? `pH: ${props.ph_level}` : ''}
                        ${props.type === 'noise' ? `Noise: ${props.noise_db} dB` : ''}
                    </div>
                </div>
            `)
            .addTo(m);
    });

    m.on('click', 'industry-icons', (e) => {
        const props = e.features[0].properties;
        new mapboxgl.Popup({ className: 'custom-popup' })
            .setLngLat(e.lngLat)
            .setHTML(`
                <div style="padding: 10px; color: #fff; background: #0f172a; border-radius: 8px;">
                    <strong style="color: #fbbf24;">${props.name}</strong>
                    <div style="margin-top: 4px; font-size: 12px; opacity: 0.8;">
                        Type: ${props.type}<br/>
                        Risk Level: ${props.emission_factor > 0.7 ? 'High' : 'Moderate'}
                    </div>
                </div>
            `)
            .addTo(m);
    });

    // Cursor changes
    m.on('mouseenter', 'station-icons', () => m.getCanvas().style.cursor = 'pointer');
    m.on('mouseleave', 'station-icons', () => m.getCanvas().style.cursor = '');
    m.on('mouseenter', 'industry-icons', () => m.getCanvas().style.cursor = 'pointer');
    m.on('mouseleave', 'industry-icons', () => m.getCanvas().style.cursor = '');
  };

  const updateSources = () => {
    const m = map.current;
    
    // AQI Heatmap Data
    const aqiFeatures = stations.air.map(s => ({
        type: 'Feature',
        geometry: s.location,
        properties: { aqi: s.aqi }
    }));
    m.getSource('aqi-heatmap').setData({ type: 'FeatureCollection', features: aqiFeatures });

    // Monitoring Teams (All types)
    const stationFeatures = [
        ...stations.air.map(s => ({ type: 'Feature', geometry: s.location, properties: { type: 'air', ...s } })),
        ...stations.water.map(s => ({ type: 'Feature', geometry: s.location, properties: { type: 'water', ...s } })),
        ...stations.noise.map(s => ({ type: 'Feature', geometry: s.location, properties: { type: 'noise', ...s } }))
    ];
    m.getSource('monitoring-stations').setData({ type: 'FeatureCollection', features: stationFeatures });

    // Industries
    const industryFeatures = industries.map(ind => ({
        type: 'Feature',
        geometry: ind.location,
        properties: { ...ind }
    }));
    m.getSource('industries').setData({ type: 'FeatureCollection', features: industryFeatures });
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#020617]">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-50 p-6">
          <div className="bg-slate-800 border border-rose-500/30 p-6 rounded-2xl max-w-sm text-center">
             <h3 className="text-rose-400 font-bold mb-2">Map Error</h3>
             <p className="text-slate-400 text-sm mb-4">{error}</p>
             <button onClick={() => window.location.reload()} className="text-xs bg-slate-700 px-3 py-1 rounded">Retry</button>
          </div>
        </div>
      )}

      {!initialized && !error && (
         <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
         </div>
      )}

      <div ref={mapContainer} className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
    </div>
  );
};

export default Map3D;
