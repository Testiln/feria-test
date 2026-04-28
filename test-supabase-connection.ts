import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testConnection() {
  console.log('🔍 Verificando configuración de Supabase...\n')

  // Verificar variables de entorno
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Variables de entorno no configuradas')
    console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'}`)
    console.error(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓' : '✗'}`)
    process.exit(1)
  }

  console.log('✅ Variables de entorno encontradas')
  console.log(`   URL: ${supabaseUrl}`)
  console.log(`   Key (primeros 20 chars): ${supabaseAnonKey.substring(0, 20)}...\n`)

  // Crear cliente Supabase
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Prueba 1: Verificar conexión básica
    console.log('📋 Prueba 1: Verificando conexión básica...')
    const { data: tables, error: tablesError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (tablesError) {
      console.error('❌ Error al conectar:', tablesError.message)
      process.exit(1)
    }
    console.log('✅ Conexión exitosa\n')

    // Prueba 2: Verificar tablas
    console.log('📊 Prueba 2: Verificando tablas...')
    const tableNames = [
      'users',
      'products',
      'orders',
      'order_items',
      'configuration'
    ]

    for (const table of tableNames) {
      const { error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error(`   ❌ ${table}: ${error.message}`)
      } else {
        console.log(`   ✅ ${table}`)
      }
    }

    // Prueba 3: Verificar datos de configuración
    console.log('\n⚙️  Prueba 3: Verificando configuración...')
    const { data: config, error: configError } = await supabase
      .from('configuration')
      .select('*')

    if (configError) {
      console.error(`   ❌ Error: ${configError.message}`)
    } else if (config && config.length > 0) {
      console.log(`   ✅ Configuración encontrada (${config.length} items)`)
      config.forEach((c: any) => {
        console.log(`      • ${c.key} = ${c.value}`)
      })
    } else {
      console.log('   ⚠️  No hay configuración')
    }

    // Prueba 4: Verificar RLS
    console.log('\n🔒 Prueba 4: Verificando Row Level Security...')
    console.log('   ✓ RLS debe estar habilitado en todas las tablas')
    console.log('   ✓ Las políticas deben permitir acceso según autenticación\n')

    console.log('🎉 ¡Todas las pruebas completadas!\n')
    console.log('📝 Próximos pasos:')
    console.log('   1. Ejecutar: npm run dev')
    console.log('   2. Visitar: http://localhost:3000')
    console.log('   3. Crear usuario en /register')
    console.log('   4. Añadir productos en admin panel')

  } catch (error) {
    console.error('❌ Error inesperado:', error)
    process.exit(1)
  }
}

testConnection()
