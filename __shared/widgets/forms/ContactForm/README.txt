CONTACTFORM
===========

The contact shape as a form - the v2 stamp rebuilt on the house
FormWidget. Fields live at the top of the tsx as FORM_FIELDS, data on the StatelessForm
keys; the .tsx is only the table word, the head words, and the save.

- Table word: 'contacts' - PLURAL, v2's own. The lane's forms are not
  one convention: assignment/classroom/course are singular, contacts
  and users are plural. Kept exactly as v2 spoke them.
- handleSave is NOT handleSubmit, and the difference is a hard-won v2
  fix (2026-08-12): handleSubmit REPLACES the save - the caller does
  the writing; handleSave is TOLD after the write lands - the form
  still writes. v2's AddNewListener passed handleSave for exactly this
  reason; its house port was trimmed by the owner, and the word stays
  because it is the form's own contract. Both ride useFormWidget here.
- NAME and first/last are separate facts on purpose: NAME is what a
  list line shows, the parts are what a letter, a sort and a merge
  need.
- The address is separate fields, not one box; nothing in it is
  required - plenty of contacts are a phone number and a name.
- region and country ride the kit's items select (stores the postal or
  country code, shows the word). US_STATES and COUNTRIES live inline in
  the tsx for now - the shared home for the option/data lists is
  still the owner's open call; CA_PROVINCES was not ported because no
  house form asks for it yet.
- tags rides check_list with source 'tags'; tag_group is not ported
  (returns with the owner's select group).
- Not ported on purpose: useHeld wiring, placeholders.
- The demo passes handleSubmit so demo submits DO NOT write the db.
- v2 tag words for reference: client, vendor, person, priority,
  do-not-call. The live vocabulary comes from rab_tags now.
