'use client'

import { useState } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Button,
  Box,
  Typography
} from '@mui/material'


export interface PhoneContact {
  id?: number
  phone: string
  is_active?: boolean
}

type PhoneTableProps = {
  phones: PhoneContact[]
  onPhonesChange: (phones: PhoneContact[]) => void
  disabled?: boolean
}

const PhoneTable = ({ phones, onPhonesChange, disabled = false }: PhoneTableProps) => {
  const [newPhone, setNewPhone] = useState('')

  const addPhone = () => {
    if (newPhone.trim()) {
      const updatedPhones = [...phones, { phone: newPhone.trim(), is_active: true }]

      onPhonesChange(updatedPhones)
      setNewPhone('')
    }
  }

  const removePhone = (index: number) => {
    const updatedPhones = phones.filter((_, i) => i !== index)

    onPhonesChange(updatedPhones)
  }

  const updatePhone = (index: number, value: string) => {
    const updatedPhones = phones.map((phone, i) =>
      i === index ? { ...phone, phone: value } : phone
    )

    onPhonesChange(updatedPhones)
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Teléfonos de Contacto
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          label="Nuevo teléfono"
          placeholder="0000 0000"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          disabled={disabled}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addPhone()
            }
          }}
        />
        <Button
          variant="contained"
          startIcon={<i className='tabler-plus' />}
          onClick={addPhone}
          disabled={disabled || !newPhone.trim()}
        >
          Agregar
        </Button>
      </Box>

      {phones.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Número de Teléfono</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {phones.map((phone, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={phone.phone}
                      onChange={(e) => updatePhone(index, e.target.value)}
                      disabled={disabled}
                      placeholder="0000 0000"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removePhone(index)}
                      disabled={disabled}
                    >
                      <i className='tabler-trash' />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {phones.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No hay teléfonos agregados. Usa el campo de arriba para agregar el primero.
        </Typography>
      )}
    </Box>
  )
}

export default PhoneTable
