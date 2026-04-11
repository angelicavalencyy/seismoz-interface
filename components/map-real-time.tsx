"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const Map = dynamic(
  async () => {
    const { MapContainer, TileLayer } = await import("react-leaflet");
    return function MapComponent() {
      return (
        <MapContainer
          center={[-7.2575, 112.7521]}
          zoom={15}
          style={{ height: "100vh", width: "100%" }}
        >

          {/* OpenStreetMap */}
          {/* <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          /> */}

          {/* Google */}
          {/* <TileLayer
            attribution='&copy; <a href="https://www.google.com/permissions/geoguidelines/product/geosearch-attribution">Google</a>'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          /> */}

          {/* cartodb basemaps */}
          <TileLayer
            url={`https://api.thunderforest.com/transport/{z}/{x}/{y}{r}.png?apikey=${process.env.NEXT_PUBLIC_THUNDERFOREST_KEY}`}
            attribution='&copy; Thunderforest &copy; OpenStreetMap contributors'
            maxZoom={22}
          />

          {/* CartoDB Dark Matter */}
          {/* <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" /> */}

          {/* CartoDB Voyager */}
          {/* <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" /> */}

          {/* Stadia Alidade Smooth */}
          {/* <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png" /> */}

        </MapContainer>
      );
    };
  },
  { ssr: false }
);

export default Map;