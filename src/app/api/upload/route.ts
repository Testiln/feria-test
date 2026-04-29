import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Solo se aceptan PDF' },
        { status: 400 }
      )
    }

    // Validar tamaño
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El archivo no puede superar 5MB' },
        { status: 400 }
      )
    }

    // Convertir archivo a Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Crear nombre único para el archivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split('.').pop()
    const fileName = `approval_${timestamp}_${randomString}.${fileExtension}`

    // Subir a Supabase Storage usando supabaseAdmin (bypass RLS)
    const { data, error } = await supabaseAdmin.storage
      .from('documents')
      .upload(`approvals/${fileName}`, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json(
        { error: 'Error al subir archivo: ' + error.message },
        { status: 500 }
      )
    }

    // Obtener URL pública del archivo usando supabaseAdmin
    const { data: publicData } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(`approvals/${fileName}`)

    return NextResponse.json(
      {
        success: true,
        url: publicData.publicUrl,
        fileName: fileName,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
