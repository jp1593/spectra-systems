"use client";
import { useFormState } from "react-dom";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useState } from "react";
// Data
import { updateHotel } from "@/lib/actions";
// Components
import { LocationPicker } from "@/components/user/administration/locationPicker";
import { SubmitButton } from "@/components/user/administration/submitButton";
// UI Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
// Icons
import { Hotel, Star, DoorOpen, Check, Trash2 } from "lucide-react";

export function HotelModificationForm({
  hotel,
  locations,
}: {
  hotel: Hotel;
  locations: HotelLocation[];
}) {
  const { toast } = useToast();

  const [amenity, setAmenity] = useState<string>("");
  const [amenities, setAmenities] = useState<string[]>(hotel.amenities);

  const initialState = { error: "" };
  const [state, formAction] = useFormState(updateHotel, initialState);

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: state?.error,
      });
    }
  }, [state]);

  return (
    <form
      action={formAction}
      className="flex flex-col border p-3 rounded-lg gap-y-5 mb-8 mr-8"
    >
      <input type="hidden" name="_id" value={hotel._id} />
      <input type="hidden" name="amenities" value={JSON.stringify(amenities)} />
      <div className="flex flex-col gap-y-5 pb-5 border-b">
        <div className="flex text-lg font-bold items-center">
          Hotel Information
          <Hotel className="h-5 w-5 ml-3" />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="name">Hotel Name</Label>
          <Input id="name" name="name" required defaultValue={hotel.name} />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="location">Location</Label>
          <LocationPicker locations={locations} />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="picture">Picture</Label>
          <Input
            id="picture"
            name="picture"
            required
            defaultValue={hotel.picture}
          />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="description">Hotel Description</Label>
          <Textarea
            id="description"
            name="description"
            required
            defaultValue={hotel.description}
          />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Amenities</Label>
          <div className="flex gap-x-2">
            <Input
              className="w-40"
              value={amenity}
              onChange={(e) => setAmenity(e.target.value)}
            />
            <Button
              type="button"
              onClick={() => {
                if (!amenity) {
                  return;
                }
                setAmenities([...amenities, amenity]);
                setAmenity("");
              }}
            >
              Add Amenity
            </Button>
          </div>
          <div className="flex gap-x-5 flex-wrap gap-y-5 mt-2">
            {amenities.map((amenity, index) => (
              <Amenity
                key={index}
                title={amenity}
                icon={<Check className="w-4 h-4 mr-3 shrink-0" />}
                onClick={() => {
                  setAmenities(amenities.filter((_, i) => i !== index));
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-5">
        <div className="flex items-center text-lg font-bold">
          Rooms Information
          <DoorOpen className="h-5 w-5 ml-3" />
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-5">
          <Suite type="junior" {...hotel.rooms.juniorSuite} />
          <Suite type="standard" {...hotel.rooms.standardSuite} />
          <Suite type="double" {...hotel.rooms.doubleSuite} />
          <Suite type="big" {...hotel.rooms.bigSuite} />
        </div>
      </div>
      <SubmitButton>Update Hotel</SubmitButton>
    </form>
  );
}

export function Suite({
  type,
  picture,
  price,
  description,
  maxOccupancy,
  beds,
  roomSize,
  totalRooms,
  reservedRooms,
}: {
  type: string;
  picture: string;
  price: number;
  description: string;
  maxOccupancy: number;
  beds: { amount: number; size: string };
  roomSize: string;
  totalRooms: number;
  reservedRooms: number;
}) {
  return (
    <div className="flex flex-col gap-y-5">
      <input type="hidden" name={`${type}SuiteReservedRooms`} value={reservedRooms} />
      <div className="flex items-center font-bold capitalize">
        {type} Suite{" "}
        {Array(
          type === "junior"
            ? 1
            : type === "standard"
            ? 2
            : type === "double"
            ? 3
            : 4
        )
          .fill(0)
          .map((_, index) => (
            <Star key={index} className="h-4 w-4 ml-2 fill-yellow-500" />
          ))}
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor={`${type}SuitePicture`}>Picture</Label>
        <Input
          id={`${type}SuitePicture`}
          name={`${type}SuitePicture`}
          required
          defaultValue={picture}
        />
      </div>
      <div className="flex gap-x-2 gap-y-5">
        <div className="flex flex-col gap-y-2 w-full">
          <Label htmlFor={`${type}SuitePrice`}>Price</Label>
          <Input
            type="number"
            id={`${type}SuitePrice`}
            name={`${type}SuitePrice`}
            required
            defaultValue={price}
          />
        </div>
        <div className="flex flex-col gap-y-2 w-full">
          <Label htmlFor={`${type}SuiteMaxOccupancy`}>Max Occupancy</Label>
          <Input
            type="number"
            id={`${type}SuiteMaxOccupancy`}
            name={`${type}SuiteMaxOccupancy`}
            required
            defaultValue={maxOccupancy}
          />
        </div>
        <div className="flex flex-col gap-y-2 w-full">
          <Label htmlFor={`${type}SuiteTotalRooms`}>Total Rooms</Label>
          <Input
            type="number"
            id={`${type}SuiteTotalRooms`}
            name={`${type}SuiteTotalRooms`}
            required
            defaultValue={totalRooms}
          />
        </div>
      </div>
      <div className="flex gap-x-2 gap-y-5">
        <div className="flex flex-col gap-y-2 w-full">
          <Label htmlFor={`${type}SuiteRoomSize`}>Room Size</Label>
          <Input
            id={`${type}SuiteRoomSize`}
            name={`${type}SuiteRoomSize`}
            required
            defaultValue={roomSize}
          />
        </div>
        <div className="flex flex-col gap-y-2 w-full">
          <Label htmlFor={`${type}SuiteBedsAmount`}>Bed Amount</Label>
          <Input
            type="number"
            id={`${type}SuiteBedsAmount`}
            name={`${type}SuiteBedsAmount`}
            required
            defaultValue={beds.amount}
          />
        </div>
        <div className="flex flex-col gap-y-2 w-full">
          <Label htmlFor={`${type}SuiteBedsSize`}>Bed Size</Label>
          <Input
            id={`${type}SuiteBedsSize`}
            name={`${type}SuiteBedsSize`}
            required
            defaultValue={beds.size}
          />
        </div>
      </div>
      <div className="flex flex-col gap-y-2">
        <Label htmlFor={`${type}SuiteDescription`}>Room Description</Label>
        <Textarea
          id={`${type}SuiteDescription`}
          name={`${type}SuiteDescription`}
          required
          defaultValue={description}
        />
      </div>
    </div>
  );
}

function Amenity({
  title,
  icon,
  onClick,
}: {
  title: string;
  icon: React.ReactElement;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center text-sm group/amenity">
      {icon}
      <div>{title}</div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="w-7 h-7 ml-3 group/delete"
        onClick={onClick}
      >
        <Trash2 className="w-4 h-4 group-hover/delete:fill-red-500 invisible group-hover/amenity:visible" />
      </Button>
    </div>
  );
}
