import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function deploySchema() {
  console.log('📊 Leyendo schema.sql...')
  const schema = fs.readFileSync('./schema.sql', 'utf-8')
  
  console.log('🔗 Conectando a Supabase con Service Role Key...')
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  console.log('⏳ Ejecutando schema...\n')

  try {
    const { error } = await supabase.rpc('sql', {
      query: schema
    })

    if (error) {
      console.error('❌ Error:', error.message)
      return
    }

    console.log('✅ Schema desplegado exitosamente!')
    console.log('\n📋 Tablas creadas:')
    console.log('   ✅ users')
    console.log('   ✅ products')
    console.log('   ✅ orders')
    console.log('   ✅ order_items')
    console.log('   ✅ configuration')
    console.log('\n🔐 Políticas RLS activadas')
    console.log('\n✨ Listo para usar\n')

  } catch (err) {
    console.error('❌ Error:', err)
  }
}

deploySchema()
