import { createClient } from '@supabase/supabase-js'

// These will be replaced with your actual Supabase credentials
// Handle both Vite development and Cloudflare Workers environments
const getEnvVar = (name) => {
  // For Cloudflare Workers/ Pages
  if (typeof globalThis !== 'undefined' && globalThis.env && globalThis.env[name]) {
    return globalThis.env[name]
  }
  // For Vite development
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
    return import.meta.env[name]
  }
  // Fallback for other environments
  return undefined
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL')
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY')

// Check if credentials are properly set
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co')
const isValidKey = supabaseAnonKey && supabaseAnonKey.length > 50 && supabaseAnonKey.startsWith('eyJ')

if (!isValidUrl || !isValidKey) {
  console.warn('⚠️ Supabase credentials not properly configured. Please update your .env file with actual Supabase URL and anon key.')
  console.log('Current URL:', supabaseUrl)
  console.log('Current Key format:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'Not set')
}

// Always create client - if credentials are invalid, we'll handle the error gracefully
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common database operations
export const supabaseService = {
  // Profile operations
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Recipe operations
  async getRecipes(userId, familyId = null) {
    try {
      // Let RLS policies handle the filtering - just query all recipes
      // The RLS policies will ensure user only sees their own recipes + family recipes
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching recipes:', error)
        return []
      }
      return data || []
    } catch (error) {
      console.error('Unexpected error fetching recipes:', error)
      return []
    }
  },

  async getRecipeById(recipeId) {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single()
    
    if (error) throw error
    return data
  },

  async getPublicRecipeById(recipeId) {
    try {
      console.log('Querying public recipe with ID:', recipeId)
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .eq('is_public', true)
        .single()
      
      console.log('Public recipe query result:', { data, error })
      
      // Don't throw error for PGRST116 (not found), just return null
      if (error && error.code !== 'PGRST116') {
        console.error('Unexpected error in getPublicRecipeById:', error)
        throw error
      }
      return data
    } catch (error) {
      console.error('Exception in getPublicRecipeById:', error)
      throw error
    }
  },

  async createRecipe(recipe) {
    const { data, error } = await supabase
      .from('recipes')
      .insert(recipe)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateRecipe(id, updates) {
    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteRecipe(id) {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Family operations
  async getUserFamilies(userId) {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          family_id,
          role,
          families (
            id,
            name,
            created_by
          )
        `)
        .eq('profile_id', userId)
      
      if (error) {
        console.error('Error fetching user families:', error)
        return []
      }
      return data || []
    } catch (error) {
      console.error('Unexpected error fetching user families:', error)
      return []
    }
  },

  async createFamily(family) {
    const { data, error } = await supabase
      .from('families')
      .insert({
        name: family.name,
        description: family.description,
        created_by: family.created_by
      })
      .select()
      .single()
    
    if (error) throw error
    
    // The trigger should automatically add the creator as admin, but let's verify
    // and manually add if the trigger doesn't work
    try {
      const { data: memberCheck } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', data.id)
        .eq('profile_id', family.created_by)
        .single()
      
      if (!memberCheck) {
        // If trigger didn't work, add manually
        await this.addFamilyMember(data.id, family.created_by, 'admin')
      }
    } catch (err) {
      // If check fails, try to add anyway
      await this.addFamilyMember(data.id, family.created_by, 'admin')
    }
    
    return data
  },

  async addFamilyMember(familyId, profileId, role = 'member') {
    const { data, error } = await supabase
      .from('family_members')
      .insert({ family_id: familyId, profile_id: profileId, role })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async inviteFamilyMember(familyId, invitedBy, email) {
    const { data, error } = await supabase
      .from('family_invitations')
      .insert({
        family_id: familyId,
        invited_by: invitedBy,
        invited_email: email
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getFamilyInvitations(userId) {
    // First get user's email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()
    
    if (profileError) throw profileError
    
    const { data, error } = await supabase
      .from('family_invitations')
      .select(`
        *,
        families (
          id,
          name
        ),
        inviter:profiles!family_invitations_invited_by_fkey (
          email,
          full_name
        )
      `)
      .eq('invited_email', profile.email)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
    
    if (error) throw error
    return data || []
  },

  async acceptInvitation(invitationId, profileId) {
    const { data: invitation, error: fetchError } = await supabase
      .from('family_invitations')
      .select('*')
      .eq('id', invitationId)
      .single()
    
    if (fetchError) throw fetchError
    
    // Add user to family
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: invitation.family_id,
        profile_id: profileId,
        role: 'member'
      })
    
    if (memberError) throw memberError
    
    // Update invitation status
    const { error: updateError } = await supabase
      .from('family_invitations')
      .update({ 
        status: 'accepted',
        invited_profile_id: profileId
      })
      .eq('id', invitationId)
    
    if (updateError) throw updateError
    
    return true
  },

  async declineInvitation(invitationId) {
    const { error } = await supabase
      .from('family_invitations')
      .update({ status: 'declined' })
      .eq('id', invitationId)
    
    if (error) throw error
    return true
  },

  async getFamilyById(familyId) {
    const { data, error } = await supabase
      .from('families')
      .select('*')
      .eq('id', familyId)
      .single()
    
    if (error) throw error
    return data
  },

  async getFamilyMembers(familyId) {
    const { data, error } = await supabase
      .from('family_members')
      .select(`
        role,
        joined_at,
        profiles (
          id,
          email,
          full_name
        )
      `)
      .eq('family_id', familyId)
    
    if (error) throw error
    return data || []
  },

  async getFamilyRecipes(familyId) {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        profiles:created_by_profile_id (
          email,
          full_name
        )
      `)
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async shareRecipeWithFamily(recipeId, familyId) {
    const { data, error } = await supabase
      .from('recipes')
      .update({ family_id: familyId })
      .eq('id', recipeId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async removeRecipeFromFamily(recipeId) {
    const { data, error } = await supabase
      .from('recipes')
      .update({ family_id: null })
      .eq('id', recipeId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Meal plan operations
  async getMealPlan(familyId, startDate, endDate) {
    const { data, error } = await supabase
      .from('meal_plans')
      .select(`
        *,
        meal_plan_entries (
          *,
          recipes (*)
        )
      `)
      .eq('family_id', familyId)
      .gte('start_date', startDate)
      .lte('end_date', endDate)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createMealPlan(mealPlan) {
    const { data, error } = await supabase
      .from('meal_plans')
      .insert(mealPlan)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateMealPlanEntry(id, updates) {
    const { data, error } = await supabase
      .from('meal_plan_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async createMealPlanEntry(entry) {
    const { data, error } = await supabase
      .from('meal_plan_entries')
      .insert(entry)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteMealPlanEntry(id) {
    const { error } = await supabase
      .from('meal_plan_entries')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

export default supabase
