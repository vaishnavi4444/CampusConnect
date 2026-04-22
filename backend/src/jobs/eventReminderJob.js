import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const sendEventReminders = async () => {
  const now = new Date();

  const windowStart = new Date(now.getTime() + 55 * 60 * 1000);
  const windowEnd   = new Date(now.getTime() + 65 * 60 * 1000);

  try {
    const upcomingEvents = await prisma.event.findMany({
      where: {
        date: { gte: windowStart, lte: windowEnd },
        status: { in: ["APPROVED", "PUBLISHED"] },
        reminders: { none: {} }, 
      },
      include: {
        registrations: {
          include: { user: true },
        },
      },
    });

    if (upcomingEvents.length === 0) return;
    console.log(upcomingEvents)
    for (const event of upcomingEvents) {
      const registeredUsers = event.registrations.map((r) => r.user);

      if (registeredUsers.length === 0) {
        await prisma.eventReminder.create({ data: { eventId: event.id } });
        continue;
      }

      await prisma.notification.createMany({
        data: registeredUsers.map((user) => ({
          userId:  user.id,
          title:   "Event Starting Soon ⏰",
          message: `"${event.title}" starts in 1 hour at ${event.venue}. Get ready!`,
          type:    "EVENT_REMINDER",
          read:    false,
        })),
      });

      await prisma.eventReminder.create({ data: { eventId: event.id } });

      console.log(
        `[ReminderJob] Sent ${registeredUsers.length} reminder(s) for event "${event.title}"`
      );
    }
  } catch (error) {
    console.error("[ReminderJob] Error:", error.message);
  }
};