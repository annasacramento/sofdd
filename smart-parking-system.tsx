"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
// Add the Phone icon import
import {
  MapPin,
  Clock,
  Calendar,
  User,
  LogOut,
  AlertCircle,
  Car,
  Bike,
  Truck,
  Check,
  X,
  Edit,
  Trash,
  Users,
  UserCheck,
  UserX,
  ParkingCircle,
  Phone,
  Navigation,
  Bell,
  Star,
  CreditCard,
} from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Types
type UserRole = "owner" | "driver" | "admin" | null

type UserType = {
  id: string
  email: string
  password: string
  role: UserRole
  createdAt: Date
  lastLogin: Date | null
  isActive: boolean
  blocked: boolean
}

type LoginEvent = {
  id: string
  userId: string
  userEmail: string
  timestamp: Date
  success: boolean
  ipAddress: string
}

type ParkingLot = {
  id: string
  ownerId: string
  name: string
  address: string
  spots: number
  availableSpots: number
  price: number
  description: string
  vehicleTypes: string[]
  photos: string[]
  contactNumber: string
  createdAt: Date
  coordinates?: {
    lat: number
    lng: number
  }
  averageRating?: number // Add average rating field
}

// Update the Booking type to include rating and comment
type Booking = {
  id: string
  parkingLotId: string
  driverId: string
  driverEmail: string
  startTime: Date
  endTime: Date
  status: "pending" | "confirmed" | "completed" | "cancelled"
  createdAt: Date
  cancellationReason?: string
  rating?: number
  comment?: string
}

type Notification = {
  id: string
  userId: string
  message: string
  timestamp: Date
  read: boolean
  type: "confirmation" | "cancellation" | "system" | "rating"
  bookingId?: string
}

// Vehicle types
const vehicleTypes = [
  { id: "car", label: "Car", icon: Car },
  { id: "motorcycle", label: "Motorcycle", icon: Bike },
  { id: "suv", label: "SUV", icon: Car },
  { id: "truck", label: "Truck", icon: Truck },
  { id: "van", label: "Van", icon: Car },
]

// Mock user database
const mockUsers: UserType[] = [
  {
    id: "1",
    email: "driver@example.com",
    password: "password123",
    role: "driver",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isActive: true,
    blocked: false,
  },
  {
    id: "2",
    email: "owner@example.com",
    password: "password123",
    role: "owner",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isActive: true,
    blocked: false,
  },
  {
    id: "3",
    email: "admin@smartpark.com",
    password: "admin123",
    role: "admin",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isActive: true,
    blocked: false,
  },
]

// Mock login history
const mockLoginHistory: LoginEvent[] = [
  {
    id: "1",
    userId: "1",
    userEmail: "driver@example.com",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    success: true,
    ipAddress: "192.168.1.1",
  },
  {
    id: "2",
    userId: "2",
    userEmail: "owner@example.com",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    success: true,
    ipAddress: "192.168.1.2",
  },
  {
    id: "3",
    userId: "3",
    userEmail: "admin@smartpark.com",
    password: "admin123",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    success: true,
    ipAddress: "192.168.1.3",
  },
  {
    id: "4",
    userId: "1",
    userEmail: "driver@example.com",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    success: true,
    ipAddress: "192.168.1.4",
  },
  {
    id: "5",
    userId: "unknown",
    userEmail: "hacker@evil.com",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    success: false,
    ipAddress: "10.0.0.1",
  },
]

// Replace the initialParkingLots array with this updated version:
const initialParkingLots: ParkingLot[] = []

// Mock bookings
const initialBookings: Booking[] = [
  {
    id: "1",
    parkingLotId: "1",
    driverId: "driver@example.com",
    driverEmail: "driver@example.com",
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    status: "confirmed",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
]

// Initial notifications
const initialNotifications: Notification[] = []

// Helper function to get data from localStorage
const getStoredData = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue

  const storedData = localStorage.getItem(key)
  if (!storedData) return defaultValue

  try {
    // Parse dates properly from JSON
    const parsed = JSON.parse(storedData, (key, value) => {
      if (
        key === "startTime" ||
        key === "endTime" ||
        key === "createdAt" ||
        key === "lastLogin" ||
        key === "timestamp"
      ) {
        return new Date(value)
      }
      return value
    })
    return parsed as T
  } catch (error) {
    console.error(`Error parsing stored ${key}:`, error)
    return defaultValue
  }
}

// Main component
export default function SmartParkingSystem() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [activeAuthTab, setActiveAuthTab] = useState("login")
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [error, setError] = useState<string>("")

  // App state - load from localStorage if available
  const [users, setUsers] = useState<UserType[]>(() => getStoredData("smartpark_users", mockUsers))
  const [loginHistory, setLoginHistory] = useState<LoginEvent[]>(() =>
    getStoredData("smartpark_login_history", mockLoginHistory),
  )
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>(() =>
    getStoredData("smartpark_parking_lots", initialParkingLots),
  )
  const [bookings, setBookings] = useState<Booking[]>(() => getStoredData("smartpark_bookings", initialBookings))
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    getStoredData("smartpark_notifications", initialNotifications),
  )
  const [activeOwnerTab, setActiveOwnerTab] = useState("register")
  const [showNotifications, setShowNotifications] = useState(false)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [bookingToRate, setBookingToRate] = useState<string | null>(null)

  // Location permission state
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Save data to localStorage when it changes
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem("smartpark_users", JSON.stringify(users))
    }
  }, [users])

  useEffect(() => {
    if (loginHistory.length > 0) {
      localStorage.setItem("smartpark_login_history", JSON.stringify(loginHistory))
    }
  }, [loginHistory])

  useEffect(() => {
    if (parkingLots.length > 0) {
      localStorage.setItem("smartpark_parking_lots", JSON.stringify(parkingLots))
    }
  }, [parkingLots])

  useEffect(() => {
    if (bookings.length > 0) {
      localStorage.setItem("smartpark_bookings", JSON.stringify(bookings))
    }
  }, [bookings])

  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem("smartpark_notifications", JSON.stringify(notifications))
    }
  }, [notifications])

  // Request location permission
  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Permission granted
          setLocationPermissionGranted(true)
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          console.log("Location permission granted:", position.coords)
        },
        (error) => {
          // Permission denied
          setLocationPermissionGranted(false)
          console.error("Location permission denied:", error)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        },
      )
    } else {
      // Geolocation not supported
      setLocationPermissionGranted(false)
      console.error("Geolocation is not supported by this browser.")
    }
  }

  // Handle login/signup
  const handleAuth = (user: UserType) => {
    // Check if user is blocked
    if (user.blocked) {
      setError("Your account has been blocked. Please contact the administrator.")
      return
    }

    setIsLoggedIn(true)
    setUserRole(user.role)
    setCurrentUser(user)

    // Record login event
    const loginEvent: LoginEvent = {
      id: Date.now().toString(),
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      success: true,
      ipAddress: "127.0.0.1", // In a real app, this would be the actual IP
    }
    setLoginHistory((prev) => [...prev, loginEvent])

    // Update user's last login time
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, lastLogin: new Date(), isActive: true } : u)))

    // Set default tab based on role and existing parking lots
    if (user.role === "owner") {
      const hasLots = parkingLots.some((lot) => lot.ownerId === user.email)
      setActiveOwnerTab(hasLots ? "manage" : "register")
    }

    // Request location permissions for drivers
    if (user.role === "driver") {
      requestLocationPermission()
    }
  }

  // Handle failed login attempt
  const handleFailedLogin = (email: string) => {
    const loginEvent: LoginEvent = {
      id: Date.now().toString(),
      userId: "unknown",
      userEmail: email,
      timestamp: new Date(),
      success: false,
      ipAddress: "127.0.0.1", // In a real app, this would be the actual IP
    }
    setLoginHistory((prev) => [...prev, loginEvent])
  }

  // Handle logout
  const handleLogout = () => {
    // Update user active status
    if (currentUser) {
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, isActive: false } : u)))
    }

    setIsLoggedIn(false)
    setUserRole(null)
    setCurrentUser(null)
    setLocationPermissionGranted(null) // Reset location permission on logout
    setUserLocation(null) // Reset user location on logout
  }

  // Add notification
  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    }
    setNotifications((prev) => [...prev, newNotification])
  }

  // Mark notification as read
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  // Get unread notifications count
  const getUnreadNotificationsCount = () => {
    if (!currentUser) return 0
    return notifications.filter((notification) => notification.userId === currentUser.email && !notification.read)
      .length
  }

  // Handle parking lot registration
  const handleRegisterParkingLot = (parkingLot: Omit<ParkingLot, "id" | "ownerId" | "createdAt">) => {
    // Only allow registration if the current user is an owner
    if (currentUser?.role !== "owner") {
      console.error("Only owners can register parking lots")
      return null
    }

    const newParkingLot: ParkingLot = {
      ...parkingLot,
      id: Date.now().toString(),
      ownerId: currentUser.email,
      availableSpots: parkingLot.spots,
      createdAt: new Date(),
      averageRating: 0,
    }

    // Add the new parking lot to the state
    setParkingLots((prev) => [...prev, newParkingLot])
    setActiveOwnerTab("manage")

    // Log for debugging
    console.log("New parking lot registered:", newParkingLot)

    return newParkingLot
  }

  // Handle parking lot update
  const handleUpdateParkingLot = (updatedLot: ParkingLot) => {
    setParkingLots((prev) => prev.map((lot) => (lot.id === updatedLot.id ? updatedLot : lot)))
  }

  // Handle parking lot deletion
  const handleDeleteParkingLot = (id: string) => {
    setParkingLots((prev) => prev.filter((lot) => lot.id !== id))
    // Also delete associated bookings
    setBookings((prev) => prev.filter((booking) => booking.parkingLotId !== id))
  }

  // Handle booking creation
  const handleCreateBooking = (booking: Omit<Booking, "id" | "driverId" | "driverEmail" | "createdAt" | "status">) => {
    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
      driverId: currentUser?.email || "",
      driverEmail: currentUser?.email || "",
      status: "pending",
      createdAt: new Date(),
    }

    setBookings((prev) => [...prev, newBooking])

    // Update available spots
    setParkingLots((prev) =>
      prev.map((lot) =>
        lot.id === booking.parkingLotId ? { ...lot, availableSpots: Math.max(0, lot.availableSpots - 1) } : lot,
      ),
    )

    return newBooking
  }

  // Handle booking status update
  const handleUpdateBookingStatus = (id: string, status: Booking["status"], cancellationReason?: string) => {
    const booking = bookings.find((b) => b.id === id)
    if (!booking) return

    // Find the parking lot and owner
    const parkingLot = parkingLots.find((lot) => lot.id === booking.parkingLotId)
    if (!parkingLot) return

    // Update booking status
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status, ...(cancellationReason ? { cancellationReason } : {}) } : b)),
    )

    // If cancelled, increase available spots
    if (status === "cancelled") {
      setParkingLots((prev) =>
        prev.map((lot) => (lot.id === booking.parkingLotId ? { ...lot, availableSpots: lot.availableSpots + 1 } : lot)),
      )

      // Send cancellation notification to driver
      addNotification({
        userId: booking.driverEmail,
        message: `Your booking at ${parkingLot.name} has been cancelled. Reason: ${cancellationReason || "No reason provided"}`,
        type: "cancellation",
        bookingId: booking.id,
      })
    }

    // If confirmed, send confirmation notification to driver
    if (status === "confirmed") {
      addNotification({
        userId: booking.driverEmail,
        message: `Your booking at ${parkingLot.name} has been confirmed. Start time: ${booking.startTime.toLocaleString()}`,
        type: "confirmation",
        bookingId: booking.id,
      })
    }

    // If completed, prompt driver to rate the parking lot
    if (status === "completed" && currentUser?.role === "owner") {
      // Send notification to driver to rate the parking lot
      addNotification({
        userId: booking.driverEmail,
        message: `Your booking at ${parkingLot.name} has been completed. Please rate your experience.`,
        type: "rating",
        bookingId: booking.id,
      })
    }
  }

  // Handle rating submission
  const handleSubmitRating = (bookingId: string, rating: number, comment: string) => {
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking) return

    // Find the parking lot
    const parkingLot = parkingLots.find((lot) => lot.id === booking.parkingLotId)
    if (!parkingLot) return

    // Update booking with rating and comment
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, rating, comment } : b)))

    // Calculate new average rating for the parking lot
    const lotBookings = bookings.filter((b) => b.parkingLotId === booking.parkingLotId && b.rating !== undefined)

    const totalRatings = lotBookings.length + 1 // +1 for the current rating
    const sumRatings = lotBookings.reduce((sum, b) => sum + (b.rating || 0), 0) + rating
    const newAverageRating = sumRatings / totalRatings

    // Update parking lot with new average rating
    setParkingLots((prev) =>
      prev.map((lot) => (lot.id === booking.parkingLotId ? { ...lot, averageRating: newAverageRating } : lot)),
    )

    // Send notification to owner about the rating
    addNotification({
      userId: parkingLot.ownerId,
      message: `${booking.driverEmail} rated their experience at ${parkingLot.name} with ${rating} stars.`,
      type: "rating",
      bookingId: booking.id,
    })

    // Close the rating dialog
    setShowRatingDialog(false)
    setBookingToRate(null)
  }

  // Admin functions
  const handleBlockUser = (userId: string, blocked: boolean) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, blocked } : user)))
  }

  // Function to check if a user has been inactive for 3 months
  const isInactiveForThreeMonths = (user: UserType): boolean => {
    if (!user.lastLogin) return false

    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    return user.lastLogin < threeMonthsAgo
  }

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId))

    // Also delete associated data
    if (userRole === "owner") {
      setParkingLots((prev) => prev.filter((lot) => lot.ownerId !== userId))
    }
    if (userRole === "driver") {
      setBookings((prev) => prev.filter((booking) => booking.driverId !== userId))
    }
  }

  // Get driver's bookings
  const getDriverBookings = () => {
    if (!currentUser) return []
    return bookings.filter((booking) => booking.driverEmail === currentUser.email)
  }

  // Check if a booking needs rating
  const needsRating = (booking: Booking): boolean => {
    return booking.status === "completed" && booking.rating === undefined
  }

  // Render based on auth state
  if (!isLoggedIn) {
    return (
      <AuthPage
        onAuth={handleAuth}
        onFailedLogin={handleFailedLogin}
        activeTab={activeAuthTab}
        setActiveTab={setActiveAuthTab}
        users={users}
        setUsers={setUsers}
        setError={setError}
      />
    )
  }

  // Get user notifications
  const userNotifications = currentUser
    ? notifications.filter((notification) => notification.userId === currentUser.email)
    : []

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-blue-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-red-500" />
            <span className="font-bold text-xl">SmartPark</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                {getUnreadNotificationsCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getUnreadNotificationsCount()}
                  </span>
                )}
              </Button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50">
                  <div className="p-2 border-b flex justify-between items-center">
                    <h3 className="font-medium">Notifications</h3>
                    {userNotifications.some((n) => !n.read) && (
                      <Button variant="ghost" size="sm" onClick={markAllNotificationsAsRead} className="text-xs h-7">
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {userNotifications.length > 0 ? (
                      userNotifications
                        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                        .map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-blue-50" : ""}`}
                            onClick={() => {
                              markNotificationAsRead(notification.id)
                              // If it's a rating notification, open the rating dialog
                              if (notification.type === "rating" && notification.bookingId && userRole === "driver") {
                                const booking = bookings.find((b) => b.id === notification.bookingId)
                                if (booking && needsRating(booking)) {
                                  setBookingToRate(notification.bookingId)
                                  setShowRatingDialog(true)
                                }
                              }
                            }}
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className={`mt-1 rounded-full p-1 ${
                                  notification.type === "confirmation"
                                    ? "bg-green-100"
                                    : notification.type === "cancellation"
                                      ? "bg-red-100"
                                      : notification.type === "rating"
                                        ? "bg-yellow-100"
                                        : "bg-blue-100"
                                }`}
                              >
                                {notification.type === "confirmation" ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : notification.type === "cancellation" ? (
                                  <X className="h-3 w-3 text-red-600" />
                                ) : notification.type === "rating" ? (
                                  <Star className="h-3 w-3 text-yellow-600" />
                                ) : (
                                  <Bell className="h-3 w-3 text-blue-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.timestamp.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">No notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{currentUser?.email}</span>
              <Badge variant="outline" className="capitalize">
                {userRole}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Location permission alert for drivers */}
      {userRole === "driver" && locationPermissionGranted === false && (
        <div className="container mx-auto px-4 py-2">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Location access is required to use the driver features. Please enable location access in your browser
              settings to navigate to parking lots.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main content based on role */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {userRole === "admin" ? (
            <AdminDashboard
              users={users}
              loginHistory={loginHistory}
              parkingLots={parkingLots}
              bookings={bookings}
              onBlockUser={handleBlockUser}
              onDeleteUser={handleDeleteUser}
              isInactiveForThreeMonths={isInactiveForThreeMonths}
            />
          ) : userRole === "owner" ? (
            <OwnerDashboard
              activeTab={activeOwnerTab}
              setActiveTab={setActiveOwnerTab}
              parkingLots={parkingLots.filter((lot) => lot.ownerId === currentUser?.email)}
              bookings={bookings}
              onRegister={handleRegisterParkingLot}
              onUpdate={handleUpdateParkingLot}
              onDelete={handleDeleteParkingLot}
              onUpdateBookingStatus={handleUpdateBookingStatus}
            />
          ) : (
            <DriverDashboard
              parkingLots={parkingLots}
              bookings={getDriverBookings()}
              onBooking={handleCreateBooking}
              locationPermissionGranted={locationPermissionGranted}
              userLocation={userLocation}
              onSubmitRating={handleSubmitRating}
              needsRating={needsRating}
              showRatingDialog={showRatingDialog}
              setShowRatingDialog={setShowRatingDialog}
              bookingToRate={bookingToRate}
              setBookingToRate={setBookingToRate}
            />
          )}
        </div>
      </main>

      {/* Rating Dialog */}
      {showRatingDialog && bookingToRate && (
        <RatingDialog
          bookingId={bookingToRate}
          onSubmit={handleSubmitRating}
          onClose={() => {
            setShowRatingDialog(false)
            setBookingToRate(null)
          }}
          parkingLots={parkingLots}
          bookings={bookings}
        />
      )}
    </div>
  )
}

// Authentication page component
function AuthPage({
  onAuth,
  onFailedLogin,
  activeTab,
  setActiveTab,
  users,
  setUsers,
  setError: setParentError,
}: {
  onAuth: (user: UserType) => void
  onFailedLogin: (email: string) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  users: UserType[]
  setUsers: React.Dispatch<React.SetStateAction<UserType[]>>
  setError: React.Dispatch<React.SetStateAction<string>>
}) {
  // Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("driver")
  const [error, setError] = useState("") // Add local error state

  // 4. Modify the AuthPage component's handleLogin function to check for admin credentials
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setParentError("") // Clear parent error state too

    // Check for admin credentials
    if (email === "admin" && password === "tangerine") {
      const adminUser: UserType = {
        id: "admin",
        email: "admin",
        password: "tangerine",
        role: "admin",
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true,
        blocked: false,
      }
      onAuth(adminUser)
      return
    }

    // Find user in database
    const user = users.find((u) => u.email === email)

    if (!user) {
      setError("User not found. Please check your email or sign up.")
      onFailedLogin(email)
      return
    }

    if (user.password !== password) {
      setError("Incorrect password. Please try again.")
      onFailedLogin(email)
      return
    }

    // Check if user is blocked
    if (user.blocked) {
      setError("Your account has been blocked. Please contact the administrator.")
      onFailedLogin(email)
      return
    }

    onAuth(user)
  }

  // Update the handleSignup function
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setParentError("") // Clear parent error state too

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email)

    if (existingUser) {
      setError("Email already in use. Please login instead.")
      return
    }

    // Create new user
    const newUser: UserType = {
      id: Date.now().toString(),
      email,
      password,
      role,
      createdAt: new Date(),
      lastLogin: null,
      isActive: true,
      blocked: false,
    }

    // Add to users array
    setUsers((prev) => [...prev, newUser])

    // Log in the new user
    onAuth(newUser)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://i.pinimg.com/736x/0b/92/1b/0b921bd66c6ff7aa20f12b98b1e98be0.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and tagline */}
        <div className="text-center mb-8 text-white">
          <div className="flex justify-center mb-4">
            <MapPin className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4">SmartPark</h1>
          <p className="text-xl font-medium mb-2">Because Parking Should Be Simple.</p>
          <p className="text-white/80">A smooth experience whether you're looking for a spot or offering one.</p>
        </div>

        <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={activeTab === "login" ? handleLogin : handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email {activeTab === "login" && "/ Username"}</Label>
                <Input
                  id="email"
                  type={activeTab === "login" ? "text" : "email"}
                  placeholder={activeTab === "login" ? "you@example.com or username" : "you@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {activeTab === "login" && (
                    <Button variant="link" className="p-0 h-auto text-xs">
                      Forgot password?
                    </Button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* 5. Modify the signup form to prevent admin role selection */}
              {activeTab === "signup" && (
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <RadioGroup
                    value={role || "driver"}
                    onValueChange={(value) => setRole(value as UserRole)}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="driver" id="driver" />
                      <Label htmlFor="driver" className="cursor-pointer">
                        Driver (Find Parking)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="owner" id="owner" />
                      <Label htmlFor="owner" className="cursor-pointer">
                        Parking Lot Owner (Register Parking)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <Button type="submit" className="w-full">
                {activeTab === "login" ? "Login" : "Create Account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <p className="text-sm text-muted-foreground">
              {activeTab === "login" ? "Don't have an account? " : "Already have an account? "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setActiveTab(activeTab === "login" ? "signup" : "login")}
              >
                {activeTab === "login" ? "Sign up" : "Login"}
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

// Admin Dashboard component
function AdminDashboard({
  users,
  loginHistory,
  parkingLots,
  bookings,
  onBlockUser,
  onDeleteUser,
  isInactiveForThreeMonths,
}: {
  users: UserType[]
  loginHistory: LoginEvent[]
  parkingLots: ParkingLot[]
  bookings: Booking[]
  onBlockUser: (userId: string, blocked: boolean) => void
  onDeleteUser: (userId: string) => void
  isInactiveForThreeMonths: (user: UserType) => boolean
}) {
  const [activeTab, setActiveTab] = useState("overview")

  // Calculate statistics
  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.isActive).length
  const totalOwners = users.filter((user) => user.role === "owner").length
  const totalDrivers = users.filter((user) => user.role === "driver").length
  const totalParkingLots = parkingLots.length
  const totalBookings = bookings.length
  const pendingBookings = bookings.filter((booking) => booking.status === "pending").length
  const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed").length
  const completedBookings = bookings.filter((booking) => booking.status === "completed").length
  const cancelledBookings = bookings.filter((booking) => booking.status === "cancelled").length

  // Get current bookings (pending and confirmed)
  const currentBookings = bookings.filter((booking) => booking.status === "pending" || booking.status === "confirmed")

  // Get completed bookings for transaction history
  const transactionHistory = bookings.filter(
    (booking) => booking.status === "completed" || booking.status === "cancelled",
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Current Bookings</TabsTrigger>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold">{totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary/20" />
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Button
                    variant="link"
                    className="flex items-center text-green-500 p-0 h-auto"
                    onClick={() => {
                      setActiveTab("users")
                      // You would add filter logic here in a real implementation
                    }}
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    <span>{activeUsers} active</span>
                  </Button>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Button
                    variant="link"
                    className="flex items-center text-orange-500 p-0 h-auto"
                    onClick={() => {
                      setActiveTab("users")
                      // You would add filter logic here in a real implementation
                    }}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{users.filter((u) => isInactiveForThreeMonths(u)).length} inactive</span>
                  </Button>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Button
                    variant="link"
                    className="flex items-center text-red-500 p-0 h-auto"
                    onClick={() => {
                      setActiveTab("users")
                      // You would add filter logic here in a real implementation
                    }}
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    <span>{users.filter((u) => u.blocked).length} blocked</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User Types</p>
                    <p className="text-3xl font-bold">{totalOwners + totalDrivers}</p>
                  </div>
                  <User className="h-8 w-8 text-primary/20" />
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Button
                    variant="link"
                    className="flex items-center text-blue-500 p-0 h-auto"
                    onClick={() => {
                      setActiveTab("users")
                      // You would add filter logic here in a real implementation
                    }}
                  >
                    <ParkingCircle className="h-4 w-4 mr-1" />
                    <span>{totalOwners} owners</span>
                  </Button>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Button
                    variant="link"
                    className="flex items-center text-orange-500 p-0 h-auto"
                    onClick={() => {
                      setActiveTab("users")
                      // You would add filter logic here in a real implementation
                    }}
                  >
                    <Car className="h-4 w-4 mr-1" />
                    <span>{totalDrivers} drivers</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bookings</p>
                    <p className="text-3xl font-bold">{totalBookings}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-primary/20" />
                </div>
                <div className="mt-4 flex items-center text-sm space-x-2">
                  <Button
                    variant="link"
                    className="flex items-center text-green-500 p-0 h-auto"
                    onClick={() => {
                      setActiveTab("bookings")
                      // You would add filter logic here in a real implementation
                    }}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    <span>{confirmedBookings} confirmed</span>
                  </Button>
                  <Separator orientation="vertical" className="mx-1 h-4" />
                  <Button
                    variant="link"
                    className="flex items-center text-orange-500 p-0 h-auto"
                    onClick={() => {
                      setActiveTab("bookings")
                      // You would add filter logic here in a real implementation
                    }}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{pendingBookings} pending</span>
                  </Button>
                  <Separator orientation="vertical" className="mx-1 h-4" />
                  <Button
                    variant="link"
                    className="flex items-center text-red-500 p-0 h-auto"
                    onClick={() => {
                      setActiveTab("bookings")
                      // You would add filter logic here in a real implementation
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    <span>{cancelledBookings} cancelled</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Bookings</CardTitle>
                <CardDescription>Ongoing and upcoming bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentBookings.length > 0 ? (
                    currentBookings
                      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                      .slice(0, 5)
                      .map((booking) => {
                        const parkingLot = parkingLots.find((lot) => lot.id === booking.parkingLotId)
                        return (
                          <div key={booking.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`rounded-full p-1 ${
                                  booking.status === "confirmed" ? "bg-green-100" : "bg-yellow-100"
                                }`}
                              >
                                {booking.status === "confirmed" ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Clock className="h-4 w-4 text-yellow-600" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{parkingLot?.name || "Unknown Lot"}</p>
                                <p className="text-xs text-muted-foreground">{booking.driverEmail}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">{booking.startTime.toLocaleDateString()}</p>
                              <p className="text-xs text-muted-foreground">
                                {booking.startTime.toLocaleTimeString()} - {booking.endTime.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        )
                      })
                  ) : (
                    <div className="text-center text-muted-foreground">No current bookings</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Recent payment records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactionHistory.length > 0 ? (
                    transactionHistory
                      .sort((a, b) => b.endTime.getTime() - a.endTime.getTime())
                      .slice(0, 5)
                      .map((booking) => {
                        const parkingLot = parkingLots.find((lot) => lot.id === booking.parkingLotId)
                        // Calculate duration in hours
                        const durationMs = booking.endTime.getTime() - booking.startTime.getTime()
                        const durationHours = durationMs / (1000 * 60 * 60)
                        // Calculate total price
                        const totalPrice = parkingLot ? parkingLot.price * durationHours : 0

                        return (
                          <div key={booking.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`rounded-full p-1 ${
                                  booking.status === "completed" ? "bg-green-100" : "bg-red-100"
                                }`}
                              >
                                {booking.status === "completed" ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <X className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{parkingLot?.name || "Unknown Lot"}</p>
                                <p className="text-xs text-muted-foreground">{booking.driverEmail}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">₱{totalPrice.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">{booking.endTime.toLocaleDateString()}</p>
                            </div>
                          </div>
                        )
                      })
                  ) : (
                    <div className="text-center text-muted-foreground">No transaction history</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Manage Users</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const inactive = isInactiveForThreeMonths(user)
                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>
                      {user.blocked ? (
                        <Badge variant="destructive">Blocked</Badge>
                      ) : inactive ? (
                        <Badge variant="secondary">Inactive (3+ months)</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.lastLogin ? user.lastLogin.toLocaleDateString() : "Never"}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>User Status</DialogTitle>
                            <DialogDescription>
                              {user.blocked
                                ? "This user is currently blocked. You can unblock them to allow access."
                                : "You can block this user to prevent them from accessing the system."}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => onBlockUser(user.id, !user.blocked)}
                                variant={user.blocked ? "outline" : "destructive"}
                              >
                                {user.blocked ? "Unblock User" : "Block User"}
                              </Button>
                            </div>
                            {inactive && !user.blocked && (
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>This user has been inactive for more than 3 months.</AlertDescription>
                              </Alert>
                            )}
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                Close
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {activeTab === "bookings" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Current Bookings</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parking Lot</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentBookings.length > 0 ? (
                currentBookings.map((booking) => {
                  const parkingLot = parkingLots.find((lot) => lot.id === booking.parkingLotId)
                  // Calculate duration in hours
                  const durationMs = booking.endTime.getTime() - booking.startTime.getTime()
                  const durationHours = durationMs / (1000 * 60 * 60)
                  // Calculate total price
                  const totalPrice = parkingLot ? parkingLot.price * durationHours : 0

                  return (
                    <TableRow key={booking.id}>
                      <TableCell>{parkingLot?.name || "Unknown"}</TableCell>
                      <TableCell>{booking.driverEmail}</TableCell>
                      <TableCell>{booking.startTime.toLocaleString()}</TableCell>
                      <TableCell>{booking.endTime.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={booking.status === "pending" ? "secondary" : "outline"}>{booking.status}</Badge>
                      </TableCell>
                      <TableCell>₱{totalPrice.toFixed(2)}</TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No current bookings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {activeTab === "transactions" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Transaction History</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parking Lot</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionHistory.length > 0 ? (
                transactionHistory
                  .sort((a, b) => b.endTime.getTime() - a.endTime.getTime())
                  .map((booking) => {
                    const parkingLot = parkingLots.find((lot) => lot.id === booking.parkingLotId)
                    // Calculate duration in hours
                    const durationMs = booking.endTime.getTime() - booking.startTime.getTime()
                    const durationHours = durationMs / (1000 * 60 * 60)
                    // Calculate total price
                    const totalPrice = parkingLot ? parkingLot.price * durationHours : 0

                    return (
                      <TableRow key={booking.id}>
                        <TableCell>{parkingLot?.name || "Unknown"}</TableCell>
                        <TableCell>{booking.driverEmail}</TableCell>
                        <TableCell>{booking.endTime.toLocaleDateString()}</TableCell>
                        <TableCell>{durationHours.toFixed(1)} hours</TableCell>
                        <TableCell>
                          <Badge variant={booking.status === "completed" ? "default" : "destructive"}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>₱{totalPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          {booking.rating ? (
                            <div className="flex items-center">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= booking.rating! ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              {booking.comment && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="ml-2 h-6 px-2">
                                      View
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Customer Feedback</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <div className="flex mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            className={`h-5 w-5 ${
                                              star <= booking.rating!
                                                ? "text-yellow-500 fill-yellow-500"
                                                : "text-gray-300"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <p className="text-sm">{booking.comment}</p>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">No rating</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No transaction history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {activeTab === "security" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Security Overview</h2>
          <Card>
            <CardHeader>
              <CardTitle>Failed Login Attempts</CardTitle>
              <CardDescription>Recent failed login attempts</CardDescription>
            </CardHeader>
            <CardContent>
              {loginHistory.filter((login) => !login.success).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginHistory
                      .filter((login) => !login.success)
                      .map((login) => (
                        <TableRow key={login.id}>
                          <TableCell>{login.userEmail}</TableCell>
                          <TableCell>{login.timestamp.toLocaleString()}</TableCell>
                          <TableCell>{login.ipAddress}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No failed login attempts found.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Owner Dashboard component
function OwnerDashboard({
  activeTab,
  setActiveTab,
  parkingLots,
  bookings,
  onRegister,
  onUpdate,
  onDelete,
  onUpdateBookingStatus,
}: {
  activeTab: string
  setActiveTab: (tab: string) => void
  parkingLots: ParkingLot[]
  bookings: Booking[]
  onRegister: (parkingLot: Omit<ParkingLot, "id" | "ownerId" | "createdAt">) => ParkingLot
  onUpdate: (parkingLot: ParkingLot) => void
  onDelete: (id: string) => void
  onUpdateBookingStatus: (id: string, status: Booking["status"], cancellationReason?: string) => void
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Owner Dashboard</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="register">Register Lot</TabsTrigger>
            <TabsTrigger value="manage">Manage Lots</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "register" && <RegisterParkingLotForm onRegister={onRegister} />}

      {activeTab === "manage" && (
        <ManageParkingLots parkingLots={parkingLots} onUpdate={onUpdate} onDelete={onDelete} />
      )}

      {activeTab === "bookings" && (
        <ManageBookings parkingLots={parkingLots} bookings={bookings} onUpdateBookingStatus={onUpdateBookingStatus} />
      )}
    </div>
  )
}

// Driver Dashboard component
function DriverDashboard({
  parkingLots,
  bookings,
  onBooking,
  locationPermissionGranted,
  userLocation,
  onSubmitRating,
  needsRating,
  showRatingDialog,
  setShowRatingDialog,
  bookingToRate,
  setBookingToRate,
}: {
  parkingLots: ParkingLot[]
  onBooking: (Omit<Booking, "id" | "driverId" | "driverEmail" | "createdAt" | "status">) => Booking
  locationPermissionGranted: boolean | null
  userLocation: { lat: number; lng: number } | null
  onSubmitRating: (bookingId: string, rating: number, comment: string) => void
  needsRating: (bookingggg: Booking) => boolean
  showRatingDialog: boolean
  setShowRatingDialog: React.Dispatch<React.SetStateAction<boolean>>
  bookingToRate: string | null
  setBookingToRate: React.Dispatch<React.SetStateAction<string | null>>
}) {
  const [activeTab, setActiveTab] = useState("find")

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Driver Dashboard</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="find">Find Parking</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "find" && (
        <FindParking
          parkingLots={parkingLots}
          onBooking={onBooking}
          locationPermissionGranted={locationPermissionGranted}
          userLocation={userLocation}
        />
      )}

      {activeTab === "bookings" && (
        <MyBookings
          bookings={bookings}
          parkingLots={parkingLots}
          onSubmitRating={onSubmitRating}
          needsRating={needsRating}
          setShowRatingDialog={setShowRatingDialog}
          setBookingToRate={setBookingToRate}
          locationPermissionGranted={locationPermissionGranted}
        />
      )}
    </div>
  )
}

// My Bookings component
function MyBookings({
  bookings,
  parkingLots,
  onSubmitRating,
  needsRating,
  setShowRatingDialog,
  setBookingToRate,
  locationPermissionGranted,
}: {
  bookings: Booking[]
  parkingLots: ParkingLot[]
  onSubmitRating: (bookingId: string, rating: number, comment: string) => void
  needsRating: (booking: Booking) => boolean
  setShowRatingDialog: React.Dispatch<React.SetStateAction<boolean>>
  setBookingToRate: React.Dispatch<React.SetStateAction<string | null>>
  locationPermissionGranted: boolean | null
}) {
  const [activeTab, setActiveTab] = useState("upcoming")

  // Filter bookings
  const upcomingBookings = bookings.filter((booking) => booking.status === "pending" || booking.status === "confirmed")
  const pastBookings = bookings.filter((booking) => booking.status === "completed" || booking.status === "cancelled")

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Bookings</TabsTrigger>
          <TabsTrigger value="past">Past Bookings</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "upcoming" ? (
        upcomingBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingBookings.map((booking) => {
              const parkingLot = parkingLots.find((lot) => lot.id === booking.parkingLotId)
              if (!parkingLot) return null

              return (
                <Card key={booking.id}>
                  <CardHeader>
                    <CardTitle>{parkingLot.name}</CardTitle>
                    <CardDescription>{parkingLot.address}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {booking.startTime.toLocaleDateString()} {booking.startTime.toLocaleTimeString()} -{" "}
                        {booking.endTime.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {((booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60)).toFixed(1)}{" "}
                        hours
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>
                        ₱
                        {(
                          parkingLot.price *
                          ((booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60))
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          booking.status === "pending"
                            ? "secondary"
                            : booking.status === "confirmed"
                              ? "outline"
                              : "default"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      onClick={() => openDirections(parkingLot.address)}
                      disabled={locationPermissionGranted === false}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>You have no upcoming bookings.</AlertDescription>
          </Alert>
        )
      ) : pastBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastBookings.map((booking) => {
            const parkingLot = parkingLots.find((lot) => lot.id === booking.parkingLotId)
            if (!parkingLot) return null

            return (
              <Card key={booking.id}>
                <CardHeader>
                  <CardTitle>{parkingLot.name}</CardTitle>
                  <CardDescription>{parkingLot.address}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {booking.startTime.toLocaleDateString()} {booking.startTime.toLocaleTimeString()} -{" "}
                      {booking.endTime.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {((booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60)).toFixed(1)} hours
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>
                      ₱
                      {(
                        parkingLot.price *
                        ((booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60))
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={booking.status === "completed" ? "default" : "destructive"}>{booking.status}</Badge>
                  </div>
                  {booking.rating ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Your Rating:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= booking.rating! ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : booking.status === "completed" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBookingToRate(booking.id)
                        setShowRatingDialog(true)
                      }}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Rate Experience
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You have no past bookings.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Rating Dialog component
function RatingDialog({
  bookingId,
  onSubmit,
  onClose,
  parkingLots,
  bookings,
}: {
  bookingId: string
  onSubmit: (bookingId: string, rating: number, comment: string) => void
  onClose: () => void
  parkingLots: ParkingLot[]
  bookings: Booking[]
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [hoveredRating, setHoveredRating] = useState(0)

  const booking = bookings.find((b) => b.id === bookingId)
  const parkingLot = booking ? parkingLots.find((lot) => lot.id === booking.parkingLotId) : null

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please select a rating")
      return
    }
    onSubmit(bookingId, rating, comment)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>
            {parkingLot ? `How was your experience at ${parkingLot.name}?` : "How was your parking experience?"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="comment">Comments (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="resize-none"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={rating === 0}>
            Submit Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Find Parking component with map
function FindParking({
  parkingLots,
  onBooking,
  locationPermissionGranted,
  userLocation,
}: {
  parkingLots: ParkingLot[]
  onBooking: (Omit<Booking, "id" | "driverId" | "driverEmail" | "createdAt" | "status">) => Booking
  locationPermissionGranted: boolean | null
  userLocation: { lat: number; lng: number } | null
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Available Parking Lots</h2>
      </div>

      {locationPermissionGranted === false && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Location access is required to view the map and get directions. Please enable location access in your
            browser settings.
          </AlertDescription>
        </Alert>
      )}

      {parkingLots.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No parking lots are currently available. Please check back later as parking lot owners register their
            spaces.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* List view on the left */}
          <div className="md:w-1/3 space-y-4 md:max-h-[500px] md:overflow-y-auto">
            {parkingLots.map((lot) => (
              <ParkingLotCard
                key={lot.id}
                parkingLot={lot}
                onBooking={onBooking}
                locationPermissionGranted={locationPermissionGranted}
                compact={true}
              />
            ))}
          </div>

          {/* Map view on the right */}
          <div className="md:w-2/3">
            {locationPermissionGranted ? (
              <ParkingMap parkingLots={parkingLots} userLocation={userLocation} />
            ) : (
              <div className="bg-muted rounded-lg p-8 text-center h-[500px] flex items-center justify-center">
                <div>
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Map View Disabled</h3>
                  <p className="text-muted-foreground mb-4">
                    Please enable location access to view the interactive map of parking lots.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Replace the ParkingMap component with this fallback version that doesn't require a Google Maps API key

function ParkingMap({
  parkingLots,
  userLocation,
}: {
  parkingLots: ParkingLot[]
  userLocation: { lat: number; lng: number } | null
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null)

  // Generate random coordinates for parking lots that don't have them
  const getCoordinates = (lot: ParkingLot) => {
    if (lot.coordinates) return lot.coordinates

    // Generate random coordinates near the user's location
    const baseLat = userLocation?.lat || 14.5995 // Default to Philippines
    const baseLng = userLocation?.lng || 120.9842

    return {
      lat: baseLat + (Math.random() - 0.5) * 0.05,
      lng: baseLng + (Math.random() - 0.5) * 0.05,
    }
  }

  // Create a simple map visualization
  useEffect(() => {
    if (mapRef.current) {
      const mapContainer = mapRef.current
      mapContainer.innerHTML = ""

      // Create a mock map
      const mapElement = document.createElement("div")
      mapElement.className = "relative w-full h-full bg-blue-50 rounded-lg overflow-hidden"

      // Track zoom level
      let zoomLevel = 1
      const minZoom = 0.5
      const maxZoom = 2

      // Function to update marker positions based on zoom
      const updateMarkerPositions = () => {
        try {
          // Get all markers
          const markers = mapElement.querySelectorAll('[data-marker="true"]')
          markers.forEach((marker) => {
            const baseLeft = Number.parseFloat(marker.getAttribute("data-base-left") || "50")
            const baseTop = Number.parseFloat(marker.getAttribute("data-base-top") || "50")

            // Calculate new position based on zoom level
            const newLeft = 50 + (baseLeft - 50) * zoomLevel
            const newTop = 50 + (baseTop - 50) * zoomLevel

            // Apply new position
            const markerElement = marker as HTMLElement
            markerElement.style.left = `${Math.min(Math.max(newLeft, 5), 95)}%`
            markerElement.style.top = `${Math.min(Math.max(newTop, 5), 95)}%`
          })
        } catch (error) {
          console.error("Error updating marker positions:", error)
        }
      }

      // Add user location marker
      if (userLocation) {
        const userMarker = document.createElement("div")
        userMarker.className =
          "absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
        userMarker.style.left = "50%"
        userMarker.style.top = "50%"
        userMarker.style.transform = "translate(-50%, -50%)"
        userMarker.title = "Your Location"
        userMarker.textContent = "You"
        userMarker.setAttribute("data-marker", "true")
        userMarker.setAttribute("data-base-left", "50")
        userMarker.setAttribute("data-base-top", "50")
        mapElement.appendChild(userMarker)
      }

      // Add parking lot markers
      parkingLots.forEach((lot, index) => {
        const coords = getCoordinates(lot)

        // Calculate position on the map (simplified)
        const baseLeft = userLocation ? 50 + (coords.lng - userLocation.lng) * 1000 : Math.random() * 80 + 10
        const baseTop = userLocation ? 50 - (coords.lat - userLocation.lat) * 1000 : Math.random() * 80 + 10

        const marker = document.createElement("div")
        marker.className = "absolute flex flex-col items-center"
        marker.style.left = `${Math.min(Math.max(baseLeft, 10), 90)}%`
        marker.style.top = `${Math.min(Math.max(baseTop, 10), 90)}%`
        marker.setAttribute("data-marker", "true")
        marker.setAttribute("data-base-left", baseLeft.toString())
        marker.setAttribute("data-base-top", baseTop.toString())

        const pin = document.createElement("div")
        pin.className =
          "w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:bg-red-600"
        pin.textContent = (index + 1).toString()
        pin.title = lot.name

        // Add click event to show info
        pin.addEventListener("click", () => {
          setSelectedLot(lot)

          // Remove any existing info windows
          const existingInfo = mapElement.querySelector(".info-window")
          if (existingInfo) {
            existingInfo.remove()
          }

          // Create info window
          const infoWindow = document.createElement("div")
          infoWindow.className = "info-window absolute bg-white p-2 rounded shadow-md z-10 w-48 text-sm"
          infoWindow.style.left = pin.offsetLeft + "px"
          infoWindow.style.top = pin.offsetTop - 120 + "px"

          infoWindow.innerHTML = `
          <h3 class="font-bold text-sm">${lot.name}</h3>
          <p class="text-xs mb-1">${lot.address}</p>
          <div class="flex items-center text-xs mb-1">
            <span>₱${lot.price}/hour</span>
          </div>
          <div class="flex items-center text-xs mb-1">
            <span>${lot.availableSpots} spots available</span>
          </div>
          <button class="mt-2 bg-blue-500 text-white text-xs py-1 px-2 rounded w-full">Get Directions</button>
        `

          // Add close button
          const closeBtn = document.createElement("button")
          closeBtn.className = "absolute top-1 right-1 text-gray-500 hover:text-gray-700"
          closeBtn.innerHTML = "×"
          closeBtn.addEventListener("click", () => {
            infoWindow.remove()
            setSelectedLot(null)
          })
          infoWindow.appendChild(closeBtn)

          // Add directions button functionality
          const directionsBtn = infoWindow.querySelector("button")
          if (directionsBtn) {
            directionsBtn.addEventListener("click", () => {
              openDirections(lot.address)
            })
          }

          mapElement.appendChild(infoWindow)
        })

        marker.appendChild(pin)
        mapElement.appendChild(marker)
      })

      // Add map controls
      const controls = document.createElement("div")
      controls.className = "absolute bottom-4 right-4 bg-white rounded-md shadow-md p-2 flex gap-2"

      const zoomIn = document.createElement("button")
      zoomIn.className = "w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
      zoomIn.innerHTML = "+"
      zoomIn.addEventListener("click", () => {
        if (zoomLevel < maxZoom) {
          zoomLevel += 0.2
          updateMarkerPositions()
        }
      })

      const zoomOut = document.createElement("button")
      zoomOut.className = "w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
      zoomOut.innerHTML = "-"
      zoomOut.addEventListener("click", () => {
        if (zoomLevel > minZoom) {
          zoomLevel -= 0.2
          updateMarkerPositions()
        }
      })

      controls.appendChild(zoomIn)
      controls.appendChild(zoomOut)
      mapElement.appendChild(controls)

      // Add map legend
      const legend = document.createElement("div")
      legend.className = "absolute bottom-4 left-4 bg-white rounded-md shadow-md p-2"
      legend.innerHTML = `
      <div class="text-sm font-medium mb-2">Map Legend</div>
      <div class="flex items-center gap-2 mb-1">
        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span class="text-xs">Your Location</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
        <span class="text-xs">Parking Lots</span>
      </div>
    `
      mapElement.appendChild(legend)

      mapContainer.appendChild(mapElement)
    }
  }, [parkingLots, userLocation, selectedLot])

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border">
      <div ref={mapRef} className="w-full h-full">
        <div className="flex items-center justify-center h-full bg-muted">
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Function to open directions in Google Maps
function openDirections(address: string) {
  if (typeof window !== "undefined" && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = `${position.coords.latitude},${position.coords.longitude}`
        const encodedAddress = encodeURIComponent(address)
        window.open(`https://www.google.com/maps/dir/${origin}/${encodedAddress}`, "_blank")
      },
      () => {
        // If getting current position fails, just use the address
        const encodedAddress = encodeURIComponent(address)
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, "_blank")
      },
    )
  } else {
    // Fallback if geolocation is not available
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, "_blank")
  }
}

// Parking Lot Card component
function ParkingLotCard({
  parkingLot,
  onBooking,
  locationPermissionGranted,
  compact = false,
}: {
  parkingLot: ParkingLot
  onBooking: (Omit<Booking, "id" | "driverId" | "driverEmail" | "createdAt" | "status">) => Booking
  locationPermissionGranted: boolean | null
  compact?: boolean
}) {
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  return (
    <Card className={compact ? "overflow-hidden" : ""}>
      <CardHeader className={compact ? "p-3" : ""}>
        <CardTitle className={compact ? "text-base" : ""}>{parkingLot.name}</CardTitle>
        <CardDescription className={compact ? "text-xs" : ""}>{parkingLot.address}</CardDescription>
      </CardHeader>
      <CardContent className={`space-y-2 ${compact ? "p-3 pt-0" : ""}`}>
        {/* Show image in both compact and full mode, but with different sizes */}
        {parkingLot.photos && parkingLot.photos.length > 0 ? (
          <img
            src={parkingLot.photos[0] || "/placeholder.svg"}
            alt={parkingLot.name}
            className={`rounded-md object-cover ${compact ? "h-24 w-full" : "aspect-video mb-2"}`}
          />
        ) : (
          <div className={`rounded-md bg-gray-200 ${compact ? "h-24 w-full" : "aspect-video mb-2"}`}>
            <div className="flex h-full items-center justify-center text-gray-500">No image</div>
          </div>
        )}

        {!compact && <p className="text-sm text-muted-foreground">{parkingLot.description}</p>}

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <div className="flex items-center gap-1">
            <Clock className={`${compact ? "h-3 w-3" : "h-4 w-4"}`} />
            <span className={compact ? "text-xs" : ""}>₱{parkingLot.price}/hour</span>
          </div>
          <div className="flex items-center gap-1">
            <ParkingCircle className={`${compact ? "h-3 w-3" : "h-4 w-4"}`} />
            <span className={compact ? "text-xs" : ""}>{parkingLot.availableSpots} spots</span>
          </div>
          {!compact && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{parkingLot.contactNumber}</span>
            </div>
          )}
        </div>

        {parkingLot.averageRating ? (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`${compact ? "h-3 w-3" : "h-4 w-4"} ${
                    star <= Math.round(parkingLot.averageRating!) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className={`${compact ? "text-xs" : "text-sm"} text-muted-foreground`}>
              {parkingLot.averageRating.toFixed(1)}
            </span>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className={`flex justify-between ${compact ? "p-3 pt-0" : ""}`}>
        <Button size={compact ? "sm" : "default"} onClick={() => setIsBookingOpen(true)}>
          Book Now
        </Button>
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={() => openDirections(parkingLot.address)}
          disabled={locationPermissionGranted === false}
        >
          <Navigation className={`${compact ? "h-3 w-3" : "h-4 w-4"} mr-1`} />
          Directions
        </Button>
      </CardFooter>

      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book Parking Spot</DialogTitle>
            <DialogDescription>Enter the start and end time for your booking.</DialogDescription>
          </DialogHeader>
          <BookingForm parkingLotId={parkingLot.id} onBooking={onBooking} onClose={() => setIsBookingOpen(false)} />
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// Booking Form component
function BookingForm({
  parkingLotId,
  onBooking,
  onClose,
}: {
  parkingLotId: string
  onBooking: (Omit<Booking, "id" | "driverId" | "driverEmail" | "createdAt" | "status">) => Booking
  onClose: () => void
}) {
  // Format a date to YYYY-MM-DDThh:mm format for datetime-local input
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const now = new Date()
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)

  const [startTime, setStartTime] = useState<Date>(now)
  const [endTime, setEndTime] = useState<Date>(twoHoursLater)
  const [startTimeInput, setStartTimeInput] = useState<string>(formatDateForInput(now))
  const [endTimeInput, setEndTimeInput] = useState<string>(formatDateForInput(twoHoursLater))

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setStartTimeInput(inputValue)

    if (inputValue) {
      const newDate = new Date(inputValue)
      if (!isNaN(newDate.getTime())) {
        setStartTime(newDate)
      }
    }
  }

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setEndTimeInput(inputValue)

    if (inputValue) {
      const newDate = new Date(inputValue)
      if (!isNaN(newDate.getTime())) {
        setEndTime(newDate)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that end time is after start time
    if (endTime <= startTime) {
      alert("End time must be after start time")
      return
    }

    const newBooking: Omit<Booking, "id" | "driverId" | "driverEmail" | "createdAt" | "status"> = {
      parkingLotId,
      startTime,
      endTime,
    }

    onBooking(newBooking)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="startTime">Start Time</Label>
        <Input type="datetime-local" id="startTime" value={startTimeInput} onChange={handleStartTimeChange} required />
      </div>
      <div>
        <Label htmlFor="endTime">End Time</Label>
        <Input type="datetime-local" id="endTime" value={endTimeInput} onChange={handleEndTimeChange} required />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">Book Now</Button>
      </DialogFooter>
    </form>
  )
}

// Find the RegisterParkingLotForm component and update it to validate all required fields before enabling the Register button

// Replace the RegisterParkingLotForm component with this updated version:
function RegisterParkingLotForm({
  onRegister,
}: { onRegister: (Omit<ParkingLot, "id" | "ownerId" | "createdAt">) => ParkingLot }) {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [spots, setSpots] = useState(10)
  const [price, setPrice] = useState(5.0)
  const [description, setDescription] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([])
  const [photo, setPhoto] = useState<string | null>(null)

  // Form validation state
  const [nameError, setNameError] = useState("")
  const [addressError, setAddressError] = useState("")
  const [contactNumberError, setContactNumberError] = useState("")
  const [vehicleTypesError, setVehicleTypesError] = useState("")
  const [photoError, setPhotoError] = useState("")

  // Coordinates state
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)

  // Check if form is valid
  const isFormValid =
    name.trim() !== "" &&
    address.trim() !== "" &&
    contactNumber.trim() !== "" &&
    spots > 0 &&
    price > 0 &&
    selectedVehicleTypes.length > 0 &&
    photo !== null &&
    !nameError &&
    !addressError &&
    !contactNumberError &&
    !vehicleTypesError &&
    !photoError

  const handleVehicleTypeChange = (vehicleType: string) => {
    setSelectedVehicleTypes((prev) =>
      prev.includes(vehicleType) ? prev.filter((v) => v !== vehicleType) : [...prev, vehicleType],
    )

    // Update validation after state change
    setTimeout(() => {
      if (selectedVehicleTypes.length === 0) {
        setVehicleTypesError("Please select at least one vehicle type")
      } else {
        setVehicleTypesError("")
      }
    }, 0)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError("File size should be less than 5MB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setPhoto(reader.result as string)
        setPhotoError("")
      }
      reader.readAsDataURL(file)
    } else {
      setPhotoError("Please upload a photo of the parking lot")
    }
  }

  const validateName = (value: string) => {
    if (value.trim() === "") {
      setNameError("Name is required")
    } else if (value.length < 3) {
      setNameError("Name must be at least 3 characters")
    } else {
      setNameError("")
    }
    setName(value)
  }

  const validateAddress = (value: string) => {
    if (value.trim() === "") {
      setAddressError("Address is required")
    } else if (value.length < 5) {
      setAddressError("Please enter a valid address")
    } else {
      setAddressError("")
      // Auto-geocode when address changes
      if (value) {
        // Mock coordinates - in a real app, these would come from a geocoding API
        setCoordinates({
          lat: 40.7128 + (Math.random() - 0.5) * 0.1,
          lng: -74.006 + (Math.random() - 0.5) * 0.1,
        })
      }
    }
    setAddress(value)
  }

  const validateContactNumber = (value: string) => {
    // Simple validation for Philippine mobile number format
    const phoneRegex = /^\+?63\s?[0-9]{9,10}$|^0[0-9]{10}$/

    if (value.trim() === "") {
      setContactNumberError("Contact number is required")
    } else if (!phoneRegex.test(value)) {
      setContactNumberError("Please enter a valid Philippine mobile number (e.g., +63 9XXXXXXXXX or 09XXXXXXXXX)")
    } else {
      setContactNumberError("")
    }
    setContactNumber(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Final validation check
    if (!isFormValid) {
      if (!photo) {
        setPhotoError("Please upload a photo of the parking lot")
      }
      if (selectedVehicleTypes.length === 0) {
        setVehicleTypesError("Please select at least one vehicle type")
      }
      return
    }

    const newParkingLot: Omit<ParkingLot, "id" | "ownerId" | "createdAt"> = {
      name,
      address,
      spots,
      availableSpots: spots,
      price,
      description,
      contactNumber,
      vehicleTypes: selectedVehicleTypes,
      photos: [photo],
      coordinates,
    }

    onRegister(newParkingLot)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register Parking Lot</CardTitle>
        <CardDescription>Fill out the form below to register your parking lot.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => validateName(e.target.value)}
              className={nameError ? "border-red-500" : ""}
              required
            />
            {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              type="text"
              id="address"
              value={address}
              onChange={(e) => validateAddress(e.target.value)}
              className={addressError ? "border-red-500" : ""}
              required
            />
            {addressError && <p className="text-xs text-red-500 mt-1">{addressError}</p>}
            {coordinates && !addressError && (
              <p className="text-xs text-green-600 mt-1">Address verified and coordinates set</p>
            )}
          </div>
          <div>
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input
              type="tel"
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => validateContactNumber(e.target.value)}
              placeholder="+63 9XXXXXXXXX or 09XXXXXXXXX"
              className={contactNumberError ? "border-red-500" : ""}
              required
            />
            {contactNumberError && <p className="text-xs text-red-500 mt-1">{contactNumberError}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="spots">Total Spots</Label>
              <Input
                type="number"
                id="spots"
                value={spots}
                onChange={(e) => setSpots(Math.max(1, Number.parseInt(e.target.value)))}
                min="1"
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price per Hour (₱)</Label>
              <Input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(Math.max(0.01, Number.parseFloat(e.target.value)))}
                min="0.01"
                step="0.01"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your parking lot"
            />
          </div>
          <div>
            <Label className={vehicleTypesError ? "text-red-500" : ""}>Vehicle Types</Label>
            <div className="flex flex-wrap gap-2">
              {vehicleTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={selectedVehicleTypes.includes(type.id)}
                    onCheckedChange={() => handleVehicleTypeChange(type.id)}
                  />
                  <Label htmlFor={type.id} className="cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
            {vehicleTypesError && <p className="text-xs text-red-500 mt-1">{vehicleTypesError}</p>}
          </div>
          <div>
            <Label htmlFor="photo" className={photoError ? "text-red-500" : ""}>
              Photo
            </Label>
            <Input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className={photoError ? "border-red-500" : ""}
            />
            {photoError && <p className="text-xs text-red-500 mt-1">{photoError}</p>}
            {photo && (
              <div className="relative w-32 h-20 mt-2">
                <img
                  src={photo || "/placeholder.svg"}
                  alt="Parking Lot"
                  className="rounded-md aspect-video object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0"
                  onClick={() => {
                    setPhoto(null)
                    setPhotoError("Please upload a photo of the parking lot")
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <Button type="submit" disabled={!isFormValid}>
            Register
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Manage Parking Lots component
function ManageParkingLots({
  parkingLots,
  onUpdate,
  onDelete,
}: {
  parkingLots: ParkingLot[]
  onUpdate: (ParkingLot) => void
  onDelete: (id: string) => void
}) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Manage Parking Lots</h2>
      {parkingLots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parkingLots.map((lot) => (
            <ParkingLotManagementCard key={lot.id} parkingLot={lot} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No parking lots registered yet.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Parking Lot Management Card component
function ParkingLotManagementCard({
  parkingLot,
  onUpdate,
  onDelete,
}: {
  parkingLot: ParkingLot
  onUpdate: (ParkingLot) => void
  onDelete: (id: string) => void
}) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{parkingLot.name}</CardTitle>
        <CardDescription>{parkingLot.address}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <img
          src={parkingLot.photos[0] || "/placeholder.svg"}
          alt={parkingLot.name}
          className="rounded-md aspect-video object-cover mb-2"
        />
        <p className="text-sm text-muted-foreground">{parkingLot.description}</p>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{parkingLot.address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>₱{parkingLot.price}/hour</span>
        </div>
        <div className="flex items-center gap-2">
          <ParkingCircle className="h-4 w-4" />
          <span>{parkingLot.availableSpots} spots available</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span>{parkingLot.contactNumber}</span>
        </div>
        {parkingLot.averageRating ? (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(parkingLot.averageRating!) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{parkingLot.averageRating.toFixed(1)} stars</span>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={() => setIsEditOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive" onClick={() => onDelete(parkingLot.id)}>
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Parking Lot</DialogTitle>
            <DialogDescription>Make changes to the parking lot details.</DialogDescription>
          </DialogHeader>
          <EditParkingLotForm parkingLot={parkingLot} onUpdate={onUpdate} onClose={() => setIsEditOpen(false)} />
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// Update the EditParkingLotForm component to include contactNumber
function EditParkingLotForm({
  parkingLot,
  onUpdate,
  onClose,
}: {
  parkingLot: ParkingLot
  onUpdate: (ParkingLot) => void
  onClose: () => void
}) {
  const [name, setName] = useState(parkingLot.name)
  const [address, setAddress] = useState(parkingLot.address)
  const [spots, setSpots] = useState(parkingLot.spots)
  const [price, setPrice] = useState(parkingLot.price)
  const [description, setDescription] = useState(parkingLot.description)
  const [contactNumber, setContactNumber] = useState(parkingLot.contactNumber || "")
  const [availableSpots, setAvailableSpots] = useState(parkingLot.availableSpots)
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>(parkingLot.vehicleTypes)
  const [photo, setPhoto] = useState<string | null>(parkingLot.photos[0])
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(parkingLot.coordinates || null)

  const handleVehicleTypeChange = (vehicleType: string) => {
    setSelectedVehicleTypes((prev) =>
      prev.includes(vehicleType) ? prev.filter((v) => v !== vehicleType) : [...prev, vehicleType],
    )
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!photo) {
      alert("Please upload a photo of the parking lot.")
      return
    }

    const updatedParkingLot: ParkingLot = {
      ...parkingLot,
      name,
      address,
      spots,
      availableSpots,
      price,
      description,
      contactNumber,
      vehicleTypes: selectedVehicleTypes,
      photos: [photo],
      coordinates,
    }

    onUpdate(updatedParkingLot)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          type="text"
          id="address"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value)
            // Auto-geocode when address changes
            if (e.target.value) {
              // Mock coordinates - in a real app, these would come from a geocoding API
              setCoordinates({
                lat: 40.7128 + (Math.random() - 0.5) * 0.1,
                lng: -74.006 + (Math.random() - 0.5) * 0.1,
              })
            }
          }}
          required
        />
        {coordinates && <p className="text-xs text-green-600 mt-1">Address verified and coordinates set</p>}
      </div>
      <div>
        <Label htmlFor="contactNumber">Contact Number</Label>
        <Input
          type="tel"
          id="contactNumber"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          placeholder="+63 9XXXXXXXXX"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="spots">Total Spots</Label>
          <Input
            type="number"
            id="spots"
            value={spots}
            onChange={(e) => setSpots(Number.parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="availableSpots">Available Spots</Label>
          <Input
            type="number"
            id="availableSpots"
            value={availableSpots}
            onChange={(e) => setAvailableSpots(Number.parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price per Hour (₱)</Label>
          <Input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(Number.parseFloat(e.target.value))}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your parking lot"
        />
      </div>
      <div>
        <Label>Vehicle Types</Label>
        <div className="flex flex-wrap gap-2">
          {vehicleTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={type.id}
                checked={selectedVehicleTypes.includes(type.id)}
                onCheckedChange={() => handleVehicleTypeChange(type.id)}
              />
              <Label htmlFor={type.id} className="cursor-pointer">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="photo">Photo</Label>
        <Input type="file" id="photo" accept="image/*" onChange={handlePhotoChange} />
        {photo && (
          <div className="relative w-32 h-20 mt-2">
            <img src={photo || "/placeholder.svg"} alt="Parking Lot" className="rounded-md aspect-video object-cover" />
            <Button variant="ghost" size="icon" className="absolute top-0 right-0" onClick={() => setPhoto(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">Update</Button>
      </DialogFooter>
    </form>
  )
}

// Manage Bookings component
function ManageBookings({
  parkingLots,
  bookings,
  onUpdateBookingStatus,
}: {
  parkingLots: ParkingLot[]
  bookings: Booking[]
  onUpdateBookingStatus: (id: string, status: Booking["status"], cancellationReason?: string) => void
}) {
  const [cancellationReason, setCancellationReason] = useState("")
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)
  const [showCancellationDialog, setShowCancellationDialog] = useState(false)

  const handleCancelBooking = () => {
    if (bookingToCancel && cancellationReason.trim()) {
      onUpdateBookingStatus(bookingToCancel, "cancelled", cancellationReason)
      setShowCancellationDialog(false)
      setBookingToCancel(null)
      setCancellationReason("")
    }
  }

  const openCancellationDialog = (bookingId: string) => {
    setBookingToCancel(bookingId)
    setShowCancellationDialog(true)
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Manage Bookings</h2>
      {bookings.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parking Lot</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => {
              const parkingLot = parkingLots.find((lot) => lot.id === booking.parkingLotId)
              return (
                <TableRow key={booking.id}>
                  <TableCell>{parkingLot?.name}</TableCell>
                  <TableCell>{booking.driverEmail}</TableCell>
                  <TableCell>{booking.startTime.toLocaleString()}</TableCell>
                  <TableCell>{booking.endTime.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        booking.status === "pending"
                          ? "secondary"
                          : booking.status === "confirmed"
                            ? "outline"
                            : booking.status === "completed"
                              ? "success"
                              : "destructive"
                      }
                    >
                      {booking.status}
                    </Badge>
                    {booking.status === "cancelled" && booking.cancellationReason && (
                      <p className="text-xs text-muted-foreground mt-1">Reason: {booking.cancellationReason}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {booking.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUpdateBookingStatus(booking.id, "confirmed")}
                        >
                          Confirm
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => openCancellationDialog(booking.id)}>
                          Cancel
                        </Button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <Button variant="ghost" size="sm" onClick={() => onUpdateBookingStatus(booking.id, "completed")}>
                        Complete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No bookings found.</AlertDescription>
        </Alert>
      )}

      {/* Cancellation Dialog */}
      <Dialog open={showCancellationDialog} onOpenChange={setShowCancellationDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancellation. This will be sent to the driver.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="cancellationReason">Cancellation Reason</Label>
              <Textarea
                id="cancellationReason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please explain why you're cancelling this booking"
                className="resize-none"
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Back
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={!cancellationReason.trim()}
            >
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
