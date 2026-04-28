import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ugkulwiwglxgdlgwmnnq.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVna3Vsd2l3Z2x4Z2RsZ3dtbm5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIzNTkwNiwiZXhwIjoyMDkyODExOTA2fQ.lQHXnvpcL_cSy8erlIoRCEXgh7DBZ1S3gqN4LpZdU3c'

console.log('🔍 DEBUG: Testing Supabase Connection\n')
console.log(`URL: ${supabaseUrl}`)
console.log(`Service Key presente: ${supabaseServiceKey ? 'SÍ' : 'NO'}\n`)

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function testConnection() {
  try {
    // 1. Prueba de conexión básica
    console.log('1️⃣  Verificando tabla users...')
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Error al acceder a tabla users:', error)
      return
    }

    console.log('✅ Tabla users accesible\n')

    // 2. Intentar insertar usuario de prueba
    console.log('2️⃣  Intentando insertar usuario de prueba...')
    const testUserId = 'test-' + Date.now()
    const { data: insertResult, error: insertError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: testUserId,
          full_name: 'Test User',
          document_id: '1234567890',
          email: `test-${Date.now()}@example.com`,
          phone: '+1234567890',
        },
      ])

    if (insertError) {
      console.error('❌ Error al insertar usuario:', insertError)
      console.error('Mensaje:', insertError.message)
      console.error('Details:', insertError.details)
      return
    }

    console.log('✅ Usuario insertado exitosamente!\n')

    // 3. Verificar que el usuario está en BD
    console.log('3️⃣  Verificando que el usuario está en BD...')
    const { data: userData, error: readError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single()

    if (readError) {
      console.error('❌ Error al leer usuario:', readError)
      return
    }

    console.log('✅ Usuario encontrado en BD:')
    console.log(JSON.stringify(userData, null, 2))

    // 4. Limpiar: borrar usuario de prueba
    console.log('\n4️⃣  Limpiando usuario de prueba...')
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', testUserId)

    if (deleteError) {
      console.error('❌ Error al eliminar usuario de prueba:', deleteError)
      return
    }

    console.log('✅ Usuario de prueba eliminado\n')
    console.log('✅✅✅ TODO FUNCIONA CORRECTAMENTE ✅✅✅')
  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

testConnection()
