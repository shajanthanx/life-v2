import { supabase } from '../supabase'
import { Movie } from '@/types'
import { authService } from '../auth'

export async function createMovie(movieData: Omit<Movie, 'id'>): Promise<{ data: Movie | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('movies')
      .insert({
        user_id: userId,
        title: movieData.title,
        director: movieData.director,
        year: movieData.year,
        status: movieData.status,
        rating: movieData.rating,
        watched_at: movieData.watchedAt?.toISOString(),
        notes: movieData.notes
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedMovie: Movie = {
      id: data.id,
      title: data.title,
      director: data.director,
      year: data.year,
      status: data.status,
      rating: data.rating,
      watchedAt: data.watched_at ? new Date(data.watched_at) : undefined,
      notes: data.notes
    }

    return { data: transformedMovie, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create movie' }
  }
}

export async function updateMovie(id: string, updates: Partial<Movie>): Promise<{ data: Movie | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.director !== undefined) updateData.director = updates.director
    if (updates.year !== undefined) updateData.year = updates.year
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.rating !== undefined) updateData.rating = updates.rating
    if (updates.watchedAt !== undefined) updateData.watched_at = updates.watchedAt?.toISOString()
    if (updates.notes !== undefined) updateData.notes = updates.notes

    // Auto-set watched date when status changes to completed
    if (updates.status === 'completed' && !updates.watchedAt) {
      updateData.watched_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('movies')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedMovie: Movie = {
      id: data.id,
      title: data.title,
      director: data.director,
      year: data.year,
      status: data.status,
      rating: data.rating,
      watchedAt: data.watched_at ? new Date(data.watched_at) : undefined,
      notes: data.notes
    }

    return { data: transformedMovie, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update movie' }
  }
}

export async function deleteMovie(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete movie' }
  }
}

export async function getUserMovies(): Promise<{ data: Movie[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: movies, error } = await supabase
      .from('movies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedMovies: Movie[] = movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      director: movie.director,
      year: movie.year,
      status: movie.status,
      rating: movie.rating,
      watchedAt: movie.watched_at ? new Date(movie.watched_at) : undefined,
      notes: movie.notes
    }))

    return { data: transformedMovies, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch movies' }
  }
}

export async function markMovieAsWatched(id: string, rating?: number, notes?: string): Promise<{ data: Movie | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {
      status: 'completed',
      watched_at: new Date().toISOString()
    }

    if (rating !== undefined) updateData.rating = rating
    if (notes !== undefined) updateData.notes = notes

    const { data, error } = await supabase
      .from('movies')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedMovie: Movie = {
      id: data.id,
      title: data.title,
      director: data.director,
      year: data.year,
      status: data.status,
      rating: data.rating,
      watchedAt: data.watched_at ? new Date(data.watched_at) : undefined,
      notes: data.notes
    }

    return { data: transformedMovie, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to mark movie as watched' }
  }
}
