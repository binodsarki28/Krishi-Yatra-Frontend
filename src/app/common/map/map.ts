import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, PLATFORM_ID, OnDestroy, HostListener, AfterViewInit, ChangeDetectorRef, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';

import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, InputTextModule, TagModule, FormsModule, CheckboxModule],
  templateUrl: './map.html',
  styleUrls: ['./map.css']
})
export class MapComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() mapId: string = 'map-' + Math.random().toString(36).substr(2, 9);
  @Input() pickerMode: boolean = false;
  @Input() drawRoute: boolean = false;
  @Input() interactive: boolean = false;
  @Input() initialCheckpoints: any = '';
  @Input() progress: number = 0; // 0 to 1
  
  @Input() pickupLocation: any = null; // { lat, lng, label }
  @Input() dropLocation: any = null;   // { lat, lng, label }
  @Input() showHeader: boolean = true;
  @Input() showTimeline: boolean = true;
  @Input() mapTitle: string = 'Delivery Route Visualization';

  @Output() onLocationSelected = new EventEmitter<{ lat: number, lng: number }>();
  @Output() onDistanceCalculated = new EventEmitter<number>();
  @Output() onCheckpointsCalculated = new EventEmitter<string>();
  @Output() onCheckpointToggle = new EventEmitter<{index: number, reached: boolean}>();
  @Output() onAddressFound = new EventEmitter<{ lat: number, lng: number }>();

  routeSteps: any[] = [];
  customCheckpoints: string = '';
  private pendingSearch: string | null = null;
  private routeTimeout: any;
  private leafletReady = false;

  private map: any;
  private L: any;
  private pickupMarker: any;
  private dropMarker: any;
  private progressMarker: any;
  private routeLine: any;
  private fallbackLine: any;
  private routePoints: any[] = [];
  private checkpointCoords: Map<number, {lat: number, lng: number}> = new Map();
  private checkpointMarkers: any[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('window:resize')
  onResize() {
    if (this.map) {
      this.map.invalidateSize();
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadLeaflet();
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (!this.map) this.initMap();
        else this.map.invalidateSize();
      }, 500);
    }
  }

  private async loadLeaflet() {
    if (!isPlatformBrowser(this.platformId)) return;
    const L = await import('leaflet');
    this.L = L;
    (window as any).L = L;

    try {
        await import('leaflet-routing-machine');
    } catch(e) {}
    
    const globalL = (window as any).L || L;
    if (!(window as any).L) (window as any).L = globalL;
    this.L = globalL;
    this.leafletReady = true;
    
    this.initMap();

    // Force load Leaflet Routing Machine if Webpack failed to attach it to window.L
    if (!this.L.Routing) {
        console.warn('Dynamic import failed to bind L.Routing. Injecting script tag directly...');
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js';
        script.onload = () => {
            console.log('Leaflet Routing Machine script injected successfully.');
            if (this.drawRoute) {
                this.drawRouteLine();
            }
        };
        document.head.appendChild(script);
    }
  }

  private initMap() {
    if (!this.L || this.map || !isPlatformBrowser(this.platformId)) return;
    
    // Safety check for the container
    const container = document.getElementById(this.mapId);
    if (!container) return;

    const L = this.L;

    const mapElement = document.getElementById(this.mapId);
    if (!mapElement) {
        setTimeout(() => this.initMap(), 200);
        return;
    }

    const center: [number, number] = [28.3949, 84.1240];
    const southWest: [number, number] = [26.1, 80.0];
    const northEast: [number, number] = [30.4, 88.3];
    const bounds = L.latLngBounds(southWest, northEast);

    const allowInteraction = this.pickerMode || this.drawRoute;

    this.map = L.map(this.mapId, {
      maxBounds: bounds,
      maxBoundsViscosity: 1.0, 
      minZoom: 7,             
      scrollWheelZoom: allowInteraction,
      dragging: allowInteraction,
      doubleClickZoom: allowInteraction,
      touchZoom: allowInteraction,
      boxZoom: allowInteraction,
      keyboard: allowInteraction,
      attributionControl: false
    }).setView(center, 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      bounds: bounds,
      noWrap: true
    }).addTo(this.map);
    
    L.control.scale({ position: 'bottomright' }).addTo(this.map);

    if (this.pendingSearch) {
        this.searchLocation(this.pendingSearch);
        this.pendingSearch = null;
    }

    if (this.drawRoute) {
        this.drawRouteLine();
    }

    if (this.pickerMode) {
      this.map.on('click', (e: any) => {
        this.onLocationSelected.emit(e.latlng);
        this.updateDropMarkerFromCoords(e.latlng);
      });
    }

    this.updatePickupMarker();
    this.updateDropMarker();
    this.parseInitialCheckpoints();
    
    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
    }, 500);
    
    // Start self-healing interval
    this.startSelfHealing();
  }

  private selfHealingInterval: any;
  private startSelfHealing() {
    clearInterval(this.selfHealingInterval);
    this.selfHealingInterval = setInterval(() => {
      if (this.drawRoute && this.hasValidCoords() && !this.routeLine && !this.fallbackLine) {
        console.log('Self-healing: Re-triggering route draw...');
        this.drawRouteLine();
      }
    }, 2000);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.map) return;

    const needsRedraw = changes['pickupLocation'] || changes['dropLocation'] || changes['initialCheckpoints'];
    
    if (changes['pickupLocation']) this.updatePickupMarker();
    if (changes['dropLocation']) this.updateDropMarker();
    if (changes['initialCheckpoints']) this.parseInitialCheckpoints();
    if (changes['progress']) this.updateProgressMarker();
    
    if (needsRedraw && this.drawRoute && this.hasValidCoords()) {
        clearTimeout(this.routeTimeout);
        this.routeTimeout = setTimeout(() => {
            this.drawRouteLine();
            this.fitBounds();
        }, 500);
    }
  }

  private hasValidCoords(): boolean {
    const p = this.pickupLocation;
    const d = this.dropLocation;
    return !!(
      p && (typeof p.lat === 'number' || !isNaN(parseFloat(p.lat))) &&
      d && (typeof d.lat === 'number' || !isNaN(parseFloat(d.lat)))
    );
  }

  private getNum(val: any): number {
    if (typeof val === 'number') return val;
    return parseFloat(val) || 0;
  }

  ngOnDestroy() {
    clearInterval(this.selfHealingInterval);
    this.cleanupMap();
  }

  private cleanupMap() {
    clearTimeout(this.routeTimeout);
    
    if (this.map) {
      if (this.routeLine) {
        try { this.map.removeControl(this.routeLine); } catch(e) {}
      }
      if (this.fallbackLine) {
        try { this.map.removeLayer(this.fallbackLine); } catch(e) {}
      }
      
      // Clear markers
      if (this.pickupMarker) this.map.removeLayer(this.pickupMarker);
      if (this.dropMarker) this.map.removeLayer(this.dropMarker);
      this.checkpointMarkers.forEach(m => this.map.removeLayer(m));
      
      try {
        this.map.off();
        this.map.remove();
      } catch(e) {}
    }
    
    this.map = null;
    this.routeLine = null;
    this.fallbackLine = null;
    this.pickupMarker = null;
    this.dropMarker = null;
    this.checkpointMarkers = [];
    this.leafletReady = false;
  }

  private parseInitialCheckpoints() {
    if (!this.initialCheckpoints) {
      this.routeSteps = [];
      this.updateCheckpointMarkers();
      return;
    }
    
    // Handle both string (from tracking) and array (from create-order p-autocomplete)
    if (Array.isArray(this.initialCheckpoints)) {
      this.routeSteps = this.initialCheckpoints.map((label: any) => ({
        label: typeof label === 'string' ? label : (label.label || ''),
        checked: false
      })).filter((s: any) => s.label.length > 0);
    } else {
      const separator = this.initialCheckpoints.includes('|') ? '|' : ',';
      this.routeSteps = this.initialCheckpoints.split(separator).map((label: string) => ({
        label: label.trim().replace('(Reached)', '').replace('[X]', ''),
        checked: label.includes('(Reached)') || label.includes('[X]') || false 
      })).filter((s: any) => s.label.length > 0);
    }
    
    this.updateCheckpointMarkers();
  }

  private updateCheckpointMarkers() {
    if (!this.map || !this.L || !isPlatformBrowser(this.platformId)) return;
    const L = this.L;
    
    // Clear old markers
    this.checkpointMarkers.forEach(m => this.map.removeLayer(m));
    this.checkpointMarkers = [];
    this.checkpointCoords.clear();

    const orangeIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [20, 32],
      iconAnchor: [10, 32],
      popupAnchor: [1, -28],
      shadowSize: [32, 32]
    });

    this.routeSteps.forEach((step, i) => {
      if (step.label.length > 2) {
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(step.label + ', Nepal')}&limit=1`;
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(step.label + ', Nepal')}&limit=1`;
        
        fetch(photonUrl)
          .then(res => res.json())
          .then(data => {
            if (data.features?.length) {
                const feat = data.features[0];
                this.handleCheckpointGeocode([{ lat: feat.geometry.coordinates[1], lon: feat.geometry.coordinates[0], display_name: step.label }], step, i, orangeIcon);
            } else {
                this.tryNominatimInMap(nominatimUrl, step, i, orangeIcon);
            }
          })
          .catch(() => this.tryNominatimInMap(nominatimUrl, step, i, orangeIcon));
      }
    });
  }

  private tryNominatimInMap(url: string, step: any, i: number, icon: any) {
    fetch(url)
      .then(res => res.ok ? res.json() : Promise.reject('CORS'))
      .then(data => this.handleCheckpointGeocode(data, step, i, icon))
      .catch(() => {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        fetch(proxyUrl)
          .then(res => res.json())
          .then(pData => this.handleCheckpointGeocode(JSON.parse(pData.contents), step, i, icon))
          .catch(() => {});
      });
  }

  private handleCheckpointGeocode(data: any, step: any, i: number, icon: any) {
    if (data && data.length > 0 && this.map) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      const marker = this.L.marker([lat, lng], { icon })
        .addTo(this.map)
        .bindPopup(`Checkpoint ${i+1}: ${step.label} ${step.checked ? '(Reached)' : ''}`);
      this.checkpointMarkers.push(marker);
      
      this.checkpointCoords.set(i, { lat, lng });
      
      // Refresh route to include this new waypoint dot
      if (this.drawRoute) {
          clearTimeout(this.routeTimeout);
          this.routeTimeout = setTimeout(() => this.drawRouteLine(), 500);
      }
    }
  }

  private updatePickupMarker() {
    if (!this.map || !this.pickupLocation || !this.L) return;
    const L = this.L;
    const coords = [this.pickupLocation.lat, this.pickupLocation.lng];

    if (this.pickupMarker) this.map.removeLayer(this.pickupMarker);

    const greenIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    this.pickupMarker = L.marker(coords, { icon: greenIcon }).addTo(this.map)
      .bindPopup('Pickup: ' + (this.pickupLocation.label || 'Farmer Location'));
    
    this.fitBounds();
  }

  private updateDropMarker() {
    if (!this.map || !this.dropLocation || !this.L) return;
    this.updateDropMarkerFromCoords({ lat: this.dropLocation.lat, lng: this.dropLocation.lng });
  }

  private updateDropMarkerFromCoords(latlng: any) {
    if (!this.map || !this.L) return;
    const L = this.L;
    const coords = [latlng.lat, latlng.lng];

    if (this.dropMarker) this.map.removeLayer(this.dropMarker);

    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    this.dropMarker = L.marker(coords, { icon: redIcon, draggable: this.pickerMode }).addTo(this.map)
      .bindPopup('Drop: ' + (this.dropLocation?.label || 'Your Location'));

    if (this.pickerMode) {
      this.dropMarker.on('dragend', (e: any) => {
        const position = e.target.getLatLng();
        this.onLocationSelected.emit(position);
      });
    }

    this.fitBounds();
  }

  private updateProgressMarker() {
    if (!this.map || !this.L || !this.routePoints || this.routePoints.length === 0) return;
    const L = this.L;
    
    const index = Math.min(Math.floor(this.progress * (this.routePoints.length - 1)), this.routePoints.length - 1);
    const pos = this.routePoints[index];
    if (!pos) return;

    if (this.progressMarker) this.map.removeLayer(this.progressMarker);

    const blueIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [30, 48],
      iconAnchor: [15, 48],
      popupAnchor: [1, -40],
      shadowSize: [41, 41]
    });

    this.progressMarker = L.marker([pos.lat, pos.lng], { icon: blueIcon }).addTo(this.map)
      .bindPopup('Delivery in Transit');
    
    if (this.progress > 0) {
        this.map.panTo([pos.lat, pos.lng]);
    }
  }

  public distanceInfo: string = '';

  private drawRouteLine() {
    if (!this.L || !this.map || !this.hasValidCoords()) return;
    const L = this.L;
    // Remove old lines promptly
    if (this.routeLine) {
        try { this.map.removeControl(this.routeLine); } catch(e) {}
        this.routeLine = null;
    }
    
    // Clear fallback immediately to prepare for a clean new draw
    if (this.fallbackLine) {
        try { this.map.removeLayer(this.fallbackLine); } catch(e) {}
        this.fallbackLine = null;
    }

    // Build waypoints with forced number casting
    const waypoints = [ L.latLng(this.getNum(this.pickupLocation.lat), this.getNum(this.pickupLocation.lng)) ];
    const sortedIndices = Array.from(this.checkpointCoords.keys()).sort((a,b) => a - b);
    sortedIndices.forEach(idx => {
        const c = this.checkpointCoords.get(idx)!;
        waypoints.push(L.latLng(this.getNum(c.lat), this.getNum(c.lng)));
    });
    waypoints.push(L.latLng(this.getNum(this.dropLocation.lat), this.getNum(this.dropLocation.lng)));

    // SUBTLE FALLBACK PATH (Light Grey, Dotted)
    // Only shows up then is replaced by green road-route when found
    this.fallbackLine = L.polyline(waypoints.map(w => [w.lat, w.lng]), {
        color: '#94a3b8', 
        weight: 3, 
        opacity: 0.5,
        dashArray: '2, 8'
    }).addTo(this.map);

    this.distanceInfo = 'Calculating...';

    if (!L.Routing) {
        this.distanceInfo = 'Straight Path';
        this.cdr.detectChanges();
        return;
    }

    try {
        this.routeLine = L.Routing.control({
            router: L.Routing.osrmv1({
                serviceUrl: 'https://routing.openstreetmap.de/routed-car/route/v1',
                timeout: 10000
            }),
            waypoints: waypoints,
            lineOptions: {
                styles: [{ color: '#10b981', weight: 8, opacity: 0.9 }],
                extendToWaypoints: true,
                missingRouteTolerance: 100
            },
            createMarker: () => null,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            show: false,
            // @ts-ignore
            itinerary: { show: false }
        }).addTo(this.map);

        this.routeLine.on('routesfound', (e: any) => {
            const routes = e.routes;
            this.routePoints = routes[0].coordinates;
            const distance = (routes[0].summary.totalDistance / 1000);
            this.distanceInfo = `${distance.toFixed(1)} km`;
            this.onDistanceCalculated.emit(distance);
            
            // Success! Replace the dashed fallback with the solid real route
            if (this.fallbackLine) {
                this.map.removeLayer(this.fallbackLine);
                this.fallbackLine = null;
            }
            this.updateProgressMarker();
            this.cdr.detectChanges();
        });

        this.routeLine.on('routingerror', (err: any) => {
            console.warn('Routing engine failed, keeping dashed line:', err);
            this.distanceInfo = 'Straight Path';
            this.cdr.detectChanges();
        });

    } catch (e) {
        console.error('Routing control setup error:', e);
    }
  }

  public fitBounds() {
    if (!this.map || !this.L) return;
    const markers = [];
    if (this.pickupMarker) markers.push(this.pickupMarker.getLatLng());
    if (this.dropMarker) markers.push(this.dropMarker.getLatLng());
    if (markers.length > 1) this.map.fitBounds(this.L.latLngBounds(markers), { padding: [50, 50] });
    else if (markers.length === 1) this.map.setView(markers[0], 12);
  }

  public toggleCheckpoint(index: number, checked: boolean) {
    if (this.routeSteps[index]) {
      this.routeSteps[index].checked = checked;
    }
    this.updateCheckpointMarkers();
    this.onCheckpointToggle.emit({ index, reached: checked });
  }

  public toggleDirections() {
    if (this.routeLine) {
       const container = (this.routeLine as any)._container;
       if (container) {
           container.style.display = container.style.display === 'none' ? 'block' : 'none';
       }
    }
  }

  public onCheckpointsChange() {
    this.onCheckpointsCalculated.emit(this.customCheckpoints);
  }

  public searchLocation(address: string) {
    if (!address || !isPlatformBrowser(this.platformId) || !this.L) return;
    if (!this.map) {
        this.pendingSearch = address;
        return;
    }
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Nepal')}&limit=1`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const latlng = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          if (this.map) {
            this.map.setView([latlng.lat, latlng.lng], 13);
            this.updateDropMarkerFromCoords(latlng);
          }
        }
      })
      .catch(() => {});
  }

  public redrawRoute() {
    console.log('User manually requested to redraw the route line');
    
    // Inject the script if Leaflet Routing Machine is missing
    if (this.L && !this.L.Routing && isPlatformBrowser(this.platformId)) {
        console.warn('Routing engine missing! Force injecting script...');
        this.distanceInfo = 'Loading Routing Engine...';
        this.cdr.detectChanges();
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js';
        script.onload = () => {
            console.log('Routing script loaded from click. Continuing redraw...');
            this.routeLineRedrawSequence();
        };
        script.onerror = () => {
            this.distanceInfo = 'Straight Line Path';
            this.cdr.detectChanges();
        };
        document.head.appendChild(script);
        return;
    }

    this.routeLineRedrawSequence();
  }

  private routeLineRedrawSequence() {
    // Clear existing routing line
    if (this.routeLine && this.map) {
      try { this.map.removeControl(this.routeLine); } catch(e) {}
      this.routeLine = null;
    }
    if (this.fallbackLine && this.map) {
      try { this.map.removeLayer(this.fallbackLine); } catch(e) {}
      this.fallbackLine = null;
    }

    // Force map to resize and draw route
    if (this.map) {
      this.map.invalidateSize();
    }
    
    this.drawRouteLine();
    
    // Also fit bounds 
    setTimeout(() => this.fitBounds(), 500);
  }

  public clearMap() {
    if (this.map) {
        if (this.pickupMarker) this.map.removeLayer(this.pickupMarker);
        if (this.dropMarker) this.map.removeLayer(this.dropMarker);
        if (this.progressMarker) this.map.removeLayer(this.progressMarker);
        this.checkpointMarkers.forEach(m => this.map.removeLayer(m));
        
        if (this.routeLine) {
            try { this.map.removeControl(this.routeLine); } catch(e) {}
        }
        if (this.fallbackLine) {
            try { this.map.removeLayer(this.fallbackLine); } catch(e) {}
        }
    }
    
    this.pickupMarker = null;
    this.dropMarker = null;
    this.progressMarker = null;
    this.checkpointMarkers = [];
    this.checkpointCoords.clear();
    this.routeSteps = [];
    this.routeLine = null;
    this.fallbackLine = null;
    
    if (this.map) {
        this.map.setView([28.3949, 84.1240], 7); // Reset to center of Nepal
    }
    this.cdr.detectChanges();
  }
}
