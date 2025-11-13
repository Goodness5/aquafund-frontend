'use client'

import { useEffect, useRef, useState } from 'react'
import { FadeInSection } from './FadeInSection'
import { VectorMap } from '@react-jvectormap/core'
import { worldMill } from '@react-jvectormap/world'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

type Country = {
  name: string;
  iso: string;
  coordinates: [number, number];
  color: string;
  projects: number;
  people: number;
  iconColor: string;
};

const countries: Country[] = [
  {
    name: 'Canada',
    iso: 'CAN',
    coordinates: [-95.7129, 56.1304] as [number, number],
    color: '#4A90E2',
    projects: 10,
    people: 4281,
    iconColor: '#EF4444',
  },
  {
    name: 'Brazil',
    iso: 'BRA',
    coordinates: [-51.9253, -14.235] as [number, number],
    color: '#10B981',
    projects: 26,
    people: 27390,
    iconColor: '#10B981',
  },
  {
    name: 'Germany',
    iso: 'DEU',
    coordinates: [10.4515, 51.1657] as [number, number],
    color: '#A78BFA',
    projects: 4,
    people: 280,
    iconColor: '#3B82F6',
  },
  {
    name: 'Niger',
    iso: 'NER',
    coordinates: [8.0817, 17.6078] as [number, number],
    color: '#F97316',
    projects: 0,
    people: 0,
    iconColor: '#F97316',
  },
  {
    name: 'Chad',
    iso: 'TCD',
    coordinates: [18.7322, 15.4542] as [number, number],
    color: '#1E40AF',
    projects: 0,
    people: 0,
    iconColor: '#1E40AF',
  },
  {
    name: 'India',
    iso: 'IND',
    coordinates: [78.9629, 20.5937] as [number, number],
    color: '#9333EA',
    projects: 16,
    people: 827390,
    iconColor: '#EC4899',
  },
  {
    name: 'Australia',
    iso: 'AUS',
    coordinates: [133.7751, -25.2744] as [number, number],
    color: '#FCD34D',
    projects: 21,
    people: 16000,
    iconColor: '#FCD34D',
  },
]

// ISO 2-letter codes for countryStyles series:
const countryFlatFills = {
  CA: '#4A90E2',
  BR: '#10B981',
  DE: '#A78BFA',
  NE: '#F97316',
  TD: '#1E40AF',
  IN: '#9333EA',
  AU: '#FCD34D',
}
const countryBorders = {
  CA: '#33609C',
  BR: '#059669',
  DE: '#7C3AED',
  NE: '#B45309',
  TD: '#1E293B',
  IN: '#7E22CE',
  AU: '#F59E42',
}

function getPopupPosition(iso: string): { left: string; top: string } {
  // quick manual best-effort
  switch (iso) {
    case 'CAN': return { left: '22%', top: '23%' }
    case 'BRA': return { left: '39%', top: '66%' }
    case 'DEU': return { left: '51%', top: '32%' }
    case 'NER': return { left: '45%', top: '50%' }
    case 'TCD': return { left: '48%', top: '46%' }
    case 'IND': return { left: '77%', top: '53%' }
    case 'AUS': return { left: '87%', top: '85%' }
    default: return { left: '0%', top: '0%' }
  }
}

export function ImpactInsights () {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false)
      }
    }

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCountryDropdown])

  return (
    <section id='impact' className='bg-[#FFFDFA] text-[#001627] py-16 md:py-20'>
      <div className='container mx-auto px-4 md:px-8'>
        {/* Header Section */}
        <FadeInSection className='mb-8'>
          <div className='flex flex-col gap-6 mb-6'>
            <div className='flex-1'>
              <h2 className='text-3xl md:text-4xl font-semibold text-[#001627] mb-4'>Did You Know?</h2>
              <p className='text-lg md:text-xl text-[#001627] font-medium'>
                About 700 million people lack basic access to clean and safe drinking water.
              </p>
            </div>
            <div className='flex items-center gap-3 relative'>
              <div className='relative' ref={dropdownRef}>
                <button
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className='flex items-center gap-2 px-4 py-2 border border-[#CAC4D0] rounded-lg bg-white text-[#001627] hover:bg-gray-50 transition-colors'
                >
                  Explore by Country
                  <ChevronDownIcon className='h-4 w-4' />
                </button>
                {showCountryDropdown && (
                  <div className='absolute top-full left-0 z-[100] mt-2 w-56 bg-white border border-[#CAC4D0] rounded-lg shadow-lg  max-h-64 overflow-y-auto'>
                    {countries.map(country => (
                      <button
                        key={country.iso}
                        onClick={() => {
                          setSelectedCountry(country.name)
                          setShowCountryDropdown(false)
                        }}
                        className='w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2'
                      >
                        <div className='w-4 h-4 rounded' style={{ backgroundColor: country.color }} />
                        <span className='text-sm text-[#001627]'>{country.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className='flex items-center gap-2 px-4 py-2 border border-[#CAC4D0] rounded-lg bg-white text-[#001627] hover:bg-gray-50 transition-colors'>
                <MagnifyingGlassIcon className='h-5 w-5' />
                <span>Search</span>
              </button>
            </div>
          </div>
        </FadeInSection>

        {/* Map Section */}
        <FadeInSection>
          <div className='relative bg-white overflow-hidden'>
            <div className='relative w-full' style={{ height: '600px' }}>
              <VectorMap
                map={worldMill}
                backgroundColor='transparent'
                zoomOnScroll={false}
                focusOn={{ x: 0.9, y: 0.48, scale: 2.2, animate: false }}
                regionStyle={{
                  initial: {
                    fill: '#E5E7EB',
                    stroke: '#FFFFFF',
                    strokeWidth: 1,
                  },
                  hover: {
                    fill: '#b8b8b8',
                    stroke: '#AEB4C4',
                  },
                  selected: {
                    fill: '#E5E7EB',
                  },
                }}
                series={{
                  regions: [
                    { values: countryFlatFills, attribute: 'fill' },
                    { values: countryBorders, attribute: 'stroke' },
                  ],
                }}
                containerStyle={{
                  width: '100%',
                  height: '100%',
                  outline: 'none',
                }}
              />
              {/* Custom popups for each country, overlayed absolutely */}
              {countries.filter((c: Country) => c.projects > 0).map((country: Country) => {
                const iso2 = country.iso.replace('CAN','CA').replace('DEU','DE').replace('BRA','BR').replace('NER','NE').replace('TCD','TD').replace('IND','IN').replace('AUS','AU');
                const pos = getPopupPosition(country.iso)
                return (
                  <div
                    key={country.name}
                    className="absolute z-50"
                    style={{ ...pos, pointerEvents: 'none', minWidth: 150 }}
                  >
                    <div className="flex items-start gap-2 shadow-[0_2px_8px_rgba(40,65,135,0.14)] bg-white/95 rounded-xl px-3 py-2" style={{ minWidth: 126, maxWidth:180, position: 'relative', pointerEvents: 'auto' }}>
                      {/* Flag square */}
                      <div className="w-8 h-8 min-w-[2rem] rounded-lg flex items-center justify-center" style={{ background: country.color }}>
                        <img
                          src={`https://flagcdn.com/24x18/${iso2.toLowerCase()}.png`}
                          alt={country.name+" flag"}
                          className="w-6 h-5 rounded"
                          style={{ boxShadow: '0 1px 4px #0001'}}
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="font-semibold text-[#475068] text-sm mb-1">{country.name}</span>
                        <div className="flex gap-3">
                          {/* Projects */}
                          <span className="flex items-center gap-1 text-[#294056] font-medium text-base">
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="inline-block"><path d="M5 21V19M19 21V19M3 11L12 3L21 11V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V11Z" stroke="#2C3A56" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                            {country.projects}
                          </span>
                          {/* People */}
                          <span className="flex items-center gap-1 text-[#294056] font-medium text-base">
                            <svg width="18" height="18" fill="none" viewBox="0 0 20 20" className="inline-block"><path d="M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 7a7 7 0 1 0-14 0" stroke="#2C3A56" strokeWidth="1.5"/></svg>
                            {country.people.toLocaleString('en-US')}
                          </span>
                        </div>
                      </div>
                      {/* Pointer */}
                      <span className="absolute left-6 -bottom-2 w-3 h-3 bg-white rotate-45 shadow-md" style={{ borderLeft: `1.5px solid #eef3f6`, borderBottom: `1.5px solid #eef3f6`}} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
