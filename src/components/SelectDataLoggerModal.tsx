import {Dialog, Listbox} from '@headlessui/react'
import { useEffect, useState } from 'react'

import { db } from "../firebase/config.ts"
import { Datalogger} from "../types"
import { Fragment } from "react"
import  { Dayjs } from "dayjs"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import {Form, Formik, useFormikContext} from "formik"
import * as Yup from "yup"
import { collection, addDoc, serverTimestamp, getDocs  } from "firebase/firestore"




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



// Validation schema
const validationSchema = Yup.object().shape({
  start: Yup.date().required("Start date is required").nullable(),
  end: Yup.date()
    .required("End date is required")
    .nullable()
    .typeError("End date must be a valid date")
    .min(Yup.ref("start"), "End date must be after start date"),
  usageType: Yup.string().required("Usage type is required"),
  cycleDetails: Yup.object().when("usageType", {
    is: "CYCLE_VALIDATION",
    then: (schema) =>
      schema.shape({
        cycleRef: Yup.string().required("Cycle reference is required"),
        cycleType: Yup.string().required("Cycle type is required")
      })
  })
})

export default function DataloggerDialog({
                                           isOpen,
                                           onClose,

                                         }: Props) {

  // Selection and Filters (not part of form)
  const [selected, setSelected] = useState<string[]>([])
  const [filters, setFilters] = useState<FilterType>({
    type: [],
    measurementType: []
  })

  // Data
  const [dataloggers, setDataloggers] = useState<Datalogger[]>([])

  // Formik setup
  const initialValues = {
    dataloggerIds: [] as string[],
    start: null as Dayjs | null,
    end: null as Dayjs | null,
    usageType: "" as UsageType | "",
    cycleDetails: {
      cycleRef: "",
      cycleType: ""
    }
  }

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






  function FormikDebugger() {
    const { values } = useFormikContext()

    useEffect(() => {
      console.log("Formik values:", values)
    }, [values])

    return null
  }
  // -------------------------
  // Render
  // -------------------------
  return (
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className={`fixed inset-0 bg-black/30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />

        <div className={`fixed inset-0 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col p-6 transform transition-all duration-300">

            <Dialog.Title className="text-xl text-left text-darkCard font-semibold mb-4">
              Assign Usage
            </Dialog.Title>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                  try {
                    if (!values.start || !values.end) return

                    const payload = {
                      dataloggerId: values.dataloggerIds,
                      usageType: values.usageType,
                      //cycleDetails: values.cycleDetails,

                      startDate: values.start.toISOString(),
                      endDate: values.end.toISOString(),

                      createdAt: serverTimestamp()
                    }

                    await addDoc(collection(db, "usages"), payload)



                    resetForm()
                    onClose()
                  } catch (error) {
                    console.error("Firestore save error:", error)
                  } finally {
                    setSubmitting(false)
                  }
                }}>
              {(formik) => {

                const getDuration = () => {
                const { start, end } = formik.values

                if (!start || !end) return "--"

                const diffMs = end.diff(start)

                const minutes = Math.floor(diffMs / (1000 * 60)) % 60
                const hours = Math.floor(diffMs / (1000 * 60 * 60)) % 24
                const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

                return `${days}d ${hours}h ${minutes}m`
              }
              return (
                  <Form>
                    <FormikDebugger />
                    <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">

                      {/* LEFT PANEL */}
                      <div className="border rounded-lg p-4 flex flex-col">

                        {/* Filters */}
                        <div className="mb-3">
                          <h3 className="font-medium mb-2">Filters</h3>

                          <div className="flex flex-wrap gap-2">

                            <button
                                type="button"
                                onClick={() => toggleTypeFilter("ATEX")}
                                className={`px-2 border rounded ${
                                    filters.type.includes("ATEX")
                                        ? "bg-darkAccent text-white"
                                        : "hover:bg-gray-100"
                                }`}
                            >
                              ATEX
                            </button>
                            <button  type="button"
                                     onClick={() => toggleTypeFilter("NON_ATEX")}
                                     className={`px-2 border rounded ${ filters.type.includes("NON_ATEX") ? "bg-darkAccent text-white" : "hover:bg-gray-100" }`}
                            >
                              NON-ATEX
                            </button>
                            <button  type="button"  onClick={() => toggleMeasurementFilter("TEMPERATURE")} className={`px-2 border rounded ${ filters.measurementType.includes("TEMPERATURE") ? "bg-darkAccent text-white" : "hover:bg-gray-100" }`} > TEMP </button>
                            <button  type="button" onClick={() => toggleMeasurementFilter("TEMP_HUMIDITY")} className={`px-2 border rounded ${ filters.measurementType.includes("TEMP_HUMIDITY") ? "bg-darkAccent text-white" : "hover:bg-gray-100" }`} > TEMP_HUM </button>

                            <button  type="button" onClick={() => setFilters({ type: [], measurementType: [] })} className={"px-2 border rounded bg-zinc-500 text-white hover:text-darkBg hover:bg-darkText"} > Clear </button>
                          </div>
                        </div>

                        {/* LIST */}
                        <div className="overflow-y-auto flex-1">
                          {filteredDataloggers.map(dl => (
                              <label
                                  key={dl.id}
                                  className="flex items-center gap-2 py-1 cursor-pointer text-darkCard font-bold"
                              >
                                <input
                                    type="checkbox"
                                    checked={formik.values.dataloggerIds.includes(dl.id)}
                                    onChange={() => {
                                      const current = formik.values.dataloggerIds

                                      const updated = current.includes(dl.id)
                                          ? current.filter((id:string) => id !== dl.id)
                                          : [...current, dl.id]

                                      formik.setFieldValue("dataloggerIds", updated)
                                    }}
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
                      </div>

                      {/* RIGHT PANEL */}
                      <div className="space-y-4">

                        {/* Usage Type */}
                        <div className="border rounded-lg p-4">
                          <h3 className="font-medium mb-4">Usage Type</h3>

                          <Listbox
                              value={formik.values.usageType}
                              onChange={(value) =>
                                  formik.setFieldValue("usageType", value)
                              }
                          >
                            <div className="relative">

                              <Listbox.Button className="w-full border rounded px-3 py-2 text-left bg-white">
                                {
                                    usageOptions.find(
                                        o => o.value === formik.values.usageType
                                    )?.label || "Select usage type"
                                }
                              </Listbox.Button>

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
                                              } ${
                                                  selected
                                                      ? "font-semibold text-darkAccent"
                                                      : ""
                                              }`}
                                          >
                                            {option.label}
                                          </li>
                                      )}
                                    </Listbox.Option>
                                ))}

                              </Listbox.Options>

                            </div>
                          </Listbox>

                          {formik.touched.usageType &&
                              formik.errors.usageType && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {formik.errors.usageType}
                                  </p>
                              )}
                        </div>

                        {/* Dates */}
                        <div className="border rounded-lg p-4">
                          <h3 className="font-medium mb-4">Usage Period</h3>

                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <div className="flex flex-col gap-4">

                              <DateTimePicker
                                  label="Start"
                                  value={formik.values.start}
                                  onChange={(value) =>
                                      formik.setFieldValue("start", value)
                                  }
                              />

                              <DateTimePicker
                                  label="End"
                                  value={formik.values.end}
                                  minDateTime={formik.values.start ?? undefined}
                                  onChange={(value) =>
                                      formik.setFieldValue("end", value)
                                  }
                              />

                            </div>
                          </LocalizationProvider>
                          <div className="text-xs text-gray-500 mt-2">
                            Duration: {getDuration()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-2 mt-6">

                      <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 border rounded text-gray-400 border-gray-400 hover:bg-gray-100"
                      >
                        Cancel
                      </button>

                      <button
                          type="submit"
                          disabled={
                              !formik.values.dataloggerIds.length ||
                              !formik.values.start ||
                              !formik.values.end ||
                              formik.isSubmitting
                          }
                          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                      >
                        Save
                      </button>

                    </div>
                  </Form>
              )
              }}
            </Formik>
          </Dialog.Panel>
        </div>
      </Dialog>
  )
}