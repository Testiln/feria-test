const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ugkulwiwglxgdlgwmnnq.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVna3Vsd2l3Z2x4Z2RsZ3dtbm5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIzNTkwNiwiZXhwIjoyMDkyODExOTA2fQ.lQHXnvpcL_cSy8erlIoRCEXgh7DBZ1S3gqN4LpZdU3c'
)

async function fixAdminUsers() {
  console.log('\n=== ACTUALIZANDO USUARIOS ADMIN ===\n')

  // Actualizar todos los usuarios para establecer isActive = true
  const { error: updateError } = await supabaseAdmin
    .from('admin_users')
    .update({ isActive: true })
    .is('isActive', null) // Donde isActive es NULL

  if (updateError) {
    console.error('❌ Error al actualizar:', updateError.message)
    return
  }

  console.log('✓ Actualizando todos los usuarios con isActive = true...')

  // Verificar
  const { data: updated, error: checkError } = await supabaseAdmin
    .from('admin_users')
    .select('usuario, isActive')

  if (!checkError) {
    console.log('✓ Estado actual:')
    console.table(updated)
  }

  console.log('\n=== FIN DE ACTUALIZACIÓN ===\n')
}

fixAdminUsers().catch(console.error)
