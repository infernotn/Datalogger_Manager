import {Dialog, Listbox} from '@headlessui/react'
import { useEffect, useState } from 'react'
import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase/config.ts"
import {CycleType, Datalogger, Usage} from "../types"
import { Fragment } from "react"
import dayjs, { Dayjs } from "dayjs"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    dataloggers: string[]
    period: { start: string; end: string }
  }) => void
}

type FilterType = {
  type: ("ATEX" | "NON_ATEX")[]
  measurementType: ("TEMPERATURE" | "TEMP_HUMIDITY")[]
}

type UsageType =
    | "CYCLE_VALIDATION"
    | "SUIVI_LOCAL"
    | "CARTOGRAPHIE"
    | "EXPORT"
    | "FABRICATION_WC"
    | "AUTRE"


const usageOptions: { value: UsageType; label: string }[] = [
  { value: "CYCLE_VALIDATION", label: "Cycle Validation" },
  { value: "SUIVI_LOCAL", label: "Suivi Local" },
  { value: "CARTOGRAPHIE", label: "Cartographie" },
  { value: "EXPORT", label: "Export" },
  { value: "FABRICATION_WC", label: "Fabrication WC" },
  { value: "AUTRE", label: "Autre" }
]



export default function DataloggerDialog({
                                           isOpen,
                                           onClose,
                                           onSave
                                         }: Props) {

  // Selection
  const [selected, setSelected] = useState<string[]>([])

  // Date
  const [start, setStart] = useState<Dayjs | null>(null)
  const [end, setEnd] = useState<Dayjs | null>(null)
  const [usageType, setUsageType] = useState<UsageType | null>(null)
  // Data
  const [dataloggers, setDataloggers] = useState<Datalogger[]>([])
  const [usage, setUsage] = useState<Usage | null>(null)
  // Filters
  const [filters, setFilters] = useState<FilterType>({
    type: [],
    measurementType: []
  })

  // -------------------------
  // Fetch data (ONCE)
  // -------------------------
  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, "dataloggers"))

      const data = snap.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Datalogger))
          .sort((a, b) => a.name.localeCompare(b.name))

      setDataloggers(data)
    }

    fetchData()
  }, [])

  // -------------------------
  // Filters
  // -------------------------
  const toggleTypeFilter = (value: "ATEX" | "NON_ATEX") => {
    setFilters(prev => ({
      ...prev,
      type: prev.type.includes(value)
          ? prev.type.filter(v => v !== value)
          : [...prev.type, value]
    }))
  }

  const toggleMeasurementFilter = (value: "TEMPERATURE" | "TEMP_HUMIDITY") => {
    setFilters(prev => ({
      ...prev,
      measurementType: prev.measurementType.includes(value)
          ? prev.measurementType.filter(v => v !== value)
          : [...prev.measurementType, value]
    }))
  }

  // -------------------------
  // Derived filtering
  // -------------------------
  const filteredDataloggers = dataloggers.filter(dl => {
    const available = dl.status === "AVAILABLE"

    const matchType =
        filters.type.length === 0 || filters.type.includes(dl.type)

    const matchMeasurement =
        filters.measurementType.length === 0 ||
        filters.measurementType.includes(dl.measurementType)

    return available && matchType && matchMeasurement
  })

  // -------------------------
  // Selection
  // -------------------------
  const toggleSelection = (id: string) => {
    setSelected(prev =>
        prev.includes(id)
            ? prev.filter(x => x !== id)
            : [...prev, id]
    )
  }

  // -------------------------
  // Submit
  // -------------------------
  const handleSubmit = () => {
    if (!selected.length || !start || !end) return

    if (end.isBefore(start)) return

    onSave({
      dataloggers: selected,
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    })

    onClose()
  }

  function getDiff() {
    if (end && start) {
    const diffMs = end.diff(start)

    const minutes = Math.floor(diffMs / (1000 * 60)) % 60
    const hours = Math.floor(diffMs / (1000 * 60 * 60)) % 24
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    return `${days}d ${hours}h ${minutes}m`

    }else {
        return "--"
    }
  }


  // -------------------------
  // Render
  // -------------------------
  return (
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col p-6">

            <Dialog.Title className="text-xl text-left text-darkCard font-semibold mb-4">
              Assign Usage
            </Dialog.Title>

            <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">

              {/* LEFT PANEL */}
              <div className="border rounded-lg p-4 flex flex-col">

                {/* Filters */}
                <div className="mb-3">
                  <h3 className="font-medium mb-2">Filters</h3>

                  <div className="flex flex-wrap gap-2">

                    <button
                        onClick={() => toggleTypeFilter("ATEX")}
                        className={`px-2 border rounded ${
                            filters.type.includes("ATEX")
                                ? "bg-darkAccent text-white"
                                : "hover:bg-gray-100"
                        }`}
                    >
                      ATEX
                    </button>

                    <button
                        onClick={() => toggleTypeFilter("NON_ATEX")}
                        className={`px-2 border rounded ${
                            filters.type.includes("NON_ATEX")
                                ? "bg-darkAccent text-white"
                                : "hover:bg-gray-100"
                        }`}
                    >
                      NON-ATEX
                    </button>

                    <button
                        onClick={() => toggleMeasurementFilter("TEMPERATURE")}
                        className={`px-2 border rounded ${
                            filters.measurementType.includes("TEMPERATURE")
                                ? "bg-darkAccent text-white"
                                : "hover:bg-gray-100"
                        }`}
                    >
                      TEMP
                    </button>

                    <button
                        onClick={() => toggleMeasurementFilter("TEMP_HUMIDITY")}
                        className={`px-2 border rounded ${
                            filters.measurementType.includes("TEMP_HUMIDITY")
                                ? "bg-darkAccent text-white"
                                : "hover:bg-gray-100"
                        }`}
                    >
                      TEMP_HUM
                    </button>
                    <button
                        onClick={() => setFilters({
                          type: [],
                          measurementType: []
                        })}
                        className={"px-2 border rounded bg-zinc-500 text-white hover:text-darkBg hover:bg-darkText"}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1">
                  {filteredDataloggers.map(dl => (
                      <label
                          key={dl.id}
                          className="flex items-center gap-2 py-1 cursor-pointer text-darkCard font-bold"
                      >
                        <input
                            type="checkbox"
                            checked={selected.includes(dl.id)}
                            onChange={() => toggleSelection(dl.id)}
                        />

                        <span className="flex items-baseline gap-2">
                      <span>{dl.name}</span>
                      <span className="text-xs text-zinc-500 font-medium">
                        {dl.type} / {dl.measurementType}
                      </span>
                    </span>
                      </label>
                  ))}
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  {selected.length} selected
                </div>
              </div>

              {/* RIGHT PANEL */}
              <div className=" space-y-1" >
                {/*usage Type*/}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">Usage Type</h3>

                  <Listbox value={usageType} onChange={setUsageType}>
                    <div className="relative">

                      {/* BUTTON */}
                      <Listbox.Button className="w-full border rounded px-3 py-2 text-left bg-white">
                        {usageOptions.find(o => o.value === usageType)?.label || "Select usage type"}
                      </Listbox.Button>

                      {/* OPTIONS */}
                      <Listbox.Options className="absolute mt-1 w-full bg-white border rounded shadow-lg z-10 max-h-60 overflow-auto">
                        {usageOptions.map(option => (
                            <Listbox.Option
                                key={option.value}
                                value={option.value}
                                as={Fragment}

                            >
                              {({ active, selected }) => (
                                  <li
                                      className={`cursor-pointer px-3 py-2 ${
                                          active ? "bg-gray-100" : ""
                                      } ${selected ? "font-semibold text-darkAccent" : ""}`}
                                  >
                                    {option.label}
                                  </li>
                              )}
                            </Listbox.Option>
                        ))}
                      </Listbox.Options>

                    </div>
                  </Listbox>

                  {usageType=== "CYCLE_VALIDATION" && (
                      <div className="mt-4 p-3 border rounded bg-gray-50 text-sm text-gray-600">
                       <h4 className="font-medium mb-2 text-sm text-gray-700">
                         Cycle Validation Details
                       </h4>
                        <div>
                        <label> Cycle reference</label>
                        <input
                            type="text"
                            value={usage?.cycleDetails?.cycleRef || ""}
                            // onChange={(e) =>
                                // setUsage(prev => ({
                                //   ...prev,
                                //   cycleDetails: {
                                //     ...(prev?.cycleDetails ?? {}),
                                //     cycleRef: e.target.value
                                //   }
                                // }))
                            // }
                            className="w-full border rounded px-3 py-2"
                        />
                        </div>
                        <Listbox value={usageType} onChange={setUsageType}>

                        <div>
                          <label> Cycle Type</label>
                          {/* BUTTON */}
                          <Listbox.Button className="w-full border rounded px-3 py-2 text-left bg-white">
                            {["QO" , "EOR" , "routine"].find(o => o === usage?.cycleDetails?.cycleType) || "Select cycle type"}
                          </Listbox.Button>

                          {/* OPTIONS */}
                          <Listbox.Options className="absolute mt-1 w-full bg-white border rounded shadow-lg z-10 max-h-60 overflow-auto">
                            {["QO" , "EOR" , "routine"].map(option => (
                                <Listbox.Option
                                    key={option}
                                    value={option}
                                    as={Fragment}

                                >
                                  {({ active, selected }) => (
                                      <li
                                          className={`cursor-pointer px-3 py-2 ${
                                              active ? "bg-gray-100" : ""
                                          } ${selected ? "font-semibold text-darkAccent" : ""}`}
                                      >
                                        {option}
                                      </li>
                                  )}
                                </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </div></Listbox>
                        </div>




                  )}
                </div>

                {/*usage Periode*/}
                <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-4">Usage Period</h3>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <div className="flex flex-col gap-4">

                    <DateTimePicker
                        label="Start"
                        value={start}
                        onChange={setStart}
                        slotProps={{
                          textField: { fullWidth: false, size: "medium" }
                        }}
                    />

                    <DateTimePicker
                        label="End"
                        value={end}
                        onChange={setEnd}
                        minDateTime={start ?? undefined}
                        slotProps={{
                          textField: { fullWidth: true, size: "medium" }
                        }}
                    />

                  </div>

                </LocalizationProvider>
                  <div className="text-xs text-gray-500 mt-2">
                    Duration : {getDiff()}
                  </div>
                </div>
              </div>

            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                  onClick={onClose}
                  className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                  onClick={handleSubmit}
                  disabled={!selected.length || !start || !end}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                Save
              </button>
            </div>

          </Dialog.Panel>
        </div>
      </Dialog>
  )
}