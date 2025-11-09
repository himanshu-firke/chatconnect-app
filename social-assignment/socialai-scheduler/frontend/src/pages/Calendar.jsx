import React, { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { 
  PlusIcon, 
  CalendarDaysIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

const Calendar = () => {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [calendarView, setCalendarView] = useState('dayGridMonth')
  const [loading, setLoading] = useState(false)
  
  const calendarRef = useRef(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/posts')
      if (response.data.success) {
        const calendarEvents = response.data.posts.map(post => ({
          id: post._id,
          title: post.content.text.substring(0, 50) + '...',
          start: post.scheduling.scheduledFor,
          backgroundColor: getPlatformColor(post.platforms[0]?.name),
          borderColor: getPlatformColor(post.platforms[0]?.name),
          extendedProps: {
            post: post,
            platforms: post.platforms.map(p => p.name),
            status: post.status
          }
        }))
        setEvents(calendarEvents)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      // For demo purposes, add some sample events
      setEvents([
        {
          id: '1',
          title: 'AI trends in 2024 - Twitter Post',
          start: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          backgroundColor: '#1DA1F2',
          borderColor: '#1DA1F2',
          extendedProps: {
            platforms: ['twitter'],
            status: 'scheduled'
          }
        },
        {
          id: '2',
          title: 'Product launch announcement - LinkedIn',
          start: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          backgroundColor: '#0077B5',
          borderColor: '#0077B5',
          extendedProps: {
            platforms: ['linkedin'],
            status: 'scheduled'
          }
        },
        {
          id: '3',
          title: 'Behind the scenes - Instagram',
          start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          backgroundColor: '#E4405F',
          borderColor: '#E4405F',
          extendedProps: {
            platforms: ['instagram'],
            status: 'scheduled'
          }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getPlatformColor = (platform) => {
    const colors = {
      twitter: '#1DA1F2',
      linkedin: '#0077B5',
      instagram: '#E4405F',
      facebook: '#1877F2'
    }
    return colors[platform] || '#6366F1'
  }

  const handleDateClick = (arg) => {
    setSelectedDate(arg.date)
    setShowCreateModal(true)
  }

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event)
    setShowEventModal(true)
  }

  const handleEventDrop = async (dropInfo) => {
    try {
      const eventId = dropInfo.event.id
      const newDate = dropInfo.event.start
      
      // Update the event in the backend
      await axios.put(`/api/posts/${eventId}`, {
        scheduledFor: newDate
      })
      
      toast.success('Post rescheduled successfully!')
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error('Failed to reschedule post')
      dropInfo.revert() // Revert the change if API call fails
    }
  }

  const handleEventResize = async (resizeInfo) => {
    // Handle event resize if needed
    console.log('Event resized:', resizeInfo)
  }

  const deleteEvent = async (eventId) => {
    try {
      await axios.delete(`/api/posts/${eventId}`)
      setEvents(events.filter(event => event.id !== eventId))
      setShowEventModal(false)
      toast.success('Post deleted successfully!')
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  const EventModal = () => {
    if (!selectedEvent) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Post Details</h3>
            <button
              onClick={() => setShowEventModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">Content</h4>
              <p className="text-sm text-gray-600 mt-1">{selectedEvent.title}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Scheduled Time</h4>
              <p className="text-sm text-gray-600 mt-1">
                {selectedEvent.start?.toLocaleString()}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Platforms</h4>
              <div className="flex space-x-2 mt-1">
                {selectedEvent.extendedProps.platforms?.map(platform => (
                  <span
                    key={platform}
                    className="px-2 py-1 text-xs rounded-full text-white capitalize"
                    style={{ backgroundColor: getPlatformColor(platform) }}
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Status</h4>
              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                selectedEvent.extendedProps.status === 'scheduled' 
                  ? 'bg-blue-100 text-blue-800'
                  : selectedEvent.extendedProps.status === 'published'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {selectedEvent.extendedProps.status}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button className="flex-1 btn-secondary text-sm py-2">
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button 
              onClick={() => deleteEvent(selectedEvent.id)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center justify-center"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const CreatePostModal = () => {
    if (!showCreateModal) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Schedule New Post</h3>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="text-center py-8">
            <CalendarDaysIcon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Selected Date: {selectedDate?.toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Use the AI Content Creator to generate and schedule posts for this date.
            </p>
            <button
              onClick={() => {
                setShowCreateModal(false)
                // Navigate to AI Chat with pre-selected date
                window.location.href = '/ai-chat'
              }}
              className="btn-primary"
            >
              Create with AI
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Content Calendar
            </h1>
            <p className="text-gray-600">
              Manage your scheduled posts with drag-and-drop functionality.
            </p>
          </div>
          
          <div className="flex space-x-3">
            <select
              value={calendarView}
              onChange={(e) => {
                setCalendarView(e.target.value)
                const calendarApi = calendarRef.current.getApi()
                calendarApi.changeView(e.target.value)
              }}
              className="input-field"
            >
              <option value="dayGridMonth">Month</option>
              <option value="timeGridWeek">Week</option>
              <option value="timeGridDay">Day</option>
            </select>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              New Post
            </button>
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={calendarView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            editable={true}
            droppable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            height="auto"
            eventDisplay="block"
            eventTextColor="#ffffff"
            eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
            dayCellClassNames="hover:bg-gray-50 cursor-pointer"
            slotMinTime="06:00:00"
            slotMaxTime="24:00:00"
            allDaySlot={false}
            nowIndicator={true}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
              startTime: '09:00',
              endTime: '18:00'
            }}
          />
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{events.length}</div>
          <div className="text-sm text-gray-600">Scheduled Posts</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <ClockIcon className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {events.filter(e => new Date(e.start) < new Date()).length}
          </div>
          <div className="text-sm text-gray-600">Published Today</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <EyeIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {events.filter(e => new Date(e.start) > new Date()).length}
          </div>
          <div className="text-sm text-gray-600">Upcoming Posts</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-orange-600 font-bold">📊</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-sm text-gray-600">Platforms</div>
        </div>
      </div>

      {/* Modals */}
      {showEventModal && <EventModal />}
      {showCreateModal && <CreatePostModal />}
    </div>
  )
}

export default Calendar
