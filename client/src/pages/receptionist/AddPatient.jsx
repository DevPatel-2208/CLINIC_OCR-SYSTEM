import { useState } from 'react'
import { motion, AnimatePresence } from "motion"
import { useMutation } from '@tanstack/react-query'
import { fadeUp, fadeScale, staggerContainer, staggerItem, listItem } from '@/motion/variants'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { patientApi } from '../../services'
import { PatientForm } from '@/components/forms'
import { PageHeader } from '@/components/common'
import Button from '@/components/ui/Button'

export default function ReceptionistAddPatient() {
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (d) => patientApi.create(d),
    onSuccess: (res) => { toast.success('Patient registered successfully'); navigate(`/receptionist/patients/${res.data.data._id}`) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to register patient'),
  })

  return (
    <motion.div initial={fadeUp.initial} animate={fadeUp.animate} transition={fadeUp.animate.transition} className=" max-w-2xl mx-auto will-change-transform">
      <PageHeader
        title="Register Patient"
        description="Create a new patient record for the clinic."
      />
      <div className="card-surface p-6">
        <PatientForm
          onSubmit={(data) => mutation.mutate(data)}
          isLoading={mutation.isPending}
          submitLabel="Register Patient"
        />
      </div>
    </motion.div>
  )
}
