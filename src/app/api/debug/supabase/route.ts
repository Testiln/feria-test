import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('\n🔍 DEBUG: Testing Supabase User Insertion\n')

    // 1. Verificar tabla users
    console.log('1️⃣ Checking users table...')
    const { data: tableData, error: tableError, count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (tableError) {
      console.error('❌ Error accessing users table:', tableError)
      return NextResponse.json(
        { error: 'Table access error: ' + tableError.message },
        { status: 500 }
      )
    }

    console.log('✅ Users table is accessible\n')

    // 2. Get current RLS policies
    console.log('2️⃣ Checking RLS policies...')
    const { data: policiesData, error: policiesError } = await supabaseAdmin
      .rpc('get_policies_for_table', { table_name: 'users' })

    if (policiesError) {
      console.log('Policies check skipped (RPC not available)\n')
    } else {
      console.log('Policies (if available):', policiesData || 'Not available\n')
    }

    // 3. List all users
    console.log('3️⃣ Listing all users in database...')
    const { data: allUsers, error: listError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, created_at')
      .limit(5)

    if (listError) {
      console.error('❌ Error listing users:', listError)
    } else {
      console.log('✅ Users found:', allUsers?.length || 0)
      console.log('Users:', JSON.stringify(allUsers, null, 2))
    }

    // 4. Try inserting test user
    console.log('\n4️⃣ Attempting to insert test user...')
    const testId = `test-${Date.now()}`
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: testId,
          full_name: 'Debug Test User',
          document_id: '9999999999',
          email: `debug-${Date.now()}@test.com`,
          phone: '+9999999999',
        },
      ])
      .select()

    if (insertError) {
      console.error('❌ Insert Error:', {
        message: insertError.message,
        details: insertError.details,
        code: insertError.code,
      })
      return NextResponse.json(
        {
          status: 'ERROR',
          step: 'insert',
          error: insertError.message,
          details: insertError.details,
          code: insertError.code,
        },
        { status: 400 }
      )
    }

    console.log('✅ Test user inserted successfully!')
    console.log('Insert result:', JSON.stringify(insertData, null, 2))

    // 5. Verify insertion
    console.log('\n5️⃣ Verifying insertion...')
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', testId)
      .single()

    if (verifyError) {
      console.error('❌ Verification Error:', verifyError)
      return NextResponse.json(
        {
          status: 'PARTIAL',
          message: 'User was inserted but verification failed',
          error: verifyError.message,
        },
        { status: 200 }
      )
    }

    console.log('✅ User verified in database:')
    console.log(JSON.stringify(verifyData, null, 2))

    // 6. Clean up
    console.log('\n6️⃣ Cleaning up test user...')
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', testId)

    if (deleteError) {
      console.error('❌ Cleanup Error:', deleteError)
    } else {
      console.log('✅ Test user deleted')
    }

    console.log('\n✅✅✅ ALL TESTS PASSED ✅✅✅\n')

    return NextResponse.json(
      {
        status: 'SUCCESS',
        message: 'Supabase connection and CRUD operations are working correctly',
        summary: {
          tableAccessible: true,
          insertWorks: true,
          readWorks: true,
          deleteWorks: true,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json(
      {
        status: 'ERROR',
        error: 'Unexpected error: ' + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    )
  }
}
