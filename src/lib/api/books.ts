import { supabase } from '../supabase'
import { Book } from '@/types'
import { authService } from '../auth'

export async function createBook(bookData: Omit<Book, 'id'>): Promise<{ data: Book | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('books')
      .insert({
        user_id: userId,
        title: bookData.title,
        author: bookData.author,
        status: bookData.status,
        current_page: bookData.currentPage,
        total_pages: bookData.totalPages,
        rating: bookData.rating,
        started_at: bookData.startedAt?.toISOString(),
        completed_at: bookData.completedAt?.toISOString(),
        notes: bookData.notes
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedBook: Book = {
      id: data.id,
      title: data.title,
      author: data.author,
      status: data.status,
      currentPage: data.current_page,
      totalPages: data.total_pages,
      rating: data.rating,
      startedAt: data.started_at ? new Date(data.started_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      notes: data.notes
    }

    return { data: transformedBook, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to create book' }
  }
}

export async function updateBook(id: string, updates: Partial<Book>): Promise<{ data: Book | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.author !== undefined) updateData.author = updates.author
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.currentPage !== undefined) updateData.current_page = updates.currentPage
    if (updates.totalPages !== undefined) updateData.total_pages = updates.totalPages
    if (updates.rating !== undefined) updateData.rating = updates.rating
    if (updates.startedAt !== undefined) updateData.started_at = updates.startedAt?.toISOString()
    if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt?.toISOString()
    if (updates.notes !== undefined) updateData.notes = updates.notes

    // Auto-set completion date when status changes to completed
    if (updates.status === 'completed' && !updates.completedAt) {
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('books')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedBook: Book = {
      id: data.id,
      title: data.title,
      author: data.author,
      status: data.status,
      currentPage: data.current_page,
      totalPages: data.total_pages,
      rating: data.rating,
      startedAt: data.started_at ? new Date(data.started_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      notes: data.notes
    }

    return { data: transformedBook, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update book' }
  }
}

export async function deleteBook(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }

  } catch (error) {
    return { success: false, error: 'Failed to delete book' }
  }
}

export async function getUserBooks(): Promise<{ data: Book[]; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    const transformedBooks: Book[] = books.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      status: book.status,
      currentPage: book.current_page,
      totalPages: book.total_pages,
      rating: book.rating,
      startedAt: book.started_at ? new Date(book.started_at) : undefined,
      completedAt: book.completed_at ? new Date(book.completed_at) : undefined,
      notes: book.notes
    }))

    return { data: transformedBooks, error: null }

  } catch (error) {
    return { data: [], error: 'Failed to fetch books' }
  }
}

export async function updateBookProgress(id: string, currentPage: number): Promise<{ data: Book | null; error: string | null }> {
  try {
    const userId = authService.getUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    // Get current book to check total pages
    const { data: currentBook, error: fetchError } = await supabase
      .from('books')
      .select('total_pages, status')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      return { data: null, error: fetchError.message }
    }

    // Auto-complete if reached total pages
    const updateData: any = { current_page: currentPage }
    if (currentBook.total_pages && currentPage >= currentBook.total_pages && currentBook.status !== 'completed') {
      updateData.status = 'completed'
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('books')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    const transformedBook: Book = {
      id: data.id,
      title: data.title,
      author: data.author,
      status: data.status,
      currentPage: data.current_page,
      totalPages: data.total_pages,
      rating: data.rating,
      startedAt: data.started_at ? new Date(data.started_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      notes: data.notes
    }

    return { data: transformedBook, error: null }

  } catch (error) {
    return { data: null, error: 'Failed to update book progress' }
  }
}
