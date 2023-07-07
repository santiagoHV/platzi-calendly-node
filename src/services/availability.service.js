const { DateTime } = require('luxon');
const boom = require('@hapi/boom');

const Schedule = require('../database/entities/schedule.entity');
const Appointmet = require('../database/entities/appointment.entity');
const { sq } = require('date-fns/locale');

const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

class AvaliabilityService {

    async getAvailability({ date, scheduleId, timezone }) {
        this.date = DateTime.fromISO(date); //out of method
        this.timezone = timezone; //out of method

        const schedule = await Schedule.findById(scheduleId);
        let day = this.getDay(this.date);

        if (!schedule) {
            throw boom.notFound('Schedule not found');
        }

        const dayAvaliability = schedule.availability.find(a => a.day === day);

        if (!dayAvaliability) {
            return []
        }

        const slots = this.getSlots(dayAvaliability, schedule.duration, schedule.margin, schedule.timezone);

        const validatedSlots = await this.validateSlots(slots, schedule);

        return validatedSlots;
    }

    getSlots(dayAvaliability, duration, margin, timezone) {
        const slots = [];
        const intervals = dayAvaliability.intervals;

        intervals.forEach(interval => {
            const startTimeString = interval.startTime.split(':');
            const endTimeString = interval.endTime.split(':');

            const endTime = this.date.setZone(timezone).set({ hour: endTimeString[0], minute: endTimeString[1] })

            let localDate = this.date.setZone(timezone).set({ hour: startTimeString[0], minute: startTimeString[1] })

            while (localDate.plus({ minute: duration }) <= endTime) {
                const startSlot = localDate
                const endSlot = localDate.plus({ minute: duration });

                localDate = endSlot.plus({ minute: margin });

                slots.push({
                    start: startSlot.setZone(this.timezone).toISO(),
                    end: endSlot.setZone(this.timezone).toISO(),
                    status: "on"
                })
            }
        })

        return slots;
    }

    async validateSlots(slots, schedule) {
        const scheduleId = schedule._id;
        const appointments = await Appointmet.find({
            scheduleId,
            startDate: {
                $gte: this.date.startOf('day').toISO(),
                $lte: this.date.endOf('day').toISO()
            }
        });

        const validatedSlots = slots.map(slot => {
            const appointment = appointments.some(a => {
                const startDate = DateTime.fromJSDate(a.startDate).setZone(schedule.timezone);
                const endDate = DateTime.fromJSDate(a.endDate).setZone(schedule.timezone);

                return startDate.toISO() === slot.start && endDate.toISO() === slot.end
            });

            if (appointment) {
                return {
                    ...slot,
                    status: 'off'
                }
            }

            return slot;
        })
        return validatedSlots
    }

    getDay(date) {
        return weekDays[date.get('weekday')];
    }

}

module.exports = AvaliabilityService;