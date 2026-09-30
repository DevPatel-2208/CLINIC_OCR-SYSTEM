import { useState, useCallback } from 'react'

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState({
    title: '',
    message: '',
    onConfirm: null,
    variant: 'danger',
  })

  const openConfirm = useCallback(({ title, message, onConfirm, variant = 'danger' }) => {
    setConfig({ title, message, onConfirm, variant })
    setIsOpen(true)
  }, [])

  const closeConfirm = useCallback(() => {
    setIsOpen(false)
    setConfig({ title: '', message: '', onConfirm: null, variant: 'danger' })
  }, [])

  const confirm = useCallback(() => {
    if (config.onConfirm) config.onConfirm()
    closeConfirm()
  }, [config, closeConfirm])

  return {
    isOpen,
    config,
    openConfirm,
    closeConfirm,
    confirm,
  }
}
