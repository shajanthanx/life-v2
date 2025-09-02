// Complete API Test Suite for Final Life Manager v2 Implementation
// This script tests all 6 newly implemented APIs

const BASE_URL = 'http://localhost:3000'
const TEST_USER_ID = 'test-user-123' // Replace with actual user ID

// Test data for each API
const testData = {
  gift: {
    recipientName: 'Sarah Johnson',
    relationship: 'Sister',
    occasion: 'Birthday',
    giftIdea: 'Kindle Paperwhite',
    budget: 150,
    eventDate: new Date('2024-03-15'),
    status: 'planned',
    notes: 'She loves reading mystery novels'
  },
  event: {
    title: 'Team Building Workshop',
    description: 'Annual company team building event',
    eventType: 'work',
    date: new Date('2024-02-20'),
    budget: 500,
    attendees: ['John Doe', 'Jane Smith', 'Mike Wilson'],
    status: 'planned'
  },
  memory: {
    title: 'Summer Vacation in Italy',
    description: 'Amazing trip to Rome and Florence with family',
    date: new Date('2023-07-10'),
    location: 'Rome, Italy',
    tags: ['vacation', 'family', 'italy'],
    isSpecial: true,
    images: ['https://example.com/rome1.jpg', 'https://example.com/rome2.jpg']
  },
  progressPhoto: {
    image: 'https://example.com/progress/photo1.jpg',
    date: new Date('2024-01-15'),
    weight: 75.5,
    bodyFatPercentage: 18.2,
    muscleMass: 65.3,
    notes: 'Good progress after 3 months of training'
  },
  secret: {
    title: 'Gmail Account',
    type: 'login',
    website: 'https://gmail.com',
    username: 'john.doe@gmail.com',
    password: 'SecurePassword123!',
    notes: 'Primary email account',
    customFields: {
      'Recovery Email': 'backup@gmail.com',
      'Security Question': 'What is your pet name?'
    }
  },
  freelanceProject: {
    title: 'E-commerce Website Development',
    client: 'Tech Solutions Inc',
    description: 'Build a modern e-commerce platform with React and Node.js',
    status: 'active',
    hourlyRate: 85,
    estimatedHours: 120,
    deadline: new Date('2024-04-30'),
    budget: 10200
  },
  projectTask: {
    title: 'Design Database Schema',
    description: 'Create ERD and implement database tables',
    status: 'todo',
    priority: 'high',
    estimatedHours: 8,
    deadline: new Date('2024-02-25')
  },
  timeEntry: {
    date: new Date('2024-01-20'),
    hours: 4.5,
    description: 'Implemented user authentication system',
    billable: true
  }
}

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_USER_ID}` // Mock authorization
      }
    }
    
    if (data) {
      options.body = JSON.stringify(data)
    }
    
    const response = await fetch(`${BASE_URL}/api${endpoint}`, options)
    const result = await response.json()
    
    return {
      status: response.status,
      success: response.ok,
      data: result,
      headers: response.headers
    }
  } catch (error) {
    return {
      status: 0,
      success: false,
      error: error.message
    }
  }
}

// Test functions for each API
async function testGiftsAPI() {
  console.log('\n🎁 TESTING GIFTS API')
  console.log('=' .repeat(50))
  
  // Test CREATE gift
  console.log('1. Testing CREATE gift...')
  const createResult = await apiRequest('/gifts', 'POST', testData.gift)
  console.log('Create Result:', createResult.success ? '✅ SUCCESS' : '❌ FAILED')
  if (createResult.data) console.log('Created Gift ID:', createResult.data.id)
  
  const giftId = createResult.data?.id
  
  // Test READ gifts
  console.log('2. Testing READ gifts...')
  const readResult = await apiRequest('/gifts')
  console.log('Read Result:', readResult.success ? '✅ SUCCESS' : '❌ FAILED')
  console.log('Gifts Count:', readResult.data?.length || 0)
  
  if (giftId) {
    // Test UPDATE gift
    console.log('3. Testing UPDATE gift...')
    const updateResult = await apiRequest(`/gifts/${giftId}`, 'PUT', {
      spent: 140,
      status: 'purchased'
    })
    console.log('Update Result:', updateResult.success ? '✅ SUCCESS' : '❌ FAILED')
    
    // Test mark gift as purchased
    console.log('4. Testing mark gift as purchased...')
    const markPurchasedResult = await apiRequest(`/gifts/${giftId}/purchase`, 'PUT', {
      spent: 145
    })
    console.log('Mark Purchased Result:', markPurchasedResult.success ? '✅ SUCCESS' : '❌ FAILED')
    
    // Test DELETE gift (skip to preserve test data)
    console.log('5. Testing DELETE gift... (SKIPPED - preserving test data)')
  }
}

async function testEventsAPI() {
  console.log('\n📅 TESTING EVENTS API')
  console.log('=' .repeat(50))
  
  // Test CREATE event
  console.log('1. Testing CREATE event...')
  const createResult = await apiRequest('/events', 'POST', testData.event)
  console.log('Create Result:', createResult.success ? '✅ SUCCESS' : '❌ FAILED')
  
  const eventId = createResult.data?.id
  
  // Test READ events
  console.log('2. Testing READ events...')
  const readResult = await apiRequest('/events')
  console.log('Read Result:', readResult.success ? '✅ SUCCESS' : '❌ FAILED')
  console.log('Events Count:', readResult.data?.length || 0)
  
  if (eventId) {
    // Test UPDATE event
    console.log('3. Testing UPDATE event...')
    const updateResult = await apiRequest(`/events/${eventId}`, 'PUT', {
      spent: 350,
      status: 'in_progress'
    })
    console.log('Update Result:', updateResult.success ? '✅ SUCCESS' : '❌ FAILED')
  }
}

async function testMemoriesAPI() {
  console.log('\n📸 TESTING MEMORIES API')
  console.log('=' .repeat(50))
  
  // Test CREATE memory
  console.log('1. Testing CREATE memory...')
  const createResult = await apiRequest('/memories', 'POST', testData.memory)
  console.log('Create Result:', createResult.success ? '✅ SUCCESS' : '❌ FAILED')
  
  const memoryId = createResult.data?.id
  
  // Test READ memories
  console.log('2. Testing READ memories...')
  const readResult = await apiRequest('/memories')
  console.log('Read Result:', readResult.success ? '✅ SUCCESS' : '❌ FAILED')
  console.log('Memories Count:', readResult.data?.length || 0)
  
  // Test READ special memories
  console.log('3. Testing READ special memories...')
  const specialResult = await apiRequest('/memories/special')
  console.log('Special Memories Result:', specialResult.success ? '✅ SUCCESS' : '❌ FAILED')
  
  // Test READ memories by tag
  console.log('4. Testing READ memories by tag...')
  const tagResult = await apiRequest('/memories/tag/vacation')
  console.log('Tag Search Result:', tagResult.success ? '✅ SUCCESS' : '❌ FAILED')
  
  if (memoryId) {
    // Test ADD image to memory
    console.log('5. Testing ADD image to memory...')
    const addImageResult = await apiRequest(`/memories/${memoryId}/images`, 'POST', {
      imageUrl: 'https://example.com/rome3.jpg'
    })
    console.log('Add Image Result:', addImageResult.success ? '✅ SUCCESS' : '❌ FAILED')
  }
}

async function testProgressPhotosAPI() {
  console.log('\n💪 TESTING PROGRESS PHOTOS API')
  console.log('=' .repeat(50))
  
  // Test CREATE progress photo
  console.log('1. Testing CREATE progress photo...')
  const createResult = await apiRequest('/progress-photos', 'POST', testData.progressPhoto)
  console.log('Create Result:', createResult.success ? '✅ SUCCESS' : '❌ FAILED')
  
  const photoId = createResult.data?.id
  
  // Test READ progress photos
  console.log('2. Testing READ progress photos...')
  const readResult = await apiRequest('/progress-photos')
  console.log('Read Result:', readResult.success ? '✅ SUCCESS' : '❌ FAILED')
  console.log('Photos Count:', readResult.data?.length || 0)
  
  // Test GET progress stats
  console.log('3. Testing GET progress stats...')
  const statsResult = await apiRequest('/progress-photos/stats')
  console.log('Stats Result:', statsResult.success ? '✅ SUCCESS' : '❌ FAILED')
  
  // Test GET latest progress photo
  console.log('4. Testing GET latest progress photo...')
  const latestResult = await apiRequest('/progress-photos/latest')
  console.log('Latest Photo Result:', latestResult.success ? '✅ SUCCESS' : '❌ FAILED')
  
  if (photoId) {
    // Test UPDATE progress photo metrics
    console.log('5. Testing UPDATE progress photo metrics...')
    const updateMetricsResult = await apiRequest(`/progress-photos/${photoId}/metrics`, 'PUT', {
      weight: 74.8,
      bodyFatPercentage: 17.9
    })
    console.log('Update Metrics Result:', updateMetricsResult.success ? '✅ SUCCESS' : '❌ FAILED')
  }
}

async function testSecretsAPI() {
  console.log('\n🔐 TESTING SECRETS API')
  console.log('=' .repeat(50))
  
  // Test CREATE secret
  console.log('1. Testing CREATE secret...')
  const createResult = await apiRequest('/secrets', 'POST', testData.secret)
  console.log('Create Result:', createResult.success ? '✅ SUCCESS' : '❌ FAILED')
  
  const secretId = createResult.data?.id
  
  // Test READ secrets
  console.log('2. Testing READ secrets...')
  const readResult = await apiRequest('/secrets')
  console.log('Read Result:', readResult.success ? '✅ SUCCESS' : '❌ FAILED')
  console.log('Secrets Count:', readResult.data?.length || 0)
  
  // Test READ secrets by type
  console.log('3. Testing READ secrets by type...')
  const typeResult = await apiRequest('/secrets/type/login')
  console.log('Type Filter Result:', typeResult.success ? '✅ SUCCESS' : '❌ FAILED')
  
  // Test SEARCH secrets
  console.log('4. Testing SEARCH secrets...')
  const searchResult = await apiRequest('/secrets/search?q=gmail')
  console.log('Search Result:', searchResult.success ? '✅ SUCCESS' : '❌ FAILED')
  
  // Test GET secrets stats
  console.log('5. Testing GET secrets stats...')
  const statsResult = await apiRequest('/secrets/stats')
  console.log('Stats Result:', statsResult.success ? '✅ SUCCESS' : '❌ FAILED')
  
  // Test GENERATE password
  console.log('6. Testing GENERATE password...')
  const generateResult = await apiRequest('/secrets/generate-password')
  console.log('Generate Password Result:', generateResult.success ? '✅ SUCCESS' : '❌ FAILED')
  
  if (secretId) {
    // Test UPDATE last accessed
    console.log('7. Testing UPDATE last accessed...')
    const accessResult = await apiRequest(`/secrets/${secretId}/access`, 'PUT')
    console.log('Update Access Result:', accessResult.success ? '✅ SUCCESS' : '❌ FAILED')
  }
}

async function testFreelancingAPI() {
  console.log('\n💼 TESTING FREELANCING API')
  console.log('=' .repeat(50))
  
  // Test CREATE freelance project
  console.log('1. Testing CREATE freelance project...')
  const createProjectResult = await apiRequest('/freelance/projects', 'POST', testData.freelanceProject)
  console.log('Create Project Result:', createProjectResult.success ? '✅ SUCCESS' : '❌ FAILED')
  
  const projectId = createProjectResult.data?.id
  
  // Test READ freelance projects
  console.log('2. Testing READ freelance projects...')
  const readProjectsResult = await apiRequest('/freelance/projects')
  console.log('Read Projects Result:', readProjectsResult.success ? '✅ SUCCESS' : '❌ FAILED')
  console.log('Projects Count:', readProjectsResult.data?.length || 0)
  
  if (projectId) {
    // Test CREATE project task
    console.log('3. Testing CREATE project task...')
    const createTaskResult = await apiRequest('/freelance/tasks', 'POST', {
      projectId,
      ...testData.projectTask
    })
    console.log('Create Task Result:', createTaskResult.success ? '✅ SUCCESS' : '❌ FAILED')
    
    const taskId = createTaskResult.data?.id
    
    // Test CREATE time entry
    console.log('4. Testing CREATE time entry...')
    const createTimeResult = await apiRequest('/freelance/time-entries', 'POST', {
      projectId,
      ...testData.timeEntry
    })
    console.log('Create Time Entry Result:', createTimeResult.success ? '✅ SUCCESS' : '❌ FAILED')
    
    // Test READ time entries
    console.log('5. Testing READ time entries...')
    const readTimeResult = await apiRequest('/freelance/time-entries')
    console.log('Read Time Entries Result:', readTimeResult.success ? '✅ SUCCESS' : '❌ FAILED')
    
    // Test READ time entries by project
    console.log('6. Testing READ time entries by project...')
    const readProjectTimeResult = await apiRequest(`/freelance/projects/${projectId}/time-entries`)
    console.log('Read Project Time Entries Result:', readProjectTimeResult.success ? '✅ SUCCESS' : '❌ FAILED')
    
    // Test GET project stats
    console.log('7. Testing GET project stats...')
    const statsResult = await apiRequest(`/freelance/projects/${projectId}/stats`)
    console.log('Project Stats Result:', statsResult.success ? '✅ SUCCESS' : '❌ FAILED')
    
    if (taskId) {
      // Test UPDATE project task
      console.log('8. Testing UPDATE project task...')
      const updateTaskResult = await apiRequest(`/freelance/tasks/${taskId}`, 'PUT', {
        status: 'in_progress',
        actualHours: 3
      })
      console.log('Update Task Result:', updateTaskResult.success ? '✅ SUCCESS' : '❌ FAILED')
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 STARTING COMPLETE API TEST SUITE')
  console.log('=' .repeat(60))
  console.log(`Testing against: ${BASE_URL}`)
  console.log(`Test User ID: ${TEST_USER_ID}`)
  
  const startTime = Date.now()
  
  try {
    await testGiftsAPI()
    await testEventsAPI()
    await testMemoriesAPI()
    await testProgressPhotosAPI()
    await testSecretsAPI()
    await testFreelancingAPI()
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    
    console.log('\n🎉 ALL TESTS COMPLETED!')
    console.log('=' .repeat(60))
    console.log(`Total Duration: ${duration.toFixed(2)} seconds`)
    console.log('✅ If you see mostly SUCCESS messages above, all APIs are working!')
    console.log('\n📋 NEXT STEPS:')
    console.log('1. Run: npm run dev (if not already running)')
    console.log('2. Execute: node test-final-apis.js')
    console.log('3. Check your Supabase dashboard for test data')
    console.log('4. Run the SQL migration: supabase-final-tables.sql')
    
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message)
    console.log('Make sure your development server is running on port 3000')
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests()
}

module.exports = {
  runAllTests,
  testGiftsAPI,
  testEventsAPI,
  testMemoriesAPI,
  testProgressPhotosAPI,
  testSecretsAPI,
  testFreelancingAPI
}
