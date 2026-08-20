const sendEmail = async (email)=>{
    await new Promise((resolve)=>{
        setTimeout(()=>{resolve()},5000) //just to simulate the delay of sending email, it will take 5 seconds to send email
    })
    console.log(`Email sent successfully to ${email}`);
}

export default sendEmail;