import { supabase } from '../supabase'
import { ProgressPhoto } from '@/types'
import { authService } from '../auth'
import { deleteImage, STORAGE_BUCKETS } from '../storage-service'

export async function createProgressPhoto(photoData: Omit<ProgressPhoto, 'id'>): Promise<{ data: ProgressPhoto | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('progress_photos')
      .insert({
        user_id: userId,
        image_url: photoData.image,
        date: photoData.date.toISOString(),
        weight: photoData.weight,
        body_fat_percentage: photoData.bodyFatPercentage,
        muscle_mass: photoData.muscleMass,
        notes: photoData.notes
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedPhoto: ProgressPhoto = {
      id: data.id,
      image: data.image_url,
      date: new Date(data.date),
      weight: data.weight,
      bodyFatPercentage: data.body_fat_percentage,
      muscleMass: data.muscle_mass,
      notes: data.notes
    }

    return { data: transformedPhoto, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create progress photo' }
  }
}

export async function updateProgressPhoto(id: string, updates: Partial<ProgressPhoto>): Promise<{ data: ProgressPhoto | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.image !== undefined) updateData.image_url = updates.image
    if (updates.date !== undefined) updateData.date = updates.date.toISOString()
    if (updates.weight !== undefined) updateData.weight = updates.weight
    if (updates.bodyFatPercentage !== undefined) updateData.body_fat_percentage = updates.bodyFatPercentage
    if (updates.muscleMass !== undefined) updateData.muscle_mass = updates.muscleMass
    if (updates.notes !== undefined) updateData.notes = updates.notes

    const { data, error } = await supabase
      .from('progress_photos')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedPhoto: ProgressPhoto = {
      id: data.id,
      image: data.image_url,
      date: new Date(data.date),
      weight: data.weight,
      bodyFatPercentage: data.body_fat_percentage,
      muscleMass: data.muscle_mass,
      notes: data.notes
    }

    return { data: transformedPhoto, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update progress photo' }
  }
}

export async function deleteProgressPhoto(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    // First, get the photo to retrieve the image path
    const { data: photo, error: fetchError } = await supabase
      .from('progress_photos')
      .select('image_url')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    // Delete from database
    const { error } = await supabase
      .from('progress_photos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Delete the image from storage
    if (photo?.image_url) {
      await deleteImage(STORAGE_BUCKETS.PROGRESS_PHOTOS, photo.image_url)
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete progress photo' }
  }
}

export async function getUserProgressPhotos(): Promise<{ data: ProgressPhoto[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: photos, error } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedPhotos: ProgressPhoto[] = photos.map(photo => ({
      id: photo.id,
      image: photo.image_url,
      date: new Date(photo.date),
      weight: photo.weight,
      bodyFatPercentage: photo.body_fat_percentage,
      muscleMass: photo.muscle_mass,
      notes: photo.notes
    }))

    return { data: transformedPhotos, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch progress photos' }
  }
}

export async function getProgressPhotosByDateRange(startDate: Date, endDate: Date): Promise<{ data: ProgressPhoto[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: photos, error } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedPhotos: ProgressPhoto[] = photos.map(photo => ({
      id: photo.id,
      image: photo.image_url,
      date: new Date(photo.date),
      weight: photo.weight,
      bodyFatPercentage: photo.body_fat_percentage,
      muscleMass: photo.muscle_mass,
      notes: photo.notes
    }))

    return { data: transformedPhotos, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch progress photos by date range' }
  }
}

export async function getProgressStats(): Promise<{ data: any; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data: photos, error } = await supabase
      .from('progress_photos')
      .select('date, weight, body_fat_percentage, muscle_mass')
      .eq('user_id', userId)
      .not('weight', 'is', null)
      .order('date', { ascending: true })

    if (error) {
      return { data: null, error: error.message }
    }

    if (photos.length === 0) {
      return { data: null, error: 'No progress photos with weight data found' }
    }

    const firstPhoto = photos[0]
    const lastPhoto = photos[photos.length - 1]

    const stats = {
      totalPhotos: photos.length,
      dateRange: {
        start: new Date(firstPhoto.date),
        end: new Date(lastPhoto.date)
      },
      weightChange: lastPhoto.weight - firstPhoto.weight,
      bodyFatChange: lastPhoto.body_fat_percentage && firstPhoto.body_fat_percentage 
        ? lastPhoto.body_fat_percentage - firstPhoto.body_fat_percentage 
        : null,
      muscleMassChange: lastPhoto.muscle_mass && firstPhoto.muscle_mass 
        ? lastPhoto.muscle_mass - firstPhoto.muscle_mass 
        : null,
      currentStats: {
        weight: lastPhoto.weight,
        bodyFatPercentage: lastPhoto.body_fat_percentage,
        muscleMass: lastPhoto.muscle_mass
      },
      progressData: photos.map(photo => ({
        date: new Date(photo.date),
        weight: photo.weight,
        bodyFatPercentage: photo.body_fat_percentage,
        muscleMass: photo.muscle_mass
      }))
    }

    return { data: stats, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to calculate progress stats' }
  }
}

export async function getLatestProgressPhoto(): Promise<{ data: ProgressPhoto | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data: photo, error } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: null } // No photos found
      }
      return { data: null, error: error.message }
    }

    const transformedPhoto: ProgressPhoto = {
      id: photo.id,
      image: photo.image_url,
      date: new Date(photo.date),
      weight: photo.weight,
      bodyFatPercentage: photo.body_fat_percentage,
      muscleMass: photo.muscle_mass,
      notes: photo.notes
    }

    return { data: transformedPhoto, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to fetch latest progress photo' }
  }
}

export async function updateProgressPhotoMetrics(id: string, weight?: number, bodyFatPercentage?: number, muscleMass?: number): Promise<{ data: ProgressPhoto | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (weight !== undefined) updateData.weight = weight
    if (bodyFatPercentage !== undefined) updateData.body_fat_percentage = bodyFatPercentage
    if (muscleMass !== undefined) updateData.muscle_mass = muscleMass

    const { data, error } = await supabase
      .from('progress_photos')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedPhoto: ProgressPhoto = {
      id: data.id,
      image: data.image_url,
      date: new Date(data.date),
      weight: data.weight,
      bodyFatPercentage: data.body_fat_percentage,
      muscleMass: data.muscle_mass,
      notes: data.notes
    }

    return { data: transformedPhoto, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update progress photo metrics' }
  }
}
