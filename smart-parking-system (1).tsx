"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Clock, Calendar, Search, Plus, ParkingCircle } from "lucide-react"

export default function SmartParkingSystem() {
  const [activeTab, setActiveTab] = useState("find")

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <ParkingCircle className="h-8 w-8 text-primary" />
          SmartPark
        </h1>
        <p className="text-muted-foreground">Find or register parking spaces in your area</p>
      </header>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="find">Find Parking</TabsTrigger>
          <TabsTrigger value="register">Register Parking</TabsTrigger>
        </TabsList>

        <TabsContent value="find" className="space-y-6">
          <FindParking />
        </TabsContent>

        <TabsContent value="register" className="space-y-6">
          <RegisterParking />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function FindParking() {
  const [searchQuery, setSearchQuery] = useState("")

  // Empty parking spots array - will be populated when owners register
  const parkingSpots = []

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by location, address or landmark"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            Now
          </Button>
          <Button variant="outline">
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {parkingSpots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parkingSpots.map((spot) => (
            <Card key={spot.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-[100px] bg-muted">
                  <img src={spot.image || "/placeholder.svg"} alt={spot.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 md:w-2/3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{spot.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {spot.address}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      ₱{spot.price}/hr
                    </Badge>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {spot.features.map((feature, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-green-600 font-medium">{spot.available} spots</span> available
                    </div>
                    <Button size="sm">Book Now</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <ParkingCircle className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">No parking spots available yet</h3>
              <p className="text-muted-foreground mt-1">Parking lot owners need to register their spaces first.</p>
            </div>
            <Button variant="outline" onClick={() => document.querySelector('[value="register"]').click()}>
              Switch to Register Parking
            </Button>
          </div>
        </Card>
      )}

      {parkingSpots.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" className="w-full max-w-xs">
            <MapPin className="h-4 w-4 mr-2" />
            View Map
          </Button>
        </div>
      )}
    </div>
  )
}

function RegisterParking() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Register Your Parking Space</CardTitle>
        <CardDescription>List your parking space and start earning money</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Parking Name</Label>
          <Input id="name" placeholder="e.g. Downtown Garage, Home Driveway" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" placeholder="Full address" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="spots">Number of Spots</Label>
            <Input id="spots" type="number" min="1" placeholder="1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Hourly Rate (₱)</Label>
            <Input id="price" type="number" step="0.50" min="0" placeholder="5.00" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your parking space (size, access instructions, etc.)"
            rows={3}
          />
        </div>

        <div className="pt-2">
          <Label className="block mb-2">Upload Photos</Label>
          <div className="border-2 border-dashed rounded-md p-6 text-center">
            <Plus className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Drag and drop photos or click to browse</p>
            <Button variant="outline" size="sm" className="mt-2">
              Upload Photos
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Register Parking Space</Button>
      </CardFooter>
    </Card>
  )
}

