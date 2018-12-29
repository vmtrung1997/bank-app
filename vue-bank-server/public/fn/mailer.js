module.exports = function mailFormat(recipient,accountId, code){
    return `
    <p>Dear ${recipient}</p>
    <p>A money transfer request has been made from your account: ${accountId}</p>
    <p>As an added level of security, you are required to complete the transfer process by entering the below 6 digit OTP</p>
    <br/>
    <p><strong>${code}</strong></p>
    <br/>
    <p>Please note: The digit OTP will expire three hours after this email was sent</p>
    <p>Thanks</p>`
}