module.exports = function mailFormat(recipient,accountId, code){
    return `
    <p>Dear ${recipient}</p>
    <p>A money transfer request has been made from your account: ${accountId}</p>
    <p>You are required to complete the transfer process by entering the below 6 digit OTP</p>
    <p><strong>${code}</strong></p>
    <p>Please note: The digit OTP will expire an hour after this email was sent</p>
    <p>Thanks</p>`
}