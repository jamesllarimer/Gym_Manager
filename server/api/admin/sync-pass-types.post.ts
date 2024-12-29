// server/api/admin/sync-pass-types.post.ts
import Stripe from 'stripe'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2023-10-16'
  })

  try {
    // Get all pass types that need syncing (no Stripe IDs or outdated info)
    const { data: passTypes, error } = await client
      .from('pass_types')
      .select('*')
    
    if (error) throw error

    for (const passType of passTypes) {
      let stripeProduct
      let stripePrice

      // Create or update Stripe product
      if (passType.stripe_product_id) {
        stripeProduct = await stripe.products.update(passType.stripe_product_id, {
          name: passType.name,
          description: passType.description,
          metadata: {
            pass_type_id: passType.id,
            duration_months: passType.duration_months.toString(),
            max_family_members: passType.max_family_members.toString()
          }
        })
      } else {
        stripeProduct = await stripe.products.create({
          name: passType.name,
          description: passType.description,
          metadata: {
            pass_type_id: passType.id,
            duration_months: passType.duration_months.toString(),
            max_family_members: passType.max_family_members.toString()
          }
        })
      }

      // Create or update Stripe price
      if (passType.stripe_price_id) {
        // Stripe prices can't be updated, but we can get the existing one
        stripePrice = await stripe.prices.retrieve(passType.stripe_price_id)
      } else {
        stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(passType.price * 100), // Convert to cents
          currency: 'usd',
          recurring: {
            interval: 'month',
            interval_count: passType.duration_months
          },
          metadata: {
            pass_type_id: passType.id
          }
        })
      }

      // Update pass_type with Stripe IDs
      const { error: updateError } = await client
        .from('pass_types')
        .update({
          stripe_product_id: stripeProduct.id,
          stripe_price_id: stripePrice.id,
          stripe_metadata: {
            product_created: stripeProduct.created,
            price_created: stripePrice.created
          }
        })
        .eq('id', passType.id)

      if (updateError) throw updateError
    }

    return { success: true }
  } catch (error) {
    console.error('Error syncing pass types with Stripe:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to sync pass types with Stripe'
    })
  }
})