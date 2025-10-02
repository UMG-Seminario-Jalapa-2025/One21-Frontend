'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

import CustomTextField from '@core/components/mui/TextField'

export default function CrearPrioridadPage() {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        level: ''
    })

    const [snackbar, setSnackbar] = useState<{
        open: boolean
        message: string
        severity: 'success' | 'error'
    }>({
        open: false,
        message: '',
        severity: 'success'
    })

    const handleCancel = () => {
        router.push('/prioridades')
    }

    const handleSave = async () => {
        // Validaciones
        if (!formData.code.trim()) {
            setSnackbar({
                open: true,
                message: 'El código es requerido',
                severity: 'error'
            })

            return
        }

        if (!formData.name.trim()) {
            setSnackbar({
                open: true,
                message: 'El nombre es requerido',
                severity: 'error'
            })

            return
        }

        if (!formData.level.trim() || isNaN(Number(formData.level))) {
            setSnackbar({
                open: true,
                message: 'El nivel es requerido y debe ser un número',
                severity: 'error'
            })

            return
        }

        try {
            setSubmitting(true)

            const res = await fetch('/api/tickets/prioridades/crear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: formData.code,
                    name: formData.name,
                    level: Number(formData.level)
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Error al crear prioridad')
            }

            setSnackbar({
                open: true,
                message: 'Prioridad creada con éxito',
                severity: 'success'
            })

            // Esperar un momento para que se vea el toast antes de redirigir
            setTimeout(() => {
                router.push('/prioridades')
            }, 1500)
        } catch (error: any) {
            console.error('Error creando prioridad:', error)
            setSnackbar({
                open: true,
                message: error.message || 'Error al crear prioridad',
                severity: 'error'
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="p-6">
            <Typography variant="h4" gutterBottom>
                Crear Prioridad
            </Typography>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Información de la Prioridad
                    </Typography>

                    <Grid container spacing={6}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomTextField
                                fullWidth
                                label="Código"
                                placeholder="Ej: HIGH"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                disabled={submitting}
                                required
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomTextField
                                fullWidth
                                label="Nombre"
                                placeholder="Ej: Alta"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={submitting}
                                required
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomTextField
                                fullWidth
                                label="Nivel"
                                placeholder="Ej: 1"
                                type="number"
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                disabled={submitting}
                                required
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }} className="flex justify-between">
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleCancel}
                                disabled={submitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={submitting}
                            >
                                {submitting ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Notificación Toast */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    )
}
