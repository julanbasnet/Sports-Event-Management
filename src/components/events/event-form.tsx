"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

import { createEvent, updateEvent } from "@/lib/actions/events";
import { SPORT_TYPES } from "@/lib/types";
import type { Event } from "@/lib/types";
import {
  createEventSchema,
  type CreateEventInput,
} from "@/lib/validations/event";

type EventFormProps = {
  mode: "create" | "edit";
  defaultValues?: Event;
};

function getSubmitLabel(mode: "create" | "edit", isPending: boolean): string {
  if (mode === "edit") {
    return isPending ? "Updating..." : "Update Event";
  }
  return isPending ? "Creating..." : "Create Event";
}

export function EventForm({
  mode,
  defaultValues,
}: EventFormProps): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      sport_type: (defaultValues?.sport_type as CreateEventInput["sport_type"]) ?? undefined,
      date_time: defaultValues?.date_time
        ? new Date(defaultValues.date_time).toISOString().slice(0, 16)
        : "",
      description: defaultValues?.description ?? "",
      venues: defaultValues?.venues?.map((v) => ({
        name: v.name,
        address: v.address ?? "",
        city: v.city ?? "",
        state: v.state ?? "",
        zip_code: v.zip_code ?? "",
      })) ?? [{ name: "", address: "", city: "", state: "", zip_code: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "venues",
  });

  function onSubmit(data: CreateEventInput) {
    startTransition(async () => {
      if (mode === "edit" && defaultValues) {
        const result = await updateEvent({ ...data, id: defaultValues.id });
        if (result.success) {
          toast.success("Event updated successfully");
          router.push("/dashboard");
        } else {
          toast.error(`Failed to update event: ${result.error}`);
        }
      } else {
        const result = await createEvent(data);
        if (result.success) {
          toast.success("Event created successfully");
          router.push("/dashboard");
        } else {
          toast.error(`Failed to create event: ${result.error}`);
        }
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Event Name
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter event name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sport_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Sport Type
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SPORT_TYPES.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Date & Time
              </FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional event description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Venues</h3>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-4 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Venue {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Remove
                </Button>
              </div>

              <FormField
                control={form.control}
                name={`venues.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter venue name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`venues.${index}.address`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`venues.${index}.city`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`venues.${index}.state`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`venues.${index}.zip_code`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Zip code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[44px] border-dashed"
            onClick={() =>
              append({ name: "", address: "", city: "", state: "", zip_code: "" })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Venue
          </Button>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getSubmitLabel(mode, isPending)}
        </Button>
      </form>
    </Form>
  );
}
