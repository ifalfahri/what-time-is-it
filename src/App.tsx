"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Select from 'react-select'

interface TimeZone {
  value: string
  label: string
}

interface TimeResponse {
  dateTime: string
  timeZone: string
  currentLocalTime: string
}

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedTimeZone, setSelectedTimeZone] = useState<TimeZone | null>(null)
  const [timeZones, setTimeZones] = useState<TimeZone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetch('https://timeapi.io/api/TimeZone/AvailableTimeZones')
      .then(response => response.json())
      .then(data => {
        const formattedZones = [
          { value: 'local', label: 'Local Time' },
          ...data.map((zone: string) => ({
            value: zone,
            label: zone.replace(/_/g, ' ')
          }))
        ]
        setTimeZones(formattedZones)
        setSelectedTimeZone(formattedZones[0]) // Set local time as default
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to fetch time zones')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (selectedTimeZone && selectedTimeZone.value !== 'local') {
      setLoading(true)
      fetch(`https://timeapi.io/api/Time/current/zone?timeZone=${selectedTimeZone.value}`)
        .then(response => response.json())
        .then((data: TimeResponse) => {
          setCurrentTime(new Date(data.dateTime))
          setLoading(false)
          setError(null)
        })
        .catch(() => {
          setError('Failed to fetch world time')
          setLoading(false)
        })
    } else if (selectedTimeZone && selectedTimeZone.value === 'local') {
      setCurrentTime(new Date())
      setLoading(false)
      setError(null)
    }
  }, [selectedTimeZone])

  const formatTimeUnit = (unit: number) => unit.toString().padStart(2, '0')

  const hours = formatTimeUnit(currentTime.getHours())
  const minutes = formatTimeUnit(currentTime.getMinutes())
  const seconds = formatTimeUnit(currentTime.getSeconds())

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 md:mb-8 text-center">What Time is it?</h1>
      <motion.div
        className="bg-black rounded-xl p-6 md:p-8 shadow-lg mb-6 md:mb-8 w-full max-w-72 md:max-w-xl"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-5xl md:text-7xl lg:text-8xl font-mono text-red-500 flex items-center justify-center"
          animate={{ textShadow: ["0 0 5px #ff0000", "0 0 20px #ff0000", "0 0 5px #ff0000"] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
        >
          {loading ? (
            <span className="text-2xl">Loading...</span>
          ) : (
            <>
              <span aria-label={`${hours} hours`}>{hours}</span>
              <motion.span 
                aria-hidden="true"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="mx-1 md:mx-2"
              >
                :
              </motion.span>
              <span aria-label={`${minutes} minutes`}>{minutes}</span>
              <motion.span 
                aria-hidden="true"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="mx-1 md:mx-2"
              >
                :
              </motion.span>
              <span aria-label={`${seconds} seconds`}>{seconds}</span>
            </>
          )}
        </motion.div>
      </motion.div>

      <div className="bg-black text-white rounded-xl p-4 md:p-6 shadow-lg w-full max-w-72 md:max-w-xl">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Time Details</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm md:text-base">Current Date:</p>
            <p className="font-semibold text-sm md:text-base">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm md:text-base">Selected Time Zone:</p>
            <p className="font-semibold text-sm md:text-base">{selectedTimeZone?.label || 'None'}</p>
          </div>
          <div>
            <label htmlFor="timezone-select" className="block text-gray-400 mb-2 text-sm md:text-base">Select Time Zone:</label>
            <Select
              id="timezone-select"
              options={timeZones}
              value={selectedTimeZone}
              menuPlacement='top'
              onChange={(newValue) => setSelectedTimeZone(newValue as TimeZone)}
              isDisabled={loading}
              isSearchable={true}
              className="text-black text-sm md:text-base pb-1"
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: '#1f2937',
                  borderColor: '#374151',
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: '#1f2937',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused ? '#374151' : '#1f2937',
                  color: 'white',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                input: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}