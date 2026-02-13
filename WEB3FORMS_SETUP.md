## Web3Forms setup for the contact form

1. Go to `https://web3forms.com/` and create a free account.
2. In the dashboard, create a new **Access Key** and set the recipient email to `arunodhai007@gmail.com`.
3. Copy the generated **Access Key**.
4. Open `index.html` and replace `YOUR_WEB3FORMS_ACCESS_KEY` in the hidden `access_key` input with your real key.
5. Deploy / reload the site and submit the form once to test. You should receive an email from Web3Forms with the form details.

The form is already wired to send:
- `name`
- `phone`
- `concern`
- `other_concern` (if filled)

Web3Forms handles the email sending and spam protection on their side.

