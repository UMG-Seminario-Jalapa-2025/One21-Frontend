'use client'

import Link from 'next/link'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

const mockPersonas = [
  { id: 1, nombres: 'Juan', apellidos: 'Pérez', telefono: '5555-1234', ciudad: 'Guatemala' },
  { id: 2, nombres: 'María', apellidos: 'Gómez', telefono: '5555-5678', ciudad: 'Jalapa' }
]

export default function PersonasPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4">Personas</Typography>
        <Link href="/personas/crear">
          <Button variant="contained" color="primary">
            Crear Persona
          </Button>
        </Link>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombres</TableCell>
            <TableCell>Apellidos</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Ciudad</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockPersonas.map(persona => (
            <TableRow key={persona.id}>
              <TableCell>{persona.nombres}</TableCell>
              <TableCell>{persona.apellidos}</TableCell>
              <TableCell>{persona.telefono}</TableCell>
              <TableCell>{persona.ciudad}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
