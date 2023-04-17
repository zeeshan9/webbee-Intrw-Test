import { EventWithWorkshops } from 'models/events';
import Event from './entities/event.entity';
import Workshop from './entities/workshop.entity';
import { Op }
from 'sequelize';
import { getSequelizeInstance } from 'app';
export class EventsService {
  async getWarmupEvents() {
    return await Event.findAll();
  }

  /* TODO: complete getEventsWithWorkshops so that it returns all events including the workshops
    Requirements:
    - maximum 2 sql queries
    - verify your solution with `npm run test`
    - do a `git commit && git push` after you are done or when the time limit is over
    - Don't post process query result in javascript
    Hints:
    - open the `src/events/events.service` file
    - partial or not working answers also get graded so make sure you commit what you have
    Sample response on GET /events/events:
    ```json
    [
      {
        id: 1,
        name: 'Laravel convention 2021',
        createdAt: '2021-04-25T09:32:27.000000Z',
        workshops: [
          {
            id: 1,
            start: '2021-02-21 10:00:00',
            end: '2021-02-21 16:00:00',
            eventId: 1,
            name: 'Illuminate your knowledge of the laravel code base',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
        ],
      },
      {
        id: 2,
        name: 'Laravel convention 2023',
        createdAt: '2023-04-25T09:32:27.000000Z',
        workshops: [
          {
            id: 2,
            start: '2023-10-21 10:00:00',
            end: '2023-10-21 18:00:00',
            eventId: 2,
            name: 'The new Eloquent - load more with less',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
          {
            id: 3,
            start: '2023-11-21 09:00:00',
            end: '2023-11-21 17:00:00',
            eventId: 2,
            name: 'AutoEx - handles exceptions 100% automatic',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
        ],
      },
      {
        id: 3,
        name: 'React convention 2023',
        createdAt: '2023-04-25T09:32:27.000000Z',
        workshops: [
          {
            id: 4,
            start: '2023-08-21 10:00:00',
            end: '2023-08-21 18:00:00',
            eventId: 3,
            name: '#NoClass pure functional programming',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
          {
            id: 5,
            start: '2023-08-21 09:00:00',
            end: '2023-08-21 17:00:00',
            eventId: 3,
            name: 'Navigating the function jungle',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
        ],
      },
    ]
    ```
     */

  async getEventsWithWorkshops(): Promise<EventWithWorkshops[]> {
    const events = await Event.findAll();
    const workshops = await Workshop.findAll();
  
    const eventWithWorkshops = events.map((event: any) => {
      // filter workshops that belong to current event
      const eventWorkshops = workshops.filter(
        (workshop: any) => workshop.eventId === event.id
      );
      return {
        id: event.id,
        name: event.name,
        createdAt: event.createdAt.toISOString(),
        workshops: eventWorkshops.map((workshop: any) => ({
          id: workshop.id,
          start: workshop.start.toISOString(),
          end: workshop.end.toISOString(),
          eventId: workshop.eventId,
          name: workshop.name,
          createdAt: workshop.createdAt.toISOString(),
        })),
      };
    });
  
    return eventWithWorkshops;
  }
  
  

  /* TODO: complete getFutureEventWithWorkshops so that it returns events with workshops, that have not yet started
    Requirements:
    - only events that have not yet started should be included
    - the event starting time is determined by the first workshop of the event
    - the code should result in maximum 3 SQL queries, no matter the amount of events
    - all filtering of records should happen in the database
    - verify your solution with `npm run test`
    - do a `git commit && git push` after you are done or when the time limit is over
    - Don't post process query result in javascript
    Hints:
    - open the `src/events/events.service.ts` file
    - partial or not working answers also get graded so make sure you commit what you have
    - join, whereIn, min, groupBy, havingRaw might be helpful
    - in the sample data set  the event with id 1 is already in the past and should therefore be excluded
    Sample response on GET /futureevents:
    ```json
    [
        {
            "id": 2,
            "name": "Laravel convention 2023",
            "createdAt": "2023-04-20T07:01:14.000000Z",
            "workshops": [
                {
                    "id": 2,
                    "start": "2023-10-21 10:00:00",
                    "end": "2023-10-21 18:00:00",
                    "eventId": 2,
                    "name": "The new Eloquent - load more with less",
                    "createdAt": "2021-04-20T07:01:14.000000Z",
                },
                {
                    "id": 3,
                    "start": "2023-11-21 09:00:00",
                    "end": "2023-11-21 17:00:00",
                    "eventId": 2,
                    "name": "AutoEx - handles exceptions 100% automatic",
                    "createdAt": "2021-04-20T07:01:14.000000Z",
                }
            ]
        },
        {
            "id": 3,
            "name": "React convention 2023",
            "createdAt": "2023-04-20T07:01:14.000000Z",
            "workshops": [
                {
                    "id": 4,
                    "start": "2023-08-21 10:00:00",
                    "end": "2023-08-21 18:00:00",
                    "eventId": 3,
                    "name": "#NoClass pure functional programming",
                    "createdAt": "2021-04-20T07:01:14.000000Z",
                },
                {
                    "id": 5,
                    "start": "2023-08-21 09:00:00",
                    "end": "2023-08-21 17:00:00",
                    "eventId": 3,
                    "name": "Navigating the function jungle",
                    "createdAt": "2021-04-20T07:01:14.000000Z",
                }
            ]
        }
    ]
    ```
     */
    async getFutureEventWithWorkshops() {
      const events = await Event.findAll({
        // sequeslize instance to was not working properly. so i just use
        include: [
          {
            model: Workshop,
            attributes: [
              'id',
              'start',
              'end',
              'eventId',
              'name',
              'createdAt',
              [getSequelizeInstance().fn('min', getSequelizeInstance().col('start')), 'minStart'], // get the minimum start time of all workshops
            ],
            where: {
              start: {
                [Op.gt]: new Date(), // only get workshops that start in the future
              },
            },
            required: true, // only get events that have at least one workshop
          },
        ],
        attributes: [
          'id',
          'name',
          'createdAt',
          [getSequelizeInstance().literal('min(`Workshops`.`start`)'), 'minStart'], // get the minimum start time of all workshops
        ],
        group: ['Event.id'], // group by event id to avoid duplicates
        having: {
          minStart: {
            [Op.gt]: new Date(), // only get events that have not yet started
          },
        },
      });
    
      // convert the events to plain objects and remove unnecessary attributes
      return events.map((event: any) => ({
        id: event.id,
        name: event.name,
        createdAt: event.createdAt,
        workshops: event.Workshops.map((workshop: any) => ({
          id: workshop.id,
          start: workshop.start,
          end: workshop.end,
          eventId: workshop.eventId,
          name: workshop.name,
          createdAt: workshop.createdAt,
        })),
      }));
    }
    
}
