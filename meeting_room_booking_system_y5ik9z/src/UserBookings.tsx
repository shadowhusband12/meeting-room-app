import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { formatDate } from "./lib/utils";
import { Id } from "../convex/_generated/dataModel";

export function UserBookings() {
  const bookings = useQuery(api.bookings.listByUser);
  const cancelBooking = useMutation(api.bookings.cancel);

  if (!bookings) return <div>Loading...</div>;

  const handleCancel = async (bookingId: Id<"bookings">) => {
    try {
      await cancelBooking({ bookingId });
      toast.success("Booking cancelled successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-4">
      {bookings.length === 0 ? (
        <p className="text-gray-500">No upcoming bookings</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking._id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{booking.title}</h3>
                <p className="text-gray-600">{booking.room?.name}</p>
                <p className="text-gray-600">
                  {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
                </p>
                {booking.description && (
                  <p className="text-gray-600 mt-2">{booking.description}</p>
                )}
              </div>
              <button
                onClick={() => handleCancel(booking._id)}
                className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
