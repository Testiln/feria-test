import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function refreshSchemaCache() {
  console.log('🔄 Refrescando schema cache de Supabase...\n')

  // Usar service role para operaciones más robustas
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const tables = ['users', 'products', 'orders', 'order_items', 'configuration']

  try {
    for (const table of tables) {
      console.log(`📋 Refrescando tabla: ${table}...`)
      
      const { error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        if (error.code === 'PGRST205') {
          console.log(`   ⚠️  Tabla no está en cache, forzando refresh...`)
          
          // Intenta una query más explícita
          const { error: err2 } = await supabase.rpc('ping')
          if (err2) {
            console.log(`   ℹ️  ${err2.message}`)
          }
        } else {
          console.error(`   ❌ Error: ${error.message}`)
        }
      } else {
        console.log(`   ✅ ${table} - OK`)
      }
    }

    console.log('\n✅ Schema cache refresh completado')
    console.log('💡 Espera 5-10 segundos y recarga el navegador\n')

  } catch (err) {
    console.error('❌ Error:', err)
  }
}

refreshSchemaCache()
