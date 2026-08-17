== Appointments -- the appointments table on the house Calendar. ==

  /api/appointments  ->  useApi  ->  useAppointments  ->  Calendar

The dashboard holds nothing. useAppointments reads the rows, maps them for the
calendar, and hands back a bag; Appointments.tsx is markup.


========================================================================
WHAT IS PICKED RIDES THE URL, AS VARS
========================================================================
  #date=1786539600000&appt=01KZY5YMBGTNY2J00WSH6JCR8S

  date   the held day, a getTime() stamp
  appt   the open appointment, its row id

VARS ON '#', NOT PATH SEGMENTS. They are a selection, not a place -- the page
is still /appointments either way, so they ride the hash and are written with
update-var. The five verbs are in HOOKS/useURL/README.txt.

PICKING AN APPOINTMENT PICKS ITS DAY TOO. One update-var call sets both, so it
is one history entry and one tap of Back. The item already carries its date;
the day is known without a second click.


========================================================================
THE ONE THING THAT IS NOT IN THE URL
========================================================================
  view -- day | week | month

It arrives as a PROP so a page can name the opening span, and useCalendar owns
it as STATE so the toggler can walk it from there. That is the only state on
this screen.


========================================================================
THE MAPPING -- start_date, NOT a new column
========================================================================
The calendar wants a `date`; the table keeps `start_date`. No schema change:
start_date is already epoch milliseconds, so the map is one line.

  dateOf, NOT timeOf. timeOf floors to midnight and the day view lays
  appointments out in hour lanes -- flooring would stack every one of them at
  00:00. The month view would still look fine, which is what makes it easy to
  miss.

  ONE ROW IS AN ISO STRING. 24 of the 25 rows keep start_date as epoch ms;
  '2026-08-13T18:00' is text. dateOf absorbs both -- that is the case it was
  written for -- and all 25 map with none dropped.


========================================================================
NOT WIRED YET
========================================================================
handleAdd, handleEdit and handleDelete exist on the hook and nothing calls
them. This is the read path.


========================================================================
RUNNING IT
========================================================================
  python __shared/api/server.py     the door, 127.0.0.1:3035
  npm run dev                        in __app

The rows sit in July through September 2026, so the calendar opens on an empty
month today -- step forward with the arrows.


========================================================================
RELATED
========================================================================
  HOOKS/useApi/README.txt        the tuple, the five verbs, the push
  HOOKS/useURL/README.txt        the url verbs and the '#' vars
  HOUSE_COMPONENTS/Calendar/     the calendar and its docs
  [PROJECT_ROOT]/__shared/db/README.txt   every table, column by column
