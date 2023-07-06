const Schedule = require('../database/entities/schedule.entity');
const ScheduleService = require('./schedule.service');

const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

class AvaliabilityService {

    async getAvailability({ date, scheduleId, timezone }) {
        const schedule = await Schedule.findById(scheduleId);
        this.date = new Date(date); //out of method
        const day = this.getDay(this.date);

        if (!schedule) {
            throw new Error('Schedule not found');
        }

        const dayAvaliability = schedule.availability.find(a => a.day === day);

        if (!dayAvaliability) {
            return []
        }

        const slots = this.getSlots(dayAvaliability, schedule.duration, schedule.margin);

        return slots;
    }

    getSlots(dayAvaliability, duration, margin) {
        const slots = [];
        const intervals = dayAvaliability.intervals;

        intervals.forEach(interval => {
            const startTime = interval.startTime.split(':');
            const endTime = interval.endTime.split(':');

            this.date.setHours(startTime[0]);
            this.date.setMinutes(startTime[1]);

            while (this.date.getHours() < endTime[0]) {
                const startSlot = new Date(this.date)
                this.date.setMinutes(this.date.getMinutes() + duration);
                const endSlot = new Date(this.date);
                this.date.setMinutes(this.date.getMinutes() + margin);

                console.log(this.date);

                slots.push({
                    startDate: startSlot,
                    endDate: endSlot,
                    status: "on"
                })
            }
        })

        return slots;
    }

    getDay(date) {
        return weekDays[date.getDay()];
    }
}

module.exports = AvaliabilityService;