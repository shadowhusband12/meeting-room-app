import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate } from "./lib/utils";
import { UserGroupIcon, ClockIcon, UserIcon } from "@heroicons/react/24/outline";
import { Id } from "../convex/_generated/dataModel";

export function RoomList() {
  const rooms = useQuery(api.rooms.list);
  const initializeRooms = useMutation(api.rooms.initialize);
  const updateContactPerson = useMutation(api.rooms.updateContactPerson);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingContact, setEditingContact] = useState<string | null>(null);
  
  const book = useMutation(api.bookings.create);
  
  if (!rooms) return <div>Loading...</div>;

  const handleInitialize = async () => {
    try {
      await initializeRooms();
      toast.success("Rooms initialized successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleBook = async () => {
    try {
      const startDateTime = new Date(`${bookingDate}T${startTime}`).getTime();
      const endDateTime = new Date(`${bookingDate}T${endTime}`).getTime();
      
      await book({
        roomId: selectedRoom._id,
        startTime: startDateTime,
        endTime: endDateTime,
        title,
        description,
      });
      
      toast.success("Room booked successfully!");
      setSelectedRoom(null);
      setTitle("");
      setDescription("");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleContactUpdate = async (roomId: Id<"rooms">, newContact: string) => {
    try {
      await updateContactPerson({ roomId, contactPerson: newContact });
      setEditingContact(null);
      toast.success("Contact person updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div 
      className="space-y-4 min-h-screen p-6"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="max-w-7xl mx-auto">
        {rooms.length === 0 ? (
          <div className="text-center p-8 bg-white/90 rounded-lg backdrop-blur-sm">
            <p className="text-gray-600 mb-4">No rooms available</p>
            <button
              onClick={handleInitialize}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Initialize Meeting Rooms
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div 
                  className="h-48 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedRoom(room)}
                >
                  <img 
                    src={room.image} 
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900">{room.name}</h3>
                  <div className="mt-2 flex items-center text-gray-600">
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    <span>Capacity: {room.capacity} people</span>
                  </div>
                  <div className="mt-2 flex items-center text-gray-600">
                    <UserIcon className="h-5 w-5 mr-2" />
                    {editingContact === room._id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          defaultValue={room.contactPerson}
                          className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleContactUpdate(room._id, e.currentTarget.value);
                            }
                          }}
                          onBlur={(e) => handleContactUpdate(room._id, e.target.value)}
                          autoFocus
                        />
                        <button
                          className="text-xs text-indigo-600 hover:text-indigo-800"
                          onClick={() => setEditingContact(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Contact: {room.contactPerson}</span>
                        <button
                          className="text-xs text-indigo-600 hover:text-indigo-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingContact(room._id);
                          }}
                        >
                          (Edit)
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-gray-600">{room.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="mb-4">
              <img 
                src={selectedRoom.image} 
                alt={selectedRoom.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Book {selectedRoom.name}</h3>
            <p className="text-gray-600 mb-4">Contact: {selectedRoom.contactPerson}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Meeting title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Meeting description"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBook}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Book Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
