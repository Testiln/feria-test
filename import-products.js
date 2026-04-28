const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  const products = []
  const processedNames = new Set()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    try {
      const parts = line.split(';')
      if (parts.length < 5) continue

      const fullName = parts[0].trim()
      const quantity = parseInt(parts[2].trim()) || 0
      const priceStr = parts[3]?.trim() || '0'
      const stock = parseInt(parts[4]?.trim()) || 0

      if (!fullName || stock <= 0) continue

      // Parse product code and name
      const match = fullName.match(/^([0-9]+\s*-\s*)(.+)$/)
      const productCode = match ? match[1].replace(/\s*-\s*$/, '') : 'PROD-' + Date.now()
      const productName = match ? match[2] : fullName

      // Skip if we already processed this product
      if (processedNames.has(productName)) continue
      processedNames.add(productName)

      // Parse price (remove currency symbols and convert to number)
      const price = parseFloat(priceStr.replace(/[^0-9,.-]/g, '').replace('.', '').replace(',', '.')) || 0

      products.push({
        code: productCode,
        name: productName,
        stock,
        reserved_stock: 0,
        price: Math.round(price * 100) / 100, // Round to 2 decimals
        image_url: null,
        ecommerce_url: null,
      })
    } catch (error) {
      console.error('Error parsing line:', line, error.message)
    }
  }

  return products
}

async function importProducts() {
  console.log('\n📦 Starting product import...\n')

  try {
    // Parse CSV
    console.log('📖 Parsing CSV file...')
    const csvPath = path.join(__dirname, '..', 'STOCK DE PRODUCTOS FERIA DE LOS EMPLEADOS(STOCK).csv')
    const products = await parseCSV(csvPath)

    console.log(`✅ Found ${products.length} unique products\n`)

    if (products.length === 0) {
      console.log('⚠️  No products to import')
      return
    }

    // Clear existing products (optional)
    console.log('🗑️  Clearing existing products...')
    const { error: deleteError } = await supabase.from('products').delete().neq('id', '')

    if (deleteError) {
      console.error('⚠️  Warning: Could not clear products:', deleteError.message)
    } else {
      console.log('✅ Products cleared\n')
    }

    // Insert products in batches
    const batchSize = 100
    let inserted = 0

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      console.log(`📤 Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}...`)

      const { error: insertError, data: insertedData } = await supabase
        .from('products')
        .insert(batch)
        .select()

      if (insertError) {
        console.error('❌ Insert error:', insertError.message)
        continue
      }

      inserted += batch.length
      console.log(`   ✅ Inserted ${batch.length} products`)
    }

    console.log(`\n✅ Successfully imported ${inserted} products!\n`)

    // Show summary
    const { data: allProducts, error: countError } = await supabase
      .from('products')
      .select('id, name, stock, price', { count: 'exact' })
      .limit(5)

    if (!countError) {
      console.log('📊 Sample products:')
      allProducts?.forEach((p) => {
        console.log(`   - ${p.name}: ${p.stock} units @ ${p.price}`)
      })
    }

    console.log('\n✅ Import complete!')
  } catch (error) {
    console.error('❌ Import failed:', error)
  }
}

importProducts()
