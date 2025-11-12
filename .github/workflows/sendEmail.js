const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function getYesterdayDate() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

async function fetchValidEmails() {
  const yesterday = getYesterdayDate();
  const { data, error } = await supabase
    .from("emails")
    .select("*")
    .eq("valid", true)
    .gte("date", `${yesterday}T00:00:00`)
    .lte("date", `${yesterday}T23:59:59`);

  if (error) throw error;
  return data || [];
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
});

function jobInterestEmail(toEmail) {
  return {
    from: GMAIL_USER,
    to: toEmail,
    subject: "Java Backend Developer – Spring Boot | Job Application Interest",
    html: `
      <div style="font-family:Arial, sans-serif; line-height:1.6; color:#222;">
        <p>Dear Hiring Manager,</p>

        <p>
          I’m reaching out to express my interest in any
          <strong>Java Backend Developer / Spring Boot Developer</strong> opportunities at your organization.
        </p>

        <p>
          I’m currently working as a <strong>Java Developer at Ango Digital Technologies</strong> (Rapid Response Team),
          where I build and maintain enterprise-level applications using
          <strong>Java, Spring Boot, Spring Security, REST APIs, and MySQL</strong>.
          I’m passionate about backend architecture, performance optimization, and delivering high-quality business solutions.
        </p>

        <p><strong>Professional Highlights:</strong><br/>
          • 1+ year of experience in Java & Spring Boot development<br/>
          • Strong in REST API design, WebSocket integration & microservices<br/>
          • Hands-on experience with AWS (EC2, S3) and CI/CD tools<br/>
          • Java | Spring Boot | Hibernate | MySQL | AWS | WebSocket | JUnit | Git
        </p>

        <p><strong>Key Projects:</strong><br/>
          • <em>Farmers Application</em> – Built a full-stack Spring Boot app to help farmers sell their produce online.<br/>
          • <em>Sentiment Analysis on Social Media Data</em> – Developed an ML model with 85% accuracy using TensorFlow and Scikit-learn.
        </p>

        <p><strong>Education:</strong><br/>
          B.Tech in Computer Science and Business Systems – VBIT, Hyderabad (2020–2024)
        </p>

        <p>
          My work:<br/>
          🔗 <a href="https://github.com/prashanthagurla" style="color:#1a0dab;">GitHub – prashanthagurla</a><br/>
          🔗 <a href="https://linkedin.com/in/prashanthagurla" style="color:#1a0dab;">LinkedIn – Prashanth Agurla</a><br/>
          📄 <a href="https://drive.google.com/file/d/1bLbEyw3GtOzCYkt_Fup3qIeIqwIAVuF8/view?usp=drive_link" style="color:#1a0dab;">View My Resume</a>
        </p>

        <p>
          I’d love the opportunity to contribute to your team and discuss how my skills align with your organization’s needs.<br/>
          Looking forward to connecting!
        </p>

        <p>
          Regards,<br/>
          <strong>Prashanth Agurla</strong><br/>
          Java Developer – Ango Digital Technologies<br/>
          📞 +91 6302067646 | 📧 ${GMAIL_USER}
        </p>
      </div>
    `,
  };
}

async function sendEmails() {
  try {
    const emails = await fetchValidEmails();
    if (emails.length === 0) {
      console.log("✅ No valid emails for yesterday.");
      return;
    }

    console.log(`📧 Sending ${emails.length} emails...`);

    for (const item of emails) {
      const mail = jobInterestEmail(item.email);
      try {
        await transporter.sendMail(mail);
        console.log(`✅ Sent to: ${item.email}`);
      } catch (err) {
        console.error(`❌ Error sending to ${item.email}: ${err.message}`);
      }
    }

    console.log("🎯 All done!");
  } catch (err) {
    console.error("Pipeline failed:", err.message);
    process.exit(1);
  }
}

(async () => {
  await sendEmails();
})();
