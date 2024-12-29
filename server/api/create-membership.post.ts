import Stripe from 'stripe'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { passTypeId, name, email, phone } = body
  
  const client = await serverSupabaseClient(event)
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2023-10-16'
  })

  try {
    // Get the pass type details
    const { data: passType, error: passTypeError } = await client
      .from('pass_types')
      .select('*')
      .eq('id', passTypeId)
      .single()

    if (passTypeError) throw passTypeError
    if (!passType.stripe_price_id) throw new Error('Pass type not configured with Stripe')

    // Create or get Stripe customer
    const customer = await stripe.customers.create({
      name,
      email,
      phone,
      metadata: {
        pass_type_id: passTypeId
      }
    })

    // Create Stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: passType.stripe_price_id }],
      metadata: {
        pass_type_id: passTypeId
      }
    })

    // Calculate expiration date based on subscription
    const expirationDate = new Date()
    expirationDate.setMonth(expirationDate.getMonth() + passType.duration_months)

    // Create member record
    const { data: member, error: memberError } = await client
      .from('members')
      .insert({
        auth_user_id: event.context.user.id,
        pass_type_id: passTypeId,
        membership_number: generateMembershipNumber(),
        name,
        email,
        phone,
        barcode: generateBarcode(),
        expiration_date: expirationDate.toISOString(),
        status: 'active'
      })
      .select()
      .single()

    if (memberError) throw memberError

    // Create subscription record
    const { error: subscriptionError } = await client
      .from('subscriptions')
      .insert({
        member_id: member.id,
        pass_type_id: passTypeId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customer.id,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
      })

    if (subscriptionError) throw subscriptionError

    return { success: true, member }
  } catch (error) {
    console.error('Error creating membership:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create membership'
    })
  }
})

function generateMembershipNumber() {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `MEM${timestamp}${random}`
}

function generateBarcode() {
  return `GYM${Date.now().toString(36).toUpperCase()}`
}