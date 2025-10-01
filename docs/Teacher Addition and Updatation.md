# Teacher Additon and Updation 



## Teacher Additon

- Once the admin adds a teacher, it will fire a supabase edge function with the POST method.
- The edge function will first check if the teacher already exists in the `teachers` table by querying with the provided email.
- If the teacher does not exist, it will proceed to create a new user in Supabase Auth with the provided email and a default password.
- After successfully creating the user, it will insert a new record in the `teachers` table with the user's ID, name, email, and any other relevant details.
- Finally, the edge function will return a success message along with the teacher's details or an error message if any step fails.

## Teacher Updation

- When the admin updates a teacher's details, it will trigger a supabase edge function with the PATCH method.
- The edge function will first verify if the teacher exists in the `teachers` table by querying with the provided email or ID.
- If the teacher exists, it will update the relevant fields in the `teachers` table with the new details provided by the admin.
- If the email is being updated, it will also update the email in Supabase Auth to ensure consistency.
- After successfully updating the records, the edge function will return a success message along with the updated teacher's details or an error message if any step fails.
