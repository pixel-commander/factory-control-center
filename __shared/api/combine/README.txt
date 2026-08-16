== combine -- several tables, ONE formatted return ==

WHAT IT IS
The joins. A page should ask ONE question and get the whole shape back, instead
of firing three fetches and stitching them in the browser. The stitching lives
here, next to the data, where it can be tested.

THE ROUTES
  GET /api/combine                          list what is available
  GET /api/combine/thread?chat_id=1         a chat + its messages + its people
  GET /api/combine/inbox                    every chat + last message + unread
  GET /api/combine/roster                   every user + message_count + chat_count
  GET /api/combine/user_threads?handle=guage  a user's chats, newest activity first

WHAT EACH RETURNS
  thread        { chat, messages[oldest first], users[], message_count }
                users are resolved off the chat's participants CSV of HANDLES
  inbox         [ {...chat, last_message, message_count, unread} ]  newest first
  roster        [ {...user, message_count, chat_count} ]
  user_threads  [ {...chat, last_message, message_count} ]  for one handle

ADD ONE
  write a function in combine_api.py, add it to COMBINERS. It is live at
  /api/combine/<name> immediately. Query args arrive as strings; numeric-looking
  ones are coerced to int for you.

THE RULES
  - READ ONLY. A combine never writes, so it never bumps the push.
  - NO SQL. Reads go through the base_db primitives like everything else.
  - Return a SHAPE, not a dump -- name the parts (chat/messages/users) so the
    caller never has to guess which array is which.
