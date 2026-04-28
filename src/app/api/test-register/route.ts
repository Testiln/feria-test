import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, document_id } = await request.json()

    console.log('\n🔍 TEST REGISTER: Attempting to register user')
    console.log('Email:', email)
    console.log('Full Name:', full_name)
    console.log('Document ID:', document_id)

    // Step 1: Create auth user
    console.log('\nStep 1: Creating auth user...')
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error('❌ Auth creation error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    console.log('✅ Auth user created:', authData.user.id)

    // Step 2: Insert user profile
    console.log('\nStep 2: Inserting user profile...')
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: authData.user.id,
          full_name,
          document_id,
          email,
        },
      ])
      .select()

    if (userError) {
      console.error('❌ User insert error:', userError)
      console.error('Error message:', userError.message)
      console.error('Error code:', userError.code)
      console.error('Error details:', userError.details)

      // Try to delete the auth user if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      console.log('⚠️  Rolled back auth user')

      return NextResponse.json(
        {
          error: 'Failed to create user profile',
          details: userError.message,
        },
        { status: 400 }
      )
    }

    console.log('✅ User profile created')

    // Step 3: Verify insertion
    console.log('\nStep 3: Verifying insertion...')
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (verifyError) {
      console.error('❌ Verification error:', verifyError)
      return NextResponse.json(
        {
          status: 'PARTIAL',
          message: 'User was created but verification failed',
        },
        { status: 200 }
      )
    }

    console.log('✅ User verified in database')
    console.log('User data:', JSON.stringify(verifyData, null, 2))

    return NextResponse.json(
      {
        success: true,
        user: verifyData,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Unexpected error: ' + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    )
  }
}
