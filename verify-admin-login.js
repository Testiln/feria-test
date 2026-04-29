const { createClient } = require('@supabase/supabase-js')
const bcryptjs = require('bcryptjs')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ugkulwiwglxgdlgwmnnq.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVna3Vsd2l3Z2x4Z2RsZ3dtbm5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIzNTkwNiwiZXhwIjoyMDkyODExOTA2fQ.lQHXnvpcL_cSy8erlIoRCEXgh7DBZ1S3gqN4LpZdU3c'
)

async function checkLogin() {
  console.log('\n=== VERIFICANDO LOGIN ADMIN ===\n')

  // 1. Obtener todos los usuarios admin
  console.log('1. Obteniendo todos los usuarios admin...')
  const { data: allUsers, error: allError } = await supabaseAdmin
    .from('admin_users')
    .select('*')

  if (allError) {
    console.error('❌ Error al obtener usuarios:', allError.message)
    return
  }

  console.log(`✓ Se encontraron ${allUsers?.length || 0} usuarios admin`)
  if (allUsers && allUsers.length > 0) {
    console.table(allUsers.map(u => ({ id: u.id, nombre: u.nombre, usuario: u.usuario, isActive: u.isActive })))
  } else {
    console.log('   (No hay usuarios admin)')
  }

  // 2. Buscar el usuario 'admin'
  console.log('\n2. Buscando usuario "admin"...')
  const { data: adminUser, error: userError } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .eq('usuario', 'admin')
    .single()

  if (userError) {
    console.error('❌ Error al buscar usuario admin:', userError.message)
  } else if (adminUser) {
    console.log('✓ Usuario admin encontrado')
    console.log(`  - ID: ${adminUser.id}`)
    console.log(`  - Nombre: ${adminUser.nombre}`)
    console.log(`  - Usuario: ${adminUser.usuario}`)
    console.log(`  - isActive: ${adminUser.isActive}`)
    console.log(`  - Contraseña hash: ${adminUser.pwd?.substring(0, 20)}...`)

    // 3. Probar contraseña
    console.log('\n3. Probando contraseña "admin123"...')
    try {
      const match = await bcryptjs.compare('admin123', adminUser.pwd)
      if (match) {
        console.log('✓ ¡Contraseña correcta!')
      } else {
        console.log('❌ Contraseña incorrecta')
        console.log('   - Hash almacenado:', adminUser.pwd)
        console.log('   - Generando hash para "admin123"...')
        const testHash = await bcryptjs.hash('admin123', 10)
        console.log('   - Hash generado:', testHash)
      }
    } catch (err) {
      console.error('❌ Error al comparar contraseña:', err.message)
    }
  } else {
    console.log('❌ Usuario admin no encontrado en la BD')
  }

  console.log('\n=== FIN DE VERIFICACIÓN ===\n')
}

checkLogin().catch(console.error)
