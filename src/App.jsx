import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

/* =========================================
   SOLAR SYSTEM DATA
========================================= */

const PLANETS = [
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'Terrestrial Planet',
    radius: 0.19,
    orbit: 3.1,
    color: '#aaa49b',
    speed: 0.8,
    texture: '/textures/mercury.jpg',
    distance: '57.9 million km',
    year: '88 Earth days',
    day: '58.6 Earth days',
    moons: '0',
    description:
      'Mercury is the smallest planet in our solar system and the closest planet to the Sun.',
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'Terrestrial Planet',
    radius: 0.31,
    orbit: 4.3,
    color: '#e7b66f',
    speed: 0.58,
    texture: '/textures/Venus.jpg',
    distance: '108.2 million km',
    year: '225 Earth days',
    day: '243 Earth days',
    moons: '0',
    description:
      'Venus has a thick atmosphere and an extremely hot surface.',
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'Terrestrial Planet',
    radius: 0.36,
    orbit: 5.6,
    color: '#4ca8ff',
    speed: 0.42,
    texture: '/textures/earth.jpg',
    clouds: '/textures/clouds.jpg',
    distance: '149.6 million km',
    year: '365.25 days',
    day: '24 hours',
    moons: '1',
    description:
      'Earth is our home planet, with liquid water, vast oceans, and conditions suitable for life.',
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'Terrestrial Planet',
    radius: 0.27,
    orbit: 6.9,
    color: '#e76b48',
    speed: 0.34,
    texture: '/textures/Mars.jpg',
    distance: '227.9 million km',
    year: '687 Earth days',
    day: '24.6 hours',
    moons: '2',
    description:
      'Mars is the Red Planet, known for giant volcanoes and evidence of ancient water.',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'Gas Giant',
    radius: 0.83,
    orbit: 8.8,
    color: '#d6ad86',
    speed: 0.19,
    texture: '/textures/jupiter.jpg',
    distance: '778.6 million km',
    year: '11.86 Earth years',
    day: '9.9 hours',
    moons: 'Many',
    description:
      'Jupiter is the largest planet in our solar system, with powerful storms and many moons.',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'Gas Giant',
    radius: 0.69,
    orbit: 11.0,
    color: '#e3c28d',
    speed: 0.14,
    texture: '/textures/Saturn.jpg',
    distance: '1.43 billion km',
    year: '29.4 Earth years',
    day: '10.7 hours',
    moons: 'Many',
    description:
      'Saturn is a gas giant famous for its spectacular rings made mostly of ice and rocky material.',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'Ice Giant',
    radius: 0.49,
    orbit: 13.0,
    color: '#8cdbdf',
    speed: 0.1,
    texture: '/textures/uranus.jpg',
    distance: '2.87 billion km',
    year: '84 Earth years',
    day: '17.2 hours',
    moons: 'Many',
    description:
      'Uranus is an ice giant with a blue-green atmosphere and an unusually tilted axis.',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'Ice Giant',
    radius: 0.47,
    orbit: 15.0,
    color: '#477dff',
    speed: 0.075,
    texture: '/textures/neptune.jpg',
    distance: '4.5 billion km',
    year: '165 Earth years',
    day: '16.1 hours',
    moons: 'Many',
    description:
      'Neptune is a distant blue planet known for its powerful winds and cold atmosphere.',
  },
];

/* =========================================
   SUN
========================================= */

function Sun({ onSelect }) {
  const texture = useTexture('/textures/Sun.jpg');

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  const sunRef = useRef();

  useFrame((_, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.025;
    }
  });

  return (
    <group
      onClick={(event) => {
        event.stopPropagation();
        onSelect('sun');
      }}
    >
      {/* Outer orange glow */}
      <mesh scale={1.55}>
        <sphereGeometry args={[1.8, 48, 48]} />
        <meshBasicMaterial
          color="#ff5714"
          transparent
          opacity={0.055}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Middle golden glow */}
      <mesh scale={1.3}>
        <sphereGeometry args={[1.8, 48, 48]} />
        <meshBasicMaterial
          color="#ff851b"
          transparent
          opacity={0.075}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Inner glow */}
      <mesh scale={1.12}>
        <sphereGeometry args={[1.8, 48, 48]} />
        <meshBasicMaterial
          color="#ffcf64"
          transparent
          opacity={0.045}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Textured Sun */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[1.8, 96, 96]} />
        <meshBasicMaterial
          map={texture}
          toneMapped={false}
        />
      </mesh>

      {/* Sunlight */}
      <pointLight
        color="#fff0ce"
        intensity={180}
        distance={180}
        decay={1.5}
      />
    </group>
  );
}

/* =========================================
   TEXTURED PLANET SURFACE
========================================= */

function TexturedSurface({ planet }) {
  const texture = useTexture(planet.texture);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <mesh>
      <sphereGeometry args={[planet.radius, 64, 64]} />

      <meshStandardMaterial
        map={texture}
        color="#ffffff"
        roughness={0.88}
        metalness={0}
        emissive={planet.id === 'earth' ? '#142536' : '#000000'}
        emissiveIntensity={planet.id === 'earth' ? 0.18 : 0}
      />
    </mesh>
  );
}

/* =========================================
   EARTH CLOUDS
========================================= */

function EarthClouds({ radius }) {
  const texture = useTexture('/textures/clouds.jpg');
  const cloudRef = useRef();

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  useFrame((_, delta) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.012;
    }
  });

  return (
    <mesh ref={cloudRef} scale={1.012}>
      <sphereGeometry args={[radius, 64, 64]} />

      <meshStandardMaterial
        map={texture}
        transparent
        opacity={0.15}
        roughness={1}
        depthWrite={false}
      />
    </mesh>
  );
}

/* =========================================
   PLANET SURFACE AND RINGS
========================================= */

function Planet({ planet, onSelect, registerPlanet }) {
  const planetRef = useRef();

  useEffect(() => {
    registerPlanet(planet.id, planetRef);

    return () => registerPlanet(planet.id, null);
  }, [planet.id, registerPlanet]);

  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group
      ref={planetRef}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(planet.id);
      }}
    >
      {/* Subtle atmospheric outline */}
      <mesh scale={1.06}>
        <sphereGeometry args={[planet.radius, 40, 40]} />

        <meshBasicMaterial
          color={planet.color}
          transparent
          opacity={0.045}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Planet texture */}
      {planet.texture ? (
        <Suspense fallback={null}>
          <TexturedSurface planet={planet} />
        </Suspense>
      ) : (
        <mesh>
          <sphereGeometry args={[planet.radius, 48, 48]} />

          <meshStandardMaterial
            color={planet.color}
            roughness={0.85}
            metalness={0}
          />
        </mesh>
      )}

      {/* Earth clouds */}
      {planet.id === 'earth' && (
        <Suspense fallback={null}>
          <EarthClouds radius={planet.radius} />
        </Suspense>
      )}

      {/* Saturn rings */}
      {planet.id === 'saturn' && (
        <group rotation={[Math.PI / 2.35, 0.12, 0.08]}>
          <mesh>
            <ringGeometry
              args={[
                planet.radius * 1.3,
                planet.radius * 1.9,
                96,
              ]}
            />

            <meshStandardMaterial
              color="#d7bd91"
              side={THREE.DoubleSide}
              transparent
              opacity={0.8}
              roughness={0.9}
            />
          </mesh>

          <mesh>
            <ringGeometry
              args={[
                planet.radius * 1.95,
                planet.radius * 2.2,
                96,
              ]}
            />

            <meshStandardMaterial
              color="#9c8669"
              side={THREE.DoubleSide}
              transparent
              opacity={0.5}
            />
          </mesh>
        </group>
      )}

      {/* Uranus rings */}
      {planet.id === 'uranus' && (
        <mesh rotation={[Math.PI / 2.15, 0.1, 0.1]}>
          <ringGeometry
            args={[
              planet.radius * 1.35,
              planet.radius * 1.52,
              64,
            ]}
          />

          <meshBasicMaterial
            color="#8cdbdf"
            side={THREE.DoubleSide}
            transparent
            opacity={0.4}
          />
        </mesh>
      )}
    </group>
  );
}

/* =========================================
   ORBIT RING
========================================= */

function OrbitRing({ radius }) {
  const geometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(
      0,
      0,
      radius,
      radius,
      0,
      Math.PI * 2,
      false,
      0
    );

    const points = curve.getPoints(180);

    return new THREE.BufferGeometry().setFromPoints(
      points.map(
        (point) => new THREE.Vector3(point.x, 0, point.y)
      )
    );
  }, [radius]);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color="#7597c9"
        transparent
        opacity={0.22}
      />
    </line>
  );
}

/* =========================================
   ORBITING PLANET
========================================= */

function OrbitingPlanet({
  planet,
  onSelect,
  paused,
  registerPlanet,
}) {
  const orbitRef = useRef();
  const angleRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!paused && orbitRef.current) {
      angleRef.current += delta * planet.speed * 0.12;
      orbitRef.current.rotation.y = angleRef.current;
    }
  });

  return (
    <group>
      <OrbitRing radius={planet.orbit} />

      <group ref={orbitRef}>
        <group position={[planet.orbit, 0, 0]}>
          <Float
            speed={0.5}
            rotationIntensity={0.02}
            floatIntensity={0.025}
          >
            <Planet
              planet={planet}
              onSelect={onSelect}
              registerPlanet={registerPlanet}
            />
          </Float>
        </group>
      </group>
    </group>
  );
}

/* =========================================
   METEORS
========================================= */

function Meteor({ initialPosition, speed }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (!ref.current) return;

    ref.current.position.x -= delta * speed;
    ref.current.position.y -= delta * speed * 0.35;

    if (ref.current.position.x < -22) {
      ref.current.position.set(
        22,
        Math.random() * 16 - 8,
        -Math.random() * 22 - 5
      );
    }
  });

  return (
    <group ref={ref} position={initialPosition}>
      <mesh>
        <sphereGeometry args={[0.018, 8, 8]} />

        <meshBasicMaterial
          color="#ffffff"
          toneMapped={false}
        />
      </mesh>

      <mesh
        position={[0.24, 0.1, 0]}
        rotation={[0, 0, -0.4]}
      >
        <boxGeometry args={[0.5, 0.008, 0.008]} />

        <meshBasicMaterial
          color="#76dfff"
          transparent
          opacity={0.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function MeteorShower() {
  const meteors = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        id: index,
        initialPosition: [
          Math.random() * 42 - 21,
          Math.random() * 20 - 10,
          -Math.random() * 22 - 5,
        ],
        speed: 1 + Math.random() * 1.5,
      })),
    []
  );

  return (
    <group>
      {meteors.map((meteor) => (
        <Meteor
          key={meteor.id}
          initialPosition={meteor.initialPosition}
          speed={meteor.speed}
        />
      ))}
    </group>
  );
}

/* =========================================
   CAMERA RIG
========================================= */

function CameraRig({ selectedPlanet, planetRefs }) {
  const { camera } = useThree();

  const destination = useRef(new THREE.Vector3(0, 15, 29));
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const worldPosition = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!selectedPlanet) {
      destination.current.set(0, 15, 29);
      target.current.set(0, 0, 0);
    }

    if (selectedPlanet === 'sun') {
      destination.current.set(0, 2.3, 6.8);
      target.current.set(0, 0, 0);
    }
  }, [selectedPlanet]);

  useFrame(() => {
    if (!selectedPlanet) {
      destination.current.set(0, 15, 29);
      target.current.set(0, 0, 0);
    } else if (selectedPlanet === 'sun') {
      target.current.set(0, 0, 0);
      destination.current.set(0, 2.3, 6.8);
    } else {
      const planetRef = planetRefs.current[selectedPlanet];

      if (planetRef?.current) {
        planetRef.current.getWorldPosition(worldPosition.current);

        target.current.copy(worldPosition.current);

        const planet = PLANETS.find(
          (item) => item.id === selectedPlanet
        );

        const distance = planet
          ? Math.max(planet.radius * 5.5, 2.2)
          : 3.2;

        const viewOffset = new THREE.Vector3(
          distance * 0.12,
          distance * 0.18,
          distance
        );

        destination.current
          .copy(worldPosition.current)
          .add(viewOffset);
      }
    }

    camera.position.lerp(destination.current, 0.045);

    const direction = target.current
      .clone()
      .sub(camera.position)
      .normalize();

    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, -1),
      direction
    );

    camera.quaternion.slerp(quaternion, 0.055);
  });

  return null;
}

/* =========================================
   SCENE
========================================= */

function Scene({
  selectedPlanet,
  onSelect,
  paused,
  planetRefs,
  registerPlanet,
}) {
  return (
    <>
      <color attach="background" args={['#02040b']} />

      <ambientLight intensity={0.65} />

      <pointLight
        position={[0, 0, 0]}
        color="#ffad4a"
        intensity={2.5}
        distance={45}
        decay={1.5}
      />

      <Stars
        radius={180}
        depth={100}
        count={40000}
        factor={4}
        saturation={0.25}
        fade
        speed={0.25}
      />

      <Stars
        radius={85}
        depth={45}
        count={40000}
        factor={1.8}
        saturation={0.2}
        fade
        speed={0.18}
      />

      <Sun onSelect={onSelect} />

      {PLANETS.map((planet) => (
        <OrbitingPlanet
          key={planet.id}
          planet={planet}
          onSelect={onSelect}
          paused={paused}
          registerPlanet={registerPlanet}
        />
      ))}

      <MeteorShower />

      <CameraRig
        selectedPlanet={selectedPlanet}
        planetRefs={planetRefs}
      />
    </>
  );
}

/* =========================================
   ENGLISH PLANET INFORMATION
========================================= */

function PlanetInfoCard({ planet, onClose }) {
  if (!planet) return null;

  const isSun = planet.id === 'sun';

  const metrics = isSun
    ? [
        ['Object Type', 'G-type main-sequence star'],
        ['Age', 'About 4.6 billion years'],
        ['Surface Temperature', 'About 5,500°C'],
        ['Location', 'Center of the Solar System'],
      ]
    : [
        ['Planet Type', planet.type],
        ['Distance from Sun', planet.distance],
        ['Orbital Period', planet.year],
        ['Rotation Period', planet.day],
        ['Known Moons', planet.moons],
      ];

  return (
    <section className="planet-info-card" key={planet.id}>
      <div className="planet-info-top">
        <div>
          <p className="planet-info-kicker">
            {isSun ? 'STELLAR OVERVIEW' : 'PLANETARY OVERVIEW'}
          </p>

          <h2 className="planet-info-name">
            {isSun ? 'The Sun' : planet.name}
          </h2>

          <p className="planet-info-subtitle">
            {isSun
              ? 'The star at the center of our system'
              : planet.type}
          </p>
        </div>

        <button
          type="button"
          className="planet-info-close"
          onClick={onClose}
          aria-label="Close planet information"
        >
          ×
        </button>
      </div>

      <p className="planet-info-description">
        {isSun
          ? 'The Sun is the star at the center of our solar system. Its gravity holds the planets in their orbits and its energy supports life on Earth.'
          : planet.description}
      </p>

      <div className="planet-info-metrics">
        {metrics.map(([label, value]) => (
          <div className="planet-info-metric" key={label}>
            <span className="planet-info-metric-label">
              {label}
            </span>

            <span className="planet-info-metric-value">
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="planet-info-footer">
        <span className="planet-info-footer-dot" />
        SOLAR SYSTEM EXPLORER
      </div>
    </section>
  );
}

/* =========================================
   HEADER
========================================= */

function Header() {
  return (
    <header className="cosmos-header">
      <div className="cosmos-logo">
        <div className="cosmos-logo-icon">✧</div>

        <div>
          <h2 className="cosmos-logo-title">COSMOS</h2>

          <span className="cosmos-logo-subtitle">
            BEYOND THE KNOWN
          </span>
        </div>
      </div>

      <div className="status-pill">
        <span className="status-dot" />
        SOLAR SYSTEM ONLINE
      </div>
    </header>
  );
}

/* =========================================
   PLANET SELECTOR
========================================= */

function PlanetSelector({ selectedPlanet, onSelect }) {
  return (
    <nav className="planet-selector">
      <p className="planet-selector-heading">
        EXPLORE THE SOLAR SYSTEM
      </p>

      <button
        type="button"
        className={`planet-selector-button ${
          selectedPlanet === 'sun' ? 'active' : ''
        }`}
        onClick={() => onSelect('sun')}
      >
        <span className="planet-selector-orb">☀</span>

        <span className="planet-selector-copy">
          <span className="planet-selector-name">The Sun</span>
          <span className="planet-selector-type">Central Star</span>
        </span>

        <span className="planet-selector-arrow">›</span>
      </button>

      {PLANETS.map((planet) => (
        <button
          type="button"
          key={planet.id}
          className={`planet-selector-button ${
            selectedPlanet === planet.id ? 'active' : ''
          }`}
          onClick={() => onSelect(planet.id)}
        >
          <span
            className="planet-selector-orb"
            style={{ color: planet.color }}
          >
            ●
          </span>

          <span className="planet-selector-copy">
            <span className="planet-selector-name">
              {planet.name}
            </span>

            <span className="planet-selector-type">
              {planet.type}
            </span>
          </span>

          <span className="planet-selector-arrow">›</span>
        </button>
      ))}
    </nav>
  );
}

/* =========================================
   MAIN APP
========================================= */

export default function App() {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [paused, setPaused] = useState(false);

  const planetRefs = useRef({});

  const registerPlanet = useCallback((id, ref) => {
    if (ref) {
      planetRefs.current[id] = ref;
    } else {
      delete planetRefs.current[id];
    }
  }, []);

  const handleSelect = useCallback((id) => {
    setSelectedPlanet(id);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedPlanet(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedPlanet(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const activePlanet =
    selectedPlanet === 'sun'
      ? { id: 'sun' }
      : PLANETS.find((planet) => planet.id === selectedPlanet) || null;

  return (
    <main className="cosmos-app">
      <div className="space-canvas">
        <Canvas
          camera={{
            position: [0, 15, 29],
            fov: 45,
            near: 0.1,
            far: 250,
          }}
          dpr={[1, 1.6]}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
          }}
          onPointerMissed={() => setSelectedPlanet(null)}
        >
          <Suspense fallback={null}>
            <Scene
              selectedPlanet={selectedPlanet}
              onSelect={handleSelect}
              paused={paused}
              planetRefs={planetRefs}
              registerPlanet={registerPlanet}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="cosmos-corner top-left" />
      <div className="cosmos-corner top-right" />
      <div className="cosmos-corner bottom-left" />
      <div className="cosmos-corner bottom-right" />

      <div className="cosmos-interface">
        <Header />

        <section className="cosmos-hero">
          <p className="eyebrow">SOLAR SYSTEM EXPLORER</p>

          <h1>
            Discover
            <span>The Solar System</span>
          </h1>

          <p className="cosmos-hero-description">
            Explore eight planets orbiting our star.
            Select a world to discover its secrets.
          </p>

          <div className="cosmos-hero-stats">
            <div className="cosmos-stat">
              <span className="cosmos-stat-value">08</span>
              <span className="cosmos-stat-label">PLANETS</span>
            </div>

            <div className="cosmos-stat-divider" />

            <div className="cosmos-stat">
              <span className="cosmos-stat-value">01</span>
              <span className="cosmos-stat-label">STAR</span>
            </div>

            <div className="cosmos-stat-divider" />

            <div className="cosmos-stat">
              <span className="cosmos-stat-value">3D</span>
              <span className="cosmos-stat-label">EXPLORATION</span>
            </div>
          </div>
        </section>

        <PlanetSelector
          selectedPlanet={selectedPlanet}
          onSelect={handleSelect}
        />

        <PlanetInfoCard
          planet={activePlanet}
          onClose={handleClose}
        />

        <div className="cosmos-bottom-bar">
          <div className="cosmos-hint">
            <span className="cosmos-hint-icon">↗</span>
            Select a planet to focus the camera
          </div>

          <button
            type="button"
            className="status-pill"
            onClick={() => setPaused((value) => !value)}
            style={{
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
          >
            {paused ? 'RESUME ORBITS' : 'PAUSE ORBITS'}
          </button>

          <button
            type="button"
            className="status-pill"
            onClick={handleClose}
            style={{
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
          >
            VIEW SOLAR SYSTEM
          </button>

          <div className="cosmos-coordinate">
            <span>COSMOS EXPLORER · V2.1</span>
            <span>THE SOLAR SYSTEM</span>
          </div>
        </div>
      </div>
    </main>
  );
}