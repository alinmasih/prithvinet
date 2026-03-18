import React, { useEffect, useState } from 'react';

const CityMapPage = () => {
    const [inited, setInited] = useState(false);

    useEffect(() => {
        // Inject the bundled simulation script (InfiniTownTS)
        const script = document.createElement('script');
        script.src = '/main.js';
        script.type = 'module';
        script.onload = () => {
            console.log('City Map: InfiniTown loaded');
            // Delay to allow Three.js initialization
            setTimeout(() => {
                setInited(true);
            }, 1000);
        };
        document.body.appendChild(script);

        // Style override to handle the canvas and hide internal UI
        const styleElem = document.createElement('style');
        styleElem.innerHTML = `
            #app { width: 100vw; height: 100vh; overflow: hidden; background: black; position: absolute; top: 0; left: 0; }
            canvas { display: block; width: 100% !important; height: 100% !important; }
            .ui-overlay, .status-bar { display: none !important; }
            div[style*="z-index: 100"], div[style*="zIndex: 100"] { display: none !important; }
            #app button { display: none !important; }
        `;
        document.head.appendChild(styleElem);

        // Remove height constraints or camera locks if they exist in window.sceneManager
        const checkInterval = setInterval(() => {
            if (window.sceneManager && window.sceneManager.cameraController) {
                const cc = window.sceneManager.cameraController;
                // We keep the initial cinematic height adjustment if it feels better, 
                // but we ensure controls are enabled.
                if (cc.controls) {
                    cc.controls.enabled = true;
                    cc.controls.enablePan = true;
                    cc.controls.enableRotate = true;
                    cc.controls.enableZoom = true;
                }
                clearInterval(checkInterval);
            }
        }, 500);

        return () => {
            clearInterval(checkInterval);
            if (document.body.contains(script)) document.body.removeChild(script);
            if (document.head.contains(styleElem)) document.head.removeChild(styleElem);
            const appElem = document.getElementById('app');
            if (appElem) appElem.innerHTML = '';
            delete window.sceneManager;
        };
    }, []);

    const [pollutionData, setPollutionData] = useState({ air: [], water: [], noise: [] });
    const [selectedFactory, setSelectedFactory] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5002/api/map/environmental-data');
                const result = await response.json();
                let airData = result.air || [];
                let waterData = result.water || [];
                let noiseData = result.noise || [];

                // MOCK DATA for Offline/Empty DB demonstration
                if (airData.length === 0) {
                    airData = factories.map(name => ({
                        station_name: name,
                        aqi: Math.floor(Math.random() * 100) + 120 // 120-220
                    }));
                }
                if (waterData.length === 0) {
                    waterData = factories.map(name => ({
                        station_name: name,
                        ph: (Math.random() * 2 + 6).toFixed(1) // 6.0-8.0
                    }));
                }
                if (noiseData.length === 0) {
                    noiseData = factories.map(name => ({
                        station_name: name,
                        decibels: Math.floor(Math.random() * 30) + 65 // 65-95 dB
                    }));
                }

                setPollutionData({
                    air: airData,
                    water: waterData,
                    noise: noiseData
                });
                
                if (window.sceneManager && window.sceneManager.updatePollutionData) {
                    window.sceneManager.updatePollutionData(airData);
                }
            } catch (err) {
                console.error('Failed to fetch pollution data:', err);
            }
        };

        const handleFactorySelection = (e) => {
            setSelectedFactory(e.detail.name);
        };

        window.addEventListener('factorySelected', handleFactorySelection);
        fetchData();
        const interval = setInterval(fetchData, 30000); // Update every 30s
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('factorySelected', handleFactorySelection);
        };
    }, [inited]);

    const factories = [
        "Jayaswal Neco Industries",
        "Godawari Power & Ispat Ltd",
        "Sarda Energy & Minerals Ltd",
        "Monnet Ispat & Energy (JSW Ispat)",
        "Shri Bajrang Alliance Limited"
    ];

    const getMetricsForFactory = (name) => {
        const air = pollutionData.air.find(d => (d.station_name || d.city)?.includes(name) || name.includes(d.station_name || d.city));
        const water = pollutionData.water.find(d => (d.station_name || d.city)?.includes(name) || name.includes(d.station_name || d.city));
        const noise = pollutionData.noise.find(d => (d.station_name || d.city)?.includes(name) || name.includes(d.station_name || d.city));
        
        return {
            aqi: air ? air.aqi : '--',
            water: water ? water.ph : '--', // Using pH as a proxy for water quality display
            noise: noise ? noise.decibels : '--'
        };
    };

    const handleFlyTo = (name) => {
        setSelectedFactory(name);
        if (window.flyToFactory) {
            window.flyToFactory(name);
        }
        if (window.sceneManager && window.sceneManager.setSelectedFactory) {
            window.sceneManager.setSelectedFactory(name);
        }
    };

    const selectedMetrics = selectedFactory ? getMetricsForFactory(selectedFactory) : null;

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative">
            {/* Simulation Container - Full Screen */}
            <div id="app" className="w-full h-full cursor-move"></div>
            
            {/* Search and Navigation UI */}
            <div className="absolute top-8 left-8 z-[200] max-w-sm w-full flex flex-col gap-6">
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
                    <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                        Industrial Monitoring
                    </h2>
                    
                    <div className="space-y-3">
                        {factories.map((name) => (
                            <button
                                key={name}
                                onClick={() => handleFlyTo(name)}
                                className={`w-full text-left p-3 rounded-xl border transition-all group flex items-center justify-between ${
                                    selectedFactory === name 
                                    ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]' 
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                }`}
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span className={`text-sm transition-colors truncate ${
                                        selectedFactory === name ? 'text-primary font-bold' : 'text-white/80 group-hover:text-white'
                                    }`}>
                                        {name}
                                    </span>
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest">
                                        AQI: <span className={getMetricsForFactory(name).aqi > 150 ? "text-rose-400" : "text-emerald-400"}>{getMetricsForFactory(name).aqi}</span>
                                    </span>
                                </div>
                                <div className={`w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center transition-opacity ${
                                    selectedFactory === name ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}>
                                    <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-primary stroke-current stroke-2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detailed Info Panel - Only shown when a factory is selected */}
                {selectedFactory && (
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl animate-in slide-in-from-left duration-500">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-white font-bold text-xl leading-tight mb-1">{selectedFactory}</h3>
                                <p className="text-white/40 text-[10px] uppercase tracking-[0.2em]">Real-time Impact Analysis</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setSelectedFactory(null);
                                    if(window.sceneManager) window.sceneManager.setSelectedFactory(null);
                                }}
                                className="!flex w-8 h-8 rounded-full bg-white/5 items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white/40 stroke-current stroke-2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {/* AQI Metric */}
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white/40 text-[10px] uppercase tracking-widest">Air Quality Index</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        selectedMetrics.aqi > 150 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                                    }`}>
                                        {selectedMetrics.aqi > 150 ? 'High Impact' : 'Optimal'}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-white">{selectedMetrics.aqi}</span>
                                    <span className="text-white/20 text-xs">AQI</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Water Metric */}
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                    <span className="text-white/40 text-[10px] uppercase tracking-widest block mb-1">Water pH</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl font-bold text-white">{selectedMetrics.water}</span>
                                        <span className="text-white/20 text-[10px]">avg</span>
                                    </div>
                                </div>
                                {/* Noise Metric */}
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                    <span className="text-white/40 text-[10px] uppercase tracking-widest block mb-1">Noise</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl font-bold text-white">{selectedMetrics.noise}</span>
                                        <span className="text-white/20 text-[10px]">dB</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-rose-400 stroke-current stroke-2">
                                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-rose-400 text-xs font-bold mb-0.5">Industrial Impact Zone</p>
                                        <p className="text-white/40 text-[10px] leading-relaxed">Active monitoring within 5km radius. Red zone indicates potential emission overlap.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Subtle Controls Hint */}
            <div className="absolute bottom-8 right-8 z-[200] bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 text-white/50 text-xs flex gap-4">
                <span>Left Click: Rotate</span>
                <span>Right Click: Pan</span>
                <span>Wheel: Zoom</span>
            </div>
            
            {!inited && (
                <div className="absolute inset-0 z-[100] bg-black flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin"></div>
                        <p className="text-white/40 text-sm font-medium tracking-widest uppercase">Initializing City Map</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CityMapPage;
