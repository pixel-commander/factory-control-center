USEFORMWIDGET
=============

The db plug that makes FormWidget a WIDGET: drop a form somewhere, hand
it this hook's pieces, and it reads and writes the house db without the
caller wiring anything.

    const { tag_options, handleSubmit } = useFormWidget('appointments')
    <FormWidget items={FIELDS} handleSubmit={handleSubmit} />

What it returns:

- tags / tag_options: the tag vocabulary, live from the rab_tags table
  (owner's call 2026-08-16: the existing rab_tags is the source "for
  now" - a new tags/tag table pair was started and deliberately backed
  out the same day). tag_options is the slug list, ready for a select
  field's options.
- rows / status / handleApi: a live read of the named table through
  useApi, with the house status shape. Push updates ride the /api/events
  stream that useApi already subscribes to.
- submit(values, item?): the save. A record with an id -> edit (PUT); no
  record -> add-new (POST). Decided by the record, not a flag - the v2
  useFormData bargain, minus the v2 group ceremony our backend does not
  have. Called with no table named, it returns null and sends nothing.
- handleSubmit(values): the one-argument form, shaped to hand straight
  to FormWidget's handleSubmit prop.

Still open (owner decides): where the TYPE vocabulary comes from. The
seeded appointment rows point their type column at rab_types
(kind='subject') ids, but that wiring is under review - the hook serves
tags only until the owner calls the type source.
