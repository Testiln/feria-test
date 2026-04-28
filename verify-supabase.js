const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifySupabase() {
  console.log('\n🔍 Verificando configuración de Supabase...\n');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('❌ Error: Variables de entorno incompletas');
    process.exit(1);
  }

  console.log('✅ Variables de entorno cargadas');
  console.log(`   URL: ${url}`);
  console.log(`   Anon Key: ${anonKey.substring(0, 15)}...\n`);

  const supabase = createClient(url, anonKey);

  try {
    // Test 1: Conexión básica
    console.log('📋 Test 1: Conectando a Supabase...');
    const { data, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`   ❌ Error: ${error.message}`);
      console.error(`   Código: ${error.code}`);
      process.exit(1);
    }
    console.log('   ✅ Conexión exitosa\n');

    // Test 2: Verificar tablas
    console.log('📊 Test 2: Verificando tablas...');
    const tables = ['users', 'products', 'orders', 'order_items', 'configuration'];

    for (const table of tables) {
      const { error: err } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (err) {
        console.error(`   ❌ ${table}: ${err.message}`);
      } else {
        console.log(`   ✅ ${table}`);
      }
    }

    // Test 3: Configuración
    console.log('\n⚙️  Test 3: Leyendo configuración...');
    const { data: config, error: cfgError } = await supabase
      .from('configuration')
      .select('*');

    if (cfgError) {
      console.error(`   ❌ Error: ${cfgError.message}`);
    } else if (config?.length > 0) {
      console.log(`   ✅ Configuración (${config.length} items):`);
      config.forEach((c) => {
        console.log(`      • ${c.key} = "${c.value}"`);
      });
    } else {
      console.log('   ⚠️  No hay configuración');
    }

    console.log('\n🎉 ¡Todo verificado correctamente!\n');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verifySupabase();
